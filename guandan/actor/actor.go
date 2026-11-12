/* ===========================================================
 * 房间 Actor（cherry actor）
 *
 * 为什么用一个 actor 承载全部房间：
 *   - 4 人房每一步操作都是微秒级（解析牌型 + 广播），单 actor 串行即可支撑上千房间
 *   - 全部状态修改都跑在同一个 goroutine 上，天然无锁、无竞态
 *   - 定时器（回合超时 / 机器人思考 / 结算 / 掉线回收）统一以消息形式回到本 actor，
 *     等价于 JS 版 setTimeout，但不会出现回调乱序
 * 需要横向扩展时，按 roomID 取模拆成多个 actor 即可（Room 本身无状态耦合）
 * =========================================================== */
package actor

import (
	"encoding/binary"
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	cfacade "github.com/cherry-game/cherry/facade"
	clog "github.com/cherry-game/cherry/logger"
	cactor "github.com/cherry-game/cherry/net/actor"
	simple "github.com/cherry-game/cherry/net/parser/simple"
	cproto "github.com/cherry-game/cherry/net/proto"

	"github.com/zbcx/whmj/guandan/protocol"
	"github.com/zbcx/whmj/guandan/room"
	"github.com/zbcx/whmj/guandan/store"
)

const (
	ActorID    = "room"
	MaxRooms   = 1000
	timerFunc  = "timer"
	offlineFn  = "offline"
	internalID = "internal"
)

var roomIDRe = regexp.MustCompile(`^\d{4,6}$`)

// Metrics 运行指标（HTTP /health 用）
type Metrics struct {
	Rooms  atomic.Int64
	Humans atomic.Int64
	Rounds atomic.Int64
}

var M = &Metrics{}

// Snapshot 房间快照（只读副本，供 HTTP 接口使用）
var Snapshot atomic.Value

type seatRef struct {
	RoomID string
	Seat   int
}

// RoomActor 房间服务
type RoomActor struct {
	cactor.Base

	cfg   room.Config
	rooms map[string]*room.Room
	seats map[string]seatRef // sid → 房间/座位

	targetPath string
}

// New 创建 actor（可在 New 里注入测试用的加速参数）
func New(cfg room.Config) *RoomActor {
	return &RoomActor{
		cfg:   cfg,
		rooms: make(map[string]*room.Room),
		seats: make(map[string]seatRef),
	}
}

func (p *RoomActor) AliasID() string { return ActorID }

func (p *RoomActor) OnInit() {
	p.targetPath = p.NewNodePath(ActorID)

	p.Local().Register("join", p.onJoin)
	p.Local().Register("start", p.onStart)
	p.Local().Register("addBot", p.onAddBot)
	p.Local().Register("removeBot", p.onRemoveBot)
	p.Local().Register("play", p.onPlay)
	p.Local().Register("pass", p.onPass)
	p.Local().Register("leave", p.onLeave)
	p.Local().Register("ready", p.onReady)
	p.Local().Register("ping", p.onPing)

	// 内部事件
	p.Local().Register(timerFunc, p.onTimer)
	p.Local().Register(offlineFn, p.onOffline)

	// 心跳回收：清理空房间
	p.Timer().Add(time.Minute, p.gc)
	clog.Infof("[room] actor ready. config = turn:%s bot:%s settle:%s offline:%s",
		p.cfg.TurnMS, p.cfg.BotDelay, p.cfg.SettleMS, p.cfg.OfflineMS)
}

func (p *RoomActor) OnStop() {
	for id, r := range p.rooms {
		r.Destroy()
		delete(p.rooms, id)
	}
}

/* ---------------- 连接生命周期 ---------------- */

// PostOffline 由 agent 关闭回调投递断线事件
func (p *RoomActor) PostOffline(sid string) {
	p.post(offlineFn, map[string]string{"sid": sid})
}

func (p *RoomActor) post(funcName string, payload any) {
	data, err := p.App().Serializer().Marshal(payload)
	if err != nil {
		return
	}
	m := cfacade.GetMessage()
	m.Source = p.targetPath
	m.Target = p.targetPath
	m.FuncName = funcName
	m.Session = &cproto.Session{Sid: internalID}
	m.Args = data
	p.PostLocal(m)
}

func (p *RoomActor) onOffline(_ *cproto.Session, evt *struct {
	SID string `json:"sid"`
}) {
	ref, ok := p.seats[evt.SID]
	if !ok {
		return
	}
	delete(p.seats, evt.SID)

	r := p.rooms[ref.RoomID]
	if r == nil {
		return
	}
	// 只有当座位仍属于这条连接时才置离线（重连后旧连接关闭不能把人踢掉）
	if seat := r.SeatOfSID(evt.SID); seat >= 0 {
		r.Offline(seat)
	}
	p.refreshMetrics()
}

func (p *RoomActor) onTimer(_ *cproto.Session, evt *room.TimerEvent) {
	r := p.rooms[evt.RoomID]
	if r == nil {
		return
	}
	r.FireTimer(*evt)
	p.refreshMetrics()
}

func (p *RoomActor) gc() {
	now := time.Now()
	for id, r := range p.rooms {
		idle := r.HumanCount() == 0 && now.Sub(r.LastActive) > 30*time.Minute
		if idle || r.Status == room.StatusClosed {
			for sid, ref := range p.seats {
				if ref.RoomID == id {
					delete(p.seats, sid)
				}
			}
			delete(p.rooms, id)
			clog.Infof("[room] 回收空闲房间 %s", id)
		}
	}
	p.refreshMetrics()
}

func (p *RoomActor) refreshMetrics() {
	n := int64(0)
	for _, r := range p.rooms {
		n += int64(r.HumanCount())
	}
	M.Rooms.Store(int64(len(p.rooms)))
	M.Humans.Store(n)

	list := make([]map[string]any, 0, len(p.rooms))
	for _, r := range p.rooms {
		seats := make([]string, 4)
		bots := make([]bool, 4)
		for i, pl := range r.Players {
			if pl != nil {
				seats[i] = pl.Name
				bots[i] = pl.Bot
			}
		}
		list = append(list, map[string]any{
			"id": r.ID, "status": r.Status, "round": r.RoundNo,
			"humans": r.HumanCount(), "seats": seats, "bots": bots,
		})
	}
	Snapshot.Store(list)
}

/* ---------------- 指令处理 ---------------- */

func (p *RoomActor) onJoin(session *cproto.Session, req *protocol.JoinReq) {
	sid := session.Sid
	if _, ok := p.seats[sid]; ok {
		p.fail(sid, "已在房间中")
		return
	}

	name := truncate(strings.TrimSpace(req.Name), 12)
	id := strings.TrimSpace(req.Room)
	if !roomIDRe.MatchString(id) {
		if !req.Create {
			p.fail(sid, "房间号需 4-6 位数字")
			return
		}
		id = room.NewRoomID()
	}

	r := p.rooms[id]
	if req.Create && r != nil {
		// 房号已被占用：另开一个新房间，避免误入别人的牌局
		for {
			nid := room.NewRoomID()
			if p.rooms[nid] == nil {
				id, r = nid, nil
				break
			}
		}
	}
	if r == nil {
		// 输错房号不"顺手建房"，避免进到空房间还以为进了朋友的房
		if !req.Create {
			p.fail(sid, "房间 "+id+" 不存在")
			return
		}
		if len(p.rooms) >= MaxRooms {
			p.fail(sid, "服务器房间已满")
			return
		}
		r = room.New(id, p.cfg, p.hooks(id))
		p.rooms[id] = r
	}

	reconnect := r.HasPlayer(req.UID, name)
	if r.Status == room.StatusPlaying && !reconnect {
		p.fail(sid, "牌局已开始，请等本局结束再进")
		return
	}

	seat := r.Join(sid, req.UID, name)
	if seat < 0 {
		p.fail(sid, "房间已满（4 人）")
		return
	}
	p.seats[sid] = seatRef{RoomID: id, Seat: seat}
	r.LastActive = time.Now()

	pl := r.Players[seat]
	if pl != nil {
		r.SendTo(seat, protocol.MidJoined, &protocol.JoinedResp{
			T: "joined", Room: id, Seat: seat, Name: pl.Name, Host: pl.Host,
		})
	}
	r.SyncAll()
	p.refreshMetrics()

	// 4 个真人坐满 → 800ms 后自动开局
	if r.HumanCount() == 4 && r.Status == room.StatusWaiting {
		r.ScheduleAutoStart(800 * time.Millisecond)
	}
}

func (p *RoomActor) onStart(session *cproto.Session, _ *protocol.EmptyReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	if !r.IsHost(seat) {
		p.fail(session.Sid, "只有房主可以开始游戏")
		return
	}
	if msg := r.Start(); msg != "" {
		p.fail(session.Sid, msg)
	}
	p.refreshMetrics()
}

func (p *RoomActor) onAddBot(session *cproto.Session, _ *protocol.EmptyReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	if !r.IsHost(seat) {
		p.fail(session.Sid, "只有房主可以添加电脑")
		return
	}
	if _, msg := r.AddBot(); msg != "" {
		p.fail(session.Sid, msg)
	}
}

func (p *RoomActor) onRemoveBot(session *cproto.Session, req *protocol.RemoveBotReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	if !r.IsHost(seat) {
		p.fail(session.Sid, "只有房主可以移除电脑")
		return
	}
	if msg := r.RemoveBot(req.Seat); msg != "" {
		p.fail(session.Sid, msg)
	}
}

func (p *RoomActor) onPlay(session *cproto.Session, req *protocol.PlayReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	cards := make([]int, 0, len(req.Cards))
	for _, c := range req.Cards {
		if c >= 1 && c <= 54 {
			cards = append(cards, c)
		}
	}
	if msg := r.Play(seat, cards); msg != "" {
		p.fail(session.Sid, msg)
	}
}

func (p *RoomActor) onPass(session *cproto.Session, _ *protocol.EmptyReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	if msg := r.Play(seat, nil); msg != "" {
		p.fail(session.Sid, msg)
	}
}

func (p *RoomActor) onLeave(session *cproto.Session, _ *protocol.EmptyReq) {
	ref, ok := p.seats[session.Sid]
	if !ok {
		return
	}
	delete(p.seats, session.Sid)
	if r := p.rooms[ref.RoomID]; r != nil {
		r.Leave(ref.Seat)
	}
	p.push(session.Sid, protocol.MidLeft, &protocol.LeftResp{T: "left"})
	p.refreshMetrics()
}

func (p *RoomActor) onReady(session *cproto.Session, req *protocol.ReadyReq) {
	r, seat, ok := p.locate(session.Sid)
	if !ok {
		return
	}
	if pl := r.Players[seat]; pl != nil {
		pl.Ready = req.Ready
		r.SyncAll()
	}
}

func (p *RoomActor) onPing(session *cproto.Session, _ *protocol.EmptyReq) {
	p.push(session.Sid, protocol.MidPong, &protocol.PongResp{T: "pong", TS: time.Now().UnixMilli()})
}

/* ---------------- 辅助 ---------------- */

func (p *RoomActor) locate(sid string) (*room.Room, int, bool) {
	ref, ok := p.seats[sid]
	if !ok {
		p.fail(sid, "请先加入房间")
		return nil, -1, false
	}
	r := p.rooms[ref.RoomID]
	if r == nil {
		delete(p.seats, sid)
		p.fail(sid, "房间已解散")
		return nil, -1, false
	}
	return r, ref.Seat, true
}

func (p *RoomActor) fail(sid, msg string) {
	p.push(sid, protocol.MidError, &protocol.ErrorResp{T: "error", Msg: msg})
}

func (p *RoomActor) hooks(roomID string) room.Hooks {
	return room.Hooks{
		Send: func(seat int, mid uint32, payload any) {
			r := p.rooms[roomID]
			if r == nil || seat < 0 || seat > 3 {
				return
			}
			if pl := r.Players[seat]; pl != nil {
				p.push(pl.SID, mid, payload)
			}
		},
		Post: func(evt room.TimerEvent) {
			p.post(timerFunc, evt)
		},
		OnSettle: func(s *room.Summary) {
			M.Rounds.Add(1)
			p.saveRound(s)
		},
		OnClosed: func(id string) {
			for sid, ref := range p.seats {
				if ref.RoomID == id {
					delete(p.seats, sid)
				}
			}
			delete(p.rooms, id)
			clog.Infof("[room] 房间 %s 已销毁", id)
		},
	}
}

func (p *RoomActor) saveRound(s *room.Summary) {
	sto := p.store()
	if sto == nil {
		return
	}
	uids := make([]string, 4)
	r := p.rooms[s.RoomID]
	if r != nil {
		for i, pl := range r.Players {
			if pl != nil {
				uids[i] = pl.UID
			}
		}
	}
	sto.SaveRound(store.RoundRecord{
		RoomID: s.RoomID, RoundNo: s.Round, WinnerTeam: s.WinnerTeam, UpLevel: s.UpLevel,
		DoubleDown: s.DoubleDown, Resisted: s.Resisted,
		Levels: s.Levels, Ranks: s.Ranks, Players: s.Players, UIDs: uids,
		Humans: s.Humans, StartedAt: s.StartedAt, EndedAt: s.EndedAt,
	})
}

func (p *RoomActor) store() *store.Component {
	if c, ok := p.App().Find(store.Name).(*store.Component); ok {
		return c
	}
	return nil
}

// push 按 sid 找到 agent 并发送（simple 协议帧）
func (p *RoomActor) push(sid string, mid uint32, payload any) {
	if sid == "" {
		return
	}
	agent, ok := simple.GetAgentWithSID(cfacade.SID(sid))
	if !ok || agent.IsClosed() {
		return
	}
	data, err := p.App().Serializer().Marshal(payload)
	if err != nil {
		clog.Warnf("[room] marshal fail: %v", err)
		return
	}
	agent.SendRaw(Pack(mid, data))
}

// Pack 打包 simple 协议帧：mid(4B BE) + len(4B BE) + body
func Pack(mid uint32, data []byte) []byte {
	buf := make([]byte, 8+len(data))
	binary.BigEndian.PutUint32(buf[0:4], mid)
	binary.BigEndian.PutUint32(buf[4:8], uint32(len(data)))
	copy(buf[8:], data)
	return buf
}

// Rooms 供 HTTP 接口查询（只在 actor 内调用）
func (p *RoomActor) Snapshot() []map[string]any {
	out := make([]map[string]any, 0, len(p.rooms))
	for _, r := range p.rooms {
		seats := make([]string, 4)
		bots := make([]bool, 4)
		for i, pl := range r.Players {
			if pl != nil {
				seats[i] = pl.Name
				bots[i] = pl.Bot
			}
		}
		out = append(out, map[string]any{
			"id": r.ID, "status": r.Status, "round": r.RoundNo,
			"humans": r.HumanCount(), "seats": seats, "bots": bots,
		})
	}
	return out
}

/* ---------------- 小工具 ---------------- */

func truncate(s string, n int) string {
	rs := []rune(s)
	if len(rs) <= n {
		return s
	}
	return string(rs[:n])
}

// DumpJSON 调试用
func DumpJSON(v any) string {
	b, _ := json.Marshal(v)
	return string(b)
}

var _ = strconv.Itoa

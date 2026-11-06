package server

import (
	"fmt"
	"math/rand"
	"time"

	cfacade "github.com/cherry-game/cherry/facade"
	cactor "github.com/cherry-game/cherry/net/actor"
	"github.com/cherry-game/cherry/net/parser/pomelo"
	cproto "github.com/cherry-game/cherry/net/proto"

	"github.com/zbcx/whmj/internal/game"
	"github.com/zbcx/whmj/internal/store"
)

// Seat 房间里的座位，与 game.Player 一一对应。
type Seat struct {
	UID    int64  `json:"uid"`
	Nick   string `json:"nick"`
	Avatar string `json:"avatar"`
	Ready  bool   `json:"ready"`
	Online bool   `json:"online"`
	Bot    bool   `json:"bot"`
	Total  int    `json:"total"`
}

// Room 一个牌桌 actor：持有一桌玩家与当前牌局。
//
// actor 路径为 {nodeID}.room_{roomID}，同一房间的消息串行处理，
// 因此房间内的字段无需加锁。
type Room struct {
	cactor.Base

	id       string
	cfg      game.Config
	maxRound int
	seats    []*Seat
	game     *game.Game
	round    int
	store    *store.Store
	owner    string
	ownerReq *JoinReq

	tickPending bool
	closed      bool
	phaseAt     time.Time
	rng         *rand.Rand
}

// NewRoom 创建房间 actor 实例（尚未注册到引擎）。
func NewRoom(id string, cfg game.Config, maxRound int, st *store.Store, owner *JoinReq) *Room {
	return &Room{
		id:       id,
		cfg:      cfg,
		maxRound: maxRound,
		seats:    make([]*Seat, 4),
		store:    st,
		ownerReq: owner,
		rng:      rand.New(rand.NewSource(time.Now().UnixNano() + int64(len(id)))),
	}
}

// AliasID 返回 actorID，路径第二段。
func (r *Room) AliasID() string {
	return "room_" + r.id
}

// RoomID 房间号。
func (r *Room) RoomID() string {
	return r.id
}

// OnInit 注册消息处理函数。
func (r *Room) OnInit() {
	r.Local().Register("ready", r.onReady)
	r.Local().Register("discard", r.onDiscard)
	r.Local().Register("action", r.onAction)
	r.Local().Register("sync", r.onSync)
	r.Local().Register("leave", r.onLeave)

	r.Remote().Register("join", r.onJoin)

	if r.ownerReq != nil {
		r.seatPlayer(r.ownerReq)
	}
	r.Remote().Register("offline", r.onOffline)
	r.Remote().Register("tick", r.onTick)
	r.Remote().Register("next", r.onNextRound)
}

// OnLocalReceived 让房间统一处理本房间的消息，不再向下分发到子 actor。
func (*Room) OnLocalReceived(_ *cfacade.Message) (bool, bool) {
	return false, true
}

// OnStop 房间销毁时清理。
func (r *Room) OnStop() {
	r.closed = true
}

// --- 玩家进出 ---

func (r *Room) onJoin(req *JoinReq) {
	if r.closed {
		return
	}

	idx := r.seatPlayer(req)
	if idx < 0 {
		return
	}

	r.pushRoomState()
	r.syncTo(idx)

	if r.game != nil && !r.game.Over() {
		r.pushSnapshot(idx)
		r.schedule()
	}
}

// seatPlayer 把玩家安排到座位上，返回座位号；已在座则返回原座位。
func (r *Room) seatPlayer(req *JoinReq) int {
	if req == nil {
		return -1
	}

	idx := -1

	for i, s := range r.seats {
		if s != nil && s.UID == req.UID {
			idx = i

			s.Online = true
			s.Bot = false

			if req.Nick != "" {
				s.Nick = req.Nick
			}

			break
		}
	}

	if idx < 0 {
		for i, s := range r.seats {
			if s == nil || s.Bot {
				idx = i

				break
			}
		}
	}

	if idx < 0 {
		return -1
	}

	if r.seats[idx] == nil || r.seats[idx].UID == 0 || r.seats[idx].UID == req.UID {
		nick := req.Nick
		if nick == "" {
			nick = "玩家"
		}

		total := 0
		if r.seats[idx] != nil {
			total = r.seats[idx].Total
		}

		r.seats[idx] = &Seat{
			UID:    req.UID,
			Nick:   nick,
			Avatar: req.Avatar,
			Online: true,
			Bot:    req.Bot,
			Total:  total,
		}
	}

	if r.owner == "" {
		r.owner = fmt.Sprintf("%d", req.UID)
	}

	return idx
}

func (r *Room) onOffline(req *UIDReq) {
	for i, s := range r.seats {
		if s == nil || s.UID != req.UID {
			continue
		}

		s.Online = false

		// 对局中掉线转为托管，避免整桌卡死；未开局则腾出座位。
		if r.game != nil && !r.game.Over() {
			s.Bot = true
		} else {
			r.seats[i] = nil
		}
	}

	r.pushRoomState()
	r.schedule()
}

func (r *Room) onLeave(session *cproto.Session, _ *Empty) {
	r.markOffline(session.Uid)
	r.ack(session)
}

func (r *Room) markOffline(uid cfacade.UID) {
	for i, s := range r.seats {
		if s == nil || s.UID != int64(uid) {
			continue
		}

		s.Online = false

		if r.game != nil && !r.game.Over() {
			s.Bot = true
		} else {
			r.seats[i] = nil
		}
	}

	if agent, ok := pomelo.GetAgentWithUID(uid); ok {
		agent.SetData("roomId", "")
	}

	r.pushRoomState()
	r.schedule()
}

// --- 准备与开局 ---

// ack 给请求方回一个成功应答，客户端据此结束等待。
func (r *Room) ack(session *cproto.Session) {
	if agent, ok := pomelo.GetAgentWithSID(session.Sid); ok {
		agent.Response(session, map[string]any{"code": 0})
	}
}

func (r *Room) onReady(session *cproto.Session, _ *Empty) {
	s := r.seatOf(session.Uid)
	if s == nil {
		return
	}

	s.Ready = true
	r.pushRoomState()
	r.ack(session)

	if r.game != nil && !r.game.Over() {
		return
	}

	// 空位由机器人补齐，因此只需校验已在座的人类玩家是否都准备了。
	for _, seat := range r.seats {
		if seat == nil || seat.Bot {
			continue
		}

		if !seat.Ready {
			return
		}
	}

	r.startGame()
}

// fillBots 补满空位为机器人，保证单人也能开局。
func (r *Room) fillBots() {
	names := []string{"小美", "阿福", "老王", "圆圆"}

	for i := range r.seats {
		if r.seats[i] != nil {
			continue
		}

		r.seats[i] = &Seat{
			UID:    -int64(i + 1),
			Nick:   names[i%len(names)],
			Bot:    true,
			Online: true,
			Ready:  true,
		}
	}
}

func (r *Room) startGame() {
	r.fillBots()
	r.round++
	if r.round > r.maxRound {
		r.round = 1
	}

	players := make([]*game.Player, 4)

	for i, s := range r.seats {
		players[i] = &game.Player{
			Seat:   i,
			UID:    s.UID,
			Nick:   s.Nick,
			Avatar: s.Avatar,
			Auto:   s.Bot,
		}
	}

	dealer := (r.round - 1) % 4
	r.game = game.New(r.cfg, r.rng, players, dealer)
	r.game.Start(r.round)
	r.phaseAt = time.Now()

	r.pushRoomState()
	r.flush()
	r.schedule()
}

// --- 对局操作 ---

func (r *Room) onDiscard(session *cproto.Session, req *DiscardReq) {
	if r.game == nil {
		return
	}

	if seat := r.seatIndex(session.Uid); seat >= 0 {
		r.game.Discard(seat, req.Tile)
		r.flush()
		r.schedule()
	}

	r.ack(session)
}

func (r *Room) onAction(session *cproto.Session, req *ActionReq) {
	if r.game == nil {
		return
	}

	seat := r.seatIndex(session.Uid)
	if seat < 0 {
		return
	}

	r.game.Action(seat, req.Type, req.Tile)
	r.flush()
	r.schedule()
	r.ack(session)
}

func (r *Room) onSync(session *cproto.Session, _ *Empty) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	seat := r.seatIndex(session.Uid)
	if seat < 0 {
		agent.Response(session, map[string]any{"code": 404, "msg": "不在房间内"})

		return
	}

	agent.Response(session, r.buildSnapshot(seat))
}

// --- 定时驱动 ---

func (r *Room) schedule() {
	if r.closed || r.tickPending {
		return
	}

	r.tickPending = true
	r.Timer().AddOnce(400*time.Millisecond, func() {
		r.Call(r.PathString(), "tick", &Empty{})
	})
}

func (r *Room) onTick(_ *Empty) {
	r.tickPending = false

	if r.closed || r.game == nil {
		return
	}

	if r.game.Over() {
		return
	}

	if dl := r.game.Deadline(); dl > 0 && time.Now().UnixMilli() >= dl {
		if seat := r.game.Decider(); seat >= 0 {
			r.game.Timeout(seat)
		}
	}

	for i, s := range r.seats {
		if s == nil || !s.Bot {
			continue
		}

		if r.game.NeedsAction(i) {
			r.game.BotStep(i)

			break
		}
	}

	r.flush()
	r.schedule()
}

func (r *Room) onNextRound(_ *Empty) {
	if r.closed {
		return
	}

	for _, s := range r.seats {
		if s == nil {
			continue
		}

		s.Ready = s.Bot
	}

	r.startGame()
}

// --- 事件推送 ---

func (r *Room) flush() {
	if r.game == nil {
		return
	}

	for _, ev := range r.game.Events() {
		if ev.Seat < 0 {
			r.broadcast(ev.Route, ev.Data)
		} else {
			r.pushSeat(ev.Seat, ev.Route, ev.Data)
		}
	}

	if r.game.Over() {
		r.finishRound()
	}
}

func (r *Room) finishRound() {
	if r.game == nil || !r.game.Over() {
		return
	}

	for i, p := range r.game.Players {
		if r.seats[i] != nil {
			r.seats[i].Total += p.Score
		}

		if r.seats[i] == nil || r.seats[i].Bot || r.store == nil {
			continue
		}

		fan := 0
		if p.Hu != nil {
			fan = p.Hu.Fan
		}

		r.store.SaveRecord(r.id, r.round, i, p.UID, p.Score, fan,
			fmt.Sprintf("round=%d score=%d fan=%d", r.round, p.Score, fan))
	}

	r.pushRoomState()

	if r.round >= r.maxRound {
		r.broadcast("onRoomEnd", struct {
			RoomID string `json:"roomId"`
		}{RoomID: r.id})

		return
	}

	r.Timer().AddOnce(4*time.Second, func() {
		r.Call(r.PathString(), "next", &Empty{})
	})
}

func (r *Room) broadcast(route string, v any) {
	for i := range r.seats {
		r.pushSeat(i, route, v)
	}
}

func (r *Room) pushSeat(seat int, route string, v any) {
	if seat < 0 || seat >= len(r.seats) || r.seats[seat] == nil {
		return
	}

	uid := r.seats[seat].UID
	if uid <= 0 {
		return
	}

	if agent, ok := pomelo.GetAgentWithUID(cfacade.UID(uid)); ok {
		agent.Push(route, v)
	}
}

func (r *Room) pushRoomState() {
	views := make([]SeatView, 0, 4)

	for i, s := range r.seats {
		if s == nil {
			views = append(views, SeatView{Seat: i})
			continue
		}

		v := SeatView{
			Seat:   i,
			UID:    s.UID,
			Nick:   s.Nick,
			Avatar: s.Avatar,
			Ready:  s.Ready,
			Online: s.Online,
			Bot:    s.Bot,
			Total:  s.Total,
		}

		if r.game != nil && i < len(r.game.Players) {
			p := r.game.Players[i]
			v.Score = p.Score
			v.Ting = p.Ting
			v.Finished = p.Finished
			v.IsBanker = p.IsBanker
			v.TileCount = p.Hand.Total()
			v.Melds = p.Melds
			v.Discards = p.Discards
		}

		views = append(views, v)
	}

	d := struct {
		RoomID   string     `json:"roomId"`
		Base     int        `json:"base"`
		Round    int        `json:"round"`
		MaxRound int        `json:"maxRound"`
		Phase    string     `json:"phase"`
		Turn     int        `json:"turn"`
		Seats    []SeatView `json:"seats"`
	}{RoomID: r.id, Base: r.cfg.Base, Round: r.round, MaxRound: r.maxRound, Seats: views}

	if r.game != nil {
		d.Phase = string(r.game.Phase)
		d.Turn = r.game.TurnSeat()
	}

	r.broadcast("onRoomState", d)
}

// syncTo 把完整快照发给某个座位（含手牌）。
func (r *Room) syncTo(seat int) {
	r.pushSnapshot(seat)
}

// Snapshot 房间快照，进房与断线重连时下发给单个座位。
type Snapshot struct {
	RoomID   string        `json:"roomId"`
	Base     int           `json:"base"`
	Round    int           `json:"round"`
	MaxRound int           `json:"maxRound"`
	Phase    string        `json:"phase"`
	Turn     int           `json:"turn"`
	Seats    []SeatView    `json:"seats"`
	Hand     []int         `json:"hand"`
	Options  []game.Option `json:"options"`
	Last     int           `json:"last"`
	LastSeat int           `json:"lastSeat"`
	Remain   int           `json:"remain"`
}

// buildSnapshot 组装某个座位的完整视图，未开局时只带座位信息。
func (r *Room) buildSnapshot(seat int) *Snapshot {
	snap := &Snapshot{
		RoomID: r.id, Base: r.cfg.Base, Round: r.round, MaxRound: r.maxRound,
		Seats: r.seatViews(), Hand: []int{}, Options: []game.Option{}, Turn: -1,
	}

	if r.game == nil {
		return snap
	}

	snap.Phase = string(r.game.Phase)
	snap.Turn = r.game.TurnSeat()
	snap.Remain = r.game.RemainCount()
	snap.Last, snap.LastSeat = r.game.LastDiscard()

	if seat >= 0 && seat < len(r.game.Players) {
		snap.Hand = r.game.Players[seat].Hand.Tiles()
		snap.Options = r.game.Pending(seat)
	}

	return snap
}

// seatViews 生成四家座位视图，牌局字段在未开局时保持零值。
func (r *Room) seatViews() []SeatView {
	views := make([]SeatView, 0, len(r.seats))

	for i := range r.seats {
		s := r.seats[i]
		v := SeatView{Seat: i}

		if s != nil {
			v.UID = s.UID
			v.Nick = s.Nick
			v.Avatar = s.Avatar
			v.Ready = s.Ready
			v.Online = s.Online
			v.Bot = s.Bot
			v.Total = s.Total
		}

		if r.game != nil && i < len(r.game.Players) {
			p := r.game.Players[i]
			v.Score = p.Score
			/* 牌局内部 Que 用 0 表示未定缺、1..3 表示万筒条，这里换算成 0..2 */
			v.Ting = p.Ting
			v.Finished = p.Finished
			v.IsBanker = p.IsBanker
			v.TileCount = p.Hand.Total()
			v.Melds = p.Melds
			v.Discards = p.Discards
		}

		views = append(views, v)
	}

	return views
}

// pushSnapshot 把完整快照推给指定座位。
func (r *Room) pushSnapshot(seat int) {
	if seat < 0 {
		return
	}

	r.pushSeat(seat, "onSync", r.buildSnapshot(seat))
}

func (r *Room) seatIndex(uid cfacade.UID) int {
	for i, s := range r.seats {
		if s != nil && s.UID == int64(uid) {
			return i
		}
	}

	return -1
}

func (r *Room) seatOf(uid cfacade.UID) *Seat {
	if i := r.seatIndex(uid); i >= 0 {
		return r.seats[i]
	}

	return nil
}

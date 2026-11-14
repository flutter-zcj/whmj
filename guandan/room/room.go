/* ===========================================================
 * 房间：权威牌局 + 座位管理 + 机器人补位 + 断线托管
 *
 * 与旧版 Node 服务端 room.js 行为一致，额外补充：
 *   - turnLeft：当前回合剩余秒数，随 sync 下发
 *   - OnSettle 回调：每局结束落库（MySQL）
 *
 * 并发模型：所有方法都在 cherry actor 的 goroutine 上被调用（串行），
 * 因此 Room 内部无需加锁；time.AfterFunc 回调只投递事件，不改状态。
 * =========================================================== */
package room

import (
	"fmt"
	"math"
	"math/rand"
	"strconv"
	"time"

	"github.com/zbcx/whmj/guandan/game"
	"github.com/zbcx/whmj/guandan/protocol"
)

// 可调参数（测试时用 Config 加速）
type Config struct {
	TurnMS    time.Duration // 单回合限时
	BotDelay  time.Duration // 机器人思考时间
	SettleMS  time.Duration // 结算展示后自动开下一局
	OfflineMS time.Duration // 断线保留座位时长
}

func DefaultConfig() Config {
	return Config{
		TurnMS:    12 * time.Second, // 单回合 12 秒，超时系统代打
		BotDelay:  850 * time.Millisecond,
		SettleMS:  6 * time.Second,
		OfflineMS: 60 * time.Second,
	}
}

// 房间状态
const (
	StatusWaiting = "waiting"
	StatusPlaying = "playing"
	StatusSettled = "settled"
	StatusClosed  = "closed"
)

// 定时器种类
const (
	TimerTurn      = "turn"
	TimerBot       = "bot"
	TimerSettle    = "settle"
	TimerAutoStart = "autoStart"
	TimerOffline   = "offline"
)

// Player 座位玩家
type Player struct {
	UID    string
	Name   string
	SID    string // 当前连接 sid（断线后置空）
	Online bool
	Bot    bool // 当前由 AI 代打（真人离线时会临时置 true）
	Human  bool // 是否是真人入座（房主添加的电脑为 false；离线托管后仍为 true）
	Host   bool
	Ready  bool
}

// Summary 一局摘要（落库用）
type Summary struct {
	RoomID     string
	Round      int
	WinnerTeam int
	UpLevel    int
	DoubleDown bool
	Resisted   bool
	Levels     []int
	Ranks      []int
	Players    []string // 4 个座位名字（含电脑）
	Humans     int
	StartedAt  time.Time
	EndedAt    time.Time
}

// TimerEvent 定时器事件（由 actor 投递回房间）
type TimerEvent struct {
	RoomID string
	Kind   string
	Token  int64
}

// Hooks 房间与外界（actor / 数据库）的交互点
type Hooks struct {
	Send     func(seat int, mid uint32, payload any) // 推送消息到某个座位
	Post     func(evt TimerEvent)                    // 定时器事件投递回 actor
	OnSettle func(*Summary)                          // 一局结束
	OnClosed func(roomID string)                     // 房间销毁
}

// Room 一个牌局房间
type Room struct {
	ID      string
	Players [4]*Player
	Table   *game.GameTable
	Status  string

	outs [4]*protocol.OutView
	tips []protocol.TipView

	// 当前计时所属座位与截止时间，用于 sync 下发准确的剩余秒数
	turnSeat int
	turnAt   time.Time

	RoundNo    int
	LastActive time.Time
	CreatedAt  time.Time
	StartedAt  time.Time

	tokens map[string]int64

	cfg  Config
	hooks Hooks
}

// New 创建房间
func New(id string, cfg Config, hooks Hooks) *Room {
	return &Room{
		ID:         id,
		Status:     StatusWaiting,
		cfg:        cfg,
		hooks:      hooks,
		tokens:     map[string]int64{},
		turnSeat:   -1,
		LastActive: time.Now(),
		CreatedAt:  time.Now(),
	}
}

// NewRoomID 6 位房间号：100000 - 999999
func NewRoomID() string {
	return strconv.Itoa(100000 + rand.Intn(900000))
}

/* ---------------- 座位 ---------------- */

func (r *Room) emptySeat() int {
	for i, p := range r.Players {
		if p == nil {
			return i
		}
	}
	return -1
}

// HumanCount 真人数量
func (r *Room) HumanCount() int {
	n := 0
	for _, p := range r.Players {
		if p != nil && !p.Bot {
			n++
		}
	}
	return n
}

// IsFull 座位是否坐满
func (r *Room) IsFull() bool {
	for _, p := range r.Players {
		if p == nil {
			return false
		}
	}
	return true
}

// HostSeat 房主座位号；没有则 -1
func (r *Room) HostSeat() int {
	for i, p := range r.Players {
		if p != nil && p.Host {
			return i
		}
	}
	return -1
}

// IsHost 是否房主
func (r *Room) IsHost(seat int) bool {
	if seat < 0 || seat > 3 {
		return false
	}
	p := r.Players[seat]
	return p != nil && p.Host
}

// ensureHost 房主座位被清空后，把房主转交给下一个在线真人
func (r *Room) ensureHost() int {
	if s := r.HostSeat(); s >= 0 {
		return s
	}
	for i, p := range r.Players {
		if p != nil && !p.Bot && p.Online {
			p.Host = true
			return i
		}
	}
	return -1
}

// findPlayer 按 uid / 名字找座位（重连）
func (r *Room) findPlayer(uid, name string) int {
	if uid != "" {
		for i, p := range r.Players {
			if p != nil && p.Human && p.UID == uid {
				return i
			}
		}
	}
	if name != "" {
		for i, p := range r.Players {
			if p != nil && p.Human && p.Name == name {
				return i
			}
		}
	}
	return -1
}

// HasPlayer 是否已有该玩家（重连判定）
func (r *Room) HasPlayer(uid, name string) bool { return r.findPlayer(uid, name) >= 0 }

// ScheduleAutoStart 4 个真人坐满后延迟自动开局
func (r *Room) ScheduleAutoStart(d time.Duration) {
	if r.Status != StatusWaiting {
		return
	}
	r.scheduleTimer(TimerAutoStart, d)
}

// Join 加入房间；返回座位号，-1 表示满员
func (r *Room) Join(sid, uid, name string) int {
	// 同名/同 uid 视为重连：恢复原座位
	if back := r.findPlayer(uid, name); back >= 0 {
		p := r.Players[back]
		p.SID = sid
		p.Online = true
		p.Bot = false
		if uid != "" {
			p.UID = uid
		}
		r.cancelTimer(TimerOffline + strconv.Itoa(back))
		r.ensureHost()
		r.SyncAll()
		return back
	}

	seat := r.emptySeat()
	if seat < 0 {
		return -1
	}
	if name == "" {
		name = "玩家" + strconv.Itoa(seat+1)
	}
	r.Players[seat] = &Player{
		UID: uid, Name: name, SID: sid, Online: true, Human: true,
		Host: r.HostSeat() < 0,
	}
	r.ensureHost()
	r.SyncAll()
	return seat
}

// AddBot 房主添加一个电脑玩家（默认不自动补位）
func (r *Room) AddBot() (int, string) {
	if r.Status == StatusPlaying {
		return -1, "牌局进行中"
	}
	seat := r.emptySeat()
	if seat < 0 {
		return -1, "房间已满"
	}
	used := map[string]bool{}
	for _, p := range r.Players {
		if p != nil && p.Bot {
			used[p.Name] = true
		}
	}
	n := 1
	for used["电脑"+strconv.Itoa(n)] {
		n++
	}
	r.Players[seat] = &Player{Name: "电脑" + strconv.Itoa(n), Bot: true, Human: false, Ready: true}
	r.SyncAll()
	return seat, ""
}

// RemoveBot 房主移除某个电脑座位
func (r *Room) RemoveBot(seat int) string {
	if seat < 0 || seat > 3 || r.Players[seat] == nil {
		return "座位已空"
	}
	if !r.Players[seat].Bot {
		return "只能移除电脑"
	}
	if r.Status == StatusPlaying {
		return "牌局进行中"
	}
	r.Players[seat] = nil
	r.ensureHost()
	r.SyncAll()
	return ""
}

// Leave 主动离开
func (r *Room) Leave(seat int) {
	if seat < 0 || seat > 3 {
		return
	}
	p := r.Players[seat]
	if p == nil {
		return
	}
	if r.Status == StatusPlaying {
		// 局中离开：转托管，保留座位信息以便重连
		p.Online = false
		p.Bot = true
		p.SID = ""
		r.SyncAll()
		r.tick()
		return
	}
	r.Players[seat] = nil
	r.ensureHost()
	if r.HumanCount() == 0 {
		r.Destroy()
		return
	}
	r.SyncAll()
}

// Offline 断线
func (r *Room) Offline(seat int) {
	if seat < 0 || seat > 3 {
		return
	}
	p := r.Players[seat]
	if p == nil || p.Bot {
		return
	}
	p.Online = false
	p.SID = ""
	if r.Status == StatusPlaying {
		// 局中：立刻托管，超时后若房间没人则销毁
		p.Bot = true
		r.scheduleTimer(TimerOffline+strconv.Itoa(seat), r.cfg.OfflineMS)
		r.SyncAll()
		r.tick()
		return
	}
	// 等待中：保留座位并给一个重连宽限期。
	// 客户端在「房间页 → 牌桌页」之间切换时会重建连接，立即踢座会把刚开局的房间拆散。
	r.SyncAll()
	r.scheduleTimer(TimerOffline+strconv.Itoa(seat), r.cfg.OfflineMS)
}

/* ---------------- 开局 ---------------- */

// Start 房主点「开始游戏」：必须 4 个座位都有玩家（真人或房主添加的电脑）
func (r *Room) Start() string {
	if r.Status == StatusPlaying {
		return "牌局进行中"
	}
	empty := 0
	for _, p := range r.Players {
		if p == nil {
			empty++
		}
	}
	if empty > 0 {
		return fmt.Sprintf("还差 %d 个座位，可添加电脑", empty)
	}
	for _, p := range r.Players {
		p.Ready = true
	}
	r.Table = game.NewTable(time.Now().UnixNano() % 1000000)
	r.Table.Deal()
	r.RoundNo++
	r.outs = [4]*protocol.OutView{}
	r.turnSeat = -1
	r.turnAt = time.Time{}
	r.Status = StatusPlaying
	r.StartedAt = time.Now()
	r.SyncAll()
	r.tick()
	return ""
}

// nextRound 再来一局（沿用当前级牌，重新发牌）
func (r *Room) nextRound() {
	if r.Table == nil {
		r.Start()
		return
	}
	r.Table.Deal()
	r.outs = [4]*protocol.OutView{}
	r.Status = StatusPlaying
	r.RoundNo++
	r.StartedAt = time.Now()
	r.SyncAll()
	r.tick()
}

/* ---------------- 回合驱动 ---------------- */

func (r *Room) tick() {
	r.cancelTimer(TimerTurn)
	r.cancelTimer(TimerBot)
	if r.Table == nil || r.Status != StatusPlaying {
		return
	}
	if r.Table.Step != game.StepPlay {
		r.finishRound()
		return
	}
	seat := r.Table.CurrentSeat
	p := r.Players[seat]
	if p == nil {
		return
	}
	if !p.Online || p.Bot {
		// 电脑/托管不需要限时，避免 sync 里给真人显示倒计时
		r.turnSeat = -1
		r.turnAt = time.Time{}
		r.scheduleTimer(TimerBot, r.cfg.BotDelay)
	} else {
		r.turnSeat = seat
		r.turnAt = time.Now().Add(r.cfg.TurnMS)
		r.scheduleTimer(TimerTurn, r.cfg.TurnMS)
	}
}

/* ---------------- 回合限时 ---------------- */

// turnLeft 本回合剩余秒数；尚未开始计时（tick 还没跑）时给满值
func (r *Room) turnLeft(seat int) int {
	full := int(r.cfg.TurnMS / time.Second)
	if full < 1 {
		full = 1
	}
	if r.turnSeat != seat || r.turnAt.IsZero() {
		return full
	}
	left := int(math.Ceil(time.Until(r.turnAt).Seconds()))
	if left < 0 {
		left = 0
	}
	if left > full {
		left = full
	}
	return left
}

// smallestCard 手牌里最小的一张（按当前级牌算权重）
func (r *Room) smallestCard(seat int) int {
	hand := r.Table.Seats[seat].Hand
	level := r.Table.LevelOf(seat)
	best := hand[0]
	for _, c := range hand[1:] {
		if game.Weight(c, level) < game.Weight(best, level) {
			best = c
		}
	}
	return best
}

func (r *Room) botPlay(seat int) {
	if r.Table == nil || r.Status != StatusPlaying || r.Table.CurrentSeat != seat {
		return
	}
	cards := game.AIChoose(r.Table, seat)
	r.applyPlay(seat, cards)
}

// autoPlay 超时托管：能压就压（最小），否则过；无论 AI 结果如何都保证回合推进
func (r *Room) autoPlay(seat int) {
	if r.Table == nil || r.Status != StatusPlaying || r.Table.CurrentSeat != seat {
		return
	}
	cards := []int{}
	func() {
		defer func() { recover() }()
		cards = game.AIChoose(r.Table, seat)
	}()
	// 提示随本次 sync 一起下发，前端据此告诉自己「超时已托管」
	r.markTimeout(seat)
	if r.applyPlay(seat, cards) == "" {
		return
	}
	r.retractTimeout()
	// AI 没给出合法牌（先手必须出牌等）：退化成最小单张，避免整桌卡住
	if r.Table.CurrentSeat != seat {
		return
	}
	if r.Table.LastPlaySeat == seat || r.Table.LastPlaySeat == -1 {
		if len(r.Table.Seats[seat].Hand) > 0 {
			r.markTimeout(seat)
			if r.applyPlay(seat, []int{r.smallestCard(seat)}) == "" {
				return
			}
			r.retractTimeout()
		}
	}
	if r.applyPlay(seat, nil) != "" {
		// 连过牌都不合法（理论上不会发生）：重新计时兜底，绝不让牌局停在这一手
		r.tick()
	}
}

// markTimeout 记一条超时托管提示，随下一次 sync 发出
func (r *Room) markTimeout(seat int) {
	r.tips = append(r.tips, protocol.TipView{Seat: seat, Type: "timeout"})
}

// retractTimeout 出牌失败时撤回刚才的提示，避免下次 sync 误报
func (r *Room) retractTimeout() {
	if n := len(r.tips); n > 0 {
		r.tips = r.tips[:n-1]
	}
}

// Play 玩家出牌请求
func (r *Room) Play(seat int, cards []int) string {
	if r.Table == nil || r.Status != StatusPlaying {
		return "牌局未开始"
	}
	if r.Table.CurrentSeat != seat {
		return "还没轮到你"
	}
	if p := r.Players[seat]; p != nil && p.Bot && p.Online {
		p.Bot = false // 重连后接管
	}
	return r.applyPlay(seat, cards)
}

func (r *Room) applyPlay(seat int, cards []int) string {
	t := r.Table
	if t.CurrentSeat != seat {
		return "还没轮到你"
	}
	isPass := len(cards) == 0
	var pattern *game.Pattern
	if !isPass {
		pattern = game.Parse(cards, t.LevelOf(seat))
		if pattern == nil {
			return "牌型不合法"
		}
		if !game.CanBeat(pattern, t.LastPattern, t.LevelOf(seat)) {
			return "压不过上家"
		}
	} else if t.LastPlaySeat == seat || t.LastPlaySeat == -1 {
		return "你是先手，必须出牌"
	}

	if !t.Play(seat, cards) {
		return "出牌失败"
	}

	if isPass {
		r.outs[seat] = nil
	} else {
		r.outs[seat] = &protocol.OutView{Seat: seat, Cards: append([]int{}, cards...), Name: game.PatternText(pattern)}
	}
	r.LastActive = time.Now()

	// 头游播报
	if t.Seats[seat].Rank == 1 {
		r.tips = append(r.tips, protocol.TipView{Seat: seat, Type: "first"})
	}

	r.SyncAll()
	r.tick()
	return ""
}

/* ---------------- 结算 ---------------- */

func (r *Room) finishRound() {
	if r.Status != StatusPlaying {
		return
	}
	r.cancelTimer(TimerTurn)
	t := r.Table

	var res *game.SettleResult
	var tributeLogs []game.TributeLog
	func() {
		defer func() { recover() }()
		res = t.Settle()
		if res != nil && !res.Resisted && len(res.Tributes) > 0 {
			tributeLogs = t.DoTribute(res.Tributes)
		}
	}()
	r.Status = StatusSettled
	r.turnSeat = -1
	r.turnAt = time.Time{}
	if res == nil {
		res = &game.SettleResult{WinnerTeam: 1, UpLevel: 1, Ranks: []int{1, 2, 3, 4}}
	}

	tributes := make([]protocol.TributeView, 0, len(tributeLogs))
	for _, l := range tributeLogs {
		back := ""
		if l.Back != 0 {
			back = game.CardName(l.Back)
		}
		tributes = append(tributes, protocol.TributeView{
			From: l.FromSeat, To: l.ToSeat, Card: game.CardName(l.Card), Back: back,
		})
	}

	ranks := make([]int, 4)
	for i, s := range t.Seats {
		ranks[i] = s.Rank
	}
	payload := &protocol.SettleResp{
		T:          "settle",
		Room:       r.ID,
		Round:      r.RoundNo,
		WinnerTeam: res.WinnerTeam,
		UpLevel:    res.UpLevel,
		DoubleDown: res.DoubleDown,
		Resisted:   res.Resisted,
		Ranks:      ranks,
		Levels:     []int{t.LevelOf(0), t.LevelOf(1)},
		Tributes:   tributes,
		Outs:       r.outsSlice(),
	}
	r.broadcast(protocol.MidSettle, payload)
	r.SyncAll()

	if r.hooks.OnSettle != nil {
		names := make([]string, 4)
		for i, p := range r.Players {
			if p != nil {
				names[i] = p.Name
			}
		}
		r.hooks.OnSettle(&Summary{
			RoomID: r.ID, Round: r.RoundNo, WinnerTeam: res.WinnerTeam, UpLevel: res.UpLevel,
			DoubleDown: res.DoubleDown, Resisted: res.Resisted,
			Levels: []int{t.LevelOf(0), t.LevelOf(1)}, Ranks: ranks,
			Players: names, Humans: r.HumanCount(),
			StartedAt: r.StartedAt, EndedAt: time.Now(),
		})
	}

	// 自动开下一局（所有人都离线则销毁）
	r.scheduleTimer(TimerSettle, r.cfg.SettleMS)
}

func (r *Room) onSettleTimeout() {
	// 只清理掉线真人，保留房主手动添加的电脑座位
	for i, p := range r.Players {
		if p != nil && !p.Online && !p.Bot {
			r.Players[i] = nil
		}
	}
	if r.HumanCount() == 0 {
		r.Destroy()
		return
	}
	r.ensureHost()
	for _, p := range r.Players {
		if p == nil {
			// 有人走了且没补位 → 回到等待房间，等房主加电脑或真人进房
			r.Status = StatusWaiting
			r.outs = [4]*protocol.OutView{}
			r.turnSeat = -1
			r.turnAt = time.Time{}
			r.SyncAll()
			return
		}
	}
	r.nextRound()
}

/* ---------------- 定时器 ---------------- */

func (r *Room) scheduleTimer(kind string, d time.Duration) {
	r.tokens[kind]++
	token := r.tokens[kind]
	roomID := r.ID
	post := r.hooks.Post
	time.AfterFunc(d, func() {
		if post != nil {
			post(TimerEvent{RoomID: roomID, Kind: kind, Token: token})
		}
	})
}

func (r *Room) cancelTimer(kind string) {
	r.tokens[kind]++
}

// FireTimer 处理定时器事件；token 过期则忽略（等价于 clearTimeout）
func (r *Room) FireTimer(evt TimerEvent) {
	if r.tokens[evt.Kind] != evt.Token {
		return
	}
	switch {
	case evt.Kind == TimerTurn:
		if r.Table != nil {
			r.autoPlay(r.Table.CurrentSeat)
		}
	case evt.Kind == TimerBot:
		if r.Table != nil {
			r.botPlay(r.Table.CurrentSeat)
		}
	case evt.Kind == TimerSettle:
		r.onSettleTimeout()
	case evt.Kind == TimerAutoStart:
		if r.Status == StatusWaiting && r.HumanCount() == 4 {
			r.Start()
		}
	default:
		if len(evt.Kind) > 7 && evt.Kind[:7] == TimerOffline {
			// 宽限期到：仍在离线的真人座位清掉，房主顺延
			if seat, err := strconv.Atoi(evt.Kind[7:]); err == nil && seat >= 0 && seat < 4 {
				if p := r.Players[seat]; p != nil && p.Human && !p.Online && p.SID == "" {
					r.Players[seat] = nil
					r.ensureHost()
					r.SyncAll()
				}
			}
			if r.Status != StatusPlaying && r.HumanCount() == 0 {
				r.Destroy()
			}
		}
	}
}

/* ---------------- 广播 ---------------- */

func (r *Room) outsSlice() []*protocol.OutView {
	out := make([]*protocol.OutView, 4)
	for i := range r.outs {
		if r.outs[i] != nil {
			v := *r.outs[i]
			out[i] = &v
		}
	}
	return out
}

// StateFor 生成给某个座位的全量状态
func (r *Room) StateFor(seat int) *protocol.SyncResp {
	t := r.Table
	level := 2
	levels := []int{2, 2}
	if t != nil {
		level = t.LevelOf(seat)
		levels = []int{t.LevelOf(0), t.LevelOf(1)}
	}

	seats := make([]protocol.SeatState, 4)
	for i, p := range r.Players {
		team := 2
		if i%2 == 0 {
			team = 1
		}
		st := protocol.SeatState{Seat: i, Team: team, Empty: p == nil}
		if p != nil {
			st.Name = p.Name
			st.Bot = p.Bot
			st.Host = p.Host
			st.Online = p.Online
			st.Ready = p.Ready
		}
		if t != nil {
			st.Count = len(t.Seats[i].Hand)
			st.Rank = t.Seats[i].Rank
		}
		seats[i] = st
	}

	var lastPattern *protocol.PatternView
	step := "none"
	currentSeat := 0
	lastPlaySeat := -1
	if t != nil {
		step = t.Step
		currentSeat = t.CurrentSeat
		lastPlaySeat = t.LastPlaySeat
		if t.LastPattern != nil {
			lastPattern = &protocol.PatternView{
				ID:    t.LastPattern.ID,
				Name:  t.LastPattern.Name,
				Text:  game.PatternText(t.LastPattern),
				Cards: append([]int{}, t.LastPattern.Cards...),
			}
		}
	}

	hand := []int{}
	if t != nil && seat >= 0 && seat < 4 {
		hand = append(hand, t.Seats[seat].Hand...)
	}

	turnLeft := 0
	if r.Status == StatusPlaying && r.Players[seat] != nil && currentSeat == seat && !r.Players[seat].Bot {
		// 轮到该座位且是真人：按本回合截止时间算剩余秒数（未开始计时则给满值）
		turnLeft = r.turnLeft(seat)
	}

	resp := &protocol.SyncResp{
		T:            "sync",
		Room:         r.ID,
		Status:       r.Status,
		Round:        r.RoundNo,
		Step:         step,
		CurrentSeat:  currentSeat,
		LastPlaySeat: lastPlaySeat,
		LastPattern:  lastPattern,
		Level:        level,
		Levels:       levels,
		Seats:        seats,
		HostSeat:     r.HostSeat(),
		Outs:         r.outsSlice(),
		Hand:         hand,
		Tips:         append([]protocol.TipView{}, r.tips...),
		TurnLeft:     turnLeft,
	}
	return resp
}

func (r *Room) broadcast(mid uint32, payload any) {
	if r.hooks.Send == nil {
		return
	}
	for i := 0; i < 4; i++ {
		if p := r.Players[i]; p != nil && p.Online {
			r.hooks.Send(i, mid, payload)
		}
	}
}

// SyncAll 给每个在线座位推送全量状态
func (r *Room) SyncAll() {
	if r.hooks.Send == nil {
		return
	}
	for i := 0; i < 4; i++ {
		if p := r.Players[i]; p != nil && p.Online {
			r.hooks.Send(i, protocol.MidSync, r.StateFor(i))
		}
	}
	// 提示逐座位下发完再清，否则只有第一个在线玩家能收到（超时托管、头游播报都依赖它）
	r.tips = nil
}

// SendTo 给单个座位推送
func (r *Room) SendTo(seat int, mid uint32, payload any) {
	if r.hooks.Send != nil {
		r.hooks.Send(seat, mid, payload)
	}
}

// Destroy 销毁房间
func (r *Room) Destroy() {
	r.Status = StatusClosed
	if r.hooks.OnClosed != nil {
		r.hooks.OnClosed(r.ID)
	}
}

// SeatOfSID 按连接 sid 找座位
func (r *Room) SeatOfSID(sid string) int {
	for i, p := range r.Players {
		if p != nil && p.SID == sid {
			return i
		}
	}
	return -1
}

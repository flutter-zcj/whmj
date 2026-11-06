// Package game 实现武汉赖子麻将（七皮四赖红中杠）的牌局状态机。
//
// 设计要点：
//   - 状态机只产出事件（Event），不关心网络传输；由 actor 层决定推给谁。
//   - 所有决策入口（出牌、碰杠胡、超时）都收敛到同一套 校验 -> 变更 -> 产出事件 流程。
//   - 每个座位同一时刻最多只有一个待决策项，便于做超时托管。
package game

import (
	"math/rand"
	"sort"
	"time"

	"github.com/zbcx/whmj/internal/rule"
)

// Phase 牌局阶段。
type Phase string

const (
	// PhasePlay 出牌阶段。
	PhasePlay Phase = "play"
	// PhaseOver 牌局结束。
	PhaseOver Phase = "over"
)

// 操作类型。
const (
	OpDiscard = "discard"
	OpPeng    = "peng"
	OpGang    = "gang"
	OpAnGang  = "angang"
	OpBuGang  = "bugang"
	OpHu      = "hu"
	OpPass    = "pass"
)

// Option 一个可执行的操作项，下发给客户端渲染操作按钮。
type Option struct {
	Type string `json:"type"`
	Tile int    `json:"tile"`
	Desc string `json:"desc"`
}

// Event 状态机产出的对外事件。
type Event struct {
	Route string `json:"route"`
	Seat  int    `json:"seat"`
	Data  any    `json:"data"`
}

// GangRecord 一条杠分流水，用于流局退税。
type GangRecord struct {
	From   int `json:"from"`
	To     int `json:"to"`
	Amount int `json:"amount"`
	Kind   int `json:"kind"`
}

// HuInfo 一次胡牌的结算信息。
type HuInfo struct {
	Seat     int            `json:"seat"`
	LoseSeat int            `json:"loseSeat"`
	SelfDraw bool           `json:"selfDraw"`
	Tile     int            `json:"tile"`
	Fans     []rule.FanItem `json:"fans"`
	Fan      int            `json:"fan"`
	Score    int            `json:"score"`
	Hand     []int          `json:"hand"`
	Melds    []rule.Meld    `json:"melds"`
}

// Player 牌桌上的一个座位。
type Player struct {
	Seat     int         `json:"seat"`
	UID      int64       `json:"uid"`
	Nick     string      `json:"nick"`
	Avatar   string      `json:"avatar"`
	Hand     rule.Counts `json:"-"`
	Melds    []rule.Meld `json:"melds"`
	Discards []int       `json:"discards"`
	Ting     bool        `json:"ting"`
	Finished bool        `json:"finished"`
	IsBanker bool        `json:"isBanker"`
	Auto     bool        `json:"auto"`
	Score    int         `json:"score"`
	GangGain int         `json:"gangGain"`
	Hu       *HuInfo     `json:"hu"`
}

// Config 一局的可配置规则。
type Config struct {
	Base       int `json:"base"`
	Cap        int `json:"cap"`
	RoundTotal int `json:"roundTotal"`
}

// DefaultConfig 默认规则：底分 1、封顶 4 番、一局 8 盘。
func DefaultConfig() Config {
	return Config{Base: 1, Cap: 4, RoundTotal: 8}
}

// Game 一局牌。
type Game struct {
	Cfg     Config
	Rng     *rand.Rand
	Wall    []int
	Pos     int
	Tail    int
	Players []*Player
	Phase   Phase
	Turn    int
	Dealer  int

	drawn       int
	gangFlag    bool
	afterGang   int
	lastTile    int
	lastSeat    int
	needDiscard bool
	pending     map[int][]Option
	answered    map[int]bool
	actions     map[int]Option
	askWinner   int
	round       int
	huOrder     []int
	gangs       []GangRecord
	events      []Event
	over        bool
	firstTurn   bool
	startAt     time.Time
	deadline    int64
}

// New 创建一局牌。seats 为按座位顺序的玩家。
func New(cfg Config, rng *rand.Rand, players []*Player, dealer int) *Game {
	if rng == nil {
		rng = rand.New(rand.NewSource(time.Now().UnixNano()))
	}

	g := &Game{
		Cfg:       cfg,
		Rng:       rng,
		Players:   players,
		Dealer:    dealer,
		Turn:      dealer,
		Phase:     PhasePlay,
		pending:   make(map[int][]Option),
		answered:  make(map[int]bool),
		actions:   make(map[int]Option),
		firstTurn: true,
		startAt:   time.Now(),
	}

	for i, p := range players {
		p.Seat = i
		p.IsBanker = i == dealer
		p.Melds = make([]rule.Meld, 0, 4)
		p.Discards = make([]int, 0, 18)
	}

	return g
}

// Events 取出并清空事件队列。
func (g *Game) Events() []Event {
	out := g.events
	g.events = nil

	return out
}

// Over 牌局是否结束。
func (g *Game) Over() bool {
	return g.over
}

// Deadline 当前决策的截止时间戳（毫秒），0 表示无等待。
func (g *Game) Deadline() int64 {
	return g.deadline
}

// Pending 返回某座位当前的可选操作，没有则返回 nil。
func (g *Game) Pending(seat int) []Option {
	return g.pending[seat]
}

// DrawTile 返回当前摸到的牌，用于给本人下发。
func (g *Game) DrawTile() int {
	return g.drawn
}

// TurnSeat 当前该谁出牌。
func (g *Game) TurnSeat() int {
	return g.Turn
}

// LastDiscard 最近一张弃牌及其来源座位。
func (g *Game) LastDiscard() (int, int) {
	return g.lastTile, g.lastSeat
}

func (g *Game) emit(route string, seat int, data any) {
	g.events = append(g.events, Event{Route: route, Seat: seat, Data: data})
}

// Start 发牌并进入定缺阶段。
func (g *Game) Start(round int) {
	g.round = round
	g.Wall = rule.NewWall(g.Rng)
	g.Pos = 0
	g.Tail = 0

	for i := 0; i < rule.HandSize; i++ {
		for _, p := range g.Players {
			p.Hand.Add(g.Wall[g.Pos])
			g.Pos++
		}
	}

	g.Players[g.Dealer].Hand.Add(g.Wall[g.Pos])
	g.Pos++

	g.emit("onGameStart", -1, struct {
		Dealer int `json:"dealer"`
		Round  int `json:"round"`
	}{Dealer: g.Dealer, Round: round})

	for _, p := range g.Players {
		g.emit("onDeal", p.Seat, struct {
			Seat  int   `json:"seat"`
			Hand  []int `json:"hand"`
			Count int   `json:"count"`
		}{Seat: p.Seat, Hand: p.Hand.Tiles(), Count: p.Hand.Total()})
	}

	g.beginPlay()
}

// beginPlay 进入出牌阶段，由庄家先出牌（庄家起手 14 张）。
func (g *Game) beginPlay() {
	g.Phase = PhasePlay
	g.Turn = g.Dealer
	g.needDiscard = true
	g.drawn = 0

	g.emit("onPlayStart", -1, struct {
		Turn int `json:"turn"`
	}{Turn: g.Dealer})

	g.askDiscard(g.Dealer)
}

// askDiscard 通知某座位出牌，并给出自摸/暗杠/补杠选项。
func (g *Game) askDiscard(seat int) {
	p := g.Players[seat]
	opts := make([]Option, 0, 4)

	if g.drawn > 0 && rule.CanWin(p.Hand, len(p.Melds)) {
		opts = append(opts, Option{Type: OpHu, Tile: g.drawn, Desc: "胡"})
	}

	for _, t := range rule.AnGangTiles(p.Hand) {
		opts = append(opts, Option{Type: OpAnGang, Tile: t, Desc: "暗杠"})
	}

	for _, t := range rule.BuGangTiles(p.Hand, p.Melds) {
		opts = append(opts, Option{Type: OpBuGang, Tile: t, Desc: "补杠"})
	}

	g.needDiscard = true
	g.pending = map[int][]Option{seat: opts}
	g.answered = map[int]bool{}
	g.actions = map[int]Option{}
	g.deadline = time.Now().Add(15 * time.Second).UnixMilli()

	g.emit("onTurn", -1, struct {
		Seat     int      `json:"seat"`
		Deadline int64    `json:"deadline"`
		Options  []Option `json:"options"`
		Remain   int      `json:"remain"`
	}{Seat: seat, Deadline: g.deadline, Options: opts, Remain: g.remain()})
}

// drawSeatTile 只对本人返回摸到的牌，其他人拿到 0。
func (g *Game) drawSeatTile(seat int) int {
	if seat == g.Turn && g.drawn > 0 {
		return g.drawn
	}

	return 0
}

func (g *Game) remain() int {
	return len(g.Wall) - g.Pos - g.Tail
}

// RemainCount 返回牌墙剩余张数，供断线重连快照使用。
func (g *Game) RemainCount() int {
	return g.remain()
}

// Discard 出牌。
func (g *Game) Discard(seat, tile int) {
	if g.Phase != PhasePlay || g.Turn != seat || !g.needDiscard {
		return
	}

	p := g.Players[seat]
	if p.Finished || p.Hand[tile] <= 0 {
		return
	}

	p.Hand.Remove(tile)
	p.Discards = append(p.Discards, tile)
	g.lastTile = tile
	g.lastSeat = seat
	g.drawn = 0
	g.needDiscard = false
	g.gangFlag = false

	g.firstTurn = false

	g.emit("onDiscard", -1, struct {
		Seat int `json:"seat"`
		Tile int `json:"tile"`
	}{Seat: seat, Tile: tile})

	g.askOthers(seat, tile)
}

// askOthers 计算其他座位对这张弃牌的响应选项。
func (g *Game) askOthers(fromSeat, tile int) {
	g.pending = make(map[int][]Option)
	g.answered = make(map[int]bool)
	g.actions = make(map[int]Option)
	g.askWinner = -1

	for _, p := range g.Players {
		if p.Seat == fromSeat || p.Finished {
			continue
		}

		opts := make([]Option, 0, 3)
		probe := p.Hand.Clone()
		probe.Add(tile)

		if rule.CanWin(probe, len(p.Melds)) {
			opts = append(opts, Option{Type: OpHu, Tile: tile, Desc: "胡"})
		}

		if rule.CanMingGang(p.Hand, tile) && g.remain() > 0 {
			opts = append(opts, Option{Type: OpGang, Tile: tile, Desc: "杠"})
		}

		if rule.CanPeng(p.Hand, tile) {
			opts = append(opts, Option{Type: OpPeng, Tile: tile, Desc: "碰"})
		}

		if len(opts) > 0 {
			g.pending[p.Seat] = opts
			g.answered[p.Seat] = false
		}
	}

	if len(g.pending) == 0 {
		g.nextTurn(fromSeat)

		return
	}

	g.deadline = time.Now().Add(12 * time.Second).UnixMilli()

	for seat, opts := range g.pending {
		g.emit("onAsk", seat, struct {
			Seat     int      `json:"seat"`
			Tile     int      `json:"tile"`
			From     int      `json:"from"`
			Options  []Option `json:"options"`
			Deadline int64    `json:"deadline"`
		}{Seat: seat, Tile: tile, From: fromSeat, Options: opts, Deadline: g.deadline})
	}
}

// Action 处理玩家操作：碰、杠、胡、过。
func (g *Game) Action(seat int, opType string, tile int) {
	if g.Phase != PhasePlay {
		return
	}

	p := g.Players[seat]
	if p.Finished {
		return
	}

	// 自己的回合内：自摸、暗杠、补杠
	if seat == g.Turn && g.needDiscard {
		g.selfAction(seat, opType, tile)

		return
	}

	opts, waiting := g.pending[seat]
	if !waiting {
		return
	}

	// 「过」不是候选项之一，而是对任意候选项的放弃，因此单独放行。
	valid := opType == OpPass

	for _, o := range opts {
		if valid {
			break
		}

		if o.Type == opType && o.Tile == tile {
			valid = true
		}
	}

	if !valid {
		return
	}

	g.answered[seat] = true
	g.actions[seat] = Option{Type: opType, Tile: tile}

	if opType == OpPass {
		g.emit("onActionDone", -1, struct {
			Seat  int    `json:"seat"`
			Type  string `json:"type"`
			Tile  int    `json:"tile"`
			Label string `json:"label"`
		}{Seat: seat, Type: OpPass, Tile: tile, Label: "过"})
	}

	g.tryResolve()
}

func (g *Game) selfAction(seat int, opType string, tile int) {
	p := g.Players[seat]
	opts := g.pending[seat]
	valid := false

	for _, o := range opts {
		if o.Type == opType && (o.Tile == tile || opType == OpHu) {
			valid = true

			break
		}
	}

	if !valid {
		return
	}

	switch opType {
	case OpHu:
		g.winHu(seat, seat, true, g.drawn, true)
	case OpAnGang:
		if p.Hand[tile] < rule.CopiesPerTile {
			return
		}

		for i := 0; i < rule.CopiesPerTile; i++ {
			p.Hand.Remove(tile)
		}

		p.Melds = append(p.Melds, rule.Meld{Type: rule.MeldAnGang, Tile: tile, From: seat})
		g.emit("onActionDone", -1, struct {
			Seat  int    `json:"seat"`
			Type  string `json:"type"`
			Tile  int    `json:"tile"`
			Label string `json:"label"`
		}{Seat: seat, Type: OpAnGang, Tile: tile, Label: "暗杠"})

		g.settleGang(seat, tile, rule.MeldAnGang)
		g.gangDraw(seat)
	case OpBuGang:
		idx := -1

		for i := range p.Melds {
			if p.Melds[i].Type == rule.MeldPeng && p.Melds[i].Tile == tile {
				idx = i

				break
			}
		}

		if idx < 0 || p.Hand[tile] < 1 {
			return
		}

		p.Hand.Remove(tile)
		p.Melds[idx].Type = rule.MeldBuGang
		g.emit("onActionDone", -1, struct {
			Seat  int    `json:"seat"`
			Type  string `json:"type"`
			Tile  int    `json:"tile"`
			Label string `json:"label"`
		}{Seat: seat, Type: OpBuGang, Tile: tile, Label: "补杠"})

		// 补杠可被抢杠胡
		if g.askRobGang(seat, tile) {
			return
		}

		g.settleGang(seat, tile, rule.MeldBuGang)
		g.gangDraw(seat)
	}
}

// tryResolve 在所有等待者都响应后按优先级裁决。
func (g *Game) tryResolve() {
	for seat := range g.pending {
		if !g.answered[seat] {
			return
		}
	}

	// 优先级：胡 > 杠 > 碰
	huSeats := make([]int, 0, 3)
	gangSeat, gangTile := -1, 0
	pengSeat := -1

	seats := make([]int, 0, len(g.pending))
	for seat := range g.pending {
		seats = append(seats, seat)
	}

	sort.Ints(seats)

	for _, seat := range seats {
		act, ok := g.actions[seat]
		if !ok {
			continue
		}

		switch act.Type {
		case OpHu:
			huSeats = append(huSeats, seat)
		case OpGang:
			if gangSeat < 0 {
				gangSeat, gangTile = seat, act.Tile
			}
		case OpPeng:
			if pengSeat < 0 {
				pengSeat = seat
			}
		}
	}

	g.pending = make(map[int][]Option)
	g.answered = make(map[int]bool)
	g.deadline = 0

	if len(huSeats) > 0 {
		for _, seat := range huSeats {
			g.winHu(seat, g.lastSeat, false, g.lastTile, false)
		}

		g.continueAfterHu(g.lastSeat)

		return
	}

	if gangSeat >= 0 {
		g.doMingGang(gangSeat, gangTile)

		return
	}

	if pengSeat >= 0 {
		g.doPeng(pengSeat)

		return
	}

	g.nextTurn(g.lastSeat)
}

func (g *Game) doPeng(seat int) {
	p := g.Players[seat]
	p.Hand.Remove(g.lastTile)
	p.Hand.Remove(g.lastTile)
	p.Melds = append(p.Melds, rule.Meld{Type: rule.MeldPeng, Tile: g.lastTile, From: g.lastSeat})

	g.emit("onActionDone", -1, struct {
		Seat  int    `json:"seat"`
		Type  string `json:"type"`
		Tile  int    `json:"tile"`
		Label string `json:"label"`
	}{Seat: seat, Type: OpPeng, Tile: g.lastTile, Label: "碰"})

	g.Turn = seat
	g.drawn = 0
	g.askDiscard(seat)
}

func (g *Game) doMingGang(seat, tile int) {
	p := g.Players[seat]

	for i := 0; i < 3; i++ {
		p.Hand.Remove(tile)
	}

	p.Melds = append(p.Melds, rule.Meld{Type: rule.MeldMingGang, Tile: tile, From: g.lastSeat})
	g.emit("onActionDone", -1, struct {
		Seat  int    `json:"seat"`
		Type  string `json:"type"`
		Tile  int    `json:"tile"`
		Label string `json:"label"`
	}{Seat: seat, Type: OpGang, Tile: tile, Label: "杠"})

	g.settleGang(seat, tile, rule.MeldMingGang)
	g.Turn = seat
	g.gangDraw(seat)
}

// gangDraw 杠后补牌：从牌墙尾部摸一张，再进入出牌判定。
func (g *Game) gangDraw(seat int) {
	total := len(g.Wall)
	idx := total - 1 - g.Tail

	if idx <= g.Pos {
		g.nextTurn(seat)

		return
	}

	tile := g.Wall[idx]
	g.Tail++

	p := g.Players[seat]
	p.Hand.Add(tile)
	g.drawn = tile
	g.gangFlag = true
	g.afterGang = seat
	g.needDiscard = true

	g.emit("onDraw", seat, struct {
		Seat   int  `json:"seat"`
		Tile   int  `json:"tile"`
		Remain int  `json:"remain"`
		Gang   bool `json:"gang"`
	}{Seat: seat, Tile: tile, Remain: g.remain(), Gang: true})

	g.askDiscard(seat)
}

// askRobGang 补杠时检查其他家能否抢杠胡，返回是否进入等待。
func (g *Game) askRobGang(seat, tile int) bool {
	g.pending = make(map[int][]Option)
	g.answered = make(map[int]bool)
	g.actions = make(map[int]Option)

	for _, p := range g.Players {
		if p.Seat == seat || p.Finished {
			continue
		}

		probe := p.Hand.Clone()
		probe.Add(tile)

		if rule.CanWin(probe, len(p.Melds)) {
			g.pending[p.Seat] = []Option{{Type: OpHu, Tile: tile, Desc: "抢杠胡"}}
			g.answered[p.Seat] = false
		}
	}

	if len(g.pending) == 0 {
		return false
	}

	g.lastTile = tile
	g.lastSeat = seat
	g.deadline = time.Now().Add(10 * time.Second).UnixMilli()

	for s, opts := range g.pending {
		g.emit("onAsk", s, struct {
			Seat     int      `json:"seat"`
			Tile     int      `json:"tile"`
			From     int      `json:"from"`
			Options  []Option `json:"options"`
			Deadline int64    `json:"deadline"`
		}{Seat: s, Tile: tile, From: seat, Options: opts, Deadline: g.deadline})
	}

	return true
}

// nextTurn 轮到下一个未胡的座位摸牌。
func (g *Game) nextTurn(fromSeat int) {
	if g.remain() <= 0 {
		g.endDraw()

		return
	}

	next := fromSeat

	for i := 0; i < len(g.Players); i++ {
		next = (next + 1) % len(g.Players)

		if !g.Players[next].Finished {
			break
		}
	}

	if g.Players[next].Finished {
		g.endDraw()

		return
	}

	g.Turn = next
	g.needDiscard = false
	g.drawn = 0
	g.gangFlag = false

	tile := g.Wall[g.Pos]
	g.Pos++

	g.Players[next].Hand.Add(tile)
	g.drawn = tile

	g.emit("onDraw", next, struct {
		Seat   int  `json:"seat"`
		Tile   int  `json:"tile"`
		Remain int  `json:"remain"`
		Gang   bool `json:"gang"`
	}{Seat: next, Tile: tile, Remain: g.remain(), Gang: false})

	g.askDiscard(next)
}

// Timeout 超时托管：自动过或自动出牌。
func (g *Game) Timeout(seat int) {
	if g.Phase != PhasePlay {
		return
	}

	if opts, ok := g.pending[seat]; ok && !g.answered[seat] && seat != g.Turn {
		for _, o := range opts {
			if o.Type == OpHu {
				g.Action(seat, OpHu, o.Tile)

				return
			}
		}

		g.Action(seat, OpPass, 0)

		return
	}

	if seat == g.Turn && g.needDiscard {
		g.AutoDiscard(seat)
	}
}

// AutoDiscard 自动出牌：优先打缺门，其次打最孤立的牌。
func (g *Game) AutoDiscard(seat int) {
	p := g.Players[seat]
	tile := g.suggestDiscard(p)

	if tile == 0 {
		return
	}

	g.Discard(seat, tile)
}

func (g *Game) suggestDiscard(p *Player) int {
	best, bestScore := 0, 1<<30

	for t := rule.TileMin; t <= rule.TileMax; t++ {
		if p.Hand[t] == 0 {
			continue
		}

		score := g.tileValue(p, t)
		if score < bestScore {
			best, bestScore = t, score
		}
	}

	return best
}

// tileValue 越小越该打：孤张、边张价值低。
func (g *Game) tileValue(p *Player, t int) int {
	score := 0
	r := rule.Rank(t)

	score += p.Hand[t] * 12

	if p.Hand[t-1] > 0 && rule.Suit(t-1) == rule.Suit(t) {
		score += 10
	}

	if t+1 <= rule.TileMax && p.Hand[t+1] > 0 && rule.Suit(t+1) == rule.Suit(t) {
		score += 10
	}

	if t+2 <= rule.TileMax && rule.Suit(t+2) == rule.Suit(t) && p.Hand[t+2] > 0 {
		score += 5
	}

	if t-2 >= rule.TileMin && rule.Suit(t-2) == rule.Suit(t) && p.Hand[t-2] > 0 {
		score += 5
	}

	if r >= 3 && r <= 7 {
		score += 3
	}

	return score
}

// Decider 返回当前必须做决策的座位，-1 表示无人等待。
func (g *Game) Decider() int {
	for _, p := range g.Players {
		if _, ok := g.pending[p.Seat]; ok && !g.answered[p.Seat] && p.Seat != g.Turn {
			return p.Seat
		}
	}

	if g.needDiscard {
		return g.Turn
	}

	return -1
}

// NeedsAction 判断某座位此刻是否在等待操作，用于机器人驱动与超时检测。
func (g *Game) NeedsAction(seat int) bool {
	if seat < 0 || seat >= len(g.Players) {
		return false
	}

	if _, ok := g.pending[seat]; ok && !g.answered[seat] && seat != g.Turn {
		return true
	}

	return seat == g.Turn && g.needDiscard
}

// activeSeats 返回未胡的座位。
func (g *Game) activeSeats() []int {
	out := make([]int, 0, 4)

	for _, p := range g.Players {
		if !p.Finished {
			out = append(out, p.Seat)
		}
	}

	return out
}

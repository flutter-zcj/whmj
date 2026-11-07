package game

import (
	"github.com/zbcx/whmj/internal/rule"
)

// 结算条目类型，客户端按类型取图标。
const (
	SettleHu       = 1 // 胡牌得分
	SettlePaid     = 2 // 点炮失分
	SettleMingGang = 3 // 刮风（明杠）
	SettleAnGang   = 4 // 下雨（暗杠）
	SettleBuGang   = 5 // 补杠
	SettleDaJiao   = 6 // 查大叫
	SettleHuaZhu   = 7 // 查花猪
	SettleTuiShui  = 8 // 退税
)

// SettleItem 一条结算明细。
type SettleItem struct {
	Seat   int    `json:"seat"`
	Kind   int    `json:"kind"`
	Amount int    `json:"amount"`
	Desc   string `json:"desc"`
	Peer   int    `json:"peer"`
}

// ServerPlayer 结算面板用的玩家快照。
type ServerPlayer struct {
	Seat   int            `json:"seat"`
	UID    int64          `json:"uid"`
	Nick   string         `json:"nick"`
	Avatar string         `json:"avatar"`
	Score  int            `json:"score"`
	Ting   bool           `json:"ting"`
	Hu     bool           `json:"hu"`
	Fans   []rule.FanItem `json:"fans"`
	Hand   []int          `json:"hand"`
}

// winHu 处理一次胡牌并按武汉规则结算：一炮单响，三家都输点。
func (g *Game) winHu(seat, loseSeat int, selfDraw bool, tile int, cont bool) {
	if seat < 0 || seat >= len(g.Players) {
		return
	}

	p := g.Players[seat]
	if p.Finished {
		return
	}

	probe := p.Hand.Clone()

	if selfDraw {
		if probe[tile] == 0 {
			return
		}
	} else {
		probe.Add(tile)
	}

	opt := rule.WinOptions{
		SelfDraw:  selfDraw,
		GangShang: g.gangFlag && g.afterGang == seat,
		QiangGang: !selfDraw && g.lastSeat == loseSeat && g.gangFlag,
		HaiDi:     g.remain() <= 0,
	}

	fans, ok := g.canHu(p, probe, opt)
	if !ok {
		return
	}

	score := rule.Score(g.Cfg.Base, fans.Total, g.Cfg.Cap)

	fullHand := probe.Tiles()
	if !selfDraw {
		fullHand = append(fullHand, tile)
	}

	info := &HuInfo{
		Seat:     seat,
		LoseSeat: loseSeat,
		SelfDraw: selfDraw,
		Tile:     tile,
		Fans:     fans.Items,
		Fan:      fans.Total,
		Score:    score,
		Hand:     fullHand,
		Melds:    append([]rule.Meld{}, p.Melds...),
	}

	p.Finished = true
	p.Ting = true
	p.Hu = info

	if selfDraw {
		p.Hand.Remove(tile)
	}

	// 一炮单响：自摸三家各付；点炮放冲者付双份，其余两家各付一份，
	// 体现武汉麻将「没放冲的玩家也要输点」。
	for _, other := range g.Players {
		if other.Seat == seat || other.Finished {
			continue
		}

		pay := score
		if !selfDraw && other.Seat == loseSeat {
			pay = score * 2
		}

		other.Score -= pay
		p.Score += pay

		g.emitDetail(other.Seat, SettlePaid, -pay, "输分", seat)
	}

	desc := "自摸"
	if !selfDraw {
		desc = "胡牌"
	}

	g.emitDetail(seat, SettleHu, p.Hu.Score, desc, loseSeat)

	g.emit("onHu", -1, info)
	g.pending = make(map[int][]Option)
	g.answered = make(map[int]bool)
	g.actions = make(map[int]Option)
	g.deadline = 0
	g.firstTurn = false

	// 武汉麻将一炮单响、胡牌即本局结束，不再继续打。
	if !cont {
		g.endGame(seat)

		return
	}

	from := loseSeat
	if selfDraw {
		from = seat
	}

	g.continueAfterHu(from)
}

func (g *Game) othersActive(seat int) []*Player {
	out := make([]*Player, 0, 3)

	for _, p := range g.Players {
		if p.Seat != seat && !p.Finished {
			out = append(out, p)
		}
	}

	return out
}

func (g *Game) continueAfterHu(from int) {
	active := 0
	last := -1

	for _, p := range g.Players {
		if !p.Finished {
			active++
			last = p.Seat
		}
	}

	if active <= 1 {
		g.endGame(last)

		return
	}

	if g.remain() <= 0 {
		g.endDraw()

		return
	}

	g.nextTurn(from)
}

// settleGang 记录杠牌次数。武汉麻将的杠不算即时输赢，只在胡牌番数里体现。
func (g *Game) settleGang(seat, tile int, kind rule.MeldType) {
	p := g.Players[seat]
	if p.Gangs == nil {
		p.Gangs = make(map[string]int)
	}

	switch kind {
	case rule.MeldMingGang:
		p.Gangs[rule.FanMingGang]++
	case rule.MeldAnGang:
		p.Gangs[rule.FanAnGang]++
	case rule.MeldBuGang:
		p.Gangs[rule.FanMingGang]++
	}

	g.emitDetail(seat, SettleMingGang, 0, "杠", seat)
}

// settleSpecialGang 记录红中杠、皮子杠、赖子杠，同样只计番。
func (g *Game) settleSpecialGang(seat int, label string) {
	p := g.Players[seat]
	if p.Gangs == nil {
		p.Gangs = make(map[string]int)
	}

	switch label {
	case "红中杠":
		p.Gangs[rule.FanZhongGang]++
	case "皮子杠":
		p.Gangs[rule.FanPiZiGang]++
	case "赖子杠":
		p.Gangs[rule.FanLaiZiGang]++
	}

	g.emitDetail(seat, SettleMingGang, 0, label, seat)
}

func (g *Game) emitDetail(seat, kind, amount int, desc string, peer int) {
	g.emit("onScore", seat, SettleItem{Seat: seat, Kind: kind, Amount: amount, Desc: desc, Peer: peer})
}

// endDraw 牌墙摸完，流局结算：查花猪、查大叫、退税。
func (g *Game) endDraw() {
	g.endGame(-1)
}

// endGame 结束本局并下发结算面板数据。
func (g *Game) endGame(lastSeat int) {
	if g.over {
		return
	}

	if g.Phase != PhaseOver {
		g.finalSettle()
	}

	g.Phase = PhaseOver
	g.over = true
	g.pending = make(map[int][]Option)
	g.deadline = 0

	snap := make([]ServerPlayer, 0, len(g.Players))

	for _, p := range g.Players {
		sp := ServerPlayer{
			Seat:   p.Seat,
			UID:    p.UID,
			Nick:   p.Nick,
			Avatar: p.Avatar,
			Score:  p.Score,
			Ting:   p.Ting,
			Hu:     p.Finished,
			Hand:   p.Hand.Tiles(),
		}

		if p.Hu != nil {
			sp.Fans = p.Hu.Fans
		}

		snap = append(snap, sp)
	}

	g.emit("onGameOver", -1, struct {
		Players []ServerPlayer `json:"players"`
		Last    int            `json:"last"`
	}{Players: snap, Last: lastSeat})
}

// finalSettle 终局时刷新听牌状态。武汉麻将流局不赔付，只记录听牌供面板展示。
func (g *Game) finalSettle() {
	for _, p := range g.Players {
		if p.Finished {
			continue
		}

		p.Ting = rule.IsTing(p.Hand, len(p.Melds), g.Round)
	}
}

func (g *Game) maxFanAmongActive() int {
	best := 0

	for _, p := range g.Players {
		if p.Finished {
			continue
		}

		if fan := rule.MaxTingFan(p.Hand, p.Melds, g.Round); fan > best {
			best = fan
		}
	}

	if best == 0 {
		best = 1
	}

	return best
}

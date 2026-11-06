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
}

// winHu 处理一次胡牌并按血战规则即时结算。
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

	if !rule.CanWin(probe, len(p.Melds)) {
		return
	}

	opt := rule.WinOptions{
		SelfDraw:  selfDraw,
		GangShang: g.gangFlag && g.afterGang == seat,
		QiangGang: !selfDraw && g.lastSeat == loseSeat && g.gangFlag,
		HaiDi:     g.remain() <= 0,
		TianHu:    selfDraw && g.firstTurn && seat == g.Dealer,
		DiHu:      selfDraw && g.firstTurn && !p.IsBanker,
	}

	fans := rule.CalcFan(probe, p.Melds, tile, opt)
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
		g.Players[seat].Hand.Remove(tile)

		for _, other := range g.Players {
			if other.Seat == seat || other.Finished {
				continue
			}

			other.Score -= score
			p.Score += score
		}

		g.emitDetail(seat, SettleHu, score*len(g.othersActive(seat)), "自摸", seat)
	} else {
		if loseSeat >= 0 && loseSeat < len(g.Players) {
			g.Players[loseSeat].Score -= score
			p.Score += score
			g.emitDetail(seat, SettleHu, score, "胡牌", loseSeat)
			g.emitDetail(loseSeat, SettlePaid, -score, "点炮", seat)
		}
	}

	g.emit("onHu", -1, info)
	g.pending = make(map[int][]Option)
	g.answered = make(map[int]bool)
	g.actions = make(map[int]Option)
	g.deadline = 0
	g.firstTurn = false

	if !cont {
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

// settleGang 结算杠分：明杠由放杠者付，暗杠与补杠由其余未胡玩家各付。
func (g *Game) settleGang(seat, tile int, kind rule.MeldType) {
	amount := 0
	kindCode := SettleMingGang
	desc := "明杠"

	switch kind {
	case rule.MeldMingGang:
		amount = 2 * g.Cfg.Base
		kindCode = SettleMingGang
		desc = "刮风"
	case rule.MeldAnGang:
		amount = 2 * g.Cfg.Base
		kindCode = SettleAnGang
		desc = "下雨"
	case rule.MeldBuGang:
		amount = 1 * g.Cfg.Base
		kindCode = SettleBuGang
		desc = "补杠"
	}

	p := g.Players[seat]

	if kind == rule.MeldMingGang {
		from := g.lastSeat
		if from < 0 || from >= len(g.Players) || from == seat {
			return
		}

		g.Players[from].Score -= amount
		p.Score += amount
		p.GangGain += amount

		g.gangs = append(g.gangs, GangRecord{From: from, To: seat, Amount: amount, Kind: kindCode})
		g.emitDetail(seat, kindCode, amount, desc, from)
		g.emitDetail(from, kindCode, -amount, desc, seat)

		return
	}

	for _, other := range g.othersActive(seat) {
		other.Score -= amount
		p.Score += amount
		p.GangGain += amount

		g.gangs = append(g.gangs, GangRecord{From: other.Seat, To: seat, Amount: amount, Kind: kindCode})
		g.emitDetail(other.Seat, kindCode, -amount, desc, seat)
	}

	g.emitDetail(seat, kindCode, amount*len(g.othersActive(seat)), desc, seat)
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

// finalSettle 流局与终局共用的查叫、查花猪、退税。
func (g *Game) finalSettle() {
	// 先在结束瞬间刷新听牌状态
	for _, p := range g.Players {
		if p.Finished {
			continue
		}

		p.Ting = rule.IsTing(p.Hand, len(p.Melds))
	}

	// 查大叫：未听牌者向每个听牌者赔付对方的最大番
	for _, p := range g.Players {
		if p.Finished || p.Ting {
			continue
		}

		for _, tp := range g.Players {
			if tp.Seat == p.Seat || !tp.Ting || tp.Finished {
				continue
			}

			fan := rule.MaxTingFan(tp.Hand, tp.Melds)
			pay := rule.Score(g.Cfg.Base, fan, g.Cfg.Cap)
			if pay <= 0 {
				continue
			}

			p.Score -= pay
			tp.Score += pay
			g.emitDetail(p.Seat, SettleDaJiao, -pay, "查大叫", tp.Seat)
			g.emitDetail(tp.Seat, SettleDaJiao, pay, "查大叫", p.Seat)
		}
	}

	// 退税：未胡且未听牌者退还此前收到的杠分
	for _, rec := range g.gangs {
		to := g.Players[rec.To]
		if to.Finished || to.Ting {
			continue
		}

		to.Score -= rec.Amount
		to.GangGain -= rec.Amount
		g.Players[rec.From].Score += rec.Amount
		g.emitDetail(to.Seat, SettleTuiShui, -rec.Amount, "退税", rec.From)
		g.emitDetail(rec.From, SettleTuiShui, rec.Amount, "退税", to.Seat)
	}
}

func (g *Game) maxFanAmongActive() int {
	best := 0

	for _, p := range g.Players {
		if p.Finished {
			continue
		}

		if fan := rule.MaxTingFan(p.Hand, p.Melds); fan > best {
			best = fan
		}
	}

	if best == 0 {
		best = 1
	}

	return best
}

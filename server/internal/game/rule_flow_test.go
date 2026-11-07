package game

import (
	"math/rand"
	"testing"

	"github.com/zbcx/whmj/internal/rule"
)

// newFlowGame 造一局可控牌局：清空手牌后由用例自行摆牌。
func newFlowGame(t *testing.T) *Game {
	t.Helper()

	players := make([]*Player, 4)

	for i := 0; i < 4; i++ {
		players[i] = &Player{Seat: i, UID: int64(i + 1), Nick: "p", Auto: true}
	}

	g := New(DefaultConfig(), rand.New(rand.NewSource(11)), players, 0)
	g.Start(1)

	for _, p := range g.Players {
		p.Hand = rule.Counts{}
		p.Melds = nil
		p.Discards = nil
	}

	g.Round = rule.Round{PiZi: 27, LaiZi: 20}
	g.Turn = 0
	g.needDiscard = true

	return g
}

// TestChiFlow 校验下家可以吃上家的弃牌，并记为一次开口。
func TestChiFlow(t *testing.T) {
	g := newFlowGame(t)

	g.Players[0].Hand.Add(3)
	g.Players[1].Hand.Add(1)
	g.Players[1].Hand.Add(2)

	g.Discard(0, 3)

	opts, ok := g.pending[1]
	if !ok {
		t.Fatal("下家应当收到吃的选项")
	}

	found := false

	for _, o := range opts {
		if o.Type == OpChi && o.Tile == 1 {
			found = true
		}
	}

	if !found {
		t.Fatalf("应给出吃 123 的选项，实际 %+v", opts)
	}

	g.Action(1, OpChi, 1)

	if g.Players[1].Opened != 1 {
		t.Fatalf("吃之后开口次数应为 1，实际 %d", g.Players[1].Opened)
	}

	if len(g.Players[1].Melds) != 1 || g.Players[1].Melds[0].Type != rule.MeldChi {
		t.Fatalf("应亮出一副吃，实际 %+v", g.Players[1].Melds)
	}

	if g.Players[1].Hand.Total() != 0 {
		t.Fatalf("吃后手牌应清空，实际 %d", g.Players[1].Hand.Total())
	}
}

// TestChiThenDiscard 校验吃牌之后还能正常打出剩下的牌。
//
// 客户端点「吃」之后服务器会吃掉手上两张，若这两张算错，玩家就会出现
// 「选了牌却打不出去」的现象，这里用手上留着一张被吃点数的情况盯住它。
func TestChiThenDiscard(t *testing.T) {
	g := newFlowGame(t)
	p := g.Players[1]

	p.Hand.Add(2)
	p.Hand.Add(3)
	p.Hand.Add(4)

	g.Players[0].Hand.Add(3)

	if !g.Discard(0, 3) {
		t.Fatal("庄家应当能打出三万")
	}

	if !g.Action(1, OpChi, 2) {
		t.Fatal("下家应当能吃 2-3-4")
	}

	if p.Hand[3] != 1 {
		t.Fatalf("手里那张三万应该留着，实际 %d 张", p.Hand[3])
	}

	if p.Hand.Total() != 1 {
		t.Fatalf("吃后手牌应只剩一张，实际 %d", p.Hand.Total())
	}

	if g.Turn != 1 || !g.needDiscard {
		t.Fatalf("吃后应轮到下家出牌，turn=%d needDiscard=%v", g.Turn, g.needDiscard)
	}

	if !g.Discard(1, 3) {
		t.Fatal("吃牌之后应当能打出剩下的牌")
	}

	if p.Discards[len(p.Discards)-1] != 3 {
		t.Fatalf("弃牌区应记下这张三万，实际 %+v", p.Discards)
	}
}

// TestChiWithoutTiles 校验缺张的吃不会把手牌改坏。
func TestChiWithoutTiles(t *testing.T) {
	g := newFlowGame(t)
	p := g.Players[1]

	p.Hand.Add(2)
	before := p.Hand.Total()

	if g.doChi(1, 1) {
		t.Fatal("缺一万与三万时不该吃成功")
	}

	if p.Hand.Total() != before || len(p.Melds) != 0 {
		t.Fatalf("失败的吃不能动到手牌，手牌 %d，面子 %+v", p.Hand.Total(), p.Melds)
	}
}

// TestNoOpenNoHu 校验未开口不能胡牌。
func TestNoOpenNoHu(t *testing.T) {
	g := newFlowGame(t)

	// 四副面子 + 将，结构完整但未开口。
	for _, tile := range []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 14} {
		g.Players[2].Hand.Add(tile)
	}

	if _, ok := g.canHu(g.Players[2], g.Players[2].Hand, rule.WinOptions{SelfDraw: true}); ok {
		t.Fatal("未开口不应允许胡牌")
	}

	g.Players[2].Opened = 1

	if _, ok := g.canHu(g.Players[2], g.Players[2].Hand, rule.WinOptions{SelfDraw: true}); !ok {
		t.Fatal("开口后应当可以胡牌")
	}
}

// TestPiZiNoHu 校验手上留皮子不能胡。
func TestPiZiNoHu(t *testing.T) {
	g := newFlowGame(t)
	p := g.Players[2]
	p.Opened = 1

	for _, tile := range []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 27} {
		p.Hand.Add(tile)
	}

	if _, ok := g.canHu(p, p.Hand, rule.WinOptions{SelfDraw: true}); ok {
		t.Fatal("留皮子不应允许胡牌")
	}
}

// TestSpecialGang 校验红中可以单张杠出去，且不算开口。
func TestSpecialGang(t *testing.T) {
	g := newFlowGame(t)
	p := g.Players[0]

	p.Hand.Add(rule.Zhong)
	p.Hand.Add(5)

	g.askDiscard(0)

	found := false

	for _, o := range g.pending[0] {
		if o.Type == OpGang && o.Tile == rule.Zhong {
			found = true
		}
	}

	if !found {
		t.Fatalf("手上有红中时应给出杠选项，实际 %+v", g.pending[0])
	}

	g.Action(0, OpGang, rule.Zhong)

	if len(p.Extras) != 1 {
		t.Fatalf("红中杠后应记录一条特殊杠，实际 %+v", p.Extras)
	}

	if p.Opened != 0 {
		t.Fatalf("红中杠不算开口，实际开口 %d", p.Opened)
	}
}

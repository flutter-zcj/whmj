package rule

import "testing"

// hand 用牌 id 列表构造计数。
func hand(tiles ...int) Counts {
	var c Counts

	for _, t := range tiles {
		c.Add(t)
	}

	return c
}

// noRound 无皮无赖的一局，用于纯结构判定。
var noRound = Round{}

func TestAnalyzeWinStandard(t *testing.T) {
	cases := []struct {
		name  string
		c     Counts
		melds int
		r     Round
		want  bool
	}{
		{"二五八将成胡", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 14), 0, noRound, true},
		{"将牌非二五八", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13), 0, noRound, true},
		{"七对不成立", hand(1, 1, 2, 2, 3, 3, 10, 10, 11, 11, 19, 19, 20, 20), 0, noRound, false},
		{"带一副碰", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 14), 1, noRound, true},
		{"带两副碰", hand(1, 2, 3, 5, 6, 7, 14, 14), 2, noRound, true},
		{"张数不符", hand(1, 2, 3, 14, 14), 1, noRound, false},
		{"跨花色不算顺", hand(1, 8, 9, 5, 5, 5, 10, 10, 10, 19, 19, 19, 14, 14), 0, noRound, false},
	}

	for _, tc := range cases {
		if _, got := AnalyzeWin(tc.c, make([]Meld, tc.melds), tc.r); got != tc.want {
			t.Fatalf("%s: AnalyzeWin = %v, want %v", tc.name, got, tc.want)
		}
	}
}

// TestPairIs258 校验将牌点数标记，小胡靠它拦非 258 将。
func TestPairIs258(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13)
	shape, ok := AnalyzeWin(c, nil, noRound)

	if !ok {
		t.Fatal("结构上应当成立")
	}

	if shape.Pair != 13 || shape.PairIs258 {
		t.Fatalf("将牌应为 4 筒且非 258，实际 pair=%d is258=%v", shape.Pair, shape.PairIs258)
	}
}

// TestPiZiBlocksWin 校验手上留皮子不能胡。
func TestPiZiBlocksWin(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 14)
	r := Round{PiZi: 14, LaiZi: 15}

	if _, ok := AnalyzeWin(c, nil, r); ok {
		t.Fatal("手上有皮子时不应成胡")
	}

	if !HasPiZi(c, nil, r) {
		t.Fatal("应识别出手牌中的皮子")
	}
}

// TestZhongBlocksWin 校验手上留红中不能胡。
func TestZhongBlocksWin(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 28)

	if _, ok := AnalyzeWin(c, nil, noRound); ok {
		t.Fatal("手上有红中时不应成胡")
	}
}

// TestLaiZiFill 校验赖子可补任意缺张。
func TestLaiZiFill(t *testing.T) {
	r := Round{PiZi: 13, LaiZi: 14}

	// 123 456 789 万 + 1 筒 2 筒 + 3 筒对将，赖子（5 筒）补成 123 筒中的 3 筒。
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 14)

	shape, ok := AnalyzeWin(c, nil, r)
	if !ok {
		t.Fatal("赖子应能补成顺子")
	}

	if shape.LaiziUsed != 1 {
		t.Fatalf("应消耗 1 张赖子，实际 %d", shape.LaiziUsed)
	}
}

// TestQingYiSe 校验清一色判定。
func TestQingYiSe(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 9, 9)
	shape, ok := AnalyzeWin(c, nil, noRound)

	if !ok || !shape.QingYiSe {
		t.Fatalf("应命中清一色，ok=%v shape=%+v", ok, shape)
	}
}

// TestJiangYiSe 校验将一色判定。
func TestJiangYiSe(t *testing.T) {
	c := hand(2, 2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 14, 14)
	shape, ok := AnalyzeWin(c, nil, noRound)

	if !ok || !shape.JiangYiSe || !shape.PengPeng {
		t.Fatalf("应同时命中将一色与碰碰胡，ok=%v shape=%+v", ok, shape)
	}
}

// TestCanChi 校验吃的组合枚举。
func TestCanChi(t *testing.T) {
	c := hand(1, 2, 4, 5)

	got := CanChi(c, 3, noRound)
	if len(got) != 3 {
		t.Fatalf("3 万应有三组吃法，实际 %v", got)
	}

	if got := CanChi(hand(1, 2), 3, noRound); len(got) != 1 || got[0] != 1 {
		t.Fatalf("仅 1、2 万时应只能吃 123，实际 %v", got)
	}

	if got := CanChi(hand(1, 2), 28, noRound); len(got) != 0 {
		t.Fatalf("红中不能吃，实际 %v", got)
	}

	r := Round{LaiZi: 3}
	if got := CanChi(hand(1, 2), 3, r); len(got) != 0 {
		t.Fatal("赖子不能吃")
	}
}

// TestCalcFanPiHu 校验屁胡番型与硬胡标记。
func TestCalcFanPiHu(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 14)
	res := CalcFan(c, nil, noRound, WinOptions{SelfDraw: true, Opened: 1})

	if !res.Hard {
		t.Fatal("没有赖子应算硬胡")
	}

	if res.Big {
		t.Fatal("屁胡不应算大胡")
	}

	if res.Total < 3 {
		t.Fatalf("自摸 + 开口 + 硬胡 至少 3 番，实际 %d", res.Total)
	}
}

// TestScoreCap 校验封顶换算。
func TestScoreCap(t *testing.T) {
	if got := Score(1, 2, 6); got != 4 {
		t.Fatalf("底分1 2番 应为 4，实际 %d", got)
	}

	if got := Score(1, 9, 6); got != 64 {
		t.Fatalf("封顶6番 应为 64，实际 %d", got)
	}
}

// TestTingList 校验听牌列表不含皮子与赖子。
func TestTingList(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14)
	r := Round{PiZi: 13, LaiZi: 14}

	got := TingList(c, 0, r)

	for _, t2 := range got {
		if r.IsLaiZi(t2) || r.IsPiZi(t2) {
			t.Fatalf("听牌列表不应包含皮子或赖子：%v", got)
		}
	}

	if !IsTing(c, 0, r) {
		t.Fatal("应判定为已听牌")
	}
}

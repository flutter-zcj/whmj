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

func TestCanWinStandard(t *testing.T) {
	cases := []struct {
		name  string
		c     Counts
		melds int
		want  bool
	}{
		{"四面子一将", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 14), 0, true},
		{"缺将不成胡", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15), 0, false},
		{"七对成立", hand(1, 1, 2, 2, 3, 3, 10, 10, 11, 11, 19, 19, 20, 20), 0, true},
		{"龙七对成立", hand(1, 1, 1, 1, 2, 2, 3, 3, 10, 10, 19, 19, 20, 20), 0, true},
		{"带一副碰", hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 14), 1, true},
		{"带两副碰", hand(1, 2, 3, 5, 6, 7, 14, 14), 2, true},
		{"张数不符", hand(1, 2, 3, 14, 14), 1, false},
		{"跨花色不算顺", hand(1, 8, 9, 5, 5, 5, 10, 10, 10, 19, 19, 19, 14, 14), 0, false},
	}

	for _, tc := range cases {
		if got := CanWin(tc.c, tc.melds); got != tc.want {
			t.Fatalf("%s: CanWin = %v, want %v", tc.name, got, tc.want)
		}
	}
}

func TestTingList(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14)
	got := TingList(c, 0)

	// 红中为赖子，摸到红中同样可以成胡，因此听牌列表含 14 与 28。
	if len(got) != 2 || got[0] != 14 || got[1] != 28 {
		t.Fatalf("单钓 5 筒听牌应为 [14 28]，实际 %v", got)
	}

	if !IsTing(c, 0) {
		t.Fatal("应判定为已听牌")
	}
}

func TestCalcFanPureSuit(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 9, 9)
	res := CalcFan(c, nil, 9, WinOptions{SelfDraw: true})

	found := false

	for _, it := range res.Items {
		if it.Name == FanQingYiSe {
			found = true
		}
	}

	if !found {
		t.Fatalf("应命中清一色，实际 %+v", res.Items)
	}
}

func TestCalcFanPengPengHu(t *testing.T) {
	c := hand(1, 1, 1, 10, 10, 10, 19, 19, 19, 4, 4, 4, 14, 14)
	res := CalcFan(c, nil, 14, WinOptions{})

	found := false

	for _, it := range res.Items {
		if it.Name == FanPengPengHu {
			found = true
		}
	}

	if !found {
		t.Fatalf("应命中碰碰胡，实际 %+v", res.Items)
	}
}

func TestCalcFanDaiYaoJiu(t *testing.T) {
	c := hand(1, 2, 3, 7, 8, 9, 10, 10, 10, 18, 18, 18, 19, 19)
	res := CalcFan(c, nil, 19, WinOptions{})

	found := false

	for _, it := range res.Items {
		if it.Name == FanDaiYaoJiu {
			found = true
		}
	}

	if !found {
		t.Fatalf("应命中带幺九，实际 %+v", res.Items)
	}
}

func TestScoreCap(t *testing.T) {
	if got := Score(1, 2, 4); got != 4 {
		t.Fatalf("底分1 2番 应为 4，实际 %d", got)
	}

	if got := Score(1, 9, 4); got != 16 {
		t.Fatalf("封顶4番 应为 16，实际 %d", got)
	}
}

func TestMaxTingFan(t *testing.T) {
	c := hand(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14)

	if fan := MaxTingFan(c, nil); fan < 0 {
		t.Fatalf("听牌最大番不应为负：%d", fan)
	}
}

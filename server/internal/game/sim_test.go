package game

import (
	"testing"
)

// TestSingleHuPerRound 校验一炮单响：每局至多一家胡牌，且胡牌者必有正收益。
func TestSingleHuPerRound(t *testing.T) {
	huCount := map[int]int{}
	draw := 0

	for seed := int64(1); seed <= 120; seed++ {
		g := newTestGame(seed)
		g.Start(1)
		runBotGame(t, g, seed)

		hus := 0

		for _, p := range g.Players {
			if p.Hu != nil {
				hus++
				huCount[p.Seat]++

				if p.Score <= 0 {
					t.Fatalf("seed %d 胡牌者分数应为正：seat=%d score=%d fan=%d", seed, p.Seat, p.Score, p.Hu.Fan)
				}
			}
		}

		if hus > 1 {
			t.Fatalf("seed %d 一局出现 %d 家胡牌", seed, hus)
		}

		if hus == 0 {
			draw++
		}
	}

	t.Logf("120 局：流局 %d，座位胡牌分布 %v", draw, huCount)
}

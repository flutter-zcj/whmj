package game

import (
	"math/rand"
	"testing"

	"github.com/zbcx/whmj/internal/rule"
)

// newTestGame 造一局 4 个机器人的牌局。
func newTestGame(seed int64) *Game {
	players := make([]*Player, 4)

	for i := 0; i < 4; i++ {
		players[i] = &Player{
			Seat: i,
			UID:  int64(i + 1),
			Nick: "bot",
			Auto: true,
		}
	}

	rng := rand.New(rand.NewSource(seed))

	return New(DefaultConfig(), rng, players, int(seed%4))
}

// TestGameZeroSum 跑完整牌局并校验零和。
func TestGameZeroSum(t *testing.T) {
	for seed := int64(1); seed <= 200; seed++ {
		g := newTestGame(seed)
		g.Start(1)
		runBotGame(t, g, seed)
	}
}

func runBotGame(t *testing.T, g *Game, seed int64) {
	t.Helper()

	if g.Phase != PhasePlay {
		t.Fatalf("seed %d: 未进入出牌阶段，phase=%s", seed, g.Phase)
	}

	steps := 0

	for !g.Over() {
		steps++
		if steps > 2000 {
			t.Fatalf("seed %d: 牌局未收敛（死循环）", seed)
		}

		progressed := false

		for _, p := range g.Players {
			if g.Over() {
				break
			}

			if _, waiting := g.pending[p.Seat]; waiting {
				if g.BotStep(p.Seat) {
					progressed = true
				}

				continue
			}

			if p.Seat == g.Turn && g.needDiscard {
				if g.BotStep(p.Seat) {
					progressed = true
				}
			}
		}

		if !progressed {
			t.Fatalf("seed %d: 无任何可推进的动作，phase=%s turn=%d", seed, g.Phase, g.Turn)
		}
	}

	sum := 0

	for _, p := range g.Players {
		sum += p.Score
	}

	if sum != 0 {
		t.Fatalf("seed %d: 结算非零和，合计 %d（各座 %d/%d/%d/%d）",
			seed, sum, g.Players[0].Score, g.Players[1].Score, g.Players[2].Score, g.Players[3].Score)
	}
}

// TestGameDeal 校验发牌张数、庄家标记与牌墙余量。
func TestGameDeal(t *testing.T) {
	g := newTestGame(7)
	g.Start(1)

	total := 0

	for _, p := range g.Players {
		total += p.Hand.Total()
	}

	if total != 53 {
		t.Fatalf("发牌总数应为 53（13×4+庄家多摸 1），实际 %d", total)
	}

	if !g.Players[g.Dealer].IsBanker {
		t.Fatal("庄家标记未设置")
	}

	if g.Phase != PhasePlay {
		t.Fatalf("发牌后应直接进入出牌阶段，实际 %s", g.Phase)
	}

	if g.RemainCount() != rule.WallSize-53 {
		t.Fatalf("牌墙余量应为 %d，实际 %d", rule.WallSize-53, g.RemainCount())
	}
}

func boolToInt(b bool) int {
	if b {
		return 1
	}

	return 0
}

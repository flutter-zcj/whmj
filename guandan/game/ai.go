/* ===========================================================
 * 掼蛋 AI 出牌策略（Go 版，与 ai.js 一致）
 *   1. 队友压过的牌不压（不挡对家）
 *   2. 能一次走完手牌 → 立即出
 *   3. 跟牌优先最小可压牌型，保留炸弹
 *   4. 对手手牌 ≤5 张时，可用炸弹拦截
 *   5. 自由出牌优先出多张组合，减少手牌
 * =========================================================== */
package game

// AIChoose 返回要出的牌数组；空数组 = 过牌
func AIChoose(t *GameTable, seat int) []int {
	level := t.LevelOf(seat)
	hand := t.Seats[seat].Hand
	pre := t.LastPattern
	lastSeat := t.LastPlaySeat
	myTeam := t.Seats[seat].Team

	if len(hand) == 0 {
		return []int{}
	}

	// 自由出牌轮（无人压 / 自己压过一圈）不能过牌，必须出
	freeTurn := lastSeat == -1 || lastSeat == seat
	// 队友压过 → 不压（不挡对家）
	if !freeTurn && pre != nil && lastSeat >= 0 && t.Seats[lastSeat].Team == myTeam {
		return []int{}
	}

	hints := HintFind(hand, pre, level)
	if len(hints) == 0 {
		return []int{}
	}

	// 能一次走完 → 出
	for _, h := range hints {
		if len(h.Cards) == len(hand) {
			return h.Cards
		}
	}

	bombs := make([]*Pattern, 0, 4)
	plain := make([]*Pattern, 0, len(hints))
	for _, h := range hints {
		if h.IsBomb {
			bombs = append(bombs, h)
		} else {
			plain = append(plain, h)
		}
	}

	if pre != nil {
		// 跟牌：优先最小可压牌型
		oppLeft := HandCards
		if lastSeat >= 0 {
			oppLeft = len(t.Seats[lastSeat].Hand)
		}
		// 对手快走完 → 炸弹拦截
		if oppLeft <= 5 && len(bombs) > 0 {
			return bombs[0].Cards
		}
		if len(plain) > 0 {
			return plain[0].Cards
		}
		// 只剩炸弹能压：对手剩牌不多才炸
		if len(bombs) > 0 && oppLeft <= 8 {
			return bombs[0].Cards
		}
		return []int{}
	}

	// 自由出牌：优先多张组合，其次对子/三张，最后单张
	for _, p := range plain {
		if len(p.Cards) >= 5 {
			return p.Cards
		}
	}
	for _, p := range plain {
		if len(p.Cards) >= 2 {
			return p.Cards
		}
	}
	if len(plain) > 0 {
		return plain[0].Cards
	}
	return hints[0].Cards
}

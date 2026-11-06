package rule

// CanWin 判断手牌（含红中赖子）在已有 meldCount 个明面子时是否成胡。
//
// 武汉赖子麻将的胡牌结构：
//   - 标准型：4 个面子 + 1 对将（面子可为顺子或刻子）
//   - 七对：7 个对子（仅在无明面子时成立，四张相同算两对，即豪华七对）
//
// 红中为赖子，可替代任意一张序数牌，因此判定时先把红中拆出来当万能牌使用。
func CanWin(c Counts, meldCount int) bool {
	if meldCount < 0 || meldCount > 4 {
		return false
	}

	needMelds := 4 - meldCount
	if c.Total() != needMelds*3+2 {
		return false
	}

	jokers := c[Zhong]

	var rest Counts

	copy(rest[:], c[:])
	rest[Zhong] = 0

	if meldCount == 0 && isSevenPairsJoker(rest, jokers) {
		return true
	}

	for t := TileMin; t <= TileKinds; t++ {
		if rest[t] < 2 {
			continue
		}

		rest[t] -= 2
		ok := canFormMeldsJoker(&rest, needMelds, jokers)
		rest[t] += 2

		if ok {
			return true
		}
	}

	if jokers >= 2 && canFormMeldsJoker(&rest, needMelds, jokers-2) {
		return true
	}

	if jokers >= 1 {
		for t := TileMin; t <= TileKinds; t++ {
			if rest[t] < 1 {
				continue
			}

			rest[t]--
			ok := canFormMeldsJoker(&rest, needMelds, jokers-1)
			rest[t]++

			if ok {
				return true
			}
		}
	}

	return false
}

// IsSevenPairs 判断是否为七对（含龙七对：四张相同算两对）。
func IsSevenPairs(c Counts) bool {
	return isSevenPairsJoker(c, 0)
}

// isSevenPairsJoker 判断去掉赖子后的牌能否与 jokers 张赖子组成七对。
func isSevenPairsJoker(c Counts, jokers int) bool {
	if c.Total()+jokers != 14 {
		return false
	}

	singles := 0

	for t := TileMin; t <= TileKinds; t++ {
		if c[t]%2 == 1 {
			singles++
		}
	}

	left := jokers - singles

	return left >= 0 && left%2 == 0
}

// canFormMeldsJoker 判断剩余牌能否刚好拆成 need 个面子，赖子可补任意缺张。
func canFormMeldsJoker(c *Counts, need, jokers int) bool {
	if need == 0 {
		return c.Total() == 0 && jokers == 0
	}

	if c.Total()+jokers != need*3 {
		return false
	}

	first := 0

	for t := TileMin; t <= TileKinds; t++ {
		if c[t] > 0 {
			first = t

			break
		}
	}

	if first == 0 {
		return false
	}

	use := c[first]
	if use > 3 {
		use = 3
	}

	if fill := 3 - use; fill <= jokers {
		c[first] -= use
		ok := canFormMeldsJoker(c, need-1, jokers-fill)
		c[first] += use

		if ok {
			return true
		}
	}

	if Suit(first) == 3 || Rank(first) > 7 {
		return false
	}

	missing := 0
	var took [3]bool

	for k := 0; k < 3; k++ {
		if c[first+k] == 0 {
			missing++

			continue
		}

		took[k] = true
		c[first+k]--
	}

	if missing <= jokers && canFormMeldsJoker(c, need-1, jokers-missing) {
		for k := 0; k < 3; k++ {
			if took[k] {
				c[first+k]++
			}
		}

		return true
	}

	for k := 0; k < 3; k++ {
		if took[k] {
			c[first+k]++
		}
	}

	return false
}

// TingList 返回当前手牌（3n+1 张）的听牌列表，升序去重。
func TingList(c Counts, meldCount int) []int {
	out := make([]int, 0, 9)

	for t := TileMin; t <= TileMax; t++ {
		if c[t] >= CopiesPerTile {
			continue
		}

		c[t]++

		if CanWin(c, meldCount) {
			out = append(out, t)
		}

		c[t]--
	}

	return out
}

// IsTing 判断手牌是否已听牌。
func IsTing(c Counts, meldCount int) bool {
	return len(TingList(c, meldCount)) > 0
}

// CanPeng 判断能否碰。
func CanPeng(c Counts, t int) bool {
	return t >= TileMin && t <= TileMax && c[t] >= 2
}

// CanMingGang 判断能否明杠他家弃牌。
func CanMingGang(c Counts, t int) bool {
	return t >= TileMin && t <= TileMax && c[t] >= 3
}

// AnGangTiles 返回可暗杠的牌。
func AnGangTiles(c Counts) []int {
	out := make([]int, 0, 4)

	for t := TileMin; t <= TileMax; t++ {
		if c[t] == CopiesPerTile {
			out = append(out, t)
		}
	}

	return out
}

// BuGangTiles 返回可补杠的牌（已碰且手上还有一张）。
func BuGangTiles(c Counts, melds []Meld) []int {
	out := make([]int, 0, 4)

	for _, m := range melds {
		if m.Type == MeldPeng && c[m.Tile] > 0 {
			out = append(out, m.Tile)
		}
	}

	return out
}

// AllTiles 汇总手牌与面子的全部牌，用于清一色、带幺九等判断。
func AllTiles(c Counts, melds []Meld) []int {
	out := c.Tiles()

	for _, m := range melds {
		n := 3
		if m.IsGang() {
			n = 4
		}

		for i := 0; i < n; i++ {
			out = append(out, m.Tile)
		}
	}

	return out
}

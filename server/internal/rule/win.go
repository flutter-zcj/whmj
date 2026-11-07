package rule

// WinShape 描述一手胡牌的结构特征，供番型与起胡门槛判定使用。
type WinShape struct {
	// Pair 将牌 id，0 表示将牌由赖子补成。
	Pair int `json:"pair"`
	// PairIs258 将牌是否为二、五、八。
	PairIs258 bool `json:"pairIs258"`
	// LaiziUsed 胡牌结构中消耗的赖子张数。
	LaiziUsed int `json:"laiziUsed"`
	// PengPeng 是否碰碰胡（全部由刻子或杠构成）。
	PengPeng bool `json:"pengPeng"`
	// QingYiSe 是否清一色。
	QingYiSe bool `json:"qingYiSe"`
	// JiangYiSe 是否将一色（全部是二、五、八）。
	JiangYiSe bool `json:"jiangYiSe"`
	// QuanQiuRen 是否全求人（四副面子全部亮出，单钓将牌）。
	QuanQiuRen bool `json:"quanQiuRen"`
}

// IsBigHu 判断是否构成大胡牌型。
//
// 武汉麻将的大胡：碰碰胡、清一色、将一色、风一色、全求人、杠上花、海底捞、抢杠。
// 风一色、杠上花、海底捞、抢杠由胡牌方式决定，由调用方叠加。
func (s WinShape) IsBigHu() bool {
	return s.PengPeng || s.QingYiSe || s.JiangYiSe || s.QuanQiuRen
}

// AnalyzeWin 判断手牌在已有 melds 副面子时能否成胡，并返回结构特征。
//
// 校验顺序：
//  1. 张数必须为 3n+2；
//  2. 手上不能留皮子与红中；
//  3. 赖子剥离后按标准型（4 面子 + 1 将）拆解，先试全刻子，再试普通型；
//  4. 武汉麻将没有七对，故不做对子型判定。
func AnalyzeWin(c Counts, melds []Meld, r Round) (WinShape, bool) {
	var shape WinShape

	if len(melds) > 4 {
		return shape, false
	}

	need := 4 - len(melds)
	if c.Total() != need*3+2 {
		return shape, false
	}

	if HasPiZi(c, melds, r) {
		return shape, false
	}

	jokers := LaiZiCount(c, r)

	var rest Counts

	copy(rest[:], c[:])

	if r.LaiZi != 0 {
		rest[r.LaiZi] = 0
	}

	// 全刻子优先：碰碰胡不看将牌点数。
	if ok, used, pair := formTriplets(rest, need, jokers); ok {
		shape.PengPeng = true
		shape.LaiziUsed = used
		shape.Pair = pair
		shape.PairIs258 = IsKeyTile(pair)
		shape.QingYiSe = isPureSuit(c, melds, r)
		shape.JiangYiSe = isAllKey(c, melds, r)
		shape.QuanQiuRen = len(melds) == 4 && c.Total() == 1

		return shape, true
	}

	ok, used, pair := formStandard(rest, need, jokers)
	if !ok {
		return shape, false
	}

	shape.LaiziUsed = used
	shape.Pair = pair
	shape.PairIs258 = IsKeyTile(pair)
	shape.QingYiSe = isPureSuit(c, melds, r)
	shape.JiangYiSe = isAllKey(c, melds, r)
	shape.QuanQiuRen = len(melds) == 4 && c.Total() == 1

	return shape, true
}

// CanWin 判断手牌是否成胡（只做结构判定，起胡门槛由牌局层校验）。
func CanWin(c Counts, meldCount int, r Round) bool {
	_, ok := AnalyzeWin(c, make([]Meld, meldCount), r)

	return ok
}

// IsKeyTile 判断是否为二、五、八（武汉麻将的将牌）。
func IsKeyTile(t int) bool {
	r := Rank(t)

	return r == 2 || r == 5 || r == 8
}

// formTriplets 判断能否全部拆成刻子，返回是否成功、消耗的赖子数、将牌点数。
func formTriplets(c Counts, need, jokers int) (bool, int, int) {
	for t := TileMin; t <= TileKinds; t++ {
		if c[t] < 2 {
			continue
		}

		c[t] -= 2

		ok, used := fillTriplets(&c, need, jokers)

		c[t] += 2

		if ok {
			return true, jokers - used, t
		}
	}

	// 将牌由赖子补成：一张实牌 + 一张赖子，或两张赖子。
	if jokers >= 1 {
		for t := TileMin; t <= TileKinds; t++ {
			if c[t] < 1 {
				continue
			}

			c[t]--

			ok, used := fillTriplets(&c, need, jokers-1)

			c[t]++

			if ok {
				return true, jokers - used, t
			}
		}
	}

	if jokers >= 2 {
		ok, used := fillTriplets(&c, need, jokers-2)
		if ok {
			return true, jokers - used, 0
		}
	}

	return false, 0, 0
}

// fillTriplets 把剩余牌全部拆成刻子。
func fillTriplets(c *Counts, need, jokers int) (bool, int) {
	if need == 0 {
		return c.Total() == 0, jokers
	}

	if c.Total()+jokers != need*3 {
		return false, jokers
	}

	first := 0

	for t := TileMin; t <= TileKinds; t++ {
		if c[t] > 0 {
			first = t

			break
		}
	}

	if first == 0 {
		return false, jokers
	}

	use := c[first]
	if use > 3 {
		use = 3
	}

	if fill := 3 - use; fill <= jokers {
		c[first] -= use

		ok, left := fillTriplets(c, need-1, jokers-fill)

		c[first] += use

		if ok {
			return true, left
		}
	}

	return false, jokers
}

// formStandard 判断能否拆成 need 个顺子/刻子，返回是否成功、消耗的赖子数、将牌点数。
func formStandard(c Counts, need, jokers int) (bool, int, int) {
	for t := TileMin; t <= TileKinds; t++ {
		if c[t] < 2 {
			continue
		}

		c[t] -= 2

		ok, used := fillMelds(&c, need, jokers)

		c[t] += 2

		if ok {
			return true, jokers - used, t
		}
	}

	if jokers >= 1 {
		for t := TileMin; t <= TileKinds; t++ {
			if c[t] < 1 {
				continue
			}

			c[t]--

			ok, used := fillMelds(&c, need, jokers-1)

			c[t]++

			if ok {
				return true, jokers - used, t
			}
		}
	}

	if jokers >= 2 {
		ok, used := fillMelds(&c, need, jokers-2)
		if ok {
			return true, jokers - used, 0
		}
	}

	return false, 0, 0
}

// fillMelds 判断剩余牌能否刚好拆成 need 个面子（顺子或刻子），赖子可补任意缺张。
func fillMelds(c *Counts, need, jokers int) (bool, int) {
	if need == 0 {
		return c.Total() == 0, jokers
	}

	if c.Total()+jokers != need*3 {
		return false, jokers
	}

	first := 0

	for t := TileMin; t <= TileKinds; t++ {
		if c[t] > 0 {
			first = t

			break
		}
	}

	if first == 0 {
		return false, jokers
	}

	use := c[first]
	if use > 3 {
		use = 3
	}

	if fill := 3 - use; fill <= jokers {
		c[first] -= use

		ok, left := fillMelds(c, need-1, jokers-fill)

		c[first] += use

		if ok {
			return true, left
		}
	}

	if Rank(first) > 7 || Suit(first) > 2 {
		return false, jokers
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

	if missing <= jokers {
		ok, left := fillMelds(c, need-1, jokers-missing)
		if ok {
			for k := 0; k < 3; k++ {
				if took[k] {
					c[first+k]++
				}
			}

			return true, left
		}
	}

	for k := 0; k < 3; k++ {
		if took[k] {
			c[first+k]++
		}
	}

	return false, jokers
}

// TingList 返回当前手牌（3n+1 张）的听牌列表，升序去重。
//
// 赖子本身打出去不能胡，因此只枚举序数牌与红中之外的牌。
func TingList(c Counts, meldCount int, r Round) []int {
	out := make([]int, 0, 9)

	for t := TileMin; t <= TileMax; t++ {
		if c[t] >= CopiesPerTile || r.IsLaiZi(t) || r.IsPiZi(t) {
			continue
		}

		c[t]++

		if CanWin(c, meldCount, r) {
			out = append(out, t)
		}

		c[t]--
	}

	return out
}

// TingMap 返回「打出哪张牌能听哪些牌」，手牌为 3n+2 张时使用。
// 对每一张可打的牌，扣掉它后按 TingList 判断听口，打不听的牌不出现在结果里。
func TingMap(c Counts, meldCount int, r Round) map[int][]int {
	out := make(map[int][]int, 8)

	for t := TileMin; t <= TileMax; t++ {
		if c[t] <= 0 {
			continue
		}

		c[t]--

		if list := TingList(c, meldCount, r); len(list) > 0 {
			out[t] = list
		}

		c[t]++
	}

	return out
}

// IsTing 判断手牌是否已听牌。
func IsTing(c Counts, meldCount int, r Round) bool {
	return len(TingList(c, meldCount, r)) > 0
}

// CanPeng 判断能否碰。皮子与赖子不能碰。
func CanPeng(c Counts, t int, r Round) bool {
	if t < TileMin || t > TileMax || r.IsPiZi(t) || r.IsLaiZi(t) {
		return false
	}

	return c[t] >= 2
}

// CanMingGang 判断能否明杠他家弃牌。皮子与赖子不能明杠。
func CanMingGang(c Counts, t int, r Round) bool {
	if t < TileMin || t > TileMax || r.IsPiZi(t) || r.IsLaiZi(t) {
		return false
	}

	return c[t] >= 3
}

// CanChi 判断能否吃，返回所有可行组合的首张牌。
//
// 只有下家能吃上家的弃牌，且皮子、赖子、红中不能吃。
func CanChi(c Counts, t int, r Round) []int {
	out := make([]int, 0, 3)

	if t < TileMin || t > TileKinds || r.IsPiZi(t) || r.IsLaiZi(t) || Suit(t) > 2 {
		return out
	}

	rk := Rank(t)

	for start := rk - 2; start <= rk; start++ {
		if start < 1 || start > 7 {
			continue
		}

		base := t - (rk - start)
		ok := true

		for k := 0; k < 3; k++ {
			if base+k == t {
				continue
			}

			if c[base+k] <= 0 {
				ok = false

				break
			}
		}

		if ok {
			out = append(out, base)
		}
	}

	return out
}

// AnGangTiles 返回可暗杠的牌。皮子不能暗杠（只能单张杠），赖子同样不走暗杠。
func AnGangTiles(c Counts, r Round) []int {
	out := make([]int, 0, 4)

	for t := TileMin; t <= TileKinds; t++ {
		if r.IsPiZi(t) || r.IsLaiZi(t) {
			continue
		}

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

// SpecialGangTiles 返回可单张成杠的特殊牌：红中、皮子、赖子。
//
// 武汉麻将里这三种牌只能单张杠出去，不占面子、不算开口，杠后从牌墙补一张。
func SpecialGangTiles(c Counts, r Round) []int {
	out := make([]int, 0, 2)

	if c[Zhong] > 0 {
		out = append(out, Zhong)
	}

	if r.PiZi != 0 && r.PiZi != Zhong && c[r.PiZi] > 0 {
		out = append(out, r.PiZi)
	}

	if r.LaiZi != 0 && c[r.LaiZi] > 0 {
		out = append(out, r.LaiZi)
	}

	return out
}

// AllTiles 汇总手牌与面子的全部牌。
func AllTiles(c Counts, melds []Meld) []int {
	out := c.Tiles()

	for _, m := range melds {
		out = append(out, m.Tiles()...)
	}

	return out
}

// isPureSuit 判断是否清一色。赖子可替代任意花色，故忽略赖子与皮子。
func isPureSuit(c Counts, melds []Meld, r Round) bool {
	suit := -1

	for _, t := range AllTiles(c, melds) {
		if r.IsLaiZi(t) || r.IsPiZi(t) {
			continue
		}

		s := Suit(t)
		if s < 0 || s > 2 {
			return false
		}

		if suit < 0 {
			suit = s

			continue
		}

		if s != suit {
			return false
		}
	}

	return suit >= 0
}

// isAllKey 判断是否将一色：所有牌都是二、五、八。
func isAllKey(c Counts, melds []Meld, r Round) bool {
	found := false

	for _, t := range AllTiles(c, melds) {
		if r.IsLaiZi(t) || r.IsPiZi(t) {
			continue
		}

		if !IsKeyTile(t) {
			return false
		}

		found = true
	}

	return found
}

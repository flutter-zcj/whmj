package rule

// FanItem 单个番型及番数。
type FanItem struct {
	Name string `json:"name"`
	Fan  int    `json:"fan"`
}

// FanResult 一手牌的番型集合。
type FanResult struct {
	Items []FanItem `json:"items"`
	Total int       `json:"total"`
}

func (p *FanResult) add(name string, fan int) {
	p.Items = append(p.Items, FanItem{Name: name, Fan: fan})
	p.Total += fan
}

// WinOptions 影响番型的胡牌方式标记。
type WinOptions struct {
	SelfDraw  bool // 自摸
	GangShang bool // 杠上开花 / 杠上炮
	QiangGang bool // 抢杠胡
	HaiDi     bool // 海底捞月 / 海底炮
	TianHu    bool // 天胡
	DiHu      bool // 地胡
}

// 番型名称常量，客户端按名称匹配字效。
const (
	FanPingHu     = "平胡"
	FanPengPengHu = "碰碰胡"
	FanQingYiSe   = "清一色"
	FanQiDui      = "七对"
	FanLongQiDui  = "龙七对"
	FanQingQiDui  = "清七对"
	FanQingLongQi = "清龙七对"
	FanJinGouDiao = "金钩钓"
	FanDaiYaoJiu  = "带幺九"
	FanJiangDui   = "将对"
	FanGangShang  = "杠上花"
	FanGangShangP = "杠上炮"
	FanQiangGang  = "抢杠胡"
	FanHaiDi      = "海底捞月"
	FanTianHu     = "天胡"
	FanDiHu       = "地胡"
	FanGen        = "根"
	FanLaizi      = "赖子"
	FanZhongGang  = "红中杠"
)

// CalcFan 计算胡牌番型。
//
// 传入的 c 应包含胡牌张（即已把 winning tile 计入 c）。
func CalcFan(c Counts, melds []Meld, winTile int, opt WinOptions) FanResult {
	res := FanResult{Items: make([]FanItem, 0, 6)}

	// 红中为赖子：结构性判断（七对、清一色、碰碰胡）只看序数牌，赖子单独计番。
	jokers := c[Zhong]

	var rest Counts

	copy(rest[:], c[:])
	rest[Zhong] = 0

	sevenPairs := len(melds) == 0 && isSevenPairsJoker(rest, jokers)
	pure := isPureSuit(rest, melds)

	if sevenPairs {
		quads := countQuads(c)

		switch {
		case pure && quads > 0:
			res.add(FanQingLongQi, 4)
		case pure:
			res.add(FanQingQiDui, 3)
		case quads > 0:
			res.add(FanLongQiDui, 3)
		default:
			res.add(FanQiDui, 2)
		}
	} else {
		if isAllTriplets(c, melds) {
			if isJiangDui(c, melds) {
				res.add(FanJiangDui, 2)
			} else {
				res.add(FanPengPengHu, 1)
			}
		}

		if !isAllTriplets(c, melds) && isDaiYaoJiu(c, melds) {
			res.add(FanDaiYaoJiu, 1)
		}

		if pure {
			res.add(FanQingYiSe, 2)
		}

		if len(melds) > 0 && c.Total() == 1 {
			res.add(FanJinGouDiao, 1)
		}
	}

	if opt.SelfDraw {
		if opt.TianHu {
			res.add(FanTianHu, 4)
		} else if opt.DiHu {
			res.add(FanDiHu, 3)
		}
	}

	if opt.GangShang {
		if opt.SelfDraw {
			res.add(FanGangShang, 1)
		} else {
			res.add(FanGangShangP, 1)
		}
	}

	if opt.QiangGang {
		res.add(FanQiangGang, 1)
	}

	if opt.HaiDi {
		res.add(FanHaiDi, 1)
	}

	if !sevenPairs {
		if n := countQuads(c); n > 0 {
			for i := 0; i < n; i++ {
				res.add(FanGen, 1)
			}
		}
	}

	if jokers > 0 {
		fan := jokers
		if fan > 2 {
			fan = 2
		}

		res.add(FanLaizi, fan)
	}

	for _, m := range melds {
		if m.IsGang() && m.Tile == Zhong {
			res.add(FanZhongGang, 1)
		}
	}

	if len(res.Items) == 0 {
		res.add(FanPingHu, 0)
	}

	_ = winTile

	return res
}

// isPureSuit 判断是否清一色（手牌与面子同一花色）。
func isPureSuit(c Counts, melds []Meld) bool {
	suit := -1

	for _, t := range AllTiles(c, melds) {
		s := Suit(t)
		if s < 0 {
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

// isAllTriplets 判断是否全刻子（碰碰胡的成立条件）。
func isAllTriplets(c Counts, melds []Meld) bool {
	for _, m := range melds {
		if m.Type == MeldPeng || m.IsGang() {
			continue
		}

		return false
	}

	pairFound := false

	for t := TileMin; t <= TileMax; t++ {
		switch c[t] % 3 {
		case 0:
			continue
		case 2:
			if pairFound || c[t] > 2 {
				return false
			}
			pairFound = true
		default:
			return false
		}
	}

	return pairFound
}

// isJiangDui 判断是否将对：全部面子为 2、5、8 的刻子且将牌同为 2、5、8。
func isJiangDui(c Counts, melds []Meld) bool {
	isKey := func(t int) bool {
		r := Rank(t)

		return r == 2 || r == 5 || r == 8
	}

	for _, m := range melds {
		if !isKey(m.Tile) {
			return false
		}
	}

	for t := TileMin; t <= TileMax; t++ {
		if c[t] > 0 && !isKey(t) {
			return false
		}
	}

	return true
}

// isDaiYaoJiu 判断是否带幺九：所有面子与将牌都含 1 或 9。
//
// 血战到底没有吃牌，面子只会是碰或杠，因此顺子只可能出现在暗手里。
func isDaiYaoJiu(c Counts, melds []Meld) bool {
	for _, m := range melds {
		if r := Rank(m.Tile); r != 1 && r != 9 {
			return false
		}
	}

	needMelds := 4 - len(melds)

	for t := TileMin; t <= TileMax; t++ {
		if c[t] < 2 {
			continue
		}

		if r := Rank(t); r != 1 && r != 9 {
			continue
		}

		c[t] -= 2
		ok := formYaoJiuMelds(&c, needMelds)
		c[t] += 2

		if ok {
			return true
		}
	}

	return false
}

// formYaoJiuMelds 判断剩余牌能否拆成 need 个含幺九的面子。
func formYaoJiuMelds(c *Counts, need int) bool {
	if need == 0 {
		return c.Total() == 0
	}

	first := 0

	for t := TileMin; t <= TileMax; t++ {
		if c[t] > 0 {
			first = t

			break
		}
	}

	if first == 0 {
		return false
	}

	if c[first] >= 3 {
		if r := Rank(first); r == 1 || r == 9 {
			c[first] -= 3
			ok := formYaoJiuMelds(c, need-1)
			c[first] += 3

			if ok {
				return true
			}
		}
	}

	r := Rank(first)
	if (r == 1 || r == 7) && first+2 <= TileMax && Suit(first) == Suit(first+2) &&
		c[first+1] > 0 && c[first+2] > 0 {
		c[first]--
		c[first+1]--
		c[first+2]--
		ok := formYaoJiuMelds(c, need-1)
		c[first]++
		c[first+1]++
		c[first+2]++

		if ok {
			return true
		}
	}

	return false
}

// countQuads 统计手牌与面子中凑满四张的牌种数（根数）。
func countQuads(c Counts) int {
	n := 0

	for t := TileMin; t <= TileMax; t++ {
		if c[t] >= CopiesPerTile {
			n++
		}
	}

	return n
}

// Score 把番数换算成分值：底分 × 2^番，番数受封顶限制。
func Score(base, fan, cap int) int {
	if base <= 0 {
		base = 1
	}

	if cap <= 0 {
		cap = 4
	}

	if fan < 0 {
		fan = 0
	}

	if fan > cap {
		fan = cap
	}

	return base << fan
}

// MaxTingFan 返回听牌状态下的最大可能番数，用于查大叫赔付计算。
func MaxTingFan(c Counts, melds []Meld) int {
	best := 0

	for _, t := range TingList(c, len(melds)) {
		c[t]++
		fan := CalcFan(c, melds, t, WinOptions{SelfDraw: true}).Total
		c[t]--

		if fan > best {
			best = fan
		}
	}

	return best
}

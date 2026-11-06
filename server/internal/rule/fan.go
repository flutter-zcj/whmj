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
	// Big 是否大胡（碰碰胡、清一色、将一色、全求人、杠上花、海底捞、抢杠）。
	Big bool `json:"big"`
	// MinFan 起胡门槛，低于该番数不能胡。
	MinFan int `json:"minFan"`
	// Hard 是否硬胡（没有赖子参与胡牌结构）。
	Hard bool `json:"hard"`
}

func (p *FanResult) add(name string, fan int) {
	if fan <= 0 {
		p.Items = append(p.Items, FanItem{Name: name, Fan: 0})

		return
	}

	p.Items = append(p.Items, FanItem{Name: name, Fan: fan})
	p.Total += fan
}

// 武汉麻将番型名称。客户端按名称匹配字效。
const (
	FanPiHu      = "屁胡"
	FanPengPeng  = "碰碰胡"
	FanQingYiSe  = "清一色"
	FanJiangSe   = "将一色"
	FanQuanQiu   = "全求人"
	FanGangHua   = "杠上花"
	FanHaiDi     = "海底捞"
	FanQiangGang = "抢杠"
	FanYingHu    = "硬胡"
	FanZiMo      = "自摸"
	FanFangChong = "放冲"
	FanZhuang    = "庄家"
	FanKaiKou    = "开口"
	FanMingGang  = "明杠"
	FanAnGang    = "暗杠"
	FanZhongGang = "红中杠"
	FanPiZiGang  = "皮子杠"
	FanLaiZiGang = "赖子杠"
)

// WinOptions 影响番型的胡牌方式标记。
type WinOptions struct {
	SelfDraw  bool // 自摸
	Banker    bool // 庄家
	GangShang bool // 杠上开花 / 杠上炮
	HaiDi     bool // 海底捞
	QiangGang bool // 抢杠胡
	// Opened 开口次数：吃、碰、明杠各算一次。
	Opened int
	// Gangs 各类杠的数量，key 为番型名。
	Gangs map[string]int
}

// CalcFan 计算胡牌番型。
//
// 传入的 c 应包含胡牌张（即已把 winning tile 计入 c）。
func CalcFan(c Counts, melds []Meld, r Round, opt WinOptions) FanResult {
	res := FanResult{Items: make([]FanItem, 0, 8)}

	shape, ok := AnalyzeWin(c, melds, r)
	if !ok {
		res.MinFan = MinFanSmall

		return res
	}

	res.MinFan = MinFanSmall
	res.Hard = shape.LaiziUsed == 0

	switch {
	case shape.QuanQiuRen:
		res.add(FanQuanQiu, 2)
	case shape.PengPeng:
		res.add(FanPengPeng, 2)
	}

	if shape.QingYiSe {
		res.add(FanQingYiSe, 2)
	}

	if shape.JiangYiSe {
		res.add(FanJiangSe, 2)
	}

	if opt.GangShang {
		res.add(FanGangHua, 1)
	}

	if opt.HaiDi {
		res.add(FanHaiDi, 1)
	}

	if opt.QiangGang {
		res.add(FanQiangGang, 1)
	}

	big := shape.IsBigHu() || opt.GangShang || opt.HaiDi || opt.QiangGang
	res.Big = big

	if !big {
		res.add(FanPiHu, 1)
	}

	if opt.Banker {
		res.add(FanZhuang, 1)
	}

	if opt.SelfDraw {
		res.add(FanZiMo, 1)
	} else {
		res.add(FanFangChong, 1)
	}

	if res.Hard {
		res.add(FanYingHu, 1)
	}

	if opt.Opened > 0 {
		res.add(FanKaiKou, opt.Opened)
	}

	for name, n := range opt.Gangs {
		res.add(name, n*fanOfGang(name))
	}

	if len(res.Items) == 0 {
		res.add(FanPiHu, 0)
	}

	if big {
		res.MinFan = MinFanBig
	} else {
		res.MinFan = MinFanSmall
	}

	return res
}

// fanOfGang 单次杠的番数。
func fanOfGang(name string) int {
	switch name {
	case FanAnGang:
		return 2
	case FanLaiZiGang:
		return 2
	case FanZhongGang, FanPiZiGang, FanMingGang:
		return 1
	}

	return 0
}

// 起胡门槛：小胡 6 番、大胡 3 番（武汉红中赖子杠通行标准）。
const (
	MinFanSmall = 6
	MinFanBig   = 3
)

// ReachMinFan 判断番数是否达到起胡门槛。
func ReachMinFan(res FanResult) bool {
	return res.Total >= res.MinFan
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
func MaxTingFan(c Counts, melds []Meld, r Round) int {
	best := 0

	for _, t := range TingList(c, len(melds), r) {
		c[t]++
		fan := CalcFan(c, melds, r, WinOptions{SelfDraw: true}).Total
		c[t]--

		if fan > best {
			best = fan
		}
	}

	return best
}

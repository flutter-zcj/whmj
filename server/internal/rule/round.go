// Package rule 实现武汉赖子麻将（红中赖子杠）的牌面模型、胡牌判定与番型计算。
package rule

// Round 描述一局牌的皮子与赖子。
//
// 武汉红中赖子杠的发牌流程：四家抓完牌后从牌墙翻一张牌 X，X 即"皮子"，
// X 的同花色下一张（9 之后回到 1）即"赖子"；红中固定为皮子。
// 皮子与红中留在手上不能胡，赖子可当任意序数牌使用。
type Round struct {
	// PiZi 翻出的皮子牌 id，0 表示本局无皮子。
	PiZi int `json:"pizi"`
	// LaiZi 由皮子推得的赖子牌 id，0 表示本局无赖子。
	LaiZi int `json:"laizi"`
	// Flip 翻出的那张牌，仅用于界面展示。
	Flip int `json:"flip"`
}

// NextTile 返回同花色的下一张牌，9 之后回到 1。
func NextTile(t int) int {
	if t < TileMin || t > TileKinds {
		return 0
	}

	r := Rank(t)
	if r >= 9 {
		return t - 8
	}

	return t + 1
}

// NewRound 由翻出的牌推出本局的皮子与赖子。
func NewRound(flip int) Round {
	if flip == Zhong {
		return Round{Flip: flip, PiZi: Zhong, LaiZi: NextTile(TileMin)}
	}

	return Round{Flip: flip, PiZi: flip, LaiZi: NextTile(flip)}
}

// IsPiZi 判断是否为皮子（含红中）。
func (r Round) IsPiZi(t int) bool {
	if t == Zhong {
		return true
	}

	return r.PiZi != 0 && t == r.PiZi
}

// IsLaiZi 判断是否为赖子。
func (r Round) IsLaiZi(t int) bool {
	return r.LaiZi != 0 && t == r.LaiZi
}

// HasPiZi 判断手牌里是否还留着皮子（含红中），留皮子不能胡。
//
// 皮子与红中被单张杠出去后不计入"留手"，因此只检查手牌。
func HasPiZi(c Counts, melds []Meld, r Round) bool {
	if c[Zhong] > 0 {
		return true
	}

	if r.PiZi != 0 && r.PiZi != Zhong && c[r.PiZi] > 0 {
		return true
	}

	return false
}

// LaiZiCount 返回手牌中的赖子张数。
func LaiZiCount(c Counts, r Round) int {
	if r.LaiZi == 0 {
		return 0
	}

	return c[r.LaiZi]
}

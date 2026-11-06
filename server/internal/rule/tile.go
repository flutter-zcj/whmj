// Package rule 实现武汉赖子麻将（红中赖子杠）的牌面模型、胡牌判定与番型计算。
//
// 牌编码与客户端共享同一套整数约定，避免两侧各自维护映射表：
//
//	1..9    一万..九万
//	10..18  一筒..九筒
//	19..27  一条..九条
//	28      红中（只能单张杠，留在手上不能胡）
//
// 整副牌为 108 张序数牌 + 4 张红中 = 112 张，不含东南西北与发白。
// 每局翻一张牌定皮子，皮子的下一张为赖子（万能牌），见 Round。
package rule

import (
	"fmt"
	"math/rand"
)

const (
	// TileMin 最小牌 id。
	TileMin = 1
	// TileMax 最大牌 id，28 为红中。
	TileMax = 28
	// Zhong 红中牌 id，同时是唯一的赖子。
	Zhong = 28
	// SuitCount 花色数量：万、筒、条、字（仅红中）。
	SuitCount = 4
	// TileKinds 序数牌种类数。
	TileKinds = 27
	// CopiesPerTile 每种牌的张数。
	CopiesPerTile = 4
	// ZhongCount 红中张数。
	ZhongCount = 4
	// WallSize 牌墙总张数：108 张序数牌 + 4 张红中。
	WallSize = TileKinds*CopiesPerTile + ZhongCount
	// HandSize 起手张数。
	HandSize = 13
)

// Suit 返回牌的花色序号：0 万、1 筒、2 条、3 字（红中）。
func Suit(t int) int {
	if t < TileMin || t > TileMax {
		return -1
	}

	if t == Zhong {
		return 3
	}

	return (t - 1) / 9
}

// Rank 返回牌的点数：1..9，红中返回 0。
func Rank(t int) int {
	if t < TileMin || t > TileMax || t == Zhong {
		return 0
	}

	return (t-1)%9 + 1
}

// IsZhong 判断是否为红中。
func IsZhong(t int) bool {
	return t == Zhong
}

// SuitName 返回花色中文名。
func SuitName(s int) string {
	switch s {
	case 0:
		return "万"
	case 1:
		return "筒"
	case 2:
		return "条"
	case 3:
		return "中"
	}

	return "?"
}

// Name 返回牌的中文名，例如 5 万、17 筒。
func Name(t int) string {
	if t < TileMin || t > TileMax {
		return "无效牌"
	}

	if t == Zhong {
		return "红中"
	}

	return fmt.Sprintf("%d%s", Rank(t), SuitName(Suit(t)))
}

// NewWall 生成一副洗好的牌墙。
func NewWall(rng *rand.Rand) []int {
	wall := make([]int, 0, WallSize)

	for t := TileMin; t <= TileKinds; t++ {
		for i := 0; i < CopiesPerTile; i++ {
			wall = append(wall, t)
		}
	}

	for i := 0; i < ZhongCount; i++ {
		wall = append(wall, Zhong)
	}

	rng.Shuffle(len(wall), func(i, j int) {
		wall[i], wall[j] = wall[j], wall[i]
	})

	return wall
}

// Counts 是手牌的计数表示，下标即牌 id，0 号位空置。
type Counts [TileMax + 1]int

// Add 增加一张牌。
func (p *Counts) Add(t int) {
	if t >= TileMin && t <= TileMax {
		p[t]++
	}
}

// Remove 移除一张牌，返回是否移除成功。
func (p *Counts) Remove(t int) bool {
	if t < TileMin || t > TileMax || p[t] <= 0 {
		return false
	}

	p[t]--

	return true
}

// Total 返回手牌总张数。
func (p *Counts) Total() int {
	total := 0

	for _, n := range p {
		total += n
	}

	return total
}

// Clone 复制一份计数。
func (p *Counts) Clone() Counts {
	var c Counts
	copy(c[:], p[:])

	return c
}

// Tiles 展开为牌列表（升序）。
func (p *Counts) Tiles() []int {
	out := make([]int, 0, p.Total())

	for t := TileMin; t <= TileMax; t++ {
		for i := 0; i < p[t]; i++ {
			out = append(out, t)
		}
	}

	return out
}

// MeldType 面子类型。
type MeldType int

const (
	// MeldChi 吃。
	MeldChi MeldType = 1
	// MeldPeng 碰。
	MeldPeng MeldType = 2
	// MeldMingGang 明杠（直杠，来自他家弃牌）。
	MeldMingGang MeldType = 3
	// MeldAnGang 暗杠。
	MeldAnGang MeldType = 4
	// MeldBuGang 补杠（巴杠，碰后补第四张）。
	MeldBuGang MeldType = 5
	// MeldSpecialGang 单张特殊杠：红中杠、皮子杠、赖子杠，不占面子。
	MeldSpecialGang MeldType = 6
)

// Meld 已亮出的面子。
type Meld struct {
	Type MeldType `json:"type"`
	Tile int      `json:"tile"`
	// Start 吃牌时顺子的首张，其余类型为 0。
	Start int `json:"start"`
	From  int `json:"from"`
}

// Tiles 返回面子包含的牌，吃为三张顺子，碰为三张同牌，杠为四张同牌。
func (m Meld) Tiles() []int {
	if m.Type == MeldChi {
		return []int{m.Start, m.Start + 1, m.Start + 2}
	}

	n := 3
	if m.IsGang() {
		n = 4
	}

	out := make([]int, 0, n)
	for i := 0; i < n; i++ {
		out = append(out, m.Tile)
	}

	return out
}

// IsGang 判断是否为杠（含单张特殊杠）。
func (m Meld) IsGang() bool {
	return m.Type == MeldMingGang || m.Type == MeldAnGang || m.Type == MeldBuGang || m.Type == MeldSpecialGang
}

// MeldName 返回面子中文名。
func (m Meld) MeldName() string {
	switch m.Type {
	case MeldChi:
		return "吃"
	case MeldPeng:
		return "碰"
	case MeldMingGang:
		return "明杠"
	case MeldAnGang:
		return "暗杠"
	case MeldBuGang:
		return "补杠"
	case MeldSpecialGang:
		return "杠"
	}

	return "未知"
}

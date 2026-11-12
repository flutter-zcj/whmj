/* ===========================================================
 * 掼蛋牌编码与工具（Go 版）
 * 与 JS/C# 版完全对齐
 *
 * 编码：方块 A,2..K = 1..13 ；梅花 14..26 ；红桃 27..39
 *       黑桃 40..52 ；小王 53 ；大王 54
 * 点数空间：A=14, 2..13=2..13, 小王=15, 大王=16
 * =========================================================== */
package game

import "sort"

const (
	SJ = 53 // 小王
	BJ = 54 // 大王

	SuitDiamond = 1
	SuitClub    = 2
	SuitHeart   = 3
	SuitSpade   = 4
	SuitJoker   = 5
)

var suitSymbol = map[int]string{1: "♦", 2: "♣", 3: "♥", 4: "♠", 5: ""}

// Num 点数空间取值：A=14, 2..13, 小王=15, 大王=16
func Num(card int) int {
	if card >= SJ {
		if card == SJ {
			return 15
		}
		return 16
	}
	n := (card-1)%13 + 1
	if n == 1 {
		return 14
	}
	return n
}

// SuitOf 花色：1方块 2梅花 3红桃 4黑桃 5王
func SuitOf(card int) int {
	if card >= SJ {
		return SuitJoker
	}
	return (card-1)/13 + 1
}

func IsJoker(card int) bool { return card >= SJ }

// NumWeight 点数权重：2..14 < 级牌(20) < 小王(21) < 大王(22)
func NumWeight(n, level int) int {
	switch {
	case n == 15:
		return 21
	case n == 16:
		return 22
	case n == level:
		return 20
	default:
		return n
	}
}

// Weight 按牌编码取权重
func Weight(card, level int) int { return NumWeight(Num(card), level) }

// RankName 点数短名
func RankName(n int) string {
	switch n {
	case 14:
		return "A"
	case 13:
		return "K"
	case 12:
		return "Q"
	case 11:
		return "J"
	case 15:
		return "w"
	case 16:
		return "W"
	}
	if n < 2 || n > 10 {
		return "?"
	}
	return string(rune('0'+n%10))
}

// CardName 牌面中文名（含花色）
func CardName(card int) string {
	if card >= SJ {
		if card == SJ {
			return "小王"
		}
		return "大王"
	}
	return suitSymbol[SuitOf(card)] + RankName(Num(card))
}

// NewDeck 两副牌 108 张
func NewDeck() []int {
	deck := make([]int, 0, 108)
	for s := 0; s < 2; s++ {
		for c := 1; c <= 54; c++ {
			deck = append(deck, c)
		}
	}
	return deck
}

// SortDesc 手牌排序：权重降序，同权重按花色、再按编码
func SortDesc(cards []int, level int) []int {
	out := make([]int, len(cards))
	copy(out, cards)
	sort.SliceStable(out, func(i, j int) bool {
		a, b := out[i], out[j]
		wa, wb := Weight(a, level), Weight(b, level)
		if wa != wb {
			return wa > wb
		}
		sa, sb := SuitOf(a), SuitOf(b)
		if sa != sb {
			return sa < sb
		}
		return a < b
	})
	return out
}

// RemoveCards 从手牌中移除指定牌（多重集合语义）；失败返回 false
func RemoveCards(hand, cards []int) ([]int, bool) {
	pool := make([]int, len(hand))
	copy(pool, hand)
	for _, c := range cards {
		idx := -1
		for i, v := range pool {
			if v == c {
				idx = i
				break
			}
		}
		if idx < 0 {
			return nil, false
		}
		pool = append(pool[:idx], pool[idx+1:]...)
	}
	return pool, true
}

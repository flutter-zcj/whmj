/* ===========================================================
 * 掼蛋牌型识别与大小比较（Go 版）
 * 与 JS 版 rule.js 行为一致：牌型权重取自逆向 InitGDCard.lua
 * =========================================================== */
package game

import (
	"sort"
	"strconv"
	"strings"
)

// 牌型（常量值与逆向一致）
const (
	CTNone = 0

	CTSingle = 1
	CTPair   = 2
	CTTriple = 3

	CTBomb4  = 4
	CTBomb5  = 5
	CTBomb6  = 6
	CTBomb7  = 7
	CTBomb8  = 8
	CTBomb9  = 9
	CTBomb10 = 10

	CTThreeWithPair = 101 // 三带二
	CTSteelPlate    = 102 // 钢板（两个连续三张）
	CTTriplePairs   = 103 // 三连对
	CTStraight      = 104 // 顺子（5 张）
	CTStraightFlush = 105 // 同花顺（5 张）
	CTFourKings     = 106 // 四大天王
)

// BombLevel 炸弹门槛：牌型权重 > 109 即为炸弹级
const BombLevel = 109

const (
	HandCards   = 27
	PlayerCount = 4
	DeckSize    = 108
)

var typeCN = map[int]string{
	1: "单张", 2: "对子", 3: "三张",
	101: "三带二", 102: "钢板", 103: "三连对",
	104: "顺子", 105: "同花顺", 106: "四大天王",
}

// Pattern 一手牌的牌型
type Pattern struct {
	ID         int   `json:"id"`
	Count      int   `json:"count"`
	Len        int   `json:"len"`
	Power      int   `json:"power"`
	Cards      []int `json:"cards"`
	TypeWeight int   `json:"typeWeight"`
	IsBomb     bool  `json:"isBomb"`
	Name       string `json:"name"`
}

// TypeWeightOf 牌型权重（越大越强）
func TypeWeightOf(id int) int {
	switch id {
	case CTSingle:
		return 1
	case CTPair:
		return 2
	case CTTriple:
		return 3
	case CTThreeWithPair:
		return 30
	case CTSteelPlate:
		return 40
	case CTTriplePairs:
		return 10
	case CTStraight:
		return 11
	case CTBomb4:
		return 110
	case CTBomb5:
		return 120
	case CTStraightFlush:
		return 130
	case CTBomb6:
		return 140
	case CTBomb7:
		return 150
	case CTBomb8:
		return 160
	case CTBomb9:
		return 170
	case CTBomb10:
		return 180
	case CTFourKings:
		return 190
	}
	return 0
}

func patternName(p *Pattern) string {
	if n, ok := typeCN[p.ID]; ok {
		return n
	}
	if p.TypeWeight >= 110 {
		return strconv.Itoa(len(p.Cards)) + "炸"
	}
	return "?"
}

func mk(id, count, length, power int, cards []int) *Pattern {
	p := &Pattern{ID: id, Count: count, Len: length, Power: power}
	p.Cards = append([]int{}, cards...)
	p.TypeWeight = TypeWeightOf(id)
	p.IsBomb = p.TypeWeight > BombLevel
	p.Name = patternName(p)
	return p
}

// LevelHeartCard 当前级的红桃级牌（逢人配 / 百搭）
func LevelHeartCard(level int) int {
	if level == 14 {
		return 27
	}
	return 27 + level - 1
}

// IsWild 是否逢人配
func IsWild(card, level int) bool { return card == LevelHeartCard(level) }

func seqOf(start, length int) []int {
	seq := make([]int, 0, length)
	if start == 1 {
		seq = append(seq, 14) // A 作低位：A,2,3,...
		for k := 1; k < length; k++ {
			seq = append(seq, k+1)
		}
	} else {
		for k := 0; k < length; k++ {
			seq = append(seq, start+k)
		}
	}
	return seq
}

func maxStartOf(id int) int {
	switch id {
	case CTStraight:
		return 10 // 最大 10 J Q K A
	case CTSteelPlate:
		return 13 // 最大 KKK AAA
	case CTTriplePairs:
		return 12 // 最大 QQ KK AA
	}
	return 10
}

// Parse 牌组解析：返回最优（权重最大）牌型，nil 表示非法
// 支持逢人配（红桃级牌可替代任意非王牌）
func Parse(cards []int, level int) *Pattern {
	if len(cards) == 0 {
		return nil
	}
	wild := make([]int, 0, 2)
	normal := make([]int, 0, len(cards))
	for _, c := range cards {
		if IsWild(c, level) {
			wild = append(wild, c)
		} else {
			normal = append(normal, c)
		}
	}

	// 全部由配牌组成：按张数判定
	if len(normal) == 0 {
		ids := map[int]int{1: CTSingle, 2: CTPair, 3: CTTriple, 4: CTBomb4, 5: CTBomb5, 6: CTBomb6, 7: CTBomb7, 8: CTBomb8}
		id, ok := ids[len(cards)]
		if !ok {
			id = CTBomb10
		}
		return mk(id, len(cards), 1, NumWeight(level, level), cards)
	}

	smallJ, bigJ := 0, 0
	for _, c := range normal {
		if c == SJ {
			smallJ++
		} else if c == BJ {
			bigJ++
		}
	}

	// 四大天王
	if len(cards) == 4 && len(wild) == 0 && smallJ == 2 && bigJ == 2 {
		return mk(CTFourKings, 2, 2, 22, cards)
	}

	cnt := map[int]int{}
	for _, c := range normal {
		if IsJoker(c) {
			continue
		}
		cnt[Num(c)]++
	}

	var best *Pattern
	consider := func(p *Pattern) {
		if p == nil {
			return
		}
		if best == nil || p.TypeWeight > best.TypeWeight ||
			(p.TypeWeight == best.TypeWeight && p.Power > best.Power) {
			best = p
		}
	}

	consider(tryStraightFlush(normal, wild, level, cards))
	consider(trySequence(cnt, wild, level, cards, 5, 1, CTStraight))
	consider(trySequence(cnt, wild, level, cards, 2, 3, CTSteelPlate))
	consider(trySequence(cnt, wild, level, cards, 3, 2, CTTriplePairs))
	consider(tryBomb(cnt, wild, level, cards))
	consider(tryThreeWithPair(cnt, wild, level, cards))
	consider(trySameNum(cnt, wild, level, cards, 3, CTTriple))
	consider(trySameNum(cnt, wild, level, cards, 2, CTPair))
	consider(trySameNum(cnt, wild, level, cards, 1, CTSingle))

	return best
}

// trySequence 顺子类：连续 len 组，每组 need 张
func trySequence(cnt map[int]int, wild []int, level int, all []int, length, need, id int) *Pattern {
	if len(all) != length*need {
		return nil
	}
	maxStart := maxStartOf(id)
	for s := 1; s <= maxStart; s++ {
		seq := seqOf(s, length)
		needWild, ok := 0, true
		for _, n := range seq {
			have := cnt[n]
			if have > need {
				ok = false
				break
			}
			needWild += need - have
		}
		if !ok || needWild > len(wild) {
			continue
		}
		power := NumWeight(seq[len(seq)-1], level)
		return mk(id, need, length, power, all)
	}
	return nil
}

// tryStraightFlush 同花顺（5 张同花色连续）—— 优先于五炸
func tryStraightFlush(normal, wild []int, level int, all []int) *Pattern {
	if len(all) != 5 {
		return nil
	}
	bySuit := map[int][]int{}
	for _, c := range normal {
		if IsJoker(c) {
			continue
		}
		s := SuitOf(c)
		bySuit[s] = append(bySuit[s], c)
	}
	suitKey, bestCount := 0, 0
	suits := make([]int, 0, len(bySuit))
	for s := range bySuit {
		suits = append(suits, s)
	}
	sort.Ints(suits)
	for _, s := range suits {
		if len(bySuit[s]) > bestCount {
			bestCount = len(bySuit[s])
			suitKey = s
		}
	}
	if suitKey == 0 && len(wild) == 0 {
		return nil
	}

	cnt := map[int]int{}
	if suitKey != 0 {
		for _, c := range bySuit[suitKey] {
			cnt[Num(c)]++
		}
	}

	for s := 1; s <= 10; s++ {
		seq := seqOf(s, 5)
		needWild, ok := 0, true
		for _, n := range seq {
			have := cnt[n]
			if have > 1 {
				ok = false
				break
			}
			needWild += 1 - have
		}
		if !ok || needWild > len(wild) {
			continue
		}
		return mk(CTStraightFlush, 1, 5, NumWeight(seq[4], level), all)
	}
	return nil
}

// tryBomb 炸弹：4~10 张同点，配牌可补
func tryBomb(cnt map[int]int, wild []int, level int, all []int) *Pattern {
	bestNum, bestTotal := -1, 0
	nums := make([]int, 0, len(cnt))
	for n := range cnt {
		nums = append(nums, n)
	}
	sort.Ints(nums)

	for _, n := range nums {
		total := cnt[n] + len(wild)
		if total != len(all) { // 炸弹必须耗尽全部牌
			continue
		}
		if total < 4 || total > 10 {
			continue
		}
		if total > bestTotal ||
			(total == bestTotal && NumWeight(n, level) > NumWeight(bestNum, level)) {
			bestTotal, bestNum = total, n
		}
	}
	if bestTotal < 4 {
		return nil
	}

	ids := map[int]int{4: CTBomb4, 5: CTBomb5, 6: CTBomb6, 7: CTBomb7, 8: CTBomb8, 9: CTBomb9}
	id, ok := ids[bestTotal]
	if !ok {
		id = CTBomb10
	}
	return mk(id, bestTotal, 1, NumWeight(bestNum, level), all)
}

func tryThreeWithPair(cnt map[int]int, wild []int, level int, all []int) *Pattern {
	if len(all) != 5 {
		return nil
	}
	keys := make([]int, 0, len(cnt))
	for n, c := range cnt {
		if c+len(wild) >= 3 {
			keys = append(keys, n)
		}
	}
	sort.Slice(keys, func(i, j int) bool {
		return NumWeight(keys[i], level) > NumWeight(keys[j], level)
	})

	for _, triple := range keys {
		usedWild := 3 - cnt[triple]
		if usedWild < 0 {
			usedWild = 0
		}
		leftWild := len(wild) - usedWild
		pairs := make([]int, 0, len(cnt))
		for n, c := range cnt {
			if n != triple && c+leftWild >= 2 {
				pairs = append(pairs, n)
			}
		}
		if len(pairs) > 0 {
			return mk(CTThreeWithPair, 3, 1, NumWeight(triple, level), all)
		}
	}
	return nil
}

func trySameNum(cnt map[int]int, wild []int, level int, all []int, need, id int) *Pattern {
	if len(all) != need {
		return nil
	}
	keys := make([]int, 0, len(cnt))
	for n, c := range cnt {
		if c+len(wild) == need {
			keys = append(keys, n)
		}
	}
	if len(keys) > 0 {
		sort.Slice(keys, func(i, j int) bool {
			return NumWeight(keys[i], level) > NumWeight(keys[j], level)
		})
		return mk(id, need, 1, NumWeight(keys[0], level), all)
	}
	// 王作单张 / 双王作对子
	if len(wild) == 0 && need == 1 && len(all) == 1 && IsJoker(all[0]) {
		return mk(CTSingle, 1, 1, Weight(all[0], level), all)
	}
	if len(wild) == 0 && need == 2 && len(all) == 2 && IsJoker(all[0]) && all[0] == all[1] {
		return mk(CTPair, 2, 1, Weight(all[0], level), all)
	}
	return nil
}

// CanBeat 是否能压过上家（严格遵循逆向 LuaRunRule.canOut 的判定顺序）
func CanBeat(out, pre *Pattern, level int) bool {
	if out == nil {
		return false
	}
	if pre == nil || pre.ID == CTNone {
		return out.ID != CTNone
	}
	if out.ID == CTNone {
		return false
	}

	ow, pw := out.TypeWeight, pre.TypeWeight

	if ow > BombLevel {
		if pw < BombLevel {
			return true
		}
		if ow > pw {
			return true
		}
		if ow == pw {
			if out.Len > pre.Len {
				return true
			}
			if out.Len == pre.Len {
				if out.Count > pre.Count {
					return true
				}
				if out.Count == pre.Count {
					return out.Power > pre.Power
				}
			}
		}
		return false
	}

	if len(out.Cards) != len(pre.Cards) {
		return false
	}
	if ow == pw && out.Len == pre.Len && out.Count == pre.Count {
		return out.Power > pre.Power
	}
	return false
}

// PatternText 牌型描述（形如「顺子[♦3 ♣4 ...]」）
func PatternText(p *Pattern) string {
	if p == nil {
		return ""
	}
	parts := make([]string, 0, len(p.Cards))
	for _, c := range p.Cards {
		parts = append(parts, CardName(c))
	}
	return p.Name + "[" + strings.Join(parts, " ") + "]"
}

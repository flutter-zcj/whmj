/* ===========================================================
 * 出牌提示：在手中找出所有能压过上家的牌组（Go 版）
 * 与 JS 版 hint.js 行为一致：配牌分配使用统一分配器，避免重复使用
 * =========================================================== */
package game

import (
	"sort"
	"strconv"
)

// wildTaker 配牌分配器：按序取用，保证同一张配牌不被两组重复使用
type wildTaker struct {
	wild []int
	n    int
}

func (w *wildTaker) takeN(bucket []int, need int) []int {
	take := make([]int, 0, need)
	m := need
	if len(bucket) < m {
		m = len(bucket)
	}
	take = append(take, bucket[:m]...)
	lack := need - len(take)
	for lack > 0 && w.n < len(w.wild) {
		take = append(take, w.wild[w.n])
		w.n++
		lack--
	}
	if lack != 0 {
		return nil
	}
	return take
}

// hintSequences 连续序列：len 组，每组 need 张，配牌自动补位
func hintSequences(byNum map[int][]int, wild []int, length, need, maxStart int) [][]int {
	out := [][]int{}
	for s := 1; s <= maxStart; s++ {
		seq := seqOf(s, length)
		needWild, ok := 0, true
		for _, n := range seq {
			have := len(byNum[n])
			if have > need {
				ok = false
				break
			}
			needWild += need - have
		}
		if !ok || needWild > len(wild) {
			continue
		}

		cards := make([]int, 0, length*need)
		for _, n := range seq {
			cards = append(cards, byNum[n]...)
		}
		for i := 0; i < needWild; i++ {
			cards = append(cards, wild[i])
		}
		out = append(out, cards)
	}
	return out
}

// hintStraightFlushes 同花顺候选（配牌可充当该花色）
func hintStraightFlushes(normal, wild []int) [][]int {
	out := [][]int{}
	bySuit := map[int][]int{}
	for _, c := range normal {
		if IsJoker(c) {
			continue
		}
		s := SuitOf(c)
		bySuit[s] = append(bySuit[s], c)
	}

	suits := make([]int, 0, len(bySuit))
	for s := range bySuit {
		suits = append(suits, s)
	}
	sort.Ints(suits)

	for _, s := range suits {
		byNum := map[int][]int{}
		for _, c := range bySuit[s] {
			n := Num(c)
			byNum[n] = append(byNum[n], c)
		}
		for st := 1; st <= 10; st++ {
			seq := seqOf(st, 5)
			needWild, ok := 0, true
			for _, n := range seq {
				have := len(byNum[n])
				if have > 1 {
					ok = false
					break
				}
				needWild += 1 - have
			}
			if !ok || needWild > len(wild) {
				continue
			}
			cards := make([]int, 0, 5)
			for _, n := range seq {
				if len(byNum[n]) > 0 {
					cards = append(cards, byNum[n][0])
				}
			}
			for i := 0; i < needWild && i < len(wild); i++ {
				cards = append(cards, wild[i])
			}
			if len(cards) == 5 {
				out = append(out, cards)
			}
		}
	}
	return out
}

// HintFind 枚举可行出牌方案，按牌型权重从小到大排序
// hand 手牌；pre 待压牌型（nil = 自由出牌）
func HintFind(hand []int, pre *Pattern, level int) []*Pattern {
	result := make([]*Pattern, 0, 16)
	seen := map[string]bool{}

	wild := make([]int, 0, 2)
	normal := make([]int, 0, len(hand))
	for _, c := range hand {
		if IsWild(c, level) {
			wild = append(wild, c)
		} else {
			normal = append(normal, c)
		}
	}

	byNum := map[int][]int{}
	for _, c := range normal {
		n := Num(c)
		byNum[n] = append(byNum[n], c)
	}
	nums := make([]int, 0, len(byNum))
	for n := range byNum {
		nums = append(nums, n)
	}
	sort.Ints(nums)

	add := func(cards []int) {
		if len(cards) == 0 {
			return
		}
		p := Parse(cards, level)
		if p == nil {
			return
		}
		if pre != nil && !CanBeat(p, pre, level) {
			return
		}
		sorted := make([]int, len(cards))
		copy(sorted, cards)
		sort.Ints(sorted)
		key := ""
		for i, c := range sorted {
			if i > 0 {
				key += ","
			}
			key += strconv.Itoa(c)
		}
		if seen[key] {
			return
		}
		seen[key] = true
		result = append(result, p)
	}

	w := &wildTaker{wild: wild}

	// 单张（含大小王）
	for _, n := range nums {
		add([]int{byNum[n][0]})
	}
	for _, wc := range wild {
		add([]int{wc})
	}

	// 对子 / 三张
	for _, n := range nums {
		if n >= 15 {
			continue
		}
		w.n = 0
		if pair := w.takeN(byNum[n], 2); pair != nil {
			add(pair)
		}
		w.n = 0
		if tri := w.takeN(byNum[n], 3); tri != nil {
			add(tri)
		}
	}

	// 三带二
	for _, n := range nums {
		if n >= 15 {
			continue
		}
		w.n = 0
		t := w.takeN(byNum[n], 3)
		if t == nil {
			continue
		}
		for _, p := range nums {
			if p == n || p >= 15 {
				continue
			}
			backup := w.n
			pair := w.takeN(byNum[p], 2)
			if pair != nil {
				all := make([]int, 0, len(t)+len(pair))
				all = append(all, t...)
				all = append(all, pair...)
				add(all)
			}
			w.n = backup
		}
	}

	// 顺子 / 钢板 / 三连对
	for _, cards := range hintSequences(byNum, wild, 5, 1, 10) {
		add(cards)
	}
	for _, cards := range hintSequences(byNum, wild, 2, 3, 13) {
		add(cards)
	}
	for _, cards := range hintSequences(byNum, wild, 3, 2, 12) {
		add(cards)
	}

	// 同花顺
	for _, cards := range hintStraightFlushes(normal, wild) {
		add(cards)
	}

	// 炸弹（4~10 张同点）
	for _, n := range nums {
		if n >= 15 {
			continue
		}
		maxSize := len(byNum[n]) + len(wild)
		if maxSize > 10 {
			maxSize = 10
		}
		for size := 4; size <= maxSize; size++ {
			w.n = 0
			if b := w.takeN(byNum[n], size); b != nil {
				add(b)
			}
		}
	}

	// 四大天王
	sj, bj := byNum[15], byNum[16]
	if len(sj) == 2 && len(bj) == 2 {
		add([]int{sj[0], sj[1], bj[0], bj[1]})
	}

	sort.SliceStable(result, func(i, j int) bool {
		if result[i].TypeWeight != result[j].TypeWeight {
			return result[i].TypeWeight < result[j].TypeWeight
		}
		return result[i].Power < result[j].Power
	})
	return result
}

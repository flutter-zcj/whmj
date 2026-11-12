/* ===========================================================
 * 掼蛋牌桌状态机：发牌 / 出牌 / 名次 / 升级 / 进贡 / 抗贡（Go 版）
 * 与 JS 版 table.js 行为一致
 * =========================================================== */
package game

// 状态机步骤
const (
	StepNone       = "none"
	StepPlay       = "play"
	StepWinLost    = "winLost"
	StepContribute = "contribute"
	StepEndGame    = "endGame"
)

// Seat 单个座位
type Seat struct {
	Index int   `json:"index"`
	Team  int   `json:"team"` // 1 或 2（偶数座位 1 队）
	Hand  []int `json:"hand"`
	Rank  int   `json:"rank"`
}

// Tribute 进贡关系
type Tribute struct {
	FromSeat int `json:"fromSeat"`
	ToSeat   int `json:"toSeat"`
}

// TributeLog 进贡+还贡记录
type TributeLog struct {
	FromSeat int `json:"fromSeat"`
	ToSeat   int `json:"toSeat"`
	Card     int `json:"card"`
	Back     int `json:"back"`
}

// SettleResult 一局结算结果
type SettleResult struct {
	WinnerTeam  int       `json:"winnerTeam"`
	UpLevel     int       `json:"upLevel"`
	DoubleDown  bool      `json:"doubleDown"`
	Tributes    []Tribute `json:"tributes"`
	Resisted    bool      `json:"resisted"`
	LevelBefore int       `json:"levelBefore"`
	LevelAfter  int       `json:"levelAfter"`
	Ranks       []int     `json:"ranks"`
}

// GameTable 一局牌桌
type GameTable struct {
	Seed     int64
	rngState uint32

	Seats [PlayerCount]*Seat

	LevelTeam1 int
	LevelTeam2 int

	Step        string
	Banker      int
	CurrentSeat int
	LastPlaySeat int
	LastPattern *Pattern

	LastPlaySeatCards []int
	FinishCount       int
	RoundNo           int
}

// NewTable 新建牌桌（seed 决定洗牌序列，可复现）
func NewTable(seed int64) *GameTable {
	t := &GameTable{Seed: seed, LevelTeam1: 2, LevelTeam2: 2, Step: StepNone, Banker: 0, CurrentSeat: 0, LastPlaySeat: -1}
	s := uint32(seed)
	if s == 0 {
		s = 1
	}
	t.rngState = s
	for i := 0; i < PlayerCount; i++ {
		team := 2
		if i%2 == 0 {
			team = 1
		}
		t.Seats[i] = &Seat{Index: i, Team: team, Hand: []int{}}
	}
	return t
}

// nextRand 可复现随机（xorshift32），与 JS 版逐位一致
//
// 注意：JS 里 `s >> 17` 是**算术右移**（先 ToInt32 再右移，保留符号位），
// 而 Go 的 uint32 右移是逻辑右移，两者在最高位为 1 时结果不同。
// 这里显式按 int32 语义处理，保证同 seed 的洗牌序列与原 JS 引擎完全相同。
func (t *GameTable) nextRand() float64 {
	s := t.rngState
	s ^= s << 13
	s ^= uint32(int32(s) >> 17)
	s ^= s << 5
	t.rngState = s
	return float64(s) / 4294967296.0
}

// LevelOf 座位当前级牌
func (t *GameTable) LevelOf(seat int) int {
	if t.Seats[seat].Team == 1 {
		return t.LevelTeam1
	}
	return t.LevelTeam2
}

// FinishedSeatCount 已出完手牌的座位数
func (t *GameTable) FinishedSeatCount() int {
	n := 0
	for _, s := range t.Seats {
		if len(s.Hand) == 0 {
			n++
		}
	}
	return n
}

// Deal 发牌：两副 108 张，每人 27 张
func (t *GameTable) Deal() *GameTable {
	deck := NewDeck()
	for i := len(deck) - 1; i > 0; i-- {
		j := int(t.nextRand() * float64(i+1))
		deck[i], deck[j] = deck[j], deck[i]
	}
	for s := 0; s < PlayerCount; s++ {
		hand := make([]int, HandCards)
		copy(hand, deck[s*HandCards:(s+1)*HandCards])
		t.Seats[s].Hand = SortDesc(hand, t.LevelOf(s))
		t.Seats[s].Rank = 0
	}
	t.Step = StepPlay
	t.FinishCount = 0
	t.LastPattern = nil
	t.LastPlaySeat = -1
	t.LastPlaySeatCards = nil
	t.CurrentSeat = t.Banker
	t.RoundNo++
	return t
}

// Play 出牌（空数组 = 过牌）；返回 false 表示非法
func (t *GameTable) Play(seat int, cards []int) bool {
	if t.Step != StepPlay || seat != t.CurrentSeat {
		return false
	}
	level := t.LevelOf(seat)

	if len(cards) == 0 {
		// 过牌：自由出牌轮不允许过
		if t.LastPlaySeat == seat || t.LastPlaySeat == -1 {
			return false
		}
		t.Advance()
		return true
	}

	pool, ok := RemoveCards(t.Seats[seat].Hand, cards)
	if !ok {
		return false
	}

	p := Parse(cards, level)
	if p == nil || !CanBeat(p, t.LastPattern, level) {
		return false
	}

	t.Seats[seat].Hand = pool
	t.LastPattern = p
	t.LastPlaySeat = seat
	t.LastPlaySeatCards = append([]int{}, cards...)

	if len(t.Seats[seat].Hand) == 0 {
		t.FinishCount++
		t.Seats[seat].Rank = t.FinishCount
		t.LastPattern = nil
		t.LastPlaySeat = -1
		t.LastPlaySeatCards = nil
		if t.FinishCount >= 3 {
			t.Step = StepWinLost
			return true
		}
	}
	t.Advance()
	return true
}

// Advance 轮转到下一位未出完的玩家
// 若绕回一圈回到本轮最后出牌者，说明其余三家均过牌，该玩家重新获得自由出牌权
func (t *GameTable) Advance() {
	for i := 1; i <= PlayerCount; i++ {
		next := (t.CurrentSeat + i) % PlayerCount
		if len(t.Seats[next].Hand) > 0 {
			t.CurrentSeat = next
			if next == t.LastPlaySeat {
				t.LastPattern = nil
				t.LastPlaySeat = -1
			}
			return
		}
	}
	t.Step = StepWinLost
}

// Settle 结算：名次 / 升级 / 双下 / 进贡 / 抗贡
func (t *GameTable) Settle() *SettleResult {
	// 未出完者名次为 4
	for _, s := range t.Seats {
		if len(s.Hand) > 0 && s.Rank == 0 {
			s.Rank = 4
		}
	}

	t1 := t.Seats[0].Rank + t.Seats[2].Rank
	t2 := t.Seats[1].Rank + t.Seats[3].Rank

	firstSeat := t.seatWithRank(1)
	winnerTeam := 1
	if firstSeat != nil {
		winnerTeam = firstSeat.Team
	} else if t2 < t1 {
		winnerTeam = 2
	}

	doubleDown := t1 == 3 || t2 == 3 // 某队包揽 1、2 名
	winnerSum := t1
	if winnerTeam == 2 {
		winnerSum = t2
	}
	mateRank := winnerSum - 1            // 队友名次
	upLevel := 5 - mateRank              // 1+2→3 级，1+3→2 级，1+4→1 级
	if upLevel < 1 {
		upLevel = 1
	}

	before := t.LevelTeam1
	if winnerTeam == 2 {
		before = t.LevelTeam2
	}
	if winnerTeam == 1 {
		t.LevelTeam1 = NextLevel(t.LevelTeam1, upLevel)
	} else {
		t.LevelTeam2 = NextLevel(t.LevelTeam2, upLevel)
	}

	first := t.seatWithRank(1)
	last := t.seatWithRank(4)
	tributes := []Tribute{}
	if first != nil && last != nil && first != last {
		tributes = append(tributes, Tribute{FromSeat: last.Index, ToSeat: first.Index})
	}
	if doubleDown {
		second := t.seatWithRank(2)
		third := t.seatWithRank(3)
		if second != nil && third != nil {
			tributes = append(tributes, Tribute{FromSeat: third.Index, ToSeat: second.Index})
		}
	}

	// 抗贡：双下且进贡方持有双大王
	resisted := false
	if doubleDown {
		for _, tr := range tributes {
			big := 0
			for _, c := range t.Seats[tr.FromSeat].Hand {
				if c == BJ {
					big++
				}
			}
			if big >= 2 {
				resisted = true
				break
			}
		}
	}

	after := t.LevelTeam1
	if winnerTeam == 2 {
		after = t.LevelTeam2
	}

	ranks := make([]int, PlayerCount)
	for i, s := range t.Seats {
		ranks[i] = s.Rank
	}

	res := &SettleResult{
		WinnerTeam:  winnerTeam,
		UpLevel:     upLevel,
		DoubleDown:  doubleDown,
		Tributes:    tributes,
		Resisted:    resisted,
		LevelBefore: before,
		LevelAfter:  after,
		Ranks:       ranks,
	}
	if resisted {
		t.Step = StepEndGame
	} else {
		t.Step = StepContribute
	}
	return res
}

func (t *GameTable) seatWithRank(rank int) *Seat {
	for _, s := range t.Seats {
		if s.Rank == rank {
			return s
		}
	}
	return nil
}

// NextLevel 升级（2..A，过 A 返回 15 表示通关）
func NextLevel(level, up int) int {
	n := level + up
	if n > 14 {
		return 15
	}
	return n
}

func (t *GameTable) tributeCandidates(seat int) []int {
	level := t.LevelOf(seat)
	list := make([]int, 0, len(t.Seats[seat].Hand))
	for _, c := range t.Seats[seat].Hand {
		if !IsJoker(c) && !IsWild(c, level) {
			list = append(list, c)
		}
	}
	return list
}

// AutoTributeCard 自动选贡：手中最大的非王、非配牌
func (t *GameTable) AutoTributeCard(seat int) int {
	list := t.tributeCandidates(seat)
	if len(list) == 0 {
		return 0
	}
	level := t.LevelOf(seat)
	best := list[0]
	for _, c := range list[1:] {
		if Weight(c, level) > Weight(best, level) {
			best = c
		}
	}
	return best
}

// AutoReturnCard 还贡：给出手中最小的非王、非配牌
func (t *GameTable) AutoReturnCard(seat int) int {
	list := t.tributeCandidates(seat)
	if len(list) == 0 {
		return 0
	}
	level := t.LevelOf(seat)
	best := list[0]
	for _, c := range list[1:] {
		if Weight(c, level) < Weight(best, level) {
			best = c
		}
	}
	return best
}

// DoTribute 执行进贡 + 还贡，返回过程描述
func (t *GameTable) DoTribute(tributes []Tribute) []TributeLog {
	logs := make([]TributeLog, 0, len(tributes))
	for _, tr := range tributes {
		card := t.AutoTributeCard(tr.FromSeat)
		if card == 0 {
			continue
		}
		from, to := t.Seats[tr.FromSeat], t.Seats[tr.ToSeat]
		if pool, ok := RemoveCards(from.Hand, []int{card}); ok {
			from.Hand = pool
		}
		to.Hand = append(to.Hand, card)

		back := t.AutoReturnCard(tr.ToSeat)
		if back != 0 {
			if pool, ok := RemoveCards(to.Hand, []int{back}); ok {
				to.Hand = pool
				from.Hand = append(from.Hand, back)
			}
		}
		logs = append(logs, TributeLog{FromSeat: tr.FromSeat, ToSeat: tr.ToSeat, Card: card, Back: back})
	}
	// 重新按当前级数整理手牌
	for s := 0; s < PlayerCount; s++ {
		t.Seats[s].Hand = SortDesc(t.Seats[s].Hand, t.LevelOf(s))
	}
	return logs
}

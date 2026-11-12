/* 整局对拍：同 seed 下 4 个 AI 互打 3 局，名次/级牌/进贡与 JS 引擎完全一致
 * 用例由 testdata/gen_rounds.mjs 生成
 * 运行：go test ./game -run Rounds -v
 */
package game

import (
	"encoding/json"
	"os"
	"testing"
)

type roundCase struct {
	Step       string  `json:"step"`
	Ranks      []int   `json:"ranks"`
	Levels     []int   `json:"levels"`
	WinnerTeam int     `json:"winnerTeam"`
	UpLevel    int     `json:"upLevel"`
	DoubleDown bool    `json:"doubleDown"`
	Resisted   bool    `json:"resisted"`
	Tributes   [][]int `json:"tributes"`
	Error      string  `json:"error"`
}

type seedCase struct {
	Seed        int64       `json:"seed"`
	Rounds      []roundCase `json:"rounds"`
	FinalLevels []int       `json:"finalLevels"`
}

func TestRoundsParity(t *testing.T) {
	path := os.Getenv("GD_ROUNDS")
	if path == "" {
		path = "testdata/rounds.json"
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Skipf("用例文件不存在，先运行 node testdata/gen_rounds.mjs > testdata/rounds.json: %v", err)
	}
	var cases []seedCase
	if err := json.Unmarshal(data, &cases); err != nil {
		t.Fatalf("用例解析失败: %v", err)
	}

	for _, sc := range cases {
		table := NewTable(sc.Seed)
		table.Deal()

		for i, want := range sc.Rounds {
			guard := 0
			for table.Step == StepPlay && guard < 5000 {
				guard++
				seat := table.CurrentSeat
				cards := AIChoose(table, seat)
				if !table.Play(seat, cards) {
					if !table.Play(seat, nil) {
						t.Fatalf("seed=%d 第 %d 局卡死 seat=%d cards=%v step=%s", sc.Seed, i+1, seat, cards, table.Step)
					}
				}
			}

			res := table.Settle()
			gotRanks := make([]int, 4)
			for k, s := range table.Seats {
				gotRanks[k] = s.Rank
			}
			if !sameInts(gotRanks, want.Ranks) {
				t.Fatalf("seed=%d 第 %d 局名次不一致 js=%v go=%v", sc.Seed, i+1, want.Ranks, gotRanks)
			}
			if res.WinnerTeam != want.WinnerTeam || res.UpLevel != want.UpLevel ||
				res.DoubleDown != want.DoubleDown || res.Resisted != want.Resisted {
				t.Fatalf("seed=%d 第 %d 局结算不一致:\n js=%+v\n go=%+v", sc.Seed, i+1, want, res)
			}
			gotLevels := []int{table.LevelOf(0), table.LevelOf(1)}
			if !sameInts(gotLevels, want.Levels) {
				t.Fatalf("seed=%d 第 %d 局级牌不一致 js=%v go=%v", sc.Seed, i+1, want.Levels, gotLevels)
			}
			if len(res.Tributes) != len(want.Tributes) {
				t.Fatalf("seed=%d 第 %d 局进贡数不一致 js=%v go=%v", sc.Seed, i+1, want.Tributes, res.Tributes)
			}
			for k := range res.Tributes {
				if res.Tributes[k].FromSeat != want.Tributes[k][0] || res.Tributes[k].ToSeat != want.Tributes[k][1] {
					t.Fatalf("seed=%d 第 %d 局进贡关系不一致 js=%v go=%v", sc.Seed, i+1, want.Tributes, res.Tributes)
				}
			}

			if table.Step == StepContribute {
				table.DoTribute(res.Tributes)
			}
			if i < len(sc.Rounds)-1 {
				table.Deal()
			}
		}

		final := []int{table.LevelOf(0), table.LevelOf(1)}
		if !sameInts(final, sc.FinalLevels) {
			t.Fatalf("seed=%d 最终级牌不一致 js=%v go=%v", sc.Seed, sc.FinalLevels, final)
		}
	}
	t.Logf("整局对拍通过：%d 个 seed × 3 局", len(cases))
}

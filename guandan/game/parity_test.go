/* 与 JS 原引擎（server/game/engine）逐用例对拍
 * 用例由 testdata/gen_cases.mjs 生成，覆盖 4000 组 parse + 400 组 hint
 * 运行：go test ./game -run Parity -v
 */
package game

import (
	"encoding/json"
	"os"
	"sort"
	"testing"
)

type pCase struct {
	Cards   []int `json:"cards"`
	Level   int   `json:"level"`
	Pattern *struct {
		ID         int    `json:"id"`
		Count      int    `json:"count"`
		Len        int    `json:"len"`
		Power      int    `json:"power"`
		TypeWeight int    `json:"typeWeight"`
		IsBomb     bool   `json:"isBomb"`
		Name       string `json:"name"`
	} `json:"pattern"`
}

type hCase struct {
	Hand  []int `json:"hand"`
	Level int   `json:"level"`
	Pre   *struct {
		Cards      []int `json:"cards"`
		ID         int `json:"id"`
		Count      int `json:"count"`
		Len        int `json:"len"`
		Power      int `json:"power"`
		TypeWeight int `json:"typeWeight"`
	} `json:"pre"`
	Hints []struct {
		Cards      []int `json:"cards"`
		ID         int   `json:"id"`
		Count      int   `json:"count"`
		Len        int   `json:"len"`
		Power      int   `json:"power"`
		TypeWeight int   `json:"typeWeight"`
	} `json:"hints"`
}

type cases struct {
	Parse []pCase `json:"parse"`
	Hint  []hCase `json:"hint"`
}

func loadCases(t *testing.T) *cases {
	path := os.Getenv("GD_CASES")
	if path == "" {
		path = "testdata/cases.json"
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Skipf("用例文件不存在，先运行 node testdata/gen_cases.mjs > testdata/cases.json: %v", err)
	}
	var c cases
	if err := json.Unmarshal(data, &c); err != nil {
		t.Fatalf("用例解析失败: %v", err)
	}
	return &c
}

func TestParityParse(t *testing.T) {
	c := loadCases(t)
	bad := 0
	for i, cs := range c.Parse {
		got := Parse(cs.Cards, cs.Level)
		if cs.Pattern == nil {
			if got != nil {
				bad++
				if bad <= 5 {
					t.Errorf("#%d cards=%v level=%d 期望 nil，得到 %+v", i, cs.Cards, cs.Level, got)
				}
			}
			continue
		}
		if got == nil {
			bad++
			if bad <= 5 {
				t.Errorf("#%d cards=%v level=%d 期望 %d，得到 nil", i, cs.Cards, cs.Level, cs.Pattern.ID)
			}
			continue
		}
		if got.ID != cs.Pattern.ID || got.Count != cs.Pattern.Count ||
			got.Len != cs.Pattern.Len || got.Power != cs.Pattern.Power ||
			got.TypeWeight != cs.Pattern.TypeWeight || got.IsBomb != cs.Pattern.IsBomb ||
			got.Name != cs.Pattern.Name {
			bad++
			if bad <= 5 {
				t.Errorf("#%d cards=%v level=%d 不一致:\n  js  =%+v\n  go  =%+v", i, cs.Cards, cs.Level, cs.Pattern, got)
			}
		}
	}
	if bad > 0 {
		t.Fatalf("parse 对拍失败 %d / %d", bad, len(c.Parse))
	}
	t.Logf("parse 对拍通过：%d 例", len(c.Parse))
}

func TestParityHint(t *testing.T) {
	c := loadCases(t)
	bad := 0
	for i, cs := range c.Hint {
		var pre *Pattern
		if cs.Pre != nil {
			pre = &Pattern{ID: cs.Pre.ID, Count: cs.Pre.Count, Len: cs.Pre.Len, Power: cs.Pre.Power,
				TypeWeight: cs.Pre.TypeWeight, Cards: cs.Pre.Cards}
		}
		got := HintFind(cs.Hand, pre, cs.Level)

		// 数量必须一致
		if len(got) != len(cs.Hints) {
			bad++
			if bad <= 5 {
				t.Errorf("#%d level=%d pre=%v 数量不一致 js=%d go=%d", i, cs.Level, cs.Pre, len(cs.Hints), len(got))
			}
			continue
		}
		for j := range got {
			want := cs.Hints[j]
			gc := append([]int{}, got[j].Cards...)
			sort.Ints(gc)
			wc := append([]int{}, want.Cards...)
			sort.Ints(wc)
			if !sameInts(gc, wc) || got[j].ID != want.ID || got[j].Power != want.Power ||
				got[j].TypeWeight != want.TypeWeight || got[j].Len != want.Len || got[j].Count != want.Count {
				bad++
				if bad <= 5 {
					t.Errorf("#%d[%d] 不一致:\n  js  cards=%v id=%d tw=%d power=%d\n  go  cards=%v id=%d tw=%d power=%d",
						i, j, wc, want.ID, want.TypeWeight, want.Power, gc, got[j].ID, got[j].TypeWeight, got[j].Power)
				}
				break
			}
		}
	}
	if bad > 0 {
		t.Fatalf("hint 对拍失败 %d / %d", bad, len(c.Hint))
	}
	t.Logf("hint 对拍通过：%d 例", len(c.Hint))
}

func sameInts(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

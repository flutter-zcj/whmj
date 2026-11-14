package room

import (
	"testing"
	"time"
)

// 等待中掉线要保留座位，宽限期到了才清座：
// 客户端在「房间页 → 牌桌页」之间切换会重建连接，立即踢座会把刚开局的房间拆散。
func TestWaitingOfflineKeepsSeatUntilGrace(t *testing.T) {
	cfg := DefaultConfig()
	cfg.OfflineMS = 30 * time.Second
	r := New("100001", cfg, Hooks{})

	seat := r.Join("sid-1", "u1", "甲")
	if seat != 0 {
		t.Fatalf("首个玩家应坐 0 号位，实际 %d", seat)
	}

	r.Offline(seat)

	if r.Players[seat] == nil {
		t.Fatal("等待中掉线不应立刻清座")
	}
	if r.Players[seat].Online {
		t.Fatal("掉线后座位应标记为离线")
	}
	if !r.Players[seat].Host {
		t.Fatal("掉线不应丢掉房主身份")
	}

	kind := TimerOffline + "0"
	r.FireTimer(TimerEvent{Kind: kind, Token: r.tokens[kind]})

	if r.Players[seat] != nil {
		t.Fatal("宽限期到后应清掉离线座位")
	}
}

// 宽限期内重新进房要回到原座位，并取消清座定时器
func TestWaitingRejoinRestoresSeat(t *testing.T) {
	cfg := DefaultConfig()
	cfg.OfflineMS = 30 * time.Second
	r := New("100002", cfg, Hooks{})

	r.Join("sid-1", "u1", "甲")
	r.Offline(0)
	back := r.Join("sid-2", "u1", "甲")

	if back != 0 {
		t.Fatalf("重连应回到 0 号位，实际 %d", back)
	}
	if !r.Players[0].Online || r.Players[0].Bot {
		t.Fatal("重连后应恢复在线且不再托管")
	}

	kind := TimerOffline + "0"
	r.FireTimer(TimerEvent{Kind: kind, Token: r.tokens[kind]})

	if r.Players[0] == nil {
		t.Fatal("重连后不该再被清座")
	}
}

// 单回合默认限时 12 秒，超时由系统代打
func TestDefaultTurnLimit(t *testing.T) {
	if got := DefaultConfig().TurnMS; got != 12*time.Second {
		t.Fatalf("单回合限时应为 12 秒，实际 %v", got)
	}
}

// 超时触发 autoPlay：必须出牌或过牌，不能把牌局停在当前这一手
func TestTurnTimeoutAutoPlays(t *testing.T) {
	cfg := DefaultConfig()
	cfg.TurnMS = 10 * time.Millisecond
	cfg.BotDelay = 10 * time.Millisecond
	r := New("100004", cfg, Hooks{})
	r.Join("sid-1", "u1", "甲")
	for i := 0; i < 3; i++ {
		if _, msg := r.AddBot(); msg != "" {
			t.Fatalf("添加电脑失败：%s", msg)
		}
	}
	if msg := r.Start(); msg != "" {
		t.Fatalf("开局失败：%s", msg)
	}

	seat := r.Table.CurrentSeat
	before := len(r.Table.Seats[seat].Hand)
	r.FireTimer(TimerEvent{Kind: TimerTurn, Token: r.tokens[TimerTurn]})

	if len(r.Table.Seats[seat].Hand) == before && r.Table.CurrentSeat == seat {
		t.Fatal("超时后系统应代打出牌或过牌，牌局不能停住")
	}
	if r.Status != StatusPlaying && r.Status != StatusSettled {
		t.Fatalf("超时托管后状态异常：%s", r.Status)
	}
}

// 真人回合的 sync 要带剩余秒数，电脑回合为 0（前端据此决定是否显示倒计时）
func TestSyncTurnLeftCountdown(t *testing.T) {
	cfg := DefaultConfig()
	cfg.TurnMS = 3 * time.Second
	cfg.BotDelay = 10 * time.Millisecond
	r := New("100005", cfg, Hooks{})
	r.Join("sid-1", "u1", "甲")
	for i := 0; i < 3; i++ {
		r.AddBot()
	}
	if msg := r.Start(); msg != "" {
		t.Fatalf("开局失败：%s", msg)
	}

	// 人为把回合交给真人座位，让 tick 起算限时
	r.Table.CurrentSeat = 0
	r.tick()

	if got := r.StateFor(0).TurnLeft; got != 3 {
		t.Fatalf("真人回合剩余秒数应为 3，实际 %d", got)
	}
	if got := r.StateFor(1).TurnLeft; got != 0 {
		t.Fatalf("非当前回合座位不应拿到倒计时，实际 %d", got)
	}
}

// 先手超时必须出牌（不能因为「先手不许过」把回合卡死）
func TestTurnTimeoutFirstHandPlays(t *testing.T) {
	cfg := DefaultConfig()
	cfg.TurnMS = 10 * time.Millisecond
	cfg.BotDelay = 10 * time.Millisecond
	r := New("100006", cfg, Hooks{})
	r.Join("sid-1", "u1", "甲")
	for i := 0; i < 3; i++ {
		r.AddBot()
	}
	if msg := r.Start(); msg != "" {
		t.Fatalf("开局失败：%s", msg)
	}

	// 人为造出「真人先手」的自由出牌轮
	r.Table.CurrentSeat = 0
	r.Table.LastPlaySeat = -1
	r.Table.LastPattern = nil
	r.tick()

	before := len(r.Table.Seats[0].Hand)
	r.FireTimer(TimerEvent{Kind: TimerTurn, Token: r.tokens[TimerTurn]})

	if len(r.Table.Seats[0].Hand) >= before {
		t.Fatalf("先手超时应代打出牌，手牌 %d 张未减少", before)
	}
}

// 四个座位坐满且房主开局后进入 playing
func TestStartRequiresFullSeats(t *testing.T) {
	cfg := DefaultConfig()
	r := New("100003", cfg, Hooks{})
	r.Join("sid-1", "u1", "甲")

	if msg := r.Start(); msg == "" {
		t.Fatal("没坐满不应允许开局")
	}

	for i := 0; i < 3; i++ {
		if _, msg := r.AddBot(); msg != "" {
			t.Fatalf("添加电脑失败：%s", msg)
		}
	}

	if msg := r.Start(); msg != "" {
		t.Fatalf("坐满后应能开局，实际：%s", msg)
	}
	if r.Status != StatusPlaying {
		t.Fatalf("开局后状态应为 playing，实际 %s", r.Status)
	}
}

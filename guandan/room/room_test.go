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

/* ===========================================================
 * 通信协议：消息号（mid）+ 请求/响应结构
 *
 * 传输格式沿用 cherry simple 协议：
 *   mid(uint32,BE) + dataLen(uint32,BE) + JSON body
 * 与旧版 Node 服务端的 JSON 相比只多一层 8 字节头，字段名完全不变，
 * 前端 net.js 只需在收发处包一层编解码。
 * =========================================================== */
package protocol

// 客户端 → 服务端
const (
	MidJoin      uint32 = 1
	MidStart     uint32 = 2
	MidAddBot    uint32 = 3
	MidRemoveBot uint32 = 4
	MidPlay      uint32 = 5
	MidPass      uint32 = 6
	MidLeave     uint32 = 7
	MidPing      uint32 = 8
	MidReady     uint32 = 9
)

// 服务端 → 客户端
const (
	MidJoined uint32 = 100
	MidSync   uint32 = 101
	MidSettle uint32 = 102
	MidError  uint32 = 103
	MidPong   uint32 = 104
	MidHello  uint32 = 105
	MidLeft   uint32 = 106
)

// Routes 消息号 → 处理函数名（服务端路由注册用）
var Routes = map[uint32]string{
	MidJoin:      "join",
	MidStart:     "start",
	MidAddBot:    "addBot",
	MidRemoveBot: "removeBot",
	MidPlay:      "play",
	MidPass:      "pass",
	MidLeave:     "leave",
	MidPing:      "ping",
	MidReady:     "ready",
}

// 客户端请求体
type (
	JoinReq struct {
		Room   string `json:"room"`
		Name   string `json:"name"`
		Create bool   `json:"create"`
		UID    string `json:"uid"` // 可选：稳定身份（用于断线重连与战绩归属）
	}
	RemoveBotReq struct {
		Seat int `json:"seat"`
	}
	PlayReq struct {
		Cards []int `json:"cards"`
	}
	ReadyReq struct {
		Ready bool `json:"ready"`
	}
	EmptyReq struct{}
)

// 服务端响应体
type (
	JoinedResp struct {
		T    string `json:"t"`
		Room string `json:"room"`
		Seat int    `json:"seat"`
		Name string `json:"name"`
		Host bool   `json:"host"`
	}

	ErrorResp struct {
		T    string `json:"t"`
		Msg  string `json:"msg"`
		Code int    `json:"code,omitempty"`
	}

	PongResp struct {
		T  string `json:"t"`
		TS int64  `json:"ts"`
	}

	HelloResp struct {
		T  string `json:"t"`
		TS int64  `json:"ts"`
	}

	LeftResp struct {
		T string `json:"t"`
	}

	SeatState struct {
		Seat   int    `json:"seat"`
		Name   string `json:"name"`
		Empty  bool   `json:"empty"`
		Bot    bool   `json:"bot"`
		Host   bool   `json:"host"`
		Online bool   `json:"online"`
		Ready  bool   `json:"ready"`
		Count  int    `json:"count"`
		Rank   int    `json:"rank"`
		Team   int    `json:"team"`
	}

	PatternView struct {
		ID    int   `json:"id"`
		Name  string `json:"name"`
		Text  string `json:"text"`
		Cards []int `json:"cards"`
	}

	OutView struct {
		Seat  int    `json:"seat"`
		Cards []int  `json:"cards"`
		Name  string `json:"name"`
	}

	TipView struct {
		Seat int    `json:"seat"`
		Type string `json:"type"`
	}

	SyncResp struct {
		T            string       `json:"t"`
		Room         string       `json:"room"`
		Status       string       `json:"status"`
		Round        int          `json:"round"`
		Step         string       `json:"step"`
		CurrentSeat  int          `json:"currentSeat"`
		LastPlaySeat int          `json:"lastPlaySeat"`
		LastPattern  *PatternView `json:"lastPattern"`
		Level        int          `json:"level"`
		Levels       []int        `json:"levels"`
		Seats        []SeatState  `json:"seats"`
		HostSeat     int          `json:"hostSeat"`
		Outs         []*OutView   `json:"outs"`
		Hand         []int        `json:"hand"`
		Tips         []TipView    `json:"tips"`
		TurnLeft     int          `json:"turnLeft"` // 当前回合剩余秒数（0 = 不限）
	}

	TributeView struct {
		From int    `json:"from"`
		To   int    `json:"to"`
		Card string `json:"card"`
		Back string `json:"back"`
	}

	SettleResp struct {
		T          string        `json:"t"`
		Room       string        `json:"room"`
		Round      int           `json:"round"`
		WinnerTeam int           `json:"winnerTeam"`
		UpLevel    int           `json:"upLevel"`
		DoubleDown bool          `json:"doubleDown"`
		Resisted   bool          `json:"resisted"`
		Ranks      []int         `json:"ranks"`
		Levels     []int         `json:"levels"`
		Tributes   []TributeView `json:"tributes"`
		Outs       []*OutView    `json:"outs"`
	}
)

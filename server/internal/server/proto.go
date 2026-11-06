// Package server 把牌局状态机接到 cherry 的 actor 与网络层上。
package server

import (
	"github.com/zbcx/whmj/internal/game"
	"github.com/zbcx/whmj/internal/rule"
)

// 路由前缀，客户端按 前缀.方法 组织请求。
const (
	RouteLobby = "whmj.lobby"
	RouteRoom  = "whmj.room"
)

// Empty 无参数请求。
type Empty struct{}

// UIDReq 只带 uid 的请求。
type UIDReq struct {
	UID int64 `json:"uid"`
}

// RoomReq 房间内请求的公共字段。
type RoomReq struct {
	Tile  int    `json:"tile"`
	Tiles []int  `json:"tiles"`
	Type  string `json:"type"`
	Suit  int    `json:"suit"`
}

// JoinReq 进入房间。
type JoinReq struct {
	UID    int64  `json:"uid"`
	RoomID string `json:"roomId"`
	Nick   string `json:"nick"`
	Avatar string `json:"avatar"`
	Bot    bool   `json:"bot"`
}

// QuickStartReq 快速开局。
type QuickStartReq struct {
	Base   int `json:"base"`
	Rounds int `json:"rounds"`
	Bots   int `json:"bots"`
}

// RoomInfo 房间概览，用于大厅列表。
type RoomInfo struct {
	RoomID   string `json:"roomId"`
	Owner    string `json:"owner"`
	Base     int    `json:"base"`
	Round    int    `json:"round"`
	MaxRound int    `json:"maxRound"`
	Seats    int    `json:"seats"`
	Playing  bool   `json:"playing"`
}

// LobbyState 大厅快照。
type LobbyState struct {
	Profile *Profile   `json:"profile"`
	Rooms   []RoomInfo `json:"rooms"`
	Plays   []PlayInfo `json:"plays"`
}

// PlayInfo 玩法配置项。
type PlayInfo struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Desc string `json:"desc"`
	Base int    `json:"base"`
	Cap  int    `json:"cap"`
}

// Profile 玩家资料。
type Profile struct {
	UID    int64  `json:"uid"`
	Nick   string `json:"nick"`
	Avatar string `json:"avatar"`
	Score  int    `json:"score"`
}

// SeatView 座位视图。
type SeatView struct {
	Seat      int         `json:"seat"`
	UID       int64       `json:"uid"`
	Nick      string      `json:"nick"`
	Avatar    string      `json:"avatar"`
	Ready     bool        `json:"ready"`
	Online    bool        `json:"online"`
	Bot       bool        `json:"bot"`
	Score     int         `json:"score"`
	Total     int         `json:"total"`
	Ting      bool        `json:"ting"`
	Finished  bool        `json:"finished"`
	IsBanker  bool        `json:"isBanker"`
	TileCount int         `json:"tileCount"`
	Melds     []rule.Meld `json:"melds"`
	Discards  []int       `json:"discards"`
}

// RoomSnapshot 房间完整快照，断线重连时下发。
type RoomSnapshot struct {
	RoomID   string        `json:"roomId"`
	Base     int           `json:"base"`
	Round    int           `json:"round"`
	MaxRound int           `json:"maxRound"`
	Phase    string        `json:"phase"`
	Turn     int           `json:"turn"`
	Remain   int           `json:"remain"`
	Seats    []SeatView    `json:"seats"`
	Hand     []int         `json:"hand"`
	Options  []game.Option `json:"options"`
}

// ActionReq 房间内操作。
type ActionReq struct {
	Type string `json:"type"`
	Tile int    `json:"tile"`
}

// DiscardReq 出牌。
type DiscardReq struct {
	Tile int `json:"tile"`
}

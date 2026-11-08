package server

import (
	"fmt"
	"math/rand"
	"time"

	cfacade "github.com/cherry-game/cherry/facade"
	cactor "github.com/cherry-game/cherry/net/actor"
	"github.com/cherry-game/cherry/net/parser/pomelo"
	cproto "github.com/cherry-game/cherry/net/proto"

	"github.com/zbcx/whmj/internal/game"
	"github.com/zbcx/whmj/internal/store"
)

// plays 支持的玩法列表，客户端大厅按此渲染。
var plays = []PlayInfo{
	{Key: "whmj", Name: "武汉麻将", Desc: "红中赖子杠 · 二五八将 · 开口才能胡", Base: 1, Cap: 6},
	{Key: "whmj_high", Name: "武汉麻将·高分", Desc: "底分 2 · 封顶 7 番", Base: 2, Cap: 7},
	{Key: "whmj_quick", Name: "快速场", Desc: "四局一结算，适合练手", Base: 1, Cap: 5},
}

// Lobby 大厅 actor：管理房间列表、创建与回收房间。
type Lobby struct {
	cactor.Base

	store *store.Store
	rooms map[string]*Room
	seq   int
}

// NewLobby 创建大厅。
func NewLobby(st *store.Store) *Lobby {
	return &Lobby{store: st}
}

// AliasID 大厅 actorID。
func (l *Lobby) AliasID() string {
	return "lobby"
}

// OnInit 注册处理函数。
func (l *Lobby) OnInit() {
	l.rooms = make(map[string]*Room)

	l.Local().Register("enter", l.onEnter)
	l.Local().Register("list", l.onList)
	l.Local().Register("quickStart", l.onQuickStart)
	l.Local().Register("createRoom", l.onCreateRoom)
	l.Local().Register("joinRoom", l.onJoinRoom)
	l.Local().Register("leaveRoom", l.onLeaveRoom)

	l.Remote().Register("offline", l.onOffline)
	l.Remote().Register("remove", l.onRemove)
}

// OnLocalReceived 大厅消息不再向下分发。
func (*Lobby) OnLocalReceived(_ *cfacade.Message) (bool, bool) {
	return false, true
}

func (l *Lobby) onEnter(session *cproto.Session, _ *Empty) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	agent.Response(session, l.state(session.Uid))
}

func (l *Lobby) onList(session *cproto.Session, _ *Empty) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	agent.Response(session, struct {
		Rooms []RoomInfo `json:"rooms"`
	}{Rooms: l.roomList()})
}

func (l *Lobby) state(uid cfacade.UID) *LobbyState {
	st := &LobbyState{
		Profile: &Profile{UID: int64(uid)},
		Rooms:   l.roomList(),
		Plays:   plays,
	}

	if u, err := l.store.Profile(int64(uid)); err == nil {
		st.Profile.Nick = u.Nick
		st.Profile.Avatar = u.Avatar
		st.Profile.Score = u.Score
	}

	return st
}

func (l *Lobby) roomList() []RoomInfo {
	out := make([]RoomInfo, 0, len(l.rooms))

	for _, r := range l.rooms {
		seats := 0

		for _, s := range r.seats {
			if s != nil {
				seats++
			}
		}

		out = append(out, RoomInfo{
			RoomID:   r.id,
			Owner:    r.owner,
			Base:     r.cfg.Base,
			Round:    r.round,
			MaxRound: r.maxRound,
			Seats:    seats,
			Playing:  r.game != nil && !r.game.Over(),
		})
	}

	return out
}

// onQuickStart 快速开桌：房间不预设局数，一局一结算，下一局由玩家点击开始。
func (l *Lobby) onQuickStart(session *cproto.Session, req *QuickStartReq) {
	cfg := game.DefaultConfig()

	if req.Base > 0 {
		cfg.Base = req.Base
	}

	l.createAndJoin(session, cfg, req.Rounds)
}

func (l *Lobby) onCreateRoom(session *cproto.Session, req *QuickStartReq) {
	cfg := game.DefaultConfig()

	if req.Base > 0 {
		cfg.Base = req.Base
	}

	l.createAndJoin(session, cfg, req.Rounds)
}

func (l *Lobby) createAndJoin(session *cproto.Session, cfg game.Config, rounds int) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	id := l.newRoomID()

	nick := "玩家"
	avatar := ""

	if u, err := l.store.Profile(int64(session.Uid)); err == nil {
		nick = u.Nick
		avatar = u.Avatar
	}

	room := NewRoom(id, cfg, rounds, l.store, &JoinReq{
		UID:    int64(session.Uid),
		RoomID: id,
		Nick:   nick,
		Avatar: avatar,
	})

	if _, err := l.App().ActorSystem().CreateActor(room.AliasID(), room); err != nil {
		agent.Response(session, map[string]any{"code": 500, "msg": "创建房间失败"})

		return
	}

	l.rooms[id] = room
	agent.SetData("roomId", id)

	agent.Response(session, map[string]any{"roomId": id, "base": cfg.Base})
}

func (l *Lobby) onJoinRoom(session *cproto.Session, req *JoinReq) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	room, found := l.rooms[req.RoomID]
	if !found {
		agent.Response(session, map[string]any{"code": 404, "msg": "房间不存在"})

		return
	}

	agent.SetData("roomId", room.id)

	nick := "玩家"
	if u, err := l.store.Profile(int64(session.Uid)); err == nil {
		nick = u.Nick
	}

	l.Call(room.PathString(), "join", &JoinReq{
		UID:    int64(session.Uid),
		RoomID: room.id,
		Nick:   nick,
	})

	agent.Response(session, map[string]any{"roomId": room.id})
}

func (l *Lobby) onLeaveRoom(session *cproto.Session, _ *Empty) {
	agent, ok := pomelo.GetAgentWithSID(session.Sid)
	if !ok {
		return
	}

	id := agent.GetData("roomId")
	if id == "" {
		return
	}

	if room, found := l.rooms[id]; found {
		l.Call(room.PathString(), "offline", &UIDReq{UID: int64(session.Uid)})
	}

	agent.SetData("roomId", "")
}

func (l *Lobby) onOffline(req *UIDReq) {
	for _, room := range l.rooms {
		l.Call(room.PathString(), "offline", req)
	}
}

func (l *Lobby) onRemove(req *JoinReq) {
	room, found := l.rooms[req.RoomID]
	if !found {
		return
	}

	delete(l.rooms, req.RoomID)
	room.Exit()
}

func (l *Lobby) newRoomID() string {
	l.seq++

	r := rand.New(rand.NewSource(time.Now().UnixNano() + int64(l.seq)))

	return fmt.Sprintf("%06d", 100000+r.Intn(899999))
}

/* ===========================================================
 * 掼蛋联机服务端（Go + cherry 框架）
 *
 * 启动：
 *   go run . -profile etc/profile/dev.json -node guandan-1
 *   或编译后：./guandan-server -profile etc/profile/prod.json
 *
 * 组成部分：
 *   - 接入：cherry websocket connector + simple 协议（mid + len + JSON）
 *   - 业务：room actor（串行处理全部房间，见 actor/actor.go）
 *   - 规则：game 包（发牌/牌型/提示/AI/升级进贡，与旧 JS 引擎逐行对齐）
 *   - 存储：store 组件（MySQL，异步落库，可降级）
 *   - HTTP：/health /rooms /top 运维接口（独立端口）
 * =========================================================== */
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	cherry "github.com/cherry-game/cherry"
	cfacade "github.com/cherry-game/cherry/facade"
	clog "github.com/cherry-game/cherry/logger"
	cherryConnector "github.com/cherry-game/cherry/net/connector"
	simple "github.com/cherry-game/cherry/net/parser/simple"
	cserializer "github.com/cherry-game/cherry/net/serializer"

	"github.com/zbcx/whmj/guandan/actor"
	"github.com/zbcx/whmj/guandan/protocol"
	"github.com/zbcx/whmj/guandan/room"
	"github.com/zbcx/whmj/guandan/store"
)

func main() {
	profile := flag.String("profile", envOr("GD_PROFILE", "etc/profile/dev.json"), "profile 配置路径")
	nodeID := flag.String("node", envOr("GD_NODE", "guandan-1"), "节点 ID")
	agentID := flag.String("agent", "agent", "agent actor ID")
	flag.Parse()

	cfg := room.DefaultConfig()
	if v := os.Getenv("GD_TURN_MS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cfg.TurnMS = time.Duration(n) * time.Millisecond
		}
	}
	if v := os.Getenv("GD_BOT_DELAY"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cfg.BotDelay = time.Duration(n) * time.Millisecond
		}
	}
	if v := os.Getenv("GD_SETTLE_MS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			cfg.SettleMS = time.Duration(n) * time.Millisecond
		}
	}

	app := cherry.Configure(*profile, *nodeID, true, cherry.Standalone)
	app.SetSerializer(cserializer.NewJSON())

	roomActor := actor.New(cfg)
	sto := store.New()
	app.Register(sto)
	app.AddActors(roomActor)

	// WebSocket 接入
	wsAddr := app.Address()
	if v := os.Getenv("GD_WS_ADDR"); v != "" {
		wsAddr = v
	}
	if wsAddr == "" {
		wsAddr = "0.0.0.0:9102"
	}
	ws := cherryConnector.NewWS(wsAddr)

	parser := simple.NewActor(*agentID)
	parser.AddConnector(ws)
	for mid, fn := range protocol.Routes {
		parser.AddNodeRoute(mid, &simple.NodeRoute{
			NodeType: app.NodeType(),
			ActorID:  actor.ActorID,
			FuncName: fn,
		})
	}

	// 自定义数据路由：直接投递给 room actor（不走 agent 子 actor 路径）
	parser.SetOnDataRoute(func(agent *simple.Agent, msg *simple.Message, route *simple.NodeRoute) {
		session := agent.NewSession(msg.MID)
		m := cfacade.GetMessage()
		m.Source = session.AgentPath
		m.Target = cfacade.NewPath(agent.NodeID(), route.ActorID)
		m.FuncName = route.FuncName
		m.Session = session
		m.Args = msg.Data
		agent.ActorSystem().PostLocal(m)
	})

	// 连接建立：注册断线回调 + 回 hello
	parser.SetOnNewAgent(func(agent *simple.Agent) {
		agent.AddOnClose(func(a *simple.Agent) {
			roomActor.PostOffline(a.SID())
		})
		if data, err := json.Marshal(&protocol.HelloResp{T: "hello", TS: time.Now().UnixMilli()}); err == nil {
			agent.SendRaw(actor.Pack(protocol.MidHello, data))
		}
	})

	app.SetNetParser(parser)

	go startHTTP(app, sto)
	app.Startup()
}

func startHTTP(app cfacade.IApplication, sto *store.Component) {
	addr := "0.0.0.0:9103"
	if s := app.Settings(); s != nil {
		if v := s.GetString("http_addr", ""); v != "" {
			addr = v
		}
	}
	if v := os.Getenv("GD_HTTP_ADDR"); v != "" {
		addr = v
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, map[string]any{
			"ok": true, "node": app.NodeID(), "rooms": actor.M.Rooms.Load(),
			"players": actor.M.Humans.Load(), "rounds": actor.M.Rounds.Load(),
			"db": sto.Stats(), "ts": time.Now().UnixMilli(),
		})
	})
	mux.HandleFunc("/rooms", func(w http.ResponseWriter, _ *http.Request) {
		v := actor.Snapshot.Load()
		if v == nil {
			writeJSON(w, []any{})
			return
		}
		writeJSON(w, v)
	})
	mux.HandleFunc("/top", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, sto.TopPlayers(20))
	})
	mux.HandleFunc("/rounds", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, sto.RecentRounds(20))
	})

	clog.Infof("[http] 运维接口监听 %s (/health /rooms /top /rounds)", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		clog.Warnf("[http] 启动失败: %v", err)
	}
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	data, err := json.Marshal(v)
	if err != nil {
		w.WriteHeader(500)
		fmt.Fprint(w, `{"ok":false}`)
		return
	}
	_, _ = w.Write(data)
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// Command whmj 是武汉赖子麻将 H5 的游戏服务端。
//
// 单进程单节点：cherry Application 承载 actor 运行时与 WebSocket 连接，
// 同一进程内再挂一个 HTTP 服务提供登录、资料与战绩查询。
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strconv"

	"github.com/cherry-game/cherry"
	cfacade "github.com/cherry-game/cherry/facade"
	cconnector "github.com/cherry-game/cherry/net/connector"
	"github.com/cherry-game/cherry/net/parser/pomelo"
	pmessage "github.com/cherry-game/cherry/net/parser/pomelo/message"
	cproto "github.com/cherry-game/cherry/net/proto"
	cserializer "github.com/cherry-game/cherry/net/serializer"

	"github.com/zbcx/whmj/internal/server"
	"github.com/zbcx/whmj/internal/store"
)

func main() {
	profilePath := flag.String("profile", "config/whmj.json", "profile 配置文件路径")
	nodeID := flag.String("node", "whmj-1", "节点 id")
	nodeType := flag.String("type", "whmj", "节点类型，需与 profile 中的分组名一致")
	httpAddr := flag.String("http", env("MJ_HTTP_ADDR", "127.0.0.1:9110"), "HTTP 监听地址")
	flag.Parse()

	st := store.Open(store.Options{
		DSN:       env("MJ_DSN", ""),
		RedisAddr: env("MJ_REDIS_ADDR", ""),
		RedisPass: env("MJ_REDIS_PASS", ""),
		RedisDB:   envInt("MJ_REDIS_DB", 4),
	})

	app := cherry.Configure(*profilePath, *nodeID, true, cherry.Standalone)
	app.SetSerializer(cserializer.NewJSON())

	parser := pomelo.NewActor("gate")
	parser.AddConnector(cconnector.NewWS(app.Address()))
	parser.SetOnNewAgent(func(agent *pomelo.Agent) {
		agent.AddOnClose(func(a *pomelo.Agent) {
			if !a.IsBind() {
				return
			}

			// 同一账号可能已经在新的连接上重连成功（手机切网、锁屏唤醒），
			// 此时旧连接的关闭不能把玩家踢下线，否则重连后会一直提示未连接。
			if sid, found := pomelo.GetSID(int64(a.UID())); found && sid != a.SID() {
				return
			}

			parser.Call(".lobby", "offline", &server.UIDReq{UID: int64(a.UID())})
		})
	})
	parser.SetOnDataRoute(dataRoute(*nodeID, *nodeType, st))
	app.SetNetParser(parser)

	app.AddActors(server.NewLobby(st))
	app.Register(server.NewHTTP(*httpAddr, st))

	fmt.Printf("[whmj] 节点 %s 启动，WS=%s HTTP=%s 存储=%s\n",
		*nodeID, app.Address(), *httpAddr, map[bool]string{true: "memory", false: "postgres"}[st.Memory()])

	app.Startup()
}

// dataRoute 把客户端消息分派到大厅 actor 或对应房间 actor。
//
// 路由格式：{nodeType}.{handleName}.{method}
//   - mahjong.gate.auth    绑定令牌，是全流程中唯一允许未登录调用的接口
//   - mahjong.lobby.*      大厅操作
//   - mahjong.room.*       房间操作，房间号取自连接上的 roomId
func dataRoute(nodeID, nodeType string, st *store.Store) pomelo.DataRouteFunc {
	return func(agent *pomelo.Agent, route *pmessage.Route, msg *pmessage.Message) {
		if route.NodeType() != nodeType {
			return
		}

		session := agent.NewSession(msg.ID)

		if route.HandleName() == "gate" && route.Method() == "auth" {
			auth(agent, session, msg, st)

			return
		}

		if !session.IsBind() {
			agent.Response(session, map[string]any{"code": 401, "msg": "请先登录"})

			return
		}

		switch route.HandleName() {
		case "lobby":
			pomelo.LocalDataRoute(agent, route, msg, cfacade.NewPath(nodeID, "lobby"))
		case "room":
			roomID := agent.GetData("roomId")
			if roomID == "" {
				agent.Response(session, map[string]any{"code": 404, "msg": "尚未进入房间"})

				return
			}

			pomelo.LocalDataRoute(agent, route, msg, cfacade.NewPath(nodeID, "room_"+roomID))
		}
	}
}

// auth 校验令牌并把 uid 绑定到当前连接。
func auth(agent *pomelo.Agent, session *cproto.Session, msg *pmessage.Message, st *store.Store) {
	var req struct {
		Token string `json:"token"`
	}

	if err := json.Unmarshal(msg.Data, &req); err != nil {
		agent.Response(session, map[string]any{"code": 400, "msg": "参数格式错误"})

		return
	}

	uid, ok := st.UIDByToken(req.Token)
	if !ok {
		agent.Response(session, map[string]any{"code": 401, "msg": "令牌无效或已过期"})

		return
	}

	if _, err := agent.Bind(cfacade.UID(uid)); err != nil {
		agent.Response(session, map[string]any{"code": 500, "msg": "绑定失败"})

		return
	}

	nick, avatar := "玩家", ""

	if u, err := st.Profile(uid); err == nil {
		nick = u.Nick
		avatar = u.Avatar
	}

	agent.Response(session, map[string]any{
		"code":   0,
		"uid":    uid,
		"nick":   nick,
		"avatar": avatar,
	})
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}

	return def
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}

	return def
}

# 掼蛋服务端（Go + cherry）

基于 [cherry](https://github.com/cherry-game/cherry)（v1.6.9，Go 1.24+）重写的掼蛋联机服务端，
替换原先的 Node.js + ws 实现。规则引擎逐行移植自 `server/game/engine`（JS 版），并对拍验证一致。

## 为什么用 cherry

| 维度 | Node 版 | Go + cherry |
|---|---|---|
| 并发模型 | 单线程事件循环 | Actor 模型，每房间操作串行、无锁 |
| 定时器 | `setTimeout` + 手动 clear | 定时消息回投 actor，天然有序，不会回调乱序 |
| 接入 | 裸 WebSocket + JSON | connector + parser + 路由表，协议头标准化 |
| 观测 | console | zap 结构化日志 + `/health` `/rooms` 指标 |
| 存储 | 无 | gorm + MySQL，异步落库，可降级 |

## 目录

```
server-go/
├── main.go                  装配：profile / serializer / ws connector / 路由 / http
├── actor/actor.go           RoomActor：一个 actor 承载全部房间（可横向拆片）
├── room/room.go             房间状态机（座位 / 开局 / 回合 / 结算 / 托管 / 掉线）
├── game/                    规则引擎（card / rule / hint / table / ai）
├── store/store.go           MySQL 组件（gorm，异步写队列）
├── protocol/mid.go          消息号 + 请求/响应结构
├── etc/profile/             dev.json / prod.json
├── testdata/                对拍用例与生成脚本
└── tools/ws_client.py       联调客户端（simple 协议）
```

## 协议

沿用 cherry **simple** 协议：`mid(uint32 BE) + dataLen(uint32 BE) + JSON body`。
JSON 字段与旧版完全一致，只是外面多了 8 字节头。

| 方向 | mid | 说明 |
|---|---|---|
| C→S | 1 join / 2 start / 3 addBot / 4 removeBot / 5 play / 6 pass / 7 leave / 8 ping / 9 ready |
| S→C | 100 joined / 101 sync / 102 settle / 103 error / 104 pong / 105 hello / 106 left |

前端 `src/game/net.js` 负责编解码，业务层（GameScene）无感知。

## 本地运行

```bash
# 需要 Go 1.24+
go build -o guandan-server .
./guandan-server -profile etc/profile/dev.json -node guandan-1
# WS: ws://127.0.0.1:9102/   运维: http://127.0.0.1:9103/health
```

可用环境变量加速调试：

```bash
GD_BOT_DELAY=60 GD_TURN_MS=5000 GD_SETTLE_MS=1200 ./guandan-server
```

## 测试

```bash
# 规则引擎对拍（需要先有用例文件）
node testdata/gen_cases.mjs  > testdata/cases.json     # 4000 组 parse + 400 组 hint
node testdata/gen_rounds.mjs > testdata/rounds.json    # 8 个 seed × 3 局整局
go test ./game -v

# 完整对局联调（服务端需已启动）
python3 tools/ws_client.py --name 阿军 --create
```

对拍覆盖：

- `parse` 4000 例：牌型 id / count / len / power / typeWeight / isBomb 全字段一致
- `hint` 400 例：候选数量、顺序、牌面集合一致
- `rounds` 8 seed × 3 局：名次、升级、双下、抗贡、进贡关系、最终级牌全部一致

> 洗牌 RNG 与 JS 版逐位对齐（注意 JS 的 `>>` 是算术右移），同 seed 可完全复现牌局。

## MySQL

`store` 是 cherry 组件，配置在 profile 的 `db` 段；也可用 `GD_MYSQL_DSN` 直接覆盖：

```
GD_MYSQL_DSN='user:pass@tcp(127.0.0.1:3306)/guandan?charset=utf8mb4&parseTime=True&loc=Local'
```

启动时自动建表：

| 表 | 用途 |
|---|---|
| `gd_round` | 每局对战记录（房号、局数、胜方、升级、名次、玩家名、人数） |
| `gd_player` | 玩家战绩（按客户端持久化 uid 累计局数/胜/负/积分） |

写库走 512 缓冲的异步队列，DB 故障不影响打牌；未配置 DB 时自动降级为内存模式。

## 运维接口

| 路径 | 说明 |
|---|---|
| `GET /health` | 房间数、在线玩家、累计局数、DB 状态 |
| `GET /rooms` | 房间快照（状态/人数/座位名） |
| `GET /top` | 积分排行榜（需启用 MySQL） |
| `GET /rounds` | 最近 20 局记录（需启用 MySQL） |

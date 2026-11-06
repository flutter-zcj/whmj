# 武汉赖子麻将 · H5 复刻版

> 参考对象：应用宝《武汉赖子麻将》`com.wuhanlaizi.yyb` v6.3.4
> 技术栈：**uni-app(Vue3) + Phaser 3** 前端，**Go + cherry** 服务端，H5 横屏 1334×750

在线地址：<https://60.204.248.157:8081/whmj/>（自签证书，浏览器需忽略告警）

## 1. 项目结构

```
whmj/
├── web/                        前端（基于 flutter-zcj/prjtmpl 模板工程）
│   ├── src/pages/whmj/         login.vue 登录 · index.vue 大厅 · table.vue 牌桌
│   ├── src/utils/whmj/         api/http/socket/pomelo/protocol/audio/const/table(scene.js)
│   ├── src/static/whmj/        牌面、图标、音效、生成资源（gen/）
│   └── tools/gen_whmj_art.py   美术资源生成器（PIL，无外部素材）
├── server/                     服务端（Go 1.24 + cherry v1.6.9）
│   ├── main.go                 cherry Application：pomelo 解析器 + WS 连接器 + HTTP
│   ├── internal/rule/          牌面模型、赖子胡牌判定、番型
│   ├── internal/game/          牌局状态机（发牌/出牌/碰杠胡/结算/机器人）
│   ├── internal/server/        lobby / room actor、HTTP 接口、协议结构
│   ├── internal/store/         账号与战绩持久化（PG + Redis，可降级内存）
│   └── config/whmj.json        cherry profile（节点分组与监听地址）
├── deploy/                     nginx 片段、systemd 单元、环境变量样例
└── docs/游戏资源分析.md         美术/图片/音乐/UI 规格与实现映射（唯一视觉依据）
```

## 2. 规则实现

| 项 | 实现 |
| --- | --- |
| 牌张 | 112 张：万/筒/条 1-9 各 4 张 + 红中 4 张 |
| 编码 | `1..9` 万、`10..18` 筒、`19..27` 条、`28` 红中，前后端共用同一套整数约定 |
| 赖子 | 红中在 `rule.CanWin` 中作为万能牌参与拆解（`canFormMeldsJoker`），七对按赖子补对 |
| 动作 | 碰、明杠、暗杠、补杠、红中杠；不吃 |
| 番型 | 平胡/碰碰胡/清一色/七对/龙七对/清七对/清龙七对/杠上花/抢杠胡/海底捞月/根/赖子/红中杠，封顶 4 番 |
| 结算 | 底分 × 2^番；自摸三家付，点炮一家付；杠分即时结算 |

规则单测：`cd server && go test ./...`（含零和校验、发牌张数、赖子听牌）。

## 3. 通信协议

WebSocket（cherry pomelo，JSON 序列化），路由前缀即节点类型 `whmj`：

| 方向 | 路由 | 说明 |
| --- | --- | --- |
| C→S | `whmj.gate.auth` | 握手后绑定 token |
| C→S | `whmj.lobby.enter` / `list` / `quickStart` / `createRoom` / `joinRoom` | 大厅 |
| C→S | `whmj.room.sync` / `ready` / `discard` / `action` / `leave` | 牌桌 |
| S→C | `onDeal` `onDraw` `onDiscard` `onTurn` `onAsk` `onActionDone` `onSync` `onGameOver` `onRoomState` | 下行事件 |

HTTP（前缀 `/whmj-api/`）：`POST /login`、`POST /register`、`GET|POST /profile`、`POST /records`、`GET /plays`。

## 4. 本地开发

```bash
# 前端
cd web && npm install --ignore-scripts && npm run dev:h5     # http://localhost:5173/whmj/

# 服务端（Go 1.24+；无 PG/Redis 时自动降级内存实现）
cd server && go run . -profile config/whmj.json -node whmj-1 -type whmj -http 127.0.0.1:9110
```

## 5. 构建与部署

```bash
# 前端产物：web/dist/build/h5（h5.router.base=/whmj/）
cd web && npm run build:h5

# 服务端：CentOS 7 是 glibc 2.17，必须静态链接
cd server && CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o whmj .
```

服务器布局：

| 项 | 值 |
| --- | --- |
| 静态站点 | `/www/wwwroot/whmj` |
| 服务端 | `/www/wwwroot/whmj-server/{whmj,etc/whmj.json,etc/whmj.env}` |
| systemd | `zbcx-whmj`（`systemctl enable --now zbcx-whmj`） |
| 端口 | HTTP `127.0.0.1:9110`、WS `:9111`（仅监听本机，由 nginx 反代） |
| 数据库 | `zbcx_whmj`（PostgreSQL 18） |
| Redis | DB `6` |
| 外网入口 | `https://60.204.248.157:8081/whmj/`、`/whmj-api/`、`/whmj-ws/` |

部署顺序：建库 → 传二进制与 `etc/` → 起 systemd → nginx 追加 `deploy/nginx-whmj.conf` 片段 → `nginx -t && nginx -s reload` → 前端「先删后拷」（保留 `uploads`）→ 浏览器验收。

## 6. 验收记录

| 项 | 结果 |
| --- | --- |
| 首页 200、无 console error / pageerror | 通过 |
| 游客一键开局 → 大厅 → 武汉麻将 → 牌桌 | 通过 |
| 手牌 13 张、牌墙 59 张（112-53） | 通过 |
| 出牌进入中央牌池、三家 AI 自动跟打 | 通过 |
| 红中牌面渲染（`tile_z1`） | 通过 |
| 商城 6 档礼包 + 三页签 | 通过 |
| 隐私指引 / 防沉迷 / 防作弊 三个弹窗 | 通过 |
| Vue 编码规范（`check_std.py`） | index/table/login 三个页面 0 不合规 |
| Go 规范（`gofmt -l` 无输出、`go vet`、`go test`） | 通过 |

## 7. 已知边界

- 支付为模拟，未接入任何支付 SDK；登录为账号体系，不含微信/QQ 登录。
- 四川麻将、拖垃圾、斗地主、卡五星、跑得快五个入口为占位（点击提示「即将上线」）。
- 美术为按 Style Guide 重绘，非原包素材；原包 `res.dat` 加密，无法也无意提取其像素与音频。

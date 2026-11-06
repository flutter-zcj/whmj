# 武汉赖子麻将 · H5 复刻版

> 参考对象：应用宝《武汉赖子麻将》`com.wuhanlaizi.yyb` v6.3.4
> 技术栈：**uni-app(Vue3) + Phaser 3** 前端，**Go + cherry** 服务端，H5 横屏 1334×750

在线地址：<https://60.204.248.157:8081/whmj/>（自签证书，浏览器需忽略告警）
代码仓库：<https://github.com/flutter-zcj/whmj>

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
| 皮子与赖子 | 发牌后翻一张定皮子，皮子同花色下一张（9→1）为赖子；红中固定为皮子，两者都只能单张杠 |
| 手上留皮不能胡 | `rule.HasPiZi` 检查手牌，红中或皮子未杠出去则 `AnalyzeWin` 直接判否 |
| 赖子 | `AnalyzeWin` 剥离赖子后按 4 面子 + 1 将拆解，`fillMelds` 用赖子补缺张 |
| 动作 | 吃（仅下家，顺子）、碰、明杠、暗杠、补杠；红中杠、皮子杠、赖子杠为单张特殊杠，不占面子 |
| 开口 | 吃/碰/明杠各记一次；杠皮子赖子红中与暗杠不算开口；`Opened == 0` 时不能胡 |
| 胡型 | 4 面子 + 1 将；无七对（武汉麻将不设七对与门前清） |
| 小胡 | 必须二、五、八做将，最多 1 张赖子，1 番底 + 庄/自摸或放冲/硬胡/开口/各类杠 |
| 大胡 | 碰碰胡、清一色、将一色、全求人、杠上花、海底捞、抢杠，可叠加，3 番起 |
| 结算 | 底分 × 2^番，封顶 6 番；一炮单响，点炮者付双份、其余两家各付一份；杠只计番不即时结算 |

起胡门槛默认小胡 3 番、大胡 1 番（`game.Config.MinFanSmall/MinFanBig`），休闲局避免频繁荒庄。

规则单测：`cd server && go test ./...`（含零和校验、翻皮子、吃牌开口、留皮禁胡、特殊杠）。

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
| 大厅 7 个玩法卡（武汉/四川/拖拉机/斗地主/卡五星/晃晃/跑得快） | 通过，无重名 |
| 大厅竖屏自动横置，非 16:9 屏用同图模糊铺底 | 通过（390×844 / 844×390 / 1024×768 / 1920×1080） |
| 翻皮子定赖子、红中与皮子单张杠、开口才能胡 | 通过（`rule/round.go`、`game/canHu`） |
| 吃牌（仅下家）与开口计数 | 通过（`TestChiFlow`）|
| 留皮子/红中禁胡、小胡二五八将、无七对 | 通过（`TestPiZiNoHu` / `TestNoOpenNoHu`）|
| 牌桌 HUD 不遮挡手牌（提示条 `top:552`，手牌顶 `646`） | 通过 |
| Vue 编码规范（`tools/check_std.py`） | index/table/login 三个页面 0 不合规 |
| Go 规范（`gofmt -l` 无输出、`go vet`、`go test`） | 通过 |

## 7. 已知边界

- 支付为模拟，未接入任何支付 SDK；登录为账号体系，不含微信/QQ 登录。
- 四川麻将、拖拉机、斗地主、卡五星、晃晃、跑得快六个入口为占位（点击提示「即将上线」）。
- 美术为按 Style Guide 重绘，非原包素材；原包 `res.dat` 加密，无法也无意提取其像素与音频。

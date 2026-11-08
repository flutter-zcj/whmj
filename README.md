# 武汉赖子麻将 · H5 复刻版

> 参考对象：应用宝《武汉赖子麻将》`com.wuhanlaizi.yyb` v6.3.4
> 技术栈：**uni-app(Vue3) + Phaser 3** 前端，**Go + cherry** 服务端，H5 横屏 1334×750
>
> 开源参考（**思路参考 + 素材复用，非代码移植**）：
> - [xiyoufang/mahjong](https://github.com/xiyoufang/mahjong)：C++ `GameLogic/GameCmd/AIEngine`，参考其牌局状态机、操作优先级与 AI 决策骨架；**牌桌与结算 UI 已用其 `Resources/res` 原版素材高保真复刻**（绿绒布台面、金边罗盘、圆形过/碰/胡按钮、胜利绸带卷轴）；
> - [fwhappy/mahjong](https://github.com/fwhappy/mahjong)：Go `win/ting/suggest/weight/wall`，参考其胡牌拆解、听牌枚举与出牌建议思路，落地为 `internal/rule/win.go` 的 `TingList/TingMap`；
> - [xYajun/XianLaiGame](https://github.com/xYajun/XianLaiGame)：提供大厅、牌面、牌桌、结算、操作按钮 PNG 素材（183 个，见 `web/src/static/whmj/xl/`）。
>
> 三个项目均非「武汉红中赖子杠」规则，故规则层仍以本项目 `internal/rule` + `internal/game` 为准，差异与取舍见第 7 节。

在线地址：<https://60.204.248.157:8081/whmj/>（自签证书，浏览器需忽略告警）
代码仓库：<https://github.com/flutter-zcj/whmj>

## 1. 项目结构

```
whmj/
├── web/                        前端（基于 flutter-zcj/prjtmpl 模板工程）
│   ├── src/pages/whmj/         login.vue 登录 · index.vue 大厅 · table.vue 牌桌
│   ├── src/utils/whmj/         api/http/socket/pomelo/protocol/audio/const/table(scene.js)
│   ├── src/static/whmj/        牌面、图标、音效、生成资源（gen/）
│   │   ├── xl/                  XianLaiGame 素材：hall/tile/table/result/action
│   │   ├── xyf/table/pointer.png  出牌指示水滴指针（PIL 自绘）
│   │   ├── audio/voice/        28 个牌名语音素材 t1..t28.mp3（中文 TTS 生成，仅别人出牌时播报）
│   │   └── xyf/                 xiyoufang/mahjong 原版牌桌与结算素材（table/result）
│   └── tools/gen_whmj_art.py   美术资源生成器（PIL，无外部素材）
├── server/                     服务端（Go 1.24 + cherry v1.6.9）
│   ├── main.go                 cherry Application：pomelo 解析器 + WS 连接器 + HTTP
│   ├── internal/rule/          牌面模型、赖子胡牌判定、番型
│   ├── internal/game/          牌局状态机（发牌/出牌/碰杠胡/结算/机器人）
│   ├── internal/server/        lobby / room actor、HTTP 接口、协议结构
│   ├── internal/store/         账号与战绩持久化（PG + Redis，可降级内存）
│   └── config/whmj.json        cherry profile（节点分组与监听地址）
├── deploy/                     nginx 片段、systemd 单元、环境变量样例
├── docs/游戏资源分析.md         美术/图片/音乐/UI 规格与实现映射（唯一视觉依据）
├── docs/原版APK逆向分析.md      craft-anything 逆向记录：密钥、资源包、原版番型表
├── docs/reference/wuhanmj-lua/  原版 WuHanMJ 24 个 Lua 脚本（仅供规则比对）
└── tools/xxtea.c               Cocos XXTEA 解密工具（签名 + 密钥见逆向分析文档）
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
| 一炮单响 | `game/settle.go` 按出牌方向只取最近一家胡牌，一局最多一个赢家（`TestSingleHuPerRound` 120 局校验） |
| 听牌提示 | `rule.TingList/TingMap` 枚举听口，服务端 `onTing` 每次手牌变化后按座位推送；前端 `tingTips` 数据保留，但按用户反馈已移除底部常驻状态条，不再显示文字提示 |

起胡门槛默认小胡 3 番、大胡 1 番（`game.Config.MinFanSmall/MinFanBig`），休闲局避免频繁荒庄。

规则单测：`cd server && go test ./...`（含零和校验、翻皮子、吃牌开口、留皮禁胡、特殊杠）。

## 3. 通信协议

WebSocket（cherry pomelo，JSON 序列化），路由前缀即节点类型 `whmj`：

| 方向 | 路由 | 说明 |
| --- | --- | --- |
| C→S | `whmj.gate.auth` | 握手后绑定 token |
| C→S | `whmj.lobby.enter` / `list` / `quickStart` / `createRoom` / `joinRoom` | 大厅 |
| C→S | `whmj.room.sync` / `ready` / `discard` / `action` / `leave` | 牌桌 |
| S→C | `onDeal` `onDraw` `onDiscard` `onTurn` `onAsk` `onActionDone` `onTing` `onSync` `onGameOver` `onRoomState` | 下行事件；`onTing` 带 `tips`，快照带 `tingTips`（`{discard, tiles}`） |

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
| 牌桌 HUD 不遮挡手牌（底部无状态条、无「出牌」按钮，点手牌即出牌） | 通过 |
| Vue 编码规范（`tools/check_std.py`） | index/table/login 三个页面 0 不合规 |
| Go 规范（`gofmt -l` 无输出、`go vet`、`go test`） | 通过 |
| 断线自动恢复：拔掉网关后 0.7s 整页重开、自动回房并同步牌局 | 通过（本地断代理复现） |
| 吃牌后能正常出牌（服务端整组校验 + 快照回推） | 通过（`TestChiThenDiscard` / `TestChiWithoutTiles`） |
| 旧连接关闭不误踢重连后的玩家 | 通过（`main.go` 按 sid 比对） |
| XianLaiGame 素材入库（183 PNG）并重绘牌面、大厅、结算 | 通过 |
| 大厅木质金框 + 水墨背景 + 人物立绘；隐私/防沉迷弹窗只提示一次 | 通过（浏览器截图） |
| 胜负结算面板：旗标/头像/番型/本局分/累计分守恒、金棕按钮 | 通过（浏览器截图） |
| 一炮单响：120 局模拟无多家同胡、赢家得分恒为正 | 通过（`TestSingleHuPerRound`） |
| 听牌提示：轮到自己推「打哪张听什么」，等牌时推「已听」 | 通过（`onTing` 3 条 / 1 条；前端常驻提示条后续按用户反馈移除，数据通道保留） |
| 心跳间隔改为服务端超时的一半，避免 60s 掉线 | 通过（`pomelo.js`） |
| 刷新页面自动回房并恢复牌局进度 | 通过（房号 140884，第 3/59 手恢复） |
| 全量回归：`go build/vet/test`、`npm run build:h5` | 通过 |
| 牌桌按 xiyoufang/mahjong README 截图复刻：绿绒布台面 + 中央淡龙纹 + 金边方形罗盘 + 黄数码管 + 「剩余 N 张」胶囊 + 亮黄绿牌墙 + 青框头像 | 通过（浏览器截图） |
| 操作按钮改为原版圆形发光底 + 过/碰/杠/胡字牌（胡为倾斜麻将牌造型，最大最醒目） | 通过（浏览器截图） |
| 胜负/流局结算改为红色绸带横幅 + 米黄卷轴 + 四家头像/手牌缩略图/分数 + 胡旗/庄标/关闭按钮 | 通过（浏览器截图） |
| 结算快照携带 `hand`（`ServerPlayer.Hand`），供四家手牌缩略图渲染 | 通过（`go test` + 浏览器） |
| 我的手牌放大（66×92 → 112×162 上限，13/14 张实际约 105/98 宽），牌间距 -6 轻微叠放做到牌间无缝，副露与座位卡上移让出整条底部 | 通过（浏览器截图） |
| 弃牌放大（34×42 → 50×62）并收紧列距，四家互不重叠；最后打出的牌在对应方位放大 2 倍 + 金框 | 通过（浏览器截图） |
| 橙色水滴指针指向全场最后一张打出牌，带浮动动画；`onDiscard` 与快照 `last`/`lastSeat` 双向还原，断线重连不丢失 | 通过（浏览器实测注入 + 真实对局） |
| 左上角皮子/赖子改「小牌面图 + 文字」左右排布深色卡片，赖子带金色「赖」角标与金边，随翻牌动态更新 | 通过（浏览器截图） |
| 按体验反馈再调整：牌名播报改为仅别人出牌时触发（自己出牌安静不打断摸牌，短促出牌音效保留）；移除底部「轮到你出牌…N 张可打进听」常驻提示条；临时操作反馈移至画面顶部不再压住手牌 | 通过（浏览器截图 + 真实对局） |
| 手牌里的赖子牌加金色「赖」角标与金框底（随 `laiZi` 传入画布），副露（碰/杠）区同步放大；移除「出 牌」按钮 | 通过（浏览器截图 + 真实对局） |
| 按反馈去掉 `onDraw` 里的 `audio.play('draw')` 摸牌音效，摸牌保持静音；`draw` 保留在音效清单与素材中备用（不播放），其余操作音效不变 | 通过（浏览器真实对局，摸牌无播放调用、对局正常） |
| 出牌改回两步确认：第一次点手牌仅选中（抬起 + `select` 选中音），再点同一张才打出；中央倒计时上方新增「轮到你出牌 / 轮到 XX 出牌」胶囊，轮到自己时金色高亮 + 倒计时外圈金色脉冲，别人行动时青色 | 通过（浏览器真实对局：首次点击手牌 14→14 且选中、二次点击 14→13；`pageerror: 0`） |
| 大厅弹窗层级修复：中间装饰牌 `main__tile--b` 原带 `z-index:2`，会穿透商城/隐私/通知弹窗；给 `.sheet` 补 `z-index:20`、`.dlg` 补 `z-index:30`、`.toast` 补 `z-index:60` | 通过（`elementFromPoint` 命中 `pack__tag`、`topInSheet:true`；截图无穿透） |
| 手牌赖子常驻显示：`applyState` 在 `laiZi` 缺失时沿用上次值，倒计时每秒刷新也会带上 `laiZi`，修复「只有抓牌瞬间显示、之后消失」 | 通过（场景 `state.laiZi` 与组件一致；注入赖子牌截图见金色「赖」角标+金框） |
| 中央倒计时改四方位出牌指示：用原版 `xyf/table/time0..3.png`（上/下/左/右各一张，箭头贴方块边指向该家，ADD 混合发光）+ 金色小三角，去掉「轮到你出牌 / 轮到 XX 出牌」文字胶囊；「剩余 N 张」移入方块内 | 通过（真实对局 turn 0/2 与注入 turn 1/3 四个方向截图，光带与箭头均正确定向，`pageerror: 0`） |
| 左右两家弃牌看不清的修复：原竖向列距 46、横向步长 40，均小于牌面 62×50，导致整列互相压叠；四家牌池重新分区（左右各 3 列 × 4 张、上下各 8 列 × 2 行，列距 52/56、行距 62/68），场景内两两矩形检测重叠对数 **0**；最后一张打出牌放大倍数 2 → 1.5，避免盖住同列邻居；操作按钮组整体左移（`.ops` left 500→380），2~4 个按钮时不再压住右侧牌池 | 通过（注入 16 张弃牌几何检测 0 重叠 + 真实对局截图，四家牌面全部可读；按钮 DOM 实测 540~840，两侧牌池边界 436/870） |
| 大厅 `onUnload` 报 `TypeError: F.close is not a function`：`socket` 模块只导出 `destroy()`，页面里误调 `socket.close()`；`onUnload` 与 `logout` 两处改为 `socket.destroy()` | 通过（点用户信息触发 `logout` → `reLaunch` 卸载大厅，`pageerror: 0`，正常跳转） |

## 7. 已知边界

- 支付为模拟，未接入任何支付 SDK；登录为账号体系，不含微信/QQ 登录。
- 四川麻将、拖拉机、斗地主、卡五星、晃晃、跑得快六个入口为占位（点击提示「即将上线」）。
- 牌面与大厅 PNG 取自 `xYajun/XianLaiGame`（牌面放大 2 倍），牌桌与结算 PNG 取自 `xiyoufang/mahjong` 的 `Resources/res`（43 个文件，见 `web/src/static/whmj/xyf/`），出牌水滴指针自绘；28 个牌名语音由中文 TTS 合成后转 48k MP3（约 108 KB，见 `audio/voice/`，按反馈仅在别人出牌时播报），操作音效取自原版 APK 解码资源；**不复制原版 APK 的像素与音频**。原包 `res.dat` 的加密方式已还原（XXTEA，密钥 `bzxgmj`，见 `docs/原版APK逆向分析.md`），仅用于规则比对。
- **本轮只做 UI 复刻，规则层未改**（按确认的分步方案）：`xiyoufang/mahjong` 是 136 张、含东南西北中发白的经典麻将（平胡/碰碰胡/清色/七对/钓鱼/扎鸟），`fwhappy/mahjong` 亦非武汉红中赖子杠规则。整体替换会重做牌张模型、牌面图、胡牌算法、番型、结算、AI 与全部单测，并使皮子/赖子、二五八将、开口、一炮单响失效，**136 张规则整体重写留待下一轮**。当前规则主干仍由 `internal/rule` + `internal/game` 维护，仅吸收状态机骨架与听牌枚举（`TingList`/`TingMap`）、单响结算思路；素材复刻不含任何原项目 C++ 代码。
- 牌张为 112 张（万筒条 + 红中）；原版含风牌与发/白（136 张）并支持 4 种房型与「开口番/口口番」，差异清单见逆向分析文档第 3 节。

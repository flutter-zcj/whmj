# 原版 APK 逆向分析（craft-anything + 手工复核）

> 目标：`com.wuhanlaizi.yyb` 6.3.4（武汉赖子麻将，杭州边锋）
> 工具：[craft-anything](https://github.com/storytold/craft-anything) 0.5.0（Deep 模式）
> 产出：真实规则表、真实美术/UI 结构、以及可用于对照的客户端源码
> 结论时间：2026-11-07

## 1. 结论速览

| 问题 | 结论 |
| --- | --- |
| 玩法逻辑在哪 | 全在 **Lua 脚本**里，Java/DEX 层 0 个麻将相关类（`android_classes_find mahjong` 命中 0） |
| 脚本怎么保护 | Cocos2d-x `LuaStack` 的 **XXTEA**：签名 `bianfengqipai` + 密钥 `03f0fdcbf5215b45fc790aaf2b965237` |
| 资源包 `res.dat` | 59 MB 的 **加密 ZIP**，密钥 `bzxgmj`（`BFZipUtils::_PictureXxteaKey`），解出 **2472 个文件** |
| 规则可还原度 | **100%**：`MahjongGames/WuHanMJ` 下 24 个 Lua 脚本全部可读，含番型表、结算表、操作位、房型 |
| 美术 | `res.dat` 内含 `WuHanMJ` 的 277 个 png/plist/csb，可直接对照 UI 版式 |

## 2. 证据链

### 2.1 目标识别

```bash
craft-anything-cli --deep --project ./caproj triage /root/apk/wuhanlaizi.apk
# → wuhanlaizi.apk is an Android app package
craft-anything-cli --deep --project ./caproj android-package-show --path /root/apk/wuhanlaizi.apk
```

| 项 | 值 |
| --- | --- |
| 包名 / 版本 | `com.wuhanlaizi.yyb` / 6.3.4（versionCode 未变） |
| SDK | min 21 / target 30 |
| 体积 | 79,396,099 字节 / 932 个 zip 条目 |
| 签名 | v1 + v2 + v3，**cryptographically VERIFIED**，证书 `CN=边锋, O=边锋, L=杭州, ST=浙江` |
| DEX | 4 个，11,294 个类，零个与麻将规则相关 |
| native | 仅 `arm64-v8a`，核心为 `libcocos2dcpp.so`（20.7 MB） |
| Application | `com.ymnsdk.replugin.YmnRepluginApplication`（应用宝联运壳） |

### 2.2 引擎与脚本保护

`native_strings_find` 在 `libcocos2dcpp.so` 里同时命中签名与密钥，并直接给出引用位置：

```bash
craft-anything-cli --deep --project ./caproj native-strings-find \
  /root/apk/x/lib/arm64-v8a/libcocos2dcpp.so --pattern "bianfengqipai"
```

```
address: 0xf22fc0  section: .rodata  text: bianfengqipai
references: from 0x5d7614  function _ZN11AppDelegate29applicationDidFinishLaunchingEv
```

`native-function-pseudocode` 反编译该函数，密钥与签名的赋值一目了然：

```c
sub_edd844(sp + 0xa0, "03f0fdcbf5215b45fc790aaf2b965237", xzr);   // XXTEA key (32B)
sub_edd844(sp + 0xa8, "bianfengqipai", xzr);                      // XXTEA sign (13B)
(*x5)(xzr, stack_a0, len_a0, stack_a8, len_a8, ...);              // LuaStack::setXXTEAKeyAndSign
```

即 `assets/src/*.luac` = `"bianfengqipai"` + XXTEA(明文, `03f0…5237`)。
解出来是**明文 Lua 源码**（不是字节码），例如 `src/main.lua` 的 `LaunchRes.start()`。

### 2.3 `res.dat`：59 MB 加密 ZIP

`src/LaunchRes.lua` 里写死了资源包名：

```lua
local zipList = {"res.dat"}
local zipUtils = bf.BFZipUtils:new()
zipUtils:copyZipFile(fullPath, tagFilePath)
zipUtils:start(tagFilePath, tagDirPath)
```

`BFZipUtils::decrypt` 的伪代码显示它取的是另一个静态串：

```c
x2 = *(uint64_t*)0x13c1ba0;        // &BFZipUtils::_PictureXxteaKey
xxtea_decrypt(bytes, size, x2, *(x2 - 0x18));
```

该串在 `AppDelegate` 里被赋成 `"bzxgmj"`（不足 16 字节按 0 补齐）。用这个 16 字节密钥整包解密即得标准 ZIP：

```
504b0304 …  → 2472 entries，含 src/（Lua）、res/（png/plist/csb）
```

### 2.4 客户端里能直接读到的规则

`MahjongGames/WuHanMJ/src/GameLogic/GameArea.lua`：

```lua
GameArea.RoomTypeName = {
    [1] = "红中发财杠",
    [2] = "七皮四赖红中杠",
    [3] = "红中赖子杠",
    [4] = "七皮四赖",
}
GameArea.KaiKou = { [0] = "开口番", [1] = "口口番" }
```

`Common/GameResultLayer.lua` 是**结算面板的番型表**（玩家看到的就是这张表）：

| 番型 | 底分 | 番型 | 倍数 |
| --- | --- | --- | --- |
| 屁胡 | 1 | 庄家 | ×2 |
| 将一色 | 10 | 开口 | ×2 |
| 风一色 | 10 | 硬胡 | ×2 |
| 全求人 | 10 | 红中杠 | ×2 |
| 清一色 | 10 | 发财杠 | ×2 |
| 碰碰胡 | 10 | 白板杠 | ×2 |
| 海底捞月 | 10 | 明杠 | ×2 |
| 杠上开花 | 10 | 暗杠 | ×4 |
| 抢杠和 | 10 | 赖子杠 | ×4 |
| | | 赖子皮杠 | ×2 |
| | | 自摸屁胡 | ×2 |
| | | 自摸大胡 | ×1.5 |
| | | 点炮屁胡 | ×2 |
| | | 点炮大胡 | ×1.5 |

其它可从源码直接确认的事实：

- 胡牌方式 `HU_TYPE`：自摸 `1`、点炮 `2`、**抢杠 `3`**、流局 `5`，没有「一炮多响」之外的变体。
- 面子类型 `COM_MAH_FLAG`：吃 1、碰 2、明杠 3、暗杠 4、补杠 5、暗顺 6、暗刻 7、乱杠 8、对子/将 9、财神组 10、财神将 11。
- 操作位 `POWER_ID_*`：吃 `0x004`、碰 `0x008`、和 `0x010`、直杠 `0x020`、暗杠 `0x040`、补杠 `0x080`。
- **没有七对**：`KW_WINLOST_FAN_TYPE` 里的「七对/豪华七对」属于青田等其它玩法组，武汉的 `GameResultLayer` 番型表里没有。
- 有 `风一色`、`发财杠`、`白板杠` 三个番型 → 原版牌墙**含风牌与发/白**（136 张），而不是 112 张。

## 3. 与我们实现的差异

| 维度 | 原版 | 当前实现（`whmj`） | 影响 |
| --- | --- | --- | --- |
| 牌墙 | 136 张（含东南西北中发白） | 112 张（万筒条 + 红中） | 做不出「风一色」「发财杠」「白板杠」 |
| 玩法 | 红中发财杠 / 七皮四赖红中杠 / 红中赖子杠 / 七皮四赖 | 单一「红中赖子杠」 | 房间配置缺项 |
| 开口 | 开口番 / 口口番 两种计法 | 固定「每开口 +1 番」 | 结算口径不同 |
| 番型计分 | 底分（1 / 10）× 倍数链（2、4、1.5） | 加法番 + `底分 << 番` | 分数量级完全不同 |
| 胡型 | 屁胡、碰碰胡、清一色、将一色、风一色、全求人、海底捞月、杠上开花、抢杠和 | 缺风一色、发财杠、白板杠 | 番型表不全 |

> 结论：**牌型结构（吃碰杠胡、赖子、皮子、无七对、二五八将）与原版一致；牌张集合与计分口径不一致**，这也是「规则不对」的观感来源。

## 4. 本轮已修复的两个线上缺陷

### 4.1 提示「尚未连接服务器」

根因有三层：

1. `socket.connected` 只在首次握手后置真，断线后没有任何重连，之后每次 `request` 都直接抛「尚未连接服务器」；
2. `pomelo.init({url})` 没开 `reconnect`，且 pomelo 是**全局单例**，原地 `init` 第二次不会重新握手（实测 10 s 超时）；
3. 服务端 `Agent.OnClose` 不判断「是否已被新连接接管」，旧连接关闭会把刚重连上的玩家踢成托管并清掉 `roomId`。

修复：

- `web/src/utils/whmj/socket.js`：请求统一走 `request → ensure → send`，`send` 带 8 s 超时；掉线后 0.7 s **整页重开**（5 s 内只刷一次），凭 localStorage 令牌 + 地址栏 `roomId` 自动回房；令牌 401 时停止重试并回登录页。
- `web/src/pages/whmj/table.vue`：进桌先 `joinRoom` 再 `room.sync`；订阅 `reconnecting / reconnected / expired`，重连后按快照恢复。
- `server/main.go`：`OnClose` 里比对 `pomelo.GetSID(uid)`，旧连接不再误踢新连接。

### 4.2 点了「吃」之后出不了牌

根因：`onActionDone` 的吃事件在客户端没有处理，手上少了 2 张牌但界面仍是旧手牌，选中被吃掉的那张去打，服务端 `p.Hand[tile] <= 0` 静默返回，玩家看到的就是「点不动」。

修复：

- `server/internal/game/game.go`：`doChi` 先整组校验再改手牌（避免拆到一半失败把手牌打乱），`Discard`/`Action` 返回 `bool`；
- `server/internal/server/room.go`：动作被拒时回 `409` 并把权威快照推给该座位；吃成功后补推一次 `onSync`；
- `web/src/pages/whmj/table.vue`：`applyAction` 支持 `OP_CHI`，按顺子从手牌移除两张；快照应用后清空选中态。

## 5. 复现步骤

```bash
# 1) 取 APK
curl -o wuhanlaizi.apk "http://imtt.dd.qq.com/.../com.wuhanlaizi.yyb_6.3.4.apk"

# 2) 打开目标
craft-anything-cli --deep --project ./caproj triage /root/apk/wuhanlaizi.apk

# 3) 找密钥与签名
craft-anything-cli --deep --project ./caproj native-strings-find \
  lib/arm64-v8a/libcocos2dcpp.so --pattern bianfengqipai
craft-anything-cli --deep --project ./caproj native-function-pseudocode \
  lib/arm64-v8a/libcocos2dcpp.so --function _ZN11AppDelegate29applicationDidFinishLaunchingEv

# 4) XXTEA 解密（本仓库 tools/xxtea.c）
gcc -O2 -o xxtea tools/xxtea.c
./xxtea assets/src/main.luac main.lua "03f0fdcbf5215b45fc790aaf2b965237" 13
./xxtea assets/res/res.dat res.zip "hex:627a78676d6a000000000000000000" 0
unzip res.zip -d res/
```

解出的 `MahjongGames/WuHanMJ` 24 个脚本已存放在 `docs/reference/wuhanmj-lua/`，仅作规则比对与版式参考，不参与构建、不对外分发。

## 6. 可选下一步

1. **补齐 136 张**：新增东南西北、发、白 28 张牌面，服务端 `rule.NewWall` / `Round` / 番型表同步扩展，玩法切到「七皮四赖红中杠」。
2. **计分改倍数链**：`底分(1/10) × ∏倍数`，并补「开口番 / 口口番」两种口径。
3. **房型选择**：大厅玩法卡按原版 4 种房型拆分。

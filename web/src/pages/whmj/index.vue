<style lang="scss" scoped>
$gold: #F3C76A;
$gold-light: #FFEBB0;
$gold-deep: #B07A26;
$cream: #F6EFDA;
$ink: #2A3234;
$mint: #E7F6F3;
$teal: #2BAFB3;
$teal-deep: #187A80;
$red: #C8342A;
$line: rgba(255, 224, 160, 0.42);
.page { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #2c6ea8; }
.layer { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; transform-origin: 0 0; }
.bg { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; }
.bg__veil { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; background: linear-gradient(180deg, rgba(10, 44, 70, 0.34) 0%, rgba(10, 44, 70, 0) 26%, rgba(8, 32, 24, 0.18) 76%, rgba(6, 26, 20, 0.42) 100%); }
.top { position: absolute; left: 0; top: 0; display: flex; flex-direction: row; align-items: center; width: 1334px; height: 66px; padding: 0 16px; box-sizing: border-box; }
.top__back { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin-right: 10px; background: rgba(12, 46, 66, 0.46); border: 1px solid $line; border-radius: 22px; }
.top__back-ico { position: relative; width: 24px; height: 24px; }
.player { position: relative; display: flex; flex-direction: row; align-items: center; width: 262px; height: 50px; padding: 0 12px 0 4px; box-sizing: border-box; background: rgba(9, 38, 56, 0.5); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px; }
.player__frame { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(160deg, #FFEBB0 0%, #C99A46 100%); border-radius: 22px; }
.player__face { position: relative; width: 38px; height: 38px; border-radius: 19px; }
.player__meta { position: relative; display: flex; flex-direction: column; margin-left: 8px; }
.player__nick { position: relative; font-size: 17px; font-weight: 700; line-height: 20px; color: $cream; }
.player__id { position: relative; font-size: 12px; line-height: 16px; color: rgba(246, 239, 218, 0.62); }
.res { position: relative; display: flex; flex-direction: row; align-items: center; width: 150px; height: 40px; margin-left: 14px; padding: 0 6px 0 4px; box-sizing: border-box; background: rgba(9, 38, 56, 0.5); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 20px; }
.res__ico { position: relative; width: 30px; height: 30px; }
.res__num { position: relative; flex: 1; margin-left: 4px; font-size: 18px; font-weight: 700; color: $gold-light; text-align: center; }
.res__add { position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: linear-gradient(160deg, #8CE6B6 0%, #2E9E6C 100%); border-radius: 13px; font-size: 20px; font-weight: 700; line-height: 26px; color: #12402C; text-align: center; }
.res__plus { position: relative; font-size: 19px; font-weight: 700; line-height: 26px; color: #12402C; }
.tools { position: absolute; right: 16px; top: 11px; display: flex; flex-direction: row; }
.tools__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; margin-left: 10px; background: rgba(9, 38, 56, 0.46); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 22px; }
.tools__ico { position: relative; width: 24px; height: 24px; }
.tools__dot { position: absolute; right: 4px; top: 4px; width: 9px; height: 9px; background: #FF5A4E; border: 1px solid #FFFFFF; border-radius: 5px; }
.hero { position: absolute; left: 26px; top: 196px; width: 268px; height: 560px; }
.hero__shadow { position: absolute; left: 40px; top: 700px; width: 260px; height: 36px; background: rgba(6, 30, 22, 0.34); border-radius: 130px; filter: blur(6px); }
.logo { position: absolute; left: 306px; top: 62px; width: 352px; height: 96px; }
.logo__slogan { position: absolute; left: 322px; top: 170px; font-size: 15px; letter-spacing: 4px; color: rgba(255, 250, 232, 0.82); text-shadow: 0 1px 3px rgba(10, 40, 60, 0.55); }
.games { position: absolute; left: 424px; top: 206px; display: flex; flex-direction: row; width: 890px; }
.games__col { position: relative; display: flex; flex-direction: column; }
.games__row { position: relative; display: flex; flex-direction: row; }
.games__row--second { position: relative; margin-left: 109px; }
.card { position: relative; display: flex; flex-direction: column; width: 204px; height: 162px; margin: 0 14px 16px 0; }
.card__img { position: relative; width: 204px; height: 162px; }
.card__badge { position: absolute; left: -4px; top: -6px; padding: 2px 9px; background: linear-gradient(160deg, #FF7B62 0%, #C4302A 100%); border: 1px solid rgba(255, 244, 214, 0.85); border-radius: 10px; font-size: 12px; font-weight: 700; color: #FFF6E2; }
.card--lock { position: relative; opacity: 0.94; }
.card__lock { position: absolute; right: 8px; top: 8px; width: 20px; height: 20px; }
.dock { position: absolute; left: 0; bottom: 0; display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 1334px; height: 66px; padding: 0 26px; box-sizing: border-box; background: linear-gradient(180deg, rgba(6, 30, 22, 0) 0%, rgba(6, 30, 22, 0.62) 100%); }
.dock__item { position: relative; display: flex; flex-direction: row; align-items: center; height: 44px; padding: 0 14px; background: rgba(9, 38, 56, 0.42); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 22px; }
.dock__ico { position: relative; width: 22px; height: 22px; }
.dock__text { position: relative; margin-left: 6px; font-size: 15px; color: rgba(246, 239, 218, 0.92); }
.dock__item--on { position: relative; background: linear-gradient(160deg, #FFE29A 0%, #D29B3C 100%); border-color: $gold-light; }
.dock__item--on .dock__text { position: relative; color: #3A2A08; font-weight: 700; }
.sheet { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(4, 16, 14, 0.62); }
.sheet__panel { position: relative; display: flex; flex-direction: column; align-items: center; width: 980px; height: 620px; padding-top: 96px; box-sizing: border-box; }
.sheet__head { position: absolute; left: 0; top: 0; width: 980px; height: 96px; }
.sheet__close { position: absolute; right: -8px; top: -6px; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(160deg, #8CE6B6 0%, #2E9E6C 100%); border: 2px solid #EAFBF3; border-radius: 26px; font-size: 26px; font-weight: 700; color: #0E3A26; }
.sheet__body { position: relative; display: flex; flex-direction: row; width: 980px; height: 524px; background: linear-gradient(180deg, rgba(248, 255, 251, 0.94) 0%, rgba(226, 247, 236, 0.94) 100%); border: 3px solid #EBD08F; border-top: none; border-radius: 0 0 18px 18px; }
.tabs { position: relative; display: flex; flex-direction: column; width: 160px; padding: 12px 0 0 8px; box-sizing: border-box; }
.tabs__item { position: relative; display: flex; flex-direction: row; align-items: center; height: 66px; margin-bottom: 14px; padding-left: 18px; box-sizing: border-box; background: linear-gradient(160deg, #FBE7B4 0%, #D8AE63 100%); border: 2px solid #B9873C; border-radius: 14px; }
.tabs__item--off { position: relative; background: linear-gradient(160deg, rgba(255, 248, 226, 0.72) 0%, rgba(214, 194, 154, 0.72) 100%); border-color: rgba(160, 128, 74, 0.5); }
.tabs__ico { position: relative; width: 26px; height: 26px; }
.tabs__text { position: relative; margin-left: 8px; font-size: 22px; font-weight: 700; color: #4A3208; }
.packs { position: relative; display: flex; flex-direction: row; flex-wrap: wrap; align-content: flex-start; width: 800px; padding: 4px 0 0 12px; box-sizing: border-box; }
.pack { position: relative; display: flex; flex-direction: column; align-items: center; width: 232px; height: 208px; margin: 0 18px 20px 0; padding-top: 14px; box-sizing: border-box; background: linear-gradient(180deg, #DEF6EE 0%, #B7E2D4 100%); border: 3px solid #F2D79A; border-radius: 16px; }
.pack__tag { position: absolute; left: 50%; top: -14px; margin-left: -60px; width: 120px; height: 24px; background: linear-gradient(160deg, #FF8B66 0%, #C4302A 100%); border-radius: 6px; font-size: 13px; line-height: 24px; color: #FFF6E2; text-align: center; }
.pack__name { position: relative; font-size: 20px; font-weight: 700; color: #23443C; }
.pack__coin { position: relative; width: 96px; height: 76px; margin-top: 6px; }
.pack__price { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; height: 40px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(180, 226, 214, 0.9) 100%); }
.pack__gem { position: relative; width: 22px; height: 22px; }
.pack__num { position: relative; margin-left: 4px; font-size: 20px; font-weight: 700; color: #1C6E7C; }
.dlg { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(20, 26, 26, 0.55); }
.dlg__panel { position: relative; display: flex; flex-direction: column; width: 760px; padding: 0 0 26px; box-sizing: border-box; background: #FBF7E8; border: 3px solid #6FBF9A; border-radius: 14px; box-shadow: 0 14px 40px rgba(0, 0, 0, 0.4); }
.dlg__head { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 62px; margin-top: -3px; background: linear-gradient(180deg, #43C2A4 0%, #2BA07F 100%); border-radius: 11px 11px 0 0; }
.dlg__title { position: relative; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #FFFFFF; }
.dlg__close { position: absolute; right: 12px; top: 14px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #2E9E6C; border: 2px solid #EAFBF3; border-radius: 17px; font-size: 20px; font-weight: 700; line-height: 30px; color: #FFFFFF; text-align: center; }
.dlg__body { position: relative; padding: 20px 34px 0; font-size: 17px; line-height: 30px; color: #24413A; }
.dlg__p { position: relative; margin-bottom: 8px; font-size: 17px; line-height: 30px; color: #24413A; }
.dlg__sign { position: relative; margin-top: 6px; font-size: 15px; color: #6C7C74; text-align: right; }
.dlg__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 240px; height: 52px; margin: 18px auto 0; background: linear-gradient(160deg, #FFE29A 0%, #D29B3C 100%); border-radius: 26px; font-size: 20px; font-weight: 700; color: #402D06; }
.dlg__btn--mint { position: relative; background: linear-gradient(160deg, #9DEDC6 0%, #37B183 100%); }
.dlg__age { position: absolute; right: 78px; top: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 62px; height: 62px; background: #F5A623; border: 2px solid #FFFFFF; border-radius: 12px; }
.dlg__age-num { position: relative; font-size: 22px; font-weight: 700; line-height: 22px; color: #FFFFFF; }
.dlg__age-tip { position: relative; font-size: 10px; color: #FFF3D6; }
.privacy { position: relative; display: flex; flex-direction: column; width: 820px; padding-bottom: 24px; box-sizing: border-box; background: #F2FBF7; border: 2px solid #B7E6D2; border-radius: 10px; box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38); }
.privacy__head { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 66px; background: linear-gradient(180deg, #7FE3BD 0%, #4FCFA1 100%); }
.privacy__title { position: relative; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #0E4A34; }
.privacy__body { position: relative; padding: 22px 34px 0; }
.privacy__text { position: relative; font-size: 17px; line-height: 32px; color: #2E4A42; }
.privacy__link { position: relative; margin-top: 14px; font-size: 16px; color: #2E4A42; text-align: center; }
.privacy__em { position: relative; color: #D4553F; text-decoration: underline; }
.privacy__ops { position: relative; display: flex; flex-direction: row; justify-content: center; margin-top: 20px; }
.privacy__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 160px; height: 54px; margin: 0 26px; border-radius: 27px; font-size: 21px; font-weight: 700; }
.privacy__btn--no { position: relative; background: linear-gradient(160deg, #A6F0CC 0%, #5FD2A4 100%); color: #10543C; }
.privacy__btn--yes { position: relative; background: linear-gradient(160deg, #FFEB9E 0%, #F6CE4E 100%); color: #5A4508; }
.toast { position: absolute; left: 50%; top: 420px; margin-left: -170px; display: flex; align-items: center; justify-content: center; width: 340px; height: 54px; background: rgba(6, 26, 20, 0.86); border: 1px solid rgba(255, 224, 160, 0.5); border-radius: 27px; font-size: 18px; color: $cream; }
</style>

<template>
  <view class="page">
    <view class="layer" :style="rootStyle">
      <image class="bg" :src="bgImage" mode="aspectFill" />
      <view class="bg__veil"></view>

      <view class="top">
        <view class="top__back" @click="logout">
          <image class="top__back-ico" :src="icon('back')" mode="aspectFit" />
        </view>
        <view class="player">
          <view class="player__frame">
            <image class="player__face" :src="avatar" mode="aspectFill" />
          </view>
          <view class="player__meta">
            <text class="player__nick">{{ profile.nick }}</text>
            <text class="player__id">编号:{{ profile.uid }}</text>
          </view>
        </view>
        <view class="res" @click="openSheet('shop')">
          <image class="res__ico" :src="coinImage" mode="aspectFit" />
          <text class="res__num">{{ goldText }}</text>
          <view class="res__add"><text class="res__plus">+</text></view>
        </view>
        <view class="res" @click="openSheet('shop')">
          <image class="res__ico" :src="gemImage" mode="aspectFit" />
          <text class="res__num">{{ profile.diamond }}</text>
          <view class="res__add"><text class="res__plus">+</text></view>
        </view>
        <view class="tools">
          <view class="tools__btn" @click="openSheet('notice')">
            <image class="tools__ico" :src="icon('book')" mode="aspectFit" />
          </view>
          <view class="tools__btn" @click="openSheet('mail')">
            <image class="tools__ico" :src="icon('mail')" mode="aspectFit" />
            <view class="tools__dot"></view>
          </view>
          <view class="tools__btn" @click="openSheet('setting')">
            <image class="tools__ico" :src="icon('setting')" mode="aspectFit" />
          </view>
        </view>
      </view>

      <image class="logo" :src="logoImage" mode="aspectFit" />
      <text class="logo__slogan">七皮四赖 · 红中杠 · 地道武汉规则</text>

      <view class="hero__shadow"></view>
      <image class="hero" :src="heroImage" mode="aspectFit" />

      <view class="games">
        <view class="games__col">
          <view class="games__row">
            <view
              class="card"
              v-for="item in topGames"
              :key="item.key"
              @click="enterGame(item)">
              <image class="card__img" :src="item.img" mode="aspectFit" />
              <text class="card__badge" v-if="item.badge">{{ item.badge }}</text>
            </view>
          </view>
          <view class="games__row games__row--second">
            <view
              class="card"
              v-for="item in bottomGames"
              :key="item.key"
              @click="enterGame(item)">
              <image class="card__img" :src="item.img" mode="aspectFit" />
              <text class="card__badge" v-if="item.badge">{{ item.badge }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="dock">
        <view class="dock__item" @click="openSheet('feedback')">
          <image class="dock__ico" :src="icon('task')" mode="aspectFit" />
          <text class="dock__text">反馈</text>
        </view>
        <view class="dock__item" @click="openSheet('welfare')">
          <image class="dock__ico" :src="icon('gift')" mode="aspectFit" />
          <text class="dock__text">福利</text>
        </view>
        <view class="dock__item" @click="openSheet('exchange')">
          <image class="dock__ico" :src="icon('redpack')" mode="aspectFit" />
          <text class="dock__text">兑换</text>
        </view>
        <view class="dock__item" @click="openSheet('bag')">
          <image class="dock__ico" :src="icon('bag')" mode="aspectFit" />
          <text class="dock__text">背包</text>
        </view>
        <view class="dock__item dock__item--on" @click="openSheet('shop')">
          <image class="dock__ico" :src="icon('shopcart')" mode="aspectFit" />
          <text class="dock__text">商城</text>
        </view>
      </view>

      <view class="sheet" v-if="sheet === 'shop'">
        <view class="sheet__panel">
          <image class="sheet__head" :src="shopHead" mode="aspectFit" />
          <view class="sheet__close" @click="closeSheet">×</view>
          <view class="sheet__body">
            <view class="tabs">
              <view
                class="tabs__item"
                :class="shopTab === index ? '' : 'tabs__item--off'"
                v-for="(tab, index) in shopTabs"
                :key="tab.key"
                @click="shopTab = index">
                <image class="tabs__ico" :src="icon(tab.icon)" mode="aspectFit" />
                <text class="tabs__text">{{ tab.name }}</text>
              </view>
            </view>
            <view class="packs">
              <view class="pack" v-for="pack in currentPacks" :key="pack.name" @click="buy(pack)">
                <text class="pack__tag">{{ pack.tag }}</text>
                <text class="pack__name">{{ pack.name }}</text>
                <image class="pack__coin" :src="coinPileImage" mode="aspectFit" />
                <view class="pack__price">
                  <image class="pack__gem" :src="gemImage" mode="aspectFit" />
                  <text class="pack__num">{{ pack.price }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'privacy'">
        <view class="privacy">
          <view class="privacy__head">
            <text class="privacy__title">个人信息保护指引</text>
          </view>
          <view class="privacy__body">
            <text class="privacy__text">欢迎使用本产品！我们将根据《用户协议》和《隐私权政策》以及《儿童隐私保护声明》，来帮您了解我们在收集、使用、存储和共享您个人信息的情况以及您享有的相关权利。根据《常见类型移动互联网应用程序必要个人信息范围规定》，本 App 属于“网络游戏类”，主要功能为“网络游戏产品和服务”，必要个人信息为：“注册用户移动电话号码”。请您在使用我们的服务前仔细阅读《用户协议》及《隐私政策》。</text>
            <text class="privacy__link">您可通过阅读完整的<text class="privacy__em">《服务协议》</text>和<text class="privacy__em">《隐私政策》</text>来了解详细信息</text>
            <view class="privacy__ops">
              <view class="privacy__btn privacy__btn--no" @click="rejectPrivacy"><text>拒绝</text></view>
              <view class="privacy__btn privacy__btn--yes" @click="acceptPrivacy"><text>同意</text></view>
            </view>
          </view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'notice'">
        <view class="dlg__panel">
          <view class="dlg__head">
            <text class="dlg__title">防作弊 / 禁止赌博声明</text>
            <view class="dlg__close" @click="closeSheet">×</view>
          </view>
          <view class="dlg__body">
            <text class="dlg__p">亲爱的玩家：</text>
            <text class="dlg__p">武汉赖子麻将一直致力于打造一个公平、公正、绿色健康的游戏环境。为保证玩家利益，运营团队全面打击非正常游戏行为。</text>
            <text class="dlg__p">一、非正常游戏行为包括但不限于：利用游戏漏洞谋取利益、破坏公平秩序；在游戏内直接或变相非法倒卖金币；传播淫秽色情、赌博、暴力或教唆犯罪信息。</text>
            <text class="dlg__p">二、本游戏仅供娱乐休闲使用，不得利用本游戏从事赌博及其他违法违规行为。</text>
            <text class="dlg__sign">武汉赖子麻将运营团队</text>
          </view>
          <view class="dlg__btn" @click="closeSheet">我知道了</view>
        </view>
      </view>

      <view class="dlg" v-if="sheet === 'age'">
        <view class="dlg__panel">
          <view class="dlg__head">
            <text class="dlg__title">《防止未成年人沉迷网络游戏公告》</text>
            <view class="dlg__close" @click="closeSheet">×</view>
          </view>
          <view class="dlg__age">
            <text class="dlg__age-num">16+</text>
            <text class="dlg__age-tip">适龄提示</text>
          </view>
          <view class="dlg__body">
            <text class="dlg__p">根据国家新闻出版署《关于进一步严格管理切实防止未成年人沉迷网络游戏的通知》，本游戏仅面向年满 16 周岁的用户提供，并严格落实实名认证与时段时长限制。</text>
            <text class="dlg__p">未完成实名认证的账号将无法进入游戏。请合理安排游戏时间，享受健康生活。</text>
          </view>
          <view class="dlg__btn dlg__btn--mint" @click="closeSheet">实名登录</view>
        </view>
      </view>

      <view class="toast" v-if="toastText">{{ toastText }}</view>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：whmjLobby
 * 功能说明：武汉赖子麻将大厅，横屏 1334×750 设计网格，承载玩家信息、七个玩法入口、底部导航与商城面板
 * 研发时间：2026/11/06
 * 研发人员：郑朝军
 * 变量说明：profile 玩家资料；games 玩法入口；sheet 当前弹层；shopTab 商城页签
 * 事件说明：enterGame 进入玩法；openSheet 打开弹层；buy 模拟购买
 * 插槽说明：无
 * 修改时间       人员        说明
 * 2026/11/06     郑朝军      初始创建
 */
import { ASSET_BASE } from '@/utils/whmj/const.js'
import { login, register, fetchProfile, fetchRecords } from '@/utils/whmj/api.js'
import { clearAuth, getToken, getUser, setUser } from '@/utils/whmj/http.js'
import socket from '@/utils/whmj/socket.js'
import audio from '@/utils/whmj/audio.js'

/** 生成目录，与 tools/gen_whmj_art.py 的输出保持一致 */
const GEN = `${ASSET_BASE}/gen`

export default
{
  data()
  {
    return {
      profile: { uid: 0, nick: '游客', gold: 0, diamond: 0 },
      games: [
        { key: 'whmj', name: '武汉麻将', img: `${GEN}/ui/game_whmj.png`, badge: '热门', open: true },
        { key: 'scmj', name: '四川麻将', img: `${GEN}/ui/game_scmj.png`, badge: '新', open: false },
        { key: 'tlj', name: '拖垃圾', img: `${GEN}/ui/game_tlj.png`, badge: '', open: false },
        { key: 'ddz1', name: '斗地主', img: `${GEN}/ui/game_ddz1.png`, badge: '', open: false },
        { key: 'kwx', name: '卡五星', img: `${GEN}/ui/game_kwx.png`, badge: '热门', open: false },
        { key: 'ddz2', name: '斗地主', img: `${GEN}/ui/game_ddz2.png`, badge: '', open: false },
        { key: 'pdk', name: '跑得快', img: `${GEN}/ui/game_pdk.png`, badge: '', open: false }
      ],
      shopTabs: [
        { key: 'gold', name: '金币', icon: 'shopcart' },
        { key: 'gem', name: '钻石', icon: 'chest' },
        { key: 'item', name: '道具', icon: 'gift' }
      ],
      goldPacks: [
        { name: '8万金币', tag: '送6万金币', price: 8 },
        { name: '36万金币', tag: '送20万金币', price: 30 },
        { name: '108万金币', tag: '送40万金币', price: 88 },
        { name: '208万金币', tag: '送40万金币', price: 168 },
        { name: '338万金币', tag: '送70万金币', price: 268 },
        { name: '500万金币', tag: '送112万金币', price: 388 }
      ],
      gemPacks: [
        { name: '60钻石', tag: '首充双倍', price: 6 },
        { name: '300钻石', tag: '热销', price: 30 },
        { name: '680钻石', tag: '超值', price: 68 },
        { name: '1280钻石', tag: '豪华', price: 128 }
      ],
      itemPacks: [
        { name: '记牌器x10', tag: '实用', price: 20 },
        { name: '鲜花x99', tag: '人气', price: 30 },
        { name: '表情包', tag: '限定', price: 50 }
      ],
      sheet: '',
      shopTab: 0,
      records: [],
      toastText: '',
      busy: false,
      uiScale: 1,
      uiLeft: 0,
      uiTop: 0
    }
  },

  computed:
  {
    /** 舞台缩放样式 */
    rootStyle()
    {
      return `transform:scale(${this.uiScale});left:${this.uiLeft}px;top:${this.uiTop}px`
    },

    /** 背景图 */
    bgImage()
    {
      return `${GEN}/bg/hall.jpg`
    },

    /** 标准字 */
    logoImage()
    {
      return `${GEN}/ui/logo.png`
    },

    /** 人物立绘 */
    heroImage()
    {
      return `${ASSET_BASE}/ui/girl.svg`
    },

    /** 商城帘头 */
    shopHead()
    {
      return `${GEN}/ui/shop_head.png`
    },

    /** 金币图标 */
    coinImage()
    {
      return `${GEN}/ui/coin.png`
    },

    /** 金币堆图标，商城礼包专用 */
    coinPileImage()
    {
      return `${GEN}/ui/coin_pile.png`
    },

    /** 钻石图标 */
    gemImage()
    {
      return `${GEN}/ui/gem.png`
    },

    /** 头像，缺省用立绘兜底 */
    avatar()
    {
      return this.profile.avatar || `${ASSET_BASE}/ui/avatar.png`
    },

    /** 金币展示，超过一万折算为万 */
    goldText()
    {
      const value = Number(this.profile.gold) || 0

      if (value >= 10000)
      {
        return `${(value / 10000).toFixed(1)}万`
      }

      return String(value)
    },

    /** 上排四个玩法 */
    topGames()
    {
      return this.games.slice(0, 4)
    },

    /** 下排三个玩法 */
    bottomGames()
    {
      return this.games.slice(4)
    },

    /** 当前页签的商品 */
    currentPacks()
    {
      if (this.shopTab === 1)
      {
        return this.gemPacks
      }

      if (this.shopTab === 2)
      {
        return this.itemPacks
      }

      return this.goldPacks
    }
  },

  onLoad()
  {
    this.bootstrap()
    this.sheet = 'privacy'
  },

  onReady()
  {
    this.computeScale()

    this.onResize = () => this.computeScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)
  },

  onUnload()
  {
    if (this.onResize)
    {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('orientationchange', this.onResize)
      this.onResize = null
    }

    if (this.toastTimer)
    {
      clearTimeout(this.toastTimer)
      this.toastTimer = null
    }

    socket.close()
  },

  methods:
  {
    /**
     * 取静态图标路径
     * @param {String} name 图标名
     * @returns {String} 图标完整地址
     */
    icon(name)
    {
      return `${ASSET_BASE}/icon/${name}.svg`
    },

    /** 按窗口尺寸缩放设计网格 */
    computeScale()
    {
      const cw = window.innerWidth
      const ch = window.innerHeight
      const scale = Math.min(cw / 1334, ch / 750)

      this.uiScale = Math.round(scale * 10000) / 10000
      this.uiLeft = Math.round((cw - 1334 * scale) / 2)
      this.uiTop = Math.round((ch - 750 * scale) / 2)
    },

    /** 首屏引导：无登录态先游客注册，再拉资料 */
    async bootstrap()
    {
      try
      {
        if (!getToken())
        {
          await this.guestLogin()
        }

        await this.loadProfile()
        await this.ensureSocket()
      }
      catch (err)
      {
        this.toast(err.message || '网络异常，请稍后重试')
      }
    },

    /** 游客自动注册并登录 */
    async guestLogin()
    {
      const name = `guest${Math.floor(Math.random() * 900000 + 100000)}`

      try
      {
        await register(name, '123456', `游客${name.slice(-4)}`)
      }
      catch (err)
      {
        await login(name, '123456')
      }
    },

    /** 拉取个人资料 */
    async loadProfile()
    {
      const data = (await fetchProfile()) || {}
      const cached = getUser() || {}

      this.profile = {
        uid: data.id || cached.uid || 0,
        nick: data.nick || cached.nick || '游客',
        avatar: data.avatar || cached.avatar || '',
        gold: Number(data.score || 0),
        diamond: Number(data.diamond || 0)
      }

      setUser({ ...cached, ...this.profile, token: getToken() })
    },

    /** 确保长连接可用 */
    async ensureSocket()
    {
      if (!socket.connected)
      {
        await socket.connect(getToken())
      }
    },

    /**
     * 进入玩法
     * @param {Object} item 玩法项
     */
    async enterGame(item)
    {
      if (this.busy)
      {
        return
      }

      if (!item.open)
      {
        this.toast(`${item.name}即将上线，敬请期待`)
        return
      }

      audio.play('click')
      this.busy = true

      try
      {
        await this.ensureSocket()
        const res = await socket.request('whmj.lobby.quickStart', { base: 1, rounds: 4, bots: 3 })

        uni.navigateTo({ url: `/pages/whmj/table?roomId=${res.roomId}` })
      }
      catch (err)
      {
        this.toast(err.message || '开局失败')
      }
      finally
      {
        this.busy = false
      }
    },

    /**
     * 打开弹层
     * @param {String} key 弹层标识
     */
    async openSheet(key)
    {
      audio.play('click')

      if (key === 'mail')
      {
        await this.loadRecords()
      }

      if (key === 'setting')
      {
        this.toast('音效已开启，可在牌桌内切换')
        return
      }

      if (key === 'feedback' || key === 'welfare' || key === 'exchange' || key === 'bag')
      {
        this.toast('功能开发中，敬请期待')
        return
      }

      this.sheet = key
    },

    /** 同意隐私指引，继续走实名提示 */
    acceptPrivacy()
    {
      audio.play('click')
      this.sheet = 'age'
    },

    /** 拒绝隐私指引：给出说明并停留，不进入游戏流程 */
    rejectPrivacy()
    {
      audio.play('click')
      this.toast('不同意将无法使用本产品，可稍后重新选择')
    },

    /** 关闭弹层 */
    closeSheet()
    {
      audio.play('click')
      this.sheet = ''
    },

    /** 拉取最近战绩并展示 */
    async loadRecords()
    {
      try
      {
        this.records = await fetchRecords()
      }
      catch (err)
      {
        this.records = []
      }

      if (!this.records.length)
      {
        this.toast('暂无新邮件，先去打一局吧')
        return
      }

      const last = this.records[0]
      this.toast(`最近战绩：${last.score >= 0 ? '+' : ''}${last.score} 分`)
    },

    /**
     * 模拟购买
     * @param {Object} pack 商品
     */
    buy(pack)
    {
      audio.play('click')
      this.toast(`已选择「${pack.name}」，支付通道暂未接入`)
    },

    /**
     * 展示提示
     * @param {String} text 文案
     */
    toast(text)
    {
      this.toastText = text

      if (this.toastTimer)
      {
        clearTimeout(this.toastTimer)
      }

      this.toastTimer = setTimeout(() =>
      {
        this.toastText = ''
      }, 1800)
    },

    /** 退出登录并回到登录页 */
    logout()
    {
      audio.play('click')
      clearAuth()
      socket.close()
      uni.reLaunch({ url: '/pages/whmj/login' })
    }
  }
}
</script>

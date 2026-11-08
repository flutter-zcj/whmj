<style lang="scss" scoped>
$gold: #FFD98A;
$gold-deep: #C9973F;
$cream: #F6E9CE;
$line: rgba(255, 217, 138, 0.34);
$glass: rgba(6, 26, 18, 0.92);
.page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #03060e; }
.layer { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; transform-origin: 0 0; }
.layer--hud { position: relative; pointer-events: none; }
.layer--hud .topbar, .layer--hud .mj-mask { position: relative; pointer-events: auto; }
.stage { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; overflow: hidden; }
.topbar { position: absolute; left: 0; top: 0; display: flex; flex-direction: row; align-items: center; width: 1334px; height: 54px; padding: 0 14px; box-sizing: border-box; background: linear-gradient(180deg, rgba(2, 8, 6, 0.86) 0%, rgba(2, 8, 6, 0) 100%); }
.tb-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; margin-left: 10px; background: rgba(8, 30, 20, 0.6); border: 1px solid $line; border-radius: 19px; }
.tb-btn__ico { position: relative; width: 22px; height: 22px; }
.tb-rounds { position: relative; display: flex; flex-direction: column; margin-left: 12px; }
.tb-rounds__main { position: relative; font-size: 20px; font-weight: 700; line-height: 24px; color: #FFE9B4; letter-spacing: 1px; }
.tb-rounds__sub { position: relative; font-size: 14px; line-height: 18px; color: rgba(246, 233, 206, 0.55); }
.tb-center { position: absolute; left: 50%; top: 6px; display: flex; flex-direction: row; align-items: center; margin-left: -150px; width: 300px; height: 30px; justify-content: center; }
.tb-center__text { position: relative; font-size: 18px; color: rgba(246, 233, 206, 0.82); letter-spacing: 1px; }
.tb-right { position: absolute; right: 14px; top: 8px; display: flex; flex-direction: row; }
.ops { position: absolute; left: 380px; top: 394px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 620px; height: 130px; pointer-events: none; }
.op { position: relative; display: flex; align-items: center; justify-content: center; width: 92px; height: 92px; margin: 0 8px; pointer-events: auto; }
.op__bg { position: absolute; left: 0; top: 0; width: 92px; height: 92px; }
.op__flag { position: relative; width: 66px; height: 66px; }
.op__label { position: relative; font-size: 30px; font-weight: 700; color: #FFF6DC; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7); }
.op--hu { position: relative; display: flex; align-items: center; justify-content: center; width: 124px; height: 124px; margin: 0 8px; pointer-events: auto; }
.op--hu .op__bg { position: absolute; left: 0; top: 0; width: 124px; height: 124px; }
.op--hu .op__flag { position: relative; width: 82px; height: 82px; }
.op--pass { position: relative; display: flex; align-items: center; justify-content: center; width: 84px; height: 84px; margin: 0 8px; pointer-events: auto; }
.op--pass .op__bg { position: absolute; left: 0; top: 0; width: 84px; height: 84px; }
.op--pass .op__flag { position: relative; width: 62px; height: 62px; }
.mj-mask { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(3, 30, 22, 0.78); }
.mj-mask--clear { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(2, 8, 6, 0.3); pointer-events: none; }
.mj-mask--top { position: relative; align-items: flex-start; padding-top: 96px; box-sizing: border-box; }
.card { position: relative; display: flex; flex-direction: column; box-sizing: border-box; padding: 26px 32px; background: linear-gradient(180deg, rgba(60, 36, 18, 0.99) 0%, rgba(30, 17, 8, 0.99) 100%); border: 3px solid #F3C76A; border-radius: 22px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.64), inset 0 0 0 2px rgba(120, 74, 30, 0.7); }
.mj-mask--clear .card { position: relative; pointer-events: auto; }
.result { position: relative; display: flex; flex-direction: column; width: 1000px; height: 520px; }
.result__bg { position: absolute; left: 0; top: 0; width: 1000px; height: 470px; }
.result__banner { position: absolute; left: 290px; top: -48px; width: 420px; height: 140px; z-index: 2; }
.result__close { position: absolute; right: -20px; top: -20px; width: 64px; height: 64px; z-index: 3; }
.result__sheet { position: relative; display: flex; flex-direction: column; margin-top: 96px; padding: 0 40px 0 30px; box-sizing: border-box; }
.result__row { position: relative; display: flex; flex-direction: row; align-items: center; height: 84px; padding: 0 12px; box-sizing: border-box; }
.result__row--me { position: relative; background: rgba(255, 214, 120, 0.24); border-radius: 10px; }
.result__avatar { position: relative; width: 92px; flex: none; }
.result__face { position: relative; width: 62px; height: 62px; border: 2px solid #E8C25A; border-radius: 10px; }
.result__banker { position: absolute; left: -6px; top: -8px; width: 28px; height: 28px; }
.result__tiles { position: relative; display: flex; flex-direction: row; align-items: center; flex: 1; overflow: hidden; }
.result__tile { position: relative; width: 30px; height: 42px; margin-right: 1px; }
.result__none { position: relative; font-size: 16px; color: rgba(90, 70, 30, 0.6); }
.result__score { position: relative; width: 90px; flex: none; margin-right: 52px; font-size: 26px; font-weight: 700; text-align: right; }
.result__winner { position: absolute; right: 4px; top: 8px; width: 46px; height: 46px; }
.result__ops { position: relative; display: flex; flex-direction: row; justify-content: center; margin-top: 12px; }
.result__btn { position: relative; display: flex; align-items: center; justify-content: center; width: 220px; height: 62px; margin: 0 14px; background: linear-gradient(180deg, #F3D68A 0%, #C08A32 100%); border: 3px solid #FFF3D2; border-radius: 31px; box-shadow: 0 5px 0 rgba(112, 76, 24, 0.7); }
.result__btn--off { position: relative; background: linear-gradient(180deg, #A9A393 0%, #6F6A5C 100%); border-color: rgba(255, 243, 210, 0.6); }
.result__btnText { position: relative; font-size: 21px; font-weight: 700; letter-spacing: 2px; color: #4A2C08; }
.rule { position: relative; display: flex; flex-direction: column; width: 820px; }
.rule__title { position: relative; font-size: 31px; font-weight: 700; letter-spacing: 4px; color: #FFE9B4; text-align: center; text-shadow: 0 2px 0 #7A4A16; }
.rule__text { position: relative; margin-top: 18px; font-size: 18px; line-height: 31px; color: rgba(255, 238, 206, 0.84); }
.rule__ok { position: relative; display: flex; align-items: center; justify-content: center; height: 72px; margin-top: 22px; background: linear-gradient(180deg, #F3D68A 0%, #C08A32 100%); border: 3px solid #FFF3D2; border-radius: 36px; box-shadow: 0 6px 0 rgba(112, 76, 24, 0.7), inset 0 2px 6px rgba(255, 255, 255, 0.26); }
.rule__okText { position: relative; font-size: 23px; font-weight: 700; letter-spacing: 2px; color: #FFE9B4; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); }
.guide__step { position: relative; display: flex; flex-direction: row; margin-top: 14px; }
.guide__dot { position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 16px; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); border: 1px solid #FFF3D2; }
.guide__num { position: relative; font-size: 17px; font-weight: 700; color: #4A2C08; }
.guide__body { position: relative; display: flex; flex-direction: column; flex: 1; margin-left: 12px; }
.guide__head { position: relative; font-size: 20px; font-weight: 700; color: $cream; }
.guide__desc { position: relative; margin-top: 2px; font-size: 16px; line-height: 24px; color: rgba(246, 233, 206, 0.66); }
.roundinfo { position: absolute; left: 16px; top: 62px; display: flex; flex-direction: column; }
.roundinfo__item { position: relative; display: flex; flex-direction: row; align-items: center; height: 48px; width: 146px; margin-bottom: 6px; padding: 0 10px; box-sizing: border-box; background: rgba(4, 20, 14, 0.86); border: 1px solid $line; border-radius: 10px; }
.roundinfo__item--lai { position: relative; background: rgba(30, 18, 4, 0.9); border-color: #E8A93C; }
.roundinfo__pic { position: relative; width: 30px; height: 40px; flex: none; }
.roundinfo__tile { position: relative; width: 30px; height: 40px; }
.roundinfo__tag { position: absolute; right: -5px; top: -6px; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; font-size: 12px; font-weight: 700; color: #4A2C08; background: linear-gradient(180deg, #FFE8A6 0%, #E8A93C 100%); border: 1px solid #FFF3D2; border-radius: 9px; }
.roundinfo__body { position: relative; display: flex; flex-direction: column; margin-left: 10px; }
.roundinfo__label { position: relative; font-size: 12px; line-height: 15px; color: rgba(255, 217, 138, 0.72); letter-spacing: 1px; }
.roundinfo__name { position: relative; font-size: 18px; font-weight: 700; line-height: 22px; color: $gold; }
.roundinfo__item--open { position: relative; height: 30px; width: 146px; padding: 0 12px; border-radius: 15px; }
.roundinfo__hint { position: relative; font-size: 14px; color: $gold; }
.roundinfo__item--ok .roundinfo__hint { position: relative; color: #8FE0A8; }
.toast { pointer-events: none; position: absolute; left: 50%; top: 62px; display: flex; align-items: center; justify-content: center; margin-left: -230px; width: 460px; height: 40px; background: rgba(4, 20, 14, 0.88); border: 1px solid rgba(255, 217, 138, 0.5); border-radius: 12px; }
.toast__text { position: relative; font-size: 16px; color: $gold; }
.fx { position: absolute; left: 0; top: 250px; display: flex; align-items: center; justify-content: center; width: 1334px; }
.fx__text { position: relative; font-size: 150px; font-weight: 700; color: #FFE9B4; letter-spacing: 12px; text-shadow: 0 0 30px rgba(255, 196, 84, 0.9), 0 8px 0 rgba(140, 82, 12, 0.9), 0 18px 40px rgba(0, 0, 0, 0.6); animation: fxPop 0.9s ease-out both; }
@keyframes fxPop { 0% { transform: scale(0.4) rotate(-8deg); opacity: 0; } 35% { transform: scale(1.16) rotate(0deg); opacity: 1; } 70% { transform: scale(1) rotate(0deg); opacity: 1; } 100% { transform: scale(1.05); opacity: 0; } }
</style>
<template>
  <view class="page">
    <view class="layer" :style="rootStyle">
      <view class="stage" id="mj-stage" />
    </view>

    <view class="layer layer--hud" :style="rootStyle">

      <view class="roundinfo">
        <view class="roundinfo__item">
          <image class="roundinfo__tile" :src="piziImage" mode="aspectFit" />
          <view class="roundinfo__body">
            <text class="roundinfo__label">皮子</text>
            <text class="roundinfo__name">{{ piziText }}</text>
          </view>
        </view>
        <view class="roundinfo__item roundinfo__item--lai">
          <view class="roundinfo__pic">
            <image class="roundinfo__tile" :src="laiziImage" mode="aspectFit" />
            <text class="roundinfo__tag">赖</text>
          </view>
          <view class="roundinfo__body">
            <text class="roundinfo__label">赖子</text>
            <text class="roundinfo__name">{{ laiziText }}</text>
          </view>
        </view>
        <view class="roundinfo__item roundinfo__item--open" v-if="myOpened === 0">
          <text class="roundinfo__hint">未开口 · 不能胡</text>
        </view>
        <view class="roundinfo__item roundinfo__item--open roundinfo__item--ok" v-else>
          <text class="roundinfo__hint">已开 {{ myOpened }} 口</text>
        </view>
      </view>

      <view class="topbar">
        <view class="tb-btn" @click="handleLeave">
          <image class="tb-btn__ico" :src="ico('arrow_left')" mode="aspectFit" />
        </view>
        <view class="tb-rounds">
          <text class="tb-rounds__main">第 {{ round }}/{{ maxRound }} 局</text>
          <text class="tb-rounds__sub">房号 {{ roomId || '——' }} · 底分 {{ base }}</text>
        </view>
        <view class="tb-center">
          <text class="tb-center__text">{{ centerText }}</text>
        </view>
        <view class="tb-right">
          <view class="tb-btn" @click="showRule">
            <image class="tb-btn__ico" :src="ico('book')" mode="aspectFit" />
          </view>
          <view class="tb-btn" @click="toggleSound">
            <image class="tb-btn__ico" :src="ico('sound')" mode="aspectFit" :style="soundOn ? '' : 'opacity:.35'" />
          </view>
          <view class="tb-btn" @click="handleLeave">
            <image class="tb-btn__ico" :src="ico('close')" mode="aspectFit" />
          </view>
        </view>
      </view>

      <view class="fx" v-if="fxText" :key="fxKey">
        <text class="fx__text">{{ fxText }}</text>
      </view>

      <view class="toast" v-if="tipText">
        <text class="toast__text">{{ tipText }}</text>
      </view>

      <view class="ops" v-if="!resultVisible && !guideVisible && displayOptions.length">
        <view v-for="op in displayOptions" :key="op.type + '_' + op.tile" :class="opClass(op.type)" @click="doAction(op)">
          <image class="op__bg" :src="opBg(op.type)" mode="aspectFit" />
          <image v-if="opFlag(op.type)" class="op__flag" :src="opFlag(op.type)" mode="aspectFit" />
          <text v-else class="op__label">{{ opLabel(op) }}</text>
        </view>
      </view>

      <view class="mj-mask" v-if="resultVisible">
        <view class="result">
          <image class="result__bg" :src="resultSheetBg" mode="scaleToFill" />
          <image class="result__banner" :src="resultBanner" mode="aspectFit" />
          <image class="result__close" :src="closeBtn" @click="resultVisible = false" mode="aspectFit" />
          <view class="result__sheet">
            <view
              class="result__row"
              :class="item.seat === mySeat ? 'result__row result__row--me' : 'result__row'"
              v-for="item in resultRows"
              :key="item.seat">
              <view class="result__avatar">
                <image class="result__face" :src="item.avatar || defaultFace" mode="aspectFill" />
                <image v-if="item.isBanker" class="result__banker" :src="bankerIcon" mode="aspectFit" />
              </view>
              <view class="result__tiles">
                <image v-for="(t, ti) in (item.hand || [])" :key="ti" class="result__tile" :src="tileImage(t)" mode="aspectFit" />
                <text v-if="!item.hand || !item.hand.length" class="result__none">{{ item.hu ? '胡牌' : '未胡' }}</text>
              </view>
              <text class="result__score" :style="item.score >= 0 ? 'color:#D8402C' : 'color:#3C5A48'">{{ item.score >= 0 ? '+' : '' }}{{ item.score }}</text>
              <image v-if="item.hu" class="result__winner" :src="winnerIcon" mode="aspectFit" />
            </view>
          </view>
          <view class="result__ops">
            <view class="result__btn" :class="round >= maxRound ? 'result__btn result__btn--off' : 'result__btn'" @click="resultVisible = false">
              <text class="result__btnText">{{ round >= maxRound ? '整场已结束' : '继续下一局' }}</text>
            </view>
            <view class="result__btn" @click="handleLeave">
              <text class="result__btnText">返回大厅</text>
            </view>
          </view>
        </view>
      </view>

      <view class="mj-mask" v-if="guideVisible">
        <view class="card rule">
          <text class="rule__title">武汉赖子麻将 · 怎么玩</text>
          <view class="guide__step">
            <view class="guide__dot"><text class="guide__num">1</text></view>
            <view class="guide__body">
              <text class="guide__head">摸牌与出牌</text>
              <text class="guide__desc">轮到你时点一张手牌选中（会抬起并发出选中音），再点同一张牌即可打出。</text>
            </view>
          </view>
          <view class="guide__step">
            <view class="guide__dot"><text class="guide__num">2</text></view>
            <view class="guide__body">
              <text class="guide__head">开口才能胡</text>
              <text class="guide__desc">吃、碰、明杠都算开口，一次都没开口不能胡牌；红中、皮子、赖子单张杠出去不算开口。</text>
            </view>
          </view>
          <view class="guide__step">
            <view class="guide__dot"><text class="guide__num">3</text></view>
            <view class="guide__body">
              <text class="guide__head">翻皮子定赖子</text>
              <text class="guide__desc">整副牌 112 张。开局翻一张皮子，它的下一张就是赖子，可当任意牌用；红中固定是皮子，只能杠。</text>
            </view>
          </view>
          <view class="guide__step">
            <view class="guide__dot"><text class="guide__num">4</text></view>
            <view class="guide__body">
              <text class="guide__head">二五八将与结算</text>
              <text class="guide__desc">四组面子加一对将，将牌必须是二、五、八；手上留皮子或红中不能胡，小胡最多一张赖子。</text>
            </view>
          </view>
          <view class="rule__ok" @click="closeGuide">
            <text class="rule__okText">明白了，开始</text>
          </view>
        </view>
      </view>

      <view class="mj-mask" v-if="ruleVisible" @click="ruleVisible = false">
        <view class="card rule" @click.stop>
          <text class="rule__title">武汉赖子麻将</text>
          <text class="rule__text">112 张牌（万筒条各 36 张 + 红中 4 张），4 人各 13 张、庄家 14 张。开局翻一张皮子，皮子的下一张为赖子，可代任意牌；红中固定是皮子，只能单张杠。吃、碰、明杠算开口，未开口不能胡，手上留皮子或红中也不能胡。小胡必须二五八做将、最多一张赖子；大胡为碰碰胡、清一色、将一色、全求人、杠上花、海底捞、抢杠。3 番起胡，封顶 6 番；一炮单响，点炮者付双份、其余两家各付一份。</text>
          <view class="rule__ok" @click="ruleVisible = false">
            <text class="rule__okText">知道了</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
/**
 * 组件名称：whmjTable
 * 功能说明：武汉赖子麻将牌桌页，Phaser 负责牌面渲染，Vue 负责操作按钮、状态条与结算交互
 * 研发时间：2026/11/03
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  roomId        - 房间号
 * @data {Array}   seats         - 四家视图数据
 * @data {Number}  mySeat        - 我的座位号
 * @data {Array}   hand          - 我的手牌
 * @data {String}  phase         - 牌局阶段 play / over
 * @data {Number}  turn          - 当前出牌座位
 * @data {Number}  remain        - 牌墙剩余张数
 * @data {Array}   options       - 服务端下发的可选操作
 * @data {Number}  selectedIndex - 当前选中的手牌下标
 *
 * 事件说明：
 * @event onLoad        - 接收房间号并初始化音效
 * @event onReady       - 创建 Phaser 画布并注册事件
 * @event createStage   - 建画布，尺寸固定 1334×750
 * @event fitStage      - 按容器比例缩放整页设计网格
 * @event discardSelected - 打出手牌
 * @event doAction      - 碰 / 杠 / 胡 / 过
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/11/03     郑朝军      初始创建，打通发牌、出牌、碰杠胡与结算全流程
 * 2026/11/06     郑朝军      重做牌桌坐标系（HUD 与画布同为 1334×750 设计网格）；
 *                            手牌点击改为随时可选中并给出原因提示；出牌按钮我的回合常驻；
 *                            新增新手引导与阶段状态条，解决「点不动、看不懂」问题
 */
import { ASSET_BASE, OP_TEXT, OP_PASS, OP_HU, OP_CHI, OP_PENG, OP_GANG, OP_AN_GANG, OP_BU_GANG, tileName, tileKey } from '@/utils/whmj/const.js'
import { getToken } from '@/utils/whmj/http.js'
import socket from '@/utils/whmj/socket.js'
import audio from '@/utils/whmj/audio.js'

const GUIDE_KEY = 'whmj_guide_v1'

/** 参考素材目录，取自开源项目的 UI 资源 */
const XL = `${ASSET_BASE}/xl`

/** xiyoufang/mahjong 原版牌桌与结算素材 */
const XYF = `${ASSET_BASE}/xyf`

export default
{
  data()
  {
    return {
      roomId: '',
      seats: [],
      mySeat: 0,
      hand: [],
      base: 1,
      round: 0,
      maxRound: 4,
      piZi: 0,
      laiZi: 0,
      lastDiscard: null,
      phase: '',
      turn: -1,
      remain: 0,
      options: [],
      selectedIndex: -1,
      resultVisible: false,
      resultPlayers: [],
      tingTips: [],
      resultTitle: '',
      resultSub: '',
      countdown: 0,
      ruleVisible: false,
      guideVisible: false,
      fxText: '',
      fxKey: 0,
      fxTimer: null,
      tipText: '',
      tipWarn: false,
      soundOn: true,
      uiScale: 1,
      uiLeft: 0,
      uiTop: 0
    }
  },

  computed:
  {
    /** 整页缩放样式 */
    rootStyle()
    {
      return `transform:scale(${this.uiScale});left:${this.uiLeft}px;top:${this.uiTop}px`
    },

    /** 皮子文案 */
    piziText()
    {
      return this.piZi ? tileName(this.piZi) : '—'
    },

    /** 赖子文案 */
    laiziText()
    {
      return this.laiZi ? tileName(this.laiZi) : '—'
    },

    /** 皮子牌面图，未开局时回落为牌背 */
    piziImage()
    {
      return this.tileImage(this.piZi)
    },

    /** 赖子牌面图，未开局时回落为牌背 */
    laiziImage()
    {
      return this.tileImage(this.laiZi)
    },

    /** 我的开口次数 */
    myOpened()
    {
      const me = this.seats[this.mySeat]

      return me && me.opened ? me.opened : 0
    },

    /** 顶部中央状态 */
    centerText()
    {
      if (this.phase === 'play')
      {
        return `第 ${this.handNo}/${this.totalHands} 手 · 牌墙 ${this.remain} 张`
      }

      return ''
    },

    /** 底部状态条文案 */
    statusText()
    {
      if (this.phase === 'play')
      {
        if (this.options.length && this.turn !== this.mySeat)
        {
          const names = this.displayOptions.filter((op) => op.type !== OP_PASS).map((op) => this.opLabel(op)).join(' / ')

          return names ? `可以「${names}」，不要就点「过」` : '请选择操作'
        }

        if (this.turn === this.mySeat)
        {
          const hint = this.tingText ? ` · ${this.tingText}` : ''

          if (this.options.length)
          {
            const names = this.displayOptions.filter((op) => op.type !== OP_PASS).map((op) => this.opLabel(op)).join(' / ')

            return `自摸/杠：可点「${names}」，或选一张牌打出${hint}`
          }

          return this.selectedIndex >= 0
            ? `已选中，再点一次这张牌即可打出${hint}`
            : `轮到你出牌：点一张手牌选中，再点同一张打出${hint}`
        }

        const nick = (this.seats[this.turn] || {}).nick || '对手'

        return `等待 ${nick} 出牌…${this.countdown > 0 ? ` ${this.countdown}s` : ''}`
      }

      return '准备中…'
    },

    /** 是否有提示语气（可操作时用普通色，异常时用警告色） */
    tipWarn()
    {
      return this.phase === 'play' && this.turn !== this.mySeat && this.options.length === 0
    },

    /** 按钮展示顺序：胡 > 杠 > 暗杠 > 补杠 > 碰 > 过；别人出牌时要补一个「过」用于放弃 */
    displayOptions()
    {
      const weight = { [OP_HU]: 0, [OP_GANG]: 1, [OP_AN_GANG]: 2, [OP_BU_GANG]: 3, [OP_PENG]: 4, [OP_CHI]: 5, [OP_PASS]: 9 }
      const list = this.options.slice().sort((a, b) => (weight[a.type] || 5) - (weight[b.type] || 5))

      if (this.options.length && this.turn !== this.mySeat)
      {
        list.push({ type: OP_PASS, tile: 0 })
      }

      return list
    },

    /** 出牌按钮是否展示 */
    discardVisible()
    {
      const seat = this.seats[this.mySeat]

      return !(seat && seat.finished)
    },

    /** 出牌按钮状态：可选 / 待选 / 不可用 */
    discardClass()
    {
      if (this.turn !== this.mySeat)
      {
        return 'btnDiscard btnDiscard--off'
      }

      return this.selectedIndex >= 0 ? 'btnDiscard btnDiscard--hint' : 'btnDiscard'
    },

    /** 听牌提示文案：选中哪张就报哪张的听口 */
    tingText()
    {
      const tips = this.tingTips || []

      if (!tips.length)
      {
        return ''
      }

      if (tips.length === 1 && !tips[0].discard)
      {
        return `已听：${tips[0].tiles.map((t) => tileName(t)).join('、')}`
      }

      if (this.selectedIndex < 0)
      {
        return tips.length ? `${tips.length} 张可打进听` : ''
      }

      const tile = this.hand[this.selectedIndex]
      const hit = tips.find((item) => item.discard === tile)

      return hit ? `打这张听：${hit.tiles.map((t) => tileName(t)).join('、')}` : ''
    },

    /** 结算横幅：胜利 / 失败 / 流局 */
    resultBanner()
    {
      const name = this.resultTitle.indexOf('胜') >= 0 ? 'result_win' : (this.resultTitle.indexOf('负') >= 0 ? 'result_lose' : 'result_draw')

      return `${XYF}/result/${name}.png`
    },

    /** 结算卷轴底图 */
    resultSheetBg()
    {
      return `${XYF}/result/im_over_bg.png`
    },

    /** 结算右上角关闭按钮 */
    closeBtn()
    {
      return `${XYF}/result/im_close_btn.png`
    },

    /** 庄家角标 */
    bankerIcon()
    {
      return `${XYF}/result/over_banker.png`
    },

    /** 胡牌旗帜 */
    winnerIcon()
    {
      return `${XYF}/result/winner.png`
    },

    /** 结算面板默认头像 */
    defaultFace()
    {
      return `${XYF}/table/im_defaulthead_0.png`
    },

    /** 结算行：本局分 + 累计分（累计以服务端座位数据为准，晚于结算事件到达也能自动刷新） */
    resultRows()
    {
      const totals = {}

      ;(this.seats || []).forEach((seat) =>
      {
        if (seat)
        {
          totals[seat.seat] = seat.total || 0
        }
      })

      return this.resultPlayers.map((item) => ({ ...item, total: totals[item.seat] || item.total || 0 }))
    },

    /** 第几手：起手 53 张之后每摸一张算一手 */
    handNo()
    {
      return Math.max(1, 112 - Number(this.remain || 0) - 52)
    },

    /** 总手数：112 张牌墙扣掉起手 53 张 */
    totalHands()
    {
      return 59
    },

    /** 手牌中赖子（红中）张数，用于状态条提示 */
    laiziCount()
    {
      return this.hand.filter((tile) => tile === 28).length
    }
  },

  onLoad(query)
  {
    this.roomId = (query && query.roomId) || ''

    socket.setRoom(this.roomId)

    audio.init()

    try
    {
      this.guideVisible = !uni.getStorageSync(GUIDE_KEY)
    }
    catch (e)
    {
      this.guideVisible = false
    }
  },

  onReady()
  {
    this.createStage()
    this.initGame()
    this.computeScale()

    this.onResize = () => this.computeScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)
  },

  onUnload()
  {
    this.unbindEvents()

    if (this.onResize)
    {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('orientationchange', this.onResize)
      this.onResize = null
    }

    if (this.scene && this.scene.unbindInput)
    {
      this.scene.unbindInput()
      this.scene.unbindInput = null
    }

    if (this.game)
    {
      this.game.destroy(true)
      this.game = null
    }

    if (this.timer)
    {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  methods:
  {
    /**
     * 取静态图标路径
     * @param {String} name 图标名
     * @returns {String} 完整路径
     */
    ico(name)
    {
      return `${ASSET_BASE}/icon/${name}.svg`
    },

    /** 关闭新手引导并记住 */
    closeGuide()
    {
      this.guideVisible = false

      try
      {
        uni.setStorageSync(GUIDE_KEY, '1')
      }
      catch (e)
      {
      }
    },

    /** 玩法说明 */
    showRule()
    {
      this.ruleVisible = true
    },

    /**
     * 计算设计网格缩放：竖屏时容器宽高互换
     */
    computeScale()
    {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const rotated = vh > vw
      const cw = rotated ? vh : vw
      const ch = rotated ? vw : vh
      const scale = Math.min(cw / 1334, ch / 750)

      this.uiScale = Math.round(scale * 10000) / 10000
      this.uiLeft = Math.round((cw - 1334 * scale) / 2)
      this.uiTop = Math.round((ch - 750 * scale) / 2)

      if (this.game && this.game.canvas)
      {
        this.game.canvas.style.width = '1334px'
        this.game.canvas.style.height = '750px'
      }
    },

    /** 创建 Phaser 画布，固定 1334×750，缩放交给外层 CSS */
    async createStage()
    {
      // #ifdef H5
      try
      {
        const Phaser = (await import('phaser')).default
        const mod = await import('@/utils/whmj/table/scene.js')
        const TableScene = mod.default
        const el = document.getElementById('mj-stage')

        if (!el)
        {
          return
        }

        this.stageMod = mod

        this.game = new Phaser.Game(
        {
          type: Phaser.AUTO,
          parent: el,
          width: mod.STAGE_WIDTH,
          height: mod.STAGE_HEIGHT,
          backgroundColor: '#03060e',
          scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER
          },
          scene: [TableScene]
        })

        this.game.events.on('mj-scene-ready', (scene) =>
        {
          this.scene = scene
          this.bindScene(scene)
          this.computeScale()
          this.render()

          if (import.meta.env.DEV || window.location.href.indexOf('mjdebug=1') >= 0)
          {
            window.__mj = this
          }
        })
      }
      catch (err)
      {
        console.warn('[whmj] 画布初始化失败', err)
      }
      // #endif
    },

    /**
     * 绑定画布交互回调
     * @param {Object} scene 牌桌场景实例
     */
    bindScene(scene)
    {
      scene.onTileTap = (tile, index, ok) =>
      {
        this.selectedIndex = index

        if (ok && index >= 0)
        {
          audio.play('select')
        }
      }

      scene.onTileDiscard = (tile, index) =>
      {
        this.selectedIndex = index
        this.discardSelected()
      }

      scene.onToast = (text) =>
      {
        this.showTip(text)
      }
    },

    /** 建立连接、同步快照并准备开局 */
    async initGame()
    {
      try
      {
        if (!socket.connected)
        {
          await socket.connect(getToken())
        }

        this.bindEvents()

        /** 重连或整页刷新回来时先重新占用原座位，否则房间路由会拒绝这条连接 */
        if (this.roomId)
        {
          try
          {
            await socket.request('whmj.lobby.joinRoom', { roomId: this.roomId })
          }
          catch (e)
          {
            console.warn('[whmj] 回到房间失败', e)
          }
        }

        const snap = await socket.request('whmj.room.sync')

        if (snap && snap.seats)
        {
          this.applySnapshot(snap)
        }

        await socket.request('whmj.room.ready')
      }
      catch (err)
      {
        this.showTip(err.message || '进入房间失败')

        setTimeout(() => this.backLobby(), 1500)
      }
    },

    /** 注册服务端推送 */
    bindEvents()
    {
      this.unbindEvents()

      this.offs = this.offs || []

      const on = (event, handler) =>
      {
        this.offs.push(socket.on(event, handler))
      }

      this.offs.push(socket.onLocal('reconnecting', () =>
      {
        this.showTip('网络断开，正在重连…')
      }))

      this.offs.push(socket.onLocal('reconnected', () => this.resync()))

      this.offs.push(socket.onLocal('expired', () =>
      {
        this.showTip('登录状态已失效，请重新登录')
        setTimeout(() => uni.reLaunch({ url: '/pages/whmj/login' }), 1200)
      }))

      on('onRoomState', (d) => this.applyRoomState(d))

      on('onSync', (d) => this.applySnapshot(d))

      on('onGameStart', (d) =>
      {
        this.phase = 'play'
        this.round = d.round || this.round
        this.resultVisible = false
        this.options = []
        this.selectedIndex = -1
        this.tipText = ''
        this.lastDiscard = null
        this.piZi = d.pizi || 0
        this.laiZi = d.laizi || 0
        this.showTip(`第 ${d.round} 局开始：皮子 ${tileName(this.piZi)}，赖子 ${tileName(this.laiZi)}`)
      })

      on('onDeal', (d) =>
      {
        if (d.seat !== this.mySeat)
        {
          return
        }

        this.hand = d.hand.slice()
        this.applySceneMode()
        this.render()
      })

      on('onPlayStart', () =>
      {
        this.phase = 'play'
        this.applySceneMode()
        this.render()
      })

      on('onTurn', (d) =>
      {
        this.turn = d.seat
        this.options = d.options || []
        this.remain = d.remain || this.remain
        this.startCountdown(d.deadline)

        if (d.seat === this.mySeat)
        {
          this.selectedIndex = -1
          this.applySceneMode()
          this.render()
        }
        else
        {
          this.render()
        }
      })

      on('onDraw', (d) =>
      {
        this.remain = d.remain || this.remain

        if (d.seat === this.mySeat)
        {
          this.hand = this.hand.concat([d.tile]).sort((a, b) => a - b)
          this.selectedIndex = -1

          if (this.scene)
          {
            this.scene.drawAnim(d.seat)
          }

          if (this.scene && this.phase === 'play')
          {
            this.scene.setSelectMode('single')
          }

          this.render()
        }
      })

      on('onDiscard', (d) =>
      {
        this.lastDiscard = { seat: d.seat, tile: d.tile }

        if (this.seats[d.seat])
        {
          this.seats[d.seat].discards = (this.seats[d.seat].discards || []).concat([d.tile])
        }

        if (d.seat === this.mySeat)
        {
          const index = this.hand.indexOf(d.tile)

          if (index >= 0)
          {
            this.hand.splice(index, 1)
          }

          this.selectedIndex = -1
          this.options = []
          this.phase = 'play'
        }

        audio.play('discard')

        if (d.seat !== this.mySeat)
        {
          audio.playTile(d.tile)
        }

        this.applySceneMode()
        this.render()
      })

      on('onAsk', (d) =>
      {
        if (d.seat !== this.mySeat)
        {
          return
        }

        this.options = d.options || []
        this.startCountdown(d.deadline)
        audio.play('countdown')
        this.render()
      })

      on('onActionDone', (d) => this.applyAction(d))
      on('onScore', () => this.render())
      on('onHu', (d) => this.applyHu(d))
      on('onGameOver', (d) => this.applyGameOver(d))

      on('onTing', (d) =>
      {
        this.tingTips = (d && d.tips) || []
      })

      on('onRoomEnd', () =>
      {
        this.showTip('房间对局已结束')
        setTimeout(() => this.backLobby(), 1200)
      })
    },

    /** 重连成功后按服务端快照恢复牌局 */
    async resync()
    {
      try
      {
        const snap = await socket.request('whmj.room.sync')

        if (snap && snap.seats)
        {
          this.applySnapshot(snap)
          this.showTip('已重新连接，牌局已同步')
        }
      }
      catch (err)
      {
        console.warn('[whmj] 重连同步失败', err)
      }
    },

    /** 取消全部订阅 */
    unbindEvents()
    {
      (this.offs || []).forEach((off) =>
      {
        if (typeof off === 'function')
        {
          off()
        }
      })

      this.offs = []
    },

    /**
     * 应用房间状态广播
     * @param {Object} d 房间状态
     */
    applyRoomState(d)
    {
      if (!d)
      {
        return
      }

      if (Array.isArray(d.seats))
      {
        this.seats = d.seats
        this.mySeat = this.resolveMySeat(d.seats)
      }

      if (d.roundSet)
      {
        this.piZi = d.roundSet.pizi || this.piZi
        this.laiZi = d.roundSet.laizi || this.laiZi
      }

      this.phase = d.phase || this.phase
      this.round = d.round || this.round
      this.maxRound = d.maxRound || this.maxRound
      this.base = d.base || this.base

      if (typeof d.turn === 'number')
      {
        this.turn = d.turn
      }

      this.applySceneMode()
      this.render()
    },

    /**
     * 应用完整快照
     * @param {Object} d 快照
     */
    applySnapshot(d)
    {
      if (!d)
      {
        return
      }

      this.applyRoomState(d)

      if (Array.isArray(d.hand))
      {
        this.hand = d.hand.slice()
      }

      if (Array.isArray(d.options))
      {
        this.options = d.options
      }

      this.remain = d.remain || this.remain
      this.tingTips = d.tingTips || []
      this.selectedIndex = -1

      if (d.last > 0 && typeof d.lastSeat === 'number' && d.lastSeat >= 0)
      {
        this.lastDiscard = { seat: d.lastSeat, tile: d.last }
      }

      this.applySceneMode()
      this.render()
    },

    /**
     * 从座位列表解析我的座位号
     * @param {Array} seats 座位列表
     * @returns {Number} 座位号
     */
    resolveMySeat(seats)
    {
      const index = seats.findIndex((seat) => seat && seat.uid === socket.uid)

      return index >= 0 ? index : this.mySeat
    },

    /** 根据阶段切换手牌交互模式 */
    applySceneMode()
    {
      if (!this.scene)
      {
        return
      }

      if (this.phase === 'play')
      {
        this.scene.setSelectMode('single')
      }
      else
      {
        this.scene.setSelectMode('none')
      }
    },

    /** 把当前状态交给 Phaser 绘制 */
    render()
    {
      if (!this.scene)
      {
        return
      }

      this.applySceneMode()

      this.scene.applyState(
      {
        seats: this.seats,
        hand: this.hand,
        mySeat: this.mySeat,
        turn: this.turn,
        remain: this.remain,
        phase: this.phase,
        countdown: this.countdown,
        laiZi: this.laiZi,
        lastDiscard: this.lastDiscard
      })
    },

    /**
     * 处理碰杠胡结果
     * @param {Object} d 结果
     */
    applyAction(d)
    {
      if (d.seat === this.mySeat)
      {
        if (d.type === OP_CHI)
        {
          this.eatFromHand(d.start, d.tile)
        }
        else if (d.type === OP_PENG)
        {
          this.removeFromHand(d.tile, 2)
        }
        else if (d.type === OP_GANG)
        {
          this.removeFromHand(d.tile, 3)
        }
        else if (d.type === OP_AN_GANG)
        {
          this.removeFromHand(d.tile, 4)
        }
        else if (d.type === OP_BU_GANG)
        {
          this.removeFromHand(d.tile, 1)
        }

        this.options = []
        this.selectedIndex = -1
      }

      if (d.type === OP_PENG)
      {
        audio.play('peng')
        this.showFx('碰')
      }
      else if (d.type === OP_GANG || d.type === OP_AN_GANG || d.type === OP_BU_GANG)
      {
        audio.play('gang')

        if (d.seat === this.mySeat)
        {
          this.showFx('杠')
        }
      }

      if (this.scene)
      {
        const label = typeof d.label === 'string' && d.label ? d.label : (OP_TEXT[d.type] || '')

        this.scene.floatText(d.seat, label)
      }

      this.applySceneMode()
      this.render()
    },

    /**
     * 播放碰杠胡特效字
     * @param {String} text 特效文案
     */
    showFx(text)
    {
      this.fxText = text
      this.fxKey += 1

      clearTimeout(this.fxTimer)
      this.fxTimer = setTimeout(() =>
      {
        this.fxText = ''
      }, 900)
    },

    /**
     * 处理胡牌广播
     * @param {Object} d 胡牌信息
     */
    applyHu(d)
    {
      if (!d)
      {
        return
      }

      audio.play(d.selfDraw ? 'zimo' : 'hu')
      this.showFx(d.selfDraw ? '自摸' : '胡')

      if (this.scene)
      {
        this.scene.floatText(d.seat, d.selfDraw ? '自摸' : '胡')
      }
    },

    /**
     * 处理单局结算
     * @param {Object} d 结算数据
     */
    applyGameOver(d)
    {
      const players = (d && d.players) || []
      this.resultPlayers = players.slice().sort((a, b) => b.score - a.score)

      this.resultVisible = true
      this.options = []
      this.countdown = 0

      const me = players.find((item) => item.seat === this.mySeat)
      const mine = (me && me.score) || 0

      this.resultTitle = mine > 0 ? '本 局 胜' : (mine < 0 ? '本 局 负' : '本 局 平')
      this.resultSub = `第 ${this.round} 局结束 · 本局 ${mine >= 0 ? '+' : ''}${mine} 分 · ${this.round >= this.maxRound ? '整场结束' : '4 秒后自动开始下一局'}`

      audio.play(mine >= 0 ? 'win' : 'lose')
    },

    /**
     * 按顺子吃掉手牌里的两张（被吃的那张来自对家，不在手上）
     * @param {Number} start 顺子首张
     * @param {Number} tile 被吃掉的弃牌
     */
    eatFromHand(start, tile)
    {
      for (let k = 0; k < 3; k++)
      {
        if (start + k !== tile)
        {
          this.removeFromHand(start + k, 1)
        }
      }
    },

    /**
     * 从手牌移除指定张数的某张牌
     * @param {Number} tile 牌编码
     * @param {Number} count 移除张数
     */
    removeFromHand(tile, count)
    {
      for (let i = 0; i < count; i++)
      {
        const index = this.hand.indexOf(tile)

        if (index < 0)
        {
          break
        }

        this.hand.splice(index, 1)
      }
    },

    /**
     * 启动操作倒计时
     * @param {Number} deadline 截止时间戳（毫秒）
     */
    startCountdown(deadline)
    {
      if (this.timer)
      {
        clearInterval(this.timer)
      }

      if (!deadline)
      {
        this.countdown = 0
        return
      }

      const tick = () =>
      {
        const left = Math.ceil((deadline - Date.now()) / 1000)

        this.countdown = left > 0 ? left : 0

        if (this.countdown > 0 && this.scene)
        {
          this.scene.applyState(
          {
            seats: this.seats,
            hand: this.hand,
            mySeat: this.mySeat,
            turn: this.turn,
            remain: this.remain,
            phase: this.phase,
            countdown: this.countdown,
            laiZi: this.laiZi,
            lastDiscard: this.lastDiscard
          })
        }

        if (this.countdown <= 0 && this.timer)
        {
          clearInterval(this.timer)
          this.timer = null
        }
      }

      tick()
      this.timer = setInterval(tick, 500)
    },

    /**
     * 执行碰 / 杠 / 胡 / 过
     * @param {Object} op 操作项
     */
    async doAction(op)
    {
      audio.play('click')

      try
      {
        await socket.request('whmj.room.action', { type: op.type, tile: op.tile })

        if (op.type === OP_PASS)
        {
          this.options = []
        }
      }
      catch (err)
      {
        this.showTip(err.message || '操作失败')
      }
    },

    /** 打出选中的手牌 */
    async discardSelected()
    {
      const seat = this.seats[this.mySeat]

      if (seat && seat.finished)
      {
        this.showTip('你已胡牌，本局观战中')
        return
      }

      if (this.turn !== this.mySeat)
      {
        const nick = (this.seats[this.turn] || {}).nick || '对手'

        this.showTip(`还没轮到你，正在等 ${nick} 出牌`)
        return
      }

      const tile = this.hand[this.selectedIndex]

      if (!tile)
      {
        this.showTip('请先点一张手牌选中，再点同一张打出')
        return
      }

      try
      {
        await socket.request('whmj.room.discard', { tile })
        this.selectedIndex = -1
        this.options = []
      }
      catch (err)
      {
        this.showTip(err.message || '出牌失败')
      }
    },

    /**
     * 操作按钮底图：胡与杠用倾斜牌造型，其余用绿色圆底
     * @param {String} type 操作类型
     * @returns {String} 图片地址
     */
    opBg(type)
    {
      const big = type === OP_HU || type === OP_GANG || type === OP_AN_GANG || type === OP_BU_GANG

      return `${XYF}/table/${big ? 'btn_action0' : 'btn_action1'}.png`
    },

    /**
     * 操作按钮字牌；吃没有对应原版字牌，返回空串由文字兜底
     * @param {String} type 操作类型
     * @returns {String} 图片地址
     */
    opFlag(type)
    {
      const map = {
        [OP_PASS]: 'flag_guo',
        [OP_PENG]: 'flag_peng',
        [OP_GANG]: 'flag_gang',
        [OP_AN_GANG]: 'flag_gang',
        [OP_BU_GANG]: 'flag_gang',
        [OP_HU]: 'flag_hu'
      }

      return map[type] ? `${XYF}/table/${map[type]}.png` : ''
    },

    /**
     * 牌编码转牌面图片
     * @param {Number} tile 牌编码
     * @returns {String} 图片地址
     */
    tileImage(tile)
    {
      return `${ASSET_BASE}/tiles/${tileKey(tile)}.png`
    },

    /**
     * 操作按钮样式
     * @param {String} type 操作类型
     * @returns {String} 样式类名
     */
    opClass(type)
    {
      if (type === OP_HU)
      {
        return 'op--hu'
      }

      if (type === OP_PASS)
      {
        return 'op--pass'
      }

      return 'op'
    },

    /**
     * 操作按钮文案
     * @param {Object} op 操作项
     * @returns {String} 按钮文字
     */
    opLabel(op)
    {
      if (op.type === OP_GANG && op.desc && op.desc.indexOf('杠') >= 0 && op.desc !== '杠')
      {
        return op.desc
      }

      return OP_TEXT[op.type] || op.type
    },

    /**
     * 显示一条短提示
     * @param {String} text 提示文案
     */
    showTip(text)
    {
      this.tipText = text

      if (this.tipTimer)
      {
        clearTimeout(this.tipTimer)
      }

      this.tipTimer = setTimeout(() =>
      {
        this.tipText = ''
      }, 2000)
    },

    /** 切换音效开关 */
    toggleSound()
    {
      this.soundOn = !this.soundOn
      audio.setEnabled(this.soundOn)
    },

    /** 离开牌桌返回大厅 */
    async handleLeave()
    {
      try
      {
        await socket.request('whmj.room.leave')
      }
      catch (err)
      {
        console.warn('[whmj] 离开房间失败', err)
      }

      socket.setRoom('')
      this.backLobby()
    },

    /** 返回大厅页 */
    backLobby()
    {
      uni.reLaunch({ url: '/pages/whmj/index' })
    }
  }
}
</script>

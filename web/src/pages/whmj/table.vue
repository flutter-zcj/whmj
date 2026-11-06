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
.bar { pointer-events: auto; position: absolute; left: 344px; top: 566px; display: flex; flex-direction: row; align-items: center; width: 794px; height: 52px; }
.bar__tip { position: relative; display: flex; flex-direction: row; align-items: center; flex: 1; height: 44px; padding: 0 16px; box-sizing: border-box; background: rgba(4, 20, 14, 0.72); border: 1px solid $line; border-radius: 22px; overflow: hidden; }
.bar__tipText { position: relative; font-size: 18px; line-height: 22px; color: $cream; }
.bar__tipText--warn { position: relative; color: #FFC46B; }
.bar__ops { position: relative; display: flex; flex-direction: row; align-items: center; margin-left: 14px; }
.op { position: relative; display: flex; align-items: center; justify-content: center; width: 68px; height: 68px; margin-left: 10px; border-radius: 34px; background: radial-gradient(circle at 50% 28%, #2AA96F 0%, #11543A 100%); border: 2px solid rgba(255, 217, 138, 0.85); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5); }
.op__label { position: relative; font-size: 28px; font-weight: 700; color: #FFFFFF; }
.op--hu { position: relative; display: flex; align-items: center; justify-content: center; width: 68px; height: 68px; margin-left: 10px; border-radius: 34px; background: radial-gradient(circle at 50% 28%, #FFD75E 0%, #E0821F 100%); border: 2px solid #FFF6DC; box-shadow: 0 0 18px rgba(255, 196, 84, 0.6); }
.op--pass { position: relative; display: flex; align-items: center; justify-content: center; width: 68px; height: 68px; margin-left: 10px; border-radius: 34px; background: rgba(18, 44, 32, 0.94); border: 2px solid rgba(246, 233, 206, 0.4); }
.op--pass .op__label { position: relative; font-size: 24px; color: rgba(246, 233, 206, 0.9); }
.btnDiscard { position: relative; display: flex; align-items: center; justify-content: center; width: 150px; height: 56px; margin-left: 12px; border-radius: 28px; background: linear-gradient(160deg, #FFE39A 0%, #D9A44C 100%); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45); }
.btnDiscard__text { position: relative; font-size: 24px; font-weight: 700; color: #2A1C05; letter-spacing: 2px; }
.btnDiscard--off { position: relative; background: rgba(20, 44, 32, 0.9); border: 1px solid rgba(246, 233, 206, 0.28); box-shadow: none; }
.btnDiscard--off .btnDiscard__text { position: relative; color: rgba(246, 233, 206, 0.5); }
.btnDiscard--hint { position: relative; animation: discPulse 1.1s ease-in-out infinite; }
@keyframes discPulse { position: relative; 0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 94, 0); } 50% { box-shadow: 0 0 22px rgba(255, 215, 94, 0.85); } }
.mj-mask { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(2, 8, 6, 0.74); }
.mj-mask--clear { position: absolute; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 1334px; height: 750px; background: rgba(2, 8, 6, 0.3); pointer-events: none; }
.mj-mask--top { position: relative; align-items: flex-start; padding-top: 96px; box-sizing: border-box; }
.card { position: relative; display: flex; flex-direction: column; box-sizing: border-box; padding: 26px 30px; background: linear-gradient(170deg, rgba(22, 62, 44, 0.98) 0%, rgba(6, 24, 17, 0.98) 100%); border: 1px solid rgba(255, 217, 138, 0.5); border-radius: 22px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6); }
.mj-mask--clear .card { position: relative; pointer-events: auto; }
.result { position: relative; display: flex; flex-direction: column; width: 800px; }
.result__badge { position: relative; font-size: 40px; font-weight: 700; color: $gold; text-align: center; letter-spacing: 6px; }
.result__sub { position: relative; margin-top: 8px; font-size: 18px; color: rgba(246, 233, 206, 0.6); text-align: center; }
.result__row { position: relative; display: flex; flex-direction: row; align-items: center; height: 58px; margin-top: 8px; padding: 0 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.05); }
.result__row--me { position: relative; background: rgba(255, 217, 138, 0.14); border: 1px solid rgba(255, 217, 138, 0.34); }
.result__name { position: relative; flex: 1; font-size: 20px; color: $cream; }
.result__tag { position: relative; margin-left: 8px; padding: 2px 10px; font-size: 15px; color: #FFFFFF; background: rgba(228, 87, 46, 0.85); border-radius: 6px; }
.result__score { position: relative; width: 110px; font-size: 24px; font-weight: 700; text-align: right; }
.result__total { position: relative; width: 110px; font-size: 17px; text-align: right; color: rgba(246, 233, 206, 0.6); }
.result__btns { position: relative; display: flex; flex-direction: row; margin-top: 22px; }
.result__btn { position: relative; display: flex; align-items: center; justify-content: center; flex: 1; height: 62px; border-radius: 31px; background: linear-gradient(160deg, #FFE39A 0%, #D9A44C 100%); }
.result__btnText { position: relative; font-size: 22px; font-weight: 700; color: #2A1C05; }
.result__ghost { position: relative; display: flex; align-items: center; justify-content: center; flex: 1; height: 62px; margin-left: 16px; border-radius: 31px; background: rgba(255, 255, 255, 0.08); border: 1px solid $line; }
.result__ghostText { position: relative; font-size: 22px; color: $cream; }
.rule { position: relative; display: flex; flex-direction: column; width: 820px; }
.rule__title { position: relative; font-size: 30px; font-weight: 700; color: $gold; text-align: center; }
.rule__text { position: relative; margin-top: 16px; font-size: 18px; line-height: 30px; color: rgba(246, 233, 206, 0.8); }
.rule__ok { position: relative; display: flex; align-items: center; justify-content: center; height: 58px; margin-top: 20px; border-radius: 29px; background: linear-gradient(160deg, #FFE39A 0%, #D9A44C 100%); }
.rule__okText { position: relative; font-size: 22px; font-weight: 700; color: #2A1C05; }
.guide__step { position: relative; display: flex; flex-direction: row; margin-top: 14px; }
.guide__dot { position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 15px; background: rgba(255, 217, 138, 0.2); border: 1px solid $line; }
.guide__num { position: relative; font-size: 16px; font-weight: 700; color: $gold; }
.guide__body { position: relative; display: flex; flex-direction: column; flex: 1; margin-left: 12px; }
.guide__head { position: relative; font-size: 20px; font-weight: 700; color: $cream; }
.guide__desc { position: relative; margin-top: 2px; font-size: 16px; line-height: 24px; color: rgba(246, 233, 206, 0.66); }
.roundinfo { position: absolute; left: 16px; top: 62px; display: flex; flex-direction: row; }
.roundinfo__item { position: relative; display: flex; align-items: center; height: 30px; margin-right: 8px; padding: 0 12px; font-size: 15px; color: $gold; background: rgba(4, 20, 14, 0.62); border: 1px solid $line; border-radius: 15px; }
.toast { pointer-events: none; position: absolute; left: 50%; top: 546px; display: flex; align-items: center; justify-content: center; margin-left: -320px; width: 640px; height: 46px; background: rgba(4, 20, 14, 0.94); border: 1px solid rgba(255, 217, 138, 0.5); border-radius: 14px; }
.toast__text { position: relative; font-size: 18px; color: $gold; }
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
        <text class="roundinfo__item">皮子 {{ piziText }}</text>
        <text class="roundinfo__item">赖子 {{ laiziText }}</text>
        <text class="roundinfo__item" v-if="myOpened === 0">未开口 · 不能胡</text>
        <text class="roundinfo__item" v-else>已开 {{ myOpened }} 口</text>
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

      <view class="bar" v-if="!resultVisible && !guideVisible">
        <view class="bar__tip">
          <text :class="tipWarn ? 'bar__tipText bar__tipText--warn' : 'bar__tipText'">{{ statusText }}</text>
        </view>
        <view class="bar__ops">
          <view v-for="op in displayOptions" :key="op.type + '_' + op.tile" :class="opClass(op.type)" @click="doAction(op)">
            <text class="op__label">{{ opLabel(op) }}</text>
          </view>
          <view
            v-if="phase === 'play' && discardVisible"
            :class="discardClass"
            @click="discardSelected">
            <text class="btnDiscard__text">出 牌</text>
          </view>
        </view>
      </view>

      <view class="mj-mask" v-if="resultVisible">
        <view class="card result">
          <text class="result__badge">{{ resultTitle }}</text>
          <text class="result__sub">{{ resultSub }}</text>
          <view
            class="result__row"
            :class="item.seat === mySeat ? 'result__row result__row--me' : 'result__row'"
            v-for="item in resultRows"
            :key="item.seat">
            <text class="result__name">{{ item.seat === mySeat ? '我 · ' : '' }}{{ item.nick }}</text>
            <text class="result__tag" v-if="item.hu">胡</text>
            <text class="result__total">累计 {{ item.total >= 0 ? '+' : '' }}{{ item.total }}</text>
            <text class="result__score" :style="item.score >= 0 ? 'color:#FF8A7A' : 'color:#7BE3A5'">
              {{ item.score >= 0 ? '+' : '' }}{{ item.score }}
            </text>
          </view>
          <view class="result__btns">
            <view class="result__btn" @click="resultVisible = false">
              <text class="result__btnText">继续下一局</text>
            </view>
            <view class="result__ghost" @click="handleLeave">
              <text class="result__ghostText">返回大厅</text>
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
              <text class="guide__desc">轮到你时点一张手牌选中（会抬起），再点右下角「出牌」；连点同一张也能直接打出。</text>
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
import { ASSET_BASE, OP_TEXT, OP_PASS, OP_HU, OP_CHI, OP_PENG, OP_GANG, OP_AN_GANG, OP_BU_GANG, tileName } from '@/utils/whmj/const.js'
import { getToken } from '@/utils/whmj/http.js'
import socket from '@/utils/whmj/socket.js'
import audio from '@/utils/whmj/audio.js'

const GUIDE_KEY = 'whmj_guide_v1'

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
      phase: '',
      turn: -1,
      remain: 0,
      options: [],
      selectedIndex: -1,
      resultVisible: false,
      resultPlayers: [],
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
          if (this.options.length)
          {
            const names = this.displayOptions.filter((op) => op.type !== OP_PASS).map((op) => this.opLabel(op)).join(' / ')

            return `自摸/杠：可点「${names}」，或选一张牌打出`
          }

          return this.selectedIndex >= 0
            ? '已选好，点右下角「出牌」打出（或再点一次这张牌）'
            : '轮到你出牌：先点一张手牌选中'
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

        if (ok)
        {
          audio.play('click')
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
          audio.play('draw')

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

      on('onRoomEnd', () =>
      {
        this.showTip('房间对局已结束')
        setTimeout(() => this.backLobby(), 1200)
      })
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

      this.scene.applyState(
      {
        seats: this.seats,
        hand: this.hand,
        mySeat: this.mySeat,
        turn: this.turn,
        remain: this.remain,
        phase: this.phase,
        countdown: this.countdown
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
        if (d.type === OP_PENG)
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
            countdown: this.countdown
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
        this.showTip('请先点一张手牌，选中后再点「出牌」')
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

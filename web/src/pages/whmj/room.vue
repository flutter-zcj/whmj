<style lang="scss" scoped>
$gold: #FFD98A;
$gold-deep: #C9973F;
$cream: #F6E9CE;
$mint: #45E3C0;
$line: rgba(255, 217, 138, 0.34);
.page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #03060e; }
.bg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 42%, rgba(4, 32, 24, 0.28) 0%, rgba(2, 12, 9, 0.86) 78%); }
.layer { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; transform-origin: 0 0; }
.head { position: absolute; left: 0; top: 0; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; height: 86px; }
.head__title { position: relative; font-size: 34px; font-weight: 700; letter-spacing: 14px; color: #FFE9B4; text-shadow: 0 3px 10px rgba(0, 0, 0, 0.6); }
.back { position: absolute; left: 28px; top: 18px; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: rgba(8, 36, 27, 0.82); border: 2px solid rgba(69, 227, 192, 0.55); border-radius: 26px; }
.back__t { position: relative; margin-top: -6px; font-size: 40px; line-height: 40px; color: $mint; }
.copy { position: absolute; right: 28px; top: 20px; display: flex; align-items: center; justify-content: center; width: 168px; height: 48px; background: linear-gradient(180deg, rgba(28, 96, 76, 0.95) 0%, rgba(9, 50, 38, 0.95) 100%); border: 2px solid rgba(69, 227, 192, 0.6); border-radius: 24px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); }
.copy__t { position: relative; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #BFF6E6; }
.no { position: absolute; left: 0; top: 92px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; }
.no__label { position: relative; margin-right: 16px; padding: 6px 14px; background: rgba(69, 227, 192, 0.16); border: 1px solid rgba(69, 227, 192, 0.5); border-radius: 10px; font-size: 20px; letter-spacing: 4px; color: #AFF3DF; }
.no__value { position: relative; font-size: 56px; font-weight: 700; letter-spacing: 10px; color: #FFE9B4; text-shadow: 0 0 22px rgba(255, 205, 120, 0.55), 0 4px 12px rgba(0, 0, 0, 0.6); }
.seats { position: absolute; left: 110px; top: 192px; display: flex; flex-direction: row; width: 1114px; }
.seat { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 262px; height: 304px; margin: 0 11px; box-sizing: border-box; background: linear-gradient(180deg, rgba(13, 68, 53, 0.94) 0%, rgba(6, 34, 26, 0.96) 100%); border: 2px solid rgba(69, 227, 192, 0.42); border-radius: 20px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 0 26px rgba(44, 220, 180, 0.1); }
.seat--empty { background: linear-gradient(180deg, rgba(9, 48, 38, 0.72) 0%, rgba(5, 26, 20, 0.8) 100%); border: 2px dashed rgba(69, 227, 192, 0.4); box-shadow: none; }
.seat--mine { border-color: rgba(69, 227, 192, 0.95); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 0 26px rgba(44, 220, 180, 0.2); }
.seat--owner { border-color: rgba(255, 205, 120, 0.95); box-shadow: 0 0 0 2px rgba(255, 205, 120, 0.22), 0 12px 30px rgba(0, 0, 0, 0.42); }
.seat__faceWrap { position: relative; display: flex; align-items: center; justify-content: center; width: 132px; height: 132px; }
.seat__face { position: relative; width: 122px; height: 122px; border: 3px solid rgba(69, 227, 192, 0.7); border-radius: 61px; background: rgba(0, 0, 0, 0.3); }
.seat--owner .seat__face { border-color: #FFD98A; }
.seat__tag { position: absolute; right: -18px; bottom: -4px; padding: 2px 10px; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.seat__tag--owner { background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); color: #4A2C08; }
.seat__tag--bot { background: rgba(69, 227, 192, 0.9); color: #06301F; }
.seat__nick { position: relative; margin-top: 20px; max-width: 220px; overflow: hidden; font-size: 24px; font-weight: 700; color: #FFF3D6; text-align: center; }
.seat__state { position: relative; margin-top: 8px; font-size: 18px; letter-spacing: 2px; color: rgba(191, 246, 230, 0.82); }
.seat__state--ready { position: relative; margin-top: 8px; font-size: 18px; letter-spacing: 2px; color: #7BEFC9; }
.seat__plus { position: relative; display: flex; align-items: center; justify-content: center; width: 108px; height: 108px; border: 3px dashed rgba(69, 227, 192, 0.62); border-radius: 54px; }
.seat__plusT { position: relative; margin-top: -8px; font-size: 60px; line-height: 60px; color: rgba(69, 227, 192, 0.88); }
.seat__empty { position: relative; margin-top: 18px; font-size: 22px; letter-spacing: 2px; color: rgba(191, 246, 230, 0.7); }
.seat__hint { position: relative; margin-top: 8px; font-size: 16px; color: rgba(255, 217, 138, 0.75); }
.seat__index { position: absolute; left: 16px; top: 12px; font-size: 15px; letter-spacing: 1px; color: rgba(191, 246, 230, 0.42); }
.ops { position: absolute; left: 0; top: 544px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; }
.btn { position: relative; display: flex; align-items: center; justify-content: center; width: 236px; height: 68px; margin: 0 14px; border-radius: 34px; }
.btn--gold { background: linear-gradient(180deg, #FFE7A6 0%, #D79A38 100%); border: 3px solid #FFF6DC; box-shadow: 0 6px 18px rgba(120, 74, 20, 0.5); }
.btn--gold .btn__t { color: #4A2C08; }
.btn--ghost { background: linear-gradient(180deg, rgba(20, 86, 68, 0.96) 0%, rgba(7, 44, 33, 0.96) 100%); border: 2px solid rgba(69, 227, 192, 0.62); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4); }
.btn--ghost .btn__t { color: #BFF6E6; }
.btn__t { position: relative; font-size: 24px; font-weight: 700; letter-spacing: 4px; }
.wait { position: relative; font-size: 22px; letter-spacing: 2px; color: rgba(246, 233, 206, 0.72); }
.tip { position: absolute; left: 0; top: 676px; width: 1334px; font-size: 18px; letter-spacing: 2px; color: rgba(246, 233, 206, 0.52); text-align: center; }
.toast { position: absolute; left: 50%; top: 676px; margin-left: -220px; display: flex; align-items: center; justify-content: center; width: 440px; height: 56px; background: rgba(12, 40, 30, 0.94); border: 1px solid rgba(69, 227, 192, 0.5); border-radius: 28px; font-size: 19px; color: #DFF7EF; }
</style>

<template>
  <view class="page">
    <image class="bg" :src="bgImage" mode="aspectFill" />
    <view class="veil"></view>
    <view class="layer" :style="rootStyle">
      <view class="head">
        <view class="back" @click="leave"><text class="back__t">‹</text></view>
        <text class="head__title">房 间</text>
        <view class="copy" @click="copyId"><text class="copy__t">复制房号</text></view>
      </view>

      <view class="no">
        <text class="no__label">房间号</text>
        <text class="no__value">{{ roomId || '------' }}</text>
      </view>

      <view class="seats">
        <view
          class="seat"
          :class="{ 'seat--empty': !seat.uid, 'seat--mine': seat.uid && seat.uid === myUid, 'seat--owner': isOwnerSeat(seat) }"
          v-for="(seat, i) in seatList"
          :key="i"
          @click="onSeatTap(i)">
          <text class="seat__index">座位 {{ i + 1 }}</text>
          <template v-if="seat.uid">
            <view class="seat__faceWrap">
              <image class="seat__face" :src="faceOf(seat, i)" mode="aspectFill" />
              <text class="seat__tag seat__tag--owner" v-if="isOwnerSeat(seat)">房主</text>
              <text class="seat__tag seat__tag--bot" v-else-if="seat.bot">电脑</text>
            </view>
            <text class="seat__nick">{{ seat.nick || '玩家' }}</text>
            <text :class="seat.bot || seat.ready ? 'seat__state seat__state--ready' : 'seat__state'">{{ stateText(seat) }}</text>
          </template>
          <template v-else>
            <view class="seat__plus"><text class="seat__plusT">+</text></view>
            <text class="seat__empty">等待加入</text>
            <text class="seat__hint" v-if="isOwner">点击添加电脑</text>
          </template>
        </view>
      </view>

      <view class="ops">
        <view class="btn btn--ghost" v-if="isOwner" @click="addBot"><text class="btn__t">+ 添加电脑</text></view>
        <view class="btn btn--gold" v-if="isOwner" @click="startGame"><text class="btn__t">开始游戏</text></view>
        <text class="wait" v-else>等待房主开始游戏…</text>
      </view>

      <text class="tip">把房间号发给好友，或直接添加电脑开局</text>
      <view class="toast" v-if="tipText">{{ tipText }}</view>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：whmjRoom
 * 功能说明：武汉赖子麻将房间等待页，展示房号与四个座位，房主可添加电脑、开始游戏，
 *          其他人可凭房号入座；房主开局后整桌自动跳转牌桌
 * 研发时间：2026/11/08
 * 研发人员：郑朝军
 *
 * 变量说明：roomId 当前房号；seats 四个座位视图；owner 房主 uid；myUid 本人 uid；tipText 顶部提示
 * 事件说明：onRoomState 刷新座位；onGameStart 跳转牌桌；addBot 添加电脑；startGame 房主开局
 *
 * 插槽说明：无
 */
import { ASSET_BASE } from '@/utils/whmj/const.js'
import { getToken } from '@/utils/whmj/http.js'
import socket from '@/utils/whmj/socket.js'

const XL = `${ASSET_BASE}/xl`
const XYF = `${ASSET_BASE}/xyf`

export default
{
  data()
  {
    return {
      roomId: '',
      seats: [],
      owner: '',
      myUid: 0,
      uiScale: 1,
      uiLeft: 0,
      uiTop: 0,
      busy: false,
      leaving: false,
      tipText: '',
      tipTimer: null,
      offs: []
    }
  },

  computed:
  {
    /** 整页缩放样式 */
    rootStyle()
    {
      return `transform:scale(${this.uiScale});left:${this.uiLeft}px;top:${this.uiTop}px`
    },

    /** 背景图 */
    bgImage()
    {
      return `${XL}/hall/bg.png`
    },

    /** 默认头像 */
    defaultFace()
    {
      return `${XL}/hall/head.png`
    },

    /** 固定四格的座位列表 */
    seatList()
    {
      const out = []

      for (let i = 0; i < 4; i++)
      {
        out.push(this.seats[i] || { seat: i, uid: 0 })
      }

      return out
    },

    /** 是否是房主 */
    isOwner()
    {
      return !!this.owner && Number(this.owner) === Number(this.myUid)
    }
  },

  onLoad(query)
  {
    this.roomId = (query && query.roomId) || ''
    this.myUid = socket.uid || 0
    socket.setRoom(this.roomId)
  },

  onReady()
  {
    this.computeScale()

    this.onResize = () => this.computeScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)

    this.bootstrap()
  },

  onUnload()
  {
    this.unbindEvents()

    if (this.onResize)
    {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('orientationchange', this.onResize)
    }

    if (this.tipTimer)
    {
      clearTimeout(this.tipTimer)
    }
  },

  methods:
  {
    /** 计算整页缩放，与牌桌页保持一致的设计网格 */
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
    },

    /** 连接、入座并拉一次房间快照 */
    async bootstrap()
    {
      try
      {
        if (!socket.connected)
        {
          const info = await socket.connect(getToken())

          this.myUid = (info && info.uid) || socket.uid || this.myUid
        }

        this.bindEvents()

        if (this.roomId)
        {
          await socket.request('whmj.lobby.joinRoom', { roomId: this.roomId })
        }

        await socket.request('whmj.room.ready')

        const snap = await socket.request('whmj.room.sync')

        this.applyRoom(snap)

        if (snap && snap.phase === 'play')
        {
          this.gotoTable()
        }
      }
      catch (err)
      {
        this.toast(err.message || '进入房间失败')
        setTimeout(() => uni.reLaunch({ url: '/pages/whmj/index' }), 1500)
      }
    },

    /** 注册服务端推送 */
    bindEvents()
    {
      this.unbindEvents()

      this.offs = this.offs || []
      this.offs.push(socket.on('onRoomState', (d) => this.applyRoom(d)))
      this.offs.push(socket.on('onSync', (d) => this.applyRoom(d)))
      this.offs.push(socket.on('onGameStart', () => this.gotoTable()))

      this.offs.push(socket.onLocal('reconnected', async () =>
      {
        try
        {
          await socket.request('whmj.lobby.joinRoom', { roomId: this.roomId })
          this.applyRoom(await socket.request('whmj.room.sync'))
        }
        catch (e)
        {
          console.warn('[whmj] 重连回房失败', e)
        }
      }))
    },

    /** 解绑推送 */
    unbindEvents()
    {
      ;(this.offs || []).forEach((off) => off && off())
      this.offs = []
    },

    /** 应用房间状态 */
    applyRoom(d)
    {
      if (!d)
      {
        return
      }

      if (Array.isArray(d.seats))
      {
        this.seats = d.seats

        const idx = d.seats.findIndex((s) => s && Number(s.uid) === Number(this.myUid))

        if (idx >= 0)
        {
          this.myUid = d.seats[idx].uid
        }
      }

      if (d.owner !== undefined)
      {
        this.owner = String(d.owner || '')
      }

      if (d.roomId)
      {
        this.roomId = d.roomId
      }
    },

    /**
     * 座位头像：真人用自己头像，电脑按座位交替用两张默认头像
     * @param {Object} seat 座位视图
     * @param {Number} i 座位号
     * @returns {String} 头像地址
     */
    faceOf(seat, i)
    {
      if (seat.avatar)
      {
        return seat.avatar
      }

      return seat.bot ? `${XYF}/table/im_defaulthead_${i % 2}.png` : this.defaultFace
    },

    /** 该座位是否是房主 */
    isOwnerSeat(seat)
    {
      return !!seat && !!seat.uid && Number(seat.uid) === Number(this.owner)
    },

    /** 座位状态文案 */
    stateText(seat)
    {
      if (seat.bot)
      {
        return '电脑玩家'
      }

      return seat.ready ? '已准备' : '已入座'
    },

    /** 点击座位：房主点空位补一个电脑 */
    async onSeatTap(i)
    {
      const seat = this.seatList[i]

      if (!seat || seat.uid)
      {
        return
      }

      if (!this.isOwner)
      {
        this.toast('只有房主可以添加电脑')

        return
      }

      await this.addBot()
    },

    /** 房主添加一个电脑玩家 */
    async addBot()
    {
      if (this.busy)
      {
        return
      }

      this.busy = true

      try
      {
        await socket.request('whmj.room.addBot')
      }
      catch (err)
      {
        this.toast(err.message || '添加电脑失败')
      }
      finally
      {
        this.busy = false
      }
    },

    /** 房主开始游戏 */
    async startGame()
    {
      if (this.busy)
      {
        return
      }

      this.busy = true

      try
      {
        await socket.request('whmj.room.start')
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

    /** 复制房号 */
    copyId()
    {
      if (!this.roomId)
      {
        return
      }

      uni.setClipboardData({ data: this.roomId })
      this.toast('房号已复制')
    },

    /** 跳转牌桌 */
    gotoTable()
    {
      if (this.leaving)
      {
        return
      }

      this.leaving = true
      uni.redirectTo({ url: `/pages/whmj/table?roomId=${this.roomId}` })
    },

    /** 退出房间并回大厅 */
    async leave()
    {
      this.leaving = true

      try
      {
        await socket.request('whmj.room.leave')
      }
      catch (e)
      {
        console.warn('[whmj] 离开房间失败', e)
      }

      uni.reLaunch({ url: '/pages/whmj/index' })
    },

    /** 轻提示 */
    toast(text)
    {
      this.tipText = text

      if (this.tipTimer)
      {
        clearTimeout(this.tipTimer)
      }

      this.tipTimer = setTimeout(() => { this.tipText = '' }, 1800)
    }
  }
}
</script>

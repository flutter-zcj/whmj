<style lang="scss" scoped>
$gold: #E8C46A;
$cream: #FFE9B0;
$mint: #7BE0B8;
$line: rgba(232, 196, 106, 0.34);
.page { position: relative; width: 100%; height: 100%; overflow: hidden; background: #03120b; }
.bg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; filter: blur(2px) saturate(1.04) brightness(0.92); }
.veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 40%, rgba(6, 44, 27, 0.30) 0%, rgba(2, 12, 8, 0.90) 78%); }
.layer { position: absolute; left: 0; top: 0; width: 1334px; height: 750px; transform-origin: 0 0; }
.head { position: absolute; left: 0; top: 0; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; height: 88px; }
.head__title { position: relative; font-size: 34px; font-weight: 700; letter-spacing: 12px; color: $cream; text-shadow: 0 3px 10px rgba(0, 0, 0, 0.6); }
.head__sub { position: relative; margin-left: 16px; padding: 3px 12px; background: rgba(123, 224, 184, 0.16); border: 1px solid rgba(123, 224, 184, 0.5); border-radius: 10px; font-size: 16px; letter-spacing: 2px; color: #AFF3DF; }
.back { position: absolute; left: 28px; top: 18px; display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: rgba(8, 36, 27, 0.82); border: 2px solid rgba(232, 196, 106, 0.55); border-radius: 26px; }
.back__t { position: relative; margin-top: -6px; font-size: 40px; line-height: 40px; color: $gold; }
.copy { position: absolute; right: 28px; top: 20px; display: flex; align-items: center; justify-content: center; width: 168px; height: 48px; background: linear-gradient(180deg, rgba(28, 96, 76, 0.95) 0%, rgba(9, 50, 38, 0.95) 100%); border: 2px solid rgba(232, 196, 106, 0.6); border-radius: 24px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); }
.copy__t { position: relative; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: $cream; }
.no { position: absolute; left: 0; top: 96px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; }
.no__label { position: relative; margin-right: 16px; padding: 6px 14px; background: rgba(232, 196, 106, 0.16); border: 1px solid rgba(232, 196, 106, 0.5); border-radius: 10px; font-size: 20px; letter-spacing: 4px; color: $cream; }
.no__value { position: relative; font-size: 56px; font-weight: 700; letter-spacing: 10px; color: $cream; text-shadow: 0 0 22px rgba(232, 196, 106, 0.55), 0 4px 12px rgba(0, 0, 0, 0.6); }
.seats { position: absolute; left: 110px; top: 196px; display: flex; flex-direction: row; width: 1114px; }
.seat { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 262px; height: 304px; margin: 0 11px; box-sizing: border-box; background: linear-gradient(180deg, rgba(13, 68, 53, 0.94) 0%, rgba(6, 34, 26, 0.96) 100%); border: 2px solid rgba(232, 196, 106, 0.38); border-radius: 20px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 0 26px rgba(44, 220, 180, 0.1); }
.seat--empty { position: relative; background: linear-gradient(180deg, rgba(9, 48, 38, 0.72) 0%, rgba(5, 26, 20, 0.8) 100%); border: 2px dashed rgba(123, 224, 184, 0.4); box-shadow: none; }
.seat--mine { position: relative; border-color: rgba(123, 224, 184, 0.95); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), inset 0 0 26px rgba(44, 220, 180, 0.2); }
.seat--owner { position: relative; border-color: rgba(255, 205, 120, 0.95); box-shadow: 0 0 0 2px rgba(255, 205, 120, 0.22), 0 12px 30px rgba(0, 0, 0, 0.42); }
.seat__index { position: absolute; left: 16px; top: 12px; font-size: 15px; letter-spacing: 1px; color: rgba(191, 246, 230, 0.42); }
.seat__faceWrap { position: relative; display: flex; align-items: center; justify-content: center; width: 132px; height: 132px; }
.seat__face { position: relative; width: 122px; height: 122px; border: 3px solid rgba(123, 224, 184, 0.7); border-radius: 61px; background: rgba(0, 0, 0, 0.3); }
.seat--owner .seat__face { position: relative; border-color: $gold; }
.seat__tag { position: absolute; right: -18px; bottom: -4px; padding: 2px 10px; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.seat__tag--owner { position: absolute; background: linear-gradient(180deg, #FFE29A 0%, #C48A2E 100%); color: #4A2C08; }
.seat__tag--bot { position: absolute; background: rgba(123, 224, 184, 0.9); color: #06301F; }
.seat__nick { position: relative; margin-top: 20px; max-width: 220px; overflow: hidden; font-size: 24px; font-weight: 700; color: #FFF3D6; text-align: center; }
.seat__state { position: relative; margin-top: 8px; font-size: 18px; letter-spacing: 2px; color: rgba(191, 246, 230, 0.82); }
.seat__state--ready { position: relative; margin-top: 8px; font-size: 18px; letter-spacing: 2px; color: #7BEFC9; }
.seat__state--off { position: relative; margin-top: 8px; font-size: 18px; letter-spacing: 2px; color: #FF9C8A; }
.seat__plus { position: relative; display: flex; align-items: center; justify-content: center; width: 108px; height: 108px; border: 3px dashed rgba(123, 224, 184, 0.62); border-radius: 54px; }
.seat__plusT { position: relative; margin-top: -8px; font-size: 60px; line-height: 60px; color: rgba(123, 224, 184, 0.88); }
.seat__empty { position: relative; margin-top: 18px; font-size: 22px; letter-spacing: 2px; color: rgba(191, 246, 230, 0.7); }
.seat__hint { position: relative; margin-top: 8px; font-size: 16px; color: rgba(232, 196, 106, 0.75); }
.ops { position: absolute; left: 0; top: 544px; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 1334px; }
.btn { position: relative; display: flex; align-items: center; justify-content: center; width: 236px; height: 68px; margin: 0 14px; border-radius: 34px; }
.btn--gold { position: relative; background: linear-gradient(180deg, #FFE7A6 0%, #D79A38 100%); border: 3px solid #FFF6DC; box-shadow: 0 6px 18px rgba(120, 74, 20, 0.5); }
.btn--gold .btn__t { position: relative; color: #4A2C08; }
.btn--ghost { position: relative; background: linear-gradient(180deg, rgba(20, 86, 68, 0.96) 0%, rgba(7, 44, 33, 0.96) 100%); border: 2px solid rgba(123, 224, 184, 0.62); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4); }
.btn--ghost .btn__t { position: relative; color: #BFF6E6; }
.btn--off { position: relative; opacity: 0.55; }
.btn__t { position: relative; font-size: 24px; font-weight: 700; letter-spacing: 4px; }
.wait { position: relative; font-size: 22px; letter-spacing: 2px; color: rgba(246, 233, 206, 0.72); }
.tip { position: absolute; left: 0; top: 676px; width: 1334px; font-size: 18px; letter-spacing: 2px; color: rgba(246, 233, 206, 0.52); text-align: center; }
.toast { position: absolute; left: 50%; top: 676px; margin-left: -220px; display: flex; align-items: center; justify-content: center; width: 440px; height: 56px; background: rgba(12, 40, 30, 0.94); border: 1px solid rgba(232, 196, 106, 0.5); border-radius: 28px; font-size: 19px; color: #DFF7EF; }
</style>

<template>
  <view class="page">
    <image class="bg" :src="bgImage" mode="aspectFill" />
    <view class="veil"></view>
    <view class="layer" :style="rootStyle">
      <view class="head">
        <view class="back" @click="leave"><text class="back__t">‹</text></view>
        <text class="head__title">掼 蛋</text>
        <text class="head__sub">四人两副牌</text>
        <view class="copy" @click="copyInvite"><text class="copy__t">邀请好友</text></view>
      </view>

      <view class="no">
        <text class="no__label">房间号</text>
        <text class="no__value">{{ roomId || '------' }}</text>
      </view>

      <view class="seats">
        <view
          class="seat"
          :class="{ 'seat--empty': isEmpty(seat), 'seat--mine': isMine(seat), 'seat--owner': isOwnerSeat(seat) }"
          v-for="(seat, i) in seatList"
          :key="i"
          @click="onSeatTap(i)">
          <text class="seat__index">座位 {{ i + 1 }}</text>
          <template v-if="!isEmpty(seat)">
            <view class="seat__faceWrap">
              <image class="seat__face" :src="faceOf(seat, i)" mode="aspectFill" />
              <text class="seat__tag seat__tag--owner" v-if="isOwnerSeat(seat)">房主</text>
              <text class="seat__tag seat__tag--bot" v-else-if="seat.bot">电脑</text>
            </view>
            <text class="seat__nick">{{ seat.name || '玩家' }}</text>
            <text :class="stateClass(seat)">{{ stateText(seat) }}</text>
          </template>
          <template v-else>
            <view class="seat__plus"><text class="seat__plusT">+</text></view>
            <text class="seat__empty">等待加入</text>
            <text class="seat__hint" v-if="isHost">点击添加电脑</text>
          </template>
        </view>
      </view>

      <view class="ops">
        <view class="btn btn--ghost" :class="{ 'btn--off': busy || full }" v-if="isHost" @click="addBot"><text class="btn__t">+ 添加电脑</text></view>
        <view class="btn btn--gold" :class="{ 'btn--off': !full }" v-if="isHost" @click="startGame"><text class="btn__t">开始游戏</text></view>
        <text class="wait" v-else>等待房主开始游戏…</text>
      </view>

      <text class="tip">把房号发给好友一起坐满四人，也可以直接添加电脑开局</text>
      <view class="toast" v-if="tipText">{{ tipText }}</view>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：gdRoom
 * 功能说明：掼蛋房间页，沿用麻将房间的选人布局，展示房号与四个座位，
 *          房主可添加电脑、开始游戏，其他人凭房号入座；开局后跳到牌桌页
 * 研发时间：2026/11/12
 * 研发人员：郑朝军
 *
 * 变量说明：roomId 当前房号；seats 服务端四个座位；hostSeat 房主座位；mySeat 本人座位；
 *          busy 操作锁；entered 已跳牌桌标记；tipText 轻提示
 * 事件说明：onSeatTap 点空位加电脑；addBot 加电脑；startGame 开局；copyInvite 复制邀请；
 *          leave 离开房间回大厅
 *
 * 插槽说明：无
 */
import Net, { gdWsUrl } from '@/game/net.js'
import { getUser } from '@/utils/whmj/http.js'
import { ASSET_BASE } from '@/utils/whmj/const.js'

const XL = `${ASSET_BASE}/xl`
const XYF = `${ASSET_BASE}/xyf`

/** 掼蛋美术目录，资源随 src/static/game 一起打包 */
const GAME = `${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/static/game`

/** 房号缓存键，刷新页面时据此回到原房间 */
const ROOM_KEY = 'gd_room'

export default
{
  data()
  {
    return {
      roomId: '',
      seats: [],
      hostSeat: -1,
      mySeat: -1,
      nick: '',
      avatar: '',
      uid: '',
      create: false,
      busy: false,
      full: false,
      entered: false,
      leaving: false,
      tipText: '',
      tipTimer: null,
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

    /** 背景图：掼蛋原版牌桌，铺满做虚化底 */
    bgImage()
    {
      return `${GAME}/ui/table.jpg`
    },

    /** 默认头像 */
    defaultFace()
    {
      return `${XL}/hall/head.png`
    },

    /** 固定四格座位 */
    seatList()
    {
      const out = []

      for (let i = 0; i < 4; i++)
      {
        out.push(this.seats[i] || { seat: i, empty: true })
      }

      return out
    },

    /** 是否是房主 */
    isHost()
    {
      return this.mySeat >= 0 && Number(this.mySeat) === Number(this.hostSeat)
    }
  },

  onLoad(query)
  {
    const opt = query || {}
    const user = getUser() || {}
    const saved = this.savedRoom()
    const room = opt.room ? String(opt.room) : this.searchParam('room')

    this.nick = opt.name ? decodeURIComponent(opt.name) : (user.nick || `游客${Math.floor(Math.random() * 9000 + 1000)}`)
    this.avatar = user.avatar || ''
    this.uid = user.uid ? `mj${user.uid}` : ''

    if (room)
    {
      this.roomId = room
      this.create = false
    }
    else if (saved && this.isReload())
    {
      this.roomId = saved
      this.create = false
    }
    else
    {
      this.roomId = ''
      this.create = true
    }
  },

  onReady()
  {
    this.computeScale()

    this.onResize = () => this.computeScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)

    this.connect()
  },

  onUnload()
  {
    if (this.onResize)
    {
      window.removeEventListener('resize', this.onResize)
      window.removeEventListener('orientationchange', this.onResize)
    }

    if (this.tipTimer)
    {
      clearTimeout(this.tipTimer)
    }

    if (this.net)
    {
      this.net.close()
    }
  },

  methods:
  {
    /** 与牌桌页保持一致的设计网格缩放 */
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

    /** 兼容读一下页面外的查询串：?room=xxx#/pages/gd/room 这种邀请链接 */
    searchParam(key)
    {
      try
      {
        const search = new URLSearchParams(window.location.search || '')

        return search.get(key) || ''
      }
      catch (err)
      {
        return ''
      }
    },

    /** 是否刷新进入 */
    isReload()
    {
      try
      {
        const entries = performance.getEntriesByType('navigation') || []

        return entries.length > 0 && entries[0].type === 'reload'
      }
      catch (err)
      {
        return false
      }
    },

    /** 会话里保存的房号 */
    savedRoom()
    {
      try
      {
        return sessionStorage.getItem(ROOM_KEY) || ''
      }
      catch (err)
      {
        return ''
      }
    },

    /** 保存房号 */
    saveRoom(id)
    {
      try
      {
        sessionStorage.setItem(ROOM_KEY, id)
      }
      catch (err)
      {
        this.tipText = ''
      }
    },

    /** 连接掼蛋服务端并进房 */
    connect()
    {
      const net = new Net({
        room: this.roomId,
        name: this.nick,
        uid: this.uid,
        create: this.create,
        url: gdWsUrl()
      })

      this.net = net

      net.on('joined', (m) =>
      {
        this.roomId = m.room
        this.mySeat = m.seat
        this.saveRoom(m.room)
      })

      net.on('sync', (m) => this.applySync(m))

      net.on('error', (m) =>
      {
        const msg = m.msg || '操作失败'

        this.toast(msg)

        if (/不存在|已满|已开始|需 \d/.test(msg))
        {
          setTimeout(() => this.backToLobby(), 1600)
        }
      })

      net.on('close', () =>
      {
        if (!this.leaving && !this.entered)
        {
          this.toast('连接断开，正在重连…')
        }
      })

      net.connect()
    },

    /** 应用服务端全量状态 */
    applySync(m)
    {
      if (!m)
      {
        return
      }

      if (Array.isArray(m.seats))
      {
        this.seats = m.seats
        this.full = m.seats.every((s) => s && !s.empty)
      }

      if (m.hostSeat !== undefined && m.hostSeat >= 0)
      {
        this.hostSeat = m.hostSeat
      }

      if (m.room)
      {
        this.roomId = m.room
        this.saveRoom(m.room)
      }

      if (m.status === 'playing' || m.status === 'settled')
      {
        this.gotoTable()
      }
    },

    /** 空位判断 */
    isEmpty(seat)
    {
      return !seat || !!seat.empty || !seat.name
    },

    /** 是否本人座位 */
    isMine(seat)
    {
      return !!seat && Number(seat.seat) === Number(this.mySeat) && !this.isEmpty(seat)
    },

    /** 是否房主座位 */
    isOwnerSeat(seat)
    {
      return !!seat && Number(seat.seat) === Number(this.hostSeat) && !this.isEmpty(seat)
    },

    /** 头像：本人优先用账号头像，其余按座位交替取默认头像 */
    faceOf(seat, i)
    {
      if (this.isMine(seat) && this.avatar)
      {
        return this.avatar
      }

      if (seat.bot || !seat.name)
      {
        return `${XYF}/table/im_defaulthead_${i % 2}.png`
      }

      return i % 2 === 0 ? this.defaultFace : `${XYF}/table/im_defaulthead_1.png`
    },

    /** 状态文案 */
    stateText(seat)
    {
      if (seat.bot)
      {
        return '电脑玩家'
      }

      if (seat.online === false)
      {
        return '已离线'
      }

      return seat.ready ? '已准备' : '已入座'
    },

    /** 状态样式 */
    stateClass(seat)
    {
      if (seat.bot || seat.ready)
      {
        return 'seat__state seat__state--ready'
      }

      if (seat.online === false)
      {
        return 'seat__state seat__state--off'
      }

      return 'seat__state'
    },

    /** 点空位：房主直接补一个电脑 */
    async onSeatTap(i)
    {
      const seat = this.seatList[i]

      if (!this.isEmpty(seat))
      {
        return
      }

      if (!this.isHost)
      {
        this.toast('只有房主可以添加电脑')

        return
      }

      await this.addBot()
    },

    /** 添加一个电脑玩家 */
    async addBot()
    {
      if (this.busy || !this.net)
      {
        return
      }

      if (this.full)
      {
        this.toast('房间已满')

        return
      }

      this.busy = true
      this.net.addBot()
      setTimeout(() => { this.busy = false }, 400)
    },

    /** 房主开始游戏：先尝试全屏，再等服务端把状态切到 playing */
    async startGame()
    {
      if (this.busy || !this.net)
      {
        return
      }

      if (!this.full)
      {
        this.toast('四个座位坐满才能开始，可添加电脑')

        return
      }

      this.busy = true
      await this.requestFullscreen()
      this.net.start()
      setTimeout(() => { this.busy = false }, 600)
    },

    /** 进入浏览器全屏并尽量锁定横屏（失败不打断流程） */
    async requestFullscreen()
    {
      try
      {
        const el = document.documentElement

        if (!document.fullscreenElement && el && el.requestFullscreen)
        {
          await el.requestFullscreen({ navigationUI: 'hide' })
        }
      }
      catch (err)
      {
        this.tipText = ''
      }

      try
      {
        if (screen.orientation && screen.orientation.lock)
        {
          await screen.orientation.lock('landscape')
        }
      }
      catch (err)
      {
        this.tipText = ''
      }
    },

    /** 开局后跳牌桌页 */
    gotoTable()
    {
      if (this.entered || this.leaving)
      {
        return
      }

      this.entered = true
      this.saveRoom(this.roomId)
      uni.redirectTo({ url: `/pages/gd/table?room=${this.roomId}` })
    },

    /** 复制房号与邀请链接 */
    copyInvite()
    {
      if (!this.roomId)
      {
        return
      }

      const link = `${location.origin}${location.pathname}#/pages/gd/room?room=${this.roomId}`
      const text = `掼蛋房间 ${this.roomId}，点开直接入座：${link}`

      uni.setClipboardData({ data: text })
      this.toast('邀请链接已复制')
    },

    /** 离开房间回大厅 */
    async leave()
    {
      this.leaving = true

      if (this.net)
      {
        this.net.leave()
        this.net.close()
      }

      try
      {
        sessionStorage.removeItem(ROOM_KEY)
      }
      catch (err)
      {
        this.tipText = ''
      }

      setTimeout(() => this.backToLobby(), 120)
    },

    /** 回大厅 */
    backToLobby()
    {
      if (this.net)
      {
        this.net.close()
      }

      try
      {
        sessionStorage.removeItem(ROOM_KEY)
      }
      catch (err)
      {
        this.tipText = ''
      }

      uni.reLaunch({
        url: '/pages/whmj/index',
        fail: () => window.history.back()
      })
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

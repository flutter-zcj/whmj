<style scoped>
.gd-page { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 46%, #11382a 0%, #08190f 62%, #030d08 100%); overflow: hidden; }
.gd-stage { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.gd-canvas { position: relative; width: 100%; height: 100%; }
.gd-canvas :deep(canvas) { position: absolute; display: block; margin: 0; }
.gd-fs { position: absolute; right: 16rpx; top: 16rpx; z-index: 130; display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; border-radius: 32rpx; background: rgba(0, 0, 0, .42); border: 1rpx solid rgba(232, 196, 106, .55); }
.gd-fs__ico { position: relative; font-size: 28rpx; color: #ffe9b0; }
.gd-mask { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 140; display: flex; align-items: center; justify-content: center; background: rgba(4, 20, 12, .92); }
.gd-mask__text { position: relative; padding: 0 40rpx; font-size: 28rpx; line-height: 44rpx; color: #9fe6bf; text-align: center; }
</style>

<template>
  <view class="gd-page" @tap="onPageTap">
    <view id="gd-stage" class="gd-stage">
      <view id="gd-root" class="gd-canvas"></view>
    </view>
    <view class="gd-fs" v-if="showFs" @tap.stop="enterFullscreen">
      <text class="gd-fs__ico">⛶</text>
    </view>
    <view class="gd-mask" v-if="errorText">
      <text class="gd-mask__text">{{ errorText }}</text>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：gdTable
 * 功能说明：掼蛋牌桌页，挂载 Phaser 场景并按房号联机；沿用大厅的全局横屏适配，
 *          画布铺满可视区，支持一键全屏；房间回到等待态时自动回到房间页
 * 研发时间：2026/11/12
 * 研发人员：郑朝军
 * 变量说明：showFs 是否显示全屏入口；errorText 无法开局时的提示；roomId 当前房号
 * 事件说明：onPageTap 首次触摸时尝试全屏；enterFullscreen 进入全屏；backToLobby 回大厅
 * 插槽说明：无
 * 修改时间       人员        说明
 * 2026/11/12     郑朝军      从 guandan-uni 迁移牌桌，拆掉页内二次旋转，改为全屏铺满
 */
import { startGame, destroyGame, setForcedRotation } from '@/game/main.js'
import { gdWsUrl } from '@/game/net.js'
import { getUser } from '@/utils/whmj/http.js'

/** 房号缓存键 */
const ROOM_KEY = 'gd_room'

export default
{
  data()
  {
    return {
      roomId: '',
      showFs: false,
      errorText: '',
      fsTried: false,
      leaving: false
    }
  },

  onLoad(query)
  {
    const opt = query || {}
    const user = getUser() || {}
    const saved = this.savedRoom()
    const room = opt.room ? String(opt.room) : (this.searchParam('room') || saved)

    this.roomId = room
    window.__GD_NAME = opt.name ? decodeURIComponent(opt.name) : (user.nick || '玩家')
    window.__GD_UID = user.uid ? `mj${user.uid}` : ''
    window.__GD_WS = gdWsUrl()
    window.__GD_ROOM = room
    window.__GD_CREATE = false
  },

  mounted()
  {
    if (!this.roomId)
    {
      this.errorText = '没有房号，请从大厅重新进入掼蛋'
      setTimeout(() => this.backToLobby(), 1500)

      return
    }

    this.layout()

    this.onResize = () => this.layout()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)

    this.onFsChange = () =>
    {
      this.showFs = !document.fullscreenElement
      setTimeout(() => this.layout(), 260)
    }

    document.addEventListener('fullscreenchange', this.onFsChange)
    this.showFs = !!document.documentElement.requestFullscreen

    /** 从房间页点开始时通常已经全屏，这里只兜底补一次横屏锁 */
    this.lockLandscape()

    try
    {
      startGame('gd-root', {
        onExit: () => this.backToLobby(),
        onWaiting: (room) => this.backToRoom(room)
      })
    }
    catch (err)
    {
      this.errorText = `牌桌启动失败：${(err && err.message) || '未知错误'}`
    }
  },

  beforeUnmount()
  {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('orientationchange', this.onResize)
    document.removeEventListener('fullscreenchange', this.onFsChange)
    destroyGame()
  },

  methods:
  {
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

    /** 兼容读页面外的查询串 */
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

    /** 按当前视口重排画布：全局横屏已把根容器转好，这里只把舞台铺满 */
    layout()
    {
      this.$nextTick(() =>
      {
        cancelAnimationFrame(this.rafId)
        this.rafId = requestAnimationFrame(() =>
        {
          setForcedRotation(0)
          setTimeout(() => setForcedRotation(0), 120)
        })
      })
    },

    /** 首次触摸页面时尝试全屏：浏览器要求全屏必须发生在用户手势里 */
    onPageTap()
    {
      if (this.fsTried || document.fullscreenElement || !document.documentElement.requestFullscreen)
      {
        return
      }

      this.fsTried = true
      this.enterFullscreen()
    },

    /** 进入系统全屏并锁横屏 */
    async enterFullscreen()
    {
      try
      {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen)
        {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        }
      }
      catch (err)
      {
        this.errorText = ''
      }

      this.lockLandscape()
      setTimeout(() => this.layout(), 320)
    },

    /** 尽量锁定横屏，失败不打断牌局 */
    async lockLandscape()
    {
      try
      {
        if (screen.orientation && screen.orientation.lock)
        {
          await screen.orientation.lock('landscape')
        }
      }
      catch (err)
      {
        this.errorText = ''
      }
    },

    /** 房间回到等待态（有人离座）：切回房间页继续选人 */
    backToRoom(room)
    {
      if (this.leaving)
      {
        return
      }

      this.leaving = true
      destroyGame()

      const id = room || this.roomId

      uni.redirectTo({
        url: `/pages/gd/room?room=${id}`,
        fail: () => this.backToLobby()
      })
    },

    /** 回麻将大厅，并清掉房号 */
    backToLobby()
    {
      this.leaving = true
      destroyGame()

      try
      {
        sessionStorage.removeItem(ROOM_KEY)
      }
      catch (err)
      {
        this.errorText = ''
      }

      uni.reLaunch({
        url: '/pages/whmj/index',
        fail: () => window.history.back()
      })
    }
  }
}
</script>

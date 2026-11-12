<style scoped>
.gd-page { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: #06180f; overflow: hidden; }
.gd-stage { position: absolute; left: 50%; top: 50%; width: 100vw; height: 100vh; transform: translate(-50%, -50%); transform-origin: 50% 50%; }
.gd-stage--rot { position: absolute; transform: translate(-50%, -50%) rotate(90deg); }
.gd-canvas { position: relative; width: 100%; height: 100%; }
.gd-canvas :deep(canvas) { position: absolute; display: block; margin: 0; }
.gd-back { position: absolute; left: 16rpx; top: 16rpx; z-index: 130; display: flex; align-items: center; height: 60rpx; padding: 0 22rpx; border-radius: 30rpx; background: rgba(0, 0, 0, .42); border: 1rpx solid rgba(232, 196, 106, .55); }
.gd-back__text { position: relative; font-size: 24rpx; color: #ffe9b0; }
.gd-fs { position: absolute; right: 16rpx; top: 16rpx; z-index: 130; display: flex; align-items: center; justify-content: center; width: 60rpx; height: 60rpx; border-radius: 30rpx; background: rgba(0, 0, 0, .42); border: 1rpx solid rgba(232, 196, 106, .55); }
.gd-fs__ico { position: relative; font-size: 26rpx; color: #ffe9b0; }
.gd-mask { position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 140; display: flex; align-items: center; justify-content: center; background: rgba(4, 20, 12, .92); }
.gd-mask__text { position: relative; font-size: 28rpx; color: #9fe6bf; }
</style>

<template>
  <view class="gd-page">
    <view id="gd-stage" class="gd-stage" :class="rotated ? 'gd-stage--rot' : ''">
      <view id="gd-root" class="gd-canvas"></view>
    </view>
    <view class="gd-back" @tap="backToLobby">
      <text class="gd-back__text">‹ 大厅</text>
    </view>
    <view class="gd-fs" v-if="showFs" @tap="enterFullscreen">
      <text class="gd-fs__ico">⛶</text>
    </view>
    <view class="gd-mask" v-if="errorText">
      <text class="gd-mask__text">{{ errorText }}</text>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：gdIndex
 * 功能说明：掼蛋牌桌页，挂载 Phaser 场景并按联机参数进房；竖屏时整体旋转成横屏铺满
 * 研发时间：2026/11/12
 * 研发人员：郑朝军
 * 变量说明：rotated 是否强制横屏；showFs 是否显示全屏入口；errorText 无法开局时的提示
 * 事件说明：backToLobby 返回大厅；enterFullscreen 进入全屏并锁定横屏
 * 插槽说明：无
 * 修改时间       人员        说明
 * 2026/11/12     郑朝军      从 guandan-uni 迁移页面，接入麻将账号与统一网关联机地址
 */
import { startGame, destroyGame, setForcedRotation } from '@/game/main.js'
import { getUser } from '@/utils/whmj/http.js'

/** 本地开发兜底地址：直连掼蛋服务端 */
const DEV_WS = 'ws://127.0.0.1:9120/'

/** 房号缓存键，刷新页面时据此回到原房间 */
const ROOM_KEY = 'gd_room'

export default
{
  data()
  {
    return {
      rotated: false,
      showFs: false,
      errorText: ''
    }
  },

  onLoad(opt)
  {
    const query = this.parseQuery(opt)
    const user = getUser() || {}
    const saved = this.savedRoom()
    const reloaded = this.isReload()

    window.__GD_NAME = query.name || user.nick || `游客${Math.floor(Math.random() * 9000 + 1000)}`
    window.__GD_UID = user.uid ? `mj${user.uid}` : ''
    window.__GD_WS = query.ws || this.gatewayUrl()

    if (query.room)
    {
      window.__GD_ROOM = query.room
      window.__GD_CREATE = false
    }
    else if (reloaded && saved)
    {
      window.__GD_ROOM = saved
      window.__GD_CREATE = false
    }
    else
    {
      window.__GD_ROOM = ''
      window.__GD_CREATE = true
    }
  },

  onShow()
  {
    if (this.rafId)
    {
      cancelAnimationFrame(this.rafId)
    }
  },

  mounted()
  {
    this.layout()
    this.onResize = () => this.layout()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)

    this.onFsChange = () =>
    {
      this.showFs = !document.fullscreenElement
      setTimeout(() => this.layout(), 250)
    }

    document.addEventListener('fullscreenchange', this.onFsChange)
    this.showFs = !!document.documentElement.requestFullscreen

    try
    {
      startGame('gd-root', { onExit: () => this.backToLobby() })
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
    /**
     * 解析进房参数，兼容 uni 页面参数与 H5 查询串两种来源
     * @param {Object} opt 页面参数
     * @returns {Object} 房间号、昵称、是否建房、服务端地址
     */
    parseQuery(opt)
    {
      const query = { room: '', name: '', create: '', ws: '' }
      const source = (opt || {})

      Object.keys(query).forEach((key) =>
      {
        if (source[key])
        {
          query[key] = source[key]
        }
      })

      if (typeof location === 'undefined')
      {
        return query
      }

      const search = new URLSearchParams(location.search || '')

      Object.keys(query).forEach((key) =>
      {
        const value = search.get(key)

        if (!query[key] && value)
        {
          query[key] = value
        }
      })

      if (query.name)
      {
        query.name = decodeURIComponent(query.name)
      }

      return query
    },

    /** 是否刷新进入（刷新时沿用上一局的房号，避免把牌桌刷新成新房间） */
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

    /** 刷新页面后回到原房间：房号存在会话存储里 */
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

    /** 联机地址：同域名走网关 /gd-ws/，本地开发直连服务端 */
    gatewayUrl()
    {
      if (typeof location === 'undefined')
      {
        return DEV_WS
      }

      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      const isDev = isLocal && location.port !== '3000'

      if (isDev)
      {
        return DEV_WS
      }

      return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/gd-ws/`
    },

    /** 按当前视口重排：竖屏时把舞台旋转成横屏并铺满 */
    layout()
    {
      const portrait = window.innerHeight > window.innerWidth
      const vw = window.innerWidth
      const vh = window.innerHeight

      this.rotated = portrait

      this.$nextTick(() =>
      {
        const stage = document.getElementById('gd-stage')

        if (stage)
        {
          stage.style.width = `${portrait ? vh : vw}px`
          stage.style.height = `${portrait ? vw : vh}px`
        }

        cancelAnimationFrame(this.rafId)
        this.rafId = requestAnimationFrame(() => setForcedRotation(portrait ? 90 : 0))
      })
    },

    /** 进入系统全屏并锁定横屏 */
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

      setTimeout(() => this.layout(), 350)
    },

    /** 返回麻将大厅，同时忘掉房号，下次进入重新建房 */
    backToLobby()
    {
      try
      {
        sessionStorage.removeItem(ROOM_KEY)
      }
      catch (err)
      {
        this.errorText = ''
      }

      destroyGame()

      uni.reLaunch({
        url: '/pages/whmj/index',
        fail: () => window.history.back()
      })
    }
  }
}
</script>

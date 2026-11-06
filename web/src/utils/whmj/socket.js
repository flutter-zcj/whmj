/**
 * 麻将长连接封装
 * 基于 pomelo 客户端完成握手、鉴权、请求应答与事件订阅，
 * 对页面暴露 connect / request / on / destroy 四个方法，屏蔽底层协议细节
 */
import './protocol.js'
import './pomelo.js'

/** 连接超时时间，单位毫秒 */
const CONNECT_TIMEOUT = 10000

/** 网关转发前缀，由 nginx 转发到后端 WebSocket 端口 */
const WS_PREFIX = '/whmj-ws/'

/**
 * 计算 WebSocket 地址
 * 生产环境与页面同源走 nginx 前缀，本地开发由 vite 代理转发
 * @returns {String} 完整 ws/wss 地址
 */
function resolveURL()
{
  /* 小程序与 App 端没有 window.location，退回本地调试地址 */
  if (typeof window === 'undefined' || !window.location || !window.location.host)
  {
    return 'ws://127.0.0.1:9102/'
  }

  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

  return `${scheme}//${window.location.host}${WS_PREFIX}`
}

/** 长连接管理类 */
class MahjongSocket
{
  constructor()
  {
    this.pomelo = null
    this.connected = false
    this.handlers = []
    this.uid = 0
    this.nick = ''
  }

  /**
   * 建立连接并完成令牌鉴权
   * @param {String} token 登录令牌
   * @returns {Promise<Object>} 鉴权结果，含 uid 与昵称
   */
  connect(token)
  {
    this.destroy()

    return new Promise((resolve, reject) =>
    {
      const pomelo = typeof window !== 'undefined' ? window.pomelo : null

      if (!pomelo)
      {
        reject(new Error('长连接组件未加载'))
        return
      }

      let settled = false
      const timer = setTimeout(() =>
      {
        if (settled)
        {
          return
        }

        settled = true
        reject(new Error('连接超时，请检查网络'))
      }, CONNECT_TIMEOUT)

      pomelo.on('disconnect', () =>
      {
        this.connected = false
      })

      pomelo.on('error', (err) =>
      {
        console.warn('[whmj] 连接异常', err)
      })

      pomelo.init({ url: resolveURL() }, () =>
      {
        this.pomelo = pomelo
        this.connected = true

        pomelo.request('whmj.gate.auth', { token }, (res) =>
        {
          clearTimeout(timer)

          if (settled)
          {
            return
          }

          settled = true

          if (!res || (res.code !== 0 && res.code !== 200))
          {
            this.connected = false
            reject(new Error((res && res.msg) || '登录状态已失效'))
            return
          }

          this.uid = res.uid || 0
          this.nick = res.nick || ''

          resolve(res)
        })
      })
    })
  }

  /**
   * 发送请求并等待应答
   * @param {String} route 路由，形如 whmj.lobby.enter
   * @param {Object} [data] 请求参数
   * @returns {Promise<Object>} 服务端应答体
   */
  request(route, data)
  {
    return new Promise((resolve, reject) =>
    {
      if (!this.pomelo || !this.connected)
      {
        reject(new Error('尚未连接服务器'))
        return
      }

      this.pomelo.request(route, data || {}, (res) =>
      {

        if (!res)
        {
          reject(new Error('服务器无响应'))
          return
        }

        if (res.code !== undefined && res.code !== 0 && res.code !== 200)
        {
          reject(new Error(res.msg || '操作失败'))
          return
        }

        resolve(res)
      })
    })
  }

  /**
   * 订阅服务端推送
   * @param {String} event 事件名，形如 onDiscard
   * @param {Function} handler 回调
   * @returns {Function} 取消订阅函数
   */
  on(event, handler)
  {
    const pomelo = this.pomelo || (typeof window !== 'undefined' ? window.pomelo : null)

    if (!pomelo)
    {
      return () => {}
    }

    pomelo.on(event, handler)
    this.handlers.push({ event, handler })

    return () => this.off(event, handler)
  }

  /**
   * 取消指定订阅
   * @param {String} event 事件名
   * @param {Function} handler 回调
   */
  off(event, handler)
  {
    const pomelo = this.pomelo || (typeof window !== 'undefined' ? window.pomelo : null)

    if (pomelo && pomelo.removeListener)
    {
      pomelo.removeListener(event, handler)
    }

    this.handlers = this.handlers.filter((it) => it.event !== event || it.handler !== handler)
  }

  /** 断开连接并清空订阅 */
  destroy()
  {
    const pomelo = this.pomelo || (typeof window !== 'undefined' ? window.pomelo : null)

    if (pomelo)
    {
      this.handlers.forEach((it) =>
      {
        if (pomelo.removeListener)
        {
          pomelo.removeListener(it.event, it.handler)
        }
      })

      try
      {
        if (this.connected)
        {
          pomelo.disconnect()
        }
      }
      catch (e)
      {
        console.warn('[whmj] 断开连接失败', e)
      }
    }

    this.handlers = []
    this.connected = false
    this.uid = 0
    this.nick = ''
  }
}

/** 全局单例，页面切换时复用同一条连接 */
export const socket = new MahjongSocket()

export default socket

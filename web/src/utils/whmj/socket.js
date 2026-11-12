/**
 * 麻将长连接封装
 * 基于 pomelo 客户端完成握手、鉴权、请求应答与事件订阅，
 * 对页面暴露 connect / request / on / onLocal / destroy，屏蔽底层协议细节
 */
import './protocol.js'
import './pomelo.js'
import { relogin, getToken } from './http.js'

/** 连接超时时间，单位毫秒 */
const CONNECT_TIMEOUT = 10000

/** 单次请求超时时间，单位毫秒，超时即判定链路已死并触发重连 */
const REQUEST_TIMEOUT = 8000

/** 断线后等待多久重开页面，单位毫秒 */
const RELOAD_DELAY = 700

/** 整页刷新的时间戳键，用于限制刷新频率 */
const RELOAD_KEY = 'whmj_reload_at'

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
    this.locals = {}
    this.uid = 0
    this.nick = ''
    this.token = ''
    this.roomId = ''
    this.opening = null
    this.retryTimer = null
    this.closedByUser = false
    this.wasDown = false
    this.bound = false
    this.silent = false
    this.reloginTried = false
  }

  /**
   * 建立连接并完成令牌鉴权
   * @param {String} token 登录令牌
   * @returns {Promise<Object>} 鉴权结果，含 uid 与昵称
   */
  connect(token)
  {
    this.destroy()

    this.reloginTried = false

    return this.open(token)
  }

  /**
   * 打开底层连接（不做订阅清理，供首次连接与自动重连共用）
   * @param {String} [token] 登录令牌，缺省沿用上次的令牌
   * @returns {Promise<Object>} 鉴权结果
   */
  open(token)
  {
    if (this.opening)
    {
      return this.opening
    }

    if (token)
    {
      this.token = token
    }

    const pomelo = typeof window !== 'undefined' ? window.pomelo : null

    if (!pomelo)
    {
      return Promise.reject(new Error('长连接组件未加载'))
    }

    this.closedByUser = false
    this.bindBuiltin(pomelo)

    /* 先彻底关掉旧 socket 与心跳定时器，否则旧连接的心跳超时会把新连接一起关掉 */
    this.silent = true

    try
    {
      pomelo.disconnect()
    }
    catch (e)
    {
      console.warn('[whmj] 关闭旧连接失败', e)
    }

    this.silent = false

    const task = new Promise((resolve, reject) =>
    {
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

      pomelo.init({ url: resolveURL() }, () =>
      {
        this.pomelo = pomelo
        this.connected = true

        pomelo.request('whmj.gate.auth', { token: this.token, roomId: this.roomId }, (res) =>
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

            // 令牌失效时先用本地记住的账号自动重登，拿到新令牌后再连一次
            if (res && (res.code === 401 || res.code === 403) && !this.reloginTried)
            {
              this.reloginTried = true

              if (this.opening === task)
              {
                this.opening = null
              }

              relogin().then((user) =>
              {
                this.token = (user && user.token) || getToken()

                return this.open(this.token)
              }).then(resolve, (err) =>
              {
                // 自动重登也失败，才判定登录彻底失效，交给页面回登录页
                this.token = ''
                this.closedByUser = true
                this.emitLocal('expired', err)
                reject(new Error((err && err.message) || '登录状态已失效'))
              })

              return
            }

            // 令牌失效就没必要继续重试了，交给页面回到登录页
            if (res && (res.code === 401 || res.code === 403))
            {
              this.token = ''
              this.closedByUser = true
              this.emitLocal('expired', res)
            }

            reject(new Error((res && res.msg) || '登录状态已失效'))
            return
          }

          this.reloginTried = false

          this.uid = res.uid || 0
          this.nick = res.nick || ''

          resolve(res)
          this.afterOpen(res)
        })
      })
    })

    this.opening = task

    const clear = () =>
    {
      if (this.opening === task)
      {
        this.opening = null
      }
    }

    task.then(clear, clear)

    return task
  }

  /**
   * 断线后重新绑定房间，并通知页面重新拉取快照
   * @param {Object} res 鉴权应答
   */
  async afterOpen(res)
  {
    if (this.retryTimer)
    {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    if (!this.roomId)
    {
      if (this.wasDown)
      {
        this.wasDown = false
        this.emitLocal('reconnected', res)
      }

      return
    }

    try
    {
      await this.send('whmj.lobby.joinRoom', { roomId: this.roomId })
    }
    catch (e)
    {
      console.warn('[whmj] 重连后回房失败', e)
    }

    if (this.wasDown)
    {
      this.wasDown = false
      this.emitLocal('reconnected', res)
    }
  }

  /**
   * 注册底层连接状态回调
   * @param {Object} pomelo pomelo 客户端
   */
  bindBuiltin(pomelo)
  {
    if (this.bound)
    {
      return
    }

    this.bound = true

    pomelo.on('disconnect', () =>
    {
      if (this.silent)
      {
        return
      }

      this.connected = false
      this.wasDown = true

      if (!this.closedByUser)
      {
        this.scheduleReconnect()
      }
    })

    pomelo.on('error', (err) =>
    {
      console.warn('[whmj] 连接异常', err)
    })

    pomelo.on('io-error', () =>
    {
      this.connected = false
    })
  }

  /**
   * 掉线处理：pomelo 客户端是全局单例，旧连接断掉后原地重连不会重新握手，
   * 因此短延迟后整页重开，页面凭 localStorage 的令牌与地址栏的房间号自动回房。
   */
  scheduleReconnect()
  {
    if (this.closedByUser || this.retryTimer)
    {
      return
    }

    this.emitLocal('reconnecting', { attempt: 1, delay: RELOAD_DELAY })

    this.retryTimer = setTimeout(() =>
    {
      this.retryTimer = null

      if (this.closedByUser || this.connected)
      {
        return
      }

      this.reloadPage()
    }, RELOAD_DELAY)
  }

  /** 记下刷新时间并重载页面，5 秒内只刷一次，避免死循环 */
  reloadPage()
  {
    if (typeof window === 'undefined' || !window.location)
    {
      return
    }

    try
    {
      const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0)

      if (Date.now() - last < 5000)
      {
        return
      }

      window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
      window.location.reload()
    }
    catch (e)
    {
      console.warn('[whmj] 页面刷新失败', e)
    }
  }

  /**
   * 确保连接可用，未连接时立即补一次
   * @returns {Promise<Object>} 连接结果
   */
  async ensure()
  {
    if (this.connected && this.pomelo)
    {
      return this.pomelo
    }

    if (this.opening)
    {
      return this.opening
    }

    if (!this.token)
    {
      throw new Error('尚未连接服务器')
    }

    return this.open(this.token)
  }

  /**
   * 发送请求并等待应答
   * @param {String} route 路由，形如 whmj.lobby.enter
   * @param {Object} [data] 请求参数
   * @returns {Promise<Object>} 服务端应答体
   */
  async request(route, data)
  {
    if (!this.connected)
    {
      await this.ensure()
    }

    try
    {
      return await this.send(route, data)
    }
    catch (err)
    {
      if (err && err.fatal)
      {
        await this.ensure()

        return this.send(route, data)
      }

      throw err
    }
  }

  /**
   * 在已建立的连接上发一次请求
   * @param {String} route 路由
   * @param {Object} [data] 请求参数
   * @returns {Promise<Object>} 服务端应答体
   */
  send(route, data)
  {
    return new Promise((resolve, reject) =>
    {
      if (!this.pomelo || !this.connected)
      {
        const err = new Error('网络已断开，正在重连…')

        err.fatal = true
        reject(err)

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
        this.connected = false
        this.scheduleReconnect()

        const err = new Error('网络超时，正在重连…')

        err.fatal = true
        reject(err)
      }, REQUEST_TIMEOUT)

      this.pomelo.request(route, data || {}, (res) =>
      {
        if (settled)
        {
          return
        }

        settled = true
        clearTimeout(timer)

        if (!res)
        {
          const err = new Error('服务器无响应')

          err.fatal = true
          reject(err)

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
   * 记录当前房间号，断线重连后据此自动回房
   * @param {String} roomId 房间号
   */
  setRoom(roomId)
  {
    this.roomId = roomId || ''
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
   * 订阅页面级本地事件
   * @param {String} event 事件名，reconnecting / reconnected
   * @param {Function} handler 回调
   * @returns {Function} 取消订阅函数
   */
  onLocal(event, handler)
  {
    this.locals[event] = (this.locals[event] || []).concat([handler])

    return () =>
    {
      this.locals[event] = (this.locals[event] || []).filter((fn) => fn !== handler)
    }
  }

  /**
   * 触发本地事件
   * @param {String} event 事件名
   * @param {Object} payload 事件参数
   */
  emitLocal(event, payload)
  {
    ;(this.locals[event] || []).forEach((fn) =>
    {
      try
      {
        fn(payload)
      }
      catch (e)
      {
        console.warn('[whmj] 本地事件处理失败', event, e)
      }
    })
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

    this.closedByUser = true

    if (this.retryTimer)
    {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    this.wasDown = false

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

/**
 * 麻将服务请求封装
 * 统一处理 baseURL、令牌读写、凭据记忆与登录失效后的自动重登
 *
 * 自动重登约定：
 *   登录/注册成功时把账号密码记到本地（做轻量混淆，不落明文），
 *   之后任意接口返回 401 或长连接鉴权失败，都用这份凭据静默登录一次，
 *   成功后把原请求重放一遍，玩家无感知；只有重登也失败才回到登录页
 */

const BASE_URL = '/whmj-api'
const TOKEN_KEY = 'zbcx_mj_token'
const USER_KEY = 'zbcx_mj_user'
const CRED_KEY = 'zbcx_mj_cred'

/** 凭据混淆密钥，仅用于避免明文密码直接出现在本地存储 */
const CRED_SALT = 0x1f

/** 游客账号形如 guest123456，服务端内存库重启后会丢失，允许按原凭据重建 */
const GUEST_PATTERN = /^guest\d{6}$/

/** 进行中的重登任务，多处并发触发时共用一个，避免重复登录 */
let reloginTask = null

/**
 * 读取登录令牌
 * @returns {String} 令牌，未登录返回空串
 */
export function getToken()
{
  return uni.getStorageSync(TOKEN_KEY) || ''
}

/**
 * 写入登录令牌
 * @param {String} token 令牌
 */
export function setToken(token)
{
  uni.setStorageSync(TOKEN_KEY, token || '')
}

/**
 * 读取当前登录用户
 * @returns {Object|null} 用户信息
 */
export function getUser()
{
  return uni.getStorageSync(USER_KEY) || null
}

/**
 * 写入当前登录用户
 * @param {Object} user 用户信息
 */
export function setUser(user)
{
  uni.setStorageSync(USER_KEY, user || {})
}

/** 清除登录态，保留本地记住的账号密码，便于下次自动登录 */
export function clearAuth()
{
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

/**
 * 混淆字符串，本地不保存明文密码
 * @param {String} text 原文
 * @returns {String} 混淆后的密文，失败返回空串
 */
function mask(text)
{
  try
  {
    const source = encodeURIComponent(text)
    let mixed = ''

    for (let i = 0; i < source.length; i += 1)
    {
      mixed += String.fromCharCode(source.charCodeAt(i) ^ CRED_SALT)
    }

    return btoa(mixed)
  }
  catch (err)
  {
    console.warn('[whmj] 凭据混淆失败', err)

    return ''
  }
}

/**
 * 还原混淆字符串
 * @param {String} cipher 密文
 * @returns {String} 原文，失败返回空串
 */
function unmask(cipher)
{
  try
  {
    const mixed = atob(cipher)
    let source = ''

    for (let i = 0; i < mixed.length; i += 1)
    {
      source += String.fromCharCode(mixed.charCodeAt(i) ^ CRED_SALT)
    }

    return decodeURIComponent(source)
  }
  catch (err)
  {
    console.warn('[whmj] 凭据还原失败', err)

    return ''
  }
}

/**
 * 记住账号密码，供登录失效时自动重登
 * @param {String} userName 账号
 * @param {String} password 密码
 */
export function setCredential(userName, password)
{
  if (!userName || !password)
  {
    return
  }

  const cipher = mask(`${userName}\n${password}`)

  if (cipher)
  {
    uni.setStorageSync(CRED_KEY, cipher)
  }
}

/**
 * 读取记住的账号密码
 * @returns {Object|null} 形如 { userName, password }，无记录返回 null
 */
export function getCredential()
{
  const cipher = uni.getStorageSync(CRED_KEY) || ''

  if (!cipher)
  {
    return null
  }

  const text = unmask(cipher)
  const index = text.indexOf('\n')

  if (index <= 0 || index >= text.length - 1)
  {
    return null
  }

  return { userName: text.slice(0, index), password: text.slice(index + 1) }
}

/** 清除记住的账号密码，退出登录时调用 */
export function clearCredential()
{
  uni.removeStorageSync(CRED_KEY)
}

/**
 * 无拦截的 POST，供自动重登使用
 * @param {String} url 相对路径
 * @param {Object} data 请求体
 * @returns {Promise<Object>} 接口 data 字段
 */
function post(url, data)
{
  return new Promise((resolve, reject) =>
  {
    uni.request(
    {
      url: BASE_URL + url,
      method: 'POST',
      data,
      header: { 'Content-Type': 'application/json' },
      success: (res) =>
      {
        const body = res.data || {}

        if (res.statusCode === 200 && (body.code === 200 || body.code === 0))
        {
          if (body.data && body.data.token)
          {
            setToken(body.data.token)
          }

          resolve(body.data)
          return
        }

        const err = new Error(body.msg || `HTTP ${res.statusCode}`)

        err.code = body.code || res.statusCode
        reject(err)
      },
      fail: () =>
      {
        const err = new Error('网络异常，请稍后重试')

        err.code = 0
        reject(err)
      }
    })
  })
}

/**
 * 落地一次登录应答，写令牌与用户缓存
 * @param {Object} data 服务端 data，含 token 与 profile
 * @returns {Object} 归一化用户信息
 */
function applySession(data)
{
  const profile = (data && data.profile) || {}
  const user =
  {
    uid: profile.id || 0,
    nick: profile.nick || profile.userName || '玩家',
    avatar: profile.avatar || '',
    score: profile.score || 0,
    token: (data && data.token) || ''
  }

  setToken(user.token)
  setUser(user)

  return user
}

/**
 * 用本地记住的账号密码静默重登
 * 服务端内存库重启后游客账号会丢失，此时按原凭据重建一个同名游客
 * @returns {Promise<Object>} 归一化用户信息
 */
export function relogin()
{
  if (reloginTask)
  {
    return reloginTask
  }

  const credential = getCredential()

  if (!credential)
  {
    const err = new Error('登录已失效，请重新登录')

    err.code = 401

    return Promise.reject(err)
  }

  const task = post('/login', credential).catch((err) =>
  {
    /* 服务端内存库重启会丢掉游客账号，密码必然对不上，按原凭据重建一个同名游客 */
    if (err.code === 401 && GUEST_PATTERN.test(credential.userName))
    {
      return post('/register',
      {
        userName: credential.userName,
        password: credential.password,
        nick: `游客${credential.userName.slice(-4)}`
      })
    }

    throw err
  }).then((data) =>
  {
    const user = applySession(data)

    console.info('[whmj] 登录已失效，已用本地账号自动登录', user.nick)

    return user
  }).then((user) =>
  {
    reloginTask = null

    return user
  }, (err) =>
  {
    reloginTask = null
    clearAuth()

    throw err
  })

  reloginTask = task

  return task
}

/**
 * 跳回登录页，已经在登录页时不重复跳转
 */
function redirectLogin()
{
  try
  {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    const current = pages.length ? pages[pages.length - 1].route || '' : ''

    if (current.indexOf('whmj/login') >= 0)
    {
      return
    }

    uni.reLaunch({ url: '/pages/whmj/login' })
  }
  catch (err)
  {
    console.warn('[whmj] 跳转登录页失败', err)
  }
}

/**
 * 发一次请求，不做任何重试
 * @param {Object} options 请求配置
 * @returns {Promise<Object>} 接口 data 字段
 */
function send(options)
{
  return new Promise((resolve, reject) =>
  {
    const token = getToken()

    uni.request(
    {
      url: BASE_URL + options.url,
      method: options.method || 'POST',
      data: options.data || {},
      header:
      {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) =>
      {
        const body = res.data || {}

        if (res.statusCode === 200 && (body.code === 200 || body.code === 0))
        {
          resolve(body.data)
          return
        }

        const err = new Error(body.msg || `HTTP ${res.statusCode}`)

        err.code = body.code || res.statusCode
        reject(err)
      },
      fail: () =>
      {
        const err = new Error('网络异常，请稍后重试')

        err.code = 0
        reject(err)
      }
    })
  })
}

/**
 * 失败提示
 * @param {Object} options 原请求配置
 * @param {Object} err 错误对象
 */
function notify(options, err)
{
  if (options.silent)
  {
    return
  }

  const tip = err && err.code === 401 && options.auth !== false
    ? '登录已失效，请重新登录'
    : (err && err.message) || '请求失败'

  uni.showToast({ title: tip, icon: 'none' })
}

/**
 * 发送请求
 * 令牌失效时先用本地凭据自动重登，成功即重放本次请求，玩家无需重新输密码
 * @param {Object} options 请求配置
 * @param {String} options.url 相对路径
 * @param {String} [options.method] 请求方法，默认 POST
 * @param {Object} [options.data] 请求体
 * @param {Boolean} [options.silent] 是否静默失败，不弹提示
 * @param {Boolean} [options.auth] 传 false 表示该接口本身不做重登，如登录、注册
 * @param {Boolean} [options.retried] 内部使用，标记已重放过一次
 * @returns {Promise<Object>} 接口 data 字段
 */
export async function request(options)
{
  const canRetry = options.auth !== false && options.retried !== true

  try
  {
    return await send(options)
  }
  catch (err)
  {
    if (!err || err.code !== 401 || !canRetry)
    {
      notify(options, err)

      if (err && err.code === 401 && options.auth !== false)
      {
        redirectLogin()
      }

      throw err
    }
  }

  try
  {
    await relogin()
  }
  catch (err)
  {
    notify(options, err)
    redirectLogin()

    throw err
  }

  try
  {
    return await send({ ...options, retried: true })
  }
  catch (err)
  {
    notify(options, err)

    if (err && err.code === 401 && options.auth !== false)
    {
      redirectLogin()
    }

    throw err
  }
}

/**
 * 确保处于登录状态
 * 有令牌直接复用，没有令牌则用本地记住的账号自动登录
 * @returns {Promise<Object|null>} 用户信息，无本地凭据时返回 null
 */
export async function ensureLogin()
{
  if (getToken())
  {
    return getUser()
  }

  if (!getCredential())
  {
    return null
  }

  try
  {
    return await relogin()
  }
  catch (err)
  {
    console.warn('[whmj] 自动登录失败', err)

    return null
  }
}

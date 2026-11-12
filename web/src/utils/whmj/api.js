/**
 * 麻将系统 HTTP 接口定义
 * 覆盖账号、玩法列表与战绩查询，对局期间的实时交互走 WebSocket
 *
 * 服务端统一返回 { code, msg, data }，登录与注册的 data 形如 { token, profile }
 */
import { request, setToken, setUser, setCredential, ensureLogin } from './http.js'

/**
 * 登录成功后落地本地登录态与凭据
 * @param {Object} data 服务端 data，含 token 与 profile
 * @param {String} userName 账号，用于登录失效后自动重登
 * @param {String} password 密码，用于登录失效后自动重登
 * @returns {Object} 归一化后的用户信息 { uid, nick, avatar, token }
 */
function applyAuth(data, userName, password)
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
  setCredential(userName, password)

  return user
}

/**
 * 账号登录
 * 登录接口本身就是重登入口，不做自动重登，避免递归
 * @param {String} userName 账号
 * @param {String} password 密码
 * @returns {Promise<Object>} 归一化用户信息
 */
export function login(userName, password)
{
  return request({ url: '/login', data: { userName, password }, auth: false, silent: true }).then((data) => applyAuth(data, userName, password))
}

/**
 * 账号注册，注册成功后服务端直接下发令牌
 * @param {String} userName 账号
 * @param {String} password 密码
 * @param {String} nick 昵称
 * @returns {Promise<Object>} 归一化用户信息
 */
export function register(userName, password, nick)
{
  return request({ url: '/register', data: { userName, password, nick }, auth: false, silent: true }).then((data) => applyAuth(data, userName, password))
}

/**
 * 确保处于登录状态
 * 已有令牌直接复用；没有令牌时用本地记住的账号密码自动登录一遍，
 * 连凭据都没有才生成新游客，玩家刷新页面不用重新输密码
 * @returns {Promise<Object>} 登录用户信息
 */
export async function ensureSession()
{
  const user = await ensureLogin()

  if (user && user.token)
  {
    return user
  }

  const name = `guest${Math.floor(Math.random() * 900000 + 100000)}`

  try
  {
    return await register(name, '123456', `游客${name.slice(-4)}`)
  }
  catch (err)
  {
    return login(name, '123456')
  }
}

/**
 * 查询个人资料与总分
 * @returns {Promise<Object>} 含 id、昵称、头像、总分
 */
export function fetchProfile()
{
  return request({ url: '/profile', data: {} })
}

/**
 * 查询历史战绩
 * @returns {Promise<Array>} 战绩列表，最多 20 条
 */
export function fetchRecords()
{
  return request({ url: '/records', data: {} }).then((data) => (data && data.records) || [])
}

/**
 * 查询支持的玩法列表
 * @returns {Promise<Array>} 玩法配置，含 key、名称、底分、封顶番
 */
export function fetchPlays()
{
  return request({ url: '/plays', method: 'GET' }).then((data) => (data && data.plays) || [])
}

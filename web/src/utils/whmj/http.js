/**
 * 麻将服务请求封装
 * 统一处理 baseURL、令牌读写与登录失效跳转
 */

const BASE_URL = '/whmj-api'
const TOKEN_KEY = 'zbcx_mj_token'
const USER_KEY = 'zbcx_mj_user'

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

/** 清除登录态 */
export function clearAuth()
{
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

/**
 * 发送请求
 * @param {Object} options 请求配置
 * @param {String} options.url 相对路径
 * @param {String} [options.method] 请求方法，默认 POST
 * @param {Object} [options.data] 请求体
 * @param {Boolean} [options.silent] 是否静默失败，不弹提示
 * @returns {Promise<Object>} 接口 data 字段
 */
export function request(options)
{
  return new Promise((resolve, reject) =>
  {
    uni.request(
    {
      url: BASE_URL + options.url,
      method: options.method || 'POST',
      data: options.data || {},
      header:
      {
        'Content-Type': 'application/json',
        'Authorization': getToken() ? `Bearer ${getToken()}` : ''
      },
      success: (res) =>
      {
        const body = res.data || {}

        if (res.statusCode === 200 && (body.code === 200 || body.code === 0))
        {
          resolve(body.data)
          return
        }

        if (!options.silent)
        {
          uni.showToast({ title: body.msg || '请求失败', icon: 'none' })
        }

        reject(new Error(body.msg || `HTTP ${res.statusCode}`))
      },
      fail: (err) =>
      {
        if (!options.silent)
        {
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        }

        reject(err)
      }
    })
  })
}

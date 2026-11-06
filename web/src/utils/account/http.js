/**
 * 记账系统请求封装
 * 统一处理 token、错误提示与登录失效跳转
 */

const BASE_URL = '/account-api'
const TOKEN_KEY = 'zbcx_token'
const USER_KEY = 'zbcx_user'
const LEDGER_KEY = 'zbcx_ledger'

export function getToken()
{
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token)
{
  uni.setStorageSync(TOKEN_KEY, token)
}

export function getUser()
{
  return uni.getStorageSync(USER_KEY) || null
}

export function setUser(user)
{
  uni.setStorageSync(USER_KEY, user)
}

export function getLedgerId()
{
  return uni.getStorageSync(LEDGER_KEY) || ''
}

export function setLedgerId(ledgerId)
{
  if (ledgerId)
  {
    uni.setStorageSync(LEDGER_KEY, ledgerId)
    return
  }
  uni.removeStorageSync(LEDGER_KEY)
}

export function clearAuth()
{
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

export function request(options)
{
  return new Promise((resolve, reject) =>
  {
    const isForm = options.form === true
    const header =
    {
      'Content-Type': isForm ? 'application/x-www-form-urlencoded' : 'application/json'
    }
    const token = getToken()
    if (token)
    {
      header.Authorization = `Bearer ${token}`
    }
    const ledgerId = getLedgerId()
    if (ledgerId)
    {
      header['X-Ledger-Id'] = String(ledgerId)
    }

    uni.request(
    {
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout: 20000,
      success: (res) =>
      {
        const body = res.data
        if (res.statusCode === 200 && body && body.code === 200)
        {
          resolve(body)
          return
        }
        if (body && (body.code === 401 || body.code === 403))
        {
          clearAuth()
          uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
          setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 800)
          reject(body)
          return
        }
        const msg = (body && body.msg) || '请求失败'
        uni.showToast({ title: msg, icon: 'none' })
        reject(body || { msg })
      },
      fail: (err) =>
      {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject({ msg: '网络异常', err })
      }
    })
  })
}

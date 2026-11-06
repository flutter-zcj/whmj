/**
 * 记账系统接口定义
 */
import { request, getToken, getLedgerId } from './http.js'

/**
 * 登录
 * @param {string} username 账号
 * @param {string} password 密码
 */
export function login(username, password)
{
  return request(
  {
    url: '/login',
    method: 'POST',
    form: true,
    data: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
}

/**
 * 发送邮箱验证码
 * @param {string} email 接收验证码的邮箱
 * @param {string} [scene] 业务场景，register 注册
 */
export function sendEmailCode(email, scene)
{
  return request(
  {
    url: '/sendEmailCode',
    method: 'POST',
    data: { email, scene: scene || 'register' }
  })
}

/**
 * 邮箱注册
 * @param {Object} data 注册参数，含 email、emailCode、password、confirmPassword
 */
export function register(data)
{
  return request(
  {
    url: '/register',
    method: 'POST',
    data
  })
}

/**
 * 获取当前登录用户信息
 */
export function getProfile()
{
  return request({ url: '/getInfo' })
}

/* ------------------------------------------------------------------ 分类 */

/**
 * 分类列表
 * @param {string} [categoryType] 0支出 1收入
 */
export function getCategoryList(categoryType)
{
  return request(
  {
    url: '/account/category/list',
    data: categoryType ? { categoryType } : {}
  })
}

/**
 * 新增分类
 */
export function addCategory(data)
{
  return request({ url: '/account/category', method: 'POST', data })
}

/**
 * 修改分类
 */
export function updateCategory(data)
{
  return request({ url: '/account/category', method: 'PUT', data })
}

/**
 * 删除分类
 */
export function deleteCategory(categoryIds)
{
  return request({ url: `/account/category/${categoryIds}`, method: 'DELETE' })
}

/* ------------------------------------------------------------------ 账户 */

/**
 * 资产账户列表（含实时余额与总资产）
 */
export function getAccountList()
{
  return request({ url: '/account/account/list' })
}

/**
 * 新增账户
 */
export function addAccount(data)
{
  return request({ url: '/account/account', method: 'POST', data })
}

/**
 * 修改账户
 */
export function updateAccount(data)
{
  return request({ url: '/account/account', method: 'PUT', data })
}

/**
 * 删除账户
 */
export function deleteAccount(accountIds)
{
  return request({ url: `/account/account/${accountIds}`, method: 'DELETE' })
}

/* ------------------------------------------------------------------ 账单 */

/**
 * 账单分页列表
 * @param {object} params pageNum / pageSize / billType / categoryId / accountId / beginDate / endDate / keyword / tag
 */
export function getBillList(params)
{
  return request({ url: '/account/bill/list', data: params || {} })
}

/**
 * 新增账单
 */
export function addBill(data)
{
  return request({ url: '/account/bill', method: 'POST', data })
}

/**
 * 账单详情（编辑回显）
 */
export function getBillDetail(billId)
{
  return request({ url: `/account/bill/${billId}` })
}

/**
 * 修改账单
 */
export function updateBill(data)
{
  return request({ url: '/account/bill', method: 'PUT', data })
}

/**
 * 删除账单
 */
export function deleteBill(billIds)
{
  return request({ url: `/account/bill/${billIds}`, method: 'DELETE' })
}

/* ------------------------------------------------------------------ 统计 */

/**
 * 收支汇总（转账不计入）
 */
export function getSummary(beginDate, endDate)
{
  const data = {}
  if (beginDate) data.beginDate = beginDate
  if (endDate) data.endDate = endDate

  return request({ url: '/account/stat/summary', data })
}

/**
 * 分类占比统计
 */
export function getCategoryStat(billType, beginDate, endDate)
{
  const data = { billType }
  if (beginDate) data.beginDate = beginDate
  if (endDate) data.endDate = endDate

  return request({ url: '/account/stat/category', data })
}

/**
 * 排行榜（分类排行 + 单笔排行）
 */
export function getRank(billType, beginDate, endDate, limit)
{
  const data = { billType, limit: limit || 10 }
  if (beginDate) data.beginDate = beginDate
  if (endDate) data.endDate = endDate

  return request({ url: '/account/stat/rank', data })
}

/**
 * 月度趋势统计
 */
export function getTrend(months)
{
  return request({ url: '/account/stat/trend', data: { months: months || 6 } })
}

/* ------------------------------------------------------------------ 预算 */

/**
 * 查询预算
 * @param {string} budgetMonth YYYY-MM
 */
export function getBudget(budgetMonth)
{
  return request({ url: '/account/budget', data: { budgetMonth } })
}

/**
 * 保存预算，金额为 0 表示删除
 */
export function saveBudget(data)
{
  return request({ url: '/account/budget', method: 'POST', data })
}

/* ------------------------------------------------------------------ 图片识别 */

/**
 * 上传支付截图识别金额与商户
 * @param {string} filePath 本地图片路径
 */
export function ocrImage(filePath)
{
  return new Promise((resolve, reject) =>
  {
    const header = { Authorization: `Bearer ${getToken()}` }
    const ledgerId = getLedgerId()
    if (ledgerId)
    {
      header['X-Ledger-Id'] = String(ledgerId)
    }
    uni.uploadFile(
    {
      url: '/account-api/account/ocr',
      filePath,
      name: 'file',
      header,
      success: (res) =>
      {
        try
        {
          const body = JSON.parse(res.data)
          if (body.code === 200 && body.data)
          {
            resolve(body.data)
            return
          }
          uni.showToast({ title: body.msg || '识别失败', icon: 'none' })
          reject(body)
        }
        catch (e)
        {
          reject(e)
        }
      },
      fail: (err) =>
      {
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

/* ------------------------------------------------------------------ 账本 */

/**
 * 账本列表
 */
export function getLedgerList()
{
  return request({ url: '/account/ledger/list' })
}

/**
 * 创建共享账本
 */
export function addLedger(data)
{
  return request({ url: '/account/ledger', method: 'POST', data })
}

/**
 * 重命名账本
 */
export function renameLedger(data)
{
  return request({ url: '/account/ledger', method: 'PUT', data })
}

/**
 * 通过邀请码加入账本
 */
export function joinLedger(inviteCode)
{
  return request({ url: '/account/ledger/join', method: 'POST', data: { inviteCode } })
}

/**
 * 账本成员
 */
export function getLedgerMembers(ledgerId)
{
  return request({ url: `/account/ledger/${ledgerId}/members` })
}

/**
 * 退出账本
 */
export function leaveLedger(ledgerId)
{
  return request({ url: `/account/ledger/${ledgerId}/leave`, method: 'POST', data: {} })
}

/* ------------------------------------------------------------------ AI */

/**
 * 自然语言解析记账
 * @param {string} text 用户输入
 */
export function parseText(text)
{
  return request({ url: '/account/ai/parse', method: 'POST', data: { text } })
}

/* ------------------------------------------------------------------ 周期 */

/**
 * 周期规则列表（会顺带补记到期账单）
 */
export function getRecurringList()
{
  return request({ url: '/account/recurring/list' })
}

/**
 * 新增周期规则
 */
export function addRecurring(data)
{
  return request({ url: '/account/recurring', method: 'POST', data })
}

/**
 * 修改周期规则
 */
export function updateRecurring(data)
{
  return request({ url: '/account/recurring', method: 'PUT', data })
}

/**
 * 删除周期规则
 */
export function deleteRecurring(recurringIds)
{
  return request({ url: `/account/recurring/${recurringIds}`, method: 'DELETE' })
}

/**
 * 启用 / 暂停周期规则
 */
export function toggleRecurring(recurringId)
{
  return request({ url: `/account/recurring/${recurringId}/toggle`, method: 'POST', data: {} })
}

/* ------------------------------------------------------------------ 上传 */

/**
 * 上传记账图片
 * @param {string} filePath 本地临时文件路径
 * @returns {Promise<string>} 可直接访问的相对地址
 */
export function uploadImage(filePath)
{
  return new Promise((resolve, reject) =>
  {
    uni.uploadFile(
    {
      url: '/account-api/account/upload',
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${getToken()}` },
      success: (res) =>
      {
        try
        {
          const body = JSON.parse(res.data)
          if (body.code === 200 && body.data && body.data.url)
          {
            resolve(body.data.url)
            return
          }
          uni.showToast({ title: body.msg || '上传失败', icon: 'none' })
          reject(body)
        }
        catch (e)
        {
          reject(e)
        }
      },
      fail: (err) =>
      {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

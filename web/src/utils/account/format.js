/**
 * 记账系统格式化工具
 * 统一金额、日期、颜色的展示口径，避免各页面重复实现
 */
const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 金额千分位格式化
 * @param {Number|String} value 金额
 * @returns {String} 形如 12,345.60 的字符串
 */
export function formatMoney(value)
{
  const num = Number(value || 0)
  const fixed = Math.abs(num).toFixed(2)
  const [intPart, decPart] = fixed.split('.')

  return `${num < 0 ? '-' : ''}${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`
}

/**
 * 紧凑金额：整数部分大于一万时以万为单位
 * @param {Number|String} value 金额
 * @returns {String} 展示用金额
 */
export function formatCompact(value)
{
  const num = Number(value || 0)
  if (Math.abs(num) >= 10000)
  {
    return `${(num / 10000).toFixed(1)}万`
  }

  return formatMoney(num)
}

/**
 * 日期格式化为 YYYY-MM-DD
 * @param {Date} date 日期对象
 * @returns {String} 日期字符串
 */
export function formatDate(date)
{
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 日期显示为今天 / 昨天 / 月日
 * @param {String} date YYYY-MM-DD
 * @returns {String} 展示文案
 */
export function dateLabel(date)
{
  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  if (date === today)
  {
    return '今天'
  }
  if (date === yesterday)
  {
    return '昨天'
  }
  const parts = String(date || '').split('-')

  return parts.length === 3 ? `${Number(parts[1])}月${Number(parts[2])}日` : String(date || '')
}

/**
 * 取日期的星期文案
 * @param {String} date YYYY-MM-DD
 * @returns {String} 星期文案
 */
export function weekLabel(date)
{
  const target = new Date(`${date}T00:00:00`)
  if (Number.isNaN(target.getTime()))
  {
    return ''
  }

  return WEEK_NAMES[target.getDay()] || ''
}

/**
 * 取月份区间
 * @param {Number} year 年
 * @param {Number} month 月（1-12）
 * @returns {Object} 含 begin、end、key 的对象
 */
export function monthRange(year, month)
{
  const monthKey = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()

  return {
    begin: `${year}-${monthKey}-01`,
    end: `${year}-${monthKey}-${String(lastDay).padStart(2, '0')}`,
    key: `${year}-${monthKey}`
  }
}

/**
 * 十六进制颜色转 rgba
 * @param {String} hex 十六进制颜色
 * @param {Number} alpha 透明度
 * @returns {String} rgba 字符串
 */
export function hexToRgba(hex, alpha)
{
  const value = String(hex || '#1AA86C').replace('#', '')
  const full = value.length === 3 ? value.split('').map((item) => item + item).join('') : value
  const red = parseInt(full.slice(0, 2), 16) || 0
  const green = parseInt(full.slice(2, 4), 16) || 0
  const blue = parseInt(full.slice(4, 6), 16) || 0

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

/**
 * 账户类型中文名
 * @param {String} type 账户类型编码
 * @returns {String} 类型名称
 */
export function accountTypeLabel(type)
{
  const map = {
    0: '现金',
    1: '储蓄卡',
    2: '信用卡',
    3: '花呗',
    4: '理财',
    5: '借入',
    6: '借出',
    7: '微信',
    8: '支付宝',
    9: '其他'
  }

  return map[String(type)] || '其他'
}

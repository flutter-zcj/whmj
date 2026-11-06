/**
 * 麻将前端本地存储工具
 * 统一封装 uni.getStorageSync，带默认值，避免各页面重复 try/catch
 */

/**
 * 读取本地存储
 * @param {String} key 键名
 * @param {*} fallback 缺省值
 * @returns {*} 存储值或默认值
 */
export function getStore(key, fallback)
{
  try
  {
    const value = uni.getStorageSync(key)

    if (value === '' || value === null || typeof value === 'undefined')
    {
      return fallback
    }

    return value
  }
  catch (err)
  {
    console.warn('[whmj] 读取本地存储失败', key, err)

    return fallback
  }
}

/**
 * 写入本地存储
 * @param {String} key 键名
 * @param {*} value 值
 */
export function setStore(key, value)
{
  try
  {
    uni.setStorageSync(key, value)
  }
  catch (err)
  {
    console.warn('[whmj] 写入本地存储失败', key, err)
  }
}

export default { getStore, setStore }

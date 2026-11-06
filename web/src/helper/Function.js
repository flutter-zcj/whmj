/**
 * 修改记录:
 * 24-05-04     郑朝军        创建-用于上层简单调用
 */

/**
 * 设置设置登录信息和初始化
 *
 * @method
 * @abstract
 * @param   {Object}    param         参数如：{'name': '张三','age': 18}
 */
export function init(param)
{
  uni.cxapp.UserMethod.setUser(param.user)
  uni.cxapp.Http.setToken(param.Authorization)
  cx.http.setAuth(param.Authorization)
  uni.cxapp.InitSvrMethod.setParseInitSvr(param.init)
}

export default {
  init,
}

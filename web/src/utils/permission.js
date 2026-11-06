/**
 * 页面跳转验证拦截器
 */

// 登录页面
const loginPage = '/pages/login/login'

// 页面黑名单
const blackList = ['/pages/kqtj/kqtj']

// 检查地址黑名单
function checkBlack(url)
{
  const path = url.split('?')[0]
  return blackList.includes(path)
}

const list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
list.forEach((item) =>
{
  uni.addInterceptor(item,
    {
      invoke(to)
      {
        if (checkBlack(to.url))
        {
          let user = uni.cxapp.UserMethod.getUser()
          if (user && user.userno)
          {
            return true
          }
          else
          {
            uni.navigateTo({ url: loginPage })
            return false
          }
        }

        return true
      },
      fail(err)
      {
        console.log(err)
      },
    });
});

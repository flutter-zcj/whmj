<style lang="scss" scoped>
$primary: #1aa86c;
$primary-light: #35c98c;
$primary-dark: #159760;
$text-main: #1f2430;
$text-sub: #8e99a1;
$text-faint: #b4bac4;
$line: #edeff1;
.page { position: relative; display: flex; flex-direction: column; width: 100%; min-height: 100vh; overflow-x: hidden; padding-top: env(safe-area-inset-top); box-sizing: border-box; background: #ffffff; }
.brand { position: relative; display: flex; flex-direction: column; width: 100%; margin-top: 148rpx; box-sizing: border-box; padding: 0 60rpx; }
.brand__logo { position: relative; display: flex; align-items: center; justify-content: center; width: 96rpx; height: 96rpx; background: linear-gradient(140deg, $primary 0%, $primary-light 100%); border-radius: 26rpx; box-shadow: 0 10rpx 26rpx rgba(26, 168, 108, 0.24); }
.brand__title { position: relative; margin-top: 30rpx; font-size: 46rpx; font-weight: 600; color: $text-main; letter-spacing: 2rpx; }
.brand__subtitle { position: relative; margin-top: 14rpx; font-size: 26rpx; font-weight: 400; color: $text-sub; }
.form { position: relative; display: flex; flex-direction: column; width: 100%; margin-top: 72rpx; box-sizing: border-box; padding: 0 60rpx; }
.field { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 112rpx; border-bottom: 1rpx solid $line; }
.field--focus { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 112rpx; border-bottom: 1rpx solid $primary; }
.field__input { position: relative; flex: 1; width: 100%; height: 60rpx; font-size: 30rpx; font-weight: 400; color: $text-main; }
.field__placeholder { position: absolute; left: 0; width: 100%; font-size: 30rpx; font-weight: 400; color: $text-faint; line-height: 60rpx; }
.field__action { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 20rpx; width: 56rpx; height: 56rpx; }
.option { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; margin-top: 28rpx; }
.option__remember { position: relative; display: flex; flex-direction: row; align-items: center; }
.option__box { position: relative; display: flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; border: 2rpx solid #d3d8de; border-radius: 8rpx; }
.option__box--active { position: relative; display: flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; border: 2rpx solid $primary; background: $primary; border-radius: 8rpx; }
.option__text { position: relative; margin-left: 12rpx; font-size: 26rpx; font-weight: 400; color: $text-sub; }
.option__forgot { position: relative; padding: 8rpx 0; font-size: 26rpx; font-weight: 400; color: $primary; }
.submit { position: relative; width: 100%; height: 96rpx; margin-top: 44rpx; font-size: 32rpx; font-weight: 600; color: #ffffff; line-height: 96rpx; text-align: center; background: linear-gradient(140deg, $primary 0%, $primary-light 100%); border-radius: 24rpx; box-shadow: 0 12rpx 26rpx rgba(26, 168, 108, 0.24); }
.submit--active { position: relative; width: 100%; height: 96rpx; margin-top: 44rpx; font-size: 32rpx; font-weight: 600; color: #ffffff; line-height: 96rpx; text-align: center; background: $primary-dark; border-radius: 24rpx; }
.other { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin-top: 84rpx; box-sizing: border-box; padding: 0 60rpx; }
.other__line { position: relative; flex: 1; height: 1rpx; background: $line; }
.other__text { position: relative; padding: 0 24rpx; font-size: 26rpx; font-weight: 400; color: $text-sub; }
.oauth { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: calc(100% - 120rpx); height: 96rpx; margin-left: 60rpx; margin-right: 60rpx; margin-top: 40rpx; box-sizing: border-box; background: #ffffff; border: 1rpx solid #e1e5ea; border-radius: 24rpx; }
.oauth--active { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: calc(100% - 120rpx); height: 96rpx; margin-left: 60rpx; margin-right: 60rpx; margin-top: 40rpx; box-sizing: border-box; background: #f7f8fa; border: 1rpx solid #e1e5ea; border-radius: 24rpx; }
.oauth__text { position: relative; margin-left: 14rpx; font-size: 30rpx; font-weight: 500; color: $text-main; }
.footer { position: relative; display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: auto; box-sizing: border-box; padding: 48rpx 0 56rpx; }
.footer__text { position: relative; font-size: 22rpx; font-weight: 400; color: $text-faint; }
</style>
<template>
  <view class="page">
    <!-- 🚀 品牌标识 -->
    <view class="brand">
      <view class="brand__logo">
        <acc-icon name="wallet" :size="50" color="#FFFFFF" />
      </view>
      <text class="brand__title">记账本</text>
      <text class="brand__subtitle">使用邮箱 / 账号登录</text>
    </view>

    <!-- 🚀 登录表单 -->
    <view class="form">
      <view :class="focusKey === 'account' ? 'field--focus' : 'field'">
        <input
          v-model="account"
          class="field__input"
          placeholder="手机号 / 邮箱 / 账号"
          placeholder-class="field__placeholder"
          @focus="handleFocus('account')"
          @blur="handleBlur" />
      </view>
      <view :class="focusKey === 'password' ? 'field--focus' : 'field'">
        <input
          v-model="password"
          class="field__input"
          :password="!passwordVisible"
          placeholder="请输入密码"
          placeholder-class="field__placeholder"
          @focus="handleFocus('password')"
          @blur="handleBlur" />
        <view class="field__action" @click="togglePasswordVisible">
          <acc-icon :name="passwordVisible ? 'eye' : 'eyeOff'" :size="40" color="#B4BAC4" />
        </view>
      </view>
      <view class="option">
        <view class="option__remember" @click="toggleRemember">
          <view :class="rememberClass">
            <acc-icon v-if="rememberMe" name="check" :size="20" color="#FFFFFF" />
          </view>
          <text class="option__text">记住账号</text>
        </view>
        <text class="option__forgot" @click="handleForgotPassword">忘记密码？</text>
      </view>
      <view class="submit" hover-class="submit--active" @click="handleLogin">{{ loginText }}</view>
    </view>

    <!-- 🚀 其他登录方式 -->
    <view class="other">
      <view class="other__line" />
      <text class="other__text">其他方式登录</text>
      <view class="other__line" />
    </view>
    <view class="oauth" hover-class="oauth--active" @click="goRegister">
      <acc-icon name="mail" :size="40" color="#1AA86C" />
      <text class="oauth__text">邮箱注册 / 登录</text>
    </view>

    <!-- 🚀 页脚 -->
    <view class="footer">
      <text class="footer__text">默认账号 admin / admin123</text>
    </view>
  </view>
</template>
<script>
/**
 * 组件名称：login
 * 功能说明：记账系统登录页，调用后端登录接口完成认证并跳转记账首页
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  account         - 登录账号
 * @data {String}  password        - 登录密码
 * @data {Boolean} passwordVisible - 密码是否明文显示
 * @data {String}  focusKey        - 当前聚焦的输入框标识
 * @data {Boolean} rememberMe      - 是否记住账号
 * @data {Boolean} loading         - 是否正在登录
 *
 * 事件说明：
 * @event handleLogin           - 校验账号密码并调用登录接口
 * @event goRegister            - 跳转邮箱注册页
 * @event handleForgotPassword  - 忘记密码提示
 * @event toggleRemember        - 切换记住账号状态
 * @event togglePasswordVisible - 切换密码明文显示
 * @event handleFocus           - 记录聚焦的输入框并高亮下划线
 * @event handleBlur            - 清除聚焦标识
 * @event loginText             - 计算登录按钮文案
 * @event rememberClass         - 计算记住账号勾选框样式
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      初始创建，按鲨鱼记账风格重构视觉，接入真实登录接口
 * 2026/10/30     郑朝军      登录账号支持邮箱，新增邮箱注册入口；占位符修正为绝对定位
 * 2026/10/30     郑朝军      参照鲨鱼记账登录页版式重做：纯白底、左对齐、圆角按钮、密码明文切换
 */
import { login } from '@/utils/account/api.js'
import { setToken, setUser, getToken } from '@/utils/account/http.js'

const ACCOUNT_KEY = 'zbcx_login_account'

export default
{
  data()
  {
    return {
      account: '',
      password: '',
      passwordVisible: false,
      focusKey: '',
      rememberMe: false,
      loading: false
    }
  },

  computed:
  {
    /**
     * 登录按钮文案
     * @returns {String} 按钮文案
     */
    loginText()
    {
      return this.loading ? '登录中...' : '登录'
    },

    /**
     * 记住账号勾选框样式类名
     * @returns {String} 类名
     */
    rememberClass()
    {
      return this.rememberMe ? 'option__box--active' : 'option__box'
    }
  },

  /**
   * 页面加载时判断登录态并回填记住的账号
   * @returns {void}
   */
  onLoad()
  {
    if (getToken())
    {
      uni.reLaunch({ url: '/pages/account/index' })

      return
    }
    const saved = uni.getStorageSync(ACCOUNT_KEY)
    if (saved)
    {
      this.account = saved
      this.rememberMe = true
    }
  },

  methods:
  {
    /**
     * 校验账号密码并调用登录接口
     * @returns {Promise<void>}
     */
    async handleLogin()
    {
      if (!this.account || !this.password)
      {
        uni.showToast({ title: '请输入账号和密码', icon: 'none' })

        return
      }
      if (this.loading)
      {
        return
      }
      this.loading = true
      try
      {
        const result = await login(this.account, this.password)
        if (!result || !result.token)
        {
          uni.showToast({ title: '登录失败，请稍后重试', icon: 'none' })

          return
        }
        setToken(result.token)
        setUser({ userName: this.account, nickName: this.account })
        if (this.rememberMe)
        {
          uni.setStorageSync(ACCOUNT_KEY, this.account)
        }
        else
        {
          uni.removeStorageSync(ACCOUNT_KEY)
        }
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() =>
        {
          uni.reLaunch({ url: '/pages/account/index' })
        }, 400)
      }
      catch (error)
      {
        uni.showToast({ title: '账号或密码错误', icon: 'none' })
      }
      finally
      {
        this.loading = false
      }
    },

    /**
     * 跳转邮箱注册页
     * @returns {void}
     */
    goRegister()
    {
      uni.navigateTo({ url: '/pages/register/register' })
    },

    /**
     * 忘记密码提示
     * @returns {void}
     */
    handleForgotPassword()
    {
      uni.showToast({ title: '请联系管理员重置密码', icon: 'none' })
    },

    /**
     * 切换记住账号状态
     * @returns {void}
     */
    toggleRemember()
    {
      this.rememberMe = !this.rememberMe
    },

    /**
     * 切换密码明文显示
     * @returns {void}
     */
    togglePasswordVisible()
    {
      this.passwordVisible = !this.passwordVisible
    },

    /**
     * 记录聚焦的输入框
     * @param {String} key 输入框标识
     * @returns {void}
     */
    handleFocus(key)
    {
      this.focusKey = key
    },

    /**
     * 清除聚焦标识
     * @returns {void}
     */
    handleBlur()
    {
      this.focusKey = ''
    }
  }
}
</script>

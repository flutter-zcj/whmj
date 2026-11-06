<style lang="scss" scoped>
$primary: #1aa86c;
$text-main: #1f2430;
$text-sub: #8a8f9c;
$line: #eef0f3;
.page { position: relative; display: flex; flex-direction: column; width: 100%; overflow-x: hidden; min-height: 100vh; background: #ffffff; }
.hero { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 460rpx; padding-top: env(safe-area-inset-top); overflow: hidden; box-sizing: border-box; background: linear-gradient(160deg, #149b63 0%, #1aa86c 60%, #12925b 100%); }
.hero__photo { position: absolute; left: 0; right: 0; top: 0; bottom: 0; width: 100%; height: 100%; opacity: 0.4; }
.hero__mask { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, rgba(14, 108, 70, 0.2) 0%, rgba(18, 146, 91, 0.66) 100%); }
.hero__back { position: absolute; left: 32rpx; top: calc(env(safe-area-inset-top) + 24rpx); display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; background: rgba(255, 255, 255, 0.18); border: 2rpx solid rgba(255, 255, 255, 0.3); border-radius: 32rpx; }
.hero__back-text { position: relative; font-size: 40rpx; font-weight: 400; color: #ffffff; line-height: 40rpx; }
.hero__logo { position: relative; display: flex; align-items: center; justify-content: center; width: 120rpx; height: 120rpx; background: rgba(255, 255, 255, 0.18); border: 2rpx solid rgba(255, 255, 255, 0.36); border-radius: 36rpx; }
.hero__logo-text { position: relative; font-size: 56rpx; font-weight: 700; color: #ffffff; }
.hero__title { position: relative; margin-top: 24rpx; text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.24); font-size: 42rpx; font-weight: 600; color: #ffffff; letter-spacing: 2rpx; }
.hero__subtitle { position: relative; margin-top: 12rpx; font-size: 24rpx; font-weight: 400; color: #ffffff; opacity: 0.82; }
.form { position: relative; display: flex; flex-direction: column; width: 100%; margin-top: -64rpx; box-sizing: border-box; padding: 0 48rpx; }
.form__card { position: relative; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 12rpx 32rpx 40rpx; background: #ffffff; border-radius: 32rpx; box-shadow: 0 12rpx 40rpx rgba(31, 36, 48, 0.1); }
.form__field { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 108rpx; border-bottom: 1rpx solid $line; }
.form__field--last { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 108rpx; }
.form__label { position: relative; flex-shrink: 0; white-space: nowrap; width: 128rpx; font-size: 27rpx; font-weight: 500; color: $text-main; }
.form__input { position: relative; flex: 1; height: 60rpx; font-size: 30rpx; font-weight: 400; color: $text-main; }
.form__placeholder { position: absolute; left: 0; width: 100%; font-size: 30rpx; font-weight: 400; color: #b4bac4; line-height: 60rpx; }
.form__code { position: relative; display: flex; flex-shrink: 0; margin-left: 12rpx; align-items: center; justify-content: center; height: 56rpx; padding: 0 22rpx; font-size: 24rpx; font-weight: 500; color: $primary; background: #eefaf4; border: 1rpx solid #c9eddd; border-radius: 28rpx; }
.form__code--disabled { position: relative; display: flex; flex-shrink: 0; margin-left: 12rpx; align-items: center; justify-content: center; height: 56rpx; padding: 0 22rpx; font-size: 24rpx; font-weight: 500; color: #b6bac4; background: #f5f7fa; border: 1rpx solid #e8ebf0; border-radius: 28rpx; }
.form__button { position: relative; width: 100%; height: 96rpx; margin-top: 44rpx; font-size: 32rpx; font-weight: 600; color: #ffffff; line-height: 96rpx; text-align: center; background: linear-gradient(140deg, #1aa86c 0%, #35c98c 100%); border-radius: 999rpx; box-shadow: 0 10rpx 26rpx rgba(26, 168, 108, 0.28); }
.form__button--disabled { position: relative; width: 100%; height: 96rpx; margin-top: 44rpx; font-size: 32rpx; font-weight: 600; color: #ffffff; line-height: 96rpx; text-align: center; background: #cfd6dd; border-radius: 999rpx; }
.form__agreement { position: relative; display: flex; flex-direction: row; align-items: flex-start; width: 100%; margin-top: 26rpx; }
.form__agreement-box { position: relative; display: flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; margin-top: 4rpx; border: 2rpx solid #ccd1d9; border-radius: 8rpx; }
.form__agreement-box--active { position: relative; display: flex; align-items: center; justify-content: center; width: 30rpx; height: 30rpx; margin-top: 4rpx; border: 2rpx solid $primary; background: $primary; border-radius: 8rpx; }
.form__agreement-icon { position: relative; width: 18rpx; height: 18rpx; }
.form__agreement-text { position: relative; flex: 1; margin-left: 12rpx; font-size: 22rpx; font-weight: 400; color: $text-sub; line-height: 36rpx; }
.form__agreement-link { position: relative; font-size: 22rpx; font-weight: 400; color: $primary; }
.login { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin-top: 36rpx; }
.login__text { position: relative; font-size: 26rpx; font-weight: 400; color: $text-sub; }
.login__link { position: relative; margin-left: 8rpx; font-size: 26rpx; font-weight: 500; color: $primary; }
.footer { position: relative; display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: auto; box-sizing: border-box; padding: 32rpx 0 52rpx; }
.footer__text { position: relative; font-size: 22rpx; font-weight: 400; color: #c3c8d0; }
</style>
<template>
  <view class="page">
    <!-- 🚀 品牌头部 -->
    <view class="hero">
      <image class="hero__photo" :src="heroImage" mode="aspectFill" />
      <view class="hero__mask" />
      <view class="hero__back" @click="goBack">
        <text class="hero__back-text">‹</text>
      </view>
      <view class="hero__logo">
        <text class="hero__logo-text">记</text>
      </view>
      <text class="hero__title">创建账号</text>
      <text class="hero__subtitle">邮箱验证，安全开启记账本</text>
    </view>

    <!-- 🚀 注册表单 -->
    <view class="form">
      <view class="form__card">
        <view class="form__field">
          <text class="form__label">邮箱</text>
          <input
            v-model="email"
            class="form__input"
            type="text"
            placeholder="请输入常用邮箱"
            placeholder-class="form__placeholder" />
        </view>
        <view class="form__field">
          <text class="form__label">验证码</text>
          <input
            v-model="emailCode"
            class="form__input"
            type="number"
            maxlength="6"
            placeholder="6 位邮箱验证码"
            placeholder-class="form__placeholder" />
          <view :class="codeClass" @click="handleSendCode">{{ codeText }}</view>
        </view>
        <view class="form__field">
          <text class="form__label">密码</text>
          <input
            v-model="password"
            class="form__input"
            password
            placeholder="6-20 位登录密码"
            placeholder-class="form__placeholder" />
        </view>
        <view class="form__field--last">
          <text class="form__label">确认密码</text>
          <input
            v-model="confirmPassword"
            class="form__input"
            password
            placeholder="请再次输入密码"
            placeholder-class="form__placeholder" />
        </view>
        <view :class="buttonClass" @click="handleRegister">{{ submitText }}</view>
        <view class="form__agreement" @click="toggleAgreement">
          <view :class="agreementClass">
            <image v-if="agreed" class="form__agreement-icon" :src="iconCheck" />
          </view>
          <text class="form__agreement-text">
            我已阅读并同意
            <text class="form__agreement-link">《用户协议》</text>
            与
            <text class="form__agreement-link">《隐私政策》</text>
          </text>
        </view>
      </view>
      <view class="login">
        <text class="login__text">已有账号？</text>
        <text class="login__link" @click="goLogin">立即登录</text>
      </view>
    </view>

    <!-- 🚀 页脚 -->
    <view class="footer">
      <text class="footer__text">RuoYi-FastAPI × uni-app 记账系统</text>
    </view>
  </view>
</template>
<script>
/**
 * 组件名称：register
 * 功能说明：记账系统邮箱注册页，校验邮箱验证码后创建账号并自动登录
 * 研发时间：2026/10/30
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  email            - 注册邮箱
 * @data {String}  emailCode        - 邮箱验证码
 * @data {String}  password         - 登录密码
 * @data {String}  confirmPassword  - 确认密码
 * @data {Boolean} agreed           - 是否同意用户协议
 * @data {Boolean} loading          - 是否正在注册
 * @data {Boolean} codeLoading      - 是否正在发送验证码
 * @data {Number}  countdown        - 验证码重发倒计时秒数
 * @data {Number}  timer            - 倒计时定时器句柄
 * @data {String}  heroImage        - 头部背景图
 *
 * 事件说明：
 * @event handleSendCode    - 校验邮箱并请求发送验证码
 * @event handleRegister    - 校验表单、提交注册并自动登录
 * @event goLogin           - 返回登录页
 * @event goBack            - 返回上一页
 * @event toggleAgreement   - 切换用户协议勾选状态
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/30     郑朝军      初始创建，实现邮箱验证码注册与注册后自动登录
 */
import { login, register, sendEmailCode } from '@/utils/account/api.js'
import { setToken, setUser } from '@/utils/account/http.js'
import ICONS from '@/utils/account/icons.js'
import { heroPhoto } from '@/utils/account/photos.js'

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/
const COUNTDOWN_SECONDS = 60

export default
{
  data()
  {
    return {
      email: '',
      emailCode: '',
      password: '',
      confirmPassword: '',
      agreed: false,
      loading: false,
      codeLoading: false,
      countdown: 0,
      timer: null,
      heroImage: heroPhoto()
    }
  },

  computed:
  {
    /**
     * 获取验证码按钮文案
     * @returns {String} 按钮文案
     */
    codeText()
    {
      if (this.countdown > 0)
      {
        return `${this.countdown}s 后重发`
      }

      return this.codeLoading ? '发送中...' : '获取验证码'
    },

    /**
     * 获取验证码按钮样式类名
     * @returns {String} 类名
     */
    codeClass()
    {
      return this.countdown > 0 || this.codeLoading ? 'form__code--disabled' : 'form__code'
    },

    /**
     * 注册按钮文案
     * @returns {String} 按钮文案
     */
    submitText()
    {
      return this.loading ? '注册中...' : '注册并登录'
    },

    /**
     * 注册按钮样式类名
     * @returns {String} 类名
     */
    buttonClass()
    {
      return this.loading ? 'form__button--disabled' : 'form__button'
    },

    /**
     * 协议勾选框样式类名
     * @returns {String} 类名
     */
    agreementClass()
    {
      return this.agreed ? 'form__agreement-box--active' : 'form__agreement-box'
    },

    /**
     * 勾选图标路径
     * @returns {String} 图标路径
     */
    iconCheck()
    {
      return ICONS['check-white']
    }
  },

  /**
   * 页面卸载时清理倒计时定时器
   * @returns {void}
   */
  onUnload()
  {
    this.clearTimer()
  },

  methods:
  {
    /**
     * 校验邮箱并请求发送验证码
     * @returns {Promise<void>}
     */
    async handleSendCode()
    {
      if (this.countdown > 0 || this.codeLoading)
      {
        return
      }
      if (!EMAIL_PATTERN.test(this.email.trim()))
      {
        uni.showToast({ title: '请输入正确的邮箱', icon: 'none' })

        return
      }
      this.codeLoading = true
      try
      {
        await sendEmailCode(this.email.trim(), 'register')
        uni.showToast({ title: '验证码已发送，请查收邮箱', icon: 'none' })
        this.startCountdown()
      }
      catch (error)
      {
        this.codeLoading = false

        return
      }
      this.codeLoading = false
    },

    /**
     * 校验表单、提交注册并自动登录
     * @returns {Promise<void>}
     */
    async handleRegister()
    {
      if (this.loading)
      {
        return
      }
      const message = this.validateForm()
      if (message)
      {
        uni.showToast({ title: message, icon: 'none' })

        return
      }
      this.loading = true
      try
      {
        await register(
        {
          email: this.email.trim(),
          emailCode: this.emailCode.trim(),
          password: this.password,
          confirmPassword: this.confirmPassword
        })
        await this.autoLogin()
      }
      catch (error)
      {
        this.loading = false

        return
      }
      this.loading = false
    },

    /**
     * 注册成功后使用邮箱自动登录，登录失败时回到登录页
     * @returns {Promise<void>}
     */
    async autoLogin()
    {
      try
      {
        const result = await login(this.email.trim(), this.password)
        if (result && result.token)
        {
          setToken(result.token)
          setUser({ userName: this.email.trim(), nickName: this.email.trim() })
          uni.showToast({ title: '注册成功', icon: 'success' })
          setTimeout(() =>
          {
            uni.reLaunch({ url: '/pages/account/index' })
          }, 500)

          return
        }
      }
      catch (error)
      {
        uni.showToast({ title: '注册成功，请登录', icon: 'none' })
      }
      setTimeout(() =>
      {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 600)
    },

    /**
     * 校验注册表单
     * @returns {String} 校验失败的提示文案，校验通过返回空字符串
     */
    validateForm()
    {
      if (!EMAIL_PATTERN.test(this.email.trim()))
      {
        return '请输入正确的邮箱'
      }
      if (!this.emailCode.trim())
      {
        return '请输入邮箱验证码'
      }
      if (this.password.length < 6 || this.password.length > 20)
      {
        return '密码长度需为 6-20 位'
      }
      if (this.password !== this.confirmPassword)
      {
        return '两次输入的密码不一致'
      }
      if (!this.agreed)
      {
        return '请先阅读并同意用户协议'
      }

      return ''
    },

    /**
     * 启动验证码重发倒计时
     * @returns {void}
     */
    startCountdown()
    {
      this.clearTimer()
      this.countdown = COUNTDOWN_SECONDS
      this.timer = setInterval(() =>
      {
        this.countdown -= 1
        if (this.countdown <= 0)
        {
          this.clearTimer()
        }
      }, 1000)
    },

    /**
     * 清理倒计时定时器
     * @returns {void}
     */
    clearTimer()
    {
      if (this.timer)
      {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.countdown < 0)
      {
        this.countdown = 0
      }
    },

    /**
     * 切换用户协议勾选状态
     * @returns {void}
     */
    toggleAgreement()
    {
      this.agreed = !this.agreed
    },

    /**
     * 返回登录页
     * @returns {void}
     */
    goLogin()
    {
      uni.reLaunch({ url: '/pages/login/login' })
    },

    /**
     * 返回上一页，无上一页时回到登录页
     * @returns {void}
     */
    goBack()
    {
      const pages = getCurrentPages()
      if (pages.length > 1)
      {
        uni.navigateBack()

        return
      }
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
}
</script>

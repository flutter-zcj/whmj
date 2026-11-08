<style lang="scss" scoped>
$gold: #FFD98A;
$gold-line: rgba(255, 216, 138, 0.45);
$cream: #FFF3D6;
$glass: rgba(10, 46, 40, 0.72);
$danger: #FF7A6B;
.page { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: space-around; width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; background: #2C6EA8; }
.page__bg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.page__veil { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(8, 34, 52, 0.42) 0%, rgba(8, 34, 52, 0.08) 46%, rgba(8, 34, 52, 0.5) 100%); }
.brand { position: relative; display: flex; flex-direction: column; align-items: center; z-index: 2; }
.brand__art { position: relative; width: 420rpx; height: 172rpx; filter: drop-shadow(0 6rpx 20rpx rgba(255, 160, 60, 0.45)); animation: float 3.2s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10rpx); } }
.brand__row { position: relative; display: flex; flex-direction: row; align-items: center; margin-top: 26rpx; }
.brand__mark { position: relative; display: flex; align-items: center; justify-content: center; width: 110rpx; height: 110rpx; background: linear-gradient(150deg, #48C083 0%, #12965E 100%); border: 4rpx solid rgba(255, 255, 255, 0.9); border-radius: 30rpx; box-shadow: 0 14rpx 32rpx rgba(0, 0, 0, 0.5), inset 0 4rpx 0 rgba(255, 255, 255, 0.35); }
.brand__tile { position: relative; font-size: 56rpx; font-weight: 700; color: #FFF8E2; text-shadow: 0 4rpx 10rpx rgba(0, 60, 36, 0.45); }
.brand__title { position: relative; margin-left: 20rpx; font-family: 'MJ Kai', 'PingFang SC', serif; font-size: 62rpx; font-weight: 700; letter-spacing: 10rpx; color: $gold; text-shadow: 0 0 24rpx rgba(240, 184, 86, 0.55), 0 4rpx 0 rgba(90, 40, 0, 0.65); }
.brand__sub { position: relative; margin-top: 20rpx; padding: 8rpx 30rpx; font-size: 24rpx; font-weight: 600; color: #6B3A05; letter-spacing: 8rpx; background: linear-gradient(180deg, #FFF6DC 0%, #FFDF9C 100%); border: 2rpx solid rgba(255, 255, 255, 0.85); border-radius: 24rpx; box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.45); }
.form { position: relative; display: flex; flex-direction: column; width: 520rpx; box-sizing: border-box; padding: 40rpx 36rpx 30rpx; background: $glass; border: 1rpx solid $gold-line; border-radius: 28rpx; box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.55), inset 0 1rpx 0 rgba(255, 233, 174, 0.18); z-index: 2; }
.field { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 96rpx; margin-bottom: 20rpx; box-sizing: border-box; padding: 0 26rpx; background: rgba(0, 0, 0, 0.3); border: 1rpx solid rgba(255, 216, 138, 0.3); border-radius: 20rpx; }
.field--focus { position: relative; display: flex; flex-direction: row; align-items: center; width: 100%; height: 96rpx; margin-bottom: 20rpx; box-sizing: border-box; padding: 0 26rpx; background: rgba(0, 0, 0, 0.42); border: 2rpx solid #F0B856; border-radius: 20rpx; box-shadow: 0 0 20rpx rgba(240, 184, 86, 0.3); }
.field__label { position: relative; flex-shrink: 0; width: 96rpx; font-size: 27rpx; font-weight: 600; color: $gold; }
.field__input { position: relative; flex: 1; height: 56rpx; font-size: 29rpx; color: $cream; }
.field__placeholder { position: relative; font-size: 26rpx; color: rgba(255, 243, 214, 0.35); }
.field__action { position: relative; flex-shrink: 0; margin-left: 16rpx; font-size: 23rpx; color: $gold; }
.submit { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 96rpx; margin-top: 14rpx; font-size: 33rpx; font-weight: 700; color: #6B3A05; letter-spacing: 8rpx; background: linear-gradient(180deg, #FFF3CE 0%, #FFCE5C 46%, #F0A020 100%); border: 3rpx solid rgba(255, 255, 255, 0.9); border-radius: 48rpx; box-shadow: 0 8rpx 0 #B07E20, 0 16rpx 30rpx rgba(0, 0, 0, 0.5); }
.submit--active { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 96rpx; margin-top: 14rpx; font-size: 33rpx; font-weight: 700; color: #6B3A05; letter-spacing: 8rpx; background: #F5B940; border: 3rpx solid rgba(255, 255, 255, 0.9); border-radius: 48rpx; box-shadow: 0 4rpx 0 #B07E20; }
.submit--disabled { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 96rpx; margin-top: 14rpx; font-size: 33rpx; font-weight: 700; color: rgba(107, 58, 5, 0.5); letter-spacing: 8rpx; background: rgba(255, 223, 156, 0.6); border: 3rpx solid rgba(255, 255, 255, 0.6); border-radius: 48rpx; }
.switch { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; margin-top: 28rpx; }
.switch__text { position: relative; font-size: 25rpx; color: rgba(255, 243, 214, 0.6); }
.switch__link { position: relative; margin-left: 8rpx; font-size: 25rpx; font-weight: 700; color: $gold; }
.guest { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 24rpx; box-sizing: border-box; z-index: 2; }
.guest__text { position: relative; padding: 18rpx 44rpx; font-size: 25rpx; font-weight: 600; color: $gold; letter-spacing: 2rpx; background: rgba(255, 255, 255, 0.08); border: 1rpx solid $gold-line; border-radius: 42rpx; }
.tip { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 16rpx; box-sizing: border-box; padding: 0 20rpx; }
.tip__text { position: relative; font-size: 23rpx; color: $danger; text-align: center; }
.footer { pointer-events: none; position: absolute; left: 0; bottom: 18rpx; display: flex; flex-direction: column; align-items: center; width: 100%; box-sizing: border-box; z-index: 2; }
.footer__text { position: relative; font-size: 21rpx; color: rgba(255, 243, 214, 0.4); letter-spacing: 2rpx; }
</style>
<template>
  <view class="page">
    <image class="page__bg" :src="bgImage" mode="aspectFill" />
    <view class="page__veil"></view>

    <view class="brand">
      <image class="brand__art" :src="logoImage" mode="aspectFit" />
      <text class="brand__sub">红中赖子杠 · 二五八将</text>
    </view>

    <view class="form">
      <view :class="focusKey === 'userName' ? 'field--focus' : 'field'">
        <text class="field__label">账号</text>
        <input
          v-model="userName"
          class="field__input"
          placeholder="请输入账号"
          placeholder-class="field__placeholder"
          @focus="focusKey = 'userName'"
          @blur="focusKey = ''" />
      </view>
      <view :class="focusKey === 'nick' ? 'field--focus' : 'field'" v-if="mode === 'register'">
        <text class="field__label">昵称</text>
        <input
          v-model="nick"
          class="field__input"
          placeholder="牌桌上显示的名字"
          placeholder-class="field__placeholder"
          @focus="focusKey = 'nick'"
          @blur="focusKey = ''" />
      </view>
      <view :class="focusKey === 'password' ? 'field--focus' : 'field'">
        <text class="field__label">密码</text>
        <input
          v-model="password"
          class="field__input"
          :password="!visible"
          placeholder="请输入密码"
          placeholder-class="field__placeholder"
          @focus="focusKey = 'password'"
          @blur="focusKey = ''" />
        <text class="field__action" @click="visible = !visible">{{ visible ? '隐藏' : '显示' }}</text>
      </view>

      <view :class="submitClass" hover-class="submit--active" @click="handleSubmit">
        {{ loading ? '请稍候…' : submitText }}
      </view>

      <view class="switch">
        <text class="switch__text">{{ mode === 'login' ? '还没有账号？' : '已有账号？' }}</text>
        <text class="switch__link" @click="toggleMode">{{ mode === 'login' ? '立即注册' : '返回登录' }}</text>
      </view>

      <view class="guest" @click="guestPlay">
        <text class="guest__text">游客试玩 · 免注册进入</text>
      </view>

      <view class="tip" v-if="tipText">
        <text class="tip__text">{{ tipText }}</text>
      </view>
    </view>

    <view class="footer">
      <text class="footer__text">休闲游戏 · 理性娱乐 · 严禁赌博</text>
    </view>
  </view>
</template>
<script>
/**
 * 组件名称：whmjLogin
 * 功能说明：麻将系统登录与注册页，登录成功后进入大厅
 * 研发时间：2026/11/03
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  mode      - 当前模式，login 登录 / register 注册
 * @data {String}  userName  - 账号
 * @data {String}  password  - 密码
 * @data {String}  nick      - 昵称，注册时使用
 * @data {String}  focusKey  - 当前聚焦输入框
 * @data {Boolean} visible   - 密码是否明文
 * @data {Boolean} loading   - 是否正在提交
 * @data {String}  tipText   - 表单校验提示
 *
 * 事件说明：
 * @event handleSubmit - 校验并提交登录或注册
 * @event toggleMode   - 切换登录与注册
 * @event submitText   - 计算按钮文案
 * @event submitClass  - 计算按钮样式
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/11/03     郑朝军      初始创建，接入麻将系统账号接口
 */
import { ASSET_BASE } from '@/utils/whmj/const.js'
import { login, register } from '@/utils/whmj/api.js'
import { getToken } from '@/utils/whmj/http.js'

export default
{
  data()
  {
    return {
      mode: 'login',
      userName: '',
      password: '',
      nick: '',
      focusKey: '',
      visible: false,
      loading: false,
      tipText: ''
    }
  },

  computed:
  {
    /** 登录页背景，与大厅同一张氛围底图 */
    bgImage()
    {
      return `${ASSET_BASE}/gen/bg/hall.jpg`
    },

    /** 产品标准字 */
    logoImage()
    {
      return `${ASSET_BASE}/gen/ui/logo.png`
    },

    /** 提交按钮文案 */
    submitText()
    {
      return this.mode === 'login' ? '进入游戏' : '注册并进入'
    },

    /** 提交按钮样式 */
    submitClass()
    {
      return this.loading ? 'submit--disabled' : 'submit'
    }
  },

  onLoad()
  {
    if (getToken())
    {
      uni.reLaunch({ url: '/pages/whmj/index' })
    }
  },

  methods:
  {
    /** 原版素材路径 */
    nativeImg(name)
    {
      return `${ASSET_BASE}/ui/native/${name}.png`
    },

    /** 游客试玩：随机账号自动注册并进入 */
    async guestPlay()
    {
      if (this.loading)
      {
        return
      }

      this.loading = true
      this.tipText = ''

      const name = `guest${Math.floor(Math.random() * 900000 + 100000)}`

      try
      {
        await register(name, '123456', `游客${name.slice(-4)}`)
      }
      catch (err)
      {
        try
        {
          await login(name, '123456')
        }
        catch (e)
        {
          this.tipText = e.message || '游客登录失败'
          this.loading = false
          return
        }
      }

      uni.reLaunch({ url: '/pages/whmj/index' })
    },

    /** 切换登录与注册 */
    toggleMode()
    {
      this.mode = this.mode === 'login' ? 'register' : 'login'
      this.tipText = ''
    },

    /** 校验并提交 */
    async handleSubmit()
    {
      if (this.loading)
      {
        return
      }

      const userName = this.userName.trim()
      const password = this.password.trim()

      if (!userName || !password)
      {
        this.tipText = '账号与密码不能为空'
        return
      }

      if (password.length < 6)
      {
        this.tipText = '密码至少 6 位'
        return
      }

      this.loading = true
      this.tipText = ''

      try
      {
        if (this.mode === 'login')
        {
          await login(userName, password)
        }
        else
        {
          await register(userName, password, this.nick.trim() || userName)
        }

        uni.reLaunch({ url: '/pages/whmj/index' })
      }
      catch (err)
      {
        this.tipText = err.message || '操作失败'
      }
      finally
      {
        this.loading = false
      }
    }
  }
}
</script>

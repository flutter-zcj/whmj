<style lang="scss" scoped>
.page { display: flex; flex-direction: column; box-sizing: border-box; height: 100%; min-height: 0; background: #f5f6f8; }
.chat { flex: 1; box-sizing: border-box; min-height: 0; padding: 24rpx; }
.intro { display: flex; flex-direction: column; align-items: center; gap: 8rpx; padding: 30rpx 0 40rpx; }
.intro-title { font-size: 30rpx; font-weight: 600; color: #23262b; }
.intro-sub { font-size: 22rpx; color: #a2a7af; }
.msg { display: flex; margin-bottom: 20rpx; }
.bubble { max-width: 86%; padding: 20rpx 24rpx; font-size: 27rpx; line-height: 1.6; border-radius: 18rpx; }
.bubble.user { background: #1aa86c; color: #fff; margin-left: auto; border-bottom-right-radius: 6rpx; }
.bubble.ai { background: #fff; color: #23262b; border-bottom-left-radius: 6rpx; }
.ai-text { font-size: 26rpx; }
.result { min-width: 420rpx; }
.result-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14rpx; }
.result-amount { font-size: 40rpx; font-weight: 700; color: #23262b; }
.result-amount.income { color: #1aa86c; }
.result-tag { padding: 2rpx 10rpx; background: #f2f3f5; font-size: 19rpx; color: #8a8f99; border-radius: 999rpx; }
.result-row { display: flex; padding: 8rpx 0; }
.result-label { width: 90rpx; font-size: 23rpx; color: #a2a7af; }
.result-value { flex: 1; font-size: 23rpx; color: #3d424a; }
.result-actions { display: flex; gap: 16rpx; margin-top: 18rpx; }
.btn-edit, .btn-confirm { flex: 1; padding: 14rpx 0; font-size: 25rpx; text-align: center; border-radius: 999rpx; }
.btn-edit { background: #f3f4f6; color: #5c626b; }
.btn-confirm { background: #1aa86c; font-weight: 600; color: #fff; }
.examples { display: flex; flex-wrap: wrap; gap: 12rpx; padding: 0 24rpx 16rpx; }
.example { padding: 10rpx 20rpx; background: #fff; font-size: 21rpx; color: #5c626b; border-radius: 999rpx; }
.input-bar { display: flex; align-items: center; gap: 16rpx; padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #eef0f3; }
.input { flex: 1; height: 72rpx; padding: 0 28rpx; background: #f3f4f6; font-size: 26rpx; border-radius: 999rpx; }
.camera { padding: 0 6rpx 0 2rpx; font-size: 34rpx; }
.send { padding: 0 10rpx; font-size: 27rpx; font-weight: 600; color: #1aa86c; }
.send.disabled { color: #b5b9c0; }
.bottom-holder { height: 20rpx; }
</style>
<template>
  <view class="page">
    <scroll-view scroll-y class="chat" :scroll-top="scrollTop">
      <view class="intro">
        <acc-icon name="sparkle" :size="72" color="#1AA86C" />
        <text class="intro-title">说一句话，自动记一笔</text>
        <text class="intro-sub">比如「午饭 35 微信」「昨天打车 22」「工资 12000」</text>
      </view>

      <view v-for="(msg, index) in messages" :key="index" class="msg">
        <view v-if="msg.role === 'user'" class="bubble user">
          <text>{{ msg.text }}</text>
        </view>
        <view v-else class="bubble ai">
          <text v-if="!msg.result" class="ai-text">{{ msg.text }}</text>
          <view v-else class="result">
            <view class="result-head">
              <text class="result-amount" :class="{ income: msg.result.billType === '1' }">
                {{ msg.result.billType === '1' ? '+' : '-' }}¥{{ formatMoney(msg.result.amount) }}
              </text>
              <text class="result-tag">{{ msg.result.source === 'llm' ? 'AI' : '规则' }}</text>
            </view>
            <view class="result-row">
              <text class="result-label">分类</text>
              <text class="result-value">{{ msg.result.categoryName || '未识别' }}</text>
            </view>
            <view class="result-row">
              <text class="result-label">账户</text>
              <text class="result-value">{{ msg.result.accountName || '默认' }}</text>
            </view>
            <view class="result-row">
              <text class="result-label">日期</text>
              <text class="result-value">{{ msg.result.billDate }}</text>
            </view>
            <view class="result-row">
              <text class="result-label">备注</text>
              <text class="result-value">{{ msg.result.remark }}</text>
            </view>
            <view class="result-actions">
              <text class="btn-edit" @click="goEdit(msg.result)">修改</text>
              <text class="btn-confirm" @click="confirm(msg, index)">确认入账</text>
            </view>
          </view>
        </view>
      </view>
      <view class="bottom-holder" />
    </scroll-view>

    <view class="examples">
      <text
        v-for="item in examples"
        :key="item"
        class="example"
        @click="quickSend(item)"
      >{{ item }}</text>
    </view>

    <view class="input-bar">
      <view class="camera" @click="pickAndOcr"><acc-icon name="camera" :size="38" color="#6B7280" /></view>
      <input
        v-model="text"
        class="input"
        placeholder="说一句话，比如：午饭 35 微信"
        confirm-type="send"
        @confirm="send"
      />
      <text class="send" :class="{ disabled: sending }" @click="send">{{ sending ? '…' : '发送' }}</text>
    </view>
  </view>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { parseText, addBill, ocrImage } from '@/utils/account/api.js'

const messages = ref([])
const text = ref('')
const sending = ref(false)
const scrollTop = ref(0)

const examples = ['午饭 35 微信', '昨天打车 22', '工资 12000', '超市买菜 128 支付宝']

function formatMoney(value)
{
  const num = Number(value || 0)
  const fixed = Math.abs(num).toFixed(2)
  const [intPart, decPart] = fixed.split('.')

  return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`
}

function scrollToBottom()
{
  nextTick(() =>
  {
    scrollTop.value = 100000 + Math.random()
  })
}

async function send()
{
  const content = text.value.trim()
  if (!content || sending.value)
  {
    return
  }
  messages.value.push({ role: 'user', text: content })
  text.value = ''
  sending.value = true
  scrollToBottom()
  try
  {
    const res = await parseText(content)
    const payload = res.data || {}
    if (!payload.success)
    {
      messages.value.push({ role: 'ai', text: payload.message || '没听懂，换个说法试试' })
    }
    else
    {
      messages.value.push({ role: 'ai', result: payload.data })
    }
  }
  catch (e)
  {
    messages.value.push({ role: 'ai', text: '解析失败，请稍后重试' })
  }
  finally
  {
    sending.value = false
    scrollToBottom()
  }
}

async function pickAndOcr()
{
  uni.chooseImage(
  {
    count: 1,
    sizeType: ['compressed'],
    success: async (res) =>
    {
      uni.showLoading({ title: '识别中', mask: true })
      try
      {
        const data = await ocrImage(res.tempFilePaths[0])
        uni.hideLoading()
        if (!data || !data.amount)
        {
          uni.showToast({ title: '没识别出金额，手动填一下吧', icon: 'none' })
          return
        }
        const query = [
          `amount=${data.amount}`,
          `billDate=${data.billDate}`,
          data.merchant ? `remark=${encodeURIComponent(data.merchant)}` : ''
        ].filter(Boolean).join('&')
        uni.navigateTo({ url: `/pages/account/add?${query}` })
      }
      catch (e)
      {
        uni.hideLoading()
      }
    }
  })
}

function quickSend(value)
{
  text.value = value
  send()
}

async function confirm(message, index)
{
  const item = message.result
  try
  {
    await addBill({
      billType: item.billType,
      amount: Number(item.amount),
      categoryId: item.categoryId,
      accountId: item.accountId,
      billDate: item.billDate,
      remark: item.remark
    })
    messages.value.splice(index, 1, { role: 'ai', text: '已记账' })
    uni.showToast({ title: '记账成功', icon: 'success' })
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

function goEdit(item)
{
  const query = [
    `amount=${item.amount}`,
    item.categoryId ? `categoryId=${item.categoryId}` : '',
    item.accountId ? `accountId=${item.accountId}` : '',
    `billDate=${item.billDate}`,
    item.remark ? `remark=${encodeURIComponent(item.remark)}` : '',
    `billType=${item.billType}`
  ].filter(Boolean).join('&')
  uni.navigateTo({ url: `/pages/account/add?${query}` })
}

onLoad(() =>
{
  messages.value.push({ role: 'ai', text: '想记什么账？直接说，我来填好。' })
})
</script>

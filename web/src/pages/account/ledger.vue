<style lang="scss" scoped>
.page { box-sizing: border-box; min-height: 100vh; padding: 24rpx; background: #f5f6f8; }
.tip { padding: 0 8rpx 20rpx; font-size: 21rpx; line-height: 1.7; color: #a2a7af; }
.card { padding: 24rpx; border: 2rpx solid transparent; background: #fff; border-radius: 20rpx; margin-bottom: 16rpx; }
.card.active { border-color: #1aa86c; }
.card-top { display: flex; align-items: center; }
.icon { display: flex; align-items: center; justify-content: center; width: 78rpx; height: 78rpx; background: #e8f6ef; border-radius: 50%; margin-right: 18rpx; }
.icon.shared { background: #fff4e5; }
.cover { width: 100%; height: 100%; border-radius: inherit; }
.info { display: flex; flex: 1; flex-direction: column; gap: 6rpx; }
.name-row { display: flex; align-items: center; gap: 10rpx; }
.name { font-size: 28rpx; font-weight: 600; color: #23262b; }
.badge { padding: 2rpx 10rpx; background: #e8f6ef; font-size: 18rpx; color: #1aa86c; border-radius: 999rpx; }
.badge.shared { background: #fff4e5; color: #e08b1f; }
.sub { font-size: 21rpx; color: #a2a7af; }
.check { font-size: 32rpx; font-weight: 700; color: #1aa86c; }
.actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.btn-outline, .btn-ghost { flex: 1; height: 88rpx; border: none; font-size: 27rpx; line-height: 88rpx; border-radius: 999rpx; }
.btn-outline { background: #1aa86c; color: #fff; }
.btn-ghost { background: #fff; color: #5c626b; }
.btn-outline::after, .btn-ghost::after, .btn-primary::after { border: none; }
.sheet-mask { position: fixed; display: flex; left: 0; right: 0; top: 0; bottom: 0; z-index: 999; align-items: flex-end; background: rgba(0, 0, 0, 0.35); }
.sheet-panel { box-sizing: border-box; width: 100%; padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); background: #fff; border-radius: 24rpx 24rpx 0 0; }
.sheet-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; }
.sheet-panel-title { font-size: 30rpx; font-weight: 600; color: #23262b; }
.sheet-panel-close { padding: 8rpx; font-size: 28rpx; color: #a8adb5; }
.sheet-panel-input { height: 88rpx; padding: 0 24rpx; background: #f5f6f8; font-size: 28rpx; border-radius: 14rpx; }
.sheet-panel-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.flex1 { flex: 1; }
.flex2 { flex: 2; }
.btn-primary { height: 88rpx; border: none; background: #1aa86c; font-size: 28rpx; line-height: 88rpx; color: #fff; border-radius: 999rpx; }
</style>
<template>
  <view class="page">
    <view class="tip">账本决定你看到哪些账单。共享账本可邀请家人一起记，成员共用同一份收支。</view>

    <view
      v-for="item in ledgers"
      :key="item.ledgerId"
      class="card"
      :class="{ active: item.ledgerId === currentId }"
      @click="switchLedger(item)"
    >
      <view class="card-top">
        <view class="icon" :class="{ shared: item.memberCount > 1 }">
          <image class="cover" :src="ledgerImage(item)" mode="aspectFill" />
        </view>
        <view class="info">
          <view class="name-row">
            <text class="name">{{ item.ledgerName }}</text>
            <text v-if="item.isDefault === '1'" class="badge">默认</text>
            <text v-if="item.memberCount > 1" class="badge shared">{{ item.memberCount }} 人</text>
          </view>
          <text class="sub">{{ item.billCount }} 笔账单<text v-if="item.inviteCode"> · 邀请码 {{ item.inviteCode }}</text></text>
        </view>
        <acc-icon v-if="item.ledgerId === currentId" name="check" :size="30" color="#1AA86C" />
      </view>
    </view>

    <view class="actions">
      <button class="btn-outline" @click="openCreate">+ 创建共享账本</button>
      <button class="btn-ghost" @click="openJoin">用邀请码加入</button>
    </view>

    <!-- 创建弹层 -->
    <view v-if="sheet === 'create'" class="sheet-mask" @click="closeSheet">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-panel-head">
          <text class="sheet-panel-title">创建共享账本</text>
          <view class="sheet-panel-close" @click="closeSheet"><acc-icon name="close" :size="28" color="#A8ADB5" /></view>
        </view>
        <input v-model="createName" class="sheet-panel-input" placeholder="给账本起个名字，比如「家庭账本」" maxlength="12" />
        <view class="sheet-panel-actions">
          <button class="btn-ghost flex1" @click="closeSheet">取消</button>
          <button class="btn-primary flex2" @click="doCreate">创建</button>
        </view>
      </view>
    </view>

    <!-- 加入弹层 -->
    <view v-if="sheet === 'join'" class="sheet-mask" @click="closeSheet">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-panel-head">
          <text class="sheet-panel-title">加入账本</text>
          <view class="sheet-panel-close" @click="closeSheet"><acc-icon name="close" :size="28" color="#A8ADB5" /></view>
        </view>
        <input v-model="joinCode" class="sheet-panel-input" placeholder="输入 6 位邀请码" maxlength="6" />
        <view class="sheet-panel-actions">
          <button class="btn-ghost flex1" @click="closeSheet">取消</button>
          <button class="btn-primary flex2" @click="doJoin">加入</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { ledgerCover } from '@/utils/account/photos.js'
import { getLedgerList, addLedger, joinLedger } from '@/utils/account/api.js'
import { getLedgerId, setLedgerId } from '@/utils/account/http.js'

const ledgers = ref([])
const currentId = ref(0)
const sheet = ref('')
const createName = ref('')
const joinCode = ref('')

async function load()
{
  try
  {
    const res = await getLedgerList()
    ledgers.value = res.data || []
    const stored = Number(getLedgerId() || 0)
    const exists = ledgers.value.some((item) => item.ledgerId === stored)
    currentId.value = exists ? stored : (ledgers.value[0] ? ledgers.value[0].ledgerId : 0)
    if (currentId.value && !exists)
    {
      setLedgerId(currentId.value)
    }
  }
  catch (e)
  {
    ledgers.value = []
  }
}

function switchLedger(item)
{
  if (item.ledgerId === currentId.value)
  {
    return
  }
  currentId.value = item.ledgerId
  setLedgerId(item.ledgerId)
  uni.showToast({ title: `已切换到「${item.ledgerName}」`, icon: 'none' })
  setTimeout(() => uni.navigateBack(), 600)
}

function openCreate()
{
  createName.value = ''
  sheet.value = 'create'
}

function openJoin()
{
  joinCode.value = ''
  sheet.value = 'join'
}

function closeSheet()
{
  sheet.value = ''
}

async function doCreate()
{
  if (!createName.value.trim())
  {
    uni.showToast({ title: '请输入账本名称', icon: 'none' })
    return
  }
  try
  {
    const res = await addLedger({ ledgerName: createName.value.trim() })
    uni.showToast({ title: res.msg || '已创建', icon: 'success' })
    closeSheet()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

async function doJoin()
{
  const code = joinCode.value.trim().toUpperCase()
  if (code.length !== 6)
  {
    uni.showToast({ title: '请输入 6 位邀请码', icon: 'none' })
    return
  }
  try
  {
    const res = await joinLedger(code)
    uni.showToast({ title: res.msg || '已加入', icon: 'success' })
    closeSheet()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

/**
 * 取账本封面
 * @param {Object} item 账本
 * @returns {String} 图片地址
 */
function ledgerImage(item)
{
  return ledgerCover(Number(item.ledgerId || 0))
}

onShow(() =>
{
  load()
})
</script>

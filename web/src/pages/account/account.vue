<style lang="scss" scoped>
.page { box-sizing: border-box; min-height: 100vh; padding: 24rpx; background: #f5f6f8; }
.summary { display: flex; flex-direction: column; gap: 8rpx; padding: 32rpx 28rpx; background: linear-gradient(160deg, #2b3947 0%, #1f2b36 100%); border-radius: 20rpx; margin-bottom: 20rpx; }
.summary-label { font-size: 22rpx; color: rgba(255, 255, 255, 0.7); }
.summary-value { font-size: 56rpx; font-weight: 700; color: #fff; }
.summary-sub { display: flex; gap: 28rpx; margin-top: 8rpx; }
.summary-item { font-size: 21rpx; color: rgba(255, 255, 255, 0.66); }
.list { padding: 8rpx 24rpx; background: #fff; border-radius: 20rpx; }
.row { display: flex; align-items: center; padding: 22rpx 0; border-bottom: 1rpx solid #f5f6f8; }
.row:last-child { border-bottom: none; }
.row-icon { display: flex; align-items: center; justify-content: center; width: 76rpx; height: 76rpx; border-radius: 50%; margin-right: 18rpx; }
.row-info { display: flex; flex: 1; flex-direction: column; gap: 4rpx; }
.row-name { font-size: 27rpx; color: #23262b; }
.row-meta { font-size: 20rpx; color: #a2a7af; }
.row-balance { font-size: 28rpx; font-weight: 600; color: #23262b; }
.row-balance.minus { color: #d9534f; }
.empty { padding: 50rpx 0; font-size: 24rpx; color: #a2a7af; text-align: center; }
.footer { margin-top: 32rpx; }
.btn-primary { height: 92rpx; border: none; background: #1aa86c; font-size: 30rpx; line-height: 92rpx; color: #fff; border-radius: 999rpx; }
.btn-primary::after { border: none; }
.sheet-mask { position: fixed; display: flex; left: 0; right: 0; top: 0; bottom: 0; z-index: 999; align-items: flex-end; background: rgba(0, 0, 0, 0.35); }
.sheet-panel { box-sizing: border-box; width: 100%; max-height: 82vh; padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); background: #fff; border-radius: 24rpx 24rpx 0 0; overflow-y: auto; }
.sheet-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.sheet-panel-title { font-size: 30rpx; font-weight: 600; color: #23262b; }
.sheet-panel-close { padding: 8rpx; font-size: 28rpx; color: #a8adb5; }
.field { display: flex; align-items: center; gap: 16rpx; padding: 20rpx 0; border-bottom: 1rpx solid #f5f6f8; }
.field-label { width: 150rpx; font-size: 26rpx; color: #5c626b; }
.field-input { flex: 1; font-size: 27rpx; color: #23262b; }
.chips { display: flex; flex: 1; flex-wrap: wrap; gap: 12rpx; }
.chip { padding: 8rpx 20rpx; background: #f3f4f6; font-size: 23rpx; color: #5c626b; border-radius: 999rpx; }
.chip.active { background: #1aa86c; color: #fff; }
.color-list { display: flex; flex: 1; flex-wrap: wrap; gap: 14rpx; }
.color { width: 48rpx; height: 48rpx; border: 3rpx solid transparent; border-radius: 50%; }
.color.active { border-color: #23262b; }
.switch-row { justify-content: space-between; border-bottom: none; }
.sheet-panel-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.btn-ghost { flex: 1; height: 88rpx; border: none; background: #f3f4f6; font-size: 28rpx; line-height: 88rpx; color: #d9534f; border-radius: 999rpx; }
.btn-ghost::after { border: none; }
.sheet-panel-actions .btn-primary { flex: 2; height: 88rpx; line-height: 88rpx; }
</style>
<template>
  <view class="page">
    <view class="summary">
      <text class="summary-label">净资产</text>
      <text class="summary-value">¥ {{ formatMoney(asset.netAsset) }}</text>
      <view class="summary-sub">
        <text class="summary-item">总资产 ¥{{ formatMoney(asset.totalAsset) }}</text>
        <text class="summary-item">负债 ¥{{ formatMoney(asset.totalDebt) }}</text>
      </view>
    </view>

    <view class="list">
      <view
        v-for="item in asset.accounts"
        :key="item.accountId"
        class="row"
        @click="openEditor(item)"
        @longpress="onLongPress(item)"
      >
        <view class="row-icon" :style="accountIconStyle(item)">
          <acc-icon :name="accountIcon(item)" :size="34" color="#FFFFFF" />
        </view>
        <view class="row-info">
          <text class="row-name">{{ item.accountName }}</text>
          <text class="row-meta">{{ typeLabel(item.accountType) }}<text v-if="item.isInclude === '1'"> · 不计入总资产</text></text>
        </view>
        <text class="row-balance" :class="{ minus: item.balance < 0 }">{{ formatMoney(item.balance) }}</text>
      </view>
      <view v-if="asset.accounts.length === 0" class="empty">还没有账户，点下方按钮添加</view>
    </view>

    <view class="footer">
      <button class="btn-primary" @click="openEditor(null)">+ 添加账户</button>
    </view>

    <!-- 编辑弹层 -->
    <view v-if="editor" class="sheet-mask" @click="closeEditor">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-panel-head">
          <text class="sheet-panel-title">{{ form.accountId ? '编辑账户' : '添加账户' }}</text>
          <view class="sheet-panel-close" @click="closeEditor"><acc-icon name="close" :size="28" color="#A8ADB5" /></view>
        </view>

        <view class="field">
          <text class="field-label">名称</text>
          <input v-model="form.accountName" class="field-input" placeholder="如：微信、招商银行卡" maxlength="10" />
        </view>

        <view class="field">
          <text class="field-label">类型</text>
          <view class="chips">
            <text
              v-for="item in typeOptions"
              :key="item.value"
              class="chip"
              :class="{ active: form.accountType === item.value }"
              @click="form.accountType = item.value"
            >{{ item.label }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">初始余额</text>
          <input v-model="form.initBalance" class="field-input" type="digit" placeholder="0.00" />
        </view>


        <view class="field">
          <text class="field-label">颜色</text>
          <view class="color-list">
            <view
              v-for="item in colors"
              :key="item"
              class="color"
              :class="{ active: form.color === item }"
              :style="{ backgroundColor: item }"
              @click="form.color = item"
            />
          </view>
        </view>

        <view class="field switch-row">
          <text class="field-label">计入总资产</text>
          <switch :checked="form.isInclude === '0'" color="#1AA86C" @change="onIncludeChange" />
        </view>

        <view class="sheet-panel-actions">
          <button v-if="form.accountId" class="btn-ghost" @click="removeAccount(form.accountId)">删除</button>
          <button class="btn-primary" :loading="saving" @click="submit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAccountList, addAccount, updateAccount, deleteAccount } from '@/utils/account/api.js'

const asset = ref({ accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 })
const editor = ref(false)
const saving = ref(false)
const form = ref(emptyForm())

const typeOptions = [
  { label: '现金', value: '0' },
  { label: '储蓄卡', value: '1' },
  { label: '信用卡', value: '2' },
  { label: '花呗', value: '3' },
  { label: '理财', value: '4' },
  { label: '借入', value: '5' },
  { label: '借出', value: '6' },
  { label: '微信', value: '7' },
  { label: '支付宝', value: '8' },
  { label: '其他', value: '9' }
]

const colors = ['#1AA86C', '#66BB6A', '#42A5F5', '#7E57C2', '#EF5350', '#FFA726', '#26A69A', '#78909C']

function emptyForm()
{
  return {
    accountId: null,
    accountName: '',
    accountType: '1',
    initBalance: '',
    icon: '💳',
    color: '#1AA86C',
    isInclude: '0'
  }
}

function formatMoney(value)
{
  const num = Number(value || 0)
  const fixed = Math.abs(num).toFixed(2)
  const [intPart, decPart] = fixed.split('.')

  return `${num < 0 ? '-' : ''}${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`
}

function hexToRgba(hex, alpha)
{
  const value = (hex || '#1AA86C').replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value

  return `rgba(${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}, ${alpha})`
}

function typeLabel(type)
{
  const map = { '0': '现金', '1': '储蓄卡', '2': '信用卡', '3': '花呗', '4': '理财', '5': '借入', '6': '借出', '7': '微信', '8': '支付宝', '9': '其他' }

  return map[type] || '其他'
}

async function load()
{
  try
  {
    const res = await getAccountList()
    asset.value = res.data || { accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 }
  }
  catch (e)
  {
    asset.value = { accounts: [], totalAsset: 0, totalDebt: 0, netAsset: 0 }
  }
}

function openEditor(item)
{
  form.value = item
    ? {
        accountId: item.accountId,
        accountName: item.accountName,
        accountType: item.accountType,
        initBalance: String(item.initBalance ?? ''),
        icon: item.icon || '💳',
        color: item.color || '#1AA86C',
        isInclude: item.isInclude || '0'
      }
    : emptyForm()
  editor.value = true
}

function closeEditor()
{
  editor.value = false
}

function onIncludeChange(event)
{
  form.value.isInclude = event.detail.value ? '0' : '1'
}

async function submit()
{
  if (!form.value.accountName.trim())
  {
    uni.showToast({ title: '请输入账户名称', icon: 'none' })
    return
  }
  const payload = {
    accountName: form.value.accountName.trim(),
    accountType: form.value.accountType,
    initBalance: Number(form.value.initBalance || 0),
    icon: form.value.icon,
    color: form.value.color,
    isInclude: form.value.isInclude
  }
  if (form.value.accountId)
  {
    payload.accountId = form.value.accountId
  }
  saving.value = true
  try
  {
    if (payload.accountId)
    {
      await updateAccount(payload)
    }
    else
    {
      await addAccount(payload)
    }
    uni.showToast({ title: '已保存', icon: 'success' })
    closeEditor()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
  finally
  {
    saving.value = false
  }
}

function onLongPress(item)
{
  uni.showModal(
  {
    title: '删除账户',
    content: `确定删除「${item.accountName}」？账户下仍有账单时无法删除。`,
    success: async (res) =>
    {
      if (res.confirm)
      {
        removeAccount(item.accountId)
      }
    }
  })
}

async function removeAccount(accountId)
{
  try
  {
    await deleteAccount(accountId)
    uni.showToast({ title: '已删除', icon: 'success' })
    closeEditor()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

/**
 * 取账户图标名
 * @param {Object} item 账户
 * @returns {String} 图标名
 */
function accountIcon(item)
{
  const map = { 2: 'coins', 3: 'coins', 4: 'invest', 5: 'transfer', 6: 'transfer' }

  return map[String(item.accountType)] || 'wallet'
}

/**
 * 取账户图标底色
 * @param {Object} item 账户
 * @returns {Object} 样式对象
 */
function accountIconStyle(item)
{
  return { backgroundColor: item.color || '#1AA86C' }
}

onShow(() =>
{
  load()
})
</script>

<style lang="scss" scoped>
.page { box-sizing: border-box; min-height: 100vh; padding: 24rpx; background: #f5f6f8; }
.tip { padding: 0 8rpx 20rpx; font-size: 21rpx; line-height: 1.7; color: #a2a7af; }
.card { padding: 24rpx; background: #fff; border-radius: 20rpx; margin-bottom: 16rpx; }
.card-top { display: flex; align-items: center; }
.icon { display: flex; align-items: center; justify-content: center; width: 78rpx; height: 78rpx; border-radius: 50%; margin-right: 18rpx; }
.photo { width: 100%; height: 100%; border-radius: inherit; }
.info { display: flex; flex: 1; flex-direction: column; gap: 6rpx; }
.title { font-size: 28rpx; font-weight: 600; color: #23262b; }
.sub { font-size: 21rpx; color: #a2a7af; }
.right { display: flex; flex-direction: column; align-items: flex-end; gap: 10rpx; }
.amount { font-size: 28rpx; font-weight: 600; color: #23262b; }
.amount.income { color: #1aa86c; }
.sw { transform: scale(0.72); transform-origin: right center; }
.card-bottom { display: flex; justify-content: space-between; margin-top: 18rpx; padding-top: 16rpx; border-top: 1rpx solid #f5f6f8; }
.next { font-size: 21rpx; color: #5c626b; }
.count { font-size: 21rpx; color: #b5b9c0; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 10rpx; padding: 100rpx 0; }
.empty-icon { font-size: 56rpx; }
.empty-text { font-size: 26rpx; color: #a2a7af; }
.empty-tip { font-size: 21rpx; color: #c2c6cc; }
.footer { margin-top: 24rpx; }
.btn-primary { height: 92rpx; border: none; background: #1aa86c; font-size: 30rpx; line-height: 92rpx; color: #fff; border-radius: 999rpx; }
.btn-primary::after { border: none; }
.sheet-mask { position: fixed; display: flex; left: 0; right: 0; top: 0; bottom: 0; z-index: 999; align-items: flex-end; background: rgba(0, 0, 0, 0.35); }
.sheet-panel { box-sizing: border-box; width: 100%; max-height: 84vh; padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); background: #fff; border-radius: 24rpx 24rpx 0 0; overflow-y: auto; }
.sheet-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.sheet-panel-title { font-size: 30rpx; font-weight: 600; color: #23262b; }
.sheet-panel-close { padding: 8rpx; font-size: 28rpx; color: #a8adb5; }
.field { display: flex; align-items: center; gap: 16rpx; padding: 22rpx 0; border-bottom: 1rpx solid #f5f6f8; }
.field-label { flex-shrink: 0; width: 130rpx; font-size: 26rpx; color: #5c626b; }
.field-input { flex: 1; font-size: 27rpx; color: #23262b; }
.field-value { font-size: 26rpx; color: #23262b; }
.chips { display: flex; flex: 1; flex-wrap: wrap; gap: 12rpx; }
.chip { padding: 8rpx 18rpx; background: #f3f4f6; font-size: 23rpx; color: #5c626b; border-radius: 999rpx; }
.chip.active { background: #1aa86c; color: #fff; }
.sheet-panel-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.btn-ghost { flex: 1; height: 88rpx; border: none; background: #f3f4f6; font-size: 28rpx; line-height: 88rpx; color: #d9534f; border-radius: 999rpx; }
.btn-ghost::after { border: none; }
.sheet-panel-actions .btn-primary { flex: 2; height: 88rpx; line-height: 88rpx; }
</style>
<template>
  <view class="page">
    <view class="tip">到期后自动补记，打开 App 即结算。删除规则不影响已生成的账单。</view>

    <view v-for="item in rules" :key="item.recurringId" class="card" @click="openEditor(item)">
      <view class="card-top">
        <view class="icon" :style="{ backgroundColor: hexToRgba(item.categoryColor, 0.12) }">
          <image class="photo" :src="categoryImage(item)" mode="aspectFill" />
        </view>
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <text class="sub">{{ item.ruleLabel }} · {{ item.accountName || '未指定账户' }}</text>
        </view>
        <view class="right">
          <text class="amount" :class="{ income: item.billType === '1' }">
            {{ item.billType === '1' ? '+' : '-' }}{{ formatMoney(item.amount) }}
          </text>
          <switch
            :checked="item.status === '0'"
            color="#1AA86C"
            class="sw"
            @click.stop
            @change="onToggle(item)"
          />
        </view>
      </view>
      <view class="card-bottom">
        <text class="next">下次 {{ item.nextRunDate }}</text>
        <text class="count">已生成 {{ item.runCount }} 笔</text>
      </view>
    </view>

    <view v-if="rules.length === 0" class="empty">
      <text class="empty-icon">🔁</text>
      <text class="empty-text">还没有周期记账</text>
      <text class="empty-tip">房租、订阅、还款都可以挂在这里</text>
    </view>

    <view class="footer">
      <button class="btn-primary" @click="openEditor(null)">+ 新建周期记账</button>
    </view>

    <!-- 编辑弹层 -->
    <view v-if="editor" class="sheet-mask" @click="closeEditor">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-panel-head">
          <text class="sheet-panel-title">{{ form.recurringId ? '编辑周期记账' : '新建周期记账' }}</text>
          <text class="sheet-panel-close" @click="closeEditor">✕</text>
        </view>

        <view class="field">
          <text class="field-label">名称</text>
          <input v-model="form.title" class="field-input" placeholder="如：房租、视频会员" maxlength="12" />
        </view>

        <view class="field">
          <text class="field-label">类型</text>
          <view class="chips">
            <text
              v-for="item in typeOptions"
              :key="item.value"
              class="chip"
              :class="{ active: form.billType === item.value }"
              @click="form.billType = item.value"
            >{{ item.label }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">金额</text>
          <input v-model="form.amount" class="field-input" type="digit" placeholder="0.00" />
        </view>

        <view v-if="form.billType !== '2'" class="field">
          <text class="field-label">分类</text>
          <view class="chips">
            <text
              v-for="item in categories"
              :key="item.categoryId"
              class="chip"
              :class="{ active: form.categoryId === item.categoryId }"
              @click="form.categoryId = item.categoryId"
            >{{ item.icon }} {{ item.categoryName }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">账户</text>
          <view class="chips">
            <text
              v-for="item in accounts"
              :key="item.accountId"
              class="chip"
              :class="{ active: form.accountId === item.accountId }"
              @click="form.accountId = item.accountId"
            >{{ item.icon }} {{ item.accountName }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">周期</text>
          <view class="chips">
            <text
              v-for="item in ruleOptions"
              :key="item.value"
              class="chip"
              :class="{ active: form.ruleType === item.value }"
              @click="form.ruleType = item.value"
            >{{ item.label }}</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">首次日期</text>
          <picker mode="date" :value="form.startDate" @change="onStartDate">
            <text class="field-value">{{ form.startDate }} ›</text>
          </picker>
        </view>

        <view class="field">
          <text class="field-label">备注</text>
          <input v-model="form.remark" class="field-input" placeholder="可选" maxlength="30" />
        </view>

        <view class="sheet-panel-actions">
          <button v-if="form.recurringId" class="btn-ghost" @click="removeRule(form.recurringId)">删除</button>
          <button class="btn-primary" :loading="saving" @click="submit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { categoryPhoto } from '@/utils/account/photos.js'
import { onShow } from '@dcloudio/uni-app'
import {
  getRecurringList,
  addRecurring,
  updateRecurring,
  deleteRecurring,
  toggleRecurring,
  getCategoryList,
  getAccountList
} from '@/utils/account/api.js'

const typeOptions = [
  { label: '支出', value: '0' },
  { label: '收入', value: '1' },
  { label: '转账', value: '2' }
]

const ruleOptions = [
  { label: '每天', value: '0' },
  { label: '每周', value: '1' },
  { label: '每月', value: '2' },
  { label: '每年', value: '3' }
]

const rules = ref([])
const categories = ref([])
const accounts = ref([])
const editor = ref(false)
const saving = ref(false)
const form = ref(emptyForm())

function emptyForm()
{
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return {
    recurringId: null,
    title: '',
    billType: '0',
    amount: '',
    categoryId: null,
    accountId: null,
    ruleType: '2',
    intervalNum: 1,
    startDate: iso,
    remark: ''
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

async function load()
{
  try
  {
    const res = await getRecurringList()
    rules.value = res.data || []
  }
  catch (e)
  {
    rules.value = []
  }
}

async function loadOptions()
{
  try
  {
    const res = await getCategoryList('0')
    categories.value = res.data || []
  }
  catch (e)
  {
    categories.value = []
  }
  try
  {
    const res = await getAccountList()
    accounts.value = (res.data && res.data.accounts) || []
  }
  catch (e)
  {
    accounts.value = []
  }
}

function openEditor(item)
{
  if (item)
  {
    form.value = {
      recurringId: item.recurringId,
      title: item.title,
      billType: item.billType,
      amount: String(item.amount),
      categoryId: item.categoryId,
      accountId: item.accountId,
      ruleType: item.ruleType,
      intervalNum: item.intervalNum || 1,
      startDate: item.startDate || item.nextRunDate,
      remark: item.remark || ''
    }
  }
  else
  {
    form.value = emptyForm()
    if (categories.value.length)
    {
      form.value.categoryId = categories.value[0].categoryId
    }
    if (accounts.value.length)
    {
      form.value.accountId = accounts.value[0].accountId
    }
  }
  editor.value = true
}

function closeEditor()
{
  editor.value = false
}

function onStartDate(event)
{
  form.value.startDate = event.detail.value
  const day = Number(event.detail.value.slice(8, 10))
  form.value.dayOfMonth = day
}

async function submit()
{
  if (!form.value.title.trim())
  {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  if (!Number(form.value.amount))
  {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }
  const payload = {
    title: form.value.title.trim(),
    billType: form.value.billType,
    amount: Number(form.value.amount),
    categoryId: form.value.billType === '2' ? null : form.value.categoryId,
    accountId: form.value.accountId,
    ruleType: form.value.ruleType,
    intervalNum: form.value.intervalNum || 1,
    dayOfMonth: Number(form.value.startDate.slice(8, 10)),
    startDate: form.value.startDate,
    remark: form.value.remark || null
  }
  if (form.value.recurringId)
  {
    payload.recurringId = form.value.recurringId
  }
  saving.value = true
  try
  {
    if (payload.recurringId)
    {
      await updateRecurring(payload)
    }
    else
    {
      await addRecurring(payload)
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

async function onToggle(item)
{
  try
  {
    const res = await toggleRecurring(item.recurringId)
    uni.showToast({ title: res.msg || '已切换', icon: 'none' })
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
  load()
}

async function removeRule(recurringId)
{
  try
  {
    const res = await deleteRecurring(recurringId)
    uni.showToast({ title: res.msg || '已删除', icon: 'none' })
    closeEditor()
    load()
  }
  catch (e)
  {
    // 错误提示已在请求层处理
  }
}

/**
 * 取规则分类图片地址
 * @param {Object} item 周期规则
 * @returns {String} 图片地址
 */
function categoryImage(item)
{
  return categoryPhoto(item.categoryName || item.title)
}

onShow(() =>
{
  loadOptions()
  load()
})
</script>

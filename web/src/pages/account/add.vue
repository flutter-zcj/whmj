<style lang="scss" scoped>
$brand: #1aa86c;
$brand-deep: #12925b;
$ink: #1b1f24;
$sub: #6b7280;
$faint: #9ca3af;
$line: #eff1f4;
.page { position: relative; display: flex; flex-direction: column; width: 100%; height: 100vh; padding-top: env(safe-area-inset-top); overflow: hidden; background: #fff; }
.header { position: relative; display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; padding: 28rpx 28rpx 14rpx; }
.header__btn { display: flex; align-items: center; justify-content: center; width: 56rpx; height: 56rpx; }
.type { display: flex; padding: 5rpx; background: #f1f3f6; border-radius: 999rpx; }
.type__item { padding: 10rpx 32rpx; font-size: 26rpx; color: $sub; border-radius: 999rpx; }
.type__item--active { background: $ink; font-weight: 600; color: #fff; }
.transfer { display: flex; flex-shrink: 0; align-items: center; padding: 30rpx 28rpx; }
.transfer__side { display: flex; flex: 1; flex-direction: column; padding: 22rpx 24rpx; background: #f6f7f9; border-radius: 18rpx; }
.transfer__label { font-size: 21rpx; color: $faint; }
.transfer__value { margin-top: 8rpx; font-size: 30rpx; font-weight: 600; color: $ink; }
.transfer__arrow { display: flex; align-items: center; justify-content: center; width: 72rpx; }
.grid-scroll { position: relative; flex: 1; min-height: 0; }
.grid { display: flex; flex-wrap: wrap; padding: 10rpx 14rpx 0; }
.grid__item { display: flex; flex-direction: column; align-items: center; width: 25%; margin-bottom: 26rpx; }
.grid__ring { display: flex; align-items: center; justify-content: center; width: 108rpx; height: 108rpx; border: 3rpx solid transparent; border-radius: 50%; }
.grid__ring--active { border-color: $brand; }
.grid__photo { width: 96rpx; height: 96rpx; background: #f4f5f7; border-radius: 50%; }
.grid__name { margin-top: 12rpx; font-size: 22rpx; color: $sub; }
.grid__name--active { font-weight: 600; color: $brand; }
.grid__manage { display: flex; align-items: center; justify-content: center; width: 96rpx; height: 96rpx; background: #f4f5f7; border-radius: 50%; }
.grid__tip { padding: 30rpx 0; font-size: 24rpx; color: $faint; text-align: center; }
.panel { position: relative; display: flex; flex-shrink: 0; flex-direction: column; background: #fff; border-top: 1rpx solid $line; }
.toolbar { display: flex; align-items: center; padding: 16rpx 20rpx 4rpx; }
.tool { display: flex; align-items: center; padding: 10rpx 16rpx; margin-right: 10rpx; background: #f4f5f7; border-radius: 999rpx; }
.tool__text { margin-left: 8rpx; font-size: 22rpx; color: $sub; }
.tool__text--active { font-weight: 600; color: $brand; }
.thumbs { display: flex; padding: 14rpx 20rpx 0; }
.thumb { position: relative; width: 100rpx; height: 100rpx; margin-right: 12rpx; }
.thumb__img { width: 100rpx; height: 100rpx; border-radius: 14rpx; }
.thumb__del { position: absolute; right: -8rpx; top: -8rpx; display: flex; align-items: center; justify-content: center; width: 34rpx; height: 34rpx; background: rgba(20, 24, 30, 0.62); border-radius: 50%; }
.amount { display: flex; align-items: flex-end; justify-content: space-between; padding: 18rpx 30rpx 6rpx; }
.amount__expr { font-size: 24rpx; color: $faint; }
.amount__value { font-size: 66rpx; font-weight: 700; color: $ink; letter-spacing: -1rpx; }
.keypad { display: flex; flex-wrap: wrap; padding: 8rpx 12rpx 0; }
.key { display: flex; align-items: center; justify-content: center; width: 25%; height: 108rpx; font-size: 40rpx; font-weight: 600; color: $ink; }
.key--fn { font-size: 38rpx; color: $brand; }
.key--done { width: calc(25% - 16rpx); height: 92rpx; margin: 8rpx; background: $brand; font-size: 30rpx; color: #fff; border-radius: 16rpx; }
.safe-bottom { height: env(safe-area-inset-bottom); }
.sheet-mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 999; display: flex; align-items: flex-end; background: rgba(0, 0, 0, 0.42); }
.sheet { display: flex; flex-direction: column; width: 100%; max-height: 72vh; padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom)); background: #fff; border-radius: 28rpx 28rpx 0 0; }
.sheet__head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10rpx; }
.sheet__title { font-size: 30rpx; font-weight: 600; color: $ink; }
.sheet__body { position: relative; overflow-y: auto; }
.sheet__item { display: flex; align-items: center; padding: 24rpx 6rpx; border-bottom: 1rpx solid $line; }
.sheet__item-name { flex: 1; margin-left: 16rpx; font-size: 28rpx; color: $ink; }
.sheet__item-value { font-size: 26rpx; color: $faint; }
.sheet__input { height: 88rpx; padding: 0 24rpx; margin-top: 16rpx; background: #f5f6f8; font-size: 28rpx; border-radius: 14rpx; }
.sheet__area { width: 100%; height: 176rpx; padding: 20rpx 24rpx; margin-top: 16rpx; background: #f5f6f8; font-size: 28rpx; border-radius: 14rpx; }
.sheet__tip { padding: 18rpx 6rpx 0; font-size: 20rpx; color: $faint; }
.sheet__actions { display: flex; margin-top: 22rpx; }
.sheet__btn { flex: 1; height: 84rpx; background: #f4f5f7; font-size: 28rpx; color: $sub; line-height: 84rpx; text-align: center; border-radius: 999rpx; }
.sheet__btn--primary { margin-left: 16rpx; background: $brand; font-weight: 600; color: #fff; }
</style>
<template>
  <view class="page">
    <view class="header">
      <view class="header__btn" @click="goBack">
        <acc-icon name="close" :size="34" color="#6B7280" />
      </view>
      <view class="type">
        <text class="type__item" v-for="item in typeOptions" :key="item.value"
              :class="{ 'type__item--active': billType === item.value }"
              @click="switchType(item.value)">{{ item.label }}</text>
      </view>
      <view class="header__btn" />
    </view>

    <view class="transfer" v-if="isTransfer">
      <view class="transfer__side" @click="openSheet('from')">
        <text class="transfer__label">从</text>
        <text class="transfer__value">{{ accountName(fromAccountId) }}</text>
      </view>
      <view class="transfer__arrow">
        <acc-icon name="transfer" :size="40" color="#1AA86C" />
      </view>
      <view class="transfer__side" @click="openSheet('to')">
        <text class="transfer__label">到</text>
        <text class="transfer__value">{{ accountName(toAccountId) }}</text>
      </view>
    </view>

    <scroll-view class="grid-scroll" scroll-y v-else>
      <view class="grid">
        <view class="grid__item" v-for="item in categories" :key="item.categoryId"
              @click="chooseCategory(item)">
          <view class="grid__ring" :class="{ 'grid__ring--active': categoryId === item.categoryId }">
            <image class="grid__photo" :src="categoryImage(item)" mode="aspectFill" />
          </view>
          <text class="grid__name" :class="{ 'grid__name--active': categoryId === item.categoryId }">
            {{ item.categoryName }}
          </text>
        </view>
        <view class="grid__item" @click="goCategory">
          <view class="grid__manage">
            <acc-icon name="sliders" :size="40" color="#9CA3AF" />
          </view>
          <text class="grid__name">管理</text>
        </view>
      </view>
      <view class="grid__tip" v-if="categories.length === 0">还没有分类，点「管理」新建</view>
    </scroll-view>

    <view class="panel">
      <view class="toolbar">
        <picker mode="date" :value="billDate" @change="onDateChange">
          <view class="tool">
            <acc-icon name="calendar" :size="26" color="#6B7280" />
            <text class="tool__text">{{ dateText }}</text>
          </view>
        </picker>
        <view class="tool" v-if="!isTransfer" @click="openSheet('account')">
          <acc-icon name="wallet" :size="26" color="#6B7280" />
          <text class="tool__text">{{ accountName(accountId) }}</text>
        </view>
        <view class="tool" @click="openSheet('repeat')">
          <acc-icon name="repeat" :size="26" color="#6B7280" />
          <text class="tool__text" :class="{ 'tool__text--active': repeatType }">{{ repeatLabel }}</text>
        </view>
        <view class="tool" @click="pickImage">
          <acc-icon name="camera" :size="26" color="#6B7280" />
          <text class="tool__text">{{ imageLabel }}</text>
        </view>
      </view>
      <view class="toolbar">
        <view class="tool" @click="openSheet('tag')">
          <acc-icon name="tag" :size="26" color="#6B7280" />
          <text class="tool__text">{{ tag || '标签' }}</text>
        </view>
        <view class="tool" @click="openSheet('remark')">
          <acc-icon name="note" :size="26" color="#6B7280" />
          <text class="tool__text">{{ remarkLabel }}</text>
        </view>
      </view>

      <view class="thumbs" v-if="images.length">
        <view class="thumb" v-for="(img, index) in images" :key="img">
          <image class="thumb__img" :src="img" mode="aspectFill" />
          <view class="thumb__del" @click="removeImage(index)">
            <acc-icon name="close" :size="18" color="#FFFFFF" />
          </view>
        </view>
      </view>

      <view class="amount">
        <text class="amount__expr">{{ exprDisplay }}</text>
        <text class="amount__value">{{ amountDisplay }}</text>
      </view>

      <view class="keypad">
        <view class="key" v-for="key in keys" :key="key.label" :class="key.cls" @click="onKey(key.value)">
          {{ key.label }}
        </view>
      </view>
      <view class="safe-bottom" />
    </view>

    <view class="sheet-mask" v-if="sheet" @click="closeSheet">
      <view class="sheet" @click.stop>
        <view class="sheet__head">
          <text class="sheet__title">{{ sheetTitle }}</text>
          <view class="header__btn" @click="closeSheet">
            <acc-icon name="close" :size="28" color="#9CA3AF" />
          </view>
        </view>
        <view class="sheet__body">
          <view v-if="isAccountSheet">
            <view class="sheet__item" v-for="item in accounts" :key="item.accountId" @click="chooseAccount(item)">
              <acc-icon name="wallet" :size="34" color="#1AA86C" />
              <text class="sheet__item-name">{{ item.accountName }}</text>
              <text class="sheet__item-value">¥ {{ formatMoney(item.balance) }}</text>
            </view>
            <view class="grid__tip" v-if="accounts.length === 0">暂无账户，请先在「资产」页添加</view>
          </view>
          <view v-if="sheet === 'repeat'">
            <view class="sheet__item" v-for="item in repeatOptions" :key="item.value" @click="chooseRepeat(item)">
              <text class="sheet__item-name">{{ item.label }}</text>
              <acc-icon name="check" :size="28" color="#1AA86C" v-if="repeatType === item.value" />
            </view>
            <view class="sheet__tip">选择后本次仍照常入账，之后按周期自动补记</view>
          </view>
          <view v-if="sheet === 'tag'">
            <input class="sheet__input" v-model="tagDraft" placeholder="输入标签，最多 4 个字" maxlength="4" />
            <view class="sheet__actions">
              <view class="sheet__btn" @click="clearTag">清空</view>
              <view class="sheet__btn sheet__btn--primary" @click="confirmTag">确定</view>
            </view>
          </view>
          <view v-if="sheet === 'remark'">
            <textarea class="sheet__area" v-model="remarkDraft" placeholder="备注（可选）" maxlength="60" />
            <view class="sheet__actions">
              <view class="sheet__btn" @click="clearRemark">清空</view>
              <view class="sheet__btn sheet__btn--primary" @click="confirmRemark">确定</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
/**
 * 组件名称：account/add
 * 功能描述：记账页，支持支出、收入、转账三种类型，含分类九宫格、自绘计算键盘与周期记账
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  billType      - 账单类型（0支出 1收入 2转账）
 * @data {String}  expr          - 键盘输入的金额表达式
 * @data {Number}  categoryId    - 选中的分类
 * @data {Number}  accountId     - 选中的账户
 * @data {Number}  fromAccountId - 转账转出账户
 * @data {Number}  toAccountId   - 转账转入账户
 * @data {String}  tag           - 标签
 * @data {String}  remark        - 备注
 * @data {String}  billDate      - 账单日期
 * @data {Array}   images        - 已上传的凭证图片
 * @data {Array}   categories    - 当前类型的分类列表
 * @data {Array}   accounts      - 账户列表
 * @data {Number}  billId        - 编辑模式下的账单ID
 * @data {String}  repeatType    - 重复周期
 * @data {String}  sheet         - 当前弹出的面板
 *
 * 事件说明：
 * @event switchType      - 切换账单类型
 * @event chooseCategory  - 选择分类
 * @event onKey           - 处理键盘按键
 * @event save            - 校验并保存账单
 * @event openSheet       - 打开底部选择面板
 * @event closeSheet      - 关闭底部选择面板
 * @event chooseAccount   - 选择账户
 * @event chooseRepeat    - 选择重复周期
 * @event confirmTag      - 确认标签
 * @event confirmRemark   - 确认备注
 * @event pickImage       - 选择并上传凭证图片
 * @event removeImage     - 删除某张凭证图片
 * @event loadCategories  - 加载分类
 * @event loadAccounts    - 加载账户
 * @event loadBill        - 加载待编辑账单
 * @event calcValue       - 计算金额表达式
 * @event goBack          - 返回上一页
 * @event goCategory      - 进入分类管理
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      初始创建
 * 2026/10/28     郑朝军      按参考产品重做分类九宫格与键盘区，改用 Unsplash 图片
 */
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { formatMoney, formatDate } from '@/utils/account/format.js'
import { categoryPhoto } from '@/utils/account/photos.js'
import {
  addBill,
  addRecurring,
  updateBill,
  getBillDetail,
  getCategoryList,
  getAccountList,
  uploadImage
} from '@/utils/account/api.js'

const typeOptions = [
  { label: '支出', value: '0' },
  { label: '收入', value: '1' },
  { label: '转账', value: '2' }
]

const repeatOptions = [
  { label: '不重复', value: '' },
  { label: '每天', value: '0' },
  { label: '每周', value: '1' },
  { label: '每月', value: '2' },
  { label: '每年', value: '3' }
]

const keys = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '⌫', value: 'del', cls: 'key--fn' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '+', value: '+', cls: 'key--fn' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '−', value: '-', cls: 'key--fn' },
  { label: '.', value: '.' },
  { label: '0', value: '0' },
  { label: '=', value: '=', cls: 'key--fn' },
  { label: '完成', value: 'done', cls: 'key--done' }
]

const sheetTitles = {
  account: '选择账户',
  from: '转出账户',
  to: '转入账户',
  tag: '添加标签',
  remark: '添加备注',
  repeat: '重复周期'
}

const billType = ref('0')
const expr = ref('')
const categoryId = ref(null)
const accountId = ref(null)
const fromAccountId = ref(null)
const toAccountId = ref(null)
const tag = ref('')
const remark = ref('')
const billDate = ref(formatDate(new Date()))
const images = ref([])
const categories = ref([])
const accounts = ref([])
const billId = ref(null)
const repeatType = ref('')
const sheet = ref('')
const tagDraft = ref('')
const remarkDraft = ref('')
const saving = ref(false)

const isTransfer = computed(() => billType.value === '2')
const isAccountSheet = computed(() => ['account', 'from', 'to'].includes(sheet.value))
const sheetTitle = computed(() => sheetTitles[sheet.value] || '')
const dateText = computed(() =>
{
  const value = billDate.value
  if (value === formatDate(new Date()))
  {
    return '今天'
  }

  return value.slice(5).replace('-', '/')
})
const exprDisplay = computed(() => (/[+\-]/.test(expr.value.replace(/^-/, '')) ? expr.value : ''))
const amountDisplay = computed(() =>
{
  const value = calcValue(expr.value)

  return Number.isFinite(value) && value > 0 ? formatMoney(value) : '0.00'
})
const repeatLabel = computed(() =>
{
  const target = repeatOptions.find((item) => item.value === repeatType.value)

  return target && repeatType.value ? target.label : '重复'
})
const imageLabel = computed(() => (images.value.length ? `图片·${images.value.length}` : '图片'))
const remarkLabel = computed(() => (remark.value ? `备注·${remark.value.slice(0, 4)}` : '备注'))

/**
 * 取分类图片地址
 * @param {Object} item 分类
 * @returns {String} 图片地址
 */
function categoryImage(item)
{
  return categoryPhoto(item.categoryName)
}

/**
 * 取账户名称
 * @param {Number} id 账户ID
 * @returns {String} 账户名称
 */
function accountName(id)
{
  const target = accounts.value.find((item) => item.accountId === id)

  return target ? target.accountName : '选择账户'
}

/**
 * 计算表达式结果，采用调度场算法，避免使用 eval
 * @param {String} raw 表达式字符串
 * @returns {Number} 计算结果，非法表达式返回 NaN
 */
function calcValue(raw)
{
  const source = String(raw || '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  if (!source)
  {
    return 0
  }
  if (!/^[\d+\-*/.]+$/.test(source))
  {
    return NaN
  }
  const tokens = source.match(/\d+(?:\.\d*)?|\.\d+|[+\-*/]/g)
  if (!tokens)
  {
    return NaN
  }
  const priority = { '+': 1, '-': 1, '*': 2, '/': 2 }
  const output = []
  const operators = []
  tokens.forEach((token) =>
  {
    if (/^[\d.]/.test(token))
    {
      output.push(Number(token))

      return
    }
    while (operators.length && priority[operators[operators.length - 1]] >= priority[token])
    {
      output.push(operators.pop())
    }
    operators.push(token)
  })
  while (operators.length)
  {
    output.push(operators.pop())
  }
  const stack = []
  for (const token of output)
  {
    if (typeof token === 'number')
    {
      stack.push(token)

      continue
    }
    const right = stack.pop()
    const left = stack.pop()
    if (left === undefined || right === undefined)
    {
      return NaN
    }
    if (token === '+')
    {
      stack.push(left + right)
    }
    else if (token === '-')
    {
      stack.push(left - right)
    }
    else if (token === '*')
    {
      stack.push(left * right)
    }
    else if (right === 0)
    {
      return NaN
    }
    else
    {
      stack.push(left / right)
    }
  }
  const result = stack.pop()

  return Number.isFinite(result) ? Math.round(result * 100) / 100 : NaN
}

/**
 * 计算下一次执行日期，避免与本次手动入账重复
 * @param {String} ruleType 0每天 1每周 2每月 3每年
 * @returns {String} 下次执行日期
 */
function nextRunDate(ruleType)
{
  const next = new Date(`${billDate.value}T00:00:00`)
  if (ruleType === '0')
  {
    next.setDate(next.getDate() + 1)
  }
  else if (ruleType === '1')
  {
    next.setDate(next.getDate() + 7)
  }
  else if (ruleType === '2')
  {
    next.setMonth(next.getMonth() + 1)
  }
  else
  {
    next.setFullYear(next.getFullYear() + 1)
  }

  return formatDate(next)
}

/**
 * 切换账单类型
 * @param {String} value 账单类型
 * @returns {void}
 */
function switchType(value)
{
  if (billType.value === value)
  {
    return
  }
  billType.value = value
  categoryId.value = null
  if (value !== '2')
  {
    loadCategories()
  }
}

/**
 * 选择分类
 * @param {Object} item 分类
 * @returns {void}
 */
function chooseCategory(item)
{
  categoryId.value = item.categoryId
}

/**
 * 处理日期变更
 * @param {Object} event 选择器事件
 * @returns {void}
 */
function onDateChange(event)
{
  billDate.value = event.detail.value
}

/**
 * 处理键盘按键
 * @param {String} value 按键值
 * @returns {void}
 */
function onKey(value)
{
  if (value === 'del')
  {
    expr.value = expr.value.slice(0, -1)

    return
  }
  if (value === '=')
  {
    const result = calcValue(expr.value)
    if (Number.isFinite(result))
    {
      expr.value = String(result)
    }

    return
  }
  if (value === 'done')
  {
    save()

    return
  }
  if (/[+\-]/.test(value))
  {
    if (!expr.value)
    {
      return
    }
    if (/[+\-]$/.test(expr.value))
    {
      expr.value = expr.value.slice(0, -1) + value

      return
    }
    expr.value += value

    return
  }
  const segments = expr.value.split(/[+\-]/)
  const last = segments[segments.length - 1]
  if (value === '.')
  {
    if (last.includes('.'))
    {
      return
    }
    expr.value += last === '' ? '0.' : '.'

    return
  }
  if (last.replace('.', '').length >= 8)
  {
    return
  }
  expr.value += value
}

/**
 * 打开底部选择面板
 * @param {String} type 面板类型
 * @returns {void}
 */
function openSheet(type)
{
  sheet.value = type
  if (type === 'tag')
  {
    tagDraft.value = tag.value
  }
  if (type === 'remark')
  {
    remarkDraft.value = remark.value
  }
}

/**
 * 关闭底部选择面板
 * @returns {void}
 */
function closeSheet()
{
  sheet.value = ''
}

/**
 * 选择账户
 * @param {Object} item 账户
 * @returns {void}
 */
function chooseAccount(item)
{
  if (sheet.value === 'from')
  {
    fromAccountId.value = item.accountId
  }
  else if (sheet.value === 'to')
  {
    toAccountId.value = item.accountId
  }
  else
  {
    accountId.value = item.accountId
  }
  closeSheet()
}

/**
 * 选择重复周期
 * @param {Object} item 周期项
 * @returns {void}
 */
function chooseRepeat(item)
{
  repeatType.value = item.value
  closeSheet()
}

/**
 * 确认标签
 * @returns {void}
 */
function confirmTag()
{
  tag.value = tagDraft.value.trim()
  closeSheet()
}

/**
 * 清空标签
 * @returns {void}
 */
function clearTag()
{
  tagDraft.value = ''
  tag.value = ''
  closeSheet()
}

/**
 * 确认备注
 * @returns {void}
 */
function confirmRemark()
{
  remark.value = remarkDraft.value.trim()
  closeSheet()
}

/**
 * 清空备注
 * @returns {void}
 */
function clearRemark()
{
  remarkDraft.value = ''
  remark.value = ''
  closeSheet()
}

/**
 * 选择并上传凭证图片
 * @returns {void}
 */
function pickImage()
{
  if (images.value.length >= 3)
  {
    uni.showToast({ title: '最多 3 张图片', icon: 'none' })

    return
  }
  uni.chooseImage({
    count: 3 - images.value.length,
    sizeType: ['compressed'],
    success: async (res) =>
    {
      uni.showLoading({ title: '上传中', mask: true })
      try
      {
        for (const path of res.tempFilePaths)
        {
          const url = await uploadImage(path)
          images.value.push(url)
        }
      }
      catch (error)
      {
        uni.showToast({ title: '上传失败', icon: 'none' })
      }
      finally
      {
        uni.hideLoading()
      }
    }
  })
}

/**
 * 删除某张凭证图片
 * @param {Number} index 图片下标
 * @returns {void}
 */
function removeImage(index)
{
  images.value.splice(index, 1)
}

/**
 * 返回上一页
 * @returns {void}
 */
function goBack()
{
  uni.navigateBack()
}

/**
 * 进入分类管理
 * @returns {void}
 */
function goCategory()
{
  uni.navigateTo({ url: `/pages/account/category?type=${billType.value}` })
}

/**
 * 加载分类
 * @returns {Promise<void>}
 */
async function loadCategories()
{
  try
  {
    const res = await getCategoryList(billType.value)
    categories.value = res.data || []
    if (!categories.value.some((item) => item.categoryId === categoryId.value))
    {
      categoryId.value = categories.value.length ? categories.value[0].categoryId : null
    }
  }
  catch (error)
  {
    categories.value = []
  }
}

/**
 * 加载账户
 * @returns {Promise<void>}
 */
async function loadAccounts()
{
  try
  {
    const res = await getAccountList()
    accounts.value = (res.data && res.data.accounts) || []
    if (!accountId.value && accounts.value.length)
    {
      accountId.value = accounts.value[0].accountId
    }
    if (!fromAccountId.value && accounts.value.length)
    {
      fromAccountId.value = accounts.value[0].accountId
    }
    if (!toAccountId.value && accounts.value.length > 1)
    {
      toAccountId.value = accounts.value[1].accountId
    }
  }
  catch (error)
  {
    accounts.value = []
  }
}

/**
 * 加载待编辑账单
 * @param {Number} id 账单ID
 * @returns {Promise<void>}
 */
async function loadBill(id)
{
  try
  {
    const res = await getBillDetail(id)
    const row = res.data
    if (!row)
    {
      return
    }
    billType.value = row.billType
    expr.value = String(row.amount || '')
    categoryId.value = row.categoryId
    accountId.value = row.accountId
    fromAccountId.value = row.accountId
    toAccountId.value = row.toAccountId
    tag.value = row.tag || ''
    remark.value = row.remark || ''
    billDate.value = String(row.billDate || '').slice(0, 10)
    images.value = row.images ? JSON.parse(row.images) : []
  }
  catch (error)
  {
    uni.showToast({ title: '账单加载失败', icon: 'none' })
  }
}

/**
 * 校验并保存账单
 * @returns {Promise<void>}
 */
async function save()
{
  if (saving.value)
  {
    return
  }
  const amount = calcValue(expr.value)
  if (!Number.isFinite(amount) || amount <= 0)
  {
    uni.showToast({ title: '请输入正确金额', icon: 'none' })

    return
  }
  if (!isTransfer.value && !categoryId.value)
  {
    uni.showToast({ title: '请选择分类', icon: 'none' })

    return
  }
  if (isTransfer.value)
  {
    if (!fromAccountId.value || !toAccountId.value)
    {
      uni.showToast({ title: '请选择转出与转入账户', icon: 'none' })

      return
    }
    if (fromAccountId.value === toAccountId.value)
    {
      uni.showToast({ title: '转出与转入账户不能相同', icon: 'none' })

      return
    }
  }
  else if (!accountId.value)
  {
    uni.showToast({ title: '请选择账户', icon: 'none' })

    return
  }

  const payload = {
    billType: billType.value,
    amount: Number(amount.toFixed(2)),
    billDate: billDate.value,
    categoryId: isTransfer.value ? null : categoryId.value,
    accountId: isTransfer.value ? fromAccountId.value : accountId.value,
    toAccountId: isTransfer.value ? toAccountId.value : null,
    tag: tag.value || null,
    remark: remark.value || null,
    images: images.value.length ? JSON.stringify(images.value) : null
  }
  if (billId.value)
  {
    payload.billId = billId.value
  }

  saving.value = true
  try
  {
    if (billId.value)
    {
      await updateBill(payload)
    }
    else
    {
      await addBill(payload)
    }
    if (repeatType.value && !billId.value)
    {
      const category = categories.value.find((item) => item.categoryId === categoryId.value) || {}
      const startDate = nextRunDate(repeatType.value)
      await addRecurring({
        title: `${isTransfer.value ? '转账' : category.categoryName || '记账'} · 周期`,
        billType: billType.value,
        amount: Number(amount.toFixed(2)),
        categoryId: payload.categoryId,
        accountId: payload.accountId,
        toAccountId: payload.toAccountId,
        ruleType: repeatType.value,
        intervalNum: 1,
        dayOfMonth: Number(startDate.slice(8, 10)),
        startDate,
        remark: payload.remark
      })
    }
    uni.showToast({ title: billId.value ? '已保存' : '记账成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  }
  catch (error)
  {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
  finally
  {
    saving.value = false
  }
}

onLoad(async (options) =>
{
  const query = options || {}
  if (query.billId)
  {
    billId.value = Number(query.billId)
  }
  if (query.billType)
  {
    billType.value = String(query.billType)
  }
  await loadAccounts()
  if (billId.value)
  {
    await loadBill(billId.value)
    if (!isTransfer.value)
    {
      await loadCategories()
    }

    return
  }
  await loadCategories()
  if (query.amount)
  {
    expr.value = String(query.amount)
  }
  if (query.categoryId)
  {
    categoryId.value = Number(query.categoryId)
  }
  if (query.accountId)
  {
    accountId.value = Number(query.accountId)
    fromAccountId.value = Number(query.accountId)
  }
  if (query.billDate)
  {
    billDate.value = String(query.billDate)
  }
  if (query.remark)
  {
    remark.value = decodeURIComponent(String(query.remark))
  }
})
</script>

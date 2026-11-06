<style lang="scss" scoped>
$primary: #1aa86c;
$text-main: #1f2430;
$text-sub: #8a8f9c;
.page { position: relative; display: flex; overflow: hidden; flex-direction: column; box-sizing: border-box; width: 100%; height: 100%; min-height: 0; padding: 24rpx; background: #f4f5f7; }
.search-bar { position: relative; display: flex; flex-direction: row; align-items: center; box-sizing: border-box; width: 100%; padding: 16rpx 24rpx; background: #ffffff; box-shadow: 0 4rpx 18rpx rgba(31, 36, 48, 0.05); border-radius: 999rpx; }
.search-bar__icon { position: relative; flex-shrink: 0; width: 34rpx; height: 34rpx; margin-right: 14rpx; }
.search-bar__input { position: relative; flex: 1; min-width: 0; height: 56rpx; font-size: 26rpx; font-weight: 400; color: $text-main; }
.search-bar__placeholder { font-size: 26rpx; color: #c8ccd2; }
.search-bar__button { position: relative; flex-shrink: 0; box-sizing: border-box; padding: 8rpx 0 8rpx 20rpx; font-size: 26rpx; font-weight: 600; color: $primary; }
.filters { position: relative; display: flex; flex-direction: row; box-sizing: border-box; width: 100%; padding: 20rpx 0; }
.chip { position: relative; box-sizing: border-box; padding: 10rpx 26rpx; background: #ffffff; font-size: 23rpx; font-weight: 400; color: $text-sub; border-radius: 999rpx; margin-right: 14rpx; }
.chip--active { position: relative; box-sizing: border-box; padding: 10rpx 26rpx; background: $primary; font-size: 23rpx; font-weight: 600; color: #ffffff; border-radius: 999rpx; margin-right: 14rpx; }
.result { position: relative; flex: 1; min-height: 0; }
.bill { position: relative; display: flex; flex-direction: row; align-items: center; box-sizing: border-box; width: 100%; padding: 22rpx 24rpx; background: #ffffff; box-shadow: 0 4rpx 18rpx rgba(31, 36, 48, 0.04); border-radius: 24rpx; margin-bottom: 14rpx; }
.bill__icon-wrap { position: relative; display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 78rpx; height: 78rpx; border-radius: 24rpx; margin-right: 18rpx; }
.bill__icon { position: relative; width: 42rpx; height: 42rpx; }
.bill__emoji { position: relative; font-size: 34rpx; font-weight: 400; color: $text-sub; }
.bill__info { position: relative; display: flex; overflow: hidden; flex: 1; flex-direction: column; min-width: 0; }
.bill__name { position: relative; overflow: hidden; font-size: 28rpx; font-weight: 500; color: $text-main; white-space: nowrap; text-overflow: ellipsis; }
.bill__sub { position: relative; overflow: hidden; font-size: 21rpx; font-weight: 400; color: $text-sub; white-space: nowrap; text-overflow: ellipsis; margin-top: 6rpx; }
.bill__right { position: relative; display: flex; flex-direction: column; flex-shrink: 0; align-items: flex-end; margin-left: 16rpx; }
.bill__amount { position: relative; font-size: 30rpx; font-weight: 600; color: $text-main; }
.bill__amount--income { position: relative; font-size: 30rpx; font-weight: 600; color: $primary; }
.bill__date { position: relative; font-size: 19rpx; font-weight: 400; color: #b6bac4; margin-top: 4rpx; }
.empty { position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: 100%; padding: 100rpx 0; }
.empty__text { position: relative; font-size: 24rpx; font-weight: 400; color: #b6bac4; }
.more { position: relative; box-sizing: border-box; width: 100%; padding: 20rpx 0; font-size: 21rpx; font-weight: 400; color: #b6bac4; text-align: center; }
.holder { position: relative; width: 100%; height: 40rpx; }
</style>
<template>
  <view class="page">
    <view class="search-bar">
      <image class="search-bar__icon" :src="iconSearch" />
      <input
        v-model="keyword"
        class="search-bar__input"
        placeholder="搜索分类、标签、备注、金额"
        placeholder-class="search-bar__placeholder"
        confirm-type="search"
        @confirm="doSearch" />
      <text class="search-bar__button" @click="doSearch">搜索</text>
    </view>

    <view class="filters">
      <text v-for="item in typeOptions" :key="item.value" :class="getTypeClass(item.value)" @click="switchType(item.value)">{{ item.label }}</text>
    </view>

    <scroll-view scroll-y class="result">
      <view v-if="loading" class="empty">
        <text class="empty__text">搜索中…</text>
      </view>
      <view v-else-if="bills.length === 0" class="empty">
        <text class="empty__text">{{ keyword ? '没有找到匹配的账单' : '输入关键字开始搜索' }}</text>
      </view>
      <view v-for="bill in bills" :key="bill.billId" class="bill" @click="editBill(bill)">
        <view class="bill__icon-wrap" :style="getIconWrapStyle(bill)">
          <image v-if="getIconSource(bill)" class="bill__icon" :src="getIconSource(bill)" />
          <text v-else class="bill__emoji">{{ bill.billType === '2' ? '🔄' : bill.categoryIcon || '📦' }}</text>
        </view>
        <view class="bill__info">
          <text class="bill__name">{{ title(bill) }}</text>
          <text class="bill__sub">{{ sub(bill) }}</text>
        </view>
        <view class="bill__right">
          <text :class="getAmountClass(bill)">{{ getAmountText(bill) }}</text>
          <text class="bill__date">{{ (bill.billDate || '').slice(5) }}</text>
        </view>
      </view>
      <view v-if="bills.length && total > bills.length" class="more">共 {{ total }} 条，已显示前 {{ bills.length }} 条</view>
      <view class="holder" />
    </scroll-view>
  </view>
</template>
<script>
/**
 * 组件名称：accountSearch
 * 功能说明：账单搜索页，支持按关键字与收支类型筛选账单，点击结果进入编辑
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  keyword     - 搜索关键字
 * @data {String}  billType    - 账单类型筛选（空为全部）
 * @data {Array}   bills       - 搜索结果列表
 * @data {Number}  total       - 命中总条数
 * @data {Boolean} loading     - 是否正在搜索
 * @data {Array}   typeOptions - 账单类型筛选项
 *
 * 事件说明：
 * @event doSearch        - 按关键字与类型执行搜索
 * @event switchType      - 切换账单类型筛选
 * @event editBill        - 跳转账单编辑页面
 * @event title           - 返回账单主标题
 * @event sub             - 返回账单副标题
 * @event formatMoney     - 金额千分位格式化
 * @event hexToRgba       - 十六进制颜色转 rgba
 * @event getTypeClass    - 返回类型筛选项样式类名
 * @event getAmountClass  - 返回金额文本样式类名
 * @event getAmountText   - 返回带符号的金额文本
 * @event getIconWrapStyle- 返回账单图标容器样式
 * @event getIconSource   - 返回账单分类图标SVG地址，emoji图标返回空串
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      按鲨鱼记账风格调整视觉与编码规范，功能逻辑保持不变
 */
import { getBillList } from '@/utils/account/api.js'
import ICONS from '@/utils/account/icons.js'

const CATEGORY_ICONS = ['food', 'car', 'cart', 'home', 'game', 'medical', 'book', 'gift', 'more', 'salary', 'award', 'invest', 'work', 'redpacket', 'bike', 'paw', 'donate', 'inbox']

export default
{
  data()
  {
    return {
      keyword: '',
      billType: '',
      bills: [],
      total: 0,
      loading: false,
      typeOptions: [
        { label: '全部', value: '' },
        { label: '支出', value: '0' },
        { label: '收入', value: '1' },
        { label: '转账', value: '2' }
      ]
    }
  },

  computed:
  {
    /**
     * 搜索框图标路径
     * @returns {String} 图标路径
     */
    iconSearch()
    {
      return ICONS['search-gray']
    }
  },

  methods:
  {
    /**
     * 按关键字与类型执行搜索
     * @returns {Promise<void>}
     */
    async doSearch()
    {
      this.loading = true
      try
      {
        const params = { pageNum: 1, pageSize: 50 }
        if (this.keyword.trim())
        {
          params.keyword = this.keyword.trim()
        }
        if (this.billType)
        {
          params.billType = this.billType
        }
        const result = await getBillList(params)
        this.bills = result.rows || []
        this.total = result.total || this.bills.length
      }
      catch (error)
      {
        this.bills = []
        this.total = 0
      }
      finally
      {
        this.loading = false
      }
    },

    /**
     * 切换账单类型筛选
     * @param {String} value 类型标识
     * @returns {void}
     */
    switchType(value)
    {
      this.billType = value
      this.doSearch()
    },

    /**
     * 跳转账单编辑页面
     * @param {Object} bill 账单对象
     * @returns {void}
     */
    editBill(bill)
    {
      uni.navigateTo({ url: `/pages/account/add?billId=${bill.billId}` })
    },

    /**
     * 返回账单主标题
     * @param {Object} bill 账单对象
     * @returns {String} 主标题
     */
    title(bill)
    {
      if (bill.billType === '2')
      {
        return `${bill.accountName || '账户'} → ${bill.toAccountName || '账户'}`
      }

      return bill.categoryName || '未分类'
    },

    /**
     * 返回账单副标题
     * @param {Object} bill 账单对象
     * @returns {String} 副标题
     */
    sub(bill)
    {
      const parts = []
      if (bill.remark)
      {
        parts.push(bill.remark)
      }
      if (bill.billType === '2')
      {
        parts.push(`${bill.accountName || '账户'} → ${bill.toAccountName || '账户'}`)
      }
      else if (bill.accountName)
      {
        parts.push(bill.accountName)
      }
      if (bill.tag)
      {
        parts.push(`#${bill.tag}`)
      }

      return parts.join(' · ') || '无备注'
    },

    /**
     * 金额千分位格式化
     * @param {Number} value 金额
     * @returns {String} 格式化文本
     */
    formatMoney(value)
    {
      const num = Number(value || 0)
      const fixed = Math.abs(num).toFixed(2)
      const [intPart, decPart] = fixed.split('.')

      return `${num < 0 ? '-' : ''}${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`
    },

    /**
     * 十六进制颜色转 rgba
     * @param {String} hex 十六进制颜色
     * @param {Number} alpha 透明度
     * @returns {String} rgba 颜色
     */
    hexToRgba(hex, alpha)
    {
      const value = (hex || '#1AA86C').replace('#', '')
      const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value

      return `rgba(${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}, ${alpha})`
    },

    /**
     * 返回类型筛选项样式类名
     * @param {String} value 类型标识
     * @returns {String} 类名
     */
    getTypeClass(value)
    {
      return this.billType === value ? 'chip--active' : 'chip'
    },

    /**
     * 返回金额文本样式类名
     * @param {Object} bill 账单对象
     * @returns {String} 类名
     */
    getAmountClass(bill)
    {
      return bill.billType === '1' ? 'bill__amount--income' : 'bill__amount'
    },

    /**
     * 返回带符号的金额文本
     * @param {Object} bill 账单对象
     * @returns {String} 金额文本
     */
    getAmountText(bill)
    {
      const sign = bill.billType === '1' ? '+' : bill.billType === '2' ? '' : '-'

      return `${sign}${this.formatMoney(bill.amount)}`
    },

    /**
     * 返回账单图标容器样式
     * @param {Object} bill 账单对象
     * @returns {Object} 样式对象
     */
    getIconWrapStyle(bill)
    {
      const color = bill.categoryColor || '#1AA86C'
      const isVector = CATEGORY_ICONS.includes(bill.categoryIcon)

      return { backgroundColor: isVector ? color : this.hexToRgba(color, 0.12) }
    },

    /**
     * 返回账单分类图标SVG地址，emoji图标返回空串
     * @param {Object} bill 账单对象
     * @returns {String} 图标地址
     */
    getIconSource(bill)
    {
      if (bill.billType === '2' || !CATEGORY_ICONS.includes(bill.categoryIcon))
      {
        return ''
      }

      return ICONS[bill.categoryIcon] || ICONS.wallet
    }
  }
}
</script>

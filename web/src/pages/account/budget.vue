<style lang="scss" scoped>
$primary: #1aa86c;
$danger: #f0524b;
$text-main: #1f2430;
$text-sub: #8a8f9c;
$line: #f0f1f4;
.page { position: relative; display: flex; flex-direction: column; box-sizing: border-box; width: 100%; min-height: 100vh; padding: 24rpx; background: #f4f5f7; overflow-x: hidden; }
.card { position: relative; display: flex; flex-direction: column; box-sizing: border-box; width: 100%; padding: 8rpx 28rpx 28rpx; background: #ffffff; box-shadow: 0 8rpx 32rpx rgba(31, 36, 48, 0.05); border-radius: 28rpx; margin-bottom: 24rpx; }
.card__head { position: relative; display: flex; flex-direction: row; align-items: baseline; justify-content: space-between; box-sizing: border-box; width: 100%; padding: 24rpx 0 10rpx; }
.card__title { position: relative; font-size: 28rpx; font-weight: 600; color: $text-main; }
.card__tip { position: relative; font-size: 20rpx; font-weight: 400; color: #b6bac4; }
.row { position: relative; display: flex; flex-direction: row; align-items: center; justify-content: space-between; box-sizing: border-box; width: 100%; padding: 26rpx 0; border-bottom: 1rpx solid $line; }
.row__label { position: relative; flex-shrink: 0; font-size: 28rpx; font-weight: 400; color: $text-main; }
.row__value { position: relative; font-size: 26rpx; font-weight: 400; color: $text-sub; }
.row__input { position: relative; flex: 1; min-width: 0; font-size: 32rpx; font-weight: 600; color: $text-main; text-align: right; margin-left: 24rpx; }
.row__placeholder { font-size: 32rpx; color: #dde0e6; }
.usage { position: relative; display: flex; flex-direction: row; justify-content: space-between; box-sizing: border-box; width: 100%; padding: 22rpx 0 12rpx; }
.usage__text { position: relative; font-size: 21rpx; font-weight: 400; color: $text-sub; }
.usage__text--over { position: relative; font-size: 21rpx; font-weight: 600; color: $danger; }
.track { position: relative; overflow: hidden; width: 100%; height: 12rpx; background: #eef0f3; border-radius: 999rpx; }
.track__fill { position: relative; height: 100%; background: $primary; border-radius: 999rpx; }
.track__fill--over { position: relative; height: 100%; background: $danger; border-radius: 999rpx; }
.cat { position: relative; display: flex; flex-direction: row; align-items: center; box-sizing: border-box; width: 100%; padding: 18rpx 0; border-bottom: 1rpx solid #f7f8fa; }
.cat--last { position: relative; display: flex; flex-direction: row; align-items: center; box-sizing: border-box; width: 100%; padding: 18rpx 0 6rpx; border-bottom: none; }
.cat__icon-wrap { position: relative; display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 68rpx; height: 68rpx; border-radius: 20rpx; margin-right: 18rpx; }
.cat__icon { position: relative; width: 100%; height: 100%; border-radius: inherit; }
.cat__info { position: relative; display: flex; overflow: hidden; flex: 1; flex-direction: column; min-width: 0; }
.cat__name { position: relative; overflow: hidden; font-size: 27rpx; font-weight: 400; color: $text-main; white-space: nowrap; text-overflow: ellipsis; }
.cat__used { position: relative; font-size: 20rpx; font-weight: 400; color: $text-sub; margin-top: 4rpx; }
.cat__input { position: relative; flex-shrink: 0; width: 180rpx; font-size: 27rpx; font-weight: 500; color: $text-main; text-align: right; margin-left: 16rpx; }
.cat__placeholder { font-size: 24rpx; color: #c8ccd2; }
.empty { position: relative; display: block; box-sizing: border-box; width: 100%; padding: 40rpx 0; font-size: 23rpx; font-weight: 400; color: #b6bac4; text-align: center; }
.footer { position: relative; width: 100%; margin-top: 12rpx; }
.footer__button { position: relative; width: 100%; height: 92rpx; background: linear-gradient(140deg, #1aa86c 0%, #35c98c 100%); font-size: 30rpx; font-weight: 600; line-height: 92rpx; color: #ffffff; text-align: center; box-shadow: 0 10rpx 26rpx rgba(26, 168, 108, 0.26); border-radius: 999rpx; }
.footer__button--disabled { position: relative; width: 100%; height: 92rpx; background: #c9ced6; font-size: 30rpx; font-weight: 600; line-height: 92rpx; color: #ffffff; text-align: center; border-radius: 999rpx; }
</style>
<template>
  <view class="page">
    <view class="card">
      <view class="row">
        <text class="row__label">月份</text>
        <picker mode="date" fields="month" :value="budgetMonth" @change="onMonthChange">
          <text class="row__value">{{ budgetMonth }} ›</text>
        </picker>
      </view>
      <view class="row">
        <text class="row__label">总预算</text>
        <input
          v-model="totalAmount"
          class="row__input"
          type="digit"
          placeholder="0.00"
          placeholder-class="row__placeholder" />
      </view>
      <view class="usage">
        <text class="usage__text">本月已支出 ¥{{ formatMoney(budget.totalUsed) }}</text>
        <text :class="getUsageClass()">剩余 ¥{{ formatMoney(restAmount) }}</text>
      </view>
      <view class="track">
        <view :class="getFillClass()" :style="getFillStyle()" />
      </view>
    </view>

    <view class="card">
      <view class="card__head">
        <text class="card__title">分类预算</text>
        <text class="card__tip">留空表示不单独限制</text>
      </view>
      <view v-for="(item, index) in categoryRows" :key="item.categoryId" :class="getCatClass(index)">
        <view class="cat__icon-wrap" :style="getIconWrapStyle(item)">
          <image class="cat__icon" :src="categoryImage(item)" mode="aspectFill" />
        </view>
        <view class="cat__info">
          <text class="cat__name">{{ item.categoryName }}</text>
          <text class="cat__used">已用 ¥{{ formatMoney(item.used) }}</text>
        </view>
        <input
          v-model="item.draft"
          class="cat__input"
          type="digit"
          placeholder="未设置"
          placeholder-class="cat__placeholder" />
      </view>
      <view v-if="categoryRows.length === 0" class="empty">暂无支出分类</view>
    </view>

    <view class="footer">
      <view :class="getSaveClass()" @click="save">{{ saving ? '保存中...' : '保存预算' }}</view>
    </view>
  </view>
</template>
<script>
/**
 * 组件名称：accountBudget
 * 功能说明：月度预算设置，支持设置总预算与各支出分类预算，并展示当月使用进度
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @data {String}  budgetMonth  - 当前预算月份（YYYY-MM）
 * @data {String}  totalAmount  - 总预算输入值
 * @data {Object}  budget       - 预算数据（totalAmount/totalUsed/categoryBudgets）
 * @data {Array}   categoryRows - 分类预算行数据
 * @data {Boolean} saving       - 是否正在保存
 *
 * 事件说明：
 * @event load           - 加载指定月份预算与分类使用情况
 * @event onMonthChange  - 切换预算月份
 * @event save           - 保存总预算与分类预算
 * @event formatMoney    - 金额千分位格式化
 * @event hexToRgba      - 十六进制颜色转 rgba
 * @event getUsageClass  - 返回剩余金额文本样式类名
 * @event getFillClass   - 返回进度条填充样式类名
 * @event getFillStyle   - 返回进度条填充宽度样式
 * @event getCatClass    - 返回分类行样式类名
 * @event getSaveClass   - 返回保存按钮样式类名
 * @event getIconWrapStyle - 返回分类图标容器样式
 * @event getIconSource  - 返回分类图标SVG地址，emoji图标返回空串
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      按鲨鱼记账风格调整视觉与编码规范，功能逻辑保持不变
 */
import { categoryPhoto } from '@/utils/account/photos.js'
import { getBudget, saveBudget, getCategoryList } from '@/utils/account/api.js'
import ICONS from '@/utils/account/icons.js'

const CATEGORY_ICONS = ['food', 'car', 'cart', 'home', 'game', 'medical', 'book', 'gift', 'more', 'salary', 'award', 'invest', 'work', 'redpacket', 'bike', 'paw', 'donate', 'inbox']

export default
{
  data()
  {
    const now = new Date()

    return {
      budgetMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      totalAmount: '',
      budget: { totalAmount: 0, totalUsed: 0, categoryBudgets: [] },
      categoryRows: [],
      saving: false
    }
  },

  computed:
  {
    /**
     * 预算总额（优先取输入值）
     * @returns {Number} 预算总额
     */
    budgetTotal()
    {
      return Number(this.totalAmount || this.budget.totalAmount || 0)
    },

    /**
     * 是否超支
     * @returns {Boolean} 是否超支
     */
    isOver()
    {
      return this.budgetTotal > 0 && Number(this.budget.totalUsed || 0) > this.budgetTotal
    },

    /**
     * 剩余可用金额
     * @returns {Number} 剩余金额
     */
    restAmount()
    {
      return Math.max(this.budgetTotal - Number(this.budget.totalUsed || 0), 0)
    },

    /**
     * 预算使用百分比
     * @returns {Number} 百分比
     */
    percent()
    {
      if (!this.budgetTotal)
      {
        return 0
      }

      return Math.min(100, Math.round((Number(this.budget.totalUsed || 0) / this.budgetTotal) * 100))
    }
  },

  /**
   * 页面加载时加载预算数据
   * @returns {void}
   */
  onLoad()
  {
    this.load()
  },

  methods:
  {
    /**
     * 取分类图片地址
     * @param {Object} item 分类预算
     * @returns {String} 图片地址
     */
    categoryImage(item)
    {
      return categoryPhoto(item.categoryName)
    },

    /**
     * 加载指定月份预算与分类使用情况
     * @returns {Promise<void>}
     */
    async load()
    {
      try
      {
        const result = await getBudget(this.budgetMonth)
        this.budget = result.data || { totalAmount: 0, totalUsed: 0, categoryBudgets: [] }
        this.totalAmount = this.budget.totalAmount ? String(this.budget.totalAmount) : ''
      }
      catch (error)
      {
        this.budget = { totalAmount: 0, totalUsed: 0, categoryBudgets: [] }
      }

      let categories = []
      try
      {
        const result = await getCategoryList('0')
        categories = result.data || []
      }
      catch (error)
      {
        categories = []
      }

      const budgetMap = new Map((this.budget.categoryBudgets || []).map((item) => [item.categoryId, item]))
      const usageMap = this.budget.categoryUsage || {}
      this.categoryRows = categories.map((item) =>
      {
        const existing = budgetMap.get(item.categoryId)

        return {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categoryIcon: item.icon,
          categoryColor: item.color,
          used: Number(usageMap[String(item.categoryId)] || 0),
          draft: existing && existing.amount ? String(existing.amount) : ''
        }
      })
    },

    /**
     * 切换预算月份
     * @param {Object} event picker 事件对象
     * @returns {void}
     */
    onMonthChange(event)
    {
      this.budgetMonth = event.detail.value.slice(0, 7)
      this.load()
    },

    /**
     * 保存总预算与分类预算
     * @returns {Promise<void>}
     */
    async save()
    {
      this.saving = true
      try
      {
        await saveBudget({
          budgetMonth: this.budgetMonth,
          categoryId: null,
          amount: Number(this.totalAmount || 0)
        })
        for (const item of this.categoryRows)
        {
          await saveBudget({
            budgetMonth: this.budgetMonth,
            categoryId: item.categoryId,
            amount: Number(item.draft || 0)
          })
        }
        uni.showToast({ title: '已保存', icon: 'success' })
        this.load()
      }
      catch (error)
      {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
      finally
      {
        this.saving = false
      }
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
     * 返回剩余金额文本样式类名
     * @returns {String} 类名
     */
    getUsageClass()
    {
      return this.isOver ? 'usage__text--over' : 'usage__text'
    },

    /**
     * 返回进度条填充样式类名
     * @returns {String} 类名
     */
    getFillClass()
    {
      return this.isOver ? 'track__fill--over' : 'track__fill'
    },

    /**
     * 返回进度条填充宽度样式
     * @returns {Object} 样式对象
     */
    getFillStyle()
    {
      return { width: `${this.percent}%` }
    },

    /**
     * 返回分类行样式类名
     * @param {Number} index 行索引
     * @returns {String} 类名
     */
    getCatClass(index)
    {
      return index === this.categoryRows.length - 1 ? 'cat--last' : 'cat'
    },

    /**
     * 返回保存按钮样式类名
     * @returns {String} 类名
     */
    getSaveClass()
    {
      return this.saving ? 'footer__button--disabled' : 'footer__button'
    },

    /**
     * 返回分类图标容器样式
     * @param {Object} item 分类行数据
     * @returns {Object} 样式对象
     */
    getIconWrapStyle(item)
    {
      const color = item.categoryColor || '#1AA86C'
      const isVector = CATEGORY_ICONS.includes(item.categoryIcon)

      return { backgroundColor: isVector ? color : this.hexToRgba(color, 0.12) }
    },

    /**
     * 返回分类图标SVG地址，emoji图标返回空串
     * @param {Object} item 分类行数据
     * @returns {String} 图标地址
     */
    getIconSource(item)
    {
      if (!CATEGORY_ICONS.includes(item.categoryIcon))
      {
        return ''
      }

      return ICONS[item.categoryIcon] || ICONS.wallet
    }
  }
}
</script>

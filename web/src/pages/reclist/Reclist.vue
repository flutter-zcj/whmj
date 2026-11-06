<style lang="scss" scoped>
.reclist-page { position: relative; width: 100%; min-height: 100vh; background: #f1f5f7; }
.reclist-search-panel { position: relative; width: 100%; padding: 16rpx 20rpx 0 20rpx; box-sizing: border-box; background: #f1f5f7; }
.reclist-search-row { position: relative; display: flex; align-items: center; gap: 12rpx; width: 100%; margin-bottom: 12rpx; }
.reclist-search-main { position: relative; flex: 1; min-width: 0; }
.reclist-content { position: relative; width: 100%; padding: 16rpx 20rpx; box-sizing: border-box; }
.reclist-card { position: relative; overflow: hidden; margin-bottom: 16rpx; background: #fff; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04); border-radius: 12rpx; transition: all 0.2s; }
.reclist-card:active { opacity: 0.95; transform: scale(0.98); }
.reclist-card-body { position: relative; padding: 20rpx 24rpx 0rpx 24rpx; }
.reclist-empty { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 220rpx; }
.reclist-empty-text { position: relative; font-size: 28rpx; color: #94a3b8; }
.reclist-bottom-placeholder { width: 100%; height: 132rpx; }
.reclist-batch-footer { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 110rpx; box-sizing: border-box; padding: 0 36rpx; padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); height: calc(110rpx + env(safe-area-inset-bottom)); background: #ffffff; box-shadow: 0 -4rpx 30rpx rgba(0, 0, 0, 0.08); }
.reclist-select-all { display: flex; align-items: center; gap: 16rpx; font-size: 28rpx; font-weight: 500; color: #475569; }
.reclist-custom-checkbox { display: flex; align-items: center; justify-content: center; width: 40rpx; height: 40rpx; border: 3rpx solid #cbd5e1; border-radius: 50%; transition: all 0.2s; }
.reclist-custom-checkbox.checked { background-color: #2196F3; border-color: #2196F3; }
.reclist-batch-actions { display: flex; align-items: center; gap: 16rpx; }
.reclist-batch-btn { padding: 18rpx 34rpx; border-radius: 40rpx; font-size: 28rpx; font-weight: 700; transition: all 0.2s; }
.reclist-batch-btn:active { transform: scale(0.95); opacity: 0.9; }
.reclist-batch-btn.cancel { background: #f1f5f9; color: #475569; }
.reclist-batch-btn.delete { background: #ef4444; color: #ffffff; box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.2); }
.reclist-batch-btn.delete.disabled { background: #fecaca; box-shadow: none; opacity: 0.8; }
.reclist-filter-btn { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 72rpx; height: 72rpx; background: #ffffff; border-radius: 36rpx; box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08); }
.reclist-filter-btn.active { background: #2563eb; }
.reclist-filter-popup { position: relative; display: flex; flex-direction: column; width: 680rpx; height: 100vh; background: #f5f5f5; }
.reclist-filter-popup-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx 16rpx; background: #ffffff; }
.reclist-filter-popup-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
.reclist-filter-popup-close { font-size: 28rpx; color: #94a3b8; padding: 8rpx 16rpx; }
.reclist-filter-body { flex: 1; overflow: hidden; }
</style>

<template>
  <view class="reclist-page">
    <z-paging
      ref="paging"
      v-model="recordList"
      @query="queryList"
    >
      <view class="reclist-search-panel" v-if="searchFlds.length > 0 || filterFlds.length > 0">
        <view class="reclist-search-row">
          <view class="reclist-search-main" v-if="searchFlds.length > 0">
            <up-search
              v-model="searchKeyword"
              :placeholder="getSearchPlaceholder()"
              @search="onSearchConfirm"
              @custom="onSearchConfirm"
              @clear="onSearchConfirm"
            />
          </view>
          <view
            v-if="filterFlds.length > 0"
            :class="['reclist-filter-btn', { 'active': hasActiveFilter }]"
            @click="onOpenFilter"
          >
            <uni-icons
              type="tune"
              :size="22"
              :color="hasActiveFilter ? '#ffffff' : '#475569'"
            />
          </view>
        </view>
      </view>
      <view class="reclist-content">
        <view
          class="reclist-empty"
          v-if="recordList.length === 0 && !isLoading"
        >
          <text class="reclist-empty-text">暂无数据</text>
        </view>
        <view
          class="reclist-card"
          :key="item.id"
          v-for="item in recordList"
          @click.stop="handleCardClick(item)"
          @longpress="onCardLongPress(item)"
        >
          <view class="reclist-card-body">
            <cx2-ismcard
              :attValue="item"
              :tabCfgName="tabCfgName"
              :padding="0"
              :elevation="0"
              :keyTextStyle="keyTextStyle"
              :valueTextStyle="valueTextStyle"
              :isEditMode="isEditMode"
              :isSelected="selectedIds.includes(item.id)"
              @select="onSelectChange"
              @action-click="onCardActionClick($event, item)"
            />
          </view>
        </view>
        <view v-if="isEditMode" class="reclist-bottom-placeholder"></view>
      </view>

      <template #bottom>
        <view v-if="isEditMode" class="reclist-batch-footer">
          <view class="reclist-select-all" @click="onSelectAll">
            <view :class="['reclist-custom-checkbox', { 'checked': isAllSelected }]">
              <uni-icons v-if="isAllSelected" type="checkmarkempty" size="14" color="#ffffff" />
            </view>
            <text>全选</text>
          </view>
          <view class="reclist-batch-actions">
            <view class="reclist-batch-btn cancel" @click="onEditComplete">完成</view>
            <view
              class="reclist-batch-btn delete"
              :class="{ 'disabled': selectedIds.length === 0 }"
              @click="onDeleteBatch"
            >
              删除{{ selectedIds.length > 0 ? `(${selectedIds.length})` : '' }}
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 更多筛选面板 -->
    <up-popup
      :show="filterPopupVisible"
      mode="right"
      :closeable="false"
      z-index="99"
      @close="onCloseFilter"
    >
      <view class="reclist-filter-popup">     
        <view class="reclist-filter-body">
          <cx2-filter
            :fields="filterFlds"
            v-model="filterValue"
            @search="onFilterSearch"
            @reset="onFilterReset"
          />
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script>
/**
 * 组件名称：Reclist
 * 功能说明：通用记录卡片列表页面，基于 z-paging 实现下拉刷新和上拉加载更多，
 *          使用 cx2-ismcard 按 tabCfgName 配置渲染卡片字段
 * 研发时间：2026/06/22
 * 研发人员：郑朝军
 *
 * 参数说明：
 * @prop {Array} recordList - 记录列表数据
 * @prop {Number} total - 服务端数据总条数
 * @prop {Number} major - 业务主类型
 * @prop {Number} minor - 业务子类型
 * @prop {String} tabCfgName - 卡片字段配置名称，必传
 * @prop {Object} tabCfg - tabCfgName 对应的配置对象
 * @prop {Array} searchFlds - qrylevel 为1的顶部搜索字段
 * @prop {Array} filterFlds - qrylevel 为2的筛选面板字段
 * @prop {Object} filterValue - 筛选面板当前值 { colname: value }
 * @prop {String} searchKeyword - 顶部搜索关键字
 * @prop {Array} args - 查询条件集合
 * @prop {String} orderby - 排序表达式
 * @prop {String} targetPage - 卡片点击后跳转页面
 * @prop {Boolean} isLoading - 是否正在加载
 * @prop {Boolean} isEditMode - 是否处于批量编辑模式
 * @prop {Array} selectedIds - 已选中记录ID集合
 * @prop {Boolean} _hasFirstShow - 是否已首次显示
 *
 * 事件说明：
 * @event parseOptions - 解析路由参数
 * @event initTabCfg - 初始化 tabCfgName 配置
 * @event initSearchFlds - 初始化查询字段（顶部搜索 + 筛选面板）
 * @event getSearchFldList - 获取顶部关键字搜索字段
 * @event getFilterFldList - 获取筛选面板字段
 * @event resolveEntityByTab - 根据表名解析实体配置
 * @event queryList - z-paging 查询记录列表
 * @event buildQueryParams - 构建查询参数
 * @event buildQueryArgs - 构建合并后的查询条件
 * @event buildSearchArgs - 构建搜索查询条件（顶部关键字 + 筛选面板）
 * @event buildFilterArgs - 将 filterValue 转换为查询条件集合
 * @event normalizeBaseQueryArgs - 规范化外部查询条件
 * @event normalizeQueryArgGroup - 规范化单个查询条件分组
 * @event buildKeywordQueryArg - 构建顶部关键字查询条件
 * @event getFieldQueryOperator - 获取字段查询操作符
 * @event getFieldQueryValue - 获取字段查询值
 * @event isDateField - 判断字段是否为日期类型
 * @event buildDateRangeArgs - 构建日期范围查询条件
 * @event getSearchPlaceholder - 获取搜索输入提示
 * @event onSearchConfirm - 确认搜索
 * @event getResultList - 获取兼容格式的列表数据
 * @event getResultTotal - 获取兼容格式的总条数
 * @event handleCardClick - 点击卡片跳转详情
 * @event onCardLongPress - 长按卡片进入编辑模式
 * @event onSelectChange - 切换记录选中状态
 * @event onSelectAll - 全选或取消全选
 * @event onDeleteBatch - 批量删除记录
 * @event onCardActionClick - 处理卡片按钮插件
 * @event getDetailUrl - 获取详情页地址
 * @event parseJsonOption - 解析 JSON 路由参数
 * @event onOpenFilter - 打开筛选面板
 * @event onCloseFilter - 关闭筛选面板
 * @event onFilterSearch - 筛选面板确定
 * @event onFilterReset - 筛选面板重置
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/06/22     郑朝军       初始创建通用记录卡片列表页
 * 2026/06/24     郑朝军       根据字段 qrylevel 增加顶部搜索
 * 2026/06/25     郑朝军       集成 cx2-filter 更多筛选面板
 * 2026/06/30     郑朝军       优化 cx2-filter：日期字段显示为两个输入框，支持原生滚动
 */

 
export default
{
  name: 'Reclist',
  
  data()
  {
    return {
      recordList: [],
      total: 0,
      major: 0,
      minor: 0,
      tabCfgName: '',
      tabCfg: null,
      searchFlds: [],
      filterFlds: [],
      filterValue: {},
      filterPopupVisible: false,
      searchKeyword: '',
      args: [],
      orderby: 'id desc',
      targetPage: '/pages/attribute/SimpleAtt',
      isLoading: false,
      isEditMode: false,
      selectedIds: [],
      suppressNextClick: false,
      _hasFirstShow: false
    }
  },

  computed:
  {
    /**
     * 卡片字段名样式
     * @returns {Object} 样式对象
     */
    keyTextStyle()
    {
      return {
        color: '#64748b',
        fontSize: '26rpx'
      }
    },

    /**
     * 卡片字段值样式
     * @returns {Object} 样式对象
     */
    valueTextStyle()
    {
      return {
        color: '#1f2937',
        fontSize: '26rpx'
      }
    },

    /**
     * 当前页是否全选
     * @returns {Boolean} 是否已全选
     */
    isAllSelected()
    {
      const selectableIds = this.getSelectableIds()
      return selectableIds.length > 0 && selectableIds.every(id => this.selectedIds.includes(id))
    },

    /**
     * 是否有激活的筛选条件
     * @returns {Boolean}
     */
    hasActiveFilter()
    {
      return Object.values(this.filterValue).some(v => v !== undefined && v !== null && v !== '')
    }
  },

  /**
   * 页面加载
   * @param {Object} options - 路由参数对象
   */
  async onLoad(options)
  {
    this.parseOptions(options || {})
    await this.initTabCfg()
  },

  /**
   * 页面显示时刷新列表
   */
  onShow()
  {
    if (this._hasFirstShow && this.$refs.paging)
    {
      this.$refs.paging.reload()
    }
    this._hasFirstShow = true
  },

  methods:
  {
    /**
     * 解析路由参数
     * @param {Object} options - 路由参数对象
     */
    parseOptions(options)
    {
      this.tabCfgName = options.tabCfgName || options.tabCfgAttCardName || ''
      this.major = options.major ? Number(options.major) : 0
      this.minor = options.minor ? Number(options.minor) : 0
      this.orderby = options.orderby ? decodeURIComponent(options.orderby) : this.orderby
      this.targetPage = options.targetPage ? decodeURIComponent(options.targetPage) : this.targetPage
      this.args = this.parseJsonOption(options.args, [])

      if (options.title)
      {
        uni.setNavigationBarTitle({
          title: decodeURIComponent(options.title)
        })
      }
    },

    /**
     * 初始化 tabCfg 配置
     */
    async initTabCfg()
    {
      if (!this.tabCfgName)
      {
        uni.showToast({
          title: '缺少tabCfgName',
          icon: 'none'
        })
        return
      }

      const cfgList = uni.cxapp.InitSvrMethod.getTabcfg() || []
      this.tabCfg = cfgList.find(item => item.name === this.tabCfgName) || null

      if (!this.tabCfg)
      {
        uni.showToast({
          title: '未找到卡片配置',
          icon: 'none'
        })
        return
      }

      if ((!this.major || !this.minor) && this.tabCfg.tab)
      {
        const entity = this.resolveEntityByTab(this.tabCfg.tab)
        this.major = entity?.major || this.tabCfg.major || this.major
        this.minor = entity?.minor || this.tabCfg.minor || this.minor
      }

      if (!this.major || !this.minor)
      {
        this.major = this.tabCfg.major || 0
        this.minor = this.tabCfg.minor || 0
      }

      await this.initSearchFlds()
    },

    /**
     * 初始化查询字段，区分顶部搜索字段和筛选面板字段
     */
    async initSearchFlds()
    {
      this.searchFlds = this.getSearchFldList()
      this.filterFlds = this.getFilterFldList()
      
      // 为 disptype 等于 2 的字段加载选项
      await this.loadFieldOptionsForFilterFields(this.filterFlds)
      
      console.log('filterFlds', this.filterFlds)
    },

    /**
     * 获取当前表查询字段（qrylevel=1 且 disptype=1，用于顶部关键字搜索）
     * @returns {Array} 查询字段集合
     */
    getSearchFldList()
    {
      const tabName = this.tabCfg?.tab || ''
      const fldList = uni.cxapp.InitSvrMethod.getFld
        ? uni.cxapp.InitSvrMethod.getFld()
        : []
      return fldList
        .filter(field => field.tabname === tabName && Number(field.qrylevel) === 1 && Number(field.disptype) === 1)
        .sort((prev, next) =>
        {
          const levelDiff = Number(prev.qrylevel) - Number(next.qrylevel)
          if (levelDiff !== 0) return levelDiff
          return Number(prev.disporder || 0) - Number(next.disporder || 0)
        })
    },

    /**
     * 获取筛选面板字段（qrylevel>1，用于 cx2-filter 抽屉）
     * 为 disptype 等于 2 的字段设置 options 属性，通过 uni.cxapp.fldvalue.queryFldValueListAuto() 获取
     * @returns {Array} 筛选字段集合
     */
    getFilterFldList()
    {
      const tabName = this.tabCfg?.tab || ''
      const fldList = uni.cxapp.InitSvrMethod.getFld
        ? uni.cxapp.InitSvrMethod.getFld()
        : []
      const filterFields = fldList
        .filter(field => field.tabname === tabName && Number(field.qrylevel) > 1 && Number(field.disptype) <= 3)
        .sort((prev, next) => Number(prev.disporder || 0) - Number(next.disporder || 0))

      return filterFields
    },

    /**
     * 为筛选字段加载选项值（为 disptype 等于 2 的字段设置 options）
     * @param {Array} fields - 字段列表
     */
    async loadFieldOptionsForFilterFields(fields)
    {
      if (!Array.isArray(fields) || fields.length === 0)
      {
        return
      }

      // 找出需要加载选项的字段
      // 根据 cx2-filter.vue 的 isGridField 方法，包括以下类型：
      // DISP_LIST, DISP_DROPDOWN, DISP_RADIO, DISP_MULTISEL, DISP_SWITCH
      // 根据需求，我们主要处理 disptype 等于 2 的字段
      const C = uni.cxapp.CxConst
      
      // 找出需要加载选项的字段
      const optionFields = fields.filter(field => 
      {
        const disptype = Number(field.disptype)
        
        // 首先检查 disptype 等于 2 的情况
        if (disptype === 2) 
        {
          return true
        }
        
        // 如果有 CxConst，检查其他需要选项的字段类型
        if (C) 
        {
          return disptype === C.DISP_LIST ||
            disptype === C.DISP_DROPDOWN ||
            disptype === C.DISP_RADIO ||
            disptype === C.DISP_MULTISEL ||
            disptype === C.DISP_SWITCH
        }
        
        return false
      })
      
      if (optionFields.length === 0)
      {
        return
      }
   
      // 批量加载字段选项
      const optionPromises = optionFields.map(field => this.loadOptionsForField(field))
      
      await Promise.allSettled(optionPromises)
    },

    /**
     * 为单个字段加载选项值
     * @param {Object} field - 字段对象
     */
    async loadOptionsForField(field)
    {
      if (!field?.colname)
      {
        return
      }

      try
      {
        // 检查是否已有 options
        if (Array.isArray(field.options) && field.options.length > 0)
        {
          return
        }

        // 检查是否已有 _filterOptions（cx2-filter 使用的属性）
        if (Array.isArray(field._filterOptions) && field._filterOptions.length > 0)
        {
          return
        }

        // 获取字段选项
        const options = await this.getFieldOptions(field.colname)         
        if (Array.isArray(options) && options.length > 0)
        {                  
          // 设置到字段上，cx2-filter 会读取 _filterOptions 属性
          field._filterOptions = options
        }
      }
      catch (err)
      {
        console.error(`Reclist: 加载字段 ${field.colname} 选项失败`, err)
      }
    },

    /**
     * 获取字段选项值
     * @param {String} colname - 字段列名
     * @returns {Promise<Array>} 选项列表
     */
    async getFieldOptions(colname)
    {
      try
      {
        const tabName = this.tabCfg?.tab || ''
        
        // 尝试从两个表名获取选项：当前表和 public
        const options = await uni.cxapp.fldvalue.queryFldValueListAuto({
          tabname: tabName,
          colname: colname,
          order: true
        })
        
        console.log('oetpds---',options)
        if (Array.isArray(options) && options.length > 0)
        {
          return options
        }

        // 如果当前表没有找到选项，尝试从 public 表获取
        const publicOptions = await uni.cxapp.fldvalue.queryFldValueListAuto({
          tabname: 'public',
          colname: colname,
          order: true
        })
        console.log('publicOptions---',publicOptions)
        return publicOptions || []
      }
      catch (err)
      {
        console.error(`Reclist: 查询字段选项失败 ${colname}`, err)
        return []
      }
    },

    /**
     * 查询记录列表
     * @param {Number} pageNo - 页码
     * @param {Number} pageSize - 每页条数
     */
    async queryList(pageNo, pageSize)
    {
      if (!this.tabCfgName || !this.major || !this.minor)
      {
        this.$refs.paging.complete([], 0)
        return
      }

      try
      {
        this.isLoading = true
        if (pageNo > 1 && this.recordList.length >= this.total && this.total > 0)
        {
          this.$refs.paging.complete([], this.total)
          return
        }

        const result = await uni.cxapp.DataSvr.query(
          this.major,
          this.minor,
          this.buildQueryParams(pageNo, pageSize)
        )
        const list = this.getResultList(result)
        const total = this.getResultTotal(result)
        if (pageNo === 1)
        {
          this.selectedIds = []
        }
        if (typeof total === 'number')
        {
          this.total = total
          this.$refs.paging.complete(list, this.total)
        }
        else
        {
          this.$refs.paging.complete(list)
        }
      }
      catch (err)
      {
        console.error('Reclist: 查询记录列表失败', err)
        this.$refs.paging.complete(false)
      }
      finally
      {
        this.isLoading = false
      }
    },

    /**
     * 根据表名解析实体配置
     * @param {String} tabName - 数据库表名
     * @returns {Object|null} 实体配置
     */
    resolveEntityByTab(tabName)
    {
      if (!tabName) return null
      const entityList = uni.cxapp.InitSvrMethod.getEntity
        ? uni.cxapp.InitSvrMethod.getEntity()
        : []
      return entityList.find(item => item.name === tabName) || null
    },

    /**
     * 构建查询参数
     * @param {Number} pageNo - 页码
     * @param {Number} pageSize - 每页条数
     * @returns {Object} 查询参数
     */
    buildQueryParams(pageNo, pageSize)
    {
      return {
        init: pageNo === 1 ? 0 : 1,
        pageno: pageNo,
        pagesize: pageSize,
        orderby: this.orderby,
        args: this.buildQueryArgs()
      }
    },

    /**
     * 构建合并后的查询条件
     * @returns {Array} 查询条件集合
     */
    buildQueryArgs()
    {
      return [
        ...this.normalizeBaseQueryArgs(),
        ...this.buildSearchArgs()
      ]
    },

    /**
     * 构建搜索查询条件（顶部关键字 + 筛选面板）
     * @returns {Array} 搜索查询条件集合
     */
    buildSearchArgs()
    {
      return [
        this.buildKeywordQueryArg(),
        ...this.buildFilterArgs()
      ].filter(arg => arg)
    },

    /**
     * 将 filterValue 转换为查询条件集合
     * @returns {Array} 查询条件集合
     */
    buildFilterArgs()
    {
      const result = []
      const fldMap = {}
      this.filterFlds.forEach(f => { fldMap[f.colname] = f })

      Object.keys(this.filterValue).forEach(colname =>
      {
        const val = this.filterValue[colname]
        if (val === undefined || val === null || `${val}`.trim() === '') return

        const field = fldMap[colname]
        if (!field) return

        // 检查是否是日期字段
        const isDateField = this.isDateField(field)
        
        if (isDateField)
        {
          // 处理日期范围值（格式：startDate;endDate）
          const dateArgs = this.buildDateRangeArgs(field, val)
          if (dateArgs && dateArgs.length > 0)
          {
            result.push(...dateArgs)
          }
        }
        else
        {
          // 非日期字段：如果包含逗号或者其 disptype 是选项类型，则使用 'in' 操作符支持多选
          const C = uni.cxapp?.CxConst
          const isMulti = `${val}`.includes(',') || (C && (
            Number(field.disptype) === C.DISP_LIST ||
            Number(field.disptype) === C.DISP_DROPDOWN ||
            Number(field.disptype) === C.DISP_RADIO ||
            Number(field.disptype) === C.DISP_MULTISEL ||
            Number(field.disptype) === C.DISP_SWITCH
          ))
          const operator = isMulti ? 'in' : this.getFieldQueryOperator(field)
          const queryValue = isMulti ? `${val}`.trim() : this.getFieldQueryValue(field, `${val}`.trim(), operator)
          result.push(['and', [colname, operator, queryValue]])
        }
      })

      return result
    },

    /**
     * 规范化外部查询条件
     * @returns {Array} 查询条件集合
     */
    normalizeBaseQueryArgs()
    {
      if (!Array.isArray(this.args))
      {
        return []
      }

      return this.args
        .map(arg => this.normalizeQueryArgGroup(arg))
        .filter(arg => arg)
    },

    /**
     * 规范化单个查询条件分组
     * @param {Array} arg - 查询条件
     * @returns {Array|null} 查询条件分组
     */
    normalizeQueryArgGroup(arg)
    {
      if (!Array.isArray(arg) || arg.length === 0)
      {
        return null
      }

      const link = `${arg[0]}`.toLowerCase()
      if ((link === 'and' || link === 'or') && Array.isArray(arg[1]))
      {
        return arg
      }

      return ['and', arg]
    },

    /**
     * 构建顶部关键字查询条件
     * @returns {Array|null} 查询条件
     */
    buildKeywordQueryArg()
    {
      const value = `${this.searchKeyword || ''}`.trim()
      if (!value || this.searchFlds.length === 0)
      {
        return null
      }

      const fieldArgs = this.searchFlds.map((field, index) =>
      {
        const operator = this.getFieldQueryOperator(field)
        const queryValue = this.getFieldQueryValue(field, value, operator)
        return [field.colname, operator, queryValue, index === 0 ? 'and' : 'or']
      })
      return ['and', ...fieldArgs]
    },

    /**
     * 获取字段查询操作符
     * @param {Object} field - 字段配置
     * @returns {String} 查询操作符
     */
    getFieldQueryOperator(field)
    {
      return Number(field.isnum) === 1 ? '=' : 'like'
    },

    /**
     * 获取字段查询值
     * @param {Object} field - 字段配置
     * @param {String} value - 输入值
     * @param {String} operator - 查询操作符
     * @returns {String} 查询值
     */
    getFieldQueryValue(field, value, operator)
    {
      if (operator === 'like')
      {
        return `%${value}%`
      }

      return value
    },

    /**
     * 判断字段是否为日期类型
     * @param {Object} field - 字段对象
     * @returns {Boolean} true 表示为日期类型
     */
    isDateField(field)
    {
      const C = uni.cxapp.CxConst
      if (!C) return false
      
      const dt = Number(field.disptype)
      return dt === C.DISP_DATE ||
        dt === C.DISP_TIMESTAMP ||
        dt === C.DISP_TIME ||
        dt === C.DISP_DATEYEAR ||
        dt === C.DISP_YEARMONTH
    },

    /**
     * 构建日期范围查询条件
     * @param {Object} field - 字段对象
     * @param {String} value - 日期范围值（格式：startDate;endDate 或单独值）
     * @returns {Array} 查询条件集合
     */
    buildDateRangeArgs(field, value)
    {
      const result = []
      const strValue = `${value}`.trim()
      
      if (!strValue) return result
      
      // 检查是否是范围值（包含分号）
      if (strValue.includes(';'))
      {
        const [startDate, endDate] = strValue.split(';')
        
        // 如果有开始日期
        if (startDate && startDate.trim())
        {
          result.push(['and', [field.colname, '>=', startDate.trim()]])
        }
        
        // 如果有结束日期
        if (endDate && endDate.trim())
        {
          result.push(['and', [field.colname, '<=', endDate.trim()]])
        }
      }
      else
      {
        // 单个日期值
        result.push(['and', [field.colname, '=', strValue]])
      }
      
      return result
    },

    /**
     * 获取搜索输入提示
     * @returns {String} 搜索提示
     */
    getSearchPlaceholder()
    {
      const names = this.searchFlds.map(field => field.namec || field.colname).join('/')
      return names ? `搜索${names}` : '搜索'
    },

    /**
     * 确认搜索
     */
    onSearchConfirm()
    {
      this.total = 0
      this.selectedIds = []
      if (this.$refs.paging)
      {
        this.$refs.paging.reload()
      }
    },

    /**
     * 获取兼容格式的列表数据
     * @param {Array|Object} result - 服务端返回对象
     * @returns {Array} 列表数据
     */
    getResultList(result)
    {
      if (Array.isArray(result)) return result
      return result?.data || result?.list || []
    },

    /**
     * 获取兼容格式的总条数
     * @param {Array|Object} result - 服务端返回对象
     * @returns {Number|undefined} 总条数
     */
    getResultTotal(result)
    {
      const rawTotal = typeof result?.total !== 'undefined' ? result.total : result?.count
      const total = Number(rawTotal)
      if (!Number.isNaN(total)) return total
      return undefined
    },

    /**
     * 点击卡片跳转详情
     * @param {Object} item - 当前卡片数据
     */
    handleCardClick(item)
    {
      if (this.suppressNextClick)
      {
        this.suppressNextClick = false
        return
      }

      if (this.isEditMode)
      {
        this.onSelectChange(item)
        return
      }

      const url = this.getDetailUrl(item)
      uni.navigateTo({ url })
    },

    /**
     * 长按卡片进入编辑模式并选中当前项
     * @param {Object} item - 当前卡片数据
     */
    onCardLongPress(item)
    {
      if (this.isEditMode)
      {
        return
      }

      this.isEditMode = true
      this.suppressNextClick = true
      this.selectedIds = []
      this.onSelectChange(item)
    },

    /**
     * 切换记录选中状态
     * @param {Object} item - 当前卡片数据
     */
    onSelectChange(item)
    {
      if (!item || typeof item.id === 'undefined')
      {
        return
      }

      const index = this.selectedIds.indexOf(item.id)
      if (index === -1)
      {
        this.selectedIds.push(item.id)
      }
      else
      {
        this.selectedIds.splice(index, 1)
      }
    },

    /**
     * 全选或取消全选
     */
    onSelectAll()
    {
      if (this.isAllSelected)
      {
        this.selectedIds = []
        return
      }

      this.selectedIds = this.getSelectableIds()
    },

    /**
     * 完成编辑
     */
    onEditComplete()
    {
      this.isEditMode = false
      this.selectedIds = []
    },

    /**
     * 获取可选记录ID集合
     * @returns {Array} 记录ID集合
     */
    getSelectableIds()
    {
      return this.recordList
        .map(item => item.id)
        .filter(id => typeof id !== 'undefined' && id !== null)
    },

    /**
     * 批量删除选中记录
     */
    async onDeleteBatch()
    {
      if (this.selectedIds.length === 0)
      {
        return
      }

      uni.showModal({
        title: '提示',
        content: `确定要删除选中的 ${this.selectedIds.length} 条记录吗？删除后不可恢复。`,
        confirmColor: '#ef4444',
        success: async (res) =>
        {
          if (!res.confirm)
          {
            return
          }

          try
          {
            uni.showLoading({ title: '正在删除...' })
            await uni.cxapp.DataSvr.dels({
              major: this.major,
              minor: this.minor,
              id: this.selectedIds.join(',')
            })
            uni.showToast({ title: '删除成功', icon: 'success' })
            this.isEditMode = false
            this.selectedIds = []
            this.total = 0
            this.$refs.paging.reload()
          }
          catch (err)
          {
            console.error('Reclist: 批量删除记录失败', err)
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
          finally
          {
            uni.hideLoading()
          }
        }
      })
    },

    /**
     * 处理卡片按钮插件
     * @param {Object} action - 按钮配置
     * @param {Object} item - 当前卡片数据
     */
    async onCardActionClick(action, item)
    {
      this.suppressNextClick = true
      const pluginName = action?.plugin
      if (!pluginName)
      {
        uni.showToast({
          title: '按钮缺少插件配置',
          icon: 'none'
        })
        return
      }

      const cardActions = this.getCardActions()
      const handler = cardActions?.[pluginName]
      if (typeof handler !== 'function')
      {
        uni.showToast({
          title: `未找到插件:${pluginName}`,
          icon: 'none'
        })
        return
      }

      try
      {
        const dataList = this.getCardActionDataList()
        const attMap = item || {}
        const params = this.getCardActionParams(action, attMap)
        const result = await handler.call(cardActions, this.major, this.minor, dataList, attMap, params)
        this.handleCardActionResult(result)
      }
      catch (err)
      {
        console.error('Reclist: 卡片按钮插件执行失败', err)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    /**
     * 获取卡片按钮插件集合
     * @returns {Object|null} 插件集合
     */
    getCardActions()
    {
      return uni.cxapp.cardActionHandlers || uni.cxapp.cardActions || uni.cxapp.cardAction || uni.cxapp.cardbtn || null
    },

    /**
     * 获取卡片按钮插件的数据集合参数
     * @returns {Array} 数据集合
     */
    getCardActionDataList()
    {
      return Array.isArray(this.recordList) ? this.recordList : []
    },

    /**
     * 获取卡片按钮插件的扩展参数
     * @param {Object} action - 按钮配置
     * @param {Object} attMap - 当前卡片数据
     * @returns {Object} 扩展参数
     */
    getCardActionParams(action, attMap)
    {
      const params = this.parseActionParams(action?.params)
      return {
        ...this.resolveActionParams(params, attMap),
        action: action,
        selectedIds: this.selectedIds,
        tabCfg: this.tabCfg,
        tabCfgName: this.tabCfgName
      }
    },

    /**
     * 解析按钮扩展参数
     * @param {Object|String} params - 按钮扩展参数
     * @returns {Object} 解析后的参数
     */
    parseActionParams(params)
    {
      if (!params)
      {
        return {}
      }

      if (typeof params === 'object')
      {
        return params
      }

      if (typeof params === 'string')
      {
        try
        {
          return JSON.parse(params)
        }
        catch (err)
        {
          console.error('Reclist: 解析按钮参数失败', err)
          return {}
        }
      }

      return {}
    },

    /**
     * 解析按钮参数中的当前记录占位符
     * @param {Object} params - 按钮扩展参数
     * @param {Object} attMap - 当前卡片数据
     * @returns {Object} 解析后的参数
     */
    resolveActionParams(params, attMap)
    {
      const resolved = {}
      Object.keys(params || {}).forEach(key =>
      {
        const value = params[key]
        if (typeof value === 'string')
        {
          resolved[key] = value.replace(/\{([^}]+)\}/g, (match, fieldName) =>
          {
            const fieldValue = attMap?.[fieldName]
            return typeof fieldValue === 'undefined' || fieldValue === null ? '' : fieldValue
          })
        }
        else
        {
          resolved[key] = value
        }
      })
      return resolved
    },

    /**
     * 处理卡片按钮插件返回结果
     * @param {*} result - 插件执行结果
     */
    handleCardActionResult(result)
    {
      if (!result)
      {
        return
      }

      if (typeof result === 'string')
      {
        uni.showToast({
          title: result,
          icon: 'none'
        })
        return
      }

      if (result.toast || result.message)
      {
        uni.showToast({
          title: result.toast || result.message,
          icon: result.icon || 'none'
        })
      }

      if (result.reload || result.refresh)
      {
        this.total = 0
        this.$refs.paging.reload()
      }
    },

    /**
     * 获取详情页地址
     * @param {Object} item - 当前卡片数据
     * @returns {String} 详情页地址
     */
    getDetailUrl(item)
    {
      const tabcfg = encodeURIComponent(JSON.stringify(this.tabCfg))
      const attMap = encodeURIComponent(JSON.stringify(item))
      return `${this.targetPage}?tabcfg=${tabcfg}&attMap=${attMap}&attState=6`
    },

    /**
     * 打开筛选面板
     */
    onOpenFilter()
    {
      this.filterPopupVisible = true
    },

    /**
     * 关闭筛选面板
     */
    onCloseFilter()
    {
      this.filterPopupVisible = false
    },

    /**
     * 筛选面板点击确定
     * @param {Object} value - 筛选值 { colname: value }
     */
    onFilterSearch(value)
    {
      this.filterValue = { ...(value || {}) }
      this.filterPopupVisible = false
      this.total = 0
      this.selectedIds = []
      if (this.$refs.paging)
      {
        this.$refs.paging.reload()
      }
    },

    /**
     * 筛选面板点击重置
     */
    onFilterReset()
    {
      this.filterValue = {}
      this.filterPopupVisible = false
      this.total = 0
      this.selectedIds = []
      if (this.$refs.paging)
      {
        this.$refs.paging.reload()
      }
    },

    /**
     * 解析 JSON 路由参数
     * @param {String} value - 参数值
     * @param {*} defaultValue - 默认值
     * @returns {*} 解析后的参数值
     */
    parseJsonOption(value, defaultValue)
    {
      if (!value) return defaultValue
      try
      {
        return JSON.parse(decodeURIComponent(value))
      }
      catch (err)
      {
        console.error('Reclist: 解析路由参数失败', err)
        return defaultValue
      }
    }
  }
}
</script>

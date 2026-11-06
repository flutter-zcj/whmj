<style lang="scss" scoped>
.survey-att-single-page { position: relative; display: flex; flex-direction: column; width: 100%; min-height: 100vh; background: #f5f5f5; }
.content-wrapper { overflow-y: auto; flex: 1; padding: 32rpx; }
.loading-overlay { position: fixed; display: flex; flex-direction: column; justify-content: center; align-items: center; left: 0; right: 0; top: 0; bottom: 0; z-index: 1000; background-color: rgba(255, 255, 255, 0.8); }
.loading-spinner { width: 64rpx; height: 64rpx; border: 6rpx solid #f3f3f3; border-top: 6rpx solid #1890ff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading-text { margin-top: 24rpx; font-size: 28rpx; color: #666; }
.bottom-action-bar { display: flex; justify-content: center; align-items: center; flex: 0 0 auto; padding: 24rpx 32rpx; padding-bottom: calc(24rpx + constant(safe-area-inset-bottom)); padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); background-color: #fff; box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05); }
.submit-btn { display: flex; justify-content: center; align-items: center; width: 100%; height: 88rpx; background-color: #1890ff; font-size: 32rpx; font-weight: 600; color: #fff; border-radius: 44rpx;
  &.disabled { background-color: #d9d9d9; color: #999; }
}
</style>

<template>
  <view class="survey-att-single-page">
    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 🚀 纯属性表单组件 -->
      <cx2-form
        ref="mainForm"
        :major="tabcfg.major"
        :minor="tabcfg.minor"
        :mode="formMode"
        :attMap="attMap"
        :showPhoto="showPhoto"
        :showVideo="showVideo"
        :showAttach="showAttach"
        :busType="busType"
        :beforeCommit="handleBeforeCommit"
        @fld-change="handleFldChange"
      >
        <!-- 底部自定义插槽 -->
        <template #bottom>
          <slot name="bottom" :attMap="attMap" />
        </template>
      </cx2-form>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <view 
        class="submit-btn" 
        :class="{ disabled: isSubmitting }"
        @click="handleSubmit"
      >
        <text>{{ submitButtonText }}</text>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view class="loading-overlay" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ loadingMessage }}</text>
    </view>
  </view>
</template>

<script>
/**
 * 组件名称：SimpleAtt
 * 功能说明：纯属性表单页面，用于单个表单的新增/修改/查看
 * 研发时间：2026/05/13
 * 研发人员：郑朝军
 *
 * 参数说明：
 * @prop {Object} tabcfg - 表配置对象
 * @prop {Object} parentAtt - 父表属性对象（用于关联）
 * @prop {Object} attMap - 当前表属性对象
 * @prop {Number} attState - 表单状态（7-添加, 5-修改, 6-查询）
 * @prop {String} busType - 业务类型标识
 * @prop {Boolean} isLoading - 是否正在加载
 * @prop {String} loadingMessage - 加载提示消息
 * @prop {Boolean} isSubmitting - 是否正在提交
 * @prop {Boolean} isAllowBack - 是否允许返回
 * @prop {Boolean} userBatchCommit - 是否是批量提交模式
 *
 * 事件说明：
 * @event parseOptions - 解析页面路由参数
 * @event getInitMap - 获取初始化数据 
 * @event queryData - 查询表单数据
 * @event handleFldChange - 处理字段发生变化
 * @event handleBeforeCommit - 表单提交前校验与批处理拦截
 * @event handleSubmit - 执行提交操作
 * @event submitData - 提交数据到后端服务
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/05/13     郑朝军      初始创建，实现纯属性表单页面
 * 2026/05/18     郑朝军      规范代码，应用Vue编码规范
 */

export default
{
  name: 'SimpleAtt',

  // 1. data
  data()
  {
    return {
      tabcfg: null,
      parentAtt: {},
      attMap: {},
      attState: 7, // 7-添加, 5-修改, 6-查询
      busType: 'default',
      isLoading: false,
      loadingMessage: '加载中...',
      isSubmitting: false,
      isAllowBack: false,
      userBatchCommit: false
    }
  },

  // 8. computed
  computed:
  {
    /**
     * 页面标题
     * @returns {String} 页面标题
     */
    pageTitle()
    {
      if (!this.tabcfg) return '表单'
      const prefix = this.attState === uni.cxapp.CxConst.ATT_ADD ? '新增' : this.attState === uni.cxapp.CxConst.ATT_EDIT ? '编辑' : '查看'
      return `${prefix}${this.tabcfg.namec || this.tabcfg.name}`
    },

    /**
     * 提交按钮文本
     * @returns {String} 按钮文本
     */
    submitButtonText()
    {
      if (this.attState === uni.cxapp.CxConst.ATT_VIEW) return '关闭'
      return this.attState === uni.cxapp.CxConst.ATT_ADD ? '提交' : '保存'
    },

    /**
     * 表单模式
     * @returns {Number} 表单模式属性
     */
    formMode()
    {
      return this.attState
    },

    /**
     * 是否显示照片功能
     * @returns {Boolean} 是否显示
     */
    showPhoto()
    {
      return this.tabcfg?.params?.showPhoto || false
    },

    /**
     * 是否显示视频功能
     * @returns {Boolean} 是否显示
     */
    showVideo()
    {
      return this.tabcfg?.params?.showVideo || false
    },

    /**
     * 是否显示附件功能
     * @returns {Boolean} 是否显示
     */
    showAttach()
    {
      return this.tabcfg?.params?.showAttach || false
    }
  },

  /**
   * 页面加载
   * @param {Object} options - 路由参数
   */
  onLoad(options)
  {
    this.parseOptions(options)
    uni.setNavigationBarTitle({
      title: this.pageTitle
    })
  },

  /**
   * 拦截返回事件
   * @returns {Boolean} 是否拦截
   */
  onBackPress()
  {
    if (this.isAllowBack) return false

    // 如果是查看模式，直接返回
    if (this.attState === uni.cxapp.CxConst.ATT_VIEW)
    {
      return false
    }

    // 如果是新增或修改模式，提示用户
    uni.showModal({
      title: '提示',
      content: '确定退出吗？未保存的数据将丢失。',
      success: (res) =>
      {
        if (res.confirm)
        {
          this.isAllowBack = true
          uni.navigateBack({
            delta: 1,
            fail: () => {}
          })
        }
      }
    })

    return true
  },

  // 13. methods
  methods:
  {
    /**
     * 解析路由参数
     * @param {Object} options - 路由参数对象
     */
    parseOptions(options)
    {
      // 解析业务类型
      if (options.busType)
      {
        this.busType = options.busType
      }

      // 解析表单状态
      if (options.attState)
      {
        this.attState = parseInt(options.attState)
      }

      // 解析批处理模式
      if (options.userBatchCommit !== undefined)
      {
        this.userBatchCommit = !!parseInt(options.userBatchCommit)
      }

      // 解析表配置：优先使用直接传入的完整对象，其次按 id/name 从管理器查找
      // 注意：uniapp 框架会自动 decode URL 参数，options 中收到的已是 decode 后的字符串，直接 JSON.parse 即可
      if (options.tabcfg)
      {
        try
        {
          this.tabcfg = JSON.parse(options.tabcfg)
        }
        catch (e)
        {
          console.error('解析 tabcfg 失败:', e)
        }
      }
   
      // 解析父表属性
      if (options.parentAtt)
      {
        try
        {
          this.parentAtt = JSON.parse(options.parentAtt)
        }
        catch (e)
        {
          console.error('解析 parentAtt 失败:', e)
        }
      }
      else if (options.parentId)
      {
        this.parentAtt = { id: options.parentId }
      }

      // 解析当前属性
      if (options.attMap)
      {
        try
        {
          this.attMap = JSON.parse(options.attMap)
        }
        catch (e)
        {
          console.error('解析 attMap 失败:', e)
        }
      }
      else if (options.id)
      {
        this.attMap = { id: options.id }
      }
      else
      {
        // 新增模式，初始化关联字段
        this.attMap = this.getInitMap()
      }      
    },

    /**
     * 获取初始化数据
     * @returns {Object} 初始属性数据对象
     */
    getInitMap()
    {
      if (!this.tabcfg) return {}
      return uni.cxapp.survey.getInitMap(this.tabcfg, this.parentAtt)
    },
  
    /**
     * 处理字段变化
     * @param {Object} event - 变化事件对象
     */
    handleFldChange(event)
    {
      const { attMap, colName } = event
      // 更新本地数据
      Object.assign(this.attMap, attMap)
      
      // 触发自定义事件
      this.$emit('fld-change', { attMap: this.attMap, colName })
    },

    /**
     * 表单提交前校验
     * @param {Object} newAtt - 准备提交的数据
     * @returns {Promise<Boolean>} 是否继续提交
     */
    async handleBeforeCommit(newAtt)
    {     
      // 批处理提交逻辑
      if (this.userBatchCommit && !this.parentAtt.id)
      {
        // 触发事件给 opener
        const eventChannel = this.getOpenerEventChannel()
        if (eventChannel && eventChannel.emit)
        {
          eventChannel.emit('onBatchCommit', newAtt)
        }
        
        uni.showToast({
          title: '已保存',
          icon: 'success'
        })
             
        return false // 阻止真正的接口提交
      }
      return true
    },

    /**
     * 处理提交
     */
    async handleSubmit()
    {
      // 如果是查看模式，直接关闭
      if (this.attState === uni.cxapp.CxConst.ATT_VIEW)
      {
        uni.navigateBack()
        return
      }
   
      // 表单验证
      const formRef = this.$refs.mainForm

      // 提交数据
      formRef.commit()
     
      // 延迟返回
      setTimeout(() =>
      {
        this.isAllowBack = true
        uni.navigateBack()
      }, 1500)      
    }, 
  }
}
</script>

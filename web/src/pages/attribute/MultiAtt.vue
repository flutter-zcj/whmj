<style lang="scss" scoped>
.survey-att-page { position: relative; width: 100%; min-height: 100vh; background: #f5f5f5; }
.bottom-action-bar { padding: 32rpx; background-color: #fff; }
.submit-btn { display: flex; justify-content: center; align-items: center; height: 88rpx; background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%); border-radius: 44rpx; box-shadow: 0 8rpx 16rpx rgba(24, 144, 255, 0.3);
  text { font-weight: 600; font-size: 32rpx; color: #fff; }
  &:active { opacity: 0.8; transform: scale(0.98); }
}
</style>

<template>
  <view class="survey-att-page">
    <!-- 🚀 调查附件采集核心组件 -->
    <cx2-multi-att
      ref="multiAtt"
      :tabcfg="tabcfg"
      :subTabCfgs="subTabCfgs"
      :parentAtt="parentAtt"
      :attMap="attMap"
      :attState="attState"
      :busType="busType"
      :userBatchCommit="true"
      @success="handleSuccess"
    >
      <!-- 底部自定义按钮插槽 -->
      <template #bottom="{ tab, attMap }">
        <view class="bottom-action-bar" v-if="tab.relationship === 1">
          <view class="submit-btn" @click="handleStartProcess(tab, attMap)">
            <text>确认提交</text>
          </view>
        </view>
      </template>
    </cx2-multi-att>

  </view>
</template>

<script>
/**
 * 页面名称：MultiAtt
 * 功能说明：通用多表附件采集页面，基于 cx2-multi-att 组件。
 *          所有的表单结构和预填充数据都需从外部路由参数传入。
 * 研发时间：2026/05/13
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入，所有的 JSON 字符串均建议使用 encodeURIComponent 编码）：
 * @param {String} title      - 页面导航栏标题，默认使用 tabcfg.namec
 * @param {String} attState   - 表单状态，支持数字字符串（'7'-添加, '5'-修改, '6'-查询）
 * @param {String} tabcfg     - 主表配置对象（JSON 字符串）
 * @param {String} subTabCfgs - 子表配置列表（JSON 字符串）
 * @param {String} attMap     - 预填充的业务数据（JSON 字符串），兼容字段名 formData
 * @param {String} parentAtt  - 父表关联属性对象（JSON 字符串）
 * @param {String} parentId   - 父表关联 ID（作为 parentAtt.id 的后备解析）
 * @param {String} id         - 当前记录 ID，修改/查询模式下传入
 * @param {String} busType    - 业务类型标识
 * @param {String} subTabIds  - 子表配置 ID 列表，逗号分隔（subTabCfgs 未传时生效）
 * @param {String} subTabNames - 子表配置 Name 列表，逗号分隔（subTabCfgs 未传时生效）
 *
 * 跳转页面示例：
 * ```javascript
 * // 1. 定义主表配置
 * const mainTable = {
 *   id: 2001,
 *   name: 'contract_main',
 *   namec: '合同会签审批单',
 *   major: 98,
 *   minor: 71,
 *   relationship: 1,
 *   mapping: [],
 *   fldList: [
 *     { colname: 'id', namec: 'ID', isnum: 1, disporder: 0, params: {} },
 *     { colname: 'name', namec: '合同名称', isnum: 0, disporder: 1, params: { grpc: '基本信息', required: true } },
 *     { colname: 'contract_no', namec: '合同编号', isnum: 0, disporder: 2, params: { grpc: '基本信息', required: true } }
 *   ],
 *   params: { showPhoto: false, showAttach: true }
 * };
 *
 * // 2. 定义子表配置列表
 * const subTabCfgs = [
 *   {
 *     id: 2002,
 *     name: 'contract_payment',
 *     namec: '回款计划',
 *     major: 98,
 *     minor: 72,
 *     glMajor: 98,
 *     glMinor: 81,
 *     relationship: 2,
 *     mapping: ['main_id,id'],
 *     fldList: [
 *       { colname: 'id', namec: 'ID', isnum: 1, disporder: 0, params: {} },
 *       { colname: 'payment_phase', namec: '回款阶段', isnum: 0, disporder: 2, params: { grpc: '回款信息', required: true } },
 *       { colname: 'payment_amount', namec: '回款金额（元）', isnum: 1, disporder: 3, params: { grpc: '回款信息', type: 'number', required: true } }
 *     ],
 *     params: { showPhoto: false, showAttach: false }
 *   }
 * ];
 *
 * // 3. 定义预填充的业务表单数据
 * const attMap = {
 *   name: '张三',
 *   depart: '技术部',
 *   position: '员工'
 * };
 *
 * // 4. 组合并编码所有参数
 * const params = {
 *   title: '合同会签附件采集',
 *   tabcfg: JSON.stringify(mainTable),
 *   subTabCfgs: JSON.stringify(subTabCfgs),
 *   attMap: JSON.stringify(attMap),
 *   parentAtt: JSON.stringify({}),
 *   attState: '7',
 *   busType: 'contract'
 * };
 *
 * const queryString = Object.keys(params)
 *   .map(key => `${key}=${encodeURIComponent(params[key])}`)
 *   .join('&');
 *
 * // 5. 执行页面跳转
 * uni.navigateTo({
 *   url: `/pages/attribute/MultiAtt?${queryString}`
 * });
 * ```
 *
 * 事件说明：
 * @event handleSuccess      - 提交成功后的回调，执行提示并返回上一页
 * @event handleStartProcess - 底部「确认提交」按钮逻辑
 */

/**
 * 修改时间       人员        说明
 * 2026/05/13     郑朝军      初始创建，实现动态配置加载与组件集成
 * 2026/05/18     AI          规范代码，应用Vue编码规范
 * 2026/06/30     郑朝军      参考 MultiStart.vue，支持通过路由参数直接传入 JSON 配置，添加跳转示例注释
 */

export default
{
  // 4. data
  data()
  {
    return {
      tabcfg: null,
      subTabCfgs: null,
      parentAtt: {},
      attMap: {},
      isAllowBack: false,
      attState: 7,
      busType: 'default',
      // 页面标题，从路由参数读取
      pageTitle: '附件采集'
    }
  },

  /**
   * 拦截返回事件
   * @returns {Boolean} 是否拦截
   */
  onBackPress()
  {
    if (this.isAllowBack) return false

    uni.showModal({
      title: '提示',
      content: '确定返回？',
      success: (res) =>
      {
        if (res.confirm)
        {
          // ✅ 关键：打开放行开关
          this.isAllowBack = true
          
          // ✅ 调用 uni.navigateBack
          uni.navigateBack({
            delta: 1,
            fail: () => {} // 捕获错误，不抛出
          })
        }
      }
    })
   
    return true
  },

  /**
   * 页面加载
   * @param {Object} options - 路由传参对象
   */
  onLoad(options)
  {
    this.parseOptions(options)

    uni.setNavigationBarTitle({
      title: this.pageTitle
    })
  },

  // 13. methods
  methods:
  {
    /**
     * 安全的 URL 解码，防止 malformed URI error
     * @param {String} str - 待解码的字符串
     * @returns {String} 解码后的字符串
     */
    safeDecode(str)
    {
      if (!str) return ''
      try
      {
        return decodeURIComponent(str)
      }
      catch (e)
      {
        return str
      }
    },

    /**
     * 安全的 JSON 解析，兼容直接解析或 URL 解码后解析
     * @param {String} str - JSON 字符串
     * @returns {Object|null} 解析后的对象
     */
    safeParseJson(str)
    {
      if (!str) return null
      try
      {
        return JSON.parse(str)
      }
      catch (e)
      {
        try
        {
          return JSON.parse(decodeURIComponent(str))
        }
        catch (e2)
        {
          console.error('MultiAtt: safeParseJson failed', e2)
          return null
        }
      }
    },

    /**
     * 解析路由参数并初始化页面数据
     * 支持两种方式传入配置：
     *   1. 直接传入 JSON 字符串（tabcfg / subTabCfgs / attMap / parentAtt）
     * @param {Object} options - 路由传参对象
     */
    parseOptions(options)
    {
      if (!options) return

      // 页面标题
      if (options.title)
      {
        this.pageTitle = this.safeDecode(options.title)
      }

      // 业务类型
      if (options.busType)
      {
        this.busType = this.safeDecode(options.busType)
      }

      // 表单状态：支持数字字符串（'7'）或语义字符串（'ADD'）
      if (options.attState)
      {
        const raw = this.safeDecode(options.attState)
        const num = parseInt(raw)
        this.attState = isNaN(num) ? raw : num
      }

      // ── 优先：直接传入 JSON 配置 ──────────────────────────────

      // 主表配置
      if (options.tabcfg)
      {
        this.tabcfg = this.safeParseJson(options.tabcfg)
      }

      // 子表配置列表
      if (options.subTabCfgs)
      {
        this.subTabCfgs = this.safeParseJson(options.subTabCfgs)
      }

      // 预填充表单数据
      if (options.attMap)
      {
        this.attMap = this.safeParseJson(options.attMap) || {}
      }
      else if (options.formData)  // 兼容 formData 字段
      {
        this.attMap = this.safeParseJson(options.formData) || {}
      }

      // 父表关联属性
      if (options.parentAtt)
      {
        this.parentAtt = this.safeParseJson(options.parentAtt) || {}
      }
      else if (options.parentId)
      {
        this.parentAtt = { id: options.parentId }
      }
     
      // 修改/查询模式：仅传入 id
      if (options.id)
      {
        this.attMap = { id: options.id }
      } 

      // 更新页面标题：优先使用显式传入的 title，其次使用 tabcfg.namec
      if (!options.title && this.tabcfg && this.tabcfg.namec)
      {
        this.pageTitle = this.tabcfg.namec
      }
    },
     
    /**
     * 提交成功后的处理逻辑
     * @param {Object} data - 提交返回的数据对象
     */
    handleSuccess(data)
    {
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
      
      // 发送全局刷新事件
      uni.$emit('refresh-survey-list', data)
      
      uni.navigateBack()
    },

    /**
     * 发起流程按钮逻辑
     * @param {Object} tab - 当前 Tab 配置
     * @param {Object} attMap - 当前表单数据
     */
    async handleStartProcess(tab, attMap)
    {
      const multiAtt = this.$refs.multiAtt
      const userBatchCommit = true // 与组件传入的值保持一致

      // 1. 基础校验：如果不是主表且非批处理模式且主表未保存，提示先录入主表
      if (tab !== this.tabcfg && !userBatchCommit && !this.parentAtt.id)
      {
        uni.showToast({
          title: '请先录入主表属性',
          icon: 'none'
        })
        return
      }

      // 2. 处理表单提交 (relationship == 1)
      if (tab.relationship === 1)
      {
        const form = multiAtt.getFormInstance(tab)
        if (!form) return

        if (!userBatchCommit || attMap.id)
        {
          // 非批处理模式，或者数据已有 ID（修改模式），直接调用表单 commit
          form.commit()
        }
        else
        {
          // 批处理模式且是新增数据
          // 将当前表单数据存入本地缓存
          multiAtt.$set(multiAtt.localDataMapping, tab.name, [attMap])
          
          // 仅在主表 Tab 时触发批量提交
          if (multiAtt.currentIndex === 0)
          {
            if (await form.checkData())
            {
              // 执行批量提交
              multiAtt.commitWithBatch()
            }
          }
          else
          {
            uni.showToast({
              title: '请切换到主表页签发起流程',
              icon: 'none'
            })
          }
        }
      }
    }
  }
}
</script>

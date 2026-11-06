<style lang="scss" scoped>
.multi-start { position: relative; width: 100%; min-height: 100vh; background: #f5f5f5; }
</style>

<template>
  <!-- 🚀 多表单流程发起页面 -->
  <view class="multi-start">
    <cx2-bpm-multi-start
      ref="bpmMultiStart"
      :proc="proc"
      :tabcfg="tabcfg"
      :subTabCfgs="subTabCfgs"
      :parentAtt="parentAtt"
      :attState="attState"
      :formData="formData"
      :depart="depart"
      :position="position"
      :busType="busType"
      :singlePageRoute="singlePageRoute"
      :buttonText="buttonText"
      :onReady="onBpmReady"
      @success="handleSuccess"
      @error="handleError"
    >    
    </cx2-bpm-multi-start>
  </view>
</template>

<script>
/**
 * 页面名称：MultiStart
 * 功能说明：通用多表单流程发起页面，基于 cx2-bpm-multi-start 组件。
 *          所有的流程配置、表单结构和预填充数据都需从外部路由参数传入。
 * 研发时间：2026/06/01
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入，所有的 JSON 字符串均建议使用 encodeURIComponent 编码）：
 * @param {String} attState - 表单状态，默认 'ADD'（ADD/MODIFY/QUERY）
 * @param {String} formData - 预填充的业务数据（JSON 字符串）
 * @param {String} proc - 流程配置对象（JSON 字符串）
 * @param {String} tabcfg - 主表配置对象（JSON 字符串）
 * @param {String} subTabCfgs - 子表配置列表（JSON 字符串）
 * @param {String} parentAtt - 父表关联属性对象（JSON 字符串）
 * @param {String} parentId - 父表关联 ID（作为 parentAtt.id 的后备解析）
 * @param {String} depart - 发起部门
 * @param {String} position - 发起岗位
 * @param {String} busType - 业务类型
 * @param {String} singlePageRoute - 单表属性页面路由路径（例如 '/pages/attribute/SimpleAtt'）
 * @param {String} buttonText - 提交按钮文案
 *
 * 跳转页面示例：
 * ```javascript
 * // 1. 定义流程基本信息
 * const proc = {
 *   tabname: 'contract_main',
 *   bill: 'CONTRACT',
 *   procid: 'PROC-CONTRACT-001',
 *   namec: '合同会签审批流程',
 *   cate: '行政类流程',
 *   attach: 1,
 *   proccls: ''
 * };
 * 
 * // 2. 定义主表配置
 * const mainTable = {
 *   id: 2001,
 *   name: 'contract_main',
 *   namec: '合同会签审批单',
 *   major: 98,
 *   minor: 71,
 *   relationship: 1,
 *   fldList: [
 *     { colname: 'id', namec: 'ID', isnum: 1, disporder: 0, params: {} },
 *     { colname: 'name', namec: '合同名称', isnum: 0, disporder: 1, params: { grpc: '基本信息', required: true } },
 *     { colname: 'contract_no', namec: '合同编号', isnum: 0, disporder: 2, params: { grpc: '基本信息', required: true } }
 *   ],
 *   params: { showPhoto: true, showAttach: true }
 * };
 * 
 * // 3. 定义子表配置列表
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
 *       { colname: 'payment_phase', namec: '回款阶段', isnum: 0, disporder: 2, params: { grpc: '回款信息', required: true } }
 *     ]
 *   }
 * ];
 * 
 * // 4. 定义预填充的业务表单数据
 * const formData = {
 *   name: '张三',
 *   depart: '技术部',
 *   position: '高级开发工程师'
 * };
 * 
 * // 5. 组合并编码所有参数
 * const params = {
 *   proc: JSON.stringify(proc),
 *   tabcfg: JSON.stringify(mainTable),
 *   subTabCfgs: JSON.stringify(subTabCfgs),
 *   formData: JSON.stringify(formData),
 *   parentAtt: JSON.stringify({}),
 *   attState: 'ADD',
 *   depart: '技术部',
 *   position: '高级开发工程师',
 *   busType: 'contract',
 *   singlePageRoute: '/pages/attribute/SimpleAtt',
 *   buttonText: '发起合同会签'
 * };
 * 
 * const queryString = Object.keys(params)
 *   .map(key => `${key}=${encodeURIComponent(params[key])}`)
 *   .join('&');
 * 
 * // 6. 执行页面跳转
 * uni.navigateTo({
 *   url: `/pages/bpm/MultiStart?${queryString}`
 * });
 * ```
 *
 * 事件说明：
 * @event handleSuccess - 流程发起成功回调
 * @event handleError - 流程发起失败回调
 * @event onBpmReady - 组件初始化完成回调
 */

/**
 * 修改时间       人员        说明
 * 2026/06/01     郑朝军      初始创建
 * 2026/06/29     郑朝军      重构为参数完全由外部传入，移除内置硬编码数据，添加跳转示例注释
 */

export default
{  
  data()
  {
    return {
      // ========== 流程相关配置 ==========
      proc: null,

      // ========== 表单状态 ==========
      attState: 'ADD',

      // ========== 主表配置 ==========
      tabcfg: null,

      // ========== 子表配置列表 ==========
      subTabCfgs: null,

      // ========== 父表属性 ==========
      parentAtt: null,

      // ========== 预填充的业务数据 ==========
      formData: null,

      // ========== 发起部门/岗位 ==========
      depart: '',
      position: '',

      // ========== 业务类型 ==========
      busType: '',

      // ========== 单表路由路径 ==========
      singlePageRoute: '',

      // ========== 按钮文案 ==========
      buttonText: '提交'
    }
  },

  /**
   * 页面加载
   * @param {Object} options - 路由传参对象
   */
  onLoad(options)
  {
    // 解析路由参数
    this.parseOptions(options)

    // 设置导航标题
    uni.setNavigationBarTitle({
      title: (this.proc && this.proc.namec) || '多表单流程发起'
    })
  },

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
          console.error('MultiStart: safeParseJson failed', e2)
          return null
        }
      }
    },

    /**
     * 解析路由参数并覆盖对应配置
     * @param {Object} options - 路由传参对象
     */
    parseOptions(options)
    {
      if (!options) return

      // 解析表单状态
      if (options.attState)
      {
        this.attState = this.safeDecode(options.attState)
      }

      // 解析部门/岗位
      if (options.depart)
      {
        this.depart = this.safeDecode(options.depart)
      }
      if (options.position)
      {
        this.position = this.safeDecode(options.position)
      }

      // 解析业务类型
      if (options.busType)
      {
        this.busType = this.safeDecode(options.busType)
      }

      // 解析单表路由路径
      if (options.singlePageRoute)
      {
        this.singlePageRoute = this.safeDecode(options.singlePageRoute)
      }

      // 解析按钮文案
      if (options.buttonText)
      {
        this.buttonText = this.safeDecode(options.buttonText)
      }

      // 解析预填充数据（JSON 字符串）
      if (options.formData)
      {
        this.formData = this.safeParseJson(options.formData)
      }
      else if (options.data) // 兼容历史字段 data
      {
        this.formData = this.safeParseJson(options.data)
      }

      // 解析 proc 配置（JSON 字符串）
      if (options.proc)
      {
        this.proc = this.safeParseJson(options.proc)
      }

      // 解析主表配置（JSON 字符串）
      if (options.tabcfg)
      {
        this.tabcfg = this.safeParseJson(options.tabcfg)
      }

      // 解析子表配置列表（JSON 字符串）
      if (options.subTabCfgs)
      {
        this.subTabCfgs = this.safeParseJson(options.subTabCfgs)
      }

      // 解析父表关联
      if (options.parentAtt)
      {
        this.parentAtt = this.safeParseJson(options.parentAtt)
      }
      else if (options.parentId)
      {
        this.parentAtt = { id: options.parentId }
      }
    },

    /**
     * 组件初始化完成回调
     * @param {Object} attMap - 初始化后的表单数据
     */
    onBpmReady(attMap)
    {
      console.log('MultiStart: 多表单流程组件就绪', attMap)
    },

    /**
     * 流程发起成功回调
     * @param {Object} payload - { variables: 流程变量对象, mainResult: 主表提交结果 }
     */
    handleSuccess(payload)
    {
      const { variables, mainResult } = payload || {}

      uni.showToast({
        title: `${(this.proc && this.proc.namec) || '流程'}发起成功！`,     
        duration: 2000
      })

      // 发送全局刷新事件（通知列表页刷新）
      uni.$emit('refresh-bpm-list', { variables, mainResult })

      // 延迟返回上一页
      uni.navigateBack()   
    },

    /**
     * 流程发起失败回调
     * @param {Object} error - 错误对象
     */
    handleError(error)
    {
      console.error('MultiStart: 流程发起失败', error)
    }
  }
}
</script>

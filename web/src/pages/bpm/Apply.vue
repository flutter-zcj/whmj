<style lang="scss" scoped>
</style>

<template>
  <!-- 🚀 带薪假申请流程发起页面 -->
    <cx2-bpm-start
        v-if="proc"
        ref="bpmStart"
        :proc="proc"
        :attState="attState"
        :formData="formData"
        @success="handleSuccess"
        @error="handleError"
      >
    </cx2-bpm-start>
</template>

<script>
/**
 * 页面名称：ApplyPage
 * 功能说明：带薪假申请流程发起页面，基于 cx2-bpm-start 组件封装
 * 研发时间：2026/06/01
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入，所有 Object 类型参数均需 encodeURIComponent(JSON.stringify(...)) 编码）：
 * @param {String} attState  - 表单状态，默认 'ADD'（可选值：ADD / MODIFY / QUERY）
 * @param {String} formData  - 预填充的业务数据（JSON 字符串，经 encodeURIComponent 编码）
 * @param {String} proc      - 流程配置对象（JSON 字符串，经 encodeURIComponent 编码）
 *
 * 跳转示例（在 HomeMixin.js 中调用 this.toApply()，或手动拼参跳转）：
 * ```javascript
 * // 1. 定义流程基本信息
 * const proc = {
 *   tabname: 'hr_dxjd',
 *   icon: 'assets/images/ic_dxjsqlc.png',
 *   visible: 1,
 *   userid: 0,
 *   plug: 'ApplyPage',
 *   namec: '带薪假申请流程',
 *   cate: '人力类流程'
 * };
 *
 * // 2. 定义预填充的业务表单数据
 * const formData = {
 *   name: '张三',
 *   depart: '技术部',
 *   position: '开发工程师',
 *   type: 1,
 *   reason: '个人事假',
 *   starttime: '2026-06-01 08:30:00',
 *   endtime: '2026-06-03 18:00:00',
 *   total: 2.50,
 *   memo: '提前完成工作交接',
 *   rq: '2026-06-01'
 * };
 *
 * // 3. 组合并编码所有参数
 * const params = {
 *   proc: JSON.stringify(proc),
 *   formData: JSON.stringify(formData),
 *   attState: 'ADD'
 * };
 *
 * const queryString = Object.keys(params)
 *   .map(key => `${key}=${encodeURIComponent(params[key])}`)
 *   .join('&');
 *
 * // 4. 执行页面跳转
 * uni.navigateTo({
 *   url: `/pages/bpm/Apply?${queryString}`
 * });
 * ```
 *
 * 事件说明：
 * @event handleSuccess - 流程发起成功后的回调
 * @event handleError   - 流程发起失败后的回调
 *
 * 插槽说明：无
 */

/**
 * 修改时间       人员        说明
 * 2026/06/01     郑朝军      初始创建，基于 cx2-bpm-start 组件实现在线带薪假申请
 */

export default
{
  // 1. data
  data()
  {
    return {
      // 🚀 流程配置对象
      proc: null,

      // 🚀 表单状态：ADD-新增, MODIFY-修改, QUERY-查询
      attState: 'ADD',

      // 🚀 预填充的表单数据
      formData: null
    }
  },

  /**
   * 页面加载
   * @param {Object} options - 路由传参对象
   */
  onLoad(options)
  {
    this.parseOptions(options)

    uni.setNavigationBarTitle({
      title: this.proc.namec || '发起流程'
    })
  },

  // 13. methods
  methods:
  {
    /**
     * 解析路由参数并初始化页面数据
     * @param {Object} options - 路由传参对象
     */
    parseOptions(options)
    {
      if (!options) return

      // 解析表单状态
      if (options.attState)
      {
        this.attState = options.attState
      }
    
      // 解析预填充数据（encodeURIComponent 编码的 JSON 字符串）
      if (options.formData)
      {
        try
        {
          this.formData = JSON.parse(decodeURIComponent(options.formData))                     
        }
        catch (e)
        {
          console.error('解析预填充数据失败:', e)
        }
      }

      // 支持整个 proc 对象以 encodeURIComponent 编码的 JSON 字符串方式传入
      if (options.proc)
      {
        try
        {
          this.proc = JSON.parse(decodeURIComponent(options.proc))   
          console.log('abc--',this.proc)              
        }
        catch (e)
        {
          console.error('解析 proc 配置失败:', e)
        }
      }
    },

    /**
     * success 事件处理
     * @param {Object} variables - 流程变量对象
     */
    handleSuccess(variables)
    {
      uni.showToast({
        title: '流程发起成功！',    
        duration: 2000
      })

      uni.navigateBack() 
    },

    /**
     * error 事件处理
     * @param {Object} error - 错误对象
     */
    handleError(error)
    {
      console.error('流程发起失败:', error)
    }
  }
}
</script>

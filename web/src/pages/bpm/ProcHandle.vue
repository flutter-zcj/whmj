<style lang="scss" scoped>
.bpm-handle-page { position: relative; width: 100%; min-height: 100vh; background: #f5f5f5; }
</style>

<template>
  <view class="bpm-handle-page">
    <cx2-bpm-handle
      ref="bpmHandle"
      :taskBean="taskBean"
    />    
  </view>
</template>

<script>
/**
 * 页面名称：ProcHandle
 * 功能说明：流程办理页面，基于 cx2-bpm-handle 组件组合表单、附件、审核意见、操作按钮等
 * 研发时间：2026/06/02
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入）：
 * @param {String} task - 流程任务对象（JSON 编码）
 *
 * 事件说明：
 * @event fld-change - 字段值变更事件
 * @event tap-button - 操作按钮点击事件
 */

/**
 * 修改时间       人员        说明
 * 2026/06/01     郑朝军      初始创建（多表单流程发起示例）
 * 2026/06/02     郑朝军      重构为流程办理页面，使用 cx2-bpm-handle 组件
 */

export default
{
  name: 'ProcHandle',

  data()
  {
    return {
      taskBean: {}
    }
  },

  onLoad(options)
  {
    if (options.task)
    {
      try
      {
        const taskBean = JSON.parse(decodeURIComponent(options.task))
        this.taskBean = taskBean
        this.setPageTitle(taskBean)
      }
      catch (e)
      {
        console.error('ProcHandle: 解析 task 参数失败', e)
        uni.cxapp.Toast('参数解析失败')
        this.setPageTitle()
      }
    }
    else
    {
      this.setPageTitle()
    }
  },

  methods:
  {
    /**
     * 根据 processDefinitionId 从 procs 列表中匹配 proc 对象
     * @param {String} prockey - processDefinitionId
     * @returns {Object|null} 匹配的 proc 对象
     */
    getProcKey(prockey)
    {
      if (!prockey) return null
      try
      {
        const procs = uni.cxapp.InitSvrMethod.getProcess()
        if (!Array.isArray(procs)) return null
        for (let i = 0; i < procs.length; i++)
        {
          if (procs[i].prockey === prockey || prockey.toString().startsWith(procs[i].prockey))
          {
            return procs[i]
          }
        }
        return null
      }
      catch (e)
      {
        console.warn('ProcHandle: getProcKey 失败', e)
        return null
      }
    },

    /**
     * 设置导航栏标题：优先使用 proc.namec，匹配不到使用 taskBean.processName
     * @param {Object} taskBean - 流程任务对象
     */
    setPageTitle(taskBean = {})
    {
      const proc = this.getProcKey(taskBean.processDefinitionId)
      const title = (proc && proc.namec) || taskBean.processName
      uni.setNavigationBarTitle({ title })
    }
  }
}
</script>

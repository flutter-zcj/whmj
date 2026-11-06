<style lang="scss" scoped>
.bpm-usertask-page { position: relative; width: 100%; min-height: 100vh; background: #f5f5f5; }
</style>

<template>
  <!-- 🚀 待办任务列表页面 -->
  <view class="bpm-usertask-page">
    <z-paging
      ref="paging"
      v-model="taskList"
      @query="queryList"
    >
      <cx2-bpm-user-task
        ref="bpmUserTask"
        :prockey="prockey"
        :mList="taskList"
        @task-click="handleTaskClick"
      >
        <template #actions="{ item }">
       
        </template>
      </cx2-bpm-user-task>
    </z-paging>
  </view>
</template>

<script>
/**
 * 页面名称：UserTaskPage
 * 功能说明：待办箱页面，展示当前用户的待办任务卡片列表，
 *          支持签收办理和点击查看任务详情
 * 研发时间：2026/06/01
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入）：
 * @param {String} prockey - 流程标识，用于筛选特定流程的待办任务（可选，不传则查全部）
 * @param {String} title - 页面标题，默认 "待办箱"
 * @param {String} actionBtnText - 操作按钮文案，默认 "签收办理"
 * @param {String} targetPage - 签收后跳转的目标页面路由，默认 "pages/bpm/ProcHandlePage"
 *
 * 事件说明：无（页面内部处理）
 *
 * 插槽说明：无
 */

/**
 * 修改时间       人员        说明
 * 2026/06/01     郑朝军      初始创建，基于 cx2-bpm-user-task 组件实现待办箱页面
 */

/**
 * 服务端参数键名常量（与后端 CxSvrConst 保持一致）
 */
const SVR = {
  id: 'id'
}

export default
{
  name: 'UserTaskPage',

  // 4. data
  data()
  {
    return {
      // 🚀 任务列表数据
      taskList: [],

      // 🚀 流程标识（空字符串表示查询全部流程的待办）
      prockey: '',
 
      // 🚀 操作按钮文案
      actionBtnText: '签收办理',

      // 🚀 是否已首次加载（避免 onShow 和 z-paging auto 重复触发 reload）
      _hasFirstShow: false
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
      title: this.pageTitle || '候选箱'
    })
  },

  /**
   * 页面显示时刷新列表（首次由 z-paging auto 自动加载，后续从其他页面返回时主动 reload）
   */
  onShow()
  {
    if (this._hasFirstShow && this.$refs.paging)
    {
      this.$refs.paging.reload()
    }
    this._hasFirstShow = true
  },

  // 13. methods
  methods:
  {
    /**
     * 查询待办任务列表（z-paging @query 事件）
     * @param {Number} pageNo - 页码
     * @param {Number} pageSize - 每页条数
     */
    async queryList(pageNo, pageSize)
    {
      try
      {
        console.log('UserTask: z-paging query 触发', {
          pageNo,
          pageSize,
          hasPagingRef: !!this.$refs.paging,
          hasBpmUserTaskRef: !!this.$refs.bpmUserTask
        })

        const { list, total } = await this.$refs.bpmUserTask.queryList(pageNo, pageSize)
        console.log('UserTask: bpmUserTask.queryList 返回', {
          list,
          listIsArray: Array.isArray(list),
          listLength: Array.isArray(list) ? list.length : 'not-array',
          total
        })

        const completeList = Array.isArray(list) ? list : []
        console.log('UserTask: 调用 z-paging.complete', {
          listLength: completeList.length,
          total,
          hasTotal: typeof total === 'number'
        })
        if (typeof total === 'number')
        {
          this.$refs.paging.complete(completeList, total)
        }
        else
        {
          this.$refs.paging.complete(completeList)
        }
      }
      catch (err)
      {
        console.error('UserTask: 查询待办任务失败', {
          error: err,
          pageNo,
          pageSize
        })
        if (this.$refs.paging)
        {
          this.$refs.paging.complete(false)
        }
      }
    },
    /**
     * 解析路由参数并初始化页面数据
     * @param {Object} options - 路由传参对象
     */
    parseOptions(options)
    {
      if (!options) return

      // 解析流程标识
      if (options.prockey)
      {
        this.prockey = options.prockey
      }

      // 解析页面标题
      if (options.title)
      {
        this.pageTitle = options.title
      }

      // 解析目标页面路由
      if (options.targetPage)
      {
        this.targetPage = options.targetPage
      }

      // 解析按钮文案
      if (options.actionBtnText)
      {
        this.actionBtnText = options.actionBtnText
      }
    },

    /**
     * 卡片点击事件处理 —— 跳转任务详情
     * @param {Object} item - 被点击的任务数据对象
     */
    handleTaskClick(item)
    {
      console.log('UserTaskPage: 签收成功，跳转处理页面', item)

      const pageUrl = this.targetPage || 'pages/bpm/ProcHandlePage'
      uni.navigateTo({ url: `${pageUrl}?taskId=${item.id || item.taskId}` })
    },

    /**
     * 签收办理按钮点击事件处理
     * @param {Object} item - 当前任务数据对象
     */
    async handleClaimTask(item)
    {
      try
      {
        const param = { [SVR.id]: item[SVR.id] }
        const response = await uni.cxapp.BpmSvr.claimTask(param)

        uni.showToast({
          title: '签收成功',
          icon: 'success',
          duration: 1500
        })

        // 签收成功后刷新列表
        this.$refs.paging.reload()

        // 发送全局事件，通知其他页面刷新
        uni.$emit('refresh-user-task')

        console.log('UserTaskPage: 签收成功', response)
      }
      catch (e)
      {
        console.error('UserTaskPage: 签收失败', e)
        uni.cxapp.Toast('签收失败')
      }
    }
  }
}
</script>

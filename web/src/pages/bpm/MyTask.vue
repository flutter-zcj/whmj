<style lang="scss" scoped>
.bpm-mytask-page { position: relative; width: 100%; min-height: 100vh; background: #f5f5f5; }
</style>

<template>
  <!-- 🚀 我的任务列表页面 -->
  <view class="bpm-mytask-page">
    <z-paging
      ref="paging"
      v-model="taskList"
      @query="queryList"
    >
      <cx2-bpm-mytask
        ref="bpmMyTask"
        :mList="taskList"
        @click-item="handleClickItem"
      />
    </z-paging>
  </view>
</template>

<script>
/**
 * 页面名称：MyTaskPage
 * 功能说明：我的任务列表页面，基于 cx2-bpm-mytask 组件展示当前用户发起的流程任务列表，
 *          支持搜索、下拉刷新和上拉加载更多，点击卡片查看业务数据详情
 * 研发时间：2026/06/02
 * 研发人员：郑朝军
 *
 * 路由参数说明（通过 options 传入）：
 * @param {String} title - 页面标题，默认 "我的任务"
 * @param {String} targetPage - 点击跳转的目标页面路由，默认 "pages/bpm/ProcHandlePage"
 *
 * 事件说明：无（页面内部处理）
 *
 * 插槽说明：无
 */

/**
 * 修改时间       人员        说明
 * 2026/06/02     郑朝军       初始创建，基于 cx2-bpm-mytask 组件实现我的任务页面
 */

export default
{
  name: 'MyTaskPage',

  data()
  {
    return {
      // 🚀 任务列表数据
      taskList: [],

      // 🚀 点击卡片后跳转的目标页面
      targetPage: '',

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
    if (options && options.title)
    {
      uni.setNavigationBarTitle({ title: options.title })
    }
    else
    {
      uni.setNavigationBarTitle({ title: '待办箱' })
    }

    if (options && options.targetPage)
    {
      this.targetPage = options.targetPage
    }
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

  methods:
  {
    /**
     * 查询任务列表（z-paging @query 事件）
     * @param {Number} pageNo - 页码
     * @param {Number} pageSize - 每页条数
     */
    async queryList(pageNo, pageSize)
    {
      try
      {
        const { list, total } = await this.$refs.bpmMyTask.queryList(pageNo, pageSize)
     
        this.$refs.paging.complete(list, total)
      }
      catch (err)
      {
        console.error('MyTask: 查询任务列表失败', err)
        this.$refs.paging.complete(false)
      }
    },
    /**
     * 卡片点击事件处理 —— 跳转目标页面
     * @param {Object} detail - 点击事件参数对象
     * @param {Object} detail.item - 任务数据对象
     * @param {Object} detail.majMinObj - 主子类型 { major, minor }
     * @param {Object} detail.businessData - 业务数据
     * @param {String} detail.businessId - 业务数据 ID
     */
    handleClickItem(detail)
    {
      const pageUrl = this.targetPage || 'pages/bpm/ProcHandlePage'

      uni.navigateTo({
        url: `${pageUrl}?item=${encodeURIComponent(JSON.stringify(detail.item))}&major=${detail.majMinObj.major}&minor=${detail.majMinObj.minor}&businessId=${detail.businessId}`
      })
    }
  }
}
</script>

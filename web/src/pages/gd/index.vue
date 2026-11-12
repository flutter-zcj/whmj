<style scoped>
.gd-jump { position: fixed; left: 0; top: 0; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #06180f; }
.gd-jump__text { position: relative; font-size: 28rpx; color: #9fe6bf; }
</style>

<template>
  <view class="gd-jump">
    <text class="gd-jump__text">正在进入掼蛋房间…</text>
  </view>
</template>

<script>
/**
 * 组件名称：gdIndex
 * 功能说明：掼蛋旧入口兼容页，把带房号的旧链接转到房间页
 * 研发时间：2026/11/12
 * 研发人员：郑朝军
 * 变量说明：无
 * 事件说明：onLoad 解析房号并 redirectTo 房间页
 * 插槽说明：无
 * 修改时间       人员        说明
 * 2026/11/12     郑朝军      牌桌拆到 gd/table，本页仅做旧链接跳转
 */
export default
{
  onLoad(query)
  {
    const opt = query || {}
    const room = opt.room ? String(opt.room) : ''

    if (room)
    {
      uni.redirectTo({
        url: `/pages/gd/room?room=${room}`,
        fail: () => uni.reLaunch({ url: '/pages/whmj/index' })
      })

      return
    }

    uni.redirectTo({
      url: '/pages/gd/room?create=1',
      fail: () => uni.reLaunch({ url: '/pages/whmj/index' })
    })
  }
}
</script>

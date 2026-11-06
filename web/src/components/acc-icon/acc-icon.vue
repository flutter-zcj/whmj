<style lang="scss" scoped>
.acc-icon { display: inline-block; flex-shrink: 0; background-color: #9ca3af; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; }
</style>
<template>
  <view class="acc-icon" :style="iconStyle" />
</template>
<script>
/**
 * 组件名称：acc-icon
 * 功能说明：线性图标组件，用 CSS mask 给同一份 SVG 着色，支持任意尺寸与颜色
 * 研发时间：2026/10/28
 * 研发人员：郑朝军
 *
 * 参数说明：
 * @prop {String} name  - 图标名，取值见 icon-paths.js
 * @prop {Number} size  - 图标边长，单位 rpx
 * @prop {String} color - 图标颜色
 *
 * 变量说明：
 * @data {Object} none - 组件无本地状态
 *
 * 事件说明：
 * @event iconStyle - 计算图标的尺寸、颜色与遮罩地址
 *
 * 插槽说明：
 */

/**
 * 修改时间       人员        说明
 * 2026/10/28     郑朝军      初始创建
 */
import { iconUri } from '@/utils/account/icon-paths.js'

export default
{
  props:
  {
    name: { type: String, default: 'more' },
    size: { type: Number, default: 40 },
    color: { type: String, default: '#9CA3AF' }
  },

  computed:
  {
    /**
     * 计算图标的尺寸、颜色与遮罩地址
     * @returns {Object} 行内样式对象
     */
    iconStyle()
    {
      const uri = `url("${iconUri(this.name)}")`

      return {
        width: `${this.size}rpx`,
        height: `${this.size}rpx`,
        backgroundColor: this.color,
        WebkitMaskImage: uri,
        maskImage: uri
      }
    }
  }
}
</script>

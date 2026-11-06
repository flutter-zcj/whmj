<style lang="scss">
  @import "uview-plus/index.scss";
  @import "style/index.scss";

  /* #ifdef H5 */
  /* 横屏适配：页面根链条必须撑满，旋转后的容器才能铺满屏幕 */
  html, body { height: 100%; margin: 0; overflow: hidden; }
  uni-app, uni-page, uni-page-wrapper, uni-page-body { height: 100%; }
  /* #endif */
</style>
<template>

</template>
<script>
  import axios from 'axios'
  // #ifdef H5
  import { setupLandscape } from '@/utils/orientation.js'
  // #endif
  // #ifdef APP-PLUS
  import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";
  // #endif

/** 注入原版方正粗楷字体，登录页与大厅共用 */
function injectMahjongFont()
{
  if (typeof document === 'undefined' || document.getElementById('mj-font'))
  {
    return
  }

  let base = '/'

  try
  {
    base = import.meta.env.BASE_URL || '/'
  }
  catch (e)
  {
    base = '/'
  }

  base = base.replace(/\/+$/, '')

  const style = document.createElement('style')

  style.id = 'mj-font'
  style.textContent = "@font-face{font-family:'MJ Kai';src:url('" + base + "/static/mahjong/font/kai.woff2') format('woff2');font-display:swap;}"
  document.head.appendChild(style)
}

  export default
  {
    onLaunch()
    {
      uni.vm = this;
      injectMahjongFont();
      // #ifdef H5
      setupLandscape();
      // #endif
      // #ifdef APP-PLUS
      axios.defaults.adapter = createUniAppAxiosAdapter();
      uni.cxapp.Service.server = 'http://192.168.2.207:39092/oadev/zgis'
      // #endif
      uni.vm.$axios = axios;
      this.refresh = false;
      uni.cxapp.LoadingInterceptor.start()
    },
    onShow()
    {},
    onHide() {},
  }
</script>

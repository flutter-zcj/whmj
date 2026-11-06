/**
 * 组件名称：mahjongOrientation
 * 功能说明：H5 强制横屏适配，竖屏浏览时把页面根元素顺时针旋转 90 度，
 *          旋转后容器宽 = 屏幕高、容器高 = 屏幕宽，页面按横屏布局展示；
 *          设备本身处于横屏（宽 > 高）时不做任何变换，直接使用原生横屏视口
 * 研发时间：2026/11/04
 * 研发人员：郑朝军
 *
 * 变量说明：
 * @param {Boolean} bound - 是否已注册监听，避免重复绑定
 *
 * 事件说明：
 * @event setupLandscape - 安装 resize / orientationchange 监听并立即应用
 *
 * 插槽说明：
 */

/** 是否已绑定全局监听 */
let bound = false

/**
 * 判断当前是否处于「竖屏需旋转」状态
 * @returns {Boolean} 竖屏返回 true
 */
export function isPortrait()
{
  if (typeof window === 'undefined')
  {
    return false
  }

  return window.innerHeight > window.innerWidth
}

/**
 * 把页面根元素旋转为横屏
 * 旋转矩阵：容器坐标 (x, y) 映射到屏幕 (vw - y, x)，
 * 因此输入坐标换算时用「屏幕 y 当横坐标、屏幕右边界减 x 当纵坐标」
 */
function apply()
{
  const el = document.querySelector('uni-app') || document.getElementById('app')

  if (!el)
  {
    return
  }

  const vw = window.innerWidth
  const vh = window.innerHeight

  if (vh > vw)
  {
    /* 竖屏：顺时针旋转 90 度，容器尺寸与屏幕宽高互换 */
    const transform = `translate(${vw}px, 0) rotate(90deg)`

    if (el.style.transform !== transform)
    {
      el.style.position = 'fixed'
      el.style.left = '0'
      el.style.top = '0'
      el.style.width = `${vh}px`
      el.style.height = `${vw}px`
      el.style.transformOrigin = '0 0'
      el.style.transform = transform
    }
  }
  else if (el.style.transform)
  {
    el.style.cssText = ''
  }
}

/** 防抖定时器，避免路由切换时频繁重排 */
let debounce = null

/**
 * 路由切换（reLaunch / navigateTo）会重建 uni-app 根元素，
 * 内联旋转样式随元素丢失，这里通过 DOM 变更观察器补挂
 */
function schedule()
{
  if (debounce)
  {
    return
  }

  debounce = setTimeout(() =>
  {
    debounce = null
    apply()
  }, 80)
}

/**
 * 安装横屏适配，仅 H5 端生效
 * uni-app 根元素在启动后才渲染，因此延迟补挂几次
 */
export function setupLandscape()
{
  if (typeof document === 'undefined' || bound)
  {
    return
  }

  bound = true

  window.addEventListener('resize', apply)
  window.addEventListener('orientationchange', apply)
  apply()

  /* 兜底：监听 DOM 变更，元素被重建后自动补挂旋转样式 */
  if (typeof MutationObserver !== 'undefined')
  {
    const observer = new MutationObserver(schedule)

    observer.observe(document.documentElement, { childList: true, subtree: true })
  }
  else
  {
    setInterval(apply, 1000)
  }

  setTimeout(apply, 300)
  setTimeout(apply, 1000)
}

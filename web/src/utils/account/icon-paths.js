/**
 * 记账系统线性图标
 * 图标以 stroke 路径描述，运行时转成 data URI 供 CSS mask 着色，一份资源可任意换色
 */
const ICON_PATHS = {
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  chart: 'M4 20V11M10 20V5M16 20v-6M2 20h20',
  wallet: 'M3 8h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8zM3 8l2.5-4h11L19 8M16 13.5h2.5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16.5 16.5L21 21',
  back: 'M15 5l-7 7 7 7',
  forward: 'M9 5l7 7-7 7',
  down: 'M5 9l7 7 7-7',
  close: 'M6 6l12 12M18 6L6 18',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  image: 'M4 5h16v14H4zM4 15l4-4 3 3 3-3 6 6',
  tag: 'M4 12V5h7l9 9-7 7-9-9zM8 8h.01',
  note: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h5',
  repeat: 'M4 9a5 5 0 0 1 5-5h9M18 4l-3 3 3 3M20 15a5 5 0 0 1-5 5H6M6 20l3-3-3-3',
  calendar: 'M4 6h16v14H4zM8 3v4M16 3v4M4 10h16',
  check: 'M4 12l5 5L20 6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  edit: 'M4 20h4L20 8l-4-4L4 16z',
  sliders: 'M4 8h9M17 8h3M4 16h4M12 16h8M15 8a2 2 0 1 0 0-.01M8 16a2 2 0 1 0 0-.01',
  transfer: 'M4 8h13M14 5l3 3-3 3M20 16H7M10 13l-3 3 3 3',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9z',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  coins: 'M4 8h16v8H4zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  inbox: 'M4 13l3-8h10l3 8v6H4zM4 13h5l1 2h4l1-2h5',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4',
  logout: 'M15 12H4M8 8l-4 4 4 4M14 5h6v14h-6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.4 3.1-5 7-5s7 1.6 7 5M17 4.5a3.5 3.5 0 0 1 0 7M18 15c2.4.5 4 2.1 4 5',
  mail: 'M3 7h18v10H3zM3 7l9 6 9-6',
  eye: 'M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z',
  eyeOff: 'M4 4l16 16M9.6 5.4A10.4 10.4 0 0 1 12 5.2c6.2 0 10 6 10 6a18 18 0 0 1-2.4 3.1M6.4 7.7C4.6 9.1 3.2 10.8 2.2 12.2 3.9 15 7.5 17.6 12 17.6a9.8 9.8 0 0 0 3.2-.5M10.2 10.3a2.8 2.8 0 0 0 3.6 3.9'
}

/**
 * 生成图标的 data URI
 * @param {String} name 图标名
 * @returns {String} data URI
 */
export function iconUri(name)
{
  const path = ICON_PATHS[name] || ICON_PATHS.more
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * 生成图标名列表，便于遍历校验
 * @returns {Array} 图标名数组
 */
export function iconNames()
{
  return Object.keys(ICON_PATHS)
}

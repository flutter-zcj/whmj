/**
 * 麻将前端公共常量
 * 统一牌编码、花色映射、牌名与静态资源路径，避免各页面各自维护映射表
 *
 * 牌编码与服务端 internal/rule/tile.go 完全一致：
 * 1..9 一万..九万 / 10..18 一筒..九筒 / 19..27 一条..九条 / 28 红中（赖子）
 */

/** 花色序号：万 */
export const SUIT_WAN = 0
/** 花色序号：筒 */
export const SUIT_TONG = 1
/** 花色序号：条 */
export const SUIT_TIAO = 2

/** 花色序号：字牌（仅红中） */
export const SUIT_ZI = 3

/** 红中牌编码，也是唯一的赖子 */
export const TILE_ZHONG = 28

/** 花色中文名，索引即花色序号 */
export const SUIT_NAMES = ['万', '筒', '条', '中']

/** 花色对应的资源文件前缀：万 w、筒 b、条 t、红中 z */
export const SUIT_KEYS = ['w', 'b', 't', 'z']

/** 花色代表的主题色，用于定缺标记 */
export const SUIT_COLORS = ['#E4572E', '#2F80ED', '#27AE60']

/** 点数中文 */
export const RANK_TEXT = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 一副牌总张数：108 张序数牌 + 4 张红中 */
export const WALL_SIZE = 112

/** 起手张数 */
export const HAND_SIZE = 13

/** 静态资源根路径，随 h5 的 publicPath 变化 */
export const ASSET_BASE = (function resolveBase()
{
  let base = '/'

  try
  {
    base = import.meta.env.BASE_URL || '/'
  }
  catch (e)
  {
    base = '/'
  }

  return base.replace(/\/+$/, '') + '/static/whmj'
})()

/**
 * 取牌的花色序号
 * @param {Number} tile 牌编码 1..27
 * @returns {Number} 0 万 / 1 筒 / 2 条，非法牌返回 -1
 */
export function suitOf(tile)
{
  if (tile === TILE_ZHONG)
  {
    return SUIT_ZI
  }

  if (tile < 1 || tile > 27)
  {
    return -1
  }

  return Math.floor((tile - 1) / 9)
}

/**
 * 取牌的点数
 * @param {Number} tile 牌编码 1..27
 * @returns {Number} 1..9
 */
export function rankOf(tile)
{
  if (tile === TILE_ZHONG)
  {
    return 0
  }

  return ((tile - 1) % 9) + 1
}

/**
 * 牌对应的图片 key，与 tiles 目录下的文件名一致
 * @param {Number} tile 牌编码 1..27
 * @returns {String} 形如 tile_w1
 */
export function tileKey(tile)
{
  if (tile === TILE_ZHONG)
  {
    return 'tile_z1'
  }

  const suit = suitOf(tile)

  if (suit < 0)
  {
    return 'tile_back'
  }

  return `tile_${SUIT_KEYS[suit]}${rankOf(tile)}`
}

/**
 * 牌的中文名，用于提示文案
 * @param {Number} tile 牌编码 1..27
 * @returns {String} 形如 五万
 */
export function tileName(tile)
{
  if (tile === TILE_ZHONG)
  {
    return '红中'
  }

  const suit = suitOf(tile)

  if (suit < 0)
  {
    return '未知牌'
  }

  return `${RANK_TEXT[rankOf(tile) - 1]}${SUIT_NAMES[suit]}`
}

/**
 * 判断是否为赖子
 * @param {Number} tile 牌编码
 * @returns {Boolean} 红中返回 true
 */
export function isLaizi(tile)
{
  return tile === TILE_ZHONG
}

/**
 * 牌列表按花色、点数排序（升序）
 * @param {Number[]} tiles 牌列表
 * @returns {Number[]} 排序后的新数组
 */
export function sortTiles(tiles)
{
  return tiles.slice().sort((a, b) => a - b)
}

/** 服务端返回的操作类型 */
export const OP_DISCARD = 'discard'
export const OP_PENG = 'peng'
export const OP_GANG = 'gang'
export const OP_AN_GANG = 'angang'
export const OP_BU_GANG = 'bugang'
export const OP_HU = 'hu'
export const OP_PASS = 'pass'

/** 操作类型对应的中文按钮文案 */
export const OP_TEXT =
{
  [OP_PENG]: '碰',
  [OP_GANG]: '杠',
  [OP_AN_GANG]: '暗杠',
  [OP_BU_GANG]: '补杠',
  [OP_HU]: '胡',
  [OP_PASS]: '过'
}

/** 牌局阶段 */
export const PHASE_PLAY = 'play'
export const PHASE_OVER = 'over'

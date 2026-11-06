/**
 * 牌桌渲染场景（Phaser 3，横屏 1334×750）
 *
 * 设计要点：
 * 1. 所有坐标写死在 1334×750 的设计网格上，页面用 CSS scale 整体缩放，
 *    HUD（Vue 层）与画布共用同一套像素坐标，避免 rpx 在旋转容器里被二次换算导致错位
 * 2. 所有座位按「相对我」的方位渲染：view = (seat - mySeat + 4) % 4，
 *    0 下方（我）、1 右侧、2 对家、3 左侧，换座位也能正确显示
 * 3. 竖屏旋转后 Phaser 内建命中换算失效，手牌点击统一用「原生事件坐标 → 逻辑坐标」矩形命中
 */

import Phaser from 'phaser'
import { ASSET_BASE, SUIT_NAMES, SUIT_COLORS, tileKey, suitOf } from '../const.js'

/** 逻辑画布宽度 */
export const STAGE_WIDTH = 1334

/** 逻辑画布高度 */
export const STAGE_HEIGHT = 750

/** 中央方位盘圆心与半径 */
const CENTER = { x: 667, y: 375, r: 84 }

/** 我的手牌：单张宽高、间距、底边对齐位置、选中上移量 */
const HAND = { w: 66, h: 92, gap: 3, bottom: 738, lift: 24, minW: 46 }

/** 对家牌墙（顶部横排，牌面竖放） */
const BACK_TOP = { x: 459, y: 84, pitch: 35, w: 30, h: 44 }

/** 左右两家牌墙（沿边竖排，牌旋转 90 度，显示包围盒 26×28） */
const BACK_SIDE = { rightX: 1278, leftX: 30, y: 214, pitch: 32, w: 28, h: 26 }

/**
 * 弃牌区布局
 * axis='h' 时列沿 x 展开；axis='v' 时列沿 y 展开（左右两家牌竖放，长边朝下）
 * cols × rows 即该家最多同时显示的弃牌数
 */
const POND = [
  { axis: 'h', x: 398, y: 466, cols: 15, rows: 2, colStep: 36, rowStep: 46, rot: 0 },
  { axis: 'v', x: 958, y: 290, cols: 7, rows: 3, colStep: 45, rowStep: 38, rot: 90 },
  { axis: 'h', x: 398, y: 168, cols: 15, rows: 2, colStep: 36, rowStep: 46, rot: 0 },
  { axis: 'v', x: 262, y: 290, cols: 7, rows: 3, colStep: 45, rowStep: 38, rot: 90 }
]

/** 弃牌尺寸（未旋转时） */
const POND_TILE = { w: 34, h: 42 }

/** 副露区：起点、单张显示宽高、是否旋转、是否居中、可用最大宽度 */
const MELD = [
  { x: 14, y: 596, w: 30, h: 44, rot: 0, center: false, maxW: 320 },
  { x: 928, y: 236, w: 26, h: 34, rot: 90, center: false, maxW: 144 },
  { x: 0, y: 112, w: 30, h: 44, rot: 0, center: true, maxW: 470 },
  { x: 262, y: 236, w: 26, h: 34, rot: 90, center: false, maxW: 144 }
]

/** 四家信息面板：0 我左下、1 右中、2 对家左上、3 左中 */
const PANEL = [
  { x: 1146, y: 590, w: 176, h: 58 },
  { x: 1082, y: 300, w: 176, h: 58 },
  { x: 240, y: 60, w: 176, h: 58 },
  { x: 76, y: 300, w: 176, h: 58 }
]

/** 方位名，索引为视图方位 */
const VIEW_NAMES = ['下', '右', '对', '左']

/** 全局字体 */
const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif'

/**
 * 牌桌场景
 * 通过事件回调把用户点击与动画结束通知给页面层
 */
export default class TableScene extends Phaser.Scene
{
  constructor()
  {
    super({ key: 'TableScene' })

    this.state = null
    this.selected = -1
    this.picked = []
    this.selectMode = 'none'
    this.layers = {}
    this.onTileTap = null
    this.onTileDiscard = null
    this.onPickChange = null
    this.onToast = null
    this.onReady = null
    this.countdown = 0
    /** 手牌命中区域，drawHand 时刷新 */
    this.handRects = []
    /** 我的副露总宽度，供手牌起始位置避让 */
    this.myMeldWidth = 0
  }

  /** 加载牌面与背景 */
  preload()
  {
    const keys = ['tile_back', 'tile_back_dark', 'tile_back_wall', 'tile_z1']

    for (let suit = 0; suit < 3; suit++)
    {
      const prefix = ['w', 'b', 't'][suit]

      for (let rank = 1; rank <= 9; rank++)
      {
        keys.push(`tile_${prefix}${rank}`)
      }
    }

    keys.forEach((key) =>
    {
      this.load.image(key, `${ASSET_BASE}/tiles/${key}.png`)
    })

    this.load.image('table_bg', `${ASSET_BASE}/bg/table_bg.jpg`)
    this.load.image('avatar', `${ASSET_BASE}/ui/fazai.png`)
  }

  /** 构建静态图层 */
  create()
  {
    this.drawBackground()
    this.drawTable()

    this.layers.back = this.add.container(0, 0)
    this.layers.pond = this.add.container(0, 0)
    this.layers.meld = this.add.container(0, 0)
    this.layers.hand = this.add.container(0, 0)
    this.layers.panel = this.add.container(0, 0)
    this.layers.effect = this.add.container(0, 0)

    this.drawCenter()
    this.bindInput()

    this.game.events.emit('mj-scene-ready', this)

    if (this.onReady)
    {
      this.onReady(this)
    }
  }

  /** 星空底图 + 上下压暗，保证边缘文字可读 */
  drawBackground()
  {
    const bg = this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, 'table_bg')

    bg.setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)

    const top = this.add.graphics()

    top.fillGradientStyle(0x02060e, 0x02060e, 0x02060e, 0x02060e, 0.82, 0.82, 0.1, 0.1)
    top.fillRect(0, 0, STAGE_WIDTH, 190)

    const bottom = this.add.graphics()

    bottom.fillGradientStyle(0x02060e, 0x02060e, 0x02060e, 0x02060e, 0.1, 0.1, 0.9, 0.9)
    bottom.fillRect(0, STAGE_HEIGHT - 210, STAGE_WIDTH, 210)
  }

  /** 玉面牌桌：半透绒布 + 双层描金 + 四角云纹，让星空从四周透出形成悬浮感 */
  drawTable()
  {
    const inset = 14
    const w = STAGE_WIDTH - inset * 2
    const h = STAGE_HEIGHT - inset * 2
    const radius = 32

    const g = this.add.graphics()

    /* 桌面投影 */
    g.fillStyle(0x000000, 0.42)
    g.fillRoundedRect(inset + 3, inset + 9, w, h, radius)

    /* 玉面主体：半透明墨绿，透出星空 */
    g.fillStyle(0x0A3627, 0.8)
    g.fillRoundedRect(inset, inset, w, h, radius)

    /* 顶部受光区 */
    g.fillStyle(0x1C6748, 0.2)
    g.fillRoundedRect(inset + 4, inset + 4, w - 8, 240, { tl: radius - 4, tr: radius - 4, bl: 0, br: 0 })

    /* 底部暗角 */
    g.fillStyle(0x02100A, 0.34)
    g.fillRoundedRect(inset + 4, inset + h - 190, w - 8, 186, { tl: 0, tr: 0, bl: radius - 4, br: radius - 4 })

    /* 中央极淡辉光，聚焦视线 */
    g.fillStyle(0x37996F, 0.07)
    g.fillCircle(CENTER.x, CENTER.y, 250)

    /* 双层描金边框 */
    g.lineStyle(3, 0xD9B36B, 0.5)
    g.strokeRoundedRect(inset + 9, inset + 9, w - 18, h - 18, radius - 6)
    g.lineStyle(1, 0xD9B36B, 0.22)
    g.strokeRoundedRect(inset + 19, inset + 19, w - 38, h - 38, radius - 10)

    /* 四角云纹装饰 */
    const corners = [
      { x: inset + 24, y: inset + 24, sx: 1, sy: 1 },
      { x: STAGE_WIDTH - inset - 24, y: inset + 24, sx: -1, sy: 1 },
      { x: inset + 24, y: STAGE_HEIGHT - inset - 24, sx: 1, sy: -1 },
      { x: STAGE_WIDTH - inset - 24, y: STAGE_HEIGHT - inset - 24, sx: -1, sy: -1 }
    ]

    corners.forEach((c) =>
    {
      g.lineStyle(2, 0xD9B36B, 0.4)

      for (let i = 1; i <= 3; i++)
      {
        const r = 15 * i

        g.beginPath()
        g.arc(c.x, c.y, r, c.sx > 0 ? 0 : Math.PI / 2, c.sx > 0 ? Math.PI / 2 : Math.PI, false)
        g.strokePath()
      }

      g.lineBetween(c.x, c.y, c.x + 50 * c.sx, c.y)
      g.lineBetween(c.x, c.y, c.x, c.y + 50 * c.sy)
    })
  }

  /** 中央方位盘：刻线环、剩余牌数、倒计时与四方方位字 */
  drawCenter()
  {
    const { x: cx, y: cy, r } = CENTER

    this.centerPos = { x: cx, y: cy }

    const g = this.add.graphics()

    g.fillStyle(0x04150E, 0.6)
    g.fillCircle(cx, cy, r + 12)
    g.lineStyle(2, 0xD9B36B, 0.4)
    g.strokeCircle(cx, cy, r + 12)

    g.fillStyle(0x0B2417, 0.94)
    g.fillCircle(cx, cy, r)
    g.lineStyle(2, 0xD9B36B, 0.62)
    g.strokeCircle(cx, cy, r)
    g.lineStyle(1, 0x5FD6A4, 0.3)
    g.strokeCircle(cx, cy, r - 14)

    for (let i = 0; i < 24; i++)
    {
      const a = Math.PI * 2 * i / 24
      const big = i % 6 === 0

      g.lineStyle(2, 0xD9B36B, big ? 0.7 : 0.26)
      g.lineBetween(
        cx + Math.cos(a) * (r - 2),
        cy + Math.sin(a) * (r - 2),
        cx + Math.cos(a) * (r - (big ? 14 : 8)),
        cy + Math.sin(a) * (r - (big ? 14 : 8))
      )
    }

    this.layers.effect.add(g)

    this.centerBig = this.add.text(cx, cy - 2,
    '', {
      fontFamily: FONT,
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#8FF3C4'
    }).setOrigin(0.5).setShadow(0, 0, '#1d6b4a', 16, false, true)

    this.centerLabel = this.add.text(cx, cy - 44,
    '', {
      fontFamily: FONT,
      fontSize: '17px',
      color: '#BFD9C9'
    }).setOrigin(0.5)

    this.centerFoot = this.add.text(cx, cy + 42,
    '', {
      fontFamily: FONT,
      fontSize: '17px',
      color: '#FFD98A'
    }).setOrigin(0.5)

    this.layers.effect.add([this.centerBig, this.centerLabel, this.centerFoot])

    /* 四方方位字，贴在圆盘外侧 */
    this.dirLabels = []

    VIEW_NAMES.forEach((name, i) =>
    {
      const pos = [
        { x: cx, y: cy + r + 30 },
        { x: cx + r + 40, y: cy },
        { x: cx, y: cy - r - 30 },
        { x: cx - r - 40, y: cy }
      ][i]

      const label = this.add.text(pos.x, pos.y, name,
      {
        fontFamily: FONT,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#8FA79A'
      }).setOrigin(0.5)

      this.dirLabels.push(label)
      this.layers.effect.add(label)
    })
  }

  /**
   * 绑定输入：直接监听原生事件，手动换算成逻辑坐标后矩形命中手牌
   * 不用 Phaser 的 pointer 对象，因为触摸事件下它拿不到统一的 clientX，
   * 且 Scale.NONE 下 pointer.x 是 CSS 像素而非设计坐标
   */
  bindInput()
  {
    this.lastTap = { x: 0, y: 0, at: 0 }

    const onDown = (e) =>
    {
      const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0])
      const cx = touch ? touch.clientX : e.clientX
      const cy = touch ? touch.clientY : e.clientY

      if (cx === undefined || cy === undefined)
      {
        return
      }

      /* 只有点到画布本体才处理，弹层、按钮一概放过 */
      const el = document.elementFromPoint(cx, cy)
      const onCanvas = el && (el.tagName === 'CANVAS' || (el.closest && el.closest('#mj-stage')))

      if (!onCanvas)
      {
        return
      }

      /* touchstart 与合成 pointerdown 会双发，同点 80ms 内只算一次 */
      const now = Date.now()

      if (now - this.lastTap.at < 80 && Math.abs(cx - this.lastTap.x) < 6 && Math.abs(cy - this.lastTap.y) < 6)
      {
        return
      }

      this.lastTap = { x: cx, y: cy, at: now }

      const pt = this.toStage(cx, cy)

      this.handleTap(pt.x, pt.y)
    }

    this.unbindInput = () =>
    {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('touchstart', onDown, true)
    }

    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('touchstart', onDown, true)
  }

  /**
   * 屏幕坐标转逻辑坐标
   * 竖屏旋转模式下容器坐标 (x, y) 映射到屏幕 (vw - y, x)，据此反推
   * 是否被旋转以画布包围盒为准：逻辑视口是横的，旋转后包围盒必然竖过来
   * @param {Number} clientX 屏幕 x
   * @param {Number} clientY 屏幕 y
   * @returns {Object} 逻辑坐标
   */
  toStage(clientX, clientY)
  {
    const b = this.game.canvas.getBoundingClientRect()
    const rotated = b.height > b.width

    if (!rotated)
    {
      return {
        x: (clientX - b.left) * STAGE_WIDTH / b.width,
        y: (clientY - b.top) * STAGE_HEIGHT / b.height
      }
    }

    return {
      x: (clientY - b.top) * STAGE_WIDTH / b.height,
      y: (b.right - clientX) * STAGE_HEIGHT / b.width
    }
  }

  /**
   * 逻辑坐标命中手牌
   * @param {Number} x 逻辑 x
   * @param {Number} y 逻辑 y
   */
  handleTap(x, y)
  {
    let hit = -1
    let best = 1e9

    this.handRects.forEach((rect) =>
    {
      const dx = Math.abs(x - rect.x) - rect.w / 2
      const dy = Math.abs(y - rect.y) - rect.h / 2
      const dist = Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2

      if (dx < 10 && dy < 16 && dist < best)
      {
        best = dist
        hit = rect.index
      }
    })

    if (hit < 0 || !this.state)
    {
      return
    }

    const hand = this.state.hand || []

    if (this.selectMode === 'multi')
    {
      this.pickTile(hit, hand[hit])

      return
    }

    this.selectTile(hit, hand[hit])
  }

  /**
   * 取某座位对应的视图方位
   * @param {Number} seat 座位号
   * @returns {Number} 0 我 / 1 右 / 2 对 / 3 左
   */
  viewOf(seat)
  {
    const me = (this.state && this.state.mySeat) || 0

    return ((seat - me) % 4 + 4) % 4
  }

  /**
   * 更新中央倒计时
   * @param {Number} seconds 剩余秒数
   * @param {Number} turnSeat 当前行动座位
   * @param {Number} mySeat 我的座位
   */
  setCountdown(seconds, turnSeat, mySeat)
  {
    if (!this.centerBig)
    {
      return
    }

    this.countdown = seconds || 0

    const remain = (this.state && this.state.remain) || 0

    if (this.countdown > 0)
    {
      this.centerBig.setText(String(this.countdown).padStart(2, '0'))
      this.centerBig.setColor(this.countdown <= 3 ? '#FF9A6B' : '#8FF3C4')
      this.centerLabel.setText('倒计时')
      this.centerFoot.setText(turnSeat === mySeat ? '轮到你了' : '等待中')
    }
    else
    {
      this.centerBig.setText(String(remain))
      this.centerBig.setColor('#F5E6C8')
      this.centerLabel.setText('剩余牌数')
      this.centerFoot.setText('')
    }

    if (this.dirLabels)
    {
      this.dirLabels.forEach((label, i) =>
      {
        label.setColor(i === this.viewOf(turnSeat) ? '#FFD75E' : '#8FA79A')
      })
    }
  }

  /**
   * 创建一张牌
   * @param {String} key 贴图 key
   * @param {Number} x 中心 x
   * @param {Number} y 中心 y
   * @param {Number} w 显示宽
   * @param {Number} h 显示高
   * @param {Number} [rot] 旋转角度
   * @returns {Phaser.GameObjects.Image} 牌图
   */
  makeTile(key, x, y, w, h, rot)
  {
    const img = this.add.image(x, y, key)

    img.setDisplaySize(w, h)

    if (rot)
    {
      img.setAngle(rot)
    }

    return img
  }

  /**
   * 应用视图状态并重绘
   * @param {Object} state 视图状态
   */
  applyState(state)
  {
    if (!state)
    {
      return
    }

    const handChanged = !this.state || (this.state.hand || []).join(',') !== (state.hand || []).join(',')

    this.state = state

    this.drawBacks()
    this.drawPonds()
    this.drawMelds()
    this.drawHand()
    this.drawPanels()
    this.setCountdown(state.countdown || 0, state.turn, state.mySeat || 0)

    if (!handChanged && this.selected >= (state.hand || []).length)
    {
      this.selected = -1
    }
  }

  /** 绘制三家暗牌 */
  drawBacks()
  {
    this.layers.back.removeAll(true)

    const seats = this.state.seats || []
    const me = this.state.mySeat || 0

    seats.forEach((seat, index) =>
    {
      if (index === me || !seat || !seat.tileCount)
      {
        return
      }

      const view = this.viewOf(index)
      const count = Math.min(seat.tileCount, 14)

      for (let i = 0; i < count; i++)
      {
        let x = 0
        let y = 0
        let w = BACK_TOP.w
        let h = BACK_TOP.h

        if (view === 2)
        {
          x = BACK_TOP.x + i * BACK_TOP.pitch + w / 2
          y = BACK_TOP.y
        }
        else
        {
          const bx = view === 1 ? BACK_SIDE.rightX : BACK_SIDE.leftX

          w = BACK_SIDE.w
          h = BACK_SIDE.h
          x = bx + w / 2
          y = BACK_SIDE.y + i * BACK_SIDE.pitch + h / 2
        }

        this.layers.back.add(this.makeTile('tile_back_wall', x, y, w, h, view === 1 || view === 3 ? 90 : 0))
      }
    })
  }

  /** 绘制四方弃牌堆，超过容量时只保留最近的牌 */
  drawPonds()
  {
    this.layers.pond.removeAll(true)

    const seats = this.state.seats || []

    seats.forEach((seat, index) =>
    {
      if (!seat || !seat.discards || !seat.discards.length)
      {
        return
      }

      const view = this.viewOf(index)
      const layout = POND[view]
      const capacity = layout.cols * layout.rows
      const list = seat.discards.length > capacity
        ? seat.discards.slice(seat.discards.length - capacity)
        : seat.discards

      list.forEach((tile, i) =>
      {
        const col = i % layout.cols
        const row = Math.floor(i / layout.cols)
        const rot = layout.rot
        const bw = rot ? POND_TILE.h : POND_TILE.w
        const bh = rot ? POND_TILE.w : POND_TILE.h

        const x = layout.axis === 'h'
          ? layout.x + col * layout.colStep + bw / 2
          : layout.x + row * layout.rowStep + bw / 2
        const y = layout.axis === 'h'
          ? layout.y + row * layout.rowStep + bh / 2
          : layout.y + col * layout.colStep + bh / 2

        const img = this.makeTile(tileKey(tile), x, y, POND_TILE.w, POND_TILE.h, rot)

        /* 每家最后一张弃牌加亮边，便于看清刚打出的牌 */
        if (i === list.length - 1)
        {
          const mark = this.add.graphics()

          mark.lineStyle(2, 0xFFD75E, 0.95)
          mark.strokeRoundedRect(x - bw / 2 - 1, y - bh / 2 - 1, bw + 2, bh + 2, 5)
          this.layers.pond.add(mark)
          this.tweens.add({ targets: mark, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 })
        }

        this.layers.pond.add(img)
      })
    })
  }

  /** 绘制四方副露 */
  drawMelds()
  {
    this.layers.meld.removeAll(true)
    this.myMeldWidth = 0

    const seats = this.state.seats || []
    const me = this.state.mySeat || 0

    seats.forEach((seat, index) =>
    {
      if (!seat || !seat.melds || !seat.melds.length)
      {
        return
      }

      const view = this.viewOf(index)
      const layout = MELD[view]
      /* 服务端 type：1 碰、2 明杠、3 暗杠、4 补杠 */
      const counts = seat.melds.map((meld) => (meld.type === 1 ? 3 : 4))
      const bw = layout.rot ? layout.h : layout.w
      const pitch = bw + 2
      let total = 0

      counts.forEach((c) =>
      {
        total += c * pitch + 8
      })

      total -= 8

      /* 超宽时整体缩小，避免压到别家区域 */
      const scale = total > layout.maxW ? layout.maxW / total : 1
      const sw = layout.w * scale
      const sh = layout.h * scale
      const sp = (bw * scale) + 2
      total *= scale

      let cursor = layout.center ? Math.round((STAGE_WIDTH - total) / 2) : layout.x

      if (view === 0)
      {
        this.myMeldWidth = total
      }

      seat.melds.forEach((meld, mi) =>
      {
        /* 暗杠对他人不可见，用牌背表示 */
        const key = meld.type === 3 && index !== me ? 'tile_back_wall' : tileKey(meld.tile)

        for (let i = 0; i < counts[mi]; i++)
        {
          const x = cursor + i * sp + (bw * scale) / 2
          const y = layout.y + sh / 2

          this.layers.meld.add(this.makeTile(key, x, y, sw, sh, layout.rot))
        }

        cursor += counts[mi] * sp + 8 * scale
      })
    })
  }

  /**
   * 设置手牌交互模式
   * @param {String} mode single 出牌单选 / multi 换三张多选 / none 只读
   */
  setSelectMode(mode)
  {
    const next = mode || 'none'

    if (this.selectMode === next)
    {
      return
    }

    this.selectMode = next
    this.selected = -1
    this.picked = []

    if (this.state)
    {
      this.drawHand()
    }
  }

  /** 取当前换三张已选的牌 */
  pickedTiles()
  {
    return (this.picked || []).slice()
  }

  /**
   * 当前这张牌是否允许操作
   * @returns {Object} { ok, reason }
   */
  selectableNow()
  {
    const state = this.state || {}
    const mySeat = state.mySeat || 0
    const seat = (state.seats || [])[mySeat]
    const mode = this.selectMode || 'none'

    if (mode === 'none')
    {
      return { ok: false, reason: state.phase === 'que' ? '请先选择定缺花色' : '牌局还未开始' }
    }

    if (mode === 'multi')
    {
      return { ok: true, reason: '' }
    }

    if (seat && seat.finished)
    {
      return { ok: false, reason: '你已胡牌，本局观战中' }
    }

    if (state.phase !== 'play')
    {
      return { ok: false, reason: '当前不能出牌' }
    }

    if (state.turn !== mySeat)
    {
      const nick = ((state.seats || [])[state.turn] || {}).nick || '对手'

      return { ok: false, reason: `还没轮到你，正在等 ${nick} 出牌` }
    }

    return { ok: true, reason: '' }
  }

  /** 绘制我的手牌 */
  drawHand()
  {
    this.layers.hand.removeAll(true)
    this.handRects = []

    const hand = this.state.hand || []

    if (!hand.length)
    {
      return
    }

    const startMin = Math.max(210, 14 + this.myMeldWidth + 20)
    const gap = hand.length >= 14 ? HAND.gap : 6
    const avail = 1322 - startMin
    let tw = Math.min(HAND.w, Math.floor((avail - (hand.length - 1) * gap) / hand.length))

    tw = Math.max(HAND.minW, tw)

    const th = Math.round(tw * HAND.h / HAND.w)
    const total = hand.length * tw + (hand.length - 1) * gap
    const startX = Math.max(startMin, Math.round((STAGE_WIDTH - total) / 2))
    const baseY = HAND.bottom - th / 2
    const seat = (this.state.seats || [])[this.state.mySeat || 0]
    const queSuit = seat && seat.que !== undefined ? seat.que : -1
    const mode = this.selectMode || 'none'

    hand.forEach((tile, i) =>
    {
      const picked = mode === 'multi' ? this.picked.includes(i) : this.selected === i
      const x = startX + i * (tw + gap) + tw / 2
      const y = baseY - (picked ? HAND.lift : 0)

      if (queSuit >= 0 && suitOf(tile) === queSuit)
      {
        const mask = this.add.rectangle(x, y, tw, th, 0x0a1a12, 0.34)

        this.layers.hand.add(mask)
      }

      const img = this.makeTile(tileKey(tile), x, y, tw, th)

      this.layers.hand.add(img)

      if (picked)
      {
        const edge = this.add.graphics()

        edge.lineStyle(3, 0xFFD75E, 1)
        edge.strokeRoundedRect(x - tw / 2 - 2, y - th / 2 - 2, tw + 4, th + 4, 6)
        this.layers.hand.add(edge)
      }

      this.handRects.push({ index: i, x, y: baseY, w: tw, h: th })
    })
  }

  /**
   * 选中/取消选中一张手牌，再次点击同一张视为确认出牌
   * @param {Number} index 手牌下标
   * @param {Number} tile 牌编码
   */
  selectTile(index, tile)
  {
    if (!tile)
    {
      return
    }

    const allow = this.selectableNow()
    const wasSelected = this.selected === index

    this.selected = wasSelected ? -1 : index

    this.drawHand()

    if (this.onTileTap)
    {
      this.onTileTap(tile, this.selected, allow.ok, allow.reason)
    }

    if (!allow.ok)
    {
      if (this.onToast)
      {
        this.onToast(allow.reason)
      }

      return
    }

    /* 连点同一张：直接出牌，省掉一次「找到出牌按钮」的操作 */
    if (wasSelected && this.onTileDiscard)
    {
      this.onTileDiscard(tile, index)
    }
  }

  /**
   * 换三张：多选一张牌
   * @param {Number} index 手牌下标
   * @param {Number} tile 牌编码
   */
  pickTile(index, tile)
  {
    if (!tile)
    {
      return
    }

    const hand = this.state.hand || []
    const at = this.picked.indexOf(index)

    if (at >= 0)
    {
      this.picked.splice(at, 1)
    }
    else
    {
      if (this.picked.length >= 3)
      {
        this.onToast && this.onToast('换三张只能选三张牌')

        return
      }

      if (this.picked.length && suitOf(hand[this.picked[0]]) !== suitOf(tile))
      {
        this.onToast && this.onToast('三张牌必须是同一花色')

        return
      }

      this.picked.push(index)
    }

    this.drawHand()

    if (this.onPickChange)
    {
      this.onPickChange(this.picked.map((i) => hand[i]))
    }
  }

  /** 兼容旧调用：直接按牌面下标选择 */
  handleTileTap(index, tile)
  {
    if (this.selectMode === 'multi')
    {
      this.pickTile(index, tile)

      return
    }

    this.selectTile(index, tile)
  }

  /**
   * 取面板中心
   * @param {Number} seat 座位号
   * @returns {Object} 中心坐标
   */
  panelPos(seat)
  {
    const p = PANEL[this.viewOf(seat)] || PANEL[0]

    return { x: p.x + p.w / 2, y: p.y + p.h / 2 }
  }

  /** 绘制四家信息面板 */
  drawPanels()
  {
    this.layers.panel.removeAll(true)

    const seats = this.state.seats || []
    const me = this.state.mySeat || 0

    seats.forEach((seat, index) =>
    {
      if (!seat)
      {
        return
      }

      const view = this.viewOf(index)
      const box = PANEL[view]
      const active = this.state.turn === index && this.state.phase === 'play'
      const self = index === me

      const g = this.add.graphics()

      g.fillStyle(0x04150E, 0.78)
      g.fillRoundedRect(box.x, box.y, box.w, box.h, 14)
      g.lineStyle(2, active ? 0xFFD75E : 0x3C5348, active ? 1 : 0.55)
      g.strokeRoundedRect(box.x, box.y, box.w, box.h, 14)

      if (active)
      {
        g.lineStyle(3, 0xFFD75E, 0.32)
        g.strokeRoundedRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8, 17)
      }

      this.layers.panel.add(g)

      const cxAvatar = box.x + 30

      const ring = this.add.graphics()

      ring.lineStyle(2.5, active ? 0xFFD75E : 0xD9B36B, active ? 1 : 0.5)
      ring.strokeCircle(cxAvatar, box.y + box.h / 2, 21)
      this.layers.panel.add(ring)

      const avatar = this.add.image(cxAvatar, box.y + box.h / 2, 'avatar')

      avatar.setDisplaySize(34, 34)
      avatar.setAlpha(seat.finished ? 0.4 : 1)
      this.layers.panel.add(avatar)

      const nick = this.add.text(box.x + 58, box.y + 9,
      '', {
        fontFamily: FONT,
        fontSize: '16px',
        color: seat.finished ? '#8A9A90' : '#FFFFFF'
      })

      nick.setText(this.ellipsis(self ? `我 · ${seat.nick || '玩家'}` : (seat.nick || '玩家'), 6))
      this.layers.panel.add(nick)

      const score = this.add.text(box.x + 58, box.y + 31,
      '', {
        fontFamily: FONT,
        fontSize: '18px',
        fontStyle: 'bold',
        color: (seat.score || 0) >= 0 ? '#7BE3A5' : '#FF9A9A'
      })

      score.setText(`${(seat.score || 0) >= 0 ? '+' : ''}${seat.score || 0}`)
      this.layers.panel.add(score)

      /* 定缺标记 */
      if (seat.que !== undefined && seat.que !== null && seat.que >= 0)
      {
        const tag = this.add.text(box.x + box.w - 6, box.y - 4,
        '', {
          fontFamily: FONT,
          fontSize: '13px',
          color: '#FFFFFF',
          backgroundColor: SUIT_COLORS[seat.que]
        })

        tag.setText(`缺${SUIT_NAMES[seat.que]}`)
        tag.setOrigin(1, 0)
        tag.setPadding(4, 2, 4, 2)
        this.layers.panel.add(tag)
      }

      /* 庄家标记 */
      if (seat.isBanker)
      {
        const zhuang = this.add.text(box.x + 4, box.y - 4,
        '', {
          fontFamily: FONT,
          fontSize: '13px',
          color: '#3B2A08',
          backgroundColor: '#F2C14E'
        })

        zhuang.setText('庄')
        zhuang.setOrigin(0, 0)
        zhuang.setPadding(4, 2, 4, 2)
        this.layers.panel.add(zhuang)
      }

      if (seat.ting)
      {
        const ting = this.add.text(box.x + 4, box.y + box.h + 4,
        '', {
          fontFamily: FONT,
          fontSize: '13px',
          color: '#FFFFFF',
          backgroundColor: '#E4572E'
        })

        ting.setText('听')
        ting.setOrigin(0, 0)
        ting.setPadding(4, 2, 4, 2)
        this.layers.panel.add(ting)
      }

      if (seat.finished)
      {
        const over = this.add.text(box.x + box.w / 2, box.y + box.h / 2,
        '', {
          fontFamily: FONT,
          fontSize: '18px',
          color: '#FFD75E'
        })

        over.setText('已胡')
        over.setOrigin(0.5)
        this.layers.panel.add(over)
      }
    })
  }

  /**
   * 截断过长昵称
   * @param {String} text 原文本
   * @param {Number} max 最大字数
   * @returns {String} 截断后的文本
   */
  ellipsis(text, max)
  {
    return text.length > max ? `${text.slice(0, max)}…` : text
  }

  /**
   * 在座位附近弹出提示文字
   * @param {Number} seat 座位号
   * @param {String} text 文案
   * @param {String} [color] 文字颜色
   */
  floatText(seat, text, color = '#FFD75E')
  {
    const pos = this.panelPos(seat)
    const content = typeof text === 'string' ? text : ''

    if (!content)
    {
      return
    }

    const label = this.add.text(pos.x, pos.y - 40, content,
    {
      fontFamily: FONT,
      fontSize: '30px',
      fontStyle: 'bold',
      color,
      stroke: '#0B1A12',
      strokeThickness: 5
    })

    label.setOrigin(0.5).setScale(0.5)
    this.layers.effect.add(label)

    this.tweens.add(
    {
      targets: label,
      scale: 1,
      duration: 240,
      ease: 'Back.Out',
      onComplete: () =>
      {
        this.tweens.add(
        {
          targets: label,
          alpha: 0,
          y: label.y - 42,
          delay: 700,
          duration: 340,
          onComplete: () => label.destroy()
        })
      }
    })
  }

  /**
   * 摸牌动画：一张牌背从中央飞向座位方向
   * @param {Number} seat 座位号
   */
  drawAnim(seat)
  {
    const target = this.panelPos(seat)
    const ghost = this.makeTile('tile_back', CENTER.x, CENTER.y, POND_TILE.w, POND_TILE.h)

    this.layers.effect.add(ghost)

    this.tweens.add(
    {
      targets: ghost,
      x: target.x,
      y: target.y,
      alpha: 0.15,
      duration: 280,
      ease: 'Quad.Out',
      onComplete: () => ghost.destroy()
    })
  }

  /** 清空选中态 */
  clearSelect()
  {
    this.selected = -1
    this.picked = []

    if (this.state)
    {
      this.drawHand()
    }
  }
}

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

/**
 * 面子占用的牌张数：吃与碰 3 张，杠 4 张，红中/皮子/赖子单张杠 1 张
 * @param {Object} meld 服务端面子
 * @returns {Number} 张数
 */
function meldTileCount(meld)
{
  if (meld.type === 1 || meld.type === 2)
  {
    return 3
  }

  if (meld.type === 6)
  {
    return 1
  }

  return 4
}

/** 我的手牌：放大后单张宽高、间距（负值=轻微叠放，做到牌间不留缝）、底边对齐位置、选中上移量 */
const HAND = { w: 112, h: 162, gap: -6, bottom: 744, lift: 24, minW: 72 }

/** 对家牌墙（顶部横排，牌面竖放） */
const BACK_TOP = { x: 459, y: 84, pitch: 35, w: 30, h: 44 }

/** 左右两家牌墙（沿边竖排，牌旋转 90 度，显示包围盒 26×28） */
const BACK_SIDE = { rightX: 1278, leftX: 30, y: 214, pitch: 28, w: 28, h: 26 }

/**
 * 弃牌区布局
 * axis='h' 时列沿 x 展开；axis='v' 时列沿 y 展开（左右两家牌竖放，长边朝下）
 * cols × rows 即该家最多同时显示的弃牌数
 */
const POND = [
  { axis: 'h', x: 440, y: 456, cols: 8, rows: 2, colStep: 52, rowStep: 62, rot: 0 },
  { axis: 'v', x: 870, y: 262, cols: 4, rows: 3, colStep: 56, rowStep: 68, rot: 90 },
  { axis: 'h', x: 440, y: 150, cols: 8, rows: 2, colStep: 52, rowStep: 62, rot: 0 },
  { axis: 'v', x: 238, y: 262, cols: 4, rows: 3, colStep: 56, rowStep: 68, rot: 90 }
]

/** 弃牌尺寸（未旋转时），放大后仍保持四家互不重叠 */
const POND_TILE = { w: 50, h: 62 }

/** 副露区：起点、单张显示宽高、是否旋转、是否居中、可用最大宽度 */
const MELD = [
  { x: 14, y: 536, w: 34, h: 48, rot: 0, center: false, maxW: 340 },
  { x: 928, y: 236, w: 30, h: 40, rot: 90, center: false, maxW: 150 },
  { x: 0, y: 112, w: 34, h: 48, rot: 0, center: true, maxW: 480 },
  { x: 262, y: 236, w: 30, h: 40, rot: 90, center: false, maxW: 150 }
]

/** 四家信息面板：0 我的座位卡上移让出整条底部给放大后的手牌、1 右中、2 对家左上、3 左中 */
const PANEL = [
  { x: 1146, y: 486, w: 176, h: 58 },
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

    const xyf = `${ASSET_BASE}/xyf/table`

    ;['bg_game', 'bg_center', 'time_bg', 'time0', 'time1', 'time2', 'time3', 'im_defaultheadbg', 'im_defaulthead_0', 'im_defaulthead_1', 'im_userscore', 'img_banker', 'wall_back', 'pointer'].forEach((name) =>
    {
      this.load.image(`xyf_${name}`, `${xyf}/${name}.png`)
    })
  }

  /** 构建静态图层 */
  create()
  {
    this.drawBackground()
    this.drawTable()

    this.layers.back = this.add.container(0, 0)
    this.layers.dir = this.add.container(0, 0)
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

  /** 原版绿绒布桌布：整幅铺满，四周自带压暗 */
  drawBackground()
  {
    const bg = this.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, 'xyf_bg_game')

    bg.setDisplaySize(STAGE_WIDTH, STAGE_HEIGHT)
  }

  /** 台面中央浅绿暗花与上下压暗，复刻原版绿呢桌面 */
  drawTable()
  {
    const motif = this.add.image(CENTER.x, CENTER.y, 'xyf_bg_center')

    motif.setDisplaySize(720, 720)
    motif.setAlpha(0.42)

    const shade = this.add.graphics()

    shade.fillGradientStyle(0x032B22, 0x032B22, 0x032B22, 0x032B22, 0.3, 0.3, 0, 0)
    shade.fillRect(0, 0, STAGE_WIDTH, 110)
    shade.fillGradientStyle(0x032B22, 0x032B22, 0x032B22, 0x032B22, 0, 0, 0.34, 0.34)
    shade.fillRect(0, STAGE_HEIGHT - 140, STAGE_WIDTH, 140)
  }

  /** 中央罗盘：原版金边绿框 + 黄色数码管 + 右侧剩余张数胶囊 */
  drawCenter()
  {
    const { x: cx, y: cy } = CENTER

    this.centerPos = { x: cx, y: cy }

    const frame = this.add.image(cx, cy, 'xyf_time_bg')

    frame.setDisplaySize(128, 128)
    this.layers.effect.add(frame)

    this.centerBig = this.add.text(cx, cy + 2,
    '', {
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#F6D64A'
    }).setOrigin(0.5).setShadow(0, 0, '#C98A16', 14, false, true)

    this.centerLabel = this.add.text(cx, cy + 47,
    '', {
      fontFamily: FONT,
      fontSize: '15px',
      color: '#9FE0B8'
    }).setOrigin(0.5)

    this.centerFoot = this.add.text(cx, cy + 78,
    '', {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#CDEBD6'
    }).setOrigin(0.5)

    /* 四方位出牌指示：用原版 time0..3 图片指向当前行动玩家，不再用文字胶囊 */
    /* 四方位出牌指示：箭头贴着方块边缘指向该家，用原版 time0..3 图片 */
    this.turnDirs = [
      this.add.image(cx, cy + 124, 'xyf_time0').setDisplaySize(280, 133),
      this.add.image(cx - 120, cy, 'xyf_time1').setDisplaySize(110, 230),
      this.add.image(cx, cy - 124, 'xyf_time2').setDisplaySize(280, 133),
      this.add.image(cx + 120, cy, 'xyf_time3').setDisplaySize(110, 230)
    ]

    this.turnDirs.forEach((img) =>
    {
      img.setVisible(false)
      img.setAlpha(0)
      img.setBlendMode(Phaser.BlendModes.ADD)
    })

    this.turnDirTween = this.tweens.add({
      targets: this.turnDirs,
      alpha: { from: 0.55, to: 1 },
      duration: 620,
      yoyo: true,
      repeat: -1
    })

    /* 方块四边的金色小箭头：与光带同步，明确指向当前出牌的那一家 */
    const arrowAt = [
      { x: cx, y: cy + 72, rot: Math.PI },
      { x: cx - 72, y: cy, rot: -Math.PI / 2 },
      { x: cx, y: cy - 72, rot: 0 },
      { x: cx + 72, y: cy, rot: Math.PI / 2 }
    ]

    this.turnArrows = arrowAt.map((item) =>
    {
      const g = this.add.graphics()

      g.fillStyle(0xFFD75E, 1)
      g.lineStyle(2, 0xFFF3D2, 0.95)
      g.beginPath()
      g.moveTo(0, -10)
      g.lineTo(9, 7)
      g.lineTo(-9, 7)
      g.closePath()
      g.fillPath()
      g.strokePath()
      g.setPosition(item.x, item.y)
      g.setRotation(item.rot)
      g.setVisible(false)

      return g
    })

    this.turnRing = this.add.graphics()

    this.turnRing.lineStyle(4, 0xFFD75E, 1)
    this.turnRing.strokeRoundedRect(cx - 66, cy - 66, 132, 132, 16)
    this.turnRing.setAlpha(0)

    this.turnRingTween = this.tweens.add({
      targets: this.turnRing,
      alpha: { from: 0.3, to: 1 },
      duration: 680,
      yoyo: true,
      repeat: -1,
      paused: true
    })

    this.layers.effect.add(this.turnRing)
    this.layers.effect.add(this.turnArrows)
    this.layers.effect.add([this.centerBig, this.centerLabel, this.centerFoot])
    this.layers.dir.add(this.turnDirs)
    this.dirLabels = []
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

    if (this.selectMode === 'single')
    {
      this.selectTile(hit, hand[hit])

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

    const show = this.countdown > 0 ? this.countdown : remain

    this.centerBig.setText(String(show).padStart(2, '0'))
    this.centerBig.setColor(this.countdown > 0 && this.countdown <= 3 ? '#FF9A6B' : '#F6D64A')
    this.centerLabel.setText(`剩余 ${remain} 张`)
    this.centerFoot.setText('')
    this.updateTurnHint(turnSeat, mySeat)
  }

  /**
   * 中央四方位出牌指示：轮到谁就点亮对应方向的图，并让倒计时外圈跟随脉冲
   * @param {Number} turnSeat 当前行动座位
   * @param {Number} mySeat 我的座位
   */
  updateTurnHint(turnSeat, mySeat)
  {
    const me = mySeat || 0
    const mine = turnSeat === me
    const view = (((turnSeat || 0) - me) % 4 + 4) % 4
    const order = [0, 3, 2, 1]
    const active = order[view]

    if (this.turnDirs)
    {
      this.turnDirs.forEach((img, i) =>
      {
        if (!img)
        {
          return
        }

        const on = i === active

        img.setVisible(on)
        img.setAlpha(on ? 1 : 0)
      })

      if (this.turnDirTween)
      {
        this.turnDirTween.resume()
      }
    }

    if (this.turnArrows)
    {
      this.turnArrows.forEach((g, i) =>
      {
        if (g)
        {
          g.setVisible(i === active)
        }
      })
    }

    if (this.turnRing)
    {
      this.turnRing.setVisible(mine)

      if (this.turnRingTween)
      {
        if (mine)
        {
          this.turnRingTween.resume()
        }
        else
        {
          this.turnRingTween.pause()
          this.turnRing.setAlpha(0)
        }
      }
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

    /* 倒计时每秒刷新只传局部状态，赖子/皮子沿用上一次的值，避免手牌角标被清掉 */
    if (state.laiZi === undefined && this.state && this.state.laiZi !== undefined)
    {
      state.laiZi = this.state.laiZi
    }

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
      const count = Math.min(seat.tileCount, 12)

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

        this.layers.back.add(this.makeTile('xyf_wall_back', x, y, w, h, view === 1 || view === 3 ? 90 : 0))
      }
    })
  }

  /** 绘制四方弃牌堆，超过容量时只保留最近的牌 */
  drawPonds()
  {
    this.layers.pond.list.forEach((child) => this.tweens.killTweensOf(child))
    this.layers.pond.removeAll(true)

    const seats = this.state.seats || []
    const last = this.state.lastDiscard || null

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

        const isLatest = i === list.length - 1 && !!last && last.seat === index
        const scale = isLatest ? 1.5 : 1
        const mw = bw * scale
        const mh = bh * scale
        const img = this.makeTile(tileKey(tile), x, y, POND_TILE.w, POND_TILE.h, rot)

        /* 全场最后打出的牌放大并压在最上层，配合橙色指针让对手出牌一眼可见 */
        if (isLatest)
        {
          img.setDisplaySize(POND_TILE.w * scale, POND_TILE.h * scale)
        }

        this.layers.pond.add(img)

        if (i === list.length - 1)
        {
          const mark = this.add.graphics()

          mark.lineStyle(isLatest ? 3 : 2, isLatest ? 0xFFB020 : 0xFFD75E, isLatest ? 1 : 0.55)
          mark.strokeRoundedRect(x - mw / 2 - 1, y - mh / 2 - 1, mw + 2, mh + 2, 5)
          this.layers.pond.add(mark)

          if (isLatest)
          {
            const pin = this.add.image(x, y - mh / 2 - 20, 'xyf_pointer')

            pin.setDisplaySize(44, 56)
            this.layers.pond.add(pin)
            this.tweens.add({ targets: pin, y: pin.y - 6, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.InOut' })
          }
          else
          {
            this.tweens.add({ targets: mark, alpha: { from: 1, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 })
          }
        }
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
      const melds = (seat && seat.melds ? seat.melds : []).concat(seat && seat.extras ? seat.extras : [])

      if (!melds.length)
      {
        return
      }

      const view = this.viewOf(index)
      const layout = MELD[view]
      /* 服务端 type：1 吃、2 碰、3 明杠、4 暗杠、5 补杠、6 特殊杠 */
      const counts = melds.map((meld) => meldTileCount(meld))
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

      melds.forEach((meld, mi) =>
      {
        /* 暗杠对他人不可见，用牌背表示 */
        const hidden = meld.type === 4 && index !== me

        for (let i = 0; i < counts[mi]; i++)
        {
          const tile = meld.type === 1 ? meld.start + i : meld.tile
          const key = hidden ? 'tile_back_wall' : tileKey(tile)
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

    /* 副露在 y≈536 与手牌错层，最多让出 90px，底部整条尽量留给放大后的手牌 */
    const startMin = Math.max(24, Math.min(90, 14 + this.myMeldWidth + 20))
    const rightMax = 1324
    const gap = HAND.gap
    const avail = rightMax - startMin
    let tw = Math.min(HAND.w, Math.floor((avail - (hand.length - 1) * gap) / hand.length))

    tw = Math.max(HAND.minW, tw)

    const th = Math.round(tw * HAND.h / HAND.w)
    const total = hand.length * tw + (hand.length - 1) * gap
    const startX = Math.max(startMin, Math.round((startMin + rightMax - total) / 2))
    const baseY = HAND.bottom - th / 2
    const mode = this.selectMode || 'none'

    const laiZi = this.state.laiZi || 0

    hand.forEach((tile, i) =>
    {
      const picked = mode === 'multi' ? this.picked.includes(i) : this.selected === i
      const x = startX + i * (tw + gap) + tw / 2
      const y = baseY - (picked ? HAND.lift : 0)
      const isLai = !!laiZi && tile === laiZi

      /* 赖子牌先铺一层金框底，牌面压在上面保持清晰 */
      if (isLai)
      {
        const halo = this.add.graphics()

        halo.fillStyle(0xE8A93C, 0.5)
        halo.fillRoundedRect(x - tw / 2 - 4, y - th / 2 - 4, tw + 8, th + 8, 8)
        halo.lineStyle(3, 0xFFD75E, 1)
        halo.strokeRoundedRect(x - tw / 2 - 4, y - th / 2 - 4, tw + 8, th + 8, 8)
        this.layers.hand.add(halo)
      }

      const img = this.makeTile(tileKey(tile), x, y, tw, th)

      this.layers.hand.add(img)

      /* 金色「赖」角标贴在牌左上角，与 HUD 的赖子图一致 */
      if (isLai)
      {
        const badge = this.add.graphics()

        badge.fillStyle(0xE8A93C, 1)
        badge.fillRoundedRect(x - tw / 2 - 8, y - th / 2 - 12, 28, 24, 7)
        badge.lineStyle(1.5, 0xFFF3D2, 1)
        badge.strokeRoundedRect(x - tw / 2 - 8, y - th / 2 - 12, 28, 24, 7)
        this.layers.hand.add(badge)

        const label = this.add.text(x - tw / 2 + 6, y - th / 2 - 11, '赖',
        {
          fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#40260A'
        })

        this.layers.hand.add(label)
      }

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

    if (!allow.ok)
    {
      if (this.onToast)
      {
        this.onToast(allow.reason)
      }

      return
    }

    /* 第一次点击只做选中（抬起 + 选中音）；再点同一张才确认出牌 */
    if (this.selected === index)
    {
      this.selected = -1

      this.drawHand()

      if (this.onTileDiscard)
      {
        this.onTileDiscard(tile, index)
      }

      return
    }

    this.selected = index

    this.drawHand()

    if (this.onTileTap)
    {
      this.onTileTap(tile, this.selected, true, '')
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

      const cxAvatar = box.x + 34
      const cyAvatar = box.y + box.h / 2
      const frame = this.add.image(cxAvatar, cyAvatar, 'xyf_im_defaultheadbg')

      frame.setDisplaySize(62, 62)
      this.layers.panel.add(frame)

      const face = this.add.image(cxAvatar, cyAvatar, index % 2 ? 'xyf_im_defaulthead_1' : 'xyf_im_defaulthead_0')

      face.setDisplaySize(48, 48)
      face.setAlpha(seat.finished ? 0.45 : 1)
      this.layers.panel.add(face)

      if (active)
      {
        const glow = this.add.graphics()

        glow.lineStyle(3, 0xFFE07A, 0.9)
        glow.strokeRoundedRect(cxAvatar - 34, cyAvatar - 34, 68, 68, 12)
        this.layers.panel.add(glow)
      }

      const scoreBg = this.add.image(box.x + 118, cyAvatar, 'xyf_im_userscore')

      scoreBg.setDisplaySize(96, 30)
      this.layers.panel.add(scoreBg)

      const score = this.add.text(box.x + 118, cyAvatar,
      '', {
        fontFamily: FONT,
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#FFE9B4'
      }).setOrigin(0.5)

      score.setText(`${(seat.score || 0) >= 0 ? '+' : ''}${seat.score || 0}`)
      this.layers.panel.add(score)

      const nick = this.add.text(box.x + 88, box.y + box.h + 2,
      '', {
        fontFamily: FONT,
        fontSize: '14px',
        color: '#CFEBD8'
      }).setOrigin(0.5, 0)

      nick.setText(this.ellipsis(self ? `我 · ${seat.nick || '玩家'}` : (seat.nick || '玩家'), 7))
      this.layers.panel.add(nick)

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
        const zhuang = this.add.image(cxAvatar - 26, cyAvatar - 26, 'xyf_img_banker')

        zhuang.setDisplaySize(28, 28)
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

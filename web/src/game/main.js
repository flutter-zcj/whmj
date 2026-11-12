/* ===========================================================
 * Phaser 启动器：uni-app 页面中调用 startGame(container, hooks)
 *
 * 强制横屏支持：
 *   页面在竖屏时会用 CSS 把画布容器整体旋转 90°，「视觉上」变成横屏。
 *   这会带来两个副作用，本文件统一接管处理：
 *   1) 容器/画布的 getBoundingClientRect() 受 transform 影响会宽高互换，
 *      Phaser 的自动居中与缩放计算会错 —— 关闭 autoCenter，自行居中定位；
 *      parent 尺寸改用不受 transform 影响的 clientWidth/clientHeight。
 *   2) 触摸坐标需要按旋转矩阵做逆变换 —— 覆盖 InputManager.transformPointer。
 * =========================================================== */

import Phaser from 'phaser';
import GuandanScene, { W, H } from './scenes/GameScene.js';

let game = null;
let rotDeg = 0; // 0 / 90 / -90：画布当前的强制旋转角度

/** 在（可能已旋转的）容器内手动居中 canvas，完全不依赖 Phaser 的 margin 居中 */
function positionCanvas() {
  if (!game || !game.canvas) return;
  const c = game.canvas;
  const p = c.parentElement;
  if (!p) return;
  const DW = game.scale.displaySize.width;
  const DH = game.scale.displaySize.height;
  const PW = p.clientWidth;
  const PH = p.clientHeight;
  if (!DW || !DH || !PW || !PH) return;
  c.style.position = 'absolute';
  c.style.margin = '0';
  c.style.left = Math.round((PW - DW) / 2) + 'px';
  c.style.top = Math.round((PH - DH) / 2) + 'px';
}

/**
 * 修正 Phaser 在「容器被 CSS 旋转」场景下的尺寸计算与触摸坐标
 */
function patchScaleAndInput(g) {
  const sm = g.scale;

  // 1) parent 尺寸取未受 transform 影响的布局尺寸
  sm.getParentBounds = function () {
    const el = this.parent;
    if (!el) {
      return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    }
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;
    return { x: 0, y: 0, width: w, height: h };
  };

  // 2) 触摸坐标完全自行换算（不依赖 Phaser 的 canvasBounds/displayScale）
  const im = g.input;
  const origTransform = im.transformPointer.bind(im);
  im.transformPointer = function (pointer, pageX, pageY, wasMove) {
    const canvas = g.canvas;
    const sc = sm;
    const DW = sc.displaySize.width;
    const DH = sc.displaySize.height;
    const GW = sc.baseSize.width;
    const GH = sc.baseSize.height;
    if (!canvas || !DW || !DH || !GW || !GH) {
      origTransform(pointer, pageX, pageY, wasMove);
      return;
    }

    // canvas 的轴对齐包围盒（getBoundingClientRect 已含 CSS transform）
    const b = canvas.getBoundingClientRect();
    const u = pageX - b.left;  // 沿包围盒宽度方向
    const v = pageY - b.top;   // 沿包围盒高度方向

    let cx, cy; // canvas 布局局部坐标
    if (!rotDeg) {
      cx = u;
      cy = v;
    } else if (rotDeg === 90) {
      // 顺时针 90°：canvas 局部 (cx,cy) -> 屏幕偏移 (DH-cy, cx)
      cx = v;
      cy = DH - u;
    } else {
      // 逆时针 90°：canvas 局部 (cx,cy) -> 屏幕偏移 (cy, DW-cx)
      cx = DW - v;
      cy = u;
    }

    pointer.x = cx * GW / DW;
    pointer.y = cy * GH / DH;
  };

  // 3) 缩放/尺寸变化后重新居中
  sm.on('resize', positionCanvas);
  g.events.once('ready', positionCanvas);
}

export function startGame(parent, hooks = {}) {
  if (game) {
    game.destroy(true);
    game = null;
  }

  const config = {
    type: Phaser.AUTO,
    parent,
    width: W,
    height: H,
    backgroundColor: '#0b3a24',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.NO_CENTER
    },
    render: { antialias: true, roundPixels: false },
    scene: [GuandanScene]
  };

  game = new Phaser.Game(config);
  patchScaleAndInput(game);

  game.events.once('ready', () => {
    const sc = game.scene.getScene('guandan');
    if (sc) {
      if (hooks.onExit) sc.onExit = hooks.onExit;
      if (hooks.onWaiting) sc.onWaiting = hooks.onWaiting;
    }
    // 启动时舞台可能刚被旋转过，按当前尺寸重算一次，避免画面只占屏幕一角
    setForcedRotation(rotDeg);
    positionCanvas();
    // 便于自动化测试与调试
    // #ifdef H5
    window.__gdGame = game;
    window.__gdScene = sc;
    // #endif
  });

  return game;
}

/**
 * 由页面在横竖屏变化时调用：先让 DOM 完成旋转布局，再刷新 Phaser 缩放并重新居中。
 * @param {number} deg 0 / 90 / -90
 */
export function setForcedRotation(deg) {
  rotDeg = deg || 0;
  if (!game) return;
  // 舞台尺寸随横竖屏变化（竖屏时宽=屏高），FIT 缩放必须跟着 parentSize 一起改，
  // 只调 refresh() 不会重算 parentSize，画面会停在初始化时的尺寸上。
  const stage = typeof document !== 'undefined' ? document.getElementById('gd-stage') : null;
  const w = stage ? stage.clientWidth : window.innerWidth;
  const h = stage ? stage.clientHeight : window.innerHeight;
  try {
    if (typeof game.scale.setParentSize === 'function') game.scale.setParentSize(w, h);
    game.scale.refresh();
  } catch (e) { /* 忽略刷新异常 */ }
  positionCanvas();
}

export function destroyGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

export default { startGame, destroyGame, setForcedRotation };

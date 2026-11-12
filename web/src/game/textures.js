/* ===========================================================
 * 纹理管理：掼蛋原版美术资源（从原 APK 提取修复）+ 程序化辅助纹理
 *
 * 原版资源清单（src/static/game/）：
 *   cards/normal/Card1_{1..54}.png   130x181 完整牌面（出牌区）
 *   cards/big/base_{1..54}.png       142x194 手牌大牌（底板+中央图案，无数字）
 *   cards/big/num_{red|black|orange}_{2..14}.png  42x42 数字贴片
 *   cards/big/suit_{1..4}.png        42x36 小花色（1方 2梅 3红 4黑）
 *   cards/big/cardback.png / glowbox.png（逢人配金框）
 *   ui/btn_play|btn_play_down|btn_hint|btn_hint_down|btn_pass|btn_pass_gray|yaobuqi
 *   ui/logo / kanggong / mark_first / mark_last / team1 / team2
 *
 * 牌值映射（与引擎 Card.js / 原版 CardRuleConstants 完全一致）：
 *   1-13 方块 A..K，14-26 梅花，27-39 红桃，40-52 黑桃，53 小王，54 大王
 * =========================================================== */

export const SS = 2; // 程序化纹理超采样倍数

/* 出牌区完整牌面（原版 CardsNormal） */
export const CARD_W = 130;
export const CARD_H = 181;
/* 手牌大牌（原版 bigCards） */
export const BIG_W = 142;
export const BIG_H = 194;

/** 资源根路径（vite publicPath 相对路径，兼容 /guandan/ 子路径部署） */
const BASE = (import.meta.env && import.meta.env.BASE_URL) || './';
const A = (p) => BASE + 'static/game/' + p;

/* ---------- 原版资源清单 ---------- */

const IMAGES = [];
// 出牌区完整牌面
for (let v = 1; v <= 54; v++) IMAGES.push(['p_card_' + v, A('cards/normal/Card1_' + v + '.png')]);
// 手牌大牌底版
for (let v = 1; v <= 54; v++) IMAGES.push(['p_big_' + v, A('cards/big/base_' + v + '.png')]);
// 数字贴片（红/黑/橙）
for (let n = 2; n <= 14; n++) {
  IMAGES.push(['p_num_red_' + n, A('cards/big/num_red_' + n + '.png')]);
  IMAGES.push(['p_num_black_' + n, A('cards/big/num_black_' + n + '.png')]);
  IMAGES.push(['p_num_orange_' + n, A('cards/big/num_orange_' + n + '.png')]);
}
// 小花色 / 牌背 / 逢人配金框
for (let s = 1; s <= 4; s++) IMAGES.push(['p_suit_' + s, A('cards/big/suit_' + s + '.png')]);
IMAGES.push(['p_back', A('cards/big/cardback.png')]);
IMAGES.push(['p_glow', A('cards/big/glowbox.png')]);
// UI
IMAGES.push(
  ['ui_table', A('ui/table.jpg')],
  ['ui_table_wood', A('ui/table_wood.jpg')],
  ['ui_play', A('ui/btn_play.png')],
  ['ui_play_down', A('ui/btn_play_down.png')],
  ['ui_hint', A('ui/btn_hint.png')],
  ['ui_hint_down', A('ui/btn_hint_down.png')],
  ['ui_pass', A('ui/btn_pass.png')],
  ['ui_pass_down', A('ui/btn_pass_gray.png')],
  ['ui_yaobuqi', A('ui/yaobuqi.png')],
  ['ui_logo', A('ui/logo.png')],
  ['ui_kanggong', A('ui/kanggong.png')],
  ['ui_mark_first', A('ui/mark_first.png')],
  ['ui_mark_last', A('ui/mark_last.png')],
  ['ui_team1', A('ui/team1.png')],
  ['ui_team2', A('ui/team2.png')]
);

/** 在场景 preload() 中调用：加载全部原版资源 */
export function preloadAssets(scene) {
  if (scene.__gdAssetsLoaded) return;
  IMAGES.forEach(([key, url]) => {
    if (!scene.textures.exists(key)) scene.load.image(key, url);
  });
  scene.__gdAssetsLoaded = true;
}

/* ---------- 牌面键名 ---------- */

/** 出牌区完整牌面 key */
export function cardKey(card) {
  return 'p_card_' + card;
}
/** 手牌大牌底版 key */
export function bigKey(card) {
  return 'p_big_' + card;
}
/** 数字贴片 key（n=点数 2..14，A=14） */
export function numKey(n, level) {
  const tag = n === level ? 'orange' : null;
  return { tag, key: 'p_num_' + (tag || 'red') + '_' + n };
}
/** 小花色 key（1方 2梅 3红 4黑） */
export function suitKey(suit) {
  return 'p_suit_' + suit;
}

/* ---------- 以下为程序化辅助纹理（桌面/头像/面板按钮） ---------- */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function newCanvas(scene, key, w, h) {
  const old = scene.textures.get(key);
  if (old && old.key === key) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, Math.round(w * SS), Math.round(h * SS));
  const ctx = tex.getContext();
  ctx.scale(SS, SS);
  ctx.clearRect(0, 0, w, h);
  return { tex, ctx };
}

/** 桌面背景（深绿毛毡，与原版一致） */
export function buildTableTexture(scene, w, h) {
  const { tex, ctx } = newCanvas(scene, 'table_bg', w, h);
  const g = ctx.createRadialGradient(w / 2, h * 0.46, h * 0.12, w / 2, h * 0.5, h * 0.92);
  g.addColorStop(0, '#1f7a4d');
  g.addColorStop(0.55, '#12603a');
  g.addColorStop(1, '#08351f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.48, w * 0.40, h * 0.33, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  tex.refresh();
}

/** 面板按钮（再玩一局等）：normal / pressed / disabled 三态 */export function buildButtonTextures(scene, key, w, h, base, opts) {
  const mk = (suffix, top, bottom, border, txtColor) => {
    const { tex, ctx } = newCanvas(scene, `${key}_${suffix}`, w, h);
    const r = Math.min(h / 2, 14);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    roundRect(ctx, 1, 1, w - 2, h - 2, r);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = border;
    roundRect(ctx, 1.5, 1.5, w - 3, h - 3, r);
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 4, 4, w - 8, h * 0.36, r);
    ctx.fill();
    ctx.restore();
    if (opts && opts.label) {
      ctx.fillStyle = txtColor;
      ctx.font = `bold ${Math.round(h * 0.42)}px "Microsoft YaHei","PingFang SC",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.label, w / 2, h / 2 + 1);
    }
    tex.refresh();
  };
  if (opts && opts.kind === 'primary') {
    mk('normal', '#62d57c', '#288f52', '#1f7a42', '#ffffff');
    mk('pressed', '#4db968', '#1f7a42', '#186336', '#f0fff4');
    mk('disabled', '#cfcfc9', '#b3b3ad', '#9a9a94', '#f2f2f0');
  } else {
    mk('normal', '#fdfdfd', '#e2e2de', '#bdbdb8', '#3b3b3b');
    mk('pressed', '#dcdcd7', '#c2c2bd', '#a5a5a0', '#2b2b2b');
    mk('disabled', '#e8e8e4', '#d4d4cf', '#c0c0bb', '#a8a8a3');
  }
  return { w, h };
}

/** 牌面投影（圆角黑块 + 边缘柔化），用于出牌区让牌浮起来 */
export function buildCardShadowTexture(scene, w, h) {
  const key = 'card_shadow';
  const old = scene.textures.get(key);
  if (old && old.key === key) return;
  const pad = 6;
  const { tex, ctx } = newCanvas(scene, key, w + pad * 2, h + pad * 2);
  const g = ctx.createRadialGradient((w + pad * 2) / 2, (h + pad * 2) / 2, 4,
    (w + pad * 2) / 2, (h + pad * 2) / 2, Math.max(w, h) * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.30)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  roundRect(ctx, pad, pad, w, h, 8);
  ctx.fill();
  tex.refresh();
}

/** 头像底板（圆形） */
export function buildAvatarTexture(scene, key, size, ring) {
  const { tex, ctx } = newCanvas(scene, key, size, size);
  ctx.fillStyle = '#0d4a2e';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(size * 0.4, size * 0.36, 1, size / 2, size / 2, size * 0.56);
  g.addColorStop(0, '#f7e9c9');
  g.addColorStop(1, '#c9a86a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.40, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = ring || '#e8c46a';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();
  tex.refresh();
}

/** 名次文字徽标（二游/三游；头游/末游用原版 mark 图） */
export function buildBadgeTexture(scene, key, w, h, color, label) {
  const { tex, ctx } = newCanvas(scene, key, w, h);
  ctx.fillStyle = color;
  roundRect(ctx, 0, 0, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.6)}px "Microsoft YaHei","PingFang SC",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2 + 1);
  tex.refresh();
}

export default {
  SS, CARD_W, CARD_H, BIG_W, BIG_H,
  preloadAssets, cardKey, bigKey, numKey, suitKey,
  buildTableTexture, buildButtonTextures, buildAvatarTexture, buildBadgeTexture,
  buildCardShadowTexture
};

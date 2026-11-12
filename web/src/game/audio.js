/* ===========================================================
 * 音效管理：原版掼蛋音频资源（从原 APK 提取，未加密 MP3）
 *
 * 资源结构（src/static/game/sound/）：
 *   bgm.mp3                 原版大厅背景音乐（32s，循环）
 *   ui/click|select|mousedown.mp3
 *   play/out|out2|pass|passa.mp3
 *   act/bomb|tonghuashun|siwang|flashlight|start|clock|fanbei|gold2|gold3|sign|chat|ok.mp3
 *   result/win|lose|win2|lose2.mp3
 *   voice/men|women/{2..14,15,16,22..1414,sanzhang,bomb,bombs,shunzi,...}.mp3
 *
 * 语音命名规则来自逆向 getSoundName()：
 *   单张 -> "{weight}"；对子(非王) -> "{weight}{weight}"；三张 -> sanzhang
 *   4~10 炸 -> "bombs"+"bomb"；三带二 -> three_two；钢板 -> gangban
 *   三连对 -> duiduishun；顺子 -> shunzi；同花顺 -> tonghuashun；四大天王 -> bomb
 *   weight 修正：20(级牌)->2，21(小王)->15，22(大王)->16
 * =========================================================== */

const BASE = (import.meta.env && import.meta.env.BASE_URL) || './';
const A = (p) => BASE + 'static/game/sound/' + p;

/* 通用音效（必定加载） */
const SFX = [
  ['s_click', A('ui/click.mp3')],
  ['s_select', A('ui/select.mp3')],
  ['s_down', A('ui/mousedown.mp3')],
  ['s_out', A('play/out.mp3')],
  ['s_out2', A('play/out2.mp3')],
  ['s_pass', A('play/pass.mp3')],
  ['s_passa', A('play/passa.mp3')],
  ['s_bomb', A('act/bomb.mp3')],
  ['s_tonghuashun', A('act/tonghuashun.mp3')],
  ['s_siwang', A('act/siwang.mp3')],
  ['s_flash', A('act/flashlight.mp3')],
  ['s_start', A('act/start.mp3')],
  ['s_clock', A('act/clock.mp3')],
  ['s_fanbei', A('act/fanbei.mp3')],
  ['s_gold2', A('act/gold2.mp3')],
  ['s_gold3', A('act/gold3.mp3')],
  ['s_sign', A('act/sign.mp3')],
  ['s_chat', A('act/chat.mp3')],
  ['s_ok', A('act/ok.mp3')],
  ['s_win', A('result/win.mp3')],
  ['s_lose', A('result/lose.mp3')],
  ['s_win2', A('result/win2.mp3')],
  ['s_lose2', A('result/lose2.mp3')]
];

/* 牌型语音文件名（两性共用） */
const VOICE_NAMES = [];
for (let n = 2; n <= 16; n++) VOICE_NAMES.push(String(n));
for (let n = 2; n <= 14; n++) VOICE_NAMES.push(String(n) + String(n));
VOICE_NAMES.push('sanzhang', 'bomb', 'bombs', 'shunzi', 'tonghuashun',
  'duiduishun', 'gangban', 'three_two', 'jingong', 'touyou');

const VOICE_DIR = { men: 'voice/men/', women: 'voice/women/' };

/** 加载音效（在场景 preload 中调用） */
export function preloadAudio(scene, gender) {
  const g = VOICE_DIR[gender] ? gender : 'men';
  if (scene.__gdAudioLoaded) return;
  SFX.forEach(([k, url]) => {
    if (!scene.cache.audio.exists(k)) scene.load.audio(k, url);
  });
  if (!scene.cache.audio.exists('s_bgm')) scene.load.audio('s_bgm', A('bgm.mp3'));
  VOICE_NAMES.forEach((n) => {
    const k = 'v_' + g + '_' + n;
    if (!scene.cache.audio.exists(k)) scene.load.audio(k, A(VOICE_DIR[g] + n + '.mp3'));
  });
  scene.__gdAudioLoaded = true;
}

/** 牌型 -> 语音文件名（对应原版 getSoundName） */
export function voiceNameOf(pattern) {
  if (!pattern || !pattern.id) return '';
  const id = pattern.id;
  let w = pattern.power;
  if (w === 20) w = 2; else if (w === 21) w = 15; else if (w === 22) w = 16;

  if (id === 1) return String(w);
  if (id === 2) return (w === 15 || w === 16) ? '' : String(w) + String(w);
  if (id === 3) return 'sanzhang';
  if (id >= 4 && id <= 10) return 'bombs';
  if (id === 101) return 'three_two';
  if (id === 102) return 'gangban';
  if (id === 103) return 'duiduishun';
  if (id === 104) return 'shunzi';
  if (id === 105) return 'tonghuashun';
  if (id === 106) return 'bomb';
  return '';
}

/** 音效管理器 */
export default class GdAudio {
  constructor(scene) {
    this.scene = scene;
    this.gender = 'men';
    this.muted = false;
    this.bgm = null;
    this.voice = null;
    this._last = {};
    this._unlocked = false;
    this.initBgm();
    this.bindUnlock();
  }

  /* ---- 移动端音频解锁（必须由用户手势触发） ---- */
  bindUnlock() {
    const unlock = () => {
      if (this._unlocked) return;
      this._unlocked = true;
      const sm = this.scene.sound;
      if (sm && sm.context && sm.context.state === 'suspended') sm.context.resume();
      if (this.bgm && !this.bgm.isPlaying && !this.muted) { try { this.bgm.play(); } catch (e) {} }
    };
    const g = this.scene.game.canvas;
    ['pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
      window.addEventListener(ev, unlock, { once: false, passive: true });
      if (g) g.addEventListener(ev, unlock, { passive: true });
    });
    this.scene.input.on('pointerdown', unlock);
    this.scene.sound.once('unlocked', unlock);
    // Phaser 若已在解锁状态，直接补一次
    if (this.scene.sound.locked === false) unlock();
  }

  initBgm() {
    if (!this.scene.cache.audio.exists('s_bgm')) return;
    try {
      this.bgm = this.scene.sound.add('s_bgm', { loop: true, volume: 0.22 });
      if (!this.scene.sound.locked) this.bgm.play();
    } catch (e) { /* 静默失败 */ }
  }

  /* ---- 基础播放 ---- */
  play(key, volume, rate) {
    if (this.muted) return null;
    if (!this.scene.cache.audio.exists(key)) return null;
    try {
      return this.scene.sound.play(key, { volume: volume == null ? 0.6 : volume, rate: rate || 1 });
    } catch (e) { return null; }
  }

  /** 短间隔去重，避免连点叠音 */
  playOnce(key, ms, volume) {
    const now = Date.now();
    if (this._last[key] && now - this._last[key] < (ms || 80)) return null;
    this._last[key] = now;
    return this.play(key, volume);
  }

  /* ---- 语义化封装 ---- */
  uiClick() { this.playOnce('s_click', 60, 0.5); }
  uiDown() { this.playOnce('s_down', 60, 0.45); }
  cardSelect() { this.playOnce('s_select', 50, 0.35); }
  dealStart() { this.play('s_start', 0.55); }
  dealCard() { this.playOnce('s_flash', 40, 0.35); }

  /** 出牌：炸弹/同花顺/四王特殊音 + 牌型语音 */
  playCards(pattern, opts) {
    if (this.muted) return;
    const o = opts || {};
    if (!pattern) { this.pass(); return; }

    if (pattern.id === 106) {
      this.play('s_siwang', 0.7);
      this.voiceIn(700, (g) => this.voiceKey('bomb', g));
      return;
    }
    if (pattern.id === 105) {
      this.play('s_tonghuashun', 0.75);
      this.voiceIn(750, (g) => this.voiceKey('tonghuashun', g));
      return;
    }
    if (pattern.isBomb) {
      this.play('s_bomb', 0.72);
      this.voiceIn(800, (g) => this.voiceKey('bombs', g));
      return;
    }
    this.playOnce('s_out', 40, 0.55);
    if (pattern.id === 1) this.playOnce('s_out2', 40, 0.3);

    const vn = voiceNameOf(pattern);
    if (vn) this.voiceIn(140, (g) => this.voiceKey(vn, g));
  }

  pass() {
    this.playOnce('s_pass', 60, 0.55);
  }

  passA() { this.play('s_passa', 0.7); }
  win() {
    this.play('s_win', 0.75);
    this.voiceIn(0, (g) => this.voiceKey('touyou', g));
  }
  lose() { this.play('s_lose', 0.75); }
  tribute() { this.voiceIn(0, (g) => this.voiceKey('jingong', g)); }
  fanbei() { this.play('s_fanbei', 0.7); }
  gold() { this.play('s_gold2', 0.5); }

  /* ---- 语音通道（同一时刻只播一条，避免叠音） ---- */
  voiceKey(name, gender) {
    const g = gender || this.gender;
    const k = 'v_' + g + '_' + name;
    if (this.scene.cache.audio.exists(k)) return k;
    const alt = 'v_' + (g === 'men' ? 'women' : 'men') + '_' + name;
    return this.scene.cache.audio.exists(alt) ? alt : null;
  }

  voiceIn(delay, keyFn) {
    const fire = () => {
      const k = keyFn(this.gender);
      if (!k) return;
      if (this.voice && this.voice.isPlaying) { try { this.voice.stop(); } catch (e) {} }
      try { this.voice = this.scene.sound.play(k, { volume: 0.85 }); } catch (e) {}
    };
    if (delay > 0) this.scene.time.delayedCall(delay, fire); else fire();
  }

  /* ---- 开关 ---- */
  toggle() {
    this.muted = !this.muted;
    if (this.bgm) {
      if (this.muted) { try { this.bgm.pause(); } catch (e) {} }
      else { try { this.bgm.resume(); } catch (e) {} }
    }
    return this.muted;
  }

  setGender(g) { if (VOICE_DIR[g]) this.gender = g; }

  destroy() {
    if (this.bgm) { try { this.bgm.stop(); this.bgm.destroy(); } catch (e) {} }
  }
}

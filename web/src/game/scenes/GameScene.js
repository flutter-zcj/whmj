/* ===========================================================
 * Phaser 掼蛋牌桌场景
 * 设计分辨率 1280x720（与原 app 一致的横屏比例），Scale.FIT 自适应移动端
 * =========================================================== */

import CardLib from '../engine/card.js';
import Rule from '../engine/rule.js';
import HintFinder from '../engine/hint.js';
import GameTable from '../engine/table.js';
import AI from '../engine/ai.js';
import TEX from '../textures.js';
import GdAudio, { preloadAudio } from '../audio.js';
import Net from '../net.js';
import WaitRoom from '../ui/WaitRoom.js';

const W = 1280, H = 720;

/* 座位：0=南(我) 1=西(上家) 2=北(对家) 3=东(下家) */
const SEAT_POS = [
  { x: 640, y: 664 },
  { x: 104, y: 286 },
  { x: 640, y: 82 },
  { x: 1176, y: 286 }
];
const SEAT_NAME = ['我', '西家', '北家', '东家'];

/* 各家出牌落点（南家在中央下方，北家上方，左右家中线） */
const OUT_POS = [
  { x: 640, y: 350 },
  { x: 288, y: 322 },
  { x: 640, y: 232 },
  { x: 992, y: 322 }
];
/* 各家出牌区缩放：自己最大，对家/上下家缩小 */
const OUT_SCALE = [0.85, 0.50, 0.42, 0.50];

/* 手牌大牌（原版 bigCards 142x194，原尺寸显示） */
const HAND_Y = 622;          // 大牌中心 y：底边贴近屏幕底部（顶边 525）
const HAND_GAP_MAX = 42;
const HAND_GAP_MIN = 16;
const HAND_UP = 26;          // 选中上移
/* 他家牌背（原版 smallCards 42x57） */
const BACK_W = 42, BACK_H = 57;

/* 操作按钮：贴右下角、手牌上方，避免遮挡手牌（原版按钮 273x97 等比缩小） */
const BTN_W = 168, BTN_H = 60, BTN_Y = 470;
const BTN_X = { pass: 806, hint: 986, play: 1166 };

/* 手牌命中区：只看 y 与 x（按间距反算索引），比逐张 hitTest 更准、也支持滑动连选 */
const HAND_HIT_TOP = 508;
const HAND_HIT_BOTTOM = H - 2;

export default class GuandanScene extends Phaser.Scene {
  constructor() {
    super('guandan');
  }

  /* ---------------- 生命周期 ---------------- */

  preload() {
    // 加载掼蛋原版美术资源（牌面 / 牌背 / 按钮 / LOGO / 徽标）与全部音效
    TEX.preloadAssets(this);
    preloadAudio(this, 'men');
  }

  create() {
    this.table = new GameTable(Date.now() % 1000000);
    this.mySeat = 0;
    this.selected = new Set();
    this.hintList = [];
    this.hintIdx = -1;
    this.busy = false;
    this.outShow = [null, null, null, null];   // 各家最近一次出牌
    this._dbg = { Rule, HintFinder, CardLib };  // 调试/自动化测试用
    this.level = this.table.levelOf(0);
    this.settle = null;
    this.panel = null;

    this.buildTextures();
    // 原版牌桌底图（1280x800 等比铺满；加载失败回退程序化桌布）
    if (this.textures.exists('ui_table')) {
      this.add.image(0, 0, 'ui_table').setOrigin(0, 0).setDisplaySize(W, H).setDepth(0);
      // 轻微暗角，让中间牌面更突出
      const vg = this.add.graphics().setDepth(1);
      vg.fillStyle(0x000000, 0.10);
      vg.fillRect(0, 0, W, 54);
      vg.fillRect(0, H - 70, W, 70);
    } else {
      this.add.image(0, 0, 'table_bg').setOrigin(0, 0);
    }
    // 桌面中央 LOGO（原版 zhuomianlog 水印）
    this.add.image(640, 296, 'ui_logo').setAlpha(0.5).setScale(0.78).setDepth(2);
    this.buildTopBar();
    this.buildSeats();
    this.buildInfo();
    this.buildButtons();
    this.buildHandInput();

    // 房间等待层（联机未开局时显示）
    this.waitRoom = new WaitRoom(this, {
      onCopy: () => this.copyInvite(),
      onAddBot: () => { if (this.audio) this.audio.uiClick(); this.net.addBot(); },
      onRemoveBot: (seat) => { if (this.audio) this.audio.uiClick(); this.net.removeBot(seat); },
      onStart: () => { if (this.audio) this.audio.uiClick(); this.net.start(); },
      onExit: () => { if (this.audio) this.audio.uiClick(); if (this.onExit) this.onExit(); }
    });

    this.events.once('shutdown', () => { if (this.net) this.net.close(); });

    // 音效（原版资源）：背景音乐 + 全部音效语音
    this.audio = new GdAudio(this);

    // 联机模式：URL 带 room 参数时由服务端驱动牌局
    // 有房号 = 进房；create=1 = 房号由服务端分配，两者都走联机
    this.isOnline = !!(window.__GD_ROOM || window.__GD_CREATE);
    this.myHand = [];
    this.seatNames = SEAT_NAME.slice();
    if (this.isOnline) this.initOnline();
    else this.newRound();
  }

  /* ---------------- 联机 ---------------- */

  initOnline() {
    this.txtRoom.setVisible(true).setText('房间 ' + window.__GD_ROOM);
    this.btnInvite.setVisible(true);
    this.btnAgain.setVisible(false);

    this.net = new Net({
      room: window.__GD_ROOM,
      name: window.__GD_NAME || '',
      create: !!window.__GD_CREATE
    });
    this.net.on('joined', (m) => {
      this.mySeat = 0;      // 服务端座位在 sync.seats 中按自己视角重排，见 applySync
      window.__GD_ROOM = m.room;
      try { sessionStorage.setItem('gd_room', m.room); } catch (e) { /* 隐私模式忽略 */ }
      this.txtRoom.setText('房间 ' + m.room);
      this.audio && this.audio.uiClick();
      this.toast('已进入房间 ' + m.room, '#9fe6bf');
    });
    this.net.on('sync', (m) => this.applySync(m));
    this.net.on('settle', (m) => this.onRemoteSettle(m));
    this.net.on('error', (m) => {
      this.toast(m.msg || '操作失败', '#ff9c8a');
      if (/已满/.test(m.msg || '')) {
        setTimeout(() => { if (this.onExit) this.onExit(); }, 1500);
      }
    });
    this.net.on('close', () => this.toast('与服务器断开，正在重连…', '#ff9c8a'));
    this.net.connect();
  }

  /** 应用服务端全量状态（自己永远渲染在 0 号位） */
  applySync(m) {
    this.remote = m;
    // 服务端座位 → 本地视角座位：自己映射到 0，其余按相对位置旋转
    const mySeat = (this.net && this.net.seat >= 0) ? this.net.seat : 0;
    const map = [(mySeat + 0) % 4, (mySeat + 1) % 4, (mySeat + 2) % 4, (mySeat + 3) % 4];
    this.viewMap = map;

    const t = this.table;
    t.step = m.step;
    // 视角换算：自己所在队 = 本地 team1
    const mySrv = (this.net && this.net.seat >= 0) ? this.net.seat : 0;
    const myIdx = mySrv % 2 === 0 ? 0 : 1;
    t.levelTeam1 = m.levels[myIdx];
    t.levelTeam2 = m.levels[1 - myIdx];
    t.lastPlaySeat = m.lastPlaySeat >= 0 ? map.indexOf(m.lastPlaySeat) : -1;
    t.lastPattern = m.lastPattern
      ? Rule.parse(m.lastPattern.cards, m.level)
      : null;

    // 座位：用服务端数据填到本地视角
    for (let v = 0; v < 4; v++) {
      const s = m.seats[map[v]];
      t.seats[v].rank = s ? s.rank : 0;
      t.seats[v].hand = (v === 0)
        ? (m.hand || []).slice()
        : new Array(s ? s.count : 0).fill(0);
      this.seatNames[v] = s ? (s.name || SEAT_NAME[v]) : SEAT_NAME[v];
      if (this.seatNodes[v]) this.seatNodes[v].name.setText(this.seatNames[v]);
    }
    this.myHand = t.seats[0].hand.slice();
    this.level = t.levelTeam1;

    // 当前回合座位
    const curV = m.currentSeat >= 0 ? map.indexOf(m.currentSeat) : -1;
    t.currentSeat = curV;

    // 各家出牌区
    this.outShow = [null, null, null, null];
    (m.outs || []).forEach((o) => {
      if (!o) return;
      const v = map.indexOf(o.seat);
      if (v >= 0) this.outShow[v] = { cards: o.cards, patternName: o.name };
    });

    // 手牌变化 → 清空选择
    const sig = this.myHand.join(',');
    if (sig !== this._handSig) {
      this._handSig = sig;
      this.selected.clear();
      this.hintList = [];
      this.hintIdx = -1;
      this.txtTip.setAlpha(0);
    }

    if (m.status === 'waiting') {
      // 房间等待中：清掉上一局残留状态，显示等待层
      this.settle = null;
      this.busy = false;
      this.selected.clear();
      this.hintList = [];
      this.hintIdx = -1;
      this.txtTip.setAlpha(0);
      this.enterWaiting(m);
      return;
    }

    // 关键：进入 playing 必须清掉上一局的结算标记，
    // 否则 updateButtons 会一直判定「已结算」而隐藏三个操作按钮（第二局按钮消失的根因）
    this.settle = null;
    if (this.waitRoom && this.waitRoom.visible) this.waitRoom.hide();

    if (m.status === 'settled') {
      // 结算面板由 settle 消息驱动；若是重连后收到，补一个面板
      this.renderAll();
      if (!this.panel && m.ranks) this.rebuildSettlePanel(m);
      return;
    }
    if (this.panel) { this.panel.destroy(); this.panel = null; }
    this.renderAll();
  }

  /** 房间等待态渲染 */
  enterWaiting(m) {
    const mySrv = (this.net && this.net.seat >= 0) ? this.net.seat : 0;
    const map = this.viewMap || [0, 1, 2, 3];
    const seats = [0, 1, 2, 3].map((v) => {
      const srv = map[v];
      const s = m.seats[srv] || {};
      return {
        seat: srv,
        name: s.name || '',
        empty: !!s.empty,
        bot: !!s.bot,
        host: !!s.host,
        online: !!s.online
      };
    });
    this.txtRound.setText('等待开局');
    this.txtLevelInfo.setText('');
    this.txtCenter.setText('');
    this.txtRoom.setText('房间 ' + m.room);
    if (this.waitRoom) {
      this.waitRoom.show({
        room: m.room,
        seats,
        isHost: !!(m.seats[mySrv] && m.seats[mySrv].host)
      });
    }
    this.updateButtons();
  }

  /** 重连后补结算面板（只显示名次，不重播音效） */
  rebuildSettlePanel(m) {
    this.settle = m;
    const lines = [];
    lines.push(m.winnerTeam === 1 ? '本方胜！' : '对方胜');
    if (m.doubleDown) lines.push('双下');
    if (m.upLevel) lines.push('升级 +' + m.upLevel);
    lines.push('6 秒后自动开下一局');
    this.showPanel(m.winnerTeam === 1 ? '胜 利' : '失 败', lines);
  }

  onRemoteSettle(m) {
    this.settle = m;
    const lines = [];
    lines.push(m.winnerTeam === 1 ? '本方胜！' : '对方胜');
    if (m.doubleDown) lines.push('双下');
    if (m.upLevel) lines.push('升级 +' + m.upLevel);
    if (m.resisted) {
      lines.push('抗贡：双大王，免贡');
    } else if (m.tributes && m.tributes.length) {
      lines.push(m.tributes.map((x) =>
        this.seatNames[x.from] + ' 进贡 ' + x.card + (x.back ? '，' + this.seatNames[x.to] + ' 还 ' + x.back : '')
      ).join('；'));
    }
    lines.push('6 秒后自动开下一局');

    [this.btnPass, this.btnHint, this.btnPlay].forEach((b) => {
      b.setVisible(false);
      if (b.shadow) b.shadow.setVisible(false);
    });
    this.showPanel(m.winnerTeam === 1 ? '胜 利' : '失 败', lines);
    if (this.audio) { if (m.winnerTeam === 1) this.audio.win(); else this.audio.lose(); }
  }

  buildTextures() {
    TEX.buildTableTexture(this, W, H);
    TEX.buildCardShadowTexture(this, TEX.CARD_W, TEX.CARD_H);
    TEX.buildAvatarTexture(this, 'avatar', 80, '#c9a86a');
    TEX.buildAvatarTexture(this, 'avatar_cur', 80, '#ffd76a');
    TEX.buildBadgeTexture(this, 'b_rank2', 74, 26, '#3879a8', '二游');
    TEX.buildBadgeTexture(this, 'b_rank3', 74, 26, '#7a7a7a', '三游');
    TEX.buildButtonTextures(this, 'btn_again', 210, 60, null, { kind: 'primary', label: '再玩一局' });
  }

  /* ---------------- 顶层信息条 ---------------- */

  buildTopBar() {
    const g = this.add.graphics().setDepth(40);
    // 顶栏：深绿半透明 + 底部金线
    g.fillStyle(0x04220f, 0.62);
    g.fillRect(0, 0, W, 46);
    g.fillStyle(0xffffff, 0.05);
    g.fillRect(0, 0, W, 18);
    g.lineStyle(1.5, 0xe8c46a, 0.5);
    g.beginPath(); g.moveTo(0, 46); g.lineTo(W, 46); g.strokePath();
    g.fillStyle(0x000000, 0.22);
    g.fillRect(0, 47, W, 5);

    this.txtTitle = this.add.text(22, 23, '掼 蛋', {
      fontFamily: '"Microsoft YaHei","PingFang SC",sans-serif',
      fontSize: '23px', color: '#ffe9b0', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(41);

    const back = this.add.text(108, 23, '‹ 返回', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '17px', color: '#cfe9da'
    }).setOrigin(0, 0.5).setDepth(41).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => { if (this.audio) this.audio.uiClick(); if (this.onExit) this.onExit(); });

    this.txtLevelInfo = this.add.text(W / 2, 23, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '18px', color: '#9fe6bf'
    }).setOrigin(0.5).setDepth(41);

    this.txtRound = this.add.text(W - 78, 23, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '17px', color: '#ffe9b0'
    }).setOrigin(1, 0.5).setDepth(41);

    // 联机：房间号 + 邀请好友
    this.txtRoom = this.add.text(186, 23, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '16px', color: '#9fe6bf'
    }).setOrigin(0, 0.5).setDepth(41).setVisible(false);

    this.btnInvite = this.add.text(336, 23, '＋ 邀请好友', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '16px',
      color: '#06200f', backgroundColor: '#ffd76a', padding: { x: 8, y: 3 }
    }).setOrigin(0, 0.5).setDepth(41).setVisible(false).setInteractive({ useHandCursor: true });
    this.btnInvite.on('pointerup', () => this.copyInvite());

    this.buildSoundToggle();
  }

  /** 复制邀请链接（微信里直接发给好友即可进同一房） */
  copyInvite() {
    if (this.audio) this.audio.uiClick();
    const room = window.__GD_ROOM;
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');
    const link = base + '?room=' + room + '#/pages/gd/index';
    const done = () => this.toast('邀请链接已复制，发给好友即可进房', '#9fe6bf');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(() => this.toast('房间号：' + room, '#ffd76a'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { this.toast('房间号：' + room, '#ffd76a'); }
      document.body.removeChild(ta);
    }
  }

  /** 音效开关（顶栏右侧圆形喇叭） */
  buildSoundToggle() {
    const cx = W - 34, cy = 23;
    const c = this.add.container(cx, cy).setDepth(42);
    const ring = this.add.circle(0, 0, 16, 0x000000, 0.32).setStrokeStyle(1.5, 0xe8c46a, 0.8);
    const gfx = this.add.graphics();
    const draw = (on) => {
      gfx.clear();
      gfx.fillStyle(on ? 0xffe9b0 : 0x8aa79a, 1);
      // 喇叭主体
      gfx.fillRect(-7, -3.5, 4, 7);
      gfx.beginPath();
      gfx.moveTo(-3, -3.5); gfx.lineTo(2, -7.5); gfx.lineTo(2, 7.5); gfx.lineTo(-3, 3.5);
      gfx.closePath(); gfx.fillPath();
      if (on) {
        gfx.lineStyle(1.6, 0xffe9b0, 0.95);
        gfx.beginPath(); gfx.arc(2.5, 0, 5, -0.9, 0.9); gfx.strokePath();
        gfx.beginPath(); gfx.arc(2.5, 0, 8, -0.85, 0.85); gfx.strokePath();
      } else {
        gfx.lineStyle(1.8, 0xe08a7a, 1);
        gfx.beginPath(); gfx.moveTo(-6, -8); gfx.lineTo(8, 8); gfx.strokePath();
      }
    };
    c.add([ring, gfx]);
    c.setSize(36, 36).setInteractive({ useHandCursor: true });
    draw(true);
    c.on('pointerup', () => {
      const muted = this.audio ? this.audio.toggle() : false;
      draw(!muted);
      if (!muted && this.audio) this.audio.uiClick();
      this.toast(muted ? '音效已关闭' : '音效已开启', muted ? '#c9c9c9' : '#9fe6bf');
    });
    this.soundToggle = c;
  }

  /* ---------------- 座位面板 ---------------- */

  buildSeats() {
    this.seatNodes = [];
    for (let i = 0; i < 4; i++) {
      const p = SEAT_POS[i];
      const c = this.add.container(p.x, p.y);
      const isSelf = (i === 0);
      const ring = this.add.image(0, 0, 'avatar').setDisplaySize(78, 78).setVisible(!isSelf);
      const name = this.add.text(0, 46, SEAT_NAME[i], {
        fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '18px',
        color: '#ffffff', stroke: '#06200f', strokeThickness: 3
      }).setOrigin(0.5).setVisible(!isSelf);
      // 张数：自家放手牌上方右侧空白处；他家放头像侧边，避开牌背与出牌区
      const cntX = isSelf ? 60 : (i === 3 ? -60 : 60);
      const cntY = isSelf ? -194 : -8;
      const cnt = this.add.text(cntX, cntY, '', {
        fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '17px',
        color: '#ffd76a', stroke: '#06200f', strokeThickness: 3
      }).setOrigin(isSelf ? 1 : 0.5);
      const lv = this.add.text(0, 68, '', {
        fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '15px', color: '#9fe6bf'
      }).setOrigin(0.5).setVisible(false);
      const badge = this.add.image(44, -44, 'ui_team1').setDisplaySize(40, 44).setOrigin(0.5).setVisible(false);
      const rank = this.add.image(26, -30, 'ui_mark_first').setDisplaySize(40, 40).setOrigin(0.5).setVisible(!isSelf);
      c.add([ring, name, cnt, lv, badge, rank]);
      this.seatNodes.push({ box: c, ring, name, cnt, lv, badge, rank, handSprites: [], outSprites: [] });
    }
  }

  /* ---------------- 中央信息 ---------------- */

  buildInfo() {
    // 状态与提示放在左侧空白区（牌背右侧、手牌上方），不遮挡任何牌
    this.txtCenter = this.add.text(180, 436, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '18px',
      color: '#cfe9da', align: 'left', lineSpacing: 4
    }).setOrigin(0, 0.5).setDepth(58);

    this.txtTip = this.add.text(180, 464, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '17px', color: '#cfeee0'
    }).setOrigin(0, 0.5).setDepth(58).setAlpha(0);

    this.txtToast = this.add.text(640, 352, '', {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '26px',
      color: '#ffd76a', align: 'center', stroke: '#06200f', strokeThickness: 6
    }).setOrigin(0.5).setDepth(300).setAlpha(0);
  }

  toast(msg, color) {
    this.txtToast.setText(msg).setColor(color || '#ffd76a').setAlpha(1).setDepth(300);
    this.tweens.killTweensOf(this.txtToast);
    this.tweens.add({ targets: this.txtToast, alpha: 0, delay: 1200, duration: 600 });
  }

  /* ---------------- 按钮 ---------------- */

  buildButtons() {
    // 原版三色按钮（273x97 提取图），等比缩小到 168x60，贴右下角、位于手牌上方
    const mk = (key, x, y, cb) => {
      // 阴影底衬，让按钮从桌布上"浮"起来
      const shadow = this.add.image(x + 3, y + 5, key)
        .setDisplaySize(BTN_W, BTN_H).setTint(0x000000).setAlpha(0.32).setDepth(59);
      const s = this.add.image(x, y, key).setDisplaySize(BTN_W, BTN_H)
        .setDepth(60).setInteractive({ useHandCursor: true });
      s.shadow = shadow;
      const down = key + '_down';
      s.setEnabled = (on) => {
        s.enabled = on;
        s.setTexture(on ? key : down);
        s.setAlpha(on ? 1 : 0.9);
        shadow.setVisible(on);
      };
      s.on('pointerdown', () => {
        if (s.enabled === false) return;
        s.setTexture(down); s.setTint(0xd8d8d8);
        if (this.audio) this.audio.uiDown();
      });
      s.on('pointerout', () => { if (s.enabled !== false) { s.setTexture(key); s.clearTint(); } });
      s.on('pointerup', () => {
        s.clearTint();
        if (s.enabled === false) return;
        s.setTexture(key);
        if (this.audio) this.audio.uiClick();
        cb();
      });
      return s;
    };
    this.btnPass = mk('ui_pass', BTN_X.pass, BTN_Y, () => this.onPass());
    this.btnHint = mk('ui_hint', BTN_X.hint, BTN_Y, () => this.onHint());
    this.btnPlay = mk('ui_play', BTN_X.play, BTN_Y, () => this.onPlay());

    // 再玩一局：程序化三态按钮
    const again = this.add.image(640, 612, 'btn_again_normal').setDisplaySize(210, 60)
      .setDepth(60).setInteractive({ useHandCursor: true }).setVisible(false);
    again.setEnabled = (on) => {
      again.enabled = on;
      again.setTexture(on ? 'btn_again_normal' : 'btn_again_disabled');
    };
    again.on('pointerdown', () => { if (again.enabled !== false) again.setTexture('btn_again_pressed'); });
    again.on('pointerout', () => { if (again.enabled !== false) again.setTexture('btn_again_normal'); });
    again.on('pointerup', () => {
      if (again.enabled === false) return;
      again.setTexture('btn_again_normal');
      if (this.audio) this.audio.uiClick();
      this.newRound();
    });
    this.btnAgain = again;
  }

  /* ---------------- 手牌输入（点选 + 滑动连选） ---------------- */

  /**
   * 不再依赖每张牌的 hitTest 矩形：牌的间距只有 42px、牌宽 142px，
   * 互相重叠时 Phaser 只会命中深度最高的那张，导致「点不准」。
   * 这里改为在手牌带状区域按 x 坐标反算牌索引，并支持按住拖动连续划选。
   */
  buildHandInput() {
    this._dragMode = null;    // true = 正在「选中」，false = 正在「取消」
    this._dragSeen = null;

    const end = () => { this._dragMode = null; this._dragSeen = null; };
    this.input.on('pointerdown', (p) => this.onHandDown(p));
    this.input.on('pointermove', (p) => this.onHandMove(p));
    this.input.on('pointerup', end);
    this.input.on('pointerupoutside', end);
    this.input.on('gameout', end);
  }

  /** 屏幕坐标 → 手牌索引；不在手牌区域返回 -1 */
  cardIndexAt(px, py) {
    const L = this._handLayout;
    if (!L || !L.n) return -1;
    if (py < HAND_HIT_TOP || py > HAND_HIT_BOTTOM) return -1;
    const leftEdge = L.startX - TEX.BIG_W / 2;
    const rightEdge = leftEdge + (L.n - 1) * L.gap + TEX.BIG_W;
    if (px < leftEdge - 6 || px > rightEdge + 6) return -1;
    if (L.n <= 1 || !L.gap) return 0;
    // 每张牌只露出左侧 gap 宽的条带（右侧被下一张压住），按条带反算索引
    let i = Math.floor((px - leftEdge) / L.gap);
    if (i < 0) i = 0;
    if (i > L.n - 1) i = L.n - 1;
    return i;
  }

  onHandDown(p) {
    if (!this.myTurn()) { this._dragMode = null; return; }
    const i = this.cardIndexAt(p.x, p.y);
    if (i < 0) { this._dragMode = null; return; }
    // 按下时决定本次拖动的方向：反选 / 正选
    this._dragMode = !this.selected.has(i);
    this._dragSeen = new Set([i]);
    this.setCard(i, this._dragMode, true);
  }

  onHandMove(p) {
    if (this._dragMode === null || !p.isDown) return;
    const i = this.cardIndexAt(p.x, p.y);
    if (i < 0 || this._dragSeen.has(i)) return;
    this._dragSeen.add(i);
    this.setCard(i, this._dragMode, true);
  }

  /** 设置某张牌的选中态；sound=true 时播放点牌音效 */
  setCard(idx, on, sound) {
    const spr = this.seatNodes[0].handSprites[idx];
    if (!spr) return;
    const has = this.selected.has(idx);
    if (on === has) return;
    if (on) this.selected.add(idx); else this.selected.delete(idx);
    spr.y = on ? HAND_Y - HAND_UP : HAND_Y;
    if (sound && this.audio) this.audio.cardSelect();
    this.afterSelect();
  }

  /** 选择变化后刷新牌型提示与按钮态 */
  afterSelect() {
    this.hintIdx = -1;
    this.showSelTip();
    this.updateButtons();
  }

  /* ---------------- 一局开始 ---------------- */

  newRound() {
    if (this.panel) { this.panel.destroy(); this.panel = null; }
    this.table.deal();
    this.selected.clear();
    this.hintList = [];
    this.hintIdx = -1;
    this.busy = false;
    this.settle = null;
    this.outShow = [null, null, null, null];
    this.btnAgain.setVisible(false);
    [this.btnPass, this.btnHint, this.btnPlay].forEach(b => b.setVisible(true));
    this.txtToast.setAlpha(0);
    this.txtTip.setAlpha(0);

    this.level = this.table.levelOf(0);

    if (this.audio) this.audio.dealStart();
    this.renderAll();
    this.scheduleTurn();
  }

  /* ---------------- 渲染 ---------------- */

  renderAll() {
    const t = this.table;
    this.txtRound.setText('第 ' + ((this.isOnline && this.remote) ? this.remote.round : t.roundNo) + ' 局');
    const lv = this.level;
    const wildCard = Rule.levelHeartCard ? Rule.levelHeartCard(lv) : 0;
    this.txtLevelInfo.setText(
      '本方打 ' + CardLib.rankName(lv) + '    对方打 ' + CardLib.rankName(t.levelOf(1)) +
      '    逢人配 ' + (wildCard ? CardLib.name(wildCard) : '-')
    );

    for (let i = 0; i < 4; i++) {
      const s = t.seats[i], node = this.seatNodes[i];
      node.cnt.setText((i === 0 ? '我 · ' : '') + s.hand.length + ' 张');
      node.lv.setText('打' + CardLib.rankName(t.levelOf(i)));
      node.ring.setTexture((t.currentSeat === i && t.step === 'play') ? 'avatar_cur' : 'avatar');
      node.badge.setVisible(i === 2);
      if (s.rank > 0) {
        // 头游/末游用原版徽标图，二游/三游用文字徽标
        const key = s.rank === 1 ? 'ui_mark_first' : s.rank === 4 ? 'ui_mark_last' : 'b_rank' + s.rank;
        node.rank.setVisible(true).setTexture(key);
        if (s.rank === 2 || s.rank === 3) node.rank.setDisplaySize(74, 26);
        else node.rank.setDisplaySize(40, 40);
        if (i === 0) node.rank.setPosition(0, -164);
      } else node.rank.setVisible(false);
      this.renderHand(i);
      this.renderOut(i);
    }

    if (t.step === 'play') {
      const mine = t.currentSeat === 0;
      let txt = mine ? '轮到你了' : this.seatNames[t.currentSeat] + ' 出牌中…';
      if (t.lastPattern) txt += '\n待压：' + Rule.patternText(t.lastPattern);
      this.txtCenter.setText(txt).setColor(mine ? '#ffd76a' : '#cfe9da');
    } else {
      this.txtCenter.setText('');
    }
    this.updateButtons();
  }

  renderHand(seat) {
    const node = this.seatNodes[seat];
    node.handSprites.forEach(s => s.destroy());
    node.handSprites = [];
    const hand = this.table.seats[seat].hand;

    if (seat === 0) {
      // 原版手牌：142x194 大牌 = 底版 + 数字贴片 + 小花色（级牌橙数字 / 逢人配金框）
      const n = hand.length;
      const cw = TEX.BIG_W, chh = TEX.BIG_H;
      const wildCard = Rule.levelHeartCard ? Rule.levelHeartCard(this.level) : 0;
      const avail = W - 60;
      let gap = n > 1 ? Math.min(HAND_GAP_MAX, (avail - cw) / (n - 1)) : 0;
      if (gap < HAND_GAP_MIN) gap = HAND_GAP_MIN;
      const total = n > 0 ? cw + gap * (n - 1) : 0;
      const startX = n > 0 ? 640 - total / 2 + cw / 2 : 640;
      this._handLayout = { startX, gap, n };   // 供 cardIndexAt 反算命中
      hand.forEach((card, i) => {
        const cont = this.add.container(startX + i * gap, HAND_Y);
        cont.setDepth(10 + i);
        // 牌投影：让重叠的牌有层次
        cont.add(this.add.image(2, 4, 'card_shadow')
          .setDisplaySize(TEX.BIG_W + 12, TEX.BIG_H + 12).setAlpha(0.5));
        const base = this.add.image(0, 0, TEX.bigKey(card));
        cont.add(base);
        if (card < 53) {
          const rank = CardLib.num(card);                 // 14=A .. 13=K
          const suit = CardLib.suitOf(card);              // 1方 2梅 3红 4黑
          const isLevel = rank === this.level;
          const colorTag = isLevel ? 'orange' : (suit === 1 || suit === 3) ? 'red' : 'black';
          cont.add(this.add.image(-63, -91, 'p_num_' + colorTag + '_' + rank).setOrigin(0));
          cont.add(this.add.image(-63, -45, TEX.suitKey(suit)).setOrigin(0));
        }
        if (card === wildCard) cont.add(this.add.image(0, 0, 'p_glow'));  // 逢人配金框
        if (this.selected.has(i)) cont.y = HAND_Y - HAND_UP;
        base.setInteractive({ useHandCursor: true });   // 只保留手型，点击统一走手牌带
        cont.cardIndex = i;
        node.handSprites.push(cont);
      });
    } else {
      // 他家手牌：原版 smallCards 牌背 42x57
      const gap = seat === 2 ? 11 : 6;
      const n = hand.length;
      const p = SEAT_POS[seat];
      hand.forEach((card, i) => {
        let spr;
        if (seat === 1 || seat === 3) {
          const total = (n - 1) * gap;
          spr = this.add.image(p.x, p.y + 168 - total / 2 + i * gap, 'p_back');
          spr.setAngle(seat === 1 ? 90 : -90);
        } else {
          const total = (n - 1) * gap;
          spr = this.add.image(p.x - total / 2 + i * gap, p.y + 80, 'p_back');
        }
        spr.setDisplaySize(BACK_W, BACK_H);
        node.handSprites.push(spr);
      });
    }
  }

  renderOut(seat) {
    const node = this.seatNodes[seat];
    node.outSprites.forEach(s => s.destroy());
    node.outSprites = [];
    const o = this.outShow[seat];
    if (!o) return;
    const p = OUT_POS[seat];
    // 出牌区：自己用原版 130x181 的 85%，他家按比例缩小
    const sc = OUT_SCALE[seat];
    const cw = TEX.CARD_W * sc;
    const chh = TEX.CARD_H * sc;
    const maxW = seat === 0 ? 620 : 320;
    const gap = o.cards.length > 1 ? Math.min(26, Math.max(10, (maxW - cw) / (o.cards.length - 1))) : 0;
    const total = (o.cards.length - 1) * gap;
    o.cards.forEach((card, i) => {
      const x = p.x - total / 2 + i * gap;
      const sh = this.add.image(x + 2, p.y + 4, 'card_shadow')
        .setDisplaySize(cw, chh).setAlpha(0.5);
      node.outSprites.push(sh);
      const spr = this.add.image(x, p.y, TEX.cardKey(card));
      spr.setDisplaySize(cw, chh);
      node.outSprites.push(spr);
    });
    if (seat === 0) return;   // 自己的牌型文字在左侧状态区显示，出牌区不再叠字
    let tx = p.x, ty = p.y - chh / 2 - 14;
    if (seat === 2) { tx = p.x + cw / 2 + 52; ty = p.y; }   // 对家：文字放牌右侧，避开自己的出牌区
    const txt = this.add.text(tx, ty, o.patternName, {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '16px',
      color: '#ffe9b0', stroke: '#0a2416', strokeThickness: 4
    }).setOrigin(0.5);
    node.outSprites.push(txt);
  }

  /* ---------------- 交互 ---------------- */

  myTurn() {
    return this.table.step === 'play' && this.table.currentSeat === 0 && !this.busy;
  }

  toggleCard(idx) {
    if (!this.myTurn()) return;
    this.setCard(idx, !this.selected.has(idx), true);
  }

  showSelTip() {
    if (this.selected.size === 0) { this.txtTip.setAlpha(0); return; }
    const hand = this.table.seats[0].hand;
    const cards = [...this.selected].map(i => hand[i]);
    const p = Rule.parse(cards, this.level);
    if (!p) { this.txtTip.setText('牌型不合法').setColor('#ff9c8a').setAlpha(1); return; }
    const cur = this.table.lastPattern;
    if (cur && !Rule.canBeat(p, cur, this.level)) {
      this.txtTip.setText(p.name + ' 压不过 ' + cur.name).setColor('#ff9c8a').setAlpha(1);
    } else {
      this.txtTip.setText(p.name).setColor('#9fe6bf').setAlpha(1);
    }
  }

  onHint() {
    if (!this.myTurn()) return;
    if (this.hintList.length === 0) {
      this.hintList = HintFinder.find(this.table.seats[0].hand, this.table.lastPattern, this.level);
      this.hintIdx = -1;
    }
    if (this.hintList.length === 0) {
      this.toast('没有能压过的牌，请过牌', '#ff9c8a');
      return;
    }
    this.hintIdx = (this.hintIdx + 1) % this.hintList.length;
    this.selected.clear();
    const hand = this.table.seats[0].hand;
    // 两副牌存在编码相同的重复牌，按计数分配 index，避免 indexOf 永远命中同一张
    const need = {};
    this.hintList[this.hintIdx].cards.forEach(c => { need[c] = (need[c] || 0) + 1; });
    hand.forEach((c, i) => {
      if (need[c] > 0) { this.selected.add(i); need[c]--; }
    });
    this.seatNodes[0].handSprites.forEach((s, i) => { s.y = this.selected.has(i) ? HAND_Y - HAND_UP : HAND_Y; });
    this.txtTip.setText(Rule.patternText(this.hintList[this.hintIdx])).setColor('#9fe6bf').setAlpha(1);
    this.updateButtons();
  }

  onPlay() {
    if (!this.myTurn()) return;
    const hand = this.table.seats[0].hand;
    const cards = [...this.selected].map(i => hand[i]);
    if (cards.length === 0) { this.toast('请先选牌'); return; }
    const p = Rule.parse(cards, this.level);
    if (!p) { this.toast('牌型不合法'); return; }
    if (this.table.lastPattern && !Rule.canBeat(p, this.table.lastPattern, this.level)) {
      this.toast('压不过上家'); return;
    }

    if (this.isOnline) {
      // 联机：交给服务端裁定，本地只做即时反馈
      if (this.audio) this.audio.playCards(p);
      this.net.play(cards);
      this.clearSelection();
      return;
    }

    if (!this.table.play(0, cards)) { this.toast('出牌失败'); return; }

    this.outShow[0] = { cards: cards.slice(), patternName: Rule.patternText(p) };
    if (this.audio) this.audio.playCards(p);
    this.clearSelection();
    this.renderAll();
    if (this.checkEnd()) return;
    this.scheduleTurn();
  }

  onPass() {
    if (!this.myTurn()) return;
    if (!this.table.lastPattern) { this.toast('你是先手，必须出牌'); return; }

    if (this.isOnline) {
      if (this.audio) this.audio.pass();
      this.net.pass();
      this.clearSelection();
      return;
    }

    this.table.play(0, []);
    this.outShow[0] = null;
    if (this.audio) this.audio.pass();
    this.clearSelection();
    this.renderAll();
    this.scheduleTurn();
  }

  clearSelection() {
    this.selected.clear();
    this.hintList = [];
    this.hintIdx = -1;
    this.txtTip.setAlpha(0);
  }

  /* ---------------- 回合调度 ---------------- */

  scheduleTurn() {
    const t = this.table;
    // 联机：回合推进由服务端 sync 驱动
    if (this.isOnline) { this.updateButtons(); return; }
    if (t.step !== 'play') { this.checkEnd(); return; }
    if (t.currentSeat === 0) { this.updateButtons(); return; }
    this.busy = true;
    this.updateButtons();
    this.time.delayedCall(this.aiDelay || 600, () => this.aiTurn());
  }

  aiTurn() {
    if (this.isOnline) return;
    const t = this.table;
    if (t.step !== 'play') { this.busy = false; this.checkEnd(); return; }
    const seat = t.currentSeat;
    const cards = AI.choose(t, seat);
    if (cards && cards.length) {
      const p = Rule.parse(cards, this.level);
      if (t.play(seat, cards)) {
        this.outShow[seat] = { cards: cards.slice(), patternName: p ? Rule.patternText(p) : '' };
        if (this.audio) this.audio.playCards(p);
      } else {
        t.play(seat, []);
        this.outShow[seat] = null;
        if (this.audio) this.audio.pass();
      }
    } else {
      t.play(seat, []);
      this.outShow[seat] = null;
      if (this.audio) this.audio.pass();
    }
    this.busy = false;
    this.renderAll();
    if (this.checkEnd()) return;
    this.scheduleTurn();
  }

  checkEnd() {
    const t = this.table;
    if (t.step === 'play') return false;
    if (this.settle) return true;
    this.doWinLost();
    return true;
  }

  /* ---------------- 结算 ---------------- */

  doWinLost() {
    const res = this.table.settle();
    this.settle = res;

    const lines = [];
    lines.push(res.winnerTeam === 1 ? '本方胜！' : '对方胜');
    if (res.doubleDown) lines.push('双下');
    lines.push('本方：' + CardLib.rankName(this.table.levelOf(0) === 15 ? 14 : this.table.levelOf(0)));
    lines.push('升级 +' + res.upLevel);

    let tributeInfo = '';
    if (res.resisted) {
      tributeInfo = '抗贡：双大王，免贡';
      if (this.audio) this.audio.fanbei();
    } else if (res.tributes && res.tributes.length) {
      const logs = this.table.doTribute(res.tributes);
      tributeInfo = logs.map(l =>
        SEAT_NAME[l.fromSeat] + ' 进贡 ' + CardLib.name(l.card) +
        (l.back ? '，' + SEAT_NAME[l.toSeat] + ' 还 ' + CardLib.name(l.back) : '')
      ).join('；');
      if (this.audio) this.audio.tribute();
    }
    if (tributeInfo) lines.push(tributeInfo);

    this.level = this.table.levelOf(0);

    if (this.audio) {
      if (res.winnerTeam === 1) this.audio.win(); else this.audio.lose();
    }

    this.renderAll();
    [this.btnPass, this.btnHint, this.btnPlay].forEach(b => {
      b.setVisible(false);
      if (b.shadow) b.shadow.setVisible(false);
    });
    this.showPanel(res.winnerTeam === 1 ? '胜 利' : '失 败', lines);
    this.btnAgain.setVisible(true);
    this.btnAgain.setEnabled(true);
  }

  showPanel(title, lines) {
    if (this.panel) this.panel.destroy();
    const pw = 520, ph = 300;
    const c = this.add.container(640, 334).setDepth(1000);
    const g = this.add.graphics();
    // 全屏遮罩
    g.fillStyle(0x000000, 0.66);
    g.fillRect(-640, -334, W, H);
    // 面板投影 + 主体
    g.fillStyle(0x000000, 0.38);
    g.fillRoundedRect(-pw / 2 + 7, -ph / 2 + 9, pw, ph, 20);
    g.fillStyle(0x0b3b23, 1);
    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    // 标题带
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, 76, { tl: 16, tr: 16, bl: 0, br: 0 });
    // 双层金边
    g.lineStyle(3, 0xe8c46a, 1);
    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
    g.lineStyle(1, 0xfff3cf, 0.3);
    g.strokeRoundedRect(-pw / 2 + 7, -ph / 2 + 7, pw - 14, ph - 14, 13);
    // 标题下金线
    g.lineStyle(2, 0xe8c46a, 0.65);
    g.beginPath(); g.moveTo(-pw / 2 + 34, -ph / 2 + 78); g.lineTo(pw / 2 - 34, -ph / 2 + 78); g.strokePath();
    c.add(g);

    const win = title.indexOf('胜') >= 0;
    c.add(this.add.text(0, -ph / 2 + 40, title, {
      fontFamily: '"Microsoft YaHei","PingFang SC",sans-serif', fontSize: '34px',
      color: win ? '#ffd76a' : '#a8c8f0', fontStyle: 'bold',
      stroke: '#04170c', strokeThickness: 5
    }).setOrigin(0.5));

    c.add(this.add.text(0, 30, lines.join('\n'), {
      fontFamily: '"Microsoft YaHei",sans-serif', fontSize: '19px',
      color: '#e8f5ee', align: 'center', lineSpacing: 11,
      wordWrap: { width: pw - 70 }
    }).setOrigin(0.5));
    this.panel = c;
  }

  /* ---------------- 按钮态 ---------------- */

  updateButtons() {
    const t = this.table;
    const turn = this.myTurn();
    // 只有「牌局进行中且未结算」才显示三个操作按钮；
    // 结算面板、等待房间时统一隐藏（避免再来一局后按钮不见/残留）
    const showOps = t.step === 'play' && !this.settle && !(this.waitRoom && this.waitRoom.visible);
    [this.btnPass, this.btnHint, this.btnPlay].forEach((b) => {
      b.setVisible(showOps);
      if (b.shadow) b.shadow.setVisible(showOps && b.enabled !== false);
    });

    let canPlay = false;
    if (turn && this.selected.size > 0) {
      const hand = t.seats[0].hand;
      const cards = [...this.selected].map(i => hand[i]);
      const p = Rule.parse(cards, this.level);
      canPlay = !!p && (!t.lastPattern || Rule.canBeat(p, t.lastPattern, this.level));
    }
    this.btnHint.setEnabled(turn);
    this.btnPlay.setEnabled(turn && canPlay);
    this.btnPass.setEnabled(turn && !!t.lastPattern);
  }
}

export { W, H };

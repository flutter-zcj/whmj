/* ===========================================================
 * 房间等待层（Phaser 覆盖在牌桌之上）
 *
 *   进房后 → 服务端 status = 'waiting' → 显示本层
 *   4 个座位可视化，房主可「添加电脑 / 开始游戏」，其他人等待
 *   开局后 status = 'playing' → 隐藏，进入牌桌
 * =========================================================== */

const W = 1280, H = 720;
const GOLD = 0xe8c46a;
const FONT = '"Microsoft YaHei","PingFang SC",sans-serif';

const PW = 900, PH = 486, PX = 640, PY = 372;
const CARD_W = 184, CARD_H = 176, CARD_GAP = 14;

export default class WaitRoom {
  constructor(scene, hooks = {}) {
    this.scene = scene;
    this.hooks = hooks;       // { onCopy, onAddBot, onRemoveBot, onStart, onExit }
    this.root = null;
    this._sig = '';
  }

  get visible() {
    return !!this.root;
  }

  /** 用服务端 sync 数据渲染；数据没变则跳过重建 */
  show(st) {
    const sig = JSON.stringify([st.room, st.isHost, st.seats.map((x) => [x.name, x.empty, x.bot, x.host])]);
    if (this.root && sig === this._sig) return;
    this._sig = sig;
    this.hide();
    this._build(st);
  }

  hide() {
    if (this.root) {
      this.root.destroy(true);
      this.root = null;
    }
  }

  /* ---------------- 构建 ---------------- */

  _build(st) {
    const s = this.scene;
    const c = s.add.container(0, 0).setDepth(900);
    const g = s.add.graphics();

    // 全屏遮罩 + 面板
    g.fillStyle(0x03160d, 0.95);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(PX - PW / 2 + 8, PY - PH / 2 + 10, PW, PH, 22);
    g.fillStyle(0x0a3320, 1);
    g.fillRoundedRect(PX - PW / 2, PY - PH / 2, PW, PH, 20);
    g.lineStyle(3, GOLD, 0.95);
    g.strokeRoundedRect(PX - PW / 2, PY - PH / 2, PW, PH, 20);
    g.lineStyle(1, 0xfff3cf, 0.22);
    g.strokeRoundedRect(PX - PW / 2 + 8, PY - PH / 2 + 8, PW - 16, PH - 16, 14);
    // 顶部标题带
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(PX - PW / 2 + 3, PY - PH / 2 + 3, PW - 6, 78, { tl: 18, tr: 18, bl: 0, br: 0 });
    g.lineStyle(1.5, GOLD, 0.5);
    g.beginPath();
    g.moveTo(PX - PW / 2 + 40, PY - PH / 2 + 81);
    g.lineTo(PX + PW / 2 - 40, PY - PH / 2 + 81);
    g.strokePath();
    c.add(g);

    const topY = PY - PH / 2;

    // 标题：房间号大字（居中）+ 副标题
    c.add(s.add.text(PX, topY + 40, '房间 ' + st.room, {
      fontFamily: FONT, fontSize: '38px', color: '#ffd76a', fontStyle: 'bold',
      letterSpacing: 4, stroke: '#04170c', strokeThickness: 5
    }).setOrigin(0.5));

    // 副标题
    c.add(s.add.text(PX, topY + 100, st.isHost
      ? '把房间号发给好友，或直接添加电脑开局'
      : '等待房主开始游戏…', {
      fontFamily: FONT, fontSize: '16px', color: '#8fc9ac'
    }).setOrigin(0.5));

    // 4 个座位
    const totalW = CARD_W * 4 + CARD_GAP * 3;
    const startX = PX - totalW / 2 + CARD_W / 2;
    st.seats.forEach((seat, i) => {
      this._seatCard(c, startX + i * (CARD_W + CARD_GAP), PY - 8, seat, i, st);
    });

    // 底部按钮
    const btnY = PY + PH / 2 - 56;
    const host = st.isHost;
    const emptyCount = st.seats.filter((x) => x.empty).length;
    if (host) {
      this._btn(c, PX - 250, btnY, 190, 54, '＋ 添加电脑', 'ghost', () => {
        if (this.hooks.onAddBot) this.hooks.onAddBot();
      }, emptyCount > 0);
      this._btn(c, PX, btnY, 210, 54, '开 始 游 戏', 'primary', () => {
        if (this.hooks.onStart) this.hooks.onStart();
      }, emptyCount === 0);
      this._btn(c, PX + 250, btnY, 190, 54, '复制房间号', 'ghost', () => {
        if (this.hooks.onCopy) this.hooks.onCopy();
      }, true);
    } else {
      this._btn(c, PX - 110, btnY, 200, 54, '复制房间号', 'ghost', () => {
        if (this.hooks.onCopy) this.hooks.onCopy();
      }, true);
      this._btn(c, PX + 110, btnY, 200, 54, '退出房间', 'ghost', () => {
        if (this.hooks.onExit) this.hooks.onExit();
      }, true);
    }

    // 房主退出放右上角
    if (host) {
      const ex = PX + PW / 2 - 66, ey = topY + 38;
      const et = s.add.text(ex, ey, '退出', {
        fontFamily: FONT, fontSize: '16px', color: '#cfe9da'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      et.on('pointerup', () => { if (this.hooks.onExit) this.hooks.onExit(); });
      c.add(et);
    }

    this.root = c;
  }

  _seatCard(c, x, y, seat, idx, st) {
    const s = this.scene;
    const left = x - CARD_W / 2, top = y - CARD_H / 2;
    const g = s.add.graphics();
    const filled = !seat.empty;
    const isHost = !!seat.host;

    g.fillStyle(filled ? 0x0f4630 : 0x082a1b, 1);
    g.fillRoundedRect(left, top, CARD_W, CARD_H, 14);
    g.lineStyle(filled ? 2 : 1.5, isHost ? GOLD : (filled ? 0x3f8a63 : 0x255840), filled ? 0.95 : 0.6);
    g.strokeRoundedRect(left, top, CARD_W, CARD_H, 14);
    if (filled) {
      // 头像底盘
      g.fillStyle(seat.bot ? 0x1d5a3c : 0x124d33, 1);
      g.fillCircle(x, top + 58, 34);
      g.lineStyle(2, isHost ? GOLD : 0x62b98b, 0.9);
      g.strokeCircle(x, top + 58, 34);
    }
    c.add(g);

    if (!filled) {
      // 空位：虚线圈 + 文案
      const eg = s.add.graphics();
      eg.lineStyle(2, 0x2f6b4d, 0.9);
      for (let a = 0; a < 12; a++) {
        if (a % 2) continue;
        eg.beginPath();
        eg.arc(x, top + 58, 32, (a / 12) * Math.PI * 2, ((a + 1) / 12) * Math.PI * 2);
        eg.strokePath();
      }
      c.add(eg);
      c.add(s.add.text(x, top + 58, '＋', {
        fontFamily: FONT, fontSize: '28px', color: '#3f8a63'
      }).setOrigin(0.5));
      c.add(s.add.text(x, top + 112, '等待加入', {
        fontFamily: FONT, fontSize: '15px', color: '#5f9c7d'
      }).setOrigin(0.5));
      c.add(s.add.text(x, top + 146, '座位 ' + (idx + 1), {
        fontFamily: FONT, fontSize: '13px', color: '#3f7a5c'
      }).setOrigin(0.5));
      return;
    }

    // 头像文字（名字首字）
    const initial = (seat.name || '?').slice(0, 1);
    c.add(s.add.text(x, top + 58, initial, {
      fontFamily: FONT, fontSize: '28px', color: seat.bot ? '#bfe6d2' : '#ffe9b0', fontStyle: 'bold'
    }).setOrigin(0.5));

    if (isHost) {
      const bw = 46;
      const bg = s.add.graphics();
      bg.fillStyle(GOLD, 1);
      bg.fillRoundedRect(x + CARD_W / 2 - bw - 8, top + 8, bw, 20, 10);
      c.add(bg);
      c.add(s.add.text(x + CARD_W / 2 - bw / 2 - 8, top + 18, '房主', {
        fontFamily: FONT, fontSize: '12px', color: '#3a2400', fontStyle: 'bold'
      }).setOrigin(0.5));
    }

    const name = (seat.name || '').slice(0, 7);
    c.add(s.add.text(x, top + 112, name, {
      fontFamily: FONT, fontSize: '17px', color: '#f2fbf6'
    }).setOrigin(0.5));

    const tag = seat.bot ? '电脑' : (seat.online ? '已就绪' : '离线');
    c.add(s.add.text(x, top + 142, tag, {
      fontFamily: FONT, fontSize: '14px',
      color: seat.bot ? '#8fc9ac' : (seat.online ? '#9fe6bf' : '#e08a7a')
    }).setOrigin(0.5));

    // 房主可移除电脑
    if (seat.bot && st.isHost) {
      const rm = s.add.text(x + CARD_W / 2 - 16, top + 16, '×', {
        fontFamily: FONT, fontSize: '20px', color: '#e08a7a'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      rm.on('pointerup', () => { if (this.hooks.onRemoveBot) this.hooks.onRemoveBot(seat.seat); });
      c.add(rm);
    }
  }

  _btn(c, x, y, w, h, label, kind, onClick, enabled = true) {
    const s = this.scene;
    const g = s.add.graphics();
    if (kind === 'primary' && enabled) {
      g.fillStyle(0x2f9a5c, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 11);
      g.fillStyle(0x7ce09a, 0.2);
      g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h / 2, { tl: 9, tr: 9, bl: 0, br: 0 });
      g.lineStyle(1.5, 0xd8f5c8, 0.5);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 11);
    } else {
      g.fillStyle(enabled ? 0x12503a : 0x0d3325, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 11);
      g.lineStyle(1.5, enabled ? GOLD : 0x2f6b4d, enabled ? 0.65 : 0.5);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 11);
    }
    const t = s.add.text(x, y, label, {
      fontFamily: FONT, fontSize: '18px', fontStyle: 'bold',
      color: !enabled ? '#5f9c7d' : (kind === 'primary' ? '#06280f' : '#e8f5ee')
    }).setOrigin(0.5);
    c.add([g, t]);

    if (enabled) {
      const zone = s.add.rectangle(x, y, w, h, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => { t.setAlpha(0.7); });
      zone.on('pointerout', () => { t.setAlpha(1); });
      zone.on('pointerup', () => { t.setAlpha(1); onClick(); });
      c.add(zone);
    }
  }
}

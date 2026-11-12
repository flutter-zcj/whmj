/* ===========================================================
 * WebSocket 联机客户端（cherry simple 协议）
 *
 * 帧格式：mid(uint32 BE) + dataLen(uint32 BE) + JSON body
 *   - 业务字段与旧版完全一致（{t:'join',room,name} / {t:'sync',...}）
 *   - 收发处统一做 8 字节头编解码，上层 GameScene 无感知
 *   - 兼容旧服务端（收到文本帧时按纯 JSON 解析）
 *
 * 其它能力：心跳保活、断线自动重连（指数退避）、稳定 uid（战绩/重连）
 * =========================================================== */

const RECONNECT_MAX = 5;

/* 客户端 → 服务端 消息号 */
const MID = {
  join: 1, start: 2, addBot: 3, removeBot: 4,
  play: 5, pass: 6, leave: 7, ping: 8, ready: 9,
};

/* 服务端 → 客户端 消息号 */
const MID_NAME = {
  100: 'joined', 101: 'sync', 102: 'settle', 103: 'error',
  104: 'pong', 105: 'hello', 106: 'left',
};

const enc = new TextEncoder();
const dec = new TextDecoder();

/** 打包成 simple 协议帧 */
function pack(mid, body) {
  const bytes = enc.encode(JSON.stringify(body));
  const buf = new Uint8Array(8 + bytes.length);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, mid, false);
  dv.setUint32(4, bytes.length, false);
  buf.set(bytes, 8);
  return buf.buffer;
}

/** 解析 simple 协议帧；非二进制返回 null（走旧 JSON 分支） */
function unpack(data) {
  if (typeof data === 'string') return null;
  if (!(data instanceof ArrayBuffer) || data.byteLength < 8) return null;
  const dv = new DataView(data);
  if (data.byteLength < 8 + dv.getUint32(4, false)) return null;
  const mid = dv.getUint32(0, false);
  const len = dv.getUint32(4, false);
  let body = {};
  if (len > 0) {
    try { body = JSON.parse(dec.decode(new Uint8Array(data, 8, len))); } catch (e) { return null; }
  }
  return { mid, body, name: MID_NAME[mid] || '' };
}

function buildUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  // 由统一网关分流：/gd-ws/ 管道到掼蛋服务端（本地开发同样走该前缀）
  return proto + '//' + location.host + '/gd-ws/';
}

/** 本机稳定 uid（用于断线重连与战绩归属），优先取麻将账号 id */
export function localUid() {
  try {
    if (typeof window !== 'undefined' && window.__GD_UID) return String(window.__GD_UID);
    let u = localStorage.getItem('gd_uid');
    if (!u) {
      u = 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem('gd_uid', u);
    }
    return u;
  } catch (e) {
    return '';
  }
}

export default class Net {
  constructor(opts) {
    this.room = String(opts.room || '');
    this.name = String(opts.name || '');
    this.create = !!opts.create;      // true = 房间不存在时新建（创建房间）
    this.uid = opts.uid || localUid();
    this.url = opts.url || (typeof window !== 'undefined' && window.__GD_WS) || buildUrl();
    this.ws = null;
    this.handlers = {};
    this.connected = false;
    this.seat = -1;
    this._retry = 0;
    this._hb = null;
    this._closedByUser = false;
  }

  on(type, fn) {
    (this.handlers[type] = this.handlers[type] || []).push(fn);
    return this;
  }

  emit(type, payload) {
    (this.handlers[type] || []).forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('[net] handler error', type, e); }
    });
  }

  connect() {
    this._closedByUser = false;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';
    } catch (e) {
      this.emit('error', { msg: '无法连接服务器' });
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
      this._retry = 0;
      this.emit('open', {});
      this.send({
        t: 'join', room: this.room, name: this.name, create: this.create, uid: this.uid,
      });
      clearInterval(this._hb);
      this._hb = setInterval(() => this.send({ t: 'ping' }), 25000);
    };

    this.ws.onmessage = (ev) => {
      let m = null;
      const pkt = unpack(ev.data);
      if (pkt) {
        m = pkt.body || {};
        if (!m.t) m.t = pkt.name;
      } else {
        // 兼容旧服务端（纯 JSON 文本帧）
        try { m = JSON.parse(ev.data); } catch (e) { return; }
      }
      if (!m || m.t === 'pong' || m.t === 'hello') return;
      if (m.t === 'joined') this.seat = m.seat;
      this.emit(m.t, m);
    };

    this.ws.onclose = () => {
      this.connected = false;
      clearInterval(this._hb);
      this.emit('close', {});
      if (!this._closedByUser && this._retry < RECONNECT_MAX) {
        const wait = 1200 * Math.pow(1.6, this._retry);
        this._retry++;
        setTimeout(() => this.connect(), wait);
      }
    };

    this.ws.onerror = () => { this.emit('error', { msg: '网络异常' }); };
  }

  send(obj) {
    if (!this.ws || this.ws.readyState !== 1) return false;
    const mid = MID[obj.t];
    if (!mid) return false;
    try {
      this.ws.send(pack(mid, obj));
      return true;
    } catch (e) { return false; }
  }

  play(cards) { return this.send({ t: 'play', cards }); }
  pass() { return this.send({ t: 'pass' }); }
  start() { return this.send({ t: 'start' }); }
  addBot() { return this.send({ t: 'addBot' }); }
  removeBot(seat) { return this.send({ t: 'removeBot', seat }); }
  leave() { return this.send({ t: 'leave' }); }
  ready(v) { return this.send({ t: 'ready', ready: !!v }); }

  close() {
    this._closedByUser = true;
    clearInterval(this._hb);
    if (this.ws) { try { this.ws.close(); } catch (e) {} }
  }
}

/** 生成 6 位房间号（本地预生成，服务端会以其为准） */
export function genRoomId() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export { MID, MID_NAME, pack, unpack };

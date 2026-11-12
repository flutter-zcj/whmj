/* ===========================================================
 * 掼蛋牌桌状态机：发牌 / 出牌 / 名次 / 升级 / 进贡 / 抗贡
 * 移植自 server/Guandan.Core/GameTable.cs
 * 修正：结算时为未出完者补名次 4（C# 版依赖 Rank==4 会漏判）
 * =========================================================== */
import CardLib from './card.js';
import Rule from './rule.js';

(function (root) {
  'use strict';

  const C = CardLib;
  const R = Rule;

  const PLAYER_COUNT = 4;
  const HAND_SIZE = 27;

  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  /** 可复现随机（便于调试与复盘） */
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  class GameTable {
    constructor(seed) {
      this.seed = seed || (Date.now() & 0x7fffffff);
      this._rng = makeRng(this.seed);
      this.seats = [];
      for (let i = 0; i < PLAYER_COUNT; i++) {
        this.seats.push({ index: i, team: (i % 2 === 0) ? 1 : 2, hand: [], rank: 0 });
      }
      this.levelTeam1 = 2;
      this.levelTeam2 = 2;
      this.step = 'none';
      this.banker = 0;
      this.currentSeat = 0;
      this.lastPlaySeat = -1;
      this.lastPattern = null;
      this.finishCount = 0;
      this.roundNo = 0;
    }

    get finishedSeatCount() {
      return this.seats.filter(function (s) { return s.hand.length === 0; }).length;
    }

    levelOf(seat) {
      return this.seats[seat].team === 1 ? this.levelTeam1 : this.levelTeam2;
    }

    /** 发牌：两副 108 张，每人 27 张 */
    deal() {
      const deck = shuffle(C.newDeck(), this._rng);
      for (let s = 0; s < PLAYER_COUNT; s++) {
        const hand = deck.slice(s * HAND_SIZE, (s + 1) * HAND_SIZE);
        this.seats[s].hand = C.sortDesc(hand, this.levelOf(s));
        this.seats[s].rank = 0;
      }
      this.step = 'play';
      this.finishCount = 0;
      this.lastPattern = null;
      this.lastPlaySeat = -1;
      this.currentSeat = this.banker;
      this.roundNo++;
      return this;
    }

    /** 出牌（空数组 = 过牌） */
    play(seat, cards) {
      if (this.step !== 'play' || seat !== this.currentSeat) return false;
      const hand = this.seats[seat].hand;
      const level = this.levelOf(seat);

      if (!cards || cards.length === 0) {
        // 过牌：自由出牌轮不允许过
        if (this.lastPlaySeat === seat || this.lastPlaySeat === -1) return false;
        this.advance();
        return true;
      }

      // 校验手牌持有
      const pool = hand.slice();
      for (let i = 0; i < cards.length; i++) {
        const idx = pool.indexOf(cards[i]);
        if (idx < 0) return false;
        pool.splice(idx, 1);
      }

      const p = R.parse(cards, level);
      if (!p || !R.canBeat(p, this.lastPattern, level)) return false;

      this.seats[seat].hand = pool;
      this.lastPattern = p;
      this.lastPlaySeat = seat;
      this.lastPlaySeatCards = cards.slice();

      if (this.seats[seat].hand.length === 0) {
        this.seats[seat].rank = ++this.finishCount;
        this.lastPattern = null;
        this.lastPlaySeat = -1;
        this.lastPlaySeatCards = null;
        if (this.finishCount >= 3) { this.step = 'winLost'; return true; }
      }
      this.advance();
      return true;
    }

    /**
     * 轮转到下一位未出完的玩家。
     * 若绕回一圈回到本轮最后出牌者，说明其余三家均过牌，
     * 该玩家重新获得自由出牌权（清空待压牌型）。
     */
    advance() {
      for (let i = 1; i <= PLAYER_COUNT; i++) {
        const next = (this.currentSeat + i) % PLAYER_COUNT;
        if (this.seats[next].hand.length > 0) {
          this.currentSeat = next;
          if (next === this.lastPlaySeat) {
            this.lastPattern = null;
            this.lastPlaySeat = -1;
          }
          return;
        }
      }
      this.step = 'winLost';
    }

    /** 结算：名次 / 升级 / 双下 / 进贡 / 抗贡 */
    settle() {
      // 未出完者名次为 4
      this.seats.forEach(function (s) { if (s.hand.length > 0 && s.rank === 0) s.rank = 4; });

      const t1 = this.seats[0].rank + this.seats[2].rank;
      const t2 = this.seats[1].rank + this.seats[3].rank;
      // 胜方 = 头游所在队（避免 1+4 与 2+3 名次和相同的平局误判）
      const firstSeat = this.seats.find(function (s) { return s.rank === 1; });
      const winnerTeam = firstSeat ? firstSeat.team : (t1 < t2 ? 1 : 2);
      const doubleDown = (t1 === 3 || t2 === 3); // 某队包揽 1、2 名
      const winnerSum = winnerTeam === 1 ? t1 : t2;
      const mateRank = winnerSum - 1;            // 队友名次
      const upLevel = Math.max(1, 5 - mateRank); // 1+2→3 级，1+3→2 级，1+4→1 级

      const before = winnerTeam === 1 ? this.levelTeam1 : this.levelTeam2;
      if (winnerTeam === 1) this.levelTeam1 = GameTable.nextLevel(this.levelTeam1, upLevel);
      else this.levelTeam2 = GameTable.nextLevel(this.levelTeam2, upLevel);

      const first = this.seats.find(function (s) { return s.rank === 1; });
      const last = this.seats.find(function (s) { return s.rank === 4; });
      const tributes = [];
      if (first && last && first !== last) {
        tributes.push({ fromSeat: last.index, toSeat: first.index });
      }
      if (doubleDown) {
        const second = this.seats.find(function (s) { return s.rank === 2; });
        const third = this.seats.find(function (s) { return s.rank === 3; });
        if (second && third) tributes.push({ fromSeat: third.index, toSeat: second.index });
      }

      // 抗贡：双下且进贡方持有双大王
      const resisted = doubleDown && tributes.some(function (t) {
        return this.seats[t.fromSeat].hand.filter(function (c) { return c === C.BJ; }).length >= 2;
      }, this);

      const res = {
        winnerTeam, upLevel, doubleDown, tributes, resisted,
        levelBefore: before,
        levelAfter: winnerTeam === 1 ? this.levelTeam1 : this.levelTeam2,
        ranks: this.seats.map(function (s) { return s.rank; })
      };
      this.step = resisted ? 'endGame' : 'contribute';
      return res;
    }

    /** 升级（2..A，过 A 返回 15 表示通关） */
    static nextLevel(level, up) {
      const n = level + up;
      return n > 14 ? 15 : n;
    }

    /** 自动选贡：手中最大的非王、非配牌 */
    autoTributeCard(seat) {
      const level = this.levelOf(seat);
      const list = this.seats[seat].hand.filter(function (c) {
        return !C.isJoker(c) && !R.isWild(c, level);
      });
      if (list.length === 0) return 0;
      list.sort(function (a, b) { return C.weight(b, level) - C.weight(a, level); });
      return list[0];
    }

    /** 还贡：给出手中最小的非王、非配牌 */
    autoReturnCard(seat) {
      const level = this.levelOf(seat);
      const list = this.seats[seat].hand.filter(function (c) {
        return !C.isJoker(c) && !R.isWild(c, level);
      });
      if (list.length === 0) return 0;
      list.sort(function (a, b) { return C.weight(a, level) - C.weight(b, level); });
      return list[0];
    }

    /** 执行进贡 + 还贡，返回过程描述 */
    doTribute(tributes) {
      const logs = [];
      for (let i = 0; i < tributes.length; i++) {
        const t = tributes[i];
        const card = this.autoTributeCard(t.fromSeat);
        if (!card) continue;
        const from = this.seats[t.fromSeat], to = this.seats[t.toSeat];
        from.hand.splice(from.hand.indexOf(card), 1);
        to.hand.push(card);

        const back = this.autoReturnCard(t.toSeat);
        if (back) {
          to.hand.splice(to.hand.indexOf(back), 1);
          from.hand.push(back);
        }
        logs.push({
          fromSeat: t.fromSeat, toSeat: t.toSeat,
          card, back
        });
      }
      // 重新按当前级数整理手牌
      for (let s = 0; s < PLAYER_COUNT; s++) {
        this.seats[s].hand = C.sortDesc(this.seats[s].hand, this.levelOf(s));
      }
      return logs;
    }
  }

  root.GameTable = GameTable;
})(typeof window !== 'undefined' ? window : globalThis);

export default GameTable;

/* ===========================================================
 * 出牌提示：在手中找出所有能压过上家的牌组
 * 移植自 server/Guandan.Core/HintFinder.cs
 * 改进：配牌分配使用统一分配器，避免同一张配牌被重复使用
 * =========================================================== */
import CardLib from './card.js';
import Rule from './rule.js';

(function (root) {
  'use strict';

  const C = CardLib;
  const R = Rule;

  function seqOf(start, len) {
    const seq = [];
    if (start === 1) {
      seq.push(14); // A 作低位：A,2,3,...
      for (let k = 1; k < len; k++) seq.push(k + 1);
    } else {
      for (let k = 0; k < len; k++) seq.push(start + k);
    }
    return seq;
  }

  /** 配牌分配器：按序取用，保证同一张配牌不被两组重复使用 */
  function takeN(bucket, need, wild, used) {
    const take = bucket.slice(0, Math.min(need, bucket.length));
    let lack = need - take.length;
    while (lack > 0 && used.n < wild.length) {
      take.push(wild[used.n++]);
      lack--;
    }
    return lack === 0 ? take : null;
  }

  /** 连续序列：len 组，每组 need 张，配牌自动补位 */
  function sequences(byNum, wild, len, need, maxStart) {
    const out = [];
    for (let s = 1; s <= maxStart; s++) {
      const seq = seqOf(s, len);
      let needWild = 0, ok = true;
      for (let i = 0; i < seq.length; i++) {
        const have = (byNum[seq[i]] || []).length;
        if (have > need) { ok = false; break; }
        needWild += need - have;
      }
      if (!ok || needWild > wild.length) continue;

      const cards = [];
      for (let i = 0; i < seq.length; i++) {
        const list = byNum[seq[i]] || [];
        for (let j = 0; j < list.length; j++) cards.push(list[j]);
      }
      for (let i = 0; i < needWild; i++) cards.push(wild[i]);
      out.push(cards);
    }
    return out;
  }

  /** 同花顺候选（配牌可充当该花色） */
  function straightFlushes(normal, wild) {
    const out = [];
    const bySuit = {};
    normal.filter(function (c) { return !C.isJoker(c); }).forEach(function (c) {
      const s = C.suitOf(c);
      (bySuit[s] = bySuit[s] || []).push(c);
    });
    Object.keys(bySuit).forEach(function (s) {
      const byNum = {};
      bySuit[s].forEach(function (c) {
        const n = C.num(c);
        (byNum[n] = byNum[n] || []).push(c);
      });
      for (let st = 1; st <= 10; st++) {
        const seq = seqOf(st, 5);
        let needWild = 0, ok = true;
        for (let i = 0; i < 5; i++) {
          const have = (byNum[seq[i]] || []).length;
          if (have > 1) { ok = false; break; }
          needWild += 1 - have;
        }
        if (!ok || needWild > wild.length) continue;
        const cards = [];
        for (let i = 0; i < 5; i++) if (byNum[seq[i]]) cards.push(byNum[seq[i]][0]);
        for (let i = 0; i < needWild && i < wild.length; i++) cards.push(wild[i]);
        if (cards.length === 5) out.push(cards);
      }
    });
    return out;
  }

  /**
   * 枚举可行出牌方案，按牌型权重从小到大排序（便于"提示"逐条展示）
   * @param hand 手牌数组
   * @param pre  待压的牌型（null = 自由出牌）
   * @param level 本方级数
   */
  function find(hand, pre, level) {
    const result = [];
    const seen = {};
    const wild = hand.filter(function (c) { return R.isWild(c, level); });
    const normal = hand.filter(function (c) { return !R.isWild(c, level); });

    const byNum = {};
    normal.forEach(function (c) {
      const n = C.num(c);
      (byNum[n] = byNum[n] || []).push(c);
    });
    const nums = Object.keys(byNum).map(Number).sort(function (a, b) { return a - b; });

    function add(cards) {
      if (!cards || cards.length === 0) return;
      const p = R.parse(cards, level);
      if (!p) return;
      if (pre && !R.canBeat(p, pre, level)) return;
      const key = cards.slice().sort(function (a, b) { return a - b; }).join(',');
      if (seen[key]) return;
      seen[key] = 1;
      result.push(p);
    }

    const used = { n: 0 };

    // 单张
    nums.forEach(function (n) { add([byNum[n][0]]); });
    normal.forEach(function (c) { if (C.isJoker(c)) add([c]); });  // 大小王
    wild.forEach(function (w) { add([w]); });

    // 对子 / 三张
    nums.forEach(function (n) {
      if (n >= 15) return;
      used.n = 0;
      const pair = takeN(byNum[n], 2, wild, used);
      if (pair) add(pair);
      used.n = 0;
      const tri = takeN(byNum[n], 3, wild, used);
      if (tri) add(tri);
    });

    // 三带二
    nums.forEach(function (n) {
      if (n >= 15) return;
      used.n = 0;
      const t = takeN(byNum[n], 3, wild, used);
      if (!t) return;
      nums.forEach(function (p) {
        if (p === n || p >= 15) return;
        const backup = used.n;
        const pair = takeN(byNum[p], 2, wild, used);
        if (pair) add(t.concat(pair));
        used.n = backup;
      });
    });

    // 顺子 / 钢板 / 三连对
    sequences(byNum, wild, 5, 1, 10).forEach(add);
    sequences(byNum, wild, 2, 3, 13).forEach(add);
    sequences(byNum, wild, 3, 2, 12).forEach(add);

    // 同花顺
    straightFlushes(normal, wild).forEach(add);

    // 炸弹（4~10 张同点）
    nums.forEach(function (n) {
      if (n >= 15) return;
      const maxSize = Math.min(byNum[n].length + wild.length, 10);
      for (let size = 4; size <= maxSize; size++) {
        used.n = 0;
        const b = takeN(byNum[n], size, wild, used);
        if (b) add(b);
      }
    });

    // 四大天王
    const sj = byNum[15] || [], bj = byNum[16] || [];
    if (sj.length === 2 && bj.length === 2) add([sj[0], sj[1], bj[0], bj[1]]);

    result.sort(function (a, b) {
      if (a.typeWeight !== b.typeWeight) return a.typeWeight - b.typeWeight;
      return a.power - b.power;
    });
    return result;
  }

  const HintFinder = { find };
  root.HintFinder = HintFinder;
})(typeof window !== 'undefined' ? window : globalThis);

export default HintFinder;

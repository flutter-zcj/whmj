/* ===========================================================
 * 掼蛋牌型识别与大小比较
 * 移植自 server/Guandan.Core/CardPattern.cs
 * 牌型权重常量取自逆向 InitGDCard.lua
 * =========================================================== */
import CardLib from './card.js';

(function (root) {
  'use strict';

  const C = CardLib;

  /** 牌型（常量值与逆向一致） */
  const CT = {
    NONE: 0,
    SINGLE: 1,
    PAIR: 2,
    TRIPLE: 3,
    BOMB4: 4, BOMB5: 5, BOMB6: 6, BOMB7: 7, BOMB8: 8, BOMB9: 9, BOMB10: 10,
    THREE_WITH_PAIR: 101, // 三带二
    STEEL_PLATE: 102,     // 钢板（两个连续三张）
    TRIPLE_PAIRS: 103,    // 三连对
    STRAIGHT: 104,        // 顺子（5 张）
    STRAIGHT_FLUSH: 105,  // 同花顺（5 张）
    FOUR_KINGS: 106       // 四大天王
  };

  /** 炸弹门槛：牌型权重 > 109 即为炸弹级 */
  const BOMB_LEVEL = 109;
  const HAND_CARDS = 27;
  const PLAYER_COUNT = 4;
  const DECK_SIZE = 108;

  /** 牌型权重（越大越强） */
  function typeWeightOf(id) {
    switch (id) {
      case CT.SINGLE: return 1;
      case CT.PAIR: return 2;
      case CT.TRIPLE: return 3;
      case CT.THREE_WITH_PAIR: return 30;
      case CT.STEEL_PLATE: return 40;
      case CT.TRIPLE_PAIRS: return 10;
      case CT.STRAIGHT: return 11;
      case CT.BOMB4: return 110;
      case CT.BOMB5: return 120;
      case CT.STRAIGHT_FLUSH: return 130;
      case CT.BOMB6: return 140;
      case CT.BOMB7: return 150;
      case CT.BOMB8: return 160;
      case CT.BOMB9: return 170;
      case CT.BOMB10: return 180;
      case CT.FOUR_KINGS: return 190;
      default: return 0;
    }
  }

  const TYPE_CN = {
    1: '单张', 2: '对子', 3: '三张',
    101: '三带二', 102: '钢板', 103: '三连对',
    104: '顺子', 105: '同花顺', 106: '四大天王'
  };

  function nameOf(p) {
    if (TYPE_CN[p.id]) return TYPE_CN[p.id];
    if (p.typeWeight >= 110) return p.cards.length + '炸';
    return '?';
  }

  /** 当前级的红桃级牌（逢人配 / 百搭） */
  function levelHeartCard(level) {
    return level === 14 ? 27 : 27 + level - 1;
  }

  function isWild(card, level) {
    return card === levelHeartCard(level);
  }

  function mk(id, count, len, power, cards) {
    const p = { id, count, len, power, cards: cards.slice() };
    p.typeWeight = typeWeightOf(id);
    p.isBomb = p.typeWeight > BOMB_LEVEL;
    p.name = nameOf(p);
    return p;
  }

  /**
   * 牌组解析：返回最优（权重最大）牌型，null 表示非法
   * 支持逢人配（红桃级牌可替代任意非王牌）
   */
  function parse(cards, level) {
    const list = cards.slice();
    if (list.length === 0) return null;

    const wild = list.filter(function (c) { return isWild(c, level); });
    const normal = list.filter(function (c) { return !isWild(c, level); });

    // 全部由配牌组成：按张数判定
    if (normal.length === 0) {
      const ids = { 1: CT.SINGLE, 2: CT.PAIR, 3: CT.TRIPLE, 4: CT.BOMB4, 5: CT.BOMB5, 6: CT.BOMB6, 7: CT.BOMB7, 8: CT.BOMB8 };
      const id = ids[list.length] || CT.BOMB10;
      return mk(id, list.length, 1, C.numWeight(level, level), list);
    }

    const smallJ = normal.filter(function (c) { return c === C.SJ; }).length;
    const bigJ = normal.filter(function (c) { return c === C.BJ; }).length;

    // 四大天王
    if (list.length === 4 && wild.length === 0 && smallJ === 2 && bigJ === 2) {
      return mk(CT.FOUR_KINGS, 2, 2, 22, list);
    }

    const cnt = {};
    for (let i = 0; i < normal.length; i++) {
      if (C.isJoker(normal[i])) continue;
      const n = C.num(normal[i]);
      cnt[n] = (cnt[n] || 0) + 1;
    }

    let best = null;
    function consider(p) {
      if (!p) return;
      if (!best || p.typeWeight > best.typeWeight ||
        (p.typeWeight === best.typeWeight && p.power > best.power)) best = p;
    }

    consider(tryStraightFlush(normal, wild, level, list));
    consider(trySequence(normal, wild, level, list, 5, 1, CT.STRAIGHT));
    consider(trySequence(normal, wild, level, list, 2, 3, CT.STEEL_PLATE));
    consider(trySequence(normal, wild, level, list, 3, 2, CT.TRIPLE_PAIRS));
    consider(tryBomb(cnt, wild, level, list));
    consider(tryThreeWithPair(cnt, wild, level, list));
    consider(trySameNum(cnt, wild, level, list, 3, CT.TRIPLE));
    consider(trySameNum(cnt, wild, level, list, 2, CT.PAIR));
    consider(trySameNum(cnt, wild, level, list, 1, CT.SINGLE));

    return best;
  }

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

  function maxStartOf(id) {
    if (id === CT.STRAIGHT) return 10;      // 最大 10 J Q K A
    if (id === CT.STEEL_PLATE) return 13;   // 最大 KKK AAA
    if (id === CT.TRIPLE_PAIRS) return 12;  // 最大 QQ KK AA
    return 10;
  }

  /** 顺子类：连续 len 组，每组 need 张 */
  function trySequence(normal, wild, level, all, len, need, id) {
    if (all.length !== len * need) return null;

    const cnt = {};
    for (let i = 0; i < normal.length; i++) {
      if (C.isJoker(normal[i])) continue;
      const n = C.num(normal[i]);
      cnt[n] = (cnt[n] || 0) + 1;
    }

    const maxStart = maxStartOf(id);
    for (let s = 1; s <= maxStart; s++) {
      const seq = seqOf(s, len);
      let needWild = 0, ok = true;
      for (let i = 0; i < seq.length; i++) {
        const have = cnt[seq[i]] || 0;
        if (have > need) { ok = false; break; }
        needWild += need - have;
      }
      if (!ok || needWild > wild.length) continue;
      const power = C.numWeight(seq[seq.length - 1], level);
      return mk(id, need, len, power, all);
    }
    return null;
  }

  /** 同花顺（5 张同花色连续）—— 优先于五炸 */
  function tryStraightFlush(normal, wild, level, all) {
    if (all.length !== 5) return null;

    const bySuit = {};
    for (let i = 0; i < normal.length; i++) {
      if (C.isJoker(normal[i])) continue;
      const s = C.suitOf(normal[i]);
      (bySuit[s] = bySuit[s] || []).push(normal[i]);
    }
    let suitKey = null, bestCount = 0;
    Object.keys(bySuit).forEach(function (k) {
      if (bySuit[k].length > bestCount) { bestCount = bySuit[k].length; suitKey = k; }
    });
    if (suitKey === null && wild.length === 0) return null;

    const cnt = {};
    if (suitKey !== null) {
      bySuit[suitKey].forEach(function (c) {
        const n = C.num(c);
        cnt[n] = (cnt[n] || 0) + 1;
      });
    }

    for (let s = 1; s <= 10; s++) {
      const seq = seqOf(s, 5);
      let needWild = 0, ok = true;
      for (let i = 0; i < 5; i++) {
        const have = cnt[seq[i]] || 0;
        if (have > 1) { ok = false; break; }
        needWild += 1 - have;
      }
      if (!ok || needWild > wild.length) continue;
      const power = C.numWeight(seq[4], level);
      return mk(CT.STRAIGHT_FLUSH, 1, 5, power, all);
    }
    return null;
  }

  /** 炸弹：4~10 张同点，配牌可补 */
  function tryBomb(cnt, wild, level, all) {
    let bestNum = -1, bestTotal = 0;
    Object.keys(cnt).forEach(function (k) {
      const n = parseInt(k, 10);
      const total = cnt[k] + wild.length;
      if (total !== all.length) return; // 炸弹必须耗尽全部牌
      if (total < 4 || total > 10) return;
      if (total > bestTotal ||
        (total === bestTotal && C.numWeight(n, level) > C.numWeight(bestNum, level))) {
        bestTotal = total; bestNum = n;
      }
    });
    if (bestTotal < 4) return null;

    const ids = { 4: CT.BOMB4, 5: CT.BOMB5, 6: CT.BOMB6, 7: CT.BOMB7, 8: CT.BOMB8, 9: CT.BOMB9 };
    const id = ids[bestTotal] || CT.BOMB10;
    return mk(id, bestTotal, 1, C.numWeight(bestNum, level), all);
  }

  function tryThreeWithPair(cnt, wild, level, all) {
    if (all.length !== 5) return null;
    const keys = Object.keys(cnt).map(function (k) { return parseInt(k, 10); })
      .filter(function (n) { return cnt[n] + wild.length >= 3; })
      .sort(function (a, b) { return C.numWeight(b, level) - C.numWeight(a, level); });

    for (let i = 0; i < keys.length; i++) {
      const triple = keys[i];
      const usedWild = Math.max(0, 3 - cnt[triple]);
      const leftWild = wild.length - usedWild;
      const pairs = Object.keys(cnt).map(function (k) { return parseInt(k, 10); })
        .filter(function (n) { return n !== triple && cnt[n] + leftWild >= 2; })
        .sort(function (a, b) { return C.numWeight(b, level) - C.numWeight(a, level); });
      if (pairs.length > 0) {
        return mk(CT.THREE_WITH_PAIR, 3, 1, C.numWeight(triple, level), all);
      }
    }
    return null;
  }

  function trySameNum(cnt, wild, level, all, need, id) {
    if (all.length !== need) return null;
    const keys = Object.keys(cnt).map(function (k) { return parseInt(k, 10); })
      .filter(function (n) { return cnt[n] + wild.length === need; })
      .sort(function (a, b) { return C.numWeight(b, level) - C.numWeight(a, level); });
    if (keys.length > 0) {
      return mk(id, need, 1, C.numWeight(keys[0], level), all);
    }
    // 王作单张 / 双王作对子
    if (wild.length === 0 && need === 1 && all.length === 1 && C.isJoker(all[0])) {
      return mk(CT.SINGLE, 1, 1, C.weight(all[0], level), all);
    }
    if (wild.length === 0 && need === 2 && all.length === 2 && C.isJoker(all[0]) && all[0] === all[1]) {
      return mk(CT.PAIR, 2, 1, C.weight(all[0], level), all);
    }
    return null;
  }

  /**
   * 是否能压过上家（严格遵循逆向 LuaRunRule.canOut 的判定顺序）
   */
  function canBeat(outP, pre, level) {
    if (!outP) return false;
    if (!pre || pre.id === CT.NONE) return outP.id !== CT.NONE;
    if (outP.id === CT.NONE) return false;

    const ow = outP.typeWeight, pw = pre.typeWeight;

    if (ow > BOMB_LEVEL) {
      if (pw < BOMB_LEVEL) return true;
      if (ow > pw) return true;
      if (ow === pw) {
        if (outP.len > pre.len) return true;
        if (outP.len === pre.len) {
          if (outP.count > pre.count) return true;
          if (outP.count === pre.count) return outP.power > pre.power;
        }
      }
      return false;
    }

    if (outP.cards.length !== pre.cards.length) return false;
    if (ow === pw && outP.len === pre.len && outP.count === pre.count) {
      return outP.power > pre.power;
    }
    return false;
  }

  function patternText(p) {
    if (!p) return '';
    return p.name + '[' + p.cards.map(C.name).join(' ') + ']';
  }

  const Rule = {
    CT, BOMB_LEVEL, HAND_CARDS, PLAYER_COUNT, DECK_SIZE,
    typeWeightOf, levelHeartCard, isWild, parse, canBeat, patternText
  };

  root.Rule = Rule;
})(typeof window !== 'undefined' ? window : globalThis);

export default Rule;

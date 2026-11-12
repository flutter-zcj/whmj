/* ===========================================================
 * 掼蛋 AI 出牌策略（单机 Demo 用）
 * 策略要点：
 *   1. 队友压过的牌不压（不挡对家）
 *   2. 能一次走完手牌 → 立即出
 *   3. 跟牌优先最小可压牌型，保留炸弹
 *   4. 对手手牌 ≤5 张时，可用炸弹拦截
 *   5. 自由出牌优先出多张组合（顺子/三带二/钢板/三连对），减少手牌
 * =========================================================== */
import CardLib from './card.js';
import Rule from './rule.js';
import HintFinder from './hint.js';

(function (root) {
  'use strict';

  const C = CardLib;
  const R = Rule;
  const HF = HintFinder;

  /** 返回要出的牌数组；空数组 = 过牌 */
  function choose(table, seat) {
    const level = table.levelOf(seat);
    const hand = table.seats[seat].hand;
    const pre = table.lastPattern;
    const lastSeat = table.lastPlaySeat;
    const myTeam = table.seats[seat].team;

    if (hand.length === 0) return [];

    // 1. 自由出牌轮（无人压 / 自己压过一圈）不能过牌，必须出
    const freeTurn = (lastSeat === -1 || lastSeat === seat);
    // 2. 队友压过 → 不压（不挡对家）
    if (!freeTurn && pre && lastSeat >= 0 && table.seats[lastSeat].team === myTeam) return [];

    const hints = HF.find(hand, pre, level);
    if (hints.length === 0) return [];

    // 2. 能一次走完 → 出
    for (let i = 0; i < hints.length; i++) {
      if (hints[i].cards.length === hand.length) return hints[i].cards;
    }

    const bombs = hints.filter(function (p) { return p.isBomb; });
    const plain = hints.filter(function (p) { return !p.isBomb; });

    if (pre) {
      // 3. 跟牌：优先最小可压牌型
      const oppLeft = lastSeat >= 0 ? table.seats[lastSeat].hand.length : 27;
      // 对手快走完 → 炸弹拦截
      if (oppLeft <= 5 && bombs.length > 0) return bombs[0].cards;
      if (plain.length > 0) {
        // 手上只剩 ≤2 组时可以更激进，这里取最小
        return plain[0].cards;
      }
      // 只剩炸弹能压：对手剩牌不多才炸
      if (bombs.length > 0 && oppLeft <= 8) return bombs[0].cards;
      return [];
    }

    // 5. 自由出牌：优先多张组合，其次对子/三张，最后单张
    const multi = plain.filter(function (p) { return p.cards.length >= 5; });
    if (multi.length > 0) return multi[0].cards;
    const pair = plain.filter(function (p) { return p.cards.length >= 2; });
    if (pair.length > 0) return pair[0].cards;
    if (plain.length > 0) return plain[0].cards;
    return hints[0].cards;
  }

  root.GuandanAI = { choose };
})(typeof window !== 'undefined' ? window : globalThis);

export default GuandanAI;

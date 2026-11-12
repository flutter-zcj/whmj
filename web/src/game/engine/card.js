/* ===========================================================
 * 掼蛋牌编码与工具
 * 与 server/Guandan.Core/Card.cs 完全对齐
 *
 * 编码：方块 A,2..K = 1..13 ；梅花 14..26 ；红桃 27..39
 *       黑桃 40..52 ；小王 53 ；大王 54
 * 点数空间：A=14, 2..13=2..13, 小王=15, 大王=16
 * =========================================================== */
(function (root) {
  'use strict';

  const SJ = 53; // 小王
  const BJ = 54; // 大王

  const SUIT = { DIAMOND: 1, CLUB: 2, HEART: 3, SPADE: 4, JOKER: 5 };
  const SUIT_SYMBOL = { 1: '♦', 2: '♣', 3: '♥', 4: '♠', 5: '' };
  const SUIT_CN = { 1: '方块', 2: '梅花', 3: '红桃', 4: '黑桃', 5: '王' };

  /** 点数空间取值：A=14, 2..13, 小王=15, 大王=16 */
  function num(card) {
    if (card >= SJ) return card === SJ ? 15 : 16;
    const n = (card - 1) % 13 + 1;
    return n === 1 ? 14 : n;
  }

  function suitOf(card) {
    if (card >= SJ) return SUIT.JOKER;
    return Math.floor((card - 1) / 13) + 1;
  }

  function isJoker(card) {
    return card >= SJ;
  }

  /** 点数权重：2..14 < 级牌(20) < 小王(21) < 大王(22) */
  function numWeight(n, level) {
    if (n === 15) return 21; // 小王
    if (n === 16) return 22; // 大王
    if (n === level) return 20; // 级牌（主牌）
    return n;
  }

  /** 按牌编码取权重 */
  function weight(card, level) {
    return numWeight(num(card), level);
  }

  function rankName(n) {
    switch (n) {
      case 14: return 'A';
      case 13: return 'K';
      case 12: return 'Q';
      case 11: return 'J';
      case 15: return 'w';
      case 16: return 'W';
      default: return String(n);
    }
  }

  function name(card) {
    if (card >= SJ) return card === SJ ? '小王' : '大王';
    return SUIT_SYMBOL[suitOf(card)] + rankName(num(card));
  }

  /** 两副牌 108 张 */
  function newDeck() {
    const deck = [];
    for (let s = 0; s < 2; s++) {
      for (let c = 1; c <= 54; c++) deck.push(c);
    }
    return deck;
  }

  /** 手牌排序：权重降序（大牌在前），同权重按花色、再按编码 */
  function sortDesc(cards, level) {
    return cards.slice().sort(function (a, b) {
      const wa = weight(a, level), wb = weight(b, level);
      if (wb !== wa) return wb - wa;
      const sa = suitOf(a), sb = suitOf(b);
      if (sa !== sb) return sa - sb;
      return a - b;
    });
  }

  const CardLib = {
    SJ, BJ, SUIT, SUIT_SYMBOL, SUIT_CN,
    num, suitOf, isJoker, numWeight, weight, rankName, name, newDeck, sortDesc
  };

  root.CardLib = CardLib;
})(typeof window !== 'undefined' ? window : globalThis);

export default CardLib;

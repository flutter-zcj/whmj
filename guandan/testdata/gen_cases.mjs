/* 生成规则引擎对拍用例：node gen_cases.mjs > cases.json */
import CardLib from '/workspace/guandan-uni/server/game/engine/card.js';
import Rule from '/workspace/guandan-uni/server/game/engine/rule.js';
import HintFinder from '/workspace/guandan-uni/server/game/engine/hint.js';

function rnd(n) { return Math.floor(Math.random() * n); }
function pick(arr, n) { const out = []; for (let i = 0; i < n; i++) out.push(arr[rnd(arr.length)]); return out; }

const DECK = CardLib.newDeck();
const cases = { parse: [], hint: [] };

// 1) parse 对拍：随机 1..10 张
for (let i = 0; i < 4000; i++) {
  const level = 2 + rnd(13);                 // 2..14
  const n = 1 + rnd(10);
  const cards = pick(DECK, n);
  const p = Rule.parse(cards, level);
  cases.parse.push({
    cards, level,
    pattern: p ? { id: p.id, count: p.count, len: p.len, power: p.power, typeWeight: p.typeWeight, isBomb: p.isBomb, name: p.name } : null
  });
}

// 2) hint 对拍：随机 27 张手牌 + 可选 pre
for (let i = 0; i < 400; i++) {
  const level = 2 + rnd(13);
  const hand = CardLib.sortDesc(pick(DECK, 27), level);
  let pre = null;
  if (i % 3 === 0) {
    // 用一小组牌构造上家牌型
    const n = 1 + rnd(5);
    const other = pick(DECK, n);
    pre = Rule.parse(other, level);
  }
  const hints = HintFinder.find(hand, pre, level);
  cases.hint.push({
    hand, level,
    pre: pre ? { cards: pre.cards.slice(), id: pre.id, count: pre.count, len: pre.len, power: pre.power, typeWeight: pre.typeWeight } : null,
    hints: hints.map((p) => ({
      cards: p.cards.slice().sort((a, b) => a - b),
      id: p.id, count: p.count, len: p.len, power: p.power, typeWeight: p.typeWeight
    }))
  });
}

process.stdout.write(JSON.stringify(cases));

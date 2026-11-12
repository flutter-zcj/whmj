/* 生成整局对拍用例：同 seed 下 4 个 AI 互打 3 局，输出名次/级牌/进贡
 * 用于校验 Go 版 table+ai+hint 的组合行为与 JS 引擎完全一致
 */
import GameTable from '/workspace/guandan-uni/server/game/engine/table.js';
import AI from '/workspace/guandan-uni/server/game/engine/ai.js';

const seeds = [12345, 777, 20260101, 424242, 999983, 314159, 2718281, 8675309];
const out = [];

for (const seed of seeds) {
  const t = new GameTable(seed);
  const rounds = [];
  t.deal();
  for (let r = 0; r < 3; r++) {
    let guard = 0;
    while (t.step === 'play' && guard++ < 5000) {
      const seat = t.currentSeat;
      const cards = AI.choose(t, seat) || [];
      if (!t.play(seat, cards)) {
        if (!t.play(seat, [])) {
          rounds.push({ error: 'stuck', seat, cards, step: t.step });
          break;
        }
      }
    }
    const res = t.settle();
    rounds.push({
      step: t.step,
      ranks: t.seats.map((s) => s.rank),
      levels: [t.levelOf(0), t.levelOf(1)],
      winnerTeam: res.winnerTeam,
      upLevel: res.upLevel,
      doubleDown: res.doubleDown,
      resisted: res.resisted,
      tributes: res.tributes.map((x) => [x.fromSeat, x.toSeat]),
    });
    if (t.step === 'contribute') t.doTribute(res.tributes);
    if (r < 2) t.deal();
  }
  out.push({ seed, rounds, finalLevels: [t.levelOf(0), t.levelOf(1)] });
}

process.stdout.write(JSON.stringify(out));

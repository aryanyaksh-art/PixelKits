// Headless battle simulator: stress-tests the battle engine and reports balance numbers.
// Usage: node tools/sim.mjs [battles]
import { loadGame } from './load.mjs';
const PK = loadGame();
const N = +(process.argv[2] || 3000);
const ids = Object.keys(PK.KITS).map(Number);
let turnsTotal = 0, errors = 0, long = 0;
const wins = {};

function fight(a, b, ai = 2) {
  const bt = new PK.Battle({ wild: false, playerParty: [a], enemyParty: [b], ai });
  let t = 0;
  while (!bt.over && a.hp > 0 && b.hp > 0 && t < 200) {
    const pa = bt.chooseAIFor ? null : null;
    // player side uses the same AI by swapping sides temporarily
    const sw = [bt.p, bt.e]; bt.p = sw[1]; bt.e = sw[0];
    const pAct = bt.chooseAI();
    bt.p = sw[0]; bt.e = sw[1];
    const eAct = bt.chooseAI();
    bt.runTurn(pAct.type === 'item' ? { type: 'move', idx: 0 } : pAct, eAct);
    t++;
  }
  return { t, winner: a.hp > 0 && b.hp <= 0 ? 'a' : b.hp > 0 && a.hp <= 0 ? 'b' : 'draw' };
}

for (let i = 0; i < N; i++) {
  const L = 5 + Math.floor(Math.random() * 60);
  const ia = PK.pick(ids), ib = PK.pick(ids);
  const a = PK.stats.create(ia, L), b = PK.stats.create(ib, L);
  try {
    const r = fight(a, b);
    turnsTotal += r.t;
    if (r.t >= 200) long++;
    const w = r.winner === 'a' ? ia : r.winner === 'b' ? ib : 0;
    if (w) wins[w] = (wins[w] || 0) + 1;
  } catch (e) {
    errors++;
    if (errors < 5) console.error(e);
  }
}
// level-up / evolution sanity
for (const id of ids) {
  const k = PK.stats.create(id, 5);
  for (let L = 6; L <= 100; L++) PK.stats.setLevel(k, L);
  if (k.moves.length < 1 || k.moves.length > 4) { console.error('bad moves', id); errors++; }
  if (k.stats.some(v => !(v > 0))) { console.error('bad stats', id, k.stats); errors++; }
}
const ranked = Object.entries(wins).sort((a, b) => b[1] - a[1]);
console.log(`battles: ${N}  avg turns: ${(turnsTotal / N).toFixed(1)}  stalemates: ${long}  errors: ${errors}`);
console.log('most wins:', ranked.slice(0, 5).map(([id, w]) => PK.KITS[id].name + ' ' + w).join(', '));
console.log('fewest wins:', ranked.slice(-5).map(([id, w]) => PK.KITS[id].name + ' ' + w).join(', '));
if (errors) process.exit(1);

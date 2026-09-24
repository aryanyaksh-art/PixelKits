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
    const pAct = bt.chooseFor(bt.p.slots[0], 2, false);
    const eAct = bt.chooseAI();
    bt.runTurn(pAct, eAct);
    t++;
  }
  return { t, winner: a.hp > 0 && b.hp <= 0 ? 'a' : b.hp > 0 && a.hp <= 0 ? 'b' : 'draw' };
}

// double battles: 3 vs 3, two active per side, replacing fainted Kits from the bench
function doubleFight(pa, pb) {
  const bt = new PK.Battle({ wild: false, double: true, playerParty: pa, enemyParty: pb, ai: 2 });
  let t = 0;
  while (bt.p.alive() && bt.e.alive() && t < 300) {
    const pActs = bt.p.slots.map(s => s.alive() ? bt.chooseFor(s, 2, false) : null);
    const eActs = bt.chooseAI();
    bt.runTurn(pActs, eActs);
    for (const side of [bt.p, bt.e]) for (const s of side.slots) {
      if (s.alive()) continue;
      const bench = side.bench();
      if (bench.length) bt.sendIn(s, side === bt.e ? bt.nextEnemy() : bench[0]);
    }
    t++;
  }
  return t;
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
let dblTurns = 0;
for (let i = 0; i < Math.floor(N / 5); i++) {
  const L = 10 + Math.floor(Math.random() * 50);
  const mk = () => [0, 1, 2].map(() => PK.stats.create(PK.pick(ids), L));
  try { const t = doubleFight(mk(), mk()); dblTurns += t; if (t >= 300) long++; }
  catch (e) { errors++; if (errors < 5) console.error(e); }
}
console.log(`double battles: ${Math.floor(N / 5)}  avg turns: ${(dblTurns / Math.max(1, Math.floor(N / 5))).toFixed(1)}`);
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

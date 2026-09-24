// Progression balance check: a typical player team vs each boss, both sides using the smart AI.
// Usage: node tools/balance.mjs [runs]
import { loadGame } from './load.mjs';
const PK = loadGame();
const RUNS = +(process.argv[2] || 200);

// [boss, player level, player team (species)] - team grows through the game
const plan = [
  ['warden1', 12, [4, 10]],
  ['warden2', 17, [5, 11, 21]],
  ['warden3', 22, [5, 11, 22, 17]],
  ['warden4', 27, [5, 11, 22, 18, 49]],
  ['warden5', 32, [5, 11, 22, 18, 49, 28]],
  ['warden6', 37, [6, 11, 22, 18, 49, 28]],
  ['director', 41, [6, 11, 22, 18, 49, 28]],
  ['warden7', 44, [6, 11, 22, 18, 49, 67]],
  ['warden8', 48, [6, 11, 22, 18, 49, 67]],
  ['council1', 53, [6, 11, 22, 18, 49, 67]],
  ['council4', 56, [6, 11, 22, 18, 49, 67]],
  ['champion', 58, [6, 11, 22, 18, 49, 67]]
];

function battle(pTeam, eTeam, ai) {
  const b = new PK.Battle({ wild: false, playerParty: pTeam, enemyParty: eTeam, ai, enemyItems: 2 });
  for (let t = 0; t < 300; t++) {
    // player: smart AI from its own perspective
    const sw = [b.p, b.e]; b.p = sw[1]; b.e = sw[0];
    const saveAi = b.ai; b.ai = 2; const items = b.enemyItems; b.enemyItems = 0;
    let pa = b.chooseAI();
    b.ai = saveAi; b.enemyItems = items;
    b.p = sw[0]; b.e = sw[1];
    const ea = b.chooseAI();
    b.runTurn(pa, ea);
    if (b.e.kit().hp <= 0) { if (b.e.alive() === 0) return true; b.e.idx = b.nextEnemy(); b.e.reset(); }
    if (b.p.kit().hp <= 0) { if (b.p.alive() === 0) return false; b.p.idx = b.p.party.findIndex(k => k.hp > 0); b.p.reset(); }
  }
  return false;
}

for (const [boss, lvl, team] of plan) {
  const tr = PK.TRAINERS[boss];
  let wins = 0;
  for (let r = 0; r < RUNS; r++) {
    // rotate the starter line across the three choices (Blaze 4-6, Leaf 1-3, Tide 7-9)
    const shift = [0, -3, 3][r % 3];
    const t2 = team.map((id, i) => i === 0 ? id + shift : id);
    const pTeam = t2.map((id, i) => PK.stats.create(id, lvl + (i === 0 ? 2 : 0), { noPrism: true }));
    const et = typeof tr.team === 'function' ? tr.team({ flags: { starter: 4 } }) : tr.team;
    const eTeam = et.map(e => PK.stats.create(e[0], e[1], { noPrism: true, genes: 12 }));
    if (battle(pTeam, eTeam, tr.ai)) wins++;
  }
  const pct = Math.round(wins / RUNS * 100);
  console.log(`${boss.padEnd(10)} player Lv${lvl} x${team.length}  win rate ${String(pct).padStart(3)}%  ${pct < 45 ? '<-- hard' : pct > 95 ? '<-- easy' : ''}`);
}

// Data integrity checks for PixelKits. Usage: node tools/validate.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { loadGame, ROOT } from './load.mjs';
let errors = 0, warns = 0;
const err = (...a) => { errors++; console.log('ERROR', ...a); };
const warn = (...a) => { warns++; console.log('warn ', ...a); };

// ---- every script referenced by index.html must exist and parse
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const [, src] of html.matchAll(/<script src="([^"]+)"/g)) {
  const f = path.join(ROOT, src);
  if (!fs.existsSync(f)) { err('missing script', src); continue; }
  try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: src }); } catch (e) { err('syntax error in', src, e.message); }
}
const PK = loadGame();

// ---- kits / moves / items
const kitIds = Object.keys(PK.KITS).map(Number);
if (kitIds.length < 100) err('expected at least 100 Kits, got', kitIds.length);
kitIds.forEach((id, i) => { if (+id !== i + 1) err('Kit ids must be consecutive from 1; found', id); });
for (const id of kitIds) {
  const k = PK.KITS[id];
  k.types.forEach(t => { if (!PK.TYPES[t]) err('kit', id, 'bad type', t); });
  if (k.evo && !PK.KITS[k.evo.to]) err('kit', id, 'bad evo target');
  if (k.evo && k.evo.item && !PK.ITEMS[k.evo.item]) err('kit', id, 'bad evo item', k.evo.item);
  k.learn.forEach(([l, m]) => { if (!PK.MOVES[m]) err('kit', id, 'bad move', m); });
  if (!k.learn.some(([l]) => l === 1)) err('kit', id, 'no level-1 move');
}
const used = new Set(); for (const id of kitIds) PK.KITS[id].learn.forEach(e => used.add(e[1]));
for (const id in PK.ITEMS) if (PK.ITEMS[id].use === 'disc') used.add(PK.ITEMS[id].value);
const unusedMoves = Object.keys(PK.MOVES).filter(m => !used.has(m) && m !== 'flailout');
if (unusedMoves.length) warn('moves never learnable:', unusedMoves.join(', '));

// ---- trainers
for (const id in PK.TRAINERS) {
  const t = PK.TRAINERS[id];
  const team = typeof t.team === 'function' ? t.team({ flags: { starter: 1 } }) : t.team;
  team.forEach(e => { if (!PK.KITS[e[0]]) err('trainer', id, 'bad kit', e[0]); });
  if (t.sprite && !PK.CHAR_PALS_NODE && false) err();
}

// ---- maps
let built = 0;
for (const id in PK.MAPS) {
  try { PK.buildMap(PK.MAPS[id]); built++; } catch (e) { err('map', id, e.message); }
}
try { PK.linkMaps(); } catch (e) { err('linkMaps', e.message); }
const walk = (m, x, y) => {
  const c = m.at(x, y);
  if (c == null) return false;
  if (m.solid[y][x] && !m.doors[x + ',' + y]) return false;
  const t = PK.TILE[c];
  if (!t) { err('map', m.id, 'unknown tile', JSON.stringify(c), 'at', x, y); return false; }
  return !t.solid || t.water;
};
for (const id in PK.MAPS) {
  const m = PK.MAPS[id];
  if (!m.built) continue;
  // warps
  for (const k in m.warpDefs) {
    const w = m.warpDefs[k], t = PK.MAPS[w.to];
    if (!t) { err('map', id, 'warp to missing map', w.to); continue; }
    PK.buildMap(t);
    if (!walk(t, w.x, w.y)) err('map', id, 'warp', k, '->', w.to, w.x, w.y, 'lands on blocked tile', JSON.stringify(t.at(w.x, w.y)));
  }
  // count O/X without warp
  m.grid.forEach((r, y) => [...r].forEach((c, x) => { if ((c === 'O' || c === 'X') && !m.warpDefs[x + ',' + y]) err('map', id, 'unlinked', c, 'at', x, y); }));
  // doors
  for (const k in m.doors) {
    const b = m.doors[k];
    if (!b.to) { warn('map', id, 'door without interior at', k); continue; }
    const t = PK.MAPS[b.to];
    if (!t) { err('map', id, 'door to missing map', b.to); continue; }
    if (!t.entry) err('interior', b.to, 'has no entry');
    const [dx, dy] = k.split(',').map(Number);
    if (!walk(m, dx, dy + 1)) err('map', id, 'tile below door', k, 'is blocked');
  }
  // interiors must have exit
  if (m.interior && m.grid.some(r => r.includes('M')) && !m.exit) warn('interior', id, 'has mat but no parent door');
  // edges
  for (const side in (m.edges || {})) {
    const e = m.edges[side], t = PK.MAPS[e.to];
    if (!t) { err('map', id, 'edge', side, 'to missing map', e.to); continue; }
    PK.buildMap(t);
    // check every walkable edge tile maps to a walkable tile in the target
    const tiles = [];
    if (side === 'n') for (let x = 0; x < m.w; x++) tiles.push([x, 0, x + (e.off || 0), t.h - 1]);
    if (side === 's') for (let x = 0; x < m.w; x++) tiles.push([x, m.h - 1, x + (e.off || 0), 0]);
    if (side === 'w') for (let y = 0; y < m.h; y++) tiles.push([0, y, t.w - 1, y + (e.off || 0)]);
    if (side === 'e') for (let y = 0; y < m.h; y++) tiles.push([m.w - 1, y, 0, y + (e.off || 0)]);
    for (const [x, y, tx, ty] of tiles) {
      if (!walk(m, x, y)) continue;
      if (!walk(t, tx, ty)) err('map', id, 'edge', side, 'from', x, y, '->', e.to, tx, ty, 'blocked/out of bounds', JSON.stringify(t.at(tx, ty)));
    }
    // reverse edge exists
    const back = { n: 's', s: 'n', e: 'w', w: 'e' }[side];
    if (!t.edges || !t.edges[back] || t.edges[back].to !== id) warn('map', id, 'edge', side, '-> ', e.to, 'has no reverse edge');
    else if ((t.edges[back].off || 0) !== -(e.off || 0)) err('map', id, 'edge offsets not symmetric with', e.to);
  }
  // npcs / trainers
  m.npcDefs.forEach(n => {
    if (n.keeper && !PK.TRAINERS[n.keeper]) err('map', id, 'npc keeper missing', n.keeper);
    if (typeof n.talk === 'string' && !['clinic', 'shop'].includes(n.talk) && !PK.SCRIPTS[n.talk]) err('map', id, 'npc script missing', n.talk);
    if (n.stock) n.stock.forEach(s => { if (!PK.ITEMS[s]) err('map', id, 'bad stock', s); });
  });
  m.itemDefs.concat(m.hiddenDefs).forEach(it => { if (!PK.ITEMS[it.item]) err('map', id, 'bad item', it.item); });
  m.eventDefs.forEach(ev => { if (typeof ev.run === 'string' && !PK.SCRIPTS[ev.run]) err('map', id, 'event script missing', ev.run); });
  if (typeof m.onEnter === 'string' && !PK.SCRIPTS[m.onEnter]) err('map', id, 'onEnter missing', m.onEnter);
  // encounters
  for (const kind in (m.enc || {})) {
    if (kind === 'rate' || kind === 'cave' && !Array.isArray(m.enc.cave)) continue;
    (m.enc[kind] || []).forEach(e => { if (!PK.KITS[e[0]]) err('map', id, 'bad encounter kit', e[0]); if (e[1] > e[2]) err('map', id, 'bad level range', e); });
  }
  if (m.music && !PK.MUSIC[m.music]) err('map', id, 'unknown music', m.music);
}

// ---- reachability: BFS over the world graph with all key items
const start = ['bh_home2f', 3, 3];
const seen = new Set();
const q = [start];
const key = (a, x, y) => a + ':' + x + ',' + y;
seen.add(key(...start));
const reachedMaps = new Set();
while (q.length) {
  const [mid, x, y] = q.shift();
  const m = PK.MAPS[mid];
  if (!reachedMaps.has(mid)) (m.links || []).forEach(l => { if (PK.MAPS[l[0]]) q.push([l[0], l[1], l[2]]); });
  reachedMaps.add(mid);
  const push = (a, nx, ny) => { const k = key(a, nx, ny); if (!seen.has(k)) { seen.add(k); q.push([a, nx, ny]); } };
  // warps from this tile
  const w = m.warpDefs[x + ',' + y];
  if (w && PK.MAPS[w.to]) push(w.to, w.x, w.y);
  const d = m.doors[x + ',' + y];
  if (d && d.to && PK.MAPS[d.to]) push(d.to, PK.MAPS[d.to].entry[0], PK.MAPS[d.to].entry[1]);
  if (m.at(x, y) === 'M' && m.exit) push(m.exit.map, m.exit.x, m.exit.y);
  for (const [dx, dy, side] of [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) {
      const e = m.edges && m.edges[side];
      if (!e || !PK.MAPS[e.to]) continue;
      const t = PK.buildMap(PK.MAPS[e.to]);
      let tx = x, ty = y;
      if (side === 'n') { tx = x + (e.off || 0); ty = t.h - 1; }
      if (side === 's') { tx = x + (e.off || 0); ty = 0; }
      if (side === 'w') { ty = y + (e.off || 0); tx = t.w - 1; }
      if (side === 'e') { ty = y + (e.off || 0); tx = 0; }
      if (walk(t, tx, ty)) push(e.to, tx, ty);
      continue;
    }
    const c = m.at(nx, ny);
    if (c === 'v' && dy === 1) { if (walk(m, nx, ny + 1)) push(mid, nx, ny + 1); continue; }
    if (c === 'b' || c === 'r') { push(mid, nx, ny); continue; } // cuttable/smashable
    if (walk(m, nx, ny)) push(mid, nx, ny);
  }
}
const unreached = Object.keys(PK.MAPS).filter(id => !reachedMaps.has(id));
if (unreached.length) err('unreachable maps:', unreached.join(', '));

console.log(`maps: ${built}  reachable: ${reachedMaps.size}  kits: ${kitIds.length}  moves: ${Object.keys(PK.MOVES).length}  items: ${Object.keys(PK.ITEMS).length}  trainers: ${Object.keys(PK.TRAINERS).length}`);
console.log(`errors: ${errors}  warnings: ${warns}`);
process.exit(errors ? 1 : 0);

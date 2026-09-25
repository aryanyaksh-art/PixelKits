// Finds NPCs that cut off part of a map (doors, warps, items, other NPCs) when standing at their posts.
import { loadGame } from './load.mjs';
const PK = loadGame(); PK.linkMaps();
let issues = 0;
for (const id in PK.MAPS) {
  const m = PK.buildMap(PK.MAPS[id]);
  const walk = (x, y) => { const c = m.at(x, y); if (c == null) return false; if (m.solid[y][x] && !m.doors[x + ',' + y]) return false; if (c === 'r' || c === 'b') return true; const t = PK.TILE[c] || {}; return !(t.solid && !t.water) || t.water; };
  const starts = [];
  if (m.entry) starts.push(m.entry);
  if (m.spawn) starts.push(m.spawn);
  for (const k in m.warpDefs) starts.push(k.split(',').map(Number));
  if (m.edges) for (let x = 0; x < m.w; x++) for (let y = 0; y < m.h; y++) if ((x === 0 || y === 0 || x === m.w - 1 || y === m.h - 1) && walk(x, y)) starts.push([x, y]);
  const flood = (block) => {
    const seen = new Set(), q = [];
    for (const s of starts) { const k = s[0] + ',' + s[1]; if (!block.has(k) && walk(s[0], s[1])) { seen.add(k); q.push(s); } }
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || block.has(k) || !walk(nx, ny)) continue; if (m.at(nx, ny) === 'v' && dy !== 1) continue; seen.add(k); q.push([nx, ny]); } }
    return seen;
  };
  // NPCs that appear/disappear with story flags are intentional gates
  const npcs = m.npcDefs.filter(n => n.sprite !== 'none' && !n.cond && !n.hideIf);
  const free = flood(new Set());
  const blocked = flood(new Set(npcs.map(n => n.x + ',' + n.y)));
  // targets: tiles next to other NPCs, doors, warps, items
  const targets = [];
  for (const k in m.doors) targets.push(['door', k]);
  for (const k in m.warpDefs) targets.push(['warp', k]);
  m.itemDefs.forEach(it => targets.push(['item', it.x + ',' + it.y, true]));
  npcs.forEach(n => targets.push(['npc ' + (n.keeper || n.talk && (typeof n.talk === 'string' ? n.talk : 'talk') || n.sprite), n.x + ',' + n.y, true]));
  for (const [what, k, adj] of targets) {
    const [x, y] = k.split(',').map(Number);
    const cells = adj ? [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].map(p => p.join(',')) : [k];
    const okFree = cells.some(c => free.has(c)), okBlocked = cells.some(c => blocked.has(c));
    if (okFree && !okBlocked) { console.log(id, 'NPC blocks access to', what, 'at', k); issues++; }
  }
}
console.log('issues', issues);

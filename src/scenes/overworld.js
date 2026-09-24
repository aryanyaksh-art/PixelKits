// Overworld: map rendering, movement, NPCs, interactions, encounters and the script API (PK.world).
(function () {
  'use strict';
  var PK = window.PK;
  var TS = 16;
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  var OUTDOOR = { vale: 1, coast: 1, desert: 1, snow: 1, spooky: 1, ruins: 1 };

  function drawSatchel(ctx, x, y) {
    ctx.fillStyle = '#241c2c'; ctx.fillRect(x + 3, y + 5, 10, 9); ctx.fillRect(x + 4, y + 4, 8, 11);
    ctx.fillStyle = '#b07038'; ctx.fillRect(x + 4, y + 5, 8, 9);
    ctx.fillStyle = '#d8984e'; ctx.fillRect(x + 4, y + 5, 8, 3);
    ctx.fillStyle = '#f0d060'; ctx.fillRect(x + 7, y + 7, 2, 2);
    ctx.fillStyle = '#241c2c'; ctx.fillRect(x + 5, y + 2, 6, 1); ctx.fillRect(x + 5, y + 2, 1, 3); ctx.fillRect(x + 10, y + 2, 1, 3);
  }
  PK.drawSatchel = drawSatchel;

  var W = {
    map: null,
    p: { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, t: 0, dx: 0, dy: 0, surf: false, jump: 0, turnT: 0, stepN: 0, slide: false },
    npcs: [],
    frames: [],
    busy: 0,
    nameT: 0,
    weather: [],
    bumpT: 0,
    musicTrack: null
  };
  PK.world = W;

  // ---------------- loading ----------------
  W.prerender = function () {
    var m = W.map;
    var nf = 1;
    for (var y = 0; y < m.h && nf === 1; y++) for (var x = 0; x < m.w; x++) if (PK.tiles.isAnimated(m.at(x, y))) { nf = 3; break; }
    W.frames = [];
    for (var f = 0; f < nf; f++) {
      var c = PK.makeCanvas(m.w * TS, m.h * TS);
      var ctx = c.getContext('2d');
      for (y = 0; y < m.h; y++) for (x = 0; x < m.w; x++) PK.tiles.drawMapTile(ctx, m, x, y, x * TS, y * TS, f);
      W.drawBuildings(ctx);
      W.frames.push(c);
    }
  };
  W.drawBuildings = function (ctx) {
    var m = W.map;
    (m.buildings || []).forEach(function (b) {
      var em = b.emblem ? PK.TYPES[b.emblem].color : null;
      var img = PK.buildings.draw(b.k, { roof: b.roof, snow: m.theme === 'snow', label: b.label, emblem: em });
      ctx.drawImage(img, b.x * TS, b.y * TS);
    });
  };
  W.redrawTile = function (tx, ty) {
    var m = W.map;
    W.frames.forEach(function (c, f) {
      var ctx = c.getContext('2d');
      for (var y = ty - 1; y <= ty + 1; y++) for (var x = tx - 1; x <= tx + 1; x++) {
        if (m.at(x, y) == null) continue;
        PK.tiles.drawMapTile(ctx, m, x, y, x * TS, y * TS, f);
      }
      ctx.save(); ctx.beginPath(); ctx.rect((tx - 1) * TS, (ty - 1) * TS, TS * 3, TS * 3); ctx.clip();
      W.drawBuildings(ctx); ctx.restore();
    });
  };

  function condOk(d) {
    var g = PK.game;
    if (d.cond && !(typeof d.cond === 'function' ? d.cond() : g.flag(d.cond))) return false;
    if (d.hideIf && (typeof d.hideIf === 'function' ? d.hideIf() : g.flag(d.hideIf))) return false;
    return true;
  }

  W.load = function (id, x, y, dir) {
    var m = PK.MAPS[id];
    if (!m) throw new Error('No map ' + id);
    PK.buildMap(m);
    // reset runtime tile changes (bushes/rocks regrow)
    m.tiles = m.grid.map(function (r) { return r.split(''); });
    W.map = m;
    var st = PK.game.state;
    st.player.map = id;
    W.p.x = x; W.p.y = y; W.p.px = x * TS; W.p.py = y * TS;
    W.p.dir = dir || W.p.dir; W.p.moving = false; W.p.t = 0; W.p.jump = 0; W.p.slide = false;
    if (m.interior || !OUTDOOR[m.theme] && m.theme !== 'coast') W.p.surf = W.p.surf && m.at(x, y) === '~';
    if (m.at(x, y) !== '~') W.p.surf = false;
    W.npcs = m.npcDefs.filter(condOk).map(function (d) {
      return { d: d, id: d.id || d.key, x: d.x, y: d.y, px: d.x * TS, py: d.y * TS, dir: d.dir || 'down', moving: false, t: 0, hx: d.x, hy: d.y, timer: 60 + PK.rnd(120), sprite: d.sprite || 'boy', emote: null, hidden: false };
    });
    W.prerender();
    W.nameT = m.interior ? 0 : 150;
    W.initWeather();
    W.playMapMusic();
    W.syncPlayer();
  };
  W.playMapMusic = function () {
    var m = W.map;
    var track = m.music;
    if (typeof track === 'function') track = track();
    if (track && PK.audio) PK.audio.music(track);
    W.musicTrack = track;
  };
  W.resumeMusic = function () { W.playMapMusic(); };
  W.syncPlayer = function () {
    var st = PK.game.state;
    if (!W.map) return;
    st.player.map = W.map.id; st.player.x = W.p.x; st.player.y = W.p.y; st.player.dir = W.p.dir; st.player.surf = W.p.surf;
  };

  W.warp = async function (id, x, y, dir, opts) {
    opts = opts || {};
    W.busy++;
    if (PK.audio && !opts.silent) PK.audio.sfx(opts.sfx || 'door');
    await PK.fx.fadeOut(opts.fast ? 8 : 14);
    W.load(id, x, y, dir);
    await PK.wait(4);
    await PK.fx.fadeIn(opts.fast ? 8 : 14);
    W.busy--;
    await W.onEnter();
  };
  W.onEnter = async function () {
    var m = W.map;
    if (m.onEnter) await W.script(m.onEnter);
    W.checkSight();
  };

  // ---------------- queries ----------------
  W.npcAt = function (x, y) {
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      if (n.hidden) continue;
      if ((n.x === x && n.y === y) || (n.moving && n.tx === x && n.ty === y)) return n;
    }
    return null;
  };
  W.itemAt = function (x, y) {
    var st = PK.game.state;
    var list = W.map.itemDefs;
    for (var i = 0; i < list.length; i++) if (list[i].x === x && list[i].y === y && !st.picked[list[i].key]) return list[i];
    return null;
  };
  W.blocked = function (x, y, forNpc) {
    var m = W.map, c = m.at(x, y);
    if (c == null) return true;
    if (m.solid[y][x]) return true;
    var t = PK.TILE[c] || {};
    if (t.water) { if (forNpc || !W.p.surf) return true; }
    else if (t.solid) return true;
    if (W.npcAt(x, y)) return true;
    if (W.itemAt(x, y)) return true;
    if (forNpc && W.p.x === x && W.p.y === y) return true;
    return false;
  };

  // ---------------- player movement ----------------
  W.tryMove = function (d) {
    var p = W.p, m = W.map, v = DIRS[d];
    p.dir = d;
    var here = m.at(p.x, p.y);
    if (here === 'M' && d === 'down' && m.exit) return W.exitInterior();
    var nx = p.x + v[0], ny = p.y + v[1];
    if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) return W.tryEdge(d);
    var c = m.at(nx, ny);
    if (c === 'v' && d === 'down' && !W.blocked(nx, ny + 1)) {
      p.moving = true; p.t = 0; p.dx = 0; p.dy = 2; p.jump = 1;
      if (PK.audio) PK.audio.sfx('jump');
      return;
    }
    if (W.blocked(nx, ny)) {
      if (W.bumpT <= 0) { if (PK.audio) PK.audio.sfx('bump'); W.bumpT = 20; }
      return;
    }
    if (p.surf && c !== '~') p.surf = false;
    p.moving = true; p.t = 0; p.dx = v[0]; p.dy = v[1]; p.jump = 0;
  };
  W.tryEdge = function (d) {
    var m = W.map, e = m.edges && m.edges[{ up: 'n', down: 's', left: 'w', right: 'e' }[d]];
    if (!e) { if (W.bumpT <= 0) { if (PK.audio) PK.audio.sfx('bump'); W.bumpT = 20; } return; }
    var t = PK.buildMap(PK.MAPS[e.to]);
    var p = W.p, x = p.x, y = p.y;
    if (d === 'up') { x += e.off || 0; y = t.h - 1; }
    if (d === 'down') { x += e.off || 0; y = 0; }
    if (d === 'left') { y += e.off || 0; x = t.w - 1; }
    if (d === 'right') { y += e.off || 0; x = 0; }
    PK.run(function () { return W.warp(e.to, x, y, d, { fast: true, silent: true }); });
  };
  W.exitInterior = function () {
    var e = W.map.exit;
    PK.run(function () { return W.warp(e.map, e.x, e.y, 'down'); });
  };

  W.finishStep = async function () {
    var p = W.p, m = W.map, st = PK.game.state;
    st.steps++;
    if (st.hush > 0) { st.hush--; if (st.hush === 0) { W.busy++; await PK.ui.say('The Hush Spray wore off.'); W.busy--; } }
    var key = p.x + ',' + p.y;
    var door = m.doors[key];
    if (door && door.to) {
      var t = PK.buildMap(PK.MAPS[door.to]);
      return W.warp(door.to, t.entry[0], t.entry[1], 'up');
    }
    var wp = m.warpDefs[key];
    if (wp) return W.warp(wp.to, wp.x, wp.y, wp.dir || p.dir, { sfx: m.at(p.x, p.y) === 'X' ? 'stairs' : 'door' });
    var c = m.at(p.x, p.y);
    if (c === 'M' && m.exit && W.lastDir === 'down') return W.exitInterior();
    // ice
    if (c === 'i') {
      var v = DIRS[p.dir], nx = p.x + v[0], ny = p.y + v[1];
      if (!W.blocked(nx, ny) && m.at(nx, ny) != null) { p.moving = true; p.t = 0; p.dx = v[0]; p.dy = v[1]; p.slide = true; return; }
    }
    p.slide = false;
    // step events
    for (var i = 0; i < m.eventDefs.length; i++) {
      var ev = m.eventDefs[i];
      if (ev.x === p.x && ev.y === p.y && condOk(ev) && !(ev.once && PK.game.flag(ev.once))) {
        await W.script(ev.run);
        return;
      }
    }
    if (W.checkSight()) return;
    W.tryEncounter(c);
  };

  // ---------------- encounters ----------------
  W.tryEncounter = function (c) {
    var m = W.map;
    if (PK.noEncounters || !m.enc) return;
    var kind = W.p.surf ? 'water' : c === '"' ? 'grass' : (m.enc.cave && (c === '.' || c === ',' || c === 'd' || c === 'i')) ? 'cave' : null;
    if (!kind || !m.enc[kind]) return;
    var rate = { grass: 1 / 9, cave: 1 / 14, water: 1 / 11 }[kind] * (m.enc.rate || 1);
    if (Math.random() > rate) return;
    var tod = PK.game.timeOfDay();
    var list = m.enc[kind].filter(function (e) {
      if (!e[4]) return true;
      if (e[4] === 'night') return tod === 'night';
      if (e[4] === 'day') return tod !== 'night';
      if (e[4] === 'morning') return tod === 'morning';
      return true;
    }).map(function (e) { return { e: e, w: e[3] }; });
    if (!list.length) return;
    var e = PK.weighted(list, 'w').e;
    var lvl = e[1] + PK.rnd(e[2] - e[1] + 1);
    var st = PK.game.state;
    var lead = st.party[PK.game.firstAlive()];
    if (st.hush > 0 && lead && lvl <= lead.level) return;
    if (!lead) return;
    PK.run(function () { return W.wildBattle(e[0], lvl); });
  };

  W.battleTransition = async function () {
    if (PK.audio) PK.audio.music('encounter');
    for (var i = 0; i < 3; i++) { PK.fx.flash(6, '#ffffff'); await PK.wait(7); }
    await PK.fx.fadeOut(10);
  };
  W.wildBattle = async function (id, lvl, opts) {
    opts = opts || {};
    W.busy++;
    await W.battleTransition();
    var kit = PK.stats.create(id, lvl, { noPrism: opts.noPrism });
    var night = !W.map.interior && PK.game.timeOfDay() === 'night';
    var outcome = await PK.startBattle(Object.assign({ wild: true, enemy: [kit], theme: W.map.theme, night: night, place: W.map.name }, opts));
    await W.afterBattle(outcome, opts);
    W.busy--;
    return outcome;
  };
  W.afterBattle = async function (outcome, opts) {
    if (outcome === 'lose' && !(opts && opts.canLose)) return W.whiteout();
    if (outcome === 'lose' && opts && opts.canLose) PK.game.healParty();
    W.playMapMusic();
    await PK.fx.fadeIn(14);
  };
  W.whiteout = async function () {
    var st = PK.game.state;
    PK.game.healParty();
    var c = st.clinic;
    W.load(c.map, c.x, c.y, 'up');
    W.p.surf = false;
    await PK.fx.fadeIn(20);
    await PK.ui.say(W.map.isClinic ? 'Your Kits were patched up and are feeling better. Take care out there!' : 'Your Kits rested and recovered. Be careful out there!');
  };

  // ---------------- keepers ----------------
  W.checkSight = function () {
    if (W.busy) return false;
    var p = W.p, st = PK.game.state;
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      var k = n.d.keeper;
      if (!k || n.hidden || st.defeated[k]) continue;
      var v = DIRS[n.dir], range = n.d.sight == null ? 4 : n.d.sight;
      for (var s = 1; s <= range; s++) {
        var x = n.x + v[0] * s, y = n.y + v[1] * s;
        if (x === p.x && y === p.y) {
          (function (npc) { PK.run(function () { return W.keeperSpotted(npc); }); })(n);
          return true;
        }
        var c = W.map.at(x, y);
        if (c == null || W.map.solid[y][x] || (PK.TILE[c] && PK.TILE[c].solid && !PK.TILE[c].water) || W.npcAt(x, y)) break;
      }
    }
    return false;
  };
  W.keeperSpotted = async function (n) {
    W.busy++;
    var tr = PK.TRAINERS[n.d.keeper];
    if (PK.audio) PK.audio.music(tr.eyes || 'eyes');
    n.emote = '!';
    await PK.wait(40);
    n.emote = null;
    // walk to player
    var p = W.p, v = DIRS[n.dir], face = n.dir, walked = 0, mapId = W.map.id;
    for (var guard = 0; guard < 10; guard++) {
      var nx = n.x + v[0], ny = n.y + v[1];
      if (nx === p.x && ny === p.y) break;
      await W.stepNpc(n, n.dir);
      walked++;
    }
    p.dir = OPP[n.dir];
    var r = await W.keeperBattle(n);
    // walk back to their post so they never block a path
    if (r === 'win' && W.map.id === mapId) {
      for (var b = 0; b < walked; b++) await W.stepNpc(n, OPP[face]);
      n.dir = face;
    }
    W.busy--;
  };
  W.keeperBattle = async function (n) {
    var id = n.d.keeper, tr = PK.TRAINERS[id];
    if (tr.intro) await PK.ui.say(tr.intro);
    var r = await W.battle(id);
    if (r === 'win' && tr.after) await PK.ui.say(tr.after);
    return r;
  };

  // Trainer battle helper
  W.battle = async function (id, opts) {
    opts = opts || {};
    var tr = PK.TRAINERS[id];
    var st = PK.game.state;
    var team = typeof tr.team === 'function' ? tr.team(st) : tr.team;
    var enemy = team.map(function (e) { return PK.stats.create(e[0], e[1], { noPrism: true, genes: tr.genes != null ? tr.genes : 8 + PK.rnd(8), moves: e[2], held: e[3] }); });
    W.busy++;
    await W.battleTransition();
    var outcome = await PK.startBattle({ wild: false, enemy: enemy, trainer: tr, theme: W.map.theme, ai: tr.ai, items: tr.items || 0, music: tr.music, canLose: opts.canLose || tr.canLose, night: !W.map.interior && PK.game.timeOfDay() === 'night' });
    if (outcome === 'win') st.defeated[id] = true;
    await W.afterBattle(outcome, { canLose: opts.canLose || tr.canLose });
    W.busy--;
    return outcome;
  };

  // ---------------- NPC control ----------------
  W.stepNpc = function (n, d) {
    return new Promise(function (res) {
      var v = DIRS[d];
      n.dir = d;
      n.moving = true; n.t = 0; n.tx = n.x + v[0]; n.ty = n.y + v[1]; n.res = res;
    });
  };
  W.npc = function (id) {
    for (var i = 0; i < W.npcs.length; i++) if (W.npcs[i].id === id) return W.npcs[i];
    return null;
  };
  // path string like 'uuddllrr'
  W.moveNpc = async function (id, path) {
    var n = typeof id === 'string' ? W.npc(id) : id;
    if (!n) return;
    var map = { u: 'up', d: 'down', l: 'left', r: 'right' };
    for (var i = 0; i < path.length; i++) await W.stepNpc(n, map[path[i]]);
  };
  W.movePlayer = async function (path) {
    var map = { u: 'up', d: 'down', l: 'left', r: 'right' };
    for (var i = 0; i < path.length; i++) {
      var d = map[path[i]], v = DIRS[d], p = W.p;
      p.dir = d; p.moving = true; p.t = 0; p.dx = v[0]; p.dy = v[1]; p.scripted = true;
      await new Promise(function (res) { p.res = res; });
    }
  };
  W.face = function (id, d) { var n = W.npc(id); if (n) n.dir = d; };
  W.facePlayer = function (n) {
    n = typeof n === 'string' ? W.npc(n) : n;
    if (!n) return;
    var dx = W.p.x - n.x, dy = W.p.y - n.y;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };
  W.playerFace = function (d) { W.p.dir = d; };
  W.hideNpc = function (id) { var n = W.npc(id); if (n) n.hidden = true; };
  W.emote = async function (id, ch, frames) {
    var n = id === 'player' ? W.p : W.npc(id);
    if (!n) return;
    n.emote = ch || '!';
    if (PK.audio) PK.audio.sfx('emote');
    await PK.wait(frames || 36);
    n.emote = null;
  };

  // ---------------- script helpers ----------------
  W.script = async function (fn) {
    if (!fn) return;
    if (typeof fn === 'string') fn = PK.SCRIPTS[fn];
    if (!fn) return;
    W.busy++;
    try { await fn(W); } catch (e) { console.error(e); }
    W.busy--;
  };
  W.say = function (t, o) { return PK.ui.say(t, o); };
  W.ask = function (t, it) { return PK.ui.ask(t, it); };
  W.yesno = function (t) { return PK.ui.yesno(t); };
  W.flag = function (f) { return PK.game.flag(f); };
  W.setFlag = function (f, v) { PK.game.setFlag(f, v); };
  W.wait = function (n) { return PK.wait(n); };
  W.give = async function (id, n, quiet) {
    n = n || 1;
    PK.game.addItem(id, n);
    if (PK.audio) PK.audio.jingle(PK.ITEMS[id].pocket === 'key' ? 'keyitem' : 'item');
    if (!quiet) await PK.ui.say(PK.game.state.player.name + ' received ' + (n > 1 ? n + ' ' : '') + PK.ITEMS[id].name + (n > 1 && !/s$/.test(PK.ITEMS[id].name) ? 's' : '') + '!');
  };
  W.giveKit = async function (id, lvl, opts) {
    var k = PK.stats.create(id, lvl, opts || {});
    var where = PK.game.giveKit(k);
    if (PK.audio) PK.audio.jingle('caught');
    await PK.ui.say(PK.game.state.player.name + ' received ' + PK.KITS[id].name + '!');
    if (where === 'box') await PK.ui.say(PK.KITS[id].name + ' was sent to the Storage Box.');
    return k;
  };
  W.heal = async function () {
    if (PK.audio) PK.audio.jingle('heal');
    PK.game.healParty();
    await PK.wait(90);
  };
  W.music = function (t) { if (PK.audio) PK.audio.music(t); };

  // ---------------- interaction ----------------
  W.interact = async function () {
    var p = W.p, m = W.map, v = DIRS[p.dir];
    var fx = p.x + v[0], fy = p.y + v[1];
    var n = W.npcAt(fx, fy);
    var c = m.at(fx, fy);
    if (!n && c && PK.TILE[c] && PK.TILE[c].counter) n = W.npcAt(fx + v[0], fy + v[1]);
    if (n) return W.talk(n);
    var it = W.itemAt(fx, fy);
    if (it) {
      PK.game.state.picked[it.key] = true;
      if (PK.audio) PK.audio.jingle('item');
      PK.game.addItem(it.item, it.n);
      return PK.ui.say(PK.game.state.player.name + ' found ' + (it.n > 1 ? it.n + ' ' : '') + PK.ITEMS[it.item].name + '!');
    }
    var hid = m.hiddenDefs.filter(function (h) { return h.x === fx && h.y === fy && !PK.game.state.picked[h.key]; })[0];
    if (hid) {
      PK.game.state.picked[hid.key] = true;
      PK.game.addItem(hid.item, hid.n);
      if (PK.audio) PK.audio.jingle('item');
      return PK.ui.say('Oh? There was something hidden here! ' + PK.game.state.player.name + ' found ' + PK.ITEMS[hid.item].name + '!');
    }
    var sg = m.signDefs[fx + ',' + fy];
    if (sg) return PK.ui.say(typeof sg === 'function' ? sg() : sg);
    if (!c) return;
    if (c === 'C') return PK.menus.storage();
    if (c === 'K') return PK.ui.say(m.shelfText || "It's packed with books about Kits and their habitats.");
    if (c === 'D') return PK.ui.say('The shelves are neatly stocked.');
    if (c === 'B' && m.homeBed) {
      if (await PK.ui.yesno('It\'s your bed. Take a rest?')) { await PK.fx.fadeOut(20); await W.heal(); await PK.fx.fadeIn(20); await PK.ui.say('Your Kits are fully rested!'); }
      return;
    }
    if (c === 'Q' && m.statue) return PK.ui.say(typeof m.statue === 'function' ? m.statue() : m.statue);
    if (c === 'b') {
      if (!PK.game.count('machete')) return PK.ui.say('A thick bush blocks the way. Something sharp could clear it.');
      if (await PK.ui.yesno('This bush could be cut down. Use the Machete?')) {
        if (PK.audio) PK.audio.sfx('cut');
        m.tiles[fy][fx] = '.'; W.redrawTile(fx, fy);
      }
      return;
    }
    if (c === 'r') {
      if (!PK.game.count('pickaxe')) return PK.ui.say('A cracked boulder. It might break with the right tool.');
      if (await PK.ui.yesno('This rock looks breakable. Use the Pickaxe?')) {
        if (PK.audio) PK.audio.sfx('smash');
        PK.fx.shake(10, 2);
        m.tiles[fy][fx] = m.enc && m.enc.cave ? '.' : '.'; W.redrawTile(fx, fy);
      }
      return;
    }
    if (c === '~' && !p.surf) {
      if (!PK.game.count('raft')) return PK.ui.say('The water is deep and calm.');
      if (await PK.ui.yesno('The water is calm. Use the Raft?')) {
        if (PK.audio) PK.audio.sfx('splash');
        p.surf = true;
        W.tryMove(p.dir);
      }
    }
  };

  W.talk = async function (n) {
    var d = n.d;
    if (!d.noTurn) W.facePlayer(n);
    var st = PK.game.state;
    if (d.keeper) {
      if (!st.defeated[d.keeper]) return W.keeperBattle(n);
      var tr = PK.TRAINERS[d.keeper];
      return PK.ui.say(tr.after || tr.lose || '...');
    }
    if (d.talk === 'clinic') return W.clinic(n);
    if (d.talk === 'shop') return PK.menus.shop(d.stock || ['capsule', 'tonic', 'remedy']);
    if (typeof d.talk === 'function') return d.talk(W, n);
    if (typeof d.talk === 'string' && PK.SCRIPTS[d.talk]) return PK.SCRIPTS[d.talk](W, n);
    var text = d.text;
    if (d.textIf) for (var i = 0; i < d.textIf.length; i++) if (PK.game.flag(d.textIf[i][0])) { text = d.textIf[i][1]; break; }
    if (typeof text === 'function') text = text();
    if (text) return PK.ui.say(text);
  };

  W.clinic = async function (n) {
    var st = PK.game.state;
    var yes = await PK.ui.yesno('Welcome to the Kit Clinic! Shall we restore your Kits to full health?');
    if (yes) {
      await PK.ui.say('Okay, I\'ll take your Kits for a few seconds.', { auto: 50 });
      n.dir = 'left';
      W.healing = 90;
      await W.heal();
      W.healing = 0;
      n.dir = 'down';
      await PK.ui.say('Thank you for waiting. Your Kits are fighting fit! We hope to see you again!');
      st.clinic = { map: W.map.id, x: W.p.x, y: W.p.y };
    } else await PK.ui.say('We hope to see you again!');
  };

  // ---------------- weather ----------------
  W.initWeather = function () {
    W.weather = [];
    var w = W.map.weather;
    if (!w) return;
    for (var i = 0; i < 40; i++) W.weather.push({ x: Math.random() * PK.W, y: Math.random() * PK.H, s: 0.5 + Math.random() });
  };
  W.drawWeather = function (ctx) {
    var w = W.map.weather;
    if (!w) return;
    W.weather.forEach(function (f) {
      if (w === 'snow') { f.y += f.s * 0.8; f.x += Math.sin((PK.frame + f.y) / 30) * 0.4; ctx.fillStyle = '#ffffff'; ctx.fillRect(f.x | 0, f.y | 0, f.s > 1 ? 2 : 1, f.s > 1 ? 2 : 1); }
      else if (w === 'sand') { f.x += f.s * 3; f.y += f.s * 0.3; ctx.fillStyle = 'rgba(240,210,140,0.7)'; ctx.fillRect(f.x | 0, f.y | 0, 4, 1); }
      else if (w === 'embers') { f.y -= f.s * 0.6; f.x += Math.sin((PK.frame + f.x) / 20) * 0.3; ctx.fillStyle = f.s > 1.1 ? '#ffd060' : '#ff7a30'; ctx.fillRect(f.x | 0, f.y | 0, 1, 1); }
      else if (w === 'rain') { f.y += f.s * 5; f.x -= f.s; ctx.fillStyle = 'rgba(180,200,255,0.6)'; ctx.fillRect(f.x | 0, f.y | 0, 1, 4); }
      else if (w === 'fog' || w === 'dust') { f.x += f.s * 0.2; ctx.fillStyle = w === 'fog' ? 'rgba(200,190,230,0.10)' : 'rgba(255,255,255,0.06)'; ctx.fillRect(f.x | 0, f.y | 0, 40, 10); }
      if (f.y > PK.H) f.y -= PK.H + 4; if (f.y < -4) f.y += PK.H + 4;
      if (f.x > PK.W + 40) f.x -= PK.W + 60; if (f.x < -40) f.x += PK.W + 60;
    });
  };

  // ---------------- scene ----------------
  function Overworld() { this.opaque = true; }
  Overworld.prototype.update = function () {
    var p = W.p, inp = PK.input;
    if (W.bumpT > 0) W.bumpT--;
    if (W.nameT > 0) W.nameT--;
    // NPC movement
    for (var i = 0; i < W.npcs.length; i++) {
      var n = W.npcs[i];
      if (n.moving) {
        n.t += 1;
        n.px = (n.x + (n.tx - n.x) * n.t / TS) * TS;
        n.py = (n.y + (n.ty - n.y) * n.t / TS) * TS;
        if (n.t >= TS) {
          n.x = n.tx; n.y = n.ty; n.px = n.x * TS; n.py = n.y * TS; n.moving = false;
          if (n.res) { var r = n.res; n.res = null; r(); }
        }
      } else if (!W.busy && !n.hidden) {
        var mv = n.d.move;
        if (mv === 'wander' || mv === 'look') {
          if (--n.timer <= 0) {
            n.timer = 80 + PK.rnd(160);
            var ds = ['up', 'down', 'left', 'right'], d = PK.pick(ds);
            if (mv === 'look') n.dir = d;
            else {
              var v = DIRS[d], nx = n.x + v[0], ny = n.y + v[1];
              n.dir = d;
              if (Math.abs(nx - n.hx) <= 2 && Math.abs(ny - n.hy) <= 2 && !W.blocked(nx, ny, true)) W.stepNpc(n, d);
            }
            if (n.d.keeper) W.checkSight();
          }
        }
      }
    }
    // player movement
    if (p.moving) {
      var speed = p.slide ? 2 : (inp.h('select') && !p.scripted && !p.surf) || p.jump ? 2 : 1;
      if (p.jump) speed = 1.34;
      p.t += speed;
      var dist = p.jump ? 2 : 1;
      var prog = Math.min(1, p.t / (TS * (p.jump ? 1.5 : 1)));
      p.px = (p.x + p.dx * prog * (p.jump ? 1 : 1)) * TS;
      p.py = (p.y + p.dy * prog) * TS;
      if (prog >= 1) {
        p.x += p.dx; p.y += p.dy;
        p.px = p.x * TS; p.py = p.y * TS;
        p.moving = false; p.stepN++;
        W.lastDir = p.dir;
        void dist;
        p.jump = 0;
        if (p.scripted) { p.scripted = false; if (p.res) { var rr = p.res; p.res = null; rr(); } return; }
        PK.run(W.finishStep);
      }
      return;
    }
    if (W.busy || PK.top() !== this) return;
    if (p.turnT > 0) { p.turnT--; }
    if (inp.p('start')) { W.busy++; PK.run(function () { return PK.menus.start(); }).then(function () { W.busy--; }); return; }
    if (inp.p('a')) { W.busy++; PK.run(W.interact).then(function () { W.busy--; }); return; }
    var d = inp.dir();
    if (!d) return;
    if (d !== p.dir && inp.held(d) < 4) { p.dir = d; p.turnT = 5; return; }
    if (p.turnT > 0) return;
    W.tryMove(d);
  };

  Overworld.prototype.draw = function (ctx) {
    var m = W.map, p = W.p;
    if (!m) return;
    var mw = m.w * TS, mh = m.h * TS;
    var cx, cy;
    if (mw <= PK.W) cx = -Math.floor((PK.W - mw) / 2); else cx = PK.clamp(Math.round(p.px + 8 - PK.W / 2), 0, mw - PK.W);
    if (mh <= PK.H) cy = -Math.floor((PK.H - mh) / 2); else cy = PK.clamp(Math.round(p.py + 8 - PK.H / 2), 0, mh - PK.H);
    ctx.fillStyle = m.interior ? '#000000' : '#101018';
    ctx.fillRect(0, 0, PK.W, PK.H);
    var f = W.frames.length > 1 ? Math.floor(PK.frame / 20) % W.frames.length : 0;
    ctx.drawImage(W.frames[f], -cx, -cy);
    // items
    var st = PK.game.state;
    m.itemDefs.forEach(function (it) { if (!st.picked[it.key]) drawSatchel(ctx, it.x * TS - cx, it.y * TS - cy); });
    // sprites sorted by y
    var list = W.npcs.filter(function (n) { return !n.hidden; }).map(function (n) { return { y: n.py, n: n }; });
    list.push({ y: p.py, player: true });
    list.sort(function (a, b) { return a.y - b.y; });
    list.forEach(function (o) {
      if (o.player) return W.drawPlayer(ctx, cx, cy);
      var n = o.n;
      var sx = Math.round(n.px - cx), sy = Math.round(n.py - cy);
      if (n.sprite === 'none') return;
      if (n.sprite === 'capsule') { PK.bfx.drawCapsule(ctx, sx + 8, sy + 6, n.d.capsule || 'capsule'); return; }
      if (n.sprite.indexOf('kit:') === 0) {
        var id = +n.sprite.slice(4);
        var ic = PK.kitArt.icon(id);
        var bob = Math.round(Math.sin(PK.frame / 16) * 1.5);
        ctx.drawImage(ic, sx - 8, sy - 16 + bob);
        return;
      }
      var spr = PK.chars.sprite(n.sprite)[n.dir];
      var fr = n.moving ? (n.t < 8 ? 1 + ((n.x + n.y) & 1) : 0) : 0;
      ctx.drawImage(spr[fr], sx, sy - 4 - (fr ? 1 : 0));
      if (n.emote) PK.chars.emote(ctx, sx + 2, sy - 20, n.emote);
    });
    // tall grass overlay on the player
    var pc = m.at(p.x, p.y);
    if (!p.moving && pc === '"') {
      var g = PK.tiles.get(m.theme, '"', 0, 0, 0);
      ctx.drawImage(g, 0, 9, 16, 7, Math.round(p.px - cx), Math.round(p.py - cy) + 9, 16, 7);
    }
    // healing machine glow
    if (W.healing) {
      W.healing--;
      if ((PK.frame >> 3) & 1) { ctx.fillStyle = 'rgba(160,255,220,0.5)'; ctx.fillRect(4 * TS - cx, 1 * TS - cy, 48, 10); }
    }
    // time-of-day tint for outdoor maps
    if (!m.interior && m.theme !== 'cave' && m.theme !== 'ice' && m.theme !== 'volcano') {
      var tod = PK.game.timeOfDay();
      var tint = { morning: 'rgba(255,190,140,0.08)', evening: 'rgba(255,120,60,0.16)', night: 'rgba(20,24,80,0.40)' }[tod];
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, PK.W, PK.H); }
      if (tod === 'night') {
        // lamp glow
        for (var y = Math.max(0, Math.floor(cy / TS)); y < Math.min(m.h, Math.ceil((cy + PK.H) / TS) + 1); y++)
          for (var x = Math.max(0, Math.floor(cx / TS)); x < Math.min(m.w, Math.ceil((cx + PK.W) / TS) + 1); x++)
            if (m.at(x, y) === 'L') { ctx.fillStyle = 'rgba(255,230,140,0.18)'; ctx.beginPath(); ctx.arc(x * TS - cx + 8, y * TS - cy + 4, 22, 0, 6.3); ctx.fill(); }
      }
    }
    if (m.dark) {
      var px = p.px - cx + 8, py = p.py - cy + 8;
      var grd = ctx.createRadialGradient(px, py, 20, px, py, 90);
      grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, PK.W, PK.H);
    }
    W.drawWeather(ctx);
    // map name banner
    if (W.nameT > 0) {
      var a = Math.min(1, W.nameT / 20);
      var off = W.nameT > 130 ? (W.nameT - 130) * -1.5 : 0;
      ctx.globalAlpha = a;
      var nw = PK.font.width(m.name) + 20;
      PK.ui.box(ctx, 4, 4 + off, Math.max(80, nw), 20);
      PK.font.draw(ctx, m.name, 14, 10 + off, '#383848', '#d6d4c8');
      ctx.globalAlpha = 1;
    }
  };

  W.drawPlayer = function (ctx, cx, cy) {
    var p = W.p;
    var sx = Math.round(p.px - cx), sy = Math.round(p.py - cy);
    var spr = PK.chars.sprite('player')[p.dir];
    var fr = p.moving && !p.slide && !p.surf ? (p.t < 8 ? 1 + (p.stepN & 1) : 0) : 0;
    var hop = 0;
    if (p.jump) {
      var prog = Math.min(1, p.t / 24);
      hop = Math.round(Math.sin(prog * Math.PI) * 10);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + 3, sy + 12, 10, 3);
    }
    if (p.surf) {
      var bob = (PK.frame >> 4) & 1;
      ctx.fillStyle = '#241c2c'; ctx.fillRect(sx - 1, sy + 7 + bob, 18, 8);
      ctx.fillStyle = '#b07a44'; ctx.fillRect(sx, sy + 8 + bob, 16, 6);
      ctx.fillStyle = '#d09a60'; ctx.fillRect(sx, sy + 8 + bob, 16, 2);
      ctx.fillStyle = '#7a4a26'; ctx.fillRect(sx + 5, sy + 8 + bob, 1, 6); ctx.fillRect(sx + 10, sy + 8 + bob, 1, 6);
      ctx.save(); ctx.beginPath(); ctx.rect(sx - 2, sy - 8, 20, 17 + bob); ctx.clip();
      ctx.drawImage(spr[0], sx, sy - 6 + bob);
      ctx.restore();
    } else ctx.drawImage(spr[fr], sx, sy - 4 - hop - (fr ? 1 : 0));
    if (p.emote) PK.chars.emote(ctx, sx + 2, sy - 20, p.emote);
  };

  PK.Overworld = Overworld;

  // Start or continue the game in the overworld
  PK.enterWorld = async function () {
    PK.clearScenes();
    PK.linkMaps();
    var st = PK.game.state;
    PK.push(new Overworld());
    W.busy = 0;
    W.load(st.player.map, st.player.x, st.player.y, st.player.dir);
    if (st.player.surf) W.p.surf = true;
    await PK.fx.fadeIn(20);
    await W.onEnter();
  };
})();

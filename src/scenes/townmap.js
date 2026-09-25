// Lumora region map, drawn from the real map tiles (1 pixel per tile) on a generated coastline.
// Shows where you are, lets you browse places, and picks Wayfinder destinations.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var MW = 240, MH = 136, OY = 18; // map area size and its top on screen

  // Where each group of edge-connected areas sits on the map (world pixel = 1 tile)
  var ROOTS = { brookhollow: [8, 68], voltmere: [96, 30], mirage_city: [184, 44], shadefall: [146, 4], crown_summit: [112, 4], emberisle: [186, 112] };
  // Caves and other places without outdoor terrain are shown as icons
  var ICONS = {
    echo_cavern: [91, 34, 'cave'], ember_tunnels: [181, 74, 'cave'], frozen_depths: [175, 15, 'cave'], summit_road: [139, 12, 'cave'],
    hidden_hollow: [47, 20, 'cave'], glacier_grotto: [209, 14, 'cave'], sunken_grotto: [228, 132, 'cave'],
    wildwood_reserve: [88, 62, 'place'], moonlit_shrine: [217, 79, 'place']
  };
  var FERRY = [['saltmarsh', 'emberisle']];
  // mainland between the playable areas (keeps Lumora one continent instead of separate islands)
  var FILL = [[26, 42, 72, 56], [60, 2, 124, 30], [118, 28, 70, 50], [26, 20, 40, 26]];
  function fillDist(px, py) {
    var best = 1e9;
    FILL.forEach(function (r) {
      var dx = Math.max(r[0] - px, 0, px - (r[0] + r[2] - 1)), dy = Math.max(r[1] - py, 0, py - (r[1] + r[3] - 1));
      best = Math.min(best, Math.sqrt(dx * dx + dy * dy));
    });
    if (best <= 0) return -1;
    return best - 1.5 + (Math.sin(px * 0.7 + py * 0.3) + Math.sin(py * 0.9 - px * 0.45)) * 1.4;
  }

  var layout = null;
  function buildLayout() {
    if (layout) return layout;
    PK.linkMaps();
    var pos = {};
    Object.keys(ROOTS).forEach(function (root) {
      var q = [root];
      pos[root] = { x: ROOTS[root][0], y: ROOTS[root][1] };
      while (q.length) {
        var id = q.shift(), m = PK.buildMap(PK.MAPS[id]), p = pos[id];
        Object.keys(m.edges || {}).forEach(function (side) {
          var e = m.edges[side], t = PK.buildMap(PK.MAPS[e.to]);
          if (pos[e.to] || !t) return;
          var off = e.off || 0, x = p.x, y = p.y;
          if (side === 'n') { x = p.x + off; y = p.y - t.h; }
          if (side === 's') { x = p.x + off; y = p.y + m.h; }
          if (side === 'w') { y = p.y + off; x = p.x - t.w; }
          if (side === 'e') { y = p.y + off; x = p.x + m.w; }
          pos[e.to] = { x: x, y: y };
          q.push(e.to);
        });
      }
    });
    var nodes = [];
    Object.keys(pos).forEach(function (id) {
      var m = PK.MAPS[id], p = pos[id];
      var kind = (m.buildings || []).some(function (b) { return b.k === 'clinic'; }) || id === 'brookhollow' || id === 'crown_summit' ? 'town' : 'route';
      if (id === 'starfall_ruins') kind = 'place';
      nodes.push([id, Math.round(p.x + m.w / 2), Math.round(p.y + m.h / 2), kind]);
    });
    Object.keys(ICONS).forEach(function (id) { if (PK.MAPS[id]) nodes.push([id, ICONS[id][0], ICONS[id][1], ICONS[id][2]]); });
    layout = { pos: pos, nodes: nodes, byId: {} };
    nodes.forEach(function (n) { layout.byId[n[0]] = n; });
    return layout;
  }

  function known(id) {
    var st = PK.game.state, m = PK.MAPS[id];
    if (!m) return false;
    return !m.secret || !!(st.visited[id] || st.flags['seen_' + id]);
  }

  // outdoor map that contains the player (interiors resolve to their door's map)
  function locate(id) {
    var L = buildLayout();
    for (var g = 0; g < 8; g++) {
      if (L.byId[id]) return id;
      var m = PK.MAPS[id];
      if (!m) return null;
      if (m.mapNode) return m.mapNode;
      if (m.exit) { id = m.exit.map; continue; }
      PK.buildMap(m);
      var w = Object.keys(m.warpDefs || {}).map(function (k) { return m.warpDefs[k].to; })[0];
      if (!w) break;
      id = w;
    }
    return L.byId[id] ? id : null;
  }

  // ---------------- terrain rendering ----------------
  function hex(c) { return PK.color.hexToRgb(c); }
  function tileColor(P, ch, x, y) {
    var odd = (x + y) & 1;
    switch (ch) {
      case 'T': return P.leaf ? (odd ? PK.color.shade(P.leaf, -0.28) : PK.color.shade(P.leaf, -0.12)) : P.wall[0];
      case '"': return P.tg ? P.tg[odd ? 1 : 2] : P.g[0];
      case '~': case 'l': return P.water[odd && ch === '~' ? 1 : 2];
      case '=': case '|': return '#b8864e';
      case ':': case 'X': case 'O': return P.path ? P.path[1] : P.g[1];
      case 'g': case 'd': case 'Q': case 'L': case 'k': return P.pave ? P.pave[2] : P.g[2];
      case 'W': return P.wall[odd ? 1 : 2];
      case 'v': return P.wall[2];
      case 'R': case 'r': return '#9a98a0';
      case 'b': return P.leaf ? PK.color.shade(P.leaf, -0.1) : P.g[0];
      case 'i': return '#c4e8f8';
      case 'f': return P.fence || P.g[1];
      case ',': return P.fl ? P.fl[1] : P.g[1];
      default: return P.g[(x * 7 + y * 3) % 5 === 0 ? 2 : 1];
    }
  }
  var imgCache = { key: null, canvas: null };
  function renderTerrain() {
    var L = buildLayout();
    var ids = Object.keys(L.pos).filter(known);
    var key = ids.join(',');
    if (imgCache.key === key) return imgCache.canvas;
    var c = PK.makeCanvas(MW, MH), x = c.getContext('2d');
    var img = x.createImageData(MW, MH), d = img.data;
    var land = new Int16Array(MW * MH).fill(-1);  // index of the map that owns / is nearest to each pixel
    var dist = new Float32Array(MW * MH).fill(1e9);
    function put(px, py, col) {
      if (px < 0 || py < 0 || px >= MW || py >= MH) return;
      var v = hex(col), o = (py * MW + px) * 4;
      d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
    }
    // coastline: land extends a few pixels beyond each area with a wobbly edge
    ids.forEach(function (id, mi) {
      var m = PK.MAPS[id], p = L.pos[id];
      var pad = 7;
      for (var py = p.y - pad; py < p.y + m.h + pad; py++) for (var px = p.x - pad; px < p.x + m.w + pad; px++) {
        if (px < 0 || py < 0 || px >= MW || py >= MH) continue;
        var dx = Math.max(p.x - px, 0, px - (p.x + m.w - 1)), dy = Math.max(p.y - py, 0, py - (p.y + m.h - 1));
        var dd = Math.sqrt(dx * dx + dy * dy) + (Math.sin(px * 0.9 + py * 0.4) + Math.sin(py * 1.3 - px * 0.2)) * 1.1;
        var i = py * MW + px;
        if (dd < dist[i]) { dist[i] = dd; land[i] = mi; }
      }
    });
    // mainland filler counts as land; it takes the look of the nearest area
    for (var fy = 0; fy < MH; fy++) for (var fx = 0; fx < MW; fx++) {
      var fd = fillDist(fx, fy), fi = fy * MW + fx;
      var nd = fd <= 0 ? 0 : 3.9 + fd;
      if (nd <= 5.2 && nd < dist[fi]) {
        dist[fi] = nd;
        if (land[fi] < 0) {
          // nearest area decides the terrain style
          var bestD = 1e9;
          // jitter the lookup so region borders are ragged rather than straight lines
          var jx = fx + Math.sin(fy * 0.45 + fx * 0.1) * 4 + Math.sin(fy * 1.7) * 1.5, jy = fy + Math.sin(fx * 0.38) * 4 + Math.cos(fx * 1.3 + fy * 0.2) * 1.5;
          ids.forEach(function (id, mi) {
            var m = PK.MAPS[id], q = L.pos[id];
            var ddx = Math.max(q.x - jx, 0, jx - (q.x + m.w)), ddy = Math.max(q.y - jy, 0, jy - (q.y + m.h));
            var dd = ddx * ddx + ddy * ddy;
            if (dd < bestD && !PK.MAPS[id].secret) { bestD = dd; land[fi] = mi; }
          });
        }
      }
    }
    // sea
    for (var py = 0; py < MH; py++) for (var px = 0; px < MW; px++) {
      var i2 = py * MW + px;
      var wave = ((px + (py >> 2) * 3) % 11 === 0 && (py % 4 === 0)) ? '#6ab4ea' : ((px * 3 + py * 5) % 7 === 0 ? '#4c96d8' : '#4a90d4');
      if (dist[i2] > 5.2) put(px, py, dist[i2] < 7 ? '#5aa4e0' : wave);
    }
    // land beyond the playable areas (beaches, forests, snowfields)
    for (py = 0; py < MH; py++) for (px = 0; px < MW; px++) {
      var i3 = py * MW + px;
      if (land[i3] < 0 || dist[i3] > 5.2) continue;
      var P = PK.theme(PK.MAPS[ids[land[i3]]].theme);
      var base = P.g ? P.g : ['#6a9a4a', '#88b860', '#a8d080'];
      var col;
      if (dist[i3] > 3.8) col = P.tree === 'pine' ? '#f4f8ff' : '#f0dca8'; // shore
      else if (P.tree === 'round' || P.tree === 'palm' || P.tree === 'dead') {
        // forest canopy: dithered with lighter clumps and a few clearings
        var n1 = Math.sin(px * 0.55 + Math.sin(py * 0.3) * 2) + Math.sin(py * 0.6 - px * 0.2);
        col = n1 > 1.2 ? PK.color.shade(P.leaf, 0.1) : n1 < -1.5 ? (P.g ? P.g[1] : P.leaf) : ((px + py) & 1) ? PK.color.shade(P.leaf, -0.3) : PK.color.shade(P.leaf, -0.12);
      } else if (P.tree === 'pine') col = ((px * 7 + py * 13) % 11 === 0 || (px * 5 + py * 3) % 17 === 0) ? '#5a7a8a' : (((px ^ py) & 7) === 0 ? '#c8d8ec' : '#e4ecf8');
      else if (P.style === 'speck') col = ((px * 5 + py * 7) % 9 === 0) ? base[0] : (((px + py * 3) % 13 === 0) ? base[2] : base[1]);
      else col = base[((px ^ py) & 3) === 0 ? 0 : 1];
      put(px, py, col);
    }
    // the real terrain of each area
    ids.forEach(function (id) {
      var m = PK.buildMap(PK.MAPS[id]), p = L.pos[id], P = PK.theme(m.theme);
      for (var ty = 0; ty < m.h; ty++) for (var tx = 0; tx < m.w; tx++) {
        var ch = m.grid[ty][tx];
        if (m.solid[ty][tx] && (m.buildings || []).length) continue; // buildings drawn next
        put(p.x + tx, p.y + ty, tileColor(P, ch, tx, ty));
      }
      (m.buildings || []).forEach(function (b) {
        if (b.x == null) return;
        var K = PK.BUILDINGS[b.k], roof = b.roof || K.roof;
        for (var by = 0; by < b.h; by++) for (var bx = 0; bx < b.w; bx++) {
          var col = by < Math.ceil(b.h * 0.6) ? (by === 0 ? PK.color.shade(roof, 0.25) : roof) : (K.wall || '#f0e8d8');
          if (bx === 0 || bx === b.w - 1) col = PK.color.shade(col, -0.2);
          put(p.x + b.x + bx, p.y + b.y + by, col);
        }
      });
    });
    // mountains in the north
    x.putImageData(img, 0, 0);
    [[70, 8], [84, 14], [96, 22], [138, 26], [150, 34], [162, 40], [128, 40], [140, 50], [46, 58], [60, 70], [74, 86], [40, 30]].forEach(function (mt) {
      var mx = mt[0], my = mt[1];
      if (land[my * MW + mx] < 0 || dist[my * MW + mx] > 3) return;
      x.fillStyle = '#7a7890'; x.beginPath(); x.moveTo(mx - 6, my + 3); x.lineTo(mx, my - 5); x.lineTo(mx + 6, my + 3); x.fill();
      x.fillStyle = '#a8a6bc'; x.beginPath(); x.moveTo(mx - 6, my + 3); x.lineTo(mx, my - 5); x.lineTo(mx, my + 3); x.fill();
      x.fillStyle = '#ffffff'; x.fillRect(mx - 1, my - 4, 2, 2); x.fillRect(mx - 2, my - 2, 1, 1);
    });
    imgCache = { key: key, canvas: c };
    return c;
  }

  function TownMap(opts, done) {
    this.opaque = true;
    this.opts = opts || {};
    this.done = done;
    var L = buildLayout();
    this.here = locate(PK.world && PK.world.map ? PK.world.map.id : PK.game.state.player.map);
    var start = this.here || 'brookhollow';
    this.list = L.nodes.filter(function (n) { return known(n[0]); });
    if (this.opts.fly) this.list = this.list.filter(function (n) { return n[3] === 'town' && PK.game.state.visited[n[0]] && PK.world.townPoint(PK.MAPS[n[0]]); });
    this.i = Math.max(0, this.list.findIndex(function (n) { return n[0] === start; }));
  }
  TownMap.prototype.update = function () {
    var inp = PK.input, n = this.list.length;
    if (!n) { if (inp.ok() || inp.cancel()) this.close(null); return; }
    var cur = this.list[this.i], best = -1, bd = 1e9;
    var dir = inp.rep('up') ? [0, -1] : inp.rep('down') ? [0, 1] : inp.rep('left') ? [-1, 0] : inp.rep('right') ? [1, 0] : null;
    if (dir) {
      // move to the nearest place in that direction
      this.list.forEach(function (o, j) {
        var dx = o[1] - cur[1], dy = o[2] - cur[2];
        var along = dx * dir[0] + dy * dir[1];
        if (along <= 0) return;
        var d = along + Math.abs(dx * dir[1] + dy * dir[0]) * 2.2;
        if (d < bd) { bd = d; best = j; }
      });
      if (best >= 0) { this.i = best; if (PK.audio) PK.audio.sfx('move'); }
    }
    if (inp.ok() && this.opts.fly) { if (PK.audio) PK.audio.sfx('select'); this.close(cur[0]); }
    else if (inp.cancel() || (inp.ok() && !this.opts.fly)) { if (PK.audio) PK.audio.sfx('back'); this.close(null); }
  };
  TownMap.prototype.close = function (v) { PK.pop(this); this.done(v); };
  TownMap.prototype.draw = function (ctx) {
    var st = PK.game.state, T = PK.ui.THEME, L = buildLayout();
    ctx.drawImage(renderTerrain(), 0, OY);
    // ferry route
    ctx.fillStyle = '#e8f4ff';
    FERRY.forEach(function (f) {
      var a = L.byId[f[0]], b = L.byId[f[1]];
      if (!a || !b || !known(f[1]) || !st.flags.got_ferry) return;
      for (var k = 0; k <= 30; k++) { if (k % 3 === 2) continue; var t = k / 30; ctx.fillRect(Math.round(a[1] + 10 + (b[1] - a[1] - 10) * t), Math.round(OY + a[2] + 6 + (b[2] - a[2] - 6) * t + Math.sin(t * Math.PI) * 6), 1, 1); }
    });
    // places
    L.nodes.forEach(function (n) {
      if (!known(n[0])) return;
      var vis = st.visited[n[0]], x = n[1], y = n[2] + OY;
      if (n[3] === 'town') {
        ctx.fillStyle = '#20182a'; ctx.fillRect(x - 3, y - 3, 7, 7);
        ctx.fillStyle = vis ? '#e84838' : '#b8b8c4'; ctx.fillRect(x - 2, y - 2, 5, 5);
        ctx.fillStyle = vis ? '#ffb0a0' : '#e8e8f0'; ctx.fillRect(x - 2, y - 2, 5, 1);
      } else if (n[3] === 'cave') {
        ctx.fillStyle = '#20182a'; ctx.beginPath(); ctx.moveTo(x - 5, y + 3); ctx.lineTo(x, y - 4); ctx.lineTo(x + 5, y + 3); ctx.fill();
        ctx.fillStyle = '#8a7058'; ctx.beginPath(); ctx.moveTo(x - 3, y + 2); ctx.lineTo(x, y - 2); ctx.lineTo(x + 3, y + 2); ctx.fill();
        ctx.fillStyle = '#20182a'; ctx.fillRect(x - 1, y, 2, 2);
      } else if (n[3] === 'place') {
        ctx.fillStyle = '#20182a'; ctx.fillRect(x - 2, y - 3, 5, 7); ctx.fillRect(x - 3, y - 2, 7, 5);
        ctx.fillStyle = '#f8d048'; ctx.fillRect(x - 1, y - 2, 3, 5); ctx.fillRect(x - 2, y - 1, 5, 3);
      }
    });
    // player position
    if (this.here && L.byId[this.here] && ((PK.frame >> 4) % 3)) {
      var h = L.byId[this.here];
      ctx.drawImage(PK.chars.sprite('player').down[0], h[1] - 8, h[2] + OY - 20);
    }
    // cursor
    var cur = this.list[this.i];
    if (cur) {
      var c = (PK.frame >> 3) & 1, cy = cur[2] + OY;
      ctx.strokeStyle = this.opts.fly ? '#40e0ff' : '#ffe040'; ctx.lineWidth = 1;
      ctx.strokeRect(cur[1] - 7 - c + 0.5, cy - 7 - c + 0.5, 14 + c * 2, 14 + c * 2);
      ctx.strokeStyle = '#20182a';
      ctx.strokeRect(cur[1] - 8 - c + 0.5, cy - 8 - c + 0.5, 16 + c * 2, 16 + c * 2);
    }
    // header
    PK.ui.box(ctx, 0, 0, PK.W, 18);
    var name = cur ? PK.ui.fmt(PK.MAPS[cur[0]].name) : '';
    var lx = 8;
    if (this.opts.fly) { F().draw(ctx, 'FLY TO:', 8, 6, T.dim); lx = 50; }
    F().draw(ctx, F().fit(name, 120), lx, 6, T.text, T.shadow);
    var reg = cur && PK.MAPS[cur[0]].region;
    if (reg) F().right(ctx, F().fit(reg, PK.W - 16 - lx - Math.min(120, F().width(name)) - 8), PK.W - 8, 6, T.dim);
    if (!this.list.length) F().center(ctx, 'No places to travel to yet.', PK.W / 2, 80, '#ffffff', '#000');
    F().draw(ctx, this.opts.fly ? 'A: travel  B: cancel' : 'B: close', 4, PK.H - 9, '#ffffff', '#28304c');
  };

  PK.townMap = function (opts) { return new Promise(function (res) { PK.push(new TownMap(opts, res)); }); };
  PK.mapLayout = buildLayout;
})();

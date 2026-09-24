// Map registry, ASCII map loader and interior templates.
// ASCII markers: digits = building anchors (footprint '#'), NPC letters (a e h j m n o q s u w x y z),
// '*' item, '?' hidden item, '!' step event, '@' spawn, 'O'/'X' warps (row-major order), 'S' signs, 'M' exit mat.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  PK.MAPS = {};
  var NPC_KEYS = 'aehjmnoqsuwxyz';
  var WALKABLE = '.,":gdi=|X';

  function defMap(id, d) {
    d.id = id;
    PK.MAPS[id] = d;
    return d;
  }

  function build(m) {
    if (m.built) return m;
    var rows = m.rows.map(function (r) { return r.split(''); });
    var h = rows.length, w = rows[0].length;
    rows.forEach(function (r, y) { if (r.length !== w) throw new Error('Map ' + m.id + ' row ' + y + ' has width ' + r.length + ' (expected ' + w + ')'); });
    m.w = w; m.h = h;
    var solid = [];
    for (var y = 0; y < h; y++) { solid.push(new Array(w).fill(false)); }
    m.solid = solid;
    m.doors = {};
    m.npcDefs = [];
    m.itemDefs = [];
    m.hiddenDefs = [];
    m.eventDefs = [];
    m.warpDefs = {};
    m.signDefs = {};
    var itemI = 0, hidI = 0, evI = 0, warpI = 0, signI = 0;
    function replace(x, y) {
      var l = x > 0 ? rows[y][x - 1] : null;
      if (l && WALKABLE.indexOf(l) >= 0) return l === '"' ? '.' : l;
      var r = x < w - 1 ? rows[y][x + 1] : null;
      if (r && WALKABLE.indexOf(r) >= 0 && r !== '"') return r;
      return m.interior ? '.' : '.';
    }
    for (y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var c = rows[y][x];
        if (c >= '1' && c <= '9') {
          var b = m.buildings[+c - 1];
          if (!b) throw new Error('Map ' + m.id + ': no building #' + c);
          var K = PK.BUILDINGS[b.k];
          b.x = x; b.y = y; b.w = K.w; b.h = K.h;
          for (var by = 0; by < K.h; by++) for (var bx = 0; bx < K.w; bx++) {
            if (y + by < h && x + bx < w) solid[y + by][x + bx] = true;
          }
          var dx = x + K.door, dy = y + K.h - 1;
          solid[dy][dx] = false;
          m.doors[dx + ',' + dy] = b;
          rows[y][x] = '.';
        } else if (c === '#') rows[y][x] = '.';
        else if (NPC_KEYS.indexOf(c) >= 0) {
          var nd = m.npcs && m.npcs[c];
          if (!nd) throw new Error('Map ' + m.id + ': no npc for marker ' + c + ' at ' + x + ',' + y);
          nd = Object.assign({ key: c }, nd);
          nd.x = x; nd.y = y;
          m.npcDefs.push(nd);
          rows[y][x] = nd.tile || replace(x, y);
        } else if (c === '*') {
          var it = (m.items || [])[itemI];
          if (!it) throw new Error('Map ' + m.id + ': missing item #' + itemI);
          m.itemDefs.push({ x: x, y: y, item: it[0], n: it[1] || 1, key: m.id + ':i' + itemI });
          itemI++;
          rows[y][x] = replace(x, y);
        } else if (c === '?') {
          var hi = (m.hidden || [])[hidI];
          if (!hi) throw new Error('Map ' + m.id + ': missing hidden item #' + hidI);
          m.hiddenDefs.push({ x: x, y: y, item: hi[0], n: hi[1] || 1, key: m.id + ':h' + hidI });
          hidI++;
          rows[y][x] = replace(x, y);
        } else if (c === '!') {
          var ev = (m.events || [])[evI];
          if (!ev) throw new Error('Map ' + m.id + ': missing event #' + evI);
          m.eventDefs.push(Object.assign({ x: x, y: y }, ev));
          evI++;
          rows[y][x] = replace(x, y);
        } else if (c === '@') {
          m.spawn = [x, y];
          rows[y][x] = replace(x, y);
        } else if (c === 'O' || c === 'X') {
          var wp = (m.warps || [])[warpI];
          if (wp) m.warpDefs[x + ',' + y] = { to: wp[0], x: wp[1], y: wp[2], dir: wp[3] };
          warpI++;
        } else if (c === 'S') {
          m.signDefs[x + ',' + y] = (m.signs || [])[signI] || '...';
          signI++;
        }
      }
    }
    m.grid = rows.map(function (r) { return r.join(''); });
    m.tiles = rows;
    m.at = function (x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
      return this.tiles[y][x];
    };
    m.built = true;
    return m;
  }

  // ---------- interior templates ----------
  var IN = {
    house: {
      rows: ['WYWWWWZW', 'KK....pW', '........', '..tt....', '........', 'p......p', '...M....'],
      entry: [3, 6], theme: 'house'
    },
    house2: {
      rows: ['WWYWWYWW', 'Kp....BW', '........', '...tt...', '.......p', 'p.......', '....M...'],
      entry: [4, 6], theme: 'house'
    },
    clinic: {
      rows: ['WWYWWWWWYWW', 'W..HHaHH.CW', 'W.ccccccc.W', 'W.........W', 'Wp.,,,,,.pW', 'W..,,,,,..W', 'W.........W', 'WWWWWMWWWWW'],
      entry: [5, 7], theme: 'clinic'
    },
    shop: {
      rows: ['WWYWWWWYW', 'WKK..DD.W', 'Wac.....W', 'W.c..DD.W', 'W.......W', 'Wp.....pW', 'WWWWMWWWW'],
      entry: [4, 6], theme: 'shop'
    },
    hut: {
      rows: ['WYWWZW', 'K...pW', '......', '.tt...', '......', '..M...'],
      entry: [2, 5], theme: 'house'
    }
  };

  // Create an interior map from a template. opts: {npcs (by marker), name, theme, extra rows override}
  function interior(id, tpl, opts) {
    opts = opts || {};
    var T = IN[tpl];
    var rows = (opts.rows || T.rows).slice();
    var npcs = Object.assign({}, opts.npcs || {});
    if (tpl === 'clinic') {
      npcs.a = { sprite: 'nurse', dir: 'down', talk: 'clinic' };
      if (opts.npcs && opts.npcs.extra) {
        var e = opts.npcs.extra; delete npcs.extra;
        rows[5] = rows[5].slice(0, 1) + 'e' + rows[5].slice(2);
        npcs.e = e;
      }
    }
    if (tpl === 'shop') npcs.a = { sprite: 'clerk', dir: 'right', talk: 'shop', stock: opts.stock };
    // place extra NPCs at requested coords
    (opts.people || []).forEach(function (p, i) {
      var key = 'mnoqsuwxyz'[i];
      var r = rows[p.y].split('');
      r[p.x] = key;
      rows[p.y] = r.join('');
      npcs[key] = p;
    });
    return defMap(id, {
      name: opts.name || 'House',
      interior: true,
      theme: opts.theme || T.theme,
      music: opts.music || (tpl === 'clinic' ? 'clinic' : tpl === 'shop' ? 'shop' : null),
      rows: rows,
      entry: opts.entry || T.entry,
      npcs: npcs,
      items: opts.items,
      signs: opts.signs,
      warps: opts.warps,
      isClinic: tpl === 'clinic',
      parentMusic: true
    });
  }

  // Link building doors to interiors (sets interior exits). Call after all maps are defined.
  function link() {
    Object.keys(PK.MAPS).forEach(function (id) { build(PK.MAPS[id]); });
    Object.keys(PK.MAPS).forEach(function (id) {
      var m = PK.MAPS[id];
      Object.keys(m.doors).forEach(function (key) {
        var b = m.doors[key], p = key.split(',').map(Number);
        if (!b.to) return;
        var t = PK.MAPS[b.to];
        if (!t) { console.warn('Missing interior', b.to, 'for', id); return; }
        t.exit = { map: id, x: p[0], y: p[1] + 1 };
        if (t.parentMusic && !t.music) t.music = m.music;
        if (!t.region) t.region = m.region;
      });
    });
  }

  PK.defMap = defMap;
  PK.buildMap = build;
  PK.interior = interior;
  PK.linkMaps = link;
  PK.INTERIORS = IN;
})();

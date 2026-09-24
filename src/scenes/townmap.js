// Lumora region map: shows where you are, lets you browse places, and picks Wayfinder destinations.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };

  // kind: town | route | cave | place. Coordinates are map-screen pixels.
  var NODES = [
    ['brookhollow', 40, 120, 'town'], ['willow_trail', 40, 102, 'route'], ['pinecrest', 40, 84, 'town'],
    ['mossy_woods', 62, 84, 'route'], ['quarryton', 84, 84, 'town'], ['echo_cavern', 106, 84, 'cave'],
    ['hidden_hollow', 62, 70, 'cave'],
    ['voltmere', 128, 84, 'town'], ['tidewind_trail', 128, 102, 'route'], ['saltmarsh', 128, 120, 'town'],
    ['wildwood_reserve', 108, 120, 'place'],
    ['sunscar_dunes', 152, 120, 'route'], ['dunespire', 176, 120, 'town'], ['ember_tunnels', 190, 104, 'cave'],
    ['mirage_city', 190, 88, 'town'], ['frostpine_trail', 190, 70, 'route'], ['rimeholt', 190, 52, 'town'],
    ['frozen_depths', 168, 52, 'cave'], ['shadefall', 146, 52, 'town'], ['summit_road', 124, 46, 'cave'],
    ['crown_summit', 102, 40, 'town'], ['glacier_grotto', 212, 52, 'cave'],
    ['starfall_sea', 40, 136, 'route'], ['starfall_ruins', 40, 150, 'place'],
    ['emberisle', 172, 144, 'town'], ['emberisle_peak', 188, 138, 'route'],
    ['tidepool_isle', 204, 150, 'route'], ['sunken_grotto', 222, 144, 'cave'], ['hollow_isle', 222, 128, 'town'],
    ['hollow_isle_woods', 222, 112, 'route'], ['moonlit_shrine', 204, 122, 'place']
  ];
  var LINKS = [
    ['brookhollow', 'willow_trail'], ['willow_trail', 'pinecrest'], ['pinecrest', 'mossy_woods'], ['mossy_woods', 'quarryton'],
    ['mossy_woods', 'hidden_hollow'], ['quarryton', 'echo_cavern'], ['echo_cavern', 'voltmere'], ['voltmere', 'tidewind_trail'],
    ['tidewind_trail', 'saltmarsh'], ['saltmarsh', 'wildwood_reserve'], ['saltmarsh', 'sunscar_dunes'], ['sunscar_dunes', 'dunespire'],
    ['dunespire', 'ember_tunnels'], ['ember_tunnels', 'mirage_city'], ['mirage_city', 'frostpine_trail'], ['frostpine_trail', 'rimeholt'],
    ['rimeholt', 'frozen_depths'], ['rimeholt', 'glacier_grotto'], ['frozen_depths', 'shadefall'], ['shadefall', 'summit_road'],
    ['summit_road', 'crown_summit'], ['brookhollow', 'starfall_sea'], ['starfall_sea', 'starfall_ruins'],
    ['saltmarsh', 'emberisle'], ['emberisle', 'emberisle_peak'], ['emberisle', 'tidepool_isle'],
    ['tidepool_isle', 'sunken_grotto'], ['tidepool_isle', 'hollow_isle'], ['hollow_isle', 'hollow_isle_woods'], ['hollow_isle_woods', 'moonlit_shrine']
  ];
  var BY_ID = {};
  NODES.forEach(function (n) { BY_ID[n[0]] = n; });

  // outdoor map that contains the player (interiors resolve to their door's map)
  function locate(id) {
    for (var g = 0; g < 6; g++) {
      if (BY_ID[id]) return id;
      var m = PK.MAPS[id];
      if (!m) return null;
      if (m.mapNode) return m.mapNode;
      if (m.exit) id = m.exit.map;
      else break;
    }
    return BY_ID[id] ? id : null;
  }

  var LAND = [
    // [x, y, w, h, color] rounded blobs
    [22, 64, 132, 76, '#8cc86c'], [110, 96, 102, 36, '#e8d49a'], [84, 28, 140, 36, '#eef2fa'], [168, 60, 36, 44, '#d8c89a'],
    [22, 128, 36, 30, '#a8d88a'], [160, 134, 44, 20, '#a8d88a'], [196, 142, 36, 16, '#e8d49a'], [206, 104, 30, 34, '#8cc86c']
  ];

  function TownMap(opts, done) {
    this.opaque = true;
    this.opts = opts || {};
    this.done = done;
    this.here = locate(PK.world && PK.world.map ? PK.world.map.id : PK.game.state.player.map);
    var start = this.here || 'brookhollow';
    this.list = NODES.filter(function (n) { return PK.MAPS[n[0]] && this.known(n[0]); }, this);
    if (this.opts.fly) this.list = this.list.filter(function (n) { return n[3] === 'town' && PK.game.state.visited[n[0]] && PK.world.townPoint(PK.MAPS[n[0]]); });
    this.i = Math.max(0, this.list.findIndex(function (n) { return n[0] === start; }));
  }
  TownMap.prototype.known = function (id) {
    var st = PK.game.state;
    var m = PK.MAPS[id];
    if (!m) return false;
    if (m.secret && !(st.visited[id] || st.flags['seen_' + id])) return false;
    return true;
  };
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
    var st = PK.game.state, T = PK.ui.THEME;
    // sea
    ctx.fillStyle = '#4a90d0'; ctx.fillRect(0, 0, PK.W, PK.H);
    ctx.fillStyle = '#5aa0dc';
    for (var y = 18; y < PK.H; y += 6) for (var x = ((y / 6) & 1) * 6; x < PK.W; x += 12) ctx.fillRect(x, y, 4, 1);
    // land
    LAND.forEach(function (l) {
      ctx.fillStyle = PK.color.shade(l[4], -0.35);
      ctx.fillRect(l[0] + 3, l[1] + 1, l[2] - 4, l[3]); ctx.fillRect(l[0] + 1, l[1] + 3, l[2], l[3] - 4);
      ctx.fillStyle = l[4];
      ctx.fillRect(l[0] + 3, l[1], l[2] - 6, l[3]); ctx.fillRect(l[0], l[1] + 3, l[2], l[3] - 6); ctx.fillRect(l[0] + 1, l[1] + 1, l[2] - 2, l[3] - 2);
    });
    // mountains in the north
    for (var mx = 90; mx < 220; mx += 14) {
      ctx.fillStyle = '#a8b4c8'; ctx.beginPath(); ctx.moveTo(mx, 36); ctx.lineTo(mx + 6, 28); ctx.lineTo(mx + 12, 36); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(mx + 5, 29, 2, 2);
    }
    var self = this;
    // routes
    LINKS.forEach(function (l) {
      var a = BY_ID[l[0]], b = BY_ID[l[1]];
      if (!self.known(l[0]) || !self.known(l[1])) return;
      ctx.strokeStyle = '#f4ecc8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a[1] + 0.5, a[2] + 0.5); ctx.lineTo(b[1] + 0.5, a[2] + 0.5); ctx.lineTo(b[1] + 0.5, b[2] + 0.5); ctx.stroke();
    });
    // places
    NODES.forEach(function (n) {
      if (!self.known(n[0])) return;
      var vis = st.visited[n[0]];
      var x = n[1], y = n[2];
      if (n[3] === 'town') {
        ctx.fillStyle = '#28304c'; ctx.fillRect(x - 4, y - 4, 9, 9);
        ctx.fillStyle = vis ? '#e84838' : '#a0a0b0'; ctx.fillRect(x - 3, y - 3, 7, 7);
        ctx.fillStyle = vis ? '#ff9a88' : '#c8c8d0'; ctx.fillRect(x - 3, y - 3, 7, 2);
      } else if (n[3] === 'cave') {
        ctx.fillStyle = '#28304c'; ctx.fillRect(x - 3, y - 3, 7, 7);
        ctx.fillStyle = '#6a5040'; ctx.fillRect(x - 2, y - 2, 5, 5);
      } else if (n[3] === 'place') {
        ctx.fillStyle = '#28304c'; ctx.fillRect(x - 3, y - 3, 7, 7);
        ctx.fillStyle = '#f0c040'; ctx.fillRect(x - 2, y - 2, 5, 5);
      } else {
        ctx.fillStyle = '#28304c'; ctx.fillRect(x - 2, y - 2, 5, 5);
        ctx.fillStyle = '#f4ecc8'; ctx.fillRect(x - 1, y - 1, 3, 3);
      }
    });
    // player position
    if (this.here && BY_ID[this.here] && ((PK.frame >> 4) % 3)) {
      var h = BY_ID[this.here];
      ctx.drawImage(PK.chars.sprite('player').down[0], h[1] - 8, h[2] - 18);
    }
    // cursor
    var cur = this.list[this.i];
    if (cur) {
      var c = (PK.frame >> 3) & 1;
      ctx.strokeStyle = this.opts.fly ? '#40e0ff' : '#ffe040'; ctx.lineWidth = 1;
      ctx.strokeRect(cur[1] - 7 - c + 0.5, cur[2] - 7 - c + 0.5, 14 + c * 2, 14 + c * 2);
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

  PK.MAP_NODES = NODES;
  PK.menus = PK.menus || {};
  PK.townMap = function (opts) { return new Promise(function (res) { PK.push(new TownMap(opts, res)); }); };
})();

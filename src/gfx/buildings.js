// Procedurally drawn buildings. Each has a tile footprint and a door tile (dx, h-1).
(function () {
  'use strict';
  var PK = window.PK;
  var sh = function (c, a) { return PK.color.shade(c, a); };

  var KINDS = {
    house: { w: 4, h: 3, door: 1, roofH: 26, roof: '#d0504a', wall: '#f0e6d0' },
    bighouse: { w: 5, h: 4, door: 2, roofH: 34, roof: '#4a78c8', wall: '#f0e6d0' },
    clinic: { w: 5, h: 4, door: 2, roofH: 30, roof: '#34a494', wall: '#f4f8f4', label: 'CLINIC', glass: true },
    shop: { w: 4, h: 3, door: 2, roofH: 22, roof: '#e0802e', wall: '#f4eed8', label: 'SHOP', glass: true },
    gym: { w: 7, h: 5, door: 3, roofH: 40, roof: '#7a6aa8', wall: '#e8e4ee', label: 'GYM', glass: true },
    lab: { w: 7, h: 4, door: 3, roofH: 30, roof: '#8c98a8', wall: '#f4f6fa', label: 'LAB', glass: true },
    league: { w: 9, h: 6, door: 4, roofH: 50, roof: '#6a4a9a', wall: '#ece6f4', label: 'LEAGUE', glass: true, pillars: true },
    spire: { w: 5, h: 7, door: 2, roofH: 30, roof: '#3a2c4a', wall: '#4a3e5c', label: 'SPIRE', glass: true, dark: true },
    hut: { w: 3, h: 3, door: 1, roofH: 24, roof: '#b0783e', wall: '#e8d4b0' },
    ruin: { w: 5, h: 4, door: 2, roofH: 22, roof: '#6a6880', wall: '#9a98ae', pillars: true, stone: true },
    gate: { w: 3, h: 2, door: 1, roofH: 14, roof: '#6a7a8a', wall: '#dcdcd4' }
  };
  PK.BUILDINGS = KINDS;

  var cache = {};

  function draw(kind, opts) {
    opts = opts || {};
    var K = KINDS[kind];
    var key = kind + '|' + (opts.roof || '') + '|' + (opts.snow ? 1 : 0) + '|' + (opts.emblem || '') + '|' + (opts.label || '');
    if (cache[key]) return cache[key];
    var W = K.w * 16, H = K.h * 16;
    var c = PK.makeCanvas(W, H);
    var x = c.getContext('2d');
    var roof = opts.roof || K.roof, wall = opts.wall || K.wall;
    var rH = K.roofH;
    var out = '#1e1a28';
    function f(col, a, b, w, h) { x.fillStyle = col; x.fillRect(a, b, w, h); }

    // walls
    var wy = rH - 2;
    f(out, 1, wy, W - 2, H - wy);
    f(wall, 2, wy, W - 4, H - wy - 1);
    if (K.stone) {
      for (var sy = wy + 3; sy < H - 2; sy += 5)
        for (var sx = 2 + ((sy / 5) & 1) * 4; sx < W - 3; sx += 8) { f(sh(wall, -0.25), sx, sy, 1, 4); f(sh(wall, -0.25), sx - 4 < 2 ? 2 : sx - 4, sy + 4, 8, 1); }
    } else if (K.dark) {
      for (var ly = wy + 6; ly < H - 2; ly += 10) f(sh(wall, 0.2), 2, ly, W - 4, 1);
      for (var lx = 8; lx < W - 4; lx += 16) f(sh(wall, -0.3), lx, wy, 1, H - wy - 1);
    } else {
      for (var py = wy + 4; py < H - 2; py += 4) f(sh(wall, -0.1), 2, py, W - 4, 1);
    }
    f(sh(wall, -0.35), 2, H - 3, W - 4, 2);
    f(sh(wall, 0.3), 2, wy, W - 4, 1);

    // pillars
    if (K.pillars) {
      for (var p = 0; p < K.w; p++) {
        if (p === K.door) continue;
        var cx = p * 16 + 5;
        f(sh(wall, -0.4), cx - 1, wy + 2, 8, H - wy - 4);
        f(sh(wall, 0.25), cx, wy + 2, 6, H - wy - 4);
        f(sh(wall, 0.45), cx + 1, wy + 2, 2, H - wy - 4);
        f(sh(wall, -0.2), cx - 2, wy + 1, 10, 2);
      }
    }

    // windows
    var doorX = K.door * 16;
    var floors = Math.max(1, Math.floor((H - wy - 4) / 16));
    for (var fl = 0; fl < floors; fl++) {
      for (var t = 0; t < K.w; t++) {
        if (K.pillars) break;
        if (fl === floors - 1 && Math.abs(t - K.door) < 1) continue;
        if (kind === 'house' && t === K.w - 1 && fl === 0) continue;
        var wx = t * 16 + 3, wy2 = H - 14 - (floors - 1 - fl) * 16;
        if (wy2 < wy + 2) continue;
        f(out, wx - 1, wy2 - 1, 12, 10);
        f(K.dark ? '#c83a6a' : '#fafafa', wx, wy2, 10, 8);
        f(K.dark ? '#ff7aa8' : '#74b8ec', wx + 1, wy2 + 1, 8, 6);
        f(K.dark ? '#ffc0d8' : '#c4e6ff', wx + 1, wy2 + 1, 3, 2);
        if (!K.dark) { f('#fafafa', wx + 5, wy2 + 1, 1, 6); }
      }
    }

    // door
    var dx = doorX + 2, dy = H - 15;
    f(out, dx - 1, dy - 1, 14, 16);
    if (K.glass) {
      f('#6a7080', dx, dy, 12, 14);
      f('#98d6f0', dx + 1, dy + 1, 4, 12); f('#98d6f0', dx + 7, dy + 1, 4, 12);
      f('#d8f4ff', dx + 1, dy + 1, 2, 4); f('#d8f4ff', dx + 7, dy + 1, 2, 4);
    } else {
      f('#7a4a26', dx, dy, 12, 14);
      f('#9a6436', dx + 1, dy + 1, 10, 6); f('#9a6436', dx + 1, dy + 8, 10, 5);
      f('#f0d060', dx + 9, dy + 7, 1, 2);
    }
    f(sh(wall, -0.5), dx - 1, H - 1, 14, 1);

    // roof
    var ov = 2;
    x.beginPath();
    x.moveTo(-0 + 0.5, rH);
    x.lineTo(W - 0.5, rH);
    x.lineTo(W - 6, 1);
    x.lineTo(6, 1);
    x.closePath();
    x.fillStyle = out; x.fill();
    for (var ry = 2; ry < rH; ry++) {
      var tt = (ry - 1) / (rH - 1);
      var inset = Math.round(6 - 5 * tt) + 1;
      var col = roof;
      var band = (ry - 2) % 5;
      if (band === 4) col = sh(roof, -0.32);
      else if (band === 0) col = sh(roof, 0.18);
      f(col, inset, ry, W - inset * 2, 1);
      if (band !== 4) {
        for (var bx = inset + (((ry - 2) / 5 | 0) % 2) * 4; bx < W - inset; bx += 8) f(sh(roof, -0.2), bx, ry, 1, 1);
      }
    }
    f(sh(roof, 0.45), 7, 2, W - 14, 1);
    f(sh(roof, -0.5), 1, rH - 1, W - 2, 1);
    void ov;

    if (opts.snow) {
      f('#ffffff', 6, 1, W - 12, 3);
      for (var sx2 = 6; sx2 < W - 6; sx2 += 5) f('#ffffff', sx2, 4, 3, 1 + ((sx2 * 7) % 3));
      f('#dfe9f6', 6, 4, W - 12, 1);
    }

    // label board
    var label = opts.label || K.label;
    if (label) {
      var lw = PK.font.width(label) + 8;
      var lx0 = Math.round(W / 2 - lw / 2), ly0 = kind === 'shop' ? rH - 12 : rH - 13;
      if (kind === 'clinic' || kind === 'shop' || kind === 'gate') ly0 = wy + 1;
      if (kind === 'clinic' || kind === 'shop') ly0 = rH - 11;
      f(out, lx0 - 1, ly0 - 1, lw + 2, 11);
      f(K.dark ? '#2a1a30' : '#fbfbf4', lx0, ly0, lw, 9);
      PK.font.draw(x, label, lx0 + 4, ly0 + 1, K.dark ? '#ff5a8a' : sh(roof, -0.3));
    }
    if (kind === 'clinic') {
      // leaf-heart emblem
      var ex = W / 2 - 4, ey = 6;
      f('#ffffff', ex - 1, ey - 1, 10, 9);
      PK.font.draw(x, '♥', ex, ey, '#34a494');
    }
    if (opts.emblem || kind === 'gym') {
      var ec = opts.emblem || '#f0d060';
      var cx2 = W / 2, cy2 = 12;
      x.fillStyle = out;
      x.beginPath(); x.moveTo(cx2, cy2 - 8); x.lineTo(cx2 + 8, cy2); x.lineTo(cx2, cy2 + 8); x.lineTo(cx2 - 8, cy2); x.closePath(); x.fill();
      x.fillStyle = ec;
      x.beginPath(); x.moveTo(cx2, cy2 - 6); x.lineTo(cx2 + 6, cy2); x.lineTo(cx2, cy2 + 6); x.lineTo(cx2 - 6, cy2); x.closePath(); x.fill();
      f(sh(ec, 0.5), cx2 - 1, cy2 - 4, 2, 3);
    }
    cache[key] = c;
    return c;
  }

  PK.buildings = { draw: draw, KINDS: KINDS };
})();

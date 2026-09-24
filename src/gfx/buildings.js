// Procedurally drawn buildings in a GBA-era style: big shingled roofs with overhangs, plain walls,
// paned windows and wooden or glass doors. Each has a tile footprint and a door tile (door, h-1).
(function () {
  'use strict';
  var PK = window.PK;
  var sh = function (c, a) { return PK.color.shade(c, a); };

  var KINDS = {
    house: { w: 4, h: 3, door: 1, roofH: 30, roof: '#d8504a', wall: '#f4ecd8', chimney: true },
    bighouse: { w: 5, h: 4, door: 2, roofH: 40, roof: '#4a78c8', wall: '#f4ecd8', chimney: true },
    clinic: { w: 5, h: 4, door: 2, roofH: 34, roof: '#2fa892', wall: '#f8faf6', label: 'CLINIC', glass: true },
    shop: { w: 4, h: 3, door: 2, roofH: 26, roof: '#3a78d0', wall: '#f6f0dc', label: 'SHOP', glass: true },
    gym: { w: 7, h: 5, door: 3, roofH: 44, roof: '#7a6aa8', wall: '#ece8f0', label: 'GYM', glass: true, flat: true },
    lab: { w: 7, h: 4, door: 3, roofH: 32, roof: '#7c8ca4', wall: '#f6f8fc', label: 'LAB', glass: true, flat: true },
    league: { w: 9, h: 6, door: 4, roofH: 54, roof: '#6a4a9a', wall: '#ece6f4', label: 'LEAGUE', glass: true, pillars: true },
    spire: { w: 5, h: 7, door: 2, roofH: 30, roof: '#3a2c4a', wall: '#4a3e5c', label: 'SPIRE', glass: true, dark: true, flat: true },
    hut: { w: 3, h: 3, door: 1, roofH: 28, roof: '#b0783e', wall: '#ecd8b4', chimney: true },
    ruin: { w: 5, h: 4, door: 2, roofH: 22, roof: '#6a6880', wall: '#9a98ae', pillars: true, stone: true },
    gate: { w: 3, h: 2, door: 1, roofH: 16, roof: '#5a7a8a', wall: '#e4e4dc', glass: true }
  };
  PK.BUILDINGS = KINDS;

  var cache = {};
  var OUT = '#1e1a28';

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
    function f(col, a, b, w, h) { x.fillStyle = col; x.fillRect(a, b, w, h); }

    // ---------- walls ----------
    var wy = rH - 4, wl = 3, wr = W - 3;
    f(OUT, wl - 1, wy, wr - wl + 2, H - wy);
    f(wall, wl, wy, wr - wl, H - wy - 1);
    if (K.stone) {
      for (var sy = wy + 3; sy < H - 2; sy += 5)
        for (var sx = wl + ((sy / 5) & 1) * 4; sx < wr - 1; sx += 8) { f(sh(wall, -0.25), sx, sy, 1, 4); f(sh(wall, -0.25), Math.max(wl, sx - 4), sy + 4, 8, 1); }
    } else if (K.dark) {
      for (var ly = wy + 6; ly < H - 2; ly += 10) f(sh(wall, 0.2), wl, ly, wr - wl, 1);
      for (var lx = 8; lx < W - 4; lx += 16) f(sh(wall, -0.3), lx, wy, 1, H - wy - 1);
    }
    f(sh(wall, 0.25), wl, wy, 1, H - wy - 1);                 // lit left edge
    f(sh(wall, -0.18), wr - 2, wy, 2, H - wy - 1);             // shaded right edge
    f(sh(wall, -0.3), wl, wy, wr - wl, 3);                     // shadow under the roof
    f(sh(K.stone ? wall : '#a8a098', -0.1), wl, H - 4, wr - wl, 3); // foundation
    f(sh('#a8a098', -0.35), wl, H - 4, wr - wl, 1);

    // pillars
    if (K.pillars) {
      for (var p = 0; p < K.w; p++) {
        if (p === K.door) continue;
        var cx = p * 16 + 5;
        f(sh(wall, -0.4), cx - 1, wy + 2, 8, H - wy - 5);
        f(sh(wall, 0.25), cx, wy + 2, 6, H - wy - 5);
        f(sh(wall, 0.45), cx + 1, wy + 2, 2, H - wy - 5);
        f(sh(wall, -0.2), cx - 2, wy + 1, 10, 2);
      }
    }

    // ---------- windows ----------
    var floors = Math.max(1, Math.floor((H - wy - 6) / 16));
    for (var fl = 0; fl < floors; fl++) {
      for (var t = 0; t < K.w; t++) {
        if (K.pillars) break;
        if (fl === floors - 1 && Math.abs(t - K.door) < 1) continue;
        var wx = t * 16 + 3, wy2 = H - 15 - (floors - 1 - fl) * 16;
        if (wy2 < wy + 3) continue;
        if (t === 0) wx += 1;
        if (t === K.w - 1) wx -= 1;
        f(OUT, wx - 1, wy2 - 1, 12, 11);
        f(K.dark ? '#3a2438' : '#fcfcfc', wx, wy2, 10, 9);
        f(K.dark ? '#c83a6a' : '#6cb4ea', wx + 1, wy2 + 1, 8, 7);
        f(K.dark ? '#ff7aa8' : '#9ad0f6', wx + 1, wy2 + 1, 8, 3);
        f(K.dark ? '#ffc0d8' : '#d8f0ff', wx + 1, wy2 + 1, 2, 2);
        if (!K.dark) { f('#fcfcfc', wx + 5, wy2 + 1, 1, 7); f('#fcfcfc', wx + 1, wy2 + 4, 8, 1); }
        if (!K.glass && !K.dark && !K.stone) {
          // flower box
          f(OUT, wx - 1, wy2 + 9, 12, 3);
          f('#a86a3a', wx, wy2 + 9, 10, 2);
          f('#e84848', wx + 1, wy2 + 8, 2, 1); f('#f8d040', wx + 4, wy2 + 8, 2, 1); f('#f070b0', wx + 7, wy2 + 8, 2, 1);
        }
      }
    }

    // ---------- door ----------
    var dx = K.door * 16 + 2, dy = H - 15;
    f(OUT, dx - 1, dy - 1, 14, 16);
    if (K.glass) {
      f('#58606e', dx, dy, 12, 14);
      f('#8cd0f0', dx + 1, dy + 1, 4, 12); f('#8cd0f0', dx + 7, dy + 1, 4, 12);
      f('#d8f4ff', dx + 1, dy + 1, 2, 5); f('#d8f4ff', dx + 7, dy + 1, 2, 5);
      f('#3a404c', dx + 5, dy, 2, 14);
    } else {
      f('#7a4a26', dx, dy, 12, 14);
      f('#a06a3a', dx + 1, dy + 1, 10, 6); f('#a06a3a', dx + 1, dy + 8, 10, 5);
      f('#c08a52', dx + 1, dy + 1, 10, 1);
      f('#f0d060', dx + 9, dy + 7, 1, 2);
    }
    f(sh('#a8a098', -0.2), dx - 2, H - 2, 16, 2); // step

    // ---------- roof ----------
    var top = K.chimney ? 3 : 1;
    if (K.chimney) {
      var chx = W - 20;
      f(OUT, chx - 1, 0, 9, rH - 8);
      f('#a85a44', chx, 1, 7, rH - 10);
      f('#c8785a', chx, 1, 2, rH - 10);
      f('#7a3a2a', chx, 3, 7, 1);
    }
    // silhouette: slightly tapered towards the ridge, with a 1px overhang past the walls
    for (var ry = top; ry < rH; ry++) {
      var tt = (ry - top) / Math.max(1, rH - top - 1);
      var inset = K.flat ? 1 : Math.round(4 * (1 - tt));
      f(OUT, inset, ry, W - inset * 2, 1);
    }
    f(OUT, 3, top - 1, W - 6, 1);
    for (var r2 = top + 1; r2 < rH - 1; r2++) {
      var t2 = (r2 - top) / Math.max(1, rH - top - 1);
      var in2 = (K.flat ? 1 : Math.round(4 * (1 - t2))) + 1;
      var band = (r2 - top - 1) % 4;
      var col = band === 3 ? sh(roof, -0.3) : band === 0 ? sh(roof, 0.12) : roof;
      var grad = 0.14 * (1 - t2); // lighter near the ridge
      f(sh(col, grad), in2, r2, W - in2 * 2, 1);
      if (band === 1) {
        var stagger = (((r2 - top - 1) / 4) | 0) % 2 ? 3 : 0;
        for (var bx = in2 + stagger; bx < W - in2; bx += 6) f(sh(roof, -0.22), bx, r2, 1, 2);
      }
    }
    // ridge highlight and the eave (lip) at the bottom
    f(sh(roof, 0.5), 5, top + 1, W - 10, 1);
    f(sh(roof, -0.45), 2, rH - 3, W - 4, 2);
    f(sh(roof, 0.2), 2, rH - 3, W - 4, 1);
    f(OUT, 1, rH - 1, W - 2, 1);

    if (opts.snow) {
      f('#ffffff', 4, top, W - 8, 4);
      for (var sx2 = 4; sx2 < W - 4; sx2 += 5) f('#ffffff', sx2, top + 4, 3, 1 + ((sx2 * 7) % 3));
      f('#dfe9f6', 4, top + 4, W - 8, 1);
      f('#ffffff', 2, rH - 4, W - 4, 1);
    }

    // label board
    var label = opts.label || K.label;
    if (label) {
      var lw = PK.font.width(label) + 8;
      var lx0 = Math.round(W / 2 - lw / 2), ly0 = rH - 15;
      if (kind === 'gate') ly0 = rH - 13;
      f(OUT, lx0 - 1, ly0 - 1, lw + 2, 11);
      f(K.dark ? '#2a1a30' : '#fbfbf4', lx0, ly0, lw, 9);
      f(K.dark ? '#1a1020' : '#d8d8cc', lx0, ly0 + 8, lw, 1);
      PK.font.draw(x, label, lx0 + 4, ly0 + 1, K.dark ? '#ff5a8a' : sh(roof, -0.35));
    }
    if (kind === 'clinic') {
      // leaf-heart emblem on the roof
      var ex = W / 2 - 4, ey = 5;
      f(OUT, ex - 2, ey - 2, 12, 11);
      f('#ffffff', ex - 1, ey - 1, 10, 9);
      PK.font.draw(x, '♥', ex, ey, '#2fa892');
    }
    if (opts.emblem || kind === 'gym') {
      var ec = opts.emblem || '#f0d060';
      var cx2 = W / 2, cy2 = 13;
      x.fillStyle = OUT;
      x.beginPath(); x.moveTo(cx2, cy2 - 9); x.lineTo(cx2 + 9, cy2); x.lineTo(cx2, cy2 + 9); x.lineTo(cx2 - 9, cy2); x.closePath(); x.fill();
      x.fillStyle = ec;
      x.beginPath(); x.moveTo(cx2, cy2 - 7); x.lineTo(cx2 + 7, cy2); x.lineTo(cx2, cy2 + 7); x.lineTo(cx2 - 7, cy2); x.closePath(); x.fill();
      f(sh(ec, 0.5), cx2 - 1, cy2 - 5, 2, 4);
    }
    cache[key] = c;
    return c;
  }

  PK.buildings = { draw: draw, KINDS: KINDS };
})();

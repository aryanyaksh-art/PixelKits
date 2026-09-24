// Terrain tiles: drawn procedurally per regional theme. 16x16 each.
(function () {
  'use strict';
  var PK = window.PK;
  var S = 16;

  // Tile behaviour table (character -> properties)
  var TILE = {
    '.': {}, ',': {}, '"': { grass: 1 }, ':': {}, 'g': {}, 'd': {}, '=': {}, '|': {}, 'X': {}, 'O': {}, 'M': {},
    'T': { solid: 1 }, '~': { solid: 1, water: 1 }, 'v': { solid: 1, ledge: 1 }, 'f': { solid: 1 },
    'S': { solid: 1, sign: 1 }, 'b': { solid: 1, cut: 1 }, 'r': { solid: 1, smash: 1 }, 'R': { solid: 1 },
    'W': { solid: 1 }, 'l': { solid: 1, lava: 1 }, 'i': { ice: 1 }, 'k': { solid: 1 }, 'L': { solid: 1 },
    'c': { solid: 1, counter: 1 }, 't': { solid: 1 }, 'B': { solid: 1 }, 'K': { solid: 1, shelf: 1 },
    'p': { solid: 1 }, 'C': { solid: 1, pc: 1 }, 'H': { solid: 1, counter: 1 }, 'D': { solid: 1, shelf: 1 },
    'Q': { solid: 1, statue: 1 }, 'Y': { solid: 1 }, 'Z': { solid: 1 }, ' ': { solid: 1 }
  };
  PK.TILE = TILE;

  var TH = {
    vale: { style: 'grass', g: ['#3e8c3b', '#5fb04a', '#8ccf5e'], tg: ['#1d6630', '#2f873d', '#56b052', '#94db70'], path: ['#a67c4a', '#c9a26b', '#e2c18c'], tree: 'round', leaf: '#3f9e47', trunk: '#7a5230', water: ['#2c5cb4', '#3f82da', '#76b0f0', '#d9eeff'], wall: ['#5f5040', '#86705a', '#ab9478'], fence: '#f2eee4', fl: ['#ffffff', '#ee5a5a', '#f6cf3a', '#f08ad0'], pave: ['#8c8886', '#b2aea8', '#cdc8c0'] },
    coast: { style: 'grass', g: ['#6f9a3a', '#93bd50', '#bcd872'], tg: ['#3f6e22', '#5a8e2e', '#80b440', '#b6dc6a'], path: ['#cdb27a', '#e4cc92', '#f5e6b8'], tree: 'palm', leaf: '#46a44a', trunk: '#9a6a3a', water: ['#1b6db6', '#2b92da', '#68c2f2', '#e0f6ff'], wall: ['#7a6048', '#a5845e', '#c7a67c'], fence: '#ffffff', fl: ['#ffffff', '#ff7a4a', '#f8e04a', '#6ad0ff'], pave: ['#9a948c', '#c0b8ae', '#dcd4c8'] },
    desert: { style: 'speck', g: ['#c89c58', '#e0bc76', '#f2d89a'], tg: ['#7c5e26', '#9e8036', '#c2a24e', '#e2cc74'], path: ['#b08850', '#c89e62', '#dcb67c'], tree: 'cactus', leaf: '#4a984a', trunk: '#6a4a2a', water: ['#1b6db6', '#2b92da', '#68c2f2', '#e0f6ff'], wall: ['#8a5a36', '#b0744a', '#cf9a66'], fence: '#c8a070', fl: ['#f8f0d0', '#e87040', '#f8d040', '#d070c0'], pave: ['#a89a84', '#c4b8a0', '#dcd2bc'] },
    snow: { style: 'speck', g: ['#b4c6e0', '#e0eaf6', '#ffffff'], tg: ['#56789a', '#7a9cba', '#a6c4dc', '#d8ecf8'], path: ['#98a4b8', '#bac4d4', '#d6dee8'], tree: 'pine', leaf: '#2f6e5a', trunk: '#6a4a36', water: ['#2a5a9a', '#3d78bc', '#78a8da', '#e8f4ff'], wall: ['#5a6478', '#7c889e', '#a6b2c6'], fence: '#8a6a4a', fl: ['#ffffff', '#a0d0ff', '#f0f8ff', '#c8b0f0'], pave: ['#8a92a0', '#aab2c0', '#c8d0dc'] },
    spooky: { style: 'grass', g: ['#474766', '#5c5c80', '#7a7aa0'], tg: ['#241f3a', '#38325a', '#544c82', '#7c74ac'], path: ['#665862', '#82727e', '#9e8e9a'], tree: 'dead', leaf: '#5a4a6a', trunk: '#4a3a44', water: ['#26265a', '#36367a', '#5656a0', '#9a9ad0'], wall: ['#3a3646', '#534e62', '#6e6880'], fence: '#6a6070', fl: ['#d0c8f0', '#a070d0', '#70e0c0', '#f0a0d0'], pave: ['#5c5866', '#767282', '#908c9c'] },
    cave: { style: 'cave', g: ['#64503e', '#806a54', '#9c866c'], tg: ['#4a3a2c', '#64503e', '#806a54', '#9c866c'], path: ['#56463a', '#725e4a', '#8c7660'], tree: 'stal', leaf: '#806a54', trunk: '#5c4a3a', water: ['#1c3c6c', '#2a5a96', '#4c80c0', '#9cc4ec'], wall: ['#3a2e26', '#584638', '#78624c'], fence: '#8a6a4a', fl: ['#a09080', '#c0b0a0', '#807060', '#b0a090'], pave: ['#5c5040', '#78685a', '#907e6c'] },
    ice: { style: 'cave', g: ['#7496bc', '#96b6d6', '#bcd6ee'], tg: ['#4c6e94', '#6a8cb2', '#8cacd0', '#b4d0ec'], path: ['#6a88ac', '#86a4c6', '#a4c0de'], tree: 'crystal', leaf: '#9ad8f0', trunk: '#5a7aa2', water: ['#1c3c6c', '#2a5a96', '#4c80c0', '#9cc4ec'], wall: ['#3a5478', '#56749c', '#82a2c6'], fence: '#8aa0c0', fl: ['#e0f4ff', '#a8e0ff', '#ffffff', '#c8e8ff'], pave: ['#6a88ac', '#86a4c6', '#a4c0de'] },
    volcano: { style: 'cave', g: ['#462c2c', '#603a34', '#7c4e46'], tg: ['#301c1c', '#462c2c', '#603a34', '#7c4e46'], path: ['#3a2424', '#543232', '#6e4440'], tree: 'stal', leaf: '#603a34', trunk: '#3a2424', water: ['#a02a10', '#d04a14', '#f08a2a', '#ffd060'], wall: ['#261616', '#402426', '#5c3634'], fence: '#5c3634', fl: ['#f08a2a', '#ffd060', '#d04a14', '#ffb040'], pave: ['#3a2424', '#543232', '#6e4440'] },
    ruins: { style: 'stone', g: ['#646274', '#827f92', '#a4a2b4'], tg: ['#3c5a4a', '#4e7a5c', '#6a9c72', '#94c08c'], path: ['#5a586a', '#747284', '#8e8c9e'], tree: 'crystal', leaf: '#c8a0ff', trunk: '#5a4a7a', water: ['#2a4a8a', '#3a64b0', '#6a94d8', '#c8dcff'], wall: ['#403e4c', '#5c5a6a', '#7c7a8c'], fence: '#8a889a', fl: ['#e8d0ff', '#ffe890', '#a0f0e0', '#ffffff'], pave: ['#8a8070', '#a89c88', '#c8bca4'] },
    house: { style: 'wood', floor: ['#9a6a3a', '#bc8850', '#d6a66a'], wall: ['#c4b494', '#e2d4b6', '#f4ecd8'], trim: '#6a4424', rug: ['#8a2e36', '#b8484e', '#e0807a'] },
    lab: { style: 'tile', floor: ['#b0b6c4', '#d4d8e4', '#eef0f6'], wall: ['#9eb0c4', '#c2d0de', '#e0eaf4'], trim: '#4a5a72', rug: ['#2e5a8a', '#4a7ab0', '#7aa6d8'] },
    clinic: { style: 'tile', floor: ['#c4b4bc', '#e6d8de', '#f8f0f4'], wall: ['#aed4ca', '#cdeae2', '#e8f8f2'], trim: '#2e8474', rug: ['#2e8474', '#48a494', '#7ccab8'] },
    shop: { style: 'tile', floor: ['#b4bca2', '#d4dac2', '#eef2e0'], wall: ['#d4c49a', '#eadcb8', '#f8f0da'], trim: '#b8682a', rug: ['#b8682a', '#d8884a', '#f0b078'] },
    league: { style: 'marble', floor: ['#a8a0b8', '#cac4d8', '#ecE8f6'], wall: ['#6a5a8a', '#86769e', '#a898c0'], trim: '#d8b04a', rug: ['#8a1e3a', '#b0304e', '#d85a70'] },
    spire: { style: 'metal', floor: ['#3a3448', '#4e4660', '#665c7c'], wall: ['#241e30', '#362e46', '#4c4260'], trim: '#c03a5a', rug: ['#5a1a3a', '#802a50', '#a84070'] }
  };
  PK.THEMES = TH;

  // Type-colored gym interiors are generated on demand
  function theme(name) {
    if (TH[name]) return TH[name];
    if (name.indexOf('gym_') === 0) {
      var ty = PK.TYPES && PK.TYPES[name.slice(4)];
      var c = ty ? ty.color : '#8888a0';
      var sh = PK.color.shade;
      var t = { style: 'tile', floor: [sh(c, -0.25), sh(c, 0.35), sh(c, 0.6)], wall: [sh(c, -0.55), sh(c, -0.35), sh(c, -0.1)], trim: sh(c, -0.7), rug: [sh(c, -0.4), c, sh(c, 0.3)] };
      // gyms also need outdoor-style entries for grass/water/etc used as puzzle features
      var base = TH.vale;
      for (var k in base) if (!t[k]) t[k] = base[k];
      if (name === 'gym_Frost') t.water = TH.snow.water;
      if (name === 'gym_Blaze') t.water = TH.volcano.water;
      TH[name] = t;
      return t;
    }
    return TH.vale;
  }
  PK.theme = theme;

  var INTERIOR = { wood: 1, tile: 1, marble: 1, metal: 1 };

  function fill(x, c, a, b, w, h) { x.fillStyle = c; x.fillRect(a || 0, b || 0, w == null ? S : w, h == null ? S : h); }
  function dot(x, c, a, b) { x.fillStyle = c; x.fillRect(a, b, 1, 1); }

  function groundBase(x, P, r) {
    if (INTERIOR[P.style]) return floorBase(x, P, r);
    var g = P.g;
    fill(x, g[1]);
    var k;
    if (P.style === 'grass') {
      for (k = 0; k < 3; k++) {
        var tx = 1 + r.int(12), ty = 2 + r.int(12);
        dot(x, g[0], tx, ty); dot(x, g[0], tx + 2, ty); dot(x, g[0], tx + 1, ty + 1);
      }
      for (k = 0; k < 3; k++) dot(x, g[2], r.int(16), r.int(16));
    } else if (P.style === 'speck') {
      for (k = 0; k < 5; k++) dot(x, g[0], r.int(16), r.int(16));
      for (k = 0; k < 5; k++) dot(x, g[2], r.int(16), r.int(16));
      if (r() < 0.5) { var sx = r.int(13), sy = r.int(14); dot(x, g[0], sx, sy); dot(x, g[0], sx + 1, sy); dot(x, g[2], sx, sy - 1 < 0 ? 0 : sy - 1); }
    } else if (P.style === 'cave') {
      for (k = 0; k < 6; k++) dot(x, g[0], r.int(16), r.int(16));
      for (k = 0; k < 4; k++) dot(x, g[2], r.int(16), r.int(16));
      if (r() < 0.6) { var px = 2 + r.int(11), py = 2 + r.int(11); fill(x, g[0], px, py + 1, 3, 1); fill(x, g[2], px, py, 2, 1); }
    } else if (P.style === 'stone') {
      fill(x, g[0], 0, 7, 16, 1); fill(x, g[0], 0, 15, 16, 1);
      fill(x, g[0], 7, 0, 1, 7); fill(x, g[0], 3, 8, 1, 7); fill(x, g[0], 12, 8, 1, 7);
      fill(x, g[2], 0, 0, 7, 1); fill(x, g[2], 8, 0, 8, 1); fill(x, g[2], 0, 8, 3, 1); fill(x, g[2], 4, 8, 8, 1); fill(x, g[2], 13, 8, 3, 1);
      for (k = 0; k < 3; k++) dot(x, g[0], r.int(16), r.int(16));
    }
  }

  function floorBase(x, P, r) {
    var f = P.floor;
    fill(x, f[1]);
    var k;
    if (P.style === 'wood') {
      for (k = 0; k < 4; k++) fill(x, f[0], 0, k * 4 + 3, 16, 1);
      for (k = 0; k < 4; k++) { var sx = (k * 7 + 3) % 16; fill(x, f[0], sx, k * 4, 1, 3); }
      for (k = 0; k < 4; k++) fill(x, f[2], 0, k * 4, 16, 1);
      for (k = 0; k < 2; k++) dot(x, f[0], r.int(16), r.int(16));
    } else if (P.style === 'tile' || P.style === 'marble') {
      fill(x, f[0], 0, 15, 16, 1); fill(x, f[0], 15, 0, 1, 16);
      fill(x, f[2], 0, 0, 15, 1); fill(x, f[2], 0, 0, 1, 15);
      if (P.style === 'marble') { dot(x, f[0], 4, 5); dot(x, f[0], 5, 6); dot(x, f[0], 6, 6); dot(x, f[0], 10, 10); dot(x, f[0], 11, 11); }
      else { fill(x, f[2], 5, 5, 5, 5); fill(x, f[1], 6, 6, 3, 3); }
    } else if (P.style === 'metal') {
      fill(x, f[0], 0, 7, 16, 1); fill(x, f[0], 7, 0, 1, 16);
      fill(x, f[2], 0, 0, 16, 1); fill(x, f[2], 0, 8, 16, 1);
      dot(x, f[2], 2, 2); dot(x, f[2], 12, 2); dot(x, f[2], 2, 12); dot(x, f[2], 12, 12);
    }
  }

  function pg(w, h) { return new PK.PG(w || S, h || S); }
  function ramp(c) { return PK.color.ramp(c); }

  function drawTree(x, P, r, frame) {
    var g = pg(), kind = P.tree, lf = ramp(P.leaf), tr = ramp(P.trunk);
    if (kind === 'round') {
      g.rect(6, 11, 4, 4, 1, { hgrad: 1 });
      g.ellipse(8, 7, 6.6, 5.8, 0);
      g.ellipse(5, 8.5, 3.4, 3, 0, { bias: -0.05 });
      g.ellipse(11, 8.5, 3.4, 3, 0, { bias: -0.08 });
      g.ellipse(8, 4.5, 4, 3, 0, { bias: 0.08 });
      x.drawImage(g.render([lf, tr]), 0, 0);
    } else if (kind === 'pine') {
      var sn = ['#b8cce4', '#dbe8f6', '#ffffff', '#ffffff'];
      g.rect(7, 12, 2, 3, 1);
      g.poly([[8, 0.5], [13.5, 6.5], [2.5, 6.5]], 0);
      g.poly([[8, 3.5], [14.5, 10.5], [1.5, 10.5]], 0);
      g.poly([[8, 6.5], [15, 13.5], [1, 13.5]], 0);
      g.poly([[8, 0.5], [10.5, 3.5], [5.5, 3.5]], 2, { light: 0.7 });
      g.poly([[8, 4], [11, 6.5], [5, 6.5]], 2, { light: 0.6 });
      g.poly([[3, 10.2], [5, 9], [7, 10.2]], 2, { light: 0.55 });
      g.poly([[9, 10.2], [11, 9], [13, 10.2]], 2, { light: 0.55 });
      x.drawImage(g.render([lf, tr, sn]), 0, 0);
    } else if (kind === 'palm') {
      g.curve(6, 15, 7, 9, 9, 5, 1, 1.4, 1.1);
      var fr = [[1, 7], [3, 3], [8, 1.5], [13, 3], [15, 7.5], [12, 9]];
      for (var i = 0; i < fr.length; i++) g.curve(9, 5, (9 + fr[i][0]) / 2, Math.min(5, fr[i][1]) - 1.5, fr[i][0], fr[i][1] + 1, 0, 1.4, 0.6);
      g.ellipse(9, 5.5, 1.6, 1.3, 2, { light: 0.4 });
      x.drawImage(g.render([lf, tr, ramp('#7a5a30')]), 0, 0);
    } else if (kind === 'cactus') {
      g.ellipse(8, 8, 2.8, 6.8, 0);
      g.rect(5.5, 9, 5, 5.5, 0, { light: 0.5 });
      g.line(4, 9, 3, 5, 0, 1.3, 1.1);
      g.line(5, 10, 3.5, 10, 0, 1.2);
      g.line(12, 7, 13, 3.5, 0, 1.3, 1.1);
      g.line(11, 8, 12.5, 8, 0, 1.2);
      x.drawImage(g.render([lf]), 0, 0);
      dot(x, '#f8f0c0', 7, 4); dot(x, '#f8f0c0', 9, 8); dot(x, '#f8f0c0', 7, 11);
      if (r() < 0.5) { dot(x, '#f070a0', 8, 1); dot(x, '#f8a0c0', 7, 1); }
    } else if (kind === 'dead') {
      g.line(8, 15, 8, 5, 1, 1.6, 1);
      g.line(8, 8, 3, 4, 1, 1, 0.5);
      g.line(8, 7, 13, 3, 1, 1, 0.5);
      g.line(8, 5, 6, 1, 1, 0.8, 0.4);
      g.line(10.5, 5, 12, 6.5, 1, 0.6, 0.4);
      g.ellipse(4, 3.5, 2, 1.5, 0, { bias: -0.1 });
      g.ellipse(12.5, 2.5, 2.2, 1.6, 0, { bias: -0.1 });
      x.drawImage(g.render([lf, tr]), 0, 0);
    } else if (kind === 'crystal') {
      var cr = ramp(P.leaf);
      g.poly([[8, 1], [11, 6], [10, 14], [6, 14], [5, 6]], 0);
      g.poly([[3, 7], [5, 9], [5, 14], [2, 14], [1.5, 10]], 0, { light: 0.45 });
      g.poly([[13, 5], [14.5, 9], [14, 14], [11, 14], [11, 8]], 0, { light: 0.55 });
      x.drawImage(g.render([cr.concat(['#ffffff'])]), 0, 0);
      dot(x, '#ffffff', 7, 4); dot(x, '#ffffff', 7, 5);
    } else { // stalagmite rock column
      g.poly([[8, 1], [12.5, 14.5], [3.5, 14.5]], 0);
      g.poly([[12, 7], [15, 14.5], [10, 14.5]], 0, { light: 0.4 });
      x.drawImage(g.render([ramp(P.wall[2])]), 0, 0);
    }
  }

  function tallGrass(x, P, frame) {
    var t = P.tg;
    var pat = [
      '..3...3.',
      '.323.323',
      '32223222',
      '22122212',
      '21112111',
      '11011101',
      '10000100',
      '11111111'
    ];
    fill(x, t[1]);
    var map = { '0': t[0], '1': t[1], '2': t[2], '3': t[3], '.': P.style === 'cave' ? t[1] : t[1] };
    for (var q = 0; q < 4; q++) {
      var ox = (q % 2) * 8 + ((q >> 1) ? 4 : 0), oy = (q >> 1) * 8;
      PK.paintRows(x, pat, map, ox % 16, oy);
      if (ox + 8 > 16) PK.paintRows(x, pat, map, ox - 16, oy);
    }
  }

  function water(x, P, frame, r) {
    var w = P.water;
    fill(x, w[1]);
    var marks = [[2, 3], [9, 6], [4, 11], [12, 13]];
    for (var i = 0; i < marks.length; i++) {
      var mx = (marks[i][0] + frame * 2 + i) % 16, my = marks[i][1];
      fill(x, w[2], mx, my, 3, 1);
      if (mx + 3 > 16) fill(x, w[2], mx - 16, my, 3, 1);
      dot(x, w[0], (mx + 7) % 16, (my + 2) % 16);
    }
    if (frame === 1) { dot(x, w[3], 6, 8); }
    if (frame === 2) { dot(x, w[3], 13, 2); }
  }

  function lava(x, P, frame) {
    fill(x, '#b8300e');
    var blobs = [[3, 3, 4], [10, 8, 5], [4, 12, 3]];
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var o = (frame + i) % 3;
      fill(x, '#e8601a', b[0] - o * 0 , b[1], b[2], 2);
      fill(x, '#f8a030', b[0] + 1, b[1] + (o === 1 ? 0 : 1), b[2] - 2, 1);
    }
    dot(x, '#ffe070', (5 + frame * 4) % 16, (7 + frame * 3) % 16);
    dot(x, '#801c0a', 8, 1); dot(x, '#801c0a', 14, 14);
  }

  function sign(x, P) {
    var g = pg();
    g.rect(7, 9, 2, 6, 1);
    g.rect(2, 3, 12, 7, 0, { vgrad: 1 });
    x.drawImage(g.render([ramp('#b88a52'), ramp('#7a5230')]), 0, 0);
    fill(x, '#6a4424', 4, 5, 8, 1); fill(x, '#6a4424', 4, 7, 6, 1);
  }

  function bush(x, P) {
    var g = pg();
    g.ellipse(8, 9, 6.6, 5.6, 0);
    g.ellipse(5, 7.5, 2.5, 2.2, 0, { bias: 0.1 });
    g.ellipse(10.5, 6.5, 2.6, 2.2, 0, { bias: 0.12 });
    var c = PK.color.shade(P.leaf || '#3f9e47', -0.1);
    x.drawImage(g.render([ramp(c)]), 0, 0);
    dot(x, PK.color.shade(c, -0.5), 6, 11); dot(x, PK.color.shade(c, -0.5), 10, 10); dot(x, PK.color.shade(c, -0.5), 8, 12);
  }

  function rock(x, P, big) {
    var g = pg();
    var c = P.wall ? P.wall[2] : '#9a9290';
    if (big) { g.ellipse(8, 8.6, 7, 6.6, 0); g.ellipse(6, 6.5, 3.5, 3, 0, { bias: 0.1 }); }
    else {
      g.ellipse(8, 9.5, 6.4, 5.4, 0);
      g.line(6, 6, 8, 9, 1, 0.5); g.line(8, 9, 7, 12, 1, 0.5); g.line(8, 9, 11, 10, 1, 0.5);
    }
    x.drawImage(g.render([ramp(PK.color.mix(c, '#9a98a0', 0.4)), PK.color.shade(c, -0.6)]), 0, 0);
  }

  function ledge(x, P) {
    var g = P.g, w = P.wall;
    fill(x, g[2], 0, 10, 16, 1);
    fill(x, w[1], 0, 11, 16, 3);
    fill(x, w[2], 0, 11, 16, 1);
    for (var i = 1; i < 16; i += 4) fill(x, w[0], i, 12, 1, 2);
    fill(x, w[0], 0, 14, 16, 1);
    fill(x, g[0], 0, 15, 16, 1);
  }

  function fence(x, P) {
    var c = P.fence || '#f2eee4', d = PK.color.shade(c, -0.45), l = PK.color.shade(c, 0.3);
    fill(x, d, 0, 5, 16, 3); fill(x, c, 0, 5, 16, 2);
    fill(x, d, 0, 10, 16, 3); fill(x, c, 0, 10, 16, 2);
    [2, 11].forEach(function (px) {
      fill(x, d, px - 1, 2, 4, 13); fill(x, c, px, 2, 2, 12); fill(x, l, px, 2, 1, 11);
    });
  }

  function flowers(x, P, frame, r) {
    var fl = P.fl;
    for (var k = 0; k < 3; k++) {
      var fx = 2 + ((k * 5 + r.int(3)) % 12), fy = 2 + ((k * 4 + r.int(4)) % 11);
      var c = fl[(k + r.int(4)) % fl.length];
      var o = frame === 1 && k === 1 ? 1 : 0;
      dot(x, P.g[0], fx + 1, fy + 3);
      dot(x, c, fx + o, fy + 1); dot(x, c, fx + 2 + o, fy + 1); dot(x, c, fx + 1 + o, fy); dot(x, c, fx + 1 + o, fy + 2);
      dot(x, '#f8e070', fx + 1 + o, fy + 1);
    }
  }

  function pave(x, P) {
    var p = P.pave;
    fill(x, p[1]);
    fill(x, p[0], 0, 7, 16, 1); fill(x, p[0], 0, 15, 16, 1);
    fill(x, p[0], 7, 0, 1, 7); fill(x, p[0], 15, 8, 1, 7);
    fill(x, p[2], 0, 0, 7, 1); fill(x, p[2], 8, 0, 8, 1); fill(x, p[2], 0, 8, 15, 1);
  }

  function path(x, P, r) {
    var p = P.path;
    fill(x, p[1]);
    for (var k = 0; k < 5; k++) dot(x, p[0], r.int(16), r.int(16));
    for (k = 0; k < 4; k++) dot(x, p[2], r.int(16), r.int(16));
  }

  function wallTex(x, P, r) {
    var w = P.wall;
    fill(x, w[1]);
    var rows = [0, 5, 10];
    for (var i = 0; i < rows.length; i++) {
      var y = rows[i], off = (i % 2) * 5;
      fill(x, w[0], 0, y + 4, 16, 1);
      for (var bx = off - 5; bx < 16; bx += 8) {
        fill(x, w[0], bx + 7, y, 1, 4);
        fill(x, w[2], Math.max(0, bx), y, Math.min(7, 16 - Math.max(0, bx)), 1);
        dot(x, w[2], Math.max(0, bx), y + 1);
      }
    }
    fill(x, w[0], 0, 15, 16, 1);
  }

  function interiorWall(x, P, below) {
    var w = P.wall;
    fill(x, w[1]);
    for (var i = 1; i < 16; i += 4) fill(x, w[2], i, 0, 2, 16);
    fill(x, w[0], 0, 0, 16, 1);
    if (!below) {
      fill(x, P.trim, 0, 11, 16, 5);
      fill(x, PK.color.shade(P.trim, 0.3), 0, 11, 16, 1);
      fill(x, PK.color.shade(P.trim, -0.4), 0, 15, 16, 1);
    }
  }

  function furniture(x, P, ch, frame) {
    var g = pg(), wood = ramp('#b07a44'), dark = ramp('#6a4424');
    switch (ch) {
      case 'M':
        fill(x, P.rug[0], 1, 3, 14, 11); fill(x, P.rug[1], 2, 4, 12, 9);
        for (var i = 3; i < 13; i += 3) fill(x, P.rug[2], i, 6, 2, 5);
        break;
      case ',':
        fill(x, P.rug[1]);
        fill(x, P.rug[0], 0, 0, 16, 1); fill(x, P.rug[0], 0, 15, 16, 1);
        dot(x, P.rug[2], 7, 3); dot(x, P.rug[2], 8, 3); fill(x, P.rug[2], 5, 6, 6, 4); fill(x, P.rug[1], 7, 7, 2, 2);
        dot(x, P.rug[2], 7, 12); dot(x, P.rug[2], 8, 12);
        break;
      case 'c':
        g.rect(0, 2, 16, 8, 0, { light: 0.9 });
        g.rect(0, 10, 16, 6, 1, { light: 0.45 });
        x.drawImage(g.render([ramp(PK.color.shade(P.trim, 0.45)), ramp(P.trim)], { outline: null }), 0, 0);
        fill(x, PK.color.shade(P.trim, -0.5), 0, 9, 16, 1);
        break;
      case 'H':
        g.rect(0, 2, 16, 8, 0, { light: 0.9 });
        g.rect(0, 10, 16, 6, 1, { light: 0.45 });
        x.drawImage(g.render([ramp('#e8f0f0'), ramp(P.trim)], { outline: null }), 0, 0);
        for (var k = 0; k < 3; k++) { fill(x, '#2a3a44', 2 + k * 5, 4, 3, 3); fill(x, (frame + k) % 3 === 0 ? '#80ffd0' : '#48c8a0', 3 + k * 5, 5, 1, 1); }
        break;
      case 't':
        g.rect(1, 4, 14, 7, 0, { light: 0.85 });
        g.rect(2, 11, 2, 4, 1); g.rect(12, 11, 2, 4, 1);
        x.drawImage(g.render([wood, dark]), 0, 0);
        break;
      case 'B':
        g.rect(1, 1, 14, 14, 0, { light: 0.5 });
        g.rect(2, 2, 12, 4, 1, { light: 0.95 });
        g.rect(2, 7, 12, 8, 2, { vgrad: 1 });
        x.drawImage(g.render([wood, ramp('#f4f4f4'), ramp(P.rug[1])]), 0, 0);
        break;
      case 'K':
        g.rect(0, 0, 16, 16, 0, { light: 0.4 });
        x.drawImage(g.render([dark], { outline: null }), 0, 0);
        var cols = ['#c84848', '#4868c8', '#48a860', '#e0b040', '#9058b8', '#e07838'];
        for (var sh = 0; sh < 2; sh++) {
          fill(x, '#3a2414', 1, 7 + sh * 7, 14, 1);
          for (var b = 0; b < 6; b++) fill(x, cols[(b + sh * 3) % 6], 2 + b * 2, 2 + sh * 7, 2, 5 - (b % 2));
        }
        break;
      case 'p':
        g.rect(5, 10, 6, 5, 1, { hgrad: 1 });
        g.ellipse(8, 6.5, 4.5, 4.2, 0);
        g.ellipse(5, 8, 2.5, 2, 0);
        g.ellipse(11, 8, 2.5, 2, 0);
        x.drawImage(g.render([ramp('#3e9e48'), ramp('#c06a3a')]), 0, 0);
        break;
      case 'C':
        g.rect(0, 8, 16, 8, 0, { light: 0.6 });
        g.rect(3, 1, 10, 8, 1, { light: 0.4 });
        x.drawImage(g.render([ramp('#b8bcc8'), ramp('#4a5068')]), 0, 0);
        fill(x, (frame % 2) ? '#88f0f8' : '#58c8e8', 4, 2, 8, 5);
        fill(x, '#e8ffff', 5, 3, 3, 1);
        fill(x, '#303040', 4, 11, 8, 2);
        break;
      case 'D':
        g.rect(0, 0, 16, 16, 0, { light: 0.55 });
        x.drawImage(g.render([ramp('#9aa0b0')], { outline: null }), 0, 0);
        var ic = ['#e04848', '#48b0e0', '#f0c040', '#60c060'];
        for (var s2 = 0; s2 < 2; s2++) {
          fill(x, '#5a6070', 0, 7 + s2 * 7, 16, 2);
          for (var j = 0; j < 4; j++) fill(x, ic[(j + s2) % 4], 1 + j * 4, 3 + s2 * 7, 3, 4);
        }
        break;
      case 'Q':
        g.rect(3, 11, 10, 4, 0, { light: 0.55 });
        g.poly([[8, 1], [13, 6], [8, 11], [3, 6]], 1);
        x.drawImage(g.render([ramp('#9a98a8'), ramp(P.trim || '#d8b04a')]), 0, 0);
        break;
      case 'Y':
        fill(x, '#ffffff', 3, 2, 10, 8); fill(x, '#8ad0f8', 4, 3, 8, 6); fill(x, '#c8ecff', 4, 3, 3, 2);
        fill(x, '#ffffff', 7, 3, 1, 6); fill(x, '#ffffff', 4, 5, 8, 1);
        break;
      case 'Z':
        fill(x, '#7a5230', 3, 2, 10, 8); fill(x, '#86c0e8', 4, 3, 8, 6); fill(x, '#5aa050', 4, 6, 8, 3); fill(x, '#f8e080', 9, 4, 2, 2);
        break;
    }
  }

  var cache = {};
  function tileCanvas(themeName, ch, frame, variant, flags) {
    var key = themeName + '|' + ch + '|' + frame + '|' + variant + '|' + (flags || 0);
    var c = cache[key];
    if (c) return c;
    var P = theme(themeName);
    c = PK.makeCanvas(S, S);
    var x = c.getContext('2d');
    var r = PK.seeded(PK.hash(key.replace('|' + frame + '|', '|')));
    var interior = INTERIOR[P.style];
    var needGround = '.,"T:SbrRfLkvtpBQ'.indexOf(ch) >= 0 || (interior && 'ctBKpCHDQM'.indexOf(ch) >= 0);
    if (needGround || ch === ',' || ch === '.') groundBase(x, P, r);
    switch (ch) {
      case '.': break;
      case ',': if (interior) furniture(x, P, ',', frame); else flowers(x, P, frame, r); break;
      case '"': tallGrass(x, P, frame); break;
      case ':': path(x, P, r); break;
      case 'g': pave(x, P); break;
      case 'd': groundBase(x, Object.assign({}, P, { style: 'stone', g: P.pave }), r); break;
      case 'T': drawTree(x, P, r, frame); break;
      case '~': water(x, P, frame, r); break;
      case '=': case '|':
        water(x, P, frame, r);
        var wd = ramp('#b8864e');
        if (ch === '=') {
          fill(x, wd[1], 0, 1, 16, 14);
          for (var i = 0; i < 16; i += 4) { fill(x, wd[2], i, 2, 3, 12); fill(x, wd[0], i + 3, 2, 1, 12); }
          fill(x, wd[0], 0, 1, 16, 1); fill(x, wd[0], 0, 14, 16, 1);
        } else {
          fill(x, wd[1], 1, 0, 14, 16);
          for (var j = 0; j < 16; j += 4) { fill(x, wd[2], 2, j, 12, 3); fill(x, wd[0], 2, j + 3, 12, 1); }
          fill(x, wd[0], 1, 0, 1, 16); fill(x, wd[0], 14, 0, 1, 16);
        }
        break;
      case 'v': ledge(x, P); break;
      case 'f': fence(x, P); break;
      case 'S': sign(x, P); break;
      case 'b': bush(x, P); break;
      case 'r': rock(x, P, false); break;
      case 'R': rock(x, P, true); break;
      case 'W': if (interior) interiorWall(x, P, flags & 1); else wallTex(x, P, r); break;
      case 'Y': case 'Z': interiorWall(x, P, flags & 1); furniture(x, P, ch, frame); break;
      case 'O':
        wallTex(x, P, r);
        fill(x, '#141018', 3, 5, 10, 11); fill(x, '#141018', 4, 3, 8, 2); fill(x, '#141018', 5, 2, 6, 1);
        fill(x, '#241c28', 4, 6, 8, 10);
        break;
      case 'l': lava(x, P, frame); break;
      case 'i':
        fill(x, '#c4e8f8'); fill(x, '#a8d4ee', 0, 15, 16, 1); fill(x, '#a8d4ee', 15, 0, 1, 16);
        for (var s = 0; s < 3; s++) dot(x, '#ffffff', 3 + s, 6 - s);
        dot(x, '#ffffff', 11, 11); dot(x, '#ffffff', 12, 10);
        break;
      case 'k':
        var g2 = pg();
        g2.rect(1, 8, 14, 7, 0, { vgrad: 1 });
        g2.ellipse(4, 7, 2.5, 2.5, 1); g2.ellipse(8, 6, 2.5, 2.5, 1); g2.ellipse(12, 7, 2.5, 2.5, 1);
        x.drawImage(g2.render([ramp('#b0703e'), ramp('#48a050')]), 0, 0);
        dot(x, '#f05a5a', 4, 6); dot(x, '#f8d040', 8, 5); dot(x, '#f070c0', 12, 6);
        break;
      case 'L':
        var g3 = pg();
        g3.rect(7, 5, 2, 10, 0); g3.rect(5, 14, 6, 2, 0);
        g3.rect(5, 1, 6, 4, 1, { light: 0.95 });
        x.drawImage(g3.render([ramp('#4a4e60'), ramp('#f8e080')]), 0, 0);
        break;
      case 'X':
        var wl = P.wall || P.floor;
        fill(x, wl[1]);
        for (var st = 0; st < 4; st++) { fill(x, wl[2], 1, st * 4, 14, 2); fill(x, wl[0], 1, st * 4 + 3, 14, 1); }
        fill(x, wl[0], 0, 0, 1, 16); fill(x, wl[0], 15, 0, 1, 16);
        break;
      case ' ': fill(x, '#000'); break;
      case 'Q': if (!interior) { groundBase(x, P, r); furniture(x, Object.assign({ trim: '#c8a0ff' }, P), 'Q', frame); } else furniture(x, P, ch, frame); break;
      default:
        if (interior) furniture(x, P, ch, frame);
    }
    cache[key] = c;
    return c;
  }

  var ANIM = { '~': 1, '=': 1, '|': 1, 'l': 1, ',': 1, 'H': 1, 'C': 1 };

  function isWaterish(ch) { return ch === '~' || ch === '=' || ch === '|'; }
  function isPathish(ch) { return ch === ':' || ch === 'g' || ch === 'X' || ch === 'O' || ch === 'd'; }

  // Draw one map tile including neighbor-aware edges.
  function drawMapTile(ctx, map, tx, ty, px, py, frame) {
    var ch = map.at(tx, ty);
    var P = theme(map.theme);
    var interior = INTERIOR[P.style];
    var f = ANIM[ch] ? frame : 0;
    var variant = ((tx * 7 + ty * 13) >>> 0) % 3;
    var flags = 0;
    if ((ch === 'W' || ch === 'Y' || ch === 'Z') && interior) {
      var b = map.at(tx, ty + 1);
      if (b === 'W' || b === 'Y' || b === 'Z' || b === ' ') flags = 1;
    }
    ctx.drawImage(tileCanvas(map.theme, ch, f, variant, flags), px, py);
    var n = map.at(tx, ty - 1), s = map.at(tx, ty + 1), w = map.at(tx - 1, ty), e = map.at(tx + 1, ty);
    if (ch === '~') {
      var wc = P.water;
      if (n && !isWaterish(n)) { ctx.fillStyle = wc[3]; ctx.fillRect(px, py, 16, 1); ctx.fillStyle = wc[2]; ctx.fillRect(px, py + 1, 16, 1); }
      if (s && !isWaterish(s)) { ctx.fillStyle = wc[3]; ctx.fillRect(px, py + 15, 16, 1); }
      if (w && !isWaterish(w)) { ctx.fillStyle = wc[3]; ctx.fillRect(px, py, 1, 16); ctx.fillStyle = wc[2]; ctx.fillRect(px + 1, py, 1, 16); }
      if (e && !isWaterish(e)) { ctx.fillStyle = wc[3]; ctx.fillRect(px + 15, py, 1, 16); ctx.fillStyle = wc[2]; ctx.fillRect(px + 14, py, 1, 16); }
    } else if (ch === ':' && P.path) {
      ctx.fillStyle = P.path[0];
      if (n && !isPathish(n)) ctx.fillRect(px, py, 16, 1);
      if (s && !isPathish(s)) ctx.fillRect(px, py + 15, 16, 1);
      if (w && !isPathish(w)) ctx.fillRect(px, py, 1, 16);
      if (e && !isPathish(e)) ctx.fillRect(px + 15, py, 1, 16);
    } else if (ch === 'W' && !interior) {
      var wl = P.wall;
      if (n && n !== 'W' && n !== 'O') { ctx.fillStyle = wl[2]; ctx.fillRect(px, py, 16, 2); ctx.fillStyle = PK.color.shade(wl[2], 0.3); ctx.fillRect(px, py, 16, 1); }
      if (s && s !== 'W' && s !== 'O') { ctx.fillStyle = wl[0]; ctx.fillRect(px, py + 13, 16, 3); }
    }
  }

  PK.tiles = {
    S: S,
    get: tileCanvas,
    drawMapTile: drawMapTile,
    isAnimated: function (ch) { return !!ANIM[ch]; },
    theme: theme
  };
})();

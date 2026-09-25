// Part-based Kit sprite generator: body plans + features, shaded and outlined.
// All creature designs are original and generated from per-species specs in data/kits.js.
(function () {
  'use strict';
  var PK = window.PK;
  var C = function () { return PK.color; };

  // materials
  var BASE = 0, ACC = 1, BELLY = 2, EYEW = 3, PUPIL = 4, MOUTH = 5, HORN = 6, GLOW = 7, CHEEK = 8, SHINE = 9, DARK = 10, FLAME = 11, LEAF = 12, CRYS = 13, WING = 14, IRIS = 15, LID = 16;

  // Cosmetic colour tints a keeper can pick for their own Kit (index stored on the Kit as `tint`)
  var TINTS = [
    { name: 'Natural' },
    { name: 'Ember', hue: 16 }, { name: 'Gold', hue: 44 }, { name: 'Meadow', hue: 110 }, { name: 'Ocean', hue: 205 },
    { name: 'Twilight', hue: 265 }, { name: 'Blossom', hue: 330 }, { name: 'Shadow', light: -0.2, sat: 0.55 }, { name: 'Frost', light: 0.16, sat: 0.4 }
  ];
  function tintColor(hex, t, spread) {
    var rgb = C().hexToRgb(hex), hsl = C().rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var h = hsl[0], sat = hsl[1], l = hsl[2];
    if (t.hue != null) {
      if (sat < 0.12) sat = 0.35; // greys pick up the new colour too
      h = t.hue + (spread || 0);
    }
    if (t.sat != null) sat *= t.sat;
    if (t.light != null) l = Math.max(0.06, Math.min(0.94, l + t.light));
    var o = C().hslToRgb(h, sat, l);
    return C().rgbToHex(o[0], o[1], o[2]);
  }
  function palette(spec, prism, tint) {
    var c = spec.c;
    var base = c[0], acc = c[1], belly = c[2] || C().mix(c[0], '#fff8e8', 0.6);
    if (prism) {
      base = C().hueRotate(base, 140, 1.1, 0.04);
      acc = C().hueRotate(acc, 120, 1.1, 0.04);
      belly = C().hueRotate(belly, 60, 0.8, 0.03);
    }
    var tn = tint && TINTS[tint];
    if (tn && tint > 0) {
      base = tintColor(base, tn, 0);
      acc = tintColor(acc, tn, tn.hue != null ? 28 : 0);
      belly = tn.hue != null ? C().mix(tintColor(belly, tn, -10), '#ffffff', 0.45) : tintColor(belly, tn, 0);
      spec = Object.assign({}, spec, { wc: spec.wc ? tintColor(spec.wc, tn, 14) : null, lc: spec.lc ? tintColor(spec.lc, tn, 60) : spec.lc });
    }
    var eyeCol = spec.ec || '#1a1426';
    var p = [];
    p[BASE] = C().ramp(base);
    p[ACC] = C().ramp(acc);
    p[BELLY] = C().ramp(belly);
    p[EYEW] = '#ffffff';
    p[PUPIL] = eyeCol;
    p[MOUTH] = '#5a1a26';
    p[HORN] = C().ramp(spec.hc || '#e8dcc0');
    p[GLOW] = spec.gc || C().shade(acc, 0.5);
    p[CHEEK] = '#f48aa0';
    p[SHINE] = '#ffffff';
    p[DARK] = '#241c2c';
    p[FLAME] = ['#c83a1a', '#f0702a', '#f8a83a', '#ffd860', '#fff4c0'];
    p[LEAF] = C().ramp(spec.lc || '#4cb04a');
    p[CRYS] = C().ramp(spec.cc || '#8ee0f0').concat(['#ffffff']);
    p[WING] = C().ramp(spec.wc || C().mix(acc, '#ffffff', 0.35));
    // iris: explicit eye colour, else a deep, saturated version of the accent colour
    var ic = spec.ic || (spec.ec && spec.ec !== '#1a1426' ? spec.ec : C().shade(C().hueRotate(acc, 0, 1.3, 0), -0.25));
    p[IRIS] = [C().shade(ic, -0.55), C().shade(ic, -0.3), ic, C().shade(ic, 0.3)];
    p[LID] = C().shade(base, -0.72);
    return p;
  }

  function Builder(spec, view, prism, size) {
    this.spec = spec;
    this.view = view; // 'front' | 'back'
    this.cw = size || (view === 'back' ? 84 : 64);
    this.g = new PK.PG(this.cw, this.cw);
    this.g.lx = -0.35; this.g.ly = -0.65;
    var st = spec.stage || 1;
    var s = spec.s || [0, 0.64, 0.8, 0.97][st] || 0.85;
    if (!spec.icon) s = Math.min(1.02, s * 1.12);
    if (view === 'back') s *= 1.3;
    this.s = s;
    this.prism = prism;
    this.turn = view === 'front' ? 1 : 0;
  }
  var B = Builder.prototype;
  // transforms from design space (64x64, ground at y=62) to scaled space
  B.X = function (x) { return this.cw / 2 + (x - 32) * this.s; };
  B.Y = function (y) { return (this.cw - 2) - (62 - y) * this.s; };
  B.L = function (v) { return v * this.s; };
  B.el = function (x, y, rx, ry, m, o) { this.g.ellipse(this.X(x), this.Y(y), this.L(rx), this.L(ry), m, o); };
  B.ln = function (x0, y0, x1, y1, m, r0, r1, o) { this.g.line(this.X(x0), this.Y(y0), this.X(x1), this.Y(y1), m, this.L(r0), this.L(r1 == null ? r0 : r1), o); };
  B.cv = function (x0, y0, cx, cy, x1, y1, m, r0, r1, o) { this.g.curve(this.X(x0), this.Y(y0), this.X(cx), this.Y(cy), this.X(x1), this.Y(y1), m, this.L(r0), this.L(r1), o); };
  B.po = function (pts, m, o) {
    var self = this;
    this.g.poly(pts.map(function (p) { return [self.X(p[0]), self.Y(p[1])]; }), m, o);
  };
  // Recolor pixels of material `from` to `to` within ellipse region, keeping shading
  B.recolor = function (from, to, pred) {
    var g = this.g;
    var W = g.w, Hh = g.h;
    for (var y = 0; y < Hh; y++) for (var x = 0; x < W; x++) {
      var i = y * W + x;
      if (g.mat[i] === from && pred(x, y)) g.mat[i] = to;
    }
  };
  B.inEl = function (cx, cy, rx, ry) {
    var X = this.X(cx), Y = this.Y(cy), RX = this.L(rx), RY = this.L(ry);
    return function (x, y) { var dx = (x + 0.5 - X) / RX, dy = (y + 0.5 - Y) / RY; return dx * dx + dy * dy <= 1; };
  };
  B.has = function (k) { return (this.spec.x || []).indexOf(k) >= 0; };

  // ---------- feature painters ----------
  B.ears = function (G) {
    var t = this.spec.ear, hx = G.hx, hy = G.hy, r = G.hr, self = this;
    if (!t || t === 'none') return;
    [-1, 1].forEach(function (d) {
      if (t === 'point') {
        self.po([[hx + d * r * 0.25, hy - r * 0.75], [hx + d * r * 0.95, hy - r * 1.55], [hx + d * r * 0.95, hy - r * 0.3]], BASE);
        self.po([[hx + d * r * 0.45, hy - r * 0.7], [hx + d * r * 0.88, hy - r * 1.3], [hx + d * r * 0.86, hy - r * 0.5]], ACC, { light: 0.55 });
      } else if (t === 'round') {
        self.el(hx + d * r * 0.72, hy - r * 0.78, r * 0.42, r * 0.42, BASE);
        self.el(hx + d * r * 0.72, hy - r * 0.76, r * 0.24, r * 0.24, ACC, { light: 0.5 });
      } else if (t === 'long') {
        self.el(hx + d * r * 0.42, hy - r * 1.45, r * 0.26, r * 0.8, BASE);
        self.el(hx + d * r * 0.42, hy - r * 1.4, r * 0.12, r * 0.58, ACC, { light: 0.55 });
      } else if (t === 'fin') {
        self.po([[hx + d * r * 0.8, hy - r * 0.55], [hx + d * r * 1.65, hy - r * 0.9], [hx + d * r * 1.35, hy - r * 0.1], [hx + d * r * 0.85, hy + r * 0.15]], ACC);
      } else if (t === 'tuft') {
        self.po([[hx + d * r * 0.35, hy - r * 0.85], [hx + d * r * 0.8, hy - r * 1.35], [hx + d * r * 0.85, hy - r * 0.55]], ACC);
      } else if (t === 'droop') {
        self.el(hx + d * r * 0.98, hy + r * 0.05, r * 0.3, r * 0.62, ACC, { bias: -0.05 });
      } else if (t === 'wide') {
        self.el(hx + d * r * 1.05, hy - r * 0.45, r * 0.55, r * 0.35, BASE);
        self.el(hx + d * r * 1.05, hy - r * 0.43, r * 0.32, r * 0.18, ACC, { light: 0.5 });
      }
    });
  };

  B.horns = function (G, front) {
    var t = this.spec.horn, hx = G.hx, hy = G.hy, r = G.hr, self = this;
    if (!t || t === 'none') return;
    if (t === 'uni' && front) {
      self.po([[hx - r * 0.18, hy - r * 0.78], [hx, hy - r * 1.75], [hx + r * 0.18, hy - r * 0.78]], HORN);
      return;
    }
    if (t === 'spikes' && front) {
      [-1, 0, 1].forEach(function (d) {
        self.po([[hx + d * r * 0.42 - r * 0.2, hy - r * 0.8 + Math.abs(d) * r * 0.1], [hx + d * r * 0.5, hy - r * 1.45 + Math.abs(d) * r * 0.2], [hx + d * r * 0.42 + r * 0.2, hy - r * 0.8 + Math.abs(d) * r * 0.1]], ACC);
      });
      return;
    }
    if (t === 'crest' && !front) {
      self.po([[hx - r * 0.25, hy - r * 0.8], [hx + r * 0.1, hy - r * 1.75], [hx + r * 0.6, hy - r * 1.45], [hx + r * 0.3, hy - r * 0.7]], ACC);
      return;
    }
    [-1, 1].forEach(function (d) {
      if (t === 'nub' && front) self.el(hx + d * r * 0.45, hy - r * 0.88, r * 0.2, r * 0.25, HORN);
      else if (t === 'curl' && !front) {
        self.cv(hx + d * r * 0.5, hy - r * 0.7, hx + d * r * 1.5, hy - r * 1.3, hx + d * r * 1.25, hy + r * 0.05, HORN, r * 0.28, r * 0.12);
      } else if (t === 'antler' && !front) {
        self.ln(hx + d * r * 0.4, hy - r * 0.8, hx + d * r * 0.9, hy - r * 1.8, HORN, r * 0.1, r * 0.07);
        self.ln(hx + d * r * 0.62, hy - r * 1.25, hx + d * r * 1.25, hy - r * 1.45, HORN, r * 0.08, r * 0.06);
        self.ln(hx + d * r * 0.78, hy - r * 1.58, hx + d * r * 0.45, hy - r * 2.0, HORN, r * 0.07, r * 0.05);
      } else if (t === 'back' && !front) {
        self.po([[hx + d * r * 0.35, hy - r * 0.75], [hx + d * r * 1.25, hy - r * 1.55], [hx + d * r * 0.75, hy - r * 0.5]], HORN);
      }
    });
  };

  B.flame = function (x, y, h, w) {
    // teardrop flame rising from (x,y)
    this.po([[x - w, y], [x - w * 0.8, y - h * 0.45], [x - w * 0.2, y - h * 0.7], [x, y - h], [x + w * 0.35, y - h * 0.6], [x + w * 0.9, y - h * 0.5], [x + w, y]], FLAME, { light: 0.62 });
    this.el(x, y - h * 0.08, w * 1.0, h * 0.28, FLAME, { light: 0.62 });
    this.po([[x - w * 0.5, y - h * 0.05], [x - w * 0.1, y - h * 0.55], [x + w * 0.5, y - h * 0.05]], FLAME, { light: 0.95 });
    this.el(x, y - h * 0.1, w * 0.45, h * 0.15, FLAME, { light: 1.1 });
  };
  B.leafShape = function (x, y, len, ang, wid) {
    var dx = Math.cos(ang), dy = Math.sin(ang);
    var tx = x + dx * len, ty = y + dy * len;
    var mx = (x + tx) / 2, my = (y + ty) / 2, nx = -dy * wid, ny = dx * wid;
    this.po([[x, y], [mx + nx, my + ny], [tx, ty], [mx - nx, my - ny]], LEAF);
    this.ln(x, y, mx + dx * len * 0.2, my + dy * len * 0.2, LEAF, 0.3, 0.3, { light: 0.25 });
  };
  B.crystal = function (x, y, h, w) {
    this.po([[x - w, y], [x - w * 0.9, y - h * 0.65], [x, y - h], [x + w * 0.9, y - h * 0.65], [x + w, y]], CRYS);
    this.po([[x - w * 0.2, y - h * 0.15], [x, y - h * 0.85], [x + w * 0.35, y - h * 0.15]], CRYS, { light: 1.05 });
  };
  B.bolt = function (x, y, h, w, m) {
    this.po([[x - w * 0.2, y], [x + w * 0.6, y - h * 0.45], [x + w * 0.05, y - h * 0.45], [x + w * 0.5, y - h], [x - w * 0.6, y - h * 0.38], [x - w * 0.05, y - h * 0.38]], m == null ? ACC : m, { light: 0.8 });
  };

  B.top = function (G) {
    var t = this.spec.top, hx = G.hx, hy = G.hy, r = G.hr, self = this;
    if (!t || t === 'none') return;
    var ty = hy - r * 0.85;
    if (t === 'leaf') { this.leafShape(hx, ty + r * 0.1, r * 1.1, -Math.PI / 2 - 0.5, r * 0.32); this.leafShape(hx, ty + r * 0.1, r * 0.8, -Math.PI / 2 + 0.7, r * 0.24); }
    else if (t === 'sprout') { this.ln(hx, ty + r * 0.1, hx, ty - r * 0.35, LEAF, r * 0.07); this.leafShape(hx, ty - r * 0.3, r * 0.6, -Math.PI + 0.4, r * 0.2); this.leafShape(hx, ty - r * 0.3, r * 0.6, -0.4, r * 0.2); }
    else if (t === 'flame') this.flame(hx, ty + r * 0.25, r * 1.1, r * 0.42);
    else if (t === 'crystal') { this.crystal(hx, ty + r * 0.2, r * 1.0, r * 0.3); this.crystal(hx - r * 0.42, ty + r * 0.3, r * 0.6, r * 0.2); this.crystal(hx + r * 0.42, ty + r * 0.3, r * 0.6, r * 0.2); }
    else if (t === 'tuft') {
      [-1, 0, 1].forEach(function (d) { self.po([[hx + d * r * 0.2 - r * 0.15, ty + r * 0.2], [hx + d * r * 0.45, ty - r * 0.45 + Math.abs(d) * r * 0.15], [hx + d * r * 0.2 + r * 0.15, ty + r * 0.2]], ACC); });
    }
    else if (t === 'halo') {
      var cx = this.X(hx), cy = this.Y(hy - r * 1.35), rx = this.L(r * 0.8), ry = this.L(r * 0.25);
      for (var yy = Math.floor(cy - ry - 1); yy <= cy + ry + 1; yy++) for (var xx = Math.floor(cx - rx - 1); xx <= cx + rx + 1; xx++) {
        var dx = (xx + 0.5 - cx) / rx, dy = (yy + 0.5 - cy) / ry, d = dx * dx + dy * dy;
        var dx2 = (xx + 0.5 - cx) / Math.max(1, rx - 2), dy2 = (yy + 0.5 - cy) / Math.max(0.6, ry - 1.4);
        if (d <= 1 && dx2 * dx2 + dy2 * dy2 > 1) this.g.put(xx, yy, GLOW, 0.9);
      }
    }
    else if (t === 'bolt') this.bolt(hx, ty + r * 0.2, r * 1.2, r * 0.5);
    else if (t === 'cap') {
      this.el(hx, hy - r * 0.35, r * 1.45, r * 0.9, ACC, { clip: function (x, y) { return y < self.Y(hy - r * 0.05); } });
      [[-0.7, -0.75, 0.22], [0.1, -1.0, 0.28], [0.75, -0.6, 0.2]].forEach(function (s) { self.el(hx + s[0] * r, hy + s[1] * r, s[2] * r, s[2] * r * 0.8, BELLY, { light: 0.8 }); });
    }
    else if (t === 'antenna') {
      [-1, 1].forEach(function (d) {
        self.cv(hx + d * r * 0.3, ty + r * 0.1, hx + d * r * 0.4, ty - r * 0.6, hx + d * r * 0.85, ty - r * 0.85, DARK, r * 0.06, r * 0.06, { light: 0.5 });
        self.el(hx + d * r * 0.85, ty - r * 0.9, r * 0.18, r * 0.18, GLOW);
      });
    }
    else if (t === 'star') {
      var pts = [];
      for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.25 : r * 0.6; pts.push([hx + Math.cos(a) * rr, ty - r * 0.3 + Math.sin(a) * rr]); }
      this.po(pts, GLOW, { light: 0.9 });
    }
    else if (t === 'shell') {
      this.el(hx, hy - r * 0.4, r * 1.08, r * 0.78, ACC, { clip: function (x, y) { return y < self.Y(hy - r * 0.2); } });
      this.ln(hx, hy - r * 1.15, hx, hy - r * 0.25, ACC, r * 0.05, r * 0.05, { light: 0.25 });
    }
    else if (t === 'petals') {
      for (var p = 0; p < 7; p++) {
        var an = p / 7 * Math.PI * 2 - Math.PI / 2;
        this.el(hx + Math.cos(an) * r * 1.05, hy + Math.sin(an) * r * 1.05, r * 0.42, r * 0.42, ACC);
      }
    }
  };

  B.eyes = function (G) {
    var t = this.spec.eye || (this.spec.stage === 3 ? 'fierce' : 'round');
    var turn = this.turn || 0;
    var hx = G.hx, hy = G.hy + (G.eyeDY || 0), r = G.hr, g = this.g, self = this;
    var sep = r * (G.eyeSep || 0.4), ey = hy + r * 0.02;
    var sz = r * (t === 'big' ? 0.36 : t === 'dot' ? 0.15 : 0.29);
    // side: -1 = the eye nearer the viewer (drawn larger in the 3/4 view)
    function one(cx, side, scale) {
      var X = self.X(cx), Y = self.Y(ey), R = Math.max(1.3, self.L(sz) * scale);
      if (t === 'dot') {
        g.ellipse(X, Y, Math.max(1, R), Math.max(1.3, R * 1.25), PUPIL, { light: 0.5 });
        g.put(Math.round(X - 0.5), Math.round(Y - R * 0.6), SHINE, 1);
        return;
      }
      if (t === 'sleepy') {
        g.ellipse(X, Y, R * 1.1, R * 0.9, EYEW, { light: 0.9, clip: function (x, y) { return y >= Y; } });
        g.ellipse(X - side * 0.3, Y + R * 0.35, R * 0.6, R * 0.5, IRIS, { light: 0.55, clip: function (x, y) { return y >= Y; } });
        g.line(X - R * 1.25, Y, X + R * 1.25, Y, LID, 0.55, 0.55, { light: 0.5 });
        return;
      }
      if (t === 'glow') {
        g.ellipse(X, Y, R, R * 1.1, GLOW, { light: 0.95 });
        g.ellipse(X + 0.3, Y + R * 0.3, R * 0.45, R * 0.5, SHINE, { light: 1 });
        return;
      }
      var ry = R * (t === 'big' ? 1.2 : 1.12);
      var clip = null;
      if (t === 'fierce') {
        // slanted brow cuts the inner-top corner
        clip = function (x, y) { var inner = side < 0 ? (x + 0.5 - X) : (X - x - 0.5); return (y + 0.5 - Y) > -ry * 0.3 + inner * 0.6; };
      }
      g.ellipse(X, Y, R, ry, EYEW, { light: 0.95, clip: clip });
      // iris looks toward the viewer's left (the direction the Kit faces)
      var px = X - R * 0.18 - turn * 0.3, py = Y + ry * 0.1;
      var ir = R * (t === 'big' ? 0.78 : 0.68), iry = ry * 0.8;
      g.ellipse(px, py, ir, iry, IRIS, { light: 0.62, clip: clip || function () { return true; } });
      g.ellipse(px, py + iry * 0.15, ir * 0.48, iry * 0.5, PUPIL, { light: 0.4, clip: clip || function () { return true; } });
      // highlights
      var sx = Math.round(px - ir * 0.45), sy = Math.round(py - iry * 0.45);
      if (g.get(sx, sy) === IRIS || g.get(sx, sy) === PUPIL) g.put(sx, sy, SHINE, 1);
      if (R > 2.4 && (g.get(sx + 1, sy) === IRIS || g.get(sx + 1, sy) === PUPIL)) g.put(sx + 1, sy, SHINE, 1);
      if (R > 2.4 && (g.get(sx, sy + 1) === IRIS || g.get(sx, sy + 1) === PUPIL)) g.put(sx, sy + 1, SHINE, 1);
      var s2x = Math.round(px + ir * 0.35), s2y = Math.round(py + iry * 0.45);
      if (R > 2.8 && g.get(s2x, s2y) === IRIS) g.put(s2x, s2y, SHINE, 1);
      // upper lid line
      if (t !== 'fierce') g.line(X - R * 0.95, Y - ry * 0.8, X + R * 0.95, Y - ry * 0.8, LID, 0.5, 0.5, { light: 0.5, clip: function (x, y) { return g.get(x, y) === EYEW || g.get(x, y) === IRIS; } });
      else g.line(X - R * 1.1 * side * -1, Y - ry * 0.85, X + R * 0.9 * side * -1, Y - ry * 0.1, LID, 0.55, 0.55, { light: 0.4 });
    }
    if (t === 'single') {
      var X0 = this.X(hx - turn * 0.1), Y0 = this.Y(ey), R0 = this.L(r * 0.44);
      g.ellipse(X0, Y0, R0, R0, EYEW, { light: 0.95 });
      g.ellipse(X0 - 0.5, Y0 + 0.5, R0 * 0.62, R0 * 0.66, IRIS, { light: 0.6 });
      g.ellipse(X0 - 0.5, Y0 + 0.8, R0 * 0.3, R0 * 0.32, PUPIL, { light: 0.4 });
      g.put(Math.round(X0 - R0 * 0.35), Math.round(Y0 - R0 * 0.3), SHINE, 1);
      return;
    }
    // 3/4 view: both eyes shift toward the facing side, the far eye is smaller
    var near = hx - sep * (1 + turn * 0.12) - turn * r * 0.06, far = hx + sep * (1 - turn * 0.2) - turn * r * 0.06;
    one(near, -1, 1 + turn * 0.06);
    one(far, 1, 1 - turn * 0.12);
  };

  B.mouth = function (G) {
    var t = this.spec.mouth || 'smile', r = G.hr, g = this.g, hx = G.hx - (this.turn || 0) * r * 0.12;
    var my = G.hy + r * (G.mouthDY || 0.48);
    var X = Math.round(this.X(hx)), Y = Math.round(this.Y(my));
    if (t === 'none') return;
    if (t === 'beak') {
      var bc = this.spec.bc || '#f0b030';
      this.po([[hx - r * 0.24, my - r * 0.18], [hx + r * 0.24, my - r * 0.18], [hx, my + r * 0.3]], HORN, { light: 0.7 });
      void bc;
      return;
    }
    if (t === 'smile') { g.put(X - 1, Y, DARK, 0); g.put(X, Y + 1, DARK, 0); g.put(X + 1, Y, DARK, 0); if (this.s > 0.75) { g.put(X - 2, Y - 1, DARK, 0); g.put(X + 2, Y - 1, DARK, 0); } }
    else if (t === 'open') { g.ellipse(X + 0.5, Y + 0.5, Math.max(1.5, this.L(r * 0.16)), Math.max(1.5, this.L(r * 0.14)), MOUTH, { light: 0.4 }); }
    else if (t === 'fang') {
      for (var i = -2; i <= 2; i++) g.put(X + i, Y, DARK, 0);
      g.put(X - 2, Y + 1, SHINE, 1); g.put(X + 2, Y + 1, SHINE, 1);
      if (this.s > 0.75) { g.put(X - 2, Y + 2, SHINE, 1); g.put(X + 2, Y + 2, SHINE, 1); }
    } else if (t === 'grin') {
      for (var j = -3; j <= 3; j++) g.put(X + j, Y + (Math.abs(j) === 3 ? -1 : 0), DARK, 0);
      for (var k = -2; k <= 2; k++) g.put(X + k, Y + 1, SHINE, 1);
    } else if (t === 'flat') { for (var q = -1; q <= 1; q++) g.put(X + q, Y, DARK, 0); }
  };

  B.face = function (G) {
    this.eyes(G);
    this.mouth(G);
    var r = G.hr, g = this.g;
    if (this.has('cheeks')) {
      var self = this;
      [-1, 1].forEach(function (d) { self.el(G.hx + d * r * 0.66, G.hy + r * 0.38, r * 0.16, r * 0.11, CHEEK, { light: 0.6 }); });
    }
    if (this.has('whiskers')) {
      [-1, 1].forEach(function (d) {
        var X = this.X(G.hx + d * r * 0.62), Y = this.Y(G.hy + r * 0.42);
        g.line(X, Y, X + d * this.L(r * 0.55), Y - 1, DARK, 0.4, 0.4, { light: 0.4 });
        g.line(X, Y + 2, X + d * this.L(r * 0.55), Y + 3, DARK, 0.4, 0.4, { light: 0.4 });
      }, this);
    }
    if (this.has('gem')) this.crystal(G.hx, G.hy - r * 0.35, r * 0.4, r * 0.18);
    if (this.has('tusks')) {
      var s2 = this;
      [-1, 1].forEach(function (d) { s2.cv(G.hx + d * r * 0.3, G.hy + r * 0.5, G.hx + d * r * 0.7, G.hy + r * 0.95, G.hx + d * r * 0.55, G.hy + r * 0.2, HORN, r * 0.12, r * 0.05); });
    }
    if (this.has('trunk')) this.cv(G.hx, G.hy + r * 0.35, G.hx, G.hy + r * 1.3, G.hx + r * 0.45, G.hy + r * 1.1, BASE, r * 0.22, r * 0.15, { edge: true });
  };

  B.tail = function (G, front) {
    var t = this.spec.tail;
    if (!t || t === 'none') return;
    var self = this;
    var bx = G.tx != null ? G.tx : G.bx + G.brx * 0.75, by = G.ty != null ? G.ty : G.by;
    var dir = front ? 1 : 0;
    var ex = front ? bx + 14 : 32 + 2, ey = front ? by - 18 : G.by + G.bry * 0.9 + 2;
    if (!front) { bx = 32; by = G.by + G.bry * 0.4; }
    var cx = front ? bx + 14 : 32 + 10, cy = front ? by + 2 : by + 10;
    void dir;
    var len = G.tailLen || 1;
    ex = bx + (ex - bx) * len; ey = by + (ey - by) * len;
    if (t === 'fluffy') {
      if (front) { self.el(ex - 3, ey + 6, 7.5, 10, BASE, { edge: true }); self.el(ex - 1, ey - 1, 4.5, 4.5, ACC, { edge: false }); }
      else self.el(32, by + 6, 8, 7, BASE, { edge: true });
    } else if (t === 'thin' || t === 'curl') {
      self.cv(bx, by, cx, cy, ex, ey, BASE, 2.2, 1.2, { edge: true });
      if (t === 'curl') self.el(ex + 1.5, ey - 1.5, 3, 3, ACC);
    } else if (t === 'flame') {
      self.cv(bx, by, cx, cy, ex, ey + 4, BASE, 2.6, 1.8, { edge: true });
      self.flame(ex, ey + 5, 14, 5.5);
    } else if (t === 'leaf') {
      self.cv(bx, by, cx, cy, ex, ey + 2, BASE, 2.4, 1.5, { edge: true });
      self.leafShape(self.spec && ex - 0 || ex, ey + 2, 12, -Math.PI / 2 + 0.3, 4.5);
    } else if (t === 'bolt') {
      if (front) {
        self.po([[bx - 2, by + 2], [bx + 10, by - 6], [bx + 6, by - 8], [bx + 16, by - 20], [bx + 13, by - 21], [bx + 1, by - 11], [bx + 5, by - 9], [bx - 2, by - 3]], ACC, { edge: true });
      } else self.bolt(32, by + 14, 16, 8, ACC);
    } else if (t === 'fin') {
      self.cv(bx, by, cx, cy, ex, ey + 5, BASE, 3, 2, { edge: true });
      self.po([[ex, ey + 6], [ex + 8, ey - 6], [ex + 2, ey], [ex - 8, ey - 4]], ACC, { edge: true });
    } else if (t === 'club') {
      self.cv(bx, by, cx, cy, ex, ey + 2, BASE, 2.8, 2, { edge: true });
      self.el(ex, ey + 1, 5, 5, ACC, { edge: true });
    } else if (t === 'spike') {
      self.cv(bx, by, cx, cy, ex, ey + 2, BASE, 3, 1.6, { edge: true });
      self.po([[ex - 3, ey + 2], [ex + 2, ey - 8], [ex + 3, ey + 3]], HORN);
    } else if (t === 'feather') {
      for (var k = -2; k <= 2; k++) self.ln(32, G.by + G.bry * 0.6, 32 + k * 5, G.by + G.bry + 8 - Math.abs(k) * 1.5, ACC, 2.4, 1.4, { edge: true });
    } else if (t === 'long') {
      self.cv(bx, by + 2, bx + 16, by + 14, bx + 24, by - 4, BASE, 3.2, 1.2, { edge: true });
    }
  };

  B.wings = function (G, front) {
    var t = this.spec.wing;
    if (!t || t === 'none') return;
    var self = this;
    var sx = G.wx != null ? G.wx : G.bx, sy = G.wy != null ? G.wy : G.by - G.bry * 0.45;
    var span = G.wspan || 20;
    [-1, 1].forEach(function (d) {
      var x0 = sx + d * 5;
      if (t === 'bird') {
        self.po([[x0, sy - 2], [x0 + d * span * 0.6, sy - 12], [x0 + d * span, sy - 10], [x0 + d * span * 0.95, sy - 2], [x0 + d * span * 0.7, sy + 6], [x0 + d * span * 0.3, sy + 10], [x0, sy + 8]], WING, { edge: true });
        for (var f = 0; f < 3; f++) self.ln(x0 + d * span * (0.45 + f * 0.18), sy - 8 + f * 2, x0 + d * span * (0.35 + f * 0.17), sy + 6 - f, WING, 0.5, 0.5, { light: 0.3 });
      } else if (t === 'bat') {
        self.po([[x0, sy - 4], [x0 + d * span * 0.55, sy - 14], [x0 + d * span, sy - 12], [x0 + d * span * 0.85, sy + 2], [x0 + d * span * 0.62, sy - 1], [x0 + d * span * 0.45, sy + 6], [x0 + d * span * 0.25, sy + 2], [x0, sy + 8]], WING, { edge: true });
        self.ln(x0, sy - 4, x0 + d * span, sy - 12, DARK, 0.6, 0.4, { light: 0.3 });
      } else if (t === 'bug') {
        self.el(x0 + d * span * 0.5, sy - 8, span * 0.5, 8, WING, { light: 0.95, edge: true });
        self.el(x0 + d * span * 0.42, sy + 4, span * 0.38, 6, WING, { light: 0.85, edge: true });
      } else if (t === 'fin') {
        self.po([[x0, sy], [x0 + d * span * 0.9, sy - 6], [x0 + d * span, sy + 4], [x0, sy + 8]], ACC, { edge: true });
      }
    });
    void front;
  };

  B.mane = function (G) {
    var self = this;
    for (var k = 0; k < 9; k++) {
      var a = Math.PI * 0.9 + k / 8 * Math.PI * 1.2;
      self.el(G.hx + Math.cos(a) * G.hr * 0.95, G.hy + Math.sin(a) * G.hr * 0.95 + G.hr * 0.15, G.hr * 0.42, G.hr * 0.42, ACC);
    }
  };

  // ---------- body plans ----------
  var PLANS = {};

  PLANS.quad = function (b, front) {
    if (front) return PLANS.quad34(b);
    var G = { bx: 32, by: 45, brx: 16, bry: 10.5, hx: 32, hy: 27, hr: 12.5 };
    if (b.spec.big) { G.brx = 18; G.bry = 12; G.hr = 11.5; G.hy = 29; }
    b.el(20, 53, 4.6, 7, BASE, { bias: -0.12 });
    b.el(44, 53, 4.6, 7, BASE, { bias: -0.12 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE);
    b.pattern(G, front);
    b.el(26.5, 55.5, 4, 6.5, BASE, { edge: true });
    b.el(37.5, 55.5, 4, 6.5, BASE, { edge: true });
    b.headBlock(G, front);
    return G;
  };
  // front view of a four-legged Kit in a three-quarter pose: head forward-left, body trailing right
  PLANS.quad34 = function (b) {
    var big = !!b.spec.big;
    var G = { bx: 34, by: 44, brx: big ? 19 : 16.5, bry: big ? 12 : 10, hx: 23, hy: big ? 29 : 30, hr: big ? 12 : 12.5, tx: 44, ty: 42, turned: true };
    b.tail(G, true); b.wings(G, true);
    // far legs (shaded, behind the body)
    b.el(41, 54, 4, 6.8, BASE, { light: 0.3 });
    b.el(48.5, 52.5, 3.8, 6.2, BASE, { light: 0.25 });
    b.el(41, 60.3, 3.4, 1.8, BELLY, { light: 0.4 });
    b.el(48.5, 58.6, 3.2, 1.7, BELLY, { light: 0.35 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE);
    if (b.spec.pat === 'belly' || (!b.spec.pat && (b.spec.stage || 1) === 1)) b.recolor(BASE, BELLY, b.inEl(31, 50, 9, 5));
    b.pattern(G, true);
    // near legs
    b.el(21, 55.5, 4.3, 6.8, BASE, { edge: true });
    b.el(30.5, 56, 4.2, 6.4, BASE, { edge: true });
    b.el(21, 60.6, 3.8, 2, BELLY, { light: 0.7 });
    b.el(30.5, 60.8, 3.7, 2, BELLY, { light: 0.7 });
    if (b.has('claws')) [19, 22.5, 28.5, 32].forEach(function (x) { b.el(x + 0.5, 62, 0.9, 0.9, HORN, { light: 0.9 }); });
    b.headBlock(G, true);
    return G;
  };

  PLANS.biped = function (b, front) {
    var G = { bx: 32, by: 44, brx: 11, bry: 12, hx: 32, hy: 24, hr: 12, tx: 40, ty: 50 };
    if (b.spec.big) { G.brx = 14; G.bry = 13; G.hr = 10.5; G.hy = 23; }
    if (front) { b.tail(G, true); b.wings(G, true); }
    b.el(26, 56, 4.8, 6.5, BASE, { bias: -0.05 });
    b.el(38, 56, 4.8, 6.5, BASE, { bias: -0.05 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE);
    if (front && (b.spec.pat === 'belly' || (!b.spec.pat && (b.spec.stage || 1) === 1))) b.recolor(BASE, BELLY, b.inEl(31, 46, G.brx * 0.62, G.bry * 0.7));
    b.pattern(G, front);
    b.el(26, 60, 5, 2.4, b.spec.feet ? ACC : BASE, { edge: true, bias: 0.05 });
    b.el(38, 60, 5, 2.4, b.spec.feet ? ACC : BASE, { edge: true, bias: 0.05 });
    var ax = G.brx + 2;
    b.ln(32 - ax + 3, 38, 32 - ax - 2, 47, BASE, 3.2, 2.6, { edge: true });
    b.ln(32 + ax - 3, 38, 32 + ax + 2, 47, BASE, 3.2, 2.6, { edge: true });
    if (b.has('fists')) { b.el(32 - ax - 2, 48, 4, 3.6, ACC, { edge: true }); b.el(32 + ax + 2, 48, 4, 3.6, ACC, { edge: true }); }
    if (b.has('claws')) { b.el(32 - ax - 2.5, 50, 1, 1.2, HORN, { light: 0.9 }); b.el(32 + ax + 2.5, 50, 1, 1.2, HORN, { light: 0.9 }); }
    b.headBlock(G, front);
    return G;
  };

  PLANS.blob = function (b, front) {
    var G = { bx: 32, by: 44, brx: 17, bry: 15.5, hx: 32, hy: 42, hr: 15, eyeSep: 0.38, mouthDY: 0.36, tx: 44, ty: 48 };
    if (front) { b.tail(G, true); b.wings(G, true); }
    b.ears(G);
    b.horns(G, false);
    b.el(24, 59, 5, 3, BASE, { bias: -0.1 });
    b.el(40, 59, 5, 3, BASE, { bias: -0.1 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE, { edge: true });
    if (front && b.spec.pat === 'belly') b.recolor(BASE, BELLY, b.inEl(32, 51, 10, 7));
    b.pattern(G, front);
    if (b.has('arms')) { b.el(15, 47, 3.6, 3, BASE, { edge: true }); b.el(49, 47, 3.6, 3, BASE, { edge: true }); }
    b.horns(G, true);
    if (front) b.face(G);
    b.top(G);
    if (!front) b.tail(G, false);
    if (!front) b.wings(G, false);
    return G;
  };

  PLANS.bird = function (b, front) {
    var G = { bx: 32, by: 42, brx: 12, bry: 13, hx: 32, hy: 24, hr: 10.5, wy: 36, wspan: 22, eyeSep: 0.42 };
    if (!b.spec.wing) b.spec.wing = 'bird';
    if (front) { b.wings(G, true); }
    b.tail(G, true);
    b.ln(28, 53, 27, 61, HORN, 1, 1);
    b.ln(36, 53, 37, 61, HORN, 1, 1);
    b.el(26, 61.3, 2.5, 1, HORN, { light: 0.7 });
    b.el(38, 61.3, 2.5, 1, HORN, { light: 0.7 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE);
    if (front && (!b.spec.pat || b.spec.pat === 'belly')) b.recolor(BASE, BELLY, b.inEl(32, 46, 8, 9));
    b.pattern(G, front);
    b.headBlock(G, front);
    if (!front) b.wings(G, false);
    return G;
  };

  PLANS.serpent = function (b, front) {
    var G = { bx: 32, by: 48, brx: 17, bry: 8, hx: 32, hy: 21, hr: 10, eyeSep: 0.44, mouthDY: 0.5, tx: 46, ty: 55 };
    b.wings(G, true);
    b.el(32, 55, 19, 7, BASE, { bias: -0.08 });
    b.el(30, 47, 14, 6.5, BASE, { edge: true });
    b.cv(32, 46, 22, 36, 32, 26, BASE, 6.5, 5.5, { edge: true });
    if (front) b.recolor(BASE, BELLY, function (x, y) { return y > b.Y(24) && y < b.Y(46) && Math.abs(x - b.X(28.5)) < b.L(3.5); });
    b.pattern(G, front);
    if (front && b.spec.tail) b.tail({ bx: 48, by: 55, brx: 1, bry: 1, hx: 0, hy: 0, hr: 1, tx: 49, ty: 56 }, true);
    b.headBlock(G, front);
    return G;
  };

  PLANS.fish = function (b, front) {
    var G = { bx: 30, by: 38, brx: 18, bry: 14, hx: 26, hy: 36, hr: 13, eyeSep: 0.42, mouthDY: 0.45 };
    // tail fin
    b.po([[44, 38], [60, 24], [56, 38], [60, 52]], ACC, { edge: true });
    b.po([[24, 26], [34, 14], [42, 27]], ACC);
    b.el(G.bx, G.by, G.brx, G.bry, BASE, { edge: true });
    if (front) b.recolor(BASE, BELLY, b.inEl(28, 46, 14, 6));
    b.pattern(G, front);
    b.po([[30, 44], [38, 54], [22, 50]], ACC, { edge: true });
    if (front) { b.eyes(G); b.mouth(G); if (b.has('gem') || b.spec.top) b.top(G); }
    else b.top(G);
    if (b.has('lure')) { b.cv(20, 26, 12, 12, 6, 20, DARK, 0.6, 0.5, { light: 0.4 }); b.el(6, 21, 3, 3, GLOW, { light: 0.9 }); }
    G.float = true;
    return G;
  };

  PLANS.bug = function (b, front) {
    var G = { bx: 32, by: 47, brx: 12, bry: 10, hx: 32, hy: 26, hr: 9.5, wy: 36, wspan: 18, eyeSep: 0.45 };
    if (front) b.wings(G, true);
    [0, 1, 2].forEach(function (k) {
      var y = 40 + k * 5;
      b.ln(24, y, 12 - k, y + 9, DARK, 0.9, 0.7, { light: 0.35 });
      b.ln(40, y, 52 + k, y + 9, DARK, 0.9, 0.7, { light: 0.35 });
    });
    b.el(32, 51, 12, 10, BASE);
    b.el(32, 38, 9, 7, BASE, { edge: true });
    if (b.spec.pat === 'bands' || !b.spec.pat) b.recolor(BASE, ACC, function (x, y) { var yy = y - b.Y(44); return yy > 0 && Math.floor(yy / b.L(4)) % 2 === 1; });
    else b.pattern(G, front);
    b.headBlock(G, front);
    if (!front) b.wings(G, false);
    return G;
  };

  PLANS.golem = function (b, front) {
    var G = { bx: 32, by: 42, brx: 17, bry: 14, hx: 32, hy: 21, hr: 9.5, eyeSep: 0.42 };
    b.rectLeg = true;
    b.el(24, 56, 6, 6.5, BASE, { bias: -0.1 });
    b.el(40, 56, 6, 6.5, BASE, { bias: -0.1 });
    b.po([[14, 30], [50, 30], [47, 55], [17, 55]], BASE, { light: null });
    b.el(32, 31, 18, 5, BASE, { bias: 0.08 });
    if (front && b.spec.pat === 'belly') b.recolor(BASE, BELLY, b.inEl(32, 44, 9, 8));
    b.pattern(G, front);
    b.el(11, 40, 7, 10, BASE, { edge: true });
    b.el(53, 40, 7, 10, BASE, { edge: true });
    b.el(10, 51, 6.5, 5.5, ACC, { edge: true });
    b.el(54, 51, 6.5, 5.5, ACC, { edge: true });
    if (b.has('spikes')) [20, 32, 44].forEach(function (x) { b.po([[x - 4, 30], [x, 22], [x + 4, 30]], ACC); });
    b.headBlock(G, front);
    return G;
  };

  PLANS.ghost = function (b, front) {
    var G = { bx: 32, by: 34, brx: 14, bry: 14, hx: 32, hy: 32, hr: 14, eyeSep: 0.36, mouthDY: 0.42 };
    b.wings(G, true);
    b.ears(G);
    b.horns(G, false);
    b.po([[18, 36], [46, 36], [44, 52], [38, 47], [34, 57], [28, 49], [22, 55], [20, 46]], BASE);
    b.el(G.bx, G.by, G.brx, G.bry, BASE, { edge: true });
    b.pattern(G, front);
    b.el(15, 40, 4, 3, BASE, { edge: true });
    b.el(49, 40, 4, 3, BASE, { edge: true });
    b.horns(G, true);
    if (b.has('mane')) b.mane(G);
    if (front) b.face(G);
    b.top(G);
    G.float = true;
    return G;
  };

  PLANS.dragon = function (b, front) {
    var G = { bx: 32, by: 44, brx: 12.5, bry: 12.5, hx: 32, hy: 22, hr: 10.5, tx: 40, ty: 52, wy: 34, wspan: 20 };
    if (!b.spec.wing) b.spec.wing = 'bat';
    if (!b.spec.tail) b.spec.tail = 'long';
    if (front) { b.tail(G, true); b.wings(G, true); }
    b.el(26, 56, 5.5, 6.5, BASE, { bias: -0.05 });
    b.el(38, 56, 5.5, 6.5, BASE, { bias: -0.05 });
    b.el(G.bx, G.by, G.brx, G.bry, BASE);
    if (front) b.recolor(BASE, BELLY, function (x, y) { return Math.abs(x - b.X(32)) < b.L(6.5) && y > b.Y(35) && y < b.Y(56); });
    b.pattern(G, front);
    b.el(26, 60.5, 5.5, 2.2, BASE, { edge: true });
    b.el(38, 60.5, 5.5, 2.2, BASE, { edge: true });
    b.ln(22, 38, 18, 46, BASE, 3, 2.4, { edge: true });
    b.ln(42, 38, 46, 46, BASE, 3, 2.4, { edge: true });
    b.el(17.5, 47.5, 1, 1.4, HORN, { light: 0.9 });
    b.el(46.5, 47.5, 1, 1.4, HORN, { light: 0.9 });
    b.cv(32, 36, 30, 32, 32, 28, BASE, 5, 4.5, { edge: true });
    b.headBlock(G, front);
    if (!front) { b.wings(G, false); b.tail(G, false); }
    return G;
  };

  PLANS.ray = function (b, front) {
    var G = { bx: 32, by: 36, brx: 12, bry: 9, hx: 32, hy: 32, hr: 10, eyeSep: 0.45, mouthDY: 0.55 };
    b.cv(32, 42, 34, 54, 44, 60, BASE, 1.6, 0.6, { edge: true });
    b.po([[32, 24], [58, 30], [62, 38], [46, 40], [32, 46], [18, 40], [2, 38], [6, 30]], BASE, { edge: true });
    b.recolor(BASE, ACC, function (x, y) { return (x < b.X(14) || x > b.X(50)) && y < b.Y(40); });
    b.el(G.bx, G.by, G.brx, G.bry, BASE, { edge: true });
    b.pattern(G, front);
    b.horns(G, false);
    b.horns(G, true);
    if (front) b.face(G);
    b.top(G);
    G.float = true;
    return G;
  };

  PLANS.flower = function (b, front) {
    var G = { bx: 32, by: 50, brx: 9, bry: 8, hx: 32, hy: 32, hr: 11, eyeSep: 0.38 };
    b.leafShape(30, 58, 14, Math.PI - 0.35, 4.5);
    b.leafShape(34, 58, 14, 0.35, 4.5);
    b.el(32, 51, 8, 8, LEAF);
    for (var p = 0; p < 8; p++) {
      var an = p / 8 * Math.PI * 2;
      b.el(32 + Math.cos(an) * 13, 32 + Math.sin(an) * 13, 6, 6, ACC, { edge: true });
    }
    b.el(G.hx, G.hy, G.hr, G.hr, BASE, { edge: true });
    if (front) b.face(G);
    b.top(G);
    return G;
  };

  // shared head assembly for most plans
  B.headBlock = function (G, front) {
    if (front && this.turn && !G.turned) { G.hx -= 2; G.turned = true; }
    this.ears(G);
    this.horns(G, false);
    if (this.has('mane')) this.mane(G);
    this.el(G.hx, G.hy, G.hr * (G.hrx || 1.05), G.hr, BASE, { edge: true });
    if (this.spec.muzzle || (this.spec.p === 'quad' && this.spec.muzzle !== false)) {
      if (front) this.el(G.hx - G.hr * 0.12 * this.turn, G.hy + G.hr * 0.45, G.hr * 0.48, G.hr * 0.36, BELLY, { light: 0.72 });
    }
    if (this.spec.pat === 'mask' && front) this.recolor(BASE, ACC, this.inEl(G.hx, G.hy - G.hr * 0.02, G.hr * 1.05, G.hr * 0.3));
    if (this.spec.pat === 'crown') this.recolor(BASE, ACC, function (x, y) { return y < this.Y(G.hy - G.hr * 0.45); }.bind(this));
    this.horns(G, true);
    if (front) this.face(G);
    else if (this.spec.pat === 'stripes') this.recolor(BASE, ACC, function (x, y) { return y < this.Y(G.hy) && (x >> 1) % 3 === 0; }.bind(this));
    if (this.has('collar')) {
      for (var k = -3; k <= 3; k++) this.el(G.hx + k * G.hr * 0.3, G.hy + G.hr * 0.98, G.hr * 0.24, G.hr * 0.2, BELLY, { light: 0.75 });
    }
    if (this.has('scarf')) this.el(G.hx, G.hy + G.hr * 1.0, G.hr * 0.8, G.hr * 0.18, ACC, { light: 0.6, edge: true });
    this.top(G);
    if (!front) { this.tail(G, false); }
  };

  B.pattern = function (G, front) {
    var p = this.spec.pat, self = this;
    if (this.has('shell')) {
      var sy = G.by - (front ? 0 : 1);
      if (!front) this.el(G.bx, sy, G.brx * 0.95, G.bry * 0.95, ACC, { edge: true });
      else this.recolor(BASE, ACC, function (x, y) { return y < self.Y(G.by - G.bry * 0.35); });
    }
    if (this.has('spikes') && this.spec.p !== 'golem') {
      for (var k = -2; k <= 2; k++) this.po([[G.bx + k * 5 - 2.5, G.by - G.bry * 0.7], [G.bx + k * 5, G.by - G.bry * 1.25 - (2 - Math.abs(k))], [G.bx + k * 5 + 2.5, G.by - G.bry * 0.7]], ACC);
    }
    if (this.has('leaves')) {
      this.leafShape(G.bx - G.brx * 0.5, G.by - G.bry * 0.5, 8, Math.PI + 0.6, 2.8);
      this.leafShape(G.bx + G.brx * 0.5, G.by - G.bry * 0.5, 8, -0.6, 2.8);
    }
    if (!p || p === 'none' || p === 'belly' || p === 'mask' || p === 'crown') return;
    var inBody = this.inEl(G.bx, G.by, G.brx, G.bry);
    if (p === 'stripes') {
      this.recolor(BASE, ACC, function (x, y) { return inBody(x, y) && Math.floor((x - self.X(G.bx)) / self.L(4) + 100) % 3 === 0 && y < self.Y(G.by + G.bry * 0.3); });
    } else if (p === 'spots') {
      var rs = PK.seeded(PK.hash(this.spec.n || 'x'));
      for (var s = 0; s < 6; s++) {
        var sx = G.bx + (rs() * 2 - 1) * G.brx * 0.7, sy2 = G.by + (rs() * 2 - 1) * G.bry * 0.6;
        this.recolor(BASE, ACC, this.inEl(sx, sy2, 2.6, 2.2));
      }
    } else if (p === 'bands') {
      this.recolor(BASE, ACC, function (x, y) { return inBody(x, y) && Math.floor((y - self.Y(G.by - G.bry)) / self.L(3.5)) % 2 === 1; });
    } else if (p === 'back') {
      this.recolor(BASE, ACC, function (x, y) { return inBody(x, y) && y < self.Y(G.by - G.bry * 0.35); });
    }
  };

  B.build = function () {
    var front = this.view === 'front';
    var plan = PLANS[this.spec.p] || PLANS.blob;
    var G = plan(this, front);
    return { G: G };
  };

  var cache = {};
  function get(id, view, prism, tint) {
    var key = id + '|' + view + '|' + (prism ? 1 : 0) + '|' + (tint || 0);
    if (cache[key]) return cache[key];
    var k = PK.KITS[id];
    var spec = Object.assign({ n: k.name, stage: k.stage }, k.art);
    var b = new Builder(spec, view, prism);
    var info = b.build();
    var canvas = b.g.render(palette(spec, prism, tint), { dither: 0.45 });
    canvas.float = !!info.G.float;
    cache[key] = canvas;
    return canvas;
  }
  // Small party icon (32x32) via scaled render
  function icon(id, prism, tint) {
    var key = id + '|icon|' + (prism ? 1 : 0) + '|' + (tint || 0);
    if (cache[key]) return cache[key];
    var k = PK.KITS[id];
    var spec = Object.assign({ n: k.name, stage: k.stage, icon: true }, k.art);
    spec.s = 0.5;
    var b = new Builder(spec, 'front', prism, 64);
    b.build();
    var full = b.g.render(palette(spec, prism, tint), { dither: 0.3 });
    var c = PK.makeCanvas(32, 32);
    c.getContext('2d').drawImage(full, 16, 30, 32, 32, 0, 0, 32, 32);
    cache[key] = c;
    return c;
  }
  PK.kitArt = { get: get, icon: icon, PLANS: PLANS, TINTS: TINTS };
})();

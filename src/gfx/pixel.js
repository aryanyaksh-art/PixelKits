// PixelGrid: build pixel art from shaded primitives, then quantize to tone ramps with outlines.
(function () {
  'use strict';
  var PK = window.PK;

  function PG(w, h) {
    this.w = w; this.h = h;
    this.mat = new Int16Array(w * h).fill(-1);
    this.lit = new Float32Array(w * h);
    this.edge = new Uint8Array(w * h);
    this.tmp = new Uint8Array(w * h);
    this.lx = -0.45; this.ly = -0.6; // light direction (from top-left)
  }
  var P = PG.prototype;

  P.put = function (x, y, m, l) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
    var i = y * this.w + x;
    this.mat[i] = m; this.lit[i] = l; this.edge[i] = 0;
    return i;
  };
  P.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
    return this.mat[y * this.w + x];
  };
  P.clear = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.mat[y * this.w + x] = -1;
  };

  P._finishPrim = function (list, o) {
    if (!o || !o.edge) return;
    var t = this.tmp, w = this.w, h = this.h, i, k;
    for (k = 0; k < list.length; k++) t[list[k]] = 1;
    for (k = 0; k < list.length; k++) {
      i = list[k];
      var x = i % w, y = (i / w) | 0;
      var ns = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (var n = 0; n < 4; n++) {
        var j = ns[n];
        if (j >= 0 && !t[j] && this.mat[j] >= 0) { this.edge[i] = 1; break; }
      }
    }
    for (k = 0; k < list.length; k++) t[list[k]] = 0;
  };

  // Shaded ellipse (sphere-like lighting unless o.light given)
  P.ellipse = function (cx, cy, rx, ry, m, o) {
    o = o || {};
    if (rx <= 0 || ry <= 0) return;
    var x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx), y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    var list = [];
    var lx = o.lx != null ? o.lx : this.lx, ly = o.ly != null ? o.ly : this.ly;
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        var d = dx * dx + dy * dy;
        if (d > 1) continue;
        if (o.clip && !o.clip(x, y)) continue;
        var l;
        if (o.light != null) l = o.light;
        else {
          var nz = Math.sqrt(Math.max(0, 1 - d));
          l = (lx * dx + ly * dy + 0.62 * nz);
          l = 0.5 + l * 0.62 + (o.bias || 0);
        }
        var i = this.put(x, y, m, l);
        if (i >= 0) list.push(i);
      }
    }
    this._finishPrim(list, o);
  };

  P.rect = function (x, y, w, h, m, o) {
    o = o || {};
    var list = [];
    for (var yy = Math.round(y); yy < Math.round(y + h); yy++) {
      for (var xx = Math.round(x); xx < Math.round(x + w); xx++) {
        var l = o.light != null ? o.light : 0.62;
        if (o.vgrad) l = 0.85 - 0.5 * (yy - y) / Math.max(1, h);
        if (o.hgrad) l = 0.85 - 0.5 * (xx - x) / Math.max(1, w);
        var i = this.put(xx, yy, m, l);
        if (i >= 0) list.push(i);
      }
    }
    this._finishPrim(list, o);
  };

  function inPoly(px, py, pts) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }

  P.poly = function (pts, m, o) {
    o = o || {};
    var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (var k = 0; k < pts.length; k++) {
      minx = Math.min(minx, pts[k][0]); maxx = Math.max(maxx, pts[k][0]);
      miny = Math.min(miny, pts[k][1]); maxy = Math.max(maxy, pts[k][1]);
    }
    var list = [];
    var hh = Math.max(1, maxy - miny), ww = Math.max(1, maxx - minx);
    for (var y = Math.floor(miny); y <= Math.ceil(maxy); y++) {
      for (var x = Math.floor(minx); x <= Math.ceil(maxx); x++) {
        if (!inPoly(x + 0.5, y + 0.5, pts)) continue;
        var l = o.light != null ? o.light : 0.82 - 0.42 * (y - miny) / hh - 0.12 * (x - minx) / ww;
        var i = this.put(x, y, m, l);
        if (i >= 0) list.push(i);
      }
    }
    this._finishPrim(list, o);
  };

  // Thick line made of discs; tapering supported via r0 -> r1
  P.line = function (x0, y0, x1, y1, m, r0, r1, o) {
    o = o || {};
    r1 = r1 == null ? r0 : r1;
    var dist = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(1, Math.ceil(dist * 1.5));
    var list = [];
    var self = this;
    for (var s = 0; s <= steps; s++) {
      var t = s / steps;
      var cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t, r = r0 + (r1 - r0) * t;
      if (r < 0.75) {
        var i0 = self.put(Math.floor(cx), Math.floor(cy), m, o.light != null ? o.light : 0.6);
        if (i0 >= 0) list.push(i0);
        continue;
      }
      for (var y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
        for (var x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          var dx = x + 0.5 - cx, dy = y + 0.5 - cy;
          if (dx * dx + dy * dy > r * r) continue;
          var nd = Math.sqrt(dx * dx + dy * dy) / r;
          var l = o.light != null ? o.light : 0.55 + 0.35 * (1 - nd) + (this.lx * dx + this.ly * dy) / r * 0.3;
          var i = self.put(x, y, m, l);
          if (i >= 0) list.push(i);
        }
    }
    this._finishPrim(list, o);
  };

  // Quadratic curve stroke
  P.curve = function (x0, y0, cx, cy, x1, y1, m, r0, r1, o) {
    var steps = 12, px = x0, py = y0;
    for (var s = 1; s <= steps; s++) {
      var t = s / steps, it = 1 - t;
      var x = it * it * x0 + 2 * it * t * cx + t * t * x1;
      var y = it * it * y0 + 2 * it * t * cy + t * t * y1;
      var ra = r0 + (r1 - r0) * ((s - 1) / steps), rb = r0 + (r1 - r0) * (s / steps);
      this.line(px, py, x, y, m, ra, rb, o);
      px = x; py = y;
    }
  };

  P.px = function (x, y, m, l) { this.put(x, y, m, l == null ? 0.6 : l); };

  // Mirror left half onto right half (x < w/2 copied to w-1-x)
  P.mirror = function () {
    var w = this.w;
    for (var y = 0; y < this.h; y++)
      for (var x = 0; x < w / 2; x++) {
        var a = y * w + x, b = y * w + (w - 1 - x);
        this.mat[b] = this.mat[a]; this.lit[b] = this.lit[a]; this.edge[b] = this.edge[a];
      }
  };

  var BAYER = [0, 0.5, 0.75, 0.25];

  // pal: array indexed by material: either a 4-color ramp array or a flat color string.
  // opts: outline ('auto' | color | null), dither (0..1), outlineInner (bool)
  P.render = function (pal, opts) {
    opts = opts || {};
    var w = this.w, h = this.h;
    var c = PK.makeCanvas(w, h);
    var x2 = c.getContext('2d');
    var img = x2.createImageData(w, h);
    var d = img.data;
    var rgbCache = {};
    function rgb(hex) {
      var v = rgbCache[hex];
      if (!v) v = rgbCache[hex] = PK.color.hexToRgb(hex);
      return v;
    }
    var dither = opts.dither == null ? 0.35 : opts.dither;
    var outlineCol = opts.outline === undefined ? 'auto' : opts.outline;
    var y, x, i;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        i = y * w + x;
        var m = this.mat[i];
        var col = null;
        if (m >= 0) {
          var p = pal[m];
          if (p == null) continue;
          if (typeof p === 'string') col = p;
          else {
            var l = this.lit[i];
            var b = (BAYER[(y & 1) * 2 + (x & 1)] - 0.5) * dither * 0.34;
            var t = l + b;
            var tone = t < 0.3 ? 0 : t < 0.52 ? 1 : t < 0.8 ? 2 : 3;
            if (p.length === 5 && t > 1.02) tone = 4;
            if (this.edge[i]) tone = Math.max(0, Math.min(tone, 1) - 1);
            col = p[tone];
          }
        } else if (outlineCol) {
          // outline pass: empty pixel next to filled one
          var nb = -1;
          if (x > 0 && this.mat[i - 1] >= 0) nb = this.mat[i - 1];
          else if (x < w - 1 && this.mat[i + 1] >= 0) nb = this.mat[i + 1];
          else if (y > 0 && this.mat[i - w] >= 0) nb = this.mat[i - w];
          else if (y < h - 1 && this.mat[i + w] >= 0) nb = this.mat[i + w];
          if (nb >= 0 && !(opts.noOutline && opts.noOutline[nb])) {
            if (outlineCol === 'auto') {
              var pp = pal[nb];
              col = typeof pp === 'string' ? PK.color.shade(pp, -0.6) : PK.color.shade(pp[0], -0.45);
            } else col = outlineCol;
          }
        }
        if (col) {
          var v = rgb(col), o = i * 4;
          d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
        }
      }
    }
    x2.putImageData(img, 0, 0);
    return c;
  };

  PK.PG = PG;

  // Paint from strings: rows of chars, map char -> color (undefined/'' = transparent)
  PK.paintRows = function (ctx, rows, map, ox, oy, flip) {
    ox = ox || 0; oy = oy || 0;
    for (var y = 0; y < rows.length; y++) {
      var r = rows[y];
      for (var x = 0; x < r.length; x++) {
        var col = map[r[x]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(ox + (flip ? r.length - 1 - x : x), oy + y, 1, 1);
      }
    }
  };
  PK.flipCanvas = function (src) {
    var c = PK.makeCanvas(src.width, src.height);
    var x = c.getContext('2d');
    x.translate(src.width, 0);
    x.scale(-1, 1);
    x.drawImage(src, 0, 0);
    return c;
  };
  PK.silhouette = function (src, color) {
    var c = PK.makeCanvas(src.width, src.height);
    var x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  };
})();

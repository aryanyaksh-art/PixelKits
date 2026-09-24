// Color utilities: hex/rgb/hsl conversion and hue-shifted shading ramps.
(function () {
  'use strict';
  var PK = window.PK;
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    var c = function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); };
    return '#' + c(r) + c(g) + c(b);
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h, s, l = (mx + mn) / 2;
    if (mx === mn) { h = s = 0; } else {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h * 360, s, l];
  }
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    var r, g, b;
    if (s === 0) { r = g = b = l; } else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
  }
  // Shift lightness with a hue shift: shadows drift toward blue/purple, highlights toward yellow.
  function shade(hex, amt) {
    var rgb = hexToRgb(hex), hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var h = hsl[0], s = hsl[1], l = hsl[2];
    var target = amt < 0 ? 250 : 55;
    var dh = ((target - h + 540) % 360) - 180;
    h += dh * Math.min(Math.abs(amt), 1) * 0.28;
    l = Math.max(0.03, Math.min(0.97, l + amt * (amt < 0 ? l : (1 - l))));
    s = Math.max(0, Math.min(1, s * (amt < 0 ? 1 + Math.abs(amt) * 0.15 : 1 - amt * 0.25)));
    var o = hslToRgb(h, s, l);
    return rgbToHex(o[0], o[1], o[2]);
  }
  function mix(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  }
  function hueRotate(hex, deg, satMul, lightAdd) {
    var rgb = hexToRgb(hex), hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var o = hslToRgb(hsl[0] + deg, Math.min(1, hsl[1] * (satMul || 1)), Math.max(0.05, Math.min(0.95, hsl[2] + (lightAdd || 0))));
    return rgbToHex(o[0], o[1], o[2]);
  }
  // 4-tone ramp [darkest, dark, base, light]
  function ramp(hex) {
    return [shade(hex, -0.55), shade(hex, -0.28), hex, shade(hex, 0.35)];
  }
  PK.color = { hexToRgb: hexToRgb, rgbToHex: rgbToHex, shade: shade, mix: mix, ramp: ramp, hueRotate: hueRotate, rgbToHsl: rgbToHsl, hslToRgb: hslToRgb };
})();

// Random helpers. Gameplay uses Math.random; art uses seeded mulberry32 for determinism.
(function () {
  'use strict';
  var PK = window.PK;
  PK.seeded = function (seed) {
    var a = seed >>> 0;
    var f = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = function (n) { return Math.floor(f() * n); };
    f.range = function (a, b) { return a + f() * (b - a); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    return f;
  };
  PK.hash = function (str) {
    var h = 2166136261 >>> 0;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  };
  PK.rnd = function (n) { return Math.floor(Math.random() * n); };
  PK.chance = function (p) { return Math.random() < p; };
  PK.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  PK.weighted = function (list, wkey) {
    var tot = 0, i;
    for (i = 0; i < list.length; i++) tot += list[i][wkey];
    var r = Math.random() * tot;
    for (i = 0; i < list.length; i++) { r -= list[i][wkey]; if (r < 0) return list[i]; }
    return list[list.length - 1];
  };
})();

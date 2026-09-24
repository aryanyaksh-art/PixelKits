// Canvas setup, integer scaling, screen effects (fade, flash, shake).
(function () {
  'use strict';
  var PK = window.PK;

  PK.initCanvas = function () {
    var c = document.getElementById('screen');
    c.width = PK.W;
    c.height = PK.H;
    PK.canvas = c;
    PK.ctx = c.getContext('2d');
    PK.ctx.imageSmoothingEnabled = false;
    window.addEventListener('resize', PK.resize);
    PK.resize();
  };

  PK.resize = function () {
    var c = PK.canvas;
    var pad = document.getElementById('touchpad');
    var padH = pad && pad.offsetParent !== null ? pad.offsetHeight : 0;
    var aw = window.innerWidth, ah = window.innerHeight - padH - 8;
    var s = Math.min(aw / PK.W, ah / PK.H);
    if (s >= 2) s = Math.floor(s);
    s = Math.max(1, s);
    c.style.width = Math.floor(PK.W * s) + 'px';
    c.style.height = Math.floor(PK.H * s) + 'px';
  };

  // Offscreen canvas helper
  PK.makeCanvas = function (w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return c;
  };

  var fade = { a: 0, target: 0, step: 0, color: '#000', res: null };
  var flash = { a: 0, color: '#fff', decay: 0 };
  var shake = { t: 0, mag: 0 };

  PK.fx = {
    update: function () {
      if (fade.a !== fade.target) {
        if (fade.a < fade.target) fade.a = Math.min(fade.target, fade.a + fade.step);
        else fade.a = Math.max(fade.target, fade.a - fade.step);
        if (fade.a === fade.target && fade.res) { var r = fade.res; fade.res = null; r(); }
      }
      if (flash.a > 0) flash.a = Math.max(0, flash.a - flash.decay);
      if (shake.t > 0) shake.t--;
    },
    draw: function (ctx) {
      if (fade.a > 0) {
        ctx.globalAlpha = fade.a;
        ctx.fillStyle = fade.color;
        ctx.fillRect(0, 0, PK.W, PK.H);
        ctx.globalAlpha = 1;
      }
      if (flash.a > 0) {
        ctx.globalAlpha = flash.a;
        ctx.fillStyle = flash.color;
        ctx.fillRect(0, 0, PK.W, PK.H);
        ctx.globalAlpha = 1;
      }
    },
    fadeOut: function (frames, color) {
      frames = frames || 16;
      fade.color = color || '#000';
      fade.target = 1;
      fade.step = 1 / frames;
      if (fade.a >= 1) return Promise.resolve();
      return new Promise(function (res) { fade.res = res; });
    },
    fadeIn: function (frames) {
      frames = frames || 16;
      fade.target = 0;
      fade.step = 1 / frames;
      if (fade.a <= 0) return Promise.resolve();
      return new Promise(function (res) { fade.res = res; });
    },
    setFade: function (a, color) { fade.a = fade.target = a; if (color) fade.color = color; },
    fadeLevel: function () { return fade.a; },
    flash: function (frames, color) {
      flash.a = 1;
      flash.color = color || '#fff';
      flash.decay = 1 / (frames || 8);
    },
    shake: function (frames, mag) { shake.t = frames || 12; shake.mag = mag || 2; },
    shakeOffset: function () {
      if (shake.t <= 0) return [0, 0];
      var m = shake.mag * (shake.t / 12 + 0.3);
      return [Math.round((Math.random() * 2 - 1) * m), Math.round((Math.random() * 2 - 1) * m * 0.5)];
    }
  };
})();

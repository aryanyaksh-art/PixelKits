// PixelKits engine core: fixed-timestep loop, scene stack, frame timers.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  PK.W = 240;
  PK.H = 160;
  PK.frame = 0;
  PK.scenes = [];
  PK.speed = 1; // debug turbo multiplier
  var timers = [];

  PK.push = function (s) {
    PK.scenes.push(s);
    if (s.enter) s.enter();
    return s;
  };
  PK.pop = function (s) {
    var i = s ? PK.scenes.lastIndexOf(s) : PK.scenes.length - 1;
    if (i < 0) return null;
    var r = PK.scenes.splice(i, 1)[0];
    if (r.exit) r.exit();
    return r;
  };
  PK.top = function () { return PK.scenes[PK.scenes.length - 1]; };
  PK.clearScenes = function () { while (PK.scenes.length) PK.pop(); };

  // Resolve after n frames of game time.
  PK.wait = function (n) {
    return new Promise(function (res) { timers.push({ n: Math.max(1, n | 0), res: res }); });
  };

  // Run an async function and log (not swallow silently) any error.
  PK.run = function (fn) {
    return Promise.resolve().then(fn).catch(function (e) {
      console.error(e);
      PK.lastError = e;
    });
  };

  PK.step = function () {
    PK.input.update();
    var top = PK.top();
    if (top && top.update) top.update();
    for (var i = 0; i < PK.scenes.length; i++) {
      var s = PK.scenes[i];
      if (s !== top && s.bgUpdate) s.bgUpdate();
    }
    for (var j = timers.length - 1; j >= 0; j--) {
      if (--timers[j].n <= 0) timers.splice(j, 1)[0].res();
    }
    if (PK.fx) PK.fx.update();
    if (PK.audio && PK.audio.update) PK.audio.update();
    if (PK.game && PK.game.tick) PK.game.tick();
    PK.frame++;
  };

  PK.draw = function () {
    var ctx = PK.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, PK.W, PK.H);
    var sh = PK.fx ? PK.fx.shakeOffset() : [0, 0];
    ctx.translate(sh[0], sh[1]);
    var start = 0;
    for (var i = PK.scenes.length - 1; i >= 0; i--) {
      if (PK.scenes[i].opaque) { start = i; break; }
    }
    for (var k = start; k < PK.scenes.length; k++) {
      var s = PK.scenes[k];
      if (s.draw) s.draw(ctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (PK.fx) PK.fx.draw(ctx);
  };

  PK.start = function () {
    var last = performance.now(), acc = 0, STEP = 1000 / 60, lastRaf = performance.now();
    // Fallback ticker when requestAnimationFrame is paused (hidden/embedded views)
    setInterval(function () {
      if (performance.now() - lastRaf > 120) tick(performance.now(), true);
    }, 33);
    function loop(now) {
      lastRaf = performance.now();
      tick(now, false);
      requestAnimationFrame(loop);
    }
    function tick(now, fallback) {
      now = fallback ? now : performance.now();
      acc += Math.min(now - last, 250);
      last = now;
      var n = 0;
      while (acc >= STEP && n < 6) {
        for (var t = 0; t < PK.speed; t++) {
          try { PK.step(); } catch (e) { console.error(e); PK.lastError = e; }
        }
        acc -= STEP;
        n++;
      }
      if (n >= 6) acc = 0;
      try { PK.draw(); } catch (e) { console.error(e); PK.lastError = e; }
    }
    requestAnimationFrame(loop);
  };

  // Debug/test helper: advance n frames synchronously
  PK.stepN = function (n) { for (var i = 0; i < n; i++) PK.step(); PK.draw(); return PK.frame; };

  PK.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
})();

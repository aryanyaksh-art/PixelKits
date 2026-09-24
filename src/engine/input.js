// Keyboard + touch input mapped to virtual handheld buttons.
(function () {
  'use strict';
  var PK = window.PK;
  var BTNS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'];
  var KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'a', Space: 'a', KeyJ: 'a',
    KeyX: 'b', Backspace: 'b', Escape: 'b', KeyK: 'b',
    Enter: 'start', Tab: 'start', KeyC: 'start',
    ShiftLeft: 'select', ShiftRight: 'select'
  };
  var keys = {};
  var touch = {};
  var latch = {}; // taps shorter than a frame still count as one press
  var down = {}, prev = {}, held = {}, pressed = {};
  var listeners = [];

  function unlock() {
    if (PK.audio && PK.audio.unlock) PK.audio.unlock();
  }

  window.addEventListener('keydown', function (e) {
    var b = KEYMAP[e.code];
    if (e.code === 'Backquote' && PK.debug) { PK.speed = PK.speed === 1 ? 4 : 1; }
    if (b) { e.preventDefault(); keys[e.code] = b; latch[b] = true; }
    unlock();
    for (var i = 0; i < listeners.length; i++) listeners[i](e);
  });
  window.addEventListener('keyup', function (e) {
    if (KEYMAP[e.code]) { e.preventDefault(); delete keys[e.code]; }
  });
  window.addEventListener('blur', function () { keys = {}; touch = {}; });
  window.addEventListener('pointerdown', unlock);

  PK.input = {
    pressed: pressed,
    update: function () {
      var raw = {};
      for (var k in keys) raw[keys[k]] = true;
      for (var t in touch) if (touch[t]) raw[t] = true;
      for (var i = 0; i < BTNS.length; i++) {
        var b = BTNS[i];
        prev[b] = down[b];
        down[b] = !!raw[b];
        if (latch[b] && !down[b]) {
          // tap happened entirely between frames: register one pressed frame
          down[b] = true;
          if (prev[b]) prev[b] = false;
        }
        latch[b] = false;
        pressed[b] = down[b] && !prev[b];
        held[b] = down[b] ? (held[b] || 0) + 1 : 0;
      }
    },
    p: function (b) { return !!pressed[b]; },
    h: function (b) { return !!down[b]; },
    held: function (b) { return held[b] || 0; },
    // press, then auto-repeat while held (for menus)
    rep: function (b) {
      var t = held[b] || 0;
      return t === 1 || (t > 18 && (t - 18) % 5 === 0);
    },
    ok: function () { return !!(pressed.a || pressed.start); },
    cancel: function () { return !!pressed.b; },
    anyPressed: function () {
      for (var i = 0; i < BTNS.length; i++) if (pressed[BTNS[i]]) return true;
      return false;
    },
    consume: function () { for (var i = 0; i < BTNS.length; i++) pressed[BTNS[i]] = false; },
    dir: function () {
      if (down.up) return 'up';
      if (down.down) return 'down';
      if (down.left) return 'left';
      if (down.right) return 'right';
      return null;
    },
    setTouch: function (b, v) { touch[b] = v; if (v) { latch[b] = true; unlock(); } },
    onKey: function (fn) { listeners.push(fn); }
  };
})();

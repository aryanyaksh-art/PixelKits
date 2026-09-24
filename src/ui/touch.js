// On-screen touch controls for phones/tablets.
(function () {
  'use strict';
  var PK = window.PK;
  PK.initTouch = function () {
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    document.body.classList.add('touch');
    var map = { 't-up': 'up', 't-down': 'down', 't-left': 'left', 't-right': 'right', 't-a': 'a', 't-b': 'b', 't-start': 'start', 't-select': 'select' };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var b = map[id];
      var on = function (e) { e.preventDefault(); el.classList.add('on'); PK.input.setTouch(b, true); };
      var off = function (e) { e.preventDefault(); el.classList.remove('on'); PK.input.setTouch(b, false); };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointerleave', off);
      el.addEventListener('pointercancel', off);
    });
    PK.resize();
  };
})();

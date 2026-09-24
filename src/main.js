// Boot
(function () {
  'use strict';
  var PK = window.PK;
  var params = new URLSearchParams(location.search);
  PK.debug = params.has('debug');
  window.addEventListener('load', function () {
    PK.initCanvas();
    PK.initTouch();
    if (PK.game && PK.game.init) PK.game.init();
    var g = params.get('gallery');
    if (g) PK.push(new PK.Gallery(g));
    else if (PK.TitleScene) PK.push(new PK.TitleScene());
    PK.start();
  });
})();

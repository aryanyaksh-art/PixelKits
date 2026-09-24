// Debug tools: art galleries (?gallery=tiles|kits|chars) and a debug menu (?debug=1, press select+start).
(function () {
  'use strict';
  var PK = window.PK;

  function Gallery(mode) {
    this.opaque = true;
    this.mode = mode;
    this.i = 0;
    this.page = 0;
    this.themes = Object.keys(PK.THEMES);
  }
  Gallery.prototype.update = function () {
    var inp = PK.input;
    if (inp.rep('right')) this.i++;
    if (inp.rep('left')) this.i--;
    if (inp.rep('down')) this.page++;
    if (inp.rep('up')) this.page = Math.max(0, this.page - 1);
  };
  Gallery.prototype.draw = function (ctx) {
    ctx.fillStyle = '#586078';
    ctx.fillRect(0, 0, PK.W, PK.H);
    var f = (PK.frame >> 4) % 3;
    if (this.mode === 'tiles') {
      var th = this.themes[((this.i % this.themes.length) + this.themes.length) % this.themes.length];
      PK.font.draw(ctx, 'THEME: ' + th, 4, 2, '#fff');
      var chars = '.,":gdT~=|vfSbrRWOlikLXMctBKpCHDQYZ';
      for (var k = 0; k < chars.length; k++) {
        var x = 4 + (k % 12) * 19, y = 14 + Math.floor(k / 12) * 26;
        ctx.drawImage(PK.tiles.get(th, chars[k], f, 0, 0), x, y);
        PK.font.draw(ctx, chars[k], x + 5, y + 17, '#fff');
      }
    } else if (this.mode === 'buildings') {
      var kinds = Object.keys(PK.BUILDINGS);
      var bx = 2, by = 2, rowH = 0;
      for (var b = 0; b < kinds.length; b++) {
        var img = PK.buildings.draw(kinds[b], { snow: this.i % 2 === 1 });
        if (bx + img.width > PK.W) { bx = 2; by += rowH + 2; rowH = 0; }
        ctx.drawImage(img, bx, by - this.page * 40);
        bx += img.width + 2;
        rowH = Math.max(rowH, img.height);
      }
    } else if (this.mode === 'chars') {
      var names = Object.keys(PK.CHAR_PALS);
      var dirs = ['down', 'up', 'left', 'right'];
      var fr = (PK.frame >> 3) % 4;
      for (var n = 0; n < names.length; n++) {
        var s = PK.chars.sprite(names[n]);
        var cx = 4 + (n % 8) * 29, cy = 4 + Math.floor(n / 8) * 22;
        var d = dirs[(this.i % 4 + 4) % 4];
        ctx.drawImage(s[d][[0, 1, 0, 2][fr]], cx, cy);
        ctx.drawImage(s.down[0], cx + 12, cy + 4);
      }
    } else if (this.mode === 'kits') {
      var per = 12;
      var start = this.page * per;
      for (var q = 0; q < per; q++) {
        var id = start + q + 1;
        if (!PK.KITS || !PK.KITS[id]) continue;
        var art = PK.kitArt.get(id, this.i % 2 === 1 ? 'back' : 'front', false);
        var gx = (q % 4) * 60, gy = Math.floor(q / 4) * 53;
        ctx.drawImage(art, gx - 2, gy - 8);
        PK.font.draw(ctx, id + ' ' + PK.KITS[id].name, gx + 1, gy + 45, '#fff', '#223');
      }
    }
  };

  PK.Gallery = Gallery;

  PK.debugMenu = function () {
    return PK.run(async function () {
      var maps = Object.keys(PK.MAPS).filter(function (k) { return !PK.MAPS[k].interior; });
      var i = await PK.ui.menu(['Warp', 'Heal party', 'Party Lv+10', 'All crests', 'Give items', 'Toggle encounters', 'Add Kit', 'Close'], { x: 4, y: 4 });
      var st = PK.game.state;
      if (i === 0) {
        var m = await PK.ui.menu(maps, { x: 4, y: 4, maxRows: 10 });
        if (m >= 0) {
          var map = PK.MAPS[maps[m]];
          var sp = map.spawn || [Math.floor(map.w / 2), Math.floor(map.h / 2)];
          await PK.world.warp(maps[m], sp[0], sp[1], 'down');
        }
      } else if (i === 1) { PK.game.healParty(); PK.ui.say('Party healed.'); }
      else if (i === 2) {
        st.party.forEach(function (k) { PK.stats.setLevel(k, Math.min(100, k.level + 10)); });
        PK.ui.say('Levels raised.');
      } else if (i === 3) { for (var c = 0; c < 8; c++) st.crests[c] = true; PK.ui.say('All crests granted.'); }
      else if (i === 4) {
        ['tonic', 'hitonic', 'vitaltonic', 'remedy', 'rekindle', 'capsule', 'pluscapsule', 'procapsule'].forEach(function (it) { PK.game.addItem(it, 20); });
        ['machete', 'pickaxe', 'raft'].forEach(function (it) { PK.game.addItem(it, 1); });
        PK.ui.say('Items added.');
      } else if (i === 5) { PK.noEncounters = !PK.noEncounters; PK.ui.say('Encounters ' + (PK.noEncounters ? 'OFF' : 'ON')); }
      else if (i === 6) {
        var ids = Object.keys(PK.KITS);
        var k2 = await PK.ui.menu(ids.map(function (id) { return id + ' ' + PK.KITS[id].name; }), { x: 4, y: 4, maxRows: 10 });
        if (k2 >= 0) { PK.game.giveKit(PK.stats.create(+ids[k2], 30)); PK.ui.say('Added.'); }
      }
    });
  };
})();

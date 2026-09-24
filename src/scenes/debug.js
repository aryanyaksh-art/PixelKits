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

  // Test harness (used for automated play-testing from the dev tools)
  PK.test = {
    // advance n frames, letting async scripts progress between frames
    step: async function (n) {
      for (var i = 0; i < (n || 1); i++) {
        PK.step();
        for (var k = 0; k < 6; k++) await null;
      }
      PK.draw();
      return PK.frame;
    },
    press: async function (b, hold) {
      PK.input.setTouch(b, true);
      await PK.test.step(hold || 2);
      PK.input.setTouch(b, false);
      await PK.test.step(2);
    },
    // press a button repeatedly (e.g. to advance text)
    mash: async function (b, times, gap) {
      for (var i = 0; i < times; i++) { await PK.test.press(b); await PK.test.step(gap || 6); }
    },
    walk: async function (dir, n) {
      for (var i = 0; i < (n || 1); i++) {
        if (PK.world.busy || PK.top().constructor.name !== 'Overworld') break;
        PK.world.tryMove(dir);
        await PK.test.step(20);
        for (var k = 0; k < 40 && (PK.world.busy || PK.world.p.moving); k++) await PK.test.step(2);
      }
    },
    face: function (d) { PK.world.p.dir = d; },
    idle: function () { return PK.top() && PK.top().constructor.name === 'Overworld' && PK.world.busy === 0 && !PK.world.p.moving; },
    battle: function () { return PK.scenes.filter(function (s) { return s instanceof PK.BattleScene; })[0]; },
    // press A through dialogue until the overworld is idle (answers menus with the default choice)
    advance: async function (max) {
      var calm = 0;
      for (var i = 0; i < (max || 80); i++) {
        if (PK.test.idle()) { calm++; if (calm > 3) return i; await PK.test.step(5); continue; }
        calm = 0;
        if (PK.top().constructor.name === 'NameEntry') { await PK.test.press('start'); await PK.test.step(10); continue; }
        var b = PK.test.battle();
        if (b && b.mode === 'action') { await PK.test.press('a'); await PK.test.step(4); await PK.test.press('a'); await PK.test.step(20); continue; }
        await PK.test.press('a'); await PK.test.step(25);
      }
      return -1;
    },
    // teleport for testing
    warp: function (map, x, y) { PK.world.load(map, x, y, 'down'); },
    shot: function (name, scale) {
      scale = scale || 3;
      var c = PK.makeCanvas(PK.W * scale, PK.H * scale);
      var x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      PK.draw();
      x.drawImage(PK.canvas, 0, 0, c.width, c.height);
      return fetch('/__shot?name=' + encodeURIComponent(name || 'shot'), { method: 'POST', body: c.toDataURL('image/png') }).then(function () { return name; });
    },
    info: function () {
      var w = PK.world, top = PK.top();
      return { scene: top && top.constructor && top.constructor.name, map: w.map && w.map.id, x: w.p.x, y: w.p.y, busy: w.busy, party: PK.game.state.party.map(function (k) { return PK.stats.name(k) + ' ' + k.level + ' ' + k.hp + '/' + k.stats[0]; }), err: PK.lastError && String(PK.lastError.stack || PK.lastError) };
    }
  };

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

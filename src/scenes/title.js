// Title screen, new-game intro and end credits.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };

  function drawLogo(ctx, cx, y, t) {
    var text = 'PixelKits';
    var sc = 3;
    var w = F().width(text) * sc;
    var x = Math.round(cx - w / 2);
    var bob = Math.round(Math.sin(t / 30) * 2);
    // drop shadow + outline
    F()._raw(ctx, text, x + 3, y + 4 + bob, '#141a30', sc);
    F().outline(ctx, text, x, y + bob, '#ffd860', '#241c3c', sc);
    // lower half recolored for a two-tone look
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y + bob + 11, PK.W, 12); ctx.clip();
    F()._raw(ctx, text, x, y + bob, '#ff9a3c', sc);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y + bob, PK.W, 3); ctx.clip();
    F()._raw(ctx, text, x, y + bob, '#fff4c0', sc);
    ctx.restore();
  }

  function Title() {
    this.opaque = true;
    this.t = 0;
    this.phase = 'press';
    this.parade = [1, 4, 7, 42, 29, 12, 21, 85, 100, 50, 64, 31];
    this.clouds = [0, 1, 2, 3, 4].map(function (i) { return { x: i * 60, y: 12 + (i * 17) % 40, s: 0.1 + (i % 3) * 0.05 }; });
  }
  Title.prototype.enter = function () { if (PK.audio) PK.audio.music('title'); };
  Title.prototype.update = function () {
    this.t++;
    this.clouds.forEach(function (c) { c.x += c.s; if (c.x > PK.W + 40) c.x = -60; });
    if (this.phase === 'press' && PK.top() === this && (PK.input.ok() || PK.input.p('a'))) {
      if (PK.audio) { PK.audio.unlock(); PK.audio.music('title'); PK.audio.sfx('select'); }
      this.phase = 'menu';
      var self = this;
      PK.run(function () { return self.menu(); });
    }
  };
  function slotItems() {
    var out = [];
    for (var n = 1; n <= 3; n++) {
      var inf = PK.game.saveInfo(n);
      out.push(inf ? { label: 'FILE ' + n + '  ' + inf.name, right: (inf.champion ? '★ ' : '') + inf.crests + ' crests  ' + PK.game.playTime(inf.time) } : { label: 'FILE ' + n + '  - empty -', empty: true });
    }
    return out;
  }
  Title.prototype.menu = async function () {
    for (;;) {
      var has = PK.game.hasSave();
      var items = [];
      if (has) items.push({ label: 'CONTINUE' });
      items.push({ label: 'NEW GAME' });
      items.push({ label: 'OPTIONS' });
      items.push({ label: 'CONTROLS' });
      var i = await PK.ui.menu(items, { x: 60, y: 96, w: 120, cancel: false });
      var pick = items[i].label;
      if (pick === 'CONTINUE') {
        var sl = slotItems();
        var c = await PK.ui.menu(sl.map(function (x) { return x.empty ? Object.assign({ disabled: true }, x) : x; }), { x: 8, y: 60, w: 224, title: 'Continue which file?' });
        if (c < 0) continue;
        var act = await PK.ui.menu(['LOAD', 'DELETE', 'CANCEL'], { right: 232, y: 60 });
        if (act === 1) {
          if (await PK.ui.yesno('Delete FILE ' + (c + 1) + ' forever? This cannot be undone.') && await PK.ui.yesno('Are you really sure?')) {
            PK.game.deleteSlot(c + 1);
            await PK.ui.say('FILE ' + (c + 1) + ' was deleted.');
          }
          continue;
        }
        if (act !== 0) continue;
        if (!PK.game.load(c + 1)) { await PK.ui.say('The save data could not be loaded.'); continue; }
        if (PK.audio) PK.audio.applyVolumes();
        await PK.fx.fadeOut(20);
        await PK.enterWorld();
        return;
      }
      if (pick === 'NEW GAME') {
        var sl2 = slotItems();
        var slot = 1;
        if (has) {
          var c2 = await PK.ui.menu(sl2, { x: 8, y: 60, w: 224, title: 'Start in which file?' });
          if (c2 < 0) continue;
          if (!sl2[c2].empty && !(await PK.ui.yesno('FILE ' + (c2 + 1) + ' already has a save. It will be overwritten the first time you save. OK?'))) continue;
          slot = c2 + 1;
        }
        PK.game.newGame();
        PK.game.slot = slot;
        await PK.fx.fadeOut(20);
        PK.pop(this);
        PK.push(new Intro());
        await PK.fx.fadeIn(20);
        return;
      }
      if (pick === 'OPTIONS') { await PK.menus.options(); continue; }
      if (pick === 'CONTROLS') {
        await PK.ui.say('Arrow keys or WASD move. Z, Space or J is A (confirm/talk). X, Esc or K is B (back).');
        await PK.ui.say('Enter or C opens the menu. Hold Shift to run. On phones, use the on-screen buttons.');
      }
    }
  };
  Title.prototype.draw = function (ctx) {
    var t = this.t;
    var g = ctx.createLinearGradient(0, 0, 0, PK.H);
    g.addColorStop(0, '#3a4a9a'); g.addColorStop(0.55, '#e88a6a'); g.addColorStop(1, '#f8d8a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, PK.W, PK.H);
    // stars
    for (var s = 0; s < 30; s++) {
      var sx = (s * 53) % PK.W, sy = (s * 29) % 50;
      if (((t >> 3) + s) % 7) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(sx, sy, 1, 1); }
    }
    // sun
    ctx.fillStyle = '#ffe890'; ctx.beginPath(); ctx.arc(190, 96, 22, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,180,0.35)'; ctx.beginPath(); ctx.arc(190, 96, 30, 0, 6.3); ctx.fill();
    // clouds
    this.clouds.forEach(function (c) {
      ctx.fillStyle = 'rgba(255,240,235,0.85)';
      ctx.fillRect(c.x, c.y, 34, 6); ctx.fillRect(c.x + 6, c.y - 4, 18, 6); ctx.fillRect(c.x + 20, c.y - 2, 10, 4);
    });
    // hills
    ctx.fillStyle = '#6a9a58';
    ctx.beginPath(); ctx.moveTo(0, 118);
    for (var x = 0; x <= PK.W; x += 8) ctx.lineTo(x, 112 + Math.sin(x / 30) * 8);
    ctx.lineTo(PK.W, PK.H); ctx.lineTo(0, PK.H); ctx.fill();
    ctx.fillStyle = '#4a7a44';
    ctx.beginPath(); ctx.moveTo(0, 132);
    for (x = 0; x <= PK.W; x += 8) ctx.lineTo(x, 128 + Math.sin(x / 22 + 2) * 5);
    ctx.lineTo(PK.W, PK.H); ctx.lineTo(0, PK.H); ctx.fill();
    // Kit parade
    var n = this.parade.length;
    for (var i = 0; i < n; i++) {
      var px = ((t * 0.5 + i * 44) % (n * 44)) - 40;
      var id = this.parade[i];
      var ic = PK.kitArt.icon(id);
      var hop = Math.abs(Math.sin((t + i * 13) / 8)) * 3;
      ctx.drawImage(ic, Math.round(px), Math.round(118 - hop));
    }
    drawLogo(ctx, PK.W / 2, 26, t);
    F().center(ctx, 'A Lumora Adventure', PK.W / 2, 60, '#fff4e0', '#3a2a4a');
    if (this.phase === 'press' && ((t >> 5) & 1)) F().center(ctx, 'PRESS START', PK.W / 2, 90, '#ffffff', '#3a2a4a');
    F().draw(ctx, 'v1.0', 4, PK.H - 9, 'rgba(255,255,255,0.6)');
    F().right(ctx, 'Original game', PK.W - 4, PK.H - 9, 'rgba(255,255,255,0.6)');
  };

  // ---------------- Intro ----------------
  function Intro() {
    this.opaque = true;
    this.kit = null;
    this.prof = PK.chars.portrait('prof', 4, 'down');
    this.showProf = true;
    this.showPlayer = false;
    this.showRival = false;
    var self = this;
    PK.run(function () { return self.main(); });
  }
  Intro.prototype.main = async function () {
    var st = PK.game.state;
    if (PK.audio) PK.audio.music('hometown');
    await PK.wait(20);
    await PK.ui.say('Ah, you\'re awake! Good. My name is Ines Vale, but most people just call me Professor Vale.');
    await PK.ui.say('This is Lumora, a land of green valleys, sunny coasts and frozen peaks.');
    this.kit = 1;
    if (PK.audio) PK.audio.cry(1);
    await PK.ui.say('And everywhere you go, you\'ll find creatures called Kits!');
    await PK.ui.say('People and Kits live side by side here. Some keep them as friends, some battle together, and some - like me - study them.');
    this.kit = null;
    this.showProf = false; this.showPlayer = true;
    await PK.ui.say('Now, tell me a little about yourself. What is your name?');
    st.player.name = await pickName('Your name?', ['REMY', 'NOVA', 'SAGE', 'ROWE'].slice(0, 3), 'REMY');
    await PK.ui.say('{PLAYER}, is it? A fine name!');
    this.showPlayer = false; this.showRival = true;
    await PK.ui.say('This is my neighbor\'s kid. You two have been friends - and rivals - since you could walk.');
    await PK.ui.say('...Erm, what was their name again?');
    st.rival = await pickName("Your rival's name?", ['JASPER', 'COLT', 'BLAKE'], 'JASPER');
    await PK.ui.say('That\'s right! {RIVAL}! I remember now.');
    this.showRival = false; this.showPlayer = true;
    await PK.ui.say('{PLAYER}! Your very own Kit adventure is about to begin.');
    await PK.ui.say('Come see me at my lab in Brookhollow when you\'re ready. A world of Kits is waiting!');
    await PK.fx.fadeOut(30, '#ffffff');
    PK.fx.setFade(1, '#000');
    await PK.enterWorld();
  };
  async function pickName(title, presets, def) {
    var items = ['NEW NAME'].concat(presets);
    var i = await PK.ui.menu(items, { x: 8, y: 8, cancel: false, title: title });
    if (i === 0) return (await PK.ui.name(title, def)).toUpperCase().slice(0, 10);
    return presets[i - 1];
  }
  Intro.prototype.update = function () {};
  Intro.prototype.draw = function (ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, PK.H);
    g.addColorStop(0, '#20284a'); g.addColorStop(1, '#3a4a7a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, PK.W, PK.H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.ellipse(120, 100, 70, 14, 0, 0, 6.3); ctx.fill();
    if (this.showProf) ctx.drawImage(this.prof, 88, 38);
    if (this.showPlayer) ctx.drawImage(PK.chars.portrait('player', 4, 'down'), 88, 38);
    if (this.showRival) ctx.drawImage(PK.chars.portrait('rival', 4, 'down'), 88, 38);
    if (this.kit) {
      ctx.drawImage(PK.kitArt.get(this.kit, 'front'), 150, 44);
    }
  };

  // ---------------- Credits ----------------
  PK.credits = function () {
    return new Promise(function (res) {
      var lines = [
        'PIXELKITS', '', 'A Lumora Adventure', '', '', 'Thank you for playing!', '', '',
        'CHAMPION', '{PLAYER}', '', '', 'YOUR TEAM'
      ];
      var st = PK.game.state;
      st.party.forEach(function (k) { lines.push(PK.stats.name(k) + '  Lv' + k.level); });
      lines = lines.concat(['', '', 'KITLOG', Object.keys(st.caught).length + ' / ' + PK.KIT_COUNT + ' caught', '', '',
        'GAME DESIGN, CODE, PIXEL ART & MUSIC', 'Built entirely from scratch', '', '',
        'WARDENS', 'Fenna  Gideon  Juno  Marisol', 'Ignatius  Celestine  Bjorn  Morwen', '', '',
        'HIGH COUNCIL', 'Dax  Hemlock  Orrin  Sable', '', 'CHAMPION EMERITUS', 'Castor', '', '',
        'The guardians still sleep...', 'and Starfall waits beyond the sea.', '', '', '', 'THE END']);
      var sc = {
        opaque: true, y: PK.H + 10, t: 0,
        update: function () {
          this.t++;
          this.y -= PK.input.h('a') ? 1.6 : 0.4;
          if (this.y < -lines.length * 14 - 20 || (this.t > 60 && PK.input.p('start'))) { PK.pop(this); res(); }
        },
        draw: function (ctx) {
          ctx.fillStyle = '#10142a'; ctx.fillRect(0, 0, PK.W, PK.H);
          for (var i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + (i % 3) * 0.2) + ')'; ctx.fillRect((i * 67) % PK.W, (i * 41 + this.t * (0.2 + (i % 3) * 0.1)) % PK.H, 1, 1); }
          for (var j = 0; j < lines.length; j++) {
            var yy = this.y + j * 14;
            if (yy < -10 || yy > PK.H) continue;
            var l = PK.ui.fmt(lines[j]);
            var big = l === l.toUpperCase() && l.length > 0 && j > 0;
            F().center(ctx, l, PK.W / 2, yy, big ? '#ffd860' : '#e0e4f8', '#000');
          }
          var id = 1 + Math.floor(this.t / 90) % PK.KIT_COUNT;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(PK.kitArt.get(id, 'front'), 176, 96);
          ctx.globalAlpha = 1;
        }
      };
      if (PK.audio) PK.audio.music('credits');
      PK.push(sc);
      PK.fx.fadeIn(30);
    });
  };

  PK.TitleScene = Title;
  PK.IntroScene = Intro;
})();

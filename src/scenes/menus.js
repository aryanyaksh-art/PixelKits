// Menu screens: party, summary, bag, KitLog, shop, storage, options, trainer card, move learning, evolution.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var T = function () { return PK.ui.THEME; };
  var ST_COL = { brn: '#e8683a', psn: '#a050c0', par: '#d0a818', slp: '#8a8aa0', frz: '#58b0e0' };

  function bgPattern(ctx, a, b) {
    ctx.fillStyle = a; ctx.fillRect(0, 0, PK.W, PK.H);
    ctx.fillStyle = b;
    var o = (PK.frame >> 2) % 16;
    for (var y = -16; y < PK.H; y += 16) for (var x = -16; x < PK.W + 16; x += 32) ctx.fillRect(x + ((y / 16) & 1) * 16 + o, y + o, 16, 16);
  }
  function hpBar(ctx, x, y, w, hp, max) {
    var f = Math.max(0, hp) / max;
    ctx.fillStyle = '#28304c'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = '#50586c'; ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = f > 0.5 ? '#48d060' : f > 0.2 ? '#f0c030' : '#e84838';
    ctx.fillRect(x, y, Math.ceil(w * f), 3);
  }
  function typeTag(ctx, type, x, y, w) {
    w = w || 38;
    var c = PK.TYPES[type].color;
    ctx.fillStyle = PK.color.shade(c, -0.45); ctx.fillRect(x, y, w, 11);
    ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, w - 2, 9);
    F().center(ctx, type.toUpperCase(), x + w / 2, y + 2, '#ffffff', PK.color.shade(c, -0.5));
  }
  function statusTag(ctx, st, x, y) {
    if (!st) return;
    ctx.fillStyle = ST_COL[st]; ctx.fillRect(x, y, 19, 9);
    F().draw(ctx, PK.battleUtil.ST_NAME[st], x + 2, y + 1, '#ffffff');
  }
  function drawIcon(ctx, k, x, y, size) {
    var ic = PK.kitArt.icon(k.id, k.prism);
    var bob = k.hp > 0 && ((PK.frame >> 3) & 1) ? -1 : 0;
    ctx.drawImage(ic, x, y + bob, size || 24, size || 24);
  }
  PK.drawCrest = function (ctx, x, y, i, earned) {
    var types = ['Leaf', 'Terra', 'Volt', 'Tide', 'Blaze', 'Mind', 'Frost', 'Shade'];
    var c = earned ? PK.TYPES[types[i]].color : '#4a4e60';
    var d = PK.color.shade(c, -0.5), l = PK.color.shade(c, 0.45);
    ctx.fillStyle = d;
    var cx = x + 7, cy = y + 7;
    var shapes = [
      [[0, -7], [6, 0], [0, 7], [-6, 0]],
      [[-6, -4], [0, -7], [6, -4], [6, 4], [0, 7], [-6, 4]],
      [[1, -7], [5, -1], [1, -1], [4, 7], [-5, 0], [-1, 0], [-3, -7]],
      [[0, -7], [5, 1], [3, 6], [-3, 6], [-5, 1]],
      [[0, -7], [3, -2], [6, 1], [4, 7], [-4, 7], [-6, 1], [-3, -2]],
      [[-5, -5], [5, -5], [7, 0], [5, 5], [-5, 5], [-7, 0]],
      [[0, -7], [2, -2], [7, 0], [2, 2], [0, 7], [-2, 2], [-7, 0], [-2, -2]],
      [[-2, -7], [5, -5], [7, 1], [3, 7], [-4, 6], [0, 2], [1, -3]]
    ][i];
    function poly(scale, col) {
      ctx.fillStyle = col; ctx.beginPath();
      shapes.forEach(function (p, j) { var px = cx + p[0] * scale, py = cy + p[1] * scale; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.closePath(); ctx.fill();
    }
    poly(1.05, d); poly(0.78, c);
    if (earned) { ctx.fillStyle = l; ctx.fillRect(cx - 2, cy - 3, 2, 2); }
  };

  // ================= Party =================
  function Party(opts, done) {
    this.opaque = true;
    this.opts = opts || {};
    this.done = done;
    this.i = 0;
    this.swapFrom = -1;
    this.busy = false;
  }
  Party.prototype.party = function () { return PK.game.state.party; };
  Party.prototype.update = function () {
    if (this.busy) return;
    var inp = PK.input, n = this.party().length, self = this;
    if (inp.rep('up')) { this.i = (this.i - 1 + n) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('down')) { this.i = (this.i + 1) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.cancel()) {
      if (this.swapFrom >= 0) { this.swapFrom = -1; return; }
      if (this.opts.forced) { if (PK.audio) PK.audio.sfx('buzz'); return; }
      if (PK.audio) PK.audio.sfx('back');
      PK.pop(this); this.done(-1); return;
    }
    if (inp.ok()) {
      if (PK.audio) PK.audio.sfx('select');
      if (this.swapFrom >= 0) {
        var p = this.party(), a = this.swapFrom, b = this.i;
        var t = p[a]; p[a] = p[b]; p[b] = t;
        this.swapFrom = -1;
        return;
      }
      this.busy = true;
      PK.run(function () { return self.select(); }).then(function () { self.busy = false; });
    }
  };
  Party.prototype.finish = function (v) { PK.pop(this); this.done(v); };
  Party.prototype.select = async function () {
    var k = this.party()[this.i], mode = this.opts.mode, self = this;
    if (mode === 'item' || mode === 'disc' || mode === 'give') return this.finish(this.i);
    if (mode === 'battle') {
      var c = await PK.ui.menu(['SWITCH', 'SUMMARY', 'CANCEL'], { right: 236, bottom: 136 });
      if (c === 0) {
        if (k.hp <= 0) return PK.ui.say(PK.stats.name(k) + ' has no energy left to battle!');
        var active = PK.top() && false;
        void active;
        var bs = PK.scenes.filter(function (s) { return s instanceof PK.BattleScene; })[0];
        if (bs && bs.b.p.kit() === k && bs.b.p.kit().hp > 0) return PK.ui.say(PK.stats.name(k) + ' is already in battle!');
        return this.finish(this.i);
      }
      if (c === 1) return summary(this.i);
      return;
    }
    var items = ['SUMMARY', 'SWITCH', 'ITEM', 'CANCEL'];
    var ch = await PK.ui.menu(items, { right: 236, bottom: 136 });
    if (ch === 0) return summary(this.i);
    if (ch === 1) { this.swapFrom = this.i; return; }
    if (ch === 2) {
      var h = await PK.ui.menu(['GIVE', 'TAKE', 'CANCEL'], { right: 236, bottom: 136 });
      if (h === 0) {
        var r = await PK.menus.bag({ mode: 'give' });
        if (r && r.item) {
          if (k.held) PK.game.addItem(k.held);
          k.held = r.item; PK.game.removeItem(r.item);
          await PK.ui.say(PK.stats.name(k) + ' is now holding the ' + PK.ITEMS[r.item].name + '.');
        }
      } else if (h === 1) {
        if (!k.held) await PK.ui.say(PK.stats.name(k) + " isn't holding anything.");
        else { PK.game.addItem(k.held); await PK.ui.say('Received the ' + PK.ITEMS[k.held].name + ' from ' + PK.stats.name(k) + '.'); k.held = null; }
      }
    }
    void self;
  };
  Party.prototype.draw = function (ctx) {
    bgPattern(ctx, '#5a8ad0', '#5082c8');
    var p = this.party(), t = T();
    for (var i = 0; i < 6; i++) {
      var y = 3 + i * 22;
      var k = p[i];
      var sel = i === this.i;
      var st = sel ? { frame: '#28304c', frame2: '#f0a040', fill: '#fff4dc' } : null;
      if (i === this.swapFrom) st = { frame: '#28304c', frame2: '#e05a5a', fill: '#ffe0e0' };
      if (!k) { ctx.fillStyle = 'rgba(20,30,60,0.35)'; ctx.fillRect(6, y + 2, 228, 18); continue; }
      PK.ui.box(ctx, 4, y, 232, 21, st);
      drawIcon(ctx, k, 8, y - 4, 24);
      F().draw(ctx, PK.stats.name(k), 36, y + 3, k.hp > 0 ? t.text : t.dim, t.shadow);
      F().draw(ctx, 'Lv' + k.level, 36, y + 12, t.dim);
      if (this.opts.mode === 'disc' && this.opts.move) {
        var ok = PK.discCompatible(k, this.opts.move), knows = PK.stats.knows(k, this.opts.move);
        F().right(ctx, knows ? 'LEARNED' : ok ? 'ABLE' : 'UNABLE', 226, 8, ok && !knows ? '#2a9a50' : t.dim);
        continue;
      }
      if (k.held) PK.bfx.drawCapsule(ctx, 30, y + 15, 'procapsule');
      hpBar(ctx, 130, y + 5, 96, k.hp, k.stats[0]);
      F().right(ctx, k.hp + '/' + k.stats[0], 226, y + 11, t.text, t.shadow);
      statusTag(ctx, k.hp <= 0 ? null : k.status, 100, y + 10);
      if (k.hp <= 0) { ctx.fillStyle = '#e84838'; ctx.fillRect(100, y + 10, 19, 9); F().draw(ctx, 'KO', 104, y + 11, '#fff'); }
    }
    PK.ui.box(ctx, 4, 136, 232, 22);
    var msg = this.swapFrom >= 0 ? 'Move to where?' : this.opts.forced ? 'Choose the next Kit.' : this.opts.mode === 'item' ? 'Use on which Kit?' : this.opts.mode === 'disc' ? 'Teach which Kit?' : this.opts.mode === 'give' ? 'Give to which Kit?' : 'Choose a Kit.';
    F().draw(ctx, msg, 12, 143, t.text, t.shadow);
  };

  // ================= Summary =================
  function Summary(i) { this.opaque = true; this.i = i; this.page = 0; }
  Summary.prototype.update = function () {
    var inp = PK.input, n = PK.game.state.party.length;
    if (this.list) n = this.list.length;
    if (inp.rep('left') || inp.rep('right')) { this.page ^= 1; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('up')) { this.i = (this.i - 1 + n) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('down')) { this.i = (this.i + 1) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.cancel() || inp.ok()) { if (PK.audio) PK.audio.sfx('back'); PK.pop(this); if (this.done) this.done(); }
  };
  Summary.prototype.draw = function (ctx) {
    var list = this.list || PK.game.state.party;
    var k = list[this.i], sp = PK.KITS[k.id], t = T();
    bgPattern(ctx, '#e8c070', '#e2b862');
    PK.ui.box(ctx, 4, 4, 88, 96);
    ctx.fillStyle = '#dfe9f6'; ctx.fillRect(8, 8, 80, 72);
    ctx.drawImage(PK.kitArt.get(k.id, 'front', k.prism), 12, 10);
    F().draw(ctx, 'No.' + ('00' + k.id).slice(-3), 10, 84, t.dim);
    if (k.prism) F().draw(ctx, '★', 80, 84, '#e0a020');
    F().draw(ctx, PK.stats.name(k), 10, 92 - 1 + 0, t.text);
    PK.ui.box(ctx, 96, 4, 140, 20);
    F().draw(ctx, ['INFO / STATS', 'MOVES'][this.page], 104, 10, t.text, t.shadow);
    F().right(ctx, '< >', 228, 10, t.dim);
    PK.ui.box(ctx, 96, 26, 140, 130);
    if (this.page === 0) {
      var y = 32;
      F().draw(ctx, sp.name + '  Lv' + k.level, 104, y, t.text, t.shadow);
      y += 12;
      sp.types.forEach(function (ty, j) { typeTag(ctx, ty, 104 + j * 42, y); });
      y += 15;
      F().draw(ctx, 'HP', 104, y, t.dim); F().right(ctx, k.hp + '/' + k.stats[0], 228, y, t.text, t.shadow);
      hpBar(ctx, 130, y + 9, 98, k.hp, k.stats[0]);
      y += 15;
      for (var s = 1; s < 6; s++) {
        F().draw(ctx, PK.STAT_NAMES[s], 104, y, t.dim);
        F().right(ctx, String(k.stats[s]), 228, y, t.text, t.shadow);
        y += 10;
      }
      var nxt = k.level >= 100 ? 0 : PK.stats.expFor(k.level + 1) - k.exp;
      F().draw(ctx, 'To next Lv', 104, y + 2, t.dim); F().right(ctx, String(nxt), 228, y + 2, t.text, t.shadow);
      y += 12;
      F().draw(ctx, 'Item', 104, y, t.dim); F().right(ctx, k.held ? PK.ITEMS[k.held].name : 'None', 228, y, t.text, t.shadow);
      PK.ui.box(ctx, 4, 102, 88, 54);
      F().draw(ctx, 'Keeper', 10, 108, t.dim);
      F().draw(ctx, k.ot || PK.game.state.player.name, 10, 118, t.text);
      if (k.status) statusTag(ctx, k.status, 10, 132);
      F().draw(ctx, sp.cat, 10, 144, t.dim);
    } else {
      for (var m = 0; m < 4; m++) {
        var mv = k.moves[m];
        var yy = 32 + m * 30;
        if (!mv) { F().draw(ctx, '-', 104, yy, t.dim); continue; }
        var md = PK.MOVES[mv.id];
        typeTag(ctx, md.type, 104, yy, 38);
        F().draw(ctx, md.name, 146, yy + 2, t.text, t.shadow);
        F().draw(ctx, 'CH ' + mv.pp + '/' + md.pp, 104, yy + 14, t.dim);
        F().draw(ctx, (md.cat === 'S' ? 'STATUS' : 'PWR ' + md.power) + '  ' + (md.acc ? 'ACC ' + md.acc : 'SURE'), 160, yy + 14, t.dim);
      }
      PK.ui.box(ctx, 4, 102, 88, 54);
      var lines = F().wrap(sp.dex, 76);
      for (var l = 0; l < Math.min(5, lines.length); l++) F().draw(ctx, lines[l], 9, 107 + l * 9, t.text);
    }
  };
  function summary(i, list) {
    return new Promise(function (res) { var s = new Summary(i); s.list = list; s.done = res; PK.push(s); });
  }

  // ================= Bag =================
  function Bag(opts, done) {
    this.opaque = true;
    this.opts = opts || {};
    this.done = done;
    this.pocket = 0;
    this.i = 0;
    this.scroll = 0;
    this.busy = false;
  }
  Bag.prototype.items = function () { return PK.game.pocketItems(PK.POCKETS[this.pocket][0]); };
  Bag.prototype.update = function () {
    if (this.busy) return;
    var inp = PK.input, self = this;
    var list = this.items();
    if (inp.rep('left')) { this.pocket = (this.pocket + 3) % 4; this.i = 0; this.scroll = 0; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('right')) { this.pocket = (this.pocket + 1) % 4; this.i = 0; this.scroll = 0; if (PK.audio) PK.audio.sfx('move'); }
    var n = list.length + 1;
    if (inp.rep('up')) { this.i = (this.i - 1 + n) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('down')) { this.i = (this.i + 1) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (this.i < this.scroll) this.scroll = this.i;
    if (this.i >= this.scroll + 8) this.scroll = this.i - 7;
    if (inp.cancel() || (inp.ok() && this.i === list.length)) { if (PK.audio) PK.audio.sfx('back'); PK.pop(this); this.done(null); return; }
    if (inp.ok()) {
      if (PK.audio) PK.audio.sfx('select');
      this.busy = true;
      PK.run(function () { return self.select(list[self.i]); }).then(function () { self.busy = false; });
    }
  };
  Bag.prototype.close = function (v) { PK.pop(this); this.done(v); };
  Bag.prototype.select = async function (id) {
    var it = PK.ITEMS[id], mode = this.opts.mode, party = PK.game.state.party;
    if (mode === 'give') {
      if (it.pocket === 'key' || it.pocket === 'discs') return PK.ui.say("That can't be held.");
      return this.close({ item: id });
    }
    if (mode === 'battle') {
      if (['heal', 'full', 'status', 'revive', 'pp'].indexOf(it.use) >= 0) {
        var ti = await PK.menus.party({ mode: 'item' });
        if (ti < 0) return;
        var k = party[ti];
        if (!itemHasEffect(it, k)) return PK.ui.say("It won't have any effect.");
        return this.close({ item: id, target: ti });
      }
      if (it.use === 'capsule' || it.use === 'escape') return this.close({ item: id });
      return PK.ui.say("That can't be used right now.");
    }
    // field
    var opts = it.pocket === 'key' ? ['USE', 'CANCEL'] : it.use === 'held' ? ['GIVE', 'TOSS', 'CANCEL'] : it.pocket === 'discs' ? ['USE', 'CANCEL'] : ['USE', 'GIVE', 'TOSS', 'CANCEL'];
    var c = await PK.ui.menu(opts, { right: 236, bottom: 118 });
    var act = opts[c];
    if (act === 'TOSS') {
      var n = await PK.ui.number({ min: 1, max: PK.game.count(id), y: 96 });
      if (n > 0 && await PK.ui.yesno('Throw away ' + n + ' ' + it.name + '?')) { PK.game.removeItem(id, n); await PK.ui.say('Threw away the ' + it.name + '.'); }
      if (this.i >= this.items().length) this.i = Math.max(0, this.items().length);
      return;
    }
    if (act === 'GIVE') {
      var gi = await PK.menus.party({ mode: 'give' });
      if (gi < 0) return;
      var gk = party[gi];
      if (gk.held) PK.game.addItem(gk.held);
      gk.held = id; PK.game.removeItem(id);
      return PK.ui.say(PK.stats.name(gk) + ' is now holding the ' + it.name + '.');
    }
    if (act !== 'USE') return;
    return useField(id);
  };
  function itemHasEffect(it, k) {
    if (it.use === 'heal') return k.hp > 0 && k.hp < k.stats[0];
    if (it.use === 'full') return k.hp > 0 && (k.hp < k.stats[0] || k.status);
    if (it.use === 'status') return k.hp > 0 && !!k.status;
    if (it.use === 'revive') return k.hp <= 0;
    if (it.use === 'pp') return k.moves.some(function (m) { return m.pp < PK.MOVES[m.id].pp; });
    return false;
  }
  async function useField(id) {
    var it = PK.ITEMS[id], party = PK.game.state.party;
    if (['heal', 'full', 'status', 'revive', 'pp'].indexOf(it.use) >= 0) {
      var ti = await PK.menus.party({ mode: 'item' });
      if (ti < 0) return;
      var k = party[ti];
      if (!itemHasEffect(it, k)) return PK.ui.say("It won't have any effect.");
      PK.game.removeItem(id);
      if (PK.audio) PK.audio.sfx('heal');
      if (it.use === 'heal') { var a = Math.min(it.value, k.stats[0] - k.hp); k.hp += a; return PK.ui.say(PK.stats.name(k) + ' recovered ' + a + ' HP!'); }
      if (it.use === 'full') { k.hp = k.stats[0]; k.status = null; return PK.ui.say(PK.stats.name(k) + ' is fully restored!'); }
      if (it.use === 'status') { k.status = null; return PK.ui.say(PK.stats.name(k) + ' is feeling fine!'); }
      if (it.use === 'revive') { k.hp = Math.max(1, Math.floor(k.stats[0] * it.value / 100)); return PK.ui.say(PK.stats.name(k) + ' was revived!'); }
      if (it.use === 'pp') { k.moves.forEach(function (m) { m.pp = Math.min(PK.MOVES[m.id].pp, m.pp + it.value); }); return PK.ui.say(PK.stats.name(k) + "'s charges were restored!"); }
    }
    if (it.use === 'hush') { PK.game.removeItem(id); PK.game.state.hush = it.value; return PK.ui.say('You sprayed the ' + it.name + '. Wild Kits will keep their distance.'); }
    if (it.use === 'evo') {
      var ei = await PK.menus.party({ mode: 'item' });
      if (ei < 0) return;
      var ek = party[ei], to = PK.stats.evoTarget(ek, { item: id });
      if (!to) return PK.ui.say("It won't have any effect.");
      PK.game.removeItem(id);
      return PK.menus.evolve(ek, to);
    }
    if (it.use === 'disc') {
      var di = await PK.menus.party({ mode: 'disc', move: it.value });
      if (di < 0) return;
      var dk = party[di];
      if (PK.stats.knows(dk, it.value)) return PK.ui.say(PK.stats.name(dk) + ' already knows ' + PK.MOVES[it.value].name + '.');
      if (!PK.discCompatible(dk, it.value)) return PK.ui.say(PK.stats.name(dk) + " can't learn " + PK.MOVES[it.value].name + '.');
      return PK.menus.learnMove(dk, it.value);
    }
    if (id === 'kitlog') return PK.menus.kitlog();
    if (it.pocket === 'key') return PK.ui.say('Face an obstacle and press A to use the ' + it.name + '.');
    if (it.use === 'capsule' || it.use === 'escape') return PK.ui.say('That can only be used in battle.');
  }
  Bag.prototype.draw = function (ctx) {
    var t = T();
    bgPattern(ctx, '#d07a4a', '#c87244');
    PK.ui.box(ctx, 4, 4, 232, 20);
    var pk = PK.POCKETS[this.pocket];
    F().center(ctx, '◀ ' + pk[1] + ' ▶', 120, 10, t.text, t.shadow);
    for (var d = 0; d < 4; d++) { ctx.fillStyle = d === this.pocket ? '#f0a040' : '#8a90a8'; ctx.fillRect(98 + d * 12, 26, 8, 3); }
    PK.ui.box(ctx, 4, 32, 232, 94);
    var list = this.items();
    for (var i = this.scroll; i < Math.min(list.length + 1, this.scroll + 8); i++) {
      var y = 38 + (i - this.scroll) * 11;
      if (i === this.i) F().draw(ctx, '▶', 10, y, t.hi);
      if (i === list.length) { F().draw(ctx, 'CLOSE BAG', 18, y, t.text, t.shadow); continue; }
      var it = PK.ITEMS[list[i]];
      F().draw(ctx, it.name, 18, y, t.text, t.shadow);
      if (it.pocket !== 'key' && it.pocket !== 'discs') F().right(ctx, '×' + PK.game.count(list[i]), 226, y, t.text, t.shadow);
      else if (it.pocket === 'discs') { var mt = PK.MOVES[it.value].type; ctx.fillStyle = PK.TYPES[mt].color; ctx.fillRect(210, y, 16, 7); }
    }
    PK.ui.box(ctx, 4, 128, 232, 30);
    var cur = list[this.i];
    var desc = cur ? PK.ITEMS[cur].desc : 'Close the bag.';
    var ls = F().wrap(desc, 216);
    for (var l = 0; l < Math.min(2, ls.length); l++) F().draw(ctx, ls[l], 12, 134 + l * 10, t.text, t.shadow);
    if (this.pocket === 0 || this.pocket === 1) F().right(ctx, '$' + PK.game.state.money, 228, 10, t.dim);
  };

  // ================= Move learning =================
  async function learnMove(k, moveId) {
    var name = PK.stats.name(k), mn = PK.MOVES[moveId].name;
    if (PK.stats.knows(k, moveId)) return;
    if (k.moves.length < 4) {
      k.moves.push({ id: moveId, pp: PK.MOVES[moveId].pp });
      if (PK.audio) PK.audio.jingle('levelup');
      return PK.ui.say(name + ' learned ' + mn + '!');
    }
    for (;;) {
      await PK.ui.say(name + ' wants to learn ' + mn + '. But ' + name + ' already knows four moves.');
      var yes = await PK.ui.yesno('Forget a move to make room for ' + mn + '?');
      if (yes) {
        var items = k.moves.map(function (m) { var md = PK.MOVES[m.id]; return { label: md.name, right: md.type }; });
        items.push({ label: mn + ' (new)', right: PK.MOVES[moveId].type, color: '#2a70c0' });
        var c = await PK.ui.menu(items, { x: 60, y: 30, w: 170, title: 'Forget which move?' });
        if (c >= 0 && c < 4) {
          var old = PK.MOVES[k.moves[c].id].name;
          k.moves[c] = { id: moveId, pp: PK.MOVES[moveId].pp };
          await PK.ui.say('1, 2, and... Poof! ' + name + ' forgot ' + old + '.');
          if (PK.audio) PK.audio.jingle('levelup');
          return PK.ui.say('And... ' + name + ' learned ' + mn + '!');
        }
      }
      if (await PK.ui.yesno('Stop trying to teach ' + mn + '?')) return PK.ui.say(name + ' did not learn ' + mn + '.');
    }
  }

  // ================= Evolution =================
  function Evolve(k, to, done) {
    this.opaque = true; this.k = k; this.to = to; this.done = done;
    this.t = 0; this.showNew = false; this.white = 0; this.cancel = false; this.phase = 'wait';
    var self = this;
    PK.run(function () { return self.main(); });
  }
  Evolve.prototype.main = async function () {
    var k = this.k, from = PK.stats.name(k);
    if (PK.audio) PK.audio.music('evolve');
    await PK.fx.fadeIn(10);
    await PK.ui.say('What? ' + from + ' is evolving!');
    this.phase = 'anim';
    var self = this;
    await new Promise(function (res) { self.animDone = res; });
    if (this.cancel) {
      this.phase = 'wait';
      await PK.ui.say('Huh? ' + from + ' stopped evolving!');
    } else {
      var oldName = PK.KITS[k.id].name;
      PK.stats.evolve(k, this.to);
      PK.game.catchKit(this.to);
      this.phase = 'done'; this.showNew = true;
      PK.fx.flash(20);
      if (PK.audio) { PK.audio.jingle('evolved'); PK.audio.cry(this.to); }
      await PK.ui.say('Congratulations! Your ' + (k.nick || oldName) + ' evolved into ' + PK.KITS[this.to].name + '!');
      var mv = PK.stats.movesAt(this.to, k.level);
      for (var i = 0; i < mv.length; i++) await learnMove(k, mv[i]);
    }
    await PK.fx.fadeOut(12);
    PK.pop(this);
    if (PK.world && PK.world.resumeMusic) PK.world.resumeMusic();
    await PK.fx.fadeIn(10);
    this.done();
  };
  Evolve.prototype.update = function () {
    if (this.phase !== 'anim') return;
    this.t++;
    if (PK.input.p('b') && this.t < 220) { this.cancel = true; this.phase = 'x'; this.animDone(); return; }
    var period = Math.max(4, 40 - Math.floor(this.t / 7));
    this.showNew = Math.floor(this.t / period) % 2 === 1;
    this.white = Math.min(1, this.t / 60);
    if (this.t % period === 0 && PK.audio) PK.audio.sfx('move');
    if (this.t >= 260) { this.phase = 'x'; this.animDone(); }
  };
  Evolve.prototype.draw = function (ctx) {
    var g = ctx.createRadialGradient(120, 64, 10, 120, 64, 140);
    g.addColorStop(0, '#3a4a7a'); g.addColorStop(1, '#101428');
    ctx.fillStyle = g; ctx.fillRect(0, 0, PK.W, PK.H);
    for (var i = 0; i < 20; i++) {
      var a = i / 20 * Math.PI * 2 + PK.frame / 60;
      var r = 40 + ((PK.frame * 2 + i * 17) % 60);
      ctx.fillStyle = 'rgba(200,220,255,' + (0.6 - r / 140) + ')';
      ctx.fillRect(120 + Math.cos(a) * r, 64 + Math.sin(a) * r * 0.7, 2, 2);
    }
    var id = this.showNew ? this.to : this.k.id;
    if (this.phase === 'done') id = this.k.id;
    var img = PK.kitArt.get(id, 'front', this.k.prism);
    ctx.drawImage(img, 88, 30);
    if (this.phase === 'anim') { ctx.globalAlpha = this.white; ctx.drawImage(PK.silhouette(img, '#ffffff'), 88, 30); ctx.globalAlpha = 1; }
  };

  // ================= KitLog =================
  function KitLog(done) { this.opaque = true; this.done = done; this.i = 0; this.scroll = 0; this.detail = false; }
  KitLog.prototype.update = function () {
    var inp = PK.input, st = PK.game.state;
    if (this.detail) {
      if (inp.cancel() || inp.ok()) { this.detail = false; if (PK.audio) PK.audio.sfx('back'); }
      if (inp.rep('up') || inp.rep('down')) {
        var d = inp.rep('up') ? -1 : 1, j = this.i;
        for (var q = 0; q < 100; q++) { j = (j + d + 100) % 100; if (st.seen[j + 1]) break; }
        this.i = j;
      }
      return;
    }
    if (inp.rep('up')) this.i = (this.i + 99) % 100;
    if (inp.rep('down')) this.i = (this.i + 1) % 100;
    if (inp.rep('left')) this.i = Math.max(0, this.i - 8);
    if (inp.rep('right')) this.i = Math.min(99, this.i + 8);
    if (this.i < this.scroll) this.scroll = this.i;
    if (this.i >= this.scroll + 11) this.scroll = this.i - 10;
    if (inp.ok() && st.seen[this.i + 1]) { this.detail = true; if (PK.audio) { PK.audio.sfx('select'); PK.audio.cry(this.i + 1); } }
    if (inp.cancel()) { if (PK.audio) PK.audio.sfx('back'); PK.pop(this); this.done(); }
  };
  KitLog.prototype.draw = function (ctx) {
    var st = PK.game.state, t = T();
    bgPattern(ctx, '#c84a4a', '#c04444');
    var id = this.i + 1, sp = PK.KITS[id];
    if (this.detail) {
      PK.ui.box(ctx, 4, 4, 232, 86);
      ctx.fillStyle = '#dfe9f6'; ctx.fillRect(10, 10, 70, 74);
      ctx.drawImage(PK.kitArt.get(id, 'front'), 13, 14);
      F().draw(ctx, 'No.' + ('00' + id).slice(-3) + '  ' + sp.name, 88, 12, t.text, t.shadow);
      F().draw(ctx, sp.cat + ' Kit', 88, 26, t.dim);
      sp.types.forEach(function (ty, j) { typeTag(ctx, ty, 88 + j * 42, 40); });
      if (st.caught[id]) {
        var s = sp.stats;
        F().draw(ctx, 'HP ' + s[0] + ' ATK ' + s[1] + ' DEF ' + s[2], 88, 58, t.dim);
        F().draw(ctx, 'TEC ' + s[3] + ' RES ' + s[4] + ' SPD ' + s[5], 88, 70, t.dim);
      }
      PK.ui.box(ctx, 4, 92, 232, 64);
      var txt = st.caught[id] ? sp.dex : 'Catch this Kit to learn more about it.';
      var ls = F().wrap(txt, 214);
      for (var l = 0; l < ls.length; l++) F().draw(ctx, ls[l], 12, 100 + l * 12, t.text, t.shadow);
      return;
    }
    PK.ui.box(ctx, 4, 4, 232, 18);
    F().draw(ctx, 'KITLOG', 12, 9, t.text, t.shadow);
    F().right(ctx, 'SEEN ' + Object.keys(st.seen).length + '  CAUGHT ' + Object.keys(st.caught).length, 228, 9, t.dim);
    PK.ui.box(ctx, 4, 24, 118, 132);
    for (var i = this.scroll; i < this.scroll + 11; i++) {
      var y = 30 + (i - this.scroll) * 11.5, n = i + 1;
      if (i === this.i) F().draw(ctx, '▶', 9, y, t.hi);
      F().draw(ctx, ('00' + n).slice(-3), 17, y, t.dim);
      F().draw(ctx, st.seen[n] ? PK.KITS[n].name : '----------', 38, y, t.text, t.shadow);
      if (st.caught[n]) PK.bfx.drawCapsule(ctx, 113, y + 3, 'capsule');
    }
    PK.ui.box(ctx, 124, 24, 112, 132);
    if (st.seen[id]) {
      ctx.drawImage(PK.kitArt.get(id, 'front'), 148, 34);
      F().center(ctx, sp.name, 180, 104, t.text, t.shadow);
      sp.types.forEach(function (ty, j) { typeTag(ctx, ty, (sp.types.length === 1 ? 161 : 138) + j * 42, 118); });
      F().center(ctx, st.caught[id] ? 'A: details' : 'Seen', 180, 140, t.dim);
    } else F().center(ctx, '?', 180, 80, t.dim, null, 3);
  };

  // ================= Shop =================
  async function shop(stock) {
    var st = PK.game.state;
    for (;;) {
      var c = await PK.ui.ask('Welcome! How may I help you?', ['BUY', 'SELL', 'QUIT']);
      if (c === 0) {
        for (;;) {
          var items = stock.map(function (id) { return { label: PK.ITEMS[id].name, right: '$' + PK.ITEMS[id].price }; });
          items.push({ label: 'CANCEL' });
          var i = await PK.ui.menu(items, { x: 60, y: 4, w: 176, maxRows: 9, title: 'Money: $' + st.money });
          if (i < 0 || i === stock.length) break;
          var id = stock[i], it = PK.ITEMS[id];
          var max = Math.min(99, Math.floor(st.money / it.price));
          if (it.pocket === 'discs' && PK.game.count(id)) { await PK.ui.say('You already have that Skill Disc.'); continue; }
          if (max < 1) { await PK.ui.say("You don't have enough money."); continue; }
          if (it.pocket === 'discs') max = 1;
          var n = max === 1 ? 1 : await PK.ui.number({ min: 1, max: max, w: 110, y: 120, fmt: function (v) { return '$' + v * it.price; } });
          if (n < 1) continue;
          if (await PK.ui.yesno(it.name + ', and you want ' + n + '. That will be $' + n * it.price + '. OK?')) {
            st.money -= n * it.price; PK.game.addItem(id, n);
            if (PK.audio) PK.audio.sfx('buy');
            await PK.ui.say('Here you are! Thank you!');
            if (id === 'capsule' && n >= 10) { PK.game.addItem('pluscapsule', 1); await PK.ui.say('You also get a Plus Capsule as a bonus!'); }
          }
        }
      } else if (c === 1) {
        for (;;) {
          var sell = Object.keys(st.bag).filter(function (id) { return PK.ITEMS[id] && PK.ITEMS[id].pocket !== 'key' && PK.ITEMS[id].pocket !== 'discs' && PK.ITEMS[id].price > 0; });
          var sl = sell.map(function (id) { return { label: PK.ITEMS[id].name, right: '×' + st.bag[id] }; });
          sl.push({ label: 'CANCEL' });
          var si = await PK.ui.menu(sl, { x: 60, y: 4, w: 176, maxRows: 9, title: 'Money: $' + st.money });
          if (si < 0 || si === sell.length) break;
          var sid = sell[si], price = Math.floor(PK.ITEMS[sid].price / 2);
          var cnt = await PK.ui.number({ min: 1, max: st.bag[sid], w: 110, y: 120, fmt: function (v) { return '$' + v * price; } });
          if (cnt < 1) continue;
          if (await PK.ui.yesno('I can pay $' + cnt * price + '. Would that be OK?')) {
            PK.game.removeItem(sid, cnt); st.money += cnt * price;
            if (PK.audio) PK.audio.sfx('buy');
          }
        }
      } else { await PK.ui.say('Please come again!'); return; }
    }
  }

  // ================= Storage =================
  async function storage() {
    var st = PK.game.state;
    await PK.ui.say('You booted up the Kit Storage terminal.');
    for (;;) {
      var c = await PK.ui.ask('What would you like to do?', ['WITHDRAW', 'DEPOSIT', 'RELEASE', 'LOG OFF']);
      if (c === 0) {
        if (!st.box.length) { await PK.ui.say('There are no Kits in storage.'); continue; }
        var i = await pickBox('Withdraw which Kit?');
        if (i < 0) continue;
        if (st.party.length >= 6) { await PK.ui.say('Your party is full!'); continue; }
        var k = st.box.splice(i, 1)[0];
        st.party.push(k);
        await PK.ui.say(PK.stats.name(k) + ' was withdrawn.');
      } else if (c === 1) {
        if (st.party.length <= 1) { await PK.ui.say("You can't deposit your last Kit!"); continue; }
        var pi = await PK.menus.party({ mode: 'item' });
        if (pi < 0) continue;
        if (st.party.filter(function (x, j) { return j !== pi && x.hp > 0; }).length === 0) { await PK.ui.say('You need at least one healthy Kit in your party!'); continue; }
        var dk = st.party.splice(pi, 1)[0];
        PK.stats.heal(dk);
        st.box.push(dk);
        await PK.ui.say(PK.stats.name(dk) + ' was stored in the box.');
      } else if (c === 2) {
        if (!st.box.length) { await PK.ui.say('There are no Kits in storage.'); continue; }
        var ri = await pickBox('Release which Kit?');
        if (ri < 0) continue;
        var rk = st.box[ri];
        if (await PK.ui.yesno('Release ' + PK.stats.name(rk) + ' back into the wild?')) {
          st.box.splice(ri, 1);
          await PK.ui.say(PK.stats.name(rk) + ' was released. Bye bye, ' + PK.stats.name(rk) + '!');
        }
      } else return;
    }
  }
  async function pickBox(title) {
    var st = PK.game.state;
    var items = st.box.map(function (k) { return { label: PK.stats.name(k), right: 'Lv' + k.level }; });
    for (;;) {
      var i = await PK.ui.menu(items, { x: 70, y: 4, w: 166, maxRows: 10, title: title });
      if (i < 0) return -1;
      var c = await PK.ui.menu(['SELECT', 'SUMMARY', 'CANCEL'], { right: 236, bottom: 156 });
      if (c === 0) return i;
      if (c === 1) await summary(i, st.box);
    }
  }

  // ================= Trainer card =================
  function Card(done) { this.opaque = true; this.done = done; }
  Card.prototype.update = function () { if (PK.input.ok() || PK.input.cancel()) { PK.pop(this); this.done(); } };
  Card.prototype.draw = function (ctx) {
    var st = PK.game.state, t = T();
    bgPattern(ctx, '#4a9a8a', '#449284');
    PK.ui.box(ctx, 8, 8, 224, 144);
    ctx.fillStyle = '#e8f0f8'; ctx.fillRect(14, 14, 212, 20);
    F().draw(ctx, 'KEEPER CARD', 20, 20, '#3a5a8a');
    F().draw(ctx, 'NAME', 20, 42, t.dim); F().draw(ctx, st.player.name, 80, 42, t.text, t.shadow);
    F().draw(ctx, 'MONEY', 20, 56, t.dim); F().draw(ctx, '$' + st.money, 80, 56, t.text, t.shadow);
    F().draw(ctx, 'KITLOG', 20, 70, t.dim); F().draw(ctx, Object.keys(st.caught).length + ' caught', 80, 70, t.text, t.shadow);
    F().draw(ctx, 'TIME', 20, 84, t.dim); F().draw(ctx, PK.game.playTime(), 80, 84, t.text, t.shadow);
    ctx.drawImage(PK.chars.portrait('player', 4, 'down'), 158, 36);
    F().draw(ctx, 'CRESTS', 20, 104, t.dim);
    for (var i = 0; i < 8; i++) PK.drawCrest(ctx, 22 + i * 25, 118, i, st.crests[i]);
    if (st.flags.champion) F().draw(ctx, '★ CHAMPION', 150, 104, '#d0a020');
  };

  // ================= Options =================
  async function options() {
    var o = PK.game.state.options;
    var labels = function () {
      return [
        { label: 'TEXT SPEED', right: ['SLOW', 'MID', 'FAST'][o.textSpeed] },
        { label: 'MUSIC', right: Math.round(o.music * 10) + '/10' },
        { label: 'SOUND FX', right: Math.round(o.sfx * 10) + '/10' },
        { label: 'BATTLE FX', right: o.anim ? 'ON' : 'OFF' },
        { label: 'EXPORT SAVE CODE' },
        { label: 'IMPORT SAVE CODE' },
        { label: 'DONE' }
      ];
    };
    var idx = 0;
    for (;;) {
      var i = await PK.ui.menu(labels(), { x: 30, y: 20, w: 180, index: idx, title: 'OPTIONS  (A to change)' });
      if (i < 0 || i === 6) break;
      idx = i;
      if (i === 0) o.textSpeed = (o.textSpeed + 1) % 3;
      if (i === 1) o.music = o.music >= 1 ? 0 : Math.round((o.music + 0.1) * 10) / 10;
      if (i === 2) o.sfx = o.sfx >= 1 ? 0 : Math.round((o.sfx + 0.1) * 10) / 10;
      if (i === 3) o.anim = !o.anim;
      if (i === 4) {
        var code = PK.game.exportCode();
        try { await navigator.clipboard.writeText(code); await PK.ui.say('Save code copied to the clipboard! Keep it somewhere safe.'); }
        catch (e) { window.prompt('Copy your save code:', code); }
      }
      if (i === 5) {
        var inCode = window.prompt('Paste a PixelKits save code:');
        if (inCode) {
          try { PK.game.importCode(inCode); await PK.ui.say('Save imported! Returning to the title screen.'); PK.clearScenes(); PK.push(new PK.TitleScene()); return; }
          catch (e2) { await PK.ui.say('That save code is not valid.'); }
        }
      }
      if (PK.audio) PK.audio.applyVolumes();
    }
    PK.game.saveOptions();
  }

  PK.menus = {
    party: function (opts) { return new Promise(function (res) { PK.push(new Party(opts, res)); }); },
    bag: function (opts) { return new Promise(function (res) { PK.push(new Bag(opts, res)); }); },
    summary: summary,
    learnMove: learnMove,
    evolve: function (k, to) { return new Promise(function (res) { PK.fx.setFade(1); PK.push(new Evolve(k, to, res)); }); },
    kitlog: function () { return new Promise(function (res) { PK.push(new KitLog(res)); }); },
    card: function () { return new Promise(function (res) { PK.push(new Card(res)); }); },
    shop: shop,
    storage: storage,
    options: options,
    useField: useField,
    // Start menu from the overworld
    start: async function () {
      var st = PK.game.state;
      var idx = 0;
      for (;;) {
        var items = [];
        var acts = [];
        if (PK.game.count('kitlog')) { items.push('KITLOG'); acts.push('log'); }
        if (st.party.length) { items.push('KITS'); acts.push('kits'); }
        items.push('BAG'); acts.push('bag');
        items.push(st.player.name); acts.push('card');
        items.push('SAVE'); acts.push('save');
        items.push('OPTIONS'); acts.push('opt');
        if (PK.debug) { items.push('DEBUG'); acts.push('debug'); }
        items.push('EXIT'); acts.push('exit');
        var i = await PK.ui.menu(items, { right: 236, y: 4, index: idx, w: 76 });
        if (i < 0 || acts[i] === 'exit') return;
        idx = i;
        var a = acts[i];
        if (a === 'log') await PK.menus.kitlog();
        if (a === 'kits') await PK.menus.party({ mode: 'field' });
        if (a === 'bag') await PK.menus.bag({ mode: 'field' });
        if (a === 'card') await PK.menus.card();
        if (a === 'opt') await options();
        if (a === 'debug') { await PK.debugMenu(); return; }
        if (a === 'save') {
          var info = 'Crests: ' + PK.game.crestCount() + '  KitLog: ' + Object.keys(st.caught).length + '  Time: ' + PK.game.playTime();
          if (await PK.ui.yesno('Save your progress?  ' + info)) {
            if (PK.world) PK.world.syncPlayer();
            var ok = PK.game.save();
            if (PK.audio) PK.audio.jingle('save');
            await PK.ui.say(ok ? st.player.name + ' saved the game.' : 'Saving failed! Your browser may be blocking storage.');
          }
          return;
        }
      }
    }
  };
})();

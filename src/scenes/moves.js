// Move details (list + info panel), the "new move" card, and Kit editing: rename, reorder/forget moves, colour.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var T = function () { return PK.ui.THEME; };
  var CAT = { P: 'PHYSICAL', T: 'TECHNIQUE', S: 'STATUS' };

  function typeTag(ctx, type, x, y, w) {
    var c = PK.TYPES[type].color;
    ctx.fillStyle = PK.color.shade(c, -0.45); ctx.fillRect(x, y, w, 11);
    ctx.fillStyle = c; ctx.fillRect(x + 1, y + 1, w - 2, 9);
    F().center(ctx, type.toUpperCase(), x + w / 2, y + 2, '#ffffff', PK.color.shade(c, -0.5));
  }
  function bg(ctx) {
    ctx.fillStyle = '#6aa8a0'; ctx.fillRect(0, 0, PK.W, PK.H);
    ctx.fillStyle = '#62a098';
    var o = (PK.frame >> 2) % 16;
    for (var y = -16; y < PK.H; y += 16) for (var x = -16; x < PK.W + 16; x += 32) ctx.fillRect(x + ((y / 16) & 1) * 16 + o, y + o, 16, 16);
  }
  function fullDesc(m) {
    var d = m.desc;
    if (/spread/.test(m.eff || '')) d += ' Hits every foe in double battles.';
    return d;
  }

  // Draw a move's details inside a w-wide column at (x, y). pp = current charges (optional)
  function drawMoveInfo(ctx, id, x, y, w, pp, maxLines) {
    var m = PK.MOVES[id], t = T();
    if (!m) return;
    F().draw(ctx, F().fit(m.name, w), x, y, t.text, t.shadow);
    typeTag(ctx, m.type, x, y + 11, 44);
    F().right(ctx, CAT[m.cat], x + w, y + 13, t.dim);
    F().draw(ctx, 'POWER', x, y + 27, t.dim); F().right(ctx, m.cat === 'S' ? '-' : String(m.power), x + w, y + 27, t.text, t.shadow);
    F().draw(ctx, 'ACCURACY', x, y + 37, t.dim); F().right(ctx, m.acc ? m.acc + '%' : 'SURE HIT', x + w, y + 37, t.text, t.shadow);
    F().draw(ctx, 'CHARGES', x, y + 47, t.dim); F().right(ctx, (pp != null ? pp + '/' : '') + m.pp, x + w, y + 47, t.text, t.shadow);
    if (m.prio > 0) F().draw(ctx, 'Moves first', x, y + 57, '#2a70c0');
    var lines = F().wrap(fullDesc(m), w), top = y + (m.prio > 0 ? 69 : 59);
    for (var i = 0; i < Math.min(maxLines || 4, lines.length); i++) F().draw(ctx, lines[i], x, top + i * 10, t.text, t.shadow);
  }

  // Overlay card shown while a move is being learned
  function showMoveCard(id) {
    var s = {
      draw: function (ctx) {
        var m = PK.MOVES[id], n = Math.min(3, F().wrap(fullDesc(m), 108).length);
        var h = 12 + (m.prio > 0 ? 69 : 59) + n * 10;
        PK.ui.box(ctx, 58, 4, 124, h);
        drawMoveInfo(ctx, id, 66, 10, 108, null, 3);
      }
    };
    PK.push(s);
    return s;
  }

  // ---------------- Move list with a detail panel ----------------
  // opts: kit (edit its moves) or moves (ids), extra (new move id), mode 'pick' | 'edit' | 'view', title, hint
  function MoveList(opts, done) {
    this.opaque = true;
    this.opts = opts || {};
    this.done = done;
    this.i = 0;
    this.scroll = 0;
    this.swapFrom = -1;
    this.busy = false;
  }
  MoveList.prototype.entries = function () {
    var o = this.opts;
    var list = o.kit ? o.kit.moves.map(function (m) { return { id: m.id, pp: m.pp }; }) : (o.moves || []).map(function (m) { return typeof m === 'string' ? { id: m } : m; });
    if (o.extra) list.push({ id: o.extra, isNew: true });
    return list;
  };
  MoveList.prototype.close = function (v) { PK.pop(this); this.done(v); };
  MoveList.prototype.update = function () {
    if (this.busy) return;
    var inp = PK.input, list = this.entries(), n = list.length, self = this;
    if (!n) { if (inp.ok() || inp.cancel()) this.close(-1); return; }
    if (inp.rep('up')) { this.i = (this.i - 1 + n) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('down')) { this.i = (this.i + 1) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (this.i < this.scroll) this.scroll = this.i;
    if (this.i >= this.scroll + 5) this.scroll = this.i - 4;
    if (inp.cancel()) {
      if (PK.audio) PK.audio.sfx('back');
      if (this.swapFrom >= 0) { this.swapFrom = -1; return; }
      return this.close(-1);
    }
    if (!inp.ok()) return;
    if (PK.audio) PK.audio.sfx('select');
    if (this.opts.mode === 'pick') return this.close(this.i);
    if (this.opts.mode !== 'edit') return;
    var mv = this.opts.kit.moves;
    if (this.swapFrom >= 0) {
      var a = this.swapFrom, b = this.i, tmp = mv[a]; mv[a] = mv[b]; mv[b] = tmp;
      this.swapFrom = -1;
      return;
    }
    this.busy = true;
    PK.run(async function () {
      var c = await PK.ui.menu(['SWAP', 'FORGET', 'CANCEL'], { right: 236, bottom: 126 });
      if (c === 0) self.swapFrom = self.i;
      if (c === 1) {
        var k = self.opts.kit, name = PK.stats.name(k), mn = PK.MOVES[mv[self.i].id].name;
        if (mv.length <= 1) await PK.ui.say(name + ' must know at least one move!');
        else if (await PK.ui.yesno('Make ' + name + ' forget ' + mn + '?')) {
          mv.splice(self.i, 1);
          self.i = Math.min(self.i, mv.length - 1);
          await PK.ui.say('1, 2, and... Poof! ' + name + ' forgot ' + mn + '.');
        }
      }
    }).then(function () { self.busy = false; });
  };
  MoveList.prototype.draw = function (ctx) {
    var t = T(), list = this.entries(), o = this.opts;
    bg(ctx);
    PK.ui.box(ctx, 4, 4, 232, 18);
    F().draw(ctx, F().fit(o.title || 'MOVES', 216), 12, 9, t.text, t.shadow);
    PK.ui.box(ctx, 4, 24, 116, 102);
    for (var r = 0; r < 5; r++) {
      var idx = this.scroll + r, e = list[idx];
      if (!e) break;
      var y = 30 + r * 19, m = PK.MOVES[e.id];
      if (idx === this.i) { ctx.fillStyle = t.sel; ctx.fillRect(7, y - 2, 110, 16); }
      if (idx === this.swapFrom) { ctx.fillStyle = '#ffd8d0'; ctx.fillRect(7, y - 2, 110, 16); }
      if (idx === this.i) F().draw(ctx, '▶', 9, y + 2, t.hi);
      typeTag(ctx, m.type, 16, y, 34);
      F().draw(ctx, F().fit(m.name, e.isNew ? 44 : 64), 53, y + 2, e.isNew ? '#2a70c0' : t.text, t.shadow);
      if (e.isNew) F().right(ctx, 'NEW', 115, y + 2, '#e05040');
    }
    if (this.scroll > 0) F().draw(ctx, '▲', 106, 25, t.hi);
    if (this.scroll + 5 < list.length) F().draw(ctx, '▼', 106, 118, t.hi);
    PK.ui.box(ctx, 122, 24, 114, 102);
    var cur = list[this.i];
    if (cur) drawMoveInfo(ctx, cur.id, 129, 30, 100, cur.pp, 3);
    PK.ui.box(ctx, 4, 128, 232, 28);
    var hint = this.swapFrom >= 0 ? 'Swap with which move? (B: cancel)' : (o.hint || 'B: back');
    var hl = F().wrap(hint, 214);
    for (var i = 0; i < Math.min(2, hl.length); i++) F().draw(ctx, hl[i], 12, 134 + i * 10, t.text, t.shadow);
  };

  function moveList(opts) { return new Promise(function (res) { PK.push(new MoveList(opts, res)); }); }

  // ---------------- Kit editing ----------------
  async function rename(k) {
    var sp = PK.KITS[k.id].name;
    var n = await PK.ui.name(PK.stats.name(k) + "'s nickname?", sp, null, k.nick || '');
    if (!n) return;
    var old = PK.stats.name(k);
    k.nick = n === sp ? null : n;
    if (PK.stats.name(k) !== old) await PK.ui.say(old + ' will now be known as ' + PK.stats.name(k) + '!');
  }

  function TintPicker(k, done) {
    this.opaque = true; this.k = k; this.done = done;
    this.i = k.tint || 0;
  }
  TintPicker.prototype.update = function () {
    var inp = PK.input, n = PK.kitArt.TINTS.length;
    if (inp.rep('left') || inp.rep('up')) { this.i = (this.i - 1 + n) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.rep('right') || inp.rep('down')) { this.i = (this.i + 1) % n; if (PK.audio) PK.audio.sfx('move'); }
    if (inp.ok()) { if (PK.audio) PK.audio.sfx('select'); PK.pop(this); this.done(this.i); }
    else if (inp.cancel()) { if (PK.audio) PK.audio.sfx('back'); PK.pop(this); this.done(-1); }
  };
  TintPicker.prototype.draw = function (ctx) {
    var t = T(), k = this.k, tn = PK.kitArt.TINTS[this.i];
    bg(ctx);
    PK.ui.box(ctx, 4, 4, 232, 18);
    F().draw(ctx, 'Choose a color for ' + F().fit(PK.stats.name(k), 100), 12, 9, t.text, t.shadow);
    PK.ui.box(ctx, 64, 26, 112, 100);
    ctx.fillStyle = '#dfe9f6'; ctx.fillRect(68, 30, 104, 92);
    ctx.drawImage(PK.kitArt.get(k.id, 'front', k.prism, this.i), 88, 44);
    if ((PK.frame >> 4) & 1) { F().draw(ctx, '◀', 50, 72, '#ffffff', '#28304c'); F().draw(ctx, '▶', 184, 72, '#ffffff', '#28304c'); }
    PK.ui.box(ctx, 4, 128, 232, 28);
    F().center(ctx, tn.name + (this.i === 0 ? ' (original colors)' : ''), 120, 134, t.text, t.shadow);
    F().center(ctx, '◀ ▶ change   A: keep   B: cancel', 120, 144, t.dim);
  };

  async function editKit(k) {
    for (;;) {
      var c = await PK.ui.menu(['RENAME', 'MOVES', 'COLOR', 'CANCEL'], { right: 236, bottom: 136, title: 'EDIT' });
      if (c === 0) await rename(k);
      else if (c === 1) await moveList({ kit: k, mode: 'edit', title: PK.stats.name(k) + "'s moves", hint: 'A: swap or forget the selected move.  B: back' });
      else if (c === 2) {
        var ti = await new Promise(function (res) { PK.push(new TintPicker(k, res)); });
        if (ti >= 0 && ti !== (k.tint || 0)) {
          k.tint = ti || undefined;
          if (!ti) delete k.tint;
          await PK.ui.say(PK.stats.name(k) + ' looks great in ' + PK.kitArt.TINTS[ti].name + '!');
        }
      } else return;
    }
  }

  PK.moveUI = { drawMoveInfo: drawMoveInfo, showMoveCard: showMoveCard, moveList: moveList, rename: rename, editKit: editKit, fullDesc: fullDesc };
})();

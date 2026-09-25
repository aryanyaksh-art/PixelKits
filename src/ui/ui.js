// UI widgets: frames, text boxes, menus, yes/no, number picker, name entry.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var I = function () { return PK.input; };

  var THEME = {
    frame: '#2c3848', frame2: '#7894bc', frame3: '#c4d4ea', fill: '#fcfcf8',
    text: '#404048', shadow: '#d4d4cc', dim: '#9a9aa4', hi: '#e05040', sel: '#e4ecf8'
  };
  var DARK = {
    frame: '#10141e', frame2: '#5a6c98', frame3: '#8ca0c8', fill: '#2a3450',
    text: '#f8f8f8', shadow: '#141a2c', dim: '#8a94b8', hi: '#ffd060', sel: '#3a4668'
  };

  // window frame: dark rim, 2px coloured band with a light inner line, rounded corners
  function box(ctx, x, y, w, h, st) {
    st = st || THEME;
    ctx.fillStyle = st.frame;
    ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4); ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = st.frame2;
    ctx.fillRect(x + 2, y + 1, w - 4, h - 2); ctx.fillRect(x + 1, y + 2, w - 2, h - 4);
    if (st.frame3) { ctx.fillStyle = st.frame3; ctx.fillRect(x + 3, y + 2, w - 6, h - 4); ctx.fillRect(x + 2, y + 3, w - 4, h - 6); }
    ctx.fillStyle = st.fill;
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  }

  function fmt(text) {
    var g = PK.game && PK.game.state;
    return String(text)
      .replace(/\{PLAYER\}/g, g ? g.player.name : 'YOU')
      .replace(/\{RIVAL\}/g, g ? g.rival : 'RIVAL');
  }

  function textSpeed() {
    var s = PK.game && PK.game.state ? PK.game.state.options.textSpeed : 1;
    return [0.5, 1.2, 3][s == null ? 1 : s];
  }

  // ---------------- TextBox ----------------
  function TextBox(text, opts, done) {
    this.opts = opts || {};
    this.done = done;
    this.x = this.opts.x != null ? this.opts.x : 4;
    this.w = this.opts.w || 232;
    this.h = this.opts.h || 42;
    this.y = this.opts.y != null ? this.opts.y : PK.H - this.h - 2;
    this.st = this.opts.dark ? DARK : THEME;
    var pages = fmt(text).split('\f');
    var lines = [];
    for (var i = 0; i < pages.length; i++) {
      var l = F().wrap(pages[i], this.w - 20);
      if (l.length % 2 && i < pages.length - 1) l.push('');
      lines = lines.concat(l);
    }
    this.lines = lines;
    this.top = 0;
    this.shown = 0;
    this.acc = 0;
    this.timer = 0;
    this.finished = false;
  }
  TextBox.prototype.pageLen = function () {
    var a = this.lines[this.top] || '', b = this.lines[this.top + 1] || '';
    return a.length + b.length;
  };
  TextBox.prototype.update = function () {
    if (this.finished) return;
    var total = this.pageLen();
    var inp = I();
    if (this.shown < total) {
      if (inp.ok() || inp.cancel()) { this.shown = total; return; }
      this.acc += this.opts.instant ? 999 : textSpeed();
      while (this.acc >= 1 && this.shown < total) { this.shown++; this.acc--; }
      if (PK.audio && this.shown % 3 === 0 && !this.opts.silent) PK.audio.sfx('text');
      return;
    }
    var last = this.top + 2 >= this.lines.length;
    if (last) {
      if (this.opts.noWait) return this.finish();
      if (this.opts.auto) {
        this.timer++;
        if (this.timer >= this.opts.auto || inp.ok() || inp.cancel()) this.finish();
        return;
      }
      if (inp.ok() || inp.cancel()) { if (PK.audio) PK.audio.sfx('select'); this.finish(); }
    } else if (inp.ok() || inp.cancel()) {
      if (PK.audio) PK.audio.sfx('select');
      this.top += 2; this.shown = 0; this.acc = 0;
    }
  };
  TextBox.prototype.finish = function () {
    this.finished = true;
    if (!this.opts.keep) PK.pop(this);
    if (this.done) { var d = this.done; this.done = null; d(); }
  };
  TextBox.prototype.close = function () { PK.pop(this); };
  TextBox.prototype.draw = function (ctx) {
    box(ctx, this.x, this.y, this.w, this.h, this.st);
    var left = this.shown;
    for (var i = 0; i < 2; i++) {
      var line = this.lines[this.top + i] || '';
      var s = line.slice(0, Math.max(0, left));
      left -= line.length;
      F().draw(ctx, s, this.x + 10, this.y + 9 + i * 14, this.st.text, this.st.shadow);
    }
    var total = this.pageLen();
    var last = this.top + 2 >= this.lines.length;
    if (this.shown >= total && !this.finished && !this.opts.auto && !this.opts.noWait) {
      if (!last || !this.opts.noArrow) {
        if ((PK.frame >> 4) & 1) F().draw(ctx, '▼', this.x + this.w - 14, this.y + this.h - 11, this.st.hi);
      }
    }
  };

  // ---------------- Menu ----------------
  function Menu(items, opts, done) {
    this.opts = opts || {};
    this.done = done;
    this.items = items.map(function (it) { return typeof it === 'string' ? { label: it } : it; });
    this.index = this.opts.index || 0;
    this.cols = this.opts.cols || 1;
    this.st = this.opts.dark ? DARK : THEME;
    this.rowH = this.opts.rowH || 13;
    this.maxRows = this.opts.maxRows || 99;
    this.scroll = 0;
    var mw = 0;
    for (var i = 0; i < this.items.length; i++) {
      var w = F().width(this.items[i].label) + (this.items[i].right ? F().width(this.items[i].right) + 10 : 0);
      if (w > mw) mw = w;
    }
    this.colW = this.opts.colW || mw + 16;
    // never narrower than the widest label (so long names can't spill out), never wider than the screen
    this.w = Math.min(PK.W - 4, Math.max(this.opts.w || 0, this.colW * this.cols + 12));
    var rows = Math.min(Math.ceil(this.items.length / this.cols), this.maxRows);
    this.h = this.opts.h || rows * this.rowH + 10 + (this.opts.title ? 12 : 0);
    this.x = this.opts.x != null ? this.opts.x : (this.opts.right != null ? this.opts.right - this.w : PK.W - this.w - 4);
    this.x = Math.max(2, Math.min(this.x, PK.W - this.w - 2));
    this.y = this.opts.y != null ? this.opts.y : (this.opts.bottom != null ? this.opts.bottom - this.h : 4);
    this.clampScroll();
  }
  Menu.prototype.clampScroll = function () {
    var row = Math.floor(this.index / this.cols);
    if (row < this.scroll) this.scroll = row;
    if (row >= this.scroll + this.maxRows) this.scroll = row - this.maxRows + 1;
  };
  Menu.prototype.update = function () {
    var inp = I(), n = this.items.length, old = this.index;
    if (inp.rep('up')) this.index = this.index - this.cols >= 0 ? this.index - this.cols : (this.cols === 1 ? n - 1 : this.index);
    if (inp.rep('down')) this.index = this.index + this.cols < n ? this.index + this.cols : (this.cols === 1 ? 0 : this.index);
    if (this.cols > 1) {
      if (inp.rep('left') && this.index % this.cols > 0) this.index--;
      if (inp.rep('right') && this.index % this.cols < this.cols - 1 && this.index + 1 < n) this.index++;
    }
    if (old !== this.index) {
      this.clampScroll();
      if (PK.audio) PK.audio.sfx('move');
      if (this.opts.onChange) this.opts.onChange(this.index);
    }
    if (inp.ok()) {
      var it = this.items[this.index];
      if (it.disabled) { if (PK.audio) PK.audio.sfx('buzz'); return; }
      if (PK.audio) PK.audio.sfx('select');
      this.finish(this.index);
    } else if (inp.cancel() && this.opts.cancel !== false) {
      if (PK.audio) PK.audio.sfx('back');
      this.finish(-1);
    }
  };
  Menu.prototype.finish = function (v) {
    if (!this.opts.keep) PK.pop(this);
    if (this.done) { var d = this.done; this.done = null; d(v); }
  };
  Menu.prototype.draw = function (ctx) {
    box(ctx, this.x, this.y, this.w, this.h, this.st);
    var oy = this.y + 6;
    if (this.opts.title) {
      F().draw(ctx, this.opts.title, this.x + 8, oy, this.st.dim);
      oy += 12;
    }
    var start = this.scroll * this.cols, end = Math.min(this.items.length, start + this.maxRows * this.cols);
    for (var i = start; i < end; i++) {
      var it = this.items[i];
      var r = Math.floor((i - start) / this.cols), c = (i - start) % this.cols;
      var ix = this.x + 8 + c * this.colW, iy = oy + r * this.rowH;
      var col = it.disabled ? this.st.dim : (it.color || this.st.text);
      if (i === this.index) F().draw(ctx, '▶', ix - 1, iy + 1, this.st.hi);
      F().draw(ctx, it.label, ix + 7, iy + 1, col, this.st.shadow);
      if (it.right) F().right(ctx, it.right, this.x + this.w - 8, iy + 1, col, this.st.shadow);
    }
    if (this.scroll > 0) F().draw(ctx, '▲', this.x + this.w - 12, this.y + 3, this.st.hi);
    if (end < this.items.length) F().draw(ctx, '▼', this.x + this.w - 12, this.y + this.h - 9, this.st.hi);
    // optional description panel for the highlighted entry
    if (this.opts.info) {
      var info = this.opts.info(this.index);
      if (info) {
        box(ctx, 4, PK.H - 30, PK.W - 8, 28);
        var il = F().wrap(info, PK.W - 26);
        for (var q = 0; q < Math.min(2, il.length); q++) F().draw(ctx, il[q], 12, PK.H - 24 + q * 10, THEME.text, THEME.shadow);
      }
    }
  };

  // ---------------- Number picker ----------------
  function NumberPick(opts, done) {
    this.opts = opts; this.done = done;
    this.v = opts.start || opts.min || 1;
    this.w = opts.w || 70; this.h = 22;
    this.x = opts.x != null ? opts.x : PK.W - this.w - 4;
    this.y = opts.y != null ? opts.y : 90;
  }
  NumberPick.prototype.update = function () {
    var inp = I(), o = this.opts, old = this.v;
    if (inp.rep('up')) this.v = this.v >= o.max ? o.min : this.v + 1;
    if (inp.rep('down')) this.v = this.v <= o.min ? o.max : this.v - 1;
    if (inp.rep('right')) this.v = Math.min(o.max, this.v + 10);
    if (inp.rep('left')) this.v = Math.max(o.min, this.v - 10);
    if (old !== this.v && PK.audio) PK.audio.sfx('move');
    if (inp.ok()) { PK.pop(this); if (PK.audio) PK.audio.sfx('select'); this.done(this.v); }
    else if (inp.cancel()) { PK.pop(this); if (PK.audio) PK.audio.sfx('back'); this.done(-1); }
  };
  NumberPick.prototype.draw = function (ctx) {
    box(ctx, this.x, this.y, this.w, this.h);
    F().draw(ctx, '×' + (this.v < 10 ? '0' : '') + this.v, this.x + 8, this.y + 8, THEME.text, THEME.shadow);
    if (this.opts.fmt) F().right(ctx, this.opts.fmt(this.v), this.x + this.w - 8, this.y + 8, THEME.text, THEME.shadow);
  };

  // ---------------- Name entry ----------------
  var CHARSETS = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'abcdefghijklmnopqrstuvwxyz'.split(''),
    '0123456789.,!?-\' &'.split('')
  ];
  function NameEntry(title, def, presets, done) {
    this.opaque = true;
    this.title = title;
    this.name = '';
    this.def = def || '';
    this.presets = presets || [];
    this.done = done;
    this.set = 0;
    this.cx = 0; this.cy = 0;
    this.max = 10;
    var self = this;
    this.keyHandler = function (e) {
      if (PK.top() !== self) return;
      if (e.key && e.key.length === 1 && /[A-Za-z0-9 .,!?'&-]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        if (e.key === ' ' && !self.name.length) return;
        if (self.name.length < self.max) { self.name += e.key; if (PK.audio) PK.audio.sfx('move'); }
        else if (PK.audio) PK.audio.sfx('buzz');
      }
    };
    PK.input.onKey(this.keyHandler);
  }
  NameEntry.prototype.enter = function () { PK.input.textMode = true; };
  NameEntry.prototype.exit = function () { PK.input.textMode = false; PK.input.offKey(this.keyHandler); };
  NameEntry.prototype.rows = function () {
    var chars = CHARSETS[this.set];
    var grid = [];
    for (var i = 0; i < chars.length; i += 9) grid.push(chars.slice(i, i + 9));
    grid.push(['ABC', 'abc', '123', 'DEL', 'OK']);
    return grid;
  };
  NameEntry.prototype.update = function () {
    var inp = I(), grid = this.rows();
    if (inp.rep('up')) this.cy = (this.cy - 1 + grid.length) % grid.length;
    if (inp.rep('down')) this.cy = (this.cy + 1) % grid.length;
    var row = grid[this.cy];
    if (inp.rep('left')) this.cx = (this.cx - 1 + row.length) % row.length;
    if (inp.rep('right')) this.cx = (this.cx + 1) % row.length;
    if (this.cx >= row.length) this.cx = row.length - 1;
    if (inp.p('b')) { this.name = this.name.slice(0, -1); if (PK.audio) PK.audio.sfx('back'); }
    if (inp.p('start')) return this.submit();
    if (inp.p('a')) {
      var ch = row[this.cx];
      if (PK.audio) PK.audio.sfx('select');
      if (ch === 'ABC') this.set = 0;
      else if (ch === 'abc') this.set = 1;
      else if (ch === '123') this.set = 2;
      else if (ch === 'DEL') this.name = this.name.slice(0, -1);
      else if (ch === 'OK') return this.submit();
      else if (this.name.length < this.max) this.name += ch;
      if (this.cy >= this.rows().length) this.cy = this.rows().length - 1;
    }
  };
  NameEntry.prototype.submit = function () {
    var n = this.name.trim() || this.def;
    if (!n) { if (PK.audio) PK.audio.sfx('buzz'); return; }
    PK.pop(this);
    this.done(n);
  };
  NameEntry.prototype.draw = function (ctx) {
    ctx.fillStyle = '#dfe6f6'; ctx.fillRect(0, 0, PK.W, PK.H);
    ctx.fillStyle = '#c8d2ec';
    for (var y = 0; y < PK.H; y += 8) for (var x = ((y / 8) & 1) * 8; x < PK.W; x += 16) ctx.fillRect(x, y, 8, 8);
    box(ctx, 4, 4, 232, 34);
    F().draw(ctx, this.title, 12, 10, THEME.dim);
    var shown = this.name + ((PK.frame >> 4) & 1 ? '_' : ' ');
    F().draw(ctx, shown, 12, 23, THEME.text, THEME.shadow);
    if (this.def && !this.name) F().draw(ctx, '(blank = ' + this.def + ')', 120, 23, THEME.dim);
    var grid = this.rows();
    box(ctx, 4, 42, 232, 106);
    for (var r = 0; r < grid.length; r++) {
      var row = grid[r];
      var last = r === grid.length - 1;
      for (var c = 0; c < row.length; c++) {
        var gx = last ? 14 + c * 44 : 20 + c * 23, gy = last ? 132 : 52 + r * 16;
        var sel = r === this.cy && c === this.cx;
        if (sel) { ctx.fillStyle = THEME.sel; ctx.fillRect(gx - 4, gy - 3, last ? 36 : 17, 13); }
        F().draw(ctx, row[c], gx + (last ? 4 : 2), gy, sel ? THEME.hi : THEME.text, THEME.shadow);
      }
    }
    F().draw(ctx, 'Type, or pick letters. ENTER = done', 8, PK.H - 9, '#4a5070');
  };

  PK.ui = {
    THEME: THEME, DARK: DARK, box: box, fmt: fmt, TextBox: TextBox, Menu: Menu,
    say: function (text, opts) {
      if (Array.isArray(text)) {
        var p = Promise.resolve();
        text.forEach(function (t) { p = p.then(function () { return PK.ui.say(t, opts); }); });
        return p;
      }
      return new Promise(function (res) { PK.push(new TextBox(text, opts, res)); });
    },
    // Show text then a choice menu; returns chosen index (-1 on cancel).
    ask: function (text, items, opts) {
      opts = opts || {};
      return new Promise(function (res) {
        var tb = new TextBox(text, { keep: true, noWait: true, dark: opts.dark }, function () {
          var mo = Object.assign({ right: PK.W - 4, bottom: PK.H - 46 }, opts.menu || {});
          PK.push(new Menu(items, mo, function (i) { PK.pop(tb); res(i); }));
        });
        PK.push(tb);
      });
    },
    yesno: function (text, opts) {
      return PK.ui.ask(text, ['YES', 'NO'], opts).then(function (i) { return i === 0; });
    },
    menu: function (items, opts) {
      return new Promise(function (res) { PK.push(new Menu(items, opts, res)); });
    },
    // Overlay a Kit portrait (e.g. while choosing a starter); returns the overlay to PK.pop later
    showKit: function (id) {
      var s = {
        draw: function (ctx) {
          box(ctx, 84, 14, 72, 74);
          ctx.fillStyle = '#dfe9f6'; ctx.fillRect(89, 19, 62, 64);
          ctx.drawImage(PK.kitArt.get(id, 'front'), 88, 18);
        }
      };
      PK.push(s);
      return s;
    },
    number: function (opts) {
      return new Promise(function (res) { PK.push(new NumberPick(opts, res)); });
    },
    // initial: text already in the field (e.g. the current nickname)
    name: function (title, def, presets, initial) {
      return new Promise(function (res) { var ne = new NameEntry(title, def, presets, res); ne.name = initial || ''; PK.push(ne); });
    }
  };
})();

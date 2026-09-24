// Battle scene: presentation layer over PK.Battle (rules live in systems/battleEngine.js).
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var EG = { x: 176, y: 70 }; // enemy ground point
  var PG = { x: 62, y: 124 }; // player ground point
  var ST_COL = { brn: '#e8683a', psn: '#a050c0', par: '#d0a818', slp: '#8a8aa0', frz: '#58b0e0' };

  var BG = {
    vale: ['#9ed4f8', '#dff3ff', '#94cc6c', '#6aa84e'],
    coast: ['#7ccaf6', '#d8f2ff', '#e6d49a', '#c8b074'],
    desert: ['#f4cc94', '#fcebc8', '#e2c080', '#c09a5a'],
    snow: ['#b8cced', '#eef4ff', '#eef3fa', '#c4d2e6'],
    spooky: ['#4a3e6a', '#8a78a8', '#5c5c80', '#44446a'],
    cave: ['#2a221c', '#4a3c30', '#806a54', '#5c4a3a'],
    ice: ['#34507a', '#6a8ab0', '#a8c6e0', '#7a9cc0'],
    volcano: ['#3a1616', '#6a2a1e', '#6e4038', '#4a2a24'],
    ruins: ['#3e3c58', '#6a6888', '#8a88a0', '#646278']
  };

  function bgFor(theme) {
    if (BG[theme]) return BG[theme];
    var t = PK.theme(theme);
    if (t.floor) return [PK.color.shade(t.wall[1], -0.2), t.wall[2], t.floor[1], t.floor[0]];
    return BG.vale;
  }

  function Scene(opts, done) {
    this.opaque = true;
    this.opts = opts;
    this.done = done;
    var st = PK.game.state;
    this.b = new PK.Battle({ wild: opts.wild, playerParty: st.party, enemyParty: opts.enemy, trainer: opts.trainer, ai: opts.ai, enemyItems: opts.items || 0 });
    this.bg = bgFor(opts.theme || 'vale');
    this.night = opts.night;
    this.parts = [];
    this.show = {
      e: { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 },
      p: { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 }
    };
    this.hud = { e: { vis: false, hp: 0 }, p: { vis: false, hp: 0, exp: 0 } };
    this.trainerE = null; // {img, dx}
    this.trainerP = null;
    this.capsule = null; // {x,y,item,open,glow}
    this.mode = 'wait';
    this.cursor = 0;
    this.moveCursor = 0;
    this.tweens = [];
    this.wipe = 1;
    this.flashFrames = 0;
    this.shakeT = 0;
    this.wobble = 0;
    this.darken = 0;
    this.evolveQueue = [];
    this.lastStatPanel = null;
    var self = this;
    PK.run(function () { return self.main(); });
  }
  var S = Scene.prototype;

  // ---------------- helpers ----------------
  S.tween = function (obj, key, to, frames) {
    var self = this;
    return new Promise(function (res) {
      self.tweens.push({ obj: obj, key: key, from: obj[key], to: to, t: 0, n: Math.max(1, frames), res: res });
    });
  };
  S.say = function (text, opts) {
    return PK.ui.say(text, Object.assign({}, opts || {}));
  };
  S.kitImg = function (side) {
    var k = side === 'e' ? this.b.e.kit() : this.b.p.kit();
    return PK.kitArt.get(k.id, side === 'e' ? 'front' : 'back', k.prism);
  };
  S.center = function (side) {
    return side === 'e' ? { x: EG.x + this.show.e.dx, y: EG.y - 28 } : { x: PG.x + this.show.p.dx, y: PG.y - 30 };
  };
  S.lunge = function (side) {
    var s = this.show[side], d = side === 'p' ? 10 : -10;
    var self = this;
    this.tween(s, 'dx', d, 5).then(function () { return self.tween(s, 'dx', 0, 6); });
  };
  S.hpTween = function (side, hp) {
    var h = this.hud[side];
    var max = side === 'e' ? this.b.e.kit().stats[0] : this.b.p.kit().stats[0];
    var frames = Math.max(8, Math.min(50, Math.abs(h.hp - hp) / max * 60));
    return this.tween(h, 'hp', hp, frames);
  };

  // ---------------- main flow ----------------
  S.main = async function () {
    var o = this.opts, st = PK.game.state, self = this;
    if (PK.audio) PK.audio.music(o.music || (o.wild ? 'wild' : 'trainer'));
    PK.game.see(this.b.e.kit().id);
    // reveal wipe
    await this.tween(this, 'wipe', 0, 24);
    var pImg = PK.chars.portrait('player', 3, 'up');
    this.trainerP = { img: pImg, dx: 150 };
    if (o.wild) {
      this.show.e.vis = true; this.show.e.dx = -170; this.show.e.dark = 1;
      this.tween(this.trainerP, 'dx', 0, 40);
      await this.tween(this.show.e, 'dx', 0, 40);
      await this.tween(this.show.e, 'dark', 0, 12);
      if (PK.audio) PK.audio.cry(this.b.e.kit().id);
      this.hud.e.vis = true; this.hud.e.hp = this.b.e.kit().hp;
      await this.say((o.legend ? 'The legendary ' : 'A wild ') + PK.stats.name(this.b.e.kit()) + ' appeared!');
    } else {
      var tImg = PK.chars.portrait(o.trainer.sprite || 'boy', 3, 'down');
      this.trainerE = { img: tImg, dx: -170 };
      this.tween(this.trainerP, 'dx', 0, 40);
      await this.tween(this.trainerE, 'dx', 0, 40);
      await this.say(o.trainer.title + ' ' + o.trainer.name + ' wants to battle!');
      await this.tween(this.trainerE, 'dx', 120, 20);
      await this.sendOut('e', true);
    }
    await this.tween(this.trainerP, 'dx', -140, 18);
    await this.sendOut('p', true);
    var outcome = await this.loop();
    await this.finish(outcome);
  };

  S.sendOut = async function (side, first) {
    var sh = this.show[side];
    var k = side === 'e' ? this.b.e.kit() : this.b.p.kit();
    var g = side === 'e' ? EG : PG;
    if (side === 'p') {
      await this.say('Go! ' + PK.stats.name(k) + '!', { auto: 18, noArrow: true });
      PK.game.see(k.id);
    } else if (!first || !this.opts.wild) {
      PK.game.see(k.id);
      await this.say(this.opts.trainer.name + ' sent out ' + PK.stats.name(k) + '!', { auto: 18, noArrow: true });
    }
    // capsule pop
    this.capsule = { x: g.x, y: g.y - 20, item: 'capsule', open: true, glow: true };
    if (PK.audio) PK.audio.sfx('pop');
    await PK.wait(6);
    this.capsule = null;
    sh.vis = true; sh.dx = 0; sh.dy = 0; sh.scale = 0.1; sh.white = 1; sh.alpha = 1;
    await this.tween(sh, 'scale', 1, 12);
    await this.tween(sh, 'white', 0, 10);
    if (PK.audio) PK.audio.cry(k.id);
    var h = this.hud[side];
    h.vis = true; h.hp = k.hp;
    if (side === 'p') h.exp = PK.stats.expProgress(k);
    await PK.wait(8);
  };

  S.withdraw = async function (side) {
    var sh = this.show[side];
    this.hud[side].vis = side === 'e' ? this.hud.e.vis : false;
    sh.white = 1;
    await this.tween(sh, 'scale', 0.1, 10);
    sh.vis = false; sh.scale = 1; sh.white = 0;
    this.hud[side].vis = false;
  };

  S.loop = async function () {
    var b = this.b;
    for (;;) {
      var act = await this.chooseAction();
      if (!act) continue;
      var eAct = b.chooseAI();
      var ev = b.runTurn(act, eAct);
      var r = await this.play(ev);
      if (r) return r;
      if (b.over === 'fled') return 'fled';
      if (b.over === 'caught') return 'caught';
      // handle faints
      var eDown = b.e.kit().hp <= 0, pDown = b.p.kit().hp <= 0;
      if (eDown) {
        await this.awardExp(b.e.kit());
        if (b.e.alive() === 0) return 'win';
        var ni = b.nextEnemy();
        b.e.idx = ni; b.e.reset();
        this.show.e = { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 };
        await this.sendOut('e');
      }
      if (pDown) {
        if (PK.game.aliveCount() === 0) return 'lose';
        var idx = await PK.menus.party({ mode: 'battle', forced: true });
        b.p.idx = idx; b.p.reset(); b.markPart();
        this.show.p = { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 };
        await this.sendOut('p');
      }
    }
  };

  S.chooseAction = function () {
    var self = this;
    return new Promise(function (res) {
      self.mode = 'action';
      self.resolveAction = async function (sel) {
        self.mode = 'wait';
        var b = self.b, k = b.p.kit();
        if (sel === 0) { res({ type: 'move', idx: self.moveCursor }); return; }
        if (sel === 1) {
          var r = await PK.menus.bag({ mode: 'battle', wild: b.wild });
          if (!r) return res(null);
          if (PK.ITEMS[r.item].use === 'capsule') {
            if (!b.wild || self.opts.noCatch) { await self.say(self.opts.noCatch ? 'It won\'t let you catch it!' : "You can't catch another keeper's Kit!"); return res(null); }
            PK.game.removeItem(r.item);
            return res({ type: 'catch', item: r.item });
          }
          if (PK.ITEMS[r.item].use === 'escape') {
            if (!b.wild) { await self.say("You can't run from a keeper battle!"); return res(null); }
            PK.game.removeItem(r.item);
            return res({ type: 'run', force: true });
          }
          PK.game.removeItem(r.item);
          return res({ type: 'item', item: r.item, target: r.target });
        }
        if (sel === 2) {
          var i = await PK.menus.party({ mode: 'battle' });
          if (i < 0 || i === b.p.idx) return res(null);
          return res({ type: 'switch', idx: i });
        }
        if (sel === 3) {
          if (!b.wild) { await self.say("No! There's no running from a keeper battle!"); return res(null); }
          if (self.opts.noRun) { await self.say("You can't run away!"); return res(null); }
          return res({ type: 'run' });
        }
        void k;
      };
    });
  };

  // play engine events; returns an outcome string if the battle must end immediately
  S.play = async function (ev) {
    var b = this.b;
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      switch (e.t) {
        case 'msg': await this.say(e.text, e.auto ? { auto: e.auto } : { auto: 55 }); break;
        case 'anim':
          if (PK.game.state.options.anim) {
            var m = PK.MOVES[e.move];
            await PK.bfx.playMove(this, m, this.center(e.side), this.center(e.target), e.target, e.side);
          }
          break;
        case 'dmg':
          var sh = this.show[e.side];
          if (!e.quiet) {
            if (PK.audio) PK.audio.sfx(e.eff > 1 ? 'hit_super' : e.eff < 1 ? 'hit_weak' : 'hit');
            sh.blink = 16;
            if (e.eff > 1) PK.fx.shake(10, 2);
          }
          await this.hpTween(e.side, e.hp);
          break;
        case 'heal':
          if (PK.audio) PK.audio.sfx('heal');
          await this.hpTween(e.side, e.hp);
          break;
        case 'hp': this.hud[e.side].hp = e.hp; await PK.wait(10); break;
        case 'status': await PK.wait(4); break;
        case 'fx':
          var c = this.center(e.side);
          var col = { up: '#80c0ff', down: '#ff8080', brn: '#ff8030', psn: '#c070e0', par: '#ffe040', slp: '#c0c0d0', conf: '#ffd0f0' }[e.fx] || '#fff';
          for (var q = 0; q < 12; q++) {
            PK.bfx.spawn(this, { x: c.x + PK.rnd(40) - 20, y: c.y + (e.fx === 'down' ? -20 : 20) - PK.rnd(8), vy: e.fx === 'down' ? 1.2 : -1.2, col: col, life: 24, shape: e.fx === 'slp' ? 'ring' : 'sq', size: 2, delay: q });
          }
          if (PK.audio) PK.audio.sfx(e.fx === 'up' ? 'statup' : e.fx === 'down' ? 'statdown' : 'status');
          await PK.wait(20);
          break;
        case 'faint':
          if (PK.audio) PK.audio.sfx('faint');
          var s2 = this.show[e.side];
          await this.tween(s2, 'dy', 70, 20);
          s2.vis = false; s2.dy = 0;
          this.hud[e.side].vis = e.side === 'e' ? false : this.hud[e.side].vis;
          if (e.side === 'p') this.hud.p.vis = false;
          break;
        case 'withdraw':
          await this.say(e.text, { auto: 20 });
          await this.withdraw(e.side);
          break;
        case 'send':
          this.show[e.side] = { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 };
          if (e.side === 'p') {
            this.capsule = { x: PG.x, y: PG.y - 20, item: 'capsule', open: true, glow: true };
            if (PK.audio) PK.audio.sfx('pop');
            await PK.wait(6);
            this.capsule = null;
            var ps = this.show.p;
            ps.vis = true; ps.scale = 0.1; ps.white = 1;
            await this.say(e.text, { auto: 18, noArrow: true });
            await this.tween(ps, 'scale', 1, 12);
            await this.tween(ps, 'white', 0, 8);
            this.hud.p.vis = true; this.hud.p.hp = b.p.kit().hp; this.hud.p.exp = PK.stats.expProgress(b.p.kit());
          } else await this.sendOut('e');
          break;
        case 'capsule':
          await this.catchAnim(e);
          if (e.ok) return 'caught';
          break;
        case 'fled':
          if (PK.audio) PK.audio.sfx('flee');
          return 'fled';
      }
    }
    return null;
  };

  S.catchAnim = async function (e) {
    var sh = this.show.e;
    await this.say(e.text, { auto: 20, noArrow: true });
    var cap = { x: PG.x + 10, y: PG.y - 40, item: e.item, open: false, glow: false };
    this.capsule = cap;
    if (PK.audio) PK.audio.sfx('throw');
    // arc to enemy
    var sx = cap.x, sy = cap.y, tx = EG.x, ty = EG.y - 36;
    for (var f = 0; f <= 24; f++) {
      var t = f / 24;
      cap.x = sx + (tx - sx) * t;
      cap.y = sy + (ty - sy) * t - Math.sin(t * Math.PI) * 36;
      await PK.wait(1);
    }
    cap.open = true; cap.glow = true;
    if (PK.audio) PK.audio.sfx('pop');
    sh.white = 1;
    await this.tween(sh, 'scale', 0.05, 12);
    sh.vis = false;
    cap.open = false;
    // drop
    for (var d = 0; d < 12; d++) { cap.y += 2; await PK.wait(1); }
    cap.glow = false;
    for (var s = 0; s < e.shakes; s++) {
      await PK.wait(18);
      if (PK.audio) PK.audio.sfx('wobble');
      for (var w = 0; w < 10; w++) { cap.x = tx + Math.sin(w / 10 * Math.PI * 2) * 3; await PK.wait(1); }
      cap.x = tx;
    }
    await PK.wait(20);
    if (e.ok) {
      if (PK.audio) PK.audio.sfx('caught');
      for (var i = 0; i < 10; i++) PK.bfx.spawn(this, { x: cap.x, y: cap.y, vx: Math.cos(i) * 1.5, vy: -1 - Math.random(), col: '#fff8a0', life: 26, shape: 'star', size: 2 });
      cap.glow = true;
      await PK.wait(20);
    } else {
      cap.open = true; cap.glow = true;
      if (PK.audio) PK.audio.sfx('pop');
      sh.vis = true;
      await this.tween(sh, 'scale', 1, 10);
      sh.white = 0;
      this.capsule = null;
    }
  };

  S.awardExp = async function (defeated) {
    var b = this.b, st = PK.game.state;
    var list = [];
    st.party.forEach(function (k) {
      if (k.hp <= 0 || k.level >= 100) return;
      var part = !!b.participants[k.uid];
      list.push({ k: k, amt: b.expFor(defeated, k, part), part: part });
    });
    b.participants = {};
    b.markPart();
    var sharedShown = false;
    for (var i = 0; i < list.length; i++) {
      var x = list[i], k = x.k;
      var isActive = k === b.p.kit();
      if (x.part) await this.say(PK.stats.name(k) + ' gained ' + x.amt + ' EXP. Points!');
      else if (!sharedShown) { await this.say('The rest of your team gained EXP. Points too!', { auto: 60 }); sharedShown = true; }
      var startLv = k.level;
      var ups = PK.stats.addExp(k, x.amt);
      if (isActive) {
        if (PK.audio) PK.audio.sfx('exp');
        for (var u = 0; u < ups.length; u++) {
          await this.tween(this.hud.p, 'exp', 1, 30);
          this.hud.p.exp = 0;
          this.hud.p.hp = k.hp;
        }
        await this.tween(this.hud.p, 'exp', PK.stats.expProgress(k), 30);
        this.hud.p.hp = k.hp;
      }
      for (var j = 0; j < ups.length; j++) {
        var up = ups[j];
        if (PK.audio) PK.audio.jingle('levelup');
        await this.say(PK.stats.name(k) + ' grew to Lv. ' + up.level + '!');
        if (j === ups.length - 1) await this.statPanel(ups[0].before, up.after);
        await this.learnMoves(k, up.level);
      }
      if (ups.length && PK.stats.evoTarget(k) && this.evolveQueue.indexOf(k) < 0) this.evolveQueue.push(k);
      void startLv;
    }
  };

  S.statPanel = async function (before, after) {
    var self = this;
    this.lastStatPanel = { before: before, after: after, totals: false };
    await new Promise(function (res) { self.panelRes = res; });
    this.lastStatPanel.totals = true;
    await new Promise(function (res) { self.panelRes = res; });
    this.lastStatPanel = null;
  };

  S.learnMoves = async function (k, level) {
    var mv = PK.stats.movesAt(k.id, level);
    for (var i = 0; i < mv.length; i++) await PK.menus.learnMove(k, mv[i]);
  };

  S.finish = async function (outcome) {
    var o = this.opts, st = PK.game.state, b = this.b;
    this.mode = 'wait';
    if (outcome === 'win') {
      if (o.trainer) {
        if (PK.audio) PK.audio.music('victory');
        this.trainerE = { img: PK.chars.portrait(o.trainer.sprite || 'boy', 3, 'down'), dx: 140 };
        await this.tween(this.trainerE, 'dx', 0, 22);
        await this.say('You defeated ' + o.trainer.title + ' ' + o.trainer.name + '!');
        if (o.trainer.lose) await this.say(o.trainer.lose);
        var maxL = Math.max.apply(null, o.enemy.map(function (k) { return k.level; }));
        var reward = (o.trainer.reward || 20) * maxL;
        st.money += reward;
        await this.say('You got $' + reward + ' for winning!');
      } else {
        if (PK.audio) PK.audio.music('victory');
        await PK.wait(20);
      }
    } else if (outcome === 'caught') {
      var k = b.e.kit();
      var isNew = !st.caught[k.id];
      await this.say('Gotcha! ' + PK.stats.name(k) + ' was caught!');
      if (PK.audio) PK.audio.jingle('caught');
      k.status = null;
      k.caughtAt = o.place || '';
      k.capsule = o.lastCapsule;
      if (isNew) await this.say(PK.stats.name(k) + "'s data was added to the KitLog!");
      var nick = await PK.ui.yesno('Give a nickname to the caught ' + PK.stats.name(k) + '?');
      if (nick) {
        var n = await PK.ui.name(PK.stats.name(k) + "'s nickname?", PK.KITS[k.id].name);
        if (n && n !== PK.KITS[k.id].name) k.nick = n;
      }
      var where = PK.game.giveKit(k);
      if (where === 'box') await this.say(PK.stats.name(k) + ' was sent to the Storage Box.');
    } else if (outcome === 'lose') {
      if (o.canLose) {
        await this.say(o.trainer && o.trainer.winText ? o.trainer.winText : 'You lost the battle...');
      } else {
        await this.say(st.player.name + ' is out of usable Kits!');
        var lost = Math.floor(st.money / 2);
        st.money -= lost;
        await this.say(st.player.name + ' dropped $' + lost + ' and hurried away...');
      }
    }
    // clear battle volatile state
    st.party.forEach(function (k) { if (k.hp <= 0) k.status = null; });
    // evolutions after battle
    for (var i = 0; i < this.evolveQueue.length; i++) {
      var ek = this.evolveQueue[i], to = PK.stats.evoTarget(ek);
      if (to && ek.hp > 0 && outcome !== 'lose') await PK.menus.evolve(ek, to);
    }
    await PK.fx.fadeOut(16);
    PK.pop(this);
    this.done(outcome);
  };

  // ---------------- update ----------------
  S.update = function () {
    for (var i = this.tweens.length - 1; i >= 0; i--) {
      var tw = this.tweens[i];
      tw.t++;
      var p = Math.min(1, tw.t / tw.n);
      tw.obj[tw.key] = tw.from + (tw.to - tw.from) * p;
      if (p >= 1) { this.tweens.splice(i, 1); tw.res(); }
    }
    PK.bfx.updateParts(this);
    ['e', 'p'].forEach(function (k) { var s = this.show[k]; if (s.blink > 0) s.blink--; }, this);
    if (this.flashFrames > 0) this.flashFrames--;
    if (this.shakeT > 0) this.shakeT--;
    if (this.wobble > 0) this.wobble--;
    if (this.darken > 0) this.darken--;
    var inp = PK.input;
    if (this.lastStatPanel && this.panelRes && (inp.ok() || inp.cancel())) {
      var r = this.panelRes; this.panelRes = null; if (PK.audio) PK.audio.sfx('select'); r();
      return;
    }
    if (this.mode === 'action') {
      var c = this.cursor;
      if (inp.rep('up') || inp.rep('down')) c ^= 2;
      if (inp.rep('left') || inp.rep('right')) c ^= 1;
      if (c !== this.cursor) { this.cursor = c; if (PK.audio) PK.audio.sfx('move'); }
      if (inp.ok()) {
        if (PK.audio) PK.audio.sfx('select');
        if (this.cursor === 0) { this.mode = 'moves'; return; }
        this.resolveAction(this.cursor);
      } else if (inp.cancel() && this.cursor !== 3) { this.cursor = 3; if (PK.audio) PK.audio.sfx('move'); }
    } else if (this.mode === 'moves') {
      var k = this.b.p.kit(), n = k.moves.length;
      var m = this.moveCursor;
      if (inp.rep('up') || inp.rep('down')) { if ((m ^ 2) < n) m ^= 2; }
      if (inp.rep('left') || inp.rep('right')) { if ((m ^ 1) < n) m ^= 1; }
      if (m !== this.moveCursor) { this.moveCursor = m; if (PK.audio) PK.audio.sfx('move'); }
      if (inp.ok()) {
        var mv = k.moves[this.moveCursor];
        var allOut = k.moves.every(function (x) { return x.pp <= 0; });
        if (mv.pp <= 0 && !allOut) {
          if (PK.audio) PK.audio.sfx('buzz');
          var self = this;
          this.mode = 'wait';
          this.say('No charges left for this move!').then(function () { self.mode = 'moves'; });
          return;
        }
        if (PK.audio) PK.audio.sfx('select');
        this.resolveAction(0);
      } else if (inp.cancel()) { this.mode = 'action'; if (PK.audio) PK.audio.sfx('back'); }
    }
  };

  // ---------------- drawing ----------------
  S.drawKit = function (ctx, side) {
    var s = this.show[side];
    if (!s.vis) return;
    if (s.blink > 0 && ((s.blink >> 1) & 1)) return;
    var img = this.kitImg(side);
    var g = side === 'e' ? EG : PG;
    var bob = img.float ? Math.round(Math.sin(PK.frame / 14) * 2) - 6 : 0;
    var sc = s.scale;
    var w = img.width * sc, h = img.height * sc;
    var x = Math.round(g.x + s.dx - w / 2), y = Math.round(g.y + s.dy + bob - (img.height - 2) * sc);
    if (this.shakeT > 0 && this.shakeKey === side) x += (this.shakeT % 4 < 2 ? 2 : -2);
    if (this.wobble > 0) x += Math.round(Math.sin(this.wobble / 2) * 2);
    ctx.save();
    if (s.dy > 0) { ctx.beginPath(); ctx.rect(0, 0, PK.W, g.y + 2); ctx.clip(); }
    ctx.globalAlpha = s.alpha;
    ctx.drawImage(img, x, y, w, h);
    if (s.white > 0 || s.dark > 0) {
      ctx.globalAlpha = Math.max(s.white, s.dark);
      ctx.drawImage(PK.silhouette(img, s.white > 0 ? '#ffffff' : '#1a1a2a'), x, y, w, h);
    }
    ctx.restore();
  };

  S.drawHud = function (ctx, side) {
    var h = this.hud[side];
    if (!h.vis) return;
    var sd = side === 'e' ? this.b.e : this.b.p;
    var k = sd.kit();
    var x, y, w, bh;
    if (side === 'e') { x = 4; y = 6; w = 110; bh = 28; }
    else { x = 126; y = 78; w = 110; bh = 36; }
    PK.ui.box(ctx, x, y, w, bh);
    F().draw(ctx, PK.stats.name(k), x + 7, y + 5, '#383848', '#d6d4c8');
    F().right(ctx, 'Lv' + k.level, x + w - 7, y + 5, '#383848', '#d6d4c8');
    if (side === 'e' && PK.game.state.caught[k.id] && this.b.wild) PK.bfx.drawCapsule(ctx, x + w - 36, y + 9, 'capsule');
    var max = k.stats[0];
    var hp = Math.max(0, h.hp);
    var frac = hp / max;
    var bx = x + 22, by = y + 16, bw = w - 30;
    F().draw(ctx, 'HP', x + 7, by - 1, '#e0a030');
    ctx.fillStyle = '#28304c'; ctx.fillRect(bx - 1, by, bw + 2, 5);
    ctx.fillStyle = '#50586c'; ctx.fillRect(bx, by + 1, bw, 3);
    ctx.fillStyle = frac > 0.5 ? '#48d060' : frac > 0.2 ? '#f0c030' : '#e84838';
    ctx.fillRect(bx, by + 1, Math.ceil(bw * frac), 3);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(bx, by + 1, Math.ceil(bw * frac), 1);
    if (k.status) {
      var sx = side === 'e' ? x + 7 : x + 7, sy = side === 'e' ? y + 22 : y + 24;
      if (side === 'e') { sy = y + bh - 1; }
      ctx.fillStyle = ST_COL[k.status]; ctx.fillRect(sx, sy - 1, 19, 9);
      F().draw(ctx, PK.battleUtil.ST_NAME[k.status], sx + 2, sy, '#ffffff');
    }
    if (side === 'p') {
      F().right(ctx, Math.ceil(hp) + '/' + max, x + w - 7, y + 23, '#383848', '#d6d4c8');
      ctx.fillStyle = '#28304c'; ctx.fillRect(x + 30, y + 32, w - 38, 2);
      ctx.fillStyle = '#48a8f0'; ctx.fillRect(x + 30, y + 32, Math.floor((w - 38) * h.exp), 2);
    }
  };

  S.drawBg = function (ctx) {
    var c = this.bg;
    var g = ctx.createLinearGradient(0, 0, 0, 96);
    g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, PK.W, 96);
    ctx.fillStyle = c[2]; ctx.fillRect(0, 88, PK.W, PK.H - 88);
    ctx.fillStyle = c[3];
    for (var y = 92; y < PK.H; y += 6) ctx.fillRect(0, y, PK.W, 1);
    // horizon details
    ctx.fillStyle = PK.color.shade(c[2], -0.12);
    ctx.fillRect(0, 88, PK.W, 3);
    // platforms
    this.platform(ctx, EG.x, EG.y, 46, 10, c);
    this.platform(ctx, PG.x, PG.y - 2, 56, 11, c);
  };
  S.platform = function (ctx, x, y, rx, ry, c) {
    ctx.fillStyle = PK.color.shade(c[3], -0.3);
    ctx.beginPath(); ctx.ellipse(x, y + 1, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PK.color.shade(c[2], 0.12);
    ctx.beginPath(); ctx.ellipse(x, y, rx - 2, ry - 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PK.color.shade(c[2], 0.25);
    ctx.beginPath(); ctx.ellipse(x - 6, y - 2, rx - 14, ry - 5, 0, 0, Math.PI * 2); ctx.fill();
  };

  S.draw = function (ctx) {
    this.drawBg(ctx);
    if (this.trainerE) ctx.drawImage(this.trainerE.img, EG.x - 24 + this.trainerE.dx, EG.y - 46);
    this.drawKit(ctx, 'e');
    if (this.trainerP) ctx.drawImage(this.trainerP.img, PG.x - 24 + this.trainerP.dx, PG.y - 46);
    this.drawKit(ctx, 'p');
    if (this.capsule) PK.bfx.drawCapsule(ctx, this.capsule.x, this.capsule.y, this.capsule.item, this.capsule.open, this.capsule.glow);
    if (this.darken > 0) { ctx.fillStyle = 'rgba(20,10,40,' + Math.min(0.45, this.darken / 40) + ')'; ctx.fillRect(0, 0, PK.W, PK.H); }
    PK.bfx.drawParts(ctx, this);
    if (this.night) { ctx.fillStyle = 'rgba(20,30,80,0.18)'; ctx.fillRect(0, 0, PK.W, 116); }
    this.drawHud(ctx, 'e');
    this.drawHud(ctx, 'p');
    if (this.flashFrames > 0 && this.flashFrames % 2) { ctx.fillStyle = 'rgba(255,255,240,0.55)'; ctx.fillRect(0, 0, PK.W, PK.H); }
    // bottom panel
    var T = PK.ui.THEME;
    if (this.mode !== 'action' && this.mode !== 'moves' && this.wipe <= 0) PK.ui.box(ctx, 4, 116, 232, 42);
    if (this.mode === 'action') {
      PK.ui.box(ctx, 4, 116, 232, 42);
      var nm = PK.stats.name(this.b.p.kit());
      F().draw(ctx, 'What will', 14, 125, T.text, T.shadow);
      F().draw(ctx, nm + ' do?', 14, 139, T.text, T.shadow);
      PK.ui.box(ctx, 124, 116, 112, 42);
      var labels = ['ATTACK', 'BAG', 'KITS', 'FLEE'];
      for (var i = 0; i < 4; i++) {
        var lx = 138 + (i % 2) * 50, ly = 125 + (i >> 1) * 14;
        if (i === this.cursor) F().draw(ctx, '▶', lx - 8, ly, T.hi);
        F().draw(ctx, labels[i], lx, ly, T.text, T.shadow);
      }
    } else if (this.mode === 'moves') {
      var k = this.b.p.kit();
      PK.ui.box(ctx, 4, 116, 162, 42);
      for (var j = 0; j < 4; j++) {
        var mx = 16 + (j % 2) * 76, my = 125 + (j >> 1) * 14;
        var mv = k.moves[j];
        if (j === this.moveCursor) F().draw(ctx, '▶', mx - 8, my, T.hi);
        F().draw(ctx, mv ? PK.MOVES[mv.id].name : '-', mx, my, mv && mv.pp === 0 ? T.dim : T.text, T.shadow);
      }
      PK.ui.box(ctx, 166, 116, 70, 42);
      var cur = k.moves[this.moveCursor];
      if (cur) {
        var md = PK.MOVES[cur.id];
        F().draw(ctx, 'CH', 174, 125, T.dim);
        F().right(ctx, cur.pp + '/' + md.pp, 228, 125, cur.pp === 0 ? T.hi : T.text, T.shadow);
        var tc = PK.TYPES[md.type].color;
        ctx.fillStyle = tc; ctx.fillRect(172, 137, 58, 11);
        ctx.fillStyle = PK.color.shade(tc, -0.4); ctx.fillRect(172, 147, 58, 1);
        F().center(ctx, md.type + (md.cat === 'S' ? '' : md.cat === 'P' ? ' P' : ' T'), 201, 139, '#ffffff', PK.color.shade(tc, -0.5));
      }
    }
    if (this.lastStatPanel) {
      var sp = this.lastStatPanel;
      PK.ui.box(ctx, 140, 22, 96, 86);
      for (var q = 0; q < 6; q++) {
        F().draw(ctx, PK.STAT_NAMES[q], 148, 30 + q * 12, T.text, T.shadow);
        var val = sp.totals ? String(sp.after[q]) : '+' + (sp.after[q] - sp.before[q]);
        F().right(ctx, val, 228, 30 + q * 12, T.text, T.shadow);
      }
    }
    if (this.wipe > 0) {
      ctx.fillStyle = '#000';
      for (var r = 0; r < 10; r++) {
        var ww = PK.W * this.wipe;
        if (r % 2) ctx.fillRect(PK.W - ww, r * 16, ww, 16); else ctx.fillRect(0, r * 16, ww, 16);
      }
    }
  };

  PK.startBattle = function (opts) {
    return new Promise(function (res) {
      PK.push(new Scene(opts, res));
      PK.fx.setFade(0);
    });
  };
  PK.BattleScene = Scene;
})();

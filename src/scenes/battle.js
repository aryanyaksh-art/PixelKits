// Battle scene: presentation layer over PK.Battle (rules live in systems/battleEngine.js).
// Handles single battles, double battles (2 Kits per side) and Safari encounters.
(function () {
  'use strict';
  var PK = window.PK;
  var F = function () { return PK.font; };
  var ST_COL = { brn: '#e8683a', psn: '#a050c0', par: '#d0a818', slp: '#8a8aa0', frz: '#58b0e0' };
  // ground points for each battler key
  var POS1 = { e0: { x: 176, y: 70 }, p0: { x: 62, y: 124 } };
  var POS2 = { e0: { x: 150, y: 58 }, e1: { x: 206, y: 64 }, p0: { x: 42, y: 124 }, p1: { x: 100, y: 130 } };

  var BG = {
    vale: ['#9ed4f8', '#dff3ff', '#94cc6c', '#6aa84e'],
    coast: ['#7ccaf6', '#d8f2ff', '#e6d49a', '#c8b074'],
    desert: ['#f4cc94', '#fcebc8', '#e2c080', '#c09a5a'],
    snow: ['#b8cced', '#eef4ff', '#eef3fa', '#c4d2e6'],
    spooky: ['#4a3e6a', '#8a78a8', '#5c5c80', '#44446a'],
    cave: ['#2a221c', '#4a3c30', '#806a54', '#5c4a3a'],
    ice: ['#34507a', '#6a8ab0', '#a8c6e0', '#7a9cc0'],
    volcano: ['#3a1616', '#6a2a1e', '#6e4038', '#4a2a24'],
    ruins: ['#3e3c58', '#6a6888', '#8a88a0', '#646278'],
    island: ['#8ad8f8', '#e4f8ff', '#a8dc78', '#78b858']
  };

  function bgFor(theme) {
    if (BG[theme]) return BG[theme];
    var t = PK.theme(theme);
    if (t.floor) return [PK.color.shade(t.wall[1], -0.2), t.wall[2], t.floor[1], t.floor[0]];
    return BG.vale;
  }
  function blankShow() { return { vis: false, dx: 0, dy: 0, scale: 1, white: 0, alpha: 1, blink: 0, dark: 0 }; }

  function Scene(opts, done) {
    this.opaque = true;
    this.opts = opts;
    this.done = done;
    var st = PK.game.state;
    this.safari = !!opts.safari;
    this.b = new PK.Battle({ wild: opts.wild, double: opts.double, playerParty: st.party, enemyParty: opts.enemy, trainer: opts.trainer, trainer2: opts.trainer2, ai: opts.ai, enemyItems: opts.items || 0 });
    this.pos = this.b.double ? POS2 : POS1;
    this.bg = bgFor(opts.theme || 'vale');
    this.night = opts.night;
    this.parts = [];
    this.show = {};
    this.hud = {};
    var self = this;
    this.b.all().forEach(function (bt) { self.show[bt.key] = blankShow(); self.hud[bt.key] = { vis: false, hp: 0, exp: 0 }; });
    this.trainerE = null; // {img, dx}
    this.trainerE2 = null;
    this.trainerP = null;
    this.capsule = null; // {x,y,item,open,glow}
    this.mode = 'wait';
    this.cursor = 0;
    this.moveCursor = 0;
    this.targetCursor = 0;
    this.actor = null; // battler choosing an action
    this.tweens = [];
    this.wipe = 1;
    this.flashFrames = 0;
    this.shakeT = 0;
    this.wobble = 0;
    this.darken = 0;
    this.evolveQueue = [];
    this.awarded = {};
    this.lastStatPanel = null;
    this.safariState = { eat: 0, angry: 0 };
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
    return PK.ui.say(text, Object.assign({ dark: true }, opts || {}));
  };
  S.bt = function (key) { return this.b.byKey(key); };
  S.kitImg = function (key) {
    var k = this.bt(key).kit();
    return PK.kitArt.get(k.id, key[0] === 'e' ? 'front' : 'back', k.prism, k.tint);
  };
  S.center = function (key) {
    var g = this.pos[key] || this.pos[key[0] + '0'];
    var s = this.show[key] || { dx: 0 };
    return key[0] === 'e' ? { x: g.x + s.dx, y: g.y - 28 } : { x: g.x + s.dx, y: g.y - 30 };
  };
  S.lunge = function (key) {
    var s = this.show[key];
    if (!s) return;
    var d = key[0] === 'p' ? 10 : -10;
    var self = this;
    this.tween(s, 'dx', d, 5).then(function () { return self.tween(s, 'dx', 0, 6); });
  };
  S.hpTween = function (key, hp) {
    var h = this.hud[key];
    var max = this.bt(key).kit().stats[0];
    var frames = Math.max(8, Math.min(50, Math.abs(h.hp - hp) / max * 60));
    return this.tween(h, 'hp', hp, frames);
  };
  S.foeName = function () {
    var o = this.opts;
    if (o.trainer2) return o.trainer.title + ' ' + o.trainer.name + ' & ' + o.trainer2.name;
    return o.trainer.title + ' ' + o.trainer.name;
  };

  // ---------------- main flow ----------------
  S.main = async function () {
    var o = this.opts, self = this, b = this.b;
    if (PK.audio) PK.audio.music(o.music || (o.wild ? 'wild' : 'trainer'));
    PK.game.see(b.e.kit().id);
    await this.tween(this, 'wipe', 0, 24);
    var pImg = PK.chars.portrait('player', 3, 'up');
    this.trainerP = { img: pImg, dx: 150 };
    if (o.wild) {
      var e0 = this.show.e0;
      e0.vis = true; e0.dx = -170; e0.dark = 1;
      this.tween(this.trainerP, 'dx', 0, 40);
      await this.tween(e0, 'dx', 0, 40);
      await this.tween(e0, 'dark', 0, 12);
      if (PK.audio) PK.audio.cry(b.e.kit().id);
      this.hud.e0.vis = true; this.hud.e0.hp = b.e.kit().hp;
      await this.say((o.legend ? 'The legendary ' : 'A wild ') + PK.stats.name(b.e.kit()) + ' appeared!');
      if (this.safari) {
        var out = await this.safariLoop();
        return this.finish(out);
      }
    } else {
      this.trainerE = { img: PK.chars.portrait(o.trainer.sprite || 'boy', 3, 'down'), dx: -170 };
      if (o.trainer2) this.trainerE2 = { img: PK.chars.portrait(o.trainer2.sprite || 'girl', 3, 'down'), dx: -170 };
      this.tween(this.trainerP, 'dx', 0, 40);
      if (this.trainerE2) this.tween(this.trainerE2, 'dx', 0, 40);
      await this.tween(this.trainerE, 'dx', 0, 40);
      await this.say(o.trainer2 ? this.foeName() + ' want to battle!' : this.foeName() + ' wants to battle!');
      if (this.trainerE2) this.tween(this.trainerE2, 'dx', 140, 20);
      await this.tween(this.trainerE, 'dx', 120, 20);
      for (var i = 0; i < b.e.slots.length; i++) await this.sendOut(b.e.slots[i].key, true);
    }
    await this.tween(this.trainerP, 'dx', -140, 18);
    for (var j = 0; j < b.p.slots.length; j++) await this.sendOut(b.p.slots[j].key, true);
    // entry abilities, fastest first
    var order = b.all().filter(function (x) { return x.alive(); }).sort(function (x, y) { return b.stat(y, 5) - b.stat(x, 5); });
    for (var q = 0; q < order.length; q++) await this.play(b.entry(order[q], []));
    var outcome = await this.loop();
    await this.finish(outcome);
  };

  S.sendOut = async function (key, first) {
    var sh = this.show[key] = blankShow();
    var bt = this.bt(key), k = bt.kit();
    var g = this.pos[key];
    if (key[0] === 'p') {
      await this.say('Go! ' + PK.stats.name(k) + '!', { auto: 18, noArrow: true });
      PK.game.see(k.id);
    } else if (!first || !this.opts.wild) {
      PK.game.see(k.id);
      var who = this.opts.trainer2 && bt.slot === 1 ? this.opts.trainer2.name : this.opts.trainer.name;
      await this.say(who + ' sent out ' + PK.stats.name(k) + '!', { auto: 18, noArrow: true });
    }
    this.capsule = { x: g.x, y: g.y - 20, item: 'capsule', open: true, glow: true };
    if (PK.audio) PK.audio.sfx('pop');
    await PK.wait(6);
    this.capsule = null;
    sh.vis = true; sh.scale = 0.1; sh.white = 1;
    await this.tween(sh, 'scale', 1, 12);
    await this.tween(sh, 'white', 0, 10);
    if (PK.audio) PK.audio.cry(k.id);
    var h = this.hud[key];
    h.vis = true; h.hp = k.hp;
    if (key[0] === 'p') h.exp = PK.stats.expProgress(k);
    await PK.wait(8);
  };

  S.withdraw = async function (key) {
    var sh = this.show[key];
    sh.white = 1;
    await this.tween(sh, 'scale', 0.1, 10);
    sh.vis = false; sh.scale = 1; sh.white = 0;
    this.hud[key].vis = false;
  };

  S.loop = async function () {
    var b = this.b, self = this;
    for (;;) {
      var acts = await this.chooseActions();
      if (!acts) continue;
      var eActs = b.chooseAI();
      var ev = b.runTurn(acts, eActs);
      var r = await this.play(ev);
      if (r) return r;
      if (b.over === 'fled') return 'fled';
      if (b.over === 'caught') return 'caught';
      // experience for every newly fainted foe
      for (var i = 0; i < b.e.party.length; i++) {
        var ek = b.e.party[i];
        if (ek.hp <= 0 && !this.awarded[ek.uid]) { this.awarded[ek.uid] = true; await this.awardExp(ek); }
      }
      if (b.e.alive() === 0) return 'win';
      if (b.p.alive() === 0) return 'lose';
      // refill empty enemy slots
      for (var s = 0; s < b.e.slots.length; s++) {
        var es = b.e.slots[s];
        if (es.alive()) continue;
        var ni = b.nextEnemy();
        if (ni < 0) { this.show[es.key].vis = false; this.hud[es.key].vis = false; continue; }
        var eev = b.sendIn(es, ni);
        await this.sendOut(es.key);
        await this.play(eev);
      }
      // refill fainted player slots
      for (var t = 0; t < b.p.slots.length; t++) {
        var ps = b.p.slots[t];
        if (ps.alive()) continue;
        if (!b.p.bench().length) { this.show[ps.key].vis = false; this.hud[ps.key].vis = false; continue; }
        var idx = await PK.menus.party({ mode: 'battle', forced: true, exclude: b.p.slots.map(function (x) { return x.idx; }) });
        var pev = b.sendIn(ps, idx);
        await this.sendOut(ps.key);
        await this.play(pev);
      }
      void self;
    }
  };

  // Ask for one action per active player Kit. Returns array of actions (null = redo the turn).
  S.chooseActions = async function () {
    var b = this.b, acts = [], taken = [];
    for (var i = 0; i < b.p.slots.length; i++) {
      var bt = b.p.slots[i];
      if (!bt.alive()) { acts.push(null); continue; }
      this.actor = bt;
      var a = await this.chooseAction(bt, i > 0 && acts.some(Boolean), taken);
      if (a === 'back') {
        // go back to the previous Kit's choice
        var prev = i - 1;
        while (prev >= 0 && !acts[prev]) prev--;
        if (prev < 0) { i--; continue; }
        acts.length = prev; taken = acts.filter(function (x) { return x && x.type === 'switch'; }).map(function (x) { return x.idx; });
        i = prev - 1;
        continue;
      }
      if (!a) { i--; continue; }
      if (a.type === 'switch') taken.push(a.idx);
      acts.push(a);
      if (a.type === 'run' || a.type === 'catch') break;
    }
    this.actor = null;
    return acts;
  };

  S.chooseAction = function (bt, canBack, taken) {
    var self = this;
    return new Promise(function (res) {
      self.mode = 'action';
      self.canBack = canBack;
      self.backRes = function () { self.mode = 'wait'; res('back'); };
      self.resolveAction = async function (sel) {
        self.mode = 'wait';
        var b = self.b;
        if (sel === 0) {
          var mv = bt.kit().moves[self.moveCursor], m = mv ? PK.MOVES[mv.id] : null;
          var foes = b.foesOf(bt);
          var effs = m ? PK.battleUtil.parseEff(m.eff) : [];
          var needsTarget = m && b.double && foes.length > 1 && !effs.some(function (x) { return x.k === 'spread'; }) &&
            (m.cat !== 'S' || (effs[0] && (effs[0].who === 'foe' || ['brn', 'psn', 'par', 'slp', 'frz', 'conf'].indexOf(effs[0].k) >= 0)));
          if (!needsTarget) return res({ type: 'move', idx: self.moveCursor, target: foes[0] && foes[0].key });
          var tk = await self.pickTarget(foes);
          if (!tk) { self.mode = 'moves'; return; }
          return res({ type: 'move', idx: self.moveCursor, target: tk });
        }
        if (sel === 1) {
          var r = await PK.menus.bag({ mode: 'battle', wild: b.wild });
          if (!r) return res(null);
          if (PK.ITEMS[r.item].use === 'capsule') {
            if (!b.wild || self.opts.noCatch) { await self.say(self.opts.noCatch ? 'It won\'t let you catch it!' : "You can't catch another keeper's Kit!"); return res(null); }
            PK.game.removeItem(r.item);
            self.opts.lastCapsule = r.item;
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
          var i = await PK.menus.party({ mode: 'battle', exclude: b.p.slots.map(function (x) { return x.idx; }).concat(taken || []) });
          if (i < 0) return res(null);
          return res({ type: 'switch', idx: i });
        }
        if (sel === 3) {
          if (!b.wild) { await self.say("No! There's no running from a keeper battle!"); return res(null); }
          if (self.opts.noRun) { await self.say("You can't run away!"); return res(null); }
          return res({ type: 'run' });
        }
      };
    });
  };

  S.pickTarget = function (foes) {
    var self = this;
    return new Promise(function (res) {
      self.targets = foes;
      self.targetCursor = Math.min(self.targetCursor, foes.length - 1);
      self.mode = 'target';
      self.targetRes = function (v) { self.mode = 'wait'; self.targets = null; res(v); };
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
          this.hud[e.side].vis = false;
          break;
        case 'withdraw':
          await this.say(e.text, { auto: 20 });
          await this.withdraw(e.side);
          break;
        case 'send':
          if (e.side[0] === 'p') {
            var g = this.pos[e.side];
            var ps = this.show[e.side] = blankShow();
            this.capsule = { x: g.x, y: g.y - 20, item: 'capsule', open: true, glow: true };
            if (PK.audio) PK.audio.sfx('pop');
            await PK.wait(6);
            this.capsule = null;
            ps.vis = true; ps.scale = 0.1; ps.white = 1;
            await this.say(e.text, { auto: 18, noArrow: true });
            await this.tween(ps, 'scale', 1, 12);
            await this.tween(ps, 'white', 0, 8);
            var pk = this.bt(e.side).kit();
            this.hud[e.side] = { vis: true, hp: pk.hp, exp: PK.stats.expProgress(pk) };
          } else await this.sendOut(e.side);
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
    void b;
    return null;
  };

  S.catchAnim = async function (e) {
    var sh = this.show.e0, pg = this.pos.p0, eg = this.pos.e0;
    await this.say(e.text, { auto: 20, noArrow: true });
    var cap = { x: pg.x + 10, y: pg.y - 40, item: e.item, open: false, glow: false };
    this.capsule = cap;
    if (PK.audio) PK.audio.sfx('throw');
    var sx = cap.x, sy = cap.y, tx = eg.x, ty = eg.y - 36;
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

  // ---------------- Safari ----------------
  S.safariLoop = async function () {
    var b = this.b, st = PK.game.state, sf = this.safariState, k = b.e.kit(), self = this;
    if (!st.safari) st.safari = { balls: 30, steps: 500 };
    for (;;) {
      if (st.safari && st.safari.balls <= 0) { await this.say('You have no Safari Capsules left!'); return 'fled'; }
      var c = await this.safariChoice();
      if (c === 0) {
        st.safari.balls--;
        var base = b.catchChance('safaricapsule');
        var p = Math.min(1, base * (sf.eat > 0 ? 0.5 : 1) * (sf.angry > 0 ? 2 : 1));
        this.opts.lastCapsule = 'safaricapsule';
        var ev = [];
        b.tryCatch(b.e.slots[0], { item: 'safaricapsule', chance: p }, ev);
        var r = await this.play(ev);
        if (r === 'caught') return 'caught';
      } else if (c === 1) {
        await this.say(st.player.name + ' tossed a Snack!');
        sf.eat = 1 + PK.rnd(5); sf.angry = 0;
        await this.say(PK.stats.name(k) + ' is eating!');
      } else if (c === 2) {
        await this.say(st.player.name + ' clapped loudly!');
        sf.angry = 1 + PK.rnd(5); sf.eat = 0;
        this.shakeKey = 'e0'; this.shakeT = 20;
        await this.say(PK.stats.name(k) + ' is angry!');
      } else {
        if (PK.audio) PK.audio.sfx('flee');
        await this.say('Got away safely!');
        return 'fled';
      }
      // does it run off?
      var flee = Math.min(0.45, 0.04 + PK.KITS[k.id].stats[5] / 500);
      if (sf.eat > 0) { flee /= 3; sf.eat--; }
      if (sf.angry > 0) { flee *= 2; sf.angry--; }
      if (st.safari.balls > 0 && Math.random() < flee) {
        if (PK.audio) PK.audio.sfx('flee');
        await this.say('Wild ' + PK.stats.name(k) + ' fled!');
        return 'fled';
      }
      void self;
    }
  };
  S.safariChoice = function () {
    var self = this;
    return new Promise(function (res) {
      self.mode = 'safari';
      self.safariRes = function (v) { self.mode = 'wait'; res(v); };
    });
  };

  S.awardExp = async function (defeated) {
    var b = this.b, st = PK.game.state;
    var list = [];
    var tp = PK.tpYield(PK.KITS[defeated.id]);
    st.party.forEach(function (k) {
      if (k.hp <= 0 || k.level >= 100) return;
      var part = !!b.participants[k.uid];
      if (part) PK.stats.addTP(k, tp.stat, tp.n);
      list.push({ k: k, amt: b.expFor(defeated, k, part), part: part });
    });
    b.participants = {};
    b.markPart();
    var sharedShown = false;
    for (var i = 0; i < list.length; i++) {
      var x = list[i], k = x.k;
      var holder = b.p.slots.filter(function (s) { return s.kit() === k; })[0];
      if (x.part) await this.say(PK.stats.name(k) + ' gained ' + x.amt + ' EXP. Points!');
      else if (!sharedShown) { await this.say('The rest of your team gained EXP. Points too!', { auto: 60 }); sharedShown = true; }
      var ups = PK.stats.addExp(k, x.amt);
      if (holder && this.hud[holder.key]) {
        var h = this.hud[holder.key];
        if (PK.audio) PK.audio.sfx('exp');
        for (var u = 0; u < ups.length; u++) {
          await this.tween(h, 'exp', 1, 30);
          h.exp = 0;
          h.hp = k.hp;
        }
        await this.tween(h, 'exp', PK.stats.expProgress(k), 30);
        h.hp = k.hp;
      }
      for (var j = 0; j < ups.length; j++) {
        var up = ups[j];
        if (PK.audio) PK.audio.jingle('levelup');
        await this.say(PK.stats.name(k) + ' grew to Lv. ' + up.level + '!');
        if (j === ups.length - 1) await this.statPanel(ups[0].before, up.after);
        await this.learnMoves(k, up.level);
      }
      if (ups.length && PK.stats.evoTarget(k) && this.evolveQueue.indexOf(k) < 0) this.evolveQueue.push(k);
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
        if (PK.audio) PK.audio.music(o.victoryMusic || 'victory');
        this.trainerE = { img: PK.chars.portrait(o.trainer.sprite || 'boy', 3, 'down'), dx: 140 };
        if (o.trainer2) this.trainerE2 = { img: PK.chars.portrait(o.trainer2.sprite || 'girl', 3, 'down'), dx: 140 };
        if (this.trainerE2) this.tween(this.trainerE2, 'dx', 0, 22);
        await this.tween(this.trainerE, 'dx', 0, 22);
        await this.say(o.trainer2 ? 'You defeated ' + this.foeName() + '!' : 'You defeated ' + this.foeName() + '!');
        if (o.trainer.lose) await this.say(o.trainer.lose);
        if (o.trainer2 && o.trainer2.lose) await this.say(o.trainer2.lose);
        var maxL = Math.max.apply(null, o.enemy.map(function (k) { return k.level; }));
        var reward = (o.trainer.reward || 20) * maxL + (o.trainer2 ? (o.trainer2.reward || 20) * maxL : 0);
        st.money += reward;
        await this.say('You got $' + reward + ' for winning!');
      } else {
        if (PK.audio) PK.audio.music('victory');
        await PK.wait(20);
      }
      await this.forage();
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
    st.party.forEach(function (k) { if (k.hp <= 0) k.status = null; });
    for (var i = 0; i < this.evolveQueue.length; i++) {
      var ek = this.evolveQueue[i], to = PK.stats.evoTarget(ek);
      if (to && ek.hp > 0 && outcome !== 'lose') await PK.menus.evolve(ek, to);
    }
    await PK.fx.fadeOut(16);
    PK.pop(this);
    this.done(outcome);
  };

  // Forager ability: Kits with no held item sometimes pick something up after a win
  var FORAGE = ['tonic', 'tonic', 'capsule', 'remedy', 'hitonic', 'pluscapsule', 'chargecell', 'rekindle', 'megatonic', 'procapsule'];
  S.forage = async function () {
    var st = PK.game.state;
    for (var i = 0; i < st.party.length; i++) {
      var k = st.party[i];
      if (k.hp > 0 && !k.held && PK.stats.ability(k) === 'forager' && Math.random() < 0.1) {
        var tier = Math.min(FORAGE.length - 1, Math.floor(k.level / 10) + PK.rnd(3));
        k.held = FORAGE[tier];
        if (PK.ITEMS[k.held]) await this.say(PK.stats.name(k) + ' found a ' + PK.ITEMS[k.held].name + ' and is holding it!');
        else k.held = null;
      }
    }
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
    for (var key in this.show) if (this.show[key].blink > 0) this.show[key].blink--;
    if (this.flashFrames > 0) this.flashFrames--;
    if (this.shakeT > 0) this.shakeT--;
    if (this.wobble > 0) this.wobble--;
    if (this.darken > 0) this.darken--;
    var inp = PK.input;
    if (this.lastStatPanel && this.panelRes && (inp.ok() || inp.cancel())) {
      var r = this.panelRes; this.panelRes = null; if (PK.audio) PK.audio.sfx('select'); r();
      return;
    }
    if (this.mode === 'action' || this.mode === 'safari') {
      var c = this.cursor;
      if (inp.rep('up') || inp.rep('down')) c ^= 2;
      if (inp.rep('left') || inp.rep('right')) c ^= 1;
      if (c !== this.cursor) { this.cursor = c; if (PK.audio) PK.audio.sfx('move'); }
      if (inp.ok()) {
        if (PK.audio) PK.audio.sfx('select');
        if (this.mode === 'safari') { this.safariRes(this.cursor); return; }
        if (this.cursor === 0) { this.mode = 'moves'; this.moveCursor = Math.min(this.moveCursor, this.actor.kit().moves.length - 1); return; }
        this.resolveAction(this.cursor);
      } else if (inp.cancel()) {
        if (this.mode === 'action' && this.canBack) { if (PK.audio) PK.audio.sfx('back'); this.backRes(); }
        else if (this.cursor !== 3) { this.cursor = 3; if (PK.audio) PK.audio.sfx('move'); }
      }
    } else if (this.mode === 'moves') {
      var k = this.actor.kit(), n = k.moves.length;
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
    } else if (this.mode === 'target') {
      var nt = this.targets.length, tc = this.targetCursor;
      if (inp.rep('left') || inp.rep('up')) tc = (tc + nt - 1) % nt;
      if (inp.rep('right') || inp.rep('down')) tc = (tc + 1) % nt;
      if (tc !== this.targetCursor) { this.targetCursor = tc; if (PK.audio) PK.audio.sfx('move'); }
      if (inp.ok()) { if (PK.audio) PK.audio.sfx('select'); this.targetRes(this.targets[this.targetCursor].key); }
      else if (inp.cancel()) { if (PK.audio) PK.audio.sfx('back'); this.targetRes(null); }
    }
  };

  // ---------------- drawing ----------------
  S.drawKit = function (ctx, key) {
    var s = this.show[key];
    if (!s || !s.vis || !this.bt(key).kit()) return;
    if (s.blink > 0 && ((s.blink >> 1) & 1)) return;
    var img = this.kitImg(key);
    var g = this.pos[key];
    var bob = img.float ? Math.round(Math.sin(PK.frame / 14) * 2) - 6 : 0;
    var sc = s.scale * (this.b.double ? 0.85 : 1);
    var w = img.width * sc, h = img.height * sc;
    var x = Math.round(g.x + s.dx - w / 2), y = Math.round(g.y + s.dy + bob - (img.height - 2) * sc);
    if (this.shakeT > 0 && this.shakeKey === key) x += (this.shakeT % 4 < 2 ? 2 : -2);
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
    if (this.mode === 'target' && this.targets[this.targetCursor].key === key && ((PK.frame >> 3) & 1)) {
      F().center(ctx, '▼', g.x, y - 8, '#ff5040', '#ffffff');
    }
  };

  // FireRed-style angled HUD panel
  function hudBox(ctx, x, y, w, h, flip) {
    ctx.fillStyle = '#34443c';
    ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4); ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#f8f8e0';
    ctx.fillRect(x + 2, y + 1, w - 4, h - 2); ctx.fillRect(x + 1, y + 2, w - 2, h - 4);
    ctx.fillStyle = '#d8d8b8';
    ctx.fillRect(x + 2, y + h - 3, w - 4, 1);
    ctx.fillStyle = '#34443c';
    if (flip) ctx.fillRect(x + w - 1, y + h - 6, 1, 4); else ctx.fillRect(x, y + h - 6, 1, 4);
  }
  function hpBar(ctx, x, y, w, frac) {
    ctx.fillStyle = '#34443c'; ctx.fillRect(x - 12, y - 1, w + 13, 5);
    F().draw(ctx, 'HP', x - 11, y - 1, '#f8c830');
    ctx.fillStyle = '#506058'; ctx.fillRect(x, y, w, 3);
    ctx.fillStyle = frac > 0.5 ? '#58d080' : frac > 0.2 ? '#f8c830' : '#f05838';
    ctx.fillRect(x, y, Math.ceil(w * frac), 3);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, Math.ceil(w * frac), 1);
  }

  S.drawHud = function (ctx, key) {
    var h = this.hud[key];
    if (!h || !h.vis) return;
    var bt = this.bt(key), k = bt.kit();
    if (!k) return;
    var enemy = key[0] === 'e', dbl = this.b.double, x, y, w, bh;
    if (!dbl) { if (enemy) { x = 6; y = 8; w = 110; bh = 28; } else { x = 124; y = 76; w = 112; bh = 37; } }
    else {
      var sl = bt.slot;
      if (enemy) { x = 4 + sl * 6; y = 4 + sl * 22; w = 104; bh = 20; }
      else { x = 132 - sl * 6; y = 76 + sl * 20; w = 104; bh = 20; }
    }
    hudBox(ctx, x, y, w, bh, !enemy);
    var T = PK.ui.THEME;
    var lv = 'Lv' + k.level;
    var tagW = k.status ? 22 : 0;
    var nameW = w - 16 - F().width(lv) - 4 - tagW;
    F().draw(ctx, F().fit(PK.stats.name(k), nameW), x + 6, y + 4, T.text, T.shadow);
    F().right(ctx, lv, x + w - 7, y + 4, T.text, T.shadow);
    if (k.status) {
      var sx = x + w - 7 - F().width(lv) - 21;
      ctx.fillStyle = ST_COL[k.status]; ctx.fillRect(sx, y + 3, 19, 9);
      F().draw(ctx, PK.battleUtil.ST_NAME[k.status], sx + 2, y + 4, '#ffffff');
    }
    if (enemy && PK.game.state.caught[k.id] && this.b.wild) PK.bfx.drawCapsule(ctx, x + 10, y + 22, 'capsule');
    var max = k.stats[0], hp = Math.max(0, h.hp);
    hpBar(ctx, x + 22, y + (dbl ? 13 : 15), w - 30, hp / max);
    if (!enemy && !dbl) {
      F().right(ctx, Math.ceil(hp) + '/' + max, x + w - 7, y + 20, T.text, T.shadow);
      ctx.fillStyle = '#34443c'; ctx.fillRect(x + 30, y + 31, w - 38, 3);
      ctx.fillStyle = '#48a8f0'; ctx.fillRect(x + 31, y + 32, Math.floor((w - 40) * h.exp), 1);
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
    ctx.fillStyle = PK.color.shade(c[2], -0.12);
    ctx.fillRect(0, 88, PK.W, 3);
    if (this.b.double) {
      this.platform(ctx, 178, 63, 62, 11, c);
      this.platform(ctx, 72, 126, 70, 12, c);
    } else {
      this.platform(ctx, this.pos.e0.x, this.pos.e0.y, 46, 10, c);
      this.platform(ctx, this.pos.p0.x, this.pos.p0.y - 2, 56, 11, c);
    }
  };
  S.platform = function (ctx, x, y, rx, ry, c) {
    ctx.fillStyle = PK.color.shade(c[3], -0.3);
    ctx.beginPath(); ctx.ellipse(x, y + 1, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PK.color.shade(c[2], 0.12);
    ctx.beginPath(); ctx.ellipse(x, y, rx - 2, ry - 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PK.color.shade(c[2], 0.25);
    ctx.beginPath(); ctx.ellipse(x - 6, y - 2, rx - 14, ry - 5, 0, 0, Math.PI * 2); ctx.fill();
  };

  S.drawPanel = function (ctx) {
    var T = PK.ui.THEME;
    var busy = this.mode !== 'action' && this.mode !== 'moves' && this.mode !== 'target' && this.mode !== 'safari';
    var D = PK.ui.DARK;
    if (busy && this.wipe <= 0) PK.ui.box(ctx, 4, 116, 232, 42, D);
    if (this.mode === 'action' || this.mode === 'safari') {
      PK.ui.box(ctx, 4, 116, 232, 42, D);
      if (this.mode === 'safari') {
        F().draw(ctx, 'What will', 14, 125, D.text, D.shadow);
        F().draw(ctx, F().fit(PK.game.state.player.name, 80) + ' do?', 14, 139, D.text, D.shadow);
      } else {
        var nm = F().fit(PK.stats.name(this.actor.kit()), 80);
        F().draw(ctx, 'What will', 14, 125, D.text, D.shadow);
        F().draw(ctx, nm + ' do?', 14, 139, D.text, D.shadow);
      }
      PK.ui.box(ctx, 120, 116, 116, 42);
      var balls = PK.game.state.safari ? PK.game.state.safari.balls : 0;
      var labels = this.mode === 'safari' ? ['CAPSULE', 'SNACK', 'CLAP', 'RUN'] : ['ATTACK', 'BAG', 'KITS', 'FLEE'];
      for (var i = 0; i < 4; i++) {
        var lx = 134 + (i % 2) * 52, ly = 125 + (i >> 1) * 14;
        if (i === this.cursor) F().draw(ctx, '▶', lx - 8, ly, T.hi);
        F().draw(ctx, labels[i], lx, ly, T.text, T.shadow);
      }
      if (this.mode === 'safari') F().right(ctx, '×' + balls, 230, 107, '#ffffff', '#34443c');
      if (this.canBack && this.mode === 'action') F().draw(ctx, 'B: back', 124, 107, '#ffffff', '#34443c');
    } else if (this.mode === 'moves' || this.mode === 'target') {
      var k = this.actor.kit();
      PK.ui.box(ctx, 4, 116, 162, 42);
      if (this.mode === 'target') {
        var tb = this.targets[this.targetCursor];
        F().draw(ctx, 'Attack which foe?', 14, 125, T.text, T.shadow);
        F().draw(ctx, '▶ ' + F().fit(PK.stats.name(tb.kit()), 120), 14, 139, T.hi, T.shadow);
      } else {
        for (var j = 0; j < 4; j++) {
          var mx = 14 + (j % 2) * 76, my = 125 + (j >> 1) * 14;
          var mv = k.moves[j];
          if (j === this.moveCursor) F().draw(ctx, '▶', mx - 8, my, T.hi);
          F().draw(ctx, mv ? F().fit(PK.MOVES[mv.id].name, 68) : '-', mx, my, mv && mv.pp === 0 ? T.dim : T.text, T.shadow);
        }
      }
      var cm = k.moves[this.moveCursor];
      if (cm && this.mode === 'moves') {
        var dl = F().wrap(PK.moveUI.fullDesc(PK.MOVES[cm.id]), 150).slice(0, 3);
        var bh = dl.length * 10 + 8;
        PK.ui.box(ctx, 4, 116 - bh, 162, bh);
        for (var q = 0; q < dl.length; q++) F().draw(ctx, dl[q], 11, 116 - bh + 5 + q * 10, T.text, T.shadow);
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
  };

  S.draw = function (ctx) {
    var self = this;
    this.drawBg(ctx);
    if (this.trainerE2) ctx.drawImage(this.trainerE2.img, 204 - 24 + this.trainerE2.dx, this.pos.e0.y - 60);
    if (this.trainerE) ctx.drawImage(this.trainerE.img, (this.trainerE2 ? 152 : this.pos.e0.x) - 24 + this.trainerE.dx, this.pos.e0.y - 60);
    var keys = Object.keys(this.show).sort(function (a, b) {
      if (a[0] !== b[0]) return a[0] === 'e' ? -1 : 1;
      return (self.pos[a] ? self.pos[a].y : 0) - (self.pos[b] ? self.pos[b].y : 0);
    });
    keys.filter(function (k) { return k[0] === 'e'; }).forEach(function (k) { self.drawKit(ctx, k); });
    if (this.trainerP) ctx.drawImage(this.trainerP.img, this.pos.p0.x - 24 + this.trainerP.dx, this.pos.p0.y - 58);
    keys.filter(function (k) { return k[0] === 'p'; }).forEach(function (k) { self.drawKit(ctx, k); });
    if (this.capsule) PK.bfx.drawCapsule(ctx, this.capsule.x, this.capsule.y, this.capsule.item, this.capsule.open, this.capsule.glow);
    if (this.darken > 0) { ctx.fillStyle = 'rgba(20,10,40,' + Math.min(0.45, this.darken / 40) + ')'; ctx.fillRect(0, 0, PK.W, PK.H); }
    PK.bfx.drawParts(ctx, this);
    if (this.night) { ctx.fillStyle = 'rgba(20,30,80,0.18)'; ctx.fillRect(0, 0, PK.W, 116); }
    Object.keys(this.hud).forEach(function (k) { self.drawHud(ctx, k); });
    if (this.flashFrames > 0 && this.flashFrames % 2) { ctx.fillStyle = 'rgba(255,255,240,0.55)'; ctx.fillRect(0, 0, PK.W, PK.H); }
    this.drawPanel(ctx);
    var T = PK.ui.THEME;
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

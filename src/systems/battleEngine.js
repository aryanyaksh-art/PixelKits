// Turn-based battle rules. Pure logic: produces an event list the battle scene plays back.
// Supports single battles (1 active Kit per side) and double battles (2 per side).
// Each active slot is a Battler with a key: 'p0', 'p1' (player) and 'e0', 'e1' (foe).
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var STAT_IDX = { atk: 1, def: 2, tec: 3, res: 4, spd: 5 };
  var STAT_NAME = { 1: 'ATK', 2: 'DEF', 3: 'TEC', 4: 'RES', 5: 'SPD' };
  var ST_NAME = { brn: 'BRN', psn: 'PSN', par: 'PAR', slp: 'SLP', frz: 'FRZ' };
  var INFLICT = ['brn', 'psn', 'par', 'slp', 'frz', 'conf'];
  var ABSORB = { soakup: 'Tide', conductor: 'Volt', sapeater: 'Leaf', kindling: 'Blaze' };
  var PINCH = { greenfury: 'Leaf', lastember: 'Blaze', undertow: 'Tide', hivefury: 'Swarm' };

  // ---------------- Battler (one active slot) ----------------
  function Battler(side, slot, idx) {
    this.side = side;
    this.slot = slot;
    this.idx = idx;
    this.key = (side.isPlayer ? 'p' : 'e') + slot;
    this.reset();
  }
  Battler.prototype.kit = function () { return this.idx >= 0 ? this.side.party[this.idx] : null; };
  Battler.prototype.alive = function () { var k = this.kit(); return !!k && k.hp > 0; };
  Battler.prototype.reset = function () {
    this.stages = [0, 0, 0, 0, 0, 0];
    this.vol = { conf: 0, flinch: false, guard: false, guardChain: 0, rootUsed: false, kindled: false };
  };
  Battler.prototype.ability = function () { var k = this.kit(); return k ? PK.stats.ability(k) : null; };
  Battler.prototype.has = function (a) { return this.alive() && this.ability() === a; };

  // ---------------- Side ----------------
  function Side(party, isPlayer, n) {
    this.party = party;
    this.isPlayer = isPlayer;
    this.slots = [];
    var used = [];
    for (var s = 0; s < n; s++) {
      var idx = -1;
      for (var i = 0; i < party.length; i++) if (party[i].hp > 0 && used.indexOf(i) < 0) { idx = i; break; }
      if (idx < 0) break;
      used.push(idx);
      this.slots.push(new Battler(this, s, idx));
    }
    if (!this.slots.length) this.slots.push(new Battler(this, 0, 0));
  }
  // singles convenience: the first slot
  Side.prototype.kit = function () { return this.slots[0].kit(); };
  Side.prototype.alive = function () { return this.party.filter(function (k) { return k.hp > 0; }).length; };
  Side.prototype.active = function () { return this.slots.filter(function (b) { return b.alive(); }); };
  Side.prototype.isActive = function (idx) { return this.slots.some(function (b) { return b.idx === idx; }); };
  Side.prototype.bench = function () {
    var self = this, out = [];
    this.party.forEach(function (k, i) { if (k.hp > 0 && !self.isActive(i)) out.push(i); });
    return out;
  };

  function parseEff(s) {
    if (!s) return [];
    var out = [];
    s.split(';').forEach(function (part) {
      if (!part) return;
      if (part.indexOf('self:') === 0 || part.indexOf('foe:') === 0) {
        var who = part.indexOf('self:') === 0 ? 'self' : 'foe';
        var rest = part.slice(who.length + 1), chance = 100;
        var at = rest.indexOf('@');
        if (at >= 0) { chance = +rest.slice(at + 1); rest = rest.slice(0, at); }
        var changes = rest.split(',').map(function (p) {
          var m = p.match(/^(atk|def|tec|res|spd)([+-]\d)$/);
          return { stat: STAT_IDX[m[1]], d: +m[2] };
        });
        out.push({ k: 'stat', who: who, changes: changes, chance: chance });
        return;
      }
      var bits = part.split(':');
      out.push({ k: bits[0], v: bits[1] });
    });
    return out;
  }

  function Battle(o) {
    this.wild = !!o.wild;
    this.double = !!o.double;
    this.trainer = o.trainer || null;
    this.trainer2 = o.trainer2 || null;
    var pn = this.double ? Math.min(2, o.playerParty.filter(function (k) { return k.hp > 0; }).length) : 1;
    this.p = new Side(o.playerParty, true, Math.max(1, pn));
    this.e = new Side(o.enemyParty, false, this.double ? 2 : 1);
    this.ai = o.ai != null ? o.ai : (this.wild ? 0 : 1);
    this.enemyItems = o.enemyItems || 0;
    this.fleeAttempts = 0;
    this.over = null;
    this.turn = 0;
    this.participants = {};
    this.markPart();
    this.canFlee = o.canFlee !== false && this.wild;
  }
  var B = Battle.prototype;

  B.all = function () { return this.p.slots.concat(this.e.slots); };
  B.byKey = function (key) { var all = this.all(); for (var i = 0; i < all.length; i++) if (all[i].key === key) return all[i]; return null; };
  B.foeSide = function (bt) { return bt.side === this.p ? this.e : this.p; };
  B.foesOf = function (bt) { return this.foeSide(bt).active(); };
  B.markPart = function () { var self = this; this.p.active().forEach(function (b) { self.participants[b.kit().uid] = true; }); };
  B.trainerName = function () { return this.trainer ? this.trainer.name : 'Foe'; };
  B.label = function (bt) {
    var n = PK.stats.name(bt.kit());
    if (bt.side.isPlayer) return n;
    return (this.wild ? 'Wild ' : 'Foe ') + n;
  };
  B.stat = function (bt, i) {
    var k = bt.kit(), v = k.stats[i], s = bt.stages[i], ab = bt.ability();
    v = v * (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
    if (i === 1 && k.status === 'brn' && ab !== 'grit') v *= 0.5;
    if (i === 1 && k.status && ab === 'grit') v *= 1.5;
    if (i === 5 && k.status === 'par' && ab !== 'nimble') v *= 0.5;
    if (i === 5 && k.status && ab === 'nimble') v *= 1.5;
    return Math.max(1, v);
  };

  B.actPriority = function (bt, act) {
    if (!act) return -99;
    if (act.type !== 'move') return 10;
    var k = bt.kit();
    var mv = k.moves[act.idx];
    var m = mv && mv.pp > 0 ? PK.MOVES[mv.id] : PK.MOVES.flailout;
    var pr = m.prio || 0;
    if (k.held === 'quickcharm' && Math.random() < 0.15) pr += 0.5;
    return pr;
  };

  // pActs / eActs: one action per active slot (a single action object is accepted for singles)
  B.runTurn = function (pActs, eActs) {
    var ev = [], self = this;
    if (!Array.isArray(pActs)) pActs = [pActs];
    if (!Array.isArray(eActs)) eActs = [eActs];
    this.turn++;
    this.markPart();
    var list = [];
    this.p.slots.forEach(function (bt, i) { if (pActs[i]) list.push({ bt: bt, a: pActs[i] }); });
    this.e.slots.forEach(function (bt, i) { if (eActs[i]) list.push({ bt: bt, a: eActs[i] }); });
    list.forEach(function (x) { x.pr = self.actPriority(x.bt, x.a); x.sp = x.bt.alive() ? self.stat(x.bt, 5) : 0; x.r = Math.random(); });
    list.sort(function (a, b) { return b.pr - a.pr || b.sp - a.sp || a.r - b.r; });
    for (var i = 0; i < list.length; i++) {
      if (this.over) break;
      var x = list[i];
      if (!x.bt.alive() && x.a.type !== 'item') continue;
      if (x.a.type === 'move' && !this.foesOf(x.bt).length) continue;
      this.exec(x.bt, x.a, ev, i === 0);
    }
    if (!this.over) this.endTurn(ev);
    this.all().forEach(function (b) { b.vol.flinch = false; b.vol.guard = false; });
    return ev;
  };

  B.exec = function (bt, act, ev) {
    var side = bt.side;
    if (act.type === 'switch') {
      var out = bt.kit();
      if (out && out.hp > 0 && bt.ability() === 'selfmend' && out.status) { out.status = null; out.sleep = 0; }
      ev.push({ t: 'withdraw', side: bt.key, text: side.isPlayer ? PK.stats.name(out) + ', come back!' : this.trainerName() + ' withdrew ' + PK.stats.name(out) + '!' });
      bt.idx = act.idx;
      bt.reset();
      if (side.isPlayer) this.markPart();
      ev.push({ t: 'send', side: bt.key, idx: act.idx, text: side.isPlayer ? 'Go! ' + PK.stats.name(bt.kit()) + '!' : this.trainerName() + ' sent out ' + PK.stats.name(bt.kit()) + '!' });
      this.entry(bt, ev);
      return;
    }
    if (act.type === 'item') return this.useItem(bt, act, ev);
    if (act.type === 'run') {
      this.fleeAttempts++;
      var foe = this.foesOf(bt)[0];
      var ok = act.force || bt.ability() === 'escapeartist' || !foe || this.stat(bt, 5) >= this.stat(foe, 5) || Math.random() < 0.35 + 0.2 * this.fleeAttempts;
      if (ok) { ev.push({ t: 'msg', text: 'Got away safely!' }); ev.push({ t: 'fled' }); this.over = 'fled'; }
      else ev.push({ t: 'msg', text: "Couldn't get away!" });
      return;
    }
    if (act.type === 'catch') return this.tryCatch(bt, act, ev);
    if (act.type === 'move') return this.useMove(bt, act.idx, act.target, ev);
  };

  // abilities that trigger when a Kit enters the field
  B.entry = function (bt, ev) {
    if (!bt.alive()) return ev || [];
    ev = ev || [];
    var self = this;
    if (bt.ability() === 'menace') {
      this.foesOf(bt).forEach(function (f) {
        ev.push({ t: 'msg', text: self.label(bt) + "'s Menace is intimidating!", auto: 40 });
        self.changeStats(f, [{ stat: 1, d: -1 }], ev, true);
      });
    }
    return ev;
  };

  B.useItem = function (bt, act, ev) {
    var side = bt.side, it = PK.ITEMS[act.item];
    var ti = act.target != null ? act.target : bt.idx;
    var k = side.party[ti];
    var who = side.isPlayer ? (PK.game && PK.game.state ? PK.game.state.player.name : 'You') : this.trainerName();
    ev.push({ t: 'msg', text: who + ' used ' + it.name + '!' });
    var holder = side.slots.filter(function (s) { return s.idx === ti; })[0];
    var sideKey = holder ? holder.key : null;
    if (it.use === 'heal' || it.use === 'full') {
      var amt = Math.min(k.stats[0] - k.hp, it.use === 'full' ? 9999 : it.value);
      k.hp += amt;
      if (it.use === 'full') { k.status = null; k.sleep = 0; if (holder) holder.vol.conf = 0; }
      if (sideKey) ev.push({ t: 'hp', side: sideKey, hp: k.hp });
      ev.push({ t: 'msg', text: PK.stats.name(k) + ' recovered ' + amt + ' HP!' });
    } else if (it.use === 'status') {
      k.status = null; k.sleep = 0;
      if (holder) { holder.vol.conf = 0; ev.push({ t: 'status', side: sideKey, status: null }); }
      ev.push({ t: 'msg', text: PK.stats.name(k) + ' is feeling fine!' });
    } else if (it.use === 'revive') {
      k.hp = Math.max(1, Math.floor(k.stats[0] * it.value / 100));
      k.status = null;
      ev.push({ t: 'msg', text: PK.stats.name(k) + ' was revived!' });
    } else if (it.use === 'pp') {
      k.moves.forEach(function (m) { m.pp = Math.min(PK.MOVES[m.id].pp, m.pp + it.value); });
      ev.push({ t: 'msg', text: PK.stats.name(k) + "'s charges were restored!" });
    } else if (it.use === 'escape') {
      ev.push({ t: 'msg', text: 'Got away safely!' }); ev.push({ t: 'fled' }); this.over = 'fled';
    }
  };

  B.catchChance = function (capsule) {
    var k = this.e.kit(), it = PK.ITEMS[capsule];
    if (it.value >= 255) return 1;
    var rate = PK.KITS[k.id].catchRate;
    var st = k.status === 'slp' || k.status === 'frz' ? 2 : k.status ? 1.5 : 1;
    var a = ((3 * k.stats[0] - 2 * k.hp) * rate * it.value) / (3 * k.stats[0]) * st;
    return Math.max(0.01, Math.min(1, a / 255));
  };

  B.tryCatch = function (bt, act, ev) {
    var p = act.chance != null ? act.chance : this.catchChance(act.item), ok = Math.random() < p;
    var shakes = 0;
    if (ok) shakes = 3;
    else { var q = Math.pow(p, 0.25); for (var i = 0; i < 3; i++) { if (Math.random() < q) shakes++; else break; } if (shakes >= 3) shakes = 2; }
    ev.push({ t: 'capsule', item: act.item, shakes: shakes, ok: ok, text: (PK.game && PK.game.state ? PK.game.state.player.name : 'You') + ' threw a ' + PK.ITEMS[act.item].name + '!' });
    if (ok) { this.over = 'caught'; }
    else ev.push({ t: 'msg', text: ['Oh no! It broke free!', 'Argh! Almost had it!', 'So close! It got out!'][Math.min(2, shakes)] });
  };

  B.inflict = function (target, st, ev, silentFail) {
    var k = target.kit();
    var name = this.label(target), ab = target.ability();
    if (!k || k.hp <= 0) return false;
    if ((st === 'conf' || st === 'flinch') && ab === 'unshakable') {
      if (!silentFail) ev.push({ t: 'msg', text: name + "'s Unshakable prevents it!" });
      return false;
    }
    if (st === 'conf') {
      if (target.vol.conf > 0) { if (!silentFail) ev.push({ t: 'msg', text: name + ' is already confused!' }); return false; }
      target.vol.conf = 2 + PK.rnd(3);
      ev.push({ t: 'fx', side: target.key, fx: 'conf' });
      ev.push({ t: 'msg', text: name + ' became confused!' });
      return true;
    }
    if (st === 'flinch') { target.vol.flinch = true; return true; }
    if (k.status) { if (!silentFail) ev.push({ t: 'msg', text: 'But it failed!' }); return false; }
    if ((st === 'slp' && ab === 'vigilant') || (st === 'psn' && ab === 'purity')) {
      if (!silentFail) ev.push({ t: 'msg', text: name + "'s " + PK.ABILITIES[ab].name + ' prevents it!' });
      return false;
    }
    var imm = PK.STATUS_IMMUNE[st];
    var types = PK.stats.types(k);
    if (imm && types.some(function (t) { return imm.indexOf(t) >= 0; })) {
      if (!silentFail) ev.push({ t: 'msg', text: "It doesn't affect " + name + '...' });
      return false;
    }
    k.status = st;
    if (st === 'slp') k.sleep = 1 + PK.rnd(3);
    ev.push({ t: 'status', side: target.key, status: st });
    var txt = { brn: ' was burned!', psn: ' was poisoned!', par: ' is paralyzed! It may be unable to move!', slp: ' fell asleep!', frz: ' was frozen solid!' }[st];
    ev.push({ t: 'msg', text: name + txt });
    return true;
  };

  B.changeStats = function (target, changes, ev, fromFoe) {
    var name = this.label(target), any = false;
    if (!target.alive()) return false;
    if (fromFoe && target.ability() === 'steadfast' && changes.some(function (c) { return c.d < 0; })) {
      ev.push({ t: 'msg', text: name + "'s Unbending keeps its stats from dropping!" });
      return false;
    }
    for (var i = 0; i < changes.length; i++) {
      var c = changes[i], cur = target.stages[c.stat];
      if ((c.d > 0 && cur >= 6) || (c.d < 0 && cur <= -6)) {
        ev.push({ t: 'msg', text: name + "'s " + STAT_NAME[c.stat] + (c.d > 0 ? " won't go any higher!" : " won't go any lower!") });
        continue;
      }
      target.stages[c.stat] = Math.max(-6, Math.min(6, cur + c.d));
      any = true;
      ev.push({ t: 'fx', side: target.key, fx: c.d > 0 ? 'up' : 'down' });
      var word = c.d >= 2 ? ' rose sharply!' : c.d > 0 ? ' rose!' : c.d <= -2 ? ' fell sharply!' : ' fell!';
      ev.push({ t: 'msg', text: name + "'s " + STAT_NAME[c.stat] + word });
    }
    return any;
  };

  B.effectiveness = function (m, target) {
    if (m.type === 'Terra' && target.ability() === 'hover') return 0;
    return PK.typeEff(m.type, PK.stats.types(target.kit()));
  };

  B.damage = function (bt, tg, m, crit, spread) {
    var k = bt.kit(), t = tg.kit(), ab = bt.ability(), tab = tg.ability();
    var L = k.level;
    var physical = m.cat === 'P';
    var ai = physical ? 1 : 3, di = physical ? 2 : 4;
    var A = this.stat(bt, ai), D = this.stat(tg, di);
    if (crit) {
      // crits ignore the attacker's drops and the defender's boosts
      A = Math.max(A, k.stats[ai] * (physical && k.status === 'brn' && ab !== 'grit' ? 0.5 : 1));
      D = Math.min(D, t.stats[di]);
    }
    var base = Math.floor(Math.floor(Math.floor(2 * L / 5 + 2) * m.power * A / D) / 50) + 2;
    var own = PK.stats.types(k).indexOf(m.type) >= 0;
    var stab = own ? (ab === 'specialist' ? 2 : 1.5) : 1;
    var eff = this.effectiveness(m, tg);
    var mod = stab * eff * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15);
    if (PINCH[ab] === m.type && k.hp <= k.stats[0] / 3) mod *= 1.5;
    if (ab === 'kindling' && bt.vol.kindled && m.type === 'Blaze') mod *= 1.5;
    if (tab === 'insulated' && (m.type === 'Blaze' || m.type === 'Frost')) mod *= 0.5;
    if (spread) mod *= 0.75;
    if (k.held === 'powerband') mod *= 1.1;
    return { dmg: eff === 0 ? 0 : Math.max(1, Math.floor(base * mod)), eff: eff };
  };

  B.preMoveChecks = function (bt, ev) {
    var k = bt.kit(), name = this.label(bt), key = bt.key;
    if (k.status === 'slp') {
      k.sleep--;
      if (k.sleep <= 0) { k.status = null; ev.push({ t: 'status', side: key, status: null }); ev.push({ t: 'msg', text: name + ' woke up!' }); }
      else { ev.push({ t: 'fx', side: key, fx: 'slp' }); ev.push({ t: 'msg', text: name + ' is fast asleep.' }); return false; }
    }
    if (k.status === 'frz') {
      if (Math.random() < 0.2) { k.status = null; ev.push({ t: 'status', side: key, status: null }); ev.push({ t: 'msg', text: name + ' thawed out!' }); }
      else { ev.push({ t: 'msg', text: name + ' is frozen solid!' }); return false; }
    }
    if (bt.vol.flinch) { ev.push({ t: 'msg', text: name + ' flinched!' }); return false; }
    if (k.status === 'par' && Math.random() < 0.25) {
      ev.push({ t: 'fx', side: key, fx: 'par' });
      ev.push({ t: 'msg', text: name + " is paralyzed! It can't move!" });
      return false;
    }
    if (bt.vol.conf > 0) {
      bt.vol.conf--;
      if (bt.vol.conf <= 0) ev.push({ t: 'msg', text: name + ' snapped out of confusion!' });
      else {
        ev.push({ t: 'fx', side: key, fx: 'conf' });
        ev.push({ t: 'msg', text: name + ' is confused!' });
        if (Math.random() < 0.33) {
          var A = this.stat(bt, 1), D = this.stat(bt, 2);
          var dmg = Math.max(1, Math.floor((Math.floor(Math.floor(2 * k.level / 5 + 2) * 40 * A / D) / 50 + 2)));
          k.hp = Math.max(0, k.hp - dmg);
          ev.push({ t: 'dmg', side: key, hp: k.hp, amount: dmg, eff: 1 });
          ev.push({ t: 'msg', text: 'It hurt itself in its confusion!' });
          if (k.hp <= 0) this.faint(bt, ev);
          return false;
        }
      }
    }
    return true;
  };

  // pick the target battlers of a move
  B.targetsFor = function (bt, m, effs, targetKey) {
    var e = effs[0] || {};
    var hitsFoe = m.cat !== 'S' || e.who === 'foe' || INFLICT.indexOf(e.k) >= 0;
    if (!hitsFoe) return { foe: false, list: [bt] };
    var foes = this.foesOf(bt);
    if (!foes.length) return { foe: true, list: [] };
    if (effs.some(function (x) { return x.k === 'spread'; }) && foes.length > 1) return { foe: true, list: foes, spread: true };
    var t = foes.filter(function (f) { return f.key === targetKey; })[0] || foes[PK.rnd(foes.length)];
    return { foe: true, list: [t] };
  };

  B.useMove = function (bt, idx, targetKey, ev) {
    var k = bt.kit();
    var slot = k.moves[idx];
    var m;
    if (!slot || slot.pp <= 0) {
      if (k.moves.every(function (x) { return x.pp <= 0; })) {
        ev.push({ t: 'msg', text: this.label(bt) + ' has no charges left!' });
        m = PK.MOVES.flailout;
      } else m = PK.MOVES[k.moves.filter(function (x) { return x.pp > 0; })[0].id];
    } else m = PK.MOVES[slot.id];
    if (!this.preMoveChecks(bt, ev)) { bt.vol.guardChain = 0; return; }
    var effs = parseEff(m.eff);
    var tg = this.targetsFor(bt, m, effs, targetKey);
    if (slot && slot.pp > 0 && m.id === slot.id) {
      slot.pp--;
      if (tg.foe && tg.list.some(function (t) { return t.ability() === 'imposing'; })) slot.pp = Math.max(0, slot.pp - 1);
    }
    ev.push({ t: 'msg', text: this.label(bt) + ' used ' + m.name + '!' });
    if (!tg.list.length) { ev.push({ t: 'msg', text: 'But there was no target...' }); return; }
    var name = this.label(bt), acc = m.acc ? Math.min(100, m.acc * (bt.ability() === 'sharpshot' ? 1.3 : 1)) : 0;

    if (m.cat === 'S') {
      var e = effs[0] || {}, target = tg.list[0];
      if (tg.foe && target.vol.guard) { ev.push({ t: 'msg', text: this.label(target) + ' protected itself!' }); bt.vol.guardChain = 0; return; }
      if (tg.foe && acc && Math.random() * 100 >= acc) { ev.push({ t: 'msg', text: name + "'s move missed!" }); bt.vol.guardChain = 0; return; }
      ev.push({ t: 'anim', side: bt.key, move: m.id, target: target.key });
      if (e.k === 'stat') this.changeStats(e.who === 'self' ? bt : target, e.changes, ev, e.who !== 'self');
      else if (e.k === 'heal') {
        if (k.hp >= k.stats[0]) { ev.push({ t: 'msg', text: 'But it failed!' }); }
        else {
          k.hp = Math.min(k.stats[0], k.hp + Math.floor(k.stats[0] * (+e.v) / 100));
          ev.push({ t: 'heal', side: bt.key, hp: k.hp });
          ev.push({ t: 'msg', text: name + ' regained health!' });
        }
      } else if (e.k === 'rest') {
        if (k.hp >= k.stats[0] || bt.ability() === 'vigilant') ev.push({ t: 'msg', text: 'But it failed!' });
        else {
          k.hp = k.stats[0]; k.status = 'slp'; k.sleep = 3;
          ev.push({ t: 'heal', side: bt.key, hp: k.hp });
          ev.push({ t: 'status', side: bt.key, status: 'slp' });
          ev.push({ t: 'msg', text: name + ' fell asleep and became healthy!' });
        }
      } else if (e.k === 'guard') {
        if (bt.vol.guardChain > 0 && Math.random() < 0.5) { ev.push({ t: 'msg', text: 'But it failed!' }); bt.vol.guardChain = 0; }
        else { bt.vol.guard = true; bt.vol.guardChain++; ev.push({ t: 'msg', text: name + ' braced itself!' }); }
        return;
      } else if (e.k === 'clear') {
        this.all().forEach(function (x) { x.stages = [0, 0, 0, 0, 0, 0]; });
        ev.push({ t: 'msg', text: 'All stat changes were reset!' });
      } else if (e.k) this.inflict(target, e.k, ev);
      bt.vol.guardChain = 0;
      return;
    }
    bt.vol.guardChain = 0;
    var hits = 1;
    effs.forEach(function (x) {
      if (x.k === 'multi') {
        var r = x.v.split('-').map(Number);
        hits = r[0] === r[1] ? r[0] : [2, 2, 3, 3, 4, 5][PK.rnd(6)];
        hits = Math.min(Math.max(hits, r[0]), r[1]);
      }
    });
    var total = 0, self = this, animDone = false;
    for (var ti = 0; ti < tg.list.length; ti++) {
      var tb = tg.list[ti], t = tb.kit(), tname = this.label(tb);
      if (!t || t.hp <= 0) continue;
      if (tb.vol.guard) { ev.push({ t: 'msg', text: tname + ' protected itself!' }); continue; }
      if (acc && Math.random() * 100 >= acc) { ev.push({ t: 'msg', text: tg.list.length > 1 ? tname + ' avoided the attack!' : name + "'s attack missed!" }); continue; }
      var absorbType = ABSORB[tb.ability()];
      if (absorbType && absorbType === m.type) {
        if (!animDone) { ev.push({ t: 'anim', side: bt.key, move: m.id, target: tb.key }); animDone = true; }
        var abName = PK.ABILITIES[tb.ability()].name;
        if (tb.ability() === 'kindling') { tb.vol.kindled = true; ev.push({ t: 'msg', text: tname + "'s " + abName + ' powered up its Blaze moves!' }); }
        else if (t.hp < t.stats[0]) {
          t.hp = Math.min(t.stats[0], t.hp + Math.floor(t.stats[0] / 4));
          ev.push({ t: 'heal', side: tb.key, hp: t.hp });
          ev.push({ t: 'msg', text: tname + "'s " + abName + ' restored its HP!' });
        } else ev.push({ t: 'msg', text: tname + "'s " + abName + ' made the move useless!' });
        continue;
      }
      if (!animDone) { ev.push({ t: 'anim', side: bt.key, move: m.id, target: tb.key }); animDone = true; }
      var landed = 0, lastEff = 1, dealt = 0;
      var critRate = (effs.some(function (x) { return x.k === 'crit'; }) ? 1 / 8 : 1 / 16) * (bt.ability() === 'keenedge' ? 2 : 1);
      for (var h = 0; h < hits; h++) {
        if (t.hp <= 0) break;
        var crit = Math.random() < critRate;
        var d = this.damage(bt, tb, m, crit, tg.spread);
        lastEff = d.eff;
        if (d.eff === 0) break;
        var full = t.hp === t.stats[0];
        var dmg = Math.min(t.hp, d.dmg);
        if (full && dmg >= t.hp && tb.ability() === 'bedrock' && hits === 1) {
          dmg = t.hp - 1;
          ev.push({ t: 'dmg', side: tb.key, hp: t.hp - dmg, amount: dmg, eff: d.eff, crit: crit });
          t.hp -= dmg;
          ev.push({ t: 'msg', text: tname + ' held on thanks to Bedrock!' });
        } else {
          t.hp -= dmg;
          ev.push({ t: 'dmg', side: tb.key, hp: t.hp, amount: dmg, eff: d.eff, crit: crit });
        }
        dealt += dmg; landed++;
        if (crit) ev.push({ t: 'msg', text: 'A critical hit!', auto: 40 });
      }
      total += dealt;
      if (lastEff === 0) { ev.push({ t: 'msg', text: "It doesn't affect " + tname + '...' }); continue; }
      if (lastEff > 1) ev.push({ t: 'msg', text: tg.list.length > 1 ? "It's super effective on " + tname + '!' : "It's super effective!", auto: 45 });
      else if (lastEff < 1) ev.push({ t: 'msg', text: tg.list.length > 1 ? "It's not very effective on " + tname + '...' : "It's not very effective...", auto: 45 });
      if (hits > 1) ev.push({ t: 'msg', text: 'Hit ' + landed + ' time' + (landed > 1 ? 's' : '') + '!' });
      // secondary effects on this target
      for (var i = 0; i < effs.length; i++) {
        var x = effs[i];
        if (t.hp > 0 && ['brn', 'psn', 'par', 'slp', 'frz', 'conf', 'flinch'].indexOf(x.k) >= 0) {
          if (Math.random() * 100 < +x.v) this.inflict(tb, x.k, ev, true);
        } else if (x.k === 'stat' && x.who === 'foe' && t.hp > 0 && Math.random() * 100 < x.chance) this.changeStats(tb, x.changes, ev, true);
      }
      // contact abilities
      if (m.cat === 'P' && dealt > 0 && k.hp > 0) {
        var ta = tb.ability();
        var contact = { sparkskin: 'par', emberhide: 'brn', toxicbarbs: 'psn' }[ta];
        if (contact && Math.random() < 0.3 && !k.status) {
          ev.push({ t: 'msg', text: tname + "'s " + PK.ABILITIES[ta].name + ' affected ' + name + '!' });
          this.inflict(bt, contact, ev, true);
        }
        if (ta === 'thornhide') {
          var th = Math.max(1, Math.floor(k.stats[0] / 16));
          k.hp = Math.max(0, k.hp - th);
          ev.push({ t: 'dmg', side: bt.key, hp: k.hp, amount: th, eff: 1, quiet: true });
          ev.push({ t: 'msg', text: name + ' was hurt by ' + tname + "'s Thornhide!" });
        }
      }
      if (t.hp <= 0) this.faint(tb, ev);
    }
    // effects on the user
    for (var j = 0; j < effs.length; j++) {
      var y = effs[j];
      if (y.k === 'recoil' && total > 0 && k.hp > 0 && bt.ability() !== 'ironskull') {
        var rc = Math.max(1, Math.floor(total * (+y.v) / 100));
        k.hp = Math.max(0, k.hp - rc);
        ev.push({ t: 'dmg', side: bt.key, hp: k.hp, amount: rc, eff: 1, quiet: true });
        ev.push({ t: 'msg', text: name + ' is hit with recoil!' });
      } else if (y.k === 'drain' && total > 0 && k.hp > 0) {
        var hl = Math.max(1, Math.floor(total * (+y.v) / 100));
        k.hp = Math.min(k.stats[0], k.hp + hl);
        ev.push({ t: 'heal', side: bt.key, hp: k.hp });
        ev.push({ t: 'msg', text: name + ' drained some energy!' });
      } else if (y.k === 'stat' && y.who === 'self' && total > 0 && k.hp > 0 && Math.random() * 100 < y.chance) this.changeStats(bt, y.changes, ev);
    }
    if (k.hp <= 0 && bt.kit().hp <= 0 && !ev.some(function (x) { return x.t === 'faint' && x.side === bt.key; })) this.faint(bt, ev);
    tg.list.forEach(function (x) { if (x.alive()) self.checkRoot(x, ev); });
    if (k.hp > 0) this.checkRoot(bt, ev);
  };

  B.checkRoot = function (bt, ev) {
    var k = bt.kit();
    if (k && k.held === 'healroot' && !bt.vol.rootUsed && k.hp > 0 && k.hp < k.stats[0] / 2) {
      bt.vol.rootUsed = true;
      k.held = null;
      k.hp = Math.min(k.stats[0], k.hp + Math.floor(k.stats[0] / 4));
      ev.push({ t: 'heal', side: bt.key, hp: k.hp });
      ev.push({ t: 'msg', text: this.label(bt) + ' ate its Healroot!' });
    }
  };

  B.faint = function (bt, ev) {
    bt.kit().hp = 0;
    bt.kit().status = null;
    ev.push({ t: 'faint', side: bt.key });
    ev.push({ t: 'msg', text: this.label(bt) + ' fainted!' });
  };

  B.endTurn = function (ev) {
    var self = this;
    this.all().forEach(function (bt) {
      var k = bt.kit();
      if (!k || k.hp <= 0) return;
      if (k.status === 'brn' || k.status === 'psn') {
        var d = Math.max(1, Math.floor(k.stats[0] / (k.status === 'brn' ? 16 : 8)));
        k.hp = Math.max(0, k.hp - d);
        ev.push({ t: 'fx', side: bt.key, fx: k.status });
        ev.push({ t: 'dmg', side: bt.key, hp: k.hp, amount: d, eff: 1, quiet: true });
        ev.push({ t: 'msg', text: self.label(bt) + (k.status === 'brn' ? ' is hurt by its burn!' : ' is hurt by poison!') });
        if (k.hp <= 0) { self.faint(bt, ev); return; }
        self.checkRoot(bt, ev);
      }
      var ab = bt.ability();
      if (ab === 'regrowth' && k.hp < k.stats[0]) {
        k.hp = Math.min(k.stats[0], k.hp + Math.max(1, Math.floor(k.stats[0] / 16)));
        ev.push({ t: 'heal', side: bt.key, hp: k.hp });
        ev.push({ t: 'msg', text: self.label(bt) + ' restored a little HP with Regrowth!', auto: 45 });
      }
      if (ab === 'momentum' && bt.stages[5] < 6) {
        ev.push({ t: 'msg', text: self.label(bt) + "'s Momentum builds!", auto: 30 });
        self.changeStats(bt, [{ stat: 5, d: 1 }], ev);
      }
    });
  };

  // ---------------- AI ----------------
  B.estimate = function (bt, tg, m) {
    if (m.cat === 'S') return 0;
    var k = bt.kit();
    var physical = m.cat === 'P';
    var A = this.stat(bt, physical ? 1 : 3), D = this.stat(tg, physical ? 2 : 4);
    var base = (Math.floor(2 * k.level / 5 + 2) * m.power * A / D) / 50 + 2;
    var stab = PK.stats.types(k).indexOf(m.type) >= 0 ? (bt.ability() === 'specialist' ? 2 : 1.5) : 1;
    var eff = this.effectiveness(m, tg);
    if (ABSORB[tg.ability()] === m.type) eff = 0;
    var hits = /multi:2-5/.test(m.eff) ? 3 : /multi:2-2/.test(m.eff) ? 2 : 1;
    return base * stab * eff * 0.92 * hits * (m.acc ? m.acc / 100 : 1);
  };

  // choose an action for any battler; level 0 random, 1 decent, 2 smart
  B.chooseFor = function (bt, level, items) {
    var k = bt.kit(), self = this;
    var foes = this.foesOf(bt);
    var usable = [];
    k.moves.forEach(function (mv, i) { if (mv.pp > 0) usable.push(i); });
    if (!usable.length || !foes.length) return { type: 'move', idx: 0, target: foes[0] && foes[0].key };
    if (level === 0) return { type: 'move', idx: PK.pick(usable), target: PK.pick(foes).key };
    if (level >= 2 && items && this.enemyItems > 0 && k.hp > 0 && k.hp < k.stats[0] * 0.28 && Math.random() < 0.8) {
      this.enemyItems--;
      return { type: 'item', item: k.level >= 40 ? 'megatonic' : 'hitonic' };
    }
    var best = null;
    usable.forEach(function (i) {
      var m = PK.MOVES[k.moves[i].id];
      foes.forEach(function (f) {
        var s;
        if (m.cat !== 'S') {
          s = self.estimate(bt, f, m);
          if (/spread/.test(m.eff || '') && foes.length > 1) s *= 1.5;
          if (s >= f.kit().hp) s += 60 + (m.prio > 0 ? 40 : 0);
        } else {
          var e = parseEff(m.eff)[0] || {};
          s = 0;
          if (e.k === 'heal' || e.k === 'rest') s = k.hp < k.stats[0] * 0.4 ? 120 : 0;
          else if (e.k === 'stat' && e.who === 'self') s = k.hp > k.stats[0] * 0.6 && bt.stages[e.changes[0].stat] < 2 ? 35 : 0;
          else if (e.k === 'stat' && e.who === 'foe') s = f.stages[e.changes[0].stat] > -2 && f.ability() !== 'steadfast' ? 22 : 0;
          else if (e.k === 'guard') s = 8;
          else if (['brn', 'psn', 'par', 'slp', 'frz'].indexOf(e.k) >= 0) s = f.kit().status ? 0 : 45;
          else if (e.k === 'conf') s = f.vol.conf || f.ability() === 'unshakable' ? 0 : 25;
          if (self.turn > 6) s *= 0.5;
        }
        s *= 0.85 + Math.random() * (level >= 2 ? 0.2 : 0.4);
        if (!best || s > best.s) best = { s: s, i: i, t: f.key };
      });
    });
    if (level === 1 && Math.random() < 0.2) return { type: 'move', idx: PK.pick(usable), target: PK.pick(foes).key };
    return { type: 'move', idx: best.i, target: best.t };
  };
  // enemy AI: one action per enemy slot (singles: returns a single action)
  B.chooseAI = function (bt) {
    if (bt) return this.chooseFor(bt, this.ai, true);
    var self = this;
    var acts = this.e.slots.map(function (b) { return b.alive() ? self.chooseFor(b, self.ai, true) : null; });
    return this.double ? acts : acts[0];
  };

  // choose the next enemy Kit for a slot after a faint (-1 if none left on the bench)
  B.nextEnemy = function () {
    var self = this, best = -1, bestScore = -1e9;
    var pt = this.p.active().length ? PK.stats.types(this.p.active()[0].kit()) : [];
    this.e.bench().forEach(function (i) {
      var k = self.e.party[i], sc;
      if (self.ai >= 2 && pt.length) {
        sc = 0;
        PK.stats.types(k).forEach(function (t) { sc += PK.typeEff(t, pt) * 10; });
        pt.forEach(function (t) { sc -= PK.typeEff(t, PK.stats.types(k)) * 6; });
      } else sc = -i;
      if (sc > bestScore) { bestScore = sc; best = i; }
    });
    return best;
  };
  // put party member idx into a battler slot; returns entry events
  B.sendIn = function (bt, idx) {
    bt.idx = idx;
    bt.reset();
    if (bt.side.isPlayer) this.markPart();
    return this.entry(bt, []);
  };

  B.expFor = function (defeated, k, participated) {
    var sp = PK.KITS[defeated.id];
    var v = sp.exp * defeated.level / 2.8 * (this.wild ? 1 : 1.5) * (participated ? 1 : 0.5);
    if (k.held === 'luckyclover') v *= 1.5;
    return Math.max(1, Math.floor(v));
  };

  PK.Battle = Battle;
  PK.battleUtil = { parseEff: parseEff, STAT_NAME: STAT_NAME, ST_NAME: ST_NAME };
})();

// Turn-based battle rules. Pure logic: produces an event list the battle scene plays back.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var STAT_IDX = { atk: 1, def: 2, tec: 3, res: 4, spd: 5 };
  var STAT_NAME = { 1: 'ATK', 2: 'DEF', 3: 'TEC', 4: 'RES', 5: 'SPD' };
  var ST_NAME = { brn: 'BRN', psn: 'PSN', par: 'PAR', slp: 'SLP', frz: 'FRZ' };

  function Side(party, isPlayer) {
    this.party = party;
    this.isPlayer = isPlayer;
    this.idx = 0;
    for (var i = 0; i < party.length; i++) if (party[i].hp > 0) { this.idx = i; break; }
    this.reset();
  }
  Side.prototype.kit = function () { return this.party[this.idx]; };
  Side.prototype.reset = function () {
    this.stages = [0, 0, 0, 0, 0, 0];
    this.vol = { conf: 0, flinch: false, guard: false, guardChain: 0, rootUsed: false };
  };
  Side.prototype.alive = function () { return this.party.filter(function (k) { return k.hp > 0; }).length; };

  function parseEff(s) {
    if (!s) return [];
    if (s.indexOf('self:') === 0 || s.indexOf('foe:') === 0) {
      var who = s.indexOf('self:') === 0 ? 'self' : 'foe';
      var rest = s.slice(who.length + 1), chance = 100;
      var at = rest.indexOf('@');
      if (at >= 0) { chance = +rest.slice(at + 1); rest = rest.slice(0, at); }
      var changes = rest.split(',').map(function (p) {
        var m = p.match(/^(atk|def|tec|res|spd)([+-]\d)$/);
        return { stat: STAT_IDX[m[1]], d: +m[2] };
      });
      return [{ k: 'stat', who: who, changes: changes, chance: chance }];
    }
    var parts = s.split(':');
    return [{ k: parts[0], v: parts[1] }];
  }

  function Battle(o) {
    this.wild = !!o.wild;
    this.trainer = o.trainer || null;
    this.p = new Side(o.playerParty, true);
    this.e = new Side(o.enemyParty, false);
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

  B.markPart = function () { this.participants[this.p.kit().uid] = true; };
  B.label = function (side) {
    var n = PK.stats.name(side.kit());
    if (side.isPlayer) return n;
    return (this.wild ? 'Wild ' : 'Foe ') + n;
  };
  B.stat = function (side, i) {
    var k = side.kit(), v = k.stats[i], s = side.stages[i];
    v = v * (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
    if (i === 1 && k.status === 'brn') v *= 0.5;
    if (i === 5 && k.status === 'par') v *= 0.5;
    return Math.max(1, v);
  };
  B.other = function (side) { return side === this.p ? this.e : this.p; };

  B.actPriority = function (side, act) {
    if (!act) return -99;
    if (act.type !== 'move') return 10;
    var k = side.kit();
    var mv = k.moves[act.idx];
    var m = mv && mv.pp > 0 ? PK.MOVES[mv.id] : PK.MOVES.flailout;
    var pr = m.prio || 0;
    if (k.held === 'quickcharm' && Math.random() < 0.15) pr += 0.5;
    return pr;
  };

  B.runTurn = function (pAct, eAct) {
    var ev = [], self = this;
    this.turn++;
    var list = [{ s: this.p, a: pAct }, { s: this.e, a: eAct }];
    list.forEach(function (x) { x.pr = self.actPriority(x.s, x.a); x.sp = self.stat(x.s, 5); x.r = Math.random(); });
    list.sort(function (a, b) { return b.pr - a.pr || b.sp - a.sp || a.r - b.r; });
    for (var i = 0; i < list.length; i++) {
      if (this.over) break;
      var x = list[i];
      if (!x.a) continue;
      if (x.a.type === 'move') {
        if (x.s.kit().hp <= 0) continue;
        if (this.other(x.s).kit().hp <= 0) continue;
      }
      this.exec(x.s, x.a, ev, i === 0);
    }
    if (!this.over) this.endTurn(ev);
    this.p.vol.flinch = this.e.vol.flinch = false;
    this.p.vol.guard = this.e.vol.guard = false;
    return ev;
  };

  B.exec = function (side, act, ev, first) {
    var foe = this.other(side);
    if (act.type === 'switch') {
      ev.push({ t: 'withdraw', side: side.isPlayer ? 'p' : 'e', text: side.isPlayer ? PK.stats.name(side.kit()) + ', come back!' : (this.trainer ? this.trainer.name : 'Foe') + ' withdrew ' + PK.stats.name(side.kit()) + '!' });
      side.idx = act.idx;
      side.reset();
      if (side.isPlayer) this.markPart();
      ev.push({ t: 'send', side: side.isPlayer ? 'p' : 'e', idx: act.idx, text: side.isPlayer ? 'Go! ' + PK.stats.name(side.kit()) + '!' : (this.trainer ? this.trainer.name : 'Foe') + ' sent out ' + PK.stats.name(side.kit()) + '!' });
      return;
    }
    if (act.type === 'item') return this.useItem(side, act, ev);
    if (act.type === 'run') {
      this.fleeAttempts++;
      var ok = act.force || this.stat(side, 5) >= this.stat(foe, 5) || Math.random() < 0.35 + 0.2 * this.fleeAttempts;
      if (ok) { ev.push({ t: 'msg', text: 'Got away safely!' }); ev.push({ t: 'fled' }); this.over = 'fled'; }
      else ev.push({ t: 'msg', text: "Couldn't get away!" });
      return;
    }
    if (act.type === 'catch') return this.tryCatch(side, act, ev);
    if (act.type === 'move') return this.useMove(side, foe, act.idx, ev, first);
  };

  B.useItem = function (side, act, ev) {
    var it = PK.ITEMS[act.item];
    var k = side.party[act.target != null ? act.target : side.idx];
    var who = side.isPlayer ? (PK.game ? PK.game.state.player.name : 'You') : (this.trainer ? this.trainer.name : 'Foe');
    ev.push({ t: 'msg', text: who + ' used ' + it.name + '!' });
    var isActive = k === side.kit();
    var sideKey = side.isPlayer ? 'p' : 'e';
    if (it.use === 'heal' || it.use === 'full') {
      var amt = Math.min(k.stats[0] - k.hp, it.use === 'full' ? 9999 : it.value);
      k.hp += amt;
      if (it.use === 'full') { k.status = null; k.sleep = 0; if (isActive) side.vol.conf = 0; }
      if (isActive) ev.push({ t: 'hp', side: sideKey, hp: k.hp });
      ev.push({ t: 'msg', text: PK.stats.name(k) + ' recovered ' + amt + ' HP!' });
    } else if (it.use === 'status') {
      k.status = null; k.sleep = 0;
      if (isActive) { side.vol.conf = 0; ev.push({ t: 'status', side: sideKey, status: null }); }
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

  B.tryCatch = function (side, act, ev) {
    var p = this.catchChance(act.item), ok = Math.random() < p;
    var shakes = 0;
    if (ok) shakes = 3;
    else { var q = Math.pow(p, 0.25); for (var i = 0; i < 3; i++) { if (Math.random() < q) shakes++; else break; } if (shakes >= 3) shakes = 2; }
    ev.push({ t: 'capsule', item: act.item, shakes: shakes, ok: ok, text: (PK.game ? PK.game.state.player.name : 'You') + ' threw a ' + PK.ITEMS[act.item].name + '!' });
    if (ok) { this.over = 'caught'; }
    else ev.push({ t: 'msg', text: ['Oh no! It broke free!', 'Argh! Almost had it!', 'So close! It got out!'][Math.min(2, shakes)] });
  };

  B.inflict = function (target, st, ev, silentFail) {
    var k = target.kit();
    var sideKey = target.isPlayer ? 'p' : 'e';
    var name = this.label(target);
    if (st === 'conf') {
      if (target.vol.conf > 0) { if (!silentFail) ev.push({ t: 'msg', text: name + ' is already confused!' }); return false; }
      target.vol.conf = 2 + PK.rnd(3);
      ev.push({ t: 'fx', side: sideKey, fx: 'conf' });
      ev.push({ t: 'msg', text: name + ' became confused!' });
      return true;
    }
    if (st === 'flinch') { target.vol.flinch = true; return true; }
    if (k.status) { if (!silentFail) ev.push({ t: 'msg', text: 'But it failed!' }); return false; }
    var imm = PK.STATUS_IMMUNE[st];
    var types = PK.stats.types(k);
    if (imm && types.some(function (t) { return imm.indexOf(t) >= 0; })) {
      if (!silentFail) ev.push({ t: 'msg', text: "It doesn't affect " + name + '...' });
      return false;
    }
    k.status = st;
    if (st === 'slp') k.sleep = 1 + PK.rnd(3);
    ev.push({ t: 'status', side: sideKey, status: st });
    var txt = { brn: ' was burned!', psn: ' was poisoned!', par: ' is paralyzed! It may be unable to move!', slp: ' fell asleep!', frz: ' was frozen solid!' }[st];
    ev.push({ t: 'msg', text: name + txt });
    return true;
  };

  B.changeStats = function (target, changes, ev, fromFoe) {
    var name = this.label(target), any = false;
    var sideKey = target.isPlayer ? 'p' : 'e';
    for (var i = 0; i < changes.length; i++) {
      var c = changes[i], cur = target.stages[c.stat];
      if ((c.d > 0 && cur >= 6) || (c.d < 0 && cur <= -6)) {
        ev.push({ t: 'msg', text: name + "'s " + STAT_NAME[c.stat] + (c.d > 0 ? " won't go any higher!" : " won't go any lower!") });
        continue;
      }
      target.stages[c.stat] = Math.max(-6, Math.min(6, cur + c.d));
      any = true;
      ev.push({ t: 'fx', side: sideKey, fx: c.d > 0 ? 'up' : 'down' });
      var word = c.d >= 2 ? ' rose sharply!' : c.d > 0 ? ' rose!' : c.d <= -2 ? ' fell sharply!' : ' fell!';
      ev.push({ t: 'msg', text: name + "'s " + STAT_NAME[c.stat] + word });
    }
    void fromFoe;
    return any;
  };

  B.damage = function (side, foe, m, crit) {
    var k = side.kit(), t = foe.kit();
    var L = k.level;
    var physical = m.cat === 'P';
    var ai = physical ? 1 : 3, di = physical ? 2 : 4;
    var A = this.stat(side, ai), D = this.stat(foe, di);
    if (crit) {
      // crits ignore the attacker's drops and the defender's boosts
      A = Math.max(A, k.stats[ai] * (physical && k.status === 'brn' ? 0.5 : 1));
      D = Math.min(D, t.stats[di]);
    }
    var base = Math.floor(Math.floor(Math.floor(2 * L / 5 + 2) * m.power * A / D) / 50) + 2;
    var stab = PK.stats.types(k).indexOf(m.type) >= 0 ? 1.5 : 1;
    var eff = PK.typeEff(m.type, PK.stats.types(t));
    var mod = stab * eff * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15);
    if (k.held === 'powerband') mod *= 1.1;
    return { dmg: eff === 0 ? 0 : Math.max(1, Math.floor(base * mod)), eff: eff };
  };

  B.preMoveChecks = function (side, ev) {
    var k = side.kit(), name = this.label(side), sideKey = side.isPlayer ? 'p' : 'e';
    if (k.status === 'slp') {
      k.sleep--;
      if (k.sleep <= 0) { k.status = null; ev.push({ t: 'status', side: sideKey, status: null }); ev.push({ t: 'msg', text: name + ' woke up!' }); }
      else { ev.push({ t: 'fx', side: sideKey, fx: 'slp' }); ev.push({ t: 'msg', text: name + ' is fast asleep.' }); return false; }
    }
    if (k.status === 'frz') {
      if (Math.random() < 0.2) { k.status = null; ev.push({ t: 'status', side: sideKey, status: null }); ev.push({ t: 'msg', text: name + ' thawed out!' }); }
      else { ev.push({ t: 'msg', text: name + ' is frozen solid!' }); return false; }
    }
    if (side.vol.flinch) { ev.push({ t: 'msg', text: name + ' flinched!' }); return false; }
    if (k.status === 'par' && Math.random() < 0.25) {
      ev.push({ t: 'fx', side: sideKey, fx: 'par' });
      ev.push({ t: 'msg', text: name + " is paralyzed! It can't move!" });
      return false;
    }
    if (side.vol.conf > 0) {
      side.vol.conf--;
      if (side.vol.conf <= 0) ev.push({ t: 'msg', text: name + ' snapped out of confusion!' });
      else {
        ev.push({ t: 'fx', side: sideKey, fx: 'conf' });
        ev.push({ t: 'msg', text: name + ' is confused!' });
        if (Math.random() < 0.33) {
          var A = this.stat(side, 1), D = this.stat(side, 2);
          var dmg = Math.max(1, Math.floor((Math.floor(Math.floor(2 * k.level / 5 + 2) * 40 * A / D) / 50 + 2)));
          k.hp = Math.max(0, k.hp - dmg);
          ev.push({ t: 'dmg', side: sideKey, hp: k.hp, amount: dmg, eff: 1 });
          ev.push({ t: 'msg', text: 'It hurt itself in its confusion!' });
          if (k.hp <= 0) this.faint(side, ev);
          return false;
        }
      }
    }
    return true;
  };

  B.useMove = function (side, foe, idx, ev) {
    var k = side.kit(), t = foe.kit();
    var sideKey = side.isPlayer ? 'p' : 'e', foeKey = foe.isPlayer ? 'p' : 'e';
    var slot = k.moves[idx];
    var m;
    if (!slot || slot.pp <= 0) {
      if (k.moves.every(function (x) { return x.pp <= 0; })) {
        ev.push({ t: 'msg', text: this.label(side) + ' has no charges left!' });
        m = PK.MOVES.flailout;
      } else m = PK.MOVES[k.moves.filter(function (x) { return x.pp > 0; })[0].id];
    } else m = PK.MOVES[slot.id];
    if (!this.preMoveChecks(side, ev)) { side.vol.guardChain = 0; return; }
    if (slot && slot.pp > 0 && m.id === slot.id) slot.pp--;
    ev.push({ t: 'msg', text: this.label(side) + ' used ' + m.name + '!' });
    var effs = parseEff(m.eff);
    var name = this.label(side), tname = this.label(foe);

    if (m.cat === 'S') {
      var e = effs[0] || {};
      var targetsFoe = e.who === 'foe' || ['brn', 'psn', 'par', 'slp', 'frz', 'conf'].indexOf(e.k) >= 0;
      if (targetsFoe && foe.vol.guard) { ev.push({ t: 'msg', text: tname + ' protected itself!' }); return; }
      if (targetsFoe && m.acc && Math.random() * 100 >= m.acc) { ev.push({ t: 'msg', text: name + "'s move missed!" }); return; }
      ev.push({ t: 'anim', side: sideKey, move: m.id, target: targetsFoe ? foeKey : sideKey });
      if (e.k === 'stat') this.changeStats(e.who === 'self' ? side : foe, e.changes, ev);
      else if (e.k === 'heal') {
        if (k.hp >= k.stats[0]) { ev.push({ t: 'msg', text: 'But it failed!' }); }
        else {
          k.hp = Math.min(k.stats[0], k.hp + Math.floor(k.stats[0] * (+e.v) / 100));
          ev.push({ t: 'heal', side: sideKey, hp: k.hp });
          ev.push({ t: 'msg', text: name + ' regained health!' });
        }
      } else if (e.k === 'rest') {
        if (k.hp >= k.stats[0]) ev.push({ t: 'msg', text: 'But it failed!' });
        else {
          k.hp = k.stats[0]; k.status = 'slp'; k.sleep = 3;
          ev.push({ t: 'heal', side: sideKey, hp: k.hp });
          ev.push({ t: 'status', side: sideKey, status: 'slp' });
          ev.push({ t: 'msg', text: name + ' fell asleep and became healthy!' });
        }
      } else if (e.k === 'guard') {
        if (side.vol.guardChain > 0 && Math.random() < 0.5) { ev.push({ t: 'msg', text: 'But it failed!' }); side.vol.guardChain = 0; }
        else { side.vol.guard = true; side.vol.guardChain++; ev.push({ t: 'msg', text: name + ' braced itself!' }); }
        return;
      } else if (e.k === 'clear') {
        side.stages = [0, 0, 0, 0, 0, 0]; foe.stages = [0, 0, 0, 0, 0, 0];
        ev.push({ t: 'msg', text: 'All stat changes were reset!' });
      } else if (e.k) this.inflict(foe, e.k, ev);
      side.vol.guardChain = 0;
      return;
    }
    side.vol.guardChain = 0;
    if (foe.vol.guard) { ev.push({ t: 'msg', text: tname + ' protected itself!' }); return; }
    if (m.acc && Math.random() * 100 >= m.acc) { ev.push({ t: 'msg', text: name + "'s attack missed!" }); return; }
    var hits = 1;
    effs.forEach(function (x) {
      if (x.k === 'multi') {
        var r = x.v.split('-').map(Number);
        hits = r[0] === r[1] ? r[0] : [2, 2, 3, 3, 4, 5][PK.rnd(6)];
        hits = Math.min(Math.max(hits, r[0]), r[1]);
      }
    });
    var total = 0, landed = 0, lastEff = 1, critAny = false;
    ev.push({ t: 'anim', side: sideKey, move: m.id, target: foeKey });
    for (var h = 0; h < hits; h++) {
      if (t.hp <= 0) break;
      var critRate = effs.some(function (x) { return x.k === 'crit'; }) ? 1 / 8 : 1 / 16;
      var crit = Math.random() < critRate;
      var d = this.damage(side, foe, m, crit);
      lastEff = d.eff;
      if (d.eff === 0) break;
      var dmg = Math.min(t.hp, d.dmg);
      t.hp -= dmg;
      total += dmg; landed++;
      if (crit) critAny = true;
      ev.push({ t: 'dmg', side: foeKey, hp: t.hp, amount: dmg, eff: d.eff, crit: crit });
      if (crit) ev.push({ t: 'msg', text: 'A critical hit!', auto: 40 });
    }
    if (lastEff === 0) { ev.push({ t: 'msg', text: "It doesn't affect " + tname + '...' }); return; }
    if (lastEff > 1) ev.push({ t: 'msg', text: "It's super effective!", auto: 45 });
    else if (lastEff < 1) ev.push({ t: 'msg', text: "It's not very effective...", auto: 45 });
    if (hits > 1) ev.push({ t: 'msg', text: 'Hit ' + landed + ' time' + (landed > 1 ? 's' : '') + '!' });
    void critAny;
    // secondary effects
    for (var i = 0; i < effs.length; i++) {
      var x = effs[i];
      if (x.k === 'recoil' && total > 0) {
        var rc = Math.max(1, Math.floor(total * (+x.v) / 100));
        k.hp = Math.max(0, k.hp - rc);
        ev.push({ t: 'dmg', side: sideKey, hp: k.hp, amount: rc, eff: 1, quiet: true });
        ev.push({ t: 'msg', text: name + ' is hit with recoil!' });
      } else if (x.k === 'drain' && total > 0 && k.hp > 0) {
        var hl = Math.max(1, Math.floor(total * (+x.v) / 100));
        k.hp = Math.min(k.stats[0], k.hp + hl);
        ev.push({ t: 'heal', side: sideKey, hp: k.hp });
        ev.push({ t: 'msg', text: tname + ' had its energy drained!' });
      } else if (t.hp > 0 && ['brn', 'psn', 'par', 'slp', 'frz', 'conf', 'flinch'].indexOf(x.k) >= 0) {
        if (Math.random() * 100 < +x.v) this.inflict(foe, x.k, ev, true);
      } else if (x.k === 'stat') {
        if (Math.random() * 100 < x.chance) {
          if (x.who === 'self' && k.hp > 0) this.changeStats(side, x.changes, ev);
          else if (x.who === 'foe' && t.hp > 0) this.changeStats(foe, x.changes, ev);
        }
      }
    }
    if (t.hp <= 0) this.faint(foe, ev);
    if (k.hp <= 0) this.faint(side, ev);
    if (t.hp > 0) this.checkRoot(foe, ev);
    if (k.hp > 0) this.checkRoot(side, ev);
  };

  B.checkRoot = function (side, ev) {
    var k = side.kit();
    if (k.held === 'healroot' && !side.vol.rootUsed && k.hp > 0 && k.hp < k.stats[0] / 2) {
      side.vol.rootUsed = true;
      k.held = null;
      k.hp = Math.min(k.stats[0], k.hp + Math.floor(k.stats[0] / 4));
      ev.push({ t: 'heal', side: side.isPlayer ? 'p' : 'e', hp: k.hp });
      ev.push({ t: 'msg', text: this.label(side) + ' ate its Healroot!' });
    }
  };

  B.faint = function (side, ev) {
    side.kit().hp = 0;
    side.kit().status = null;
    ev.push({ t: 'faint', side: side.isPlayer ? 'p' : 'e' });
    ev.push({ t: 'msg', text: this.label(side) + ' fainted!' });
  };

  B.endTurn = function (ev) {
    var self = this;
    [this.p, this.e].forEach(function (side) {
      var k = side.kit();
      if (k.hp <= 0) return;
      var key = side.isPlayer ? 'p' : 'e';
      if (k.status === 'brn' || k.status === 'psn') {
        var d = Math.max(1, Math.floor(k.stats[0] / (k.status === 'brn' ? 16 : 8)));
        k.hp = Math.max(0, k.hp - d);
        ev.push({ t: 'fx', side: key, fx: k.status });
        ev.push({ t: 'dmg', side: key, hp: k.hp, amount: d, eff: 1, quiet: true });
        ev.push({ t: 'msg', text: self.label(side) + (k.status === 'brn' ? ' is hurt by its burn!' : ' is hurt by poison!') });
        if (k.hp <= 0) self.faint(side, ev);
        else self.checkRoot(side, ev);
      }
    });
  };

  // ---------------- AI ----------------
  B.estimate = function (side, foe, m) {
    if (m.cat === 'S') return 0;
    var k = side.kit(), t = foe.kit();
    var physical = m.cat === 'P';
    var A = this.stat(side, physical ? 1 : 3), D = this.stat(foe, physical ? 2 : 4);
    var base = (Math.floor(2 * k.level / 5 + 2) * m.power * A / D) / 50 + 2;
    var stab = PK.stats.types(k).indexOf(m.type) >= 0 ? 1.5 : 1;
    var eff = PK.typeEff(m.type, PK.stats.types(t));
    var hits = /multi:2-5/.test(m.eff) ? 3 : /multi:2-2/.test(m.eff) ? 2 : 1;
    return base * stab * eff * 0.92 * hits * (m.acc ? m.acc / 100 : 1);
  };

  B.chooseAI = function () {
    var side = this.e, foe = this.p, k = side.kit(), self = this;
    var usable = [];
    k.moves.forEach(function (mv, i) { if (mv.pp > 0) usable.push(i); });
    if (!usable.length) return { type: 'move', idx: 0 };
    if (this.ai === 0) return { type: 'move', idx: PK.pick(usable) };
    // item use for smart trainers
    if (this.ai >= 2 && this.enemyItems > 0 && k.hp > 0 && k.hp < k.stats[0] * 0.28 && Math.random() < 0.8) {
      this.enemyItems--;
      return { type: 'item', item: k.level >= 40 ? 'megatonic' : 'hitonic' };
    }
    var scores = usable.map(function (i) {
      var m = PK.MOVES[k.moves[i].id];
      var s;
      if (m.cat !== 'S') {
        s = self.estimate(side, foe, m);
        if (s >= foe.kit().hp) s += 60 + (m.prio > 0 ? 40 : 0);
      } else {
        var e = parseEff(m.eff)[0] || {};
        s = 0;
        if (e.k === 'heal' || e.k === 'rest') s = k.hp < k.stats[0] * 0.4 ? 120 : 0;
        else if (e.k === 'stat' && e.who === 'self') s = k.hp > k.stats[0] * 0.6 && side.stages[e.changes[0].stat] < 2 ? 35 : 0;
        else if (e.k === 'stat' && e.who === 'foe') s = foe.stages[e.changes[0].stat] > -2 ? 22 : 0;
        else if (e.k === 'guard') s = 8;
        else if (['brn', 'psn', 'par', 'slp', 'frz'].indexOf(e.k) >= 0) s = foe.kit().status ? 0 : 45;
        else if (e.k === 'conf') s = foe.vol.conf ? 0 : 25;
        if (self.turn > 6) s *= 0.5;
      }
      return { i: i, s: s * (0.85 + Math.random() * (self.ai >= 2 ? 0.2 : 0.4)) };
    });
    if (this.ai === 1 && Math.random() < 0.2) return { type: 'move', idx: PK.pick(usable) };
    scores.sort(function (a, b) { return b.s - a.s; });
    return { type: 'move', idx: scores[0].i };
  };

  // choose next enemy kit after a faint
  B.nextEnemy = function () {
    var self = this, best = -1, bestScore = -1e9;
    this.e.party.forEach(function (k, i) {
      if (k.hp <= 0) return;
      var sc = i === self.e.idx ? -1 : 0;
      if (self.ai >= 2) {
        var pt = PK.stats.types(self.p.kit());
        PK.stats.types(k).forEach(function (t) { sc += PK.typeEff(t, pt) * 10; });
        pt.forEach(function (t) { sc -= PK.typeEff(t, PK.stats.types(k)) * 6; });
      } else sc = -i;
      if (sc > bestScore) { bestScore = sc; best = i; }
    });
    return best;
  };

  B.expFor = function (defeated, k, participated) {
    var sp = PK.KITS[defeated.id];
    var v = sp.exp * defeated.level / 4 * (this.wild ? 1 : 1.5) * (participated ? 1 : 0.5);
    if (k.held === 'luckyclover') v *= 1.5;
    return Math.max(1, Math.floor(v));
  };

  PK.Battle = Battle;
  PK.battleUtil = { parseEff: parseEff, STAT_NAME: STAT_NAME, ST_NAME: ST_NAME };
})();

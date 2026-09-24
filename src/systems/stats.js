// Kit instances: creation, stats, experience, moves, evolution.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var uid = Date.now() % 100000;

  function species(k) { return PK.KITS[k.id]; }
  function expFor(level) { return level <= 1 ? 0 : Math.floor(Math.pow(level, 3) * 0.9); }

  function calc(k) {
    var sp = species(k), L = k.level, out = [];
    for (var i = 0; i < 6; i++) {
      var b = sp.stats[i], g = k.genes[i];
      var v = Math.floor((2 * b + g * 2) * L / 100);
      out.push(i === 0 ? v + L + 10 : v + 5);
    }
    return out;
  }

  function learnable(id, level) {
    return PK.KITS[id].learn.filter(function (e) { return e[0] <= level; }).map(function (e) { return e[1]; });
  }

  function create(id, level, opts) {
    opts = opts || {};
    var k = {
      uid: ++uid,
      id: id,
      nick: null,
      level: level,
      exp: expFor(level),
      genes: [0, 0, 0, 0, 0, 0].map(function () { return opts.genes != null ? opts.genes : PK.rnd(16); }),
      moves: [],
      status: null,
      sleep: 0,
      prism: opts.prism != null ? opts.prism : (!opts.noPrism && Math.random() < 1 / 512),
      held: opts.held || null,
      friend: 70
    };
    var ls = learnable(id, level);
    var uniq = [];
    ls.forEach(function (m) { var i = uniq.indexOf(m); if (i >= 0) uniq.splice(i, 1); uniq.push(m); });
    var mv = opts.moves || uniq.slice(-4);
    k.moves = mv.map(function (m) { return { id: m, pp: PK.MOVES[m].pp }; });
    k.stats = calc(k);
    k.hp = k.stats[0];
    return k;
  }

  function name(k) { return k.nick || species(k).name; }

  function recalc(k) {
    var oldMax = k.stats ? k.stats[0] : 0;
    k.stats = calc(k);
    if (k.hp > 0) k.hp = Math.min(k.stats[0], k.hp + Math.max(0, k.stats[0] - oldMax));
  }

  function setLevel(k, L) {
    k.level = L;
    k.exp = expFor(L);
    recalc(k);
    k.hp = k.stats[0];
    var ls = learnable(k.id, L);
    var known = k.moves.map(function (m) { return m.id; });
    ls.forEach(function (m) {
      if (known.indexOf(m) >= 0) return;
      if (k.moves.length < 4) k.moves.push({ id: m, pp: PK.MOVES[m].pp });
      else { k.moves.shift(); k.moves.push({ id: m, pp: PK.MOVES[m].pp }); }
      known = k.moves.map(function (x) { return x.id; });
    });
  }

  // Add EXP; returns array of {level} events (moves learned are checked separately per level)
  function addExp(k, amount) {
    var ev = [];
    if (k.level >= 100) return ev;
    k.exp += amount;
    while (k.level < 100 && k.exp >= expFor(k.level + 1)) {
      var before = k.stats.slice();
      k.level++;
      recalc(k);
      ev.push({ level: k.level, before: before, after: k.stats.slice() });
    }
    if (k.level >= 100) k.exp = expFor(100);
    return ev;
  }

  function movesAt(id, level) {
    return PK.KITS[id].learn.filter(function (e) { return e[0] === level; }).map(function (e) { return e[1]; });
  }

  function knows(k, m) { return k.moves.some(function (x) { return x.id === m; }); }

  function evoTarget(k, ctx) {
    ctx = ctx || {};
    var e = species(k).evo;
    if (!e) return 0;
    if (e.item) return ctx.item === e.item ? e.to : 0;
    if (ctx.item) return 0;
    if (k.level < e.lvl) return 0;
    if (e.time) {
      var t = PK.game ? PK.game.timeOfDay() : 'day';
      if (e.time === 'night' && t !== 'night') return 0;
      if (e.time === 'day' && t === 'night') return 0;
    }
    return e.to;
  }

  function evolve(k, to) {
    var wasNamed = !!k.nick;
    k.id = to;
    recalc(k);
    void wasNamed;
  }

  function expProgress(k) {
    if (k.level >= 100) return 1;
    var a = expFor(k.level), b = expFor(k.level + 1);
    return Math.max(0, Math.min(1, (k.exp - a) / (b - a)));
  }

  function heal(k) {
    k.hp = k.stats[0];
    k.status = null;
    k.sleep = 0;
    k.moves.forEach(function (m) { m.pp = PK.MOVES[m.id].pp; });
  }

  function types(k) { return species(k).types; }

  PK.stats = {
    create: create, calc: calc, recalc: recalc, name: name, setLevel: setLevel, addExp: addExp, expFor: expFor,
    movesAt: movesAt, knows: knows, evoTarget: evoTarget, evolve: evolve, expProgress: expProgress,
    heal: heal, types: types, species: species, learnable: learnable
  };
})();

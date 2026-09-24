// Game state: party, bag, money, flags, KitLog, saving/loading, time of day.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var SAVE_KEY = 'pixelkits_save_v1';
  var OPT_KEY = 'pixelkits_options_v1';

  function newState() {
    return {
      v: 1,
      player: { name: 'REMY', map: 'bh_home2f', x: 3, y: 3, dir: 'down' },
      rival: 'JASPER',
      money: 3000,
      party: [],
      box: [],
      bag: {},
      flags: {},
      crests: [false, false, false, false, false, false, false, false],
      seen: {},
      caught: {},
      defeated: {},
      picked: {},
      visited: { brookhollow: true },
      frames: 0,
      steps: 0,
      hush: 0,
      clinic: { map: 'bh_home1f', x: 4, y: 4 },
      options: loadOptions(),
      started: Date.now()
    };
  }

  function loadOptions() {
    var def = { textSpeed: 1, music: 0.5, sfx: 0.7, anim: true };
    try {
      var o = JSON.parse(localStorage.getItem(OPT_KEY) || 'null');
      if (o) Object.assign(def, o);
    } catch (e) { /* storage unavailable */ }
    return def;
  }

  var G = {
    state: null,
    init: function () { G.state = newState(); },
    newGame: function () { G.state = newState(); return G.state; },
    tick: function () { if (G.state) G.state.frames++; },
    hasSave: function () {
      try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    },
    save: function () {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(G.state));
        G.saveOptions();
        return true;
      } catch (e) { console.error(e); return false; }
    },
    saveOptions: function () {
      try { localStorage.setItem(OPT_KEY, JSON.stringify(G.state.options)); } catch (e) { /* ignore */ }
    },
    load: function () {
      try {
        var s = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!s) return false;
        var base = newState();
        for (var k in base) if (s[k] === undefined) s[k] = base[k];
        G.state = s;
        return true;
      } catch (e) { console.error(e); return false; }
    },
    saveInfo: function () {
      try {
        var s = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!s) return null;
        return { name: s.player.name, crests: s.crests.filter(Boolean).length, caught: Object.keys(s.caught).length, time: s.frames, map: s.player.map };
      } catch (e) { return null; }
    },
    exportCode: function () { return btoa(unescape(encodeURIComponent(JSON.stringify(G.state)))); },
    importCode: function (code) {
      var s = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if (!s || !s.player || !s.party) throw new Error('Invalid save code');
      G.state = s;
      G.save();
    },
    // --- flags
    flag: function (f) { return !!G.state.flags[f]; },
    setFlag: function (f, v) { G.state.flags[f] = v === undefined ? true : v; },
    // --- items
    count: function (id) { return G.state.bag[id] || 0; },
    addItem: function (id, n) {
      if (!PK.ITEMS[id]) { console.warn('unknown item', id); return; }
      n = n == null ? 1 : n;
      if (PK.ITEMS[id].pocket === 'key' || PK.ITEMS[id].pocket === 'discs') G.state.bag[id] = 1;
      else G.state.bag[id] = Math.min(999, (G.state.bag[id] || 0) + n);
    },
    removeItem: function (id, n) {
      n = n == null ? 1 : n;
      G.state.bag[id] = Math.max(0, (G.state.bag[id] || 0) - n);
      if (!G.state.bag[id]) delete G.state.bag[id];
    },
    pocketItems: function (pocket) {
      var out = [];
      for (var id in G.state.bag) if (PK.ITEMS[id] && PK.ITEMS[id].pocket === pocket && G.state.bag[id] > 0) out.push(id);
      var order = Object.keys(PK.ITEMS);
      out.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
      return out;
    },
    // --- kits
    see: function (id) { G.state.seen[id] = true; },
    catchKit: function (id) { G.state.seen[id] = true; G.state.caught[id] = true; },
    giveKit: function (k) {
      G.catchKit(k.id);
      k.ot = G.state.player.name;
      if (G.state.party.length < 6) { G.state.party.push(k); return 'party'; }
      G.state.box.push(k);
      return 'box';
    },
    healParty: function () { G.state.party.forEach(PK.stats.heal); },
    firstAlive: function () {
      for (var i = 0; i < G.state.party.length; i++) if (G.state.party[i].hp > 0) return i;
      return -1;
    },
    aliveCount: function () { return G.state.party.filter(function (k) { return k.hp > 0; }).length; },
    crestCount: function () { return G.state.crests.filter(Boolean).length; },
    // --- time of day from the real clock
    timeOfDay: function () {
      if (PK.forceTime) return PK.forceTime;
      var h = new Date().getHours();
      if (h >= 5 && h < 10) return 'morning';
      if (h >= 10 && h < 18) return 'day';
      if (h >= 18 && h < 20) return 'evening';
      return 'night';
    },
    playTime: function (frames) {
      var s = Math.floor((frames == null ? G.state.frames : frames) / 60);
      var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
      return h + ':' + (m < 10 ? '0' : '') + m;
    }
  };
  PK.game = G;
})();

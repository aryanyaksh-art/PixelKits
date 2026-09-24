// Chiptune audio: pulse/triangle/noise synth, MML sequencer, synthesized SFX and creature cries.
(function () {
  'use strict';
  var PK = window.PK;
  var ctx = null, master, musicGain, sfxGain, noiseBuf, waves = {};
  var current = null; // playing track state
  var pendingTrack = null;
  var duckT = 0;

  function vol() { var o = PK.game && PK.game.state ? PK.game.state.options : { music: 0.5, sfx: 0.7 }; return o; }

  function init() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    applyVolumes();
    // pulse waves via Fourier series
    [0.125, 0.25, 0.5].forEach(function (duty) {
      var n = 32, re = new Float32Array(n), im = new Float32Array(n);
      for (var k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      waves[duty] = ctx.createPeriodicWave(re, im);
    });
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  function applyVolumes() {
    if (!ctx) return;
    var o = vol();
    musicGain.gain.value = o.music * 0.5;
    sfxGain.gain.value = o.sfx * 0.6;
  }

  var NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  function freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // Parse an MML string into events [{t, d, n (midi|drum), v, duty}] (t/d in beats of a quarter note)
  function parse(mml) {
    var i = 0, oct = 4, len = 8, v = 10, duty = 1, t = 0, ev = [];
    var stack = [];
    mml = mml.replace(/\s+/g, '');
    function num() { var s = i; while (i < mml.length && /[0-9]/.test(mml[i])) i++; return s === i ? null : +mml.slice(s, i); }
    function dur() {
      var n = num(), d = 4 / (n || len);
      var dd = d;
      while (mml[i] === '.') { dd /= 2; d += dd; i++; }
      return d;
    }
    while (i < mml.length) {
      var c = mml[i++];
      if (c === 'o') oct = num();
      else if (c === '>') oct++;
      else if (c === '<') oct--;
      else if (c === 'l') len = num();
      else if (c === 'v') v = num();
      else if (c === '@') duty = num();
      else if (c === '[') stack.push({ start: ev.length, t: t });
      else if (c === ']') {
        var rep = num() || 2, s = stack.pop();
        var seg = ev.slice(s.start), segLen = t - s.t;
        for (var r = 1; r < rep; r++) seg.forEach(function (e) { ev.push(Object.assign({}, e, { t: e.t + segLen * r })); });
        t += segLen * (rep - 1);
      } else if (c === 'r') t += dur();
      else if (NOTE[c] != null) {
        var n = NOTE[c] + (oct + 1) * 12;
        if (mml[i] === '+' || mml[i] === '#') { n++; i++; } else if (mml[i] === '-') { n--; i++; }
        var d = dur();
        ev.push({ t: t, d: d, n: n, v: v, duty: duty });
        t += d;
      } else if (c === 'k' || c === 's' || c === 'h') {
        var d2 = dur();
        ev.push({ t: t, d: d2, drum: c, v: v });
        t += d2;
      }
    }
    return { ev: ev, len: t };
  }

  var parsed = {};
  function trackData(name) {
    if (parsed[name]) return parsed[name];
    var def = PK.MUSIC && PK.MUSIC[name];
    if (!def) return null;
    var chans = def.ch.map(function (c) { var p = parse(c.mml); p.inst = c.inst; p.vol = c.vol == null ? 1 : c.vol; return p; });
    var len = Math.max.apply(null, chans.map(function (c) { return c.len; }));
    parsed[name] = { def: def, chans: chans, len: len, spb: 60 / def.tempo };
    return parsed[name];
  }

  function playNote(inst, n, when, dur, v, duty, dest, gainMul) {
    var g = ctx.createGain();
    var vv = (v / 15) * (gainMul || 1);
    g.connect(dest);
    if (inst === 'noise' || n === null) return g;
    var o = ctx.createOscillator();
    if (inst === 'tri') { o.type = 'triangle'; vv *= 1.6; }
    else if (inst === 'saw') { o.type = 'sawtooth'; vv *= 0.5; }
    else o.setPeriodicWave(waves[[0.125, 0.25, 0.5][duty] || 0.25]);
    o.frequency.value = freq(n);
    var rel = Math.min(0.06, dur * 0.3);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vv * 0.2, when + 0.006);
    g.gain.linearRampToValueAtTime(vv * 0.13, when + 0.08);
    g.gain.setValueAtTime(vv * 0.13, Math.max(when + 0.08, when + dur - rel));
    g.gain.linearRampToValueAtTime(0, when + dur);
    if (inst === 'lead' && dur > 0.25) {
      // gentle vibrato
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = freq(n) * 0.006;
      lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(when + 0.15); lfo.stop(when + dur + 0.02);
    }
    o.connect(g);
    o.start(when); o.stop(when + dur + 0.02);
    return g;
  }
  function playDrum(kind, when, v, dest) {
    var g = ctx.createGain();
    g.connect(dest);
    var vv = v / 15;
    if (kind === 'k') {
      var o = ctx.createOscillator();
      o.frequency.setValueAtTime(140, when); o.frequency.exponentialRampToValueAtTime(40, when + 0.12);
      g.gain.setValueAtTime(vv * 0.5, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.15);
      o.connect(g); o.start(when); o.stop(when + 0.16);
      return;
    }
    var s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = kind === 'h' ? 'highpass' : 'bandpass';
    f.frequency.value = kind === 'h' ? 7000 : 1800;
    var d = kind === 'h' ? 0.04 : 0.12;
    g.gain.setValueAtTime(vv * (kind === 'h' ? 0.12 : 0.28), when);
    g.gain.exponentialRampToValueAtTime(0.001, when + d);
    s.connect(f); f.connect(g);
    s.start(when, Math.random() * 0.5); s.stop(when + d + 0.01);
  }

  function schedule() {
    if (!current || !ctx) return;
    var tr = current.tr, now = ctx.currentTime, ahead = now + 0.2;
    while (current.nextTime < ahead) {
      // schedule one step (beat slice) at a time: 1/8 beat resolution
      var step = 0.125;
      var from = current.pos, to = current.pos + step;
      var base = current.nextTime;
      tr.chans.forEach(function (ch) {
        var L = tr.len;
        ch.ev.forEach(function (e) {
          var et = e.t % L;
          if (et >= from % L && et < (from % L) + step) {
            var when = base + (et - (from % L)) * tr.spb;
            var dur = e.d * tr.spb * 0.95;
            if (e.drum) playDrum(e.drum, when, e.v * ch.vol, musicGain);
            else playNote(ch.inst, e.n, when, dur, e.v * ch.vol, e.duty, musicGain);
          }
        });
      });
      current.pos = to;
      current.nextTime += step * tr.spb;
      if (current.pos >= tr.len) {
        if (tr.def.once) { current = null; if (pendingTrack) { var p = pendingTrack; pendingTrack = null; A.music(p, true); } return; }
        current.pos -= tr.len;
      }
    }
  }

  function tone(type, f0, f1, dur, v, when, duty) {
    if (!ctx) return;
    when = when || ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    if (type === 'pulse') o.setPeriodicWave(waves[duty || 0.5]); else o.type = type;
    o.frequency.setValueAtTime(f0, when);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
    g.gain.setValueAtTime(v, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    o.connect(g); g.connect(sfxGain);
    o.start(when); o.stop(when + dur + 0.02);
  }
  function noise(dur, v, fType, fFreq, when, f1) {
    if (!ctx) return;
    when = when || ctx.currentTime;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = fType || 'lowpass'; f.frequency.setValueAtTime(fFreq || 2000, when);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, when + dur);
    g.gain.setValueAtTime(v, when); g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain);
    s.start(when, Math.random()); s.stop(when + dur + 0.02);
  }

  var SFX = {
    select: function () { tone('pulse', 1320, 1320, 0.05, 0.25, 0, 0.25); },
    move: function () { tone('pulse', 880, 880, 0.025, 0.12, 0, 0.25); },
    back: function () { tone('pulse', 660, 440, 0.06, 0.2, 0, 0.25); },
    buzz: function () { tone('square', 110, 100, 0.15, 0.2); },
    text: function () { tone('pulse', 1800, 1800, 0.012, 0.05, 0, 0.125); },
    door: function () { noise(0.12, 0.3, 'lowpass', 800); tone('triangle', 220, 110, 0.12, 0.3); },
    stairs: function () { [0, 0.07, 0.14].forEach(function (d, i) { tone('pulse', 400 - i * 60, 380 - i * 60, 0.05, 0.2, ctx.currentTime + d, 0.25); }); },
    bump: function () { tone('triangle', 90, 60, 0.08, 0.4); },
    jump: function () { tone('pulse', 300, 900, 0.14, 0.2, 0, 0.25); },
    hit: function () { noise(0.14, 0.5, 'lowpass', 3000, 0, 300); tone('square', 180, 60, 0.12, 0.25); },
    hit_super: function () { noise(0.22, 0.6, 'lowpass', 5000, 0, 200); tone('square', 260, 50, 0.2, 0.3); },
    hit_weak: function () { noise(0.1, 0.35, 'lowpass', 1500, 0, 300); },
    status: function () { [0, 0.05, 0.1, 0.15].forEach(function (d, i) { tone('pulse', 600 + i * 200, 600 + i * 200, 0.05, 0.12, ctx.currentTime + d, 0.25); }); },
    statup: function () { tone('pulse', 400, 1600, 0.3, 0.18, 0, 0.5); },
    statdown: function () { tone('pulse', 1400, 300, 0.3, 0.18, 0, 0.5); },
    faint: function () { tone('pulse', 700, 80, 0.6, 0.25, 0, 0.25); },
    pop: function () { tone('pulse', 500, 1500, 0.08, 0.25, 0, 0.5); noise(0.08, 0.2, 'highpass', 4000); },
    throw: function () { tone('triangle', 300, 900, 0.3, 0.25); },
    wobble: function () { tone('triangle', 220, 180, 0.12, 0.35); noise(0.05, 0.15, 'lowpass', 1000); },
    caught: function () { [0, 0.1, 0.2].forEach(function (d, i) { tone('pulse', [880, 1100, 1320][i], [880, 1100, 1320][i], 0.09, 0.2, ctx.currentTime + d, 0.25); }); },
    exp: function () { tone('pulse', 400, 1200, 0.5, 0.1, 0, 0.125); },
    flee: function () { [0, 0.06, 0.12].forEach(function (d) { noise(0.05, 0.2, 'bandpass', 1500, ctx.currentTime + d); }); },
    emote: function () { tone('pulse', 1000, 1400, 0.08, 0.2, 0, 0.25); tone('pulse', 1400, 1400, 0.08, 0.2, ctx.currentTime + 0.09, 0.25); },
    cut: function () { noise(0.2, 0.4, 'highpass', 3000, 0, 8000); },
    smash: function () { noise(0.35, 0.6, 'lowpass', 1200, 0, 100); tone('square', 120, 40, 0.3, 0.3); },
    splash: function () { noise(0.4, 0.4, 'bandpass', 1200, 0, 400); },
    buy: function () { tone('pulse', 1568, 1568, 0.06, 0.2, 0, 0.25); tone('pulse', 2093, 2093, 0.12, 0.2, ctx.currentTime + 0.07, 0.25); },
    heal: function () { tone('pulse', 600, 1200, 0.25, 0.12, 0, 0.25); },
    hit_fire: function () { noise(0.4, 0.35, 'bandpass', 1200, 0, 300); },
    hit_water: function () { noise(0.35, 0.3, 'bandpass', 800, 0, 2400); },
    hit_leaf: function () { noise(0.25, 0.25, 'highpass', 2500); },
    hit_bolt: function () { tone('square', 1800, 200, 0.2, 0.2); noise(0.2, 0.3, 'highpass', 3000); },
    hit_ice: function () { tone('pulse', 2400, 2600, 0.2, 0.12, 0, 0.125); noise(0.15, 0.2, 'highpass', 6000); },
    hit_bubble: function () { [0, 0.06, 0.12, 0.18].forEach(function (d) { tone('sine', 500 + Math.random() * 400, 900, 0.06, 0.2, ctx.currentTime + d); }); },
    hit_rock: function () { noise(0.3, 0.5, 'lowpass', 600, 0, 100); },
    hit_wind: function () { noise(0.4, 0.3, 'bandpass', 600, 0, 2400); },
    hit_ring: function () { tone('sine', 800, 400, 0.4, 0.25); },
    hit_swarm: function () { tone('sawtooth', 220, 240, 0.3, 0.08); },
    hit_orb: function () { tone('sine', 200, 80, 0.4, 0.3); },
    hit_ray: function () { tone('pulse', 1200, 1800, 0.3, 0.12, 0, 0.5); },
    hit_impact: function () { noise(0.1, 0.4, 'lowpass', 2500, 0, 400); }
  };

  var JINGLES = {
    heal: 'o5 l8 @1 v12 e g >c< g e g >c4 e4.',
    levelup: 'o5 l16 @2 v12 c e g >c8< g >c4',
    caught: 'o5 l8 @1 v12 g >c e c< g >c e g4. r8',
    item: 'o5 l16 @1 v12 e g a >c8 c< a >c4.',
    keyitem: 'o4 l8 @2 v12 g >c e g e c e g >c4.',
    save: 'o5 l16 @1 v12 c e g >c4',
    evolved: 'o5 l8 @2 v13 c e g >c< b >d g4 e4 c2',
    crest: 'o4 l8 @1 v13 g >c e g c e g >c4 r8 <g >c2'
  };
  var jingleCache = {};

  var A = {
    unlock: function () {
      if (!init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (pendingTrack && !current) { var p = pendingTrack; pendingTrack = null; A.music(p, true); }
    },
    applyVolumes: applyVolumes,
    update: function () {
      if (!ctx) return;
      if (duckT > 0) { duckT--; if (duckT === 0) musicGain.gain.setTargetAtTime(vol().music * 0.5, ctx.currentTime, 0.1); }
      schedule();
    },
    music: function (name, force) {
      if (!name) return;
      if (!ctx || ctx.state !== 'running') { pendingTrack = name; if (ctx) ctx.resume(); return; }
      if (!force && current && current.name === name) return;
      var tr = trackData(name);
      if (!tr) { current = null; return; }
      if (tr.def.once && current) pendingTrack = current.name;
      current = { name: name, tr: tr, pos: 0, nextTime: ctx.currentTime + 0.06 };
    },
    stopMusic: function () { current = null; },
    currentTrack: function () { return current && current.name; },
    sfx: function (name) {
      if (!ctx || ctx.state !== 'running') return;
      var f = SFX[name] || SFX.hit;
      try { f(); } catch (e) { /* ignore */ }
    },
    jingle: function (name) {
      if (!ctx || ctx.state !== 'running') return;
      var mml = JINGLES[name];
      if (!mml) return;
      var p = jingleCache[name] || (jingleCache[name] = parse(mml));
      var spb = 60 / 160, t0 = ctx.currentTime + 0.03;
      musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);
      duckT = Math.ceil((p.len * spb + 0.3) * 60);
      p.ev.forEach(function (e) { playNote('lead', e.n, t0 + e.t * spb, e.d * spb * 0.95, e.v, e.duty, sfxGain, 1.2); });
    },
    // Procedural cry: unique per species
    cry: function (id) {
      if (!ctx || ctx.state !== 'running') return;
      var r = PK.seeded(PK.hash('cry' + id));
      var k = PK.KITS[id];
      var big = k ? (k.stage || 1) : 1;
      var base = 300 + r() * 700 - big * 70;
      var t = ctx.currentTime + 0.02;
      var segs = 2 + r.int(3);
      var duty = [0.125, 0.25, 0.5][r.int(3)];
      for (var s = 0; s < segs; s++) {
        var d = 0.08 + r() * 0.16;
        var f0 = base * (0.7 + r() * 0.8), f1 = f0 * (0.6 + r() * 0.9);
        tone('pulse', f0, f1, d, 0.18, t, duty);
        if (r() < 0.4) tone('sawtooth', f0 / 2, f1 / 2, d, 0.06, t);
        t += d * 0.85;
      }
      if (r() < 0.5) noise(0.1, 0.12, 'bandpass', base * 2, t - 0.05);
    }
  };
  PK.audio = A;
  PK.mmlParse = parse;
})();

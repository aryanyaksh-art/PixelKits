// Battle effects: particles per move type, capsule device drawing, status sparkles.
(function () {
  'use strict';
  var PK = window.PK;

  // Original capture device: a vertical pill capsule with a glowing band (not a ball).
  function drawCapsule(ctx, x, y, item, open, glow) {
    var top = { capsule: '#2fb3a0', pluscapsule: '#4a7ae0', procapsule: '#e0a030', omnicapsule: '#b050e0' }[item] || '#2fb3a0';
    x = Math.round(x); y = Math.round(y);
    var o = '#1e1a28';
    ctx.fillStyle = o;
    ctx.fillRect(x - 3, y - 7, 7, 14); ctx.fillRect(x - 4, y - 6, 9, 12);
    ctx.fillStyle = top;
    ctx.fillRect(x - 3, y - 6, 7, 5); ctx.fillRect(x - 2, y - 7 + 1, 5, 1);
    ctx.fillStyle = PK.color.shade(top, 0.4);
    ctx.fillRect(x - 2, y - 5, 1, 3);
    ctx.fillStyle = '#f4f4f0';
    ctx.fillRect(x - 3, y + 1, 7, 5);
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(x + 2, y + 1, 1, 4);
    ctx.fillStyle = glow ? '#fff8a0' : '#5a6070';
    ctx.fillRect(x - 3, y - 1, 7, 2);
    ctx.fillStyle = glow ? '#ffffff' : '#9aa0b0';
    ctx.fillRect(x, y - 1, 1, 2);
    if (open) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(x - 6, y - 2, 13, 1);
    }
  }

  var STYLE = {
    Plain: { c: ['#ffffff', '#f8e8a0'], kind: 'impact' },
    Brawl: { c: ['#ffd060', '#ff8040', '#ffffff'], kind: 'impact' },
    Blaze: { c: ['#ffd040', '#ff8020', '#e04010'], kind: 'fire' },
    Tide: { c: ['#a8dcff', '#4a9aef', '#ffffff'], kind: 'water' },
    Leaf: { c: ['#8ae060', '#3ea04a', '#d8f8a0'], kind: 'leaf' },
    Volt: { c: ['#fff080', '#ffd020', '#ffffff'], kind: 'bolt' },
    Frost: { c: ['#e0f8ff', '#8ad8f0', '#ffffff'], kind: 'ice' },
    Venom: { c: ['#c070e0', '#8a40b0', '#e0a0f8'], kind: 'bubble' },
    Terra: { c: ['#b89060', '#7a5a38', '#d8b888'], kind: 'rock' },
    Gale: { c: ['#ffffff', '#c8e0ff'], kind: 'wind' },
    Mind: { c: ['#ff90d0', '#e050a8', '#ffd0f0'], kind: 'ring' },
    Swarm: { c: ['#c0e040', '#80a020', '#f0ff90'], kind: 'swarm' },
    Shade: { c: ['#5a3a8a', '#2a1a4a', '#a070e0'], kind: 'orb' },
    Lumen: { c: ['#fffbe0', '#fff080', '#ffffff'], kind: 'ray' },
    Metal: { c: ['#e0e6f0', '#9aa4b8', '#ffffff'], kind: 'impact' },
    Wyrm: { c: ['#8a7aff', '#5040d0', '#c8b8ff'], kind: 'fire' }
  };

  function P(scene, o) {
    var p = Object.assign({ life: 30, vx: 0, vy: 0, ax: 0, ay: 0, size: 2, shape: 'sq', delay: 0 }, o);
    if (p.max == null) p.max = p.life;
    scene.parts.push(p);
  }

  // Plays the attack animation. from/to are {x,y} centers. Returns a promise.
  async function playMove(scene, move, from, to, targetKey, userKey) {
    var st = STYLE[move.type] || STYLE.Plain;
    var c = st.c;
    var i;
    if (move.cat === 'S') {
      // aura sparkle around the user (or the foe for debuffs/status)
      var tgt = targetKey === userKey ? from : to;
      for (i = 0; i < 16; i++) {
        var a = i / 16 * Math.PI * 2;
        P(scene, { x: tgt.x + Math.cos(a) * 22, y: tgt.y + Math.sin(a) * 16, vx: -Math.cos(a) * 0.9, vy: -Math.sin(a) * 0.7, col: c[i % c.length], life: 26, max: 26, shape: 'star', size: 3 });
      }
      if (PK.audio) PK.audio.sfx('status');
      await PK.wait(28);
      return;
    }
    var physical = move.cat === 'P';
    if (physical) {
      scene.lunge(userKey);
      await PK.wait(8);
    }
    if (PK.audio) PK.audio.sfx('hit_' + st.kind);
    switch (st.kind) {
      case 'fire':
        for (i = 0; i < 24; i++) {
          var t = i / 24;
          P(scene, { x: (physical ? to.x : from.x + (to.x - from.x) * t) + PK.rnd(9) - 4, y: (physical ? to.y + 10 : from.y + (to.y - from.y) * t) + PK.rnd(9) - 4, vy: -0.8 - Math.random(), col: c[i % 3], life: 22 + PK.rnd(10), shape: 'sq', size: 3 + PK.rnd(2), delay: i });
        }
        break;
      case 'water':
        for (i = 0; i < 20; i++) {
          var t2 = i / 20;
          P(scene, { x: from.x + (to.x - from.x) * t2, y: from.y + (to.y - from.y) * t2 - Math.sin(t2 * Math.PI) * 20, vx: (to.x - from.x) / 60, vy: 0.3, col: c[i % 3], life: 18, shape: 'dia', size: 3, delay: i });
        }
        for (i = 0; i < 12; i++) P(scene, { x: to.x, y: to.y + 8, vx: Math.random() * 3 - 1.5, vy: -1.5 - Math.random() * 1.5, ay: 0.15, col: c[i % 3], life: 26, size: 2, delay: 18 });
        break;
      case 'leaf':
        for (i = 0; i < 16; i++) {
          var ang = i / 16 * Math.PI * 4;
          P(scene, { x: to.x + Math.cos(ang) * 30, y: to.y + Math.sin(ang) * 18, vx: -Math.cos(ang) * 1.6, vy: -Math.sin(ang) * 1.1, col: c[i % 3], life: 20, shape: 'dia', size: 4, delay: i });
        }
        break;
      case 'bolt':
        for (i = 0; i < 4; i++) P(scene, { x: to.x + PK.rnd(30) - 15, y: to.y - 30, col: c[i % 3], life: 10, shape: 'bolt', size: 34, delay: i * 5 });
        scene.flashFrames = 6;
        break;
      case 'ice':
        for (i = 0; i < 18; i++) {
          var t3 = i / 18;
          P(scene, { x: from.x + (to.x - from.x) * t3 + PK.rnd(7) - 3, y: from.y + (to.y - from.y) * t3 + PK.rnd(7) - 3, col: c[i % 3], life: 24, shape: 'dia', size: 3, delay: i });
        }
        for (i = 0; i < 10; i++) P(scene, { x: to.x + PK.rnd(40) - 20, y: to.y - 20 - PK.rnd(10), vy: 0.8, col: '#ffffff', life: 30, shape: 'star', size: 2, delay: 16 });
        break;
      case 'bubble':
        for (i = 0; i < 16; i++) P(scene, { x: to.x + PK.rnd(36) - 18, y: to.y + 14, vy: -0.6 - Math.random(), col: c[i % 3], life: 30, shape: 'ring', size: 3 + PK.rnd(3), delay: i * 2 });
        break;
      case 'rock':
        for (i = 0; i < 9; i++) P(scene, { x: to.x + PK.rnd(40) - 20, y: to.y - 50, vy: 3, col: c[i % 3], life: 16, shape: 'sq', size: 5 + PK.rnd(3), delay: i * 3 });
        scene.shakeKey = targetKey; scene.shakeT = 30;
        break;
      case 'wind':
        for (i = 0; i < 18; i++) {
          var a2 = i / 18 * Math.PI * 4;
          P(scene, { x: to.x + Math.cos(a2) * (26 - i), y: to.y + Math.sin(a2) * 12, col: c[i % 2], life: 16, shape: 'sq', size: 2, vx: Math.sin(a2) * 2, delay: i });
        }
        break;
      case 'ring':
        for (i = 0; i < 5; i++) P(scene, { x: to.x, y: to.y, col: c[i % 3], life: 20, shape: 'grow', size: 2, delay: i * 4 });
        scene.wobble = 30;
        break;
      case 'swarm':
        for (i = 0; i < 26; i++) P(scene, { x: from.x, y: from.y, vx: (to.x - from.x) / 24 + Math.random() - 0.5, vy: (to.y - from.y) / 24 + Math.random() - 0.5, col: c[i % 3], life: 26, shape: 'sq', size: 2, delay: i });
        break;
      case 'orb':
        for (i = 0; i < 12; i++) {
          var t4 = i / 12;
          P(scene, { x: from.x + (to.x - from.x) * t4, y: from.y + (to.y - from.y) * t4, col: c[i % 3], life: 14, shape: 'ring', size: 6, delay: i * 2 });
        }
        scene.darken = 30;
        break;
      case 'ray':
        for (i = 0; i < 10; i++) P(scene, { x: from.x, y: from.y, tx: to.x, ty: to.y, col: c[i % 3], life: 18, shape: 'beam', size: 3 + (i % 3), delay: i });
        scene.flashFrames = 8;
        break;
      default: // impact
        for (i = 0; i < 10; i++) {
          var a3 = i / 10 * Math.PI * 2;
          P(scene, { x: to.x, y: to.y, vx: Math.cos(a3) * 2.2, vy: Math.sin(a3) * 2.2, col: c[i % c.length], life: 14, shape: 'star', size: 3 });
        }
    }
    await PK.wait(physical ? 14 : 30);
  }

  function drawParts(ctx, scene) {
    for (var i = 0; i < scene.parts.length; i++) {
      var p = scene.parts[i];
      if (p.delay > 0) continue;
      var a = Math.max(0, Math.min(1, p.life / Math.max(1, p.max) * 1.4));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.col;
      var x = Math.round(p.x), y = Math.round(p.y), s = p.size;
      switch (p.shape) {
        case 'dia':
          ctx.fillRect(x - 1, y - s + 1, 2, s * 2 - 2); ctx.fillRect(x - s + 1, y - 1, s * 2 - 2, 2); break;
        case 'star':
          ctx.fillRect(x - s, y, s * 2 + 1, 1); ctx.fillRect(x, y - s, 1, s * 2 + 1); ctx.fillRect(x - 1, y - 1, 3, 3); break;
        case 'ring':
          ctx.strokeStyle = p.col; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke(); break;
        case 'grow':
          var r = (p.max - p.life) * 1.6 + 2;
          ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); break;
        case 'bolt':
          ctx.fillStyle = p.col;
          var bx = x, by = y;
          for (var k = 0; k < 6; k++) { var nx = bx + (k % 2 ? 5 : -5), ny = by + s / 6; ctx.fillRect(Math.min(bx, nx), by, Math.abs(nx - bx) + 2, 2); ctx.fillRect(nx, by, 2, ny - by + 1); bx = nx; by = ny; }
          break;
        case 'beam':
          ctx.strokeStyle = p.col; ctx.lineWidth = s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.tx + PK.rnd(6) - 3, p.ty + PK.rnd(6) - 3); ctx.stroke(); break;
        default:
          ctx.fillRect(x - (s >> 1), y - (s >> 1), s, s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function updateParts(scene) {
    for (var i = scene.parts.length - 1; i >= 0; i--) {
      var p = scene.parts[i];
      if (p.delay > 0) { p.delay--; continue; }
      p.x += p.vx; p.y += p.vy; p.vx += p.ax; p.vy += p.ay;
      if (--p.life <= 0) scene.parts.splice(i, 1);
    }
  }

  PK.bfx = { drawCapsule: drawCapsule, playMove: playMove, drawParts: drawParts, updateParts: updateParts, STYLE: STYLE, spawn: P };
})();

// Original soundtrack for PixelKits, written in MML. '|' marks bars (ignored by the parser).
// inst: lead (pulse + vibrato), pulse, tri (bass), noise (drums: k kick, s snare, h hat)
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var M = {};
  function T(name, tempo, lead, bass, drums, extra) {
    var ch = [{ inst: 'lead', mml: lead, vol: 1 }, { inst: 'tri', mml: bass, vol: 1 }];
    if (drums) ch.push({ inst: 'noise', mml: drums, vol: 0.8 });
    if (extra) ch.push({ inst: 'pulse', mml: extra, vol: 0.55 });
    M[name] = { tempo: tempo, ch: ch };
    return M[name];
  }

  T('title', 120,
    '@2 v12 o5 c4 g8 e8 c4 e8 g8 | o5 a4. g8 f8 e8 d4 | o5 e4 f8 g8 a4 o6 c8 o5 b8 | o5 g2. r4 | o5 c4 g8 e8 c4 e8 g8 | o5 a4. o6 c8 o5 b8 a8 g4 | o5 f8 e8 d8 e8 f4 d4 | o5 c2. r4',
    'o3 c4 g4 o4 c4 o3 g4 | o3 f4 a4 g4 b4 | o3 a4 o4 e4 o3 f4 a4 | o3 g4 o4 d4 o3 b4 o4 d4 | o3 c4 g4 o4 c4 o3 g4 | o3 f4 a4 o4 c4 o3 a4 | o3 g4 b4 o4 d4 o3 b4 | o3 c4 g4 c4 r4',
    'l8 v9 [k h s h k k s h]8',
    '@1 v7 l8 [o4 e g o5 c o4 g]2 [o4 f a o5 c o4 a]2 [o4 e a o5 c o4 a]2 [o4 d g b g]2 [o4 e g o5 c o4 g]2 [o4 f a o5 c o4 a]2 [o4 d g b g]2 o4 e g o5 c o4 g e4 r4');
  M.credits = Object.assign({}, M.title, { tempo: 100 });

  T('hometown', 100,
    '@1 v11 o5 f4 a8 o6 c8 o5 a4 g8 f8 | o5 e4 g8 b-8 a2 | o5 d4 f8 a8 g4 f8 e8 | o5 f2. r4 | o5 a4 o6 c8 o5 a8 b-4 a8 g8 | o5 f4 e8 f8 g2 | o5 a8 g8 f8 e8 d4 e4 | o5 f2. r4',
    'o3 f4 o4 c4 o3 a4 o4 c4 | o3 c4 g4 e4 g4 | o3 d4 a4 f4 a4 | o3 f4 o4 c4 o3 f4 r4 | o3 f4 a4 o4 c4 o3 a4 | o3 b-4 o4 f4 o3 c4 g4 | o3 d4 a4 c4 g4 | o3 f4 o4 c4 o3 f4 r4',
    'v6 [k4 h8 h8 s4 h8 h8]8');

  T('bike', 152,
    '@2 v12 o5 a8 a8 o6 c+8 e8 d4 c+8 o5 b8 | o5 a8 b8 o6 c+8 d8 e4 r8 e8 | o6 f+8 e8 d8 c+8 o5 b4 a8 b8 | o6 c+2 o5 a4 r4 | o5 f+8 a8 o6 d8 f+8 e4 d8 c+8 | o5 b8 o6 c+8 d8 e8 f+4 e4 | o6 d8 c+8 o5 b8 a8 g+4 b4 | o5 a2. r4',
    'o3 a4 o4 e4 o3 a4 o4 e4 | o3 a4 o4 e4 c+4 e4 | o3 d4 a4 f+4 a4 | o3 a4 o4 e4 o3 a4 r4 | o3 d4 a4 f+4 a4 | o3 e4 b4 g+4 b4 | o3 d4 a4 e4 b4 | o3 a4 o4 e4 o3 a4 r4',
    'l8 v8 [k h s h k k s h]8');

  T('safari', 116,
    '@1 v11 o5 c8 f8 a8 f8 g4 e4 | o5 f8 g8 a8 b-8 a4 f4 | o5 d8 f8 b-8 a8 g4 f8 e8 | o5 f2 c4 r4 | o5 a8 b-8 o6 c8 o5 a8 b-4 g4 | o5 a8 g8 f8 g8 a4 f4 | o5 g8 a8 b-8 g8 e4 g4 | o5 f2. r4',
    'o3 f4 o4 c4 o3 a4 o4 c4 | o3 f4 o4 c4 o3 f4 a4 | o3 b-4 o4 f4 o3 c4 g4 | o3 f4 o4 c4 o3 f4 r4 | o3 f4 a4 b-4 g4 | o3 f4 o4 c4 o3 f4 a4 | o3 c4 g4 e4 g4 | o3 f4 o4 c4 o3 f4 r4',
    'v6 [k8 h8 s8 h8 k8 k8 s8 h8]8');

  T('island', 104,
    '@2 v11 o5 e8 g4 e8 a4 g4 | o5 f8 a4 f8 g2 | o5 e8 g4 o6 c8 o5 b4 a4 | o5 g2. r4 | o5 a8 o6 c4 o5 a8 g4 e4 | o5 f8 a4 f8 e4 d4 | o5 e8 g4 e8 d4 e4 | o5 c2. r4',
    'o3 c4 g8 c8 e4 g4 | o3 f4 o4 c8 o3 f8 g4 b4 | o3 c4 g8 c8 a4 f4 | o3 g4 d8 g8 b4 r4 | o3 f4 o4 c8 o3 f8 a4 c4 | o3 d4 a8 d8 g4 b4 | o3 c4 g8 e8 g4 b4 | o3 c4 g8 c8 c4 r4',
    'v6 [k8 h8 h8 s8 h8 k8 s8 h8]8');

  T('route', 132,
    '@2 v12 o5 g8 g8 a8 b8 o6 d4 o5 b8 g8 | o5 a8 a8 b8 o6 c8 d4 o5 a4 | o5 b8 o6 d8 e8 d8 o5 b4 g8 a8 | o5 b4 a4 g4 r4 | o5 e8 g8 a8 b8 o6 c4 o5 b8 a8 | o5 g8 a8 b8 o6 d8 e4 d4 | o6 c8 o5 b8 a8 b8 o6 c4 o5 a4 | o5 g2. r4',
    'o3 g4 o4 d4 o3 b4 o4 d4 | o3 d4 a4 f+4 a4 | o3 e4 b4 g4 b4 | o3 d4 a4 d4 r4 | o3 c4 g4 e4 g4 | o3 g4 o4 d4 o3 e4 b4 | o3 a4 o4 e4 o3 d4 a4 | o3 g4 o4 d4 o3 g4 r4',
    'l8 v8 [k h s h k h s k]8');

  T('town', 112,
    '@1 v11 o5 f+4 a8 f+8 d4 e8 f+8 | o5 g4 f+8 e8 d2 | o5 e4 f+8 g8 a4 b8 a8 | o5 f+2 e4 r4 | o5 f+4 a8 o6 d8 c+4 o5 b8 a8 | o5 g4 b8 a8 g4 f+8 e8 | o5 d8 e8 f+8 a8 g4 e4 | o5 d2. r4',
    'o3 d4 a4 f+4 a4 | o3 g4 o4 d4 o3 d4 a4 | o3 a4 o4 e4 o3 g4 o4 d4 | o3 d4 a4 a4 r4 | o3 d4 a4 f+4 a4 | o3 g4 o4 d4 o3 g4 b4 | o3 a4 o4 e4 o3 a4 c+4 | o3 d4 a4 d4 r4',
    'v7 [k4 h8 h8 s4 h8 k8]8');

  T('forest', 100,
    '@0 v10 o5 a4. o6 c8 o5 b4 a8 g8 | o5 e2 r4 e8 g8 | o5 a4 o6 c8 d8 e4 d8 c8 | o5 b2. r4 | o6 c4. o5 b8 a4 g8 f8 | o5 e4 f8 g8 a4 e4 | o5 f8 e8 d8 e8 f4 g+4 | o5 a2. r4',
    'l8 o3 a o4 e a e o3 a o4 e a e | o3 e b o4 e o3 b e b o4 e o3 b | o3 f o4 c f c o3 f o4 c f c | o3 e b o4 e o3 b e b g+ b | o3 a o4 e a e o3 f o4 c f c | o3 c g o4 c o3 g a o4 e a e | o3 d a o4 d o3 a e b o4 e o3 b | o3 a o4 e a e a4 r4',
    'v5 [h4 h4 h4 h8 h8]8');

  T('cave', 96,
    '@0 v9 o5 e2 g4 f+4 | o5 e2. r4 | o5 b2 a4 g4 | o5 f+2. r4 | o5 e2 g4 b4 | o6 c2 o5 b4 a4 | o5 g4 f+4 e4 d+4 | o5 e2. r4',
    'o2 e2 e2 | o2 e2 e2 | o2 g2 g2 | o2 b2 b2 | o2 e2 e2 | o2 a2 a2 | o2 b2 b2 | o2 e2 e2',
    'v5 [k2 h4 h4]8');

  T('coast', 124,
    '@2 v11 o5 e8 a8 o6 c+8 e8 d4 c+8 o5 b8 | o5 a4 b8 o6 c+8 o5 b2 | o5 f+8 a8 o6 d8 f+8 e4 d8 c+8 | o6 c+2. r4 | o6 d4 c+8 o5 b8 a4 f+8 a8 | o5 g+4 a8 b8 e2 | o5 f+8 g+8 a8 b8 o6 c+4 o5 b8 g+8 | o5 a2. r4',
    'o3 a4 o4 e4 o3 a4 o4 e4 | o3 e4 b4 e4 b4 | o3 d4 a4 f+4 a4 | o3 a4 o4 e4 o3 a4 r4 | o3 d4 a4 f+4 a4 | o3 e4 b4 g+4 b4 | o3 d4 a4 e4 b4 | o3 a4 o4 e4 o3 a4 r4',
    'l8 v8 [k h s k h k s h]8');

  T('desert', 110,
    '@1 v11 o5 d4 e8 f8 g+4 f8 e8 | o5 d2 c+4 r4 | o5 f4 g8 a8 b-4 a8 g+8 | o5 a2. r4 | o5 a4 b-8 a8 g+4 f8 e8 | o5 f4 e8 d8 c+2 | o5 d8 e8 f8 g+8 a4 g+8 f8 | o5 e8 f8 e8 c+8 d2',
    '[o3 d4 a4 d4 a4]2 | o3 b-4 o4 f4 o3 b-4 o4 f4 | o3 a4 o4 e4 o3 a4 o4 e4 | o3 d4 a4 d4 a4 | o3 b-4 f4 a4 e4 | o3 d4 a4 b-4 a4 | o3 a4 e4 d4 r4',
    'v8 [k4 h8 k8 s4 h8 h8]8');

  T('city', 118,
    '@2 v11 o5 f8 b-8 o6 d8 c8 o5 b-4 g8 f8 | o5 e-4 f8 g8 f2 | o5 g8 b-8 o6 e-8 d8 c4 o5 b-8 a8 | o5 b-2. r4 | o6 d4 c8 o5 b-8 a4 f8 a8 | o5 g4 a8 b-8 o6 c2 | o6 d8 e-8 d8 c8 o5 b-4 a4 | o5 b-2. r4',
    'o3 b-4 o4 d4 f4 d4 | o3 e-4 g4 b-4 g4 | o3 c4 e-4 g4 f4 | o3 b-4 f4 b-4 r4 | o3 d4 f4 a4 f4 | o3 e-4 g4 c4 e-4 | o3 f4 a4 c4 f4 | o3 b-4 f4 b-4 r4',
    'l8 v8 [k h s h k k s h]8');

  T('snow', 92,
    '@1 v10 o5 g+4 b4 o6 e4 d+4 | o6 c+2 o5 b2 | o5 a4 o6 c+4 e4 d+4 | o5 b2. r4 | o5 g+4 b4 o6 e4 f+4 | o6 g+2 f+4 e4 | o6 d+4 c+4 o5 b4 a4 | o5 g+2. r4',
    'o3 e2 b2 | o3 a2 e2 | o3 f+2 b2 | o3 e2 b2 | o3 e2 b2 | o3 c+2 a2 | o3 b2 b2 | o3 e2 e2',
    'v4 [h4 h8 h8 h4 h4]8');

  T('spooky', 84,
    '@0 v10 o5 c4 e-4 g4 f+4 | o5 g2 e-4 r4 | o5 a-4 g4 f4 e-4 | o5 d2. r4 | o5 c4 e-4 g4 o6 c4 | o5 b2 a-4 g4 | o5 f4 e-4 d4 o4 b4 | o5 c2. r4',
    '[o2 c2 g2]2 | o2 f2 o3 c2 | o2 g2 d2 | o2 c2 g2 | o2 e-2 g2 | o2 f2 g2 | o2 c2 c2',
    'v4 [k4 r4 h4 r4]8');

  T('clinic', 100,
    '@1 v10 o5 e8 g8 o6 c8 o5 g8 e4 c4 | o5 d8 f8 a8 f8 d2 | o5 f8 a8 o6 c8 o5 a8 f4 d4 | o5 e8 g8 b8 g8 e2 | o5 e8 g8 o6 c8 e8 d4 c4 | o5 a8 b8 o6 c8 o5 a8 g2 | o5 f8 e8 d8 f8 e4 d4 | o5 c2. r4',
    'o3 c2 g2 | o3 d2 a2 | o3 f2 c2 | o3 e2 b2 | o3 c2 e2 | o3 f2 g2 | o3 d2 g2 | o3 c2 c2');

  T('shop', 120,
    '@2 v10 o5 g8 b8 o6 d8 o5 b8 o6 c8 e8 d4 | o5 a8 o6 c8 e8 c8 o5 b8 o6 d8 c4 | o5 b8 g8 a8 f+8 g4 b4 | o5 a8 f+8 d8 f+8 g2',
    'o3 g4 o4 d4 o3 c4 o4 c4 | o3 d4 a4 g4 d4 | o3 e4 b4 d4 a4 | o3 d4 a4 g4 r4',
    'l8 v7 [k h s h]8');

  T('ruins', 90,
    '@0 v10 o5 d4 f4 a4 g4 | o5 f2 e2 | o5 d4 a4 o6 c4 o5 b4 | o5 a2. r4 | o5 g4 b4 o6 d4 c4 | o5 b2 a2 | o5 g4 f4 e4 f4 | o5 d2. r4',
    'o3 d1 | o3 c1 | o3 d1 | o3 a1 | o3 g1 | o3 g1 | o3 c1 | o3 d1',
    'v3 [h2 h4 h4]8');

  // ---- battle ----
  T('wild', 150,
    '@2 v12 o5 e16 f+16 g16 a16 b8 o6 e8 d8 o5 b8 a8 g8 | o5 f+8 g8 a8 f+8 e4 d+4 | o5 e16 f+16 g16 a16 b8 o6 e8 f+8 g8 f+8 e8 | o6 d+4 c8 o5 b8 b2 | o6 e8 d8 c8 o5 b8 a8 g8 f+8 e8 | o5 a8 b8 o6 c8 d8 e4 o5 b4 | o6 c8 o5 b8 a8 g8 f+8 g8 a8 f+8 | o5 g4 f+4 e4 d+4',
    'l8 [o3 e e o4 e o3 e e e o4 e o3 e]2 | o3 c c o4 c o3 c o2 b b o3 b o2 b | o2 b b o3 b o2 b b b o3 b d+ | o3 c c o4 c o3 c c c o4 c o3 c | o3 a a o4 a o3 a g g o4 g o3 g | o3 a a o4 a o3 a b b o4 b o3 b | o2 b b o3 b o2 b b o3 d+ f+ b',
    'l8 v9 [k h s h k k s h]8');

  T('trainer', 156,
    '@2 v12 o5 a8 a8 o6 c8 o5 a8 g8 a8 o6 e4 | o6 d8 c8 o5 b8 a8 g4 e4 | o5 f8 f8 a8 f8 e8 f8 o6 d4 | o6 c8 o5 b8 a8 g+8 a2 | o6 e8 e8 d8 c8 d8 e8 f4 | o6 e8 d8 c8 o5 b8 o6 c4 o5 a4 | o5 f8 g8 a8 b8 o6 c8 d8 e4 | o6 e8 d8 c8 o5 b8 g+2',
    'l8 o3 a a o4 a o3 a a a o4 a o3 a | o3 g g o4 g o3 g e e o4 e o3 e | o3 f f o4 f o3 f d d o4 d o3 d | o3 e e o4 e o3 e e e g+ e | o3 a a o4 a o3 a f f o4 f o3 f | o3 c c o4 c o3 c a a o4 a o3 a | o3 d d o4 d o3 d e e o4 e o3 e | o3 e e o4 e o3 e g+ e b g+',
    'l8 v9 [k h s k k h s h]8');

  T('gym', 162,
    '@2 v13 o5 d8 f8 a8 o6 d8 c8 o5 a8 f8 a8 | o5 g8 b-8 o6 d8 g8 f8 d8 o5 b-8 o6 d8 | o6 e8 c+8 o5 a8 o6 c+8 e8 g8 f8 e8 | o6 f4 e4 d4 c+4 | o6 d8 d8 f8 d8 c8 d8 o5 a4 | o5 b-8 o6 c8 d8 f8 g4 f8 e8 | o6 f8 e8 d8 c+8 d8 e8 f8 g8 | o6 a4 g+4 a2',
    'l8 o3 d d o4 d o3 d d d o4 d o3 d | o3 g g o4 g o3 g g g o4 g o3 g | o3 a a o4 a o3 a a a o4 a o3 a | o3 a a g g f f e e | o3 d d o4 d o3 d f f o4 f o3 f | o3 g g o4 g o3 g e e o4 e o3 e | o3 a a o4 a o3 a a a o4 a o3 a | o3 a4 o2 a4 o3 d4 o2 a4',
    'v9 [k8 k8 s8 h8 k8 h8 s8 s16 s16]8');

  T('rival', 158,
    '@2 v12 o5 b8 o6 e8 g+8 b8 a8 g+8 f+8 e8 | o6 f+8 g+8 a8 f+8 e4 c+4 | o5 a8 o6 c+8 e8 a8 g+8 f+8 e8 d+8 | o6 e4 f+4 g+2 | o6 b8 a8 g+8 f+8 e8 f+8 g+8 a8 | o6 g+8 f+8 e8 d+8 c+4 o5 b4 | o5 a8 b8 o6 c+8 d+8 e8 f+8 g+8 a8 | o6 b4 a4 g+4 f+4',
    'l8 o3 e e o4 e o3 e e e o4 e o3 e | o3 a a o4 a o3 a a a o4 a o3 a | o3 f+ f+ o4 f+ o3 f+ b b o4 b o3 b | o3 e e f+ f+ g+ g+ b b | o3 e e o4 e o3 e c+ c+ o4 c+ o3 c+ | o3 a a o4 a o3 a f+ f+ o4 f+ o3 f+ | o3 b b o4 b o3 b b b o4 b o3 b | o3 b4 a4 g+4 f+4',
    'l8 v9 [k h s h k k s h]8');

  T('syndicate', 140,
    '@0 v12 o5 c8 c8 e-8 c8 f+8 g8 o6 c4 | o5 b-8 a-8 g8 f8 g2 | o5 c8 c8 e-8 c8 f+8 g8 o6 e-4 | o6 d8 c8 o5 b-8 a-8 g2 | o6 c4 o5 b4 a-4 g4 | o5 f8 g8 a-8 f8 g2 | o5 e-8 f8 g8 e-8 d8 e-8 f8 d8 | o5 c2 o4 b4 g4',
    'l8 [o2 c c c c c c c c]2 | o2 a- a- a- a- g g g g | o2 g g g g g g b b | o2 c c c c c c c c | o2 f f f f g g g g | o2 a- a- a- a- b- b- b- b- | o2 g g g g g g g g',
    'l8 v9 [k h k h s h k h]8');

  T('legend', 146,
    '@2 v13 o5 d4. a8 a4 g8 f8 | o5 g4. o6 d8 d4 c8 o5 b-8 | o5 a4. o6 e8 e4 f8 g8 | o6 a2 g4 e4 | o6 f4. e8 d4 c8 o5 b-8 | o5 a4. b-8 o6 c4 d4 | o6 e8 f8 g8 e8 f4 c+4 | o6 d2. r4',
    'l8 o2 d a o3 d o2 a d a o3 d o2 a | o2 g o3 d g d o2 g o3 d g d | o2 a o3 e a e o2 a o3 e a e | o2 a o3 e a e c+ e a e | o2 b- o3 f b- f o2 b- o3 f b- f | o3 f c f c f c f c | o2 a o3 e a e o2 a o3 c+ e a | o2 d a o3 d f a4 r4',
    'v9 [k4 s8 k8 k8 k8 s4]8');

  T('league', 130,
    '@2 v12 o5 g4 o6 c4 e4. d8 | o6 c4 o5 a4 g2 | o5 f4 a4 o6 d4. c8 | o5 b2. r4 | o5 g4 o6 c4 e4. f8 | o6 g4 e4 c4 o5 a4 | o6 f8 e8 d8 c8 o5 b4 o6 d4 | o6 c2. r4',
    'o3 c4 g4 e4 g4 | o3 f4 a4 e4 g4 | o3 d4 a4 f4 a4 | o3 g4 d4 g4 b4 | o3 c4 g4 e4 g4 | o3 e4 b4 a4 o4 c4 | o3 d4 a4 g4 b4 | o3 c4 g4 c4 r4',
    'v8 [k4 h8 h8 s4 k8 h8]8');

  T('champion', 168,
    '@2 v13 o6 a8 g8 e8 d8 e8 g8 a4 | o6 c8 d8 e8 d8 c8 o5 b8 a4 | o5 f8 a8 o6 c8 f8 e8 d8 c8 o5 b8 | o6 c4 o5 b4 g+2 | o6 a8 b8 o7 c8 o6 b8 a8 g8 e4 | o6 f8 g8 a8 g8 f8 e8 d4 | o6 e8 f8 g8 a8 b8 o7 c8 d8 e8 | o7 e4 d4 c4 o6 b4',
    'l8 o3 a a o4 a o3 a g g o4 g o3 g | o3 f f o4 f o3 f e e o4 e o3 e | o3 d d o4 d o3 d f f o4 f o3 f | o3 e e o4 e o3 e e e g+ b | o3 a a o4 a o3 a c c o4 c o3 c | o3 d d o4 d o3 d g g o4 g o3 g | o3 c c o4 c o3 c e e o4 e o3 e | o3 e e f f g g g+ g+',
    'l8 v10 [k h s k k h s s]8');

  T('encounter', 150,
    '@2 v12 o5 e8 g8 b8 o6 e8 d+8 o5 b8 g8 f+8 | o5 e8 g8 b8 o6 e8 f+8 g8 f+4',
    'l8 [o3 e e o4 e o3 e]4',
    'l8 v9 [k h s h]4');
  M.eyes = M.encounter;

  T('evolve', 120,
    '@1 v11 l8 [o5 c e g o6 c o5 g e c e]2 [o5 d f a o6 d o5 a f d f]2 [o5 e g b o6 e o5 b g e g]2 [o5 f a o6 c f c o5 a f a]2',
    'o3 c1 | o3 c1 | o3 d1 | o3 d1 | o3 e1 | o3 e1 | o3 f1 | o3 f1',
    'v4 l8 [h h h h h h h h]8');

  var v = T('victory', 140,
    '@2 v12 o5 g8 g8 g8 o6 c4 o5 g8 o6 c8 e8 | o6 g2. r4 | o6 f8 e8 d8 e8 c4 d8 e8 | o6 c2 r2',
    'o3 c4 e4 g4 c4 | o3 e4 g4 o4 c4 r4 | o3 f4 a4 g4 b4 | o3 c2 r2',
    'v9 k8 k8 k8 s4 k8 s4 | k4 s4 k4 r4 | l8 k h s h k h s h | k2 r2');
  v.once = true;

  PK.MUSIC = M;
})();

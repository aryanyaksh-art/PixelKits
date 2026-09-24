// Overworld character sprites (16x16) built from original templates + palettes.
(function () {
  'use strict';
  var PK = window.PK;

  var HEADS = {
    short: {
      down: ['....oooooooo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhHhhhhHhho..', '..oHssssssssHo..'],
      up: ['....oooooooo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohhhhhhhhhho..', '..ohHhhhhhhHho..'],
      side: ['.....oooooo.....', '....ohhhhhhoo...', '...ohhhhhhhhho..', '...ohhhhhhhhho..', '...ohhhhhhhHho..', '...oHsssshhhho..']
    },
    cap: {
      down: ['....oooooooo....', '...obbbbbbbbo...', '..obbbbwwbbbbo..', '..obbbbbbbbbbo..', '..oBBBBBBBBBBo..', '..ohssssssssho..'],
      up: ['....oooooooo....', '...obbbbbbbbo...', '..obbbbbbbbbbo..', '..obbbbbbbbbbo..', '..oBbbbbbbbbBo..', '..ohHhhhhhhHho..'],
      side: ['.....oooooo.....', '....obbbbbboo...', '...obbbbbbbbbo..', '...obbbbbbbbbo..', '.oBBBBBBbbbbbo..', '...ohsssshhhho..']
    },
    long: {
      down: ['....oooooooo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..', '.ohhhhhhhhhhhho.', '.ohhHhhhhhhHhho.', '.ohHssssssssHho.'],
      up: ['....oooooooo....', '...ohhhhhhhho...', '..ohhhhhhhhhho..', '.ohhhhhhhhhhhho.', '.ohhhhhhhhhhhho.', '.ohhHhhhhhhhHho.'],
      side: ['.....oooooo.....', '....ohhhhhhoo...', '...ohhhhhhhhho..', '...ohhhhhhhhhho.', '...ohhhhhhhHhho.', '...oHsssshhhhho.']
    },
    bald: {
      down: ['....oooooooo....', '...osssssssso...', '..osssssssssso..', '..ossswsssssso..', '..ohsssssssssho.', '..ohssssssssho..'],
      up: ['....oooooooo....', '...osssssssso...', '..osssssssssso..', '..osssssssssso..', '..ohhsssssshho..', '..ohhhhhhhhhho..'],
      side: ['.....oooooo.....', '....osssssssoo..', '...ossssssssso..', '...osswssssssso.', '...osssssshhho..', '...oSssssshhho..']
    },
    spiky: {
      down: ['...o.o.oo.o.o...', '..ohohhhhhhoho..', '..ohhhhhhhhhho..', '.ohhhhhhhhhhhho.', '..ohhHhhhhHhho..', '..oHssssssssHo..'],
      up: ['...o.o.oo.o.o...', '..ohohhhhhhoho..', '..ohhhhhhhhhho..', '.ohhhhhhhhhhhho.', '..ohhhhhhhhhho..', '..ohHhhhhhhHho..'],
      side: ['....o.o.o.o.....', '...ohohhhhhoo...', '...ohhhhhhhhho..', '..ohhhhhhhhhhho.', '...ohhhhhhhHho..', '...oHsssshhhho..']
    }
  };
  // rows 6..15 (face lower + body)
  var LONGSIDES = { down: ['.oh', 'ho.'], side: ['', 'ho.'] };
  var BODY = {
    down: [
      '..ossessssesso..', '..ossessssesso..', '...oSsssssssSo..',
      '...oCcccccccCo..', '..osCccccccCso..', '..osCccccccCso..',
      '...oPppppppPo...', '...oPppooppPo...', '...offfoofffo...', '....ooo..ooo....'
    ],
    downWalk: [
      '..ossessssesso..', '..ossessssesso..', '...oSsssssssSo..',
      '...oCcccccccCo..', '..osCccccccCso..', '..oCcccccccCsso.',
      '...oPppppppPo...', '...oPppooppPo...', '...offfo.offfo..', '....ooo...ooo...'
    ],
    up: [
      '..oHhhhhhhhhHo..', '...oHHHHHHHHo...', '....oSSSSSSo....',
      '...oCcccccccCo..', '..osCccccccCso..', '..osCccccccCso..',
      '...oPppppppPo...', '...oPppooppPo...', '...offfoofffo...', '....ooo..ooo....'
    ],
    upWalk: [
      '..oHhhhhhhhhHo..', '...oHHHHHHHHo...', '....oSSSSSSo....',
      '...oCcccccccCo..', '..osCccccccCso..', '.ossCccccccCo...',
      '...oPppppppPo...', '...oPppooppPo...', '..offfo.offfo...', '...ooo...ooo....'
    ],
    side: [
      '..oseSssshhHo...', '..osesssssSHo...', '...oSsssssSo....',
      '....oCcccCo.....', '....oCcscCCo....', '....oCcsccCo....',
      '....oPppppPo....', '....oPppppPo....', '...offffffo.....', '....oooooo......'
    ],
    sideWalk: [
      '..oseSssshhHo...', '..osesssssSHo...', '...oSsssssSo....',
      '....oCcccCo.....', '...oCcscCCCo....', '....oCcccsCo....',
      '....oPppppPo....', '...oPpo.oPpo....', '..offfo..offfo..', '...ooo....ooo...'
    ]
  };

  var OUT = '#241c2c';
  var BASE_PAL = {
    o: OUT, w: '#ffffff', e: '#241c2c',
    h: '#5a3a2a', H: '#3a2418', s: '#f8d0a8', S: '#d8a078',
    c: '#4a78c8', C: '#2e4e90', p: '#384058', P: '#242a3c', f: '#5a4030', b: '#d84040', B: '#982828'
  };

  // Named palettes for characters
  var PALS = {
    player: { head: 'cap', b: '#26a896', B: '#15705f', w: '#f4f4f4', h: '#3a2a22', H: '#241812', c: '#f08a30', C: '#b85a18', p: '#2c3a60', P: '#1c2640', f: '#3a3a44' },
    rival: { head: 'spiky', h: '#6a4ab0', H: '#422a7a', c: '#3aa860', C: '#257040', p: '#4a4a52', P: '#303036', f: '#6a3a2a' },
    mom: { head: 'long', h: '#a0522d', H: '#6e3418', c: '#e87a9a', C: '#b8506e', p: '#5a6aa8', P: '#3c4a80' },
    prof: { head: 'long', h: '#c8c8d4', H: '#9090a4', c: '#f4f4f8', C: '#c0c4d4', p: '#4a5a7a', P: '#34405a', f: '#3a3a44' },
    nurse: { head: 'long', h: '#f0a0c0', H: '#c87098', c: '#f4fbf8', C: '#9ad8c8', p: '#e0f0ea', P: '#a8d0c4', f: '#f0f0f0' },
    clerk: { head: 'cap', b: '#3a9a50', B: '#246a34', c: '#f4f4f4', C: '#c8c8c8', p: '#3a6a44', P: '#244a2c' },
    agent: { head: 'cap', b: '#2a2434', B: '#141018', w: '#e04a6a', c: '#3c3448', C: '#262030', p: '#2a2434', P: '#18141e', f: '#141018' },
    captain: { head: 'spiky', h: '#e04a6a', H: '#a02a44', c: '#2a2434', C: '#161218', p: '#3c3448', P: '#262030', f: '#141018' },
    boss: { head: 'short', h: '#e8e8f0', H: '#a0a0b8', c: '#1e1a28', C: '#0e0c14', p: '#2a2434', P: '#18141e', f: '#e04a6a' },
    oldman: { head: 'bald', h: '#c8c8c8', H: '#989898', c: '#8a6a4a', C: '#604a30', p: '#5a5a5a', P: '#3a3a3a' },
    oldwoman: { head: 'long', h: '#d8d8e0', H: '#a8a8b8', c: '#9a6ab0', C: '#6e4488', p: '#6e4488', P: '#4a2c60' },
    boy: { head: 'short', h: '#2a2a2a', H: '#141414', c: '#e04848', C: '#a02c2c', p: '#4a6ac0', P: '#2e4890' },
    girl: { head: 'long', h: '#e8a040', H: '#b87020', c: '#f070a8', C: '#b84478', p: '#f4f4f4', P: '#c8c8d0' },
    kid: { head: 'cap', b: '#4a88e0', B: '#2c5aa8', c: '#f8d040', C: '#c09a20', p: '#6a8a40', P: '#4a6a28' },
    hiker: { head: 'cap', b: '#8a6a3a', B: '#5a4424', c: '#c85a3a', C: '#8e3a22', p: '#6a5a3a', P: '#4a3e24', h: '#3a2a1a' },
    scholar: { head: 'short', h: '#4a3a2a', H: '#2a2018', c: '#6a4aa0', C: '#4a2e78', p: '#3a3a4a', P: '#24242e' },
    swimmer: { head: 'short', h: '#f0d040', H: '#c0a020', s: '#e8b888', S: '#c08860', c: '#e8b888', C: '#c08860', p: '#2a78d8', P: '#1a54a0', f: '#e8b888' },
    brawler: { head: 'spiky', h: '#1a1a1a', H: '#000000', c: '#f4f4f4', C: '#c8c8c8', p: '#f4f4f4', P: '#c8c8c8', f: '#6a3a1a' },
    mystic: { head: 'long', h: '#4a2a6a', H: '#2e1848', c: '#8a4ac0', C: '#5e2e8a', p: '#8a4ac0', P: '#5e2e8a' },
    skier: { head: 'cap', b: '#e8e8f8', B: '#b0b0c8', c: '#3a8ae0', C: '#2460a8', p: '#e04848', P: '#a02c2c' },
    sailor: { head: 'cap', b: '#f4f4f4', B: '#c0c0c8', c: '#f4f4f4', C: '#3a5a9a', p: '#2a3a6a', P: '#1a2448' },
    worker: { head: 'cap', b: '#f0c030', B: '#b88a18', c: '#e07830', C: '#a8501a', p: '#4a5a8a', P: '#303c60' },
    occult: { head: 'long', h: '#1a1a24', H: '#0a0a10', s: '#e8dce8', S: '#b8a8c0', c: '#2a2a3a', C: '#16161e', p: '#2a2a3a', P: '#16161e' },
    // gym wardens & council & champion
    fenna: { head: 'long', h: '#5aa040', H: '#3a7028', c: '#e8d070', C: '#b09a40', p: '#4a7a3a', P: '#2e5424' },
    gideon: { head: 'bald', h: '#6a4a2a', H: '#4a3018', s: '#c89468', S: '#a06c44', c: '#9a7a5a', C: '#6a5238', p: '#5a4a3a', P: '#3a3024' },
    juno: { head: 'spiky', h: '#f0e040', H: '#c0a818', c: '#2a2a3a', C: '#16161e', p: '#f0e040', P: '#b0a020' },
    marisol: { head: 'long', h: '#2a78d0', H: '#1a54a0', c: '#f4f8ff', C: '#a8c8f0', p: '#2a78d0', P: '#1a54a0' },
    ignatius: { head: 'spiky', h: '#e85a2a', H: '#b0381a', c: '#3a2a2a', C: '#221818', p: '#8a2a1a', P: '#5a1a10' },
    celestine: { head: 'long', h: '#e070c0', H: '#a84890', c: '#6a3ab0', C: '#48227e', p: '#6a3ab0', P: '#48227e' },
    bjorn: { head: 'short', h: '#e8e8f0', H: '#a8b0c8', c: '#6aa8e0', C: '#3e78b0', p: '#3a4a6a', P: '#24304a' },
    morwen: { head: 'long', h: '#2a1a3a', H: '#140a1e', s: '#e8e0ec', S: '#c0b0cc', c: '#3a2a5a', C: '#22163a', p: '#3a2a5a', P: '#22163a' },
    dax: { head: 'short', h: '#1a1a1a', H: '#000000', s: '#a8744a', S: '#80522e', c: '#d83a3a', C: '#982424', p: '#2a2a2a', P: '#141414' },
    hemlock: { head: 'long', h: '#6a2a8a', H: '#461a5e', c: '#5a8a3a', C: '#3a6024', p: '#3a2a4a', P: '#241a30' },
    orrin: { head: 'short', h: '#8a8a9a', H: '#5a5a6a', c: '#a8b0c0', C: '#7a8294', p: '#4a5060', P: '#30343e' },
    sable: { head: 'long', h: '#1a2a4a', H: '#0e162a', c: '#3a6a8a', C: '#244a64', p: '#1a2a4a', P: '#0e162a' },
    castor: { head: 'short', h: '#f0c040', H: '#c09020', c: '#f4f0e8', C: '#c8b890', p: '#2a2a4a', P: '#18182e', f: '#8a2a3a' }
  };
  PK.CHAR_PALS = PALS;

  function buildFrame(style, dir, walk, pal) {
    var head = HEADS[style] || HEADS.short;
    var hd = dir === 'side' ? head.side : dir === 'up' ? head.up : head.down;
    var bodyKey = dir + (walk ? 'Walk' : '');
    var rows = hd.concat(BODY[bodyKey]);
    if (style === 'long' && dir !== 'up') {
      rows = rows.slice();
      for (var r = 6; r <= 9; r++) {
        var row = rows[r].split('');
        if (dir === 'down') { if (row[1] === '.') row[1] = 'h'; if (row[14] === '.') row[14] = 'h'; }
        else { if (row[12] === '.' || row[12] === 'o') row[12] = 'h'; if (row[13] === '.') row[13] = 'o'; }
        rows[r] = row.join('');
      }
    }
    if (style === 'long' && dir === 'up') {
      rows = rows.slice();
      rows[6] = '.ohHhhhhhhhhHho.'; rows[7] = '.ohhhhhhhhhhhho.'; rows[8] = '..ohhhhhhhhhho..';
    }
    var c = PK.makeCanvas(16, 16);
    PK.paintRows(c.getContext('2d'), rows, pal);
    return c;
  }

  var cache = {};
  // Returns {down:[stand, walkA, walkB], up:[...], left:[...], right:[...]}
  function sprite(name) {
    if (cache[name]) return cache[name];
    var p = PALS[name] || PALS.boy;
    var pal = Object.assign({}, BASE_PAL, p);
    var st = p.head || 'short';
    var d0 = buildFrame(st, 'down', false, pal), d1 = buildFrame(st, 'down', true, pal);
    var u0 = buildFrame(st, 'up', false, pal), u1 = buildFrame(st, 'up', true, pal);
    var l0 = buildFrame(st, 'side', false, pal), l1 = buildFrame(st, 'side', true, pal);
    var s = {
      down: [d0, d1, PK.flipCanvas(d1)],
      up: [u0, u1, PK.flipCanvas(u1)],
      left: [l0, l1, l1],
      right: [PK.flipCanvas(l0), PK.flipCanvas(l1), PK.flipCanvas(l1)]
    };
    cache[name] = s;
    return s;
  }

  // Large portrait for battle intros (nearest-neighbour scaled front sprite)
  function portrait(name, scale, dir) {
    var key = name + '|p|' + scale + '|' + (dir || 'down');
    if (cache[key]) return cache[key];
    var s = sprite(name)[dir || 'down'][0];
    var c = PK.makeCanvas(16 * scale, 16 * scale);
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(s, 0, 0, 16 * scale, 16 * scale);
    cache[key] = c;
    return c;
  }

  function emote(ctx, x, y, ch) {
    PK.ui.box(ctx, x, y, 12, 13);
    PK.font.draw(ctx, ch || '!', x + (ch === '?' ? 4 : 5), y + 3, '#d84c3c');
  }

  PK.chars = { sprite: sprite, portrait: portrait, emote: emote, PALS: PALS };
})();

// Overworld character sprites (16x22, GBA-era proportions) built from original layered templates.
// Layers: body + head + hair/hat. Fills only; a dark outline is added automatically.
(function () {
  'use strict';
  var PK = window.PK;
  var CW = 16, CH = 22;

  // letters: s skin, S skin shade, e eye, w white, h hair, H hair shade, b hat, B hat shade,
  // c shirt, C shirt shade, a accent (strap/belt/scarf), p pants, P pants shade, f shoes, k bag
  var HEAD = {
    down: [
      '................', '................', '.....ssssss.....', '....ssssssss....', '...ssssssssss...', '...ssssssssss...',
      '...ssessssess...', '...ssessssess...', '...SsssssssssS..', '....SssssssS....'
    ],
    up: [
      '................', '................', '.....ssssss.....', '....ssssssss....', '...ssssssssss...', '...ssssssssss...',
      '...ssssssssss...', '...ssssssssss...', '...SssssssssS...', '....SSSSSSSS....'
    ],
    side: [
      '................', '................', '.....ssssss.....', '....ssssssss....', '....sssssssss...', '....sssssssss...',
      '....ssssssesss..', '....ssssssesss..', '....Sssssssss...', '.....SSssssS....'
    ]
  };
  // hair / hat overlays over the head rows (10 rows; long hair continues onto the shoulders)
  var HAIR = {
    short: {
      down: ['................', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhHhhhhHhhh..', '..hh........hh..', '..h..........h..'],
      up: ['................', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '...HhhhhhhhhH...'],
      side: ['................', '....hhhhhhh.....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhHhhh...', '..hhhhhh........', '..hhhhh.........', '...hhh..........']
    },
    cap: {
      down: ['................', '....bbbbbbbb....', '...bbbbwwbbbb...', '..bbbbbwwbbbbb..', '..BBBBBBBBBBBB..', '..hh........hh..', '..h..........h..'],
      up: ['................', '....bbbbbbbb....', '...bbbbbbbbbb...', '..bbbbbbbbbbbb..', '..BbbbbbbbbbbB..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '...HhhhhhhhhH...'],
      side: ['................', '....bbbbbbb.....', '...bbbbbwwbb....', '..bbbbbbbbbbb...', '..hhhBBBBBBBBBB.', '..hhhhhh........', '..hhhhh.........', '...hhh..........']
    },
    long: {
      down: ['................', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhH....Hhhh..', '..hh........hh..', '..hh........hh..', '..hh........hh..', '..hhh......hhh..', '..hh........hh..', '..hh........hh..'],
      up: ['................', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...HhhhhhhhhH...'],
      side: ['................', '....hhhhhhh.....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhHhhh...', '..hhhhhh........', '..hhhhh.........', '..hhhhh.........', '..hhhhh.........', '..hhhhh.........', '..hhhh..........', '..hhhh..........']
    },
    spiky: {
      down: ['...h..hh..h..h..', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.', '..hhhhhhhhhhhh..', '.hhhHhhhhhHhhhh.', '..hh........hh..', '..h..........h..'],
      up: ['...h..hh..h..h..', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhhh.', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '...HhhhhhhhhH...'],
      side: ['....h..h..h.....', '...hhhhhhhhh....', '..hhhhhhhhhhhh..', '.hhhhhhhhhhhhh..', '..hhhhhhhHhhhh..', '.hhhhhhh........', '..hhhhh.........', '...hhh..........']
    },
    bald: {
      down: ['................', '................', '................', '................', '................', '..hh........hh..', '..hh........hh..'],
      up: ['................', '................', '................', '................', '................', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...'],
      side: ['................', '................', '................', '................', '................', '...hhhh.........', '...hhhh.........', '....hh..........']
    },
    bun: {
      down: ['.....hhhhhh.....', '....hhhhhhhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhHhhhhHhhh..', '..hh........hh..', '..h..........h..'],
      up: ['.....hhhhhh.....', '....hhHHHHhh....', '...hhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '..hhhhhhhhhhhh..', '...hhhhhhhhhh...', '...HhhhhhhhhH...'],
      side: ['..hhh...........', '.hhhhhhhhhh.....', '..hhhhhhhhhhh...', '..hhhhhhhhhhhh..', '..hhhhhhhHhhh...', '..hhhhhh........', '..hhhhh.........', '...hhh..........']
    },
    hood: {
      down: ['.....bbbbbb.....', '....bbbbbbbb....', '...bbbbbbbbbb...', '..bbbbbbbbbbbb..', '..bbbhhhhhhbbb..', '..bbh......hbb..', '..bb........bb..', '..bb........bb..', '..BB........BB..'],
      up: ['.....bbbbbb.....', '....bbbbbbbb....', '...bbbbbbbbbb...', '..bbbbbbbbbbbb..', '..bbbbbbbbbbbb..', '..bbbbbbbbbbbb..', '..bbbbbbbbbbbb..', '..bbbbbbbbbbbb..', '..BBBBBBBBBBBB..'],
      side: ['.....bbbbbb.....', '....bbbbbbbbb...', '...bbbbbbbbbbb..', '..bbbbbbbbbbbb..', '..bbbbbbbhhhbb..', '..bbbbbb........', '..bbbbb.........', '..bbbbb.........', '..BBBB..........']
    }
  };
  // bodies: rows 10..21 (12 rows). frames: stand, walk
  var BODY = {
    down: [
      ['....cccccccc....', '...ccccccccccc..', '..cccccccccccCc.', '..ccccccccccCCc.', '..sccccccccCCCs.', '..saaaaaaaaaaas.', '...ppppppppppP..', '...pppppppppPP..', '...ppppPPpppPP..', '...pppP..pppPP..', '...fff....fff...', '................'],
      ['....cccccccc....', '...ccccccccccc..', '..cccccccccccCc.', '..ccccccccccCCc.', '..sccccccccCCCs.', '..saaaaaaaaaaas.', '...ppppppppppP..', '...pppppppppPP..', '...ppppPP.pppP..', '...fffP...pppP..', '..........fff...', '................']
    ],
    up: [
      ['....cccccccc....', '...ccccccccccc..', '..cccccccccccCc.', '..ccckkkkkkccCc.', '..scckkkkkkccCs.', '..sCckkkkkkcCCs.', '...ppppppppppP..', '...pppppppppPP..', '...ppppPPpppPP..', '...pppP..pppPP..', '...fff....fff...', '................'],
      ['....cccccccc....', '...ccccccccccc..', '..cccccccccccCc.', '..ccckkkkkkccCc.', '..scckkkkkkccCs.', '..sCckkkkkkcCCs.', '...ppppppppppP..', '...pppppppppPP..', '...pppP.PPpppP..', '...pppP...fffP..', '...fff..........', '................']
    ],
    side: [
      ['.....cccccc.....', '....ccccccccc...', '....ccccccccc...', '....ckkcccccC...', '....ckkcsccCC...', '....kkaaaaaaa...', '.....pppppPP....', '.....pppppPP....', '.....pppppPP....', '.....ppppPP.....', '.....fffff......', '................'],
      ['.....cccccc.....', '....ccccccccc...', '...cccccccccC...', '...sckkcccccC...', '....ckkccccCs...', '....ckkcccCC....', '.....pppppPP....', '....ppppPPPP....', '...pppP..pPPP...', '...ppP....pPP...', '..fff.....fff...', '................']
    ]
  };
  // skirt / robe variants for some characters
  var DRESS = {
    down: ['...cccccccccCC..', '...cccccccccCC..', '..ccccccccccCCC.', '..cccccccccCCCC.', '...ss......ss...', '...ff......ff...', '................'],
    up: ['...cccccccccCC..', '...cccccccccCC..', '..ccccccccccCCC.', '..cccccccccCCCC.', '...ss......ss...', '...ff......ff...', '................'],
    side: ['.....cccccCC....', '....ccccccCCC...', '....ccccccCCC...', '....cccccCCCC...', '.....ss..ss.....', '.....ff..ff.....', '................']
  };

  var OUT = '#20182a';
  var BASE_PAL = {
    e: '#20182a', w: '#ffffff', h: '#5a3a2a', H: '#3a2418', s: '#f8d0a8', S: '#e0a880',
    c: '#4a78c8', C: '#2e4e90', a: '#383040', p: '#384058', P: '#242a3c', f: '#4a3a34', b: '#d84040', B: '#982828', k: '#c8a040'
  };

  // Named palettes for characters (all original outfits)
  var PALS = {
    player: { head: 'cap', b: '#e8f0f8', B: '#9aa8c0', w: '#26a896', h: '#3a2a22', H: '#241812', c: '#26a896', C: '#15705f', a: '#f4f4f4', p: '#2c3a60', P: '#1c2640', f: '#e04848', k: '#f0a030' },
    rival: { head: 'spiky', h: '#6a4ab0', H: '#422a7a', c: '#3aa860', C: '#257040', a: '#f4f4f4', p: '#4a4a52', P: '#303036', f: '#6a3a2a', k: '#4a4a52' },
    mom: { head: 'bun', dress: 1, h: '#a0522d', H: '#6e3418', c: '#e87a9a', C: '#b8506e' },
    prof: { head: 'long', h: '#c8c8d4', H: '#9090a4', c: '#f4f4f8', C: '#c0c4d4', a: '#4a8a78', p: '#4a5a7a', P: '#34405a', f: '#3a3a44', k: '#f4f4f8' },
    nurse: { head: 'bun', dress: 1, h: '#f0a0c0', H: '#c87098', c: '#f4fbf8', C: '#9ad8c8', f: '#f0f0f0' },
    clerk: { head: 'cap', b: '#3a9a50', B: '#246a34', w: '#f4f4f4', c: '#f4f4f4', C: '#c8c8c8', a: '#3a9a50', p: '#3a6a44', P: '#244a2c', k: '#f4f4f4' },
    agent: { head: 'hood', b: '#2a2434', B: '#141018', h: '#141018', c: '#3c3448', C: '#262030', a: '#e04a6a', p: '#2a2434', P: '#18141e', f: '#141018', k: '#3c3448' },
    captain: { head: 'spiky', h: '#e04a6a', H: '#a02a44', c: '#2a2434', C: '#161218', a: '#e04a6a', p: '#3c3448', P: '#262030', f: '#141018', k: '#2a2434' },
    boss: { head: 'short', h: '#e8e8f0', H: '#a0a0b8', c: '#1e1a28', C: '#0e0c14', a: '#e04a6a', p: '#2a2434', P: '#18141e', f: '#e04a6a', k: '#1e1a28' },
    oldman: { head: 'bald', h: '#d8d8d8', H: '#a8a8a8', c: '#8a6a4a', C: '#604a30', a: '#604a30', p: '#5a5a5a', P: '#3a3a3a', k: '#8a6a4a' },
    oldwoman: { head: 'bun', dress: 1, h: '#d8d8e0', H: '#a8a8b8', c: '#9a6ab0', C: '#6e4488' },
    boy: { head: 'short', h: '#2a2a2a', H: '#141414', c: '#e04848', C: '#a02c2c', a: '#f4f4f4', p: '#4a6ac0', P: '#2e4890', k: '#e0c040' },
    girl: { head: 'long', dress: 1, h: '#e8a040', H: '#b87020', c: '#f070a8', C: '#b84478' },
    kid: { head: 'cap', b: '#4a88e0', B: '#2c5aa8', w: '#f8d040', c: '#f8d040', C: '#c09a20', a: '#4a88e0', p: '#6a8a40', P: '#4a6a28', k: '#4a88e0' },
    hiker: { head: 'cap', b: '#8a6a3a', B: '#5a4424', w: '#c85a3a', c: '#c85a3a', C: '#8e3a22', a: '#5a4424', p: '#6a5a3a', P: '#4a3e24', h: '#3a2a1a', k: '#6a8a40' },
    scholar: { head: 'short', h: '#4a3a2a', H: '#2a2018', c: '#6a4aa0', C: '#4a2e78', a: '#e8d8a0', p: '#3a3a4a', P: '#24242e', k: '#8a6a4a' },
    swimmer: { head: 'short', h: '#f0d040', H: '#c0a020', s: '#e8b888', S: '#c08860', c: '#2a78d8', C: '#1a54a0', a: '#f4f4f4', p: '#2a78d8', P: '#1a54a0', f: '#e8b888', k: '#2a78d8' },
    brawler: { head: 'spiky', h: '#1a1a1a', H: '#000000', c: '#f4f4f4', C: '#c8c8c8', a: '#1a1a1a', p: '#f4f4f4', P: '#c8c8c8', f: '#6a3a1a', k: '#f4f4f4' },
    mystic: { head: 'hood', dress: 1, b: '#8a4ac0', B: '#5e2e8a', h: '#4a2a6a', c: '#8a4ac0', C: '#5e2e8a' },
    skier: { head: 'cap', b: '#e8e8f8', B: '#b0b0c8', w: '#e04848', c: '#3a8ae0', C: '#2460a8', a: '#e04848', p: '#e04848', P: '#a02c2c', k: '#3a8ae0' },
    sailor: { head: 'cap', b: '#f4f4f4', B: '#c0c0c8', w: '#3a5a9a', c: '#f4f4f4', C: '#b8c0d0', a: '#3a5a9a', p: '#2a3a6a', P: '#1a2448', k: '#f4f4f4' },
    worker: { head: 'cap', b: '#f0c030', B: '#b88a18', w: '#e07830', c: '#e07830', C: '#a8501a', a: '#f0c030', p: '#4a5a8a', P: '#303c60', k: '#e07830' },
    occult: { head: 'hood', dress: 1, b: '#2a2a3a', B: '#16161e', h: '#1a1a24', s: '#e8dce8', S: '#b8a8c0', c: '#2a2a3a', C: '#16161e' },
    // gym wardens & council & champion
    fenna: { head: 'long', h: '#5aa040', H: '#3a7028', c: '#e8d070', C: '#b09a40', a: '#4a7a3a', p: '#4a7a3a', P: '#2e5424', k: '#e8d070' },
    gideon: { head: 'bald', h: '#6a4a2a', H: '#4a3018', s: '#c89468', S: '#a06c44', c: '#9a7a5a', C: '#6a5238', a: '#4a3018', p: '#5a4a3a', P: '#3a3024', k: '#9a7a5a' },
    juno: { head: 'spiky', h: '#f0e040', H: '#c0a818', c: '#2a2a3a', C: '#16161e', a: '#f0e040', p: '#f0e040', P: '#b0a020', k: '#2a2a3a' },
    marisol: { head: 'long', dress: 1, h: '#2a78d0', H: '#1a54a0', c: '#f4f8ff', C: '#a8c8f0' },
    ignatius: { head: 'spiky', h: '#e85a2a', H: '#b0381a', c: '#3a2a2a', C: '#221818', a: '#e85a2a', p: '#8a2a1a', P: '#5a1a10', k: '#3a2a2a' },
    celestine: { head: 'long', dress: 1, h: '#e070c0', H: '#a84890', c: '#6a3ab0', C: '#48227e' },
    bjorn: { head: 'short', h: '#e8e8f0', H: '#a8b0c8', c: '#6aa8e0', C: '#3e78b0', a: '#f4f4f4', p: '#3a4a6a', P: '#24304a', k: '#6aa8e0' },
    morwen: { head: 'hood', dress: 1, b: '#3a2a5a', B: '#22163a', h: '#2a1a3a', s: '#e8e0ec', S: '#c0b0cc', c: '#3a2a5a', C: '#22163a' },
    dax: { head: 'short', h: '#1a1a1a', H: '#000000', s: '#a8744a', S: '#80522e', c: '#d83a3a', C: '#982424', a: '#1a1a1a', p: '#2a2a2a', P: '#141414', k: '#d83a3a' },
    hemlock: { head: 'long', h: '#6a2a8a', H: '#461a5e', c: '#5a8a3a', C: '#3a6024', a: '#6a2a8a', p: '#3a2a4a', P: '#241a30', k: '#5a8a3a' },
    orrin: { head: 'short', h: '#8a8a9a', H: '#5a5a6a', c: '#a8b0c0', C: '#7a8294', a: '#4a5060', p: '#4a5060', P: '#30343e', k: '#a8b0c0' },
    sable: { head: 'long', dress: 1, h: '#1a2a4a', H: '#0e162a', c: '#3a6a8a', C: '#244a64' },
    castor: { head: 'short', h: '#f0c040', H: '#c09020', c: '#f4f0e8', C: '#c8b890', a: '#8a2a3a', p: '#2a2a4a', P: '#18182e', f: '#8a2a3a', k: '#f4f0e8' }
  };
  PK.CHAR_PALS = PALS;

  function layer(grid, rows, top) {
    for (var r = 0; r < rows.length; r++) {
      var y = top + r;
      if (y >= CH) break;
      for (var x = 0; x < CW; x++) { var ch = rows[r][x]; if (ch && ch !== '.') grid[y][x] = ch; }
    }
  }
  function buildFrame(p, dir, walk) {
    var grid = [];
    for (var y = 0; y < CH; y++) { grid.push([]); for (var x = 0; x < CW; x++) grid[y].push('.'); }
    var d = dir === 'side' ? 'side' : dir;
    var body = BODY[d][walk ? 1 : 0].slice();
    if (p.dress) {
      // dress replaces the legs; walking just shifts the feet
      var dr = DRESS[d].slice();
      if (walk) dr[5] = d === 'side' ? '....ff....ff....' : '..ff........ff..';
      body = body.slice(0, 5).concat(dr);
    }
    layer(grid, body, 10);
    layer(grid, HEAD[d], 0);
    var hair = HAIR[p.head || 'short'] || HAIR.short;
    layer(grid, hair[d], 0);
    var pal = Object.assign({}, BASE_PAL, p);
    var c = PK.makeCanvas(CW, CH), x2 = c.getContext('2d');
    // auto outline
    x2.fillStyle = OUT;
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      if (grid[y][x] !== '.') continue;
      var n = (y > 0 && grid[y - 1][x] !== '.') || (y < CH - 1 && grid[y + 1][x] !== '.') || (x > 0 && grid[y][x - 1] !== '.') || (x < CW - 1 && grid[y][x + 1] !== '.');
      if (n) x2.fillRect(x, y, 1, 1);
    }
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      var k = grid[y][x];
      if (k === '.') continue;
      x2.fillStyle = pal[k] || '#ff00ff';
      x2.fillRect(x, y, 1, 1);
    }
    return c;
  }

  var cache = {};
  // Returns {down:[stand, walkA, walkB], up:[...], left:[...], right:[...]} (16x22 canvases)
  function sprite(name) {
    if (cache[name]) return cache[name];
    var p = PALS[name] || PALS.boy;
    var d0 = buildFrame(p, 'down', false), d1 = buildFrame(p, 'down', true);
    var u0 = buildFrame(p, 'up', false), u1 = buildFrame(p, 'up', true);
    var l0 = buildFrame(p, 'side', false), l1 = buildFrame(p, 'side', true);
    var s = {
      down: [d0, d1, PK.flipCanvas(d1)],
      up: [u0, u1, PK.flipCanvas(u1)],
      right: [l0, l1, l0],
      left: [PK.flipCanvas(l0), PK.flipCanvas(l1), PK.flipCanvas(l0)]
    };
    cache[name] = s;
    return s;
  }

  // Large portrait for battle intros (nearest-neighbour scaled front sprite)
  function portrait(name, scale, dir) {
    var key = name + '|p|' + scale + '|' + (dir || 'down');
    if (cache[key]) return cache[key];
    var s = sprite(name)[dir || 'down'][0];
    var c = PK.makeCanvas(CW * scale, CH * scale);
    var x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(s, 0, 0, CW * scale, CH * scale);
    cache[key] = c;
    return c;
  }

  // player on the Trail Bike (drawn under/over the rider)
  function drawBike(ctx, x, y, dir, t) {
    var spin = (t >> 2) & 1;
    ctx.fillStyle = OUT;
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(x + 1, y + 15, 6, 6); ctx.fillRect(x + 9, y + 15, 6, 6);
      ctx.fillStyle = '#6a6a78'; ctx.fillRect(x + 2, y + 16, 4, 4); ctx.fillRect(x + 10, y + 16, 4, 4);
      ctx.fillStyle = spin ? '#c8c8d4' : '#9a9aa8'; ctx.fillRect(x + 3, y + 17, 2, 2); ctx.fillRect(x + 11, y + 17, 2, 2);
      ctx.fillStyle = '#e04848'; ctx.fillRect(x + 4, y + 14, 8, 2);
    } else {
      ctx.fillRect(x + 6, y + 13, 4, 9);
      ctx.fillStyle = '#6a6a78'; ctx.fillRect(x + 7, y + 14, 2, 7);
      ctx.fillStyle = spin ? '#c8c8d4' : '#9a9aa8'; ctx.fillRect(x + 7, y + (dir === 'down' ? 19 : 14), 2, 2);
      ctx.fillStyle = '#e04848'; ctx.fillRect(x + 4, y + (dir === 'down' ? 13 : 16), 8, 2);
    }
  }

  function emote(ctx, x, y, ch) {
    PK.ui.box(ctx, x, y, 12, 13);
    PK.font.draw(ctx, ch || '!', x + (ch === '?' ? 4 : 5), y + 3, '#d84c3c');
  }

  PK.chars = { sprite: sprite, portrait: portrait, emote: emote, drawBike: drawBike, PALS: PALS, W: CW, H: CH };
})();

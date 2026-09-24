// Region 1: Verdant Vale
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var D = PK.defMap, IN = PK.interior;
  function flag(f) { return function () { return PK.game.flag(f); }; }
  function crest(i) { return function () { return !!PK.game.state.crests[i]; }; }
  function noCrest(i) { return function () { return !PK.game.state.crests[i]; }; }
  function S(id) { return function (w, n) { return PK.SCRIPTS[id](w, n); }; }

  // ================= Brookhollow =================
  D('brookhollow', {
    name: 'Brookhollow', theme: 'vale', music: 'hometown', region: 'Verdant Vale',
    rows: [
      'TTTTTTTTT::TTTTTTTTT',
      'TTTTTTTTT::TTTTTTTTT',
      'TT,,,....!!....,,,TT',
      'TT..1###.::.2###..TT',
      'TT..####.::.####..TT',
      'TT..####.::.####..TT',
      'TT...:...::..:....TT',
      'TT...:::::::::::..TT',
      'TT..S..........:a,TT',
      'TT.............:..TT',
      'TT,....3######.:..TT',
      'TT.....#######.:..TT',
      'TT.....#######.:..TT',
      'TT.....#######.:..TT',
      'TT.e......::::::..TT',
      'TT,,......::....,,TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT'
    ],
    buildings: [{ k: 'house', to: 'bh_home1f' }, { k: 'house', to: 'bh_house', roof: '#4a78c8' }, { k: 'lab', to: 'bh_lab' }],
    signs: ['BROOKHOLLOW - Where every journey begins.'],
    npcs: {
      a: { sprite: 'kid', move: 'wander', text: 'I want a Kit of my own someday! The tall grass up north is full of them.' },
      e: { sprite: 'oldman', dir: 'right', text: 'Across the southern sea lie old ruins. Nobody has sailed there in ages...', textIf: [['champion', 'You have a Raft? Then the southern sea is yours to explore. Legends speak of Starfall Ruins...']] }
    },
    events: [{ run: 'bh_stopNorth', cond: function () { return !PK.game.flag('starter'); } }, { run: 'bh_stopNorth', cond: function () { return !PK.game.flag('starter'); } }],
    edges: { n: { to: 'willow_trail', off: 0 }, s: { to: 'starfall_sea', off: 0 } },
    enc: { water: [[27, 20, 25, 30], [64, 20, 25, 20], [33, 20, 25, 30], [73, 22, 26, 20]] }
  });
  D('bh_home1f', {
    name: 'Home', interior: true, theme: 'house', music: 'hometown',
    rows: ['WYWWZWWW', 'K...p..X', '........', '..tt.m..', '........', 'p......p', '...M....'],
    entry: [3, 6],
    warps: [['bh_home2f', 7, 2, 'down']],
    npcs: { m: { sprite: 'mom', dir: 'left', talk: 'bh_mom' } }
  });
  D('bh_home2f', {
    name: 'My Room', interior: true, theme: 'house', music: 'hometown', homeBed: true,
    rows: ['WWYWWWZW', 'BK....CX', '........', '........', '..,,,,..', 'p.,,,,.p'],
    warps: [['bh_home1f', 7, 2, 'down']],
    shelfText: 'A shelf full of adventure novels and a dog-eared guide called "Your First Kit".'
  });
  IN('bh_house', 'house', {
    name: "{RIVAL}'s House",
    people: [{ x: 5, y: 3, sprite: 'girl', move: 'look', talk: PK.story.gift('got_townmap', 'townmap', "You're off on a journey too? Then you'll need this! It's a Lumora Map. It shows where you are anywhere in the region.", 'Open the map from the menu (MAP). {RIVAL} left without one, of course...', function () { return PK.game.flag('starter'); }, 'My little sibling {RIVAL} left for the lab before breakfast. Always in a hurry!') }]
  });
  D('bh_lab', {
    name: 'Vale Lab', interior: true, theme: 'lab', music: 'hometown',
    rows: [
      'WWYWWWWWYWW',
      'WKKKC.CKKKW',
      'W....a....W',
      'W...mno...W',
      'W.........W',
      'W.e.....q.W',
      'Wp.......pW',
      'W.........W',
      'WWWWWMWWWWW'
    ],
    entry: [5, 8],
    shelfText: 'Research notes: "Kits evolve as they grow. Some need special shards... or a certain time of day."',
    onEnter: 'lab_enter',
    npcs: {
      a: { id: 'prof', sprite: 'prof', dir: 'down', talk: 'prof' },
      m: { sprite: 'capsule', tile: 't', starter: 1, capsule: 'capsule', talk: 'starter1', hideIf: function () { var s = PK.game.state.flags.starter; return s === 1 || s === 7; } },
      n: { sprite: 'capsule', tile: 't', starter: 4, capsule: 'capsule', talk: 'starter4', hideIf: function () { var s = PK.game.state.flags.starter; return s === 4 || s === 1; } },
      o: { sprite: 'capsule', tile: 't', starter: 7, capsule: 'capsule', talk: 'starter7', hideIf: function () { var s = PK.game.state.flags.starter; return s === 7 || s === 4; } },
      e: { sprite: 'scholar', dir: 'right', text: 'I\'m Prof. Vale\'s assistant. Kits evolve when they grow strong enough. Some even change at night!' },
      q: { id: 'rival', sprite: 'rival', dir: 'up', hideIf: 'rival_left', text: '{RIVAL}: Hurry up and pick one already!' }
    }
  });

  // ================= Willow Trail =================
  D('willow_trail', {
    name: 'Willow Trail', theme: 'vale', music: 'route', region: 'Verdant Vale',
    rows: [
      'TTTTTTTTT::TTTTTTTTT',
      'TT"""".T.::.T.""""TT',
      'TT""""...::...."""TT',
      'TT""""...::....a..TT',
      'TTTT.....::......TTT',
      'TT*......:::::...TTT',
      'TTvvvvvvv:::vvvvvvTT',
      'TT"""""..:::..""""TT',
      'TT"""""..:::..""""TT',
      'TT"""""S.:::...~~~TT',
      'TT.......:::..e~~~TT',
      'TTTT.....:::...~~~TT',
      'TT"""....:::.....TTT',
      'TT"""....:::.""""TTT',
      'TT"""....:::.""""*TT',
      'TTT......:::.""""TTT',
      'TTvvvvvv.:::.vvvvvTT',
      'TT,,,....::.....,,TT',
      'TTTTTTTT.::.TTTTTTTT',
      'TTTTTTTTT::TTTTTTTTT'
    ],
    signs: ['WILLOW TRAIL - North: Pinecrest  South: Brookhollow'],
    items: [['tonic', 1], ['capsule', 2]],
    npcs: {
      a: { sprite: 'girl', dir: 'left', keeper: 'willow_2', sight: 5 },
      e: { sprite: 'kid', dir: 'left', keeper: 'willow_1', sight: 4 }
    },
    edges: { s: { to: 'brookhollow', off: 0 }, n: { to: 'pinecrest', off: 0 } },
    enc: {
      grass: [[10, 2, 4, 35], [12, 2, 4, 35], [14, 3, 4, 15], [25, 3, 5, 10, 'day'], [35, 3, 4, 10, 'night'], [79, 3, 4, 6, 'night']],
      water: [[27, 5, 8, 60], [52, 5, 8, 40]]
    }
  });

  // ================= Pinecrest =================
  D('pinecrest', {
    name: 'Pinecrest', theme: 'vale', music: 'town', region: 'Verdant Vale',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'TT......1######.......TT',
      'TT......#######.......TT',
      'TT......#######.......TT',
      'TT......#######.......TT',
      'TT..S...#######...S...TT',
      'TT.........:........e.TT',
      'TT..:::::::::::::::::b::',
      'TT.......:..a.........TT',
      'TT2####..:......3###..TT',
      'TT#####..:......####..TT',
      'TT#####..:......####..TT',
      'TT#####..:........:...TT',
      'TT..:::::::::::::::...TT',
      'TT4###...:.......5###.TT',
      'TT####...:.......####.TT',
      'TT####...:.......####.TT',
      'TT.:.....::.......:...TT',
      'TT.::::::::::::::::...TT',
      'TTTTTTTTT::TTTTTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'pc_gym', roof: '#4aa060', emblem: 'Leaf' },
      { k: 'clinic', to: 'pc_clinic' },
      { k: 'shop', to: 'pc_shop' },
      { k: 'house', to: 'pc_woodcutter', roof: '#a0683a' },
      { k: 'house', to: 'pc_house', roof: '#8a5ab8' }
    ],
    signs: ['PINECREST - A town wrapped in whispering pines.', 'PINECREST GYM - Warden: Fenna. "Grow strong, grow tall!"'],
    npcs: {
      a: { sprite: 'oldwoman', move: 'wander', text: 'Warden Fenna uses Leaf Kits. Blaze and Gale Kits do well against them, dear.' },
      e: { sprite: 'hiker', dir: 'left', text: 'The road east to Mossy Woods is choked with bushes. The woodcutter in town might help.', textIf: [['got_machete', 'You got a Machete? Face the bush and press A to cut it down!']] }
    },
    edges: { s: { to: 'willow_trail', off: 0 }, e: { to: 'mossy_woods', off: -4 } }
  });
  IN('pc_clinic', 'clinic', { name: 'Pinecrest Clinic', people: [{ x: 8, y: 5, sprite: 'boy', move: 'wander', text: 'The terminal in the corner lets you store extra Kits. Handy!' }, { x: 1, y: 3, sprite: 'scholar', dir: 'right', talk: PK.story.gift('got_lens', 'seekerlens', "I'm one of Prof. Vale's aides! You've caught 10 kinds of Kits? Then take this Seeker Lens. It glows when something is hidden nearby.", 'Use the Seeker Lens from your Bag. Items are often hidden in odd corners!', function () { return Object.keys(PK.game.state.caught).length >= 10; }, "I'm one of Prof. Vale's aides. Catch 10 kinds of Kits and I'll give you a handy tool!") }] });
  IN('pc_shop', 'shop', { name: 'Pinecrest Shop', stock: ['capsule', 'tonic', 'remedy', 'hushspray'] });
  IN('pc_woodcutter', 'house', { name: "Woodcutter's House", people: [{ x: 5, y: 3, sprite: 'hiker', dir: 'down', talk: S('pc_woodcutter') }] });
  IN('pc_house', 'house2', { name: 'Cozy House', items: [], people: [{ x: 3, y: 2, sprite: 'girl', dir: 'down', talk: PK.story.gift('got_healroot', 'healroot', 'You look like you travel a lot. Take this Healroot! Let a Kit hold it in battle.', 'A Kit holding a Healroot eats it when its HP gets low.') }] });
  D('pc_gym', {
    name: 'Pinecrest Gym', interior: true, theme: 'gym_Leaf', music: 'town',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.........W',
      'WTTTT.TTTTW',
      'W......e..W',
      'W.TTTTTTT.W',
      'W.T.....T.W',
      'W.T.TTT.T.W',
      'W...TmT...W',
      'W.TTT.TTT.W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: function () { return 'PINECREST GYM - Warden: Fenna. Crest holders: ' + (PK.game.state.crests[0] ? PK.game.state.player.name : '...'); },
    npcs: {
      a: { sprite: 'fenna', dir: 'down', talk: PK.story.warden({ i: 0, trainer: 'warden1', disc: 'sd04', intro: 'FENNA: Welcome to my garden, challenger! Leaf Kits grow stronger with every sunrise. Let\'s see how you bloom!', win: 'FENNA: Wonderful! You\'ve earned the Sprout Crest!', after: 'FENNA: Keep growing, {PLAYER}. The woodcutter in town may help you clear the road east.', extra: 'FENNA: That Skill Disc teaches Grove Beam. Skill Discs can be used again and again!' }) },
      e: { sprite: 'girl', dir: 'left', keeper: 'pine_gym1', sight: 4 },
      m: { sprite: 'boy', dir: 'down', keeper: 'pine_gym2', sight: 2 }
    }
  });

  // ================= Mossy Woods =================
  D('mossy_woods', {
    name: 'Mossy Woods', theme: 'vale', music: 'forest', region: 'Verdant Vale',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTT""""TTTTT""""TTTTTT"""*TTTT',
      'TTT""""mn.TT""""..a...""""TTTT',
      ':::::::::::::::::::::..""TTTTT',
      'TTT""""TT..TT""""TT..:..TTTTTT',
      'TTT""""TT..TT""""TT..:.""TTTTT',
      'TTTTTTTTT.eTTTTTTTT..:.""TTTTT',
      'TTT*.......TTTT""""..:....TTTT',
      'TTTTTTTT"""TTTT""""..::::.TTTT',
      'TTTTTTTT"""TTTTTTTTTTTT:.TTTTT',
      'TT"""""""""""TTTTTTTTTT:.TTTTT',
      'TT""""""""""":::::::::::.TTTTT',
      'TT""""""o""""TTTTTTTTTTT.TTTTT',
      'TT"""""""""""TTTTTTTTTTT.TTTTT',
      'TTTTTTT.TTTTTTTTTTTTTTTT.TTTTT',
      'TTTTTTTrTTTTTTTT""""""TT.TTTTT',
      'TTTTTTT?TTTTTTTT""q"""TT.TTTTT',
      'TTTTTTTOTTTTTTTT""""""..:TTTTT',
      'TTTTTTTTTTTTTTTT""""""..!!::::',
      'TTTTTTTTTTTTTTTTTTTTTT..TTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTT.uTTTTTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    items: [['hushspray', 1], ['tonic', 2]],
    hidden: [['remedy', 2]],
    npcs: {
      a: { sprite: 'kid', dir: 'down', keeper: 'woods_1', sight: 2 },
      e: { sprite: 'kid', dir: 'left', keeper: 'woods_2', sight: 1 },
      o: { sprite: 'boy', dir: 'right', keeper: 'woods_4', sight: 4 },
      q: { sprite: 'girl', dir: 'up', keeper: 'woods_3', sight: 2 },
      m: { sprite: 'girl', dir: 'down', keeper: 'woods_twins', sight: 1 },
      n: { sprite: 'girl', dir: 'down', keeper: 'woods_twins', sight: 1 },
      u: { id: 'rival', sprite: 'rival', dir: 'up', hideIf: 'rival2', talk: S('rival2') }
    },
    events: [{ run: 'rival2', cond: function () { return !PK.game.flag('rival2'); } }, { run: 'rival2', cond: function () { return !PK.game.flag('rival2'); } }],
    edges: { w: { to: 'pinecrest', off: 4 }, e: { to: 'quarryton', off: -6 } },
    warps: [['hidden_hollow', 9, 10, 'up']],
    enc: {
      grass: [[14, 5, 7, 25], [15, 6, 8, 10], [21, 6, 8, 15], [19, 6, 8, 15], [10, 6, 8, 10], [46, 7, 9, 8], [62, 7, 8, 8], [60, 6, 8, 9, 'night'], [77, 7, 7, 5, 'morning'], [16, 8, 9, 2]]
    }
  });

  // ================= Quarryton =================
  D('quarryton', {
    name: 'Quarryton', theme: 'vale', music: 'town', region: 'Verdant Vale',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWOWWWWWWWWWWW',
      'WWRR.....S..e......RRWWW',
      'WR..........:.........WW',
      'TT.1######..:.2####...TT',
      'TT.#######..:.#####...TT',
      'TT.#######..:.#####...TT',
      'TT.#######..:.#####...TT',
      'TT.#######..:...:.....TT',
      'TT....:.....::::::....TT',
      'TT....::::::::........TT',
      'TT..R.......:..3###.R.TT',
      '::::::::::::::.####...TT',
      'TT..........:..####...TT',
      'TT.4###.....:....:....TT',
      'TT.####.....::::::....TT',
      'TT.####...a...........TT',
      'TT..:..........R...R..TT',
      'TT..::::::::..........TT',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'qt_gym', roof: '#a07048', emblem: 'Terra' },
      { k: 'clinic', to: 'qt_clinic' },
      { k: 'shop', to: 'qt_shop' },
      { k: 'house', to: 'qt_miner', roof: '#6a7a8a' }
    ],
    signs: ['QUARRYTON - Built on stone, powered by grit. North: Echo Cavern'],
    warps: [['echo_cavern', 13, 19, 'up']],
    npcs: {
      e: { sprite: 'worker', dir: 'down', hideIf: crest(1), text: 'Sorry, Echo Cavern is closed to keepers without the Bedrock Crest. Too dangerous!' },
      a: { sprite: 'hiker', move: 'wander', text: 'Warden Gideon\'s Terra Kits are tough. Tide and Leaf moves wear them down!' }
    },
    edges: { w: { to: 'mossy_woods', off: 6 } }
  });
  IN('qt_clinic', 'clinic', { name: 'Quarryton Clinic', people: [{ x: 8, y: 5, sprite: 'boy', dir: 'left', talk: PK.story.gift('got_bike', 'bike', "Whoa, the Bedrock Crest! My family runs a cycle shop, and we'd love a strong keeper to ride our bikes. Here's a Trail Bike!", 'Use the Trail Bike from your Bag, or register it to SELECT. It is way faster than running!', function () { return PK.game.state.crests[1]; }, 'I love bikes! Beat Warden Gideon here in Quarryton and I might have something for you.') }] });
  IN('qt_shop', 'shop', { name: 'Quarryton Shop', stock: ['capsule', 'tonic', 'remedy', 'rekindle', 'hushspray', 'smokepellet', 'exitcord'] });
  IN('qt_miner', 'house', { name: "Miner's House", people: [{ x: 5, y: 3, sprite: 'worker', dir: 'down', talk: S('qt_miner') }] });
  D('qt_gym', {
    name: 'Quarryton Gym', interior: true, theme: 'gym_Terra', music: 'town',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.R.....R.W',
      'W.RRR.RRR.W',
      'W.........W',
      'WRR.RRR.RRW',
      'W...e.....W',
      'W.RRRRRRR.W',
      'W.R.....R.W',
      'W.R.RRR.R.W',
      'W.......m.W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'QUARRYTON GYM - Warden: Gideon. "Solid as the mountain."',
    npcs: {
      a: { sprite: 'gideon', dir: 'down', talk: PK.story.warden({ i: 1, trainer: 'warden2', disc: 'sd09', intro: 'GIDEON: Hmph. Another pebble rolls into my quarry. My Terra Kits have weathered a thousand storms. Can you crack them?', win: 'GIDEON: Well I\'ll be! Take the Bedrock Crest.', after: 'GIDEON: The miner in town has a Pickaxe for keepers who earn my crest. Echo Cavern is open to you now.', extra: 'GIDEON: That Disc teaches Landslide. Rocks fall, foes flinch!' }) },
      e: { sprite: 'hiker', dir: 'right', keeper: 'quarry_gym1', sight: 5 },
      m: { sprite: 'hiker', dir: 'left', keeper: 'quarry_gym2', sight: 6 }
    }
  });

  // ================= Echo Cavern =================
  D('echo_cavern', {
    name: 'Echo Cavern', theme: 'cave', music: 'cave', region: 'Verdant Vale',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWOWWWWWWWWWWWWWW',
      'WWWW*........q.......*WWWWWW',
      'WWWW...R.a.......e.R..WWWWWW',
      'WWWW..................WWWWWW',
      'WWWWWWWWWWrrWWWWWWWWWWWWWWWW',
      'WWWW.....R..R....WWWWWWWWWWW',
      'WW*......R.........s...?WWWW',
      'WW...RR..........RR.....WWWW',
      'WW..WWWWWWW..WWWWWWWWW..WWWW',
      'WW..WWWWWWW..WWWWWWWWW..WWWW',
      'WW......n.............WW..WW',
      'WW..R.........R.......WW..WW',
      'WWWWWW..WWWWWWWWWWW...WW..WW',
      'WW*.....WWWWWWWWWWW.......WW',
      'WW......WWWWWWWWWWW.R..R..WW',
      'WW..R...WWWWWWWWWWW.......WW',
      'WW......................m.WW',
      'WWWWWWWWWWWWW..WWWWWWWWWWWWW',
      'WWWWWWWWWWWWW..WWWWWWWWWWWWW',
      'WWWWWWWWWWWWWOOWWWWWWWWWWWWW'
    ],
    warps: [['voltmere', 13, 2, 'down'], ['quarryton', 12, 2, 'down'], ['quarryton', 12, 2, 'down']],
    items: [['sd10', 1], ['hitonic', 1], ['capsule', 3], ['rekindle', 1], ['pluscapsule', 2]],
    hidden: [['voltshard', 1]],
    npcs: {
      q: { id: 'nix', sprite: 'captain', dir: 'down', hideIf: 'nix_done', talk: S('nix') },
      a: { id: 'agent1', sprite: 'agent', dir: 'right', keeper: 'cave_agent1', sight: 3, hideIf: 'nix_done' },
      e: { id: 'agent2', sprite: 'agent', dir: 'left', keeper: 'cave_agent2', sight: 3, hideIf: 'nix_done' },
      s: { sprite: 'hiker', dir: 'left', keeper: 'cave_1', sight: 4 },
      n: { sprite: 'scholar', dir: 'down', keeper: 'cave_2', sight: 3 },
      m: { sprite: 'hiker', dir: 'left', text: 'Cracked rocks block the way north. A Pickaxe would make short work of them.' }
    },
    enc: {
      cave: [[23, 10, 13, 35], [17, 10, 13, 20], [37, 11, 13, 15], [35, 10, 12, 10], [56, 12, 14, 5], [79, 11, 13, 10, 'night'], [83, 10, 12, 10], [58, 11, 13, 5]]
    }
  });

  // ================= Voltmere =================
  D('voltmere', {
    name: 'Voltmere', theme: 'vale', music: 'town', region: 'Verdant Vale',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWOWWWWWWWWWW',
      'TTL..........:........TT',
      'TT...........!......L.TT',
      'TT.1######...:..2####.TT',
      'TT.#######...:..#####.TT',
      'TT.#######...:..#####.TT',
      'TT.#######...:..#####.TT',
      'TT.#######...:....:...TT',
      'TT....:......::::::...TT',
      'TT....:::::::::.......TT',
      'TTL..3###....:....4###TT',
      'TT...####....:....####TT',
      'TT...####....:....####TT',
      'TT.....:.....:.....:..TT',
      'TT.....:::::::::::::..TT',
      'TTk..........:.....a.kTT',
      'TT.L.........:.......LTT',
      'TTTTTTTTTTTTTeTTTTTTTTTT',
      'TTTTTTTTTTTTT:TTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'vm_gym', roof: '#d8b030', emblem: 'Volt' },
      { k: 'clinic', to: 'vm_clinic' },
      { k: 'shop', to: 'vm_shop' },
      { k: 'house', to: 'vm_house', roof: '#4a78c8' }
    ],
    warps: [['echo_cavern', 13, 2, 'down']],
    events: [{ run: 'rival3', cond: function () { return !PK.game.flag('rival3'); } }],
    npcs: {
      a: { sprite: 'worker', move: 'wander', text: 'The windmills on the hill power the whole town. Juno\'s Gym uses a lot of it!' },
      e: { sprite: 'worker', dir: 'up', tile: ':', hideIf: crest(2), text: 'The coast road south is only open to keepers with the Spark Crest. Warden Juno\'s orders!' }
    },
    edges: { s: { to: 'tidewind_trail', off: 0 } }
  });
  IN('vm_clinic', 'clinic', { name: 'Voltmere Clinic', people: [{ x: 8, y: 5, sprite: 'hiker', dir: 'left', talk: PK.story.gift('got_wayfinder', 'wayfinder', "Three crests already? You're going places! Take my Wayfinder - it can whisk you back to any town you've visited.", 'Use the Wayfinder from your Bag while outdoors.', function () { return PK.game.state.crests[2]; }, "I've traveled all over Lumora. Earn the Spark Crest and I'll share my secret for getting around fast.") }] });
  IN('vm_shop', 'shop', { name: 'Voltmere Shop', stock: ['capsule', 'pluscapsule', 'tonic', 'hitonic', 'remedy', 'rekindle', 'hushspray', 'smokepellet'] });
  IN('vm_house', 'house', { name: "Keeper's Lodge", people: [{ x: 5, y: 3, sprite: 'oldman', dir: 'down', talk: PK.story.gift('got_clover', 'luckyclover', 'I was a keeper, long ago. Here, take my old lucky charm - a Lucky Clover!', 'A Kit holding the Lucky Clover earns extra EXP. It helped me more than once.') }] });
  D('vm_gym', {
    name: 'Voltmere Gym', interior: true, theme: 'gym_Volt', music: 'town',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.L.....L.W',
      'W.........W',
      'WLLLL.LLLLW',
      'W.........W',
      'W..e...L..W',
      'WLL.LLLLL.W',
      'W.........W',
      'W.LLLL.m..W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'VOLTMERE GYM - Warden: Juno. "Stay charged!"',
    npcs: {
      a: { sprite: 'juno', dir: 'down', talk: PK.story.warden({ i: 2, trainer: 'warden3', disc: 'sd05', intro: 'JUNO: Heyyy! You made it through my gym! My Volt Kits are fully charged and ready to shock!', win: 'JUNO: Zap! You earned the Spark Crest!', after: 'JUNO: The coast road south is open now. The sea breeze in Saltmarsh is lovely!', extra: 'JUNO: That Disc teaches Arc Bolt. Crackle crackle!' }) },
      e: { sprite: 'boy', dir: 'right', keeper: 'volt_gym1', sight: 3 },
      m: { sprite: 'girl', dir: 'left', keeper: 'volt_gym2', sight: 3 }
    }
  });
})();

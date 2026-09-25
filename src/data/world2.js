// Region 2: Sunscar Coast
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var D = PK.defMap, IN = PK.interior;
  function crest(i) { return function () { return !!PK.game.state.crests[i]; }; }
  function S(id) { return function (w, n) { return PK.SCRIPTS[id](w, n); }; }
  function champ(flag) { return function () { return PK.game.flag('champion') && !PK.game.flag(flag); }; }

  // ================= Tidewind Trail =================
  D('tidewind_trail', {
    name: 'Tidewind Trail', theme: 'coast', music: 'coast', region: 'Sunscar Coast',
    rows: [
      'TTTTTTTTTTTTT:TTTTTTTT',
      'TT""""".....::...T~~~~',
      'TT""""".....:....T~~~~',
      'TT"""""..a..:.....~~~~',
      'TT..........:.mn..~~~~',
      'TTTT1##"....:..*..~~~~',
      'TTTT###"....:.....~~~~',
      'TT,,,,......::::..~~~~',
      'TT....S........:..~~~~',
      'TTvvvvvvvvv....:..~~~~',
      'TT"""""""""....:.e~~~~',
      'TT"""""""""....:..~~~~',
      'TT"""""""""....:..~~~~',
      'TT.........::::...~~~~',
      'TTTTTTTT...:......~~~~',
      'TT~~~~TT...:..q...~~~~',
      'TT~~~~TT...:......~~~~',
      'TT~~~~.....:......~~~~',
      'TT~~~~..*..:.....,~~~~',
      'TT......""":""""..~~~~',
      'TT......""":""""..~~~~',
      'TT......""":""""..~~~~',
      'TT..s...""":""""..~h.~',
      'TT......""":""""..~..~',
      'TT.........:......~~~~',
      'TTTTTTTTTTT:TTTTTTTTTT'
    ],
    signs: ['TIDEWIND TRAIL - North: Voltmere  South: Saltmarsh'],
    buildings: [{ k: 'gate', to: 'wildwood_gate', label: 'RESERVE' }],
    items: [['hitonic', 2], ['sd18', 1]],
    npcs: {
      a: { sprite: 'girl', dir: 'right', keeper: 'tide_1', sight: 3 },
      e: { sprite: 'sailor', dir: 'left', keeper: 'tide_2', sight: 3 },
      q: { sprite: 'swimmer', dir: 'left', keeper: 'tide_3', sight: 3 },
      s: { sprite: 'girl', dir: 'right', keeper: 'tide_4', sight: 4 },
      m: { sprite: 'boy', dir: 'left', keeper: 'tide_duo', sight: 2 },
      n: { sprite: 'girl', dir: 'left', keeper: 'tide_duo', sight: 2 },
      h: { sprite: 'kit:98', cond: champ('g98'), talk: PK.story.guardian(98, 60, 'g98', 'A great ray glides above the waves. Rain begins to fall...') }
    },
    edges: { n: { to: 'voltmere', off: 0 }, s: { to: 'saltmarsh', off: 0 } },
    enc: {
      grass: [[10, 16, 18, 15], [11, 18, 20, 5], [48, 16, 19, 20], [83, 16, 18, 15], [44, 17, 19, 15], [70, 17, 19, 15], [85, 17, 19, 10, 'morning'], [79, 17, 19, 10, 'night'], [68, 18, 19, 5]],
      water: [[27, 16, 20, 40], [64, 17, 20, 20], [33, 17, 20, 25], [73, 18, 21, 10], [52, 17, 19, 5]]
    }
  });

  // ================= Saltmarsh =================
  D('saltmarsh', {
    name: 'Saltmarsh', theme: 'coast', music: 'coast', region: 'Sunscar Coast',
    rows: [
      'TTTTTTTTTTT:TTTTTTTTTTTTTT',
      'TT.........:..........T~~~',
      'TT.1######.:.2####....~~~~',
      'TT.#######.:.#####....~~~~',
      'TT.#######.:.#####....~~~~',
      'TT.#######.:.#####....~~~~',
      'TT.#######.:...:......~~~~',
      'TT....:....:::::......~~~~',
      'TT....::::::::::::::::=h~~',
      'TT.3###..:.......4###..~~~',
      'TT.####..:.......####..~~~',
      'TT.####..:.......####..~~~',
      'TT...:...:........:....~~~',
      'TT...::::::::::::::...a~~~',
      'TT,,,..........S.....~~~~~',
      'TT..........e.......~~~~~~',
      'TT~~~~~~~~~~~~~~~~~~~~~~~~',
      'TT~~~~~~~~~~~~~~~~~~~~~~~~'
    ],
    buildings: [
      { k: 'gym', to: 'sm_gym', roof: '#3a7ad0', emblem: 'Tide' },
      { k: 'clinic', to: 'sm_clinic' },
      { k: 'shop', to: 'sm_shop' },
      { k: 'house', to: 'sm_sailor', roof: '#e0e0e8' }
    ],
    signs: ['SALTMARSH - Salt, sails and sea breeze. East across the bay: Sunscar Dunes'],
    npcs: {
      h: { sprite: 'sailor', dir: 'left', talk: 'ferry_saltmarsh' },
      a: { sprite: 'sailor', dir: 'left', text: 'The Sunscar Dunes are just across the bay. You\'d need a Raft to get there, though.', textIf: [['got_raft', 'Got a Raft? Face the water and press A. Easy as that!']] },
      e: { sprite: 'boy', move: 'wander', text: 'Warden Marisol\'s Tide Kits are slippery. Volt and Leaf moves hit them hard!' }
    },
    edges: { n: { to: 'tidewind_trail', off: 0 }, e: { to: 'sunscar_dunes', off: 0 } },
    links: [['emberisle', 12, 15]],
    enc: { water: [[27, 20, 24, 40], [33, 20, 23, 30], [48, 21, 24, 20], [64, 21, 24, 10]] }
  });
  IN('sm_clinic', 'clinic', { name: 'Saltmarsh Clinic', people: [{ x: 8, y: 5, sprite: 'brawler', dir: 'left', talk: PK.story.gift('got_bell', 'rallybell', 'Four crests! You must love battling as much as I do. Take this Rally Bell! Ring it and keepers you beat before will want a rematch.', 'The Rally Bell needs 100 steps to recharge between rings. You can register it to SELECT!', function () { return PK.game.state.crests[3]; }, "I run a battle club. Earn the Wave Crest here in Saltmarsh and I'll give you something great.") }] });
  IN('sm_shop', 'shop', { name: 'Saltmarsh Shop', stock: ['capsule', 'pluscapsule', 'hitonic', 'remedy', 'rekindle', 'hushspray', 'chargecell', 'sd20'] });
  IN('sm_sailor', 'house', { name: "Sailor's House", people: [{ x: 5, y: 3, sprite: 'sailor', dir: 'down', talk: S('sm_sailor') }] });
  D('sm_gym', {
    name: 'Saltmarsh Gym', interior: true, theme: 'gym_Tide', music: 'town',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.........W',
      'W~~~~|~~~~W',
      'W~~~~|~~~~W',
      'W.........W',
      'W.e.......W',
      'W~~|~~~~~~W',
      'W~~|~~~~~~W',
      'W......m..W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'SALTMARSH GYM - Warden: Marisol. "Go with the flow."',
    npcs: {
      a: { sprite: 'marisol', dir: 'down', talk: PK.story.warden({ i: 3, trainer: 'warden4', disc: 'sd03', intro: 'MARISOL: The sea gives, and the sea takes. Let\'s see if you can ride the tide, keeper!', win: 'MARISOL: Beautiful! The Wave Crest is yours.', after: 'MARISOL: The sailor in town has a spare Raft for keepers with my crest. The dunes await!', extra: 'MARISOL: That Disc teaches Riptide. Make a splash!' }) },
      e: { sprite: 'swimmer', dir: 'right', keeper: 'salt_gym1', sight: 6 },
      m: { sprite: 'sailor', dir: 'left', keeper: 'salt_gym2', sight: 4 }
    }
  });

  // ================= Sunscar Dunes =================
  D('sunscar_dunes', {
    name: 'Sunscar Dunes', theme: 'desert', music: 'desert', region: 'Sunscar Coast', weather: 'sand',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      '~~~...T....""""""...T.....WWWW',
      '~~~.......""""""".....a...WWWW',
      '~~~..T....""""""".........WWWW',
      '~~~.......::::::::::......WWWW',
      '~~~..*....:.......T.:.....WWWW',
      '~~~....T..:..e....T.:.....WWWW',
      '~~~.......:.......T.:..T..WWWW',
      '~~~.......:.......T.::::::::::',
      '~~~..""""":"""""""T.......WWWW',
      '~~~..""""":"""""""T.......WWWW',
      '~~~..""""":""q""""T...*...WWWW',
      '~~~.......:...mn..........WWWW',
      '~~~.......:::::::::.......WWWW',
      '~~~..T............:....T..WWWW',
      '~~~....s..........:.......WWWW',
      '~~~...""""""""....:...?...WWWW',
      '~~~...""""""""....:.......WWWW',
      'WWW...........T...:...T...WWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'
    ],
    items: [['pluscapsule', 3], ['sd07', 1]],
    hidden: [['radiantshard', 1]],
    npcs: {
      a: { sprite: 'hiker', dir: 'down', keeper: 'dune_1', sight: 3 },
      e: { sprite: 'mystic', dir: 'left', keeper: 'dune_2', sight: 3 },
      q: { sprite: 'boy', dir: 'right', keeper: 'dune_3', sight: 4 },
      s: { sprite: 'girl', dir: 'right', keeper: 'dune_4', sight: 5 },
      m: { sprite: 'hiker', dir: 'down', keeper: 'dune_duo', sight: 1 },
      n: { sprite: 'hiker', dir: 'down', keeper: 'dune_duo', sight: 1 }
    },
    edges: { w: { to: 'saltmarsh', off: 0 }, e: { to: 'dunespire', off: 2 } },
    enc: {
      grass: [[66, 22, 25, 20], [70, 22, 25, 15], [17, 22, 24, 15], [50, 22, 25, 10], [83, 22, 24, 10], [44, 23, 25, 15], [90, 24, 26, 5], [96, 23, 25, 5, 'day'], [79, 23, 25, 10, 'night']],
      water: [[27, 22, 26, 40], [48, 23, 26, 30], [33, 22, 25, 30]]
    }
  });

  // ================= Dunespire =================
  D('dunespire', {
    name: 'Dunespire', theme: 'desert', music: 'desert', region: 'Sunscar Coast',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WW..1######....T......WW',
      'WW..#######.....2####.WW',
      'WW..#######.....#####.WW',
      'WW..#######.....#####.WW',
      'WW..#######.....#####.WW',
      'WW.....:..........:...WW',
      'WW..T..::::::::::::...WW',
      'WW...........:........OW',
      '::::::::::::::::::::::WW',
      'WW.3###......:....4##.WW',
      'WW.####......:....###.WW',
      'WW.####......:....###.WW',
      'WW...:.......:.....:..WW',
      'WW...:::::::::::::::..WW',
      'WW..T.....a......T....WW',
      'WWWWWWWWWWWWWWWWWWWWWWWW'
    ],
    buildings: [
      { k: 'gym', to: 'ds_gym', roof: '#e0602a', emblem: 'Blaze' },
      { k: 'clinic', to: 'ds_clinic' },
      { k: 'shop', to: 'ds_shop' },
      { k: 'hut', to: 'ds_hut' }
    ],
    warps: [['ember_tunnels', 5, 15, 'up']],
    npcs: {
      a: { sprite: 'mystic', move: 'wander', text: 'Warden Ignatius trains inside the volcano\'s heat. Tide and Terra moves cool his Kits right down.' }
    },
    edges: { w: { to: 'sunscar_dunes', off: -2 } }
  });
  IN('ds_clinic', 'clinic', { name: 'Dunespire Clinic' });
  IN('ds_shop', 'shop', { name: 'Dunespire Shop', stock: ['pluscapsule', 'hitonic', 'remedy', 'rekindle', 'hushspraymax', 'healroot', 'smokepellet'] });
  IN('ds_hut', 'hut', { name: "Mystic's Hut", people: [{ x: 3, y: 2, sprite: 'mystic', dir: 'down', talk: S('ds_mystic') }] });
  D('ds_gym', {
    name: 'Dunespire Gym', interior: true, theme: 'gym_Blaze', music: 'town', weather: 'embers',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.l.....l.W',
      'Wll.lll.llW',
      'W.........W',
      'Wl.lllllllW',
      'We........W',
      'Wllllll.llW',
      'W...m.....W',
      'W.lllllll.W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'DUNESPIRE GYM - Warden: Ignatius. "Burn bright!"',
    npcs: {
      a: { sprite: 'ignatius', dir: 'down', talk: PK.story.warden({ i: 4, trainer: 'warden5', disc: 'sd02', intro: 'IGNATIUS: HA HA! Welcome to the furnace! Only the bravest keepers withstand my flames!', win: 'IGNATIUS: Your fire outshines mine! The Ember Crest is yours!', after: 'IGNATIUS: Mirage City lies beyond the Ember Tunnels, east of town. Stay cool!', extra: 'IGNATIUS: That Disc teaches Blaze Burst. Light up the sky!' }) },
      e: { sprite: 'boy', dir: 'right', keeper: 'dune_gym1', sight: 5 },
      m: { sprite: 'girl', dir: 'right', keeper: 'dune_gym2', sight: 3 }
    }
  });

  // ================= Ember Tunnels =================
  D('ember_tunnels', {
    name: 'Ember Tunnels', theme: 'volcano', music: 'cave', region: 'Sunscar Coast', weather: 'embers',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWOWWW',
      'WWllllWWW*......WWWW...WWW',
      'WWllhlWWW...R...WWWW.a.WWW',
      'WWll.lWWW.......WWWW...WWW',
      'WWWW.WWWW...ll......R..WWW',
      'WWWW.WWWW...ll.........WWW',
      'WWWW...........llll....WWW',
      'WW*....e.......llll..R.WWW',
      'WWWWWWWWW......llll....WWW',
      'WWWWWWWWW.R............WWW',
      'WW...............s.....WWW',
      'WW..llll...R...........WWW',
      'WW..llll....WWWWWWWWWWWWWW',
      'WW..........WWWWWWWWWWWWWW',
      'WWWWW..WWWWWWWWWWWWWWWWWWW',
      'WWWWWOOWWWWWWWWWWWWWWWWWWW'
    ],
    warps: [['mirage_city', 5, 21, 'right'], ['dunespire', 21, 9, 'left'], ['dunespire', 21, 9, 'left']],
    items: [['megatonic', 1], ['sd16', 1]],
    npcs: {
      h: { sprite: 'kit:97', cond: champ('g97'), talk: PK.story.guardian(97, 60, 'g97', 'A blazing guardian rises from the magma. The air shimmers with heat!') },
      a: { sprite: 'agent', dir: 'down', keeper: 'ember_agent', sight: 2 },
      e: { sprite: 'boy', dir: 'right', keeper: 'ember_1', sight: 4 },
      s: { sprite: 'scholar', dir: 'left', keeper: 'ember_2', sight: 4 }
    },
    enc: {
      cave: [[66, 26, 29, 30], [67, 29, 31, 5], [91, 28, 30, 5], [44, 26, 28, 15], [56, 27, 29, 10], [17, 26, 28, 15], [35, 26, 28, 10], [37, 27, 29, 10]]
    }
  });

  // ================= Mirage City =================
  D('mirage_city', {
    name: 'Mirage City', theme: 'coast', music: 'city', region: 'Sunscar Coast',
    rows: [
      'TTTTTTTTTTTTTT::TTTTTTTTTTTTTT',
      'TTLgggggggggggaeggggggggggLTTT',
      'TTgggggggggggggggggggggggggTTT',
      'TTg1######gggggggggg2####gggTT',
      'TTg#######gggggggggg#####gggTT',
      'TTg#######gggggggggg#####gggTT',
      'TTg#######ggggSggggg#####gggTT',
      'TTg#######gggggggggg#####gggTT',
      'TTgggggggggggggggggg#####gggTT',
      'TTgggggggggggggggggg#####gggTT',
      'TTLgggggggggggggggggggxggggLTT',
      'TTgg3####gggggggg4###g!gggggTT',
      'TTgg#####gggggggg####gggggggTT',
      'TTgg#####gggggggg####gggggggTT',
      'TTgg#####gggggggggggggggggggTT',
      'TTggggggggggkggggggkgggggggTTT',
      'TTgg5###gggggggggg6###ggggggTT',
      'TTgg####gggggggggg####ggggggTT',
      'TTgg####ggggggmggg####ggggggTT',
      'TTLgggggggggggggggggggggggLTTT',
      'TTWWWggggggggggggggggggggggTTT',
      'TTWWOggggggggggggggggggnggggTT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'mc_gym', roof: '#d84c90', emblem: 'Mind' },
      { k: 'spire', to: 'spire_1f' },
      { k: 'clinic', to: 'mc_clinic' },
      { k: 'shop', to: 'mc_shop', label: 'MEGA SHOP' },
      { k: 'house', to: 'mc_house1', roof: '#5a8ad0' },
      { k: 'house', to: 'mc_house2', roof: '#d0a040' }
    ],
    signs: ['MIRAGE CITY - The shimmering jewel of the coast.'],
    warps: [['ember_tunnels', 22, 2, 'down']],
    events: [{ run: 'rival4', cond: function () { return PK.game.state.crests[5] && !PK.game.flag('rival4'); } }],
    npcs: {
      a: { sprite: 'agent', dir: 'down', hideIf: 'spire_clear', text: 'The Director has sealed the northern road. Nobody leaves Mirage City!' },
      e: { sprite: 'agent', dir: 'down', hideIf: 'spire_clear', text: 'Go away, kid. The Hollow Syndicate runs this city now.' },
      x: { sprite: 'agent', dir: 'down', hideIf: crest(5), text: 'Only Syndicate members may enter the Spire. Unless you want to prove yourself at the Gym first, heh.' },
      m: { sprite: 'girl', move: 'wander', text: 'The big shop sells Skill Discs and evolution shards. I spend all my money there!' },
      n: { sprite: 'scholar', dir: 'left', text: 'Warden Celestine reads minds. Shade and Swarm moves are her weakness, I hear.' }
    },
    edges: { n: { to: 'frostpine_trail', off: -4 } }
  });
  IN('mc_clinic', 'clinic', { name: 'Mirage Clinic' });
  IN('mc_shop', 'shop', { name: 'Mirage Mega Shop', stock: ['capsule', 'pluscapsule', 'procapsule', 'hitonic', 'megatonic', 'remedy', 'rekindle', 'chargecell', 'hushspraymax', 'exitcord', 'vigorroot', 'mightroot', 'guardroot', 'focusroot', 'calmroot', 'swiftroot', 'sd01', 'sd08', 'sd12', 'sd19', 'voltshard', 'frostshard', 'radiantshard', 'umbralshard'] });
  IN('mc_house1', 'house', { name: "Scholar's House", people: [{ x: 5, y: 3, sprite: 'scholar', dir: 'down', talk: PK.story.gift('got_powerband', 'powerband', 'A traveling keeper! My research is done, so take this Might Band. It boosts the holder\'s attacks.', 'Might Band gives a 10% boost. Small, but it adds up!') }] });
  IN('mc_house2', 'house2', { name: 'Collector\'s House', people: [{ x: 3, y: 2, sprite: 'oldwoman', dir: 'down', talk: PK.story.gift('got_umbral', 'umbralshard', 'I collect shards, but I have two of these. Here, take an Umbral Shard!', 'Umbral Shards make certain shadowy Kits evolve.') }] });
  D('mc_gym', {
    name: 'Mirage Gym', interior: true, theme: 'gym_Mind', music: 'city',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.Q.Q.Q.Q.W',
      'W.........W',
      'WQQQ.QQQQ.W',
      'W.....e...W',
      'W.QQQQQQQQW',
      'W.........W',
      'WQQQQQQ.QQW',
      'W..m......W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'MIRAGE GYM - Warden: Celestine. "See beyond the mirage."',
    npcs: {
      a: { sprite: 'celestine', dir: 'down', talk: PK.story.warden({ i: 5, trainer: 'warden6', disc: 'sd11', intro: 'CELESTINE: I sensed you coming from the moment you entered the city. Your thoughts are loud, keeper. Let me quiet them.', win: 'CELESTINE: I did not foresee this... The Mirror Crest is yours.', after: 'CELESTINE: The Hollow Syndicate hides in the Spire. With my crest, the guard will let you pass.', extra: 'CELESTINE: That Disc teaches Mind Crush.' }) },
      e: { sprite: 'mystic', dir: 'left', keeper: 'mirage_gym1', sight: 5 },
      m: { sprite: 'scholar', dir: 'right', keeper: 'mirage_gym2', sight: 5 }
    }
  });

  // ================= Syndicate Spire =================
  D('spire_1f', {
    name: 'Syndicate Spire 1F', interior: true, theme: 'spire', music: 'syndicate',
    rows: [
      'WWWWWWWWWWWWW',
      'WK....a....XW',
      'W...........W',
      'W.QQ.....QQ.W',
      'W...........W',
      'W....e......W',
      'W...........W',
      'WDD.......DDW',
      'W...........W',
      'W...........W',
      'W.....M.....W',
      'WWWWWWWWWWWWW'
    ],
    entry: [6, 10],
    statue: 'A statue of a hollow crown. The Syndicate\'s emblem.',
    warps: [['spire_2f', 11, 2, 'down']],
    npcs: {
      a: { sprite: 'agent', dir: 'down', keeper: 'spire_1', sight: 4 },
      e: { sprite: 'agent', dir: 'right', keeper: 'spire_2', sight: 4 }
    }
  });
  D('spire_2f', {
    name: 'Syndicate Spire 2F', interior: true, theme: 'spire', music: 'syndicate',
    rows: [
      'WWWWWWWWWWWWW',
      'WX.........XW',
      'Wq....e.....W',
      'W...........W',
      'W.WWWWWWWWW.W',
      'W.W...a...W.W',
      'W.W.......W.W',
      'W.W.WWWWW.W.W',
      'W...........W',
      'WWWWWWWWWWWWW'
    ],
    warps: [['spire_3f', 10, 7, 'left'], ['spire_1f', 11, 2, 'down']],
    npcs: {
      q: { sprite: 'captain', dir: 'down', hideIf: 'rook_done', talk: async function (w, n) {
        var r = await w.battle('captain_rook');
        if (r === 'win') { w.setFlag('rook_done'); await w.say('ROOK: Go on, then. The Director is waiting upstairs.'); n.hidden = true; }
      } },
      e: { sprite: 'agent', dir: 'down', keeper: 'spire_3', sight: 3 },
      a: { sprite: 'agent', dir: 'down', keeper: 'spire_4', sight: 1 }
    }
  });
  D('spire_3f', {
    name: 'Syndicate Spire 3F', interior: true, theme: 'spire', music: 'syndicate',
    rows: [
      'WWWWWWWWWWWWW',
      'WWWWKDDDKWWWW',
      'W.....q.....W',
      'W...........W',
      'W.Q.......Q.W',
      'W...........W',
      'W.Q.......Q.W',
      'W..........XW',
      'WWWWWWWWWWWWW'
    ],
    statue: 'The Director\'s trophies: maps of the three guardians\' lairs.',
    shelfText: 'Files labeled "Operation Endless Summer". Most of it is crossed out.',
    warps: [['spire_2f', 1, 2, 'down']],
    npcs: {
      q: { sprite: 'boss', dir: 'down', hideIf: 'spire_clear', talk: S('director') }
    }
  });
})();

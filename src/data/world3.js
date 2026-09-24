// Region 3: Frostcrown Highlands, Crown Summit League, and post-game Starfall.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var D = PK.defMap, IN = PK.interior;
  function S(id) { return function (w, n) { return PK.SCRIPTS[id](w, n); }; }
  function Q(n) { return new Array(n + 1).join('"'); }
  function champ(flag) { return function () { return PK.game.flag('champion') && !PK.game.flag(flag); }; }
  function allCrests() { return PK.game.crestCount() >= 8; }

  // ================= Frostpine Trail =================
  D('frostpine_trail', {
    name: 'Frostpine Trail', theme: 'snow', music: 'snow', region: 'Frostcrown Highlands', weather: 'snow',
    rows: [
      'TTTTTTTTTT::TTTTTTTTTT',
      'TT' + Q(4) + '....::....' + Q(4) + 'TT',
      'TT' + Q(4) + '..a.::....' + Q(4) + 'TT',
      'TT....R...::...R....TT',
      'TTTTT.....::.....TTTTT',
      'TT*..~~~..::..~~~...TT',
      'TT...~~~..::..~~~.e.TT',
      'TT........::........TT',
      'TTvvvvvvv.::.vvvvvvvTT',
      'TT' + Q(7) + '.::.' + Q(6) + '*TT',
      'TT' + Q(7) + '.::.' + Q(7) + 'TT',
      'TT' + Q(3) + 'o' + Q(3) + '.::.' + Q(7) + 'TT',
      'TT........::...mn...TT',
      'TTTT....S.::.....TTTTT',
      'TT~~~~....::.....~~TTT',
      'TT~~~~..s.::......~TTT',
      'TT........::........TT',
      'TTTTTTTTT.::.TTTTTTTTT',
      'TTTTTTTTTT::TTTTTTTTTT'
    ],
    signs: ['FROSTPINE TRAIL - North: Rimeholt  South: Mirage City'],
    items: [['megatonic', 1], ['sd14', 1]],
    npcs: {
      a: { sprite: 'skier', dir: 'right', keeper: 'frost_1', sight: 2 },
      e: { sprite: 'skier', dir: 'left', keeper: 'frost_2', sight: 4 },
      o: { sprite: 'brawler', dir: 'right', keeper: 'frost_4', sight: 4 },
      s: { sprite: 'oldman', dir: 'right', keeper: 'frost_3', sight: 2 },
      m: { sprite: 'skier', dir: 'left', keeper: 'frost_duo', sight: 3 },
      n: { sprite: 'skier', dir: 'left', keeper: 'frost_duo', sight: 3 }
    },
    edges: { s: { to: 'mirage_city', off: 4 }, n: { to: 'rimeholt', off: 0 } },
    enc: {
      grass: [[29, 33, 36, 25], [54, 33, 36, 20], [77, 34, 36, 15], [75, 34, 36, 10], [30, 36, 38, 5], [83, 33, 35, 10], [79, 33, 36, 15, 'night']],
      water: [[87, 33, 37, 40], [73, 34, 37, 20], [28, 35, 37, 20], [64, 34, 36, 20]]
    }
  });

  // ================= Rimeholt =================
  D('rimeholt', {
    name: 'Rimeholt', theme: 'snow', music: 'snow', region: 'Frostcrown Highlands', weather: 'snow',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWOWWWWWWWOWWWWW',
      'TT........:.......e...TT',
      'TT.1######:...2####...TT',
      'TT.#######:...#####...TT',
      'TT.#######:...#####...TT',
      'TT.#######:...#####...TT',
      'TT.#######:.....:.....TT',
      'TT....:...:::::::.....TT',
      'TT....::::::..........TT',
      'TT.3###...::...4###...TT',
      'TT.####...::...####...TT',
      'TT.####...::...####...TT',
      'TT...:....::....:..a..TT',
      'TT...::::::::::::.....TT',
      'TT........::..........TT',
      'TTTTTTTTTT::TTTTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'rh_gym', roof: '#5ab0d8', emblem: 'Frost' },
      { k: 'clinic', to: 'rh_clinic' },
      { k: 'shop', to: 'rh_shop' },
      { k: 'house', to: 'rh_house', roof: '#8a6a4a' }
    ],
    warps: [['frozen_depths', 9, 15, 'up'], ['glacier_grotto', 11, 12, 'up']],
    npcs: { e: { sprite: 'skier', dir: 'down', hideIf: 'champion', text: 'The Glacier Grotto is sealed. Only the League Champion may enter.' }, a: { sprite: 'oldwoman', move: 'wander', text: 'Warden Bjorn\'s gym floor is pure ice. Once you start sliding, you can\'t stop!' } },
    edges: { s: { to: 'frostpine_trail', off: 0 } }
  });
  IN('rh_clinic', 'clinic', { name: 'Rimeholt Clinic' });
  IN('rh_shop', 'shop', { name: 'Rimeholt Shop', stock: ['procapsule', 'megatonic', 'remedy', 'rekindle', 'chargecell', 'hushspraymax', 'frostshard'] });
  IN('rh_house', 'house', { name: 'Trapper\'s Cabin', people: [{ x: 5, y: 3, sprite: 'hiker', dir: 'down', talk: PK.story.gift('got_quick', 'quickcharm', 'Brr! Come warm up. Here, a Quick Charm for the road. It helps a Kit act first sometimes.', 'Stay warm out there, keeper.') }] });
  D('rh_gym', {
    name: 'Rimeholt Gym', interior: true, theme: 'gym_Frost', music: 'snow',
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.........W',
      'WiiiiiiiiiW',
      'WiiiiiiiiiW',
      'W...e.....W',
      'WiiiiiiiiiW',
      'WiiiiiiiiiW',
      'W.......m.W',
      'WiiiiiiiiiW',
      'WiiiiiiiiiW',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'RIMEHOLT GYM - Warden: Bjorn. "Stay frosty."',
    npcs: {
      a: { sprite: 'bjorn', dir: 'down', talk: PK.story.warden({ i: 6, trainer: 'warden7', disc: 'sd06', intro: 'BJORN: Ho! You slid all the way here? My Frost Kits have braved a hundred winters. Let\'s see yours!', win: 'BJORN: Magnificent! The Rime Crest is yours, friend!', after: 'BJORN: The Frozen Depths north of town lead to Shadefall. Mind the ice!', extra: 'BJORN: That Disc teaches Glacier Ray. Very cool.' }) },
      e: { sprite: 'skier', dir: 'right', keeper: 'rime_gym1', sight: 6 },
      m: { sprite: 'skier', dir: 'left', keeper: 'rime_gym2', sight: 7 }
    }
  });

  // ================= Frozen Depths =================
  D('frozen_depths', {
    name: 'Frozen Depths', theme: 'ice', music: 'cave', region: 'Frostcrown Highlands',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWOWWWW',
      'WW...h..WWWWWWWWWWW...WWWW',
      'WW......WWWWWWWWWWW...WWWW',
      'WWWW..WWWWWWWWWW*.....WWWW',
      'WWWW..WWWWWWWWWW..R...WWWW',
      'WW..........iiiiiii...WWWW',
      'WW.a........iiiRiii...WWWW',
      'WW..........iiiiiii..eWWWW',
      'WW..R.......iiiiiii...WWWW',
      'WW..........iiiiiii...WWWW',
      'WWWWWWWW..WWWWWWWWWWWWWWWW',
      'WW*.......~~~~~~.....?WWWW',
      'WW........~~~~~~......WWWW',
      'WW........~~~~~~......WWWW',
      'WWWWWWWWW..WWWWWWWWWWWWWWW',
      'WWWWWWWWWOOWWWWWWWWWWWWWWW'
    ],
    warps: [['shadefall', 4, 16, 'right'], ['rimeholt', 10, 2, 'down'], ['rimeholt', 10, 2, 'down']],
    items: [['sd15', 1], ['vitaltonic', 1]],
    hidden: [['rekindlebloom', 1]],
    npcs: {
      h: { sprite: 'kit:99', cond: champ('g99'), talk: PK.story.guardian(99, 60, 'g99', 'A freezing wind howls through the cavern. The guardian of snow opens its eyes...') },
      a: { sprite: 'oldwoman', dir: 'right', keeper: 'depths_1', sight: 4 },
      e: { sprite: 'scholar', dir: 'left', keeper: 'depths_2', sight: 2 }
    },
    enc: {
      cave: [[29, 37, 40, 15], [54, 37, 40, 20], [87, 38, 40, 10], [30, 39, 41, 10], [88, 40, 42, 5], [38, 39, 41, 5], [77, 38, 40, 10], [36, 39, 41, 5, 'night'], [55, 40, 42, 5], [58, 38, 40, 15]],
      water: [[87, 38, 41, 40], [88, 40, 42, 10], [74, 40, 42, 5], [28, 38, 41, 30], [73, 38, 41, 15]]
    }
  });

  // ================= Shadefall =================
  D('shadefall', {
    name: 'Shadefall', theme: 'spooky', music: 'spooky', region: 'Frostcrown Highlands', weather: 'fog',
    rows: [
      'WWWWWWWWWWWOWWWWWWWWWWWW',
      'TT.........e..........TT',
      'TT..T......::....T....TT',
      'TT.1######.::.2####...TT',
      'TT.#######.::.#####...TT',
      'TT.#######.::.#####...TT',
      'TT.#######.::.#####...TT',
      'TT.#######.::...:.....TT',
      'TT....:....::::::.....TT',
      'TTT...::::::::........TT',
      'TT.3###.....::..4###..TT',
      'TT.####.....::..####..TT',
      'TT.####.....::..####..TT',
      'TT...:......::...:.a..TT',
      'TT...::::::::::::::...TT',
      'TWWW....T.......T.....TT',
      'TWWO..................TT',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    buildings: [
      { k: 'gym', to: 'sf_gym', roof: '#4a3a6a', emblem: 'Shade' },
      { k: 'clinic', to: 'sf_clinic' },
      { k: 'shop', to: 'sf_shop' },
      { k: 'house', to: 'sf_house', roof: '#3a3448' }
    ],
    warps: [['summit_road', 10, 16, 'up'], ['frozen_depths', 21, 2, 'down']],
    npcs: {
      e: { sprite: 'oldman', dir: 'down', hideIf: allCrests, text: 'Summit Road leads to Crown Summit and the High Council. Only keepers with all eight crests may pass.' },
      a: { sprite: 'occult', move: 'wander', text: 'Warden Morwen\'s gym is pitch black. Lumen and Brawl moves shine in the dark...' }
    }
  });
  IN('sf_clinic', 'clinic', { name: 'Shadefall Clinic' });
  IN('sf_shop', 'shop', { name: 'Shadefall Shop', stock: ['procapsule', 'megatonic', 'vitaltonic', 'panacea', 'rekindle', 'chargecell', 'hushspraymax', 'umbralshard'] });
  IN('sf_house', 'house', { name: 'Occultist\'s House', people: [{ x: 5, y: 3, sprite: 'occult', dir: 'down', talk: PK.story.gift('got_sd13x', 'sd13', 'The shadows told me to give you this Skill Disc...', 'Umbra Orb. Use it wisely.') }] });
  D('sf_gym', {
    name: 'Shadefall Gym', interior: true, theme: 'gym_Shade', music: 'spooky', dark: true,
    rows: [
      'WWWWWWWWWWW',
      'W....a....W',
      'W.W.W.W.W.W',
      'W.........W',
      'WWWW.WWWWWW',
      'W..e......W',
      'W.WWWWWWW.W',
      'W.........W',
      'WWWWWWW.WWW',
      'W...m.....W',
      'W.........W',
      'WQ.......QW',
      'W.........W',
      'W....M....W'
    ],
    entry: [5, 13],
    statue: 'SHADEFALL GYM - Warden: Morwen. "Fear the dark? Then become it."',
    npcs: {
      a: { sprite: 'morwen', dir: 'down', talk: PK.story.warden({ i: 7, trainer: 'warden8', disc: 'sd13', intro: 'MORWEN: You found me in the dark. Few do. Let us see if your light can endure my shadows.', win: 'MORWEN: ...Brilliant. The Umbra Crest is yours. All eight.', after: 'MORWEN: Summit Road is north of town. The High Council awaits at Crown Summit.', extra: 'MORWEN: That Disc teaches Umbra Orb.' }) },
      e: { sprite: 'occult', dir: 'right', keeper: 'shade_gym1', sight: 4 },
      m: { sprite: 'occult', dir: 'right', keeper: 'shade_gym2', sight: 3 }
    }
  });

  // ================= Summit Road =================
  D('summit_road', {
    name: 'Summit Road', theme: 'cave', music: 'cave', region: 'Frostcrown Highlands',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWOWWWWWWWWWWWW',
      'WW.........u..........WW',
      'WW..R..............R..WW',
      'WW......a.............WW',
      'WWWWWWW....WWWWWWWWWWWWW',
      'WW*........WWWWWWW....WW',
      'WW.........WWWWWWW.e..WW',
      'WW..RR.............R..WW',
      'WWWWWWWWWWWWWWW.....WWWW',
      'WW*....?......s.......WW',
      'WW....................WW',
      'WW..WWWWWWWWWWWWW.....WW',
      'WW..WWWWWWWWWWWWW.R...WW',
      'WW..........q.........WW',
      'WW...R............R..*WW',
      'WWWWWWWWWW..WWWWWWWWWWWW',
      'WWWWWWWWWWOOWWWWWWWWWWWW'
    ],
    warps: [['crown_summit', 9, 11, 'up'], ['shadefall', 11, 1, 'down'], ['shadefall', 11, 1, 'down']],
    items: [['vitaltonic', 1], ['sd20', 1], ['rekindlebloom', 1]],
    hidden: [['panacea', 2]],
    npcs: {
      u: { sprite: 'rival', dir: 'down', hideIf: 'rival5', talk: S('rival5') },
      a: { sprite: 'oldman', dir: 'right', keeper: 'summit_1', sight: 5 },
      e: { sprite: 'brawler', dir: 'left', keeper: 'summit_2', sight: 4 },
      s: { sprite: 'mystic', dir: 'down', keeper: 'summit_3', sight: 1 },
      q: { sprite: 'oldman', dir: 'down', keeper: 'summit_4', sight: 1 }
    },
    enc: {
      cave: [[24, 44, 47, 15], [55, 45, 48, 10], [67, 45, 48, 10], [38, 45, 48, 10], [80, 46, 48, 10, 'night'], [32, 45, 47, 10], [40, 45, 48, 5], [39, 44, 46, 5], [76, 46, 48, 10], [82, 45, 47, 10], [36, 46, 48, 5]]
    }
  });

  // ================= Crown Summit & League =================
  D('crown_summit', {
    name: 'Crown Summit', theme: 'snow', music: 'league', region: 'Frostcrown Highlands', weather: 'snow',
    rows: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WWW..1########....WW',
      'WWW..#########....WW',
      'WWW..#########....WW',
      'WWW..#########....WW',
      'WWW..#########....WW',
      'WWW..#########....WW',
      'WW.......:........WW',
      'WW..L....:....L...WW',
      'WW.......:........WW',
      'WW....S..:........WW',
      'WW.......:........WW',
      'WWWWWWWWWOWWWWWWWWWW'
    ],
    buildings: [{ k: 'league', to: 'league_lobby' }],
    signs: ['CROWN SUMMIT - The Kit League. Only the finest keepers stand here.'],
    warps: [['summit_road', 11, 2, 'down']]
  });
  D('league_lobby', {
    name: 'Kit League', interior: true, theme: 'league', music: 'league', isClinic: true,
    rows: [
      'WWWWWWWWWWW',
      'WWWWWXWWWWW',
      'W.........W',
      'W.HaH..DDDW',
      'W.ccc..cn.W',
      'W.........W',
      'Wp.,,,,,.pW',
      'W....M....W',
      'WWWWWWWWWWW'
    ],
    entry: [5, 7],
    warps: [['council1', 5, 8, 'up']],
    npcs: {
      a: { sprite: 'nurse', dir: 'down', talk: 'clinic' },
      n: { sprite: 'clerk', dir: 'left', talk: 'shop', stock: ['procapsule', 'vitaltonic', 'panacea', 'rekindle', 'rekindlebloom', 'chargecell', 'megatonic'] }
    }
  });
  function council(id, n, theme, next, script, name, sprite, trainer) {
    D(id, {
      name: name, interior: true, theme: theme, music: 'league',
      rows: [
        'WWWWWWWWWWW',
        'WWWWWXWWWWW',
        'WQ..ea...QW',
        'W.........W',
        'WQ.......QW',
        'W.........W',
        'WQ.......QW',
        'W.........W',
        'W.........W',
        'WWWWWWWWWWW'
      ],
      statue: name + ' - Kit League.',
      warps: [[next, 5, 8, 'up']],
      npcs: {
        a: { sprite: sprite, dir: 'down', hideIf: 'council' + n, talk: S(script) },
        e: { sprite: sprite, dir: 'right', cond: 'council' + n, text: PK.TRAINERS[trainer].lose }
      }
    });
  }
  council('council1', 1, 'gym_Brawl', 'council2', 'council1', 'Hall of Might', 'dax', 'council1');
  council('council2', 2, 'gym_Venom', 'council3', 'council2', 'Hall of Venom', 'hemlock', 'council2');
  council('council3', 3, 'gym_Metal', 'council4', 'council3', 'Hall of Steel', 'orrin', 'council3');
  council('council4', 4, 'gym_Wyrm', 'champion_room', 'council4', 'Hall of Wyrms', 'sable', 'council4');
  D('champion_room', {
    name: "Champion's Hall", interior: true, theme: 'league', music: 'league',
    rows: [
      'WWWWWWWWWWW',
      'WWWWWXWWWWW',
      'WQ..ea...QW',
      'W...,,,...W',
      'WQ..,,,..QW',
      'W...,,,...W',
      'WQ..,,,..QW',
      'W.........W',
      'W.........W',
      'WWWWWWWWWWW'
    ],
    statue: "CHAMPION'S HALL",
    warps: [['hall_of_fame', 5, 6, 'up']],
    npcs: {
      a: { sprite: 'castor', dir: 'down', hideIf: 'champion', talk: S('champion') },
      e: { sprite: 'castor', dir: 'right', cond: 'champion', text: 'CASTOR: The Hall of Fame is through that door, Champion.' }
    }
  });
  D('hall_of_fame', {
    name: 'Hall of Fame', interior: true, theme: 'league', music: 'league',
    rows: [
      'WWWWWWWWWWW',
      'WQ...Q...QW',
      'W.........W',
      'W...,,,...W',
      'W...,a,...W',
      'W...,,,...W',
      'W.........W',
      'WWWWWWWWWWW'
    ],
    statue: 'The names of every Champion of Lumora are carved here.',
    onEnter: 'hall',
    npcs: { a: { id: 'prof', sprite: 'prof', dir: 'down', text: 'PROF. VALE: I\'m so proud of you, {PLAYER}!' } }
  });

  // ================= Post-game: Starfall =================
  D('starfall_sea', {
    name: 'Starfall Sea', theme: 'coast', music: 'coast', region: 'Southern Sea',
    rows: [
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~R~~~~~~~R~~~~TT',
      'TT~~~~~~~..~~~~~~~TT',
      'TT~~~~~~.a..~~~~~~TT',
      'TT~~~~~~~..~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~R~~~~~~~~~~R~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~..*~TT',
      'TT~~~~~~~~~~~~..~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~..~~~~~~~~~~~~TT',
      'TT~~.e~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~R~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~TT'
    ],
    items: [['rekindlebloom', 1]],
    npcs: {
      a: { sprite: 'oldman', dir: 'down', keeper: 'star_1', sight: 3 },
      e: { sprite: 'mystic', dir: 'right', keeper: 'star_2', sight: 4 }
    },
    edges: { n: { to: 'brookhollow', off: 0 }, s: { to: 'starfall_ruins', off: 0 } },
    enc: { water: [[74, 50, 54, 10], [65, 50, 54, 15], [28, 50, 54, 25], [34, 50, 53, 20], [88, 50, 53, 10], [49, 50, 54, 15], [94, 52, 55, 5]] }
  });
  D('starfall_ruins', {
    name: 'Starfall Ruins', theme: 'ruins', music: 'ruins', region: 'Southern Sea',
    rows: [
      'WW~~~~~~~~~~~~~~~~WW',
      'WW~~~~~~~~~~~~~~~~WW',
      'WW................WW',
      'WW..T..........T..WW',
      'WW.....dddddd.....WW',
      'WW..T..dQddQd..T..WW',
      'WW.....dddddd.....WW',
      'WW.....ddhddd.....WW',
      'WW.....dddddd.....WW',
      'WW..T..dQddQd..T..WW',
      'WW.....dddddd.....WW',
      'WW..*...........?.WW',
      'WWWWWWWWWWWWWWWWWWWW'
    ],
    statue: function () { return PK.game.count('oldmap') ? 'The carving matches your Old Star Map: "Where the three guardians rest, the first light returns."' : 'An ancient carving of a small Kit with a halo of stars.'; },
    items: [['sd17', 1]],
    hidden: [['luckyclover', 1]],
    npcs: {
      h: {
        sprite: 'kit:100', talk: PK.story.guardian(100, 65, 'g100', 'A tiny Kit made of starlight floats above the altar. It seems to recognize you...'),
        cond: function () { var g = PK.game; return g.flag('champion') && g.flag('g97') && g.flag('g98') && g.flag('g99') && !g.flag('g100') && g.count('oldmap') > 0; }
      }
    },
    edges: { n: { to: 'starfall_sea', off: 0 } },
    enc: { grass: [] }
  });
})();

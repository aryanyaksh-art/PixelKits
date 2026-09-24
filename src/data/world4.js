// Extra areas: Wildwood Reserve (safari park), hidden caves, and the post-game Moonlit Isles.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var D = PK.defMap, IN = PK.interior, S = PK.SCRIPTS, TR = PK.TRAINERS;
  function st() { return PK.game.state; }
  function flag(f) { return function () { return PK.game.flag(f); }; }
  function K(id, title, name, sprite, team, o) {
    TR[id] = Object.assign({ id: id, title: title, name: name, sprite: sprite, team: team, reward: 20, ai: 1 }, o || {});
  }

  // ================= Wildwood Reserve (safari) =================
  var SAFARI_FEE = 500, SAFARI_BALLS = 30, SAFARI_STEPS = 500;
  S.safari_desk = async function (w) {
    var s = st();
    if (s.safari) return w.say('ATTENDANT: Enjoy the Reserve! Head through the door on the right.');
    await w.say('ATTENDANT: Welcome to the Wildwood Reserve! Rare Kits roam free here.');
    await w.say('ATTENDANT: For $' + SAFARI_FEE + ' you get ' + SAFARI_BALLS + ' Safari Capsules and ' + SAFARI_STEPS + ' steps. You can\'t battle in the Reserve - just toss Snacks, Clap, and catch!');
    if (!(await w.yesno('Would you like to enter for $' + SAFARI_FEE + '?'))) return w.say('ATTENDANT: Come back any time!');
    if (s.money < SAFARI_FEE) return w.say('ATTENDANT: Oh dear, you don\'t have enough money.');
    if (s.party.length >= 6 && s.box.length >= 300) return w.say('ATTENDANT: Your Storage Box is full! Make some room first.');
    s.money -= SAFARI_FEE;
    if (PK.audio) PK.audio.sfx('buy');
    s.safari = { balls: SAFARI_BALLS, steps: SAFARI_STEPS };
    await w.say(s.player.name + ' received ' + SAFARI_BALLS + ' Safari Capsules!');
    await w.say('ATTENDANT: We\'ll call you back when your steps run out. Good luck!');
  };
  S.safari_door = async function (w) {
    if (st().safari) return;
    await w.say('ATTENDANT: Excuse me! Please sign in at the desk first.');
    await w.movePlayer('d');
  };
  D('wildwood_gate', {
    name: 'Reserve Lodge', interior: true, theme: 'shop', music: 'shop',
    rows: [
      'WWYWWWWWOW',
      'W...a...!W',
      'W..ccc...W',
      'W........W',
      'Wp......pW',
      'W........W',
      'WWWWMWWWWW'
    ],
    entry: [4, 6],
    warps: [['wildwood_reserve', 15, 21, 'up']],
    events: [{ run: 'safari_door' }],
    npcs: {
      a: { sprite: 'clerk', dir: 'down', talk: 'safari_desk' }
    }
  });
  D('wildwood_reserve', {
    name: 'Wildwood Reserve', theme: 'vale', music: 'safari', region: 'Sunscar Coast', safari: true,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TT""""""""TTTTTT"""""""*""""""TT',
      'TT""""""""TT...TT"""""""""""""TT',
      'TT""?"""""...,....."""""""""""TT',
      'TT""""""""TT...TT"""TTTT""""""TT',
      'TTTT..TTTTTT.:.TTTTTT~~~~~..TTTT',
      'TT......,,....:....TT~~~~~~...TT',
      'TT.~~~~.......:......~~~~~~~..TT',
      'TT.~~~~~..""""":"""".~~~~~~~..TT',
      'TT..~~~...""""":""""..........TT',
      'TT........""""":""""..""""....TT',
      'TTTT""""..""""":""""..""""*...TT',
      'TT"""""".......:......""""....TT',
      'TT""""""..TTTT.:.TTT..........TT',
      'TT""*"""..TTTT.:.TTT..""""""..TT',
      'TTTT......,,...:......""""""..TT',
      'TT""""....,,...:......""?"""..TT',
      'TT""""""......S:..............TT',
      'TT""""""""....:::::::.........TT',
      'TTTTTTTTT......:.......TTTTTTTTT',
      'TTTTTTTTTTTT...:....TTTTTTTTTTTT',
      'TTTTTTTTTTTTTT.:.TTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTT.O.TTTTTTTTTTTTTTT'
    ],
    signs: ['WILDWOOD RESERVE - Please be gentle with the Kits!'],
    warps: [['wildwood_gate', 8, 1, 'down']],
    items: [['boostcandy', 1], ['swiftroot', 1], ['mightroot', 1]],
    hidden: [['boostcandy', 1], ['focusroot', 1]],
    enc: {
      rate: 1.3,
      grass: [[72, 24, 28, 12], [81, 24, 27, 12], [70, 24, 27, 14], [83, 24, 27, 12], [46, 24, 27, 12], [77, 25, 28, 8], [89, 26, 29, 6], [96, 26, 29, 6], [52, 24, 27, 10], [93, 28, 30, 3], [105, 25, 28, 5, 'night']],
      water: [[64, 24, 28, 30], [87, 25, 28, 20], [52, 24, 27, 30], [73, 26, 29, 20]]
    }
  });

  // ================= Hidden caves =================
  K('hollow_hermit', 'Hermit', 'Osric', 'oldman', [[90, 27], [92, 27], [95, 28]], { intro: 'Few find this hollow. Fewer leave it unbeaten.', after: 'The hollow keeps its secrets well. You found one of them.', ai: 2, reward: 60 });
  D('hidden_hollow', {
    name: 'Hidden Hollow', theme: 'cave', music: 'cave', region: 'Verdant Vale', secret: true, dungeon: true,
    rows: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WW*......WWW.....?WW',
      'WW...R.......R....WW',
      'WW..WWWW....WWWW..WW',
      'WW..WWWW.a..WWWW..WW',
      'WW........R.......WW',
      'WWWW..R.......R.WWWW',
      'WW......WWWW......WW',
      'WW..*...WWWW...*..WW',
      'WW................WW',
      'WWWWWWWWW..WWWWWWWWW',
      'WWWWWWWWWOWWWWWWWWWW'
    ],
    warps: [['mossy_woods', 7, 16, 'up']],
    items: [['boostcandy', 1], ['sd11', 1], ['guardroot', 1]],
    hidden: [['boostcandy', 1]],
    npcs: { a: { sprite: 'oldman', dir: 'down', keeper: 'hollow_hermit', sight: 3 } },
    enc: { cave: [[90, 22, 26, 20], [92, 22, 26, 20], [95, 23, 26, 15], [23, 22, 25, 20], [37, 22, 25, 15], [35, 22, 26, 10]] }
  });
  K('grotto_sage', 'Ice Sage', 'Hrafna', 'skier', [[88, 62], [78, 62], [55, 63], [41, 62]], { intro: 'Only the Champion may walk the grotto. Show me the frost in your heart!', after: 'The glacier remembers every footstep. Yours will be remembered too.', ai: 2, items: 2, reward: 80 });
  D('glacier_grotto', {
    name: 'Glacier Grotto', theme: 'ice', music: 'cave', region: 'Frostcrown Highlands', secret: true, dungeon: true,
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWW',
      'WW*.....iiiiiii....*WW',
      'WW......iiiiiii......W',
      'WW..R...iiRiiii..R..WW',
      'WW......iiiiiii.....WW',
      'WWWWWW..iiiiiiR..WWWWW',
      'WW.......iiii.......WW',
      'WW..R....iiii...a...WW',
      'WW.......iiii.......WW',
      'WW..WWWWWiiiiWWWW...WW',
      'WW...?...iiii.....*.WW',
      'WW.......iiii.......WW',
      'WWWWWWWWW....WWWWWWWWW',
      'WWWWWWWWWW.OWWWWWWWWWW'
    ],
    warps: [['rimeholt', 18, 2, 'down']],
    items: [['boostcandy', 2], ['rekindlebloom', 1], ['vigorroot', 1], ['calmroot', 1]],
    hidden: [['boostcandy', 1]],
    npcs: { a: { sprite: 'skier', dir: 'left', keeper: 'grotto_sage', sight: 3 } },
    enc: { cave: [[88, 55, 60, 20], [78, 55, 59, 15], [55, 56, 60, 15], [30, 55, 59, 20], [57, 56, 60, 10], [74, 56, 60, 10], [87, 52, 56, 15]] }
  });

  // ================= Moonlit Isles (post-game) =================
  S.ferry_saltmarsh = async function (w) {
    if (!PK.game.count('ferrypass')) return w.say('SAILOR: This ferry sails to the Moonlit Isles, far to the southeast. Passengers need a Ferry Pass, though.');
    if (!(await w.yesno('SAILOR: Ahoy, Champion! All aboard for the Moonlit Isles?'))) return w.say('SAILOR: The sea will be waiting!');
    await w.ferry('emberisle', 12, 15, 'up');
  };
  S.ferry_emberisle = async function (w) {
    if (!(await w.yesno('SAILOR: Heading back to Saltmarsh?'))) return w.say('SAILOR: Enjoy the isles!');
    await w.ferry('saltmarsh', 22, 8, 'right');
  };
  S.relearner = async function (w) {
    var s = st(), FEE = 1000;
    await w.say('RECALL MASTER ODO: I help Kits remember moves they have forgotten. My fee is $' + FEE + '.');
    if (!(await w.yesno('Would you like a Kit to remember a move?'))) return w.say('ODO: Memories are precious. Come again.');
    var i = await PK.menus.party({ mode: 'item' });
    if (i < 0) return;
    var k = s.party[i];
    var known = k.moves.map(function (m) { return m.id; });
    var list = [];
    PK.KITS[k.id].learn.forEach(function (e) { if (e[0] <= k.level && known.indexOf(e[1]) < 0 && list.indexOf(e[1]) < 0) list.push(e[1]); });
    // moves from earlier stages too
    var pre = PK.KITS[k.id].from;
    while (pre) { PK.KITS[pre].learn.forEach(function (e) { if (e[0] <= k.level && known.indexOf(e[1]) < 0 && list.indexOf(e[1]) < 0) list.push(e[1]); }); pre = PK.KITS[pre].from; }
    if (!list.length) return w.say('ODO: This Kit has no forgotten moves to remember.');
    var items = list.map(function (id) { var m = PK.MOVES[id]; return { label: m.name, right: m.type }; });
    var c = await PK.ui.menu(items, { x: 40, y: 4, w: 196, maxRows: 8, title: 'Remember which move?' });
    if (c < 0) return w.say('ODO: Come back whenever you like.');
    if (s.money < FEE) return w.say("ODO: I'm afraid you don't have enough money.");
    var before = k.moves.map(function (m) { return m.id; }).join();
    await PK.menus.learnMove(k, list[c]);
    if (k.moves.map(function (m) { return m.id; }).join() !== before) { s.money -= FEE; await w.say('ODO: Splendid. That will be $' + FEE + '. Thank you!'); }
  };
  S.isle_elder = async function (w) {
    if (PK.game.flag('vesper_done')) return w.say('ELDER: The moon shines peacefully over the shrine again. Thank you, Champion.');
    await w.say('ELDER: Strangers in dark coats came to Hollow Isle, up north past the tide pools.');
    await w.say('ELDER: They talk of waking the Moon Guardian at the old shrine. Nothing good comes from forcing a guardian awake...');
  };
  S.vesper = async function (w, n) {
    if (PK.game.flag('vesper_done')) return;
    await w.say('VESPER: So the Champion followed us all the way out here. How flattering.');
    await w.say('VESPER: The Director failed because he chased weather. I want the moon itself. The Moon Guardian will answer to me!');
    await w.say('VESPER: My partner and I will show you what the Syndicate has become!');
    var r = await w.battle('isle_boss');
    if (r !== 'win') return;
    await w.say('VESPER: ...Impossible. Fine. Keep your precious shrine.');
    await w.say('VESPER: But the moon will rise again, Champion. And so will we.');
    await PK.fx.fadeOut(20);
    w.setFlag('vesper_done');
    if (n) n.hidden = true;
    var g = w.npc('grunt'); if (g) g.hidden = true;
    await PK.fx.fadeIn(20);
    await w.say('The Syndicate agents scattered. The path to the Moonlit Shrine is open now.');
  };

  K('isle_1', 'Sailor', 'Brenna', 'sailor', [[74, 56], [49, 57]], { intro: 'Welcome to the isles! Here\'s a proper island greeting!', after: 'Island life suits you.' });
  K('isle_2', 'Firewalker', 'Kai', 'brawler', [[91, 57], [67, 57], [104, 58]], { intro: 'The peak is hot, and so are my Kits!', after: 'I got burned. Figuratively.' });
  K('isle_3', 'Mystic', 'Sorrel', 'mystic', [[103, 57], [36, 58]], { intro: 'The embers whisper your name...', after: 'The embers were wrong.' });
  K('isle_4', 'Hiker', 'Bram', 'hiker', [[67, 58], [24, 58], [57, 59]], { intro: 'I climb this peak every day!', after: 'Back down the mountain I go.' });
  K('isle_duo1', 'Beach Pals', 'Nell', 'girl', [[101, 56], [107, 57], [28, 57]], { double: true, partner: { name: 'Rafe', sprite: 'swimmer', lose: 'RAFE: Wipeout!' }, intro: 'NELL: Two against two, beach rules!', after: 'NELL: Good game! Rafe owes me lunch.', reward: 30 });
  K('isle_5', 'Swimmer', 'Marina', 'swimmer', [[108, 58], [65, 58]], { intro: 'The water here is warm all year!', after: 'Time to dry off.' });
  K('isle_6', 'Angler', 'Pike', 'sailor', [[74, 58], [73, 58], [107, 59]], { intro: 'Caught something big today. It\'s you!', after: 'The one that got away...' });
  K('isle_7', 'Occultist', 'Wren', 'occult', [[106, 59], [61, 59], [36, 60]], { intro: 'The moon is watching us...', after: 'The moon has seen enough.' });
  K('isle_duo2', 'Agents', 'Syndicate', 'agent', [[80, 59], [84, 59], [53, 60]], { double: true, partner: { name: 'Syndicate', sprite: 'agent' }, intro: 'You won\'t reach Vesper!', after: 'Vesper will finish you off...', music: 'syndicate', title2: 'Agent' });
  K('isle_8', 'Agent', 'Syndicate', 'agent', [[18, 60], [36, 60]], { intro: 'Hollow Isle belongs to the Syndicate now!', after: 'Ugh... the Admin will be furious.', music: 'syndicate', reward: 40 });
  K('isle_boss', 'Admin', 'Vesper', 'agent', [[80, 63], [106, 64], [61, 64], [104, 65], [36, 66]], { double: true, partner: { name: 'Grunt Tallis', sprite: 'agent', lose: 'TALLIS: Admin, retreat!' }, ai: 2, items: 2, music: 'syndicate', reward: 80, lose: 'VESPER: I... lost?' });
  K('isle_9', 'Ranger', 'Faye', 'girl', [[109, 60], [105, 60], [78, 61]], { intro: 'Hollow Woods are sacred. Show me your respect in battle!', after: 'You fought with honor.' });
  K('isle_10', 'Ranger', 'Doran', 'boy', [[102, 61], [106, 61], [80, 61]], { intro: 'Nobody passes without a battle!', after: 'Go on, then.' });

  D('emberisle', {
    name: 'Emberisle', theme: 'coast', music: 'island', region: 'Moonlit Isles', secret: true,
    rows: [
      'TTTTTTTTTTT::TTTTTTTTTTT',
      'TT.........::.........TT',
      'TT.1######.::..2####..TT',
      'TT.#######.::..#####..TT',
      'TT.#######.::..#####..TT',
      'TT.#######.::..#####..TT',
      'TT...:.....::....:....TT',
      'TT...::::::::::::::::::.',
      'TT....S......:........TT',
      'TT.3###......:...e....TT',
      'TT.####.,,,..:........TT',
      'TT.####.,,,..:..a.....TT',
      'TT...:.......:........TT',
      'TT...:::::::::........TT',
      'TT..........:.........TT',
      'TT~~~~~~~~~~=h~~~~~~~~TT',
      'TT~~~~~~~~~~==~~~~~~~~TT',
      'TT~~~~~~~~~~~~~~~~~~~~TT'
    ],
    buildings: [
      { k: 'clinic', to: 'ei_clinic' },
      { k: 'shop', to: 'ei_shop' },
      { k: 'house', to: 'ei_house', roof: '#d0603a' }
    ],
    signs: ['EMBERISLE - Gateway to the Moonlit Isles. North: Ember Peak  East: Tidepool Isle'],
    npcs: {
      h: { sprite: 'sailor', dir: 'up', talk: 'ferry_emberisle' },
      a: { sprite: 'oldman', dir: 'down', talk: 'isle_elder' },
      e: { sprite: 'girl', move: 'wander', text: 'Recall Master Odo lives in the red-roofed house. He can make Kits remember forgotten moves!' }
    },
    edges: { n: { to: 'emberisle_peak', off: 0 }, e: { to: 'tidepool_isle', off: 0 } },
    enc: { water: [[27, 54, 58, 30], [101, 55, 58, 20], [107, 55, 58, 15], [74, 56, 59, 15], [108, 56, 59, 10]] }
  });
  IN('ei_clinic', 'clinic', { name: 'Emberisle Clinic' });
  IN('ei_shop', 'shop', { name: 'Emberisle Shop', stock: ['procapsule', 'megatonic', 'vitaltonic', 'panacea', 'rekindle', 'chargecell', 'hushspraymax', 'exitcord', 'vigorroot', 'calmroot'] });
  IN('ei_house', 'house', { name: "Odo's House", people: [{ x: 5, y: 3, sprite: 'oldman', dir: 'down', talk: 'relearner' }] });

  D('emberisle_peak', {
    name: 'Ember Peak', theme: 'desert', music: 'desert', region: 'Moonlit Isles', secret: true, weather: 'embers',
    rows: [
      'WWWWWWWWWWWWWWWWWWWWWW',
      'WWW*....lll....R...WWW',
      'WW....llllll........WW',
      'WW..R..llll...a.R...WW',
      'WW......ll..........WW',
      'WW..""""....""""""..WW',
      'WW..""""....""""""..WW',
      'WW..""""....""e"""..WW',
      'WWvvvvvvv..vvvvvvvvvWW',
      'WW.......:.........*WW',
      'WW.R.....:....R.....WW',
      'WW..q....:..lll.....WW',
      'WW.......:..lll..?..WW',
      'WW""""""":""""""""..WW',
      'WW""""""":""""s"""..WW',
      'WW"""""""::::::::...WW',
      'WW.............:....WW',
      'WWWWWWWWWWW::WWWWWWWWW'
    ],
    items: [['boostcandy', 1], ['sd02', 1]],
    hidden: [['mightroot', 1]],
    npcs: {
      a: { sprite: 'brawler', dir: 'left', keeper: 'isle_2', sight: 4 },
      e: { sprite: 'mystic', dir: 'down', keeper: 'isle_3', sight: 1 },
      q: { sprite: 'hiker', dir: 'right', keeper: 'isle_4', sight: 4 },
      s: { sprite: 'sailor', dir: 'left', keeper: 'isle_1', sight: 3 }
    },
    edges: { s: { to: 'emberisle', off: 0 } },
    enc: { grass: [[103, 54, 58, 25], [66, 55, 58, 20], [91, 56, 58, 8], [44, 54, 57, 20], [45, 57, 59, 10], [67, 57, 59, 10], [104, 58, 59, 5, 'night']] }
  });

  D('tidepool_isle', {
    name: 'Tidepool Isle', theme: 'coast', music: 'island', region: 'Moonlit Isles', secret: true,
    rows: [
      'TTTTTTTTTTTTTT::TTTTTTTT',
      'TT~~~~.......::.....~~TT',
      'TT~~~~..mn...::.....~~TT',
      'TT~~~.,,,....::......~TT',
      'TT~~...""""..::..""""..T',
      'TT~....""""..::..""""...',
      'TT.....""""..::..""""...',
      '.......""""::::..""e"...',
      'TT.........:.........TTT',
      'TT..R......:...R.....~~T',
      'TT~~~~.....:.....~~~~~~T',
      'TT~~~~~....:....~~~~~~~T',
      'TT~~~~~~...:...~~~~~~~~T',
      'TT~~~~~~..q:..~~~~~O~~~T',
      'TT~~~~~~...:..~~~~.*.~~T',
      'TT~~~~~~~~~~~~~~~~~~~~TT',
      'TTTTTTTTTTTTTTTTTTTTTTTT'
    ],
    warps: [['sunken_grotto', 9, 12, 'up']],
    items: [['boostcandy', 1]],
    npcs: {
      m: { sprite: 'girl', dir: 'down', keeper: 'isle_duo1', sight: 2 },
      n: { sprite: 'swimmer', dir: 'down', keeper: 'isle_duo1', sight: 2 },
      e: { sprite: 'swimmer', dir: 'left', keeper: 'isle_5', sight: 3 },
      q: { sprite: 'sailor', dir: 'right', keeper: 'isle_6', sight: 1 }
    },
    edges: { w: { to: 'emberisle', off: 0 }, n: { to: 'hollow_isle', off: -3 } },
    enc: {
      grass: [[101, 55, 58, 30], [107, 56, 59, 15], [48, 55, 58, 20], [27, 55, 58, 20], [102, 58, 60, 5], [33, 56, 58, 10]],
      water: [[108, 56, 59, 20], [73, 56, 59, 25], [64, 55, 58, 25], [28, 55, 58, 20], [74, 58, 60, 10]]
    }
  });
  D('sunken_grotto', {
    name: 'Sunken Grotto', theme: 'cave', music: 'cave', region: 'Moonlit Isles', secret: true, dungeon: true,
    rows: [
      'WWWWWWWWWWWWWWWWWWWW',
      'WW*..~~~~~~~~~~..*WW',
      'WW...~~~~~~~~~~...WW',
      'WW...~~~.R..~~~...WW',
      'WW...~~~....~~~...WW',
      'WW..R~~~....~~~R..WW',
      'WW...............?WW',
      'WWWWWW...RR...WWWWWW',
      'WW*.....~~~~.......W',
      'WW......~~~~....*.WW',
      'WW..R...~~~~...R..WW',
      'WW................WW',
      'WWWWWWWWW.OWWWWWWWWW'
    ],
    warps: [['tidepool_isle', 19, 14, 'down']],
    items: [['boostcandy', 1], ['sd06', 1], ['rekindlebloom', 1], ['swiftroot', 1]],
    hidden: [['panacea', 1]],
    enc: {
      cave: [[102, 58, 61, 15], [65, 57, 60, 25], [34, 57, 60, 20], [49, 57, 60, 20], [107, 57, 60, 15], [74, 58, 61, 5]],
      water: [[74, 58, 61, 25], [65, 57, 60, 30], [28, 57, 60, 30], [102, 58, 61, 15]]
    }
  });

  D('hollow_isle', {
    name: 'Hollow Isle', theme: 'spooky', music: 'island', region: 'Moonlit Isles', secret: true,
    rows: [
      'TTTTTTTTTTT::TTTTTTTTTTT',
      'TT.........xT.........TT',
      'TT.1######.::.........TT',
      'TT.#######.::..2#####.TT',
      'TT.#######.::..######.TT',
      'TT.#######.::..######.TT',
      'TT.#######.::..######.TT',
      'TT.....:...::.....:...TT',
      'TT.....:::::::::::::..TT',
      'TT...S......:.....L...TT',
      'TT..........:......e..TT',
      'TT..L.......:.........TT',
      'TT..........:.........TT',
      'TTTTTTTTTTT::TTTTTTTTTTT'
    ],
    buildings: [
      { k: 'clinic', to: 'hi_clinic' },
      { k: 'bighouse', to: 'hollow_base', roof: '#5a3a6a' }
    ],
    signs: ['HOLLOW ISLE - Where the moon rises closest.'],
    npcs: {
      x: { sprite: 'agent', dir: 'down', hideIf: 'vesper_done', text: 'AGENT: The woods are closed! Syndicate business!', block: true },
      e: { sprite: 'oldwoman', move: 'wander', text: 'Those Syndicate people took over the old manor. They keep looking up at the moon...', textIf: [['vesper_done', 'The manor is quiet again. Thank you, dear.']] }
    },
    edges: { s: { to: 'tidepool_isle', off: 3 }, n: { to: 'hollow_isle_woods', off: -1 } }
  });
  IN('hi_clinic', 'clinic', { name: 'Hollow Isle Clinic', npcs: { extra: { sprite: 'sailor', dir: 'right', text: 'Moonveil, the Moon Guardian... they say it only shows itself to those who protect the shrine.' } } });
  D('hollow_base', {
    name: 'Syndicate Manor', interior: true, theme: 'spire', music: 'syndicate', dungeon: true,
    rows: [
      'WWWWWWYWWWWWW',
      'W.....a.....W',
      'W.t.......t.W',
      'W...........W',
      'W.m.......n.W',
      'W...........W',
      'WK.........KW',
      'W...........W',
      'WWWWWWMWWWWWW'
    ],
    entry: [6, 8],
    npcs: {
      a: { id: 'vesper', sprite: 'agent', dir: 'down', hideIf: 'vesper_done', talk: 'vesper' },
      m: { id: 'grunt', sprite: 'agent', dir: 'right', keeper: 'isle_duo2', sight: 3, hideIf: 'vesper_done' },
      n: { sprite: 'agent', dir: 'left', keeper: 'isle_duo2', sight: 3, hideIf: 'vesper_done' }
    }
  });
  D('hollow_isle_woods', {
    name: 'Hollow Woods', theme: 'spooky', music: 'forest', region: 'Moonlit Isles', secret: true,
    rows: [
      'TTTTTTTTTTTOTTTTTTTTTT',
      'TT"""""...:..."""""TTT',
      'TT"""""...:...""a""TTT',
      'TT..TTTT..:..TTTT...TT',
      'TT..TTTT..:..TTTT.*.TT',
      'TT""""....:...."""".TT',
      'TT""""..q.:...."""".TT',
      'TTTTTTTT..:..TTTTTTTTT',
      'TT"""""...:..."""""?TT',
      'TT""""".e.:..."""""..T',
      'TT......::::.........T',
      'TTTTTTTTT.:.TTTTTTTTTT',
      'TTTTTTTTT.:.TTTTTTTTTT',
      'TTTTTTTTTT::TTTTTTTTTT'
    ],
    warps: [['moonlit_shrine', 9, 10, 'up']],
    items: [['boostcandy', 1]],
    hidden: [['umbralshard', 1]],
    npcs: {
      a: { sprite: 'girl', dir: 'down', keeper: 'isle_9', sight: 3 },
      q: { sprite: 'boy', dir: 'right', keeper: 'isle_10', sight: 1 },
      e: { sprite: 'occult', dir: 'right', keeper: 'isle_7', sight: 2 }
    },
    edges: { s: { to: 'hollow_isle', off: 1 } },
    enc: { grass: [[105, 57, 60, 25], [106, 59, 61, 5, 'night'], [109, 58, 61, 10], [60, 57, 60, 20], [36, 58, 60, 10], [35, 57, 59, 15], [61, 59, 61, 5, 'night'], [80, 58, 61, 10]] }
  });
  D('moonlit_shrine', {
    name: 'Moonlit Shrine', theme: 'ruins', music: 'ruins', region: 'Moonlit Isles', secret: true,
    rows: [
      'WWWWWWWWWWWWWWWWWWW',
      'WW..T....Q....T..WW',
      'WW.......d.......WW',
      'WW..Q..ddhdd..Q..WW',
      'WW.....ddddd.....WW',
      'WW..T..ddddd..T..WW',
      'WW.......d.......WW',
      'WW.......d.......WW',
      'WW...*...d...?...WW',
      'WW.......d.......WW',
      'WW.......d.......WW',
      'WWWWWWWWWOWWWWWWWWW'
    ],
    statue: 'A stone crescent moon. The inscription reads: "Guard the shrine, and the moon will guard you."',
    warps: [['hollow_isle_woods', 11, 1, 'down']],
    items: [['boostcandy', 2]],
    hidden: [['rekindlebloom', 1]],
    npcs: {
      h: { sprite: 'kit:110', cond: function () { return PK.game.flag('vesper_done') && !PK.game.flag('g110'); }, talk: PK.story.guardian(110, 70, 'g110', 'Silver light pours down onto the altar. The Moon Guardian, Moonveil, has come to see who protected its shrine...') }
    }
  });

  // islands connect to the ferry
  PK.world_extra = true;
})();

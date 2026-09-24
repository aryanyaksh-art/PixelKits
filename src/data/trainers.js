// Keepers (trainers), wardens, villains, High Council and Champion.
// team entries: [kitId, level, moves?, held?]
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var TR = {};
  function K(id, title, name, sprite, team, o) {
    TR[id] = Object.assign({ id: id, title: title, name: name, sprite: sprite, team: team, reward: 20, ai: 1 }, o || {});
  }
  // rival's starter is the one strong against the player's
  function rivalStarter(st) { var p = st.flags.starter || 1; return p === 1 ? 4 : p === 4 ? 7 : 1; }
  function rival(extra, starterLv, stage) {
    return function (st) {
      var s = rivalStarter(st) + (stage || 0);
      return extra.concat([[s, starterLv]]);
    };
  }

  // ---------- Rival ----------
  K('rival1', 'Rival', '{RIVAL}', 'rival', rival([], 5), { reward: 30, canLose: true, music: 'rival', lose: 'What?! I picked the wrong Kit!', winText: 'Ha! Looks like I win this round!', ai: 1 });
  K('rival2', 'Rival', '{RIVAL}', 'rival', rival([[10, 10], [12, 9]], 12), { reward: 35, music: 'rival', lose: 'Tch. You got lucky!', ai: 1 });
  K('rival3', 'Rival', '{RIVAL}', 'rival', rival([[11, 21], [17, 20], [25, 20]], 23, 1), { reward: 40, music: 'rival', lose: "Grr... You've gotten strong.", ai: 2, items: 1 });
  K('rival4', 'Rival', '{RIVAL}', 'rival', rival([[11, 34], [18, 34], [26, 34], [32, 35]], 37, 2), { reward: 50, music: 'rival', lose: "Unbelievable... Fine, go stop those Syndicate creeps.", ai: 2, items: 2 });
  K('rival5', 'Rival', '{RIVAL}', 'rival', rival([[11, 50], [18, 50], [26, 51], [32, 51], [38, 52]], 54, 2), { reward: 60, music: 'rival', lose: "...You really are something. Go on. The League is waiting.", ai: 2, items: 2 });

  // ---------- Verdant Vale ----------
  K('willow_1', 'Rookie', 'Ben', 'kid', [[12, 3], [10, 3]], { intro: 'I just got my first Kit! Let\'s battle!', after: 'Aw, I lost. I need to train more.' });
  K('willow_2', 'Scout', 'Lia', 'girl', [[14, 4], [14, 4]], { intro: 'Scouts are always prepared! Are you?', after: 'I should have packed more Tonics.' });
  K('pine_gym1', 'Keeper', 'Petra', 'girl', [[19, 8]], { intro: 'Warden Fenna taught me everything! Let me show you!', after: 'Fenna is much stronger than me.' });
  K('pine_gym2', 'Keeper', 'Moss', 'boy', [[46, 9], [1, 8]], { intro: "You won't cut through our forest so easily!", after: 'You have a green thumb for battling.' });
  K('warden1', 'Warden', 'Fenna', 'fenna', [[19, 9], [46, 11]], { reward: 100, ai: 2, items: 0, music: 'gym', lose: 'You grew past me like a sapling reaching for the sun!' });
  K('woods_1', 'Bug Nut', 'Pip', 'kid', [[14, 6], [15, 7], [21, 7]], { intro: 'Bugs are the best! Look at my collection!', after: 'My bugs need more sunlight...' });
  K('woods_2', 'Bug Nut', 'Otto', 'kid', [[21, 8], [62, 8]], { intro: 'Bzzzt! You walked into my web!', after: 'My web had a hole in it.' });
  K('woods_3', 'Scout', 'Tilly', 'girl', [[19, 8], [23, 9]], { intro: 'The woods are full of surprises. Like me!', after: 'Surprise! I lost.' });
  K('woods_twins', 'Twins', 'Ivy', 'girl', [[14, 7], [21, 8], [15, 8]], { double: true, partner: { name: 'Ida', sprite: 'girl', lose: 'IDA: Aww, we lost together!' }, intro: 'IVY & IDA: We always battle together! Two on two!', after: "IVY: Next time we'll combine our strength even better!", needTwo: 'IVY & IDA: We only battle two on two! Come back with at least two healthy Kits.', reward: 15 });
  K('woods_4', 'Rookie', 'Theo', 'boy', [[10, 8], [12, 8], [27, 9]], { intro: "Hey! You look like you've got good Kits!", after: 'Next time I\'ll win for sure!' });
  K('quarry_gym1', 'Rock Hound', 'Dale', 'hiker', [[23, 13], [23, 13]], { intro: 'Rocks rule! Rocks rock!', after: 'My pebbles crumbled...' });
  K('quarry_gym2', 'Rock Hound', 'Gus', 'hiker', [[70, 14], [48, 14]], { intro: "Gideon's gym is solid as bedrock!", after: 'You broke through my defense.' });
  K('warden2', 'Warden', 'Gideon', 'gideon', [[23, 14], [70, 15], [24, 17]], { reward: 110, ai: 2, items: 1, music: 'gym', lose: 'Hah! You moved a mountain today, kid.' });
  K('cave_1', 'Rock Hound', 'Burt', 'hiker', [[23, 12], [23, 13], [37, 13]], { intro: 'This cave echoes with the sound of battle!', after: 'Echo... echo... I lost...' });
  K('cave_2', 'Scholar', 'Ada', 'scholar', [[42, 14], [35, 13]], { intro: 'I study the glowing crystals here. Care to test a theory?', after: 'My hypothesis was incorrect.' });
  K('cave_agent1', 'Agent', 'Syndicate', 'agent', [[17, 13], [83, 13]], { intro: "The Hollow Syndicate is digging here. Scram, kid!", after: 'The boss will hear about this...', music: 'syndicate', reward: 30 });
  K('cave_agent2', 'Agent', 'Syndicate', 'agent', [[12, 13], [79, 14]], { intro: "You saw nothing! Got it?!", after: 'Ugh, beaten by a kid.', music: 'syndicate', reward: 30 });
  K('captain_nix', 'Captain', 'Nix', 'captain', [[83, 15], [17, 15], [79, 16]], { intro: 'Another nosy keeper? I am Captain Nix of the Hollow Syndicate. You will regret this.', lose: 'Tch! We have what we came for anyway!', music: 'syndicate', ai: 2, reward: 50 });
  K('volt_gym1', 'Sparkie', 'Zed', 'boy', [[21, 18], [50, 18]], { intro: 'Feel the buzz!', after: 'I got grounded.' });
  K('volt_gym2', 'Sparkie', 'Volta', 'girl', [[68, 19], [21, 19]], { intro: 'Juno\'s gym runs on pure energy!', after: 'My battery is drained.' });
  K('warden3', 'Warden', 'Juno', 'juno', [[50, 20], [21, 21], [51, 23]], { reward: 120, ai: 2, items: 1, music: 'gym', lose: 'Whoa! That was electrifying! You earned this.' });

  // ---------- Sunscar Coast ----------
  K('tide_duo', 'Couple', 'Ray', 'boy', [[44, 18], [27, 18], [83, 19]], { double: true, partner: { name: 'Lu', sprite: 'girl', lose: "LU: Ray, you said we'd win!" }, intro: 'RAY & LU: A double date with a double battle!', after: 'RAY: We still make a great team.', reward: 25 });
  K('tide_1', 'Beachgoer', 'Coral', 'girl', [[27, 17], [33, 17]], { intro: 'The sun, the sea, and a battle! Perfect!', after: 'Time for a swim to cool off.' });
  K('tide_2', 'Angler', 'Hank', 'sailor', [[27, 18], [27, 18], [28, 19]], { intro: 'I fish for Kits, not compliments!', after: 'The big one got away.' });
  K('tide_3', 'Surfer', 'Kai-lo', 'swimmer', [[48, 19], [33, 19]], { intro: 'Catch this wave, dude!', after: 'Wiped out...' });
  K('tide_4', 'Beachgoer', 'Sunny', 'girl', [[85, 18], [44, 18]], { intro: 'Let\'s make this quick, I\'m getting a tan!', after: 'I got burned. In more ways than one.' });
  K('salt_gym1', 'Surfer', 'Reef', 'swimmer', [[27, 23], [48, 24]], { intro: 'Marisol rules these waters!', after: 'Glub glub...' });
  K('salt_gym2', 'Angler', 'Barnaby', 'sailor', [[64, 24], [33, 24]], { intro: 'Hooked you!', after: 'Line snapped!' });
  K('warden4', 'Warden', 'Marisol', 'marisol', [[27, 25], [48, 26], [34, 26], [28, 28]], { reward: 130, ai: 2, items: 2, music: 'gym', lose: 'Like the tide, you just kept coming. Well done!' });
  K('dune_duo', 'Sand Bros', 'Tor', 'hiker', [[24, 24], [66, 24], [70, 25]], { double: true, partner: { name: 'Dex', sprite: 'hiker', lose: 'DEX: Sand in my eyes...' }, intro: 'TOR & DEX: The Sand Bros never lose a double battle!', after: 'TOR: Okay, we lose sometimes.', reward: 25 });
  K('dune_1', 'Sand Nomad', 'Rashid', 'hiker', [[66, 23], [70, 23]], { intro: 'The dunes test everyone who crosses them.', after: 'The sand shifts in your favor.' });
  K('dune_2', 'Sand Nomad', 'Sahra', 'mystic', [[17, 24], [52, 24]], { intro: 'Have you come for the treasures of the sands?', after: 'The desert keeps its secrets.' });
  K('dune_3', 'Firebrand', 'Kip', 'boy', [[44, 25], [66, 25]], { intro: 'It\'s hot out here, but I\'m hotter!', after: 'I\'m all burned out.' });
  K('dune_4', 'Scout', 'Hazel', 'girl', [[62, 25], [83, 26]], { intro: 'I\'ve been camping out here for weeks!', after: 'Maybe I should go home.' });
  K('dune_gym1', 'Firebrand', 'Blaise', 'boy', [[44, 28], [66, 28]], { intro: 'Feel the heat!', after: 'Doused...' });
  K('dune_gym2', 'Firebrand', 'Cinda', 'girl', [[4, 28], [91, 29]], { intro: 'Ignatius burns brightest of all!', after: 'My flame flickered out.' });
  K('warden5', 'Warden', 'Ignatius', 'ignatius', [[44, 31], [66, 32], [5, 32], [91, 34]], { reward: 140, ai: 2, items: 2, music: 'gym', lose: 'Magnificent! Your spirit burns hotter than any flame!' });
  K('ember_1', 'Firebrand', 'Cole', 'boy', [[66, 28], [67, 30]], { intro: 'It\'s scorching in here!', after: 'I need some water.' });
  K('ember_2', 'Scholar', 'Edmund', 'scholar', [[91, 29], [49, 29]], { intro: 'These tunnels are full of rare minerals!', after: 'Fascinating defeat.' });
  K('ember_agent', 'Agent', 'Syndicate', 'agent', [[80, 30], [18, 30]], { intro: 'The guardian of the sun sleeps here... Not for long!', after: 'The Director will be furious...', music: 'syndicate', reward: 35 });
  K('mirage_gym1', 'Mystic', 'Luna', 'mystic', [[58, 33], [33, 34]], { intro: 'I foresaw your arrival.', after: 'I did not foresee that.' });
  K('mirage_gym2', 'Scholar', 'Sage', 'scholar', [[81, 34], [92, 35]], { intro: 'Think before you battle!', after: 'I overthought it.' });
  K('warden6', 'Warden', 'Celestine', 'celestine', [[58, 35], [81, 36], [34, 37], [59, 38]], { reward: 150, ai: 2, items: 2, music: 'gym', lose: 'Your mind is clear and your heart is strong. Take this crest.' });
  K('spire_1', 'Agent', 'Syndicate', 'agent', [[83, 34], [79, 35]], { intro: 'Intruder alert! Stop right there!', after: 'Security breach...', music: 'syndicate', reward: 40 });
  K('spire_2', 'Agent', 'Syndicate', 'agent', [[18, 36], [84, 36]], { intro: 'You won\'t reach the Director!', after: 'Just... go...', music: 'syndicate', reward: 40 });
  K('spire_3', 'Agent', 'Syndicate', 'agent', [[80, 36], [36, 37]], { intro: 'The Syndicate will rule the skies of Lumora!', after: 'The skies can wait.', music: 'syndicate', reward: 40 });
  K('spire_4', 'Agent', 'Syndicate', 'agent', [[57, 37], [22, 37]], { intro: 'This floor is off-limits!', after: 'I\'m in so much trouble.', music: 'syndicate', reward: 40 });
  K('captain_rook', 'Captain', 'Rook', 'captain', [[80, 38], [76, 38], [84, 39]], { intro: 'Nix told me about you. I am Rook, and this is as far as you go!', lose: 'Impossible... The Director will finish you.', music: 'syndicate', ai: 2, items: 1, reward: 60 });
  K('director', 'Director', 'Kael Voss', 'boss', [[80, 40], [18, 40], [76, 41], [36, 42]], { intro: '', lose: 'So this is the strength of a keeper who fights beside their Kits...', music: 'syndicate', ai: 2, items: 2, reward: 100 });

  // ---------- Frostcrown Highlands ----------
  K('frost_duo', 'Ski Duo', 'Anya', 'skier', [[29, 36], [54, 36], [87, 37]], { double: true, partner: { name: 'Lev', sprite: 'skier', lose: 'LEV: Wipeout!' }, intro: 'ANYA & LEV: Race you downhill! But first, a double battle!', after: 'ANYA: You carve through battles like fresh powder.', reward: 25 });
  K('frost_1', 'Skier', 'Nils', 'skier', [[29, 34], [54, 35]], { intro: 'Race you down the mountain! Or battle, whatever.', after: 'Wipeout!' });
  K('frost_2', 'Skier', 'Freya', 'skier', [[77, 35], [87, 35]], { intro: 'The cold makes my Kits tougher!', after: 'Brrr... that stung.' });
  K('frost_3', 'Veteran', 'Harald', 'oldman', [[71, 36], [55, 36]], { intro: 'I\'ve climbed these peaks for fifty years. Show me your grit!', after: 'You have the heart of a mountaineer.' });
  K('frost_4', 'Brawler', 'Knut', 'brawler', [[32, 36], [54, 37]], { intro: 'My fists are colder than the wind!', after: 'Numb... everywhere...' });
  K('rime_gym1', 'Skier', 'Leif', 'skier', [[30, 40], [88, 40]], { intro: 'Slide your way to Bjorn if you can!', after: 'I slipped up.' });
  K('rime_gym2', 'Skier', 'Signe', 'skier', [[78, 41], [55, 41]], { intro: 'The ice here is perfectly smooth!', after: 'Cracked...' });
  K('warden7', 'Warden', 'Bjorn', 'bjorn', [[30, 42], [87, 42], [88, 43], [55, 45]], { reward: 160, ai: 2, items: 2, music: 'gym', lose: 'Ho ho! You thawed my frozen heart. Take the crest, friend.' });
  K('depths_1', 'Veteran', 'Ingrid', 'oldwoman', [[88, 39], [30, 40]], { intro: 'The depths are no place for the unprepared.', after: 'You are prepared indeed.' });
  K('depths_2', 'Scholar', 'Aurel', 'scholar', [[95, 40], [58, 40]], { intro: 'The ice here is thousands of years old!', after: 'History repeats itself: I lose again.' });
  K('shade_gym1', 'Occultist', 'Vesper', 'occult', [[35, 45], [60, 45]], { intro: 'Welcome to the dark...', after: 'The shadows fade...' });
  K('shade_gym2', 'Occultist', 'Grim', 'occult', [[90, 46], [79, 46]], { intro: 'Can you see me? I can see you.', after: 'Into the void I go.' });
  K('warden8', 'Warden', 'Morwen', 'morwen', [[36, 46], [61, 46], [90, 47], [80, 49]], { reward: 170, ai: 2, items: 2, music: 'gym', lose: 'You shine even in the deepest dark. The final crest is yours.' });
  K('summit_1', 'Veteran', 'Hugo', 'oldman', [[82, 47], [74, 47], [49, 48]], { intro: 'Only the strongest reach the Summit.', after: 'You are among the strongest.' });
  K('summit_2', 'Brawler', 'Tessa', 'brawler', [[32, 48], [94, 48], [55, 49]], { intro: 'Show me what 8 crests look like!', after: 'Impressive crests. Impressive keeper.' });
  K('summit_3', 'Mystic', 'Orla', 'mystic', [[34, 48], [59, 49], [61, 49]], { intro: 'The stars say you will go far. Let us see.', after: 'The stars were right.' });
  K('summit_4', 'Veteran', 'Magnus', 'oldman', [[38, 49], [88, 49], [67, 50]], { intro: 'Turn back while you still can!', after: 'I stand corrected. Onward!' });

  // ---------- High Council & Champion ----------
  K('council1', 'Councilor', 'Dax', 'dax', [[32, 50], [94, 50], [55, 51], [91, 51], [57, 53]], { reward: 200, ai: 2, items: 2, music: 'gym', intro: 'I am Dax of the High Council! My fists have never known defeat. Well... almost never!', lose: 'A fine battle! Your spirit hits harder than any punch.' });
  K('council2', 'Councilor', 'Hemlock', 'hemlock', [[18, 51], [20, 51], [84, 52], [53, 54]], { reward: 200, ai: 2, items: 2, music: 'gym', intro: 'I am Hemlock. Poison is patient, child. It always wins in the end.', lose: 'Hmph. It seems you have an antidote for everything.' });
  K('council3', 'Councilor', 'Orrin', 'orrin', [[38, 52], [76, 52], [89, 53], [95, 53], [57, 55]], { reward: 200, ai: 2, items: 2, music: 'gym', intro: 'Orrin, of the High Council. Steel does not bend. Neither do I.', lose: 'Remarkable. You found the cracks in my armor.' });
  K('council4', 'Councilor', 'Sable', 'sable', [[74, 53], [93, 53], [40, 54], [41, 56]], { reward: 200, ai: 2, items: 3, music: 'gym', intro: 'I am Sable, last of the High Council. The ancient wyrms answer only to me.', lose: 'The wyrms bow to you... Go. The Champion awaits.' });
  K('champion', 'Champion', 'Castor', 'castor', [[43, 55], [69, 55], [82, 56], [67, 56], [65, 57], [86, 59]], { reward: 300, ai: 2, items: 2, music: 'champion', intro: '', lose: 'Wonderful... Truly wonderful. Lumora has a new Champion!' });
  // post-game rematch-style challengers at Starfall
  K('star_1', 'Veteran', 'Stellan', 'oldman', [[41, 58], [43, 58], [9, 58]], { intro: 'Few ever sail this far. Show me your strength!', after: 'The stars shine on you.' });
  K('star_2', 'Mystic', 'Nova', 'mystic', [[59, 60], [86, 60], [92, 60]], { intro: 'The ruins hum with ancient power...', after: 'The ruins accept you.' });

  // names used in dialogue (for the originality check)
  PK.EXTRA_NAMES = ['Lumora', 'Verdant Vale', 'Sunscar Coast', 'Frostcrown Highlands', 'Hollow Syndicate', 'Ines Vale', 'Kael Voss',
    'Fenna', 'Gideon', 'Juno', 'Marisol', 'Ignatius', 'Celestine', 'Bjorn', 'Morwen', 'Dax', 'Hemlock', 'Orrin', 'Sable', 'Castor', 'Nix', 'Rook', 'KitLog', 'Kit Clinic'];
  PK.TRAINERS = TR;
})();

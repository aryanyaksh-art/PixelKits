// Story scripts and reusable event helpers. Scripts receive the world API (PK.world) as `w`.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var CREST_NAMES = ['Sprout Crest', 'Bedrock Crest', 'Spark Crest', 'Wave Crest', 'Ember Crest', 'Mirror Crest', 'Rime Crest', 'Umbra Crest'];
  PK.CREST_NAMES = CREST_NAMES;
  function st() { return PK.game.state; }
  function crest(i) { return !!st().crests[i]; }

  var S = {};

  // ---------- helpers ----------
  var H = {
    crest: crest,
    // Gym warden conversation + battle + reward
    warden: function (o) {
      return async function (w, n) {
        if (crest(o.i)) return w.say(o.after);
        await w.say(o.intro);
        var r = await w.battle(o.trainer);
        if (r !== 'win') return;
        await w.say(o.win);
        st().crests[o.i] = true;
        if (PK.audio) PK.audio.jingle('crest');
        await w.say(st().player.name + ' received the ' + CREST_NAMES[o.i] + '!');
        if (o.disc) {
          await w.say('Take this too. It will serve you well.');
          await w.give(o.disc);
        }
        if (o.extra) await w.say(o.extra);
        void n;
      };
    },
    gift: function (flag, item, pre, post, cond, notYet) {
      return async function (w) {
        if (cond && !cond()) return w.say(notYet);
        if (w.flag(flag)) return w.say(post);
        await w.say(pre);
        await w.give(item);
        w.setFlag(flag);
        if (post) await w.say(post);
      };
    },
    guardian: function (id, lvl, flag, text) {
      return async function (w, n) {
        await w.say(text);
        if (PK.audio) PK.audio.cry(id);
        await w.wait(30);
        var out = await w.wildBattle(id, lvl, { legend: true, music: 'legend', noRun: false, noPrism: true });
        w.setFlag(flag);
        if (out === 'caught') { n.hidden = true; }
        else { n.hidden = true; await w.say('The ' + PK.KITS[id].name + ' vanished... Perhaps it will return someday.'); }
      };
    }
  };
  PK.story = H;

  // ---------- Brookhollow ----------
  S.bh_stopNorth = async function (w) {
    await w.say("Hey! Wait! Don't go out there!");
    await w.say("Wild Kits live in the tall grass. You'll need a Kit of your own first!");
    await w.say('Come by my lab, {PLAYER}. It\'s the big building in the south of town. - Prof. Vale');
    await w.movePlayer('d');
  };

  S.bh_mom = async function (w) {
    if (!w.flag('starter')) {
      await w.say('Good morning, sleepyhead! Professor Vale stopped by earlier.');
      await w.say('She wants to see you at her lab. It sounded important!');
      return;
    }
    await w.say('{PLAYER}! You look like a real Kit Keeper now. Let me take care of your team.');
    await w.heal();
    await w.say('All better! Don\'t forget to call home... well, visit, anyway!');
  };

  S.lab_enter = async function (w) {
    if (w.flag('starter')) return;
    if (w.flag('lab_intro')) return;
    w.setFlag('lab_intro');
    await w.say('PROF. VALE: Ah, {PLAYER}! Right on time.');
    await w.say('{RIVAL}: Took you long enough! I\'ve been waiting forever.');
    await w.say('PROF. VALE: Lumora is home to amazing creatures we call Kits. Keepers raise them, battle beside them, and learn from them.');
    await w.say('On the table are three young Kits. Each of you may choose one to be your partner.');
    await w.say('{PLAYER}, you go first. Take a look!');
  };

  function chooseStarter(id) {
    return async function (w, n) {
      if (w.flag('starter')) return w.say('That capsule belongs to Prof. Vale.');
      var k = PK.KITS[id];
      var desc = { 1: 'the Leaf Kit. It\'s gentle and hardy.', 4: 'the Blaze Kit. It\'s bold and fiery.', 7: 'the Tide Kit. It\'s calm and clever.' }[id];
      var pv = PK.ui.showKit(id);
      if (PK.audio) PK.audio.cry(id);
      var yes = await w.yesno('So you like ' + k.name + ', ' + desc + ' Will you choose it?');
      PK.pop(pv);
      if (!yes) return;
      n.hidden = true;
      w.setFlag('starter', id);
      var kit = await w.giveKit(id, 5, { noPrism: true });
      if (await w.yesno('Give a nickname to ' + k.name + '?')) {
        var nn = await PK.ui.name(k.name + "'s nickname?", k.name);
        if (nn && nn !== k.name) kit.nick = nn;
      }
      var rid = id === 1 ? 4 : id === 4 ? 7 : 1;
      var rn = PK.KITS[rid].name;
      var rc = w.npcs.filter(function (x) { return x.d.starter === rid; })[0];
      await w.say('{RIVAL}: Then I\'ll take ' + rn + '! It\'s the perfect match for yours.');
      if (rc) rc.hidden = true;
      var third = w.npcs.filter(function (x) { return x.d.starter && x.d.starter !== id && x.d.starter !== rid; })[0];
      void third;
      await w.say('{RIVAL}: Hey, {PLAYER}! Let\'s see what our Kits can do. Battle me!');
      var r = await w.battle('rival1', { canLose: true });
      if (r === 'win') await w.say('{RIVAL}: Argh! Fine, you win this time. I\'ll train harder!');
      else await w.say('{RIVAL}: Ha! Looks like I\'m the better keeper. Don\'t worry, you\'ll catch up!');
      PK.game.healParty();
      await w.say('{RIVAL}: I\'m heading out. See you on the road, {PLAYER}!');
      var rv = w.npc('rival');
      if (rv) { await w.moveNpc(rv, 'ddd'); rv.hidden = true; }
      w.setFlag('rival_left');
      await w.say('PROF. VALE: What a spirited battle! Your Kits will grow stronger with every challenge.');
      await w.say('Here, take this. It\'s a KitLog - it records every Kit you see and catch.');
      await w.give('kitlog');
      await w.say('And these Capsules let you catch wild Kits. Weaken them in battle first!');
      await w.give('capsule', 5);
      await w.say('Lumora has eight Gyms. Earn all eight Crests and you may challenge the High Council at Crown Summit.');
      await w.say('The nearest Gym is in Pinecrest, north through Willow Trail. Good luck, {PLAYER}!');
      await w.say("Oh! And {RIVAL}'s older sibling next door has something for you. Do stop by before you leave town!");
    };
  }
  S.starter1 = chooseStarter(1);
  S.starter4 = chooseStarter(4);
  S.starter7 = chooseStarter(7);

  S.prof = async function (w) {
    if (!w.flag('starter')) return w.say('PROF. VALE: Go ahead, choose one of the three Kits on the table!');
    var c = Object.keys(st().caught).length;
    if (st().flags.champion) {
      if (!w.flag('got_omni')) {
        await w.say('PROF. VALE: The new Champion! I\'m so proud of you, {PLAYER}.');
        await w.say('Rumors say the three guardians of Lumora have awoken. Take this - it can catch anything.');
        await w.give('omnicapsule');
        w.setFlag('got_omni');
        return;
      }
      if (!w.flag('got_ferry')) {
        await w.say('PROF. VALE: Oh, and one more thing! A colleague runs a research station on the Moonlit Isles, far to the southeast.');
        await w.say('PROF. VALE: Kits live there that nobody in Lumora has ever recorded. Here - a Ferry Pass. The ferry leaves from the Saltmarsh docks.');
        await w.give('ferrypass');
        w.setFlag('got_ferry');
        return;
      }
      return w.say('PROF. VALE: The guardians rest in the Ember Tunnels, on an island off Tidewind Trail, and deep in the Frozen Depths. And the Moonlit Isles await across the sea!');
    }
    await w.say('PROF. VALE: Let me see your KitLog... You\'ve caught ' + c + ' kind' + (c === 1 ? '' : 's') + ' of Kits!');
    if (c < 10) await w.say('A fine start! Explore the tall grass to find more.');
    else if (c < 40) await w.say('Excellent work! Different Kits appear at different times of day, you know.');
    else if (c < 90) await w.say('Remarkable! You\'re a true researcher at heart.');
    else await w.say('Incredible... You\'ve nearly completed the KitLog! I have no words!');
  };

  // ---------- Pinecrest ----------
  S.pc_woodcutter = H.gift('got_machete', 'machete',
    'You beat Fenna? Impressive! Here, a keeper like you should have my old Machete.',
    'The Machete clears small bushes. The road east through Mossy Woods is overgrown.',
    function () { return crest(0); },
    'I cut trees for a living. The road east is blocked by bushes... Earn a Crest at the Gym and maybe I\'ll lend you a hand.');

  // ---------- Mossy Woods rival ----------
  S.rival2 = async function (w) {
    if (w.flag('rival2')) return;
    var rv = w.npc('rival');
    if (!rv) return;
    w.music('rival');
    await w.emote('rival', '!');
    await w.say('{RIVAL}: {PLAYER}! Fancy running into you here.');
    // walk rival next to the player
    for (var g = 0; g < 6; g++) {
      var dx = w.p.x - rv.x, dy = w.p.y - rv.y;
      if (Math.abs(dx) + Math.abs(dy) <= 1) break;
      if (dy < -1 || (dy < 0 && dx === 0)) await w.moveNpc(rv, 'u');
      else if (dx > 0) await w.moveNpc(rv, 'r');
      else if (dx < 0) await w.moveNpc(rv, 'l');
      else await w.moveNpc(rv, 'u');
    }
    w.facePlayer(rv);
    await w.say('{RIVAL}: I\'ve been catching all sorts of Kits. Let me show you!');
    var r = await w.battle('rival2');
    w.setFlag('rival2');
    if (r === 'win') {
      await w.say('{RIVAL}: Next time I\'ll crush you! See ya!');
      await w.moveNpc(rv, 'rr');
      rv.hidden = true;
    }
  };

  // ---------- Quarryton ----------
  S.qt_miner = H.gift('got_pickaxe', 'pickaxe',
    'You\'ve got the Bedrock Crest! Then you\'ve earned this Pickaxe. Cracked boulders don\'t stand a chance.',
    'Echo Cavern north of town is full of cracked rocks. Use the Pickaxe on them!',
    function () { return crest(1); },
    'Mining is hard work. If you prove your strength at the Gym, I\'ll give you something useful.');

  // ---------- Echo Cavern ----------
  S.nix = async function (w, n) {
    if (w.flag('nix_done')) return;
    var r = await w.battle('captain_nix');
    if (r !== 'win') return;
    w.setFlag('nix_done');
    await w.say('NIX: The Hollow Syndicate will control the guardians of Lumora... and with them, the weather itself!');
    await w.say('NIX: Remember that name, kid. We\'ll meet again.');
    n.hidden = true;
    PK.world.hideNpc('agent1'); PK.world.hideNpc('agent2');
  };

  // ---------- Voltmere ----------
  S.rival3 = async function (w) {
    if (w.flag('rival3')) return;
    await w.say('{RIVAL}: Hey, {PLAYER}! You made it through Echo Cavern too?');
    await w.say('{RIVAL}: I heard some weird Syndicate people were down there. Doesn\'t matter - nobody beats me now!');
    var r = await w.battle('rival3');
    w.setFlag('rival3');
    if (r === 'win') await w.say('{RIVAL}: Tch. Juno\'s Gym is right here. Try not to get zapped!');
  };

  // ---------- Saltmarsh ----------
  S.sm_sailor = H.gift('got_raft', 'raft',
    'Ahoy! A Wave Crest? Marisol doesn\'t hand those out easily. Take my spare Raft, keeper!',
    'Use the Raft facing calm water to cross it. The Sunscar Dunes are east across the bay.',
    function () { return crest(3); },
    'Arr, the bay is too deep to wade. I\'d lend my raft to a keeper who beat Marisol...');

  // ---------- Dunespire ----------
  S.ds_mystic = async function (w) {
    if (w.flag('got_wyrm')) return w.say('Raise that little wyrm with love. It will become a storm in time.');
    await w.say('The sands told me you would come. I have raised a rare Kit, but I am too old to travel.');
    if (st().party.length >= 6 && st().box.length >= 200) return w.say('Oh, you have no room. Come back later.');
    await w.giveKit(39, 20, {});
    w.setFlag('got_wyrm');
    await w.say('Wyrmlet is a rare Wyrm Kit. Few keepers have ever seen one.');
  };

  // ---------- Mirage City ----------
  S.rival4 = async function (w) {
    if (w.flag('rival4') || !crest(5)) return;
    await w.say('{RIVAL}: {PLAYER}! The Syndicate took over that tower. I was about to storm it myself...');
    await w.say('{RIVAL}: ...but first, let\'s see if you\'re strong enough to come along!');
    var r = await w.battle('rival4');
    w.setFlag('rival4');
    if (r === 'win') await w.say('{RIVAL}: Alright, alright. You go in. I\'ll guard the entrance!');
  };
  S.director = async function (w, n) {
    if (w.flag('spire_clear')) return;
    await w.say('KAEL VOSS: So you are the keeper who keeps ruining my plans.');
    await w.say('VOSS: Sun, rain and snow - the three guardians of Lumora. With them, the Hollow Syndicate would decide every season, every harvest, every storm.');
    await w.say('VOSS: People would pay anything for good weather. Imagine it!');
    await w.say('VOSS: I will not let a child stand in the way of the future.');
    var r = await w.battle('director');
    if (r !== 'win') return;
    w.setFlag('spire_clear');
    await w.say('VOSS: ...Maybe the guardians were never meant to be owned.');
    await w.say('VOSS: The Hollow Syndicate is finished. Take this. We found it in the ruins beneath Echo Cavern.');
    await w.give('oldmap');
    await w.say('VOSS: It points to Starfall, a ruin across the southern sea. They say the first Kit was born there.');
    await w.say('VOSS: Farewell, keeper.');
    n.hidden = true;
  };

  // ---------- Summit Road rival ----------
  S.rival5 = async function (w, n) {
    if (w.flag('rival5')) return;
    await w.say('{RIVAL}: So you made it, {PLAYER}. Eight crests... just like me.');
    await w.say('{RIVAL}: Ever since we left Brookhollow, I\'ve been chasing you. Not anymore. This is where I finally win!');
    var r = await w.battle('rival5');
    if (r !== 'win') return;
    w.setFlag('rival5');
    await w.say('{RIVAL}: ...Yeah. You\'re the real deal. Go become Champion. And then I\'ll beat you!');
    n.hidden = true;
  };

  // ---------- League ----------
  function councilor(i, id, next) {
    return async function (w, n) {
      var f = 'council' + i;
      if (w.flag(f)) return w.say('The way forward is open. Good luck.');
      await w.say(PK.TRAINERS[id].intro);
      var r = await w.battle(id);
      if (r !== 'win') return;
      w.setFlag(f);
      await w.say(next);
      await w.moveNpc(n, 'l');
      w.facePlayer(n);
    };
  }
  S.council1 = councilor(1, 'council1', 'Go on. Hemlock awaits in the next room.');
  S.council2 = councilor(2, 'council2', 'Proceed. Orrin will not be so forgiving.');
  S.council3 = councilor(3, 'council3', 'The final councilor, Sable, awaits.');
  S.council4 = councilor(4, 'council4', 'Beyond this door is the Champion. Go.');
  S.champion = async function (w, n) {
    if (w.flag('champion')) return w.say('CASTOR: The Hall of Fame awaits you, Champion.');
    await w.say('CASTOR: Welcome, {PLAYER}. I\'ve watched your journey from the very beginning.');
    await w.say('CASTOR: From Brookhollow to Crown Summit, you and your Kits have grown together.');
    await w.say('CASTOR: I am Castor, Champion of Lumora. Show me everything you\'ve learned!');
    var r = await w.battle('champion');
    if (r !== 'win') return;
    w.setFlag('champion');
    await w.say('CASTOR: Magnificent. You are the new Champion of Lumora!');
    await w.say('CASTOR: Come. Let us enter you and your partners into the Hall of Fame.');
    await w.moveNpc(n, 'l');
  };
  S.hall = async function (w) {
    if (w.flag('hall_done')) return;
    w.setFlag('hall_done');
    await w.wait(20);
    await w.say('PROF. VALE: {PLAYER}! I rushed all the way up here when I heard!');
    await w.say('PROF. VALE: The machine will record you and your Kits forever. Congratulations, Champion!');
    if (PK.audio) PK.audio.jingle('evolved');
    await w.wait(60);
    st().flags.hof = { party: st().party.map(function (k) { return { id: k.id, name: PK.stats.name(k), level: k.level }; }), time: st().frames };
    PK.game.save();
    await PK.fx.fadeOut(40);
    await PK.credits();
    // back home
    PK.game.healParty();
    PK.world.load('bh_home2f', 3, 3, 'down');
    await PK.fx.fadeIn(30);
    await w.say('Home sweet home. There are still rare Kits out there... and Prof. Vale may have news.');
  };

  // Name Sage NPC
  S.name_sage = async function (w) {
    await w.say("NAME SAGE ENID: Hello! I'm the Name Sage. A good nickname brings a Kit closer to its keeper.");
    if (!(await w.yesno('Shall I look at one of your Kits\' names?'))) return w.say('ENID: Come back whenever a name is on your mind!');
    var i = await PK.menus.party({ mode: 'item' });
    if (i < 0) return w.say('ENID: Come back whenever a name is on your mind!');
    var k = PK.game.state.party[i], nm = PK.stats.name(k);
    var praise = ['a fine, sturdy name', 'a name full of spirit', 'a cheerful little name', 'a truly heroic name'][nm.length % 4];
    await w.say('ENID: ' + nm + '... ' + nm + '! That is ' + praise + '.');
    if (!(await w.yesno('ENID: Would you like to give it a different nickname?'))) return w.say('ENID: Yes, ' + nm + ' suits it perfectly.');
    await PK.moveUI.rename(k);
    await w.say('ENID: Wonderful. Take good care of ' + PK.stats.name(k) + '!');
  };

  PK.SCRIPTS = S;
})();

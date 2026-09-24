// Abilities (passive battle traits), Temperaments (+10%/-10% stat natures) and Training Points.
// All names and effects here are PixelKits' own.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};

  var ABILITIES = {
    greenfury: { name: 'Green Fury', desc: 'Powers up Leaf moves when HP is low.' },
    lastember: { name: 'Last Ember', desc: 'Powers up Blaze moves when HP is low.' },
    undertow: { name: 'Undertow', desc: 'Powers up Tide moves when HP is low.' },
    hivefury: { name: 'Hive Fury', desc: 'Powers up Swarm moves when HP is low.' },
    menace: { name: 'Menace', desc: 'Lowers the foes\' ATK when it enters battle.' },
    hover: { name: 'Hover', desc: 'Floats, so Terra moves miss it.' },
    sparkskin: { name: 'Sparkskin', desc: 'Physical attackers may be paralyzed.' },
    emberhide: { name: 'Ember Hide', desc: 'Physical attackers may be burned.' },
    toxicbarbs: { name: 'Toxic Barbs', desc: 'Physical attackers may be poisoned.' },
    thornhide: { name: 'Thornhide', desc: 'Physical attackers are hurt a little.' },
    bedrock: { name: 'Bedrock', desc: 'Survives any hit from full HP.' },
    grit: { name: 'Grit', desc: 'ATK rises by half when it has a status problem.' },
    nimble: { name: 'Nimble', desc: 'SPD rises by half when it has a status problem.' },
    insulated: { name: 'Insulated', desc: 'Halves damage from Blaze and Frost moves.' },
    soakup: { name: 'Soak Up', desc: 'Tide moves heal it instead of hurting.' },
    conductor: { name: 'Conductor', desc: 'Volt moves heal it instead of hurting.' },
    sapeater: { name: 'Sap Eater', desc: 'Leaf moves heal it instead of hurting.' },
    kindling: { name: 'Kindling', desc: 'Blaze moves power it up instead of hurting.' },
    selfmend: { name: 'Self-Mend', desc: 'Status problems heal when it switches out.' },
    steadfast: { name: 'Unbending', desc: 'Foes can\'t lower its stats.' },
    imposing: { name: 'Imposing', desc: 'Foes use 2 charges per move against it.' },
    escapeartist: { name: 'Escape Artist', desc: 'Always gets away from wild Kits.' },
    forager: { name: 'Forager', desc: 'Sometimes picks up items after battles.' },
    sharpshot: { name: 'Sharpshot', desc: 'Its moves are more accurate.' },
    ironskull: { name: 'Iron Skull', desc: 'Takes no recoil damage.' },
    momentum: { name: 'Momentum', desc: 'SPD rises at the end of every turn.' },
    keenedge: { name: 'Keen Edge', desc: 'Lands critical hits more often.' },
    regrowth: { name: 'Regrowth', desc: 'Restores a little HP every turn.' },
    specialist: { name: 'Specialist', desc: 'Moves of its own type hit even harder.' },
    unshakable: { name: 'Unshakable', desc: 'Never flinches or gets confused.' },
    vigilant: { name: 'Vigilant', desc: 'Can\'t be put to sleep.' },
    purity: { name: 'Purity', desc: 'Can\'t be poisoned.' }
  };

  // Temperaments: [name, raised stat index, lowered stat index] (1 ATK, 2 DEF, 3 TEC, 4 RES, 5 SPD)
  var TEMPERAMENTS = [
    ['Steady', 0, 0], ['Brazen', 1, 2], ['Gruff', 1, 3], ['Rowdy', 1, 4], ['Stubborn', 1, 5],
    ['Meek', 2, 1], ['Mellow', 0, 0], ['Stoic', 2, 3], ['Wary', 2, 4], ['Stolid', 2, 5],
    ['Bookish', 3, 1], ['Daring', 3, 2], ['Even', 0, 0], ['Dreamy', 3, 4], ['Pensive', 3, 5],
    ['Kindly', 4, 1], ['Proud', 4, 2], ['Patient', 4, 3], ['Placid', 0, 0], ['Serene', 4, 5],
    ['Skittish', 5, 1], ['Brash', 5, 2], ['Eager', 5, 3], ['Restless', 5, 4], ['Earnest', 0, 0]
  ];

  // Two ability options per species, chosen from its primary type, role and body plan.
  var BY_TYPE = {
    Plain: ['forager', 'nimble'], Blaze: ['emberhide', 'kindling'], Tide: ['soakup', 'insulated'],
    Leaf: ['regrowth', 'sapeater'], Volt: ['sparkskin', 'conductor'], Frost: ['insulated', 'vigilant'],
    Brawl: ['grit', 'unshakable'], Venom: ['toxicbarbs', 'purity'], Terra: ['bedrock', 'ironskull'],
    Gale: ['keenedge', 'momentum'], Mind: ['specialist', 'selfmend'], Swarm: ['hivefury', 'sharpshot'],
    Shade: ['menace', 'escapeartist'], Lumen: ['selfmend', 'regrowth'], Metal: ['steadfast', 'bedrock'],
    Wyrm: ['menace', 'specialist']
  };
  var STARTER = { Leaf: 'greenfury', Blaze: 'lastember', Tide: 'undertow' };

  function assign(k) {
    if (k.abilities) return;
    var t = k.types[0], a = (BY_TYPE[t] || BY_TYPE.Plain).slice();
    if (k.tier && /^st/.test(k.tier)) a = [STARTER[t] || a[0], STARTER[t] || a[0]];
    else if (k.tier === 'legend' || k.tier === 'myth') a = ['imposing', 'imposing'];
    else {
      var plan = k.art && k.art.p;
      if (plan === 'ghost' || plan === 'ray') a[1] = 'hover';
      if (k.role === 'fast' && t !== 'Gale') a[1] = 'nimble';
      if (k.art && (k.art.x || []).indexOf('spikes') >= 0 && t !== 'Venom') a[1] = 'thornhide';
      if (k.types[1] === 'Gale' && t !== 'Gale') a[1] = 'keenedge';
    }
    k.abilities = a;
  }

  // Training Points (TP) a defeated species gives: its best base stat, 1-3 points by stage
  function tpYield(sp) {
    var best = 0;
    for (var i = 1; i < 6; i++) if (sp.stats[i] > sp.stats[best]) best = i;
    var n = sp.tier === 'legend' || sp.tier === 'myth' ? 3 : Math.min(3, sp.stage || 1);
    return { stat: best, n: n };
  }

  PK.ABILITIES = ABILITIES;
  PK.TEMPERAMENTS = TEMPERAMENTS;
  PK.assignAbilities = function () { Object.keys(PK.KITS).forEach(function (id) { assign(PK.KITS[id]); }); };
  PK.tpYield = tpYield;
  PK.TP_MAX = 252;
  PK.TP_TOTAL = 510;
  if (PK.KITS) PK.assignAbilities();
})();

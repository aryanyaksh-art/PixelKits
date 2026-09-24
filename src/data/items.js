// Items. pocket: items | capsules | discs | key
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var ITEMS = {};
  function it(id, name, pocket, price, use, value, desc) {
    ITEMS[id] = { id: id, name: name, pocket: pocket, price: price, use: use, value: value, desc: desc };
  }
  // healing
  it('tonic', 'Tonic', 'items', 200, 'heal', 25, 'Restores 25 HP to one Kit.');
  it('hitonic', 'Hi-Tonic', 'items', 600, 'heal', 70, 'Restores 70 HP to one Kit.');
  it('megatonic', 'Mega Tonic', 'items', 1200, 'heal', 150, 'Restores 150 HP to one Kit.');
  it('vitaltonic', 'Vital Tonic', 'items', 2500, 'heal', 9999, 'Fully restores HP of one Kit.');
  it('remedy', 'Remedy', 'items', 300, 'status', 0, 'Cures any status problem.');
  it('panacea', 'Panacea', 'items', 3000, 'full', 0, 'Fully restores HP and cures status.');
  it('rekindle', 'Rekindle Seed', 'items', 1500, 'revive', 50, 'Revives a fainted Kit with half its HP.');
  it('rekindlebloom', 'Rekindle Bloom', 'items', 4000, 'revive', 100, 'Revives a fainted Kit with full HP.');
  it('chargecell', 'Charge Cell', 'items', 1000, 'pp', 10, 'Restores 10 charges to each move of one Kit.');
  it('smokepellet', 'Smoke Pellet', 'items', 300, 'escape', 0, 'Guarantees escape from a wild Kit.');
  it('hushspray', 'Hush Spray', 'items', 350, 'hush', 100, 'Wild Kits avoid you for 100 steps.');
  it('hushspraymax', 'Hush Spray+', 'items', 700, 'hush', 250, 'Wild Kits avoid you for 250 steps.');
  it('exitcord', 'Exit Cord', 'items', 550, 'exit', 0, 'Pulls you out of a cave or tower to the last outdoor spot.');
  it('boostcandy', 'Boost Candy', 'items', 4800, 'level', 1, "A sweet treat that raises a Kit's level by 1.");
  // training supplements (+10 TP, up to 100 per stat)
  it('vigorroot', 'Vigor Root', 'items', 4900, 'tp', 0, 'Adds Training Points to HP.');
  it('mightroot', 'Might Root', 'items', 4900, 'tp', 1, 'Adds Training Points to ATK.');
  it('guardroot', 'Guard Root', 'items', 4900, 'tp', 2, 'Adds Training Points to DEF.');
  it('focusroot', 'Focus Root', 'items', 4900, 'tp', 3, 'Adds Training Points to TEC.');
  it('calmroot', 'Calm Root', 'items', 4900, 'tp', 4, 'Adds Training Points to RES.');
  it('swiftroot', 'Swift Root', 'items', 4900, 'tp', 5, 'Adds Training Points to SPD.');
  // evolution shards
  it('voltshard', 'Volt Shard', 'items', 2100, 'evo', 0, 'A crackling shard. Makes certain Kits evolve.');
  it('frostshard', 'Frost Shard', 'items', 2100, 'evo', 0, 'An icy shard. Makes certain Kits evolve.');
  it('radiantshard', 'Radiant Shard', 'items', 2100, 'evo', 0, 'A glowing shard. Makes certain Kits evolve.');
  it('umbralshard', 'Umbral Shard', 'items', 2100, 'evo', 0, 'A dark shard. Makes certain Kits evolve.');
  // held
  it('powerband', 'Might Band', 'items', 3000, 'held', 0, 'Held: boosts move power by 10%.');
  it('healroot', 'Healroot', 'items', 800, 'held', 0, 'Held: restores 25% HP once when HP falls below half.');
  it('luckyclover', 'Lucky Clover', 'items', 5000, 'held', 0, 'Held: the holder earns 50% more EXP.');
  it('quickcharm', 'Quick Charm', 'items', 2500, 'held', 0, 'Held: sometimes lets the holder move first.');
  // capsules
  it('capsule', 'Capsule', 'capsules', 200, 'capsule', 1, 'A device for catching wild Kits.');
  it('pluscapsule', 'Plus Capsule', 'capsules', 600, 'capsule', 1.5, 'A better catching device.');
  it('procapsule', 'Pro Capsule', 'capsules', 1200, 'capsule', 2, 'A high-grade catching device.');
  it('safaricapsule', 'Safari Capsule', 'capsules', 0, 'capsule', 1.5, 'A capsule used only in the Wildwood Reserve.');
  it('omnicapsule', 'Omni Capsule', 'capsules', 0, 'capsule', 255, 'Catches any wild Kit without fail.');
  // key items
  it('kitlog', 'KitLog', 'key', 0, 'key', 0, 'A device that records every Kit you see and catch.');
  it('machete', 'Machete', 'key', 0, 'key', 0, 'Clears small bushes blocking the way.');
  it('pickaxe', 'Pickaxe', 'key', 0, 'key', 0, 'Breaks cracked rocks.');
  it('raft', 'Raft', 'key', 0, 'key', 0, 'A folding raft for crossing water.');
  it('spirekey', 'Spire Keycard', 'key', 0, 'key', 0, 'Opens locked doors in the Syndicate Spire.');
  it('wayfinder', 'Wayfinder', 'key', 0, 'key', 0, 'Instantly returns you to any town you have visited.');
  it('oldmap', 'Old Star Map', 'key', 0, 'key', 0, 'A map pointing to ruins beyond the southern sea.');
  it('townmap', 'Lumora Map', 'key', 0, 'key', 0, 'A map of Lumora. Shows where you are.');
  it('bike', 'Trail Bike', 'key', 0, 'key', 0, 'A folding bike. Ride it to get around much faster.');
  it('rallybell', 'Rally Bell', 'key', 0, 'key', 0, 'Ring it to find keepers who want a rematch.');
  it('seekerlens', 'Seeker Lens', 'key', 0, 'key', 0, 'Reveals if something is hidden nearby.');
  it('ferrypass', 'Ferry Pass', 'key', 0, 'key', 0, 'A pass for the ferry to the Moonlit Isles.');

  // Skill Discs (reusable): teach a move
  var DISCS = ['wallop', 'blazeburst', 'riptide', 'grovebeam', 'arcbolt', 'glacierray', 'risingfist', 'blightbomb', 'landslide', 'galeslash',
    'mindcrush', 'dronebuzz', 'umbraorb', 'radiantbeam', 'alloybeam', 'wyrmfire', 'deepbreath', 'brace', 'pumpup', 'echoblast'];
  DISCS.forEach(function (m, i) {
    var n = (i + 1 < 10 ? '0' : '') + (i + 1);
    it('sd' + n, 'SD' + n + ' ' + PK.MOVES[m].name, 'discs', 3000, 'disc', m, 'Skill Disc: teaches ' + PK.MOVES[m].name + '. Reusable.');
  });
  PK.ITEMS = ITEMS;
  PK.POCKETS = [['items', 'ITEMS'], ['capsules', 'CAPSULES'], ['discs', 'DISCS'], ['key', 'KEY ITEMS']];
  PK.discCompatible = function (kit, moveId) {
    var m = PK.MOVES[moveId], sp = PK.KITS[kit.id];
    if (m.type === 'Plain') return true;
    if (sp.types.indexOf(m.type) >= 0) return true;
    return sp.learn.some(function (e) { return PK.MOVES[e[1]].type === m.type; });
  };
})();

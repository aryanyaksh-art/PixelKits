// The 100 original Kits of Lumora.
// K(id, name, types, stage, evo, role, tier, category, art spec, KitLog text)
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var KITS = {};
  function K(id, name, types, stage, evo, role, tier, cat, art, dex) {
    KITS[id] = { id: id, name: name, types: types, stage: stage, evo: evo, role: role, tier: tier, cat: cat, art: art, dex: dex };
  }
  function L(to, lvl, time) { return { to: to, lvl: lvl, time: time }; }
  function I(to, item) { return { to: to, item: item }; }

  // ---- Starters ----
  K(1, 'Mossip', ['Leaf'], 1, L(2, 16), 'bal', 'st1', 'Moss Fox', { p: 'quad', c: ['#6cbf5a', '#3f8a4a', '#f0ecc8'], ear: 'point', tail: 'fluffy', top: 'sprout', eye: 'big', x: ['cheeks'] }, 'It naps in sunny clearings. The sprout on its head perks up when it is happy.');
  K(2, 'Mosswick', ['Leaf'], 2, L(3, 34), 'bal', 'st2', 'Moss Fox', { p: 'quad', c: ['#58a84e', '#2f7040', '#ece4b8'], ear: 'point', tail: 'leaf', top: 'leaf', x: ['collar'] }, 'Its tail leaf rustles to warn its friends. Moss grows thicker on its back each spring.');
  K(3, 'Grovemaw', ['Leaf', 'Terra'], 3, null, 'tank', 'st3', 'Grove Guardian', { p: 'quad', big: 1, c: ['#4a8e46', '#8a6a3a', '#e0d6a4'], ear: 'point', tail: 'leaf', top: 'leaf', horn: 'antler', hc: '#9a7446', x: ['mane', 'claws'], eye: 'fierce', mouth: 'fang' }, 'Old forests are said to grow wherever it sleeps. Its antlers are living branches.');
  K(4, 'Pyrkid', ['Blaze'], 1, L(5, 16), 'phys', 'st1', 'Ember Kid', { p: 'quad', c: ['#f0a050', '#d84a2a', '#fff0d8'], ear: 'droop', horn: 'nub', top: 'flame', tail: 'thin', eye: 'big', x: ['cheeks'] }, 'The little flame on its head flickers brighter when it headbutts things, which is often.');
  K(5, 'Scorchram', ['Blaze'], 2, L(6, 34), 'phys', 'st2', 'Ember Ram', { p: 'quad', c: ['#e0703a', '#b83a22', '#fbe6c8'], ear: 'droop', horn: 'curl', hc: '#f4e2b8', top: 'flame', tail: 'flame' }, 'Its curled horns heat up like a stove. It charges at anything that looks at it funny.');
  K(6, 'Infernhorn', ['Blaze', 'Brawl'], 3, null, 'phys', 'st3', 'Blaze Ram', { p: 'biped', big: 1, c: ['#d85a2e', '#6a2a1e', '#f8dcb8'], horn: 'curl', hc: '#4a3430', top: 'flame', ear: 'droop', x: ['fists'], eye: 'fierce', mouth: 'grin', tail: 'flame' }, 'It stands upright to fight. A single punch from its burning fists can melt stone.');
  K(7, 'Drizzpup', ['Tide'], 1, L(8, 16), 'spec', 'st1', 'Drizzle Pup', { p: 'quad', c: ['#5aa8e8', '#2e6ab8', '#e8f6ff'], ear: 'fin', tail: 'fin', eye: 'big', x: ['cheeks'] }, 'It loves puddles. When excited, it shakes off a spray of cool mist.');
  K(8, 'Surgehound', ['Tide'], 2, L(9, 34), 'spec', 'st2', 'Surge Hound', { p: 'quad', c: ['#3e8ad8', '#1e4e9a', '#dff0ff'], ear: 'fin', tail: 'fin', top: 'tuft', x: ['collar'] }, 'It can sprint across the surface of a lake. Fishermen follow it to find good spots.');
  K(9, 'Tsunarch', ['Tide', 'Wyrm'], 3, null, 'spec', 'st3', 'Tide Sovereign', { p: 'quad', big: 1, c: ['#2e6ac0', '#6a4ad0', '#d8ecff'], ear: 'fin', tail: 'fin', horn: 'back', hc: '#e0f0ff', x: ['mane', 'claws'], eye: 'fierce', mouth: 'fang' }, 'Legends say its howl can turn the tide. It guards coastlines it considers its own.');
  // ---- Early routes ----
  K(10, 'Chirpit', ['Plain', 'Gale'], 1, L(11, 18), 'fast', 'e1', 'Tiny Bird', { p: 'bird', c: ['#c8a070', '#8a5a3a', '#f8ecd8'], mouth: 'beak', eye: 'dot', tail: 'feather' }, 'It chirps at dawn in big noisy flocks. It is brave but not very strong.');
  K(11, 'Galestrel', ['Plain', 'Gale'], 2, null, 'fast', 'e2', 'Wind Bird', { p: 'bird', c: ['#a87a4a', '#4a6ab0', '#f4e6cc'], mouth: 'beak', eye: 'fierce', top: 'tuft', tail: 'feather', s: 0.88 }, 'It rides updrafts for hours without flapping, scanning the fields below.');
  K(12, 'Gnawbit', ['Plain'], 1, L(13, 20), 'fast', 'e1', 'Nibbler', { p: 'blob', c: ['#c8b8a8', '#8a7a6a', '#fff4e8'], ear: 'round', mouth: 'fang', x: ['whiskers'], tail: 'thin', eye: 'dot', pat: 'belly', s: 0.55 }, 'It nibbles on anything, including fences. Farmers are not fond of it.');
  K(13, 'Chompster', ['Plain'], 2, null, 'phys', 'e2', 'Big Nibbler', { p: 'biped', c: ['#a89078', '#6a5440', '#f4e8d8'], ear: 'round', mouth: 'fang', x: ['whiskers', 'claws'], tail: 'thin', eye: 'fierce', s: 0.78 }, 'Its front teeth never stop growing, so it chews on rocks to keep them sharp.');
  K(14, 'Wrigglet', ['Swarm'], 1, L(15, 7), 'bal', 'bug1', 'Grub', { p: 'serpent', c: ['#a8d048', '#e8c030', '#f4f8c8'], top: 'antenna', gc: '#f8e070', eye: 'big', pat: 'bands', s: 0.5 }, 'It munches leaves all day. The bright bands on its body warn off hungry birds.');
  K(15, 'Silkpod', ['Swarm'], 2, L(16, 11), 'tank', 'bug2', 'Cocoon', { p: 'blob', c: ['#d8d0b0', '#a89a70', '#f4f0e0'], eye: 'sleepy', pat: 'bands', mouth: 'none', s: 0.62 }, 'Wrapped in silk, it barely moves. Inside, its wings are slowly taking shape.');
  K(16, 'Halomoth', ['Swarm', 'Lumen'], 3, null, 'spec', 'bug3', 'Glow Moth', { p: 'bug', c: ['#e8d8a8', '#f0c040', '#fff8e0'], wing: 'bug', wc: '#fff0b0', top: 'antenna', gc: '#fff4a0', eye: 'big', s: 0.85 }, 'On summer nights its wings glow softly. Travelers follow it home through dark woods.');
  K(17, 'Hissling', ['Venom'], 1, L(18, 24), 'phys', 'b1', 'Hiss Snake', { p: 'serpent', c: ['#9a60c0', '#e0d040', '#e8d8f0'], mouth: 'fang', pat: 'spots', s: 0.62 }, 'It hisses to sound scary, but it is actually quite shy around people.');
  K(18, 'Venomcoil', ['Venom'], 2, null, 'phys', 'b2', 'Coil Snake', { p: 'serpent', c: ['#7a3ea0', '#e8c030', '#e0c8f0'], horn: 'crest', eye: 'fierce', mouth: 'fang', pat: 'bands', s: 0.9 }, 'It coils around branches and waits. Its crest flares yellow before it strikes.');
  K(19, 'Shroomp', ['Leaf', 'Venom'], 1, L(20, 26), 'wall', 'b1', 'Mushroom', { p: 'blob', c: ['#f0e0c8', '#c84a6a', '#fff4e8'], top: 'cap', x: ['cheeks'], s: 0.6 }, 'It hides in damp shade. Its cap puffs out a sleepy dust when poked.');
  K(20, 'Mycelord', ['Leaf', 'Venom'], 2, null, 'wall', 'b2', 'Fungus Lord', { p: 'biped', c: ['#e8d4b8', '#9a3a7a', '#f8ecd8'], top: 'cap', eye: 'fierce', mouth: 'flat', s: 0.85 }, 'An entire forest floor can be connected to it through threads underground.');
  K(21, 'Buzzlet', ['Volt', 'Swarm'], 1, L(22, 25), 'fast', 'b1', 'Spark Bee', { p: 'bug', c: ['#f0c830', '#302a3a', '#fff4c0'], wing: 'bug', wc: '#e8f4ff', top: 'antenna', gc: '#fff080', pat: 'bands', eye: 'big', s: 0.6 }, 'Its wings buzz so fast they build up static. Touching it gives a tiny shock.');
  K(22, 'Amperhive', ['Volt', 'Swarm'], 2, null, 'spec', 'b2', 'Hive Queen', { p: 'bug', c: ['#e8b420', '#2a2436', '#fff0b0'], wing: 'bug', wc: '#e0f0ff', top: 'bolt', pat: 'bands', eye: 'fierce', s: 0.9 }, 'Its hive hums with enough electricity to light a small town.');
  K(23, 'Pebblit', ['Terra'], 1, L(24, 28), 'tank', 'b1', 'Pebble', { p: 'blob', c: ['#a8988a', '#6a5a50', '#d0c4b8'], x: ['arms'], horn: 'nub', pat: 'spots', s: 0.58 }, 'It rolls down hills for fun. Hikers often mistake it for an ordinary rock.');
  K(24, 'Cragnaut', ['Terra'], 2, null, 'tank', 'b2', 'Crag', { p: 'golem', c: ['#8a7a6a', '#5a4a3e', '#c0b0a0'], x: ['spikes'], eye: 'fierce', mouth: 'flat', s: 0.92 }, 'It can stand still for years. Moss and flowers grow on its shoulders.');
  K(25, 'Puffkite', ['Gale'], 1, L(26, 30), 'spec', 'b1', 'Cloud Puff', { p: 'ghost', c: ['#f0f4ff', '#8ab4e8', '#ffffff'], eye: 'big', x: ['cheeks'], top: 'tuft', s: 0.62 }, 'It drifts on the breeze. On windy days, children chase it across the meadows.');
  K(26, 'Stormkite', ['Gale'], 2, null, 'spec', 'b2', 'Storm Kite', { p: 'ray', c: ['#9ab8e8', '#4a5a9a', '#e8f0ff'], eye: 'fierce', horn: 'back', s: 0.92 }, 'It glides ahead of storms. Sailors take its arrival as a warning.');
  K(27, 'Finnip', ['Tide'], 1, L(28, 26), 'fast', 'b1', 'Minnow', { p: 'fish', c: ['#f08a5a', '#f8d8a0', '#fff0e0'], eye: 'big', mouth: 'open', s: 0.6 }, 'It swims in quick zigzags. A school of them looks like a sunset under water.');
  K(28, 'Finblade', ['Tide'], 2, null, 'phys', 'b2', 'Blade Fish', { p: 'fish', c: ['#3a7ab8', '#c8e0f0', '#e8f4ff'], eye: 'fierce', mouth: 'fang', s: 0.9 }, 'Its fins are as sharp as knives. It can slice through fishing nets.');
  K(29, 'Flurrowl', ['Frost', 'Gale'], 1, L(30, 32), 'spec', 'b1', 'Snow Owl', { p: 'bird', c: ['#e8f0fa', '#9ab8d8', '#ffffff'], ear: 'tuft', mouth: 'beak', eye: 'big', tail: 'feather', s: 0.62 }, 'Its feathers keep it warm in any blizzard. It hoots softly at falling snow.');
  K(30, 'Glacowl', ['Frost', 'Gale'], 2, null, 'spec', 'b2', 'Glacier Owl', { p: 'bird', c: ['#c8dcf0', '#5a8ac0', '#f4faff'], ear: 'tuft', mouth: 'beak', eye: 'fierce', top: 'crystal', tail: 'feather', s: 0.92 }, 'It watches over frozen peaks. Ice crystals form wherever it perches.');
  K(31, 'Jabbit', ['Brawl'], 1, L(32, 27), 'phys', 'b1', 'Boxer Bunny', { p: 'biped', c: ['#e8d8c8', '#c8443a', '#fff8f0'], ear: 'long', x: ['fists'], s: 0.62 }, 'It practices punching tree stumps every morning. It never skips a day.');
  K(32, 'Kickhare', ['Brawl'], 2, null, 'fast', 'b2', 'Kickboxer', { p: 'biped', c: ['#d8c4b0', '#b0302a', '#f8f0e4'], ear: 'long', x: ['fists', 'scarf'], eye: 'fierce', feet: 1, s: 0.88 }, 'Its kicks are faster than the eye can follow. It wears its scarf with pride.');
  K(33, 'Jellumi', ['Mind', 'Tide'], 1, L(34, 30), 'spec', 'b1', 'Jellyfish', { p: 'ghost', c: ['#f0a8d8', '#c060b0', '#fff0fa'], eye: 'dot', x: ['cheeks'], s: 0.6 }, 'It floats in warm shallows. It can sense the moods of creatures nearby.');
  K(34, 'Cerebrella', ['Mind', 'Tide'], 2, null, 'spec', 'b2', 'Mind Jelly', { p: 'ghost', c: ['#d880c8', '#7a3aa0', '#fbe0f4'], x: ['gem'], cc: '#f0a0f8', eye: 'glow', gc: '#ffd0f8', s: 0.9 }, 'Its glowing gem stores memories. It shows them to those it trusts.');
  K(35, 'Wispet', ['Shade'], 1, I(36, 'umbralshard'), 'spec', 'b1', 'Wisp', { p: 'ghost', c: ['#8a7ab8', '#4a3a78', '#d8d0f0'], eye: 'big', top: 'tuft', mouth: 'open', s: 0.6 }, 'It likes to spook people and then giggle. It means no harm.');
  K(36, 'Duskwraith', ['Shade'], 2, null, 'spec', 'b2', 'Dusk Wraith', { p: 'ghost', c: ['#5a4a8a', '#2a2048', '#b8a8e0'], eye: 'glow', gc: '#ff60a0', horn: 'back', hc: '#3a2e5a', x: ['mane'], mouth: 'grin', s: 0.92 }, 'It appears at sunset and vanishes at dawn. Its grin is the last thing you see.');
  K(37, 'Clankit', ['Metal'], 1, L(38, 33), 'tank', 'b1', 'Tin Cub', { p: 'quad', c: ['#a8b0c0', '#5a6a80', '#e0e4ec'], ear: 'round', x: ['shell'], tail: 'club' }, 'Its body is covered in shiny plates. It clanks loudly when it runs.');
  K(38, 'Plateback', ['Metal'], 2, null, 'tank', 'b2', 'Armor Beast', { p: 'quad', big: 1, c: ['#8a94a8', '#4a5468', '#d0d6e0'], ear: 'round', x: ['shell', 'spikes', 'claws'], eye: 'fierce', tail: 'club' }, 'Nothing can dent its plated back. It sleeps in old mines.');
  K(39, 'Wyrmlet', ['Wyrm'], 1, L(40, 32), 'bal', 'ps1', 'Little Wyrm', { p: 'serpent', c: ['#6a7ae0', '#f0d060', '#e0e4ff'], horn: 'nub', ear: 'fin', eye: 'big', s: 0.6 }, 'It is rarely seen. It lives in deep lakes and dreams of the sky.');
  K(40, 'Scaleserp', ['Wyrm'], 2, L(41, 52), 'bal', 'ps2', 'Scale Wyrm', { p: 'serpent', c: ['#5a5ad0', '#e8c040', '#d8dcff'], horn: 'back', hc: '#f0e4b0', ear: 'fin', x: ['spikes'], s: 0.84 }, 'Its scales shine like gold coins. It grows restless when storms approach.');
  K(41, 'Tempestwyrm', ['Wyrm', 'Gale'], 3, null, 'phys', 'ps3', 'Tempest Wyrm', { p: 'dragon', c: ['#4a4ac8', '#e8c040', '#d8d8ff'], horn: 'back', hc: '#f0e4b0', wing: 'bat', wc: '#8a9ae8', tail: 'long', eye: 'fierce', mouth: 'fang', x: ['claws'] }, 'It flies faster than any storm. Its roar can be heard across three valleys.');
  K(42, 'Glowbit', ['Lumen'], 1, I(43, 'radiantshard'), 'spec', 'b1', 'Glow Sprite', { p: 'blob', c: ['#fff0a0', '#f0c040', '#fffbe0'], top: 'halo', gc: '#fff4b0', eye: 'big', x: ['cheeks'], ear: 'round', s: 0.55 }, 'It glows warmly in the dark. Lost children say it led them home.');
  K(43, 'Halomane', ['Lumen'], 2, null, 'phys', 'b2', 'Light Lion', { p: 'quad', big: 1, c: ['#f8e090', '#e8a830', '#fff8e0'], x: ['mane'], top: 'halo', gc: '#fff4b0', ear: 'round', tail: 'fluffy', eye: 'fierce' }, 'Its mane shines like the sun. It protects the weak without being asked.');
  K(44, 'Flickfinch', ['Blaze', 'Gale'], 1, L(45, 30), 'fast', 'b1', 'Spark Finch', { p: 'bird', c: ['#f0803a', '#f8d040', '#fff0d8'], mouth: 'beak', top: 'flame', tail: 'feather', s: 0.6 }, 'Its crest flickers like a candle. It sings loudest on hot days.');
  K(45, 'Pyrehawk', ['Blaze', 'Gale'], 2, null, 'fast', 'b2', 'Pyre Hawk', { p: 'bird', c: ['#d8502a', '#f8c030', '#ffe8c8'], mouth: 'beak', top: 'flame', eye: 'fierce', tail: 'feather', s: 0.95 }, 'It dives from the clouds wrapped in flame. The air shimmers behind it.');
  K(46, 'Slothling', ['Leaf', 'Plain'], 1, L(47, 33), 'wall', 'b1', 'Moss Sloth', { p: 'biped', c: ['#b8a078', '#6aa050', '#e8dcc0'], eye: 'sleepy', x: ['leaves', 'claws'], pat: 'mask', s: 0.62 }, 'It moves so slowly that moss grows on its fur. It is always smiling.');
  K(47, 'Mossloth', ['Leaf', 'Plain'], 2, null, 'wall', 'b2', 'Grove Sloth', { p: 'biped', big: 1, c: ['#9a8460', '#4a8a44', '#e0d4b4'], eye: 'sleepy', x: ['leaves', 'claws'], pat: 'mask', s: 0.92 }, 'Birds nest in its fur. It can nap through thunderstorms.');
  K(48, 'Pinchit', ['Tide', 'Terra'], 1, L(49, 30), 'phys', 'b1', 'Pinch Crab', { p: 'golem', c: ['#e0604a', '#f0a080', '#fce0d0'], eye: 'round', mouth: 'smile', s: 0.6 }, 'It snaps its claws to say hello. It collects shiny shells.');
  K(49, 'Tidecrusher', ['Tide', 'Terra'], 2, null, 'phys', 'b2', 'Crusher Crab', { p: 'golem', c: ['#c84a3a', '#8a2a22', '#f8d0c0'], x: ['spikes'], eye: 'fierce', mouth: 'fang', s: 0.9 }, 'Its claws can crack boulders. It guards the reefs from intruders.');
  K(50, 'Zapferr', ['Volt'], 1, I(51, 'voltshard'), 'fast', 'b1', 'Zap Ferret', { p: 'quad', c: ['#4ab0c8', '#f0d040', '#e8fbff'], ear: 'round', tail: 'fluffy', pat: 'stripes', eye: 'big' }, 'It zips through tall grass leaving little sparks behind.');
  K(51, 'Stormferret', ['Volt'], 2, null, 'fast', 'b2', 'Storm Ferret', { p: 'quad', c: ['#2e90b0', '#f8e040', '#e0f8ff'], pat: 'stripes', tail: 'spike', ear: 'point', eye: 'fierce', top: 'bolt' }, 'It runs so fast that lightning seems to follow it.');
  K(52, 'Bogtoad', ['Venom', 'Tide'], 1, L(53, 32), 'bal', 'b1', 'Bog Toad', { p: 'blob', c: ['#7a9a4a', '#a050b0', '#e8f0c8'], mouth: 'grin', pat: 'spots', s: 0.6 }, 'It croaks all night in swamps. Its spots ooze a bitter slime.');
  K(53, 'Swampsire', ['Venom', 'Tide'], 2, null, 'tank', 'b2', 'Swamp King', { p: 'biped', big: 1, c: ['#5a7a3a', '#8a3aa0', '#dce8b0'], pat: 'spots', eye: 'fierce', mouth: 'grin', top: 'crystal', cc: '#c870e0', s: 0.92 }, 'It rules the marshes from a throne of mud. Its crown is made of crystals.');
  K(54, 'Yetling', ['Frost', 'Brawl'], 1, L(55, 36), 'phys', 'b1', 'Snow Cub', { p: 'biped', c: ['#f0f4fa', '#7aa0c8', '#ffffff'], x: ['fists'], ear: 'round', horn: 'nub', hc: '#a8c8e8', s: 0.64 }, 'It throws snowballs at travelers, then runs away laughing.');
  K(55, 'Yetimaul', ['Frost', 'Brawl'], 2, null, 'phys', 'b2', 'Snow Titan', { p: 'golem', c: ['#e0e8f4', '#4a78b0', '#ffffff'], horn: 'curl', hc: '#a8c8e8', eye: 'fierce', mouth: 'fang', s: 0.95 }, 'It can punch through glaciers. Avalanches follow its angry roar.');
  K(56, 'Cogling', ['Metal', 'Brawl'], 1, L(57, 38), 'tank', 'b1', 'Cog Bot', { p: 'golem', c: ['#b0a080', '#6a5a3a', '#e0d8c0'], eye: 'single', top: 'antenna', gc: '#80f0ff', s: 0.6 }, 'Nobody knows who built the first one. It ticks softly when it thinks.');
  K(57, 'Cogwarden', ['Metal', 'Brawl'], 2, null, 'tank', 'b2', 'Cog Titan', { p: 'golem', c: ['#9a8a68', '#5a4a30', '#d8ccb0'], eye: 'glow', gc: '#ff6040', x: ['spikes'], s: 0.95 }, 'Its gears turn endlessly. It is said to have guarded an ancient city.');
  K(58, 'Prismet', ['Mind', 'Lumen'], 1, L(59, 36), 'spec', 'b1', 'Prism', { p: 'ghost', c: ['#c8e0ff', '#e890f0', '#ffffff'], top: 'crystal', cc: '#f0b0ff', eye: 'dot', s: 0.58 }, 'Light bends strangely around it, splitting into tiny rainbows.');
  K(59, 'Kaleidra', ['Mind', 'Lumen'], 2, null, 'spec', 'b2', 'Kaleidoscope', { p: 'bug', c: ['#e8c0f8', '#60d0e0', '#fff4ff'], wing: 'bug', wc: '#f8d0ff', top: 'antenna', gc: '#a0ffff', eye: 'glow', s: 0.9 }, 'Its wings show shifting patterns that can hypnotize anyone who stares.');
  K(60, 'Spookroot', ['Shade', 'Leaf'], 1, L(61, 34, 'night'), 'wall', 'b1', 'Ghost Root', { p: 'blob', c: ['#e8d8f0', '#6a4a9a', '#fff4ff'], top: 'sprout', lc: '#5aa060', eye: 'glow', gc: '#ff70c0', mouth: 'grin', s: 0.58 }, 'It hides in garden beds. Pull it up and it will scream and run off.');
  K(61, 'Mandrawraith', ['Shade', 'Leaf'], 2, null, 'spec', 'b2', 'Root Wraith', { p: 'ghost', c: ['#b8a0d8', '#4a2a6a', '#f0e4ff'], top: 'leaf', lc: '#3e7a4a', eye: 'glow', gc: '#ff5aa0', mouth: 'grin', s: 0.92 }, 'Its wail can make flowers wilt. It drifts through old graveyards.');
  K(62, 'Dartfly', ['Swarm', 'Gale'], 1, L(63, 29), 'fast', 'b1', 'Dart Fly', { p: 'bug', c: ['#6ac0a8', '#2a7a6a', '#d8f8f0'], wing: 'bug', wc: '#e8fff8', eye: 'big', pat: 'bands', s: 0.6 }, 'It hovers perfectly still, then zips away in the blink of an eye.');
  K(63, 'Galedart', ['Swarm', 'Gale'], 2, null, 'fast', 'b2', 'Gale Dart', { p: 'bug', c: ['#3aa088', '#e05a4a', '#c8f0e8'], wing: 'bug', wc: '#e8fff8', eye: 'fierce', top: 'antenna', pat: 'bands', s: 0.9 }, 'It races across lakes faster than a speedboat. Its wings sing as it flies.');
  K(64, 'Lampfry', ['Tide', 'Lumen'], 1, L(65, 31), 'spec', 'b1', 'Lamp Fish', { p: 'fish', c: ['#5a8ad8', '#f8e070', '#e0ecff'], x: ['lure'], eye: 'big', gc: '#fff4a0', s: 0.6 }, 'The light on its lure attracts curious minnows, and curious divers.');
  K(65, 'Beaconfin', ['Tide', 'Lumen'], 2, null, 'spec', 'b2', 'Beacon Fish', { p: 'fish', c: ['#2a4a9a', '#f8d850', '#c8d8ff'], x: ['lure'], eye: 'fierce', mouth: 'fang', gc: '#ffffa0', s: 0.92 }, 'Its light can be seen from the surface on moonless nights.');
  K(66, 'Ashpebble', ['Terra', 'Blaze'], 1, L(67, 35), 'tank', 'b1', 'Cinder Rock', { p: 'blob', c: ['#6a5450', '#f07030', '#a89088'], top: 'flame', pat: 'spots', x: ['arms'], s: 0.6 }, 'It lives near hot springs. Its body stays warm long after sunset.');
  K(67, 'Calderon', ['Terra', 'Blaze'], 2, null, 'tank', 'b2', 'Magma Golem', { p: 'golem', c: ['#5a4440', '#f06a2a', '#9a807a'], top: 'flame', eye: 'fierce', x: ['spikes'], mouth: 'grin', s: 0.95 }, 'Lava flows through the cracks in its body. It sleeps inside volcanoes.');
  K(68, 'Zapwing', ['Volt', 'Gale'], 1, L(69, 34), 'fast', 'b1', 'Zap Crow', { p: 'bird', c: ['#3a3a5a', '#f0d040', '#8a8ab0'], mouth: 'beak', top: 'bolt', tail: 'feather', s: 0.62 }, 'It perches on power lines and snacks on the static.');
  K(69, 'Fulgurwing', ['Volt', 'Gale'], 2, null, 'spec', 'b2', 'Thunder Crow', { p: 'bird', c: ['#2a2a4a', '#f8e040', '#7a7aa8'], mouth: 'beak', top: 'bolt', eye: 'fierce', tail: 'feather', s: 0.95 }, 'Thunder rolls whenever it spreads its wings.');
  K(70, 'Calfhorn', ['Plain', 'Terra'], 1, L(71, 33), 'phys', 'b1', 'Calf', { p: 'quad', c: ['#a07048', '#f0e0c0', '#e8d4b4'], horn: 'nub', ear: 'droop', tail: 'thin', pat: 'spots' }, 'It headbutts fence posts to practice. It follows the herd everywhere.');
  K(71, 'Bullwark', ['Plain', 'Terra'], 2, null, 'phys', 'b2', 'Bison', { p: 'quad', big: 1, c: ['#7a5030', '#3a2a1e', '#dcc8a8'], horn: 'curl', hc: '#f0e8d8', x: ['mane'], eye: 'fierce', mouth: 'flat', tail: 'thin' }, 'A herd of them can shake the ground like an earthquake.');
  K(72, 'Patchcat', ['Plain'], 2, null, 'fast', 'single', 'Patch Cat', { p: 'quad', c: ['#f0c890', '#8a5a3a', '#fff4e4'], ear: 'point', tail: 'curl', pat: 'spots', eye: 'sleepy', x: ['whiskers'] }, 'It naps on warm rooftops. It always lands on its feet, and on your homework.');
  K(73, 'Eelwyrm', ['Wyrm', 'Tide'], 1, L(74, 38), 'spec', 'b1', 'Eel Wyrm', { p: 'serpent', c: ['#4ab0a0', '#e8e070', '#d8f8f0'], ear: 'fin', eye: 'big', s: 0.62 }, 'It slips between rocks in fast rivers. It is slippery to catch.');
  K(74, 'Leviathorn', ['Wyrm', 'Tide'], 2, null, 'spec', 'b2', 'Sea Wyrm', { p: 'serpent', c: ['#2a7a8a', '#e8c050', '#c8ecf0'], ear: 'fin', horn: 'back', hc: '#f0e0b0', eye: 'fierce', mouth: 'fang', x: ['spikes'], s: 0.95 }, 'Old sailors tell stories of it wrapping around ships. Most are exaggerated.');
  K(75, 'Tinwing', ['Metal', 'Gale'], 1, L(76, 35), 'phys', 'b1', 'Tin Bird', { p: 'bird', c: ['#b8c0cc', '#e05a4a', '#e8ecf2'], mouth: 'beak', top: 'tuft', tail: 'feather', wc: '#d8dee8', s: 0.62 }, 'Its feathers clink like wind chimes when it flies.');
  K(76, 'Chromehawk', ['Metal', 'Gale'], 2, null, 'phys', 'b2', 'Chrome Hawk', { p: 'bird', c: ['#6a7488', '#d03a3a', '#c8d0dc'], mouth: 'beak', eye: 'fierce', horn: 'back', hc: '#d8dee8', tail: 'feather', wc: '#c8d0dc', s: 0.95 }, 'Its wings are sharp enough to cut the wind itself.');
  K(77, 'Mistfawn', ['Leaf', 'Frost'], 1, I(78, 'frostshard'), 'spec', 'b1', 'Mist Fawn', { p: 'quad', c: ['#c8b090', '#9ad0e8', '#f4ece0'], ear: 'point', horn: 'nub', pat: 'spots', eye: 'big' }, 'It appears in foggy forests at dawn, then fades away with the mist.');
  K(78, 'Borealk', ['Leaf', 'Frost'], 2, null, 'spec', 'b2', 'Aurora Elk', { p: 'quad', big: 1, c: ['#a89070', '#5ab0d8', '#ece0cc'], ear: 'point', horn: 'antler', hc: '#c8ecf8', x: ['collar'] }, 'Its antlers glitter with frost. Auroras dance above the herds it leads.');
  K(79, 'Gloampaw', ['Shade', 'Brawl'], 1, L(80, 32, 'night'), 'fast', 'b1', 'Dusk Cub', { p: 'quad', c: ['#4a4060', '#e05a8a', '#8a80a0'], ear: 'point', tail: 'thin', eye: 'glow', gc: '#ffd040', pat: 'mask' }, 'It prowls at twilight. Only its bright eyes give it away.');
  K(80, 'Gloamstalker', ['Shade', 'Brawl'], 2, null, 'fast', 'b2', 'Night Stalker', { p: 'quad', big: 1, c: ['#3a3050', '#e04a7a', '#7a7094'], ear: 'point', tail: 'spike', eye: 'glow', gc: '#ffd040', x: ['claws', 'spikes'], mouth: 'fang' }, 'It hunts in total silence. Even its shadow seems to move on its own.');
  K(81, 'Trunkle', ['Mind', 'Plain'], 1, L(82, 36), 'wall', 'b1', 'Calf Trunk', { p: 'quad', c: ['#b0a8c8', '#e070a0', '#e0dcf0'], ear: 'wide', x: ['trunk'], muzzle: false }, 'It never forgets a face. It greets old friends with a happy trumpet.');
  K(82, 'Sagephant', ['Mind', 'Plain'], 2, null, 'wall', 'b2', 'Sage Trunk', { p: 'quad', big: 1, c: ['#9088b0', '#c050a0', '#d8d2ec'], ear: 'wide', x: ['trunk', 'tusks', 'gem'], eye: 'sleepy', muzzle: false }, 'Villagers visit it for advice. It answers in long, thoughtful silences.');
  K(83, 'Whiffit', ['Venom'], 1, L(84, 30), 'bal', 'b1', 'Stink Kit', { p: 'quad', c: ['#5a5a6a', '#e8e8f0', '#d8d8e0'], ear: 'point', tail: 'fluffy', pat: 'mask' }, 'It raids trash cans at night. If startled, it leaves a lingering smell.');
  K(84, 'Reekoon', ['Venom'], 2, null, 'phys', 'b2', 'Reek Bandit', { p: 'biped', c: ['#4a4658', '#b070d0', '#d8d4e4'], ear: 'point', tail: 'fluffy', pat: 'mask', eye: 'fierce', mouth: 'grin', x: ['claws'], s: 0.88 }, 'It steals shiny things and hides them in a secret den.');
  K(85, 'Dawnlark', ['Lumen', 'Gale'], 1, L(86, 34, 'day'), 'spec', 'b1', 'Dawn Lark', { p: 'bird', c: ['#f8e0b0', '#f0a0c0', '#fffaf0'], mouth: 'beak', top: 'star', gc: '#fff0a0', eye: 'big', tail: 'feather', s: 0.6 }, 'It sings the first song of every morning. Hearing it is said to bring luck.');
  K(86, 'Solarquill', ['Lumen', 'Gale'], 2, null, 'spec', 'b2', 'Sun Bird', { p: 'bird', c: ['#f8d070', '#e8603a', '#fff4d8'], mouth: 'beak', top: 'halo', gc: '#fff4b0', tail: 'feather', wc: '#ffe8a0', s: 0.97 }, 'Its feathers soak up sunlight. At night it glows like a lantern.');
  K(87, 'Floeback', ['Frost', 'Tide'], 1, L(88, 37), 'tank', 'b1', 'Floe Turtle', { p: 'quad', c: ['#78b8c8', '#d8f0f8', '#e8f8ff'], x: ['shell'], top: 'crystal' }, 'It floats on drifting ice. Its shell is always cold to the touch.');
  K(88, 'Bergshell', ['Frost', 'Tide'], 2, null, 'tank', 'b2', 'Berg Turtle', { p: 'quad', big: 1, c: ['#5898b0', '#e0f4ff', '#d8f0f8'], x: ['shell', 'spikes'], top: 'crystal', eye: 'fierce' }, 'Its shell is a small iceberg. Other Kits ride on its back across the sea.');
  // ---- Single-stage ----
  K(89, 'Beetank', ['Swarm', 'Metal'], 2, null, 'tank', 'rare', 'Tank Beetle', { p: 'bug', c: ['#6a7a8a', '#c8a030', '#b8c4d0'], horn: 'uni', hc: '#c8a030', eye: 'fierce', x: ['shell'], pat: 'none' }, 'Its shell can stop a rolling boulder. It flips over foes with its horn.');
  K(90, 'Scarabyss', ['Swarm', 'Shade'], 2, null, 'spec', 'rare', 'Tomb Scarab', { p: 'bug', c: ['#3a5a6a', '#e0b040', '#8ab0b8'], top: 'antenna', gc: '#f0d060', eye: 'glow', pat: 'bands', wing: 'bug', wc: '#5a7a8a' }, 'It is found in ancient ruins. Its shell is carved with strange symbols.');
  K(91, 'Kilnfist', ['Blaze', 'Brawl'], 2, null, 'phys', 'rare', 'Kiln Fighter', { p: 'biped', c: ['#b84a30', '#f0a030', '#f0d0a8'], x: ['fists'], top: 'flame', eye: 'fierce', mouth: 'grin' }, 'It trains beside volcanoes. Its fists glow red after every match.');
  K(92, 'Neuronix', ['Volt', 'Mind'], 2, null, 'spec', 'rare', 'Brainwave', { p: 'ghost', c: ['#80a0f0', '#f0e040', '#e0e8ff'], top: 'antenna', gc: '#fff080', eye: 'single' }, 'It thinks in electric pulses. It can solve puzzles faster than any computer.');
  K(93, 'Zephydrake', ['Gale', 'Wyrm'], 2, null, 'fast', 'rare', 'Breeze Drake', { p: 'dragon', c: ['#8ad0e0', '#f0f0f8', '#e0f8ff'], wing: 'bird', wc: '#ffffff', horn: 'back', hc: '#f8f8ff', tail: 'long', s: 0.9 }, 'It lives among the clouds and rarely lands. Its feathered wings are silent.');
  K(94, 'Brinebrute', ['Tide', 'Brawl'], 2, null, 'phys', 'rare', 'Sea Brawler', { p: 'biped', big: 1, c: ['#3a7aa0', '#e0a040', '#d0e8f4'], x: ['fists'], ear: 'fin', eye: 'fierce', mouth: 'fang' }, 'It wrestles waves for fun. Sailors cheer when it wins.');
  K(95, 'Chronocog', ['Metal', 'Mind'], 2, null, 'wall', 'rare', 'Clockwork', { p: 'ghost', c: ['#c8a860', '#6a5a9a', '#f0e4c0'], eye: 'single', top: 'star', gc: '#a0f0ff', s: 0.85 }, 'It ticks at a steady rhythm. Some say it can see a few seconds into the future.');
  K(96, 'Sunpetal', ['Leaf', 'Lumen'], 2, null, 'spec', 'rare', 'Sun Flower', { p: 'flower', c: ['#f8e070', '#f08aa0', '#fff8d8'], eye: 'big', x: ['cheeks'], s: 0.85 }, 'It turns to face the sun all day. Its petals are warm like a hug.');
  // ---- Guardians & mythical ----
  K(97, 'Solaryx', ['Blaze', 'Lumen'], 3, null, 'mixed', 'legend', 'Sun Guardian', { p: 'quad', big: 1, c: ['#f8c050', '#e8502a', '#fff0c8'], horn: 'back', hc: '#fff4c0', top: 'halo', gc: '#fff080', x: ['mane', 'claws'], tail: 'flame', eye: 'fierce', s: 1.05 }, 'The guardian of the sun. The first dawn of Lumora is said to have risen from its horns.');
  K(98, 'Nimbray', ['Tide', 'Gale'], 3, null, 'mixed', 'legend', 'Rain Guardian', { p: 'ray', c: ['#4a78c8', '#e8f4ff', '#c8dcff'], eye: 'fierce', top: 'crystal', cc: '#a8e0ff', horn: 'back', hc: '#e8f4ff', s: 1.0 }, 'The guardian of rain. Its wingbeats gather storm clouds over the sea.');
  K(99, 'Rimewyrm', ['Frost', 'Wyrm'], 3, null, 'mixed', 'legend', 'Snow Guardian', { p: 'dragon', c: ['#a8d8f0', '#4a6ad0', '#f0faff'], horn: 'back', hc: '#e8f8ff', wing: 'bat', wc: '#c8ecff', top: 'crystal', eye: 'fierce', mouth: 'fang', x: ['spikes', 'claws'], s: 1.05 }, 'The guardian of snow. Every winter begins with a single breath from its jaws.');
  K(100, 'Lumikit', ['Lumen', 'Mind'], 2, null, 'mixed', 'myth', 'Origin Kit', { p: 'quad', c: ['#fff8f0', '#c890f0', '#ffffff'], ear: 'point', tail: 'curl', top: 'halo', gc: '#fff0a0', eye: 'big', x: ['gem', 'cheeks'], cc: '#f0a8ff', s: 0.7 }, 'A tiny Kit made of starlight. Some believe every Kit in Lumora descends from it.');

  // ---------- stats ----------
  var BST = { st1: 315, st2: 410, st3: 530, e1: 255, e2: 420, b1: 310, b2: 480, bug1: 200, bug2: 285, bug3: 420, ps1: 300, ps2: 420, ps3: 600, single: 455, rare: 500, legend: 620, myth: 600 };
  var CATCH = { st1: 45, st2: 45, st3: 45, e1: 255, e2: 120, b1: 190, b2: 75, bug1: 255, bug2: 120, bug3: 45, ps1: 45, ps2: 30, ps3: 15, single: 90, rare: 45, legend: 3, myth: 3 };
  var ROLE = {
    bal: [1, 1, 1, 1, 1, 1], phys: [1, 1.35, 0.95, 0.7, 0.85, 1.1], spec: [0.95, 0.7, 0.85, 1.35, 1.05, 1.1],
    tank: [1.2, 1.0, 1.4, 0.7, 1.05, 0.6], fast: [0.85, 1.15, 0.75, 1.05, 0.8, 1.4], wall: [1.4, 0.75, 1.1, 0.85, 1.3, 0.6],
    mixed: [1, 1.12, 0.95, 1.12, 0.95, 1.0]
  };
  PK.STAT_NAMES = ['HP', 'ATK', 'DEF', 'TEC', 'RES', 'SPD'];

  // ---------- learnsets ----------
  var COVER = {
    Plain: ['Terra', 'Brawl'], Blaze: ['Terra', 'Brawl'], Tide: ['Frost', 'Mind'], Leaf: ['Venom', 'Terra'], Volt: ['Metal', 'Gale'],
    Frost: ['Tide', 'Mind'], Brawl: ['Terra', 'Shade'], Venom: ['Shade', 'Terra'], Terra: ['Metal', 'Brawl'], Gale: ['Swarm', 'Plain'],
    Mind: ['Lumen', 'Shade'], Swarm: ['Terra', 'Venom'], Shade: ['Mind', 'Venom'], Lumen: ['Gale', 'Mind'], Metal: ['Terra', 'Volt'], Wyrm: ['Blaze', 'Tide']
  };
  function tier(p) { return p <= 45 ? 1 : p <= 70 ? 2 : p <= 90 ? 3 : 4; }
  var SIG = {};
  var SIGS = { 3: ['grovewrath', 36], 6: ['infernohorn', 36], 9: ['maelstrom', 36], 97: ['sunfire', 1], 98: ['monsoon', 1], 99: ['glacialfang', 1], 100: ['pixelburst', 1] };

  function buildLearnset(k) {
    var r = PK.seeded(PK.hash('learn' + k.name));
    var sig = PK.SIGNATURE;
    var preferP = k.stats[1] >= k.stats[3];
    var t1 = k.types[0], t2 = k.types[1] || COVER[t1][0], cv = COVER[t1][k.types[1] ? 0 : 1], cv2 = COVER[t2] ? COVER[t2][0] : 'Plain';
    var used = {};
    function pick(type, tr) {
      var all = Object.keys(PK.MOVES).map(function (id) { return PK.MOVES[id]; }).filter(function (m) {
        return m.type === type && m.cat !== 'S' && tier(m.power) === tr && sig.indexOf(m.id) < 0 && !used[m.id];
      });
      if (!all.length) return null;
      var pref = all.filter(function (m) { return (m.cat === 'P') === preferP; });
      var pool = pref.length ? pref : all;
      var m = pool[r.int(pool.length)];
      used[m.id] = 1;
      return m.id;
    }
    function status(type) {
      var all = Object.keys(PK.MOVES).map(function (id) { return PK.MOVES[id]; }).filter(function (m) {
        return m.type === type && m.cat === 'S' && sig.indexOf(m.id) < 0 && !used[m.id];
      });
      if (!all.length) return null;
      var m = all[r.int(all.length)];
      used[m.id] = 1;
      return m.id;
    }
    var plan = [
      [1, function () { return pick('Plain', 1); }],
      [1, function () { return status('Plain'); }],
      [4, function () { return pick(t1, 1); }],
      [8, function () { return k.types[1] ? pick(t2, 1) : status(t1); }],
      [12, function () { return pick('Plain', 2); }],
      [16, function () { return pick(t1, 2); }],
      [20, function () { return status(t1) || status('Plain'); }],
      [25, function () { return pick(t2, 2) || pick(t1, 2); }],
      [30, function () { return pick(t1, 3); }],
      [35, function () { return status(t2) || status('Plain'); }],
      [40, function () { return pick(cv, 2) || pick(cv, 3); }],
      [45, function () { return pick(t2, 3) || pick('Plain', 3); }],
      [51, function () { return pick(t1, 4); }],
      [57, function () { return pick(cv2, 3) || pick('Plain', 3); }],
      [63, function () { return pick(cv, 3); }],
      [70, function () { return pick(t2, 4) || pick(t1, 4); }]
    ];
    var ls = [];
    plan.forEach(function (p) { var id = p[1](); if (id) ls.push([p[0], id]); });
    var s = SIGS[k.id];
    if (s) ls.push([s[1], s[0]]);
    ls.sort(function (a, b) { return a[0] - b[0]; });
    return ls;
  }

  Object.keys(KITS).forEach(function (id) {
    var k = KITS[id];
    var w = ROLE[k.role] || ROLE.bal, sum = w.reduce(function (a, b) { return a + b; }, 0);
    var r = PK.seeded(PK.hash('stats' + k.name));
    var total = BST[k.tier];
    k.stats = w.map(function (x) { return Math.max(10, Math.round(total * x / sum + (r() * 10 - 5))); });
    k.catchRate = CATCH[k.tier];
    k.exp = Math.round(total * 0.22);
    if (k.tier === 'legend' || k.tier === 'myth') k.exp = 200;
  });
  Object.keys(KITS).forEach(function (id) { KITS[id].learn = buildLearnset(KITS[id]); });
  // mark pre-evolutions
  Object.keys(KITS).forEach(function (id) { var e = KITS[id].evo; if (e) KITS[e.to].from = +id; });
  void SIG;

  PK.KITS = KITS;
  PK.KIT_COUNT = Object.keys(KITS).length;
})();

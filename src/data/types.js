// PixelKits' own 16-type system and effectiveness chart.
(function () {
  'use strict';
  var PK = window.PK = window.PK || {};
  var TYPES = {
    Plain: { color: '#a8a492' },
    Blaze: { color: '#ee6a2c' },
    Tide: { color: '#3c8ce0' },
    Leaf: { color: '#4cb04a' },
    Volt: { color: '#f2c428' },
    Frost: { color: '#7cd0ea' },
    Brawl: { color: '#c0443a' },
    Venom: { color: '#9c52b8' },
    Terra: { color: '#b88a4a' },
    Gale: { color: '#8ab4e8' },
    Mind: { color: '#ec5f9c' },
    Swarm: { color: '#9aba2c' },
    Shade: { color: '#5a4a78' },
    Lumen: { color: '#f4dc7a' },
    Metal: { color: '#9aa4b4' },
    Wyrm: { color: '#5a5ad8' }
  };
  // attacker -> { defender: multiplier }
  var CHART = {
    Plain: { Metal: 0.5, Terra: 0.5 },
    Blaze: { Leaf: 2, Frost: 2, Swarm: 2, Metal: 2, Tide: 0.5, Terra: 0.5, Blaze: 0.5, Wyrm: 0.5 },
    Tide: { Blaze: 2, Terra: 2, Metal: 2, Tide: 0.5, Leaf: 0.5, Frost: 0.5, Wyrm: 0.5 },
    Leaf: { Tide: 2, Terra: 2, Blaze: 0.5, Leaf: 0.5, Venom: 0.5, Gale: 0.5, Swarm: 0.5, Metal: 0.5, Wyrm: 0.5 },
    Volt: { Tide: 2, Gale: 2, Metal: 2, Volt: 0.5, Leaf: 0.5, Wyrm: 0.5, Terra: 0 },
    Frost: { Leaf: 2, Terra: 2, Gale: 2, Wyrm: 2, Blaze: 0.5, Frost: 0.5, Metal: 0.5, Tide: 0.5 },
    Brawl: { Plain: 2, Frost: 2, Metal: 2, Shade: 2, Venom: 0.5, Gale: 0.5, Mind: 0.5, Swarm: 0.5, Lumen: 0.5 },
    Venom: { Leaf: 2, Lumen: 2, Venom: 0.5, Terra: 0.5, Shade: 0.5, Metal: 0 },
    Terra: { Blaze: 2, Volt: 2, Venom: 2, Metal: 2, Leaf: 0.5, Swarm: 0.5, Gale: 0 },
    Gale: { Leaf: 2, Brawl: 2, Swarm: 2, Volt: 0.5, Terra: 0.5, Metal: 0.5 },
    Mind: { Brawl: 2, Venom: 2, Mind: 0.5, Metal: 0.5, Shade: 0 },
    Swarm: { Leaf: 2, Mind: 2, Shade: 2, Blaze: 0.5, Brawl: 0.5, Gale: 0.5, Metal: 0.5, Lumen: 0.5 },
    Shade: { Mind: 2, Lumen: 2, Brawl: 0.5, Metal: 0.5 },
    Lumen: { Shade: 2, Wyrm: 2, Blaze: 0.5, Lumen: 0.5, Metal: 0.5 },
    Metal: { Frost: 2, Lumen: 2, Blaze: 0.5, Tide: 0.5, Volt: 0.5, Metal: 0.5 },
    Wyrm: { Wyrm: 2, Gale: 2, Metal: 0.5 }
  };
  PK.TYPES = TYPES;
  PK.TYPE_LIST = Object.keys(TYPES);
  PK.typeEff = function (atk, defTypes) {
    var m = 1;
    for (var i = 0; i < defTypes.length; i++) {
      var r = CHART[atk] && CHART[atk][defTypes[i]];
      if (r != null) m *= r;
    }
    return m;
  };
  // Status immunities by type
  PK.STATUS_IMMUNE = { brn: ['Blaze'], psn: ['Venom', 'Metal'], par: ['Volt'], frz: ['Frost'] };
})();

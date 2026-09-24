# PixelKits

**A retro creature-collecting RPG that runs in your browser.**

Explore the land of **Lumora**, catch and raise **100 original Kits**, challenge **8 Gym Wardens**, stop the **Hollow Syndicate**, climb **Crown Summit** to face the **High Council** and the **Champion** — then sail south to uncover the secrets of **Starfall**.

PixelKits is inspired by the classic handheld monster-collecting RPGs of the late '90s and early 2000s. Every creature, character, place, move, item, sprite, tile, sound and song in it was made from scratch for this project.

**▶ Play:** https://aryanyaksh-art.github.io/PixelKits/

---

## Features

- **100 original Kits** across 16 types (Plain, Blaze, Tide, Leaf, Volt, Frost, Brawl, Venom, Terra, Gale, Mind, Swarm, Shade, Lumen, Metal, Wyrm), with 2- and 3-stage evolutions by level, by elemental shard, or by time of day. Rare **Prism** color variants (1 in 512).
- **Three regions** — Verdant Vale, Sunscar Coast and Frostcrown Highlands — plus the Crown Summit League and a post-game southern sea. 69 maps: towns, trails, forests, caves, a volcano, a desert, an ice cavern, a villain tower and ancient ruins.
- **8 Gyms** with themed puzzles (hedge mazes, boulders, lava, water, ice sliding, a pitch-dark gym), **74 Keepers** who spot you from a distance, a rival who grows with you, the **Hollow Syndicate** villain arc, the **High Council** of four and the **Champion**.
- **Classic turn-based battles**: type matchups, same-type bonus, critical hits, status conditions (burn, poison, paralysis, sleep, freeze, confusion), stat stages, priority moves, multi-hit, recoil, drain, switching, items, catching, EXP for the whole team, move learning and evolution.
- **Post-game**: three weather guardians and a mythical Kit waiting at Starfall Ruins.
- **Day/night cycle** from your real clock — some Kits only appear at night or in the morning.
- **Field tools**: Machete (cut bushes), Pickaxe (smash rocks), Raft (cross water), plus ledges, ice, weather and hidden items.
- **Menus**: party, summary, bag with pockets, KitLog (seen/caught), shops, clinics, storage terminal, keeper card, options.
- **Saving** to your browser, plus **export/import save codes** to move a save between devices.
- **Original chiptune soundtrack** (27 tracks) and sound effects synthesized live with WebAudio, and a unique procedural cry for every Kit.
- **Touch controls** on phones and tablets.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | Arrow keys / WASD |
| A (confirm, talk, interact) | Z / Space / J |
| B (back, cancel) | X / Esc / Backspace / K |
| Menu | Enter / Tab / C |
| Run | Hold Shift |

On touch devices an on-screen D-pad and buttons appear automatically.

## Running locally

No build step and no dependencies. Either:

- open `index.html` directly in a browser, or
- run the included dev server and visit http://localhost:8765:

```bash
python tools/serve.py
```

## Development tools

```bash
node tools/validate.mjs   # checks all data: maps, warps, edges, reachability, trainers, items, music
node tools/sim.mjs 3000   # headless battle simulator (stress test + balance numbers)
node tools/balance.mjs    # typical player team vs every boss
```

Debug mode: open `index.html?debug=1` for a **DEBUG** entry in the in-game menu (warp, heal, levels, items) and press <kbd>`</kbd> to toggle 4× speed. Art galleries: `?gallery=kits`, `?gallery=tiles`, `?gallery=chars`, `?gallery=buildings`.

## Project layout

```
index.html, style.css
src/engine/   loop & scene stack, input, renderer & effects, bitmap font, RNG, chiptune audio
src/gfx/      pixel-art builder, tiles, buildings, characters, Kit art generator, battle effects
src/data/     types, moves, Kits, items, trainers, music, maps (world1-3), story scripts
src/systems/  Kit stats/EXP, battle rules, game state & saving
src/scenes/   overworld, battle, menus, title/intro/credits, debug
tools/        dev server, validator, simulators
```

## Originality

See [ORIGINALITY.md](ORIGINALITY.md) for how PixelKits keeps its content original.

## License

MIT — see [LICENSE](LICENSE).

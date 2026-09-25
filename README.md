# PixelKits

**A retro creature-collecting RPG that runs in your browser.**

Explore the land of **Lumora**, catch and raise **110 original Kits**, challenge **8 Gym Wardens**, stop the **Hollow Syndicate**, climb **Crown Summit** to face the **High Council** and the **Champion** — then sail to the secret **Moonlit Isles** and uncover the secrets of **Starfall**.

PixelKits is inspired by the classic handheld monster-collecting RPGs of the late '90s and early 2000s. Every creature, character, place, move, item, sprite, tile, sound and song in it was made from scratch for this project.

**▶ Play:** https://aryanyaksh-art.github.io/PixelKits/

---

## Features

- **110 original Kits** across 16 types (Plain, Blaze, Tide, Leaf, Volt, Frost, Brawl, Venom, Terra, Gale, Mind, Swarm, Shade, Lumen, Metal, Wyrm), with 2- and 3-stage evolutions by level, by elemental shard, or by time of day. Rare **Prism** color variants (1 in 512).
- **Deep battle system**: single and **double battles** (2 vs 2, with targeting and moves that hit both foes), **32 abilities**, **25 temperaments** (+10% / -10% stat natures), hidden **genes** and **Training Points** earned from battles, type matchups, critical hits, status conditions, stat stages, priority, multi-hit, recoil, drain, switching, items and catching.
- **Three regions** — Verdant Vale, Sunscar Coast and Frostcrown Highlands — plus the Crown Summit League, 85 maps in all: towns, trails, forests, caves, a volcano, a desert, an ice cavern, a villain tower and ancient ruins.
- **Secret areas**: the Hidden Hollow and Glacier Grotto caves, and the post-game **Moonlit Isles** (ferry from Saltmarsh) with 10 island-only Kits, a new Syndicate story and a Moon Guardian.
- **Wildwood Reserve** safari park: 30 Safari Capsules, 500 steps, Snacks and Claps instead of battling.
- **8 Gyms** with themed puzzles, **93 Keepers** who spot you from a distance (some in pairs for double battles), a rival who grows with you, the **Hollow Syndicate**, the **High Council** of four and the **Champion**.
- **Rally Bell** rematches (keepers come back stronger), a **Recall Master** who re-teaches forgotten moves, stat **Roots** and **Boost Candy**.
- **Lumora Map** that shows where you are; the **Wayfinder** flies you to any town you've visited.
- **Trail Bike**, running (hold B), Machete / Pickaxe / Raft field tools, a Seeker Lens for hidden items, Exit Cords for caves. Cleared bushes and rocks stay cleared.
- **Day/night cycle** from your real clock — some Kits only appear at night or in the morning.
- **Move details everywhere**: a move card when learning, a full move screen (type, power, accuracy, charges, description) when choosing what to forget, descriptions in the battle move menu, shops, Skill Discs and the Recall Master.
- **Edit your Kits** (party menu → EDIT, or the Name Sage in Pinecrest): rename, reorder or forget moves, and pick one of 9 color tints.
- **Menus**: party, 4-page summary, bag with pockets, KitLog, shops, clinics, storage terminal, keeper card, options.
- **3 save files**, plus **export/import save codes** to move a save between devices.
- **Original chiptune soundtrack** (30 tracks) and sound effects synthesized live with WebAudio, and a unique procedural cry for every Kit.
- **Touch controls** on phones and tablets.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | Arrow keys / WASD |
| A (confirm, talk, interact) | Z / Space / J |
| B (back, cancel) | X / Esc / Backspace / K |
| Menu | Enter / Tab / C |
| Run | Hold B (or Shift) |
| Use registered key item | Tap Shift (SELECT) |
| Type a name | Just type on your keyboard |

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
src/data/     types, moves, Kits, abilities, items, trainers, music, maps (world1-4), story scripts
src/systems/  Kit stats/EXP, battle rules, game state & saving
src/scenes/   overworld, battle, menus, region map, title/intro/credits, debug
tools/        dev server, validator, simulators
```

## Originality

See [ORIGINALITY.md](ORIGINALITY.md) for how PixelKits keeps its content original.

## License

MIT — see [LICENSE](LICENSE).

# Originality

PixelKits borrows the *genre*, not anybody's *expression*. Game mechanics and genre conventions (turn-based battles, elemental matchups, collecting creatures, towns connected by routes, gyms and a final league) are ideas that many games share. Everything you actually see, hear and read in PixelKits was created for this project.

## What was made from scratch

- **Creatures** — all 110 Kits have original names, designs, types, stats, categories and KitLog entries. Their sprites are generated in code from per-species body-plan specs (`src/gfx/kitArt.js`, `src/data/kits.js`). No existing creature designs were traced or referenced; designs that drifted toward an iconic existing mascot (for example a zigzag lightning tail) were changed.
- **Art** — tiles, buildings, characters, UI frames, the capture device and the font are all drawn procedurally or from hand-authored pixel data in this repository. No sprites, tiles, fonts or UI were ripped from any game.
- **Music and sound** — every track is an original composition written in MML (`src/data/music.js`) and played by the game's own synthesizer. Sound effects and creature cries are synthesized at runtime.
- **World and story** — the continent of Lumora, its regions, towns, characters (Professor Ines Vale, the Hollow Syndicate, the Wardens, the High Council, the Champion) and plot are original.
- **Systems vocabulary** — the game uses its own terms: *Kits*, *Keepers*, *Kit Capsules*, *KitLog*, *Kit Clinic*, *Crests*, *Wardens*, *High Council*, *Skill Discs*, *Tonics*, *Prism* variants, *Temperaments*, *Training Points*, *Rally Bell*, *Recall Master*, *Wildwood Reserve*, and field tools (Machete, Pickaxe, Raft, Trail Bike, Seeker Lens).
- **Abilities and temperaments** — all 32 abilities and 25 temperaments have original names and were checked against the lists described below.
- **Type system** — 16 types with PixelKits' own names and effectiveness chart (`src/data/types.js`). Stats are HP / ATK / DEF / TEC / RES / SPD.

## How names were checked

During development every Kit, move, item, ability, temperament, place and character name was compared automatically against public lists of existing franchise names (species, moves, items, locations, abilities). Exact matches were rejected, and Kit names within two letters of an existing creature name were renamed. Character names were also reviewed by hand and names associated with other well-known franchises were replaced. The reference lists were used only for this check and are not part of the repository.

## Design choices that avoid known patents

Capturing a Kit is a turn-based menu action inside a battle. There is no aiming or throwing of capture devices at creatures in the overworld, and there are no rideable creatures.

## Note

This document describes the care taken to keep PixelKits original. It is not legal advice.

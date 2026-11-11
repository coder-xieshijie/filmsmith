# Recipe: strip

A launch told as one strip of real film on a light box: the strip runs in and brakes on its intertitles, every frame is pulled into a fixed gate by a claw pull-down on the beat, one frame punches to the full frame and shrinks onto a contact sheet where each film is a strip as long as itself, a grease pencil rings the pick, the picked film runs, and the strip runs out of the gate to leave the name. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [strip](../modes/strip.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/strip/`, whose `content.js` is the example film.

## Reference look

[`reel-box`](../../assets/runtime/bricks/look/reel-box/CARD.md): a light box (`lightbox-carmine`, carmine pencil `#C2185B`; `lightbox-blue`, `#2F5BD8` for red, pink or magenta picks) or an editing bench (`flatbed`, pink pencil); the film's black base `#0B0C0D` with sprocket holes showing the ground, intertitle frames `#1B1D1F` with `#ECEFEE` type, the optical track dim until it lights; Hanken Grotesk for intertitles (79 px), captions (59), row names (33) and the name (140), DM Mono for lengths and the address (44); scale 25 · 33 · 44 · 59 · 79 · 105 · 140 (Chinese from 28); a locked camera, the strip moving through a fixed gate; the box brighter at the gate (`texture.js` `lightbox`), no grain.

## Recommended bricks

| Slot (arc `gate-reel`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`reel-titles`](../../assets/runtime/bricks/scene/reel-titles/CARD.md) (`run: true`: the strip runs in and brakes on the first title) | – |
| claim | [`reel-titles`](../../assets/runtime/bricks/scene/reel-titles/CARD.md) (`track: true` on a line lights its optical track) | – |
| demo | [`gate-frames`](../../assets/runtime/bricks/scene/gate-frames/CARD.md) (a frame a beat, its name under the gate) | – |
| turn | [`frame-punch`](../../assets/runtime/bricks/scene/frame-punch/CARD.md) | [`gate-punch`](../transitions.md#gate-punch) (the runtime move it is made of) |
| proof | [`length-sheet`](../../assets/runtime/bricks/scene/length-sheet/CARD.md) | [`row-pull`](../../assets/runtime/bricks/motion/row-pull/CARD.md) (own) |
| climax | [`pick-run`](../../assets/runtime/bricks/scene/pick-run/CARD.md) | [`pencil-loop`](../../assets/runtime/bricks/motion/pencil-loop/CARD.md) (own), [`sheet-pick`](../transitions.md#sheet-pick) |
| lockup | [`reel-lockup`](../../assets/runtime/bricks/scene/reel-lockup/CARD.md) | [`strip-advance`](../transitions.md#strip-advance) (the run-out) |
| every scene | [`film-strip`](../../assets/runtime/bricks/prop/film-strip/CARD.md) (the reel engine `reel.js`, the scene machinery `scenes.js`), [`contact-sheet`](../../assets/runtime/bricks/prop/contact-sheet/CARD.md) | – |
| sound | [`reel-bed`](../../assets/runtime/bricks/sound/reel-bed/CARD.md) (preset `thread`, in D) | – |

## Ban list

- A recoloured, retouched or regenerated frame; a frame that is not a real frame of the film it names; a length typed instead of measured.
- A strip that bends, tilts or curls; a camera move; a gate that moves; a film burn, scratches, flicker or a fake projector gate weave.
- The pencil within ΔE00 20 of a colour inside the picked cell (take `lightbox-blue`); the pencil on anything but the pick and the address.
- A dissolve between frames: every change is a pull-down, a punch or a run.
- More than four intertitles in a row; an intertitle longer than three words.
- Beside another real-asset style's bricks: its lock-up and its bed too (one lock-up and one bed a film, [creative.md](../creative.md#rules-for-any-composition)).

## Template → bricks

| Template part (`assets/templates/strip/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `film.js` light box and type | [`reel-box`](../../assets/runtime/bricks/look/reel-box/CARD.md) (+ `texture.js`) | the three presets keep the template's hexes; `panel` / `onPanel` are the intertitle frame and its type, `line` the gate's corner marks |
| `film.js` reel, gate, captions; `lib/handoffs/strip.js` paintStrip, paintTrack | [`film-strip`](../../assets/runtime/bricks/prop/film-strip/CARD.md) (`reel.js`) | cells are a slot (`{ text, env }` an intertitle, `{ image, crop, env }` a frame) instead of `content.js`'s films table |
| `film.js` sheetState; `strip.js` paintSheet | [`contact-sheet`](../../assets/runtime/bricks/prop/contact-sheet/CARD.md) | rows are `{ name, duration, image }`, the row image one 192 × 108 cell per 4 s |
| `strip.js` pencilLoop, pencilUnderline | [`pencil-loop`](../../assets/runtime/bricks/motion/pencil-loop/CARD.md) | |
| `film.js` sheetState extend and lengths | [`row-pull`](../../assets/runtime/bricks/motion/row-pull/CARD.md) | |
| `choreo.js` every type, `film.js` scenes | `prop/film-strip/scenes.js` | the timelines read Chinese with lang.js times (6 characters a second plus half a second) |
| `titles` | [`reel-titles`](../../assets/runtime/bricks/scene/reel-titles/CARD.md) | `lead` 0.25 beat (the first pull-down under the scene before) unless `run` |
| `frames` | [`gate-frames`](../../assets/runtime/bricks/scene/gate-frames/CARD.md) | `lead` 0.25 beat |
| `punch` | [`frame-punch`](../../assets/runtime/bricks/scene/frame-punch/CARD.md) | |
| `sheet` | [`length-sheet`](../../assets/runtime/bricks/scene/length-sheet/CARD.md) | |
| `pick` | [`pick-run`](../../assets/runtime/bricks/scene/pick-run/CARD.md) | |
| `lockup` | [`reel-lockup`](../../assets/runtime/bricks/scene/reel-lockup/CARD.md) | `lead` 0.25 beat when it opens on a source frame |
| `score.mjs` | [`reel-bed`](../../assets/runtime/bricks/sound/reel-bed/CARD.md) (preset `thread`) | |
| `content.js` scene order, `timing.rules.js` | [`gate-reel`](../../assets/runtime/bricks/arc/gate-reel/CARD.md) | |
| `moves.js` adapters (strip-advance, gate-punch, sheet-pick) | not copied: the runtime hand-offs, called from `reel.js` | |

What stays in the recipe: the reel is one object across scenes. Hand each gate scene the cell the reel shows before its first landing (`before`) and the cells that follow (`after`, the next scene's frames), so the strip reads as continuous at both seams; give `frame-punch` the punched frame and its cell on the sheet (`cell: { row, cell }`) and give `length-sheet` and `pick-run` the same `rows` in the same order. Optical tracks take each cell's own sound envelope (`env`, 64–208 RMS values); without one, a line lit with `track` gets a fixed sample envelope. What stays in the template: extracting frames, row strips, lengths and envelopes from the rendered films (`tools/extract.mjs` with ffprobe and ffmpeg) and checking them (`tools/check-assets.mjs`: hashes, the measured lengths, the pencil's ΔE00 against the picked cell).

## Chinese

Intertitles, claims, captions and film names are set in Chinese; lengths and frames stay as measured. The open plans 9 beats against 6 and the claims 7 against 5, so the strip brakes on its titles longer. An intertitle still holds at most three words, a Chinese one at most about six characters. A Chinese film takes these lengths ([system](../system.md#language)).

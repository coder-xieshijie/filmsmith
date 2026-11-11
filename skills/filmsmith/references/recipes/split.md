# Recipe: split

A launch told by one movable seam: on one side what someone writes (a request, a list, real lines of a real file, a command, a one-line diff, the install line), on the other what that makes (real frames, a real report, a real page). The seam is born from the caret of the first typed line, every change in the film is a move of the seam (a drawer, a louvre, a wipe line, a branch, a slider), and it closes in the last bar leaving the caret waiting. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [split](../modes/split.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/split/`, whose `content.js` is the example film.

## Reference look

[`diff-paper`](../../assets/runtime/bricks/look/diff-paper/CARD.md): warm paper `#F3F2EE` for the input side, a near-black bench `#15171A` behind results and the report, one accent that is the seam (`diff-teal` `#007C72`; `diff-night` with the input side dark, `#36B5B0`; `diff-plum` `#A23B92` for green or teal results); Archivo 700 on its width axis (semi-expanded) for claims (59 px) and the name (105), JetBrains Mono for the request and the command (44), code, the list and the install line (33), labels, chips and report lines (25; Chinese 28); scale 25 · 33 · 44 · 59 · 79 · 105; a locked camera; no texture, nothing over a result.

## Recommended bricks

| Slot (arc `seam-edit`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`request-open`](../../assets/runtime/bricks/scene/request-open/CARD.md) | [`split-open`](../transitions.md#split-open) (the runtime move, with `caret`) |
| demo | [`pick-list`](../../assets/runtime/bricks/scene/pick-list/CARD.md) | [`louvre`](../transitions.md#louvre) (nine slats, then one-slat pushes), [`pair-hop`](../../assets/runtime/bricks/motion/pair-hop/CARD.md) (own) |
| proof (input → output) | [`file-pair`](../../assets/runtime/bricks/scene/file-pair/CARD.md) | [`wipe-line`](../transitions.md#wipe-line), [`pair-hop`](../../assets/runtime/bricks/motion/pair-hop/CARD.md) |
| proof (run and measure) | [`render-branch`](../../assets/runtime/bricks/scene/render-branch/CARD.md) | [`split-branch`](../transitions.md#split-branch) |
| climax | [`diff-climax`](../../assets/runtime/bricks/scene/diff-climax/CARD.md) | [`diff-slider`](../transitions.md#diff-slider) |
| lockup | [`seam-lockup`](../../assets/runtime/bricks/scene/seam-lockup/CARD.md) | [`wipe-line`](../transitions.md#wipe-line), [`seam-close`](../../assets/runtime/bricks/motion/seam-close/CARD.md) (own) |
| every scene | [`seam-grip`](../../assets/runtime/bricks/prop/seam-grip/CARD.md) (the engine `split.js`, the scene machinery `scenes.js`), [`code-gutter`](../../assets/runtime/bricks/prop/code-gutter/CARD.md), [`report-pane`](../../assets/runtime/bricks/prop/report-pane/CARD.md) | – |
| sound | [`shell-bed`](../../assets/runtime/bricks/sound/shell-bed/CARD.md) (preset `terminal`, A minor) | – |

## Ban list

- A result that was not rendered or captured, or one recoloured, retouched, tinted, grained or veiled; a result past 1.333 output px per source px.
- A divider that springs, wobbles or glows; a round before/after handle with arrows; crossfades, dissolves or flashes between contents.
- Editor chrome (window frame, tabs, traffic lights), syntax colours, a fake terminal window; device mockups, tilted screens, shadows.
- Two input lines changed for one diff; two renders that differ by more than the shown line.
- More than one pairing mark at a time; a chip that says anything but the result's source; the seam as content (a letter, an arrow, a chart line).
- Beside another real-asset style's bricks: its lock-up and its bed too (one lock-up and one bed a film, [creative.md](../creative.md#rules-for-any-composition)).

## Template → bricks

| Template part (`assets/templates/split/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `film.js` type | [`diff-paper`](../../assets/runtime/bricks/look/diff-paper/CARD.md) | the three presets keep the template's hexes under new ids (`diff-teal`, `diff-night`, `diff-plum`: `night` is another look's palette id); `ground` is the paper, `panel` the bench |
| `lib/handoffs/seam.js`, `film.js` chip, grips, caret; `choreo.js` layout and `placeOf` | [`seam-grip`](../../assets/runtime/bricks/prop/seam-grip/CARD.md) (`split.js`) | assets are slots (`{ image, size, kind, focus, at, chip }`) instead of `content.js`'s manifest |
| `film.js` inputOf.file, inputOf.diff | [`code-gutter`](../../assets/runtime/bricks/prop/code-gutter/CARD.md) | |
| `film.js` reportPane | [`report-pane`](../../assets/runtime/bricks/prop/report-pane/CARD.md) | |
| `film.js` the pick's tick and the file's underline | [`pair-hop`](../../assets/runtime/bricks/motion/pair-hop/CARD.md) | |
| `film.js` the lock-up's close and blinks | [`seam-close`](../../assets/runtime/bricks/motion/seam-close/CARD.md) | |
| `choreo.js` plan1 (every type), `film.js` stateOf, resultPane, chipFor | `prop/seam-grip/scenes.js` | the timelines read Chinese with lang.js times |
| `request` | [`request-open`](../../assets/runtime/bricks/scene/request-open/CARD.md) | |
| `pick` | [`pick-list`](../../assets/runtime/bricks/scene/pick-list/CARD.md) | |
| `file` | [`file-pair`](../../assets/runtime/bricks/scene/file-pair/CARD.md) | |
| `render` | [`render-branch`](../../assets/runtime/bricks/scene/render-branch/CARD.md) | `p2Beat` places the claim's second phrase where a film wants it |
| `diff` | [`diff-climax`](../../assets/runtime/bricks/scene/diff-climax/CARD.md) | `bar`: the beat of its bar the scene starts on, so the slider lands on a bar line |
| `lockup` | [`seam-lockup`](../../assets/runtime/bricks/scene/seam-lockup/CARD.md) | |
| `score.mjs` | [`shell-bed`](../../assets/runtime/bricks/sound/shell-bed/CARD.md) (preset `terminal`) | |
| `content.js` scene order, `timing.rules.js` | [`seam-edit`](../../assets/runtime/bricks/arc/seam-edit/CARD.md) | |
| `moves.js` adapters (split-open, louvre, seam-push, wipe-line, split-branch, diff-slider) | not copied: the runtime hand-offs, called from `split.js` with the adapters' fixed params | |

What stays in the recipe: the seam is one object across scenes, so each scene after the first takes `from`, the scene before as its params with its `type`: the pick opens on that scene's last result (pushed in if it differs) while the request's copy leaves, the file's and the lock-up's wipe lines cross from that scene's last state, and the render's band rises from the file's seam with the frame riding up. Hand the same asset object (image, focus, chip) to every scene that shows it. The diff takes `bar` so its landing is on a bar line of the film, not of the scene. What stays in the template: decoding frames and rendering the before and after (`tools/capture.mjs`), and checking assets and quotes (`tools/check-assets.mjs`: hashes, a fresh decode of each frame at PSNR ≥ 30 dB, every quoted line verbatim in its file, the report equal to the tool's output, the zoom cap, people; `tools/regions.mjs` for the seam's ΔE00 against each result region).

## Chinese

Claims are set in Chinese (Noto Sans SC after Archivo); code, list items, commands, report lines and chips stay Latin, since they quote real files and real output. Labels, chips and report lines in Chinese sit at the 28 px floor. Plans run longer: the render 10 beats against 7, the diff longer than its English. A Chinese film takes these lengths ([system](../system.md#language)).

# Recipe: ink

Type as percussion on paper: heavy extra-condensed capitals slammed one word a beat, each word's full stop an accent dot that carries every cut — it hops to the next stop, buds and merges, bursts into the method, blooms into the field the name rises out of, walks the progress row on night, leaves through the counter of the claim and ends as the cursor of the closing command. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [ink](../modes/ink.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/ink/`, whose `content.js` is the example film.

## Reference look

[`paper-slam`](../../assets/runtime/bricks/look/paper-slam/CARD.md): four presets (`cobalt` default, `vermilion`, `forest`, `carbon` dark), each paper, ink, soft, one accent with its `onAccent`, a night ground with its own ink, soft and lifted accent, and the misregistration colour `mis`; the accent means only the dot and what it becomes (stop, burst, field, playhead, cursor); Archivo 900 on its width axis — words extra-condensed (−0.02 em), the name and the claim at normal width (−0.035 em) — and IBM Plex Mono labels in capitals (+0.12 em); baselines 640, or 520 · 830; 150 px margins; an ambient push (1.4 %/s easing into 6.5 %) and a 5 % punch-in on every landing; grain 10 %; the ghost on impact frames only. The bricks share `look/paper-slam/kit.js` (the per-glyph word with slam, rise, warp and the masked exit; the label; the dot with its squash and bounce; the camera; the streaks).

## Recommended bricks

| Slot (arc `dot-to-claim`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`word-swap`](../../assets/runtime/bricks/scene/word-swap/CARD.md) (`first`) | – |
| problem | [`dot-slam`](../../assets/runtime/bricks/scene/dot-slam/CARD.md) (a number; `stops: 'each'` for "one of them"), [`word-warp`](../../assets/runtime/bricks/scene/word-warp/CARD.md) | – |
| turn | [`dot-burst`](../../assets/runtime/bricks/scene/dot-burst/CARD.md) | runtime [`collapse-burst`](../transitions.md#collapse-burst) (inside it) |
| turn (the break) | – (the bloom: template only, see below) | runtime [`ink-wash`](../transitions.md#ink-wash) or `dot-iris` as the cut into the name without it |
| climax (the first drop) | [`width-name`](../../assets/runtime/bricks/scene/width-name/CARD.md) | runtime [`anchor-swap`](../transitions.md#anchor-swap) (the scan out of it, the dot holding still) |
| demo | [`step-dots`](../../assets/runtime/bricks/scene/step-dots/CARD.md) (or [`film-ruler`](../../assets/runtime/bricks/scene/film-ruler/CARD.md) mid-film) | – |
| proof | [`count-stop`](../../assets/runtime/bricks/scene/count-stop/CARD.md); [`word-swap`](../../assets/runtime/bricks/scene/word-swap/CARD.md) (`answer`, the verdicts) | – |
| claim (the second drop) | [`claim-portal`](../../assets/runtime/bricks/scene/claim-portal/CARD.md) | runtime [`whiteout-slam`](../transitions.md#whiteout-slam) (into it), `counter-portal` (inside it) |
| lockup | [`cursor-close`](../../assets/runtime/bricks/scene/cursor-close/CARD.md) (`risen` after a portal) | – |
| every scene | [`glyph-slam`](../../assets/runtime/bricks/motion/glyph-slam/CARD.md), [`ink-dot`](../../assets/runtime/bricks/prop/ink-dot/CARD.md) (inside the kit); [`bar-window`](../../assets/runtime/bricks/motion/bar-window/CARD.md) for a wipe out of a dot | runtime [`aperture-swap`](../transitions.md#aperture-swap) shapes (inside `word-swap`) |
| sound | [`inkbeat-bed`](../../assets/runtime/bricks/sound/inkbeat-bed/CARD.md) (lib/audio `inkbeat`) | – |

## Ban list

- The accent on anything but the dot and what it becomes; the warped word is the one word it may colour, once a film.
- A second dot in the frame (the split stops merge back into one), a dot that appears without arriving (it hops, drops or pops in).
- Bounce: slams overshoot under 8 %; no rubber, no squash on type.
- Crossfades and frame-level cuts that do not come from the dot (every cut is the dot's: a hop, a bar window, an iris, a scan, a burst, the portal).
- A second claim, a second whiteout; type below its floor (split the line).
- The misregistration ghost as a resting style.

## Template → bricks

| Template part (`assets/templates/ink/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `TYPE_WIDTHS`, type, grid and camera of `film.js` | [`paper-slam`](../../assets/runtime/bricks/look/paper-slam/CARD.md) (+ `kit.js`) | |
| `word()` mode slam, camera punch | [`glyph-slam`](../../assets/runtime/bricks/motion/glyph-slam/CARD.md) | |
| `swap` (`drawSwap`, `swapState`) | [`word-swap`](../../assets/runtime/bricks/scene/word-swap/CARD.md) | aperture-swap's shapes drawn as canvas clips |
| `slam` (`drawSplit`) | [`dot-slam`](../../assets/runtime/bricks/scene/dot-slam/CARD.md) | the merge's gooey neck not drawn |
| `warp` | [`word-warp`](../../assets/runtime/bricks/scene/word-warp/CARD.md) | |
| `burst` (`drawBurst`) | [`dot-burst`](../../assets/runtime/bricks/scene/dot-burst/CARD.md) | runtime [`collapse-burst`](../transitions.md#collapse-burst), unchanged |
| `name` (`namePlayhead`, `widthSteps`) | [`width-name`](../../assets/runtime/bricks/scene/width-name/CARD.md), [`width-jump`](../../assets/runtime/bricks/motion/width-jump/CARD.md) | |
| `steps`, `drawStreaks` | [`step-dots`](../../assets/runtime/bricks/scene/step-dots/CARD.md) | |
| `ruler` | [`film-ruler`](../../assets/runtime/bricks/scene/film-ruler/CARD.md) | the film's length is a parameter |
| `counter` | [`count-stop`](../../assets/runtime/bricks/scene/count-stop/CARD.md) | |
| `claim` (`paintClaim`, `drawClaim`, the portal set-up) | [`claim-portal`](../../assets/runtime/bricks/scene/claim-portal/CARD.md) | runtime [`counter-portal`](../transitions.md#counter-portal), unchanged; the landing shock is runtime [`whiteout-slam`](../transitions.md#whiteout-slam) |
| `cta` | [`cursor-close`](../../assets/runtime/bricks/scene/cursor-close/CARD.md) | |
| `drawTransition` `wipe` | [`bar-window`](../../assets/runtime/bricks/motion/bar-window/CARD.md) | |
| `drawDot`, `landSq`, `bounceAt` | [`ink-dot`](../../assets/runtime/bricks/prop/ink-dot/CARD.md) | |
| `score.mjs`, lib/audio `inkbeat` | [`inkbeat-bed`](../../assets/runtime/bricks/sound/inkbeat-bed/CARD.md) | |
| `content.js` order, `timing.rules.js` | [`dot-to-claim`](../../assets/runtime/bricks/arc/dot-to-claim/CARD.md) | |
| transitions `aperture-swap`, `whiteout-slam`, `ink-wash`, `dot-iris`; hand-offs `anchor-swap`, `collapse-burst`, `counter-portal` | runtime, referenced | not copied |

What stays in the recipe:

- **The bloom** (`bloom.js`, `inkflow.js`, the baked fluid simulation the owner approved, seed 20261018, about 6 MB of frames): one look made for one place (the dot sinking into the paper and blooming into the field the name rises out of); a brick would be the bake itself. Without it the arc cuts from the burst to the name through runtime [`ink-wash`](../transitions.md#ink-wash) or `dot-iris`.
- **The generic dot between scenes** (the hop from one scene's stop to the next one's, `keys`, `owns`, `genericDot` in `film.js`): it is the plan's — it needs both scenes' stops and the transition between them. Each scene brick draws its own dot from its first landing to its last; the film draws the hop.
- **The transitions the dot owns** (`wipe`, `iris`, `flood`, `scan`): `wipe` is [`bar-window`](../../assets/runtime/bricks/motion/bar-window/CARD.md); `iris` and `flood` are runtime [`dot-iris`](../transitions.md#dot-iris) and `ink-wash`; `scan` is runtime [`anchor-swap`](../transitions.md#anchor-swap).
- **Fit and the phrase rounding** (`timing.rules.js`, `plan.js`): the claim's whiteout on a bar line, the lock-up taking the rounding, the half bar of silence before each drop.

## Chinese

Ink's identity is an extra-condensed black on a width axis, slammed in capitals; Chinese has no width axis, no capitals and no condensed black. The redesign (accepted by the owner, 2026-11-10):

- **Display words** (every scene): Noto Sans SC 900 set as 长体 — scaled to 0.8 wide at the words' extra-condensed width, 1 at the name's and the claim's normal width — at the same sizes and floors, one 词 a beat, slammed glyph by glyph with the same spring and ghost; no tracking; labels Noto Sans SC 500 at 0.04 em; Latin and digits keep Archivo (with English tracking when a word holds no Chinese).
- **The width jumps** ([`width-jump`](../../assets/runtime/bricks/motion/width-jump/CARD.md), [`width-name`](../../assets/runtime/bricks/scene/width-name/CARD.md)): the same five steps as 长体 scales (0.86, 0.93, 0.8, 0.93, 1).
- **The counter portal** ([`claim-portal`](../../assets/runtime/bricks/scene/claim-portal/CARD.md)): a Latin 0 O Q D when the claim has one; else the Han character with the largest closed counter (found by flood-filling the rendered glyph: 口, 日, 回 … — the sample pushes through 交); else the full stop turns into 。 and the camera pushes through its ring.
- **The burst** ([`dot-burst`](../../assets/runtime/bricks/scene/dot-burst/CARD.md)): both words at normal width, since runtime [`collapse-burst`](../transitions.md#collapse-burst) samples the next word at the face's own width.

- **Length**: Chinese reads longer: with the example's copy the name plans 9 beats against 8, the counter 6 against 4, the claim 7 against 6. A Chinese film takes these lengths ([system](../system.md#language)).

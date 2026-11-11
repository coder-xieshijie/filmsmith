---
id: stagger-in
category: motion
tier: T0
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### stagger-in

- **Looks**: the items of a set arrive one after another. `list`: each row rises 44 px, grows from 0.82× and comes into focus (8 px blur to none) with a soft back that clicks on the landing frame; its icon lands 2 frames later and its key 4 frames later; the whole list drifts up 96 px at a constant slow speed the whole time, so the screen breathes while the rows land. `bars`: each bar grows from the baseline and the values grade along the order (height 1 → 0.35, offset 184 → 56 px, blur 32 → 8 px, tone from dim to the accent); on the second beat a pulse runs out from the centre, tallest in the middle. `dots`: a grid of points pops by distance from a source (each passes 1.5× and settles), then a pale wave returns inward and leaves the grid lit.
- **Tier**: T0. **Family**: vertical. **Surface**: canvas.
- **Use**: a set that should read in order inside one scene: a menu or feature list, bars of a spectrum or a ranking, a coverage grid, the power-on beat of an opening. **Not for**: items the viewer must compare at once; one hero object; more than about 20 items with text (the stagger outlasts reading).
- **Intent**: Let a set be read in order while the screen stays alive; in the bars and dots sets the order itself becomes visible, as a gradient or as a wave of power coming on.
- **Content**: list: 4–8 rows, each an icon, a short label (≤ 24 chars) and an optional key or badge; bars: 8–24 values; dots: a grid with an origin, no text. Or the film's own items as painters with rects.
- **Parameters**: `set` `list` | `bars` | `dots` (built-in neutral sets for the sample); `items` [{ `rect` [x, y, w, h], `paint(ctx, w, h, st)` }] (the film's own items; `st` gives `e` the landing, `lin` linear, `pulse`, `k` the gradient position, `height` for grow); `under` (the scene painter behind; default the ground); timing in the set's frames: `frames` (120 · 150 · 114), `start`, `spread` (whole stagger), `each` (one landing), `ease` (`softBack` · `cubicOut` · any curve); `order` `index` | `center` | `point` (with `origin` [x, y]); `envelope` `settle` | `grow` | `pop`; `drift` px; `gradient` { height, offset, blur, tone: [first, last] }; `pulse` { at, width, spread, order (`center` | `reverse`), amp [edge, centre] }. Roles read: `ground`; list rows `panel`, `line`, `ink`, `dim`, the active row `paper` / `onPaper`, the badge `accent` / `onAccent`; bars a tone from `dim` to `accent`; dots `accent` (the pulse mixed with white).
- **Theory**: successive onset groups items and leads the eye in reading order (Gestalt common fate; serial position); a gradient of values across the stagger makes the order itself visible, and a constant drift under discrete landings keeps a static layout alive without competing with it (Disney's overlapping action: two motions that do not share timing read as one living thing).
- **Styles**: any; in locked-camera styles drop `drift`.
- **Length and easing**: 8 beats (list, 120 frames at 120 BPM), 10 (bars), 7.6 (dots); range 6–12. list: 10-frame stagger, 24-frame landing on `softBack` (cubic-bezier 0.3, 1.18, 0.5, 1); bars: 45-frame stagger, 33-frame landing `cubicOut`, pulse at frame 84, 27 frames, spreading 19.5 frames to the edges; dots: 40-frame stagger by distance, 20.5-frame landing `cubicOut`, return wave at frame 71.
- **Sound**: `accent` ticks on the first two landings only (a tick on every row is noise); `land` on the pulse peak of `bars`.
- **Merged from**: `value-stagger-gradient` (set `bars`), `radial-wave` (set `dots`).
- **Source**: adapted from video-shotcraft `demos/ui-entrance/list-reveal/ListReveal.tsx` (card `references/shots/ui-entrance/list-reveal.md`); `demos/ui-entrance/value-stagger-gradient/ValueStaggerGradient.tsx` (card `references/shots/ui-entrance/value-stagger-gradient.md`); `demos/ui-entrance/radial-wave/RadialWave.tsx` (card `references/shots/ui-entrance/radial-wave.md`) @ `1266a3e`. Exports `springAt`, `riseText` and `keysOf`, which the scenes of batch 4 use.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws only the film's labels; Chinese rows use the same sizes).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the right-hand title of `list-reveal` and the code caption of `value-stagger-gradient` are scene content, not part of the brick; the bars' hue sweep (200° → 320°) is a tone from `dim` to the accent; the stage light, dust, grain and vignette belong to the look. Compare: list pass (track 0 px, events ±0); bars (dry run) track 4.7 px, RMSE 0.007, events ±1; dots (dry run) still points 0 px, SSIM drop 0.011.
- **Pitfalls**: The list's drift never returns to zero; to loop or match the next shot, ease the drift out. Recompute the stagger when the count changes and leave ≥ 1 s after the last item; in bars, more items push the entry into the centre pulse and the two beats blur. Keep the drift an order of magnitude slower than the items' landing, or the list reads as floating up as one. The bars' glow and the dots' wave need a dark ground; on white they barely show.

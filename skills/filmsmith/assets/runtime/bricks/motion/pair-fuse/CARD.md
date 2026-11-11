---
id: pair-fuse
category: motion
tier: T0
family: shape
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pair-fuse

- **Looks**: the lit pairs slide together outlined in the active colour (first half), then close into one chip whose outline turns the learned colour (second half, smootherstep); the labels slide into the new label; the chip settles with one swell ≤ 3.5 %.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: Any process whose step joins two neighbours into one unit: merging, compressing, bundling; the run decides which pair. **Not for**: Reassignment or routing (items move from owner to owner and nothing fuses): fusing chips would say the wrong thing.
- **Intent**: Two neighbours visibly become one unit, so the viewer sees what a merge step does rather than being told.
- **Content**: A board of rows of chips (a run: corpus of 2–6 words with weights); which pair fuses comes from the run.
- **Parameters**: `run` ({ corpus, merges, probe, top }), `step` (which merge, default 0; variant `second`), `title`, `subtitle`; roles `ground`, `ink`, `dim`, `accent`, `base`, `learned`, `cell`.
- **Theory**: Continuity of object identity (Kahneman, Treisman & Gibbs 1992, object files): the fused chip is read as the two parts made one because the motion never breaks.
- **Styles**: made for `trace` (recipe the trace recipe); fits trace; avoid halftone, morph.
- **Length and easing**: 3 beats: highlight 1, slide together 0.5, close 0.5, settle 0.4 s.
- **Sound**: `accent` on the highlight, `land` on the close.
- **Source**: own (`assets/templates/trace/pieces.js (drawRow), runs/bpe.js`), split from the template of the trace style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; run chips and code stay Latin mono in every language; the italic subtitle becomes the dim colour in Chinese.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the trace template (`assets/templates/trace/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the trace recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Every row must fuse the same pair in the same step; a row skipped reads as a bug.

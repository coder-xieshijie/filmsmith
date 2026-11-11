---
id: neutral
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### neutral

- **Looks like**: a plain workbench: warm light grey or near-black grounds, white or charcoal panels, one blue accent. Like a design tool's empty canvas.
- **Fits / does not fit**: samples, comparisons and animatics, where a brick is judged apart from any style / a film (it has no point of view).
- **Palette presets**:

  | id | ground | panel | ink | dim | line | accent | contrast (ink, dim, accent on ground) | accent means |
  |---|---|---|---|---|---|---|---|---|
  | neutral-light | #F2F1EE | #FFFFFF | #1C1C1C | #7A7A7A | #C9C7C2 | #2F6BFF | 15.09, 3.80, 3.98 | the one thing in play |
  | neutral-dark | #121314 | #1C1D20 | #F2F2F0 | #8C8C8C | #2E3034 | #5B8CFF | 16.59, 5.53, 5.88 | the one thing in play |
  | probe | #1A1A1A | #3A3A3A | #E6E6E6 | #8A8A8A | #555555 | #BDBDBD | 13.94, 5.04, 9.26 | none (comparison) |
  | probe-light | #E6E6E6 | #FFFFFF | #1E1E1E | #8A8A8A | #D2D2D2 | #7A7A7A | 13.36, 2.77, 3.44 | none (comparison) |

  `dim` on the light ground (3.80) is for captions only, never main text.
- **Type**: `display`, `text` Inter Tight; `mono` JetBrains Mono; Chinese stacks put Noto Sans SC after the Latin family (all OFL). Chinese is subset to the characters used (`tools/lib/fonts.mjs`, pyftsubset).
- **Type scale**: en 25, 34, 47, 64, 88, 120, 164, 225; zh 28, 36, 48, 64, 88, 120, 164. Floors: info en 25, zh 28; main 40.
- **Tracking, case, italic, leading**: en display −0.03 em, labels +0.12 em in capitals, italic allowed, leading 1.1; zh no negative tracking (labels +0.04 em), no capitals, no italic, leading 1.3.
- **Grid and frame**: 12 columns, margin 96, gutter 24, baseline 8, safe area 96 × 54.
- **Camera**: free; zoom cap 2.6; shutter 0.5; curves `snappy` in, `smooth` moves, `exit` out.
- **Texture and light**: none.
- **Source**: own (the brick spec 3.4). **Licence**: MIT; fonts Inter Tight (OFL-1.1), JetBrains Mono (OFL-1.1), Noto Sans SC (OFL-1.1). **Sample**: a specimen sheet per language (`sample/poster-en.jpg`, `poster-zh.jpg`); every brick sample is drawn in it.
- **Sample**: `poster.jpg`, an English still 480 px wide.

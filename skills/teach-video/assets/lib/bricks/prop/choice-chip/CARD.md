---
id: choice-chip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### choice-chip

- **Structure**: `pill` (height h, padding h × 0.5 a side, the panel colour with a line rim), `label` (h × 0.375 type), `tick` (grows from no width at the label's end when selected), `flash` (a one-frame grey from dim at 50 %), `light` (an accent pool under the chosen one).
- **Intent**: Act out a selection the way real UI does it: a one-frame press, then the system's confirmation, while the other options fade without moving, so 'only this one is chosen' reads clearly.
- **Content**: One short option label per chip (en ≤ 18 chars, zh ≤ 7); usually 3–6 chips in a set.
- **States**: `rest`; `pressed` (the one-frame flash); `selected` (ink fill, label in the panel colour, the tick, a 1 → 1.04 → 1 bounce, the light); `faded` (18 % in place, it does not move). `chip-select` walks them; `word-to-chip` lands a chip of the same family.
- **Sizes**: S 72 px high, M 96, L 128 (widths measured from the label).
- **Swap points**: `label` (3 words / 18 chars, zh 7 chars); a neutral title without it.
- **Parameters**: `backdrop` true; exports `chipWidth(ctx, label, h, P, tick)` and `drawChip(ctx, x, y, w, h, label, st, P)` with `st` `{ sel, press, fade, bounce, light }`. **Roles**: `panel`, `ink`, `dim`, `line`, `accent`, `ground`.
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx` (card `references/shots/interaction/chip-grid-single-select-blackout.md`); adapted from video-shotcraft `demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx` (card `references/shots/interaction/hashtag-to-pill-materialize.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Pitfalls**: The other chips must not move when one is chosen; reflowing reads as a page refresh and the single choice is lost. Size the chip widths from the real labels; long labels break fixed widths.
- **Sample**: `poster.jpg`, an English still 480 px wide.

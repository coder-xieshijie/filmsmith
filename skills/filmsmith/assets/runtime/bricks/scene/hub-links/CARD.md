---
id: hub-links
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### hub-links

- **Purpose**: shows that many sources come together in one place: either swallowed by it (merge) or kept and feeding it (connect).
- **Intent**: Turn 'many sources, one place' into a physical process: paths connect, and the sources are either swallowed so only the product remains (merge) or stay and keep feeding it (connect).
- **Content**: 4–5 sources as logos, images or neutral glyphs; one mark for the hub (on an opaque disc); in connect a page painter as the hub; in merge one caption (en ≤ 28 chars, zh ≤ 12).
- **Fits**: `demo`, `turn`, `proof`. **Not for**: an ordered pipeline (use a row of steps); more than six sources; showing the product page itself (it is only a picture inside the hub here).
- **Layout and camera**: `merge` (light): four source discs (176 px) in a column on the left, a sink disc (184 px) holding the film's mark on the right at 1408, 540, four bezier paths between them; at the end the whole group pans 448 px so the sink lands in the centre with the caption under it. `connect` (dark): an 820 × 520 hub panel holding the film's page, five 112 px source tiles round it (above-left, left, above, above-right, right) with orthogonal tubes into the panel's edges; the panel's own camera pulls back from 2.05× and drifts from (130, 120) to (0, 25) px while the tiles pop. Not a screen recording: the page is one object among others, shown whole and small; the story is the links, so never push into the page here.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `sources` | list (`image` or `glyph`: page, card, code, wave, speaker) | — | merge 4, connect 5 | — | — | neutral glyphs |
  | `mark` | image | — | 1 | — | — | a neutral accent ring (placeholder, not a logo) |
  | `hub` | brick (a page painter) | — | 1 (connect) | — | — | the sample page |
  | `caption` | text | primary, claim | 1 (merge) | 5 words / 28 chars | 12 chars | `claim` |

- **Length**: `merge` 11.2 beats (5.6 s at 120 BPM), `connect` 7.3 beats (3.7 s); range 6–12.
- **Steps and events**: merge: sources pop 0.02–0.24 (overshoot, staggered), paths draw 0.04–0.38, the sink appears 0.16–0.26, packets run 0.10–0.74; the sources slide down their paths and shrink (44 → 15 → 0 design units, cubic in-out) 0.34–0.74 (T1); the sink swells 12 % and a ripple leaves it 0.70–0.86 (T2 peak); paths erase 0.78–0.90 while the group pans; the caption darkens word by word (character by character in Chinese) 0.84–0.95. connect: tiles pop together at 12 frames (8 % overshoot), tubes grow 22–31 (T2 peak as they reach the panel), pulses flow from 31 to the end; the panel glow breathes.
- **Needs**: motion `path-flow` (its geometry and drawing helpers); roles `ground`, `panel`, `paper`/`onPaper` (connect tiles), `ink`, `dim`, `line`, `accent`; type `text`.
- **Sound**: merge: `turn` as the sources start to slide (beat 4.8), `land` on the swallow (beat 8.2). connect: `accent` on the tile pop, `land` as the tubes connect; the flow rides the bed.
- **Styles**: merge for light, editorial looks; connect for dark looks with glow. **Source**: adapted from video-shotcraft `demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx` (card `references/shots/ui-entrance/bezier-source-converge-merge.md`) and `demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx` (card `references/shots/ui-entrance/integration-hub-map.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (the caption darkens by character). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, `sample/poster-connect-en.jpg` (and zh).
- **Differs from upstream**: the hub shot opens with a page flipping 180° onto the hub; that flip is the hand-off `device-flip` with the turn-over variant (batch 1), so `connect` starts at upstream frame 40, after it; the background neon rectangles are left to the look; tubes are one accent. Compare: merge pass (sources 5.7 px, sink 0 px, events ±0); connect (dry run, frames 40–150) panel 13 px, events ±1.
- **Pitfalls**: In connect, pop all sources on one frame, then draw all tubes on the next beat; connecting one by one reads as separate negotiations. Keep the accent for the packets and ripples; colouring the sources takes the subject away from the hub. Put an open-shaped hub mark on an opaque disc, or the line ends show through its gap. If a caption follows narration, time it to the spoken word, not to the end of the merge.
- **Sample**: `poster.jpg`, an English still 480 px wide.

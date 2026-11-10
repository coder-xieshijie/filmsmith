---
id: row-band
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### row-band

- **Purpose**: A full-width band of light hops row to row on a still capture; each row brings its own value, line and note into the margin, level with it, and is ringed.
- **Intent**: The viewer reads a real table one row at a time, each row paired with the sentence it proves.
- **Content**: A capture with 2–4 row regions (band and box each); per row a value (≤ 10 chars / 5 字), a line (≤ 18 / 14 字), a note (≤ 40 / 22 字).
- **Fits**: `demo`, `proof`; A table, a list or a paragraph whose rows each carry a point (benchmark rows, plan tiers, guide steps). **Not for**: More than four rows (cut to the ones that matter); rows too close to tell apart at rest.
- **Layout and camera**: the capture at rest (or a fixed view) on the locked device; the band is a full-width hole in the veil; the margin’s block rides level with the lit row.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `rows` | list | – | 2–4 | – | – | 2 items |
  | `rows[].value` | text | primary | 1 | 2 words, 10 chars | 5 chars | – |
  | `rows[].line` | text | primary | 1 | 4 words, 18 chars | 14 chars | – |
  | `rows[].note` | text | glance (optional) | 1 | 6 words, 40 chars | 22 chars | – |
  | `screen` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 4–20 beats (2–10 s at 120 BPM); `step` beats a row (4, the template’s; 3 as film-v2), the last row’s reading; three rows plan 13 beats in English at step 4.
- **Steps and events**: per row: the band comes on (or hops in one beat, spotlight-band) and the block rides with it (level-rail); a beat later the value; at step 4 a beat later the line and the note and a beat after that the ring and the tick; at step 3 the line 0.25 beat after the value, the note and the ring 0.5 beat after it. `quick: true`: the first row’s band and value land together on beat 0 (after a move that lands on the boundary), every row a beat sooner.
- **Needs**: motions spotlight-band, level-rail; props device-shell, margin-notes, region-light; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `land` on the first row, `accent` on each hop’s landing and each ring.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (TYPES.band), film.js (light, blockY), moves.js (spotlight-band)`), split from the handset style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). film-v2 hops every three beats with the tight group and lights its first row as its scroll lands: `step: 3, quick: true` reproduce it; the default stays the template’s four beats.
- **Pitfalls**: Each row’s copy leaves as the next hop starts; do not keep two rows’ words on screen.

---
id: screen-push
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### screen-push

- **Purpose**: The screen pushes to the region in play under the zoom cap while the device holds still; the light, the value, the line and the ring land in order; or a registered cut on the beat; or the claim landing on the bar line in a pause.
- **Intent**: The viewer is taken to the exact part of the real screen that proves the line beside it.
- **Content**: A capture with a named region (box, optional band); a value (≤ 10 chars / 5 字), a line (≤ 18 / 14 字), a note (≤ 40 / 22 字); for the claim a lead line.
- **Fits**: `demo`, `proof`, `climax`; One region of a real capture that carries the point: a picker, a number, a row, a price. **Not for**: Text too small to read even at the cap (set it in the margin instead); two regions at once.
- **Layout and camera**: the laptop locked on the left, the screen’s view moves; the margin’s block level with the region (62 px above its centre, clamped).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `value` | text | primary (claim) | 1 | 2 words, 10 chars | 5 chars | 42% / 42% |
  | `line` | text | primary | 1 | 4 words, 18 chars | 14 chars | faster builds / 构建更快 |
  | `note` | text | glance (optional) | 1 | 6 words, 40 chars | 22 chars | measured on the release build / 在正式版上实测 |
  | `lead` | text | primary (optional) | 1 | 4 words, 20 chars | 14 chars | every build measured / 每次构建都有实测 |
  | `screen` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 3–14 beats (1.5–7 s at 120 BPM); push: value on beat 1, group on beat 2, ring on beat 3, then the reading; cut: everything a beat sooner; claim: `pre` beats (4–7) to the landing plus the line’s reading and a 2-beat pause.
- **Steps and events**: push: beat 0 the old light fades (0.15 s) and the push starts (viewport-push, the move in 0.8 beat, log zoom); 0.4 beat the light comes on (0.2 s); beat 1 the value; beat 2 the line and the note; beat 3 the ring and the tick. cut: beat 0 a hard cut registered on the region, light kept, the value; beat 1 the group; beat 2 the ring. claim: the region lit at 0; beat 1 the lead (and the note); the ring at 5 when `pre` ≥ 6; the push in the beat before `pre`; the value on `pre`; the line a beat later; a pause. `release` (a view, e.g. `rest`): 0.2 beat after the ring the light goes out (0.15 s) and the screen pushes back to that view by a beat after the ring, the copy held.
- **Needs**: motions viewport-push, level-rail; props device-shell, margin-notes, region-light; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `land` on the landing (`accent` for a cut, `claim` with a duck for the claim); `accent` on the ring.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (TYPES.push, cut, claim), film.js (camera, light), moves.js (viewport-push)`), split from the template of the handset style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). film-v2 starts its pushes 16 frames before the beat and lands on it; the brick pushes from its own beat 0 and lands 0.8 beat in, so on the film’s boundaries the two land within 0.1 s and no `lead` is needed. film-v2 rings 1.4 beats after the value; the brick, 2 (the template’s).
- **Pitfalls**: Never push past 1.333 output px per source px; a soft capture reads as fake. A cut needs two captures of the same screen; never draw the missing state.

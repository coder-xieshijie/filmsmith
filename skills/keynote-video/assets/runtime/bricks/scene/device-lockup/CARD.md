---
id: device-lockup
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### device-lockup

- **Purpose**: Back to the product’s surface at rest (a pull back, a feed or the film’s one flip), the screen recedes under the veil, the margin gives the mark, the name, the line and the address; the region is ringed once more on the last downbeat.
- **Intent**: The film ends where the user meets the product, with the name and where to get it.
- **Content**: The product’s surface at rest; an optional mark image; the name (≤ 10 chars / 5 字), a line (≤ 18 / 14 字), the address (≤ 30 chars).
- **Fits**: `lockup`; The close of a film told on one device. **Not for**: A logo card on a gradient; an app-store badge or QR end card.
- **Layout and camera**: the device locked, the screen veiled whole behind the margin; the block at 420 px: an optional mark at −150, the name, the line, the address in mono (ink).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 2 words, 10 chars | 5 chars | Northwind / Northwind |
  | `line` | text | primary | 1 | 4 words, 18 chars | 14 chars | out today / 今天发布 |
  | `url` | text | glance | 1 | 1 words, 30 chars | 15 chars | northwind.dev/download / northwind.dev/download |
  | `mark` | image | – (optional) | 1 | – | – | – / – |
  | `screen` | image | – (optional) | 1 | – | – | – / – |

- **Length**: 8–24 beats (4–12 s at 120 BPM); the move, the name, the line, the address and its 3.2 s hold, then a bar for the second move.
- **Steps and events**: beat 0 the move (push 1 beat, feed 1, flip 2); on its landing the screen veils (0.3 s), the mark and the name; a beat later the line; a beat later the address; on the last bar’s downbeat the region opens in the veil and is ringed.
- **Needs**: motions viewport-push, feed-stack, device-flip; props device-shell, margin-notes, region-light; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `land` with a bell and a thud on the landing; the flip’s device cue; `end` on the second move.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (TYPES.lockup), film.js (light all)`), split from the handset style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the handset template (`assets/templates/handset/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the handset recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Hold the address at least 3 s. Use the flip here only if the film has not turned the device yet.

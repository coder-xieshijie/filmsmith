---
id: frame-punch
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### frame-punch

- **Purpose**: The frame in the gate punches to the full frame, holds a beat, and shrinks into its cell on the contact sheet laid underneath.
- **Intent**: One frame is the object the eye follows from the reel to the sheet.
- **Content**: The frame (full resolution), its cell on the sheet, the sheet’s rows.
- **Fits**: `turn`; The turn from a reel to the whole set at once. **Not for**: A frame below 1920 × 1080 source px (it would soften at full size).
- **Layout and camera**: the gate frame → the full frame → a 96 × 54 cell of the sheet.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `frame` | image | – (optional) | 1 | – | – | – / – |
  | `rows` | list | – | 1–10 | – | – | 8 items |
  | `rows[].name` | text | glance | 1 | 2 words, 12 chars | 6 chars | – |
  | `rows[].image` | image | – (optional) | 1 | – | – | – |

- **Length**: 3–4 beats (1.5–2 s at 120 BPM); 3 beats.
- **Steps and events**: beat 0 the punch in (gate-punch, ease out, 1 beat, log zoom); beat 1 held at full size; beat 2 the shrink into the cell (ease in-out, 1 beat) over the sheet laid underneath.
- **Needs**: motions gate-punch; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: an upward whoosh, an impact and a tick as the full frame lands.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (punch), film.js (punchIn, punchOut)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; language-free (the scenes under it carry the words).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.

---
id: pick-run
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### pick-run

- **Purpose**: The climax: the pencil loops one cell, the other rows step back, the cell punches to full and the picked film runs from that moment, then shrinks into the gate of the closing reel.
- **Intent**: One choice, made by hand, becomes the film itself running at full size.
- **Content**: The sheet, the cell, the picked film’s frames from that moment (≥ 2 s at its fps); a caption (≤ 4 words / 10 字).
- **Fits**: `climax`; Picking one of many and showing it running. **Not for**: A still image (nothing to run); several picks.
- **Layout and camera**: the sheet; the loop round the cell; the full frame; the gate.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 4 words, 24 chars | 10 chars | Pick a style. / 选一种风格。 |
  | `rows` | list | – | 1–10 | – | – | 8 items |
  | `rows[].name` | text | glance | 1 | 2 words, 12 chars | 6 chars | – |
  | `rows[].image` | image | – (optional) | 1 | – | – | – |

- **Length**: 5–16 beats (2.5–8 s at 120 BPM); loop 1, step back 0.5, pick 1, the run (frames ÷ fps), back 1; the sample plans 8 beats.
- **Steps and events**: beat 0 the loop (1 beat) with the caption; beat 1 the other rows step back (0.5); beat 2 the sheet-pick to full (1 beat); then the picked film runs frame by frame; then it shrinks into the gate (gate-punch, out).
- **Needs**: motions sheet-pick, pencil-loop; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: a scribble and a stamp on the loop, a riser into the pick, an impact, a chime and a tick as it lands (`claim`).
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (pick), film.js (sheetScene loop, pick, run, backIn)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Take the blue pencil when the picked cell is red, pink or magenta.

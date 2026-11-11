---
id: print-read
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### print-read

- **Purpose**: One to three pencil rings draw round cells of a print; the cells lift out and turn into code-drawn readings with labels and notes, are read one by one, and go back.
- **Intent**: Lift the proof out of the evidence without leaving it: the reading and its source are one object.
- **Content**: 1–3 cells (box and glyph in file px, a value ≤ 8 chars, a label ≤ 18 chars / 9 字, an optional note); a caption.
- **Fits**: `proof`, `claim`; The claim of a table or a report: the numbers that prove it. **Not for**: More than three cells; more than twice a film.
- **Layout and camera**: the print at rest; the cards stack beside the print’s right edge (140 px tall, 22 px apart) and widen to the longest note; the asset dims to 55 % behind them.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary | 1 | 6 words, 34 chars | 16 chars | First place in three rows. / 三行都是第一。 |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |
  | `cells` | list | – | 1–3 | – | – | 3 items |
  | `cells[].value` | text | primary | 1 | 1 words, 8 chars | 6 chars | – |
  | `cells[].label` | text | primary | 1 | 3 words, 18 chars | 9 chars | – |
  | `cells[].note` | text | glance (optional) | 1 | 5 words, 28 chars | 12 chars | – |

- **Length**: 8–24 beats (4–12 s at 120 BPM); the rings, the lift, each card read, the caption, then 1.5 beats to put them back; three cells plan 15 beats in English.
- **Steps and events**: rings from beat 0, half a beat apart, each drawing in 1.5 beats; the lift-out from the next whole beat (2 beats); each label lands as its card widens; while a card is read the others step back 50 %; its note a beat in; the caption after the cards; 1.5 beats before the end the readings go back (1 beat) and the rings come off (0.5).
- **Needs**: motions lift-out; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: a pencil rim per ring, an upward whoosh and a tick on the lift, `land`, ticks between cards, a falling whoosh on the way back.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (read), moves.js (lift-out), film.js (readLayer)`), split from the template of the exhibit style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Glyph boxes must sit on the printed value: the swap redraws it in place.

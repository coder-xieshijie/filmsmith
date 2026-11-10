---
id: length-sheet
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### length-sheet

- **Purpose**: The contact sheet: every film as a strip as long as the film; the longer strips pull out one after another, the measured lengths are set, two captions under the sheet.
- **Intent**: The proof is the lengths themselves, measured, on one baseline.
- **Content**: 1–10 rows (name, duration, row strip); 1–2 captions (≤ 6 words / 16 字).
- **Fits**: `proof`; A claim about lengths, versions or measured renders. **Not for**: A set whose lengths are all equal (nothing to pull).
- **Layout and camera**: the sheet centred (rows 84 px apart), captions at y 984 under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list | – | 1–2 | – | – | 2 items |
  | `lines[].text` | text | primary | 1 | 6 words, 34 chars | 16 chars | – |
  | `rows` | list | – | 1–10 | – | – | 8 items |
  | `rows[].name` | text | glance | 1 | 2 words, 12 chars | 6 chars | – |
  | `rows[].image` | image | – (optional) | 1 | – | – | – |

- **Length**: 4–14 beats (2–7 s at 120 BPM); the pull-out, the first caption’s reading, the second with the lengths; the sample plans 8 beats in English, 10 in Chinese.
- **Steps and events**: beat 0 the sheet (every strip at the shortest length); beat 1 the first caption; from beat 2 the longer strips pull out (0.1 beat apart, 0.75 each); the second caption on the next whole beat after both, the lengths a quarter beat later (0.1 beat apart).
- **Needs**: motions row-pull; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `land` on the sheet, a stamp and a tick on the second caption.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (sheet), film.js (sheetState)`), split from the strip style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). film-v1 sets its first caption on beat 1 and its second on beat 5, with the lengths a quarter beat after; the brick computes them from the reading and the pull-out (the template’s), and a scene given more beats than it needs holds the pulled-out strips up to a beat longer before they are measured, which lands film-v1’s beats exactly at 8 beats. Captions sit at y 984 under the sheet (the template’s; film-v1 kept 950).
- **Pitfalls**: none known.

---
id: desk-lockup
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### desk-lockup

- **Purpose**: The camera rises over the whole desk; the name settles under the row, its line, the address types; a rule under the name and the pencil’s route through every ringed region; the last ring round the address.
- **Intent**: End on the whole body of evidence at once, with the name under it.
- **Content**: The desk’s prints; the name (≤ 16 chars / 8 字), a line (≤ 7 words / 18 字), the address; the ringed regions in order; an optional mark.
- **Fits**: `lockup`; The close of an exhibit film. **Not for**: A film without real prints; an end card on a gradient.
- **Layout and camera**: the overview: the row fills ≤ 1728 px; the title block under it at screen sizes name 140, line 44, address 40 (mono); prints veiled to 50 %, captions to 60 %.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary (claim) | 1 | 3 words, 16 chars | 8 chars | Northwind / Northwind |
  | `line` | text | primary (optional) | 1 | 7 words, 40 chars | 18 chars | Every build, measured. / 每次构建都有实测。 |
  | `url` | text | primary | 1 | 1 words, 34 chars | 34 chars | northwind.dev/download / northwind.dev/download |
  | `mark` | image | – (optional) | 1 | – | – | – / – |
  | `prints` | list | – | 1–6 | – | – | 3 items |
  | `prints[].image` | image | – (optional) | 1 | – | – | – |
  | `prints[].source` | text | glance | 1 | 8 words, 56 chars | 28 chars | – |

- **Length**: 10–24 beats (5–12 s at 120 BPM); the rise, the name, the line, the address typed and held, the rule and the route, a bar for the last ring; the sample plans 21 beats in English.
- **Steps and events**: beat 0 the camera rises (2 beats, cubic in-out); the name settles 1.5 → 2 beats; the line from beat 3; the address types at 24 characters a second; the rule (1 beat) then the route (2 beats); a bar before the end the last ring closes round the address in 0.75 beat.
- **Needs**: motions ring-route; props print-mount, claim-chip; roles ground, panel, line, ink, dim, accent; type display, text, mono.
- **Sound**: `lockup` on the landing (an impact and a chime), typing keys under the address, pencil rims on the rule, the route and the last ring.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/choreo.js (lockup), film.js (lockup), layout.js (overview)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Hold the address at least 3 s.

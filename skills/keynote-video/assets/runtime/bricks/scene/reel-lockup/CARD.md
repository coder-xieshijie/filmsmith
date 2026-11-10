---
id: reel-lockup
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### reel-lockup

- **Purpose**: A source frame is pulled into the gate with a line; the strip runs out of the gate; the name settles on the light box, the address types; the pencil underlines it on the last bar.
- **Intent**: The reel leaves; what is left on the light box is the name and where to get it.
- **Content**: A source frame (the repository or download page), a line (≤ 6 words / 16 字), the name, the address.
- **Fits**: `lockup`; The close of a strip film. **Not for**: A logo card; a QR end card.
- **Layout and camera**: the gate with the source frame; then the bare light box: the name at y 560 (140 px), the address at y 650 (DM Mono 44), the underline 24 px under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `source` | image | – (optional) | 1 | – | – | – / – |
  | `line` | text | primary (optional) | 1 | 6 words, 34 chars | 16 chars | Runs in any coding agent. / 任何编码 agent 里都能跑。 |
  | `name` | text | primary (claim) | 1 | 2 words, 14 chars | 6 chars | Northwind / Northwind |
  | `url` | text | primary | 1 | 1 words, 40 chars | 40 chars | github.com/northwind/reel / github.com/northwind/reel |

- **Length**: 8–20 beats (4–10 s at 120 BPM); the source and its line, the run-out (1.5 beats), the name 2 beats after it, the address a beat later typed at 72 characters a second and held 3 s; the sample plans 14 beats.
- **Steps and events**: `lead` 0.25 beat: the source frame pulled in under the scene before; the line from its landing; the run-out on the next whole beat after the line is read; the corner marks fade in half a beat; the name settles (0.4 beat); the address types; the underline on the last bar (0.75 beat).
- **Needs**: motions strip-advance, pencil-loop; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: `lockup` (an impact and a chime) on the name, typing keys under the address, a pencil stroke for the underline.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (lockup), film.js (reelS run-out, lockupText)`), split from the strip style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Hold the address at least 3 s.

---
id: gate-frames
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### gate-frames

- **Purpose**: One real frame of each film through the gate, a claw pull-down a beat, its name under the gate while it is registered.
- **Intent**: A beat per film: the set is felt as a rhythm, each named.
- **Content**: 1–12 frames (16:9) each with a name (≤ 2 words / 6 字).
- **Fits**: `demo`, `proof`; Showing a set of films, styles or renders one after another. **Not for**: One film; frames that need reading time.
- **Layout and camera**: the gate at the centre, the name centred under it at y 950 (59 px).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `frames` | list | – | 1–12 | – | – | 5 items |
  | `frames[].image` | image | – (optional) | 1 | – | – | – |
  | `frames[].name` | text | primary | 1 | 2 words, 14 chars | 6 chars | – |

- **Length**: 2–16 beats (1–8 s at 120 BPM); a beat a frame plus the lead; ten frames plan 11 beats.
- **Steps and events**: `lead` 0.25 beat: the first pull-down under the scene before; a frame registers every beat; its name from its landing to the next pull-down; the last name holds to the end; `before` and `after` are the cells either side on the same reel.
- **Needs**: motions strip-advance; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: a claw click on every pull-down, a thud on the first, the middle and the last landing.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (frames), film.js (reelS, captions)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: none known.

---
id: reel-titles
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### reel-titles

- **Purpose**: Intertitles on the strip, each pulled into the gate by one claw pull-down and held while read; the first scene runs the strip in and brakes on the first title; a line may light the optical track.
- **Intent**: Words arrive as frames of the film itself, one pull-down at a time.
- **Content**: 1–4 lines (≤ 3 words / 8 字 each); optionally a line that lights the track.
- **Fits**: `hook`, `claim`; A hook or a claim in two to four short lines. **Not for**: Long sentences; more than four lines in a row.
- **Layout and camera**: the strip across the light box, a title frame registered in the gate at the centre (832 × 468), its neighbours veiled 55 %; the corner marks fixed.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list | – | 1–4 | – | – | 3 items |
  | `lines[].text` | text | primary | 1 | 3 words, 16 chars | 8 chars | – |

- **Length**: 2–16 beats (1–8 s at 120 BPM); each line’s slot is its reading plus the pull-down on a quarter-beat grid, at least a beat; the run-in adds 2 beats; the sample plans 5 beats in English, 7 in Chinese.
- **Steps and events**: `lead` 0.25 beat: the first pull-down (claw, a quarter beat) under the scene before, the first title registers on beat 0.25; each next line a pull-down before its landing; with `run` the strip runs in at speed and brakes over 2 beats onto the first title (no lead); a `track` line lights its optical track 0.4 → 1.15 beat after landing, swept left to right; `before` is the cell the reel shows before the first line, `after` the cells that follow on the same reel (the next scene’s frames), so the strip runs on past the gate instead of ending.
- **Needs**: motions strip-advance; props film-strip, contact-sheet; roles ground, panel, ink, dim, accent, base; type display, text, mono.
- **Sound**: a claw click on every pull-down, `land` on each landing, `hook` (a stamp and a pop) on the hook’s last line, a swell as the track lights.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/choreo.js (titles), film.js (reelS, the track)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the strip template (`assets/templates/strip/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the strip recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state). film-v1 lands its claims half a beat into their scene and spaces them by hand (6.5, 8.6); the brick lands its first line on the boundary and spaces the lines by their reading (the template’s).
- **Pitfalls**: Declare the lead: the first pull-down belongs to the scene before.

---
id: gate-reel
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### gate-reel

- **Tells**: run in → titled → shown frame by frame → punched to the sheet → measured → picked and run → run out.
- **Intent**: Tell the launch as one reel: words and frames through one gate, the set on one sheet, one pick.
- **Fits / does not fit**: Launches of something that makes or holds films: a video skill, a render tool, a model release with sample videos. 16–40 s. Not: Products without frames; data stories.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 2.5–4 | 1 | reel-titles | hook | intro |
  | `claim` | 2–3.5 | 1 | reel-titles | – | build |
  | `demo` | 3–7 | 1 | gate-frames | – | build |
  | `turn` | 1.5–2 | 1 | frame-punch | – | break |
  | `proof` | 3.5–5 | 1 | length-sheet | – | build |
  | `climax` | 3.5–5 | 1 | pick-run | claim | drop |
  | `lockup` | 6–9 | 1 | reel-lockup | lockup | outro |

- **Length**: 16–40 s; peaks 2–3; sound bed `thread`.
- **Climax**: the pick at 55–80 % of the film; peaks: the hook, the pick, the name.
- **Example films**: the strip sample film (the source film, 28 s: run-in titles, claims, ten frames, punch, sheet, pick, lock-up); a recomposed segment in the strip recipe.
- **Source**: own (`assets/templates/strip/content.js (scene order), timing.rules.js`), split from the template of the strip style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.

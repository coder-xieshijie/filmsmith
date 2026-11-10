---
id: surface-tour
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### surface-tour

- **Tells**: woken → pushed to the point → changed to the evidence → read row by row → claimed → back to the product.
- **Intent**: A launch told only through real screens: the product, then the official evidence, then the product again.
- **Fits / does not fit**: Launches whose claim can be seen on the product’s own surface: a model in a picker, a feature panel, a price, an official chart. 12–60 s. Not: Mechanisms, comparisons of many artefacts, products without a screen.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 2.5–4 | 1 | screen-wake | hook | intro |
  | `demo` | 2–3.5 | 1–3 | screen-push | – | build |
  | `turn` | 2–3 | 1 | screen-change | – | build |
  | `proof` | 4–8 | 1–2 | row-band, screen-change | – | drop |
  | `climax` | 3–4.5 | 1 | screen-push | claim | drop |
  | `lockup` | 5–8 | 1 | device-lockup | lockup | outro |

- **Length**: 12–60 s; peaks 2–3; sound bed `data`.
- **Climax**: the claim at 60–85 % of the film, landing on a bar line with a pause; peaks: the wake (hook), the claim, the lock-up.
- **Example films**: the handset sample film (the handset source film, 32 s: wake, push, pan, cut, push, feed, scroll + band, scroll, claim, flip, lock-up); a recomposed segment in the handset recipe.
- **Source**: own (`assets/templates/handset/content.js (scene order), timing.rules.js`), split from the handset style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.

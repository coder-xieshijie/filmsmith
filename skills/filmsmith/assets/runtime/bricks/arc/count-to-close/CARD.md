---
id: count-to-close
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### count-to-close

- **Tells**: counted → sorted → read over time → reduced to the few numbers that matter.
- **Intent**: A counted set becomes an answer chapter by chapter without ever changing its items.
- **Fits / does not fit**: Data stories told by counting: registries, surveys, archives, the proof part of a release. Not: Films without a countable set; product demos.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 3–4.5 | 1 | unit-count | hook | intro |
  | `demo` | 4–7 | 1–3 | unit-bands, unit-split, unit-axis | – | build |
  | `turn` | 2–3.5 | 1 | unit-periods | – | drop |
  | `proof` | 2.5–4 | 1 | unit-periods | – | drop | optional
  | `rest` | 3–5 | 1 | stream-brake | – | break | optional
  | `lockup` | 5–8 | 1 | unit-close | lockup | outro |

- **Length**: 16–40 s; peaks 2–3; sound bed `data`.
- **Example films**: the tally template's example (the tally demo film); a recomposed segment in the tally recipe.
- **Source**: own (`assets/templates/tally/content.js, timing.rules.js`), split from the template of the tally style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.

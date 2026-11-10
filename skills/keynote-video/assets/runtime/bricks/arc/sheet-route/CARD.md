---
id: sheet-route
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-route

- **Tells**: one drawing drafted sheet by sheet, a person's stamp issuing it and a machine's check proving it
- **Intent**: Argue like a drawing set: one sheet per idea, each a different kind of drawing, signed by a person, checked by machine, approved as a whole.
- **Fits / does not fit**: Systems with a plan a person signs and checks a machine runs: rollouts, backups, migrations, pipelines. Not: Single-feature films; stories without structure; films under 25 s (use an excerpt of 2–3 sheets).
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 4–6 | 1 | review-callouts | hook | intro |
  | `claim` | 4–6 | 1 | general-arrangement | – | build |
  | `demo` | 4–7 | 0–2 | lap-loop, exploded-chain, parts-list | – | drop |
  | `turn` | 6–8 | 1 | detail-confirm | – | build |
  | `proof` | 6–8 | 1–2 | section-cut, inspection-record | – | drop |
  | `climax` | 4–6 | 1 | sheet-overview | claim | drop |
  | `lockup` | 4–7 | 1 | release-block | – | outro |

- **Length**: 30–60 s; peaks 2–3; sound bed `drafting-bed`.
- **Climax**: the final overview: the route through every sheet and the approval stamp (75–85 % of the film).
- **Example films**: the blueprint template's example (the blueprint demo film); a recomposed segment in the blueprint recipe.
- **Source**: own (`assets/templates/blueprint/content.js; the blueprint demo film), split from the blueprint style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Two consecutive sheets must be different drawing types; Chinese sheets read longer, so a 43 s English film runs about 50 s in Chinese.

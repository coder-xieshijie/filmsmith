---
id: claim-steps
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### claim-steps

- **Tells**: a claim argued as a numbered poster series, the person in the accent at each decision
- **Intent**: Argue like a poster series: state the problem, make the claim, prove it one page at a time, and end on the promise and the URL.
- **Fits / does not fit**: Developer tools and workflows whose pitch is a claim plus an ordered process with a person deciding at the key points. Not: Mood or brand films without steps; a single feature (too long); stories told by data volume.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 5–9 | 1 | problem-table | hook | build |
  | `claim` | 4–6 | 1 | input-output | claim | build |
  | `turn` | 1.5–3 | 1–3 | numeral-chapter | – | drop |
  | `demo` | 3–7 | 1–4 | option-pick, doc-freeze, step-matrix, human-loop | – | drop |
  | `proof` | 3–7 | 0–2 | verify-band, doc-freeze | – | drop |
  | `rest` | 3–6 | 1 (optional) | install-block | – | break |
  | `climax` | 2.5–4 | 1 | poster-tagline | claim | drop |
  | `lockup` | 4–6 | 1 | poster-end | – | outro |

- **Length**: 35–60 s; peaks 2–3; sound bed `poster-bed`.
- **Climax**: the tagline at 225 px after the quiet install bar (the bed returns through intro and build bars).
- **Example films**: the plakat template's example (the plakat demo film); a recomposed segment in the plakat recipe.
- **Source**: own (`assets/templates/plakat/content.js, TEMPLATE.md`), split from the template of the plakat style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Chinese pages read longer (6 characters a second plus 0.5 s): a 45 s English cut runs about 55 s in Chinese with the same pages.

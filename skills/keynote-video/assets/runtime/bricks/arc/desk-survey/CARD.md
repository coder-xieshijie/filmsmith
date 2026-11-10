---
id: desk-survey
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### desk-survey

- **Tells**: opened → read → travelled → matched → measured → risen over the whole desk.
- **Intent**: A launch argued like a case file: each claim pointed at in its own evidence, the gap measured, the route retraced.
- **Fits / does not fit**: Model and product launches whose argument rests on official tables and charts. 24–48 s. Not: Mechanism explainers; stories without published evidence.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 3–4.5 | 1 | print-open | hook | intro |
  | `proof` | 5.5–8 | 1 | print-read | – | build |
  | `demo` | 3–4.5 | 1–2 | print-travel | – | build |
  | `turn` | 3.5–5 | 1 | value-match | – | drop |
  | `climax` | 3–4.5 | 1 | gap-measure | claim | drop |
  | `lockup` | 8–12 | 1 | desk-lockup | lockup | outro |

- **Length**: 24–48 s; peaks 2–3; sound bed `swiss`.
- **Climax**: the measured gap at 60–80 % of the film, in a pause; peaks: the opening, the measure, the lock-up.
- **Example films**: the exhibit sample film (the exhibit source film, 32 s: open, read, travel, match, measure, lock-up); a recomposed segment in the exhibit recipe.
- **Source**: own (`assets/templates/exhibit/content.js (scene order), timing.rules.js`), split from the exhibit style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.

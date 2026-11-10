---
id: ask-to-answer
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ask-to-answer

- **Tells**: asked → tried (none passes) → why → asked again → re-run locks → answered on the drop → explained → named.
- **Intent**: A question the viewer can feel being answered: asked, tried, failed, asked again, answered on the drop.
- **Fits / does not fit**: a release or benchmark with a measured answer, 12–40 s. Not: stories without candidates, step-by-step mechanisms.
- **Slots**:

  | Role | Seconds | Repeats | Scenes | Peak | Bed |
  |---|---|---|---|---|---|
  | hook | 1.5–3 | 1 | anchor-ask (`first`) | hook | build |
  | problem | 1.5–3 | optional | anchor-ask | – | build |
  | demo | 2–4.5 | 1 | hop-search (`slot`, none passes) | – | build |
  | proof | 3–4 | optional | figure-rows (after the whip) | – | break |
  | turn | 1.5–3 | 1–2 | anchor-ask (`invert`) | – | build |
  | demo | 2–3 | 1 | hop-search (`known`, `into: 'reveal'`) | – | build |
  | climax | 4 | 1 | answer-whiteout | reveal (60–85 %) | drop |
  | proof | 3–4 | optional | figure-rows (through the counter) | – | break |
  | lockup | 4.5–6 | 1 | name-flip | lockup | outro |

- **Climax** at 60–85 % (the example 63 %); peaks: the hook, the reveal, the lock-up. Shortest cut: ask → ask → search → reveal (`rest`), 12 s.
- **Example films**: the pulse template's example (32 s at 120 BPM): ask 0–2.5, ask 2.5–5, search 5–9.5, data 9.5–13.5, ask 13.5–16, ask 16–17.5, search 17.5–20, reveal 20–24, data 24–27.5, name 27.5–32.
- **Source**: own (`assets/templates/pulse/content.js`, `timing.rules.js`). **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The run into the reveal must be the shortest stretch; put the long figures after it.

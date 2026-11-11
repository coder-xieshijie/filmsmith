---
id: evidence-file
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### evidence-file

- **Tells**: here is what they published → and this, on the same page → and this, on another page → the same value in two sources → computed from them → the result, struck → every claim, listed → the name.
- **Intent**: Build trust by citation: every sentence the film says is shown where it was printed, and the one new number is computed in the open.
- **Fits / does not fit**: a release or comparison whose claims are published, 15–45 s. Not: stories without evidence, mechanisms.
- **Slots**:

  | Role | Seconds | Repeats | Scenes | Peak | Bed |
  |---|---|---|---|---|---|
  | hook | 2–3 | 1 | exhibit-strike (`open`) | hook | build |
  | problem | 2–3 | optional, 1–3 | claim-shift, exhibit-strike | – | build |
  | demo | 2.5–3.5 | 1–3 | exhibit-strike (`deal`, `change`, `matched` after a page change) | – | build |
  | proof | 2–3 | optional, 1–2 | claim-shift | – | build |
  | turn | 3–4.5 | optional | worksheet-carry | – | build |
  | climax | 3.5–4.5 | 1 | result-strike | claim (60–80 %) | drop |
  | rest | 3–4 | optional | exhibit-ledger | – | outro |
  | lockup | 4.5–7 | 1 | name-strike | lockup | outro |

- **Page changes** between exhibits (seams): `sheet-deal` (default), `page-turn`, runtime `sheet-shuffle`, `louvre` (slats along the struck rows), `match-cut` (the same value printed in both), `split-open` (into the worksheet).
- **Climax** at 60–80 % (the example 67 %, the result's second phrase); peaks: the hook, the result, the lock-up. Shortest cut: exhibit → exhibit → result → name, 15 s.
- **Example films**: the dossier template's example (36 s at 120 BPM): exhibit 0–2.5, claim 2.5–4.5, claim 4.5–7, exhibit 7–10 (shuffle), exhibit 10–13 (louvre), exhibit 13–15.5 (match cut), claim 15.5–18, worksheet 18–22, result 22–26, ledger 26–29.5, lockup 29.5–36.
- **Source**: own (the dossier source film). **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: One carry and one computed result a film; everything else is struck where it is printed.

---
id: seam-edit
category: arc
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### seam-edit

- **Tells**: typed → opened → picked → paired → run and measured → one line changed → closed.
- **Intent**: Tell the launch as edits: every change is a move of one seam between what is written and what it makes.
- **Fits / does not fit**: Launches of a product whose input maps line by line to its output: a generator, a compiler, a config-driven renderer, a CLI with a report. 16–36 s. Not: Products without a visible output; model launches argued from tables.
- **Slots**:

  | Role | Seconds | Repeats | Scenes that fill it | Peak | Bed kind |
  |---|---|---|---|---|---|
  | `hook` | 3–4.5 | 1 | request-open | hook | intro |
  | `demo` | 3–5 | 1 | pick-list | – | build |
  | `proof` | 2.5–4 | 1 | file-pair | – | build |
  | `proof` | 3–4.5 | 1 | render-branch | – | build |
  | `climax` | 5–8 | 1 | diff-climax | claim | drop |
  | `lockup` | 6–10 | 1 | seam-lockup | lockup | outro |

- **Length**: 16–36 s; peaks 2–3; sound bed `terminal`.
- **Climax**: the diff’s landing at 60–85 % of the film, on a bar line; peaks: the caret standing up, the slider, the name.
- **Example films**: the split sample film (the source film, 28 s: request, pick, file, render, diff, lock-up); a recomposed segment in the split recipe.
- **Source**: own (`assets/templates/split/content.js (scene order), timing.rules.js`), split from the split style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.

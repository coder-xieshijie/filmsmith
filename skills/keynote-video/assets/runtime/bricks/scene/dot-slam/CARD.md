---
id: dot-slam
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### dot-slam

- **Purpose**: State the problem as a fact, slammed a word a beat, the dot its full stop.
- **Intent**: A statement lands like a stamp, and the full stop makes it final.
- **Content**: 1–2 lines of 1–3 words (≤ 10 chars each), an optional label (≤ 24 chars).
- **Fits**: `hook`, `problem`, `claim`. **Not for**: more than six words; sentences that need punctuation inside.
- **Layout and camera**: left at 150, baselines 640 (one line) or 520 · 830 (two), 330 fitted to 220; the label at 190 (mono 28); ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of lists of text | word | 1–2 lines × 1–3 | 1 word, 10 chars | 4 chars | 4096 / commits · 4096 / 次提交 |
  | `label` | text | primary (optional) | 1 | 4 words, 24 chars | 10 chars | since Friday / 从周五起 |

  Options: `stops` (`one` | `each`), `first`, `ground`.
- **Length**: 2–8 beats: a word a beat, the label 0.75 beat after the last word, held until read.
- **Steps and events**: each word slams on its beat (T0) with the misregistration ghost; the stop lands with the last word (squash); with `each` a stop buds after every word and they merge into one 0.85 beat after the last.
- **Needs**: motions glyph-slam; props ink-dot; roles ground, ink, accent, mis; type display, mono.
- **Sound**: `land` on each word, `accent` on each budding stop.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes slam, drawSplit; plan.js slam`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the merge draws the arc each stop travels; the template's gooey neck between merging stops is not drawn.
- **Pitfalls**: The words leave up through their mask 0.2 s before the end: do not cut the scene shorter than the last read.

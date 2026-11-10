---
id: you-ends
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### you-ends

- **Purpose**: A pipeline with you at both ends: the title decodes, nodes land every half beat (the first and last are you, outlined in ink), links light, a bracket names what the machine runs between, and a dot loops back from the last machine step to the first.
- **Intent**: Put the person at the start and the end of the machine's work, visibly.
- **Content**: A title in two halves (≤ 5 words), a sub (≤ 6 words), 3–6 nodes (tag, name, sub; the ends marked you), a bracket label, a loop label.
- **Fits**: `claim`, `proof`; The film's point that a person sets the work and signs it off, the machine does the middle. **Not for**: Pipelines without a person; more than six steps; a loop that is not a retry.
- **Layout and camera**: title 108 px centred at y 150 (two halves decoded), sub 25 px mono at y 286; nodes 160 tall at y 470, (1690 − 50 (n − 1)) / n wide from x 115, 50 px apart: tag 25 px tracked 0.2 em, name 40 px 700, sub 25 px; links 3 px at y 550 with 5 px dots; bracket under the machine steps at y 652–682 with its label at 668; dashed loop from the last machine step to the first, bowing to y 840, label at y 850.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | list of text | primary | 2–2 | 3 words, 14 chars | 5 chars | ["You at ","both ends."] / ["两头","都是你。"] |
  | `sub` | text | glance (optional) | 1 | 6 words, 36 chars | 12 chars | the machine runs the middle / 中间交给机器 |
  | `nodes.tag` | list of text | glance | 3–6 | 1 words, 8 chars | 3 chars | ASK / 提问 |
  | `nodes.name` | list of text | primary | 3–6 | 1 words, 10 chars | 5 chars | You / 你 |
  | `nodes.sub` | list of text | glance | 3–6 | 3 words, 16 chars | 7 chars | set the policy / 定下策略 |
  | `nodes.you` | list of flag | – | 3–6 | – | – | true / true |
  | `bracket` | text | glance (optional) | 1 | 5 words, 28 chars | 12 chars | grainlock runs these / 这段由 grainlock 跑 |
  | `loop` | text | glance (optional) | 1 | 6 words, 32 chars | 12 chars | a gap goes back to lock / 发现缺口就回到锁定 |

- **Length**: 6–16 beats (3–8 s at 120 BPM); the names read, then the bracket, the loop and one lap of its dot (two beats); the sample plans 10 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: title halves at 0.17 and 0.8 beat; sub at 1.5 beats; nodes every half beat as the title is read (you: back.out 2); links a beat after the first node; bracket as the names are read; loop half a beat later; the dot laps every two beats.
- **Needs**: motions glyph-decode; props terminal-hud; roles ground, panel, ink, muted, dim, line, hi; type display, text, mono.
- **Sound**: a glitch for the title, a stamp for each you, a tick for each machine step, a whoosh with the loop.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.ends; events.js TIMING.ends`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Plakat's human-loop says the same in print; do not use both in one film.

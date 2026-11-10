---
id: qa-pick
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### qa-pick

- **Purpose**: A chapter page of at most two questions: a window rises, each question types, its options pop in, and one is picked on a beat, filling ink and pushing in while the others step back.
- **Intent**: Show that the person decides: the tool asks, the person picks, on the beat.
- **Content**: The header (title halves, note), the window's title and label, 1–2 questions (id, ≤ 5 words, 2–3 options of ≤ 2 words, the pick).
- **Fits**: `demo`, `turn`; A tool that asks before it acts: the questions it asks and what the person chose. **Not for**: More than two questions (split the page); options longer than two words; a tool that never asks.
- **Layout and camera**: header at (110, 92); window 1700 × 270 (two questions 470) at (110, 262); questions at 40 px from (150, 358), 200 px apart, the id in dim mono; options 40 px in 2 px line boxes from x 234, 70 px under their question, 20 px apart.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `head` | group | – | 1 | – | – | {"title":["SET","THE POLICY"],"note":"//… / {"title":["设定","策略"],"note":"// 先读锁文件"} |
  | `window` | list of code | glance | 1–2 | 24 chars | 24 chars | ["grainlock init","billing-api"] / ["grainlock init","billing-api"] |
  | `questions.id` | list of code | glance | 1–2 | 3 chars | 3 chars | Q1 / Q1 |
  | `questions.q` | list of text | primary | 1–2 | 5 words, 34 chars | 14 chars | Maintainer changes? / 维护者变了怎么办？ |
  | `questions.options` | list of list | – | 1–2 | – | – | ["Block","Flag"] / ["拦下","标记"] |
  | `questions.pick` | list of number | – | 1–2 | – | – | 0 / 0 |

- **Length**: 6–20 beats (3–10 s at 120 BPM); each question read as it types, its options read, the pick half a beat; Chinese questions type slower (reading pace); the sample plans 9 beats in English, 15 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: window 0.45 s from 30 px below; first question on the half beat after 0.35 beat, at ≤ 48 cps; options every 0.25 beat (back.out 2, from 0.92); pick on the beat once read (1.15×, back.out 1.6 over half a beat), the others to 45 %; the next question once the options are read.
- **Needs**: motions none; props terminal-hud; roles ground, panel, ink, muted, dim, line; type display, text, mono.
- **Sound**: keys under each question, a tick per option, a pop on the pick.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.qa; events.js TIMING.qa`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: The pick must be a person's choice: a machine result picked on the beat reads as a person deciding.

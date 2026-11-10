---
id: install-block
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### install-block

- **Purpose**: How to start: an ink block where one or two commands type out after a prompt with a block cursor, an optional note, then numbered steps under 4 px rules; the cursor blinks on every beat while the page holds and the music rests.
- **Intent**: A pause that is also a call to act: real commands typing out in a quiet bar tell a developer exactly how to begin.
- **Content**: Title, panel label, 1–2 commands (code, ≤ 36 chars), an optional note, 2–4 steps of a command (≤ 16) and a note (≤ 24).
- **Fits**: `rest`, `demo`; The rest before the closing claim: install command and first steps of a developer tool. **Not for**: Products without a command line; more than two commands; commands longer than 36 characters.
- **Layout and camera**: title 120 px at y 150; ink block x 96–1824, y 350–550, panel label at the upper right in mutedOnInk; commands 34 px Plex Mono at x 136 after the prompt glyph; note at y 566; steps at columns 1, 4, 7, 10 under 4 px rules at y 640; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary | 1 | 5 words, 26 chars | 10 chars | Start in one line / 一行命令开始 |
  | `panel` | text | glance | 1 | 5 words, 24 chars | 10 chars | terminal · macOS · Linux / 终端 · macOS · Linux |
  | `commands` | list of code | primary | 1–2 | 36 chars | 36 chars | ["brew install tablewarden","tw init --d… / ["brew install tablewarden","tw init --d… |
  | `note` | text | glance (optional) | 1 | 8 words, 48 chars | 22 chars | reads tablewarden.yaml · never runs unsi… / 读取 tablewarden.yaml · 未签字不执行 |
  | `steps.cmd` | list of code | primary | 2–4 | 16 chars | 16 chars | tw draft / tw draft |
  | `steps.note` | list of text | glance | 2–4 | 5 words, 28 chars | 9 chars | the agent writes the plan / 代理写出计划 |

- **Length**: 6–22 beats (3–11 s at 120 BPM); longer copy reads longer; the sample plans 13 beats in English, 20 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: title; the block clips in left to right (0.4 s expoInOut); commands type at 72 characters a second; note; rules grow; steps land paced by reading; the cursor blinks on every beat once typing ends; roll-up exit (or the block carries on).
- **Needs**: motions block-carry; props poster-chrome; roles paper, ink, dim, grid, onInk, mutedOnInk, promptOnInk; type display, text, mono.
- **Sound**: `type` keys under each command, `tick` per step and on each blink; the bed rests (break).
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (install)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: Commands are code and stay Latin in Chinese films; translate only the notes.

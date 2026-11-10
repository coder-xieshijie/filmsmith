---
id: human-loop
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### human-loop

- **Purpose**: The whole system as one line: a person, the product's steps, a person again; boxes on a 3 px rule with arrows, the person's nodes in the accent, a bracket over the steps, a loop back underneath, then one statement and a list.
- **Intent**: Put the person at both ends of the system in one glance: the accent bookends the line, so the claim "you start it, you sign it" is a picture.
- **Content**: Title, 3–6 nodes (name ≤ 11 chars, note ≤ 13; which are the person), a bracket label, a loop label, one statement and a list line.
- **Fits**: `demo`, `proof`; The page that sums up how it works: who starts it, what runs, who signs, what happens on failure. **Not for**: More than six nodes; branching flows (it is one line); systems with no person in them.
- **Layout and camera**: title 120 px fitted to 1732 at y 150; the rule at y 559 from x 96; nodes 140 px tall at y 490, span 2–4 columns each by count; bracket at y 446 with its label at y 400; loop under the steps to y 700 with its label; rule at y 790, statement at y 818, list at y 886; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary | 1 | 5 words, 26 chars | 10 chars | From draft to applied / 从起草到执行 |
  | `nodes.name` | list of text | glance | 3–6 | 1 words, 11 chars | 4 chars | YOU / 你 |
  | `nodes.note` | list of text | glance | 3–6 | 2 words, 13 chars | 5 chars | ask / 提出 |
  | `nodes.human` | list of flag | – | 3–6 | – | – | true / true |
  | `bracket` | text | glance | 1 | 6 words, 48 chars | 16 chars | the agent and the probe / 代理和探针 |
  | `loop` | text | glance | 1 | 6 words, 44 chars | 14 chars | fails: back to draft / 失败：退回起草 |
  | `statement` | text | primary | 1 | 6 words, 36 chars | 14 chars | You start it, you sign it. / 你发起，你签字。 |
  | `list` | text | glance | 1 | 12 words, 60 chars | 24 chars | draft · measure · replay · sign · apply / 起草 · 测量 · 回放 · 签字 · 执行 |

- **Length**: 8–18 beats (4–9 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: title; the rule draws 1.4 u; nodes pop 0.25 u apart (the person with back easing), arrows between; bracket and label; the loop with its arrowhead and label; rule, statement, list; the frame walks the nodes; roll-up exit.
- **Needs**: motions walk-frame, block-carry; props poster-chrome; roles paper, ink, dim, grid, accent, onAccent; type display, text, mono.
- **Sound**: `stamp` (the person's marimba) per accent node, `tick` per step node, `turn` on the bracket, `land` on the statement.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (flow)`), split from the plakat style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: With five or six nodes each box is two columns wide: names longer than 8 Latin or 3 Chinese characters overflow. Without a `from` rect, `enterBy: reblock` falls back to the pop-in.

---
id: party-count
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### party-count

- **Purpose**: Two parties in cards and the shared ruler between them, then a big counter steps to N, the camera pushing in on the count, a meta column, and a ticker of the counted items with their verdict.
- **Intent**: Prove agreement by counting: both sides checked against the same thing, one at a time, until the number lands.
- **Content**: The header, left and right parties (label, name, desc, ≤ 3 items), the shared middle (label, name, desc), the counted items (≤ 16) with a label and verdict, ≤ 3 meta lines.
- **Fits**: `proof`, `demo`; A comparison that ends in a number: two machines, two teams, before and after, all checked against one thing. **Not for**: More than 16 counted items; a comparison without a shared ruler; numbers that are not counts.
- **Layout and camera**: header at (110, 92); left card 620 × 380 at (110, 250), right at (1190, 250) outlined and glowing in the accent, middle 380 × 220 dashed at (770, 330); counter 240 px display at (108, 660), "/ N label" 84 px at y 780 beside it; meta 25 px mono from x ≥ 980 at y 770; ticker 25 px mono at y 940 scrolling 290 px/s, verdict in the accent.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `head` | group | – | 1 | – | – | {"title":["CHECK","EVERY PR"],"note":"//… / {"title":["检查","每个 PR"],"note":"// 两台机器，… |
  | `left` | group | – | 1 | – | – | {"label":"LAPTOP","name":"grainlock","de… / {"label":"笔记本","name":"grainlock","desc"… |
  | `right` | group | – | 1 | – | – | {"label":"CI","name":"grainlock","desc":… / {"label":"CI","name":"grainlock","desc":… |
  | `middle` | group | – | 1 | – | – | {"label":"SHARED","name":"lockfile","des… / {"label":"共用","name":"锁文件","desc":"同一个哈希… |
  | `counter` | group | – | 1 | – | – | {"items":["auth","cart","mail","queue","… / {"items":["auth","cart","mail","queue","… |
  | `meta` | list of text | primary (optional) | 0–3 | 5 words, 28 chars | 10 chars | ["0 drift","signed by you"] / ["零漂移","由你签字"] |

- **Length**: 6–20 beats (3–10 s at 120 BPM); the cards read, then half a beat a step with the last on a beat, then the meta read; the sample plans 10 beats in English, 16 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: left 0, right 0.32, middle 0.96 beat (back.out 2), links 1.4; counter as the cards are read (≥ 2 beats); steps every half beat; push 1.1 over 0.6 beat on the last step (1.08 → 1); ticker 1.2 beats after the counter; meta on the half beat after.
- **Needs**: motions none; props terminal-hud; roles ground, panel, ink, muted, dim, line, accent, titleHi, titleLo; type display, text, mono.
- **Sound**: a pop for the middle, a rising tick per step, a stamp on the last.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.compare; events.js TIMING.compare`), split from the template of the phosphor style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: The counter steps through whole numbers only; digits never flicker through other digits.

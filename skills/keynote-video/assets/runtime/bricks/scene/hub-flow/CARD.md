---
id: hub-flow
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### hub-flow

- **Purpose**: Inputs → hub → outputs: nodes slide in around the owner's hub, connectors draw, dots travel in and out, each output lights on the beat and its checks tick along the bottom.
- **Intent**: Show the tool as the owner in the middle: everything passes through it, and each result is checked.
- **Content**: The header, a command, 1–3 inputs and 1–3 outputs (a name and a sub), the hub (label, name, sub), 0–5 checks each tied to an output.
- **Fits**: `demo`, `proof`; A chapter that shows what the tool does with its inputs, and the checks each output passes. **Not for**: More than three inputs or outputs; flows with branches or loops (use you-ends for a loop).
- **Layout and camera**: header at (110, 92), the command box from x 930 at y 82 (74 tall); inputs 360 × 96 at x 120, outputs 390 × 96 at x 1420, 147 px apart around y 495; the hub 330 × 190 at (790, 400) outlined in muted; connectors as cubic curves, 2.5 px muted at 0.55; check boxes 64 px tall from (120, 792), 20 px apart.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `head` | group | – | 1 | – | – | {"title":["LOCK","THE GRAPH"],"note":"//… / {"title":["锁定","依赖图"],"note":"// 每个包都做哈希… |
  | `command` | list of code | glance (optional) | 1–2 | 30 chars | 30 chars | ["grainlock lock","--all"] / ["grainlock lock","--all"] |
  | `inputs.name` | list of code | primary | 1–3 | 2 words, 16 chars | 7 chars | package.json / package.json |
  | `inputs.sub` | list of text | glance | 1–3 | 4 words, 22 chars | 9 chars | 41 direct / 41 个直接依赖 |
  | `hub` | list of text | primary | 2–3 | 3 words, 16 chars | 6 chars | ["OWNER","grainlock","hash and sign"] / ["负责人","grainlock","哈希 + 签名"] |
  | `outputs.name` | list of code | primary | 1–3 | 2 words, 16 chars | 7 chars | grainlock.lock / grainlock.lock |
  | `outputs.sub` | list of text | glance | 1–3 | 4 words, 22 chars | 9 chars | one hash / 一个哈希 |
  | `checks.label` | list of text | primary | 0–5 | 4 words, 22 chars | 8 chars | hashes match / 哈希一致 |
  | `checks.output` | list of number | – | 0–5 | – | – | 0 / 0 |

- **Length**: 6–20 beats (3–10 s at 120 BPM); names read, then for each output a beat of travel and half a beat a check; Chinese reads longer (19 beats with the sample copy); the sample plans 10 beats in English, 19 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: command 0.1 beat; inputs from 0.2 beat every 0.26; hub 0.85 beat (back.out 2 from 0.85); outputs from 1.4 beats; connectors 0.75–2.15 beats; checks enter from 1.9 every 0.21; dots in from 2.1; each output: a dot travels a beat, it lights on the beat, its checks tick every half beat.
- **Needs**: motions none; props terminal-hud; roles ground, panel, ink, muted, dim, line, accent, hi, titleHi, titleLo; type display, text, mono.
- **Sound**: a tick for the command, a pop for the hub, a stamp as each output lights, a tick per check.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.flow; events.js TIMING.flow`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Each output lights on a beat; with three outputs and five checks the page runs about five bars.

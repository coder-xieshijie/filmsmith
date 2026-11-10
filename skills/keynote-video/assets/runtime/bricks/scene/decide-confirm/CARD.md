---
id: decide-confirm
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### decide-confirm

- **Purpose**: The chapter's decision summary in a window, a finding the tool made on its own blinking its tag, then the person's confirmation box lands on a beat and passes on its check as the camera pushes in.
- **Intent**: Turn the picks into a written policy and let the person sign it once.
- **Content**: The header, the summary's title and label, 1–4 decisions (id, ≤ 6 words, an optional `found` tag), a confirmation (a mark and ≤ 4 words), an optional strip.
- **Fits**: `demo`, `proof`; After qa-pick: what was decided, what the tool found, the one confirmation a person gives. **Not for**: More than four decisions; a page without a person's confirmation (use hub-flow).
- **Layout and camera**: window without dots at (110, 262), 1700 wide, 96 + 84 × n + 10 tall; decisions at 40 px from (144, 346), 84 px apart: ✓ (muted mono), id (dim mono), text (ink), the found tag in `find`; confirmation box 900 × 100 at x 510, 50 px under the window; strip 25 px at (112, 948).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `head` | group | – | 1 | – | – | {"title":["SET","THE POLICY"],"note":"//… / {"title":["设定","策略"],"note":"// 写入 grain… |
  | `summary` | list of text | glance | 1–2 | 3 words, 18 chars | 8 chars | ["POLICY","confirm once"] / ["策略","确认一次"] |
  | `decisions.id` | list of code | glance | 1–4 | 3 chars | 3 chars | D1 / D1 |
  | `decisions.text` | list of text | glance | 1–4 | 6 words, 32 chars | 12 chars | New maintainer → block / 维护者变了 → 拦下 |
  | `decisions.found` | list of text | primary (optional) | 1–4 | 3 words, 16 chars | 6 chars |  /  |
  | `confirm` | list of text | primary (optional) | 2–2 | 4 words, 22 chars | 8 chars | ["YOU ▸","Confirm the policy"] / ["你 ▸","确认这份策略"] |
  | `strip` | list of text | glance (optional) | 0–3 | 4 words, 22 chars | 8 chars | ["Plain TOML","Reviewed like code"] / ["纯 TOML","像代码一样评审"] |

- **Length**: 5–16 beats (2.5–8 s at 120 BPM); decisions every half beat (a found one read first), the confirmation once read, its check a beat later, half a beat of push; the sample plans 9 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: window at 0.1 beat (0.45 s power2.out); decisions from the half beat after 0.5 beat, 0.35 s expo.out from 30 px right; found tag blinks five times from +0.15 s; confirmation on the beat (0.35 s from 0.96), check a beat later (accent fill 0.28, glow 50 px, 1.06 → 1), push 1.1 over 0.6 beat hiding the header.
- **Needs**: motions none; props terminal-hud; roles ground, panel, ink, muted, dim, line, accent, hi, find; type text, mono.
- **Sound**: a tick per decision (a pop for a found one), a tick as the box lands, a stamp on the check.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.decide; events.js TIMING.decide`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: A `found` decision is primary text and holds the next one back: use it once a page.

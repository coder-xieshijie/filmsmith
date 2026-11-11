---
id: horizon-hero
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### horizon-hero

- **Purpose**: The claim under the horizon: a hot line draws out from the centre, a scanline sphere rises out of it as the camera pushes in, the claim decodes under it in two lines, a sub and one to three facts land.
- **Intent**: Make the claim the horizon of the film: one line of light, the product rising from it, the promise written under it.
- **Content**: Two claim lines (≤ 4 words each), a sub (≤ 5 words, [marked] words in ink), 0–3 facts (a key and a value).
- **Fits**: `claim`; The claim right after the opening's flash. **Not for**: A claim of more than eight words; films that do not open with prompt-boot (the sphere is born at its point).
- **Layout and camera**: horizon at y 540, 2 px hi with an accent glow; the sphere (fx sphere, 1800 × 1013 shown at 1440 × 810, a radial mask 34–60 %) centred on the line's centre, cut by it, pushed in 1 → 1.0128 × (push − 0.9) over two bars; claim lines at 108 px (fit to 94) from y 574, centred; sub 40 px muted centred under them, facts 25 px mono one row under that.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 2–2 | 4 words, 22 chars | 9 chars | ["Every failure,","replayed exactly."] / ["每一次失败，","都能原样重放。"] |
  | `sub` | text | primary (optional) | 1 | 5 words, 40 chars | 16 chars | Records [seed and order]. / 记下[种子和顺序]。 |
  | `facts.key` | list of text | glance | 0–3 | 1 words, 8 chars | 3 chars | runs / 支持 |
  | `facts.value` | list of code | glance | 0–3 | 5 words, 26 chars | 16 chars | jest · vitest · pytest / jest · vitest · pytest |

- **Length**: 5–14 beats (2.5–7 s at 120 BPM); the claim read line by line, then the sub, then the facts as glance; the sample plans 7 beats in English, 12 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: line draws out 0.9 s expo.out; line 1 decodes at 0.27 beat (0.55 s, RGB hit after); line 2 as line 1 is read (≥ 1.12 beats, 0.6 s, a blinking underscore after); sub as the claim is read (≥ 2 beats, 0.5 s from 20 px below); facts every half beat after it.
- **Needs**: motions glyph-decode; props terminal-hud; roles ground, ink, muted, accent, hi, titleHi, titleLo; type display, text, mono.
- **Sound**: a stamp on the line, a glitch per decode, a tick for the sub and each fact; the bed ducks under the claim.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.hero; fx.js sphere; events.js TIMING.hero`), split from the template of the phosphor style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: The sphere is a light layer: on a light ground it disappears; keep the dark presets.

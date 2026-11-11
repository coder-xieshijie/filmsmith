---
id: cursor-lockup
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### cursor-lockup

- **Purpose**: The lock-up out of a cursor: the horizon line shrinks into a block cursor, the name types out of it leftwards and the chips rightwards, the cursor drops a line and types the URL, a sub lands, and the chips light on the last downbeat.
- **Intent**: End where the film started, at the prompt: everything the tool is comes out of one cursor, and the URL is typed for you.
- **Content**: The name (≤ 12), 0–4 chips (one word each), the URL, an icon (github | link | none), an optional sub (≤ 8 words).
- **Fits**: `lockup`; The end card of a phosphor film, after slit-tagline (or alone, from the frame's centre). **Not for**: Films that end on a person or a product shot; names longer than 12 characters.
- **Layout and camera**: the cursor (27.5 × 59.5) at the horizon's centre; the name right-aligned to its left (150 px, fit to 108, 34 px gap); chips left-aligned to its right (32 px mono, padding 30 / 16, 20 px apart); the URL centred one line below (64 px mono, fit to 56; the icon 64 px and 22 px gap before it); the sub 32 px muted under it; a horizon glow (fx horizon) at 0.85 under all.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 1 words, 12 chars | 6 chars | reseed / reseed |
  | `chips` | list of text | glance | 0–4 | 1 words, 10 chars | 4 chars | ["RUN","REPLAY","BISECT","VERIFY"] / ["记录","重放","二分","验证"] |
  | `url` | code | primary | 1 | 40 chars | 40 chars | github.com/example-org/reseed / github.com/example-org/reseed |
  | `sub` | text | primary (optional) | 1 | 8 words, 48 chars | 20 chars | MIT · jest, vitest and pytest / MIT · 支持 jest、vitest 和 pytest |

- **Length**: 8–20 beats (4–10 s at 120 BPM); the URL holds ≥ 3 s after it is typed, then the sub is read; the chips light on the last bar line before the end; the frame dims in the last 0.4 s unless `dim` is false; the sample plans 10 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: line → cursor over 0.9 beat (expo.inOut); the name types leftwards at 30 cps with an RGB split; chips from beat 1 one a half beat (0.3 s from 24 px left); the URL from 1.5 beats at 45 cps, the cursor after it; the sub on the half beat after the URL is read (≥ 4 beats); chips light one a half beat from the last downbeat (accent, 1.08 → 1, glow).
- **Needs**: motions none; props terminal-hud; roles ground, panel, ink, muted, line, accent, hi, onAccent, titleHi, titleLo; type display, text, mono.
- **Sound**: a stamp as the cursor forms, a tick per chip, typing under the URL, the end chime on the last downbeat.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.end, endCursor, lightChips; fx.js horizon; events.js TIMING.end`), split from the template of the phosphor style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: After slit-tagline pass `horizonY` 521.25 (its pushed-in horizon) or the cursor jumps 19 px.

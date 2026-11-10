---
id: slit-tagline
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### slit-tagline

- **Purpose**: The closing claim: a grid tunnel rushes and folds into the horizon, the line opens as a slit on the bar line, the claim's words land in it one per half beat with the stressed word bigger, then the slit closes into the line.
- **Intent**: Rush into the claim and then hold it still: the most energy of the film arrives at one line of light that opens to show what it means.
- **Content**: One or two lines (≤ 4 words each), one word marked as the stress.
- **Fits**: `climax`, `claim`; The climax of a phosphor film: the claim in a pause, after the install. **Not for**: A claim of more than eight words; a film without a lock-up to take the line; quiet films (the tunnel is the loudest shot).
- **Layout and camera**: the tunnel canvas 2400 × 1350 drawn at 1920 × 1080, pushed in 1 → 1.25 (power2.in) over four beats; the horizon at y 521 (540 − 15 × 1.25); the slit 1920 wide, its height the text block + 130; lines at 150 px (fit to 1600, ≥ 90), stress × 1.12; two 3 px hi lines with an accent glow hold it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `lines` | list of text | primary | 1–2 | 4 words, 22 chars | 9 chars | ["Same seed,","same *failure*."] / ["同一个种子，","同一个*失败*。"] |

- **Length**: 8–16 beats (4–8 s at 120 BPM); four beats of tunnel, then a half beat a word, then the claim read in a pause (0.3 s a word; Chinese 6 characters a second + 0.5 s); the slit closes half a beat before the end; the sample plans 10 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: tunnel fades in 0.2 s; folds 3.1–4 beats; slit opens at 4 beats over 0.75 beat (power3.out); words from 4.5 beats, one a half beat across both lines, 0.35 s expo.out from 30 px below at 1.2 (stress 0.5 s back.out 1.8 from 1.5); closes at the end − 0.5 beat in 0.6 of the opening.
- **Needs**: motions none; props terminal-hud; roles ground, accent, hi, titleHi, titleLo; type display.
- **Sound**: the rush over the tunnel, an impact on the opening, a tick per word, a whoosh as it closes; the bed ducks under the claim.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js BUILD['horizon-tagline'], tunnelShot; fx.js tunnel; events.js TIMING['horizon-tagline']`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Mark the stress in the copy (`*failure*`): matching a bare word fails on Chinese and on punctuation.

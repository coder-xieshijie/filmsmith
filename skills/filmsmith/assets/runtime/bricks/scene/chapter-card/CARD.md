---
id: chapter-card
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### chapter-card

- **Purpose**: A chapter turn: the number above, the title slams in decoded at 150 px, the card line types, then the title flies to the page header, motion-blurred, while the note slides in under it.
- **Intent**: Mark each chapter as a command the film is about to run: its name big, its tool in mono, then the name becomes the page's header.
- **Content**: Number and total, a title in two halves (≤ 2 words each), a card line (the chapter's tool, ≤ 6 words), a note for the page.
- **Fits**: `turn`; Each chapter of a phosphor film, before its page. **Not for**: Films with one chapter (use the page alone, header decoding in); more than four chapters.
- **Layout and camera**: number "01 / 03" 32 px mono tracked 0.3 em at y 366, centred; title 150 px display at (1920 − w)/2, 520 − h/2, scaled to fit 1700, slamming from 1.25× its scale (top-left origin); card line 32 px mono centred at y 640; header at (110, 92) at 84 / 150; note 25 px mono at (112, 192).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | list of text | primary | 2–2 | 2 words, 12 chars | 4 chars | ["CATCH","THE RUN"] / ["抓住","这次运行"] |
  | `card` | code | glance (optional) | 1 | 6 words, 40 chars | 24 chars | reseed run // every seed kept / reseed run // 每个种子都留下 |
  | `note` | code | glance (optional) | 1 | 6 words, 40 chars | 24 chars | // 50 runs, one record each / // 50 次运行，每次一份记录 |

- **Length**: 3–6 beats (1.5–3 s at 120 BPM); the card holds until the title is read and the card line seen (≥ 2 beats, to the next half beat), then 0.8 beat of flight; the sample plans 5 beats in English, 6 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: slam 0.5 s expo.out; halves decode at 0.08 and 0.34 beat; card line types at 0.2 beat (40–120 cps); on a long card the number and line light halfway; flight 0.8 beat expo.inOut with five-sample motion blur; number and line fade in 0.12 s; note slides 14 px at flight + 0.45 beat.
- **Needs**: motions glyph-decode; props terminal-hud; roles ground, ink, muted, titleHi, titleLo; type display, mono.
- **Sound**: a stamp on the slam, a whoosh with the flight.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/film.js pageHeader; events.js card()`), split from the template of the phosphor style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: The page after it must draw the header in place (`headEnter: false`); the template starts the page 0.4 beat into the flight, the bricks after it.

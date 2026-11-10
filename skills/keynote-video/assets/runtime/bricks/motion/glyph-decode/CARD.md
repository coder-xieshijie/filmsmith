---
id: glyph-decode
category: motion
tier: T0
family: mask-type
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### glyph-decode

- **Looks**: the line appears as a row of flickering characters that settle into the words from left to right, like a terminal resolving them.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: Every title, claim and result in a phosphor film; any terminal-flavoured title. **Not for**: Body text and long lines (the flicker costs reading time); numbers that must read at once.
- **Intent**: Let a line resolve the way a terminal draws it, so it is read as it locks.
- **Content**: One or two lines of ≤ 4 words.
- **Parameters**: `lines`, `screen`; roles read: `titleHi`, `titleLo` (the display gradient), `ground`.
- **Theory**: A reading-order reveal: the locking edge leads the eye along the line (as a typewriter reveal does); keeping digits out of the flicker means no frame shows a wrong value.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Length and easing**: 0.4–0.6 s a line, 30 flickers a second; the second line 0.35 of the motion later.
- **Sound**: a short glitch per line, −21 dB.
- **Source**: own (`assets/templates/phosphor/film.js scramble, alphabetOf, numberSafe, decodedAt`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: A Chinese line flickering through Latin letters reads as broken text: the pool is Chinese only.

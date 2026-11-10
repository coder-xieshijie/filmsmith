---
id: terminal-hud
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### terminal-hud

- **Structure**: brand mark (30 px rounded square, chevron and underscore) at (70, 38), the name at 25 px Plex-like mono 500 and its tag in muted; the licence right-aligned to 1846 at y 42 tracked 0.18 em with a 5 px dot before it; the chapter mark and section at (74, 996) tracked 0.12 em; a 4 px progress bar along the bottom edge (muted, fading in from the left); 34 px corner brackets at (38, 34) and mirrored, muted at 0.45.
- **Intent**: The frame says this is one terminal session and where you are in it: the tool, its licence, the chapter, how far along.
- **Content**: Brand name (≤ 14), tag (≤ 12), licence (≤ 24), chapter mark ([01/03], [>>], [00]) and section (≤ 24), progress 0–1.
- **States**: `blank` (nothing), `drawn` (the whole frame).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `brand`, `tag`, `licence`, `mark`, `section` (text), `progress` (0–1, or [from, to] across a scene).
- **Parameters** and **Roles**: `colors`, `palette`, `lang`, `screen` (crt | flat), `ground` (draw the ground and screen under / over it in the sample), `seed` (the grain); roles ground, groundHi, groundLo, ink, muted, accent.
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Source**: own (`assets/templates/phosphor/index.html (HUD, ground, screen CSS); film.js (LOGO, decode, typing, windows); fx.js`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Scenes draw the frame only when given `hud` (an optional slot): a host that leaves it out gets a bare screen.

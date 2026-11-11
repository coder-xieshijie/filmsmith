---
id: seal-stamp
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### seal-stamp

- **Structure**: a 64 px rounded vermilion square (radius 10), an inner frame, one paper-coloured glyph at 40 px (a Latin word shrinks to fit 44 px); a hollow round imprint (r ≥ 21, 3 px stroke, 10 % fill) where it pressed; parts `seal`, `inner frame`, `glyph`, `imprint`.
- **States**: `hidden`, `landed` (dropped in from 1.6×), `pressed` (0.88), `lifted` (with its imprint), `hollow` (the person away).
- **Sizes**: S 320, M 640, L 960 (square; the 64 px seal drawn 1×, 2×, 3×).
- **Swap points**: `glyph`.
- **Intent**: Make the person a thing on the page, so every press reads as a moment a human had to act.
- **Content**: One glyph.
- **Styles**: made for `terminal-ledger` (recipe the terminal-ledger recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/assets/kits/terminal-ledger/starter/components/stamp.js`), split from terminal-ledger kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger kit (example film the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: One stamp a film: it is the person, not a badge.

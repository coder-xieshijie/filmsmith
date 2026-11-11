---
id: seam-grip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### seam-grip

- **Structure**: the seam 6 px accent with a 2 px `key` each side (solid, or `stitch`: 14 px dashes 6 px apart on a fixed grid); the grip a 24 × 64 tab r 4 at the seam’s top (vertical) or right end (horizontal) with two 2 × 28 key lines; the chip a bench tab 40 px tall, mono 25 in `onBench`, 28 px from the grip; the caret 4 px wide in the accent.
- **Intent**: One boundary the eye can follow from the first caret to the last frame.
- **Content**: A result (frame, render or page) and its source line for the chip (≤ 52 characters).
- **States**: `vertical` → `horizontal` → `band`; vertical at x 900 (request, pick), horizontal under the code (y 420), the band at y 260 (render, diff).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `result` (image), `chip` (text).
- **Parameters** and **Roles**: `result`, `chip`, `stitch`, `colors`, `lang`; roles paper, ink, dim, bench, onBench, accent, key.
- **Styles**: made for `split` (recipe the split recipe); fits split, any film whose input maps line by line to an output; avoid exhibit, handset.
- **Source**: own (`assets/templates/split/lib/handoffs/seam.js, film.js (chip, gripV, gripH, caret)`), split from the template of the split style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; the chip is a source line (a file and a time, a URL and a date) and stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The chip names the source and nothing else.

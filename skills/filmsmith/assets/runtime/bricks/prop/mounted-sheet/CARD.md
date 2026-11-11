---
id: mounted-sheet
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### mounted-sheet

- **Structure**: the asset cropped and scaled (≤ 4/3), a 24 px paper mount with a seeded tooth, two paper edges 7 and 14 px down-right, the veil (mat 50 %) outside the lit band, the stroke (a parallelogram slanted 5 px, multiply; under the line 2 px slant, ≥ 7 px tall), the leader (ink 9 px, accent core 4 px, a dot r 8); parts `mount`, `edges`, `page`, `veil`, `stroke`, `leader`, `sticker`.
- **States**: `plain`, `veiled`, `struck` (the stroke, leader and sticker on).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080 (the frame scaled).
- **Swap points**: `exhibit` (the capture spec).
- **Intent**: Make a capture read as a document on file, with one line of it marked as the claim.
- **Content**: A captured page, its crop and the box of its claim.
- **Parameters** and **Roles**: `exhibit`; roles ground, paper, onPaper, line, accent, onAccent.
- **Styles**: dossier. **Source**: own (the dossier source film, `layout.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (the page keeps its own language).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Never past 4/3 output px per source px; never recolour the page.

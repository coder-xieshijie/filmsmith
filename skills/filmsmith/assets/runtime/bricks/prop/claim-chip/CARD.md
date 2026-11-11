---
id: claim-chip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### claim-chip

- **Structure**: a card 570 × 190 r 10 of label stock, a 2 px mat edge, the accent tick 6 × 122 at 28 px, the label 32 px (secondary on stock) at 66, the value 76 px (sink) at 150; shadow blur 36, offset 18, 50 %; on the front plane (rate 1.65).
- **Intent**: The one thing to remember from a print, restated in code where it cannot be misread.
- **Content**: A label (≤ 26 chars / 12 字) and a value (≤ 11 chars / 6 字) printed in the asset (or `~` when read off an axis).
- **States**: `off` → `landing` → `landed`; it settles 24 px onto the glass while fading in (settle, w 10).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `label` (glance), `value` (primary).
- **Parameters** and **Roles**: `label`, `value`, `colors`, `lang`; roles ground, panel, line, accent, onPaper, smuted.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/film.js (chips), parallax-slide (chip)`), split from the template of the exhibit style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Step it aside when a measure would lie under it.

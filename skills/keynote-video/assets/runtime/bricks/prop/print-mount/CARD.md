---
id: print-mount
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### print-mount

- **Structure**: the desk (back plane, fibre or mat), the numeral `01` 220 px in the mat colour at (48, 330); the mount 1200 × 729 r 12 of label stock with a 54 px bar (source in mono) over the 1200 × 675 content; shadow blur 30, offset 14, 40 %.
- **Intent**: Every print gets the same mount, so the evidence is compared like with like and every move rests on one frame.
- **Content**: A real capture (crop and focus in its own px) and its source line (≤ 56 chars / 28 字).
- **States**: `desk` → `mounted` → `printed` → `indexed`; the mount and bar appear (alpha), then the print, then the numeral behind.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `image` (cropped 16:9 round `focus`, ≤ 1.333 output px per source px), `source` (text); without an image the neutral placeholder page.
- **Parameters** and **Roles**: `image`, `crop`, `focus`, `source`, `desk` (`plain` | `mat`), `colors`, `lang`; roles ground, panel, line, ink, dim, accent, onPaper, smuted.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Source**: own (`assets/templates/exhibit/layout.js, film.js (desk, numerals, mount)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese captions, labels and lines are set character by character at 6 characters a second plus half a second (lang.js), never shrunk; mono notes and sources go to 28 px in Chinese (25 in English); captions 59 px, labels 44, the chip label 32; numbers, sources and the address stay in the Latin face.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Never past 1.333 output px per source px: crop tighter instead of zooming.

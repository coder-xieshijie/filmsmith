---
id: margin-notes
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### margin-notes

- **Structure**: a block at one level: the value (display 95 or 76 px) at slot 0, the line (49 px) at 128, the note or address (mono 25 px, Chinese 28) under the line; an optional mark image (96 px tall) at −150.
- **Intent**: Everything the viewer must read is set in code beside the evidence, never inside it.
- **Content**: A value (≤ 10 chars / 5 字), a line (≤ 18 chars / 14 字), a note (≤ 40 chars / 22 字) or an address.
- **States**: `empty` → `value` → `group` → `leaving`; each line enters up through its rail (0.36 s, expo out) and leaves up through it (0.2 s, ease in); Chinese lines wrap and push the note down.
- **Sizes**: S 448 × 320, M 448 × 400, L 996 × 400.
- **Swap points**: `value`, `line`, `note` (text, limits per language).
- **Parameters** and **Roles**: `value`, `line`, `note`, `colors`, `lang`; roles ground, ink, dim, muted.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/film.js (paintCopy, fitCopy), choreo.js (group)`), split from the template of the handset style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Keep the value one size for the scene (95 or 76 px); do not shrink line by line.

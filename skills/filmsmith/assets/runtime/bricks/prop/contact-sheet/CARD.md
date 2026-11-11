---
id: contact-sheet
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### contact-sheet

- **Structure**: rows 84 px apart from y 56 (centred when fewer than ten), strips at 96 / 832 from x 432, names right-aligned 34 px left of the strip (33 px), lengths 26 px after the end (DM Mono 33).
- **Intent**: Lengths compared as lengths of film on one baseline.
- **Content**: 1–10 films: a name (≤ 12 chars / 6 字), a duration and a row strip (one 192 × 108 frame per 4 s).
- **States**: `short` → `long` → `measured` → `picked`; short (all at the shortest length), long (each its own), measured (lengths set), picked (the other rows stepped back to 62 %).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `rows` (name, duration, row image).
- **Parameters** and **Roles**: `rows`, `pick` (the row kept forward), `colors`, `lang`; roles ground, glow, base, hole, ink, muted.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/lib/handoffs/strip.js (paintSheet, SHEET), film.js (sheetState)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

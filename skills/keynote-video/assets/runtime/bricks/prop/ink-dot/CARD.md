---
id: ink-dot
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ink-dot

- **Structure**: a disc of radius 0.062 em, 0.05 em after the last glyph, sitting on the baseline; parts `dot`, `ring`, `word` (the word it ends, for context).
- **States**: `stop` (at rest), `squash` (the landing frame: 28 % wider and lower, decaying e^(−14 t) at 40 rad/s), `ring` (the burst: a ring 2.6 radii, stroke 0.35 r), `cursor` (r 16 after a 40 px command).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080 (the frame scaled).
- **Swap points**: `word` (≤ 8 chars / 4 Chinese characters).
- **Intent**: One mark the eye follows through the whole film.
- **Content**: The word it ends or a command.
- **Parameters** and **Roles**: `ground` (paper | night | accent: accent on paper, nightAccent on night, onAccent on the field), `word`; roles ground, ink, accent, night, nightAccent.
- **Styles**: ink. **Source**: own (`assets/templates/ink/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: a Chinese word gets the same dot as its full stop (not 。), 0.05 em after its last character.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: One dot in the frame at a time.

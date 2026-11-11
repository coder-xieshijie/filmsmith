---
id: glyph-slam
category: motion
tier: T0
family: zoom-depth
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### glyph-slam

- **Looks**: each glyph drops from 1.5× and 0.1 em high onto its place on a spring (damping 0.62, 30 rad/s), 28 ms after the one before, out of a 7 px blur in 0.035 s; for the first 0.1 s a ghost in the `mis` colour sits 5 px right and 3 px up at 40 %; the camera punches in 5 %, decaying e^(−7 t); the full stop lands with its squash. `stiff`: damping 0.8, 44 rad/s, 12 ms (the step words).
- **Tier**: T0. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: every word entrance in ink. **Not for**: calm films, body text.
- **Intent**: Each word is a hit you can see: big to small, blur to sharp, with a printing ghost.
- **Content**: One word (≤ 10 chars).
- **Parameters**: `text`, `size` (330), `ground` (paper | night | accent), `stiff`; roles ground, ink, accent (the stop), mis (the ghost).
- **Theory**: overlapping action (Thomas & Johnston) makes the hit textured; small overshoot and the print ghost give weight without bounce.
- **Styles**: ink; any kinetic type film. Avoid dossier and scroll.
- **Length and easing**: 1 beat (the hit is settled in about 0.2 s); spring as above.
- **Sound**: `land` (the bed's stamp).
- **Source**: own (`assets/templates/ink/film.js word()`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: one glyph per Chinese character, Noto Sans SC 900 as 长体 0.8, the same spring.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own, split from the ink template); compare waived. Same constants as the template's word().
- **Pitfalls**: Slam, never bounce: the spring overshoots under 8 %.

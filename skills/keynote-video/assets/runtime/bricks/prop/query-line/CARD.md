---
id: query-line
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### query-line

- **Structure**: one JetBrains Mono 500 line, 31 px, at x 164, baseline 990 (film px); parts `line`, `ellipsis`.
- **States**: `prompt` (the first fragment), `typing` (two fragments and half the third), `carried` (six fragments, the front dropped behind "… "); anchor-ask and hop-search type it at 12 ms a character.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080 (the frame scaled).
- **Swap points**: `fragments` (1–8 code fragments ≤ 34 chars); never translated.
- **Intent**: Under every spoken word sits its real parameter, so the viewer believes the question is a real run.
- **Content**: 1–8 code fragments (≤ 34 chars each) the product really accepts.
- **Parameters** and **Roles**: `ground` (a ramp step; the line takes that step's quiet colour), `fragments`; roles ground, dim, r0, r1.
- **Styles**: pulse; phosphor-like terminal films. **Source**: own (`assets/templates/pulse/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: code stays code; fragments are dropped by `lang.js breaks()` (the template split on spaces).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Only real parameters: no timecode, no HUD.

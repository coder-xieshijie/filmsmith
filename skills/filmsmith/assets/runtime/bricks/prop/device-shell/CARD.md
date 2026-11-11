---
id: device-shell
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### device-shell

- **Structure**: laptop: lid 1192 × 800 r 28 with a 2 px edge, screen 1152 × 720 r 8 inset 20 px, camera dot on the top bezel, chin line 31 px above the deck, deck 1272 × 18 with a 180 px thumb notch; phone: body 440 × 920 r 64, screen 400 × 840 r 44, camera pill, the source line under the body.
- **Intent**: One device holds every surface honestly: plain hardware claims nothing, and its chin says whose each screen is.
- **Content**: A real capture for the screen (optional; a neutral page without one) and its source line (≤ 44 chars / 22 字).
- **States**: `off` → `drawn` → `lit` → `sourced`; the edge draws out from the camera dot both ways (0.45 s) while the lid fills (0.3 s); the screen comes up from the glass; the chin fades in (0.3 s).
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `screen` (image, cropped to its public region, ≤ 1.333 output px per source px), `chin` (text); without a screen the neutral placeholder page.
- **Parameters** and **Roles**: `device` (`laptop` | `phone`), `screen`, `chin`, `colors`, `lang`; roles ground, panel, line, dim, glass, deck, deckEdge, cam.
- **Styles**: made for `handset` (recipe the handset recipe); fits handset, any real-asset launch; avoid tally, trace.
- **Source**: own (`assets/templates/handset/choreo.js (DEVICES), film.js (paintDevice)`), split from the template of the handset style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese lines wrap inside the margin (lang.js wrap, simple kinsoku) instead of shrinking; notes and the chin are 28 px in Chinese (25 in English); numbers and product names stay in the Latin face; no capitals, no negative tracking.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Do not add a drop shadow, reflection or tilt; the edge is the outline.

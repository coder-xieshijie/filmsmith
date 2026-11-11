---
id: film-strip
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### film-strip

- **Structure**: base 660 px tall, sprocket holes 34 × 48 r 7 every 86 px top and bottom (the ground shows through), frames 832 × 468 at 14 / 96 in a cell 860 wide, the optical track 16 px at 577; an intertitle a frame of `title` with its line in `titleInk`, 79 px; the gate’s corner marks 26 px, 3 px, 8 px off the frame.
- **Intent**: Every picture is a frame on one strip, so order and count are physical.
- **Content**: Frames (images, cropped 16:9) and intertitle lines (≤ 3 words / 8 字).
- **States**: `blank` → `loaded` → `tracked`; a blank leader; frames loaded; the track lit by a sweep left to right.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: `frame` (image, cropped 16:9), `title` (text).
- **Parameters** and **Roles**: `frame`, `title`, `colors`, `lang`; roles ground, glow, base, hole, title, titleInk, trackDim, trackLit, line.
- **Styles**: made for `strip` (recipe the strip recipe); fits strip, any film about films, frames or renders; avoid exhibit, tally.
- **Source**: own (`assets/templates/strip/lib/handoffs/strip.js (paintStrip, paintTrack), film.js (gate)`), split from the template of the strip style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese intertitles keep 79 px and fit the frame (≤ 8 characters); captions 59 px, row names 33, lengths and the address in DM Mono; Chinese lines are read at 6 characters a second plus half a second (lang.js), so a Chinese intertitle holds longer; film names, numbers and addresses stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Intertitles longer than the frame wrap badly: keep ≤ 16 chars / 8 字.

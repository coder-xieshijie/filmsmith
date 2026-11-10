---
id: dot-burst
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### dot-burst

- **Purpose**: Turn the guess into the method through the dot: shrink, burst, condense.
- **Intent**: The method is born out of the guess: the same ink, rearranged.
- **Content**: Two single words (≤ 9 chars each).
- **Fits**: `turn`. **Not for**: long words; two unrelated words (the burst says one became the other).
- **Layout and camera**: both words centred on x 960, baseline 640, one size (330 fitted to 220 with 120 px spare for the dot); no camera move during the burst.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `word` | text | word | 1 | 1 word, 9 chars | 4 chars | Guess / 猜 |
  | `into` | text | word | 1 | 1 word, 9 chars | 4 chars | Halve / 二分 |
- **Length**: 4–8 beats: the guess held until read (≥ 1 beat), the burst 2 beats, the method held until read.
- **Steps and events**: the guess slams with its dot (T0); after its rest the runtime hand-off collapse-burst (T2, 2 beats) shrinks it into the dot, swells, squashes, bursts into a ring and particles that condense left to right onto the method word; the method word stands with its dot.
- **Needs**: motions collapse-burst (runtime), glyph-slam; props ink-dot; roles ground, ink, accent, mis; type display.
- **Sound**: `land` on the guess, `hit` on the burst (riser into it), `land` on the method.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes burst, drawBurst`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: collapse-burst samples the method word's glyphs at the face's own width, so a Chinese burst sets both words at normal width (no 长体) and the particles land exactly on the word that then stands.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the burst is runtime collapse-burst with the template's parameters (step 6, cloud 620 by default).
- **Pitfalls**: The burst is runtime collapse-burst: keep both words short enough to fit centred at one size.

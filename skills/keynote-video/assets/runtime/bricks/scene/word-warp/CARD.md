---
id: word-warp
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### word-warp

- **Purpose**: Show an unstable problem: the accent word warps while the plain word slams.
- **Intent**: Instability made visible: the problem word cannot hold its shape while the plain word under it lands hard.
- **Content**: Two single words (≤ 10 chars), an optional label.
- **Fits**: `problem`, `turn`. **Not for**: a calm statement; a word that must be read exactly (the warp blurs it).
- **Layout and camera**: left at 150, baselines 520 (the warped word) and 830, one size (330 fitted to 220); ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `word` | text | word | 1 | 1 word, 10 chars | 4 chars | Blame / 甩锅 |
  | `word2` | text | word | 1 | 1 word, 10 chars | 4 chars | everyone / 给所有人 |
  | `label` | text | primary (optional) | 1 | 4 words, 24 chars | 10 chars | – |
- **Length**: 4–8 beats: the second word on beat 2, held until both are read.
- **Steps and events**: the accent word rises through its mask on beat 0; from 0.3 beat its warp ramps over 2.7 beats (per-glyph width, height and shear, two ghosts at 28 %); the ink word slams on beat 2 with its stop; the label types on beat 3.
- **Needs**: motions glyph-slam; props ink-dot; roles ground, ink, accent, mis; type display, mono.
- **Sound**: `accent` on the rise, `land` on the slam.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes warp; plan.js warp`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the warp is the template's per-glyph sine field; the template's ramp shape kept (3 beats, 1 + 0.25 sin).
- **Pitfalls**: The warped word is the one place the accent colours a word: use it once in a film.

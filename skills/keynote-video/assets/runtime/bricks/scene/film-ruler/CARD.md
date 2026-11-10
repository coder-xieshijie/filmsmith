---
id: film-ruler
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### film-ruler

- **Purpose**: Mark where the film is, with a ruler grown out of the dot.
- **Intent**: The film measures itself: the dot is exactly where the film is, so "half way" is literally true.
- **Content**: Two words (≤ 7 chars each), an optional label (≤ 26 chars); the film's length in beats and this scene's start.
- **Fits**: `turn`, `proof`. **Not for**: a timeline of real dates; a film without a fixed length.
- **Layout and camera**: the ruler x 300–1620 at y 760, a tick per film beat (30 px on bar lines, else 12); two words centred as a pair at 600 (330 fitted to 220, gap 0.2 em); the label at 300; ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `words` | list of text | word | 2 | 1 word, 7 chars | 3 chars | half · way / 过半 · 了 |
  | `label` | text | primary (optional) | 1 | 5 words, 26 chars | 10 chars | twelve builds to go / 还剩十二次构建 |

  Options: `film` ({ beats, at }: the film's length in beats and this scene's first beat).
- **Length**: 4–8 beats: the second word on beat 1, the label 0.75 beat after it, held until read.
- **Steps and events**: the ruler grows from the dot over 0.5 s, expo out; word 1 slams on beat 0, word 2 on beat 1 (T0); the dot rides at the film's progress.
- **Needs**: motions glyph-slam; props ink-dot; roles night, nightInk, nightAccent; type display, mono.
- **Sound**: `land` on each word.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes ruler, drawScene ruler`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the film's length is a parameter instead of the plan's own duration.
- **Pitfalls**: Pass the real film length and start (`film`), or the playhead lies.

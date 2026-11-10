---
id: word-swap
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### word-swap

- **Purpose**: Say three words as three hits: each slams on its beat at the left margin on a new ground that opens from the previous word's dot.
- **Intent**: Each word is a new page: the ground changes with the word, opened by the dot, so three words read as three hits.
- **Content**: 2–6 single words (≤ 10 chars), optional grounds per word, an optional answer index.
- **Fits**: `hook`, `turn`, `proof`. **Not for**: words that need reading together; more than six words; phrases.
- **Layout and camera**: every word left at 150, baseline 640, one size for all (330 fitted to 220); ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `words` | list of text | word | 2–6 | 1 word, 10 chars | 4 chars | Who · broke · main / 谁 · 弄坏了 · 主干 |

  Options: `first` (the film's opening: the first word on beat 1), `grounds` (cycle, default paper, night), `answer` (index on the accent field).
- **Length**: 3–12 beats: one beat a word, the last held until read (+0.3 s).
- **Steps and events**: word k slams on its beat (T0, stiff spring 0.8 / 44 rad/s, 12 ms stagger) with its dot; the next ground opens from the dot (circle), the line (band) or as closing bars over 0.44 beat, cubic out (T1).
- **Needs**: motions glyph-slam; props ink-dot; roles ground, ink, accent, onAccent, night, nightInk, nightAccent, mis; type display.
- **Sound**: `land` on each word (stamp), `tick` on each aperture.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js drawSwap, swapState; plan.js swap`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the apertures are aperture-swap's shapes drawn as canvas clips instead of the WebGL transition.
- **Pitfalls**: All words share one size so the anchor never moves: a long word shrinks the others.

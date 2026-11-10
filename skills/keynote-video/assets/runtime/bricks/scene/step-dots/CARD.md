---
id: step-dots
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### step-dots

- **Purpose**: Run the method's real stages one a beat, the dot walking the progress row.
- **Intent**: The method as rhythm: one stage a beat, the dot walking the row, so the viewer feels the loop rather than reads it.
- **Content**: 3–7 stage words (≤ 9 chars each).
- **Fits**: `demo`, `proof`. **Not for**: stages that need explaining; more than seven; made-up stages.
- **Layout and camera**: centred, baseline 650, 300 fitted to 200; the counter at 300 (mono 28); dots at y 850, 46 px apart, r 9 (the current r 11); ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `steps` | list of text | word | 3–7 | 1 word, 9 chars | 4 chars | fetch · midpoint · build · test · narrow / 拉取 · 取中点 · 构建 · 测试 · 缩小 |

  Options: `streaks` (`first` | `each` | false).
- **Length**: 4–10 beats: one beat a step, the last held until read (≥ 2 beats), the dot bouncing on the beats after it.
- **Steps and events**: step k slams on beat k (T0, stiff spring) and is cut by the next; the counter types at 400 cps; the dots pop in 25 ms apart; streaks sweep the night on the first step; the current dot lands with its squash.
- **Needs**: motions glyph-slam; props ink-dot; roles night, nightInk, nightSoft, nightAccent; type display, mono.
- **Sound**: `land` on each step (`tick` under the counter).
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes steps, drawScene steps; plan.js steps`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat; the counter reads 第 n / N 步.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the streaks keep clear of the type band by fixed bands instead of the counter's measured box.
- **Pitfalls**: Each step word is cut by the next on the beat: keep them to one word.

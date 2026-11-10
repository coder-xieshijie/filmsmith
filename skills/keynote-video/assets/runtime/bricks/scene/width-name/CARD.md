---
id: width-name
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### width-name

- **Purpose**: Land the name on the drop and make it breathe with the bar.
- **Intent**: The name breathes with the music: the drop lands it, the bar shapes it, and the dot underlines it.
- **Content**: A name (one word, ≤ 10 chars) and one or two labels (≤ 20 chars).
- **Fits**: `climax`, `lockup`. **Not for**: a long name (it must fit at every width); a second name.
- **Layout and camera**: centred on x 960, baseline 610, 225 fitted to 140 at the widest step; labels centred at 720; the playhead hairline at 780 under the name's width; ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | word | 1 | 1 word, 10 chars | 4 chars | cleave / 二分侠 |
  | `labels` | list of text | primary | 1–2 | 4 words, 20 chars | 8 chars | finds the commit · that broke main / 找出那次提交 · 是它弄坏了主干 |
- **Length**: 7–10 beats: the jumps on beats 2–6, the playhead from beat 5, the second label once the first is read (≥ 4.5 beats).
- **Steps and events**: the name rises on beat 0 (T3 reveal on the drop); its width jumps on beats 2, 3, 4, 5, 6 (T0, punch-in each); label 1 types at 0.5 beat, label 2 at 4.5; the playhead and dot run under the name from 5.5 beats to the end.
- **Needs**: motions width-jump; props ink-dot; roles accent, onAccent; type display, mono.
- **Sound**: `drop` on the rise (the bed's first drop), `tick` on each jump, `type` under the labels.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes name, namePlayhead; plan.js widthSteps`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat; the width jumps are 长体 jumps of the same five steps (motion/width-jump; zhRedesigns).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the template's second label waits on its own reading model; here `readTime` of the name and the first label.
- **Pitfalls**: The name is fitted at its widest width, so every jump stays inside the margins.

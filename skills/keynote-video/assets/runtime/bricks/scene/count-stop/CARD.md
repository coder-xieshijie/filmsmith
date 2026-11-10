---
id: count-stop
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### count-stop

- **Purpose**: Count the film's number up and stamp it with the dot.
- **Intent**: The number is counted, then stamped: the full stop says "exactly this".
- **Content**: 1–2 values (≤ 7 chars) with labels (≤ 24 chars).
- **Fits**: `proof`. **Not for**: more than two numbers; a value that is not exact.
- **Layout and camera**: centred on x 960, baseline 640, 280 fitted to 180, tracking −0.01 em; labels centred at 300; ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `items` | list | – | 1–2 | – | – | – |
  | `items[].value` | text | word | 1 | 7 chars | 7 chars | 12 |
  | `items[].label` | text | primary (optional) | 1 | 5 words, 24 chars | 10 chars | builds, not 4096 / 次构建，不是 4096 |
- **Length**: 4–12 beats: each value on a bar line, the next after the previous value and label are read plus the hop.
- **Steps and events**: a value with digits rolls up over a beat, cubic out, in its own slots (T0); its stop lands when it completes; the label types 0.75 beat after; to a second value the stop hops 0.3 s, 120 px high; a resting stop bounces on the beats.
- **Needs**: props ink-dot; roles night, nightInk, nightAccent; type display, mono.
- **Sound**: `tick` under the roll, `land` on the stop, `hop` on the hop.
- **Styles**: made for `ink` (recipe the ink recipe).
- **Source**: own (`assets/templates/ink/film.js layoutScenes counter, drawScene counter; timing.rules.js counterStarts`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat; digits stay Archivo; a Chinese label follows the value.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the ink template (`assets/templates/ink/`), so the compare is waived. Checked instead side by side with the template's example film at the same moments: the ink recomposition (the recipe's Recomposition). Intended departures: colours by role from the look (`s.colors`), timing in beats from the scene's start, the generic dot's hop between scenes left to the film (recipe); the stop's rest bounce runs on every beat after the landing (the template's bounce schedule comes from the plan).
- **Pitfalls**: The count runs in the final string's slots: do not change the value's format between frames.

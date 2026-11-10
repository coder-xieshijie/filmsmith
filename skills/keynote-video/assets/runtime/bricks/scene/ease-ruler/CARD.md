---
id: ease-ruler
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ease-ruler

- **Purpose**: The curves link: the sphere becomes the rod, the rod presses the merge's stage name into itself on the beat, recovers as the beat ruler, and four easing curves (ω 12–40) draw over it with their riders and the spring formula.
- **Intent**: Show that every move lands on the beat, with the curves the film really uses.
- **Content**: No copy of its own: the formula and ω labels, the stage name and note.
- **Fits**: `demo`; A reel's timing step: the springs the film itself moves by. **Not for**: Films without the merge before it; curves that are not the film's own.
- **Layout and camera**: graph 880 × 420 at (520, 260); the ruler at y 860, ticks every 175 px; formula 58 px serif at y 216; ω labels 26 px.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Physics","note":"springs settle… / {"name":"物理","note":"弹簧落在拍点上"} |

- **Length**: 4–10 beats (2–5 s at 120 BPM); about 1.75 bars (1.5 without a name to press).; the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: squash 0–0.42 u; the rod drops 0.45–0.78 u; the press 1 beat from 0.82 u (rail-press press); ticks from 0.55 u after the shift; curves from 0.75 u, riders RIDE.from–to.
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: an impact on the press, ticks on the ruler, a pluck per curve.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js curves, easingGraph, railDraw; shots.js PRESS, RIDE`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: The press reads as a hit, not a press, at one beat: keep the name on screen a full beat before it. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

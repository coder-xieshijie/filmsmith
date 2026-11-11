---
id: panel-board
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### panel-board

- **Purpose**: The storyboard link: swatches, glyphs or the line itself grow into six 16:9 panels, sketches draw in them, panel 3 (the merge's first frame) is outlined in the line colour; the stage name. Opening the film, the line is cut into four segments that open into panels.
- **Intent**: Show the film planned before anything moves, and choose the shot the camera will go into.
- **Content**: No copy of its own: the stage name and note.
- **Fits**: `demo`; A reel's planning step; the first link of the short chain. **Not for**: More than six panels; boards whose panels show nothing the film does.
- **Layout and camera**: 3 × 2 panels 400 × 225, gap 40, centred +20 px; panel numbers 16 px; centre name 76 px at y 262.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Boards","note":"six panels befo… / {"name":"分镜","note":"动之前先画六格分镜"} |

- **Length**: 3–8 beats (1.5–4 s at 120 BPM); about 1.5 bars.; the sample plans 6 beats in English, 6 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: four panels from their sources (ω 16, 1/32-note stagger), two more scale in from 0.45 u; sketches draw from 0.6 u; panel 3 outlined from 1.45 u (ω 24).
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: plucks per panel, ticks per sketch, a bell on the chosen panel.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js drawBoard, sketch, segEnvelope, panel`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

---
id: sphere-merge
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sphere-merge

- **Purpose**: The merge link: the camera pushes through panel 3 into its shot, three glossy spheres on the field drift together, merge through a viscous neck, squash on landing and settle; the stage name under the sphere. Without the curves after it, the sphere squashes into the rod.
- **Intent**: Show volume, light and physics computed per frame, in the line colour.
- **Content**: No copy of its own: the stage name and note.
- **Fits**: `demo`, `proof`; A reel's shading or physics step; the middle of the short chain. **Not for**: Films without a WebGL host; anything that must look photoreal.
- **Layout and camera**: the sphere settles at (960, 560), r 180; the field fills the frame from the push's landing; centre name 76 px at y 851.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Physics","note":"volume and lig… / {"name":"物理","note":"体积与光逐帧计算"} |

- **Length**: 6–12 beats (3–6 s at 120 BPM); about 2 bars (2.25 with the squash).; the sample plans 12 beats in English, 12 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: push 0–0.9 u (log-space zoom, exponential in-out); drift 0.2–1.7 s, contacts at 1.0 and 1.2 s, landing squash 26 %, settled at 2.45 s; squash into the rod 0.42 s.
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: half-time bed; a squelch per contact, a thud on the landing.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js merge; shots.js mergeState, squashState, MERGE_CUES; gl.js blob`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Without WebGL the spheres fall back to flat discs (a P0 failure of the mode): render in a host with WebGL. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

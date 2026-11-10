---
id: glyph-swatch
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### glyph-swatch

- **Purpose**: The palette link: the word's first four glyphs morph into four swatches (text, ground, field, line) that hop on 1/16 notes, the hex labels type under them, a type specimen rises; the stage name in the centre.
- **Intent**: Show that every colour of the film comes from one preset, by turning the word into it.
- **Content**: No copy of its own: the palette's hex values, the specimen, the stage name and note.
- **Fits**: `demo`; A reel's colour step: the real hex values of the preset. **Not for**: Palettes of more than four roles; a film without the word before it.
- **Layout and camera**: swatches 140 px at y 500, 250 px apart; hex 26 px mono at y 640; specimen 44 / 50 / 44 at y 790; centre name 76 px at y 330.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Colour","note":"every hex comes… / {"name":"配色","note":"每个色值出自同一预设"} |

- **Length**: 2–8 beats (1–4 s at 120 BPM); about 1.5 bars in the chain.; the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: glyphs → circles (ω 17, 1/32-note stagger); hop 36 px on 1/16 notes from 0.95 u; hex typed at 60 cps from 0.5 u; specimen from 1.0 u (ω 20).
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: plucks on the swatches, ticks on the hex labels.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js palette, SW_ROLES; fx.js SPECIMEN`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

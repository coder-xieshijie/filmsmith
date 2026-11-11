---
id: name-cut
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### name-cut

- **Purpose**: The close: the ground opens out of the line, a blade cuts the line into the name in the line colour, the band contracts into the caret, which types the URL; the closing line enters; on the last downbeat the caret falls flat under the URL.
- **Intent**: End where the film began: the line that typed the request is cut into the name and types the link.
- **Content**: The name (≤ 16), one closing line (≤ 52), the URL (≤ 52).
- **Fits**: `lockup`; The lock-up of a thread film. **Not for**: Names over 16 characters; a film without a URL (the band then stays under the name).
- **Layout and camera**: name 196 px (fit to 1500) baseline 600 in the line colour; closing line 58 px serif at y 750; URL 44 px mono at y 870 with its underline at 884.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 1 words, 16 chars | 8 chars | filmsmith / filmsmith |
  | `line` | text | primary | 1 | 9 words, 52 chars | 20 chars | Every film is code: scored, timed and ch… / 每部片都是代码：配乐、计时、检查。 |
  | `url` | code | primary | 1 | 52 chars | 52 chars | github.com/coder-xieshijie/filmsmith / github.com/coder-xieshijie/filmsmith |
  | `stage` | group | – (optional) | 1 | – | – | null / null |

- **Length**: 9–14 beats (4.5–7 s at 120 BPM); ≥ 2.25 bars; takes the film's bar rounding.; the sample plans 12 beats in English, 12 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: ground opens 0–0.3 u; the line settles 0.05–0.45 u; the cut 1 beat from 0.5 u (rail-press cut); the band → caret 0.2 u; URL typed from 1.2 u at ≥ 110 cps; closing line from 1.2 u; the caret falls flat onto the last downbeat.
- **Needs**: motions caret-fall; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: the outro (D add9) and a bell; an impact on the cut; typing under the URL; the end bell on the last downbeat.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js close, urlGeo; shots.js CLOSE, closeSecondMove`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: The closing URL needs 3 s after it is typed: the close takes the bar rounding to give it. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

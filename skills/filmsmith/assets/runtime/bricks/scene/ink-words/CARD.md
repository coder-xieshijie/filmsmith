---
id: ink-words
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### ink-words

- **Purpose**: The ink link: the full-height line dissolves into two marbled dyes curling outward, the centre kept darker, and up to three serif words rise over it.
- **Intent**: Say what the output is in a few words over something only code could draw.
- **Content**: One to three words (≤ 14 characters).
- **Fits**: `claim`, `rest`; A reel's output or render step said in two or three words. **Not for**: Films without a WebGL host; more than three words.
- **Layout and camera**: serif 230 px (fit to 1300), baseline 640, clipped to y 380–720, a 40 px ground-coloured shadow under it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `words` | text | primary | 1 | 3 words, 14 chars | 6 chars | pure code / 纯代码 |
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Output","note":"no camera and n… / {"name":"输出","note":"没有摄像机也没有素材"} |

- **Length**: 4–8 beats (2–4 s at 120 BPM); 1 bar in English; the Chinese corner note can lengthen it; the sample plans 4 beats in English, 8 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: the line fades over 0.35 u as the ink plumes; words land at 0.45 + 0.55 k u (ω 18) and leave over the last 0.18 u.
- **Needs**: motions none; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: a pad-only break with the ink's rumble.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js ink; shots.js inkState; gl.js ink`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: A Chinese phrase with no word break rises as one: the segmenter splits 纯代码 into 纯 / 代码. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

---
id: sheet-flood
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-flood

- **Purpose**: The review link, the climax: the line colour floods the frame from a dot on a bar line, holds two bars, retracts onto a contact sheet of the film's own frames gathered from 420 particles, checks tick, the counter runs to the frame count, the tiles collapse into a file card with its spec line and export bar, and the card squashes into the line.
- **Intent**: End the steps on the proof: every frame of this very film, rendered and checked.
- **Content**: The counter label (≤ 22 characters), the card's file type (≤ 4).
- **Fits**: `climax`, `proof`; The climax of a video tool's reel: the film's own frames, counted and checked. **Not for**: Films without the links before it (the tiles show its own frames); short films (it needs about 10 s).
- **Layout and camera**: sheet 4 × 4 tiles 280 × 158, gap 12, top 200; counter 98 px at baseline 985 with its label 26 px; card 900 × 506 with its title 230 px and the spec line 44 px mono at y 690.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `count` | text | glance | 1 | 3 words, 22 chars | 8 chars | FRAMES RENDERED / 帧已渲染 |
  | `card` | text | primary | 1 | 1 words, 4 chars | 4 chars | MP4 / MP4 |
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Output","note":"{frames} frames… / {"name":"输出","note":"{frames} 帧，逐帧检查"} |

- **Length**: 16–22 beats (8–11 s at 120 BPM); about 4.75 bars (the climax, three compositions).; the sample plans 20 beats in English, 20 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: flood (dot-iris) from 0.25 u before the downbeat; holds two bars; retracts 0.4 s onto the sheet; particles 0.1–2.2 u (ω 9); tiles from 2.0 u on 1/16 notes; checks from 4.0 u; counter to 5.5 u; collapse 6.45 u; card 6.85 u; squash over the last 0.35 u.
- **Needs**: motions card-squash; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: an impact on the flood, a 0.2-bar rest, the drop on the sheet, ticks on the checks, a pad-only break on the card.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js review, floodArea, particles, tileTimes; shots.js REVIEW_CUES, CARD`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Pass the film's length as `seconds`: the counter and `{frames}` count the host film, not the scene. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

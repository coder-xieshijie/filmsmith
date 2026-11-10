---
id: brief-loop
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### brief-loop

- **Purpose**: The open: a line draws and becomes the caret, which types the brief and falls flat under it; with a second phrase the line rolls up a loop that carries the first phrase round and brings the second; the line tightens, contracts into the caret, and the caret takes the letters back.
- **Intent**: Start from the one sentence the tool is given, typed by the line that will make everything else.
- **Content**: One or two phrases of ≤ 5 words (≤ 24 characters); a second phrase is the first one revised.
- **Fits**: `hook`; The open of a video tool's reel: the request it starts from, and its revision going round the loop. **Not for**: A brief that is not a request; two phrases that are not a request and its revision; more than five words a phrase.
- **Layout and camera**: brief 44 px mono, baseline 560, centred; the line 1400 × 6 at y 574 (14 px under the baseline); caret 6 × 64; loop radius 190.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `brief` | list of text | primary | 1–2 | 5 words, 24 chars | 12 chars | ["explain our pipeline","in {seconds} se… / ["讲清我们的流程","只用 {seconds} 秒"] |
  | `stage` | group | – (optional) | 1 | – | – | {"name":"Prompt","note":"one sentence se… / {"name":"提示","note":"一句话定下需求"} |

- **Length**: 6–14 beats (3–7 s at 120 BPM); fitted by the template's rules: about 2.75 bars with two phrases, 2 with one (11 and 8 beats at 120).; the sample plans 11 beats in English, 12 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: line draws 0–0.45 u and becomes the caret; types at ≥ 42 cps; falls flat 0.2 u after (0.3 u); the loop (path-type, 2 beats) from the next beat after the phrase is read; the line tightens (ω 20); contracts into the caret (0.2 u); letters slide into it last first over the last 0.4 u.
- **Needs**: motions caret-fall; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: a whoosh as the line draws, a pluck on the caret, typing, a whoosh round the loop.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js open; shots.js OPEN, openPlan`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Text is read only while the line is straight: the loop carries the phrase unreadable for its middle beat by design. Pass the film's chain as `before` / `after`: the hand-offs read the neighbours, and the link's length is fitted with them (a link alone fits differently).

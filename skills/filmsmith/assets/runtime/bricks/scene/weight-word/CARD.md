---
id: weight-word
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### weight-word

- **Purpose**: The big word: its letters spring in on 1/32 notes and its weight swings 780 → 200 → 800 → 430 on the beats; the full stop is the line colour.
- **Intent**: Answer the brief in one word and make the beat visible in its weight.
- **Content**: One word of 4–7 letters and an optional full stop.
- **Fits**: `hook`; The hook of a reel: the brief's one-word answer. **Not for**: A word over seven letters (four Chinese characters); a sentence.
- **Layout and camera**: Bricolage 360 px (fit to 1500), baseline 650, centred by its width at the current weight.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `word` | text | primary | 1 | 1 words, 8 chars | 5 chars | Plan. / 先做计划。 |
  | `stage` | group | – (optional) | 1 | – | – | null / null |

- **Length**: 2–6 beats (1–3 s at 120 BPM); 1 bar (4 beats).; the sample plans 4 beats in English, 4 in Chinese (Chinese reads 6 characters a second, through the template's fit()).
- **Steps and events**: letters from 0, 1/32-note stagger, ω 20 from 180 px below; weight swings on beats 2, 3, 4 (ω 16), each letter 0.03 u behind.
- **Needs**: motions weight-swing; props thread-line; roles ground, panel, ink, accent, onAccent, field, onField; type display, text, mono.
- **Sound**: a six-note run as it springs in, a bell on each swing.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js word, WORD, weightAt`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: The palette takes the first four glyph boxes: a word under four letters breaks the hand-off.

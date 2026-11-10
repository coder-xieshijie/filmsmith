---
id: weight-swing
category: motion
tier: T0
family: mask-type
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### weight-swing

- **Looks**: a huge word pops up letter by letter and then pulses between thin and heavy on each beat.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: A one-word hook in a variable display face. **Not for**: Faces without a weight axis; long words or sentences.
- **Intent**: Make the beat visible in a word that stays in place and keeps reading.
- **Content**: One word of 4–7 letters.
- **Parameters**: `word`; roles read: `ground`, `ink`, `accent` (the full stop).
- **Theory**: Weight as a motion axis keeps the word legible; landings on the beats make rhythm visible without cuts.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Length and easing**: 4 beats: letters from 0 (1/32-note stagger, ω 20), swings on beats 2–4 (ω 16).
- **Sound**: a bell a swing, −20 dB.
- **Source**: own (`assets/templates/thread/film.js word, weightAt`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Centre by the width at the current weight, or the word slides sideways as it swings.

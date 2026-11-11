---
id: thread-line
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### thread-line

- **Structure**: one box in the line colour: the 1400 × 6 line at the centre, the 6 × 64 caret, the 6 × 1080 playhead; `rule` fills the box, `swell` fills an ellipse along its long side twice as thick in the middle, tapering to points.
- **Intent**: Keep one object on screen through the whole film: whatever happens, the line was there before and is there after.
- **Content**: Nothing to read: the line's form (line, caret, playhead) and profile.
- **States**: `line`, `caret`, `swell` (the line in the swelled profile), `playhead`.
- **Sizes**: S 960 × 540, M 1440 × 810, L 1920 × 1080.
- **Swap points**: none (the line carries no text).
- **Parameters** and **Roles**: `colors`, `palette`, `ground` (draw the ground under it in the sample). The engine (kit.js linkScene, chain.js createChain) is what the scenes import.; roles ground, accent.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Source**: own (`assets/templates/thread/film.js (threadRect, swellPath, the links); shots.js; fx.js; gl.js; timing.rules.js`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Under 4 px the line breaks the coloured-line-over-a-field rule: the swell's tips over the field carry nothing.

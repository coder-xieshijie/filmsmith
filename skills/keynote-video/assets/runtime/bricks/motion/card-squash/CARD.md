---
id: card-squash
category: motion
tier: T0
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### card-squash

- **Looks**: a big pale card flattens into a thin red line across the screen, its title fading as it goes.
- **Tier**: T0. **Family**: shape. **Surface**: canvas.
- **Use**: A card, panel or frame that hands over to a line. **Not for**: Cards that must stay readable to the end; hand-offs to anything but a line.
- **Intent**: Turn the finished thing back into the line, so the close can grow from it.
- **Content**: A short title on the card (≤ 4 characters).
- **Parameters**: `title`, `thread`; roles read: `ground`, `ink`, `accent`.
- **Theory**: Squash and stretch keeps the change one of form; landing on the next shape exactly makes the cut invisible.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Length and easing**: 1 beat (0.35 u in the template), settle ω 10.
- **Sound**: a short whoosh, −22 dB.
- **Source**: own (`assets/templates/thread/film.js review (the card), swellPath`), split from the thread style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: An eased squash that overshoots lands off the next line: use the exact landing (settle).

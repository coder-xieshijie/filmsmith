---
id: caret-fall
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### caret-fall

- **Looks**: a blinking-cursor bar after a typed line drops down to the underline's height, then stretches both ways into the underline.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: Any typed phrase whose caret should become its underline; played back, a line contracting into a caret. **Not for**: Text that keeps being typed; a caret that should vanish.
- **Intent**: Keep one object on screen as it changes job, without crossing the words being read.
- **Content**: One typed phrase (≤ 5 words).
- **Parameters**: `text`, `thread` (rule | swell); roles read: `ground`, `ink`, `accent`.
- **Theory**: One object, two jobs (the thread's principle); height before width keeps the moving edge off the glyphs.
- **Styles**: made for `thread` (recipe the thread recipe); fits thread; avoid phosphor, plakat, blueprint.
- **Length and easing**: 1 beat (0.3 u in the template): height over the first 40 %, width from 30 %, cubic in-out.
- **Sound**: a tick, −24 dB.
- **Source**: own (`assets/templates/thread/film.js caretToLine, CARET, FLAT`), split from the template of the thread style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Bricolage Grotesque and JetBrains Mono and Noto Serif SC after Instrument Serif; the serif voice is set upright in Chinese (Chinese has no italic, a slanted Song face is a fake), nothing is tracked or set in capitals, labels are 28 px. The big word is four characters and a full stop (the four glyph boxes the swatches take), its weight swinging in the variable Noto Sans SC; the ink's words are the word segmenter's (纯 / 代码), one rising at a time; the palette's specimen names the Chinese faces (思源黑体, 思源宋体). Code, URLs, hex values, the formula, the card's file type and the spec line stay Latin. Chinese reads at 6 characters a second (rules.js through the template's fit(), which has no 0.5 s per state), so links with long Chinese notes run longer.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the thread template (`assets/templates/thread/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the thread recomposition (the recipe's Recomposition section). Intended departures: each scene is one link of the template's chain drawn by the template's own engine (chain.js, film.js as a factory), so its frames are the film's frames when the host passes the film's chain as `before` / `after`; the grain is drawn into the frame instead of a CSS overlay; Chinese is new (the template is English only).
- **Pitfalls**: Moving width and height together drags the caret across the last letters: keep the two moves.

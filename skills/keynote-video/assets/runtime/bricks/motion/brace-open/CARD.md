---
id: brace-open
category: motion
tier: T1
family: split-wipe
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: Apache-2.0
status: approved
---

### brace-open

- **Looks**: a pair of braces appears closed together in the centre with a soft glow; they spring apart, the word growing out between them like a curtain opening, and settle wrapped round it, the word's tracking relaxing a little as it lands.
- **Tier**: T1. **Family**: split-wipe. **Surface**: canvas.
- **Use**: a short name revealed as the thing itself: a product, an API or a defined term on a title card or a chapter opening; one sign doing the whole reveal. **Not for**: sentences, or names over about 14 characters (7 Chinese); more than once a film (its one overshoot is the accent); products with nothing to do with code or naming.
- **Intent**: The name is "bracketed out" as the content itself, so the viewer reads it as the thing being defined, with a developer's accent.
- **Content**: One short name or term, centred on one line (≤ 14 chars); nothing else.
- **Parameters**: `from` the closed braces, `to` the word wrapped in its braces. `text` (default the sample product name; sample en `"Weekly review"`, zh `"每周回顾"`), `open` / `close` (en `{` `}`, zh `「` `」`), `braceRole` (en `'mono'`, zh `'display'`), `size` (en 164, zh 150), `weight` 800, `braceSize` (en 300, zh 260), `x` 960, `y` 520, `pad` 26 (curtain margin), `caret` true, `glow` 28 (blur px; 0 for none). Roles read: `ink` (word), `accent` (braces, caret, glow).
- **Theory**: a container that opens to reveal its content uses the closure of a frame (Gestalt closure) and the anticipation of a curtain; the spring's small overshoot is the landing (Thomas & Johnston).
- **Styles**: technical looks (trace, phosphor, blueprint); avoid it in ink and plakat.
- **Length and easing**: 5 beats, 4–6. Appear 6 f, expand 14 f, spring damping 14, stiffness 130, settled from 40 f; tracking en −0.03 → −0.01 em.
- **Sound**: `turn` at the opening, `land` when the braces settle.
- **Source**: adapted from video-shotcraft `demos/typography/brace-expand/BraceExpand.tsx` (card `references/shots/typography/brace-expand.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh adapted: Chinese uses the corner brackets 「」 in the display face instead of code braces, which read as code rather than as a term in Chinese; the brackets are placed by the word's measured ink edges; the tracking relax is English only (Chinese stays at 0).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: tracking −0.03 → −0.01 em (upstream −0.05 → −0.03, too tight in the neutral display face); no backdrop, brand or caption. Compare: pass (curtain edge 19.6 px, from the measured title width; progress RMSE 0.0001, events 0; SSIM drop 0.058).
- **Pitfalls**: The word is clipped, not scaled: a longer name gets its ends cut by the braces unless the half-width grows too. The word always shows from the middle out: keep it one short, centred line; lopsided lines reveal awkwardly. Keep its overshoot the only one around it; other springs nearby cheapen it.

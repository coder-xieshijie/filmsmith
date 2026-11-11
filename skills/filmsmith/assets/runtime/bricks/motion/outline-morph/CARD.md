---
id: outline-morph
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### outline-morph

- **Looks**: the ink fill follows the outline point for point; the outline's stroke fades in as the new form settles.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: A promotion between two closed forms of the same object: card to hexagon, point to circle, pill to card. **Not for**: Shapes with holes or several parts (split them first); text.
- **Intent**: The viewer sees one thing change form, not a cut to another thing, so the new form inherits the old one's meaning.
- **Content**: Two closed shapes of the same object (card, pill, point, hexagon, circle, or a rect).
- **Parameters**: `from`, `to`: `card`, `pill`, `point`, `hex`, `circle` or a rect [x, y, w, h, r]; `corners` (`round` | `cut`); roles `ground`, `ink`.
- **Theory**: Shape blending by arc-length correspondence (Sederberg & Greenwood 1992); one continuous object reads as the same thing transformed (common fate).
- **Styles**: made for `morph` (recipe the morph recipe); fits morph, blueprint; avoid none.
- **Length and easing**: 1 beat, cubic in-out (the template runs it in 0.38 s after 0.1 s of content out).
- **Sound**: `turn` at the start.
- **Source**: own (`assets/templates/morph/film.js (outlineOf, resample, drawSolid)`), split from the template of the morph style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Let the old content leave first (0.1 s); morphing an outline with text inside smears the text.

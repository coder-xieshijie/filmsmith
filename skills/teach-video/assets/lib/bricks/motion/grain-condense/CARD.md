---
id: grain-condense
category: motion
tier: T2
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### grain-condense

- **Looks**: a line of text sits under a hatched selection box that opens from its centre; the letters start to boil into grain (block noise re-seeded 46 times over the move), two tinted blooms swell behind them and loose sand grains blow out; at the peak of the noise the line is swapped for a shorter, larger mark, the cloud collapses onto it, the displacement dies out and the mark stands sharp with a soft glow while the box and the HUD corners go.
- **Tier**: T2. **Family**: shape. **Surface**: canvas.
- **Use**: a long line that boils down to one word: a launch line into the product name, a sentence into its keyword, at the end of a film. **Not for**: text the viewer still has to read when it starts moving (the line is legible only for the first 0.26 s); two texts that do not name the same thing.
- **Intent**: A long line boils down to the one word that matters, so the viewer feels the message distilled into the name.
- **Content**: Two texts that name the same thing: a line (≤ 40 chars) and a shorter mark (≤ 16 chars, usually the product name).
- **Parameters**: `from.text` (the line, default "{ Tidewell. Now live }" / "{ Tidewell 正式上线 }"), `to.text` (the mark, default the product name); `size` `{ from: 78, to: 132 }` px, `maxW` `{ from: 1240, to: 1240 }` (both shrink to fit), `box` (override `[x, y, w, h]` of the selection box; default sized from the line), `hud` (true: four corner marks), `seed` (7). Roles: `ground`, `ink` (text, tinted toward `accent` for the bloom), `dim` and `line` (box, hatching, HUD), `accent` (bloom tint, grains).
- **Theory**: loss of form then closure (Wertheimer 1923): the line falls apart into grain the eye can still group, so the cloud reads as the same stuff when it collapses into the shorter word; the swap happens at peak noise where no letter can be read, so the two texts are never seen together.
- **Styles**: any dark or light look with a display face; avoid dossier and exhibit (paper and print do not boil).
- **Length and easing**: 4 beats (3–5). Boil up in-cubic, the swap at the peak, condense in-out-cubic, settle out-cubic; the box opens out-cubic and fades with the settle.
- **Sound**: `turn` at the swap (peak noise), `land` when the mark is sharp.
- **Source**: adapted from video-shotcraft `demos/outro/grain-dissolve/GrainDissolve.tsx` (card `references/shots/outro/grain-dissolve.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (both texts measured and shrunk to `maxW` per language).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the SVG feTurbulence and displacement map are a per-pixel displacement of the two text masks by seeded block noise (a narrower spread, so the grain is finer); the brand line and name are parameters and the box is sized from the line. Compare against `grain-dissolve`: pass, SSIM drop 0.017, box corners 0 px, events 0 frames.
- **Pitfalls**: Both texts must say the same thing; a swap between unrelated words reads as a glitch. The line is unreadable once the boil starts: show it on screen before this move.

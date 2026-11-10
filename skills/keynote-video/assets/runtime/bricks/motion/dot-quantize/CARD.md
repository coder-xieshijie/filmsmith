---
id: dot-quantize
category: motion
tier: T1
family: shape
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### dot-quantize

- **Looks**: a front from the anchor turns the dots behind it into 23 px blocks (half a beat), then the blocks re-sort inside out into the next field's blocks (1.25 beats); blocks that agree never move.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: A picture becoming data: audio to text, a signal to a log, an image to tokens. **Not for**: Films without a halftone field; any cut that should feel soft.
- **Intent**: A signal becomes data before the viewer's eyes: the same picture is reprinted as blocks and re-sorted into the next one.
- **Content**: Two field kinds round the anchor (from, to) on paper or ink.
- **Parameters**: `from`, `to`: field kinds (`rings`, `cross`, `cells`, `count`, `rows`, `wave`, `grid`, `none`); `world` (`paper` | `ink`), `seed`, `dot`; roles `ground`, `ink`.
- **Theory**: Ordered dither and quantisation (Bayer 1973; Ulichney 1987): the same tone printed coarser reads as the same picture turned into data.
- **Styles**: made for `halftone` (recipe the halftone recipe); fits halftone; avoid none.
- **Length and easing**: 2 beats: front 0.5 beat cubic in-out, re-sort 1.25 beats with a lag by distance, each block 0.14 s cubic out.
- **Sound**: `turn` at the start, `tick` as the re-sort lands.
- **Source**: own (`assets/templates/halftone/film.js (paintBoundary quantize, drawBlocks, binOf)`), split from the halftone style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; big words take Noto Sans SC 800 after Bricolage Grotesque; Chinese line spacing 1.18 instead of 1.08; the product name stays Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the halftone template (`assets/templates/halftone/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the halftone recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Blocks that agree must not move; animating every block turns the re-sort into noise.

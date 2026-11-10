---
id: panel-carve
category: motion
tier: T2
family: split-wipe
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### panel-carve

- **Looks**: the subject fills the frame; on three beats, four frames apart, slanted comic seams (12°, a paper core with an onPaper edge, each drawn down in three frames) carve it into three panels. Each panel pops in hard (from 1.07 with a paper flash) with its own framing of the same subject: whole, closer, very close; the last pop throws speed lines. The panels hold with slow pushes; then the last panel's slanted edge pulls back two frames and sweeps across, eating the frame, while its framing slides to the end.
- **Tier**: T2. **Family**: split-wipe. **Surface**: canvas.
- **Use**: one subject from three angles (whole, part, detail); a beat-driven reveal of a product, a chart or a page; the lead into a poster ending. **Not for**: three different subjects that need captions to make sense (use a grid or split scene); calm or minimal films.
- **Intent**: One subject seen from three angles at once, cut in on the beat like comic panels; the layout itself becomes the drum, then resolves into one poster.
- **Content**: Wraps one subject (vector or high-resolution, it is enlarged up to about 2.5×) and three framings of it: whole, closer, one detail; no text of its own (captions are three-angles).
- **Parameters**: `subject` (a painter, full frame; default the sample page), `cams` (three framings `{ fx, fy, cx, cy, s }`: the subject point `f` lands at screen `c` at scale `s`), `eat` true (false holds the three panels), `lines` true (speed lines on the last pop), `dim` 0.72 (how dark the uncut frame goes). Roles read: `ground` (the panels' ground), `accent` (glow, halftone, speed lines), `paper` and `onPaper` (the seams and the flash).
- **Theory**: comic panels set side by side are read as one moment from several angles (closure between panels, McCloud, Understanding Comics); cutting them in on the beat makes the layout the rhythm, and the last panel eating the frame resolves the three into one.
- **Styles**: comic, punchy and dark styles; avoid calm and minimal.
- **Length and easing**: 4 beats with the eat (61 upstream frames), 3 without, from `beatsFor`; 3–5. Pops snappy over 5 frames; holds smooth; the eat 2 frames ease-out back (3 %) then 14 frames snappy.
- **Sound**: three hard hits on the cuts, a whoosh on the eat.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/rhythm/panel-grid-moves/ComicPanelSplit.tsx` (card `references/shots/rhythm/panel-grid-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the subject's painter sets its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the subject is any painter instead of the vector lens (its turning focus ring and closing aperture are the subject's to animate); the captions, the headline and the poster are the scene `three-angles` (the panels' top-left corners are in `track()`); no speed blur on the eating edge, no vignette or grain. Compare (frames 19–79): pass (eating edge and third framing at 0 px, events ±0 frames, SSIM drop 0.04).
- **Pitfalls**: All three panels must show the same subject; three different contents read as a bento layout. On the beat, with a click per panel; off the beat it is just a layout animation. Once per film: the panel language is too recognisable to repeat.

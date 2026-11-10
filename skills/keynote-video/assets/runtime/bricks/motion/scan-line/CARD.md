---
id: scan-line
category: motion
tier: T1
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### scan-line

- **Looks**: `band` (default): a thin bright line of light with a soft glow sweeps a still document top to bottom and back, five passes, each easing in and out with a short pause at the end; a tinted tail trails behind it on the side it came from, stretching with its speed and vanishing at the turns; the light fades in before the first pass and out after the last. `line`: one line crosses the page top to bottom at constant speed, a pale "read" wash and a dot field fading in behind it. `develop`: a vertical accent line sweeps left to right, fast in the middle and easing out, and the real picture develops behind it out of the wireframe; a soft afterglow trails it.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: a product reading, checking or indexing a document or a page; the beat before annotations appear where the line has passed (scenes take `crossAt(y)`); `develop`: a wireframe becoming the real interface (the scene draws the wireframe, e.g. `outline-trace`). **Not for**: loading or progress (use a bar); a light that wanders with intent (`lamp-reveal`); more than one scan a film; dark scenes in `band` mode (the multiplied tail vanishes on dark).
- **Intent**: The viewer sees a machine reading: the document holds still and only the light moves over it, so it reads as "being examined", not loading.
- **Content**: Wraps one still document, page or screenshot and its rect; `line`: the regions to annotate after the line passes (from the scene); `develop`: a wireframe and the real picture behind it.
- **Parameters**: `from` (the scene, default the page; it is not changed; in `develop` the wireframe, default a pale grey proof of `to`), `to` (`develop`: the picture that develops, default the page), `mode` `band` | `line` | `develop`, `rect` [x, y, w, h] (what is scanned, default the frame), `radius` 26 (the clip), `passes` 5, `tail` 328 px (at peak speed), `core` 5 px, `glow` 40 px, `over` [−20, 20] (where the `line` starts above and ends below the rect), `wash` 140 px, `dots` true, `cross` (`line`: `{ frames, at: [f0, f1], fadeIn: [start, frames], fadeOut }` in the brick's own frames, default `{ frames: 86, at: [4, 78], fadeIn: [0, 5], fadeOut: 8 }`), `lineLook` (`line`: `{ core, color, glow: [[blur, alpha], …], reach, behind, band, grid }`: core width 3 px, its colour a role name (`accent`) or a colour, the glow layers in the accent (`[[10, 0.55], [28, 0.3]]`), px past the rect each side with the ends fading (0), what lies behind it `'wash'` | `'grid'` (a band of lit grid fading up to the line) | `'none'`, the band's height 140 px, the grid's fine and major steps `[24, 120]`; null keeps the default look exactly). Exports `lightAt(p, P)` and `crossAt(y, P)` (the progress at which the light first reaches film y; scenes time what reacts to it). Roles read: `accent` (the light; its core lifted toward white), `ground` (under the line when `from` is null), `paper` (the grid's major lines, and the core when `lineLook.color` names it).
- **Theory**: Only the light moves, so the picture reads as being examined rather than loading (figure and ground: the still document is the figure); constant speed is mechanical, without intention, and anything that reacts after the line has passed it reads as caused by it (Michotte, launching).
- **Styles**: any light style, blueprint, dossier; avoid ink and plakat.
- **Length and easing**: `band` 126 frames (8.4 beats at 120 BPM): fade in over 6 frames, five passes over 78 % of the time, each in-out sine over 88 % of its slot; `line` 86 frames (5.7 beats): fade in `out` 5 frames, crossing linear over 74 frames, fade out `exit` 8 frames; `develop` 44 frames (2.9 beats): fade in `out` 6 frames, sweep (0.55, 0, 0.25, 1) over 30, fade out `exit` 8. Range 5–9 beats (`develop` 3); `cross.frames` sets `line`'s length (the assemble look: 102 frames, crossing 8–92, fade in from 3 over 6, out over 10).
- **Sound**: a soft held device cue (`device: { 'scan-line': … }`) under the light, no hit at the turns.
- **Merged from**: `scan-bracket-sweep` (`band`), `scanline-annotate-focus` and `scanline-assemble-flyin` (`line`; the corner brackets are `reticle-lock`, the annotations and docking parts the planned scenes `scan-read` and `blueprint-build`).
- **Source**: adapted from video-shotcraft `demos/effects/scan-bracket-sweep/ScanBracketSweep.tsx` (card `references/shots/effects/scan-bracket-sweep.md`); adapted from video-shotcraft `demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus.tsx` (card `references/shots/effects/scanline-annotate-focus.md`); adapted from video-shotcraft `demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin.tsx` (card `references/shots/effects/scanline-assemble-flyin.md`); `develop` from `demos/ui-entrance/wall-reveal-moves/WireframeDrawOn.tsx` (card `references/shots/ui-entrance/wall-reveal-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the demo documents, page, status row, cursors and the Y readout are the scene's; the corner brackets are `reticle-lock`; the light is the accent instead of indigo or cobalt. Compare (`band` against `scan-bracket-sweep`): pass, track 0 px, progress RMSE 0, events 0. Variant `assemble` (`line` with `cross` and `lineLook`, `compare/pairs-assemble.json`, against `scanline-assemble-flyin`): pass, track 0 px, progress RMSE 0, events ±0 f, SSIM drop 0.061; the lit grid stays inside the rect (upstream it spans the frame) and the page surface brushed in behind the line is the scene's.
- **Don't**: add a glowing scan line to every screen as "AI is thinking": decorative glow lines are a known AI tell; scan only what the film says is being read, once.
- **Pitfalls**: The document must stay perfectly still; if it moves, scanning reads as loading. Clip the light to the document's box and corner radius; a leak loses "scanning this". Anything that reacts must come strictly after the line passes; before reads as pre-staged. On light pages use a deep, saturated scan colour; a pale glow vanishes.

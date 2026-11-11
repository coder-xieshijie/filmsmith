---
id: outline-trace
category: motion
tier: T1
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### outline-trace

- **Looks**: `pen`: four crop marks grow outside the element's corners; a 6 px ink line with a tapering nib (three dashes 6.4, 8, 9.6 px and a round tip with a small drop shadow) runs round the rounded outline clockwise from the top-left, slow–fast–slow; on closing it flashes to black and 11 px for 2 frames, the crop marks spring out and fade, the element's base rises off the paper with a growing shadow, its content inks in top to bottom (each block 14 px up, 6 px blur to sharp, 3 frames apart), and the line fades into the element's own hairline. `comet`: a dimmed element (18 %) gets a glowing head with a 22 % tail that runs once round in 8 frames, leaving a thin accent rim that cools to 40 %; the content lights, lifts 20 px with a small overshoot and a warm pulse across its top. `split`: two hot heads leave the middle of the left edge, one over the top and one under the bottom, and collide in the middle of the right edge with a flash; the element brightens from 12 %.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas (the scene `frame-forerun` puts the same drawing on a plane in 3D).
- **Use**: naming one element before its content is read: the first look at a key result, one cell of a wall coming on, a frame closing round a page. **Not for**: several elements at once (the eye follows one line), elements with no clear rectangular edge, styles whose lines never move.
- **Intent**: Point at one element before its content is read: a line drawn in front of the eye picks it out, and the content arriving as the line closes says 'this is what we talk about next'.
- **Content**: One element with a clear rectangular or rounded edge (a card, a chart, a panel, a page frame) whose content blocks fade in after the close; the brick has no text of its own.
- **Parameters**: `head` `pen` | `comet` | `split`; `rect` [x, y, w, h] and `radius` (the element; default a 1120 × 660 card, 28); `under` (the scene behind, `paint(ctx)`; default a ground with a field of faint dots); `content` (`paint(ctx, rect, ink)`: the element; `ink(k)` is the arrival 0 → 1 of its k-th block for `pen`; default a neutral report card from the sample copy); `marks` true; `shadow` true. Roles read: `ground`, `panel` (the element's base), `ink` (the pen line, nib, hairline), `dim` (crop marks), `accent` (crop-mark dots; the comet and the split frame, mixed with white for their cores).
- **Theory**: an outline drawn in front of the eye is the strongest pointer there is: closure is completed pre-attentively, so the element is chosen before its content is read (Koffka; Treisman's pop-out); handing the line over to the element's own edge keeps a single line from start to end, so nothing new appears at the climax.
- **Styles**: `pen` for paper and editorial looks; `comet` and `split` for dark looks with a glow; avoid on looks with `texture.glow: null` for comet and split (they rely on the glow).
- **Length and easing**: `pen` 5 beats (76 frames at 120 BPM): marks 0–12 `snappy`, trace 10–50 cubic in-out, flash 50–58, ink-in 52–79 `out`, line fade 56–66. `comet` 1.7 beats (26 frames): trace 0–8 cubic out, lift 6–14 `overshoot`, rim cools 12–26. `split` 2.7 beats (40 frames): run 2–22 `swift`, flash 22–30, light 22–40 `smooth`. Range 1.5–6.
- **Sound**: `accent` as the line starts; `land` on the closing flash (pen, split); the comet is silent unless it is the last cell of a wall.
- **Merged from**: `bento-light-up` (head `comet`; the wall itself is the scene `bento-wall`), `neon-frame-forerun` (head `split`; the rest of that shot is the scene `frame-forerun`).
- **Source**: adapted from video-shotcraft `demos/ui-entrance/draw-svg-trace/DrawSvgTrace.tsx` (card `references/shots/ui-entrance/draw-svg-trace.md`); `demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx` (card `references/shots/ui-entrance/wall-reveal-moves.md`); `demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx` (card `references/shots/ui-entrance/neon-frame-forerun.md`) @ `1266a3e`. Exports `rrPoint`, `strokeSpan`, `perimeter`, `leftMid` for scenes.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text of its own; the sample card's copy comes from the sample table).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the report card, energy bars and signature are the sample's `content`, not the brick; the marker underline under the big number is left to the typography batch's `marker-stroke`; the comet is the accent, not amber; the split frame is one accent tube with a white core instead of a violet–pink gradient. Compare: pen pass (nib track 0 px, events ±0); comet (dry run) 20 px on the lift.
- **Pitfalls**: Outline one element per call-out; several outlines queued on one screen read as a loading animation. The line's path must match the element's real corner radius, or the hand-over to its edge visibly jumps. Do not fade the content in before the line closes; the cause, drawn then filled, breaks. Use one whole-wall outline light-up per film (this or a blueprint wireframe draw, not both).

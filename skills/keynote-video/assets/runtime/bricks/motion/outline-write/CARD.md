---
id: outline-write
category: motion
tier: T1
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### outline-write

- **Looks**: A still ground; every letter of a widely spaced wordmark starts drawing its outline on the same frame, as if one hand wrote them all at once: each contour grows from its start as a continuous thin line, slow at the pen-down, quicker in the middle, easing into the pen-up; over the last third the line gathers a soft glow, every letter closes on the same frame, and the glow falls away. Only the outer edge of each glyph is drawn, so overlapping contours inside a glyph never show. With `fill`, a heavier face fills solid as the line closes.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: a quiet wordmark or chapter title at the start or end of a film: a name that should feel composed rather than announced. **Not for**: body text or anything read for content; a busy ground behind the line; energetic openings (it is one slow breath).
- **Intent**: Let a name feel composed rather than announced: one invisible hand writes every letter at once, so the word arrives as one calm act.
- **Content**: One wordmark or chapter title, a short word or name (en about 4–12 letters, zh 2–6 chars) set with wide tracking; optional solid fill at the close.
- **Parameters**: `text` (default the sample product name; zh "每周回顾"), `size` (en 170, zh 150), `weight` 500, `track` (letter gap in em: en 0.3, zh 0.36), `width` 3 px (visible line), `y` (baseline; null centres the ink), `fill` false, `glow` 1. Roles read: `ground`, `ink` (the line, its glow, the fill).
- **Theory**: One hand writing every letter at once reads as one act, not a sequence: a shared start and finish group the letters by common fate (Wertheimer 1923); a continuous line reads as being drawn (a trace implies its maker, Leyton 1992), where a mask uncovering in pieces is read through.
- **Styles**: any; best on calm grounds (gradients, photographs held still, the afterglow look); not plakat or pulse (their type is the slam, not the line).
- **Length and easing**: 4.4 beats (66 frames at 120 BPM), 3–6; the line on (0.5, 0, 0.3, 1) over 52 frames, the glow rising on `swift` over its last 30 % and falling on `out` over 14 frames; the fill on `out` from 85 % of the line.
- **Sound**: a soft `accent` on the closing frame, or none; never a whoosh.
- **Source**: adapted from video-shotcraft `demos/opening/letterspace-materialize/LetterspaceMaterialize.tsx` (card `references/shots/opening/letterspace-materialize.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (a character's many short contours all start at once, so Chinese fills in faster at first and closes on the same frame).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the letters are the font's own glyphs drawn as outlines, not hand-drawn single-line skeletons (the upstream drew 13 skeleton letters that only spell its brand; a font has no centre lines); all contours of a glyph grow at once, each glyph's dash normalised to its longest contour, where the upstream draws a glyph's strokes one after another; the dusk lake, ridges, glints and reflection are the scene's. Compare against `letterspace-materialize` on the line's progress: pass (track 0, RMSE 0, events 0).
- **Pitfalls**: Every letter must start and finish on the same frame; staggering them turns the ceremony into a typewriter. The line must grow continuously; a mask uncovering it in pieces is seen through. Keep the ground behind the line quiet; a 3 px line is lost over a busy picture.

---
id: clone-echo
category: motion
tier: T1
family: zoom-depth
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### clone-echo

- **Looks**: the element (a 660 × 420 card by default) presses 4 %, then seven clones spring out of it 2.2 frames apart into depth, each 250 px further back and 58 px further left toward a vanishing point up left (360, 120), fading from full to 28 % and losing their fill to keep only an accent outline, the farther ones a little blurred; a soft accent flash marks each birth. The file holds about a second while the camera dollies in 2 % and the file drifts; then every clone rushes back at once (a 10-frame ease-in, blurred by its depth speed), and the element pulses to 1.06 with one accent rim, its slots lighting as the copies merge. An optional ×N counter bottom left rolls one place per clone and punches on the merge.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas (each clone is parallel to the screen, so the perspective is an exact scale about the vanishing point).
- **Use**: "one is many": the same thing multiplied (outputs, tenants, runs, regions), then shown to be one. **Not for**: different items; a static depth display; light grounds without a glow.
- **Intent**: Make 'one is many' visible: the viewer counts the copies of one thing, then watches them fold back into it, so scale reads as a property of a single product.
- **Content**: One element (a card, a render, a window) painted once; each clone repeats it with only the outline and one line. Optional ×N counter with a one-line label (≤ 24 chars).
- **Parameters**: `rect` [x, y, w, h] (default 1130, 352, 660, 420); `clones` 7 (5–9: fewer do not read as a file, more blur into one); `vp` [x, y] the vanishing point (keep it in a corner: in the centre the clones hide behind the element); `under` (the scene behind, `paint(ctx)`; default a dark stage); `content` (`paint(ctx, rect, { clone, n, lit })`: clone 0 is the element, clone i its i-th copy, which should keep only the outline and one line of the content; `lit` 0 → 1 as the copies merge; default a neutral render card from the sample copy); `counter` true; `label` (the counter's line; default the second KPI's label). Roles read: `ground`, `panel` (the card face), `ink`, `dim`, `accent` (outlines, glow, line, counter), `onAccent`.
- **Theory**: identical copies at equal steps are read as one thing multiplied (Gestalt similarity and common fate); their return into one body says the many are the same; the asymmetric rhythm (staggered out, together back) separates copying from gathering, and the bounce on merging gives the element mass.
- **Styles**: dark looks with an accent glow; avoid strip and split.
- **Length and easing**: 6.4 beats (96 frames at 120 BPM, upstream frames 16–112): press 0–8 `swift`; clones spread 8–24 (springs, damping 15, one light overshoot); hold to 60 with a `smooth` dolly 24–64; rush back 60–70 `exit`; pulse and rim 70–86; slots light 69–74. Range 5–8.
- **Sound**: a string of light ticks as the clones spread, a rising whoosh on the rush back, one solid `land` on the merge (beat 4.7).
- **Source**: adapted from video-shotcraft `demos/ui-entrance/cloner-depth-echo/ClonerDepthEcho.tsx` (card `references/shots/ui-entrance/cloner-depth-echo.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick's own text is the counter's line; the sample card's copy comes from the sample table).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the motion starts with the element in place (the upstream's 16-frame entry and its title are the scene's); the render card, mark, file name, readout and shot names are the sample's `content`; dust and grain are dropped. Compare: pass (farthest and third clones, 0 px, events ±0).
- **Pitfalls**: Keep the copy-and-return: a file of clones that only sits there reads as a static depth display and loses the point. The clones must repeat the same content; different items in the file read as a stack, not as scale. Keep the vanishing point in a corner; in the centre the clones hide behind the element. On a light ground without the accent glow the faded clones read as smudges.

---
id: dimension-line
category: motion
tier: T1
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### dimension-line

- **Looks**: a 4 px pencil line, offset 44 px to the side that stays inside the print, 14 px ticks across both ends, dashed 2 px drops to the two points; a chip of label stock with the difference (44 px) at its middle; the print outside the span veiled 45 % of the ground.
- **Tier**: T1. **Family**: line-path. **Surface**: canvas.
- **Use**: The gap between two values on one chart or table, measured on the asset’s own axis. **Not for**: Values on different prints; a gap that is not on an axis.
- **Intent**: Measure the gap on the evidence itself, so the difference is seen, not asserted.
- **Content**: Two points on the print (file px) and their two values; a label pattern (`{diff}`, `{ratio}`).
- **Parameters**: `a` { point, value }, `b` { point, value }, `label` (`{diff}` | `{ratio}` in a pattern), `digits`
- **Theory**: A measured gap is read as a quantity only when its ends are marked on the evidence itself (Tufte 1983, data-ink on the data); computing the label keeps it honest.
- **Styles**: made for `exhibit` (recipe the exhibit recipe); fits exhibit, any launch argued from published evidence; avoid tally, phosphor.
- **Length and easing**: 2 beats: the line from 0.5 beat over 1.5 (cubic in-out), the chip settling in the last 0.2 beat, the veil over 0.5 beat round the landing.
- **Sound**: four rising ticks under the line, an impact, a rolled chime and a duck on the landing.
- **Source**: own (`assets/templates/exhibit/film.js (measureGeom, measures, measureVeil), choreo.js (measure)`), split from the exhibit style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; the label is a computed number with a short unit; Chinese units stay short (倍, 分).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the exhibit template (`assets/templates/exhibit/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the exhibit recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); real captures and frames are slots (the neutral placeholder without them), not content.js's asset table; the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Compute the label from the two values; never type it.

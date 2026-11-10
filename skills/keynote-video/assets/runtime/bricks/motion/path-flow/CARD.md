---
id: path-flow
category: motion
tier: T0
family: line-path
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### path-flow

- **Looks**: `line`: four thin lines draw on from their sources one after another (each 0.17 of the length, 0.045 apart), graded from a pale grey at the source to near-black at the sink; accent packets with a nine-dot comet tail run along them toward the sink, two whole cycles, each path a little behind the last; the packets fade out before the end; with `erase` the lines then wipe from the source end. `tube`: glowing accent tubes (a wide soft glow, a mid glow, the tube and a white core) grow from the sources with a spark at the head, then carry white pulses at a fixed spacing and speed (74 px apart, 4.6 px a frame) that breathe a little and fade out at the end.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: several things feeding one: integrations, data sources, the inputs of a pipeline, links of an architecture drawing. **Not for**: one connection (use `tether-link`); paths that cross many times.
- **Intent**: Turn 'these sources feed one place' into a visible process: paths connect, then packets travel toward the sink, so the direction of flow reads without a label.
- **Content**: 2–6 sources and one sink placed by the scene (nodes, icons and labels belong to the scene); the brick draws only the paths and the packets.
- **Parameters**: `look` `line` | `tube`; `paths` (a list of segment lists in film px: `['M', x, y]`, `['L', x, y]`, `['Q', cx, cy, x, y]`, `['C', c1x, c1y, c2x, c2y, x, y]`; default the four sample curves into one sink, or the five hub pipes for `tube`); `under` (the scene behind); `erase` false; `stagger` 0.045. Roles read: `ground`, `dim` → `ink` (the line grade), `accent` (packets, tubes; mixed with white for the cores).
- **Theory**: motion along a line is read as flow in that direction (Michotte's launching and entraining effects); a packet stream makes an abstract connection concrete without a label, and the grade from light to dark says which end is the destination before any packet arrives.
- **Styles**: `line` for light, diagram-like looks (teach-video's diagrams); `tube` for dark looks with a glow.
- **Length and easing**: `line` 11.2 beats (168 frames at 120 BPM): draws 0.04–0.38 `out` (quad), packets 0.10–0.74 linear, two cycles, erase 0.78–0.90 `out`; `tube` 5.9 beats (88 frames): grow 10–19 `out`, flow from 19, fade 76–88. Range 4–12.
- **Sound**: `accent` as the first path starts; none per packet (a constant flow should be heard as the bed, not as ticks).
- **Merged from**: `integration-hub-map` (look `tube`; the hub, its sources and the page flip are elsewhere: scene `hub-links`, hand-off `device-flip`).
- **Source**: adapted from video-shotcraft `demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge.tsx` (card `references/shots/ui-entrance/bezier-source-converge-merge.md`) and `demos/ui-entrance/integration-hub-map/IntegrationHubMap.tsx` (card `references/shots/ui-entrance/integration-hub-map.md`) @ `1266a3e`. Exports `pathGeom`, `subPath`, `drawLine`, `drawPacket`, `drawTube`, `drawPulse`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the tube is one accent instead of a yellow–pink–violet–cyan rainbow with per-pipe tints; the source nodes and the sink belong to the scene. Compare: line pass (packet track 0 px, events ±0, frames 0–125).
- **Pitfalls**: Keep the accent for the packets; colouring the source nodes takes the subject away from the sink. In the tube look connect all tubes at once; one-by-one connections read as separate negotiations. A sink with an open-shaped mark needs an opaque disc behind it, or line ends show through the gap. Paths that cross many times stop reading as flow.

---
id: tape-run
category: motion
tier: T2
family: vertical
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### tape-run

- **Looks**: a tall scale tape runs the full height of the frame, fading out at top and bottom, behind a fixed reading window and pointer at the frame's centre line; the tape crawls up (slowing) until the reading stops just under a dashed "previous cap" line; the cap line splits and fades; the tape winds back a little, then sprints (the ticks streak, the reading blurs) and brakes on a spring past the new value and back, the new cap's accent marker parking exactly in the pointer; the claim (×3 by default, computed) rises beside the title and a mono recap (140k → 420k) fades in.
- **Tier**: T2. **Family**: vertical. **Surface**: canvas.
- **Use**: one metric that jumps (a limit raised, throughput multiplied): the size of the jump becomes distance and speed. **Not for**: small changes (the sprint has nothing to cover); several metrics at once (use `needle-sweep`).
- **Intent**: The size of the jump becomes distance and speed: the viewer feels how far the value went before reading the new number.
- **Content**: One metric with its start, old cap and new value (the new several times the cap), a unit, a title (≤ 30 chars) and two cap labels (≤ 16 chars each); the claim is computed.
- **Parameters**: `start` 60, `cap` 140, `end` 420, `unit` "k", `overshoot` 24 units, `swing` 4 units (the spring's swing back below the end sets its damping), `pxPerUnit` 5, `tick` 10, `major` 50; `title`, `note`, `capLabels` [previous, new], `claim` (null: × end / cap), `recap` true. Derived: the crawl stops 18 units under the cap, winds back 5. Roles read: `panel`, `line` (tape), `ink` (ticks, numbers, title), `dim` (old cap, recap, note), `accent` (window, pointer, new cap, claim), `onAccent` (the reading).
- **Theory**: the airspeed tape of a flight display: a fixed pointer over a moving scale turns the size of a change into distance travelled, so a big jump is felt as speed; the overshoot and swing back are a mechanical stop (follow-through), and stillness after speed holds attention (Abrams & Christ 2003).
- **Styles**: any; avoid ink and halftone.
- **Length and easing**: 7 beats (105 frames), 6–8. Crawl `swift` frames 10–48, hold to 56 (the cap breaks at 52 over 14), wind back `smooth` 56–61, sprint (0.55, 0, 0.25, 1) 61–83, spring (stiffness 140) to 110; claim 96–108 `snappy`, recap 102–113. Motion blur from the tape's speed during the sprint.
- **Sound**: a low rolling bed under the crawl, a rising `whoosh` with the sprint, a dull `land` on the brake.
- **Source**: adapted from video-shotcraft `demos/data/gauge-readout-moves/TapeScrollFixedPointer.tsx` (card `references/shots/data/gauge-readout-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the conclusion (claim, recap) lands inside the move, by frame 113, instead of at 98–130 with the chip; the slow push of the hold is the style's; values and every stop are parameters. Compare against `tape-scroll-fixed-pointer`: pass, reading 0 px, new-cap marker 6.6 px, events 0 frames.
- **Pitfalls**: Only for a jump of several times; a small change has nothing for the sprint to cover. Hold the tape dead still after the spring settles; any drift reads as a bug.

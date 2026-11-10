---
id: dial-sweep
category: motion
tier: T2
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### dial-sweep

- **Looks**: numbers stand round a huge dial whose arc fills the lower frame, with ticks that turn with it; the dial winds back 3°, then sweeps 99° and stops dead with one small overshoot. The number that stopped at the top flies down and grows into the first figure of a title while the other numbers and ticks blur away; the title's words rise in after it, the last one turning to the accent.
- **Tier**: T2. **Family**: shape. **Surface**: canvas.
- **Use**: a small number that is the claim, reached by sweeping down from bigger ones (5 min to install, 2 steps, 1 click): a countdown that resolves into the title. **Not for**: numbers without a scale (an id, a version); dark grounds (the dial is tuned for paper and its blur greys on dark); more than once a film (it is a hard stop).
- **Intent**: The number is shown inside a range, sweeping from many down to few, so it argues for itself; then the same figure becomes the title.
- **Content**: 5–9 numbers of the same kind (≤ 3 chars each) with the answer among them, and the rest of the title after the figure (≤ 16 chars).
- **Parameters**: `from` the dial at rest, `to` the title with the answer as its first figure. `nums` (the numbers round the dial, default `['30', '20', '15', '10', '5', '2', '1']`), `hero` 5 (the index that wins), `rest` (the title after the figure, en `"min to ship"`, zh `"分钟发布"`), `accentLast` true, `ticks` true. Roles read: `ink` (numbers, title), `line` (arc, ticks), `accent` (last word).
- **Theory**: the dial makes a number a measurement: the sweep searches and the stop decides (expectation and resolution, Huron 2006); the answer keeps its identity as it becomes text (object constancy).
- **Styles**: any with a free composition; avoid strip and split.
- **Length and easing**: 5.5 beats, 5–6. Wind-up 5 f `EASE.swift`; sweep a closed-form spring (damping 12, stiffness 60, settled by 65 f); the answer's flight from 32 f over 20 f `EASE.swift`; the others out from 28 f over 16 f with 10 px blur; title words from 42 f, 4 f apart, 14 f `EASE.out`; accent tint from 64 f over 12 f.
- **Sound**: `turn` at the sweep, `land` at the stop, `land` again as the title settles.
- **Source**: adapted from video-shotcraft `demos/typography/countdown-arc-scatter/CountdownArcScatter.tsx` (card `references/shots/typography/countdown-arc-scatter.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: the title after the figure is set in Chinese phrases; the answer's slot is the measured width of the figure, so it fits either language.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no wordmark, label, install command or backdrop; the springs are closed-form and exact at rest; the answer's slot is measured instead of a fixed 0.6 em. Compare: pass (the number before the answer 8.3 px, the answer 16.8 px at the title slot, which is measured here; progress RMSE 0.005, events 0).
- **Pitfalls**: Numbers on the dial must share one size and weight; mixed sizes read as a chart, not a dial. The answer must stop exactly at the top of the arc; changing the list changes which index lands there. The stop and the landing are a few frames apart: give them two different short sounds, or they blur into one.

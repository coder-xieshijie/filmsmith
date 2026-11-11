---
id: axis-rescale
category: motion
tier: T2
family: vertical
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### axis-rescale

- **Looks**: a full-frame line chart (hatched area, ink line with dotted points, a ceiling rule at the top of the y range) under a big title and a year total in the corner; the ceiling and its top tick warn in the accent and the latest point pulses; the newest segment shoots up in the accent, faster and faster, cracks the ceiling (a ring, two shards, the chart shakes 10 px) and pierces into the title band, nudging the total; it hangs half a beat glowing; then the y axis rescales: the old ticks drop out, new ones slide in, the grid doubles, the history flattens towards the baseline, and the point falls back to its true height, where a marker, a ripple and a value label ("340k", "▲ 372% vs Nov") pop while the total counts up and turns to the accent.
- **Tier**: T2. **Family**: vertical. **Surface**: canvas.
- **Use**: one growth number that is the claim (a jump of several times), shown on the chart people already trust. **Not for**: ordinary growth (the drama then lies about the size); twice in a film; charts without a y axis.
- **Intent**: The growth is too big for the chart, so the viewer feels the size of the jump before reading the number; the rescale then keeps the chart honest.
- **Content**: A time series of 6–12 points whose newest value is several times the old maximum, with the old and new y range, a unit, x labels (≤ 4 chars each), a title (≤ 30 chars) and a total label.
- **Parameters**: `data` (the history then the new value), `range` [old max, new max], `unit` "k", `labels` (x labels), `title`, `total` (its label), `note`, `change` (a function of percent and previous label, or a string), `write` false (true: the history is written on first). The total, the ticks and the change are computed from `data` and `range`. Roles read: `ink` (line, area hatch, ticks, title), `dim` (labels), `line`, `accent` (the warning, the new segment, marker, label, the updated total), `onAccent` (label text).
- **Theory**: the chart's frame is a promise of scale; breaking it makes "off the charts" literal, so the size of the change is felt before it is read (expectancy violation); the rescale restores truthful proportions in the same frame (Cleveland & McGill 1984), so the drama never lies about the data.
- **Styles**: any; avoid ink and halftone. Once a film.
- **Length and easing**: 5 beats (75 frames), 7.7 with `write`. Warning from the first frame (10 frames), shock 62–76 on (0.7, 0, 0.36, 1.06), hang to 94, rescale 94–108 `snappy` (ticks 2 frames apart), marker at 106 (overshoot), label at 110, total 108–128.
- **Sound**: a `whoosh` riser with the shock, an impact (`land`) on the crack, a sweep on the rescale, `accent` on the label.
- **Source**: adapted from video-shotcraft `demos/data/chart-live-moves/AxisRescaleShockV2.tsx` (card `references/shots/data/chart-live-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (labels, the change line "比11月 ▲ 372%").
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: starts on the drawn chart (upstream frame 53) and the warning starts there, 3 frames later than upstream; the slow push over the whole shot is the style's. Compare against `axis-rescale-shock`: pass, newest point within 11.6 px (the missing push), events 0 frames.
- **Pitfalls**: The break and the rescale happen once a film; repeated, they cheapen the claim. Use real axes, labels and copy at film size (labels ≥ 32 px); grey placeholder bars cannot carry a data story. Only for a jump of several times: on ordinary growth the drama lies about the data.

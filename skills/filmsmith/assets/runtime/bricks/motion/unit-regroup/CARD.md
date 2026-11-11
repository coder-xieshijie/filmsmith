---
id: unit-regroup
category: motion
tier: T2
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### unit-regroup

- **Looks**: a crowd of small dots, one per unit, drifting; leg by leg they migrate on staggered springs (each dot stretches into a capsule along its path and rounds again when it stops): into a tight sunflower cluster per group with its name and value above, into a column per group stacked eight wide on a baseline with the value on top and the name under it, and into the digits of the total, sweeping in from the left and taking the accent as they land, with a legend of the groups and what one dot is. A headline changes with every leg.
- **Tier**: T2. **Family**: shape. **Surface**: canvas.
- **Use**: a count whose parts matter (who, which kind) told as one continuous picture: crowd, groups, comparison, total. **Not for**: quantities that are not counts (money, time, percentages); more than about 400 units.
- **Intent**: Every dot is one real item, so the viewer can follow one dot from the crowd into its group and into the total, and believes the chart and the number are the same things.
- **Content**: 2–4 groups, each with a count and a name (≤ 14 chars); what one dot stands for; a headline per layout (≤ 30 chars); the total is computed.
- **Parameters**: `groups` [{ `count` (dots), `name` }], `hero` 1 (the group in the accent), `per` 40 (units a dot stands for; every value shown is count × per), `figure` (null: the grouped total), `layouts` ['scatter', 'clusters', 'columns', 'figure'] (any order; one leg each), `heads` (a line per layout, or null), `legend`, `centers` [520, 1000, 1420], `seed`. Roles read: `accent` (the protagonist group, every dot in the total), `ink` and `dim` mixed (the other groups), `dim` (labels), `ground`.
- **Theory**: unit charts keep the count literal (one mark, one item; Neurath's isotype), and a migration that never adds or drops a mark shows the chart and the total are the same items (object constancy, Heer & Robertson 2007); stretch along the motion records speed (Geisler 1999).
- **Styles**: any; the tally style already does this inside its template (one square per item), so use it there only through tally's own scenes.
- **Length and easing**: 2.5 beats a leg (7.5 for the default three legs); each dot on a spring (stiffness 150, damping 13, mass 0.8) time-scaled to 24 frames; stagger: random up to 8 frames into clusters, by row (bottom first) into columns, by x into the figure.
- **Sound**: a `whoosh` per leg; a soft `land` as the total completes.
- **Source**: adapted from video-shotcraft `demos/data/chart-live-moves/UnitDotSwarmRegroupV2.tsx` (card `references/shots/data/chart-live-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the digits are the same; headlines, names and legend through `lang.js`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the digits are sampled from the display font (any total), not a hand-drawn skeleton; legs on a 2.5-beat grid; jitter from the runtime's seeded hash; the opening pop-in is the scene's and the push is the style's. Compare against `unit-dot-swarm-regroup` (clusters → columns, frames 57–99): waived on track deviation (40.7 px) and progress (0.039): the legs and jitter are up to one frame off at 45–65 px a frame, while start, peak and settle are within 1 frame.
- **Pitfalls**: Use real labels and axes at film size; placeholder data cannot carry the story. Never add or drop a dot between layouts, or the "same items" promise breaks. With another live-chart move in the same film, use each once and in different sections.

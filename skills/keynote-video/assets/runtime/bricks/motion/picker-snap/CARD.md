---
id: picker-snap
category: motion
tier: T0
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### picker-snap

- **Looks**: A vertical picker: the focus pill stays still and the list moves through it one item a step; each step is a strong ease-out snap followed by a true still. Distance from the focus sets opacity (1, 0.55, 0.18), size and grey; only the focused row shows its icon; the pill breathes once (1 → 1.06 → 1) when an item lands; the list fades out at the viewport's edges.
- **Tier**: T0. **Family**: vertical. **Surface**: canvas.
- **Use**: cycling through a set of features, modes or options one at a time, each held long enough to read. **Not for**: more than about seven items; showing all items at once (a grid or a list); a free scroll.
- **Intent**: Choosing is made physical: the content is caught by a fixed focus and truly stops, so each stop reads as "this one is picked".
- **Content**: 3–7 short items (≤ 24 chars each, one line), optionally with an icon each; the number of steps to show.
- **Parameters**: `items` (the list, default the sample cards' titles), `steps` 5, `startAt` 0, `cx`, `cy` [960, 540] (the pill's centre), `badge` true (a neutral badge on the focused row), `glyphs` (neutral icons by default). Exports `pickerPos(f, P)`. Roles read: `panel`, `line` (the pill), `ink` (the focused row), `dim` (neighbours), `accent` (the icon).
- **Theory**: A fixed frame with moving content is the slot machine and drum picker: the stop, not the scroll, says "this one"; depth by distance keeps the eye on the centre (Ware, Information Visualization, on preattentive size and lightness).
- **Styles**: any.
- **Length and easing**: 19.26 frames a step (quint-out over 9/14 of it, still for 5/14); 6.42 beats for five steps, about 1.3 beats a step.
- **Sound**: `accent` on each landing (a soft detent click).
- **Source**: adapted from video-shotcraft `demos/interaction/picker-carousel-feature-cycle/PickerCarouselFeatureCycle.tsx` (card `references/shots/interaction/picker-carousel-feature-cycle.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: drawn at film size (the 480 × 270 design × 4); feature names, icons and the app mark are the film's items and neutral glyphs; the list is drawn sharp (the upstream's speed blur is under 1 px). Compare against `picker-carousel-feature-cycle`: pass, 0 px, events ±0.
- **Pitfalls**: Every step must come to a true still for a few frames; continuous scrolling reads as a loading animation. The focus pill must never move (its breath scales in place), or "content passing through the focus" is lost. Keep each item on one line (under about 300 px at design size); shrink the type rather than wrap.

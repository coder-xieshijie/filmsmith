---
id: quad-montage
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### quad-montage

- **Purpose**: four things at once: four bricks play side by side in a hard 2 × 2 grid, started a few frames apart, then hold as one poster of four.
- **Intent**: Information overload on purpose: four things happen at once and some quarter moves every few frames, so the viewer feels how much the product does.
- **Content**: Exactly four bricks that read at quarter size, each with a short label (≤ 14 chars, Chinese ≤ 6 characters), a start frame and a tone.
- **Fits**: `demo`, `proof`. **Not for**: bricks that need the full frame to read, more or fewer than four things, a calm section.
- **Layout and camera**: four 960 × 540 cells with no gutters; each cell runs its brick at half scale in its own buffer with its own role remap (`tone`: ground, panel, ink or accent), so neighbours differ in tone; a label chip at each cell's top left. No camera move.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | quads[].brick | brick | – | 4 | – | – | card-portal, digit-roll, slam-drop, type-enter |
  | quads[].label | text | glance | 4, optional | 2 words, 14 | 6 | Open, Count, Land, Title |
  | quads[].at | number (frames) | – | 4 | – | – | 0, 8, 16, 4 |
  | quads[].tone | role | – | 4 | – | – | ground, ink, accent, panel |

- **Length**: 4–10 beats (2–5 s): the latest cell's end plus a hold.
- **Steps and events**: each cell's start is a T1 cue; starts must be at least 3 frames apart (validate), so the four arrive as a ripple, not at once; the hold is the poster.
- **Needs**: whatever the four bricks need; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `text` for the chips.
- **Sound**: `accent` on each start; the cells' own events are not sounded (four at once is noise).
- **How not to look like a screen recording or a string of effects**: pick four bricks of one kind of motion (all reveals, or all counts), not four different effects; the type in each cell must still clear the floor at half scale, so prefer one-word or one-number bricks.
- **Styles**: any; avoid `strip`.
- **Source**: adapted from video-shotcraft `demos/rhythm/quad-split-parallel-scenes/QuadSplitParallelScenes.tsx` (card `references/shots/rhythm/quad-split-parallel-scenes.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the four fixed demo scenes become any four bricks; colours by role per cell. Compare waived (the cells hold any brick, so nothing pairs with the upstream's scenes; each cell's brick has its own compare).
- **Pitfalls**: Stagger the starts so no two quarters hit a heavy event on the same frame; four at once is the usual failure. About 2 s of bombardment is the limit; longer needs a second event per quarter.

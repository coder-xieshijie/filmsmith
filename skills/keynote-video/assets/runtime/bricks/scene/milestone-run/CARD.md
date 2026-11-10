---
id: milestone-run
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### milestone-run

- **Purpose**: tells a history as speed: the milestones flash past and the film stops on the one that matters now.
- **Intent**: Tell a history as speed: past versions flash by like scenery, and the hard stop on today says 'this is what matters now'.
- **Content**: 3–5 milestones, each a label (en ≤ 6 chars, zh ≤ 3), a date (en ≤ 8, zh ≤ 5), a title (en ≤ 18, zh ≤ 8), a two-line description (en ≤ 40, zh ≤ 20) and a metric (en ≤ 20, zh ≤ 8); an eyebrow and a headline (en ≤ 32, zh ≤ 14).
- **Fits**: `proof`, `demo`, `turn`. **Not for**: histories the viewer must read item by item (only the last two cards are readable); more than five milestones.
- **Layout and camera**: a horizontal axis at y 700 with a milestone tick every 1400 px and minor ticks between (the speed reference); each milestone's label and date under its tick, a 400 × 260 card on a stem above it; a fixed header (eyebrow, headline) top left; each milestone's date huge and faint behind, at 0.35× the speed. Camera: rests on the first tick, starts slow (15 % of the time for 5.5 % of the way), sprints, brakes in the last 12 % onto the last tick (frames 12–104 at 120 BPM), then pushes in 1.28× over 10 frames towards the axis.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `eyebrow` | text | glance | 1 | 4 words / 28 chars | 10 chars | "Milestones · illustrative" |
  | `headline` | text | primary, claim | 1 | 6 words / 32 chars | 14 chars | "A new version every two months" |
  | `stops[].label` | text | glance | 3–5 | 1 word / 6 chars | 3 chars | v1, v2, v3, Today |
  | `stops[].date` | text | glance | 3–5 | 2 words / 8 chars | 5 chars | Mar … Sep |
  | `stops[].title` | text | primary | 3–5 | 3 words / 18 chars | 8 chars | illustrative |
  | `stops[].desc` | text | glance | 3–5 | 8 words / 40 chars | 20 chars | illustrative (two lines) |
  | `stops[].metric` | text | glance | 3–5 | 3 words / 20 chars | 8 chars | illustrative |

- **Length**: 8–12 beats (4–6 s at 120 BPM): the travel and push take 6.5 beats to the last card standing, then the last title's reading time.
- **Steps and events**: each card springs up from its tick (stiffness 160, damping 11, time-scaled to 26 frames, a clear overshoot) 6 frames before the camera reaches it, the node lighting with it (T0 each); the brake on the last tick and the push are the peak (T2); the last card holds for its read.
- **Needs**: no other bricks (the travel curve is inline until camera-truck has its `travel` variant); roles `ground`, `panel`, `line`, `ink`, `dim`, `accent` (the last milestone), `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `accent` (a light tick) per card, `land` on the brake.
- **Styles**: any with a light editorial feel; avoid dossier and strip (their own materials carry history). **Source**: adapted from video-shotcraft `demos/data/timeline-travel/TimelineTravel.tsx` (card `references/shots/data/timeline-travel.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (card text wrapped by `lang.js`; card text at 25 / 28 px). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: cards are 400 × 260 (upstream 360 × 240) so their text meets the information floors; the far labels are the dates; motion blur is the runtime's sub-frames from the axis speed, so cards smear more in the sprint than upstream's capped blur. Compare against `timeline-travel`: pass, ticks 0 px, events 0 frames.
- **Pitfalls**: Leave at least a second still after the brake; plan the end first and work the travel backwards. Only the last two cards are read; put the milestone that matters last and keep the earlier ones glanceable.
- **Sample**: `poster.jpg`, an English still 480 px wide.

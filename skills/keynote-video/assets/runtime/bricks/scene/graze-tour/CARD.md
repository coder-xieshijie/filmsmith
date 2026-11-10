---
id: graze-tour
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### graze-tour

- **Purpose**: show the product's interface as a place: the camera grazes its surface and the page's words land as it passes.
- **Intent**: The interface as a landscape: the camera skims its surface and the page completes itself as it passes, so the viewer feels inside the product's world.
- **Content**: Product name, a section name, 6–10 tree items and 3–5 tabs (≤ 14 chars, Chinese ≤ 5 characters), a title and subtitle, 4–6 list rows; none of it is read closely.
- **Fits**: `demo`, `hook`. **Not for**: interfaces that must be read, a single feature, films that stay flat.
- **Layout and camera**: three 2900 × 2400 pages (a side tree, a top bar with a title, a list) as CSS 3D planes tilted almost edge-on (rx 12–20°, ry ±20–30°, a roll of ±6° drifting by 2°); each leg lasts 50 frames on a cruise curve (eased first and last thirds, constant speed between) and cross-fades into the next over 7 frames; a neon edge in the accent runs along one side, drifting accent frames sit behind, the far end of each plane darkens.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | product | text | glance | 1 | 2 words, 14 | 8 | Tidewell |
  | section | text | glance | 1 | 1 word, 10 | 4 | Spaces |
  | tree | list of text | glance | 6–10 | 3 words, 14 | 5 | Drafts, Reviews … |
  | tabs | list of text | glance | 3–5 | 1 word, 10 | 4 | Overview, Projects … |
  | title | text | primary | 1 | 3 words, 16 | 6 | Good morning |
  | subtitle | text | glance | 1 | 7 words, 32 | 16 | 6 projects · 2 rendered today |
  | rows[].name / meta | text | glance | 4–6 | 3 words, 14 / 10 | 5 / 6 | Drafts / 12 items |

- **Length**: 10 beats (5 s, fixed).
- **Steps and events**: frames 0, 50, 100 each leg starts (accent, turn, turn); within each leg the pieces land in the order the camera passes them (float-land: lift 130 px, first at 0.22, span 0.62, fall 0.34).
- **Needs**: motion `float-land`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`.
- **Sound**: a long `turn` (whoosh) per leg; no per-word sounds.
- **How not to look like a screen recording or a string of effects**: never let the camera square up to the page or stop: it is a fly-over, not a read; keep the copy short and real (titles, names) so it lands as words, and put the one sentence to read in the next scene.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/camera/graze-face-tour/GrazeFaceTour.tsx` (card `references/shots/camera/graze-face-tour.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: pages laid out anew from slots; icons are role marks; depth-of-field blur and grain left out (the far end darkens). Compare waived (no element pairs with the upstream page; the camera numbers are the upstream's and float-land's compare passes).
- **Pitfalls**: Lift the hovering words (~1.3× brightness) so they are not swallowed by the dark; without visible hover the landing is lost. Not in the same section as perspective-glide: there the page moves, here the camera does.

---
id: space-steps
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### space-steps

- **Purpose**: tell three steps as three places in one space: the camera visits each chapter, then pulls back to show the whole.
- **Intent**: Three steps told as three places in one space: each chapter gets its own angle, and the pull-back at the end shows how they make one whole.
- **Content**: Three chapters, each a kicker (≤ 14 chars, Chinese ≤ 6 characters), a one-word title (≤ 9 chars, Chinese ≤ 4) and a line (≤ 40 chars, Chinese ≤ 14); a closing headline (≤ 20 chars, Chinese ≤ 8).
- **Fits**: `demo`, `turn`, `lockup`. **Not for**: more or fewer than three steps, chapters that need more than a title and a line, a camera that should stay still.
- **Layout and camera**: three 1240 × 700 cards hang in 3D (pose-fly's poses: square at the origin, turned −38°, rolled 90°); the camera lands square on each at 1:1, flies between them on pose-fly's curve with its 30 % hop back, and at frame 158 pulls back 2.7× to the overview where all three are seen; the closing plate hangs at the overview pose and reads at 1:1. Each card: a cropped outline chapter number, an eyebrow, the title rising by character, a line, three progress segments at its foot.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | chapters[].kicker | text | glance | 3 | 2 words, 14 | 6 | Frame |
  | chapters[].title | text | word | 3 | 1 word, 9 | 4 | Frame. |
  | chapters[].line | text | glance | 3 | 8 words, 40 | 14 | Real pages, staged for the camera. |
  | kicker | text | glance | optional | 5 words, 28 | 10 | Three chapters, one film |
  | headline | text | primary, claim | 1 | 4 words, 20 | 8 | Make it move. |
  | subline | text | glance | optional | 7 words, 40 | 14 | Recipes for product films that move. |

- **Length**: 15 beats (7.5 s, fixed timetable of 225 frames).
- **Steps and events**: holds 0–36, 64–96, 128–158 with a 1.5 % creep; flights 36–64, 96–128 (turn) and 158–190 to the overview (land); each title rises from 8 frames before landing; the closing kicker at 184, the headline word by word from 190, the subline at 204.
- **Needs**: motion `pose-fly`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: `turn` (whoosh, leading 0.3 s) on each flight, `land` on the overview.
- **How not to look like a screen recording or a string of effects**: the chapters must be steps of one thing in order, and the overview must sum them (the headline names what the three make together); keep each card to a title and one line so the hold reads.
- **Styles**: any; avoid `strip`.
- **Source**: adapted from video-shotcraft `demos/camera/basic-3d-scene/Basic3DScene.tsx` (card `references/shots/camera/basic-3d-scene.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: brand and copy removed; cards are canvases repainted every frame (pixel-pure at 2.7×); the defocus blur and motion-blur subframes left out (cards away from the camera dim). Compare passes (three card centres, deviation 0 px, events ±0).
- **Pitfalls**: Keep the text on the rolled third card short; it only reads once the camera rights it.

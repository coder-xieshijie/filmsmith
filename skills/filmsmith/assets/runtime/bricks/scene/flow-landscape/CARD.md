---
id: flow-landscape
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### flow-landscape

- **Purpose**: sets a world before naming anything: many things flowing into one, seen from a low camera flying over them.
- **Intent**: Set a world before naming anything: countless streams of work flowing into one trunk, seen from a low camera gliding over them, so the product is felt as what all that work becomes.
- **Content**: 3–6 pins naming the streams (en ≤ 16 chars, zh ≤ 6, numbered), an optional eyebrow (en ≤ 28, zh ≤ 10) and a two-line title (line 1 en ≤ 16 / zh ≤ 7, line 2 en ≤ 24 / zh ≤ 9).
- **Fits**: `hook` (the first shot of an opening about many inputs becoming one output: contributors into a release, sources into a pipeline, shots into a film), `claim`, `lockup`. **Not for**: light, flat or paper styles (the light needs a dark ground); content that must be read in detail (the pins are glances); slots under 6 seconds.
- **Layout and camera**: a ground plane under a horizon at y 420 seen through a pinhole camera (focal length 1100, height 220); a bright trunk line winds from under the lens to a vanishing point a third from the right (x ≈ 1279); eleven tributaries start off-frame on both sides and meet it on its tangent; a world-locked dot grid on the ground. The camera flies forward 950 units and drifts sideways (−140 → 110) through the whole scene, easing out at the end. Frames: the field surfaces from the dark (0–12); the trunk draws from near to far with a bright pen tip (0–36); the tributaries grow, near ones first, each over 34 frames (4–81); up to six pins rise on them in an uneven stagger (44–110: a square pin pops with an overshoot, a stem grows, a capsule with its number and name rises out of a blur), scaled by depth; pulses run along every line toward the vanishing point once it has grown; near lines are out of focus and pass over the pins, far ones thin into fog; the vanishing point lights up (118–168); the eyebrow (104) and two title lines (110, 121, word by word, the second in the accent) land in the sky at the top left.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `eyebrow` | text | glance | 0–1 | 4 words, 28 chars | 10 | the sample eyebrow |
  | `line1` | text | primary | 1 | 3 words, 16 chars | 7 | the sample detail title |
  | `line2` | text | primary, claim | 1 | 5 words, 24 chars | 9 | the sample claim (in the accent) |
  | `pins` | list of `{ name }` | glance | 3–6 | 2 words, 16 chars | 6 | sample card titles, numbered 01–06 |

  Both title lines are drawn at up to 108 px (zh 112), smaller when the longer would pass 1040 px, so they stay clear of the vanishing point.
- **Length**: 12–14 beats (6–7 s at 120 BPM): 180 frames, longer when the title needs reading time; the camera's run always spans the scene.
- **Steps and events**: T0 the lines growing and the pins rising (`accent` on the first pin); T2 the vanishing point lighting (`turn`); T1 the title landing (`land`), then a hold while the camera eases to a stop and the pulses keep flowing.
- **Needs**: the word rise of `stagger-in` (`riseText`); roles `ground`, `panel` (the capsules), `ink`, `dim`, `accent` (the trunk, pins, light and second title line); type `display`, `text`, `mono`.
- **Sound**: a low drone that opens as the field surfaces, soft ticks as pins rise, a swell into the vanishing point's light, `land` under the title.
- **Styles**: dark styles (afterglow especially); not ink, dossier, plakat or swiss. **Source**: adapted from video-shotcraft `demos/opening/dataviz-landscape-open/DatavizLandscapeOpen.tsx` (card `references/shots/opening/dataviz-landscape-open.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese title lines rise by phrase). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the pins carry the film's names, numbered, in place of the upstream's shot ids and camera-move names, and a capsule that would leave the frame opens to the left of its stem; the brand eyebrow is a slot; the lime look's colours are roles (the trunk and light the accent, tributaries and dots ink mixed into the ground); the sky dust is seeded. Compare against `dataviz-landscape-open` (window 0–180, the scene's 12 beats with a short title): passes on the camera and the pins (pin 1 near and pin 5 far, both 0 px), SSIM drop 0.008; the event check is waived only because pin 5 has no start event on either side, which the tool reports as ±NaN.
- **Pitfalls**: Do not put it next to another dark glowing-line passage; back to back they read as the film's only trick, so keep two light shots between them. Grade the line brightness by depth; all lines at full white mat into a cobweb, and no glow at all reads as a wireframe. Cutting from it into a light product passage needs a hidden-cut transition, not a straight cut from dark to light. Keep the pin labels at least 18 px equivalent, or they become decorative noise.
- **Sample**: `poster.jpg`, an English still 480 px wide.

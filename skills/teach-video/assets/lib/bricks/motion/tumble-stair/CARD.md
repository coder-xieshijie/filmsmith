---
id: tumble-stair
category: motion
tier: T2
family: lift-flip
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### tumble-stair

- **Looks**: three cards stand edge-on near the centre, almost invisible, then tumble in 3D along one smooth path (rising, turning towards the viewer, overshooting the stair and coming back) into a staggered stair of large, nearly square-on cards, back cards a step darker. They stay sharp all the way and, once standing, keep turning slowly; they never freeze.
- **Tier**: T2. **Family**: lift-flip. **Surface**: dom.
- **Use**: revealing a set of pages, screens or features at once; the opening of a product film; gathering the cards before a finale (the scene `flock-finale` pulls them into the centre and bursts a smoke ring). **Not for**: one card (use `pose-fly` or `card-portal`); cards whose text must be read (they are large but turned); flat or print styles.
- **Intent**: A set of pages appears out of nothing and lines up with energy: cards flip in from their thin edges into a stair, showing "many capabilities" at a glance.
- **Content**: Wraps exactly three card painters (pages, screens or feature cards); their text is decorative, not read.
- **Parameters**: `cards` (three painters, back to front; default the sample page, grid and detail, each covering a 560 × 400 card), `poses` (per card: edge-on, mid-tumble, standing; `{ x, y, rx, ry, rz, s }`), `idle` true (the slow turn after standing; false lands them still), `res` 2 (canvas resolution of a card). Roles read: `ground`, `panel`, `line`, `accent` (the glow around each card).
- **Theory**: a card seen edge-on has almost no area, so its turn to face the viewer reads as appearing out of nothing (the thin-edge reveal); one continuous path through three poses keeps the motion physical, and a stair of overlapping cards shows a set at a glance.
- **Styles**: any with depth; avoid blueprint and print.
- **Length and easing**: 3.75 beats (56 frames at 120 BPM), 3–5. A Catmull-Rom path through the three poses split at 0.55, out-cubic over the flight (the first 44 of 52 upstream frames); the idle turn adds 0.34°, −0.1° and 0.05° a frame (eased in over 14 frames from 86 % of the flight).
- **Sound**: a whoosh per card, overlapping; the stair lands softly (no hit).
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/card-flock-tumble/CardFlockTumble.tsx` (card `references/shots/transition/card-flock-tumble.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the cards' painters set theirs).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the flight only (the word wall, the pull into the centre, the core flash, the smoke ring and the slammed title are the scene `flock-finale`, the pull and the ring a preset of the hand-off `collapse-burst`); cards are any painters instead of the workbench UI, each with its glow, shadow and hairline painted into one canvas; the brick runs to upstream frame 62 at 3.75 beats instead of 3.5, so the idle turn ends under 2 px a frame. Compare (frames 10–62): pass (box centre and front edges at 0 px, events ±0 frames, SSIM drop 0.10).
- **Pitfalls**: Never let the cards stop once standing; a still stair at the climax was rejected (keep the slow turn). No motion blur or defocus: it must stay sharp all the way.

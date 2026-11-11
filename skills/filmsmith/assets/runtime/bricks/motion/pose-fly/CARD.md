---
id: pose-fly
category: motion
tier: T2
family: zoom-depth
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### pose-fly

- **Looks**: cards hang in a dark 3D space with drifting motes, each at its own place, turn and scale (the second turned 38° about its vertical axis, the third rolled 90° on its side, an overview pose 2.7× back). The camera flies from the card it is square on to the next by taking the inverse of that card's pose: it starts steadily, pulls back 30 % mid-flight so the other cards show in space, and lands very softly with the next card square and at 1:1. Cards away from the camera dim and defocus; the one it is on lifts 18 px.
- **Tier**: T2. **Family**: zoom-depth. **Surface**: dom.
- **Use**: chapters of one story laid out in space (step 1, 2, 3, then the overview); a tour where the order matters. **Not for**: two unrelated scenes (there is no space to fly through); text to be read in flight (it blurs).
- **Intent**: Turning the page becomes travelling through a space of ideas: each card has its own place and angle, so arriving at it feels like entering a new chapter.
- **Content**: Wraps two or more cards (scene painters) and the pose of each; text on the cards stays short, since a rolled card is only readable once square.
- **Parameters**: `cards` (painters, one per card; default title, grid, detail), `poses` ([{ x, y, z, rx, ry, rz, s }], one per card plus an overview; default the upstream's four), `from`, `to` (pose indices; `to` past the last card is the overview), `motes` true, `defocus` (CSS blur on the cards away from the camera; default on unless the flight changes the camera's scale), `res` 1. Roles read: `ground` (the space), `panel` (card backing), `ink` (motes), `line` (card border).
- **Theory**: a camera that moves through one continuous space keeps every card's place known (spatial memory, the method of loci; impress.js's "camera = step⁻¹"); the hop back shows where the cards are before landing.
- **Styles**: any; avoid strip, split and scroll (locked cameras).
- **Length and easing**: 2 beats a flight (28 frames at 120 BPM), 1.5–3. Flight cubic-bezier(0.62, 0, 0.16, 1); hop 30 % × sin(πu).
- **Sound**: a `turn` whoosh per flight; a soft `land` on arrival.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/camera/basic-3d-scene/Basic3DScene.tsx` (card `references/shots/camera/basic-3d-scene.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the cards are the scenes').
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one flight per brick (the three flights, the holds, the progress lines and the overview plate are the scene `space-steps`); the cards are scene painters instead of chapter posters; no hold-phase creep (the upstream's camera is 1.5 % in at the flight's start) and no temporal-sample blur (the runtime's CSS blur stands in). The cards carry `will-change: transform` and defocus is off for flights that change the camera's scale: without both, Chrome rasterised the scaled 3D layers differently depending on the frames before (±8 levels at the same p). Compare (flight 1 → 2): pass (track 21.6 px, the creep's 1.5 %; events ±0 frames; SSIM drop 0.004). `track()` scales x and y only, as CSS `scale()` does.
- **Pitfalls**: Keep the text on rolled cards short: it only reads once the camera has righted it. A title that hangs in the world is tilted in flight: fade it in after half the flight.

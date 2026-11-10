---
id: cursor-collapse
category: motion
tier: T2
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### cursor-collapse

- **Looks**: the words and tags are sucked into the cursor, blurring and shrinking; the cursor turns into a bright dot in the middle of the screen.
- **Tier**: T2. **Family**: shape. **Surface**: canvas.
- **Use**: The end of a phosphor opening, into a burst or a cut to the claim. **Not for**: Mid-film transitions (it is a T2 device: one every 8–12 s); frames without a cursor.
- **Intent**: Return the screen to its source: everything goes back into the cursor, which becomes the point the next shot grows from.
- **Content**: A line of type and a tag on screen with a cursor after the line.
- **Parameters**: `line`, `tag`, `screen`; roles read: `ink`, `bad` (the tag), `accent` and `hi` (the point's glow).
- **Theory**: A CRT power-off read as a gesture; the point is a match on position into the next shot (a graphic match).
- **Styles**: made for `phosphor` (recipe the phosphor recipe); fits phosphor; avoid plakat, blueprint, thread.
- **Length and easing**: 4 beats: the pull 1.5 beats (delays (1 − d) × 0.5 beat, power3.in), the point 0.8 beat expo.inOut from beat 1.5.
- **Sound**: a riser through it (400 → 9000 Hz), −15 dB.
- **Source**: own (`assets/templates/phosphor/film.js BUILD.boot (collapse, point); events.js TIMING.boot`), split from the phosphor style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter / JetBrains Mono, as written (no capitals), untracked, labels and HUD at 28 px and body at 40 px; the decode flickers a Chinese cell through the line's own Chinese characters and a fixed pool of dense common characters (never Latin letters), digits stay put; emphasis is marked in the copy (`*word*`), not found by matching Latin word characters; words that pop one at a time are the Chinese word segmenter's words; commands, hashes and URLs stay Latin and are read as Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the phosphor template (`assets/templates/phosphor/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the phosphor recomposition (the recipe's Recomposition section). Intended departures: the template is DOM and GSAP, the bricks draw the same layouts and timings on canvas as pure functions of time; the HUD and ground are drawn by each scene (the template keeps them in the page around every scene); the CRT collapse, glitch cut, container morph and slice smear between scenes are runtime transitions and hand-offs, not drawn by the bricks; the reading session follows events.js but cannot measure laid-out text in node, so it reads the slot strings.
- **Pitfalls**: Pieces that arrive at different times read as a stutter: the delay must grow with the distance.

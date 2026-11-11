---
id: name-stamp
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### name-stamp

- **Purpose**: names the product before anything of it is shown, quietly, so the viewer remembers the name.
- **Intent**: Give the viewer the name to remember before anything of the product is shown: quiet, pressed like ink, with one complete still moment.
- **Content**: The product name (up to 2 words; en ≤ 16 chars, zh ≤ 7) and an optional kicker line (en ≤ 32, zh ≤ 12).
- **Fits**: `hook` (the first beat of an opening), `lockup`. **Not for**: high-energy openings (this one starts low on purpose and leaves room to climb); names over two words; titles repeated mid-film.
- **Layout and camera**: centred lockup on a still ground: a small crosshair above, the name, the kicker under it; no camera move. Beat by beat (frames at 30 fps): the crosshair's vertical stroke 0–9, horizontal 8–18, fading 24–34; grapheme i presses in from frame 10 + 3i over 12 frames (1.6× → 1 about its foot, blur 6 → 0 px), an accent glint drawn under it as it lands; the kicker types from frame 28 (0.7 frames a character, 1.5 in Chinese) with a block cursor that blinks once typed; a hold of at least one second after both are complete; the lockup lifts 40 px, shrinks 12 % and fades over 7 frames.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 2 words, 16 chars | 7 | the sample product name |
  | `kicker` | text | glance | 0–1 | 6 words, 32 chars | 12 | the sample claim |

- **Length**: 5–9 beats (2.5–4.5 s at 120 BPM): the press grows with the name's graphemes; the hold is the larger of one second and what the name and kicker need to read (`readTime`); `exit: false` drops the 7 exit frames for a scene that hands off with its own transition.
- **Steps and events**: T0 the crosshair and each grapheme's press; T1 the lockup complete (the `land` cue); the hold is a marked pause; the exit is a `turn`.
- **Needs**: no other bricks; roles `ground`, `ink` (name), `dim` (kicker), `accent` (crosshair, glints, cursor); type `display`, `mono`.
- **Sound**: a soft `land` as the first grapheme lands, nothing during the hold, `turn` (a short whoosh) on the exit.
- **Styles**: any; on paper styles the press reads as letterpress; avoid pulse (its type slams). **Source**: adapted from video-shotcraft `demos/typography/brand-ink-open/BrandInkOpen.tsx` (card `references/shots/opening/brand-ink-open.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (graphemes press one by one; the kicker types at 1.5 frames a character and is not upper-cased). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the hold is computed (≥ 30 frames, longer when reading needs it) rather than a fixed 33 frames, and the exit is optional; the serif letterpress face is the look's display face; brand name and motto replaced by slots. Compare against `brand-ink-open` with a 15-grapheme name: the letter press matches exactly (track 0 px); progress RMSE and events waived because the computed hold starts the exit 3 frames earlier.
- **Pitfalls**: The full-second hold belongs to the name's lockup; do not copy it onto ordinary title or content cards. Keep the opening low; a showy first beat leaves the film no room to climb.
- **Sample**: `poster.jpg`, an English still 480 px wide.

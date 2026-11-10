---
id: neon-marquee
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### neon-marquee

- **Purpose**: recaps three words the film has earned as a wall of neon signs, a night-time rest before the end.
- **Intent**: Three words the film earned glow like signs on a street at night: a recap with a party mood before the end.
- **Content**: Exactly three words, one word each (≤ 9 chars), already met earlier in the film.
- **Fits**: `claim`, `rest`, `lockup`. **Not for**: words the viewer has not met before (they scroll and each is lit a third of the time); more or fewer than three; light, editorial or documentary styles.
- **Layout and camera**: a 2900 × 1200 brick wall shot at an angle, three rows of hollow tube letters at y 28, 318 and 608 (286 px, the word and a diamond repeated), the outer rows running right and the middle row left (9, 11, 9 px a frame); a wet floor under the wall with the bottom row mirrored in it and pools of light. Camera: rotateY −17° → −9° and scale 1 → 1.05 over the whole scene (smooth), perspective 1700 px.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `words` | list of text | word | 3 | 1 word / 9 chars | 3 chars | the first three steps (Plan, Draft, Review) |

- **Length**: 10 beats (5 s at 120 BPM), fixed: the ignition, three lit cycles of 42 frames, the power-down.
- **Steps and events**: frames 0–14 the rows ignite one after another with a flicker (T1); from 18 one row lit at a time on a 42-frame cycle, two ignition frames, up in 3, a plateau, down in 5 overlapping the next by 2 so the wall is never dark (T0 each); from 124 the rows lose power top to bottom with two flickers each, leaving the unlit glass (T1); pause on the dark wall.
- **Needs**: no other bricks; roles `ground` (wall and floor, darkened), `ink` (seams), `accent` (the tubes, their glow and spill); type `display`.
- **Sound**: `accent` at the ignition, `end` on the power-down.
- **Styles**: dark looks (afterglow night, neutral dark); avoid dossier, exhibit and strip. **Source**: adapted from video-shotcraft `demos/outro/neon-triple-marquee/NeonTripleMarquee.tsx` (card `references/shots/outro/neon-triple-marquee.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (each row measured in its language; Chinese up to three characters a word). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: one accent for all three tubes (the rows differ by when they are lit, not by hue); the words are set in the look's display face, wider than the upstream's condensed system face; the CSS 3D wall is painted flat and projected in 290 vertical strips. Compare against `neon-triple-marquee`: **waived** (SSIM drop 0.45 at the ignition flash, frames 8–14, where every lit stroke sits at another x because of the wider face; event frames ±5 on the wall's right edge, which moves about 2 px a frame through the whole swing); the wall's corners track to 0.1 px. Reasons in `compare/pairs.json`.
- **Pitfalls**: Each word is lit only a third of the time and scrolls: new words are not read. On a light look the glow has nothing to glow against.
- **Sample**: `poster.jpg`, an English still 480 px wide.

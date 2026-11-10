---
id: shard-gather
category: motion
tier: T2
family: shape
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### shard-gather

- **Looks**: Shards of one picture hang scattered through the depth of a dark stage, each turned at random. The centre shard swings home first, then ring after ring outward, each on a long deceleration, each giving one small rocking click as it seats; the shards are solid from the start (no fade), darker the more they face away. As the picture closes a soft glow rises behind it; the seams stay faintly visible. `out` runs the other way: every shard turns and accelerates away from the centre, inner ring first, solid until it leaves the frame. `through` is the upstream's whole shot: assemble, hold with a 3 % push, shatter.
- **Tier**: T2. **Family**: shape. **Surface**: dom.
- **Use**: chaos to form: the first shot of an opening revealing a poster, a product picture or a title card; `out` as a hard exit from a held picture. **Not for**: pictures whose detail must be read while they move; flat light styles with no depth; more than once a film.
- **Intent**: Film 'the product takes shape' as a physical event: a whole picture grows out of disorder before the viewer's eyes; reversed, it clears the screen by flying apart, not fading.
- **Content**: One picture (a poster, a product picture or a title card) painted into a rect, split into 5 × 5 tiles; keep any logo inside one tile.
- **Parameters**: `dir` `'in'` (default) | `'out'` | `'through'`; `to` (the picture's painter; default the neutral title poster on a panel tinted with the accent), `rect` [200, 80, 1520, 920] (where the picture sits; 5 × 5 tiles), `push` true (the hold's push, `through` only), `seed` 5 (the scatter). Roles read: `ground` (stage), `panel` and `accent` (the default picture's tint, the glow behind it).
- **Theory**: Order out of chaos is a reveal the eye completes before the last piece lands (closure, Wertheimer 1923); pieces starting by distance from the centre read as one wave from one source (common fate); a landing that clicks gives each piece weight (follow-through, Thomas & Johnston 1981).
- **Styles**: dark styles with depth (exhibit, afterglow); not ink, dossier, plakat, halftone or swiss (flat print has no 3D space).
- **Length and easing**: `in` 6.3 beats (95 frames at 120 BPM), `out` 2.8 beats (42 frames), `through` 10.3 beats (155 frames); 4–11. Each shard 0.34 of the shot on (0.42, 0, 0.3, 1), 0.045 a ring; the click a damped sine over 14 frames; the exit ease-in cubic over 0.18 of the shot.
- **Sound**: `land` (soft) as the centre seats and a short run of ticks as the rings close; `turn` (whoosh) on the shatter.
- **Source**: adapted from video-shotcraft `demos/opening/fracture/Fracture.tsx` (card `references/shots/opening/fracture.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the picture is the caller's).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the picture is the caller's painter, so the poster art (glowing horizon arc, eyebrow, wordmark, mark) is gone; scatter seeded with rng.js `hash`, not the upstream's sine hash; motion blur from the tracked tiles instead of an 8-sample camera blur. Compare against `fracture` (`through`): waived on all four measures because the seeded scatter differs; with the upstream's hash plugged into a copy of the brick the same pairs give progress RMSE 0.005, events ±1 f and 55 px deviation (only at the exit's peak speed, where the upstream DOM holds its first blur sample half a frame early), see `compare/pairs.json`.
- **Pitfalls**: Exit by flying out, not by fading; a fade reads as vanishing and the physics is lost. Do not let a logo or key word straddle a tile seam; the seam cuts a hairline through it and reads as a broken picture. In through, the hold is the only reading window; longer copy needs a longer hold before the shards leave.

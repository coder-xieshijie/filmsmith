---
id: card-conjure
category: motion
tier: T3
family: lift-flip
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### card-conjure

- **Looks**: A dark stage. A star flash blinks at one point: two needle beams in an X with a white core, a soft glow and short spikes, turning 90° as it swells and collapses in under half a second. Out of the collapsing light a tiny card is thrown: a slow start, then a kick along an arc that swings up and out across the frame and back to the flash point, growing from deep in the distance toward the camera, spinning about its own diagonal (thirteen turns, fast at first, dying as it nears), the turn throwing a moving gloss across its face. It stops dead, face-on, almost the full height of the frame, with no rebound; a pulse of the card's shape rings out from its edge and the light behind it comes up.
- **Tier**: T3. **Family**: lift-flip. **Surface**: canvas.
- **Use**: producing the one hero object of an opening out of nothing: a product card, a cover, an invitation, the card the film is about. **Not for**: several cards (it is one production); light grounds, where the flash does not read; cards whose content must be read in motion.
- **Intent**: Make the one hero card feel conjured out of nothing: a flash marks where to look, the card is thrown from it and stops dead face-on, a magician's production that gives the object ceremony.
- **Content**: One card face (a product card, a cover, an invitation) painted at 380 × 540 design size; its content is read only after the stop. No text of its own.
- **Parameters**: `card` (a painter `(ctx, w, h)` of the face; default a neutral tile-card), `item` (the default card's content), `at` [700, 540] (the flash point and the landing centre), `swing` [470, 230] (how far the arc swings out right and up), `scale` 1.72 (landed size over the 380 × 540 design card), `radius` 24. Roles read: `ground`, `panel` and `line` (the card and its back), `accent` (flash, glow in flight, pulse, backlight; mixed with white for the hot core).
- **Theory**: A magician's production: the light marks where to look (Posner 1980) a moment before the thing appears there, so the card seems made by the flash; a dead stop with no rebound reads as control rather than physics (the freeze of a flourish), and the pulse lets the stop land.
- **Styles**: dark styles with one luminous accent (afterglow, exhibit); not ink, dossier, plakat, swiss or halftone.
- **Length and easing**: 5.4 beats (81 frames at 120 BPM), 4–7. Flash 12 frames; takeoff at 9; flight 48 frames: travel slow-in (6 % in the first 14 %) then cubic ease-out, spin near constant for 40 % then power 2.4 decay; dead stop at 57; pulse 22 frames on `out`, backlight 30 frames on `out`. Motion blur only in flight.
- **Sound**: a bright `accent` on the flash, `turn` (whoosh) through the flight, `land` on the stop: the hook peak.
- **Source**: adapted from video-shotcraft `demos/opening/magician-card-flourish/MagicianCardFlourish.tsx` (card `references/shots/opening/magician-card-flourish.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws only the card the caller gives it).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the turn is drawn as the affine projection of the turned card (the upstream's mild CSS perspective on the card is left out), so canvas motion blur from the tracked corner replaces the multi-sample camera blur; the card is the caller's (the ticket's brand line, mark, copy and holographic foil are gone), its back a crosshatch in the panel's colours; the right-hand copy, the dust and the sheen after landing are the scene's (use `sheen-sweep` 8 frames after the stop). Compare against `magician-card-flourish`: progress RMSE 0.009 and events ±1 pass; track deviation waived (40.7 px at peak speed and 60.4 on the takeoff frame, both the upstream's blur sample held half a frame early).
- **Pitfalls**: Keep the stop dead, with no rebound or slow tail; a bounce turns control into physics. Render the flash outside any motion blur; blurred thin beams split into striped ghosts and look cheap. One card per production; for several cards use a deal or a flip scene.

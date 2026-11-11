---
id: card-portal
category: motion
tier: T1
family: zoom-depth
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### card-portal

- **Looks**: the card the eye is on lifts a little (10 px, 1.03×) while the rest of the screen sinks back; then it grows, slow–fast–slow, into a full-frame window; inside it the next scene grows from 0.42× to full size while the card's own face fades in the first 28 % of the growth; the next scene settles last (its parallax and line finish 8 frames after the window). Every frame shows one card and one world, never a cross-fade of two screens.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: an overview to the detail of one of its items (open this card, enter its world). **Not for**: two scenes with no part–whole relation (it then reads as a decorative wipe); films whose camera is locked (strip, split, scroll).
- **Intent**: Clicking into one item of an overview: the viewer feels they have entered that card's own world, not watched a wipe.
- **Content**: Wraps two scenes: an overview with at least one card (its rect on screen) and the next scene, which should be that card's detail; no text of its own.
- **Parameters**: `from` (the current scene's painter, `paint(ctx)`), `to` (the next scene's painter, `paint(ctx, u)`: u is its arrival, 0 → 1, for a parallax or a line drawing in; the rest is `paint(ctx)`), `rect` [x, y, w, h] (the card in the current scene, film px; default the sample grid's fifth card), `radius` 22, `lift` 10 px, `liftScale` 1.03, `dim` 0.18 (ground veil over the current scene while the card lifts), `veil` 0.26 (a dark veil, ground mixed with black, as the window grows), `inner` 0.42 (the next scene's scale when the window starts), `face` 0.28 (share of the growth over which the card face fades), `elevation` 56 (the lift shadow's peak). Roles read: `ground` (the veils), `ink` (the shadow, mixed with black).
- **Theory**: part–whole continuity: the card the eye is on becomes the frame, so the change of scene reads as entering that item (object constancy across the edit, Heer & Robertson 2007); the slow–fast–slow growth is the acceleration of a real camera move, and the anticipation lift says which card before it moves (Thomas & Johnston, The Illusion of Life).
- **Styles**: any style with cards or tiles; not strip, split or scroll (their camera never leaves the material).
- **Length and easing**: 4 beats (2 s at 120 BPM), 3–6. Lift 0–20 % `snappy`; growth 20–87 % `portal` (cubic-bezier 0.7, 0, 0.3, 1); arrival 47–100 % `out`; veil 20–77 % `out`.
- **Sound**: `turn` as the growth starts (a soft whoosh rising with it), `land` when the window fills the frame.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/shot-transitions/PortalWipeV2.tsx` (card `references/shots/transition/shot-transitions.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the card face is the scene's own pixels).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the neighbours' dimming is a ground veil over the whole current scene (the brick cannot tell the neighbours from the header); the resting shadow belongs to the scene, so the lift shadow grows from none and p = 0 is the scene pixel for pixel; the upstream world's parallax spread and chart draw are the incoming painter's arrival. Motion blur from the window's corners while it grows fast (upstream has none). Compare: pass (track 0.1 px, events ±0 frames).
- **Pitfalls**: The world inside the window must be the opened card's detail; an unrelated scene turns it into a decorative wipe. One transition per seam: no white flash or blur stacked on the growth. Let the next scene really stop (hold ≥ 1 s) after the window fills; drifting parallax steals the read.

---
id: split-fuse
category: motion
tier: T3
family: shape
energy: peak
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### split-fuse

- **Looks**: a figure shown as its two parts, then fused, with no text. `split` (default): the whole floats at the centre (420 px high), or flies in from a small perch (`arrive`) trailing a short line; on beat 2 it flashes apart into its two parts, which drift out to either side with a slight tilt and float; on beat 4.5 they wind back, and from 5.6 they rush in and slam on beat 6. `converge`: the two parts enter from two edges (by default the core from below, the lid from above) with an overshoot, hover, and the lid drops onto the core, which crouches just before it; the slam on beat 5.76. On the slam the picture cuts to the whole under the flash. `burst` (split's impact): a white-hot flash, two shock rings in the glow and the accent, 28 sparks, a 14 px shake for 0.3 s, a squash and its rebound, then the whole floats gently until `still`. `ring` (converge's impact): one wide ring in three strokes, a glow and a full-frame white flash over the whole, no shake. With `line`, the thread shoots both ways across the frame from the figure's foot on the slam and lies flat at its height, where it stays.
- **Tier**: T3. **Family**: shape. **Surface**: canvas.
- **Use**: what a product, mascot or mark is made of, shown once: two recognisable things (a brand and a character, a model and a tool) held apart, then made one, as its debut (`converge`) or its closing reveal (`split`). **Not for**: two sides of a comparison colliding (`versus`); one thing becoming many (`clone-echo`); like shapes melting into one (`sphere-merge`); parts that are not recognisable alone; more than once or twice a film.
- **Intent**: Show what the thing is made of, then make it one: each part is recognised on its own before the slam makes them the whole.
- **Content**: three pictures, the whole and its two parts (transparent cut-outs, the whole about 420 px high on screen). Images only: a film that names the parts sets the names as glance text in its own layer. Without pictures, a drawn badge in the ink with an accent core, cut into its top and bottom halves.
- **Parameters**:
  - `entry` `'split'` (default) | `'converge'`: the two entries of one move.
  - `whole` (image URL), `parts` [core, lid], each `{ image, … }`; `center` [x, y] (960, 430) and `size` (the whole's height, 420).
  - Split parts: `at` [x, y] (the rest centre while apart; default 360 px either side), `h` (rest height, 310 and 380), `rot` (rad), `wind` [dx, dy, drot] (the wind back), `land` [dx, dy, scale] (where the rush ends), `bob` [amplitude, speed, phase].
  - Converge parts: `from` `'top' | 'bottom' | 'left' | 'right'` (the edge it enters from), `at`, `w` (its width while hovering), `into` [fx, fy, fw] (where it sits in the whole, as fractions of the whole's box) or `'cut'` (a cut-out of the whole at its top edge, at the whole's scale).
  - `arrive` `{ at: [x, y], h }` (split: the whole flies in from there, from beat `fly0` to `fly1`; before that it sits there in a 60 px slot, as the stream mascot on its perch).
  - `impact` `'burst' | 'ring'` (default by entry); `shake` px (burst 14, ring 0); `halo` (the accent glow behind the whole); `line` `{ y }` (the stream hit: the thread across the frame).
  - `from`: the scene under the figure, a painter `(ctx, state)` shaken with it; `null` fills the `ground`; `'none'` leaves the canvas clear for the host's own layers. `veil` (converge): a painter faded in over 0.4 s behind the parts and lifted on the slam.
  - `at`: any time in beats from the brick's start (split `fly0`, `fly1`, `split`, `apart`, `wind0`, `wind1`, `slam`, `still`; converge `in` [[start, end], [start, end]], `drop`, `slam`); `beats` the length; `seed`.
  - Roles read: `ground`, `accent` (the line, the halo, the outer ring), `glow` and `core` (the line's inner passes and the flash; derived from the accent when the look has none), `ink` (the placeholder).
  - `state(p)` returns `{ t, A, shake: [dx, dy] }`: a host that draws its own layers (a slogan, a sky) translates them by `shake` so the whole frame shakes as one. `cues()` lists the sound hooks; `peakAt()` the slam.
- **Theory**: taking a thing apart before the viewer and putting it back shows what it is made of (the exploded view, made temporal); the held separation gives each part its glance, the wind back is anticipation and the squash on the hit gives it mass (Thomas & Johnston, *The Illusion of Life*: anticipation, squash and stretch); the cut to the whole is hidden inside the flash (cutting on action), so the parts need not fit pixel for pixel.
- **Styles**: dark looks with a glow. In `stream` it is the film's own hit: `line` at the thread's height, `from: 'none'` over the sky, the mascot as the whole. Elsewhere it reskins by roles: the flash, rings and sparks are the look's accent and its lightened tones blended additively, so on a dark look they glow in its hue; on a mid ground set `impact: 'ring'` and lower `halo`; on calm films set `shake: 0`. Avoid light grounds (`plakat`, `blueprint`, `dossier`): additive light greys out on paper.
- **Length and easing**: split 10 beats (range 6–16): fly in `fly0`–`fly1` in-out cubic; apart 2–3.17 out-cubic; float to 4.47; wind back 4.47–5.57 in-out quad; rush 5.57–6 in-cubic; the slam on 6; float to `still` (10). Converge 7.36 beats: entries 0.64–1.92 and 1.6–2.88 back-out; hover to 4.69; the lid falls 4.69–5.76 in-cubic, the core eases in 0.15 s earlier; the slam on 5.76. The flash 0.32 s; the shake 0.3 s; the rings 0.75 s.
- **Sound**: `cues()` gives the hooks in beats: split `pull` (the fly in), `split` (a bright whoosh), `riser` (the wind back to the slam), `slam`; converge `enter` per part, `fall` (the lid), `slam`. The slam is the film's heaviest hit (a low impact with a sub drop) and the music drops on it; nothing else lands on that beat.
- **Source**: own (the stream films of the source production: the opening fusion and the closing reveal).
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide (split, after the slam); variants `converge` and `line` (the stream hit, arriving from the perch).
- **Differs from upstream**: one brick with both entries as a parameter; colours by role; the parts' places and every time as parameters; drawn placeholders when no pictures are given; images only (the source films' part labels are left to the film).
- **Pitfalls**: Hold the parts apart long enough to be recognised (about two beats from `apart` to `wind0`): rushed, the slam merges two unread blurs. Give the slam the film's heaviest sound and let the music drop on it. The shake moves only what the brick draws: with `from: 'none'`, shake the host's layers by `state(p).shake`. Use it once or twice a film; a third fusion reads as a gimmick.

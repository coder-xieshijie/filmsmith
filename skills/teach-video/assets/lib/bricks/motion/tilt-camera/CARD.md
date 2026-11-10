---
id: tilt-camera
category: motion
tier: T2
family: zoom-depth
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### tilt-camera

- **Looks**: the camera looks down on a page lying flat, or on a desk of pages; it lifts or dives until one page stands upright in front of it. `rise`: only the far edge of the lying page shows, a lit line on the horizon; the camera lifts (86° → a 2.2° overshoot → 0°) while the page shrinks from 2.5× to sit framed at 0.84× with its far end coming out of the dark. `drop`: the camera pans at 62° over three pages on a desk; the target lifts off the desk, the others dim; the camera drops onto it (tilt, scale and position together, a 5 % pull-back first) until it fills the frame. `dive`: the camera hangs high over one page above a dotted floor, pulls back a little, dives (accelerating) and lands on one region with a long cushioned tail, the page's shadow on the floor tightening as it lands.
- **Tier**: T2 (a T3 when it opens the film). **Family**: zoom-depth. **Surface**: dom (CSS 3D; the pages are canvases painted once by the scenes).
- **Use**: a reveal after a held-back opening (`rise`); a choice among a few pages (`drop`); landing on one part of an overview (`dive`). **Not for**: every scene change (a few a film); styles whose camera is locked (strip, split, scroll, dossier).
- **Intent**: The camera's pitch tells the story: a page lifted from the table into view, a pick from a desk of pages, or a dive from above onto the hero, each landing on one upright page.
- **Content**: Wraps one page (`rise`), three pages and the target (`drop`), or an overview page and the region to land on (`dive`); high-resolution, since the end is a close-up.
- **Parameters**: `move` `'rise'` | `'drop'` | `'dive'`; `items` (the world: `[{ x, y, w, h, scene }]` in world px, `scene` a painter or a scene description; default per move: one page, three pages on a desk, one page over a floor); `pivot` (world px the camera turns about; `dive` lands it at the frame centre; default per move), `focus` (the box tracked for motion blur, world px); `rim` true (the horizon line of `rise`), `shade` true (the lying page's far end in the dark). Roles read: `ground` (stage, desk, veils), `line` (desk rules, floor dots), `ink` (the stage light, mixed with ground), `accent` (the rim).
- **Theory**: a change of viewpoint on one continuous space reads as a camera move, not a cut (optic flow specifies self-motion, Gibson 1979); the tilt withholds the content and gives it back, so the reveal lands on the righted page; the overshoot and the cushion are the follow-through of a real rig (Thomas & Johnston).
- **Styles**: any style with pages or panels and a free camera; avoid strip, split, scroll, dossier.
- **Length and easing**: `rise` 4.5 beats (creep `smooth`, lift `swift`, settle `smooth`), `drop` 6 beats (pan `smooth`, drop cubic-bezier 0.36, 0, 0.12, 1, scale with a 5 % pull-back 0.45, −0.18, 0.12, 1), `dive` 4.5 beats (pre-lift `smooth`, dive cubic in for 82 % of the travel, cushion quint out); range 3–8.
- **Sound**: `turn` at the start of the lift or the drop (a rising whoosh), `land` as the page rights itself.
- **Merged from**: `overhead-tabletop-drop` (move `drop`), `drone-dive-landing` (move `dive`).
- **Source**: adapted from video-shotcraft `demos/camera/overhead-camera-moves/TiltReveal.tsx`, `demos/camera/overhead-camera-moves/OverheadTabletopDrop.tsx` (card `references/shots/camera/overhead-camera-moves.md`) and `demos/camera/space-camera-moves/DroneDiveLanding.tsx` (card `references/shots/camera/space-camera-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (no text of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the slow push of the hold (1 → 1.018) is left to the scene; no dust, top-light beams, sheen, grain or vignette (style texture); the page does not animate its own rows and line (the scene's painter is painted once); blur is isotropic and lighter (CSS blur on the stage, from the tracked corners). Compare (`rise`): pass (track 8.5 px, all of it from the omitted hold push; SSIM drop 0.088, mostly the upstream chart drawing in during the lift).
- **Pitfalls**: `rise` is an opening reveal: not with another reveal opener (crane-reveal) in the same film. `drop`: keep the pan at a fixed angle and only then dive; mixing them leaves the camera's intent unclear. One camera holder per section: not with other big camera moves; `dive` counts towards at most two 3D showpieces a film.

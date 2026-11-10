---
id: explode-z
category: motion
tier: T2
family: lift-flip
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### explode-z

- **Looks**: a page lies at a three-quarter angle (tilted 54°, turned −34°) like a board on a table, with a soft contact shadow and a thin edge. It crouches 6 px, then its parts rise along the page's normal one after another (springs 5 frames apart, one visible overshoot, the highest last), each with a lit rim, an edge slab under it and a shadow on the plate that grows softer with height; dashed slots show where they were. While they hang the camera turns 10° and tilts back 4°, and the pull-back keeps the stack in frame. Then they drop back in reverse order (ease-in, 3 frames apart) and the whole page lands with one damped 8 px thud.
- **Tier**: T2. **Family**: lift-flip. **Surface**: dom.
- **Use**: how a product is built (layers, modules, the stack); an architecture told as one object. **Not for**: pages whose parts overlap or have no clear blocks; text to be read while it hangs (it is at an angle).
- **Intent**: "See what it is made of": the viewer sees a product's layers lift apart and click back, the Apple-style exploded view of its build.
- **Content**: Wraps one page with 3–6 clearly separate blocks (their rects, non-overlapping), ideally cut from real screenshots part by part; optional callouts are the scene's.
- **Parameters**: `page` (the painter cut into parts; default the sample page), `parts` ([{ rect [x, y, w, h] in page px, z (height) }], bottom to top; default five: chart, KPI, two KPIs, claim, top bar, heights 150–640), `slots` true. Roles read: `ground`, `panel` (the cut-outs on the plate), `accent` (dashed slots), `line` (plate edge, part edges), `ink`.
- **Theory**: an exploded view shows how a thing is built by separating its parts along one axis while keeping their alignment (technical illustration); the parallax while the camera turns makes the layers' depth readable; reverse-order assembly closes the explanation.
- **Styles**: any; avoid strip, split and scroll.
- **Length and easing**: 9.5 beats (142 frames at 120 BPM), 8–12. Springs from 17 % (damping 15, stiffness 120); orbit 21–73 % `smooth`; assembly from 76 %, `exit`, 14 frames a part; thud 94–100 %.
- **Sound**: a rising `turn` as the parts lift, a thick `land` on the thud.
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/camera/space-camera-moves/ExplodedView.tsx` (card `references/shots/camera/space-camera-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text; the parts are the page's own pixels).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the parts are rectangles of any page painter instead of the workbench UI's six layers; the plate is 1600 × 900 (the scene's aspect; the upstream's is 1600 × 1000); the callouts, the sheen after assembly and the outro title with its camera shift are left to the scene or film (track() gives each part's right-edge anchor for callouts). Compare: pass (camera and top-part height tracks 0 px, events ±0 frames, SSIM drop 0.093).
- **Pitfalls**: Needs the page as separate parts; one flat screenshot cannot come apart. A big camera move: with dives and other 3D showpieces, at most two per film.

---
id: frame-snap
category: motion
tier: T1
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### frame-snap

- **Looks**: A thick band of colour, 60 px, grows round the whole frame within a couple of frames, a board with a rounded hole and a soft inner shadow; a mode label rises into the top band on the left and a mark on the right. Then on one frame everything flips: the band changes to the other colour of the pair, the label swaps, the content inside cuts to the next scene, a white flash brightest at the band lasts three frames and the band's thickness bounces 12 px and settles.
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: a product with two modes (design and code, edit and preview, draft and review) when the film switches between them; a section frame that says the whole view is in one state (`grow` only). **Not for**: ordinary cuts between shots (the flip says mode, not next); more than one flip pair a film; scenes whose own edges carry information (the band covers 60 px).
- **Intent**: The colour of the frame becomes the code for a mode, so one hard flip says "we switched modes" without touching the content.
- **Content**: The scenes before and after the flip (often two screen recordings), two short mode labels (≤ 12 chars each) and an optional right-hand mark.
- **Parameters**: `from` (the scene before the flip, default the page), `to` (after, default the detail panel; null: the same scene), `colors2` [`accent`, `ink`] (the two band roles), `band` 60 px, `bounce` 12 px, `flip` 30 (frame of the flip; null: grow only), `grown` false (true: the band is there from the first frame), `labels` [before, after] (default the second and third sample steps), `mark` (the right-hand label, default the sample product name; null: none). Exports `bandAt(g, P)` and `framesOf(P)`. Roles read: the two band roles, and the text role that reads on each (`onAccent` on `accent`, `ground` on `ink`).
- **Theory**: The frame is the edge of the picture, so colouring it says "this whole view is in a mode" without touching the content (the band is ground to the scene); a hard cut on one frame with every part changing together reads as one cause (common fate, Gestalt) and as a switch, not a transition; the bounce gives the switch a physical click (squash and stretch).
- **Styles**: any; avoid ink and dossier.
- **Length and easing**: 3.6 beats (54 frames at 120 BPM), 1.4–4; band `snappy` over 19 frames; label `snappy` 6–20 with a 16 px rise; flip hard on its frame, flash 0.6 → 0.2 over 3 frames, bounce 12 px · e^(−0.24 t) · cos(0.95 t), settled 24 frames after the flip. `grow` alone 20 frames; `flip` alone (`grown`, flip 4) 28 frames.
- **Sound**: `accent` on the flip frame; nothing on the grow.
- **Source**: adapted from video-shotcraft `demos/effects/brand-frame-snap/BrandFrameSnap.tsx` (card `references/shots/effects/brand-frame-snap.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (labels through `lang.js`: English in capitals tracked 0.16 em, Chinese without case at 0.08 em; 30 px, above the 28 px floor).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: cobalt and orange become two roles of the palette; the design-tool window, its drop, the cursor, selection and redlines are the scene's and the UI bricks'; the brand mark is removed (a second label slot remains). Compare against `brand-frame-snap`: SSIM drop 0.03, events 0; track 24.9 px and progress RMSE 0.066 come from one frame: the upstream band starts growing at frame −1, the brick's from rest is the bare scene, so RMSE is waived (a dry run shifted by that frame gives track 0.1 px, RMSE 0.0006).
- **Don't**: flash on every cut: flash frames as filler are a known AI tell and the flash gate applies (three frames, at most 0.6, once); the band label carries the mode, not a decorative eyebrow.
- **Pitfalls**: Band, label and content must change on the same frame; even 2 frames apart it falls into three small animations. Keep the colour code for the whole film: no UI in the other mode's colour inside a band. The two band colours need opposed hue and a clear lightness gap; neighbours of one lightness look like no flip. At most two flips a film; more reads as a neon sign.

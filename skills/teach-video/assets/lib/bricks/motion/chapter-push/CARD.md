---
id: chapter-push
category: motion
tier: T1
family: vertical
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### chapter-push

- **Looks**: the next scene, its own ground and all, rises from the bottom edge (or enters from any edge) and pushes the current scene off the frame; both move together as one rigid slab. The push is fast in and long in its stop (curve 0.12, 0.9, 0.2, 1). While the seam moves, a 56 px contact shadow lies on the outgoing scene just ahead of it and a 2 px lit edge runs along the incoming slab.
- **Tier**: T1. **Family**: vertical. **Surface**: canvas.
- **Use**: chapter breaks, the next numbered step, a new topic with its own ground colour; at every chapter from the same edge it becomes the film's page-turn beat. **Not for**: entering a part of the current scene (use `card-portal` or `viewport-push`); a cut on every beat (the long stop takes most of the push).
- **Intent**: The new chapter shoves the old one out as one solid slab, so the viewer reads "a new world" with a physical clunk; repeated, the pushes become the film's chapter rhythm.
- **Content**: Wraps two full scenes, each on its own saturated ground colour; no text of its own (the chapter's title belongs to the incoming scene).
- **Parameters**: `from`, `to` (the two scenes' painters, full frame; `to` is painted with arrival 1), `direction` `'up'` (default: the next scene comes from the bottom), `'down'`, `'left'`, `'right'`, `seam` 56 (shadow depth, px), `shade` 0.42 (shadow opacity at the seam), `edge` 0.45 (lit edge opacity). Roles read: `ground` (the shadow is the ground mixed with black).
- **Theory**: a rigid push keeps both pictures in one plane, so the cut reads as turning to the next sheet of the same document (spatial continuity); fast-in, slow-stop motion carries weight (slow out, Thomas & Johnston, The Illusion of Life).
- **Styles**: any; avoid thread and morph, whose scenes grow out of each other instead of being stacked.
- **Length and easing**: 1.75 beats (26 frames at 120 BPM, 30 fps), 1.5–3. One curve over the whole push: cubic-bezier(0.12, 0.9, 0.2, 1).
- **Sound**: a low `turn` whoosh starting with the push; the stop is silent (the weight is in the slowing).
- **Merged from**: none.
- **Source**: adapted from video-shotcraft `demos/transition/bottom-push-stack-wipe/BottomPushStackWipe.tsx` (card `references/shots/transition/bottom-push-stack-wipe.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one push per brick (the upstream's three chapters are three uses); any direction; no speed blur and no grain (the upstream blurs vertically at 0.1 of the speed), so the seam stays sharp; the shadow is the ground mixed with black instead of each chapter's own shade. Compare: pass (track 0 px, events ±0 frames, SSIM drop 0.05).
- **Pitfalls**: Keep one direction for the whole film; switching edges mid-film breaks the chapter rhythm. Start the chapter's own animation only after the push has landed (≥ 95 %); two moving screens leave the eye no anchor. Use saturated grounds; with pale grounds it reads as cards changing backgrounds, not chapters.

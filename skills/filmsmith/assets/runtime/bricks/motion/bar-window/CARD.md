---
id: bar-window
category: motion
tier: T1
family: split-wipe
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### bar-window

- **Looks**: over the first half beat the dot's left and right edges run to the frame edges (expo out), a bar of the dot's height; over the second the bar opens vertically from the dot's line (power 2.2, accelerating), the next scene inside it, fully open just before the downbeat.
- **Tier**: T1. **Family**: split-wipe. **Surface**: canvas.
- **Use**: a seam out of a scene that ends on its dot. **Not for**: soft transitions.
- **Intent**: The cut is caused by the dot: the last thing standing opens the next scene.
- **Content**: Two scene painters and the dot.
- **Parameters**: `from`, `to` (scene painters), `dot` ({ x, y, r }); roles ground, accent (the bar).
- **Theory**: a transition grown from an element on screen reads as caused; the accelerating open lands on the beat (anticipation).
- **Styles**: ink. Avoid dossier and scroll.
- **Length and easing**: 1 beat; expo out, then power 2.2.
- **Sound**: `turn` (whoosh, led by 0.25 s).
- **Source**: own (`assets/templates/ink/film.js drawTransition 'wipe'`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own, split from the ink template); compare waived.
- **Pitfalls**: Start it half a beat after the dot has landed; the window must be fully open on the downbeat.

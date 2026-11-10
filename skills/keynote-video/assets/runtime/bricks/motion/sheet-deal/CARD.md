---
id: sheet-deal
category: motion
tier: T1
family: vertical
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-deal

- **Looks**: the sheet on the mat slides 900 px down (power 2 in, 0.35 s); half a beat in, the next rises from 800 px below to the reading position (expo out, one beat); no tilt, no fade; motion blur from the sheets' speed.
- **Tier**: T1. **Family**: vertical. **Surface**: canvas.
- **Use**: a page change (the scene after it uses `enter: 'deal'`, which draws the same curves). **Not for**: frame-level cuts.
- **Intent**: Change the evidence without moving the camera: one sheet out, the next dealt on where the eye already is.
- **Content**: Two exhibits.
- **Parameters**: `from`, `to` (exhibit specs), `bpm`; roles ground, paper, onPaper, line, accent, onAccent.
- **Theory**: exits faster than entrances (accelerate out, decelerate in); a fixed reading position keeps the eye where the next claim will be.
- **Styles**: dossier. Avoid ink, pulse, scroll.
- **Length and easing**: 1.5 beats; power 2 in, expo out.
- **Sound**: `turn` (a paper slide down, a lighter one up).
- **Source**: own (the dossier source film). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own); compare waived.
- **Pitfalls**: The out-move is faster than the in-move; never both sheets square at once.

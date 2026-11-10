---
id: page-turn
category: motion
tier: T2
family: lift-flip
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### page-turn

- **Looks**: the top sheet rotates about its top edge (or left) to 89° with perspective 2200 px from the hinge, power 2 in, drawn in 3 px strips each scaled about the hinge's middle; a shade of the mat up to 28 % darkens it as it tilts; the sheet underneath lies still with its edges and sticker.
- **Tier**: T2. **Family**: lift-flip. **Surface**: canvas.
- **Use**: a seam between two exhibits (the scene after it uses `enter: 'change'`). **Not for**: frame-level cuts.
- **Intent**: The next evidence was under this one all along: the change is paper being handled, not a cut.
- **Content**: Two exhibits.
- **Parameters**: `from`, `to` (exhibit specs), `edge` (top | left); roles ground, paper, onPaper, line, accent, onAccent.
- **Theory**: object permanence (the next page was there); the shading of a surface turning from the light reads as depth without 3D.
- **Styles**: dossier. Avoid ink, pulse, scroll.
- **Length and easing**: 1 beat; power 2 in, the sheet edge-on on the downbeat at its fastest, as in the template.
- **Sound**: device `page-turn`: air, then a rim and a thud as the page is gone.
- **Source**: own (the dossier source film 'turn'`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full (no text of its own).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own, split from the dossier template); compare waived. Same constants and curve as the template's `turn`, which ends edge-on at its fastest on the downbeat: declared `endsMoving` (SPEC 3.1), so the brick contract does not hold it to the end speed; whatever follows takes over on that frame.
- **Pitfalls**: The page underneath is still and whole from the first frame; only the top sheet moves.

---
id: width-jump
category: motion
tier: T0
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### width-jump

- **Looks**: the word stands centred; on each beat it snaps to the next width — condensed, semi-condensed, extra-condensed, semi-condensed, normal (Archivo's wdth axis) — with a 5 % punch-in; nothing slides between the steps; the centre and the glyph count never change.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: a name over a bar on the drop. **Not for**: text read while it changes.
- **Intent**: The name moves with the music without moving at all: same place, same letters, a new width on every beat.
- **Content**: One word (≤ 10 chars).
- **Parameters**: `text`, `size` (225), `steps` (the width keywords, default the five above), `bpm`; roles accent (the field), onAccent (the type).
- **Theory**: a discrete change on the beat is heard as part of the rhythm; a fixed centre keeps the eye on one word.
- **Styles**: ink; any kinetic type film. Avoid dossier.
- **Length and easing**: one beat a step (5 beats by default); no easing (steps).
- **Sound**: `tick` on each step.
- **Source**: own (`assets/templates/ink/film.js`). **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh adapted (zhRedesigns): no CJK face has a width axis, so the steps are 长体 scales of Noto Sans SC 900 — 0.86, 0.93, 0.8, 0.93, 1 wide — the way Chinese headline type condenses; the jump reads as the same beat-locked squeeze, with less range than Archivo's 62–100 %.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream (own, split from the ink template); compare waived.
- **Pitfalls**: Fit the word at its widest step so no jump leaves the margins. Steps, not tweens.

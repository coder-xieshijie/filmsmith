---
id: guide-letter
category: motion
tier: T0
family: mask-type
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### guide-letter

- **Looks**: two hairlines shoot across the sheet, and the title appears left to right between them like a pen drawing it.
- **Tier**: T0. **Family**: mask-type. **Surface**: canvas.
- **Use**: Every title and claim line of a blueprint film; any drafted lettering. **Not for**: Lettering that must read at once (a URL held still); body text under 50 px (guides crowd it).
- **Intent**: Letters are drafted, not placed: guide lines first, then the word traced in reading order.
- **Content**: A label and one or two title lines.
- **Parameters**: `label`, `lines`; roles read: `paper`, `ink` (letters), `line` (guides at 0.4).
- **Theory**: Drafting practice: letter between light guide lines (ISO 3098; Giesecke, Technical Drawing); a reveal in reading order lets the word be read as it appears.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Length and easing**: guides 0.55 s (the second 0.08 s later) from 0.38 s before the first line; each line 0.6 s power2.inOut (× 1.15 past 12 characters), the second 0.45 s after the first.
- **Sound**: a pen rim per line, −22 dB.
- **Source**: own (`assets/templates/blueprint/fx.js (pen.guides, drawText wipe); sheets/common.js (header)`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: Chinese guides sit on the em box, not the cap line: a cap line through Chinese characters cuts them at 70 % and reads as a strike-through.

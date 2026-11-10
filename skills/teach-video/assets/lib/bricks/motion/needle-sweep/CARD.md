---
id: needle-sweep
category: motion
tier: T1
family: shape
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### needle-sweep

- **Looks**: a card of round gauges (270° dials with ticks, a red zone at the top of the scale) at rest with needles at zero; from the left, each gauge's face brightens and its needle flings round the whole arc in 12 frames, the ticks lighting as it passes, then springs back past its value by about 8° and settles; the gauges start 4 frames apart, so the needles run as a wave; as each needle lands its value pops from its centre (0.4 → 1, overshoot) and its name fades in under it; once all have settled the status pill turns from "Checking" (accent) to "Ready" (`ok`).
- **Tier**: T1. **Family**: shape. **Surface**: canvas.
- **Use**: opening a dashboard section or revealing several readings at once: the scale first, then the values. **Not for**: a single headline number (use `digit-roll` or `tape-run`); values that are not shares of a known scale.
- **Intent**: Show the full scale before the reading, so the viewer feels how big the number is; a ceremony of systems coming online.
- **Content**: 2–4 readings that are shares of a known scale, each with a short name (≤ 12 chars); optional title and status.
- **Parameters**: `gauges` [{ `value` 0–1, `name` }] (three illustrative by default), `title`, `note`, `status` [busy, done] or null, `unit` "%", `scale` [0, 100] (tick numbers and the value read from it), `red` 225° (start of the red zone), `start` 12, `stagger` 4 frames, `card` [210, 230, 1500, 640], `radius` 148. Roles read: `panel`, `line` (card), `ink` (faces, ticks), `dim` (names, units, note), `accent` (needles, their arc, the busy pill), `fail` (the red zone: over the limit), `ok` (the ready pill).
- **Theory**: the ignition self-test of a car dashboard: showing the full scale before the reading tells the viewer how big the number is; the overshoot is the needle's mass (anticipation and follow-through), and a stagger reads as a wave, not a copy.
- **Styles**: any with instruments; avoid ink, halftone and dossier (a lit dashboard on paper).
- **Length and easing**: 4 beats (60 frames at 120 BPM), 3–5. Per gauge: fling cubic out 12 frames; spring stiffness 120 with damping set for one 8° overshoot, locked at +46; ticks calm over 24 frames (smooth); value pop at +32 (overshoot, 9 frames), name at +35.
- **Sound**: a `whoosh` per needle on the fling (the wave of three), a `tick` as each settles; `accent` when the pill turns ready.
- **Source**: adapted from video-shotcraft `demos/data/gauge-readout-moves/NeedleSweepSelftest.tsx` (card `references/shots/data/gauge-readout-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (names, title, pill through `lang.js`; scale numbers at the information floor of each language).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the card's fade-in is the scene's, so the faces are visible at rest and the ignition only brightens them; scale numbers every 20 at 25 px (28 px in Chinese) instead of every 10 at 16 px; one accent plus the red zone in `fail`. Compare against `needle-sweep-selftest`: pass, needle tips within 3.8 px, events 0 frames.
- **Pitfalls**: Hold every needle dead still ≥ 1 s after it settles; drift reads as a bug. Stagger the gauges a few frames; launched together they read as copies, not a wave.

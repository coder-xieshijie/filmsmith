---
id: live-trace
category: motion
tier: T1
family: horizontal
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### live-trace

- **Looks**: a scope-like chart fills the frame under a big live reading; the trace streams left past a write head pinned near the right edge (a scan line, a glowing dot, a dashed reference to the edge) at a steady 8 px a frame; once, a burst writes through: the trace segment turns to the accent, the reading grows and takes the accent, and as the head passes the peak a marker, a drop line and a tag ("Burst 2,453 /s") pop on it and ride away to the left; then the stream brakes to a dead stop in 14 frames and the status turns from live to paused.
- **Tier**: T1. **Family**: horizontal. **Surface**: canvas.
- **Use**: a system that is live and has one event worth naming: a spike, an incident, the moment a change shipped. **Not for**: comparing values (there is no axis to read exactly); more than one event (a second burst cheapens the first).
- **Intent**: The system reads as alive without saying so, and the one event in it is noticed and named.
- **Content**: A title and unit (≤ 24 chars), one event tag (≤ 20 chars) with its value, six time labels and three level labels; the series itself is illustrative.
- **Parameters**: `title`, `unit`, `status` [live, paused], `event`, `note`, `times` (six time labels), `levels` (three y labels). The series is a fixed pure function (sum of sines plus one burst), scaled to the plot. Roles read: `line` (grid), `ink` (trace, reading), `dim` (labels), `accent` (the burst, its marker and tag), `ok` (the live pill).
- **Theory**: a trace written at a fixed head reads as "now" without saying so (the oscilloscope, the heart monitor); one event in the one accent against a steady signal pops out (Treisman & Gelade 1980), and the stop holds attention on it (Abrams & Christ 2003).
- **Styles**: any with screens; avoid ink, dossier and exhibit.
- **Length and easing**: 6 beats (90 frames), 5–7. Steady stream to frame 104, out-cubic brake 104–118 (its start speed equals the stream's); burst written about 46–68; marker 3 frames after the peak passes (overshoot, 14 frames). The reading holds each value for 3 frames, like an instrument.
- **Sound**: a soft continuous bed; a warning `tick` on the burst; `land` on the stop.
- **Source**: adapted from video-shotcraft `demos/data/chart-live-moves/OscilloscopeStreamV2.tsx` (card `references/shots/data/chart-live-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one accent for the one event (upstream had a blue trace and a coral event); the two side readings and the push towards the burst after the stop are the scene's and the style's; the brick starts at upstream frame 30 with the stream already running. Compare against `oscilloscope-stream`: waived on events only: the marker is within 2.5 px and its start and settle are 0 frames off, but at a constant 8 px a frame the frame of "peak speed" is a tie broken by float noise.
- **Pitfalls**: The burst happens once; a second one cheapens it. Set readings and labels at film size (≥ 32 px, the main reading 120–176 px) and let the chart fill the frame, not a small card. With another live-chart move in the same film, use each once and in different sections.

---
id: terminal-stations
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### terminal-stations

- **Purpose**: show a command-line workflow as three stations: at each, a command is typed and its result prints; the last ends on what was made.
- **Intent**: A command-line workflow as a journey through a machine room: three commands, three stations, and a glimpse of the whole between them, ending on what was made.
- **Content**: Three stations, each a step name (≤ 12 chars, Chinese ≤ 4 characters), a short command (≤ 22 chars) and 2–4 output lines (key, value, note); an optional progress count and a READY line.
- **Fits**: `demo`, `proof`. **Not for**: graphical products, more than three steps, commands that must be read in full.
- **Layout and camera**: three terminal windows (prop `terminal-window`, 1180 × 620) stand along an arc in a dark space over a perspective floor grid in the accent, each turned its own way, an outlined 560 px step number behind it; the window in focus has a backlight and a pool of accent light below it. The camera holds each at an 8–10° side view (−4° tilt), and between them pulls back 1250 px on a sine while flying (swift curve), so all three share the frame mid-flight; a 2 % creep at the end.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | path | text | glance | optional | 2 words, 18 | 18 | ~/promo |
  | stations[].name | text | glance | 3 | 1 word, 12 | 4 | storyboard |
  | stations[].cmd | text | primary | 3 | 3 words, 22 | 22 | tidewell init |
  | stations[].lines[] | key, value, note | glance | 2–4 each | 1 / 4 / 2 words | 3 / 9 / 5 | template · ink-press |
  | progress | count, unit | – | optional | 3; 8 | 3; 4 | 24 shots |
  | ready | label, value | word, primary claim | optional | 6; 18 | 2; 18 | READY launch-film.mp4 |

- **Length**: 16 beats (8 s, fixed timetable of 240 frames).
- **Steps and events**: typing starts at 8, 94, 184 (about 1.15 frames a character, seeded jitter, enter 2 frames after); output lines 4 frames apart from 2 frames after the enter, spinners settle into ticks after 6 frames; station 2 counts its cells over 20 frames; flights 62–92 and 152–182 (turn); the last line at about frame 219 (land), the film's one glow.
- **Needs**: prop `terminal-window`; roles `ground`, `panel`, `ink`, `dim`, `accent`, `onAccent`; type `mono`, `display`, `text`.
- **Sound**: soft `accent` ticks while typing (or none), `turn` on each flight, `land` on the last line.
- **How not to look like a screen recording or a string of effects**: the camera never watches a terminal straight on: keep the side view and the pull-back between stations, so it reads as a place; write real, short commands of one tool in order, and let only the last line glow.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/camera/terminal-3d/Terminal3D.tsx` (card `references/shots/camera/terminal-3d.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: brand, CLI name and copy removed; floor, backlight and pool drawn on a screen canvas from the same projection; defocus, speed blur and dust left out (windows away from the camera dim). Not on pose-fly: the side view and pull-back need this camera. Compare passes (three window centres, deviation 0 px, events ±0).
- **Pitfalls**: Keep each command short with 2–4 output lines; long logs turn into noise. Hold at least a second after the READY line, or the film has no landing.

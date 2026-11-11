---
id: terminal-window
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### terminal-window

- **Structure**: `titlebar` 72 px of the 1180 × 620 layout with three `lights`, the `step` in the accent, the `name`, the `path` at the right; the `prompt` (a drawn chevron) at y 124 with the `command` (52 px mono) and a block `caret`; output `lines` from y 220 every 70 px (38 px mono): a `spinner` that becomes a `tick`, a key in dim, a value in ink, a note; an optional `progress` row of 24 cells and a count; an optional `ready` line (a badge in the accent and a name with the window's only glow).
- **Intent**: A command-line tool shown working as a real object: a command typed, output that settles line by line, and a last line that says it is done.
- **Content**: A window name and path, one command (≤ 22 chars), 2–4 output lines (key, value, note; value ≤ 9 Chinese characters), an optional progress count and a ready line.
- **States**: `idle` (empty prompt, caret), `typed` (command typed), `printed` (lines out, caret gone), `ready` (the last line popped). Scenes drive it directly through `drawTerminal(ctx, x, y, w, h, st, P, words)` with `typed` (0–1), `caret`, `lines` (frames since each line printed), `progress`, `progressAt`, `ready` (frames since).
- **Sizes**: S 760 × 400, M 1180 × 620, L 1500 × 788 (one layout, scaled).
- **Swap points**: `step` (3 / 3), `name` (2 words, 14 / 6), `path` (18 / 18), `cmd` (3 words, 24 / 24), `lines` 0–4 of key (8 / 3), value (22 / 10), note (12 / 5); `progress` count and unit; `ready` label (6 / 2) and value (18 / 18). Without them it draws the sample copy.
- **Parameters**: `backdrop` (fill the frame with the ground when shown alone). **Roles**: `ground`, `panel` (the window is panel toward ground), `ink`, `dim`, `accent`, `onAccent`.
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/camera/terminal-3d/Terminal3D.tsx` (card `references/shots/camera/terminal-3d.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Keep the command short and the output to 2–4 lines; more becomes unreadable texture. The caret sits right after the last typed character; it blinks only while idle.

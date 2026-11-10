---
id: param-dial
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### param-dial

- **Purpose**: shows one parameter driving a layout, in a design tool's own language: change one number and everything that depends on it follows in the same frame.
- **Intent**: Film the cause, not just the before and after: one number moves and everything that depends on it moves in the same frame, so the viewer believes the parameter really drives the layout.
- **Content**: One parameter with its unit and values (rest, peak), a label (en ≤ 18 chars, zh ≤ 8), a layer name (en ≤ 14, zh ≤ 6) and 3–6 block labels (en ≤ 12, zh ≤ 4), the first active.
- **Fits**: `demo`, `proof`. **Not for**: more than one parameter; values the viewer cannot see in the layout; light, decorative passages; audiences who do not know design-tool selection frames (without that, only blocks shifting is left).
- **Layout and camera**: a big readout at the top (label, the number at 196 px, the unit) over a dial ruler (760 px, 6.5 px a unit) with an accent needle; below, a row of 3–6 blocks under a selection frame with eight handles and a layer label with the row's size; between the blocks, dashed extension lines, a measure line and an accent badge with the value. A dot grid fades out round the row. The camera creeps in 2.5 % over the shot. Not a screen recording: no app chrome, the type is film size, and the value's swing (draw back, swing out, hold, spring past and settle) is the performance; every dependent element moves on the same frame, which is the point.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `label` | text | glance | 1 | 3 words / 18 chars | 8 chars | Layout · Gap / 布局 · 间距 |
  | `layer` | text | glance | 1 | 2 words / 14 chars | 6 chars | Top bar / 顶栏 |
  | `items` | list of text (block labels; the first is active) | glance | 3–6 | 2 words / 12 chars | 4 chars | the sample nav plus one |

  Params: `unit` `px`, `rest` 12, `pre` 6, `peak` 104, `step` 2 (the readout's step), `widths` null (measured from the labels).
- **Length**: 10 beats (150 frames).
- **Steps and events**: blocks rise 1–17 (2 apart), the frame springs in from 26 px outside at 4, handles pop 7–16, measures at 14; the value draws back 12 → 6 over 22–32 (`swift`), swings out to 104 by 66, holds to 86, springs back (damping 9, overshoot squeezed × 0.45) and settles by 118. The readout steps by 2 with a pulse and turns to the accent while moving, keeping the heat about 6 frames; each block is blurred along x by its own speed.
- **Needs**: helper `springAt` (stagger-in); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `accent` at the swing (beat 2.1), `turn` at the release (5.7), `land` on the settle (7.9).
- **Styles**: dark grounds suit it best; any. **Source**: adapted from video-shotcraft `demos/interaction/autolayout-gap-dial/AutolayoutGapDial.tsx` (card `references/shots/interaction/autolayout-gap-dial.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (block widths follow the labels). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (neutral-dark, at the peak).
- **Differs from upstream**: the site's navigation labels and layer name are slots; the active block is ink with ground text; the per-block blur is an exact horizontal box blur of added copies. Compare against `autolayout-gap-dial`: pass (first and last block, 0 px, events ±0).
- **Pitfalls**: The readout and the layout must come from the same value on the same frame; one frame apart breaks the trust. Turn one parameter per shot; two or more read as random tweaking. If the picture already shows a real inspector field, drop the big readout so the value is not reported twice.
- **Sample**: `poster.jpg`, an English still 480 px wide.

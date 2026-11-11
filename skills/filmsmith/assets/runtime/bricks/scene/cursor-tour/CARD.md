---
id: cursor-tour
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### cursor-tour

- **Purpose**: walk the viewer through one page by cause and effect: at four places the cursor clicks and the page answers.
- **Intent**: One continuous camera walks the viewer through four features of one page; the cursor is their pointing finger, and each click gets an answer, so cause and place are both remembered.
- **Content**: One product page with four panels, each with a title (≤ 16 chars, Chinese ≤ 6 characters) and a one-click answer (a range switch, a tooltip, toggles, a table row); product name and nav.
- **Fits**: `demo`. **Not for**: flows across several pages, features that need typing, more than four stops.
- **Layout and camera**: a 2400 × 1500 page of four panels (a range switch with a number and bars, a line with a tooltip, three switches with a rollout bar, a table). The camera opens on the whole page at 0.66, flies to each panel at 1.3 (20 frames, bezier 0.55, 0, 0.18, 1, an 8 % hop between panels) and pulls back at frame 198 on all four answers. The cursor (prop `cursor`, 40 px on screen) leads each flight by 2 frames.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | product | text | glance | 1 | 2 words, 14 | 8 | Tidewell |
  | nav | list of text | glance | 0–4 | 1 word, 10 | 4 | Overview, Projects … |
  | stops[].title / meta | text | primary / glance | 4 | 3 words, 16 / 4 words, 16 | 6 / 7 | Frames checked / Past 4 weeks |
  | range | list of text | glance | 3 | 1 word, 4 | 3 | 7D, 30D, 90D |
  | numbers | list of number | – | 2 | 6 | 6 | 3.1M, 4.8M |
  | tip | value, label | – | 1 | 5; 2 words, 6 | 5; 4 | 96, Wk 6 |
  | switches | list of text | glance | 3 | 2 words, 14 | 5 | Beat grid … |
  | rows[].name / value | text / number | glance | 3 | 2 words, 14 / 6 | 5 / 6 | Opening, 1,248 |

- **Length**: 14–16 beats (7–8 s; fixed timetable, 240 frames).
- **Steps and events**: legs start at frames 22, 66, 110, 154; clicks 22 frames after each start (accent, ripple 18 frames); each panel answers 2 frames after its click; frame 198 the pull back (turn), 222 the 1 % creep.
- **Needs**: prop `cursor`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`, `mono`.
- **Sound**: `accent` (a click) on each click, `turn` on the pull back.
- **How not to look like a screen recording or a string of effects**: the camera, not the cursor, does the travelling, and it frames each answer whole; every click must change something the viewer can name (a number, a line, a switch, a tick). Do not add hover states, scrolling or a second cursor.
- **Styles**: any.
- **Source**: adapted from video-shotcraft `demos/camera/cursor-flyover/CursorFlyover.tsx` (card `references/shots/camera/cursor-flyover.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (Chinese takes its own limits and sizes; the read times use the shared `readTime`).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: brand and copy removed; the runtime blur is off (it smeared the flight into defocus). Compare passes (cursor tip, deviation 0 px).
- **Pitfalls**: With real screenshots, mark each stop on the control's centre and use at least 1.3× native resolution. Keep the camera's arrival and the cursor's click paired: a click while the camera still moves gets lost in the blur.

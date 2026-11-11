---
id: cursor-crowd
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### cursor-crowd

- **Purpose**: shows a team being there: named cursors arrive on a shared board and keep drifting, one of them writes the brief's title, and the rest gather round it.
- **Intent**: Make the team's presence felt: named cursors arriving and drifting give the board the warmth of people in the room, and one of them typing the brief turns presence into work done together.
- **Content**: 3–5 one-word names (en ≤ 8 chars, zh ≤ 3), a title the last person types (en ≤ 32, zh ≤ 14), a board name, up to 6 notes (title en ≤ 22 / zh ≤ 8, meta en ≤ 12 / zh ≤ 5), two status words and an optional footer and share key.
- **Fits**: `demo`, `proof`. **Not for**: a single user's action (use a plain `cursor-glide`); more than five people; a quiet passage (it is busy by design).
- **Layout and camera**: a dot-grid board with six notes (far ones smaller, softer, paler), a brief card in the middle (1056 × 432: eyebrow, due line, a draft → ready status, the title at 88 px, a footer with three avatars, a line and a progress bar); chrome that does not zoom: the board's name top left, an avatar stack and a share key top right, a tool bar at the bottom. The camera creeps in 4.5 % on the card, the grid 2 %. Not a screen recording: everything is at film size, the cursors are actors (each its own entrance spring and drift, a name tag, a tone), the typist's arrow rides the insertion point, and the avatar stack takes each arrival in the same frame: three places say "someone came".
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `title` | text (typed by the last person) | primary | 1 | 7 words / 32 chars | 14 chars | Ship the teaser by Friday. / 周五前把预告片发出去。 |
  | `people` | list of names (the last one types) | word | 3–5 | 1 word / 8 chars | 3 chars | five neutral names |
  | `notes` | list of `{ title, meta }` | glance | 0–6 | 4 words / 22 chars; 2 / 12 | 8 / 5 chars | six production notes |
  | `board` | text | glance | 1 | 3 words / 22 chars | 8 chars | Teaser kickoff / 预告片开工会 |
  | `eyebrow`, `due` | text | glance | 1 each | 2 words / 14; 3 / 14 | 5; 6 chars | Brief; Due Thursday |
  | `draft`, `ready` | text (the status before and after) | word | 1 each | 1 word / 7 chars | 3 chars | Draft; Ready |
  | `footer` | text (optional) | glance | 1 | 6 words / 22 chars | 9 chars | 2 leads · 9 shots |
  | `action` | text (optional; the share key) | word | 1 | 1 word / 6 chars | 2 chars | Share / 共享 |

  Params: `readyAt` (frame; null: two frames before typing ends), `progress` [0.38, 0.72].
- **Length**: about 10.5 beats (156 frames with a 29-character title); 8–12.
- **Steps and events**: four cursors fly in on springs (15, 80, 0.9) at frames 2, 7, 11, 16, tags 10 frames later, avatars pop 8 frames after each; the typist enters from the top at 22 and parks on the title's insertion point; typing from 48 at 1.6–2.4 frames a character (seeded; Chinese × 1.8), steady while typing; draft → ready with a bounce and the bar 38 → 72 %; the others gather round the card from ready − 8 over 28 frames (`smooth`), drift kept at 25 %; hold.
- **Needs**: prop `cursor` (`drawCursor`, `drawTag`); helper `springAt`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`.
- **Sound**: soft `accent` ticks on each arrival, `turn` as typing starts, `stamp` on ready.
- **Styles**: light grounds; any interface style. **Source**: adapted from video-shotcraft `demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx` (card `references/shots/interaction/collab-cursor-moves.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: five identity colours become role tones (the typist the accent; the others ink, dim and two mixes; notes tinted from their author's tone; the ready status in the accent, not green); the brand mark and name are gone; all text is slots. Compare against `cast-ensemble`: pass (two crew cursors, 0 px, events ±0).
- **Pitfalls**: Each person's tone is their identity; keep it the same all film. Keep the drifting cursors out of the area being read; the crowd is atmosphere and must give way. When the typed title changes, keep its pauses natural (longer at spaces) and re-check that the ready status lands after the last letter.
- **Sample**: `poster.jpg`, an English still 480 px wide.

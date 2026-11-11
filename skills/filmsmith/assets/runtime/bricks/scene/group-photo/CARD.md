---
id: group-photo
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### group-photo

- **Purpose**: a curtain call: one piece from each part of the film comes back for a group photo around the name, then the lock-up holds and fades.
- **Intent**: A curtain call: everything the film showed comes back together around the name, so the ending feels like a launch.
- **Content**: 5–9 screenshots from the film (cropped to cover; placeholders by shape without them), optional page behind, a mark, a wordmark ≤ 16 chars, an optional tagline ≤ 34 chars.
- **Fits**: `lockup`, `climax`. **Not for**: films with fewer than five distinct screens to bring back; endings that should be quiet.
- **Layout and camera**: up to nine pieces (a nav bar, three cards, two documents, a search field, a stats pill, a tab strip) settle around the centre at their own scale and angle (`PLACES`, exported), each flying in from its side of the frame; the film's page lies blurred behind under a scrim of the ground; the mark and wordmark in one row at y 489, a 260 px accent rule at y 593, the tagline under it. Camera: cranes down 1.06 → 1 over 40 frames, then a slow push of 3.5 % to the end.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `shots` | list of image (crop) | — | 5–9 | — | — | a neutral placeholder of each place's shape |
  | `page` | image (crop) | — | 0–1 | — | — | the neutral sample page |
  | `mark` | image or painter | — | 0–1 | — | — | mark-lockup's placeholder mark |
  | `wordmark` | text | primary | 1 | 2 words / 16 chars | 6 chars | product |
  | `tagline` | text | glance | 0–1 | 6 words / 34 chars | 12 chars | claim |

  Parameter `exit`: `'fade'` (default, 12 frames to a near-black of the ink) or none.
- **Length**: 10–14 beats (5–7 s at 120 BPM): at least 145 frames, longer when the wordmark and tagline need more reading time from the first letter, plus the fade.
- **Steps and events**: frames 4–40 the pieces fly in every 3 frames with a real overshoot and a landing press (T0 each, the crane T1); 42–50 the cast steps back and a stage light rises behind the name; 38 the mark presses in, 42 the letters one by one (lift, scale 1.35 → 1, focus) (T2 peak); 58–70 the rule grows, 68 the tagline; pause; the fade.
- **Needs**: prop `tile-card` (placeholder figures); mark-lockup's `drawMark`; roles `ground`, `panel`, `line`, `ink`, `dim`, `accent`; type `display`, `mono`.
- **Sound**: `turn` as the cast arrives, `stamp` on the letters, `accent` on the rule, `end` on the fade.
- **Styles**: any; avoid dossier. **Source**: adapted from video-shotcraft `demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch.tsx` (card `references/shots/outro/outro-group-photo-launch.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (letters measured per language; tagline tracking reduced in Chinese). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the crane's 4° tilt is left out (no perspective in canvas; the crane is the scale and the slow push); the speed blur is a few sub-samples per flying piece; the gold dust, rule and stage light are the accent and white. Compare against `outro-group-photo-launch` over frames 0–133 (before the fade to black): pass, SSIM drop 0.052, two cards 13.9 px, events 0 frames.
- **Pitfalls**: Bring back screens the viewer saw; new screenshots here are noise. The pieces stay on screen around the name: busy screenshots compete with the wordmark, keep them calm or let them recede.
- **Sample**: `poster.jpg`, an English still 480 px wide.

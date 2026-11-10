---
id: type-retype
category: motion
tier: T1
family: mask-type
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"adapted"}
licence: Apache-2.0
status: approved
---

### type-retype

- **Looks**: a line is typed on in a monospace face with a blinking cursor; after a few characters it hesitates, the wrong word is deleted character by character, and the right ending is typed, the corrected words briefly highlighted in the accent before the cursor blinks on.
- **Tier**: T1. **Family**: mask-type. **Surface**: canvas.
- **Use**: a claim made by correcting a plainer one ("not a draft, the cut you meant"); a search or command being refined; copy built on a negation. **Not for**: plain titles with nothing to correct (use `type-enter`); lines over about 30 characters (16 Chinese); more than once a film (a second correction reads as a stammer).
- **Intent**: A small drama of hesitate, reject, declare: the viewer sees the plain word thrown out and the real claim typed faster, so the claim reads as a decision.
- **Content**: Three slots on one line: the start that stays, the wrong ending (typed then deleted) and the right ending; ≤ 30 chars in all.
- **Parameters**: `from` an empty line with the cursor, `to` the corrected line. `keep` (the start that stays, en `"Ship "`, zh `"发出"`), `wrong` (typed then deleted, en `"a draft"`, zh `"草稿"`), `then` (the right ending, en `"the cut you meant"`, zh `"你想要的那一版"`); `role` `'mono'`, `size` (en 100, zh 96), `weight` 600, `x` 960, `y` 540, `highlight` true, `cursor` true, `probes` false (comparison points added to `track()`). Roles read: `ink` (text), `dim` (the cursor's off state), `accent` (cursor, highlight).
- **Theory**: a visible correction shows a decision (the "not this, this" contrast); typing pace near reading pace lets the viewer read along (Rayner 1998 on reading rate).
- **Styles**: terminal-like and product looks (phosphor, handset, trace); avoid it in plakat and halftone.
- **Length and easing**: 4 beats, 3–7 from the lengths. Pace per character: en type 2 f, delete 1.5 f, retype 1.5 f; zh type 4 f, delete 2.5 f, retype 3 f; hesitation 16 f, gaps 3.5 f, blink every 10 f, highlight 14 f `EASE.out`.
- **Sound**: `tick` per typed character (a key), `turn` at the first delete.
- **Source**: adapted from video-shotcraft `demos/typography/typewriter-moves/TypewriterErrorRetype.tsx` (card `references/shots/typography/typewriter-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh adapted: Chinese is typed a character at a time at about half the speed of English (no input-method composition is shown, so it reads as dictation rather than a keyboard); the correction is a whole phrase.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no editor window, line numbers, brand or second line; the text is three slots instead of one fixed sentence; Chinese pacing added. The first character appears one step after p = 0, so the from rest is the empty line. Compare: pass (characters shown and highlight front 0 px, progress RMSE 0, events 0; the highlight probe draws the brick's progress over upstream's 860 px, since the brick marks all of `then`).
- **Pitfalls**: It depends on sound: key clicks on every character and a lower backspace; silent, it is just a subtitle machine. Once a film. Keep the monospace face (or one cell per character), or the line reflows as it types.

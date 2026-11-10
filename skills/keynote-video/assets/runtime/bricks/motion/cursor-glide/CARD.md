---
id: cursor-glide
category: motion
tier: T0
family: line-path
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### cursor-glide

- **Looks**: A plain arrow pointer comes in from off frame (or from where it last was) on a decelerating path, rests a moment on its target, presses (it shrinks to 0.86 about its tip for 3 frames, springs back in 4) and an accent ripple leaves the tip (two thin rings 3 frames apart on a page, one ring in a close-up). With several stops it walks a tour, moving on to the next stop while the last click is still springing back.
- **Tier**: T0. **Family**: line-path. **Surface**: canvas.
- **Use**: a user action on an interface: the control the pointer presses is what changes next (a segment, a checkbox, a button, a card), so the change reads as caused. **Not for**: pointing at things without clicking (an arrow or a highlight says it better); a mascot or character acting for the user (the user's action is a plain pointer, decided); long tours of more than four or five stops (it becomes a screen recording).
- **Intent**: A visible hand arrives, slows and presses, so the change that follows reads as caused by the user, not autoplayed.
- **Content**: The scene it plays over and 1–5 click targets (tip positions), each with travel and rest frames; no text.
- **Parameters**: `from` (the scene it plays over, default the grid), `start` [2010, 1190] (off frame lower right), `stops` (each `{ at, travel, wait, ease }`: the tip position, frames to travel, frames to rest before pressing), `ease` `cubicOut` (the entry), `arc` 0 (px the path bows up, eased with the travel), `appear` 0 (frames to fade in), `after` 11 (frames held after the last click), `h` 64 (pointer height; 48 at 1:1 on a page, 150 in a close-up), `form` `solid` | `outline`, `ripple` `{ rings: 2, r: 54, frames: 11, glow: 24 }`. Exports `legsOf(P)` and `glideAt(f, P)` → `{ x, y, press, alpha, ripples }` for scenes that draw the pointer themselves. Roles read: `ink` and `panel` (the arrow and its rim by form), `accent` (the ripple).
- **Theory**: Cause before effect (Michotte 1946): a visible hand that arrives, slows and presses makes the change that follows read as caused, not autoplayed; the press and the ripple are the two halves of a button (`:active`, then confirmed).
- **Styles**: any interface style; avoid films with no interface on screen.
- **Length and easing**: 2.6 beats by default (one stop: 24 frames of travel, 4 of rest, the click, 11 after), 2–8 with stops; travel `cubicOut` for the entry and `swift` between stops; press 3 + 4 frames.
- **Sound**: `accent` on each click (a short tick); nothing for the travel.
- **Source**: adapted from video-shotcraft `demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx` (card `references/shots/interaction/segmented-thumb-hero.md`); adapted from video-shotcraft `demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize.tsx` (card `references/shots/interaction/canvas-materialize-moves.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the brick draws no text).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the brick draws only the pointer and its ripple; the control's response (the thumb sliding, the checkbox ticking) is the scene's or another brick's (`mode-switch`, `row-to-card`). Compare against `segmented-thumb-hero`: pass, 0 px, events ±0.
- **Don't**: show a pointer that wanders before it acts, or one that clicks on nothing; one decisive path, one press.
- **Pitfalls**: The brick draws only the pointer and its ripple; the control must answer in the same frame (another brick or the scene), or the click does nothing. Keep the ripple centred on the click point, not on the moving part, or it reads as a trail. One click is shown once: do not film the same click both as a page and as a close-up.

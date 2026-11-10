---
id: thread-bed
category: sound
energy: mid
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### thread-bed

- **Bed**: `thread` preset of lib/audio (D major, Dmaj7–Bm7–Gmaj7–A); energy peaks at 0.95 on the sheet; mix v2, 60 ms fade-in; 112–128 BPM (default 120), D major, mix v2; sections by arc role {"hook":"intro","claim":"build","turn":"build","demo":"build","proof":"build","rest":"break","climax":"drop","lockup":"outro"}; energy {"hook":0.35,"claim":0.5,"turn":0.55,"demo":0.6,"proof":0.65,"rest":0.4,"climax":0.95,"lockup":0.3}; reading: the merge runs half-time (pad and one kick a bar) so the squelch reads; the ink words and the card hold are pad-only breaks; a 0.2-bar rest before the sheet.
- **Intent**: Sound like the chain looks: every landing heard, the energy rising to the sheet and resolving on the name.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | pluck | {"freq":587} | -18 | – | a centre name, a swatch, a panel, a clip, the counter lands |
  | `accent` | bell | {"freq":1175} | -20 | – | the word's weight swing, the line hitting the stage name, a check |
  | `stamp` | thud | {} | -16 | – | the merged sphere lands; the chosen panel |
  | `turn` | impact | {} | -14 | 0.05 | the flood lands on the downbeat |
  | `claim` | duck | {"depth":-3,"hold":"read"} | – | – |  |
  | `end` | bell | {"freq":1468} | -16 | – | the caret falls flat into the URL's underline on the last downbeat |

  Devices: `path-type`: whoosh; `rail-press`: whoosh; `dot-iris`: riser; `caret-fall`: tick; `weight-swing`: bell; `card-squash`: whoosh.
- **Fits / does not fit**: Reels of video and motion tools; films with many small landings. Not: Films with voice-over; dark or tense subjects.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/thread/score.mjs; timing.rules.js`), split from the thread style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: A film that opens on a hit overshoots the true-peak ceiling after AAC encoding: keep the 60 ms fade-in.

---
id: drafting-bed
category: sound
energy: mid
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### drafting-bed

- **Bed**: `blueprint` preset of lib/audio (arpeggio, pads, E); energy rises by sheet type and peaks at 0.9 on the final overview; mix v1 by default (the template keeps v1); 92–108 BPM (default 100), E, mix v1; sections by arc role {"hook":"intro","problem":"intro","claim":"build","turn":"build","demo":"drop","proof":"drop","climax":"drop","rest":"break","lockup":"outro"}; energy {"hook":0.4,"problem":0.4,"claim":0.5,"turn":0.55,"demo":0.6,"proof":0.65,"climax":0.9,"rest":0.5,"lockup":0.5}; reading: duck.
- **Intent**: Sound like a drawing office at work: soft, exact, and with one heavy thud each time something is certified.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | rim | {"freq":1350} | -22 | – | a line of lettering is drawn (pen) |
  | `tick` | rim | {"freq":820} | -20 | – | a box lands, with a 95 Hz thud at −22 dB |
  | `accent` | pop | {"freq":620,"decay":0.06,"sweep":3} | -23 | – | an amber mark: revision triangle, underline, bracket |
  | `hit` | tom | {"freq":170,"decay":0.12} | -16 | – | the exploded view snaps into its chain (clack) |
  | `stamp` | stamp | {"freq":760,"to":120,"decay":0.09} | -11 | – | a stamp lands; a 46 Hz impact under it, the bed ducks −4 dB |
  | `turn` | whoosh | {"dur":0.6,"up":false,"lo":350,"hi":2600} | -27 | – | the camera travels to the next sheet; a probe run (whoosh up with a low swell) |
  | `claim` | duck | {"depth":-4,"hold":"read"} | – | – |  |
  | `end` | rim | {"freq":2600} | -19 | – | RELEASED lettered on the last downbeat |

  Devices: `route-pan`: whoosh; `blueprint-expose`: tick; `shape-flood`: whoosh; `occluder-pass`: whoosh.
- **Fits / does not fit**: Calm, precise system films; technical launches drawn as diagrams. Not: Energetic hype films; films with voice-over; films without a camera that moves.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v1.
- **Source**: own (`assets/templates/blueprint/score.mjs; timing.rules.js (MUSIC, bpm)`), split from the template of the blueprint style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The stamp duck is −4 dB: with four stamps a minute the bed pumps; keep to the mode's four-stamp limit.

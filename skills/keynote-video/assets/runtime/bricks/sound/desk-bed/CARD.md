---
id: desk-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### desk-bed

- **Bed**: preset `swiss`; 112–128 BPM (default 120), C major pentatonic, mix v2; sections by arc role {"hook":"intro","demo":"build","proof":"build","turn":"drop","climax":"drop","claim":"drop","lockup":"outro"}; energy {"hook":0.4,"demo":0.5,"proof":0.5,"turn":0.85,"climax":0.85,"claim":0.85,"lockup":0.5}; reading: rest the marimba line while text is read (build only).
- **Intent**: Paper and pencil: dry wood under small precise marks, so each ring is heard as a pencil touching the page.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | thud | {"freq":80,"decay":0.1} | -13 | – | the camera arrives, the mount lands, the readings land |
  | `ring` | rim | {"freq":1500} | -15 | – | a pencil ring starts (+120 Hz for each next ring); also the rule, the route and the last ring |
  | `hook` | whoosh | {"up":false,"lo":250,"hi":4200,"peak":0.55} | -19 | – | the camera rises off the print (the open); a pop at 480 Hz as the caption begins |
  | `accent` | tick | {"freq":3800} | -10 | – | the match cut (a riser into it, a falling whoosh out of it) |
  | `claim` | impact | {"depth":-4,"lead":0.12,"release":0.8} | -12 | – | the measured gap lands; four ticks rise under the dimension, a riser a second before |
  | `lockup` | impact | {"freq":52} | -13 | – | the name lands over the whole desk |
  | `type` | typeKey | – | -25 | – | the address types (one key every two characters) |

  Devices: `parallax-slide`: whoosh; `grid-hop`: whoosh; `lift-out`: whoosh; `match-cut`: riser.
- **Fits / does not fit**: Calm evidence films: tables, charts, reports. Not: Hype reels; voice-over films (duck it).
- **Master**: -14 LUFS, true peak ≤ -2 dBTP, tone v2.
- **Source**: own (`assets/templates/exhibit/score.mjs`), split from the exhibit style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

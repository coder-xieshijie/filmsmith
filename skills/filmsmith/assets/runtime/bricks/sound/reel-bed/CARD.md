---
id: reel-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### reel-bed

- **Bed**: preset `thread`; 112–128 BPM (default 120), D major, mix v2; sections by arc role {"hook":"intro","claim":"build","demo":"build","turn":"break","proof":"build","climax":"drop","lockup":"outro"}; energy {"hook":0.55,"claim":0.45,"demo":0.6,"turn":0.5,"proof":0.5,"climax":0.85,"lockup":0.5}; reading: drop the plucked line while an intertitle or a caption is read (build).
- **Intent**: A projector’s mechanism under a light reel bed: each pull-down is heard.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `pull` | tick | {"freq":2300,"decay":0.004,"noise":0.5} | -15 | – | every claw pull-down (+90 Hz a step, five steps) |
  | `land` | thud | {"freq":78,"decay":0.1} | -13 | – | a frame registers, the full frame lands |
  | `hook` | stamp | {"freq":1000,"to":260,"decay":0.05} | -15 | – | the hook line registers |
  | `track` | swell | {"freqs":["D4","F#4","A4"],"dur":0.75} | -31 | – | the optical track lights |
  | `accent` | stamp | {"freq":1200,"to":300,"decay":0.05} | -15 | – | the measured lengths; the pencil closes its loop (1400 Hz) |
  | `claim` | impact | – | -12 | – | the pick lands at full size; a riser half a second before |
  | `lockup` | impact | {"freq":52} | -13 | – | the name settles |
  | `type` | typeKey | – | -25 | – | the address types (one key every two characters) |

  Devices: `strip-advance`: whoosh; `gate-punch`: whoosh; `sheet-pick`: riser; `pencil-loop`: whoosh.
- **Fits / does not fit**: Films about films; showreels with a mechanical rhythm. Not: Voice-over films (duck it); ambient pieces.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/strip/score.mjs`), split from the template of the strip style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

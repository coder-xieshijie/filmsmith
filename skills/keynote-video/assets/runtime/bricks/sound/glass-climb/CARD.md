---
id: glass-climb
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### glass-climb

- **Bed**: lib/audio preset `glass`, the morph template's bed (chords Emaj9, C#m9, Amaj7#11, B7sus4; layers: pad; pluck arpeggio (eighths); muted kick and offbeat hats growing with the energy; drop: four on the floor, claps, sixteenth hats, bass every beat; outro: felt keys and a pad on the home chord); 112–128 BPM (default 120), E major, mix v2; sections by arc role {"hook": "intro", "demo": "build", "turn": "build", "climax": "drop", "lockup": "outro"}; energy {"hook": 0.3, "demo": 0.5, "turn": 0.65, "climax": 0.95, "lockup": 0.45}; reading: duck.
- **Intent**: Energy rises with each dimension, so the climb is heard before the climax.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | thud | {"freq": 85, "decay": 0.09, "click": "tick 2600 Hz"} | -16 | – | a key hit: the point lands, the card fills |
  | `accent` | pop | {"freq": 700, "decay": 0.05, "sweep": 3} | -19 | – | the accent moves to the next part (token, chip, Run) |
  | `turn` | whoosh | {"dur": 0.34, "lo": 300, "hi": 3000} | -20 | 0.05 | a container transform or a morph |
  | `hit` | impact | {"freq": 55, "decay": 0.35} | -21 | – | the press; the flood covers the frame |
  | `tick` | tick | {"freq": 2600} | -24 | – | a tab changes; a body line lands |
  | `type` | typeKey | {} | -26 | – | the closing command types on |
  | `claim` | duck | {"depth": -4, "hold": "read"} | – | – |  |
  | `end` | bell | {"note": "E6", "dur": 1.2} | -24 | – |  |

  Devices: `stroke-reinterpret`: pluck; `outline-morph`: whoosh.
- **Fits / does not fit**: Developer launches that build to one running moment. Not: Calm explainers; films without a climax.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/morph/score.mjs`), split from the morph style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Energy shapes the layers themselves and adds no bed level: keep it rising scene by scene, or the climb is not heard.

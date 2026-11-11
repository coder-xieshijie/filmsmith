---
id: data-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### data-bed

- **Bed**: preset `data`; 104–120 BPM (default 112), F lydian, mix v2; sections by arc role {"hook": "intro", "demo": "build", "turn": "drop", "proof": "drop", "rest": "break", "lockup": "outro"}; energy {"hook": 0.35, "demo": 0.6, "turn": 0.8, "proof": 0.8, "rest": 0.4, "lockup": 0.5}; reading: duck.
- **Intent**: Many small landings become a phrase: pitches walk up the scale, so counting sounds like progress.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `tick` | tick | {"freq": 3000} | -19 | – | count steps, thinning with the ease |
  | `land` | thud | {"freq": 70, "walk": "F lydian"} | -16 | – | a band, bar, segment or column lands |
  | `accent` | chime | {"notes": 1} | -20 | – | the protagonist lights |
  | `turn` | whoosh | {"dur": 0.35} | -20 | 0.3 | the squares regroup |
  | `hit` | stamp | {} | -14 | – | the roulette locks |
  | `claim` | duck | {"depth": -4, "hold": "read"} | – | – |  |
  | `end` | chime | {"notes": 3} | -12 | – |  |

  Devices: `rank-sweep`: swell; `roulette-lock`: tick.
- **Fits / does not fit**: Counting and data stories; any film made of many small landings. Not: Launch films that need a drop; voice-over films (duck it instead).
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/tally/score.mjs`), split from the template of the tally style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

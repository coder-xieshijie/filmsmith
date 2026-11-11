---
id: diagram-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### diagram-bed

- **Bed**: preset `diagram`; 92–108 BPM (default 100), C major, mix v2; sections by arc role {"hook": "intro", "problem": "build", "demo": "build", "proof": "break", "climax": "drop", "claim": "outro"}; energy {"hook": 0.3, "problem": 0.45, "demo": 0.55, "proof": 0.5, "climax": 0.8, "claim": 0.4}; reading: duck.
- **Intent**: A quiet bed leaves room to think; each step of the run has its own small sound.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `tick` | tick | {"freq": 2400, "decay": 0.008, "noise": 0.15} | -21 | – | a row or a count segment appears |
  | `land` | pluck | {"dur": 0.6} | -20 | – | a pair fuses into one token |
  | `accent` | tick | {"freq": 2800} | -22 | – | the active pair is lit |
  | `turn` | whoosh | {"dur": 0.5, "up": true, "lo": 320, "hi": 3000} | -25 | 0.2 | a loop of steps; a trace across the frame |
  | `hit` | glitch | {"dur": 0.25} | -26 | – | an unseen word resolves |
  | `claim` | duck | {"depth": -4, "hold": "read"} | – | – |  |
  | `end` | chime | {"notes": 2} | -16 | – |  |

  Devices: `token-sweep`: tick; `path-type`: whoosh.
- **Fits / does not fit**: Explainers of a running mechanism; quiet, legible films. Not: Launch films with a big climax.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/trace/score.mjs`), split from the template of the trace style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

---
id: device-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### device-bed

- **Bed**: preset `data`; 112–128 BPM (default 120), F, mix v2; sections by arc role {"hook":"intro","demo":"build","turn":"build","proof":"drop","climax":"drop","lockup":"outro"}; energy {"hook":0.35,"demo":0.5,"turn":0.6,"proof":0.72,"climax":0.9,"lockup":0.5}; reading: drop the melodic layer under the claim.
- **Intent**: A soft steady groove under small precise sounds, so each landing on the screen is heard as a click of a real device.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | tick | {"freq":2400} | -13 | – | a push, a feed, a scroll or a band lands |
  | `accent` | tick | {"freq":2900} | -13 | – | a cut, a band hop, a ring closing |
  | `hook` | chime | {"freq":1396.9} | -15 | – | the screen lights |
  | `turn` | whoosh | {"dur":0.38,"up":true,"lo":300,"hi":2600,"peak":0.35} | -21 | – | a feed rises |
  | `claim` | impact | {"freq":46,"decay":0.8} | -9 | – | then chime, with a duck |
  | `end` | bell | {"freq":698.5,"dur":2.4} | -16 | – | + thud |

  Devices: `scroll-reel`: whoosh; `device-flip`: whoosh + thud on the swap; `viewport-push`: whoosh.
- **Fits / does not fit**: Calm launch films on one device; product demos whose motion is small and precise. Not: High-energy reels that need a big drop every few seconds; voice-over films (duck it instead).
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/handset/score.mjs`), split from the handset style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

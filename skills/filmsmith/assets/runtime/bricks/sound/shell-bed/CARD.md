---
id: shell-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### shell-bed

- **Bed**: preset `terminal`; 112–128 BPM (default 120), A minor, mix v2; sections by arc role {"hook":"intro","demo":"build","proof":"build","climax":"drop","lockup":"outro"}; energy {"hook":0.35,"demo":0.52,"proof":0.62,"climax":0.82,"lockup":0.5}; reading: the melodic layer out while the climax’s claim is read (drop, reading).
- **Intent**: The keyboard and the seam are heard: typing, ticks, air as the seam moves.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `type` | typeKey | {"depth":-2,"bus":"pump"} | -27 | – | one key per typed character (not spaces); the pulse ducked 2 dB while typing |
  | `pull` | rim | {"freq":1500} | -22 | – | the pick’s tick hops to the next item |
  | `tick` | tick | {"freq":3400,"decay":0.005} | -26 | – | a report line lands |
  | `land` | tick | {"freq":2400} | -13 | – | the seam lands, a frame cuts in |
  | `accent` | tick | {"freq":2900} | -13 | – | a token paired, an output frame cut |
  | `hook` | chime | {"freq":1760} | -15 | – | the caret stands up into the seam (+ a tick) |
  | `claim` | impact | {"freq":46,"decay":0.8} | -9 | – | the slider lands on the bar line |
  | `lockup` | bell | {"freq":880,"dur":2.4} | -16 | – | the name lands |
  | `turn` | whoosh | {"up":true,"lo":350,"hi":5200,"peak":0.5} | -19 | – | a move of the seam starts (see devices) |

  Devices: `split-open`: whoosh; `louvre`: tick; `seam-push`: whoosh; `wipe-line`: whoosh; `split-branch`: whoosh; `diff-slider`: whoosh; `seam-close`: whoosh.
- **Fits / does not fit**: Developer-tool films whose input side is a shell or an editor. Not: Voice-over films (duck it); ambient pieces.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/split/score.mjs`), split from the template of the split style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: none known.

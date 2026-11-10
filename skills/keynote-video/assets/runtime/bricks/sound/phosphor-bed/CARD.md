---
id: phosphor-bed
category: sound
energy: high
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### phosphor-bed

- **Bed**: `terminal` preset of lib/audio (synth bass, hats, pad, A minor); energy peaks at 0.95 on the tagline; mix v2; 120–136 BPM (default 128), A minor, mix v2; sections by arc role {"hook":"intro","problem":"build","claim":"build","turn":"build","demo":"drop","proof":"drop","climax":"drop","rest":"break","lockup":"outro"}; energy {"hook":0.5,"problem":0.5,"claim":0.55,"turn":0.6,"demo":0.65,"proof":0.7,"climax":0.95,"rest":0.45,"lockup":0.5}; reading: the pad thins under a page whose primary text takes ≥ 60 % of it (bass and hats stay); the claim and the tagline duck the bed.
- **Intent**: Sound like a terminal at night with a beat under it: precise keys, clean ticks, one big rush.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | pop | {"freq":520} | -17 | – | a pick, a hub, a problem tag lands |
  | `accent` | tick | {"freq":2600} | -19 | – | an option, a chip, a decision, a check appears |
  | `stamp` | stamp | {} | -12 | – | the key word grows, a confirmation passes, an output lights |
  | `turn` | whoosh | {"dur":0.42} | -21 | 0.12 | a title flies, the slit closes; the collapse is a riser into the burst |
  | `claim` | duck | {"depth":-4,"hold":"read"} | – | – |  |
  | `end` | stamp | {} | -12 | – | the first chip lights on the last downbeat (the rest tick) |

  Devices: `cursor-collapse`: riser; `glyph-decode`: glitch; `crt-collapse`: whoosh; `container-morph`: whoosh.
- **Fits / does not fit**: CLI and infrastructure launches; films with typing and a climax. Not: Calm or warm films; films with voice-over.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/phosphor/score.mjs; timing.rules.js`), split from the phosphor style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Typing keys under long Chinese lines get dense: the cue plays one key per two characters.

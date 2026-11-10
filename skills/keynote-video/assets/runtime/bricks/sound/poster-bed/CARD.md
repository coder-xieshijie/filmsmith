---
id: poster-bed
category: sound
energy: mid
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### poster-bed

- **Bed**: `swiss` preset of lib/audio (marimba, wood, bass, light kick); tension rises 0.04 per chapter and peaks on the tagline; the install page is the one pad-only break, its last two bars build back (intro, build) so the tagline does not return from silence; 112–128 BPM (default 120), C major pentatonic, mix v2; sections by arc role {"hook":"build","problem":"build","claim":"build","turn":"drop","demo":"drop","proof":"drop","climax":"drop","rest":"break","lockup":"outro"}; energy {"hook":0.45,"problem":0.45,"claim":0.5,"turn":0.55,"demo":0.55,"proof":0.6,"climax":0.85,"rest":0.55,"lockup":0.5}; reading: rest the marimba line on a page whose primary text takes ≥ 60 % of it (wood, bass and kick stay).
- **Intent**: Sound that sounds designed, not produced: wood and marimba on a grid of beats, and one bright voice that always means a person deciding.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | thud | {"freq":84,"decay":0.1} | -13 | – | a big line lands; low landings add a tom (98 Hz) and duck the bed −4 dB |
  | `tick` | rim | {"freq":1550} | -12 | – | a row, a step or a node appears (soft: 1900 Hz, −16 dB) |
  | `count` | marimba | {"scale":"C pentatonic up","dur":0.5} | -13 | – | a counter steps up; with a 3 kHz tick |
  | `accent` | marimba | {"notes":[79,84,88,91],"dur":0.9,"swish":true} | -12 | 0.1 | an accent block wipes in: the person or their decision (ink blocks keep only the swish) |
  | `turn` | whoosh | {"dur":0.6,"lo":250,"hi":5000} | -15 | 0.05 | the full-width accent wipe; a 64 Hz thud as it covers the frame |
  | `stamp` | stamp | {"freq":760,"to":130,"decay":0.09} | -8 | – | an ink flag or a seal lands; ducks the bed −5 dB |
  | `type` | typeKey | {"rate":72} | -20 | – | a command types (one key every two characters) |
  | `claim` | duck | {"depth":-4,"hold":"read"} | – | – |  |
  | `end` | rim | {"freq":2600} | -19 | – | the closing underline on the last downbeat |

  Devices: `plakat-columns`: stamp; `step-wipe`: rim; `counter-portal`: whoosh; `block-carry`: whoosh; `slot-rails`: rim; `aperture-swap`: kick.
- **Fits / does not fit**: Calm, decided films on paper: Swiss-style keynotes, step-by-step product stories. Not: Dark spectacle films; films that need a drop every few seconds; voice-over films (the marimba line competes with speech).
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/plakat/score.mjs, timing.rules.js`), split from the plakat style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The bright marimba stroke is reserved for the accent: cue ink blocks with `tick` or `stamp`, or the colour code breaks in sound.

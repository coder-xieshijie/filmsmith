---
id: inkbeat-bed
category: sound
energy: high
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### inkbeat-bed

- **Bed**: lib/audio preset `inkbeat` (written at 128, plays at the film's tempo); 120–136 BPM (default 124), F minor, mix v2; sections by arc role: hook, problem, turn → build (no kick: hats, percussion, a resonant pulse opening, a riser); climax (the name), demo, proof → drop (kick, rolling bass, claps), easing from 1 to 0.8; claim → the second drop after a rebuild bar; lockup → outro; reading ducks.
- **Intent**: The type is the percussion: every slam has its stamp, and the two drops are the two things to remember.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | stamp | thud 80 Hz | −13 | – | a word slams; a value lands; the dot lands |
  | `tick` | tick | 2400 Hz | −20 | – | a step; a width jump |
  | `accent` | pop | 700 Hz | −18 | – | the warped word rises; a stop buds |
  | `hit` | impact | rim | −12 | – | the burst; the claim on the whiteout |
  | `drop` | impact | chime | −12 | – | the name rises (first drop) |
  | `hop` | thud | 70 Hz | −18 | – | the dot hops |
  | `turn` | whoosh | 0.25 s | −18 | 0.25 | the bar window, the scan, the iris |
  | `type` | typeKey | – | −27 | – | a label or the command types |
  | `bell` | bell | – | −14 | – | the dot lands as the cursor |
  | `end` | chime | 2 notes | −15 | – | the last downbeat |

  Devices: collapse-burst riser; counter-portal rising whoosh; whiteout-slam impact with rim and chime; aperture-swap tick.
- **Fits / does not fit**: beat-cut type films with a name and a claim. Not: calm explainers, voice-over.
- **Master**: −14 LUFS, true peak ≤ −1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/ink/score.mjs`) and lib/audio's `inkbeat`. **Licence**: MIT (Filmsmith). The template's ink drip (a rising sine blip for the bloom) stays in the recipe with the bloom.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Keep the half bar of silence before each drop.

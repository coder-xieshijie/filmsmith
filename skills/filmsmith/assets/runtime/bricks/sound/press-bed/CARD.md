---
id: press-bed
category: sound
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### press-bed

- **Bed**: lib/audio preset `press`, the halftone template's bed (chords Dm9, Bbmaj7, Gm9, A7sus4; layers: pad; 3-3-2 rim and tick ostinato; half-time kick, offbeat hats, bass on 1 and 3 (build); four on the floor, offbeat bass, plucked arpeggio (drop); a rest silences the bed, the outro rings D6add9); 112–128 BPM (default 120), D minor, mix v2; sections by arc role {"hook": "intro", "demo": "build", "proof": "drop", "climax": "break", "lockup": "outro"}; energy {"hook": 0.3, "demo": 0.6, "proof": 0.75, "climax": 0.5, "lockup": 0.6}; reading: duck.
- **Intent**: The rhythm of a printing press sets the film in a print shop, and its silence makes the pull-back land.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `hit` | thud | {"freq": 60, "decay": 0.2} | -14 | – | the anchor lands; the anchor strikes (the burst) |
  | `land` | stamp | {} | -18 | – | a word lands (a press impression) |
  | `turn` | whoosh | {"dur": 0.3} | -20 | 0.15 | a field morph, a whip, a scan, an iris |
  | `tick` | tick | {"freq": 2400} | -22 | – | a field steps; a count steps |
  | `accent` | rim | {} | -20 | – | a cell appears |
  | `claim` | duck | {"depth": -4, "hold": "read"} | – | – |  |
  | `end` | impact | {"freq": 50, "chord": "Dm9"} | -14 | – | the lock-up bar line |

  Devices: `dot-quantize`: glitch; `collapse-burst`: riser.
- **Fits / does not fit**: Print-styled launches; anything with one recurring brand piece. Not: Screen-based demos; soft films.
- **Master**: -14 LUFS, true peak ≤ -1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/halftone/score.mjs`), split from the template of the halftone style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Give the push-in before the lock-up a rest section: without that silence the pull-back does not land.

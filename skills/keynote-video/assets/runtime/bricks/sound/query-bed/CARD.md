---
id: query-bed
category: sound
energy: high
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### query-bed

- **Bed**: lib/audio preset `query` (the pulse template's bed; chords Dm9 · Bbmaj7 · Gm9 · A7sus4, from the drop's bar Dm9 · Bbmaj9 · Fmaj9 · C6; a drop section after the climax eases 2.5 dB); 112–120 BPM (default 120), D minor, mix v2; sections by arc role: hook, problem, turn, demo → build; climax → drop; proof → break; lockup → outro; energy 0.45 → 1.0 at the climax → 0.4; reading: the query synth rests under reading scenes.
- **Intent**: The pulse is audible: something lands on every beat, the build falls silent for one beat, and the answer hits with the drop.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | stamp | thud 70 Hz | −14 | – | a word lands at the anchor; a figure lands |
  | `tick` | tick | 2600 Hz | −21 | – | an aperture opens; a known candidate is hopped |
  | `accent` | pop | 900 Hz | −19 | – | a new candidate is hopped |
  | `hit` | chime | 1 note, stamp | −14 | – | the answer locks |
  | `turn` | whoosh | 0.15 s | −18 | 0.15 | the whip; the slice |
  | `type` | typeKey | – | −27 | – | the query line types |
  | `claim` | duck | −3 dB, held while read | – | – | the reveal's line |
  | `end` | chime | 2 notes | −14 | – | the closing flip |

  Devices: `whiteout-slam` impact with rim and chime; `symbol-scramble` glitch; `counter-portal` rising whoosh; invert impact and rim; a failed search a low thud and bell.
- **Fits / does not fit**: question-and-answer films cut to the beat. Not: calm explainers, voice-over, films without one climax.
- **Master**: −14 LUFS, true peak ≤ −1.5 dBTP, tone v2.
- **Source**: own (`assets/templates/pulse/score.mjs`), split from the pulse style of keynote-video. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The drop belongs to the whiteout only; no second hit as loud.

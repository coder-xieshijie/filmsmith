---
id: paper-bed
category: sound
energy: low
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### paper-bed

- **Bed**: lib/audio preset `diagram` (felt keys), E♭, 100–124 BPM (default 120), mix v2; one build section per exhibit (energy 0.42 rising by 0.18 over the file), the drop on the result's struck claim (the climax key, not the scene's start), the outro under the lock-up; reading: the bed ducks under a claim.
- **Intent**: Sound like a desk, not a trailer: restrained paper on a quiet bed, with one drop for the proof.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `accent` | scratch (felt tip: 3.4 kHz, width 0.7, depth 0.35) | the stroke's length | −25 | – | every highlighter stroke |
  | `land` | stamp + thud | 640→160 Hz, 90 Hz | −16 | – | the first stroke lands; the slip is laid (the sticker −13) |
  | `tick` | stamp | 760→220 Hz | −19 | – | an index tab; the worksheet tab |
  | `turn` | whoosh | 300–2200 Hz, down | −24 | – | a sheet slides off; dealt on −23; the band moves −28 |
  | `claim` | impact + stamp + tick | 52 Hz | −12 | – | the result's claim struck (the drop) |
  | `pop` | stamp | 820→300 Hz | −26 | – | a tail move |
  | `end` | whoosh | 0.4 s, up | −23 | – | the URL underlined |

  Devices: `page-turn` air then a rim and thud; `sheet-shuffle` two slides and a tap; `louvre` a ripple of six ticks; `match-cut` a rim on the cut; `split-open` a blade tick and a slide; the lock-up an impact (46 Hz) with the bed ducked −4 dB.
- **Fits / does not fit**: evidence films. Not: hype teasers, hard-cut type films.
- **Master**: −14 LUFS, true peak ≤ −1.5 dBTP, tone v2.
- **Source**: own (the dossier source film) and lib/audio's `diagram`. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: No typewriter, no camera shutter, no ticking clock.

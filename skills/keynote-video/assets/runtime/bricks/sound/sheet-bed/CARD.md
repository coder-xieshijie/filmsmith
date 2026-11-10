---
id: sheet-bed
category: sound
energy: mid
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-bed

- **Bed**: lib/audio preset `thread` (120 BPM, D major, Dmaj7–Bm7–Gmaj7–A); 112–128 BPM (default 120), mix v2; sections by arc role: hook → intro; problem, demo, proof → build (reading: the melody rests); climax → drop (0.85); lockup → outro.
- **Intent**: One long line that keeps moving, like the sheet, with a small sound for every move of it.
- **Cues**:

  | Event | Voice | Options | Gain dB | Lead s | When |
  |---|---|---|---|---|---|
  | `land` | rim + thud | 1250 Hz, 85 Hz | −14 | – | a scroll lands |
  | `tick` | tick | 3200 Hz, rising | −17 | – | a ratchet step |
  | `accent` | tick | 3600 Hz | −15 | – | the underline starts; a phrase enters (a pop) |
  | `turn` | whoosh | 0.3 s, dry | −20 | 0.1 | a scroll moves |
  | `claim` | impact | chime, rolled | −14 | – | the claim in the unfold |
  | `type` | typeKey | – | −27 | – | the address types |
  | `end` | chime | 2 notes | −15 | – | the roll lands |

  Devices: unfold a paper swell; scroll-fling a riser; roll a thud.
- **Fits / does not fit**: films read off a page. Not: hard-cut type films, dark teasers.
- **Master**: −14 LUFS, true peak ≤ −1.5 dBTP, tone v2.
- **Source**: own (the source film) and lib/audio's `thread`. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The melody rests while a band is read.

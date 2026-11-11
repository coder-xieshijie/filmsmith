---
id: stream-bed
category: sound
energy: mid
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### stream-bed

- **Bed**: `terminal` preset of lib/audio (a steady filtered synth pulse, soft kick, off-beat hats, sub and pad), 120–132 BPM (default 128), A minor, mix v2; sections by arc role {hook: build, problem: build, turn: break, demo: build, proof: build, climax: drop, claim: build, rest: intro, lockup: outro}; energy {hook 0.62, problem 0.4, turn 0.12, demo 0.45, proof 0.55, climax 0.95, claim 0.55, rest 0.32, lockup 0.5}; reading: the bed thins under a chat block or caption being read, breaks to 0.12 under the freeze line, and each of the three peaks drops to 0.8–0.95.
- **Intent**: Sound like quiet work at night with a pulse under it: small exact sounds, one alert.
- **Content**: The arc roles and their scenes; cues from the scenes' plans.
- **Cues**:

  | Event | Voice | Options | Gain dB | When |
  |---|---|---|---|---|
  | `land` | thud | {freq 70, decay 0.16} | −13 | the mascot lands; a word of the claim lands (with a pluck) |
  | `stamp` | stamp | {freq 420 → 110, decay 0.09} | −16 | the gate stops the item |
  | `turn` | whoosh | {dur 0.45, 300–4000 Hz} | −24 | a block folds back into the thread; the sweep starts |
  | `accent` | impact | {} | −13 | a peak: taut, the constellation links, the panel opens (with a three-note chime E6 and a 4 dB duck) |
  | `claim` | duck | {depth −6, hold read} | – | the one "needs you": the three-note alert, the film's only alert |
  | `end` | chime | {notes 2, decay 0.55} | −21 | the tagline |

  Devices: `thread-pierce`: tick (2200 Hz, −27) per item; `reel-in`: rising whoosh; `hook-unfold`: whoosh; `star-launch`: pluck up an A-minor pentatonic (A4 C5 D5 E5 G5 A5 C6 D6); `beam-return`: chime (A5, C6, E6); `star-sweep`: riser, a tick per star; `strand-zoom`: whoosh.
- **Fits / does not fit**: Films of agents and background work; films with many small events and three peaks. Not: Films with voice-over; loud or aggressive subjects.
- **Master**: −14 LUFS, true peak ≤ −1.5 dBTP, tone v2.
- **Overlaps**: `phosphor-bed` and `shell-bed` use the same `terminal` preset; this one differs in its cues (no typing; ticks, plucks, chimes, one alert) and its three drops.
- **Source**: own (`assets/templates/stream/…`: `score.mjs; sched.js (music, cues); timing.rules.js`), split from the template of the stream style. **Licence**: MIT (Filmsmith).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The three-note alert is used once, on the one row that needs the user: a second alert spends it. Pluck pitches climb a pentatonic per star; past eight stars they wrap, so keep launched stars under about eight before the sweep.

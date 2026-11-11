---
id: narration-pad
category: sound
energy: low
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### narration-pad

- **Bed**: recipe (no lib/audio preset): Fmaj7 → Cmaj7/E → Am7 → G6, 8 s each, a 32 s loop, chords crossfading 1.2 s; summed sines with a slow tremolo, echo 120/260 ms, low-pass 2.4 kHz; fades in 3 s and out 4 s; at half volume under the voice. Every middle role is the same pad-only break (energy 0.2); the hook fades it in, the lock-up out.
- **Intent**: Keep the room warm without competing with the voice; mark what lands with small sounds.
- **Cues**: `turn` whoosh (pink noise, band 900 Hz, 0.9 s, lead 0.35 s) −18 dB on a push-in or zoom · `tick` 1.32 kHz 0.12 s −22 dB on a count, pill, check or lamp · `accent` paper rub (`paper`, 0.32 s) −23 dB on a label or chip · `land` tick −20 dB on the counter's hop · `hit` thud 92 Hz −16 dB on the stamp · `claim` ducks the pad −4 dB while read · devices: `hand-mark` pen scratch (`scratch`, 0.34 s) −26 dB, `layer-zoom` whoosh, `msg-hop` tick −24 dB.
- **Fits / does not fit**: narrated explainers. Not: music-driven films.
- **Master**: −16 LUFS with the voice, true peak ≤ −1.5 dBTP.
- **Styles**: made for `terminal-ledger`, `blueprint-zoom` (recipes the terminal-ledger recipe, the blueprint-zoom recipe); hosts: teach.
- **Source**: own (`skills/filmsmith/scripts/voice/voice.py step_audio; kits build/assemble.cjs (bed volume 0.5)`), split from terminal-ledger and blueprint-zoom kit. **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full: Chinese in LXGW WenKai as in the kit, floor 28 px; English in Source Serif 4 (IBM Plex Mono for logs), floor 25 px; ✓ and › drawn as strokes in both.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from terminal-ledger and blueprint-zoom kit (example film the source film, the source film), so the compare is waived. Checked instead side by side with the example film at the same moments: the terminal-ledger recomposition and the blueprint-zoom recomposition (the recipe's Recomposition). Intended departures: the kit's DOM and GSAP timeline redrawn in Canvas2D as a pure function of time; colours by role from the look; times in seconds from the scene's start (the narration's anchors), converted at the film's BPM; English text and fonts added.
- **Pitfalls**: Never raise the pad to fill a pause.

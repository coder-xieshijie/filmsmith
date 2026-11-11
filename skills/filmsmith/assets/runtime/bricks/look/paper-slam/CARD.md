---
id: paper-slam
category: look
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### paper-slam

- **Looks like**: black extra-condensed capitals slammed one word a beat on warm paper, each word's full stop an accent dot that hops, bursts, blooms, scans and finally becomes a cursor; a night section in the middle; a faint orange ghost on impact frames.
- **Intent**: Type as percussion: every word is a hit on paper, and one dot carries every cut, so the film reads as one gesture.
- **Fits / does not fit**: launch films and teasers cut to a beat, 20–45 s. Not: calm explainers, screenshots, many numbers, long sentences.
- **Palette presets**:

  | id | name | paper | ink | soft | accent | night · nightInk · nightAccent | mis | ink/ground | accent/ground |
  |---|---|---|---|---|---|---|---|---|---|
  | `cobalt` | Cobalt | #EFEEE8 | #111214 | #52545A | #2B3BFF | #111214 · #EFEEE8 · #6B78FF | #FF5A1F | 16.12 | 5.69 |
  | `vermilion` | Vermilion | #EFEEE8 | #111214 | #595250 | #C8321A | #111214 · #EFEEE8 · #FF6A45 | #1F6BFF | 16.12 | 4.6 |
  | `forest` | Forest | #EFEEE8 | #111214 | #4E5451 | #0E6A48 | #111214 · #EFEEE8 · #3CC48C | #FF5A1F | 16.12 | 5.69 |
  | `carbon` | Carbon (dark) | #16161A | #EEEDE6 | #BFB8B6 | #FF5B2E | #EEEDE6 · #16161A · #C23A16 | #2B3BFF | 15.37 | 5.83 |

  Roles: ground paper, ink, dim soft, panel and line night, accent (on the accent field the type is `onAccent`), plus night, nightInk, nightSoft, nightAccent (the dot on night) and mis (the ghost). `kit.js groundHex / inkOn / dotOn` give the colours on each ground. Accent means the dot and what it becomes.
- **Type**: display Archivo 900 on its width axis (zh stack: Archivo, Noto Sans SC 900 as 长体); mono IBM Plex Mono 500 (the command 600). Licences OFL-1.1.
- **Type scale**: 28 (labels) · 40 (the command) · 140–225 (the name) · 160–260 (the claim) · 180–280 (a number) · 200–300 (steps) · 220–330 (slams); floors as given.
- **Tracking, case, italic, leading**: words −0.02 em, the name and the claim −0.035 em, labels +0.12 em; capitals in English (display and labels); Chinese 0 tracking (labels 0.04 em), no case, no italic; widths: words extra-condensed, the name and the claim normal, the name jumps condensed → semi → extra → semi → normal; Chinese 长体 0.8 / 0.86 / 0.93 / 1 (`type.zhWidth`).
- **Grid and frame**: 1920 × 1080, 150 px margins; baselines 640 (one line), 520 · 830 (two lines); the full stop 0.05 em after the last glyph, radius 0.062 em, on the baseline.
- **Camera**: ambient push from the scene's start (1.4 %/s easing into a 6.5 % ceiling) and a 5 % punch-in on every landing (look.camera).
- **Texture and light**: seeded grain 10 % overlay; the misregistration ghost (alpha 0.4, 5 px right, 3 px up, 0.1 s) on slam impact frames; no glow.
- **Source**: own (`assets/templates/ink/palettes.js`, `film.js`), split from the template of the ink style. **Licence**: MIT; fonts OFL-1.1 (Archivo, IBM Plex Mono, Noto Sans SC).
- **Languages**: en full · zh adapted: display words in Noto Sans SC 900 set as 长体 (0.8 wide at the words' extra-condensed width, 1 at the name's normal width; look.type.zhWidth), no capitals, no negative tracking; labels Noto Sans SC 500 with 0.04 em tracking; one 词 a beat.
- **Sample**: `poster.jpg`, an English still 480 px wide.

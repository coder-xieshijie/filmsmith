---
id: query-ramp
category: look
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### query-ramp

- **Looks like**: big condensed black words on flat grounds that step through one hue's lightness on the beat, a quiet mono line under them, amber only on the answer; like a benchmark query run live, cut to a beat.
- **Intent**: The beat becomes visible: every word lands on a new ground of the same hue, so the film feels like a query run live, and amber can only mean the answer.
- **Fits / does not fit**: a question with a measured answer (releases, benchmarks, a limit passed), 12–40 s. Not: stories without a question, many numbers, long reading, a second accent.
- **Palette presets**:

  | id | name | ramp r0 · r1 · r2 · r3 | white | dim | accent | ink/ground | accent/ground | means |
  |---|---|---|---|---|---|---|---|---|
  | `indigo` | Indigo | #0D0C14 · #24206B · #4B43E6 · #ECEAF7 | #F4F3FA | #8F8CA8 | #FFC53D | 17.64 | 12.32 | the answer |
  | `petrol` | Petrol | #071214 · #0C3A40 · #0F717A · #E1F0F0 | #F2F8F8 | #7E9A9D | #FFC53D | 17.69 | 12.03 | the answer |
  | `graphite` | Graphite | #0E0F11 · #2A2D33 · #5A606B · #E9EAEC | #F5F5F6 | #8E939C | #FFC53D | 17.6 | 12.15 | the answer |
  | `coral-ramp` | Coral red | #1C080C · #561525 · #B42F52 · #F8E1E4 | #FCF5F5 | #AD9093 | #FF6452 | 17.92 | 6.61 | the answer (r0, r1 only) |

  Roles: ground r0, panel r1, ink the white, paper r3; the ramp travels as roles r0–r3 and white, and `kit.js onGround()` decides every text colour on every ground (white on the dark steps, r0 on r3, r1 on white; the accent never on the light grounds).
- **Type**: display Barlow Condensed 900 (zh stack: Barlow Condensed, Noto Sans SC 900 as 长体); text Barlow 600 (the answer 700); mono JetBrains Mono 500/600. Licences OFL-1.1; Noto Sans SC subset to the film's characters.
- **Type scale**: 31 · 49 · 61 · 186 · 233 · 291 · 364 · 455 · 568 in both languages; floors info 31, main 49; ask words 364 → 233, figures 364 / 291 → 186, the answer 568 → 455, the name 364 → 291.
- **Tracking, case, italic, leading**: display −0.01 em, the answer −0.015 em; Chinese 0 tracking, no case, no italic; Chinese display words scaled to 0.84 wide (`type.zhScale`), Latin inside stays the condensed face.
- **Grid and frame**: 1920 × 1080, 160 px margins; the anchor at (160, 660), every aperture's centre at its optical middle (baseline − 0.36 × size; Chinese 0.38); the query line at 990. No persistent frame: the anchor and the query line are the through-line.
- **Camera**: locked; the only push is through the answer's counter (runtime counter-portal), the only lean the whiteout's (runtime whiteout-slam).
- **Texture and light**: seeded grain at 5 % overlay; no glow, no vignette.
- **Source**: own (`assets/templates/pulse/palettes.js`, `film.js`), split from the pulse style of keynote-video. **Licence**: MIT; fonts OFL-1.1 (Barlow Condensed, Barlow, JetBrains Mono, Noto Sans SC).
- **Languages**: en full · zh adapted: Chinese words are set in Noto Sans SC 900 as 长体 (scaled to 0.84 wide, the condensed setting of Chinese headline type) at the same size and floor, one 词 a beat; Latin and digits inside keep Barlow Condensed.
- **Sample**: `poster.jpg`, an English still 480 px wide.

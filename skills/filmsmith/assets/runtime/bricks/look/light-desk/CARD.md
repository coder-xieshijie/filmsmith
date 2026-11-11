---
id: light-desk
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### light-desk

- **Looks like**: prints of real pages laid in neutral card mounts on a warm-grey desk, seen from straight above; a red (or blue) pencil ring round one number, small code-set chips of label stock in front; like a curator’s light desk photographed for a catalogue.
- **Intent**: A curator’s desk: the evidence is real and untouched, the film only points at it with one pencil.
- **Fits / does not fit**: Launches argued from published evidence: official tables, charts, release pages, the product’s own screens. Not: Films with no real asset; dense dashboards; anything that needs a drawn UI.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `lightbox` | Light desk, red pencil / 浅色桌面，红铅笔 | ground `#ECEBE6` · panel `#FBFAF7` · ink `#17181B` · dim `#5A5C60` · line `#DAD8D2` · accent `#D0233D` · onAccent `#FBFAF7` · paper `#FBFAF7` · onPaper `#17181B` · muted `#4C4E52` · smuted `#55575C` | ink/ground 14.87, muted/ground 6.98, dim/ground 5.61, onPaper/panel 17.01, smuted/panel 6.93, accent/ground 4.41, accent/panel 5.04 | what the film points at now: a ring, a lifted reading’s edge, a dimension, the route, the rule |
  | `lightbox-pencil` | Light desk, blue pencil / 浅色桌面，蓝铅笔 | ground `#ECEBE6` · panel `#FBFAF7` · ink `#17181B` · dim `#5A5C60` · line `#DAD8D2` · accent `#677BFE` · onAccent `#FBFAF7` · paper `#FBFAF7` · onPaper `#17181B` · muted `#4C4E52` · smuted `#55575C` | ink/ground 14.87, muted/ground 6.98, dim/ground 5.61, onPaper/panel 17.01, smuted/panel 6.93, accent/ground 3.01, accent/panel 3.44 | what the film points at now (for assets that are themselves red, pink or orange) |
  | `grease` | Dark desk, grease-pencil red / 深色桌面，油性红笔 | ground `#141518` · panel `#EEECE6` · ink `#ECEBE6` · dim `#909290` · line `#26282C` · accent `#E02944` · onAccent `#EEECE6` · paper `#EEECE6` · onPaper `#17181B` · muted `#A9AAA6` · smuted `#55575C` | ink/ground 15.3, muted/ground 7.81, dim/ground 5.83, onPaper/panel 15.03, smuted/panel 6.12, accent/ground 3.97, accent/panel 3.89 | what the film points at now (dark captures: terminals, dark UIs, dark charts) |
  | `pencil` | Dark desk, blue pencil / 深色桌面，蓝铅笔 | ground `#141518` · panel `#EEECE6` · ink `#ECEBE6` · dim `#909290` · line `#26282C` · accent `#677BFE` · onAccent `#EEECE6` · paper `#EEECE6` · onPaper `#17181B` · muted `#A9AAA6` · smuted `#55575C` | ink/ground 15.3, muted/ground 7.81, dim/ground 5.83, onPaper/panel 15.03, smuted/panel 6.12, accent/ground 5.08, accent/panel 3.04 | what the film points at now (the dark desk with red assets) |

- **Type**: display: en Instrument Sans · zh Instrument Sans, Noto Sans SC; text: en Instrument Sans · zh Instrument Sans, Noto Sans SC; mono: en IBM Plex Mono · zh IBM Plex Mono, Noto Sans SC. Files: Instrument Sans 400 700 (OFL-1.1), IBM Plex Mono 500 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after the Latin family in every role, subset per film; captions and lines set character by character; mono notes 28 px; index numerals and values stay in the Latin face.
- **Type scale**: en [25,33,44,59,79,105,140], zh [28,33,44,59,79,105,140]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":0,"text":0,"label":0},"zh":{"display":0,"text":0,"label":0}} (em; Chinese never negative); capitals en [], zh none; italic {"en":false,"zh":false}; leading en 1.2, zh 1.35.
- **Grid and frame**: the rest mount 1200 × 675 at (360, 224) under a 54 px bar; the index numeral at (48, 330), 220 px; the chip 570 × 190 at (1290, 770); captions 76 px under the mount; prints one screen (1920 px) apart; planes at rates 0.3 · 1 · 1.65.
- **Camera**: truck, zoom cap 1.333, shutter 0.5; overhead, it trucks along the row, rises over the whole desk, never tilts.
- **Texture and light**: a fixed-seed fibre tile in soft light at 50 % on the back plane; the cutting mat’s 1 px grid every 80 desk px with `desk: mat`; the light falls off toward the corners (10 % light, 38 % dark).
- **Source**: own (`assets/templates/exhibit/palettes.js, layout.js, film.js (desk, falloff, type)`), split from the template of the exhibit style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Instrument Sans, IBM Plex Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Ring one region at a time and keep the accent ΔE00 ≥ 20 from the colours inside it. Assets are only cropped, scaled and veiled: never recolour or rebuild them.

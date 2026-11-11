---
id: reel-box
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### reel-box

- **Looks like**: a strip of 35 mm film laid across a glowing light box, a frame registered between four corner marks, a dark intertitle frame with white type in the strip, a magenta china-marker loop on a contact sheet; like an editor’s bench.
- **Intent**: Show the work as physical film: real frames you can count, measure and pick by hand.
- **Fits / does not fit**: Films about films, renders, frames and versions: a video tool, a model that makes video, a release of several films. Not: Products with no frames to show; dashboards and documents.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `lightbox-carmine` | Light box, carmine china marker / 灯箱，洋红蜡笔 | title `#1B1D1F` · titleInk `#ECEFEE` · ground `#ECEFEE` · panel `#1B1D1F` · ink `#14171A` · dim `#565C61` · line `#565C61` · accent `#C2185B` · onAccent `#ECEFEE` · paper `#F5F7F6` · onPaper `#14171A` · onPanel `#ECEFEE` · muted `#474D51` · glow `#F5F7F6` · base `#0B0C0D` · hole `#ECEFEE` · trackDim `#2B2E31` · trackLit `#C9CFCC` | ink/ground 15.55, muted/ground 7.41, dim/ground 5.86, onPanel/panel 14.61, accent/ground 5.08, accent/base 3.33 | the grease pencil: the loop round the picked cell, the underline of the address |
  | `lightbox-blue` | Light box, blue china marker / 灯箱，蓝蜡笔 | title `#1B1D1F` · titleInk `#ECEFEE` · ground `#ECEFEE` · panel `#1B1D1F` · ink `#14171A` · dim `#565C61` · line `#565C61` · accent `#2F5BD8` · onAccent `#ECEFEE` · paper `#F5F7F6` · onPaper `#14171A` · onPanel `#ECEFEE` · muted `#474D51` · glow `#F5F7F6` · base `#0B0C0D` · hole `#ECEFEE` · trackDim `#2B2E31` · trackLit `#C9CFCC` | ink/ground 15.55, muted/ground 7.41, dim/ground 5.86, onPanel/panel 14.61, accent/ground 5.03, accent/base 3.36 | the grease pencil, for a pick whose frame is red, pink or magenta |
  | `flatbed` | Editing bench, pink china marker / 剪辑台，粉蜡笔 | title `#1B1D1F` · titleInk `#ECEFEE` · ground `#17191A` · panel `#1B1D1F` · ink `#E9ECEA` · dim `#8F9693` · line `#8F9693` · accent `#F58FB8` · onAccent `#17191A` · paper `#1F2223` · onPaper `#E9ECEA` · onPanel `#ECEFEE` · muted `#A9AFAC` · glow `#1F2223` · base `#050606` · hole `#3A3F41` · trackDim `#202325` · trackLit `#C9CFCC` | ink/ground 14.83, muted/ground 7.91, dim/ground 5.84, onPanel/panel 14.61, accent/ground 7.98, accent/base 9.18 | the grease pencil, for frames that are mostly dark (night terminals, dark interfaces) |

- **Type**: display: en Hanken Grotesk · zh Hanken Grotesk, Noto Sans SC; text: en Hanken Grotesk · zh Hanken Grotesk, Noto Sans SC; mono: en DM Mono · zh DM Mono, Noto Sans SC. Files: Hanken Grotesk 100 900 (OFL-1.1), DM Mono 500 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after the Latin family; intertitles stay at 79 px inside the 832 px frame; captions 59 px; no capitals.
- **Type scale**: en [25,33,44,59,79,105,140], zh [28,33,44,59,79,105,140]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":0,"text":0,"label":0},"zh":{"display":0,"text":0,"label":0}} (em; Chinese never negative); capitals en [], zh none; italic {"en":false,"zh":false}; leading en 1.15, zh 1.3.
- **Grid and frame**: the gate frame 832 × 468 at (544, 252); the strip 660 px tall, cells 860 apart; captions at y 950 (984 under the sheet); the sheet’s rows 84 px apart from x 432 at 96 / 832, a cell per 4 s, fewer rows centred.
- **Camera**: locked, zoom cap 1.333, shutter 0.5; the camera never moves; the strip moves through the gate.
- **Texture and light**: a light box: the ground with a brighter radial glow at the gate (static); no grain; the optical track lights once, swept left to right.
- **Source**: own (`assets/templates/strip/palettes.js, film.js (lightbox, type)`), split from the template of the strip style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Hanken Grotesk, DM Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The pencil must differ from every colour in the picked cell by ΔE00 ≥ 20; take the blue preset for red frames. Frames are only scaled and veiled; never recolour them.

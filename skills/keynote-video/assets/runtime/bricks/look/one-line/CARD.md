---
id: one-line
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### one-line

- **Looks like**: a motion reel on black where one red-orange line keeps turning into the next thing: a caret, swatches, storyboard panels, glossy spheres on a cobalt field, a ruler, a playhead, ink, a flood, the name.
- **Intent**: A motion designer's reel cut as one unbroken transformation, in one line colour.
- **Fits / does not fit**: Reels of video, motion and rendering tools, editors and creative tools. Not: Subjects that are not a video tool (the chain says “making a video”); films that need photographs; a second accent.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `cobalt-vermilion` | Vermilion on cobalt / 钴蓝上的朱红 | ground `#0B0B0D` · panel `#17171B` · ink `#EDEAE2` · dim `#8E8C89` · line `#3D3C3C` · accent `#EE4938` · onAccent `#0B0B0D` · field `#2E2EF4` · onField `#EDEAE2` | ink/ground 16.36, accent/ground 5.29, onAccent/accent 5.29, onField/field 6.21 | the thread: the one object that carries the work from step to step (the default; tools, studios) |
  | `ultramarine` | Ultramarine on saffron / 藏青配藏红花黄 | ground `#0A0B10` · panel `#161823` · ink `#ECEDF2` · dim `#8D8E93` · line `#3C3D42` · accent `#6B7BFF` · onAccent `#0A0B10` · field `#F2B630` · onField `#0A0B10` | ink/ground 16.81, accent/ground 5.53, onAccent/accent 5.53, onField/field 10.77 | the thread (calm, technical, product reels) |
  | `rose` | Rose on deep teal / 深青上的玫红 | ground `#0D0B0E` · panel `#1A161B` · ink `#F0EAEE` · dim `#918C90` · line `#3F3C3F` · accent `#FF4F9A` · onAccent `#0D0B0E` · field `#0B6658` · onField `#F0EAEE` | ink/ground 16.53, accent/ground 6.38, onAccent/accent 6.38, onField/field 5.8 | the thread (creative tools, culture) |
  | `vermilion-paper` | Vermilion on paper / 纸上的朱红 | ground `#EEEAE1` · panel `#E0DBD0` · ink `#141416` · dim `#605F5D` · line `#BEBBB4` · accent `#EE4938` · onAccent `#141416` · field `#2E2EF4` · onField `#EEEAE1` | ink/ground 15.32, accent/ground 3.1, onAccent/accent 4.95, onField/field 6.22 | the thread (print, editorial, daytime) |

- **Type**: display: en Bricolage Grotesque · zh Bricolage Grotesque, Noto Sans SC; text: en Instrument Serif · zh Instrument Serif, Noto Serif SC; mono: en JetBrains Mono · zh JetBrains Mono, Noto Sans SC. Files: Bricolage Grotesque 200 800 (OFL-1.1), Instrument Serif 400 (OFL-1.1), JetBrains Mono 100 800 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film), Noto Serif SC 200 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after Bricolage Grotesque and JetBrains Mono, Noto Serif SC after Instrument Serif, upright (no italic), no tracking, labels 28 px; display sizes as English.
- **Type scale**: en [26, 34, 44, 58, 76, 98, 196, 230, 360], zh [28, 34, 44, 58, 76, 98, 196, 230, 360]; floors en info 26 / main 44, zh info 28 / main 44.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.02,"numeral":-0.02,"label":0.18},"zh":{"display":0,"numeral":0,"label":0}} (em; Chinese never negative); capitals en ["label"], zh none; italic {"en":true,"zh":false}; leading en 1, zh 1.15.
- **Grid and frame**: stage label at x 150 (mark 16 px at y 90, label baseline 106, note 152); static elements ≥ 150 px from the sides and ≥ 90 px from top and bottom; content area y 170–1080; the line 1400 × 6 at the centre.
- **Camera**: locked, zoom cap 1.06, shutter 0.5, curves {"enter":"crit","move":"expo.inOut","exit":"expo.in"}.
- **Texture and light**: flat grounds, seeded full-range grain as an overlay at 12 %; spheres and ink lit (WebGL); no glow, no vignette, no HUD.
- **Source**: own (`assets/templates/thread/palettes.js; fx.js (FAMILY, TYPE, SPECIMEN)`), split from the thread style of keynote-video. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Bricolage Grotesque, Instrument Serif, JetBrains Mono, Noto Sans SC, Noto Serif SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: `vermilion` and `paper` are renamed `cobalt-vermilion` and `vermilion-paper` (the ids are taken by other looks). The field is a ground, never a mark: a clip, a word or a detail in the field colour reads as a second accent.

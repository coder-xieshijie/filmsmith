---
id: newsprint
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### newsprint

- **Looks like**: warm newsprint paper, one black plate at 45° and one process ink at 15° that prints only the anchor; big grotesque words knocked out of the plate; like an editorial print poster in motion.
- **Intent**: The film reads as printed: one black plate, one process ink kept for the brand piece, and every picture a field of dots that change size, never grey.
- **Fits / does not fit**: Launches of models and tools that want a printed, editorial feel with one recurring brand piece. Not: Screenshots and UI demos; films with several brand colours; photographic material.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `cyan` | Process cyan / 印刷青 | ground `#F1EDE4` · panel `#F1EDE4` · ink `#141414` · dim `#6E6A62` · dimInk `#A39E94` · line `#C9C3B6` · accent `#0090CC` · onAccent `#141414` | ink/ground 15.77, dim/ground 4.61, accent/ground 3.07, ink/panel 15.77, dim/panel 4.61, dimInk/ink 6.91, accent/ink 5.14 | the anchor and nothing else: never type, never a field, never emphasis (graphics, 3:1 on paper and on ink) |
  | `magenta` | Process magenta / 印刷品红 | ground `#F1EDE4` · panel `#F1EDE4` · ink `#141414` · dim `#6E6A62` · dimInk `#A39E94` · line `#C9C3B6` · accent `#E4007C` · onAccent `#F1EDE4` | ink/ground 15.77, dim/ground 4.61, accent/ground 3.92, ink/panel 15.77, dim/panel 4.61, dimInk/ink 6.91, accent/ink 4.03 | the anchor and nothing else; louder and warmer |
  | `reverse` | Reverse (ink paper) / 反白（墨底） | ground `#141414` · panel `#141414` · ink `#F1EDE4` · dim `#A39E94` · dimInk `#68645C` · line `#3A3833` · accent `#0090CC` · onAccent `#141414` | ink/ground 15.77, dim/ground 6.91, accent/ground 5.14, ink/panel 15.77, dim/panel 6.91, dimInk/ink 5.04 | the anchor and nothing else; the whole film printed reversed out of black |

- **Type**: display: en Bricolage Grotesque, Inter Tight · zh Bricolage Grotesque, Noto Sans SC; text: en Bricolage Grotesque, Inter Tight · zh Bricolage Grotesque, Noto Sans SC; mono: en IBM Plex Mono, JetBrains Mono · zh IBM Plex Mono, JetBrains Mono, Noto Sans SC. Files: Bricolage Grotesque (OFL-1.1), IBM Plex Mono (OFL-1.1), Inter Tight (OFL-1.1), JetBrains Mono (OFL-1.1), Noto Sans SC (OFL-1.1, subset per film). Chinese: Noto Sans SC (Noto Serif SC for the trace serif) subset per film to the characters it uses.
- **Type scale**: en [28, 38, 52, 71, 96, 131, 178, 242], zh [28, 38, 52, 71, 96, 131, 178, 242]; floors en info 28 / main 52, zh info 28 / main 52.
- **Tracking, case, italic, leading**: tracking {"en": {"display": 0, "label": 0}, "zh": {"display": 0, "label": 0}} (em; Chinese never negative); capitals en none, zh none; italic {"en": false, "zh": false}; leading en 1.08, zh 1.25.
- **Grid and frame**: {"cols": 12, "margin": 150, "gutter": 24, "baseline": 8, "safe": [96, 54], "column": [150, 1130], "field": 1060, "anchor": [1440, 540]}.
- **Camera**: locked, zoom cap 3.43, shutter 0.5, curves {"enter": "cubicOut", "move": "cubicInOut", "exit": "cubic"}.
- **Texture and light**: {"grain": 0.05, "grainMode": "overlay", "grainFixed": true, "screen": {"pitch": 14, "hookPitch": 24, "markPitch": 7, "angles": {"ink": 45, "accent": 15}, "dots": ["round", "square", "line"]}, "glow": null, "vignette": 0, "light": "none"}.
- **Source**: own (`assets/templates/halftone/palettes.js, film.js (type, frame), screen.js`), split from the template of the halftone style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Bricolage Grotesque, IBM Plex Mono, Inter Tight, JetBrains Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The accent prints the anchor only: never type, a field or emphasis. Bricolage Grotesque and IBM Plex Mono are not in tools/fonts.json: samples fall back to Inter Tight and JetBrains Mono.

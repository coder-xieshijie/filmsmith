---
id: slate-ink
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### slate-ink

- **Looks like**: a cool slate ground with one ink shape that never leaves the frame, interface panels in a lighter paper, one violet (or azure) accent handed on like a baton; Inter Tight and IBM Plex Mono; like a Material container transform made into a film.
- **Intent**: One object visibly becomes the next, so the viewer follows a product's logic as a single continuous thing.
- **Fits / does not fit**: Developer tools, APIs and interface products whose story is one thing becoming the next: a request, a response, a spec, the generated docs. Not: Data stories, photographs, brand-coloured films with several accents.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `slate` | Slate and violet / 石板紫 | ground `#EDEFF2` · panel `#F8F9FB` · paper `#F8F9FB` · ink `#15171A` · dim `#5F656D` · line `#C3C9D0` · accent `#6A3DF0` · onAccent `#EDEFF2` · inkDim `#9AA0A8` · inkAccent `#8C6CFF` · inkCard `#222427` · inkEdge `#494B4E` · inkTrack `#2F3134` | ink/ground 15.59, dim/ground 5.11, accent/ground 5.15, ink/panel 17.05, dim/panel 5.59, ground/ink 15.59, inkDim/ink 6.81, onAccent/accent 5.15, inkAccent/inkCard 4.23 | the part that is changing now: the point, the swapped token, the action, the front face, the Run button; never two at once |
  | `azure` | Slate and azure / 石板蓝 | ground `#EDEFF2` · panel `#F8F9FB` · paper `#F8F9FB` · ink `#15171A` · dim `#5F656D` · line `#C3C9D0` · accent `#1F55E0` · onAccent `#EDEFF2` · inkDim `#9AA0A8` · inkAccent `#7FA0FF` · inkCard `#222427` · inkEdge `#494B4E` · inkTrack `#2F3134` | ink/ground 15.59, dim/ground 5.11, accent/ground 5.31, ink/panel 17.05, dim/panel 5.59, ground/ink 15.59, inkDim/ink 6.81, onAccent/accent 5.31, inkAccent/inkCard 6.21 | the part that is changing now (a calmer, institutional blue) |
  | `night` | Night (inverted) / 夜（反相） | ground `#121418` · panel `#1B1E23` · paper `#1B1E23` · ink `#E8EBEF` · dim `#8D939B` · line `#2C3036` · accent `#9C80FF` · onAccent `#121418` · inkDim `#585E66` · inkAccent `#6A3DF0` · inkCard `#DBDEE2` · inkEdge `#B5B7BB` · inkTrack `#CED1D5` | ink/ground 15.42, dim/ground 5.95, accent/ground 6.1, ink/panel 13.98, dim/panel 5.4, ground/ink 15.42, inkDim/ink 5.47, onAccent/accent 6.1, inkAccent/inkCard 4.4 | the part that is changing now; the console flood turns light |

- **Type**: display: en Inter Tight · zh Inter Tight, Noto Sans SC; text: en Inter Tight · zh Inter Tight, Noto Sans SC; mono: en IBM Plex Mono, JetBrains Mono · zh IBM Plex Mono, JetBrains Mono, Noto Sans SC. Files: Inter Tight (OFL-1.1), IBM Plex Mono (OFL-1.1), IBM Plex Mono (OFL-1.1), JetBrains Mono (OFL-1.1), Noto Sans SC (OFL-1.1, subset per film). Chinese: Noto Sans SC (Noto Serif SC for the trace serif) subset per film to the characters it uses.
- **Type scale**: en [28, 35, 44, 55, 69, 86, 135], zh [28, 35, 44, 55, 69, 86, 135]; floors en info 28 / main 44, zh info 28 / main 44.
- **Tracking, case, italic, leading**: tracking {"en": {"display": -0.023, "mark": -0.022, "label": 0.07}, "zh": {"display": 0, "mark": 0, "label": 0}} (em; Chinese never negative); capitals en ['label'], zh none; italic {"en": false, "zh": false}; leading en 1.15, zh 1.35.
- **Grid and frame**: {"cols": 12, "margin": 120, "gutter": 24, "baseline": 8, "safe": [96, 54], "line": [960, 560], "card": [460, 240, 1000, 600, 36], "hex": [1300, 560, 210], "focus": [200, 120, 1520, 640, 28], "captions": [470, 580]}.
- **Camera**: locked, zoom cap 1, shutter 0.5, curves {"enter": "spring", "move": "cubicInOut", "exit": "exit"}.
- **Texture and light**: {"grain": 0.05, "grainMode": "overlay", "glow": null, "vignette": 0, "light": "none", "corners": ["round", "cut"]}.
- **Source**: own (`assets/templates/morph/palettes.js, film.js (type scale, layout)`), split from the morph style of keynote-video. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (IBM Plex Mono, Inter Tight, JetBrains Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The accent marks only the part changing now; two accents at once break the baton. IBM Plex Mono is not in tools/fonts.json: samples use JetBrains Mono.

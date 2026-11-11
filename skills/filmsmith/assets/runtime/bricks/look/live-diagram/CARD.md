---
id: live-diagram
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### live-diagram

- **Looks like**: a flat dark diagram (or paper, or a chalkboard) where chips, bars and rules are the run's own state; a serif for the author, a mono for the run, a sans for the narration; like a 3Blue1Brown frame.
- **Intent**: A mechanism is believed because it is seen running: the picture is the run's state, with four colours that each mean one thing.
- **Fits / does not fit**: Explainers of a mechanism that runs on a tiny input: tokenising, compressing, sorting, counting; any proof by a run. Not: Launch films; claims with no mechanism; anything that needs photographs or a brand colour.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `ink` | Ink / 墨 | ground `#0C1013` · panel `#151B1F` · ink `#E6ECEF` · dim `#8A97A0` · line `#2A343B` · accent `#F7D96F` · onAccent `#0C1013` · paper `#E6ECEF` · onPaper `#0C1013` · base `#7D8A93` · learned `#5CD0B3` · unseen `#FC6255` · cell `#66737C` | ink/ground 16.02, dim/ground 6.38, accent/ground 13.75, ink/panel 14.57, dim/panel 5.8 | what the algorithm is counting or acting on right now (active); learned and unseen are category colours |
  | `paper` | Paper / 纸 | ground `#F5F2EA` · panel `#FBF9F4` · ink `#1A1E21` · dim `#5B646A` · line `#D3D9DE` · accent `#2456C8` · onAccent `#FFFFFF` · paper `#FFFFFF` · onPaper `#1A1E21` · base `#2C3236` · learned `#077562` · unseen `#C2362C` · cell `#7D868C` | ink/ground 15, dim/ground 5.4, accent/ground 5.79, ink/panel 15.95, dim/panel 5.74 | what the algorithm is acting on right now (active) |
  | `chalk` | Chalkboard / 黑板 | ground `#17221F` · panel `#1E2B27` · ink `#EEEDE6` · dim `#9AA8A2` · line `#2D3B37` · accent `#F6C945` · onAccent `#17221F` · paper `#EEEDE6` · onPaper `#17221F` · base `#84908B` · learned `#8FD0F7` · unseen `#FF8F70` · cell `#6E7D78` | ink/ground 13.92, dim/ground 6.61, accent/ground 10.4, ink/panel 12.51, dim/panel 5.94 | what the algorithm is acting on right now (active) |

- **Type**: display: en Source Serif 4 · zh Source Serif 4, Noto Serif SC; serif: en Source Serif 4 · zh Source Serif 4, Noto Serif SC; text: en Inter Tight · zh Inter Tight, Noto Sans SC; mono: en JetBrains Mono · zh JetBrains Mono, Noto Sans SC. Files: Source Serif 4 (OFL-1.1), Source Serif 4 (OFL-1.1), JetBrains Mono (OFL-1.1), Inter Tight (OFL-1.1), Noto Serif SC (OFL-1.1, subset per film), Noto Sans SC (OFL-1.1, subset per film). Chinese: Noto Sans SC (Noto Serif SC for the trace serif) subset per film to the characters it uses.
- **Type scale**: en [26, 30, 40, 46, 54, 76, 82], zh [28, 30, 40, 46, 54, 76, 82]; floors en info 26 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en": {"display": 0, "label": 0}, "zh": {"display": 0, "label": 0.02}} (em; Chinese never negative); capitals en none, zh none; italic {"en": true, "zh": false}; leading en 1.15, zh 1.35.
- **Grid and frame**: {"cols": 12, "margin": 130, "gutter": 24, "baseline": 8, "safe": [96, 54], "board": [130, 1220, 176, 806], "column": [1290, 1800], "caption": 872, "bar": 950}.
- **Camera**: locked, zoom cap 1.3, shutter 0.5, curves {"enter": "snappy", "move": "smooth", "exit": "exit"}.
- **Texture and light**: {"grain": 0.035, "glow": null, "vignette": 0, "light": "none"}.
- **Source**: own (`assets/templates/trace/palettes.js, pieces.js (TYPE, frame)`), split from the template of the trace style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Inter Tight, JetBrains Mono, Noto Sans SC, Noto Serif SC, Source Serif 4).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Every colour has one meaning; using the accent for emphasis breaks the legend. Source Serif 4 and Noto Serif SC are not in tools/fonts.json: samples show the sans instead of the serif.

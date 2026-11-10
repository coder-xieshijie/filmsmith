---
id: unit-ledger
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### unit-ledger

- **Looks like**: a dark radial ground (or warm paper) with hundreds of small rounded squares in two neutrals and one accent, Inter Tight numbers, capital mono labels; like a printed statistical yearbook made to move.
- **Intent**: Many equal squares on a quiet ground make a count visible: the viewer sees how much before reading a number, and one accent tells them which part the film is about.
- **Fits / does not fit**: Data stories told by counting: datasets, surveys, registries, the proof section of a release; any film whose picture is many equal marks. Not: Launch films that need a product picture or a second hue; continuous measures drawn as curves; playful or hand-made tones.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `navy-amber` | Navy and amber / 藏青与琥珀 | ground `#0B111F` · panel `#16203A` · ink `#EEF1F5` · dim `#929EB2` · line `#2A3550` · accent `#FFB71C` · onAccent `#0B111F` · paper `#C0C8D0` · onPaper `#0B111F` · base `#C0C8D0` · rest `#647187` · edge `#070B14` | ink/ground 16.64, dim/ground 6.96, accent/ground 10.81, ink/panel 14.24, dim/panel 5.96 | this chapter's protagonist: the category, flag, bar or number the title is about |
  | `paper-red` | Paper, ink and red / 纸、墨与红 | ground `#F2EEE6` · panel `#F8F6F1` · ink `#141414` · dim `#57534D` · line `#CFC8BA` · accent `#BF2417` · onAccent `#F8F6F1` · paper `#3B3A37` · onPaper `#F2EEE6` · base `#3B3A37` · rest `#7F7B73` · edge `#EAE5DB` | ink/ground 15.92, dim/ground 6.6, accent/ground 5.21, ink/panel 17.06, dim/panel 7.07 | this chapter's protagonist |
  | `night-teal` | Night and teal / 夜色与青 | ground `#0D1213` · panel `#152022` · ink `#E9EEEE` · dim `#93A2A4` · line `#263335` · accent `#3FE0C5` · onAccent `#0D1213` · paper `#8F9A9C` · onPaper `#0D1213` · base `#8F9A9C` · rest `#5F6D70` · edge `#080B0C` | ink/ground 16.11, dim/ground 7.14, accent/ground 11.39, ink/panel 14.21, dim/panel 6.3 | this chapter's protagonist |
  | `coral` | Coral red / 珊瑚红 | ground `#170C0D` · panel `#2C1517` · ink `#F7EFED` · dim `#B6A4A0` · line `#3C2729` · accent `#FF6452` · onAccent `#170C0D` · paper `#D4C7C3` · onPaper `#170C0D` · base `#D4C7C3` · rest `#7A6662` · edge `#0B0607` | ink/ground 16.92, dim/ground 8.04, accent/ground 6.57, ink/panel 15.1, dim/panel 7.18 | this chapter's protagonist |

- **Type**: display: en Inter Tight · zh Inter Tight, Noto Sans SC; text: en Inter Tight · zh Inter Tight, Noto Sans SC; mono: en IBM Plex Mono, JetBrains Mono · zh IBM Plex Mono, JetBrains Mono, Noto Sans SC. Files: Inter Tight (OFL-1.1), IBM Plex Mono (OFL-1.1), IBM Plex Mono (OFL-1.1), Noto Sans SC (OFL-1.1, subset per film). Chinese: Noto Sans SC (Noto Serif SC for the trace serif) subset per film to the characters it uses.
- **Type scale**: en [25, 32, 40, 64, 150, 210, 273, 300], zh [28, 32, 40, 64, 150, 210, 273, 300]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en": {"display": -0.022, "label": 0.05}, "zh": {"display": 0, "label": 0.04}} (em; Chinese never negative); capitals en ['label'], zh none; italic {"en": false, "zh": false}; leading en 1.2, zh 1.35.
- **Grid and frame**: {"cols": 12, "margin": 96, "gutter": 24, "baseline": 8, "safe": [96, 54], "chart": [330, 920], "frame": {"chapter": 82, "rule": 986, "source": 1040}}.
- **Camera**: locked, zoom cap 1, shutter 0.5, curves {"enter": "snappy", "move": "smooth", "exit": "exit"}.
- **Texture and light**: {"grain": 0.05, "glow": {"role": "panel", "at": [0.62, 0.42]}, "vignette": 0, "light": "radial"}.
- **Source**: own (`assets/templates/tally/palettes.js, index.html, layouts.js (type and frame)`), split from the tally style of keynote-video. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (IBM Plex Mono, Inter Tight, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Keep the accent for the protagonist only; a second accent breaks the one question the chart answers. IBM Plex Mono is not in tools/fonts.json yet: samples fall back to JetBrains Mono.

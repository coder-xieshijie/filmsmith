---
id: diff-paper
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### diff-paper

- **Looks like**: an editor’s split view without its chrome: warm paper on the left with a typed request, mono code with real line numbers, a teal 6 px divider with a small tab, real frames on a near-black bench on the right, a chip naming each frame’s source.
- **Intent**: Show cause and effect as two sides of one edit: the line written, the result it made.
- **Fits / does not fit**: Developer tools whose input maps line by line to an output: generators, compilers, config files, CLIs with a report, diff tools. Not: Products with no visible output; benchmark launches; a one-screen app.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `diff-teal` | Paper and diff teal / 纸面与 diff 青 | ground `#F3F2EE` · panel `#15171A` · line `#5C626B` · onAccent `#F3F2EE` · onPaper `#16171A` · onPanel `#E8E9EB` · paper `#F3F2EE` · ink `#16171A` · muted `#4A4F57` · dim `#5C626B` · bench `#15171A` · onBench `#E8E9EB` · mutedOnBench `#A7ADB5` · accent `#007C72` · key `#F3F2EE` | ink/paper 16, muted/paper 7.36, dim/paper 5.49, onBench/bench 14.78, mutedOnBench/bench 7.94, accent/paper 4.54, accent/bench 3.53 | the seam: the edit point between what is written and what it makes (its copies, the grip, the caret, the one pairing mark) |
  | `diff-night` | Graphite and light teal / 石墨与浅青 | ground `#121417` · panel `#0B0C0E` · line `#8C929B` · onAccent `#121417` · onPaper `#E8E9EB` · onPanel `#E8E9EB` · paper `#121417` · ink `#E8E9EB` · muted `#A7ADB5` · dim `#8C929B` · bench `#0B0C0E` · onBench `#E8E9EB` · mutedOnBench `#A7ADB5` · accent `#36B5B0` · key `#121417` | ink/paper 15.19, muted/paper 8.16, dim/paper 5.89, onBench/bench 16.11, mutedOnBench/bench 8.65, accent/paper 7.37, accent/bench 7.82 | the seam, for a product used in a dark editor (light results) |
  | `diff-plum` | Paper and plum / 纸面与梅紫 | ground `#F3F2EE` · panel `#15171A` · line `#5C626B` · onAccent `#F3F2EE` · onPaper `#16171A` · onPanel `#E8E9EB` · paper `#F3F2EE` · ink `#16171A` · muted `#4A4F57` · dim `#5C626B` · bench `#15171A` · onBench `#E8E9EB` · mutedOnBench `#A7ADB5` · accent `#A23B92` · key `#F3F2EE` | ink/paper 16, muted/paper 7.36, dim/paper 5.49, onBench/bench 14.78, mutedOnBench/bench 7.94, accent/paper 5.24, accent/bench 3.06 | the seam, for results that are green or teal (keep its marks ≥ 4 px) |

- **Type**: display: en Archivo · zh Archivo, Noto Sans SC; text: en Archivo · zh Archivo, Noto Sans SC; mono: en JetBrains Mono · zh JetBrains Mono, Noto Sans SC. Files: Archivo 100 900 (OFL-1.1), JetBrains Mono 100 800 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after Archivo for claims and the name; code, commands and paths stay Latin; labels 28 px in Chinese.
- **Type scale**: en [25,33,44,59,79,105], zh [28,33,44,59,79,105]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.01,"text":0,"label":0},"zh":{"display":0,"text":0,"label":0}} (em; Chinese never negative); capitals en [], zh none; italic {"en":false,"zh":false}; leading en 1.25, zh 1.35.
- **Grid and frame**: the seam at x 900 (request, pick), under the quoted code (y 236 + 46 a line), at y 260 (render, diff), the branch at x 1320, the slider 1320 → 620, the lock-up’s seam at x 1000; input from the label at baseline 84; code from x 176, numbers at x 96.
- **Camera**: locked, zoom cap 1.333, shutter 0.5; the camera never moves; the panes change and the seam moves.
- **Texture and light**: none: no grain, no shadow, no veil over a result; the seam carries a 2 px paper key either side.
- **Source**: own (`assets/templates/split/palettes.js, film.js (type)`), split from the split style of keynote-video. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Archivo, JetBrains Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The seam within ΔE00 20 of a colour filling a result it crosses reads as part of the result: take `diff-plum` for green or teal results. Never dim, tint or grain a result: the seam already says which side is in play.

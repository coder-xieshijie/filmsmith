---
id: drafting-sheet
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### drafting-sheet

- **Looks like**: a cyanotype drawing under a warm desk lamp: pale line work and condensed lettering on deep blue, a faint 40 px grid, one amber stamp; like a drawing office filmed while it draws.
- **Intent**: A launch drawn as an engineering drawing: every line drafted, the product shown as a designed system, amber only where a person signs.
- **Fits / does not fit**: Products that are a system with parts, a plan a person signs and machine checks: rollout, backup, migration, pipeline tools. Not: Consumer products, emotional stories, anything without structure to draw; films that need people or photographs.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `cyanotype` | Cyanotype / 蓝晒 | ground `#0A2652` · panel `#10356C` · paper `#10356C` · ink `#EAF3FF` · line `#9FD3FF` · dim `#BCD6F3` · muted `#BCD6F3` · accent `#FFB547` · onAccent `#0A2652` | ink/paper 10.73, line/paper 7.57, dim/paper 8.04, accent/paper 6.84, onAccent/accent 8.47 | a person’s annotation or approval: CONFIRMED and APPROVED stamps, revision marks, the bracket on chosen answers, YOU |
  | `diazo` | Diazo night / 重氮夜色 | ground `#050B18` · panel `#0A1630` · paper `#0A1630` · ink `#E6EDF8` · line `#8EB4E8` · dim `#B0C1DB` · muted `#B0C1DB` · accent `#FFB547` · onAccent `#0A1630` | ink/paper 15.24, line/paper 8.41, dim/paper 9.82, accent/paper 10.21, onAccent/accent 10.21 | a person’s annotation or approval (dark platforms, a quieter film) |
  | `blueline` | Blueline print / 蓝线图 | ground `#C5CED9` · panel `#F3F5F1` · paper `#F3F5F1` · ink `#14306A` · line `#2D5CA3` · dim `#3C5479` · muted `#3C5479` · accent `#A85200` · onAccent `#F3F5F1` | ink/paper 11.53, line/paper 6.04, dim/paper 7, accent/paper 4.94, onAccent/accent 4.94 | a person’s annotation or approval (light, print-like pages) |
  | `vellum` | Vellum original / 硫酸纸原稿 | ground `#D7D8D3` · panel `#F4F3EE` · paper `#F4F3EE` · ink `#2B2E33` · line `#565C64` · dim `#474C54` · muted `#474C54` · accent `#A85200` · onAccent `#F4F3EE` | ink/paper 12.26, line/paper 6.08, dim/paper 7.78, accent/paper 4.88, onAccent/accent 4.88 | a person’s annotation or approval, on the pencil original before it is issued |
  | `oxblood` | Oxblood / 牛血红 | ground `#220A0B` · panel `#311414` · paper `#311414` · ink `#FAF1EE` · line `#BACAD4` · dim `#DCCDC9` · muted `#DCCDC9` · accent `#FF6452` · onAccent `#311414` | ink/paper 15.22, line/paper 10.06, dim/paper 10.98, accent/paper 5.8, onAccent/accent 5.8 | a person’s annotation or approval (a warm red brand) |
  | `graphite-film` | Graphite film / 石墨胶片 | ground `#0F1114` · panel `#1A1E23` · paper `#1A1E23` · ink `#ECEEF1` · line `#A9B6C3` · dim `#BCC4CD` · muted `#BCC4CD` · accent `#FFB547` · onAccent `#1A1E23` | ink/paper 14.41, line/paper 8.11, dim/paper 9.5, accent/paper 9.53, onAccent/accent 9.53 | a person’s annotation or approval (when blue clashes with the brand) |

- **Type**: display: en Plex Condensed · zh Plex Condensed, Noto Sans SC; text: en IBM Plex Mono · zh IBM Plex Mono, Noto Sans SC; mono: en IBM Plex Mono · zh IBM Plex Mono, Noto Sans SC. Files: Plex Condensed 500 (OFL-1.1), Plex Condensed 600 (OFL-1.1), Plex Condensed 700 (OFL-1.1), IBM Plex Mono 400 (OFL-1.1), IBM Plex Mono 500 (OFL-1.1), IBM Plex Mono 600 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after each family; the pen raises Chinese lettering at 25 px to 28 and at 35 to 40; titles keep their ISO sizes; no capitals, no tracking.
- **Type scale**: en [25, 35, 50, 70, 100, 140, 200, 280], zh [28, 40, 50, 70, 100, 140, 200, 280]; floors en info 25 / main 35, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.02,"label":0.14},"zh":{"display":0,"label":0}} (em; Chinese never negative); capitals en ["label"], zh none; italic {"en":false,"zh":false}; leading en 1, zh 1.2.
- **Grid and frame**: a sheet is 1920 × 1080 at 1:1, content x 150–1790; fine grid 40 px at grid[0] (fading out below a camera scale of 0.82), major grid 200 px from 120 at grid[1]; the frame (sheet-hud) in screen space: border at 24 / 36 px, title block bottom right 156 px tall.
- **Camera**: travel, zoom cap 1.12, shutter 0.5, curves {"enter":"power3.inOut","move":"power3.inOut","exit":"accel"}.
- **Texture and light**: a seeded paper tile (the preset's mode, alpha × 0.35), overlay grain 0.05 (dark) / 0.035, a warm lamp drifting 14 px a second, a vignette from 58 % of the radius.
- **Source**: own (`assets/templates/blueprint/palettes.js; sheets/common.js (ISO, F); fx.js (strokeStyle)`), split from the template of the blueprint style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Plex Condensed, IBM Plex Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The condensed family is registered as `Plex Condensed` (the template's name, tools/fonts.json); a host that loads it as IBM Plex Sans Condensed must alias it. The ISO series has no step at 40: Chinese notes at 40 px sit off the series, which is intended.

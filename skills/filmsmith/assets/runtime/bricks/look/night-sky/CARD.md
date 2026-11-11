---
id: night-sky
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### night-sky

- **Looks like**: a dark night sky with dust and soft bokeh where one blue thread of light runs from a small ball of yarn, warm off-white paper blocks hang off it and finished tasks become stars; like a calm product film at night, not a HUD.
- **Intent**: Make the product's attention one visible thing: a light that runs through a night of loose work.
- **Content**: A product that keeps track of many tasks for one person; its interface as small blocks (chat, task rows, a panel).
- **Fits / does not fit**: Products that take work off people and bring it back: agents, assistants, automation, background jobs. Not: Daytime, print or paper films; data stories with many series; a second accent colour.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `night` | Night sky, blue thread / 夜空蓝线 | ground `#05070D` · panel `#0F1B30` · ink `#EEF3FF` · dim `#A9B6CC` · line `#333842` · accent `#4DB5FF` · onAccent `#05070D` · paper `#F5F2EC` · onPaper `#1C1E24` (and the template's own: field, fieldEdge, dust, glow, core, panel2, bubble, onPaper2, user, onUser, rule, accentInk, desk1–3, deskBar) | ink/ground 18.13, dim/ground 9.83, accent/ground 8.99, onAccent/accent 8.99, onPaper/paper 14.91, onPaper2/paper 6.08, accentInk/paper 5.96, ink/panel 15.49 | the thread: the product's attention (the thread, the stars it sends, their glow, the one "needs you") |
  | `ember` | Ember: warm dark, amber thread / 余烬：暖黑琥珀线 | ground `#0A0705` · panel `#1F150E` · ink `#FBF1E6` · dim `#C9B7A2` · line `#3F3831` · accent `#FFB347` · onAccent `#0A0705` · paper `#F7F2EA` · onPaper `#211A14` (and the template's own: field, fieldEdge, dust, glow, core, panel2, bubble, onPaper2, user, onUser, rule, accentInk, desk1–3, deskBar) | ink/ground 18.01, dim/ground 10.31, accent/ground 11.28, onAccent/accent 11.28, onPaper/paper 15.41, onPaper2/paper 6.53, accentInk/paper 6.28, ink/panel 16.07 | the thread (warmer brands, writing and research tools) |
  | `aurora` | Aurora: deep teal night, mint thread / 极光：深青薄荷线 | ground `#03090A` · panel `#0C1F21` · ink `#EAF8F4` · dim `#A2C2BB` · line `#303D3C` · accent `#4FE0B8` · onAccent `#03090A` · paper `#F2F4F1` · onPaper `#172020` (and the template's own: field, fieldEdge, dust, glow, core, panel2, bubble, onPaper2, user, onUser, rule, accentInk, desk1–3, deskBar) | ink/ground 18.36, dim/ground 10.47, accent/ground 12.11, onAccent/accent 12.11, onPaper/paper 15.02, onPaper2/paper 5.95, accentInk/paper 5.95, ink/panel 15.59 | the thread (infrastructure, data, ops) |
  | `mono` | Mono: graphite night, white thread / 石墨：白线 | ground `#070708` · panel `#17181B` · ink `#F2F2F4` · dim `#AEB0B7` · line `#363639` · accent `#E9EAEE` · onAccent `#070708` · paper `#F3F3F1` · onPaper `#1A1A1C` (and the template's own: field, fieldEdge, dust, glow, core, panel2, bubble, onPaper2, user, onUser, rule, accentInk, desk1–3, deskBar) | ink/ground 18.01, dim/ground 9.29, accent/ground 16.75, onAccent/accent 16.75, onPaper/paper 15.64, onPaper2/paper 6.29, accentInk/paper 15.64, ink/panel 15.88 | the thread (when the brand colour must stay out) |

- **Type**: display and text: en DM Sans · zh DM Sans, Noto Sans SC; mono (not drawn by the stream bricks; for library bricks setting a path or command): en DM Mono · zh DM Mono, Noto Sans SC. Files: DM Sans 100–1000 variable (OFL-1.1), DM Mono 500 (OFL-1.1), Noto Sans SC 100–900 (OFL-1.1, subset per film).
- **Type scale**: en [25, 27, 30, 34, 42, 58, 66, 96, 168], zh [28, 30, 34, 42, 58, 64, 92, 168]; floors en info 25 / main 40, zh info 28 / main 40 (the template's row details are 25–27 px in English; Chinese raises every information size to 28).
- **Tracking, case, italic, leading**: tracking en display and text −0.01 em, the name −0.02; zh +0.02 em, the name 0 (never negative in Chinese); no capitals, no italic in either language; leading en 1.32, zh 1.5.
- **Grid and frame**: the thread's home on the left: the mascot at (230, 156), the spine x 230 from y 236 to 1010; hung blocks x 290–930; the right region x 1060–1840 for task rows, beams, stars and cards; captions at x 1000, y 112, one line 860 px wide; safe area 90 × 60.
- **Camera**: locked (a 5 % push over the whole film), zoom cap 1.05, shutter 0.5 (no motion blur drawn: the template has none), curves enter out3, move io3, exit in3.
- **Texture and light**: the sky: a radial field (field at the centre, ground at 55 %, fieldEdge at the edge), 240 dust motes drifting 2–7 px/s in the dust colour, 22 bokeh discs in the accent, all seeded; the thread glows additively in three passes (16, 7, 2.6 px: accent, accent, glow) with a core colour at its head; blocks cast soft shadows; no grain, no vignette, no HUD. Text enters with an 8 px blur per word (per character in Chinese).
- **Source**: own (`assets/templates/stream/…`: `palettes.js; lang.js (TYPE); film.js renderBG, css()`), split from the template of the stream style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (DM Sans, DM Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The accent is attention only: never use it for a decoration, a heading or a second state on paper (the paper's accent is accentInk; "needs you" is `warn`, once, accentInk unless a film sets it — K sets ui-kit's orange #B84A00 — so the alert can differ from the running rings). `line` is derived for library bricks (dim 28 % over the ground); the stream bricks never draw a divider on the night. The four presets keep the template's hexes; `line` is the only derived role.

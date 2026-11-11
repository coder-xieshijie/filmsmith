---
id: device-margin
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### device-margin

- **Looks like**: one head-on graphite laptop on a near-black ground, its screen the only colour, a lime ring and tick pointing into it, white words in a margin to the right; like a product demo shot on one locked-off camera with the presenter’s notes pinned beside it.
- **Intent**: A quiet, locked-off frame where the only colour is the product’s own screen and one mark pointing at it.
- **Fits / does not fit**: Launches whose claim can be seen on the product’s own screen: real captures of pages, pickers, docs, official charts. Not: Products with no screen; stories of many artefacts side by side; anything that needs a drawn UI.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `graphite` | Graphite and focus lime / 石墨与亮青柠 | ground `#0E1013` · panel `#1A1D22` · ink `#ECEEF1` · dim `#8B929C` · line `#30353C` · accent `#ADE05E` · onAccent `#0E1013` · paper `#ECEEF1` · onPaper `#0E1013` · muted `#A9AFB8` · deck `#22262C` · deckEdge `#3B4048` · glass `#07080A` · cam `#2B3037` | ink/ground 16.39, muted/ground 8.63, dim/ground 6.07, dim/panel 5.38, accent/ground 12.34 | the region of the screen in play: the ring round it and the level tick beside it |
  | `umber` | Warm graphite and amber / 暖石墨与琥珀 | ground `#100F0D` · panel `#1C1B18` · ink `#EFEDE8` · dim `#948F85` · line `#34322D` · accent `#FFB45C` · onAccent `#100F0D` · paper `#EFEDE8` · onPaper `#100F0D` · muted `#B1ACA2` · deck `#25231F` · deckEdge `#403D37` · glass `#080807` · cam `#2E2C28` | ink/ground 16.37, muted/ground 8.48, dim/ground 5.95, dim/panel 5.35, accent/ground 10.89 | the region of the screen in play (captures that are green or teal) |
  | `porcelain` | Porcelain and deep green / 瓷白与深绿 | ground `#ECEEF1` · panel `#D3D7DD` · ink `#14161A` · dim `#50565F` · line `#B8BEC6` · accent `#3D7A0A` · onAccent `#ECEEF1` · paper `#ECEEF1` · onPaper `#14161A` · muted `#454B53` · deck `#C5CAD1` · deckEdge `#AEB4BC` · glass `#101215` · cam `#B8BEC6` | ink/ground 15.58, muted/ground 7.58, dim/ground 6.37, dim/panel 5.12, accent/ground 4.53 | the region of the screen in play (a light film, or a dark-mode product) |

- **Type**: display: en Inter Tight · zh Inter Tight, Noto Sans SC; text: en Inter Tight · zh Inter Tight, Noto Sans SC; mono: en IBM Plex Mono · zh IBM Plex Mono, Noto Sans SC. Files: Inter Tight 100 900 (OFL-1.1), IBM Plex Mono 500 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after the Latin family in every role, subset per film; the margin lines wrap in Chinese instead of shrinking; notes and the chin go to 28 px.
- **Type scale**: en [25,31,39,49,61,76,95,119], zh [28,31,39,49,61,76,95,119]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.02,"text":-0.01,"label":0},"zh":{"display":0,"text":0,"label":0}} (em; Chinese never negative); capitals en [], zh none; italic {"en":false,"zh":false}; leading en 1.36, zh 1.4.
- **Grid and frame**: laptop lid (96, 131) 1192 × 800, screen (116, 151) 1152 × 720, chin 31 px above the 18 px deck; phone body (300, 48) 440 × 920, screen 400 × 840; margin x 1376–1824 (448 px) beside the laptop, 828–1824 beside the phone; graphics-safe 96 px; persistent: the device and its chin.
- **Camera**: locked, zoom cap 1.333, shutter 0.5; the device never moves; the screen’s content moves (push, scroll, feed), and the device turns once a film at most.
- **Texture and light**: a fixed seeded 256 px grain at 4 % overlay; no glow, no vignette, no shadow, no reflection; the veil over the screen is the ground at 52 % (porcelain 40 %).
- **Source**: own (`assets/templates/handset/palettes.js, film.js (TYPE, grain), choreo.js (DEVICES)`), split from the template of the handset style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Inter Tight, IBM Plex Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: Take another preset when the accent sits within ΔE00 20 of a colour filling the ringed region. Never draw a UI on the screen; only captures go there.

---
id: poster-grid
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### poster-grid

- **Looks like**: warm paper, black ink, one signal colour, the column grid showing through, 640 px numerals beside 25 px mono capitals; like a Müller-Brockmann concert-poster series set as a product keynote.
- **Intent**: A product launch set like a Swiss concert-poster series: restraint and a visible system make every step read as decided, and the one colour shows where a person decides.
- **Fits / does not fit**: Products whose story is a clear claim plus a sequence of steps or decisions with a person at the start and the end: developer workflows, review and approval tools, rollout tools. Not: Products that need space, depth or spectacle; numbers about many items; stories with no human decision for the accent to mark.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `signal` | Swiss red / 瑞士红 | ground `#F2EFE8` · panel `#F2EFE8` · paper `#F2EFE8` · onPaper `#111111` · ink `#111111` · dim `#5E5A53` · line `#D7D4CE` · grid `#DFDCD6` · accent `#FF3B1F` · onAccent `#111111` · onInk `#F2EFE8` · mutedOnInk `#BDB8AE` · promptOnInk `#FF3B1F` | ink/ground 16.44, dim/ground 5.97, accent/ground 3.1, onAccent/accent 5.3, onInk/ink 16.44, mutedOnInk/ink 9.56, promptOnInk/ink 5.3 | the person and the person’s decisions: the input half, the pick, the YOU nodes, the stop band, the current bar |
  | `ikb` | Ultramarine signal / 群青信号 | ground `#F2EFE8` · panel `#F2EFE8` · paper `#F2EFE8` · onPaper `#111111` · ink `#111111` · dim `#5E5A53` · line `#D7D4CE` · grid `#DFDCD6` · accent `#1E40D8` · onAccent `#F2EFE8` · onInk `#F2EFE8` · mutedOnInk `#BDB8AE` · promptOnInk `#8EA2FF` | ink/ground 16.44, dim/ground 5.97, accent/ground 6.58, onAccent/accent 6.58, onInk/ink 16.44, mutedOnInk/ink 9.56, promptOnInk/ink 7.88 | the person and the person’s decisions (cooler, institutional) |
  | `orange` | Safety orange / 安全橙 | ground `#F2EFE8` · panel `#F2EFE8` · paper `#F2EFE8` · onPaper `#111111` · ink `#111111` · dim `#5E5A53` · line `#D7D4CE` · grid `#DFDCD6` · accent `#D36F01` · onAccent `#111111` · onInk `#F2EFE8` · mutedOnInk `#BDB8AE` · promptOnInk `#D36F01` | ink/ground 16.44, dim/ground 5.97, accent/ground 3.03, onAccent/accent 5.43, onInk/ink 16.44, mutedOnInk/ink 9.56, promptOnInk/ink 5.43 | the person and the person’s decisions (stories with a stop) |
  | `clay` | Clay / 陶土 | ground `#F2EFE8` · panel `#F2EFE8` · paper `#F2EFE8` · onPaper `#111111` · ink `#111111` · dim `#5E5A53` · line `#D7D4CE` · grid `#DFDCD6` · accent `#CF6E4E` · onAccent `#111111` · onInk `#F2EFE8` · mutedOnInk `#BDB8AE` · promptOnInk `#CF6E4E` | ink/ground 16.44, dim/ground 5.97, accent/ground 3.05, onAccent/accent 5.39, onInk/ink 16.44, mutedOnInk/ink 9.56, promptOnInk/ink 5.39 | the person and the person’s decisions (warmer, softer) |
  | `poster-coral` | Coral red / 珊瑚红 | ground `#F2EFE8` · panel `#F2EFE8` · paper `#F2EFE8` · onPaper `#111111` · ink `#111111` · dim `#5E5A53` · line `#D7D4CE` · grid `#DFDCD6` · accent `#EE5444` · onAccent `#111111` · onInk `#F2EFE8` · mutedOnInk `#BDB8AE` · promptOnInk `#EE5444` | ink/ground 16.44, dim/ground 5.97, accent/ground 3.05, onAccent/accent 5.38, onInk/ink 16.44, mutedOnInk/ink 9.56, promptOnInk/ink 5.38 | the person and the person’s decisions (a coral brand colour) |
  | `night-print` | Night print / 夜印 | ground `#141414` · panel `#141414` · paper `#141414` · onPaper `#EDEAE3` · ink `#EDEAE3` · dim `#A39E94` · line `#373635` · grid `#2C2C2B` · accent `#FF4A2E` · onAccent `#141414` · onInk `#141414` · mutedOnInk `#5E5A53` · promptOnInk `#C4311A` | ink/ground 15.33, dim/ground 6.91, accent/ground 5.5, onAccent/accent 5.5, onInk/ink 15.33, mutedOnInk/ink 5.71, promptOnInk/ink 4.6 | the person and the person’s decisions (dark rooms) |

- **Type**: display: en Inter Tight · zh Inter Tight, Noto Sans SC; text: en Inter Tight · zh Inter Tight, Noto Sans SC; mono: en IBM Plex Mono · zh IBM Plex Mono, Noto Sans SC. Files: Inter Tight 100 900 (OFL-1.1), IBM Plex Mono 400 (OFL-1.1), IBM Plex Mono 500 (OFL-1.1), IBM Plex Mono 600 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC subset per film to the characters it uses; labels take no capitals or tracking (28 px), body lines 40 px; display and numerals keep their sizes.
- **Type scale**: en [25, 34, 47, 64, 88, 120, 164, 225], zh [28, 40, 47, 64, 88, 120, 164, 225]; floors en info 25 / main 34, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.045,"numeral":-0.06,"label":0.08},"zh":{"display":0,"numeral":0,"label":0}} (em; Chinese never negative); capitals en ["label"], zh none; italic {"en":false,"zh":false}; leading en 1, zh 1.25.
- **Grid and frame**: columns 1–12 at x = 96 + 146 (i − 1), 122 px wide, 24 px gutters, both edges drawn at the grid alpha; header rule y 116, footer rule y 962, page head rule y 300; content between the two rules.
- **Camera**: locked, zoom cap 1, shutter 0.5, curves {"enter":"expo.out","move":"expo.inOut","exit":"power3.in"}.
- **Texture and light**: a static seeded print tooth (fbm fibre plus fine noise) soft-light at 0.5 over the sheet, under the chrome; no grain animation, no glow, no vignette.
- **Source**: own (`assets/templates/plakat/palettes.js, index.html (CSS), scenes.js (SERIES)`), split from the plakat style of keynote-video. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Inter Tight, IBM Plex Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: The accent is for blocks and large type only in signal, orange, clay and poster-coral (about 3:1 on paper). Chinese has no capitals and no negative tracking; labels are 28 px and body 40 px, so a Chinese page holds fewer items.

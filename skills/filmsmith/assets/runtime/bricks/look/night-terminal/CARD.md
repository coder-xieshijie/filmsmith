---
id: night-terminal
category: look
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### night-terminal

- **Looks like**: a CI run going green on a CRT at night: a black screen with a faint grid drifting, one colour of phosphor light, white display type striped by the raster, small mono everywhere the machine speaks.
- **Intent**: A launch that looks like the tool running on a glowing screen: the machine speaks in mono, the claim in big lit type, one colour of light.
- **Fits / does not fit**: Command-line tools, agents, CI and infrastructure: products whose users live in a terminal. Not: Consumer or lifestyle products, warm human stories, print-like editorial films, anything that needs photographs.
- **Palette presets**:

  | id | Name | Roles | Contrast (measured) | Accent means |
  |---|---|---|---|---|
  | `phosphor` | P1 phosphor green / P1 磷光绿 | ground `#050A07` · groundHi `#0A1A12` · groundLo `#030604` · panel `#08120D` · ink `#E8F1EB` · muted `#9DB3A6` · dim `#7A9385` · line `#1D3527` · accent `#3DDC84` · hi `#B9F0D0` · deep `#1A9E5E` · onAccent `#04140A` · bad `#FF6B6B` · find `#F2CF6B` · key `#8FD0FF` · titleHi `#EEF7F1` · titleLo `#A9B9B0` | ink/ground 17.3, muted/ground 8.96, dim/ground 6.02, accent/ground 11.18, onAccent/accent 10.61 | what passed or is proven: checks, locks, lit outputs, the counter, the closing chips |
  | `amber` | P3 amber phosphor / P3 琥珀磷光 | ground `#0A0703` · groundHi `#1C1309` · groundLo `#050302` · panel `#130D06` · ink `#F4ECE1` · muted `#BBAA94` · dim `#968570` · line `#3A2B1A` · accent `#FFB45C` · hi `#FFE3C0` · deep `#D9822A` · onAccent `#1A0D00` · bad `#FF6F87` · find `#9ED0FF` · key `#C8B8FF` · titleHi `#FAF4EC` · titleLo `#BFB09C` | ink/ground 17.17, muted/ground 8.89, dim/ground 5.63, accent/ground 11.43, onAccent/accent 10.84 | what passed or is proven (infrastructure, databases, ops) |
  | `ice` | P4 ice white / P4 冰白 | ground `#04080C` · groundHi `#0B1724` · groundLo `#020406` · panel `#07111B` · ink `#E6EEF6` · muted `#AAB0B6` · dim `#848C94` · line `#1A2C3D` · accent `#88BFFF` · hi `#DCEBFF` · deep `#3F86D6` · onAccent `#03101C` · bad `#FF7070` · find `#F2CF6B` · key `#C9B4FF` · titleHi `#EEF6FD` · titleLo `#A7B6C4` | ink/ground 17.15, muted/ground 9.18, dim/ground 5.89, accent/ground 10.47, onAccent/accent 10 | what passed or is proven (the default; security, data, cloud) |
  | `ansi-cyan` | ANSI cyan / ANSI 青 | ground `#040A0B` · groundHi `#051A1D` · groundLo `#020606` · panel `#061214` · ink `#E5F1F2` · muted `#97B3B6` · dim `#749297` · line `#133538` · accent `#05D8E3` · hi `#B9ECF3` · deep `#009BA4` · onAccent `#001416` · bad `#FF6B6B` · find `#F2CF6B` · key `#C9B4FF` · titleHi `#EBF7F8` · titleLo `#A5B9BC` | ink/ground 17.27, muted/ground 8.96, dim/ground 5.98, accent/ground 11.33, onAccent/accent 10.74 | what passed or is proven (networking, containers, observability) |
  | `violet` | Theme violet / 主题紫 | ground `#09070D` · groundHi `#181321` · groundLo `#050408` · panel `#110D16` · ink `#EFEEF3` · muted `#AEABB4` · dim `#8E8A94` · line `#322A40` · accent `#C9BCF3` · hi `#E8E1F7` · deep `#9086AF` · onAccent `#120C1C` · bad `#FF7070` · find `#F2CF6B` · key `#8FD0FF` · titleHi `#F5F4FC` · titleLo `#B6B2BB` | ink/ground 17.36, muted/ground 8.86, dim/ground 5.93, accent/ground 11.42, onAccent/accent 10.93 | what passed or is proven (AI and agent tools, editors) |
  | `coral-crt` | Coral red / 珊瑚红 | ground `#0D0706` · groundHi `#21110F` · groundLo `#080404` · panel `#170C0B` · ink `#F7EBEA` · muted `#BFA6A2` · dim `#A08480` · line `#412723` · accent `#FF6452` · hi `#FEC3AD` · deep `#FF3763` · onAccent `#1C0A07` · bad `#C9B4FF` · find `#F2CF6B` · key `#8FD0FF` · titleHi `#FEF2F1` · titleLo `#C2B0AC` | ink/ground 17.17, muted/ground 8.75, dim/ground 5.82, accent/ground 6.85, onAccent/accent 6.57 | what passed or is proven (a coral brand; `bad` moves to violet) |

- **Type**: display: en Inter · zh Inter, Noto Sans SC; text: en Inter · zh Inter, Noto Sans SC; mono: en JetBrains Mono · zh JetBrains Mono, Noto Sans SC. Files: Inter 100 900 (OFL-1.1), JetBrains Mono 100 800 (OFL-1.1), Noto Sans SC 100 900 (OFL-1.1, subset per film). Chinese: Noto Sans SC after each family, no capitals, no tracking (the display's −0.045 em is dropped), labels and HUD at 28 px, body at 40 px; display sizes as English.
- **Type scale**: en [25, 32, 40, 50, 64, 84, 108, 150, 190, 240], zh [28, 32, 40, 50, 64, 84, 108, 150, 190, 240]; floors en info 25 / main 40, zh info 28 / main 40.
- **Tracking, case, italic, leading**: tracking {"en":{"display":-0.045,"numeral":-0.045,"label":0.12},"zh":{"display":0,"numeral":0,"label":0}} (em; Chinese never negative); capitals en ["label"], zh none; italic {"en":false,"zh":false}; leading en 0.95, zh 1.15.
- **Grid and frame**: content inside x 110–1810, y 84–996; header at (110, 92); a 160 px accent grid at 0.05 drifting 160 px a minute right and 80 down, + crosses every 320 px; the HUD at the edges (see terminal-hud).
- **Camera**: push, zoom cap 1.1, shutter 0.5, curves {"enter":"expo.out","move":"expo.inOut","exit":"power1.in"}.
- **Texture and light**: radial ground groundHi → ground → groundLo; a 400 px glow disc of the accent at 0.11 breathing ±3.3 % over four bars; screen `crt` (2 px scanlines one in three at 22 %, display type striped 4 / 2 px, vignette to 60 % at the corners) or `flat`; overlay grain at 0.18 changing 12 times a second.
- **Source**: own (`assets/templates/phosphor/palettes.js; index.html CSS (type, ground, screen)`), split from the template of the phosphor style. **Licence**: MIT (Filmsmith); fonts OFL-1.1 each (Inter, JetBrains Mono, Noto Sans SC).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Pitfalls**: `cyan` and `coral` are renamed `ansi-cyan` and `coral-crt` (the ids are taken by other looks). The `flat` screen drops the stripes and the vignette, not the glow: a flat film still reads as phosphor.

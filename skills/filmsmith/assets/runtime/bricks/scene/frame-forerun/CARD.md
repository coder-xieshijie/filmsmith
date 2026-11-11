---
id: frame-forerun
category: scene
energy: high
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### frame-forerun

- **Purpose**: a ceremony of arrival for one panel: the frame comes first and claims the place, then the page wakes inside it and its parts are set down from the air, so the viewer sees the interface being placed, not appearing.
- **Intent**: Give one panel a ceremony of arrival: the frame claims the place first, then the page wakes inside it and its parts are set down from the air, so the viewer sees the interface being placed, not appearing.
- **Content**: One UI page as 4–16 crops with their page positions (or a neutral workbench), an optional 1440 × 840 base image, and the product name (en ≤ 12 chars, zh ≤ 6).
- **Fits**: `hook`, `demo`, `turn`. **Not for**: light or calm films; a panel to be read in detail; more than one per film.
- **Layout and camera**: a 1440 × 840 page in CSS 3D, framed 22 px outside by a neon tube (four strokes of the accent: a wide halo, a halo, the colour core and a white-hot core) with five echo frames further back and larger, forming a tunnel. `forerun`: the camera settles from a strong slant (rotateY −30°, rotateX 10°, rotateZ −7°, scale 0.8) to −12° / 5° / −2.5° / 0.88 over 96 frames, then drifts 1.5° in the hold. `together`: the camera arcs from the page's left (+38°) to its right (−26°) over 128 frames while the perspective origin moves 30 % → 64 %. Dark ground with a key light up left, an accent fill down right and a heavy vignette. Not a screen recording: the page is slanted and lit like an object, parts are lifted in real depth with their own shadows, and the shot ends on the settled panel, not on a reading of it.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `parts` | list of the film's crops (`image`, `x`, `y`, `w`, `h` in page px, `land` 0–1, `lift` px) | — | 4–16 | — | — | a neutral workbench home: brand, four nav items, a greeting, three stat cards, a label, four task rows (sample copy on the paper role) |
  | `base` | image (1440 × 840) | — | 0–1 | — | — | the paper role with a side bar |
  | `product` | text | glance | 1 | 1 word / 12 chars | 6 chars | `product` |

- **Length**: 9.3 beats (140 frames, 4.7 s at 120 BPM); range 8–11.
- **Steps and events**: `forerun`: a spark at the left-middle 0–2; the two heads run 2–22 (swift) and collide at the right-middle with a flash (T1 peak, beat 1.5); echo frames strike up near to far from 20 with a deterministic flicker; the page shows 16–30 and brightens 24–84 while a tinted veil withdraws to the right; parts fall in 24 frames each (accelerating, soft landing), landing 54 → 104 sidebar first then main area, dense then sparse; the core of the tube thins to a hairline 60–100 and the echoes go out middle first 94–118; hold 124–140. `together`: the frame draws in 14 frames, the page is lit 8–30, every part falls together 34–66 (beat 4.4 lands), the echoes fade with the background light 100–136.
- **Needs**: helper `GLYPHS` (hub-links); roles `ground`, `paper`, `onPaper`, `ink`, `accent`, `onAccent`, `warn`, `fail`; type `display`, `text`, `mono`.
- **Sound**: a rising hum under the trace, a hard `accent` on the collision; soft ticks on the landings (forerun) or one `land` (together).
- **Styles**: dark, neon-tolerant styles; avoid strip, split, scroll, dossier. **Source**: adapted from video-shotcraft `demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx` (card `references/shots/ui-entrance/neon-frame-forerun.md`) and `demos/ui-entrance/neon-frame-orbit-drop/NeonFrameForerunOrbit.tsx` (card `references/shots/ui-entrance/neon-frame-orbit-drop.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, `sample/poster-together-en.jpg` (and zh).
- **Differs from upstream**: the tube is the accent (not purple to pink, nor the orbit shot's purple to amber); the brand page is a neutral workbench or the film's crops; in `together` the parts rise in real depth like `forerun` (the orbit shot lifts them up-left in 2D), the panel is the same 1440 × 840 page (upstream 1330 × 790) and the echo tunnel replaces its random background frames; grain is dropped. Compare: forerun pass (two parts and the panel box, 3.3 px, RMSE 0.0013, events ±1); together (dry run, the panel box) 19.6 px (the page size), events ±2, SSIM drop 0.17 (the different page and background).
- **Pitfalls**: Pick the landing rhythm by meaning: staggered parts (forerun) for a page being assembled, all parts on one frame (together) for one whole arrival; mixing them gets both rejected. The floating shadow must be clearly visible; parts that drop without a felt shadow look like a plain fade. Use one of the two modes per passage and at most once per film; the same frame language twice reads as repetition.
- **Sample**: `poster.jpg`, an English still 480 px wide.

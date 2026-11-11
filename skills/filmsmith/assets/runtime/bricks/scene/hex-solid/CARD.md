---
id: hex-solid
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### hex-solid

- **Purpose**: The card outline morphs into a hexagon, three accent lines re-read it as a cube, the faces take three tones; a caption rises and three counted face labels hang off the cube.
- **Intent**: A flat thing is revealed as a solid source, so the viewer understands that everything else is generated from it.
- **Content**: A caption (≤ 15 chars / 7 字) and up to three counted face labels (≤ 15 / 8 字, may use {endpoints} {schemas} {sdks}).
- **Fits**: `turn`, `demo`, `proof`; The turn of a promotion: one flat thing revealed as a solid source (a spec, a schema, a model). **Not for**: Films without a flat object before it; more than three counts.
- **Layout and camera**: the hexagon/cube at (1300, 560), r 210; the caption at the left (baseline 470); face labels on leader lines above and below the cube.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `caption` | text | primary (claim) | 1 | 4 words, 15 chars | 7 chars | One spec in. / 一份规格进。 |
  | `faces` | list of text | glance | 0–3 | 2 words, 15 chars | 8 chars | ["{endpoints} endpoints", "{schemas} sch… |

- **Length**: 6–10 beats (3–5 s at 120 BPM); the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 the card outline morphs into the hexagon (0.1–0.48 s); beat 2 three accent lines re-read it as a cube; 2.6 the faces take three tones; 3 the caption rises; 4, 4.5, 5 the face labels; last beat the front face takes the accent.
- **Needs**: motions outline-morph, stroke-reinterpret; props none; roles ground, ink, line, paper, accent; type display, mono.
- **Sound**: `turn` on 0, `accent` on 2, `land` on 3, `accent` on the last beat.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph, blueprint; avoid none.
- **Source**: own (`assets/templates/morph/film.js (drawSolid, solidState, faceLabels, cube)`), split from the template of the morph style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The caption is 86 px bold: Chinese holds seven characters at most.

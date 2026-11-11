---
id: sheet-overview
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### sheet-overview

- **Purpose**: Sheets → system, the claim: the camera pulls out to the whole drawing, one heavy route draws through every sheet centre, a claim panel rises over the blurred drawing with two lines at 200 px, and the amber APPROVED stamp lands in the title block.
- **Intent**: Step back to show every sheet was one design, then state the claim with a person's approval on the whole drawing.
- **Content**: Label, two claim lines (≤ 18 chars), the stamp word and small line, the sheet names (3–8) to draw under it.
- **Fits**: `claim`, `climax`; The climax of a blueprint film, after the last sheet, before the release. **Not for**: Films with fewer than three sheets; a claim longer than two short lines; films where no person approves (drop the stamp).
- **Layout and camera**: the world: the sheets in a 3-column serpentine (1920 × 1080 cells, 120 px gutters and margins), the camera from the last sheet at 1:1 to the whole at 0.985 of the fit; under it the film's own sheets when `pages` names their scene bricks (`pages[k] = { scene, params }`, drawn in their last settled state without their frames; `false` keeps a cell empty for a sheet not drafted yet), otherwise each sheet's frame, number, title and two boxes; the route 14 px ink through the centres with 34 px dots; the panel: paper at 0.84 over the drawing blurred 5 px; label at (150, 290); lines at 200 px (140 if they overflow 1640) at baselines 476 and 688 with guides; the stamp in the APPROVED BY cell (−3°, 36 → 28 px to fit 112 px).
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | System overview / 系统总览 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | System overview — all sheets / 系统总览 — 全部图纸 |
  | `lines` | list of text | primary | 2–2 | 4 words, 18 chars | 7 chars | ["Signed first,","then shipped."] / ["先签字，","再上线。"] |
  | `stamp` | group | – | 1 | – | – | {"word":"Approved","small":"by the owner… / {"word":"批准","small":"负责人"} |
  | `sheets` | list of text | glance | 3–8 | 3 words, 24 chars | 8 chars | ["Problem statement","General arrangemen… / ["问题说明","总体布置","控制台","评审","分阶段","金丝雀"] |

- **Length**: 7–14 beats (3.5–7 s at 120 BPM); longer copy reads longer; the sample plans 7 beats in English, 10 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: the pull-out over the first 1.5 beats (plan lead); the route from beat 1.5 over 1.5 beats with a dot per sheet; the panel on 2.75; line 1 on 3, line 2 on 3.5; the stamp on 4.5 with a thud; it holds as a pause; panel, route and lines leave 0.18 s from half a beat before the end.
- **Needs**: motions guide-letter; props sheet-hud, drafting-stamp; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `turn` on the route (a swell, a chime as it lands), `claim` on line 1 (the drop, ducked), `stamp` on the approval.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/film.js (world route, final overview, hudStamp); choreography.js CUES.overview`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The sheets under it are this brick's stand-ins (frames, titles, a box or two): in a film the host can draw the real sheets in the same world.

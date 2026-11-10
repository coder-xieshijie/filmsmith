---
id: release-block
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### release-block

- **Purpose**: The end card as a title block: a kicker, the product name dimensioned at 200 px, tags as framed chips, the URL in a framed field held at least 3 s, a key plan of the sheets, a foot line; RELEASED lettered in a framed field on the last downbeat.
- **Intent**: End on the issued drawing: the name, what it does in four words, where to get it, and the status stamped as released.
- **Content**: Label, kicker (≤ 40), name (≤ 14), 2–5 tags (≤ 14), URL (≤ 44), a foot line, the status word.
- **Fits**: `lockup`; The last sheet of a blueprint film. **Not for**: Logos that must be artwork; more than five tags; a film that ends unreleased (change the status word).
- **Layout and camera**: label (150, 180), kicker at 262; the name at 200 px (fits to 140) with a dimension over it; tags as framed chips at y 586; the URL field at y 640 (104 px, corner ticks) at 50 px Plex Mono; the key plan at the right; foot at y 828; the status field right-aligned to 1790 at y 782; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats.; with `approved` ({ word, small }) the overview's approval stamp stays landed in the title block's APPROVED BY cell
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Release / 发布 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Release / 发布 |
  | `kicker` | text | glance | 1 | 7 words, 40 chars | 16 chars | Rollouts signed before they ship / 发布前先签字的开关上线 |
  | `name` | text | primary | 1 | 2 words, 14 chars | 7 chars | lintel / lintel |
  | `tags` | list of text | glance | 2–5 | 2 words, 14 chars | 5 chars | ["plan","sign","stage","canary"] / ["计划","签字","分阶段","金丝雀"] |
  | `url` | code | primary | 1 | 44 chars | 44 chars | github.com/example/lintel / github.com/example/lintel |
  | `foot` | text | glance (optional) | 1 | 8 words, 44 chars | 18 chars | [["MIT","ink"],[" · works with any flag … / [["MIT","ink"],[" · 支持任何开关服务","muted"]] |
  | `status` | text | glance | 1 | 1 words, 12 chars | 4 chars | Released / 已发布 |
  | `keyLabel` | text | glance | 1 | 5 words, 24 chars | 12 chars | Key · sheets 1–{n} / 索引 · 第 1–{n} 张 |

- **Length**: 7–16 beats (3.5–8 s at 120 BPM); longer copy reads longer; the sample plans 10 beats in English, 10 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; kicker 1, name 1.2; tags from 2 (0.25 beat apart); key plan 2.2; URL box 2.5, URL 2.6; foot 3.4; it holds; the status on the last downbeat with its construction lines.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` on the name, `tick` on the URL box and the status, the bed's outro.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/release.js; choreography.js CUES.release; timeline.js status cue`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: RELEASED lands on the last downbeat (4 beats before the end): a host that cuts the scene short loses the closing move.

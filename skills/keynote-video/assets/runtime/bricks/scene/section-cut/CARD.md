---
id: section-cut
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### section-cut

- **Purpose**: An artefact and the check on it: two oblique boxes cut by a section line, notes off the cut, a dimension repeating the check, the output box, and an inspection stamp in the line colour.
- **Intent**: Open the artefact like a section drawing so its insides are evidence, and certify it in the machine's colour.
- **Content**: Label, title, sub, two parts (name, description, up to two lines), the cut label, 1–2 notes, a dimension (code), the output, a stamp.
- **Fits**: `proof`, `demo`; A sheet about what the product produces and how a machine verifies it: an archive, a build, a package. **Not for**: Processes (use lap-loop); more than two parts; checks a person makes (use detail-confirm).
- **Layout and camera**: label, title (325), sub (402); two oblique boxes from x 150 (DX 60, DY −40) with their faces shaded at 0.14 / 0.07; the section line through both with its label; notes off the cut; the dimension and the output box to the right; the stamp (−8°) solved clear of the lettering; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats; push-in on the stamp.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Detail 03 · Seal / 详图 03 · 封存 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Detail 03 — the archive / 详图 03 — 归档 |
  | `title` | text | primary | 1 | 1 words, 10 chars | 4 chars | SEAL / 封存 |
  | `sub` | text | glance | 1 | 6 words, 60 chars | 16 chars | Compressed, hashed, encrypted. / 压缩、哈希、加密。 |
  | `parts.name` | list of code | primary | 2–2 | 12 chars | 12 chars | dump.zst / dump.zst |
  | `parts.desc` | list of text | glance | 2–2 | 4 words, 26 chars | 10 chars | compressed SQL dump / 压缩后的 SQL 导出 |
  | `parts.lines` | list of list | – | 2–2 | – | – | [] / [] |
  | `cut` | text | glance | 1 | 2 words, 14 chars | 6 chars | Section A-A / 剖面 A-A |
  | `notes` | list of text | primary | 1–2 | 4 words, 30 chars | 12 chars | ["Checksums recorded.","Encrypted at res… / ["已记录校验和。","静态加密。"] |
  | `output` | text | primary | 1 | 1 words, 12 chars | 4 chars | ARCHIVE / 归档 |
  | `dimension` | code | glance | 1 | 28 chars | 28 chars | sha256 3be1…09c2 / sha256 3be1…09c2 |
  | `stamp` | group | – | 1 | – | – | {"word":"Sealed","small":"checksum ok"} / {"word":"已封存","small":"校验通过"} |

- **Length**: 10–18 beats (5–9 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 17 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title 1; sub 1.5; box 1 on 1.9, box 2 on 2.4; the cut 3.2; notes 3.6; output 3.9; dimension 4.2; the stamp on beat 6; build over on 8.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line, `tick` per box, `land` on the cut and the dimension, `stamp` in the line colour.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/section.js; choreography.js CUES.section`), split from the blueprint style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The dimension is code (a hash): keep it Latin and ≤ 28 characters or it collides with the output box.

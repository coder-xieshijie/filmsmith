---
id: inspection-record
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### inspection-record

- **Purpose**: Verification as an inspection record: a table of 3–8 checks, a computed count k / n at 280 px, a note and a footer; each row's result is drafted as the probe run passes it, and a line-colour stamp lands beside the count on beat 5.
- **Intent**: Prove the claim by machine: the count is computed from the rows, so it can never disagree with the table, and a machine's stamp certifies it.
- **Content**: Label, title, sub, two column heads, 3–8 check ids (code ≤ 8) with pass/fail, a count label, note, footer, a stamp word.
- **Fits**: `proof`; A sheet of machine checks with a count that can be computed: tests, probes, restores, canaries. **Not for**: Checks a person performs; more than eight rows; failures shown as drama (an X row is drafted as plainly as a tick).
- **Layout and camera**: label, title (325), sub (402); the table at x 150, y 430, 760 wide, 48 px head, rows up to 45 px over 315 px, ticks at x 642–674; the count at (1030, 650) 280 px; its label under it; the note in a dashed box; the footer at y 876 with an octagon mark; the stamp (−6°) right of the count; the camera arrives over the first beat (plan lead 1, `from`: left, right, above, below or none), drifts 1.0 → 1.012 while the sheet draws and holds still two beats; push-in on the count and stamp.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `hud` | text | glance | 1 | 4 words, 24 chars | 10 chars | Detail 04 · Canary / 详图 04 · 金丝雀 |
  | `label` | text | glance | 1 | 7 words, 36 chars | 16 chars | Detail 04 — canary probes / 详图 04 — 金丝雀探针 |
  | `title` | text | primary | 1 | 1 words, 10 chars | 4 chars | CANARY / 金丝雀 |
  | `sub` | text | glance | 1 | 6 words, 90 chars | 20 chars | Every stage, checked by machine. / 每个阶段都由机器检查。 |
  | `head` | list of text | glance | 2–2 | 2 words, 16 chars | 6 chars | ["Probe","In limit"] / ["探针","未超限"] |
  | `items.id` | list of code | glance | 3–8 | 8 chars | 8 chars | errors / errors |
  | `items.ok` | list of flag | – | 3–8 | – | – | true / true |
  | `countLabel` | text | primary | 1 | 4 words, 26 chars | 10 chars | probes within limits / 个探针在限内 |
  | `note` | text | primary (optional) | 1 | 5 words, 30 chars | 12 chars | Over limit → rolls back / 超限 → 自动回滚 |
  | `footer` | text | primary (optional) | 1 | 8 words, 48 chars | 18 chars | A rollback pages the owner. / 一旦回滚，通知负责人。 |
  | `stamp` | group | – | 1 | – | – | {"word":"Verified"} / {"word":"已验证"} |

- **Length**: 10–18 beats (5–9 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 14 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: arrival; title 1; sub 1.5; table 1.8; count 2.4 (0 / n); label 2.6; the probe run from 3.0 over 1.5 beats, each row ticked as it passes and the count climbing; note 4.0; footer 4.3; the stamp on beat 6; build over on 8.
- **Needs**: motions guide-letter; props sheet-hud; roles ground, paper, ink, line, dim, accent, onAccent; type display, mono.
- **Sound**: `land` per line, `turn` on the probe run (ticks per row from the device cue), `stamp` in the line colour.
- **Styles**: made for `blueprint` (recipe the blueprint recipe); fits blueprint; avoid plakat, phosphor.
- **Source**: own (`assets/templates/blueprint/sheets/checklist.js; choreography.js CUES.checklist, CHECK_TABLE, scanRowBeats`), split from the template of the blueprint style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after IBM Plex Sans Condensed / Plex Mono, as written (no capitals) and untracked; the pen lifts Chinese lettering to the library floors (25 → 28 px, 35 → 40 px) and drafts its construction lines on the em box (0.12 em under, 0.88 em over the baseline) instead of the baseline and cap line; commands, ids, hashes and URLs stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the blueprint template (`assets/templates/blueprint/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the blueprint recomposition (the recipe's Recomposition section). Intended departures: one sheet per brick at 1:1 instead of a world of sheets under one camera (the brick draws its own arrival; the travel between two sheets is the motion route-pan, the outgoing sheet is not drawn by the incoming brick); the frame (HUD) is drawn whole from the first frame instead of drafting itself in the film's first second; frame-level transitions (shape-flood at an issue, blueprint-expose for the probe run, occluder-pass into the release) are the host's runtime transitions.
- **Pitfalls**: The lamp is the host's blueprint-expose (develop: false); with `lamp: 'line'` the brick draws only a stand-in feed line, so pass `lamp: 'host'` in a film.

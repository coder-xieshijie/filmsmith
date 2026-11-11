---
id: verify-band
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### verify-band

- **Purpose**: A check run on a copy: a dashed box (the source) links to an ink box (the copy); result rows fill, a counter climbs with an accent flash, and an accent band lands with two statements: what passed and what the person still decides.
- **Intent**: Prove the claim on a copy before anyone signs: rows of results and a counter, then a band that hands the last word to the person.
- **Content**: Page head, from and to box labels, 3–6 result rows (≤ 24 chars), a count, an optional blind-spot line, two statements (≤ 32 chars).
- **Fits**: `proof`, `turn`; A proof page: a dry run, a replay on a shadow copy, a test pass before the person signs. **Not for**: Results with more than six rows; failures to dramatise (the band states a pass).
- **Layout and camera**: page head; dashed from-box at columns 1–3, link, ink to-box at columns 4–6 (y 360–520); result rows at columns 7–12 from y 360; counter 164 px; blind line at y 720; the accent band y 780–940 with two statements; locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `num` | number | glance | 1 | 2 chars | 2 chars | 03 / 03 |
  | `title` | text | primary | 1 | 2 words, 10 chars | 5 chars | Replay / 回放 |
  | `caption` | text | glance | 1 | 8 words, 48 chars | 18 chars | Replayed on a prod copy. / 在生产副本上回放。 |
  | `from` | group | – | 1 | – | – | {"label":"Plan","title":"0042_drop_email… / {"label":"计划","title":"0042_drop_email"} |
  | `link` | code | glance | 1 | 28 chars | 20 chars | copy  pg-shadow-2 / 副本  pg-shadow-2 |
  | `to` | group | – | 1 | – | – | {"label":"Probe","title":"Shadow replay"… / {"label":"探针","title":"影子回放","note":"独立角… |
  | `rows.id` | list of code | glance | 3–7 | 4 chars | 4 chars | L01 / L01 |
  | `rows.ref` | list of text | glance | 3–7 | 5 words, 28 chars | 12 chars | longest lock 38 ms / 最长锁 38 ms |
  | `rows.result` | list of text | glance | 3–7 | 1 words, 6 chars | 3 chars | PASS / 通过 |
  | `counter` | group | – | 1 | – | – | {"label":"Checks","caption":"green on th… / {"label":"检查","caption":"影子副本上全绿"} |
  | `blind` | text | glance (optional) | 1 | 6 words, 34 chars | 14 chars |  /  |
  | `band` | group | – | 1 | – | – | {"a":"Red means stop.","b":"You pick the… / {"a":"红色就停下。","b":"修法由你来选。"} |

- **Length**: 8–20 beats (4–10 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 16 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: page head; boxes and link draw; rows fill one by one with their result; the counter climbs 0..n and flashes the accent; the blind line; the band wipes in and its statements rise; roll-up exit.
- **Needs**: motions walk-frame, block-carry; props poster-chrome; roles paper, ink, dim, line, grid, accent, onAccent, onInk; type display, text, mono.
- **Sound**: `tick` per row, `count` up the counter, `accent` on the band.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (verify)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: The band's statements are on the accent: 34/40 px is the floor at about 3:1, keep them short.

---
id: poster-end
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### poster-end

- **Purpose**: The closing page, flush left: the name at 225 px, three or four parts under 4 px rules, an ink square and the URL at 47 px held at least 3 s, a rule and foot lines; an ink underline lands under the URL on the last downbeat.
- **Intent**: End on what to type: the name, its parts as a summary, and the URL held long enough to read and remember.
- **Content**: Name (≤ 14 chars), 2–4 parts (≤ 12 chars), URL (code, ≤ 44), 1–2 foot lines (≤ 44).
- **Fits**: `lockup`; The last page of a plakat film; any Swiss-style lockup with a URL. **Not for**: Logos that must be drawn as artwork; more than four parts; films that end on a question.
- **Layout and camera**: name 225 px at (84, 150) fitted to 1740; parts at columns 1, 4, 7, 10 under 4 px rules at y 500 (47 px); ink square 52 px at (96, 700), URL 47 px Plex Mono at x 176; rule at y 820; foot lines at y 842 (column 1 and column 8); locked camera.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `name` | text | primary | 1 | 2 words, 14 chars | 7 chars | tablewarden / tablewarden |
  | `items` | list of text | glance | 2–4 | 1 words, 12 chars | 5 chars | ["DRAFT","MEASURE","REPLAY","SIGN"] / ["起草","测量","回放","签字"] |
  | `url` | code | primary | 1 | 44 chars | 44 chars | tablewarden.example/docs / tablewarden.example/docs |
  | `foot` | list of text | glance | 1–2 | 6 words, 44 chars | 16 chars | ["MIT · Postgres 14+","Agents draft. You… / ["MIT · Postgres 14+","代理起草，你来签字。"] |

- **Length**: 6–16 beats (3–8 s at 120 BPM); longer copy reads longer; the sample plans 11 beats in English, 11 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: name rises 0.7 s; rules grow, parts land 0.1 u apart; square, URL; rule and foot; it holds; on the last downbeat (2 beats before the end) the URL's underline lands.
- **Needs**: motions none; props poster-chrome; roles paper, ink, dim, grid; type display, text, mono.
- **Sound**: `land` on the name, `stamp` on the square, `end` on the last-downbeat underline; the bed's outro.
- **Styles**: made for `plakat` (recipe the plakat recipe); fits plakat; avoid tally, thread.
- **Source**: own (`assets/templates/plakat/scenes.js (end)`), split from the template of the plakat style.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; Chinese copy takes Noto Sans SC after Inter Tight: no negative tracking, no capitals, labels 28 px, body 40 px; ids, commands and numbers stay Latin.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the plakat template (`assets/templates/plakat/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the plakat recomposition (the recipe's Recomposition section). Intended departures: it draws on canvas from `s.colors` and the look poster-grid instead of the template's DOM and CSS variables (masks, fitted sizes and tweens reproduced from scenes.js); timing in beats from the scene's start (the template's u is two beats); the device that enters or covers the scene (plakat-columns, plakat-reblock) is not drawn inside it.
- **Pitfalls**: It absorbs the phrase's remainder: a host that cuts it short loses the last-downbeat underline.

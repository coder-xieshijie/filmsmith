---
id: cube-page
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### cube-page

- **Purpose**: The cube unfolds into a flat cross, its six squares slide into the six panels of the generated docs page, the panels fill and the highlight jumps to the endpoint the film follows.
- **Intent**: The source unfolds into the interface it generates, so 'one spec in, every doc out' is shown as geometry.
- **Content**: Two captions (≤ 15 chars / 7 字 each), the reference title (≤ 24 / 12 字), a code sample [language, line], the product facts (endpoints, body, call, SDKs).
- **Fits**: `demo`, `turn`; A source that becomes an interface: spec to docs, model to dashboard, config to console. **Not for**: Interfaces that are not six panels; real screenshots.
- **Layout and camera**: the cube about its front face unfolds into a cross at (1300, 540), the squares slide into the six panels (x 792–1800), the captions at the left.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `above` | text | primary (optional) | 1 | 4 words, 15 chars | 7 chars | One spec in. / 一份规格进。 |
  | `caption` | text | primary (claim) | 1 | 4 words, 15 chars | 7 chars | Every doc out. / 全部文档出。 |
  | `ref` | text | glance | 1 | 4 words, 24 chars | 12 chars | Retrieve an invoice / 获取一张发票 |
  | `code` | list of code | – | 2–2 | – | – | ["python", "qs.invoices.get(id)"] |

- **Length**: 5–9 beats (2.5–4.5 s at 120 BPM); the sample plans 6 beats in English, 7 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 unfold; beat 1 slide (decelerate 0.45 s, 25 ms apart); beat 2 fill (0.24 s, 40 ms apart); 2.5 the caption; 3 the highlight jumps; 4 it settles.
- **Needs**: motions net-unfold; props api-page; roles ground, paper, ink, dim, line, accent, onAccent; type display, mono.
- **Sound**: `turn` on 0 and 1, `land` on 2, `accent` on 3.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (drawUnfold, panelRects, panelContent)`), split from the morph style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: Endpoint paths are shown as their last segment; long paths still overflow the 340 px list.

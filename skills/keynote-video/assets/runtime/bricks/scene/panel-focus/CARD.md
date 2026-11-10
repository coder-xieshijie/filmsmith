---
id: panel-focus
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: MIT
status: approved
---

### panel-focus

- **Purpose**: The six panels gather into one card at main size; the title rises, language tabs and code enter, the highlight steps tab to tab leading edge first, and Run takes the accent.
- **Intent**: A whole interface narrows to one call shown in the viewer's language of choice, so 'it works in yours' is seen.
- **Content**: A title (≤ 28 / 12 字), 1–4 tabs (language, 1–3 code lines ≤ 44 chars), the Run label (≤ 6 chars / 3 字).
- **Fits**: `demo`; The demo beat of a developer product: one call shown in several languages. **Not for**: More than four tabs; code lines over 44 characters.
- **Layout and camera**: the six panels gather into one card at [200, 120, 1520, 640]; title top left, tabs top right, code at 55 px, the endpoint and Run at the bottom.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default (en / zh) |
  |---|---|---|---|---|---|---|
  | `title` | text | primary | 1 | 5 words, 28 chars | 12 chars | Retrieve an invoice / 获取一张发票 |
  | `run` | text | glance | 1 | 1 words, 6 chars | 3 chars | Run / 运行 |
  | `tabs` | list | – | 1–4 | – | – | 3 items |
  | `tabs[].lang` | code | – | 1 | – | – | – |
  | `tabs[].code` | list | – | 1 | – | – | – |
  | `above` | text | glance (optional) | 1 | 4 words, 15 chars | 7 chars | One spec in. / 一份规格进。 |
  | `caption` | text | glance (optional) | 1 | 4 words, 15 chars | 7 chars | Every doc out. / 全部文档出。 |
  | `ref` | text | glance (optional) | 1 | 4 words, 24 chars | 12 chars | Retrieve an invoice / 获取一张发票 |

- **Length**: 5–11 beats (2.5–5.5 s at 120 BPM); the sample plans 8 beats in English, 8 in Chinese (Chinese reads 6 characters a second plus 0.5 s).
- **Steps and events**: beat 0 gather; 1 title; 2 tabs, code, Run; a tab every 1.5 beats; Run takes the accent 1.5 beats after the last tab.
- **Needs**: motions container-morph; props api-page, code-card; roles ground, paper, ink, dim, line, accent, onAccent; type display, mono.
- **Sound**: `turn` on 0, `land` on 1, `tick` per tab, `accent` on Run.
- **Styles**: made for `morph` (recipe the morph recipe); fits morph; avoid none.
- **Source**: own (`assets/templates/morph/film.js (drawFocus, focusContents)`), split from the morph style of keynote-video.
- **Licence**: MIT (Filmsmith).
- **Languages**: en full · zh full; code, paths and the product name stay Latin; captions take Noto Sans SC after Inter Tight at 0 tracking (English −2 px at 86).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no upstream: an own brick split from the morph template (`assets/templates/morph/`), so the compare is waived (`compare.verdict: waived`). Checked instead side by side with the original example film at the same moment: the morph recomposition (the recipe's Recomposition section). Intended departures: it draws from `s.colors` and the look's roles instead of the template's palette constants; its timing is in beats from the scene's start (the template's seconds at 120 BPM converted); the content leaves and enters only within the brick (the template's cross-scene hand-off is the next brick's start state).
- **Pitfalls**: The highlight moves leading edge first; jumping both edges at once reads as a cut.

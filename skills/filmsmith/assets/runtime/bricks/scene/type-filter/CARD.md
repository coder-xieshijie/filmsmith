---
id: type-filter
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### type-filter

- **Purpose**: lets the audience do a search along with you: type, the page narrows to one card, click it, go in.
- **Intent**: Let the viewer do it along with you: see what was typed, how the page answers, and where the click lands, at the pace of a human hand rather than a script.
- **Content**: A short query (en ≤ 14 chars, zh ≤ 5), 4–12 result cards with a title (en ≤ 18, zh ≤ 6) and meta (en ≤ 12, zh ≤ 5), one of them the match; optional heading and placeholder (en ≤ 18, zh ≤ 6); optionally a real page's layout.
- **Fits**: `demo`. **Not for**: a search with several results (it narrows to one); long queries; the end of a film (it hands over into what the card opens).
- **Layout and camera**: a page with a heading, a search bar (`input-field`, form `bar`) and a grid of 4–12 cards (default 4 × 3 of 380 × 220, the match's cover in the accent). The camera starts close on the search field (1.6 ×; the query readable), pulls back to the whole page in the held breath after typing, and pushes in on the match (2.2 ×) after the click to hand over. Not a screen recording: the camera follows the action (close to read, wide to see the narrowing, close to enter), the leaving cards go in reading order with a sink and a blur, the match floats up with a speed blur, and the pointer appears only for the click, at a constant size on screen. A real page's geometry can be given (`layout`) to play this over its capture.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `heading` | text (optional) | glance | 1 | 3 words / 18 chars | 6 chars | All projects / 全部项目 |
  | `query` | text (typed) | glance | 1 | 2 words / 14 chars | 5 chars | teaser / 预告 |
  | `placeholder` | text (optional) | glance | 1 | 3 words / 18 chars | 6 chars | Search projects / 搜索项目 |
  | `items` | list of `{ title, meta }` | glance | 4–12 | 3 words / 18 chars; 2 / 12 | 6 / 5 chars | twelve production items |

  Params: `target` 10 (the match), `layout` null (`{ search: [x, y, w, h], cards: [[x, y, w, h], …], radius }`), `zoom` [1.6, 2.2].
- **Length**: 10 frames + 3 a grapheme (Chinese 5) + 11 + 16 + 15: about 4.5 beats for six letters; 3–7.
- **Steps and events**: focus ring from 4; typing from 10 (caret solid, then blinking); a held breath of 11 frames; filter: each other card leaves over 5 frames, 0.4 frames apart in reading order; the match slides to the first slot in 10 frames (bezier .35 0 .2 1) floating 1.02; the camera reaches the full page 4 frames into the filter; the pointer fades in and arcs to the match (bezier .45 0 .2 1), presses at filter + 16 with a double ripple (54 and 78 px) and the outline lit 2 frames later; push-in over the last 16 frames.
- **Needs**: props `input-field`, `cursor`; roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`; type `display`, `text`.
- **Sound**: soft key ticks while typing (optional), `turn` on the filter, `stamp` on the click.
- **Styles**: any interface style. **Source**: adapted from video-shotcraft `demos/interaction/type-and-filter/TypeAndFilter.tsx` (card `references/shots/interaction/type-and-filter.md`) @ `1266a3e` (and its page camera `demos/_fixtures/PageCam2D.tsx`). **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: no page screenshots: the page, its cards and the search bar are drawn and their text is slots (the screenshot geometry can be passed as `layout`); the selection and ripple are the accent. Compare against `type-and-filter` with its layout: pass (the match and the pointer, 0.7 px, events ±0).
- **Pitfalls**: Type at about 3 frames a character to start; first drafts of an interaction are almost always too fast. The match must land in a real slot of the page; a card hovering above the grid reads as fake.
- **Sample**: `poster.jpg`, an English still 480 px wide.

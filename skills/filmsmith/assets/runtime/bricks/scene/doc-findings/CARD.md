---
id: doc-findings
category: scene
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### doc-findings

- **Purpose**: gives conclusions one at a time without losing their source: the document stays on screen, parked and still being read, and every finding is visibly pulled out of one of its lines.
- **Intent**: Give conclusions one at a time without losing their source: the document stays on screen and is still being read, and every finding is visibly pulled out of one of its lines.
- **Content**: A source document (10–40 lines; 1–3 real evidence lines, en ≤ 64 chars, zh ≤ 28) and 2–3 findings, each a name (en ≤ 18, zh ≤ 7), an optional value and a caption (en ≤ 40, zh ≤ 16), paced to one narrated sentence each.
- **Fits**: `demo`, `proof`, `turn`. **Not for**: more than three findings; conclusions without a source line; a loud beat (no peak; the slow scroll keeps it alive).
- **Layout and camera**: locked camera. The page (doc-page, 1000 × 760) starts at x 216, y 160 and parks 0.06–0.24 of the shot: it slides left by 55 % of its width and shrinks to 0.92 about its left edge, leaving its right part (the ends of its lines) in view. Pills (688 × 136) are dealt at x 936 from y 276, 192 px apart; each caption sits 28 px under its pill. A soft light up right and a light vignette on the ground. Not a screen recording: the page is a parked source, never the subject; the camera does not move into it; the eye goes from a marked line along the connector to the pill and its caption, then the line clears.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `doc` | doc-page lines (`kind`, `text`?, `mark`?) | glance | 10–40 | 12 words / 64 chars a line | 28 chars a line | the sample document |
  | `findings` | list (`name`, `value`?, `caption`, `glyph`?) | primary | 2–3 | name 3 words / 18 chars, caption 7 words / 40 chars | name 7, caption 16 chars | the KPIs as names, deltas as values; `claim`, `titleLong`, `subtitle` as captions |

- **Length**: 11.6 beats (174 frames, 5.8 s at 120 BPM); range 10–14. Findings start at 0.26, 0.48, 0.70 of the shot (0.22 apart: one short narrated sentence).
- **Steps and events**: park 0.06–0.24 (in-out cubic); the page scrolls 0.7 px/frame throughout and brakes over the last fifth; per finding at f: the pill fades in over 0.035 and rises 56 px / scales 0.94 → 1 over 0.062 with a back-out; the connector draws f + 0.04 → 0.11 from the evidence line's end; the marker grows f + 0.06 → 0.13; the caption shows at f + 0.05, darkens word by word over 70 % of its time, turns back and clears before the next pill (the last clears at 0.98, leaving the three pills).
- **Needs**: prop `doc-page`; helpers `pathGeom`, `subPath` (path-flow), `GLYPHS` (hub-links); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: a soft `accent` on each pill (beats 2.9, 5.3, 7.7); the narration carries the rest.
- **Styles**: any with a page material; avoid strip and split. **Source**: adapted from video-shotcraft `demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal.tsx` (card `references/shots/ui-entrance/doc-park-left-pill-deal.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese captions darken character by character). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the launch-film brief and the three shot-recipe pills are the film's document and findings (sample copy and skeleton lines by default, neutral glyphs); the scroll brakes over the last fifth so the scene lands still (upstream scrolls to the cut); grain is dropped. Compare: pass (page edge and two pills, 0.1 px, RMSE 0.0001, events ±0).
- **Pitfalls**: Three findings at most; a fourth leaves no time for its caption to be read. The document must be longer than the whole scroll, or the page scrolls into blank space. Re-time the deal to the real captions; caption length sets how fast the word-by-word darkening reads.
- **Sample**: `poster.jpg`, an English still 480 px wide.

---
id: list-fill
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### list-fill

- **Purpose**: shows a list being filled for real: each row arrives into its own place and the page answers (the stack presses and a counter rolls on, or a waiting slot takes the row with a seam of light), so "we collected these" reads as weight, not as a list that was always there.
- **Intent**: Show a list being filled for real: each row arrives into its own place and the page answers with weight or a click, so 'we collected these' reads as earned, not as a list that was always there.
- **Content**: 3–5 rows, each a title (en ≤ 18 chars, zh ≤ 8), a meta line (en ≤ 16, zh ≤ 7), optional note (en ≤ 26, zh ≤ 11), value, delta or thumbnail; a title (en ≤ 24, zh ≤ 10), eyebrow, counter label and caption.
- **Fits**: `demo`, `proof`. **Not for**: reading the rows (each is legible only as it lands); more than five rows; a ranking; holding on the page as the main picture of a film.
- **Layout and camera**: a neutral page (eyebrow, title, rules; embed adds a nav strip, a subtitle and three KPI boxes) on the ground, the list at x 408–1512. `stack`: the camera starts close on the page head (zoom 1.35) and follows the stack down and out to the whole list (0.86) in one continuous curve, still for the last 6 frames; the counter (label, a 104 px odometer, a rule, a caption) is fixed in screen space at the top right. `embed`: the camera eases down and in (1.12 → 1.25) while rows rain into dashed slots. Not a screen recording: the page is only furniture and the rows are objects (a tilt, a press, a shadow that tightens as they come); use it as one short beat between wider shots, cut on the counter's last roll or the last seam, and do not follow it with another page shot.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `items` | list (`title`, `meta`, `note`?, `value`?, `delta`?, `image`?) | glance | 3–5 | title 3 words / 18 chars, meta 3 words / 16, note 4 words / 26 | title 8, meta 7, note 11 chars | the sample's cards and KPIs |
  | `title` | text | primary | 1 | 4 words / 24 chars | 10 chars | `title` (stack), `detailTitle` (embed) |
  | `eyebrow` | text | glance | 1 | 3 words / 24 chars | 10 chars | `eyebrow`, `detailEyebrow` |
  | `label` | text | glance | 1 | 3 words / 18 chars | 8 chars | `label` (the counter's head; embed: the list's head) |
  | `caption` | text | glance | 1 | 4 words / 24 chars | 10 chars | `caption` (under the counter) |

- **Length**: `stack` 5.9 beats for five cards (88 frames; 0.8 beat less per card fewer); `embed` 4.5 beats (68 frames). Range 4–7.
- **Steps and events**: stack: the counter brightens 0–6 (the anticipation); a card every 12 frames from 6, rising 600 px in 22 frames with a ±2° tilt that straightens and a 2 % overshoot; each later arrival presses the settled cards 6 px and lets them back over 8 frames; a marker grows under the card's note line 3 frames after landing and fades; the counter rolls one place per landing (8 frames); one glaze crosses the stack after the last card. Embed: rows at 12, 22, 31, 39, 46 (the rain speeds up), each falling 120 px in 12 frames with a 16° tilt that flattens, pressed 0.995 → 1 on landing; a 2 px accent seam spreads from the centre over 5 frames and fades by 8.
- **Needs**: prop `tile-card` (its `figure`); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: a soft `accent` per landing (stack: on each counter roll; embed: on each seam); nothing louder, the motion is the rhythm.
- **Styles**: any with a page or panel material; avoid strip and split. **Source**: adapted from video-shotcraft `demos/ui-entrance/list-stack-press/ListStackPress.tsx` (card `references/shots/ui-entrance/list-stack-press.md`) and `demos/ui-entrance/row-embed/RowEmbed.tsx` (card `references/shots/ui-entrance/row-embed.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, `sample/poster-embed-en.jpg` (and zh).
- **Differs from upstream**: the page screenshots and paper crops are a neutral page and rows painted from the film's items (the rows stay drawn after landing instead of revealing the screenshot); the stack's flying cards are smeared along their path by the brick itself (six taps), the embed rows use the runtime blur; grain is dropped, the vignette kept. Compare: stack pass (3 cards, 3.4 px, RMSE 0.0004, events ±0); embed (dry run, 3 rows in flight) 0.9 px, events ±0.
- **Pitfalls**: Keep the list straight-on; a tilted stylised camera makes rows unreadable. The anticipation press must be visible without stepping frame by frame; too small and it is not felt. Rows must land into real slots of the page; rows that hover above it look fake. Keep the light seam inside the row's rounded corners; light spilling past them looks cheap.
- **Sample**: `poster.jpg`, an English still 480 px wide.

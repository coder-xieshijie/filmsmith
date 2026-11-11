---
id: hero-spotlight
category: scene
energy: mid
surface: ["dom"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### hero-spotlight

- **Purpose**: makes one object the protagonist: of everything on the page, this card; it lifts, is inspected, and belongs back in its page.
- **Intent**: Make one object the protagonist of the film: of everything on the page, this card; the lamp chooses it, the lift gives it weight, the running light inspects it, and the reseat says it belongs to the page.
- **Content**: A light page with a grid of comparable cards (tile-card faces or the film's page image) and one hero card (or image); an optional two-line note (each en ≤ 16 chars, zh ≤ 7).
- **Fits**: `hook` (a "one hero" product opening: one card, item or module as the film's subject), `demo`. **Not for**: pages without a grid of comparable items (the lamp needs something to choose from); more than one hero; fast cutting (it is the slowest, most textured shot, 5.75 s); dark pages (the pool reads by showing a light page in a dark room).
- **Layout and camera**: a product page (header, five section labels, ten cards in a three-column grid; the hero is the second card of the second row, its centre at the page's centre line) seen through a 3D camera (perspective 1200). Frames: the page sits in the dark at about 14 %, the lamp pushes on (light, flash back to 62 %, steady, 1–6); its pool, a soft-edged warm ellipse with a beam falling from the upper right with dust in it, searches three stations with short stops (4–28) and locks on the hero with a 6 % pulse (34); the camera pushes from the whole page at 0.8× to a low side close-up at 2.6× (rotateY 34°, rotateX 8°, rotateZ 2°) and then stays locked (40–58), while the round pool hands over to a card-shaped soft hole in a page-space dark, so the card is lit edge to edge and the page falls away around it; the card lifts 110 px with an overshoot (56–66), hovers with a 4 px bob (period 40 frames), its shadow falling to the lower left, a warm light on its upper right, a patch with an accent edge in the slot it left; a light runs round its edge twice, fast and bright (68–82), then slower and fainter (88–108); a two-line note rises out of a blur at its left (70–84), a highlighter grows behind the second line (84–96); card and note settle back into the page (124–142) with a slight press and a ring of light; hold to 172 with the dark breathing.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `line1` | text | primary | 0–1 | 3 words, 16 chars | 7 | the sample detail title |
  | `line2` | text | primary, claim | 0–1 | 3 words, 16 chars | 7 | the sample label (on the highlighter) |
  | `hero` | image | — | 0–1 | — | — | a tile-card face |
  | `page` | image | — | 0–1 | — | — | a page of tile cards |

  The note is right-aligned to end short of the card's left edge, 34 px (zh 36) in the page, about 90 px on screen after the push.
- **Length**: 11.5 beats (5.75 s at 120 BPM), fixed.
- **Steps and events**: T1 the lock (`accent`); T2 the push and the lift (`turn` at the lift); the hover, laps and note as one held moment; T1 the reseat (`land`), then a marked pause on the complete poster.
- **Needs**: `tile-card` faces (`drawCard`); roles `ground` (the dark), `panel`, `ink`, `dim`, `line`, `accent` (the laps, the slot's edge, the highlighter), `onAccent`; type `display`, `text`.
- **Sound**: a lamp switching on, a low room tone through the search, a soft lock click (`accent`), a rising air under the push and lift, two sweeps for the laps, `land` on the reseat.
- **Styles**: light palettes (a light page in a dark room, as the upstream); not plakat or ink. **Source**: adapted from video-shotcraft `demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx` (card `references/shots/opening/spotlight-hero-card.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`.
- **Differs from upstream**: the page is drawn from tile-card faces (or the film's `page` image) in place of a screenshot, and the hero card likewise (`hero`); the champagne light is the accent and the tungsten lamp is white warmed by it; the note's words are slots and the highlighted line turns `onAccent`; film grain left out. Compare against `spotlight-hero-card` (window 0–172.5): the card's place on screen through the push, lift and reseat matches within 28.2 px (a 3D bounding-box centre against the projected centre), events ±0; SSIM drop waived (the upstream's card and page are a screenshot).
- **Pitfalls**: Open on one hero with the whole arc; a group of cards dancing does not carry a first impression. Light effects go to the hero only; a glint on every card was rejected twice. Text on the card blurs in the push-in unless the face is rasterised at high resolution. End the note's dark backing short of the card's left edge, or it presses a dark wedge onto the card.
- **Sample**: `poster.jpg`, an English still 480 px wide.

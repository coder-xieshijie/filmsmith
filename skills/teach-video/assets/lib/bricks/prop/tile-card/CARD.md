---
id: tile-card
category: prop
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### tile-card

- **Structure**: three layouts. `cover` (320 × 440): a cover inset 12 px taking 58 % of the height, then a label (mono, info size), a title (display, up to two lines) and a foot. `stat` (340 × 460): a label with a status dot, a figure of 33 % height, a big number and its label. `note` (640 × 250, any size): a dark face with a side bar, a title of up to two lines, a byline and three skeleton lines (`body` fades the byline and skeleton). `parts`: cover, label, title, foot, value, bar.
- **Intent**: Give a set of things one shared face, so the viewer reads 'a collection of the same kind' and can still tell each member apart by its cover, figure or title.
- **Content**: Per card a title (en ≤ 16 chars, zh ≤ 7), a label (same limits), an optional number (≤ 6 chars) and foot (en ≤ 18, zh ≤ 8), and an image or a neutral figure; layouts cover, stat or note.
- **States**: `rest`, `lit` (accent rim, figure and label turn to the accent, lifts 14 px in the sample), `dim` (a ground veil, depth); scenes interpolate `lit`, `dim` and the lift themselves (card-pile: lift and ring; ring-gallery: lit at the front, dim by azimuth).
- **Sizes**: S 240 × 330, M 320 × 440, L 420 × 578 (cover); every layout scales from its own size; `ts` scales the text when the card is shown smaller than 1:1 so its info text stays at the language's floor on screen.
- **Swap points**: `title` (glance, en 3 words / 16 chars, zh 7 chars), `meta` (label, same limits), `value` (number, 6 chars), `foot` (en 18 chars, zh 8), `image` (the film's picture, cropped to cover the cover box; never recoloured), `figure` (`bars`, `line`, `rings`, `gantt`, `grid`, `dots`, `wave`, `blocks`: the neutral placeholder when there is no image).
- **Parameters** and **Roles**: `drawCard(ctx, item, w, h, P, { layout, lit, dim, featured, index, radius, body, ts })`, `cardShadow(ctx, w, h, elevation, colors)`, `faceCanvas(...)` (a cached face for scenes that move many cards: a software canvas, so every draw resamples the same way), `cardItems(lang, n)`. Roles: `panel` (face), `ink` (title, the note face), `dim` (label, foot), `line` (edge, figures), `ground` (veils), `accent` (lit and featured only).
- **Styles**: any. **Source**: adapted from video-shotcraft `demos/ui-entrance/card-stack/CardStack.tsx` (card `references/shots/ui-entrance/card-stack.md`) and `demos/ui-entrance/carousel-3d/Carousel3D.tsx` (card `references/shots/ui-entrance/carousel-3d.md`) @ `1266a3e`; the `note` layout from `research-card-stack-scroll`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full. **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg` (the three layouts; the middle card walks rest → lit → dim → rest → lit). Compare: waived (a prop has no motion of its own; its moves are checked in the scenes that use it).
- **Pitfalls**: Leave one card as the lead (lit or featured); a set of equal cards has no subject. Pictures are cropped to cover, never recoloured; when a scene shows a card's back, give both faces the same content.
- **Sample**: `poster.jpg`, an English still 480 px wide.

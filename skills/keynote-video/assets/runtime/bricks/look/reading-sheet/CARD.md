---
id: reading-sheet
category: look
langs: {"en":"full","zh":"adapted"}
licence: MIT
status: approved
---

### reading-sheet

- **Looks like**: a long real web page hanging as one paper sheet in a still window over near-black, flicked up section by section; warm paper bands pasted across it repeat its lines in large type; an ochre pencil underline marks the line being read; a minimap of the whole sheet in the right gutter; a paper roll at the top and at the end.
- **Intent**: The product's own page is the film: read top to bottom like a long-form story, so every claim is the page's own words.
- **Fits / does not fit**: a README, docs or changelog that tells the story in order, 20–60 s. Not: several unrelated artefacts, app screens, image-only pages, pages with people.
- **Palette presets**:

  | id | name | ground | stock (paper) · onPaper · paperMuted | panel · onPanel · dim | line | accent | ink/ground |
  |---|---|---|---|---|---|---|---|
  | `slate` | Slate, ochre mark | #0E0F11 | #F3F0E8 · #17181B · #55575C | #141518 · #F1EFEA · #A9ABB0 | #C9CDD3 | #8F7719 | 16.69 |
  | `slate-violet` | Slate, violet mark | #0E0F11 | same | same | #C9CDD3 | #9B4DCA | 16.69 |
  | `linen` | Linen, ochre mark (dark pages) | #ECEAE4 | #17181B · #F1EFEA · #A9ABB0 | same | #3A3D44 | #8F7719 | 14.76 |

  Roles: ground; paper (the bands' stock) with onPaper and paperMuted; panel with onPanel and dim; ink (type straight on the ground); line (the hairline under a pinned tab); accent; roll, rollHi, rollShade, rollEdge (#E4E0D7, #F6F3EC, #B5B0A6, #7E7A72 in every preset). Pick the preset by the accent rule: ΔE00 ≥ 20 from every chromatic colour in the regions it marks.
- **Type**: Schibsted Grotesk VF (700 the hook and the name, 600 quotes, the slot, the claim); DM Mono 500 (the address, the panel label); zh stack adds Noto Sans SC. Licences OFL-1.1.
- **Type scale**: 25 × 1.4ⁿ: 25 · 35 · 49 · 69 · 96 · 134 (Chinese from its 28 floor); floors info 25 (zh 28), main 49.
- **Tracking, case, italic, leading**: display −0.01 em, otherwise 0; no capitals, no italic; leading 1.25 (zh 1.4).
- **Grid and frame**: the sheet column x 120–1616 from y 54 (bleeding off the foot), 0.8 film px per image px in the example; the minimap at x 1664–1824 from y 120; a locked viewport: everything that changes is the sheet's offset; quote bands span the sheet (hook 320 px, quotes 250), text inset 96 px; the unfold panel 792 px (an 88 px caption strip, 1216 × 684 frames).
- **Camera**: locked (motion is the sheet's offset: detent, reel, ratchet, fling).
- **Texture and light**: grain 4 % on the ground only (captures are never textured); the roll is the only object with volume.
- **Source**: own (the source film, `references/modes/scroll.md`), split from the scroll style of keynote-video. **Licence**: MIT; fonts OFL-1.1.
- **Languages**: en full · zh adapted: quotes in Noto Sans SC at the same sizes; the capture stays in its own language.
- **Sample**: `poster.jpg`, an English still 480 px wide.

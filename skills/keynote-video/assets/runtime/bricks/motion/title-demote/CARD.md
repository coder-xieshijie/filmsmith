---
id: title-demote
category: motion
tier: T1
family: zoom-depth
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### title-demote

- **Looks**: a large section title sits alone in the middle; it shrinks and slides up to the top-left corner, becoming the page's small label (an "01 /" number wiping in before it) while the section's content grows in under it block by block: a hairline, a sentence, three cards.
- **Tier**: T1. **Family**: zoom-depth. **Surface**: canvas.
- **Use**: opening a chapter: the title is the subject for a beat, then becomes the signpost of the content that grows under it; a menu item becoming the heading of what it opens (`select`). **Not for**: a title that should stay the figure; sections without content to grow (it then reads as a title shrinking for nothing); titles over about three words (at 0.3× a long one is a grey line); styles that never rescale type; pages without a top-left label slot.
- **Intent**: The title steps down instead of leaving, so the viewer keeps a free spatial memory: the big word from a moment ago is the small label up there, and this section is about it.
- **Content**: A section title of up to three words (≤ 20 chars), an optional number ("01") and eyebrow, and the section content to grow under it (blocks in reading order).
- **Parameters**: `from` the title alone, `to` the page with the title as its label. `text` (default the sample detail title; sample en `"Weekly review"`, zh `"每周回顾"`), `eyebrow` (default the sample eyebrow, fades out), `number` `'01'` (wiped in as "01 /" before the label), `size` (en 220, zh 200), `weight` 800, `y` 520, `select` false (true: a highlight sweeps the title first, as if chosen from a menu), `to` (the section's painter or scene description; null = the neutral section: hairline, sentence, three cards), `blocks` (the section's rects in reading order, each grown by clip, rise and fade with its own delay), `probes` false (comparison points added to `track()`). Roles read: `ink`, `dim`, `line`, `panel`, `accent` (number, highlight).
- **Theory**: the title keeps its identity as it becomes the label, so the viewer knows where they are (object constancy and spatial memory); content growing from the label down follows reading order.
- **Styles**: any with a top-left label (most); avoid it in strip and split.
- **Length and easing**: 4 beats, 3.5–6.5. Demote 26 f cubic-bezier(.6, 0, .18, 1); blocks grow 12 f each, staggered by their own delays (8–24 f); `select` sweep 10 f, stay 10 f, back 8 f.
- **Sound**: `turn` at the demote, `land` when the label settles.
- **Source**: adapted from video-shotcraft `demos/typography/title-demote-to-label/TitleDemoteToLabel.tsx` (card `references/shots/typography/title-demote-to-label.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: the Chinese title is set without tracking or case; the eyebrow is a phrase, not capitals.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the page content is the neutral section painter (hairline, sentence, three cards) instead of the demo page; no brand or backdrop. Compare (`demote`): pass (demote progress 0 px, events 0; SSIM drop 0.056).
- **Pitfalls**: Nothing else may move on the title's path; a popup or pointer entering on the same frame steals the eye. Used in several sections, the new label replaces the old one; stacked labels make the corner a graveyard. The select highlight says "this text can be selected": use it only for editing or document products.

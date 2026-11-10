---
id: write-on
category: motion
tier: T1
family: mask-type
energy: low
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### write-on

- **Looks**: a page writes itself: its blocks (eyebrow, headline, chart, three tiles) are uncovered left to right two at a time on the beat, a thin accent nib with a glow riding the front of the newest one; there is never more than one nib.
- **Tier**: T1. **Family**: mask-type. **Surface**: canvas.
- **Use**: the first appearance of a document, report or dashboard page, the densest page of a film, uncovered in reading order at the pace it can be read. **Not for**: a page already seen; pages with little text (it reads as a slow wipe) or blocks not in reading order; real screenshots shown as evidence (uncover them whole); a camera move at the same time unless a camera brick runs over it.
- **Intent**: A static page becomes a document being written, so the viewer reads along at the pace it appears and believes the document is real.
- **Content**: One full page (a document, report or dashboard) with 4–20 blocks in reading order; real, publication-grade copy.
- **Parameters**: `from` the blank page (the page's chrome and ground, content covered), `to` the full page. `to` (the page's painter or scene description, default the neutral page), `blocks` (its rects in reading order, default the six of the neutral page), `cover` `'panel'` (the role that covers), `pair` 2 (blocks per step), `every` 4.4 f, `dur` 9 f, `lead` 4 f, `nib` true, `probes` false. Roles read: `panel` (cover), `accent` (nib).
- **Theory**: writing order is reading order: uncovering the page in the order it is read lets the viewer read along at the pace it is shown (progressive disclosure); one nib keeps one point of attention.
- **Styles**: any with pages (dossier, exhibit, scroll suit it).
- **Length and easing**: 3 beats for six blocks, 2–6 from the number of blocks; each cover shrinks toward its right edge in 9 f, cubic-bezier(.4, 0, .6, 1). No motion blur (hard fronts that jump between blocks).
- **Sound**: `tick` per step (a pen on paper, quiet).
- **Source**: adapted from video-shotcraft `demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx` (card `references/shots/typography/document-typewriter-reveal.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (no text of its own; the page painter sets its words per language).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the screenshot texture, history entries, slogan, floating window and backdrop are gone: the page is the next scene's painter; the camera pull-back is left to a camera brick (`tilt-camera`, `viewport-push`) run over this one. The reveal curve is upstream's cubic-bezier(.4, 0, .6, 1). Compare (20 blocks, `lead` 8 as upstream): waived on `eventFrames` only: the tracked sum of ten overlapping pairs has a speed plateau (14.6 against 14.7 px/f), so its peak frame is arbitrary (45 against 49); track 5.5 px, progress RMSE 0.003.
- **Pitfalls**: The page must look published: native layout, filled with text; a token page with a slogan sinks the shot. No real customer or member names in the mock content. One nib at a time; two writing fronts split the eye.

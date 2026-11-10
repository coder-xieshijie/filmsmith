---
id: word-to-chip
category: motion
tier: T1
family: edit-cut
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### word-to-chip

- **Looks**: A typed tag becomes a thing: in one frame the word and its caret are replaced by a wide chip of the same type size with a tag glyph where the `#` was (it settles 1.03 → 1); it holds, then shrinks and slides on one curve into its slot on a page; a second hard cut reveals the finished page around it, the chip recoloured. Two cuts around one glide.
- **Tier**: T1. **Family**: edit-cut. **Surface**: canvas.
- **Use**: text that turns into structure: a tag, a mention, a keyword or a command becoming an object the product understands. **Not for**: long phrases (over about 14 characters the chip stops reading as a token); a slow, gentle passage (the cuts are hard).
- **Intent**: Text becomes a thing the product understands: a hard cut gives a sure "done", and the one glide between two cuts makes it feel quick and certain.
- **Content**: One tag, mention, keyword or command (≤ 14 chars), the finished page it lands on and its slot there.
- **Parameters**: `word` (the tag text, default a card title from the sample copy), `from` (what is behind the word, null: the ground), `to` (the finished page, default `note`), `slot` [361, 473] (where the chip lands), `scale` 0.554 (its size on the page), `typing` false (type the word first, 4–6 frames a character, seeded), `seed` 7. Roles read: `ground`, `ink` (the chip's grey is ink on the ground), `accent` (the caret and the recoloured chip), `panel`.
- **Theory**: A hard cut reads as a change of state and a glide as the same object moving; framing one continuous move between two cuts makes it read quick and sure (the upstream's rhythm, measured frame by frame).
- **Styles**: any; suits flat, editorial interfaces.
- **Length and easing**: 3 beats (morph at frame 6, move 24–38 on bezier .5 0 .25 1, reveal at 41), 3–6 with typing.
- **Sound**: `stamp` on the first cut, `land` on the reveal.
- **Source**: adapted from video-shotcraft `demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx` (card `references/shots/interaction/hashtag-to-pill-materialize.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full (the chip widens to fit; Chinese types a character a step).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the clapperboard glyph is a neutral tag glyph; the page's copy and the system font are the film's text and type roles; the chip widens for a longer word. Compare against `hashtag-to-pill-materialize`: pass, 0 px, events ±0.
- **Pitfalls**: The change to a chip is a one-frame hard cut; if you want a morph or a fade, use another brick, not a softened version of this one. Do not add a flight or bounce: two cuts around one glide is the whole rhythm.

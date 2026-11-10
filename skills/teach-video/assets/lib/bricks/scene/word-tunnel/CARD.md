---
id: word-tunnel
category: scene
energy: high
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### word-tunnel

- **Purpose**: says "a lot of things, all here" without asking the viewer to read them: the product's nouns fly out of the depth past the camera behind one still title.
- **Intent**: Say 'a lot of things, all here' without asking anyone to read them: the product's nouns stream out of the depth past the camera, so the viewer reads three or five at a time but feels there are many, behind one still title.
- **Content**: 12–28 short keywords of similar length (en ≤ 18 chars, zh ≤ 6), a few marked for the accent, an optional still title (en ≤ 32, zh ≤ 14) and eyebrow (en ≤ 24, zh ≤ 10).
- **Fits**: `hook`, `rest`, `lockup`. **Not for**: words that must each be read; calm, editorial films (dossier): the flow never stops; light grounds (the glow and the veil want a dark ground).
- **Layout and camera**: a hand-computed perspective tunnel on the frame centre (focal 4400, depth −7000 → 3200): ten faint accent rings push toward the camera, 56 dust streaks, a breathing glow at the far end; words placed on a golden-angle spiral (radius 330–990 px, y × 0.6), each flying from far to near over its life with opacity [0, 1, 0.5, 0.2, 0] and a drift outward; far words fogged, the nearest blurred with a short trail; the whole tunnel rolls ±2.5°. The title (and an eyebrow) sit still in the centre on a dark veil, words passing behind it are faded. No camera beyond the tunnel itself. A seamless loop: p = 0 and p = 1 are the same frame, two laps per loop.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `words` | list of text | glance | 12–28 | 3 words, 18 chars each | 6 chars each | sixteen neutral product nouns per language |
  | `title` | text, optional | primary | 0–1 | 6 words, 32 chars | 14 chars | `Every render, checked` / `每一次渲染都检查过` |
  | `eyebrow` | text, optional | glance | 0–1 | 24 chars | 10 chars | `WORKSPACE` / `工作台` |

  Options: `accents` (indexes of words drawn in the accent, default [2, 6, 11, 14]), `light` (indexes drawn at weight 400), `cycles` 2 (laps per loop), `seed`, `beats` 12.
- **Length**: 8–16 beats (4–8 s at 120 BPM), 12 by default; any length loops (`plan().loop` true).
- **Steps and events**: none: a background layer, constant motion, no T0–T3 step; the title is static.
- **Needs**: no motions or props; roles `ground`, `ink` (words, dust, title), `dim`, `accent` (rings, glow, accented words, eyebrow); type roles `display`, `mono`.
- **Sound**: none of its own (a pad or riser under it).
- **Styles**: high-energy looks with dark grounds (pulse, phosphor, plakat); avoid dossier.
- **Source**: adapted from video-shotcraft `demos/typography/flying-words/FlyingWords.tsx` (card `references/shots/typography/flying-words.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: Chinese words are 2–5 character phrases; the upstream serif italic words become a lighter weight in both languages.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: no brand mark, capability words or backdrop; the serif italic subset is a 400 weight; placement is seeded (`rng.js`) instead of `sin` noise, so the positions differ from upstream by design. Compare (22 words as upstream): pass on the first word's projection scale over its life (0 px, events 0); SSIM mean 0.60 is the placement and the absent backdrop.
- **Pitfalls**: Keep the word count and word length close to the defaults; density scales with the count, and Chinese words need a smaller size or near words fill the frame. Laps per loop must be a whole number, or the loop does not join. It is a background layer; turning the words up to full brightness as the subject reads as clutter.

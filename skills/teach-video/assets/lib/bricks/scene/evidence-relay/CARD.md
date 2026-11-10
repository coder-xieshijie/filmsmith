---
id: evidence-relay
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### evidence-relay

- **Purpose**: one subject, several capabilities, each shown with the page that proves it: a column of page cards steps to the next card only when the verb changes.
- **Intent**: Pair each claim with its proof: the verb on the right is the argument, the page card on the left is the evidence, and the column steps only when the word changes, so text and picture footnote each other.
- **Content**: One noun (en ≤ 10 chars, zh ≤ 4), 2–4 one-word verbs (en ≤ 9, zh ≤ 3) with optional notes (en ≤ 44, zh ≤ 20), and 4–8 page cards (real screenshots, the verbs plus at least two; card k + 1 proves verb k).
- **Fits**: `demo`, `proof`. **Not for**: capabilities with no page to show; more than four verbs; light grounds (the alternating cards want a dark ground).
- **Layout and camera**: two columns. Left: page cards 940 × 530 at x 100, 105 px apart, alternating palette and paper, the card in focus centred on y 540, its neighbours dimmed (0.68 × distance), scaled to 0.94 and blurred up to 3 px; each card is a scene painter drawn at 0.49 scale. Right, from x 1196: a mono counter `01 / 03`, the noun (weight 560, ink mixed toward the ground), the verb under it (weight 760, ink) in a masked line, its final stop in the accent; under the block a note in the text face. An accent lead line with a glowing dot joins the focus card's right edge to the block's centre line at y 540. The two lines of the block (1.1 × size each) are centred exactly on y 540, the centre of the card in focus. Camera: a slow push 1 → 1.02 over the scene.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `noun` | text | primary | 1 | 1 word, 10 chars | 4 chars | the sample product name |
  | `verbs` | list of text | primary | 2–4 | 1 word, 9 chars each | 3 chars each | `plans, renders, ships` / `规划、渲染、发布` |
  | `notes` | list of text, optional | info | 2–4 | 8 words, 44 chars each | 20 chars each | one neutral line per verb |
  | `cards` | list of scenes | — | 4–8 (verbs + 2 or more) | — | — | bars, page, grid, detail, title, grid |

  Card k + 1 is the evidence for verb k; card 0 opens. Options: `stop` (en `.`, zh `。`), `size` (en 140, zh 128), `counter` true, `lineTo` true, `push` 0.02, `cues` (the change frames in beats; null = 16 f then every 49 f), `probes` false (comparison points).
- **Length**: 9–18 beats (4.5–9 s at 120 BPM): 16 f lead, 49 f per verb, 66 f after the last change; 12 beats for three verbs.
- **Steps and events**: one T0 change per verb (at 16 f, then every 49 f; `plan().cues`): the column steps one card in 18 f `EASE.swift` (still otherwise), the old verb greys over 10 f and rises out in 8 f `EASE.exit`, the new one rises in 7 f after the change, per letter (Chinese per character), 16 f each `EASE.snappy`, 1.2 f apart (Chinese 2 f); the lead line withdraws in 6 f and redraws after 10 f over 16 f; the note follows 6 f after the verb. No peak, no pause hold.
- **Needs**: no motions or props (cards are scene painters from `sample.js` or the film); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`, `paper`, `onPaper`; type roles `display`, `text`, `mono`.
- **Sound**: `cut` at each step (a mechanical click), `tick` as the new verb lands.
- **Styles**: dark editorial and product looks (exhibit, dossier, trace).
- **Source**: adapted from video-shotcraft `demos/typography/word-relay-filmstrip/WordRelayFilmstrip.tsx` (card `references/shots/typography/word-relay-filmstrip.md`) @ `1266a3e`.
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: Chinese verbs are 2–3 characters, rising per character, slower, and end on a Chinese full stop 「。」 in the accent (headline style); the notes are Chinese sentences at the info size. The page cards' words are texture at 0.49 scale (under the info floor by design, like upstream).
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: the hand-made demo pages are replaced by the neutral sample scenes; the serif italic verb is the display face at full weight; brand noun and notes are slots. Compare (with upstream's change frames passed as `cues`): pass (verb letter and lead line 0 px, events 0; SSIM drop 0.080 during the steps, the cards' content gap).
- **Pitfalls**: The column must stand still between words and step only on the change; a constant scroll turns the evidence into wallpaper. Align the word block's centre exactly with the focused card's middle; a few pixels off and the editorial rigour collapses. Use real screenshots and grade their brightness by hand so the alternating cards stay readable.

---
id: slot-sentence
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### slot-sentence

- **Purpose**: says "all of these, one at a time" as one sentence: the stem holds still while a slot in it cycles through words on the beat, then the sentence lands.
- **Intent**: A promise and its proofs in one line: the stem stays put and only the slot changes, so a list reads as one sentence and ends as a conclusion.
- **Content**: A stem (≤ 18 chars, Chinese ≤ 6 characters), 3–6 items of 1–2 words (≤ 14 chars, Chinese ≤ 4 characters, lengths within 2× of each other), an optional tail; `bracket`: a picture per item.
- **Fits**: `demo`, `proof`, `claim`. **Not for**: items that need reading time each (over two words or four Chinese characters); lists without a common stem; more than six items.
- **Layout and camera**: one line on the vertical centre (`y` 540), no camera. `roll` (default): the stem pinned at the left margin (`margin` 300), a white pill after it holding the word, rolled like a slot machine (out up, in from below with a blur); after the last word the pill dissolves, the word turns to the accent and the line centres. `chip`: the line centred; a dark chip in the middle whose width follows each word and pushes the words beside it; the words roll inside it, ghosts of the neighbours at 13 % above and below. `wheel`: the slot is a drum of words, neighbours dimmed, blurred and squashed by their distance; each step fast then very slow with a slight overshoot; the centre word turns to the accent as it settles. `converge`: the stem pinned at the left margin, the slot word's right edge at the right margin, hard cuts between words with a one-frame flash; after the last the two halves close together into one centred phrase, the tail as a small line under it. `bracket`: the line centred around a fixed square slot (it never reflows); the slot holds pictures (`images`, painters `(ctx, w, h)`; default icons on grey discs) framed by four accent corner brackets that close in from outside and swell 7 % at each change; the pictures queue vertically and step in on a spring, the neighbours smaller, fainter and blurred by distance; a dark label chip under the slot rolls the item words with the queue; stem and tail rise in, staggered.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `stem` | text | primary | 1 | 3 words, 18 chars | 6 chars | `Every` / `每一次` |
  | `items` | list of text | word | 3–6 | 2 words, 14 chars each | 4 chars each | `draft, review, render, release` / `起稿、审阅、渲染、发布` |
  | `tail` | text, optional | primary | 0–1 | 3 words, 18 chars | 6 chars | `is checked` / `都检查过` |

- **Length**: 4–14 beats (2–7 s at 120 BPM); each item adds 21 f (`roll`), 30 f (`chip`, `wheel`), 34 f (`bracket`, a 22-frame spring each) or 12 f (`converge`); `roll` adds 40 f of landing, `converge` 70 f of closing.
- **Steps and events**: T0 changes only: each new word is one (`plan().cues`, one per item); the landing (`roll`, `converge`) is the last, a T1 composition; no pause hold.
- **Needs**: no motions or props; roles `ground`, `panel` (pill), `ink`, `dim` (ghosts, wheel neighbours, converge stem), `line` (pill rim), `accent` (the landed word; `bracket`: the corners and the label's dot); type role `display` (`bracket`'s label: `text`, 10/34 of `size`, 30 px at the default 104).
- **Sound**: `tick` per word change (`roll`, `chip`, `wheel`), `cut` per hard cut (`converge`), `land` at the landing.
- **Styles**: any; `converge` suits dark editorial looks (dossier, exhibit).
- **Source**: adapted from video-shotcraft `demos/typography/pill-slot-cycle/PillSlotCycle.tsx` (card `references/shots/typography/pill-slot-cycle.md`), `demos/typography/pill-chip-slot-cycle-handled/PillChipSlotCycleHandled.tsx` (card `references/shots/typography/pill-chip-slot-cycle-handled.md`), `demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle.tsx` (card `references/shots/typography/vertical-word-roll-blur-cycle.md`) and `demos/typography/text-column-converge/TextColumnConverge.tsx` (card `references/shots/typography/text-column-converge.md`) @ `1266a3e`; `bracket` from `demos/ui-entrance/avatar-bracket-carousel/AvatarBracketCarousel.tsx` (card `references/shots/ui-entrance/avatar-bracket-carousel.md`).
- **Licence**: Apache-2.0, see NOTICE.
- **Languages**: en full · zh full: slot widths come from the measured words in either language; Chinese has no space between stem and slot (a 0.18 em gap instead); the items are short Chinese words, never single characters.
- **Sample**: `poster.jpg`, an English still 480 px wide.
- **Differs from upstream**: one brick for four demos on one stem–slot–tail layout; brand words, icons, demo copy and backdrops removed; pure state per frame instead of React state and measuring after mount; `wheel` drops the tail by default (as upstream). Compare (`roll`, against `pill-slot-cycle`, from upstream frame 21 after its first pill's entry): pass (incoming pill 0 px, progress RMSE 0, events 0); the finale differs by design (upstream swaps the pill for a closing phrase; here the last word lands in the accent). `chip`, `wheel`, `converge` are not compared.
- **Pitfalls**: The stem must not move a pixel; any wobble loses the list. Keep items within 2× of each other's length, or the slot jumps and the sentence swings. One slot style per film; the closing words take the stem's size and weight, or they read as a new title.

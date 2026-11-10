---
id: card-pile
category: scene
energy: mid
surface: ["canvas"]
langs: {"en":"full","zh":"full"}
licence: Apache-2.0
status: approved
---

### card-pile

- **Purpose**: tells the viewer "there is a set of these" in one image, and either picks one out of it (fan) or shows how many pass through (stream).
- **Intent**: Say 'there is a whole set of these' in one image: the pile gives weight (how many), then either the fan shows they differ and picks one, or the stream shows a steady throughput being read.
- **Content**: 5–13 cards (odd for the fan), each a title and a label (en ≤ 16 chars, zh ≤ 7) with an image or figure; a title (en ≤ 30, zh ≤ 13), optional subtitle (en ≤ 48, zh ≤ 22) and eyebrow (en ≤ 24, zh ≤ 10).
- **Fits**: `hook`, `demo`, `proof`. **Not for**: reading the cards (only the drawn card, or the newest, is legible); fewer than five items; a set whose members must be compared side by side.
- **Layout and camera**: `fan`: the pile sits low in the middle (card centre at 960, 610), the eyebrow and an `NN / NN` counter at the top corners, the title and subtitle above the pile. The camera creeps in 1 → 1.06 while the pile builds, pulls out to 0.88 as it fans and creeps 1.7 % in the hold. `stream`: large note cards on a ruled ground; each new card lands at the centre and the older ones step down-right, blurring and dimming by depth; the rules scroll as the speed reference; locked camera. Not a screen recording: the cards are objects with weight (springs, a press per landing, a contact shadow that widens with the fan); keep the cards' copy short and let the motion of the set carry the beat.
- **Slots**:

  | Slot | Type | Tier | Count | en limit | zh limit | Default |
  |---|---|---|---|---|---|---|
  | `cards` | list of tile-card items (`title`, `meta`, `image`?, `figure`) | glance | 5–13 (fan odd) | 3 words / 16 chars each | 7 chars each | the sample's six cards, repeated |
  | `title` | text | primary, claim | 1 | 6 words / 30 chars | 13 chars | `claim` |
  | `subtitle` | text | glance | 1 | 8 words / 48 chars | 22 chars | `subtitle` |
  | `eyebrow` | text | glance | 1 | 3 words / 24 chars | 10 chars | `eyebrow` |

- **Length**: `fan` 10 beats (5 s at 120 BPM), `stream` 9.6 beats (4.8 s); range 8–12. More cards do not lengthen fan (the drops accelerate into the same 40 frames); stream adds 0.8 beat per extra card.
- **Steps and events**: fan: drops 2–42 (T0 each, accelerating, 5 px press per landing); squeeze 62–72; the fan 68–100 (T1, spring with one overshoot); the drawn card lifts 72 px 102–120 with an accent ring and one sheen (T2 peak); the title rises word by word from 106, the subtitle from 116; hold 122–150. Stream: one card every 12 frames (T0), brake over the last 20 frames, hold still.
- **Needs**: props `tile-card`; helpers from `stagger-in` (`springAt`, `riseText`); roles `ground`, `panel`, `ink`, `dim`, `line`, `accent`; type `display`, `text`, `mono`.
- **Sound**: fan: `accent` on the first and last drops, `turn` as the fan opens (beat 4.5), `land` on the drawn card (beat 6.8). Stream: a soft `accent` every second card at most.
- **Styles**: any with cards; avoid locked-material styles (strip, scroll). **Source**: adapted from video-shotcraft `demos/ui-entrance/card-stack/CardStack.tsx` (card `references/shots/ui-entrance/card-stack.md`) and `demos/ui-entrance/research-card-stack-scroll/ResearchCardStackScroll.tsx` (card `references/shots/ui-entrance/research-card-stack-scroll.md`) @ `1266a3e`. **Licence**: Apache-2.0, see NOTICE. **Languages**: en full · zh full (Chinese titles rise character by character, the stagger capped at 18 frames; card text is set 1/0.88 larger so it stays at the floor after the pull-out). **Sample**: `sample/poster-en.jpg`, `sample/poster-zh.jpg`, `sample/poster-stream-en.jpg` (and zh).
- **Differs from upstream**: the cards are tile-card faces from the film's items (no shot names, mark or avatars); the per-card vertical blur is the runtime motion blur from the tracked card centres; stream brakes to a stop over its last 20 frames (upstream ends mid-flow), so its comparison stops at frame 124. Compare: fan pass (3 cards, 8.5 px, RMSE 0.002, events ±1); stream (dry run, frames 0–124) 9.7 px, events ±2.
- **Pitfalls**: More cards or a wider stagger push the landing into the fan, so cards turn while still flying; move the fan later when adding cards. Use an odd count for the fan; with an even count there is no centre card to draw. Keep one card as the lead in the real material; a fan of equals has no answer. In stream, more cards than the length allows leave the last ones mid-flight; ten or so at the default pace.
- **Sample**: `poster.jpg`, an English still 480 px wide.

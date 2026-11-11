# Recipe: stream

A launch film for a product that sends work out and brings it back, told by one thread of light that is the product's attention: it pierces a desk piled with windows, alerts and a sticky note and reels everything into the mascot; it becomes the spine every interface block hangs on; each task leaves it as a star that stays in the sky; a bigger job goes out along beams and links into a constellation; a result is stopped at a gate and passes on the second try; three glass cards hang on strands, whole – part – whole; then the thread sweeps the sky, catches every star, straightens and lets them flow into one point that opens as a panel with exactly one row that needs the user; it lies flat under the claim and winds back into the name. This recipe names the bricks the style is made of: its look, its recommended bricks slot by slot, what a film in it must not do, which brick each part of the template became, and what stays in the template.

- **Mode card**: [stream](../modes/stream.md) (the template's look, presets, principles and checks). **Template**: `assets/templates/stream/`, whose `content.js` is the example film.

## Reference look

[`night-sky`](../../assets/runtime/bricks/look/night-sky/CARD.md): presets `night` (the source, default), `ember`, `aurora`, `mono`, keeping the template's hexes. Library roles: ink and dim are the text on the night, accent is the thread (and the stars and their glow), onAccent, paper and onPaper / onPaper2 for the warm off-white blocks, panel for the glass cards; `line` (a divider on the night) is derived for library bricks and never drawn by the stream bricks. The template's own names are kept as extra roles: field and fieldEdge (the sky's radial gradient), dust, glow and core (the thread's halo and white-hot head), panel2, bubble, user and onUser (the user's dark bubble), rule, accentInk (the accent's ink tone, the only accent on paper: the running rings), warn (the one "needs you"; accentInk unless a film sets it) and desk1–3, deskBar (the desk opening). DM Sans for everything (the name 168, the claim 66, captions 58, card titles 42, bubbles 34, rows 30, details 25–27), Noto Sans SC after it in Chinese. The sky: a radial field, 240 dust motes, 22 bokeh discs, a 5 % push over the film (`look/night-sky/texture.js` draws it, seeded). The thread glows additively in three passes (16, 7, 2.6 px). No grain, no vignette, no motion blur.

## Recommended bricks

| Slot (arc `scatter-gather`) | Own bricks | From the rest of the library |
|---|---|---|
| hook | [`desk-threaded`](../../assets/runtime/bricks/scene/desk-threaded/CARD.md) (`opening`: `desk` \| `night`) | [`split-fuse`](../../assets/runtime/bricks/motion/split-fuse/CARD.md) (`entry: 'converge'`) over the opening as the mascot's debut, its slam on the drop's landing |
| turn | [`spine-intro`](../../assets/runtime/bricks/scene/spine-intro/CARD.md) | – |
| demo | [`ask-to-star`](../../assets/runtime/bricks/scene/ask-to-star/CARD.md), [`evening-stars`](../../assets/runtime/bricks/scene/evening-stars/CARD.md) | – |
| climax (middle) | [`job-constellation`](../../assets/runtime/bricks/scene/job-constellation/CARD.md) | – |
| proof | [`check-gate`](../../assets/runtime/bricks/scene/check-gate/CARD.md) | [`card-squash`](../../assets/runtime/bricks/motion/card-squash/CARD.md) (thread) for a block folding into a line on its own |
| demo | [`strand-cards`](../../assets/runtime/bricks/scene/strand-cards/CARD.md) (one to three cards) | – |
| proof (optional) | [`day-after-day`](../../assets/runtime/bricks/scene/day-after-day/CARD.md) (the days going on in one chat) | – |
| climax / claim | [`sky-gather`](../../assets/runtime/bricks/scene/sky-gather/CARD.md) | [`caret-fall`](../../assets/runtime/bricks/motion/caret-fall/CARD.md) (thread) where a line lies flat under words on its own |
| rest (optional) | [`night-interlude`](../../assets/runtime/bricks/scene/night-interlude/CARD.md) (the night after the sweep, for a composition of the film's own) | [`split-fuse`](../../assets/runtime/bricks/motion/split-fuse/CARD.md) over it (`entry: 'split'`, `line`, `arrive` at the perch) as the film's own reveal or ending |
| lockup (optional) | [`point-lockup`](../../assets/runtime/bricks/scene/point-lockup/CARD.md) (`ending`: `name` \| `mascot`) | [`perch-lockup`](../../assets/runtime/bricks/scene/perch-lockup/CARD.md) (a mascot on the name) or [`mark-lockup`](../../assets/runtime/bricks/scene/mark-lockup/CARD.md), the default lock-ups ([creative.md](../creative.md#rules-for-any-composition)), on a gradient or picture entered by [`cover-rise`](../../assets/runtime/bricks/motion/cover-rise/CARD.md) (`from: 'none'`, `to: 'none'`) |
| every scene | [`glow-thread`](../../assets/runtime/bricks/prop/glow-thread/CARD.md) (the thread and the engine: `kit.js` `filmScene`, `engine.js` `createFilm`) | – |
| props on their own | [`hung-block`](../../assets/runtime/bricks/prop/hung-block/CARD.md) (chat, row, card, panel), [`desk-pile`](../../assets/runtime/bricks/prop/desk-pile/CARD.md), [`yarn-mascot`](../../assets/runtime/bricks/prop/yarn-mascot/CARD.md) | – |
| motions on their own | [`thread-pierce`](../../assets/runtime/bricks/motion/thread-pierce/CARD.md), [`reel-in`](../../assets/runtime/bricks/motion/reel-in/CARD.md), [`hook-unfold`](../../assets/runtime/bricks/motion/hook-unfold/CARD.md), [`star-launch`](../../assets/runtime/bricks/motion/star-launch/CARD.md), [`beam-return`](../../assets/runtime/bricks/motion/beam-return/CARD.md), [`star-sweep`](../../assets/runtime/bricks/motion/star-sweep/CARD.md), [`strand-zoom`](../../assets/runtime/bricks/motion/strand-zoom/CARD.md) | – |
| sound | [`stream-bed`](../../assets/runtime/bricks/sound/stream-bed/CARD.md) (preset `terminal`) | – |

The order is fixed and each scene comes once. Three are optional: `day-after-day` between the cards and the sweep, `night-interlude` after the sweep and `point-lockup` at the end. A film with a section the skeleton has no scene for, or an ending of its own, puts it over the interlude: the night, the gathered sky, the line and the mascot's place carry on from the close with no seam, and the lock-up, if any, follows. `strand-cards` takes one to three cards (one is a single pass; `day-after-day` needs three).

**A film's own product goes in through options, not code.** Every scene brick takes optional slots for what a real product's film shows beyond the template: the mascot's size (`mascotSize`), the pile's fullness (`copies`, 1–6 alerts), the product's name and role large in the intro, a picture and a decision asked with a recommendation in the ask, file chips (over or inside the bubbles), progress lines, filter tabs and a quoted follow-up (after the burst or between the asks) in the evening, the new-workspace dialog and the workspace's header in the constellation, the explanation and the relation graph at the gate, the tangle, chapter lines, a flowed line and a new task in the cards, one summary card in place of the three on the days (with rows of its own and the lines large), the panel's tabs, groups, times and header, its "needs you" grey until the alert and a second chapter line in the close. Two film-wide counts sit in `ui`: `cap`, how many tasks run at once (the evening queues the rest and its counts follow), and `filter`, the filter row's names (which then carry counts); both are defined once in the [`glow-thread`](../../assets/runtime/bricks/prop/glow-thread/CARD.md) card. Each card lists them; left out, the scene draws frame for frame as without them. Every scene also takes the reading controls `holds` and `glance` (see Reading).

**Every scene takes the film.** A stream scene is one window of a continuous film whose picture reads the scenes before it: the stars every earlier scene sent stay in the sky and the closing sweep catches them, the chat block carries the feed of every ask and moves between places planned over the whole film, the evening's list grows from where the ask left its row. So each scene brick takes its own copy as slots and the rest of the film as `film` (the template's `content.js` object: product, ui, opening, lockup, seed and the scenes); it lays the whole film out with the template's rules and draws the frames from its start to its end, the neighbours' lingering pieces included. Left alone (`film: null`), a scene draws its window of the worked example in its language with its own copy in it, so its plan is the example's scene length (31, 16, 13, 16, 22, 11, 23, 23, 17 beats in English at 128 BPM).

## Ban list

- A second hue: status greens, oranges, reds; the gate's fail is grey text, done is a neutral tick, queued is a dashed ring.
- The accent anywhere but the thread, the stars, their glow and the running rings on paper (`accentInk`); the one "needs you" is `warn`, once.
- A second line that does not branch from the thread; a thread that breaks or folds back sharply.
- A block that fills the frame, or a camera move into a block; a hard cut or crossfade between scenes (the desk's sink is the only full-frame change).
- More than one "needs you" or alert sound; two mascots; ornament (icons, document stacks, recycle bins).
- A light ground: the three glow passes grey out on paper or print grounds (`plakat`, `blueprint`, `dossier` and similar are in every brick's `styles.avoid`).
- Captions on two lines; Chinese with Latin tracking or Latin reading time.

## Template → bricks

| Template part (`assets/templates/stream/`) | Brick | Notes |
|---|---|---|
| `palettes.js`, `lang.js` TYPE, `film.js` renderBG | [`night-sky`](../../assets/runtime/bricks/look/night-sky/CARD.md) (`look.js`, `texture.js`) | roles renamed to the library's (text → ink, text2 → dim, line → accent, ink → onPaper); `line` derived |
| `film.js` (the whole film), `plan.js`, `sched.js`, `timing.rules.js`, `lang.js` | [`glow-thread`](../../assets/runtime/bricks/prop/glow-thread/CARD.md) (`engine.js`, `plan.js`, `sched.js`, `rules.js`, `text.js`, `draw.js`, `kit.js`, `examples.js`) | `engine.js` is `film.js` ported from DOM to one canvas (the paper blocks, bubbles, rows, pills and their blur entrances drawn by `prop/hung-block/blocks.js`), as a factory with no module state |
| `film.js` css() blocks, renderChat, renderAsk, renderCards, the panel; `plan.js` cardAt | [`hung-block`](../../assets/runtime/bricks/prop/hung-block/CARD.md) (`blocks.js`) | the block kit every scene draws with |
| `plan.js` openItems, the opening's DOM | [`desk-pile`](../../assets/runtime/bricks/prop/desk-pile/CARD.md) (`pile.js`) | |
| `film.js` mascot() | [`yarn-mascot`](../../assets/runtime/bricks/prop/yarn-mascot/CARD.md) (`mascot.js`) | an image slot at the same anchor |
| `open` | [`desk-threaded`](../../assets/runtime/bricks/scene/desk-threaded/CARD.md) | the freeze, the drop and the desk's sink are inside |
| `intro` | [`spine-intro`](../../assets/runtime/bricks/scene/spine-intro/CARD.md) | |
| `ask` | [`ask-to-star`](../../assets/runtime/bricks/scene/ask-to-star/CARD.md) | |
| `evening` | [`evening-stars`](../../assets/runtime/bricks/scene/evening-stars/CARD.md) | |
| `constellation` | [`job-constellation`](../../assets/runtime/bricks/scene/job-constellation/CARD.md) | the plan's link into a constellation is inside |
| `verify` | [`check-gate`](../../assets/runtime/bricks/scene/check-gate/CARD.md) | the gate is inside |
| `cards` | [`strand-cards`](../../assets/runtime/bricks/scene/strand-cards/CARD.md) | |
| `close` | [`sky-gather`](../../assets/runtime/bricks/scene/sky-gather/CARD.md) | the panel and the lay-flat under the claim are inside |
| `lockup` | [`point-lockup`](../../assets/runtime/bricks/scene/point-lockup/CARD.md) | both endings |
| renderOpen (the path and the pierce) | [`thread-pierce`](../../assets/runtime/bricks/motion/thread-pierce/CARD.md) | on its own, over any items |
| renderOpen (the tug) | [`reel-in`](../../assets/runtime/bricks/motion/reel-in/CARD.md) | |
| renderChat (the hook), cardAt (the unfold) | [`hook-unfold`](../../assets/runtime/bricks/motion/hook-unfold/CARD.md) | |
| renderAsk (the row's exit), renderBG (the star's flight) | [`star-launch`](../../assets/runtime/bricks/motion/star-launch/CARD.md) | |
| renderConst (beam and bead) | [`beam-return`](../../assets/runtime/bricks/motion/beam-return/CARD.md) | |
| plan.js GATHER, renderClose | [`star-sweep`](../../assets/runtime/bricks/motion/star-sweep/CARD.md) | |
| cardGeo, renderCards (the zoom) | [`strand-zoom`](../../assets/runtime/bricks/motion/strand-zoom/CARD.md) | |
| `score.mjs`, `sched.js` music and cues | [`stream-bed`](../../assets/runtime/bricks/sound/stream-bed/CARD.md) | |
| `content.js`, `sched.js`, the mode card's Scenes | [`scatter-gather`](../../assets/runtime/bricks/arc/scatter-gather/CARD.md) | |

The bricks go past the template in a few places, each opt-in, so a film that leaves them out draws as the template does: the night interlude after the close (no template part) and a film without a lock-up; one or two cards in `strand-cards`; `ui.cap` and `ui.filter` (the template queues the last two rows of the burst and names its filters once). One count differs on purpose: the panel's done count is every star sent less the ones a card's new task sends, where the template shows one less.

Reused from thread, not made again: [`caret-fall`](../../assets/runtime/bricks/motion/caret-fall/CARD.md) (a caret falling flat into the line under what it typed; stream's thread lying flat under the claim is the same idea) and [`card-squash`](../../assets/runtime/bricks/motion/card-squash/CARD.md) (a card squashing into a line; stream's blocks folding back into the spine). The division between the two lines is written once, in the [thread recipe](thread.md#the-two-lines-thread-and-stream): thread's line becomes each object and has no glow, stream's line stays a line and carries things, so stream has its own [`glow-thread`](../../assets/runtime/bricks/prop/glow-thread/CARD.md) and does not reuse [`thread-line`](../../assets/runtime/bricks/prop/thread-line/CARD.md). Overlaps recorded in `brick.json`: `reel-in` with [`hub-links`](../../assets/runtime/bricks/scene/hub-links/CARD.md) (its merge), `beam-return` with [`path-flow`](../../assets/runtime/bricks/motion/path-flow/CARD.md), `point-lockup` with [`perch-lockup`](../../assets/runtime/bricks/scene/perch-lockup/CARD.md), `stream-bed` with [`phosphor-bed`](../../assets/runtime/bricks/sound/phosphor-bed/CARD.md) and [`shell-bed`](../../assets/runtime/bricks/sound/shell-bed/CARD.md) (the same `terminal` preset).

What stays inside the scenes, and why:

- **The desk's sink into the night** (open): the emptied desk shrinks and darkens into the night as the thread straightens into the spine. It is bound to the desk's wallpaper and the spine's place, happens once per film, and is the style's only full-frame change; as a motion it would be a generic shrink.
- **The freeze and the mascot's drop** (open): the freeze is a held line over a darkened desk (the bed breaks under it), the drop a squash on landing at the spine's top; both are timed by the scene's reading and bound to the mascot's anchor. The drop is [`yarn-mascot`](../../assets/runtime/bricks/prop/yarn-mascot/CARD.md)'s `drop` → `squash` states.
- **The chat block's reshaping between scenes** (`cardAt`): the block moves, lowers and reshapes on a place table planned over the whole film; it is film work, carried by passing `film`.
- **The plan's link into a constellation** (constellation), **the gate** (verify), **the panel and the lay-flat under the claim** (close): each is one composition bound to its scene's layout and copy (the gate's word, the panel's rows, the claim's three words); the lay-flat is `caret-fall`'s idea in stream's colours.
- **Text entrances**: the 8 px blur per word (per character in Chinese) is drawn by `blocks.js` inside every block; the library's `blur-in`-style motions would draw it a second time.
- **The stars' persistence**: every star the film sent stays in every later frame and the sweep catches them; it reads the whole film (where each scene launched its stars), so it is carried by `film`, not by a brick.

## Reading

The rule (owner, 2026-11-09 and 2026-11-10: liveliness comes before reading every word, and legibility guards only the sentences that must be read; [creative.md](../creative.md#primary-and-glance-text)): a scene's text is either **primary** or a **glance**.

- **Primary** text holds for its reading time, the library's `readTime` (Chinese 6 characters a second + 0.5 s; English 0.3 s a word; 1 s at least). At most one primary sentence is on screen at a time.
- **Glance** text (task rows, file chips, progress lines, tabs, dialog text, the bubbles around a caption, card rows, labels) holds for a fixed 0.8 s after it is readable, whatever its length; `glance` (seconds, 0.3–3) on a scene or on the film's content changes it.
- **`holds`** on a scene (`{ key: seconds }`, or an array per item, 0–20 s) overrides the hold of any named text, primary or glance, and sets the scene's named timings: the open's `reel` and `sink`, the ask's `image` (how long the large picture stays up), the evening's `askGap` and `burstGap`, the days' `dayGap` and `noteGap`, the close's `need` (the panel's stillness before its "needs you"). Each scene's card lists its keys and their defaults.
- **No film-wide pace factor**: it would shorten the read sentences too. A film runs faster by its glances (`glance`) and by `holds` on a scene, never by cutting the reading of a primary sentence.

Primary by default (everything else on the scene is a glance):

| Scene | Primary |
|---|---|
| `desk-threaded` | the note, the freeze line |
| `spine-intro` | the two lines, one after the other |
| `ask-to-star` | the caption; the choice's caption |
| `evening-stars` | the caption; the follow-up's caption |
| `job-constellation` | the caption, the result (the second caption shares the screen with the result and is a glance) |
| `check-gate` | the caption; the graph's two captions, one after the other |
| `strand-cards` | the caption, each card's `say` while it is open, the second caption |
| `day-after-day` | the caption |
| `sky-gather` | the caption, then the claim with its words |
| `point-lockup` | the name and tagline (the closing line holds at least 6 s anyway) |

With the rule the example film runs 80.6 s in English and 82.5 s in Chinese, against 91.9 s and 97.5 s when every bubble is read. A long product film matches its source's pace with `holds` on the few scenes the owner names and `glance` on the film, not with a film-wide speed-up.

## Chinese

- **Copy** is the template's own Chinese example (`examples/content.zh.js`), written in Chinese, not translated; the limits are about half the English ones (a caption 14 characters, a bubble 40, a row 15).
- **Type**: Noto Sans SC after DM Sans, tracked +0.02 em, leading 1.5, no capitals or italic. Every information size is raised to the library's 28 px floor (row details, star labels, statuses, card sub-lines: the template set 25–27 px, under HyperFrames' 28 px recommendation). The opening pile keeps the template's sizes: it is texture, read as "too many".
- **Entrances** run a character at a time (0.04 s apart) where English runs a word at a time (0.07 s); the tagline and the claim's three words rise per character.
- **Line breaking** is the runtime's `breaks` (after ，、：；。！？ first, then between characters, with the kinsoku rules), balanced so no last line holds one character.
- **Reading** is the runtime's `readTime` (6 characters a second plus 0.5 s a state) over letters and digits only: punctuation is dropped first, as the template counts it. Only primary texts are read (see Reading): the Chinese example runs 82.5 s, the open and intro the original's 8 and 3.75 bars. Latin inside Chinese reads at two letters a unit (the library's rule) where the template reads 0.3 s a word, so a primary text with Latin words shifts by up to half a bar.
- **Weakest point**: glanced bubbles in Chinese. A bubble takes up to 40 characters but is held for a glance (0.8 s after it enters), so a long one passes unread; what the scene says has to be in its 14-character caption. Keep glanced bubbles to a short phrase, and give `holds` to the one a scene needs read.

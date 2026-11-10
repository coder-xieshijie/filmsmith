# Composing a film

Composing is the default way to make a film. Start from the material, pick two or three styles as references, give the film one look, choose an arc, and fill each of its slots with a brick. Standard mode, one template as it ships, is the exception: the content falls squarely in one style's "Fits" line and the user wants it fast ([SKILL.md](../SKILL.md#2-reference-styles-or-standard-mode)).

| | Composed film (default) | Standard mode |
|---|---|---|
| What you use | Every brick in the library, two or three recipes as references, and the subject's real material | One style's template, palette presets, scene registry and the transitions its card names |
| Starts from | `new-film.mjs <style>`, the style whose look the film takes; scenes the template lacks are written film-locally from bricks | `new-film.mjs <style>` |
| Risk | Loses unity; reads as a sampler of effects | Looks like the style's example film |

## Bricks

A brick is one reusable part of a film, drawn in code: the same parameters at the same time always draw the same frame. There are six kinds.

| Kind | Is | Is not |
|---|---|---|
| motion | one change: from a state A to a state B as progress runs 0 → 1, a transition between scenes or an action inside one | it draws no content of its own and owns no colours |
| scene | one screen's layout and camera path, with slots for content; it declares its own reading time and length | it sets no palette or type |
| prop | a thing that recurs in the picture: a window, a pop-up, a note, a device frame, a panel, a cursor, a mascot's place | it carries no real brand or capture, only places to put the film's material |
| look | palette presets by role, type families and scale for each language, grid, camera habits, grain and light | it holds no motion or layout |
| sound | a music bed preset and which picture events take which cue | it ships no audio files |
| arc | a sequence of slots with roles: hook, problem, turn, demo, climax, proof, claim, rest, lockup | it holds no picture |

A style is not a seventh kind: it is a recipe ([recipes/](recipes/)) that names one look, the bricks it recommends for each slot, a ban list, and its template as the example film. Bricks read colours by role (`ground`, `panel`, `ink`, `dim`, `line`, `accent`, `onAccent`, `paper`, `onPaper`; `ok`, `warn`, `fail` only for a state) and type by role (`display`, `text`, `mono`, optionally `serif`), so the film's look decides how every brick looks.

Where they are: the catalogue [bricks.md](bricks.md) lists every brick by kind, use and slot; the index `assets/runtime/bricks/index.json` holds each brick's fields; each brick's folder `assets/runtime/bricks/<kind>/<id>/` holds its code, its `CARD.md` and two posters (English and Chinese). The frame-level transitions and hand-offs in `runtime/transitions/` and `runtime/handoffs/` are motion bricks too; their cards are in [transitions.md](transitions.md).

## Picking reference styles

Choose two or three styles by what the content is (principle 9), not by what looks impressive, and give one reason each in terms of the content: "stream: the product sends tasks out and gathers them back"; "tally: the proof is a count of 412 runs". One of them gives the film its look (below); the others lend bricks and grammar. The "Fits" column in [SKILL.md](../SKILL.md#styles) and the [choosing table](modes/README.md#choosing-reference-styles) sort the styles by content. Read each reference's recipe in full: its recommended bricks are pairings already tried, and its ban list joins the film's.

Styles that look alike split the work by what they do; the recipes say where. Thread's line becomes each object of a pipeline, for a tool whose output is film; stream's line stays a line and carries things, for a product that sends work out ([thread recipe](recipes/thread.md#the-two-lines-thread-and-stream)).

## One look a film

Variety reads as one film only inside one visual system (layer 4 of the pyramid, [foundations](foundations.md)). However many styles a film borrows from, it has exactly:

1. **One palette**: one preset of one look brick, its accent, status, category and effect roles. Bricks borrowed from other recipes are drawn in it by role, never pasted with their own colours.
2. **One type system**: at most two families plus one mono, one type scale, the look's stacks for the film's language.
3. **One through-line**: an object or a persistent frame of real information, first frame to last (principle 7), and one accent with one meaning, stated in `PLAN.md`.

A brick whose `styles.avoid` names the film's look stays out. Three ways this goes wrong:

- **Two grounds.** Stream's glowing thread over plakat's warm paper: the glow greys out on a light ground and the paper's grid fights the night sky. Take one look; on paper, a line that carries things is drawn flat, without glow.
- **Two type systems and two accents.** Phosphor's decoded titles followed by halftone's feature cards in their newsprint and process ink: the film switches worlds at every cut. Reskin the cards into the terminal look, or leave them out.
- **Two through-lines.** Thread's line and stream's thread in the same film: the eye cannot tell which line is the film. Keep one, and use the other recipe's motions without its line.

## Primary and glance text

Liveliness comes before reading every word, and legibility guards only the sentences that must be read (owner, 2026-11-09 and 2026-11-10, on a composed launch film of 107 s). So every state of a composed film has at most one **primary** sentence, and everything else on screen is **glance** text.

- **Primary** text holds for its reading time ([principle 1](principles.md); Chinese in [system](system.md#language)): titles, captions, claims, the number a scene is about, the question. Its words per state stay within principle 5.
- **Glance** text — rows in a list, chips, bubbles around a caption, tabs, dialog text, labels — keeps the size and contrast floors but is not timed for reading: a scene brick holds it for the glance time its card gives (stream's scenes 0.8 s, set with `glance`), whatever its length. Templates keep principle 1's own glance tier.
- **Nothing the film needs understood is glance text.** If a viewer must read a row, make it the primary sentence of its state, or name it in the scene's `holds`.
- **Never shorten a primary sentence's reading to speed a film up.** A film runs faster by its glances (`glance` on the film) and by `holds` on the few scenes that drag, not by a film-wide pace factor.

## Finding bricks

1. **Read the catalogue by slot.** [bricks.md](bricks.md) groups the bricks by kind, then by use (`seam`, between two scenes; `in-scene`, inside one) and slot role. One row a brick: id, name, intent, subjects, moods, energy, length. Start from the reference recipes' tables, then look further.
2. **Query the index.** Each brick in `assets/runtime/bricks/index.json` has a `select` block written for choosing: `intent` (what the viewer gets), `content` (what material it needs: how many items, what type, how many characters, any image), `fits` and `notFor`, `use`, `roles` (the slots it can fill), `subjects` and `moods` from fixed lists, `keywords` in English and Chinese, `pairs` (bricks it joins well) and `pitfalls`; beside it `langs` (`full`, `adapted` or `none` per language), `styles` (`fits`, `avoid`), `energy` and `duration`. For example, proof bricks for a metric that work in Chinese:

   ```bash
   jq -r '.bricks[] | select((.select.roles // []) | index("proof")) | select((.select.subjects // []) | index("metric"))
     | select(.langs.zh != "none") | "\(.id)\t\(.select.intent.en)"' assets/runtime/bricks/index.json
   ```

   Subjects: `title`, `text`, `number`, `metric`, `chart`, `code`, `terminal`, `ui`, `list`, `cards`, `image`, `logo`, `diagram`, `device`, `cursor`, `space`, `timeline`, `voice`, `abstract`. Moods: `calm`, `playful`, `energetic`, `dramatic`, `mechanical`, `ceremonial`, `elegant`, `editorial`, `technical`, `cinematic`, `warm`, `mysterious`.
3. **Open the cards of the candidates.** A `CARD.md` says what the brick looks like, its use and what it is not for, its intent and content, every parameter, its length and easing, its sound cues, its languages and its pitfalls. Keep a brick when its intent says what the slot needs and its content matches the material you have; a brick that needs a screenshot you do not have is the wrong brick.
4. **Match the language.** A brick marked `none` for the film's language is out; one marked `adapted` draws another effect in that language, described on its card.

## The composition table

`PLAN.md` holds one row per brick, before the beat plan. A short example, an English launch film for an agent scheduler, references stream (the look), tally and phosphor:

| Slot | Brick | From | Reskin | Material |
|---|---|---|---|---|
| hook | `desk-threaded` (scene) | stream | as shipped, `night` preset | the product's real alerts and one sticky note |
| demo | `ask-to-star` (scene) | stream | as shipped | one real task and the reply the product gave |
| proof | `unit-count` (scene) | tally | squares drawn as stars on the night: `accent` is the thread colour, `ground` the sky; DM Sans for the count | the 412 runs of last week, counted by `data/runs.mjs` |
| turn | `glyph-decode` (motion) | phosphor | on the chapter caption only, in DM Sans | – |
| climax | `sky-gather` (scene) | stream | as shipped | the panel's real rows; the one that needs the user |
| lockup | `perch-lockup` (scene) | library | the mascot on the name, `paper` from the look | the product's name and URL |
| sound | `stream-bed` (sound) | stream | – | – |

Write below it the film's look (preset, type families and scale, the accent's one meaning, the through-line) and the transition vocabulary: 4–8 motions, each with its tier, the turns that use it and its axis of motion, at most two from one family ([Families](transitions.md#families)). The concept sentence, the ban list, the motif table and the beat plan follow as in every film.

## Rules for any composition

These hold however the bricks are picked (owner, 2026-11-10, adopting the recommendations of the brick reviews):

- **One lock-up and one sound bed a film.** The default lock-ups are [`mark-lockup`](../assets/runtime/bricks/scene/mark-lockup/CARD.md) (the mark becomes the wordmark) and [`perch-lockup`](../assets/runtime/bricks/scene/perch-lockup/CARD.md) (a mascot perched on the name); a recipe's own lock-up when that recipe gives the look.
- **At most two bricks of one motion family** ([Families](transitions.md#families)): `card-portal`, `isolate`, `pose-fly` and `time-freeze` are all zoom and depth.
- **One kind of title entrance** (`type-enter`, `type-retype`, `type-sync`) and **one kind of name entrance** (`name-stamp`, `orbit-title`, `word-window`).
- **Impacts**: at most one impact brick (`impact-frame`, `slam-drop`), and at most two frozen-frame hits a film (`combo-hits`, `impact-frame`, `time-freeze`).
- **At most two card-display scenes** (`card-pile`, `deck-deal`, `bento-wall`).
- **One of each pair that does the same thing**: `voice-listen` or `pill-dictate`; `needle-sweep` or `tape-run`.
- The four tiers of change still ration the expressive devices (principle 4); the real-asset rules hold for every capture ([transitions.md](transitions.md#real-assets)); every core principle, the checklist and `check-film` apply.

Scenes the base template does not have are written film-locally from their bricks, against the template's registry and timing rules, so `npm run fit` and `check-film` measure them like any other. A film-local scene that proves itself in an accepted film can be proposed as a brick.

## When to say no

Composing frees the choice of bricks, not the gates. Say no, and say why, when:

- the table needs two accents, two type systems or a second through-line to work: the subject wants two films or another look;
- the film reads as a collection of effects: more expressive devices than the content has turns, bricks that show themselves off instead of carrying a fact, a different trick in every scene. Cut to the bricks that carry the content and repeat the film's own grammar;
- the material cannot fill the bricks (a brick that wants real captures or a real count, with none to give): pick another brick, or ask for the material.

Before handing over a composed film, pause on frames from its first, middle and last third side by side: they should read as one film. Ask the user that question with the verdict.

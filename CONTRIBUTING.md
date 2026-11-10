# Contributing

Thanks for wanting to make Filmsmith better. Each skill lives in its own folder under `skills/`; say which one an issue or pull request is about. Issues with a rendered frame or the skill's check report attached are the most useful kind.

## Every pull request

1. The skill's own checks pass on your machine (below).
2. Docs are in English, short sentences. A change to `README.md` is mirrored in `README.zh-CN.md`.
3. Nothing inside `skills/<name>/` points outside it: installs copy only that folder.
4. One line under "Unreleased" in `CHANGELOG.md`, starting with the skill's name.

## keynote-video

Paths below are inside `skills/keynote-video/`.

### Before you open a pull request

1. `node scripts/selftest.mjs` passes (Node 22+, FFmpeg).
2. A template change keeps its default output: render stills of the shipped `content.js` before and after (`npm run snapshot -- --at …`) and compare them; a brick change keeps its poster. If the change is meant to alter the default, say which frames change and why.
3. A rendered film passes `check-film.mjs` with no FAIL; explain any WARN.
4. Every value on a style card carries where it comes from (`standard`, `borrowed`, `derived`, `owner`, `draft`) and a date.

### Adding a variant

A style gets colour presets (in its `palettes.js`, contrast computed on the card) and at most one form axis (a `content.js` field whose default renders exactly as before). Give the source of the variant: a design tradition, a standard or a study, not taste alone. See "Form variant" in `assets/templates/CONTRACT.md`.

### Adding a style

A new style is a recipe in `references/recipes/` with the sections the others have (reference look, recommended bricks by slot, ban list, template → bricks, what stays in the template, Chinese) and the bricks it adds, plus its example film: a card in `references/modes/` that follows the card template in its `README.md`, and a template in `assets/templates/` that follows `CONTRACT.md` — a complete, renderable example in `content.js`, length fitted from the content, key events exported for `check-film`, no binary assets except small example assets for a real-asset mode (each under 200 KB, recorded in `THIRD-PARTY.md`). It has to point at a kind of content none of the existing styles covers (principle 9 in `references/principles.md`), and it sets English and Chinese ([system.md](skills/keynote-video/references/system.md#language)).

### Adding a brick

A brick is one folder, `assets/runtime/bricks/<kind>/<id>/` (kind: `motion`, `scene`, `prop`, `look`, `sound` or `arc`; the id unique across the library, two or three lower-case words), listed in `assets/runtime/bricks/index.json` and in the catalogue [`references/bricks.md`](skills/keynote-video/references/bricks.md). It is done when:

1. Its `CARD.md` follows the cards of its kind in the catalogue, in English: what it looks like, use and not for, intent and content, every parameter with its default, length and easing, sound cues, source, licence, languages, posters and pitfalls.
2. Its index entry carries the selection fields: intent and content, fits and not for, the slot roles it fills, subjects and moods from the fixed lists, keywords in English and Chinese, pairs and pitfalls, and its languages (`full`, `adapted` or `none` for each, with the reason on the card when not `full`).
3. A frame depends only on its parameters and the time or progress: no `Math.random`, no clock; progress 0 and 1 draw its start and end states exactly.
4. It reads colours and type by role from the look, never a colour value or a font name, and sets text only through the runtime's text functions (measuring, line breaking, reading time per language).
5. It renders an English and a Chinese poster (each under 200 KB) from neutral, made-up content: no real brand, product or capture.
6. A brick adapted from another work names its source and licence on its card.

### What will not be merged

People on screen, generated photoreal footage, custom hex values outside a preset (a brand colour becomes a preset by [system.md](skills/keynote-video/references/system.md#a-preset-from-a-brand-colour)), and anything that trades legibility for effect (principle 1).

## teach-video

See [`skills/teach-video/SKILL.md`](skills/teach-video/SKILL.md) for how the skill is built and checked.

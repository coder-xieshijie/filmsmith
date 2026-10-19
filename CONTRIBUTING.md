# Contributing

Thanks for wanting to make CodeReel better. Issues with a rendered frame or a `check-film` report attached are the most useful kind.

## Before you open a pull request

1. `node skills/code-reel/scripts/selftest.mjs` passes on your machine (Node 22+, FFmpeg).
2. A template change keeps its default output: render stills of the shipped `content.js` before and after (`npm run snapshot -- --at …`) and compare them. If the change is meant to alter the default, say which frames change and why.
3. A rendered film passes `check-film.mjs` with no FAIL; explain any WARN.
4. Docs are in English, short sentences; every value on a style card carries where it comes from (`standard`, `borrowed`, `derived`, `owner`, `draft`) and a date.
5. One line under "Unreleased" in `CHANGELOG.md`.

## Adding a variant

A style gets colour presets (in its `palettes.js`, contrast computed on the card) and at most one form axis (a `content.js` field whose default renders exactly as before). Give the source of the variant: a design tradition, a standard or a study, not taste alone. See "Form variant" in `skills/code-reel/assets/templates/CONTRACT.md`.

## Adding a style

A new style is a card in `skills/code-reel/references/modes/` that follows the card template in its `README.md`, and a template in `skills/code-reel/assets/templates/` that follows `CONTRACT.md`: a complete, renderable example in `content.js`, length fitted from the content, key events exported for `check-film`, no binary assets. It has to point at a kind of content none of the ten covers (principle 9 in `references/principles.md`).

## What will not be merged

People on screen, generated photoreal footage, custom hex values outside a preset, and anything that trades legibility for effect (principle 1).

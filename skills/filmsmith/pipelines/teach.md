# Teach film — Chinese narration

Makes an explainer film that its audience understands (by default developers who know the basics but not this mechanism; a style kit may name another audience): a narration in Chinese is voiced and timed first, then the picture is written in code against that timeline, segment by segment, from a kit that already holds the look, the components and the checks.

## Rules for this pipeline

[SKILL.md](../SKILL.md#rules-for-both-pipelines) holds the rules both pipelines keep. These are teach's own. They hold for every film, version and stage, including direction samples.

- **Understood first, then good; accurate always.** Each film has 1–3 learning goals written before any picture; simplify freely, never say something false ([teaching.md](../references/teaching.md)).
- **Frame.** 1920×1080 at 30 fps; the band `y ≥ 880` stays empty for subtitles, by layout. The presenter reserve (`x 1580–1880`, `y 560–860`) is empty outside the presenter windows in `film.json`.
- **People.** No real people on screen except the presenter window and sourced footage that supports a claim.
- **Hand marks.** At most four hand-drawn marks (circles, underlines, braces, handwriting) per three-minute film; all other emphasis by greying, fading or scaling.
- **Language.** Narration is Chinese; an English voice-over is not part of this pipeline. On-screen text follows [SKILL.md](../SKILL.md#rules-for-both-pipelines) with Chinese as the fallback; reading rate, sizes, setting and fonts per language: [teaching.md](../references/teaching.md#on-screen-language). The film's working documents (topic card, brief, notes, check report) follow the language of the user's project; code and comments are English.
- **Time comes from the narration.** The picture is timed by line IDs and anchor words, never by typed seconds, so a re-recorded narration moves the picture with it. Never speed up the voice or shorten holds to hit a length.
- **Engine.** HyperFrames is pinned in the kit's `starter/build/hf.cjs` (0.8.214) and reached only through `npm run hf -- …`; never write `npx hyperframes@…` yourself, and never upgrade inside a film (the upgrade procedure is in the kit README).

## Kits and bricks

Each kit is also a recipe ([references/recipes/](../references/recipes/)): its look, the bricks it recommends for each part of the explanation, its ban list, and which brick each of its components became. Bricks come from the one library in [SKILL.md](../SKILL.md#the-library), the same ids launch uses; a brick whose `hosts` names `teach` can be driven here, and its card says how (its parameters, and its `host.html`, which mounts it as a HyperFrames sub-composition). A brick in a segment is checked like any other part of it.

A kit's components are its own code (`components/`, `build/`, `tokens.js`), kept in step with the kit by `npm run kit-sync`; a missing component goes into the kit first, then `kit-sync`.

## Requirements

- An agent that can run shell commands; starting other agents helps ([roles.md](../references/roles.md)) but is not required.
- Node 22+, `ffmpeg` and `ffprobe`, `python3`, `uv` (for `voice.py` and the font subsetter run through `uvx`).
- Network on first use: edge-tts (the temporary voice), opencc-python-reimplemented 0.1.7 (turns the transcript into simplified characters), the HyperFrames package and its headless Chrome (fetched on first use through `hyperframes browser ensure`), its whisper `small` model (about 466 MB), fonts from pinned URLs (about 26 MB, cached in `$XDG_CACHE_HOME/filmsmith/fonts`), GSAP 3.15.0 from the npm registry. Every download is pinned by version and checked by sha256 where the file is fixed.
- `CHROME_PATH` overrides the browser the checks use; `FILMSMITH_ROOT` overrides where a project looks for this skill.

## Route

Who does each step and how agents are dispatched: [roles.md](../references/roles.md). How these steps sit inside the three user reviews (direction, rough cut, final): [process.md](../references/process.md). A film's folder, unless the user's project already names these things (then write its names into the brief's "Read" table):

```
<film>/topic.md      topic card and fact sheet
<film>/shared/       shared assets: narration.json, shared.json and what voice.py writes
<film>/brief.md      the brief
<film>/<version>/    the kit project for one version (new-film-teach)
<film>/look-board.md only after a direction review (gate 1); otherwise the kit is the look
```

Commands (the kit is picked when the project is made; [assets/kits/README.md](../assets/kits/README.md) lists which topics each kit fits):

1. **Topic card and fact sheet** in `topic.md`, after deciding the delivery form (film, silent loops for an article, or both): what goes in it and the fact sheet's format are in [process.md](../references/process.md) "Topic card and fact sheet".
2. **Narration and shared assets.** Write `shared/narration.json` (one object per line: `id`, `scene`, `text`, optional `pause`; length per character count: [voice README](../scripts/voice/README.md) "Input") and optionally `shared.json`, then
   `uv run <SKILL_ROOT>/scripts/voice/voice.py all --dir <film>/shared` → voice per line, `timeline.json`, `audio/vo.wav`, `words.json`, temporary music and sound cues, `contract.json`, fonts. The kit's `demo-shared/` is a complete example.
3. **Brief.** Fill [brief-template.md](../references/brief-template.md): the result wanted, segments and learning goals, files to read, per-segment requirements (the picture's action line by line), hard requirements with who measures each, the hand-back.
4. **Director sets up the project.**
   `node <SKILL_ROOT>/scripts/new-film-teach.mjs <film>/<version> [--kit terminal-ledger | blueprint-zoom]` copies the kit's starter (and fetches GSAP and the kit's other libraries); inside it
   `npm run init -- --shared ../shared --segments "<id>:<firstLine>-<lastLine>,…" --title "<film title>"` cuts 2–3 segments by line IDs and writes `film.json`, the `handoff.json` skeleton, stand-in segments and `anchors.txt`. The director fills `handoff.json` (each segment's goal, hand marks, first and last state and the objects handed over; small objects no segment animates go under `persist`), picks anchor words in `anchors.txt`, marking with `!` each state change the narration names, runs `npm run anchors`, and `npm run check -- --no-hf` must pass.
5. **Segment makers** (2–3 in parallel), each writing only `segments/<id>.js` from the kit's `CARD.md` and `ref/look.jpg` (`assets/kits/<kit>/`). Done when `npm run check -- --seg <id>` ends in `pass` and `npm run shots -- --seg <id>` looks right.
6. **Assembly.** The director takes the makers' notes, fixes the seams, and runs the full `npm run check` (needed for the film-wide hand-mark count).
7. **Render.** `npm run render`, then `npm run finish` → `renders/film.mp4`, poster, contact sheet; every line must be PASS (spec, caption band, every sound cue mixed, −14 LUFS, true peak ≤ −1.5 dBTP, full decode).
8. **Review packet and independent check.** `node <SKILL_ROOT>/scripts/review-packet.mjs <project>` → at most 20 images (with a before / during / after row for each state change marked `!`) and an `index.md`. A fresh agent that did not make the film checks facts, learning goals, acted-out state changes and the brief's taste requirements, and writes `check-report.md` ([roles.md](../references/roles.md), "What the checker checks").
9. **Rework** by each segment's original maker, then steps 7–8 again; at most two rounds, then open items go to the user as known issues.
10. **Hand to the user** as one page: the film, its contact sheet, at most three decisions, known issues, and "not yet watched by the audience" until someone from it who does not yet know the mechanism has.

### Silent loops for an article

`uv run <SKILL_ROOT>/scripts/voice/voice.py fonts --dir <fonts>` (or reuse a film's shared assets), then `new-film-teach`, then `npm run web-init -- <unit id> <seconds> [hand marks] <fonts>` instead of `init`; the unit's rules are in CARD.md's last section, and `npm run check`, `render`, `finish` work as for a film.

## Where to read

| Need | Read |
|---|---|
| Content and picture rules, what counts as understood, captions, on-screen language, presenter, tools | [teaching.md](../references/teaching.md) |
| The route from topic to final, the three user reviews, the topic card and fact sheet format, rule conflicts, recording the narration | [process.md](../references/process.md) |
| Director / segment / renderer / checker split, concurrency, rework, what each hands back | [roles.md](../references/roles.md) |
| Writing the brief for the agents | [brief-template.md](../references/brief-template.md) |
| Narration input, shared assets, re-timing to a recording | [scripts/voice/README.md](../scripts/voice/README.md) |
| The kits and the topics each fits; what a kit is; how to extract a new one from an approved film | [assets/kits/README.md](../assets/kits/README.md) |
| A kit as a recipe: its look, recommended bricks, ban list, kit → bricks, its English and Chinese type | [recipes/terminal-ledger.md](../references/recipes/terminal-ledger.md), [recipes/blueprint-zoom.md](../references/recipes/blueprint-zoom.md) |
| terminal-ledger: project layout, every `npm run` command, handoff contract, engine version, measurements, limits | [assets/kits/terminal-ledger/README.md](../assets/kits/terminal-ledger/README.md) |
| blueprint-zoom: its look, components, Rough.js, measurements, limits | [assets/kits/blueprint-zoom/README.md](../assets/kits/blueprint-zoom/README.md) |
| Writing a segment (the one page segment makers read) | the kit's `CARD.md`: [terminal-ledger](../assets/kits/terminal-ledger/CARD.md), [blueprint-zoom](../assets/kits/blueprint-zoom/CARD.md) |
| Check scripts: geometry and measurable brief rules; delivery spec; review packet | header comments of [scripts/geo-check.cjs](../scripts/geo-check.cjs), [scripts/unit-check.sh](../scripts/unit-check.sh), [scripts/review-packet.mjs](../scripts/review-packet.mjs) (usage only, not the source) |
| Proving the scripts still work | `node <SKILL_ROOT>/scripts/selftest-teach/run.mjs` (every case PASS) |

## Gotchas

- **Segments are large.** Cut 2–3 segments of about a minute, never a dozen: each segment costs the director a contract entry and a note.
- **At most 3 agents at once**, the renderer included; more hit request-rate limits and redo work through retries.
- **The checker is always fresh**; a maker checking its own work approves it. Rework goes back to the maker that holds the context.
- **Generated files.** `index.html` is regenerated on every command and `cues.js` by `npm run anchors`; edit `anchors.txt`, not `cues.js`. Segment makers do not edit `main.js`, `lib.js`, `tokens.js`, `components/` or `build/`: `npm run kit-sync` keeps them in step with the kit and overwrites changes.
- **No empty opening.** geo-check reports any blank (≥ 0.2 s) or sparse (≥ 0.5 s) stretch, frame 0 included: place the opening state with `init` so it is there at frame 0, rather than fading everything in.
- **Exemptions are per element.** `data-geo-allow` / `data-layout-allow-*` on one element with a reason, never on a layer.
- **Handoffs.** A segment's last frame must match its `last` in `handoff.json` (every item given, within 6 px of its box, visible and not covered); `ctx.take` returns a stand-in when the previous segment is not built, so every segment can be written and checked alone. Elements created later cover earlier ones in the same layer, stand-ins included: list and take a window before what sits inside it.
- **Moving the skill.** A project records the skill folder in `film.json` `skill`; after moving the skill, edit it or set `FILMSMITH_ROOT`.
- **First runs are slow**: the whisper model, Chrome and fonts download once; later runs reuse them.

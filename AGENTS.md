# AGENTS.md — filmsmith

Public repository of **Filmsmith**, a collection of agent skills that make videos in code. Each skill is one folder under `skills/` and is installed on its own, by the [skills CLI](https://github.com/vercel-labs/skills) (`npx skills add coder-xieshijie/filmsmith --skill <name>`) or by linking the folder into an agent's skills folder. Repository docs are in English; `README.zh-CN.md` mirrors `README.md`, so change both together.

## Rules

- **A skill folder is self-contained.** An install copies or links only `skills/<name>/`, so nothing inside it links to, imports or runs a path outside it. Repository docs link into the skills, never the other way.
- **Frontmatter.** `name` equals the folder name. `description` says only what the skill does and when to use it; `descriptions.zh-Hans` mirrors it and `displayNames.zh-Hans` gives the Chinese name. The repository root holds no `SKILL.md`: the skills CLI would take the root as the only skill and skip `skills/`.
- **Agent-general.** No file assumes one coding agent.
- **Media stays out of Git** (video, audio, fonts); finished demo films go to Releases. Images for the README go under `docs/<skill>/`.
- **Changelog.** Each change to a skill adds a line under "Unreleased" in `CHANGELOG.md`, starting with the skill's name; a change to the collection itself starts with "repo".
- **A new skill** gets its folder, a row in the table and a section in both READMEs, a job in `.github/workflows/check.yml`, and its downloads in `THIRD-PARTY.md`.

## Layout

- `skills/keynote-video/`: short music-driven films for technical products in sixteen styles, English on-screen text, no voice-over. Its `SKILL.md` lists its files.
- `skills/teach-video/`: Chinese explainer films that teach one technical idea to developers who know the basics, with a narrated voice-over. Its `SKILL.md` lists its files.
- `README.md`, `README.zh-CN.md`: the collection, install, and one section per skill (what it makes, gallery, quick start).
- `docs/keynote-video/`: `previews/` holds six-second animated previews of each style's demo for the README (full films are linked on YouTube; the original ten MP4s are also in the v0.1.0 Release); `showcase.jpg` is the README's still of all sixteen styles, one still per mode from `skills/keynote-video/references/modes/stills/`.
- `docs/social-preview.jpg`: the repository's social preview (1280×640 at 2×, sixteen named keynote-video stills beside the name), uploaded by hand in the GitHub settings.
- `THIRD-PARTY.md`: what each skill downloads at setup and under which licence. `CONTRIBUTING.md`: how to change a skill. `CHANGELOG.md`: changes to every skill.
- `.github/`: issue and pull-request templates, and the CI check (skill frontmatter, then one job per skill).

## keynote-video

- Check a change with `node skills/keynote-video/scripts/selftest.mjs` (all sixteen templates; `--modes <mode>` for the ones touched).
- Taste lives in `references/`: `foundations.md` (theory), `principles.md` (core principles), `transitions.md` (the transition library), `modes/` (one card per visual language, each with a template under `assets/templates/`) and `themes/` (narrative skeletons and rules). The author's verdicts are kept verbatim in a private workshop, not here; principles, modes and rules cite them by date.
- A verdict does not edit a mode card or the principles directly: place it on a layer of the pyramid and apply [who decides](skills/keynote-video/references/foundations.md#who-decides); show the owner any conflict with the theory, propose the edit citing the verdict's date, and apply it once agreed.

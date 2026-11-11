# AGENTS.md — filmsmith

Public repository of **Filmsmith**, an agent skill that makes videos in code. The skill is one folder, `skills/filmsmith/`, installed by the [skills CLI](https://github.com/vercel-labs/skills) (`npx skills add coder-xieshijie/filmsmith`) or by linking the folder into an agent's skills folder. Repository docs are in English; `README.zh-CN.md` mirrors `README.md`, so change both together.

## Rules

- **The skill folder is self-contained.** An install copies or links only `skills/filmsmith/`, so nothing inside it links to, imports or runs a path outside it. Repository docs link into the skill, never the other way.
- **Frontmatter.** `name` equals the folder name. `description` says only what the skill does and when to use it; `descriptions.zh-Hans` mirrors it and `displayNames.zh-Hans` gives the Chinese name. The repository root holds no `SKILL.md`: the skills CLI would take the root as the only skill and skip `skills/`.
- **Two pipelines, one library.** `SKILL.md` routes to `pipelines/launch.md` or `pipelines/teach.md`; everything else is shared. A change belongs to exactly one of the three: a rule both pipelines keep goes in `SKILL.md`, a workflow or a rule only one pipeline keeps goes in its file, and a facility (a brick, a script, a reference page) goes where its users are.
- **Bricks are shared.** `assets/runtime/bricks/index.json` carries each brick's `hosts`; `launch` and `teach` are the two values, and a brick whose hosts do not name a pipeline is not used there.
- **Agent-general.** No file assumes one coding agent.
- **Media stays out of Git** (video, audio, fonts); finished demo films go to Releases. Images for the README go under `docs/`.
- **Changelog.** Each change adds a line under "Unreleased" in `CHANGELOG.md`, starting with `launch`, `teach` or "repo".

## Layout

- `skills/filmsmith/`: the skill. `SKILL.md` is the router; `pipelines/launch.md` and `pipelines/teach.md` are the two workflows; `references/` is the theory and the rules; `assets/runtime/` is the shared runtime and the brick library; `assets/templates/` is one renderable template per launch style; `assets/kits/` is the teach style kits; `scripts/` holds every command both pipelines run. Its `SKILL.md` lists every file.
- `README.md`, `README.zh-CN.md`: the collection, install, and one section per pipeline (what it makes, the styles, quick start).
- `docs/launch/`: `previews/` holds six-second animated previews of each style's demo for the README (full films are linked on YouTube; the original ten MP4s are also in the v0.1.0 Release); `showcase.jpg` is the README's still of the first sixteen styles (stream is not yet in it), one still per mode from `skills/filmsmith/references/modes/stills/`.
- `docs/social-preview.jpg`: the repository's social preview (1280×640 at 2×, sixteen named launch stills beside the name), uploaded by hand in the GitHub settings.
- `THIRD-PARTY.md`: what the skill downloads at setup and under which licence. `CONTRIBUTING.md`: how to change the skill. `CHANGELOG.md`: changes.
- `.github/`: issue and pull-request templates, and the CI check (frontmatter, then syntax of every script).

## Taste and checks

- Check a change with `node skills/filmsmith/scripts/selftest.mjs` (every launch template; `--modes <mode>` for the ones touched) and `node skills/filmsmith/scripts/selftest-teach/run.mjs` (the teach kits and the checks).
- Taste lives in `references/`: `foundations.md` (theory), `principles.md` (core principles), `system.md` (shared values and the language rules), `creative.md` (composing a film), `bricks.md` (the brick catalogue; each brick's card sits beside its code in `assets/runtime/bricks/`), `transitions.md` (the transition library), `teaching.md` (what counts as understood in a teach film), `recipes/` (one recipe per style), `modes/` (one card per launch style's template under `assets/templates/`) and `themes/` (narrative skeletons and rules). The author's verdicts are kept verbatim in a private workshop, not here; principles, modes and rules cite them by date.
- A verdict does not edit a recipe, a mode card or the principles directly: place it on a layer of the pyramid and apply [who decides](skills/filmsmith/references/foundations.md#who-decides); show the owner any conflict with the theory, propose the edit citing the verdict's date, and apply it once agreed.

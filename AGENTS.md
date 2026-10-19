# AGENTS.md — filmsmith

Public repository of one agent skill, **Filmsmith**; the repository root is the skill: short technical films drawn and scored entirely in code by any coding agent. Repository docs are in English; `README.zh-CN.md` mirrors `README.md`, so change both together.

## Layout

- `SKILL.md`, `references/`, `assets/`, `scripts/`: the skill. The repository root is its single maintained source; installs link to it.
- `README.md`, `README.zh-CN.md`: the gallery of styles, install and quick start.
- `THIRD-PARTY.md`: what is downloaded at setup and under which licence. `CONTRIBUTING.md`: how to change the skill.
- `assets/showcase.jpg`: the README's still of all ten styles (one still per mode from `references/modes/stills/`).
- `.github/`: issue and pull-request templates, and a CI check (script syntax and the timing tests).

## Rules

- Media (video, audio, fonts) stays out of Git; finished demo films go to Releases.
- Taste lives in `references/`: `foundations.md` (theory), `principles.md` (core principles), `transitions.md` (the transition library), `modes/` (one card per visual language, each with a template under `assets/templates/`) and `themes/` (narrative skeletons and rules). The author's verdicts are kept verbatim in a private workshop, not here; principles, modes and rules cite them by date.
- The skill is agent-general: no file assumes one coding agent.
- Add a line to `CHANGELOG.md` under "Unreleased" for each change to the skill.

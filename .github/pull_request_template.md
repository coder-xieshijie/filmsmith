## Summary

-

## What changed

-

## Skill

<!-- keynote-video, teach-video, or repo -->

## Checks

- [ ] The skill's own checks pass (see `CONTRIBUTING.md`)
- [ ] keynote-video, in `skills/filmsmith`: `node scripts/selftest.mjs` passes (all seventeen templates), or `--modes <mode>` for the ones touched
- [ ] keynote-video template change: `npm run film` and `node <skill>/scripts/check-film.mjs renders/film.mp4 --film-dir .` with 0 FAIL; stills or the contact sheet attached
- [ ] keynote-video runtime change: `node --test assets/runtime/test/timing.test.mjs`; for hand-offs and transitions, their self-tests
- [ ] Nothing inside `skills/<name>/` points outside it
- [ ] A line in `CHANGELOG.md` under "Unreleased", starting with the skill's name; `README.zh-CN.md` mirrors any README change

## Notes

Trade-offs, limitations or follow-up work:

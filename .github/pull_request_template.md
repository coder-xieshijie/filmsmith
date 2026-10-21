## Summary

-

## What changed

-

## Checks

- [ ] `node scripts/selftest.mjs` passes (all sixteen templates), or `--modes <mode>` for the ones touched
- [ ] For a template change: `npm run film` and `node scripts/check-film.mjs renders/film.mp4 --film-dir .` with 0 FAIL; stills or the contact sheet attached
- [ ] For a runtime change: `node --test assets/runtime/test/timing.test.mjs`; for hand-offs and transitions, their self-tests
- [ ] A line in `CHANGELOG.md` under "Unreleased"; `README.zh-CN.md` mirrors any README change

## Notes

Trade-offs, limitations or follow-up work:

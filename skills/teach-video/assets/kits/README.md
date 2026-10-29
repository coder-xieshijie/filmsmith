# Style kits

A kit turns one approved look into components, a starter project and a one-page card, so a film is made by copying the starter and writing only segments, never rebuilding the timeline library, check scripts and layout each time.

| Kit | Look | Fits |
|---|---|---|
| [terminal-ledger](terminal-ledger/README.md) | light terminal windows on paper × a ruled ledger of hand-drawn dots | software and AI work: sessions, logs, counts of events, sorting, decisions |

## What every kit contains

```
<kit>/
  README.md        origin (which approved film, when), project layout, commands, handoff contract, engine version, measurements, known limits
  CARD.md          one page for segment agents: the look, one line per component, segments and handoffs, hard requirements, commands, what not to read
  ref/look.jpg     the approved look as one contact sheet (long side ≤ 2000), each cell naming the moment or component; agents look only at this for the look
  demo-shared/     narration.json, shared.json and the generated timeline/words/contract JSON for the demo segments (audio and fonts are regenerated)
  starter/         the HyperFrames project scripts/new-film.mjs copies
    tokens.js      colours, fonts, sizes, spacing, no-go zones — the only place they are set
    lib.js         paused main timeline, stateful tweens (any seek gives the same frame), deterministic randomness
    components/    one file per component, usage in its header; looks taken from the approved film's code, not redesigned
    main.js        mounts handoff.json's segments and gives each a ctx (take / give / hit)
    segments/      one file per segment; one or two demo segments (demo-*, deleted by npm run init)
    handoff.json   the segment and handoff contract
    film.json      length, shared assets, presenter windows, poster
    anchors.txt    narration anchors → cues.js
    build/         init, anchors, check, shots, render, finish, kit-sync, vendor, browser; hf.cjs holds the engine version
    package.json   npm run init / anchors / check / shots / render / finish / kit-sync / hf
```

Interfaces other parts rely on (change them only together with the scripts and docs that read them): `starter/`, `npm run check` / `shots` / `render` / `finish` / `hf`, `build/hf.cjs` and `build/browser.cjs` (the review packet and geo-check use them), one marker per segment in index.html (`#mk-<segment>`, `data-beat`), `segments/<id>.js` (`defineSegment(id, build)`, `build(ctx)` schedules inside `[start, end]`), `handoff.json` (`segments[]` with `id`, `start`, `end`, `lines`, `goal`, `first`, `last`, optional `hands`; optional `seams[]` and `persist`), `anchors.txt` → `cues.js` (`window.CUES.T`, and `CUES.CHANGES` for the state changes the review packet shows), the shared-assets directory (`timeline.json`, `words.json`, `contract.json` from `scripts/voice/voice.py`), and `CARD.md`.

## Extracting a new kit from an approved film

1. Start from a film the user approved and its look board (palette, sizes, components, transitions, each pointing at a frame). Move only what was approved; do not redesign on the way.
2. Copy `terminal-ledger/starter/` as the skeleton: `lib.js`, `main.js` and `build/` carry no style and stay; replace `tokens.js`, `style.css` and `components/`.
3. Take the components from the film's code: one picture unit per file, positions and times as parameters, three to five lines of usage at the top; for every object that can cross a segment boundary write `F.standIn.<kind>`, so the next segment can start before the previous one exists.
4. Write one or two demo segments that recreate the approved film's most typical 15–25 seconds with neutral, illustrative content, and make `npm run check` pass; compare fonts, colours and sizes with `npm run hf -- snapshot --against <approved mp4> --at <t>`.
5. Make `ref/look.jpg` with `npm run shots -- --at …` (demo moments plus a frame for each component the demo does not show), write CARD.md and README.md (with measurements: minutes and rounds from copying the starter to a passing demo).
6. Add a row to the table above, and make the selftest's kit-demo case cover it.

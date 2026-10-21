// content.js — the film. The only file edited for an ordinary film: the palette, the real assets with their manifest,
// and the scenes. See TEMPLATE.md for every slot and its limit; `npm run fit` validates this file, `npm run assets`
// checks the assets and the quoted lines against it (hashes, sizes, a frame decoded again from its film, every quoted
// line verbatim in its file, the zoom cap, no people), `npm run palettes` checks the seam against every result region.
//
// The example: Filmsmith, made from its own files. Every asset is the skill's own output: frames of four demo films
// (the v0.1.0 release MP4s), two renders of the halftone template at one instant in two palettes, and the README as
// the repository page shows it. The quoted lines are the skill's own files; the report lines are what
// scripts/check-film.mjs prints for the pulse demo's MP4. Asset coordinates are in each file's own pixels.
export default {
  palette: 'diff',
  seam: 'straight',            // form variant: 'straight' (default) | 'stitched' (the seam as a cut line of dashes)
  // edges: 'cut',             // a cut-down for a reel: may open on a file and end on a diff (TEMPLATE.md, Shortest cut)
  seed: 3,
  // bpm: 120,                  // 112–128; default from timing.rules.js
  // target: 30,                // seconds; the tempo moves inside its range to meet it
  // moves: { open: 'split-open', change: 'louvre', push: 'seam-push', wipe: 'wipe-line', branch: 'split-branch', slide: 'diff-slider' },
  meta: { title: 'Filmsmith — split', url: 'github.com/coder-xieshijie/filmsmith' },

  // The manifest: every real asset, kept as captured; the film only crops it to its pane and scales it within the cap.
  // kind: 'frame' (a frame of a rendered film: from { film, at, crop? }), 'render' (a still the product rendered),
  // 'page' (a captured page). focus: the point (file px) kept in view when the asset is larger than its pane.
  assets: {
    ink: {
      file: 'ink-0026.webp', size: [1920, 1080], kind: 'frame', focus: [530, 540],
      from: { film: 'filmsmith-ink.mp4', at: 26 }, chip: 'filmsmith-ink.mp4 · 0:26',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 26, encoded once (webp 0.9)',
      sha256: 'fbb0b137b09be26a22de9fc2fac6be69b23547dc7ff05bb0b3860ff482ee18ff',
      claim: 'a film the skill made (the Ink demo)', people: 'none (a code-drawn film)',
    },
    blueprint: {
      file: 'blueprint-0325.webp', size: [1040, 1080], kind: 'frame', focus: [510, 540],
      from: { film: 'filmsmith-blueprint.mp4', at: 32.5, crop: [880, 0, 1040, 1080] }, chip: 'filmsmith-blueprint.mp4 · 0:32',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 32.5, crop 880,0,1040,1080, encoded once (webp 0.85)',
      sha256: '59324a7268fd68a0cede8e54e02eb0d74a30abbdeea1948d175a061290ccd069',
      claim: 'a second style (the Blueprint demo)', people: 'none (a code-drawn film)',
    },
    phosphor: {
      file: 'phosphor-0009.webp', size: [1920, 1080], kind: 'frame', focus: [960, 540],
      from: { film: 'filmsmith-phosphor.mp4', at: 9 }, chip: 'filmsmith-phosphor.mp4 · 0:09',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 9, encoded once (webp 0.9)',
      sha256: 'ff120b042b6431764ad42441cacf831ab023c41d9c044e71fc40a8165a330d6a',
      claim: 'a third style (the Phosphor demo)', people: 'none (a code-drawn film)',
    },
    which: {
      file: 'pulse-0001.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 0.85 }, chip: 'filmsmith-pulse.mp4 · 0:00.9',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 0.85, encoded once (webp 0.9)',
      sha256: 'bda05210a598d792a36f9e192e84562d1a4aa846e61923af88bd87c1e0e1f4cf',
      claim: "the word that line 17 of the pulse template's content.js puts on screen", people: 'none (a code-drawn film)',
    },
    build: {
      file: 'pulse-0002.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 1.45 }, chip: 'filmsmith-pulse.mp4 · 0:01.5',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 1.45, encoded once (webp 0.9)',
      sha256: 'afc1419f629edf90dd5eac52844ae09018ac0ce19b911bf90afdd6198eec8a75',
      claim: 'the word line 18 puts on screen', people: 'none (a code-drawn film)',
    },
    rebuilds: {
      file: 'pulse-0003.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 2.2 }, chip: 'filmsmith-pulse.mp4 · 0:02.2',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 2.2, encoded once (webp 0.9)',
      sha256: '5ae4877c7605f117be45c57d238ef95065f16813f5dc9e14a0f3c97649342650',
      claim: 'the word line 19 puts on screen', people: 'none (a code-drawn film)',
    },
    in40: {
      file: 'pulse-0014.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 14.2 }, chip: 'filmsmith-pulse.mp4 · 0:14',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 14.2, encoded once (webp 0.9)',
      sha256: 'd2a3c03ddb8a34ac6a59601449a8a2bd3ff752dd26bfb90f4f4200658e045fa2',
      claim: 'the rendered film whose report is quoted', people: 'none (a code-drawn film)',
    },
    anedit: {
      file: 'pulse-0015.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 15.2 }, chip: 'filmsmith-pulse.mp4 · 0:15',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 15.2, encoded once (webp 0.9)',
      sha256: 'd1b5423aeaf157d70c8ff593322708faaae16039300ddf5d805a15a6618a3a40',
      claim: 'the rendered film', people: 'none (a code-drawn film)',
    },
    only: {
      file: 'pulse-0016.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 16.2 }, chip: 'filmsmith-pulse.mp4 · 0:16',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 16.2, encoded once (webp 0.9)',
      sha256: 'bfccaf686dbcc9a59297038a3b7ac5d3aa4ee7e833a20be96a69fbcf0b6482a7',
      claim: 'the rendered film', people: 'none (a code-drawn film)',
    },
    answer: {
      file: 'pulse-0021.webp', size: [1920, 1080], kind: 'frame', focus: [660, 680],
      from: { film: 'filmsmith-pulse.mp4', at: 21 }, chip: 'filmsmith-pulse.mp4 · 0:21',
      captured: '2026-10-21', how: 'tools/capture.mjs frame: ffmpeg -ss 21, encoded once (webp 0.9)',
      sha256: '8c1f85698fbfacb28fb1f149878d5290f2dfe97d48e645b24b69ff08045cc2da',
      claim: 'the rendered film (its answer)', people: 'none (a code-drawn film)',
    },
    cyan: {
      file: 'halftone-cyan-0002.webp', size: [1920, 1080], kind: 'render', focus: [960, 670],
      chip: "before · palette: 'cyan'",
      captured: '2026-10-21', how: "the halftone template as shipped (palette: 'cyan'): npm run snapshot -- --at 2.5; tools/capture.mjs image (webp 0.9)",
      sha256: '0ca58684119ffcde8bd669deb6c12e9b3f374f75d835a4cf428d2e5e5f7d83e4',
      claim: 'the frame before the one-line edit', people: 'none',
    },
    reverse: {
      file: 'halftone-reverse-0002.webp', size: [1920, 1080], kind: 'render', focus: [960, 670],
      chip: "after · palette: 'reverse'",
      captured: '2026-10-21', how: "the same template with line 18 set to palette: 'reverse', nothing else; same command",
      sha256: 'c12a8d02c0c3b862c58c90346b737ef1c99eaf7b7ad8ae6e264af2aa2486bb55',
      claim: 'the same frame after the one-line edit', people: 'none',
    },
    readme: {
      file: 'readme-top.webp', size: [1676, 968], kind: 'page', source: 'github.com/coder-xieshijie/filmsmith',
      chip: 'github.com/coder-xieshijie/filmsmith · 2026-10-21',
      captured: '2026-10-21', how: 'tools/capture.mjs page: headless Chrome, 1280 css px wide, 2×, logged out, en-US, the README article to its first image, webp 0.9',
      sha256: '97bfef889cae2dba4bf74442eba192308c83a3f74b3a2c76c33a17b5fa0ee220',
      claim: 'the README as published: the tagline, "Pick a style, fill one file, render.", the ten styles', people: 'none (the article only: no avatar, no account row)',
    },
  },

  scenes: [
    // the request types; its caret runs to the seam and stands up; the first result slides out of the seam (the hook)
    { type: 'request', label: 'README.md · quick start', prompt: 'Use filmsmith.', result: 'ink', claim: ['Ten ways', 'to film your code.'] },
    // a list on the input side; the tick moves and the result follows: a louvre for the first change, a push after
    {
      type: 'pick', label: 'SKILL.md · modes', claim: 'Pick a style,',
      list: ['thread', 'ink', 'plakat', 'blueprint', 'phosphor', 'tally', 'trace', 'morph', 'halftone', 'pulse'],
      picks: [{ item: 'ink', result: 'ink' }, { item: 'blueprint', result: 'blueprint' }, { item: 'phosphor', result: 'phosphor' }],
    },
    // a wipe line brings real lines of a real file over the frames they made; the underline pairs a token with its frame
    {
      type: 'file', label: 'assets/templates/pulse/content.js', claim: 'fill one file,',
      source: { file: 'assets/templates/pulse/content.js', from: 16 },
      lines: [
        "    { type: 'ask', words: [",
        "      { text: 'which', param: '$ quench bench' },",
        "      { text: 'build', param: '--builds 3.7,3.8,3.9' },",
        "      'rebuilds',",
      ],
      pairs: [{ line: 1, token: "'which'", result: 'which' }, { line: 2, token: "'build'", result: 'build' }, { line: 3, token: "'rebuilds'", result: 'rebuilds' }],
    },
    // the seam branches: the command above, the film and its report below
    {
      type: 'render', label: 'terminal', command: '$ npm run film', claim: ['render,', 'measured.'],
      results: ['in40', 'anedit', 'only', 'answer'],
      report: {
        label: 'check-film filmsmith-pulse.mp4', source: { film: 'filmsmith-pulse.mp4', tool: 'scripts/check-film.mjs' },
        lines: [['PASS', 'loudness', '-14 LUFS'], ['PASS', 'true peak', '-2.1 dBTP'], ['PASS', 'short-term max', '2.8 LU'], ['PASS', 'black frames', '0']],
        result: 'result: PASS',
      },
    },
    // the climax: one changed line, the same instant rendered in both palettes either side of the seam
    {
      type: 'diff', label: 'assets/templates/halftone/content.js', source: { file: 'assets/templates/halftone/content.js' },
      line: { n: 18, before: "  palette: 'cyan',", after: "  palette: 'reverse'," },
      before: 'cyan', after: 'reverse', claim: ['One line,', 'a new palette.'],
    },
    // the lock-up: a wipe line brings the install line and the published page; the seam closes in the last bar
    {
      type: 'lockup', label: 'README.md · quick start', name: 'Filmsmith', command: '$ npx skills add coder-xieshijie/filmsmith',
      url: 'github.com/coder-xieshijie/filmsmith', line: 'Drawn and scored in code.', result: 'readme',
    },
  ],
};

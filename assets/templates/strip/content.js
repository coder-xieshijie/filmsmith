// content.js — the film. The only file edited for an ordinary film: the palette, the films with their manifest, any
// captured page, and the scenes. See TEMPLATE.md for every slot and its limit; `npm run fit` validates this file,
// `npm run assets` checks the frames against it (hashes, lengths, the zoom cap, the pencil's colour rule, and, when
// the videos are at hand, each frame decoded again from its video).
//
// The example: the skill's own ten demo films (the v0.1.0 release), as a strip. Every frame was taken from those
// renders by tools/extract.mjs; the page at the end is the repository's README, captured by tools/capture.mjs.
export default {
  palette: 'lightbox',
  seed: 3,
  // bpm: 120,                 // 112–128; default from timing.rules.js
  // target: 28,               // seconds; the tempo moves inside its range to meet it
  // perfs: 'double',          // form variant: 'double' (default, sprocket holes along both edges) | 'single' (one row, a wide optical track)
  // moves: { advance: 'strip-advance', punch: 'gate-punch', pick: 'sheet-pick' },   // pluggable (TEMPLATE.md, "Moves")
  meta: { title: 'Filmsmith — ten ways to film your code', url: 'github.com/coder-xieshijie/filmsmith' },

  // The manifest: each film's gate frame, its contact row (one frame at the middle of every 4 s), and, for the film
  // the pencil picks, the frames it runs. `video` is where `npm run assets` looks to decode them again (optional).
  films: {
    thread: {
      name: 'Thread', video: 'filmsmith-thread.mp4', duration: 40, source: 'v0.1.0 release · filmsmith-thread.mp4',
      frame: { file: 'thread-frame.webp', at: 15, sha256: 'ad53c071bea3917cf94fa628a44c35c18f9bbef6b8f0c35935af53b5c5541747' },
      row: { file: 'thread-row.webp', times: [2,6,10,14,18,22,26,30,34,38], sha256: '97dd6b94f904cf59a8416d9501650f99bfecda0d65e96579e900c72e7eb9e839' },
    },
    ink: {
      name: 'Ink', video: 'filmsmith-ink.mp4', duration: 34.867, source: 'v0.1.0 release · filmsmith-ink.mp4',
      frame: { file: 'ink-frame.webp', at: 12.5, sha256: '57ebf194500888d134d66e5295aab57e39a5e03783d5e798ca4cdba876a5263e' },
      row: { file: 'ink-row.webp', times: [2,6,10,14,18,22,26,30,33.433], sha256: '08b9ccbf1cbbe1436b94e1678171490d2d40fd28d39d2ff78fb7f5f598725f2d' },
    },
    plakat: {
      name: 'Plakat', video: 'filmsmith-plakat.mp4', duration: 46, source: 'v0.1.0 release · filmsmith-plakat.mp4',
      frame: { file: 'plakat-frame.webp', at: 10, sha256: '888c29a48eb181a8d385a575fb7c0d1bb5352e5d0117cd0cdcee4a29f9318a49' },
      row: { file: 'plakat-row.webp', times: [2,6,10,14,18,22,26,30,34,38,42,45], sha256: '9be873d1a0193a29258fa47b9558e33f3ff3bd5bcd3650d228462fccd396f42f' },
    },
    blueprint: {
      name: 'Blueprint', video: 'filmsmith-blueprint.mp4', duration: 43.2, source: 'v0.1.0 release · filmsmith-blueprint.mp4',
      frame: { file: 'blueprint-frame.webp', at: 31, sha256: 'e1df31a4563137171bb1237c4bb32bbe96b7ce8b02f5d79b745c023c565f6cde' },
      row: { file: 'blueprint-row.webp', times: [2,6,10,14,18,22,26,30,34,38,41.6], sha256: 'a7ad91361ec13f01c1094be14195f30cf73943ce1b1c4d67d64fcc84fe5f669d' },
    },
    phosphor: {
      name: 'Phosphor', video: 'filmsmith-phosphor.mp4', duration: 42.6, source: 'v0.1.0 release · filmsmith-phosphor.mp4',
      frame: { file: 'phosphor-frame.webp', at: 8, sha256: 'ae601426a89795abaf9fe6ac7171d61d710d142ea29592c548a4e41ab31cd30f' },
      row: { file: 'phosphor-row.webp', times: [2,6,10,14,18,22,26,30,34,38,41.3], sha256: '979a14270ddff2d9b6dc102dbc66912abf1c7c5b8d7526a8bb6c29052f725a61' },
    },
    tally: {
      name: 'Tally', video: 'filmsmith-tally.mp4', duration: 32, source: 'v0.1.0 release · filmsmith-tally.mp4',
      frame: { file: 'tally-frame.webp', at: 14, sha256: 'c0ed3cba2ce279dbfa0b85e9583921f9b0ef667d668cdb59a683e1201e5d308c' },
      row: { file: 'tally-row.webp', times: [2,6,10,14,18,22,26,30], sha256: 'f7af6ecf56d02e6a5c05c49f7172315fa421c7e88e16da7cf13e80da10f7b4a5' },
    },
    trace: {
      name: 'Trace', video: 'filmsmith-trace.mp4', duration: 36, source: 'v0.1.0 release · filmsmith-trace.mp4',
      frame: { file: 'trace-frame.webp', at: 11.5, sha256: '9575479e133140b4d99b9aba6b2e6c31a0dac4c7f337d3464848e0c005a60a78' },
      row: { file: 'trace-row.webp', times: [2,6,10,14,18,22,26,30,34], sha256: '2d1205e5f40c71baf13169750288a51762ac4e7beceee6f419a996fd0672dde6' },
    },
    morph: {
      name: 'Morph', video: 'filmsmith-morph.mp4', duration: 32, source: 'v0.1.0 release · filmsmith-morph.mp4',
      frame: { file: 'morph-frame.webp', at: 20.5, sha256: 'b4ae8f44cea347a421fba98dcace548ec161b91680da1256888871b3ef5009e5' },
      row: { file: 'morph-row.webp', times: [2,6,10,14,18,22,26,30], sha256: '7386a5043f5d55627abe3000bcf5b470b858b743337dec7bdb6b59d61c578665' },
      run: { dir: 'morph-run', ext: 'webp', from: 14, fps: 30, frames: 61, sha256: 'ca41a6731cf91c4ad718c0bf971a5690ccd7b76c4c4c74197e20e0302d766218' },
    },
    halftone: {
      name: 'Halftone', video: 'filmsmith-halftone.mp4', duration: 32, source: 'v0.1.0 release · filmsmith-halftone.mp4',
      frame: { file: 'halftone-frame.webp', at: 2, sha256: 'ca0c114ba9d3225dd147307e1c2201eda51182307d2da2c2a4dc12c9f72bcbb8' },
      row: { file: 'halftone-row.webp', times: [2,6,10,14,18,22,26,30], sha256: '82c6e646bf66d37bc665560292b20d13f8b7bf575cc59cff76c8405e421dc67c' },
    },
    pulse: {
      name: 'Pulse', video: 'filmsmith-pulse.mp4', duration: 32, source: 'v0.1.0 release · filmsmith-pulse.mp4',
      frame: { file: 'pulse-frame.webp', at: 22, sha256: 'a874e7cb91ee1b8f33c7d346f99634aab3f5bd2c9d98948cf96996b975f6d32e' },
      row: { file: 'pulse-row.webp', times: [2,6,10,14,18,22,26,30], sha256: 'b74d608df579d1f26a47bc503b68ad13ed730a35d2d53da148cd568456e47988' },
    },
  },

  // Captured pages (a source frame at the end): cropped, scaled and veiled only.
  captures: {
    repo: {
      file: 'repo-readme.webp', crop: [0, 0, 1728, 972],
      source: 'github.com/coder-xieshijie/filmsmith · README',
      captured: '2026-10-21', how: 'tools/capture.mjs: headless Chrome at 2×, signed out, the README column from its heading to its showcase image',
      sha256: '549834e8236b623cf0f5531cc8e54bbe44bb314e9adac4add23f642c6594d986',
      claim: 'the skill is public there, and its README says every line this film says',
      expect: ['Ten ways to film your code.', 'every frame drawn in code', 'Pick a style, fill one file, render.'], forbid: [], people: 'none',
    },
  },

  scenes: [
    // the strip runs in and brakes on the first intertitle; three pull-downs read the hook
    { type: 'titles', hook: true, lines: ['Ten ways', 'to film', 'your code.'] },
    // two more intertitles; the optical track lights under the second
    { type: 'titles', lines: ['Drawn in code.', { text: 'Scored in code.', track: true }] },
    // a pull-down a beat: one frame of each film, its name under the gate
    { type: 'frames' },
    // the last frame punches to the full frame, holds, and shrinks into its cell on the contact sheet
    { type: 'punch' },
    // every film as a strip as long as the film; the measured lengths
    { type: 'sheet', lines: ['Length follows the content.', 'Every render is measured.'] },
    // the grease pencil rings one cell; it punches to full and the film runs from it (the climax)
    { type: 'pick', film: 'morph', cell: 3, caption: 'Pick a style.' },
    // back in the gate, the repository page; the strip runs out; the name and the address
    { type: 'lockup', source: 'repo', line: 'Runs in any coding agent.', name: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith' },
  ],
};

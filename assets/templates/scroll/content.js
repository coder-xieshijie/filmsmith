// content.js — the film. The only file edited for an ordinary film: the palette, the real assets with their manifest,
// the sheet (strips, quote bands and cuts, top to bottom), the headings that pin as chapters, and the scenes. See
// TEMPLATE.md for every slot and its limit; `npm run fit` validates this file, `npm run assets` checks the assets
// (hashes, what each strip must and must not show, one scale under the zoom cap, no people, the mark's colour),
// `npm run palettes` checks the mark against every marked region.
//
// The example films this skill's own README as it stood on its public repository page on 2026-10-21 (03:16 UTC): one
// full-page capture at device pixel ratio 2, cut into strips at one width and scaled to the sheet (1870 → 1496 px,
// 0.8), and 41 frames of the Ink demo the README's table links to. The README has changed since (it lists more
// styles); a re-capture shows the page as it is now. Boxes are in each file's own pixels.
const page = 'https://github.com/coder-xieshijie/filmsmith';
const how = 'tools/capture.mjs full page at scale 2 (1280 px viewport), then cut and scaled: ffmpeg crop=1870:h:32:y, scale ×0.8, cwebp -q 82';
const strip = (file, size, sha256, claim, expect, forbid = []) => ({
  file, size, sha256, source: `${page} (README, as rendered)`, captured: '2026-10-21', how, claim, expect, forbid, people: 'none',
  licence: 'this repository\'s own README (MIT); the page typography is the host\'s rendering',
});

export default {
  palette: 'slate',
  minimap: 'on',                 // form variant: 'on' (default, the whole sheet in a right-hand gutter) | 'off'
  seed: 5,
  bpm: 128,                      // 112–128 (default 120); at 128 the example's reel lands within 12 s of the unroll
  // target: 32,                 // seconds; the tempo moves inside its range to meet it
  // moves: { reel: 'scroll-reel', detent: 'scroll-reel', fling: 'scroll-fling', unfold: 'unfold', roll: 'roll' },
  meta: { title: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith' },

  // The manifest: every real asset, kept as captured (sha256); the film only crops, scales and veils it.
  assets: {
    masthead: strip('masthead.webp', [1496, 160], '44dfb099ff86bdf05d913d4cb89269ef69aae153c7653a8010883fffa5c297ad',
      'it is the real repository page', ['coder-xieshijie', 'filmsmith', 'Insights']),
    top: strip('readme-top.webp', [1496, 288], 'd1f76eecb08830f8e6ea5cb74ab91a79aa08f3a65f1ebd97cc42cba63c046e33',
      'the name and its line: "Ten ways to film your code."', ['Filmsmith', 'Ten ways to film your code']),
    intro: strip('intro.webp', [1496, 152], '45140789d6b004af8a023a603be57c886b1558b3707f2bc40e4890699b848721',
      'every frame drawn in code and every sound synthesised in code; any coding agent that can use a shell',
      ['every frame drawn in code', 'any coding agent that can use a shell']),
    styles: strip('styles.webp', [1496, 624], '7ed42f342eb05fed38784d1ccff5a2e0f725bb8251ca09b5b3d0cfcfc4dedd6c',
      'ten styles; each preview is a demo made with the skill itself', ['Ten styles', 'made with the skill itself']),
    'table-a': strip('table-a.webp', [1496, 636], '89c5bae5c03c71dc170344e839ae90edf588836ee5f65eb8bd599d7083b12721',
      'the first five styles', ['One line that becomes everything', 'Ink', 'Plakat', 'Blueprint', 'Phosphor']),   // the OCR misreads the link "Thread"; its description stands for it
    'table-b': strip('table-b.webp', [1496, 728], '014067c77d0dbb5c1bb98ab61d201df37b4e5f5e63c110b04df0112742f1ea15',
      'the other five styles', ['Tally', 'Trace', 'Morph', 'Halftone', 'Pulse']),
    how: strip('how.webp', [1496, 812], 'd688f24917e70c6ec0ca7b0380b6a2844b4ee39c7761d98e4bc14281c0c753e6',
      'Measured: check-film reports loudness, flashes, beat sync', ['How a film is made', 'Measured', 'beat sync']),
    ink: {
      frames: 'ink', count: 41, fps: 12, size: [1216, 684], from: 11.9,
      sha256: '58d0568d5f57b784851229b59cd2956d37810e5022f34ff05aaeeeb2defc5921',    // of the frames joined in order
      source: 'the Ink demo film (the README\'s Ink row links to it), 11.9–15.3 s', captured: '2026-10-21',
      how: 'node tools/frames.mjs <ink demo film.mp4> assets/real/ink --from 11.9 --to 15.3 --fps 12 --width 1216',
      claim: 'the Ink row\'s demo is a real film made with the skill', people: 'none',
      // a face the detector reports in a frame that a person has looked at and found none: WARN with the reason, not FAIL
      reviewed: { 'f025.webp': 'an ink cloud, no person (detector confidence 0.59)' },
      licence: 'this repository\'s own demo film (MIT)',
    },
  },

  // the sheet, top to bottom: strip ids (one width, one scale), quote bands, cuts (the ground shows: a splice)
  sheet: [
    'masthead', { cut: true }, 'top', { band: 'hook', size: 'hook' }, 'intro', { band: 'say' },
    'styles', 'table-a', 'table-b', { cut: true }, 'how', { band: 'measured' },
  ],
  // the page's own headings: each pins at the top as the chapter while its section scrolls under it
  heads: [
    { asset: 'top', box: [78, 5, 1341, 81] },          // Filmsmith
    { asset: 'styles', box: [78, 361, 1341, 61] },     // Ten styles
    { asset: 'how', box: [78, 9, 1341, 61] },          // How a film is made
  ],

  scenes: [
    // the roll drops; the underline finds the tagline; the hook band repeats it
    { type: 'open', band: 'hook', mark: { asset: 'top', rects: [[78, 247, 329, 29]] }, lines: [['Ten ways to'], ['film your code.']] },
    // a detent to the intro paragraph; the title pins as the first chapter
    { type: 'quote', move: 'detent', at: { asset: 'intro', y: 0 }, band: 'say', mark: { asset: 'intro', rects: [[107, 62, 798, 29]] },
      lines: [['Every frame,', 'drawn in code.'], ['Every sound,', 'synthesised in code.']] },
    // the underline moves one sentence on; the band's lines roll over
    { type: 'quote', band: 'say', mark: { asset: 'intro', rects: [[1283, 62, 100, 29], [78, 100, 436, 29]] },
      lines: [['Any coding agent'], ['that can use', 'a shell.']] },
    // a reel to "Ten styles", which locks as the chapter; the ten rows dock one a beat
    {
      type: 'ratchet', head: 1, rows: [
        { asset: 'table-a', box: [79, 63, 1339, 136], name: 'Thread' },
        { asset: 'table-a', box: [79, 199, 1339, 136], name: 'Ink' },
        { asset: 'table-a', box: [79, 335, 1339, 100], name: 'Plakat' },
        { asset: 'table-a', box: [79, 435, 1339, 100], name: 'Blueprint' },
        { asset: 'table-a', box: [79, 535, 1339, 100], name: 'Phosphor' },
        { asset: 'table-b', box: [79, 0, 1339, 100], name: 'Tally' },
        { asset: 'table-b', box: [79, 100, 1339, 100], name: 'Trace' },
        { asset: 'table-b', box: [79, 200, 1339, 174], name: 'Morph' },
        { asset: 'table-b', box: [79, 375, 1339, 174], name: 'Halftone' },
        { asset: 'table-b', box: [79, 549, 1339, 174], name: 'Pulse' },
      ],
    },
    // back to the Ink row, which opens in place on its own demo (the climax)
    { type: 'unfold', row: { asset: 'table-a', box: [79, 199, 1339, 136] }, frames: 'ink', caption: 'Made with the skill itself.', label: 'ink demo · 11.9–15.3 s' },
    // a long reel down to Measured
    { type: 'quote', move: 'reel', at: { asset: 'how', y: 733, screen: 672 }, band: 'measured',
      mark: { asset: 'how', rects: [[130, 733, 128, 29], [420, 733, 941, 29], [130, 772, 813, 29]] },
      lines: [['Measured:'], ['loudness,', 'flashes,', 'beat sync.']] },
    // fling to the top; the hook band takes the name; the address types; the roll winds the sheet up under it
    { type: 'lockup', band: 'hook', name: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith', mark: { asset: 'top', rects: [[78, 14, 236, 58]] } },
  ],
};

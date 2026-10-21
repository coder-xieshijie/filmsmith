// content.js — the film. The only file edited for an ordinary film: the palette, the real assets with their manifest,
// and the scenes. See TEMPLATE.md for every slot and its limit; `npm run fit` validates this file, `npm run assets`
// checks the assets against it (hashes, what they must and must not show, the numbers the film redraws, the zoom cap,
// no people), `npm run palettes` checks the pencil against every ringed region.
//
// The example: Filmsmith measuring one of its own films. Every asset is the skill's own output: the timing table
// `npm run fit` printed and the report `check-film` printed for the phosphor demo (captured as text, as printed), and
// a chart of the same render's short-term loudness. The chart is a stand-in drawn in code from the measured series,
// and says so on its face; a real film uses captured charts. Boxes are in each file's own pixels.
export default {
  palette: 'lightbox',
  seed: 3,
  // bpm: 120,                  // 112–128; default from timing.rules.js
  // target: 36,                // seconds; the tempo moves inside its range to meet it
  // desk: 'plain',              // form variant: 'plain' (default, a bare desk) | 'mat' (a cutting mat's grid under the exhibits)
  // moves: { open: 'bezel-pullback', lift: 'lift-out', travel: 'camera-truck', carry: 'value-carry' },   // pluggable (TEMPLATE.md, "Moves")
  meta: { title: 'Filmsmith — measured', url: 'github.com/coder-xieshijie/filmsmith' },

  // The manifest: every real asset, kept as captured; the film only crops, scales and veils it.
  assets: {
    fit: {
      file: 'fit-table.webp', crop: [0, 0, 3068, 1019],
      source: 'npm run fit · phosphor demo · timing table',
      captured: '2026-10-21', how: 'tools/capture.mjs text: the table as printed, 2.6×',
      sha256: '6d0bd56634cbb681b434d71956538544790b9f62eb46448b7f8e5919f4ce08dc',
      claim: 'the demo was fitted from its copy: 124 bpm, 22 bars, 42.581 s',
      expect: ['124 bpm', '22 bars', '42.581 s'], forbid: [], people: 'none',
    },
    report: {
      file: 'check-report.webp', crop: [0, 0, 2646, 779],
      source: 'check-film · phosphor demo · first 17 lines',
      captured: '2026-10-21', how: 'tools/capture.mjs text: the report as printed, 1.25×',
      sha256: '003e13749923148f4a4198747ea3ae5389d2e1e3f9d39d1343d4ee7573b5e7da',
      claim: 'the render measured -14.1 LUFS, -2.7 dBTP and 18 of 18 keys on the beat',
      expect: ['-14.1', '-2.7', '18/18', 'LUFS'], forbid: [], people: 'none',
    },
    chart: {
      file: 'loudness-chart.webp', crop: [60, 30, 1700, 930],
      source: 'stand-in chart drawn in code · measured short-term loudness',
      captured: '2026-10-21', how: 'drawn in code from ffmpeg ebur128 of the same render (a stand-in; a film uses a captured chart)',
      sha256: '29a37b2737786c20f7502c761218320de9eb360b3c16a9e9954814c7d5330854',
      claim: 'short-term loudness stays under the limit of I + 5 LU; its maximum is -12.1 LUFS',
      expect: ['-14.1 LUFS', 'max -12.1', 'limit'], forbid: [], people: 'none',
    },
  },

  scenes: [
    // the opening: the timing table first, at the zoom cap; the camera rises and its mount grows
    { type: 'open', exhibit: 'fit', focus: [700, 300], caption: 'Length follows the copy.' },
    // three readings lift out of the table's first line
    {
      type: 'read', exhibit: 'fit', caption: 'Fitted, never typed.',
      cells: [
        { box: [80, 84, 126, 84], glyph: [94, 105, 99, 41], value: '124', label: 'bpm', note: 'tempo from the content' },
        { box: [424, 84, 90, 84], glyph: [438, 105, 62, 41], value: '22', label: 'bars', note: 'every scene fitted' },
        { box: [766, 84, 230, 84], glyph: [780, 105, 202, 41], value: '42.581', label: 'seconds', note: 'the film\'s length' },
      ],
    },
    // the camera trucks to the report; three measured values lift out
    {
      type: 'read', exhibit: 'report', caption: 'Every render is measured.',
      cells: [
        { box: [544, 286, 112, 48], glyph: [553, 299, 84, 19], value: '-14.1', label: 'LUFS', note: 'gate -15 to -13' },
        { box: [544, 328, 100, 48], glyph: [553, 339, 67, 20], value: '-2.7', label: 'dBTP peak', note: 'gate -1.5' },
        { box: [544, 698, 112, 48], glyph: [557, 709, 80, 25], value: '18/18', label: 'beat-locked keys', note: 'within two frames' },
      ],
    },
    // the integrated loudness is carried to the chart's own label for it; the chart's reading lifts
    {
      type: 'carry', exhibit: 'chart',
      from: { box: [544, 286, 112, 48], glyph: [553, 299, 84, 19], value: '-14.1' },
      to: { glyph: [591, 438, 67, 24], ring: [556, 426, 210, 48] },
      card: { meta: 'short-term, 3 s window', value: '-12.1', line: 'LUFS at its loudest' },
    },
    // the gap from the integrated level to the maximum, measured on the chart's own axis (the climax)
    {
      type: 'measure', exhibit: 'chart', claim: true, caption: 'Two under a five-LU limit.',
      a: { point: [1529, 470], value: -14.1 }, b: { point: [1529, 391], value: -12.1 },
      label: '+{diff} LU', digits: 1,
    },
    // the lock-up: the camera rises over the whole desk; the name, its line, the address
    { type: 'lockup', name: 'Filmsmith', line: 'Films drawn and scored in code.', url: 'github.com/coder-xieshijie/filmsmith' },
  ],
};

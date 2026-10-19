// Alt example: the rle run (run-length encoding) with the same pieces, paper palette.
// Use it by copying this file over content.js; its length follows its copy (`npm run fit`).

export default {
  palette: 'paper',
  seed: 2,
  bpm: 100, // as the main example: most scenes take five beats, 3.0 s at 100 (api 3 median ≤ 3 s)
  meta: { title: 'Run-length encoding, row by row', url: '' },
  title: 'RLE',
  subtitle: 'run-length encoding, row by row',
  run: { module: 'rle', params: {} },
  hud: { step: 'row', a: null, b: 'symbols', before: 'row {k}', rules: 'encoded rows' },
  scenes: [
    { type: 'hook', caption: '{C0} pixels, one symbol each.' },
    { type: 'count', caption: ['Count each [[active|run]]', 'of equal pixels.'] },
    { type: 'step', step: 1, caption: 'Write runs as [[learned|count×value]].' },
    { type: 'loop', to: 3, caption: 'Same for every row.' },
    { type: 'loop', pace: 1, enter: 'path', caption: 'Repeat.' },
    { type: 'summary', enter: 'sweep', big: '{C0} → [[learned|{CN}]]' },
    { type: 'probe', enter: 'flow', captions: ['A row with no runs:', 'Noise grows: [[unseen|{P0} → {P1} symbols]].'] },
    {
      type: 'thesis',
      lines: ['Count the [[active|run]].', 'Write it [[learned|once]].', 'Noise does not shrink.'],
      stats: '{C0} → [[learned|{CN}]] symbols   ·   {RUNS} runs   ·   noise {P0} → [[unseen|{P1}]]',
    },
  ],
};

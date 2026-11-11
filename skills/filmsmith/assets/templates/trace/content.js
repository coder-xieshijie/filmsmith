// content.js — the film. The only file edited for an ordinary trace film.
// The picture is the state of a real run (runs/<module>.js); copy carries {PLACEHOLDERS} filled from it.
// Markup: [[active|…]] being counted or acted on, [[learned|…]] what the algorithm produced,
// [[unseen|…]] an input it never saw. See TEMPLATE.md for the scene registry and limits.
// Length follows the copy and the run: `npm run fit` prints each scene's bars (timing.rules.js). Optional:
// bpm (default 96, range 88–104), target (seconds; the tempo moves inside the range to meet it).
// A caption is one line: a string, or an array of phrases that enter one after another (≤ 5 words each; the probe's
// reveal, a claim, ≤ 8). `enter` on a scene: the expressive transition into it ('path', 'sweep', 'flow'); a loop's
// `pace`: beats a merge (2, or 1 for the compressed run into the climax).
// Variants (TEMPLATE.md): stroke 'vector' (default) | 'sketch' (hand-drawn outlines); edges 'fade' (default) | 'cut'
// (no fade at either end, for a film cut into a reel).
export default {
  palette: 'ink',
  seed: 1,
  // 100 bpm: api 3 wants the median composition ≤ 3 s, and most trace scenes take five beats, 3.0 s at 100; at the
  // default 96 they are 3.1 s (TEMPLATE.md, Length and tempo)
  bpm: 100,
  meta: { title: 'BPE: how a tokenizer learns its pieces', url: '' },
  title: 'BPE',
  subtitle: 'how a tokenizer learns its pieces',
  run: {
    module: 'bpe',
    params: { corpus: [['low', 5], ['lower', 2], ['newest', 6], ['widest', 3]], merges: 6, probe: 'lowest' },
  },
  // HUD words: step counter, the top-right counter (null hides it), the token bar's unit, list headings
  hud: { step: 'merge', a: 'vocab', b: 'tokens', before: 'before merge {k}', rules: 'learned merges' },
  scenes: [
    // bars by hand, for rhythm: a beat longer than the hook needs, so the thesis's bar line falls without a pad
    { type: 'hook', bars: 1.25, caption: '{W} words, {OCC} occurrences.' },
    { type: 'count', caption: ['Count every [[active|adjacent pair]],', 'weighted by its word.'] },
    { type: 'step', step: 1, caption: 'Top pair: [[active|{A1} + {B1}]] → [[learned|{T1}]]' },
    { type: 'step', step: 2, enter: 'flow', caption: 'Recount: [[active|{A2} + {B2}]] → [[learned|{T2}]]' },
    { type: 'loop', to: 4, caption: 'Recount, merge the winner.' },
    { type: 'loop', pace: 1, enter: 'path', caption: 'Repeat.' },
    { type: 'summary', enter: 'sweep', big: '{T0} → [[learned|{TN}]]' },
    { type: 'probe', reveal: 'flow', captions: ['An unseen word: [[unseen|{PROBE}]]', 'Learned pieces: [[learned|{ENC}]]'] },
    {
      type: 'thesis',
      lines: ['Count the [[active|most frequent pair]].', '[[learned|Merge]] it.', 'Repeat.'],
      stats: '{T0} → [[learned|{TN}]] tokens   ·   vocabulary {V0} → {VN}   ·   {N} merges',
    },
  ],
};

// Alt example: a text model, with its own mark and anchor. Use it by copying this file over content.js; its length
// follows its copy (`npm run fit`). The shipped content.js is a speech model whose anchor is a microphone capsule;
// nothing in the template is made for voice: the anchor is whatever `mark.accent` draws.
//
// The subject is made up for the template: "quire-3", a text model that reads a whole archive in one pass and
// answers with the page behind every sentence. Nothing here is a claim about a real product and every number is
// illustrative; replace all of it, the mark included.

// The mark, in mark units (y down; origin = the anchor's centre, which stays on one screen point all film).
// Here: a text cursor (the anchor, printed in the process ink) at the end of three lines of text (the black plate).
// The anchor is a detail that stands alone at 220 px: a bar, the shape of a caret, nothing else on it.
const W = 0.07, H = 0.3;     // the cursor: 0.07 × 0.3 (drawn 220 px high through the film, about 51 px wide)
const PITCH = 0.3, T = 0.1;  // the lines of text: one every 0.3, each 0.1 thick with round ends
const line = (x0, x1, y) => { // a line of text: a bar from x0 to x1 centred on y, round ends
  const r = T / 2, f = (v) => v.toFixed(4);
  return `M ${f(x0 + r)} ${f(y - r)} L ${f(x1 - r)} ${f(y - r)} A ${r} ${r} 0 0 1 ${f(x1 - r)} ${f(y + r)} L ${f(x0 + r)} ${f(y + r)} A ${r} ${r} 0 0 1 ${f(x0 + r)} ${f(y - r)} Z`;
};

export default {
  palette: 'cyan',
  seed: 20261020,
  meta: { title: 'quire-3 — halftone example (text model)', url: '' },
  mark: {
    accent: `M ${-W / 2} ${-H / 2} L ${W / 2} ${-H / 2} L ${W / 2} ${H / 2} L ${-W / 2} ${H / 2} Z`,
    // two full lines above; the third stops one gap short of the cursor (the text is still being written)
    ink: [line(-0.75, 0.35, -2 * PITCH), line(-0.75, 0.2, -PITCH), line(-0.75, -W / 2 - 0.06, 0)].join(' '),
    box: [-0.75, -0.65, 0.35, 0.15],           // the whole mark: three lines and the cursor
    anchorBox: [-W / 2, -H / 2, W / 2, H / 2], // the cursor
    // the mark has no arcs; the rings' spacing is the line pitch, so in the push-in each ring crosses a line of
    // text straight above the cursor before the pull-back lands it in the paragraph
    lambda: PITCH,
    ringAt: PITCH,
  },
  scenes: [
    // the problem, on paper: one cursor, one question against a pile of pages
    { type: 'hook', lines: ['Ask the whole', 'archive.'], label: 'one question · 900 pages' },
    // feature 1: it reads everything, then isolates the one passage (the field changes its function; same ground)
    { type: 'card', word: 'READ', line: 'all 900 pages at once', field: 'rows' },
    { type: 'card', word: 'FOUND', line: 'the clause on page 412', field: 'cells' },
    // the number, printed reversed out of ink: one cell per source
    { type: 'count', value: 14, from: 0, line: 'sources behind one answer', label: 'one answer · 6 paragraphs', to: 'quantize' },
    // feature 2: the cells quantize into rows of words; then the real exchange, prompt and answer, in mono
    { type: 'card', word: 'CITED', line: 'every line, its page', field: 'rows', ground: 'ink' },
    { type: 'card', word: 'ASK', line: '> notice period?', label: 'prompt · 4 tokens', mono: true, field: 'rings', to: 'scan' },
    { type: 'card', word: 'ANSWER', line: '30 days [412]', label: 'answer · 1 source', mono: true, field: 'rows' },
    // feature 3 and 4: the answer streams; the world inverts round the cursor onto the private machine
    { type: 'card', word: 'STREAMED', line: 'token by token', field: 'wave', to: 'invert' },
    { type: 'card', word: 'ON PREM', line: 'runs offline', field: 'grid', ground: 'ink' },
    // the claim: the archive collapses into the cursor, which writes the line
    { type: 'claim', lines: ['Every sentence,', 'with its source.'] },
    // pull back: the cursor was the end of the mark's last line
    { type: 'lockup', name: 'quire-3', line: 'text model · out today' },
  ],
};

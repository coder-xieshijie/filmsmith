// run.js — the run interface. A concept is one run module in runs/<name>.js; the renderer pieces (chips,
// histogram, rule list, token bar, camera, captions, thesis) draw whatever the run computes.
//
// A run module exports steps(params) and returns:
//
// {
//   rows:  [{ label: '×5', weight: 5, tokens: [Tok, ...] }],   // the board before the first step (1–6 rows)
//   steps: [{                                                   // one per algorithm step, in order
//     counts: { title: 'pair counts', items: [{ parts: [Tok, ...], value: 9,
//               from: [{ row: 0, w: 5, n: 1 }] }],              // how each value adds up (row weight × occurrences)
//               pick: 0, note: 'tie → …' | null },              // histogram shown before the step (optional)
//     hi:    [[row, index, length], ...],                       // chips the step acts on (shown as active)
//     rows:  [{ tokens: [Tok, ...], map: [[0], [1, 2], ...] }], // every row after the step; map[j] = old indices of new chip j
//     rule:  { parts: [Tok, ...], value: '×9' },                // the line appended to the rule list
//     hud:   { a: 11, b: 70 },                                  // counters after the step (top right, token bar)
//   }],
//   probe: { label: 'new', tokens: [Tok, ...],                  // optional: an input the run never saw
//            steps: [{ rule: k | -1, tokens: [Tok, ...], map }], used: [k, ...] },
//   hud0:  { a: 10, b: 79 },                                    // counters before the first step
//   fills: { NAME: value, ... },                                // every {NAME} the copy may use
// }
//
// Tok = { t: 'es', k: 'base' | 'learned' | 'active' | 'unseen', cells?: 1 }   cells = width in the token bar.
// Kinds are the palette's semantic colours: base = untouched unit, active = being counted or acted on now,
// learned = what the algorithm produced, unseen = an input it never saw. One meaning each, all film.
// Runs must be deterministic: the same params give the same output, in the browser and in Node.

export const loadRun = async (content) => {
  const mod = await import(`./runs/${content.run.module}.js`);
  const out = mod.steps(content.run.params || {});
  return { ...out, module: content.run.module };
};

// "{NAME}" → fills.NAME. Unknown names are left visible so validate can report them.
export const fill = (s, fills) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in fills ? String(fills[k]) : m));

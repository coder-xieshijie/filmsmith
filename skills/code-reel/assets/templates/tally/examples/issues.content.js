// Alt example (illustrative data): aggregated counts expanded to units, paper-red palette,
// timeline → trend → share → split → close, with two frame-level entries (T2) and the split as the climax (T3).
// Use it by copying this file over content.js. Its copy is a placeholder too: write your own.
const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const rows = {
  bug: [[52, 30, 2], [61, 33, 3], [70, 41, 2], [66, 40, 4], [74, 47, 3], [81, 55, 4]],
  feature: [[30, 12, 1], [34, 15, 1], [41, 19, 2], [45, 22, 1], [52, 27, 2], [60, 33, 1]],
  docs: [[12, 0, 3], [10, 0, 2], [15, 1, 4], [18, 0, 3], [14, 1, 2], [20, 1, 5]],
  chore: [[20, 6, 0], [22, 7, 1], [19, 8, 0], [25, 10, 1], [28, 12, 1], [30, 14, 0]],
};
const counts = [];
for (const [c, list] of Object.entries(rows)) list.forEach(([n, tested, first], i) => counts.push({ c, t: months[i], n, f: { tested, first } }));

export default {
  palette: 'paper-red',
  seed: 4,
  meta: { title: 'Six months of closed issues', url: '' },
  source: 'Illustrative data, not a real repo · test = test file in the closing PR',
  legend: '1 square = 1 closed {unit}',
  data: {
    unit: 'issue', units: 'issues',
    categories: [{ id: 'bug', name: 'Bug' }, { id: 'feature', name: 'Feature request' }, { id: 'docs', name: 'Docs' }, { id: 'chore', name: 'Chore' }],
    flags: [{ id: 'tested', name: 'Closed with a test' }, { id: 'first', name: 'First-time contributor' }],
    periods: months,
    counts,
  },
  scenes: [
    { type: 'timeline', name: 'Month by month', title: '*Bugs* rose every month: {c:bug&t:Apr} to {c:bug&t:Sep}.', sub: '{n} issues closed {first}–{last}', accent: 'c:bug' },
    { type: 'trend', name: 'The pace', title: 'All closed issues: up each month.', sub: 'Same months, read as a trend', callout: '{t:Apr} → {t:Sep}', highlight: 'issues per month' },
    { type: 'share', name: 'Share', enter: 'flip', title: '*Bugs* were {pct:c:bug}% of the work.', top: 5, accent: 'c:bug' },
    { type: 'split', name: 'Tested', title: 'Only {pct:f:tested}% shipped *with a test*.', sub: 'Test file changed in closing PR', by: 'f:tested', caption: 'of {n} had a test', other: 'closed without one', labelIn: 'With a test · {f:tested}', labelOut: 'Without · {!f:tested}' },
    {
      type: 'close', name: 'Since April', enter: 'dither', climax: true, // T3: the first-timers' number lands at 73 %
      numbers: [
        { value: '{n}', label: 'issues closed' },
        { value: '{f:tested}', label: 'came with a test' },
        { value: '{f:first}', label: 'by first-timers', accent: true, sel: 'f:first' },
      ],
      line: '[{f:first&c:docs}] of the first-timers fixed docs.',
    },
  ],
};

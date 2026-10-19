// runs/rle.js — run-length encoding of a tiny 1-bit picture, row by row: each run of equal pixels is written
// once as count×value. A second run module that reuses every renderer piece; the probe is a row with no runs,
// where the encoding grows instead of shrinking. Token bar cells = symbols stored (a pixel is 1, a run is 2).

const px = (v) => ({ t: v, k: 'base', cells: 1 });
const runTok = (n, v, k = 'learned') => ({ t: `${n}×${v}`, k, cells: 2 });

const runsOf = (s) => {
  const out = [];
  for (let i = 0; i < s.length; ) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out.push({ v: s[i], start: i, n: j - i });
    i = j;
  }
  return out;
};
const cells = (toks) => toks.reduce((n, x) => n + (x.cells ?? 1), 0);

export const steps = ({ picture = ['0000011111100000', '0001111111111000', '0000011111100000', '0000001111000000'], probe = '01010101' } = {}) => {
  const rows = picture.map((r, i) => ({ label: `row ${i + 1}`, weight: 1, tokens: r.split('').map(px) }));
  let cur = rows.map((r) => r.tokens);
  const hud0 = { a: 0, b: cells(cur.flat()) };
  const out = [];
  picture.forEach((r, k) => {
    const runs = runsOf(r);
    const next = cur.map((toks, j) => (j === k ? runs.map((x) => runTok(x.n, x.v)) : toks));
    const map = runs.map((x) => Array.from({ length: x.n }, (_, i) => x.start + i));
    out.push({
      counts: {
        title: `runs in row ${k + 1}`,
        items: runs.slice(0, 6).map((x) => ({ parts: [{ t: x.v, k: 'base' }], value: x.n, from: [{ row: k, w: 1, n: x.n }], at: [[k, x.start, x.n]] })),
        pick: -1,
        note: runs.length > 6 ? `+ ${runs.length - 6} more runs` : null,
      },
      hi: runs.map((x) => [k, x.start, x.n]),
      rows: next.map((toks, j) => ({ tokens: toks, map: j === k ? map : toks.map((_, i) => [i]) })),
      rule: { parts: [{ t: `row ${k + 1}`, k: 'op' }, { t: '→', k: 'op' }, ...runs.map((x) => runTok(x.n, x.v))], value: `${r.length}→${runs.length * 2}` },
      hud: { a: k + 1, b: cells(next.flat()) },
    });
    cur = next;
  });
  const pr = runsOf(probe);
  const probeOut = pr.map((x) => runTok(x.n, x.v, 'unseen'));
  const C0 = hud0.b, CN = out[out.length - 1].hud.b;
  return {
    rows, steps: out, hud0,
    fills: {
      ROWS: picture.length, WIDTH: picture[0].length, C0, CN, PCT: Math.round((100 * (C0 - CN)) / C0),
      R1: runsOf(picture[0]).length, R1A: `${runsOf(picture[0])[0].n}×${runsOf(picture[0])[0].v}`,
      RUNS: picture.reduce((n, r) => n + runsOf(r).length, 0),
      P0: probe.length, P1: cells(probeOut), PROBE: probe,
    },
    probe: { label: 'noise', tokens: probe.split('').map((t) => ({ t, k: 'unseen', cells: 1 })), steps: [{ rule: -1, tokens: probeOut, map: pr.map((x) => Array.from({ length: x.n }, (_, i) => x.start + i)) }], used: [] },
  };
};

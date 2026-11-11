// report-pane — what a measuring tool printed, on the bench beside the output it describes: the report's label (the
// tool and its input), one line per check as status · item · value (mono 25, the item muted, the value right-aligned
// at the margin), the result line in bold, and room above for a two-phrase claim at 59 px. Lines are what the tool
// prints, never typed in. States: labelled → lines → result. From the split template (film.js reportPane).
import { W, H, L, MARGIN, fonts, text } from '../seam-grip/split.js';
import { SAMPLE } from '../seam-grip/scenes.js';

export default {
  id: 'report-pane', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { labelled: { n: 0, result: 0 }, lines: { n: 9, result: 0 }, result: { n: 9, result: 1 } },
  parts: ['bench', 'label', 'status', 'item', 'value', 'result line', 'claim'],
  swap: {
    claim: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 7 } } } },
  },
  roles: ['bench', 'onBench', 'mutedOnBench'],
  defaults: (ctx = {}) => ({ report: SAMPLE.report, claim: ctx.lang === 'zh' ? ['渲染，', '量过。'] : ['render,', 'measured.'] }),
  draw(g, st, P) {
    const C = P.colors, F = fonts(P.lang || 'en'), x = L.reportX, R = P.report, bench = C.bench || C.panel, on = C.onBench || C.onPanel, mu = C.mutedOnBench || C.dim;
    g.save(); g.scale(P.w / W, P.h / H);
    g.fillStyle = C.paper || C.ground; g.fillRect(0, 0, W, H);
    g.fillStyle = bench; g.fillRect(L.XD, 0, W - L.XD, H);
    text(g, R.label, x, L.reportLabel, F.label, mu);
    [].concat(P.claim).forEach((p, k) => text(g, p, x, L.claimD[k], F.claim, on));
    R.lines.slice(0, st.n).forEach(([s, item, v], k) => { const y = L.reportY + k * L.reportStep; text(g, s, x, y, F.label, on); text(g, item, x + 78, y, F.label, mu); text(g, v, W - MARGIN, y, F.label, on, 'right'); });
    if (st.result) text(g, R.result, x, L.resultY, F.labelB, on);
    g.restore();
  },
};

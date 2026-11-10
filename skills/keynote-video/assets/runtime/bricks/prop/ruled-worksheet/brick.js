// ruled-worksheet — the worksheet beside an exhibit: a paper card 584 px wide, ruled every 64 px in 7 % ink, on its
// own stack edges; the title in serif semibold with the exhibit tab beside it, the carried figure's slip under it,
// rows of label (serif) and value (mono, right-aligned), a 2 px rule drawn under the rows, the computed result at
// 125 px with its caption and the highlighter over it. Where the film computes in the open.
// From the dossier template's example (the dossier source film film.js buildWorksheet, paintWorksheet).
import { worksheetOf, paintWorksheet } from '../../look/evidence-mat/kit.js';

const DEF = {
  en: { title: 'Lead over B', rows: [['Ours', '71.4'], ['Model B', '65.2'], ['Margin', '+6.2']], value: '+6.2', caption: 'points over the next model' },
  zh: { title: '领先多少', rows: [['我们', '71.4'], ['Model B', '65.2'], ['差距', '+6.2']], value: '+6.2', caption: '比第二名高出的分数' },
};
export default {
  id: 'ruled-worksheet', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // rows: the share of rows entered; result: the rule, figure and stroke
  states: { titled: { rows: 0, result: 0 }, rows: { rows: 1, result: 0 }, result: { rows: 1, result: 1 } },
  parts: ['card', 'ruling', 'title', 'tab', 'rows', 'rule', 'figure', 'caption', 'stroke'],
  swap: { title: { type: 'text', tier: 'primary', limits: { en: { chars: 16 }, zh: { chars: 7 } } }, rows: { type: 'list', count: [1, 5] }, value: { type: 'text', tier: 'glance', limits: { en: { chars: 8 }, zh: { chars: 8 } } }, caption: { type: 'text', tier: 'glance', limits: { en: { chars: 28 }, zh: { chars: 12 } } } },
  roles: ['ground', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEF[ctx.lang === 'zh' ? 'zh' : 'en'], ex: 1 }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en', rows = P.rows || [], n = Math.round(state.rows * rows.length), res = state.result > 0.5;
    const WL = worksheetOf({ title: P.title, rows, value: P.value, caption: P.caption, ex: P.ex }, { rows: rows.map((_, i) => (i < n ? -100 : 1e9)), rule: res ? -100 : null, figure: res ? -100 : null, caption: -100, stroke: res ? -100 : null }, C, L);
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    paintWorksheet(ctx, WL, 0, 960 - WL.w / 2, 540 - WL.h / 2 - 8, C, L);
    ctx.restore();
  },
};

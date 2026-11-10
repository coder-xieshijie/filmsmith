// chart-frame — the persistent frame of a data film: the chapter number and name top left, the accent key top right
// (an accent mark and "HIGHLIGHTED: …" while an accent is on screen), a progress rule with one tick per chapter (the
// reached ones brighter, no "n of N" label), the source line bottom left and the legend bottom right ("1 SQUARE = 1 …").
// From the tally template (assets/templates/tally/index.html and layouts.js, the frame): positions, sizes and rules are
// the template's; every word is a swap point, labels in capitals in English only (lang.js caseOf).
import { clamp, mix, text, measure } from '../../../handoffs/util.js';
import { labelFont, label, drawMark, MX, RX } from '../../motion/unit-flight/units.js';

const Y = { chapter: 82, rule: 986, source: 1040 };
// Draw the frame in film px (1920 × 1080). st: { chapter (index, may be fractional while the rule grows), key (0–1),
// progress (0–1 of the rule) }; P: { chapters [names], key, source, legend, mark, colors, lang }.
export const drawFrame = (ctx, st, P, a = 1) => {
  const C = P.colors, L = P.lang || 'en', f = labelFont(L), n = Math.max(1, (P.chapters || []).length);
  const ci = Math.min(n - 1, Math.max(0, Math.floor(st.chapter + 1e-6)));
  const name = (P.chapters || [])[ci];
  ctx.save(); ctx.globalAlpha = a;
  if (name) text(ctx, label(`${String(ci + 1).padStart(2, '0')} ${name}`, L), MX, Y.chapter, f, { color: C.dim });
  if (st.key > 0 && P.key) {
    const s = label(`${L === 'zh' ? '主角：' : 'HIGHLIGHTED: '}${P.key}`, L), w = measure(ctx, s, f).width;
    text(ctx, s, RX, Y.chapter, f, { color: C.dim, align: 'right', alpha: st.key });
    ctx.fillStyle = C.accent; ctx.globalAlpha = a * st.key; drawMark(ctx, P.mark, RX - w - 30, Y.chapter - 17, 17, 3); ctx.globalAlpha = a;
  }
  // the rule: a track in `line`, the reached part in `dim`, a tick per chapter
  ctx.fillStyle = C.line; ctx.fillRect(MX, Y.rule - 1, RX - MX, 2);
  ctx.fillStyle = mix(C.dim, C.ground, 0.25); ctx.fillRect(MX, Y.rule - 1, (RX - MX) * clamp(st.progress), 2);
  for (let i = 0; i < n; i++) { const x = MX + ((RX - MX) * i) / n; ctx.fillStyle = i <= st.chapter ? C.dim : C.line; ctx.fillRect(x - 1, Y.rule - 7, 2, 14); }
  if (P.source) text(ctx, label(P.source, L), MX, Y.source, f, { color: C.dim });
  if (P.legend) {
    const s = label(P.legend, L), w = measure(ctx, s, f).width;
    text(ctx, s, RX, Y.source, f, { color: C.dim, align: 'right' });
    ctx.fillStyle = C.base || mix(C.ink, C.ground, 0.22); drawMark(ctx, P.mark, RX - w - 30, Y.source - 17, 17, 3);
  }
  ctx.restore();
};

const SWAP = {
  chapters: { type: 'list', count: [1, 9], of: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } } },
  key: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 20 }, zh: { chars: 8 } } },
  source: { type: 'text', tier: 'glance', limits: { en: { words: 10, chars: 64 }, zh: { chars: 30 } } },
  legend: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 24 }, zh: { chars: 12 } } },
};
const DEFAULT = {
  en: { chapters: ['The renders', 'How they ended', 'Still open'], key: 'Rejected', source: 'Data · illustrative · 574 renders', legend: '1 square = 1 render' },
  zh: { chapters: ['全部渲染', '结局如何', '仍未定'], key: '已驳回', source: '数据 · 示意 · 574 次渲染', legend: '1 格 = 1 次渲染' },
};

export default {
  id: 'chart-frame', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // chapter: the index reached (ticks up to it are bright); key: the accent key's opacity; progress: the rule's share
  states: { open: { chapter: 0, key: 0, progress: 0.05 }, keyed: { chapter: 1, key: 1, progress: 0.5 }, closing: { chapter: 2, key: 1, progress: 1 } },
  parts: ['chapter', 'key', 'rule', 'ticks', 'source', 'legend'],
  swap: SWAP,
  roles: ['ground', 'ink', 'dim', 'line', 'accent', 'base'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], mark: 'square', ground: true }),
  draw(ctx, state, P) {
    const k = P.w / 1920;
    ctx.save(); ctx.scale(k, k);
    if (P.ground !== false) { ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, 1920, 1080); ctx.strokeStyle = P.colors.line; ctx.lineWidth = 2 / k; ctx.strokeRect(0, 0, 1920, 1080); }
    drawFrame(ctx, state, P);
    ctx.restore();
  },
};

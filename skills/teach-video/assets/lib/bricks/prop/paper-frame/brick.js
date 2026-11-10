// paper-frame — the persistent frame of a narrated explainer on paper: the chapter label at the top left (34 px, a yellow
// rule under it that follows its length), one counter at the top right (112 px tabular figures right-aligned at x 1860, a
// double rule, the unit line, "约" / "≈" before an approximate number), the "sorted by" label at (120, 104) and the dashed
// note that marks anything illustrative. One of each for the whole film; the counter changes quantity by blurring out
// and landing the new number, never by counting from one quantity to another.
// From teach-video assets/kits/terminal-ledger/starter/components/chapter.js, counter.js, labels.js (F.how, F.tag) and
// style.css (#chap, #counter, .how, .tag); blueprint-zoom's chapter.js and labels.js are the same parts. Scenes draw it
// with the kit's time-based drawChapter / drawCounter / drawHow / drawTag; this module draws it from a state.
import { W, H, say, figures, widthOf, drawTag, rrect, clamp, lerp, L, fmtInt, sz } from '../../look/paper-ledger/kit.js';

const DEFAULT = {
  en: { chapter: 'A week of email', how: 'Sorted by: does it need you', counter: { value: 600, unit: 'emails may need you', pre: '≈' }, tag: 'Illustrative data', tagAt: [120, 814] },
  zh: { chapter: '一周的邮件', how: '分法：按要不要你动手', counter: { value: 600, unit: '封可能要处理', pre: '约' }, tag: '示意数据', tagAt: [120, 814] },
};
// chapter, how, counter, approx, tag: 0–1 shown; count: 0–1 of the counter's value shown (a landed number, not a roll)
const STATES = {
  empty: { chapter: 0, how: 0, counter: 0, count: 0, approx: 0, tag: 0 },
  chapter: { chapter: 1, how: 1, counter: 0, count: 0, approx: 0, tag: 0 },
  counted: { chapter: 1, how: 1, counter: 1, count: 1, approx: 0, tag: 1 },
  approx: { chapter: 1, how: 1, counter: 1, count: 1, approx: 1, tag: 1 },
};
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });

// The frame from a state, at the size tier (k = w / 1920): what a scene's last frame shows and what a stand-in draws.
export const drawFrame = (ctx, C, lang, F, s, k = 1) => {
  ctx.save(); ctx.scale(k, k);
  if (s.chapter > 0 && F.chapter) {
    ctx.save(); ctx.globalAlpha *= s.chapter;
    say(ctx, F.chapter, 56, 28, lang, 34, C.chapInk, { lh: 46, blur: (1 - s.chapter) * 6 });
    ctx.fillStyle = C.chapRule; rrect(ctx, 50, 78, (widthOf(ctx, F.chapter, lang, 34) + 12) * clamp(s.chapter * 1.4 - 0.2), 4, 2); ctx.fill();
    ctx.restore();
  }
  if (s.how > 0 && F.how) {
    ctx.save(); ctx.globalAlpha *= s.how;
    const w = say(ctx, F.how, 120, 104, lang, 28, C.ink, { lh: 40, blur: (1 - s.how) * 6 });
    ctx.fillStyle = C.rule; ctx.fillRect(120, 144, w + 6, 3); ctx.restore();
  }
  if (s.counter > 0 && F.counter) {
    const R = 1860, top = 28, v = fmtInt(Math.round(clamp(s.count) * Number(F.counter.value || 0)));
    ctx.save(); ctx.globalAlpha *= s.counter;
    const wd = figures(ctx, v, R, top, lang, 112, C.ink, { align: 'right', blur: (1 - s.counter) * 8 });
    if (s.approx > 0) say(ctx, F.counter.pre || (L(lang) === 'zh' ? '约' : '≈'), R - wd - 10, top + 46, lang, 44, C.ink, { lh: 60, align: 'right', alpha: s.approx });
    ctx.fillStyle = C.ink; ctx.fillRect(R - 300 * s.counter, top + 118, 300 * s.counter, 2); ctx.fillRect(R - 300 * s.counter, top + 123, 300 * s.counter, 2);
    if (F.counter.unit) say(ctx, F.counter.unit, R, top + 136, lang, 30, C.ink, { lh: 40, align: 'right' });
    ctx.restore();
  }
  if (s.tag > 0 && F.tag) drawTag(ctx, C, lang, F.tag, ...(F.tagAt || [120, 814]), s.tag);
  ctx.restore();
};

export default {
  id: 'paper-frame', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [1200, 675], M: [1920, 1080], L: [1920, 1080] },
  states: STATES,
  parts: ['chapter', 'chapter rule', 'counter', 'approx prefix', 'double rule', 'unit', 'how label', 'illustrative note'],
  swap: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 12, 5) },
    how: { type: 'text', tier: 'glance', limits: lim(34, 16, 6) },
    counter: { type: 'list', count: [0, 1], of: { value: { type: 'number', limits: lim(6, 6, 1) }, unit: { type: 'text', tier: 'glance', limits: lim(26, 12, 4) }, pre: { type: 'text', tier: 'glance', optional: true, limits: lim(6, 2, 1) } } },
    tag: { type: 'text', tier: 'glance', limits: lim(40, 18, 7) },
  },
  roles: ['ground', 'ink', 'dim', 'line', 'panel', 'rule', 'chapInk', 'chapRule'],
  summary: 'The persistent frame of a narrated explainer on paper: the chapter label with its yellow rule, one counter at the top right, the sorted-by label and the dashed note on anything illustrative.',
  defaults: (ctx = {}) => { const d = JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])); return { ...d, counter: [d.counter] }; },
  draw(ctx, S, P) {
    const F = { ...P, counter: (P.counter || [])[0] || null };
    drawFrame(ctx, P.colors, P.lang, F, S, P.w / W);
  },
};

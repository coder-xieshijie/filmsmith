// code-card — one card at main size that runs a call: the title, a track of language tabs whose highlight moves with
// its leading edge first, one code line per tab, the endpoint, and a Run button that takes the accent. Two materials:
// `light` (the paper card, outlined in the ink) and `ink` (the same card as the live console, tones of the ink; the
// highlight is an outline, the Run button outlined in the dim ink). Code stays Latin; the title and Run follow `lang`.
// From the morph template (assets/templates/morph/film.js focusContents, TAB, RUN; FOCUS 1520 × 640 at 200, 120):
// tab geometry, the 0.08 s out / 0.14 s in code change and the leading-edge highlight (container-morph) are the
// template's; here the card is drawn scaled into the prop's box.
import { leadingEdges } from '../../../handoffs/container-morph.js';
import { FOCUS, SZ, colorsOf, loadFonts, productOf, endpointLine, sans, mono, tw, txt, riseText, fillShape, strokeShape, clipShape, runRect, runButton, prog, spr, blurIn, mix, cubicOut, clamp } from '../../motion/outline-morph/ink.js';

const TAB = { h: 72, pad: 32 };
export const TABS = [
  { lang: 'python', code: ['qs.invoices.get("inv_8KQ2")'] },
  { lang: 'node', code: ['await qs.invoices.get(id)'] },
  { lang: 'curl', code: ['curl $QS/v2/invoices/inv_8KQ2'] },
];
const tabsWidth = (ctx, tabs) => tabs.reduce((a, tb) => a + tw(ctx, mono(SZ.body), tb.lang) + 2 * TAB.pad, 0);
export const tabRects = (ctx, tabs) => { let x = FOCUS[0] + FOCUS[2] - 64 - tabsWidth(ctx, tabs); return tabs.map((tb) => { const w = tw(ctx, mono(SZ.body), tb.lang) + 2 * TAB.pad, r = [x, FOCUS[1] + 36, w, TAB.h]; x += w; return r; }); };
// the card's contents at t (s): T = { enter, code, tabs: [t0, t1, …], arm }; material 'light' or 'ink'
export const cardContents = (ctx, s, t, T, C, lang, { material = 'light', runState = null, title = s.title, tabs = s.tabs || TABS, run = s.run } = {}) => {
  const ink = material === 'ink', fg = ink ? C.ground : C.ink, dim = ink ? C.inkDim : C.dim, P = productOf(s);
  riseText(ctx, title, FOCUS[0] + 64, FOCUS[1] + 100, sans(lang, SZ.sub, 700), fg, spr(t - T.enter, 22));
  const kc = cubicOut(prog(t, T.code, 0.18));
  if (kc <= 0) return;
  const tr = tabRects(ctx, tabs);
  ctx.save(); ctx.globalAlpha *= kc;
  fillShape(ctx, [tr[0][0], tr[0][1], tr[tr.length - 1][0] + tr[tr.length - 1][2] - tr[0][0], TAB.h, TAB.h / 2], ink ? C.inkTrack : mix(C.paper, C.line, 0.55));
  const edges = (k) => [tr[k][0] + 5, tr[k][0] + tr[k][2] - 5];
  let [Lx, Rx] = edges(0);
  T.tabs.forEach((t0, k) => { if (k > 0 && t >= t0) [Lx, Rx] = leadingEdges(edges(k - 1), edges(k), prog(t, t0, 0.36), 0.14, 8); });
  const arm = cubicOut(prog(t, T.arm, 0.2)), hi = [Lx, tr[0][1] + 5, Rx - Lx, TAB.h - 10, (TAB.h - 10) / 2];
  if (ink) strokeShape(ctx, hi, C.inkDim, 2); else fillShape(ctx, hi, mix(C.accent, C.ink, arm));
  tabs.forEach((tb, k) => {
    const c = tr[k], mid = c[0] + c[2] / 2, hit = clamp(1 - Math.abs((Lx + Rx) / 2 - mid) / (c[2] * 0.6));
    txt(ctx, tb.lang, mid, c[1] + TAB.h / 2 + 12, mono(SZ.body), mix(dim, ink ? C.ground : mix(C.onAccent, C.ground, arm), hit), { align: 'center' });
  });
  ctx.restore();
  ctx.fillStyle = ink ? C.inkEdge : C.line; ctx.fillRect(FOCUS[0] + 64, FOCUS[1] + 148, FOCUS[2] - 128, 2);
  // code: the current tab's lines; on a change the old ones leave (0.08 s), the new ones enter (0.14–0.28 s)
  let k = 0; T.tabs.forEach((t0, i) => { if (t >= t0) k = i; });
  const tk = T.tabs[k];
  let va = 1, vb = 0, shown = k;
  if (k > 0 && t < tk + 0.08) { shown = k - 1; va = 1 - (t - tk) / 0.08; vb = 10 * (1 - va); }
  else if (k > 0 && t < tk + 0.14) va = 0;
  else if (k > 0 && t < tk + 0.28) { const e = cubicOut((t - tk - 0.14) / 0.14); va = e; vb = 10 * (1 - e); }
  if (k === 0) { va = kc; vb = blurIn(kc); }
  if (va > 0) {
    ctx.save(); ctx.globalAlpha *= va; if (vb > 0.05) ctx.filter = `blur(${vb.toFixed(2)}px)`;
    (tabs[shown].code || []).forEach((line, j) => txt(ctx, line, FOCUS[0] + 64, FOCUS[1] + 270 + j * 76, mono(SZ.sub), fg));
    ctx.restore();
  }
  if (ink) return;
  txt(ctx, endpointLine(P), FOCUS[0] + 64, FOCUS[1] + FOCUS[3] - 94, mono(SZ.body), dim);
  const rs = runState || { press: 1, spin: null };
  ctx.save(); ctx.globalAlpha *= kc;
  runButton(ctx, runRect(rs.press), run, lang, C, { arm, spin: rs.spin });
  ctx.restore();
};
export const DEFAULT = { en: { title: 'Retrieve an invoice', run: 'Run' }, zh: { title: '获取一张发票', run: '运行' } };

export default {
  id: 'code-card', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [760, 320], M: [1140, 480], L: [1520, 640] },
  states: { idle: { tab: 0, arm: 0, ink: 0 }, armed: { tab: 0, arm: 1, ink: 0 }, second: { tab: 1, arm: 0, ink: 0 }, console: { tab: 0, arm: 0, ink: 1 } },
  parts: ['title', 'tabs', 'code', 'endpoint', 'run'],
  swap: { title: { type: 'text', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } }, tabs: { type: 'list', of: { lang: { type: 'code' }, code: { type: 'code' } } }, run: { type: 'text', limits: { en: { chars: 6 }, zh: { chars: 3 } } } },
  roles: ['ground', 'paper', 'ink', 'dim', 'line', 'accent', 'onAccent', 'inkDim', 'inkCard', 'inkEdge', 'inkTrack'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], tabs: TABS, ground: true, corners: 'round' }),
  async prepare(P) { await loadFonts(P.lang || 'en'); },
  draw(ctx, st, P) {
    const C = colorsOf(P), lang = P.lang || 'en', ink = st.ink >= 0.5;
    if (P.ground !== false) { ctx.fillStyle = ink ? C.ink : C.ground; ctx.fillRect(-P.w, -P.h, P.w * 3, P.h * 3); }
    ctx.save(); ctx.scale(P.w / FOCUS[2], P.h / FOCUS[3]); ctx.translate(-FOCUS[0], -FOCUS[1]);
    const R = FOCUS;
    if (ink) { fillShape(ctx, R, C.inkCard, P.corners); strokeShape(ctx, R, C.inkEdge, 3, P.corners); } else { fillShape(ctx, R, C.paper, P.corners); strokeShape(ctx, R, C.ink, 3, P.corners); }
    const tabs = P.tabs || TABS, T = { enter: -9, code: -9, tabs: tabs.map((_, i) => (i <= st.tab ? -9 + i : 99)), arm: st.arm > 0 ? -9 : 99 };
    ctx.save(); clipShape(ctx, R, P.corners);
    cardContents(ctx, P, 0, T, C, lang, { material: ink ? 'ink' : 'light' });
    ctx.restore();
    ctx.restore();
  },
};

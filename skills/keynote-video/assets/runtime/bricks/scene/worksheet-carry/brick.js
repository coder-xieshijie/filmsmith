// worksheet-carry — the exhibit opens into a spread: a seam is cut down the gutter beside the sheet and a ruled
// worksheet slides out of it (runtime split-open, a drawer in a pane, 1.5 beats; the seam stays, in ink with a paper
// key); its exhibit tab is pressed; the struck figure lifts off the page as its own pixels (≤ 1.2× the sheet's scale),
// is set in code on the same paper (its paper and ink sampled from the region, the type registered on the ink box),
// carried along the corridor above the sheets and laid on the worksheet in two beats; the title rises, then the rows
// half a beat apart. The claim and its terms stay on the mat. The slip is the one carry of a film.
// From the dossier template's example (the dossier source film choreo.js planOf 'worksheet', film.js
// buildWorksheet, paintWorksheet, buildSlip, slipAt, paintSlip, openParams). The page is `exhibit` (a spread: 1112
// wide); without one, the placeholder table with its first value carried.
import { merge } from '../../../handoffs/util.js';
import splitOpen from '../../../handoffs/split-open.js';
import { measureCtx, C, CB, X0, Y0, WORK, ground, header, pageText, exhibitSpec, loadImage, sheetOf, restState, paintSheet, priorLines, drawLine, worksheetOf, paintWorksheet, seam, slipCanvas, slipAt, paintSlip, stampScale, clamp, popsOf, landAt, readEnd, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

const DEFAULT = {
  en: { worksheet: { title: 'Lead over B', rows: [['Ours', '71.4'], ['Model B', '65.2'], ['Margin', '+6.2']], carry: { ...PLACEHOLDER.cell(0), text: '71.4' } }, prior: { claim: 'First on Tool-Bench v2.', terms: 'Vendor-reported · v2 · 3 models' } },
  zh: { worksheet: { title: '领先多少', rows: [['我们', '71.4'], ['Model B', '65.2'], ['差距', '+6.2']], carry: { ...PLACEHOLDER.cell(0), text: '71.4' } }, prior: { claim: '在 Tool-Bench v2 上排第一。', terms: '厂商自报 · v2 · 3 个模型' } },
};
// moments in beats
export const momentsOf = (ws) => {
  const carry = !!ws?.carry, r0 = carry ? 3.5 : 2;
  return { open: CB.open, tab: CB.open, lift: 1, swap: 1 + CB.lift, land: 1 + CB.slip, carry, title: r0, rows: (ws?.rows || []).map((_, k) => r0 + 0.5 + k * 0.5) };
};
export default {
  id: 'worksheet-carry', kind: 'scene',
  fits: ['demo', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['split-open'], props: ['ruled-worksheet', 'mounted-sheet', 'file-slug'], roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono', 'sans'] },
  slots: {
    worksheet: { type: 'object' },
    exhibit: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, ws = s.worksheet || {}, m = momentsOf(ws);
    const items = [{ text: ws.title, at: m.title * B }, ...(ws.rows || []).map((r, k) => ({ text: `${r[0]} ${r[1]}`, at: m.rows[k] * B, glance: true }))];
    const marks = [m.open * B + C.stamp, m.carry ? m.land * B : 0, landAt(ws.title, m.title * B, L), ...m.rows.map((b) => b * B + C.rise * 0.9)];
    const need = Math.max(readEnd(items, L), Math.max(...marks) + 0.25);
    return { beats: clamp(Math.ceil(need / B - 1e-9), 4, 12), reads: [{ text: ws.title, lang: L }, ...(ws.rows || []).map((r) => ({ text: `${r[0]} ${r[1]}`, lang: L, tier: 'glance' }))],
      cues: [{ beat: 0, kind: 'turn' }, { beat: m.tab, kind: 'tick' }, ...(m.carry ? [{ beat: m.lift, kind: 'accent' }, { beat: m.land, kind: 'land' }] : [])], motion: 'split-open', settled: m.carry ? m.land : m.tab, peakAt: m.carry ? m.land : m.tab, pause: 0, lead: 0 };
  },
  // the title shares its line with the exhibit tab: about 16 characters (7 Chinese) at 50 px
  validate(s, ctx = {}) { const t = s.worksheet?.title || '', n = ctx.lang === 'zh' ? 7 : 16; return [...t].length > n ? [`worksheet.title "${t}" is over ${n} characters: it would run into the tab`] : []; },
  async prepare(s, c) {
    const L = c.lang, e = exhibitSpec({ spread: true, ...(s.exhibit || {}) }, L), img = await loadImage(e.src), G = sheetOf(measureCtx(), e, L), B = 60 / c.bpm, m = momentsOf(s.worksheet);
    const WL = worksheetOf({ ...s.worksheet, ex: s.worksheet.ex ?? e.ex }, { title: m.title * B, rows: m.rows.map((b) => b * B), tab: m.tab * B }, s.colors, L, G);
    const beats = this.plan(s, c).beats, lastMove = Math.max(m.land * B, ...m.rows.map((b) => b * B + C.rise), m.title * B + C.rise);
    return { e, img, G, B, m, WL, beats, code: WL.slip ? slipCanvas(img, WL.slip) : null, rest: restState(G, e), prior: priorLines(s.prior, s.colors, L, Infinity), pops: m.carry ? popsOf(lastMove, beats * B, B) : [] };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B, m = D.m, WL = D.WL;
    ground(ctx, Cc);
    paintSheet(ctx, D.G, D.img, D.rest, X0, Y0, Cc, L);
    if (t < m.open * B) {
      const Q = merge(splitOpen.defaults, { pane: { x: WL.x, y: WL.y, w: WL.w + 16, h: WL.h + 16 }, reveal: 'drawer',
        to: { paint: (g, dx, dy) => paintWorksheet(g, WL, t, WL.x + dx, WL.y + dy, Cc, L, { B }) },
        colors: { accent: Cc.onPaper, key: Cc.paper, bench: Cc.ground, ground: Cc.ground } });
      splitOpen.paint(ctx, splitOpen.at(clamp(t / (m.open * B)), Q), Q);
    } else {
      paintWorksheet(ctx, WL, t, WL.x, WL.y, Cc, L, { B });
      seam(ctx, WL.x, WL.y, WL.y + WL.h, Cc);
    }
    if (WL.slip && t >= m.lift * B) paintSlip(ctx, WL.slip, D.img, D.code, slipAt(WL.slip, D.G, { lift: m.lift * B, swap: m.swap * B, land: m.land * B }, t, D.pops), Cc);
    for (const Ln of [D.prior.claim, D.prior.terms]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('worksheet', { ex: D.e.ex }, L), prev: s.prevPage ?? pageText('exhibit', { ex: D.e.ex, of: D.e.of }, L), at: 0 }, Cc, L);
  },
  // the worksheet sliding out of the seam and the slip in flight
  track(u, s, c, D) {
    const t = u * D.B, m = D.m, WL = D.WL, k = clamp(t / (m.open * D.B)), out = [[WL.x - (1 - k * k * (3 - 2 * k)) * WL.w, WL.y]];
    if (WL.slip) { const [x, y] = t >= m.lift * D.B ? slipAt(WL.slip, D.G, { lift: m.lift * D.B, swap: m.swap * D.B, land: m.land * D.B }, t) : [WL.slip.slot[0], WL.slip.slot[1]]; out.push([x, y]); }
    return out;
  },
  blur() { return true; },
};

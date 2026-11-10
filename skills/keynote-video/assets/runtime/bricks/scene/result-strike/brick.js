// result-strike — the climax of a dossier: under the worksheet's rows a rule is drawn, the computed figure enters as
// one (125 px serif) with its caption; the last claim sinks off the mat and the new claim's first phrase rises, its
// terms under it; on beat 3 the highlighter strikes the figure (multiply, one beat); on beat 4 the claim's second
// phrase lands on the drop (the key) and the frame holds still for the reading, at least two beats.
// From the dossier template's example (the dossier source film choreo.js planOf 'result', film.js
// buildWorksheet result, paintWorksheet, buildMat). The worksheet is the one worksheet-carry laid (`worksheet`,
// settled), the exhibit beside it as left (`exhibit`).
import { measureCtx, C, CB, X0, Y0, ground, header, pageText, exhibitSpec, loadImage, sheetOf, restState, paintSheet, matLines, priorLines, drawLine, worksheetOf, paintWorksheet, seam, slipCanvas, paintSlip, clamp, landAt, readEnd, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

const DEFAULT = {
  en: { worksheet: { title: 'Lead over B', rows: [['Ours', '71.4'], ['Model B', '65.2'], ['Margin', '+6.2']], carry: { ...PLACEHOLDER.cell(0), text: '71.4' }, value: '+6.2', caption: 'points over the next model' },
    claim: ['First by 6.2 points,', 'on its own table.'], terms: 'Tool-Bench v2, vendor-reported', prior: { claim: 'First on Tool-Bench v2.', terms: 'Vendor-reported · v2 · 3 models' } },
  zh: { worksheet: { title: '领先多少', rows: [['我们', '71.4'], ['Model B', '65.2'], ['差距', '+6.2']], carry: { ...PLACEHOLDER.cell(0), text: '71.4' }, value: '+6.2', caption: '比第二名高出的分数' },
    claim: ['领先 6.2 分，', '出自它自己的表。'], terms: 'Tool-Bench v2，厂商自报', prior: { claim: '在 Tool-Bench v2 上排第一。', terms: '厂商自报 · v2 · 3 个模型' } },
};
export const M = { rule: 0.5, figure: 1, caption: 1.5, leave: 1.5, p0: 1.75, terms: 2.25, stroke: 3, p1: 4 };
const ph = (c) => (Array.isArray(c) ? c : [c, '']);
export default {
  id: 'result-strike', kind: 'scene',
  fits: ['climax', 'claim', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 12 },
  needs: { props: ['ruled-worksheet', 'mounted-sheet', 'file-slug'], roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    claim: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 30 }, zh: { chars: 12 } } } },
    terms: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 56 }, zh: { chars: 26 } } },
    worksheet: { type: 'object' },
    exhibit: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, [p0, p1] = ph(s.claim), ws = s.worksheet || {};
    const items = [{ text: ws.value, at: M.figure * B, glance: true }, { text: ws.caption, at: M.caption * B, glance: true }, { text: p0, at: M.p0 * B }, ...(s.terms ? [{ text: s.terms, at: M.terms * B, glance: true }] : []), { text: p1, at: M.p1 * B }];
    const pauseFrom = landAt(p1, M.p1 * B, L), need = Math.max(readEnd(items, L), pauseFrom + 2 * B);
    return { beats: clamp(Math.ceil(need / B - 1e-9), 6, 12), reads: [{ text: `${p0} ${p1}`, lang: L }, { text: ws.caption, lang: L, tier: 'glance' }],
      cues: [{ beat: M.figure, kind: 'land' }, { beat: M.stroke, kind: 'accent' }, { beat: M.p1, kind: 'claim' }], motion: null, settled: M.p1, peakAt: M.p1, pause: Math.max(0, need - pauseFrom), lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const L = c.lang, B = 60 / c.bpm, e = exhibitSpec({ spread: true, ...(s.exhibit || {}) }, L), img = await loadImage(e.src), G = sheetOf(measureCtx(), e, L);
    const WL = worksheetOf({ ...s.worksheet, ex: s.worksheet.ex ?? e.ex }, { rule: M.rule * B, figure: M.figure * B, caption: M.caption * B, stroke: M.stroke * B }, s.colors, L, G);
    const [p0, p1] = ph(s.claim);
    return { e, img, G, B, WL, code: WL.slip ? slipCanvas(img, WL.slip) : null, rest: restState(G, e),
      mat: matLines([p0, p1], s.terms, { claimAt: M.p0 * B, claimAt2: M.p1 * B, termsAt: M.terms * B, joined: false }, s.colors, L),
      prior: priorLines(s.prior, s.colors, L, M.leave * B) };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B, WL = D.WL;
    ground(ctx, Cc);
    paintSheet(ctx, D.G, D.img, D.rest, X0, Y0, Cc, L);
    paintWorksheet(ctx, WL, t, WL.x, WL.y, Cc, L, { B });
    seam(ctx, WL.x, WL.y, WL.y + WL.h, Cc);
    if (WL.slip) paintSlip(ctx, WL.slip, D.img, D.code, [WL.slip.slot[0], WL.slip.slot[1], 1, 'landed'], Cc);
    for (const Ln of [D.prior.claim, D.prior.terms, D.mat.claim, D.mat.terms]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('worksheet', { ex: D.e.ex }, L) }, Cc, L);
  },
  track() { return [[1500, 640]]; },
  blur() { return false; },
};

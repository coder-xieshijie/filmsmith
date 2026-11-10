// exhibit-strike — an exhibit laid on the mat and its claim struck where it was printed: the sheet is already open
// (the cold open), dealt on from below, there after a page change, or arrives already struck (after a match cut);
// the claim rises word by word on the mat while the rest of the page dims under a 50 % veil, the highlighter wipes
// across the printed claim in one beat (multiply, so the page's own type stays under it), the leader runs from the
// band to the sticker and the terms rise under the claim; a beat later the exhibit sticker is pressed (1.1 → 1); a
// hold longer than two beats is broken by pressing the stroke again.
// From the dossier template's example (the dossier source film choreo.js planOf 'exhibit', film.js
// paintSheet, buildMat, paintHeader, dealY). The page is the film's capture (`exhibit.src` with its crop and band);
// without one, a placeholder published table drawn in code.
import { measureCtx, C, CB, X0, Y0, ground, header, pageText, exhibitSpec, loadImage, sheetOf, bandOf, paintSheet, matLines, priorLines, drawLine, prepareLeaving, paintLeaving, dealY, exitY, progress, ease1io, ease2io, clamp, stampScale, popScale, popsOf, landAt, readEnd } from '../../look/evidence-mat/kit.js';

const cap = (y) => Math.min(1200, Number.isFinite(y) ? y : 1200);
const DEFAULT = {
  en: { claim: 'First on Tool-Bench v2.', terms: 'Vendor-reported · v2 · 3 models' },
  zh: { claim: '在 Tool-Bench v2 上排第一。', terms: '厂商自报 · v2 · 3 个模型' },
};
// moments in beats from the scene's start
export const momentsOf = (s) => {
  const enter = s.enter || 'open', matched = enter === 'matched', half = enter === 'change' ? 1 : 0;
  const a = enter === 'deal' ? 1 : enter === 'open' ? 0 : 0.25;
  const strokeAt = matched ? 0 : Math.max(Math.ceil(a + 0.5), Math.ceil(half)), land = matched ? 0 : strokeAt + CB.stroke;
  return { enter, matched, a, veilAt: a + 0.5, strokeAt, land, termsAt: land + 0.5, stampAt: Math.max(land + 1, Math.ceil(half), matched ? 1 : 0), headerAt: enter === 'deal' ? 0.5 : 0, dealAt: 0.5 };
};
const claimText = (c, lang) => (Array.isArray(c) ? c.join(lang === 'zh' ? '' : ' ') : c || '');
export default {
  id: 'exhibit-strike', kind: 'scene',
  fits: ['hook', 'problem', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: ['sheet-deal'], props: ['mounted-sheet', 'exhibit-sticker', 'file-slug'], roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    claim: { type: 'text', tier: 'primary', limits: { en: { words: 8, chars: 48 }, zh: { chars: 20 } } },
    terms: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 56 }, zh: { chars: 26 } } },
    exhibit: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
    leaving: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], enter: 'open', slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, m = momentsOf(s), claim = claimText(s.claim, L);
    const items = [{ text: claim, at: m.a * B }, ...(s.terms ? [{ text: s.terms, at: m.termsAt * B, glance: true }] : [])];
    const marks = [landAt(claim, m.a * B, L), m.land * B, s.terms ? landAt(s.terms, m.termsAt * B, L) : 0, m.stampAt * B + C.stamp];
    const need = Math.max(readEnd(items, L), Math.max(...marks) + 0.25);
    return { beats: clamp(Math.ceil(need / B - 1e-9), 4, 10), reads: [{ text: claim, lang: L }, ...(s.terms ? [{ text: s.terms, lang: L, tier: 'glance' }] : [])],
      cues: [...(m.enter === 'deal' ? [{ beat: 0, kind: 'turn' }] : []), ...(m.matched ? [] : [{ beat: m.strokeAt, kind: 'accent' }, { beat: m.land, kind: 'land' }]), { beat: m.stampAt, kind: 'land' }],
      motion: m.enter === 'deal' ? 'sheet-deal' : null, settled: m.stampAt, peakAt: m.land, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const e = exhibitSpec(s.exhibit, c.lang), img = await loadImage(e.src), ctx = measureCtx();
    const G = sheetOf(ctx, e, c.lang), B = 60 / c.bpm, m = momentsOf(s), beats = this.plan(s, c).beats, L = c.lang;
    const mat = matLines(s.claim, s.terms, { claimAt: m.a * B, termsAt: m.termsAt * B }, s.colors, L);
    const prior = m.enter === 'deal' ? priorLines(s.prior, s.colors, L, 0) : {};
    const lastMove = Math.max(m.stampAt * B + C.stamp, mat.terms ? mat.terms.words.at(-1).at + C.rise : 0, mat.claim ? mat.claim.words.at(-1).at + C.rise : 0);
    return { e, img, G, m, B, mat, prior, beats, band: bandOf(G, e.band, e.under), pops: popsOf(lastMove, beats * B, B), leaving: m.enter === 'deal' ? await prepareLeaving(s.leaving, s.colors, L) : null };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B, m = D.m, G = D.G;
    ground(ctx, Cc);
    if (D.leaving) paintLeaving(ctx, D.leaving, t, 0, Cc, L);
    const dy = m.enter === 'deal' ? dealY(t, m.dealAt * B, B) : 0;
    if (Number.isFinite(dy)) {
      const pop = popScale(t, D.pops), landT = m.land * B;
      paintSheet(ctx, G, D.img, {
        band: D.band,
        veil: m.matched ? 1 : clamp(1 - (1 - progress(t, m.veilAt * B, C.veil)) ** 2),
        stroke: m.matched ? 1 : t >= m.strokeAt * B ? ease1io(progress(t, m.strokeAt * B, CB.stroke * B)) : 0,
        pop,
        leader: D.e.leader && t >= landT ? { route: D.e.leader, p: ease2io(progress(t, landT + 0.05, C.leader - 0.05)), dot: clamp(progress(t, landT, C.dot)) } : null,
        stamp: t >= m.stampAt * B ? (({ a, s: k }) => ({ a, s: k * (1 + 0.5 * (pop - 1)) }))(stampScale(t, m.stampAt * B)) : null,
      }, X0, Y0 + dy, Cc, L);
    }
    for (const Ln of [D.prior.claim, D.prior.terms, D.mat.claim, D.mat.terms]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('exhibit', { ex: D.e.ex, of: D.e.of }, L), prev: s.prevPage, at: m.headerAt * B }, Cc, L);
  },
  // the moving sheets (dealt on, the one before sliding off), for sub-frame motion blur
  track(u, s, c, D) { const t = u * D.B; return [[X0, cap(D.m.enter === 'deal' ? dealY(t, D.m.dealAt * D.B, D.B) : 0)], [X0, cap(D.leaving ? exitY(t, 0) : 0)]]; },
  blur() { return true; },
};

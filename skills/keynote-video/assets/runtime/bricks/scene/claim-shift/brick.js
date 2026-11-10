// claim-shift — the next claim on the same exhibit: the lit band and the highlighter move together to the next printed
// claim (0.4 s, power2 in-out), the leader following (or fading when the new claim keeps none, drawing in when it
// gains one); the previous claim sinks off the mat and the new one rises in its place a quarter beat later, its terms
// a beat after that; a hold longer than two beats is broken by pressing the stroke again.
// From the dossier template's example (the dossier source film choreo.js planOf 'claim', film.js bandAt,
// buildMat). `exhibit` is the sheet as the scene before left it (its `band`, `under`, `leader`); `band`, `under` and
// `leader` here are the claim this scene strikes.
import { measureCtx, C, X0, Y0, ground, header, pageText, exhibitSpec, loadImage, sheetOf, bandOf, mixBand, paintSheet, matLines, priorLines, drawLine, progress, ease2io, clamp, popScale, popsOf, landAt, readEnd, PLACEHOLDER } from '../../look/evidence-mat/kit.js';

const DEFAULT = {
  en: { claim: 'Third on Long-Ctx 256K.', terms: '44.7, behind Model B', prior: { claim: 'First on Tool-Bench v2.', terms: 'Vendor-reported · v2 · 3 models' } },
  zh: { claim: '在 Long-Ctx 256K 上排第一。', terms: '44.7，领先 Model B', prior: { claim: '在 Tool-Bench v2 上排第一。', terms: '厂商自报 · v2 · 3 个模型' } },
};
export const M = { claimAt: 0.25, leaderAt: 0.5, termsAt: 1.5 };
const claimText = (c, lang) => (Array.isArray(c) ? c.join(lang === 'zh' ? '' : ' ') : c || '');
export default {
  id: 'claim-shift', kind: 'scene',
  fits: ['problem', 'proof', 'demo'],
  surface: ['canvas'],
  beats: { min: 3, max: 8 },
  needs: { props: ['mounted-sheet', 'exhibit-sticker', 'file-slug'], roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    claim: { type: 'text', tier: 'primary', limits: { en: { words: 8, chars: 48 }, zh: { chars: 20 } } },
    terms: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 56 }, zh: { chars: 26 } } },
    band: { type: 'list', count: [4, 4], of: { type: 'number' } },
    exhibit: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], band: PLACEHOLDER.band(2), under: false, leader: 'down', slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, claim = claimText(s.claim, L);
    const items = [{ text: claim, at: M.claimAt * B }, ...(s.terms ? [{ text: s.terms, at: M.termsAt * B, glance: true }] : [])];
    const need = Math.max(readEnd(items, L), landAt(claim, M.claimAt * B, L) + 0.25, s.terms ? landAt(s.terms, M.termsAt * B, L) + 0.25 : 0);
    return { beats: clamp(Math.ceil(need / B - 1e-9), 3, 8), reads: [{ text: claim, lang: L }, ...(s.terms ? [{ text: s.terms, lang: L, tier: 'glance' }] : [])],
      cues: [{ beat: 0, kind: 'turn' }], motion: null, settled: 1, peakAt: 0.25, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const L = c.lang, e = exhibitSpec(s.exhibit, L), img = await loadImage(e.src), G = sheetOf(measureCtx(), e, L), B = 60 / c.bpm, beats = this.plan(s, c).beats;
    const mat = matLines(s.claim, s.terms, { claimAt: M.claimAt * B, termsAt: M.termsAt * B }, s.colors, L);
    const prior = priorLines(s.prior, s.colors, L, 0, (M.termsAt - 0.25) * B);
    const lastMove = Math.max(C.bandMove, mat.claim ? mat.claim.words.at(-1).at + C.rise : 0, mat.terms ? mat.terms.words.at(-1).at + C.rise : 0, s.leader && !e.leader ? M.leaderAt * B + C.leader : 0);
    return { e, img, G, B, mat, prior, beats, from: bandOf(G, e.band, e.under), to: bandOf(G, s.band, s.under), pops: popsOf(lastMove, beats * B, B) };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B, e = D.e;
    ground(ctx, Cc);
    const band = mixBand(D.from, D.to, ease2io(progress(t, 0, C.bandMove)));
    const was = e.leader || false, now = s.leader || false;
    let leader = null;
    if (now && was) leader = { route: now, p: 1, dot: 1 };
    else if (was && !now) leader = { route: was, p: 1, dot: 1, alpha: 1 - progress(t, 0, 0.2) };
    else if (now && !was && t >= M.leaderAt * B) { const t0 = M.leaderAt * B; leader = { route: now, p: ease2io(progress(t, t0 + 0.05, C.leader - 0.05)), dot: clamp(progress(t, t0, C.dot)) }; }
    const pop = popScale(t, D.pops);
    paintSheet(ctx, D.G, D.img, { band, veil: 1, stroke: 1, pop, leader, stamp: { a: 1, s: 1 + 0.5 * (pop - 1) } }, X0, Y0, Cc, L);
    for (const Ln of [D.prior.claim, D.prior.terms, D.mat.claim, D.mat.terms]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('exhibit', { ex: e.ex, of: e.of }, L) }, Cc, L);
  },
  // the band's corner as it moves
  track(u, s, c, D) { const b = mixBand(D.from, D.to, ease2io(progress(u * D.B, 0, C.bandMove))); return [[X0 + b.lit[0], Y0 + b.lit[1]], [X0 + b.lit[0] + b.lit[2], Y0 + b.lit[1] + b.lit[3]]]; },
  blur() { return true; },
};

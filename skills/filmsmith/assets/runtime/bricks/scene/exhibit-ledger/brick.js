// exhibit-ledger — the index of exhibits: the sheets slide off the mat, the index card is dealt on from below, the
// claim's two phrases rise on the mat a beat apart, and the rows are entered one a beat — each row's exhibit tab
// pressed (1.1 → 1) as its line rises, the source after it in mono; a hold longer than two beats is broken by
// pressing the last tab again. Every claim the film made, listed where it was printed.
// From the dossier template's example (the dossier source film choreo.js planOf 'ledger', film.js
// buildLedger, paintLedger, layout.js ledgerBox).
import { C, X0, Y0, ground, header, pageText, ledgerOf, paintLedger, prepareLeaving, paintLeaving, exitY, matLines, priorLines, drawLine, dealY, clamp, popsOf, landAt, readEnd } from '../../look/evidence-mat/kit.js';

const DEFAULT = {
  en: { claim: ['Every claim,', 'struck where it was printed.'], rows: [['1', 'First on Tool-Bench v2', 'example.com'], ['2', 'Third on Long-Ctx 256K', 'example.com'], ['3', 'Ahead by 6.2 points', 'worksheet']], of: 3 },
  zh: { claim: ['每一条断言，', '都划在它印出来的地方。'], rows: [['1', 'Tool-Bench v2 第一', 'example.com'], ['2', 'Long-Ctx 256K 第三', 'example.com'], ['3', '领先 6.2 分', '演算纸']], of: 3 },
};
export const M = { exit: 0, deal: 0.5, p0: 1, p1: 2, row: (k) => 1.5 + k };
const ph = (c) => (Array.isArray(c) ? c : [c, '']);
export default {
  id: 'exhibit-ledger', kind: 'scene',
  fits: ['proof', 'rest', 'claim'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['sheet-deal'], props: ['file-slug'], roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'paperMuted', 'line', 'accent', 'onAccent'], type: ['display', 'text', 'mono'] },
  slots: {
    claim: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 30 }, zh: { chars: 12 } } } },
    rows: { type: 'list', count: [2, 6], of: { type: 'list', count: [3, 3], of: { type: 'text', tier: 'glance', limits: { en: { chars: 36 }, zh: { chars: 16 } } } } },
    leaving: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'paper', 'onPaper', 'paperMuted', 'line', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, [p0, p1] = ph(s.claim), rows = s.rows || [];
    const items = [{ text: p0, at: M.p0 * B }, ...(p1 ? [{ text: p1, at: M.p1 * B }] : []), ...rows.map((r, k) => ({ text: r[1], at: M.row(k) * B, glance: true }))];
    const marks = [landAt(p1 || p0, (p1 ? M.p1 : M.p0) * B, L), ...rows.map((r, k) => landAt(r[1], M.row(k) * B, L))];
    const need = Math.max(readEnd(items, L), Math.max(...marks) + 0.25);
    return { beats: clamp(Math.ceil(need / B - 1e-9), 4, 12), reads: [{ text: [p0, p1].filter(Boolean).join(' '), lang: L }, ...rows.map((r) => ({ text: r[1], lang: L, tier: 'glance' }))],
      cues: [{ beat: 0, kind: 'turn' }, ...rows.map((_, k) => ({ beat: M.row(k), kind: 'tick' }))], motion: 'sheet-deal', settled: M.row(rows.length - 1), peakAt: M.p1, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const L = c.lang, B = 60 / c.bpm, rows = s.rows || [], beats = this.plan(s, c).beats, [p0, p1] = ph(s.claim);
    const LG = ledgerOf(rows, { rows: rows.map((_, k) => M.row(k) * B) }, s.colors, L, B);
    const mat = matLines(p1 ? [p0, p1] : [p0], null, { claimAt: M.p0 * B, claimAt2: M.p1 * B, joined: false }, s.colors, L);
    const lastMove = Math.max(...LG.rows.map((r) => Math.max(r.txt.words.at(-1)?.at ?? 0, r.srcL.words.at(-1)?.at ?? 0) + C.rise), mat.claim.words.at(-1).at + C.rise);
    return { B, LG, mat, beats, prior: priorLines(s.prior, s.colors, L, 0), leaving: await prepareLeaving(s.leaving, s.colors, L), pops: popsOf(lastMove, beats * B, B) };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B;
    ground(ctx, Cc);
    paintLeaving(ctx, D.leaving, t, 0, Cc, L);
    const dy = dealY(t, M.deal * B, B);
    if (Number.isFinite(dy)) paintLedger(ctx, D.LG, t, X0, Y0 + dy, Cc, L, { pops: D.pops });
    for (const Ln of [D.prior.claim, D.prior.terms, D.mat.claim]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('ledger', {}, L), prev: s.prevPage, at: 0 }, Cc, L);
  },
  // the index dealt on, the sheets sliding off
  track(u, s, c, D) { const t = u * D.B, d = dealY(t, M.deal * D.B, D.B); return [[X0, Math.min(1200, Number.isFinite(d) ? d : 1200)], [X0, D.leaving ? Math.min(1200, exitY(t, 0)) : 0]]; },
  blur() { return true; },
};

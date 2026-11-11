// name-strike — the lock-up of a dossier: the file is squared and slid off the mat in a beat; the product's mark is
// wiped in (0.45 s); on beat 1 the highlighter strikes a band across the mat and the name is wiped in with it (160 px
// serif in onAccent on the accent, the one place the accent is a fill under type that is not a page's); the URL rises
// in mono, the capture line under it; on the downbeat of the last bar the URL is underlined in the accent.
// From the dossier template's example (the dossier source film choreo.js planOf 'lockup', film.js
// buildLockup, paintLockup, timeline.js endMove). `mark` is the film's own logo asset (src and crop); without one the
// name sits higher. `beats` lets the arc hand the lock-up the film's rounding.
import { graphemes, isCJK } from '../../lang.js';
import { C, CB, W, READ_W, ground, header, pageText, lineOf, drawLine, poly, prepareLeaving, paintLeaving, exitY, priorLines, progress, ease1io, expOut, clamp, readEnd } from '../../look/evidence-mat/kit.js';

const DEFAULT = {
  en: { name: 'Example 2.0', url: 'example.com', caption: 'Captured 2026-10-20 · example.com', of: 3 },
  zh: { name: '示例模型 2.0', url: 'example.com', caption: '截取于 2026-10-20 · example.com', of: 3 },
};
export const M = { stack: 0, mark: 0.5, stroke: 1, name: 2, url: 2.5, caption: 3 };
const endBeat = (beats, B) => { const urlAt = M.url * B, last = Math.max(urlAt + C.settle + 0.5, beats * B - 4 * B); return Math.round(last / B); };
export default {
  id: 'name-strike', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 16 },
  needs: { props: ['file-slug'], roles: ['ground', 'ink', 'dim', 'accent', 'onAccent'], type: ['display', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 8 } } },
    url: { type: 'text', tier: 'primary', limits: { en: { chars: 40 }, zh: { chars: 40 } } },
    caption: { type: 'text', tier: 'glance', optional: true, limits: { en: { chars: 64 }, zh: { chars: 30 } } },
    mark: { type: 'object', optional: true },
    leaving: { type: 'object', optional: true },
    prior: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', seed: 1 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, urlAt = M.url * B;
    const need = Math.max(urlAt + C.settle + 3, urlAt + 4 * B, readEnd([{ text: s.name, at: M.stroke * B }, { text: s.url, at: urlAt }, ...(s.caption ? [{ text: s.caption, at: M.caption * B, glance: true }] : [])], L));
    const beats = clamp(Math.max(Math.ceil(need / B - 1e-9), s.beats || 0), 8, 16);
    return { beats, reads: [{ text: s.name, lang: L }, { text: s.url, lang: L }, ...(s.caption ? [{ text: s.caption, lang: L, tier: 'glance' }] : [])],
      cues: [{ beat: 0, kind: 'turn' }, { beat: M.stroke, kind: 'accent' }, { beat: M.name, kind: 'land' }, { beat: endBeat(beats, B), kind: 'end' }], motion: null, settled: M.url + 1, peakAt: M.name, pause: 0, lead: 0 };
  },
  validate() { return []; },
  async prepare(s, c) {
    const L = c.lang, B = 60 / c.bpm, Cc = s.colors, beats = this.plan(s, c).beats;
    let mark = null;
    if (s.mark?.src) { const im = new Image(); im.src = s.mark.src; await im.decode(); mark = { img: im, crop: s.mark.crop || [0, 0, im.naturalWidth, im.naturalHeight] }; }
    const nameTop = mark ? 560 : 400, urlTop = nameTop + 236;
    const name = lineOf(s.name, 'name', { x: W / 2, base: nameTop + 142, align: 'center', at: -1, color: Cc.onAccent, lang: L });
    const url = lineOf(s.url, 'url', { x: W / 2, base: urlTop + 38, align: 'center', at: M.url * B, color: Cc.ink, lang: L });
    const cap = s.caption ? lineOf(s.caption, 'cap', { x: W / 2, base: urlTop + 90, align: 'center', at: M.caption * B, color: Cc.dim, lang: L, stagger: 0.05 }) : null;
    return { B, beats, mark, nameTop, han: graphemes(s.name).some(isCJK), name, url, cap, endT: endBeat(beats, B) * B, prior: priorLines(s.prior, Cc, L, 0), leaving: await prepareLeaving(s.leaving, Cc, L) };
  },
  paint(ctx, u, s, c, D) {
    const Cc = s.colors, L = c.lang, B = D.B, t = u * B;
    ground(ctx, Cc);
    paintLeaving(ctx, D.leaving, t, 0, Cc, L, 'stack', B);
    if (D.mark && t >= M.mark * B) {
      const [cx, cy, cw, ch] = D.mark.crop, sc = Math.min(4 / 3, 240 / ch, READ_W / cw), w = cw * sc, h = ch * sc, x = (W - w) / 2;
      const k = 1 - (1 - progress(t, M.mark * B, 0.45)) ** 2;
      ctx.save(); ctx.beginPath(); ctx.rect(x, 236, w * k, h); ctx.clip(); ctx.drawImage(D.mark.img, cx, cy, cw, ch, x, 236, w, h); ctx.restore();
    }
    if (t >= M.stroke * B) {
      const k = ease1io(progress(t, M.stroke * B, CB.stroke * B)), bw = D.name.width + 88, bx = (W - bw) / 2, top = D.nameTop;
      // the band hugs the name from cap height to the descender (Latin); Chinese characters stand taller (the full
      // em box), so a name with Chinese gets a band from 0.91 em above the baseline to 0.19 em below
      const band = D.han ? [bx, D.name.base - 146, bw, 176] : [bx, top + 34, bw, 152];
      ctx.save(); ctx.beginPath(); ctx.rect(bx - 2, band[1] - 2, bw * k + 4, band[3] + 4); ctx.clip();
      ctx.fillStyle = Cc.accent; ctx.beginPath(); poly(ctx, band, 10); ctx.fill();
      drawLine(ctx, D.name, t);
      ctx.restore();
    }
    drawLine(ctx, D.url, t);
    if (D.cap) drawLine(ctx, D.cap, t);
    if (t >= D.endT) { const k = expOut(progress(t, D.endT, 0.4)); ctx.fillStyle = Cc.accent; ctx.fillRect(D.url.x, D.url.base + 12, D.url.width * k, 4); }
    for (const Ln of [D.prior.claim, D.prior.terms]) drawLine(ctx, Ln, t);
    header(ctx, t, { slug: s.slug, page: pageText('lockup', { of: s.of ?? 1 }, L), prev: s.prevPage, at: 0 }, Cc, L);
  },
  // the file sliding off
  track(u, s, c, D) { return [[960, D.leaving ? Math.min(1200, exitY(u * D.B, 0, CB.stack * D.B)) : 0]]; },
  blur() { return true; },
};

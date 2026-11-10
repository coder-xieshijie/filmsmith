// figure-rows — one to three figures, a beat apart, each followed by its label on the same baseline: a figure resolves
// out of scrambling symbols in its own digit slots (0.35 s) or counts up over a beat in its own format, its label
// rises when the reader reaches it, and the query line types on the first beat after the first label. Ground ramp[2]
// by default (any ramp step, `ground`). The pop splits a last hold over two beats.
// From the pulse template's `data` (assets/templates/pulse/choreo.js dataPlan, film.js paintData): baselines 640 (one),
// 480 / 790 (two), 330 / 600 / 870 (three); sizes 364 / 291 / 291 with a 186 floor; timings the template's.
import { clamp, canvasOf } from '../../../handoffs/util.js';
import { readTime } from '../../lang.js';
import { SZ, T, X0, MAXW, F, draw, rise, fitSize, widthOf, groundHex, onGround, fillGround, drawQuery, typed, popAt, secs, glyphSlots, scrambleChar, countTo, grain } from '../../look/query-ramp/kit.js';

const ITEM = { value: { type: 'text', tier: 'primary', limits: { en: { chars: 9 }, zh: { chars: 6 } } }, label: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 26 }, zh: { chars: 10 } } } };
const DEFAULT = {
  en: { query: 'scene graph · 14 of 2,400 dirty', items: [{ value: '14', label: 'tiles re-rendered' }, { value: '3.2×', label: 'vs 2.3' }, { value: '8.0×', label: 'vs 2.1' }] },
  zh: { query: 'scene graph · 14 of 2,400 dirty', items: [{ value: '14', label: '块瓦片重渲' }, { value: '3.2×', label: '比 2.3' }, { value: '8.0×', label: '比 2.1' }] },
};
const YS = { 1: [640], 2: [480, 790], 3: [330, 600, 870] };
const planOf = (s, ctx) => {
  const B = 60 / ctx.bpm, L = ctx.lang, out = [];
  let t = 0;
  (s.items || []).forEach((it, k) => {
    const at = k === 0 ? 0 : Math.max(k * B, Math.ceil((t - B) / B - 1e-9) * B);
    const resolved = at + (it.count ? B : T.scrambleSec);
    const labelAt = resolved + 0.25 * B;
    t = labelAt + readTime(it.label || '', L) + readTime(it.value, L) * 0.5;
    out.push({ ...it, at, resolved, labelAt });
  });
  const queryAt = out[0] ? Math.ceil((out[0].labelAt + T.riseSec) / B) * B : 0;
  return { rows: out, queryAt, end: Math.max(t, queryAt + (s.query ? s.query.length * T.typeSec + 1 : 0)), B };
};

export default {
  id: 'figure-rows', kind: 'scene',
  fits: ['proof', 'demo', 'problem'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: ['symbol-scramble'], props: ['query-line'], roles: ['ground', 'ink', 'dim', 'r0', 'r1', 'r2', 'r3'], type: ['display', 'text', 'mono'] },
  slots: { items: { type: 'list', count: [1, 3], of: ITEM }, query: { type: 'code', tier: 'glance', optional: true, limits: { en: { chars: 48 }, zh: { chars: 48 } } } },
  roles: ['ground', 'ink', 'dim', 'r0', 'r1', 'r2', 'r3'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], ground: 'r2', seed: 20261019 }),
  plan(s, ctx) {
    const p = planOf(s, ctx), beats = clamp(Math.ceil(p.end / p.B - 1e-9), 3, 12);
    return { beats, reads: p.rows.flatMap((r) => [{ text: r.value, lang: ctx.lang }, { text: r.label, lang: ctx.lang }]), cues: p.rows.map((r) => ({ beat: r.at / p.B, kind: 'land' })),
      motion: 'figures resolve', settled: (p.rows.at(-1)?.resolved ?? 0) / p.B, peakAt: 0, pause: 0, lead: 0 };
  },
  validate(s) { const n = (s.items || []).length; return n < 1 || n > 3 ? ['items: 1–3'] : []; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, p = planOf(s, c), n = p.rows.length;
    const lf = F('text', L, SZ.line);
    const size = Math.min(...p.rows.map((r) => fitSize(cv, r.value, 'display', L, SZ.data[n - 1], SZ.dataMin, MAXW - 48 - (r.label ? widthOf(cv, r.label, lf, L) : 0))));
    const vw = p.rows.map((r) => widthOf(cv, r.value, F('display', L, size), L)), sceneEnd = this.plan(s, c).beats * p.B, last = p.rows.at(-1);
    return { p, size, vw, ys: YS[n] || YS[3], pops: last && sceneEnd - last.resolved > 2 * p.B ? [last.resolved + Math.floor((sceneEnd - last.resolved) / p.B / 2) * p.B] : [] };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), L = c.lang, C = s.colors, g = s.ground || 'r2', col = onGround(C, g), f = F('display', L, D.size);
    fillGround(ctx, groundHex(C, g));
    D.p.rows.forEach((r, k) => {
      if (t < r.at) return;
      const y = D.ys[k], last = k === D.p.rows.length - 1, kk = last ? popAt(D.pops, t) : 1;
      ctx.save(); ctx.translate(X0, y); ctx.scale(kk, kk); ctx.translate(-X0, -y);
      if (r.count && t < r.resolved) draw(ctx, countTo(r.value, (t - r.at) / (r.resolved - r.at)), X0, y, f, col.text, L);
      else if (t < r.resolved) glyphSlots(ctx, r.value, X0, y, f, col.text, (i, ch) => (!/\d/.test(ch) ? ch : scrambleChar(i, Math.floor(t * T.scrambleHz), (s.seed || 1) + k)));
      else draw(ctx, r.value, X0, y, f, col.text, L);
      ctx.restore();
      if (r.label) rise(ctx, r.label, X0 + D.vw[k] + 48, y, t, r.labelAt, F('text', L, SZ.line), col.text, L);
    });
    if (s.query && t >= D.p.queryAt) drawQuery(ctx, typed(s.query, t, D.p.queryAt), col.quiet, L);
    grain(ctx, s.seed || 1, 0.05);
  },
  track(u, s, c, D) { const t = secs(u, c.bpm); let k = 0; D.p.rows.forEach((r, j) => { if (t >= r.at) k = j; }); return [[X0 + D.vw[k] / 2, D.ys[k] - D.size * 0.36]]; },
  blur() { return false; },
};

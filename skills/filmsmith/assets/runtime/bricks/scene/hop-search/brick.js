// hop-search — the query run over the real candidates: the restated question at the top, one cell per candidate; a
// highlight hops cell to cell (a new candidate a beat, one already seen an eighth), each new value rises under it, the
// best passing candidate's digits scramble through symbols in fixed slots and lock in amber one beat after the last hop
// while the others dim; with no pass the highlight ends on the empty slot and the verdict ("0 of 3 pass") opens at the
// anchor on ramp[1], the run's summary typing into the query line a beat later. Into a reveal (`into: 'reveal'`) the
// answer keeps scrambling and the last beat is left for the exposure build (runtime whiteout-slam).
// From the pulse template's `search` (assets/templates/pulse/choreo.js searchPlan, film.js paintSearchRow,
// paintVerdict): timings, geometry and the scramble are the template's. The verdict is computed, never typed.
import { clamp, rrect, canvasOf } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { readTime, units } from '../../lang.js';
import { SZ, T, X0, ANCHOR_Y, MAXW, F, draw, rise, fitSize, widthOf, opticalMiddle, groundHex, onGround, fillGround, aperture, drawQuery, typed, popAt, secs, glyphSlots, scrambleChar, grain } from '../../look/query-ramp/kit.js';

const CAND = { label: { type: 'text', tier: 'glance', limits: { en: { chars: 5 }, zh: { chars: 3 } } }, value: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 8 }, zh: { chars: 5 } } } };
const DEFAULT = {
  en: { line: '4K city scene under 1 s?', query: 'city-4k · warm · median of 5 runs', candidates: [{ label: '2.1', value: '4.8 s' }, { label: '2.2', value: '3.1 s' }, { label: '2.3', value: '1.9 s' }] },
  zh: { line: '4K 城市场景 1 秒内？', query: 'city-4k · warm · median of 5 runs', candidates: [{ label: '2.1', value: '4.8 秒' }, { label: '2.2', value: '3.1 秒' }, { label: '2.3', value: '1.9 秒' }] },
};
const num = (v) => parseFloat(String(v).replace(/,/g, '').match(/-?[\d.]+/)?.[0] ?? 'NaN');
const outcome = (s, L) => {
  const c = s.candidates || [], hi = s.better === 'higher';
  const pass = c.map((x) => (hi ? num(x.value) >= s.limit : num(x.value) <= s.limit));
  let best = -1; c.forEach((x, i) => { if (pass[i] && (best < 0 || (hi ? num(x.value) > num(c[best].value) : num(x.value) < num(c[best].value)))) best = i; });
  const n = pass.filter(Boolean).length;
  return { best, pass: n, verdict: L === 'zh' ? `${n} / ${c.length} 通过` : `${n} of ${c.length} pass` };
};
const planOf = (s, ctx) => {
  const B = 60 / ctx.bpm, c = s.candidates || [], o = outcome(s, ctx.lang), known = c.map((x) => (s.known || []).includes(x.label));
  const ceil = (x) => Math.ceil(x / B - 1e-9) * B, hops = [];
  let t = (known[0] ? 0.5 : 1) * B;
  for (let k = 0; k < (s.laps || 0); k++) { hops.push({ i: k % c.length, t }); t += 0.5 * B; }
  const valueAt = c.map(() => null);
  let scrambleFrom = null;
  c.forEach((x, i) => {
    if (known[i]) { hops.push({ i, t }); t += 0.5 * B; return; }
    t = ceil(t); hops.push({ i, t });
    if (i === o.best) scrambleFrom = t + T.valueSec; else valueAt[i] = t + T.valueSec;
    t += B;
  });
  if (s.slot && o.best < 0) { t = ceil(t); hops.push({ i: c.length, t }); t += B; }
  const reveal = s.into === 'reveal', lock = o.best >= 0 ? ceil(t) : null;
  const result = o.best < 0 ? ceil(t) : reveal ? null : lock + B;
  const summary = result != null ? (ctx.lang === 'zh' ? `${o.best < 0 ? '无一通过' : '最快 ' + c[o.best].value} · 上限 ${s.limit}` : `${o.best < 0 ? 'none passes' : 'best ' + c[o.best].value} · limit ${s.limit}`) : null;
  const summaryAt = result != null ? result + B : null;
  const end = Math.max(lock ?? 0, (result ?? 0) + B, summaryAt != null ? summaryAt + summary.length * T.typeSec + 1 : 0) + (reveal ? B : 0);
  return { ...o, known, hops, valueAt, scrambleFrom, lock, result, resolveAt: o.best >= 0 && !reveal ? lock : null, summary, summaryAt, end, reveal, B };
};

export default {
  id: 'hop-search', kind: 'scene',
  fits: ['demo', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 4, max: 12 },
  needs: { motions: ['symbol-scramble'], props: ['query-line'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent', 'r0', 'r1', 'r2', 'r3'], type: ['display', 'text', 'mono'] },
  slots: {
    line: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 34 }, zh: { chars: 14 } } },
    candidates: { type: 'list', count: [2, 5], of: CAND },
    limit: { type: 'number' },
    query: { type: 'code', tier: 'glance', optional: true, limits: { en: { chars: 48 }, zh: { chars: 48 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'onAccent', 'r0', 'r1', 'r2', 'r3'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], limit: 1, better: 'lower', slot: true, known: [], laps: 0, into: null, form: 'cut', seed: 20261019 }),
  plan(s, ctx) {
    const p = planOf(s, ctx), B = p.B, beats = clamp(Math.ceil(p.end / B - 1e-9), 4, 12);
    const reads = (s.candidates || []).map((x) => ({ text: x.value, lang: ctx.lang }));
    if (p.result != null) reads.push({ text: p.verdict, lang: ctx.lang });
    return { beats, reads, cues: [...p.hops.map((h) => ({ beat: h.t / B, kind: 'tick' })), ...(p.lock != null ? [{ beat: p.lock / B, kind: 'hit' }] : []), ...(p.result != null ? [{ beat: p.result / B, kind: 'land' }] : [])],
      motion: 'highlight hops', settled: (p.lock ?? p.result ?? 0) / B, peakAt: (p.lock ?? p.result ?? 0) / B, pause: 0, lead: 0 };
  },
  validate(s) { const n = (s.candidates || []).length; return n < 2 || n > 5 ? ['candidates: 2–5'] : Number.isFinite(+s.limit) ? [] : ['limit: a number']; },
  prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), p = planOf(s, c), n = (s.candidates || []).length + (s.slot && p.best < 0 ? 1 : 0), gap = 40;
    const cw = Math.min(380, (MAXW - (n - 1) * gap) / n);
    const vz = p.result != null ? fitSize(cv, p.verdict, 'display', c.lang, SZ.word, SZ.wordMin) : SZ.word;
    const sceneEnd = this.plan(s, c).beats * p.B, pops = p.result != null && sceneEnd - p.result > 2 * p.B ? [p.result + 2 * p.B] : [];
    return { p, n, cw, gap, top: 380, h: 420, x: (i) => X0 + i * (cw + gap), vz, vw: widthOf(cv, p.verdict || '', F('display', c.lang, vz), c.lang), pops };
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm), L = c.lang, C = s.colors, p = D.p, R = s.form === 'round' ? 56 : 0;
    const row = (g) => {
      const col = onGround(C, 'r0');
      fillGround(g, groundHex(C, 'r0'));
      if (s.line) draw(g, s.line, X0, 300, F('text', L, SZ.line), col.text, L);
      let hop = null; for (const h of p.hops) if (t >= h.t - 1e-9) hop = h;
      const locked = p.lock != null && t >= p.lock - 1e-9;
      for (let i = 0; i < D.n; i++) {
        const x = D.x(i), slot = i === (s.candidates || []).length, cand = (s.candidates || [])[i];
        const on = !locked && hop && hop.i === i, ans = i === p.best && locked;
        const failed = !slot && i !== p.best && (p.known[i] || (p.valueAt[i] != null && (locked || (p.result != null && t >= p.result))));
        const pop = on ? 1 + 0.035 * (1 - expOut(clamp((t - hop.t) / 0.12))) : 1;
        g.save(); g.translate(x + D.cw / 2, D.top + D.h / 2); g.scale(pop, pop); g.translate(-(x + D.cw / 2), -(D.top + D.h / 2));
        if (ans || on) { rrect(g, x, D.top, D.cw, D.h, R); g.fillStyle = ans ? col.accent || C.accent : col.hop; g.fill(); }
        rrect(g, x + 1.5, D.top + 1.5, D.cw - 3, D.h - 3, R); g.lineWidth = 3; g.strokeStyle = ans ? C.accent : on ? col.hop : col.rule;
        if (slot && !on) g.setLineDash([18, 12]); g.stroke(); g.setLineDash([]);
        const ink = ans ? col.accentInk : failed && !on ? col.dim : col.text;
        if (slot) draw(g, '?', x + 32, D.top + 220, F('display', L, SZ.cell), on ? col.text : col.dim, L);
        else {
          draw(g, cand.label, x + 32, D.top + 220, F('display', L, SZ.cell), ink, L);
          const vf = F('text', L, SZ.line);
          if (p.known[i]) draw(g, cand.value, x + 36, D.top + 370, vf, ink, L);
          else if (i === p.best && p.scrambleFrom != null && t >= p.scrambleFrom) {
            const fr = Math.floor(t * T.scrambleHz), done = p.resolveAt != null && t >= p.resolveAt;
            glyphSlots(g, cand.value, x + 36, D.top + 370, vf, ans ? col.accentInk : C.r3 || C.paper, (k, ch) => (done || !/\d/.test(ch) ? ch : scrambleChar(k, fr, s.seed || 1)));
          } else if (p.valueAt[i] != null) rise(g, cand.value, x + 36, D.top + 370, t, p.valueAt[i], vf, ink, L);
        }
        g.restore();
      }
      if (s.query) drawQuery(g, s.query, col.quiet, L);
      grain(g, s.seed || 1, 0.05);
    };
    const verdict = (g) => {
      const col = onGround(C, 'r1');
      fillGround(g, groundHex(C, 'r1'));
      draw(g, p.verdict, X0, ANCHOR_Y, F('display', L, D.vz), col.text, L, { k: popAt(D.pops, t) });
      if (p.summary) drawQuery(g, typed(p.summary, t, p.summaryAt), col.quiet, L);
      grain(g, (s.seed || 1) + 5, 0.05);
    };
    if (p.result != null && t >= p.result) {
      if (t < p.result + T.apSec) { row(ctx); ctx.save(); aperture(ctx, s.form === 'round' ? 'circle' : 'band', (t - p.result) / T.apSec, [X0 + D.vw / 2, opticalMiddle(D.vz, L)]); verdict(ctx); ctx.restore(); }
      else verdict(ctx);
    } else row(ctx);
  },
  track(u, s, c, D) { const t = secs(u, c.bpm); let h = D.p.hops[0]; for (const x of D.p.hops) if (t >= x.t) h = x; return [[D.x(h ? h.i : 0) + D.cw / 2, D.top + D.h / 2]]; },
  blur() { return false; },
};

// unit-periods — the same squares stand in one column per period (≤ 24), oldest left; the protagonist's squares sit
// at the base of each column and light up together on the reveal beat, each column's value counting with its landed
// squares. `reread: 'trend'`: the columns already standing step back to `rest`, each column's top becomes a point and
// a curve in the accent draws through the points: the same counts read as a trend (only where the data has that
// second reading). `stagger: 'together'`: every period's squares leave at once and land in 2 beats (the template's
// step-wipe entry lands the whole chart at once; use it when the scene is short), instead of period by period.
// `periods[i].accent`: the protagonist's real count in that period (the data's cross-tab; they must add up to the
// protagonist's count); without it the protagonist's squares are spread over the periods as the data order falls.
// From the tally template's `timeline` and `trend` scenes (assets/templates/tally/layouts.js; the trend is the
// template's use of lib/handoffs re-encode, drawn here on the squares): geometry and timings are the template's.
import { text } from '../../../handoffs/util.js';
import { F, setup, paintGround, drawUnits, digits, enter, pulse, label, labelFont, readTime, title, landed, clamp, smooth, mix, ROLE, TIME } from '../../motion/unit-flight/units.js';

const NAMED = (w, z) => ({ name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: w }, zh: { chars: z } } }, count: { type: 'number' } });
const GROUPS = {
  en: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }],
  zh: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }],
};
const PERIODS = { en: ['2019', '2020', '2021', '2022', '2023', '2024'], zh: ['2019', '2020', '2021', '2022', '2023', '2024'] };
const COUNTS = [120, 70, 64, 82, 108, 130];
const DEFAULT = {
  en: { title: '*Rejections* peaked early.', sub: 'Renders per year of creation', callout: '64 → 130' },
  zh: { title: '*驳回*在早期最多。', sub: '按创建年份的渲染数', callout: '64 → 130' },
};
const timesOf = (s, ctx) => {
  const trend = s.reread === 'trend', together = s.stagger === 'together';
  const land = trend ? 0 : 1 + (together ? 0 : ((s.periods || []).length - 1) * 0.25) + TIME.depart + TIME.flight;
  const reveal = trend ? 1 : Math.ceil(land), curve = trend ? [1, 2] : null;
  const read = ((readTime(s.title, ctx.lang) + readTime(s.callout || '', ctx.lang)) * ctx.bpm) / 60;
  return { trend, land, reveal, curve, beats: clamp(Math.ceil((trend ? 3 : reveal) + Math.max(1, read * 0.5) + 0.75), 4, 14) };
};

export default {
  id: 'unit-periods', kind: 'scene',
  fits: ['problem', 'proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 4, max: 14 },
  needs: { motions: ['unit-flight', 're-encode', 'step-wipe'], props: ['chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base', 'rest'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } },
    sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
    callout: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 4, chars: 20 }, zh: { chars: 10 } } },
    periods: { type: 'list', count: [2, 24], of: { ...NAMED(9, 5), accent: { type: 'number', optional: true } } },
    groups: { type: 'list', count: [1, 9], of: NAMED(14, 6) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base', 'rest'],
  defaults: (ctx = {}) => {
    const L = ctx.lang === 'zh' ? 'zh' : 'en';
    return { ...DEFAULT[L], groups: GROUPS[L], periods: PERIODS[L].map((name, i) => ({ name, count: COUNTS[i] })), accent: 1, reread: 'timeline', from: 'bands', mark: 'square', seed: 3 };
  },
  plan(s, ctx) {
    const T = timesOf(s, ctx);
    return { beats: T.beats, reads: [{ text: s.title, lang: ctx.lang }, { text: s.callout, lang: ctx.lang }], cues: T.trend ? [{ beat: 1, kind: 'accent' }, { beat: 2, kind: 'land' }] : [{ beat: 1, kind: 'turn' }, { beat: T.reveal, kind: 'accent' }],
      motion: T.trend ? 're-encode: columns become a curve' : 'mark then fly into period columns', settled: T.trend ? 3 : T.land, peakAt: T.reveal, pause: T.beats - T.reveal };
  },
  validate(s) { const n = (s.periods || []).length; return n >= 2 && n <= 24 ? [] : ['periods: 2 to 24']; },
  async prepare(s, c) {
    const T = timesOf(s, c), D = await setup(s, c, 'periods', { from: T.trend ? 'periods' : s.from, ...(s.stagger === 'together' ? { groupStep: 0 } : {}) });
    D.T = T;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, T = D.T, G = D.B.geo, n = G.per.length, rest = C.rest || mix(C.ink, C.ground, 0.6);
    paintGround(ctx, s, D);
    // the timeline: the protagonist's squares fly neutral and light up together on the reveal beat
    // the trend: every column steps back to rest as its point lands (left to right over the first beat)
    const back = (pi) => (T.trend ? smooth((u - 1 - (pi / Math.max(1, n - 1)) * 0.8) / 0.4) : 0);
    drawUnits(ctx, u, D.I, D.A, D.B, D.S, C, s.mark, (k, q) => {
      const pi = D.B.L.grp[k];
      if (T.trend) return { ...q, col: mix(q.col, rest, back(pi)) };
      if (D.B.L.role[k] !== ROLE.accent) return q;
      return { ...q, col: mix(C.base || mix(C.ink, C.ground, 0.22), C.accent, smooth((u - T.reveal) / 0.4)) };
    });
    title(ctx, s, u, s, L, bpm, { t0: 0.25 });
    const lf = labelFont(L), vf = F('text', L, 28, 700), pts = [];
    (s.periods || []).forEach((p, pi) => {
      const x = G.xc(pi), cnt = T.trend ? G.per[pi] : landed(D.I, D.S, D.B, pi, u);
      const [la] = enter(u, T.trend ? -1 : 1 + pi * 0.25, bpm, 0);
      text(ctx, String(p.name), x, G.base + 38, lf, { color: C.dim, align: 'center', alpha: la });
      const topY = G.top[pi];
      pts.push([x, topY - 10]);
      if (cnt > 0) digits(ctx, cnt, x, topY - 22, vf, T.trend ? mix(C.ink, C.dim, back(pi)) : C.ink, { align: 'center', alpha: T.trend ? 1 - back(pi) : clamp(cnt / 3) });
    });
    if (T.trend) {
      // points land on the tops (spring), then the curve draws through them over the second beat
      const lineU = clamp(u - 2);
      ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      const segs = pts.length - 1, upto = lineU * segs;
      pts.forEach(([x, y], i) => {
        if (i > Math.ceil(upto)) return;
        if (i === 0) { ctx.moveTo(x, y); return; }
        const [x0, y0] = pts[i - 1], f = Math.min(1, upto - (i - 1));
        const cx = (x0 + x) / 2;
        if (f >= 1) ctx.bezierCurveTo(cx, y0, cx, y, x, y); else ctx.lineTo(x0 + (x - x0) * f, y0 + (y - y0) * f);
      });
      if (lineU > 0) ctx.stroke();
      pts.forEach(([x, y], i) => { const a = smooth((u - 1 - (i / Math.max(1, n - 1)) * 0.8) / 0.3); if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 9 * (1 + 0.3 * pulse(u, 1 + (i / Math.max(1, n - 1)) * 0.8, bpm, 0.3)), 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      if (s.callout) { const [ca] = enter(u, 3, bpm, 0); const [x, y] = pts[pts.length - 1]; text(ctx, label(s.callout, L), x, y - 46, lf, { color: C.accent, align: 'right', alpha: ca }); }
    } else if (s.callout) { const [ca] = enter(u, T.reveal + 0.5, bpm, 0); text(ctx, label(s.callout, L), 1824, 330, lf, { color: C.accent, align: 'right', alpha: ca }); }
  },
  track(u, s, c, D) { const k = D.I.N - 1; return [[D.B.L.x[k], D.B.L.y[k]]]; },
  blur() { return false; },
};

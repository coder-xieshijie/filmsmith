// unit-close — the lock-up of a counted film: up to three numbers land on beats a beat apart (the protagonist's
// larger, in the accent), the same squares lay out as one rule under them, and the protagonist's own squares (≤ 56)
// wait under its number as neutral beads that light up one by one from the last downbeat; a closing line under the
// rule. Without beads, an accent rule draws under the protagonist's label on that downbeat.
// From the tally template's `close` scene (assets/templates/tally/layouts.js close, timeline.js closing light): the
// measured stack (number, label, rule, line), bead pitch and the light's timing are the template's.
import { text } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { F, MX, setup, paintGround, drawUnits, digits, enter, pulse, lines, readTime, clamp, smooth, mix, secs, TIME } from '../../motion/unit-flight/units.js';

const NUMBER = { value: { type: 'number' }, label: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 22 }, zh: { chars: 8 } } } };
const GROUP = { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, count: { type: 'number' } };
const DEFAULT = {
  en: { numbers: [{ value: 574, label: 'renders in the archive' }, { value: 104, label: 'rejected' }, { value: 38, label: 'still drafts' }], line: '238 made it through.',
        groups: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 38 }, { name: 'Review', count: 130 }, { name: 'Archived', count: 64 }] },
  zh: { numbers: [{ value: 574, label: '档案里的渲染' }, { value: 104, label: '被驳回' }, { value: 38, label: '仍是草稿' }], line: '238 次走到了发布。',
        groups: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 38 }, { name: '审阅中', count: 130 }, { name: '已归档', count: 64 }] },
};
const XS = [MX, 700, 1300];
const timesOf = (s, ctx) => {
  const n = (s.numbers || []).length, land = 1 + TIME.group + TIME.depart + TIME.flight, num = (i) => 1 + i;
  const lineAt = num(n - 1) + 1.25, read = (readTime(s.line || '', ctx.lang) * ctx.bpm) / 60;
  const light = Math.max(Math.ceil(lineAt + 1), Math.ceil(num(n - 1) + secs(1, 60) * 0 + 2));
  return { n, land, num, lineAt, light, beats: clamp(Math.ceil(Math.max(light + 1.5, lineAt + read + 0.5)), 6, 14) };
};

export default {
  id: 'unit-close', kind: 'scene',
  fits: ['lockup', 'claim'],
  surface: ['canvas'],
  beats: { min: 6, max: 14 },
  needs: { motions: ['unit-flight', 'rank-sweep'], props: ['chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    numbers: { type: 'list', count: [1, 3], of: NUMBER },
    line: { type: 'text', tier: 'primary', claim: true, optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
    groups: { type: 'list', count: [1, 9], of: GROUP },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], hero: 2, beads: 2, from: 'sorted', by: 2, mark: 'square', seed: 3 }),
  plan(s, ctx) {
    const T = timesOf(s, ctx);
    return { beats: T.beats, reads: [{ text: s.line, lang: ctx.lang }], cues: [{ beat: 1, kind: 'turn' }, ...Array.from({ length: T.n }, (_, i) => ({ beat: T.num(i) + 0.9, kind: 'land' })), { beat: T.light, kind: 'end' }],
      motion: 'squares into the rule, numbers on beats, beads light', settled: T.light + 1, peakAt: T.light, pause: T.beats - T.light - 1 };
  },
  validate(s) { const n = (s.numbers || []).length; return n >= 1 && n <= 3 ? [] : ['numbers: one to three']; },
  async prepare(s, c) {
    const xs = XS.slice(3 - (s.numbers || []).length), D = await setup({ ...s, beadX: xs[s.hero] ?? XS[2] }, c, 'rule', { from: s.from, fromParams: { by: s.by } });
    D.T = timesOf(s, c); D.xs = xs;
    return D;
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, T = D.T, G = D.B.geo;
    paintGround(ctx, s, D);
    // the beads light one by one from the last downbeat, within a beat, each popping × 1.45
    const beadT = (r) => T.light + r * Math.min(0.25, 1 / Math.max(1, G.beads));
    drawUnits(ctx, u, D.I, D.A, D.B, D.S, C, s.mark, (k, q) => {
      if (D.B.L.grp[k] !== 1) return q;
      const r = Math.round(D.B.L.rank[k] * G.beads), t0 = beadT(r), on = smooth((u - t0) / 0.15), pop = 1 + 0.45 * Math.sin(Math.PI * clamp(secs(u - t0, bpm) / 0.35)), ns = q.s * pop;
      return { ...q, col: mix(q.col, C.accent, on), x: q.x - (ns - q.s) / 2, y: q.y - (ns - q.s) / 2, s: ns };
    });
    const lf = F('text', L, 40, 600, 'display');
    (s.numbers || []).forEach((nb, i) => {
      const hero = i === s.hero, t0 = T.num(i), x = D.xs[i], size = hero ? 273 : 150;
      const [a] = enter(u, t0 - 0.1, bpm, 0);
      const land = 1 + (hero ? 0.12 : 0) * pulse(u, t0 + secs(0.9, 60) * 0, bpm, 0.3);
      ctx.save(); ctx.translate(x, 560); ctx.scale(land, land);
      digits(ctx, nb.value * expOut(secs(u - t0, bpm) / 0.9), 0, 0, F('display', L, size, 800, 'display'), hero ? C.accent : C.ink, { alpha: a });
      ctx.restore();
      text(ctx, nb.label, x + 4, 616, lf, { color: C.ink, alpha: a });
      if (hero && !G.beads) { const w = smooth((u - T.light) / 0.6); ctx.fillStyle = C.accent; ctx.fillRect(x, 640, 300 * w, 4); }
    });
    if (s.line) {
      const [la, dy] = enter(u, T.lineAt, bpm, 14);
      lines(ctx, s.line, lf, 1200, L).forEach((ln, i) => text(ctx, ln, MX + 4, 770 + i * 50 + dy, lf, { color: C.ink, alpha: la }));
    }
  },
  track(u, s, c, D) { return [[D.B.L.x[0], D.B.L.y[0]]]; },
  blur() { return false; },
};

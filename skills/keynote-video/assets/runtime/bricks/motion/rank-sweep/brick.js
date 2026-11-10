// rank-sweep — the closing light of a chart made of unit marks: a sweep by rank runs along the marks; every mark that is
// not the protagonist steps back from `base` to `rest`, and the protagonist's marks swell × 1.4 one by one along their
// band, so the last bar ends on the one group the film is about; its value pulses as the sweep reaches the band's end.
// `kind: 'glint'`: the quiet version for a stillness over 1.5 beats: the protagonist's marks (else the base ones)
// swell × 1.22 for 0.35 s in a 0.6-beat sweep by rank, and nothing changes colour.
// From the tally template (assets/templates/tally/squares.js closing light and glints, timeline.js CHART_LIGHT_SPAN):
// timings and sizes are the template's; here it runs on any unit layout (units.js).
import { clamp, mix } from '../../../handoffs/util.js';
import { setup, paintGround, drawMark, tones, ROLE, secs } from '../unit-flight/units.js';

const GROUPS = {
  en: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }],
  zh: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }],
};
const span = (P) => (P.kind === 'glint' ? 0.6 : 2.6);

export default {
  id: 'rank-sweep', kind: 'motion',
  tier: 'T0', family: 'shape',
  beats: 3, beatsFor: (P) => (P.kind === 'glint' ? 2 : 3),
  surface: ['canvas'],
  roles: ['ground', 'panel', 'base', 'rest', 'accent'],
  from: 'a chart of unit marks at rest, every group lit', to: 'the same chart with only the protagonist lit (glint: unchanged)',
  interpolates: ['colour base → rest by rank (not the protagonist)', 'size × 1.4 and back by rank (the protagonist)'],
  summary: 'A sweep by rank runs along a chart of unit marks: the others step back to grey, the protagonist swells mark by mark; or a quiet glint in a long hold.',
  theory: 'Emphasis works only when everything else is alike (Hunt 1995 on the isolation effect): the closing move removes the competition rather than adding a colour; a glint is a T0 change that is not new text (timing API 3).',
  defaults: (ctx = {}) => ({ groups: GROUPS[ctx.lang === 'zh' ? 'zh' : 'en'], accent: 1, layout: 'bands', kind: 'close', mark: 'square', seed: 3, bpm: 120, grain: 0.05 }),
  async prepare(P) { return setup(P, { lang: P.lang || 'en' }, P.layout || 'bands', { from: null }); },
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(ctx, S, P, D) {
    paintGround(ctx, P, D);
    const C = P.colors, T = tones(C), L = D.B.L, beats = this.beatsFor(P), u = S.u * beats, sp = span(P), glint = P.kind === 'glint';
    const hasHero = L.role.includes(ROLE.accent);
    for (let k = 0; k < D.I.N; k++) {
      if (L.role[k] === ROLE.hidden) continue;
      const t0 = 0.25 + L.rank[k] * sp, hero = L.role[k] === ROLE.accent;
      let col = T[L.role[k]], s = L.s[k];
      if (!glint && !hero) col = mix(T[ROLE.base], T[ROLE.rest], clamp((u - t0) / 0.4));
      const swells = glint ? (hasHero ? hero : L.role[k] === ROLE.base) : hero;
      if (swells) { const d = secs(u - t0, P.bpm || 120) / 0.35; s *= 1 + (glint ? 0.22 : 0.4) * Math.sin(Math.PI * clamp(d)); }
      ctx.fillStyle = col; drawMark(ctx, P.mark, L.x[k] - (s - L.s[k]) / 2, L.y[k] - (s - L.s[k]) / 2, s);
    }
  },
  track() { return [[960, 540]]; },
};

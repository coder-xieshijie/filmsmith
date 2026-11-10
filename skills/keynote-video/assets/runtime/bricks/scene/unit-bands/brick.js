// unit-bands — the same squares sort themselves into one band per category, top band first, so the longest band
// visibly wins; each band's value counts up as its squares land, the protagonist's band in the accent. Optional: a
// roulette frame hops band to band as they land, laps back, slows and locks on the protagonist, whose squares light
// up as the title names it (`pick: 'roulette'`); or the same squares cut one block into segments, part of the whole
// (`form: 'share'`). It flies from any earlier unit layout (`from`, default the count's grid).
// From the tally template's `columns` and `share` scenes (assets/templates/tally/layouts.js, timeline.js roulette
// schedule after lib/handoffs roulette-lock): geometry, band timing (eighth notes) and the roulette's rhythm.
import { text } from '../../../handoffs/util.js';
import { F, MX, setup, paintGround, drawUnits, digits, enter, pulse, label, labelFont, readTime, title, landed, ROLE, TIME, clamp, smooth, mix } from '../../motion/unit-flight/units.js';

const GROUP = { name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, count: { type: 'number' } };
const DEFAULT = {
  en: { title: 'Second most common fate: *Rejected*.', sub: 'Status field · 5 values', callout: '← 18% of all 574', groups: [{ name: 'Shipped', count: 238 }, { name: 'Rejected', count: 104 }, { name: 'Draft', count: 92 }, { name: 'Review', count: 76 }, { name: 'Archived', count: 64 }] },
  zh: { title: '第二常见的结局：*驳回*。', sub: '状态字段 · 5 种取值', callout: '← 占全部 574 的 18%', groups: [{ name: '已发布', count: 238 }, { name: '已驳回', count: 104 }, { name: '草稿', count: 92 }, { name: '审阅中', count: 76 }, { name: '已归档', count: 64 }] },
};
// the roulette (lib/handoffs roulette-lock's schedule): a hop every half beat from the first landing, one lap through
// the bands, back from the top to the protagonist, the last two intervals a beat; it locks on a whole beat
const roulette = (B, acc, start) => {
  const seq = [...Array(B).keys(), ...Array(acc + 1).keys()], t = [];
  let x = start;
  seq.forEach((_, i) => { t.push(x); x += i >= seq.length - 3 ? 1 : 0.5; });
  const lock = Math.ceil(t[t.length - 1]);
  t[t.length - 1] = lock;
  return { seq, t, lock };
};
const timesOf = (s, ctx) => {
  const B = (s.groups || []).length || 1, land = 1 + (B - 1) * TIME.group + TIME.depart + TIME.flight;
  const R = s.pick === 'roulette' && s.accent >= 0 ? roulette(B, s.accent, 1 + TIME.flight) : null;
  const reveal = R ? R.lock : Math.ceil(land);
  const read = ((readTime(s.title, ctx.lang) + (s.callout ? readTime(s.callout, ctx.lang) : 0)) * ctx.bpm) / 60;
  return { B, land, R, reveal, beats: clamp(Math.ceil(Math.max(land, reveal) + Math.max(1, read * 0.6) + 0.75), 6, 16) };
};

export default {
  id: 'unit-bands', kind: 'scene',
  fits: ['problem', 'demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 16 },
  needs: { motions: ['unit-flight', 'roulette-lock'], props: ['unit-mark', 'chart-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } },
    sub: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 40 }, zh: { chars: 16 } } },
    callout: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 26 }, zh: { chars: 14 } } },
    groups: { type: 'list', count: [2, 9], of: GROUP },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent', 'base'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], accent: 1, pick: 'roulette', form: 'bands', from: 'grid', mark: 'square', seed: 3 }),
  plan(s, ctx) {
    const T = timesOf(s, ctx);
    return { beats: T.beats, reads: [{ text: s.title, lang: ctx.lang }, { text: s.callout, lang: ctx.lang }],
      cues: [{ beat: 1, kind: 'turn' }, ...Array.from({ length: T.B }, (_, g) => ({ beat: 1 + g * TIME.group + TIME.flight + TIME.depart, kind: 'land' })), ...(T.R ? T.R.t.map((b) => ({ beat: b, kind: 'accent' })) : []), { beat: T.reveal, kind: 'accent' }],
      motion: 'mark then fly into bands', settled: T.land, peakAt: T.reveal, pause: T.beats - Math.max(T.land, T.reveal) };
  },
  validate(s) { const e = []; if ((s.groups || []).length < 2 || s.groups.length > 9) e.push('groups: 2 to 9 bands (fold the rest into one)'); return e; },
  async prepare(s, c) {
    const form = s.form === 'share' ? 'share' : 'bands';
    const D = await setup({ ...s, accent: s.accent }, c, form);
    D.T = timesOf(s, c);
    return D;
  },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, T = D.T, G = D.B.geo, share = s.form === 'share';
    paintGround(ctx, s, D);
    const lit = (k) => !T.R || D.B.L.role[k] !== ROLE.accent;
    // with the roulette the bands land neutral; the protagonist's squares light up, by rank, when the frame locks
    drawUnits(ctx, u, D.I, D.A, D.B, D.S, C, s.mark, (k, q) => {
      if (lit(k)) return q;
      const base = mix(q.col, C.base || mix(C.ink, C.ground, 0.22), 1), r = smooth((u - T.reveal - D.B.L.rank[k] * 0.4) / 0.5);
      const pop = 1 + 0.45 * Math.sin(Math.PI * clamp((u - T.reveal - D.B.L.rank[k] * 0.4) / 0.6)), ns = q.s * (r > 0 && r < 1 ? pop : 1);
      return { ...q, col: mix(base, C.accent, r), x: q.x - (ns - q.s) / 2, y: q.y - (ns - q.s) / 2, s: ns };
    });
    title(ctx, s, u, s, L, bpm, { t0: 0.25, accentAt: T.R ? T.reveal : null });
    const lf = labelFont(L), vf = F('text', L, 28, 700), names = (s.groups || []).map((g) => g.name);
    names.forEach((name, gi) => {
      const n = landed(D.I, D.S, D.B, gi, u), tIn = 1 + gi * TIME.group, hero = gi === s.accent && (!T.R || u >= T.reveal);
      const [la] = enter(u, tIn, bpm, 0);
      if (!share) {
        const yc = G.yc(gi);
        text(ctx, String(name), G.labelRight, yc + 1, lf, { color: hero ? C.ink : C.dim, align: 'right', baseline: 'middle', alpha: la });
        if (n <= 0) return;
        const sc = hero ? 1 + 0.35 * pulse(u, T.reveal, bpm, 0.32) : 1;
        ctx.save(); ctx.translate(G.endX[gi] + 18, yc); ctx.scale(sc, sc);
        const w = digits(ctx, n, 0, 9, vf, hero ? C.accent : C.ink);
        ctx.restore();
        if (hero && s.callout) { const [ca] = enter(u, T.reveal + 0.5, bpm, 0); text(ctx, label(s.callout, L), G.endX[gi] + 18 + w + 26, yc + 9, lf, { color: C.accent, alpha: ca }); }
      } else {
        const x = G.x0s[gi], tot = D.I.N || 1;
        text(ctx, String(name), x, G.y0 - 66, lf, { color: hero ? C.ink : C.dim, alpha: la });
        if (n <= 0) return;
        const pf = F('text', L, 40, 600), sc = hero ? 1 + 0.35 * pulse(u, T.reveal, bpm, 0.32) : 1;
        ctx.save(); ctx.translate(x, G.y0 - 18); ctx.scale(sc, sc);
        digits(ctx, (100 * n) / tot, 0, 0, pf, hero ? C.accent : C.ink, { fmt: (v) => `${Math.round(v)}%` });
        ctx.restore();
      }
    });
    if (share && s.callout) { const [ca] = enter(u, T.reveal + 0.5, bpm, 0); text(ctx, label(s.callout, L), MX, G.y0 + G.h + 64, lf, { color: C.accent, alpha: ca }); }
    // the roulette's frame: a 3 px accent outline round the band it is on; it pops on its first hop, jumps (no blur)
    if (!share && T.R && u >= T.R.t[0]) {
      let i = 0; while (i + 1 < T.R.t.length && u >= T.R.t[i + 1]) i++;
      const gi = T.R.seq[i], hgt = G.rows * G.p - (G.p - G.s), pad = Math.min(14, (G.band - hgt) / 2 + 6);
      const right = Math.max(...G.endX) + 150, left = MX - 18, pop = 1 + 0.12 * pulse(u, T.R.t[0], bpm, 0.25);
      const y = 330 + gi * G.band - pad, w = (right - left) * pop, h = (hgt + 2 * pad) * pop;
      ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect((left + right) / 2 - w / 2, y + (hgt + 2 * pad) / 2 - h / 2, w, h, 8); ctx.stroke(); ctx.restore();
    }
  },
  track(u, s, c, D) { const k = D.I.N - 1; return [[D.B.L.x[k], D.B.L.y[k]]]; },
  blur() { return false; },
};

// star-sweep — one thread gathers every star (the climax move): the spine retracts into the mascot, the thread's head
// sweeps the sky in three passes along one smooth path, catching each star as it passes (the star snaps onto the line,
// brightens and rides it), the line straightens into a gentle tether, and the caught stars flow along it into its end,
// which glows as one point (where the scene opens its panel).
// From the stream template: plan.js GATHER (the 17 waypoints, Catmull-Rom resampled to 400 points, SL the tether, the
// morph over 1.5 beats, each star's catch time and flow window) and film.js renderClose (the sweep, the head, the seed's
// glow) and renderSpine (the retract); timing from sched.js close (r0 0.1, gA 0.9, gB 4.6, flowA 5.0, flowB 6.9, unfold
// 7.0 beats).
import { palOf, thread, glow, star, straight, catmull, cumLen, atLen, E, seg, lerp, clamp } from '../../prop/glow-thread/draw.js';
import { night, perch, lighter, SPINE } from '../../prop/glow-thread/demo.js';
import { mulberry32 } from '../../../rng.js';

const K = { r0: 0.1, gA: 0.9, gB: 4.6, flowA: 5.0, flowB: 6.9, unfold: 7.0 }, BEATS = 8;
const SRC = [SPINE.x, SPINE.top], SEED = [1060, 600];
const WP = [SRC, [560, 300], [1000, 330], [1450, 290], [1800, 360], [1820, 480], [1450, 520], [1000, 470], [560, 520], [430, 640], [760, 700], [1200, 620], [1500, 690], [1700, 800], [1400, 880], [1150, 760], SEED];
const GN = 400;
export default {
  id: 'star-sweep', kind: 'motion',
  tier: 'T3', family: 'line-path', beats: BEATS,
  surface: ['canvas'],
  roles: ['ground', 'accent', 'glow', 'core'],
  from: 'stars scattered over the sky, the spine down the left', to: 'one glowing point at the end of a tether from the mascot, every star gathered into it',
  interpolates: ['the spine retracting (io2, 0.1–0.9 beat)', 'the head along the sweep path (io2, 0.9–4.6 beats), each star caught as the head passes its nearest point', 'the path morphing into the tether (io2 over 1.5 beats from 5.0)', 'each star along the line into the end (in3, 5.0 → 6.9 − 1.6 × its distance left), fading over its last 12 %', 'the end point\'s glow (6.6–7.2 beats)'],
  summary: 'The thread sweeps the sky in three passes catching every star, straightens, and the stars flow along it into one glowing point.',
  theory: 'Gathering scattered marks into one point turns many into one (closure, Gestalt), the climax of a story of dispatch; the long sweep then the short flow is anticipation and release (Thomas & Johnston).',
  defaults: () => ({ palette: 'night', count: 18, seed: 7 }),
  prepare(P) {
    const raw = catmull(WP, 24), L = cumLen(raw), tot = L[L.length - 1];
    const GU = Array.from({ length: GN }, (_, j) => atLen(raw, L, (j / (GN - 1)) * tot));
    const rnd = mulberry32((P.seed ?? 7) * 7919), stars = [];
    for (let i = 0; i < (P.count ?? 18); i++) { let x, y, g = 0; do { x = 330 + rnd() * 1530; y = 250 + rnd() * 600; g++; } while (g < 400 && stars.some((s) => Math.hypot(s.x - x, s.y - y) < 96)); stars.push({ x, y, size: 0.7 + rnd() * 0.3, tw: rnd() * 6.28 }); }
    const headF = (tb) => E.io2(seg(tb, K.gA, K.gB));
    stars.forEach((s) => { let bj = 0, bd = 1e9; GU.forEach((p, j) => { const d = Math.hypot(p[0] - s.x, p[1] - s.y); if (d < bd) { bd = d; bj = j; } }); s.fk = bj / (GN - 1); s.np = GU[bj]; let tt = K.gA; while (tt < K.gB && headF(tt) < s.fk) tt += 1 / 120; s.catchT = tt; s.flow = [K.flowA, K.flowB - 1.6 * (1 - s.fk)]; });
    return { ...palOf(P.colors, P.palette), GU, stars, headF };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: Math.min(1, Math.max(0, p)), tb: Math.min(1, Math.max(0, p)) * BEATS }; },
  SL(f) { return [lerp(SRC[0], SEED[0], f), lerp(SRC[1], SEED[1], f) - 80 * Math.sin(Math.PI * f)]; },
  pt(D, f, m) { const x = clamp(f) * (GN - 1), j = Math.min(GN - 2, Math.floor(x)), r = x - j; const p = [lerp(D.GU[j][0], D.GU[j + 1][0], r), lerp(D.GU[j][1], D.GU[j + 1][1], r)]; if (m <= 0) return p; const q = this.SL(f); return [lerp(p[0], q[0], m), lerp(p[1], q[1], m)]; },
  pos(D, s, tb) {
    const morph = E.io2(seg(tb, K.flowA, K.flowA + 1.5));
    if (tb < s.catchT) return { x: s.x, y: s.y, k: 0, c: 0 };
    const sn = E.io2(seg(tb, s.catchT, s.catchT + 0.5));
    if (tb >= K.flowA) { const k = seg(tb, s.flow[0], s.flow[1]), p = this.pt(D, lerp(s.fk, 1, E.in3(k)), morph); return { x: p[0], y: p[1], k, c: 1 }; }
    return { x: lerp(s.x, s.np[0], sn), y: lerp(s.y, s.np[1], sn), k: 0, c: seg(tb, s.catchT - 0.12, s.catchT + 0.24) };
  },
  paint(ctx, S, P, D) {
    const tb = S.tb, morph = E.io2(seg(tb, K.flowA, K.flowA + 1.5)), hf = tb < K.flowA ? D.headF(tb) : 1;
    night(ctx, D.P, 1);
    lighter(ctx, () => {
      if (tb < K.gA) { const ret = E.io2(seg(tb, K.r0, K.gA)), bot = SPINE.bottom - (SPINE.bottom - SPINE.top) * ret; thread(ctx, D.C, straight([SPINE.x, SPINE.mascot[1] + 34], [SPINE.x, bot], 60), 1); if (ret > 0) { glow(ctx, SPINE.x, bot, 44, D.C.line, 0.6); glow(ctx, SPINE.x, bot, 12, D.C.core, 0.95); } }
      D.stars.forEach((s) => { const q = this.pos(D, s, tb), a = lerp(0.45, 1, q.c) * (1 - seg(q.k, 0.88, 1)) * (0.86 + 0.14 * Math.sin(s.tw)); if (a > 0.01) star(ctx, D.C, q.x, q.y, s.size * (1 + 0.25 * q.c), a); });
      if (tb >= K.gA) {
        const n = Math.max(2, Math.ceil(hf * (GN - 1)) + 1), pts = []; for (let j = 0; j < n; j++) pts.push(this.pt(D, Math.min(hf, j / (GN - 1)), morph));
        thread(ctx, D.C, pts, 1, 1.05);
        if (tb < K.flowA) { const h = pts[pts.length - 1]; glow(ctx, h[0], h[1], 46, D.C.line, 0.7); glow(ctx, h[0], h[1], 11, D.C.core, 1); }
      }
      const sd = seg(tb, K.flowB - 0.6, K.unfold + 0.4);
      if (sd > 0) { glow(ctx, SEED[0], SEED[1], 140, D.C.line, 0.6 * sd); glow(ctx, SEED[0], SEED[1], 24, D.C.core, sd); }
    });
    perch(ctx, D.C);
  },
  track(S, P, D) { const tb = S.tb; return [tb >= K.gA && tb < K.flowA ? this.pt(D, D.headF(tb), 0) : null, ...D.stars.slice(0, 6).map((s) => { const q = this.pos(D, s, tb); return [q.x, q.y]; })]; },
};

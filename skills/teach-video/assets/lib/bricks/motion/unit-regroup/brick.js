// unit-regroup — one dot is one unit: the same dots migrate between layouts on staggered springs (scattered → a
// cluster per group → a column per group → the digits of the total), stretching into capsules along their way and
// round again when they stop, so the eye can follow one dot from a crowd into a chart into a number.
// Adapted from video-shotcraft demos/data/chart-live-moves/UnitDotSwarmRegroupV2.tsx (card
// references/shots/data/chart-live-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); colours by role (the protagonist group in the accent,
// the others light and dark tones of ink; every dot takes the accent as it lands in the total); brand, headlines and
// group names removed (the film's slots, illustrative by default); counts, the value of one dot and the layouts are
// parameters, every number on screen is computed from them (group values, the total the last layout spells); the
// digits are sampled from the display font instead of a hand-drawn skeleton, so any total can be spelled; jitter comes
// from the runtime's seeded hash; the opening pop-in is the scene's and the slow push of the hold is the style's.
import { clamp, lerp, mix, rgba, text, measure, canvasOf, ground } from '../../../handoffs/util.js';
import { hash } from '../../../rng.js';
import { ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { figures, grouped, spring } from '../digit-roll/brick.js';

const F0 = 24, LEG = 37.5, R = 10, STAG = 8, DUR = 24;  // upstream legs start at 24, 62, 100: here 24, 61.5, 99
const SPRING = { stiffness: 150, damping: 13, mass: 0.8, dur: DUR, rest: 0.0001 };
const BASE = 900, SP = 23, VOGEL = 12.6, GLYPH = { y: 372, h: 300, w: 1300 };

export default {
  id: 'unit-regroup', kind: 'motion',
  tier: 'T2', family: 'shape', beats: 7.5,
  beatsFor: (P) => (LEG * (P.layouts.length - 1)) / 15,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'accent'],
  from: 'the dots in the first layout (scattered by default), one dot per unit',
  to: 'the same dots in the last layout (the digits of the total by default), with its labels',
  interpolates: ['each dot: layout k → k + 1 on a spring (stiffness 150, damping 13, mass 0.8, 24 frames), staggered up to 8–12 frames by layout', 'speed stretch up to +20 px along the motion', 'labels and headline per layout', 'dots take the accent as they land in the total'],
  summary: 'One dot is one unit: the same dots migrate on staggered springs from a crowd into a cluster per group, a column per group and the digits of the total.',
  theory: 'Unit charts keep the count literal (one mark, one item; Neurath\'s isotype) and a migration that never adds or drops a mark shows that the chart and the total are the same items (object constancy, Heer & Robertson 2007); stretch along the motion records speed (Geisler 1999).',
  defaults: (ctx = {}) => ({
    groups: ctx.lang === 'zh'
      ? [{ count: 180, name: '短片' }, { count: 102, name: '预告' }, { count: 38, name: '教程' }]
      : [{ count: 180, name: 'Clips' }, { count: 102, name: 'Trailers' }, { count: 38, name: 'Guides' }],
    hero: 1, per: 40, figure: null, seed: 1, centers: [520, 1000, 1420],
    layouts: ['scatter', 'clusters', 'columns', 'figure'],
    heads: ctx.lang === 'zh' ? ['一个点代表 40 次导出', '按类型分', '并排比较', '全部导出'] : ['One dot, 40 exports', 'By type', 'Side by side', 'All exports'],
    legend: ctx.lang === 'zh' ? '每个点 = 40 次导出 · 示意数据' : '1 dot = 40 exports · illustrative data',
  }),
  prepare(P) {
    const G = P.groups.length, counts = P.groups.map((g) => g.count), N = counts.reduce((a, b) => a + b, 0);
    const groupOf = [], idxIn = [];
    counts.forEach((n, g) => { for (let k = 0; k < n; k++) { groupOf.push(g); idxIn.push(k); } });
    const cx = P.centers.length === G ? P.centers : P.groups.map((_, g) => 520 + (G > 1 ? (900 * g) / (G - 1) : 450));
    const rnd = (i, salt) => hash(i * 977 + salt, P.seed);
    const scatter = (i) => [200 + ((rnd(i, 1) + rnd(i, 11)) / 2) * 1520, 330 + ((rnd(i, 2) + rnd(i, 12)) / 2) * 640];
    const cluster = (i) => { const g = groupOf[i], k = idxIn[i] + 0.5, r = VOGEL * Math.sqrt(k), a = k * 2.39996 + g; return [cx[g] + r * Math.cos(a), 650 + r * Math.sin(a)]; };
    const row = (i) => Math.floor(idxIn[i] / 8);
    const column = (i) => [cx[groupOf[i]] + ((idxIn[i] % 8) - 3.5) * SP, BASE - R - row(i) * SP];
    // the total's digits: fill the figure in the display font, sample a grid inside it at the widest spacing that
    // still yields N points, then keep N of them evenly, left to right (so the groups fill the number in order)
    const total = P.figure ?? grouped(N * P.per);
    const cv = canvasOf(1920, 1080), g = cv.getContext('2d', { willReadFrequently: true });
    const ff = fontFor(look, 'display', P.lang, 400, 800);
    g.font = `${ff.weight} ${ff.size}px ${ff.family}`; g.textBaseline = 'alphabetic';
    const m = g.measureText(total), scale = Math.min(GLYPH.w / m.width, GLYPH.h / (m.actualBoundingBoxAscent || 290));
    g.font = `${ff.weight} ${Math.round(ff.size * scale)}px ${ff.family}`;
    const m2 = g.measureText(total), gx = 960 - m2.width / 2, gy = GLYPH.y + (m2.actualBoundingBoxAscent || GLYPH.h);
    g.fillStyle = '#000000'; g.fillText(total, gx, gy);
    const px = g.getImageData(0, 0, 1920, 1080).data, inside = (x, y) => px[(Math.round(y) * 1920 + Math.round(x)) * 4 + 3] > 127;
    const sample = (s) => { const out = []; for (let x = gx; x < gx + m2.width; x += s) for (let y = GLYPH.y - 20; y < gy + 40; y += s) if (inside(x, y)) out.push([x, y]); return out; };
    let lo = 4, hi = 60;
    for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (sample(mid).length >= N) lo = mid; else hi = mid; }
    const pts = sample(lo), digits = Array.from({ length: N }, (_, k) => pts[Math.floor((k * pts.length) / N)]);
    const figure = (i) => digits[i];
    const L = { scatter, clusters: cluster, columns: column, figure };
    const rows = (g2) => Math.ceil(counts[g2] / 8);
    const stagOf = (i, to) => to === 'columns' ? Math.sqrt(row(i) / Math.max(1, rows(groupOf[i]) - 1)) * STAG + rnd(i, 13) * 2
      : to === 'figure' ? ((digits[i][0] - gx) / m2.width) * (STAG + 4) + rnd(i, 14) * 1.5 : rnd(i, 7) * STAG;
    const layouts = P.layouts.map((name) => L[name] || scatter);
    return { N, G, groupOf, idxIn, cx, layouts, stagOf, total, gx, gw: m2.width, crTop: counts.map((n) => VOGEL * Math.sqrt(n) + R), barTop: counts.map((n, g2) => BASE - R - (rows(g2) - 1) * SP), rnd };
  },
  pos(i, f, P, D) {
    const d = [9 * Math.sin(f / 21 + D.rnd(i, 8) * 6.28), 7 * Math.cos(f / 27 + D.rnd(i, 9) * 6.28)];
    const s = D.layouts[0](i);
    let p = P.layouts[0] === 'scatter' ? [s[0] + d[0], s[1] + d[1]] : s;
    for (let k = 1; k < D.layouts.length; k++) {
      const start = F0 + (k - 1) * LEG, u = spring(f - start - D.stagOf(i, P.layouts[k]), SPRING), q = D.layouts[k](i);
      p = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
    }
    return p;
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = F0 + p * LEG * (P.layouts.length - 1);
    const dots = [];
    for (let i = 0; i < D.N; i++) { const a = this.pos(i, f, P, D), b = this.pos(i, f - 1, P, D); dots.push([a[0], a[1], a[0] - b[0], a[1] - b[1]]); }
    return { p, f, dots };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, L = P.lang, f = S.f, K = P.layouts.length - 1, at = (k) => F0 + k * LEG;
    ground(ctx, P);
    const tones = P.groups.map((_, g) => (g === P.hero ? c.accent : g < P.hero ? mix(c.dim, c.ground, 0.35) : mix(c.ink, c.dim, 0.2)));
    // headline: one line per layout, the old one rising out as the next rises in
    const hf = fontFor(look, 'display', L, 84, 760, 'display');
    (P.heads || []).slice(0, K + 1).forEach((h, k) => {
      const inn = k === 0 ? 1 : ramp(f, at(k - 1) + 14, 12, 'snappy'), out = k < K ? ramp(f, at(k) + 4, 10, 'exit') : 0;
      const a = Math.min(inn, 1 - out);
      if (a > 0.01) text(ctx, h, 90, 236 + 24 * (1 - inn) - 24 * out, hf, { color: c.ink, alpha: a });
    });
    const legOf = (name) => P.layouts.indexOf(name);
    const lf = fontFor(look, 'text', L, L === 'zh' ? 32 : 30, 650, 'label'), vf = fontFor(look, 'display', L, 60, 750);
    const kc = legOf('clusters');
    if (kc > 0) {                                     // labels over the clusters while they hold
      const a = Math.min(ramp(f, at(kc - 1) + 14, 12, 'out'), kc < K ? 1 - ramp(f, at(kc) - 2, 8, 'exit') : 1);
      if (a > 0.01) P.groups.forEach((g, i) => {
        const y = 650 - D.crTop[i] - 128 + 14 * (1 - ramp(f, at(kc - 1) + 14 + i * 3, 14, 'snappy')), col = i === P.hero ? c.accent : c.ink;
        text(ctx, g.name, D.cx[i], y + 30, lf, { color: i === P.hero ? c.accent : c.dim, align: 'center', alpha: a });
        figures(ctx, grouped(g.count * P.per), D.cx[i], y + 96, vf, { color: col, align: 'center', alpha: a });
      });
    }
    const kb = legOf('columns');
    if (kb > 0) {                                     // the baseline, the value over each column, the name under it
      const a = Math.min(ramp(f, at(kb - 1) + 16, 12, 'out'), kb < K ? 1 - ramp(f, at(kb) - 2, 8, 'exit') : 1);
      const rule = Math.min(ramp(f, at(kb - 1) + 4, 18, 'snappy'), kb < K ? 1 - ramp(f, at(kb) - 2, 10, 'exit') : 1);
      if (rule > 0) { ctx.fillStyle = rgba(c.ink, 0.85); ctx.fillRect(300, BASE + 2, 1340 * rule, 3); }
      if (a > 0.01) P.groups.forEach((g, i) => {
        const col = i === P.hero ? c.accent : c.ink, y = D.barTop[i] - R - 30 + 16 * (1 - ramp(f, at(kb - 1) + 16 + i * 3, 14, 'snappy'));
        figures(ctx, grouped(g.count * P.per), D.cx[i], y, vf, { color: col, align: 'center', alpha: a });
        text(ctx, g.name, D.cx[i], BASE + 56, lf, { color: i === P.hero ? c.accent : c.dim, align: 'center', alpha: a });
      });
    }
    // the dots: a capsule stretched along the motion, round at rest
    const kf = legOf('figure');
    S.dots.forEach(([x, y, vx, vy], i) => {
      const g = D.groupOf[i], sp = Math.hypot(vx, vy), st = Math.min(sp * 0.45, 20);
      const land = kf > 0 ? ramp(f, at(kf - 1) + D.stagOf(i, 'figure') + 10, 12, 'out') : 0;
      ctx.save(); ctx.translate(x, y); if (sp > 0.3) ctx.rotate(Math.atan2(vy, vx));
      const w = 2 * R + st, h = 2 * R * (1 - Math.min(st / 120, 0.18));
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
      ctx.fillStyle = land > 0 ? mix(tones[g], c.accent, land) : tones[g]; ctx.fill();
      ctx.restore();
    });
    if (kf > 0) {                                     // legend under the total: what each tone was, and what a dot is
      P.groups.forEach((g, i) => {
        const a = ramp(f, at(kf - 1) + 15 + i * 4, 12, 'snappy');
        if (a <= 0) return;
        const nf = fontFor(look, 'text', L, 36, 650), val = grouped(g.count * P.per);
        const w = 22 + 16 + measure(ctx, g.name, nf).width + 14 + measure(ctx, val, fontFor(look, 'text', L, 36, 450)).width;
        const x0 = 960 + (i - (D.G - 1) / 2) * 400 - w / 2, y0 = 800 + 18 * (1 - a);
        ctx.save(); ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x0 + 11, y0, 11, 0, Math.PI * 2); ctx.fillStyle = tones[i]; ctx.fill();
        text(ctx, g.name, x0 + 38, y0 + 12, nf, { color: i === P.hero ? c.accent : c.ink });
        figures(ctx, val, x0 + 38 + measure(ctx, g.name, nf).width + 14, y0 + 12, fontFor(look, 'text', L, 36, 450), { color: c.dim });
        ctx.restore();
      });
      if (P.legend) text(ctx, P.legend, 960, 890, fontFor(look, 'text', L, infoSize(L) + 4, 500), { color: c.dim, align: 'center', alpha: ramp(f, at(kf - 1) + 20, 12, 'out') });
    } else if (P.legend) text(ctx, P.legend, 90, 1080 - 56, fontFor(look, 'text', L, infoSize(L), 500), { color: c.dim });
  },
  blur() { return false; },                          // the dots carry their own speed stretch
  // three dots, one per group (compare pairs them with the same upstream dots)
  track(S, P, D) { const pick = [5, D.N > 200 ? 200 : 0, D.N - 20]; return pick.map((i) => [S.dots[i][0], S.dots[i][1]]); },
};

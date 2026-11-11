// axis-rescale — a value too big for its chart: the line's newest point shoots up through the chart's ceiling rule
// (the rule cracks, two shards fly, the chart shakes) into the headline's band and hangs there; then the y axis rescales
// (old ticks drop out, new ones slide in, the grid doubles, the history flattens towards the baseline), the point falls
// back to its true height and its value pops beside it while the total in the corner counts up.
// Adapted from video-shotcraft demos/data/chart-live-moves/AxisRescaleShockV2.tsx (card
// references/shots/data/chart-live-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React, Remotion or SVG); colours by role (the event in the accent, the
// chart in ink, line and dim); brand, eyebrow and headline copy removed (title, labels, units are the film's slots,
// illustrative by default); the data, the two axis ranges, the total and the change label are parameters and every
// number on screen is computed from them; the history is drawn at rest (the brick starts where the chart is complete,
// `write: true` adds the upstream's write-on); the warning starts 3 frames later, on the brick's first frame; the slow
// push over the whole shot is the style's.
import { clamp, lerp, mix, rgba, rrect, text, measure, canvasOf, ground } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { figures } from '../digit-roll/brick.js';

const M = 96, X0 = 268, X1 = 1800, CEIL = 362, BASE = 902, PH = BASE - CEIL, SHOCK_TOP = CEIL - 226, RIGHT = 1824;
const DRAW = [14, 56], WARN = 53, SHOCK = [62, 76], BEAT = 94, RESCALE = 108, MARK = 106, END = 128;
const easeShock = bez(0.7, 0, 0.36, 1.06);             // slow off the mark, faster and faster, a hair past the top

const startOf = (P) => (P.write ? 12 : WARN);
const fmt = (v, unit) => `${Math.round(v)}${unit}`;

export default {
  id: 'axis-rescale', kind: 'motion',
  tier: 'T2', family: 'vertical', beats: 5,
  beatsFor: (P) => (END - startOf(P)) / 15,
  surface: ['canvas'],
  roles: ['ground', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  from: 'a line chart whose newest value is about to be added (the history drawn, or empty with `write`)',
  to: 'the same chart on a rescaled axis with the new point marked, its value and change beside it, the total updated',
  interpolates: ['newest point: previous value → past the ceiling into the headline band (0.7, 0, 0.36, 1.06)', 'ceiling crack, shards, a damped 10 px shake', 'y range old → new (snappy): ticks swap, grid doubles, history flattens', 'marker and value label pop (overshoot)', 'total: old → new'],
  summary: 'A value too big for its chart shoots through the ceiling rule into the headline, hangs, then the y axis rescales under it, the history flattens and the point falls back to its true height with its value.',
  theory: 'The chart\'s frame is a promise of scale; breaking it makes "off the charts" literal, so the size of the change is felt before it is read (expectancy violation); the rescale then restores truthful proportions in the same frame (Cleveland & McGill 1984: position on a common scale), so the drama never lies about the data.',
  defaults: (ctx = {}) => ({
    data: [22, 30, 26, 38, 35, 47, 44, 58, 55, 66, 72, 340], range: [100, 400], unit: 'k', write: false,
    labels: ctx.lang === 'zh' ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    title: ctx.lang === 'zh' ? '每月导出量' : 'Monthly exports',
    total: ctx.lang === 'zh' ? '全年合计' : 'Year total',
    note: ctx.lang === 'zh' ? '示意数据' : 'Illustrative data',
    change: ctx.lang === 'zh' ? (pct, prev) => `比${prev} ▲ ${pct}%` : (pct, prev) => `▲ ${pct}% vs ${prev}`,
  }),
  prepare(P) {
    const N = P.data.length, xOf = (i) => X0 + (i / (N - 1)) * (X1 - X0);
    const nx = xOf(N - 2), nyOld = BASE - (P.data[N - 2] / P.range[0]) * PH;
    let pierce = SHOCK[1];
    for (let f = SHOCK[0]; f <= SHOCK[1]; f += 0.25) if (lerp(nyOld, SHOCK_TOP, ramp(f, SHOCK[0], SHOCK[1] - SHOCK[0], easeShock)) <= CEIL) { pierce = f; break; }
    const hatch = canvasOf(12, 12), g = hatch.getContext('2d', { willReadFrequently: true });
    g.strokeStyle = rgba(P.colors.ink, 0.16); g.lineWidth = 2;
    for (const o of [-12, 0, 12]) { g.beginPath(); g.moveTo(o, 12); g.lineTo(o + 12, 0); g.stroke(); }
    const sum = (a) => a.reduce((s, v) => s + v, 0);
    return { N, xOf, nx, pierce, crossX: nx + ((nyOld - CEIL) / (nyOld - SHOCK_TOP)) * (X1 - nx), hatch, totals: [sum(P.data.slice(0, -1)), sum(P.data)] };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f0 = startOf(P), f = f0 + p * (END - f0), sinceP = f - D.pierce, sinceTop = f - (SHOCK[1] - 2);
    return {
      p, f,
      draw: ramp(f, DRAW[0], DRAW[1] - DRAW[0], 'swift') * (D.N - 2),
      rescale: ramp(f, BEAT, RESCALE - BEAT, 'snappy'),
      shock: ramp(f, SHOCK[0], SHOCK[1] - SHOCK[0], easeShock), shockOn: f >= SHOCK[0], sinceP,
      crack: sinceP >= 0 ? ramp(f, D.pierce, 8, 'snappy') * (1 - ramp(f, BEAT, 14, 'smooth')) : 0,
      kick: sinceP >= 0 && sinceP < 14 ? 10 * Math.exp(-sinceP / 3.4) * Math.sin(sinceP * 1.8) : 0,
      kpiKick: sinceTop >= 0 && sinceTop < 16 ? -14 * Math.exp(-sinceTop / 3.8) * Math.cos(sinceTop * 1.5) : 0,
      warn: ramp(f, WARN, 10, 'out') * (1 - ramp(f, BEAT, 12, 'out')),
      hang: f >= SHOCK[0] ? ramp(f, SHOCK[1] - 4, 8, 'out') * (1 - ramp(f, BEAT, 14, 'out')) : 0,
      width: lerp(12, 7, ramp(f, BEAT, 16, 'out')),
      mark: ramp(f, MARK, 12, 'overshoot'), ripple: ramp(f, MARK + 2, 20, 'out'), label: ramp(f, MARK + 4, 14, 'overshoot'),
      delta: ramp(f, MARK + 10, 10, 'out'), total: ramp(f, MARK + 2, 20, 'snappy'),
      ticks: [0, 1, 2, 3].map((i) => ramp(f, BEAT + (3 - i) * 2, 12, 'snappy')), dense: [0, 1, 2, 3].map((k) => ramp(f, BEAT + 1 + k * 2, 12, 'snappy')),
      rule: P.write ? ramp(f, 0, 20, 'snappy') : 1,
    };
  },
  head(S, P, D) {
    const range = lerp(P.range[0], P.range[1], S.rescale), yOf = (v) => BASE - (v / range) * PH, N = D.N;
    const ny = yOf(P.data[N - 2]), topY = lerp(SHOCK_TOP, yOf(P.data[N - 1]), S.rescale);
    return { yOf, ny, hx: lerp(D.nx, X1, Math.min(1, S.shock)), hy: lerp(ny, topY, S.shock) };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, L = P.lang, N = D.N, H = this.head(S, P, D), { yOf } = H, unit = P.unit;
    ground(ctx, P);
    const ef = fontFor(look, 'text', L, L === 'zh' ? 30 : 30, 650, 'label');
    if (P.note) text(ctx, P.note, M, 120, ef, { color: c.dim });
    const tf = fontFor(look, 'display', L, 124, 800, 'display');
    text(ctx, P.title, M - 6, 270, tf, { color: c.ink });
    const hot = S.total > 0.5;                         // the total in the corner: it takes the hit, then counts up
    text(ctx, P.total, RIGHT, 120, ef, { color: hot ? c.accent : c.dim, align: 'right' });
    figures(ctx, fmt(lerp(D.totals[0], D.totals[1], S.total), unit), RIGHT, 270 + S.kpiKick, tf, { color: hot ? c.accent : c.ink, align: 'right' });
    ctx.save(); ctx.translate(0, S.kick);              // the chart group (the shake moves only this)
    const lf = fontFor(look, 'text', L, 32, 500), xr = lerp(M, RIGHT, S.rule), tickY = (i) => BASE - ((i + 1) / 4) * PH;
    text(ctx, '0', M, BASE - 16, lf, { color: c.dim });
    for (let i = 0; i < 4; i++) {                      // y ticks: the old range drops out, the new one slides in
      const sw = S.ticks[i], top = i === 3, y = tickY(i) - 16;
      const old = fmt((P.range[0] * (i + 1)) / 4, unit), neu = fmt((P.range[1] * (i + 1)) / 4, unit);
      ctx.save(); ctx.beginPath(); ctx.rect(M - 10, y - 50, 180, 60); ctx.clip();
      if (sw < 1) figures(ctx, old, M, y + sw * 46, fontFor(look, 'text', L, 32, top ? Math.round(lerp(500, 750, S.warn)) : 500), { color: top && S.warn > 0.02 ? c.accent : c.dim, alpha: 1 - sw });
      if (sw > 0) figures(ctx, neu, M, y + (sw - 1) * 46, lf, { color: c.dim, alpha: sw });
      ctx.restore();
    }
    P.labels.forEach((m, i) => {
      const last = i === N - 1 && S.shockOn;
      text(ctx, m, D.xOf(i), BASE + 54, fontFor(look, 'text', L, 32, last ? 750 : 500), { color: last ? c.accent : c.dim, align: 'center' });
    });
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba(c.ink, 0.14); ctx.beginPath(); ctx.moveTo(M, tickY(i)); ctx.lineTo(xr, tickY(i)); ctx.stroke(); }
    ctx.setLineDash([2, 8]);
    S.dense.forEach((d, k) => { if (d > 0) { const y = BASE - ((2 * k + 1) / 8) * PH; ctx.strokeStyle = rgba(c.ink, 0.1); ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(lerp(M, RIGHT, d), y); ctx.stroke(); } });
    ctx.setLineDash([]);
    // the history: hatched area, line, points
    const n = Math.floor(S.draw), pts = [];
    for (let i = 0; i <= n; i++) pts.push([D.xOf(i), yOf(P.data[i])]);
    if (S.draw < N - 2 && S.draw > n) pts.push([lerp(D.xOf(n), D.xOf(n + 1), S.draw - n), lerp(yOf(P.data[n]), yOf(P.data[n + 1]), S.draw - n)]);
    const all = S.shockOn ? [...pts, [H.hx, H.hy]] : pts;
    if (all.length > 1) {
      ctx.beginPath(); ctx.moveTo(all[0][0], BASE); all.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(all[all.length - 1][0], BASE); ctx.closePath();
      ctx.fillStyle = ctx.createPattern(D.hatch, 'repeat'); ctx.fill();
    }
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(M, BASE); ctx.lineTo(xr, BASE); ctx.stroke();
    // the ceiling: warns in the accent, cracks where the point goes through
    const ceil = S.warn > 0.02 ? c.accent : c.ink, gap = 26 * S.crack;
    ctx.strokeStyle = rgba(ceil, 0.85 + 0.15 * S.warn); ctx.lineWidth = 3; ctx.beginPath();
    if (gap <= 0.03) { ctx.moveTo(M, CEIL); ctx.lineTo(xr, CEIL); } else { ctx.moveTo(M, CEIL); ctx.lineTo(D.crossX - gap, CEIL); ctx.moveTo(D.crossX + gap, CEIL); ctx.lineTo(xr, CEIL); }
    ctx.stroke();
    if (S.sinceP >= 0 && S.sinceP <= 32) for (let k = 0; k < 3; k++) {
      const t = S.sinceP / 32, dir = k % 2 ? 1 : -1, sp = [1, 0.75, 0.55][k], w = [40, 30, 18][k];
      const x = D.crossX + dir * (18 + 190 * sp * EASE.out(t)), y = CEIL - (170 - k * 40) * EASE.out(t) + 300 * t * t;
      ctx.save(); ctx.translate(x, y); ctx.rotate((dir * (240 - k * 50) * t * Math.PI) / 180); ctx.globalAlpha = 1 - EASE.exit(t);
      ctx.fillStyle = c.accent; ctx.fillRect(-w / 2, -2, w, 4); ctx.restore();
    }
    if (pts.length > 1) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = c.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
    pts.forEach(([x, y], i) => { if (i < pts.length - (S.draw < N - 2 ? 1 : 0)) { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = c.ground; ctx.fill(); ctx.strokeStyle = c.ink; ctx.lineWidth = 3.5; ctx.stroke(); } });
    if (P.write && S.f >= DRAW[0] && S.f < DRAW[1] + 1 && pts.length) { const [x, y] = pts[pts.length - 1]; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill(); }
    if (S.f >= WARN && S.f < SHOCK[0] + 6) { const t = ramp(S.f, WARN, 16, 'out'); ctx.beginPath(); ctx.arc(D.nx, H.ny, lerp(10, 46, t), 0, Math.PI * 2); ctx.strokeStyle = rgba(c.accent, 0.7 * (1 - t)); ctx.lineWidth = 3; ctx.stroke(); }
    if (S.shockOn) {                                   // the newest segment, in the accent
      ctx.lineCap = 'round';
      if (S.hang > 0.01) { ctx.strokeStyle = rgba(c.accent, 0.3 * S.hang); ctx.lineWidth = S.width + 16; ctx.beginPath(); ctx.moveTo(D.nx, H.ny); ctx.lineTo(H.hx, H.hy); ctx.stroke(); }
      ctx.strokeStyle = c.accent; ctx.lineWidth = S.width; ctx.beginPath(); ctx.moveTo(D.nx, H.ny); ctx.lineTo(H.hx, H.hy); ctx.stroke();
      if (S.mark <= 0) { ctx.beginPath(); ctx.arc(H.hx, H.hy, 12, 0, Math.PI * 2); ctx.fillStyle = c.ground; ctx.fill(); ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.stroke(); }
    }
    if (S.sinceP >= 0 && S.sinceP < 10 && S.rescale < 0.02) { const t = ramp(S.f, D.pierce, 10, 'out'); ctx.beginPath(); ctx.arc(D.crossX, CEIL, lerp(8, 70, t), 0, Math.PI * 2); ctx.strokeStyle = rgba(c.accent, 0.8 * (1 - t)); ctx.lineWidth = 2.5; ctx.stroke(); }
    if (S.mark > 0) {
      if (S.ripple < 1) { ctx.beginPath(); ctx.arc(H.hx, H.hy, lerp(16, 64, S.ripple), 0, Math.PI * 2); ctx.strokeStyle = rgba(c.accent, 0.6 * (1 - S.ripple)); ctx.lineWidth = 3; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(H.hx, H.hy, 15 * S.mark, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = c.ground; ctx.lineWidth = 5 * S.mark; ctx.stroke();
    }
    if (S.label > 0) {                                 // the value and its change, computed from the data
      const last = P.data[N - 1], prev = P.data[N - 2], pct = Math.round((last / prev - 1) * 100);
      const vf = fontFor(look, 'display', L, 76, 800, 'display'), df = fontFor(look, 'text', L, 32, 600);
      const dl = typeof P.change === 'function' ? P.change(pct, P.labels[N - 2]) : P.change;
      const bw = Math.max(330, Math.max(measure(ctx, fmt(last, unit), vf).width, measure(ctx, dl, df).width) + 60), bh = 140;
      ctx.save(); ctx.translate(H.hx - 40, H.hy); ctx.scale(S.label, S.label); ctx.globalAlpha = Math.min(1, S.label * 1.6);
      rrect(ctx, -bw, -bh / 2, bw, bh, 6); ctx.fillStyle = c.accent; ctx.fill();
      ctx.save(); ctx.translate(0, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-10, -10, 20, 20); ctx.restore();
      figures(ctx, fmt(last, unit), -bw + 30, -6, vf, { color: c.onAccent });
      figures(ctx, dl, -bw + 30, 44, df, { color: c.onAccent, alpha: 0.9 * S.delta });
      ctx.restore();
    }
    ctx.restore();
  },
  blur(p, P) { const f = startOf(P) + p * (END - startOf(P)); return f > SHOCK[0] && f < SHOCK[1] + 2; },
  // the newest point (compare pairs it with the upstream's shock line end)
  track(S, P, D) { const H = this.head(S, P, D); return [[H.hx, H.hy + S.kick]]; },
};

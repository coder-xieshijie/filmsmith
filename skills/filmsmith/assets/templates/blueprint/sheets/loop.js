// sheets/loop.js — TIMING. A closed loop of 3–4 steps with a token that runs one lap per milestone; beside it a
// timing diagram whose trace steps up as each lap completes; a gate; an aside box fed by a dashed line.
import { E, partial, polyLen, pointAt, strokePts, rgba, fontStr } from '../fx.js';
import { X1, F, MIN, up, header, sz, CW, X0 } from './common.js';

// rounded rectangle starting at the top-left, clockwise
const loopPts = (x, y, w, h, r) => {
  const p = [];
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 14; i++) { const a = a0 + (Math.PI / 2) * (i / 14); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  p.push([x + r, y]);
  arc(x + w - r, y + r, -Math.PI / 2);
  arc(x + w - r, y + h - r, 0);
  arc(x + r, y + h - r, Math.PI / 2);
  arc(x + r, y + r, Math.PI);
  return p;
};

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 60);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.6, { col: 'muted' });

  const steps = s.steps || [];
  if (steps.length < 3 || steps.length > 4) env.err('steps needs 3–4 entries');
  const fst = sz(F.body, 35);
  const lab = steps.map((st, i) => { env.lim(`steps[${i}]`, st, 34); return [[`${i + 1} `, 'line'], [st, 'ink']]; });
  const sw = lab.map((sp) => pen.measure(sp.map((p) => p[0]).join(''), fst));
  const lx = 214, ly = 520, lh = 280;
  const lw = Math.max(540, (sw[0] || 0) + (sw[1] || 0) + 130, (sw[2] || 0) + (sw[3] || 0) + 130);
  const Rx = lx + lw + 110, Wt = X1 - Rx;
  if (Wt < 400) env.err(`steps are too long: the timing diagram keeps only ${Wt.toFixed(0)} px (needs 400)`);
  const pts = loopPts(lx, ly, lw, lh, 40);
  const closed = [...pts, pts[0]];
  pen.line(closed, c('loop'), 1.0, 's2', { ease: E.cubicInOut });
  // step labels at the corners, clockwise; dots on the loop
  const corner = [
    { x: lx - 44, y: ly - 30, align: 'left', dot: [lx + 20, ly] },
    { x: lx + lw + 44, y: ly - 30, align: 'right', dot: [lx + lw - 20, ly] },
    { x: lx + lw + 44, y: ly + lh + 52, align: 'right', dot: [lx + lw - 20, ly + lh] },
    { x: lx - 44, y: ly + lh + 52, align: 'left', dot: [lx + 20, ly + lh] },
  ];
  lab.forEach((sp, i) => {
    const k = corner[i], t = c('loop') + 0.1 + i * 0.3 * env.b / 0.6;
    pen.dot(k.dot[0], k.dot[1], 9, t, 'line');
    pen.text(sp.map((p) => p[0]).join(''), k.x, k.y, fst, t, 0.4, { align: k.align, spans: sp });
  });
  [[lx + lw / 2, ly, 0], [lx + lw, ly + lh / 2, Math.PI / 2], [lx + lw / 2, ly + lh, Math.PI], [lx, ly + lh / 2, -Math.PI / 2]]
    .forEach(([x, y, a], i) => pen.head(x + 9 * Math.cos(a), y + 9 * Math.sin(a), a, c('loop') + 0.2 + i * 0.22, 'ink', 18));

  // laps: milestone i completes at lapEnd[i]; the token eases into each milestone
  const ms = s.milestones || [];
  if (ms.length < 2 || ms.length > 4) env.err('milestones needs 2–4 entries');
  ms.forEach((m, i) => env.lim(`milestones[${i}]`, m, 4));
  const n = ms.length, t0 = c('laps'), lapEnd = ms.map((_, i) => c('lap' + i));
  const lapAt = (t) => {
    if (t < t0) return 0;
    for (let i = 0; i < n; i++) {
      const a = i ? lapEnd[i - 1] : t0, b = lapEnd[i];
      if (t < b) return i + E.sineInOut((t - a) / (b - a));
    }
    return n;
  };
  // centre read-out
  const fcl = sz(F.tag, 25, { track: 0.14 }), fbig = { fam: 'cond', w: 700, size: 140 };
  env.lim('counterLabel', s.counterLabel, 12);
  pen.text(up(s.counterLabel || 'Milestone'), lx + lw / 2, ly + 104, fcl, c('loop') + 0.8, 0.3, { align: 'center', col: 'line' });
  const cx = lx + lw / 2, cyBase = ly + 240;
  pen.custom(t0 - 0.1, (ctx, t) => {
    const done = Math.min(n - 1, Math.floor(lapAt(t) + 1e-6));
    const v = Math.min(1, (t - (t0 - 0.1)) / 0.2);
    ctx.save();
    ctx.globalAlpha *= v;
    ctx.font = fontStr(fbig);
    ctx.fillStyle = P.ink;
    ctx.textAlign = 'center';
    ctx.fillText(ms[done], cx, cyBase);
    ctx.restore();
  });
  // the token
  const Lc = polyLen(closed);
  pen.custom(t0 - 0.1, (ctx, t) => {
    const u = lapAt(t), fade = t > lapEnd[n - 1] ? Math.max(0, 1 - (t - lapEnd[n - 1]) / (0.4 * env.b)) : Math.min(1, (t - t0 + 0.1) / 0.1); // gone 0.4 beat after the last lap
    if (fade <= 0) return;
    const [x, y] = pointAt(closed, u >= n ? 1 : u % 1, Lc);
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.fillStyle = rgba(P.ink, 0.18);
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // timing diagram: axis, milestone ticks, staircase trace drawn in real time
  env.lim('trackLabel', s.trackLabel, 14);
  pen.text(up(s.trackLabel || 'Milestones'), Rx, 482, fcl, c('axis'), 0.3, { col: 'line' });
  const ay = 600, xs = ms.map((_, i) => Rx + (Wt * (i + 1)) / (n + 1)), rise = 66 / n;
  pen.arrow(Rx, ay, X1, ay, c('axis'), 0.6, 's1', { headSize: 14 });
  pen.seg(Rx, ay - 80, Rx, ay, c('axis'), 0.3, 'sf');
  const fm = { fam: 'mono', w: 500, size: 25 };
  ms.forEach((m, i) => {
    pen.seg(xs[i], ay - 6, xs[i], ay + 6, c('axis') + 0.15 + i * 0.08, 0.15, 's1');
    pen.text(m, xs[i], ay + 36, fm, c('axis') + 0.2 + i * 0.08, 0.3, { align: 'center' });
  });
  const lapDur = (i) => lapEnd[i] - (i ? lapEnd[i - 1] : t0);
  const xAt = (t) => {
    if (t <= t0) return Rx;
    for (let i = 0; i < n; i++) { const a = i ? lapEnd[i - 1] : t0; if (t < lapEnd[i]) return (i ? xs[i - 1] : Rx) + (xs[i] - (i ? xs[i - 1] : Rx)) * ((t - a) / lapDur(i)); }
    const ext = Math.min(1, (t - lapEnd[n - 1]) / Math.min(lapDur(n - 1), 0.5 * env.b)) * (Wt / (n + 1)) * 0.6; // run-out over ≤ 0.5 beat
    return xs[n - 1] + ext;
  };
  pen.custom(t0, (ctx, t) => {
    const hx = xAt(t);
    const p = [[Rx, ay - 8]];
    let lvl = 0;
    for (let i = 0; i < n; i++) {
      if (hx < xs[i]) break;
      p.push([xs[i], ay - 8 - lvl * rise]);
      lvl++;
      p.push([xs[i], ay - 8 - lvl * rise]);
    }
    p.push([hx, ay - 8 - lvl * rise]);
    ctx.save();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineJoin = 'miter';
    strokePts(ctx, p);
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.arc(hx, ay - 8 - lvl * rise, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // gate: two parallel bars, then the rule it enforces
  env.lim('gate.title', s.gate?.title, 30);
  env.lim('gate.sub', s.gate?.sub, 20);
  if (s.gate) {
    pen.line([[Rx, 650], [Rx, 716]], c('gate'), 0.2, 's2');
    pen.line([[Rx + 16, 650], [Rx + 16, 716]], c('gate') + 0.05, 0.2, 's2');
    pen.text(s.gate.title, Rx + 44, 676, env.fit(s.gate.title, { fam: 'mono', w: 400, size: 35 }, X1 - Rx - 44, MIN, 'gate.title'), c('gate') + 0.1, 0.5);
    if (s.gate.sub) pen.text(s.gate.sub, Rx + 44, 714, F.small, c('gate') + 0.35, 0.35, { col: 'line' });
  }
  // aside box, fed from the loop by a dashed line
  if (s.aside) {
    env.lim('aside.head', s.aside.head, 16);
    env.lim('aside.text', s.aside.text, 40);
    const fh = { fam: 'mono', w: 600, size: 25, track: 0.12 }, ft = sz(F.small, 35);
    // one line when it fits the column, else two (split at the word nearest the middle)
    const room = X1 - Rx - 40;
    let lines = [s.aside.text];
    if (pen.measure(s.aside.text, ft) > room) {
      const w = s.aside.text.split(' ');
      let best = null;
      for (let k = 1; k < w.length; k++) { const a = w.slice(0, k).join(' '), b = w.slice(k).join(' '), m = Math.max(pen.measure(a, ft), pen.measure(b, ft)); if (!best || m < best.m) best = { m, l: [a, b] }; }
      if (best) lines = best.l;
    }
    const bw = Math.max(pen.measure(up(s.aside.head), fh), ...lines.map((l) => pen.measure(l, ft))) + 40;
    if (Rx + bw > X1 + 1) env.err('aside text is too wide for the column');
    const by = 752, ta = c('aside');
    pen.line([[lx + lw, ly + lh * 0.64], [Rx - 56, ly + lh * 0.64], [Rx - 56, by + 64], [Rx - 12, by + 64]], ta - 0.1, 0.45, 's1', { dash: 'dash' });
    pen.head(Rx - 3, by + 64, 0, ta + 0.33, 'line', 14);
    pen.rect(Rx, by, bw, 128, ta, 0.45, 's1');
    pen.text(up(s.aside.head), Rx + 20, by + 38, fh, ta + 0.2, 0.35);
    lines.forEach((l, i) => pen.text(l, Rx + 20, by + 78 + i * 34, ft, ta + 0.4 + i * 0.2, 0.6));
    if (lines.length === 1) [0, 1].forEach((i) => pen.seg(Rx + 20, by + 98 + i * 16, Rx + 20 + (bw - 40) * [0.7, 0.48][i], by + 98 + i * 16, ta + 0.7 + i * 0.12, 0.3, 'sg'));
  }
  return { title, focus: null };
};

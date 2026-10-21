// tether-link — an accent line draws from a claim to the place in a real asset that supports it: a small dot leads the
// line along a gentle arc (arc-length eased, ease in-out), arrives at the source region, and a ring draws round it.
// The claim is code-drawn text; the source is the asset itself, untouched. Theory: connectedness groups more strongly
// than proximity (Palmer & Rock 1994): a line makes "this number comes from there" visible; the dot gives the line a
// direction (claim → source). Sources: an editor's launch film (a line from each typed source line to its
// rendered line, per beat), a catalogue "tracing beam" component, ring annotations (a ring is the link's end).

import { seg, cubicInOut, text, measure, scratch } from './util.js';
import {
  NEUTRAL, assetOf, placeholderPage, fitView, toScreen, windowOf, contentOf, windowBack, windowFront, clipWindow,
  drawAsset, ring,
} from './asset.js';

export default {
  name: 'tether-link',
  tier: 'T0',
  beats: 1,
  modes: ['every mode with real assets', 'trace', 'thread'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'],
  from: 'a code-drawn claim beside the real asset that supports it',
  to: 'the same, an accent line from the claim to the source region, ringed, the dot resting at the ring',
  interpolates: ['line length along the arc (dot at its head)', 'ring draw-on'],
  summary: 'An accent line, led by a small dot, draws from a claim to its source in a real asset; a ring closes round the source.',
  theory: 'Connectedness groups more strongly than proximity (Palmer & Rock 1994); a directed line states provenance without words.',
  defaults: {
    claim: {
      x: 120,
      lines: [
        { text: 'First benchmark', y: 420, size: 36, weight: 500, color: 'dim' },
        { text: '48.0', y: 590, size: 170, weight: 700, color: 'ink', anchor: true },
        { text: 'vendor-reported', y: 660, size: 30, weight: 400, color: 'dim' },
      ],
    },
    target: { asset: null, title: 'example.com/table', window: { x: 1000, y: null, w: 820 }, box: [640, 184, 340, 138] },
    bend: 0.18,                                // arc height as a fraction of the line's length (negative: below)
    gapStart: 28, ringPad: 8,
    dot: 8, width: 3,
    font: { family: 'sans-serif', weight: 700 },
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const A = assetOf(P.target.asset, () => placeholderPage(2000, 1100));
    const T = P.target, contentH = (T.window.w * A.crop[3]) / A.crop[2];
    const W = windowOf(T.window.x, T.window.y ?? Math.round((1080 - contentH - 54) / 2), T.window.w, contentH);
    const v = fitView(A.crop, contentOf(W));
    const box = toScreen(v, T.box);
    const an = P.claim.lines.find((l) => l.anchor) || P.claim.lines[0];
    const aw = measure(scratch(), an.text, { ...P.font, weight: an.weight, size: an.size }).width;
    const S = [P.claim.x + aw + P.gapStart, an.y - an.size * 0.36];
    const E = [box.x - P.ringPad - 2, box.y + box.h / 2];
    // a quadratic arc from S to E bulging upward by bend × length; sampled by arc length
    const dx = E[0] - S[0], dy = E[1] - S[1], len = Math.hypot(dx, dy);
    const Cp = [(S[0] + E[0]) / 2 + (dy / len) * P.bend * len, (S[1] + E[1]) / 2 - (dx / len) * P.bend * len];
    const N = 240, pts = [], acc = [0];
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      pts.push([a * S[0] + b * Cp[0] + c * E[0], a * S[1] + b * Cp[1] + c * E[1]]);
      if (i) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { A, W, v, box, pts, acc, total: acc[N] };
  },
  rest(side) { return side === 'from' ? { l: 0, ring: 0 } : { l: 1, ring: 1 }; },
  at(p) { return { l: cubicInOut(seg(p, 0, 0.62)), ring: cubicInOut(seg(p, 0.55, 0.92)) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    for (const l of P.claim.lines) text(ctx, l.text, P.claim.x, l.y, { ...P.font, weight: l.weight, size: l.size }, { color: C[l.color] || C.ink });
    windowBack(ctx, D.W, P);
    ctx.save(); clipWindow(ctx, D.W); drawAsset(ctx, D.A, D.v, contentOf(D.W)); ctx.restore();
    windowFront(ctx, D.W, P, { title: P.target.title });
    if (S.ring > 0) ring(ctx, D.box, P, { pad: P.ringPad, radius: 10, width: P.width, draw: S.ring });
    if (S.l <= 0) return;
    const head = this.headAt(S.l, D);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(D.pts[0][0], D.pts[0][1]);
    for (let i = 1; i < D.pts.length && D.acc[i] < S.l * D.total; i++) ctx.lineTo(D.pts[i][0], D.pts[i][1]);
    ctx.lineTo(head[0], head[1]);
    ctx.strokeStyle = C.accent; ctx.lineWidth = P.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath(); ctx.arc(head[0], head[1], P.dot, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
    ctx.restore();
  },
  // the point at fraction l of the arc's length
  headAt(l, D) {
    const target = l * D.total;
    let i = 1;
    while (i < D.acc.length - 1 && D.acc[i] < target) i++;
    const a = D.acc[i - 1], b = D.acc[i], u = b > a ? (target - a) / (b - a) : 0;
    return [D.pts[i - 1][0] + (D.pts[i][0] - D.pts[i - 1][0]) * u, D.pts[i - 1][1] + (D.pts[i][1] - D.pts[i - 1][1]) * u];
  },
  track(S, P, D) { return [this.headAt(S.l, D)]; },
};

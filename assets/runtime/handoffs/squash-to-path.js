// squash-to-path — a word squashes vertically into a line; the line stretches into an execution path between a start
// dot and an end square and grows loops (retries); a token runs it; the loops shrink until the path is straight.
// Theory: one object takes on a new meaning; the straightened path is literally the shorter one.
// references/transitions.md#squash-to-path.

import { seg, settle, lerp, clamp, expIn, cubicInOut, text, measure, scratch, ground } from './util.js';

const STAGES = {
  all: { beats: 4, squash: [0, 0.06], grow: [0.05, 0.33], pop: [0.15, 0.28], run: [0.25, 0.65], shrink: [0.7, 1] },
  squash: { beats: 1.5, squash: [0, 0.16], grow: [0.13, 1], pop: [0.4, 0.8] },
  run: { beats: 2, run: [0, 1] },
  straighten: { beats: 1.5, shrink: [0, 1] },
};

// the path at loop amplitude b: a trochoid whose loops fade in and out at both ends (straight lead-in and lead-out)
const pathPts = (b, xa, xb, P, n = 700) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, e = Math.min(1, u / 0.12, (1 - u) / 0.12), env = e * e * (3 - 2 * e);
    const ph = 2 * Math.PI * P.loops * clamp((u - 0.12) / 0.76), bb = b * env;
    pts.push([xa + (xb - xa) * u - bb * Math.sin(ph), P.y - bb * (1 - Math.cos(ph))]);
  }
  return pts;
};

export default {
  name: 'squash-to-path',
  tier: 'T1',
  beats: 4,
  beatsFor: (P) => (STAGES[P.stage] || STAGES.all).beats,
  modes: ['trace'],
  roles: ['ground', 'ink', 'active'],
  from: 'a word (the problem: "retry")',
  to: 'a straight execution path from start to end, the token arrived',
  interpolates: ['word height (squash)', 'path ends', 'loop amplitude', 'token position'],
  summary: 'A word squashes into a line that becomes a looping path; a token runs it and the loops shrink until it is straight.',
  theory: 'One object, a new meaning; straightening the detour makes "shorter" visible as form.',
  defaults: {
    stage: 'all',                        // 'squash' (word → looped path), 'run' (token), 'straighten' (loops → straight), 'all'
    text: 'retry',
    font: { family: 'sans-serif', weight: 700, size: 220 },
    x0: 320, x1: 1600, y: 620,
    loops: 3, amplitude: 100,
    lineWidth: 5, token: 12, dot: 13, square: 26,
    colors: { ground: '#0C1013', ink: '#E6ECEF', active: '#F7D96F' },
  },
  prepare(P) {
    const m = measure(scratch(), P.text, P.font);
    const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    const cx = (P.x0 + P.x1) / 2;
    return { asc, desc, cx, wx0: cx - m.width / 2, wx1: cx + m.width / 2, base: P.y + (asc - desc) / 2 };
  },
  rest(side, P) {
    const st = P.stage, from = side === 'from';
    if (st === 'squash') return from ? { sy: 1 } : { sy: 0, g: 1, k: 1, b: 1, run: null };
    if (st === 'run') return { sy: 0, g: 1, k: 1, b: 1, run: from ? 0 : 1 };
    if (st === 'straighten') return { sy: 0, g: 1, k: 1, b: from ? 1 : 0, run: 1 };
    return from ? { sy: 1 } : { sy: 0, g: 1, k: 1, b: 0, run: 1 };
  },
  at(p, P) {
    const ph = STAGES[P.stage] || STAGES.all;
    if (ph.squash && p < ph.squash[1]) return { sy: 1 - expIn(seg(p, ...ph.squash)) };
    const g = ph.grow ? settle(seg(p, ...ph.grow), 7.2) : 1;
    const k = ph.pop ? settle(seg(p, ...ph.pop), 5) : 1;
    const shrink = ph.shrink ? settle(seg(p, ...ph.shrink), 7.7) : 0;
    let run = null;
    if (ph.run) run = p >= ph.run[0] ? cubicInOut(seg(p, ...ph.run)) : null;
    else if (P.stage === 'straighten') run = 1;
    return { sy: 0, g, k, b: g * (1 - shrink), run };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors;
    if (S.sy > 0) {
      if ((D.asc + D.desc) * S.sy <= 6) return;
      ctx.save();
      ctx.translate(0, P.y); ctx.scale(1, S.sy); ctx.translate(0, -P.y);
      text(ctx, P.text, D.cx, D.base, P.font, { color: C.ink, align: 'center' });
      ctx.restore();
      return;
    }
    const xa = lerp(D.wx0, P.x0, S.g), xb = lerp(D.wx1, P.x1, S.g);
    const pts = pathPts(P.amplitude * S.b, xa, xb, P);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = C.ink; ctx.lineWidth = P.lineWidth; ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.stroke();
    if (S.k > 0) {
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(xa, P.y, P.dot * S.k, 0, Math.PI * 2); ctx.fill();
      const s = P.square * S.k; ctx.fillRect(xb - s / 2, P.y - s / 2, s, s);
    }
    if (S.run != null) {
      const [x, y] = this.tokenAt(pts, S.run);
      ctx.fillStyle = C.active; ctx.beginPath(); ctx.arc(x, y, P.token, 0, Math.PI * 2); ctx.fill();
    }
  },
  tokenAt(pts, run) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const q = run * cum[cum.length - 1];
    let i = 0;
    while (i < pts.length - 2 && cum[i + 1] < q) i++;
    const f = clamp((q - cum[i]) / (cum[i + 1] - cum[i] || 1));
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
  },
  track(S, P, D) {
    if (S.sy > 0) return [[D.wx0, P.y - D.asc * S.sy], [D.wx1, P.y], [D.wx0, P.y], [D.cx, P.y]];
    const xa = lerp(D.wx0, P.x0, S.g), xb = lerp(D.wx1, P.x1, S.g), pts = pathPts(P.amplitude * S.b, xa, xb, P, 140);
    return [[xa, P.y], [xb, P.y], pts[35], pts[70], ...(S.run != null ? [this.tokenAt(pts, S.run)] : [[xa, P.y]])];
  },
};

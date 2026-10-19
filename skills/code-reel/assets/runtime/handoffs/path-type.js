// path-type — a sentence lies on the mode's line. The line rolls up a loop from its middle (length kept), carrying the
// letters along its arc length; the text runs round the loop and out of the far end while the next sentence follows it
// in from the near end; the loop opens back into a straight baseline under the new sentence. Text is readable only
// while the line is straight. Theory: good continuation (Wertheimer 1923). references/transitions.md#path-type.

import { seg, smooth, clamp, cubicInOut, fontOf, scratch, ground } from './util.js';

const BEND = [0, 0.22], FLOW = [0.245, 0.72], OPEN = [0.72, 0.95];

// point on the line at arc length s for bend b (0 straight … 1 full loop of radius R): a circle of radius R·b tangent
// below the line takes 2πR·b of its length and the tails pull in by the same amount, so s stays the true arc length
const at = (s, b, y0, P) => {
  const { length: L, radius: R, x: cx } = P;
  const r = R * b, m = 2 * Math.PI * r, t1 = (L - m) / 2;
  if (s <= t1) return [cx - (t1 - s), y0];
  if (s >= t1 + m) return [cx + (s - t1 - m), y0];
  const th = -Math.PI / 2 + (2 * Math.PI * (s - t1)) / m;
  return [cx + r * Math.cos(th), y0 + r + r * Math.sin(th)];
};

// per-glyph centres (advance along the line) of a string, measured on prefixes so kerning is kept
const glyphs = (g, str, f) => {
  g.save(); g.font = fontOf(f); if ('letterSpacing' in g) g.letterSpacing = `${f.spacing ?? 0}px`;
  const out = [];
  let adv = 0;
  for (let i = 0; i < str.length; i++) {
    const w = g.measureText(str.slice(0, i + 1)).width - adv;
    out.push([str[i], adv + w / 2]);
    adv += w;
  }
  g.restore();
  return { list: out, len: adv };
};

const layout = (S, P, D) => {
  const L = P.length, b = S.b, y0 = P.y - P.radius * b;   // the figure stays centred while the loop hangs below
  const n = 480, pts = [], cum = [0];
  for (let i = 0; i <= n; i++) pts.push(at((L * i) / n, b, y0, P));
  for (let i = 1; i <= n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const kL = cum[n] / L;
  const along = (s) => {
    const q = clamp(s, 0, L) * kL;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= q) lo = mid; else hi = mid; }
    const a = (q - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
    const [x0, ya] = pts[lo], [x1, yb] = pts[lo + 1];
    return [x0 + (x1 - x0) * a, ya + (yb - ya) * a, Math.atan2(yb - ya, x1 - x0)];
  };
  const o2 = S.o1 - D.gap - D.g2.len;
  return { y0, pts, along, o2 };
};

export default {
  name: 'path-type',
  tier: 'T2',
  beats: 2,
  modes: ['thread', 'trace'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a sentence lying on the line',
  to: 'the next sentence on the same line, straight again',
  interpolates: ['loop radius (line length kept)', 'text offset along the line'],
  summary: 'The line rolls up a loop and carries its sentence round and out; the next sentence follows it in and the loop opens.',
  theory: 'Good continuation (Wertheimer 1923): the eye follows the line; text is read only while the line is straight.',
  defaults: {
    from: { text: 'every call, traced' },
    to: { text: 'every retry, kept' },
    x: 960, y: 560,                      // line centre
    length: 1560, radius: 190,           // line length, full loop radius
    lift: 14,                            // letters' baseline above the line
    lineWidth: 6,
    font: { family: 'sans-serif', weight: 600, size: 78, spacing: -1 },
    colors: { ground: '#0B0B0D', ink: '#EDEAE2', accent: '#EE4938' },
  },
  prepare(P) {
    const g = scratch();
    const g1 = glyphs(g, P.from.text, P.font), g2 = glyphs(g, P.to.text, P.font);
    const L = P.length;
    const gap = L / 2 - Math.min(g1.len, g2.len) / 2 + 70;   // each sentence is off the line while the other is centred
    const o0 = L / 2 - g1.len / 2;
    return { g1, g2, gap, o0, dist: g1.len / 2 + gap + g2.len / 2 };
  },
  rest(side, P, D) { return { b: 0, o1: side === 'from' ? D.o0 : D.o0 + D.dist }; },
  at(p, P, D) {
    const f = cubicInOut(seg(p, ...FLOW));
    return { b: smooth(seg(p, ...BEND)) * (1 - smooth(seg(p, ...OPEN))), o1: f >= 1 ? D.o0 + D.dist : D.o0 + D.dist * f };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors, L = P.length, cx = P.x;
    const { y0, pts, along, o2 } = layout(S, P, D);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = C.accent; ctx.lineWidth = P.lineWidth; ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    ctx.stroke();
    // Letters by their centre's arc length, turned to the tangent. No glyph may land on another, so each stretch draws
    // through its own hard mask: left tail only left of the tangent point, right tail only right of it, the loop only
    // through a wedge around its bottom (closed while the loop is too small to carry letters).
    const r = P.radius * S.b, M = 2 * Math.PI * r, t1 = (L - M) / 2, straight = M < 6;
    const xa = at(0, S.b, y0, P)[0], xb = at(L, S.b, y0, P)[0];
    ctx.save();
    ctx.font = fontOf(P.font); if ('letterSpacing' in ctx) ctx.letterSpacing = `${P.font.spacing ?? 0}px`;
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const groups = { left: [], loop: [], right: [] };
    const collect = (g, o) => {
      for (const [ch, c] of g.list) {
        const sc = o + c;
        if (ch === ' ' || sc < -60 || sc > L + 60) continue;
        groups[straight || sc <= t1 ? 'left' : sc >= t1 + M ? 'right' : 'loop'].push([ch, sc]);
      }
    };
    collect(D.g1, S.o1);
    if (o2 + D.g2.len > -60) collect(D.g2, o2);
    const glyph = ([ch, sc]) => {
      const [x, y, a] = straight ? [cx - L / 2 + sc, y0, 0] : along(sc);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillText(ch, 0, -P.lift); ctx.restore();
    };
    const withClip = (clip, list) => {
      if (!list.length) return;
      ctx.save(); ctx.beginPath(); clip(); ctx.clip(); list.forEach(glyph); ctx.restore();
    };
    const H = ctx.canvas.height;
    if (straight) withClip(() => ctx.rect(xa, 0, xb - xa, H), groups.left);
    else {
      withClip(() => ctx.rect(xa, 0, cx - xa, H), groups.left);
      withClip(() => ctx.rect(cx, 0, xb - cx, H), groups.right);
      const open = smooth((r - 40) / 60);
      if (open > 0) {
        const a0 = Math.PI + (Math.acos(r / (r + P.font.size * 1.15)) - Math.PI) * open;
        withClip(() => {
          ctx.moveTo(cx, y0 + r);
          ctx.arc(cx, y0 + r, 2400, -Math.PI / 2 + a0, -Math.PI / 2 + 2 * Math.PI - a0);
          ctx.closePath();
        }, groups.loop);
      }
    }
    ctx.restore();
  },
  track: (S, P, D) => {
    const { along, o2, y0 } = layout(S, P, D);
    const a = along(S.o1 + D.g1.len / 2), b = along(o2 + D.g2.len / 2);
    return [[a[0], a[1]], [b[0], b[1]], [P.x, y0 + 2 * P.radius * S.b]];
  },
};

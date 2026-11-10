// outline-trace — a line runs round the outline of one element and so names it; when the line closes, the element's
// content arrives inside it and the line hands over to the element's own edge.
// Adapted from video-shotcraft demos/ui-entrance/draw-svg-trace/DrawSvgTrace.tsx (card references/shots/ui-entrance/draw-svg-trace.md),
// demos/ui-entrance/wall-reveal-moves/BentoLightUp.tsx (card references/shots/ui-entrance/wall-reveal-moves.md) and
// demos/ui-entrance/neon-frame-forerun/NeonFrameForerun.tsx (card references/shots/ui-entrance/neon-frame-forerun.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); the three shots are three `head`s of one trace
// (pen: an ink line with a tapering nib, crop marks first, a flash on closing; comet: a glowing head with a fading tail
// that leaves a thin rim; split: two heads leave one point and collide on the far side); colours by role (ink, the
// accent, the accent mixed with white for the hot core); the element is the scene's own painter (`content`), so the
// report card, bars, mark and copy of the upstream are gone; the marker underline of draw-svg-trace is left to the
// typography batch; the drawing-paper dots belong to the look.
import { clamp, lerp, mix, rgba, rrect, text } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { cubicOut, cubicInOut } from '../../../motion.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy, infoSize } from '../../sample.js';

// A point at arc-length share u of a rounded rectangle, starting at (x + r, y) and running clockwise (as an SVG rect).
export const rrPoint = (u, x, y, w, h, r) => {
  const sx = w - 2 * r, sy = h - 2 * r, arc = (Math.PI * r) / 2, L = 2 * sx + 2 * sy + 4 * arc;
  let s = (((u % 1) + 1) % 1) * L;
  const segs = [
    [sx, (k) => [x + r + k * sx, y]],
    [arc, (k) => [x + w - r + r * Math.sin((k * Math.PI) / 2), y + r - r * Math.cos((k * Math.PI) / 2)]],
    [sy, (k) => [x + w, y + r + k * sy]],
    [arc, (k) => [x + w - r + r * Math.cos((k * Math.PI) / 2), y + h - r + r * Math.sin((k * Math.PI) / 2)]],
    [sx, (k) => [x + w - r - k * sx, y + h]],
    [arc, (k) => [x + r - r * Math.sin((k * Math.PI) / 2), y + h - r + r * Math.cos((k * Math.PI) / 2)]],
    [sy, (k) => [x, y + h - r - k * sy]],
    [arc, (k) => [x + r - r * Math.cos((k * Math.PI) / 2), y + r - r * Math.sin((k * Math.PI) / 2)]],
  ];
  for (const [len, f] of segs) { if (s <= len) return f(len > 0 ? s / len : 0); s -= len; }
  return [x + r, y];
};
export const perimeter = (w, h, r) => 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
// Stroke the outline between shares a and b (b may pass 1 or go below a: it wraps), sampled every ~6 px.
export const strokeSpan = (ctx, [x, y, w, h], r, a, b) => {
  const L = perimeter(w, h, r), n = Math.max(2, Math.ceil((Math.abs(b - a) * L) / 6));
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const [px, py] = rrPoint(lerp(a, b, i / n), x, y, w, h, r); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
};
// Share of the left edge's middle on the outline (where the split heads start).
export const leftMid = (w, h, r) => { const sx = w - 2 * r, sy = h - 2 * r, arc = (Math.PI * r) / 2; return (2 * sx + 1.5 * sy + 3 * arc) / perimeter(w, h, r); };

// Per head: the frames of the whole motion and its phases (upstream frames).
const HEADS = {
  pen: { frames: 76, marks: [0, 12], trace: [10, 50], flash: 50, fade: [56, 10], card: [50, 10], lift: [50, 22], ink: [52, 3, 12], dim: 0 },
  comet: { frames: 26, trace: [0, 8], ring: [2, 8], fadeTo: [12, 14, 0.4], head: [8, 8], lit: [6, 8], dim: 0.18, tail: 0.22 },
  split: { frames: 40, trace: [2, 20], flash: 22, lit: [22, 18], dim: 0.12 },
};
const F = (P, role, size, weight, kind) => fontFor(P.look || NEUTRAL, role, P.lang, size, weight, kind);

// The sample's element: a neutral report card (eyebrow, title, a big number, twelve bars, a foot rule). ink(k) is the
// arrival of block k (0 → 1); the card draws itself at [x, y, w, h].
const reportCard = (P) => (ctx, [x, y, w, h], ink) => {
  const c = P.colors, info = infoSize(P.lang);
  const rise = (k, fn) => { const t = ink(k); if (t <= 0) return; ctx.save(); ctx.globalAlpha *= t; if (t < 1) ctx.filter = `blur(${((1 - t) * 6).toFixed(2)}px)`; ctx.translate(0, (1 - t) * 14); fn(); ctx.restore(); };
  rise(0, () => { ctx.beginPath(); ctx.arc(x + 70, y + 72, 6, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill(); text(ctx, copy('detailEyebrow', P.lang), x + 90, y + 82, F(P, 'mono', info + 1, 600, 'label'), { color: c.dim }); text(ctx, copy('label', P.lang), x + w - 64, y + 82, F(P, 'mono', info + 1, 500), { color: c.dim, align: 'right' }); });
  rise(1, () => text(ctx, copy('detailTitle', P.lang), x + 64, y + 196, F(P, 'display', 72, 650, 'display'), { color: mix(c.ink, c.dim, 0.35) }));
  rise(2, () => text(ctx, copy('metric2', P.lang), x + 58, y + 396, F(P, 'display', 188, 800, 'display'), { color: c.ink }));
  rise(3, () => text(ctx, copy('metric2Label', P.lang), x + 64, y + 470, F(P, 'text', 34, 480), { color: c.dim }));
  const B = [34, 40, 37, 48, 45, 54, 58, 56, 66, 74, 81, 96], bx = x + 680, bw = (376 - 110) / 12;
  B.forEach((v, i) => { const g = EASE.snappy(clamp((ink(3) * 12 - i * 0.12))); if (g <= 0) return; const bh = 3 * v * g; rrect(ctx, bx + i * (bw + 10), y + 450 - bh, bw, bh, 8); ctx.fillStyle = i >= 9 ? rgba(c.accent, 0.6 + (i - 9) * 0.2) : rgba(c.ink, 0.1); ctx.fill(); });
  rise(5, () => { ctx.fillStyle = c.line; ctx.fillRect(x + 64, y + h - 96, w - 128, 1.5); text(ctx, copy('caption', P.lang), x + 64, y + h - 46, F(P, 'text', info + 3, 480), { color: c.dim }); });
};
// The sample's ground: the scene before the element (a plain ground with a field of faint dots).
const dotGround = (P) => (ctx) => {
  const c = P.colors;
  ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
  ctx.fillStyle = rgba(c.ink, 0.18);
  for (let gy = 18; gy < 1080; gy += 48) for (let gx = 24; gx < 1920; gx += 48) {
    const d = Math.hypot((gx - 960) / 1190, (gy - 540) / 713);
    if (d > 1) continue;
    ctx.globalAlpha = d < 0.3 ? 1 : 1 - (d - 0.3) / 0.7;
    ctx.beginPath(); ctx.arc(gx, gy, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
};

export default {
  id: 'outline-trace', kind: 'motion',
  tier: 'T1', family: 'line-path', beats: 5,
  beatsFor: (P) => (HEADS[P.head] || HEADS.pen).frames / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  from: 'the scene without the element (or with it dimmed: comet 18 %, split 12 %)',
  to: 'the element in place with its own edge (pen: a hairline; comet: a thin accent rim; split: the lit frame)',
  interpolates: ['the traced share of the outline (in-out for pen, out for comet, swift for split)', 'the head (nib, comet, two heads)', 'the closing flash', 'the element\'s arrival: ink-in blocks, lift and shadow, or brightness'],
  summary: 'A line runs round one element\'s outline and names it; when it closes, the content arrives inside and the line hands over to the element\'s edge.',
  theory: 'An outline drawn in front of the eye is the strongest pointer there is (pre-attentive closure: the eye finishes a contour before it reads what is inside), so the element is chosen before its content is seen; the hand-over to the element\'s own edge keeps one line from start to end.',
  defaults: () => ({ head: 'pen', rect: [400, 210, 1120, 660], radius: 28, under: null, content: null, marks: true, shadow: true }),
  prepare(P) {
    const H = HEADS[P.head] || HEADS.pen;
    return { H, under: P.under || dotGround(P), content: P.content || reportCard(P), L0: leftMid(P.rect[2], P.rect[3], P.radius) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const H = D.H, f = p * H.frames;
    if (P.head === 'comet') {
      const draw = cubicOut(clamp((f - H.trace[0]) / H.trace[1]));
      return { f, draw, ring: EASE.out(clamp((f - H.ring[0]) / H.ring[1])), fade: lerp(1, H.fadeTo[2], 1 - Math.pow(1 - clamp((f - H.fadeTo[0]) / H.fadeTo[1]), 2)),
        head: 1 - clamp((f - H.head[0]) / H.head[1]), lit: cubicOut(clamp((f - H.lit[0]) / H.lit[1])), rise: EASE.overshoot(clamp((f - H.lit[0]) / H.lit[1])) };
    }
    if (P.head === 'split') {
      const draw = EASE.swift(clamp((f - H.trace[0]) / H.trace[1]));
      const flash = f < H.flash ? 0 : Math.exp(-(f - H.flash) / 2.5) * (f < H.flash + 10 ? 1 : 0);
      return { f, draw, flash: f >= H.flash + 10 ? 0 : flash, lit: EASE.smooth(clamp((f - H.lit[0]) / H.lit[1])), heads: draw > 0 && draw < 1 ? 1 : 0 };
    }
    const draw = cubicInOut(clamp((f - H.trace[0]) / (H.trace[1] - H.trace[0])));
    const flash = f < 52 ? ramp(f, 50, 2, 'linear') : 1 - ramp(f, 52, 6, 'out');
    return { f, draw, flash, trace: 1 - ramp(f, H.fade[0], H.fade[1], 'linear'), card: ramp(f, H.card[0], H.card[1], 'out'), lift: ramp(f, H.lift[0], H.lift[1], 'out'),
      marksIn: [0, 1, 2, 3].map((k) => ramp(f, k * 2, 12, 'snappy')), marksPop: ramp(f, 50, 10, 'out'), marksOp: 1 - ramp(f, 52, 12, 'out'),
      pen: draw <= 0 ? 0 : draw < 0.02 ? draw / 0.02 : draw > 0.995 ? 0 : draw > 0.97 ? 1 - (draw - 0.97) / 0.025 : 1 };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, [x, y, w, h] = P.rect, r = P.radius, H = D.H;
    D.under(ctx);
    if (P.head === 'comet' || P.head === 'split') {
      const lit = S.lit;
      ctx.save(); ctx.globalAlpha *= H.dim + (1 - H.dim) * lit;
      ctx.translate(0, P.head === 'comet' ? 20 * (1 - S.rise) : 0);
      rrect(ctx, x, y, w, h, r); ctx.fillStyle = c.panel; ctx.fill();
      D.content(ctx, [x, y, w, h], () => 1);
      ctx.restore();
      if (P.head === 'comet') {
        const ty = 20 * (1 - S.rise), pulse = lit * (1 - lit) * 4;
        if (pulse > 0) { ctx.save(); ctx.translate(0, ty); rrect(ctx, x, y, w, h, r); ctx.clip(); const g = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, h * 0.9); g.addColorStop(0, rgba(c.accent, 0.16 * pulse)); g.addColorStop(1, rgba(c.accent, 0)); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore(); }
        if (S.draw <= 0) return;
        ctx.save(); ctx.translate(0, ty); ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(c.accent, S.ring * S.fade); ctx.lineWidth = 1.5; strokeSpan(ctx, [x + 0.75, y + 0.75, w - 1.5, h - 1.5], r, 0, S.draw);
        if (S.head > 0) {
          const a = Math.max(0, S.draw - H.tail), rr = [x + 1.5, y + 1.5, w - 3, h - 3];
          ctx.globalAlpha = 0.8 * S.head; ctx.filter = 'blur(5px)'; ctx.strokeStyle = c.accent; ctx.lineWidth = 6; strokeSpan(ctx, rr, r, a, S.draw);
          ctx.filter = 'none'; ctx.globalAlpha = S.head; ctx.strokeStyle = mix(c.accent, '#ffffff', 0.6); ctx.lineWidth = 2.5; strokeSpan(ctx, rr, r, a, S.draw);
        }
        ctx.restore();
        return;
      }
      // split: two heads from the left middle, one over the top and one under the bottom, meeting on the right
      if (S.draw <= 0) return;
      const L0 = D.L0, rr = [x, y, w, h];
      const tube = (width, color, alpha, blur) => { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; strokeSpan(ctx, rr, r, L0, L0 + S.draw / 2); strokeSpan(ctx, rr, r, L0, L0 - S.draw / 2); ctx.restore(); };
      tube(26, c.accent, 0.22, 14); tube(12, c.accent, 0.45, 5); tube(4, mix(c.accent, '#ffffff', 0.2), 1, 0); tube(1.6, mix(c.accent, '#ffffff', 0.85), 1, 0);
      if (S.heads) for (const s of [L0 + S.draw / 2, L0 - S.draw / 2]) {
        const [hx, hy] = rrPoint(s, x, y, w, h, r);
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 34); g.addColorStop(0, rgba('#ffffff', 0.95)); g.addColorStop(0.3, rgba(mix(c.accent, '#ffffff', 0.5), 0.6)); g.addColorStop(1, rgba(c.accent, 0));
        ctx.fillStyle = g; ctx.fillRect(hx - 34, hy - 34, 68, 68);
      }
      if (S.flash > 0.01) {
        const [hx, hy] = rrPoint(L0 + 0.5, x, y, w, h, r), R = 60 + 140 * (1 - S.flash);
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, R); g.addColorStop(0, rgba('#ffffff', S.flash)); g.addColorStop(0.4, rgba(mix(c.accent, '#ffffff', 0.4), 0.6 * S.flash)); g.addColorStop(1, rgba(c.accent, 0));
        ctx.fillStyle = g; ctx.fillRect(hx - R, hy - R, 2 * R, 2 * R);
      }
      return;
    }
    // pen: crop marks, the card rising off the paper, its content inking in, the line and its nib
    if (P.marks && S.marksOp > 0.001) {
      ctx.save(); ctx.globalAlpha = S.marksOp; ctx.lineCap = 'round';
      [[x, y, -1, -1], [x + w, y, 1, -1], [x + w, y + h, 1, 1], [x, y + h, -1, 1]].forEach(([cx, cy, sx, sy], k) => {
        const t = S.marksIn[k], off = 26 + 22 * S.marksPop, len = 54 * t, ox = cx + sx * off, oy = cy + sy * off;
        if (t <= 0) return;
        ctx.save(); ctx.globalAlpha *= t; ctx.strokeStyle = c.dim; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - sx * len, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - sy * len); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
      });
      ctx.restore();
    }
    if (S.card > 0) {
      ctx.save(); ctx.globalAlpha *= S.card;
      if (P.shadow) { const e = 4 + S.lift * 26; ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.5), 0.22); ctx.shadowBlur = e * 1.3; ctx.shadowOffsetY = e * 0.55; rrect(ctx, x, y, w, h, r); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore(); }
      rrect(ctx, x, y, w, h, r); ctx.fillStyle = c.panel; ctx.fill();
      ctx.restore();
    }
    D.content(ctx, [x, y, w, h], (k) => ramp(S.f, D.H.ink[0] + k * D.H.ink[1], D.H.ink[2], 'out'));
    if (S.trace < 1) { rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.strokeStyle = rgba(c.ink, 0.14 * (1 - S.trace)); ctx.lineWidth = 1.5; ctx.stroke(); }
    if (S.trace > 0.001 && S.draw > 0) {
      ctx.save(); ctx.globalAlpha = S.trace; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = S.flash > 0.5 ? mix(c.ink, '#000000', 1) : c.ink; ctx.lineWidth = 6 + S.flash * 5;
      strokeSpan(ctx, [x, y, w, h], r, 0, S.draw);
      if (S.pen > 0) {
        ctx.globalAlpha = S.trace * S.pen; ctx.strokeStyle = c.ink;
        for (const [len, lw] of [[0.04, 6.4], [0.024, 8], [0.0112, 9.6]]) { ctx.lineWidth = lw; strokeSpan(ctx, [x, y, w, h], r, Math.max(0, S.draw - len), S.draw); }
        const [nx, ny] = rrPoint(S.draw, x, y, w, h, r);
        ctx.beginPath(); ctx.arc(nx + 1.5, ny + 4, 10, 0, Math.PI * 2); ctx.fillStyle = rgba(mix(c.ink, '#000000', 0.5), 0.16); ctx.fill();
        ctx.beginPath(); ctx.arc(nx, ny, 7.5, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill();
        ctx.beginPath(); ctx.arc(nx - 2.2, ny - 2.4, 2, 0, Math.PI * 2); ctx.fillStyle = rgba('#ffffff', 0.4); ctx.fill();
      }
      ctx.restore();
    }
  },
  // the head (the two heads for split) and the element's centre
  track(S, P, D) {
    const [x, y, w, h] = P.rect, r = P.radius;
    if (P.head === 'split') return [rrPoint(D.L0 + S.draw / 2, x, y, w, h, r), rrPoint(D.L0 - S.draw / 2, x, y, w, h, r)];
    const ty = P.head === 'comet' ? 20 * (1 - S.rise) : 0;
    const head = rrPoint(S.draw, x, y, w, h, r);
    return [[head[0], head[1] + ty], [x + w / 2, y + h / 2 + ty]];
  },
  // the head's own speed is the stroke, not a blur: blur only the comet's lift
  blur(p, P) { return P.head === 'comet'; },
};

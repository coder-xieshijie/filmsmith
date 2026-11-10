// collapse-burst — a word ends on the mode's dot; the word shrinks into the dot, the dot swells and holds with a small
// squash (anticipation), then bursts into a crisp ring and particles that fly out and condense, left to right, onto the
// next word's glyph cells; on landing they give way to the real text and its dot. Theory: anticipation and the pause
// before release (Thomas & Johnston 1981); particles moving together read as one object (common fate).
// references/transitions.md#collapse-burst.

import { seg, settle, clamp, expIn, expOut, cubicInOut, mix, text, measure, scratch, canvasOf, ground } from './util.js';
import { hash } from '../rng.js';

// local time in seconds at the approved tempo (the hand-off lasts 1.31 s at 120 BPM and scales with its beats)
const T = 1.31, COLLAPSE = 0.25, BURST = 0.5, COND = 0.72, DCOND = 0.45, RING = 0.42;

export default {
  name: 'collapse-burst',
  tier: 'T2',
  beats: 2.62,
  modes: ['ink', 'halftone', 'pulse'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a word ending on the dot',
  to: 'the next word and its dot',
  interpolates: ['word scale (into the dot)', 'dot swell and squash', 'particle positions (dot → cloud → glyph cells)', 'particle colour'],
  summary: 'A word shrinks into its dot; the dot holds, squashes, bursts into particles that condense into the next word.',
  theory: 'Anticipation and a held pause before release (Thomas & Johnston 1981); particles that move together read as one thing (common fate, Wertheimer 1923).',
  defaults: {
    from: { text: 'seedfield', paint: null },   // paint(ctx): more of scene A to collapse with the word (a caption)
    to: { text: '512 tiles' },
    x: 960, baseline: 640,
    font: { family: 'sans-serif', weight: 800, size: 300 },
    step: 6,                             // particle grid (px)
    cloud: 620,                          // cloud radius (px)
    seed: 11,
    colors: { ground: '#EFEEE8', ink: '#111214', accent: '#2B3BFF' },
  },
  prepare(P) {
    const g = scratch(), f = P.font, size = f.size;
    const r = Math.round(size * 0.078), gap = size * 0.035;
    const lay = (word) => {
      const w = measure(g, word, f).width, x = P.x - (w + gap + 2 * r) / 2;
      return { x, w, dot: { x: x + w + gap + r, y: P.baseline - r } };
    };
    const A = lay(P.from.text), B = lay(P.to.text);
    // sample word B on the particle grid: glyphs red, the dot green
    const y0 = Math.floor(P.baseline - size), y1 = Math.ceil(P.baseline + 0.3 * size);
    const x0 = Math.floor(B.x - 20), x1 = Math.ceil(B.dot.x + r + 20), iw = x1 - x0, ih = y1 - y0;
    const c = canvasOf(iw, ih), cg = c.getContext('2d', { willReadFrequently: true });
    text(cg, P.to.text, B.x - x0, P.baseline - y0, f, { color: '#ff0000' });
    cg.fillStyle = '#00ff00'; cg.beginPath(); cg.arc(B.dot.x - x0, B.dot.y - y0, r, 0, Math.PI * 2); cg.fill();
    const img = cg.getImageData(0, 0, iw, ih).data, st = P.step, parts = [];
    // the cloud sits between the burst point and the word it becomes (a directed burst, inside the frame)
    const ccx = A.dot.x + (B.x + (B.dot.x - B.x) / 2 - A.dot.x) * 0.7, ccy = P.baseline - size * 0.36;
    for (let y = st / 2; y < ih; y += st) {
      for (let x = st / 2; x < iw; x += st) {
        const k = (Math.floor(y) * iw + Math.floor(x)) * 4;
        if (img[k + 3] < 110) continue;
        const i = parts.length, s = P.seed;
        const th = hash(i, s * 7 + 1) * Math.PI * 2, d = P.cloud * Math.sqrt(hash(i, s * 7 + 2));
        parts.push({
          tx: x0 + x, ty: y0 + y, dot: img[k + 1] > img[k],
          sx: A.dot.x + (hash(i, s * 7 + 3) - 0.5) * r * 1.4, sy: A.dot.y + (hash(i, s * 7 + 4) - 0.5) * r * 1.4,
          cx: ccx + Math.cos(th) * d * 1.1, cy: ccy + Math.sin(th) * d * 0.55,
          lag: clamp((x0 + x - B.x) / (B.dot.x - B.x)) * 0.11 + hash(i, s * 7 + 5) * 0.03,
        });
      }
    }
    return { A, B, r, parts };
  },
  rest(side) { return side === 'from' ? { t: 0, s: 1, swell: 1, sq: 0, phase: 'A' } : { t: T, phase: 'B' }; },
  at(p) {
    const t = p * T;
    if (p >= 1) return { t: T, phase: 'B' };
    if (t >= BURST) return { t, phase: 'burst', a: expOut(seg(t, BURST, BURST + 0.32)), ring: seg(t, BURST, BURST + RING) };
    return {
      t, phase: 'A',
      s: 1 - Math.pow(seg(t, 0, COLLAPSE), 2.5),
      swell: 1 + 0.35 * settle(seg(t, 0.1, BURST), 6.4),
      sq: expIn(seg(t, BURST - 0.14, BURST)),
    };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors, { A, B, r } = D;
    if (S.phase === 'A') {
      if (S.s > 0.002) {
        ctx.save();
        ctx.translate(A.dot.x, A.dot.y); ctx.scale(S.s, S.s); ctx.translate(-A.dot.x, -A.dot.y);
        text(ctx, P.from.text, A.x, P.baseline, P.font, { color: C.ink });
        if (P.from.paint) P.from.paint(ctx);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(A.dot.x, A.dot.y); ctx.scale(S.swell * (1 + 0.22 * S.sq), S.swell * (1 - 0.2 * S.sq));
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    if (S.phase === 'B') {
      text(ctx, P.to.text, B.x, P.baseline, P.font, { color: C.ink });
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(B.dot.x, B.dot.y, r, 0, Math.PI * 2); ctx.fill();
      return;
    }
    // particles: dot → cloud (expo out) → glyph cell (cubic in-out, left to right), accent → ink on the way in
    const st = P.step;
    for (const q of D.parts) {
      const b = cubicInOut(seg(S.t, COND + q.lag, COND + q.lag + DCOND));
      const x = q.sx + (q.cx - q.sx) * S.a, y = q.sy + (q.cy - q.sy) * S.a;
      const sz = 4 + (st + 0.6 - 4) * b;
      ctx.fillStyle = q.dot ? C.accent : mix(C.accent, C.ink, clamp((b - 0.45) / 0.5));
      ctx.fillRect(x + (q.tx - x) * b - sz / 2, y + (q.ty - y) * b - sz / 2, sz, sz);
    }
    // the burst ring: one crisp stroke thinning to nothing
    if (S.ring > 0 && S.ring < 1) {
      ctx.strokeStyle = C.accent; ctx.lineWidth = 12 * Math.pow(1 - S.ring, 1.5);
      ctx.beginPath(); ctx.arc(A.dot.x, A.dot.y, r * 1.35 + 1000 * expOut(S.ring), 0, Math.PI * 2); ctx.stroke();
    }
  },
  track: (S, P, D) => {
    const { A } = D, out = [[A.x + (A.dot.x - A.x) * (1 - (S.s ?? 0)), P.baseline]];
    const t = S.t, a = S.a ?? (t >= BURST ? 1 : 0);
    for (let i = 0; i < D.parts.length; i += Math.max(1, Math.floor(D.parts.length / 24))) {
      const q = D.parts[i];
      const b = t < BURST ? 0 : cubicInOut(seg(t, COND + q.lag, COND + q.lag + DCOND));
      const x = q.sx + (q.cx - q.sx) * a, y = q.sy + (q.cy - q.sy) * a;
      out.push(t < BURST ? [q.sx, q.sy] : [x + (q.tx - x) * b, y + (q.ty - y) * b]);
    }
    return out;
  },
};

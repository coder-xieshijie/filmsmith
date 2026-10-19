// field-morph — the ground is one procedural wave field printed on a halftone screen; only its parameters change: a
// second source switches on and its front spreads (interference, 'interfere'), a front from the first source quantizes
// the field into binary blocks ('quantize'), the blocks resize, inside out, into a pixel sprite ('resolve'). One field,
// new parameters, never an image swap. Theory: ordered dither and halftone (Bayer 1973; Ulichney 1987).
// references/transitions.md#field-morph.

import { seg, cubicInOut, cubicOut, ground } from './util.js';
import { screen } from './halftone.js';

const BEATS = { interfere: 1, quantize: 0.6, resolve: 0.5 };

const farFrom = ([x, y]) => Math.max(Math.hypot(x, y), Math.hypot(1920 - x, y), Math.hypot(x, 1080 - y), Math.hypot(1920 - x, 1080 - y));

// tone of the field at (x, y): one or two radial wave sources under an envelope around the first
const tone = (x, y, S, P) => {
  const [c1, c2] = P.sources, L = P.lambda;
  const d1 = Math.hypot(x - c1[0], y - c1[1]);
  const w1 = Math.cos((2 * Math.PI * (d1 - S.phase)) / L);
  let h = w1;
  if (S.front > 0 && c2) {
    const d2 = Math.hypot(x - c2[0], y - c2[1]);
    const a2 = Math.min(1, Math.max(0, (S.front - d2) / 80));
    if (a2 > 0) h = (w1 + a2 * Math.cos((2 * Math.PI * (d2 - S.phase)) / L)) / (1 + a2);
  }
  const env = 1 - Math.min(1, Math.max(0, (d1 - P.envelope[0]) / P.envelope[1]));
  return env * (0.5 + 0.5 * h);
};

export default {
  name: 'field-morph',
  tier: 'T1',
  beats: 1,
  beatsFor: (P) => BEATS[P.step] ?? 1,
  modes: ['halftone'],
  roles: ['ground', 'ink', 'accent'],
  from: 'the field in its current parameters (one source; two; quantized)',
  to: 'the same field with the next parameters (two sources; binary blocks; a sprite)',
  interpolates: ['second source front radius', 'quantize front radius', 'block size per cell (inside out)', 'wave phase (drift)'],
  summary: 'One halftone wave field changes parameters: a second source spreads, a front quantizes it, the blocks resolve into a sprite.',
  theory: 'Ordered dither and halftone (Bayer 1973; Ulichney 1987): one field under new parameters reads as one ground changing state.',
  defaults: {
    step: 'interfere',                   // 'interfere', 'quantize', 'resolve'
    sources: [[1380, 520], [1110, 770]],
    lambda: 96,                          // wavelength (px)
    phase: 0,                            // wave drift at p = 0 (px); pass drift × scene time to keep it moving
    drift: 70,                           // px/s outward while interfering
    dur: null,                           // seconds the step lasts (drift); default its beats at 120 BPM
    envelope: [620, 760],                // full tone within r0 of the first source, falling to 0 over the next r1
    pitch: 12, angle: 45,
    block: 40,                           // quantized block (px), on a grid centred on the first source
    sprite: ['XX.........', '.XX........', '..XX.......', '...XX......', '..XX.......', '.XX........', 'XX...CCCCCC'],
    spriteAt: [-5, -3],                  // sprite's first cell, in blocks from the first source
    showSources: true,
    colors: { ground: '#F1EDE4', ink: '#141414', accent: '#00A3E0' },
  },
  rest(side, P) {
    const from = side === 'from';
    if (P.step === 'interfere') return { phase: P.phase + (from ? 0 : P.drift * (P.dur ?? BEATS.interfere * 0.5)), front: from ? 0 : farFrom(P.sources[1] || [0, 0]) + 100, R3: 0, k: 0 };
    if (P.step === 'quantize') return { phase: P.phase, front: 1e5, R3: from ? 0 : farFrom(P.sources[0]) + 4, k: 0 };
    return { phase: P.phase, front: 1e5, R3: 1e5, k: from ? 0 : 1 };
  },
  at(p, P) {
    if (p <= 0) return this.rest('from', P);
    if (p >= 1) return this.rest('to', P);
    if (P.step === 'interfere') {
      const dur = P.dur ?? BEATS.interfere * 0.5;
      return { phase: P.phase + P.drift * dur * p, front: (farFrom(P.sources[1] || [0, 0]) + 100) * p, R3: 0, k: 0 };
    }
    if (P.step === 'quantize') return { phase: P.phase, front: 1e5, R3: (farFrom(P.sources[0]) + 4) * cubicInOut(p), k: 0 };
    return { phase: P.phase, front: 1e5, R3: 1e5, k: p };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const C = P.colors, [c1, c2] = P.sources, B = P.block;
    const big = S.R3 >= 1e4;
    if (!big) {
      ctx.save();
      if (S.R3 > 0) { ctx.beginPath(); ctx.rect(0, 0, 1920, 1080); ctx.arc(c1[0], c1[1], S.R3, 0, Math.PI * 2); ctx.clip('evenodd'); }
      screen(ctx, { pitch: P.pitch, angle: P.angle, ox: c1[0], oy: c1[1], color: C.ink, tone: (x, y) => tone(x, y, S, P) });
      ctx.restore();
      if (P.showSources) {
        ctx.fillStyle = C.accent;
        if (S.R3 < 14) { ctx.beginPath(); ctx.arc(c1[0], c1[1], 14, 0, Math.PI * 2); ctx.fill(); }
        if (c2 && S.front > 0 && Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) > S.R3 - 14) {
          const s = cubicOut(Math.min(1, S.front / 300));
          ctx.beginPath(); ctx.arc(c2[0], c2[1], 14 * s, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    if (S.R3 <= 0) return;
    ctx.save();
    if (!big) { ctx.beginPath(); ctx.arc(c1[0], c1[1], S.R3, 0, Math.PI * 2); ctx.clip(); }
    const ink = new Path2D(), cyan = new Path2D();
    const ni = Math.ceil(1920 / B) + 1, nj = Math.ceil(1080 / B) + 1, [si, sj] = P.spriteAt;
    const spriteCell = (i, j) => { const r = P.sprite[j - sj], ch = r ? r[i - si] : undefined; return ch === 'X' ? 1 : ch === 'C' ? 2 : 0; };
    const frozen = { ...S, front: 1e5 };
    for (let i = -ni; i <= ni; i++) {
      for (let j = -nj; j <= nj; j++) {
        const x = c1[0] + i * B, y = c1[1] + j * B;
        if (x < -B || x > 1920 + B || y < -B || y > 1080 + B) continue;
        const s0 = tone(x, y, frozen, P) > 0.5 ? 1 : 0, sp = spriteCell(i, j), s1 = sp ? 1 : 0;
        let k = s0;
        if (S.k > 0 && s0 !== s1) {
          const lag = 0.3 * Math.min(1, (Math.hypot(i, j) * B) / 900);   // inside out
          k = s0 + (s1 - s0) * cubicOut(seg(S.k, lag, lag + 0.7));
        } else if (S.k > 0) k = s1;
        if (k <= 0.01) continue;
        const w = B * k;
        (sp === 2 && S.k > 0 ? cyan : ink).rect(x - w / 2, y - w / 2, w, w);
      }
    }
    ctx.fillStyle = C.ink; ctx.fill(ink);
    ctx.fillStyle = C.accent; ctx.fill(cyan);
    ctx.restore();
  },
};

// dot-quantize — a printed field becomes data: a front runs out of the anchor and turns the screened dots behind it
// into binary blocks on a 23 px grid (half a beat), then the blocks re-sort, inside out, into the blocks of the next
// field (1.25 beats); blocks that agree never move. One generating picture, quantized and re-read; never a cross-fade.
// From the halftone template's `quantize` boundary (assets/templates/halftone/film.js paintBoundary quantize,
// drawBlocks, binOf; timing.rules.js quantBeats 0.5, sortBeats 1.25). Theory: ordered dither and quantization (Bayer
// 1973; Ulichney 1987): the same tone printed at a coarser resolution reads as the same image turned into data.
import { P, W, H, secs, worldColors, fieldTone, drawField, drawBlocks, binOf, DEF, KINDS, clamp, cubicInOut, cubicOut } from './press.js';

const QB = 0.5, SB = 1.25, BEATS = QB + SB;
export default {
  id: 'dot-quantize', kind: 'motion',
  tier: 'T1', family: 'shape',
  beats: 2,
  surface: ['canvas'],
  roles: ['ground', 'ink'],
  from: 'a screened field round the anchor (dots)', to: 'the next field as binary blocks',
  interpolates: ['radius of the quantizing front', 'each block 0 → 1 by its distance from the anchor'],
  summary: 'A front from the anchor turns the halftone dots into square blocks, which then re-sort inside out into the next field.',
  theory: 'Quantization and ordered dither (Bayer 1973; Ulichney 1987): a tone reprinted coarser reads as the same picture turned into data; one generating function re-read, not a picture swapped.',
  defaults: () => ({ from: 'cells', to: 'rows', world: 'paper', seed: 7, bpm: 120, dot: 'round' }),
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: p }; },
  paint(ctx, S, P_, D) {
    const C = worldColors(P_.colors, P_.world), bpm = P_.bpm || 120, b = S.u * BEATS, t = secs(b, bpm), tb = secs(QB, bpm);
    if (P_.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, H); }
    const A = fieldTone(P_.from, 0, { seed: P_.seed }), Aq = fieldTone(P_.from, 0, { seed: P_.seed, quant: true }), Bq = fieldTone(P_.to, 0, { seed: P_.seed + 5, quant: true });
    if (S.u <= 0) { drawField(ctx, A, C.ink, { pitch: DEF.pitch, shape: P_.dot }); return; }
    if (t < tb) {
      const R = 1500 * cubicInOut(t / tb);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(P[0], P[1], Math.max(0.1, R), 0, Math.PI * 2); ctx.clip('evenodd');
      drawField(ctx, A, C.ink, { pitch: DEF.pitch, shape: P_.dot }); ctx.restore();
      drawBlocks(ctx, binOf(Aq), C.ink, (x, y) => Math.hypot(x - P[0], y - P[1]) < R);
      return;
    }
    const s0 = binOf(Aq), s1 = binOf(Bq), span = secs(SB, bpm) - 0.14, end = S.u >= 1;
    drawBlocks(ctx, (x, y) => { const a = s0(x, y), z = s1(x, y); if (a === z || end) return z; return a + (z - a) * cubicOut(clamp((t - tb - span * clamp(Math.hypot(x - P[0], y - P[1]) / 900)) / 0.14)); }, C.ink);
  },
  track(S) { const k = 1 - Math.pow(1 - clamp(S.u), 3); return [[P[0] - 400 + 400 * k, P[1]]]; },
};

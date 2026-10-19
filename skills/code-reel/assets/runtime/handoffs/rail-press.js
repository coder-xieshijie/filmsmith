// rail-press — the mode's own line presses a word into itself, takes its weight (thickens) and recovers; then the line
// thickens upward into a bar and a blade cuts the bar, left to right, into the next word. Theory: good continuation and
// object constancy, the line never leaves the screen. references/transitions.md#rail-press.

import { seg, settle, lerp, clamp, expOut, expInOut, text, measure, scratch, ground } from './util.js';

// phases as windows of p: press (cubic in), weight recovery (landing), bar grows (expo out), cut (expo in-out)
const PHASES = {
  both: { press: [0, 0.18], rec: [0.18, 0.45], bar: [0.45, 0.75], cut: [0.75, 0.97] },
  press: { press: [0, 0.36], rec: [0.36, 1] },
  cut: { bar: [0, 0.55], cut: [0.55, 0.97] },
};

export default {
  name: 'rail-press',
  tier: 'T2',
  beats: 2,
  beatsFor: (P) => (P.phase === 'both' ? 2 : 1),
  modes: ['thread', 'morph', 'plakat'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a word, with the line resting above it',
  to: 'the line alone (press), then a word cut out of it (cut)',
  interpolates: ['line height', 'line thickness', 'word squash', 'bar top', 'line width', 'blade x'],
  summary: 'The line presses a word into itself, takes its weight, then grows into a bar that a blade cuts into the next word.',
  theory: 'Good continuation (Wertheimer 1923) and object constancy (Heer & Robertson 2007): the line is one object throughout.',
  defaults: {
    phase: 'both',                       // 'press' (word → line), 'cut' (line → word), 'both'
    x: 960, baseline: 600,
    font: { family: 'sans-serif', weight: 700, size: 230, spacing: -6 },
    from: { text: 'tracewire' },
    to: { text: 'rewind' },
    line: { width: 8, gap: 6, above: 30, pad: 24, padTo: 10 },
    colors: { ground: '#0B0B0D', ink: '#EDEAE2', accent: '#EE4938' },
  },
  prepare(P) {
    const g = scratch();
    const m1 = measure(g, P.from.text, P.font), m2 = measure(g, P.to.text, P.font);
    return {
      cap1: m1.actualBoundingBoxAscent, cap2: m2.actualBoundingBoxAscent,
      half1: m1.width / 2 + P.line.pad, half2: m2.width / 2 + P.line.padTo,
    };
  },
  rest(side, P, D) {
    const { baseline: base } = P, { width: th, gap, above } = P.line;
    const S0 = { yTop: base - D.cap1 - above, th, scaleY: 1, half: D.half1, barTop: base - D.cap1 - above, blade: P.x - D.half1 - 2, cutting: false };
    const S1 = { yTop: base + gap, th, scaleY: 0, half: D.half1, barTop: base + gap, blade: P.x - D.half1 - 2, cutting: false };
    const S2 = { yTop: base + gap, th, scaleY: 0, half: D.half2, barTop: base - D.cap2, blade: P.x + D.half2 + 2, cutting: true };
    if (side === 'from') return P.phase === 'cut' ? S1 : S0;
    return P.phase === 'press' ? S1 : S2;
  },
  at(p, P, D) {
    const ph = PHASES[P.phase] || PHASES.both;
    const { baseline: base } = P, { width: th0, gap, above } = P.line;
    const yRest = base - D.cap1 - above, yBand = base + gap;
    const pp = ph.press ? Math.pow(seg(p, ...ph.press), 3) : 1;
    const yTop = pp >= 1 ? yBand : lerp(yRest, yBand, pp);
    const sq = 1 - clamp((base - (yTop + th0)) / D.cap1);   // 0 untouched … 1 pressed flat
    let bump = 0;
    if (ph.press && p < ph.press[1]) bump = sq;
    else if (ph.rec) bump = 1 - settle(seg(p, ...ph.rec), 5);
    const pb = ph.bar ? expOut(seg(p, ...ph.bar)) : 0;
    const half = pb >= 1 ? D.half2 : lerp(D.half1, D.half2, pb);
    const barTop = pb >= 1 ? base - D.cap2 : lerp(yTop, base - D.cap2, pb);
    const cutting = !!ph.cut && p >= ph.cut[0];
    const pc = ph.cut ? expInOut(seg(p, ...ph.cut)) : 0;
    const blade = lerp(P.x - half - 2, P.x + half + 2, pc);
    return { yTop, th: bump ? th0 * (1 + 1.1 * bump) : th0, scaleY: 1 - sq, half, barTop, blade, cutting };
  },
  paint(ctx, S, P) {
    ground(ctx, P);
    const { x: cx, baseline: base, font: f, colors: C } = P;
    if (S.scaleY > 0.004) {
      ctx.save();
      ctx.translate(0, base); ctx.scale(1, S.scaleY); ctx.translate(0, -base);
      text(ctx, P.from.text, cx, base, f, { color: C.ink, align: 'center' });
      ctx.restore();
    }
    const xl = cx - S.half, xr = cx + S.half, lineBot = S.yTop + S.th;
    ctx.fillStyle = C.accent;
    if (!S.cutting) { ctx.fillRect(xl, S.barTop, xr - xl, lineBot - S.barTop); return; }
    // right of the blade the bar is still solid; left of it only the word's glyphs and the line band remain
    if (S.blade < xr) ctx.fillRect(S.blade, S.barTop, xr - S.blade, lineBot - S.barTop);
    ctx.fillRect(xl, S.yTop, Math.min(S.blade, xr) - xl, S.th);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, S.blade, ctx.canvas.height); ctx.clip();
    text(ctx, P.to.text, cx, base, f, { color: C.accent, align: 'center' });
    ctx.restore();
  },
  track: (S, P, D) => [[P.x - S.half, S.yTop], [P.x + S.half, S.yTop + S.th], [P.x, S.barTop], [S.blade, S.barTop], [P.x, P.baseline - D.cap1 * S.scaleY]],
};

// dial-sweep — numbers set round a huge paper dial sweep through 96° and stop dead; the answer, at the top, flies down
// to become the first figure of the title while the others blur away, and the title's words fade in after it.
// Adapted from video-shotcraft demos/typography/countdown-arc-scatter/CountdownArcScatter.tsx (card
// references/shots/typography/countdown-arc-scatter.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand wordmark, label, install
// command and backdrop removed; numbers, the answer and the title are parameters; the title is set by type.js (Chinese
// phrases) and measured, so the answer's slot is the measured figure instead of a fixed 0.6 em; the springs are the
// closed form of type.js, exact at rest.
import { clamp, lerp, ground, rgba, mix, measure, scratch, text, fontOf } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { setText, drawUnit, fontSpec, pick, langOf, springF } from '../type-enter/type.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c = (u) => u) => c(R((f - a) / d));
const deg = Math.PI / 180;
const K = { sp: 24, r: 700, cx: 960, cy: 1150, num: 112, title: 150, titleY: 600, arc: 800,
  hand: [32, 20], out: [28, 16], words: [42, 4, 14], tint: [64, 12], frames: 82.5 };
const rotAt = (f) => (f <= 5 ? 96 + 3 * EASE.swift(R(f / 5)) : 99 * (1 - springF(f - 5, { damping: 12, stiffness: 60, settle: 60 })));
const windowOp = (pa) => R((70 - Math.abs(pa)) / 22);

const norm = (P) => {
  const lang = langOf(pick(P.rest, P.lang || 'en'), P.lang);
  return { ...P, lang, rest: pick(P.rest, lang) };
};

export default {
  id: 'dial-sweep', kind: 'motion',
  tier: 'T2', family: 'shape', beats: 5.5,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'dim', 'line', 'accent'],
  from: 'a dial of numbers at rest, the arc across the lower frame',
  to: 'the title, its first figure the number the dial stopped on',
  interpolates: ['dial angle: a 3° wind-up, then a spring 99° → 0 with one small overshoot', 'the answer: dial position → title slot, size 112 → 150, its tilt → 0', 'the other numbers and ticks fading and blurring in place', 'title words: blur, rise and fade; the last word to the accent'],
  summary: 'Numbers round a huge dial sweep 96° and stop dead; the answer at the top flies down to become the first figure of the title while the others blur away.',
  theory: 'The dial makes a number a measurement: the sweep searches, the stop decides (expectation and resolution, Huron 2006); the answer keeps its identity as it becomes text (object constancy).',
  defaults: (ctx = {}) => ({
    nums: ['30', '20', '15', '10', '5', '2', '1'], hero: 5,
    rest: { en: 'min to ship', zh: '分钟发布' }, accentLast: true, ticks: true,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), tf = fontSpec(P, K.title, 750), nf = fontSpec(P, K.num, 750);
    const hero = String(P.nums[P.hero]), hw = measure(g, hero, tf).width, gap = 0.24 * K.title;
    const restW = measure(g, P.rest, tf).width, W = hw + gap + restW, x0 = 960 - W / 2;
    const L = setText(g, P.rest, tf, P.lang, { by: 'word', x: x0 + hw + gap, y: K.titleY, align: 'left', maxW: 1e5,
      accent: P.accentLast ? P.rest.slice(P.rest.lastIndexOf(P.lang === 'zh' ? '' : ' ') + 1) || null : null });
    if (P.accentLast && P.lang === 'zh') { const u = L.units[L.units.length - 1]; u.accent = [0, u.s.length]; }
    return { N: P, tf, nf, hero, slot: [x0 + hw / 2, K.titleY], L, frames: this.beats * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames, N = D.N, rot = rotAt(f), h = EASE.swift(R((f - K.hand[0]) / K.hand[1])), out = EASE.swift(R((f - K.out[0]) / K.out[1]));
    const nums = N.nums.map((_, i) => {
      const pa = (i - N.hero) * K.sp + rot;
      let x = K.cx + Math.sin(pa * deg) * K.r, y = K.cy - Math.cos(pa * deg) * K.r, rs = pa, op = windowOp(pa), size = K.num, blur = 0;
      if (i === N.hero) { x = lerp(x, D.slot[0], h); y = lerp(y, D.slot[1], h); rs *= 1 - h; size = lerp(K.num, K.title, h); op = Math.max(op, h); }
      else { op *= 1 - out; blur = out * 10; }
      return { x, y, rs, op, size, blur };
    });
    const words = D.L.units.map((_, i) => EASE.out(R((f - K.words[0] - i * K.words[1]) / K.words[2])));
    return { p, f, rot, out, nums, words, tint: EASE.swift(R((f - K.tint[0]) / K.tint[1])) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors;
    ground(ctx, P);
    // static hairline arc outside the numbers, and ticks that turn with the dial
    ctx.save(); ctx.globalAlpha = 1 - 0.65 * S.out; ctx.strokeStyle = c.line; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(K.cx, K.cy, K.arc, -Math.PI / 2 - 70 * deg, -Math.PI / 2 + 70 * deg); ctx.stroke();
    if (P.ticks) for (let k = -30; k <= 30; k++) {
      const a = (k * 4 - 48 + S.rot) * deg, op = windowOp(k * 4 - 48 + S.rot) * (1 - S.out);
      if (op <= 0) continue;
      const r0 = K.r - 90, r1 = r0 - (k % 6 === 0 ? 26 : 12);
      ctx.globalAlpha = op; ctx.beginPath(); ctx.moveTo(K.cx + Math.sin(a) * r0, K.cy - Math.cos(a) * r0); ctx.lineTo(K.cx + Math.sin(a) * r1, K.cy - Math.cos(a) * r1); ctx.stroke();
    }
    ctx.restore();
    // the numbers, set along the tangent
    S.nums.forEach((n, i) => {
      if (n.op <= 0.003) return;
      ctx.save(); ctx.globalAlpha = n.op; if (n.blur > 0.1) ctx.filter = `blur(${n.blur.toFixed(2)}px)`;
      ctx.translate(n.x, n.y); ctx.rotate(n.rs * deg);
      ctx.font = fontOf({ ...D.nf, size: n.size }); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = c.ink; ctx.fillText(String(P.nums[i]), 0, 0); ctx.restore();
    });
    // the title's words after the answer
    D.L.units.forEach((u, i) => {
      const q = S.words[i], ac = mix(c.ink, c.accent, S.tint);
      drawUnit(ctx, u, D.L, { alpha: q, dy: (1 - q) * 20, blur: q >= 0.999 ? 0 : (1 - q) * 10, color: c.ink, accentColor: ac });
    });
  },
  track(S, P, D) { return S.nums.map((n) => [n.x, n.y]); },
};

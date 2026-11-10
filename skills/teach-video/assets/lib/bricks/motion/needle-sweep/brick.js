// needle-sweep — gauges self-test: each needle flings round the full 270° arc, lighting the ticks it passes, then
// springs back past its value and settles; the gauges start a few frames apart and each value pops as its needle lands.
// Adapted from video-shotcraft demos/data/gauge-readout-moves/NeedleSweepSelftest.tsx (card
// references/shots/data/gauge-readout-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React, Remotion or SVG); colours by role (needle and its arc in the
// accent, the red zone in `fail`, faces and ticks from ink and line, the status pill accent then `ok`); brand, card
// title and metric names removed (the film's slots, illustrative by default); values are 0–1 shares of the scale; the
// card's fade-in is the scene's, so the faces are lit at rest and the ignition only brightens them.
import { clamp, mix, rgba, rrect, text, measure, ground } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { figures, spring, dampingFor } from '../digit-roll/brick.js';

const F0 = 10, F = 60;                               // upstream frames 10–70 map to p 0 → 1
const SWEEP = 12, STIFF = 120, ARC = 270;            // fling frames, spring stiffness, full arc (deg)
const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
const RAD = Math.PI / 180;

// Needle angle (0 … 270) of a gauge that ignites at frame s and lands on `target` degrees.
const angleAt = (f, s, target) => {
  if (f <= s) return 0;
  if (f <= s + SWEEP) return ARC * cubicOut((f - s) / SWEEP);
  if (f >= s + 46) return target;
  const k = spring(f - (s + SWEEP), { stiffness: STIFF, damping: dampingFor(8 / (ARC - target), STIFF) });
  return ARC + (target - ARC) * k;
};

export default {
  id: 'needle-sweep', kind: 'motion',
  tier: 'T1', family: 'shape', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'fail', 'ok'],
  from: 'a card of idle gauges, needles at zero, no values',
  to: 'every needle settled on its value, the values and names under the dials, the status ready',
  interpolates: ['needle angle 0 → 270° (cubic out, 12 frames) → value (spring, one ~8° overshoot)', 'ticks lit as swept, calming over 24 frames', 'value scale 0.4 → 1 (overshoot), name fade', 'gauges 4 frames apart'],
  summary: 'Gauges self-test: each needle flings round the full arc lighting its ticks, springs back past its value and settles, the gauges a few frames apart; each value pops as its needle lands.',
  theory: 'The ignition self-test of a car dashboard: showing the full scale before the reading tells the viewer how big the number is (a reference before the value); the overshoot is the needle\'s mass (anticipation and follow-through), and a stagger reads as a wave, not a copy.',
  defaults: (ctx = {}) => ({
    gauges: ctx.lang === 'zh'
      ? [{ value: 0.7, name: '队列' }, { value: 0.44, name: '缓存' }, { value: 0.87, name: '存储' }]
      : [{ value: 0.7, name: 'Queue' }, { value: 0.44, name: 'Cache' }, { value: 0.87, name: 'Storage' }],
    title: ctx.lang === 'zh' ? '节点自检' : 'Node check',
    note: ctx.lang === 'zh' ? '示意数据' : 'Illustrative data',
    status: ctx.lang === 'zh' ? ['自检中', '就绪'] : ['Checking', 'Ready'],
    unit: '%', scale: [0, 100], red: 225, start: 12, stagger: 4,
    card: [210, 230, 1500, 640], radius: 148,
  }),
  prepare(P) {
    const n = P.gauges.length, cw = P.card[2] / n;
    const gauges = P.gauges.map((g, i) => ({ ...g, target: clamp(g.value) * ARC, s: P.start + i * P.stagger, cx: P.card[0] + cw * (i + 0.5), cy: P.card[1] + 136 + 220 }));
    return { gauges };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = F0 + p * F;
    const g = D.gauges.map((G) => {
      const d = angleAt(f, G.s, G.target), settle = G.s + 32;
      return {
        d, on: ramp(f, G.s - 4, 10, 'out'), swept: f <= G.s + SWEEP ? d : ARC, calm: ramp(f, G.s + SWEEP, 24, 'smooth'),
        pop: ramp(f, settle, 9, 'overshoot'), popOp: ramp(f, settle, 4, 'out'), name: ramp(f, settle + 3, 10, 'out'),
        ghost: d - angleAt(f - 1, G.s, G.target),
      };
    });
    return { p, f, g, done: ramp(f, 60, 8, 'out') };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, [x, y, w, h] = P.card, R = P.radius;
    ground(ctx, P);
    ctx.save();                                       // the card
    ctx.shadowColor = rgba(mix(c.ground, '#000000', 0.7), 0.35); ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    rrect(ctx, x, y, w, h, 26); ctx.fillStyle = c.panel; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5; ctx.strokeStyle = c.line; ctx.stroke(); ctx.restore();
    const L = P.lang, tf = fontFor(look, 'display', L, 40, 650), sf = fontFor(look, 'text', L, L === 'zh' ? 28 : 25, 500);
    text(ctx, P.title, x + 44, y + 72, tf, { color: c.ink });
    if (P.note) text(ctx, P.note, x + 44, y + 108, sf, { color: c.dim });
    if (P.status) {                                   // the self-test pill: checking (accent) → ready (ok)
      const ready = S.done > 0.5, col = ready ? c.ok : c.accent, s = ready ? P.status[1] : P.status[0];
      const pf = fontFor(look, 'text', L, L === 'zh' ? 28 : 26, 600), tw = measure(ctx, s, pf).width;
      const bw = 58 + tw, bx = x + w - 44 - bw, by = y + 44;
      rrect(ctx, bx, by, bw, 48, 24); ctx.fillStyle = rgba(col, 0.12); ctx.fill(); ctx.strokeStyle = rgba(col, 0.35); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(bx + 24, by + 24, 6, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      text(ctx, s, bx + 40, by + 25, pf, { color: col, baseline: 'middle' });
    }
    ctx.fillStyle = c.line; ctx.fillRect(x + 44, y + 136, w - 88, 1.5);
    const vf = fontFor(look, 'display', L, 64, 700), uf = fontFor(look, 'text', L, 30, 600), nf = fontFor(look, 'text', L, L === 'zh' ? 30 : 26, 600, 'label');
    D.gauges.forEach((G, i) => {
      const s = S.g[i], { cx, cy } = G, pol = (deg, r) => [cx + r * Math.cos((135 + deg) * RAD), cy + r * Math.sin((135 + deg) * RAD)];
      const arc = (d0, d1, r) => { ctx.beginPath(); ctx.arc(cx, cy, r, (135 + d0) * RAD, (135 + Math.max(d0 + 0.01, d1)) * RAD); };
      ctx.save(); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(cx, cy, R + 20, 0, Math.PI * 2); ctx.fillStyle = rgba(c.ink, 0.03 + 0.03 * s.on); ctx.fill();
      ctx.strokeStyle = rgba(c.ink, 0.05 + 0.05 * s.on); ctx.lineWidth = 1; ctx.stroke();
      arc(0, ARC, R); ctx.strokeStyle = rgba(c.ink, 0.08); ctx.lineWidth = 8; ctx.stroke();
      arc(P.red, ARC, R); ctx.strokeStyle = rgba(c.fail, 0.3 + 0.25 * s.on); ctx.stroke();
      if (s.d > 0.5) {                                 // the arc that follows the needle: a soft layer, then the line
        arc(0, s.d, R); ctx.strokeStyle = rgba(c.accent, 0.3); ctx.lineWidth = 18; ctx.stroke();
        arc(0, s.d, R); ctx.strokeStyle = c.accent; ctx.lineWidth = 8; ctx.stroke();
      }
      for (let k = 0; k <= 30; k++) {                  // ticks, every third major and numbered; lit as the needle sweeps
        const dd = k * 9, major = k % 3 === 0, red = dd >= P.red, lit = s.swept >= dd - 0.5 ? 1 - s.calm : 0;
        const [x0, y0] = pol(dd, R - 10), [x1, y1] = pol(dd, major ? R - 30 : R - 20), tone = red ? c.fail : c.ink;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = major ? 3 : 1.6;
        ctx.strokeStyle = rgba(tone, (red ? 0.45 : 0.22) + (red ? 0.45 : 0.6) * lit); ctx.stroke();
        if (k % 6 === 0) {                             // numbers every other major tick, at the information floor
          const [lx, ly] = pol(dd, R - 58), v = P.scale[0] + ((P.scale[1] - P.scale[0]) * k) / 30;
          figures(ctx, String(Math.round(v)), lx, ly, fontFor(look, 'mono', L, infoSize(L), 500), { color: tone, align: 'center', baseline: 'middle', alpha: red ? 0.75 : 0.4 + 0.4 * lit });
        }
      }
      const needle = (deg, alpha) => {               // a tapered needle from behind the hub to the tick ring
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((135 + deg) * RAD); ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.moveTo(-34, -5); ctx.lineTo(R - 13, -1.6); ctx.quadraticCurveTo(R - 9.5, 0, R - 13, 1.6); ctx.lineTo(-34, 5); ctx.closePath();
        ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
      };
      if (Math.abs(s.ghost) > 4) for (let gh = 1; gh <= 4; gh++) needle(s.d - (s.ghost * gh) / 4, 0.16 * (1 - gh / 5));
      needle(s.d, 1);
      ctx.beginPath(); ctx.arc(cx, cy, 19, 0, Math.PI * 2); ctx.fillStyle = mix(c.panel, c.ink, 0.7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill();
      ctx.restore();
      if (s.popOp > 0) {                               // the value pops from its centre as the needle lands
        const v = P.scale[0] + (P.scale[1] - P.scale[0]) * clamp(G.value), sc = 0.4 + 0.6 * s.pop;
        ctx.save(); ctx.globalAlpha = s.popOp; ctx.translate(cx, cy + 180); ctx.scale(sc, sc);
        const vw = figures(ctx, String(Math.round(v)), -12, 0, vf, { color: c.ink, align: 'center', baseline: 'middle' });
        if (P.unit) text(ctx, P.unit, -12 + vw / 2 + 6, 6, uf, { color: c.dim, baseline: 'middle' });
        ctx.restore();
      }
      if (s.name > 0) text(ctx, G.name, cx, cy + 254 + 6 * (1 - s.name), nf, { color: c.dim, align: 'center', baseline: 'middle', alpha: s.name });
    });
  },
  // needle tips, one per gauge (compare pairs them with the upstream needles)
  track(S, P, D) { return D.gauges.map((G, i) => { const a = (135 + S.g[i].d) * RAD; return [G.cx + (P.radius - 13) * Math.cos(a), G.cy + (P.radius - 13) * Math.sin(a)]; }); },
};

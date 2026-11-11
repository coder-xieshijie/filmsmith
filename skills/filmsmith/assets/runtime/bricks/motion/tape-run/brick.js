// tape-run — the world moves, the pointer does not: a tall scale tape scrolls behind a fixed reading window; it crawls up
// to the old cap and stops under it, the cap line breaks, the tape winds back a little, sprints and brakes on a spring
// past the new value and back, the new cap's marker parking in the pointer; the reading in the window follows the tape.
// Adapted from video-shotcraft demos/data/gauge-readout-moves/TapeScrollFixedPointer.tsx (card
// references/shots/data/gauge-readout-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React or Remotion); colours by role (window, pointer and new-cap marker in
// the accent, the old cap in dim); brand, eyebrow and headline copy removed (title, claim and units are the film's
// slots; the claim and the recap are computed from the values); the values are parameters (start, cap, end) and every
// stop is derived from them; the readout is drawn in fixed digit cells; the motion blur is the runtime's sub-frames
// from the tape's speed; the slow push of the hold is the style's; the conclusion lands inside the move (by frame 113).
import { clamp, lerp, rgba, rrect, text, measure, ground } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { figures, spring, dampingFor } from '../digit-roll/brick.js';

const F0 = 8, F = 105;                                  // upstream frames 8–113 map to p 0 → 1
const SPRINT = bez(0.55, 0, 0.25, 1), STIFF = 140;
const CY = 540, TAPE_X = 1000, TAPE_W = 520, TICK_R = TAPE_X + TAPE_W - 40, NUM_R = TAPE_X + 310;
const WIN = { x: TAPE_X - 30, w: 400, h: 150 };

const fmt = (n) => (Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(1));

export default {
  id: 'tape-run', kind: 'motion',
  tier: 'T2', family: 'vertical', beats: 7,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent', 'onAccent'],
  from: 'the tape resting at the start value under the window, the old cap above it',
  to: 'the tape stopped on the new value, the new cap marker in the pointer, the claim and the recap beside it',
  interpolates: ['value: start → under the cap (swift) → hold → wind back 5 → sprint (0.55, 0, 0.25, 1, 22 frames) → spring through an overshoot to the end', 'old cap line splits and fades', 'claim and recap fade in'],
  summary: 'The world moves, the pointer does not: a scale tape crawls up to the old cap, the cap breaks, the tape sprints and brakes on a spring onto the new value under a fixed reading window.',
  theory: 'The airspeed tape of a flight display: a fixed pointer over a moving scale turns the size of a change into distance travelled, so a big jump is felt as speed; the overshoot and swing back are a mechanical stop (follow-through), and stillness after speed holds attention (Abrams & Christ 2003).',
  defaults: (ctx = {}) => ({
    start: 60, cap: 140, end: 420, unit: 'k', overshoot: 24, swing: 4, pxPerUnit: 5, tick: 10, major: 50,
    title: ctx.lang === 'zh' ? '每周渲染量' : 'Weekly renders',
    note: ctx.lang === 'zh' ? '示意数据' : 'Illustrative data',
    capLabels: ctx.lang === 'zh' ? ['原上限', '新上限'] : ['Previous cap', 'New cap'],
    claim: null, recap: true,
  }),
  prepare(P) {
    const hold = P.cap - 18, back = hold - 5, peak = P.end + P.overshoot;
    return { hold, back, peak, damp: dampingFor(P.swing / P.overshoot, STIFF) };
  },
  value(f, P, D) {
    if (f <= 10) return P.start;
    if (f <= 48) return lerp(P.start, D.hold, ramp(f, 10, 38, 'swift'));
    if (f <= 56) return D.hold;
    if (f <= 61) return lerp(D.hold, D.back, ramp(f, 56, 5, 'smooth'));
    if (f <= 83) return lerp(D.back, D.peak, SPRINT(clamp((f - 61) / 22)));
    if (f >= 110) return P.end;
    return lerp(D.peak, P.end, spring(f - 83, { stiffness: STIFF, damping: D.damp }));
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = F0 + p * F;
    return { p, f, v: this.value(f, P, D), brk: ramp(f, 52, 14, 'out'), locked: ramp(f, 104, 9, 'out'), claim: ramp(f, 96, 12, 'snappy'), recap: ramp(f, 102, 11, 'out') };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, L = P.lang, u = P.pxPerUnit, yOf = (val) => CY + (S.v - val) * u;
    ground(ctx, P);
    // the tape: a band the full height of the frame, fading out at the top and bottom
    ctx.save();
    const band = ctx.createLinearGradient(TAPE_X, 0, TAPE_X + TAPE_W, 0);
    band.addColorStop(0, rgba(c.panel, 0.35)); band.addColorStop(0.6, rgba(c.panel, 0.85)); band.addColorStop(1, rgba(c.panel, 0.6));
    ctx.fillStyle = band; ctx.fillRect(TAPE_X, 0, TAPE_W, 1080);
    ctx.fillStyle = c.line; ctx.fillRect(TAPE_X, 0, 1, 1080); ctx.fillRect(TAPE_X + TAPE_W - 1, 0, 1, 1080);
    const nf = fontFor(look, 'display', L, 64, 600, 'display');
    for (let val = Math.max(0, Math.floor((S.v - 130) / P.tick) * P.tick); val <= S.v + 130; val += P.tick) {
      const y = yOf(val), major = val % P.major === 0;
      ctx.fillStyle = major ? c.ink : rgba(c.ink, 0.32);
      rrect(ctx, TICK_R - (major ? 150 : 70), y - (major ? 2 : 1), major ? 150 : 70, major ? 4 : 2, 2); ctx.fill();
      if (major) {                                  // the numbers fade before they slide behind the window
        const near = clamp((Math.abs(y - CY) - WIN.h / 2 - 36) / 30);
        if (near > 0) figures(ctx, String(val), NUM_R, y + 22, nf, { color: rgba(c.ink, 0.82), align: 'right', alpha: near });
      }
    }
    const lf = fontFor(look, 'text', L, L === 'zh' ? 32 : 30, 650, 'label');
    if (S.brk < 1) {                                // the old cap: a dashed line that splits and fades
      const y = yOf(P.cap), a = 1 - S.brk;
      ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeStyle = c.dim;
      ctx.beginPath(); ctx.moveTo(TAPE_X - 10 - S.brk * 80, y); ctx.lineTo(TAPE_X + TAPE_W / 2 - S.brk * 80, y);
      ctx.moveTo(TAPE_X + TAPE_W / 2 + S.brk * 80, y); ctx.lineTo(TAPE_X + TAPE_W - 16 + S.brk * 80, y); ctx.stroke(); ctx.restore();
      text(ctx, P.capLabels[0], TAPE_X + TAPE_W + 28, y + 11, lf, { color: c.dim, alpha: a });
    }
    { const y = yOf(P.end);                           // the new cap: an accent marker on the tape's edge
      if (y > -60 && y < 1140) {
        ctx.beginPath(); ctx.moveTo(TICK_R + 10, y); ctx.lineTo(TICK_R + 46, y - 22); ctx.lineTo(TICK_R + 46, y + 22); ctx.closePath();
        ctx.fillStyle = c.accent; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = c.accent; ctx.fill(); ctx.stroke();
        text(ctx, P.capLabels[1], TAPE_X + TAPE_W + 64, y + 11, lf, { color: c.accent, alpha: 0.55 + 0.45 * S.locked });
      } }
    const fade = (y0, y1, from) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(c.ground, from)); g.addColorStop(1, rgba(c.ground, 1 - from)); ctx.fillStyle = g; ctx.fillRect(TAPE_X - 60, y0, TAPE_W + 460, y1 - y0); };
    fade(0, 260, 1); fade(820, 1080, 0);
    ctx.restore();
    // the fixed layer: the reading window and the pointer
    ctx.save();
    ctx.shadowColor = rgba(c.accent, 0.3); ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    rrect(ctx, WIN.x, CY - WIN.h / 2, WIN.w, WIN.h, 26); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    const vf = fontFor(look, 'display', L, 128, 700, 'display'), uf = fontFor(look, 'display', L, 48, 600);
    const uw = measure(ctx, P.unit, uf).width, base = CY + 46;
    text(ctx, P.unit, WIN.x + WIN.w - 48 - uw, base, uf, { color: rgba(c.onAccent, 0.75) });
    figures(ctx, String(Math.round(S.v)), WIN.x + WIN.w - 48 - uw - 10, base, vf, { color: c.onAccent, align: 'right' });
    ctx.fillStyle = c.accent; rrect(ctx, WIN.x + WIN.w - 2, CY - 2, TICK_R - (WIN.x + WIN.w) + 2, 4, 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(WIN.x + WIN.w - 4, CY - 18); ctx.lineTo(WIN.x + WIN.w + 24, CY); ctx.lineTo(WIN.x + WIN.w - 4, CY + 18); ctx.closePath(); ctx.fill();
    // the left column: label, title, then the claim and the recap computed from the values
    const tx = 150, ef = fontFor(look, 'mono', L, infoSize(L), 600, 'label');
    if (P.note) text(ctx, P.note, tx, 330, ef, { color: c.dim });
    const hf = fontFor(look, 'display', L, 112, 750, 'display');
    text(ctx, P.title, tx - 4, 460, hf, { color: c.ink });
    const claim = P.claim ?? `×${fmt(P.end / P.cap)}`;
    if (S.claim > 0) text(ctx, claim, tx - 4, 600 + 30 * (1 - S.claim), hf, { color: c.accent, alpha: S.claim });
    if (P.recap && S.recap > 0) {
      const rf = fontFor(look, 'mono', L, 36, 500);
      figures(ctx, `${P.cap}${P.unit} → ${P.end}${P.unit}`, tx + 16 * (S.recap - 1), 690, rf, { color: c.dim, alpha: S.recap });
    }
  },
  blur(p) { const f = F0 + p * F; return f > 58 && f < 100; },
  // the tape's offset (px), whose speed is the tape's (motion blur); the same through the rounded reading (compare
  // pairs it with the upstream reading); the new cap marker on screen
  track(S, P) { return [[0, S.v * P.pxPerUnit], [0, Math.round(S.v) * P.pxPerUnit], [TICK_R + 28, CY + (S.v - P.end) * P.pxPerUnit]]; },
};

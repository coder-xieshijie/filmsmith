// token-chip — one unit of a run as an object: a rounded box with its label in the mono, whose outline wears one of
// four meanings (base untouched, active = the accent, learned, unseen), filled at 8–12 % of its outline colour; it
// swells ≤ 3.5 % once when it lands. The label is code and stays Latin in every language.
// From the trace template (assets/templates/trace/pieces.js drawChip; chips 82 × scale tall, 12 × scale radius).
import { mix, rgba, text } from '../../../handoffs/util.js';
import { kinds, monoF } from '../../motion/pair-fuse/board.js';

export default {
  id: 'token-chip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [180, 60], M: [300, 100], L: [480, 160] },
  states: { base: { active: 0, learned: 0, unseen: 0, swell: 0 }, active: { active: 1, learned: 0, unseen: 0, swell: 0 }, learned: { active: 0, learned: 1, unseen: 0, swell: 1 }, unseen: { active: 0, learned: 0, unseen: 1, swell: 0 } },
  parts: ['box', 'label'],
  swap: { label: { type: 'code' } },
  roles: ['ground', 'ink', 'accent', 'base', 'learned', 'unseen'],
  defaults: () => ({ label: 'load', ground: true }),
  draw(ctx, st, P) {
    const C = P.colors, K = kinds(C);
    if (P.ground !== false) { ctx.fillStyle = C.ground; ctx.fillRect(-P.w, -P.h * 2, P.w * 3, P.h * 5); }
    const col = mix(mix(mix(K.base, K.unseen, st.unseen), K.learned, st.learned), K.active, st.active), z = 1 + 0.035 * Math.sin(Math.PI * st.swell);
    ctx.save(); ctx.translate(P.w / 2, P.h / 2); ctx.scale(z, z); ctx.translate(-P.w / 2, -P.h / 2);
    ctx.beginPath(); ctx.roundRect(0, 0, P.w, P.h, P.h * 0.15); ctx.fillStyle = rgba(col, 0.08 + 0.04 * st.active); ctx.fill();
    ctx.lineWidth = Math.max(1.5, P.h * 0.03); ctx.strokeStyle = col; ctx.stroke();
    text(ctx, P.label, P.w / 2, P.h / 2 + P.h * 0.23, monoF(P.h * 0.66), { color: C.ink, align: 'center' });
    ctx.restore();
  },
};

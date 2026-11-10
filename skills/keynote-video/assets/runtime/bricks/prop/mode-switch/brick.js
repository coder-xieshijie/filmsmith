// mode-switch — a two-way control whose moving part is the story: a segmented control (two labelled segments, a
// raised thumb that stretches as it slides, the old segment's icon folding away and the new one's popping in) or a
// toggle switch (a knob sliding along a track whose sun becomes a crescent).
// Adapted from video-shotcraft demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx (card
// references/shots/interaction/segmented-thumb-hero.md) and demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx
// (card references/shots/interaction/theme-switch-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React, SVG or Remotion); colours by role (the recessed track from ink on
// the ground, the thumb in the panel colour, labels ink and dim, the new icon's face and the switch's on track in the
// accent); the segment names and their icons (a speech bubble and a clapperboard with a face) replaced by the film's
// labels and neutral glyphs; the thumb's lead-and-trail stretch derived from the one `on` value.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

const F = (P, size, weight = 650) => fontFor(P.look || NEUTRAL, 'display', P.lang, size, weight, 'display');

// Neutral segment glyphs in a s × s box: 'lines' (a page of two lines in a bubble) and 'spark' (a four-point star
// with a ring, the new mode's "reward").
const glyph = (ctx, kind, x, y, s, ink, accent) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 40, s / 40); ctx.lineWidth = 2.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
  if (kind === 'lines') {
    ctx.beginPath(); ctx.moveTo(9, 8.5); ctx.lineTo(31, 8.5); ctx.arcTo(34.5, 8.5, 34.5, 12, 3.5); ctx.lineTo(34.5, 24); ctx.arcTo(34.5, 27.5, 31, 27.5, 3.5); ctx.lineTo(19, 27.5); ctx.lineTo(12, 33); ctx.lineTo(12, 27.5); ctx.lineTo(9, 27.5); ctx.arcTo(5.5, 27.5, 5.5, 24, 3.5); ctx.lineTo(5.5, 12); ctx.arcTo(5.5, 8.5, 9, 8.5, 3.5); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 15); ctx.lineTo(28, 15); ctx.moveTo(12, 21); ctx.lineTo(22, 21); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(20, 21, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = accent; ctx.beginPath();
    for (let k = 0; k < 8; k++) { const r = k % 2 ? 3.2 : 9, a = (k * Math.PI) / 4 - Math.PI / 2; ctx.lineTo(20 + Math.cos(a) * r, 21 + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
};
// Sun (p 0) → crescent (p 1) in a s × s box: the rays draw in and the disc is bitten by a moving circle.
const sunMoon = (ctx, x, y, s, p, color, bg) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 40, s / 40);
  const rays = 1 - Math.min(1, p * 1.6);
  ctx.save(); ctx.translate(20, 20); ctx.rotate((p * Math.PI) / 2); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.globalAlpha *= rays;
  for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, -(15.5 + (1 - rays) * 4)); ctx.lineTo(0, -(11.5 + (1 - rays) * 6)); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(20, 20, lerp(7.5, 11, p), 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(lerp(44, 27, p), lerp(-4, 13, p), 10.5, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
  ctx.restore();
};

// Draw a segmented control in [x, y, w, h]. st: { on 0 → 1 (the thumb's progress, eased), pop (the new icon's scale,
// may overshoot) }.
export const drawSegmented = (ctx, x, y, w, h, st, P, { left, right } = {}) => {
  const c = P.colors, pad = Math.round(h * 0.073), segw = (w - pad * 2) / 2, th = h - pad * 2, on = clamp(st.on || 0);
  const lead = 1 - Math.pow(1 - on, 4 / 3), trail = 1 - Math.pow(1 - on, 2 / 3);
  ctx.save();
  ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.2); ctx.shadowBlur = 44; ctx.shadowOffsetY = 14;
  rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = mix(c.ground, c.ink, 0.08); ctx.fill(); ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, h / 2); ctx.clip();
  ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.1); ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;      // the recess
  ctx.lineWidth = 8; rrect(ctx, x - 4, y - 4, w + 8, h + 8, h / 2 + 4); ctx.strokeStyle = mix(c.ground, c.ink, 0.12); ctx.stroke();
  ctx.restore();
  rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.lineWidth = 1; ctx.strokeStyle = rgba(c.ink, 0.09); ctx.stroke();
  const tl = x + pad + trail * segw, tr = x + pad + segw + lead * segw;                                  // the thumb
  ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.2); ctx.shadowBlur = 28; ctx.shadowOffsetY = 12;
  rrect(ctx, tl, y + pad, tr - tl, th, th / 2); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
  ctx.save(); rrect(ctx, tl, y + pad, tr - tl, th, th / 2); ctx.clip(); ctx.fillStyle = rgba('#ffffff', 0.9); ctx.fillRect(tl, y + pad, tr - tl, 1.5); ctx.restore();
  const amt = clamp((on - 0.2) / 0.6), size = Math.round(h * 0.33), f = F(P, size), icon = Math.round(h * 0.355), gap = Math.round(h * 0.1);
  const seg = (label, cx, active, iconScale, kind) => {
    const tw = measure(ctx, label, f).width, iw = iconScale < 0.05 ? 0 : icon, total = iw + (iw ? gap : 0) + tw;
    let lx = cx - total / 2;
    if (iw) { ctx.save(); ctx.translate(lx + icon / 2, y + h / 2); ctx.scale(iconScale, iconScale); glyph(ctx, kind, -icon / 2, -icon / 2, icon, c.ink, c.accent); ctx.restore(); lx += iw + gap; }
    text(ctx, label, lx, y + h / 2 + 1, f, { color: mix(c.dim, c.ink, active), baseline: 'middle' });
  };
  const oldIcon = 1 - Math.pow(clamp(on / 0.55), 3);
  seg(left, x + pad + segw / 2, 1 - amt, oldIcon, 'lines');
  seg(right, x + pad + segw * 1.5, amt, Math.max(0, st.pop ?? on), 'spark');
  ctx.restore();
};

// Draw a toggle switch in [x, y, w, h] (w ≈ 2h). st: { on 0 → 1 (knob position; may overshoot on a spring) }.
export const drawToggle = (ctx, x, y, w, h, st, P) => {
  const c = P.colors, on = st.on || 0, k = clamp(on), pad = h * 0.09, d = h - pad * 2;
  ctx.save();
  rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = mix(mix(c.ground, c.ink, 0.12), c.accent, k); ctx.fill();
  rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.lineWidth = 1; ctx.strokeStyle = rgba(c.ink, 0.12); ctx.stroke();
  const kx = x + pad + on * (w - pad * 2 - d);
  ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.28); ctx.shadowBlur = h * 0.18; ctx.shadowOffsetY = h * 0.05;
  ctx.beginPath(); ctx.arc(kx + d / 2, y + h / 2, d / 2, 0, Math.PI * 2); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
  sunMoon(ctx, kx + d * 0.18, y + pad + d * 0.18, d * 0.64, k, mix(c.dim, c.accent, k), c.panel);
  ctx.restore();
};

const STATES = { first: { on: 0, pop: 0 }, second: { on: 1, pop: 1 } };

export default {
  id: 'mode-switch', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [600, 122], M: [1080, 220], L: [1400, 285] },
  states: STATES,
  parts: ['track', 'thumb', 'labels', 'icons', 'knob'],
  swap: {
    left: { type: 'text', tier: 'word', sample: 'steps', limits: { en: { words: 1, chars: 9 }, zh: { chars: 3 } } },
    right: { type: 'text', tier: 'word', sample: 'steps', limits: { en: { words: 1, chars: 9 }, zh: { chars: 3 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'accent'],
  summary: 'A two-way control: a segmented control whose stretching thumb slides and swaps the icons, or a toggle whose sun turns to a crescent.',
  defaults: (ctx = {}) => ({ form: 'segmented', left: copy('steps', ctx.lang)[1], right: copy('steps', ctx.lang)[3], backdrop: true }),
  draw(ctx, S, P) {
    if (P.backdrop) { ctx.save(); ctx.fillStyle = P.colors.ground; ctx.fillRect(-(960 - P.w / 2), -(540 - P.h / 2), 1920, 1080); ctx.restore(); }
    if (P.form === 'toggle') { const h = P.h * 0.6, w = h * 2; drawToggle(ctx, (P.w - w) / 2, (P.h - h) / 2, w, h, S, P); }
    else drawSegmented(ctx, 0, 0, P.w, P.h, S, P, { left: P.left, right: P.right });
  },
};

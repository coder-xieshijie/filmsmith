// picker-snap — a vertical picker: the focus pill stays still and the list moves through it, one item a step, each
// step a strong ease-out snap followed by a true still; distance from the focus sets opacity, size and grey, only the
// focused row shows its icon, and the pill breathes once when an item lands.
// Adapted from video-shotcraft demos/interaction/picker-carousel-feature-cycle/PickerCarouselFeatureCycle.tsx (card
// references/shots/interaction/picker-carousel-feature-cycle.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); the 480 × 270 design is drawn at film size (× 4);
// colours by role (pill panel and line, focused row ink, neighbours dim, the icon in the accent); the feature names,
// their icons and the app mark replaced by the film's items (neutral glyphs by default, an optional neutral badge);
// the fade at the viewport's edges is an alpha mask; the list is drawn sharp (the upstream's speed blur is under 1 px).
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { copy, look } from '../../sample.js';

const K = 4, ROW = 34 * K, VW = 300 * K, VH = ROW * 5, STEP_F = 19.26, HOLD = 5 / 14;
const quintOut = (u) => 1 - Math.pow(1 - clamp(u), 5);
const lerpN = (u, a, b) => a + (b - a) * u;

// Neutral glyph i in a s × s box at (x, y): card, frame, lens, bars, wave, sliders, play (line icons, 1.5 / 16 stroke).
const glyph = (ctx, i, x, y, s, color) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 16, s / 16);
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  switch (i % 7) {
    case 0: rrect(ctx, 3, 2.5, 10, 11, 1); ctx.moveTo(5.75, 6); ctx.lineTo(10.25, 6); ctx.moveTo(5.75, 8.5); ctx.lineTo(10.25, 8.5); break;
    case 1: ctx.moveTo(2.5, 5.5); ctx.lineTo(2.5, 2.5); ctx.lineTo(5.5, 2.5); ctx.moveTo(10.5, 2.5); ctx.lineTo(13.5, 2.5); ctx.lineTo(13.5, 5.5); ctx.moveTo(13.5, 10.5); ctx.lineTo(13.5, 13.5); ctx.lineTo(10.5, 13.5); ctx.moveTo(5.5, 13.5); ctx.lineTo(2.5, 13.5); ctx.lineTo(2.5, 10.5); break;
    case 2: ctx.arc(7, 8, 4.5, 0, Math.PI * 2); ctx.moveTo(10.5, 11.5); ctx.lineTo(13.5, 14); break;
    case 3: for (const [xx, a, b] of [[3, 7, 9], [5.5, 4.5, 11.5], [8, 2.5, 13.5], [10.5, 5.5, 10.5], [13, 7, 9]]) { ctx.moveTo(xx, a); ctx.lineTo(xx, b); } break;
    case 4: ctx.moveTo(2, 8); for (let k = 0; k <= 12; k++) ctx.lineTo(2 + k, 8 + Math.sin(k * 0.9) * 3.5); break;
    case 5: ctx.moveTo(2.5, 4.5); ctx.lineTo(13.5, 4.5); ctx.moveTo(2.5, 11.5); ctx.lineTo(13.5, 11.5); ctx.moveTo(5.5, 2.5); ctx.lineTo(5.5, 6.5); ctx.moveTo(10.5, 9.5); ctx.lineTo(10.5, 13.5); break;
    default: rrect(ctx, 2.5, 3, 11, 10, 1); ctx.moveTo(6.75, 6); ctx.lineTo(6.75, 10); ctx.lineTo(10, 8); ctx.closePath();
  }
  ctx.stroke(); ctx.restore();
};

const stepsOf = (P) => Math.max(1, Math.min(P.steps ?? 5, P.items.length - 1 - (P.startAt || 0)));
// position (in items) of the list at frame f: a strong ease-out over the first 9/14 of each step, then still
export const pickerPos = (f, P) => {
  const n = stepsOf(P), g = clamp(f / (n * STEP_F)) * n, step = Math.min(n - 1, Math.floor(g)), local = Math.min(1, g - step);
  return { pos: (P.startAt || 0) + step + quintOut(Math.min(1, local / (1 - HOLD))), land: Math.max(0, (local - (1 - HOLD)) / HOLD) };
};

export default {
  id: 'picker-snap', kind: 'motion',
  tier: 'T0', family: 'vertical', beats: 6.42,
  beatsFor: (P) => (stepsOf(P) * STEP_F) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  from: 'a picker with one item in the focus pill',
  to: 'the same picker, `steps` items further on',
  interpolates: ['list offset: each step quint-out over 9/14 of the step, still for 5/14', 'per row: opacity 1 → 0.55 → 0.18, size 68 → 56 px, ink → dim → faint by distance from the focus', 'pill scale y 1 → 1.06 → 1 after each landing'],
  summary: 'A vertical picker: the focus pill stays still, the list snaps through it one item a step and holds still each time.',
  theory: 'A fixed frame with moving content is the slot-machine and drum-picker convention: the stop, not the scroll, says "this one" (the still is the beat, the original\'s hold); depth by distance keeps the eye on the centre (Ware, Information Visualization, on preattentive size and lightness).',
  sceneRest: false,
  defaults: (ctx = {}) => ({ items: copy('cards', ctx.lang).map((c) => c.title), steps: 5, startAt: 0, cx: 960, cy: 540, badge: true }),
  prepare(P) {
    const cv = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(VW, VH);
    cv.width = VW; cv.height = VH + 2 * ROW;
    return { layer: cv, g: cv.getContext('2d', { willReadFrequently: true }) };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P) { const { pos, land } = pickerPos(p * stepsOf(P) * STEP_F, P); return { p, pos, land, breath: land > 0 ? Math.sin(Math.min(1, land / 0.6) * Math.PI) * 0.06 : 0 }; },
  paint(ctx, S, P, D) {
    const c = P.colors, x0 = P.cx - VW / 2, y0 = P.cy - VH / 2, faint = mix(c.dim, c.ground, 0.45);
    ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080);
    const lg = ctx.createRadialGradient(P.cx, P.cy, 0, P.cx, P.cy, 760);           // the soft pool under the pill
    lg.addColorStop(0, rgba(c.panel, 0.9)); lg.addColorStop(0.7, rgba(c.panel, 0));
    ctx.save(); ctx.translate(0, P.cy); ctx.scale(1, 0.21); ctx.translate(0, -P.cy); ctx.fillStyle = lg; ctx.fillRect(P.cx - 760, P.cy - 760, 1520, 1520); ctx.restore();
    if (P.badge) {                                                                   // a neutral app badge left of the picker
      const bx = P.cx - 744, by = P.cy - 48;
      ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.25); ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
      rrect(ctx, bx, by, 96, 96, 24); ctx.fillStyle = c.ink; ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(bx + 48, by + 48); ctx.fillStyle = c.panel; ctx.beginPath();
      for (let k = 0; k < 8; k++) { const r = k % 2 ? 9 : 26, a = (k * Math.PI) / 4 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // the pill: fixed, scale y about its centre only
    const py = y0 + ROW * 2;
    ctx.save(); ctx.translate(0, py + ROW / 2); ctx.scale(1, 1 + S.breath); ctx.translate(0, -(py + ROW / 2));
    ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.12); ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    rrect(ctx, x0, py, VW, ROW, ROW / 2); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
    rrect(ctx, x0 + 2, py + 2, VW - 4, ROW - 4, ROW / 2 - 2); ctx.lineWidth = 4; ctx.strokeStyle = c.line; ctx.stroke();
    ctx.restore();
    // the list on its own layer, masked to fade at the viewport's top and bottom 26 %
    const g = D.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, VW, VH + 2 * ROW);
    P.items.forEach((s, i) => {
      const d = Math.abs(i - S.pos), k2 = Math.min(2, d), y = ROW * (2 + i - S.pos) + ROW / 2 + ROW;
      if (y < -ROW || y > VH + 3 * ROW) return;
      const o = k2 <= 1 ? lerpN(k2, 1, 0.55) : lerpN(k2 - 1, 0.55, 0.18);
      const size = lerpN(Math.min(1, d / 2), 17, 14) * K, col = d < 0.5 ? c.ink : d < 1.5 ? c.dim : faint;
      const f = fontFor(P.look || look, 'text', P.lang, size, 600);
      const tw = measure(g, s, f).width, iconA = Math.max(0, 1 - d * 1.6), gap = 8 * K, iw = 13 * K, total = iw + gap + tw;
      g.save(); g.globalAlpha = o;
      if (iconA > 0) { g.globalAlpha = o * iconA; glyph(g, i, VW / 2 - total / 2, y - iw / 2, iw, c.accent); g.globalAlpha = o; }
      text(g, s, VW / 2 - total / 2 + iw + gap, y, f, { color: col, baseline: 'middle' });
      g.restore();
    });
    g.globalCompositeOperation = 'destination-in';
    const m = g.createLinearGradient(0, ROW, 0, ROW + VH);
    m.addColorStop(0, rgba('#000000', 0)); m.addColorStop(0.26, rgba('#000000', 1)); m.addColorStop(0.74, rgba('#000000', 1)); m.addColorStop(1, rgba('#000000', 0));
    g.fillStyle = m; g.fillRect(0, 0, VW, VH + 2 * ROW);
    g.globalCompositeOperation = 'source-over';
    ctx.drawImage(D.layer, 0, ROW, VW, VH, x0, y0, VW, VH);
  },
  blur() { return false; },
  track(S, P) { return [[P.cx, P.cy - VH / 2 + ROW * (2 - S.pos) + ROW / 2]]; },
};

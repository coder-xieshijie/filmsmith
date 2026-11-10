// choice-chip — one option of a set, as a pill: at rest, pressed (a one-frame grey flash), selected (filled with ink,
// the label turned to the panel colour, a tick growing from no width, a light 1 → 1.04 → 1 bounce), or faded to 18 %
// in place when another is chosen.
// Adapted from video-shotcraft demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout.tsx
// (card references/shots/interaction/chip-grid-single-select-blackout.md) and
// demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx (card
// references/shots/interaction/hashtag-to-pill-materialize.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React or Remotion); colours by role (selected = ink fill with panel text,
// the press flash from dim, the landing light in the accent); widths measured from the film's label in either
// language (the upstream's width table is gone); option names and prices are the film's.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

const F = (P, size, weight = 560) => fontFor(P.look || NEUTRAL, 'text', P.lang, size, weight);

// Width of a chip for a label at height h (padding h × 0.5 each side, room for the tick when it can be selected).
export const chipWidth = (ctx, label, h, P, tick = true) => measure(ctx, label, F(P, Math.round(h * 0.375))).width + h + (tick ? h * 0.42 : 0);

// Draw a chip in [x, y, w, h]. st: { sel 0 → 1 (fill and text cross over), press (the grey flash), fade (to 18 %),
// bounce (scale 1 + 0.04 × bounce), light (the landing light under it, 0 → 1) }.
export const drawChip = (ctx, x, y, w, h, label, st, P) => {
  const c = P.colors, sel = clamp(st.sel || 0), fade = clamp(st.fade || 0), s = 1 + 0.04 * (st.bounce || 0);
  ctx.save();
  ctx.globalAlpha *= 1 - 0.82 * fade;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-w / 2, -h / 2);
  if ((st.light || 0) > 0.001) {                                          // the protagonist's light on the floor
    const g = ctx.createRadialGradient(w / 2, h + 6, 0, w / 2, h + 6, w * 0.7);
    g.addColorStop(0, rgba(c.accent, 0.16 * st.light)); g.addColorStop(1, rgba(c.accent, 0));
    ctx.save(); ctx.translate(0, h + 6); ctx.scale(1, 0.3); ctx.translate(0, -(h + 6)); ctx.fillStyle = g; ctx.fillRect(-w * 0.3, h - w * 0.7, w * 1.6, w * 1.4); ctx.restore();
  }
  const fill = mix(c.panel, c.ink, sel), edge = mix(c.line, c.ink, sel);
  ctx.save(); ctx.shadowColor = rgba(mix(c.ink, '#000000', 0.6), 0.06 + 0.16 * sel); ctx.shadowBlur = 6 + 22 * sel; ctx.shadowOffsetY = 2 + 8 * sel;
  rrect(ctx, 0, 0, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  rrect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, h / 2 - 0.75); ctx.lineWidth = 1.5; ctx.strokeStyle = edge; ctx.stroke();
  if ((st.press || 0) > 0.001) { rrect(ctx, 0, 0, w, h, h / 2); ctx.fillStyle = rgba(c.dim, 0.5 * st.press); ctx.fill(); }
  const f = F(P, Math.round(h * 0.375)), tw = measure(ctx, label, f).width, tick = sel * h * 0.42;
  const tx = (w - tw - tick) / 2;
  text(ctx, label, tx, h / 2 + 1, f, { color: mix(c.ink, c.panel, sel), baseline: 'middle' });
  if (tick > 0.5) {                                                       // the tick grows from no width at the label's end
    ctx.save(); ctx.beginPath(); ctx.rect(tx + tw + h * 0.12, 0, tick, h); ctx.clip();
    ctx.strokeStyle = c.panel; ctx.lineWidth = h * 0.045; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const bx = tx + tw + h * 0.16, by = h / 2;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + h * 0.09, by + h * 0.09); ctx.lineTo(bx + h * 0.25, by - h * 0.1); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
};

const STATES = {
  rest: { sel: 0, press: 0, fade: 0, bounce: 0, light: 0 },
  pressed: { sel: 0, press: 1, fade: 0, bounce: 0, light: 0 },
  selected: { sel: 1, press: 0, fade: 0, bounce: 0, light: 1 },
  faded: { sel: 0, press: 0, fade: 1, bounce: 0, light: 0 },
};

export default {
  id: 'choice-chip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [300, 72], M: [400, 96], L: [520, 128] },
  states: STATES,
  parts: ['pill', 'label', 'tick', 'flash', 'light'],
  swap: { label: { type: 'text', tier: 'glance', sample: 'detailTitle', limits: { en: { words: 3, chars: 18 }, zh: { chars: 7 } } } },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent'],
  summary: 'One option as a pill: rest, a one-frame press flash, selected (ink fill, tick, light bounce), or faded to 18 % in place.',
  defaults: (ctx = {}) => ({ label: copy('cards', ctx.lang)[4].title, backdrop: true }),
  draw(ctx, S, P) {
    if (P.backdrop) { ctx.save(); ctx.fillStyle = P.colors.ground; ctx.fillRect(-(960 - P.w / 2), -(540 - P.h / 2), 1920, 1080); ctx.restore(); }
    const w = Math.max(P.w * 0.6, chipWidth(ctx, P.label, P.h, P));
    drawChip(ctx, (P.w - w) / 2, 0, w, P.h, P.label, S, P);
  },
};

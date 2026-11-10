// cursor — the plain arrow pointer of a demo: a filled arrow with a contrasting rim and a two-layer shadow, pressed
// (scale 0.86 about its tip), a click ripple (one ring, or two staggered), and an optional name tag for a collaborator.
// Adapted from video-shotcraft demos/interaction/segmented-thumb-hero/SegmentedThumbHero.tsx (card
// references/shots/interaction/segmented-thumb-hero.md), demos/interaction/collab-cursor-moves/CursorCastEnsemble.tsx
// (card references/shots/interaction/collab-cursor-moves.md) and demos/interaction/type-and-filter/TypeAndFilter.tsx
// (card references/shots/interaction/type-and-filter.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React, SVG or Remotion); one arrow outline for every size (the upstream
// drew three), in two forms by role (`outline`: panel fill, ink rim; `solid`: ink fill, panel rim); the ripple's
// colour is the accent; tag colours are the accent for the one who matters and ink or dim for the rest (one accent a
// film, not five identity colours); names are the film's text.
import { clamp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor } from '../../lang.js';
import { look as NEUTRAL } from '../../sample.js';

// The arrow in a 26 × 30 box, tip at (4, 2) (the upstream's large outline arrow).
const ARROW = [[4, 2], [4, 24], [9.5, 18.5], [13, 27], [16.8, 25.4], [13.3, 17], [21, 17]];
const TIP = [4, 2], BOX = 30;
const arrowPath = (ctx) => { ctx.beginPath(); ARROW.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

// Colours of a form: the fill, the rim, the shadow tone.
export const cursorColors = (c, form = 'solid') => (form === 'outline'
  ? { fill: c.panel, rim: c.ink, shadow: mix(c.ink, '#000000', 0.6) }
  : { fill: c.ink, rim: c.panel, shadow: mix(c.ink, '#000000', 0.6) });

// Draw the cursor with its tip at (x, y). h: height in px (48 in a page at 1:1, 150 in a close-up); press 0 → 1
// scales it 1 → 0.86 about the tip and pulls the shadow in; alpha fades it.
export const drawCursor = (ctx, x, y, { h = 48, form = 'solid', press = 0, alpha = 1, colors, rim = null } = {}) => {
  if (alpha <= 0.001) return;
  const k = h / BOX, s = k * (1 - 0.14 * clamp(press)), q = h / 150, cc = cursorColors(colors, form);
  ctx.save();
  const T = ctx.getTransform(), outer = Math.hypot(T.a, T.b);   // shadows are in device px: follow any outer zoom
  ctx.globalAlpha *= clamp(alpha);
  ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-TIP[0], -TIP[1]);
  ctx.lineJoin = 'round';
  // two shadows: near and hard, far and soft (both shrink as it presses)
  for (const [dy, blur, a] of [[12 - 6 * press, 18 - 6 * press, 0.2], [2 - press, 3 - press, 0.22]]) {
    ctx.save();
    ctx.shadowColor = rgba(cc.shadow, a); ctx.shadowBlur = blur * q * outer; ctx.shadowOffsetY = dy * q * outer;
    arrowPath(ctx); ctx.fillStyle = cc.fill; ctx.fill();
    ctx.restore();
  }
  arrowPath(ctx); ctx.fillStyle = cc.fill; ctx.fill();
  ctx.lineWidth = rim ?? (form === 'outline' ? 1.6 : 1.4); ctx.strokeStyle = cc.rim; ctx.stroke();
  ctx.restore();
};

// A click ripple at (x, y), t 0 → 1 over its life. rings 1: one ring growing to r (the close-up's 12-frame ring with a
// faint inner fill); rings 2: two rings 3 frames apart of `frames` each, to r and r × 1.44 (the page's double ripple).
export const drawRipple = (ctx, x, y, t, { colors, r = 130, rings = 1, width = 3, frames = 13, glow = 0 } = {}) => {
  const c = colors;
  const ring = (u, R, a) => {
    if (u <= 0 || u >= 1) return;
    const e = 1 - (1 - u) * (1 - u), rr = Math.max(0.5, R * e);
    ctx.save();
    if (rings === 1) {
      const g = ctx.createRadialGradient(x, y, rr * 0.5, x, y, rr);
      g.addColorStop(0, rgba(c.accent, 0)); g.addColorStop(1, rgba(c.accent, 0.12 * a * (1 - u)));
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    }
    if (glow) { ctx.shadowColor = rgba(c.accent, 0.5 * a * (1 - u)); ctx.shadowBlur = glow; }
    ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, rr - width / 2), 0, Math.PI * 2);
    ctx.lineWidth = width; ctx.strokeStyle = rgba(c.accent, a * (1 - u)); ctx.stroke();
    ctx.restore();
  };
  if (rings === 1) ring(t, r, 0.9);
  else { const span = frames + 3, f = t * span; ring(f / frames, r, 1); ring((f - 3) / frames, r * 1.44, 0.8); }
};

// A collaborator's name tag hung below-right of a cursor of height h whose tip is at (x, y); tone: the role of its
// fill ('accent', 'ink', 'dim'); show 0 → 1 fades it in and lifts it 12 px.
export const drawTag = (ctx, x, y, name, { h = 84, tone = 'accent', show = 1, colors, lang = 'en', look = NEUTRAL, size = 26 } = {}) => {
  if (!name || show <= 0.001) return;
  const c = colors, fill = c[tone] || c.accent, on = tone === 'accent' ? c.onAccent || c.panel : c.panel;
  const f = fontFor(look, 'text', lang, size, 680);
  const w = measure(ctx, name, f).width + 32, th = size + 15, tx = x + 0.448 * h, ty = y + 0.838 * h + (1 - show) * 12;
  ctx.save(); ctx.globalAlpha *= clamp(show);
  ctx.shadowColor = rgba(fill, 0.45); ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.moveTo(tx + 6, ty); ctx.arcTo(tx + w, ty, tx + w, ty + th, th / 2); ctx.arcTo(tx + w, ty + th, tx, ty + th, th / 2);
  ctx.arcTo(tx, ty + th, tx, ty, th / 2); ctx.arcTo(tx, ty, tx + w, ty, 6); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  ctx.shadowColor = 'transparent';
  text(ctx, name, tx + 16, ty + th / 2 + 1, f, { color: on, baseline: 'middle' });
  ctx.restore();
};

// States the prop walks in its sample: arrives, gets its tag, presses, releases with the ripple.
const STATES = {
  rest: { press: 0, ripple: 0, tag: 0 },
  named: { press: 0, ripple: 0, tag: 1 },
  pressed: { press: 1, ripple: 0, tag: 1 },
  clicked: { press: 0, ripple: 0.42, tag: 1 },
};

export default {
  id: 'cursor', kind: 'prop',
  surface: ['canvas'],
  // the box the cursor is drawn in: its height is the cursor's (S a page at 1:1, M a near shot, L a close-up)
  sizes: { S: [180, 48], M: [300, 96], L: [460, 150] },
  states: STATES,
  parts: ['arrow', 'rim', 'shadow', 'ripple', 'tag'],
  swap: {
    name: { type: 'text', tier: 'glance', optional: true, sample: 'steps', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } },
  },
  roles: ['panel', 'ink', 'accent', 'onAccent', 'ground'],
  summary: 'The plain arrow pointer: pressed about its tip, a click ripple in the accent, an optional name tag.',
  defaults: () => ({ form: 'outline', tone: 'accent', rings: 1, backdrop: true }),
  // draw in the size box [0, 0, w, h] (the tip at the box's top-left, the ripple centred on the tip)
  draw(ctx, S, P) {
    const c = P.colors, h = P.h;
    if (P.backdrop) { ctx.save(); ctx.fillStyle = c.ground; ctx.fillRect(-(960 - P.w / 2), -(540 - P.h / 2), 1920, 1080); ctx.restore(); }
    const x = 20, y = 0;
    drawRipple(ctx, x, y, S.ripple, { colors: c, r: h * 0.87, rings: P.rings });
    drawCursor(ctx, x, y, { h, form: P.form, press: S.press, colors: c });
    drawTag(ctx, x, y, P.name, { h, tone: P.tone, show: S.tag, colors: c, lang: P.lang, size: Math.max(P.lang === 'zh' ? 28 : 25, Math.round(h * 0.31)) });
  },
};

// unfold — a line of the page opens in place: the page splits along the line's lower edge, everything below slides
// down by the height of what opens, and the opened part is revealed from its top edge as the gap grows (its content
// is anchored to the fold line, so nothing inside it moves while it opens). The rest of the page never changes; when
// it lands, the page is simply longer. Theory: progressive disclosure (the disclosure triangle, a <details> element,
// an accordion row: what opens belongs to the line it opens from, Nielsen 2006); object constancy (Heer & Robertson
// 2007): the line the eye is on stays put while the page makes room. Sources: expanding table rows in docs sites,
// long-form stories that open a figure inline.
//
// Params: `view` { x, y, w, h } the viewport; `line` the fold line's y in film px (the lower edge of the row that
// opens); `height` what opens (px); painters `above(ctx, P)` (the page down to the line, drawn as it rests),
// `below(ctx, dy, P)` (the page under the line, drawn shifted by dy), `inside(ctx, rect, P)` (the opened content,
// laid out for the full height and clipped to rect). p = 0 paints the closed page and p = 1 the open one exactly.

import { clamp, cubicInOut } from './util.js';
import { NEUTRAL } from './asset.js';

const placeholder = {
  above(ctx, P) { const V = P.view; ctx.fillStyle = '#F3F3F0'; ctx.fillRect(V.x, V.y, V.w, P.line - V.y); ctx.fillStyle = '#C9C9C4'; for (let y = V.y + 40; y < P.line - 30; y += 64) ctx.fillRect(V.x + 60, y, V.w * 0.6, 18); },
  below(ctx, dy, P) { const V = P.view; ctx.fillStyle = '#F3F3F0'; ctx.fillRect(V.x, P.line + dy, V.w, V.y + V.h - P.line); ctx.fillStyle = '#C9C9C4'; for (let y = P.line + dy + 40; y < V.y + V.h + dy; y += 64) ctx.fillRect(V.x + 60, y, V.w * 0.5, 18); },
  inside(ctx, r, P) { ctx.fillStyle = P.colors.panel; ctx.fillRect(r.x, r.y, r.w, P.height); ctx.fillStyle = P.colors.dim; ctx.fillRect(r.x + 80, r.y + 60, r.w - 160, P.height - 120); },
};

export default {
  name: 'unfold',
  tier: 'T2',
  beats: 2,
  modes: ['scroll', 'any mode whose page has rows that carry more'],
  roles: ['ground', 'panel', 'dim'],
  from: 'a row of a long page, closed',
  to: 'the same row with what it carries opened under it; the rest of the page pushed down',
  interpolates: ['gap height'],
  summary: 'A row opens in place: the page below slides down while what the row carries is revealed from the fold line.',
  theory: 'Progressive disclosure: what opens belongs to the line it opens from; the line the eye is on stays put (object constancy, Heer & Robertson 2007).',
  defaults: { view: { x: 210, y: 54, w: 1500, h: 1026 }, line: 360, height: 560, ...placeholder, colors: { ...NEUTRAL } },
  rest(side, P) { return { h: side === 'from' ? 0 : P.height }; },
  at(p, P) { return { h: P.height * cubicInOut(clamp(p)) }; },
  paint(ctx, S, P) {
    const V = P.view;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(V.x, V.y, V.w, V.h); ctx.clip();
    P.above(ctx, P);
    P.below(ctx, S.h, P);
    if (S.h > 0) { ctx.save(); ctx.beginPath(); ctx.rect(V.x, P.line, V.w, S.h); ctx.clip(); P.inside(ctx, { x: V.x, y: P.line, w: V.w, h: S.h }, P); ctx.restore(); }
    ctx.restore();
  },
  track: (S, P) => [[P.view.x, P.line + S.h]],
};

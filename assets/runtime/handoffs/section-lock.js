// section-lock — a long page's section headings become its chapters: as the page scrolls, each heading that reaches
// the top of the viewport stays there, pinned, while its section passes under it; the next heading pushes it out
// (its top edge meets the pinned one's bottom edge and carries it up). A pure function of the page's offset, so it
// runs inside any scroll (reel, detent, fling) and unpins in reverse when the page goes back. The tab is the heading's
// own pixels (a real capture, cropped), not a redraw. Theory: sticky section headers (the list sections of phone
// interfaces, CSS position: sticky): the persistent frame carries real information, the chapter in view (principle 7).
//
// tabsAt(off, heads, top) → [{ i, y }]: heads = [{ y (page y of the heading's top), h (its height) }], top = the
// viewport's top in film px; screen y of a page point = top + pageY − off. As a module: `from`, `to` offsets like
// scroll-reel, `heads`, `page(ctx, off, P)`, `tab(ctx, i, y, P)`.

import { clamp, lerp } from './util.js';
import { NEUTRAL } from './asset.js';
import { momentum } from './scroll-reel.js';

export const tabsAt = (off, heads, top) => {
  const out = [];
  heads.forEach((hd, i) => {
    const nat = top + hd.y - off;
    if (nat >= top) return;                                   // still in place on the page: nothing pinned
    const next = heads[i + 1];
    const y = next ? Math.min(top, top + next.y - off - hd.h) : top;
    if (y + hd.h > top) out.push({ i, y });
  });
  return out;
};

export default {
  name: 'section-lock',
  tier: 'T1',
  beats: 1.5,
  modes: ['scroll (a page\'s headings as chapters)', 'handset (a long page in the screen)', 'every mode with a long page'],
  roles: ['ground'],
  from: 'a section heading on the page',
  to: 'the same heading pinned at the top as the chapter, the previous one pushed out',
  interpolates: ['offset', 'pinned tab positions'],
  summary: 'Headings that reach the top stay pinned as the chapter while their section scrolls under them; the next one pushes them out.',
  theory: 'Sticky section headers: the persistent frame carries the chapter in view (principle 7).',
  defaults: {
    view: { x: 210, y: 54, w: 1500, h: 1026 }, from: 0, to: 900, k: 6.5,
    heads: [{ y: 300, h: 70 }, { y: 900, h: 70 }],
    page: (ctx, off, P) => { const V = P.view; ctx.fillStyle = '#F3F3F0'; ctx.fillRect(V.x, V.y, V.w, V.h); P.heads.forEach((h) => { ctx.fillStyle = '#C9C9C4'; ctx.fillRect(V.x + 60, V.y + h.y - off + 20, 400, 30); }); },
    tab: (ctx, i, y, P) => { const V = P.view; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(V.x, y, V.w, P.heads[i].h); ctx.fillStyle = '#9A9A95'; ctx.fillRect(V.x + 60, y + 20, 400, 30); },
    colors: { ...NEUTRAL },
  },
  rest(side, P) { return { off: side === 'from' ? P.from : P.to }; },
  at(p, P) { return { off: lerp(P.from, P.to, momentum(clamp(p), P.k)) }; },
  paint(ctx, S, P) {
    const V = P.view;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = P.colors.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(V.x, V.y, V.w, V.h); ctx.clip();
    P.page(ctx, S.off, P);
    for (const { i, y } of tabsAt(S.off, P.heads, V.y)) P.tab(ctx, i, y, P);
    ctx.restore();
  },
  track: (S, P) => [[P.view.x, P.view.y - S.off]],
};

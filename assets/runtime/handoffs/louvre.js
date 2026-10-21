// louvre — the content is cut into horizontal slats and each slat pushes sideways on its own, edge to edge: the next
// content's slice slides in as the current one's slides out, slats one after another top to bottom in reading order.
// Slices are only translated; edges are hard; nothing turns in depth, so no slat ever shows a face edge-on (a slide,
// not a blind turning), and every pixel shows one content, never both (C5). Where it happens:
//   a window of real assets (default): `window` with a title bar (the first slat, so the source changes with the
//            first slice), `from` / `to` { asset, title, focus }; slats along the current asset's own rows (`rows`,
//            image px: the table's benchmark rows), else `count` equal slats; alternate slats push opposite ways
//   a pane (`pane` { x, y, w, h }): content from painters `from.paint` / `to.paint` (ctx, dx, dy); `n` (or `count`)
//            equal slats, or `rows` (film px); in each, the next content slides out of the seam at the pane's edge
//            behind a copy of the seam riding the boundary (`edge` 'seam'); drawn as a layer, never the ground. With
//            n = 1 it is the plain seam push (T1)
// Options either way: `alternate` (default: on in a window, off in a pane), `direction` 1 (the next content enters
// from the right in a window, from the seam at the left in a pane) or −1, `edge` 'seam' | 'none', timing by `slide`
// and `end` (each slat takes `slide` of p, the last lands at `end`) or by `stagger` (p between slat starts; each
// takes the rest).
// Theory: the venetian-blind and slide wipes of film grammar (Bordwell & Thompson, Film Art); slats that follow the
// content's rows keep its form while it changes (as slice-smear keeps a terminal's lines); one rule applied to every
// slat reads as one operation, alternating directions group in pairs by common fate, the top-to-bottom order is the
// reading order (Wertheimer 1923); in a pane the content comes out of the seam, where the cause is. Sources: the louvre
// and comb wipes of broadcast switchers, slatted title sequences (named, not copied).

import { seg, cubicInOut, rrect } from './util.js';
import { NEUTRAL, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow, ptScreen } from './asset.js';
import { coverView, paintView } from './stage.js';
import { clipRect, SEAM_W, seamV } from './seam.js';

// slats of a pane (film px), without prepare()
const paneSlats = (P) => {
  const R = P.pane;
  if (P.rows) {
    const ys = [R.y, ...P.rows.filter((y) => y > R.y + 4 && y < R.y + R.h - 4), R.y + R.h];
    return ys.slice(0, -1).map((y, i) => ({ y, h: ys[i + 1] - y }));
  }
  const n = P.n ?? P.count, h = R.h / n;
  return Array.from({ length: n }, (_, i) => ({ y: R.y + i * h, h }));
};
const progress = (p, n, P) => {
  if (P.stagger != null) {
    const span = 1 - P.stagger * (n - 1);
    return Array.from({ length: n }, (_, i) => cubicInOut(seg(p, i * P.stagger, i * P.stagger + span)));
  }
  const st = n > 1 ? (P.end - P.slide) / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => cubicInOut(seg(p, st * i, st * i + P.slide)));
};
const alt = (P) => P.alternate ?? !P.pane;
const edgeOn = (P) => (P.edge ?? (P.pane ? 'seam' : 'none')) === 'seam';

export default {
  name: 'louvre',
  tier: 'T2',
  beats: 2,
  modes: ['split (a change of result beside the seam)', 'dossier', 'tally (rows of a table)', 'plakat', 'every mode with a table or a list'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent', 'key'],
  from: 'one content (an asset in a window: a table, a list, something with rows; or a result in a pane)',
  to: 'the next content in the same place',
  interpolates: ['per-slat push offset (cubic in-out, staggered top to bottom, alternate directions in a window)'],
  summary: 'The content is cut into slats (along a table\'s own rows); each slat pushes sideways in turn and brings in a slice of the next content.',
  theory: 'The blinds and slide wipes of film grammar (Film Art); slats on the content\'s rows keep its form; one rule per slat reads as one operation, pairs by common fate, order by reading order (Wertheimer 1923).',
  defaults: {
    window: { x: 240, y: 132, w: 1440, h: 810 },
    pane: null,                                // { x, y, w, h }: a pane of painters instead of a window of assets
    from: { asset: null, title: 'example.com/table', focus: null, paint: null },
    to: { asset: null, title: 'example.com/chart', focus: null, paint: null },
    rows: null,                                // slat boundaries (window: the current asset's image px; pane: film px)
    count: 9, n: null,                         // equal slats when there are no rows (`n` for a pane)
    slide: 0.4,                                // share of p each slat takes
    end: 0.95,                                 // the last slat lands here (the rest of p holds still)
    stagger: null,                             // instead: p between slat starts, each slat taking the rest
    alternate: null, direction: 1, edge: null,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL, key: '#F3F2EE' },
  },
  prepare(P) {
    if (P.pane) return null;
    const W = windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = contentOf(W);
    const A = assetOf(P.from.asset, () => placeholderPage(2000, 1125));
    const B = assetOf(P.to.asset, () => placeholderPage(2000, 1300));
    const vA = coverView(A, R, P.from.focus), vB = coverView(B, R, P.to.focus);
    let ys = P.rows ? P.rows.map((y) => ptScreen(vA, 0, y)[1]).filter((y) => y > R.y + 4 && y < R.y + R.h - 4) : Array.from({ length: P.count - 1 }, (_, i) => R.y + ((i + 1) * R.h) / P.count);
    ys = [W.y, R.y, ...ys, R.y + R.h];                 // the bar is slat 0
    const slats = ys.slice(0, -1).map((y, i) => ({ y, h: ys[i + 1] - y }));
    return { W, R, A, B, vA, vB, slats };
  },
  rest(side, P, D) { return { u: (P.pane ? paneSlats(P) : D.slats).map(() => (side === 'from' ? 0 : 1)) }; },
  at(p, P, D) { return { u: progress(p, (P.pane ? paneSlats(P) : D.slats).length, P) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.pane) {
      // in each slat the next content slides out of the seam, pushing the current one out of the far edge, its
      // slat's copy of the seam riding the boundary
      const R = P.pane;
      paneSlats(P).forEach(({ y, h }, i) => {
        const u = S.u[i], dir = (alt(P) && i % 2 ? -1 : 1) * P.direction;
        const edge = dir > 0 ? R.x + u * R.w : R.x + R.w - u * R.w;
        clipRect(ctx, R.x, y, R.w, h, () => {
          if (dir > 0) {
            if (u < 1) clipRect(ctx, edge, y, R.x + R.w - edge, h, () => P.from.paint(ctx, u * R.w, 0));
            if (u > 0) clipRect(ctx, R.x, y, edge - R.x, h, () => P.to.paint(ctx, -(1 - u) * R.w, 0));
          } else {
            if (u < 1) clipRect(ctx, R.x, y, edge - R.x, h, () => P.from.paint(ctx, -u * R.w, 0));
            if (u > 0) clipRect(ctx, edge, y, R.x + R.w - edge, h, () => P.to.paint(ctx, (1 - u) * R.w, 0));
          }
          if (edgeOn(P) && u > 0 && u < 1) {
            seamV(ctx, edge, y, y + h, C);
          }
        });
      });
      return;
    }
    const W = D.W, R = D.R;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const face = (v, A, title) => {          // one whole window state; drawn per slat, shifted
      windowBack(ctx, W, P);
      ctx.save(); clipWindow(ctx, W); paintView(ctx, A, v, R); ctx.restore();
      windowFront(ctx, W, P, { title });
    };
    ctx.save(); clipWindow(ctx, W);
    D.slats.forEach((s, i) => {
      const u = S.u[i], dir = (alt(P) && i % 2 ? -1 : 1) * P.direction, dx = dir * W.w;
      ctx.save();
      ctx.beginPath(); ctx.rect(W.x, s.y, W.w, s.h); ctx.clip();
      if (u < 1) { ctx.save(); ctx.translate(-dx * u, 0); face(D.vA, D.A, P.from.title); ctx.restore(); }
      if (u > 0) { ctx.save(); ctx.translate(dx * (1 - u), 0); face(D.vB, D.B, P.to.title); ctx.restore(); }
      if (edgeOn(P) && u > 0 && u < 1) {
        const x = W.x + dx * (1 - u) + (dir > 0 ? 0 : W.w);
        if (C.stitch) seamV(ctx, x, s.y, s.y + s.h, C); // a stitched seam keys its dashes
        else { ctx.fillStyle = C.accent; ctx.fillRect(x - SEAM_W / 2, s.y, SEAM_W, s.h); }
      }
      ctx.restore();
    });
    ctx.restore();
    // the window's outline stays still over the slats
    rrect(ctx, W.x + 1, W.y + 1, W.w - 2, W.h - 2, Math.max(0, W.r - 1));
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
  },
  track: (S, P, D) => {
    if (P.pane) return S.u.map((u, i) => [P.pane.x + u * P.pane.w, P.pane.y + (i + 0.5) * P.pane.h / S.u.length]);
    return D.slats.map((s, i) => [D.W.x + (alt(P) && i % 2 ? -1 : 1) * P.direction * D.W.w * (1 - S.u[i]), s.y]);
  },
};

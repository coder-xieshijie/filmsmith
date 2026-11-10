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
// Variant `turn: 'flip'`: instead of pushing, each slat turns over about its own horizontal axis like a blind's
// vane, the current slice on its face and the next on its back; it lands with a small overshoot (about 5°), its face
// darkening as it goes edge-on and the dark slot behind showing. Drawn flat (the vane scales by cos θ, no perspective).
// Adapted from video-shotcraft demos/transition/wipe-transitions/BlindsSlice.tsx, https://github.com/Vincentwei1021/
// video-shotcraft @ 1266a3e, Apache-2.0: the flip with a ~5° overshoot, the darkening with the turn, the slot behind and
// the wave speeding up (starts at t^0.78 of the stagger); slats are the louvre's rows, not 12 vertical strips.
// Theory: the venetian-blind and slide wipes of film grammar (Bordwell & Thompson, Film Art); slats that follow the
// content's rows keep its form while it changes (as slice-smear keeps a terminal's lines); one rule applied to every
// slat reads as one operation, alternating directions group in pairs by common fate, the top-to-bottom order is the
// reading order (Wertheimer 1923); in a pane the content comes out of the seam, where the cause is. Sources: the louvre
// and comb wipes of broadcast switchers, slatted title sequences (named, not copied).

import { seg, cubicInOut, rrect, mix, rgba } from './util.js';
import { bez } from '../motion.js';
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
const FLIP = bez(0.34, 1.32, 0.64, 1);          // turns past 180° by about 5° and settles
// flip: the starts speed up (t^0.78 of the stagger: the wave turns faster as it goes); each vane takes `slide` of p
const flipProgress = (p, n, P) => Array.from({ length: n }, (_, i) => { const a = n > 1 ? Math.pow(i / (n - 1), 0.78) * (P.end - P.slide) : 0; return seg(p, a, a + P.slide); });
const vane = (u) => Math.PI * (u <= 0 ? 0 : u >= 1 ? 1 : FLIP(u));
// draw one vane of a slat [y, h]: the face (cos θ > 0: the current slice, else the next) squashed by |cos θ| about the
// slat's middle over the dark slot, darkening as it goes edge-on
const drawVane = (ctx, x, w, y, h, th, C, paintFrom, paintTo) => {
  const c = Math.cos(th), k = Math.abs(c), cy = y + h / 2;
  if (th > 0 && th < Math.PI * 1.06) { ctx.fillStyle = mix(C.ground, '#000000', 0.55); ctx.fillRect(x, y, w, h); }
  if (k < 0.002) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, cy - (h / 2) * k, w, h * k); ctx.clip();
  ctx.translate(0, cy); ctx.scale(1, k); ctx.translate(0, -cy);
  if (c > 0) paintFrom(); else paintTo();
  ctx.restore();
  if (th > 0 && k < 0.999) { ctx.fillStyle = rgba('#000000', 0.5 * (1 - k)); ctx.fillRect(x, cy - (h / 2) * k, w, h * k); }
};
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
    turn: 'push',                              // 'flip': each slat turns over like a blind's vane instead of pushing
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
  at(p, P, D) { const n = (P.pane ? paneSlats(P) : D.slats).length; return { u: P.turn === 'flip' ? flipProgress(p, n, P) : progress(p, n, P) }; },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.pane) {
      // in each slat the next content slides out of the seam, pushing the current one out of the far edge, its
      // slat's copy of the seam riding the boundary
      const R = P.pane;
      if (P.turn === 'flip') { paneSlats(P).forEach(({ y, h }, i) => drawVane(ctx, R.x, R.w, y, h, vane(S.u[i]), C, () => P.from.paint(ctx, 0, 0), () => P.to.paint(ctx, 0, 0))); return; }
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
    if (P.turn === 'flip') D.slats.forEach((s, i) => drawVane(ctx, W.x, W.w, s.y, s.h, vane(S.u[i]), C, () => face(D.vA, D.A, P.from.title), () => face(D.vB, D.B, P.to.title)));
    else D.slats.forEach((s, i) => {
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
    if (P.turn === 'flip') return (P.pane ? paneSlats(P) : D.slats).map((s, i) => [(P.pane || D.W).x + (P.pane || D.W).w / 2, s.y + (s.h / 2) * (1 - Math.cos(vane(S.u[i])))]);
    if (P.pane) return S.u.map((u, i) => [P.pane.x + u * P.pane.w, P.pane.y + (i + 0.5) * P.pane.h / S.u.length]);
    return D.slats.map((s, i) => [D.W.x + (alt(P) && i % 2 ? -1 : 1) * P.direction * D.W.w * (1 - S.u[i]), s.y]);
  },
};

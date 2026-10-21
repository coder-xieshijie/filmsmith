// split-open — a seam opens one content onto the next. Two stages, one operation each: the seam arrives, then the
// content parts or slides along it. Where it happens:
//   a window of real assets (default): `window` with a title bar, `from` / `to` { asset, title, focus }; the module
//            paints the whole frame (or a layer with `ground: false`)
//   a pane (`pane` { x, y, w, h }): content comes from painters `from.paint` / `to.paint` (ctx, dx, dy) that draw the
//            pane's content shifted by (dx, dy); the module draws only the pane and the seam, as a layer over the
//            template's scene, and never paints the ground (the input on the other side of the seam stays the
//            template's)
// How the seam arrives (`run`: the share of p it takes):
//   drawn on (default): an accent line is drawn down the content at its own division (`seam` 0.5 of its width)
//   `caret` { x, y, h, w }: the caret the request was typed with runs to the seam's place and stands up into the
//            full-height seam (`seam` { x, y0, y1 } in film px): the edit point becomes the boundary
// What it reveals (`reveal`, default by where: 'doors' in a window, 'drawer' in a pane):
//   'doors'  the current content's two halves (its title bar too) slide apart like pocket doors into the frame's
//            sides, uncovering the next content, which was lying behind in the same place all along; `axis` 'y' parts
//            them up and down; `open` < 1 stops them part-way, leaving a split screen of the two
//   'drawer' the next content slides out from behind the seam, as from a drawer, until it sits 1:1 in its place
// Every pixel shows one content, never two (no blend, C5); contents are only translated.
// Theory: the wipe and split screen of film grammar ("a line passes across the screen, eliminating one shot as it
// goes", Bordwell & Thompson, Film Art); a reveal by occlusion: the next content is behind the current one (amodal
// completion, Kanizsa 1979); the edit point becomes the boundary (object constancy, Heer & Robertson 2007).
// Sources: barn-door and split-screen wipes, before/after comparison sliders (named, not copied).

import { seg, cubicInOut, lerp } from './util.js';
import { NEUTRAL, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow } from './asset.js';
import { coverView, paintView } from './stage.js';
import { clipRect, seamV, seamH, SEAM_W } from './seam.js';

const revealOf = (P) => P.reveal || (P.pane ? 'drawer' : 'doors');
const seamW = (P) => P.seamWidth ?? (P.pane ? SEAM_W : 3);
const rectOf = (P) => P.pane || contentOf(windowOf(P.window.x, P.window.y, P.window.w, P.window.h));
// the seam's line in film px: `seam` { x, y0, y1 } (or { y, x0, x1 } with axis 'y'), else the content's cut at the
// share `seam` along `axis`; a drawer in a pane comes out of the pane's near edge
const lineOf = (P) => {
  if (P.seam && typeof P.seam === 'object') return P.seam;
  const R = rectOf(P), s = P.pane && revealOf(P) === 'drawer' ? 0 : P.seam;
  return P.axis === 'y' ? { y: R.y + R.h * s, x0: R.x, x1: R.x + R.w } : { x: R.x + R.w * s, y0: R.y, y1: R.y + R.h };
};
const horiz = (L) => L.y != null && L.x == null;        // a horizontal seam (axis 'y')
// the seam's rect for a state: the caret on its run and the seam it became, or the seam drawn on along its line
const seamRect = (S, P) => {
  if (P.caret) return { x: S.x, cy: S.cy, h: S.h, w: S.w, open: S.open };
  const L = lineOf(P), w = seamW(P);
  if (horiz(L)) { const len = L.x1 - L.x0; return { x: L.x0 + (len * S.seam) / 2, cy: L.y, h: len * S.seam, w, open: true, horiz: true }; }
  const len = L.y1 - L.y0;
  return { x: L.x, cy: L.y0 + (len * S.seam) / 2, h: len * S.seam, w, open: true };
};

// ---------------------------------------------------------------------------------------------------------------
// In a pane (works without prepare())
const paintPane = (ctx, S, P) => {
  const C = P.colors, R = P.pane, T = seamRect(S, P);
  const u = P.caret ? S.drawer : S.u, shown = P.caret ? S.open : S.seam > 0;
  if (revealOf(P) === 'drawer') {
    // only the part that has come out from behind the seam is shown; the rest of the pane is still the scene's
    if (shown) clipRect(ctx, R.x, R.y, u * R.w, R.h, () => {
      ctx.fillStyle = C.bench; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (P.to.paint) P.to.paint(ctx, -(1 - u) * R.w, 0);
    });
  } else if (shown) {
    // doors: the next content behind, the current one's halves parting from the seam
    const L = lineOf(P), Y = horiz(L), cut = Y ? L.y : L.x;
    const span = Y ? [cut - R.y, R.y + R.h - cut] : [cut - R.x, R.x + R.w - cut];
    clipRect(ctx, R.x, R.y, R.w, R.h, () => {
      ctx.fillStyle = C.bench; ctx.fillRect(R.x, R.y, R.w, R.h);
      if (P.to.paint) P.to.paint(ctx, 0, 0);
      if (u >= 1 && P.open >= 1) return;
      for (const [k, d] of [[0, -span[0] * P.open * u], [1, span[1] * P.open * u]]) {
        const h = Y ? (k ? [R.x, cut, R.w, R.y + R.h - cut] : [R.x, R.y, R.w, cut - R.y]) : (k ? [cut, R.y, R.x + R.w - cut, R.h] : [R.x, R.y, cut - R.x, R.h]);
        const dx = Y ? 0 : d, dy = Y ? d : 0;
        clipRect(ctx, h[0] + dx, h[1] + dy, h[2], h[3], () => {
          ctx.fillStyle = C.bench; ctx.fillRect(R.x + dx, R.y + dy, R.w, R.h);
          if (P.from.paint) P.from.paint(ctx, dx, dy);
        });
      }
    });
  }
  if (T.h <= 0) return;
  if (T.open) {
    if (T.horiz) seamH(ctx, T.cy, T.x - T.h / 2, T.x + T.h / 2, C, T.w);
    else seamV(ctx, T.x, T.cy - T.h / 2, T.cy + T.h / 2, C, T.w);
  } else { ctx.fillStyle = C.accent; ctx.fillRect(T.x - T.w / 2, T.cy - T.h / 2, T.w, T.h); }
};

// ---------------------------------------------------------------------------------------------------------------
// In a window of assets
const paintWindow = (ctx, S, P, D) => {
  const C = P.colors, W = D.W, R = D.R, X = P.axis === 'x';
  if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
  const cut = X ? W.x + R.w * P.seam : R.y + R.h * P.seam;
  const face = (A, v, title) => {
    windowBack(ctx, W, P);
    ctx.save(); clipWindow(ctx, W); paintView(ctx, A, v, R); ctx.restore();
    windowFront(ctx, W, P, { title });
  };
  // the seam, drawn on top to bottom (or left to right), or the caret on its run
  const seam = () => {
    if (P.caret) { ctx.fillStyle = C.accent; ctx.fillRect(S.x - S.w / 2, S.cy - S.h / 2, S.w, S.h); return; }
    if (!(S.seam > 0)) return;
    ctx.fillStyle = C.accent;
    const sw = seamW(P);
    if (X) ctx.fillRect(cut - sw / 2, R.y, sw, R.h * S.seam); else ctx.fillRect(R.x, cut - sw / 2, R.w * S.seam, sw);
  };
  if (revealOf(P) === 'drawer') {
    // the current content stays; beyond the seam the next slides out from behind it and the seam stays
    face(D.A, D.vA, P.from.title);
    const far = X ? W.x + W.w - cut : W.y + W.h - cut, d = -(1 - S.u) * far;
    ctx.save(); clipWindow(ctx, W);
    if (S.u > 0) {
      ctx.save();
      ctx.beginPath(); if (X) ctx.rect(cut, W.y, S.u * far, W.h); else ctx.rect(W.x, cut, W.w, S.u * far); ctx.clip();
      ctx.translate(X ? d : 0, X ? 0 : d);
      face(D.B, D.vB, P.to.title);
      ctx.restore();
    }
    seam();
    ctx.restore();
    return;
  }
  // the next asset, in the same window, behind
  face(D.B, D.vB, P.to.title);
  if (S.u >= 1 && P.open >= 1) return;
  // the two doors: halves of the current window (bar included), moving apart inside the window's outline
  const span = X ? [cut - W.x, W.x + W.w - cut] : [cut - W.y, W.y + W.h - cut];
  const d0 = -span[0] * P.open * S.u, d1 = span[1] * P.open * S.u;
  ctx.save(); clipWindow(ctx, W);
  for (const [k, d] of [[0, d0], [1, d1]]) {
    const half = X ? (k ? { x: cut, y: W.y, w: W.x + W.w - cut, h: W.h } : { x: W.x, y: W.y, w: cut - W.x, h: W.h })
      : (k ? { x: W.x, y: cut, w: W.w, h: W.y + W.h - cut } : { x: W.x, y: W.y, w: W.w, h: cut - W.y });
    ctx.save();
    ctx.translate(X ? d : 0, X ? 0 : d);
    ctx.beginPath(); ctx.rect(half.x, half.y, half.w, half.h); ctx.clip();
    face(D.A, D.vA, P.from.title);
    // the door's cut edge
    ctx.fillStyle = C.line;
    if (X) ctx.fillRect(k ? cut : cut - 2, W.y, 2, W.h); else ctx.fillRect(W.x, k ? cut : cut - 2, W.w, 2);
    ctx.restore();
  }
  if (S.u <= 0) seam();
  ctx.restore();
};

export default {
  name: 'split-open',
  tier: 'T1',                        // T3 as a film's opening (the caret becomes the seam)
  beats: 1.5,
  modes: ['split (the opening: the caret becomes the seam)', 'dossier (two sheets side by side)', 'exhibit', 'plakat', 'every mode with two related contents'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent', 'key', 'bench'],
  from: 'one content (an asset in a window, or a caret at the end of a typed line beside an empty pane)',
  to: 'the next content in the same place (or, with open < 1, both side by side; in a pane, a full-height seam with the result beside it)',
  interpolates: ['seam draw-on or caret x, height and centre', 'door offsets or drawer offset (cubic in-out)'],
  summary: 'A seam is cut down the content (or a caret stands up into it); the halves part like pocket doors, or the next content slides out of the seam.',
  theory: 'The wipe and split screen of film grammar (Bordwell & Thompson, Film Art); reveal by occlusion (Kanizsa 1979); the edit point becomes the boundary (Heer & Robertson 2007); one operation per stage.',
  defaults: {
    window: { x: 240, y: 132, w: 1440, h: 810 },
    pane: null,                                // { x, y, w, h }: a pane of painters instead of a window of assets
    from: { asset: null, title: 'example.com/a', focus: null, paint: null },
    to: { asset: null, title: 'example.com/b', focus: null, paint: null },
    reveal: null,                              // 'doors' | 'drawer' (null: doors in a window, drawer in a pane)
    caret: null,                               // { x, y, h, w }: the seam starts as this caret
    axis: 'x',                                 // 'x': a vertical seam, halves part left and right; 'y': up and down
    seam: 0.5,                                 // where the seam cuts (share of the content), or { x, y0, y1 } in film px
    open: 1,                                   // doors: 1 the halves leave the window; 0.5 each covers half its side
    run: 0.26,                                 // share of p the seam (or the caret's run) takes
    seamWidth: null,                           // null: 3 in a window, 6 (with a 2 px key) in a pane
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL, key: '#F3F2EE', bench: '#15171A' },
  },
  prepare(P) {
    if (P.pane) return null;
    const W = windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = contentOf(W);
    const A = assetOf(P.from.asset, () => placeholderPage(2000, 1125));
    const B = assetOf(P.to.asset, () => placeholderPage(2000, 1300));
    return { W, R, A, B, vA: coverView(A, R, P.from.focus), vB: coverView(B, R, P.to.focus) };
  },
  rest(side, P) {
    if (!P.caret) return side === 'from' ? { seam: 0, u: 0 } : { seam: 1, u: 1 };
    const L = lineOf(P), w = seamW(P);
    return side === 'from'
      ? { x: P.caret.x, cy: P.caret.y, h: P.caret.h, w: P.caret.w, drawer: 0, open: false, u: 0 }
      : { x: L.x, cy: (L.y0 + L.y1) / 2, h: L.y1 - L.y0, w, drawer: 1, open: true, u: 1 };
  },
  at(p, P) {
    if (!P.caret) return { seam: cubicInOut(seg(p, 0, P.run)), u: cubicInOut(seg(p, P.run, 1)) };
    const L = lineOf(P), u = cubicInOut(seg(p, 0, P.run)), v = cubicInOut(seg(p, P.run, 1));
    return {
      x: lerp(P.caret.x, L.x, u), cy: lerp(P.caret.y, (L.y0 + L.y1) / 2, u),
      h: lerp(P.caret.h, L.y1 - L.y0, u), w: lerp(P.caret.w, seamW(P), u), drawer: v, open: p >= P.run, u: v,
    };
  },
  paint(ctx, S, P, D) {
    if (P.pane) paintPane(ctx, S, P);
    else paintWindow(ctx, S, P, D);
  },
  track: (S, P, D) => {
    if (P.caret) return [[S.x, S.cy - S.h / 2], [S.x, S.cy + S.h / 2], P.pane ? [P.pane.x + S.drawer * P.pane.w, 540] : [S.x, S.cy]];
    if (P.pane) {
      const L = lineOf(P), T = seamRect(S, P);
      return horiz(L) ? [[T.x + T.h / 2, T.cy], [L.x0, P.pane.y + S.u * P.pane.h]] : [[T.x, T.cy + T.h / 2], [P.pane.x + S.u * P.pane.w, 540]];
    }
    const W = D.W, R = D.R, X = P.axis === 'x';
    const cut = X ? W.x + R.w * P.seam : R.y + R.h * P.seam;
    const span = X ? [cut - W.x, W.x + W.w - cut] : [cut - W.y, W.y + W.h - cut];
    const d0 = -span[0] * P.open * S.u, d1 = span[1] * P.open * S.u;
    return X ? [[cut + d0, W.y], [cut + d1, W.y], [cut, R.y + R.h * S.seam]] : [[W.x, cut + d0], [W.x, cut + d1], [R.x + R.w * S.seam, cut]];
  },
};

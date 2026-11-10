// match-cut — a graphic match between two sources that print the same thing: the camera pushes in on the value in
// the current asset until it sits at a given place and height, holds, and on one frame the window's content and title
// cut to the next asset, framed so that its own printing of the value sits at exactly the same place and height; the
// ring round the value does not move across the cut. Then the camera pulls back to the next asset's rest view. The
// cut falls where both sides are still (each push eases out into the match and the pull eases out of it), so no
// motion blur spans it and the two contents are never mixed. Zooms never pass the sharpness cap (asset.js MAX_SCALE).
// Theory: the graphic match of film editing ("shapes, colors, lines … in the two shots are similar", Bordwell &
// Thompson, Film Art); the ring is the persistent element (object constancy, Heer & Robertson 2007); the same value in
// two official sources is the claim's proof (principle 2). Sources: match cuts in editing (2001's bone to satellite);
// HyperFrames `extended-keyframe` timing (named, not copied).

import { seg, cubicInOut, lerp } from './util.js';
import { NEUTRAL, MAX_SCALE, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow, view, zoomBetween, toScreen, ring } from './asset.js';
import { coverView, paintView } from './stage.js';

export default {
  name: 'match-cut',
  tier: 'T1',
  beats: 2,
  modes: ['every mode with two sources of one value', 'dossier (exhibit to exhibit)', 'phosphor', 'tally'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent'],
  from: 'an asset in a window, a printed value in it ringed',
  to: 'another asset in the same window, its printing of the same value ringed',
  interpolates: ['push in (log zoom, ease in-out) to the matched view', 'cut on one frame (content and title)', 'pull back to the rest view', 'ring (one rect at the match)'],
  summary: 'Push in on a value, cut on a still frame to the same value printed in the next source at the same place and size, pull back.',
  theory: 'The graphic match of film editing (Bordwell & Thompson, Film Art); the ring persists across the cut (Heer & Robertson 2007); one value, two sources (principle 2).',
  defaults: {
    window: { x: 240, y: 132, w: 1440, h: 810 },
    from: { asset: null, title: 'example.com/table', focus: null, box: [900, 520, 120, 40] },
    to: { asset: null, title: 'example.com/chart', focus: null, box: [1100, 640, 140, 44] },
    match: { cx: 960, cy: 560, h: 30 },        // where (film px) and how tall the matched box is at the cut
    cut: 0.5, hold: 0.04,
    ringPad: 12,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const W = windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = contentOf(W);
    const side = (s, n) => {
      const A = assetOf(s.asset, () => placeholderPage(2000, 1125 + 150 * n));
      return { A, v0: coverView(A, R, s.focus), box: s.box, title: s.title };
    };
    const a = side(P.from, 0), b = side(P.to, 1);
    // the matched height: as asked, but no side zoomed past the cap
    const h = Math.min(P.match.h, a.box[3] * MAX_SCALE, b.box[3] * MAX_SCALE);
    const matched = (s) => {
      const k = h / s.box[3], [x, y, w, bh] = s.box;
      return view(k, P.match.cx - (x + w / 2) * k, P.match.cy - (y + bh / 2) * k);
    };
    a.v1 = matched(a); b.v1 = matched(b);
    const wa = a.box[2] * (h / a.box[3]), wb = b.box[2] * (h / b.box[3]);
    const common = { x: P.match.cx - Math.max(wa, wb) / 2, y: P.match.cy - h / 2, w: Math.max(wa, wb), h };
    if (typeof console !== 'undefined') console.log(`match-cut: matched height ${h.toFixed(1)} px, zoom ${(a.v1.a / a.v0.a).toFixed(2)}× / ${(b.v1.a / b.v0.a).toFixed(2)}× (scales ${a.v1.a.toFixed(3)}, ${b.v1.a.toFixed(3)} ≤ ${MAX_SCALE.toFixed(3)})`);
    return { W, R, a, b, common };
  },
  rest(side) { return side === 'from' ? { b: 0, u: 0 } : { b: 1, u: 0 }; },
  at(p, P) {
    if (p < P.cut) return { b: 0, u: cubicInOut(seg(p, 0, P.cut - P.hold)) };
    return { b: 1, u: 1 - cubicInOut(seg(p, P.cut + P.hold, 1)) };
  },
  ringRect(S, D) {
    const s = S.b ? D.b : D.a, v = zoomBetween(s.v0, s.v1, S.u), r = toScreen(v, s.box);
    // widen toward the common ring as the match approaches, so the ring is one rect on both sides of the cut
    const w = lerp(r.w, D.common.w * (v.a / s.v1.a), S.u);
    return { x: r.x + r.w / 2 - w / 2, y: r.y, w, h: r.h };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, s = S.b ? D.b : D.a, v = zoomBetween(s.v0, s.v1, S.u);
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    windowBack(ctx, D.W, P);
    ctx.save(); clipWindow(ctx, D.W); paintView(ctx, s.A, v, D.R);
    ctx.beginPath(); ctx.rect(D.R.x, D.R.y, D.R.w, D.R.h); ctx.clip();
    ring(ctx, this.ringRect(S, D), P, { pad: P.ringPad, radius: 10, width: 3 });
    ctx.restore();
    windowFront(ctx, D.W, P, { title: s.title });
  },
  track(S, P, D) {
    const r = this.ringRect(S, D);
    return [[r.x, r.y], [r.x + r.w, r.y + r.h]];
  },
};

// scroll-reel — one very long vertical strip (a whole web page, a README, or several assets stacked as one scroll)
// travels through a still window like a page flicked on a trackpad, and stops exactly on the next section at the
// window's reading line. The page never changes; only its offset does (and, while fast, its scale). Options, each
// independent:
//   curve      'flick' (default): the content accelerates for `flick.ramp` of the move, is let go at its peak speed and
//              coasts on exponential friction to an exact stop; 'momentum': a flick that reaches speed within a frame
//              or two and brakes by itself (velocity ∝ e^(−kp) − e^(−(k+rise)p)); 'fling': accelerates, peaks a sixth
//              of the way in, brakes softly (velocity ∝ p² e^(−kp); scroll-fling's curve)
//   pull       speed-dependent pull-back: content scale 1 − pull · (speed / peak)^pullExp, back to the rest fit exactly
//              as the speed reaches zero, never above the rest fit (itself capped at asset.js MAX_SCALE); 0 turns it off
//   scrollbar  a bar on the window's edge shows how long the reel is and where it is; the target is ticked in the accent
//   to.mark    a ring draws round the landed section as it settles
//   sections   sticky section headings: each heading that reaches the top of the window stays there, pinned, while its
//              section passes under it; the next one pushes it out (a pure function of the offset, so they unpin in
//              reverse when the page goes back). A tab is the heading's own pixels unless `sections.tab` draws it
//   chrome     true: a window with a title bar naming the source of the item at the reading line; false: a bare
//              viewport (the page's own frame is the film's)
//   page       a painter instead of assets: page(ctx, off, P, R) draws the content rect R for an offset `off` (film px
//              of the page at the rect's top); `length` (film px) sizes the scrollbar
// Motion blur is speed-gated (vertical). Theory: momentum scrolling decays exponentially per unit time (touch scroll
// views: the velocity is multiplied by a deceleration rate every millisecond); speed-dependent automatic zooming keeps
// a long document scroll legible (Igarashi & Hinckley 2000); the cue at the landing place directs attention before
// the content arrives (Posner 1980); sticky section headers keep the chapter in view (principle 7); motion streaks
// record real speed (Geisler 1999).
//
// `from` / `to`: { item, y } (image px of that item at the reading line; `to.mark` an image px box to ring), or a
// number: the offset in film px with 0 = the strip's top at the window's top (as a long page's scroll position).
// Helpers for films that move a page themselves: momentum(p, k, rise), fling(p, k) (positions 0 → 1, exact at both
// ends), paintPage(ctx, off, { view, colors }, { A }) (a tall asset at the view's width, offset `off`).

import { seg, cubicInOut, clamp } from './util.js';
import { NEUTRAL, MAX_SCALE, assetOf, windowOf, contentOf, windowBack, windowFront, clipWindow, ring } from './asset.js';
import { flick, flickVel, placeholderLong } from './stage.js';

// the momentum flick: v(p) ∝ e^(−kp) − e^(−(k+r)p), normalised so x(0) = 0 and x(1) = 1 exactly
export const momentum = (p, k = 6.5, r = 40) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const F = (q) => (1 - Math.exp(-k * q)) / k - (1 - Math.exp(-(k + r) * q)) / (k + r);
  return F(p) / F(1);
};
const momentumVel = (p, k = 6.5, r = 40) => {                 // 1 at the peak
  const v = (q) => Math.exp(-k * q) - Math.exp(-(k + r) * q);
  return v(clamp(p)) / v(Math.log((k + r) / k) / r);
};
// the fling: v(p) ∝ p² e^(−kp), peak at p = 2 / k
export const fling = (p, k = 12) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const F = (q) => (2 - Math.exp(-k * q) * (k * k * q * q + 2 * k * q + 2)) / (k * k * k);
  return F(p) / F(1);
};
const flingVel = (p, k = 12) => { const q = clamp(p) * (k / 2); return q * q * Math.exp(2 - 2 * q); };

// A tall asset scaled to the view's width, drawn into the view for an offset (film px from the page's top).
export const paintPage = (ctx, off, P, D) => {
  const V = P.view, A = D.A, s = V.w / A.crop[2];
  ctx.save();
  ctx.beginPath(); ctx.rect(V.x, V.y, V.w, V.h); ctx.clip();
  ctx.fillStyle = P.colors.ground; ctx.fillRect(V.x, V.y, V.w, V.h);
  const sy = A.crop[1] + off / s, sh = V.h / s;
  const y0 = Math.max(A.crop[1], sy), y1 = Math.min(A.crop[1] + A.crop[3], sy + sh);
  if (y1 > y0) ctx.drawImage(A.image, A.crop[0], y0, A.crop[2], y1 - y0, V.x, V.y + (y0 - sy) * s, V.w, (y1 - y0) * s);
  ctx.restore();
};

const position = (p, P) => {
  if (P.curve === 'momentum') return momentum(p, P.momentum.k, P.momentum.rise);
  if (P.curve === 'fling') return fling(p, P.fling.k);
  return flick(p, P.flick.ramp, P.flick.k);
};
const velocity = (p, P) => {
  if (P.curve === 'momentum') return momentumVel(p, P.momentum.k, P.momentum.rise);
  if (P.curve === 'fling') return flingVel(p, P.fling.k);
  return flickVel(p, P.flick.ramp, P.flick.k);
};

export default {
  name: 'scroll-reel',
  tier: 'T1',
  beats: 3,
  modes: ['scroll (the through-line: every move along the sheet)', 'handset (inside the screen)', 'dossier (a long exhibit)', 'exhibit (a long print)', 'every mode with a long page'],
  roles: ['ground', 'panel', 'line', 'dim', 'accent'],
  from: 'a long page (or a stack of assets) in a still window, read at one section',
  to: 'the same window, the page scrolled to another section, landed exactly at the reading line (ringed, its heading pinned)',
  interpolates: ['strip offset (flick, momentum or fling: an exact stop)', 'content scale (speed-dependent pull-back, 1 at rest)', 'scrollbar thumb', 'pinned section tabs', 'ring draw-on'],
  summary: 'A long page is flicked through a still window, pulls back while fast, and coasts to an exact stop on the next section; headings pin as chapters.',
  theory: 'Momentum scrolling decays exponentially (touch scroll views); speed-dependent automatic zooming (Igarashi & Hinckley 2000) keeps a long scroll legible; sticky headers keep the chapter in view; the target cue (Posner 1980).',
  defaults: {
    items: [{ asset: null, title: 'example.com/post' }],   // stacked top to bottom, each at the window width (capped)
    asset: null,                               // one asset: shorthand for items: [{ asset, title }]
    page: null, length: null,                  // a painter instead of assets, and its length in film px
    gap: 0,                                    // film px between stacked items (a hairline divider is drawn in it)
    title: 'example.com/post',
    window: { x: 340, y: 84, w: 1240, h: 880 }, // content rect (the bar sits above y when chrome is on)
    chrome: true,
    from: { item: 0, y: 0 },                   // image px of that item that sits at the reading line, or a number
    to: { item: 0, y: 4800, mark: null },      // and at the end; mark: image px box ringed on landing
    line: 36,                                  // the reading line, film px below the content's top
    curve: 'flick',
    flick: { ramp: 0.1, k: 5 },                // release at 10 % of the move, 5 e-foldings of friction after it
    momentum: { k: 6.5, rise: 40 },            // friction e-foldings; how fast it reaches speed (40: 2.5 % of the move)
    fling: { k: 12 },
    pull: 0.32, pullExp: 0.8,                  // content scale 1 − pull · (speed / peak)^pullExp
    scrollbar: true,
    sections: null,                            // { heads: [{ item, y, h }] (image px; film px with `page`), tab, rule }
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const W = P.chrome === false ? null : windowOf(P.window.x, P.window.y, P.window.w, P.window.h);
    const R = W ? contentOf(W) : { x: P.window.x, y: P.window.y, w: P.window.w, h: P.window.h };
    let top = 0;
    const list = P.page ? [] : P.asset ? [{ asset: P.asset, title: P.title }] : P.items;
    const items = list.map((it) => {
      const A = assetOf(it.asset, () => placeholderLong(1600, 7200));
      const a = Math.min(R.w / A.crop[2], MAX_SCALE);          // rest fit, never past the sharpness cap
      const w = A.crop[2] * a, h = A.crop[3] * a;
      const o = { A, a, x: (R.w - w) / 2, top, w, h, title: it.title || P.title };
      top += h + P.gap;
      return o;
    });
    const stripH = P.page ? P.length || 0 : top - P.gap;
    const yOf = (ref) => { const it = items[ref.item || 0]; return it ? it.top + (ref.y - it.A.crop[1]) * it.a : ref.y; };
    const sOf = (ref) => (typeof ref === 'number' ? ref + P.line : yOf(ref));
    const s0 = sOf(P.from), s1 = sOf(P.to);
    const it1 = typeof P.to === 'number' ? null : items[P.to.item || 0];
    const mark = it1 && P.to.mark ? { x: it1.x + (P.to.mark[0] - it1.A.crop[0]) * it1.a, y: it1.top + (P.to.mark[1] - it1.A.crop[1]) * it1.a, w: P.to.mark[2] * it1.a, h: P.to.mark[3] * it1.a } : null;
    const heads = P.sections ? P.sections.heads.map((hd) => { const it = items[hd.item || 0]; return { y: yOf(hd), h: it ? hd.h * it.a : hd.h }; }) : null;
    return { W, R, items, stripH, s0, s1, mark, heads };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    return {
      s: D.s0 + (D.s1 - D.s0) * position(p, P),
      k: 1 - P.pull * Math.pow(velocity(p, P), P.pullExp) * (p > 0 && p < 1 ? 1 : 0),
      ring: cubicInOut(seg(p, 0.86, 1)),
    };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, R = D.R, cx = R.x + R.w / 2, ly = R.y + P.line;
    // strip px → film px: the reading line is the zoom's fixed point
    const X = (x) => cx + (x - R.w / 2) * S.k, Y = (y) => ly + (y - S.s) * S.k;
    // the content between screen rows ya and yb for a mapping Yf of strip px (returns the item at the reading line)
    const content = (Yf, ya, yb) => {
      if (P.page) {
        const off = (ya - Yf(0)) / S.k;                         // strip px at ya
        ctx.save();
        ctx.translate(cx, ya); ctx.scale(S.k, S.k); ctx.translate(-cx, -R.y);
        P.page(ctx, off, P, R);
        ctx.restore();
        return null;
      }
      let atLine = D.items[0];
      for (const it of D.items) {
        const y0 = Yf(it.top), y1 = Yf(it.top + it.h);
        if (it.top <= S.s) atLine = it;
        if (y1 < ya || y0 > yb) continue;
        const [sx, sy, sw, sh] = it.A.crop;
        // draw only the source rows that are on screen (a 12 000 px page is not drawn whole every frame)
        const ta = Math.max(0, (ya - y0) / (y1 - y0)), tb = Math.min(1, (yb - y0) / (y1 - y0));
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(it.A.image, sx, sy + sh * ta, sw, sh * (tb - ta), X(it.x), y0 + (y1 - y0) * ta, it.w * S.k, (y1 - y0) * (tb - ta));
        if (P.gap > 0 && it !== D.items[D.items.length - 1]) { ctx.fillStyle = C.line; ctx.fillRect(R.x, Yf(it.top + it.h + P.gap / 2) - 1, R.w, 2); }
      }
      return atLine;
    };
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (D.W) windowBack(ctx, D.W, P);
    ctx.save();
    if (D.W) clipWindow(ctx, D.W); else { ctx.fillStyle = C.ground; ctx.fillRect(R.x, R.y, R.w, R.h); }
    ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
    const atLine = content(Y, R.y, R.y + R.h);
    // sticky headings: a heading above the window's top stays pinned there until the next one pushes it out
    if (D.heads) D.heads.forEach((hd, i) => {
      if (Y(hd.y) >= R.y) return;
      const next = D.heads[i + 1], h = hd.h * S.k;
      const y = next ? Math.min(R.y, Y(next.y) - h) : R.y;
      if (y + h <= R.y) return;
      ctx.save(); ctx.beginPath(); ctx.rect(R.x, y, R.w, h); ctx.clip();
      if (P.sections.tab) P.sections.tab(ctx, i, y, P, { x: R.x, w: R.w, h, k: S.k });
      else content((v) => y + (v - hd.y) * S.k, y, y + h);
      ctx.restore();
      if (P.sections.rule !== false) { ctx.fillStyle = C.line; ctx.fillRect(R.x, y + h - 1, R.w, 2); }
    });
    if (D.mark && S.ring > 0) ring(ctx, { x: X(D.mark.x), y: Y(D.mark.y), w: D.mark.w * S.k, h: D.mark.h * S.k }, P, { pad: 10, radius: 12, width: 3, draw: S.ring });
    if (P.scrollbar && D.stripH > 0) {
      const tx = R.x + R.w - 16, t0 = R.y + 18, tl = R.h - 36;
      ctx.fillStyle = C.line; ctx.fillRect(tx, t0, 6, tl);
      const vis = R.h / S.k, top = S.s - P.line / S.k;
      const th = Math.max(28, (vis / D.stripH) * tl), ty = t0 + clamp(top / (D.stripH - vis)) * (tl - th);
      ctx.fillStyle = C.dim; ctx.fillRect(tx, ty, 6, th);
      ctx.fillStyle = C.accent; ctx.fillRect(tx - 8, t0 + clamp((D.s1 - P.line) / (D.stripH - R.h)) * (tl - th) + th / 2 - 2, 22, 4);
    }
    ctx.restore();
    if (D.W) windowFront(ctx, D.W, P, { title: atLine ? atLine.title : P.title });
  },
  track: (S, P, D) => {
    const R = D.R, cx = R.x + R.w / 2, ly = R.y + P.line;
    const X = (x) => cx + (x - R.w / 2) * S.k, Y = (y) => ly + (y - S.s) * S.k;
    return [[X(0), Y(S.s)], [X(0), Y(S.s + 600)], [X(R.w), Y(S.s - 600)]];
  },
};

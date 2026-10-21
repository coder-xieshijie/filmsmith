// moves.js — Handset's pluggable moves. The device never moves except for one turn; the screen's content moves, and
// mostly vertically. Each role is filled by an adapter over a hand-off module; the choreography (choreo.js) reads only
// an adapter's `beats` and `device`, so a swapped move keeps every timing check, and film.js and score.mjs call only the
// functions below. `content.moves = { scroll: 'page-scroll' }` picks another adapter for a role.
//
//   push    the viewport moves to a region of the same capture (a push in, a pull back, a pan)
//           curve(p) → u, 0..1 along the log-zoom path between the two views (asset.js zoomBetween)
//   hop     the light moves from one band region to the next on a still capture
//           band(p, [y0, h0], [y1, h1]) → [y, h] in source px
//   scroll  the page travels under the glass to another stop of the same capture (T2)
//           viewAt(p, env) → the view (asset.js `view`: screen = a · img + b) at p; env: { from, to } views, `public`
//           (the capture's public region), `screen` { w, h }. film.js draws the screen through it, so only the public
//           region is ever drawn and the light, the ring and the level rail follow the page exactly
//   feed    the next capture rises from below the screen over the current one, which steps back (T2)
//           paint(g, p, env) inside the screen (origin top-left, clipped); env: { w, h, colors, draw(g, side, rect, dim) }
//           where draw paints the 'from' or 'to' capture, as it stands at rest, into rect, veiled by dim (0..1)
//           track(p, env) → screen points, for the motion blur
//   flip    the surface changes by turning the whole device, once a film at most (T2)
//           paint(g, p, env), track(p, env), swap (the p of the content change); env: { faces: [from, to] canvases of
//           the whole device, box (frame px), screen (inside the box), colors, variant: 'right' | 'left' }
//
// At p = 0 and p = 1 an adapter must draw exactly what the template draws on either side, or the move pops.
// Adding a transition (TEMPLATE.md, Moves): put the module in lib/handoffs/ (or keep it in the film), then add an entry
// to ADAPTERS[role] below with its device name (T2 roles), beats and the functions of the role.
import { cubicInOut, lerp, clamp } from './lib/motion.js';
import { view, zoomBetween } from './lib/handoffs/asset.js';
import viewportPush from './lib/handoffs/viewport-push.js';
import spotlightBand from './lib/handoffs/spotlight-band.js';
import scrollReel from './lib/handoffs/scroll-reel.js';
import feedStack from './lib/handoffs/feed-stack.js';
import deviceFlip from './lib/handoffs/device-flip.js';

// ---------------------------------------------------------------- scroll-reel inside the screen
// The module's own motion, window-less: chrome off, no scrollbar, no ring (the template rings), the reading line at the
// screen's top, the capture's public region as the page at the screen's width. Its state { s, k } (offset along the
// page in film px, and the speed pull-back scale) is turned back into a view of the capture.
const reelParams = (env) => ({
  ...scrollReel.defaults,
  chrome: false, scrollbar: false, ground: false, line: 0, curve: 'flick', pull: 0.32,
  window: { x: 0, y: 0, w: env.screen.w, h: env.screen.h },
  asset: { image: { width: env.public[0] + env.public[2], height: env.public[1] + env.public[3] }, crop: env.public },
  from: (env.from.by / -env.from.a - env.public[1]) * env.from.a,      // film px of the page above the screen's top
  to: (env.to.by / -env.to.a - env.public[1]) * env.to.a,
});
const reelView = (p, env) => {
  const P = reelParams(env), D = scrollReel.prepare(P), S = scrollReel.at(p, P, D), a0 = D.items[0].a, R = D.R;
  const a = a0 * S.k;
  return view(a, R.w / 2 - (R.w / 2) * S.k - env.public[0] * a, P.line - S.s * S.k - env.public[1] * a);
};

// ---------------------------------------------------------------- feed-stack inside the screen
// The module's motion (the new card's landing spring, at()) and its deck (the current card steps back: a step smaller
// about its top centre, raised by the peek, veiled). Window-less: the cards are the captures themselves, edge to edge
// with the screen, no title bar and no shadow (mode principle 2: code never draws a window).
const FEED = { peek: 34, scale: 0.05, veil: 0.4 };
const feedCards = (p, env) => {
  const u = feedStack.at(p).u, s = 1 - FEED.scale * u, w = env.w * s, h = env.h * s;
  return {
    u,
    back: { x: (env.w - w) / 2, y: -FEED.peek * u, w, h, dim: clamp(FEED.veil * u, 0, 0.85) },
    front: { x: 0, y: lerp(env.h + 24, 0, u), w: env.w, h: env.h, dim: 0 },
  };
};

// ---------------------------------------------------------------- device-flip
const flipParams = (env) => ({
  window: { cx: env.box.x + env.box.w / 2, cy: env.box.y + env.box.h / 2 },
  perspective: 2200, shade: 0.6, strips: 120, ground: false,
  colors: { ground: env.colors.bg, line: env.colors.lidEdge },
});
// device-flip turns one way; 'left' mirrors its angle, so the device turns the other way about the same axis
const flipState = (p, variant) => { const S = deviceFlip.at(p); return variant === 'left' ? { ...S, th: -S.th } : S; };

export const ADAPTERS = {
  push: {
    'viewport-push': {
      beats: 1,
      curve: (p) => viewportPush.at(p * 0.8).u,              // the module's curve: the move takes 0.8 of its window
    },
  },
  hop: {
    'spotlight-band': {
      beats: 1,
      band: (p, from, to) => { const S = spotlightBand.at(p, { from: { band: [0, from[0], 0, from[1]] }, to: { band: [0, to[0], 0, to[1]] } }); return [S.y, S.h]; },
    },
  },
  scroll: {
    'scroll-reel': {
      device: 'scroll-reel', beats: 2,                       // the module's 3 beats cut to 2: a T2 move is at most 2 beats
      viewAt: reelView,
    },
    // the template's first scroll (2026-10-21, before scroll-reel was in the runtime): one cubic in-out, no pull-back
    'page-scroll': {
      device: 'page-scroll', beats: 2,
      viewAt: (p, env) => zoomBetween(env.from, env.to, cubicInOut(p)),
    },
  },
  feed: {
    'feed-stack': {
      device: 'feed-stack', beats: 1,                        // the module's 1.5 beats cut to 1, so the card lands on a beat
      paint(g, p, env) {
        const c = feedCards(p, env);
        env.draw(g, 'from', c.back, c.back.dim);
        if (c.u > 0) env.draw(g, 'to', c.front, 0);
      },
      track(p, env) {
        const c = feedCards(p, env), R = (r) => [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]];
        return [...R(c.back), ...R(c.front)];
      },
    },
  },
  flip: {
    'device-flip': {
      device: 'device-flip', beats: 2, swap: 0.433,
      paint: (g, p, env) => deviceFlip.paint(g, flipState(p, env.variant), flipParams(env), { faces: env.faces, W: env.box.w, H: env.box.h }),
      track: (p, env) => deviceFlip.track(flipState(p, env.variant), flipParams(env), { faces: env.faces, W: env.box.w, H: env.box.h }),
    },
  },
};

export const DEFAULTS = { push: 'viewport-push', hop: 'spotlight-band', scroll: 'scroll-reel', feed: 'feed-stack', flip: 'device-flip' };

// moveOf(content, role) → the adapter content.moves picks for the role, or the default; an unknown id throws.
export const moveOf = (content, role) => {
  const id = content?.moves?.[role] ?? DEFAULTS[role];
  const a = ADAPTERS[role]?.[id];
  if (!a) throw new Error(`moves.${role}: '${id}' is not in moves.js ADAPTERS.${role} (${Object.keys(ADAPTERS[role] ?? {}).join(', ')})`);
  return { id, ...a };
};

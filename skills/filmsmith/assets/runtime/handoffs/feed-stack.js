// feed-stack — the next asset slides up from below the frame over the current one, like the next post in a vertical
// feed, and the current one is pushed back into a deck: it rises a little, shrinks a step and dims, so its top edge
// stays visible above the new card. Earlier cards already in the deck step back with it. One motion (the new card's
// rise, a landing spring) drives everything; the deck keeps the order of what was seen.
// Theory: a stack keeps history in view (the previous item does not vanish, it recedes), so the sequence reads as a
// sequence (object permanence of the replaced item; depth cues from size and occlusion, Cutting & Vishton 1995);
// vertical paging is the native gesture of a phone feed. Sources: vertical feed paging of phone apps, notification
// stacks, HyperFrames `notification-cascade` / `spring-stack-shuffle` (named, not copied).

import { seg, settle, clamp, lerp } from './util.js';
import { NEUTRAL, BAR, assetOf, placeholderPage, windowOf, contentOf, windowBack, windowFront, clipWindow, veil } from './asset.js';
import { coverView, paintView, castShadow, rectCorners } from './stage.js';

const level = (W0, d, P) => {
  // the window at deck depth d (0 = front): scaled about its top centre, raised by peek per level
  const s = 1 - P.deck.scale * d, cx = W0.x + W0.w / 2;
  return { x: cx - (W0.w * s) / 2, y: W0.y - P.deck.peek * d, w: W0.w * s, h: W0.h * s, bar: W0.bar * s, r: W0.r * s, s };
};

export default {
  name: 'feed-stack',
  tier: 'T1',
  beats: 1.5,
  modes: ['handset', 'dossier (sheets dealt onto the pile)', 'pulse', 'every mode with a run of screens'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'one asset as the front card (earlier ones as edges of a deck behind it)',
  to: 'the next asset as the front card; the previous one a step back in the deck, its top edge showing',
  interpolates: ['new card y (from below the frame, landing spring)', 'deck depth of every earlier card (scale, rise, veil)'],
  summary: 'The next screen slides up over the current one like the next post in a feed; the current one steps back into a deck.',
  theory: 'Recede, not vanish: the deck keeps the sequence visible (size and occlusion as depth cues, Cutting & Vishton 1995); the feed gesture of a phone.',
  defaults: {
    from: { asset: null, title: 'example.com/1', focus: null },
    to: { asset: null, title: 'example.com/2', focus: null },
    behind: 1,                                 // earlier cards in the deck behind `from`: a count, or [{ title }] nearest first (their bars show)
    card: { x: 360, y: 150, w: 1200, h: 840 }, // the front card's content rect (its bar sits above y)
    deck: { peek: 34, scale: 0.05, veil: 0.4, maxShown: 3 },
    shadow: true,
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const W0 = windowOf(P.card.x, P.card.y - BAR, P.card.w, P.card.h);
    const mk = (c, n) => {
      const A = assetOf(c.asset, () => placeholderPage(2000, 1400 + 120 * n));
      return { A, title: c.title, focus: c.focus };
    };
    return { W0, cards: [mk(P.from, 0), mk(P.to, 1)] };
  },
  rest(side) { return { u: side === 'from' ? 0 : 1 }; },
  at(p) { return { u: settle(seg(p, 0, 1), 8) }; },
  paint(ctx, S, P, D) {
    const C = P.colors, u = S.u;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    // earlier cards: edges of the deck (drawn as empty windows, the deepest first)
    const prev = Array.isArray(P.behind) ? P.behind : Array.from({ length: P.behind }, () => ({}));
    const n = Math.min(prev.length, P.deck.maxShown);
    for (let k = n; k >= 1; k--) {
      const d = k + u;
      if (d > P.deck.maxShown + 0.999) continue;
      const W = level(D.W0, d, P);
      if (P.shadow) castShadow(ctx, W, { radius: W.r, alpha: 0.4 });
      windowBack(ctx, W, P);
      windowFront(ctx, W, P, { title: prev[k - 1].title || '' });
      ctx.save(); clipWindow(ctx, W); veil(ctx, W, P, clamp(P.deck.veil * d, 0, 0.85)); ctx.restore();
    }
    const card = (c, W, dim) => {
      if (P.shadow) castShadow(ctx, W, { radius: W.r, alpha: 0.4 });
      windowBack(ctx, W, P);
      const R = contentOf(W);
      ctx.save(); clipWindow(ctx, W); paintView(ctx, c.A, coverView(c.A, R, c.focus), R); ctx.restore();
      windowFront(ctx, W, P, { title: c.title });
      if (dim > 0) { ctx.save(); clipWindow(ctx, W); veil(ctx, W, P, dim); ctx.restore(); }
    };
    // the current card steps back one level as the new one rises over it
    const WA = level(D.W0, u, P);
    card(D.cards[0], WA, clamp(P.deck.veil * u, 0, 0.85));
    if (u > 0) {
      const y = lerp(1080 + 24, D.W0.y, u);
      card(D.cards[1], { ...D.W0, y }, 0);
    }
  },
  track: (S, P, D) => {
    const WA = level(D.W0, S.u, P), y = lerp(1080 + 24, D.W0.y, S.u);
    return [...rectCorners(WA), ...rectCorners({ ...D.W0, y })];
  },
};

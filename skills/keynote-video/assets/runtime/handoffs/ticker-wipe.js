// ticker-wipe — a broadcast ticker band drops from the top of the frame to its foot and wipes the next asset in above
// it (the current asset stays below the band until the band passes, so the change is always hidden under the band);
// inside the band the crawl carries one item: the current asset's source leaves to the left and the next one's slides
// in, braking to a stop at the left margin as the band lands at the foot, where it stays as the next asset's caption.
// The crawl is a constant-rate process (allowed at constant speed) that brakes linearly to zero; the band lands on a
// landing spring.
// Theory: occlusion hides the cut (Kanizsa 1979, as occluder-pass); the news crawl of broadcast graphics as the carrier
// of text (one item replaces the last, the reading direction is the motion direction); the caption ends where the
// next scene reads it (principle 4: the next state grows out of the current one). Sources: broadcast lower-third
// crawls; HyperFrames `news-ticker`, `ticker-takeover` (named, not copied).

import { seg, settle, measure, text, scratch } from './util.js';
import { NEUTRAL, assetOf, placeholderPage } from './asset.js';
import { coverView, paintView } from './stage.js';

export default {
  name: 'ticker-wipe',
  tier: 'T1',
  beats: 2,
  modes: ['pulse', 'phosphor', 'plakat', 'every mode whose scenes carry a source line'],
  roles: ['ground', 'panel', 'line', 'ink', 'dim', 'accent'],
  from: 'an asset filling the frame (or a rect)',
  to: 'the next asset filling the frame, a caption band at its foot naming its source',
  interpolates: ['band y (top to foot, landing spring): the wipe edge', 'crawl x (constant, then braking to the margin)'],
  summary: 'A ticker band drops down the frame wiping in the next asset; its crawl carries the next source in and stops as the caption.',
  theory: 'The band hides the change (Kanizsa 1979); the crawl carries the text in the reading direction; the caption lands where the next scene reads it (principle 4).',
  defaults: {
    from: { asset: null, focus: null, label: 'EXAMPLE.COM / A' },
    to: { asset: null, focus: null, label: 'EXAMPLE.COM / B' },
    rect: { x: 0, y: 0, w: 1920, h: 1080 },
    band: { h: 128, size: 52, weight: 600, x: 112, sep: '   —   ' },
    land: 0.78,                                // share of p the band's drop takes (landing spring)
    brake: 0.4,                                // the crawl brakes from here to p = 1
    font: { family: 'sans-serif', weight: 600 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const A = assetOf(P.from.asset, () => placeholderPage(1920, 1080));
    const B = assetOf(P.to.asset, () => placeholderPage(1920, 1200));
    const f = { ...P.font, weight: P.band.weight, size: P.band.size };
    const wA = measure(scratch(), P.from.label + P.band.sep, f).width;
    return { A, B, vA: coverView(A, P.rect, P.from.focus), vB: coverView(B, P.rect, P.to.focus), f, dist: wA };
  },
  rest(side) { return side === 'from' ? { y: 0, c: 0 } : { y: 1, c: 1 }; },
  at(p, P) {
    const b = P.brake, T = b + (1 - b) / 2;
    const c = p <= b ? p / T : (b + ((1 - b) ** 2 - (1 - p) ** 2) / (2 * (1 - b))) / T;
    return { y: settle(seg(p, 0, P.land), 8), c };
  },
  paint(ctx, S, P, D) {
    const C = P.colors, R = P.rect, h = P.band.h;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    const top = R.y - h + (R.h) * S.y;                  // band top: from just above the rect to its foot (R.y + R.h − h)
    // above the band: the next asset; below it: the current one
    if (top > R.y) paintView(ctx, D.B, D.vB, { x: R.x, y: R.y, w: R.w, h: Math.min(R.h, top - R.y) });
    if (top + h < R.y + R.h) paintView(ctx, D.A, D.vA, { x: R.x, y: top + h, w: R.w, h: R.y + R.h - top - h });
    if (S.y <= 0) return;
    ctx.fillStyle = C.panel; ctx.fillRect(R.x, top, R.w, h);
    ctx.fillStyle = C.line; ctx.fillRect(R.x, top, R.w, 2); ctx.fillRect(R.x, top + h - 2, R.w, 2);
    // the slug: a fixed accent tick at the band's left; the crawl runs to its right and passes under its edge
    ctx.fillStyle = C.accent; ctx.fillRect(R.x + P.band.x - 40, top + h / 2 - 22, 8, 44);
    ctx.save(); ctx.beginPath(); ctx.rect(R.x + P.band.x - 16, top, R.w - P.band.x + 16, h); ctx.clip();
    const x0 = R.x + P.band.x + D.dist * (1 - S.c), base = top + h / 2 + P.band.size * 0.36;
    text(ctx, P.from.label, x0 - D.dist, base, D.f, { color: C.dim });
    text(ctx, P.band.sep, x0 - measure(ctx, P.band.sep, D.f).width, base, D.f, { color: C.dim });
    text(ctx, P.to.label, x0, base, D.f, { color: C.ink });
    ctx.restore();
  },
  track: (S, P, D) => {
    const top = P.rect.y - P.band.h + P.rect.h * S.y;
    return [[0, top], [P.rect.x + P.band.x + D.dist * (1 - S.c), top]];
  },
};

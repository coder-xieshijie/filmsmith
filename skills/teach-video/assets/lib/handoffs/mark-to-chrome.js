// mark-to-chrome — the official logo (a PNG, scaled only) shrinks and flies to the top left, accelerating, and lands
// as the title of a window's bar; the window then opens from that corner to the bottom right (a landing spring),
// uncovering the product screenshot anchored inside it. The brand becomes part of the product's chrome, where it
// really lives. Theory: one object carried from the title card into the interface (object constancy); ease in for
// a throw that lands, ease out for the opening (Thomas & Johnston 1981). Sources: an editor's launch film (the wordmark
// shrinks into the editor's title bar, the window unfolds from there), a clinic-software film (a logo that flew off
// and landed nowhere: the failure this fixes).

import { seg, settle, lerp, rrect } from './util.js';
import {
  NEUTRAL, BAR, assetOf, placeholderPage, placeholderMark, fitView, windowOf, contentOf, windowBack, windowFront,
  drawAsset, drawRegion, lerpRect, corners,
} from './asset.js';

const FLY = 0.4;

export default {
  name: 'mark-to-chrome',
  tier: 'T1',
  beats: 1.5,
  modes: ['phosphor', 'every mode (brand into product)'],
  roles: ['ground', 'panel', 'line', 'dim'],
  from: 'the official logo, large, on the ground',
  to: 'a window whose title bar carries the logo and the source, the product screenshot inside',
  interpolates: ['logo rect (log scale, ease in)', 'window rect (from the logo\'s bar chip to full size)'],
  summary: 'The official logo shrinks and flies to the top left to become a window\'s title; the window opens from there.',
  theory: 'The mark is carried into the interface where it really appears (object constancy); a throw eases in and lands, the opening eases out (Thomas & Johnston 1981).',
  defaults: {
    logo: { asset: null, from: { cx: 960, cy: 540, w: 1100 }, h: 26 },   // h: the logo's height in the title bar
    content: { asset: null },
    window: { x: 240, y: null, w: 1440 },     // content width; height follows the content's crop
    title: 'example.com',
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL },
  },
  prepare(P) {
    const L = assetOf(P.logo.asset, placeholderMark);
    const A = assetOf(P.content.asset, () => placeholderPage(2000, 1000));
    const la = L.crop[2] / L.crop[3];
    const f = P.logo.from;
    const L0 = { x: f.cx - f.w / 2, y: f.cy - f.w / la / 2, w: f.w, h: f.w / la };
    const contentH = (P.window.w * A.crop[3]) / A.crop[2];
    const W = windowOf(P.window.x, P.window.y ?? Math.round((1080 - contentH - BAR) / 2), P.window.w, contentH);
    const lh = P.logo.h;
    const L1 = { x: W.x + 24, y: W.y + (BAR - lh) / 2, w: lh * la, h: lh };
    const W0 = { x: W.x, y: W.y, w: L1.x + L1.w + 24 - W.x, h: BAR };
    return { L, A, L0, L1, W, W0, v: fitView(A.crop, contentOf(W)) };
  },
  rest(side) { return side === 'from' ? { fly: 0, ow: 0, oh: 0, open: 0 } : { fly: 1, ow: 1, oh: 1, open: 1 }; },
  at(p) {
    const u = seg(p, 0, FLY);
    return { fly: u * u * u, ow: settle(seg(p, FLY, 0.84), 7), oh: settle(seg(p, FLY + 0.06, 0.95), 7), open: p >= FLY ? 1 : 0 };
  },
  logoRect(S, D) {
    // size on a log scale, centre linear: a throw that shrinks evenly to the eye
    const k = Math.pow(D.L1.w / D.L0.w, S.fly);
    const cx = lerp(D.L0.x + D.L0.w / 2, D.L1.x + D.L1.w / 2, S.fly), cy = lerp(D.L0.y + D.L0.h / 2, D.L1.y + D.L1.h / 2, S.fly);
    const w = D.L0.w * k, h = D.L0.h * k;
    return S.fly >= 1 ? D.L1 : { x: cx - w / 2, y: cy - h / 2, w, h };
  },
  windowRect(S, D) {
    return { x: D.W.x, y: D.W.y, w: lerp(D.W0.w, D.W.w, S.ow), h: lerp(D.W0.h, D.W.h, S.oh), bar: BAR, r: D.W.r };
  },
  paint(ctx, S, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (S.open) {
      const R = this.windowRect(S, D);
      windowBack(ctx, R, P);
      ctx.save(); rrect(ctx, R.x, R.y, R.w, R.h, R.r); ctx.clip(); drawAsset(ctx, D.A, D.v, contentOf(D.W)); ctx.restore();
      windowFront(ctx, R, P, { title: P.title, dots: false, titleX: D.L1.x + D.L1.w + 18 });
    }
    drawRegion(ctx, D.L, D.L.crop, this.logoRect(S, D));
  },
  track(S, P, D) { return [...corners(this.logoRect(S, D)), ...(S.open ? corners(this.windowRect(S, D)) : [])]; },
};

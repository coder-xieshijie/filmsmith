// write-on — a page writes itself: its blocks are uncovered left to right two at a time on the beat, an accent nib
// riding the front of the newest one (never more than one nib).
// Adapted from video-shotcraft demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx (card
// references/shots/typography/document-typewriter-reveal.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e,
// Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; the screenshot texture, history
// entries, slogan, floating window and backdrop removed: the page is the next scene's painter and its blocks are
// rects of it (the neutral sample page by default); the camera pull-back is left to a camera brick (tilt-camera,
// viewport-push) run over this one; the pairing and the nib follow the upstream timing.
import { clamp, ground, rgba, rrect, bez } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { painterOf } from '../../sample.js';

const R = (u) => clamp(u);
const inOut = bez(0.4, 0, 0.6, 1);          // the upstream reveal curve: a gentle in-out
// The sample page's blocks in reading order (sample.js page()): eyebrow, claim, chart, three tiles; the top bar is
// chrome, there from the start.
const PAGE = [[110, 166, 700, 46], [110, 214, 1500, 136], [140, 376, 1640, 364], [117, 787, 540, 196], [690, 787, 540, 196], [1263, 787, 540, 196]];

export default {
  id: 'write-on', kind: 'motion',
  tier: 'T1', family: 'mask-type', beats: 3,
  beatsFor(P) { const n = (P.blocks || PAGE).length, pairs = Math.ceil(n / (P.pair || 2)); return Math.max(1, Math.ceil(((P.lead ?? 4) + (pairs - 1) * (P.every ?? 4.4) + (P.dur ?? 9) + 4) / 7.5) / 2); },
  surface: ['canvas'],
  roles: ['panel', 'accent'],
  from: 'the blank page (the page\'s own ground, the content covered)',
  to: 'the page with all its content',
  interpolates: ['per block: a cover in the page colour shrinking toward its right edge (in-out), two blocks a beat', 'the nib: an accent caret with a glow on the front of the newest block'],
  summary: 'A page writes itself: its blocks are uncovered left to right two at a time, an accent nib riding the front of the newest one.',
  theory: 'Writing order is reading order: uncovering the page in the order it is read lets the viewer read along at the pace it is shown (progressive disclosure); one nib keeps one point of attention.',
  defaults: () => ({ to: { scene: 'page' }, blocks: PAGE, cover: 'panel', pair: 2, every: 4.4, dur: 9, lead: 4, nib: true, probes: false }),
  prepare(P) { return { to: painterOf(P.to, P), frames: this.beatsFor(P) * 15 }; },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames;
    const q = P.blocks.map((_, i) => inOut(R((f - P.lead - Math.floor(i / P.pair) * P.every) / P.dur)));
    let nib = -1;
    q.forEach((v, i) => { if (v > 0 && v < 1) nib = i; });
    return { p, f, q, nib };
  },
  paint(ctx, S, P, D) {
    const c = P.colors, cover = c[P.cover] || P.cover;
    D.to(ctx);
    P.blocks.forEach(([x, y, w, h], i) => {
      const v = S.q[i];
      if (v >= 1) return;
      ctx.fillStyle = cover; ctx.fillRect(x + w * v, y, w * (1 - v) + 1, h);
    });
    if (P.nib && S.nib >= 0) {
      const [x, y, w, h] = P.blocks[S.nib], fx = x + w * S.q[S.nib];
      ctx.save(); ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 14;
      rrect(ctx, fx - 1.5, y - 4, 3, h + 8, 1.5); ctx.fillStyle = c.accent; ctx.fill(); ctx.restore();
    }
  },
  blur() { return false; },                 // the fronts are hard edges that jump between blocks: no motion blur
  // the nib; `probes` adds the share of the page uncovered (sum over blocks, ×30 px), layout-free, for the comparison
  track(S, P, D) {
    const pts = S.nib >= 0 ? [[P.blocks[S.nib][0] + P.blocks[S.nib][2] * S.q[S.nib], P.blocks[S.nib][1]]] : [[0, 0]];
    if (P.probes) pts.push([960 + 30 * S.q.reduce((a, v) => a + v, 0), 540]);
    return pts;
  },
};

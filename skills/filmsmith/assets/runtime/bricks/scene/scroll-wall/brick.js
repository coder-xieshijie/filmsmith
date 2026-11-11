// scroll-wall — a wall of page cards tilted back in depth, three columns scrolling at different speeds and in opposite
// directions while the camera creeps in: "more than we can show you", then the columns brake to a stop.
// Adapted from video-shotcraft demos/ui-entrance/page-waterfall-wall/PageWaterfallWall.tsx and VerticalTicker.tsx (card
// references/shots/ui-entrance/page-waterfall-wall.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a dom scene brick (no React or Remotion): the zoomed layout box, the wall's perspective(1000px)
// rotateX(20°) and the doubled columns translating by one period keep the upstream geometry (columns 420 wide, 26 apart,
// loops of 12, 9 and 14 s, the middle one reversed, a 1 → 1.06 push over the shot); the columns brake over the last
// 20 frames so the scene lands still (upstream loops to the cut); the page captures are the film's images or neutral
// page cards (tile-card on the paper role) with a hairline and two shadows; the fades, the darkened far end and the
// vignette are the ground role; grain is dropped.
import { clamp, mix, rgba } from '../../../handoffs/util.js';
import { el, n } from '../../dom.js';
import { faceCanvas, cardItems } from '../../prop/tile-card/brick.js';

const FRAMES = 150, COLW = 420, GAP = 26, ZOOM = 1.2, PUSH = 0.06, TILT = 20, PERSP = 1000, BRAKE = 20;
const LOOPS = [12, 9, 14], DIRS = [-1, 1, -1], SPLIT = [4, 3, 3];
// the page cards: tile-card layouts at the upstream captures' proportions (714 × 576 or 624 shown 420 wide)
const LAYOUTS = [['cover', 339], ['stat', 339], ['note', 367], ['cover', 367], ['stat', 367], ['note', 367], ['cover', 367], ['note', 367], ['stat', 367], ['cover', 367]];

// the scene's frames → the wall's frames: speed 1 → 0 over the last BRAKE frames
const wallFrame = (f) => { const a = FRAMES - BRAKE; if (f <= a) return f; const u = clamp((f - a) / BRAKE); return a + BRAKE * (u - (u * u) / 2); };
const paperColors = (c) => ({ ...c, panel: c.paper, ink: c.onPaper, dim: mix(c.onPaper, c.paper, 0.5), line: mix(c.onPaper, c.paper, 0.85), ground: mix(c.paper, c.onPaper, 0.06) });

export default {
  id: 'scroll-wall', kind: 'scene',
  fits: ['demo', 'rest', 'proof'],
  surface: ['dom'],
  beats: { min: 8, max: 12 },
  beatsFor: () => FRAMES / 15,
  needs: { motions: [], props: ['tile-card'], roles: ['ground', 'paper', 'onPaper', 'accent'], type: ['display', 'text', 'mono'] },
  slots: {
    items: { type: 'list', count: [9, 15], optional: true, of: { image: { type: 'image' } } },
  },
  roles: ['ground', 'paper', 'onPaper', 'accent'],
  summary: 'A wall of page cards tilted back in depth: three columns scroll at different speeds, the middle one reversed, while the camera creeps in; then they brake.',
  defaults: () => ({ items: null }),
  plan() { return { beats: FRAMES / 15, reads: [], cues: [], peakAt: null, settled: FRAMES / 15 - 0.2 }; },
  validate(s) { const n2 = (s.items || []).length; return s.items && (n2 < 9 || n2 > 15) ? [`items: ${n2} (9–15, none repeated across columns)`] : []; },
  prepare(P) {
    const base = cardItems(P.lang, 10), pc = { ...P, colors: paperColors(P.colors) };
    const items = P.items
      ? P.items.map((it) => { const im = it.image, w = im.width || im.naturalWidth || COLW, h = im.height || im.naturalHeight || COLW; return { image: im, h: Math.round((COLW * h) / w) }; })
      : base.map((it, i) => ({ face: faceCanvas({ ...it, foot: LAYOUTS[i][1] < 360 ? '' : it.foot, figure: ['line', 'bars', 'rings', 'gantt', 'grid', 'dots', 'wave', 'blocks', 'bars', 'line'][i] }, COLW, LAYOUTS[i][1], pc, { layout: LAYOUTS[i][0], index: i, featured: i === 4, radius: 20 }, 1.5), h: LAYOUTS[i][1] }));
    const split = P.items ? [Math.ceil(items.length / 3), Math.floor(items.length / 3), items.length - Math.ceil(items.length / 3) - Math.floor(items.length / 3)] : SPLIT;
    let k = 0;
    const cols = split.map((m, ci) => { const its = items.slice(k, k + m); k += m; const period = its.reduce((a, it) => a + it.h + GAP, 0); return { items: its, period, loop: LOOPS[ci] * 30, dir: DIRS[ci] }; });
    return { cols };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * FRAMES, g = wallFrame(f), zoom = ZOOM * (1 + PUSH * clamp(f / FRAMES));
    return { f, zoom, shift: D.cols.map((c) => { const q = (g % c.loop) / c.loop; return c.dir === -1 ? -q * c.period : -c.period + q * c.period; }) };
  },
  build(root, P, D) {
    const c = P.colors;
    root.style.background = c.ground;
    const back = el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 60% 55% at 50% 42%, ${rgba(mix(c.ground, c.accent, 0.35), 0.5)} 0%, ${rgba(c.ground, 0)} 70%)` }, root);
    const box = el('div', { position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', overflow: 'hidden' }, root);
    const wall = el('div', { position: 'absolute', inset: '0', transform: `perspective(${PERSP}px) rotateX(${TILT}deg)`, transformOrigin: 'center center' }, box);
    const cols = D.cols.map((col) => {
      const holder = el('div', { position: 'absolute', top: '0', width: `${COLW}px`, height: '100%' }, wall);
      const strip = el('div', { position: 'absolute', left: '0', top: '0', width: `${COLW}px` }, holder);
      let y = 0;
      for (const rep of [0, 1]) for (const it of col.items) {
        const card = el('div', { position: 'absolute', left: '0', top: `${y}px`, width: `${COLW}px`, height: `${it.h}px`, borderRadius: '20px', overflow: 'hidden', background: c.paper,
          boxShadow: `0 2px 4px ${rgba(mix(c.ground, '#000000', 0.8), 0.35)}, 0 22px 48px -12px ${rgba(mix(c.ground, '#000000', 0.8), 0.6)}` }, strip);
        const src = it.face || it.image, cv = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${COLW}px`, height: `${it.h}px` }, card);
        cv.width = src.width || COLW; cv.height = src.height || it.h; cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
        el('div', { position: 'absolute', inset: '0', borderRadius: '20px', boxShadow: `inset 0 0 0 1px ${rgba('#ffffff', 0.1)}, inset 0 1px 0 ${rgba('#ffffff', 0.9)}` }, card);
        y += it.h + GAP;
      }
      return { holder, strip };
    });
    // the far end darkened (air), soft fades top and bottom in the ground's own colour, a vignette
    const g0 = c.ground;
    el('div', { position: 'absolute', inset: '0', background: `linear-gradient(to bottom, ${rgba(g0, 0.5)} 0%, ${rgba(g0, 0)} 50%)` }, root);
    el('div', { position: 'absolute', inset: '0', background: `linear-gradient(to bottom, ${g0} 0%, ${rgba(g0, 0.85)} 10%, ${rgba(g0, 0)} 30%)` }, root);
    el('div', { position: 'absolute', inset: '0', background: `linear-gradient(to top, ${mix(g0, '#000000', 0.35)} 0%, ${rgba(mix(g0, '#000000', 0.35), 0.8)} 8%, ${rgba(mix(g0, '#000000', 0.35), 0)} 22%)` }, root);
    el('div', { position: 'absolute', inset: '0', background: `radial-gradient(ellipse 75% 70% at 50% 50%, ${rgba(mix(g0, '#000000', 0.6), 0)} 55%, ${rgba(mix(g0, '#000000', 0.6), 0.55)} 100%)` }, root);
    return { root, back, box, wall, cols, blurTarget: null };
  },
  pose(Rg, S, P, D) {
    const W = 1920 / S.zoom, H = 1080 / S.zoom, left = (W - (3 * COLW + 2 * GAP)) / 2;
    Rg.box.style.width = `${n(W, 3)}px`; Rg.box.style.height = `${n(H, 3)}px`; Rg.box.style.transform = `scale(${n(S.zoom, 5)})`;
    Rg.cols.forEach((col, i) => { col.holder.style.left = `${n(left + i * (COLW + GAP), 3)}px`; col.strip.style.transform = `translateY(${n(S.shift[i], 3)}px)`; });
  },
  // the first card of each column's first copy (the middle of its on-screen box), through the wall's tilt and the zoom
  track(S, P, D) {
    const W = 1920 / S.zoom, H = 1080 / S.zoom, left = (W - (3 * COLW + 2 * GAP)) / 2, a = (TILT * Math.PI) / 180;
    const at = (x, y) => { const X = x - W / 2, Y = y - H / 2, k = PERSP / (PERSP - Y * Math.sin(a)); return [S.zoom * (W / 2 + X * k), S.zoom * (H / 2 + Y * Math.cos(a) * k)]; };
    return D.cols.map((col, i) => {
      const x0 = left + i * (COLW + GAP), y0 = S.shift[i], cs = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([u, v]) => at(x0 + u * COLW, y0 + v * col.items[0].h));
      const xs = cs.map((q) => q[0]), ys = cs.map((q) => q[1]);
      return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    });
  },
  blur: () => false,
};

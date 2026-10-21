// changes.js — the page changes an exhibit may arrive by (content.js `enter`), as one registry. The camera never moves:
// every change is paper being handled or an editorial cut. A change straddles the boundary between two scenes (its
// length and tier are in choreo.js CHANGES, so Node and the browser agree).
//
//   level 'pair'   the change draws the outgoing and the incoming sheet itself while it runs (the mat, the claims and
//                  the header keep their own motion): draw(ctx, { from, to, p, opts, palette }) with `from` / `to`
//                  = { c, x, y, ox, oy, w, h, H, box? }: c a canvas holding the sheet (its top left at ox, oy in c, w × h
//                  the sheet, H with the sticker hanging below), x, y where c's origin sits on screen at rest, `box`
//                  the matched value's rect in film px at rest (match-cut). track(args) returns the moving points
//                  (motion blur). `edges`: whether the sheets are drawn with their stack edges
//   level 'frame'  the whole frame changes: draw(ctx, { from, to, p, opts, palette }) mixes two finished frames
//                  (canvases of 1920 × 1080). Every frame-level transition of lib/transitions is one of these, under
//                  its own name (references/transitions.md lists them), drawn by WebGL
//
// Built in (the dossier's own axis: paper and editorial cuts):
//   'sheet-shuffle'  the top sheet is drawn out to the side and tucked under the pile; the sheet beneath squares up
//                    (lib/handoffs/sheet-shuffle.js: its timing and poses, on the template's sheets)
//   'louvre'         the page is cut into slats along the rows it struck; in each slat the next page slides out of a
//                    seam and pushes the current one out (lib/handoffs/louvre.js in a pane of painters)
//   'match-cut'      the same value printed in the next source: the page slides it into register, and on one still
//                    frame the next page, its own printing of the value in the same place, replaces it; the paper
//                    slides home (lib/handoffs/match-cut.js timing; paper moves instead of a camera)
//   'turn'           the sheet turns away over its top or left edge onto the page underneath (dossier-page-turn)
// 'deal' (the default: the old sheet slides off, the new one is dealt on) is ordinary sheet motion, drawn by film.js;
// split-open (the spread opening on a seam) is the worksheet's arrival, also in film.js. More changes plug in with
// register(name, def) under their device id; add the id to choreo.js CHANGES (beats, tier, sound) and to
// timing.rules.js `devices`.
import { list as libList, createTransitions } from './lib/transitions/index.js';
import sheetShuffle from './lib/handoffs/sheet-shuffle.js';
import louvre from './lib/handoffs/louvre.js';
import matchCut from './lib/handoffs/match-cut.js';
import { merge } from './lib/handoffs/util.js';

const REG = new Map();
export const register = (name, def) => {
  if (!def || !['pair', 'frame'].includes(def.level) || typeof def.draw !== 'function') throw new Error(`register("${name}"): { level: 'pair' | 'frame', draw, track? }`);
  REG.set(name, def);
};
const clamp01 = (p) => Math.min(1, Math.max(0, p));
const easeIn2 = (u) => u * u;
const blit = (ctx, s, dx = 0, dy = 0) => ctx.drawImage(s.c, s.x + dx, s.y + dy);

// ---------- sheet-shuffle ----------
// Poses are the sheets' top-left corners on screen and their angle; the sheet being read is always square. Drawn out
// clear of the pile (its widest sheet plus 40 px) so the order changes only while the two do not overlap.
const shufflePoses = ({ from, to, p }) => {
  const pose = (x, y, rot) => ({ x, y, rot });
  const pile = sheetShuffle.defaults.pile, out = sheetShuffle.defaults.out;
  const a0 = pose(from.x + from.ox, from.y + from.oy, 0), b1 = pose(to.x + to.ox, to.y + to.oy, 0);
  const D = {
    a0, b1,
    aOut: pose(a0.x + Math.max(from.w, to.w) + 40, a0.y + out.dy, out.rot),
    a1: pose(b1.x + pile.dx, b1.y + pile.dy, pile.rot),
    b0: pose(a0.x + pile.dx, a0.y + pile.dy, pile.rot),
  };
  return sheetShuffle.poses(sheetShuffle.at(clamp01(p)), D);
};
const drawAt = (ctx, s, q) => {
  ctx.save();
  ctx.translate(q.x + s.w / 2, q.y + s.h / 2); ctx.rotate((q.rot * Math.PI) / 180); ctx.translate(-s.w / 2 - s.ox, -s.h / 2 - s.oy);
  ctx.drawImage(s.c, 0, 0);
  ctx.restore();
};
register('sheet-shuffle', {
  level: 'pair', edges: false,
  draw: (ctx, A) => {
    const { a, b, aOnTop } = shufflePoses(A);
    if (aOnTop) { drawAt(ctx, A.to, b); drawAt(ctx, A.from, a); } else { drawAt(ctx, A.from, a); drawAt(ctx, A.to, b); }
  },
  track: (A) => { const { a, b } = shufflePoses(A); return [a.x, a.y, a.rot * 20, b.x, b.y, b.rot * 20]; },
  // where the outgoing sheet lies once tucked under (film.js keeps drawing it there, under the pile's top sheet)
  pile: (A) => shufflePoses({ ...A, p: 1 }).a,
});

// ---------- louvre ----------
const louvreParams = (A) => {
  const { from, to, palette: P, opts = {} } = A;
  const x0 = Math.min(from.x, to.x), y0 = Math.min(from.y, to.y);
  const x1 = Math.max(from.x + from.c.width, to.x + to.c.width), y1 = Math.max(from.y + from.c.height, to.y + to.c.height);
  const pane = { x: Math.max(0, x0), y: Math.max(0, y0), w: Math.min(1920, x1) - Math.max(0, x0), h: Math.min(1080, y1) - Math.max(0, y0) };
  const painter = (s) => (ctx, dx, dy) => { ctx.fillStyle = P.mat; ctx.fillRect(pane.x + dx, pane.y + dy, pane.w, pane.h); blit(ctx, s, dx, dy); };
  // the seam is a cut, so it is drawn in ink with a paper key: the accent stays the mark of a published claim
  return merge(louvre.defaults, { pane, rows: opts.rows ?? null, n: opts.rows ? null : 6, from: { paint: painter(from) }, to: { paint: painter(to) },
    colors: { ground: P.mat, accent: P.ink, key: P.paper, line: P.paperEdge, panel: P.paper, dim: P.mat } });
};
register('louvre', {
  level: 'pair', edges: true,
  draw: (ctx, A) => { const Pl = louvreParams(A); louvre.paint(ctx, louvre.at(clamp01(A.p), Pl), Pl); },
  track: (A) => { const Pl = louvreParams(A); return louvre.track(louvre.at(clamp01(A.p), Pl), Pl).flat(); },
});

// ---------- match-cut ----------
// The value's centre in each page at rest; the register point halfway between; each page slides its value onto it.
const matchState = (A) => {
  const P = matchCut.defaults, S = matchCut.at(clamp01(A.p), P);
  const c = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
  const cf = c(A.from.box), ct = c(A.to.box), m = [(cf[0] + ct[0]) / 2, (cf[1] + ct[1]) / 2];
  const src = S.b ? ct : cf;
  // `at`: where the value is on screen; it never jumps across the cut, so no motion blur spans it
  return { b: S.b, dx: S.u * (m[0] - src[0]), dy: S.u * (m[1] - src[1]), at: [src[0] + S.u * (m[0] - src[0]), src[1] + S.u * (m[1] - src[1])] };
};
register('match-cut', {
  level: 'pair', edges: true,
  draw: (ctx, A) => { const s = matchState(A); blit(ctx, s.b ? A.to : A.from, s.dx, s.dy); },
  track: (A) => matchState(A).at,
});

// ---------- turn (dossier-page-turn) ----------
// The sheet rotates about its top edge (rotateX) or left edge (rotateY) to 89°, perspective 2200 px from the hinge,
// easing in (power2.in), drawn in 3 px strips scaled about the hinge's middle; it darkens as it tilts (up to 28 % of
// the mat at edge-on), so the page underneath reads as lit. The page underneath lies still, whole, with its edges.
const F = 2200, STRIP = 3;
const turnTravel = (w, h, p, edge) => {
  const th = easeIn2(clamp01(p)) * (89 * Math.PI) / 180, d = edge === 'left' ? w : h;
  return d - d * Math.cos(th) * (F / (F + d * Math.sin(th)));
};
register('turn', {
  level: 'pair', edges: true,
  draw: (ctx, { from, to, p, opts = {}, palette: P }) => {
    blit(ctx, to);
    const th = easeIn2(clamp01(p)) * (89 * Math.PI) / 180;
    if (th >= (88.9 * Math.PI) / 180) return;
    const s = Math.sin(th), c = Math.cos(th), w = from.w, h = from.H, x = from.x + from.ox, y = from.y + from.oy, sx = from.ox, sy = from.oy;
    ctx.save();
    ctx.fillStyle = P.mat;
    if ((opts.edge ?? 'top') === 'left') {
      const cy = h / 2;
      for (let u = 0; u < w; u += STRIP) {
        const u1 = Math.min(w, u + STRIP), k0 = F / (F + u * s), k1 = F / (F + u1 * s);
        const x0 = u * c * k0, x1 = u1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(from.c, sx + u, sy, u1 - u, h, x + x0, y + cy - cy * k, Math.max(0.5, x1 - x0 + 0.35), h * k);
      }
      const kw = F / (F + w * s);
      ctx.globalAlpha = 0.28 * s;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * c * kw, y + cy - cy * kw); ctx.lineTo(x + w * c * kw, y + cy + cy * kw); ctx.lineTo(x, y + h); ctx.fill();
    } else {
      const cx = w / 2;
      for (let v = 0; v < h; v += STRIP) {
        const v1 = Math.min(h, v + STRIP), k0 = F / (F + v * s), k1 = F / (F + v1 * s);
        const y0 = v * c * k0, y1 = v1 * c * k1, k = (k0 + k1) / 2;
        ctx.drawImage(from.c, sx, sy + v, w, v1 - v, x + cx - cx * k, y + y0, w * k, Math.max(0.5, y1 - y0 + 0.35));
      }
      const kh = F / (F + h * s);
      ctx.globalAlpha = 0.28 * s;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + cx + cx * kh, y + h * c * kh); ctx.lineTo(x + cx - cx * kh, y + h * c * kh); ctx.fill();
    }
    ctx.restore();
  },
  track: ({ from, p, opts = {} }) => [turnTravel(from.w, from.H, p, opts.edge ?? 'top')],
  // the outgoing sheet is drawn without its stack edges (the page underneath has its own)
  fromEdges: false,
});

// ---------- frame-level: every transition of lib/transitions, by its own name ----------
let TX = null;
const LIB = new Set(libList.filter((d) => d.tier !== 'T0').map((d) => d.name));
export const changeOf = (name) => {
  if (REG.has(name)) return REG.get(name);
  if (!LIB.has(name)) return null;
  return {
    level: 'frame',
    draw: (ctx, { from, to, p, opts = {}, palette: P }) => {
      if (!TX) TX = createTransitions(null);
      if (!TX) throw new Error('WebGL is not available: the page change cannot be drawn');
      ctx.drawImage(TX.draw(name, from, to, p, { colors: { ink: P.ink, accent: P.accent, ground: P.mat, paper: P.paper }, ...opts }), 0, 0);
    },
  };
};
export const names = () => [...REG.keys(), ...LIB];

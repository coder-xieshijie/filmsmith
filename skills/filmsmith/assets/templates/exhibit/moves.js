// moves.js — the Exhibit template's moves, pluggable. Four roles, each filled by a transition from the shared library:
//   open    the first exhibit's entrance: content first, then its mount                 'bezel-pullback'
//   lift    a claim's regions rise out of the print and become readings (≤ 2 a film)   'lift-out'
//   travel  the camera goes to another exhibit: slide with parallax (default), truck, or pull back to the whole desk
//           and hop                                                                   'parallax-slide' | 'camera-truck' | 'grid-hop'
//   match   one value printed in two sources: push in, cut on a still frame, pull back 'match-cut'
// content.moves = { role: id } picks the default adapter for a role; a travel scene may name its own (`move`). To plug
// in another transition, add an adapter here: { device, beats, expressive, create(env, use) } where create returns
//   draw(ctx, p)          the module at progress p (no ground; the template draws the desk and every other exhibit)
//   camera(p)             the middle plane's camera { cx, cy, z } the frame is seen through (layout.js)
//   track(p)              screen points, for the motion blur
//   owns                  exhibit ids whose mount the module draws itself
//   draws                 { numerals, chips, shadows, tiles } what else it draws itself (the template draws the rest)
//   transform             optional ctx matrix [a, b, c, d, e, f] the module is drawn under
// The choreography (choreo.js) reads only `device`, `beats` and `expressive` through moveOf(), so a swapped transition
// keeps every timing check. At p = 0 and p = 1 an adapter must draw exactly the template's rest (same window, view,
// shadow, numeral and chip), or the move pops.
//
// env (from film.js): { createHandoff, modules, world, content, PAL, FONT, MONO, measure, assetOf(id) → { image, crop:
// region } }. Nothing here touches the DOM at import, so Node can read moveOf().
import { WIN, R, S, BAR, CHIP, NUMERAL, DEPTH, fileView, viewOf, restCam, camOf } from './layout.js';

const NOTE = 25;   // a reading's note: IBM Plex Mono 25 px under its card's label
export const COLORS = (PAL) => ({ ground: PAL.ground, panel: PAL.stock, line: PAL.mat, ink: PAL.sink, dim: PAL.smuted, accent: PAL.accent });
const pair = (a, b) => (a.i < b.i ? [a, b, 0, 1] : [b, a, 1, 0]);   // [lo, hi, from index, to index]

export const ADAPTERS = {
  open: {
    'bezel-pullback': {
      device: 'bezel-pullback', beats: 2, expressive: false,
      async create(env, { e }) {
        const P = {
          asset: env.assetOf(e.id), title: e.source, rim: 0, radius: 12, focus: null,
          window: { cx: WIN.x + WIN.w / 2, cy: WIN.y + (R.h + BAR) / 2, w: WIN.w }, ground: false, mono: env.MONO, colors: COLORS(env.PAL),
        };
        const h = await env.createHandoff('bezel-pullback', P);
        const M = env.modules['bezel-pullback'], D = M.prepare(h.params);
        const viewAt = (p) => env.zoomBetween(D.v0, D.v1, h.state(p).u);
        // the module's view (file px → screen) as a camera on the middle plane
        const camera = (p) => {
          const bv = viewAt(p), a = bv.a / e.a;
          return camOf({ a, bx: bv.bx - a * (e.x - e.region[0] * e.a), by: bv.by - a * (R.y - e.region[1] * e.a) });
        };
        // the frame the module grows round the content (its rest is the template's window), for the shadow under it
        const frame = (p) => {
          const u = h.state(p).u, bv = viewAt(p), [cx, cy, cw, ch] = D.A.crop;
          return { ...M.frame({ x: bv.bx + cx * bv.a, y: bv.by + cy * bv.a, w: cw * bv.a, h: ch * bv.a }, u, h.params), u };
        };
        return { device: 'bezel-pullback', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera, frame, track: (p) => M.track(h.state(p), h.params, D), state: h.state, owns: [e.id], draws: {} };
      },
    },
  },
  lift: {
    'lift-out': {
      device: 'lift-out', beats: 2, expressive: true,
      async create(env, { e, cells }) {
        const v = fileView(viewOf(restCam(e)), e);
        const P = {
          asset: env.assetOf(e.id), view: v, backdrop: false, ground: false, title: e.source,
          window: { x: WIN.x, y: WIN.y, w: WIN.w },
          cells: cells.map(({ box, glyph, value, label }) => ({ box, glyph, value, label })),
          card: { x: null, h: 140, gap: 22, rise: 0, pad: 28, labelSize: 44, margin: 100 },
          swapAt: 1.2, dim: 0.55, ringPad: 6, ringStyle: { width: 3, radius: 10 },
          font: { ...env.FONT, weight: 700 }, mono: env.MONO,
          colors: { ...COLORS(env.PAL), paper: null, onPaper: env.PAL.sink },
        };
        const h = await env.createHandoff('lift-out', P);
        const M = env.modules['lift-out'], Q = h.params, D = M.prepare(Q);
        // a note sits under its card's label, so the cards widen to the longest note (and stay inside the frame);
        // the module is then painted with this preparation (its own draw would use the narrower one)
        const C = Q.card, g = document.createElement('canvas').getContext('2d');
        const noteW = Math.max(0, ...cells.map((c) => (c.note ? env.measure(g, c.note, { ...env.MONO, size: NOTE }).width : 0)));
        D.cardW = Math.max(D.cardW, D.zoneW + C.pad + noteW + C.pad);
        const x = Math.min(D.cells[0].r1.x, 1920 - C.margin - D.cardW);
        for (const c of D.cells) if (!c.land) c.r1.x = x;
        const cards = D.cells.map((c) => ({ x: c.r1.x, y: c.r1.y, w: c.r1.w + (D.cardW - c.zoneW), h: c.r1.h, labelX: c.r1.x + D.zoneW + C.pad, r0: c.r0 }));
        const at = (p) => M.at(Math.min(1, Math.max(0, p)), Q, D);
        return {
          device: 'lift-out', D, cards, note: NOTE,
          draw: (ctx, p) => { ctx.save(); M.paint(ctx, at(p), Q, D); ctx.restore(); },
          camera: () => restCam(e), track: (p) => M.track(at(p), Q, D), state: at, owns: [], draws: {},
        };
      },
    },
  },
  travel: {
    'parallax-slide': {
      device: 'parallax-slide', beats: 2, expressive: true,
      async create(env, { from, e }) {
        const [lo, hi, f, t] = pair(from, e);
        const item = (x) => ({ asset: env.assetOf(x.id), title: x.source, index: x.index, chip: x.chip });
        const P = {
          items: [item(lo), item(hi)], from: f, to: t,
          window: { x: WIN.x, y: WIN.y, w: WIN.w, h: R.h }, chip: CHIP, numeral: NUMERAL, depth: DEPTH, spacing: S,
          font: env.FONT, mono: env.MONO, colors: COLORS(env.PAL), ground: false,
        };
        const h = await env.createHandoff('parallax-slide', P);
        const M = env.modules['parallax-slide'], D = M.prepare(h.params);
        return {
          device: 'parallax-slide', draw: (ctx, p) => h.draw(ctx, p, { blur: false }),
          camera: (p) => ({ cx: 960 + (lo.i + h.state(p).c) * S, cy: 540, z: 1 }),
          track: (p) => M.track(h.state(p), h.params, D), state: h.state,
          owns: [lo.id, hi.id], draws: { numerals: [lo.id, hi.id], chips: [lo.id, hi.id], shadows: true },
        };
      },
    },
    'camera-truck': {
      device: 'camera-truck', beats: 2, expressive: true,
      async create(env, { from, e }) {
        const [lo, hi, f, t] = pair(from, e);
        const P = {
          items: [lo, hi].map((x) => ({ asset: env.assetOf(x.id), title: x.source, w: WIN.w })),
          gap: S - WIN.w, from: f, to: t, cy: WIN.y + (R.h + BAR) / 2, veil: 0.55, ground: false, mono: env.MONO, colors: COLORS(env.PAL),
        };
        const h = await env.createHandoff('camera-truck', P);
        const M = env.modules['camera-truck'], D = M.prepare(h.params);
        return {
          device: 'camera-truck', draw: (ctx, p) => h.draw(ctx, p, { blur: false }),
          camera: (p) => ({ cx: 960 + WIN.x + lo.i * S + h.state(p).cam, cy: 540, z: 1 }),
          track: (p) => M.track(h.state(p), h.params, D), state: h.state,
          owns: [lo.id, hi.id], draws: {},
        };
      },
    },
    'grid-hop': {
      device: 'grid-hop', beats: 3, expressive: false,
      async create(env, { from, e, zoom }) {
        // the module's world is a row of 1920 × 1080 tiles; drawn under a scale s onto the desk, tile i is exhibit i's
        // content rect, so its full-frame rests are the template's windows and its grid is the whole desk
        const s = R.w / 1920, L = env.world.list, gx = S / s - 1920;
        const gw = L.length * 1920 + (L.length - 1) * gx;
        const P = {
          tiles: L.map((x) => ({ asset: env.assetOf(x.id), label: '' })), cols: L.length, from: from.i, to: e.i,
          gutter: { x: gx, y: 380 }, margin: (1920 - zoom * gw) / 2, veil: 0.5,
          mono: env.MONO, colors: COLORS(env.PAL), ground: false,
        };
        const h = await env.createHandoff('grid-hop', P);
        const M = env.modules['grid-hop'], D = M.prepare(h.params);
        const camera = (p) => {
          const v = M.viewOf(h.state(p), D);
          return { z: v.a, cx: (960 - R.x - s * v.bx + v.a * R.x) / v.a, cy: (540 - R.y - s * v.by + v.a * R.y) / v.a };
        };
        const open = (p) => { const S0 = h.state(p); return S0.dive > 0 ? 1 - S0.dive : S0.out; };
        return {
          device: 'grid-hop', draw: (ctx, p) => h.draw(ctx, p, { blur: false }), camera, open,
          track: (p) => M.track(h.state(p), h.params, D).map(([x, y]) => [R.x + s * x, R.y + s * y]), state: h.state,
          owns: [], draws: { tiles: true }, transform: [s, 0, 0, s, R.x, R.y],
        };
      },
    },
  },
  match: {
    'match-cut': {
      device: 'match-cut', beats: 2, expressive: true,
      async create(env, { from, e, s }) {
        const P = {
          window: { x: WIN.x, y: WIN.y, w: WIN.w, h: R.h },
          from: { asset: env.assetOf(from.id), title: from.source, box: s.from.box },
          to: { asset: env.assetOf(e.id), title: e.source, box: s.to.box },
          match: { cx: R.x + R.w / 2, cy: R.y + R.h / 2, h: 64 }, ringPad: 12,
          mono: env.MONO, colors: COLORS(env.PAL), ground: false,
        };
        const h = await env.createHandoff('match-cut', P);
        const M = env.modules['match-cut'], D = M.prepare(h.params);
        return {
          device: 'match-cut', draw: (ctx, p) => h.draw(ctx, p, { blur: false }),
          camera: (p) => restCam(h.state(p).b ? e : from), side: (p) => (h.state(p).b ? e : from),
          track: (p) => M.track(h.state(p), h.params, D), state: h.state,
          owns: [from.id, e.id], draws: {},
        };
      },
    },
  },
};

// static facts of the move filling a role (Node-safe): { role, id, device, beats, expressive }
export const moveOf = (role, id) => {
  const table = ADAPTERS[role] ?? {};
  const key = id ?? Object.keys(table)[0];
  const a = table[key];
  if (!a) throw new Error(`moves.${role}: no adapter "${key}"; known: ${Object.keys(table).join(', ')} (add one in moves.js)`);
  return { role, id: key, device: a.device, beats: a.beats, expressive: a.expressive };
};
export const roles = Object.keys(ADAPTERS);

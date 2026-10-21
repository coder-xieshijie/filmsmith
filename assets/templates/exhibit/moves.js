// moves.js — the Exhibit template's moves, pluggable. Four roles, each filled by one transition:
//   open    the first exhibit's entrance (content first, then its mount)          default 'bezel-pullback'
//   lift    the signature: ringed regions rise and become code-drawn readings   default 'lift-out'
//   travel  the camera goes from one exhibit to the next                          default 'camera-truck'
//   carry   a value leaves one exhibit and lands on its twin in the next          default 'value-carry'
// content.moves = { role: id } picks another adapter for a role. To plug in a new transition (a hand-off module in
// lib/handoffs/ or one of the film's own), add an adapter here: { device, beats, create(env, use) } where create
// returns { draw(ctx, p), camera(p) → { x } | { view }, track(p) → [[x, y], …], state(p) }. The choreography
// (choreo.js) reads only `device` and `beats` through moveOf(), so a swapped transition keeps every timing check.
//
// env (from film.js): { createHandoff, modules, zoomBetween, measure, world, content, PAL, FONT, MONO, assetOf(id), focusOf(id) };
// use (per scene): the scene and its exhibits. Nothing here touches the DOM at import, so Node can read moveOf().
import { BAR, fileView, camView, fileRect, windowOfE } from './layout.js';

const NOTE = 25;   // a note's size (type scale), mono, under its card's label
const COLORS = (PAL) => ({ ground: PAL.ground, panel: PAL.mat, line: PAL.mat, ink: PAL.ink, dim: PAL.muted, accent: PAL.accent });

export const ADAPTERS = {
  open: {
    'bezel-pullback': {
      device: 'bezel-pullback', beats: 2,
      async create(env, { e }) {
        const P = {
          asset: env.assetOf(e.id), title: e.source, rim: 0, radius: 12, focus: env.focusOf?.(e.id) ?? null,
          window: { cx: 960, cy: e.y + (e.h + BAR) / 2, w: e.w }, ground: false, mono: env.MONO, colors: COLORS(env.PAL),
        };
        const h = await env.createHandoff('bezel-pullback', P);
        const M = env.modules['bezel-pullback'], D = M.prepare(h.params);
        const viewAt = (p) => {
          // the module's view (file px → screen), as a camera on the world: world = e's file view at zoom 1
          const u = h.state(p).u, bv = env.zoomBetween(D.v0, D.v1, u), k = bv.a / e.a;
          return { a: k, bx: bv.bx - k * (e.x - e.cx * e.a), by: bv.by - k * (e.y + BAR - e.cy * e.a) };
        };
        return { h, draw: (ctx, p, o) => h.draw(ctx, p, o), camera: (p) => ({ view: viewAt(p) }), track: (p) => M.track(h.state(p), h.params, D), state: (p) => h.state(p) };
      },
    },
  },
  lift: {
    'lift-out': {
      device: 'lift-out', beats: 2,
      async create(env, { e, cells }) {
        const v = fileView(camView(e.cam), e);
        const P = {
          asset: env.assetOf(e.id), view: v, backdrop: false, ground: false, title: e.source,
          window: { x: e.x - e.cam, y: e.y, w: e.w },
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
        // the landed cards (screen px at the exhibit's camera), for notes and the reading marker
        const cards = D.cells.map((c) => ({ x: c.r1.x, y: c.r1.y, w: c.r1.w + (D.cardW - c.zoneW), h: c.r1.h, labelX: c.r1.x + D.zoneW + C.pad, r0: c.r0 }));
        const at = (p) => M.at(Math.min(1, Math.max(0, p)), Q, D);
        const draw = (ctx) => (p) => { ctx.save(); M.paint(ctx, at(p), Q, D); ctx.restore(); };
        return { h, D, cards, note: NOTE, draw: (ctx, p) => draw(ctx)(p), camera: () => ({ x: e.cam }), track: (p) => M.track(at(p), Q, D), state: at };
      },
    },
  },
  travel: {
    'camera-truck': {
      device: 'camera-truck', beats: 2,
      async create(env, { from, e }) {
        const P = {
          gap: e.x - (from.x + from.w), from: 0, to: 1, cy: 540, veil: 0.55, ground: false, mono: env.MONO, colors: COLORS(env.PAL),
          items: [{ asset: env.assetOf(from.id), title: from.source, w: from.w }, { asset: env.assetOf(e.id), title: e.source, w: e.w }],
        };
        const h = await env.createHandoff('camera-truck', P);
        const M = env.modules['camera-truck'], D = M.prepare(h.params);
        return { h, draw: (ctx, p, o) => h.draw(ctx, p, o), camera: (p) => ({ x: h.state(p).cam + from.x }), track: (p) => M.track(h.state(p), h.params, D), state: (p) => h.state(p), owns: [from.id, e.id] };
      },
    },
  },
  carry: {
    'value-carry': {
      device: 'value-carry', beats: 2,
      async create(env, { from, e, s }) {
        const spacing = e.x + e.w / 2 - (from.x + from.w / 2);
        const P = {
          spacing, cy: 540, carry: { cx: 960, cy: 70, h: 84 }, swapAt: 1.2, ringPad: 6, ground: false,
          font: { ...env.FONT, weight: 700 }, mono: env.MONO,
          from: { asset: env.assetOf(from.id), title: from.source, window: { w: from.w }, box: s.from.box, glyph: s.from.glyph, value: s.from.value, weight: 500 },
          to: { asset: env.assetOf(e.id), title: e.source, window: { w: e.w }, glyph: s.to.glyph, ring: s.to.ring, weight: 600 },
          colors: { ...COLORS(env.PAL), paper: null, onPaper: null, paper2: null, onPaper2: null },
        };
        const h = await env.createHandoff('value-carry', P);
        const M = env.modules['value-carry'], D = M.prepare(h.params);
        return { h, D, draw: (ctx, p, o) => h.draw(ctx, p, o), camera: (p) => ({ x: from.cam + h.state(p).pan * spacing }), track: (p) => M.track(h.state(p), h.params, D), state: (p) => h.state(p), owns: [from.id, e.id] };
      },
    },
  },
};

// static facts of the move filling a role (Node-safe): { role, id, device, beats }
export const moveOf = (role, id) => {
  const table = ADAPTERS[role] ?? {};
  const key = id ?? Object.keys(table)[0];
  const a = table[key];
  if (!a) throw new Error(`moves.${role}: no adapter "${key}"; known: ${Object.keys(table).join(', ')} (add one in moves.js)`);
  return { role, id: key, device: a.device, beats: a.beats };
};
export const roles = Object.keys(ADAPTERS);
export { windowOfE, fileRect };

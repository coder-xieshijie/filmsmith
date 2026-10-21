// moves.js — the Strip template's moves, pluggable. Three roles, each filled by one hand-off of the shared library
// (lib/handoffs/, by name):
//   advance  the strip through the gate: every pull-down, the opening run, the closing run-out   default 'strip-advance'
//   punch    a frame in the gate to the full frame and back into a scene (the sheet, the gate)    default 'gate-punch'
//   pick     the cell the pencil ringed on the contact sheet to the full frame                    default 'sheet-pick'
// content.moves = { role: id } picks another adapter for a role. To plug in a new transition, add an adapter here:
// { device, beats, create(env, use) } where create returns { paint(ctx, p) or paint(ctx, s), track(…) }. The
// choreography reads only `device` and `beats` through moveOf(), so a swapped transition keeps every timing check.
//
// env (from film.js): { modules: { name: module }, PAL, F }; use: the params of one use (cells, rects, images, the
// scene drawn underneath). Nothing here touches the DOM at import, so Node can read moveOf().

export const ADAPTERS = {
  advance: {
    'strip-advance': {
      device: 'strip-advance', beats: 0.25,
      // one strip (a reel of cells) at scale k, its gate at cx; paint(ctx, s, { track }) draws it with cell s registered
      create(env, { cells, cx = 960, top = 156, k = 1, veil = 0.55, end }) {
        const M = env.modules['strip-advance'];
        const P = { ...M.defaults, material: 'film', beats: 0.25, cells, cx, top, k, veil, end: end ?? cells.length, ground: false, colors: env.PAL, fonts: env.F };   // a pull-down is a quarter beat (the module's default is 1)
        return {
          P,
          paint: (ctx, s, extra = {}) => M.paint(ctx, { s }, { ...P, ...extra }),
          // a curve from cell a to b at p (claw, brake, run-out), as the module computes it
          at: (a, b, curve, p) => M.at(p, { ...P, from: a, to: b, curve }).s,
          track: (s) => M.track({ s }, P),
        };
      },
    },
  },
  punch: {
    'gate-punch': {
      device: 'gate-punch', beats: 1,
      create(env, { rect, direction, ease, image, crop, small, under }) {
        const M = env.modules['gate-punch'];
        const P = { ...M.defaults, rect, direction, ease, image, crop, small, under, ground: false, colors: env.PAL };
        return { P, paint: (ctx, p) => M.paint(ctx, M.at(p, P), P), track: (p) => M.track(M.at(p, P), P), rest: (side) => M.rest(side, P) };
      },
    },
  },
  pick: {
    'sheet-pick': {
      device: 'sheet-pick', beats: 1,
      create(env, { rect, image, crop, small, under, seed }) {
        const M = env.modules['sheet-pick'];
        const P = { ...M.defaults, rect, image, crop, small, under, seed, ease: 'out', ground: false, colors: env.PAL };
        return { P, paint: (ctx, p) => M.paint(ctx, M.at(p, P), P), track: (p) => M.track(M.at(p, P), P), rest: (side) => M.rest(side, P) };
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

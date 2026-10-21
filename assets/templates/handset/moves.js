// moves.js — Handset's four pluggable moves. Each role is filled by an adapter over a hand-off module; the choreography
// (choreo.js) reads only an adapter's `beats` and `device`, so a swapped move keeps every timing check, and film.js
// and score.mjs call only the functions below. `content.moves = { flip: 'other-id' }` picks another adapter for a role.
//
//   push    the screen's viewport moves to a region of the same capture (a push in, a pull back, a pan)
//           curve(p) → u, 0..1: how far along the log-zoom path between the two views (asset.js zoomBetween)
//   hop     the light moves from one band region to the next on a still capture
//           band(p, [y0, h0], [y1, h1]) → [y, h] in source px
//   scroll  the screen re-enacts the page's own scroll to another stop of the same capture (a T2 device)
//           curve(p) → u, as push; optional screen(g, p, env) paints the screen during the move instead (env below)
//   flip    the surface changes: the screen shows another capture (a T2 device)
//           paint(g, p, env), track(p, env) → screen points (for the motion blur), swap: the p of the content change
//           env: { faces: [canvas from, canvas to] (the whole device painted on either side), box: the device's box
//           in frame px, colors (palette), variant: 'right' | 'left' (two flips in a row turn opposite ways) }
//
// At p = 0 and p = 1 an adapter must draw exactly what the template draws on either side, or the move pops.
// Adding a transition (TEMPLATE.md, Moves): put the module in lib/handoffs/ (or keep it in the film), then add an entry
// to ADAPTERS[role] below with its device name (T2 roles), beats and the functions of the role.
import { cubicInOut } from './lib/motion.js';
import viewportPush from './lib/handoffs/viewport-push.js';
import spotlightBand from './lib/handoffs/spotlight-band.js';
import deviceFlip from './lib/handoffs/device-flip.js';

const flipParams = (env) => ({
  window: { cx: env.box.x + env.box.w / 2, cy: env.box.y + env.box.h / 2 },
  perspective: 2200, shade: 0.6, strips: 120, ground: false,
  colors: { ground: env.colors.bg, line: env.colors.lidEdge },
});
// device-flip turns one way; the 'left' variant mirrors its angle, so the device turns the other way about the same axis
const flipState = (p, variant) => { const S = deviceFlip.at(p); return variant === 'left' ? { ...S, th: -S.th } : S; };

export const ADAPTERS = {
  push: {
    'viewport-push': {
      beats: 1,
      // the module's own curve: the move takes 0.8 of its window, cubic in-out
      curve: (p) => viewportPush.at(p * 0.8).u,
    },
  },
  hop: {
    'spotlight-band': {
      beats: 1,
      band: (p, from, to) => { const S = spotlightBand.at(p, { from: { band: [0, from[0], 0, from[1]] }, to: { band: [0, to[0], 0, to[1]] } }); return [S.y, S.h]; },
    },
  },
  scroll: {
    // local to this template (TEMPLATE.md, Library and local code): one captured page segment scrolls under the glass
    'page-scroll': {
      device: 'page-scroll', beats: 2,
      curve: (p) => cubicInOut(p),
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

export const DEFAULTS = { push: 'viewport-push', hop: 'spotlight-band', scroll: 'page-scroll', flip: 'device-flip' };

// moveOf(content, role) → the adapter content.moves picks for the role, or the default; an unknown id throws.
export const moveOf = (content, role) => {
  const id = content?.moves?.[role] ?? DEFAULTS[role];
  const a = ADAPTERS[role]?.[id];
  if (!a) throw new Error(`moves.${role}: '${id}' is not in moves.js ADAPTERS.${role} (${Object.keys(ADAPTERS[role] ?? {}).join(', ')})`);
  return { id, ...a };
};

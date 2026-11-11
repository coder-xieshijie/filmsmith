// moves.js — the Scroll template's moves, pluggable. Each role is one transition of the shared hand-off library
// (lib/handoffs/), reduced to what the template needs from it: the device id and length the choreography times, and
// the curve (progress 0 → 1, exact at both ends) the picture moves the sheet by. The sheet itself is the template's own
// painter (film.js): it mixes strips, quote bands, cuts and an unfolding panel, which the modules' page painters
// cannot express (TEMPLATE.md, "Moves"); their curves and the section-lock rule are used unchanged.
//
//   detent  a short flick to the next paragraph (T1)                       default 'scroll-reel' momentum, 1 beat
//   reel    a long flick through what is not read, braking on a section (T2)  default 'scroll-reel' momentum, 2 beats
//   fling   back to the top before the lock-up (T2)                        default 'scroll-fling', 2 beats
//   unfold  a row opens in place on what it describes (T2)                  default 'unfold', 2 beats
//   roll    the paper roll: the opening's unroll (T2) and the closing's roll-up   default 'roll'
// content.moves = { role: id } picks another adapter. Add one as { device, beats, curve(p) }; the choreography reads
// only device and beats through moveOf(), so a swapped curve keeps every timing check. Nothing here touches the DOM.
import { momentum, fling } from './lib/handoffs/scroll-reel.js';
import { flick } from './lib/handoffs/stage.js';
import unfold from './lib/handoffs/unfold.js';

const cubicInOut = (p) => unfold.at(p, { height: 1 }).h;      // the unfold module's own ease

export const ADAPTERS = {
  detent: {
    'scroll-reel': { device: 'scroll-reel', beats: 1, tier: 'T1', curve: (p) => momentum(p, 5.5) },
    'scroll-reel-flick': { device: 'scroll-reel', beats: 1, tier: 'T1', curve: (p) => flick(p, 0.12, 5) },
  },
  reel: {
    'scroll-reel': { device: 'scroll-reel', beats: 2, tier: 'T2', curve: (p) => momentum(p, 6.5) },
    'scroll-reel-flick': { device: 'scroll-reel', beats: 2, tier: 'T2', curve: (p) => flick(p, 0.1, 5) },
  },
  fling: {
    'scroll-fling': { device: 'scroll-fling', beats: 2, tier: 'T2', curve: (p) => fling(p, 12) },
  },
  unfold: {
    unfold: { device: 'unfold', beats: 2, tier: 'T2', curve: cubicInOut },
  },
  roll: {
    roll: { device: 'roll', beats: 2, tier: 'T2', curve: (p) => momentum(p, 4.2), up: (p) => momentum(p, 5) },
  },
};

// the move filling a role: { role, id, device, beats, tier, curve }
export const moveOf = (role, id) => {
  const table = ADAPTERS[role] ?? {};
  const key = id ?? Object.keys(table)[0];
  const a = table[key];
  if (!a) throw new Error(`moves.${role}: no adapter "${key}"; known: ${Object.keys(table).join(', ')} (add one in moves.js)`);
  return { role, id: key, ...a };
};
export const roles = Object.keys(ADAPTERS);

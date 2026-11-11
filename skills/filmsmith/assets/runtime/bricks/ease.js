// ease.js — the named curves every brick eases with (SPEC 3.1), and the camera shake they share. Merges into
// runtime motion.js when the first batch moves into the skill; bricks import it as ../../ease.js until then.
//
// The seven cubic-bezier control points are the named presets of video-shotcraft demos/_fixtures/Polish.tsx (EASE),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0 (see ../NOTICE.md). Changes: written on
// runtime motion.js bez() instead of the upstream solver; `brake` and `whip` added.
import { bez, clamp } from '../motion.js';
import { noise1 } from '../rng.js';

export const EASE = {
  snappy: bez(0.16, 1, 0.3, 1),        // strong ease-out (≈ expo out): entries, a push that lands
  out: bez(0.22, 1, 0.36, 1),          // softer ease-out (≈ quint out): secondary entries, followers
  smooth: bez(0.65, 0, 0.35, 1),       // symmetric in-out: changes of place, camera pans
  swift: bez(0.4, 0, 0.2, 1),          // asymmetric in-out (quick start, very soft landing): general moves
  exit: bez(0.7, 0, 0.84, 0),          // strong ease-in (≈ quart in): exits, a throw off frame
  anticip: bez(0.5, -0.32, 0.25, 1),   // pulls back about 5 % then goes: before a big move
  overshoot: bez(0.34, 1.45, 0.64, 1), // passes about 8 % then settles: pops, landings
  linear: (u) => clamp(u),
  // window-portal's acceleration: slow, fast, slow (the card that becomes a window)
  portal: bez(0.7, 0, 0.3, 1),
};
export const ease = (name) => (typeof name === 'function' ? name : EASE[name] || EASE.linear);

// Progress of the window [a, a + d] of u, eased; 0 before, 1 after.
export const ramp = (u, a, d, curve = 'snappy') => ease(curve)(clamp((u - a) / Math.max(1e-9, d)));
// Linear mix without clamping (overshoot and anticipation curves leave [0, 1] on purpose).
export const mixN = (a, b, u) => a + (b - a) * u;

// A camera shake that dies out: amplitude amp px over u in [0, 1] (1 at u = 0, exactly 0 at u = 1), seeded noise in x
// and y at `freq` cycles over the window. Pure: shake(u) is the same whoever asks.
export const shake = (u, { amp = 18, freq = 9, seed = 1 } = {}) => {
  if (u <= 0 || u >= 1) return [0, 0];
  const k = (1 - u) * (1 - u);
  return [(noise1(u * freq, seed) * 2 - 1) * amp * k, (noise1(u * freq, seed + 7) * 2 - 1) * amp * k];
};

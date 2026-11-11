// time.js — time-rewriting helpers (SPEC 3.1): a brick that changes when things happen, not what is drawn.
// Merges into the runtime when the first batch moves into the skill.
import { clamp } from '../motion.js';

// Hold each value for `every` frames: the progress p of a move lasting `frames` frames, stepped (animation on threes).
export const quantize = (p, every, frames) => {
  if (!(every > 1) || !(frames > 0)) return p;
  const f = Math.floor(clamp(p) * frames + 1e-9);
  return clamp(Math.floor(f / every) * every / frames);
};

// Piecewise-linear remap of time through keys [[t, value], …] (sorted by t); flat before the first and after the last.
export const remap = (t, keys) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) return t1 === t0 ? v1 : v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
  }
  return keys[keys.length - 1][1];
};

// flash.mjs — flashes by area (WCAG 2.2 SC 2.3.1; ITU-R BT.1702).
//
// A general flash is a pair of opposing changes in relative luminance of 0.1 or more where the darker
// state is below 0.8. Windows of 1/3 × 1/3 and 1/4 × 1/4 of the frame slide over a 12 × 12 grid of cells
// (one cell steps), so a flash confined to part of the screen is caught; the window's mean luminance
// stands in for "an area of about a third of the frame" (WCAG's 10° field at typical viewing distance).
// A red flash is a pair of opposing changes of 20 or more in (R − G − B) × 320 (linear RGB) where one
// state is saturated red, R / (R + G + B) ≥ 0.8 (WCAG 2.0 definition). Counted separately.
// Limit: at most 3 flashes (6 transitions) in any 1 s.

import { GRID, NC } from './picture.mjs';

// Transitions (indices of extrema) with hysteresis `th`; valid(low, high) gets the frame indices of the
// swing's low and high ends and decides whether it counts.
const transitions = (s, th, valid) => {
  const ext = [];
  let trend = 0, k = 0, lo = 0, hi = 0;
  for (let i = 1; i < s.length; i++) {
    if (trend === 0) {
      // Before the first swing, measure from the lowest and highest values so far.
      if (s[i] < s[lo]) lo = i;
      if (s[i] > s[hi]) hi = i;
      if (s[i] - s[lo] >= th && valid(lo, i)) { trend = 1; ext.push(lo); k = i; }
      else if (s[hi] - s[i] >= th && valid(i, hi)) { trend = -1; ext.push(hi); k = i; }
    } else if (trend === 1) {
      if (s[i] > s[k]) k = i;
      else if (s[k] - s[i] >= th && valid(i, k)) { ext.push(k); trend = -1; k = i; }
    } else {
      if (s[i] < s[k]) k = i;
      else if (s[i] - s[k] >= th && valid(k, i)) { ext.push(k); trend = 1; k = i; }
    }
  }
  if (trend !== 0) ext.push(k);
  return ext.slice(1); // the frame where each transition completes (its extremum)
};

// Most transitions inside any `fps`-frame window.
const worstSecond = (ends, fps) => {
  let best = 0, at = -1;
  for (let i = 0, j = 0; i < ends.length; i++) {
    while (j < ends.length && ends[j] < ends[i] + fps) j++;
    if (j - i > best) { best = j - i; at = ends[i]; }
  }
  return { count: best, at };
};

export const flashes = (pic, fps = 30) => {
  const n = pic.n;
  const windows = [];
  for (const size of [GRID / 3, GRID / 4]) for (let y = 0; y + size <= GRID; y++) for (let x = 0; x + size <= GRID; x++) windows.push({ x, y, size });
  const blank = () => ({ flashes: 0, at: null, window: null });
  const general = blank(), red = blank(), bySize = { third: { general: blank(), red: blank() }, quarter: { general: blank(), red: blank() } };
  const L = new Float64Array(n), V = new Float64Array(n), sat = new Uint8Array(n);
  for (const w of windows) {
    for (let f = 0; f < n; f++) {
      const c = pic.cells[f];
      let r = 0, g = 0, b = 0, l = 0;
      for (let yy = w.y; yy < w.y + w.size; yy++) for (let xx = w.x; xx < w.x + w.size; xx++) {
        const k = (yy * GRID + xx) * 4;
        r += c[k]; g += c[k + 1]; b += c[k + 2]; l += c[k + 3];
      }
      const a = w.size * w.size;
      r /= a; g /= a; b /= a; l /= a;
      L[f] = l;
      V[f] = Math.max(0, (r - g - b) * 320);
      sat[f] = r + g + b > 0 && r / (r + g + b) >= 0.8 ? 1 : 0;
    }
    const gw = worstSecond(transitions(L, 0.1, (lo) => L[lo] < 0.8), fps);
    const rw = worstSecond(transitions(V, 20, (lo, hi) => sat[lo] || sat[hi]), fps);
    const box = { x: Math.round((w.x * 1920) / GRID), y: Math.round((w.y * 1080) / GRID), w: Math.round((w.size * 1920) / GRID), h: Math.round((w.size * 1080) / GRID) };
    const sz = bySize[w.size === GRID / 3 ? 'third' : 'quarter'];
    for (const [acc, c] of [[general, gw], [red, rw], [sz.general, gw], [sz.red, rw]]) if (c.count / 2 > acc.flashes) Object.assign(acc, { flashes: c.count / 2, at: c.at / fps, window: box });
  }
  return { general, red, bySize, windows: windows.length, cells: NC };
};

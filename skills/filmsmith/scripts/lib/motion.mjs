// motion.mjs — motion, stillness and timing measurements on picture.mjs output.
//
// Block change = mean |Δluma| over a 20×20 block at 320×180 inside the content mask (0–255 scale) for
// stillness; the event model (channel 'colour') uses max(|ΔR|, |ΔG|, |ΔB|) so a colour-only change
// counts as an event. On encoder keyframes the median block change is subtracted first (the refresh is
// uniform; motion is not).
//
// Noise model: grain and codec noise depend on the colour underneath (grain on a saturated field moves
// the channels more than on near-black paper). Each block's mean colour falls in one of 512 bins; a bin's
// noise floor is the 5th percentile of block changes seen in that colour over the film, and its
// threshold 2 × floor + 0.1, clamped to 0.3–3 (draft; checked against the seven mode films' known holds,
// 2026-10). Bins seen fewer than 200 times use the film-wide floor. On top of that, a block whose change
// stays at a steady low level over the surrounding second (grain re-drawn every frame, an ambient drift)
// has its threshold raised to that level (at most VISIBLE). A frame is still when no block in the mask
// exceeds its own threshold; `excess` is the largest amount by which any block does.

import { NB } from './picture.mjs';

export const VISIBLE = 3; // a block change of 3 levels is plainly visible motion (flow check, draft)
export const quantile = (arr, p) => { const s = Float64Array.from(arr).sort(); return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))] : NaN; };
const thrOf = (floor) => Math.min(3, Math.max(0.3, 2 * floor + 0.1));

export const motionModel = (pic, keyTimes = [], fps = 30, { channel = 'luma' } = {}) => {
  const n = pic.n, keys = new Set(keyTimes.map((t) => Math.round(t * fps)));
  // Keyframe correction: subtract the frame's median block change.
  const d = (channel === 'colour' ? pic.blocksC : pic.blocks).map((b, f) => {
    if (!keys.has(f) || f === 0) return b;
    const vals = []; for (let k = 0; k < NB; k++) if (pic.blockIn[k]) vals.push(b[k]);
    const med = quantile(vals, 0.5);
    return Float32Array.from(b, (v) => Math.max(0, v - med));
  });
  // Noise floor per colour bin.
  const perBin = new Map(), all = [];
  for (let f = 1; f < n; f++) for (let k = 0; k < NB; k++) {
    if (!pic.blockIn[k]) continue;
    const bin = pic.bins[f][k];
    if (!perBin.has(bin)) perBin.set(bin, []);
    perBin.get(bin).push(d[f][k]);
    all.push(d[f][k]);
  }
  const globalFloor = quantile(all, 0.05);
  const binThr = new Map();
  for (const [bin, v] of perBin) binThr.set(bin, thrOf(v.length >= 200 ? quantile(v, 0.05) : globalFloor));
  const thr = pic.bins.map((bb) => Float32Array.from(bb, (bin) => binThr.get(bin) ?? thrOf(globalFloor)));
  // Stationary low-level change (grain drawn per frame, a slow ambient drift) is not motion: a block's
  // threshold rises to 2 × the 25th percentile of its own change over the surrounding second + 0.1,
  // capped at VISIBLE, so only a change that stands out from what that block was doing counts.
  const half = Math.round(fps / 2), win = new Float64Array(2 * half + 1);
  for (let k = 0; k < NB; k++) {
    if (!pic.blockIn[k]) continue;
    for (let f = 1; f < n; f++) {
      let c = 0;
      for (let j = Math.max(1, f - half); j <= Math.min(n - 1, f + half); j++) win[c++] = d[j][k];
      const w = win.subarray(0, c).sort();
      const local = Math.min(VISIBLE, 2 * w[Math.floor(0.25 * (c - 1))] + 0.1);
      if (local > thr[f][k]) thr[f][k] = local;
    }
  }
  const raw = new Float64Array(n), excess = new Float64Array(n).fill(-1);
  for (let f = 1; f < n; f++) {
    let mx = 0, ex = -Infinity;
    for (let k = 0; k < NB; k++) {
      if (!pic.blockIn[k]) continue;
      const v = d[f][k];
      if (v > mx) mx = v;
      if (v - thr[f][k] > ex) ex = v - thr[f][k];
    }
    raw[f] = mx; excess[f] = ex;
  }
  const t = [...binThr.values()];
  return { n, d, thr, raw, excess, floor: globalFloor, thrRange: [Math.min(...t), Math.max(...t)], thrGlobal: thrOf(globalFloor) };
};

const still = (M, f) => M.excess[f] < 0;

// Longest run of still frames in [f0, f1).
export const longestStill = (M, f0, f1) => {
  let run = 0, best = 0, at = f0;
  for (let f = Math.max(1, f0); f < Math.min(f1, M.n); f++) {
    if (still(M, f)) { run++; if (run > best) { best = run; at = f - run + 1; } } else run = 0;
  }
  return { frames: best, at };
};

// All still runs at least minFrames long.
export const stillRuns = (M, minFrames) => {
  const out = [];
  let start = -1;
  for (let f = 1; f <= M.n; f++) {
    const s = f < M.n && still(M, f);
    if (s && start < 0) start = f;
    if (!s && start >= 0) { if (f - start >= minFrames) out.push({ from: start, to: f }); start = -1; }
  }
  return out;
};

export const stillFrames = (M, f0, f1) => { let c = 0; for (let f = Math.max(1, f0); f < Math.min(f1, M.n); f++) if (still(M, f)) c++; return c; };

// Beats where fewer than 20 % of frames show visible motion are slow (flow check, draft). Returns the
// longest run of consecutive slow beats.
export const slowRun = (M, { beat, t0 = 0, fps = 30 }) => {
  const nb = Math.floor((M.n / fps - t0) / beat);
  let run = 0, best = 0, at = 0, slow = 0;
  for (let k = 0; k < nb; k++) {
    const f0 = Math.round((t0 + k * beat) * fps), f1 = Math.round((t0 + (k + 1) * beat) * fps);
    let c = 0, n = 0;
    for (let f = Math.max(1, f0); f < Math.min(f1, M.n); f++) { n++; if (M.raw[f] >= VISIBLE) c++; }
    const isSlow = n > 0 && c / n < 0.2;
    if (isSlow) { slow++; run++; if (run > best) { best = run; at = k - run + 1; } } else run = 0;
  }
  return { beats: best, start: t0 + at * beat, seconds: best * beat, share: nb ? slow / nb : 0, total: nb };
};

// Picture events. Per frame, two strengths from the blocks inside the mask (levels, 0–255):
//   rise  the largest increase of a block's change over the larger of its two previous frames, among
//         blocks above their threshold: something starts, appears, changes colour or is hit
//   fall  the largest decrease of a block's change below the larger of its two previous frames:
//         something stops or lands
//   start the number of blocks that were still for two frames and move on this frame and the next: an
//         eased move or a colour tween begins here even when its biggest change comes frames later
// Measured per block, so a small element (a 32 px dot) is not hidden by a camera move elsewhere.
export const eventStrength = (M) => {
  const rise = new Float64Array(M.n), fall = new Float64Array(M.n), start = new Float64Array(M.n);
  for (let f = 3; f < M.n - 1; f++) {
    const a = M.d[f], a1 = M.d[f + 1], b1 = M.d[f - 1], b2 = M.d[f - 2], th = M.thr[f];
    let r = 0, l = 0, st = 0;
    for (let k = 0; k < NB; k++) {
      const before = Math.max(b1[k], b2[k]);
      if (a[k] >= th[k] && a[k] - before > r) r = a[k] - before;
      if (before - a[k] > l) l = before - a[k];
      if (before < th[k] && a[k] >= th[k] && a1[k] >= th[k]) st++;
    }
    rise[f] = r; fall[f] = l; start[f] = st;
  }
  return { rise, fall, start };
};

// A key has a picture event when one of these stands out near its frame (draft thresholds):
//   onset   rise ≥ 1 within ±1 frame and at least half the strongest rise within ±6 frames
//   start   start ≥ 1 within ±2 frames (an eased start changes too little to measure on its first
//           frame) and at least half the most block starts within ±6 frames
//   settle  for kinds that land or arrive (land, end, turn): motion of at least 1 level in the 1–3 frames before the
//           key falls to a quarter of that, or to still, within 3 frames after it (a contact or an
//           ease-out arriving: the picture changes most just before the key, then rests)
//   stop    for land, end and turn: the picture turns still within ±1 frame after visible motion
// Kinds that start something (accent, stamp, claim) need an onset or a start. "Stands out"
// keeps an event a few frames away from passing for this one.
export const pictureEvent = (M, E, f, { landing = false } = {}) => {
  const near = (arr, tol) => { let v = 0, at = 0; for (let k = f - tol; k <= f + tol; k++) if (k >= 0 && k < M.n && arr[k] > v) { v = arr[k]; at = k - f; } return { v, at }; };
  const wide = (arr) => { let v = 0; for (let k = f - 6; k <= f + 6; k++) if (k >= 0 && k < M.n && arr[k] > v) v = arr[k]; return v; };
  const r = near(E.rise, 1);
  if (r.v >= 1 && r.v >= 0.5 * wide(E.rise)) return { kind: 'onset', off: r.at, strength: Number(r.v.toFixed(1)) };
  const st = near(E.start, 2);
  if (st.v >= 1 && st.v >= 0.5 * wide(E.start)) return { kind: 'start', off: st.at, strength: st.v };
  if (landing && f >= 4 && f + 3 < M.n) {
    // Motion above the noise: how far the busiest block is over its own threshold.
    const mv = (k) => Math.max(0, M.excess[k]);
    const pre = Math.max(mv(f - 3), mv(f - 2), mv(f - 1));
    if (pre >= 1) for (let k = f; k <= f + 3; k++) if (still(M, k) || mv(k) <= pre / 4) return { kind: 'settle', off: k - f, strength: Number(pre.toFixed(1)) };
    for (let k = f - 1; k <= f + 1; k++) if (k >= 2 && still(M, k) && mv(k - 1) >= 1) return { kind: 'stop', off: k - f, strength: Number(mv(k - 1).toFixed(1)) };
  }
  return null;
};

// Handoff (07 C2): the frame pair across the handoff (the last frame of one link and the first of the
// next) against the other frame pairs within ±1 s, its neighbours included (a fast move that runs
// through the handoff is continuous; a jump stands out from the pairs on both sides).
// Ratio = pair / max(p95(ordinary), the smaller of the two neighbouring pairs, 0.5).
export const handoffRatio = (M, f, fps = 30) => {
  const pair = M.raw[f] ?? 0;
  const ord = [];
  for (let k = f - fps; k <= f + fps; k++) if (k >= 1 && k < M.n && k !== f) ord.push(M.raw[k]);
  const p95 = quantile(ord, 0.95), through = Math.min(M.raw[f - 1] ?? 0, M.raw[f + 1] ?? 0);
  return { pair, p95, ratio: pair / Math.max(p95, through, 0.5) };
};

// Settle (07 C6): frames after `f` until the picture stays still for 3 consecutive frames.
export const settleFrames = (M, f, limit) => {
  for (let k = Math.max(1, f); k < Math.min(M.n - 2, f + limit); k++) if (still(M, k) && still(M, k + 1) && still(M, k + 2)) return k - f;
  return null;
};

// Picture onsets (a pixel estimate of T0 changes, principle 5): frames where something starts after stillness
// (the frame moves and the two before were still), or where a block's change rises by ≥ VISIBLE over its two
// previous frames and is the strongest rise within ±3 frames (a new change inside continuous motion). Onsets
// within 3 frames are one. Returns times in seconds. Coarse: a small change on a dark ground can stay under the
// noise threshold, and a move that keeps accelerating counts once.
export const pictureOnsets = (M, E, fps = 30) => {
  const out = [];
  for (let f = 3; f < M.n - 1; f++) {
    const fresh = !still(M, f) && still(M, f - 1) && still(M, f - 2);
    let peak = E.rise[f] >= VISIBLE;
    if (peak) for (let k = f - 3; k <= f + 3; k++) if (k !== f && k >= 0 && k < M.n && E.rise[k] > E.rise[f]) { peak = false; break; }
    if ((fresh || peak) && !(out.length && f - out[out.length - 1] <= 3)) out.push(f);
  }
  return out.map((f) => f / fps);
};

// Large changes (a pixel estimate of T2, full-frame ground changes and expressive transitions): onsets of
// stretches where at least `share` of the blocks inside the mask change visibly (≥ VISIBLE), merged within
// `merge` seconds. Returns [{ t, peak }] (peak: the largest share in the stretch).
export const largeChanges = (pic, M, fps = 30, { share = 0.5, merge = 0.5 } = {}) => {
  let inMask = 0;
  for (let k = 0; k < NB; k++) if (pic.blockIn[k]) inMask++;
  const out = [];
  let on = false;
  for (let f = 1; f < M.n; f++) {
    let c = 0;
    for (let k = 0; k < NB; k++) if (pic.blockIn[k] && M.d[f][k] >= VISIBLE) c++;
    const sh = inMask ? c / inMask : 0;
    if (sh >= share && !on) {
      on = true;
      const last = out[out.length - 1];
      if (last && f / fps - last.end <= merge) last.end = f / fps, last.peak = Math.max(last.peak, sh);
      else out.push({ t: f / fps, end: f / fps, peak: sh });
    } else if (sh >= share) { const last = out[out.length - 1]; last.end = f / fps; last.peak = Math.max(last.peak, sh); }
    else on = false;
  }
  return out.map((x) => ({ t: x.t, peak: Math.round(x.peak * 100) / 100 }));
};

// Longest run of still frames in [f0, f1); a frame inside any of `skip` ([from, to) in frames) ends the run and
// counts nothing (pause holds are measured against their own limit).
export const longestStillOutside = (M, f0, f1, skip = []) => {
  let run = 0, best = 0, at = f0;
  for (let f = Math.max(1, f0); f < Math.min(f1, M.n); f++) {
    if (skip.some(([a, b]) => f >= a && f < b)) { run = 0; continue; }
    if (still(M, f)) { run++; if (run > best) { best = run; at = f - run + 1; } } else run = 0;
  }
  return { frames: best, at };
};

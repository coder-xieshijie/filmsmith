// master.mjs — loudness master with ffmpeg: two-pass loudnorm in linear mode, then a verification pass, then the
// delivery check: the master encoded to AAC 192k (as the renderer delivers it) must keep its true peak ≤ −1.2 dBTP.
// master(in, out, { lufs: -14, tp: -1.5, tone, aac }) → { I, TP, LRA, Smax, limiting, normalization, preLimit, aac, ok, ... }
// writeMeasure(dir, result) → writes <dir>/assets/audio/measure.json, the measured numbers a film may print.

import { spawnSync } from 'node:child_process';
import { mkdir, rm, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { readAudio, writeWav } from './wav.mjs';
import { limit } from './fx.mjs';
import { db, biquad } from './dsp.mjs';

const ff = (args) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error) throw new Error(`ffmpeg not found on PATH (${r.error.message})`);
  return r;
};
const lastJson = (s) => JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));

// measure(path) → { I, TP, LRA, Smax, Mmax } via ebur128 with true peak. Smax / Mmax are the highest short-term
// (3 s) and momentary (400 ms) loudness in LUFS; EBU R128 s1 asks Smax <= I + 5 LU for short-form content.
export const measure = (path) => {
  const r = ff(['-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-']);
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const num = (re) => { const m = re.exec(s); return m ? Number(m[1]) : NaN; };
  let Smax = -Infinity, Mmax = -Infinity;
  for (const m of r.stderr.matchAll(/M:\s*(-?[\d.]+) S:\s*(-?[\d.]+)/g)) { Mmax = Math.max(Mmax, Number(m[1])); Smax = Math.max(Smax, Number(m[2])); }
  return { I: num(/I:\s+(-?[\d.]+|-inf) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), Smax, Mmax };
};

// Low band soft clip (tone 'v2'): split at 120 Hz (Linkwitz-Riley, 4th order), round the low band's peaks to at
// most 9 dB over its own RMS with tanh, sum back. Kick and sub peaks stop driving the limiter.
const lowBandClip = (chs, sr) => {
  const n = chs[0].length;
  const lows = chs.map((ch) => biquad(biquad(Float32Array.from(ch), 'lp', 120, 0.7071, 0, sr), 'lp', 120, 0.7071, 0, sr));
  const highs = chs.map((ch) => biquad(biquad(Float32Array.from(ch), 'hp', 120, 0.7071, 0, sr), 'hp', 120, 0.7071, 0, sr));
  let e = 0, c = 0;
  for (const lo of lows) for (let i = 0; i < n; i++) { const v = lo[i] * lo[i]; if (v > 1e-8) { e += v; c++; } }
  const T = Math.sqrt(e / Math.max(1, c)) * db(9);
  if (!(T > 0)) return;
  chs.forEach((ch, k) => { const lo = lows[k], hi = highs[k]; for (let i = 0; i < n; i++) ch[i] = T * Math.tanh(lo[i] / T) + hi[i]; });
};

// Glue compression (tone 'v2'): stereo-linked RMS compressor, 2:1, attack 30 ms, release 200 ms, threshold at the
// 90th percentile of the signal's level, so it takes 1–2 dB off the loudest passages and leaves the rest.
const glue = (chs, sr, { ratio = 2, attack = 0.03, release = 0.2 } = {}) => {
  const n = chs[0].length, env = new Float32Array(n), ka = 1 - Math.exp(-1 / (attack * sr)), kr = 1 - Math.exp(-1 / (release * sr));
  let p = 0;
  for (let i = 0; i < n; i++) {
    let x = 0; for (const ch of chs) x = Math.max(x, ch[i] * ch[i]);
    p += (x - p) * (x > p ? ka : kr);
    env[i] = 10 * Math.log10(p + 1e-12);
  }
  const hist = [];
  for (let i = 0; i < n; i += 480) if (env[i] > -60) hist.push(env[i]);
  if (!hist.length) return 0;
  hist.sort((a, b) => a - b);
  const thr = hist[Math.floor(hist.length * 0.9)];
  let max = 0;
  for (let i = 0; i < n; i++) {
    const over = env[i] - thr;
    if (over <= 0) continue;
    const red = over * (1 - 1 / ratio);
    if (red > max) max = red;
    const g = db(-red);
    for (const ch of chs) ch[i] *= g;
  }
  return max;
};

// aacPeak(path, { bitrate }) → the true peak (dBTP) of `path` encoded to AAC the way HyperFrames delivers it: the
// mixer encodes the mix to AAC 192k and a duration pad or trim may encode that again; the higher of the two
// generations is returned (with both). An encode overshoots a PCM master's true peak, most on a hit out of near
// silence (+2 dB measured on ink's first slam, 2026-10-19).
export const aacPeak = async (path, { bitrate = '192k' } = {}) => {
  const a = `${path}.aac1.m4a`, b = `${path}.aac2.m4a`;
  try {
    for (const [src, dst] of [[path, a], [a, b]]) {
      const r = ff(['-i', src, '-map', '0:a:0', '-vn', '-c:a', 'aac', '-b:a', bitrate, dst]);
      if (r.status !== 0) throw new Error(`master: AAC encode failed\n${r.stderr.slice(-1000)}`);
    }
    const p1 = measure(a).TP, p2 = measure(b).TP;
    return { TP: Math.max(p1, p2), first: p1, second: p2 };
  } finally {
    await rm(a, { force: true }); await rm(b, { force: true });
  }
};

// The delivery check. HyperFrames lowers the whole mix when its AAC encode has a true peak over −1 dBTP ("Audio lowered
// by X dB" in the render log), which took films that open on a hit to −15…−21 LUFS (2026-10-19). After the master,
// the output is encoded to AAC 192k and measured (aacPeak); over `aac.ceiling` (−1.2 dBTP, 0.2 dB under the renderer's
// line) the master runs again with its true-peak target lowered by the excess, so the pre-limiter takes the peaks
// down and the loudness stays on target; up to `aac.passes` (3) times. If it is still over, the gain is lowered by
// the excess (the loudness drops, by much less than the renderer would take). aac: false skips the check.
export const master = async (input, output, opts = {}) => {
  const { tp = -1.5, quiet = false, aac = {} } = opts;
  if (aac === false) return masterOnce(input, output, opts);
  const ceiling = aac.ceiling ?? -1.2, passes = aac.passes ?? 3;
  const log = [];
  let tpUsed = tp, res, peak;
  for (let pass = 0; ; pass++) {
    res = await masterOnce(input, output, { ...opts, tp: tpUsed, quiet: true });
    peak = await aacPeak(output, aac);
    log.push({ tp: Number(tpUsed.toFixed(2)), I: Number(res.I.toFixed(2)), TP: Number(res.TP.toFixed(2)), aacTP: Number(peak.TP.toFixed(2)) });
    if (!(peak.TP > ceiling) || pass >= passes) break;
    tpUsed -= peak.TP - ceiling + 0.1;
  }
  let trimmed = 0;
  if (peak.TP > ceiling) { // the limiter could not hold it: lower the gain by the excess
    trimmed = Number((ceiling - 0.05 - peak.TP).toFixed(2));
    const tmp = `${output}.aactrim.wav`;
    const r = ff(['-i', output, '-af', `volume=${trimmed}dB`, '-c:a', 'pcm_s24le', '-fflags', '+bitexact', '-flags:a', '+bitexact', tmp]);
    if (r.status !== 0) throw new Error(`master: ffmpeg failed\n${r.stderr.slice(-2000)}`);
    await rename(tmp, output);
    const v = measure(output);
    Object.assign(res, { I: v.I, TP: v.TP, LRA: v.LRA, Smax: v.Smax, Mmax: v.Mmax });
    peak = await aacPeak(output, aac);
    res.ok = Math.abs(res.I - (opts.lufs ?? -14)) <= (opts.tolerance ?? 0.5) && res.TP <= tp;
  }
  res.target = { lufs: opts.lufs ?? -14, tp };
  res.aac = { TP: Number(peak.TP.toFixed(2)), ceiling, tp: Number(tpUsed.toFixed(2)), passes: log.length, trim: trimmed, log };
  res.ok = res.ok && !(peak.TP > ceiling);
  if (!quiet) {
    const v = res, p2 = res.normalization, preLimit = res.preLimit;
    console.log(`master: ${output}  I ${v.I.toFixed(1)} LUFS  TP ${v.TP.toFixed(1)} dBTP  LRA ${v.LRA.toFixed(1)} LU  Smax ${v.Smax.toFixed(1)} LUFS  (${p2}${preLimit ? `, pre-limited at ${preLimit.ceiling.toFixed(1)} dBFS, ${preLimit.reduction} dB` : ''}${res.tone === 'v2' ? `, tone v2, glue ${res.glue} dB` : ''})  AAC 192k TP ${res.aac.TP.toFixed(1)} dBTP${log.length > 1 ? ` after ${log.length - 1} re-master(s) at TP ${res.aac.tp.toFixed(1)}` : ''}${trimmed ? `, gain ${trimmed} dB` : ''}  ${res.ok ? 'OK' : 'OUT OF SPEC'}`);
  }
  if (!res.ok) console.warn(`master: target ${res.target.lufs} LUFS / TP <= ${tp} dBTP / AAC TP <= ${ceiling} dBTP not met`);
  return res;
};

// tone: 'v2' — the mastering-chain trial (D4), off by default: low band soft clip and glue compression before
// the loudness stage, then a pre-limit ceiling that uses the headroom the true-peak check leaves (TP target
// −0.6 dB instead of −1.5 dB) with a slower release (150 ms instead of 60 ms), so accents lose less.
const masterOnce = async (input, output, { lufs = -14, tp = -1.5, lra = 20, sr = 48000, quiet = false, tolerance = 0.5, tone = null } = {}) => {
  await mkdir(dirname(output), { recursive: true });
  const v2 = tone === 'v2';
  const tpTarget = tp - 0.3; // headroom for the 192 kHz → 48 kHz resample after loudnorm
  let glueDb = null;
  const source = input;
  if (v2) {
    const ch = readAudio(input, { sr });
    lowBandClip(ch, sr);
    glueDb = Number(glue(ch, sr).toFixed(1));
    input = `${output}.tone.wav`;
    await writeWav(input, ch, sr, { bits: 32 });
  }
  const ln = (extra = '') => `loudnorm=I=${lufs}:TP=${tpTarget}:LRA=${lra}${extra}:print_format=json`;
  const pre = 'aformat=sample_fmts=fltp:channel_layouts=stereo';
  const pass1 = (src) => lastJson(ff(['-i', src, '-af', `${pre},${ln()}`, '-f', 'null', '-']).stderr);

  // Pass 1: measure. If a linear gain to the target would push the true peak over, pre-limit: raise the
  // gain into the kit's look-ahead limiter (sample-peak ceiling 1.5 dB under the true-peak target) until
  // the integrated loudness reaches the target, so loudnorm can stay linear.
  const m0 = pass1(input);
  const tmp = `${output}.prelimit.wav`;
  let src = input, m = m0, preLimit = null, trim = 0, p2, v;
  const needs = Number(m0.input_tp) + (lufs - Number(m0.input_i)) > tpTarget - 0.2;
  for (let attempt = needs ? 1 : 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      const orig = readAudio(input, { sr }), ceiling = v2 ? tpTarget - 0.6 - 0.5 * (attempt - 1) : tpTarget - 1.5 - (attempt - 1);
      let gain = lufs - measure(input).I, reduction = 0;
      for (let k = 0; k < 6; k++) {
        const ch = orig.map((c) => Float32Array.from(c, (x) => x * db(gain)));
        reduction = limit(ch, { sr, ceiling, attack: v2 ? 0.004 : 0.002, release: v2 ? 0.15 : 0.06 });
        await writeWav(tmp, ch, sr, { bits: 32 });
        const d = lufs - measure(tmp).I;
        if (Math.abs(d) < 0.3 || reduction > 18) break;
        gain += d;
      }
      src = tmp; m = pass1(src);
      preLimit = { gain: Number(gain.toFixed(2)), ceiling, reduction: Number(reduction.toFixed(1)) };
    }
    // Pass 2: apply with the measured values, linear mode. loudnorm's own meter reads a few tenths of a LU
    // away from ebur128, so verify with ebur128 and re-apply with a small trim if needed. ffmpeg treats
    // measured_LRA=0 as "not given" and goes dynamic, hence the floor; if loudnorm still reports dynamic,
    // a plain volume gain (true linear) replaces it.
    const lraIn = Math.max(0.1, Number(m.input_lra));
    const meas = `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${lraIn}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    let plain = false, plainFrom = 0;
    trim = 0; p2 = { normalization_type: 'linear' };
    for (let pass = 0; pass < 4; pass++) {
      const post = trim ? `,volume=${trim.toFixed(3)}dB` : '';
      const stage = plain ? `volume=${(lufs - plainFrom).toFixed(3)}dB` : `${ln(meas)},aresample=${sr}`;
      const r = ff(['-i', src, '-af', `${pre},${stage}${post}`, '-ar', String(sr), '-c:a', 'pcm_s24le', '-fflags', '+bitexact', '-flags:a', '+bitexact', output]);
      if (r.status !== 0) throw new Error(`master: ffmpeg failed\n${r.stderr.slice(-2000)}`);
      if (!plain) p2 = lastJson(r.stderr);
      if (p2.normalization_type !== 'linear' && !plain) { plain = true; const ms = measure(src); plainFrom = Math.max(ms.I, lufs - (tp - 0.3 - ms.TP)); /* true peak wins over loudness */ p2 = { normalization_type: 'linear (volume)' }; continue; }
      v = measure(output);
      const d = lufs - v.I;
      if (Math.abs(d) < 0.1 || v.TP + d > tp - 0.1) break;
      trim += d;
    }
    if (v.TP <= tp && Math.abs(v.I - lufs) <= tolerance) break;
  }
  await rm(tmp, { force: true });
  if (v2) await rm(input, { force: true });
  const ok = Math.abs(v.I - lufs) <= tolerance && v.TP <= tp;
  // limiting: the most gain the pre-limiter took off (dB, 0 when the master stayed linear).
  const res = { I: v.I, TP: v.TP, LRA: v.LRA, Smax: v.Smax, Mmax: v.Mmax, limiting: preLimit ? preLimit.reduction : 0, target: { lufs, tp }, tone: v2 ? 'v2' : 'v1', glue: glueDb,
    input: { I: Number(m0.input_i), TP: Number(m0.input_tp) }, normalization: p2.normalization_type, trim: Number(trim.toFixed(2)), preLimit, ok, source, output };
  if (!quiet) {
    console.log(`master: ${output}  I ${v.I.toFixed(1)} LUFS  TP ${v.TP.toFixed(1)} dBTP  LRA ${v.LRA.toFixed(1)} LU  Smax ${v.Smax.toFixed(1)} LUFS  (${p2.normalization_type}${preLimit ? `, pre-limited at ${preLimit.ceiling.toFixed(1)} dBFS, ${preLimit.reduction} dB` : ''}${v2 ? `, tone v2, glue ${glueDb} dB` : ''})  ${ok ? 'OK' : 'OUT OF SPEC'}`);
  }
  if (!ok && !quiet) console.warn(`master: target ${lufs} LUFS / TP <= ${tp} dBTP not met`);
  return res;
};

// writeMeasure(dir, result, extra) — write <dir>/assets/audio/measure.json from master()'s result, so a film can
// print its measured loudness (and anything in `extra`, e.g. { duration, bpm }) instead of a typed number.
// Fields: I, TP, LRA, Smax, Mmax (LUFS / dBTP / LU, one decimal), limiting (dB), target { lufs, tp }, tone, ok.
export const writeMeasure = async (dir, r, extra = {}) => {
  const r1 = (x) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : null);
  const out = { I: r1(r.I), TP: r1(r.TP), LRA: r1(r.LRA), Smax: r1(r.Smax), Mmax: r1(r.Mmax), limiting: r1(r.limiting ?? 0), target: r.target ?? null, tone: r.tone ?? 'v1', ok: !!r.ok, ...extra };
  const path = join(dir, 'assets', 'audio', 'measure.json');
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(out, null, 2) + '\n');
  return path;
};

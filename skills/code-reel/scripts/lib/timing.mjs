// timing.mjs — the film's timing for check-film.
//
// Preferred source: <film-dir>/renders/timing.json, written by lib/fit.mjs (format api 3; api 2 files read too):
//   { api: 3, rulesApi, duration, bpm, beatsPerBar, t0, unit, scenes: [{ i, type, start, end, beats, bars, need,
//     pad, phraseShare, reading: { primary, glance }, rest, turn, climax, reason? }], keys: [{ t, kind, scene }],
//     holds: [{ from, to, scene, pause? }], handoffs: [{ t, scene }], mask: [x, y, w, h], notes,
//     micro: [{ t }], shots: [{ t }], expressive: [{ t, dur, device, variant }], peaks: [{ t, kind, climax }],
//     tiers, limits: { maxStillBars, lastStillBars, holdMaxBeats, ... }, accent? }
// rulesApi (missing in api 2 files: 2) is the api the template's rules declare; ≥ 3 makes the tier checks FAIL.
// Fallback for films made before it: content.js (+ timing.rules.js and lib/timing.js fit()) gives tempo,
// length and the scene table, but no events, holds, handoffs or mask; checks built on those report N/A.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

const normalise = (t, warnings) => {
  const beatsPerBar = num(t.beatsPerBar) ?? 4, bpm = num(t.bpm);
  const beat = bpm ? 60 / bpm : null;
  const scenes = (Array.isArray(t.scenes) ? t.scenes : []).map((s, i) => ({
    i: s.i ?? i, type: String(s.type ?? '?'), start: num(s.start) ?? 0, end: num(s.end) ?? 0,
    rest: s.rest === true, turn: s.turn === true, climax: s.climax === true,
    need: num(s.need), bars: num(s.bars), reading: s.reading ?? null, reason: typeof s.reason === 'string' ? s.reason : null,
  }));
  const timed = (a, f) => (Array.isArray(a) ? a : []).filter((x) => x && num(x.t) != null).map(f);
  const keys = (Array.isArray(t.keys) ? t.keys : []).filter((k) => num(k.t) != null).map((k) => ({ t: k.t, kind: String(k.kind ?? 'key'), scene: k.scene ?? null, drop: k.kind === 'drop' || k.drop === true }));
  const holds = (Array.isArray(t.holds) ? t.holds : []).filter((h) => num(h.from) != null && num(h.to) != null && h.to > h.from).map((h) => ({ from: h.from, to: h.to, scene: h.scene ?? null, ...(h.pause === true ? { pause: true } : {}) }));
  const micro = timed(t.micro, (x) => ({ t: x.t, scene: x.scene ?? null, ...(x.what ? { what: x.what } : {}) }));
  const shots = timed(t.shots, (x) => ({ t: x.t, scene: x.scene ?? null }));
  const expressive = timed(t.expressive, (x) => ({ t: x.t, dur: num(x.dur), device: x.device ?? null, variant: x.variant ?? null, scene: x.scene ?? null }));
  const peaks = timed(t.peaks, (x) => ({ t: x.t, kind: String(x.kind ?? '?'), climax: x.climax === true, scene: x.scene ?? null }));
  const handoffs = (Array.isArray(t.handoffs) ? t.handoffs : []).filter((h) => num(h.t) != null).map((h) => ({ t: h.t, scene: h.scene ?? null }));
  let mask = null;
  if (t.mask != null) {
    const m = t.mask;
    if (Array.isArray(m) && m.length === 4 && m.every((v) => num(v) != null) && m[2] > 20 && m[3] > 20) mask = m;
    else warnings.push(`mask ${JSON.stringify(m)} is not [x, y, w, h] in 1920×1080 pixels; measuring the whole frame`);
  }
  return {
    api: t.api ?? null, rulesApi: num(t.rulesApi) ?? (t.api === 2 ? 2 : null), duration: num(t.duration), bpm, beatsPerBar, beat, bar: beat ? beat * beatsPerBar : null,
    t0: num(t.t0) ?? 0, unit: num(t.unit), scenes, keys, holds, handoffs, mask, micro, shots, expressive, peaks, limits: t.limits ?? null,
    maxStillBars: num(t.limits?.maxStillBars) ?? num(t.maxStillBars) ?? 1, lastStillBars: num(t.limits?.lastStillBars) ?? num(t.lastStillBars) ?? 1.5, accent: t.accent ?? null, notes: t.notes ?? [],
  };
};

// The accent colour for the accent-area measure: timing.json `accent`, else the film's palette preset
// (palettes.js default export, the preset named by content.palette, or content.palette itself when it is
// an object), key `accent`, or `line` for modes whose one accent is the line colour.
const paletteAccent = async (filmDir) => {
  try {
    const ppath = resolve(filmDir, 'palettes.js'), cpath = resolve(filmDir, 'content.js');
    if (!existsSync(ppath) || !existsSync(cpath)) return null;
    const content = (await import(pathToFileURL(cpath).href)).default;
    const mod = await import(pathToFileURL(ppath).href);
    const presets = mod.default ?? mod.PALETTES ?? {};
    const p = typeof content.palette === 'object' && content.palette ? content.palette : presets[content.palette ?? Object.keys(presets)[0]];
    const hex = p?.accent ?? p?.line ?? null;
    return typeof hex === 'string' && /^#[0-9a-f]{6}$/i.test(hex) ? { accent: hex, from: `palettes.js ${content.palette ?? Object.keys(presets)[0]}.${p.accent ? 'accent' : 'line'}` } : null;
  } catch { return null; }
};

export const loadTiming = async (opts = {}) => {
  const t = await loadTimingOnly(opts);
  if (t.accent) t.accentFrom = 'timing.json';
  else if (opts.filmDir) { const a = await paletteAccent(opts.filmDir); if (a) { t.accent = a.accent; t.accentFrom = a.from; } }
  return t;
};

const loadTimingOnly = async ({ filmDir = null, timingPath = null } = {}) => {
  const warnings = [];
  const file = timingPath ? resolve(timingPath) : filmDir ? resolve(filmDir, 'renders', 'timing.json') : null;
  if (file && existsSync(file)) {
    let raw;
    try { raw = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { warnings.push(`${file}: ${e.message}`); raw = null; }
    if (raw) {
      if (raw.api !== 2 && raw.api !== 3) warnings.push(`timing.json api is ${raw.api ?? 'missing'}, expected 2 or 3; reading it as api 3`);
      const content = filmDir ? resolve(filmDir, 'content.js') : null;
      if (content && existsSync(content) && statSync(content).mtimeMs > statSync(file).mtimeMs + 1000) warnings.push('content.js is newer than renders/timing.json: run `npm run fit` and re-render');
      return { source: 'timing.json', file, warnings, ...normalise(raw, warnings) };
    }
  } else if (timingPath) {
    warnings.push(`${timingPath} not found`);
  }
  if (!filmDir) return { source: null, file: null, warnings, ...normalise({}, warnings) };

  // Fallback: content.js, fitted with the mode's own rules when the film has them.
  const cpath = resolve(filmDir, 'content.js');
  if (!existsSync(cpath)) { warnings.push(`no content.js in ${filmDir}`); return { source: null, file: null, warnings, ...normalise({}, warnings) }; }
  const content = (await import(pathToFileURL(cpath).href)).default;
  const rulesPath = resolve(filmDir, 'timing.rules.js'), libPath = resolve(filmDir, 'lib', 'timing.js');
  if (existsSync(rulesPath) && existsSync(libPath)) {
    const { fit } = await import(pathToFileURL(libPath).href);
    const rulesMod = (await import(pathToFileURL(rulesPath).href)).default;
    const t = fit(content, rulesMod);
    const rules = typeof rulesMod === 'function' ? rulesMod(content) : rulesMod;
    const scenes = t.scenes.map((s, i) => ({ i, type: s.type, start: s.start, end: s.end, bars: s.bars, need: s.need, rest: s.rest === true || rules.types?.[s.type]?.rest === true, turn: rules.types?.[s.type]?.turn === true }));
    return { source: 'fit()', file: rulesPath, warnings, ...normalise({ duration: t.duration, bpm: t.bpm, beatsPerBar: t.beatsPerBar, t0: content.t0 ?? 0, scenes, maxStillBars: rules.maxStillBars, lastStillBars: rules.lastStillBars, rulesApi: Number(rules.api ?? 1) || 1, limits: t.limits }, warnings) };
  }
  return { source: 'content.js', file: cpath, warnings, ...normalise({ duration: content.duration, bpm: content.bpm, beatsPerBar: content.beatsPerBar, t0: content.t0 }, warnings) };
};

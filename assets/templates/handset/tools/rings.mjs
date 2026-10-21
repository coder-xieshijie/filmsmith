// tools/rings.mjs — the accent against every ringed region (Node; ffmpeg on PATH). Used by `npm run palettes` and
// `npm run assets`. A ring must read as code over the capture, not as part of it: the accent differs from every colour
// filling ≥ 2 % of the ringed box by ΔE00 ≥ 20 (references/transitions.md, "Real assets"; the same measure as
// lib/handoffs/asset.js ringContrast, on the file's own pixels).
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deltaE00 } from '../lib/handoffs/asset.js';

const FILM = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// (asset, region) pairs the film rings, from the scenes
export const ringed = (content) => {
  const out = new Map(), add = (a, r) => r && out.set(`${a}.${r}`, { asset: a, region: r });
  for (const s of content.scenes ?? []) {
    if (s.type === 'push' && s.ring !== false) add(s.asset, s.region);
    if (['cut', 'claim', 'lockup', 'flip', 'scroll', 'wake'].includes(s.type)) add(s.asset, s.region);
    for (const r of s.rows ?? []) add(s.asset, r.region);
  }
  return [...out.values()];
};

const colours = (file, [x, y, w, h]) => {
  [x, y, w, h] = [x, y, w, h].map(Math.round);
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `crop=${w}:${h}:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });
  const bins = new Map();
  for (let i = 0; i < raw.length; i += 3) { const k = ((raw[i] >> 3) << 10) | ((raw[i + 1] >> 3) << 5) | (raw[i + 2] >> 3); bins.set(k, (bins.get(k) || 0) + 1); }
  const n = raw.length / 3;
  return [...bins].filter(([, c]) => c >= 0.02 * n).map(([k]) => '#' + [(k >> 10) & 31, (k >> 5) & 31, k & 31].map((v) => ((v << 3) | 4).toString(16).padStart(2, '0')).join(''));
};

export const ringReport = async (content, palettes) => {
  const rows = [];
  for (const { asset, region } of ringed(content)) {
    const A = content.assets[asset], box = A.regions[region].box, cs = colours(join(FILM, A.file), box);
    for (const [id, p] of Object.entries(palettes)) {
      let min = Infinity, worst = null;
      for (const c of cs) { const d = deltaE00(p.accent, c); if (d < min) { min = d; worst = c; } }
      rows.push({ preset: id, region: `${asset}.${region}`, min, worst, ok: min >= 20 });
    }
  }
  return rows;
};

// tools/regions.mjs — the accent rule for Split: the seam and its copies run along and across every result region, so
// the palette's accent must differ by ΔE00 ≥ 20 from every colour filling ≥ 2 % of each region a result shows in
// (the part of the asset its pane shows, in the asset's own pixels). ffmpeg decodes each region; colours are binned
// at 4 bits a channel and averaged per bin.
//   regionReport(content, PALETTES) → [{ preset, region, min, worst, ok }]   (palettes.js prints it)
//   regionsOf(content) → [{ id, scene, rect }]                               (tools/check-assets.mjs uses it too)
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), FILM = resolve(HERE, '..');
const { deltaE00 } = await import(pathToFileURL(join(FILM, 'lib/handoffs/asset.js')).href);
const { paneOf, placeOf } = await import(pathToFileURL(join(FILM, 'choreo.js')).href);

// every (asset, scene) the film shows, with the part of the asset inside the scene's pane
export const regionsOf = (content) => {
  const out = [], seen = new Set();
  const add = (id, s, i) => {
    const A = content.assets[id]; if (!A) return;
    const pane = paneOf(s), pl = placeOf(A, pane, A.focus);
    const x0 = Math.max(0, (pane.x - pl.x) / pl.k), y0 = Math.max(0, (pane.y - pl.y) / pl.k);
    const x1 = Math.min(A.size[0], (pane.x + pane.w - pl.x) / pl.k), y1 = Math.min(A.size[1], (pane.y + pane.h - pl.y) / pl.k);
    const rect = [x0, y0, x1 - x0, y1 - y0].map(Math.round), key = `${id}:${rect}`;
    if (rect[2] > 0 && rect[3] > 0 && !seen.has(key)) { seen.add(key); out.push({ id, scene: i, type: s.type, rect, k: pl.k }); }
  };
  content.scenes.forEach((s, i) => {
    const ids = s.type === 'pick' ? s.picks.map((p) => p.result) : s.type === 'file' ? s.pairs.map((p) => p.result)
      : s.type === 'render' ? s.results : s.type === 'diff' ? [s.before, s.after] : [s.result];
    ids.forEach((id) => add(id, s, i));
  });
  return out;
};

const colours = (file, [x, y, w, h]) => {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `crop=${w}:${h}:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 256 << 20 });
  const bins = new Map(), n = buf.length / 3;
  for (let i = 0; i < buf.length; i += 3) {
    const k = ((buf[i] >> 4) << 8) | ((buf[i + 1] >> 4) << 4) | (buf[i + 2] >> 4);
    const e = bins.get(k) || [0, 0, 0, 0];
    e[0]++; e[1] += buf[i]; e[2] += buf[i + 1]; e[3] += buf[i + 2]; bins.set(k, e);
  }
  const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  return [...bins.values()].filter((e) => e[0] / n >= 0.02).map((e) => ({ c: hex([e[1] / e[0], e[2] / e[0], e[3] / e[0]]), share: e[0] / n }));
};

export const regionReport = async (content, PALETTES) => {
  const rows = [];
  for (const r of regionsOf(content)) {
    const big = colours(join(FILM, 'assets/real', content.assets[r.id].file), r.rect);
    for (const [preset, p] of Object.entries(PALETTES)) {
      const d = big.map((b) => ({ ...b, de: deltaE00(p.accent, b.c) })).sort((a, b) => a.de - b.de)[0];
      rows.push({ preset, region: `${r.id} (scene ${r.scene + 1})`, min: d?.de ?? 100, worst: d ? `${d.c} (${(d.share * 100).toFixed(0)} %)` : '-', ok: (d?.de ?? 100) >= 20 });
    }
  }
  return rows;
};

// tools/regions.mjs — the film's highlighted regions against its palette (run by `npm run palettes` and by
// tools/check-assets.mjs). For every band of every exhibit and claim scene in content.js:
//   - ΔE00 ≥ 20 between the accent and every chromatic colour inside the band (references/modes/dossier.md);
//   - the claim's own type under a multiply stroke keeps ≥ 3:1, or ≥ 80 % of the source's contrast when that was
//     already under 3:1; a band that cannot must say `under: true` (the stroke runs under the line), and then the
//     claim's ink must end at least 2 source px above the band's lower edge, where the stroke starts.
// Returns the number of failures; prints one line per band.
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pixels } from './pixels.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const bandsOf = (content) => {
  const out = [];
  let sheet = null;
  content.scenes.forEach((s, i) => {
    if (s.type === 'exhibit') sheet = s;
    if ((s.type === 'exhibit' || s.type === 'claim') && sheet && s.band) out.push({ i, scene: s, sheet, asset: content.assets[sheet.asset], band: s.band, under: s.under === true || content.highlight === 'underline' });
  });
  return out;
};
export const regions = async ({ all = false, log = console.log, lib = null } = {}) => {
  const content = (await import(pathToFileURL(join(ROOT, 'content.js')).href)).default;
  // palettes.js passes itself (`lib`): importing it back from its own top-level await would never settle
  const { PALETTES, regionReport, bandOk } = lib ?? await import(pathToFileURL(join(ROOT, 'palettes.js')).href);
  const ids = all ? Object.keys(PALETTES) : [content.palette];
  let bad = 0;
  for (const id of ids) {
    const P = PALETTES[id];
    log(`\nhighlighted regions — ${id} (${P.accent}) on content.js`);
    for (const b of bandsOf(content)) {
      const px = pixels(join(ROOT, b.asset.file));
      const r = regionReport(P.accent, px, b.band);
      const de = r.minDE == null || r.minDE >= 20;
      const leg = bandOk(r, b.under);
      const clear = !b.under || r.inkBottom == null || r.inkBottom <= b.band[1] + b.band[3] - 2;
      const ok = de && leg && clear;
      if (!ok) bad++;
      const tag = `scene ${b.i + 1} ${b.sheet.asset} [${b.band}]`;
      log(`  ${ok ? 'ok  ' : 'FAIL'} ${tag}: ΔE00 ${r.minDE == null ? '– (no chromatic pixels)' : r.minDE.toFixed(1)}${r.at ? ` (nearest rgb ${r.at})` : ''}; ` +
        (b.under ? `under the line (ink ends at y ${r.inkBottom}, stroke from ${b.band[1] + b.band[3] - 2}${clear ? '' : ': ink crosses the stroke'}; a full stroke would leave ${r.after.toFixed(2)}:1)` : `claim under the stroke ${r.after.toFixed(2)}:1 (source ${r.before.toFixed(2)}:1)${leg ? '' : ': set under: true'}`));
    }
  }
  return bad;
};

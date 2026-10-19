#!/usr/bin/env node
// validate.mjs — check content.js before rendering: the fitted timing table (lib/timing.js fit() with
// timing.rules.js, api 3), character limits, item counts, how each scene is entered (devices.js) and its longest
// still window in beats (≤ 2; hold moves fill longer ones). Exit 1 on errors. Text that still overflows after fitting
// is reported by `npm run check` (console errors from index.html).
import film from './content.js';
import palettes from './palettes.js';
import { planFilm, longestStill } from './scenes.js';
import { report } from './lib/timing.js';

const { laid, cues, errors, warnings, fit } = planFilm(film);
if (!palettes[film.palette]) errors.push(`palette "${film.palette}" is not one of ${Object.keys(palettes).join(', ')}`);
console.log(report({ ...fit, notes: [] }));
console.log(`palette ${film.palette} · ${cues.length} sound cues${film.target ? ` · target ${film.target} s` : ''}`);
const f = (x) => x.toFixed(2).padStart(6);
console.log('\n  #  type        start    end   bars  still  moves  enter          section');
for (const s of laid) console.log(`${String(s.index + 1).padStart(3)}  ${s.type.padEnd(9)} ${f(s.start)} ${f(s.end)} ${String(s.bars).padStart(6)} ${s.type === 'end' ? '  rest' : longestStill(s).toFixed(2).padStart(6)} ${String(s.P.moves.length).padStart(6)}  ${(s.enterBy ?? '—').padEnd(13)}  ${s.sectionLabel}`);
warnings.forEach((w) => console.log('warn: ' + w));
errors.forEach((e) => console.log('ERROR: ' + e));
if (errors.length) process.exit(1);
console.log(warnings.length ? '\nok with warnings (rewrite the flagged copy)' : '\nok');

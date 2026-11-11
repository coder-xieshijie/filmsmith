#!/usr/bin/env node
// tools/contrast.mjs — WCAG contrast of every palette role against the paper (and the accent mark text).
// Text roles need >= 4.5:1; the accent must sit >= 90° of hue away from the line colour so it reads as a
// different kind of mark. Exits 1 if any preset fails.
import palettes from '../palettes.js';

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const hue = (hex) => { const n = parseInt(hex.slice(1), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
const hueGap = (a, b) => { const d = Math.abs(hue(a) - hue(b)) % 360; return Math.min(d, 360 - d); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let fail = 0;
for (const [id, P] of Object.entries(palettes)) {
  const rows = [
    ['ink / paper', ratio(P.ink, P.paper), 4.5],
    ['line / paper', ratio(P.line, P.paper), 4.5],
    ['muted / paper', ratio(P.muted, P.paper), 4.5],
    ['accent / paper', ratio(P.accent, P.paper), 4.5],
    ['onAccent / accent', ratio(P.onAccent, P.accent), 4.5],
    ['accent vs line hue gap (deg)', hueGap(P.accent, P.line), 90],
    ['paper / bg (frame edge)', ratio(P.paper, P.bg), 1.05],
  ];
  console.log(`\n${id} — ${P.name}`);
  for (const [k, r, min] of rows) {
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${k.padEnd(30)} ${r.toFixed(2)}${k.includes('deg') ? '°' : ':1'} (min ${min})`);
  }
}
process.exit(fail ? 1 : 0);

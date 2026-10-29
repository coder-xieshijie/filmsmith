#!/usr/bin/env node
// check-palettes.mjs — contrast and colour-vision checks for every preset in palettes.js.
// Usage (film or template folder): node tools/check-palettes.mjs
// Text roles need >= 4.5:1 against the lightest and the darkest background stop; graphic roles >= 3:1.
// The accent must stay distinct from every neutral it sits next to: OKLab ΔE×100 >= 15 for normal vision
// and >= 8 under simulated protan / deutan (Machado et al. 2009, severity 1), the thresholds of the
// common data-viz palette checks.
import palettes, { roles } from '../palettes.js';

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => hex(h).map(lin);
const lum = (h) => { const [r, g, b] = L(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const M = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
const sim = (h, k) => { const c = L(h); if (!k) return c; const m = M[k]; return m.map((r) => Math.min(1, Math.max(0, r[0] * c[0] + r[1] * c[1] + r[2] * c[2]))); };
const oklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const dE = (a, b, k) => { const p = oklab(sim(a, k)), q = oklab(sim(b, k)); return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };

let fail = 0;
for (const [id, p] of Object.entries(palettes)) {
  const out = [];
  const grounds = roles.grounds.map((g) => p[g]);
  for (const r of roles.text) for (const g of grounds) {
    const c = contrast(p[r], g);
    if (c < 4.5) { fail++; out.push(`FAIL text ${r} ${p[r]} on ${g}: ${c.toFixed(2)}`); }
  }
  for (const r of roles.graphic) for (const g of grounds) {
    const c = contrast(p[r], g);
    if (c < 3) { fail++; out.push(`FAIL graphic ${r} ${p[r]} on ${g}: ${c.toFixed(2)}`); }
  }
  const sep = [];
  for (const [a, b] of roles.separate) {
    const n = dE(p[a], p[b]), pr = dE(p[a], p[b], 'protan'), de = dE(p[a], p[b], 'deutan'), tr = dE(p[a], p[b], 'tritan');
    if (n < 15 || Math.min(pr, de) < 8) { fail++; out.push(`FAIL separation ${a}/${b}: normal ${n.toFixed(1)} protan ${pr.toFixed(1)} deutan ${de.toFixed(1)}`); }
    sep.push(`${a}/${b} ΔE ${n.toFixed(0)} (pro ${pr.toFixed(0)}, deu ${de.toFixed(0)}, tri ${tr.toFixed(0)})`);
  }
  const minText = Math.min(...roles.text.flatMap((r) => grounds.map((g) => contrast(p[r], g))));
  const minGraph = Math.min(...roles.graphic.flatMap((r) => grounds.map((g) => contrast(p[r], g))));
  console.log(`${out.length ? 'FAIL' : 'ok  '} ${id.padEnd(14)} text >= ${minText.toFixed(2)}:1 · graphics >= ${minGraph.toFixed(2)}:1 · ${sep.join(' · ')}`);
  out.forEach((l) => console.log('     ' + l));
}
process.exit(fail ? 1 : 0);

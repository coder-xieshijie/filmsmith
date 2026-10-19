// sheets/arrangement.js — GENERAL ARRANGEMENT. Two-line claim, then input → system → output drawn as boxes
// sized from their lettering, one overall dimension line under the whole arrangement.
import { X0, X1, CW, F, MIN, up, header, sz } from './common.js';

export const plan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  (s.lines || []).forEach((l, i) => env.lim(`lines[${i}]`, l, 18));
  if (!Array.isArray(s.lines) || s.lines.length !== 2) env.err('lines needs exactly 2 entries');
  const title = header(pen, env, s, { lines: s.lines, fonts: [F.claim, F.claim], bases: [330, 500], cues: [c('title'), c('title2')], minSize: 100 });

  env.lim('sub', s.sub, 90);
  const fs = env.fit(s.sub, F.sub, CW, MIN, 'sub');
  pen.text(s.sub, X0, 584, fs, c('sub'), 0.9, { col: 'muted' });

  const fio = { fam: 'mono', w: 500, size: 35 }, fsys = { fam: 'cond', w: 700, size: 140, track: -0.02 };
  const parts = [['input', s.input, fio, 14], ['system', s.system, fsys, 12], ['output', s.output, fio, 14]];
  const W = parts.map(([k, p, f, lim]) => {
    env.lim(`${k}.name`, p?.name, lim);
    env.lim(`${k}.tag`, p?.tag, 18);
    const nameW = pen.measure(p?.name || '', f), tagW = pen.measure(up(p?.tag || ''), F.tag);
    return Math.max(k === 'system' ? nameW + 140 : nameW + 120, tagW + 20, k === 'system' ? 420 : 300);
  });
  const gap = (CW - W[0] - W[1] - W[2]) / 2;
  if (gap < 110) env.err(`input/system/output names are too wide (gap ${gap.toFixed(0)} px < 110)`);
  const xs = [X0, X0 + W[0] + gap, X1 - W[2]];
  const cy = 737;
  parts.forEach(([k, p, f], i) => {
    const sys = k === 'system', h = sys ? 170 : 130, y = cy - h / 2, t = c(k);
    pen.text(up(p?.tag || ''), xs[i], y - 16, F.tag, t, 0.3, { col: 'line' });
    pen.rect(xs[i], y, W[i], h, t, 0.45, sys ? 's2' : 's1');
    if (sys) pen.rect(xs[i] - 10, y - 10, W[i] + 20, h + 20, t + 0.1, 0.45, 'sf');
    pen.text(p?.name || '', xs[i] + W[i] / 2, cy + f.size * 0.35, f, t + 0.27, 0.35, { align: 'center' });
  });
  pen.arrow(xs[0] + W[0] + 10, cy, xs[1] - 10, cy, c('arrow1'), 0.25, 's2', { headSize: 20 });
  pen.arrow(xs[1] + W[1] + 10, cy, xs[2] - 10, cy, c('arrow2'), 0.25, 's2', { headSize: 20 });
  pen.dim(X0, X1, 860, c('dim'), 0.5, 18); // above the title block
  return { title, focus: null };
};

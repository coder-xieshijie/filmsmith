// sheets/parts.js — PARTS LIST. Installation as a bill of materials: numbered balloons (BOM convention) beside
// each step, then the order of use as a chain of chips, then one line of fine print.
import { X0, X1, CW, F, MIN, up, header, sz, spans } from './common.js';

export const plan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 26);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.head2], bases: [310], cues: [c('title')], minSize: 70 });

  const rows = s.rows || [];
  if (rows.length < 1 || rows.length > 3) env.err('rows needs 1–3 entries');
  const fr = { fam: 'mono', w: 400, size: 35 };
  rows.forEach((r, i) => env.lim(`rows[${i}]`, r, 60));
  const colX = 300, textX = 330;
  const rf = rows.map((r, i) => env.fit('› ' + r, fr, X1 - 30 - textX, 28, `rows[${i}]`));
  const rsize = Math.min(...rf.map((f) => f.size), 35); // one size for every row
  const frow = { ...fr, size: rsize };
  const tw = Math.min(CW, Math.max(1000, ...rows.map((r) => textX - X0 + pen.measure('› ' + r, frow) + 50)));
  const ty = 384, hh = 48, rh = 84, th = hh + rows.length * rh;
  const t0 = c('table');
  pen.rect(X0, ty, tw, th, t0, 0.5, 's1');
  pen.seg(X0, ty + hh, X0 + tw, ty + hh, t0 + 0.1, 0.3, 's1');
  pen.seg(colX, ty, colX, ty + th, t0 + 0.1, 0.3, 'sf');
  const head = s.head || ['Item', 'Step'];
  head.forEach((h, i) => env.lim(`head[${i}]`, h, 8));
  const fh = F.tag;
  pen.text(up(head[0]), X0 + 26, ty + 34, fh, t0 + 0.1, 0.3, { col: 'line' });
  pen.text(up(head[1] || ''), textX, ty + 34, fh, t0 + 0.15, 0.3, { col: 'line' });
  rows.forEach((r, i) => {
    const t = c('row' + i), yc = ty + hh + rh * (i + 0.5);
    if (i < rows.length - 1) pen.seg(X0, ty + hh + rh * (i + 1), X0 + tw, ty + hh + rh * (i + 1), t0 + 0.2, 0.3, 'sg');
    pen.circle((X0 + colX) / 2, yc, 24, t - 0.1, 0.3, 's1');
    pen.text(String(i + 1), (X0 + colX) / 2, yc + 9, { fam: 'mono', w: 500, size: 25 }, t + 0.1, 0.2, { align: 'center', col: 'line', mode: 'fade' });
    const sp = [['› ', 'line'], [r, 'ink']];
    pen.text('› ' + r, textX, yc + rsize * 0.36, frow, t, 0.8, { spans: sp });
  });

  // chain of chips: the order of use
  const chips = s.chips || [];
  if (chips.length < 2 || chips.length > 5) env.err('chips needs 2–5 entries');
  chips.forEach((x, i) => env.lim(`chips[${i}]`, x, 16));
  const fc = { fam: 'mono', w: 400, size: 35 };
  const cw = chips.map((x) => pen.measure(x, fc) + 56), cg = 70;
  const total = cw.reduce((a, b) => a + b, 0) + cg * (chips.length - 1);
  if (total > CW) env.err(`chips are ${total.toFixed(0)} px wide; the sheet holds ${CW}`);
  const yb = ty + th;
  env.lim('thenLabel', s.thenLabel, 8);
  pen.text(up(s.thenLabel || 'Then'), X0, yb + 56, fh, c('then'), 0.3, { col: 'line' });
  const cy = yb + 76, ch = 80;
  let x = X0;
  chips.forEach((name, i) => {
    const t = c('chip' + i);
    pen.rect(x, cy, cw[i], ch, t, 0.25, i === 0 ? 's1' : 's2');
    pen.text(name, x + cw[i] / 2, cy + ch / 2 + 10, fc, t + 0.15, 0.25, { align: 'center' });
    if (i < chips.length - 1) pen.arrow(x + cw[i] + 8, cy + ch / 2, x + cw[i] + cg - 6, cy + ch / 2, t + 0.2, 0.12, 's2', { headSize: 16 });
    x += cw[i] + cg;
  });
  if (s.note) {
    const { text, spans: sp } = spans(s.note);
    env.lim('note', text, 90);
    const f = env.fit(text, F.small, CW, MIN, 'note');
    pen.text(text, X0, cy + ch + 62, f, c('note'), 0.6, { col: 'muted', spans: sp });
  }
  return { title, focus: null };
};

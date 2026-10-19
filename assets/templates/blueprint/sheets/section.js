// sheets/section.js — SECTION VIEW. Two artefacts drawn as oblique boxes (ISO 5456-3 cavalier style), cut by
// section line A-A with a detail circle and a leader to the notes; an overall dimension carries the record;
// the output box; an inspection stamp (line colour: the check is a machine's) lands beside the first artefact's
// lettering.
import { rgba } from '../fx.js';
import { X0, X1, CW, F, MIN, up, header, sz, union, fitStamp } from './common.js';

const DX = 60, DY = -45; // oblique depth

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 60);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.6, { col: 'muted' });

  const parts = s.parts || [];
  if (parts.length !== 2) env.err('parts needs exactly 2 entries');
  const fn = { fam: 'cond', w: 600, size: 35 }, fd = F.body, fl = { fam: 'mono', w: 400, size: 25 };
  const y = 470, h = 300;
  const W = parts.map((p, i) => {
    env.lim(`parts[${i}].name`, p.name, 12);
    env.lim(`parts[${i}].desc`, p.desc, 26);
    (p.lines || []).forEach((l, j) => env.lim(`parts[${i}].lines[${j}]`, l, 30));
    if ((p.lines || []).length > 2) env.err(`parts[${i}].lines holds at most 2`);
    return Math.max(360, pen.measure(p.name, fn) + 68, pen.measure(p.desc, fd) + 68, ...(p.lines || []).map((l) => pen.measure(l, fl) + 68));
  });
  const xs = [X0, X0 + W[0] + DX + 70];
  const R = xs[1] + W[1] + DX; // right edge of the second box including depth
  const tb = [c('box1'), c('box2')];
  parts.forEach((p, i) => {
    const x = xs[i], w = W[i], t = tb[i];
    pen.fill([[x, y], [x + DX, y + DY], [x + w + DX, y + DY], [x + w, y]], t + 0.35, 0.3, rgba(P.line, 1), 0.14);
    pen.fill([[x + w, y], [x + w + DX, y + DY], [x + w + DX, y + h + DY], [x + w, y + h]], t + 0.35, 0.3, rgba(P.line, 1), 0.07);
    pen.rect(x, y, w, h, t, 0.5, 's2');
    pen.line([[x, y], [x + DX, y + DY], [x + w + DX, y + DY], [x + w, y]], t + 0.2, 0.4, 's1');
    pen.line([[x + w + DX, y + DY], [x + w + DX, y + h + DY], [x + w, y + h]], t + 0.3, 0.3, 's1');
    pen.text(p.name, x + 32, y + 88, fn, t + 0.3, 0.4);
    pen.text(p.desc, x + 34, y + 130, fd, t + 0.5, 0.4, { col: 'muted' });
    if ((p.lines || []).length) p.lines.forEach((l, j) => pen.text(l, x + 34, y + 205 + j * 50, fl, t + 0.7 + j * 0.2, 0.5));
    else [0, 1, 2].forEach((j) => pen.seg(x + 34, y + 220 + j * 28, x + 34 + (w - 68) * [1, 0.83, 0.92][j], y + 220 + j * 28, t + 0.6 + j * 0.08, 0.3, 'sg'));
  });

  // section line A-A through both boxes, viewing arrows, letters
  const ys = 628, xl = X0 - 30, xr = R + 40, tc = c('cut');
  const fA = { fam: 'mono', w: 600, size: 25 };
  pen.line([[xl, ys], [xr, ys]], tc, 0.6, 's1', { dash: 'dashdot' });
  pen.arrow(xl - 16, ys, xl - 16, ys - 38, tc, 0.15, 's1', { headSize: 12 });
  pen.arrow(xr + 16, ys, xr + 16, ys - 38, tc + 0.5, 0.15, 's1', { headSize: 12 });
  pen.text('A', xl - 58, ys + 10, fA, tc + 0.06, 0.2, { col: 'line' });
  pen.text('A', xr + 34, ys + 10, fA, tc + 0.56, 0.2, { col: 'line' });
  const cutLabel = up(s.cut || 'Section A-A');
  env.lim('cut', s.cut, 14);
  // detail circle on the second artefact, leader up to the notes
  const ccx = xs[1] + W[1] * 0.62, ccy = 690, r = 118;
  pen.circle(ccx, ccy, r, tc, 0.7, 's1', { dash: 'dash' });
  const Nx = R + 110;
  // leader leaves the circle at its right-most point, runs between the lettering rows, then climbs to the notes
  pen.line([[ccx + r, ccy], [R + 30, ccy], [Nx - 60, 452], [Nx - 12, 452]], c('notes') - 0.1, 0.4, 's1');
  const notes = s.notes || [];
  if (notes.length < 1 || notes.length > 2) env.err('notes needs 1–2 entries');
  const marks = ['①', '②'];
  notes.forEach((nt, j) => {
    env.lim(`notes[${j}]`, nt, 30);
    const str = `${marks[j]} ${nt}`, f = env.fit(str, fd, X1 - Nx, MIN, `notes[${j}]`);
    pen.text(str, Nx, 462 + j * 56, f, c('notes') + j * 0.6, 0.5);
  });
  const fcut = F.tag;
  if (Nx + pen.measure(cutLabel, fcut) > X1) env.err('cut label does not fit right of the section');
  pen.text(cutLabel, Nx, ys + 7, fcut, tc + 0.6, 0.4, { col: 'line' });

  // output box with an arrow from the second artefact
  env.lim('output', s.output, 12);
  const fo = { fam: 'mono', w: 600, size: 35 }, ow = pen.measure(s.output || '', fo) + 100;
  if (Nx + ow > X1) env.err('output box does not fit');
  pen.arrow(xs[1] + W[1] + DX * 0.5 + 6, 720, Nx - 8, 720, c('output') - 0.1, 0.2, 's2', { headSize: 18 });
  pen.rect(Nx, 672, ow, 96, c('output'), 0.4, 's2');
  pen.text(s.output || '', Nx + ow / 2, 731, fo, c('output') + 0.25, 0.3, { align: 'center' });

  // overall dimension: the frozen record
  const xr2 = xs[1] + W[1];
  pen.seg(X0, y + h + 8, X0, 846, c('dim'), 0.2, 'sf');
  pen.seg(xr2, y + h + 8, xr2, 846, c('dim'), 0.2, 'sf');
  pen.dim(X0, xr2, 832, c('dim'), 0.5, 14);
  env.lim('dimension', s.dimension, 28);
  if (s.dimension) {
    const word = up(s.stamp?.word || ''), fdim = sz(F.body, 35);
    const sp = word ? [[word, 'line'], [' · ' + s.dimension, 'ink']] : [[s.dimension, 'ink']];
    const str = sp.map((p) => p[0]).join('');
    pen.text(str, (X0 + xr2) / 2, 884, fdim, c('dim') + 0.3, 0.6, { align: 'center', spans: sp });
  }

  let stamp = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    env.lim('stamp.small', s.stamp.small, 18);
    const p = fitStamp(pen, env, s.stamp, { sizes: [70, 50], rot: -8, role: 'line', prefer: [xs[0] + W[0] / 2 + 20, 712], region: [X0 - 40, y - 10, X1, 900], margin: 10, where: 'section stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -8);
    stamp = p.rect;
  }
  return { title, focus: union([X0, y + DY, R - X0, h - DY], stamp), stamp };
};

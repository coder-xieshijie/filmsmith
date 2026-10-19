// sheets/detail.js — DETAIL with leader lines. One-word title; 2–3 rounds of question → answer joined by
// dashed leaders; the answers (your decisions) are bracketed in amber; a summary box; a stamp.
import { E } from '../fx.js';
import { X0, X1, CW, F, MIN, up, header, sz, union, fitStamp } from './common.js';

export const plan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 90);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.9, { col: 'muted' });

  const rows = s.rows || [];
  const n = rows.length;
  if (n < 2 || n > 3) env.err('rows needs 2–3 entries');
  const pitch = n === 3 ? 115 : 140, y0 = 452;
  const fq = { fam: 'cond', w: 500, size: 35 }, fa = { fam: 'cond', w: 700, size: 35 };
  const aw = Math.max(240, ...rows.map((r) => pen.measure(r.a || '', fa) + 80));
  const ax = X1 - aw;
  const ftag = { fam: 'mono', w: 400, size: 25, track: 0.06 };
  const roundWord = up(s.roundLabel || 'Round');
  env.lim('roundLabel', s.roundLabel, 6);
  let focus = null;
  rows.forEach((r, i) => {
    env.lim(`rows[${i}].q`, r.q, 56);
    env.lim(`rows[${i}].a`, r.a, 12);
    const y = y0 + i * pitch, t = c('row' + i), ta = c('ans' + i);
    pen.rect(X0, y, 150, 58, t - 0.1, 0.3, 's1');
    pen.text(`${roundWord} ${i + 1}`, X0 + 75, y + 36, ftag, t + 0.08, 0.2, { align: 'center', col: 'line', mode: 'fade' });
    const f = env.fit(r.q, fq, ax - 330 - 18 - 70, 25, `rows[${i}].q`);
    const qi = pen.text(r.q, 330, y + 44, f, t, 0.55);
    const qe = qi.x + qi.w + 18, ym = y + 29;
    pen.line([[qe, ym], [ax - 12, ym]], ta - 0.25, 0.25, 's1', { dash: 'dash' });
    pen.head(ax - 2, ym, 0, ta - 0.02, 'line', 14);
    pen.rect(ax, y - 4, aw, 66, ta - 0.2, 0.3, 's2');
    pen.text(r.a, ax + aw / 2, y + 44, fa, ta, 0.3, { align: 'center', mode: 'pop' });
    focus = union(focus, [ax, y - 4, aw, 66]);
  });
  // amber bracket: these answers are your decisions
  const yb0 = y0 - 4, yb1 = y0 + (n - 1) * pitch + 62;
  pen.line([[X1 + 16, yb0], [X1 + 36, yb0], [X1 + 36, yb1], [X1 + 16, yb1]], c('summary'), 0.35, 'sa');

  // summary box
  env.lim('summary', s.summary, 48);
  env.lim('note', s.note, 28);
  const fsum = { fam: 'mono', w: 500, size: 25 }, fnote = sz(F.small, 25, { track: 0.04 });
  const sy = yb1 + 46;
  const bw = Math.max(pen.measure(up(s.summary), fsum), pen.measure(s.note || '', fnote)) + 60;
  pen.rect(X0, sy, bw, 100, c('summary'), 0.5, 's1');
  pen.text(up(s.summary), X0 + 30, sy + 42, fsum, c('summary') + 0.2, 0.55);
  if (s.note) pen.text(s.note, X0 + 30, sy + 82, fnote, c('note'), 0.45, { col: 'line' });

  // stamp (a person's decision: amber), right of the summary, clear of every answer and caption
  let stamp = null, stampSize = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    env.lim('stamp.small', s.stamp.small, 16);
    const p = fitStamp(pen, env, s.stamp, { sizes: [70, 50], rot: -5, prefer: [X1 - 200, sy + 50], region: [X0 + bw + 20, yb1 + 12, X1 + 20, 930], where: 'detail stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -5);
    stamp = p.rect;
    stampSize = [p.st.w, p.st.h]; // the issue's flood grows out of the stamp's own outline (film.js)
  }
  return { title, focus: union(union(focus, stamp), [X0, sy, bw, 100]), stamp, stampSize, ease: E.quartOut };
};

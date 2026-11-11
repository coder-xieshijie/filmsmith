// sheets/release.js — RELEASE TITLE BLOCK. Kicker on a dimension line, the name very large, the parts as
// tags, the URL in a framed field, the licence line, and a key plan of every sheet with the drafting route.
// On the film's last downbeat the drawing is issued: a framed status (default RELEASED, the ISO 7200 document
// status) letters itself in at the bottom right, so the closing hold ends on a move, not a dead stop.
import { X0, X1, CW, F, MIN, up, header, sz, spans } from './common.js';

export const plan = (pen, env, s) => {
  const { c, layout } = env;
  env.lim('hud', s.hud, 24);
  env.lim('label', s.label, 36);
  pen.text(up(s.label || 'Release'), X0, 180, F.label, c('kicker') - 0.42, 0.4, { col: 'line' });

  // key plan (top right): one cell per sheet, the serpentine route through them
  const kw = 90, kh = 58, kg = 14, cols = layout.cols, rows = layout.rows;
  const keyW = cols * kw + (cols - 1) * kg, keyH = rows * kh + (rows - 1) * kg;
  const kx = X1 - keyW, ky = 326;
  const cellXY = (k) => { const { col, row } = layout.cellOf(k); return [kx + col * (kw + kg), ky + row * (kh + kg)]; };
  const fk = { fam: 'mono', w: 400, size: 25 };
  for (let k = 0; k < layout.n; k++) {
    const [x, y] = cellXY(k), t = c('key') + k * 0.05;
    pen.rect(x, y, kw, kh, t, 0.2, 'sf');
    pen.text(String(k + 1), x + 10, y + 27, fk, t + 0.1, 0.1, { col: 'line', mode: 'fade' }); // above the route
  }
  const route = [...Array(layout.n).keys()].map((k) => { const [x, y] = cellXY(k); return [x + kw / 2, y + 42]; });
  pen.line(route, c('key') + 0.3, 0.7, 's2', { width: 3 });
  pen.dot(route[route.length - 1][0], route[route.length - 1][1], 6, c('key') + 1.0, 'ink', { pop: true });
  pen.text(`KEY · SHEETS 1–${layout.n}`, kx, ky - 16, sz(F.tag, 25, { track: 0.08 }), c('key') + 0.3, 0.4, { col: 'line' });

  // name
  env.lim('name', s.name, 14);
  const fn = { fam: 'cond', w: 700, size: 200, track: -0.035 };
  const nameMax = kx - 50 - X0;
  const f = env.fit(s.name, fn, nameMax, 140, 'name');
  const nw = pen.measure(s.name, f);
  const base = 464;
  env.lim('kicker', s.kicker, 40);
  pen.dim(X0, X0 + Math.max(nw, 300), 222, c('kicker') - 0.3, 0.45, 16);
  pen.text(up(s.kicker), X0, 262, sz(F.small, 25, { track: 0.12 }), c('kicker') + 0.3, 0.5, { col: 'line' });
  pen.guides(base, f.size, c('name') - 0.35);
  const title = pen.text(s.name, X0 - 14, base, f, c('name'), 0.65).rect;

  // tags
  const tags = s.tags || [];
  if (tags.length < 2 || tags.length > 5) env.err('tags needs 2–5 entries');
  tags.forEach((x, i) => env.lim(`tags[${i}]`, x, 14));
  const ft = { fam: 'mono', w: 600, size: 25, track: 0.06 };
  let x = X0;
  tags.forEach((tg, i) => {
    const w = pen.measure(up(tg), ft) + 40, t = c('tag' + i);
    pen.rect(x, 548, w, 58, t, 0.25, 's1');
    pen.text(up(tg), x + w / 2, 586, ft, t + 0.15, 0.2, { align: 'center', mode: 'fade' });
    x += w + 24;
  });
  if (x - 24 > X1) env.err('tags do not fit on one row');

  // URL field
  env.lim('url', s.url, 44);
  const fu = env.fit(s.url, { fam: 'mono', w: 500, size: 50 }, CW - 64, 35, 'url');
  const uw = pen.measure(s.url, fu) + 64, uy = 640, uh = 104;
  pen.rect(X0, uy, uw, uh, c('urlBox'), 0.5, 's2');
  [[X0, uy, 1, 1], [X0 + uw, uy, -1, 1], [X0, uy + uh, 1, -1], [X0 + uw, uy + uh, -1, -1]].forEach(([px, py, sx, sy]) =>
    pen.line([[px + sx * 10, py + sy * 38], [px + sx * 10, py + sy * 10], [px + sx * 38, py + sy * 10]], c('urlBox') + 0.3, 0.2, 's1'));
  pen.text(s.url, X0 + 32, uy + uh / 2 + fu.size * 0.36, fu, c('url'), 0.6);

  if (s.foot) {
    const { text, spans: sp } = spans(s.foot);
    env.lim('foot', text, 44);
    pen.text(text, X0, 828, env.fit(text, sz(F.sub, 25), CW - 300, MIN, 'foot'), c('foot'), 0.5, { col: 'muted', spans: sp });
  }

  // issued: the second move, on the last downbeat (timeline.js cue 'status')
  const word = up(s.status || 'Released');
  env.lim('status', s.status, 12);
  const fst = { fam: 'mono', w: 600, size: 25, track: 0.16 }, ts = c('status');
  const sw = pen.measure(word, fst) + 48, sx = X1 - sw, sy = 782;
  pen.seg(sx - 30, 828, X1 + 20, 828, ts - 0.15, 0.3, 'sg');
  pen.seg(sx - 30, 828 - fst.size * 0.698, X1 + 20, 828 - fst.size * 0.698, ts - 0.1, 0.3, 'sg');
  pen.rect(sx, sy, sw, 64, ts, 0.3, 's2');
  pen.text(word, sx + 24, 828, fst, ts + 0.08, 0.4);
  return { title, focus: null };
};

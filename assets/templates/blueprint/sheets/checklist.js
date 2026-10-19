// sheets/checklist.js — INSPECTION RECORD. A requirement table ticked row by row, a large count computed from
// the rows (never typed), a dashed note, a footer rule with a stop symbol, and an inspection stamp beside the
// count (line colour: the verification is a machine's; it never covers the count or its caption).
import { E, fontStr } from '../fx.js';
import { X0, X1, CW, F, MIN, up, header, sz, union, fitStamp } from './common.js';

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 10);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.title], bases: [325], cues: [c('title')], minSize: 100 });
  env.lim('sub', s.sub, 90);
  pen.text(s.sub, X0, 402, env.fit(s.sub, F.sub, CW, MIN, 'sub'), c('sub'), 0.8, { col: 'muted' });

  const items = s.items || [];
  const n = items.length;
  if (n < 3 || n > 8) env.err('items needs 3–8 entries');
  const pass = items.filter((x) => x.ok).length;
  const tx = X0, ty = 430, tw = 760, hh = 48, rh = Math.min(45, Math.floor(315 / Math.max(n, 1)) + 0), th = hh + n * rh + 12;
  const tt = c('table');
  pen.rect(tx, ty, tw, th, tt, 0.5, 's1');
  pen.seg(tx, ty + hh, tx + tw, ty + hh, tt + 0.1, 0.3, 's1');
  pen.seg(600, ty, 600, ty + th, tt + 0.1, 0.3, 'sf');
  const head = s.head || ['Req', 'Result'];
  head.forEach((h, i) => env.lim(`head[${i}]`, h, 16));
  pen.text(up(head[0]), 176, ty + 34, F.tag, tt + 0.1, 0.3, { col: 'line' });
  pen.text(up(head[1] || ''), 630, ty + 34, F.tag, tt + 0.15, 0.3, { col: 'line' });
  const fid = { fam: 'mono', w: 400, size: 35 };
  const chk = items.map((_, i) => c('chk' + i));
  items.forEach((it, i) => {
    env.lim(`items[${i}].id`, it.id, 8);
    const yc = ty + hh + rh * (i + 0.5) + 6;
    pen.text(it.id, 176, yc + 9, fid, tt + 0.15 + i * 0.05, 0.25);
    if (i < n - 1) pen.seg(tx, ty + hh + rh * (i + 1) + 6, tx + tw, ty + hh + rh * (i + 1) + 6, tt + 0.15 + i * 0.05, 0.25, 'sg');
    if (it.ok) pen.line([[642, yc], [652, yc + 11], [674, yc - 11]], chk[i], 0.14, 's2', { ease: E.quadOut, width: 4 });
    else { pen.seg(644, yc - 10, 664, yc + 10, chk[i], 0.1, 's2'); pen.seg(664, yc - 10, 644, yc + 10, chk[i] + 0.06, 0.1, 's2'); }
  });

  // the count: k/n where k = rows ticked so far (computed, so it can never disagree with the table)
  const fc = { fam: 'cond', w: 700, size: 280, track: -0.03 };
  const cxL = 1030, cBase = 650;
  const cw = pen.measure(`${n}/${n}`, fc);
  pen.custom(c('count'), (ctx, t) => {
    let k = 0;
    items.forEach((it, i) => { if (it.ok && t >= chk[i] + 0.08) k++; });
    const v = Math.min(1, (t - c('count')) / 0.25);
    ctx.save();
    ctx.globalAlpha *= v;
    ctx.font = fontStr(fc);
    ctx.letterSpacing = `${(fc.track * fc.size).toFixed(1)}px`;
    ctx.fillStyle = P.ink;
    ctx.fillText(`${k}/${n}`, cxL, cBase);
    ctx.restore();
  });
  env.lim('countLabel', s.countLabel, 26);
  pen.text(s.countLabel || '', cxL + 10, cBase + 68, F.body, c('label'), 0.5, { col: 'muted' }); // below the slash's descent
  if (s.note) {
    env.lim('note', s.note, 30);
    const fnote = sz(F.body, 35), nw = pen.measure(s.note, fnote) + 40;
    if (cxL + 16 + nw > X1) env.err('note is too wide');
    pen.rect(cxL + 16, cBase + 96, nw, 60, c('note'), 0.5, 's1', { dash: 'dash' });
    pen.text(s.note, cxL + 36, cBase + 136, fnote, c('note') + 0.1, 0.5);
  }
  if (s.footer) {
    env.lim('footer', s.footer, 48);
    const oc = [168, 862], r = 16, pts = [];
    for (let k = 0; k <= 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; pts.push([oc[0] + r * Math.cos(a), oc[1] + r * Math.sin(a)]); }
    pen.line(pts, c('footer') - 0.1, 0.3, 's1');
    pen.seg(oc[0] - 8, oc[1], oc[0] + 8, oc[1], c('footer') + 0.15, 0.1, 's1');
    pen.text(s.footer, 198, 876, env.fit(s.footer, { fam: 'cond', w: 600, size: 35 }, X1 - 198, 30, 'footer'), c('footer'), 0.6);
  }

  let stamp = null;
  if (s.stamp) {
    env.lim('stamp.word', s.stamp.word, 10);
    const count = [cxL, cBase - fc.size * 0.72, cw, fc.size * 0.8]; // the count is custom-drawn: not a pen text item
    const p = fitStamp(pen, env, { word: s.stamp.word, small: s.stamp.small || `${pass} / ${n}` }, { sizes: [70, 50], rot: -6, role: 'line', prefer: [cxL + cw + 190, cBase - 120], region: [tx + tw + 20, ty - 20, X1 + 40, 900], avoid: [count], where: 'checklist stamp' });
    env.placeStamp(p.st, p.cx, p.cy, -6);
    stamp = p.rect;
  }
  return { title, focus: union([cxL, cBase - 210, cw, 290], stamp), stamp };
};

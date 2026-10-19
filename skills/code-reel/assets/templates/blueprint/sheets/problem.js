// sheets/problem.js — PROBLEM STATEMENT. Two-line headline; a bus feeds 2–4 problem boxes, each carrying an
// amber revision triangle (a reviewer's mark); one phrase of line 2 is underlined in amber.
import { E } from '../fx.js';
import { X0, CW, F, up, header, sz } from './common.js';

const TRI_W = 52, TRI_H = 46; // revision triangle; its number is 25 px, like every other figure

export const plan = (pen, env, s) => {
  const { c } = env;
  env.lim('hud', s.hud, 24);
  (s.lines || []).forEach((l, i) => env.lim(`lines[${i}]`, l, 22));
  if (!Array.isArray(s.lines) || s.lines.length !== 2) env.err('lines needs exactly 2 entries');
  const n = (s.items || []).length;
  if (n < 2 || n > 4) env.err('items needs 2–4 entries');
  const f1 = sz(F.title, 140, { w: 500 }), f2 = sz(F.title, 140);
  const title = header(pen, env, s, { lines: s.lines, fonts: [f1, f2], bases: [325, 497], cues: [c('title'), c('title2')], minSize: 100 });

  // amber underline under the marked phrase of line 2 (hand-drawn: a gentle S-curve)
  if (s.mark) {
    env.lim('mark', s.mark, 22);
    const l2 = s.lines[1], at = l2.indexOf(s.mark);
    if (at < 0) env.err(`mark "${s.mark}" is not part of lines[1]`);
    else {
      const f = env.fit(l2, f2, CW, 100);
      const x0 = X0 - 8 + pen.measure(l2.slice(0, at), f), x1 = x0 + pen.measure(s.mark, f);
      const y = 497 + 24, pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([x0 + (x1 - x0) * u, y + 7 * Math.sin(u * Math.PI * 1.6) * (1 - u * 0.4)]); }
      pen.line(pts, c('mark'), 0.45, 'sa', { ease: E.quadOut });
    }
  }

  // bus + boxes
  const gap = 40, bw = (CW - (n - 1) * gap) / n, by = 652, bh = 190;
  const cx = (i) => X0 + i * (bw + gap) + bw / 2;
  if (n >= 2) pen.seg(cx(0), 610, cx(n - 1), 610, c('bus'), 0.5, 's1');
  const fk = F.tag, fv = { fam: 'cond', w: 500, size: 70 };
  (s.items || []).forEach((it, i) => {
    const t = c('item' + i), x = X0 + i * (bw + gap);
    env.lim(`items[${i}].key`, it.key, 12);
    env.lim(`items[${i}].value`, it.value, 11);
    pen.dot(cx(i), 610, 7, t, 'line');
    pen.seg(cx(i), 610, cx(i), 640, t, 0.18, 's1');
    pen.head(cx(i), 650, Math.PI / 2, t + 0.18, 'line', 14);
    pen.rect(x, by, bw, bh, t + 0.05, 0.4, 's1');
    pen.text(up(it.key), x + 28, by + 48, fk, t + 0.18, 0.3, { col: 'line' });
    const f = env.fit(it.value, fv, bw - 26 - 30, 50, `items[${i}].value`);
    pen.text(it.value, x + 26, by + 133, f, t + 0.26, 0.4);
    // revision triangle with its number
    const tx = x + bw - TRI_W - 14, ty = by + 16, hx = TRI_W / 2;
    pen.custom(t + 0.4, (ctx, tt, local) => {
      const v = Math.min(1, local / 0.3), k = 0.4 + 0.6 * E.backOut(v);
      ctx.save();
      ctx.globalAlpha *= Math.min(1, v * 3);
      ctx.translate(tx + hx, ty + 30); ctx.scale(k, k); ctx.translate(-tx - hx, -ty - 30);
      ctx.fillStyle = pen.P.accent;
      ctx.beginPath(); ctx.moveTo(tx + hx, ty); ctx.lineTo(tx + TRI_W, ty + TRI_H); ctx.lineTo(tx, ty + TRI_H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = pen.P.onAccent;
      ctx.font = '600 25px "Plex Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), tx + hx, ty + 41);
      ctx.restore();
    });
  });

  if (s.note) {
    env.lim('note', s.note, 24);
    const str = '△ ' + up(s.note), f = sz(F.body, 25, { track: 0.12 });
    const w = pen.measure(str, f);
    pen.seg(X0, 880, X0 + w, 880, c('note'), 0.5, 'sa');
    pen.text(str, X0, 918, f, c('note'), 0.5, { col: 'accent' });
  }
  return { title, focus: null };
};

// sheets/assembly.js — EXPLODED → ASSEMBLED. The flow's parts first float apart on dash-dot centre lines
// (an exploded view), then snap into one chain on a beat; the two ends are YOU, bracketed in amber as
// constraints; a dashed return line; a one-line claim with its fine print.
import { E, fontStr, rgba } from '../fx.js';
import { crit } from '../lib/motion.js';
import { X0, X1, CW, F, MIN, up, header, sz } from './common.js';

export const plan = (pen, env, s) => {
  const { c, P } = env;
  env.lim('hud', s.hud, 24);
  env.lim('title', s.title, 26);
  const title = header(pen, env, s, { lines: [s.title], fonts: [F.head2], bases: [310], cues: [c('title')], minSize: 70 });

  const nodes = s.nodes || [], ends = s.ends || [];
  if (nodes.length < 2 || nodes.length > 5) env.err('nodes needs 2–5 entries');
  if (ends.length !== 2) env.err('ends needs exactly 2 entries');
  const fn = { fam: 'mono', w: 500, size: 35 }, fe = { fam: 'cond', w: 700, size: 100 }, fes = F.small;
  nodes.forEach((x, i) => env.lim(`nodes[${i}]`, x, 12));
  ends.forEach((e, i) => { env.lim(`ends[${i}].word`, e.word, 5); env.lim(`ends[${i}].sub`, e.sub, 16); });
  const k = nodes.length + 2;
  // the ends' sub lines sit under their boxes, so only the words size the chain
  const need = Math.max(...nodes.map((x) => pen.measure(x, fn)), ...ends.map((e) => pen.measure(e.word, fe))) + 48;
  let bw = Math.max(200, need), gap = (CW - k * bw) / (k - 1);
  if (gap < 50) { bw = need; gap = (CW - k * bw) / (k - 1); }
  if (gap < 40) env.err(`chain does not fit: ${k} boxes of ${need.toFixed(0)} px`);
  const by = 470, bh = 120, cy = by + bh / 2;
  const X = (j) => X0 + j * (bw + gap);

  // assembly axis
  // (it served the exploded view; once the parts are seated it fades so it never crosses their lettering)
  pen.line([[X0 - 30, cy], [X1 + 30, cy]], c('axis'), 0.7, 'sf', { dash: 'dashdot' }).fadeOut = c('assemble') + 0.25;

  // ends: YOU, amber
  [0, k - 1].forEach((j, e) => {
    const t = c('ends') + e * 0.15, x = X(j);
    pen.rect(x, by, bw, bh, t, 0.3, 'sa');
    pen.text(ends[e]?.word || '', x + bw / 2, by + bh / 2 + fe.size * 0.35, fe, t + 0.15, 0.3, { align: 'center', col: 'accent', mode: 'pop' });
    const sw = pen.measure(ends[e]?.sub || '', fes), sx = e ? Math.min(x + bw / 2, X1 + 40 - sw / 2) : Math.max(x + bw / 2, X0 - 40 + sw / 2);
    pen.text(ends[e]?.sub || '', sx, by + bh + 38, fes, t + 0.25, 0.3, { align: 'center', mode: 'fade' });
  });

  // nodes: exploded positions, then a spring into the chain at the assemble cue
  const ta = c('assemble'), m = (nodes.length - 1) / 2;
  nodes.forEach((name, i) => {
    const j = i + 1, fx = X(j), dx = (i - m) * 24, dy = (i % 2 ? 1 : -1) * 128;
    const t1 = c('nodes') + i * 0.25 * env.b / 0.6;
    const pos = (t) => {
      const u = crit(t - ta - i * 0.04, 15);
      return [fx + dx * (1 - u), by + dy * (1 - u)];
    };
    // dash-dot centre line from the exploded part to its seat, fades once seated
    pen.custom(t1, (ctx, t) => {
      const a = Math.min(1, (t - t1) / 0.3) * (1 - Math.min(1, Math.max(0, (t - ta) / 0.35)));
      if (a <= 0) return;
      const [x, y] = pos(t);
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.strokeStyle = rgba(P.line, 0.55); ctx.lineWidth = 1.5; ctx.setLineDash([24, 8, 4, 8]);
      ctx.beginPath(); ctx.moveTo(x + bw / 2, y + bh / 2); ctx.lineTo(fx + bw / 2, cy); ctx.stroke();
      ctx.restore();
    });
    pen.custom(t1, (ctx, t) => {
      const [x, y] = pos(t);
      const u = Math.min(1, (t - t1) / 0.3);
      ctx.save();
      ctx.strokeStyle = P.line; ctx.lineWidth = 2.5;
      // outline draws itself
      const per = 2 * (bw + bh), d = per * E.cubicInOut(u);
      ctx.beginPath();
      const seg = [[x, y], [x + bw, y], [x + bw, y + bh], [x, y + bh], [x, y]];
      let left = d;
      ctx.moveTo(x, y);
      for (let q = 1; q < seg.length && left > 0; q++) {
        const L = Math.hypot(seg[q][0] - seg[q - 1][0], seg[q][1] - seg[q - 1][1]), f = Math.min(1, left / L);
        ctx.lineTo(seg[q - 1][0] + (seg[q][0] - seg[q - 1][0]) * f, seg[q - 1][1] + (seg[q][1] - seg[q - 1][1]) * f);
        left -= L;
      }
      ctx.stroke();
      if (u > 0.5) {
        ctx.globalAlpha *= Math.min(1, (u - 0.5) * 4);
        ctx.font = fontStr(fn); ctx.fillStyle = P.ink; ctx.textAlign = 'center';
        ctx.fillText(name, x + bw / 2, y + bh / 2 + 10);
      }
      ctx.restore();
    });
  });
  // arrows along the assembled chain
  for (let j = 0; j < k - 1; j++) pen.arrow(X(j) + bw + 4, cy, X(j + 1) - 6, cy, ta + 0.2 + j * 0.06, 0.15, 's2', { headSize: 16 });
  // constraints at both ends
  env.lim('endTag', s.endTag, 12);
  [0, k - 1].forEach((j, e) => {
    const x = X(j);
    pen.line([[x, by - 18], [x, by - 30], [x + bw, by - 30], [x + bw, by - 18]], c('brackets'), 0.3, 'sa');
    // the right-hand tag is right-aligned to its bracket, so a long tag runs inward, not off the sheet
    pen.text(up(s.endTag || 'Constraint'), e ? x + bw : x, by - 46, F.tag, c('brackets') + 0.05, 0.3, { col: 'accent', align: e ? 'right' : 'left' });
  });
  // return line: gaps flow back
  if (s.loop) {
    env.lim('loop', s.loop, 48);
    const xa = X(k - 2) + bw / 2, xb = X(1) + bw / 2, yl = by + bh + 100;
    pen.line([[xa, by + bh + 6], [xa, yl], [xb, yl], [xb, by + bh + 14]], c('loop'), 0.7, 's1', { dash: 'dash' });
    pen.head(xb, by + bh + 6, -Math.PI / 2, c('loop') + 0.66, 'line', 18);
    const fl = F.body;
    if (xb + 20 + pen.measure(s.loop, fl) > X1) env.err('loop label is too wide');
    pen.text(s.loop, xb + 20, yl + 36, fl, c('loop') + 0.2, 0.6, { col: 'line' });
  }
  if (s.claim) {
    env.lim('claim', s.claim, 36);
    pen.text(s.claim, X0 - 6, 846, env.fit(s.claim, { fam: 'cond', w: 600, size: 35 }, CW, 35, 'claim'), c('claim'), 0.5);
  }
  if (s.claimSub) {
    env.lim('claimSub', s.claimSub, 90);
    pen.text(s.claimSub, X0, 896, env.fit(s.claimSub, F.small, CW, MIN, 'claimSub'), c('claimSub'), 0.5, { col: 'muted' });
  }
  return { title, focus: null };
};

// hud.js — the persistent drawing frame (screen space): border with zone ticks 1–8 / A–D, the detail bubble and
// sheet label panel (top left), corner note (top right), scale bar (bottom left) and title block (bottom right)
// with an APPROVED BY cell, the drawing's name, SHEET and a live SCALE. Geometry derives from measured strings;
// the frame draws itself in the first second.
//
// Sizes: every field that carries information is ≥ 25 px (principle 1). The zone digits and the scale-bar
// figures (15 px) are decoration: drafting furniture that says nothing about the film (mode card, Type).
import { makePen, drawItem, fontStr, measureT } from './fx.js';
import { up } from './sheets/common.js';

export const PANEL = { x: 44, y: 40, h: 96 };
export const FOLDED = [44, 40, 104, 96]; // the panel while the camera is pushed in: bubble only
// The content area for check-film (renders/timing.json mask): inside the frame, below the label panel and the
// corner note, above the title block and the scale bar. Ambient HUD changes (SCALE, labels) stay outside it.
export const CONTENT_MASK = [44, 140, 1832, 740];
const RIGHT = 1880, BOTTOM = 1040, BLOCK_H = 156, NAME_H = 56, PAD = 16, KEY_H = 44;
const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
const clamp01 = (u) => Math.min(1, Math.max(0, u));

// folds: [{ from, back }] — each push-in, from the start of the push to the end of the camera's return.
// The panel's lettering fades out (0.1 s) before the panel folds, and comes back only after it has reopened,
// so no label is ever cut in half by the folding panel (legibility #16).
const FADE = 0.1, FOLD = 0.2;

// pre: seconds the frame's own drawing-in is advanced by (an excerpt's pre-printed frame, choreography.js
// EXCERPT_HUD_PRE); 0 for a film, which draws its frame in the first second. Folds and labels keep film time.
export const makeHud = ({ P, mctx, meta, labels, errs, folds = [], approveBox = null, pre = 0 }) => {
  const pen = makePen(P, mctx);
  const lim = (k, v, n) => { if (v && String(v).length > n) errs.push(`meta.${k} "${v}" has ${String(v).length} chars; limit ${n}`); };
  lim('title', meta.title, 12); lim('subtitle', meta.subtitle, 28); lim('corner', meta.corner, 24);
  for (const k of ['dwg', 'rev', 'drawnBy']) if (meta[k] !== undefined) console.warn(`[blueprint] meta.${k} is no longer drawn (the title block keeps only fields a viewer reads)`);
  const fl = { fam: 'mono', w: 400, size: 26, track: 0.14 }, fsub = { fam: 'mono', w: 400, size: 25, track: 0.12 };
  const subLine = `${up(meta.title)} · ${up(meta.subtitle)}`;
  const panelW = Math.max(640, 120 + Math.max(...labels.map((l) => measureT(mctx, l.label, fl)), measureT(mctx, subLine, fsub)) + 36);
  const panel = [PANEL.x, PANEL.y, panelW, PANEL.h];

  // frame
  pen.line([[24, 24], [1896, 24], [1896, 1056], [24, 1056], [24, 24]], 0, 0.9, 's1');
  pen.line([[36, 36], [1884, 36], [1884, 1044], [36, 1044], [36, 36]], 0.1, 0.9, 'sg');
  for (let i = 1; i < 8; i++) { pen.seg(i * 240, 24, i * 240, 36, 0.3 + i * 0.03, 0.1, 'sf'); pen.seg(i * 240, 1044, i * 240, 1056, 0.3 + i * 0.03, 0.1, 'sf'); }
  for (let i = 1; i < 4; i++) { pen.seg(24, i * 270, 36, i * 270, 0.4, 0.1, 'sf'); pen.seg(1884, i * 270, 1896, i * 270, 0.4, 0.1, 'sf'); }
  const fz = { fam: 'mono', w: 400, size: 15, track: 0.1 }; // decoration: zone digits and scale-bar figures
  '12345678'.split('').forEach((d, i) => pen.text(d, 120 + i * 240, 19, fz, 0.45, 0.3, { col: 'line', mode: 'fade', align: 'center' }));
  'ABCD'.split('').forEach((d, i) => pen.text(d, 16, 140 + i * 270, fz, 0.45, 0.3, { col: 'line', mode: 'fade' }));

  // label panel + bubble. While the camera is pushed in the panel folds back to the bubble, so the sheet's own
  // title is never hidden behind it (fold = 0 open … 1 folded, from the push-in schedule).
  const foldAt = (t) => { let f = 0; for (const w of folds) f = Math.max(f, smooth((t - (w.from - FOLD / 2)) / FOLD) * (1 - smooth((t - w.back) / FOLD))); return f; };
  const letterAt = (t) => {
    let a = 1;
    for (const w of folds) {
      const t0 = w.from - FOLD / 2, t1 = w.back + FOLD; // fold starts at t0, the panel is open again at t1
      if (t > t0 - FADE && t < t1 + FADE) a = Math.min(a, Math.max(clamp01((t0 - t) / FADE), clamp01((t - t1) / FADE)));
    }
    return a;
  };
  const panelAt = (t) => [panel[0], panel[1], panel[2] + (FOLDED[2] - panel[2]) * foldAt(t), panel[3]];
  pen.custom(0.3, (ctx, t) => { ctx.save(); ctx.globalAlpha *= Math.min(1, (t - 0.3) / 0.4) * 0.9; ctx.fillStyle = P.bg; ctx.fillRect(...panelAt(t - pre)); ctx.restore(); });
  pen.custom(0.25, (ctx, t) => {
    const r = panelAt(t - pre), u = Math.min(1, (t - 0.25) / 0.6), per = 2 * (r[2] + r[3]);
    ctx.save(); ctx.strokeStyle = P.line; ctx.lineWidth = 2.5; ctx.lineCap = 'square';
    if (u >= 1) ctx.strokeRect(...r);
    else { ctx.setLineDash([per * u, per]); ctx.strokeRect(...r); }
    ctx.restore();
  });
  pen.circle(98, 88, 42, 0.2, 0.5, 's1');
  pen.seg(58, 92, 138, 92, 0.45, 0.25, 's1');
  // corner note
  const fcorner = { fam: 'mono', w: 400, size: 25, track: 0.14 };
  if (meta.corner) pen.text(up(meta.corner), 1856, 84, fcorner, 0.5, 0.4, { col: 'line', align: 'right', mode: 'fade' });
  const corner = meta.corner ? [1856 - measureT(mctx, up(meta.corner), fcorner), 84 - 25 * 0.82, measureT(mctx, up(meta.corner), fcorner), 25 * 1.08] : null;
  // scale bar
  pen.seg(64, 1000, 304, 1000, 0.5, 0.4, 's1');
  for (let i = 0; i <= 4; i++) pen.seg(64 + i * 60, 992, 64 + i * 60, 1008, 0.6, 0.1, 's1');
  pen.custom(0.75, (ctx) => { ctx.fillStyle = P.line; ctx.fillRect(64, 996, 60, 8); ctx.fillRect(184, 996, 60, 8); });
  [['0', 64], ['100', 176], ['200 MM', 296]].forEach(([s, x]) => pen.text(s, x, 1034, fz, 0.6, 0.3, { col: 'line', mode: 'fade' }));

  // title block: [ APPROVED BY (the approval stamp lands here) | name / SHEET · SCALE ]
  // ISO 7200 keeps an "approved by" field; the stamp goes into its empty part and never covers a field's text.
  const fk = { fam: 'mono', w: 400, size: 25, track: 0.12 }, fv = { fam: 'mono', w: 500, size: 28 };
  const fname = (() => { let g = { fam: 'cond', w: 700, size: 40 }; const str = meta.title || ''; while (measureT(mctx, str, g) > 420 && g.size > 28) g = { ...g, size: g.size - 1 }; if (measureT(mctx, str, g) > 420) errs.push(`title block: "${str}" does not fit`); return g; })();
  const W = (s, f) => measureT(mctx, s, f);
  const sheetW = Math.max(W('SHEET', fk), W('ALL', fv), W('9 / 9', fv)) + 2 * PAD;
  const scaleW = Math.max(W('SCALE', fk), W('1.1:1', fv), W('1:2.4', fv)) + 2 * PAD;
  const rightW = Math.max(W(meta.title || '', fname) + 2 * PAD, sheetW + scaleW);
  const scaleCellW = rightW - sheetW; // SCALE takes what the name row leaves
  const apW = Math.max(W('APPROVED BY', fk) + 2 * PAD, approveBox ? approveBox[0] + 2 * PAD : 0, 250);
  const bw = apW + rightW, bh = BLOCK_H, bx = RIGHT - bw, by = BOTTOM - bh;
  const block = [bx, by, bw, bh];
  const approve = [bx + PAD / 2, by + KEY_H, apW - PAD, bh - KEY_H - 6]; // the empty part of the APPROVED BY cell
  if (approveBox && (approveBox[1] > approve[3] + 8 || approveBox[0] > approve[2] + 8)) errs.push('title block: the approval stamp does not fit its APPROVED BY cell; shorten stamp.word / stamp.small');
  pen.custom(0.55, (ctx, t) => { ctx.save(); ctx.globalAlpha *= Math.min(1, (t - 0.55) / 0.4) * 0.88; ctx.fillStyle = P.bg; ctx.fillRect(bx, by, bw, bh); ctx.restore(); });
  pen.rect(bx, by, bw, bh, 0.35, 0.45, 's1');
  pen.seg(bx + apW, by, bx + apW, by + bh, 0.5, 0.45, 's1');
  pen.seg(bx + apW, by + NAME_H, bx + bw, by + NAME_H, 0.55, 0.45, 's1');
  pen.seg(bx + apW + sheetW, by + NAME_H, bx + apW + sheetW, by + bh, 0.6, 0.45, 's1');
  pen.text('APPROVED BY', bx + PAD, by + 34, fk, 0.6, 0.4, { col: 'line', mode: 'fade' });
  pen.text(meta.title || '', bx + apW + PAD, by + 42, fname, 0.6, 0.4, { mode: 'fade' });
  const cx1 = bx + apW + PAD, cx2 = bx + apW + sheetW + PAD, ky = by + NAME_H + 34, vy = by + NAME_H + 80;
  pen.text('SHEET', cx1, ky, fk, 0.6, 0.4, { col: 'line', mode: 'fade' });
  pen.text('SCALE', cx2, ky, fk, 0.6, 0.4, { col: 'line', mode: 'fade' });
  if (scaleCellW < scaleW - 1e-6) errs.push('title block: SCALE cell too narrow');

  // dynamic: bubble numbers, sheet label (re-lettered on each change), SHEET and SCALE fields
  const fTop = { fam: 'mono', w: 600, size: 30 }, fBot = { fam: 'mono', w: 500, size: 25 };
  const cur = (t) => { let j = 0; for (let i = 0; i < labels.length; i++) if (t >= labels[i].t) j = i; return j; };
  const dyn = (ctx, t, cam) => {
    const a = Math.min(1, Math.max(0, (t + pre - 0.45) / 0.4));
    if (a <= 0) return;
    const j = cur(t), L = labels[j], u = j === 0 ? 1 : Math.min(1, (t - L.t) / 0.3);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.textBaseline = 'alphabetic';
    const txt = (s, x, y, f, col, align = 'left') => { ctx.font = fontStr(f); ctx.letterSpacing = `${((f.track || 0) * f.size).toFixed(2)}px`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, x, y); };
    txt(L.top, 98, 82, L.top.length > 2 ? { ...fTop, size: 25 } : fTop, P.ink, 'center');
    txt(String(L.total), 98, 121, fBot, P.line, 'center');
    const la = letterAt(t);
    if (la > 0) {
      const pr = panelAt(t);
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.beginPath(); ctx.rect(156, 48, Math.max(0, Math.min((panelW - 112) * u, pr[0] + pr[2] - 156)), 46); ctx.clip();
      txt(L.label, 164, 82, fl, P.ink);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= la;
      ctx.beginPath(); ctx.rect(156, 96, Math.max(0, pr[0] + pr[2] - 156), 38); ctx.clip();
      txt(subLine, 164, 122, fsub, P.line);
      ctx.restore();
    }
    txt(L.sheet, cx1, vy, fv, P.ink);
    const s = cam.s;
    const scale = s >= 1.06 ? `${s.toFixed(1)}:1` : s > 0.97 ? '1:1' : `1:${(1 / s).toFixed(1)}`;
    txt(scale, cx2, vy, fv, P.ink);
    ctx.restore();
  };
  return {
    panel,
    block,
    approve,
    corner,
    draw: (ctx, t, cam) => { for (const it of pen.items) drawItem(ctx, P, it, t + pre); dyn(ctx, t, cam); },
  };
};

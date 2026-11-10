// pile.js — the opening pile of a stream film, as pure layout and canvas painters: three session windows, four alerts,
// a sticky note, fourteen dialog copies cascading (`copies`, up to 30; one to six alerts) and a cursor, on a daytime desktop (`desk`: accent-tinted wallpaper,
// taskbar, unread badge) or as dark cards scattered over the night (`night`). The pile is texture: read as "too many",
// not line by line, so its type stays at the template's 25–26 px in both languages.
// From the stream template: plan.js openItems (copied), film.js css() (.win, .bar, .say, .st, .note, .btn, .bang) and
// buildDOM() (winHTML, alertHTML, copyHTML, the wall, the taskbar, the badge, the cursor), drawn on canvas.
import { mulberry32 } from '../../../rng.js';
import { box, textAt, textW, ring, shadowOf, lineH } from '../hung-block/blocks.js';

const W = 1920, H = 1080;
// how many dialog copies cascade (the scene's `copies`, 4–30; the template's 14)
export const copiesOf = (s) => (Number.isInteger(s?.copies) && s.copies >= 4 && s.copies <= 30 ? s.copies : 14);
// ---------- layout (the template's openItems) ----------
export const openItems = (variant, s, seed) => {
  const rnd = mulberry32(seed * 101 + 7);
  const items = [];
  if (variant === 'desk') {
    items.push({ kind: 'window', i: 0, x: 60, y: 40, w: 600, h: 330 }, { kind: 'window', i: 1, x: 470, y: 250, w: 600, h: 330 }, { kind: 'window', i: 2, x: 980, y: 90, w: 600, h: 360 });
    s.alerts.forEach((_, i) => items.push({ kind: 'alert', i, x: 1500, y: 30 + i * 112, w: 390, h: 96 }));
    items.push({ kind: 'note', i: 0, x: 150, y: 560, w: 560, h: 210, rot: -2.5 });
    // the copies cascade 34 px right and 26 px down each from (760, 300); more than 14 start further up and left so the
    // last stays in the frame
    const n = copiesOf(s), x0 = Math.min(760, W - 60 - 470 - 34 * (n - 1)), y0 = Math.min(300, H - 80 - 190 - 26 * (n - 1));
    for (let k = 0; k < n; k++) items.push({ kind: 'copy', i: k, x: x0 + 34 * k, y: y0 + 26 * k, w: 470, h: 190 });
  } else {
    // night: the same things as small cards scattered across the sky, drifting; no desktop
    const spots = [];
    const put = (w, h) => { for (let g = 0; g < 400; g++) { const x = 90 + rnd() * (W - 180 - w), y = 70 + rnd() * (H - 160 - h); if (spots.every((p) => Math.abs(p.x - x) > (p.w + w) * 0.42 || Math.abs(p.y - y) > (p.h + h) * 0.42)) { const sp = { x, y, w, h }; spots.push(sp); return sp; } } const sp = { x: 90 + rnd() * (W - 180 - w), y: 70 + rnd() * (H - 160 - h), w, h }; spots.push(sp); return sp; };
    for (let i = 0; i < 3; i++) items.push({ kind: 'window', i, ...put(520, 290) });
    s.alerts.forEach((_, i) => items.push({ kind: 'alert', i, ...put(390, 96) }));
    items.push({ kind: 'note', i: 0, ...put(540, 200), rot: -2 });
    for (let k = 0; k < copiesOf(s); k++) items.push({ kind: 'copy', i: k, ...put(400, 170), drift: rnd() * 6.28 });
  }
  items.forEach((it, j) => { it.j = j; it.cx = it.x + it.w / 2; it.cy = it.y + it.h / 2; });
  return items;
};


// ---------- painters ----------
// the wallpaper (a 160° gradient desk1 → desk2 58 % → desk3) with the taskbar (the sessions' short names) and the badge
export const wall = (ctx, TY, P, sessions, badge = null) => {
  const a = (160 * Math.PI) / 180, dx = Math.sin(a), dy = -Math.cos(a), half = (W * Math.abs(dx) + H * Math.abs(dy)) / 2;
  const g = ctx.createLinearGradient(960 - dx * half, 540 - dy * half, 960 + dx * half, 540 + dy * half);
  g.addColorStop(0, P.desk1); g.addColorStop(0.58, P.desk2); g.addColorStop(1, P.desk3);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.deskBar; ctx.fillRect(0, H - 56, W, 56);
  box(ctx, 28, H - 43, 30, 30, 8, P.ink);
  let x = 28 + 30 + 26;
  for (const s of sessions) {
    const name = String(s.title).split('·')[0].trim();
    box(ctx, x, H - 35, 14, 14, 4, P.ink2);
    textAt(ctx, TY, name, x + 24, H - 56 + (56 - lineH(TY.popup, 'normal', name)) / 2, TY.popup, 500, P.ink);
    x += 24 + textW(ctx, TY, name, TY.popup, 500) + 26;
  }
  if (badge != null) {
    const s = String(badge), w = Math.max(38, textW(ctx, TY, s, 20, 700) + 12);
    box(ctx, W - 70, H - 50, w, 30, 15, P.ink);
    textAt(ctx, TY, s, W - 70 + w / 2, H - 50 + (30 - lineH(20, 'normal')) / 2, 20, 700, P.paper, { align: 'center' });
  }
};
const bang = (ctx, TY, P, v, x, y) => { box(ctx, x, y, 34, 34, 17, v === 'desk' ? P.ink : P.text); textAt(ctx, TY, '!', x + 17, y + (34 - lineH(22, 'normal')) / 2, 22, 700, v === 'desk' ? P.paper : P.panel, { align: 'center' }); };
const btn = (ctx, TY, P, v, s, x, y, yes) => {
  const w = textW(ctx, TY, s, TY.popup, 600) + 36, h = lineH(TY.popup, 'normal', s) + 12;
  box(ctx, x, y, w, h, 14, yes ? P.user : v === 'desk' ? P.bubble : `rgba(${P.rgb.text2},0.2)`);
  textAt(ctx, TY, s, x + 18, y + 6, TY.popup, 600, yes ? P.onUser : v === 'desk' ? P.ink : P.text);
  return w;
};
const winFace = (ctx, P, v, w, h, r, lit) => {
  const fill = v === 'desk' ? P.paper : P.panel;
  const shadow = lit > 0.01 ? { color: `rgba(${P.rgb.line},${(0.6 * lit).toFixed(2)})`, oy: 0, blur: 40 * lit } : v === 'desk' ? shadowOf(0.28, 22, 60, '10,20,40') : shadowOf(0.5, 18, 50);
  box(ctx, 0, 0, w, h, r, fill, { shadow });
  if (v === 'night') box(ctx, 0.75, 0.75, w - 1.5, h - 1.5, r, null, { stroke: [1.5, `rgba(${P.rgb.text2},0.35)`] });
  if (lit > 0.01) box(ctx, -1.5 * lit, -1.5 * lit, w + 3 * lit, h + 3 * lit, r + 1.5 * lit, null, { stroke: [3 * lit, `rgba(${P.rgb.line},${(0.9 * lit).toFixed(2)})`] });
};
const barOf = (ctx, TY, P, v, title, ctl, w) => {
  const ink = v === 'desk' ? P.ink : P.text;
  textAt(ctx, TY, title, 22, (56 - lineH(TY.window, 'normal', title)) / 2, TY.window, 600, ink);
  textAt(ctx, TY, ctl, w - 22, (56 - lineH(TY.popup, 'normal')) / 2, TY.popup, 400, ink, { align: 'right', alpha: 0.6, track: 6 / TY.popup });
  ctx.fillStyle = v === 'desk' ? P.rule : `rgba(${P.rgb.text2},0.25)`; ctx.fillRect(0, 54.5, w, 1.5);
};
// one item of the pile, drawn with its top left at the origin; s the opening's copy, lit 0–1 where the thread passes
export const item = (ctx, TY, P, v, it, s, t = 0, lit = 0) => {
  const ink = v === 'desk' ? P.ink : P.text, ink2 = v === 'desk' ? P.ink2 : P.text2;
  if (it.kind === 'window') {
    const ses = s.sessions[it.i];
    winFace(ctx, P, v, it.w, it.h, 22, lit);
    ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, it.w, it.h, 22); ctx.clip();
    barOf(ctx, TY, P, v, ses.title, '— ×', it.w);
    const sw = textW(ctx, TY, ses.ask, TY.popup, 400) + 36, sh = lineH(TY.popup, 'normal', ses.ask) + 20;
    box(ctx, it.w - 22 - sw, 80, sw, sh, 18, P.user); textAt(ctx, TY, ses.ask, it.w - 22 - sw + 18, 90, TY.popup, 400, P.onUser);
    const stH = Math.max(34, lineH(TY.popup, 'normal', ses.status));
    if (it.i === 2) bang(ctx, TY, P, v, 22, 150 + (stH - 34) / 2); else ring(ctx, P, 22 + 15, 150 + stH / 2, 0, { top: ink2 });
    textAt(ctx, TY, ses.status, 22 + (it.i === 2 ? 34 : 30) + 14, 150 + (stH - lineH(TY.popup, 'normal', ses.status)) / 2, TY.popup, 400, ink2);
    if (it.i === 2) { const a = s.alerts[0]; const bw = btn(ctx, TY, P, v, a.yes, 22, 216, true); btn(ctx, TY, P, v, a.no, 22 + bw + 14, 216, false); }
    else { const fill = v === 'desk' ? P.bubble : `rgba(${P.rgb.text2},0.18)`; box(ctx, 22, 220, (it.w - 0) * 0.6, 14, 7, fill); box(ctx, 22, 252, it.w * 0.42, 14, 7, fill); }
    ctx.restore();
  } else if (it.kind === 'alert') {
    winFace(ctx, P, v, it.w, it.h, 18, lit);
    const from = s.sessions[(it.i + 2) % 3].title, a = s.alerts[it.i];
    const h1 = lineH(TY.popup, 'normal', from), h2 = lineH(TY.popup, 'normal', a.title), top = (it.h - (h1 + h2)) / 2;
    bang(ctx, TY, P, v, 18, (it.h - 34) / 2);
    textAt(ctx, TY, from, 18 + 34 + 16, top, TY.popup, 400, ink, { alpha: 0.72 });
    textAt(ctx, TY, a.title, 18 + 34 + 16, top + h1, TY.popup, 600, ink);
  } else if (it.kind === 'note') {
    const lines = s.note, nw = Math.max(...lines.map((l) => textW(ctx, TY, l, TY.note, 600))) + 60, nh = lines.length * TY.note * 1.45 + 52;
    box(ctx, 0, 0, nw, nh, 10, v === 'desk' ? P.paper : P.panel2, { shadow: lit > 0.01 ? { color: `rgba(${P.rgb.line},${(0.6 * lit).toFixed(2)})`, oy: 0, blur: 40 * lit } : v === 'desk' ? shadowOf(0.3, 22, 60, '10,20,40') : shadowOf(0.5, 18, 50) });
    if (lit > 0.01) box(ctx, -1.5 * lit, -1.5 * lit, nw + 3 * lit, nh + 3 * lit, 10, null, { stroke: [3 * lit, `rgba(${P.rgb.line},${(0.9 * lit).toFixed(2)})`] });
    lines.forEach((l, k) => textAt(ctx, TY, l, 30, 26 + k * TY.note * 1.45, TY.note, 600, ink, { lh: 1.45 }));
  } else {
    const a = s.alerts[it.i % s.alerts.length], ses = s.sessions[(it.i + 2) % 3];
    winFace(ctx, P, v, it.w, it.h, 22, lit);
    ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, it.w, it.h, 22); ctx.clip();
    barOf(ctx, TY, P, v, ses.title, '×', it.w);
    const rh = Math.max(34, lineH(TY.popup, 'normal', a.title));
    bang(ctx, TY, P, v, 22, 56 + 18 + (rh - 34) / 2);
    textAt(ctx, TY, a.title, 22 + 34 + 14, 56 + 18 + (rh - lineH(TY.popup, 'normal', a.title)) / 2, TY.popup, 600, ink);
    const bh = lineH(TY.popup, 'normal', a.no) + 12, wn = textW(ctx, TY, a.no, TY.popup, 600) + 36, wy = textW(ctx, TY, a.yes, TY.popup, 600) + 36;
    btn(ctx, TY, P, v, a.no, it.w - 20 - wn, it.h - 16 - bh, false); btn(ctx, TY, P, v, a.yes, it.w - 20 - wn - 12 - wy, it.h - 16 - bh, true);
    ctx.restore();
  }
};
// the cursor: the template's arrow (fill ink on the desk, text on the night), scale s about its tip
export const cursor = (ctx, P, v, x, y, s = 1, a = 1) => {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  const p = new Path2D('M2 2 L2 36 L11 28 L17 42 L23 39 L17 26 L30 26 Z');
  ctx.fillStyle = v === 'desk' ? P.ink : P.text; ctx.fill(p);
  ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.strokeStyle = v === 'desk' ? P.paper : P.ground; ctx.stroke(p);
  ctx.restore();
};

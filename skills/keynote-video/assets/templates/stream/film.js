// film.js — the stream mode's picture. Every frame is drawn by render(t) from content.js and plan.js alone
// (CONTRACT.md "Pure function of time"): three canvases (the night and its stars; the thread, beams and hooks
// under the blocks; the mascot and sparks over them) and DOM blocks for every piece of text, positioned per frame.
// No value depends on the previous frame.

import PALETTES, { rgbStr } from './palettes.js';
import content from './content.js';
import { build, L, W, H, E, seg, lerp, clamp, mulberry32, cumLen, atLen, subPath } from './plan.js';
import { TYPE, wrap, graphemes, typed } from './lang.js';
import { errorBanner } from './lib/text.js';

const PLAN = build(content);
export const duration = PLAN.duration;
export const plan = PLAN;
const { lang, B, sc, STARS, CONST, S8, GATHER, OPEN, MSG } = PLAN;
const TY = TYPE[lang];
const P = PALETTES[content.palette] || PALETTES.night;
const C = Object.fromEntries(Object.entries(P).filter(([, v]) => typeof v === 'string' && v.startsWith('#')).map(([k, v]) => [k, rgbStr(v)]));
const UI = content.ui;
const VARIANT = content.opening === 'night' ? 'night' : 'desk';
const LOCK = content.lockup === 'mascot' ? 'mascot' : 'name';

export const fonts = [
  ...[400, 500, 600, 700].map((weight) => ({ family: 'DM Sans', weight })),
  ...(lang === 'zh' ? [400, 500, 600, 700].map((weight) => ({ family: 'Noto Sans SC', weight })) : []),
];

// ---------- small tools ----------
const $ = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
const font = (px, w = 400) => `${w} ${px}px ${TY.family}`;
let mctx;
const TRACK = lang === 'zh' ? 0.02 : -0.01; // em, as letter-spacing in the CSS
const measurer = (px, w) => (s) => { mctx.font = font(px, w); return mctx.measureText(s).width + TRACK * px * [...s].length; };
const lines = (text, px, w, maxW) => wrap(measurer(px, w), text, maxW, lang);
// style setter: o opacity, x/y translate, s scale (or sx/sy), b blur, r rotate
const put = (e, { o = 1, x = 0, y = 0, s = 1, sx, sy, b = 0, r = 0 } = {}) => {
  e.style.opacity = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
  e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${(sx ?? s).toFixed(4)},${(sy ?? s).toFixed(4)})${r ? ` rotate(${r.toFixed(2)}deg)` : ''}`;
  e.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none';
};
// enter at t0 over d, leave at t1 over d1: returns 0..1 visibility with the entering/leaving progress
const life = (t, t0, d, t1 = Infinity, d1 = 0.22) => ({ i: E.out3(seg(t, t0, t0 + d)), o: t1 === Infinity ? 0 : E.in3(seg(t, t1 - d1, t1)) });
const blurIn = (t, t0, d = 0.3, t1 = Infinity, d1 = 0.22, px = 8) => { const { i, o } = life(t, t0, d, t1, d1); return { o: i * (1 - o), b: px * (1 - i) + 10 * o }; };

// per-glyph reveal: build spans once, set them per frame
const glyphs = (parent, text, { px, w = 400, maxW = 2000, color, align = 'left', lh = TY.lead }) => {
  const ls = lines(text, px, w, maxW);
  const box = $('div', 'gl', parent, { font: font(px, w), color, letterSpacing: TY.track, lineHeight: String(lh), textAlign: align, whiteSpace: 'pre' });
  const spans = [];
  // Chinese enters a character at a time, Latin a word at a time (spaces stay plain text, so the line reads as words)
  ls.forEach((ln, k) => {
    if (k) box.appendChild(document.createElement('br'));
    const units = lang === 'zh' ? graphemes(ln) : ln.split(/(\s+)/).filter(Boolean);
    for (const g of units) { if (/^\s+$/.test(g)) { box.appendChild(document.createTextNode(g)); continue; } const sp = $('span', null, box, { display: 'inline-block', whiteSpace: 'pre' }); sp.textContent = g; spans.push(sp); }
  });
  return { box, spans, lines: ls };
};
const STAG = lang === 'zh' ? 0.04 : 0.07; // per character (zh) / per word (en)
const glyphsAt = (G, t, t0, t1 = Infinity) => {
  const out = t1 === Infinity ? 0 : E.in3(seg(t, t1 - 0.22, t1));
  G.spans.forEach((sp, k) => { const k0 = E.out3(seg(t, t0 + k * STAG, t0 + k * STAG + 0.24)); const a = k0 * (1 - out); sp.style.opacity = a.toFixed(3); sp.style.filter = a < 0.98 ? `blur(${(8 * (1 - k0) + 10 * out).toFixed(1)}px)` : 'none'; });
  G.box.style.visibility = t >= t0 && out < 1 ? 'visible' : 'hidden';
};
const glyphsEnd = (G, t0) => t0 + G.spans.length * STAG + 0.24;

// ---------- canvas drawing ----------
const glow = (ctx, x, y, r, col, a) => { if (a <= 0.002 || r <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
// the thread: one stroke for the whole film, three passes for its glow
const thread = (ctx, pts, a, w = 1) => {
  if (pts.length < 2 || a <= 0.002) return;
  [[16 * w, 0.07, C.line], [7 * w, 0.22, C.line], [2.6 * w, 0.95, C.glow]].forEach(([lw, al, col]) => {
    ctx.strokeStyle = `rgba(${col},${al * a})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  });
};
const star = (ctx, x, y, s, a) => { glow(ctx, x, y, 26 * s, C.glow, 0.55 * a); glow(ctx, x, y, 6 * s, C.core, a); };
const cubic = (p0, p1, p2, p3, u) => { const v = 1 - u; return [0, 1].map((d) => v * v * v * p0[d] + 3 * v * v * u * p1[d] + 3 * v * u * u * p2[d] + u * u * u * p3[d]); };
const arcPts = (a, b, u0 = 0, u1 = 1, n = 40) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const c1 = [a[0] + dx * 0.4, a[1] - Math.abs(dx) * 0.1 + dy * 0.1], c2 = [a[0] + dx * 0.75, b[1]]; const out = []; for (let k = 0; k <= n; k++) out.push(cubic(a, c1, c2, b, lerp(u0, u1, k / n))); return out; };
const straight = (a, b, n = 24) => Array.from({ length: n + 1 }, (_, k) => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);

// the mascot: a small ball of thread whose loose end is the thread itself (drawn in code, no image)
const mascot = (ctx, x, y, s = 1, a = 1, squash = 0) => {
  if (a <= 0.01 || s <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + squash), s * (1 - squash)); ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, 0, 0, 74, C.line, 0.32);
  ctx.globalCompositeOperation = 'source-over';
  const r = 30, g = ctx.createRadialGradient(-10, -12, 2, 0, 0, r);
  g.addColorStop(0, `rgb(${C.core})`); g.addColorStop(0.6, `rgb(${C.glow})`); g.addColorStop(1, `rgb(${C.line})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // the wound thread: three arcs across the ball, clipped to it
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 0.5, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = `rgba(${C.onLine},0.26)`; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  [[-0.5, 34, 14, 10], [0.35, 30, 12, -12], [1.25, 36, 16, 4]].forEach(([rot, rx, ry, oy]) => { ctx.save(); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, oy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore(); });
  ctx.restore();
  // face
  ctx.fillStyle = `rgb(${C.onLine})`;
  [[-9, 3], [9, 3]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 3.3, 4.4, 0, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = `rgba(${C.core},0.9)`; ctx.beginPath(); ctx.ellipse(-12, -15, 6, 3.5, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---------- DOM ----------
let root, bg, mid, top, D = {};
const css = () => `
  #stage { position:absolute; left:0; top:0; width:${W}px; height:${H}px; overflow:hidden; background:${P.ground}; font-family:${TY.family}; letter-spacing:${TY.track}; }
  #stage canvas { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
  .layer { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
  .abs { position:absolute; left:0; top:0; transform-origin:0 0; will-change:transform,opacity; }
  .paper { background:${P.paper}; color:${P.ink}; border-radius:30px; box-shadow:0 18px 50px rgba(0,0,0,0.42); }
  .chat { overflow:hidden; border-radius:34px; }
  .bub { position:absolute; padding:16px 22px; border-radius:24px; white-space:pre; font:${font(TY.bubble)}; line-height:${TY.lead}; }
  .bub.bot { left:0; background:${P.bubble}; color:${P.ink}; border-top-left-radius:8px; transform-origin:0 0; }
  .bub.user { right:0; background:${P.user}; color:${P.onUser}; border-top-right-radius:8px; transform-origin:100% 0; }
  .chipm { position:absolute; left:0; padding:8px 18px; border-radius:22px; border:1.5px solid ${P.rule}; color:${P.ink2}; font:${font(TY.rowSub, 500)}; white-space:pre; }
  .file { position:absolute; right:0; padding:10px 18px 10px 14px; border-radius:16px; border:1.5px solid ${P.rule}; background:${P.paper}; color:${P.ink2}; font:${font(TY.rowSub, 500)}; display:flex; gap:12px; align-items:center; white-space:pre; }
  .doc { width:30px; height:36px; border-radius:6px; background:${P.bubble}; position:relative; flex:none; }
  .doc::after { content:''; position:absolute; left:8px; right:8px; top:11px; height:2px; background:${P.ink2}; box-shadow:0 7px 0 ${P.ink2}, 0 14px 0 ${P.ink2}; opacity:.55; }
  .input { position:absolute; left:26px; right:26px; bottom:24px; height:66px; border-radius:22px; border:1.5px solid ${P.rule}; background:${P.paper}; color:${P.ink2}; font:${font(TY.rowSub)}; line-height:63px; padding-left:24px; white-space:pre; }
  .row { display:flex; align-items:center; gap:18px; white-space:pre; }
  .ring { width:30px; height:30px; border-radius:50%; border:3px solid ${P.rule}; border-top-color:${P.accentInk}; flex:none; box-sizing:border-box; }
  .tick { width:30px; height:30px; border-radius:50%; background:${P.bubble}; flex:none; position:relative; }
  .tick::after { content:''; position:absolute; left:9px; top:6px; width:8px; height:13px; border:solid ${P.ink}; border-width:0 3px 3px 0; transform:rotate(45deg); }
  .t-row { font:${font(TY.row, 600)}; color:${P.ink}; }
  .t-sub { font:${font(TY.rowSub)}; color:${P.ink2}; }
  .cap { font:${font(TY.caption, TY.weight.caption)}; color:${P.text}; white-space:pre; }
  .capsub { font:${font(TY.sub, 500)}; color:${P.text2}; white-space:pre; }
  .lbl { font:${font(TY.label, 600)}; color:${P.text}; white-space:pre; text-shadow:0 2px 12px ${P.ground}; }
  .lbls { font:${font(TY.labelSub)}; color:${P.text2}; white-space:pre; text-shadow:0 2px 12px ${P.ground}; }
  .glass { background:${P.panel}; border:2px solid rgba(${C.line},0.55); border-radius:28px; color:${P.text}; box-shadow:0 18px 50px rgba(0,0,0,0.45); }
  .pill { display:inline-block; padding:4px 16px; border-radius:20px; font:${font(TY.rowSub, 600)}; white-space:pre; }
  .pill.acc { background:${P.accentInk}; color:${P.paper}; } /* on paper the accent is its ink tone */
  .pill.soft { background:${P.bubble}; color:${P.ink2}; font-weight:500; }
  /* opening */
  .win { position:absolute; border-radius:22px; overflow:hidden; }
  .desk .win { background:${P.paper}; color:${P.ink}; box-shadow:0 22px 60px rgba(10,20,40,0.28); }
  .night .win { background:${P.panel}; color:${P.text}; border:1.5px solid rgba(${C.text2},0.35); box-shadow:0 18px 50px rgba(0,0,0,0.5); }
  .win .bar { height:56px; display:flex; align-items:center; justify-content:space-between; padding:0 22px; font:${font(TY.window, 600)}; white-space:pre; }
  .desk .win .bar { border-bottom:1.5px solid ${P.rule}; }
  .night .win .bar { border-bottom:1.5px solid rgba(${C.text2},0.25); }
  .win .ctl { font:${font(TY.popup)}; opacity:.6; letter-spacing:6px; }
  .win .say { position:absolute; right:22px; top:80px; padding:10px 18px; border-radius:18px; background:${P.user}; color:${P.onUser}; font:${font(TY.popup)}; white-space:pre; }
  .win .st { position:absolute; left:22px; top:150px; display:flex; gap:14px; align-items:center; font:${font(TY.popup)}; white-space:pre; }
  .desk .win .st { color:${P.ink2}; } .night .win .st { color:${P.text2}; }
  .win .ln { position:absolute; left:22px; height:14px; border-radius:7px; }
  .desk .win .ln { background:${P.bubble}; } .night .win .ln { background:rgba(${C.text2},0.18); }
  .btn { display:inline-block; padding:6px 18px; border-radius:14px; font:${font(TY.popup, 600)}; white-space:pre; }
  .btn.y { background:${P.user}; color:${P.onUser}; }
  .desk .btn.n { background:${P.bubble}; color:${P.ink}; } .night .btn.n { background:rgba(${C.text2},0.2); color:${P.text}; }
  .bang { width:34px; height:34px; border-radius:50%; flex:none; font:${font(22, 700)}; line-height:34px; text-align:center; }
  .desk .bang { background:${P.ink}; color:${P.paper}; } .night .bang { background:${P.text}; color:${P.panel}; }
  .note { position:absolute; padding:26px 30px; border-radius:10px; font:${font(TY.note, 600)}; line-height:1.45; white-space:pre; }
  .desk .note { background:${P.paper}; color:${P.ink}; box-shadow:0 22px 60px rgba(10,20,40,0.3); }
  .night .note { background:${P.panel2}; color:${P.text}; box-shadow:0 18px 50px rgba(0,0,0,0.5); }
`;

const winHTML = (it, s) => {
  const ses = s.sessions[it.i];
  return `<div class="bar"><span>${esc(ses.title)}</span><span class="ctl">— ×</span></div>
    <div class="say">${esc(ses.ask)}</div>
    <div class="st"><span class="${it.i === 2 ? 'bang' : 'ring'}" ${it.i === 2 ? '' : 'style="border-top-color:currentColor"'}>${it.i === 2 ? '!' : ''}</span>${esc(ses.status)}</div>
    ${it.i === 2 ? `<div class="st" style="top:216px"><span class="btn y">${esc(s.alerts[0].yes)}</span><span class="btn n">${esc(s.alerts[0].no)}</span></div>` : `<div class="ln" style="top:220px;width:60%"></div><div class="ln" style="top:252px;width:42%"></div>`}`;
};
const alertHTML = (s, i, from) => `<div style="display:flex;gap:16px;align-items:center;padding:14px 18px;height:100%;box-sizing:border-box">
    <span class="bang">!</span><div style="white-space:pre"><div style="font:${font(TY.popup)};opacity:.72">${esc(from)}</div><div style="font:${font(TY.popup, 600)}">${esc(s.alerts[i].title)}</div></div></div>`;
const copyHTML = (s, k) => { const a = s.alerts[k % s.alerts.length], ses = s.sessions[(k + 2) % 3]; return `<div class="bar"><span>${esc(ses.title)}</span><span class="ctl">×</span></div>
    <div style="display:flex;gap:14px;align-items:center;padding:18px 22px;font:${font(TY.popup, 600)};white-space:pre"><span class="bang">!</span>${esc(a.title)}</div>
    <div style="position:absolute;right:20px;bottom:16px;display:flex;gap:12px"><span class="btn y">${esc(a.yes)}</span><span class="btn n">${esc(a.no)}</span></div>`; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function buildDOM() {
  root = document.getElementById('stage');
  const st = document.createElement('style'); st.textContent = css(); document.head.appendChild(st);
  const cv = (id, z) => { const c = $('canvas', null, root, { zIndex: z }); c.id = id; c.width = W; c.height = H; c.setAttribute('data-layout-ignore', ''); return c.getContext('2d'); };
  bg = cv('cv-bg', 0);
  D.desk = $('div', `layer ${VARIANT}`, root, { zIndex: 5 });
  mid = cv('cv-mid', 8);
  D.blocks = $('div', 'layer', root, { zIndex: 10 });
  top = cv('cv-top', 20);
  D.texts = $('div', 'layer', root, { zIndex: 30 });
  D.veil = $('div', 'layer', root, { zIndex: 40, background: `rgba(${C.ground},0.86)` });
  D.lock = $('div', 'layer', root, { zIndex: 50 });
  const mc = document.createElement('canvas'); mctx = mc.getContext('2d');

  // ---- opening ----
  const os = sc.open.s;
  if (VARIANT === 'desk') {
    D.wall = $('div', 'abs', D.desk, { width: W + 'px', height: H + 'px', background: `linear-gradient(160deg, ${P.desk1} 0%, ${P.desk2} 58%, ${P.desk3} 100%)` });
    D.bar = $('div', 'abs', D.wall, { top: H - 56 + 'px', width: W + 'px', height: '56px', background: P.deskBar, display: 'flex', alignItems: 'center', gap: '26px', paddingLeft: '28px', boxSizing: 'border-box', font: font(TY.popup, 500), color: P.ink, whiteSpace: 'pre' });
    D.bar.innerHTML = `<span style="width:30px;height:30px;border-radius:8px;background:${P.ink}"></span>` + os.sessions.map((s) => `<span style="display:flex;gap:10px;align-items:center"><span style="width:14px;height:14px;border-radius:4px;background:${P.ink2}"></span>${esc(s.title.split('·')[0].trim())}</span>`).join('');
    D.badge = $('div', 'abs', D.wall, { left: W - 70 + 'px', top: H - 50 + 'px', minWidth: '38px', height: '30px', borderRadius: '15px', background: P.ink, color: P.paper, font: font(20, 700), lineHeight: '30px', textAlign: 'center' });
  }
  D.items = OPEN.items.map((it) => {
    let e;
    if (it.kind === 'window') { e = $('div', 'win abs', D.desk, { width: it.w + 'px', height: it.h + 'px' }); e.innerHTML = winHTML(it, os); }
    else if (it.kind === 'alert') { e = $('div', 'win abs', D.desk, { width: it.w + 'px', height: it.h + 'px', borderRadius: '18px' }); e.innerHTML = alertHTML(os, it.i, os.sessions[(it.i + 2) % 3].title); }
    else if (it.kind === 'note') { e = $('div', 'note abs', D.desk); e.textContent = os.note.join('\n'); }
    else { e = $('div', 'win abs', D.desk, { width: it.w + 'px', height: it.h + 'px' }); e.innerHTML = copyHTML(os, it.i); }
    e.style.zIndex = it.kind === 'copy' ? 20 + it.i : it.kind === 'note' ? 15 : 5;
    if (it.kind === 'copy' || it.kind === 'alert') e.setAttribute('data-layout-ignore', ''); // the pile is texture: read as "too many", not line by line
    return e;
  });
  D.cursor = $('div', 'abs', D.desk, { zIndex: 60, width: '0', height: '0', borderLeft: '16px solid ' + P.ink, borderTop: '10px solid transparent', borderBottom: '10px solid transparent' });
  D.cursor.style.borderLeftColor = 'transparent';
  D.cursor.innerHTML = `<svg width="34" height="44" viewBox="0 0 34 44"><path d="M2 2 L2 36 L11 28 L17 42 L23 39 L17 26 L30 26 Z" fill="${VARIANT === 'desk' ? P.ink : P.text}" stroke="${VARIANT === 'desk' ? P.paper : P.ground}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  D.freeze = $('div', 'abs', D.veil, { width: W + 'px', top: '470px', textAlign: 'center', font: font(TY.freeze, 700), color: P.text, whiteSpace: 'pre' });

  // ---- name beside the mascot ----
  D.name = $('div', 'abs', D.texts, { left: L.NAME[0] + 'px', top: L.NAME[1] + 'px', font: font(TY.mascotName, 600), color: P.text, whiteSpace: 'pre' });
  D.name.textContent = content.product.name;

  // ---- chat block ----
  D.chat = $('div', 'abs paper chat', D.blocks);
  D.chat.setAttribute('data-hold', ''); // still while its newest line is read
  D.feed = $('div', 'abs', D.chat, { left: '30px', top: '0', right: '30px', width: 'auto' });
  D.input = $('div', 'input', D.chat); D.input.textContent = UI.input;
  const BW = 470;
  D.msgs = MSG.map((m) => {
    const e = $('div', m.who === 'chip' ? 'chipm' : `bub ${m.who}`, D.feed);
    if (m.who === 'chip') e.textContent = m.text;
    else e.textContent = lines(m.text, TY.bubble, 400, BW).join('\n');
    let f = null;
    if (m.file) { f = $('div', 'file', D.feed); f.innerHTML = `<span class="doc"></span>${esc(m.file)}`; }
    return { m, e, f };
  });

  // ---- ask: one task row hung on the thread ----
  const as = sc.ask.s;
  D.row = $('div', 'abs paper', D.blocks, { left: L.ROW.x + 'px', top: L.ROW.y + 'px', width: L.ROW.w + 'px', padding: '28px 32px', boxSizing: 'border-box', borderRadius: '28px' });
  D.row.innerHTML = `<div class="row"><span class="ring"></span><div><div class="t-row">${esc(as.task.title)}</div><div class="t-sub" data-k="run">${esc(as.task.running)}</div><div class="t-sub" data-k="done" style="position:absolute;margin-top:-${Math.round(TY.rowSub * TY.lead)}px">${esc(as.task.done)}</div></div></div>`;
  D.rowRing = D.row.querySelector('.ring'); D.rowRun = D.row.querySelector('[data-k=run]'); D.rowDone = D.row.querySelector('[data-k=done]');

  // ---- evening: the task list grown out of the chat ----
  const ev = sc.evening.s;
  D.list = $('div', 'abs paper', D.blocks, { left: L.LIST.x + 'px', top: L.LIST.y + 'px', width: L.LIST.w + 'px', height: L.LIST.h + 'px', overflow: 'hidden', borderRadius: '30px' });
  D.listHead = $('div', 'abs', D.list, { left: '34px', top: '26px', width: L.LIST.w - 68 + 'px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
  D.listHead.innerHTML = `<span class="t-row">${esc(UI.tasks)}</span><span class="row" style="gap:12px"><span class="pill soft" data-k="run"></span><span class="pill soft" data-k="queue"></span></span>`;
  D.listRun = D.listHead.querySelector('[data-k=run]'); D.listQ = D.listHead.querySelector('[data-k=queue]');
  D.listClip = $('div', 'abs', D.list, { left: '0', top: '84px', width: L.LIST.w + 'px', height: L.LIST.h - 84 + 'px', overflow: 'hidden' });
  D.listBody = $('div', 'abs', D.listClip, { left: '34px', top: '6px', width: L.LIST.w - 68 + 'px' });
  D.listRows = [];
  ev.asks.forEach((a, i) => { const r = $('div', 'abs row', D.listBody, { top: i * 58 + 'px', height: '50px' }); r.innerHTML = `<span class="ring"></span><span class="t-row" style="font-weight:500">${esc(a.task)}</span><span class="t-sub">· ${esc(UI.running)}</span>`; D.listRows.push(r); });
  for (let i = 0; i < ev.more; i++) { const q = i >= ev.more - 2; const r = $('div', 'abs row', D.listBody, { top: (ev.asks.length + i) * 58 + 'px', height: '50px' }); r.innerHTML = `<span class="ring" ${q ? `style="border-style:dashed;border-top-color:${P.rule}"` : ''}></span><span style="display:inline-block;width:${200 + ((i * 97) % 220)}px;height:16px;border-radius:8px;background:${P.bubble}"></span><span class="t-sub">${q ? '· ' + esc(UI.queued) : ''}</span>`; D.listRows.push(r); }

  // ---- constellation: the workspace region and the star labels ----
  const cs = sc.constellation.s;
  D.region = $('div', 'abs', D.blocks, { left: L.REGION.x + 'px', top: L.REGION.y + 'px', width: L.REGION.w + 'px', height: L.REGION.h + 'px', border: `2px dashed rgba(${C.text2},0.45)`, borderRadius: '28px', boxSizing: 'border-box' });
  D.regionHead = $('div', 'abs glass', D.blocks, { left: L.REGION.x + 24 + 'px', top: L.REGION.y + 22 + 'px', padding: '12px 22px', borderRadius: '20px', whiteSpace: 'pre', font: font(TY.label, 600) });
  D.regionHead.textContent = `${UI.workspace} · ${cs.workspace}`;
  D.slabels = [...CONST.stars, CONST.plan].map((c, k) => {
    const e = $('div', 'abs', D.texts, { left: c.x + 26 + 'px', top: c.y - 20 + 'px' });
    e.innerHTML = `<div class="lbl">${esc(c.label)}</div><div class="lbls" data-k="a">${esc(k < 3 ? UI.running : cs.plan.waits)}</div><div class="lbls" data-k="b" style="position:absolute;top:${Math.round(TY.label * TY.lead)}px">${esc(k < 3 ? UI.done : UI.running)}</div>`;
    return { e, a: e.querySelector('[data-k=a]'), b: e.querySelector('[data-k=b]') };
  });

  // ---- verify: the item and the gate ----
  const vs = sc.verify.s;
  D.vchip = $('div', 'abs paper', D.blocks, { left: '0', top: '0', padding: '22px 28px', borderRadius: '24px', display: 'flex', gap: '18px', alignItems: 'center', whiteSpace: 'pre' });
  D.vchip.innerHTML = `<span class="doc"></span><span class="t-row">${esc(vs.item)}</span><span class="ring" style="margin-left:6px"></span>`;
  D.vring = D.vchip.querySelector('.ring');
  D.gateLbl = $('div', 'abs lbls', D.texts); D.gateLbl.textContent = vs.gate;
  D.vfail = $('div', 'abs lbls', D.texts); D.vfail.textContent = vs.fail;
  D.vpass = $('div', 'abs lbl', D.texts); D.vpass.innerHTML = `<span style="display:inline-block;width:12px;height:22px;border:solid ${P.line};border-width:0 4px 4px 0;transform:translateY(-4px) rotate(45deg);margin:0 18px 0 6px"></span>${esc(vs.pass)}`;

  // ---- cards: whole – part – whole ----
  const cd = sc.cards.s;
  D.cards = cd.cards.map((c, k) => {
    const e = $('div', 'abs glass', D.blocks, { width: L.CARD.w + 'px', padding: '26px 34px', boxSizing: 'border-box' });
    e.innerHTML = `<div style="font:${font(TY.cardTitle, 600)};white-space:pre">${esc(c.title)}</div><div style="font:${font(TY.cardSub)};color:${P.text2};white-space:pre;margin-top:4px">${esc(c.sub)}</div>`;
    const rows = c.rows.map((r) => { const x = $('div', null, e, { marginTop: '14px', padding: '12px 20px', borderRadius: '16px', background: P.panel2, border: `1.5px solid rgba(${C.line},0.35)`, font: font(TY.cardRow), whiteSpace: 'pre' }); x.textContent = r; return x; });
    return { e, rows };
  });

  // ---- close: the task panel, the nudge, the claim ----
  const cl = sc.close.s;
  const nDone = STARS.length - 1;
  D.panel = $('div', 'abs paper', D.blocks, { left: L.PANEL.x + 'px', top: L.PANEL.y + 'px', width: L.PANEL.w + 'px', padding: '30px 34px', boxSizing: 'border-box', borderRadius: '30px' });
  D.panel.innerHTML = `<div class="t-row" style="font-size:${TY.row + 2}px">${esc(cl.panel.title)}</div>
    <div class="row" style="gap:12px;margin:18px 0 10px"><span class="pill soft" style="background:${P.ink};color:${P.paper}">${esc(UI.all)}</span><span class="pill acc" data-k="need">${esc(UI.needsYou)} 1</span><span class="pill soft">${esc(UI.running)} 0</span><span class="pill soft">${esc(UI.done)} ${nDone}</span></div>
    ${cl.panel.rows.map((r) => `<div class="row" style="padding:16px 18px;margin:0 -18px;border-radius:18px;${r.status === 'needs' ? `background:${P.bubble}` : ''}">
      ${r.status === 'needs' ? `<span style="width:30px;height:30px;border-radius:50%;background:${P.accentInk};flex:none"></span>` : '<span class="tick"></span>'}
      <div><div class="t-row">${esc(r.title)}</div><div class="t-sub">${r.status === 'needs' ? `<span style="color:${P.accentInk};font-weight:600">${esc(UI.needsYou)}</span> · ` : esc(UI.done) + ' · '}${esc(r.detail)}</div></div></div>`).join('')}`;
  D.needPill = D.panel.querySelector('[data-k=need]');
  D.nudge = $('div', 'abs paper', D.blocks, { padding: '18px 26px', borderRadius: '22px', whiteSpace: 'pre', font: font(TY.row, 600), display: 'flex', gap: '14px', alignItems: 'center' });
  D.nudge.innerHTML = `<span style="width:16px;height:16px;border-radius:50%;background:${P.accentInk};flex:none"></span>${esc(cl.nudge)}`;
  D.claim = glyphs($('div', 'abs', D.texts, { left: '0', top: L.FLAT_Y - 230 + 'px', width: W + 'px' }), cl.claim, { px: TY.claim, w: TY.weight.claim, color: P.text, align: 'center', maxW: 1500 });
  D.claim.box.parentNode.style.textAlign = 'center';
  D.words = cl.words.map((w) => { const e = $('div', 'abs', D.texts, { font: font(TY.word, 600), color: P.text, whiteSpace: 'pre' }); e.textContent = w; return e; });

  // ---- captions ----
  const capOf = (type, key, t0) => ({ type, key, t0, G: null });
  const caps = [];
  ['ask', 'evening', 'constellation', 'verify', 'cards', 'close'].forEach((type) => {
    const k = sc[type].k, s = sc[type].s;
    caps.push({ text: s.caption, t0: sc[type].start + k.cap });
    if (type === 'constellation') caps.push({ text: s.caption2, t0: sc[type].start + k.cap2 });
  });
  caps.forEach((c, i) => { c.t1 = i + 1 < caps.length ? caps[i + 1].t0 : sc.close.start + sc.close.k.recede; if (caps[i + 1] && sc.close.start + sc.close.k.cap === caps[i + 1].t0) c.t1 = sc.close.start + 0.6 * B; });
  D.caps = caps.map((c) => ({ ...c, G: glyphs($('div', 'abs', D.texts, { left: L.CAP[0] + 'px', top: L.CAP[1] + 'px' }), c.text, { px: TY.caption, w: TY.weight.caption, color: P.text, maxW: L.CAP_W }) }));
  D.caps.forEach((c) => { if (c.G.lines.length > 1) LAYOUT.push(`caption "${c.text}" needs ${c.G.lines.length} lines at ${TY.caption}px in ${L.CAP_W}px; shorten it`); });
  D.capsub = glyphs($('div', 'abs', D.texts, { left: L.CAP[0] + 'px', top: L.CAP[1] + Math.round(TY.caption * 1.3) + 'px' }), cd.caption2, { px: TY.sub, w: 500, color: P.text2, maxW: L.CAP_W });

  // ---- lock-up ----
  D.lname = $('div', 'abs', D.lock, { left: '0', top: '0', font: font(TY.name, TY.weight.name), color: P.text, whiteSpace: 'pre', letterSpacing: '-0.02em' });
  D.lname.textContent = content.product.name;
  D.ltag = glyphs($('div', 'abs', D.lock, { left: '0', top: '650px', width: W + 'px' }), content.product.tagline, { px: TY.tagline, w: 500, color: P.text2, align: 'center', maxW: 1400 });
  D.ltag.box.parentNode.style.textAlign = 'center';

  // cv-top (the mascot and sparks over the hung blocks) is transparent except where it draws, but the layout check
  // of the pinned hyperframes counts any canvas as opaque and would report every block's text as hidden beneath it;
  // the layering is intended, so the text under it is marked as such
  for (const layer of [D.desk, D.blocks]) layer.querySelectorAll('*').forEach((e) => e.setAttribute('data-layout-allow-occlusion', ''));
}

let geo = {};
export const LAYOUT = []; // measured-layout problems (copy that does not fit its slot), shown as a red banner
function measureDOM() {
  // chat feed: stack the messages once their heights are known
  let y = 34; geo.msgs = [];
  D.msgs.forEach(({ m, e, f }) => {
    if (f) { f.style.top = y + 'px'; y += f.offsetHeight + 10; }
    e.style.top = y + 'px';
    const h = e.offsetHeight;
    geo.msgs.push({ at: m.at, top: (f ? y - f.offsetHeight - 10 : y), bottom: y + h });
    y += h + 18;
  });
  geo.rowH = D.row.offsetHeight;
  geo.vchip = { w: D.vchip.offsetWidth, h: D.vchip.offsetHeight };
  geo.cards = D.cards.map((c) => ({ h0: c.e.offsetHeight - c.rows.reduce((n, r) => n + r.offsetHeight + 14, 0) }));
  D.cards.forEach((c, k) => { geo.cards[k].h1 = c.e.offsetHeight; });
  geo.panelH = D.panel.offsetHeight;
  geo.nudge = { w: D.nudge.offsetWidth, h: D.nudge.offsetHeight };
  geo.name = { w: D.lname.offsetWidth, h: D.lname.offsetHeight };
  geo.words = D.words.map((e) => ({ w: e.offsetWidth, h: e.offsetHeight }));
  geo.items = D.items.map((e) => ({ w: e.offsetWidth, h: e.offsetHeight }));
  // evening stars leave from their row's ring at the moment of launch
  STARS.forEach((s) => { if (s.row != null) { const p = listRowPos(s.row, s.launchAt); s.from = [p[0] + 15, p[1] + 25]; } });
}

export async function ready() {
  buildDOM(); measureDOM();
  if (LAYOUT.length) { console.error('[stream] ' + LAYOUT.join('\n')); errorBanner(['COPY DOES NOT FIT', ...LAYOUT], 'hf-layout-error'); }
}

// ---------- per-frame helpers ----------
const SPINE = (t) => {
  // the spine exists from the end of the opening until the closing sweep starts
  const o = sc.open, k = o.k;
  const grow = E.io2(seg(t, o.start + k.sink0 + 0.5 * (k.sink1 - k.sink0), o.start + k.sink1 + 0.1));
  const ret = E.io2(seg(t, S8.r0, S8.gA));
  return { on: grow > 0 && t < S8.gA, bot: lerp(L.MASCOT[1] + 34, L.SPINE_BOT, grow) - (L.SPINE_BOT - L.SPINE_TOP) * ret * (grow >= 1 ? 1 : 0), ret };
};
const listGeo = (t) => {
  const e = sc.evening, k = e.k, c = sc.constellation;
  const g = E.io3(seg(t, e.start + k.grow + 0.3 * B, e.start + k.grow + 1.3 * B)) * (1 - E.io3(seg(t, c.start + c.k.back, c.start + c.k.back + 0.8 * B)));
  return { w: L.LIST.w * g, a: g > 0.001 ? 1 : 0 };
};
const listCount = (t) => { const e = sc.evening; let n = 0; e.s.asks.forEach((_, i) => { if (t >= e.start + e.k.asks[i] + 0.2 * B) n++; }); e.k.burst.forEach((x) => { if (t >= e.start + x) n++; }); return n; };
const listScroll = (t) => { const n = listCount(t); const visible = 6; return Math.max(0, n - visible) * 58; };
const listScrollEased = (t) => { // ease each step of the scroll over 0.25 s
  const e = sc.evening; const times = [...e.s.asks.map((_, i) => e.start + e.k.asks[i] + 0.2 * B), ...e.k.burst.map((x) => e.start + x)];
  let y = 0; times.forEach((tt, i) => { if (i + 1 > 6) y += 58 * E.out3(seg(t, tt, tt + 0.25)); }); return y;
};
function listRowPos(i, t) { return [L.LIST.x + 34, L.LIST.y + 90 + i * 58 - listScrollEased(t)]; }

// ---------- render ----------
export function render(t) {
  renderBG(t);
  mid.clearRect(0, 0, W, H); top.clearRect(0, 0, W, H);
  mid.globalCompositeOperation = 'lighter'; top.globalCompositeOperation = 'lighter';
  renderOpen(t);
  renderSpine(t);
  renderChat(t);
  renderAsk(t);
  renderEvening(t);
  renderConst(t);
  renderVerify(t);
  renderCards(t);
  renderClose(t);
  renderCaptions(t);
  renderLock(t);
  mid.globalCompositeOperation = 'source-over'; top.globalCompositeOperation = 'source-over';
}

// the night: field, drifting dust, soft bokeh, and every task star
const RND = mulberry32((content.seed ?? 1) * 31 + 5);
const DUST = Array.from({ length: 240 }, () => ({ x: RND() * W, y: RND() * H, r: 0.5 + RND() * 1.3, a: 0.16 + RND() * 0.42, vx: -(2 + RND() * 5), ph: RND() * 6.28, z: 0.2 + RND() * 0.4 }));
const BOKEH = Array.from({ length: 22 }, () => ({ x: RND() * W, y: RND() * H, r: 8 + RND() * 22, a: 0.05 + RND() * 0.09, vx: -(4 + RND() * 6), vy: (RND() - 0.5) * 3, z: 0.5 + RND() * 0.4 }));
const wrapv = (v, m) => ((v % m) + m) % m;
function starState(s, t) {
  if (t < s.launchAt) return null;
  const fly = seg(t, s.launchAt, s.launchAt + s.fly);
  let x = s.x + Math.sin(t * 0.4 + s.tw) * 3, y = s.y + Math.cos(t * 0.33 + s.tw) * 3;
  if (fly < 1) {
    const q = E.io2(fly);
    if (s.beam) { const p = arcPts(s.from, [s.x, s.y], q, q, 1)[0]; x = p[0]; y = p[1]; }
    else { const v = [lerp(s.from[0], x, 0.5), Math.min(s.from[1], y) - 120], r = 1 - q; x = r * r * s.from[0] + 2 * r * q * v[0] + q * q * x; y = r * r * s.from[1] + 2 * r * q * v[1] + q * q * y; }
  }
  let a = E.out3(seg(t, s.launchAt, s.launchAt + 0.2)) * (s.queued ? 0.5 : 1);
  if (s.cst) a *= lerp(1, 0.45, seg(t, sc.verify.start, sc.verify.start + 0.8));
  else a *= lerp(1, 0.45, seg(t, s.launchAt + s.fly + 1.2, s.launchAt + s.fly + 2.2));
  const caught = seg(t, s.catchT - 0.06, s.catchT + 0.12);
  const g = GATHER.pos(s, t);
  if (g) { a = lerp(a, 1, caught); x = g.x; y = g.y; a *= 1 - seg(g.k, 0.88, 1); }
  return { x, y, a: a * (0.86 + 0.14 * Math.sin(t * 1.7 + s.tw)), fly, caught };
}
function renderBG(t) {
  const ctx = bg;
  const g = ctx.createRadialGradient(760, 520, 80, 960, 540, 1250);
  g.addColorStop(0, P.field); g.addColorStop(0.55, P.ground); g.addColorStop(1, P.fieldEdge);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const push = 1 + 0.05 * E.io2(t / duration);
  ctx.globalCompositeOperation = 'lighter';
  DUST.forEach((s) => { const x = wrapv(s.x + s.vx * t, W + 40) - 20; const px = 960 + (x - 960) * (1 + (push - 1) * s.z), py = 540 + (s.y - 540) * (1 + (push - 1) * s.z); ctx.fillStyle = `rgba(${C.dust},${(s.a * (0.75 + 0.25 * Math.sin(s.ph + t * 1.3))).toFixed(3)})`; ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill(); });
  BOKEH.forEach((b) => { const x = wrapv(b.x + b.vx * t, W + 80) - 40, y = wrapv(b.y + b.vy * t, H + 80) - 40; glow(ctx, x, y, b.r, C.line, b.a); });
  STARS.forEach((s) => {
    const st = starState(s, t); if (!st || st.a <= 0.01) return;
    const fl = st.fly < 1 ? 1 - st.fly : 0;
    if (fl > 0) for (let k = 8; k >= 1; k--) { const p = starState(s, t - k * 0.03); if (p && t - k * 0.03 >= s.launchAt) glow(ctx, p.x, p.y, 20 - k, C.glow, 0.45 * fl * (1 - k / 9)); }
    star(ctx, st.x, st.y, s.size * (1 + 0.25 * st.caught + 0.7 * fl), st.a);
    if (s.queued && t < sc.constellation.start) { ctx.save(); ctx.setLineDash([4, 6]); ctx.strokeStyle = `rgba(${C.glow},${(0.6 * st.a).toFixed(3)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(st.x, st.y, 16, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  });
  ctx.globalCompositeOperation = 'source-over';
}

function renderOpen(t) {
  const o = sc.open, k = o.k, s0 = o.start;
  const T = (x) => s0 + x;
  const sinkK = E.io3(seg(t, T(k.sink0), T(k.sink1)));
  const gone = t > T(k.sink1) + 0.2;
  D.desk.style.display = gone ? 'none' : 'block';
  if (!gone) {
    // the whole desk is pulled away into the mascot and sinks into the night
    const cxy = OPEN.drop;
    const sc1 = lerp(1, 0.28, sinkK);
    D.desk.style.transformOrigin = `${cxy[0]}px ${cxy[1]}px`;
    D.desk.style.transform = `scale(${sc1.toFixed(4)})`;
    D.desk.style.opacity = (1 - E.in3(sinkK)).toFixed(3);
    if (D.badge) { const n = Math.min(30, OPEN.items.filter((it, j) => t >= appearAt(it)).length * 2 - 4); D.badge.textContent = Math.max(1, n); D.badge.style.opacity = t >= T(k.alert[0]) ? 1 : 0; }
    const head = OPEN.head(t);
    OPEN.items.forEach((it, j) => {
      const e = D.items[j], a0 = appearAt(it);
      if (t < a0) { put(e, { o: 0 }); return; }
      const inK = E.outExpo(seg(t, a0, a0 + 0.32));
      let x = it.x, y = it.y, s = lerp(it.kind === 'note' ? 1.12 : 0.94, 1, inK), o = inK, r = it.rot ?? 0;
      if (it.kind === 'alert') x += 60 * (1 - inK);
      if (VARIANT === 'night' && it.drift != null) { x += Math.sin(t * 0.5 + it.drift) * 8; y += Math.cos(t * 0.4 + it.drift) * 6; }
      // tug: reeled in along the thread toward the mascot
      const tg = E.io2(seg(t, T(k.tug) + 0.6 * B * (it.d / OPEN.total), T(k.tugEnd)));
      if (tg > 0) {
        const p = atLen(OPEN.path, OPEN.len, it.d * (1 - tg));
        x = p[0] - it.w / 2 + (x - it.x) * (1 - tg); y = p[1] - it.h / 2 + (y - it.y) * (1 - tg);
        s *= lerp(1, 0.08, tg); o *= 1 - seg(tg, 0.75, 1); r *= 1 - tg;
      }
      e.style.transformOrigin = `${it.w / 2}px ${it.h / 2}px`;
      put(e, { o, x, y, s, r });
      // pierced: the item lights up where the thread passes it
      const lit = seg(t, it.pierce - 0.02, it.pierce + 0.06) * (1 - 0.6 * seg(t, it.pierce + 0.1, it.pierce + 0.5));
      e.style.boxShadow = lit > 0.01 ? `0 0 0 ${(3 * lit).toFixed(1)}px rgba(${C.line},${(0.9 * lit).toFixed(2)}), 0 0 ${(40 * lit).toFixed(0)}px rgba(${C.line},${(0.6 * lit).toFixed(2)})` : '';
    });
    // the cursor goes for "Allow" on the newest copy and is covered by the next one
    const c0 = T(k.click) - 0.6, c1 = T(k.click), cp = OPEN.items.find((it) => it.kind === 'copy' && it.i === 0);
    const ca = seg(t, c0, c0 + 0.15) * (1 - seg(t, T(k.cascade[3]), T(k.cascade[3]) + 0.1));
    const cx = lerp(cp.x + 260, cp.x + cp.w - 150, E.io2(seg(t, c0, c1))), cy = lerp(cp.y + 260, cp.y + cp.h - 40, E.io2(seg(t, c0, c1)));
    put(D.cursor, { o: ca, x: cx, y: cy, s: t > c1 && t < c1 + 0.12 ? 0.9 : 1 });
  }
  // freeze: a veil and one line, typed
  const fz = T(k.fz), dr = T(k.drop);
  const v = seg(t, fz, fz + 0.25) * (1 - seg(t, dr - 0.05, dr + 0.3));
  D.veil.style.opacity = v.toFixed(3); D.veil.style.visibility = v > 0.001 ? 'visible' : 'hidden';
  D.freeze.textContent = typed(sc.open.s.freeze, t, fz + 0.15, lang);
  // the mascot drops in; later it moves to the top of the spine
  const land = T(k.land);
  if (t >= dr) {
    const fall = E.in3(seg(t, dr, land));
    let x = OPEN.drop[0], y = lerp(-120, OPEN.drop[1], fall), s = 1.6, sq = 0;
    if (t >= land) { const b = seg(t, land, land + 0.22); sq = 0.18 * Math.sin(Math.PI * b) * (1 - b); }
    const mv = E.io3(seg(t, T(k.sink0), T(k.sink1)));
    x = lerp(x, L.MASCOT[0], mv); y = lerp(y, L.MASCOT[1], mv); s = lerp(s, 1, mv);
    if (t < sc.lockup.start) mascot(top, x, y, s, 1, sq);
  }
  // the thread: shoots from the mascot through every item, goes taut, reels them in
  const th0 = T(k.th0), th1 = T(k.th1), tugEnd = T(k.tugEnd);
  if (t >= th0 && t < tugEnd + 0.1) {
    let d1 = OPEN.head(t);
    if (t > T(k.tug)) d1 = Math.max(0, ...OPEN.items.map((it) => it.d * (1 - E.io2(seg(t, T(k.tug) + 0.6 * B * (it.d / OPEN.total), tugEnd)))));
    const pts = subPath(OPEN.path, OPEN.len, 0, d1);
    const taut = seg(t, th1 - 0.05, th1 + 0.1) * (1 - seg(t, th1 + 0.2, th1 + 0.8));
    thread(top, pts, 1, 1 + 0.6 * taut);
    const hp = atLen(OPEN.path, OPEN.len, d1);
    if (t < th1) { glow(top, hp[0], hp[1], 44, C.line, 0.7); glow(top, hp[0], hp[1], 10, C.core, 1); }
    if (taut > 0) glow(top, OPEN.drop[0], OPEN.drop[1], 260, C.line, 0.35 * taut);
  }
}
const appearAt = (it) => { const k = sc.open.k, s0 = sc.open.start; return s0 + (it.kind === 'window' ? k.win[it.i] : it.kind === 'alert' ? k.alert[it.i] : it.kind === 'note' ? k.note : k.cascade[it.i]); };

function renderSpine(t) {
  const sp = SPINE(t);
  if (sp.on) {
    const pts = straight([L.SPINE_X, L.MASCOT[1] + 34], [L.SPINE_X, sp.bot], 60);
    thread(mid, pts, 1);
    if (sp.ret > 0) { glow(mid, L.SPINE_X, sp.bot, 44, C.line, 0.6); glow(mid, L.SPINE_X, sp.bot, 12, C.core, 0.95); }
    else if (sp.bot > L.SPINE_BOT - 1) for (let j = 0; j < 3; j++) { const y = lerp(L.SPINE_TOP, L.SPINE_BOT, wrapv(t * 0.11 + j / 3, 1)); glow(mid, L.SPINE_X, y, 10, C.glow, 0.35); }
  }
  // the name beside the mascot
  const n0 = sc.intro.start + sc.intro.k.name, n1 = sc.lockup.start + 0.4 * B;
  put(D.name, { ...blurIn(t, n0 + 0.1, 0.3, n1, 0.3), x: 0, y: 0 });
}

function renderChat(t) {
  const c = PLAN.cardAt(t);
  if (c.a <= 0 || c.w < 1) { D.chat.style.display = 'none'; return; }
  D.chat.style.display = 'block';
  Object.assign(D.chat.style, { left: c.x.toFixed(1) + 'px', top: c.y.toFixed(1) + 'px', width: c.w.toFixed(1) + 'px', height: c.h.toFixed(1) + 'px', opacity: '1' });
  // hook: a point on the spine and a short light to the block's left edge
  const hy = c.y + 64;
  thread(mid, [[L.SPINE_X, hy], [c.x + 6, hy]], 0.9, 0.7); glow(mid, L.SPINE_X, hy, 22, C.glow, 0.7); glow(mid, L.SPINE_X, hy, 6, C.core, 1);
  // the feed: newest message at the bottom, older ones scroll up and out
  let bottom = 34;
  geo.msgs.forEach((g, i) => { const k = E.out3(seg(t, g.at - 0.12, g.at + 0.3)); if (k > 0) bottom = lerp(i ? geo.msgs[i - 1].bottom : 34, g.bottom, k); });
  const off = Math.max(0, bottom - (c.h - 120));
  D.feed.style.transform = `translateY(${(-off).toFixed(1)}px)`;
  D.msgs.forEach(({ m, e, f }) => {
    const k = E.outExpo(seg(t, m.at - 0.12, m.at + 0.3));
    const p = { o: k, b: 6 * (1 - k) };
    if (m.who === 'bot') Object.assign(p, { sx: lerp(0.7, 1, k), sy: lerp(0.85, 1, k) });
    else if (m.who === 'user') p.x = 40 * (1 - k);
    put(e, p); if (f) put(f, { o: k, x: 40 * (1 - k), b: 6 * (1 - k) });
  });
}

function renderAsk(t) {
  const a = sc.ask, k = a.k, T = (x) => a.start + x;
  const r0 = T(k.row), done = T(k.done), launch = T(k.launch);
  if (t < r0 || t > launch + 0.5) { put(D.row, { o: 0 }); return; }
  const inK = E.outExpo(seg(t, r0, r0 + 0.35)), outK = E.in3(seg(t, launch - 0.05, launch + 0.3));
  D.row.style.transformOrigin = outK > 0 ? '52px 50px' : '0 50%';
  put(D.row, { o: inK * (1 - seg(outK, 0.7, 1)), sx: lerp(0.2, 1, inK) * (1 - outK), sy: lerp(0.9, 1, inK) * (1 - outK) });
  const dk = seg(t, done, done + 0.2);
  D.rowRun.style.opacity = (1 - dk).toFixed(2); D.rowDone.style.opacity = dk.toFixed(2);
  D.rowRing.className = dk > 0.5 ? 'tick' : 'ring'; D.rowRing.style.transform = dk > 0.5 ? '' : `rotate(${(t * 360) % 360}deg)`;
  // the row hangs on the thread: a beam from the chat block's edge
  const c = PLAN.cardAt(t), y = L.ROW.y + geo.rowH / 2, x0 = c.x + c.w;
  if (inK > 0 && outK < 1) { const pts = straight([x0, y], [lerp(x0, L.ROW.x, inK), y], 12); thread(mid, pts, 0.85 * (1 - outK), 0.7); glow(mid, x0, y, 18, C.glow, 0.7 * (1 - outK)); }
}

function renderEvening(t) {
  const e = sc.evening, g = listGeo(t);
  if (g.w < 1) { D.list.style.display = 'none'; return; }
  D.list.style.display = 'block'; D.list.style.width = g.w.toFixed(1) + 'px';
  const n = listCount(t), nq = e.k.burst.filter((x, i) => i >= e.s.more - 2 && t >= e.start + x).length;
  D.listRun.textContent = `${UI.running} ${n - nq}`; D.listQ.textContent = `${UI.queued} ${nq}`; D.listQ.style.display = nq ? '' : 'none';
  D.listBody.style.transform = `translateY(${(-listScrollEased(t)).toFixed(1)}px)`;
  const times = [...e.s.asks.map((_, i) => e.start + e.k.asks[i] + 0.2 * B), ...e.k.burst.map((x) => e.start + x)];
  D.listRows.forEach((r, i) => { const k = E.outExpo(seg(t, times[i] - 0.05, times[i] + 0.3)); put(r, { o: k, x: 30 * (1 - k), b: 5 * (1 - k) }); const ring = r.querySelector('.ring'); if (ring && i < e.s.asks.length + e.s.more - 2) ring.style.transform = `rotate(${(t * 360 + i * 40) % 360}deg)`; });
}

function renderConst(t) {
  const c = sc.constellation, k = c.k, T = (x) => c.start + x;
  const off = sc.verify.start + 0.4 * B;
  const reg = blurIn(t, T(k.ws), 0.4, off + 0.3, 0.4, 4);
  put(D.region, { o: reg.o * 0.9, b: reg.b, s: lerp(0.97, 1, E.out3(seg(t, T(k.ws), T(k.ws) + 0.4))) });
  put(D.regionHead, { ...blurIn(t, T(k.ws) + 0.15, 0.3, off + 0.3, 0.3), x: 0 });
  const beamA = 1 - seg(t, off, off + 0.4);
  const all = [...CONST.stars, CONST.plan];
  all.forEach((s, i) => {
    if (t < s.launchAt) { put(D.slabels[i].e, { o: 0 }); return; }
    // the beam the star travelled along stays, dim
    const u = E.io2(seg(t, s.launchAt, s.launchAt + 0.6));
    thread(mid, arcPts(CONST.origin, [s.x, s.y], 0, u, 40), 0.42 * beamA, 0.6);
    // results flow back along the beam to the thread
    if (s.ret) { const q = seg(t, s.ret, s.ret + 0.7); if (q > 0 && q < 1) { const p = arcPts(CONST.origin, [s.x, s.y], 1 - E.io2(q), 1 - E.io2(q), 1)[0]; glow(mid, p[0], p[1], 30, C.glow, 0.8); glow(mid, p[0], p[1], 7, C.core, 1); } }
    const lb = blurIn(t, s.launchAt + 0.45, 0.3, off + 0.2, 0.3);
    put(D.slabels[i].e, lb);
    const sw = i < 3 ? seg(t, s.ret + 0.6, s.ret + 0.8) : seg(t, CONST.link, CONST.link + 0.2);
    D.slabels[i].a.style.opacity = (1 - sw).toFixed(2); D.slabels[i].b.style.opacity = sw.toFixed(2);
  });
  if (t >= T(k.ws) && t < off + 0.5) glow(mid, CONST.origin[0], CONST.origin[1], 26, C.glow, 0.7 * beamA);
  // the constellation: the three findings join the plan
  const lk = seg(t, CONST.link - 0.3, CONST.link + 0.5);
  if (lk > 0 && beamA > 0) {
    const P4 = all.map((s) => [s.x, s.y]);
    [[0, 3], [1, 3], [2, 3], [0, 1], [1, 2]].forEach(([a, b], j) => { const q = E.io2(clamp(lk * 1.6 - j * 0.15)); if (q > 0) thread(mid, straight(P4[a], [lerp(P4[a][0], P4[b][0], q), lerp(P4[a][1], P4[b][1], q)], 12), 0.75 * beamA, 0.55); });
    const fl = seg(t, CONST.link, CONST.link + 0.1) * (1 - seg(t, CONST.link + 0.2, CONST.link + 1.2));
    if (fl > 0) glow(top, CONST.plan.x, CONST.plan.y, 220, C.line, 0.35 * fl);
  }
}

function renderVerify(t) {
  const v = sc.verify, k = v.k, T = (x) => v.start + x;
  const GX = 1400, GY0 = 400, GY1 = 860, Y = 600;
  const end = T(k.fold) + 0.4;
  if (t < v.start || t > end + 0.1) { put(D.vchip, { o: 0 }); put(D.gateLbl, { o: 0 }); put(D.vfail, { o: 0 }); put(D.vpass, { o: 0 }); return; }
  const out = E.in3(seg(t, T(k.fold), end));
  // the gate rises from its middle
  const gk = E.outExpo(seg(t, T(k.gate), T(k.gate) + 0.5));
  const gh = (GY1 - GY0) / 2 * gk, gc = (GY0 + GY1) / 2;
  const passK = seg(t, T(k.pass) - 0.15, T(k.pass) + 0.1) * (1 - 0.5 * seg(t, T(k.pass) + 0.3, T(k.pass) + 1));
  const hitK = seg(t, T(k.hit) - 0.02, T(k.hit) + 0.05) * (1 - seg(t, T(k.hit) + 0.1, T(k.hit) + 0.5));
  thread(mid, straight([GX, gc - gh], [GX, gc + gh], 10), (0.8 + 0.2 * passK) * (1 - out), 1.1 + 0.8 * passK);
  if (hitK > 0) { glow(top, GX, Y, 200, C.core, 0.55 * hitK); glow(top, GX, Y, 60, C.core, 0.9 * hitK); }
  put(D.gateLbl, { ...blurIn(t, T(k.gate) + 0.2, 0.3, end, 0.3), x: GX - D.gateLbl.offsetWidth / 2, y: GY0 - 56 });
  // the item: up to the gate, stopped and sent back, reworked, through
  const w = geo.vchip.w, h = geo.vchip.h, xStart = 1010, xGate = GX - w - 8, xBack = 990, xPast = GX + 40;
  let x = xStart;
  x = lerp(x, xGate, E.in3(seg(t, T(k.go1), T(k.hit))));
  x = lerp(x, xBack, E.outExpo(seg(t, T(k.hit), T(k.hit) + 0.45)));
  x = lerp(x, xGate, E.io2(seg(t, T(k.go2), T(k.go2) + 0.6 * (T(k.pass) - T(k.go2)))));
  x = lerp(x, xPast, E.out3(seg(t, T(k.go2) + 0.6 * (T(k.pass) - T(k.go2)), T(k.pass) + 0.2)));
  const ink = blurIn(t, v.start + 0.2, 0.35, end, 0.3);
  put(D.vchip, { o: ink.o, b: ink.b, x, y: Y - h / 2, s: 1 - 0.04 * hitK });
  D.vring.style.visibility = t >= T(k.rework) && t < T(k.go2) ? 'visible' : 'hidden';
  D.vring.style.transform = `rotate(${(t * 420) % 360}deg)`;
  D.vchip.style.boxShadow = t >= T(k.pass) ? `0 0 0 3px rgba(${C.line},${(0.9 * (1 - out)).toFixed(2)}), 0 18px 50px rgba(0,0,0,0.42)` : '';
  // the chip hangs on the thread too: a beam from the chat block's edge
  const c = PLAN.cardAt(t);
  if (c.w > 1) thread(mid, straight([c.x + c.w, Y], [x, Y], 16), 0.7 * ink.o, 0.6);
  put(D.vfail, { ...blurIn(t, T(k.hit) + 0.15, 0.3, T(k.rework) + 0.2, 0.25), x: x, y: Y + h / 2 + 18 });
  put(D.vpass, { ...blurIn(t, T(k.pass) + 0.1, 0.3, end, 0.3), x: xPast, y: Y + h / 2 + 18 });
}

// cards: where card k is at time t (left, top, scale, height, alpha)
function cardGeo(k, t) {
  const c = sc.cards, kk = c.k, T = (x) => c.start + x;
  const base = { x: L.CARD.x, y: L.CARD.ys[k], s: 1, h: geo.cards[k].h0, a: 1 };
  let z = 0, dim = 0;
  kk.zoom.forEach((zz, j) => {
    const zEnd = j + 1 < kk.zoom.length ? T(kk.zoom[j + 1].z0) : T(kk.whole);
    const q = E.io3(seg(t, T(zz.z0), T(zz.z0) + 0.55)) * (1 - E.io3(seg(t, zEnd, zEnd + 0.55)));
    if (j === k) z = q; else dim = Math.max(dim, q);
  });
  const Z = { x: L.ZOOM.x, y: Math.max(260, 600 - (geo.cards[k].h1 * L.ZOOM.s) / 2), s: L.ZOOM.s, h: geo.cards[k].h1 };
  return { x: lerp(base.x, Z.x, z) + 90 * dim * (1 - z), y: lerp(base.y, Z.y, z), s: lerp(1, Z.s, z), h: lerp(base.h, Z.h, z), a: lerp(1, 0.3, dim * (1 - z)), z };
}
function renderCards(t) {
  const c = sc.cards, k = c.k, T = (x) => c.start + x;
  const cl = sc.close, fold = cl.start + 0.05, foldEnd = cl.start + cl.k.gA - 0.05;
  const vis = t >= T(k.fork) && t < foldEnd + 0.1;
  D.cards.forEach((card, i) => {
    if (!vis || t < T(k.land[i]) - 0.4) { put(card.e, { o: 0 }); return; }
    const g = cardGeo(i, t);
    const fk = E.in3(seg(t, fold + i * 0.06, foldEnd));
    const inK = E.outExpo(seg(t, T(k.land[i]), T(k.land[i]) + 0.4));
    card.e.style.height = g.h.toFixed(1) + 'px'; card.e.style.overflow = 'hidden';
    card.e.style.transformOrigin = '0 50%';
    put(card.e, { o: g.a * inK * (1 - seg(fk, 0.6, 1)), x: g.x, y: g.y, sx: g.s * lerp(0.15, 1, inK) * (1 - fk), sy: g.s * (1 - 0.6 * fk) });
    card.e.style.zIndex = g.z > 0.01 ? 3 : 1;
    card.rows.forEach((r, j) => { const zz = k.zoom[i]; const rk = E.out3(seg(t, T(zz.rows[j]), T(zz.rows[j]) + 0.3)); put(r, { o: rk * g.z, x: 20 * (1 - rk) }); r.style.position = 'relative'; });
    // the strand: from the spine to the card's left edge, fed out as the card lands, wound back as it folds
    const ex = g.x * (1 - fk) + L.SPINE_X * fk, ey = g.y + (g.h * g.s) / 2;
    const sy = L.CARD.ys[i] + geo.cards[i].h0 / 2;
    const draw = E.io2(seg(t, T(k.fork) + i * 0.5 * B, T(k.land[i])));
    const tipX = lerp(L.SPINE_X, ex, draw);
    const pts = []; for (let j = 0; j <= 30; j++) { const f = j / 30, x = lerp(L.SPINE_X, tipX, f); const yy = lerp(sy, ey, E.io2(clamp((x - L.SPINE_X) / Math.max(1, ex - L.SPINE_X) * 1.4 - 0.4))); pts.push([x, yy]); }
    thread(mid, pts, (0.95 - 0.5 * (1 - g.a)) * (1 - seg(fk, 0.9, 1)), 0.75);
    glow(mid, L.SPINE_X, sy, 18, C.glow, 0.6 * draw * (1 - fk));
  });
  glyphsAt(D.capsub, t, T(k.cap2), sc.close.start + 0.6 * B);
}

function renderClose(t) {
  const c = sc.close, k = c.k, T = (x) => c.start + x;
  // the sweep line and its straightening
  if (t >= S8.gA && t < T(k.lay)) {
    const pts = GATHER.line(t);
    thread(mid, pts, 1, 1.05);
    if (t < S8.flowA) { const h = pts[pts.length - 1]; glow(mid, h[0], h[1], 46, C.line, 0.7); glow(mid, h[0], h[1], 11, C.core, 1); }
    const sd = seg(t, S8.flowB - 0.3, S8.unfold + 0.2) * (1 - seg(t, S8.unfold + 0.3, S8.unfold + 1.3));
    if (sd > 0) { glow(top, S8.SEED[0], S8.SEED[1], 140, C.line, 0.6 * sd); glow(top, S8.SEED[0], S8.SEED[1], 24, C.core, sd); }
  }
  // lay flat: the tether bends down into the claim's baseline, then is wound back into the mascot
  const FLAT = (f) => { const x0 = L.SPINE_X, y0 = L.SPINE_TOP; if (f < 0.18) { const q = f / 0.18; return [lerp(x0, 430, E.io2(q)), lerp(y0, L.FLAT_Y, E.io2(q))]; } return [lerp(430, 1640, (f - 0.18) / 0.82), L.FLAT_Y]; };
  if (t >= T(k.lay) - 0.001 && t < T(k.con1) + 0.05) {
    const m = E.io3(seg(t, T(k.lay), T(k.lay) + 0.9 * B));
    const back = E.io3(seg(t, T(k.con0), T(k.con1)));
    const n = 120, pts = [];
    for (let j = 0; j <= n; j++) { const f = (j / n) * (1 - back); const a = GATHER.SL(f), b = FLAT(f); pts.push([lerp(a[0], b[0], m), lerp(a[1], b[1], m)]); }
    thread(mid, pts, 1, 1.05);
    // knots under the three words
    c.s.words.forEach((_, i) => { const x = [700, 1060, 1420][i], q = seg(t, T(k.words[i]), T(k.words[i]) + 0.2) * (1 - back); if (q > 0 && x < pts[pts.length - 1][0] + 1) { glow(mid, x, L.FLAT_Y, 30, C.glow, 0.8 * q); glow(mid, x, L.FLAT_Y, 7, C.core, q); } });
  }
  // the panel opens out of the point where the stars flowed in
  const pIn = E.outExpo(seg(t, S8.unfold, S8.unfold + 0.5)), pOut = E.in3(seg(t, T(k.recede), T(k.recede) + 0.45));
  if (pIn > 0 && pOut < 1) {
    D.panel.style.transformOrigin = `0 ${(S8.SEED[1] - L.PANEL.y).toFixed(0)}px`;
    put(D.panel, { o: Math.min(1, pIn * 2) * (1 - seg(pOut, 0.7, 1)), sx: lerp(0.05, 1, pIn) * (1 - pOut), sy: lerp(0.3, 1, pIn) * (1 - 0.7 * pOut) });
    const nk = seg(t, T(k.need), T(k.need) + 0.15) * (1 - seg(t, T(k.need) + 0.25, T(k.need) + 0.7));
    D.needPill.style.transform = `scale(${(1 + 0.14 * nk).toFixed(3)})`; D.needPill.style.display = 'inline-block';
    D.needPill.style.boxShadow = nk > 0.01 ? `0 0 ${(30 * nk).toFixed(0)}px rgba(${C.line},${(0.8 * nk).toFixed(2)})` : '';
  } else put(D.panel, { o: 0 });
  // the nudge hangs on the tether
  const np = GATHER.SL(0.44);
  const nIn = E.outExpo(seg(t, T(k.nudge), T(k.nudge) + 0.35));
  if (nIn > 0 && pOut < 1) { D.nudge.style.transformOrigin = '0 0'; put(D.nudge, { o: nIn * (1 - seg(pOut, 0.4, 1)), x: np[0] - 20, y: np[1] + 26, s: lerp(0.8, 1, nIn) * (1 - 0.8 * pOut), b: 6 * (1 - nIn) }); glow(mid, np[0], np[1], 20, C.glow, 0.8 * nIn * (1 - pOut)); }
  else put(D.nudge, { o: 0 });
  // the claim and the three words
  glyphsAt(D.claim, t, T(k.claim), T(k.con0) + 0.25);
  c.s.words.forEach((_, i) => {
    const e = D.words[i], x = [700, 1060, 1420][i], g = geo.words[i];
    const q = E.outExpo(seg(t, T(k.words[i]), T(k.words[i]) + 0.35)), out = E.in3(seg(t, T(k.con0) - 0.05, T(k.con0) + 0.2));
    put(e, { o: q * (1 - out), x: x - g.w / 2, y: L.FLAT_Y - g.h - 22 - 26 * (1 - q), b: 8 * (1 - q) + 10 * out });
  });
}

function renderCaptions(t) { D.caps.forEach((c) => glyphsAt(c.G, t, c.t0, c.t1)); }

function renderLock(t) {
  const lk = sc.lockup, k = lk.k, T = (x) => lk.start + x;
  const cl = sc.close;
  // until the lock-up, the mascot sits on the spine (drawn by renderOpen); here it moves for the lock-up
  if (t < lk.start) { put(D.lname, { o: 0 }); D.ltag.box.style.visibility = 'hidden'; return; }
  const g = geo.name, cx = W / 2, cy = 470;
  const open = E.io3(seg(t, T(k.open), T(k.open) + 0.6));
  const nameX = LOCK === 'mascot' ? cx - g.w / 2 - 50 : cx - g.w / 2;
  D.lname.style.clipPath = `inset(0 ${(50 * (1 - open)).toFixed(2)}% 0 ${(50 * (1 - open)).toFixed(2)}%)`;
  put(D.lname, { o: open > 0 ? 1 : 0, x: nameX, y: cy - g.h / 2 });
  glyphsAt(D.ltag, t, T(k.tag));
  if (LOCK === 'name') {
    // the mascot winds to the centre and becomes the point the name opens out of
    const mv = E.io3(seg(t, T(k.move), T(k.open)));
    const x = lerp(L.MASCOT[0], cx, mv), y = lerp(L.MASCOT[1], cy, mv);
    mascot(top, x, y, lerp(1, 0.6, mv) * (1 - E.in3(seg(t, T(k.open) - 0.15, T(k.open) + 0.1))), 1);
    const pt = seg(t, T(k.open) - 0.15, T(k.open)) * (1 - seg(t, T(k.open) + 0.3, T(k.open) + 0.9));
    if (pt > 0) { glow(top, cx, cy, 160, C.line, 0.6 * pt); glow(top, cx, cy, 18, C.core, pt); }
    // the thread opens with the name and settles as a rule beneath it
    const half = (g.w / 2 + 60) * open;
    if (open > 0) thread(mid, straight([cx - half, cy + g.h / 2 + 18], [cx + half, cy + g.h / 2 + 18], 20), lerp(1, 0.55, seg(t, T(k.open) + 0.6, T(k.open) + 1.4)), lerp(1.2, 0.5, open));
  } else {
    // the mascot hops from the top of the spine onto the end of the wordmark
    const hop = E.io2(seg(t, T(k.hop) - 0.4, T(k.hop) + 0.5));
    const tx = nameX + g.w + 70, ty = cy + g.h * 0.12;
    const x = lerp(L.MASCOT[0], tx, hop), y = lerp(L.MASCOT[1], ty, hop) - Math.sin(Math.PI * hop) * 260;
    const b = seg(t, T(k.hop) + 0.5, T(k.hop) + 0.75), sq = 0.2 * Math.sin(Math.PI * b) * (1 - b);
    mascot(top, x, y, lerp(1, 1.5, hop), 1, sq);
    const open2 = seg(t, T(k.open), T(k.open) + 0.6);
    if (open2 > 0) thread(mid, straight([nameX - 20, cy + g.h / 2 + 18], [lerp(nameX - 20, tx - 30, open2), cy + g.h / 2 + 18], 20), 0.6, 0.5);
  }
  // before the lock-up opens, the thread winds back from the claim into the mascot (renderClose); nothing else here
  void cl;
}

// ink.js — the engine of the morph bricks: one ink shape that never leaves the frame and is promoted one dimension per
// scene (point → line → pill → card → hexagon → cube → the docs page → one card → the console → the mark). Shapes
// with round or cut corners, closed outlines sampled at equal arc length (so two outlines correspond point for point),
// the cube and its net, the frame's fixed places, the product facts several scenes draw from, and type. Pure: every
// function is of its arguments; the scenes (point-line, pill-card, hex-solid, cube-page, panel-focus, run-flood,
// mark-command), the props (api-page, code-card) and the outline-morph motion import it.
// From the morph template (assets/templates/morph/film.js, choreo.js): geometry, the cube's projection and light, the
// spring widths and the 0.1 s / 12 px content hand-off are the template's.
import { text, measure, mix, rgba } from '../../../handoffs/util.js';
import { clamp, lerp, crit, cubicOut, cubicInOut, expOut, smooth, decelerate } from '../../../motion.js';
import { measurePath, pointAt } from '../../../handoffs/paths.js';
import { fontFor, readTime, wrap, graphemes } from '../../lang.js';
import LOOK from '../../look/slate-ink/look.js';

export const W = 1920, H = 1080;
// ── the frame's fixed places ──────────────────────────────────────────────────────────────────────────────────────
export const M = 120, CX = 960, LY = 560, TB = LY - 26, LINE_TH = 8, PAD = 56, PILL = [444, 132];
export const CARD = [460, 240, 1000, 600, 36];
export const HX = 1300, HY = 560, HR = 210;
export const CAP1 = 470, CAP2 = 580, CAP_MAX = 640;
export const FOCUS = [200, 120, 1520, 640, 28];
export const PANEL_R = 16;
export const PANELS = { T: [792, 96, 1008, 104], L: [792, 224, 340, 760], F: [1156, 224, 644, 300], Bo: [1156, 548, 644, 180], R: [1156, 752, 644, 120], K: [1156, 896, 644, 88] };
export const ORDER = ['T', 'L', 'F', 'Bo', 'R', 'K'];
export const SZ = { label: 28, body: 35, main: 44, sub: 55, line: 69, caption: 86, mark: 135 };

// ── time ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const secs = (beats, bpm) => (beats * 60) / bpm;
export const prog = (t, a, d) => clamp((t - a) / d);
// critically damped, snapped once sub-pixel (the template's spr)
export const spr = (x, w = 20) => { const c = crit(x, w); return c > 0.9995 ? 1 : c; };
export const blurIn = (k) => 12 * (1 - k);

// ── colour: the look's roles; the console's tones of the ink are derived when a palette lacks them ───────────────
export const colorsOf = (s) => {
  const C = { ...s.colors };
  C.paper = C.paper || C.panel || C.ground;
  C.onAccent = C.onAccent || C.ground;
  C.inkDim = C.inkDim || mix(C.ink, C.ground, 0.45);
  C.inkAccent = C.inkAccent || C.accent;
  C.inkCard = C.inkCard || mix(C.ink, C.ground, 0.06);
  C.inkEdge = C.inkEdge || mix(C.ink, C.ground, 0.24);
  C.inkTrack = C.inkTrack || mix(C.ink, C.ground, 0.12);
  C.line = C.line || mix(C.ink, C.ground, 0.75);
  return C;
};
// the light preset has a dark ink; the inverted one (night) a light ink: shading runs the other way
const lumOf = (h) => { const n = parseInt(String(h).slice(1, 7), 16); return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255); };
export const lightInk = (C) => lumOf(C.ink) > lumOf(C.ground);

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const look = LOOK;
// words: Inter Tight (+ Noto Sans SC); `tight` takes the look's display tracking (captions, claims), 'mark' the name's
export const sans = (lang, size, weight = 700, kind = null) => fontFor(LOOK, 'display', lang, size, weight, kind);
// code, paths and facts: the Latin mono in every language; `lang` given: a mono label that may hold Chinese
export const mono = (size, weight = 500, lang = 'en') => fontFor(LOOK, 'mono', lang, size, weight);
export const tw = (ctx, f, s) => measure(ctx, String(s ?? ''), f).width;
export const txt = (ctx, s, x, y, f, color, { align = 'left', alpha = 1 } = {}) => { if (s == null || s === '' || alpha <= 0) return; text(ctx, String(s), x, y, f, { color, align, alpha }); };
// text that rises into place through a mask line (k 0 → 1) and leaves the same way (out 0 → 1)
export const riseText = (ctx, s, x, y, f, color, k, { align = 'left', out = 0, dy = null } = {}) => {
  if (!s || k <= 0 || out >= 1) return;
  const d = dy ?? f.size * 1.1;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - f.size * 1.05, W, f.size * 1.4); ctx.clip();
  txt(ctx, s, x, y + (1 - k) * d + out * f.size * 0.4, f, color, { align, alpha: 1 - out });
  ctx.restore();
};
// a caption at 86 px bold, tight in English; the caption baselines are 470 and 580, 640 px wide at most
export const capFont = (lang) => sans(lang, SZ.caption, 700, 'display');
export const caption = (ctx, s, y, k, C, lang, out = 0, x = M, align = 'left') => riseText(ctx, s, x, y, capFont(lang), C.ink, k, { out, align });
export const labelText = (s, lang) => (lang === 'zh' ? String(s) : String(s).toLocaleUpperCase('en'));
export const labelFont = (lang, weight = 500) => ({ ...mono(SZ.label, weight, lang), spacing: lang === 'zh' ? 0 : 2 });

// ── shapes: round (circular arcs) or cut (45° chamfers of the same visual weight); the point is always round ──────
export const shapePath = (ctx, x, y, w, h, r, { begin = true, corners = 'round' } = {}) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (begin) ctx.beginPath();
  if (corners === 'cut') {
    const c = r * 0.82;
    ctx.moveTo(x + c, y); ctx.lineTo(x + w - c, y); ctx.lineTo(x + w, y + c); ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h); ctx.lineTo(x + c, y + h); ctx.lineTo(x, y + h - c); ctx.lineTo(x, y + c); ctx.closePath();
    return;
  }
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
};
export const fillShape = (ctx, R, color, corners = 'round') => { shapePath(ctx, R[0], R[1], R[2], R[3], R[4], { corners }); ctx.fillStyle = color; ctx.fill(); };
export const strokeShape = (ctx, R, color, lw, corners = 'round') => { shapePath(ctx, R[0], R[1], R[2], R[3], R[4], { corners }); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); };
export const clipShape = (ctx, R, corners = 'round') => { shapePath(ctx, R[0], R[1], R[2], R[3], R[4], { corners }); ctx.clip(); };
export const lerpR = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);

// ── outlines at equal arc length (Sederberg & Greenwood 1992): from the top centre, clockwise on screen ──────────
export const N = 480;
export const resample = (pts, n = N) => { const path = measurePath(pts); return Array.from({ length: n }, (_, i) => pointAt(path, (path.len * i) / n).slice(0, 2)); };
const seg = (out, a, b, k = 60) => { for (let i = 0; i < k; i++) out.push([a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k]); };
const arc = (out, cx, cy, r, a0, a1, k = 40) => { for (let i = 0; i < k; i++) { const a = a0 + (a1 - a0) * i / k; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
export const outlineOf = ([x, y, w, h, r], corners = 'round') => {
  const p = [];
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (corners === 'cut') {
    const c = r * 0.82;
    seg(p, [x + w / 2, y], [x + w - c, y]); seg(p, [x + w - c, y], [x + w, y + c], 20); seg(p, [x + w, y + c], [x + w, y + h - c]);
    seg(p, [x + w, y + h - c], [x + w - c, y + h], 20); seg(p, [x + w - c, y + h], [x + c, y + h], 120); seg(p, [x + c, y + h], [x, y + h - c], 20);
    seg(p, [x, y + h - c], [x, y + c]); seg(p, [x, y + c], [x + c, y], 20); seg(p, [x + c, y], [x + w / 2, y]); p.push([x + w / 2, y]);
    return resample(p);
  }
  seg(p, [x + w / 2, y], [x + w - r, y]); arc(p, x + w - r, y + r, r, -Math.PI / 2, 0);
  seg(p, [x + w, y + r], [x + w, y + h - r]); arc(p, x + w - r, y + h - r, r, 0, Math.PI / 2);
  seg(p, [x + w - r, y + h], [x + r, y + h], 120); arc(p, x + r, y + h - r, r, Math.PI / 2, Math.PI);
  seg(p, [x, y + h - r], [x, y + r]); arc(p, x + r, y + r, r, Math.PI, 1.5 * Math.PI);
  seg(p, [x + r, y], [x + w / 2, y]); p.push([x + w / 2, y]);
  return resample(p);
};
// a pointy-top hexagon about (cx, cy), circumradius r (= the cube's silhouette)
export const hexVerts = (cx = HX, cy = HY, r = HR) => [0, 1, 2, 3, 4, 5].map((k) => [cx + r * Math.sin((k * Math.PI) / 3), cy - r * Math.cos((k * Math.PI) / 3)]);
export const HV = hexVerts();
export const hexOutline = (cx = HX, cy = HY, r = HR) => { const V = hexVerts(cx, cy, r), p = []; for (let k = 0; k < 6; k++) seg(p, V[k], V[(k + 1) % 6], 80); p.push(V[0]); return resample(p); };
export const circleOutline = (cx, cy, r) => { const p = []; arc(p, cx, cy, r, -Math.PI / 2, 1.5 * Math.PI, 240); p.push([cx, cy - r]); return resample(p); };
// the path between two corresponding outlines at e (0 → 1)
export const morphPath = (ctx, A, B, e) => {
  ctx.beginPath();
  for (let i = 0; i < A.length; i++) { const x = lerp(A[i][0], B[i][0], e), y = lerp(A[i][1], B[i][1], e); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
};

// ── the cube and its net (net-unfold): faces of a cube of edge Sd about its front face F, unfolding with u 0 → 1 ──
export const Sd = HR * Math.sqrt(1.5), Hh = Sd / 2;
const YAW = -Math.PI / 4, PITCH = Math.atan(1 / Math.SQRT2);
const faces = (u) => {
  const th = (1 - u) * Math.PI / 2, c = Math.cos(th), s = Math.sin(th), c2 = Math.cos(2 * th), s2 = Math.sin(2 * th);
  const py = -Hh - Sd * c, pz = -Sd * s;
  return {
    F: [[-Hh, -Hh, 0], [Hh, -Hh, 0], [Hh, Hh, 0], [-Hh, Hh, 0]],
    T: [[-Hh, Hh, 0], [Hh, Hh, 0], [Hh, Hh + Sd * c, -Sd * s], [-Hh, Hh + Sd * c, -Sd * s]],
    Bo: [[-Hh, -Hh, 0], [Hh, -Hh, 0], [Hh, py, pz], [-Hh, py, pz]],
    R: [[Hh, -Hh, 0], [Hh, Hh, 0], [Hh + Sd * c, Hh, -Sd * s], [Hh + Sd * c, -Hh, -Sd * s]],
    L: [[-Hh, -Hh, 0], [-Hh, Hh, 0], [-Hh - Sd * c, Hh, -Sd * s], [-Hh - Sd * c, -Hh, -Sd * s]],
    K: [[-Hh, py, pz], [Hh, py, pz], [Hh, py - Sd * c2, pz - Sd * s2], [-Hh, py - Sd * c2, pz - Sd * s2]],
  };
};
const rot = ([x, y, z], yaw, pitch) => {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw), z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
  return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)];
};
const cross3 = (r) => {
  const ax = r[1][0] - r[0][0], ay = r[1][1] - r[0][1], az = r[1][2] - r[0][2];
  const bx = r[3][0] - r[0][0], by = r[3][1] - r[0][1], bz = r[3][2] - r[0][2];
  const n = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx], l = Math.hypot(...n) || 1;
  return n.map((v) => v / l);
};
const SIGN = Object.fromEntries(Object.entries(faces(1)).map(([k, p]) => [k, Math.sign(cross3(p)[2]) || 1]));
const LIGHT = (() => { const l = [1, 1, 0.5], n = Math.hypot(...l); return l.map((v) => v / n); })();
const LAM_TOP = 0.737;
const CC = rot([0, 0, -Hh], YAW, PITCH);
const O0 = [HX - CC[0], HY + CC[1]];
const O1 = [HX, 540 - Hh];
export const NET = { F: [HX - Hh, O1[1] - Hh], T: [HX - Hh, O1[1] - Hh - Sd], Bo: [HX - Hh, O1[1] + Hh], K: [HX - Hh, O1[1] + Hh + Sd], L: [HX - Hh - Sd, O1[1] - Hh], R: [HX + Hh, O1[1] - Hh] };
// the cube at unfold u (0 = isometric solid, 1 = flat net); toneK 0 = all ink (the hexagon), 1 = three tones;
// armK: the front face's outline in the accent; as it flattens the faces mix toward the panel paper
export const cube = (ctx, u, toneK, armK, C) => {
  const f = faces(u), yaw = YAW * (1 - u), pitch = PITCH * (1 - u), li = lightInk(C);
  const ox = lerp(O0[0], O1[0], u), oy = lerp(O0[1], O1[1], u);
  const list = Object.entries(f).map(([k, pts]) => {
    const r = pts.map((p) => rot(p, yaw, pitch));
    const n = cross3(r).map((v) => v * SIGN[k]);
    const lam = clamp((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / LAM_TOP);
    return { k, r, z: r.reduce((a, p) => a + p[2], 0) / 4, lam };
  }).sort((a, b) => a.z - b.z);
  const flat = smooth(u);
  ctx.lineJoin = 'round';
  for (const { k, r, lam } of list) {
    ctx.beginPath();
    r.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x, oy - y) : ctx.moveTo(ox + x, oy - y)));
    ctx.closePath();
    const shade = li ? mix(C.line, C.ink, lam) : mix(C.ink, C.line, lam); // the lit top face is the lightest
    ctx.fillStyle = mix(mix(C.ink, shade, toneK), C.paper, flat); ctx.fill();
    const a = k === 'F' ? armK : 0;
    ctx.strokeStyle = mix(C.ink, C.accent, a); ctx.lineWidth = lerp(4, 3, u) + 2 * a; ctx.stroke();
  }
};
export const hexagon = (ctx, C) => {
  ctx.beginPath(); HV.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.fillStyle = C.ink; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
};

// ── the product: the facts several scenes draw from (made up for the samples: "quillstack", an invoices API) ──────
export const PRODUCT = {
  name: 'quillstack', title: 'Invoices API', version: 'v2.3', file: 'invoices.yaml', base: '/v2',
  endpoints: [['GET', '/invoices'], ['POST', '/invoices'], ['GET', '/invoices/{id}'], ['PATCH', '/invoices/{id}'], ['DELETE', '/invoices/{id}']],
  select: 2,
  schemas: ['Invoice', 'LineItem', 'Customer', 'Money', 'Error'],
  sdks: ['python', 'node', 'go', 'curl'],
  call: { status: 200, reason: 'OK', ms: 84 },
  body: [['id', 'inv_8KQ2', 'string'], ['amount', 4200, 'integer'], ['currency', 'eur', 'string'], ['status', 'open', 'enum']],
  mark: { parts: [[0, 0, 4.6, 2], [5.4, 0, 4.6, 2], [1.4, 2.8, 3.2, 2], [5.4, 2.8, 3.2, 2], [3, 5.6, 1.6, 2], [5.4, 5.6, 1.6, 2]], dot: [5, 8.9, 0.75] },
};
export const productOf = (s) => ({ ...PRODUCT, ...(s.product || {}) });
export const facts = (p) => ({ endpoints: p.endpoints.length, schemas: p.schemas.length, sdks: p.sdks.length, title: p.title, version: p.version, file: p.file, name: p.name, status: p.call.status, reason: p.call.reason, ms: p.call.ms });
// {endpoints} {schemas} {sdks} … filled from the facts; any other {token} stays as written
export const fill = (s, F) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in F ? String(F[k]) : m));
export const bodyLines = (p) => p.body.map(([k, v], i) => `  "${k}": ${typeof v === 'number' ? v : `"${v}"`}${i < p.body.length - 1 ? ',' : ''}`);
export const jsonLines = (p) => ['{', ...bodyLines(p), '}'];
export const metaLine = (p) => `${p.call.reason} · ${p.call.ms} ms`;
export const statusLine = (p) => `${p.call.status} ${metaLine(p)}`;
export const endpointLine = (p) => { const e = p.endpoints[clamp(p.select ?? 0, 0, p.endpoints.length - 1)]; return e ? `${e[0]} ${p.base ?? ''}${e[1]}` : ''; };
export const METHOD = (m) => (m === 'DELETE' ? 'DEL' : m);
export const lastSeg = (p) => '/' + String(p).split('/').filter(Boolean).pop();

// ── the line (point-line, pill-card): its text split around the swapped token, measured once ────────────────────
export const lineLayout = (ctx, line, swap) => {
  const f = mono(SZ.line), sw = swap && swap.length === 2 ? swap : null;
  const k = sw ? line.indexOf(sw[0]) : -1;
  const pre = k >= 0 ? line.slice(0, k) : line, tok0 = k >= 0 ? sw[0] : '', post = k >= 0 ? line.slice(k + sw[0].length) : '', tok1 = k >= 0 ? sw[1] : '';
  const w0 = tw(ctx, f, pre + tok0 + post), w1 = tw(ctx, f, pre + tok1 + post);
  return { f, pre, tok0, tok1, post, swap: k >= 0, wPre: tw(ctx, f, pre), wTok0: tw(ctx, f, tok0), wTok1: tw(ctx, f, tok1), w0, w1, Lw0: w0 + 2 * PAD, Lw1: w1 + 2 * PAD + (k >= 0 ? 28 : 0), textW: w1 + (k >= 0 ? 28 : 0) };
};
// the line's text: pre + token + post; at `swap` (s) the old token drops out and the new one rises in on an accent
// chip (chipK 1 accent, 0 settled into the ink)
export const lineText = (ctx, Lx, t, swapAt, x0, C, { color, chipK = 1, rise = 0, onChip = null }) => {
  const f = Lx.f, y = TB + rise, tx = x0 + Lx.wPre;
  txt(ctx, Lx.pre, x0, y, f, color);
  if (!Lx.swap || swapAt == null) { txt(ctx, Lx.tok0 + Lx.post, tx, y, f, color); return; }
  const out = prog(t, swapAt, 0.16), kin = spr(t - swapAt - 0.14, 22);
  if (out < 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(tx - 6, y - SZ.line * 0.95, Lx.wTok0 + 12, SZ.line * 1.25); ctx.clip();
    txt(ctx, Lx.tok0, tx, y + out * 60, f, color, { alpha: 1 - out });
    ctx.restore();
  }
  txt(ctx, Lx.post, tx + lerp(Lx.wTok0, Lx.wTok1 + 28 * chipK, spr(t - swapAt, 24)), y, f, color);
  if (kin > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(tx - 4, y - SZ.line * 0.95, Lx.wTok1 + 36, SZ.line * 1.3); ctx.clip();
    const dy = (1 - kin) * 70;
    if (chipK > 0) { ctx.globalAlpha = chipK; fillShape(ctx, [tx + 2, y - 54 + dy, Lx.wTok1 + 24, 72, 12], C.accent); ctx.globalAlpha = 1; }
    txt(ctx, Lx.tok1, tx + 14 * chipK, y + dy, f, mix(color, onChip || C.onAccent, chipK));
    ctx.restore();
  }
};
// the line's rect at t (s) of point-line: the point shoots out into the line, the swap widens it
export const lineRect = (Lx, t, T) => {
  const e = expOut(prog(t, T.shoot + 0.02, 0.34));
  const kW = T.swap != null && Lx.swap ? spr(t - T.swap, 24) : 0;
  const Lw = lerp(Lx.Lw0, Lx.Lw1, kW);
  const w = lerp(44, Lw, e), h = lerp(44, LINE_TH, e);
  return { rect: [CX - w / 2, LY - h / 2, w, h, h / 2], col: cubicOut(prog(t, T.shoot + 0.36, 0.16)), kW, textW: lerp(Lx.w0, Lx.w1 + (Lx.swap ? 28 : 0), kW) };
};
// the pill around the line's text (and the action chip), and the card the pill grows into
export const pillRect = (ctx, Lx, action, lang) => {
  const chipW = action ? tw(ctx, sans(lang, SZ.main, 600), action) + 60 : 0;
  const Pw = Lx.textW + 2 * PAD + (chipW ? chipW + 28 : 0);
  return { chipW, R: [CX - Pw / 2, PILL[0], Pw, PILL[1], PILL[1] / 2] };
};

// ── the docs page's panels and the focus card's Run button ───────────────────────────────────────────────────────
export const panelRect = (k) => [...PANELS[k], PANEL_R];
export const RUNB = { w: 236, h: 92, x: FOCUS[0] + FOCUS[2] - 64 - 236, y: FOCUS[1] + FOCUS[3] - 64 - 92 };
export const runRect = (press = 1) => { const cx = RUNB.x + RUNB.w / 2, cy = RUNB.y + RUNB.h / 2, w = RUNB.w * press, h = RUNB.h * press; return [cx - w / 2, cy - h / 2, w, h, h / 2]; };
// the Run button: outlined until it takes the accent (arm); a spinner while the request is in flight
export const runButton = (ctx, R, label, lang, C, { arm = 0, spin = null, fill = null, stroke = null, color = null } = {}) => {
  const f = sans(lang, SZ.main, 600), cy = R[1] + R[3] / 2, cx = R[0] + R[2] / 2;
  if (fill || arm > 0) fillShape(ctx, R, fill || mix(C.paper, C.accent, arm));
  strokeShape(ctx, R, stroke || mix(C.ink, C.accent, arm), 3);
  const lc = color || mix(C.ink, C.onAccent, arm);
  if (spin != null) {
    ctx.save(); ctx.strokeStyle = lc; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(R[0] + 46, cy, 15, spin, spin + Math.PI * 1.4); ctx.stroke(); ctx.restore();
    txt(ctx, label, cx + 22, cy + 15, f, lc, { align: 'center' });
    return;
  }
  txt(ctx, label, cx - 14, cy + 15, f, lc, { align: 'center' });
  const ax = cx + tw(ctx, f, label) / 2 + 4;
  ctx.fillStyle = lc; ctx.beginPath(); ctx.moveTo(ax, cy - 11); ctx.lineTo(ax, cy + 11); ctx.lineTo(ax + 18, cy); ctx.closePath(); ctx.fill();
};
// content leaving a shape (0.1 s, 12 px blur), the template's container-transform rule: never two contents at once
export const leaving = (ctx, out, fn) => {
  if (out >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - out; if (out > 0.01) ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
  fn(); ctx.restore();
};
export const entering = (ctx, k, fn) => {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k; const b = blurIn(k); if (b > 0.05) ctx.filter = `blur(${b.toFixed(2)}px)`;
  fn(); ctx.restore();
};

export const groundOf = (ctx, s, C) => { if (s.ground === false) return; ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, H); };
export const loadFonts = async (lang) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fams = new Set(Object.values(LOOK.type.families).flatMap((r) => r[lang] || r.en));
  for (const f of fams) for (const w of [500, 600, 700]) { try { await document.fonts.load(`${w} 40px "${f}"`, lang === 'zh' ? '中文 Aa 0' : 'Aa 0'); } catch (e) { /* the stack falls through */ } }
};
export { clamp, lerp, crit, cubicOut, cubicInOut, expOut, smooth, decelerate, mix, rgba, text, measure, readTime, wrap, graphemes };

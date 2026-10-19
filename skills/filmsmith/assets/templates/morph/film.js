// film.js — morph renderer. render(t) paints the whole frame from t, content.js and palettes.js alone.
//
// One ink shape never leaves the frame and is promoted one dimension per scene: point → line (the baseline of the
// endpoint) → plane (the request pill, the response card, the schema) → solid (the spec, a cube) → interface (the cube
// unfolds into the generated docs page, which gathers into one card at main size) → the live console (the Run
// button floods the frame) → mark (the card splits into the product's mark, the point lands as its drop of ink).
// The accent marks only the part that is changing now; it is handed on like a baton. Every time comes from
// choreo.js (shared with score.mjs and timing.rules.js); every scene starts on the exact frame the previous one ended.
import FILM from './content.js';
import PALETTES, { report as contrastReport } from './palettes.js';
import RULES from './timing.rules.js';
import { fit } from './lib/timing.js';
import { timesOf, facts, fill, bodyLines, statusLine, metaLine, endpointLine, validate, secondMove, CPS } from './choreo.js';
import { clamp, lerp, crit, cubicOut, cubicInOut, expOut, smooth, decelerate, hexToRgb } from './lib/motion.js';
import { grainTile, drawGrain, subframes } from './lib/canvas.js';
import { errorBanner } from './lib/text.js';
import { drawHandoff } from './lib/handoffs/index.js';
import { measurePath, pointAt } from './lib/handoffs/paths.js';
import { leadingEdges } from './lib/handoffs/container-morph.js';

const W = 1920, H = 1080;
const TM = fit(FILM, RULES);
const B = TM.beat, BAR = TM.bar;
const P = PALETTES[FILM.palette] ?? PALETTES.slate;
const FX = facts(FILM);
const PR = FILM.product || {};
const CORNERS = FILM.corners === 'cut' ? 'cut' : 'round';
const S = TM.scenes.map((s, i) => ({ ...s, i, dur: s.end - s.start, T: timesOf(TM.scenes, i, B, FILM) }));
export const duration = TM.duration;

// ---------- colour ----------
const RGB = Object.fromEntries(Object.entries(P).filter(([, v]) => typeof v === 'string' && v[0] === '#').map(([k, v]) => [k, hexToRgb(v)]));
const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
const LIGHT_INK = RGB.fg.reduce((a, v) => a + v, 0) > RGB.bg.reduce((a, v) => a + v, 0); // an inverted preset (night)
const css = (c) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
const C = {
  bg: P.bg, fg: P.fg, dim: P.dim, line: P.line, paper: P.paper, accent: P.accent, onAccent: P.onAccent, inkDim: P.inkDim, inkAccent: P.inkAccent,
  // the console: the same card in the other material (tones of the one ink)
  inkCard: css(mix(RGB.fg, RGB.bg, 0.06)), inkEdge: css(mix(RGB.fg, RGB.bg, 0.24)), inkTrack: css(mix(RGB.fg, RGB.bg, 0.12)),
};

// ---------- type: one scale, ratio 1.25 from 28 (mode card "Type scale") ----------
const DISPLAY = 'Inter Tight', MONO = 'IBM Plex Mono';
const SZ = { label: 28, body: 35, main: 44, sub: 55, line: 69, caption: 86, mark: 135 };
const sans = (size, weight = 700, spacing = 0) => ({ family: DISPLAY, weight, size, spacing });
const mono = (size, weight = 500, spacing = 0) => ({ family: MONO, weight, size, spacing });
const fontOf = (f) => `${f.weight} ${f.size}px "${f.family}"`;
let CTX = null;
const wcache = new Map();
const tw = (f, s) => {
  const k = `${fontOf(f)}|${f.spacing}|${s}`;
  let w = wcache.get(k);
  if (w === undefined) { CTX.save(); CTX.font = fontOf(f); CTX.letterSpacing = `${f.spacing || 0}px`; w = CTX.measureText(s).width; CTX.restore(); wcache.set(k, w); }
  return w;
};
const txt = (ctx, s, x, y, f, color, { align = 'left', alpha = 1 } = {}) => {
  if (!s || alpha <= 0) return;
  ctx.save();
  ctx.font = fontOf(f); ctx.letterSpacing = `${f.spacing || 0}px`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
};
// text that rises into place through a mask line (k: 0 → 1), and leaves the same way (out: 0 → 1)
const riseText = (ctx, s, x, y, f, color, k, { align = 'left', out = 0, dy = null } = {}) => {
  if (k <= 0 || out >= 1) return;
  const d = dy ?? f.size * 1.1;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y - f.size * 1.05, W, f.size * 1.4); ctx.clip();
  txt(ctx, s, x, y + (1 - k) * d + out * f.size * 0.4, f, color, { align, alpha: 1 - out });
  ctx.restore();
};

// ---------- motion helpers ----------
const prog = (t, a, d) => clamp((t - a) / d);
const spr = (x, w = 20) => { const c = crit(x, w); return c > 0.9995 ? 1 : c; }; // critically damped, snapped once sub-pixel
const blurIn = (u) => 12 * (1 - u);

// ---------- shapes: the form variant lives here ----------
// corners 'round' (default): circular arcs; 'cut': the same corners chamfered at 45° (Material shape system, the
// "cut" corner family). The point stays round in both: it is a point, not a container.
const shapePath = (ctx, x, y, w, h, r, { begin = true } = {}) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (begin) ctx.beginPath();
  if (CORNERS === 'cut') {
    const c = r * 0.82; // a chamfer of the same visual weight as the arc it replaces
    ctx.moveTo(x + c, y); ctx.lineTo(x + w - c, y); ctx.lineTo(x + w, y + c); ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h); ctx.lineTo(x + c, y + h); ctx.lineTo(x, y + h - c); ctx.lineTo(x, y + c); ctx.closePath();
    return;
  }
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
};
const fillShape = (ctx, R, color) => { shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.fillStyle = color; ctx.fill(); };
const strokeShape = (ctx, R, color, lw) => { shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); };
const lerpR = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);

// a closed outline sampled at N equal arc-length steps (lib/handoffs/paths.js), from the top centre, clockwise on
// screen: two outlines sampled this way correspond point for point (Sederberg & Greenwood 1992)
const N = 480;
const resample = (pts) => { const path = measurePath(pts); return Array.from({ length: N }, (_, n) => pointAt(path, (path.len * n) / N).slice(0, 2)); };
const seg = (out, a, b, k = 60) => { for (let i = 0; i < k; i++) out.push([a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k]); };
const arc = (out, cx, cy, r, a0, a1, k = 40) => { for (let i = 0; i < k; i++) { const a = a0 + (a1 - a0) * i / k; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
const outlineOf = ([x, y, w, h, r]) => {
  const p = [];
  if (CORNERS === 'cut') {
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

// ---------- layout (the frame) ----------
const M = 120; // left margin of captions; everything that carries information stays inside 96 px of the edges
const CX = 960, LY = 560, TB = LY - 26; // the line's centre; the baseline of its text
const LINE_TH = 8, PAD = 56, PILL = [444, 132]; // pill top and height (it grows upward out of the line)
const CARD = [460, 240, 1000, 600, 36];
const HX = 1300, HY = 560, HR = 210; // the hexagon (= the cube's silhouette)
const CAP1 = 470, CAP2 = 580, CAP_MAX = 640; // caption baselines; their widest line
const FOCUS = [200, 120, 1520, 640, 28];
const PANEL_R = 16;
const PANELS = { T: [792, 96, 1008, 104], L: [792, 224, 340, 760], F: [1156, 224, 644, 300], Bo: [1156, 548, 644, 180], R: [1156, 752, 644, 120], K: [1156, 896, 644, 88] };
const ORDER = ['T', 'L', 'F', 'Bo', 'R', 'K'];

// the cube and its net (net-unfold): faces of a cube of edge Sd about its front face F, unfolding with u 0 → 1
const Sd = HR * Math.sqrt(1.5), Hh = Sd / 2;
const YAW = -Math.PI / 4, PITCH = Math.atan(1 / Math.SQRT2);
const HV = [0, 1, 2, 3, 4, 5].map((k) => [HX + HR * Math.sin((k * Math.PI) / 3), HY - HR * Math.cos((k * Math.PI) / 3)]);
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
const NET = { F: [HX - Hh, O1[1] - Hh], T: [HX - Hh, O1[1] - Hh - Sd], Bo: [HX - Hh, O1[1] + Hh], K: [HX - Hh, O1[1] + Hh + Sd], L: [HX - Hh - Sd, O1[1] - Hh], R: [HX + Hh, O1[1] - Hh] };
const HEX_OUT = (() => { const p = []; for (let k = 0; k < 6; k++) seg(p, HV[k], HV[(k + 1) % 6], 80); p.push(HV[0]); return resample(p); })();

// the cube at unfold u (0 = isometric solid, 1 = flat net), faces in three tones of the ink mixed toward the panel
// paper as they flatten; toneK 0 = all ink (the hexagon), 1 = shaded; armK: the front face's outline in the accent
const cube = (ctx, u, toneK, armK = 0) => {
  const f = faces(u), yaw = YAW * (1 - u), pitch = PITCH * (1 - u);
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
    const shade = LIGHT_INK ? mix(RGB.line, RGB.fg, lam) : mix(RGB.fg, RGB.line, lam); // the lit top face is the lightest
    ctx.fillStyle = css(mix(mix(RGB.fg, shade, toneK), RGB.paper, flat)); ctx.fill();
    const arm = k === 'F' ? armK : 0;
    ctx.strokeStyle = css(mix(RGB.fg, RGB.accent, arm)); ctx.lineWidth = lerp(4, 3, u) + 2 * arm; ctx.stroke();
  }
};

// ---------- product facts on screen ----------
const SEL = clamp(PR.select ?? 0, 0, Math.max(0, (PR.endpoints || []).length - 1));
const METHOD = (m) => (m === 'DELETE' ? 'DEL' : m);
const lastSeg = (p) => '/' + String(p).split('/').filter(Boolean).pop();
const BODY = bodyLines(FILM);
const JSON_LINES = ['{', ...BODY, '}'];

// ---------- per-scene layout (needs fonts: measured in ready()) ----------
const L = {}; // filled by layout()
const layout = () => {
  const fLine = mono(SZ.line);
  S.forEach((sc) => {
    if (sc.type === 'line') {
      const text = sc.text, sw = sc.swap;
      const k = sw ? text.indexOf(sw[0]) : -1;
      const pre = k >= 0 ? text.slice(0, k) : text, tok0 = k >= 0 ? sw[0] : '', post = k >= 0 ? text.slice(k + sw[0].length) : '';
      const tok1 = sw ? sw[1] : '';
      const w0 = tw(fLine, pre + tok0 + post), w1 = tw(fLine, pre + tok1 + post);
      sc.L = { pre, tok0, tok1, post, wPre: tw(fLine, pre), wTok0: tw(fLine, tok0), wTok1: tw(fLine, tok1), w0, w1, Lw0: w0 + 2 * PAD, Lw1: w1 + 2 * PAD + (sw ? 28 : 0) };
    }
  });
  // press: the pill around the line's text (and the action chip)
  S.forEach((sc, i) => {
    if (sc.type !== 'press') return;
    const ln = S[i - 1].L;
    const chipW = sc.action ? tw(sans(SZ.main, 600), sc.action) + 2 * 30 : 0;
    const textW = ln.w1 + (ln.tok1 ? 28 : 0);
    const Pw = textW + 2 * PAD + (chipW ? chipW + 28 : 0);
    sc.L = { ln, chipW, textW, pill: [CX - Pw / 2, PILL[0], Pw, PILL[1], PILL[1] / 2] };
  });
};

// ---------- validation and overflow (red banner on every frame) ----------
const problems = () => {
  const bad = validate(FILM).map((m) => `content.js: ${m}`);
  for (const r of contrastReport(P)) if (r.ratio < r.min) bad.push(`palette ${FILM.palette}: ${r.fg} on ${r.bg} is ${r.ratio.toFixed(2)}:1, below ${r.min}`);
  const wide = (what, w, max) => { if (w > max + 0.5) bad.push(`${what} is ${Math.round(w)} px wide; the slot holds ${max} px (shorten it)`); };
  S.forEach((sc) => {
    const at = `scenes[${sc.i}] (${sc.type})`;
    if (sc.type === 'line' && sc.L) wide(`${at} text`, Math.max(sc.L.Lw0, sc.L.Lw1), W - 2 * 96);
    if (sc.type === 'press' && sc.L) wide(`${at} pill`, sc.L.pill[2], W - 2 * 96);
    if (sc.type === 'solid') { wide(`${at} caption`, tw(sans(SZ.caption, 700, -2), sc.caption || ''), CAP_MAX); }
    if (sc.type === 'unfold') { wide(`${at} caption`, tw(sans(SZ.caption, 700, -2), sc.caption || ''), CAP_MAX); wide(`${at} ref`, tw(sans(SZ.main), sc.ref || ''), PANELS.F[2] - 64); }
    if (sc.type === 'focus') {
      (sc.tabs || []).forEach((tb) => (tb.code || []).forEach((c) => wide(`${at} code "${c}"`, tw(mono(SZ.sub), c), FOCUS[2] - 128)));
      wide(`${at} title + tabs`, tw(sans(SZ.sub), sc.title || '') + tabsWidth(sc) + 64, FOCUS[2] - 128);
    }
    if (sc.type === 'flood') wide(`${at} claim`, tw(sans(SZ.caption, 700, -2), sc.claim || ''), W - 2 * M);
    if (sc.type === 'mark') { const ml = markLayout(sc); wide(`${at} cmd`, tw(mono(SZ.main), sc.cmd || ''), W - 96 - ml.nameX); wide('product.name + mark', ml.total, W - 2 * M); }
  });
  BODY.forEach((l) => wide(`product.body line "${l.trim()}"`, tw(mono(SZ.main), l), CARD[2] - 128 - 200));
  (PR.endpoints || []).forEach(([m, p]) => wide(`endpoint path "${lastSeg(p)}" in the nav`, tw(mono(SZ.body), lastSeg(p)), PANELS.L[2] - 140));
  return bad;
};

// ---------- scene lookup ----------
const sceneAt = (t) => { for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].start - 1e-9) return S[i]; return S[0]; };
const prevOf = (sc) => S[sc.i - 1];
const nextOf = (sc) => S[sc.i + 1];

// ================================================================ scenes
// Every draw(ctx, sc, u) paints its scene at u seconds from its start; the ground is already painted.

// ---- point
const drawPoint = (ctx, sc, u) => {
  const k = cubicOut(prog(u, sc.T.land - 0.25, 0.25));
  const sq = u > sc.T.land ? 0.1 * Math.exp(-14 * (u - sc.T.land)) * Math.sin(40 * (u - sc.T.land)) : 0;
  const r = 22 * (0.45 + 0.55 * k);
  ctx.save(); ctx.translate(CX, LY); ctx.scale(1 + sq, 1 - sq);
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---- line: the rect of the line and its text at u (shared with press, which starts from the line's last frame)
const lineState = (sc, u) => {
  const T = sc.T, Lx = sc.L;
  const e = expOut(prog(u, 0.02, 0.34));
  const kW = T.swap != null ? spr(u - T.swap, 24) : 0;
  const Lw = lerp(Lx.Lw0, Lx.Lw1, kW);
  const w = lerp(44, Lw, e), h = lerp(44, LINE_TH, e);
  const col = mix(RGB.accent, RGB.fg, cubicOut(prog(u, 0.36, 0.16)));
  return { rect: [CX - w / 2, LY - h / 2, w, h, h / 2], col, kW, textW: lerp(Lx.w0, Lx.w1 + (Lx.tok1 ? 28 : 0), kW) };
};
// the line's text: pre + token + post, the token swapped in the accent; `inside` draws it knocked out of the ink
const drawLineText = (ctx, Lx, T, u, x0, { color, chipK = 1, rise = 0 }) => {
  const f = mono(SZ.line), y = TB + rise;
  txt(ctx, Lx.pre, x0, y, f, color);
  const tx = x0 + Lx.wPre;
  if (T.swap == null) { txt(ctx, Lx.tok0 + Lx.post, tx, y, f, color); return; }
  const out = prog(u, T.swap, 0.16), kin = spr(u - T.swap - 0.14, 22);
  if (out < 1) { // the old token drops out
    ctx.save(); ctx.beginPath(); ctx.rect(tx - 6, y - SZ.line * 0.95, Lx.wTok0 + 12, SZ.line * 1.25); ctx.clip();
    txt(ctx, Lx.tok0, tx, y + out * 60, f, color, { alpha: 1 - out });
    ctx.restore();
  }
  const post0 = tx + lerp(Lx.wTok0, Lx.wTok1 + 28 * chipK, spr(u - T.swap, 24));
  txt(ctx, Lx.post, post0, y, f, color);
  if (kin > 0) { // the new one rises in on an accent chip (chipK: 1 accent, 0 settled into the ink)
    ctx.save(); ctx.beginPath(); ctx.rect(tx - 4, y - SZ.line * 0.95, Lx.wTok1 + 36, SZ.line * 1.3); ctx.clip();
    const dy = (1 - kin) * 70;
    if (chipK > 0) { ctx.globalAlpha = chipK; fillShape(ctx, [tx + 2, y - 54 + dy, Lx.wTok1 + 24, 72, 12], C.accent); ctx.globalAlpha = 1; }
    txt(ctx, Lx.tok1, tx + 14 * chipK, y + dy, f, css(mix(hexToRgb(color), RGB.onAccent, chipK)));
    ctx.restore();
  }
};
const drawLine = (ctx, sc, u) => {
  const st = lineState(sc, u), T = sc.T;
  fillShape(ctx, st.rect, css(st.col));
  if (u >= T.rise) {
    const k = spr(u - T.rise, 22);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, LY - LINE_TH / 2 - 2); ctx.clip();
    drawLineText(ctx, sc.L, T, u, CX - st.textW / 2, { color: C.fg, rise: (1 - k) * 96 });
    ctx.restore();
  }
};

// ---- press: the line thickens upward into the pill around its text; the action chip; the press
const pressState = (sc, u) => {
  const Lx = sc.L, ln = prevOf(sc), T = sc.T;
  const from = lineState(ln, ln.dur).rect, to = Lx.pill;
  const kH = spr(u, 14), kW = spr(u - 0.06, 22); // soft enough that the first frames of the growth stay an ordinary frame step
  const x = lerp(from[0], to[0], kW), w = lerp(from[2], to[2], kW);
  const bot = lerp(from[1] + from[3], to[1] + to[3], kH), top = lerp(from[1], to[1], kH);
  const press = T.press != null ? 1 - 0.04 * (crit(u - T.press, 34) - crit(u - T.press - 0.08, 34)) : 1;
  const cx = x + w / 2, cy = (top + bot) / 2;
  const R = [cx - (w * press) / 2, cy - ((bot - top) * press) / 2, w * press, (bot - top) * press, ((bot - top) * press) / 2];
  return { R, kW };
};
const drawPressContents = (ctx, sc, u, R, alpha = 1, blur = 0) => {
  const Lx = sc.L, ln = prevOf(sc), T = sc.T;
  const textX = lerp(CX - Lx.textW / 2, R[0] + PAD, spr(u - 0.06, 26));
  const chipK = 1 - cubicOut(prog(u, T.release, 0.2));
  ctx.save();
  ctx.globalAlpha = alpha; if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  // above the pill the text is ink on the ground; inside it, knocked out of the ink
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); shapePath(ctx, R[0], R[1], R[2], R[3], R[4], { begin: false }); ctx.clip('evenodd');
  ctx.beginPath(); ctx.rect(0, 0, W, LY - LINE_TH / 2 - 2); ctx.clip();
  drawLineText(ctx, ln.L, ln.T, ln.dur, textX, { color: C.fg, chipK });
  ctx.restore();
  ctx.save(); shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.clip();
  drawLineText(ctx, ln.L, ln.T, ln.dur, textX, { color: C.bg, chipK });
  if (sc.action && u >= T.chip) {
    const k = spr(u - T.chip, 24);
    const cw = Lx.chipW, ch = 76, cxr = R[0] + R[2] - 28 - cw, cy = R[1] + R[3] / 2;
    fillShape(ctx, [cxr, cy - ch / 2 + (1 - k) * 90, cw, ch, ch / 2], C.accent);
    txt(ctx, sc.action, cxr + cw / 2, cy + 15 + (1 - k) * 90, sans(SZ.main, 600), C.onAccent, { align: 'center' });
  }
  ctx.restore();
  ctx.restore();
};
const drawPress = (ctx, sc, u) => {
  const { R } = pressState(sc, u);
  fillShape(ctx, R, C.fg);
  drawPressContents(ctx, sc, u, R);
};

// ---- card: response, then schema
const cardHeader = (ctx, R, u, sc, alpha, blur) => {
  const T = sc.T, x = R[0] + 64, y = R[1] + 104;
  ctx.save(); ctx.globalAlpha = alpha; if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  const st = String(PR.call?.status ?? ''), f = mono(SZ.main, 600);
  const cw = tw(f, st) + 36;
  const k = cubicOut(prog(u, T.settle, 0.2));
  fillShape(ctx, [x, y - 48, cw, 66, 12], css(mix(RGB.accent, RGB.fg, k)));
  if (k > 0) strokeShape(ctx, [x, y - 48, cw, 66, 12], css(mix(RGB.accent, RGB.inkDim, k)), 2);
  txt(ctx, st, x + 18, y, f, css(mix(RGB.onAccent, RGB.bg, k)));
  txt(ctx, metaLine(FILM), x + cw + 24, y, mono(SZ.main), C.bg);
  ctx.restore();
};
const cardBody = (ctx, R, u, sc, alpha, blur, { half = Infinity, splitAt = null } = {}) => {
  ctx.save(); ctx.globalAlpha = alpha; if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  JSON_LINES.forEach((s, i) => {
    let a = 1, dy = 0;
    if (splitAt) { const t0 = i <= half ? splitAt[0] : splitAt[1]; const k = cubicOut(prog(u, t0, 0.2)); a = k; dy = 12 * (1 - k); if (k <= 0) return; }
    txt(ctx, s, R[0] + 64, R[1] + 196 + i * 60 + dy, mono(SZ.main), C.bg, { alpha: a });
  });
  ctx.restore();
};
const schemaHeader = (ctx, R, sc, alpha, blur) => {
  ctx.save(); ctx.globalAlpha = alpha; if (blur > 0.05) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  const x = R[0] + 64, y = R[1] + 106;
  txt(ctx, sc.name, x, y, sans(SZ.sub), C.bg);
  txt(ctx, 'schema', x + tw(sans(SZ.sub), sc.name) + 22, y, mono(SZ.body), C.inkDim);
  ctx.restore();
};
const schemaChips = (ctx, R, u, sc, alpha = 1) => {
  const T = sc.T, f = mono(SZ.body);
  const settle = cubicOut(prog(u, T.settle, 0.2));
  ctx.save(); ctx.globalAlpha = alpha;
  (PR.body || []).forEach((fd, i) => {
    const k = spr(u - T.chips - i * 0.04, 24);
    if (k <= 0) return;
    const ry = R[1] + 196 + (i + 1) * 60, cw = tw(f, fd[2]) + 32, cx = R[0] + R[2] - 64 - cw;
    ctx.save(); ctx.beginPath(); ctx.rect(R[0], ry - 46, R[2], 60); ctx.clip();
    const dy = (1 - k) * 50;
    fillShape(ctx, [cx, ry - 38 + dy, cw, 50, 25], css(mix(RGB.accent, RGB.fg, settle)));
    if (settle > 0) strokeShape(ctx, [cx, ry - 38 + dy, cw, 50, 25], css(mix(RGB.accent, RGB.inkDim, settle)), 2);
    txt(ctx, fd[2], cx + cw / 2, ry - 2 + dy, f, css(mix(RGB.onAccent, RGB.bg, settle)), { align: 'center' });
    ctx.restore();
  });
  ctx.restore();
};
// the card's last frame, for the scenes that start from it
const cardFinal = (ctx, sc) => {
  const R = CARD;
  fillShape(ctx, R, C.fg);
  if (sc.T.fromCard) { schemaHeader(ctx, R, sc, 1, 0); cardBody(ctx, R, sc.dur, sc, 1, 0); schemaChips(ctx, R, sc.dur, sc); }
  else { cardHeader(ctx, R, sc.dur, sc, 1, 0); cardBody(ctx, R, sc.dur, sc, 1, 0); }
};
const drawCard = (ctx, sc, u) => {
  const T = sc.T;
  if (!T.fromCard) {
    const pr = prevOf(sc);
    const from = pressState(pr, pr.dur).R;
    const k = spr(u - 0.1, 18);
    const R = lerpR(from, CARD, k);
    fillShape(ctx, R, C.fg);
    const out = prog(u, 0, 0.1);
    if (out < 1) { ctx.save(); shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.clip(); drawPressContents(ctx, pr, pr.dur, from, 1 - out, 12 * out); ctx.restore(); }
    if (u >= T.head) {
      const kin = cubicOut(prog(u, T.head, 0.15));
      ctx.save(); shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.clip();
      cardHeader(ctx, R, u, sc, kin, blurIn(kin));
      cardBody(ctx, R, u, sc, 1, 0, { half: T.half, splitAt: [T.bodyA, T.bodyB] });
      ctx.restore();
    }
    return;
  }
  const pr = prevOf(sc), R = CARD;
  fillShape(ctx, R, C.fg);
  const out = prog(u, 0, 0.1), kin = cubicOut(prog(u, 0.14, 0.15));
  if (out < 1) cardHeader(ctx, R, pr.dur, pr, 1 - out, 12 * out);
  if (kin > 0) schemaHeader(ctx, R, sc, kin, blurIn(kin));
  cardBody(ctx, R, u, sc, 1, 0);
  schemaChips(ctx, R, u, sc);
};

// ---- solid: outline → hexagon → cube; caption; face labels
const captionAt = (ctx, s, y, k, out = 0) => riseText(ctx, s, M, y, sans(SZ.caption, 700, -2), C.fg, k, { out });
const FACE_LABELS = [
  { anchor: HV[0], to: [HV[0][0], HV[0][1] - 44], at: [HV[0][0], HV[0][1] - 62], align: 'center' },
  { anchor: HV[4], to: [HV[4][0], HV[4][1] + 64], at: [HV[4][0], HV[4][1] + 116], align: 'center' },
  { anchor: HV[2], to: [HV[2][0], HV[2][1] + 64], at: [HV[2][0], HV[2][1] + 116], align: 'center' },
];
const faceLabels = (ctx, sc, u, out = 0) => {
  (sc.faces || []).forEach((s, k) => {
    const t0 = sc.T.faces[k];
    if (u < t0 || out >= 1) return;
    const kl = cubicOut(prog(u, t0, 0.2)), kt = spr(u - t0 - 0.04, 22);
    const L0 = FACE_LABELS[k], a = 1 - out;
    const dir = Math.sign(L0.to[1] - L0.anchor[1]);
    const ax = L0.anchor[0], ay = L0.anchor[1] + dir * 12;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.fg; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, lerp(ay, L0.to[1], kl)); ctx.stroke(); ctx.restore();
    riseText(ctx, fill(s, FX), L0.at[0], L0.at[1], mono(SZ.body), C.fg, kt, { align: L0.align, out, dy: 50 });
  });
};
const solidState = (ctx, sc, u, { labels = true, captions = true } = {}) => {
  const T = sc.T;
  const toneK = cubicOut(prog(u, T.tones, 0.2));
  const armK = cubicOut(prog(u, T.arm, 0.2));
  if (toneK <= 0) {
    ctx.beginPath(); HV.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = C.fg; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = C.fg; ctx.stroke();
  } else cube(ctx, 0, toneK, armK);
  if (toneK < 1 && u >= T.lines) { // stroke-reinterpret (lib/handoffs): three lines from the centre, in the accent while
    // they draw, re-read the hexagon as a cube; as the faces take their tones the lines become the cube's edges
    drawHandoff(ctx, 'stroke-reinterpret', prog(u, T.lines, B), {
      ground: false, center: [HX, HY], r: HR, lineWidth: 4, hidden: false,
      colors: { ground: C.bg, ink: C.fg, accent: css(mix(RGB.accent, RGB.fg, toneK)) },
    });
  }
  if (captions) captionAt(ctx, sc.caption, CAP1, spr(u - T.caption, 22));
  if (labels) faceLabels(ctx, sc, u);
};
const drawSolid = (ctx, sc, u) => {
  const T = sc.T;
  if (T.morph != null && u < T.morph + 0.48) {
    const pr = prevOf(sc);
    const out = prog(u, 0, 0.1);
    const e = cubicInOut(prog(u, 0.1, 0.38));
    const A = sc.outFrom || (sc.outFrom = outlineOf(CARD));
    ctx.beginPath();
    for (let i = 0; i < N; i++) { const x = lerp(A[i][0], HEX_OUT[i][0], e), y = lerp(A[i][1], HEX_OUT[i][1], e); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fillStyle = C.fg; ctx.fill();
    if (e > 0) { ctx.lineJoin = 'round'; ctx.lineWidth = 4 * e; ctx.strokeStyle = C.fg; ctx.stroke(); }
    if (out < 1) { // the card's content leaves before the outline moves
      ctx.save(); shapePath(ctx, CARD[0], CARD[1], CARD[2], CARD[3], CARD[4]); ctx.clip();
      ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
      if (pr.T.fromCard) { schemaHeader(ctx, CARD, pr, 1, 0); cardBody(ctx, CARD, pr.dur, pr, 1, 0); schemaChips(ctx, CARD, pr.dur, pr); }
      else { cardHeader(ctx, CARD, pr.dur, pr, 1, 0); cardBody(ctx, CARD, pr.dur, pr, 1, 0); }
      ctx.restore();
    }
    captionAt(ctx, sc.caption, CAP1, spr(u - T.caption, 22));
    return;
  }
  solidState(ctx, sc, u);
};

// ---- unfold: cube → net → panels → the docs page
const panelRects = (sc, u) => {
  const T = sc.T, out = {};
  ORDER.forEach((k, i) => {
    const e = decelerate(prog(u, T.slide + i * 0.025, 0.45));
    const [nx, ny] = NET[k], [px, py, pw, ph] = PANELS[k];
    out[k] = [lerp(nx, px, e), lerp(ny, py, e), lerp(Sd, pw, e), lerp(Sd, ph, e), lerp(0, PANEL_R, e)];
  });
  return out;
};
// the contents of the six panels; `a` alpha and `dy` offset per panel come from the caller
const panelContent = (ctx, k, R, sc, u) => {
  const T = sc.T;
  const [x, y, w] = R;
  if (k === 'T') {
    txt(ctx, fill(PR.title, FX), x + 28, y + 66, sans(SZ.main), C.fg);
    txt(ctx, fill(PR.version, FX), x + 28 + tw(sans(SZ.main), fill(PR.title, FX)) + 18, y + 64, mono(SZ.body), C.dim);
    txt(ctx, fill(PR.file, FX), x + w - 28, y + 63, mono(SZ.label), C.dim, { align: 'right' });
  } else if (k === 'L') {
    txt(ctx, 'ENDPOINTS', x + 24, y + 50, mono(SZ.label, 500, 2), C.dim);
    const jump = spr(u - T.jump, 26), settle = cubicOut(prog(u, T.settle, 0.2));
    const rowY = (i) => y + 76 + i * 92;
    const hy = lerp(rowY(0), rowY(SEL), jump);
    const on = u >= T.fillAt ? 1 : 0;
    if (on) fillShape(ctx, [x + 12, hy, w - 24, 72, 12], css(mix(RGB.accent, RGB.fg, settle)));
    (PR.endpoints || []).forEach(([m, p], i) => {
      const hit = clamp(1 - Math.abs(hy - rowY(i)) / 92);
      const onCol = mix(RGB.onAccent, RGB.bg, settle);
      txt(ctx, METHOD(m), x + 28, rowY(i) + 46, mono(SZ.label, 600), css(mix(RGB.dim, onCol, hit)));
      txt(ctx, lastSeg(p), x + 122, rowY(i) + 48, mono(SZ.body), css(mix(RGB.fg, onCol, hit)));
    });
  } else if (k === 'F') {
    txt(ctx, sc.ref ?? '', x + 32, y + 72, sans(SZ.main), C.fg);
    txt(ctx, endpointLine(FILM), x + 32, y + 140, mono(SZ.body), C.fg);
    ctx.fillStyle = C.line; ctx.fillRect(x + 32, y + 172, w - 64, 2);
    const b0 = PR.body?.[0] ?? ['id', '', 'string'];
    txt(ctx, b0[0], x + 32, y + 236, mono(SZ.body, 600), C.fg);
    txt(ctx, `${b0[2]} · required`, x + 32 + tw(mono(SZ.body, 600), b0[0]) + 24, y + 236, mono(SZ.label), C.dim);
  } else if (k === 'Bo') {
    const [lang, line] = sc.code || ['', ''];
    txt(ctx, lang, x + 28, y + 48, mono(SZ.label), C.dim);
    txt(ctx, line, x + 28, y + 118, mono(SZ.body), C.fg);
  } else if (k === 'R') {
    const st = String(PR.call?.status ?? '');
    txt(ctx, st, x + 28, y + 76, mono(SZ.main, 600), C.fg);
    txt(ctx, metaLine(FILM), x + 28 + tw(mono(SZ.main, 600), st) + 20, y + 75, mono(SZ.body), C.dim);
  } else if (k === 'K') {
    txt(ctx, 'SDKs', x + 28, y + 55, mono(SZ.label, 600), C.dim);
    let cx = x + 128;
    (PR.sdks || []).forEach((s) => {
      const cw = tw(mono(SZ.label), s) + 36;
      strokeShape(ctx, [cx, y + 18, cw, 52, 26], C.fg, 2);
      txt(ctx, s, cx + cw / 2, y + 54, mono(SZ.label), C.fg, { align: 'center' });
      cx += cw + 14;
    });
  }
};
const drawPanels = (ctx, sc, u, rects, { contents = true, contentOut = 0, armK = 0 } = {}) => {
  for (const k of ORDER) {
    const R = rects[k];
    fillShape(ctx, R, C.paper);
    strokeShape(ctx, R, css(mix(RGB.fg, RGB.accent, k === 'F' ? armK : 0)), 3 + (k === 'F' ? 2 * armK : 0));
  }
  if (!contents || contentOut >= 1) return;
  const T = sc.T;
  ORDER.forEach((k, i) => {
    const kin = cubicOut(prog(u, T.fillAt + i * 0.04, 0.24));
    if (kin <= 0) return;
    const R = rects[k];
    ctx.save(); shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.clip();
    ctx.globalAlpha = kin * (1 - contentOut);
    if (contentOut > 0) ctx.filter = `blur(${(12 * contentOut).toFixed(2)}px)`;
    ctx.translate(0, 14 * (1 - kin));
    panelContent(ctx, k, R, sc, u);
    ctx.restore();
  });
};
const drawUnfold = (ctx, sc, u) => {
  const T = sc.T, pr = prevOf(sc);
  const out = prog(u, 0, 0.12);
  // the cube and its labels: the labels leave at once; the caption stays
  captionAt(ctx, pr.caption, CAP1, 1);
  if (out < 1) faceLabels(ctx, pr, pr.dur, out);
  const armK = 1 - cubicOut(prog(u, T.fillAt, 0.2)); // the front face's accent lasts until the page fills
  if (u < T.slide) { cube(ctx, cubicInOut(prog(u, 0, T.slide)), 1, armK); }
  else drawPanels(ctx, sc, u, panelRects(sc, u), { armK });
  captionAt(ctx, sc.caption, CAP2, spr(u - T.caption, 22));
};

// ---- focus: the six panels gather into one card; title; tabs and code at main size; the Run button
const TAB = { h: 72, pad: 32, gap: 0 };
const tabsWidth = (sc) => (sc.tabs || []).reduce((a, tb) => a + tw(mono(SZ.body), tb.lang) + 2 * TAB.pad, 0);
const tabRects = (sc) => {
  let x = FOCUS[0] + FOCUS[2] - 64 - tabsWidth(sc);
  return (sc.tabs || []).map((tb) => { const w = tw(mono(SZ.body), tb.lang) + 2 * TAB.pad; const r = [x, FOCUS[1] + 36, w, TAB.h]; x += w; return r; });
};
const RUN = () => { const f = sans(SZ.main, 600); return { f, w: 236, h: 92, x: FOCUS[0] + FOCUS[2] - 64 - 236, y: FOCUS[1] + FOCUS[3] - 64 - 92 }; };
// the card's contents at u of the focus scene; material 'light' (paper) or 'ink' (the console)
const focusContents = (ctx, sc, u, { material = 'light', alpha = 1, runState = null } = {}) => {
  const T = sc.T, ink = material === 'ink';
  const fg = ink ? C.bg : C.fg, dim = ink ? C.inkDim : C.dim;
  ctx.save(); ctx.globalAlpha = alpha;
  // title
  riseText(ctx, sc.title, FOCUS[0] + 64, FOCUS[1] + 100, sans(SZ.sub), fg, spr(u - T.enter, 22));
  const kc = cubicOut(prog(u, T.code, 0.18));
  if (kc > 0) {
    // tabs: a pale track, the highlight pill (leading edge first, trailing 50 ms later)
    const tr = tabRects(sc);
    ctx.save(); ctx.globalAlpha *= kc;
    const track = [tr[0][0], tr[0][1], tr[tr.length - 1][0] + tr[tr.length - 1][2] - tr[0][0], TAB.h, TAB.h / 2];
    fillShape(ctx, track, ink ? C.inkTrack : css(mix(RGB.paper, RGB.line, 0.55)));
    // the highlight moves with its leading edge first, the trailing one after (lib/handoffs/container-morph.js)
    const edges = (k) => [tr[k][0] + 5, tr[k][0] + tr[k][2] - 5];
    let [Lx, Rx] = edges(0);
    T.tabs.forEach((t, k) => { if (k > 0 && u >= t) [Lx, Rx] = leadingEdges(edges(k - 1), edges(k), prog(u, t, 0.36), 0.14, 8); });
    const arm = cubicOut(prog(u, T.arm, 0.2));
    const hiCol = ink ? css(mix(RGB.bg, RGB.bg, 0)) : css(mix(RGB.accent, RGB.fg, arm));
    if (ink) strokeShape(ctx, [Lx, tr[0][1] + 5, Rx - Lx, TAB.h - 10, (TAB.h - 10) / 2], C.inkDim, 2);
    else fillShape(ctx, [Lx, tr[0][1] + 5, Rx - Lx, TAB.h - 10, (TAB.h - 10) / 2], hiCol);
    (sc.tabs || []).forEach((tb, k) => {
      const c = tr[k], mid = c[0] + c[2] / 2;
      const hit = clamp(1 - Math.abs((Lx + Rx) / 2 - mid) / (c[2] * 0.6));
      const onC = ink ? RGB.bg : mix(RGB.onAccent, RGB.bg, arm);
      txt(ctx, tb.lang, mid, c[1] + TAB.h / 2 + 12, mono(SZ.body), css(mix(hexToRgb(ink ? C.inkDim : C.dim), onC, hit)), { align: 'center' });
    });
    ctx.restore();
    ctx.fillStyle = ink ? C.inkEdge : C.line; ctx.fillRect(FOCUS[0] + 64, FOCUS[1] + 148, FOCUS[2] - 128, 2);
    // code: the current tab's lines; on a tab change the old ones leave (0.08 s), the new ones enter (0.14–0.28 s)
    let k = 0; T.tabs.forEach((t, i) => { if (u >= t) k = i; });
    const tk = T.tabs[k];
    let va = 1, vb = 0, shown = k;
    if (k > 0 && u < tk + 0.08) { shown = k - 1; va = 1 - (u - tk) / 0.08; vb = 10 * (1 - va); }
    else if (k > 0 && u < tk + 0.14) va = 0;
    else if (k > 0 && u < tk + 0.28) { const e = cubicOut((u - tk - 0.14) / 0.14); va = e; vb = 10 * (1 - e); }
    if (k === 0) { va = kc; vb = blurIn(kc); }
    if (va > 0) {
      ctx.save(); ctx.globalAlpha *= va; if (vb > 0.05) ctx.filter = `blur(${vb.toFixed(2)}px)`;
      (sc.tabs[shown].code || []).forEach((line, j) => txt(ctx, line, FOCUS[0] + 64, FOCUS[1] + 270 + j * 76, mono(SZ.sub), fg));
      ctx.restore();
    }
    if (!ink) txt(ctx, endpointLine(FILM), FOCUS[0] + 64, FOCUS[1] + FOCUS[3] - 64 - 30, mono(SZ.body), dim); // the console shows the response there
    // the Run button: outlined until it takes the accent (arm)
    if (!ink) {
      const rb = RUN(), rs = runState ?? { press: 1, spin: null };
      ctx.save(); ctx.globalAlpha *= kc;
      const cx = rb.x + rb.w / 2, cy = rb.y + rb.h / 2, w = rb.w * rs.press, h = rb.h * rs.press;
      const R = [cx - w / 2, cy - h / 2, w, h, h / 2];
      if (arm > 0) fillShape(ctx, R, css(mix(RGB.paper, RGB.accent, arm)));
      strokeShape(ctx, R, css(mix(RGB.fg, RGB.accent, arm)), 3);
      const label = sc.run || 'Run';
      const lc = css(mix(RGB.fg, RGB.onAccent, arm));
      if (rs.spin != null) {
        ctx.save(); ctx.strokeStyle = lc; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(R[0] + 46, cy, 15, rs.spin, rs.spin + Math.PI * 1.4); ctx.stroke(); ctx.restore();
        txt(ctx, label, cx + 22, cy + 15, rb.f, lc, { align: 'center' });
      } else {
        txt(ctx, label, cx - 14, cy + 15, rb.f, lc, { align: 'center' });
        const ax = cx + tw(rb.f, label) / 2 + 4; // the play triangle
        ctx.fillStyle = lc; ctx.beginPath(); ctx.moveTo(ax, cy - 11); ctx.lineTo(ax, cy + 11); ctx.lineTo(ax + 18, cy); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.restore();
};
const drawFocus = (ctx, sc, u) => {
  const T = sc.T, pr = prevOf(sc);
  const out = prog(u, 0, 0.1), capOut = prog(u, 0, 0.12);
  captionAt(ctx, S[pr.i - 1]?.caption, CAP1, 1, capOut); // the solid's caption, still up since then
  captionAt(ctx, pr.caption, CAP2, 1, capOut);
  // the six panels gather into the focus card (a container transform: content out first, then the shape moves)
  const rects = {};
  ORDER.forEach((k, i) => { rects[k] = lerpR([...PANELS[k], PANEL_R], FOCUS, spr(u - 0.1 - i * 0.02, 18)); });
  const order = [...ORDER.filter((k) => k !== 'Bo'), 'Bo'];
  for (const k of order) { fillShape(ctx, rects[k], C.paper); strokeShape(ctx, rects[k], C.fg, 3); }
  if (out < 1) {
    ORDER.forEach((k) => {
      const R = [...PANELS[k], PANEL_R];
      ctx.save(); shapePath(ctx, R[0], R[1], R[2], R[3], R[4]); ctx.clip();
      ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
      panelContent(ctx, k, R, pr, pr.dur);
      ctx.restore();
    });
  }
  ctx.save(); shapePath(ctx, FOCUS[0], FOCUS[1], FOCUS[2], FOCUS[3], FOCUS[4]); ctx.clip();
  focusContents(ctx, sc, u);
  ctx.restore();
};

// ---- flood: the Run button floods the frame; the console; the claim; the retract
const runRect = (press = 1) => { const rb = RUN(); const cx = rb.x + rb.w / 2, cy = rb.y + rb.h / 2, w = rb.w * press, h = rb.h * press; return [cx - w / 2, cy - h / 2, w, h, h / 2]; };
const FLOOD_MAX = (() => { // the scale at which the button's outline covers the whole frame
  const R = runRect(), cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2;
  const dx = Math.max(cx, W - cx), dy = Math.max(cy, H - cy);
  return 1.15 * Math.max((dx + R[4]) / (R[2] / 2), (dy + R[4]) / (R[3] / 2));
})();
const floodPath = (ctx, s) => {
  const R = runRect(), cx = R[0] + R[2] / 2, cy = R[1] + R[3] / 2;
  shapePath(ctx, cx - (R[2] * s) / 2, cy - (R[3] * s) / 2, R[2] * s, R[3] * s, R[4] * s);
};
const floodScale = (sc, u) => {
  const T = sc.T, rStart = sc.dur - T.retractBeats * B;
  if (u < T.flood) return 0;
  if (u < rStart) return Math.exp(Math.log(FLOOD_MAX) * Math.pow(prog(u, T.flood, B), 2.2)); // exponential in, one beat
  const p = prog(u, rStart, B);
  return p >= 1 ? 0 : Math.exp(Math.log(FLOOD_MAX) * Math.pow(1 - cubicInOut(p), 1.6));
};
const consoleFrame = (ctx, sc, u, fsc) => { // the dark material: the same card, then the response and the claim
  const T = sc.T;
  ctx.fillStyle = C.fg; ctx.fillRect(0, 0, W, H);
  fillShape(ctx, FOCUS, C.inkCard); strokeShape(ctx, FOCUS, C.inkEdge, 3);
  ctx.save(); shapePath(ctx, FOCUS[0], FOCUS[1], FOCUS[2], FOCUS[3], FOCUS[4]); ctx.clip();
  focusContents(ctx, fsc, fsc.dur, { material: 'ink' });
  const x = FOCUS[0] + 64;
  riseText(ctx, statusLine(FILM), x, FOCUS[1] + 430, mono(SZ.main, 600), C.inkAccent, spr(u - T.status, 22));
  const lines = BODY.slice(0, T.n).map((l) => l.trim().replace(/,$/, ''));
  if (T.n > 0) riseText(ctx, lines[0], x, FOCUS[1] + 500, mono(SZ.main), C.bg, spr(u - T.l1, 22));
  if (T.n > 1) riseText(ctx, lines[1], x, FOCUS[1] + 564, mono(SZ.main), C.bg, spr(u - T.l2, 22));
  ctx.restore();
  // the Run button in the console's material: the flood grows out of it, so it is registered in both
  const R = runRect(), cy = R[1] + R[3] / 2, f = RUN().f, label = fsc.run || 'Run';
  strokeShape(ctx, R, C.inkDim, 3);
  txt(ctx, label, R[0] + R[2] / 2 - 14, cy + 15, f, C.bg, { align: 'center' });
  const ax = R[0] + R[2] / 2 + tw(f, label) / 2 + 4;
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.moveTo(ax, cy - 11); ctx.lineTo(ax, cy + 11); ctx.lineTo(ax + 18, cy); ctx.closePath(); ctx.fill();
  const cOut = prog(u, sc.dur - T.retractBeats * B - 0.12, 0.12);
  riseText(ctx, sc.claim, CX, 930, sans(SZ.caption, 700, -2), C.bg, spr(u - T.claim, 22), { align: 'center', out: cOut });
};
const drawFlood = (ctx, sc, u) => {
  const T = sc.T, fsc = prevOf(sc);
  // the light card, with the Run button pressed and spinning until the flood
  const press = 1 - 0.05 * (crit(u, 34) - crit(u - 0.1, 34));
  const spin = T.pre > 0 && u < T.flood + 0.05 ? (u * 2 * Math.PI * 1.6) : null;
  const light = () => {
    fillShape(ctx, FOCUS, C.paper); strokeShape(ctx, FOCUS, C.fg, 3);
    ctx.save(); shapePath(ctx, FOCUS[0], FOCUS[1], FOCUS[2], FOCUS[3], FOCUS[4]); ctx.clip();
    focusContents(ctx, fsc, fsc.dur, { runState: { press, spin } });
    ctx.restore();
  };
  const s = floodScale(sc, u);
  if (s <= 0) { light(); return; }
  if (s >= FLOOD_MAX * 0.999) { consoleFrame(ctx, sc, u, fsc); return; }
  light();
  ctx.save(); floodPath(ctx, s); ctx.clip();
  consoleFrame(ctx, sc, u, fsc);
  ctx.restore();
  // retracting, the console closes back into the Run button, which stays on top (the accent is not covered by the ink)
  if (u >= sc.dur - T.retractBeats * B) {
    const R = runRect(), cy = R[1] + R[3] / 2, f = RUN().f, label = fsc.run || 'Run';
    fillShape(ctx, R, C.accent); strokeShape(ctx, R, C.accent, 3);
    txt(ctx, label, R[0] + R[2] / 2 - 14, cy + 15, f, C.onAccent, { align: 'center' });
    const ax = R[0] + R[2] / 2 + tw(f, label) / 2 + 4;
    ctx.fillStyle = C.onAccent; ctx.beginPath(); ctx.moveTo(ax, cy - 11); ctx.lineTo(ax, cy + 11); ctx.lineTo(ax + 18, cy); ctx.closePath(); ctx.fill();
  }
};

// ---- mark: the shape splits into the mark's parts; the point lands as its drop of ink; the lock-up
const U = 30, MARK_GAP = 72;
const markLayout = (sc) => {
  const m = PR.mark || { parts: [], dot: [0, 0, 0] };
  const mw = Math.max(...m.parts.map(([x, , w]) => x + w), m.dot[0] + m.dot[2]) * U;
  const mh = Math.max(...m.parts.map(([, y, , h]) => y + h), m.dot[1] + m.dot[2]) * U;
  const nf = sans(SZ.mark, 700, -3), nameW = tw(nf, PR.name || '');
  const total = mw + MARK_GAP + nameW;
  const mx = Math.round((W - total) / 2), my = Math.round(540 - mh / 2 - 30);
  const rowsH = Math.max(...m.parts.map(([, y, , h]) => y + h)) * U;
  const base = Math.round(my + rowsH / 2 + SZ.mark * 0.36);
  return {
    mx, my, mw, mh, nf, nameW, total, nameX: mx + mw + MARK_GAP, base,
    parts: m.parts.map(([x, y, w, h]) => [mx + x * U, my + y * U, w * U, h * U, Math.min(h * U / 2, 0.5 * U)]),
    dot: [mx + m.dot[0] * U, my + m.dot[1] * U, m.dot[2] * U],
  };
};
// the pieces the previous scene hands over: the page's panels, or its card split into a grid
const piecesOf = (pr, n, gap) => {
  if (pr.type === 'unfold') return ORDER.slice(0, n).map((k) => [...PANELS[k], PANEL_R]).concat(Array.from({ length: Math.max(0, n - 6) }, () => [...PANELS.F, PANEL_R]));
  const R = pr.type === 'card' ? CARD : FOCUS, cols = 2, rows = Math.ceil(n / cols);
  const cw = R[2] / cols, ch = R[3] / rows, out = [];
  for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); out.push([R[0] + c * cw + gap / 2, R[1] + r * ch + gap / 2, cw - gap, ch - gap, Math.min(R[4], (ch - gap) / 2)]); }
  return out;
};
// where the point comes from: the last accent element of the previous scene
const batonOf = (pr) => {
  if (pr.type === 'flood' || pr.type === 'focus') return runRect();
  if (pr.type === 'unfold') { const R = PANELS.L; return [R[0] + 12, R[1] + 76 + SEL * 92, R[2] - 24, 72, 12]; }
  return [CARD[0] + 64, CARD[1] + 56, 120, 66, 12];
};
const drawMark = (ctx, sc, u) => {
  const T = sc.T, pr = prevOf(sc), ml = sc.ml || (sc.ml = markLayout(sc));
  const n = ml.parts.length;
  const gap = 16 * cubicOut(prog(u, 0, 0.12));
  const from = piecesOf(pr, n, gap);
  // the previous content leaves first (0.1 s)
  const out = prog(u, 0, 0.1);
  if (out < 1 && (pr.type === 'flood' || pr.type === 'focus')) {
    const fsc = pr.type === 'flood' ? prevOf(pr) : pr;
    fillShape(ctx, FOCUS, C.paper); strokeShape(ctx, FOCUS, C.fg, 3);
    ctx.save(); shapePath(ctx, FOCUS[0], FOCUS[1], FOCUS[2], FOCUS[3], FOCUS[4]); ctx.clip();
    ctx.globalAlpha = 1 - out; ctx.filter = `blur(${(12 * out).toFixed(2)}px)`;
    focusContents(ctx, fsc, fsc.dur, { runState: { press: 1, spin: null } });
    ctx.restore();
  }
  if (out < 1 && pr.type === 'unfold') drawPanels(ctx, pr, pr.dur, Object.fromEntries(ORDER.map((k) => [k, [...PANELS[k], PANEL_R]])), { contentOut: out });
  if (out < 1 && pr.type === 'card') cardFinal(ctx, pr);
  // the flights: each piece flies on an arc into its part, filling with ink
  const sorted = ml.parts.map((p, i) => ({ p, i })).sort((a, b) => a.p[1] - b.p[1] || a.p[0] - b.p[0]);
  const fromSorted = from.map((p, i) => ({ p, i })).sort((a, b) => a.p[1] - b.p[1] || a.p[0] - b.p[0]);
  const second = secondMove(sc.dur, BAR, B, T);
  const pressAt = (row) => second == null ? 0 : 8 * Math.sin(Math.PI * clamp((u - (second - 0.1 + row * 0.03)) / 0.2));
  const rowOf = (y) => Math.round((y - ml.my) / U);
  sorted.forEach(({ p: to }, j) => {
    const a = fromSorted[j].p;
    if (u < 0.12 && out < 1) return; // the piece is still part of the card being cleared
    const c0 = [a[0] + a[2] / 2, a[1] + a[3] / 2], c1 = [to[0] + to[2] / 2, to[1] + to[3] / 2];
    const dist = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
    const e = cubicInOut(prog(u, 0.12 + j * 0.02, 0.24 + dist / 3800));
    const bend = (j % 2 ? 1 : -1) * 0.18 * dist, dx = c1[0] - c0[0], dy = c1[1] - c0[1];
    const qx = (c0[0] + c1[0]) / 2 - (dy / (dist || 1)) * bend, qy = (c0[1] + c1[1]) / 2 + (dx / (dist || 1)) * bend;
    const A = (1 - e) ** 2, Bq = 2 * e * (1 - e), Cq = e * e;
    const cx = A * c0[0] + Bq * qx + Cq * c1[0], cy = A * c0[1] + Bq * qy + Cq * c1[1];
    const w = lerp(a[2], to[2], e), h = lerp(a[3], to[3], e), r = lerp(a[4], to[4], e);
    const off = e >= 1 ? pressAt(rowOf(to[1])) : 0;
    const R = [cx - w / 2, cy - h / 2 + off, w, h, r];
    fillShape(ctx, R, css(mix(RGB.paper, RGB.fg, e)));
    if (e < 1) strokeShape(ctx, R, C.fg, 3 * (1 - e));
  });
  // the target ring, drawn before the point arrives; it closes onto the point as it lands
  const [dx0, dy0, dr] = ml.dot;
  if (u >= T.ring) {
    const sweep = cubicOut(prog(u, T.ring, 0.2)), close = cubicOut(prog(u, T.land, 0.1));
    if (close < 1) { ctx.strokeStyle = C.fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(dx0, dy0, lerp(dr + 14, dr, close), -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2); ctx.stroke(); }
  }
  // the point: grows out of the previous scene's last accent element, waits, hops in on an arc, lands on the beat
  const bt = batonOf(pr), b0 = [bt[0] + bt[2] / 2, bt[1] + bt[3] / 2];
  const shrink = cubicInOut(prog(u, 0, 0.3));
  let px = b0[0], py = b0[1], pr0 = 14;
  if (shrink < 1) {
    const w = lerp(bt[2], 28, shrink), h = lerp(bt[3], 28, shrink);
    fillShape(ctx, [px - w / 2, py - h / 2, w, h, lerp(bt[4], 14, shrink)], C.accent);
  } else {
    if (u >= T.hop) {
      const e = cubicInOut(prog(u, T.hop, T.land - T.hop));
      const q = [(b0[0] + dx0) / 2 + 60, Math.min(b0[1], dy0) - 240];
      const A = (1 - e) ** 2, Bq = 2 * e * (1 - e), Cq = e * e;
      px = A * b0[0] + Bq * q[0] + Cq * dx0; py = A * b0[1] + Bq * q[1] + Cq * dy0; pr0 = lerp(14, dr, cubicOut(e));
    }
    const sq = u > T.land ? 0.12 * Math.exp(-14 * (u - T.land)) * Math.sin(40 * (u - T.land)) : 0;
    const off = u > T.land ? pressAt(rowOf(dy0)) : 0;
    ctx.save(); ctx.translate(px, py + off); ctx.scale(1 + sq, 1 - sq);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, pr0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // the lock-up: the name wipes out of the mark; the tagline rises; the command types on
  if (u >= T.name) {
    const k = expOut(prog(u, T.name, 0.28));
    ctx.save(); ctx.beginPath(); ctx.rect(ml.nameX - 8, ml.base - SZ.mark, (ml.nameW + 40) * k, SZ.mark * 1.3); ctx.clip();
    txt(ctx, PR.name, ml.nameX, ml.base, ml.nf, C.fg);
    ctx.restore();
  }
  riseText(ctx, sc.line, ml.nameX + 4, ml.base + 84, sans(SZ.main, 600), C.dim, spr(u - T.line, 22));
  if (T.cmd != null && u >= T.cmd) {
    const nch = Math.min(sc.cmd.length, Math.floor((u - T.cmd) * CPS + 1e-6));
    const shown = sc.cmd.slice(0, nch), y = ml.base + 168, f = mono(SZ.main);
    txt(ctx, shown, ml.nameX + 4, y, f, C.fg);
    if (u < T.typed + 0.4) { ctx.fillStyle = C.fg; ctx.fillRect(ml.nameX + 4 + tw(f, shown) + 4, y - 36, 4, 44); } // caret while typing
  }
};

const DRAW = { point: drawPoint, line: drawLine, press: drawPress, card: drawCard, solid: drawSolid, unfold: drawUnfold, focus: drawFocus, flood: drawFlood, mark: drawMark };

// ---------- frame ----------
let grain = null, ready0 = false;
const paint = (ctx, t) => {
  const sc = sceneAt(t), u = t - sc.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  DRAW[sc.type](ctx, sc, u);
};
const fastAt = (t) => {
  const sc = sceneAt(t), u = t - sc.start;
  const hit = (sc.T.fast || []).find(([a, b]) => u >= a && u < b);
  if (!hit) return 0;
  return sc.type === 'mark' && u >= sc.T.hop ? 12 : 7;
};
export const fonts = [
  { family: DISPLAY, weight: 600 }, { family: DISPLAY, weight: 700 },
  { family: MONO, weight: 500 }, { family: MONO, weight: 600 },
];
export const setContext = (ctx) => { CTX = ctx; };
export const ready = async () => {
  layout();
  const bad = problems();
  if (bad.length) {
    const lines = ['CONTENT.JS OR PALETTE INVALID — run npm run fit; TEMPLATE.md lists every slot and limit', ...bad.slice(0, 12)];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-morph-error');
    setTimeout(() => { throw new Error(`morph: ${bad.join('; ')}`); }, 0);
  }
  grain = grainTile((FILM.seed ?? 1) % 100000, 256, 16);
  ready0 = true;
};
export const render = (ctx, t) => {
  if (!ready0) return;
  const n = fastAt(t);
  if (n) subframes(ctx, (c, tt) => paint(c, Math.max(0, tt)), t, { n, shutter: 0.5, exact: true });
  else paint(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawGrain(ctx, grain, t, { alpha: 0.05, mode: 'overlay' });
};

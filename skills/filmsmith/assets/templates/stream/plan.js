// plan.js — the whole film laid out in absolute time, from content.js and the fitted scenes. Pure (no DOM):
// film.js draws from it, score.mjs plays from it. Positions are in px on the 1920×1080 frame.

import { fit } from './lib/timing.js';
import rulesFn from './timing.rules.js';
import { schedule } from './sched.js';
import { langOf } from './lang.js';

export const W = 1920, H = 1080;
// The thread's home: the mascot at the top of a vertical spine on the left; everything hangs off this line.
export const L = {
  SPINE_X: 230, SPINE_TOP: 236, SPINE_BOT: 1010, MASCOT: [230, 156], NAME: [292, 134],
  CAP: [1000, 112], CAP_W: 860,
  G1: { x: 290, y: 236, w: 640, h: 774 }, G3C: { x: 290, y: 560, w: 600, h: 450 },
  LIST: { x: 940, y: 560, w: 900, h: 450 },
  ROW: { x: 1060, y: 650, w: 760, h: 150 },
  REGION: { x: 1060, y: 236, w: 780, h: 760 },
  CARD: { x: 1100, w: 640, h: 150, ys: [330, 540, 750] }, ZOOM: { x: 900, y: 300, s: 1.45 },
  PANEL: { x: 1060, y: 250, w: 780, h: 660 }, SEED: [1060, 600],
  FLAT_Y: 640,
};

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  out3: (k) => 1 - Math.pow(1 - k, 3), in3: (k) => k * k * k,
  io2: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  io3: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  outBack: (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
export const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const catmull = (p, steps) => {
  const out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  out.push(p[p.length - 1]);
  return out;
};
export const cumLen = (pts) => { const Ls = [0]; for (let i = 1; i < pts.length; i++) Ls.push(Ls[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return Ls; };
export const atLen = (pts, Ls, d) => { let j = 0; while (j < Ls.length - 2 && Ls[j + 1] < d) j++; const f = clamp((d - Ls[j]) / Math.max(1e-6, Ls[j + 1] - Ls[j])); return [lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f)]; };
export const subPath = (pts, Ls, d0, d1) => { const out = [atLen(pts, Ls, d0)]; for (let i = 0; i < pts.length; i++) if (Ls[i] > d0 && Ls[i] < d1) out.push(pts[i]); out.push(atLen(pts, Ls, d1)); return out; };
const nearest = (pts, Ls, x, y) => { let bd = 1e9, bi = 0; pts.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; bi = i; } }); return Ls[bi]; };

// ---------- the opening's items (desk windows, alerts, note, the pile of copies) ----------
export const openItems = (variant, s, seed) => {
  const rnd = mulberry32(seed * 101 + 7);
  const items = [];
  if (variant === 'desk') {
    items.push({ kind: 'window', i: 0, x: 60, y: 40, w: 600, h: 330 }, { kind: 'window', i: 1, x: 470, y: 250, w: 600, h: 330 }, { kind: 'window', i: 2, x: 980, y: 90, w: 600, h: 360 });
    s.alerts.forEach((_, i) => items.push({ kind: 'alert', i, x: 1500, y: 30 + i * 112, w: 390, h: 96 }));
    items.push({ kind: 'note', i: 0, x: 150, y: 560, w: 560, h: 210, rot: -2.5 });
    for (let k = 0; k < 14; k++) items.push({ kind: 'copy', i: k, x: 760 + 34 * k, y: 300 + 26 * k, w: 470, h: 190 });
  } else {
    // night: the same things as small cards scattered across the sky, drifting; no desktop
    const spots = [];
    const put = (w, h) => { for (let g = 0; g < 400; g++) { const x = 90 + rnd() * (W - 180 - w), y = 70 + rnd() * (H - 160 - h); if (spots.every((p) => Math.abs(p.x - x) > (p.w + w) * 0.42 || Math.abs(p.y - y) > (p.h + h) * 0.42)) { const sp = { x, y, w, h }; spots.push(sp); return sp; } } const sp = { x: 90 + rnd() * (W - 180 - w), y: 70 + rnd() * (H - 160 - h), w, h }; spots.push(sp); return sp; };
    for (let i = 0; i < 3; i++) items.push({ kind: 'window', i, ...put(520, 290) });
    s.alerts.forEach((_, i) => items.push({ kind: 'alert', i, ...put(390, 96) }));
    items.push({ kind: 'note', i: 0, ...put(540, 200), rot: -2 });
    for (let k = 0; k < 14; k++) items.push({ kind: 'copy', i: k, ...put(400, 170), drift: rnd() * 6.28 });
  }
  items.forEach((it, j) => { it.j = j; it.cx = it.x + it.w / 2; it.cy = it.y + it.h / 2; });
  return items;
};

// ---------- build ----------
export const build = (content) => {
  const lang = langOf(content);
  const rules = rulesFn(content);
  const T = fit(content, rules);
  const B = T.beat;
  const sc = {};
  T.scenes.forEach((s) => { sc[s.type] = { s, start: s.start, end: s.end, dur: s.end - s.start, k: schedule(s, B, lang, content) }; });
  const at = (type, key) => sc[type].start + sc[type].k[key];
  const A = (type, x) => sc[type].start + x;
  const rnd = mulberry32((content.seed ?? 1) * 7919);

  // ---- stars: every task the film sends out stays in the sky until the closing sweep gathers it ----
  const STARS = [];
  const sky = [];
  const free = (x, y, d = 96) => sky.every((p) => Math.hypot(p[0] - x, p[1] - y) > d);
  const skyPos = (x0, x1, y0, y1) => { for (let g = 0; g < 3000; g++) { const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0); if (free(x, y) && !(x < 700 && y < 300) && !(x > 1040 && y < 220)) { sky.push([x, y]); return [x, y]; } } const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]; sky.push(p); return p; };
  // ask: the task row shrinks into a star
  { const p = skyPos(1150, 1800, 250, 470); STARS.push({ x: p[0], y: p[1], from: [L.ROW.x + 52, L.ROW.y + 50], launchAt: at('ask', 'launch'), fly: 0.8, size: 1, label: sc.ask.s.task.title }); }
  // evening: each ask launches a star from its row; then a burst
  const ev = sc.evening.s;
  ev.asks.forEach((a, i) => { const p = skyPos(330, 1860, 250, 500); STARS.push({ x: p[0], y: p[1], from: [L.LIST.x + 46, L.LIST.y + 120 + i * 58], launchAt: sc.evening.start + sc.evening.k.asks[i] + 0.35 * B, fly: 0.7, size: 1, label: a.task, row: i }); });
  for (let i = 0; i < ev.more; i++) { const p = skyPos(330, 1860, 240, 520); STARS.push({ x: p[0], y: p[1], from: [L.LIST.x + 46, L.LIST.y + 400], launchAt: sc.evening.start + sc.evening.k.burst[i], fly: 0.6, size: 0.65 + rnd() * 0.3, row: ev.asks.length + i, queued: i >= ev.more - 2 }); }
  // constellation: three jobs and the plan, launched from the thread into the workspace region
  const cs = sc.constellation;
  const CONST = {
    origin: [L.SPINE_X, 470],
    stars: cs.s.jobs.map((j, k) => ({ label: j.label, x: [1190, 1450, 1640][k], y: [610, 480, 660][k], launchAt: cs.start + cs.k.jobs[k], ret: cs.start + cs.k.ret[k] })),
    plan: { label: cs.s.plan.label, x: 1420, y: 860, launchAt: cs.start + cs.k.plan, start: cs.start + cs.k.link },
    link: cs.start + cs.k.link,
  };
  [...CONST.stars, CONST.plan].forEach((c, k) => STARS.push({ x: c.x, y: c.y, from: CONST.origin, launchAt: c.launchAt, fly: 0.6, size: 1, label: c.label, cst: true, beam: true }));
  STARS.forEach((s, i) => { s.i = i; s.tw = rnd() * 6.28; });

  // ---- the chat block hung on the thread (intro → constellation; it folds back into the thread in verify) ----
  const G1N = { ...L.G1, w: 0 };
  const CARDK = [
    [at('intro', 'card'), G1N], [at('intro', 'card') + 0.45, L.G1],
    [A('evening', sc.evening.k.grow), L.G1], [A('evening', sc.evening.k.grow) + B, L.G3C],
    [A('constellation', cs.k.back), L.G3C], [A('constellation', cs.k.back) + B, L.G1],
    [at('verify', 'fold'), L.G1], [at('verify', 'fold') + 0.4, G1N],
  ];
  const cardAt = (t) => {
    if (t < CARDK[0][0] || t >= CARDK[CARDK.length - 1][0]) return { ...G1N, a: 0 };
    for (let i = 0; i < CARDK.length - 1; i++) { const [t0, a] = CARDK[i], [t1, b] = CARDK[i + 1]; if (t >= t0 && t < t1) { const q = E.io3(seg(t, t0, t1)); return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), w: lerp(a.w, b.w, q), h: lerp(a.h, b.h, q), a: 1 }; } }
    return { ...L.G1, a: 1 };
  };
  const ivr = sc.intro.k, ak = sc.ask.k, ek = sc.evening.k, ck = cs.k;
  const MSG = [
    ...sc.intro.s.lines.map((text, i) => ({ who: 'bot', text, at: A('intro', ivr.bubbles[i]) })),
    { who: 'user', text: sc.ask.s.ask, file: sc.ask.s.file, at: A('ask', ak.user) },
    { who: 'bot', text: sc.ask.s.reply, at: A('ask', ak.reply) },
    { who: 'chip', text: sc.ask.s.chip, at: A('ask', ak.chip) },
    ...ev.asks.map((a, i) => ({ who: 'user', text: a.ask, at: A('evening', ek.asks[i]) })),
    { who: 'user', text: cs.s.ask, at: A('constellation', ck.user) },
    { who: 'bot', text: cs.s.offer, at: A('constellation', ck.offer) },
    { who: 'user', text: cs.s.yes, at: A('constellation', ck.yes) },
    { who: 'bot', text: cs.s.result, at: A('constellation', ck.result) },
  ];

  // ---- the closing sweep: the thread runs three passes over the sky and catches every star ----
  const cl = sc.close, S8 = { r0: at('close', 'r0'), gA: at('close', 'gA'), gB: at('close', 'gB'), flowA: at('close', 'flowA'), flowB: at('close', 'flowB'), unfold: at('close', 'unfold'), SRC: [L.SPINE_X, L.SPINE_TOP], SEED: L.SEED };
  const WP = [S8.SRC, [560, 300], [1000, 330], [1450, 290], [1800, 360], [1820, 480], [1450, 520], [1000, 470], [560, 520], [430, 640], [760, 700], [1200, 620], [1500, 690], [1700, 800], [1400, 880], [1150, 760], S8.SEED];
  const GPraw = catmull(WP, 24), GLraw = cumLen(GPraw), GTOT = GLraw[GLraw.length - 1], GN = 400;
  const GU = Array.from({ length: GN }, (_, j) => atLen(GPraw, GLraw, (j / (GN - 1)) * GTOT));
  const SL = (f) => { const a = S8.SRC, b = S8.SEED; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - 80 * Math.sin(Math.PI * f)]; };
  const gMorph = (t) => E.io2(seg(t, S8.flowA, S8.flowA + 1.5 * B));
  const gPt = (f, m) => { const x = clamp(f) * (GN - 1), j = Math.min(GN - 2, Math.floor(x)), r = x - j; const p = [lerp(GU[j][0], GU[j + 1][0], r), lerp(GU[j][1], GU[j + 1][1], r)]; if (m <= 0) return p; const q = SL(f); return [lerp(p[0], q[0], m), lerp(p[1], q[1], m)]; };
  const gHeadF = (t) => E.io2(seg(t, S8.gA, S8.gB));
  const gLine = (t) => { const m = gMorph(t), hf = t < S8.flowA ? gHeadF(t) : 1, n = Math.max(2, Math.ceil(hf * (GN - 1)) + 1), out = []; for (let j = 0; j < n; j++) out.push(gPt(Math.min(hf, j / (GN - 1)), m)); return out; };
  STARS.forEach((s) => { let bj = 0, bd = 1e9; GU.forEach((p, j) => { const d = Math.hypot(p[0] - s.x, p[1] - s.y); if (d < bd) { bd = d; bj = j; } }); s.fk = bj / (GN - 1); s.np = GU[bj]; });
  STARS.forEach((s) => { let tt = S8.gA; while (tt < S8.gB && gHeadF(tt) < s.fk) tt += 1 / 240; s.catchT = tt; s.flow = [S8.flowA, S8.flowB - 1.6 * B * (1 - s.fk)]; });
  const gPos = (s, t) => {
    if (t < s.catchT) return null;
    const sn = E.io2(seg(t, s.catchT, s.catchT + 0.25));
    let p = [lerp(s.x, s.np[0], sn), lerp(s.y, s.np[1], sn)];
    if (t >= S8.flowA) { const k = seg(t, s.flow[0], s.flow[1]); p = gPt(lerp(s.fk, 1, E.in3(k)), gMorph(t)); return { x: p[0], y: p[1], k }; }
    return { x: p[0], y: p[1], k: 0 };
  };
  const GATHER = { line: gLine, pos: gPos, morph: gMorph, pt: gPt, SL, headF: gHeadF };

  // ---- the opening's thread: from the mascot through every item, in the order the path meets them ----
  const op = sc.open, ov = content.opening ?? 'desk';
  const items = openItems(ov, op.s, content.seed ?? 1);
  const DROP = [960, 520];
  const order = [...items].sort((a, b) => (ov === 'desk' ? (a.kind === 'copy' ? 0 : 1) - (b.kind === 'copy' ? 0 : 1) || a.cy - b.cy : Math.atan2(a.cy - 520, a.cx - 960) - Math.atan2(b.cy - 520, b.cx - 960)));
  let OPEN_WP;
  if (ov === 'desk') {
    const copies = items.filter((i) => i.kind === 'copy');
    const win = items.filter((i) => i.kind === 'window'), al = items.filter((i) => i.kind === 'alert'), note = items.find((i) => i.kind === 'note');
    OPEN_WP = [DROP, [copies[13].cx, copies[13].cy], [copies[7].cx, copies[7].cy], [copies[0].cx, copies[0].cy], [win[0].cx, win[0].cy], [note.cx, note.cy], [win[1].cx, win[1].cy + 40], [win[2].cx, win[2].cy], ...al.map((a) => [a.cx - 60, a.cy]).reverse(), [1700, -60]];
  } else {
    // a loop that visits the cards by angle round the drop point, outward
    const byAng = [...items].sort((a, b) => Math.atan2(a.cy - 520, a.cx - 960) - Math.atan2(b.cy - 520, b.cx - 960));
    OPEN_WP = [DROP, ...byAng.filter((_, k) => k % 2 === 0).map((i) => [i.cx, i.cy]), ...byAng.filter((_, k) => k % 2 === 1).reverse().map((i) => [i.cx, i.cy]), [W + 60, 200]];
  }
  const OP = catmull(OPEN_WP, 30), OPL = cumLen(OP), OPT = OPL[OPL.length - 1];
  const th0 = at('open', 'th0'), th1 = at('open', 'th1');
  const opHead = (t) => OPT * E.io2(seg(t, th0, th1));
  items.forEach((it) => { it.d = nearest(OP, OPL, it.cx, it.cy); let tc = th0; while (tc < th1 && opHead(tc) < it.d) tc += 1 / 240; it.pierce = tc; });
  const OPEN = { items, path: OP, len: OPL, total: OPT, head: opHead, drop: DROP, order };

  // ---- sound: cues and music sections in absolute time ----
  const CUES = [], MUSIC = [], PEAKS = [];
  T.scenes.forEach((s) => {
    const k = sc[s.type].k;
    k.cues.forEach((c) => CUES.push({ ...c, t: s.start + c.t, scene: s.type }));
    (k.music || []).forEach((m) => MUSIC.push({ ...m, at: s.start + m.at }));
    if (k.peak) PEAKS.push({ ...k.peak, t: s.start + k.peak.t });
  });
  // per-star sounds: each launch, each catch in the sweep
  STARS.forEach((s) => { if (!s.beam) CUES.push({ t: s.launchAt, kind: 'star', i: s.i }); CUES.push({ t: s.catchT, kind: 'catch', i: s.i }); });
  items.forEach((it) => CUES.push({ t: it.pierce, kind: 'pierce', i: it.j }));
  CUES.sort((a, b) => a.t - b.t);

  return { content, lang, T, B, sc, at, L, STARS, CONST, cardAt, MSG, S8, GATHER, OPEN, CUES, MUSIC, PEAKS, duration: T.duration };
};

// film.js — dossier renderer. render(ctx, t) paints the whole frame from t, content.js and palettes.js alone (Canvas2D).
//
// An evidence file on a dark mat: real pages mounted on paper, the rest of the page veiled, the claim struck with a
// highlighter (multiply, so the page's own type stays under it), a leader tied to an exhibit sticker; the claim
// restated in type on the mat. A figure is carried off the page as a paper slip to a ruled worksheet, the result
// struck there; an index of exhibits; the name struck on the mat. Mode card: references/modes/dossier.md.
//
// Why Canvas2D, not DOM: the page changes are frame-level (two finished frames mixed by lib/transitions, or a sheet
// projected strip by strip), motion blur needs sub-frames of a pure render(t) (lib/canvas.js subframes), multiply is
// one composite operation, and every slot is measured before the first frame (a line that would cross the margin is
// a red banner, not a clipped render).
import FILM from './content.js';
import PALETTES, { VEIL } from './palettes.js';
import { plan } from './plan.js';
import { C, CB } from './choreo.js';
import { W, H, M, X0, Y0, READ_W, BOTTOM, CLAIM_Y, TERMS_Y, HEADER_Y, WORK, sheetOf, bandOf, leaderOf, sheetIndex, ledgerBox } from './layout.js';
import { clamp, lerp, expOut, progress } from './lib/motion.js';
import { subframes } from './lib/canvas.js';
import { errorBanner } from './lib/text.js';
import { changeOf } from './changes.js';

const P = PALETTES[FILM.palette] || PALETTES.yellow;
const PL = plan(FILM);
const B = PL.B;
const S = PL.scenes;
export const duration = PL.duration;

// ---------- type ----------
export const FAM = { serif: 'Source Serif 4', mono: 'IBM Plex Mono', sans: 'Inter Tight' };
export const fonts = [
  { family: FAM.serif, weight: 600 }, { family: FAM.serif, weight: 400 },
  { family: FAM.mono, weight: 400 }, { family: FAM.mono, weight: 500 }, { family: FAM.mono, weight: 600 },
  { family: FAM.sans, weight: 700 },
];
// type styles: [family, weight, size, letter-spacing em]
const T = {
  claim: [FAM.serif, 600, 50, -0.01], terms: [FAM.mono, 400, 25, 0], header: [FAM.mono, 400, 25, 0],
  tag1: [FAM.mono, 600, 25, 0], tag2: [FAM.mono, 400, 25, 0], tab: [FAM.mono, 600, 25, 0],
  title: [FAM.serif, 600, 50, -0.008], row: [FAM.serif, 400, 40, 0], value: [FAM.mono, 400, 40, 0],
  fig: [FAM.serif, 600, 125, -0.02], caption: [FAM.serif, 400, 40, 0], source: [FAM.mono, 400, 25, 0],
  name: [FAM.serif, 600, 160, -0.02], url: [FAM.mono, 500, 40, 0], cap: [FAM.mono, 400, 25, 0],
};
const fontOf = ([fam, w, size]) => `${w} ${size}px "${fam}"`;
let MC = null; // a measuring context
const setType = (g, st) => { g.font = fontOf(st); g.letterSpacing = `${(st[3] * st[2]).toFixed(2)}px`; };
const widthOf = (s, st) => { setType(MC, st); return MC.measureText(s).width; };

// ---------- the timeline, looked up ----------
const at = (i, kind, nth = 0) => { const m = S[i].plan.moments.filter((x) => x.kind === kind)[nth]; return m ? S[i].start + m.t : null; };
const EXS = S.filter((s) => s.type === 'exhibit').map((s) => s.i);
const N = EXS.length;
const LEDGER = S.find((s) => s.type === 'ledger'), LOCK = S.at(-1);
const WS = S.find((s) => s.type === 'worksheet'), RES = S.find((s) => s.type === 'result');

// ---------- problems (shown as a red banner on every frame) ----------
const problems = [];

// ---------- lines of words: rise out of a mask, one after another; sink upward, faster ----------
// a line: { st, color, x, base, align, words: [{ s, x, w, at }], leave }
const lineOf = (text, st, { x, base, align = 'left', at: t0, leave = Infinity, color, max, what }) => {
  const words = [];
  const sp = widthOf(' ', st);
  let cx = 0;
  String(text).split(/\s+/).filter(Boolean).forEach((s, k) => { const w = widthOf(s, st); words.push({ s, x: cx, w, at: t0 + k * C.stagger }); cx += w + sp; });
  const width = Math.max(0, cx - sp);
  if (max != null && width > max + 0.5) problems.push(`${what ?? 'a line'}: "${text}" is ${Math.round(width)} px wide, the slot is ${Math.round(max)} px: shorten it`);
  const x0 = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
  return { st, color, x: x0, base, words, width, leave };
};
// append a second phrase to a line (it enters later, on the same baseline)
const appendTo = (L, text, t0) => {
  const sp = widthOf(' ', L.st);
  let cx = L.width + sp;
  String(text).split(/\s+/).filter(Boolean).forEach((s, k) => { const w = widthOf(s, L.st); L.words.push({ s, x: cx, w, at: t0 + k * C.stagger }); cx += w + sp; });
  L.width = cx - sp;
  return L;
};
const drawLine = (g, L, t, { dx = 0, dy = 0 } = {}) => {
  if (!L || t < L.words[0]?.at || t >= L.leave + C.sink + L.words.length * C.sinkStagger) return;
  const size = L.st[2], lh = size * 1.2, rise = lh * 1.15;
  g.save();
  g.beginPath();
  g.rect(L.x + dx - 12, L.base + dy - size * 1.05, L.width + 24, size * 1.4);
  g.clip();
  setType(g, L.st);
  g.fillStyle = L.color;
  g.textBaseline = 'alphabetic';
  L.words.forEach((w, k) => {
    if (t < w.at) return;
    let y = (1 - expOut(progress(t, w.at, C.rise))) * rise;
    if (t >= L.leave) { const u = progress(t, L.leave + k * C.sinkStagger, C.sink); y -= u * u * u * rise; }
    g.fillText(w.s, L.x + dx + w.x, L.base + dy + y);
  });
  g.restore();
};

// ---------- paper ----------
let TOOTH = null; // a 256 px paper tile: the paper colour with a faint tooth (seeded, fixed)
const makeTooth = () => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), img = g.createImageData(256, 256);
  const pr = parseInt(P.paper.slice(1), 16), base = [(pr >> 16) & 255, (pr >> 8) & 255, pr & 255];
  let s = (FILM.seed ?? 1) * 2654435761 >>> 0;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const d = ((s >>> 24) / 255 - 0.5) * 7;
    img.data[i] = base[0] + d; img.data[i + 1] = base[1] + d; img.data[i + 2] = base[2] + d * 1.1; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};
const paper = (g, x, y, w, h, { ruled = false } = {}) => {
  g.save();
  g.translate(x, y);
  g.fillStyle = g.createPattern(TOOTH, 'repeat');
  g.fillRect(0, 0, w, h);
  if (ruled) { g.fillStyle = P.rule; for (let ry = 93; ry < h - 4; ry += 64) g.fillRect(0, ry, w, 1); }
  g.restore();
};
// the stack under a sheet: two hard paper edges, offset down and right
const edges = (g, x, y, w, h, k = 1) => {
  g.fillStyle = P.paperEdge;
  g.fillRect(x + 14 * k, y + 14 * k, w, h);
  g.fillRect(x + 7 * k, y + 7 * k, w, h);
};
const poly = (g, [x, y, w, h], sl = 5) => { g.moveTo(x + sl, y); g.lineTo(x + w, y); g.lineTo(x + w - sl, y + h); g.lineTo(x, y + h); g.closePath(); };
// a sticker or tab pressed on its key: it is there at 1.1 × on the key's frame and settles to 1 in C.stamp (power3 out)
const stampScale = (t, tl) => { const u = progress(t, tl, C.stamp); return { a: t >= tl ? 1 : 0, s: 1.1 - 0.1 * (1 - (1 - u) ** 3) }; };
const popScale = (t, pops) => { for (const p of pops) { const u = (t - p) / C.pop; if (u >= 0 && u < 1) return 1 + C.popScale * Math.sin(Math.PI * u); } return 1; };
const ease2io = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
const ease1io = (u) => -(Math.cos(Math.PI * clamp(u)) - 1) / 2;

// ---------- the exhibits ----------
const IMG = {}; // asset id → HTMLImageElement
const EX = {}; // scene index of an exhibit → { sh, scene, bands: [{ t0, band, route, i }], times, life }
const header = []; // [{ t, text }]

const build = () => {
  MC = document.createElement('canvas').getContext('2d');
  const sc = FILM.scenes;
  // header (the page in hand), from the plan's 'header' moments
  S.forEach((s, i) => {
    const ex = sc[sheetIndex(sc, i)]?.ex;
    const text = s.type === 'exhibit' ? `Exhibit ${s.ex} of ${N}` : s.type === 'worksheet' ? `Worksheet, from exhibit ${ex}` : s.type === 'ledger' ? 'Index of exhibits' : s.type === 'lockup' ? `${N} exhibit${N === 1 ? '' : 's'}` : null;
    if (text) header.push({ t: i === 0 ? 0 : at(i, 'header') ?? s.start, text });
  });
  header.forEach((h) => { const w = widthOf(h.text, T.header); if (w > 860) problems.push(`header "${h.text}" is too wide`); });
  if (widthOf(FILM.meta.slug, T.header) > 820) problems.push(`meta.slug "${FILM.meta.slug}" is too wide`);

  // sheets: when each arrives and leaves, how
  EXS.forEach((i, n) => {
    const s = S[i], sh = sheetOf(FILM, i);
    const j = EXS[n + 1];
    const e = { i, sh, scene: s, bands: [], img: IMG[s.asset] };
    // arrival
    if (i === 0) e.inT = 0, e.inHow = 'open';
    else if (s.enter === 'deal') e.inT = s.start + 0.5 * B, e.inHow = 'deal';
    else { const ch = changeOf(s.enter); e.inHow = ch?.level ?? 'missing'; e.inT = ch?.level === 'sheet' ? s.start - CB.turn * B : s.start; if (!ch) problems.push(`scene ${i + 1}: enter "${s.enter}" is not a page change (changes.js: 'turn', 'deal', a lib/transitions id, or a registered change)`); }
    // departure
    if (j != null) {
      const sj = S[j];
      if (sj.enter === 'deal') e.outT = sj.start, e.outHow = 'exit';
      else { const ch = changeOf(sj.enter); e.outHow = ch?.level === 'sheet' ? 'change' : 'cut'; e.outT = ch?.level === 'sheet' ? sj.start - CB.turn * B : sj.start; e.change = ch; e.changeOpts = { edge: sj.edge ?? 'top' }; }
    } else { e.outT = LEDGER ? LEDGER.start : LOCK.start; e.outHow = 'exit'; }
    // bands: the exhibit's own, then each claim scene's move on the same sheet
    for (let k = i; k < S.length && (k === i || S[k].type !== 'exhibit'); k++) {
      if (S[k].type !== 'exhibit' && S[k].type !== 'claim') continue;
      e.bands.push({ i: k, t0: k === i ? null : S[k].start, band: bandOf(FILM, sh, sc[k]), route: sc[k].leader ?? 'down', pops: S[k].plan.focus === 'band' ? S[k].pops.map((p) => S[k].start + p) : [] });
    }
    e.veilT = at(i, 'veil'); e.strokeT = at(i, 'stroke'); e.landT = at(i, 'land'); e.stampT = at(i, 'stamp');
    const tw = Math.max(widthOf(`EX. ${s.ex}`, T.tag1) + 18 + widthOf(FILM.assets[s.asset].kind, T.tag2), widthOf(s.where, T.tag2));
    if (tw > sh.tag.w - 40) problems.push(`scene ${i + 1}: the sticker text is ${Math.round(tw)} px; the sticker holds ${sh.tag.w - 40}`);
    EX[i] = e;
  });
};

// the band of a sheet at t: rectangles interpolated across a claim scene's move
const bandAt = (e, t) => {
  let cur = e.bands[0], prev = null;
  for (const b of e.bands.slice(1)) if (t >= b.t0) { prev = cur; cur = b; }
  if (!prev) return { band: cur.band, route: cur.route, leaderA: 1, cur };
  const u = ease2io(progress(t, cur.t0, C.bandMove));
  const mix = (a, b) => a.map((v, k) => lerp(v, b[k], u));
  const band = { lit: mix(prev.band.lit, cur.band.lit), stroke: mix(prev.band.stroke, cur.band.stroke), under: u < 0.5 ? prev.band.under : cur.band.under };
  // a leader that the new claim does not keep fades as the band moves; one it gains draws in at its 'leader' moment
  let route = cur.route, leaderA = 1, draw = null;
  if (cur.route === false && prev.route !== false) { route = prev.route; leaderA = 1 - progress(t, cur.t0, 0.2); }
  else if (cur.route !== false && prev.route === false) draw = at(cur.i, 'leader');
  return { band, route, leaderA, draw, cur };
};

// paint exhibit e's sheet at t, its top left at (x, y), with or without the stack edges
const paintSheet = (g, e, t, x, y, { withEdges = true } = {}) => {
  const { sh } = e, img = e.img;
  if (withEdges) edges(g, x, y, sh.w, sh.h);
  paper(g, x, y, sh.w, sh.h);
  const [cx, cy, cw, ch] = sh.crop;
  g.save();
  g.translate(x, y);
  g.beginPath(); g.rect(M, M, sh.aw, sh.ah); g.clip();
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  if (img) g.drawImage(img, cx, cy, cw, ch, M, M, sh.aw, sh.ah);
  const B0 = bandAt(e, t);
  // the veil: the mat laid uniformly over the page outside the lit band
  const va = VEIL * clamp(1 - (1 - progress(t, e.veilT, C.veil)) ** 2);
  if (va > 0) {
    g.globalAlpha = va; g.fillStyle = P.mat;
    g.beginPath(); g.rect(M, M, sh.aw, sh.ah); poly(g, B0.band.lit);
    g.fill('evenodd');
    g.globalAlpha = 1;
  }
  // the stroke: multiply, wiped left to right in one beat (a hand's speed); pressed again on the tail moves
  if (t >= e.strokeT) {
    const u = ease1io(progress(t, e.strokeT, CB.stroke * B));
    const [bx, by, bw, bh] = B0.band.stroke;
    const k = popScale(t, B0.cur.pops);
    g.save();
    g.translate(bx + bw / 2, by + bh / 2); g.scale(k, k); g.translate(-(bx + bw / 2), -(by + bh / 2));
    g.beginPath(); g.rect(bx - 2, by - 2, bw * u + 4, bh + 4); g.clip();
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = P.accent;
    g.beginPath(); poly(g, B0.band.stroke, B0.band.under ? 2 : 5); g.fill();
    g.restore();
  }
  g.restore();
  // the leader: ink case, accent core, a dot on the band; drawn from the band to the sticker
  const t0 = B0.draw ?? e.landT;
  const pts = B0.route === false ? null : leaderOf(sh, B0.band, B0.route);
  if (pts && t >= t0 && B0.leaderA > 0) {
    const segs = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
    const L = segs.reduce((a, b) => a + b, 0);
    let left = L * ease2io(progress(t, t0 + 0.05, C.leader - 0.05));
    g.save();
    g.translate(x, y);
    g.globalAlpha = B0.leaderA;
    const path = () => { g.beginPath(); g.moveTo(...pts[0]); let r = left; for (let k = 0; k < segs.length && r > 0; k++) { const u = Math.min(1, r / segs[k]); g.lineTo(lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)); r -= segs[k]; } };
    g.lineJoin = 'miter'; g.lineCap = 'butt';
    path(); g.strokeStyle = P.ink; g.lineWidth = 9; g.stroke();
    path(); g.strokeStyle = P.accent; g.lineWidth = 4; g.stroke();
    const ds = clamp(progress(t, t0, C.dot));
    g.beginPath(); g.arc(pts[0][0], pts[0][1], 8 * ds, 0, Math.PI * 2);
    g.fillStyle = P.accent; g.fill(); g.lineWidth = 2.5; g.strokeStyle = P.ink; g.stroke();
    g.restore();
  }
  // the exhibit sticker: pressed (1.1 → 1) on its beat
  if (t >= e.stampT) {
    const { a, s } = stampScale(t, e.stampT), tg = sh.tag;
    g.save();
    g.translate(x + tg.x + tg.w / 2, y + tg.y + tg.h / 2); g.scale(s, s); g.translate(-tg.w / 2, -tg.h / 2);
    g.globalAlpha = a;
    g.fillStyle = P.accent; g.fillRect(0, 0, tg.w, tg.h);
    g.fillStyle = P.onAccent; g.textBaseline = 'alphabetic';
    setType(g, T.tag1); g.fillText(`EX. ${e.scene.ex}`, 20, 41);
    const w1 = g.measureText(`EX. ${e.scene.ex}`).width;
    setType(g, T.tag2); g.fillText(FILM.assets[e.scene.asset].kind, 20 + w1 + 18, 41);
    g.fillText(e.scene.where, 20, 76);
    g.restore();
  }
};

// sheet motion: dealt on (from 800 px below, expo out over a beat), slid off (900 px down, power2 in, 0.35 s)
const dealY = (t, t0) => (t < t0 ? Infinity : 800 * (1 - expOut(progress(t, t0, CB.deal * B))));
const exitY = (t, t0, d = C.exit) => (t < t0 ? 0 : 900 * progress(t, t0, d) ** 2);

// ---------- the worksheet, the slip and the result ----------
let WSL = null; // worksheet layout
let SLIP = null;
const buildWorksheet = () => {
  if (!WS) return;
  const owner = EX[sheetIndex(FILM.scenes, WS.i)];
  const s = FILM.scenes[WS.i], w = WORK.w;
  const L = { x: WORK.x, y: Y0, w, owner, lines: [], rows: [] };
  L.tabText = `EX. ${owner.scene.ex}`;
  L.tabT = at(WS.i, 'tab');
  L.title = lineOf(s.title, T.title, { x: 40, base: 30 + 48, at: at(WS.i, 'title'), color: P.ink, max: w - 80 - widthOf(L.tabText, T.tab) - 40, what: 'worksheet title' });
  let top = 112;
  if (s.carry) {
    const [rx, ry, rw, rh] = s.carry.region, ink = s.carry.ink;
    const kf = clamp(Math.min(28 / ink[3], (w - 80) / rw), 1, 3);
    SLIP = { region: s.carry.region, ink, text: s.carry.text, kf, slot: [WORK.x + 40, Y0 + top], w: rw * kf, h: rh * kf, liftT: at(WS.i, 'lift'), swapT: at(WS.i, 'swap'), landT: at(WS.i, 'land'), owner,
      pops: WS.plan.focus === 'slip' ? WS.pops.map((p) => WS.start + p) : [] };
    top += SLIP.h + 40;
  }
  s.rows.forEach((r, k) => {
    const t0 = at(WS.i, 'row', k), base = top + k * 64 + 40;
    L.rows.push(lineOf(r[0], T.row, { x: 40, base, at: t0, color: P.ink, what: 'worksheet row label' }), lineOf(r[1], T.value, { x: w - 40, base, align: 'right', at: t0, color: P.ink, what: 'worksheet row value' }));
    if (L.rows.at(-2).width + L.rows.at(-1).width > w - 80 - 24) problems.push(`worksheet row "${r[0]} ${r[1]}" is too wide for the worksheet`);
  });
  L.ruleY = top + s.rows.length * 64 + 18;
  if (RES) {
    const r = FILM.scenes[RES.i];
    L.ruleT = at(RES.i, 'rule');
    L.fig = lineOf(r.value, T.fig, { x: 40, base: L.ruleY + 20 + 100, at: at(RES.i, 'figure'), color: P.ink, max: w - 80, what: 'result value' });
    L.fig.words.forEach((x) => (x.at = L.fig.words[0].at)); // the figure enters as one
    L.caption = lineOf(r.caption, T.caption, { x: 40, base: L.ruleY + 20 + 125 + 50, at: at(RES.i, 'caption'), color: P.ink, max: w - 80, what: 'result caption' });
    L.hlT = at(RES.i, 'stroke');
    // the result's stroke: over the figure, or under it in the `underline` variant
    L.hl = FILM.highlight === 'underline' ? [28, L.ruleY + 20 + 100 + 10, L.fig.width + 24, 10] : [28, L.ruleY + 20 + 24, L.fig.width + 24, 84];
    L.h = Math.max(WORK.h, L.ruleY + 20 + 125 + 50 + 40);
  } else L.h = Math.max(WORK.h, L.ruleY + 40);
  if (Y0 + L.h > BOTTOM) problems.push(`the worksheet is ${L.h} px tall; it must end above y ${BOTTOM}: fewer rows`);
  L.inT = WS.start; L.outT = LEDGER ? LEDGER.start : LOCK.start;
  WSL = L;
};
const paintWorksheet = (g, t, x, y) => {
  const L = WSL;
  edges(g, x, y, L.w, L.h);
  paper(g, x, y, L.w, L.h, { ruled: true });
  g.save();
  g.translate(x, y);
  drawLine(g, L.title, t);
  if (t >= L.tabT) {
    const { a, s } = stampScale(t, L.tabT), tw = widthOf(L.tabText, T.tab) + 20;
    g.save(); g.translate(L.w - 40 - tw / 2, 42 + 18); g.scale(s, s); g.globalAlpha = a;
    g.fillStyle = P.accent; g.fillRect(-tw / 2, -18, tw, 36);
    setType(g, T.tab); g.fillStyle = P.onAccent; g.textBaseline = 'alphabetic'; g.fillText(L.tabText, -tw / 2 + 10, 9);
    g.restore();
  }
  L.rows.forEach((r) => drawLine(g, r, t));
  if (L.ruleT != null && t >= L.ruleT) {
    const u = expOut(progress(t, L.ruleT, C.rule));
    g.fillStyle = P.ink; g.fillRect(40, L.ruleY, (L.w - 80) * u, 2);
  }
  if (L.fig) {
    drawLine(g, L.fig, t);
    drawLine(g, L.caption, t);
    if (t >= L.hlT) {
      const u = ease1io(progress(t, L.hlT, CB.stroke * B));
      g.save(); g.beginPath(); g.rect(L.hl[0] - 2, L.hl[1] - 2, L.hl[2] * u + 4, L.hl[3] + 4); g.clip();
      g.globalCompositeOperation = 'multiply'; g.fillStyle = P.accent; g.beginPath(); poly(g, L.hl); g.fill();
      g.restore();
    }
  }
  g.restore();
};

// The slip: the figure's own pixels lift off the page (≤ 1.2 × the sheet's scale, so never past the zoom cap), one
// frame later the same figure is set in code on the same paper (its colour and its ink sampled from the region,
// the type registered on the ink box), and it is carried along the corridor above the sheets to the worksheet.
let SLIPC = null; // the code-set slip at its landed size
const buildSlip = () => {
  if (!SLIP) return;
  const img = SLIP.owner.img, [rx, ry, rw, rh] = SLIP.region;
  const probe = document.createElement('canvas'); probe.width = rw; probe.height = rh;
  const pc = probe.getContext('2d', { willReadFrequently: true });
  pc.drawImage(img, rx, ry, rw, rh, 0, 0, rw, rh);
  const d = pc.getImageData(0, 0, rw, rh).data;
  let best = 1e9, inkC = [0, 0, 0];
  for (let k = 0; k < d.length; k += 4) { const l = d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11; if (l < best) { best = l; inkC = [d[k], d[k + 1], d[k + 2]]; } }
  const pap = [d[0], d[1], d[2]];
  const R = 2, c = document.createElement('canvas'); c.width = Math.round(SLIP.w * R); c.height = Math.round(SLIP.h * R);
  const g = c.getContext('2d');
  g.fillStyle = `rgb(${pap})`; g.fillRect(0, 0, c.width, c.height);
  const [ix, iy, iw, ih] = SLIP.ink, k = SLIP.kf * R;
  g.font = `700 100px "${FAM.sans}"`;
  const m = g.measureText(SLIP.text), mh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const size = (100 * ih * k) / mh;
  g.font = `700 ${size}px "${FAM.sans}"`;
  const m2 = g.measureText(SLIP.text);
  const sx = (iw * k) / (m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight);
  g.save(); g.translate((ix - rx) * k, (iy - ry) * k + m2.actualBoundingBoxAscent); g.scale(sx, 1);
  g.fillStyle = `rgb(${inkC})`; g.fillText(SLIP.text, m2.actualBoundingBoxLeft, 0); g.restore();
  SLIPC = c;
};
// the slip's place at t: [x, y, scale relative to its landed size, phase]
const slipAt = (t) => {
  const s = SLIP, e = s.owner, sh = e.sh;
  const [lx, ly] = sh.pt(s.region[0], s.region[1]);
  const s0 = sh.scale / s.kf, x0 = X0 + lx, y0 = Y0 + ly;
  if (t < s.swapT) {
    const u = 1 - (1 - progress(t, s.liftT, s.swapT - s.liftT)) ** 2, s1 = s0 * 1.2;
    const sc = lerp(s0, s1, u);
    return [x0 - (sc - s0) * s.w / 2, y0 - (sc - s0) * s.h / 2 - 18 * u, sc, 'pixels'];
  }
  const s1 = s0 * 1.2, xA = x0 - (s1 - s0) * s.w / 2, yA = y0 - (s1 - s0) * s.h / 2 - 18;
  const D = s.landT - s.swapT, a1 = s.swapT + D * 0.4, a2 = a1 + D * 0.333;
  const sC = Math.min(0.55, 34 / s.h), yC = 254;
  if (t < a1) { const u = 1 - (1 - progress(t, s.swapT, a1 - s.swapT)) ** 2; return [xA, lerp(yA, yC, u), lerp(s1, sC, u), 'code']; }
  if (t < a2) { const u = ease2io(progress(t, a1, a2 - a1)); return [lerp(xA, s.slot[0], u), yC, sC, 'code']; }
  if (t < s.landT) { const u = progress(t, a2, s.landT - a2) ** 2; return [s.slot[0], lerp(yC, s.slot[1], u), lerp(sC, 1, u), 'code']; }
  return [s.slot[0], s.slot[1], popScale(t, s.pops), 'landed'];
};
const paintSlip = (g, t, dy) => {
  if (!SLIP || t < SLIP.liftT) return;
  const [x, y, k, phase] = slipAt(t), s = SLIP;
  g.save();
  if (phase === 'landed' && k !== 1) { g.translate(x + s.w / 2, y + dy + s.h / 2); g.scale(k, k); g.translate(-s.w / 2, -s.h / 2); }
  else { g.translate(x, y + dy); if (phase !== 'landed') g.scale(k, k); }
  g.shadowColor = 'rgba(0,0,0,0.28)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  g.fillStyle = P.paperEdge; g.fillRect(-1, -1, s.w + 2, s.h + 2);
  g.shadowColor = 'transparent';
  if (phase === 'pixels') {
    const [rx, ry, rw, rh] = s.region;
    g.imageSmoothingQuality = 'high';
    g.drawImage(s.owner.img, rx, ry, rw, rh, 0, 0, s.w, s.h);
  } else g.drawImage(SLIPC, 0, 0, s.w, s.h);
  g.restore();
};

// ---------- the index of exhibits ----------
let LG = null;
const buildLedger = () => {
  if (!LEDGER) return;
  const s = FILM.scenes[LEDGER.i], box = ledgerBox(s.rows.length);
  LG = { ...box, inT: at(LEDGER.i, 'deal'), outT: LOCK.start, rows: [], pops: LEDGER.plan.focus === 'tab' ? LEDGER.pops.map((p) => LEDGER.start + p) : [] };
  s.rows.forEach(([n, text, src], k) => {
    const t0 = at(LEDGER.i, 'tab', k);
    const srcL = lineOf(src, T.source, { x: box.w - 64, base: 58 + k * 92 + 26, align: 'right', at: t0 + 0.25 * B, color: P.muted });
    const txt = lineOf(text, T.row, { x: 200, base: 50 + k * 92 + 40, at: t0, color: P.ink, max: box.w - 200 - 64 - srcL.width - 40, what: `index row ${k + 1}` });
    LG.rows.push({ tab: `EX. ${n}`, t0, y: 56 + k * 92, txt, srcL });
  });
};
const paintLedger = (g, t, x, y, k = 1) => {
  edges(g, x, y, LG.w, LG.h, k);
  paper(g, x, y, LG.w, LG.h, { ruled: true });
  g.save(); g.translate(x, y);
  LG.rows.forEach((r, n) => {
    if (t >= r.t0) {
      const { a, s } = stampScale(t, r.t0), tw = widthOf(r.tab, T.tab) + 20;
      const p = n === LG.rows.length - 1 ? popScale(t, LG.pops) : 1;
      g.save(); g.translate(64 + tw / 2, r.y + 18); g.scale(s * p, s * p); g.globalAlpha = a;
      g.fillStyle = P.accent; g.fillRect(-tw / 2, -18, tw, 36);
      setType(g, T.tab); g.fillStyle = P.onAccent; g.textBaseline = 'alphabetic'; g.fillText(r.tab, -tw / 2 + 10, 9);
      g.restore();
    }
    drawLine(g, r.txt, t); drawLine(g, r.srcL, t);
  });
  g.restore();
};

// ---------- the lockup ----------
let LK = null;
const buildLockup = () => {
  const s = FILM.scenes[LOCK.i];
  const markH = s.mark ? 240 : 0;
  const nameTop = s.mark ? 560 : 400;
  const name = lineOf(s.name, T.name, { x: W / 2, base: nameTop + 14 + 128, align: 'center', at: at(LOCK.i, 'stroke'), color: P.onAccent, max: READ_W - 88, what: 'lockup name' });
  name.words.forEach((x) => (x.at = -1)); // the name is wiped in with its band, not risen
  const urlTop = nameTop + 236;
  LK = { s, nameTop, name, strokeT: at(LOCK.i, 'stroke'), markT: at(LOCK.i, 'mark'), markH,
    url: lineOf(s.url, T.url, { x: W / 2, base: urlTop + 38, align: 'center', at: at(LOCK.i, 'url'), color: P.onMat, max: READ_W, what: 'lockup url' }),
    cap: s.caption ? lineOf(s.caption, T.cap, { x: W / 2, base: urlTop + 64 + 26, align: 'center', at: at(LOCK.i, 'caption'), color: P.mutedOnMat, max: READ_W, what: 'lockup caption' }) : null,
    endT: LOCK.endMove };
  LK.cap?.words.forEach((x, k) => (x.at = LK.cap.words[0].at + k * 0.05));
};
const paintLockup = (g, t) => {
  if (t < LOCK.start) return;
  const L = LK, s = L.s;
  if (s.mark && t >= L.markT) {
    const img = IMG[s.mark.asset], [cx, cy, cw, ch] = s.mark.crop;
    const sc = Math.min(1 / 0.75, L.markH / ch, READ_W / cw), w = cw * sc, h = ch * sc, x = (W - w) / 2;
    const u = 1 - (1 - progress(t, L.markT, 0.45)) ** 2;
    g.save(); g.beginPath(); g.rect(x, 236, w * u, h); g.clip();
    if (img) g.drawImage(img, cx, cy, cw, ch, x, 236, w, h);
    g.restore();
  }
  if (t >= L.strokeT) {
    const u = ease1io(progress(t, L.strokeT, CB.stroke * B));
    const bw = L.name.width + 88, bx = (W - bw) / 2, top = L.nameTop;
    g.save(); g.beginPath(); g.rect(bx - 2, top - 2, bw * u + 4, 200); g.clip();
    g.fillStyle = P.accent; g.beginPath(); poly(g, [bx, top + 34, bw, 196 - 44], 10); g.fill();
    drawLine(g, L.name, t);
    g.restore();
  }
  drawLine(g, L.url, t);
  if (L.cap) drawLine(g, L.cap, t);
  if (t >= L.endT) {
    const u = expOut(progress(t, L.endT, 0.4));
    g.fillStyle = P.accent; g.fillRect(L.url.x, L.url.base + 12, L.url.width * u, 4);
  }
};

// ---------- the mat: the claim, its terms, the persistent frame ----------
const MAT = []; // lines on the mat
const buildMat = () => {
  const sc = FILM.scenes;
  // the time scene i clears the claim slot (and the terms slot), or null when it leaves them (a worksheet)
  const clearAt = (i, slot) => {
    const s = S[i];
    if (s.type === 'worksheet') return null;
    if (s.type === 'exhibit') return s.enter === 'deal' || i === 0 ? s.start : s.start - 0.5 * CB.turn * B;
    if (s.type === 'claim') return slot === 'terms' ? s.start + (at(i, 'terms') - s.start) - 0.25 * B : s.start;
    if (s.type === 'result') return at(i, 'leave');
    return s.start;
  };
  const nextClear = (i, slot) => { for (let k = i + 1; k < S.length; k++) { const c = clearAt(k, slot); if (c != null) return c; } return Infinity; };
  const claimBase = CLAIM_Y + 46, termsBase = TERMS_Y + 26;
  S.forEach((s, i) => {
    const c = sc[i];
    const phrases = Array.isArray(c.claim) ? c.claim : c.claim ? [c.claim] : [];
    if (!phrases.length) return;
    const claimTs = S[i].plan.moments.filter((m) => m.kind === 'claim').map((m) => s.start + m.t);
    let L;
    if (s.type === 'result' || s.type === 'ledger') { L = lineOf(phrases[0], T.claim, { x: X0, base: claimBase, at: claimTs[0], color: P.onMat }); appendTo(L, phrases[1], claimTs[1]); }
    else L = lineOf(phrases.join(' '), T.claim, { x: X0, base: claimBase, at: claimTs[0], color: P.onMat });
    L.leave = nextClear(i, 'claim');
    if (L.width > READ_W) problems.push(`scene ${i + 1}: the claim "${phrases.join(' ')}" is ${Math.round(L.width)} px; the mat holds ${READ_W}`);
    MAT.push(L);
    if (c.terms) {
      const Lt = lineOf(c.terms, T.terms, { x: X0, base: termsBase, at: at(i, 'terms'), color: P.mutedOnMat, max: READ_W, what: `scene ${i + 1} terms` });
      Lt.leave = nextClear(i, 'terms');
      MAT.push(Lt);
    }
  });
};
const paintHeader = (g, t) => {
  setType(g, T.header); g.fillStyle = P.mutedOnMat; g.textBaseline = 'alphabetic';
  const base = HEADER_Y + 26;
  g.fillText(FILM.meta.slug, X0, base);
  // the page in hand: the old text leaves upward, the new rises in 0.1 s later
  let k = -1;
  for (let n = 0; n < header.length; n++) if (t >= header[n].t) k = n;
  g.save(); g.beginPath(); g.rect(W - X0 - 900, HEADER_Y - 4, 900, 40); g.clip();
  g.textAlign = 'right';
  if (k >= 0) {
    const h = header[k], u = expOut(progress(t, h.t + (k ? 0.1 : 0), C.header));
    if (k > 0 && t < h.t + 0.2) { const v = progress(t, h.t, 0.2); g.fillText(header[k - 1].text, W - X0, base - 40 * v * v); }
    if (t >= h.t + (k ? 0.1 : 0)) g.fillText(h.text, W - X0, base + 40 * (1 - u));
  }
  g.restore();
  g.textAlign = 'left';
};

// ---------- the frame ----------
const off = (() => { const m = new Map(); return (name, w = W, h = H) => { let c = m.get(name); if (!c) { c = document.createElement('canvas'); m.set(name, c); } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return c; }; })();

// the y offset of exhibit e at t (Infinity: not on the mat), and whether it is mid-change
const exhibitY = (e, t) => {
  if (t < e.inT) return Infinity;
  if (e.outHow === 'exit') { if (t >= e.outT + C.exit) return Infinity; }
  else if (t >= (e.outHow === 'change' ? e.outT + CB.turn * B : e.outT)) return Infinity;
  const yIn = e.inHow === 'deal' ? dealY(t, e.inT) : 0;
  const yOut = e.outHow === 'exit' ? exitY(t, e.outT) : 0;
  return yIn + yOut;
};

const paintFrame = (g, t) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = P.mat; g.fillRect(0, 0, W, H);
  // sheets, bottom to top: exhibits (a sheet being turned lies over the one it reveals), the worksheet, the slip, the index
  const items = [];
  for (const i of EXS) {
    const e = EX[i], y = exhibitY(e, t);
    if (!Number.isFinite(y)) continue;
    const turning = e.outHow === 'change' && t >= e.outT;
    items.push({ z: turning ? e.inT + 1e3 : e.inT, draw: () => {
      if (!turning) return paintSheet(g, e, t, X0, Y0 + y);
      const c = off('turn', e.sh.w, e.sh.h + 90), cg = c.getContext('2d');
      cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, c.width, c.height);
      paintSheet(cg, e, t, 0, 0, { withEdges: false });
      e.change.draw(g, { sheet: c, x: X0, y: Y0, w: c.width, h: c.height, p: (t - e.outT) / (CB.turn * B), opts: { ...e.changeOpts, shade: P.mat } });
    } });
  }
  if (WSL && t >= WSL.inT) {
    const y = dealY(t, WSL.inT) + exitY(t, WSL.outT);
    if (t < WSL.outT + C.exit) items.push({ z: WSL.inT, draw: () => { paintWorksheet(g, t, WSL.x, WSL.y + y); } });
  }
  if (SLIP && t >= SLIP.liftT && t < WSL.outT + C.exit) items.push({ z: 1e4, draw: () => paintSlip(g, t, exitY(t, WSL.outT)) });
  if (LG && t >= LG.inT && t < LG.outT + CB.stack * B) {
    const k = 1 - clamp(progress(t, LG.outT, CB.stack * B * 0.5));
    items.push({ z: 2e4, draw: () => paintLedger(g, t, LG.x, LG.y + dealY(t, LG.inT) + exitY(t, LG.outT, CB.stack * B), k) });
  }
  items.sort((a, b) => a.z - b.z).forEach((x) => x.draw());
  MAT.forEach((L) => drawLine(g, L, t));
  paintLockup(g, t);
  paintHeader(g, t);
};

// frame-level page changes: [from, to) windows, each mixing the frame as it runs with the next exhibit's first frame
const FRAMES = [];
const buildFrames = () => {
  for (const i of EXS) {
    const s = S[i];
    if (i === 0 || s.enter === 'deal') continue;
    const ch = changeOf(s.enter);
    if (ch?.level === 'frame') FRAMES.push({ i, a: s.start - CB.turn * B, b: s.start, ch });
  }
};

// px per frame of the fastest moving sheet or slip at t (for the motion blur)
const posAt = (t) => {
  const v = [];
  for (const i of EXS) { const y = exhibitY(EX[i], t); v.push(Number.isFinite(y) ? Math.min(y, 1200) : 1200); const e = EX[i]; v.push(e.outHow === 'change' && e.change?.travel && t >= e.outT && t < e.outT + CB.turn * B ? e.change.travel({ w: e.sh.w, h: e.sh.h + 90, p: (t - e.outT) / (CB.turn * B), opts: e.changeOpts }) : 0); }
  if (WSL) v.push(t >= WSL.inT ? Math.min(1200, dealY(t, WSL.inT) + exitY(t, WSL.outT)) : 1200);
  if (SLIP) { const [x, y] = t >= SLIP.liftT ? slipAt(t) : [0, 0]; v.push(x, y); }
  if (LG) v.push(t >= LG.inT ? Math.min(1200, dealY(t, LG.inT) + exitY(t, LG.outT, CB.stack * B)) : 1200);
  return v;
};
const speedAt = (t) => { const a = posAt(t), b = posAt(t - 1 / 30); let m = 0; a.forEach((x, k) => { const d = Math.abs(x - b[k]); if (d < 1000) m = Math.max(m, d); }); return m; };

// ---------- ready / render ----------
let laidOut = false;
const loadImage = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error(`cannot load ${src}`)); im.src = src; });
export const ready = async () => {
  for (const [id, a] of Object.entries(FILM.assets)) {
    try { IMG[id] = await loadImage(a.file); await IMG[id].decode?.(); }
    catch (e) { problems.push(`assets.${id}: ${e.message}`); }
    if (IMG[id] && (IMG[id].naturalWidth !== a.size[0] || IMG[id].naturalHeight !== a.size[1])) problems.push(`assets.${id}: the file is ${IMG[id].naturalWidth} × ${IMG[id].naturalHeight}, content.js says ${a.size.join(' × ')}`);
  }
  TOOTH = makeTooth();
  build(); buildWorksheet(); buildSlip(); buildLedger(); buildLockup(); buildMat(); buildFrames();
  laidOut = true;
  if (problems.length) {
    const lines = ['DOSSIER: CONTENT DOES NOT FIT — see TEMPLATE.md', ...problems];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-margin-error');
    setTimeout(() => { throw new Error(`dossier: ${problems.join('; ')}`); }, 0);
  }
};

const frameAt = (g, t) => {
  const f = FRAMES.find((x) => t >= x.a && t < x.b);
  if (!f) return paintFrame(g, t);
  const A = off('change-A'), Bc = off('change-B');
  paintFrame(A.getContext('2d'), t);
  paintFrame(Bc.getContext('2d'), f.b);
  g.setTransform(1, 0, 0, 1, 0, 0);
  f.ch.draw(g, { from: A, to: Bc, p: (t - f.a) / (f.b - f.a), palette: P });
};

export const render = (ctx, t) => {
  if (!laidOut) return;
  subframes(ctx, frameAt, t, { speed: speedAt, shutter: 0.5, maxN: 16 });
};

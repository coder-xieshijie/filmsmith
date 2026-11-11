// split.js — the engine of the split bricks: one movable seam between the input side (paper: what is written) and
// the result side (real frames and pages on the bench: what that makes). Layout, type, the rail every line rises
// through, the typed line and its caret, the result chip, the grips, real assets placed in their pane under the
// zoom cap, the pane painters, and the six seam moves over the runtime's hand-offs (split-open, louvre, wipe-line,
// split-branch, diff-slider; seam.js draws the seam, solid or stitched). Times are seconds from a scene's start.
// Pure: every function is of its arguments.
// From the split template (assets/templates/split/choreo.js layout, placeOf; film.js type, rail, typed, caret,
// chip, grips, painters, inputOf, reportPane; moves.js adapters): geometry and timings are the template's; the
// assets are slots (an image URL with its chip), not content.js's manifest.
import { clamp, lerp, cubicInOut, expOut } from '../../../motion.js';
import { rrect } from '../../../handoffs/util.js';
import { clipRect, seamV, seamH } from '../../../handoffs/seam.js';
import { placeholderFrame } from '../../../handoffs/stage.js';
import splitOpen from '../../../handoffs/split-open.js';
import louvre from '../../../handoffs/louvre.js';
import wipeLine from '../../../handoffs/wipe-line.js';
import splitBranch from '../../../handoffs/split-branch.js';
import diffSlider from '../../../handoffs/diff-slider.js';
import { fontStack, readTime, wrap } from '../../lang.js';
import LOOK from '../../look/diff-paper/look.js';

export { clamp, lerp, cubicInOut, expOut, clipRect, seamV, seamH, readTime };
export const W = 1920, H = 1080, CAP = 4 / 3;
export const TEXT_IN = 0.36, TEXT_OUT = 0.2, SETTLE = 0.3;
export const CPS = 28, PLUS_CPS = 42;
export const MARGIN = 96;
export const L = {
  X: 900, XF: 1000, YD: 260, XD: 1320, XE: 620, label: 84,
  claimA: [330, 404], prompt: 600,
  claimB: 200, listY: 300, listStep: 50, listX: 136,
  claimC: 170, inputY: 236, inputStep: 46, inputX: 176,
  cmdY: 190,
  reportX: 1360, reportLabel: 310, claimD: [390, 464], reportY: 556, reportStep: 45, resultY: 756,
  diffY: 150, diffStep: 52, diffBar: MARGIN, diffNum: 120, diffSign: 174, diffCode: 200, claimE: [140, 214], claimEX: 1040,
  name: 470, install: 580, url: 640, line: 720,
};
export const YC = (n) => L.inputY + n * L.inputStep;     // file: the horizontal seam under n quoted lines
export const PANE = {
  request: () => ({ x: L.X, y: 0, w: W - L.X, h: H }),
  pick: () => ({ x: L.X, y: 0, w: W - L.X, h: H }),
  file: (s) => ({ x: 0, y: YC((s.lines || []).length || 4), w: W, h: H - YC((s.lines || []).length || 4) }),
  render: () => ({ x: 0, y: L.YD, w: L.XD, h: H - L.YD }),
  diff: () => ({ x: 0, y: L.YD, w: W, h: H - L.YD }),
  lockup: () => ({ x: L.XF, y: 0, w: W - L.XF, h: H }),
};
export const paneOf = (type, s) => PANE[type](s);

// ── type ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Archivo on its width axis, semi-expanded, for claims and the name; JetBrains Mono for code, commands, paths, chips
export const fonts = (lang) => {
  const d = fontStack(LOOK, 'display', lang), m = fontStack(LOOK, 'mono', lang);
  return {
    name: { family: d, weight: 700, size: 105, stretch: 'semi-expanded', track: lang === 'zh' ? 0 : -2 },
    claim: { family: d, weight: 700, size: 59, stretch: 'semi-expanded', track: lang === 'zh' ? 0 : -0.6 },
    req: { family: m, weight: 500, size: 44 }, code: { family: m, weight: 500, size: 33 }, codeB: { family: m, weight: 700, size: 33 },
    label: { family: m, weight: 500, size: lang === 'zh' ? 28 : 25 }, labelB: { family: m, weight: 700, size: lang === 'zh' ? 28 : 25 },
    chip: { family: m, weight: 500, size: 25 },
  };
};
export const setFont = (g, s) => {
  g.font = `${s.stretch ?? ''} ${s.weight} ${s.size}px ${s.family}`.trim();
  if ('fontStretch' in g) g.fontStretch = s.stretch ?? 'normal';
  if ('letterSpacing' in g) g.letterSpacing = `${s.track ?? 0}px`;
};
export const text = (g, str, x, y, s, color, align = 'left') => { g.save(); setFont(g, s); g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(str, x, y); g.restore(); };
export const width = (g, str, s) => { g.save(); setFont(g, s); const w = g.measureText(str).width; g.restore(); return w; };
export const chw = (g, s) => width(g, '0', s);
// a claim phrase wrapped to the width it has (Chinese wraps by character; English never wraps at the limits)
export const lines = (g, str, s, maxW, lang) => { g.save(); setFont(g, s); const out = wrap(g, str, { ...s }, maxW, lang); g.restore(); return out.length ? out : [str]; };

// A line that rises into place through its own rail (TEXT_IN, expo out) and leaves upward (TEXT_OUT), clipped to it
export const rail = (g, str, x, y, s, color, tin, tout, t, align = 'left', clipX = [0, W]) => {
  if (!str || t < tin || (tout != null && t >= tout + TEXT_OUT)) return;
  const h = s.size * 1.3, top = y - s.size * 1.02;
  const enter = 1 - expOut(clamp((t - tin) / TEXT_IN)), leave = tout != null && t > tout ? Math.pow(clamp((t - tout) / TEXT_OUT), 2) : 0;
  clipRect(g, clipX[0], top, clipX[1] - clipX[0], h, () => text(g, str, x, y + (enter - leave) * h, s, color, align));
};
export const typed = (str, t, t0, cps) => str.slice(0, Math.max(0, Math.min(str.length, Math.floor((t - t0) * cps + 1e-6))));
export const caret = (g, x, base, size, color) => { g.fillStyle = color; g.fillRect(x, base - size * 0.95, 4, size * 1.18); };

// ── results ──────────────────────────────────────────────────────────────────────────────────────────────────────
// an asset param: { image (URL), size [w, h], kind ('frame' | 'render' | 'page'), focus [x, y] (asset px kept nearest
// the pane's centre), at [x, y] (film px of its top-left, clamped so it still covers the pane), chip (its source) };
// without an image, the neutral numbered placeholder frame n
const loadImg = async (src) => { const im = new Image(); im.src = src; await im.decode(); return im; };
export const keyOf = (a) => (a ? a.image || `n${a.n ?? 0}` : null);
export const assetOf = async (a, n = 0) => {
  if (!a) return null;
  const img = typeof a.image === 'string' ? await loadImg(a.image) : a.image || placeholderFrame(a.n ?? n);
  const size = a.size || [img.naturalWidth || img.width, img.naturalHeight || img.height];
  return { img, size, kind: a.kind || 'frame', focus: a.focus || null, at: a.at || null, chip: a.chip || `sample.mp4 · 0:0${(a.n ?? n) % 10}`, key: keyOf(a) };
};
// where an asset sits in a pane: a frame covers the pane at scale 1 (≤ the cap) with its focus as near the pane's
// centre as covering allows (or at its `at`); a page is contained, 60 px clear of the seam
export const placeOf = (A, pane) => {
  const [aw, ah] = A.size;
  if (A.kind === 'page') {
    const k = Math.min(CAP, (pane.w - 120) / aw, (pane.h - 160) / ah);
    return { x: pane.x + 60, y: Math.round(pane.y + (pane.h - ah * k) / 2), k };
  }
  const k = Math.min(CAP, Math.max(1, pane.w / aw, pane.h / ah));
  const [fx, fy] = A.focus ?? [aw / 2, ah / 2];
  const cx = pane.x + pane.w / 2, cy = pane.y + pane.h / 2;
  const fit = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const x = fit(A.at ? A.at[0] : cx - fx * k, pane.x + pane.w - aw * k, pane.x);
  const y = fit(A.at ? A.at[1] : cy - fy * k, pane.y + pane.h - ah * k, pane.y);
  return { x: Math.round(x), y: Math.round(y), k };
};
export const drawAsset = (g, A, pl, dx = 0, dy = 0) => {
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(A.img, pl.x + dx, pl.y + dy, A.size[0] * pl.k, A.size[1] * pl.k);
};
// a pane painter (the hand-offs' contract): the bench, then the asset at its place in the pane, shifted by dx, dy
export const painter = (A, pane, C) => (g, dx = 0, dy = 0) => { g.fillStyle = C.bench; g.fillRect(0, 0, W, H); if (A) drawAsset(g, A, placeOf(A, pane), dx, dy); };

// the result chip: where the result pane's content comes from, on a bench tab next to the seam's grip (mono 25)
export const chip = (g, F, C, str, x, y, align = 'left', dy = 0) => {
  if (!str) return;
  const w = width(g, str, F.chip) + 28, x0 = align === 'left' ? x : x - w;
  clipRect(g, x0 - 2, y, w + 4, 40, () => {
    g.fillStyle = C.bench; rrect(g, x0, y + dy, w, 40, 4); g.fill();
    text(g, str, x0 + 14, y + dy + 28, F.chip, C.onBench);
  });
};
export const gripV = (g, C, x) => { g.fillStyle = C.accent; rrect(g, x - 12, 40, 24, 64, 4); g.fill(); g.fillStyle = C.key; g.fillRect(x - 5, 58, 2, 28); g.fillRect(x + 3, 58, 2, 28); };
export const gripH = (g, C, y) => { g.fillStyle = C.accent; rrect(g, W - 104, y - 12, 64, 24, 4); g.fill(); g.fillStyle = C.key; g.fillRect(W - 86, y - 5, 28, 2); g.fillRect(W - 86, y + 3, 28, 2); };
export const seamColors = (Cl, stitch) => ({ ...Cl, key: Cl.key || Cl.paper || Cl.ground, bench: Cl.bench || Cl.panel, stitch: !!stitch });

// ── the seam moves (the runtime hand-offs, params as the template's moves.js adapters) ─────────────────────────────
export const MOVES = { open: { m: splitOpen, beats: 1.75 }, change: { m: louvre, beats: 2, P: { n: 9, stagger: 0.07 } }, push: { m: louvre, beats: 0.75, P: { n: 1, stagger: 0 } }, wipe: { m: wipeLine, beats: 2 }, branch: { m: splitBranch, beats: 2, P: { stage: 0.5 } }, slide: { m: diffSlider, beats: 2 } };
export const moveOf = (role, params) => {
  const { m, P: fixed = {} } = MOVES[role], P = { ...m.defaults, ...fixed, ...params };
  return { draw: (g, p) => m.paint(g, m.at(clamp(p), P), P), track: (p) => m.track(m.at(clamp(p), P), P) };
};

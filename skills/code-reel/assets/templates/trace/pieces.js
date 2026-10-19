// pieces.js — the reusable renderer pieces: board of chips, histogram, rule list, token bar, captions,
// summary number, thesis card, HUD and camera. They draw whatever the run computed (run.js) on the clock
// that timeline.js laid out. Every function is a pure function of t.
import { clamp, lerp, smooth, expOut, cubicInOut, accelerate } from './lib/motion.js';
import { createHandoff, drawHandoff, progressAt } from './lib/handoffs/index.js';
import * as fx from './fx.js';
import { BIG_DEFAULT, BIG, FLIGHT, MORPH, EXIT, LAND_E, PATH, boardSource } from './timing.rules.js';

// The landing settle (2026-10-18): a fused chip swells by SETTLE.amp at most and comes back, critically damped
// (the impulse response x·e^(1−x): one swell, no oscillation), starting on its landing frame; gone in about 0.3 s.
const SETTLE = { amp: 0.035, peak: 0.06, len: 0.4 };
const settleAt = (d) => (d < 0 || d > SETTLE.len ? 0 : SETTLE.amp * (d / SETTLE.peak) * Math.exp(1 - d / SETTLE.peak));

export const W = 1920, H = 1080;
// Type scale (mode card "Type"): label 26 · text 40 · display (chips 54 × the board's scale, summary 76,
// thesis 82). Sizes within 15 % are one level; the content area shows at most three levels plus the label level.
export const TYPE = { label: 26, text: 40, textMin: 34, chip: 54, big: 76, thesis: 82, thesisMin: 56, title: 46, subtitle: 30 };
const X_LABEL = 130; // left margin: title, captions, the token bar's label and count
// right third: histogram and rule list
const HX = 1290, RX = 1800, HY = 250, HROW = 62, RULE_DY = 42;
// the board: scaled until its widest row fills the left two thirds (or its rows fill the band), centred there
const BOARD_L = 130, BOARD_R = 1220, BAND_T = 176, BAND_B = 806, SC_MAX = 1.3;
const BAR_X = 300, BAR_Y = 950, BAR_H = 30, CNT_Y = BAR_Y + 34;
const CAP_Y = 872, CAP_W = 1400, BIG_Y = 806;
// a caption that rides path-type is plain text centred on its line, which spans the caption measure (x 130–1530)
export const PATH_X = X_LABEL + CAP_W / 2;
export const CAP_STYLE = { size: TYPE.text, fam: fx.SANS, weight: 500, markWeight: 600, ls: -0.3 };
// dimmed regions keep their text readable: shapes take the region's opacity, text never drops below the
// opacity at which it measures DIM_CONTRAST against the ground (mode principle 5; legibility #8)
const DIM_CONTRAST = 3.2;

// The board's scale: its widest row (over the whole run and the probe) fills the left two thirds, or its rows
// and the probe row fill the band, whichever comes first, up to SC_MAX. tools/validate.mjs reads it too.
const MONO_ADV = 0.6; // JetBrains Mono advance per em
const LABEL_GAP = 28, HCH1 = 82, PITCH1 = 106, PROBE_GAP1 = 128;
export const boardGeometry = (run, content) => {
  const allRows = [run.rows.map((r) => r.tokens), ...run.steps.map((s) => s.rows.map((r) => r.tokens))];
  const rawW = (toks) => toks.reduce((w, t) => w + t.t.length * 54 * MONO_ADV + 40, 0) + (toks.length - 1) * 14;
  const widest = Math.max(...allRows.flat().map(rawW), ...(run.probe ? [run.probe.tokens, ...run.probe.steps.map((p) => p.tokens)].map(rawW) : [0]));
  const hasProbe = !!run.probe && content.scenes.some((x) => x.type === 'probe');
  const labelW = Math.max(...run.rows.map((r) => r.label.length), hasProbe ? run.probe.label.length : 0) * TYPE.label * MONO_ADV;
  const blockH1 = HCH1 + (run.rows.length - 1) * PITCH1 + (hasProbe ? PROBE_GAP1 : 0);
  const sc = Math.min(SC_MAX, (BOARD_R - BOARD_L - labelW - LABEL_GAP) / widest, (BAND_B - BAND_T) / blockH1);
  return { allRows, widest, hasProbe, labelW, blockH1, sc, chip: 54 * sc, boardW: labelW + LABEL_GAP + widest * sc };
};
// the right third's width, for validate's rule-line and note checks
export const COLUMN = { x: HX, w: RX - HX, ruleIndent: 44, labelAdv: TYPE.label * MONO_ADV };

// 1 − x, never below 0: canvas ignores a negative globalAlpha and keeps the previous value, so a float error
// such as 1 − smooth(0.99992) = −4e-16 would draw a sub-frame fully opaque
const off = (x) => Math.max(0, 1 - x);

// The path-type hand-offs, one per `enter: 'path'` window, prepared once the fonts have loaded (they measure text).
// Each carries the outgoing scene's last caption round the loop and brings in the incoming scene's first.
export const prepareHandoffs = async ({ pal, S, fills }) => {
  const fillS = (s) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in fills ? String(fills[k]) : m));
  const out = [];
  const g = document.createElement('canvas').getContext('2d');
  for (const w of S.windows.filter((x) => x.name === 'path' && x.from >= 0 && x.to >= 0)) {
    const from = S.captions[w.from], to = S.captions[w.to];
    const a = captionLine(from, fillS), z = captionLine(to, fillS);
    // the line is a little longer than the longer sentence; the loop's circumference takes the longer sentence,
    // so the sentence rides round the loop as it rolls (as in the approved sample), within PATH.radius
    const len = Math.max(fx.measureRich(g, a, CAP_STYLE), fx.measureRich(g, z, CAP_STYLE));
    const radius = Math.max(PATH.radius[0], Math.min(PATH.radius[1], (len + 40) / (2 * Math.PI)));
    // the loop hangs below the line with its letters outside it: the line sits high enough that neither reaches the
    // token bar (a path caption's baseline is up to ~80 px above the other captions')
    const y = Math.min(CAP_Y + PATH.lift, BAR_Y - 14 - radius - PATH.lift - CAP_STYLE.size);
    const h = await createHandoff('path-type', {
      from: { text: a }, to: { text: z },
      x: PATH_X, y, length: Math.max(len + 120, 2 * Math.PI * radius), radius, lift: PATH.lift, lineWidth: PATH.lineWidth,
      font: { family: CAP_STYLE.fam, weight: CAP_STYLE.weight, size: CAP_STYLE.size, spacing: CAP_STYLE.ls },
      colors: { ground: pal.ground, ink: pal.text, accent: pal.dim }, ground: false,
    });
    out.push({ w, from: w.from, to: w.to, h });
  }
  return out;
};
// a caption's whole line, filled; plain (markup stripped) when it rides a path
export const captionLine = (c, fillS) => {
  const s = c.phrases.map((p) => fillS(p.raw)).join(' ');
  return c.plain ? fx.plain(s) : s;
};

export const createPieces = ({ pal, run, S, content, fills, paths = [] }) => {
  let ctx = null;
  const setCtx = (c) => { ctx = c; };
  const fill = (s) => String(s ?? '').replace(/\{(\w+)\}/g, (m, k) => (k in fills ? String(fills[k]) : m));
  const kindCol = (k) => ({ base: pal.base, learned: pal.learned, active: pal.active, unseen: pal.unseen, op: pal.dim, dim: pal.dim, text: pal.text }[k] ?? pal.text);
  const textCols = { text: pal.text, dim: pal.dim, base: pal.base, active: pal.active, learned: pal.learned, unseen: pal.unseen };

  // ---------------------------------------------------------------- readable text in dimmed regions
  const floors = new Map();
  const textFloor = (col) => {
    if (!floors.has(col)) floors.set(col, col.startsWith('#') ? fx.alphaFor(col, pal.ground, DIM_CONTRAST) : fx.alphaFor(pal.dim, pal.ground, DIM_CONTRAST));
    return floors.get(col);
  };
  // a region at opacity a (its focus): text keeps max(a, floor); below a = 0.25 the region is leaving and the
  // text fades with it
  const lift = (a, col) => {
    if (a <= 0) return 0;
    const f = Math.max(0.25, textFloor(col));
    return a < 0.25 ? (a / 0.25) * f : Math.max(a, f);
  };
  let regionA = 1; // the opacity of the region being drawn (board, bar)
  const withText = (col, fn) => {
    const g0 = ctx.globalAlpha;
    const k = regionA > 0 && regionA < 0.999 ? lift(regionA, col) / regionA : 1;
    ctx.globalAlpha = Math.min(1, g0 * k);
    fn();
    ctx.globalAlpha = g0;
  };

  // ---------------------------------------------------------------- chip geometry: the board fills its region
  const { allRows, widest, hasProbe, labelW, blockH1, sc } = boardGeometry(run, content);
  const CS = 54 * sc, CH = CS * MONO_ADV, PAD = 20 * sc, GAP = 14 * sc, HCH = HCH1 * sc, PITCH = PITCH1 * sc;
  const blockW = labelW + LABEL_GAP + widest * sc;
  const X0 = BOARD_L + (BOARD_R - BOARD_L - blockW) / 2 + labelW + LABEL_GAP; // first chip of every row
  const LABEL_R = X0 - LABEL_GAP; // row labels, right-aligned
  const top = BAND_T + (BAND_B - BAND_T - blockH1 * sc) / 2;
  const rowY = (r) => top + HCH / 2 + r * PITCH;
  const probeY = rowY(run.rows.length - 1) + PROBE_GAP1 * sc;
  const chipW = (tok) => tok.t.length * CH + 2 * PAD;
  const layoutRow = (toks, x0 = X0) => { const xs = []; let x = x0; for (const tk of toks) { xs.push(x); x += chipW(tk) + GAP; } return xs; };
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2))); };

  // ---------------------------------------------------------------- stroke variant: content.stroke (2026-10-19)
  // 'vector' (default): exact rounded outlines. 'sketch': hand-drawn outlines after rough.js and Handy (Wood et al.
  // 2012): each edge of a box is drawn twice as a slightly bowed line whose ends wander and overshoot the corner by a
  // few pixels; fills follow the first pass. The wobble is seeded by the object's identity (a chip is the span of
  // original units it covers), never by time or position, so a chip that slides keeps its outline and a landed chip
  // never boils (C6; Bénard et al. 2011). A length that encodes a quantity (a histogram segment) keeps its exact
  // ends: only its long edges wobble (Wood et al. 2012: sketchiness worsens size judgements). The token bar's
  // cells and all text stay exact.
  const SKETCH = content.stroke === 'sketch';
  const hash = (...ns) => { let h = 0x811c9dc5; for (const n of ns) { h = Math.imul(h ^ (n | 0), 0x01000193) >>> 0; h ^= h >>> 13; } return h >>> 0; };
  const jit = (seed, k) => { // seeded uniform in [-1, 1)
    let x = hash(seed, k, 0x9e37);
    x = Math.imul(x ^ (x >>> 16), 0x7feb352d); x = Math.imul(x ^ (x >>> 15), 0x846ca68b); x ^= x >>> 16;
    return (x >>> 0) / 2147483648 - 1;
  };
  // amplitudes in px at board scale 1: endpoint wander across the edge, overshoot past the corner, bow at mid-edge
  const SK = { m: 2, over: 4, bow: 3, pass2: 0x5bd1e995 }; // over ≤ 4 keeps the 14 px gap between chips open
  // the four corners' wander and the edges' bows of one box (pass p), as path pieces
  const sketchEdges = (x, y, w, h, id, p, k, exact) => {
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const seed = p ? hash(id, SK.pass2) : id;
    const out = [];
    for (let e = 0; e < 4; e++) {
      const [x1, y1] = pts[e], [x2, y2] = pts[(e + 1) % 4];
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len, nx = -uy, ny = ux;
      // exact: the end edges (e 1, 3) stay where the value puts them, and the long edges do not overshoot them
      const end = exact && e % 2 === 1;
      const m = end ? 0 : Math.min(SK.m * k, len * 0.1), over = exact ? 0 : SK.over * k;
      const o1 = over * (0.5 + 0.5 * jit(seed, e * 8 + 1)), o2 = over * (0.5 + 0.5 * jit(seed, e * 8 + 2));
      const a = [x1 - ux * o1 + nx * m * jit(seed, e * 8 + 3), y1 - uy * o1 + ny * m * jit(seed, e * 8 + 3)];
      const c = [x2 + ux * o2 + nx * m * jit(seed, e * 8 + 4), y2 + uy * o2 + ny * m * jit(seed, e * 8 + 4)];
      const bow = end ? 0 : 2 * jit(seed, e * 8 + 5) * Math.min(SK.bow * k, len * 0.02);
      out.push({ a, c, q: [(a[0] + c[0]) / 2 + nx * bow, (a[1] + c[1]) / 2 + ny * bow] });
    }
    return out;
  };
  const sketchFill = (x, y, w, h, id, k = 1, exact = false) => {
    if (!(w > 0 && h > 0)) return;
    const ed = sketchEdges(x, y, w, h, id, 0, k, exact);
    // the fill runs through the corners without the overshoot
    const corner = (e) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]][e];
    ctx.beginPath(); ctx.moveTo(...corner(0));
    ed.forEach((s, e) => ctx.quadraticCurveTo(s.q[0], s.q[1], ...corner((e + 1) % 4)));
    ctx.closePath(); ctx.fill();
  };
  const sketchStroke = (x, y, w, h, id, k = 1, exact = false, passes = 2) => {
    if (!(w > 0 && h > 0)) return;
    ctx.beginPath();
    for (const p of passes > 1 ? [0, 1] : [0]) for (const s of sketchEdges(x, y, w, h, id, p, k, exact)) { ctx.moveTo(...s.a); ctx.quadraticCurveTo(...s.q, ...s.c); }
    ctx.stroke();
  };
  // identities for the wobble: chip j of row r after step k covers the span SPANS[k + 1][r][j] of the row's original
  // units; a fuse leaves the spans of the chips it does not touch unchanged. The probe row has its own (PSPANS).
  const spansOf = (rows0, later) => {
    const out = [rows0.map((toks) => toks.map((_, i) => [i, i + 1]))];
    later.forEach((rows) => {
      const prev = out[out.length - 1];
      out.push(rows.map((maps, r) => maps.map((m) => [prev[r][m[0]][0], prev[r][m[m.length - 1]][1]])));
    });
    return out;
  };
  const SPANS = SKETCH ? spansOf(run.rows.map((r) => r.tokens), run.steps.map((st) => st.rows.map((r) => r.map))) : null;
  const PSPANS = SKETCH && run.probe ? spansOf([run.probe.tokens], run.probe.steps.map((st) => [st.map])) : null;
  const idsAt = (k, r) => (SKETCH ? SPANS[k + 1][r].map(([a, b]) => hash(11, r, a, b)) : null);
  const pidsAt = (n) => (PSPANS ? PSPANS[n + 1][0].map(([a, b]) => hash(13, a, b)) : null);

  const drawChip = (x, cy, w, label, stroke, o = {}) => {
    const y = cy - HCH / 2;
    ctx.fillStyle = o.fill ?? fx.rgba(stroke.startsWith('#') ? stroke : pal.base, 0.08);
    if (SKETCH) {
      sketchFill(x, y, w, HCH, o.id ?? 0, sc);
      ctx.lineWidth = Math.max(2, 1.9 * sc); ctx.strokeStyle = stroke; ctx.lineCap = 'round';
      sketchStroke(x, y, w, HCH, o.id ?? 0, sc);
    } else {
      rr(x, y, w, HCH, 12 * sc); ctx.fill();
      ctx.lineWidth = Math.max(1.5, 2.5 * sc); ctx.strokeStyle = stroke;
      rr(x, y, w, HCH, 12 * sc); ctx.stroke();
    }
    if (label != null) {
      const col = o.textCol ?? pal.text;
      withText(col, () => {
        ctx.font = fx.font(500, CS, fx.MONO); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha *= o.textAlpha ?? 1;
        ctx.fillText(label, x + w / 2, cy + CS * 0.35);
        ctx.textAlign = 'left';
      });
    }
  };
  const chipText = (s, x, y, align = 'left') => withText(pal.text, () => {
    ctx.font = fx.font(500, CS, fx.MONO); ctx.fillStyle = pal.text; ctx.textBaseline = 'alphabetic'; ctx.textAlign = align;
    ctx.fillText(s, x, y); ctx.textAlign = 'left';
  });
  const dashBox = (x0, x1, cy, a) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = pal.active; ctx.lineWidth = 2; ctx.setLineDash([8 * sc + 2, 7 * sc + 2]);
    if (SKETCH) sketchStroke(x0 - 8 * sc, cy - HCH / 2 - 9 * sc, x1 - x0 + 16 * sc, HCH + 18 * sc, hash(17, Math.round(cy), Math.round(x0)), sc, false, 1); // one pass: a doubled dash reads as noise
    else { rr(x0 - 8 * sc, cy - HCH / 2 - 9 * sc, x1 - x0 + 16 * sc, HCH + 18 * sc, 18 * sc); ctx.stroke(); }
    ctx.restore();
  };

  // a chip drawn scaled about its centre by 1 + z (the landing settle)
  const scaled = (x, cy, w, z, fn) => {
    if (!(z > 1e-4)) return fn();
    ctx.save(); ctx.translate(x + w / 2, cy); ctx.scale(1 + z, 1 + z); ctx.translate(-(x + w / 2), -cy); fn(); ctx.restore();
  };
  // one row: static (with highlights) or morphing old → new by map, e = 0..1. settle = { set, z }: the new chips
  // (indices in the row after the step) that just landed, and their swell. opt (2026-10-19): skip = a Set of chip
  // indices not drawn (a chip handed to the thesis morph); ids = { old, neu }, the chips' identities for the sketch
  // stroke
  const drawRow = (oldT, newT, map, e, cy, hi = [], hiAmt = 0, settle = null, opt = null) => {
    const zOf = (j) => (settle && settle.set.has(j) ? settle.z : 0);
    const idO = (i) => opt?.ids?.old?.[i], idN = (j) => opt?.ids?.neu?.[j];
    if (!map || e <= 0) {
      const xs = layoutRow(oldT);
      const inHi = new Set();
      hi.forEach(([i, n]) => { for (let j = i; j < i + n; j++) inHi.add(j); });
      oldT.forEach((tk, i) => {
        if (opt?.skip?.has(i)) return;
        const on = inHi.has(i) && hiAmt > 0;
        const col = on ? fx.mix(kindCol(tk.k), pal.active, hiAmt) : kindCol(tk.k);
        const o = on ? { fill: fx.rgba(pal.active, 0.12 * hiAmt) } : {};
        if (SKETCH) o.id = idO(i);
        scaled(xs[i], cy, chipW(tk), zOf(i), () => drawChip(xs[i], cy, chipW(tk), opt?.noLabel ? null : tk.t, col, o));
      });
      if (hiAmt > 0) hi.forEach(([i, n]) => dashBox(xs[i], xs[i + n - 1] + chipW(oldT[i + n - 1]), cy, hiAmt));
      return;
    }
    const xo = layoutRow(oldT), xn = layoutRow(newT);
    const k = smooth(e);
    newT.forEach((tk, j) => {
      const m = map[j];
      if (m.length === 1 && oldT[m[0]].t === tk.t) {
        drawChip(lerp(xo[m[0]], xn[j], k), cy, chipW(tk), tk.t, fx.mix(kindCol(oldT[m[0]].k), kindCol(tk.k), k), SKETCH ? { id: idN(j) } : {});
        return;
      }
      const parts = m.map((i) => oldT[i]);
      const wsum = parts.reduce((s, p) => s + chipW(p), 0);
      const x = lerp(xo[m[0]], xn[j], k);
      if (k < 0.5) {
        // the parts slide together, outlined as active
        const g = GAP * (1 - k / 0.5);
        let cx = x;
        parts.forEach((p, pi) => { drawChip(cx, cy, chipW(p), p.t, pal.active, { fill: fx.rgba(pal.active, 0.12), ...(SKETCH ? { id: idO(m[pi]) } : {}) }); cx += chipW(p) + g; });
      } else {
        const v = smooth((k - 0.5) / 0.5);
        const w = lerp(wsum, chipW(tk), v);
        const col = fx.mix(pal.active, kindCol(tk.k), v);
        const z = zOf(j);
        if (z > 1e-4) { ctx.save(); ctx.translate(x + w / 2, cy); ctx.scale(1 + z, 1 + z); ctx.translate(-(x + w / 2), -cy); }
        drawChip(x, cy, w, null, col, { fill: fx.rgba(v > 0.5 ? kindCol(tk.k) : pal.active, 0.12), ...(SKETCH ? { id: idN(j) } : {}) });
        if (parts.map((p) => p.t).join('') === tk.t) {
          // concatenation: each part's text slides to its place in the new label
          let off = 0, px = x;
          const nx0 = x + (w - tk.t.length * CH) / 2;
          parts.forEach((p) => {
            const from = px + chipW(p) / 2 - (p.t.length * CH) / 2, to = nx0 + off * CH;
            chipText(p.t, lerp(from, to, v), cy + CS * 0.35);
            off += p.t.length; px += chipW(p);
          });
        } else {
          // anything else: the parts converge and fade, then the new label fades in (never both at once)
          const cxm = x + w / 2;
          let px = x;
          ctx.save(); ctx.globalAlpha *= off(smooth(v / 0.5));
          parts.forEach((p) => { const from = px + chipW(p) / 2; chipText(p.t, lerp(from, cxm, v), cy + CS * 0.35, 'center'); px += chipW(p); });
          ctx.restore();
          ctx.save(); ctx.globalAlpha *= smooth((v - 0.5) / 0.5); chipText(tk.t, cxm, cy + CS * 0.35, 'center'); ctx.restore();
        }
        if (z > 1e-4) ctx.restore();
      }
    });
  };
  // the settle of the fuse that landed most recently among `fuses` ([{ fuse, dur }], start and duration), with
  // its index, or null
  const settleOf = (t, fuses) => {
    let out = null;
    fuses.forEach((s, k) => { if (!s) return; const d = t - (s.fuse + LAND_E * s.dur); if (d >= 0 && d <= SETTLE.len) out = { k, z: settleAt(d) }; });
    return out;
  };
  const merged = (map) => new Set(map.map((m, j) => (m.length > 1 ? j : -1)).filter((j) => j >= 0));
  // the board chip the thesis's first line grows out of, when no probe precedes the thesis (2026-10-19)
  const BSRC = S.thesis?.from === 'board' ? boardSource(run) : null;

  // ---------------------------------------------------------------- run state on the clock
  const phase = (t) => {
    let k = -1, e = 0;
    S.steps.forEach((s, i) => { if (s && t >= s.fuse) { k = i; e = clamp((t - s.fuse) / s.dur); } });
    return { k, e };
  };
  const rowsAfter = (k) => (k < 0 ? run.rows.map((r) => r.tokens) : run.steps[k].rows.map((r) => r.tokens));
  const doneSteps = (tf) => { let n = 0; S.steps.forEach((s, i) => { if (s && tf >= s.fuse + s.dur * 0.5) n = i + 1; }); return n; };
  // pair occurrences of a histogram item on the current board
  const itemAt = (item, rows) => {
    if (item.at) return item.at;
    const seq = item.parts.map((p) => p.t), out = [];
    rows.forEach((toks, r) => {
      for (let i = 0; i + seq.length <= toks.length; i++) if (seq.every((s, j) => toks[i + j].t === s)) { out.push([r, i, seq.length]); i += seq.length - 1; }
    });
    return out;
  };

  // ---------------------------------------------------------------- board
  const board = (t, a) => {
    if (a <= 0.003) return;
    const H0 = S.hook;
    const ph = phase(t);
    // active highlights: a count item, or the step about to act
    let hi = [], hiAmt = 0;
    if (S.count) {
      const items = run.steps[0].counts.items;
      S.count.items.forEach((ti, i) => {
        const end = i < items.length - 1 ? S.count.items[i + 1] : S.count.t0 + 999;
        if (t >= ti && t < Math.min(end, (S.steps[0]?.hi ?? 1e9))) { hi = itemAt(items[i], rowsAfter(-1)); hiAmt = smooth((t - ti) / 0.2) * off(smooth((t - (S.steps[0]?.show ?? 1e9) + 0.2) / 0.2)); }
      });
    }
    S.steps.forEach((s, k) => { if (s && t >= s.hi && t < s.fuse + 0.02) { hi = run.steps[k].hi; hiAmt = smooth((t - s.hi) / 0.2); } });
    const st = settleOf(t, S.steps);
    const settleRow = (r) => (st && st.k === ph.k ? { set: merged(run.steps[st.k].rows[r].map), z: st.z } : null);
    ctx.save(); ctx.globalAlpha *= a; regionA = a;
    run.rows.forEach((row, r) => {
      const cy = rowY(r);
      const ra = H0 ? smooth((t - H0.rowsIn[r]) / 0.3) : 1;
      if (ra <= 0) return;
      ctx.save(); ctx.globalAlpha *= ra;
      // row label; pulses when its weight is being added in the count
      let pulse = 0;
      if (S.count) run.steps[0].counts.items.forEach((it, i) => it.from.forEach((f) => { if (f.row === r) pulse = Math.max(pulse, Math.sin(Math.PI * clamp((t - S.count.items[i]) / 0.5))); }));
      withText(pal.dim, () => {
        ctx.font = fx.font(500, TYPE.label, fx.MONO); ctx.fillStyle = pulse > 0.05 ? fx.mix(pal.dim, pal.active, pulse) : pal.dim;
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right';
        ctx.fillText(row.label, LABEL_R, cy + TYPE.label * 0.35); ctx.textAlign = 'left';
      });
      const split = H0 ? smooth((t - H0.split - r * 0.05) / 0.5) : 1;
      if (split < 1) {
        const toks = row.tokens, xs = layoutRow(toks);
        let px = X0 + PAD;
        toks.forEach((tk, i) => {
          const x = lerp(px, xs[i] + PAD, split);
          chipText(tk.t, x, cy + CS * 0.35);
          if (split > 0) { ctx.save(); ctx.globalAlpha *= split; const cw = lerp(tk.t.length * CH + 6, chipW(tk), split); drawChip(x + (tk.t.length * CH) / 2 - cw / 2, cy, cw, null, kindCol(tk.k), SKETCH ? { id: idsAt(-1, r)[i] } : {}); ctx.restore(); }
          px += tk.t.length * CH;
        });
      } else {
        const rowHi = hi.filter((h) => h[0] === r).map((h) => [h[1], h[2]]);
        if (ph.k >= 0 && ph.e < 1) {
          const before = rowsAfter(ph.k - 1)[r], after = rowsAfter(ph.k)[r];
          drawRow(before, after, run.steps[ph.k].rows[r].map, ph.e, cy, [], 0, settleRow(r), SKETCH ? { ids: { old: idsAt(ph.k - 1, r), neu: idsAt(ph.k, r) } } : null);
        } else {
          // the chip handed to the thesis morph leaves the board when the morph starts (thesisMorph draws it)
          const skip = BSRC && r === BSRC.row && t >= S.thesis.morphAt ? new Set([BSRC.j]) : null;
          drawRow(rowsAfter(ph.k)[r], null, null, 0, cy, rowHi, hiAmt, settleRow(r), skip || SKETCH ? { skip, ids: { old: idsAt(ph.k, r) } } : null);
        }
      }
      ctx.restore();
    });
    regionA = 1;
    ctx.restore();
  };

  // ---------------------------------------------------------------- probe: an input the run never saw
  const ALPHABET = [...new Set(run.rows.flatMap((r) => r.tokens.map((x) => x.t)).join(''))].join('') || 'abcdefghijklmnopqrstuvwxyz';
  const probeFinal = () => (run.probe.steps.length ? run.probe.steps[run.probe.steps.length - 1].tokens : run.probe.tokens);
  const probe = (t, tf) => {
    const P = S.probe, R = run.probe;
    if (!P || !R) return;
    const handoff = S.thesis?.morphed ? P.morph : (S.thesis?.t0 ?? 1e9);
    // the row's label and size leave fast when the hand-off starts (exits ≈ 0.6 × the 0.3 s entrance)
    const out = off(accelerate(clamp((t - handoff) / EXIT.probe)));
    const a = smooth((t - P.rowIn) / 0.3) * out;
    const cy = probeY;
    ctx.save();
    if (a > 0.003) {
      ctx.save(); ctx.globalAlpha *= a;
      ctx.font = fx.font(500, TYPE.label, fx.MONO); ctx.fillStyle = pal.unseen; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(R.label, LABEL_R, cy + TYPE.label * 0.35); ctx.textAlign = 'left';
      ctx.restore();
    }
    // the chips stay until the hand-off, where thesisMorph() takes them over
    const ca = smooth((t - P.chipsIn) / 0.3) * smooth((t - P.rowIn) / 0.3);
    let i = -1, e = 0;
    P.replay.forEach((rt, n) => { if (t >= rt) { i = n; e = clamp((t - rt) / P.dur); } });
    const toks = (n) => (n < 0 ? R.tokens : R.steps[n].tokens);
    if (ca > 0.003 && !(S.thesis?.morphed && t >= P.morph)) {
      ctx.save(); ctx.globalAlpha *= ca * (S.thesis?.morphed ? 1 : out);
      const ps = settleOf(t, P.replay.map((rt) => ({ fuse: rt, dur: P.dur })));
      const pz = ps && ps.k === i ? { set: merged(R.steps[i].map), z: ps.z } : null;
      const scrambling = i < 0 && t < P.chipsIn + (R.tokens.length - 1) * P.stagger + P.scrambleDur;
      if (scrambling) {
        // the unseen word arrives: each chip's letter flickers through the corpus's own letters and locks, left to
        // right in reading order (scramble-resolve, one chip at a time; 2026-10-19)
        drawRow(R.tokens, null, null, 0, cy, [], 0, null, { noLabel: true, ...(SKETCH ? { ids: { old: pidsAt(-1) } } : {}) });
        const xs = layoutRow(R.tokens);
        R.tokens.forEach((tk, k) => {
          const t0 = P.chipsIn + k * P.stagger;
          if (t < t0) return;
          const p = progressAt(t, t0, P.scrambleDur);
          const tw = tk.t.length * CH;
          drawHandoff(ctx, 'scramble-resolve', p, {
            text: tk.t, alphabet: ALPHABET, accentFrom: null, cursor: false, seed: (content.seed || 1) * 97 + k,
            x: xs[k] + chipW(tk) / 2 - tw / 2, y: cy + CS * 0.35, ground: false,
            mono: { family: fx.MONO, weight: 500, size: CS },
            colors: { ground: pal.ground, ink: pal.text, deep: pal.dim, accent: pal.unseen },
          }, { blur: false });
        });
      } else if (i < 0) drawRow(R.tokens, null, null, 0, cy, [], 0, null, SKETCH ? { ids: { old: pidsAt(-1) } } : null);
      else if (e < 1) drawRow(toks(i - 1), toks(i), R.steps[i].map, e, cy, [], 0, pz, SKETCH ? { ids: { old: pidsAt(i - 1), neu: pidsAt(i) } } : null);
      else drawRow(toks(i), null, null, 0, cy, [], 0, pz, SKETCH ? { ids: { old: pidsAt(i) } } : null);
      ctx.restore();
    }
    // its size, in the bar's unit
    if (a > 0.003) {
      let n = -1;
      P.replay.forEach((rt, k) => { if (tf >= rt + P.dur * 0.5) n = k; });
      const cells = toks(n).reduce((s, x) => s + (x.cells ?? 1), 0);
      const start = R.tokens.reduce((s, x) => s + (x.cells ?? 1), 0);
      const xs = layoutRow(toks(n));
      const label = `${cells} ${content.hud.b}`;
      const f = fx.font(500, TYPE.label, fx.MONO);
      const lw = fx.measure(ctx, label, f);
      const xEnd = Math.max(xs[xs.length - 1] + chipW(toks(n)[toks(n).length - 1]) + 32, X0 + 6 * (chipW({ t: 'x' }) + GAP) + 10);
      ctx.save(); ctx.globalAlpha *= a;
      ctx.font = f; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillStyle = t >= P.reveal ? (cells <= start ? pal.learned : pal.unseen) : pal.dim; // turns on the reveal
      ctx.fillText(label, Math.min(xEnd, RX - lw), cy + TYPE.label * 0.35);
      ctx.restore();
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- histogram
  const maxVal = Math.max(1, ...run.steps.flatMap((s) => (s.counts?.items ?? []).map((i) => i.value)));
  const LAB_ADV = TYPE.label * MONO_ADV;
  const labCol = Math.max(0, ...run.steps.flatMap((s) => (s.counts?.items ?? []).map((it) => it.parts.reduce((w, p) => w + p.t.length * LAB_ADV, 0) + (it.parts.length - 1) * 14)));
  const HBX = HX + labCol + 24;
  const valW = String(maxVal).length * LAB_ADV + 14;
  const HS = Math.min(34, (RX - valW - HBX) / maxVal);
  const segFill = (j) => (j % 2 ? pal.faint : fx.mixHex(pal.faint, pal.dim, 0.35));
  const histogram = (t, tf, a) => {
    if (a <= 0.003) return;
    let kk = -1;
    S.steps.forEach((s, k) => { if (s && s.regrow && t >= s.show && run.steps[k].counts) kk = k; });
    const fromCount = kk < 0 && S.count && t >= S.count.t0;
    if (kk < 0 && !fromCount) return;
    if (kk < 0) kk = 0;
    const C = run.steps[kk].counts, st = S.steps[kk];
    ctx.save(); ctx.globalAlpha *= a;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.font = fx.font(500, TYPE.label, fx.SANS); ctx.fillStyle = pal.dim; ctx.fillText(C.title, HX, 196);
    ctx.font = fx.font(500, TYPE.label, fx.MONO); ctx.textAlign = 'right'; ctx.fillText(fill(content.hud.before).replace(/\{k\}/g, kk + 1), RX, 196); ctx.textAlign = 'left';
    const labF = fx.font(500, TYPE.label, fx.MONO);
    C.items.forEach((it, i) => {
      const y = HY + i * HROW;
      const picked = C.pick === i && st && t >= st.pick ? smooth((t - st.pick) / 0.2) : 0;
      const allHi = C.pick < 0 && st && t >= st.hi ? smooth((t - st.hi) / 0.2) * off(smooth((t - st.fuse - st.dur) / 0.3)) : 0;
      const act = Math.max(picked, allHi);
      let len, shown, ia;
      if (fromCount && kk === 0 && !(st && st.regrow && t >= st.show)) {
        // weighted build-up: each row's weight flies over and becomes a segment
        const ti = S.count.items[i];
        ia = smooth((t - ti) / 0.15);
        if (ia <= 0) return;
        let x = HBX; shown = 0; len = 0;
        it.from.forEach((f, j) => {
          const tl = ti + FLIGHT.lead + j * FLIGHT.gap, land = tl + FLIGHT.fly;
          const v = f.w * f.n, wv = v * HS;
          const g = expOut((t - land) / FLIGHT.grow);
          if (g > 0) {
            ctx.fillStyle = act > 0 ? fx.mix(segFill(j), pal.active, act) : segFill(j);
            if (SKETCH) sketchFill(x, y - 14, wv * g - 2, 30, hash(19, i, j), 1, true);
            else { rr(x, y - 14, wv * g - 2, 30, 4); ctx.fill(); }
            // the segment's weight, when it fits inside the segment (its length already shows it)
            const sv = String(v), sw = fx.measure(ctx, sv, labF);
            if (g > 0.6 && it.from.length > 1 && sw + 10 <= wv - 2) {
              ctx.font = labF; ctx.fillStyle = act > 0.5 ? pal.ground : pal.text; ctx.textAlign = 'center';
              ctx.fillText(sv, x + wv / 2, y + 9); ctx.textAlign = 'left';
            }
          }
          if (tf >= land) shown += v;
          // the flying weight
          const u = (tf - tl) / FLIGHT.fly; // frame time: a small label smeared by sub-frames reads as repeated digits
          if (u > 0 && u < 1.05) {
            const e = cubicInOut(clamp(u));
            const sx = LABEL_R - labelW / 2, sy = rowY(f.row), ex = x + wv / 2, ey = y;
            const fxp = lerp(sx, ex, e), fyp = lerp(sy, ey, e) - Math.sin(Math.PI * e) * 60;
            ctx.save(); ctx.globalAlpha *= off(smooth((u - 0.85) / 0.2));
            ctx.font = fx.font(600, TYPE.label, fx.MONO); ctx.fillStyle = pal.active; ctx.textAlign = 'center';
            ctx.fillText(f.n > 1 ? `${f.w}×${f.n}` : `${f.w}`, fxp, fyp + 9); ctx.textAlign = 'left';
            ctx.restore();
          }
          x += wv; len += wv * g;
        });
      } else {
        const t0 = st && st.regrow ? st.show + i * 0.05 : -1;
        const g = t0 < 0 ? 1 : expOut((t - t0) / 0.35);
        ia = t0 < 0 ? 1 : smooth((t - t0) / 0.12);
        if (ia <= 0) return;
        len = it.value * HS * g;
        shown = Math.round(it.value * Math.min(1, expOut((tf - t0) / 0.35) * 1.02));
        if (t0 < 0) shown = it.value;
        ctx.fillStyle = act > 0 ? fx.mix(pal.faint, pal.active, act) : pal.faint;
        if (SKETCH) sketchFill(HBX, y - 14, len, 30, hash(23, kk, i), 1, true);
        else { rr(HBX, y - 14, len, 30, 4); ctx.fill(); }
      }
      ctx.save(); ctx.globalAlpha *= ia;
      let lx = HX;
      it.parts.forEach((p, j) => {
        ctx.font = labF; ctx.fillStyle = act > 0.5 ? pal.active : kindCol(p.k);
        ctx.fillText(p.t, lx, y + 9);
        lx += fx.measure(ctx, p.t, labF) + (j < it.parts.length - 1 ? 14 : 0);
      });
      ctx.font = labF; ctx.fillStyle = act > 0.5 ? pal.active : pal.text;
      // during the weighted build the value waits at the bar's final end, clear of the flying weights
      const vx = fromCount && kk === 0 && !(st && st.regrow && t >= st.show) ? it.value * HS : Math.max(len, 0);
      ctx.fillText(String(shown), HBX + vx + 14, y + 9);
      ctx.restore();
    });
    if (C.note && st && t >= st.pick + 0.1) {
      ctx.save(); ctx.globalAlpha *= smooth((t - st.pick - 0.1) / 0.2);
      ctx.font = fx.font(500, TYPE.label, fx.SANS); ctx.fillStyle = pal.dim;
      ctx.fillText(C.note, HX, HY + C.items.length * HROW - 4);
      ctx.restore();
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- rule list
  const rules = (t, a, histPos) => {
    if (a <= 0.003) return;
    const y0 = lerp(HY, 640, histPos);
    const first = S.steps.find(Boolean);
    if (!first || t < first.rule - 0.2) return;
    ctx.save();
    ctx.save(); ctx.globalAlpha *= lift(a, pal.dim) * smooth((t - first.rule + 0.2) / 0.3);
    ctx.font = fx.font(500, TYPE.label, fx.SANS); ctx.fillStyle = pal.dim; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(content.hud.rules, HX, y0 - 44);
    ctx.restore();
    const P = S.probe, R = run.probe;
    const f = fx.font(500, TYPE.label, fx.MONO);
    run.steps.forEach((s, k) => {
      const tin = S.steps[k]?.rule;
      if (tin == null || t < tin) return;
      const ra = smooth((t - tin) / 0.25);
      const y = y0 + k * RULE_DY;
      let flash = 0, dimmed = 0;
      if (P && R) {
        R.steps.forEach((ps, i) => { if (ps.rule === k) flash = Math.max(flash, smooth((t - P.replay[i] + 0.1) / 0.1) * off(smooth((t - P.replay[i] - P.dur - 0.25) / 0.1))); });
        if (R.used.length && !R.used.includes(k)) dimmed = smooth((t - P.dimAt) / 0.3);
      }
      // an unused rule dims as context: its text stays ≥ 3:1 (the floor of its dimmest colour)
      const ruleA = Math.max(...[pal.dim, ...s.rule.parts.map((p) => kindCol(p.k))].map((c) => lift(a * (1 - 0.6 * dimmed), c)));
      ctx.save(); ctx.globalAlpha *= ra * ruleA; ctx.translate((1 - expOut((t - tin) / 0.4)) * 30, 0);
      if (flash > 0) {
        ctx.fillStyle = fx.rgba(pal.active, 0.14 * flash);
        if (SKETCH) sketchFill(HX - 12, y - 29, RX - HX + 24, 40, hash(29, k));
        else { rr(HX - 12, y - 29, RX - HX + 24, 40, 8); ctx.fill(); }
      }
      ctx.font = f; ctx.fillStyle = pal.dim; ctx.fillText(String(k + 1), HX, y);
      let x = HX + 44;
      s.rule.parts.forEach((p) => {
        const pf = fx.font(p.k === 'learned' ? 600 : 500, TYPE.label, fx.MONO);
        ctx.font = pf; ctx.fillStyle = flash > 0.5 && p.k === 'learned' ? pal.active : kindCol(p.k);
        ctx.fillText(p.t, x, y); x += fx.measure(ctx, p.t, pf) + 12;
      });
      ctx.font = f; ctx.fillStyle = pal.dim; ctx.textAlign = 'right'; ctx.fillText(s.rule.value, RX, y); ctx.textAlign = 'left';
      ctx.restore();
    });
    ctx.restore();
  };

  // ---------------------------------------------------------------- token bar
  const totals = allRows.map((rows) => rows.reduce((n, toks, r) => n + run.rows[r].weight * toks.reduce((s, x) => s + (x.cells ?? 1), 0), 0));
  const maxCells = Math.max(...totals);
  const CG = 4, CWID = Math.min(15, (RX - BAR_X) / maxCells - CG);
  const cellCol = (k) => (k === 'base' ? pal.cell : kindCol(k));
  const countNow = (tf) => {
    const H0 = S.hook;
    let n = 0;
    if (!H0 || tf >= H0.strip) n = H0 ? Math.min(run.hud0.b, Math.floor((tf - H0.strip) / H0.stripDt) + 1) : run.hud0.b;
    const done = doneSteps(tf);
    if (done > 0) n = run.steps[done - 1].hud.b;
    return n;
  };
  const bar = (t, tf, a0) => {
    // closing move: the dimmed bar lights up again, landing (90 %) on the last downbeat, with a small ripple
    let a = a0, rip = null;
    if (S.ending) {
      const ts = S.ending.t - 0.4 * (Math.log2(10) / 10);
      a = lerp(a0, 1, expOut((t - ts) / 0.4));
      rip = (i) => -6 * Math.sin(Math.PI * clamp((t - ts - i * 0.004) / 0.35));
    }
    if (a <= 0.003) return;
    const ph = phase(t);
    let hiSet = null, hiAmt = 0;
    S.steps.forEach((s, k) => { if (s && t >= s.hi && t < s.fuse + 0.02) { hiSet = run.steps[k].hi; hiAmt = smooth((t - s.hi) / 0.2); } });
    const cells = [];
    run.rows.forEach((row, r) => {
      for (let rep = 0; rep < row.weight; rep++) {
        if (ph.k >= 0 && ph.e > 0 && ph.e < 1) {
          const before = rowsAfter(ph.k - 1)[r], after = rowsAfter(ph.k)[r], map = run.steps[ph.k].rows[r].map, k = smooth(ph.e);
          after.forEach((tk, j) => {
            const m = map[j];
            const oldC = m.reduce((s, i) => s + (before[i].cells ?? 1), 0), newC = tk.cells ?? 1;
            const same = m.length === 1 && before[m[0]].t === tk.t;
            for (let c = 0; c < Math.max(oldC, newC); c++) {
              const w = c < Math.min(oldC, newC) ? 1 : c < oldC ? 1 - k : k;
              cells.push({ w, col: same ? cellCol(tk.k) : fx.mix(pal.active, cellCol(tk.k), k) });
            }
          });
        } else {
          const toks = rowsAfter(ph.k)[r];
          const on = new Set();
          if (hiSet && hiAmt > 0) hiSet.filter((h) => h[0] === r).forEach(([, i, n]) => { for (let j = i; j < i + n; j++) on.add(j); });
          toks.forEach((tk, i) => { for (let c = 0; c < (tk.cells ?? 1); c++) cells.push({ w: 1, col: on.has(i) ? fx.mix(cellCol(tk.k), pal.active, hiAmt) : cellCol(tk.k) }); });
        }
      }
    });
    const H0 = S.hook;
    ctx.save(); ctx.globalAlpha *= a; regionA = a;
    let x = BAR_X;
    cells.forEach((c, i) => {
      const ia = H0 ? smooth((t - (H0.strip + i * H0.stripDt)) / 0.12) : 1;
      if (ia <= 0) return;
      const dy = rip ? rip(i) : 0;
      ctx.save(); ctx.globalAlpha *= ia; ctx.fillStyle = c.col; rr(x, BAR_Y + dy, CWID * c.w, BAR_H, 3); ctx.fill(); ctx.restore();
      x += (CWID + CG) * c.w;
    });
    withText(pal.dim, () => {
      ctx.font = fx.font(500, TYPE.label, fx.SANS); ctx.fillStyle = pal.dim; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(content.hud.b, X_LABEL, BAR_Y - 8);
    });
    // the count; while the summary's enlarged line is out, the count is that line (summary() draws it)
    const M = S.summary, out = M && bigMorph && t >= M.big && t < M.end;
    if (!out) withText(pal.text, () => { ctx.font = fx.font(600, TYPE.text, fx.MONO); ctx.fillStyle = pal.text; ctx.fillText(String(countNow(tf)), X_LABEL, CNT_Y); });
    regionA = 1;
    ctx.restore();
  };

  // ---------------------------------------------------------------- captions
  // A caption is one line of phrases: each phrase rises 12 px into place (0.3 s, blur 6 px → 0) at its own time, on
  // the line laid out for the whole caption, so nothing already there moves when the next phrase arrives; the line
  // leaves as one (0.2 s, drifting up 6 px). A caption that rides path-type (c.path) is plain text centred on its line,
  // painted by the hand-off's own rests, so it is the same pixels before, during and after the loop.
  const pathOf = (k) => paths.find((x) => x.from === k || x.to === k);
  const captions = (t) => {
    S.captions.forEach((c, k) => {
      const pw = c.path ? pathOf(k) : null;
      // inside a path window the hand-off draws both captions and the line
      if (pw && t >= pw.w.t0 && t < pw.w.t0 + pw.w.dur) { if (k === pw.from) pw.h.draw(ctx, progressAt(t, pw.w.t0, pw.w.dur), { blur: false }); return; }
      if (c.cut != null && t >= c.cut) return;
      const tin = c.phrases[0]?.tin ?? c.tin;
      const out = off(smooth((t - (c.tout - 0.2)) / 0.2));
      const a0 = c.phrases[0]?.placed ? (t >= tin ? 1 : 0) : smooth((t - tin) / 0.2);
      if (a0 * out <= 0.003) return;
      const up = t > c.tout - 0.2 ? smooth((t - (c.tout - 0.2)) / 0.2) * 6 : 0;
      if (pw) {
        const { h } = pw;
        const a = a0 * out;
        ctx.save(); ctx.globalAlpha *= a;
        if (a < 1) ctx.filter = `blur(${(6 * (1 - a)).toFixed(2)}px)`;
        ctx.translate(0, (c.phrases[0]?.placed ? 0 : off(smooth((t - tin) / 0.3)) * 12) - up);
        h.still(ctx, k === pw.from ? 'from' : 'to');
        ctx.restore();
        return;
      }
      const line = captionLine(c, fill);
      const st = { ...CAP_STYLE };
      st.size = fx.fitSize(ctx, line, st, CAP_W, TYPE.textMin);
      let x = X_LABEL;
      c.phrases.forEach((p, j) => {
        const s = fill(p.raw), text = c.plain ? fx.plain(s) : s;
        const a = (p.placed ? (t >= p.tin ? 1 : 0) : smooth((t - p.tin) / 0.2)) * out;
        const px = x;
        x += fx.measureRich(ctx, text + ' ', st);
        if (a <= 0.003) return;
        ctx.save(); ctx.globalAlpha *= a;
        if (a < 1) ctx.filter = `blur(${(6 * (1 - a)).toFixed(2)}px)`;
        fx.drawRich(ctx, text, px, CAP_Y + (p.placed ? 0 : off(smooth((t - p.tin) / 0.3)) * 12) - up, st, textCols);
        ctx.restore();
      });
    });
  };

  // ---------------------------------------------------------------- summary: the count grows into the result
  const bigSrc = fill(content.scenes.find((x) => x.type === 'summary')?.big ?? BIG_DEFAULT);
  const finalCount = run.steps.length ? String(run.steps[run.steps.length - 1].hud.b) : String(run.hud0.b);
  // the line split so that the final count is its own piece: that piece is the bar's count, enlarged
  const bigMorph = (() => {
    const rs = fx.runs(bigSrc);
    for (let i = rs.length - 1; i >= 0; i--) {
      const j = rs[i].text.lastIndexOf(finalCount);
      if (j < 0) continue;
      return [...rs.slice(0, i), { text: rs[i].text.slice(0, j), kind: rs[i].kind }, { text: finalCount, kind: rs[i].kind, hit: true },
        { text: rs[i].text.slice(j + finalCount.length), kind: rs[i].kind }, ...rs.slice(i + 1)].filter((p) => p.text);
    }
    return null;
  })();
  const BIG_ST = { size: TYPE.big, fam: fx.MONO, weight: 600, ls: -1 };
  const summary = (t) => {
    const M = S.summary;
    if (!M || t < M.big || t >= M.end) return;
    if (!bigMorph) {
      // no count in the line: it fades in and out in place
      const a = smooth((t - M.big) / 0.4) * off(accelerate(clamp((t - M.back) / M.backDur)));
      ctx.save(); ctx.globalAlpha *= a; fx.drawRich(ctx, bigSrc, BAR_X, BIG_Y, BIG_ST, textCols); ctx.restore();
      return;
    }
    // u: 0 = the bar's count, 1 = the enlarged line; grows expo-out, returns accelerating
    const u = t < M.back ? expOut((t - M.big) / M.bigDur) : off(accelerate(clamp((t - M.back) / M.backDur)));
    const f = fx.font(BIG_ST.weight, BIG_ST.size, BIG_ST.fam);
    let hx = 0;
    for (const p of bigMorph) { if (p.hit) break; hx += fx.measure(ctx, p.text, f, BIG_ST.ls); }
    const z0 = TYPE.text / TYPE.big, z = lerp(z0, 1, u);
    const ox = lerp(X_LABEL - hx * z0, BAR_X, u), oy = lerp(CNT_Y, BIG_Y, u);
    // the landing settle, as a fused chip's (api 3, 2026-10-19): one swell about the line's centre from its landing frame
    const sw = settleAt(t - (M.big + BIG.land));
    const lineW = bigMorph.reduce((w, p) => w + fx.measure(ctx, p.text, f, BIG_ST.ls), 0) * z;
    ctx.save();
    if (sw > 1e-4) { ctx.translate(ox + lineW / 2, oy); ctx.scale(1 + sw, 1 + sw); ctx.translate(-(ox + lineW / 2), -oy); }
    ctx.translate(ox, oy); ctx.scale(z, z);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.letterSpacing = BIG_ST.ls + 'px'; ctx.font = f;
    let x = 0;
    const rest = smooth((u - 0.25) / 0.75);
    for (const p of bigMorph) {
      const col = textCols[p.kind] ?? pal.text;
      ctx.save();
      if (p.hit) ctx.fillStyle = fx.mix(pal.text, col.startsWith('#') ? col : pal.text, u);
      else { ctx.globalAlpha *= rest; ctx.fillStyle = col; }
      ctx.fillText(p.text, x, 0);
      ctx.restore();
      x += fx.measure(ctx, p.text, f, BIG_ST.ls);
    }
    ctx.letterSpacing = '0px';
    ctx.restore();
  };

  // ---------------------------------------------------------------- thesis card
  const thesisSc = content.scenes.find((x) => x.type === 'thesis');
  const LINE_Y = (i) => 360 + i * 112;
  const lineStyle = (s) => { const st = { size: TYPE.thesis, fam: fx.SERIF, weight: 600, ls: -1 }; st.size = fx.fitSize(ctx, s, st, 1600, TYPE.thesisMin); return st; };
  // probe → thesis: the result's chips slide together into one chip, which grows into the first line's frame;
  // the chip's letters leave, then the line's words arrive (never both at once); lands on the thesis's bar line.
  // Without a probe (2026-10-19) the source is the board chip the last step fused first (BSRC): one chip, so the
  // slide is a still beat while the rest of the board leaves, then the same growth.
  const thesisMorph = (t) => {
    const T = S.thesis, P = S.probe;
    if (!T?.morphed) return;
    const t0 = BSRC ? T.morphAt : P?.morph;
    if ((!BSRC && !P) || t < t0 || t >= T.t0) return;
    const u = clamp((t - t0) / MORPH);
    let toks, xs, ids = null;
    if (BSRC) {
      const row = run.steps[run.steps.length - 1].rows[BSRC.row].tokens;
      toks = [row[BSRC.j]]; xs = [layoutRow(row)[BSRC.j]];
      if (SKETCH) ids = [idsAt(run.steps.length - 1, BSRC.row)[BSRC.j]];
    } else {
      toks = probeFinal(); xs = layoutRow(toks);
      if (SKETCH) ids = pidsAt(run.probe.steps.length - 1);
    }
    const ws = toks.map(chipW), cy = BSRC ? rowY(BSRC.row) : probeY;
    const wsum = ws.reduce((a, b) => a + b, 0);
    const cx0 = (xs[0] + xs[xs.length - 1] + ws[ws.length - 1]) / 2;
    const s = fill(thesisSc.lines[0]), st = lineStyle(s);
    const lw = fx.measureRich(ctx, s, st);
    // the chips keep their colour (learned pieces, or unseen ones when nothing was learned)
    const kinds = new Set(toks.map((x) => x.k)), boxCol = kindCol(kinds.size === 1 ? toks[0].k : 'learned');
    const R1 = { x: W / 2 - lw / 2 - 36, y: LINE_Y(0) - st.size * 0.82, w: lw + 72, h: st.size * 1.12 };
    ctx.save();
    // the camera returns during the morph's first EXIT.camera seconds: draw under it, so the chips do not jump
    const cam = camAt(t);
    ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
    if (u < 0.4) {
      // the chips slide together (no gaps), outlined as learned
      const a = smooth(u / 0.4);
      let x = cx0 - wsum / 2;
      toks.forEach((tk, i) => { drawChip(lerp(xs[i], x, a), cy, ws[i], tk.t, kindCol(tk.k), SKETCH ? { id: ids[i] } : {}); x += ws[i]; });
    } else {
      const v = cubicInOut((u - 0.4) / 0.6);
      const R0 = { x: cx0 - wsum / 2, y: cy - HCH / 2, w: wsum, h: HCH };
      const bx = lerp(R0.x, R1.x, v), by = lerp(R0.y, R1.y, v), bw = lerp(R0.w, R1.w, v), bh = lerp(R0.h, R1.h, v);
      const box = off(smooth((v - 0.6) / 0.4));
      ctx.save(); ctx.globalAlpha *= box;
      if (SKETCH) {
        // the first chip's outline grows into the frame (same identity, so it does not jump at u = 0.4)
        ctx.fillStyle = fx.rgba(boxCol, 0.08); sketchFill(bx, by, bw, bh, ids[0], sc);
        ctx.lineWidth = Math.max(2, 1.9 * sc); ctx.strokeStyle = boxCol; ctx.lineCap = 'round'; sketchStroke(bx, by, bw, bh, ids[0], sc);
      } else {
        ctx.fillStyle = fx.rgba(boxCol, 0.08); rr(bx, by, bw, bh, 12 * sc + 8 * v); ctx.fill();
        ctx.lineWidth = Math.max(1.5, 2.5 * sc); ctx.strokeStyle = boxCol; rr(bx, by, bw, bh, 12 * sc + 8 * v); ctx.stroke();
      }
      ctx.restore();
      const k = bw / R1.w;
      const old = off(smooth(v / 0.3)), neu = smooth((v - 0.35) / 0.45);
      if (old > 0) {
        // the pieces' letters ride along inside the frame and leave first
        ctx.save(); ctx.globalAlpha *= old;
        let acc = 0;
        toks.forEach((tk, i) => { chipText(tk.t, bx + ((acc + ws[i] / 2) / wsum) * bw, by + bh / 2 + CS * 0.35, 'center'); acc += ws[i]; });
        ctx.restore();
      }
      if (neu > 0) {
        ctx.save(); ctx.globalAlpha *= neu;
        ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(k, k); ctx.translate(-W / 2, -(R1.y + R1.h / 2));
        fx.drawRich(ctx, s, W / 2, LINE_Y(0), st, textCols, 'center');
        ctx.restore();
      }
    }
    ctx.restore();
  };
  const thesis = (t) => {
    const T = S.thesis;
    if (!T) return;
    thesisMorph(t);
    (thesisSc.lines || []).forEach((raw, i) => {
      const s = fill(raw), st = lineStyle(s);
      if (i === 0 && T.morphed) {
        if (t < T.t0) return;
        // the claim lands: the same settle as a fused chip, starting on the bar line
        const z = settleAt(t - T.t0);
        ctx.save(); ctx.translate(W / 2, LINE_Y(0) - st.size * 0.3); ctx.scale(1 + z, 1 + z); ctx.translate(-W / 2, -(LINE_Y(0) - st.size * 0.3));
        fx.drawRich(ctx, s, W / 2, LINE_Y(0), st, textCols, 'center');
        ctx.restore();
        return;
      }
      const a = smooth((t - T.lines[i]) / 0.5);
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha *= a; if (a < 1) ctx.filter = `blur(${(10 * (1 - a)).toFixed(2)}px)`;
      fx.drawRich(ctx, s, W / 2, LINE_Y(i) + (1 - expOut((t - T.lines[i]) / 0.7)) * 20, st, textCols, 'center');
      ctx.restore();
    });
    if (thesisSc.stats && T.stats.length) {
      // the stats line enters part by part (split at its middle dots, api 3), laid out as one centred line; each
      // part fades in with the dot before it
      const sy = Math.max(720, LINE_Y((thesisSc.lines || []).length - 1) + 136); // below the last line
      const s = fill(thesisSc.stats), st = { size: TYPE.text, fam: fx.MONO, weight: 500, ls: 0 };
      st.size = fx.fitSize(ctx, s, st, 1640, TYPE.textMin);
      const segs = s.split(/(\s*·\s*)/);
      let x = W / 2 - fx.measureRich(ctx, s, st) / 2, k = -1;
      segs.forEach((seg, j) => {
        if (j % 2 === 0 && seg.trim()) k++;
        const a = smooth((t - T.stats[Math.max(0, Math.min(T.stats.length - 1, j % 2 ? k + 1 : k))]) / 0.5);
        if (a > 0.003) { ctx.save(); ctx.globalAlpha *= a; fx.drawRich(ctx, seg, x, sy, st, textCols); ctx.restore(); }
        x += fx.measureRich(ctx, seg, st);
      });
    }
  };

  // ---------------------------------------------------------------- HUD: title, step counter
  const hud = (t, tf) => {
    // edges 'cut' (2026-10-19): a film cut into a reel shows its frame from the first frame
    const a = content.edges === 'cut' ? 1 : smooth((t - 0.1) / 0.4);
    ctx.save(); ctx.globalAlpha *= a; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const tf1 = fx.font(700, TYPE.title, fx.SERIF);
    ctx.font = tf1; ctx.fillStyle = pal.text; ctx.fillText(content.title, X_LABEL, 104);
    ctx.font = fx.font(400, TYPE.subtitle, fx.SERIF, 'italic'); ctx.fillStyle = pal.dim;
    ctx.fillText(content.subtitle ?? '', X_LABEL + fx.measure(ctx, content.title, tf1) + 18, 102);
    const k = doneSteps(tf);
    const s1 = `${content.hud.step} ${k} / ${run.steps.length}`;
    const hf = fx.font(500, TYPE.label, fx.MONO);
    ctx.font = hf; ctx.textAlign = 'right';
    ctx.fillStyle = k > 0 ? pal.text : pal.dim; ctx.fillText(s1, RX, 100);
    if (content.hud.a) {
      const v = k > 0 ? run.steps[k - 1].hud.a : run.hud0.a;
      ctx.fillStyle = pal.dim; ctx.fillText(`${content.hud.a} ${v}`, RX - fx.measure(ctx, s1, hf) - 40, 100);
    }
    ctx.restore();
  };

  // ---------------------------------------------------------------- camera and focus
  // camera keys: [t0, zoom, x, y, kind, dur]; a push eases out, a return accelerates (exits are faster)
  const camAt = (t) => {
    let z = 1, x = 960, y = 540;
    for (const [t0, z1, x1, y1, kind, d] of S.camera) {
      if (kind === 'hold') { z = z1; x = x1; y = y1; continue; }
      const u = kind === 'push' ? expOut((t - t0) / d) : accelerate(clamp((t - t0) / d));
      z = lerp(z, z1, u); x = lerp(x, x1, u); y = lerp(y, y1, u);
    }
    return { z, x, y };
  };
  // focus: a region coming up eases in over 0.4 s; a region going down leaves over EXIT.focus, accelerating
  const focusAt = (t, positional = false) => {
    let cur = { board: 1, bar: 1, hist: 0, rules: 0 };
    for (const [t0, f] of S.focus) {
      if (t < t0) break;
      const up = smooth((t - t0) / 0.4), down = positional ? up : accelerate(clamp((t - t0) / EXIT.focus));
      cur = Object.fromEntries(Object.keys(cur).map((k) => [k, lerp(cur[k], f[k], f[k] < cur[k] ? down : up)]));
    }
    return cur;
  };

  return { setCtx, board, probe, histogram, rules, bar, captions, summary, thesis, hud, camAt, focusAt, fill };
};

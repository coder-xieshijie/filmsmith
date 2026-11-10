// board.js — the engine of the trace bricks: a real run of byte-pair merging on a tiny corpus (the picture is the
// run's state), the board of chips it is drawn on, the fuse of a pair into one token, the token bar, the histogram
// of pair counts and the list of learned rules. Pure: every function is of its arguments; the scenes (chip-split,
// weight-histogram, merge-step, count-to-result, probe-replay, thesis-lines) and the pair-fuse motion import it.
// From the trace template (assets/templates/trace/runs/bpe.js, pieces.js, fx.js): the run, the board geometry
// (rows 106 × scale apart, chips 82 × scale tall, the board filling x 130–1220 or y 176–806), the fuse (slide
// together, then merge, smootherstep), the bar (y 950) and the right-hand column (x 1290–1800) are the template's.
// The run's chips are code and stay Latin in every language; captions, labels and the thesis follow `lang`.
import { clamp, lerp, mix, rgba, text, measure } from '../../../handoffs/util.js';
import { smooth, cubicOut, expOut } from '../../../motion.js';
import { fontFor, wrap, readTime, graphemes } from '../../lang.js';
import LOOK from '../../look/live-diagram/look.js';

// ── the run: byte-pair merging, for real (Sennrich, Haddow & Birch 2016, no end-of-word marker) ─────────────────
const pairCounts = (words) => {
  const counts = new Map(), order = [], from = new Map();
  words.forEach(({ f, s }, row) => {
    for (let i = 0; i < s.length - 1; i++) {
      const key = s[i] + '\u0000' + s[i + 1];
      if (!counts.has(key)) { counts.set(key, 0); order.push(key); from.set(key, []); }
      counts.set(key, counts.get(key) + f);
      const fr = from.get(key), last = fr[fr.length - 1];
      if (last && last.row === row) last.n += 1; else fr.push({ row, w: f, n: 1 });
    }
  });
  return order.slice().sort((x, y) => counts.get(y) - counts.get(x) || order.indexOf(x) - order.indexOf(y))
    .map((k) => { const [a, b] = k.split('\u0000'); return { a, b, count: counts.get(k), from: from.get(k) }; });
};
const applyMerge = (seq, a, b) => {
  const out = [], map = [], hi = [];
  for (let i = 0; i < seq.length; i++) {
    if (i < seq.length - 1 && seq[i] === a && seq[i + 1] === b) { out.push(a + b); map.push([i, i + 1]); hi.push(i); i++; } else { out.push(seq[i]); map.push([i]); }
  }
  return { out, map, hi };
};
const kindOf = (t) => (graphemes(t).length > 1 ? 'learned' : 'base');
export const runOf = ({ corpus, merges = 6, probe = '', top = 4 } = {}) => {
  let words = corpus.map(([w, f]) => ({ w, f, s: graphemes(w) }));
  const nTok = (ws) => ws.reduce((n, w) => n + w.f * w.s.length, 0), vocab = (ws) => new Set(ws.flatMap((w) => w.s)).size;
  const rows0 = words.map((w) => ({ label: `×${w.f}`, weight: w.f, tokens: w.s.map((t) => ({ t, k: 'base' })) }));
  const steps = [], learned = [], T0 = nTok(words), V0 = vocab(words);
  for (let k = 0; k < merges; k++) {
    const ranked = pairCounts(words);
    if (!ranked.length || ranked[0].count < 2) break;
    const { a, b, count } = ranked[0], hi = [];
    const after = words.map((wd, r) => { const m = applyMerge(wd.s, a, b); m.hi.forEach((i) => hi.push([r, i])); return { wd: { ...wd, s: m.out }, map: m.map }; });
    words = after.map((x) => x.wd);
    learned.push({ a, b, token: a + b, count });
    steps.push({ a, b, token: a + b, count, hi, counts: ranked.slice(0, top), rows: after.map((x) => ({ tokens: x.wd.s.map((t) => ({ t, k: kindOf(t) })), map: x.map })), total: nTok(words), vocab: V0 + learned.length });
  }
  let s = graphemes(probe);
  const pSteps = [];
  learned.forEach((m, k) => { const r = applyMerge(s, m.a, m.b); if (r.out.length !== s.length) { s = r.out; pSteps.push({ rule: k, tokens: s.map((t) => ({ t, k: graphemes(t).length > 1 ? 'learned' : 'unseen' })), map: r.map }); } });
  return { rows: rows0, steps, learned, T0, TN: steps.length ? steps[steps.length - 1].total : T0, V0, probe: { tokens: graphemes(probe).map((t) => ({ t, k: 'unseen' })), steps: pSteps, enc: s } };
};
// Board rows after step k (k = -1: the input)
export const rowsAt = (run, k) => (k < 0 ? run.rows.map((r) => r.tokens) : run.steps[k].rows.map((r) => r.tokens));
export const totalAt = (run, k) => (k < 0 ? run.T0 : run.steps[k].total);

// ── geometry ──────────────────────────────────────────────────────────────────────────────────────────────────────
export const G = { boardL: 130, boardR: 1220, bandT: 176, bandB: 806, hx: 1290, rx: 1800, hy: 250, hrow: 62, capY: 872, capW: 1400, barX: 300, barY: 950, barH: 30, label: 26 };
const MONO_ADV = 0.6, HCH1 = 82, PITCH1 = 106, PROBE_GAP1 = 128, LABEL_GAP = 28;
export const geometry = (run, { probe = true } = {}) => {
  const all = [rowsAt(run, -1), ...run.steps.map((_, k) => rowsAt(run, k))].flat();
  const rawW = (toks) => toks.reduce((w, t) => w + graphemes(t.t).length * 54 * MONO_ADV + 40, 0) + (toks.length - 1) * 14;
  const widest = Math.max(...all.map(rawW), probe ? rawW(run.probe.tokens) : 0);
  const labelW = Math.max(...run.rows.map((r) => r.label.length), 3) * G.label * MONO_ADV;
  const blockH1 = HCH1 + (run.rows.length - 1) * PITCH1 + (probe ? PROBE_GAP1 : 0);
  const sc = Math.min(1.3, (G.boardR - G.boardL - labelW - LABEL_GAP) / widest, (G.bandB - G.bandT) / blockH1);
  const CS = 54 * sc, CH = CS * MONO_ADV, PAD = 20 * sc, GAP = 14 * sc, HCH = HCH1 * sc, PITCH = PITCH1 * sc;
  const blockW = labelW + LABEL_GAP + widest * sc, X0 = G.boardL + (G.boardR - G.boardL - blockW) / 2 + labelW + LABEL_GAP;
  const top = G.bandT + (G.bandB - G.bandT - blockH1 * sc) / 2;
  const rowY = (r) => top + HCH / 2 + r * PITCH;
  const chipW = (tk) => graphemes(tk.t).length * CH + 2 * PAD;
  const xsOf = (toks, x0 = X0) => { const xs = []; let x = x0; for (const tk of toks) { xs.push(x); x += chipW(tk) + GAP; } return xs; };
  return { sc, CS, CH, PAD, GAP, HCH, PITCH, X0, labelR: X0 - LABEL_GAP, rowY, probeY: rowY(run.rows.length - 1) + PROBE_GAP1 * sc, chipW, xsOf };
};

// ── colours and type ─────────────────────────────────────────────────────────────────────────────────────────────
// base: an untouched unit; active (the accent): being acted on now; learned: produced by the run; unseen: never seen
export const kinds = (C) => ({ base: C.base || mix(C.ink, C.ground, 0.4), active: C.accent, learned: C.learned || C.ok || C.accent, unseen: C.unseen || C.fail || C.accent, op: C.dim, text: C.ink, dim: C.dim });
export const look = LOOK;
export const F = (role, lang, size, weight, kind) => fontFor(LOOK, role, lang, size, weight, kind);
// chips and run data are code: always the Latin mono
export const monoF = (size, weight = 500) => fontFor(LOOK, 'mono', 'en', size, weight);
export const secs = (beats, bpm) => (beats * 60) / bpm;
export const enter = (u, t0, bpm, rise = 12) => { const t = secs(u - t0, bpm); return [smooth(t / 0.3), (1 - cubicOut(t / 0.3)) * rise]; };
export const leave = (u, t0, bpm) => 1 - smooth(secs(u - t0, bpm) / 0.2);
// "[[kind|text]]" markup → [{ s, k }]
export const marks = (s) => { const out = []; String(s ?? '').replace(/\[\[(\w+)\|([^\]]*)\]\]|([^[]+|\[)/g, (m, k, t, plain) => { out.push(k ? { s: t, k } : { s: plain, k: 'text' }); return m; }); return out; };
export const markWidth = (ctx, s, f) => marks(s).reduce((w, p) => w + measure(ctx, p.s, f).width, 0);
export const drawMarked = (ctx, s, x, y, f, C, { alpha = 1, align = 'left' } = {}) => {
  const K = kinds(C), w = markWidth(ctx, s, f);
  let cx = align === 'center' ? x - w / 2 : x;
  for (const p of marks(s)) { text(ctx, p.s, cx, y, f, { color: p.k === 'text' ? C.ink : K[p.k] || C.ink, alpha }); cx += measure(ctx, p.s, f).width; }
  return w;
};
// A caption on its baseline (x 130, y 872), 40 px fitted down to 34 to stay within 1,400 px
export const caption = (ctx, s, u, t0, bpm, C, lang, { a = 1, y = G.capY } = {}) => {
  if (!s) return;
  let size = 40;
  while (size > 34 && markWidth(ctx, s, F('text', lang, size, 500)) > G.capW) size -= 1;
  const [ea, dy] = enter(u, t0, bpm);
  drawMarked(ctx, s, G.boardL, y + dy, F('text', lang, size, 500), C, { alpha: ea * a });
};

// ── painters ────────────────────────────────────────────────────────────────────────────────────────────────────
export const chip = (ctx, g, x, cy, w, label, stroke, C, { fill = null, textCol = C.ink, textAlpha = 1, z = 0 } = {}) => {
  ctx.save();
  if (z > 1e-4) { ctx.translate(x + w / 2, cy); ctx.scale(1 + z, 1 + z); ctx.translate(-(x + w / 2), -cy); }
  const y = cy - g.HCH / 2;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w), g.HCH, Math.min(12 * g.sc, w / 2)); ctx.fillStyle = fill || rgba(stroke, 0.08); ctx.fill();
  ctx.lineWidth = Math.max(1.5, 2.5 * g.sc); ctx.strokeStyle = stroke; ctx.stroke();
  if (label != null && textAlpha > 0) text(ctx, label, x + w / 2, cy + g.CS * 0.35, monoF(g.CS), { color: textCol, align: 'center', alpha: textAlpha });
  ctx.restore();
};
export const dashBox = (ctx, g, x0, x1, cy, a, C) => {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.setLineDash([8 * g.sc + 2, 7 * g.sc + 2]);
  ctx.beginPath(); ctx.roundRect(x0 - 8 * g.sc, cy - g.HCH / 2 - 9 * g.sc, x1 - x0 + 16 * g.sc, g.HCH + 18 * g.sc, 18 * g.sc); ctx.stroke(); ctx.restore();
};
// The settle of a landed chip: one swell ≤ 3.5 %, critically damped (x·e^(1−x), peak at 0.06 s, gone by 0.4 s)
export const settle = (t) => (t <= 0 || t >= 0.4 ? 0 : 0.035 * (t / 0.06) * Math.exp(1 - t / 0.06));
// One row: at rest (with the pairs of `hi` lit by hiAmt), or fusing old → new by `map` at e (0–1): the pairs slide
// together outlined in the active colour, then close into one chip whose outline turns learned; the labels slide
// into the new label. landedAt (s since the fuse landed) drives the settle.
export const row = (ctx, g, C, oldT, newT, map, e, cy, { hi = [], hiAmt = 0, landed = -1, label = true } = {}) => {
  const K = kinds(C), col = (k) => K[k] || C.ink;
  if (!map || e <= 0) {
    const xs = g.xsOf(oldT), lit = new Set();
    hi.forEach((i) => { lit.add(i); lit.add(i + 1); });
    oldT.forEach((tk, i) => {
      const on = lit.has(i) && hiAmt > 0;
      chip(ctx, g, xs[i], cy, g.chipW(tk), label ? tk.t : null, on ? mix(col(tk.k), C.accent, hiAmt) : col(tk.k), C, on ? { fill: rgba(C.accent, 0.12 * hiAmt) } : {});
    });
    if (hiAmt > 0) hi.forEach((i) => dashBox(ctx, g, xs[i], xs[i + 1] + g.chipW(oldT[i + 1]), cy, hiAmt, C));
    return;
  }
  const xo = g.xsOf(oldT), xn = g.xsOf(newT), k = smooth(e);
  newT.forEach((tk, j) => {
    const m = map[j];
    if (m.length === 1) { chip(ctx, g, lerp(xo[m[0]], xn[j], k), cy, g.chipW(tk), label ? tk.t : null, mix(col(oldT[m[0]].k), col(tk.k), k), C); return; }
    const parts = m.map((i) => oldT[i]), wsum = parts.reduce((s, p) => s + g.chipW(p), 0), x = lerp(xo[m[0]], xn[j], k);
    if (k < 0.5) {
      const gap = g.GAP * (1 - k / 0.5);
      let cx = x;
      parts.forEach((p) => { chip(ctx, g, cx, cy, g.chipW(p), label ? p.t : null, C.accent, C, { fill: rgba(C.accent, 0.12) }); cx += g.chipW(p) + gap; });
    } else {
      const v = smooth((k - 0.5) / 0.5), w = lerp(wsum, g.chipW(tk), v), z = landed >= 0 ? settle(landed) : 0;
      chip(ctx, g, x, cy, w, null, mix(C.accent, col(tk.k), v), C, { fill: rgba(v > 0.5 ? col(tk.k) : C.accent, 0.12), z });
      if (label) {
        let off = 0, px = x;
        const nx0 = x + (w - graphemes(tk.t).length * g.CH) / 2;
        parts.forEach((p) => { const from = px + g.chipW(p) / 2 - (graphemes(p.t).length * g.CH) / 2, to = nx0 + off * g.CH; text(ctx, p.t, lerp(from, to, v), cy + g.CS * 0.35, monoF(g.CS), { color: C.ink }); off += graphemes(p.t).length; px += g.chipW(p); });
      }
    }
  });
};
// The row labels (×6 …), right-aligned left of the chips
export const rowLabels = (ctx, g, run, C, a = 1) => run.rows.forEach((r, i) => text(ctx, r.label, g.labelR, g.rowY(i) + 9, monoF(G.label), { color: C.dim, align: 'right', alpha: a }));
// The token bar (y 950): one cell per token, `n` of `n0` standing; cells past n shrink away over `shrink` (0–1)
// The bar's cells in reading order (row by row, each row repeated by its use count), as token kinds: a learned
// token's cell takes the learned colour, as in the template's bar.
export const barKinds = (run, k) => rowsAt(run, k).flatMap((toks, r) => Array.from({ length: run.rows[r].weight }, () => toks.map((t) => t.k)).flat());
export const tokenBar = (ctx, n0, n, C, lang, { a = 1, lit = 0, count = n, label = null, shrink = 1, from = n0, kinds = null, kindAmt = 1 } = {}) => {
  const cell = Math.min(14, (1800 - G.barX) / Math.max(1, n0) - 3), pitch = cell + 3;
  const base = C.cell || C.dim, learned = C.learned || C.accent;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < from; i++) {
    const gone = i >= n, s = gone ? 1 - smooth(shrink) : 1;
    if (s <= 0.01) continue;
    const own = kinds && !gone && kinds[i] === 'learned' ? kindAmt : 0;
    ctx.fillStyle = mix(base, learned, Math.max(lit, own));
    ctx.fillRect(G.barX + i * pitch, G.barY + (G.barH * (1 - s)) / 2, cell, G.barH * s);
  }
  ctx.restore();
  text(ctx, label ?? (lang === 'zh' ? '词元' : 'tokens'), 130, G.barY - 8, monoF(G.label - 4), { color: C.dim, alpha: a });
  text(ctx, String(Math.round(count)), 130, G.barY + 34, monoF(G.label + 14, 600), { color: C.ink, alpha: a });
};
export { clamp, lerp, mix, rgba, text, measure, smooth, cubicOut, expOut, wrap, readTime, graphemes };

// ── the frame: the title (serif 46) and its subtitle (italic serif 30 in English, dim in Chinese) top left; the step
// counter top right; the run's defaults (the template's example corpus: four identifiers and how often they are used)
export const RUN = { corpus: [['read', 6], ['reader', 3], ['reread', 2], ['loader', 4]], merges: 6, probe: 'reloader', top: 4 };
export const hud = (ctx, s, k, run, C, lang) => {
  if (s.hud === false) return;
  const tf = F('display', lang, 46, 600), w = measure(ctx, s.title || '', tf).width;
  if (s.title) text(ctx, s.title, 130, 104, tf, { color: C.ink });
  if (s.subtitle) text(ctx, s.subtitle, 130 + w + 18, 104, { ...F('display', lang, 30, 400), style: lang === 'zh' ? '' : 'italic' }, { color: C.dim });
  const n = run.steps.length, done = Math.max(0, Math.min(n, k + 1)), voc = run.V0 + done;
  const L = lang === 'zh' ? { a: '词表', b: '合并' } : { a: 'vocab', b: 'merge' };
  text(ctx, `${L.a} ${voc}    ${L.b} ${done} / ${n}`, 1800, 100, monoF(G.label), { color: C.dim, align: 'right' });
};
// the ground: flat, with the look's grain left to the host (a 3.5 % tile is under the codec's noise floor at 1080p)
export const groundOf = (ctx, s) => { if (s.ground === false) return; ctx.fillStyle = s.colors.ground; ctx.fillRect(0, 0, 1920, 1080); };
export const loadFonts = async (lang) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fams = new Set(Object.values(LOOK.type.families).flatMap((r) => r[lang] || r.en));
  for (const f of fams) for (const w of [400, 500, 600, 700]) { try { await document.fonts.load(`${w} 40px "${f}"`, lang === 'zh' ? '中文 Aa 0' : 'Aa 0'); } catch (e) { /* the stack falls through */ } }
};

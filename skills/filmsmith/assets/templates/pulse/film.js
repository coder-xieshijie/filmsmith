// film.js — pulse renderer. render(t) paints the whole frame from t, content.js and palettes.js alone.
//
// One word per beat at a fixed anchor; the ground flips along one hue's lightness ramp (and to white) through a
// geometric aperture; a query line under the words carries the real parameters; candidates are searched by a
// highlight that hops, the answer locks in amber, the exposure builds to the film's one whiteout on the drop, the
// answer slams, and the camera pushes through its counter into the figures that explain it. Mode card:
// references/modes/pulse.md.
import FILM from './content.js';
import PALETTES, { onGround, groundHex, isLight } from './palettes.js';
import { plan, windowOf } from './plan.js';
import { C, APERTURES, POP } from './choreo.js';
import { clamp, lerp, expOut, smooth, progress, mixColor } from './lib/motion.js';
import { hash } from './lib/rng.js';
import { grainTile, drawGrain } from './lib/canvas.js';
import { errorBanner } from './lib/text.js';
// The devices come from the shared library: frame-level transitions (aperture-swap, whip-push, slice-smear,
// whiteout-slam) drawn by WebGL, and the counter-portal hand-off. The search's roulette and its scrambling values stay
// here (TEMPLATE.md, "Devices"): the library's roulette-lock frames labels only, and scramble-resolve sets a mono line.
import { createTransitions } from './lib/transitions/index.js';
import { createHandoff } from './lib/handoffs/index.js';
import counterPortal from './lib/handoffs/counter-portal.js';

const W = 1920, H = 1080;
// named 1920 × 1080 scratch canvases (the two frames a transition reads)
const offs = new Map();
const off = (name) => {
  let c = offs.get(name);
  if (!c) { c = document.createElement('canvas'); c.width = W; c.height = H; offs.set(name, c); }
  return c;
};
// a scrambling digit's slot shows a symbol drawn from a seeded hash 24 times a second (X15): fixed slots, nothing
// jitters, and never another digit, so no still shows a plausible wrong number (principle 2; 2026-10-20: a still
// before the whiteout read random digits as the answer)
const SCRAMBLE = '#&*@';
const scrambleChar = (c, f, seed) => SCRAMBLE[Math.floor(hash(c * 7919 + f * 104729, seed) * SCRAMBLE.length)];
let TX = null; // lib/transitions on its own WebGL canvas
// Draw a library transition from scene A to scene B: each painter fills one scratch canvas, the shader mixes them.
const glx = (ctx, name, paintA, paintB, p, opts = {}) => {
  const A = off('pulse-A'), Bc = off('pulse-B');
  const ga = A.getContext('2d'), gb = Bc.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); gb.setTransform(1, 0, 0, 1, 0, 0);
  paintA(ga); paintB(gb);
  ctx.drawImage(TX.draw(name, A, Bc, p, opts), 0, 0);
};

const PAL = PALETTES[FILM.palette] || PALETTES.indigo;
const FORM = FILM.aperture === 'round' ? 'round' : 'cut';
const P = plan(FILM);
const B = P.B;
const S = P.scenes;

// ---------- grid and type ----------
// 160 px margins (content 160–1760); the anchor: left edge 160, baseline 660; the query line at 990.
// Type scale ×1.25 from the 25 px floor: 25 · 31 · 39 · 49 · 61 · 76 · 95 · 119 · 149 · 186 · 233 · 291 · 364 · 455 · 568;
// display type is fitted to its slot between a size and its floor.
const X0 = 160, XR = W - 160, MAXW = XR - X0;
const ANCHOR_Y = 660, QUERY_Y = 990;
export const FAM = { cond: 'Barlow Condensed', wide: 'Barlow', mono: 'JetBrains Mono' };
export const SZ = {
  word: 364, wordMin: 233, // ask words, verdict
  line: 61, // text lines: the search question, values, labels, the reveal line, the tagline
  query: 31, // the query line (glance)
  cell: 186, // candidate labels
  data: [364, 291, 291], dataMin: 186, // figures, by number of rows
  reveal: 568, revealMin: 455, revealWeight: 700, // Barlow Bold: the widest counter that still slams (0: 110 × 270 px at 568)
  name: 364, nameMin: 291,
  install: 49,
};
const LS = { cond: -0.01, wide: -0.015 };

const font = (fam, w, size) => `${w} ${size}px "${fam}"`;
let CTX = null;
const mcache = new Map();
const measure = (s, fam, w, size, ls = 0) => {
  const k = `${fam}|${w}|${size}|${ls}|${s}`;
  let v = mcache.get(k);
  if (v == null) {
    CTX.save(); CTX.font = font(fam, w, size); CTX.letterSpacing = `${(ls * size).toFixed(2)}px`;
    v = CTX.measureText(s).width - (s.length ? ls * size : 0);
    CTX.restore(); mcache.set(k, v);
  }
  return v;
};
const txt = (ctx, s, x, y, { fam, w, size, color, align = 'left', ls = 0, alpha = 1 }) => {
  ctx.save();
  ctx.font = font(fam, w, size);
  ctx.letterSpacing = `${(ls * size).toFixed(2)}px`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
};
const fitSize = (s, fam, w, max, min, maxW = MAXW, ls = 0) => {
  let z = max;
  while (z > min && measure(s, fam, w, z, ls) > maxW) z -= 2;
  return z;
};
const COND = (size, color, extra = {}) => ({ fam: FAM.cond, w: 900, size, color, ls: LS.cond, ...extra });
const LINE = (color, extra = {}) => ({ fam: FAM.wide, w: 600, size: SZ.line, color, ...extra });
const MONO = (color, size = SZ.query, w = 500) => ({ fam: FAM.mono, w, size, color });

// a line rising out of a mask whose lower edge sits just under its baseline (expo out, 0.22 s)
const rise = (ctx, s, x, y, u, t0, o) => {
  const k = expOut(progress(u, t0, C.riseSec));
  if (k <= 0) return;
  const h = Math.round(o.size * 1.05);
  ctx.save();
  ctx.beginPath(); ctx.rect(o.align === 'center' ? x - W : x - 20, y - h, 2 * W, h + Math.round(o.size * 0.3)); ctx.clip();
  txt(ctx, s, x, y + (1 - k) * h, o);
  ctx.restore();
};
// the beat pop (choreo.js popsOf): the focus scales up 3.5 % on the beat and settles in 0.12 s, about its anchor point
const popAt = (sc, u) => {
  let t0 = null;
  for (const t of sc.pops || []) if (u >= t - 1e-9) t0 = t;
  return t0 == null ? 1 : 1 + POP.scale * (1 - expOut(progress(u, t0, POP.sec)));
};
const popped = (ctx, s, x, y, o, k) => {
  if (k === 1) { txt(ctx, s, x, y, o); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  txt(ctx, s, x, y, o);
  ctx.restore();
};
const fillGround = (ctx, hex) => { ctx.fillStyle = hex; ctx.fillRect(-W, -H, 3 * W, 3 * H); };

// ---------- layout (after the fonts are in) ----------
const problems = [];
const over = (what, wpx) => problems.push(`${what}: ${Math.round(wpx)} px wide at its floor; the content area is ${MAXW} px — shorten it`);
const layout = () => {
  S.forEach((sc) => {
    const p = sc.plan, tag = `scene ${sc.i + 1} (${sc.type})`;
    if (sc.type === 'ask') {
      sc.L = { sizes: p.states.map((st) => { const z = fitSize(st.text, FAM.cond, 900, SZ.word, SZ.wordMin, MAXW, LS.cond); const wpx = measure(st.text, FAM.cond, 900, z, LS.cond); if (wpx > MAXW + 1) over(`${tag} "${st.text}"`, wpx); return z; }) };
      sc.L.widths = p.states.map((st, k) => measure(st.text, FAM.cond, 900, sc.L.sizes[k], LS.cond));
    }
    if (sc.type === 'search') {
      const n = sc.candidates.length + (p.slot ? 1 : 0), gap = 40;
      const cw = Math.min(380, (MAXW - (n - 1) * gap) / n);
      sc.L = { n, cw, gap, top: 380, h: 420, x: (i) => X0 + i * (cw + gap) };
      sc.candidates.forEach((c) => { const wpx = measure(c.label, FAM.cond, 900, SZ.cell, LS.cond); if (wpx > cw - 56) over(`${tag} label "${c.label}"`, wpx); });
      if (p.result != null) {
        const z = fitSize(p.resultText, FAM.cond, 900, SZ.word, SZ.wordMin, MAXW, LS.cond);
        sc.L.verdict = z;
        const wpx = measure(p.resultText, FAM.cond, 900, z, LS.cond); if (wpx > MAXW + 1) over(`${tag} verdict`, wpx);
      }
      if (sc.line && measure(fillOf(sc.line), FAM.wide, 600, SZ.line) > MAXW) over(`${tag} line`, measure(fillOf(sc.line), FAM.wide, 600, SZ.line));
    }
    if (sc.type === 'data') {
      const n = p.rows.length;
      const size0 = SZ.data[n - 1];
      const ys = { 1: [640], 2: [480, 790], 3: [330, 600, 870] }[n];
      const size = Math.min(...p.rows.map((r) => fitSize(r.value, FAM.cond, 900, size0, SZ.dataMin, MAXW - 48 - (r.label ? measure(r.label, FAM.wide, 600, SZ.line) : 0), LS.cond)));
      sc.L = { size, ys, vw: p.rows.map((r) => measure(r.value, FAM.cond, 900, size, LS.cond)) };
      p.rows.forEach((r, k) => { const wpx = sc.L.vw[k] + (r.label ? 48 + measure(r.label, FAM.wide, 600, SZ.line) : 0); if (wpx > MAXW + 1) over(`${tag} "${r.value} ${r.label ?? ''}"`, wpx); });
    }
    if (sc.type === 'reveal') {
      const z = fitSize(p.value, FAM.wide, SZ.revealWeight, SZ.reveal, SZ.revealMin, MAXW, LS.wide);
      const wpx = measure(p.value, FAM.wide, SZ.revealWeight, z, LS.wide);
      if (wpx > MAXW + 1) over(`${tag} "${p.value}"`, wpx);
      sc.L = { size: z, base: 720, width: wpx };
      // the push goes through the first 0, O, D or Q (else the first glyph with a counter): counter-portal traces it
      if (sc.outKind === 'portal' && !/[0OoDdQqPpBbAa69eg]/.test(p.value)) problems.push(`${tag}: "${p.value}" has no glyph with a counter for the portal; set to: 'aperture'`);
    }
    if (sc.type === 'name') {
      const full = `${p.items[0].text}`;
      const z = fitSize(full, FAM.cond, 900, SZ.name, SZ.nameMin, MAXW, LS.cond);
      const wpx = measure(full, FAM.cond, 900, z, LS.cond);
      if (wpx > MAXW + 1) over(`${tag} "${full}"`, wpx);
      sc.L = { size: z, nameW: measure(sc.name + ' ', FAM.cond, 900, z, LS.cond) };
      if (p.install && measure(p.install, FAM.mono, 600, SZ.install) > MAXW) over(`${tag} install`, measure(p.install, FAM.mono, 600, SZ.install));
    }
  });
};
const fillOf = (s) => String(s ?? '').replace(/\{([\w.:-]+)\}/g, (m, k) => (k in P.facts ? P.facts[k] : m));

// ---------- the query line ----------
// Asks carry their query across: an ask that follows an ask continues its line. The line keeps its right end in
// the content area by dropping whole leading fragments behind an ellipsis.
const fullQuery = (sc) => [sc.queryBase, ...sc.plan.states.map((st) => st.param)].filter(Boolean).join(' ');
S.forEach((sc, i) => {
  if (sc.type !== 'ask') return;
  const prev = S[i - 1];
  sc.queryBase = prev?.type === 'ask' ? fullQuery(prev) : '';
});
const queryText = (sc, u) => {
  let s = sc.queryBase || '';
  for (const st of sc.plan.states) {
    if (!st.param || u < st.paramAt) continue;
    const n = Math.max(0, Math.min(st.param.length, Math.floor((u - st.paramAt) / C.typeSec)));
    s += (s ? ' ' : '') + st.param.slice(0, n);
  }
  return s;
};
const drawQuery = (ctx, s, color) => {
  let line = s;
  while (line.length > 4 && measure(line, FAM.mono, 500, SZ.query) > MAXW) line = '… ' + line.replace(/^…\s*/, '').split(' ').slice(1).join(' ');
  txt(ctx, line, X0 + 4, QUERY_Y, MONO(color));
};
const typed = (s, u, t0, cps = 1 / C.typeSec) => (u < t0 ? '' : s.slice(0, Math.max(0, Math.floor((u - t0) * cps))));

// ---------- ask ----------
const opticalMiddle = (size) => ANCHOR_Y - size * 0.36;
const askStateAt = (sc, u) => {
  const st = sc.plan.states;
  let k = -1;
  for (let j = 0; j < st.length; j++) if (u >= st[j].land - (st[j].ap && st[j].ap !== 'invert' ? C.apLeadSec : 0) - 1e-9) k = j;
  return k;
};
const paintAskState = (ctx, sc, k, u, opt) => {
  const p = sc.plan, st = p.states[k];
  const g = st ? st.ground : (p.states[0]?.ground ?? 'r0');
  const col = onGround(PAL, g);
  if (!opt.noGround) fillGround(ctx, groundHex(PAL, g));
  if (st) {
    const size = sc.L.sizes[k];
    const slam = st.hook || st.ap === 'invert' || (st.k === 0 && sc.inKind === 'invert');
    if (slam) {
      // the hook and every inverted ground: the word slams on the anchor (scale and blur settle in 0.2 s; the anchor
      // point never moves), so a flip to the light ground lands as an impact, not a cut alone
      const q = progress(u, st.land, 0.2), d = Math.pow(1 - q, 2.2) * (st.hook ? 1 : 0.6);
      ctx.save();
      ctx.translate(X0, ANCHOR_Y); ctx.scale(1 + 0.1 * d, 1 + 0.1 * d); ctx.translate(-X0, -ANCHOR_Y);
      if (d > 0.01) ctx.filter = `blur(${(10 * d).toFixed(2)}px)`;
      txt(ctx, st.text, X0, ANCHOR_Y, COND(size, col.text));
      ctx.restore(); ctx.filter = 'none';
    } else popped(ctx, st.text, X0, ANCHOR_Y, COND(size, col.text), k === p.states.length - 1 ? popAt(sc, u) : 1);
  }
  drawQuery(ctx, queryText(sc, u), col.quiet);
};
const paintAsk = (ctx, sc, u, opt = {}) => {
  const p = sc.plan;
  const k = askStateAt(sc, u);
  if (k < 0) { paintAskState(ctx, sc, -1, u, opt); return; }
  const st = p.states[k];
  const a0 = st.land - C.apLeadSec;
  if (k > 0 && st.ap && st.ap !== 'invert' && u < a0 + C.apSec) {
    // aperture-swap: the anchor holds while the new ground opens around the word's optical middle
    const size = sc.L.sizes[k], cx = X0 + sc.L.widths[k] / 2;
    glx(ctx, 'aperture-swap', (g) => paintAskState(g, sc, k - 1, u, opt), (g) => paintAskState(g, sc, k, u, opt),
      (u - a0) / C.apSec, { shape: st.ap, origin: [cx, opticalMiddle(size)] });
    return;
  }
  paintAskState(ctx, sc, k, u, opt);
};

// ---------- search ----------
const valueGlyphs = (ctx, s, x, y, o, slotChar) => {
  // draws s glyph by glyph in the advances of the target string; slotChar(c, ch) → the glyph to show in slot c
  let px = x;
  for (let c = 0; c < s.length; c++) {
    const ch = s[c], adv = measure(s.slice(0, c + 1), o.fam, o.w, o.size, o.ls ?? 0) - measure(s.slice(0, c), o.fam, o.w, o.size, o.ls ?? 0);
    const show = slotChar(c, ch);
    if (show === ch) txt(ctx, ch, px, y, o);
    else if (show) {
      ctx.save(); ctx.beginPath(); ctx.rect(px, y - o.size, adv, o.size * 1.3); ctx.clip();
      txt(ctx, show, px + adv / 2, y, { ...o, align: 'center' });
      ctx.restore();
    }
    px += adv;
  }
};
const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (r > 0) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
const paintSearchRow = (ctx, sc, u, opt) => {
  const p = sc.plan, L = sc.L, col = onGround(PAL, 'r0');
  if (!opt.noGround) fillGround(ctx, groundHex(PAL, 'r0'));
  if (sc.line) txt(ctx, fillOf(sc.line), X0, 300, LINE(col.text));
  let hop = null;
  for (const h of p.hops) if (u >= h.t - 1e-9) hop = h;
  const locked = p.lock != null && u >= p.lock - 1e-9;
  const R = FORM === 'round' ? 56 : 0;
  const cells = sc.candidates.length + (p.slot ? 1 : 0);
  for (let i = 0; i < cells; i++) {
    const x = L.x(i), isSlot = i === sc.candidates.length, c = sc.candidates[i];
    const on = !locked && hop && hop.i === i && (p.result == null || u < p.result - C.apLeadSec);
    const ans = i === p.best && locked;
    const failed = !isSlot && p.known[i] || (!isSlot && i !== p.best && p.valueAt[i] != null && (p.result != null && u >= p.result || locked));
    const pop = on ? 1 + 0.035 * (1 - expOut(progress(u, hop.t, 0.12))) : 1;
    ctx.save();
    ctx.translate(x + L.cw / 2, L.top + L.h / 2); ctx.scale(pop, pop); ctx.translate(-(x + L.cw / 2), -(L.top + L.h / 2));
    if (ans || on) { roundRect(ctx, x, L.top, L.cw, L.h, R); ctx.fillStyle = ans ? col.accent : col.hop; ctx.fill(); }
    roundRect(ctx, x + 1.5, L.top + 1.5, L.cw - 3, L.h - 3, R);
    ctx.lineWidth = 3; ctx.strokeStyle = ans ? col.accent : on ? col.hop : col.rule;
    if (isSlot && !on) ctx.setLineDash([18, 12]);
    ctx.stroke(); ctx.setLineDash([]);
    const ink = ans ? col.accentInk : failed && !on ? col.dim : col.text;
    if (isSlot) txt(ctx, '?', x + 32, L.top + 220, COND(SZ.cell, on ? col.text : col.dim));
    else {
      txt(ctx, c.label, x + 32, L.top + 220, COND(SZ.cell, ink));
      const v = fillOf(c.value), vo = LINE(ink);
      if (p.known[i]) txt(ctx, v, x + 36, L.top + 370, vo);
      else if (i === p.best && p.scrambleFrom != null && u >= p.scrambleFrom) {
        const f = Math.floor(u * C.scrambleHz);
        const done = p.resolveAt != null && u >= p.resolveAt;
        valueGlyphs(ctx, v, x + 36, L.top + 370, { ...vo, color: ans ? col.accentInk : PAL.ramp[3] }, (k, ch) => (done || !/\d/.test(ch) ? ch : scrambleChar(k, f, FILM.seed)));
      } else if (p.valueAt[i] != null) rise(ctx, v, x + 36, L.top + 370, u, p.valueAt[i], vo);
    }
    ctx.restore();
  }
  if (sc.query) drawQuery(ctx, fillOf(sc.query), col.quiet);
};
const paintVerdict = (ctx, sc, u, opt) => {
  const p = sc.plan, col = onGround(PAL, 'r1');
  if (!opt.noGround) fillGround(ctx, groundHex(PAL, 'r1'));
  popped(ctx, p.resultText, X0, ANCHOR_Y, COND(sc.L.verdict, col.text), popAt(sc, u));
  if (p.summary) drawQuery(ctx, typed(p.summary, u, p.summaryAt), col.quiet);
};
const paintSearch = (ctx, sc, u, opt = {}) => {
  const p = sc.plan;
  if (p.result != null && u >= p.result - C.apLeadSec) {
    const a0 = p.result - C.apLeadSec;
    if (u < a0 + C.apSec) {
      // the verdict opens at the anchor on its own ground
      const size = sc.L.verdict;
      glx(ctx, 'aperture-swap', (g) => paintSearchRow(g, sc, u, opt), (g) => paintVerdict(g, sc, u, opt),
        (u - a0) / C.apSec, { shape: APERTURES[FORM][0], origin: [X0 + measure(p.resultText, FAM.cond, 900, size, LS.cond) / 2, opticalMiddle(size)] });
    } else paintVerdict(ctx, sc, u, opt);
    return;
  }
  // into a reveal, the exposure build is the library's whiteout-slam (drawn by render())
  paintSearchRow(ctx, sc, u, opt);
};

// ---------- data ----------
const numFormat = (target, v) => {
  // v counted toward target, written in target's own format (thousands separators, decimals, suffix)
  const m = String(target).match(/^(\D*)([\d,]*\.?\d*)(.*)$/);
  if (!m) return target;
  const dec = (m[2].split('.')[1] || '').length;
  let s = v.toFixed(dec);
  if (m[2].includes(',')) s = s.replace(/^(\d+)/, (x) => x.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  return m[1] + s + m[3];
};
const paintData = (ctx, sc, u, opt = {}) => {
  const p = sc.plan, L = sc.L, g = p.ground, col = onGround(PAL, g);
  if (!opt.noGround) fillGround(ctx, groundHex(PAL, g));
  p.rows.forEach((r, k) => {
    if (u < r.land - 1e-9 && !r.instant) return;
    const y = L.ys[k], o = COND(L.size, col.text);
    if (r.instant || u >= r.resolved) popped(ctx, r.value, X0, y, o, k === p.rows.length - 1 ? popAt(sc, u) : 1);
    else if (r.count) {
      // the count rolls in the target's own slots, right-aligned: every digit stays in its column
      const target = Number(String(r.value).replace(/[^\d.]/g, ''));
      const q = expOut(progress(u, r.land, r.resolved - r.land));
      const shown = numFormat(r.value, target * q).padStart(r.value.length, ' ');
      valueGlyphs(ctx, r.value, X0, y, o, (c) => (shown[c] === ' ' ? '' : shown[c]));
    } else {
      const f = Math.floor(u * C.scrambleHz), n = r.value.length;
      valueGlyphs(ctx, r.value, X0, y, o, (c, ch) => {
        if (!/\d/.test(ch)) return ch;
        const lockAt = r.land + C.valueSec + ((r.resolved - r.land - C.valueSec) * (c + 1)) / Math.max(1, n);
        return u >= lockAt ? ch : scrambleChar(c, f, FILM.seed + k);
      });
    }
    if (r.label) {
      const lx = X0 + L.vw[k] + 48;
      if (r.instant) txt(ctx, r.label, lx, y, LINE(col.quiet));
      else rise(ctx, r.label, lx, y, u, r.labelAt, LINE(col.quiet));
    }
  });
  if (p.query) drawQuery(ctx, typed(p.query, u, p.queryAt), col.quiet);
};

// ---------- reveal ----------
// The answer at rest on ground g; the white frames and the shock belong to whiteout-slam, the push to counter-portal.
const revealPlain = (ctx, sc, u, g, { typedQuery = true, groundHex: gh } = {}) => {
  const p = sc.plan, L = sc.L, col = onGround(PAL, g);
  fillGround(ctx, gh ?? groundHex(PAL, g));
  txt(ctx, p.value, X0, L.base, { fam: FAM.wide, w: SZ.revealWeight, size: L.size, color: col.accent, ls: LS.wide });
  revealMarks(ctx, sc, u, col, typedQuery);
};
const revealMarks = (ctx, sc, u, col, typedQuery = true) => {
  const p = sc.plan;
  if (p.line) rise(ctx, p.line, X0 + 4, 870, u, p.lineAt, LINE(col.text));
  if (p.query) drawQuery(ctx, typedQuery ? typed(p.query, u, p.queryAt) : p.query, col.quiet);
};
// The far side of the portal: the next scene at the hand-off's parallax scale, shifted so that its focus (the first
// figure of a data scene, else the frame's centre) sits in the counter before the push and travels to its own place
// as the push lands. counter-portal centres the far scene's frame centre on the counter; this shift is the
// template's extension, made through the module's own `to` painter and its transform, so the figure is framed by the
// 0 from the first frame (the sample's portal showed only a ground there).
const farFocus = (next) => {
  if (next?.type === 'data' && next.L) return { x: X0 + next.L.vw[0] / 2, y: next.L.ys[0] - next.L.size * 0.36 };
  return { x: W / 2, y: H / 2 };
};
let PORTAL_U = 0; // the reveal's local time while the hand-off paints its marks
const makePortal = async (sc) => {
  const p = sc.plan, L = sc.L, next = S[sc.i + 1];
  const idx = (() => { const s = p.value; for (const set of ['0OoDdQq', '0OoDdQqPpBbAa69eg']) { const i = [...s].findIndex((ch) => set.includes(ch)); if (i >= 0) return i; } return null; })();
  const col = onGround(PAL, 'r0');
  const h = await createHandoff('counter-portal', {
    glyph: { text: p.value, counter: idx, counterAt: [0.5, 0.5] },
    x: X0, baseline: L.base,
    font: { family: FAM.wide, weight: SZ.revealWeight, size: L.size, spacing: LS.wide * L.size },
    parallax: 0.55,
    ground: false, // the reveal fills its own ground: white under the slam, falling to ramp[0]
    colors: { ground: groundHex(PAL, 'r0'), ink: col.accent, portal: groundHex(PAL, groundOf(next)) },
    from: (c) => revealMarks(c, sc, PORTAL_U, col),
    to: (c) => {
      const D = sc.L.portalD, m = c.getTransform(), a = m.a, Q = farFocus(next);
      const w = a >= 1 - 1e-9 ? 1 : Math.min(1, Math.max(0, 1 + Math.log(a) / (0.55 * Math.log(D.S))));
      const Fx = D.Cx + (W / 2 - D.Cx) * w, Fy = D.Cy + (H / 2 - D.Cy) * w;
      const dx = Fx + (Q.x - Fx) * w - (m.e + Q.x * a), dy = Fy + (Q.y - Fy) * w - (m.f + Q.y * a);
      c.translate(dx / a, dy / a);
      paintScene(c, next, 0, { frozen: true });
    },
  });
  sc.L.portalD = counterPortal.prepare(h.params);
  sc.L.portal = h;
};
const paintReveal = (ctx, sc, u, opt = {}) => {
  if (!sc.outKind && sc.endMove != null && u >= sc.endMove - sc.start) {
    // the closing reveal's second move: the ground flips to ramp[1] around the fixed answer on the last downbeat
    const a0 = sc.endMove - sc.start, L = sc.L;
    if (u < a0 + C.apSec) {
      glx(ctx, 'aperture-swap', (g) => revealPlain(g, sc, u, 'r0'), (g) => revealPlain(g, sc, u, 'r1'),
        (u - a0) / C.apSec, { shape: FORM === 'round' ? 'circle' : 'band', origin: [X0 + L.width / 2, L.base - L.size * 0.36] });
    } else revealPlain(ctx, sc, u, 'r1');
    return;
  }
  // Under whiteout-slam the ground is the paper and falls back to ramp[0] here, in the reveal's own painter (2 white
  // frames, then an S-curve over 0.3 s): the module's blur then mixes the answer with the ground it is actually on,
  // so its edges stay clean on white instead of carrying a dark halo, and no single frame of the fall reads as a cut.
  const gh = opt.slam != null ? mixColor(PAL.white, groundHex(PAL, 'r0'), smooth(clamp((opt.slam - C.whiteSec) / C.fallSec))) : groundHex(PAL, 'r0');
  const h = sc.L.portal;
  if (sc.outKind !== 'portal' || !h) { revealPlain(ctx, sc, u, 'r0', { groundHex: gh }); return; }
  fillGround(ctx, gh);
  // the counter shows the next scene from the first frame; on the last beat the camera pushes through it
  const z0 = sc.dur - C.portal * B;
  PORTAL_U = Math.min(u, z0);
  h.draw(ctx, u < z0 ? 0 : (u - z0) / (C.portal * B), { dur: C.portal * B });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

// ---------- name ----------
const paintName = (ctx, sc, u, opt = {}) => {
  const p = sc.plan, L = sc.L;
  const end = (sc.endMove ?? sc.end) - sc.start;
  const g0 = 'r1', g1 = 'r0';
  const a0 = end - C.apLeadSec;
  const drawInk = (c, g, uu) => {
    const col = onGround(PAL, g);
    txt(c, sc.name, X0, 600, COND(L.size, col.text));
    if (p.items[0].text !== sc.name) txt(c, fillOf(sc.version), X0 + L.nameW, 600, COND(L.size, col.accent ?? col.text));
    if (sc.line) rise(c, fillOf(sc.line), X0 + 4, 720, uu, p.lineAt, LINE(col.text));
    if (p.install) txt(c, typed(p.install, uu, p.installAt, C.installCps), X0 + 4, 860, MONO(col.text, SZ.install, 600));
  };
  const plain = (c, g) => { fillGround(c, groundHex(PAL, g)); drawInk(c, g, u); };
  if (u < a0) { plain(ctx, g0); return; }
  // the second move: the ground flips once more around the fixed name, landing on the last downbeat
  if (u < a0 + C.apSec) {
    glx(ctx, 'aperture-swap', (c) => plain(c, g0), (c) => plain(c, g1), (u - a0) / C.apSec,
      { shape: FORM === 'round' ? 'circle' : 'band', origin: [X0 + L.nameW / 2, 600 - L.size * 0.36] });
  } else plain(ctx, g1);
};

// ---------- dispatch ----------
const PAINT = { ask: paintAsk, search: paintSearch, data: paintData, reveal: paintReveal, name: paintName };
const groundOf = (sc, u = 0) => (sc.type === 'ask' ? (sc.plan.states[Math.max(0, askStateAt(sc, u))]?.ground ?? 'r0') : sc.type === 'search' ? 'r0' : sc.plan.ground);
function paintScene(ctx, sc, u, opt = {}) {
  const f = PAINT[sc.type];
  if (f) f(ctx, sc, Math.max(0, Math.min(u, sc.dur - 1e-4)), opt);
}

// transition windows between scene i and i + 1 that render() draws (the portal is drawn by the reveal)
const WINDOWS = S.slice(0, -1).map((a, i) => {
  const b = S[i + 1], [w0, w1] = windowOf(a.outKind, b.start, B);
  return { i, kind: a.outKind, a, b, w0, w1 };
}).filter((x) => ['aperture', 'whip', 'slice', 'build'].includes(x.kind) && x.w1 > x.w0);

const sceneAt = (t) => { for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].start - 1e-9) return S[i]; return S[0]; };

const drawTransition = (ctx, w, t) => {
  const { a, b, kind } = w;
  const ua = Math.min(t, a.end - 1e-4) - a.start, ub = Math.max(0, t - b.start);
  const p = (t - w.w0) / (w.w1 - w.w0);
  const A = (g) => paintScene(g, a, ua), Bp = (g) => paintScene(g, b, ub);
  if (kind === 'aperture') {
    // between scenes: bars closing from the top and bottom (cut) or a circle (round), around the next anchor
    const size = b.L?.sizes?.[0] ?? SZ.word;
    const origin = b.type === 'ask' ? [X0 + (b.L?.widths?.[0] ?? 600) / 2, opticalMiddle(size)] : [W / 2, H / 2];
    glx(ctx, 'aperture-swap', A, Bp, (t - w.w0) / C.apSec, { shape: FORM === 'round' ? 'circle' : 'close', origin });
    return;
  }
  if (kind === 'whip') { glx(ctx, 'whip-push', (g) => paintScene(g, a, a.dur - 1e-3), (g) => paintScene(g, b, 0), p, { dur: C.whipSec, direction: 'left' }); return; }
  if (kind === 'slice') {
    glx(ctx, 'slice-smear', (g) => paintScene(g, a, a.dur - 1e-3), Bp, p, { dur: C.sliceDurSec, band: 72, colors: { ground: groundHex(PAL, groundOf(b)) } });
    return;
  }
  if (kind === 'build') {
    // whiteout-slam: the camera leans into the locked cell while the frame exposes toward white, two white frames on
    // the bar line, then the answer lands with blur and scale decaying to zero (no channel offset: the mode's only
    // colours are its ramp and the amber answer) while the ground falls back
    const L = a.L, pa = a.plan;
    const origin = [L.x(Math.max(0, pa.best)) + L.cw / 2, L.top + L.h / 2];
    // colors.ground is the paper too: the reveal paints its own falling ground (paintReveal), so the shader leaves it
    glx(ctx, 'whiteout-slam', A, (g) => paintScene(g, b, ub, { slam: ub }), p, { dur: w.w1 - w.w0, origin, shift: 0, colors: { paper: PAL.white, ground: PAL.white } });
  }
};

// ---------- frame ----------
let laidOut = false, grain = null;
export const ready = async () => {
  layout();
  TX = createTransitions(null);
  if (!TX) problems.push('WebGL is not available: the transitions cannot be drawn');
  else TX.warm();
  for (const sc of S) {
    if (sc.type !== 'reveal' || sc.outKind !== 'portal') continue;
    try { await makePortal(sc); } catch (e) { problems.push(`scene ${sc.i + 1} (reveal): ${e.message}`); }
  }
  laidOut = true;
  if (problems.length) {
    const lines = ['TEXT CROSSES THE MARGIN — shorten it (TEMPLATE.md: character limits)', ...problems];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-margin-error');
    setTimeout(() => { throw new Error(`margin: ${problems.join('; ')}`); }, 0);
  }
  grain = grainTile(FILM.seed % 100000, 256, 60);
};
export const fonts = [
  { family: FAM.cond, weight: 900 },
  { family: FAM.wide, weight: 700 },
  { family: FAM.wide, weight: 600 },
  { family: FAM.mono, weight: 500 },
  { family: FAM.mono, weight: 600 },
];
export const setContext = (ctx) => { CTX = ctx; };
export const duration = P.duration;

export const render = (ctx, t) => {
  if (!laidOut) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  const w = WINDOWS.find((x) => t >= x.w0 && t < x.w1);
  if (w) drawTransition(ctx, w, t);
  else { const sc = sceneAt(t); paintScene(ctx, sc, t - sc.start); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawGrain(ctx, grain, t, { alpha: 0.05, mode: 'overlay' });
};
export { isLight, lerp };

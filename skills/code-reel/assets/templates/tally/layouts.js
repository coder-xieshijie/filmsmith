// layouts.js — the registry. Each layout places every unit square (where it sits, its size, its role) and
// draws the chapter's own text and marks. Squares are shared: the same unit k flies from its place in one
// chapter to its place in the next, so every chapter grows out of the last.
import { clamp, lerp, cubicOut, quintOut, expOut, smooth } from './lib/motion.js';
import * as fx from './fx.js';
import { LIGHT_SPAN, CHART_LIGHT_SPAN, lightStep, lightEnd, WORD_STEP, listOf } from './timeline.js';

export const ROLE = { hidden: 0, base: 1, rest: 2, accent: 3 };
export const MX = 96, RX = 1824, CW = RX - MX; // margins, content width
export const TITLE_Y = 206, SUB_Y = 256, TOP = 330; // baselines and the top of the chart area
// Type scale (px at 1080): every size on screen is one of these. Labels 25 (values 28, the same step),
// captions 32 / 40, titles 64, big numbers 150 / 210 / 273 (the closing protagonist, 210 × 1.3) / 300.
// Text that carries information is never under 25 px (full-screen landscape on a phone ≈ 11 pt).
export const TYPE = { label: 25, value: 28, caption: 32, lead: 40, title: 64, titleMin: 44 };

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const placement = (N) => ({
  x: new Float32Array(N), y: new Float32Array(N), s: new Float32Array(N),
  role: new Uint8Array(N), group: new Int16Array(N), rank: new Float32Array(N),
  reveal: null, // optional roles switched on at T.reveal
});

// Largest pitch at which n squares fit a w × h box.
const fitGrid = (n, w, h, max = 30) => {
  for (let p = max; p >= 3; p -= 0.5) {
    const cols = Math.floor(w / p), rows = Math.ceil(n / cols);
    if (cols > 0 && rows * p <= h) return { p, cols, rows };
  }
  const cols = Math.floor(w / 3);
  return { p: 3, cols, rows: Math.ceil(n / cols) };
};
const sizeOf = (p) => Math.max(2, Math.round(p * 0.79));

// The right-hand grid used by count and split, so a split regroups in place.
const GRID_BOX = { x0: 1000, y0: TOP, w: RX - 1000, h: 370 };
const gridGeo = (n) => {
  const g = fitGrid(n, GRID_BOX.w, GRID_BOX.h, 26);
  const s = sizeOf(g.p);
  const x0 = RX - g.cols * g.p + (g.p - s);
  return { ...g, s, x0, y0: GRID_BOX.y0, pos: (r) => [x0 + (r % g.cols) * g.p, GRID_BOX.y0 + Math.floor(r / g.cols) * g.p] };
};

// The list (stream) geometry: the reading band's baseline, the line pitch, the window the lines show in, the square.
export const LIST = { band: 600, lh: 64, /* = lib/handoffs stream-brake's lineHeight, so its speed() is in these px */ top: 330, bottom: 930, square: 18 };
// A line's (or a square's) opacity by its distance from the window's edges: lines fade out 70 px before they leave.
export const listFade = (y) => smooth((y - LIST.top) / 70) * smooth((LIST.bottom - y) / 70);

// ---------- text styles ----------
const st = (pal, o) => ({ weight: 500, size: TYPE.label, fam: fx.SANS, ls: 0, color: { plain: pal.text, accent: pal.accent, strong: pal.text }, ...o });
const titleStyle = (pal) => st(pal, { weight: 700, size: TYPE.title, ls: -1.4 });
// mono caps labels: sub, note, foot, callouts, chart labels (one style, one size)
export const labelStyle = (pal, color = pal.muted, ls = 1.2) => st(pal, { weight: 400, strongWeight: 500, size: TYPE.label, fam: fx.MONO, ls, color: { plain: color, accent: pal.accent, strong: pal.text } });
const subStyle = (pal) => labelStyle(pal, pal.muted, 1.2);
const accentLabel = (pal) => st(pal, { weight: 400, size: TYPE.label, fam: fx.MONO, ls: 1.2, color: { plain: pal.accent, accent: pal.accent, strong: pal.accent } });

// fade-in with a short rise; returns [alpha, dy]
const enter = (t, t0, rise = 14) => [cubicOut((t - t0) / 0.35), (1 - cubicOut((t - t0) / 0.5)) * rise];
const pulse = (t, t0, d = 0.3) => Math.sin(Math.PI * clamp((t - t0) / d));
// A closing chart scene's light (timeline.js closesChart()): from the last downbeat the values that are not the
// protagonist's step back from the text colour to muted, with their squares, over CHART_LIGHT_SPAN beats.
const stepBack = (E, ch, t, color) => {
  const T = ch.T;
  if (!ch.S?.closing || T.light == null || t < T.light) return color;
  const u = smooth((t - T.light) / (CHART_LIGHT_SPAN * T.beat));
  return fx.rgbaStr(fx.mixRgb(fx.hexRgb(color), fx.hexRgb(E.pal.muted), u), 1);
};

// ---------- phrased text (timing API 3): a line enters phrase by phrase, its words rippling in ----------
// T.lines[key] = [{ t (s), text (markup), words }] from timeline.js. Every token is measured once, placed on one
// or more lines (wrap at maxW) and drawn with its own entrance: its phrase's time + WORD_STEP beats per word.
const tokenFont = (sty, kind) => fx.font(kind === 'strong' ? sty.strongWeight ?? sty.weight : sty.weight, sty.size, sty.fam);
export const placeTokens = (ctx, phrases, sty, maxW = Infinity, upper = false) => {
  const out = [];
  let x = 0, line = 0;
  phrases.forEach((p, pi) => {
    let wi = 0;
    fx.tokens(p.text).forEach((tk, ti) => {
      const text = upper ? tk.text.toUpperCase() : tk.text;
      const f = tokenFont(sty, tk.kind), w = fx.measure(ctx, text, f, sty.ls || 0);
      let sp = out.length && (tk.sp || ti === 0) ? fx.measure(ctx, ' ', tokenFont(sty, 'plain'), sty.ls || 0) : 0;
      if (x > 0 && x + sp + w > maxW) { x = 0; line++; sp = 0; }
      out.push({ text, kind: tk.kind, x: x + sp, line, w, phrase: pi, word: wi, f });
      if (fx.isWord(tk.text)) wi++;
      x += sp + w;
    });
  });
  return out;
};
export const tokensWidth = (tk) => tk.reduce((w, k) => Math.max(w, k.x + k.w), 0);
const drawTokens = (E, tk, phrases, x, y, sty, t, a, { lineH = sty.size * 1.2, rise = 14, beat }) => {
  const { ctx } = E;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (const k of tk) {
    const t0 = phrases[k.phrase].t + k.word * WORD_STEP * beat;
    const [ea, dy] = enter(t, t0, rise);
    if (ea * a <= 0.002) continue;
    ctx.globalAlpha = ea * a;
    ctx.font = k.f; ctx.letterSpacing = (sty.ls || 0) + 'px';
    ctx.fillStyle = sty.color[k.kind] || sty.color.plain;
    ctx.fillText(k.text, x + k.x, y + k.line * lineH + dy);
  }
  ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;
};
// Draw line `key` of the chapter (title, caption, callout, line): returns its width (of its widest line).
export const drawLine = (E, ch, key, x, y, sty, t, a, o = {}) => {
  const ph = ch.T.lines?.[key];
  if (!ph?.length) return 0;
  const tk = placeTokens(E.ctx, ph, sty, o.maxW ?? Infinity, o.upper);
  drawTokens(E, tk, ph, x, y, sty, t, a, { beat: ch.T.beat, ...o });
  return tokensWidth(tk);
};
const lineCount = (E, ch, key, sty, maxW) => { const ph = ch.T.lines?.[key]; return ph?.length ? Math.max(...placeTokens(E.ctx, ph, sty, maxW).map((k) => k.line)) + 1 : 0; };

const drawTitle = (E, ch, t, a) => {
  const { ctx, pal, m } = E;
  if (!ch.title) return;
  const ph = ch.T.lines.title;
  const sty = titleStyle(pal);
  // one size for the whole title: the largest at which every phrase fits one line together (≥ 44 px)
  while (sty.size > TYPE.titleMin && tokensWidth(placeTokens(ctx, ph, sty)) > CW) sty.size -= 1;
  drawLine(E, ch, 'title', MX, TITLE_Y, sty, t, a);
  if (ch.sub) {
    const [sa] = enter(t, ch.T.title + 0.25);
    const ss = m.fill(ch.sub).toUpperCase();
    const sst = subStyle(pal); // never shrinks: tools/validate.mjs rejects a sub wider than the content width
    ctx.globalAlpha = sa * a;
    fx.drawRich(ctx, ss, MX, SUB_Y, sst);
  }
  ctx.globalAlpha = 1;
};
// A glint (timeline.js glintsOf): a sweep by rank along the given squares, each swelling to its cell's pitch and
// back; the size factor of square k at time t (1 when no glint is passing).
export const glintScale = (T, rank, t) => {
  let sc = 1;
  for (const g of T.glints || []) {
    const dk = g + rank * 0.6 * T.beat;
    if (t >= dk && t <= dk + 0.35) sc = Math.max(sc, 1 + 0.22 * Math.sin(Math.PI * clamp((t - dk) / 0.35)));
  }
  return sc;
};

const wrapLines = (ctx, s, sty, maxW, maxLines = 2) => {
  const words = s.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? line + ' ' + w : w;
    if (line && fx.measureRich(ctx, next, sty) > maxW) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
};

// landed count of group squares at time t (squares land in rank order)
const landedCount = (times, t) => {
  let lo = 0, hi = times.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (times[mid] <= t) lo = mid + 1; else hi = mid; }
  return lo;
};

// =====================================================================================================
export const LAYOUTS = {
  // ---------------------------------------------------------------- count: the whole set, one big number
  count: {
    place(E, ch) {
      const N = E.m.n, P = placement(N), G = gridGeo(N);
      for (let k = 0; k < N; k++) {
        const [x, y] = G.pos(k);
        P.x[k] = x; P.y[k] = y; P.s[k] = G.s; P.role[k] = ROLE.base; P.rank[k] = k / N;
      }
      ch.geo = { G };
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T;
      const value = m.count(ch.value ? ch.value.replace(/[{}]/g, '') : 'all');
      const [c0, d] = T.counter;
      const v = value * expOut((E.tf - c0) / d); // counters read the frame time, so sub-frames never ghost digits
      const f800 = (size) => fx.font(800, size, fx.SANS);
      let size = 300;
      while (size > 120 && fx.tabularWidth(ctx, fmt(value), f800(size)) > 860) size -= 4;
      const [na] = enter(t, c0 - 0.1, 0);
      ctx.globalAlpha = na * a;
      fx.drawTabular(ctx, fmt(v), MX - size * 0.03, TOP + size * 0.86, f800(size), pal.text);
      const capSty = st(pal, { weight: 600, size: TYPE.lead, ls: -0.4 });
      const capY = TOP + size * 0.86 + 74;
      drawLine(E, ch, 'caption', MX + 8, capY, capSty, t, a, { maxW: 720, lineH: 48, rise: 16 });
      const lines = lineCount(E, ch, 'caption', capSty, 720);
      if (ch.note) {
        const [oa] = enter(t, T.note, 0);
        ctx.globalAlpha = oa * a;
        fx.drawRich(ctx, m.fill(ch.note).toUpperCase(), MX + 8, capY + lines * 48 + 34, subStyle(pal));
      }
      ctx.globalAlpha = 1;
      drawTitle(E, ch, t, a);
    },
  },

  // ---------------------------------------------------------------- columns: one band of squares per category
  columns: {
    place(E, ch) {
      const { m, ctx } = E, N = m.n, P = placement(N);
      const groups = m.groups(ch.top ?? 7, ch.restLabel);
      const accent = ch.accent ? m.match(ch.accent) : () => false;
      const B = groups.length;
      const labF = fx.font(400, TYPE.label, fx.MONO);
      const maxLab = Math.max(...groups.map((g) => fx.measure(ctx, g.name, labF, 0.5)));
      const labelRight = MX + Math.max(maxLab, 300);
      const x0 = labelRight + 32;
      const band = Math.min(74, 590 / B);
      const maxN = Math.max(...groups.map((g) => g.n));
      const room = RX - x0 - 420;
      let p = 14, rows = 1;
      for (p = 14; p >= 4; p -= 0.5) {
        rows = Math.max(1, Math.floor((band * 0.66) / p));
        if (Math.ceil(maxN / rows) * p <= room) break;
      }
      const s = sizeOf(p);
      const gOf = new Int16Array(N).fill(-1);
      groups.forEach((g, gi) => g.ids.forEach((c) => m.units.forEach((u) => { if (u.c === c) gOf[u.k] = gi; })));
      const seen = new Array(B).fill(0);
      const accentGroup = groups.map((g) => g.key !== '__rest' && m.units.some((u) => g.ids.includes(u.c) && accent(u)));
      for (let k = 0; k < N; k++) {
        const gi = gOf[k], r = seen[gi]++;
        P.x[k] = x0 + Math.floor(r / rows) * p;
        P.y[k] = TOP + gi * band + (r % rows) * p;
        P.s[k] = s; P.group[k] = gi; P.rank[k] = r / groups[gi].n;
        P.role[k] = accentGroup[gi] ? ROLE.accent : ROLE.base;
      }
      ch.geo = { groups, x0, band, p, rows, s, labelRight, accentGroup, endX: groups.map((g) => x0 + Math.ceil(g.n / rows) * p) };
      // the roulette: the bands land neutral; the protagonist lights up when the frame locks on it (T.reveal)
      if (ch.pick === 'roulette' && ch.accent) {
        P.reveal = new Uint8Array(P.role);
        P.revealAt = new Float32Array(N);
        for (let k = 0; k < N; k++) if (P.role[k] === ROLE.accent) { P.role[k] = ROLE.base; P.revealAt[k] = P.rank[k] * 0.4; }
      }
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      const labF = fx.font(400, TYPE.label, fx.MONO), numF = fx.font(700, TYPE.value, fx.SANS);
      G.groups.forEach((g, gi) => {
        const yc = TOP + gi * G.band + (G.rows * G.p - (G.p - G.s)) / 2;
        const tIn = ch.start + T.delay[gi] * T.beat;
        const [la] = enter(t, tIn, 0);
        ctx.globalAlpha = la * a;
        ctx.font = labF; ctx.letterSpacing = '0.5px'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillStyle = G.accentGroup[gi] && (!T.roulette || t >= T.reveal) ? pal.text : pal.muted;
        ctx.fillText(g.name, G.labelRight, yc + 1);
        ctx.letterSpacing = '0px'; ctx.textAlign = 'left';
        const n = landedCount(E.landTimes[ch.i][gi], E.tf);
        if (n > 0) {
          const hero = G.accentGroup[gi] && (!T.roulette || t >= T.reveal);
          const sc = hero ? 1 + 0.35 * pulse(t, T.reveal, 0.32) + (ch.S?.closing ? 0.35 * pulse(t, lightEnd(T), 0.32) : 0) : 1;
          ctx.save();
          ctx.translate(G.endX[gi] + 18, yc);
          ctx.scale(sc, sc);
          const w = fx.drawTabular(ctx, fmt(n), 0, 9, numF, hero ? pal.accent : stepBack(E, ch, t, pal.text));
          ctx.restore();
          if (hero && ch.callout) drawLine(E, ch, 'callout', G.endX[gi] + 18 + w + 26, yc + 9, accentLabel(pal), t, a, { upper: true, rise: 0 });
        }
      });
      if (T.roulette && E.roulette?.[ch.i] && E.tf >= T.roulette.start) {
        // the frame of lib/handoffs roulette-lock, drawn round a band: its state (cell, pop) comes from the module.
        // A hop is a jump, not a fast move: the frame reads the frame time, so motion blur never doubles it
        const R = E.roulette[ch.i], S = R.state((E.tf - T.roulette.start) / T.roulette.dur);
        if (S.fx != null) {
          const hgt = G.rows * G.p - (G.p - G.s), pad = Math.min(14, (G.band - hgt) / 2 + 6);
          const right = Math.max(...G.endX) + 150, left = MX - 18;
          const y = TOP + S.fx * G.band - pad, w = (right - left) * S.pop, h = (hgt + 2 * pad) * S.pop;
          ctx.globalAlpha = a;
          ctx.strokeStyle = pal.accent; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.roundRect((left + right) / 2 - w / 2, y + (hgt + 2 * pad) / 2 - h / 2, w, h, 8); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- split: the grid re-sorted, matches first
  split: {
    place(E, ch) {
      const { m } = E, N = m.n, P = placement(N), G = gridGeo(N);
      const sel = m.match(ch.by);
      const inn = m.units.filter(sel).map((u) => u.k), out = m.units.filter((u) => !sel(u)).map((u) => u.k);
      [...inn, ...out].forEach((k, r) => {
        const [x, y] = G.pos(r);
        const isIn = r < inn.length;
        P.x[k] = x; P.y[k] = y; P.s[k] = G.s; P.group[k] = isIn ? 0 : 1;
        P.rank[k] = isIn ? r / inn.length : (r - inn.length) / out.length;
        P.role[k] = isIn ? ROLE.accent : ROLE.rest;
      });
      ch.geo = { G, nIn: inn.length, nOut: out.length };
      return P;
    },
    // Two large elements (principle 3): the counted matches and the grid. The complement is a label-size line,
    // and the caption, which carries the percentage, enters only when the counter has landed (principle 2).
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      const [c0, d] = T.counter;
      const [ba] = enter(t, c0 - 0.05, 0);
      ctx.globalAlpha = ba * a;
      // the count lands with a pulse (the key at T.reveal), then its caption's phrases follow
      const sc = 1 + 0.08 * pulse(t, T.reveal, 0.3);
      ctx.save(); ctx.translate(MX, TOP + 172); ctx.scale(sc, sc);
      fx.drawTabular(ctx, fmt(G.nIn * expOut((E.tf - c0) / d)), 0, 0, fx.font(800, 200, fx.SANS), pal.accent);
      ctx.restore();
      const capSty = st(pal, { weight: 600, size: TYPE.lead, ls: -0.4 });
      drawLine(E, ch, 'caption', MX + 6, TOP + 240, capSty, t, a, { maxW: 760, lineH: 48, rise: 12 });
      const lines = lineCount(E, ch, 'caption', capSty, 760);
      if (ch.other) {
        const [oa] = enter(t, T.other, 0);
        ctx.globalAlpha = oa * a;
        fx.drawRich(ctx, `${fmt(G.nOut)} ${m.fill(ch.other)}`.toUpperCase(), MX + 6, TOP + 240 + lines * 48 + 34, labelStyle(pal));
      }
      const g = G.G;
      if (ch.labelIn) {
        const [la] = enter(t, T.labels[0], 0);
        ctx.globalAlpha = la * a;
        fx.drawRich(ctx, m.fill(ch.labelIn).toUpperCase(), g.x0, g.y0 - 20, labelStyle(pal, pal.accent, 1.6));
      }
      if (ch.labelOut) {
        const [la] = enter(t, T.labels[1], 0);
        ctx.globalAlpha = la * a;
        fx.drawRich(ctx, m.fill(ch.labelOut).toUpperCase(), g.x0, g.y0 + g.rows * g.p + 34, labelStyle(pal, pal.muted, 1.6));
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- axis: the subset becomes the axis, bars grow from it
  axis: {
    place(E, ch) {
      const { m, ctx } = E, N = m.n, P = placement(N);
      const within = m.match(ch.within || 'all');
      let series = (ch.series || []).map((s) => ({ ...s, n: m.count(ch.within && ch.within !== 'all' ? `${ch.within}&${s.sel}` : s.sel) }));
      if (ch.sort !== false) series = series.sort((x, y) => y.n - x.n);
      const S = series.length;
      const labF = fx.font(400, TYPE.label, fx.MONO);
      const maxLab = Math.max(...series.map((s) => fx.measure(ctx, s.name, labF, 0.5)));
      const axisX = MX + Math.max(maxLab, 260) + 36;
      const band = Math.min(82, 500 / S);
      const maxN = Math.max(1, ...series.map((s) => s.n));
      const scale = Math.min(1000, RX - axisX - 320) / maxN;
      const y0 = TOP - 14, y1 = TOP + S * band - band * 0.44 + 14;
      const subset = m.units.filter(within).map((u) => u.k);
      const pitch = (y1 - y0) / Math.max(1, subset.length);
      const sz = clamp(pitch * 0.8, 3, 10);
      const inSet = new Uint8Array(N);
      subset.forEach((k, r) => {
        inSet[k] = 1;
        P.x[k] = axisX - sz / 2; P.y[k] = y0 + r * pitch; P.s[k] = sz;
        P.role[k] = ROLE.base; P.group[k] = 0; P.rank[k] = r / subset.length;
      });
      ch.geo = { series, axisX, band, scale, sz, accentSel: ch.accent };
      ch.geo.hiddenFrom = true; // non-members drop from wherever they were
      P.dropOthers = inSet;
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      const labF = fx.font(400, TYPE.label, fx.MONO), valF = fx.font(700, TYPE.value, fx.SANS);
      const h = G.band * 0.56;
      const dim = 1 - 0.45 * smooth((t - T.reveal) / 0.4);
      // zero tick under the axis
      G.series.forEach((s, i) => {
        const y = TOP + i * G.band;
        const t0 = T.grow[i];
        const g = quintOut((t - t0) / T.growDur);
        const hero = ch.accent && s.sel === ch.accent;
        const [la] = enter(t, t0 - 0.15, 0);
        ctx.globalAlpha = la * a;
        ctx.font = labF; ctx.letterSpacing = '0.5px'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillStyle = hero ? pal.text : pal.muted;
        ctx.fillText(s.name, G.axisX - 26, y + h / 2 + 1);
        ctx.letterSpacing = '0px'; ctx.textAlign = 'left';
        if (g <= 0) return;
        const len = Math.max(4, s.n * G.scale) * g;
        ctx.globalAlpha = a * (hero ? 1 : 0.88 * dim);
        ctx.fillStyle = hero ? pal.accent : pal.base;
        ctx.beginPath(); ctx.roundRect(G.axisX + G.sz / 2 + 2, y, len, h, [0, 4, 4, 0]); ctx.fill();
        ctx.globalAlpha = a * clamp((t - t0) / 0.2);
        const sc = hero ? 1 + 0.35 * pulse(t, T.reveal, 0.3) : 1;
        ctx.save();
        ctx.translate(G.axisX + G.sz / 2 + 2 + len + 18, y + h / 2);
        ctx.scale(sc, sc);
        const w = fx.drawTabular(ctx, fmt(s.n * quintOut((E.tf - t0) / T.growDur)), 0, 10, valF, hero ? pal.accent : pal.text);
        ctx.restore();
        if (hero && ch.callout) drawLine(E, ch, 'callout', G.axisX + G.sz / 2 + 2 + len + 18 + w + 28, y + h / 2 + 9, accentLabel(pal), t, a, { upper: true, rise: 0 });
      });
      if (ch.foot) {
        const [fa, fdy] = enter(t, T.foot, 10);
        ctx.globalAlpha = fa * a;
        // full content width at label size; tools/validate.mjs rejects a foot that does not fit
        fx.drawRich(ctx, m.fill(ch.foot).toUpperCase(), MX, TOP + G.series.length * G.band + 44 + fdy, labelStyle(pal));
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- share: one block, a segment per category (part of the whole)
  share: {
    place(E, ch) {
      const { m, ctx, pal } = E, N = m.n, P = placement(N);
      const groups = m.groups(ch.top ?? 5, ch.restLabel);
      const accent = ch.accent ? m.match(ch.accent) : () => false;
      const K = groups.length;
      let best = null;
      for (let p = 24; p >= 4 && !best; p -= 0.5) {
        for (let rows = 1; rows * p <= 260; rows++) {
          const cols = groups.reduce((c, g) => c + Math.ceil(g.n / rows), 0) + (K - 1) * 1.5;
          if (cols * p <= CW) { best = { p, rows }; break; }
        }
      }
      const { p, rows } = best || { p: 4, rows: 65 };
      const s = sizeOf(p);
      const top = 560 - (rows * p) / 2;
      const accentGroup = groups.map((g) => g.key !== '__rest' && m.units.some((u) => g.ids.includes(u.c) && accent(u)));
      const segX = [];
      let x = MX;
      groups.forEach((g, gi) => { segX.push(x); x += Math.ceil(g.n / rows) * p + 1.5 * p; });
      const seen = new Array(K).fill(0);
      const gOf = new Int16Array(N);
      groups.forEach((g, gi) => g.ids.forEach((c) => m.units.forEach((u) => { if (u.c === c) gOf[u.k] = gi; })));
      for (let k = 0; k < N; k++) {
        const gi = gOf[k], r = seen[gi]++;
        P.x[k] = segX[gi] + Math.floor(r / rows) * p;
        P.y[k] = top + (r % rows) * p;
        P.s[k] = s; P.group[k] = gi; P.rank[k] = r / groups[gi].n;
        P.role[k] = accentGroup[gi] ? ROLE.accent : gi % 2 ? ROLE.rest : ROLE.base;
      }
      // labels: above the block if they fit their segment, else below; skipped if both rows collide
      const nameF = fx.font(400, TYPE.label, fx.MONO);
      const labels = [];
      const lastEnd = [-1e9, -1e9];
      groups.forEach((g, gi) => {
        const pctS = String(Math.round((100 * g.n) / N)) + '%';
        const big = accentGroup[gi] ? TYPE.title : TYPE.lead;
        const w = Math.max(fx.measure(ctx, g.name, nameF, 1), fx.tabularWidth(ctx, pctS, fx.font(700, big, fx.SANS)));
        const x0 = segX[gi];
        let row = -1;
        if (x0 >= lastEnd[0] + 24) row = 0;
        else if (x0 >= lastEnd[1] + 24) row = 1;
        if (row < 0) return;
        lastEnd[row] = x0 + w;
        labels.push({ gi, row, x: x0, name: g.name, pct: pctS, big, hero: accentGroup[gi] });
      });
      ch.geo = { groups, top, bottom: top + rows * p - (p - s), labels, segX };
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      for (const L of G.labels) {
        const [la, dy] = enter(t, T.land[L.gi] - 0.1, 10);
        ctx.globalAlpha = la * a;
        const sc = L.hero ? 1 + 0.18 * pulse(t, T.reveal, 0.32) + (ch.S?.closing ? 0.18 * pulse(t, lightEnd(T), 0.32) : 0) : 1;
        const pctF = fx.font(700, L.big, fx.SANS);
        const nameSty = st(pal, { weight: 400, size: TYPE.label, fam: fx.MONO, ls: 1, color: { plain: L.hero ? pal.text : pal.muted } });
        if (L.row === 0) {
          const py = G.top - 22 + dy;
          ctx.save(); ctx.translate(L.x, py); ctx.scale(sc, sc);
          fx.drawTabular(ctx, L.pct, 0, 0, pctF, L.hero ? pal.accent : stepBack(E, ch, t, pal.text));
          ctx.restore();
          fx.drawRich(ctx, L.name, L.x, py - L.big * 0.78 - 14, nameSty);
        } else {
          const py = G.bottom + 22 + L.big * 0.74 - dy;
          ctx.save(); ctx.translate(L.x, py); ctx.scale(sc, sc);
          fx.drawTabular(ctx, L.pct, 0, 0, pctF, L.hero ? pal.accent : stepBack(E, ch, t, pal.text));
          ctx.restore();
          fx.drawRich(ctx, L.name, L.x, py + 36, nameSty);
        }
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- timeline: a column of squares per period
  timeline: {
    place(E, ch) {
      const { m, ctx } = E, N = m.n, P = placement(N);
      const Pn = m.periods.length;
      const accent = ch.accent ? m.match(ch.accent) : () => false;
      const sw = CW / Pn;
      const cols = m.periods.map((_, i) => m.units.filter((u) => u.t === i));
      const maxN = Math.max(...cols.map((c) => c.length));
      const base = 860, maxH = 480;
      let p = 20, w = 1;
      for (p = 20; p >= 3; p -= 0.5) {
        w = Math.max(1, Math.floor((sw * 0.72) / p));
        if (Math.ceil(maxN / w) * p <= maxH) break;
      }
      const s = sizeOf(p);
      P.reveal = new Uint8Array(N);
      cols.forEach((list, i) => {
        const ordered = [...list.filter(accent), ...list.filter((u) => !accent(u))];
        const cx = MX + sw * (i + 0.5) - (w * p - (p - s)) / 2;
        ordered.forEach((u, r) => {
          const k = u.k;
          P.x[k] = cx + (r % w) * p;
          P.y[k] = base - s - Math.floor(r / w) * p;
          P.s[k] = s; P.group[k] = i; P.rank[k] = r / Math.max(1, list.length);
          P.role[k] = ROLE.base;
          P.reveal[k] = accent(u) ? ROLE.accent : ROLE.base;
        });
      });
      const nameF = fx.font(400, TYPE.label, fx.MONO);
      const maxLab = Math.max(...m.periods.map((s) => fx.measure(ctx, String(s), nameF, 1)));
      const every = Math.max(1, Math.ceil((maxLab + 16) / sw));
      const numW = fx.tabularWidth(ctx, fmt(maxN), fx.font(700, TYPE.value, fx.SANS));
      ch.geo = { sw, base, p, s, w, cols: cols.map((c) => c.length), every, showNums: numW + 8 <= sw, maxN };
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      ctx.globalAlpha = a * cubicOut((t - (T.step ? T.step[0] : ch.start)) / 0.4);
      ctx.fillStyle = pal.rule;
      ctx.fillRect(MX, G.base + 6, CW, 2);
      const nameSty = st(pal, { weight: 400, size: TYPE.label, fam: fx.MONO, ls: 1, color: { plain: pal.muted } });
      m.periods.forEach((name, i) => {
        const cx = MX + G.sw * (i + 0.5);
        const [la] = enter(t, T.step ? T.land[i] - 0.05 : ch.start + T.delay[i] * T.beat, 0);
        if (i % G.every === 0) {
          ctx.globalAlpha = la * a;
          fx.drawRich(ctx, String(name), cx, G.base + 42, nameSty, 'center');
        }
        const n = landedCount(E.landTimes[ch.i][i], E.tf);
        if (n > 0 && (G.showNums || G.cols[i] === G.maxN)) {
          ctx.globalAlpha = a;
          const h = Math.ceil(G.cols[i] / G.w) * G.p; // the label waits where the column will end
          fx.drawTabular(ctx, fmt(n), cx, G.base - h - 14, fx.font(700, TYPE.value, fx.SANS), stepBack(E, ch, t, pal.text), 'center');
        }
      });
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- trend: the timeline's columns, re-encoded
  // The same squares stay in their period columns and step back to `rest` as each column's top becomes a point;
  // then a curve draws through the points (lib/handoffs re-encode, drawn over the scene): the same counts, read as
  // a trend. Only after a `timeline` (tools/validate.mjs); the accent is the curve.
  trend: {
    place(E, ch) {
      const { m } = E, N = m.n, P = placement(N);
      const q = E.P?.[ch.i - 1], prev = E.chapters?.[ch.i - 1];
      let G = prev?.type === 'timeline' ? prev.geo : null;
      if (!G) { const tmp = { ...ch, accent: null }; LAYOUTS.timeline.place(E, tmp); G = tmp.geo; } // validate.mjs reports it
      for (let k = 0; k < N; k++) {
        const u = m.units[k];
        P.x[k] = q ? q.x[k] : 0; P.y[k] = q ? q.y[k] : 0; P.s[k] = q ? q.s[k] : 4;
        P.role[k] = q && q.role[k] === ROLE.hidden ? ROLE.hidden : ROLE.base;
        P.group[k] = Math.max(0, u.t); P.rank[k] = q ? q.rank[k] : 0;
      }
      // the column tops in px, so the points sit exactly on the squares (re-encode: values / max × height)
      const tops = G.cols.map((n) => (n ? Math.ceil(n / G.w) * G.p - (G.p - G.s) : 0));
      ch.geo = { ...G, tops };
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      ctx.globalAlpha = a;
      ctx.fillStyle = pal.rule;
      ctx.fillRect(MX, G.base + 6, CW, 2);
      const nameSty = st(pal, { weight: 400, size: TYPE.label, fam: fx.MONO, ls: 1, color: { plain: pal.muted } });
      const R = E.reencode?.[ch.i];
      const p = R ? clamp((t - T.reencode[0]) / T.reencode[1]) : 0;
      const S = R ? R.state(p) : null;
      m.periods.forEach((name, i) => {
        const cx = MX + G.sw * (i + 0.5);
        if (i % G.every === 0) { ctx.globalAlpha = a; fx.drawRich(ctx, String(name), cx, G.base + 42, nameSty, 'center'); }
        // the column values give way to the points
        const va = a * (S ? 1 - S.r[i] : 1);
        if (va > 0.01 && (G.showNums || G.cols[i] === G.maxN)) {
          ctx.globalAlpha = va;
          fx.drawTabular(ctx, fmt(G.cols[i]), cx, G.base - G.tops[i] - 14, fx.font(700, TYPE.value, fx.SANS), pal.text, 'center');
        }
      });
      if (R && t >= T.reencode[0]) { ctx.globalAlpha = a; R.draw(ctx, p, { dur: T.reencode[1] }); }
      // the call-out beside the last point, once the curve is drawn
      if (ch.callout) {
        const n = m.periods.length, cx = MX + G.sw * (n - 0.5), y = G.base - G.tops[n - 1] - 34;
        const sty = accentLabel(pal);
        const w = tokensWidth(placeTokens(ctx, T.lines.callout || [], sty, Infinity, true));
        drawLine(E, ch, 'callout', Math.min(RX - w, cx - w / 2), y, sty, t, a, { upper: true, rise: 0 });
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- list: one line per item, streaming to the key
  // The listed squares fly into a column of lines, one square at the head of each (its id and label beside it, from
  // the data); the list streams up and brakes onto the key item (lib/handoffs stream-brake: its exponential brake
  // and lock), whose square lights up as the reading band locks. P.y are the lines at the stream's start, P.ay where
  // the stream leaves them (the next scene's squares fly from there).
  list: {
    place(E, ch) {
      const { m } = E, N = m.n, P = placement(N);
      const L = listOf(ch, m), idx = new Int32Array(N).fill(-1);
      L.units.forEach((u, i) => { idx[u.k] = i; });
      const start = 0, count = Math.max(0, L.key);
      P.ay = new Float32Array(N);
      P.reveal = new Uint8Array(N);
      for (let k = 0; k < N; k++) {
        const i = idx[k];
        if (i < 0) { P.role[k] = ROLE.hidden; continue; }
        P.x[k] = MX; P.y[k] = LIST.band - LIST.square - 6 + (i - start) * LIST.lh; P.s[k] = LIST.square;
        P.ay[k] = P.y[k] - (count - start) * LIST.lh;
        P.role[k] = ROLE.base; P.reveal[k] = i === L.key ? ROLE.accent : ROLE.base;
        P.group[k] = 0; P.rank[k] = i / Math.max(1, L.units.length);
      }
      ch.geo = { L, start, count };
      return P;
    },
    // the reading band, under the squares: a panel behind the key line, its left edge in the accent once it locks
    under(E, ch, t, a) {
      const { ctx, pal } = E, T = ch.T, R = E.stream?.[ch.i];
      if (!R || t < T.stream[0]) return;
      const lock = R.state((t - T.stream[0]) / T.stream[1]).lock, on = cubicOut((t - T.stream[0]) / (0.25 * T.beat));
      const by = LIST.band - LIST.lh * 0.72;
      ctx.globalAlpha = a * on;
      ctx.fillStyle = fx.rgbaStr(fx.mixRgb(fx.hexRgb(pal.ground), fx.hexRgb(pal.glow), 0.5 + 0.5 * lock), 1);
      ctx.fillRect(MX - 28, by, RX - MX + 56, LIST.lh);
      ctx.fillStyle = fx.rgbaStr(fx.mixRgb(fx.hexRgb(pal.rule), fx.hexRgb(pal.accent), lock), 1);
      ctx.fillRect(MX - 28, by, 5, LIST.lh);
      ctx.globalAlpha = 1;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      const R = E.stream?.[ch.i];
      if (!R || t < T.stream[0]) return;
      const S = R.state((t - T.stream[0]) / T.stream[1]);
      const on = cubicOut((t - T.stream[0]) / (0.25 * T.beat));
      const idF = fx.font(500, TYPE.label, fx.MONO), labF = fx.font(600, TYPE.lead, fx.SANS);
      const i0 = Math.max(0, Math.floor(S.pos - (LIST.band - LIST.top) / LIST.lh) - 1), i1 = Math.min(G.L.units.length - 1, Math.ceil(S.pos + (LIST.bottom - LIST.band) / LIST.lh) + 1);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      for (let i = i0; i <= i1; i++) {
        const u = G.L.units[i], y = LIST.band + (i - S.pos) * LIST.lh;
        const wa = listFade(y - 16) * on * a;
        if (wa <= 0.003) continue;
        const key = i === G.L.key, inBand = Math.abs(y - LIST.band) < LIST.lh / 2;
        ctx.globalAlpha = wa;
        ctx.font = idF; ctx.letterSpacing = '1px'; ctx.fillStyle = pal.muted;
        ctx.fillText(u.id ?? '', MX + 44, y - 4);
        ctx.font = labF; ctx.letterSpacing = '-0.3px';
        ctx.fillStyle = inBand && key ? pal.text : pal.muted;
        ctx.fillText(u.label ?? '', MX + 150, y);
        ctx.letterSpacing = '0px';
      }
      // the key's note (from the data, glance text) as the band locks
      const u = G.L.units[G.L.key];
      if (u?.note) {
        const [na] = enter(t, T.note, 0);
        ctx.globalAlpha = na * a;
        fx.drawRich(ctx, String(u.note).toUpperCase(), RX, LIST.band - 4, labelStyle(pal), 'right');
      }
      ctx.globalAlpha = 1;
    },
  },

  // ---------------------------------------------------------------- close: up to three numbers; the squares become a rule
  // The accent number is the protagonist: 1.3 × the others' 210 px, the others drop to 150 px (principle 3).
  // Its own squares land on the rule as neutral beads and light up one by one on the downbeat of the film's
  // last bar: the closing lock-up's one secondary move. Without beads, an accent rule draws under its label.
  close: {
    place(E, ch) {
      const { m } = E, N = m.n, P = placement(N);
      const nums = ch.numbers || [];
      const K = nums.length, colW = CW / Math.max(1, K);
      const ruleY = 660;
      const hero = nums.findIndex((n) => n.accent);
      const heroSel = hero >= 0 && nums[hero].sel ? m.match(nums[hero].sel) : null;
      const heroUnits = heroSel ? m.units.filter(heroSel).map((u) => u.k) : [];
      const perRow = Math.max(1, Math.floor((colW - 56) / 18));
      const beads = heroUnits.length > 0 && heroUnits.length <= 2 * perRow ? heroUnits : []; // two rows at most
      const isBead = new Set(beads);
      const ruleUnits = m.units.filter((u) => !isBead.has(u.k)).map((u) => u.k);
      const pitch = CW / Math.max(1, ruleUnits.length);
      const sz = clamp(pitch * 0.9, 2, 6);
      ruleUnits.forEach((k, r) => {
        P.x[k] = MX + r * pitch; P.y[k] = ruleY - sz / 2; P.s[k] = sz;
        P.role[k] = ROLE.rest; P.group[k] = 0; P.rank[k] = r / ruleUnits.length;
      });
      P.reveal = new Uint8Array(N);
      P.revealAt = new Float32Array(N); // beats after T.reveal
      const step = lightStep(beads.length);
      P.reveal.set(P.role);
      beads.forEach((k, r) => {
        P.x[k] = MX + hero * colW + 6 + (r % perRow) * 18; P.y[k] = ruleY - 7 + Math.floor(r / perRow) * 18; P.s[k] = 14;
        P.role[k] = ROLE.base; P.reveal[k] = ROLE.accent; P.revealAt[k] = r * step;
        P.group[k] = 0; P.rank[k] = 1;
      });
      ch.geo = { colW, ruleY, hero, beads: beads.length };
      return P;
    },
    draw(E, ch, t, a) {
      const { ctx, pal, m } = E, T = ch.T, G = ch.geo;
      drawTitle(E, ch, t, a);
      const nums = ch.numbers || [];
      const labSty = (hero) => st(pal, { weight: 600, size: TYPE.lead, ls: -0.3, color: { plain: hero ? pal.text : pal.muted, accent: pal.accent, strong: pal.text } });
      nums.forEach((nm, k) => {
        const x = MX + k * G.colW, t0 = T.nums[k];
        const hero = nm.accent;
        const value = m.count(nm.value.replace(/[{}]/g, ''));
        const s = fmt(value);
        let size = hero ? 273 : G.hero >= 0 ? 150 : 210;
        while (size > 80 && fx.tabularWidth(ctx, s, fx.font(800, size, fx.SANS)) > G.colW - 56) size -= 4;
        const u = (t - t0) / 0.55;
        if (u <= 0) return;
        const sc = hero ? 1 + 0.12 * pulse(t, t0 + 0.05, 0.4) : 1;
        ctx.globalAlpha = a * cubicOut(u * 1.6);
        ctx.save();
        ctx.translate(x, 560 - (1 - cubicOut(u)) * 40);
        ctx.scale(sc, sc);
        fx.drawTabular(ctx, fmt(value * expOut((E.tf - t0) / 0.9)), -size * 0.03, 0, fx.font(800, size, fx.SANS), hero ? pal.accent : pal.text);
        ctx.restore();
        const ls = labSty(hero);
        ls.size = fx.fitSize(ctx, m.fill(nm.label), ls, G.colW - 40, TYPE.caption);
        fx.drawRich(ctx, m.fill(nm.label), x + 4, 616, ls);
      });
      // no beads: the closing move is an accent rule drawn under the protagonist's label
      if (!G.beads && G.hero >= 0 && T.light != null) {
        const w = (G.colW - 56) * cubicOut((t - T.light) / (LIGHT_SPAN * T.beat));
        if (w > 0) { ctx.globalAlpha = a; ctx.fillStyle = pal.accent; ctx.fillRect(MX + G.hero * G.colW + 4, G.ruleY - 3, w, 6); }
      }
      if (ch.line) drawLine(E, ch, 'line', MX + 4, 770, st(pal, { weight: 600, size: TYPE.lead, ls: -0.3, color: { plain: pal.muted, accent: pal.accent, strong: pal.text } }), t, a, { rise: 12 });
      ctx.globalAlpha = 1;
    },
  },
};

// film.js — ink renderer. render(t) paints the whole frame from t, content.js and palettes.js alone.
//
// The dot's own transformations (hop, bloom, wipe, split, iris, flood, cursor) are drawn here. Five devices come from
// the shared library (references/transitions.md), drawn with this film's type, dot and palette:
//   aperture-swap   lib/transitions (WebGL): a swap run's next ground opens from the dot, one word a beat (X18)
//   collapse-burst  lib/handoffs: a burst's word shrinks into its dot, which bursts into the next word (X11)
//   anchor-swap     lib/handoffs, 'scan': the dot holds still while a hairline scans the next world in (X13)
//   whiteout-slam   lib/transitions (WebGL): the exposure to paper and the hit into the claim (X21)
//   counter-portal  lib/handoffs: the camera pushes through a counter of the claim's type into the next scene (X23)
import FILM from './content.js';
import PALETTES from './palettes.js';
import { plan, PORTAL_GLYPHS, groundIn, groundOf as groundOfScene } from './plan.js';
import { C } from './timing.rules.js';
import { clamp, lerp, crit, bounce, cubicInOut, expOut, mixColor, hexToRgb } from './lib/motion.js';
import { hash } from './lib/rng.js';
import { grainTile, drawGrain } from './lib/canvas.js';
import { createTransitions } from './lib/transitions/index.js';
import { createHandoff, drawHandoff } from './lib/handoffs/index.js';
import collapseBurst from './lib/handoffs/collapse-burst.js';
import anchorSwap from './lib/handoffs/anchor-swap.js';
import { text as htext, measure as hmeasure, merge } from './lib/handoffs/util.js';
import { drawStreaks, drawGoo } from './fx.js';
import { createBloom, drawBloomFallback } from './bloom.js';
import { errorBanner } from './lib/text.js';

const W = 1920, H = 1080;
const PAL = PALETTES[FILM.palette] || PALETTES.cobalt;
const P = plan(FILM);
const B = P.B;
const LIGHT_NIGHT = hexToRgb(PAL.night).reduce((a, v) => a + v, 0) > 384;

// ---------- grid and type ----------
const X = 150; // left margin; content lives inside X .. W - X
const MAXW = W - 2 * X;
const SLAM = 330, SLAM_MIN = 220; // slam size and the floor auto-fit may shrink to
const CLAIM = 260, CLAIM_MIN = 160; // the claim, set at the name's width: size and auto-fit floor
const DISPLAY = 'Archivo', MONO = 'IBM Plex Mono';
const L1 = 520, L2 = 830, ONE = 640; // baselines: two lines, one line
const LABEL = 28, URL_SIZE = 40; // mono labels (every label, the step counter, the licence line); the closing URL or command
const STEP_Y = 300; // baseline of the STEP n / N counter
const CTA_DROP = 0.18, CTA_HOP = 0.3; // s: the dot's drop into the cursor slot; its hop onto the last downbeat

// Type width (content.typeWidth, mode card "Variants"): which end of Archivo's wdth axis carries the display type.
// 'compressed' (default) is the source film's extra-condensed slam; 'extended' sets every display word in the
// expanded cut (OpenType usWidthClass 7, 125 %), as wood-type printers set a line in Gothic Extended instead of
// Gothic Condensed. Same family, weight, sizes, grid, dot and choreography; only the width, the tracking that
// width needs, the word space and the name's width jumps (mirrored to run across the wide end) change.
export const TYPE_WIDTHS = {
  compressed: {
    word: 'extra-condensed', ls: -0.02, counterLs: -0.01, gap: 0.2,
    mark: 'normal', markLs: -0.035, // the name and the closing wordmark at rest
    jumps: ['condensed', 'semi-condensed', 'extra-condensed', 'semi-condensed', 'normal'],
  },
  extended: {
    word: 'expanded', ls: 0, counterLs: 0, gap: 0.26,
    mark: 'expanded', markLs: -0.01,
    jumps: ['semi-expanded', 'normal', 'condensed', 'normal', 'expanded'],
  },
};
const TW = TYPE_WIDTHS[FILM.typeWidth || 'compressed'];

const spring = (t, z = 0.62, w = 24) => bounce(t, 0, w, z);
const ease = cubicInOut;

// colours by ground: the type on it, the dot on it (the accent hue, lifted on night; paper-white on the field)
const groundHex = (g) => (g === 'night' ? PAL.night : g === 'accent' ? PAL.accent : PAL.paper);
const inkOn = (g) => (g === 'night' ? PAL.nightInk : g === 'accent' ? PAL.onAccent : PAL.ink);
const dotOn = (g) => (g === 'night' ? PAL.nightAccent : g === 'accent' ? PAL.onAccent : PAL.accent);
// the display face as the shared library's hand-offs take it (whole strings, letter-spacing in px)
const hfont = (z) => ({ family: DISPLAY, weight: 900, size: z, spacing: TW.ls * z, stretch: TW.word });
// the claim is set like the name at rest (normal width with 'compressed'): read in a pause, not slammed, and its
// counters are open enough for counter-portal to push through without the frame going black
const cfont = (z) => ({ family: DISPLAY, weight: 900, size: z, spacing: TW.markLs * z, stretch: TW.mark });

const setFont = (ctx, s) => {
  ctx.font = `${s.weight || 900} ${s.size}px "${s.family || DISPLAY}"`;
  ctx.fontStretch = s.stretch || TW.word;
  ctx.letterSpacing = ((s.ls ?? -0.02) * s.size).toFixed(2) + 'px';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
};
const advCache = new Map();
const advances = (ctx, s) => {
  const key = `${s.family}|${s.weight}|${s.size}|${s.stretch}|${s.ls}|${s.text}`;
  let xs = advCache.get(key);
  if (!xs) {
    ctx.save(); setFont(ctx, s);
    xs = [];
    // spaces inside a token open to the same gap as between tokens (TW.gap: 0.2 em, extended 0.26), so 'A MODE' never reads 'AMODE'
    const extra = Math.max(0, s.size * TW.gap - ctx.measureText(' ').width);
    let sp = 0;
    for (let i = 0; i <= s.text.length; i++) {
      xs.push(ctx.measureText(s.text.slice(0, i)).width + sp * extra);
      if (s.text[i] === ' ' && (s.family || DISPLAY) === DISPLAY) sp++;
    }
    ctx.restore();
    advCache.set(key, xs);
  }
  return xs;
};
let CTX = null;
const textWidth = (s) => { const xs = advances(CTX, s); return xs[xs.length - 1] - (s.ls ?? -0.02) * s.size; };
const startX = (s) => { const w = textWidth(s); return s.align === 'center' ? s.x - w / 2 : s.align === 'right' ? s.x - w : s.x; };
const fitSize = (spec, maxW, max, min) => { let z = max; while (z > min && maxW < textWidth({ ...spec, size: z })) z -= 2; return z; };

// Per-glyph word. mode: slam (spring scale, < 8% overshoot) | rise (through a mask line).
// outMode: up (masked, fast) | cut (instant, on the beat) | none.
const word = (ctx, s, t) => {
  const t0 = s.tIn - 0.05;
  if (t < t0) return;
  if (s.tOut !== undefined && t > s.tOut + 0.05) return;
  const sp = { ...s, stretch: s.stretchAt ? s.stretchAt(t) : s.stretch };
  const xs = advances(ctx, sp);
  const x0 = startX(sp);
  const st = s.stagger ?? 0.028;
  const masked = s.mode === 'rise' || s.outMode === 'up';
  ctx.save();
  setFont(ctx, sp);
  if (masked) { ctx.beginPath(); ctx.rect(x0 - 400, s.y - s.size * 1.0, textWidth(sp) + 800, s.size * 1.24); ctx.clip(); }
  const passes = [];
  if (s.mis !== false && s.mode === 'slam' && t >= s.tIn && t < s.tIn + 0.1) passes.push({ color: PAL.mis, dx: 5, dy: -3, alpha: 0.4 });
  passes.push({ color: s.color, dx: 0, dy: 0, alpha: 1 });
  const A = s.warp ? s.warp(t) : 0;
  for (const pass of passes) {
    ctx.fillStyle = pass.color;
    for (let i = 0; i < s.text.length; i++) {
      const ch = s.text[i];
      if (ch === ' ') continue;
      const ti = t - t0 - i * st;
      if (ti < 0) continue;
      let y = 0, sc = 1, a = 1, blur = 0, sx = 1;
      if (s.mode === 'slam') { const p = spring(ti, s.z ?? 0.62, s.w ?? 30); sc = 1 + 0.5 * (1 - p); y = -s.size * 0.1 * (1 - p); a = clamp(ti / 0.035); blur = 7 * (1 - crit(ti, 34)); }
      else if (s.mode === 'rise') { const p = spring(ti, 0.78, 22); y = s.size * 1.02 * (1 - p); blur = 6 * (1 - crit(ti, 26)); }
      if (A > 0) { const k = i * 1.7; sx = 1 + A * 0.18 * Math.sin(3.1 * t + k); y += A * s.size * 0.07 * Math.sin(2.3 * t + k * 1.3); }
      if (s.tOut !== undefined && s.outMode !== 'none') {
        if (s.outMode === 'cut') { if (t >= s.tOut) a = 0; }
        else {
          const to = t - (s.tOut - 0.2) - i * 0.008;
          if (to > 0) { const u = clamp(to / 0.17); y -= s.size * 1.25 * u * u; }
        }
      }
      if (a <= 0.001) continue;
      const gx = x0 + xs[i], gw = xs[i + 1] - xs[i];
      ctx.save();
      ctx.globalAlpha = a * pass.alpha;
      ctx.translate(gx + gw / 2 + pass.dx, s.y + y + pass.dy);
      ctx.scale(sc * sx, sc / Math.sqrt(sx));
      if (A > 0) ctx.transform(1, 0, A * 0.35 * Math.sin(1.9 * t + i * 2.2), 1, 0, 0);
      if (blur > 0.35) ctx.filter = `blur(${blur.toFixed(2)}px)`;
      if (A > 0.05) { // smear: ghost copies drifting off the glyph
        ctx.globalAlpha = a * pass.alpha * 0.28;
        ctx.fillText(ch, -gw / 2 + A * 18 * Math.sin(5.1 * t + i), A * 10 * Math.cos(4.3 * t + i));
        ctx.fillText(ch, -gw / 2 - A * 14 * Math.cos(3.7 * t + i * 2), -A * 8 * Math.sin(4.9 * t + i));
        ctx.globalAlpha = a * pass.alpha;
      }
      ctx.fillText(ch, -gw / 2, 0);
      ctx.restore();
    }
  }
  ctx.restore();
};

// Mono label that types on; a block cursor while typing. Character count is a pure function of t.
const label = (ctx, s, t) => {
  if (!s.text || t < s.tIn) return;
  if (s.tOut !== undefined && t >= s.tOut) return;
  const size = s.size || 24;
  const k = Math.min(s.text.length, Math.floor((t - s.tIn) * (s.cps || 60)) + 1);
  ctx.save();
  ctx.font = `${s.weight || 500} ${size}px "${MONO}"`;
  ctx.fontStretch = 'normal';
  ctx.letterSpacing = (size * 0.12).toFixed(2) + 'px';
  ctx.fillStyle = s.color;
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const full = ctx.measureText(s.text).width;
  const x = s.align === 'center' ? s.x - full / 2 : s.x;
  const shown = s.text.slice(0, k);
  ctx.fillText(shown, x, s.y);
  if (k < s.text.length || (s.cursorUntil !== undefined && t < s.cursorUntil)) ctx.fillRect(x + ctx.measureText(shown).width + 4, s.y - size * 0.8, size * 0.55, size * 0.95);
  ctx.restore();
};
const monoWidth = (ctx, text, size, weight = 500) => {
  ctx.save();
  ctx.font = `${weight} ${size}px "${MONO}"`; ctx.fontStretch = 'normal'; ctx.letterSpacing = (size * 0.12).toFixed(2) + 'px';
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
};

// ---------- camera: slow push per scene, decaying punch-ins on landings ----------
// The push is an ambient layer (principle 5): 1.4 %/s of scale at any tempo (13 px/s at the frame edge, inside the
// 1.5 %/s and 15 px/s limit), easing from 4.5 % into a 6.5 % ceiling, so a longer scene settles instead of pushing
// harder. Settled 2026-10-18 (batch 2 `push: 'ambient'`, accepted on the recommendation; the owner did not compare it
// shot by shot); the source's 4.5 % a bar (2.3 %/s at 124 bpm) is gone.
const PUSH_BAR = 0.014 * P.g.bar, PUSH_KNEE = 0.045, PUSH_MAX = 0.065;
const push = (bars) => {
  const p = PUSH_BAR * Math.max(0, bars);
  return p <= PUSH_KNEE ? p : PUSH_KNEE + (PUSH_MAX - PUSH_KNEE) * (1 - Math.exp(-(p - PUSH_KNEE) / (PUSH_MAX - PUSH_KNEE)));
};
const camera = (sc, t) => {
  // the bloom has its own push; a burst and a claim stand still under their hand-offs (collapse-burst, the
  // whiteout and counter-portal draw in film space)
  if (!sc || ['bloom', 'burst', 'claim'].includes(sc.type)) return 1;
  let s = 1 + push((Math.min(t, sc.end) - sc.start) / P.g.bar);
  for (const p of sc.punches || []) { const d = t - p; if (d >= 0 && d < 0.6) s *= 1 + 0.05 * Math.exp(-d * 7); }
  return s;
};
const applyCam = (ctx, s) => ctx.setTransform(s, 0, 0, s, (W / 2) * (1 - s), (H / 2) * (1 - s));
const toScreen = (s, p) => ({ x: W / 2 + (p.x - W / 2) * s, y: H / 2 + (p.y - H / 2) * s });

// ---------- layout (after fonts) ----------
const S = P.scenes;
const keys = []; // the generic dot: landing keys [{t, x, y, r, color, h, scene}]
const owns = []; // spans where a scene or a transition draws the dot itself
const sceneAt = (t) => { for (let i = S.length - 1; i >= 0; i--) if (t >= S[i].start) return S[i]; return S[0]; };
const camAt = (i, t) => { const sc = S[i]; return camera(sc, clamp(t, sc.start, sc.end - 1e-4)); };

const dotInk = (sc) => {
  if (sc.type === 'name') return PAL.onAccent;
  if (['steps', 'ruler', 'counter'].includes(sc.type)) return PAL.nightAccent;
  if (['cta', 'burst', 'claim'].includes(sc.type)) return PAL.accent;
  if (sc.type === 'swap') return dotOn(sc.items.at(-1).ground);
  return ['tobloom', 'wipe', 'iris', 'flood', 'scan', 'whiteout'].includes(sc.out) ? PAL.accent : PAL.ink; // turns accent before it transforms
};
const LINKED = ['hop', 'tobloom', 'scan']; // outs after which the next scene's dot arrives by a hop

const layoutScenes = () => {
  CTX.save();
  S.forEach((sc, i) => {
    const prev = S[i - 1];
    const hopH = 220 + 160 * hash(i, FILM.seed);
    const linkIn = prev && LINKED.includes(prev.out);
    const inAt = sc.start + sc.inDelay; // after a scan the dot reaches its place a beat in
    sc.punches = [];
    sc.words = []; sc.labels = [];
    const ownEnd = sc.ownEnd;
    const L = (k = 0) => sc.labelWins[k] || {};
    if (sc.type === 'slam') {
      const each = sc.stops === 'each';
      const lines = [];
      sc.tokens.forEach((tk) => (lines[tk.line] ||= []).push(tk));
      const base = { size: SLAM, stretch: TW.word, ls: TW.ls };
      const lineW = (z) => Math.max(...lines.map((ln) => {
        const gap = z * TW.gap + (each ? z * 0.174 : 0);
        return ln.reduce((w, tk, k) => w + textWidth({ ...base, size: z, text: tk.text }) + (k ? gap : 0), 0) + z * 0.174;
      }));
      let z = SLAM; while (z > SLAM_MIN && lineW(z) > MAXW) z -= 2;
      sc.size = z;
      const ys = lines.length === 1 ? [ONE] : [L1, L2];
      const r = z * 0.062, pg = z * 0.05;
      sc.stopsPos = [];
      lines.forEach((ln, li) => {
        const gap = z * TW.gap + (each ? z * 0.174 : 0);
        const total = ln.reduce((w, tk, k) => w + textWidth({ ...base, size: z, text: tk.text }) + (k ? gap : 0), 0) + (each || li === lines.length - 1 ? z * 0.174 : 0);
        let x = sc.align === 'center' ? W / 2 - total / 2 : X;
        ln.forEach((tk) => {
          const spec = { ...base, size: z, text: tk.text, x, y: ys[li], mode: 'slam', tIn: tk.t, tOut: sc.exitAt, outMode: 'up', color: tk.accent ? PAL.accent : PAL.ink };
          sc.words.push(spec);
          const w = textWidth(spec);
          tk.stop = { x: x + w + pg + r, y: ys[li] - r };
          sc.stopsPos.push(tk.stop);
          x += w + gap;
          sc.punches.push(tk.t);
        });
      });
      sc.r = r;
      if (sc.labelWins.length) {
        const ly = lines.length === 1 ? ONE + 90 : 190;
        const lx = sc.align === 'center' ? sc.words[0].x + 6 : X + 6;
        sc.labels.push({ ...L(0), tOut: L(0).tOut - 0.17, x: lx, y: ly, color: PAL.ink, size: LABEL }); // leaves with the words
      }
      const col = dotInk(sc);
      const last = sc.tokens[sc.tokens.length - 1];
      if (each) {
        sc.mergeEnd = last.t + 0.85 * B;
        keys.push({ t: sc.tokens[0].t, ...sc.tokens[0].stop, r, color: col, h: hopH, scene: i, fall: !linkIn });
        owns.push({ a: sc.tokens[0].t, b: sc.mergeEnd, scene: i, kind: 'split' });
        keys.push({ t: sc.mergeEnd, ...last.stop, r, color: col, h: 0, scene: i });
      } else keys.push({ t: last.t, ...last.stop, r, color: col, h: hopH, scene: i, fall: !linkIn });
    }
    if (sc.type === 'warp') {
      const base = { stretch: TW.word, ls: TW.ls };
      let z = SLAM;
      while (z > SLAM_MIN && Math.max(textWidth({ ...base, size: z, text: sc.wordText }), textWidth({ ...base, size: z, text: sc.word2Text }) + z * 0.174) > MAXW) z -= 2;
      const warpA = (t) => clamp((t - (sc.t1 + 0.3 * B)) / (2.7 * B)) * (1 + 0.25 * Math.sin(t * 9));
      sc.words.push({ ...base, size: z, text: sc.wordText, x: X, y: L1, mode: 'rise', tIn: sc.t1, tOut: sc.exitAt, outMode: 'up', color: PAL.accent, warp: warpA, mis: false });
      const w2 = { ...base, size: z, text: sc.word2Text, x: X, y: L2, mode: 'slam', tIn: sc.t2, tOut: sc.exitAt, outMode: 'up', color: PAL.ink };
      sc.words.push(w2);
      sc.punches.push(sc.t1, sc.t2);
      const r = z * 0.062;
      sc.r = r;
      if (sc.labelWins.length) sc.labels.push({ ...L(0), tOut: L(0).tOut - 0.17, x: X + 6, y: 190, color: PAL.ink, size: LABEL });
      keys.push({ t: sc.t2, x: X + textWidth(w2) + z * 0.05 + r, y: L2 - r, r, color: dotInk(sc), h: hopH, scene: i, fall: !linkIn });
    }
    if (sc.type === 'swap') {
      // one word a beat on the same anchor (left margin, the one-line baseline), each on its own ground; all words
      // share one size so the anchor never moves; the dot is each word's full stop and opens the next ground
      const base = { stretch: TW.word, ls: TW.ls };
      const z = Math.min(...sc.items.map((it) => { let q = SLAM; while (q > SLAM_MIN && textWidth({ ...base, size: q, text: it.text }) + q * 0.174 > MAXW) q -= 2; return q; }));
      const r = z * 0.062, pg = z * 0.05, n = sc.items.length;
      sc.size = z; sc.r = r;
      sc.items.forEach((it, k) => {
        it.spec = { ...base, size: z, text: it.text, x: X, y: ONE, mode: 'slam', z: 0.8, w: 44, stagger: 0.012, tIn: it.t, color: inkOn(it.ground), ...(k === n - 1 ? { tOut: sc.exitAt, outMode: 'up' } : {}) };
        it.stop = { x: X + textWidth(it.spec) + pg + r, y: ONE - r };
        sc.punches.push(it.t);
      });
      const first = sc.items[0], last = sc.items[n - 1];
      keys.push({ t: first.t, ...first.stop, r, color: dotOn(first.ground), h: hopH, scene: i, fall: !linkIn });
      owns.push({ a: first.t, b: last.t + sc.apDur, scene: i, kind: 'swap' });
      keys.push({ t: last.t + sc.apDur, ...last.stop, r, color: dotOn(last.ground), h: 0, scene: i });
    }
    if (sc.type === 'burst') {
      // collapse-burst lays the two words out itself (centred on x, its dot 0.078 of the size): this scene uses
      // the module's layout for its own frames, so the hand-off's rests are exactly this scene's frames
      const fits = (z) => { const f = hfont(z), r = Math.round(z * 0.078), gap = z * 0.035; return [sc.wordText, sc.intoText].every((w) => hmeasure(CTX, w, f).width + gap + 2 * r <= MAXW); };
      let z = SLAM; while (z > SLAM_MIN && !fits(z)) z -= 2;
      sc.size = z;
      sc.hParams = {
        from: { text: sc.wordText }, to: { text: sc.intoText }, x: W / 2, baseline: ONE, font: hfont(z),
        step: 6, cloud: 620, seed: (FILM.seed + i * 7919) % 100003, colors: { ground: PAL.paper, ink: PAL.ink, accent: PAL.accent },
      };
      sc.hP = merge(collapseBurst.defaults, sc.hParams);
      const D = (sc.hD = collapseBurst.prepare(sc.hP));
      sc.r = D.r;
      keys.push({ t: sc.land, ...D.A.dot, r: D.r, color: PAL.accent, h: hopH, scene: i, fall: !linkIn });
      owns.push({ a: sc.t0, b: sc.t1, scene: i, kind: 'burst' });
      keys.push({ t: sc.t1, ...D.B.dot, r: D.r, color: PAL.accent, h: 0, scene: i });
      if (sc.labelWins.length) sc.labels.push({ ...L(0), tOut: L(0).tOut - 0.17, x: W / 2, y: ONE + 90, align: 'center', color: PAL.ink, size: LABEL });
    }
    if (sc.type === 'claim') {
      // the claim's lines in the slam face, set whole (counter-portal traces the counter of one of them); the dot is
      // the full stop of the last line; it stands still: the whiteout lands it and the portal leaves it
      const lines = sc.claimLines, n = lines.length;
      const fits = (z) => lines.every((l, k) => hmeasure(CTX, l, cfont(z)).width + (k === n - 1 ? z * 0.174 : 0) <= MAXW);
      let z = CLAIM; while (z > CLAIM_MIN && !fits(z)) z -= 2;
      sc.size = z; sc.ys = n === 1 ? [ONE] : [L1, L2]; sc.r = z * 0.062;
      sc.widths = lines.map((l) => hmeasure(CTX, l, cfont(z)).width);
      sc.stop = { x: X + sc.widths[n - 1] + z * 0.05 + sc.r, y: sc.ys[n - 1] - sc.r };
      sc.origin = [X + Math.max(...sc.widths) / 2, (sc.ys[0] + sc.ys[n - 1]) / 2 - z * 0.36];
      if (sc.out === 'portal') {
        const li = lines.findIndex((l) => [...l].some((ch) => PORTAL_GLYPHS.includes(ch)));
        sc.portalLine = li; sc.portalChar = [...lines[li]].findIndex((ch) => PORTAL_GLYPHS.includes(ch));
      }
      // glyph by glyph (the advance of each prefix, kerning included), so the other glyphs can leave one by one
      // before the push and the portal's glyph stays exactly where it was
      sc.glyphs = [];
      lines.forEach((l, li) => [...l].forEach((ch, k) => {
        if (ch === ' ') return;
        sc.glyphs.push({ ch, line: li, k, x: X + hmeasure(CTX, [...l].slice(0, k).join(''), cfont(z)).width, portal: sc.out === 'portal' && li === sc.portalLine && k === sc.portalChar });
      }));
      // into a portal the other glyphs and the dot rise out through their line masks (ink's exit, 8 ms apart) and
      // are gone when the push starts; the portal's glyph holds
      sc.clearAt = sc.out === 'portal' ? sc.end - C.portalLead * B - C.portalClearSec : Infinity;
      owns.push({ a: sc.start, b: sc.end, scene: i, kind: 'claim' });
    }
    if (sc.out === 'tobloom') {
      const r = sc.r || 20;
      keys.push({ t: sc.end - 0.4 * B, x: W / 2, y: H / 2, r, color: PAL.accent, h: 200, scene: i });
      keys.push({ t: sc.end, x: W / 2, y: H / 2, r: 34, color: PAL.accent, h: 0, scene: i, grow: true });
    }
    if (sc.type === 'bloom') owns.push({ a: sc.start, b: sc.end, scene: i, kind: 'bloom' });
    if (sc.type === 'name') {
      const base = { size: 225, stretch: TW.mark, ls: TW.markLs, text: sc.nameText };
      const z = fitSize(base, MAXW, 225, 140);
      const steps = sc.widthSteps.map((tt, k) => [tt, TW.jumps[k]]);
      const stretchAt = (t) => { let v = TW.mark; for (const [tt, k] of steps) if (t >= tt - 0.03) v = k; return v; };
      sc.nameSpec = { ...base, size: z, x: W / 2, y: 610, align: 'center', mode: 'rise', tIn: sc.rise, tOut: sc.end, outMode: 'none', color: PAL.onAccent, stagger: 0.03, stretchAt, mis: false };
      sc.words.push(sc.nameSpec);
      sc.punches.push(sc.rise, ...sc.widthSteps);
      sc.labelWins.forEach((w) => sc.labels.push({ ...w, x: W / 2, y: 720, align: 'center', color: PAL.onAccent, size: LABEL }));
      owns.push({ a: sc.start, b: ownEnd, scene: i, kind: 'name' });
    }
    if (sc.type === 'steps') {
      const n = sc.stepTexts.length;
      const base = { stretch: TW.word, ls: TW.ls };
      const z = Math.min(...sc.stepTexts.map((w) => fitSize({ ...base, text: w }, MAXW, 300, 200)));
      // step words land on a stiffer spring than slams: the overshoot settles within 0.07 s, so a word shown for
      // one beat is still for most of it
      sc.stepTexts.forEach((w, k) => sc.words.push({ ...base, size: z, text: w, x: W / 2, y: 650, align: 'center', mode: 'slam', z: 0.8, w: 44, tIn: sc.stepAts[k], tOut: k < n - 1 ? sc.stepAts[k + 1] - 0.02 : sc.exitAt, outMode: 'cut', color: PAL.nightInk, stagger: 0.012 }));
      sc.stepTexts.forEach((w, k) => sc.labels.push({ text: `STEP ${k + 1} / ${n}`, x: W / 2, y: STEP_Y, align: 'center', tIn: sc.stepAts[k], tOut: k < n - 1 ? sc.stepAts[k + 1] : sc.exitAt, color: PAL.nightSoft, size: LABEL, cps: 400 }));
      sc.punches.push(...sc.stepAts);
      sc.dotPos = (k) => ({ x: W / 2 + (k - (n - 1) / 2) * 46, y: 850 });
      owns.push({ a: inAt, b: ownEnd, scene: i, kind: 'steps' });
      keys.push({ t: inAt, ...sc.dotPos(0), r: 11, color: PAL.nightAccent, h: 160, scene: i, popIn: !linkIn });
      keys.push({ t: ownEnd, ...sc.dotPos(n - 1), r: 11, color: PAL.nightAccent, h: 0, scene: i });
    }
    if (sc.type === 'ruler') {
      const base = { stretch: TW.word, ls: TW.ls };
      const z = fitSize({ ...base, text: sc.wordTexts.join('  ') }, MAXW - 40, SLAM, SLAM_MIN);
      const w0 = textWidth({ ...base, size: z, text: sc.wordTexts[0] }), w1 = textWidth({ ...base, size: z, text: sc.wordTexts[1] });
      const gap = z * TW.gap, x0 = W / 2 - (w0 + gap + w1) / 2;
      sc.words.push({ ...base, size: z, text: sc.wordTexts[0], x: x0, y: 600, mode: 'slam', tIn: sc.wordAts[0], tOut: sc.exitAt, outMode: 'cut', color: PAL.nightInk });
      sc.words.push({ ...base, size: z, text: sc.wordTexts[1], x: x0 + w0 + gap, y: 600, mode: 'slam', tIn: sc.wordAts[1], tOut: sc.exitAt, outMode: 'cut', color: PAL.nightInk });
      sc.labelWins.forEach((w) => sc.labels.push({ ...w, x: W / 2, y: 300, align: 'center', color: PAL.nightInk, size: LABEL }));
      sc.punches.push(...sc.wordAts);
      sc.ruler = { x0: 300, x1: W - 300, y: 760 };
      sc.headAt = (t) => ({ x: lerp(sc.ruler.x0, sc.ruler.x1, clamp(t / P.duration)), y: sc.ruler.y });
      owns.push({ a: inAt, b: ownEnd, scene: i, kind: 'ruler' });
      keys.push({ t: inAt, ...sc.headAt(inAt), r: 12, color: PAL.nightAccent, h: 140, scene: i, popIn: !linkIn });
      keys.push({ t: ownEnd, ...sc.headAt(ownEnd), r: 12, color: PAL.nightAccent, h: 0, scene: i });
    }
    if (sc.type === 'counter') {
      const base = { stretch: TW.word, ls: TW.counterLs };
      const z = Math.min(...sc.itemTexts.map((it) => fitSize({ ...base, text: it.value }, MAXW - 120, 280, 180)));
      sc.items = sc.itemTexts.map((it, k) => {
        const spec = { ...base, size: z, text: it.value, x: W / 2, y: 640, align: 'center' };
        const w = textWidth(spec), x0 = W / 2 - w / 2, r = z * 0.062;
        return { ...it, spec, x0, w, stop: { x: x0 + w + z * 0.05 + r, y: 640 - r }, r };
      });
      sc.labelWins.forEach((w) => sc.labels.push({ ...w, x: W / 2, y: 300, align: 'center', color: PAL.nightInk, size: LABEL }));
      sc.punches.push(...sc.items.map((it) => it.t));
      owns.push({ a: inAt, b: ownEnd, scene: i, kind: 'counter' });
      const lastIt = sc.items[sc.items.length - 1];
      keys.push({ t: inAt, ...sc.items[0].stop, r: sc.items[0].r, color: PAL.nightAccent, h: 160, scene: i, popIn: !linkIn });
      keys.push({ t: ownEnd, ...lastIt.stop, r: lastIt.r, color: PAL.nightAccent, h: 0, scene: i });
    }
    if (sc.type === 'cta') {
      // the wordmark carries no dot: the dot ends as the cursor of the URL or command under it
      const z0 = 210;
      const base = { stretch: TW.mark, ls: TW.markLs, text: sc.nameText };
      const z = fitSize(base, MAXW, z0, 130);
      const mw = textWidth({ ...base, size: z });
      sc.words.push({ ...base, size: z, x: W / 2 - mw / 2, y: 590, mode: 'rise', tIn: sc.rise, color: PAL.ink, stagger: 0.025, mis: false });
      const full = monoWidth(CTX, L(0).text, URL_SIZE, 600), r = URL_SIZE * 0.4, gap = 8;
      const ux = W / 2 - (gap + 2 * r) / 2; // the line and its cursor dot, centred together
      sc.labels.push({ ...L(0), tOut: undefined, x: ux, y: 700, align: 'center', color: PAL.ink, size: URL_SIZE, weight: 600, cursorUntil: sc.landAt });
      sc.cursor = { x: ux + full / 2 + gap + r, y: 700 - URL_SIZE * 0.325, r };
      if (sc.labelWins[1]) sc.labels.push({ ...L(1), tOut: undefined, x: W / 2, y: 770, align: 'center', color: PAL.soft, size: LABEL });
      if (sc.inFrom !== 'portal') sc.punches.push(sc.rise);
      sc.wordmark = sc.words[sc.words.length - 1];
      owns.push({ a: sc.landAt - CTA_DROP, b: sc.end + 1, scene: i, kind: 'cta' });
    }
    // transitions own the dot while they run
    if (sc.out === 'wipe') owns.push({ a: sc.end - B, b: sc.end, scene: i, kind: 'wipe' });
    if (sc.out === 'flood') owns.push({ a: sc.end - B, b: sc.end, scene: i, kind: 'flood' });
    if (sc.out === 'iris') owns.push({ a: sc.end - B, b: sc.end + 0.5 * B, scene: i, kind: 'iris' });
    if (sc.out === 'scan') owns.push({ a: sc.end - C.scanBeats * B, b: sc.end, scene: i, kind: 'scan' });
  });
  // scan: the dot is the anchor; it rests where the outgoing scene left it while the hairline passes, then hops on
  S.forEach((sc, i) => {
    if (sc.out !== 'scan') return;
    sc.anchorKey = { t: sc.end, ...anchorOf(sc), color: dotOn(groundIn(S[i + 1])), h: 0, scene: i };
    keys.push(sc.anchorKey);
  });
  CTX.restore();
  keys.sort((a, b) => a.t - b.t);
  // a key is linked to the one before it when the dot travels between them (same scene or a hop between scenes)
  keys.forEach((k, j) => {
    const p = keys[j - 1];
    k.link = !!p && (p.scene === k.scene || LINKED.includes(S[p.scene].out) && k.scene === p.scene + 1);
  });
};

// ---------- the generic dot ----------
const landSq = (dt) => (dt < 0 ? 0 : Math.exp(-dt * 14) * Math.cos(dt * 40) * 0.28);
// the in-place bounce of a resting dot: up 70 px and down over 0.3 s, landing on the beat, with its squash
const bounceAt = (sc, t, until = Infinity) => {
  let y = 0, last = -99;
  for (const tb of sc?.bounces || []) {
    if (tb > until) continue;
    const u = (t - (tb - C.bounceSec)) / C.bounceSec;
    if (u > 0 && u < 1) y = 70 * 4 * u * (1 - u);
    if (t >= tb) last = tb;
  }
  return { y, sq: y ? 0 : landSq(t - last) };
};
// where the dot rests at the end of a scene that leaves by a scan (film coordinates of that scene)
const anchorOf = (sc) => {
  if (sc.type === 'name') {
    const sp = { ...sc.nameSpec, stretch: sc.nameSpec.stretchAt(sc.end) };
    return { x: startX(sp) + textWidth(sp), y: 781, r: 14 };
  }
  if (sc.type === 'steps') return { ...sc.dotPos(sc.stepTexts.length - 1), r: 11 };
  if (sc.type === 'ruler') return { ...sc.headAt(sc.ownEnd), r: 12 };
  if (sc.type === 'counter') { const it = sc.items[sc.items.length - 1]; return { ...it.stop, r: it.r }; }
  const k = [...keys].reverse().find((x) => x.scene === sc.index);
  return k ? { x: k.x, y: k.y, r: k.r } : { x: W / 2, y: H / 2, r: 14 };
};
const keyScreen = (k, t) => ({ ...toScreen(camAt(k.scene, t), k), r: k.r * camAt(k.scene, t) });
const genericDot = (t) => {
  let j = keys.findIndex((k) => k.t > t);
  if (j === -1) j = keys.length;
  const prev = keys[j - 1], next = keys[j];
  if (next && !next.link) {
    // a fresh entry: rest on the previous key while its scene lasts, else fall in from above (or wait for a pop-in)
    if (prev && t < S[prev.scene].end) return { ...keyScreen(prev, t), color: prev.color, sq: landSq(t - prev.t) };
    if (!next.fall) return null;
    const p = keyScreen(next, next.t), u = clamp((t - (next.t - 0.5)) / 0.5);
    if (u <= 0) return null;
    return { x: p.x, y: lerp(-80, p.y, u * u), r: p.r, color: next.color, sq: 0, moving: true };
  }
  if (!prev) return null;
  const pp = keyScreen(prev, t);
  if (!next) return t < S[prev.scene].end ? { ...pp, color: prev.color, sq: landSq(t - prev.t) } : null;
  const tp = prev.t, tl = next.t;
  if (next.grow) { // grow in place
    const u = ease(clamp((t - tp) / (tl - tp)));
    return { ...pp, r: lerp(prev.r, next.r, u) * camAt(prev.scene, t), color: next.color, sq: landSq(t - tp) };
  }
  const hopStart = Math.max(tp + 0.15, tl - Math.min(0.9, (tl - tp) * 0.7));
  if (t < hopStart) {
    // while resting the dot bounces in place on the beats plan.js gives (no still stretch past two beats)
    const b = bounceAt(S[prev.scene], t, hopStart);
    return { ...pp, y: pp.y - b.y, color: prev.color, sq: landSq(t - tp) + b.sq };
  }
  const np = keyScreen(next, t);
  const u = (t - hopStart) / (tl - hopStart), e = ease(u);
  return {
    x: lerp(pp.x, np.x, e), y: lerp(pp.y, np.y, e) - next.h * 4 * u * (1 - u), r: lerp(pp.r, np.r, e),
    color: prev.color === next.color ? next.color : mixColor(prev.color, next.color, clamp((u - 0.35) / 0.3)), sq: 0, moving: true,
  };
};
const drawDot = (ctx, d) => {
  if (!d || d.r <= 0.2) return;
  ctx.save();
  ctx.fillStyle = d.color;
  ctx.translate(d.x, d.y + d.r * (d.sq || 0));
  ctx.scale(1 + (d.sq || 0) * 0.8, 1 - (d.sq || 0));
  ctx.beginPath(); ctx.arc(0, 0, d.r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
// motion blur for the moving dot: a few sub-frame copies over half a frame
const drawGenericDot = (ctx, t) => {
  const d = genericDot(t);
  if (!d) return;
  if (d.moving) {
    const n = 6;
    for (let i = n - 1; i >= 0; i--) {
      const di = genericDot(t - (0.5 / 30) * (i / n));
      if (!di) continue;
      ctx.globalAlpha = i === 0 ? 1 : 0.35 / n * (n - i);
      drawDot(ctx, di);
    }
    ctx.globalAlpha = 1;
  } else drawDot(ctx, d);
};
const TRANS = ['wipe', 'iris', 'flood', 'scan'];
// transitions win over the scene that owns the dot underneath them
const ownAt = (t) => owns.find((o) => TRANS.includes(o.kind) && t >= o.a && t < o.b) || owns.find((o) => t >= o.a && t < o.b);
const inOwn = (t) => !!ownAt(t);

// dot state of an owning scene at t (screen space), used by transitions
const ownedDot = (sc, t) => {
  const s = camAt(sc.index, t);
  if (sc.type === 'name') { const ph = namePlayhead(sc, t); return ph ? { ...toScreen(s, ph), r: ph.r * s, color: PAL.onAccent } : null; }
  if (sc.type === 'steps') { const k = stepIndex(sc, t); return { ...toScreen(s, sc.dotPos(k)), r: 11 * s, color: PAL.nightAccent }; }
  if (sc.type === 'ruler') return { ...toScreen(s, sc.headAt(t)), r: 12 * s, color: PAL.nightAccent };
  if (sc.type === 'counter') { const it = counterItem(sc, t); return { ...toScreen(s, it.stop), r: it.r * s, color: PAL.nightAccent }; }
  if (sc.type === 'claim') return { ...sc.stop, r: sc.r, color: PAL.accent };
  return genericDot(t);
};

// ---------- scenes ----------
const swapIndex = (sc, t) => { let k = -1; sc.items.forEach((it, j) => { if (t >= it.t) k = j; }); return k; };
const groundColor = (sc, t) => {
  if (sc.type === 'swap') return groundHex(sc.items[Math.max(0, swapIndex(sc, t ?? sc.end))].ground);
  return sc.type === 'name' ? PAL.accent : ['steps', 'ruler', 'counter'].includes(sc.type) ? PAL.night : PAL.paper;
};
const ground = (ctx, sc, t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = groundColor(sc, t);
  ctx.fillRect(0, 0, W, H);
};
const namePlayhead = (sc, t) => {
  if (t < sc.playFrom) return null;
  const sp = { ...sc.nameSpec, stretch: sc.nameSpec.stretchAt(t) };
  const x0 = startX(sp), x1 = x0 + textWidth(sp);
  const endAt = sc.out === 'wipe' || sc.out === 'iris' || sc.out === 'flood' ? sc.end - B : sc.end - 0.02;
  const u = ease(clamp((t - (sc.playFrom + 0.5 * B)) / (endAt - sc.playFrom - 0.5 * B)));
  return { x: lerp(x0, x1, u), y: 781, r: 14, x0, x1, a: clamp((t - sc.playFrom) / 0.12) };
};
const stepIndex = (sc, t) => { let k = 0; sc.stepAts.forEach((a, j) => { if (t >= a) k = j; }); return k; };
const counterItem = (sc, t) => { let it = sc.items[0]; sc.items.forEach((x) => { if (t >= x.t) it = x; }); return it; };

let bloom = null, grain = null;
const drawScene = (ctx, sc, t, { dot = true } = {}) => {
  if (sc.type === 'swap') return drawSwap(ctx, sc, t, dot);
  if (sc.type === 'burst') return drawBurst(ctx, sc, t);
  if (sc.type === 'claim') return drawClaim(ctx, sc, t, dot);
  ground(ctx, sc, t);
  if (sc.type === 'bloom') {
    const b = (t - sc.start) / B;
    const bb = clamp(b, 0, 8);
    if (bloom) ctx.drawImage(bloom.frame(bb, PAL), 0, 0);
    else drawBloomFallback(ctx, bb, PAL);
    return;
  }
  const s = camera(sc, t);
  applyCam(ctx, s);
  for (const l of sc.labels) label(ctx, l, t);
  for (const w of sc.words) word(ctx, w, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (sc.type === 'name') {
    const ph = namePlayhead(sc, t);
    if (ph) {
      applyCam(ctx, s);
      ctx.save(); ctx.globalAlpha = ph.a; ctx.fillStyle = PAL.onAccent;
      ctx.fillRect(ph.x0, 780, ph.x1 - ph.x0, 3);
      ctx.restore();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (dot && !(sc.out === 'wipe' && t >= sc.end - B)) drawDot(ctx, { ...toScreen(s, ph), r: ph.r * s, color: PAL.onAccent, sq: 0 });
    }
  }
  if (sc.type === 'steps') {
    // the bursts stay clear of the STEP counter (± 30 px around its glyphs) and of the type band
    drawStreaks(ctx, t, sc.streakAts, PAL, { seed: FILM.seed, lightNight: LIGHT_NIGHT, avoid: [[STEP_Y - LABEL * 0.8 - 30, STEP_Y + LABEL * 0.25 + 30]] });
    const n = sc.stepTexts.length, k = stepIndex(sc, t);
    const own = inOwn(t) && ownAt(t).kind === 'steps';
    applyCam(ctx, s);
    for (let j = 0; j < n; j++) {
      const p = sc.dotPos(j);
      const pop = clamp((t - sc.start - j * 0.025) / 0.18);
      if (pop <= 0) continue;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9 * expOut(pop), 0, Math.PI * 2);
      if (j < k || (j === k && !own)) { ctx.fillStyle = PAL.nightInk; ctx.fill(); }
      else if (j > k) { ctx.strokeStyle = PAL.nightSoft; ctx.lineWidth = 2; ctx.stroke(); }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (own && dot) { // the current step's dot is THE dot; after the last step it bounces in place (plan.js)
      const p = toScreen(s, sc.dotPos(k)), bb = bounceAt(sc, t);
      drawDot(ctx, { ...p, y: p.y - bb.y * s * 0.6, r: 11 * s, color: PAL.nightAccent, sq: bb.y ? 0 : landSq(t - sc.stepAts[k]) + bb.sq });
    }
  }
  if (sc.type === 'ruler') {
    const R = sc.ruler, u = expOut(clamp((t - sc.start) / 0.5));
    const hd = sc.headAt(sc.start);
    const a = lerp(hd.x, R.x0, u), b = lerp(hd.x, R.x1, u);
    applyCam(ctx, s);
    ctx.save(); ctx.strokeStyle = PAL.nightInk; ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(a, R.y); ctx.lineTo(b, R.y); ctx.stroke();
    const beats = P.bars * P.g.beatsPerBar;
    for (let k = 0; k <= beats; k++) {
      const x = lerp(R.x0, R.x1, k / beats);
      if (x < a - 0.5 || x > b + 0.5) continue;
      const h = k % 4 === 0 ? 30 : 12;
      ctx.beginPath(); ctx.moveTo(x, R.y - h); ctx.lineTo(x, R.y); ctx.stroke();
    }
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (inOwn(t) && ownAt(t).kind === 'ruler' && dot) drawDot(ctx, { ...toScreen(s, sc.headAt(t)), r: 12 * s, color: PAL.nightAccent, sq: landSq(t - sc.start) });
  }
  if (sc.type === 'counter') {
    applyCam(ctx, s);
    sc.items.forEach((it, k) => {
      if (t < it.t - 0.05 || t >= it.tOut) return;
      if (it.roll) {
        // digits roll up to their value; laid out from the final string's width so nothing shifts
        const u = 1 - Math.pow(1 - clamp((t - it.t) / sc.rollDur), 3);
        // each character sits in its final glyph slot; numbers count up right-aligned in their slots
        const txt = it.value.replace(/\d+/g, (m) => String(Math.round(Number(m) * u)).padStart(m.length, ' '));
        const xs = advances(ctx, it.spec);
        ctx.save(); setFont(ctx, it.spec); ctx.fillStyle = PAL.nightInk; ctx.textAlign = 'center';
        for (let c = 0; c < txt.length; c++) if (txt[c] !== ' ') ctx.fillText(txt[c], it.x0 + (xs[c] + xs[c + 1]) / 2, 640);
        ctx.restore();
      } else word(ctx, { ...it.spec, mode: 'slam', tIn: it.t, tOut: it.tOut, outMode: 'cut', color: PAL.nightInk, stagger: 0.02 }, t);
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (inOwn(t) && ownAt(t).kind === 'counter' && dot) {
      const it = counterItem(sc, t);
      const k = sc.items.indexOf(it), nx = sc.items[k + 1];
      // the stop waits at the end of the final width and lands when the value is complete; it hops to the next value's stop
      const landAt = it.roll ? it.t + sc.rollDur : it.t;
      let p = toScreen(s, it.stop), r = it.r;
      if (nx && t >= nx.t - 0.3) {
        const u = clamp((t - (nx.t - 0.3)) / 0.3), e = ease(u), q = toScreen(s, nx.stop);
        p = { x: lerp(p.x, q.x, e), y: lerp(p.y, q.y, e) - 120 * 4 * u * (1 - u) };
        r = lerp(it.r, nx.r, e);
      }
      const bb = nx && t >= nx.t - 0.3 ? { y: 0, sq: 0 } : bounceAt(sc, t);
      drawDot(ctx, { ...p, y: p.y - bb.y * s, r: r * s, color: PAL.nightAccent, sq: bb.y ? 0 : landSq(t - landAt) + bb.sq });
    }
  }
  if (sc.type === 'cta' && dot && t >= sc.landAt - CTA_DROP) {
    // the dot drops the last few pixels into the cursor's place and lands on the beat (contact frame), rests there
    // as the cursor, and on the last downbeat hops in place and lands again (the closing card's second move)
    const c = sc.cursor;
    let y = c.y, sq = 0, a = 1;
    if (t < sc.landAt) { const u = clamp((t - (sc.landAt - CTA_DROP)) / CTA_DROP); y = c.y - 46 * (1 - u * u); a = clamp(u / 0.4); }
    else {
      sq = landSq(t - sc.landAt);
      const h0 = sc.lastDown - CTA_HOP;
      if (sc.lastDown > sc.landAt + CTA_HOP && t >= h0) {
        const u = clamp((t - h0) / CTA_HOP);
        if (u < 1) { y = c.y - 36 * 4 * u * (1 - u); sq = 0; } else sq = landSq(t - sc.lastDown);
      }
    }
    applyCam(ctx, s);
    ctx.globalAlpha = a;
    drawDot(ctx, { x: c.x, y, r: c.r, color: PAL.accent, sq });
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  if (sc.type === 'slam' && sc.stops === 'each' && dot) drawSplit(ctx, sc, t);
};

// split: each landing word buds a new full stop off the previous one; at the end they merge back into one
const drawSplit = (ctx, sc, t) => {
  const o = ownAt(t);
  if (!o || o.kind !== 'split') return;
  const s = camera(sc, t);
  const toks = sc.tokens, r = sc.r * s;
  const last = toks[toks.length - 1];
  const mergeA = last.t + 0.45 * B, mergeB = sc.mergeEnd;
  const dots = [];
  toks.forEach((tk, k) => {
    if (k === 0) { dots.push({ ...toScreen(s, tk.stop), r }); return; }
    if (t < tk.t - 0.22) return;
    const from = toScreen(s, toks[k - 1].stop), to = toScreen(s, tk.stop);
    const u = ease(clamp((t - (tk.t - 0.22)) / 0.22));
    // the bud arcs over the word it is about to close, so it never slides through the letters
    const arc = sc.size * s * (Math.abs(to.y - from.y) < 1 ? 1.0 : 0.35);
    dots.push({ x: lerp(from.x, to.x, u), y: lerp(from.y, to.y, u) - arc * Math.sin(Math.PI * u), r });
  });
  const L = toScreen(s, last.stop);
  if (t > mergeA) dots.forEach((d, k) => {
    const u = ease(clamp((t - mergeA - (toks.length - 1 - k) * 0.03) / (mergeB - mergeA - 0.09)));
    const arc = Math.abs(d.y - L.y) < 1 ? sc.size * s * 1.0 : sc.size * s * 0.3;
    d.x = lerp(d.x, L.x, u); d.y = lerp(d.y, L.y, u) - arc * Math.sin(Math.PI * u);
  });
  drawGoo(ctx, dots, dotInk(sc));
};

// ---------- the shared library: offscreen frames for the WebGL transitions ----------
let GL = null;
const gl = () => (GL ??= createTransitions(null, { width: W, height: H }));
const offs = new Map();
const off = (name) => {
  if (!offs.has(name)) { const c = document.createElement('canvas'); c.width = W; c.height = H; offs.set(name, c); }
  const c = offs.get(name), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
  return [c, g];
};

// ---------- swap (X18 aperture-swap) ----------
// state k of a swap run: word k on its ground with its dot; k = -1 is the first ground, bare
const swapState = (ctx, sc, k, t, dot) => {
  const it = sc.items[Math.max(0, k)];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = groundHex(it.ground); ctx.fillRect(0, 0, W, H);
  if (k < 0) return;
  const s = camera(sc, t);
  applyCam(ctx, s);
  word(ctx, it.spec, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (dot && inOwn(t) && ownAt(t).kind === 'swap') drawDot(ctx, { ...toScreen(s, it.stop), r: sc.r * s, color: dotOn(it.ground), sq: landSq(t - it.t) });
};
// on each beat the next ground opens from the dot of the word before (circle), or from its line (band, closing
// bars), or cuts; the anchor and the baseline hold
const drawSwap = (ctx, sc, t, dot) => {
  const k = swapIndex(sc, t), it = sc.items[k];
  if (k > 0 && it.ap !== 'cut' && t < it.t + sc.apDur) {
    const [ca, ga] = off('a'), [cb, gb] = off('b');
    swapState(ga, sc, k - 1, t, dot); swapState(gb, sc, k, t, dot);
    const o = toScreen(camera(sc, t), sc.items[k - 1].stop);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(gl().draw('aperture-swap', ca, cb, (t - it.t) / sc.apDur, { shape: it.ap, origin: [o.x, o.y] }), 0, 0);
    return;
  }
  swapState(ctx, sc, k, t, dot);
};

// ---------- burst (X11 collapse-burst) ----------
// a whole word slammed (scale 1.5 → 1 on the slam spring, blur, the misregistration ghost on the impact frame); at
// rest it is exactly the hand-off's own text, drawn by the same function at the same place
const slamWhole = (ctx, str, x, y, f, color, tIn, t, tOut) => {
  if (t < tIn - 0.05) return;
  const ti = t - (tIn - 0.05), settled = ti > 0.45;
  const p = settled ? 1 : spring(ti, 0.62, 30), k = 1 + 0.5 * (1 - p), dy = -f.size * 0.1 * (1 - p);
  const a = clamp(ti / 0.035), blur = settled ? 0 : 7 * (1 - crit(ti, 34));
  const out = tOut === undefined ? 0 : clamp((t - (tOut - C.wordExitSec)) / 0.17);
  if (out >= 1) return;
  const w = hmeasure(ctx, str, f).width, cx = x + w / 2, cy = y - f.size * 0.36;
  ctx.save();
  if (out > 0) { ctx.beginPath(); ctx.rect(0, y - f.size, W, f.size * 1.24); ctx.clip(); }
  const pass = (col, ox, oy, alpha) => {
    ctx.save();
    ctx.globalAlpha = a * alpha;
    if (k !== 1 || dy || out) { ctx.translate(cx + ox, cy + oy + dy - f.size * 1.25 * out * out); ctx.scale(k, k); ctx.translate(-cx, -cy); }
    else if (ox || oy) ctx.translate(ox, oy);
    if (blur > 0.35) ctx.filter = `blur(${blur.toFixed(2)}px)`;
    htext(ctx, str, x, y, f, { color: col });
    ctx.restore();
  };
  if (t >= tIn && t < tIn + 0.1) pass(PAL.mis, 5, -3, 0.4);
  pass(color, 0, 0, 1);
  ctx.restore();
};
const drawBurst = (ctx, sc, t) => {
  const D = sc.hD, P = sc.hP;
  if (t >= sc.t0 && t < sc.t1 && sc.handoff) { // the hand-off paints the frame (paper, word, dot, particles)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    sc.handoff.draw(ctx, (t - sc.t0) / (sc.t1 - sc.t0), { dur: sc.t1 - sc.t0 });
    return;
  }
  ground(ctx, sc, t);
  if (t < sc.t0) slamWhole(ctx, sc.wordText, D.A.x, P.baseline, P.font, PAL.ink, sc.land, t);
  else slamWhole(ctx, sc.intoText, D.B.x, P.baseline, P.font, PAL.ink, sc.t1 - 1, t, sc.exitAt);
  for (const l of sc.labels) label(ctx, l, t);
};

// ---------- claim (X21 whiteout-slam in, X23 counter-portal out) ----------
// the claim at rest, ink on paper (the whiteout's white settles into the paper it is printed on); ground: false and
// the current transform when counter-portal paints it in its own space
const paintClaim = (ctx, sc, t, { dot = true, ground: fill = true, portalGlyph = true } = {}) => {
  if (fill) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  const z = sc.size, f = cfont(z);
  let order = 0;
  const out = (y) => { // rise-out offset of the next glyph in exit order, or null when gone
    const u = clamp((t - sc.clearAt - order++ * 0.008) / 0.17);
    return u >= 1 ? null : -z * 1.25 * u * u;
  };
  for (const g of sc.glyphs) {
    if (g.portal) { if (portalGlyph) htext(ctx, g.ch, g.x, sc.ys[g.line], f, { color: PAL.ink }); continue; }
    const dy = out();
    if (dy == null) continue;
    const y = sc.ys[g.line];
    ctx.save();
    if (dy) { ctx.beginPath(); ctx.rect(0, y - z, W, z * 1.24); ctx.clip(); }
    htext(ctx, g.ch, g.x, y + dy, f, { color: PAL.ink });
    ctx.restore();
  }
  const dy = out();
  if (dot && dy != null) {
    const y = sc.ys.at(-1);
    ctx.save();
    if (dy) { ctx.beginPath(); ctx.rect(0, y - z, W, z * 1.24); ctx.clip(); }
    ctx.fillStyle = PAL.accent; ctx.beginPath(); ctx.arc(sc.stop.x, sc.stop.y + dy, sc.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
};
let CLAIM_T = 0; // the claim's time while counter-portal paints its marks
const drawClaim = (ctx, sc, t, dot = true) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (sc.out === 'portal' && sc.portal) {
    // the next scene shows inside the counter from the claim's first frame; the push runs 1.5 beats from 1.8
    // beats before the end, so the strokes leave the frame on the claim's last beat and it has landed half a beat early
    const pd = C.portalBeats * B;
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
    CLAIM_T = t;
    sc.portal.draw(ctx, clamp((t - (sc.end - C.portalLead * B)) / pd), { dur: pd });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }
  paintClaim(ctx, sc, t, { dot: dot && !(inOwn(t) && TRANS.includes(ownAt(t).kind)) });
};
// the far side of the counter: the next scene's first frame without its ground (counter-portal fills it); the
// closing card shows its wordmark already at rest there (it skips its rise after a portal)
const farSide = (ctx, Bn) => {
  if (Bn?.type === 'cta' && Bn.wordmark) word(ctx, Bn.wordmark, Bn.start);
};

// ---------- transitions ----------
const farthest = (p) => Math.max(Math.hypot(p.x, p.y), Math.hypot(W - p.x, p.y), Math.hypot(p.x, H - p.y), Math.hypot(W - p.x, H - p.y));
const drawTransition = (ctx, o, t) => {
  const A = S[o.scene], Bn = S[o.scene + 1];
  const d0 = ownedDot(A, o.a - 1e-3) || { x: W / 2, y: H / 2, r: 14, color: PAL.accent };
  const bt = (t - A.end) / B; // beats relative to the downbeat of the next scene
  if (o.kind === 'wipe') {
    // the dot stretches into a bar, then the bar opens as a window onto the next scene
    const u1 = expOut(clamp((bt + 1) / 0.5));
    const u2 = Math.pow(clamp((bt + 0.5) / 0.48), 2.2); // accelerates open, fully open just before the downbeat
    const r = d0.r;
    const left = lerp(d0.x - r, -10, u1), right = lerp(d0.x + r, W + 10, u1);
    const open = u2 * (Math.max(d0.y, H - d0.y) + 20);
    ctx.save();
    if (open > 0.5) {
      ctx.beginPath(); ctx.rect(0, d0.y - open, W, open * 2); ctx.clip();
      drawScene(ctx, Bn, t, { dot: false });
      ctx.restore(); ctx.save();
    }
    const edge = lerp(r, 3, u2);
    ctx.fillStyle = d0.color;
    if (open <= 0.5) { ctx.beginPath(); ctx.roundRect(left, d0.y - r, right - left, 2 * r, r * (1 - u1)); ctx.fill(); }
    else { ctx.fillRect(left, d0.y - open - edge, right - left, edge); ctx.fillRect(left, d0.y + open, right - left, edge); }
    ctx.restore();
  }
  if (o.kind === 'scan') {
    // lib/handoffs anchor-swap 'scan': the dot holds still (the anchor) while a hairline sweeps down and the next
    // world is already printed above it; the dot takes the next ground's colour as the line passes it
    const a = keyScreen(A.anchorKey, t), p = clamp((t - (A.end - C.scanBeats * B)) / (C.scanBeats * B));
    const P = { swap: 'scan', anchor: [a.x, a.y], unit: 1, zoom: 1, hole: a.r };
    const y = anchorSwap.at(p, P).y ?? -10, fromCol = d0.color, toCol = A.anchorKey.color;
    drawHandoff(ctx, 'anchor-swap', p, {
      ...P,
      from: (c) => drawScene(c, A, t, { dot: false }),
      to: (c) => drawScene(c, Bn, t, { dot: false }),
      anchorPaint: (c, at, R) => drawDot(c, { x: at[0], y: at[1], r: R, color: y > at[1] ? toCol : fromCol, sq: 0 }),
      colors: { ground: groundColor(A, t), ink: inkOn(groundOfScene(A)), accent: PAL.accent },
    });
  }
  if (o.kind === 'iris' || o.kind === 'flood') {
    const iris = o.kind === 'iris';
    const grow = expOut(clamp((bt + 1) / 0.5));
    const R = farthest(d0) + 30;
    const end = iris ? 0.5 : 0;
    const open = iris ? cubicInOut(clamp((bt + 0.5) / (end + 0.5))) : Math.pow(clamp((bt + 0.5) / 0.48), 2.2);
    const hole = open * R + (iris ? grow * d0.r * 1.4 : 0);
    const ring = iris ? lerp(d0.r * (1 + 1.6 * grow), 8, open) : 0;
    const col = iris ? d0.color : mixColor(d0.color, groundColor(Bn), grow);
    ctx.save();
    if (hole > 0.5) {
      ctx.beginPath(); ctx.arc(d0.x, d0.y, hole, 0, Math.PI * 2); ctx.clip();
      drawScene(ctx, Bn, Math.max(t, Bn.start - 0.5 * B), { dot: t >= Bn.start });
      ctx.restore(); ctx.save();
    }
    ctx.fillStyle = col;
    ctx.beginPath();
    if (iris) { ctx.arc(d0.x, d0.y, hole + ring, 0, Math.PI * 2); ctx.arc(d0.x, d0.y, hole, 0, Math.PI * 2, true); }
    else if (hole <= 0.5) ctx.arc(d0.x, d0.y, d0.r * (1 + 0.4 * grow), 0, Math.PI * 2);
    ctx.fill('evenodd');
    ctx.restore();
  }
};

// ---------- margin gate ----------
// P0: no display word or stop crosses the 150 px margin at rest. Auto-fit stops at each slot's floor, so copy too
// wide for the floor would overflow silently; it is painted as a red banner and raised as a page error instead,
// which `hyperframes check` reports, so `npm run film` stops. Matters most for typeWidth 'extended', whose words
// are about twice as wide (TEMPLATE.md gives the character limits per width).
const overflows = () => {
  const bad = [];
  const out = (what, a, b) => { if (a < X - 1 || b > W - X + 1) bad.push(`scenes[${what}] spans ${Math.round(a)}–${Math.round(b)} px; the margin is ${X}–${W - X}`); };
  S.forEach((sc, i) => {
    for (const w of sc.words) {
      const states = w.stretchAt ? [TW.mark, ...TW.jumps] : [w.stretch];
      for (const st of states) { const sp = { ...w, stretch: st }, x0 = startX(sp); out(`${i}] (${sc.type}) "${w.text}" at ${st}`, x0, x0 + textWidth(sp)); }
    }
    for (const p of sc.stopsPos || []) out(`${i}] (${sc.type}) full stop`, p.x - sc.r, p.x + sc.r);
    if (sc.type === 'swap') for (const it of sc.items) out(`${i}] (swap) "${it.text}"`, X, it.stop.x + sc.r);
    if (sc.type === 'burst') for (const side of ['A', 'B']) out(`${i}] (burst) "${side === 'A' ? sc.wordText : sc.intoText}"`, sc.hD[side].x, sc.hD[side].dot.x + sc.hD.r);
    if (sc.type === 'claim') sc.claimLines.forEach((l, k) => out(`${i}] (claim) "${l}"`, X, k === sc.claimLines.length - 1 ? sc.stop.x + sc.r : X + sc.widths[k]));
    for (const it of sc.items || []) out(`${i}] (counter) "${it.value}"`, it.x0, it.stop.x + it.r);
  });
  return bad;
};

// ---------- frame ----------
let laidOut = false;
export const ready = async () => {
  layoutScenes();
  laidOut = true;
  const bad = overflows();
  if (bad.length) {
    const lines = ['TEXT CROSSES THE MARGIN — shorten it (TEMPLATE.md: character limits per typeWidth)', ...bad];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-margin-error');
    setTimeout(() => { throw new Error(`margin: ${bad.join('; ')}`); }, 0);
  }
  // the shared library's hand-offs (they measure and sample the type: after the fonts) and WebGL transitions
  for (const sc of S) {
    if (sc.type === 'burst') sc.handoff = await createHandoff('collapse-burst', sc.hParams);
    if (sc.type === 'claim' && sc.out === 'portal') {
      const g = sc.glyphs.find((x) => x.portal), Bn = S[sc.index + 1];
      sc.portal = await createHandoff('counter-portal', {
        glyph: { text: g.ch, counter: 0, counterAt: [0.5, 0.5] },
        x: g.x, baseline: sc.ys[g.line], font: cfont(sc.size), parallax: 0.55, ground: false,
        colors: { ground: PAL.paper, ink: PAL.ink, portal: groundHex(groundIn(Bn)) },
        from: (c) => paintClaim(c, sc, CLAIM_T, { ground: false, portalGlyph: false }),
        to: (c) => farSide(c, Bn),
      });
    }
  }
  if (S.some((s) => s.type === 'swap' || s.type === 'claim')) {
    if (!gl()) { console.error('[ink] WebGL unavailable: aperture-swap and whiteout-slam cannot draw'); errorBanner(['WEBGL UNAVAILABLE', 'aperture-swap and whiteout-slam need WebGL'], 'hf-webgl-error'); }
    else gl().warm();
  }
  if (S.some((s) => s.type === 'bloom')) {
    try { bloom = await createBloom({ seed: FILM.seed }); } catch (e) {
      bloom = null;
      console.error('[ink] bloom: ' + e.message);
      errorBanner(['BLOOM NOT BAKED', e.message], 'hf-bloom-error');
    }
  }
  grain = grainTile(FILM.seed % 100000, 256, 70);
};
export const fonts = [
  { family: DISPLAY, weight: 900, stretch: 'extra-condensed' },
  { family: DISPLAY, weight: 900, stretch: 'normal' },
  { family: MONO, weight: 500 },
  { family: MONO, weight: 600 },
];
export const setContext = (ctx) => { CTX = ctx; };
export const duration = P.duration;

// one frame without the whiteout and the grain
const frame = (ctx, t) => {
  const sc = sceneAt(t);
  const o = ownAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  if (o && o.kind === 'iris' && t >= S[o.scene].end) {
    // past the downbeat the old scene only survives outside the opening iris: draw it frozen, then the iris
    drawScene(ctx, S[o.scene], S[o.scene].end - 1e-3, { dot: false });
    drawTransition(ctx, o, t);
  } else {
    drawScene(ctx, sc, t);
    if (!inOwn(t)) drawGenericDot(ctx, t);
    if (o && TRANS.includes(o.kind)) drawTransition(ctx, o, t);
  }
};
export const render = (ctx, t) => {
  if (!laidOut) return; // fonts not measured yet; boot draws again once ready
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  // lib/transitions whiteout-slam into a claim: the scene before exposes to paper over its last beat while the
  // camera leans into the claim, two paper frames on the bar line, then the claim lands with blur, scale and a
  // small channel offset decaying in 0.45 s while its ground falls back from paper to night
  // The hit (the end of the build, where the claim appears at full shock on white) is on the claim's bar line.
  const dur = C.slamBeats * B;
  const wo = S.find((x) => x.type === 'claim' && x.index > 0 && t >= x.start - dur / 2 && t < x.start + dur / 2);
  if (wo && gl()) {
    const [ca, ga] = off('wa'), [cb, gb] = off('wb'), t0 = wo.start - dur / 2;
    frame(ga, Math.min(t, wo.start - 1e-3));
    drawClaim(gb, wo, Math.max(t, wo.start));
    ctx.drawImage(gl().draw('whiteout-slam', ca, cb, (t - t0) / dur, {
      dur, origin: wo.origin, blur: 26, shift: 10, zoom: 0.16, colors: { paper: PAL.paper, ground: PAL.paper },
    }), 0, 0);
  } else frame(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawGrain(ctx, grain, t, { alpha: 0.1, mode: 'overlay' });
};

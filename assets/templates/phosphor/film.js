// film.js — phosphor composition. Builds the DOM and one paused GSAP timeline from content.js, then
// renders every frame from t (lib/boot.js wires hf-seek and Studio scrubbing to render(t)).
// Per-frame values (HUD, cursors, counters, travelling dots, canvases, grain) are computed in render(t);
// everything else is a tween or a set on the timeline. No value depends on the previous frame.
import content from './content.js';
import palettes from './palettes.js';
import { fit as fitTiming } from './lib/timing.js';
import rules from './timing.rules.js';
import { plan, CRT, MORPH_BEATS, PUSH } from './events.js';
import { boot } from './lib/boot.js';
import { mulberry32, hash } from './lib/rng.js';
import { hexToRgb, crit, clamp, mixColor } from './lib/motion.js';
import { createHandoff, progressAt } from './lib/handoffs/index.js';
import { createTransitions } from './lib/transitions/index.js';
import { grainTile, drawGrain } from './lib/canvas.js';
import { fontsReady } from './lib/text.js';
import * as FX from './fx.js';

const C = content;
const PAL = palettes[C.palette] || palettes.phosphor;
// Length follows content: lib/timing.js fit() sizes every scene from timing.rules.js (see TEMPLATE.md).
const fitted = fitTiming(C, rules);
const { g, laid, chapterCount } = plan(C, fitted);
const B = g.beat, FPS = 30, D = fitted.duration;
const root = document.getElementById('root');
const stage = document.getElementById('stage');
const problems = [];
if (!palettes[C.palette]) problems.push(`palette "${C.palette}" is not in palettes.js`);

// Settled 2026-10-18 (batch 2 comparison; accepted on the recommendation, the owner did not compare the options
// shot by shot): minimal HUD, the hero on the horizon, the cursor lock-up, the accent for passed / proven only,
// key content enlarged, ambient layers inside the draft limit. None of those options is left; the one form
// variant is `screen`, below (2026-10-19).
if (C.variant) problems.push('content.variant was removed: the batch 2 options are settled (TEMPLATE.md)');
// The screen the terminal is shown on (mode card, Variants; 2026-10-19): `crt` (default) draws the raster —
// 2 px scanlines, scanline-striped display type, the vignette of a tube's edge fall-off; `flat` is a flat
// panel, as a GPU terminal draws it today: no raster, no stripes, no vignette. Nothing else changes.
const SCREENS = ['crt', 'flat'];
const SCREEN = C.screen ?? 'crt';
if (!SCREENS.includes(SCREEN)) problems.push(`screen "${C.screen}" is not one of ${SCREENS.join(', ')}`);
if (SCREEN === 'flat') root.classList.add('screen-flat');
for (const n of fitted.notes) {
  const msg = `fit: ${n.scene != null ? `scene ${n.scene + 1} ` : ''}${n.msg}`; // numbered from 1, as `npm run fit` prints
  if (n.level === 'error') problems.push(msg); else console.warn(msg);
}

// ------------------------------------------------------------------ palette → CSS variables
for (const k of ['bg', 'bgHi', 'bgLo', 'ink', 'muted', 'dim', 'line', 'panel', 'accent', 'hi', 'deep', 'on', 'bad', 'find', 'key', 'titleHi', 'titleLo']) root.style.setProperty(`--${k}`, PAL[k]);
const rgbOf = (h) => hexToRgb(h).join(',');
root.style.setProperty('--a-rgb', rgbOf(PAL.accent));
root.style.setProperty('--bad-rgb', rgbOf(PAL.bad));
root.style.setProperty('--find-rgb', rgbOf(PAL.find));
root.style.setProperty('--muted-rgb', rgbOf(PAL.muted));
root.style.setProperty('--panel-rgb', rgbOf(PAL.panel));
const A = rgbOf(PAL.accent);
// Marks that are not "passed / proven" (structure, focus, the human's choices) are neutral: the accent is left
// to what passed or is proven (Accent role, settled 2026-10-18).
const MK = { c: PAL.muted, hi: PAL.ink, rgb: rgbOf(PAL.muted) };

// ------------------------------------------------------------------ small utilities
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const $ = (el, sel) => el.querySelector(sel);
const $$ = (el, sel) => Array.from(el.querySelectorAll(sel));
const html = (parent, s) => { parent.insertAdjacentHTML('beforeend', s); return parent.lastElementChild; };
const box = (el) => { // position in composition pixels, independent of preview scaling
  const r = el.getBoundingClientRect(), R = root.getBoundingClientRect(), k = R.width / 1920;
  return { x: (r.left - R.left) / k, y: (r.top - R.top) / k, w: r.width / k, h: r.height / k };
};
// Width of an element's content (not its box): text set in a fixed-width centred box measures correctly.
const textW = (el) => {
  const r = document.createRange();
  r.selectNodeContents(el);
  const k = root.getBoundingClientRect().width / 1920;
  return r.getBoundingClientRect().width / k;
};
const fit = (el, maxW, maxPx, minPx) => {
  let px = maxPx;
  el.style.fontSize = px + 'px';
  while (textW(el) > maxW + 0.5 && px > minPx) { px -= 1; el.style.fontSize = px + 'px'; }
  if (textW(el) > maxW + 0.5) problems.push(`text too long for its slot (${Math.round(textW(el))} > ${maxW} px): "${el.textContent.slice(0, 48)}…"`);
  return px;
};
// [text] → stressed span (hero sub: ink against the muted sub); {text} → keyword span (code panels)
const accentMarks = (s) => esc(s).replace(/\[([^\]]+)\]/g, '<span class="ink">$1</span>');
const braces = (h) => h.replace(/\{([^}]+)\}/g, '<span class="k">$1</span>');
const codeLine = (s) => {
  if (s.startsWith('## ')) return `<span class="h">${braces(esc(s))}</span>`;
  let h = braces(esc(s)).replace(/\|/g, '<span class="p">|</span>');
  if (s.startsWith('- ')) h = '<span class="p">-</span>' + h.slice(1);
  return h;
};
const plain = (s) => String(s).replace(/^## /, '').replace(/[{}]/g, '');

// SHA-256 (sync) so hashes on screen are computed from the text on screen.
const sha256 = (msg) => {
  const K = [], H = [];
  const isPrime = (n) => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
  const frac = (x) => ((x - Math.floor(x)) * 4294967296) >>> 0;
  for (let n = 2, i = 0; i < 64; n++) if (isPrime(n)) { if (i < 8) H[i] = frac(Math.pow(n, 1 / 2)); K[i++] = frac(Math.pow(n, 1 / 3)); }
  const bytes = Array.from(new TextEncoder().encode(msg)), len = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (len >>> (i * 8)) & 255);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, gg, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & gg)) + K[i] + w[i]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = gg; gg = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + gg) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
};

// Text of each freeze document as finally frozen (gap additions included); the head id hashes all of them.
const finalDocs = (s) => (s.docs || []).map((d, di) => {
  const lines = [...d.lines];
  (s.gaps || []).filter((gp) => gp.doc === di && gp.add).sort((a, b) => b.after - a.after).forEach((gp) => lines.splice(gp.after + 1, 0, gp.add));
  return lines;
});
const HEAD = sha256([C.meta?.title, ...laid.filter((s) => s.type === 'freeze').flatMap((s) => finalDocs(s).flat().map(plain))].join('\n')).slice(0, 7);
const tokens = (s) => esc(s).replace(/\{head\}/g, `<span class="ink">${HEAD}</span>`);

// ------------------------------------------------------------------ logos (drawn in code)
const LOGO = {
  check: (px, sw = 2.6) => `<svg width="${px}" height="${px}" viewBox="0 0 40 40" style="flex:none"><rect x="2" y="2" width="36" height="36" rx="8" fill="none" stroke="${MK.c}" stroke-width="${sw}"/><path d="M12 13 L7 20 L12 27 M28 13 L33 20 L28 27" fill="none" stroke="${MK.c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 20.5 L19 24 L25 16" fill="none" stroke="${MK.hi}" stroke-width="${sw + 0.2}" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  prompt: (px, sw = 2.6) => `<svg width="${px}" height="${px}" viewBox="0 0 40 40" style="flex:none"><rect x="2" y="2" width="36" height="36" rx="8" fill="none" stroke="${MK.c}" stroke-width="${sw}"/><path d="M10 13 L17 20 L10 27" fill="none" stroke="${MK.c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 27 H30" stroke="${MK.hi}" stroke-width="${sw + 0.2}" stroke-linecap="round"/></svg>`,
  none: () => '',
};
const logo = (px, sw) => (LOGO[C.brand?.logo] || LOGO.check)(px, sw);
const ICON = {
  github: (px) => `<svg width="${px}" height="${px}" viewBox="0 0 16 16" style="flex:none"><path fill="${PAL.ink}" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`,
  link: (px) => `<svg width="${px}" height="${px}" viewBox="0 0 24 24" style="flex:none" fill="none" stroke="${PAL.ink}" stroke-width="2.2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>`,
  none: () => '',
};

// ------------------------------------------------------------------ timeline helpers (absolute times)
let tl;
const IR = { immediateRender: false };
let SEED = 1;
const rnd = () => mulberry32(((C.seed | 0) * 7919 + SEED++ * 104729) >>> 0);
const frames = []; // per-frame hooks: (t) => void
const blinks = []; // { el, t0, t1, before, after }

// A light layer: a screen-blended shot (fibres, sphere, horizon glow) whose light is added to the ground. A .scene
// is its own stacking context, so a blend inside it meets only the scene's transparent backdrop and covers like a
// plain layer; with the shots' black canvases that painted the ground, grid and crosses black. The layer sits next
// to its scene in #stage instead, in the scenes' layer (z-index 5): `before` the scene (under its content) or
// `after` it (over it, screening over the scene too). It shows only from `from` (default the scene's start) to the
// scene's end, display: none otherwise (a blend layer in the root changes how Chrome composites the whole frame
// even at opacity 0, so frames outside that span render exactly as without it), and copies the scene's transform
// each frame, so the exit glitch still moves it with the scene. Callers tween the layer's opacity, never its
// transform. Fixed 2026-10-19 (mode card, Known issues; the end card first, then the burst and the sphere).
const lightLayer = (s, sec, { where = 'before', cls = '', style = '', inner = '', from = s.start } = {}) => {
  sec.insertAdjacentHTML(where === 'after' ? 'afterend' : 'beforebegin', `<div data-layout-allow-overflow class="shot ${cls}" style="left:0;top:0;width:1920px;height:1080px;z-index:5;mix-blend-mode:screen;${style}display:none">${inner}</div>`);
  const el = where === 'after' ? sec.nextElementSibling : sec.previousElementSibling;
  frames.push((t) => {
    const on = t >= from && t < s.end;
    el.style.display = on ? 'block' : 'none';
    if (on) el.style.transform = sec.style.transform;
  });
  return el;
};

// Decode (mode principle 5): a line resolves left to right through glyphs of its own alphabet, on the model of
// lib/handoffs scramble-resolve (X15): every cell shows a glyph re-rolled `rate` times a second (rng.js hash with
// the decode's seed) until its lock time, cells lock in reading order, and the alphabet comes from the content
// itself (the line's own letters and digits; hex for hashes and ids). The module's timing parameters (scramble,
// per, appear, rate) are read from its defaults in ready() and scaled to the decode's length; the cells are DOM
// text here because display type is DOM (gradient, scanline stripes, the RGB split), which the module's canvas
// painter cannot draw. A pure function of t: frames() sets every decoding element's text.
let SR = { scramble: 0.35, per: 0.035, appear: 0.012, rate: 24 };
const decodes = new Map(); // el → [{ t0, dur, text, alphabet, seed }]
const HEX = '0123456789abcdef';
const alphabetOf = (text) => {
  const u = [...new Set([...String(text)].filter((c) => /[\p{L}\p{N}]/u.test(c)))].join('');
  return /^[0-9a-f]+$/i.test(u) && u.length > 2 ? HEX : u.length >= 5 ? u : u + HEX;
};
function scramble(el, text, t0, dur, alphabet) {
  const list = decodes.get(el) || [];
  list.push({ t0, dur, text: String(text), alphabet: alphabet || alphabetOf(text), seed: ((C.seed | 0) * 131 + SEED++) % 997 });
  list.sort((a, b) => a.t0 - b.t0);
  decodes.set(el, list);
  if (el.classList.contains('rgb')) el.setAttribute('data-text', text);
}
const decodedAt = (d, t) => {
  const tau = t - d.t0, chars = [...d.text], n = chars.length;
  if (tau >= d.dur) return d.text;
  const sc = Math.min(SR.scramble, 0.45 * d.dur), per = n > 1 ? (d.dur - sc) / (n - 1) : 0, ap = Math.min(SR.appear, sc / Math.max(1, n));
  const frame = Math.floor(tau * SR.rate);
  let out = '';
  for (let i = 0; i < n; i++) {
    if (!(tau > i * ap)) break;
    const ch = chars[i];
    out += ch === ' ' || tau >= sc + i * per ? ch : d.alphabet[Math.floor(hash(i + 1000 * d.seed, frame) * d.alphabet.length)];
  }
  return out;
};
frames.push((t) => {
  for (const [el, list] of decodes) {
    let d = null;
    for (const x of list) if (x.t0 <= t) d = x;
    const s = d ? decodedAt(d, t) : '';
    if (el.textContent !== s) el.textContent = s;
  }
});
function typeText(el, text, t0, cps = 38) {
  const chars = [...text];
  for (let i = 0; i <= chars.length; i++) tl.set(el, { textContent: chars.slice(0, i).join('') }, t0 + i / cps);
  return t0 + chars.length / cps;
}
// RGB split: an effect colour, at most 0.1 s (3 frames, principle 7).
function rgbHit(el, t0, dur = 0.1, amp = 12) {
  dur = Math.min(dur, 0.1);
  const r = rnd(), n = Math.round(dur * FPS);
  for (let k = 0; k < n; k++) tl.set(el, { '--gx': ((r() * 2 - 1) * amp).toFixed(1) + 'px', '--ga': r() > 0.25 ? 0.95 : 0.35 }, t0 + k / FPS);
  tl.set(el, { '--gx': '0px', '--ga': 0 }, t0 + n / FPS);
}
function jitter(el, t0, dur = 0.25, amp = 18, lean = 0) {
  const r = rnd(), n = Math.round(dur * FPS);
  for (let k = 0; k < n; k++) tl.set(el, { x: Math.round((r() * 2 - 1 + 0.6 * lean) * amp), skewX: (r() * 2 - 1 + 0.5 * lean) * 4 }, t0 + k / FPS);
  tl.set(el, { x: 0, skewX: 0 }, t0 + n / FPS);
}
const tearBars = $$(root, '#tears i');
function tear(t0, dur = 0.25) {
  const r = rnd(), n = Math.round(dur * FPS);
  for (let k = 0; k < n; k++) tearBars.forEach((b) => tl.set(b, { top: Math.floor(r() * 1040), height: 2 + Math.floor(r() * 26), opacity: r() > 0.45 ? 0.25 + r() * 0.5 : 0, x: Math.floor((r() * 2 - 1) * 200) }, t0 + k / FPS));
  tearBars.forEach((b) => tl.set(b, { opacity: 0 }, t0 + n / FPS));
}
function flash(t, peak = 0.85, decay = 0.35) {
  tl.set('#flash', { opacity: peak }, t);
  tl.to('#flash', { opacity: 0, duration: decay, ease: 'power2.out' }, t + 1 / FPS);
}
function inn(el, t, from = { y: 24 }, dur = 0.45, ease = 'power3.out') {
  tl.fromTo(el, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, scale: 1, duration: dur, ease, ...IR }, t);
}
function out(el, t, dur = 0.2) { tl.to(el, { opacity: 0, duration: dur, ease: 'power1.in' }, t); }
const blink = (el, t0, t1, before = 1, after = 1, until = Infinity) => blinks.push({ el, t0, t1, before, after, until });
// Finite yoyo pulse from t0 to t1 on a half-beat.
function pulse(el, t0, t1, vars) {
  const n = Math.max(2, 2 * Math.floor((t1 - t0) / B));
  tl.to(el, { ...vars, duration: B / 2, repeat: n - 1, yoyo: true, ease: 'sine.inOut' }, t0);
}
// The exit glitch ends two frames before the cut, so the next scene's first frame reads as a new onset.
// The glitch cut leans left or right (its variant), so two in one film are never the same (T2, api 3).
const exitGlitch = (sec, t, end, dur = 0.25, lean = 0) => { const d = Math.max(0.1, Math.min(dur, end - t - 2 / FPS)); jitter(sec, t, d, 30, lean); tear(t, d); };

// Travelling dot along an SVG path, drawn per frame.
function travel(path, dot, t0, dur, repeat = 1) {
  const L = path.getTotalLength();
  frames.push((t) => {
    const u = (t - t0) / dur;
    if (u < 0 || u >= repeat) { dot.setAttribute('opacity', 0); return; }
    const f = u % 1, e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    const p = path.getPointAtLength(e * L);
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('opacity', 1);
  });
}
function drawPath(path, t0, dur = 0.45) {
  const L = path.getTotalLength();
  path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
  tl.to(path, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t0);
}

// ------------------------------------------------------------------ shared page header + chapter card
// The chapter card's title IS the page header: it slams in centred, then flies to the top-left corner. A
// `decide` page continues the chapter: its header is already in place, nothing decodes.
// During the flight the title carries motion blur along its direction of travel, computed from t: the blur
// is an SVG Gaussian along x inside a wrapper rotated to the direction (the content is counter-rotated), with
// σ = half the travel per frame on screen, at most 48 px (principle 6).
const easeFlight = gsap.parseEase('expo.inOut');
let mbId = 0;
const svgDefs = (() => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('width', '0'); el.setAttribute('height', '0');
  el.style.position = 'absolute';
  root.appendChild(el);
  return el;
})();
function pageHeader(s, sec, maxW = 1700) {
  const T = s.T, at = (x) => s.start + x, ch = s.chapter;
  const [a, b] = ch ? ch.title : s.continues ? s.continues.title : s.title;
  const wrap = html(sec, '<div class="abs" style="inset:0"></div>');
  // the scanline mask sits inside the blurred wrapper, so the blur is not clipped to the title's box
  const ph = html(wrap, `<div class="abs ph disp"><div class="mbr"><div class="mbu stripe"><span class="sw"></span> <span class="sw"></span></div></div></div>`);
  const [sa, sb] = $$(ph, 'span');
  sa.textContent = a; sb.textContent = b;
  const w = ph.offsetWidth, hh = ph.offsetHeight;
  sa.textContent = ''; sb.textContent = '';
  const ps = Math.min(84 / 150, maxW / w);
  const noteText = s.note ?? s.continues?.note;
  const note = noteText ? html(sec, `<div class="abs psub mono a">${esc(noteText)}</div>`) : null;
  if (note) fit(note, 1700, 25, 25);
  if (ch) {
    const cs = Math.min(1, 1700 / w), cx = (1920 - w * cs) / 2 - 110, cy = 520 - (hh * cs) / 2 - 92;
    const num = html(sec, `<div class="abs card-num mono">${String(s.chapterNo).padStart(2, '0')} / ${String(chapterCount).padStart(2, '0')}</div>`);
    const sub = ch.card ? html(sec, `<div class="abs card-sub mono a">${esc(ch.card)}</div>`) : null;
    if (sub) fit(sub, 1700, 32, 32);
    tl.fromTo(ph, { x: cx, y: cy, scale: cs * 1.25 }, { x: cx, y: cy, scale: cs, duration: 0.5, ease: 'expo.out', ...IR }, at(0));
    scramble(sa, a, at(T.cardTitle), 0.4);
    scramble(sb, b, at(T.cardTitle2), 0.45);
    if (sub) { sub.classList.remove('a'); sub.textContent = ''; typeText(sub, ch.card, at(T.cardSub), T.cardCps); }
    tl.to(ph, { x: 0, y: 0, scale: ps, duration: T.flightDur, ease: 'expo.inOut' }, at(T.flight));
    // halfway through a long card the number and the card line light (muted → ink), crisp, two frames: a T0 change
    // that is not new text
    if (T.cardLight != null) tl.to([num, sub].filter(Boolean), { color: PAL.ink, duration: 2 / FPS, ease: 'none' }, at(T.cardLight));
    out(num, at(T.flight), 0.12);
    if (sub) out(sub, at(T.flight), 0.12);
    if (note) inn(note, at(T.flight + 0.45 * B), { x: -14 }, 0.35);
    // motion blur of the flight
    const id = `mb${++mbId}`;
    svgDefs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>`);
    const gb = svgDefs.lastElementChild.firstElementChild;
    const rot = $(ph, '.mbr'), unrot = $(ph, '.mbu');
    const t0 = at(T.flight), dur = T.flightDur;
    const pos = (p) => { const e = easeFlight(clamp(p, 0, 1)), k = cs + (ps - cs) * e; return { x: cx * (1 - e) + (w * k) / 2, y: cy * (1 - e) + (hh * k) / 2, k }; };
    frames.push((t) => {
      const p = (t - t0) / dur;
      if (p <= 0 || p >= 1) { if (rot.style.filter) { rot.style.filter = ''; rot.style.transform = ''; unrot.style.transform = ''; } return; }
      const h = 0.5 / FPS / dur, a0 = pos(p - h), a1 = pos(p + h); // travel over one frame, centred on t
      const dx = a1.x - a0.x, dy = a1.y - a0.y, k = pos(p).k;
      const sigma = Math.min(48, 0.5 * Math.hypot(dx, dy));
      if (sigma < 0.3) { rot.style.filter = ''; rot.style.transform = ''; unrot.style.transform = ''; return; }
      const th = Math.atan2(dy, dx);
      gb.setAttribute('stdDeviation', `${(sigma / k).toFixed(2)} 0`);
      rot.style.transform = `rotate(${th.toFixed(4)}rad)`;
      unrot.style.transform = `rotate(${(-th).toFixed(4)}rad)`;
      rot.style.filter = `url(#${id})`;
    });
  } else {
    tl.set(ph, { scale: ps }, at(0));
    if (s.continues) { sa.textContent = a; sb.textContent = b; }
    else { scramble(sa, a, at(0.1 * B), 0.4); scramble(sb, b, at(0.3 * B), 0.45); }
    // a page that continues the chapter keeps its note in place; a note of its own enters
    if (note && s.continues && noteText === s.continues.note) note.classList.remove('a');
    else if (note) inn(note, at(Math.max(0.3 * B, (s.lead ?? 0) * B)), { x: -14 }, 0.35);
  }
  return { right: 110 + w * ps, ph, note, wrap };
}
const strip = (sec, items) => (items?.length ? html(sec, `<div class="abs strip a">${items.map((x) => `<b>▸</b> ${esc(x)}`).join('    ')}</div>`) : null);
const winBar = (title, right, dots = true) => `<div class="bar mono">${dots ? '<i></i><i></i><i></i>&nbsp;' : ''}${esc(title)}<span class="r">${esc(right || '')}</span></div>`;

// ------------------------------------------------------------------ scenes
const BUILD = {};

// Opening: a hook typed at a cursor; problems flash as tags; everything is pulled into the cursor, which
// becomes the point the burst converges on and, after the flash, the hero sphere grows from.
BUILD.boot = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const chars = (str, cls) => [...str].map((c) => `<span class="c ${cls}">${esc(c)}</span>`).join('');
  const p = html(sec, `<div class="abs boot-p mono"><span class="pfx ink">› </span>${chars(s.prompt || '', '')}</div>`);
  fit(p, 1640, 50, 44);
  const ppx = parseFloat(p.style.fontSize);
  const q = html(sec, `<div class="abs boot-q disp stripe"></div>`);
  q.innerHTML = String(s.question || '').split(' ').map((w) => {
    const isStress = s.stress && w.replace(/[^\w-]/g, '') === s.stress;
    return `<span class="${isStress ? 'stress' : 'word'}" style="display:inline-block">${chars(w, 'sw')}</span>`;
  }).join('<span class="c sw"> </span>');
  const qpx = fit(q, 1640, 150, 96);
  const tags = html(sec, `<div class="abs boot-tags mono">${(s.problems || []).slice(0, 4).map(([w, d]) => `<div class="tag bad a">✕ ${esc(w)}${d ? ` · ${esc(d)}` : ''}</div>`).join('')}</div>`);
  if (textW(tags) > 1700) problems.push('boot.problems do not fit on one row at 25 px: shorten them or drop one');
  // vertical layout: prompt, question, tags centred as one block
  const pH = p.offsetHeight, qH = q.offsetHeight, tH = tags.offsetHeight;
  const top = 540 - (pH + 36 + qH + 56 + tH) / 2;
  p.style.top = top + 'px';
  q.style.top = top + pH + 36 + 'px';
  tags.style.top = top + pH + 36 + qH + 56 + 'px';
  // per-character reveal; the line keeps its final, centred layout while it types
  const pc = $$(p, '.c'), qc = $$(q, '.c');
  const rise = 540 - pH / 2 - top; // the prompt types alone at the frame's centre, then rises as the hook types (a shot)
  pc.forEach((c, i) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, at(T.line1) + i / T.cps1));
  qc.forEach((c, i) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, at(T.line2) + i / T.cps2));
  pc.forEach((c) => (c.style.opacity = 0));
  qc.forEach((c) => (c.style.opacity = 0));
  // cursors sit after the last revealed character
  const cw1 = ppx * 0.5, ch1 = ppx * 1.05, cw2 = qpx * 0.42, ch2 = qpx * 0.74;
  const cur = html(sec, `<div class="abs cur" style="width:${cw1}px;height:${ch1}px;margin:0"></div>`);
  const cur2 = html(sec, `<div class="abs cur" style="width:${cw2}px;height:${ch2}px;margin:0;opacity:0"></div>`);
  const pb = pc.map(box), qb = qc.map(box), p0 = box($(p, '.pfx')), qBox = box(q);
  const y1 = p0.y + (p0.h - ch1) / 2, y2 = qBox.y + (qBox.h - ch2) / 2 + qpx * 0.04;
  const after = (bs, n, x0) => (n > 0 ? bs[n - 1].x + bs[n - 1].w + 6 : x0);
  const qx0 = qb.length ? qb[0].x : 960;
  let grow = 0; // set below when the stress word pushes its neighbours aside
  const liveAfter = (n) => { if (!n) return qx0; const b = box(qc[n - 1]); return b.x + b.w + 6; };
  frames.push((t) => {
    const n1 = clamp(Math.floor((t - at(T.line1)) * T.cps1) + 1, 0, pc.length);
    cur.style.left = after(pb, n1, p0.x + p0.w) + 'px';
    cur.style.top = y1 + Number(gsap.getProperty(p, 'y')) + 'px';
    const n2 = clamp(Math.floor((t - at(T.line2)) * T.cps2) + 1, 0, qc.length);
    if (t < at(T.collapse)) { cur2.style.left = liveAfter(n2) + 'px'; cur2.style.top = y2 + 'px'; }
    else if (t < at(T.point)) { cur2.style.left = endX + 'px'; cur2.style.top = y2 + 'px'; }
  });
  blink(cur, at(0), at(T.line2), 1, 0);
  blink(cur2, at(T.line2), at(T.collapse), 0, 1, at(T.burst[1] - 0.2));
  // the key word isolates and grows; the rest steps back
  const stress = $(q, '.stress');
  if (stress) {
        grow = (stress.offsetWidth * (1.14 - 1)) / 2;
    tl.fromTo(stress, { scale: 1 }, { scale: 1.14, duration: 0.45, ease: 'back.out(2.2)', transformOrigin: '50% 75%', ...IR }, at(T.stress));
    // neighbours make room, so the grown word never touches them
    const kids0 = [...q.children], si0 = kids0.indexOf(stress);
    kids0.forEach((el, i) => i !== si0 && tl.fromTo(el, { x: 0 }, { x: i < si0 ? -grow : grow, duration: 0.45, ease: 'back.out(2.2)', ...IR }, at(T.stress)));
    tl.to($$(q, '.word'), { opacity: 0.5, duration: 0.3 }, at(T.stress));
  }
  $$(tags, '.tag').forEach((tg, i) => inn(tg, at(T.problems[i]), { scale: 0.8, y: 10 }, 0.3, 'back.out(2.5)'));
  // everything is pulled into the cursor, far pieces first so they arrive together
  const endX = after(qb, qc.length, qx0) + grow, target = { x: endX + cw2 / 2, y: y2 + ch2 / 2 };
  const parts = [...pc, $(p, '.pfx'), ...qc, ...$$(tags, '.tag')];
  // characters live inside words that were shifted (or, for the key word, scaled): undo that in their deltas
  const kids = [...q.children], si = stress ? kids.indexOf(stress) : -1, SC = 1.14;
  const sb = stress ? box(stress) : null;
  const ds = parts.map((el) => {
    const b = box(el);
    let cx = b.x + b.w / 2, cy = b.y + b.h / 2, k = 1;
    const word = el.parentElement === q ? el : el.parentElement?.parentElement === q ? el.parentElement : null;
    if (word && stress && word === stress) {
      const ox = sb.x + sb.w / 2, oy = sb.y + 0.75 * sb.h;
      cx = ox + (cx - ox) * SC; cy = oy + (cy - oy) * SC; k = SC;
    } else if (word && stress) cx += kids.indexOf(word) < si ? -grow : grow;
    return { el, dx: (target.x - cx) / k, dy: (target.y - cy) / k };
  });
  const dmax = Math.max(...ds.map((d) => Math.hypot(d.dx, d.dy)), 1);
  ds.forEach(({ el, dx, dy }) => {
    const d = Math.hypot(dx, dy) / dmax;
    tl.fromTo(el, { x: 0, y: 0, scale: 1, filter: 'blur(0px)' }, { x: dx, y: dy, scale: 0.05, opacity: 0, filter: 'blur(6px)', duration: T.collapseDur * (0.5 + 0.5 * d), ease: 'power3.in', ...IR }, at(T.collapse + (1 - d) * 0.5 * B));
  });
  // the cursor becomes a point of light at the frame centre (both shadows list four lengths, so GSAP pairs
  // spread with spread and colour with colour; with three, the accent's red value became the spread and the
  // glow a yellow-green square, fixed 2026-10-19)
  tl.fromTo(cur2, { left: endX, top: y2, width: cw2, height: ch2, borderRadius: 0, boxShadow: `0 0 14px 0px rgba(${A},0.6)` },
    { left: 960 - 7, top: 540 - 7, width: 14, height: 14, borderRadius: 7, boxShadow: `0 0 40px 14px rgba(${A},0.9)`, duration: 0.8 * B, ease: 'expo.inOut', ...IR }, at(T.point));
  // burst
  // over the scene, as when it was the scene's last child; shown once it fades in
  const shot = lightLayer(s, sec, { where: 'after', style: 'opacity:0;', inner: '<canvas width="1920" height="1080"></canvas>', from: at(T.burst[0] + 0.15) });
  const draw = FX.burst($(shot, 'canvas'), PAL, (C.seed | 0) + 9031);
  tl.fromTo(shot, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.in', ...IR }, at(T.burst[0] + 0.15));
  frames.push((t) => { if (t >= at(T.burst[0]) - 0.04 && t < s.end) draw((t - at(T.burst[0])) / (T.burst[1] - T.burst[0])); });
  tear(at(T.burst[1] - 0.57), 0.55);
  flash(at(T.flash), 0.95, 0.5);
  gsap.set(p, { y: rise }); // measured above at its final place
  tl.fromTo(p, { y: rise }, { y: 0, duration: 0.35, ease: 'expo.out', ...IR }, at(T.line2));
  return { dims: [[p], [tags]] };
};

// Legacy opening (close to the reference film): a terminal audit, four rows red, a fix command, rows flip green.
BUILD.audit = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const cmd = html(sec, `<div class="abs audit-cmd mono"><span class="t"></span><span class="cur"></span></div>`);
  const rows = (s.rows || []).slice(0, 4).map((r, i) => html(sec, `<div class="row" style="top:${250 + i * 150}px"><div class="hl"></div><div class="idx mono">[${String(i + 1).padStart(2, '0')}]</div><div class="word disp stripe sw rgb" data-text=""></div><div class="tag bad mono a">× ${esc(r.bad)}</div></div>`));
  blink($(cmd, '.cur'), at(0), s.end);
  typeText($(cmd, '.t'), s.command || '', at(T.cmd), T.cps);
  rows.forEach((row, i) => {
    const w = $(row, '.word');
    w.textContent = s.rows[i].word; fit(w, 1000, 108, 94); w.textContent = '';
    scramble(w, s.rows[i].word, at(T.rows[i]), 0.32);
    inn($(row, '.tag'), at(T.rows[i] + 0.12), { x: 40 }, 0.3);
  });
  tl.set($(cmd, '.t'), { textContent: '' }, at(T.fixCmd - 0.02));
  typeText($(cmd, '.t'), s.fix || '', at(T.fixCmd), T.fixCps);
  rows.forEach((row, i) => {
    const t = at(T.flips[i]), w = $(row, '.word'), tag = $(row, '.tag'), hl = $(row, '.hl');
    tl.set(w, { attr: { class: 'word disp stripe sg rgb' } }, t);
    scramble(w, s.rows[i].word, t, 0.24);
    rgbHit(w, t, 0.24, 10);
    tl.set(tag, { attr: { class: 'tag good mono' }, textContent: '✓ ' + s.rows[i].good }, t + 0.08);
    tl.fromTo(hl, { opacity: 0 }, { opacity: 1, duration: 0.15, ...IR }, t);
    tl.to(hl, { opacity: 0.35, duration: 0.4 }, t + 0.3);
  });
  // over the scene, as when it was the scene's last child; shown once it fades in
  const shot = lightLayer(s, sec, { where: 'after', style: 'opacity:0;', inner: '<canvas width="1920" height="1080"></canvas>', from: at(T.burst[0] + 0.15) });
  const draw = FX.burst($(shot, 'canvas'), PAL, (C.seed | 0) + 9031);
  tl.fromTo(shot, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.in', ...IR }, at(T.burst[0] + 0.15));
  frames.push((t) => { if (t >= at(T.burst[0]) - 0.04 && t < s.end) draw((t - at(T.burst[0])) / (T.burst[1] - T.burst[0])); });
  jitter(sec, at(T.burst[1] - 0.57), 0.5, 30);
  tear(at(T.burst[1] - 0.57), 0.55);
  tl.to(rows, { opacity: 0.25, duration: 0.4, ease: 'power2.in' }, at(T.burst[1] - 0.47));
  flash(at(T.flash), 0.95, 0.5);
  return { dims: [[cmd]] };
};

// Hero: the claim under the horizon. The sphere stays where the opening's point of light left it, at the frame
// centre, and rises out of a horizon line that draws out from that point; the claim, its sub and the facts (one
// mono row) stand centred under the line. The same horizon closes the film (horizon-tagline). Settled
// 2026-10-18 (was: sphere left, pill, claim right, key/value list).
const HERO_HZ = 540; // screen y of the line, the opening's point of light
BUILD.hero = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  if (s.pill) problems.push('hero.pill was removed: it only repeated the HUD licence');
  const host = lightLayer(s, sec, { cls: 'hero-hz-mask', inner: `<div data-layout-allow-overflow class="shot hero-wrap"><canvas width="1800" height="1013"></canvas></div>` }); // under the claim
  const wrap = host.firstElementChild;
  // the push runs over the first two bars and eases to a stop; after it only the sphere's surface moves
  // (ambient: rings scroll ≈ 4 px/s, dust turns ≤ 12 px/s, highlight streaks ≤ 14 px/s)
  const push = Math.min(s.dur, 2 * g.bar);
  const draw = FX.sphere($(wrap, 'canvas'), PAL, (C.seed | 0) + 5150, { push });
  tl.set(wrap, { x: 470, y: HERO_HZ - 535, scale: 1 }, at(0)); // canvas centre (720, 405) on (960, HERO_HZ)
  if (push > 0.9) tl.to(wrap, { scale: 1 + 0.0128 * (push - 0.9), duration: push - 0.9, ease: 'power1.out' }, at(0.9));
  frames.push((t) => { if (t >= s.start - 0.04 && t < s.end) draw(t - s.start, crit(t - s.start, 7)); });
  const [l1, l2] = s.lines || ['', ''];
  const h1a = html(sec, `<div class="abs h1 disp stripe sw rgb" data-text=""></div>`);
  const h1b = html(sec, `<div class="abs h1 disp stripe"><span class="sw t"></span><span class="sw u">_</span></div>`);
  h1a.textContent = l1; $(h1b, '.t').textContent = l2;
  const px = Math.min(fit(h1a, 1700, 108, 94), fit(h1b, 1700, 108, 94));
  h1a.style.fontSize = h1b.style.fontSize = px + 'px';
  // centred by measured width, so the decode only moves the right end
  [h1a, h1b].forEach((el) => { el.style.left = Math.round((1920 - textW(el)) / 2) + 'px'; });
  h1a.textContent = ''; $(h1b, '.t').textContent = '';
  const y1 = HERO_HZ + 34, y2 = y1 + px * 1.065;
  h1a.style.top = y1 + 'px'; h1b.style.top = y2 + 'px';
  const sub = html(sec, `<div class="abs hero-sub a">${accentMarks(s.sub || '')}</div>`);
  Object.assign(sub.style, { left: '110px', width: '1700px', textAlign: 'center' });
  const subTop = y2 + px + 26;
  sub.style.top = subTop + 'px';
  if (sub.offsetHeight > 40 * 1.5 * 2 + 2) problems.push('hero.sub wraps to more than two lines at 40 px: shorten it');
  const row = html(sec, `<div class="abs kv mono" style="left:0;width:1920px;text-align:center;top:${subTop + sub.offsetHeight + 22}px"></div>`);
  const facts = (s.facts || []).slice(0, 3).map(([k, v], i) => html(row, `<span class="a" style="display:inline-block">${i ? '<span class="d">    ·    </span>' : ''}<span class="k" style="width:auto;margin-right:0.6em">${esc(k)}</span>${esc(v)}</span>`));
  if (textW(row) > 1700) problems.push('hero.facts do not fit on one row at 25 px: shorten them');
  if (subTop + sub.offsetHeight + 22 + 34 > 990) problems.push('hero: claim, sub and facts run past the content area: shorten the sub to one line');
  const line = html(sec, `<div class="abs hero-hz" style="top:${HERO_HZ - 1}px"></div>`);
  tl.fromTo(line, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.9, ease: 'expo.out', ...IR }, at(0));
  scramble(h1a, l1, at(T.line1), 0.55);
  rgbHit(h1a, at(T.line1 + 0.55), 0.1, 9);
  scramble($(h1b, '.t'), l2, at(T.line2), 0.6);
  blink($(h1b, '.u'), at(T.line2 + 0.6), s.end, 0, 1);
  inn(sub, at(T.sub), { y: 20 }, 0.5);
  facts.forEach((f, i) => inn(f, at(T.facts[i]), { y: 10 }, 0.3));
  return { dims: [[row], [sub]], flash: [0.5, 0.2] };
};

// Chapter: at most two questions, typed with their options; one option is picked for each. The decisions
// and the confirmation are the next scene (`decide`).
BUILD.qa = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  pageHeader(s, sec);
  if ((s.questions || []).length > 2) problems.push('qa: at most two questions per page; split into two qa scenes or cut');
  for (const k of ['decisions', 'confirm', 'summary', 'strip']) if (s[k]) problems.push(`qa.${k} moved to the decide scene that follows qa`);
  const qs = (s.questions || []).slice(0, 2);
  const gw = html(sec, `<div class="win a" style="left:110px;top:262px;width:1700px;height:${qs.length > 1 ? 470 : 270}px">${winBar(s.window?.[0] || '', s.window?.[1])}</div>`);
  const qEls = qs.map((q, i) => html(gw, `<div class="q a" style="top:${96 + i * 200}px"><div class="qt"><b>${esc(q.id || 'Q' + (i + 1))}</b><span class="tx"></span></div><div class="chips">${q.options.map((o, k) => `<div class="chip a">${'ABC'[k]}  ${esc(o)}</div>`).join('')}</div></div>`));
  qEls.forEach((el, i) => { const tx = $(el, '.tx'); tx.textContent = qs[i].q; fit($(el, '.qt'), 1560, 40, 40); tx.textContent = ''; if (textW($(el, '.chips')) > 1540) problems.push(`qa: the options of ${qs[i].id || 'Q' + (i + 1)} do not fit on one row`); });
  inn(gw, at(T.win), { y: 30 }, 0.45);
  qEls.forEach((el, i) => {
    const q = T.q[i];
    inn(el, at(q.t), { x: -16 }, 0.25);
    typeText($(el, '.tx'), qs[i].q, at(q.t) + 0.05, q.cps);
    const all = $$(el, '.chip'), k = qs[i].pick ?? 0, chip = all[k];
    all.forEach((c, j) => inn(c, at(q.opts[j]), { y: 12, scale: 0.92 }, 0.25, 'back.out(2)'));
    tl.set(chip, { attr: { class: 'chip on' } }, at(q.pick));
    // on the pick's beat the chosen option pushes in to 1.15 (40 → 46 px) with a slight settle and stays; the
    // options after it make room, the others step back (as the opening's key word does)
    const grow = chip.offsetWidth * 0.15;
    tl.fromTo(chip, { scale: 1 }, { scale: 1.15, transformOrigin: '0% 50%', duration: 0.5 * B, ease: 'back.out(1.6)', ...IR }, at(q.pick));
    all.forEach((c, j) => {
      if (j > k) tl.fromTo(c, { x: 0 }, { x: grow, duration: 0.5 * B, ease: 'back.out(1.6)', ...IR }, at(q.pick));
      if (j !== k) tl.to(c, { opacity: 0.45, duration: 0.3 }, at(q.pick));
    });
  });
  return { win: gw, dims: [[gw.firstElementChild], qEls.map((el) => $(el, '.qt'))] };
};

// The chapter's decision summary and one confirmation, under the header the questions page left in place.
BUILD.decide = async (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const hdr = s.continues ? pageHeader(s, sec) : {};
  const decs = (s.decisions || []).slice(0, 4);
  if ((s.decisions || []).length > 4) problems.push('decide: at most four decisions');
  const dw = html(sec, `<div class="win a" style="left:110px;top:262px;width:1700px;height:${96 + Math.max(1, decs.length) * 84 + 10}px">${winBar(s.summary?.[0] || '', s.summary?.[1], false)}</div>`);
  const dEls = decs.map((d, i) => html(dw, `<div class="dec a" style="top:${84 + i * 84}px"><span class="ck">✓</span><span class="id">${esc(d.id || 'D' + (i + 1))}</span>${esc(d.text)}${d.found ? ` <span class="found">${esc(d.found)}</span>` : ''}</div>`));
  dEls.forEach((el) => fit(el, 1636, 40, 40));
  const cf = s.confirm ? html(sec, `<div class="abs confirm a"><span class="mono">${esc(s.confirm[0])}</span>${esc(s.confirm[1])}<span class="mono ck"> </span></div>`) : null;
  if (cf) { cf.style.top = 262 + dw.offsetHeight + 50 + 'px'; fit(cf, 900, 40, 40); }
  const st = strip(sec, s.strip);
  if (st) fit(st, 1700, 25, 25);
  if (!(await morphIn(s, sec, dw, [dw.firstElementChild]))) inn(dw, at(T.win), { y: 30 }, 0.45, 'power2.out');
  dEls.forEach((el, i) => {
    inn(el, at(T.decs[i]), { x: 30 }, 0.35, 'expo.out');
    const f = $(el, '.found');
    if (f) tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.1, repeat: 4, yoyo: true, ease: 'steps(1)', ...IR }, at(T.decs[i] + 0.15));
  });
  if (cf) {
    inn(cf, at(T.confirm), { y: 20, scale: 0.96 }, 0.35);
    tl.set($(cf, '.ck'), { textContent: ' ✓' }, at(T.check));
    // the confirmation passes on its check: the box is neutral until then
    tl.to(cf, { backgroundColor: `rgba(${A},0.28)`, boxShadow: `0 0 50px rgba(${A},0.55)`, borderColor: PAL.accent, color: PAL.hi, duration: 0.15 }, at(T.check));
    tl.fromTo(cf, { scale: 1.06 }, { scale: 1, duration: 0.3, ease: 'back.out(2)', ...IR }, at(T.check));
  }
  if (st) inn(st, at(T.strip), { y: 10 }, 0.4);
  return { win: dw, dims: [[dw.firstElementChild, st].filter(Boolean), dEls.filter((_, i) => !decs[i].found)], push: cf ? { origin: [960, cf.offsetTop + 50], hide: [hdr.wrap, hdr.note] } : null };
};

// Chapter: two documents, a second checker sweeps them and flags gaps, a gap is fixed, both files freeze.
BUILD.freeze = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  pageHeader(s, sec);
  const geo = [{ x: 110, w: 800 }, { x: 950, w: 860 }];
  const docs = (s.docs || []).slice(0, 2);
  const gaps = (s.gaps || []).slice(0, 2);
  const wins = docs.map((d, di) => {
    const win = html(sec, `<div class="win a" style="left:${geo[di].x}px;top:262px;width:${geo[di].w}px;height:450px">${winBar(d.name, d.label)}<div class="scanner"></div><div class="lock mono a">⬢ ${esc(s.lock || 'FROZEN')}</div></div>`);
    // lines, with the additions from resolved gaps spliced in (hidden until the fix)
    const items = d.lines.map((l) => ({ l, add: false }));
    gaps.filter((gp) => gp.doc === di && gp.add).sort((a, b) => b.after - a.after).forEach((gp) => items.splice(gp.after + 1, 0, { l: gp.add, add: true, gp }));
    const heads = items.filter((it, i) => i && it.l.startsWith('## ')).length;
    const step = Math.min(42, (432 - 84 - 24) / Math.max(1, items.length - 1 + heads * 0.45));
    let y = 84, shift = 0;
    const rows = items.map((it, i) => {
      if (i && it.l.startsWith('## ')) y += step * 0.45;
      const el = html(win, `<div class="code mono a" style="top:${y}px">${codeLine(it.l)}</div>`);
      fit(el, geo[di].w - 50, 25, 25);
      const row = { el, final: y, add: it.add, gp: it.gp, pre: y - shift };
      if (it.add) el.style.color = PAL.hi;
      if (it.add) shift += step;
      y += step;
      return row;
    });
    // before the fix, rows below an addition sit one step higher (their pre-fix top)
    rows.forEach((r) => { if (!r.add) r.el.style.top = r.pre + 'px'; });
    return { win, rows, x: geo[di].x, w: geo[di].w };
  });
  wins.forEach((W, di) => {
    inn(W.win, at(T.wins[di]), { y: 30 }, 0.4, di ? 'power2.out' : 'power3.out');
    let k = 0;
    W.rows.forEach((r) => { if (!r.add) inn(r.el, at(T.lines[di](k++)), { x: -14 }, 0.18, 'power2.out'); });
    const sc = $(W.win, '.scanner');
    tl.fromTo(sc, { opacity: 1, y: 60 }, { y: 440, duration: T.scanDur, ease: 'none', ...IR }, at(T.scan));
    tl.to(sc, { opacity: 0, duration: 0.1 }, at(T.scan + T.scanDur));
  });
  // Gaps: a numbered marker after the row the second checker flags, and the numbered finding in a row of
  // flags along the bottom of that window (or on the row itself when the window has no free space).
  const fixAt = T.resolve + 0.05;
  wins.forEach((W, wi) => {
    const mine = gaps.map((gp, i) => ({ gp, i })).filter(({ gp }) => (wins[gp.doc] || wins[0]) === W);
    if (!mine.length) return;
    const orig = W.rows.filter((r) => !r.add);
    // the findings are set at 40 px in the free space under their window, one per row; the numbered marker
    // stays on the flagged row. The terminal takes that space only after the fix.
    const flags = mine.map(({ gp, i }) => html(sec, `<div class="flag mono a">${i + 1} · ${esc(gp.flag)}</div>`)); // numbered across the page
    flags.forEach((fl, k) => {
      const { gp, i } = mine[k];
      const anchor = orig[clamp(gp.after, 0, orig.length - 1)];
      fl.style.left = W.x + 'px';
      fl.style.top = 262 + 450 + 30 + k * 70 + 'px';
      if (fl.offsetWidth > W.w) problems.push(`freeze: gap flag "${gp.flag}" is wider than its window at 40 px: shorten it`);
      const mk = html(W.win, `<div class="code mono a" style="top:${anchor.pre + 2}px;left:${28 + textW(anchor.el) + 14}px;font-size:25px;color:${PAL.find}">◂ ${i + 1}</div>`);
      inn(fl, at(T.flags[i]), { scale: 0.8 }, 0.2, 'back.out(3)');
      inn(mk, at(T.flags[i]), { x: 10 }, 0.2);
      tl.to(anchor.el, { color: PAL.find, duration: 0.1 }, at(T.flags[i]));
      tl.to(anchor.el, { color: PAL.ink, duration: 0.2 }, at(T.resolve - 0.2 * B));
      out(fl, at(T.resolve - 0.2 * B), 0.12);
      out(mk, at(T.resolve - 0.2 * B), 0.12);
      if (gp.add) { // the fix: the added row lands in the accent colour with its note
        const row = W.rows.find((r) => r.gp === gp);
        if (row) {
          tl.fromTo(row.el, { color: PAL.hi }, { color: PAL.ink, duration: 0.6, ease: 'power1.in', ...IR }, at(fixAt + 1.2 * B));
          const note = html(W.win, `<div class="code mono a" style="top:${row.final}px;left:${28 + textW(row.el) + 14}px;color:${PAL.accent}">${esc(gp.fix || '✓ fixed')}</div>`);
          if (28 + textW(row.el) + 14 + textW(note) > W.w - 8) problems.push(`freeze: gap note "${gp.fix}" does not fit after its row`);
          inn(note, at(fixAt), { x: 10 }, 0.2);
          out(note, at(T.noteOut), 0.12);
        }
      }
    });
  });
  wins.forEach((W) => W.rows.forEach((r) => {
    if (!r.add && r.pre !== r.final) tl.fromTo(r.el, { top: r.pre }, { top: r.final, duration: 0.18, ease: 'power2.out', ...IR }, at(T.resolve));
    if (r.add) inn(r.el, at(T.resolve + 0.05), { x: -14 }, 0.2);
  }));
  // freeze terminal
  const term = html(sec, `<div class="win a fterm"><div class="code mono" style="top:30px"><span class="ink">$</span> <span class="t"></span></div></div>`);
  fit($(term, '.code'), 1240, 25, 25);
  const finals = finalDocs(s);
  const outs = (s.output || []).slice(0, 2).map((o, i) => {
    const val = o.value ?? (o.hashOf != null && finals[o.hashOf] ? (() => { const h = sha256(finals[o.hashOf].map(plain).join('\n') + '\n'); return `sha256:${h.slice(0, 8)}…${h.slice(-4)}`; })() : '');
    const el = html(term, `<div class="code mono a" style="top:${80 + i * 42}px"><span class="k">${esc(o.key)}</span>${' '.repeat(Math.max(1, 15 - o.key.length))}<span class="m"></span></div>`);
    el._val = val;
    return el;
  });
  const badge = s.result ? html(term, `<div class="badge mono a">${esc(s.result)}</div>`) : null;
  if (badge && outs.length && Math.max(...outs.map((o) => 28 + textW(o))) + 40 > 1700 - 30 - badge.offsetWidth) problems.push('freeze: the result badge covers an output line; shorten the result');
  inn(term, at(T.term), { y: 20 }, 0.3);
  typeText($(term, '.t'), s.command || '', at(T.cmd), T.cps);
  outs.forEach((o, i) => { inn(o, at(T.outs[i]), { x: -10 }, 0.15); scramble($(o, '.m'), o._val, at(T.outs[i]), T.resolveDur, /^sha256:/.test(o._val) ? HEX : undefined); });
  wins.forEach((W, i) => {
    tl.to(W.win, { borderColor: PAL.accent, boxShadow: `0 0 36px rgba(${A},0.3)`, duration: 0.2 }, at(T.lock));
    inn($(W.win, '.lock'), at(T.lock + i * 0.2 * B), { scale: 1.6 }, 0.25, 'expo.out');
  });
  if (badge) inn(badge, at(T.result), { x: 30 }, 0.3, 'expo.out');
  // the terminal is a new composition (a shot): it enters under the windows
  return { dims: [wins.map((W) => W.win.firstElementChild), wins.flatMap((W) => W.rows.map((r) => r.el))] };
};

// Chapter: inputs → one hub → outputs; connectors draw, dots travel, outputs light, checks tick.
BUILD.flow = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const hdr = pageHeader(s, sec, 760);
  let env = null;
  if (s.command) {
    const left = Math.max(930, hdr.right + 40);
    env = html(sec, `<div class="abs envbox mono a" style="left:${left}px;width:${1810 - left}px"><span class="ink">$</span>&nbsp;${esc(s.command[0])}&nbsp;&nbsp;<span class="g">${esc(s.command[1] || '')}</span></div>`);
    fit(env, 1810 - left - 60, 25, 25);
  }
  const ins = (s.inputs || []).slice(0, 3), outs = (s.outputs || []).slice(0, 3);
  const ys = (n) => [...Array(n)].map((_, i) => 495 + (i - (n - 1) / 2) * 147);
  const node = (x, y, w, [t, sub], cls = '') => {
    const el = html(sec, `<div class="node a ${cls}" style="left:${x}px;top:${y - 48}px;width:${w}px;height:96px"><div><div class="nt">${esc(t)}</div><div class="ns mono">${esc(sub || '')}</div></div>${cls ? '<span class="st"></span>' : ''}</div>`);
    fit($(el, '.nt'), w - 70, 40, 35); fit($(el, '.ns'), w - 50, 25, 25);
    return el;
  };
  const inEls = ins.map((d, i) => node(120, ys(ins.length)[i], 360, d));
  const outEls = outs.map((d, i) => node(1420, ys(outs.length)[i], 390, d, 'ms'));
  const hub = html(sec, `<div class="node owner a" style="left:790px;top:400px;width:330px;height:190px"><div class="ns mono" style="letter-spacing:0.2em">${esc(s.hub?.[0] || '')}</div><div class="nt">${esc(s.hub?.[1] || '')}</div><div class="ns mono">${esc(s.hub?.[2] || '')}</div></div>`);
  fit($(hub, '.nt'), 290, 40, 35); $$(hub, '.ns').forEach((el) => fit(el, 290, 25, 25));
  const svg = html(sec, `<svg class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`);
  const spread = (i, n) => 495 + (i - (n - 1) / 2) * 25;
  const curves = [
    ...ins.map((_, i) => { const y1 = ys(ins.length)[i], y2 = spread(i, ins.length); return `M480 ${y1} C640 ${y1} 650 ${y2} 790 ${y2}`; }),
    ...outs.map((_, i) => { const y1 = spread(i, outs.length), y2 = ys(outs.length)[i]; return `M1120 ${y1} C1270 ${y1} 1270 ${y2} 1420 ${y2}`; }),
  ];
  svg.innerHTML = curves.map((d) => `<path d="${d}" fill="none" stroke="${MK.c}" stroke-opacity="0.55" stroke-width="2.5"/>`).join('') + curves.map(() => `<circle r="7" fill="${MK.hi}" opacity="0"/>`).join('');
  const paths = $$(svg, 'path'), dots = $$(svg, 'circle');
  const checks = (s.checks || []).slice(0, 5);
  const row = html(sec, `<div class="abs" style="left:120px;top:792px;width:1690px;display:flex;gap:20px"></div>`);
  const scEls = checks.map(([label]) => html(row, `<div class="sc a"><span class="ok">○</span>${esc(label)}</div>`));
  if (row.scrollWidth > 1690) problems.push('flow.checks do not fit on one row at 25 px: shorten them');
  const st = strip(sec, s.strip);
  if (st) fit(st, 1700, 25, 25);
  if (env) inn(env, at(T.cmd), { x: 30 }, 0.35);
  inEls.forEach((el, i) => inn(el, at(T.inputs[i]), { x: -30 }, 0.35));
  inn(hub, at(T.hub), { scale: 0.85 }, 0.45, 'back.out(2)');
  outEls.forEach((el, i) => inn(el, at(T.outputs[i]), { x: 30 }, 0.35));
  paths.forEach((p, i) => drawPath(p, at(i < ins.length ? T.drawIn[i] : T.drawOut[i - ins.length])));
  ins.forEach((_, i) => travel(paths[i], dots[i], at(T.travelIn[i]), T.travelDur));
  outs.forEach((_, i) => {
    const k = ins.length + i;
    travel(paths[k], dots[k], at(T.travelOut[i]), T.travelDur);
    tl.to($(outEls[i], '.st'), { backgroundColor: PAL.accent, boxShadow: `0 0 14px ${PAL.accent}`, duration: 0.1 }, at(T.light[i]));
    tl.to(outEls[i], { borderColor: PAL.accent, duration: 0.15 }, at(T.light[i]));
  });
  scEls.forEach((el, i) => {
    inn(el, at(T.checksIn[i]), { y: 16 }, 0.3);
    tl.set($(el, '.ok'), { textContent: '✓', color: PAL.accent }, at(T.ticks[i]));
    tl.to(el, { borderColor: PAL.accent, color: PAL.ink, duration: 0.1 }, at(T.ticks[i]));
  });
  if (st) inn(st, at(T.strip), { y: 10 }, 0.4);
  return { dims: [[env, st].filter(Boolean), inEls], flash: [0.6, 0.25] };
};

// Chapter: two parties and the shared ruler between them; a big counter steps to N; a verdict ticker runs.
BUILD.compare = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const hdr = pageHeader(s, sec);
  const card = (c, x, w, extra = '') => {
    const el = html(sec, `<div class="vcard a" style="left:${x}px;width:${w}px;${extra}"><div class="lab mono">${esc(c.label)}</div><div class="nm">${esc(c.name)}</div><div class="ds">${tokens(c.desc || '')}</div>${c.items ? `<ul>${c.items.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>`);
    fit($(el, '.nm'), w - 64, 50, 44); $$(el, '.lab,.ds,li').forEach((e) => fit(e, w - 64, 25, 25));
    return el;
  };
  const L = card(s.left || {}, 110, 620);
  const R = card(s.right || {}, 1190, 620, `border-color:${PAL.accent};box-shadow:0 0 40px rgba(${A},0.22)`);
  $(R, '.lab').style.color = PAL.accent;
  const M = card(s.middle || {}, 770, 380, 'top:330px;height:220px;border-style:dashed;text-align:center');
  fit($(M, '.nm'), 316, 50, 44);
  $(M, '.ds').classList.add('mono'); $(M, '.ds').style.color = PAL.accent;
  const svg = html(sec, `<svg class="abs" width="1920" height="1080" style="left:0;top:0"><path d="M730 440 H770" stroke="${MK.c}" stroke-width="2.5" stroke-dasharray="6 6" opacity="0"/><path d="M1150 440 H1190" stroke="${MK.c}" stroke-width="2.5" stroke-dasharray="6 6" opacity="0"/></svg>`);
  const items = s.counter?.items || [], N = items.length;
  if (N > 16) problems.push(`compare.counter has ${N} items; at most 16 (one step per half beat, two bars)`);
  const bigN = html(sec, `<div class="abs bigN disp sg stripe a">${N}</div>`);
  const nW = bigN.offsetWidth;
  bigN.textContent = '0';
  const bigOf = html(sec, `<div class="abs bigOf disp sw stripe a" style="left:${108 + nW + 24}px">/ ${N} ${esc(s.counter?.label || '')}</div>`);
  const ofRight = 108 + nW + 24 + bigOf.offsetWidth;
  const meta = s.meta ? html(sec, `<div class="abs bigMeta mono a">${(s.meta || []).map((m, i) => (i ? `<span class="m">${tokens(m)}</span>` : tokens(m))).join('\n')}</div>`) : null;
  if (meta) { meta.style.left = Math.max(980, ofRight + 50) + 'px'; fit(meta, 1810 - Math.max(980, ofRight + 50), 25, 25); }
  const verdict = s.counter?.verdict || 'PASS';
  // The ticker repeats the counted items with their verdict and nothing else, so it may run under the
  // frame edge (the marquee condition: its content is shown elsewhere; it is never read).
  if (s.ticker) problems.push('compare.ticker was removed: the ticker repeats counter.items with the verdict only');
  const seq = items.map((r) => `${esc(r)} <b>${esc(verdict)}</b>`).join('   /   ') + '   /   ';
  const tick = html(sec, `<div class="abs ticker mono a" data-layout-allow-overflow><div data-layout-allow-overflow>${seq.repeat(Math.max(4, Math.ceil(5200 / Math.max(1, seq.length * 15))))}</div></div>`);
  const tin = tick.firstElementChild;
  inn(L, at(T.left), { x: -40 }, 0.4);
  inn(R, at(T.right), { x: 40 }, 0.4);
  inn(M, at(T.middle), { scale: 0.8 }, 0.35, 'back.out(2)');
  tl.to($$(svg, 'path'), { opacity: 1, duration: 0.2 }, at(T.links));
  pulse(R, at(T.pulse), at(T.exit), { boxShadow: `0 0 70px rgba(${A},0.45)` });
  inn(bigN, at(T.counter), { y: 30 }, 0.3);
  inn(bigOf, at(T.counter + 0.1), { x: -20 }, 0.3);
  T.steps.forEach((t, k) => tl.set(bigN, { textContent: String(k + 1) }, at(t)));
  if (N) tl.fromTo(bigN, { scale: 1.08 }, { scale: 1, duration: 0.25, ...IR }, at(T.steps[N - 1]));
  if (meta) inn(meta, at(T.meta), { x: 20 }, 0.35);
  inn(tick, at(T.ticker), { y: 10 }, 0.3);
  frames.push((t) => { if (t >= at(T.ticker) && t < s.end) tin.style.transform = `translateX(${-(t - at(T.ticker)) * 290}px)`; });
  return { dims: [$$(sec, '.vcard .lab'), $$(sec, '.vcard li')], flash: [0.55, 0.25], push: { origin: [108 + nW / 2, 800], hide: [hdr.wrap, hdr.note] } };
};

// Both ends: a pipeline whose first and last nodes are you; the middle is bracketed; gaps loop back.
BUILD.ends = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const h = html(sec, `<div class="abs ends-h disp stripe"><span class="sw"></span><span class="sw"></span></div>`);
  const [ha, hb] = $$(h, 'span');
  ha.textContent = s.title[0]; hb.textContent = s.title[1];
  fit(h, 1700, 108, 94);
  ha.textContent = ''; hb.textContent = '';
  const sub = html(sec, `<div class="abs ends-sub mono a">${esc(s.sub || '')}</div>`);
  const nodes = (s.nodes || []).slice(0, 6), n = nodes.length;
  const w = (1690 - (n - 1) * 50) / n;
  const els = nodes.map((d, i) => {
    const el = html(sec, `<div class="pn a ${d.you ? 'you' : ''}" style="left:${115 + i * (w + 50)}px;width:${w}px"><div class="t mono">${esc(d.tag)}</div><div class="v ${d.you ? '' : 'mono'}">${esc(d.name)}</div><div class="s">${esc(d.sub || '')}</div></div>`);
    fit($(el, '.v'), w - 20, 40, 35); $$(el, '.t,.s').forEach((e) => fit(e, w - 20, 25, 25));
    return el;
  });
  const svg = html(sec, `<svg class="abs" width="1920" height="1080" style="left:0;top:0"></svg>`);
  let sp = '';
  for (let i = 0; i < n - 1; i++) { const x = 115 + (i + 1) * (w + 50) - 50; sp += `<path class="bl" d="M${x} 550 H${x + 50}" stroke="${MK.c}" stroke-width="3" opacity="0"/><circle class="bd" cx="${x + 25}" cy="550" r="5" fill="${MK.hi}" opacity="0"/>`; }
  const x1 = 115 + (w + 50), x2 = 115 + (n - 2) * (w + 50) + w;
  const lab = s.bracket ? html(sec, `<div class="abs lab-c mono a" style="left:${x1}px;width:${x2 - x1}px;top:668px;color:${MK.c}">${esc(s.bracket)}</div>`) : null;
  if (lab) {
    fit(lab, x2 - x1 - 80, 25, 25);
    const lw = textW(lab), mid = (x1 + x2) / 2;
    sp += `<path class="br" d="M${x1} 652 V682 H${mid - lw / 2 - 18} M${mid + lw / 2 + 18} 682 H${x2} V652" fill="none" stroke="${MK.c}" stroke-width="2" opacity="0"/>`;
  }
  const lx1 = 115 + (n - 2) * (w + 50) + w / 2, lx2 = 115 + (w + 50) + w / 2;
  sp += `<path class="loop" d="M${lx1} 720 C${lx1} 840 ${lx2} 840 ${lx2} 720" fill="none" stroke="${PAL.muted}" stroke-opacity="0.7" stroke-width="2.5" stroke-dasharray="10 10" opacity="0"/><circle class="ld" r="8" fill="${MK.hi}" opacity="0"/>`;
  svg.innerHTML = sp;
  const loopLab = s.loop ? html(sec, `<div class="abs lab-c mono a" style="left:0;width:1920px;top:850px;color:${PAL.muted}">${esc(s.loop)}</div>`) : null;
  if (loopLab) fit(loopLab, 1700, 25, 25);
  fit(sub, 1700, 25, 25);
  scramble(ha, s.title[0], at(T.title1), 0.5);
  scramble(hb, s.title[1], at(T.title2), 0.45);
  inn(sub, at(T.sub), { y: 10 }, 0.35);
  els.forEach((el, i) => inn(el, at(T.nodes[i]), { y: 30 }, 0.3, nodes[i].you ? 'back.out(2)' : 'power3.out'));
  tl.fromTo($$(svg, '.bl'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.08, ...IR }, at(T.links));
  tl.fromTo($$(svg, '.bd'), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.08, ...IR }, at(T.links));
  if (lab) { inn(lab, at(T.bracket), { y: -10 }, 0.35); tl.fromTo($(svg, '.br'), { opacity: 0 }, { opacity: 1, duration: 0.3, ...IR }, at(T.bracket)); }
  tl.fromTo($(svg, '.loop'), { opacity: 0 }, { opacity: 1, duration: 0.3, ...IR }, at(T.loop));
  if (loopLab) inn(loopLab, at(T.loopLab), { y: 10 }, 0.35);
  travel($(svg, '.loop'), $(svg, '.ld'), at(T.dot), T.dotDur, Math.max(1, Math.floor((T.exit - 0.2 * B - T.dot) / T.dotDur)));
  return { dims: [[sub], els.map((e) => $(e, '.t'))] };
};

// Install: a terminal with the install steps typed in, then the slash commands land on the drop.
BUILD.install = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const h = html(sec, `<div class="abs in-h disp stripe"><span class="sw"></span><span class="sw"></span></div>`);
  const [ha, hb] = $$(h, 'span');
  ha.textContent = s.title[0]; hb.textContent = s.title[1];
  fit(h, 1700, 108, 94);
  ha.textContent = ''; hb.textContent = '';
  const term = html(sec, `<div class="win a in-term">${winBar(s.window?.[0] || '', s.window?.[1])}</div>`);
  const cmds = (s.commands || []).slice(0, 2).map((c, i) => html(term, `<div class="code mono" style="top:${84 + i * 54}px;font-size:32px"><span class="ink">›</span> <span class="t"></span></div>`));
  cmds.forEach((el, i) => { const t = $(el, '.t'); t.textContent = s.commands[i]; fit(el, 1260, 32, 32); t.textContent = ''; });
  const steps = (s.steps || []).slice(0, 4), n = steps.length, total = n * 360 + (n - 1) * 50, x0 = (1920 - total) / 2;
  const els = steps.map(([c, l], i) => {
    const el = html(sec, `<div class="step a" style="left:${x0 + i * 410}px;top:465px"><div class="n mono">${String(i + 1).padStart(2, '0')}</div><div class="c mono">${esc(c)}</div><div class="l">${esc(l)}</div></div>`);
    fit($(el, '.c'), 270, 25, 25); fit($(el, '.l'), 316, 25, 25);
    return el;
  });
  scramble(ha, s.title[0], at(T.title1), 0.5);
  scramble(hb, s.title[1], at(T.title2), 0.45);
  inn(term, at(T.term), { y: 24 }, 0.35);
  cmds.forEach((el, i) => typeText($(el, '.t'), s.commands[i], at(T.cmds[i].a), T.cmds[i].cps));
  els.forEach((el, i) => {
    inn(el, at(T.steps[i]), { y: 30, scale: 0.94 }, 0.3, 'expo.out');
    tl.to(el, { borderColor: PAL.muted, duration: 0.1 }, at(T.steps[i] + 0.05));
  });
  // the wait before the steps (events.js TIMING.install): the window bar, then the title, dim in two frames
  const waitDims = [[term.firstElementChild], [h]];
  (T.waits || []).forEach((t, k) => tl.fromTo(waitDims[Math.min(k, 1)], { filter: 'brightness(1)' }, { filter: 'brightness(0.6)', duration: 2 / FPS, ease: 'none', ...IR }, at(t)));
  // the title and the terminal leave on the first step's beat: the cards land alone (a new composition)
  if (els.length) tl.set([h, term], { opacity: 0 }, at(T.steps[0]));
  return { dims: [els.map((e) => $(e, '.n')), els.map((e) => $(e, '.c'))] };
};

// shared: grid tunnel shot for both tagline types
const tunnelShot = (s, sec, T, flat) => {
  const at = (x) => s.start + x;
  const wrap = html(sec, `<div data-layout-allow-overflow class="shot" style="left:0;top:0;width:1920px;height:1080px;opacity:0"><canvas width="2400" height="1350"></canvas></div>`);
  const draw = FX.tunnel($(wrap, 'canvas'), PAL, (C.seed | 0) + 7301);
  const [a, z] = T.tunnel;
  tl.fromTo(wrap, { opacity: 0, scale: 1 }, { opacity: 1, duration: 0.2, ...IR }, at(a));
  tl.to(wrap, { scale: 1.25, duration: z - a, ease: 'power2.in' }, at(a));
  tl.to(wrap, { opacity: 0, duration: flat ? 0.1 : 0.15, ease: 'power1.in' }, at(z - (flat ? 0.08 : 0.025)));
  frames.push((t) => {
    if (t < at(a) - 0.04 || t > at(z) + 0.04) return;
    const f = flat ? clamp((t - at(flat[0])) / (flat[1] - flat[0]), 0, 1) : 0;
    draw(t - at(a), f * f * (3 - 2 * f));
  });
  return 540 + (525 - 540) * 1.25; // screen y of the horizon at the end of the push
};

// Closing (default): the tunnel folds into the horizon line, the line opens as a slit that holds the claim,
// then closes back into the line, which the end card turns into its cursor.
BUILD['horizon-tagline'] = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const cy = tunnelShot(s, sec, T, T.flat);
  const lines = (s.lines || []).slice(0, 2);
  const slit = html(sec, `<div class="abs slit" style="top:${cy}px;height:0"><div class="txt"></div><div class="ln" style="top:0"></div><div class="ln" style="bottom:0"></div></div>`);
  const txt = $(slit, '.txt');
  const lineEls = lines.map((l, li) => html(txt, `<div class="tl-line disp stripe">${l.split(' ').map((w) => `<span class="${li && w.replace(/[^\w-]/g, '') === s.stress ? 'sw stress' : 'sw'}">${esc(w)}</span>`).join(' ')}</div>`));
  const px = Math.min(...lineEls.map((el) => fit(el, 1600, 150, 90)));
  lineEls.forEach((el) => { el.style.fontSize = px + 'px'; el.style.lineHeight = '1.0'; });
  const st = $(txt, '.stress');
  if (st) st.style.fontSize = '1.12em';
  const th = txt.offsetHeight, H = th + 130;
  txt.style.top = `calc(50% - ${th / 2}px)`;
  window.__horizonY = cy;
  slit.style.opacity = 0;
  tl.fromTo(slit, { opacity: 0 }, { opacity: 1, duration: 0.05, ...IR }, at(T.open - 0.03));
  tl.fromTo(slit, { height: 0, top: cy }, { height: H, top: cy - H / 2, duration: T.openDur, ease: 'power3.out', ...IR }, at(T.open)); // eased, so the hand-off from the folded line does not jump
  const words = $$(txt, 'span');
  words.forEach((w, i) => {
    const big = w.classList.contains('stress');
    tl.fromTo(w, { opacity: 0, y: 30, scale: big ? 1.5 : 1.2 }, { opacity: 1, y: 0, scale: 1, duration: big ? 0.5 : 0.35, ease: big ? 'back.out(1.8)' : 'expo.out', ...IR }, at(T.words[i] ?? T.open));
  });
  words.forEach((w) => (w.style.opacity = 0));
  tl.to(slit, { height: 0, top: cy, duration: T.closeDur, ease: 'power3.in' }, at(T.close));
};

// Legacy closing (close to the reference film): tunnel → white flash → pixel slogan.
BUILD['tunnel-tagline'] = (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  tunnelShot(s, sec, T, null);
  const lines = (s.lines || []).slice(0, 2).map((l) => l.toUpperCase());
  const els = lines.map((l, i) => html(sec, `<div class="abs pix" style="top:${i ? 520 : 300}px"></div>`));
  els.forEach((el, i) => { el.textContent = lines[i]; fit(el, 1700, 190, 128); el.textContent = ''; });
  flash(at(T.flash1), 1, 0.55);
  scramble(els[0], lines[0], at(T.line1), 0.45);
  if (els[1]) scramble(els[1], lines[1], at(T.line2), 0.5);
  tl.fromTo(sec, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: 'expo.out', ...IR }, at(T.line1));
  T.jitters.forEach((t) => els.forEach((el, k) => jitter(el, at(t + k * 0.04), 0.08, 14)));
  tear(at(T.tear), 0.28);
  flash(at(T.flash), 0.6, 0.3);
  window.__ghost = lines;
};

// End card: the horizon glow under the cursor lock-up (endCursor below). Settled 2026-10-18 (was: logo, name,
// chips, URL and sub centred in tiers).
// The glow is a light layer under the end card (lightLayer): inside the scene its black covered the ground,
// grid and crosses at 85 % (fixed 2026-10-19).
BUILD.end = (s, sec) => {
  const hz = lightLayer(s, sec, { style: 'opacity:0;', inner: '<canvas width="960" height="540"></canvas>' });
  const drawH = FX.horizon($(hz, 'canvas'), PAL);
  drawH();
  tl.fromTo(hz, { opacity: 0 }, { opacity: 0.85, duration: 0.6, ...IR }, s.start);
  if (s.prev === 'tunnel-tagline' && window.__ghost) {
    window.__ghost.forEach((l, i) => {
      // the slogan's ghost fades to 12 % behind the end card: decorative layering, marked as intended
      const gh = html(sec, `<div class="abs pix" data-layout-allow-overlap data-layout-allow-occlusion style="top:${i ? 520 : 300}px">${esc(l)}</div>`);
      fit(gh, 1700, 190, 128);
      tl.fromTo(gh, { opacity: 0.55 }, { opacity: 0.12, duration: 0.8, ease: 'power2.out', ...IR }, s.start);
    });
  }
  endCursor(s, sec);
};
// the second move on the last downbeat: the chips light one per half beat (filled like a chosen chip)
function lightChips(T, at, els) {
  els.forEach((e, i) => {
    const t = T.ticks[i];
    if (t == null) return;
    tl.set(e, { backgroundColor: PAL.accent, color: PAL.on, borderColor: PAL.accent }, at(t));
    tl.fromTo(e, { scale: 1.08, boxShadow: `0 0 50px rgba(${A},0.7)` }, { scale: 1, boxShadow: `0 0 22px rgba(${A},0.22)`, duration: 0.4, ease: 'back.out(2.5)', ...IR }, at(t));
  });
}
// The cursor lock-up: the tagline's horizon line shrinks to one point at its centre, a block cursor; the name
// types out of it to the left (last letter first) and the chips to the right, on the horizon; then the cursor
// drops a line and types the URL; the sub sits under it. No logo (the cursor is the prompt). Layout: the hinge
// (the cursor) at the centre of the horizon line; name right-aligned to its left and chips left-aligned to its
// right, both centred on the line; the URL centred one line below, the sub under it.
function endCursor(s, sec) {
  const T = s.T, at = (x) => s.start + x;
  const hy = s.prev === 'horizon-tagline' ? (window.__horizonY ?? 540) : 540, hx = 960, GAP = 34;
  const cw = 64 * 0.43, ch = 64 * 0.93; // the cursor of the 64 px URL
  const name = String(C.brand?.name || '');
  // the gradient sits on each letter (as in the opening's hook): a gradient clipped to the text of the parent
  // would ignore the letters' own opacity
  const nm = html(sec, `<div class="abs endName disp stripe rgb" data-text="${esc(name)}" style="top:0;left:0">${[...name].map((c) => `<span class="c sw" style="display:inline-block;white-space:pre">${esc(c)}</span>`).join('')}</div>`);
  const npx = fit(nm, hx - cw / 2 - GAP - 110, 150, 108);
  const nb = box(nm);
  nm.style.left = hx - cw / 2 - GAP - nb.w + 'px';
  nm.style.top = hy - nb.h / 2 - npx * 0.04 + 'px'; // optical centre of lower-case display type on the line
  const chips = html(sec, `<div class="abs mono" style="left:${hx + cw / 2 + GAP}px;top:0;display:flex;gap:20px">${(s.chips || []).slice(0, 4).map((c) => `<div class="ec a">${esc(c)}</div>`).join('')}</div>`);
  const cb = box(chips);
  chips.style.top = hy - cb.h / 2 + 'px';
  if (cb.w > 1810 - (hx + cw / 2 + GAP)) problems.push('end.chips do not fit right of the cursor at 32 px: shorten them');
  const url = String(s.url || '');
  const row = html(sec, `<div class="abs endUrl mono" style="top:${hy + 128}px">${(ICON[s.icon] || ICON.none)(64)}<span class="u" style="position:relative">${[...url].map((c) => `<span class="c">${esc(c)}</span>`).join('')}</span></div>`);
  fit(row, 1760, 64, 56);
  const ucs = $$(row, '.c');
  ucs.forEach((c) => (c.style.opacity = 0));
  const ub = ucs.map(box), u0 = box($(row, '.u'));
  const upx = parseFloat(row.style.fontSize), uw = upx * 0.43, uh = upx * 0.93;
  const curY = u0.y + (u0.h - uh) / 2;
  const sub = s.sub ? html(sec, `<div class="abs endSub a" style="top:${hy + 128 + 90 + 30}px">${esc(s.sub)}</div>`) : null;
  if (sub) fit(sub, 1700, 32, 32);
  if (s.sub && String(s.sub).split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length > 8) problems.push('end.sub has more than 8 words: cut it');
  // the cursor: at the hinge until the URL starts, then one line down, after the last typed character
  const cur = html(sec, `<div class="abs cur" style="width:${cw}px;height:${ch}px;opacity:0"></div>`);
  frames.push((t) => {
    if (t < at(T.url)) { cur.style.left = hx - cw / 2 + 'px'; cur.style.top = hy - ch / 2 + 'px'; return; }
    const n = clamp(Math.floor((t - at(T.url)) * T.cps) + 1, 0, ucs.length);
    cur.style.width = uw + 'px'; cur.style.height = uh + 'px';
    cur.style.left = (n ? ub[n - 1].x + ub[n - 1].w + 3 : u0.x) + 'px';
    cur.style.top = curY + 'px';
  });
  const out0 = s.prev === 'horizon-tagline' ? T.morph + T.morphDur : 0; // the point is in place
  if (s.prev === 'horizon-tagline') {
    const ml = html(sec, `<div class="morphLine" style="left:0;top:${hy - 1.5}px;width:1920px;height:3px"></div>`);
    tl.to(ml, { left: hx - cw / 2, top: hy - ch / 2, width: cw, height: ch, duration: T.morphDur, ease: 'expo.inOut' }, at(T.morph));
    tl.set(ml, { opacity: 0 }, at(out0));
  }
  blink(cur, at(out0), s.end, 0, 1);
  // the name types out of the cursor leftwards, last letter first; the chips come out of it rightwards
  const ncs = $$(nm, '.c'), NCPS = 30;
  ncs.forEach((c) => (c.style.opacity = 0));
  ncs.slice().reverse().forEach((c, i) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, at(out0) + i / NCPS));
  rgbHit(nm, at(out0) + ncs.length / NCPS, 0.3, 14);
  $$(chips, '.ec').forEach((e, i) => inn(e, at(Math.max(T.chips[i], out0)), { x: -24 }, 0.3, 'expo.out'));
  const icon = $(row, 'svg');
  if (icon) { icon.style.opacity = 0; tl.fromTo(icon, { opacity: 0 }, { opacity: 1, duration: 0.15, ...IR }, at(T.url)); } // with the new line
  ucs.forEach((c, i) => tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, ...IR }, at(T.url) + i / T.cps));
  if (sub) inn(sub, at(T.sub), { y: 12 }, 0.5);
  lightChips(T, at, $$(chips, '.ec'));
  // dim: false keeps the settled lock-up to the last frame, for a film cut into a longer one
  if (s.dim !== false) tl.to('#endDim', { opacity: 0.9, duration: 0.4, ease: 'power1.in' }, at(T.dim));
}

// ------------------------------------------------------------------ the batch 4 pages and hand-offs (2026-10-19)
// Position of an element in its scene (scenes fill the frame), from its layout box: no transforms.
const rectOf = (el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
// A seeded hex id and a run time for the stream's lines (illustrative values computed from the film's seed).
const hexOf = (i, n = 6) => [...Array(n)].map((_, k) => HEX[Math.floor(hash(i * 13 + k, (C.seed | 0) + 41) * 16)]).join('');
const msOf = (i) => String(300 + Math.floor(hash(i, (C.seed | 0) + 77) * 900));

// container-morph (lib/handoffs, X06): the window of a page becomes the window of the page that continues it. The
// module computes the state (width, height, corner radius on a critically damped landing; the old content out,
// then the new one in, never both); the window is drawn here as the mode's own DOM window (border, panel, bar),
// which the module's canvas painter cannot draw. The module keeps one centre; the window's centre follows the same
// landing, read back from its height (a template-local extension: our windows share their x, not their y). The
// outgoing page fades and blurs its window's content in the 0.2 beat before the cut (the module's first phase).
async function morphIn(s, sec, win, contents) {
  if (s.into !== 'morph' || !s.prevWin) return false;
  const r0 = rectOf(s.prevWin), r1 = rectOf(win);
  const h = await createHandoff('container-morph', { from: { w: r0.w, h: r0.h, r: 10, content: null }, to: { w: r1.w, h: r1.h, r: 10, content: null } });
  const shell = document.createElement('div');
  shell.className = 'win shell';
  Object.assign(shell.style, { left: r0.x + 'px', top: r0.y + 'px', width: r0.w + 'px', height: r0.h + 'px', display: 'none' });
  sec.insertBefore(shell, sec.firstChild);
  const dur = MORPH_BEATS * B, t0 = s.start - 0.2 * B;
  const c0 = [r0.x + r0.w / 2, r0.y + r0.h / 2], c1 = [r1.x + r1.w / 2, r1.y + r1.h / 2];
  win.classList.remove('a');
  frames.push((t) => {
    const p = progressAt(t, t0, dur), S = h.state(p);
    const on = t >= s.start && p < 1;
    shell.style.display = on ? 'block' : 'none';
    win.classList.toggle('ghost', t < s.start || p < 1);
    if (on) {
      const k = r1.h !== r0.h ? (S.h - r0.h) / (r1.h - r0.h) : r1.w !== r0.w ? (S.w - r0.w) / (r1.w - r0.w) : 1;
      const cx = c0[0] + (c1[0] - c0[0]) * k, cy = c0[1] + (c1[1] - c0[1]) * k;
      Object.assign(shell.style, { left: (cx - S.w / 2).toFixed(2) + 'px', top: (cy - S.h / 2).toFixed(2) + 'px', width: S.w.toFixed(2) + 'px', height: S.h.toFixed(2) + 'px', borderRadius: S.r.toFixed(2) + 'px' });
    }
    const a = p >= 1 ? 1 : S.content === 'to' ? S.alpha : 0, bl = p >= 1 ? 0 : S.content === 'to' ? S.blur : 12;
    for (const el of contents) { el.style.opacity = a; el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : ''; }
  });
  return true;
}

// run: a log stream brakes on its key line (lib/handoffs stream-brake, X14), drawn by the module into a canvas in
// the terminal window with the palette and the mono face; the camera pushes in on the band as it locks.
BUILD.run = async (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const hdr = pageHeader(s, sec);
  const win = html(sec, `<div class="win a" style="left:110px;top:262px;width:1700px;height:600px;background:var(--panel)">${winBar(s.window?.[0] || '', s.window?.[1])}<canvas width="1696" height="542" style="position:absolute;left:0;top:54px;width:1696px;height:542px"></canvas></div>`);
  const cv = $(win, 'canvas'), ctx = cv.getContext('2d');
  const fail = s.key?.status ? s.key.status !== 'pass' : /FAIL|ERR|✕/i.test(s.key?.mark || '');
  const LH = 54, BAND = 300, line = String(s.stream?.line || '{n}');
  const fmt = (i) => line.replace('{n}', String(i + 1).padStart(2, '0')).replace('{seed}', hexOf(i)).replace('{ms}', msOf(i));
  const mono = { family: 'JetBrains Mono', weight: 500, size: 32 };
  const h = await createHandoff('stream-brake', {
    count: Math.max(1, s.stream?.count ?? 36), line: fmt, key: { mark: s.key?.mark ?? '', text: s.key?.text ?? '' }, after: [], start: 0,
    band: BAND, lineHeight: LH, window: [6, 536], x: 44, bandX: [14, 1682], mono, ground: false,
    colors: { ground: PAL.panel, ink: PAL.ink, dim: PAL.dim, muted: PAL.muted, accent: fail ? PAL.bad : PAL.accent, panel: PAL.panel, band: PAL.bgHi, line: PAL.line, deep: fail ? PAL.line : PAL.deep },
  });
  const t0 = at(T.stream), dur = T.streamDur;
  // the line after the key line is drawn into the same canvas (so the smear takes it with the stream): it enters
  // like every landing, 0.3 s power3.out from 14 px left
  const after = (s.after || [])[0];
  const drawAfter = (t) => {
    if (!after || T.after == null || t < at(T.after)) return;
    const u = clamp((t - at(T.after)) / 0.3, 0, 1), e = 1 - Math.pow(1 - u, 3);
    ctx.save(); ctx.globalAlpha = e; ctx.font = `500 ${mono.size}px "JetBrains Mono"`; ctx.fillStyle = PAL.muted;
    ctx.fillText(after, 44 - 14 * (1 - e), BAND + LH); ctx.restore();
  };
  // slice-smear (lib/transitions, X20) at the exit: the stream canvas is the outgoing frame, the panel the incoming
  // one; bands one mono line high, aligned to the log's lines. WebGL draws into a 1920 × 542 canvas in the window
  // (film px across, so the shader's coordinates are the film's), clipped by the window.
  let smear = null;
  if (T.smear) {
    const gl = html(win, '<canvas width="1920" height="542" style="position:absolute;left:0;top:54px;width:1920px;height:542px;display:none"></canvas>');
    const tx = createTransitions(gl);
    if (!tx) problems.push('run: WebGL is unavailable, so the slice-smear exit cannot be drawn');
    const mk = () => { const c = document.createElement('canvas'); c.width = 1920; c.height = 542; return c; };
    const A0 = mk(), B0 = mk(), a = A0.getContext('2d'), b = B0.getContext('2d');
    b.fillStyle = PAL.panel; b.fillRect(0, 0, 1920, 542);
    const top = ((BAND - LH * 0.72) % LH) - LH;
    smear = (t) => {
      const x0 = s.end - T.out, on = tx && t >= x0 && t < x0 + T.smear;
      gl.style.display = on ? 'block' : 'none';
      cv.style.visibility = on || t >= x0 + T.smear ? 'hidden' : 'visible';
      if (!on) return;
      a.fillStyle = PAL.panel; a.fillRect(0, 0, 1920, 542); a.drawImage(cv, 0, 0);
      tx.draw('slice-smear', A0, B0, 0.5 * progressAt(t, x0, T.smear), { band: LH, top, dur: 2 * T.smear, seed: C.seed | 0, colors: { ground: PAL.panel } });
    };
  }
  frames.push((t) => {
    if (t < s.start - 0.04 || t >= s.end) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (t < t0) h.still(ctx, 'from'); else if (t < t0 + dur) h.draw(ctx, progressAt(t, t0, dur), { dur }); else h.still(ctx, 'to');
    drawAfter(t);
    if (smear) smear(t);
  });
  inn(win, at(T.win), { y: 30 }, 0.45);
  return { win, dims: [[win.firstElementChild]], push: { origin: [960, 262 + 54 + BAND - LH * 0.22], hide: [hdr.wrap, hdr.note] } };
};

// pick: a frame visits the candidates and locks on the answer (lib/handoffs roulette-lock, X10). The module gives
// the state (which cell, the pop of each jump, the others stepping back, the slide of a wrap); the cells are the
// mode's DOM boxes. The frame is neutral while it searches and takes the accent when it locks: the answer is what
// the tool has proven (Accent role).
BUILD.pick = async (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  const hdr = pageHeader(s, sec);
  const cands = (s.candidates || []).slice(0, 8), n = cands.length, answer = Math.max(0, cands.indexOf(s.answer));
  if (!n) problems.push('pick: give 2–8 candidates');
  if (s.answer != null && !cands.includes(s.answer)) problems.push(`pick: the answer "${s.answer}" is not one of the candidates`);
  const win = html(sec, `<div class="win a" style="left:110px;top:262px;width:1700px;height:470px">${winBar(s.window?.[0] || '', s.window?.[1])}<div class="qt pq a" style="position:absolute;left:40px;top:86px"><b>?</b><span class="tx"></span></div></div>`);
  const q = $(win, '.pq');
  $(q, '.tx').textContent = s.question || ''; fit(q, 1620, 40, 40); $(q, '.tx').textContent = '';
  const GAP = 24, cw = Math.min(250, (1620 - (n - 1) * GAP) / Math.max(1, n)), ch = 140, cy = 186, x0 = 40 + (1620 - (n * cw + (n - 1) * GAP)) / 2;
  const cellX = (i) => x0 + i * (cw + GAP);
  const cells = cands.map((c, i) => html(win, `<div class="cell a" style="left:${cellX(i)}px;top:${cy}px;width:${cw}px;height:${ch}px"><span class="mono">${esc(c)}</span></div>`));
  cells.forEach((el) => fit($(el, 'span'), cw - 24, 50, 32));
  const frame = html(win, `<div class="rframe" style="top:${cy - 10}px;width:${cw + 20}px;height:${ch + 20}px;opacity:0"></div>`);
  const res = s.result ? html(win, `<div class="abs pres" style="left:40px;width:1620px;top:368px;text-align:center"></div>`) : null;
  if (res) { res.textContent = s.result; fit(res, 1620, 40, 40); res.textContent = ''; }
  const h = await createHandoff('roulette-lock', { labels: cands, answer, laps: s.laps ?? 1, step: 0.5, slow: 1.5, settle: 0.4 });
  const t0 = at(T.roulette), dur = h.beats * B;
  frames.push((t) => {
    if (t < s.start - 0.04 || t >= s.end) return;
    const S = t < t0 ? h.state(0) : h.state(progressAt(t, t0, dur));
    if (S.fx == null) { frame.style.opacity = 0; return; }
    const w = (cw + 20) * S.pop, hh = (ch + 20) * S.pop, x = cellX(S.fx) + cw / 2;
    Object.assign(frame.style, { opacity: 1, left: (x - w / 2).toFixed(2) + 'px', top: (cy + ch / 2 - hh / 2).toFixed(2) + 'px', width: w.toFixed(2) + 'px', height: hh.toFixed(2) + 'px',
      borderColor: mixColor(PAL.ink, PAL.accent, S.dim), boxShadow: S.dim > 0 ? `0 0 ${Math.round(34 * S.dim)}px rgba(${A},${(0.45 * S.dim).toFixed(3)})` : 'none' });
    cells.forEach((el, i) => { if (i !== answer) el.style.filter = S.dim > 0 ? `brightness(${(1 - 0.55 * S.dim).toFixed(3)})` : ''; });
  });
  if (!(await morphIn(s, sec, win, [win.firstElementChild]))) inn(win, at(T.win), { y: 30 }, 0.45);
  inn(q, at(T.q), { x: -16 }, 0.25);
  typeText($(q, '.tx'), s.question || '', at(T.q), T.cps);
  cells.forEach((el, i) => inn(el, at(T.cells[i]), { y: 16, scale: 0.94 }, 0.3, 'back.out(2)'));
  if (res && T.result != null) { res.classList.add('a'); inn(res, at(T.result), { y: 10 }, 0.25); scramble(res, s.result, at(T.result), 0.5 * B); }
  const c = rectOf(cells[answer] || win);
  return { win, dims: [[win.firstElementChild], [q]], push: { origin: [110 + c.x + c.w / 2, 262 + cy + ch + 60], hide: [hdr.wrap, hdr.note] } };
};

// scope: the measure on a phosphor screen (lib/handoffs beam-trace, X26). The first sweep draws the old trace at the
// module's constant beam speed (its sweep window only: there is no old picture yet); the hand-off then lets the
// old picture fade as afterglow while the beam draws the new trace. The readings are DOM display type: the
// module's painters set their light (the old one's intensity, the new one's flare), so type, stripes and
// gradient stay the mode's own.
BUILD.scope = async (s, sec) => {
  const T = s.T, at = (x) => s.start + x;
  pageHeader(s, sec);
  const runs = Math.max(1, s.runs ?? 50);
  const win = html(sec, `<div class="win a" style="left:110px;top:262px;width:1700px;height:600px">${winBar(s.window?.[0] || '', s.window?.[1])}<div class="grat"></div><div class="stripe" style="position:absolute;left:0;top:54px;width:1696px;height:542px"><canvas width="1696" height="542" style="width:1696px;height:542px;display:block"></canvas></div></div>`);
  const cv = $(win, 'canvas'), ctx = cv.getContext('2d');
  const oldEl = html(win, `<div class="abs reading disp stripe sw"></div>`), newEl = html(win, `<div class="abs reading disp stripe sw" style="opacity:0"></div>`);
  [[oldEl, s.from?.label], [newEl, s.to?.label]].forEach(([el, x]) => { el.textContent = x || ''; fit(el, 1580, 84, 74); });
  newEl.textContent = s.to?.label || '';
  oldEl.textContent = '';
  // the traces, computed from the run numbers: a small blip per run that passed, a spike per run that failed
  const X0 = 60, X1 = 1636, BASE = 470, BLIP = 16, SPIKE = 230;
  const xr = (r) => X0 + ((r - 0.5) / runs) * (X1 - X0), hw = Math.min(8, (0.3 * (X1 - X0)) / runs);
  const pathOf = (failed) => {
    const pts = [[X0, BASE]];
    for (let r = 1; r <= runs; r++) { const x = xr(r), y = BASE - (failed.includes(r) ? SPIKE : BLIP); pts.push([x - hw, BASE], [x - hw * 0.3, y], [x + hw * 0.3, y], [x + hw, BASE]); }
    pts.push([X1, BASE]);
    return pts;
  };
  const failed = (s.from?.failed || []).filter((r) => r >= 1 && r <= runs);
  const marks = (c, alpha, upTo = runs) => { c.save(); c.globalAlpha *= alpha; c.fillStyle = PAL.bad; for (const r of failed) if (r - 0.5 <= upTo) { c.beginPath(); c.arc(xr(r), BASE - SPIKE - 16, 7, 0, Math.PI * 2); c.fill(); } c.restore(); };
  const neutral = { ground: PAL.panel, ink: PAL.ink, accent: PAL.muted, deep: PAL.dim, hi: PAL.ink };
  const h1 = await createHandoff('beam-trace', { path: pathOf(failed), from: () => {}, to: () => {}, ground: false, colors: neutral });
  let light = null; // set by h2's painters each frame
  const h2 = await createHandoff('beam-trace', {
    path: pathOf((s.to?.failed || []).filter((r) => r >= 1 && r <= runs)), ground: false,
    from: (c, P, I) => { c.save(); c.globalAlpha = I; h1.still(c, 'to'); c.restore(); marks(c, I); light.old = I; },
    to: (c, P, color) => { light.flare = color; },
    colors: { ground: PAL.panel, ink: PAL.titleHi, accent: PAL.accent, deep: PAL.deep, hi: PAL.hi },
  });
  const ink = hexToRgb(PAL.titleHi);
  const flareOf = (hex) => { const v = hexToRgb(hex); let e = 0; for (let k = 0; k < 3; k++) if (255 - ink[k] > 8) e = Math.max(e, (v[k] - ink[k]) / (255 - ink[k])); return clamp(e, 0, 1); };
  const sw0 = at(T.sweep), swD = T.sweepDur, b0 = at(T.beam), bD = T.beamDur;
  frames.push((t) => {
    if (t < s.start - 0.04 || t >= s.end) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    light = { old: t < b0 ? 1 : 0, flare: null };
    if (t >= sw0 && t < b0) {
      const u = progressAt(t, sw0, swD), tail = progressAt(t, sw0 + swD, 0.12);
      h1.draw(ctx, u < 1 ? 0.3 + 0.48 * u : 0.78 + 0.22 * tail);
      marks(ctx, 1, u * runs);
    } else if (t >= b0) h2.draw(ctx, progressAt(t, b0, bD));
    oldEl.style.opacity = light.old;
    if (light.flare) {
      const e = flareOf(light.flare);
      newEl.style.opacity = 1;
      newEl.style.filter = e > 0.01 ? `brightness(${(1 + 0.8 * e).toFixed(3)}) drop-shadow(0 0 ${Math.round(26 * e)}px rgba(${A},${(0.7 * e).toFixed(3)}))` : '';
    } else { newEl.style.opacity = 0; newEl.style.filter = ''; }
  });
  inn(win, at(T.win), { y: 30 }, 0.45);
  oldEl.classList.add('a');
  inn(oldEl, at(T.oldReading), { y: 0 }, 0.05);
  scramble(oldEl, s.from?.label || '', at(T.oldReading), 0.45);
  return { win, dims: [[win.firstElementChild], [$(win, '.grat')]] };
};

// crt-collapse (lib/transitions phosphor.js, T2) drawn on the DOM: the frame-level transition samples two frames as
// textures, and phosphor's pages are DOM, which WebGL cannot read; so the same model runs here on #stage (the
// scenes, not the HUD, which never leaves): the picture squeezes to a bright line (height first, cubic in), then to
// a dot (width, cubic in) that fades; the next picture powers on from the dot (width cubic out, height back out,
// about 3.5 % over), brightening as it narrows. Off 0.75 beat at the end of the outgoing scene, on 0.6 beat at the
// start of the next (the library's 2 beats, shortened to stay ≤ 2 beats as a T2 device).
const lin = (a, b, x) => clamp((x - a) / (b - a), 0, 1);
const smoothstep = (a, b, x) => { const u = lin(a, b, x); return u * u * (3 - 2 * u); };
const inCubic = (u) => u * u * u, outCubic = (u) => 1 - Math.pow(1 - u, 3);
const crtState = (kind, u) => {
  if (kind === 'off') {
    const vy = inCubic(lin(0, 0.55, u)), vx = inCubic(lin(0.5, 0.86, u));
    const hy = 540 + (2 - 540) * vy, hx = 960 + (2 - 960) * vx;
    const heat = 1 - smoothstep(0.03, 0.3, hy / 540);
    if (u < 0.86) return { hx, hy, heat, spot: 0, alpha: 1 };
    return { hx: 1, hy: 1, heat: 1, spot: 1 - smoothstep(0.86, 1, u), alpha: 0 };
  }
  const vx = outCubic(lin(0, 0.32, u)), w = lin(0.26, 0.82, u), xo = w - 1;
  const vy = w <= 0 ? 0 : 1 + 1.7 * xo * xo * xo + 0.7 * xo * xo;
  const hx = 2 + (960 - 2) * vx, hy = 2 + (540 - 2) * vy;
  const heat = (1 - smoothstep(0.03, 0.3, hy / 540)) * (1 - smoothstep(0.6, 0.85, u));
  return { hx, hy, heat, spot: 0, alpha: smoothstep(0, 0.08, u) };
};

// The exit of every scene, its tail moves and its push-in (events.js: exitsOf, tailsOf, PUSH)
function finishScene(s, sec, r) {
  const T = s.T, at = (x) => s.start + x;
  if (s.exit === 'glitch') {
    exitGlitch(sec, at(T.exit), s.end, 0.25, s.variant === 'right' ? 1 : -1);
    if (r.flash) flash(s.end - 0.05, r.flash[0], r.flash[1]);
  }
  if (s.exit === 'morph' && r.win) tl.fromTo([...r.win.children], { filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(12px)', duration: 0.2 * B - 1 / FPS, ease: 'none', ...IR }, s.end - 0.2 * B);
  (T.tails || []).forEach((t, k) => {
    const els = (r.dims?.[Math.min(k, (r.dims?.length ?? 1) - 1)] || []).filter(Boolean);
    if (els.length) tl.fromTo(els, { filter: 'brightness(1)' }, { filter: 'brightness(0.6)', duration: 2 / FPS, ease: 'none', ...IR }, at(t)); // crisp, two frames
  });
  if (T.push != null && r.push) {
    const [ox, oy] = r.push.origin;
    // the header and note leave as the camera pushes in; while they fade they may pass under the HUD
    (r.push.hide || []).filter(Boolean).forEach((el) => el.setAttribute('data-layout-allow-overlap', ''));
    tl.fromTo(sec, { scale: 1 }, { scale: PUSH.scale, transformOrigin: `${ox.toFixed(1)}px ${oy.toFixed(1)}px`, duration: PUSH.dur * B, ease: 'expo.out', ...IR }, at(T.push));
    const hide = (r.push.hide || []).filter(Boolean);
    if (hide.length) tl.to(hide, { opacity: 0, duration: 0.2, ease: 'power1.in' }, at(T.push));
  }
}

// ------------------------------------------------------------------ HUD, background, assembly
const hudLabel = (s) => {
  if (s.hud) return s.hud;
  const up = (x) => String(x).toUpperCase();
  const ch = s.chapter || s.continues;
  if (ch) return `[${String(s.chapterNo).padStart(2, '0')}/${String(chapterCount).padStart(2, '0')}] ${up(ch.title.join(' '))}`;
  if (s.type === 'hero') return `[00] ${up((s.lines || []).join(' '))}`;
  if (s.type === 'ends') return `[++] ${up((s.title || []).join('')).replace(/\.$/, '')}`;
  if (s.type === 'install') return '[>>] INSTALL';
  if (s.type === 'boot' || s.type === 'audit') return '';
  return `[00] ${C.brand?.name || ''}`;
};

const build = async () => {
  tl = gsap.timeline({ paused: true });
  // HUD text
  $(root, '#brand').innerHTML = `${logo(30, 3)}<b>${esc(C.brand?.name || '')}</b><span class="d">${esc(C.brand?.tag || '')}</span>`;
  $(root, '#lic').innerHTML = `<span class="dot"></span>${esc(C.brand?.licence || '')}`;
  $(root, '#crosses').innerHTML = (() => { let h = ''; for (let x = 160; x < 1920; x += 320) for (let y = 160; y < 1080; y += 320) h += `<path d="M${x - 6} ${y}H${x + 6}M${x} ${y - 6}V${y + 6}" stroke="rgba(${rgbOf(PAL.muted)},0.35)" stroke-width="1.5"/>`; return h; })();
  // scenes, in order (a page that morphs out of the last one needs its window)
  const secs = [], built = [];
  for (const [i, s] of laid.entries()) {
    const sec = html(stage, `<section class="scene" data-type="${esc(s.type)}"></section>`);
    s.prevWin = built[i - 1]?.win ?? null;
    const r = (await BUILD[s.type](s, sec)) || {};
    secs.push(sec); built.push(r);
  }
  laid.forEach((s, i) => finishScene(s, secs[i], built[i]));
  // crt-collapse windows on #stage: off at the end of the outgoing scene, on at the start of the next
  const crt = laid.filter((s) => s.exit === 'crt').flatMap((s) => [{ a: s.end - CRT.off * B, b: s.end, kind: 'off' }, { a: s.end, b: s.end + CRT.on * B, kind: 'on' }]);
  const crtGlow = html(root, '<div id="crtGlow" data-layout-allow-overflow></div>');
  const firstHud = laid.find((s) => s.type !== 'boot' && s.type !== 'audit');
  if (firstHud) tl.fromTo('#hud', { opacity: 0 }, { opacity: 1, duration: 0.2, ...IR }, firstHud.start);
  tl.set({}, {}, D); // the timeline spans the film
  const labels = laid.map(hudLabel);
  const sect = $(root, '#sect'), prog = $(root, '#prog');
  const grid = $(root, '#grid'), ball = $(root, '#glowball');
  const grainC = $(root, '#grain'), gctx = grainC.getContext('2d'), tile = grainTile((C.seed | 0) + 77, 256, 40);
  if (problems.length) {
    console.error('phosphor:\n' + problems.join('\n'));
    html(root, `<div class="abs mono" style="left:60px;top:120px;right:60px;z-index:60;font-size:24px;color:#fff;background:#b00020;padding:16px 20px;white-space:pre-wrap">${esc(problems.join('\n'))}</div>`);
  }
  return (t) => {
    tl.seek(t, false);
    let cur = 0;
    secs.forEach((sec, i) => { const on = t >= laid[i].start && t < laid[i].end; sec.style.visibility = on ? 'visible' : 'hidden'; if (on) cur = i; });
    for (const b of blinks) {
      let o;
      if (t >= b.until) o = 0; else if (t < b.t0) o = b.before; else if (t >= b.t1) o = b.after; else o = Math.floor((t - b.t0) / (B / 2)) % 2 === 0 ? 1 : 0;
      b.el.style.opacity = o;
    }
    for (const f of frames) f(t);
    const w = crt.find((x) => t >= x.a && t < x.b);
    if (w) {
      const S = crtState(w.kind, (t - w.a) / (w.b - w.a));
      stage.style.transformOrigin = '960px 540px';
      stage.style.transform = `scale(${Math.max(S.hx / 960, 1e-3).toFixed(5)}, ${Math.max(S.hy / 540, 1e-3).toFixed(5)})`;
      stage.style.filter = S.heat > 0.01 ? `brightness(${(1 + 1.5 * S.heat).toFixed(3)})` : '';
      stage.style.opacity = S.alpha;
      const lw = S.spot > 0 ? 8 * S.spot : 2 * S.hx, lh = S.spot > 0 ? 8 * S.spot : Math.max(4, 2 * S.hy);
      const on = S.spot > 0 || S.heat > 0.02;
      Object.assign(crtGlow.style, { display: on ? 'block' : 'none', left: (960 - lw / 2).toFixed(1) + 'px', top: (540 - lh / 2).toFixed(1) + 'px', width: lw.toFixed(1) + 'px', height: lh.toFixed(1) + 'px',
        opacity: (S.spot > 0 ? S.spot : Math.min(1, S.heat)).toFixed(3), borderRadius: S.spot > 0 ? '50%' : '2px' });
    } else if (stage.style.transform) {
      stage.style.transform = ''; stage.style.filter = ''; stage.style.opacity = ''; crtGlow.style.display = 'none';
    }
    const tf = Math.round(t * FPS) / FPS;
    sect.textContent = labels[cur];
    prog.style.transform = `scaleX(${clamp(t / D, 0, 1)})`;
    grid.style.transform = `translate(${-((t * 160 / 60) % 160)}px, ${-((t * 80 / 60) % 160)}px)`; // 160 px tile, seamless
    // glow disc: breathes over four bars, scale 0.967 → 1.0: peak rate 0.033 × π / (4 bars) ≤ 1.5 %/s up to
    // 136 BPM (1.4 %/s at 128), edge ≤ 6 px/s (an ambient layer, principle 5)
    const ph = (Math.sin((Math.PI * t) / (2 * g.bar) - Math.PI / 2) + 1) / 2;
    ball.style.transform = `scale(${0.967 + 0.033 * ph})`; ball.style.opacity = 0.8 + 0.2 * ph;
    gctx.clearRect(0, 0, 1920, 1080);
    drawGrain(gctx, tile, t, { alpha: 1, fps: FPS, mode: 'source-over' });
  };
};

let render = () => {};
boot({
  id: 'main',
  duration: D,
  ready: async () => {
    await fontsReady([{ family: 'Inter', weight: 800, size: 32 }, { family: 'Inter', weight: 700 }, { family: 'Inter', weight: 400 }, { family: 'JetBrains Mono', weight: 400 }, { family: 'JetBrains Mono', weight: 500 }, { family: 'JetBrains Mono', weight: 700 }]);
    SR = (await createHandoff('scramble-resolve')).params; // the decode's timing model (scramble, per, appear, rate)
    render = await build();
  },
  render: (t) => render(t),
});

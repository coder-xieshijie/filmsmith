// scramble-resolve — a line resolves left to right: each cell shows a random glyph from the content's own alphabet
// (hex, token pieces), re-rolled at a fixed rate, until its lock time; the lock order is the reading order.
// Theory: locking in reading order never competes with reading; progressive refinement.
// references/transitions.md#scramble-resolve.
// Variant `phrases` (a cycle): several short phrases pass through one fixed-width slot of monospace cells (centred, no
// reflow), each for 38 frames under a noise level g on the keyframes [1, 0, 0, 0.1, 0, 0, 1] (the last phrase ends at
// 0 and lands clean with one soft bloom): a cell shows a scrambled glyph with chance g, re-rolled every 2 frames; the
// line jitters sideways ±g·36 px and splits into two colours ±g·10 px. Chinese phrases scramble only among the
// phrases' own Chinese characters. Adapted from video-shotcraft demos/typography/glitch-cycle/GlitchCycle.tsx,
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0 (as filed by batch 2).

import { text, measure, scratch, ground, mix, rgba } from './util.js';
import { hash } from '../rng.js';

const timeOf = (P) => P.scramble + Math.max(0, P.text.length - 1) * P.per;
const PER = 38, KEYS = [1, 0, 0, 0.1, 0, 0, 1];
const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
// the noise level of phrase k (of n) at frame f of its 38
const noise = (f, last) => { const q = Math.min(1, Math.max(0, f / PER)) * (KEYS.length - 1), i = Math.min(KEYS.length - 2, Math.floor(q)), b = last && i + 1 === KEYS.length - 1 ? 0 : KEYS[i + 1]; return KEYS[i] + (b - KEYS[i]) * (q - i); };

export default {
  name: 'scramble-resolve',
  tier: 'T0',
  beats: 3,
  beatsFor: (P) => (P.phrases ? Math.ceil(((P.phrases.length * PER) / 15) * 2) / 2 : Math.max(1, Math.ceil((timeOf(P) / 0.5) * 2) / 2)),
  modes: ['phosphor', 'trace'],
  roles: ['ground', 'ink', 'deep', 'accent'],
  from: 'an empty line (or the prompt before it)',
  to: 'the resolved line, the cursor after it',
  interpolates: ['cells shown', 'cells locked (left to right)', 'scrambled glyph per cell (seeded, at a fixed rate)'],
  summary: 'A line resolves left to right; each cell flickers through the content\'s own alphabet until it locks.',
  theory: 'Locking in reading order does not compete with reading; progressive refinement of a known slot.',
  defaults: {
    text: 'sha256 9f2c41e0 · signature OK',
    alphabet: '0123456789abcdef',
    accentFrom: 'OK',                    // substring (or index) from which locked cells are in the accent; null for none
    x: 260, y: 540,
    per: 0.035,                          // s between locks (at 120 BPM; scales with the beats)
    scramble: 0.35,                      // s a cell scrambles before the first lock
    appear: 0.012,                       // s between cells lighting up
    rate: 24,                            // re-rolls per second
    cursor: true,
    seed: 1,
    mono: { family: 'monospace', weight: 500, size: 44 },
    colors: { ground: '#04080C', ink: '#E6EEF6', deep: '#3F86D6', accent: '#88BFFF' },
  },
  prepare(P) {
    const cw = measure(scratch(), '0', P.mono).width;
    const a = P.accentFrom == null ? Infinity : typeof P.accentFrom === 'number' ? P.accentFrom : P.text.indexOf(P.accentFrom);
    const beats = this.beatsFor(P);
    if (P.phrases) {
      // the slot: cells as wide as the widest glyph used, as many as the longest phrase; the scramble pool
      const zh = P.phrases.some((x) => CJK.test(x)), cell = zh ? measure(scratch(), '国', P.mono).width : cw;
      const pool = zh ? [...new Set(P.phrases.join('').split('').filter((c) => CJK.test(c)))].join('') : P.alphabet;
      return { cw: cell, acc: Infinity, T: beats * 0.5, slot: Math.max(...P.phrases.map((x) => [...x].length)), pool };
    }
    return { cw, acc: a < 0 ? Infinity : a, T: beats * 0.5 };
  },
  rest(side, P, D) { return { t: side === 'from' ? 0 : D.T }; },
  at(p, P, D) { return { t: p * D.T }; },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    if (P.phrases) { this.paintCycle(ctx, S, P, D); return; }
    const C = P.colors, t = S.t, s = P.text, frame = Math.floor(t * P.rate);
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === ' ' || !(t > i * P.appear)) continue;
      const locked = t >= P.scramble + i * P.per;
      const g = locked ? ch : P.alphabet[Math.floor(hash(i + 1000 * P.seed, frame) * P.alphabet.length)];
      text(ctx, g, P.x + i * D.cw, P.y, P.mono, { color: locked ? (i >= D.acc ? C.accent : C.ink) : C.deep });
    }
    if (P.cursor && t > 0) {
      const n = Math.min(s.length, Math.max(0, Math.floor((t - P.scramble) / P.per) + 1));
      const h = P.mono.size * 1.1;
      ctx.fillStyle = C.accent;
      ctx.fillRect(P.x + n * D.cw + 4, P.y - h * 0.79, D.cw * 0.83, h);
    }
  },
  paintCycle(ctx, S, P, D) {
    const C = P.colors, n = P.phrases.length, f = Math.min(n * PER - 1e-6, (S.t / D.T) * n * PER), k = Math.floor(f / PER), fl = f - k * PER;
    const last = k === n - 1, g = S.t >= D.T ? 0 : noise(fl, last), cells = [...P.phrases[k]], pad = Math.floor((D.slot - cells.length) / 2);
    const x0 = P.x + (S.t >= D.T ? 0 : g * 36 * (2 * hash(k + 7, Math.floor(fl / 2)) - 1)), roll = Math.floor(f / 2);
    const glyph = (i, ch) => (ch !== ' ' && g > 0 && hash(i + 31 * k, roll) < g ? D.pool[Math.floor(hash(i + 101 * k, roll + 977) * D.pool.length)] : ch);
    const line = (dx, color, scr) => cells.forEach((ch, i) => { const c = glyph(i, ch); if (c !== ' ') text(ctx, c, x0 + dx + (pad + i) * D.cw, P.y, P.mono, { color: scr && c !== ch ? (hash(i, roll + 5) < 0.5 ? C.accent : mix(C.ink, C.ground, 0.45)) : color }); });
    if (g > 0.01) { ctx.save(); ctx.globalAlpha = Math.min(1, g * 1.5); line(-g * 10, C.accent, false); line(g * 10, mix(C.ink, '#FFFFFF', 0.5), false); ctx.restore(); }
    line(0, C.ink, true);
    // one soft bloom as the last phrase lands
    if (last && fl > PER * 0.6) { const b = Math.sin(Math.PI * Math.min(1, (fl - PER * 0.6) / (PER * 0.4))); if (b > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.shadowColor = rgba(C.accent, 0.6 * b); ctx.shadowBlur = 30; line(0, rgba(C.ink, 0.35 * b), false); ctx.restore(); } }
  },
};

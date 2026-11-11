// notes.js — the margin's copy group: a value (display), a line (primary), a note (glance, mono) and an address,
// stacked in slots under one block level and each entering up through its own rail (0.36 s, expo out) and leaving
// up through it (0.2 s, ease in). Chinese lines wrap inside the margin (lang.js wrap) and push the note down; the value
// is one size for the scene, 95 px or 76 when a value does not fit. Pure painters; nothing is kept between frames.
// From the handset template (film.js paintCopy and fitCopy; choreo.js group: slots 0, 128, 214, the mark at −150).
import { clamp, text, measure } from '../../../handoffs/util.js';
import { expOut } from '../../../motion.js';
import { fontFor, wrap } from '../../lang.js';
import LOOK from '../../look/device-margin/look.js';

export const TEXT_IN = 0.36, TEXT_OUT = 0.2;
export const TYPE = (L, display = 95) => ({
  display: { f: fontFor(LOOK, 'display', L, display, 700, 'display'), color: 'ink', size: display },
  line: { f: fontFor(LOOK, 'text', L, 49, 600, 'text'), color: 'muted', size: 49 },
  note: { f: fontFor(LOOK, 'mono', L, L === 'zh' ? 28 : 25, 500), color: 'dim', size: L === 'zh' ? 28 : 25 },
  url: { f: fontFor(LOOK, 'mono', L, L === 'zh' ? 28 : 25, 500), color: 'ink', size: L === 'zh' ? 28 : 25 },
});
const tone = (C, k) => (k === 'muted' ? C.muted || C.dim : C[k]);
// The value size for a set of items: 95, or 76 when any value is wider than the margin at 95.
export const displaySize = (g, items, W, L) => (items.some((i) => i.role === 'display' && i.text && measure(g, i.text, TYPE(L).display.f).width > W) ? 76 : 95);
// Lay out: each item gets its lines (wrapped to W; the value never wraps) and its slot (px under the block level).
export const layout = (g, items, W, L, display) => {
  const size = display || displaySize(g, items, W, L), T = TYPE(L, size);
  const lineOf = (i) => (i.role === 'display' ? [i.text] : i.role === 'mark' ? [] : wrap(g, i.text || '', T[i.role].f, W, L));
  const lineLines = Math.max(1, ...items.filter((i) => i.role === 'line').map((i) => lineOf(i).length));
  const noteSlot = 128 + Math.round(49 * 1.32) + (lineLines - 1) * Math.round(49 * 1.36) + 21;
  return { size, T, items: items.map((i) => ({ ...i, lines: lineOf(i), slot: i.slot ?? { display: 0, line: 128, note: noteSlot, url: noteSlot, mark: -150 }[i.role] })) };
};
// Paint the laid-out items at time t (s) under the block level `by`, from x X; an item shows from `in` to `out`
// (null: to the end) through its rail.
export const paintNotes = (g, Lay, t, by, X, W, C) => {
  for (const l of Lay.items) {
    const out = l.out ?? Infinity;
    if (t < l.in || t >= out + TEXT_OUT) continue;
    const T = l.role === 'mark' ? null : Lay.T[l.role];
    const railH = l.role === 'mark' ? 100 : Math.round(T.size * 1.32) + (l.lines.length - 1) * Math.round(T.size * 1.36);
    const y = by + l.slot;
    const enter = 1 - expOut((t - l.in) / TEXT_IN), leave = t > out ? Math.pow(clamp((t - out) / TEXT_OUT), 2) : 0;
    const dy = (enter - leave) * railH * 1.15;
    g.save();
    g.beginPath(); g.rect(X - 4, y, W + 40, railH); g.clip();
    if (l.role === 'mark') {
      const im = l.image;
      if (im) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, h = 96; g.imageSmoothingQuality = 'high'; g.drawImage(im, X, y + 2 + dy, (iw * h) / ih, h); }
    } else l.lines.forEach((tx, k) => text(g, tx, X, y + T.size + dy + k * Math.round(T.size * 1.36), T.f, { color: tone(C, T.color) }));
    g.restore();
  }
};

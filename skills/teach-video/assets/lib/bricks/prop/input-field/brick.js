// input-field — a text field as an object: a search bar, a prompt box or a dictation pill. It takes focus (a caret,
// a ring), receives text typed by grapheme, is confirmed (its rim turns to the accent), and can hold a glow inside
// that recedes as the text arrives.
// Adapted from video-shotcraft demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping.tsx (card
// references/shots/interaction/glass-pill-dictation-typing.md), demos/interaction/theme-switch-moves/PaletteThemeRipple.tsx
// (card references/shots/interaction/theme-switch-moves.md), demos/interaction/type-and-filter/TypeAndFilter.tsx (card
// references/shots/interaction/type-and-filter.md) and demos/interaction/canvas-materialize-moves/DiagramCascadeBuild.tsx
// (card references/shots/interaction/canvas-materialize-moves.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D prop (no React, CSS backdrop filter or Remotion); only the structure is kept (the
// fixed width, the left inset, the right button, the caret ahead of the text, the inner left-to-right glow); colours
// by role (the glow and the caret in the accent, the rim line, the confirmed rim accent); every word is the film's
// (the typed text, the placeholder); text is typed by grapheme cluster (lang.js), so Chinese types a character a step.
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { fontFor, graphemes } from '../../lang.js';
import { look as NEUTRAL, copy } from '../../sample.js';

const F = (P, size, weight = 500, role = 'text') => fontFor(P.look || NEUTRAL, role, P.lang, size, weight);

// The text shown at `typed` (0 → 1 of the graphemes; the epsilon keeps the last one at exactly 1).
export const typedText = (s, typed) => { const g = graphemes(s); return g.slice(0, Math.floor(clamp(typed) * g.length + 1e-6)).join(''); };

const searchGlyph = (ctx, x, y, s, color) => {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x + s * 0.42, y + s * 0.42, s * 0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * 0.64, y + s * 0.64); ctx.lineTo(x + s * 0.9, y + s * 0.9); ctx.stroke(); ctx.restore();
};
// The right-hand button: a circle with five short bars (voice) or an arrow (send); filled in the accent while `glow`
// or `ready`, an outline otherwise.
const button = (ctx, cx, cy, r, kind, fill, c, wave = null) => {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = mix(mix(c.ground, c.panel, 0.5), c.accent, fill); ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = mix(c.line, c.accent, fill); ctx.stroke();
  const ink = mix(c.dim, c.onAccent || c.panel, fill);
  ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.1;
  if (kind === 'voice') [30, 16, 24, 13, 20].forEach((hh, i) => { const x = cx + (i - 2) * r * 0.24, h2 = ((hh + (wave == null ? 0 : 2.4 * Math.sin(wave + i * 1.7))) / 92) * r; ctx.beginPath(); ctx.moveTo(x, cy - h2); ctx.lineTo(x, cy + h2); ctx.stroke(); });
  else { ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.38); ctx.lineTo(cx, cy - r * 0.38); ctx.moveTo(cx - r * 0.3, cy - r * 0.08); ctx.lineTo(cx, cy - r * 0.38); ctx.lineTo(cx + r * 0.3, cy - r * 0.08); ctx.stroke(); }
  ctx.restore();
};

// Draw a field in [x, y, w, h]. st: { focus, typed, done, glow, caret (0 hides it, between 0 and 1 fades it), wave (the
// voice bars' phase, null keeps them still) }; opts: { form 'bar' | 'pill' |
// 'prompt', text, placeholder, icon 'search' | 'none', button 'voice' | 'send' | null, size (type px), ring (false: no focus
// ring) }.
export const drawField = (ctx, x, y, w, h, st, P, opts = {}) => {
  const c = P.colors, form = opts.form || 'bar', r = form === 'pill' ? h / 2 : form === 'prompt' ? Math.min(28, h * 0.22) : Math.min(18, h * 0.2);
  const glow = clamp(st.glow || 0), done = clamp(st.done || 0), focus = clamp(st.focus || 0);
  const size = opts.size || Math.round(h * (form === 'pill' ? 0.42 : 0.44));
  ctx.save();
  // outer glow and the drop shadow
  ctx.save(); ctx.shadowColor = glow > 0.01 ? rgba(c.accent, 0.35 * glow) : rgba(mix(c.ink, '#000000', 0.6), 0.12); ctx.shadowBlur = glow > 0.01 ? 60 * glow : 30; ctx.shadowOffsetY = glow > 0.01 ? 0 : 10;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = c.panel; ctx.fill(); ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip();
  const vg = ctx.createLinearGradient(0, y, 0, y + h);
  vg.addColorStop(0, rgba('#ffffff', 0.35)); vg.addColorStop(1, rgba(mix(c.ink, c.panel, 0.5), 0.04));
  ctx.fillStyle = vg; ctx.fillRect(x, y, w, h);
  if (glow > 0.001) {                                                    // the light inside, faint left to strong right
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, rgba(c.accent, 0)); g.addColorStop(0.38, rgba(c.accent, 0.18 * glow)); g.addColorStop(0.78, rgba(c.accent, 0.62 * glow)); g.addColorStop(1, rgba(mix(c.accent, '#ffffff', 0.35), 0.95 * glow));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.lineWidth = 1.5 + 1.5 * done; ctx.strokeStyle = mix(c.line, c.accent, done); ctx.stroke();
  if (opts.ring !== false && focus > 0.01 && done < 0.99) { rrect(ctx, x - 5, y - 5, w + 10, h + 10, r + 5); ctx.lineWidth = 4; ctx.strokeStyle = rgba(c.accent, 0.28 * focus * (1 - done)); ctx.stroke(); }
  // content: icon, text or placeholder, caret
  let tx = x + (form === 'pill' ? 58 : Math.round(h * 0.34));
  if ((opts.icon ?? (form === 'bar' ? 'search' : 'none')) === 'search') { const s = h * 0.36; searchGlyph(ctx, tx, y + (h - s) / 2, s, c.dim); tx += s + h * 0.22; }
  const f = F(P, size, form === 'pill' ? 500 : 550), s = typedText(opts.text || '', st.typed || 0);
  const right = opts.button ? x + w - h * 0.5 - h * 0.42 : x + w - h * 0.3;
  ctx.save(); ctx.beginPath(); ctx.rect(tx - 4, y, right - tx, h); ctx.clip();
  const tw = s ? measure(ctx, s, f).width : 0, shift = Math.max(0, tw + 14 - (right - tx));   // long text scrolls left
  if (s) text(ctx, s, tx - shift, y + h / 2 + 1, f, { color: c.ink, baseline: 'middle' });
  else if (opts.placeholder) text(ctx, opts.placeholder, tx + (focus > 0.5 ? 12 : 0), y + h / 2 + 1, F(P, size, 450), { color: mix(c.dim, c.panel, 0.25), baseline: 'middle' });
  if ((st.caret ?? 1) > 0 && focus > 0.5) { ctx.save(); ctx.globalAlpha *= Math.min(1, st.caret ?? 1); ctx.fillStyle = mix(c.ink, c.accent, Math.max(0.35, glow)); rrect(ctx, tx - shift + tw + 4, y + h / 2 - size * 0.55, 4, size * 1.1, 2); ctx.fill(); ctx.restore(); }
  ctx.restore();
  if (opts.button) button(ctx, x + w - h * 0.5 - 4, y + h / 2, h * 0.35, opts.button, Math.max(glow, opts.button === 'send' ? done : 0), c, st.wave ?? null);
  ctx.restore();
};

const STATES = {
  empty: { focus: 0, typed: 0, done: 0, glow: 0 },
  focus: { focus: 1, typed: 0, done: 0, glow: 1 },
  typed: { focus: 1, typed: 1, done: 0, glow: 0 },
  done: { focus: 1, typed: 1, done: 1, glow: 0 },
};

export default {
  id: 'input-field', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [640, 88], M: [1000, 104], L: [1240, 132] },
  states: STATES,
  parts: ['body', 'rim', 'focus-ring', 'glow', 'icon', 'text', 'placeholder', 'caret', 'button'],
  swap: {
    text: { type: 'text', tier: 'primary', sample: 'titleLong', limits: { en: { words: 8, chars: 44 }, zh: { chars: 20 } } },
    placeholder: { type: 'text', tier: 'glance', sample: 'label', limits: { en: { words: 4, chars: 24 }, zh: { chars: 10 } } },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'accent', 'onAccent'],
  summary: 'A text field as an object: focus with a caret and ring, text typed by grapheme, a confirmed rim, an inner glow that recedes.',
  defaults: (ctx = {}) => ({ form: 'pill', button: 'voice', icon: 'none', text: copy('titleLong', ctx.lang), placeholder: copy('label', ctx.lang), backdrop: true }),
  draw(ctx, S, P) {
    if (P.backdrop) { ctx.save(); ctx.fillStyle = P.colors.ground; ctx.fillRect(-(960 - P.w / 2), -(540 - P.h / 2), 1920, 1080); ctx.restore(); }
    drawField(ctx, 0, 0, P.w, P.h, S, P, { form: P.form, text: P.text, placeholder: P.placeholder, icon: P.icon, button: P.button });
  },
};

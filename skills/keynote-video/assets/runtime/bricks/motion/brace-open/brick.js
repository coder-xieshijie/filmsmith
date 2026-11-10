// brace-open — a pair of brackets, touching in the centre, springs apart with one overshoot and grows to title size;
// the title is revealed between their inner edges like a curtain drawn open.
// Adapted from video-shotcraft demos/typography/brace-expand/BraceExpand.tsx (card
// references/shots/typography/brace-expand.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand title, eyebrow comment,
// motto, dot grid and reflection band removed; the brackets are any pair of glyphs (Chinese: corner brackets 「」 by
// default) placed by their measured ink edges, so the curtain edge is the glyph's inner edge whatever the font; the
// title's gap is measured instead of tuned by hand; Chinese keeps its tracking (no relaxing of negative tracking).
import { clamp, lerp, ground, rgba, mix, measure, scratch, text, fontOf } from '../../../handoffs/util.js';
import { EASE } from '../../ease.js';
import { copy } from '../../sample.js';
import { fontSpec, pick, langOf, springF } from '../type-enter/type.js';

const R = (u) => clamp(u);
const ramp = (f, a, d, c) => c(R((f - a) / d));
const APPEAR = 6, EXPAND = 14, SPRING = { damping: 14, stiffness: 130, settle: 40 };

const norm = (P) => {
  const lang = langOf(pick(P.text, P.lang || 'en'), P.lang);
  return { ...P, lang, text: pick(P.text, lang), open: pick(P.open, lang), close: pick(P.close, lang), size: pick(P.size, lang), braceSize: pick(P.braceSize, lang) };
};

export default {
  id: 'brace-open', kind: 'motion',
  tier: 'T1', family: 'split-wipe', beats: 5,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a caret blinking in the centre (or nothing)',
  to: 'the title between a pair of brackets',
  interpolates: ['bracket gap (a spring with one overshoot)', 'bracket and title scale 0.4 → 1', 'the title\'s clip, bound to the brackets\' inner edges', 'glow', 'tracking relaxing (English)'],
  summary: 'A pair of brackets touching in the centre springs apart with one overshoot and grows to title size; the title is revealed between them like a curtain drawn open.',
  theory: 'One sign does the reveal: the brackets read as "this is the thing" (a code block, a quotation) and their opening is the curtain; the overshoot is the one beat of energy (anticipation and follow-through, Thomas & Johnston 1981).',
  defaults: (ctx = {}) => ({
    text: copy('product', ctx.lang), open: { en: '{', zh: '「' }, close: { en: '}', zh: '」' },
    size: { en: 164, zh: 150 }, weight: 800, braceSize: { en: 300, zh: 260 }, braceRole: { en: 'mono', zh: 'display' },
    x: 960, y: 520, pad: 26, caret: true, glow: 28,
  }),
  prepare(P) {
    P = norm(P);
    const g = scratch(), f = fontSpec(P);
    const role = pick(P.braceRole, P.lang), bf = fontSpec({ ...P, role }, P.braceSize, 500, role);
    const tw = measure(g, P.text, { ...f, spacing: P.lang === 'zh' ? f.spacing : -0.01 * P.size }).width;
    // ink boxes of the brackets: the inner edge is where the curtain runs
    const mo = measure(g, P.open, bf), mc = measure(g, P.close, bf);
    const open = { l: mo.actualBoundingBoxLeft, r: mo.actualBoundingBoxRight, a: mo.actualBoundingBoxAscent, d: mo.actualBoundingBoxDescent };
    const close = { l: mc.actualBoundingBoxLeft, r: mc.actualBoundingBoxRight, a: mc.actualBoundingBoxAscent, d: mc.actualBoundingBoxDescent };
    const half = tw / 2 + P.pad;                                       // half the curtain at rest
    return { N: P, f, bf, tw, half, open, close, frames: this.beats * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const f = p * D.frames, ex = springF(f - EXPAND, SPRING), sc = lerp(0.4, 1, ex);
    const x = D.half * ex * sc;                                        // the curtain's half width
    return { p, f, on: f >= APPEAR, ex, sc, x, caret: f < APPEAR && Math.floor(f / 3) % 2 === 0,
      relax: ramp(f, 40, 24, EASE.smooth), glow: Math.min(1, ex) * (1 - ramp(f, 34, 30, EASE.out)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, cy = P.y, cx = P.x;
    ground(ctx, P);
    if (S.caret && P.caret) { ctx.fillStyle = c.accent; ctx.fillRect(cx - 4, cy - 60, 8, 120); }
    if (!S.on) return;
    // the title, clipped to the curtain with a 14 px feather
    if (S.x > 0.5) {
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - S.x, cy - P.size, 2 * S.x, P.size * 2); ctx.clip();
      ctx.translate(cx, cy); ctx.scale(S.sc, S.sc);
      const sp = P.lang === 'zh' ? D.f.spacing : lerp(-0.03, -0.01, S.relax) * P.size;
      text(ctx, P.text, 0, P.size * 0.35, { ...D.f, spacing: sp }, { color: c.ink, align: 'center' });
      ctx.restore();
      const fe = Math.min(14, S.x / 2);
      for (const s of [-1, 1]) {
        const e = cx + s * S.x, gr = ctx.createLinearGradient(e, 0, e - s * fe, 0);
        gr.addColorStop(0, rgba(c.ground, 1)); gr.addColorStop(1, rgba(c.ground, 0));
        ctx.fillStyle = gr; ctx.fillRect(Math.min(e, e - s * fe), cy - P.size, fe, P.size * 2);
      }
    }
    // the brackets: inner ink edge on the curtain edge, centred on the line, same scale
    for (const [ch, m, s] of [[P.open, D.open, -1], [P.close, D.close, 1]]) {
      ctx.save();
      ctx.translate(cx + s * S.x, cy); ctx.scale(S.sc, S.sc);
      const bx = s < 0 ? -m.r : m.l;                                    // the glyph's inner edge at 0
      const by = (m.a - m.d) / 2;                                       // its ink centred on the line
      if (S.glow > 0.01 && P.glow) { ctx.shadowColor = rgba(c.accent, 0.55 * (0.5 + 0.5 * S.glow)); ctx.shadowBlur = P.glow * (0.5 + 0.5 * S.glow); }
      ctx.font = fontOf(D.bf); ctx.fillStyle = c.accent; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.fillText(ch, bx, by);
      ctx.restore();
    }
  },
  track(S, P, D) { return [[D.N.x - S.x, D.N.y], [D.N.x + S.x, D.N.y]]; },
};

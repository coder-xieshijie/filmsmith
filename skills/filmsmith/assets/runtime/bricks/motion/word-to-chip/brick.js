// word-to-chip — a typed tag becomes a thing: the word and its caret are replaced, in one frame, by a wide chip with
// an icon in place of the '#'; it holds, then shrinks and slides (one curve for both) into its slot on a page, and a
// second hard cut reveals the finished page around it. Two cuts around one glide.
// Adapted from video-shotcraft demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize.tsx (card
// references/shots/interaction/hashtag-to-pill-materialize.md),
// https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role (the chip grey from ink on the
// ground, the revealed chip and page tinted toward the accent, the caret in the accent); the word, the icon (a
// neutral tag glyph instead of the clapperboard), the page's copy and the system font replaced by the film's text and
// type roles; the chip widens to fit a longer word; typing is optional (a scene usually types the word itself).
import { clamp, lerp, mix, rgba, rrect, text, measure } from '../../../handoffs/util.js';
import { bez } from '../../../motion.js';
import { hash } from '../../../rng.js';
import { fontFor, graphemes, wrap } from '../../lang.js';
import { painterOf, copy, look, infoSize } from '../../sample.js';

const FS = 132, PILL = { w: 740, h: 236, padL: 96, icon: 104, gap: 66 }, HERO = [960, 540];
const K = { morph: 6, move: 24, moveEnd: 38, reveal: 41, end: 45 };      // frames after the word is typed (upstream 42 →)
const MOVE = bez(0.5, 0, 0.25, 1);
const F = (P, size, weight = 500) => fontFor(P.look || look, 'display', P.lang, size, weight);

// typing: frames each grapheme of '#word' appears at, 4–6 frames apart (seeded)
const typeKeys = (P) => {
  const g = graphemes('#' + P.word), at = [];
  let f = 2;
  for (let i = 0; i < g.length; i++) { at.push(f); f += 4 + Math.floor(hash(i + 1, P.seed) * 3); }
  return { g, at, frames: f + 6 };
};
const leadOf = (P) => (P.typing ? typeKeys(P).frames : 0);

// The tag glyph: a label tag with a hole, in a size × size box.
const tagIcon = (ctx, x, y, s, color) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 48, s / 48);
  ctx.beginPath(); ctx.moveTo(6, 8); ctx.lineTo(24, 8); ctx.lineTo(43, 27); ctx.quadraticCurveTo(45, 29.5, 43, 32); ctx.lineTo(30, 45); ctx.quadraticCurveTo(27.5, 47, 25, 45);
  ctx.lineTo(6, 26); ctx.closePath(); ctx.moveTo(18, 17); ctx.arc(15, 17, 3.6, 0, Math.PI * 2, true);
  ctx.fillStyle = color; ctx.fill('evenodd'); ctx.restore();
};
// The chip at 1:1, centred on (0, 0): fill, a top inner highlight, a lifted shadow, icon and word.
const chip = (ctx, P, D, { fill, icon, ink, lift = 0 }) => {
  const c = P.colors, w = D.pw, h = PILL.h, x = -w / 2, y = -h / 2;
  ctx.save();
  const tone = mix(c.ink, '#000000', 0.5);
  ctx.shadowColor = rgba(tone, 0.04 + lift * 0.003); ctx.shadowBlur = 2 + lift * 0.3; ctx.shadowOffsetY = 1 + lift * 0.12;
  rrect(ctx, x, y, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  if (lift > 0.01) { ctx.shadowColor = rgba(tone, lift * 0.009); ctx.shadowBlur = lift * 4; ctx.shadowOffsetY = lift * 1.6; ctx.fill(); }
  ctx.restore();
  ctx.save(); rrect(ctx, x, y, w, h, h / 2); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, rgba('#ffffff', 0.32)); g.addColorStop(0.46, rgba('#ffffff', 0)); g.addColorStop(1, rgba('#000000', 0.025));
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = rgba('#ffffff', 0.7); ctx.fillRect(x, y, w, 3);
  ctx.restore();
  tagIcon(ctx, x + PILL.padL, -PILL.icon / 2, PILL.icon, icon);
  text(ctx, P.word, x + PILL.padL + PILL.icon + PILL.gap, 0, F(P, FS), { color: ink, baseline: 'middle' });
};

// The default finished page: a breadcrumb, a rule, the title, the body; the chip's slot left empty (the brick draws it).
const notePage = (P) => (ctx) => {
  const c = P.colors, lang = P.lang, gr = mix(c.ground, c.accent, 0.05);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 1920, 1080);
  const mf = fontFor(P.look || look, 'text', lang, 32, 500);
  text(ctx, copy('eyebrow', lang), 164, 118, mf, { color: mix(c.dim, gr, 0.15) });
  text(ctx, copy('caption', lang), 1760, 118, mf, { color: mix(c.dim, gr, 0.15), align: 'right' });
  ctx.fillStyle = rgba(c.dim, 0.18); ctx.fillRect(164, 144, 1596, 1);
  text(ctx, copy('detailTitle', lang), 160, 290, F(P, 122, 700), { color: mix(c.ink, c.accent, 0.55) });
  const bf = fontFor(P.look || look, 'text', lang, 70, 500);
  wrap(ctx, copy('titleLong', lang) + (lang === 'zh' ? '。' : '. ') + copy('subtitle', lang), bf, 1560, lang).slice(0, 3)
    .forEach((l, i) => text(ctx, l, 152, 700 + i * 93, bf, { color: mix(c.ink, gr, 0.12) }));
};

export default {
  id: 'word-to-chip', kind: 'motion',
  tier: 'T1', family: 'edit-cut', beats: 3,
  beatsFor: (P) => (leadOf(P) + K.end) / 15,
  surface: ['canvas'],
  roles: ['ground', 'panel', 'ink', 'dim', 'accent'],
  from: 'a typed tag (# and a word) with its caret, centred',
  to: 'the finished page, the tag sitting in its slot as a chip',
  interpolates: ['one-frame cut: word and caret → a chip of the same type size, settling 1.03 → 1 in 3 f', 'hold 18 f, then position and scale 1 → 0.554 on one curve (14 f, bezier .5 0 .25 1), the lift 10 → 0', 'one-frame cut to the finished page, the chip recoloured'],
  summary: 'A typed tag becomes a chip in one frame, glides small into its slot on a page, and a second cut reveals the finished page.',
  theory: 'A hard cut reads as a state change, a glide as the same object moving (the cut gives "done", the glide keeps identity); framing the one continuous move between two cuts makes it read quick and sure (the original\'s rhythm, measured frame by frame).',
  sceneRest: false,
  defaults: (ctx = {}) => ({
    word: copy('cards', ctx.lang)[2].title, from: null, to: { scene: 'note' }, slot: [361, 473], scale: 0.554, typing: false, seed: 7,
  }),
  prepare(P) {
    const g = (typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(8, 8)).getContext('2d', { willReadFrequently: true });
    const tw = measure(g, P.word, F(P, FS)).width, hw = measure(g, '#' + P.word, F(P, FS)).width;
    const pw = Math.max(PILL.w, PILL.padL + PILL.icon + PILL.gap + tw + 96);
    const to = P.to?.scene === 'note' ? notePage(P) : painterOf(P.to, P);
    return { pw, hw, to, from: painterOf(P.from, P), lead: leadOf(P), keys: P.typing ? typeKeys(P) : null };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const F0 = D.lead + K.end, fa = p * F0, f = fa - D.lead;
    const typed = D.keys ? D.keys.at.filter((t) => fa >= t).length : Infinity;
    const m = MOVE(clamp((f - K.move) / (K.moveEnd - K.move)));
    const settle = f < K.morph ? 1 : lerp(1.03, 1, 1 - (1 - clamp((f - K.morph) / 3)) ** 2);
    const lift = 10 * (1 - clamp((m - 0.35) / 0.65));
    return { p, f, typed, chip: f >= K.morph, revealed: f >= K.reveal, x: lerp(HERO[0], P.slot[0], m), y: lerp(HERO[1], P.slot[1], m), s: lerp(1, P.scale, m) * settle, lift };
  },
  paint(ctx, S, P, D) {
    const c = P.colors;
    if (S.revealed) { if (D.to) D.to(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); } }
    else if (D.from) D.from(ctx); else { ctx.fillStyle = c.ground; ctx.fillRect(0, 0, 1920, 1080); }
    if (!S.chip) {
      const all = graphemes('#' + P.word), s = all.slice(0, Math.min(all.length, S.typed)).join('');
      const f = F(P, FS), w = measure(ctx, s, f).width, x0 = 960 - (D.hw + 15) / 2;
      text(ctx, s, x0, 540, f, { color: mix(c.ink, c.ground, 0.12), baseline: 'middle' });
      rrect(ctx, x0 + w + 8, 540 - 75, 7, 150, 2); ctx.fillStyle = c.accent; ctx.fill();
      return;
    }
    ctx.save(); ctx.translate(S.x, S.y); ctx.scale(S.s, S.s);
    if (S.revealed) chip(ctx, P, D, { fill: mix(c.panel, c.accent, 0.2), icon: mix(c.accent, c.ink, 0.15), ink: mix(c.ink, c.accent, 0.4), lift: 0 });
    else chip(ctx, P, D, { fill: mix(c.ground, c.ink, 0.07), icon: mix(c.dim, c.ground, 0.1), ink: mix(c.ink, c.ground, 0.1), lift: S.lift });
    ctx.restore();
  },
  blur(p, P, D) { const f = p * (D.lead + K.end) - D.lead; return f > K.move && f < K.moveEnd; },
  track(S) { return [[S.x, S.y]]; },
};

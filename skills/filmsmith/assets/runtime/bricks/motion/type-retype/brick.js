// type-retype — a line is typed, the typist hesitates, deletes the tail and types the real words faster; a highlighter
// bar settles under them.
// Adapted from video-shotcraft demos/typography/typewriter-moves/TypewriterErrorRetype.tsx (card
// references/shots/typography/typewriter-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a HyperFrames brick (no React or Remotion); colours by role; brand eyebrow and demo copy removed;
// characters are grapheme clusters (lang.js) measured in the role's font instead of fixed 60 px mono slots; Chinese
// types at its own pace (a character carries more than a letter); the timing is built from the three phrases instead
// of fixed frames.
import { clamp, ground, rgba, rrect, measure, text, scratch } from '../../../handoffs/util.js';
import { graphemes } from '../../lang.js';
import { EASE } from '../../ease.js';
import { fontSpec, pick, langOf } from '../type-enter/type.js';

const R = (u) => clamp(u);
// Frames per character (at 120 BPM): type, delete, retype; hesitation and the cursor's blinks.
const PACE = { en: { type: 2, del: 1.5, retype: 1.5 }, zh: { type: 4, del: 2.5, retype: 3 } };
const HESITATE = 16, GAP = 3.5, BLINK = 10, HL = 14;

const norm = (P) => {
  const lang = langOf(pick(P.then, P.lang || 'en') + pick(P.keep, P.lang || 'en'), P.lang);
  return { ...P, lang, keep: pick(P.keep, lang), wrong: pick(P.wrong, lang), then: pick(P.then, lang), size: pick(P.size, lang) };
};
const plan = (P) => {
  const pc = PACE[P.lang] || PACE.en, k = graphemes(P.keep).length, w = graphemes(P.wrong).length, t = graphemes(P.then).length;
  const typeEnd = (k + w) * pc.type;                    // the first character at one step, so p = 0 is the empty line
  const delAt = typeEnd + HESITATE, retypeAt = delAt + w * pc.del + GAP, done = retypeAt + (t - 1) * pc.retype;
  return { pc, k, w, t, typeEnd, delAt, retypeAt, done, off: done + 2 * BLINK, total: Math.max(done + 2 * BLINK, done + 1 + HL) };
};

export default {
  id: 'type-retype', kind: 'motion',
  tier: 'T1', family: 'mask-type', beats: 4,
  beatsFor(P) { return Math.ceil(plan(norm(P)).total / 7.5) / 2; },
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'an empty line with a cursor',
  to: 'the corrected line, its new words on a highlighter bar',
  interpolates: ['characters shown (typed, deleted from the end, typed again)', 'the cursor\'s blinks', 'the highlighter bar\'s width'],
  summary: 'A line is typed, the typist hesitates and deletes the tail, then types the real words faster; a highlighter bar settles under them.',
  theory: 'A correction is a claim by contrast: the plain word is shown and taken back, so the replacement reads as the point (the "not X but Y" of rhetoric, epanorthosis); the faster retype carries the conviction.',
  defaults: (ctx = {}) => ({
    keep: ctx.lang === 'zh' ? '发出' : 'Ship ', wrong: ctx.lang === 'zh' ? '草稿' : 'a draft', then: ctx.lang === 'zh' ? '你想要的那一版' : 'the cut you meant',
    size: ctx.lang === 'zh' ? 96 : 100, weight: 600, role: 'mono', x: 960, y: 540, highlight: true, cursor: true, probes: false,
  }),
  prepare(P) {
    P = norm(P);
    const f = fontSpec(P, P.size, P.weight, P.role), g = scratch();
    const final = P.keep + P.then, w = measure(g, final, f).width;
    const T = plan(P);
    const kept = measure(g, P.keep, f).width;
    return { N: P, f, T, left: P.x - w / 2, hl: [P.x - w / 2 + kept - 10, w - kept + 20], frames: this.beatsFor(P) * 15 };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p, P, D) {
    const T = D.T, f = p * D.frames, pc = T.pc;
    const n1 = Math.max(0, Math.min(T.k + T.w, Math.floor(f / pc.type + 1e-9)));
    const removed = f < T.delAt ? 0 : Math.min(T.w, Math.floor((f - T.delAt) / pc.del + 1e-9) + 1);
    const n2 = f < T.retypeAt ? 0 : Math.min(T.t, Math.floor((f - T.retypeAt) / pc.retype + 1e-9) + 1);
    let on = true;
    if (f >= T.off) on = false;
    else if (f >= T.done) on = Math.floor((f - T.done) / (BLINK / 2)) % 2 === 0;
    else if (f >= T.typeEnd && f < T.delAt) on = Math.floor((f - T.typeEnd) / 4) % 2 === 0;
    return { p, n1, removed, n2, cursor: on && p < 1, hl: EASE.snappy(R((f - T.done - 1) / HL)) };
  },
  paint(ctx, S, P, D) {
    P = D.N;
    const c = P.colors, f = D.f;
    ground(ctx, P);
    if (P.highlight && S.hl > 0) {
      rrect(ctx, D.hl[0], P.y + P.size * 0.06, D.hl[1] * S.hl, P.size * 0.36, 6);
      ctx.fillStyle = rgba(c.accent, 0.24); ctx.fill();
    }
    const first = graphemes(P.keep + P.wrong), shownFirst = first.slice(0, Math.max(0, S.n1 - S.removed)).join('');
    const shown = shownFirst + graphemes(P.then).slice(0, S.n2).join('');
    const base = P.y + P.size * 0.34;
    text(ctx, shown, D.left, base, f, { color: c.ink });
    if (P.cursor && S.cursor) {
      const x = D.left + measure(ctx, shown, f).width + 6;
      rrect(ctx, x, P.y - P.size * 0.46, 6, P.size * 0.92, 3); ctx.fillStyle = c.accent; ctx.fill();
    }
  },
  // the highlight's front; with `probes`, also the count of characters shown (60 px each) for the comparison
  track(S, P, D) {
    const pts = [[D.hl[0] + D.hl[1] * S.hl, D.N.y]];
    if (D.N.probes) pts.push([960 + 60 * (Math.max(0, S.n1 - S.removed) + S.n2), 540], [960 + (D.N.probes.hl ?? D.hl[1]) * S.hl, 540]);
    return pts;
  },
};

// caret-fall — the caret falls flat into the line under what it typed, in two moves so it never crosses the text: it
// shrinks onto the line's height at its own place, right of the phrase (cubic in-out over the first 40 %), then
// stretches both ways under the phrase (from 30 %); played backwards, the line contracts into the caret. The thread's
// caret ↔ line in the brief, the band ↔ caret at the URL, the caret into the URL's underline.
// From the thread template: film.js caretToLine, CARET, FLAT (OPEN.flat 0.3 u, OPEN.lift 14 px). Chinese: the phrase
// in Noto Sans SC after the mono; the caret sits 8 px after its last character as in English.
import { palOf, lineBox } from '../../prop/thread-line/kit.js';
import { setLang, setFont, textW, TYPE } from '../../prop/thread-line/fx.js';
import { clamp, lerp, cubicInOut } from '../../../motion.js';

const DEFAULT = { en: { text: 'explain our pipeline' }, zh: { text: '讲清我们的流程' } };
const Y = 560, LIFT = 14, LH = 6;
const boxAt = (P, D, p) => {
  const caret = D.caret, line = D.line, d = cubicInOut(clamp(p / 0.4)), s = cubicInOut(clamp((p - 0.3) / 0.7));
  const dot = { x: caret.x, y: line.y, w: caret.w, h: line.h };
  const v = { x: lerp(caret.x, dot.x, d), y: lerp(caret.y, dot.y, d), w: lerp(caret.w, dot.w, d), h: lerp(caret.h, dot.h, d) };
  return { x: lerp(v.x, line.x, s), y: v.y, w: lerp(v.w, line.w, s), h: v.h };
};
export default {
  id: 'caret-fall', kind: 'motion',
  tier: 'T0', family: 'line-path', beats: 1,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'a 6 × 64 caret 8 px after a typed phrase', to: 'a 6 px line under the phrase, its width + 48 px, 14 px under the baseline',
  interpolates: ['the box: height to the line\'s at its own place (0–40 %), then width both ways under the phrase (30–100 %), cubic in-out'],
  summary: 'The caret falls flat into the line under what it typed, in two moves that never cross the text.',
  theory: 'A cursor that becomes a rule keeps one object on screen through two jobs (the thread\'s one-line principle); moving height first, then width, keeps the moving edge off the glyphs (Tufte\'s smallest effective difference: nothing crosses what is being read).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'cobalt-vermilion', thread: 'rule' }),
  prepare(P) {
    setLang(P.lang); const w = textW('mono', 500, TYPE.body, 0, P.text), x0 = 960 - w / 2;
    return { Pal: palOf(P.colors, P.palette), x0, w, caret: { x: x0 + w + 8, y: Y - 48, w: 6, h: 64 }, line: { x: 960 - (w + 48) / 2, y: Y + LIFT - LH / 2, w: w + 48, h: LH } };
  },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { p: clamp(p) }; },
  paint(ctx, S, P, D) {
    setLang(P.lang);
    ctx.fillStyle = D.Pal.ground; ctx.fillRect(0, 0, 1920, 1080);
    setFont(ctx, 'mono', 500, TYPE.body, 0); ctx.fillStyle = D.Pal.text; ctx.fillText(P.text, D.x0, Y);
    const b = boxAt(P, D, S.p); ctx.fillStyle = D.Pal.line; lineBox(ctx, b.x, b.y, b.w, b.h, P.thread); ctx.fill();
  },
  track(S, P, D) { const b = boxAt(P, D, S.p); return [[b.x, b.y], [b.x + b.w, b.y + b.h]]; },
};

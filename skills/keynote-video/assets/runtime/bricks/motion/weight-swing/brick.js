// weight-swing — a big word springs in letter by letter (1/32-note stagger, ω 20, rising 180 px) and its weight swings
// on the beats, 780 → 200 → 800 → 430 (critically damped, ω 16, each landing on its beat); a closing full stop is the
// line colour. The thread's hook: the word is the brief's whole answer, and the swing is the beat made visible in type.
// From the thread template: film.js word, weightAt, WORD (360 px, baseline 650, fit to 1500). Chinese: Noto Sans SC
// after Bricolage Grotesque (both variable, 200–800), no tracking; the full stop 。 takes the line colour.
import { palOf } from '../../prop/thread-line/kit.js';
import { setLang, setFont, textW, adv, fitSize } from '../../prop/thread-line/fx.js';
import { clamp, crit } from '../../../motion.js';

const DEFAULT = { en: { word: 'Plan.' }, zh: { word: '先做计划。' } };
const land = (u, u0, w = 20) => crit(u - (u0 - 0.05), w);
const weightAt = (u) => { let v = 780, prev = 780; for (const [u0, to] of [[0.5, 200], [1.0, 800], [1.5, 430]]) { v += (to - prev) * land(u, u0, 16); prev = to; } return v; };
const glyphs = (P, D, u) => {
  const size = D.size, w = weightAt(u), xs = adv('disp', w, size, -0.02, P.word), x0 = 960 - textW('disp', w, size, -0.02, P.word) / 2;
  return [...P.word].map((ch, i) => { const ti = u + 0.05 - i * 0.0625; return { ch, i, x: x0 + xs[i], y: 650 + (1 - crit(Math.max(0, ti), 20)) * 180, on: ti >= 0, a: clamp(ti / 0.12), wt: clamp(weightAt(u - i * 0.03), 200, 800) }; });
};
export default {
  id: 'weight-swing', kind: 'motion',
  tier: 'T0', family: 'mask-type', beats: 4,
  surface: ['canvas'],
  roles: ['ground', 'ink', 'accent'],
  from: 'an empty ground', to: 'the word at weight 430, its full stop in the line colour',
  interpolates: ['each letter: y +180 → 0 (ω 20, 1/32-note stagger), opacity over 0.12 u', 'weight 780 → 200 → 800 → 430 on beats 2, 3, 4 (ω 16), each letter 0.03 u behind the one before'],
  summary: 'A big word springs in letter by letter and its weight swings on the beats; its full stop is the line colour.',
  theory: 'Variable-font weight is a motion axis that keeps the word in place while it moves (the word reads throughout), and landing each swing on a beat makes the beat visible without a single cut (Bordwell & Thompson on rhythmic editing; the thread template\'s source film).',
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'cobalt-vermilion' }),
  prepare(P) { setLang(P.lang); return { Pal: palOf(P.colors, P.palette), size: Math.min(360, fitSize('disp', 800, -0.02, P.word, 1500, 360)) }; },
  rest(side) { return this.at(side === 'from' ? 0 : 1); },
  at(p) { return { u: clamp(p) * 2 }; },
  paint(ctx, S, P, D) {
    setLang(P.lang);
    ctx.fillStyle = D.Pal.ground; ctx.fillRect(0, 0, 1920, 1080);
    const mark = /[.!?。！？]$/.test(P.word) ? P.word.length - 1 : -1;
    for (const g of glyphs(P, D, S.u)) {
      if (!g.on) continue;
      ctx.save(); ctx.globalAlpha = g.a; setFont(ctx, 'disp', g.wt, D.size, -0.02); ctx.fillStyle = g.i === mark ? D.Pal.line : D.Pal.text; ctx.fillText(g.ch, g.x, g.y); ctx.restore();
    }
  },
  track(S, P, D) { return glyphs(P, D, S.u).map((g) => [g.x, g.y]); },
};

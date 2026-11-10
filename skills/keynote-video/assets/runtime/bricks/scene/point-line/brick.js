// point-line — the opening of a promotion: the accent point swells and lands on beat 1, shoots out into a line that
// hands its colour to the ink, and the endpoint rises out of the line as its baseline; one token of it (the path
// parameter) drops out and its value rises in on an accent chip. An optional note under the line names what it is.
// From the morph template's `point` and `line` scenes (assets/templates/morph/film.js drawPoint, lineState,
// drawLineText; choreo.js point, line): the point's swell and squash, the 0.34 s exponential shoot, the 0.16 s colour
// hand-off and the swap's springs are the template's. The line is code and stays Latin in every language.
import { CX, LY, LINE_TH, SZ, W, secs, prog, spr, colorsOf, groundOf, loadFonts, lineLayout, lineRect, lineText, fillShape, txt, labelFont, labelText, mix, cubicOut, readTime, clamp } from '../../motion/outline-morph/ink.js';

const DEFAULT = {
  en: { line: 'GET /v2/invoices/{id}', swap: ['{id}', 'inv_8KQ2'], note: 'One endpoint of the spec' },
  zh: { line: 'GET /v2/invoices/{id}', swap: ['{id}', 'inv_8KQ2'], note: '规格里的一个接口' },
};
// beats: the point lands on 1, shoots on 2, the text rises on 3, the token swaps on 4
const TB = { land: 1, shoot: 2, rise: 3, swap: 4 };
const timesOf = (s, bpm) => ({ land: secs(TB.land, bpm), shoot: secs(TB.shoot, bpm), rise: secs(TB.rise, bpm), swap: s.swap && s.swap.length === 2 ? secs(TB.swap, bpm) : null });

export default {
  id: 'point-line', kind: 'scene',
  fits: ['hook', 'demo'],
  surface: ['canvas'],
  beats: { min: 5, max: 9 },
  needs: { motions: [], props: [], roles: ['ground', 'ink', 'dim', 'accent', 'onAccent'], type: ['mono'] },
  slots: {
    line: { type: 'code', tier: 'primary', limits: { en: { chars: 30 }, zh: { chars: 30 } } },
    swap: { type: 'list', count: [0, 2], of: { type: 'code' }, optional: true },
    note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 36 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'onAccent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'] }),
  plan(s, ctx) {
    const last = s.swap && s.swap.length === 2 ? TB.swap : TB.rise;
    const read = ((readTime(s.line, 'en') + (s.note ? readTime(s.note, ctx.lang) * 0.5 : 0)) * ctx.bpm) / 60;
    const beats = clamp(Math.ceil(last + Math.max(1.5, read * 0.6)), 5, 9);
    return { beats, reads: [{ text: s.line, lang: 'en' }, { text: s.note, lang: ctx.lang }],
      cues: [{ beat: TB.land, kind: 'accent' }, { beat: TB.shoot, kind: 'turn' }, { beat: TB.rise, kind: 'land' }, ...(last === TB.swap ? [{ beat: TB.swap, kind: 'accent' }] : [])],
      motion: 'point → line → baseline', settled: last + 0.5, peakAt: TB.land, pause: beats - last - 0.5 };
  },
  validate(s) { const e = []; if (!s.line) e.push('line: required'); if (s.swap && s.swap.length === 2 && !String(s.line).includes(s.swap[0])) e.push(`swap: "${s.swap[0]}" is not in the line`); return e; },
  async prepare(s, c) { await loadFonts(c.lang); return {}; },
  paint(ctx, u, s, c, D) {
    const C = colorsOf(s), L = c.lang, t = secs(u, c.bpm), T = timesOf(s, c.bpm);
    groundOf(ctx, s, C);
    const Lx = D.Lx || (D.Lx = lineLayout(ctx, s.line, s.swap));
    if (t < T.shoot) { // the point: present from frame 0 at 45 %, swells and lands on beat 1 with a squash
      const k = cubicOut(prog(t, T.land - 0.25, 0.25));
      const sq = t > T.land ? 0.1 * Math.exp(-14 * (t - T.land)) * Math.sin(40 * (t - T.land)) : 0;
      ctx.save(); ctx.translate(CX, LY); ctx.scale(1 + sq, 1 - sq);
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(0, 0, 22 * (0.45 + 0.55 * k), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    const st = lineRect(Lx, t, T);
    fillShape(ctx, st.rect, mix(C.accent, C.ink, st.col));
    if (t >= T.rise) { // the text rises out of the line: clipped above it, so the line reads as its baseline
      const k = spr(t - T.rise, 22);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, LY - LINE_TH / 2 - 2); ctx.clip();
      lineText(ctx, Lx, t, T.swap, CX - st.textW / 2, C, { color: C.ink, rise: (1 - k) * 96 });
      ctx.restore();
    }
    if (s.note && t >= T.rise + 0.3) {
      const k = spr(t - T.rise - 0.3, 22);
      txt(ctx, labelText(s.note, L), CX, LY + 84 + (1 - k) * 16, labelFont(L), C.dim, { align: 'center', alpha: k });
    }
  },
  track(u, s, c) { return [[CX, LY]]; },
};

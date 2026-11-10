// poster-end — the closing page, flush left: the name at 225 px, three or four parts under 4 px rules in columns, an
// ink square and the URL at 47 px (held ≥ 3 s once legible), a rule and one or two foot lines; on the downbeat of the
// last bar an ink underline lands under the URL, the closing second move. A rest: it absorbs the phrase's remainder.
// From the plakat template's `end` (assets/templates/plakat/scenes.js).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, wrapLines, drawPath, rollUp, lerp, graphemes , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = { en: { name: 'tablewarden', items: ['DRAFT', 'MEASURE', 'REPLAY', 'SIGN'], url: 'tablewarden.example/docs', foot: ['MIT · Postgres 14+', 'Agents draft. You sign.'] },
  zh: { name: 'tablewarden', items: ['起草', '测量', '回放', '签字'], url: 'tablewarden.example/docs', foot: ['MIT · Postgres 14+', '代理起草，你来签字。'] } };
const tplan = (s, bpm, L) => {
  const P = { rules: 0.4, items: 0.5, sq: 1.0, url: 1.1, eR: 1.7, foot: 1.9 };
  P.reads = [[0, [s.name]], [P.items, [s.items.join(' ')], G], [P.url, [s.url], { hold: 3 }], [P.foot, s.foot || [], G]];
  P.settled = Math.max(P.eR + 0.6, P.foot + 0.15 * Math.max(0, (s.foot?.length || 1) - 1) + 0.4);
  P.D = Math.max(needU(P.reads, P.settled, 0, bpm, L) + 1, s.minBeats ? s.minBeats / 2 : 0);   // + the last bar's move
  P.last = P.D - 1;   // the underline lands on the last downbeat (2 beats before the end)
  return P;
};
export default {
  id: 'poster-end', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 6, max: 16 },
  needs: { motions: [], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid'], type: ['display', 'text', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 7 } } },
    items: { type: 'list', count: [2, 4], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 12 }, zh: { chars: 5 } } } },
    url: { type: 'code', tier: 'primary', limits: { en: { chars: 44 }, zh: { chars: 44 } } },
    foot: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 44 }, zh: { chars: 16 } } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.name, s.url].map((text) => ({ text, lang: ctx.lang })), cues: [{ beat: 0, kind: 'land' }, { beat: 2, kind: 'stamp' }, { beat: 2.2, kind: 'land' }, { beat: P.last * 2, kind: 'end' }], motion: 'name, parts, square and URL, rule, foot; the underline on the last downbeat', settled: P.settled * 2, peakAt: 0 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L);
    ground(ctx, C);
    const nz = fitSize(ctx, plain(s.name), (z) => F('display', L, z), 1740, 225, 164);
    masked(ctx, s.name, 84, 150, F('display', L, nz), C, { off: riseOff(tw(0, 0.7)), lh: 1 });
    s.items.forEach((it, i) => {
      const x = COL(1 + 3 * i); rect(ctx, x, 500, 414 * ck.sec(AT(P.rules) + 0.1 * i, 0.45, E.expoOut), 4, C.ink);
      const p = ck.sec(AT(P.items) + 0.1 * i, 0.3, E.p3Out); if (p <= 0) return;
      at(ctx, labelText(pad2(i + 1), L), x, 522 + 14 * (1 - p), lf, C.dim, { alpha: p });
      at(ctx, it, x, 522 + S.label * 1.3 + 8 + 14 * (1 - p), { ...F('display', L, 47, 800), spacing: zh(L) ? 0 : -0.025 * 47 }, C.ink, { alpha: p });
    });
    rect(ctx, 96, 700, 52 * tw(P.sq, 0.3), 52, C.ink);
    const uf = { ...F('mono', L, 47, 500), spacing: -0.02 * 47 };
    masked(ctx, s.url, 176, 692, uf, C, { off: riseOff(tw(P.url, 0.6)), lh: null, rich: false });
    rect(ctx, 176, 772, width(ctx, s.url, uf) * ck.sec(AT(P.last) - 0.133, 0.4, E.expoOut), 6, C.ink);
    rect(ctx, 96, 820, 1728 * tw(P.eR, 0.6), 2, C.ink);
    (s.foot || []).forEach((f, i) => { const p = ck.sec(AT(P.foot) + 0.15 * i, 0.4, E.p2Out); at(ctx, f, i ? 1118 : 96, 842 + 10 * (1 - p), { ...F('text', L, S.label, i ? 750 : 500), spacing: zh(L) ? 0 : (i ? -0.02 : -0.01) * 25 }, C.ink, { alpha: p }); });
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 400]]; },
};

// verify-band — an independent check: a dashed box (what is checked) linked down to an ink box (who checks); a list
// of checks whose results fill ink one per half beat while a 300 px counter steps in whole numbers to n/n (flashing
// the accent once at n); an optional blind-check line; then an accent band grows across the frame under the page
// and two statements rise inside it: where the person decides. An ink frame walks the rows while the page holds.
// From the plakat template's `verify` (assets/templates/plakat/scenes.js).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, pageHead, wrapLines, drawPath, rollUp, lerp , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { num: '03', title: 'Replay', caption: 'Replayed on a prod copy.', from: { label: 'Plan', title: '0042_drop_email' }, link: 'copy  pg-shadow-2',
    to: { label: 'Probe', title: 'Shadow replay', note: 'own role · real traffic' }, heads: ['Check', 'Result'],
    rows: [{ id: 'L01', ref: 'longest lock 38 ms', result: 'PASS' }, { id: 'L02', ref: 'no table rewrite', result: 'PASS' }, { id: 'L03', ref: 'reads match email', result: 'PASS' }, { id: 'L04', ref: 'rollback replayed', result: 'PASS' }],
    counter: { label: 'Checks', caption: 'green on the shadow copy' }, band: { a: 'Red means stop.', b: 'You pick the fix.' } },
  zh: { num: '03', title: '回放', caption: '在生产副本上回放。', from: { label: '计划', title: '0042_drop_email' }, link: '副本  pg-shadow-2',
    to: { label: '探针', title: '影子回放', note: '独立角色 · 真实流量' }, heads: ['检查', '结果'],
    rows: [{ id: 'L01', ref: '最长锁 38 ms', result: '通过' }, { id: 'L02', ref: '不重写整表', result: '通过' }, { id: 'L03', ref: '读取与 email 一致', result: '通过' }, { id: 'L04', ref: '回滚已回放', result: '通过' }],
    counter: { label: '检查', caption: '影子副本上全绿' }, band: { a: '红色就停下。', b: '修法由你来选。' } },
};
const tplan = (s, bpm, L) => {
  const n = s.rows.length, passT = s.rows.map((_, i) => 1.25 + 0.25 * i), pe = passT[n - 1];
  const P = { passT, flash: pe + 0.25, unflash: pe + 0.4, blind: pe + 0.5, band: pe + 0.75 };
  P.bt = P.band + 0.25;
  P.reads = [[0, [s.title]], [0.15, [s.caption], G], [0.15, [s.from.title]], [0.9, [s.to.title]], ...s.rows.map((r, i) => [passT[i], [r.ref], G]), [P.flash, [n + '/' + n]], ...(s.blind ? [[P.blind, [s.blind], G]] : []), [P.bt, [s.band.a]], [P.bt + 0.35, [s.band.b]]];
  P.settled = P.bt + 0.35 + 0.55;
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.moves = walkMoves(P.settled, P.D - 0.125);
  return P;
};
export default {
  id: 'verify-band', kind: 'scene',
  fits: ['proof', 'turn'],
  surface: ['canvas'],
  beats: { min: 8, max: 20 },
  needs: { motions: ['walk-frame', 'block-carry'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'line', 'grid', 'accent', 'onAccent', 'onInk'], type: ['display', 'text', 'mono'] },
  slots: {
    num: { type: 'number', tier: 'glance', limits: { en: { chars: 2 }, zh: { chars: 2 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } },
    from: { type: 'group', of: { label: { type: 'text', tier: 'glance' }, title: { type: 'code', tier: 'primary' } } },
    link: { type: 'code', tier: 'glance', limits: { en: { chars: 28 }, zh: { chars: 20 } } },
    to: { type: 'group', of: { label: { type: 'text', tier: 'glance' }, title: { type: 'text', tier: 'primary' }, note: { type: 'text', tier: 'glance' } } },
    rows: { type: 'list', count: [3, 7], of: { id: { type: 'code', tier: 'glance', limits: { en: { chars: 4 }, zh: { chars: 4 } } }, ref: { type: 'text', tier: 'glance', limits: { en: { words: 5, chars: 28 }, zh: { chars: 12 } } }, result: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } } } },
    counter: { type: 'group', of: { label: { type: 'text', tier: 'glance' }, caption: { type: 'text', tier: 'glance' } } },
    blind: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 34 }, zh: { chars: 14 } } },
    band: { type: 'group', of: { a: { type: 'text', tier: 'primary' }, b: { type: 'text', tier: 'primary' } } },
  },
  roles: ['paper', 'ink', 'dim', 'line', 'grid', 'accent', 'onAccent', 'onInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], blind: '', seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, s.from.title, s.to.title, s.band.a, s.band.b].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, { beat: 1.4, kind: 'stamp' }, ...P.passT.map((u) => ({ beat: u * 2, kind: 'tick' })), { beat: P.flash * 2, kind: 'accent' }, { beat: P.band * 2, kind: 'turn' }, { beat: P.bt * 2, kind: 'land' }],
      motion: 'boxes, link, rows; results fill and the counter steps; the accent band; two statements', settled: P.settled * 2, peakAt: P.band * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L), mf = F('mono', L, S.label, 500), n = s.rows.length;
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    pageHead(ctx, s, C, L, ck);
    const ap = tw(0.15, 0.3, E.p2Out), bf = { ...F('display', L, S.body, 700), spacing: zh(L) ? 0 : -0.025 * 34 };
    ctx.save(); ctx.translate(-16 * (1 - ap), 0); frameRect(ctx, 96, 340, 560, 110, 2, C.ink, { dash: [8, 6], alpha: ap }); at(ctx, labelText(s.from.label, L), 120, 358, lf, C.dim, { alpha: ap }); at(ctx, s.from.title, 120, 390, bf, C.ink, { alpha: ap }); ctx.restore();
    rect(ctx, 210, 450, 2, 70 * tw(0.45, 0.3, E.p2Out), C.ink);
    const hp = tw(0.5, 0.25, E.p2Out); at(ctx, s.link, 240 - 10 * (1 - hp), 468, mf, C.ink, { alpha: hp });
    rect(ctx, 96, 520, 560 * tw(0.7, 0.4, E.expoInOut), 150, C.ink);
    const tp = (i) => ck.sec(AT(0.9) + 0.06 * i, 0.25, E.p2Out);
    at(ctx, labelText(s.to.label, L), 120, 540, { ...lf }, C.onInk, { alpha: tp(0), dy: 8 * (1 - tp(0)) });
    at(ctx, s.to.title, 120, 576, { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.03 * 34 }, C.onInk, { alpha: tp(1), dy: 8 * (1 - tp(1)) });
    at(ctx, s.to.note, 120, 628, mf, C.onInk, { alpha: tp(2), dy: 8 * (1 - tp(2)) });
    if (s.blind) { const bp = tw(P.blind, 0.3, E.p2Out); rect(ctx, 96, 704, 18, 18, C.accent, bp); at(ctx, s.blind, 130, 692, bf, C.ink, { alpha: bp }); }
    const [ha, hb] = s.heads || ['Requirement', 'Result'], thp = tw(0.3, 0.2);
    at(ctx, labelText(ha, L), 680, 340, lf, C.dim, { alpha: thp }); at(ctx, labelText(hb, L), 1264, 340, lf, C.dim, { alpha: thp });
    const boxes = [];
    s.rows.forEach((r, i) => {
      const y = 380 + i * 52; boxes.push([668, y + 2, 730, 48]);
      rect(ctx, 680, y + 50, 706 * ck.sec(AT(0.35) + 0.04 * i, 0.4, E.expoOut), 2, C.line);
      const ip = ck.sec(AT(0.4) + 0.04 * i, 0.2, E.p2Out), vp = ck.sec(AT(0.5) + 0.04 * i, 0.2, E.p2Out);
      at(ctx, r.id, 680 - 8 * (1 - ip), y + 10, F('mono', L, S.label, 600), C.ink, { alpha: ip });
      at(ctx, r.ref, 800 - 8 * (1 - vp), y + 10, mf, C.dim, { alpha: vp });
      if (ck.t >= AT(P.passT[i])) { const f = ck.sec(AT(P.passT[i]), 0.15, E.p2Out); rect(ctx, 1264, y + 8, 122 * f, 36, C.ink); at(ctx, r.result, 1325, y + 8 + 18 - S.label * 0.62, F('mono', L, S.label, 600), C.onInk, { align: 'center' }); }
    });
    at(ctx, labelText(s.counter.label, L), 1556, 340, lf, C.dim, { alpha: tw(0.6, 0.2) });
    let k = 0; P.passT.forEach((pu) => { if (ck.t >= AT(pu)) k++; });
    const flash = ck.t >= AT(P.flash) && ck.t < AT(P.unflash), np = tw(0.7, 0.3, E.p2Out), op = tw(0.8, 0.3, E.p2Out);
    at(ctx, String(k), 1546, 392, F('num', L, 300), flash ? C.accent : C.ink, { lh: 0.82, alpha: np, dy: 20 * (1 - np) });
    at(ctx, '/' + n, 1712, 532, F('num', L, 120), C.ink, { lh: 0.82, alpha: op, dy: 20 * (1 - op) });
    const cp = tw(1.0, 0.3);
    wrapLines(ctx, s.counter.caption, mf, 268, L).slice(0, 3).forEach((ln, i) => at(ctx, ln, 1556, 660 + i * S.label * 1.4, mf, C.ink, { lh: 1.4, alpha: cp }));
    // the stop band: accent across the frame at y 780–940; the two statements rise inside it
    const bw = tw(P.band, 0.5, E.expoInOut);
    rect(ctx, 0, 780, 1920 * bw, 160, C.accent);
    const sf = { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.02 * 34 };
    if (ck.t >= AT(P.bt) - 0.01) { masked(ctx, s.band.a, 96, 841, sf, C, { off: riseOff(tw(P.bt, 0.55)), lh: 1, color: C.onAccent, rich: false }); masked(ctx, s.band.b, 972, 841, sf, C, { off: riseOff(ck.sec(AT(P.bt) + 0.35 * ck.k, 0.55)), lh: 1, color: C.onAccent, rich: false }); }
    walkFrame(ctx, ck, P.moves, boxes, C);
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L, { fields: bw > 0 ? [{ x: 0, y: 780, w: 1920 * bw, h: 160 }] : [] });
  },
  track() { return [[960, 540]]; },
};

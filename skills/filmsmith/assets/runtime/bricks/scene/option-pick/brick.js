// option-pick — decisions a person makes: a page head, a table of one to three questions, each offering two options;
// the chosen option fills with the accent from the left; notes; a decision summary box fills with the picks; an ink
// block wipes in beside it, "You confirm." rises inside and an accent tick draws. An ink frame walks the picks while
// the page holds; the page rolls up bottom-first at its end.
// From the plakat template's `options` (assets/templates/plakat/scenes.js; plan, layout and tweens as there).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, pageHead, wrapLines, drawPath, rollUp, lerp , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { num: '02', title: 'Decide', caption: 'Two questions before the run.', heads: ['Q', 'Question', 'Options'],
    rows: [{ q: 'Batch the backfill?', options: ['Yes', 'No'], pick: 0 }, { q: 'Who signs the change?', options: ['You', 'The agent'], pick: 0 }],
    notes: ['picked by the person'], summary: 'Decision summary', confirm: 'You confirm.' },
  zh: { num: '02', title: '决定', caption: '运行前的两个问题。', heads: ['Q', '问题', '选项'],
    rows: [{ q: '分批回填吗？', options: ['是', '否'], pick: 0 }, { q: '谁来签这次改动？', options: ['你', '代理'], pick: 0 }],
    notes: ['由人来选'], summary: '决定摘要', confirm: '你来确认。' },
};
const tplan = (s, bpm, L) => {
  const r = rd(L); let read = 0.25 + r(s.title); const rowT = [];
  s.rows.forEach((x, i) => { const u = i === 0 ? 0.4 : Math.max(rowT[i - 1] + 1, halfBeatUp(read - 0.25)); rowT.push(u); read = Math.max(read, u + 0.25) + r(x.q); });
  const base = rowT[rowT.length - 1], sum = Math.max(base + 1.25, halfBeatUp(read));
  const P = { rowT, notes: base + 0.9, sum, items: sum + 0.2, confirm: sum + 0.75, ctext: sum + 0.9, tick: sum + 1.25 };
  P.reads = [[0, [s.title]], [0.15, [s.caption], G], [0.2, s.heads || [], G], ...rowT.flatMap((u, i) => [[u, [s.rows[i].q]], [u + 0.25, s.rows[i].options, G]]),
    ...(s.notes?.length ? [[P.notes, s.notes, G]] : []), [P.sum, [s.summary], G], [P.items, s.rows.map((x) => x.options[x.pick]), G], [P.ctext, [s.confirm]]];
  P.settled = P.tick + 0.3;
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.moves = walkMoves(P.settled, P.D - 0.125);
  return P;
};
export default {
  id: 'option-pick', kind: 'scene',
  fits: ['demo', 'turn'],
  surface: ['canvas'],
  beats: { min: 8, max: 20 },
  needs: { motions: ['walk-frame'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'line', 'grid', 'accent', 'onAccent', 'onInk'], type: ['display', 'text', 'mono'] },
  slots: {
    num: { type: 'number', tier: 'glance', limits: { en: { chars: 2 }, zh: { chars: 2 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } },
    rows: { type: 'list', count: [1, 3], of: {
      q: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 10 } } },
      options: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 16 }, zh: { chars: 6 } } } },
      pick: { type: 'index', default: 0 } } },
    notes: { type: 'list', count: [0, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 36 }, zh: { chars: 14 } } } },
    summary: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 24 }, zh: { chars: 8 } } },
    confirm: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 14 }, zh: { chars: 6 } } },
  },
  roles: ['paper', 'ink', 'dim', 'line', 'grid', 'accent', 'onAccent', 'onInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, ...s.rows.map((x) => x.q), s.confirm].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, ...P.rowT.map((u) => ({ beat: u * 2, kind: 'tick' })), ...P.rowT.map((u) => ({ beat: (u + 0.85) * 2, kind: 'accent' })), { beat: P.confirm * 2, kind: 'stamp' }, { beat: P.tick * 2, kind: 'land' }],
      motion: 'questions rise, options pop, the picks fill accent; summary; confirm block and tick', settled: P.settled * 2, peakAt: P.tick * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L);
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    pageHead(ctx, s, C, L, ck);
    const [h0, h1, h2] = s.heads || ['Q', 'Question', 'Options'], hp = tw(0.2, 0.25, E.p2Out);
    [[h0, 96], [h1, 242], [h2, 1264]].forEach(([h, x], i) => at(ctx, labelText(h, L), x, 318, lf, C.dim, { alpha: ck.sec(AT(0.2) + 0.05 * i, 0.25, E.p2Out) }));
    const picks = [];
    s.rows.forEach((r, i) => {
      const y = 378 + i * 120, ru = P.rowT[i];
      rect(ctx, 96, y + 100, 1728 * tw(ru, 0.6), 2, C.line);
      at(ctx, 'Q' + (i + 1), 96, y + 18, F('mono', L, S.label, 600), C.ink, { alpha: tw(ru, 0.2, E.p2Out) });
      masked(ctx, r.q, 242, y + 10, { ...F('text', L, S.body, 600), spacing: zh(L) ? 0 : -0.015 * 34 }, C, { off: riseOff(tw(ru, 0.5)), lh: null, rich: false });
      r.options.forEach((o, j) => {
        const x = j === 0 ? 1264 : 1556, op = ck.sec(AT(ru) + 0.25 + 0.08 * j, 0.25, E.p2Out);
        const of = { ...F('text', L, S.label, 600), spacing: zh(L) ? 0 : -0.01 * 25 };
        frameRect(ctx, x, y + 10 * (1 - op), 268, 66, 2, C.ink, { alpha: op });
        at(ctx, o, x + 134, y + 33 - S.label * 0.6 + 10 * (1 - op), of, C.ink, { alpha: op, align: 'center' });
        if (j === r.pick) {
          picks.push([x - 10, y - 10, 288, 86]);
          const f = tw(ru + 0.85, 0.32);
          if (f > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, 268 * f, 66); ctx.clip(); rect(ctx, x, y, 268, 66, C.accent); at(ctx, o, x + 134, y + 33 - S.label * 0.6, of, C.onAccent, { align: 'center' }); ctx.restore(); }
        }
      });
    });
    const ny = 378 + s.rows.length * 120 + 2, np = tw(P.notes, 0.3, E.p2Out);
    if (s.notes?.length && np > 0) { let x = 242 - 16 * (1 - np); s.notes.forEach((n) => { rect(ctx, x, ny + 8, 14, 14, C.accent, np); at(ctx, n, x + 30, ny, F('mono', L, S.label, 400), C.ink, { alpha: np }); x += 60 + width(ctx, n, F('mono', L, S.label, 400)); }); }
    // the summary box (clip in from the left), its items, the confirm block and tick
    const sp = tw(P.sum, 0.45, E.expoInOut);
    if (sp > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(96, 796, 1144 * sp, 140); ctx.clip();
      frameRect(ctx, 96, 796, 1144, 140, 2, C.ink); at(ctx, labelText(s.summary, L), 120, 812, lf, C.dim);
      let x = 120; s.rows.forEach((r, i) => { const ip = ck.sec(AT(P.items) + 0.12 * i, 0.3, E.p3Out), df = { ...F('display', L, S.body, 700), spacing: zh(L) ? 0 : -0.03 * 34 }, kf = F('mono', L, S.label, 500);
        at(ctx, 'D' + (i + 1) + ' ', x, 858 + 14 * (1 - ip) + (S.body - S.label) * 0.4, kf, C.dim, { alpha: ip }); const kw = width(ctx, 'D' + (i + 1) + ' ', kf);
        at(ctx, r.options[r.pick], x + kw, 858 + 14 * (1 - ip), df, C.ink, { alpha: ip }); x += kw + width(ctx, r.options[r.pick], df) + 44; });
      ctx.restore();
    }
    const cf = tw(P.confirm, 0.45, E.expoInOut);
    rect(ctx, 1264, 796, 560 * cf, 140, C.ink);
    if (ck.t >= AT(P.ctext) - 0.01) masked(ctx, s.confirm, 1292, 846, { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.02 * 34 }, C, { off: riseOff(tw(P.ctext, 0.5)), lh: 1, color: C.onInk, rich: false });
    if (ck.t >= AT(P.tick)) { const tp = ck.sec(AT(P.tick), 0.12, E.none); rect(ctx, 1734, 844, 48, 48, C.accent, tp); ctx.save(); ctx.translate(1734, 844); drawPath(ctx, [[11, 25], [20, 34], [37, 14]], ck.sec(AT(P.tick) + 0.02, 0.28, E.p2Out), C.onAccent, 6); ctx.restore(); }
    walkFrame(ctx, ck, P.moves, picks, C);
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 540]]; },
};

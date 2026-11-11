// step-matrix — work done in a fixed loop: rows are steps, columns milestones; an accent cursor frame moves cell by
// cell on half beats and each cell fills ink with "<milestone> DONE"; an accent underline lands under a milestone
// when its column is full; a side numeral (400 px) with its label and caption; a strip of one or two statements
// below. An ink frame walks the step rows while the page holds.
// From the plakat template's `matrix` (assets/templates/plakat/scenes.js).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, pageHead, wrapLines, drawPath, rollUp, lerp , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { num: '04', title: 'Loop', caption: 'Every statement runs the same three checks.', corner: 'Statement', cols: ['Lint', 'Lock', 'Replay'], rows: ['S1 add column', 'S2 backfill', 'S3 swap reads'], done: 'DONE',
    side: { label: 'Failures', big: '0', caption: 'in 12 checks' }, strip: [{ text: 'Same checks every time.', note: 'runner v2 · fixed order' }, { text: 'You see every result.', note: 'log kept 90 days' }] },
  zh: { num: '04', title: '循环', caption: '每条语句都跑同样三项检查。', corner: '语句', cols: ['检查', '锁', '回放'], rows: ['S1 新增列', 'S2 回填', 'S3 切换读取'], done: '完成',
    side: { label: '失败', big: '0', caption: '共 12 项检查' }, strip: [{ text: '每次都是同样的检查。', note: 'runner v2 · 顺序固定' }, { text: '每个结果你都看得到。', note: '日志保留 90 天' }] },
};
const tplan = (s, bpm, L) => {
  const N = s.cols.length * s.rows.length, rowT = s.rows.map((_, i) => 0.15 + 0.25 * i), cellT = Array.from({ length: N }, (_, j) => 0.6 + 0.25 * j), end = cellT[N - 1];
  const r = rd(L); let read = 0.25 + r(s.title); s.rows.forEach((x, i) => (read = Math.max(read, rowT[i] + 0.25) + r(x)));
  const stT = []; (s.strip || []).forEach((x, i) => { const u = Math.max(i ? stT[i - 1] + 0.35 : end + 0.15, halfBeatUp(read - 0.25)); stT.push(u); read = Math.max(read, u + 0.25) + r(x.text); });
  const P = { rowT, cellT, end, strip: (stT[0] ?? end + 0.15) - 0.1, stT, ssT: stT.map((u) => u + 0.25), curOff: end + 0.3 };
  P.reads = [[0, [s.title]], [0.15, [s.caption], G], ...rowT.map((u, i) => [u, [s.rows[i]]]), [0.45, [s.side.big]], ...(s.strip || []).flatMap((x, i) => [[stT[i], [x.text]], [stT[i] + 0.25, [x.note], G]])];
  P.settled = Math.max(end + 0.3, stT.length ? P.ssT[stT.length - 1] + 0.25 : 0);
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.moves = walkMoves(P.settled, P.D - 0.125);
  return P;
};
export default {
  id: 'step-matrix', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 8, max: 20 },
  needs: { motions: ['walk-frame'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onInk'], type: ['display', 'text', 'mono'] },
  slots: {
    num: { type: 'number', tier: 'glance', limits: { en: { chars: 2 }, zh: { chars: 2 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } },
    corner: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 18 }, zh: { chars: 6 } } },
    cols: { type: 'list', count: [2, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 6 }, zh: { chars: 3 } } } },
    rows: { type: 'list', count: [2, 4], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 18 }, zh: { chars: 8 } } } },
    done: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 7 }, zh: { chars: 3 } } },
    side: { type: 'group', of: { label: { type: 'text', tier: 'glance' }, big: { type: 'number', tier: 'primary' }, caption: { type: 'text', tier: 'glance' } } },
    strip: { type: 'list', count: [0, 2], of: { text: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 11 } } }, note: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 24 }, zh: { chars: 12 } } } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, ...s.rows, ...(s.strip || []).map((x) => x.text)].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, ...P.cellT.map((u) => ({ beat: u * 2, kind: 'tick' })), ...P.stT.map((u) => ({ beat: u * 2, kind: 'land' }))],
      motion: 'rows rise; the accent cursor fills the cells on half beats; the numeral; the strip', settled: P.settled * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L), R = s.rows.length;
    const cx = (i) => COL(5 + 2 * i);
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    pageHead(ctx, s, C, L, ck);
    const thp = tw(0.1, 0.2, E.p2Out);
    at(ctx, labelText(s.corner, L), 96, 340, lf, C.dim, { alpha: thp, dy: 8 * (1 - thp) });
    s.cols.forEach((h, i) => { at(ctx, h, cx(i), 336, { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.03 * 34 }, C.ink, { alpha: thp, dy: 8 * (1 - thp) }); });
    const boxes = [];
    s.rows.forEach((r, i) => { boxes.push([86, 409 + 90 * i, cx(0) - 106, 72]); masked(ctx, r, 96, 419 + 90 * i, { ...F('text', L, S.body, 600), spacing: zh(L) ? 0 : -0.02 * 34 }, C, { off: riseOff(tw(P.rowT[i], 0.45)), lh: null, rich: false }); });
    const cellA = (j) => ck.sec(AT(0.3) + 0.025 * j, 0.2, E.none);
    s.cols.forEach((col, ci) => s.rows.forEach((_, ri) => {
      const j = ci * R + ri, x = cx(ci), y = 409 + ri * 90, a = cellA(j);
      if (a <= 0) return;
      frameRect(ctx, x, y, 268, 72, 2, C.ink, { alpha: a });
      const f = tw(P.cellT[j], 0.18, E.p2Out); rect(ctx, x, y, 268 * f, 72, C.ink, a);
      const dp = ck.sec(AT(P.cellT[j]) + 0.08, 0.12, E.p2Out);
      if (dp > 0) at(ctx, col + ' ' + labelText(s.done, L), x + 134, y + 36 - S.label * 0.62, { ...F('mono', L, S.label, 600), spacing: zh(L) ? 0 : 0.1 * 25 }, C.onInk, { alpha: dp, align: 'center' });
      if (ri === R - 1) rect(ctx, x, 382, 268 * ck.sec(AT(P.cellT[j]) + 0.1, 0.3, E.expoOut), 8, C.accent);
    }));
    // the accent cursor
    if (ck.t >= AT(0.55) && ck.t < AT(P.curOff) + 0.1) {
      let x = cx(0), y = 409;
      P.cellT.forEach((cu, j) => { const p = ck.sec(AT(cu) - 0.1, 0.1, E.p2Out); if (p > 0) { const c0 = Math.floor(j / R), r0 = j % R; const px = j ? cx(Math.floor((j - 1) / R)) : cx(0), py = j ? 409 + ((j - 1) % R) * 90 : 409; x = lerp(px, cx(c0), p); y = lerp(py, 409 + r0 * 90, p); } });
      frameRect(ctx, x, y, 268, 72, 5, C.accent, { alpha: 1 - ck.sec(AT(P.curOff), 0.1, E.none) });
    }
    const sx = COL(5 + 2 * s.cols.length);
    at(ctx, labelText(s.side.label, L), sx, 340, lf, C.dim, { alpha: tw(0.3, 0.2) });
    const bz = fitSize(ctx, String(s.side.big), (z) => F('num', L, z), 1824 - sx + 40, 400, 240);
    masked(ctx, String(s.side.big), sx - 6, 380, F('num', L, bz), C, { off: riseOff(tw(0.35, 0.6)), lh: 0.82, rich: false });
    const cp = tw(0.6, 0.3, E.p2Out);
    wrapLines(ctx, s.side.caption, F('text', L, zh(L) ? 28 : 27, 500), 268, L).slice(0, 2).forEach((ln, i) => at(ctx, ln, sx, 720 + i * 35, F('text', L, zh(L) ? 28 : 27, 500), C.ink, { lh: 1.3, alpha: cp, dy: 10 * (1 - cp) }));
    (s.strip || []).forEach((st, i) => {
      const x = i ? 972 : 96;
      rect(ctx, x, 800, 852 * tw(P.strip, 0.5), 4, C.ink);
      masked(ctx, st.text, x, 832, { ...F('display', L, S.body, 750), spacing: zh(L) ? 0 : -0.03 * 34 }, C, { off: riseOff(tw(P.stT[i], 0.5)), lh: 1, rich: false });
      const np = tw(P.ssT[i], 0.25, E.p2Out); at(ctx, st.note, x, 890, F('mono', L, S.label, 400), C.dim, { alpha: np, dy: 6 * (1 - np) });
    });
    walkFrame(ctx, ck, P.moves, boxes, C);
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 540]]; },
};

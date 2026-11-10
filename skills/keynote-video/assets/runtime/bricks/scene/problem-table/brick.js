// problem-table — the hook of a claim-plus-steps film: one or two headline lines at 164 px; once read, the headline
// shrinks to half about its first letter and becomes the heading of a table of what is broken; each row rises with
// its label (88 px) and value, an ink flag wipes over the value one per row; an ink frame steps over the rows while
// the page holds; a full-screen accent wipe closes it (it grows straight into the person's input half of the claim).
// From the plakat template's `problem` (assets/templates/plakat/scenes.js; plan, layout and tweens as there).
import { clock, E, F, SZ, COL, zh, masked, riseOff, at, rect, labelFont, labelText, fitSize, plain, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, rd, walkMoves, walkFrame, pad2 , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { lines: ['Agents write SQL.', 'Nobody reads it.'], rows: [{ label: 'DROP COLUMN', value: 'users.email' }, { label: 'LOCK HELD', value: '41 s' }, { label: 'REVIEWED BY', value: 'nobody' }] },
  zh: { lines: ['代理在写 SQL。', '没人读它。'], rows: [{ label: '删除列', value: 'users.email' }, { label: '锁住时长', value: '41 秒' }, { label: '审核人', value: '没有人' }] },
};
const tplan = (s, bpm, L) => {
  const k = 1, r = rd(L, k), lines = s.lines || [], rows = s.rows || [];
  const lineT = [0.5];
  let read = lineT[0] + 0.25 + r(lines[0]);
  if (lines[1]) { lineT.push(Math.max(1.25, halfBeatUp(read - 0.25))); read = Math.max(read, lineT[1] + 0.25) + r(lines[1]); }
  const row0 = halfBeatUp(Math.max(lineT[lineT.length - 1] + 0.75, read + 0.15)), shrink = row0 - 0.15, rowT = [];
  rows.forEach((x, i) => { const u = i ? Math.max(rowT[i - 1] + 0.5, halfBeatUp(read - 0.25)) : row0; rowT.push(u); read = Math.max(read, u + 0.25) + r(`${x.label} ${x.value}`); });
  const bars = Math.max(rowT[rowT.length - 1] + 0.5, halfBeatUp(read));
  const flagT = rows.map((_, i) => (i < rows.length - 1 ? rowT[i + 1] + 0.1 : bars));
  const settled = flagT[flagT.length - 1] + 0.3, out = s.wipe === false ? 0 : 0.45;
  const reads = [...lineT.map((u, i) => [u, [lines[i]]]), ...rowT.map((u, i) => [u, [rows[i].label, rows[i].value]])];
  const D = Math.max(needU(reads, settled, out, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  const wipe = s.wipe === false ? null : D - 0.45;
  return { lineT, shrink, rowT, flagT, settled, D, wipe, reads, moves: walkMoves(settled, wipe ?? D) };
};
export default {
  id: 'problem-table', kind: 'scene',
  fits: ['hook', 'problem'],
  surface: ['canvas'],
  beats: { min: 8, max: 24 },
  needs: { motions: ['walk-frame'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent', 'onInk'], type: ['display', 'text', 'mono'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 18 }, zh: { chars: 8 } } } },
    rows: { type: 'list', count: [1, 4], of: {
      label: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } },
      value: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 12 }, zh: { chars: 6 } } },
    } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent', 'onInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, wipe: true, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang), beats = Math.round(P.D * 2);
    return { beats, reads: P.reads.map(([u, xs]) => ({ beat: u * 2, text: xs.join(' '), lang: ctx.lang })),
      cues: [...P.lineT.map((u) => ({ beat: u * 2, kind: 'land' })), ...P.rowT.map((u) => ({ beat: u * 2, kind: 'tick' })), ...P.flagT.map((u) => ({ beat: u * 2, kind: 'stamp' })), ...(P.wipe != null ? [{ beat: P.wipe * 2, kind: 'turn' }] : [])],
      motion: 'headline lands, shrinks into the table heading; rows rise; ink flags; frame walks; accent wipe', settled: P.settled * 2, peakAt: P.lineT[0] * 2, shots: [{ beat: P.shrink * 2, what: 'the headline becomes the table heading' }] };
  },
  validate(s) { return (s.lines || []).length < 1 || (s.rows || []).length < 1 ? ['lines and rows need at least one each'] : []; },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, rows = s.rows || [];
    ground(ctx, C);
    // the headline group: lines at 164 px (fit to 1728, ≥ 120), shrinking to 0.5 about (96, 190) and up 32 px
    const sh = tw(P.shrink, 0.6, E.expoInOut), sc = 1 - 0.5 * sh;
    ctx.save(); ctx.translate(96, 190 - 32 * sh); ctx.scale(sc, sc); ctx.translate(-96, -190);
    (s.lines || []).forEach((l, i) => {
      const z = fitSize(ctx, plain(l), (v) => F('display', L, v), 1728, 164, 120);
      masked(ctx, l, 96, 186 + i * 186, F('display', L, z), C, { off: riseOff(tw(P.lineT[i], 0.7)), lh: 1 });
    });
    ctx.restore();
    const S = SZ(L), lf = labelFont(L), boxes = [];
    if (rows.length) rect(ctx, 96, 430, 1728 * tw(P.rowT[0], 0.45), 2, C.ink);
    rows.forEach((r, i) => {
      const y = 430 + i * 125, ru = P.rowT[i];
      boxes.push([84, y + 8, 1752, 110]);
      rect(ctx, 96, y + 125, 1728 * ck.sec(AT(ru) + 0.1, 0.45, E.expoOut), 2, C.ink);
      at(ctx, labelText(pad2(i + 1), L), 96, y + 48, lf, C.dim, { alpha: tw(ru, 0.2, E.p2Out) });
      const lz = fitSize(ctx, plain(r.label), (v) => F('display', L, v), COL(8) - 266, 88, 64);
      masked(ctx, r.label, 242, y + 16, F('display', L, lz), C, { off: riseOff(tw(ru, 0.5)), lh: 1 });
      const vf = { ...F('text', L, S.body === 40 ? 47 : 47, 400), spacing: zh(L) ? 0 : -0.02 * 47 };
      const flag = ck.sec(AT(P.flagT[i]), 0.3, E.expoOut);
      if (flag < 1) masked(ctx, r.value, 1146, y + 34, vf, C, { off: riseOff(ck.sec(AT(ru) + 0.18, 0.45)), lh: null, rich: false });
      if (flag > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(1118, y + 22, 706 * flag, 80); ctx.clip();
        rect(ctx, 1118, y + 22, 706, 80, C.ink); at(ctx, r.value, 1146, y + 34, vf, C.onInk);
        ctx.restore();
      }
    });
    walkFrame(ctx, ck, P.moves, boxes, C);
    const fields = [];
    if (P.wipe != null) { const w = tw(P.wipe, 0.45 * ck.k, E.expoInOut); if (w > 0) { rect(ctx, 0, 0, 1920 * w, 1080, C.accent); fields.push({ x: 0, y: 0, w: 1920 * w, h: 1080 }); } }
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L, { fields });
  },
  track(u, s, c, D) { return [[96, 190]]; },
};

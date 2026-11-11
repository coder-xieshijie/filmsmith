// doc-freeze — artefacts being written and frozen: two framed documents (a list of numbered lines; groups of id
// cells) under a page head, and a four-step rail beside them. A scan line passes down the documents (check), added
// cells pop in the accent, every cell fills ink bottom-up on a 25 ms stagger (confirm), the frames thicken 2 → 7 px
// and the stamps land at 1.3 → 1 scale (freeze), the hashes resolve, the rail hands off. An ink frame walks the rail
// while the page holds. From the plakat template's `document` (assets/templates/plakat/scenes.js).
import { clock, E, F, SZ, COL, SPAN, zh, masked, riseOff, sinkOff, at, rect, frameRect, labelFont, labelText, fitSize, plain, width, ground, tooth, paperTooth, drawChrome, needU, G, halfBeatUp, beatUp, rd, walkMoves, walkFrame, pad2, pageHead, wrapLines, drawPath, rollUp, lerp , barOf } from '../../prop/poster-chrome/kit.js';

const DEFAULT = {
  en: { num: '03', title: 'Freeze', caption: 'Plan and checks, frozen before the run.', stamp: 'FROZEN',
    left: { title: 'Plan', label: '0042_drop_email.sql', lines: [{ k: 'S1', text: 'add column email_v2' }, { k: 'S2', text: 'backfill in batches' }, { k: 'S3', text: 'swap reads' }, { k: 'S4', text: 'drop column', dim: true }] },
    right: { title: 'Checks', label: 'shadow replay · 6 runs', groups: [{ label: 'Lock checks', prefix: 'L', count: 4, added: 1 }, { label: 'Read checks', prefix: 'R', count: 3 }], note: '{added} check added by the probe' },
    hashes: ['sha 8f3a…c21', 'sha 77b0…e9d'], rail: { label: 'Hand-off', steps: ['Check the plan', 'Confirm the cells', 'Freeze both', 'Hand to the runner'], after: 'runner · 02:14' } },
  zh: { num: '03', title: '冻结', caption: '计划和检查在运行前冻结。', stamp: '已冻结',
    left: { title: '计划', label: '0042_drop_email.sql', lines: [{ k: 'S1', text: '新增 email_v2 列' }, { k: 'S2', text: '分批回填' }, { k: 'S3', text: '切换读取' }, { k: 'S4', text: '删除旧列', dim: true }] },
    right: { title: '检查', label: '影子回放 · 6 次', groups: [{ label: '锁检查', prefix: 'L', count: 4, added: 1 }, { label: '读取检查', prefix: 'R', count: 3 }], note: '探针新增 {added} 项检查' },
    hashes: ['sha 8f3a…c21', 'sha 77b0…e9d'], rail: { label: '交接', steps: ['检查计划', '确认格子', '冻结两份', '交给执行器'], after: '执行器 · 02:14' } },
};
const tplan = (s, bpm, L) => {
  const r = rd(L), groups = s.right.groups, BASE = [1.25, 2.5, 3.0, 3.75];
  let read = 0.25 + r(s.title); read = Math.max(read, 0.4) + r(s.left.title); read = Math.max(read, 0.5) + r(s.right.title);
  const step = [];
  s.rail.steps.forEach((st, j) => { let u = Math.max(j ? step[j - 1] + BASE[j] - BASE[j - 1] : BASE[0], halfBeatUp(read - 0.25)); if (j === 2) u = beatUp(u); step.push(u); read = Math.max(read, u + 0.25) + r(st); });
  const P = { cells: groups.map((_, i) => 0.6 + 0.35 * i), step, off: step[3] + 0.75, added: groups.map((g, i) => (g.added ? step[0] + 0.5 + 0.25 * i : null)), note: step[0] + 0.8 };
  P.reads = [[0, [s.title]], [0.15, [s.caption], G], [0.15, [s.left.title]], [0.25, [s.right.title]], ...s.rail.steps.map((st, j) => [step[j], [st]]), [step[2] + 0.05, [s.stamp], G]];
  P.settled = P.off;
  P.D = Math.max(needU(P.reads, P.settled, 0.125, bpm, L), s.minBeats ? s.minBeats / 2 : 0);
  P.moves = walkMoves(P.off + 0.1, P.D - 0.125);
  return P;
};
export default {
  id: 'doc-freeze', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 10, max: 20 },
  needs: { motions: ['walk-frame'], props: ['poster-chrome'], roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent', 'onInk'], type: ['display', 'text', 'mono'] },
  slots: {
    num: { type: 'number', tier: 'glance', limits: { en: { chars: 2 }, zh: { chars: 2 } } },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 10 }, zh: { chars: 5 } } },
    caption: { type: 'text', tier: 'glance', limits: { en: { words: 8, chars: 48 }, zh: { chars: 18 } } },
    stamp: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 4 } } },
    left: { type: 'group', of: { title: { type: 'text', tier: 'primary' }, label: { type: 'code', tier: 'glance' }, lines: { type: 'list', count: [1, 6] } } },
    right: { type: 'group', of: { title: { type: 'text', tier: 'primary' }, label: { type: 'text', tier: 'glance' }, groups: { type: 'list', count: [1, 2] }, note: { type: 'text', tier: 'glance' } } },
    hashes: { type: 'list', count: [0, 2], of: { type: 'code', tier: 'glance', limits: { en: { chars: 30 }, zh: { chars: 30 } } } },
    rail: { type: 'group', of: { label: { type: 'text', tier: 'glance' }, steps: { type: 'list', count: [4, 4] }, after: { type: 'text', tier: 'glance' } } },
  },
  roles: ['paper', 'ink', 'dim', 'grid', 'accent', 'onAccent', 'onInk'],
  defaults: (ctx = {}) => ({ ...DEFAULT[zh(ctx.lang) ? 'zh' : 'en'], seed: 1, paper: 0.5, chrome: null }),
  plan(s, ctx) {
    const P = tplan(s, ctx.bpm, ctx.lang);
    return { beats: Math.round(P.D * 2), reads: [s.title, s.left.title, s.right.title, ...s.rail.steps].map((text) => ({ text, lang: ctx.lang })),
      cues: [{ beat: 0, kind: 'land' }, { beat: P.step[0] * 2, kind: 'turn' }, { beat: P.step[1] * 2, kind: 'tick' }, { beat: (P.step[2] + 0.05) * 2, kind: 'stamp' }, { beat: P.step[3] * 2, kind: 'tick' }],
      motion: 'documents clip in, cells pop, a scan passes, cells fill ink, frames thicken, stamps land, hashes resolve', settled: P.settled * 2, peakAt: P.step[2] * 2 };
  },
  async prepare(s, c) { return { P: tplan(s, c.bpm, c.lang), T: paperTooth(s.seed || 1, s.paper ?? 0.5) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, P = D.P, ck = clock(u, c.bpm), { tw, at: AT } = ck, S = SZ(L), lf = labelFont(L), mf = F('mono', L, S.label, 500);
    ground(ctx, C);
    ctx.save(); rollUp(ctx, ck, P.D);
    pageHead(ctx, s, C, L, ck);
    const thick = 2 + 5 * tw(P.step[2], 0.25), stampP = (i) => ck.sec(AT(P.step[2] + 0.05) + 0.08 * i, 0.2, E.expoOut);
    const doc = (x, w, U, title, label, i) => {
      const p = tw(U, 0.5, E.expoInOut);
      ctx.save(); ctx.beginPath(); ctx.rect(x - 4, 340 - 4, w + 8, 508 * p); ctx.clip();
      frameRect(ctx, x, 340, w, 500, thick, C.ink);
      at(ctx, title, x + 28, 340 + 38, { ...F('display', L, S.body, 800), spacing: zh(L) ? 0 : -0.035 * 34 }, C.ink);
      at(ctx, labelText(label, L), x + 30, 340 + 94, lf, C.dim);
      rect(ctx, x + 28, 340 + 140, w - 60, 2, C.ink);
      const sp = stampP(i); if (sp > 0) { ctx.save(); const cx = x + w - 28 - 78, cy = 340 + 48, sc = 1.3 - 0.3 * sp; ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha = sp; rect(ctx, -78, -22, 156, 44, C.ink); at(ctx, labelText(s.stamp, L), 0, -22 + 22 - S.label * 0.62, { ...F('mono', L, S.label, 600), spacing: zh(L) ? 0 : 0.08 * 25 }, C.onInk, { align: 'center' }); ctx.restore(); }
      ctx.restore();
    };
    doc(96, 560, 0.15, s.left.title, s.left.label, 0); doc(680, 706, 0.25, s.right.title, s.right.label, 1);
    let y = 340 + 170, dimSeen = false;
    s.left.lines.forEach((ln, i) => { if (ln.dim && !dimSeen) { y += 20; dimSeen = true; } const p = ck.sec(AT(0.45) + 0.09 * i, 0.2, E.p2Out); at(ctx, (ln.k || '—') + '  ' + ln.text, 126 - 12 * (1 - p), y, mf, ln.dim ? C.dim : C.ink, { alpha: p }); y += 50; });
    const fillStart = AT(P.step[1]); let n = 0;
    s.right.groups.forEach((g, gi) => {
      at(ctx, labelText(g.label, L), 710, 340 + 166 + 130 * gi, lf, C.dim, { alpha: tw(P.cells[gi], 0.2) });
      for (let j = 0; j < g.count + (g.added || 0); j++) {
        const add = j >= g.count, x = 680 + 28 + 90 * j, cy = 340 + 204 + 130 * gi, id = (g.prefix || '') + pad2(j + 1);
        const p = add ? ck.sec(AT(P.added[gi]) + 0.06 * (j - g.count), 0.14, E.back(3)) : ck.sec(AT(P.cells[gi]) + 0.06 * j, 0.16, E.p2Out);
        if (p <= 0) continue;
        ctx.save(); ctx.globalAlpha = Math.min(1, p); if (add) { ctx.translate(x + 40, cy + 28); ctx.scale(1.4 - 0.4 * p, 1.4 - 0.4 * p); ctx.translate(-x - 40, -cy - 28); }
        if (add) rect(ctx, x, cy, 80, 56, C.accent); frameRect(ctx, x, cy, 80, 56, 2, add ? C.accent : C.ink);
        at(ctx, id, x + 40, cy + 28 - S.label * 0.62, mf, add ? C.onAccent : C.ink, { align: 'center' });
        const fp = ck.sec(fillStart + 0.025 * n, 0.18, E.p2Out);
        if (fp > 0) { ctx.beginPath(); ctx.rect(x, cy + 56 * (1 - fp), 80, 56 * fp); ctx.clip(); rect(ctx, x, cy, 80, 56, C.ink); at(ctx, id, x + 40, cy + 28 - S.label * 0.62, mf, C.onInk, { align: 'center' }); }
        ctx.restore(); n++;
      }
    });
    const added = s.right.groups.reduce((a, g) => a + (g.added || 0), 0), np = tw(P.note, 0.25, E.p2Out);
    if (s.right.note && np > 0) { const ny = 340 + 166 + 130 * s.right.groups.length - 2; rect(ctx, 710 - 12 * (1 - np), ny + 8, 14, 14, C.accent, np); at(ctx, s.right.note.replaceAll('{added}', added), 740 - 12 * (1 - np), ny, mf, C.ink, { alpha: np }); }
    (s.hashes || []).forEach((h, i) => { const p = ck.sec(AT(P.step[2] + 0.2) + 0.1 * i, 0.25, E.p2Out); at(ctx, h, i ? 680 : 96, 858 + 8 * (1 - p), mf, C.dim, { alpha: p }); });
    // the scan line: 1 u down the documents from the first rail step
    const sc = ck.sec(AT(P.step[0]), 1.0 * ck.k, E.none); if (sc > 0 && ck.t < AT(P.step[0] + 1.0) + 0.08) rect(ctx, 80, 340 + 496 * sc, 1322, 4, C.accent, 1 - ck.sec(AT(P.step[0] + 1.0), 0.08, E.none));
    // the rail
    at(ctx, labelText(s.rail.label, L), 1410, 340, lf, C.dim, { alpha: tw(0.3, 0.25) });
    const boxes = [];
    s.rail.steps.forEach((st, k) => {
      const p = ck.sec(AT(0.4) + 0.07 * k, 0.25, E.p2Out), x = 1410 + 16 * (1 - p), y0 = 392 + 110 * k, last = k === s.rail.steps.length - 1;
      boxes.push([1400, y0 - 10, 434, (last ? 118 : 100) + 20]);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p;
      rect(ctx, x, y0, 414, 2, C.ink);
      const on = ck.t >= AT(P.step[k]) && (k === s.rail.steps.length - 1 ? ck.t < AT(P.off) : ck.t < AT(P.step[k + 1]));
      if (on) rect(ctx, x, y0 + 26, 28, 28, C.accent); else frameRect(ctx, x, y0 + 26, 28, 28, 2, C.ink);
      wrapLines(ctx, st, { ...F('text', L, S.body, 650), spacing: zh(L) ? 0 : -0.02 * 34 }, 366, L).slice(0, 2).forEach((ln, i) => at(ctx, ln, x + 48, y0 + 20 + i * S.body * 1.1, { ...F('text', L, S.body, 650), spacing: zh(L) ? 0 : -0.02 * 34 }, C.ink, { lh: 1.1 }));
      if (last && s.rail.after) at(ctx, s.rail.after, x + 48, y0 + 66, mf, C.dim);
      ctx.restore();
    });
    walkFrame(ctx, ck, P.moves, boxes, C);
    ctx.restore();
    tooth(ctx, D.T);
    drawChrome(ctx, barOf(s.chrome, u), C, L);
  },
  track() { return [[960, 590]]; },
};

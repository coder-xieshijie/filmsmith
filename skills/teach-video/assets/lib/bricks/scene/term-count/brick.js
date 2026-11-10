// term-count — a question asked in a terminal is answered by counting: the window rises, the question types after the
// prompt sign, the sources pop in as pills, then the window grows and each answer counts up, the first filling a field of
// small cells one column at a time (one cell, one item), the second filling a bar with "近" / "nearly" before it; each
// count lands with a 1.07× hop. The window stays for the next scene (term-wall shrinks it into a wall).
// From the terminal-ledger kit as the approved film uses it (the source film
// segments/abc.js 0–9.7 s; the kit's demo-a1 with illustrative email data): F.term, F.termType, pills, F.roll over the
// cell field and the bar, the chapter label and the dashed note. Times are seconds from the scene's start (the
// narration's anchors), converted at the film's bpm.
import { W, drawTerm, drawTyped, drawPill, say, figures, fmtInt, widthOf, drawChapter, drawTag, tw, kf, E, lerp, clamp, rrect, sz } from '../../look/paper-ledger/kit.js';
import { readTime } from '../../lang.js';

const DEFAULT = {
  en: { chapter: 'A week of email', title: 'Inbox · this week', question: 'How many emails came in this week?', chips: { label: 'Mailboxes', items: ['Work', 'Personal', 'Newsletters'] },
    stats: [{ label: 'Emails', value: 1200, note: 'One cell, one email', show: 'grid' }, { label: 'Minutes to read them all', value: 2760, pre: 'nearly', show: 'bar' }], tag: 'Illustrative terminal and data' },
  zh: { chapter: '一周的邮件', title: '收件箱 · 本周', question: '这一周收到多少封邮件？', chips: { label: '邮箱', items: ['工作邮箱', '个人邮箱', '订阅邮箱'] },
    stats: [{ label: '邮件', value: 1200, note: '每格一封邮件', show: 'grid' }, { label: '全部读完要（分钟）', value: 2760, pre: '近', show: 'bar' }], tag: '终端为示意 · 数字为示意数据' },
};
// the approved film's times, seconds from the scene's start
const AT = { chapter: 0.25, enter: 0.12, type: 0.5, dt: 0.055, chips: 2.15, chipStep: 0.6, grow: 3.95, stats: [[4.15, 4.85, 6.1], [6.59, 7.12, 8.3]], tag: 4.4, end: 9.7 };
const BOX = [360, 130, 1200, 590], COLS = 103, ROWS = 14;
const lim = (en, zh, w) => ({ en: { words: w, chars: en }, zh: { chars: zh } });
const atOf = (s) => ({ ...AT, ...(s.at || {}) });

// what the window holds at t (the typed question, the pills, the counts): also drawn by wall-ledger as the window empties
export const countInner = (w, C, L, s, t, A = atOf(s)) => {
  const n = s.chips?.items?.length ? 1 : 0;
  drawTyped(w, C, L, '› ', s.question, 36, 54, t, A.type, A.dt, { size: 40, lh: 64, caret: A.type + [...s.question].length * A.dt + 0.3 });
  if (n) {
    const la = tw(t, A.chips - 0.05, 0.3, E.p1o);
    say(w, s.chips.label, 36, 142, L, 28, C.dim, { lh: 40, alpha: la });
    let x = 36 + Math.max(110, widthOf(w, s.chips.label, L, 28) + 24);
    s.chips.items.forEach((it, i) => { const t0 = A.chips + 0.17 + i * A.chipStep, p = tw(t, t0, 0.18, E.back(1.6)); x += drawPill(w, C, L, it, x, 136, { alpha: clamp(tw(t, t0, 0.18, E.none) * 2), scale: lerp(0.75, 1, p) }) + 16; });
  }
  s.stats.slice(0, 2).forEach((st, k) => {
    const [show, c0, c1] = A.stats[k], x0 = k === 0 ? 36 : 640, sa = tw(t, show, 0.3, E.p1o);
    if (sa <= 0) return;
    say(w, st.label, x0, 212, L, 28, C.dim, { lh: 40, alpha: sa });
    const roll = E.sine(clamp((t - c0) / (c1 - c0))), hop = t < c1 + 0.18 ? lerp(1, 1.07, tw(t, c1 + 0.02, 0.16, E.p3o)) : lerp(1.07, 1, tw(t, c1 + 0.18, 0.16, E.p2o));
    let v;
    if (st.show === 'grid') {
      const cols = Math.ceil(st.value / ROWS), on = Math.round(roll * cols); v = Math.min(st.value, on * ROWS);
      w.save(); w.globalAlpha *= sa;
      for (let ci = 0; ci < COLS; ci++) for (let r = 0; r < ROWS; r++) { w.fillStyle = ci < on && ci * ROWS + r < st.value ? C.cellOn : C.cell; w.fillRect(x0 + ci * 10, 418 + r * 10, 7, 7); }
      w.restore();
      if (st.note) say(w, st.note, x0, 374, L, 24, C.dim, { lh: 36, alpha: sa });
    } else {
      v = Math.round((roll * st.value) / 20) * 20;
      w.save(); w.globalAlpha *= sa; rrect(w, x0, 352, 500, 12, 6); w.fillStyle = C.grey; w.fill(); w.save(); w.clip(); w.fillStyle = C.ink; w.fillRect(x0, 352, 500 * roll, 12); w.restore(); w.restore();
    }
    let nx = x0;
    if (st.pre) { const pa = tw(t, c0 - 0.13, 0.18, E.p2o); say(w, st.pre, x0, 270, L, 48, C.ink, { lh: 60, alpha: pa, blur: (1 - pa) * 6 }); nx = x0 + widthOf(w, st.pre, L, 48) + 12; }
    w.save(); w.translate(nx, 256 + 48); w.scale(hop, hop); w.translate(-nx, -(256 + 48));
    figures(w, fmtInt(t < c0 ? 0 : v), nx, 256, L, 80, C.ink, { alpha: sa });
    w.restore();
  });
};

export default {
  id: 'term-count', kind: 'scene',
  fits: ['hook', 'problem'],
  surface: ['canvas'],
  beats: { min: 10, max: 40 },
  needs: { motions: [], props: ['paper-term', 'paper-frame'], roles: ['ground', 'panel', 'ink', 'dim', 'line', 'pill', 'cell', 'cellOn', 'grey', 'chapInk', 'chapRule'], type: ['text', 'mono'] },
  slots: {
    chapter: { type: 'text', tier: 'glance', limits: lim(28, 12, 5) },
    title: { type: 'text', tier: 'glance', limits: lim(28, 14, 5) },
    question: { type: 'text', tier: 'primary', limits: lim(40, 18, 8) },
    chips: { type: 'object', optional: true },
    stats: { type: 'list', count: [1, 2], of: { label: { type: 'text', tier: 'glance', limits: lim(26, 12, 5) }, value: { type: 'number', limits: lim(6, 6, 1) }, note: { type: 'text', tier: 'glance', optional: true, limits: lim(24, 10, 5) }, pre: { type: 'text', tier: 'glance', optional: true, limits: lim(8, 2, 1) } } },
    tag: { type: 'text', tier: 'glance', limits: lim(40, 18, 7) },
  },
  roles: ['ground', 'panel', 'ink', 'dim', 'line', 'pill', 'cell', 'cellOn', 'grey', 'chapInk', 'chapRule'],
  defaults: (ctx = {}) => JSON.parse(JSON.stringify(DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'])),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, A = atOf(s), L = ctx.lang;
    // long enough to read the question, and every count landed and held 0.6 s
    const need = Math.max(A.end, A.type + readTime(s.question, L) + 0.5, ...A.stats.slice(0, s.stats.length).map((x) => x[2] + 0.6 + 0.34));
    return { beats: clamp(Math.ceil(need / B - 1e-9), this.beats.min, this.beats.max), reads: [{ text: s.question, lang: L }, ...s.stats.map((x) => ({ text: x.label, lang: L, tier: 'glance' }))],
      cues: [...(s.chips?.items || []).map((_, i) => ({ beat: (A.chips + 0.17 + i * A.chipStep) / B, kind: 'tick' })), ...A.stats.slice(0, s.stats.length).map((x) => ({ beat: x[2] / B, kind: 'tick' }))],
      motion: null, settled: A.stats[s.stats.length - 1][2] / B, peakAt: A.stats[0][2] / B, pause: 0, lead: 0 };
  },
  validate(s) { return s.stats?.length ? [] : ['stats: one or two counts']; },
  prepare(s, c) { return { B: 60 / c.bpm, A: atOf(s) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, A = D.A, t = u * D.B;
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, 1080);
    drawChapter(ctx, C, L, { text: s.chapter, at: A.chapter }, t);
    const n = s.chips?.items?.length ? 1 : 0;
    const h = kf(t, 140, [[A.chips - 0.2, 0.3, n ? 215 : 140, E.p2o], [A.grow, 0.4, BOX[3], E.p2o]]);
    const a = tw(t, A.enter, 0.6, E.p3o), y = lerp(BOX[1] + 24, BOX[1], a);
    drawTerm(ctx, C, L, [BOX[0], y, BOX[2], h], { title: s.title, alpha: a }, (w) => countInner(w, C, L, s, t, A));
    drawTag(ctx, C, L, s.tag, BOX[0], 752, tw(t, A.tag, 0.4, E.p1o) * (1 - tw(t, A.end - 0.25, 0.2, E.p1i)));
  },
  track(u, s, c, D) { const t = u * D.B; return [[BOX[0], lerp(BOX[1] + 24, BOX[1], tw(t, D.A.enter, 0.6, E.p3o))]]; },
  blur: () => false,
};

// qa-pick — a chapter page of at most two questions: under the page header a window rises, each question types at
// reading pace with its id, its options pop in a quarter beat apart once it has been read, and one option is picked
// on a beat (it fills ink and pushes in to 1.15, the ones after it make room, the others step back to 45 %).
// From the phosphor template: film.js BUILD.qa, events.js TIMING.qa (window 0.45 s; questions at ≤ 48 cps; options
// every 0.25 beat; the pick on the beat once the options are read), index.html .q .qt .chips .chip.on. Chinese:
// questions and options as written at 40 px; ids stay Latin; the header and note as given.
import { E, F, W, at, rr, rect, win, ground, post, hud, hudAt, palOf, reader, half, onBeat, paceCps, SEEN, rgba, zh, clamp, graphemes, typedAt, pageHead } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { head: { title: ['SET', 'THE POLICY'], note: '// reads the lockfile first' }, window: ['grainlock init', 'billing-api'], questions: [{ id: 'Q1', q: 'Maintainer changes?', options: ['Block', 'Flag'], pick: 0 }, { id: 'Q2', q: 'Install scripts?', options: ['Allow', 'Deny'], pick: 1 }] },
  zh: { head: { title: ['设定', '策略'], note: '// 先读锁文件' }, window: ['grainlock init', 'billing-api'], questions: [{ id: 'Q1', q: '维护者变了怎么办？', options: ['拦下', '标记'], pick: 0 }, { id: 'Q2', q: '允许安装脚本吗？', options: ['允许', '拒绝'], pick: 1 }] },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), T = { win: rd.move(0, 0.45) };
  (s.window || []).forEach((x) => rd.glance(T.win + SEEN, x));
  let t = half(0.35 * B, B);
  T.q = (s.questions || []).slice(0, 2).map((q) => {
    const a = t, cps = paceCps(q.q, 48, B, L), end = a + 0.05 + graphemes(q.q).length / cps;
    rd.move(a, end - a); const qRead = rd.typed(a + 0.05, q.q, cps);
    const o0 = half(Math.max(end + 0.25 * B, qRead - SEEN), B), opts = (q.options || []).map((_, k) => rd.move(o0 + k * 0.25 * B, 0.25));
    const oRead = rd.primary(o0 + SEEN, q.options);
    const pick = onBeat(Math.max(opts[opts.length - 1] + 0.25 + 0.25 * B, oRead - 1.25 * B), B);
    rd.move(pick, 0.5 * B); t = half(Math.max(pick + 0.5 * B, oRead), B);
    return { t: a, cps, opts, pick };
  });
  if (T.q.length) rd.at(T.q[T.q.length - 1].pick + 0.5 * B);
  T.done = rd.done; T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};

export default {
  id: 'qa-pick', kind: 'scene',
  fits: ['demo', 'turn'],
  surface: ['canvas'],
  beats: { min: 6, max: 20 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line'], type: ['display', 'text', 'mono'] },
  slots: {
    head: { type: 'group', of: { title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } }, note: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } } } },
    window: { type: 'list', count: [1, 2], of: { type: 'code', tier: 'glance', limits: { en: { chars: 24 }, zh: { chars: 24 } } } },
    questions: { type: 'list', count: [1, 2], of: { id: { type: 'code', tier: 'glance', limits: { en: { chars: 3 }, zh: { chars: 3 } } }, q: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 34 }, zh: { chars: 14 } } }, options: { type: 'list', count: [2, 3], of: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 5 } } } }, pick: { type: 'number' } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], headEnter: false, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: (s.questions || []).flatMap((q) => [{ text: q.q, lang: ctx.lang }, { text: q.options.join(' '), lang: ctx.lang }]),
      cues: T.q.flatMap((q) => [{ beat: b(q.t), kind: 'accent' }, ...q.opts.map((x) => ({ beat: b(x), kind: 'accent' })), { beat: b(q.pick), kind: 'land' }]),
      motion: 'the window rises; each question types; its options pop; one is picked on the beat', settled: b(T.done), shots: [{ beat: 0, kind: 'page' }],
    };
  },
  prepare(s, c) { const L = c.lang || 'en', B = 60 / c.bpm; return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0) }; },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, qs = (s.questions || []).slice(0, 2);
    ground(ctx, P, t, { bpm: c.bpm });
    pageHead(ctx, P, L, s.head, t, B, { enter: s.headEnter, screen: s.screen });
    const e = E.p3Out(t / 0.45), H = qs.length > 1 ? 470 : 270;
    ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, 30 * (1 - e));
    win(ctx, P, L, 110, 262, 1700, H, (s.window || [])[0], (s.window || [])[1]);
    const fq = F('text', L, 40, 400), fid = F('mono', L, 40, 500), fo = F('text', L, 40, 400);
    qs.forEach((q, i) => {
      const tq = T.q[i]; if (!tq || t < tq.t) return;
      const y = 262 + 96 + i * 200, x = 150, a = E.p3Out((t - tq.t) / 0.25), id = q.id || 'Q' + (i + 1);
      at(ctx, id, x - 16 * (1 - a), y, fid, P.dim, { alpha: a });
      at(ctx, typedAt(q.q, t, tq.t + 0.05, tq.cps), x + W(ctx, id, fid) + 14 - 16 * (1 - a), y, fq, P.ink, { alpha: a });
      const k = q.pick ?? 0, picked = t >= tq.pick, gp = picked ? E.back(1.6)(clamp((t - tq.pick) / (0.5 * B))) : 0;
      let ox = x + 84; const oy = y + 48 + 22;
      const ws = q.options.map((o, j) => W(ctx, `${'ABC'[j]}  ${o}`, fo) + 44);
      q.options.forEach((o, j) => {
        const t0 = tq.opts[j]; if (t < t0) { ox += ws[j] + 20; return; }
        const ea = clamp((t - t0) / 0.25), sc = (0.92 + 0.08 * E.back(2)(ea)) * (j === k ? 1 + 0.15 * gp : 1), dx = j > k ? ws[k] * 0.15 * gp : 0;
        const al = Math.min(1, ea * 2) * (picked && j !== k ? 1 - 0.55 * clamp((t - tq.pick) / 0.3) : 1), h = 40 + 16 + 4;
        ctx.save(); ctx.globalAlpha *= al; ctx.translate(ox + dx, oy + h / 2 + 12 * (1 - ea)); ctx.scale(sc, sc); ctx.translate(-(ox + dx), -(oy + h / 2));
        rr(ctx, ox + dx, oy, ws[j], h, 6); const on = picked && j === k;
        if (on) { ctx.fillStyle = P.ink; ctx.fill(); } ctx.strokeStyle = on ? P.ink : P.line; ctx.lineWidth = 2; ctx.stroke();
        at(ctx, `${'ABC'[j]}  ${o}`, ox + dx + 22, oy + 8, fo, on ? P.ground : P.muted);
        ctx.restore();
        ox += ws[j] + 20;
      });
    });
    ctx.restore();
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

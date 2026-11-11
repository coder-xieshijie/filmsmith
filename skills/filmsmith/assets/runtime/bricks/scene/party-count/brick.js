// party-count — a chapter page that counts: two parties in cards (left, and right outlined in the accent), the shared
// ruler between them in a dashed card, then a big counter steps 0 → N one a half beat with the last step on a beat,
// "/ N label" beside it, the camera pushing in 1.1 on the count, a meta column, and a ticker repeating the counted
// items with their verdict along the bottom.
// From the phosphor template: film.js BUILD.compare, events.js TIMING.compare (left 0, right 0.32, middle 0.96, links
// 1.4 beats; counter as the cards are read; steps every half beat, the last on a beat; push 1.1 over 0.6 beat; ticker
// 1.2 beats after the counter at 290 px/s), index.html .vcard .bigN .bigOf .bigMeta .ticker. Chinese: card names at
// 50 px, labels untracked at 28 px; the counter's digits never flicker through other digits.
import { E, F, W, at, rr, rect, display, ground, post, hud, hudAt, palOf, reader, half, SEEN, rgba, zh, clamp, fit, label, pageHead } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { head: { title: ['CHECK', 'EVERY PR'], note: '// two machines, one answer' }, left: { label: 'LAPTOP', name: 'grainlock', desc: 'hash 7f3a…', items: ['312 packages', 'locked'] }, right: { label: 'CI', name: 'grainlock', desc: 'hash 7f3a…', items: ['312 packages', 'verified'] }, middle: { label: 'SHARED', name: 'lockfile', desc: 'same hash' }, counter: { items: ['auth', 'cart', 'mail', 'queue', 'db', 'cache'], label: 'checks passed', verdict: 'PASS' }, meta: ['0 drift', 'signed by you'] },
  zh: { head: { title: ['检查', '每个 PR'], note: '// 两台机器，一个答案' }, left: { label: '笔记本', name: 'grainlock', desc: 'hash 7f3a…', items: ['312 个包', '已锁定'] }, right: { label: 'CI', name: 'grainlock', desc: 'hash 7f3a…', items: ['312 个包', '已验证'] }, middle: { label: '共用', name: '锁文件', desc: '同一个哈希' }, counter: { items: ['auth', 'cart', 'mail', 'queue', 'db', 'cache'], label: '项检查通过', verdict: 'PASS' }, meta: ['零漂移', '由你签字'] },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), Lc = s.left || {}, Rc = s.right || {}, M = s.middle || {}, T = { left: 0, right: 0.32 * B, middle: 0.96 * B, links: 1.4 * B, pulse: 2.4 * B };
  rd.move(T.left, 0.4); rd.move(T.right, 0.4); rd.move(T.middle, 0.35); rd.move(T.links, 0.2);
  [[T.left, Lc], [T.right, Rc], [T.middle, M]].forEach(([t, c]) => { rd.glance(t + SEEN, c.label); rd.glance(t + SEEN, c.desc); });
  rd.primary(T.left + SEEN, Lc.name); rd.primary(T.right + SEEN, Rc.name);
  const cards = Math.max(T.middle + SEEN, rd.primary(T.middle + SEEN, M.name)), n = (s.counter?.items || []).length;
  let c0 = half(Math.max(2 * B, cards - 1.5 * B), B); const lastAt = c0 + 0.5 * B * n;
  if (Math.abs(lastAt / B - Math.round(lastAt / B)) > 1e-6) c0 += 0.5 * B;
  T.counter = rd.move(c0, 0.3); T.steps = [...Array(n)].map((_, i) => T.counter + 0.5 * B + i * 0.5 * B);
  const last = n ? T.steps[n - 1] : T.counter; T.last = last; rd.at(last + 0.5 * B);
  if (n) rd.move(last, 0.6 * B);
  rd.primary(T.counter + SEEN, [String(n), s.counter?.label]);
  T.ticker = rd.move(T.counter + 1.2 * B, 0.3);
  T.meta = rd.move(half(Math.max(last + 0.5 * B, rd.done - 1.5 * B), B), 0.35);
  (s.meta || []).forEach((m) => rd.primary(T.meta + SEEN, m));
  T.done = rd.done; T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};

export default {
  id: 'party-count', kind: 'scene',
  fits: ['proof', 'demo'],
  surface: ['canvas'],
  beats: { min: 6, max: 20 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'titleHi', 'titleLo'], type: ['display', 'text', 'mono'] },
  slots: {
    head: { type: 'group', of: { title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } }, note: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } } } },
    left: { type: 'group', of: { label: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, desc: { type: 'code', tier: 'glance', limits: { en: { words: 4, chars: 26 }, zh: { chars: 12 } } }, items: { type: 'list', count: [0, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 9 } } } } } },
    right: { type: 'group', of: { label: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 14 }, zh: { chars: 6 } } }, desc: { type: 'code', tier: 'glance', limits: { en: { words: 4, chars: 26 }, zh: { chars: 12 } } }, items: { type: 'list', count: [0, 3], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 9 } } } } } },
    middle: { type: 'group', of: { label: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } }, name: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 5 } } }, desc: { type: 'code', tier: 'glance', limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } } },
    counter: { type: 'group', of: { items: { type: 'list', count: [1, 16], of: { type: 'code', tier: 'glance', limits: { en: { chars: 12 }, zh: { chars: 12 } } } }, label: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 22 }, zh: { chars: 7 } } }, verdict: { type: 'code', tier: 'glance', limits: { en: { chars: 6 }, zh: { chars: 6 } } } } },
    meta: { type: 'list', count: [0, 3], optional: true, of: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 28 }, zh: { chars: 10 } } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], headEnter: false, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [{ text: `${(s.counter?.items || []).length} ${s.counter?.label || ''}`, lang: ctx.lang }, ...(s.meta || []).map((text) => ({ text, lang: ctx.lang }))],
      cues: [{ beat: b(T.middle), kind: 'land' }, ...T.steps.map((x) => ({ beat: b(x), kind: 'accent' })), { beat: b(T.last), kind: 'stamp' }],
      motion: 'two parties and the shared ruler land; the counter steps to N; the camera pushes in on the count; the ticker runs', settled: b(T.meta) + 0.5, peakAt: b(T.last),
      shots: [{ beat: 0, kind: 'parties' }, { beat: b(T.last), kind: 'push-in' }],
    };
  },
  prepare(s, c) { const L = c.lang || 'en', B = 60 / c.bpm; return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0) }; },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, items = s.counter?.items || [], N = items.length;
    ground(ctx, P, t, { bpm: c.bpm });
    const fN = { ...F('display', L, 240, 800), spacing: -0.045 * 240 }, nW = W(ctx, String(N), fN);
    const pk = N && t >= T.last ? E.p3Out((t - T.last) / (0.6 * B)) : 0, sc = 1 + 0.1 * pk, ox = 108 + nW / 2, oy = 800;
    ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, sc); ctx.translate(-ox, -oy);
    pageHead(ctx, P, L, s.head, t, B, { enter: s.headEnter, screen: s.screen, alpha: 1 - pk });
    const flab = { ...F('mono', L, zh(L) ? 28 : 25, 400), spacing: zh(L) ? 0 : 0.2 * 25 }, fnm = { ...F('text', L, 50, 800), spacing: zh(L) ? 0 : -0.03 * 50 }, fsm = F('mono', L, zh(L) ? 28 : 25, 400), fli = F('text', L, zh(L) ? 28 : 25, 400);
    const card = (cd, x, w, t0, from, opt = {}) => {
      if (t < t0) return; const e = E.p3Out((t - t0) / (opt.pop ? 0.35 : 0.4)), y = opt.top ?? 250, h = opt.h ?? 380;
      ctx.save(); ctx.globalAlpha *= Math.min(1, e * 1.5); ctx.translate(from * 40 * (1 - e), 0);
      if (opt.pop) { const k = 0.8 + 0.2 * E.back(2)(clamp((t - t0) / 0.35)); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(x + w / 2), -(y + h / 2)); }
      if (opt.glow) { const pu = t >= T.pulse ? 0.22 + 0.23 * (0.5 + 0.5 * Math.sin((t - T.pulse) * Math.PI * 2 / (2 * B))) : 0.22; ctx.shadowColor = rgba(P.accent, pu); ctx.shadowBlur = 40; }
      rr(ctx, x, y, w, h, 10); ctx.fillStyle = rgba(P.panel, 0.9); ctx.fill(); ctx.shadowBlur = 0; if (opt.dash) ctx.setLineDash([8, 6]); ctx.strokeStyle = opt.glow ? P.accent : P.line; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      const cx = opt.center ? x + w / 2 : x + 32, al = opt.center ? 'center' : 'left';
      at(ctx, label(cd.label, L), cx, y + 30, flab, opt.glow ? P.accent : P.dim, { align: al });
      at(ctx, cd.name, cx, y + 30 + 25 + 14, fit(ctx, cd.name, fnm, w - 64, 44), P.ink, { align: al });
      at(ctx, cd.desc || '', cx, y + 30 + 25 + 14 + 60 + 10, fsm, opt.center ? P.accent : P.muted, { align: al });
      (cd.items || []).slice(0, 3).forEach((it, i) => { const yy = y + 190 + 26 + i * 37; at(ctx, '▸ ', x + 32, yy, fli, P.dim); at(ctx, it, x + 32 + W(ctx, '▸ ', fli), yy, fli, P.ink); });
      ctx.restore();
    };
    card(s.left || {}, 110, 620, T.left, -1);
    card(s.right || {}, 1190, 620, T.right, 1, { glow: true });
    card(s.middle || {}, 770, 380, T.middle, 0, { top: 330, h: 220, dash: true, center: true, pop: true });
    if (t >= T.links) { const e = clamp((t - T.links) / 0.2); ctx.save(); ctx.globalAlpha *= e; ctx.setLineDash([6, 6]); ctx.strokeStyle = P.muted; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(730, 440); ctx.lineTo(770, 440); ctx.moveTo(1150, 440); ctx.lineTo(1190, 440); ctx.stroke(); ctx.restore(); }
    // the counter: steps every half beat; digits never flicker through other digits
    if (t >= T.counter) {
      const e = E.p3Out((t - T.counter) / 0.3), k = T.steps.filter((x) => t >= x).length, bump = N && t >= T.last ? 1.08 - 0.08 * clamp((t - T.last) / 0.25) : 1;
      ctx.save(); ctx.translate(108 + nW / 2, 660 + 120 + 30 * (1 - e)); ctx.scale(bump, bump); ctx.translate(-(108 + nW / 2), -(660 + 120));
      display(ctx, String(k), 108, 660, fN, P, { screen: s.screen, alpha: e }); ctx.restore();
      const fo = { ...F('display', L, 84, 800), spacing: zh(L) ? 0 : -0.045 * 84 }, eo = E.p3Out((t - T.counter - 0.1) / 0.3);
      display(ctx, `/ ${N} ${s.counter?.label || ''}`, 108 + nW + 24 - 20 * (1 - eo), 780, fo, P, { screen: s.screen, alpha: eo });
    }
    if ((s.meta || []).length && t >= T.meta) { const e = E.p3Out((t - T.meta) / 0.35), x = Math.max(980, 108 + nW + 24 + W(ctx, `/ ${N} ${s.counter?.label || ''}`, { ...F('display', L, 84, 800), spacing: -0.045 * 84 }) + 50); s.meta.forEach((m, i) => at(ctx, m, x + 20 * (1 - e), 770 + i * 42.5, fsm, i ? P.muted : P.ink, { alpha: e })); }
    ctx.restore();
    // the ticker: the counted items with their verdict, repeated, never read
    if (N && t >= T.ticker) {
      const e = E.p3Out((t - T.ticker) / 0.3), ft = F('mono', L, zh(L) ? 28 : 25, 400), unit = items.map((r) => [r, ` ${s.counter?.verdict || 'PASS'}`, '   /   ']), uw = unit.reduce((a, [r, v, sp]) => a + W(ctx, r + v + sp, ft), 0);
      let x = -((t - T.ticker) * 290) % uw;
      ctx.save(); ctx.globalAlpha *= e;
      while (x < 1920) { for (const [r, v, sp] of unit) { at(ctx, r, x, 940 + 10 * (1 - e), ft, P.dim); x += W(ctx, r, ft); at(ctx, v, x, 940 + 10 * (1 - e), ft, P.accent); x += W(ctx, v, ft); at(ctx, sp, x, 940 + 10 * (1 - e), ft, P.dim); x += W(ctx, sp, ft); } }
      ctx.restore();
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

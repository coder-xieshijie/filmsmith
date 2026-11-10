// decide-confirm — the chapter's decision summary and one confirmation, under the header the questions page left:
// a window (no dots) lands with the summary's title, the decisions slide in every half beat (a decision the tool
// found on its own blinks its `found` tag and is read before the next), then the person's confirmation box lands on
// a beat and passes on its check a beat later (accent fill, glow), as the camera pushes in 1.1 on it.
// From the phosphor template: film.js BUILD.decide, events.js TIMING.decide (window 0.1 beat; decisions every half
// beat, a found one read first; confirm on the beat once read, check one beat later, push 1.1 over 0.6 beat),
// index.html .dec .confirm .strip. The window morph from the questions page is runtime container-morph, not drawn
// here. Chinese: decisions and the confirmation as written at 40 px; ids and ✓ stay.
import { E, F, W, at, rr, rect, win, ground, post, hud, hudAt, palOf, reader, half, onBeat, SEEN, rgba, zh, clamp, pageHead } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { head: { title: ['SET', 'THE POLICY'], note: '// written to grainlock.toml' }, summary: ['POLICY', 'confirm once'], decisions: [{ id: 'D1', text: 'New maintainer → block' }, { id: 'D2', text: 'Install scripts denied' }, { id: 'D3', text: 'Pin transitive versions', found: 'from lockfile' }], confirm: ['YOU ▸', 'Confirm the policy'], strip: ['Plain TOML', 'Reviewed like code'] },
  zh: { head: { title: ['设定', '策略'], note: '// 写入 grainlock.toml' }, summary: ['策略', '确认一次'], decisions: [{ id: 'D1', text: '维护者变了 → 拦下' }, { id: 'D2', text: '禁止安装脚本' }, { id: 'D3', text: '锁定间接依赖版本', found: '来自锁文件' }], confirm: ['你 ▸', '确认这份策略'], strip: ['纯 TOML', '像代码一样评审'] },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), T = {};
  T.win = rd.move(0.1 * B, 0.45); rd.glance(T.win + SEEN, s.summary);
  const decs = (s.decisions || []).slice(0, 4), d0 = half(0.5 * B, B);
  let next = d0;
  T.decs = decs.map((d) => { const t = rd.move(next, 0.35); if (d.found) next = half(Math.max(t + 0.5 * B, rd.primary(t + SEEN, [d.text, d.found]) - 1.5 * B), B); else { rd.glance(t + SEEN, d.text); next = t + 0.5 * B; } return t; });
  T.strip = rd.move(d0 + 0.5 * B, 0.4); (s.strip || []).forEach((x) => rd.glance(T.strip + SEEN, x));
  const last = T.decs.length ? T.decs[T.decs.length - 1] : d0;
  T.confirm = onBeat(Math.max(last + 0.5 * B, rd.done - 1.5 * B), B); rd.move(T.confirm, 0.35);
  T.check = T.confirm + B; rd.move(T.check, 0.3);
  if (s.confirm) { rd.move(T.check, 0.6 * B); rd.primary(T.confirm + SEEN, s.confirm.join(' ')); rd.at(T.check + 0.5 * B); }
  T.done = rd.done; T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};

export default {
  id: 'decide-confirm', kind: 'scene',
  fits: ['demo', 'proof'],
  surface: ['canvas'],
  beats: { min: 5, max: 16 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'hi', 'find'], type: ['text', 'mono'] },
  slots: {
    head: { type: 'group', of: { title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } }, note: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } } } },
    summary: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } } },
    decisions: { type: 'list', count: [1, 4], of: { id: { type: 'code', tier: 'glance', limits: { en: { chars: 3 }, zh: { chars: 3 } } }, text: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 32 }, zh: { chars: 12 } } }, found: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 3, chars: 16 }, zh: { chars: 6 } } } } },
    confirm: { type: 'list', count: [2, 2], optional: true, of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 22 }, zh: { chars: 8 } } } },
    strip: { type: 'list', count: [0, 3], optional: true, of: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 22 }, zh: { chars: 8 } } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'hi', 'find', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], headEnter: false, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [...(s.decisions || []).filter((d) => d.found).map((d) => ({ text: d.text, lang: ctx.lang })), ...(s.confirm ? [{ text: s.confirm.join(' '), lang: ctx.lang }] : [])],
      cues: [...T.decs.map((x) => ({ beat: b(x), kind: 'accent' })), ...(s.confirm ? [{ beat: b(T.confirm), kind: 'accent' }, { beat: b(T.check), kind: 'stamp' }] : [])],
      motion: 'the decisions land; the confirmation lands and passes on its check; the camera pushes in on it', settled: b(T.check) + 0.5, peakAt: s.confirm ? b(T.check) : undefined,
      shots: [{ beat: 0, kind: 'summary' }, ...(s.confirm ? [{ beat: b(T.check), kind: 'push-in' }] : [])],
    };
  },
  prepare(s, c) { const L = c.lang || 'en', B = 60 / c.bpm; return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0) }; },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, decs = (s.decisions || []).slice(0, 4), H = 96 + Math.max(1, decs.length) * 84 + 10, cfy = 262 + H + 50;
    ground(ctx, P, t, { bpm: c.bpm });
    // the push on the confirmation (header and note hidden once pushed)
    const pk = s.confirm && t >= T.check ? E.p3Out((t - T.check) / (0.6 * B)) : 0, sc = 1 + 0.1 * pk;
    ctx.save(); ctx.translate(960, cfy + 50); ctx.scale(sc, sc); ctx.translate(-960, -(cfy + 50));
    pageHead(ctx, P, L, s.head, t, B, { enter: s.headEnter, screen: s.screen, alpha: 1 - pk });
    const e = E.p2Out((t - T.win) / 0.45);
    if (t >= T.win) { ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, 30 * (1 - e)); win(ctx, P, L, 110, 262, 1700, H, (s.summary || [])[0], (s.summary || [])[1], { dots: false }); ctx.restore(); }
    const fm = F('mono', L, 40, 400), ft = F('text', L, 40, 400), ff = F('mono', L, zh(L) ? 28 : 25, 500);
    decs.forEach((d, i) => {
      const t0 = T.decs[i]; if (t < t0) return;
      const a = E.expoOut((t - t0) / 0.35), x = 144 + 30 * (1 - a), y = 262 + 84 + i * 84;
      let xx = x; at(ctx, '✓', xx, y, fm, P.muted, { alpha: a }); xx += W(ctx, '✓', fm) + 14;
      const id = d.id || 'D' + (i + 1); at(ctx, id, xx, y, fm, P.dim, { alpha: a }); xx += W(ctx, id, fm) + 14;
      at(ctx, d.text, xx, y, ft, P.ink, { alpha: a }); xx += W(ctx, d.text, ft) + 14;
      if (d.found) { const k = Math.floor((t - t0 - 0.15) / 0.1), on = t < t0 + 0.15 ? false : k >= 9 || k % 2 === 0; if (on) { const fw = W(ctx, d.found, ff) + 20; rr(ctx, xx, y + 6, fw, 34, 4); ctx.strokeStyle = rgba(P.find, 0.6); ctx.lineWidth = 2; ctx.stroke(); at(ctx, d.found, xx + 10, y + 10, ff, P.find, { alpha: a }); } }
    });
    if (s.confirm && t >= T.confirm) {
      const a = E.p3Out((t - T.confirm) / 0.35), ok = t >= T.check, k = ok ? 1.06 - 0.06 * E.back(2)(clamp((t - T.check) / 0.3)) : 0.96 + 0.04 * a;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(960, cfy + 50 + 20 * (1 - a)); ctx.scale(k, k); ctx.translate(-960, -(cfy + 50));
      if (ok) { ctx.shadowColor = rgba(P.accent, 0.55); ctx.shadowBlur = 50; }
      rr(ctx, 510, cfy, 900, 100, 8); ctx.fillStyle = ok ? rgba(P.accent, 0.28) : rgba(P.muted, 0.06); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = ok ? P.accent : P.muted; ctx.lineWidth = 2; ctx.stroke();
      const [m, txt] = s.confirm, w = W(ctx, m, fm) + 18 + W(ctx, txt, ft) + (ok ? W(ctx, ' ✓', fm) : 0), x0 = 960 - w / 2, col = ok ? P.hi : P.ink;
      at(ctx, m, x0, cfy + 30, fm, col); at(ctx, txt, x0 + W(ctx, m, fm) + 18, cfy + 30, ft, col); if (ok) at(ctx, ' ✓', x0 + W(ctx, m, fm) + 18 + W(ctx, txt, ft), cfy + 30, fm, col);
      ctx.restore();
    }
    if ((s.strip || []).length && t >= T.strip) { const a = E.p3Out((t - T.strip) / 0.4), fs = F('mono', L, zh(L) ? 28 : 25, 400); let x = 112; s.strip.forEach((it, i) => { at(ctx, '▸', x, 948 + 10 * (1 - a), fs, P.dim, { alpha: a * (1 - pk) }); x += W(ctx, '▸ ', fs); at(ctx, it, x, 948 + 10 * (1 - a), fs, P.muted, { alpha: a * (1 - pk) }); x += W(ctx, it + '    ', fs); }); }
    ctx.restore();
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

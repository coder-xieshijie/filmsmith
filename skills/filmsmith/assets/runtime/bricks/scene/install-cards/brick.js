// install-cards — getting started on a terminal under a musical break: the title decodes in two halves at 108 px, a
// terminal window rises with one or two commands typed at reading pace (≤ 90 cps), and on the first beat after
// they are read the title and the terminal leave and the step cards land alone, one a beat (a new composition on the
// drop). Time the host adds (minBeats over the plan) goes to the terminal before the cards, in whole beats, with
// its window bar and then its title dimming to 60 % on the beat, so the cards keep their own length into the climax.
// From the phosphor template: film.js BUILD.install, events.js TIMING.install (title 0.1 / 0.6 beat, terminal 0.43
// beat, commands at paceCps, steps one a beat from onBeat(read − 1.25 beats), the wait), index.html .in-h, .in-term,
// .step. Chinese: the title splits at the break opportunity nearest its middle; the cards' lines are 28 px.
import { E, F, W, at, rect, rr, display, decodeAt, typedAt, win, ground, post, hud, palOf, reader, half, onBeat, paceCps, halves, graphemes, clamp, fit, SEEN, rgba, zh, hudAt } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { title: 'Replay any run.', window: ['terminal', 'zsh'], commands: ['npm i -D reseed'], steps: [['reseed run', 'record seeds'], ['reseed replay', 'rerun exactly'], ['reseed bisect', 'find the leak'], ['reseed verify', 'prove the fix']] },
  zh: { title: '任何一次运行都能重放。', window: ['terminal', 'zsh'], commands: ['npm i -D reseed'], steps: [['reseed run', '记录种子'], ['reseed replay', '原样重跑'], ['reseed bisect', '找出泄漏'], ['reseed verify', '证明修好']] },
};
const timing = (s, B, L, wait = 0) => {
  const rd = reader(L), T = { title1: 0.1 * B, title2: 0.6 * B, term: 0.43 * B, cps: 90 };
  rd.move(T.title1, 0.5); rd.move(T.title2, 0.45); rd.move(T.term, 0.35); rd.at(T.title2 + 0.45);
  const titleRead = rd.primary(T.title1 + 0.4, [s.title].flat().join(''));
  rd.glance(T.term + SEEN, s.window);
  let t = half(Math.max(0.9 * B, titleRead - SEEN), B);
  T.cmds = (s.commands || []).slice(0, 2).map((c) => {
    const a = t, cps = paceCps(c, T.cps, B, 'en'), dur = graphemes(c).length / cps;
    rd.move(a, dur); const read = rd.typed(a, c, cps, 'en');
    t = half(Math.max(a + dur + 0.2 * B, read - SEEN - 0.5 * B), B);
    return { a, cps };
  });
  const steps = (s.steps || []).slice(0, 4), s0 = onBeat(rd.done - 1.25 * B, B) + wait * B;
  T.waits = [];
  if (wait > 0 && steps.length) {
    const E0 = Math.max(0, ...rd.moves.map(([, z]) => z)), n = Math.ceil((s0 - E0) / (2 * B) - 1e-6) - 1;
    for (let k = 1; k <= Math.min(2, n); k++) T.waits.push(onBeat(E0 + ((s0 - E0) * k) / (n + 1), B));
  }
  T.steps = steps.map((_, i) => rd.move(s0 + i * B, 0.3));
  steps.forEach((st, i) => rd.glance(T.steps[i] + SEEN, st));
  const bar = 4 * B;
  T.stepsAt = steps.length ? Math.max(bar, Math.ceil(s0 / bar - 1e-6) * bar) : null;
  if (T.stepsAt != null && T.stepsAt > s0 + (steps.length - 1) * B + 1e-6) T.stepsAt = null;
  T.done = rd.done;
  return T;
};
const beatsOf = (s, bpm, L) => { const B = 60 / bpm; return Math.ceil(timing(s, B, L).done / B - 1e-6); };

export default {
  id: 'install-cards', kind: 'scene',
  fits: ['rest', 'demo'],
  surface: ['canvas'],
  beats: { min: 8, max: 20 },
  needs: { motions: ['glyph-decode'], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'titleHi', 'titleLo'], type: ['display', 'text', 'mono'] },
  slots: {
    title: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 26 }, zh: { chars: 12 } } },
    window: { type: 'list', count: [1, 2], of: { type: 'code', tier: 'glance', limits: { en: { chars: 24 }, zh: { chars: 24 } } } },
    commands: { type: 'list', count: [1, 2], of: { type: 'code', tier: 'primary', limits: { en: { chars: 60 }, zh: { chars: 60 } } } },
    steps: { type: 'list', count: [2, 4], of: { cmd: { type: 'code', tier: 'glance', limits: { en: { chars: 18 }, zh: { chars: 18 } } }, label: { type: 'text', tier: 'glance', limits: { en: { words: 4, chars: 20 }, zh: { chars: 8 } } } } },
    hud: { type: 'group', optional: true, of: { brand: { type: 'text', tier: 'glance' }, licence: { type: 'text', tier: 'glance' }, section: { type: 'text', tier: 'glance' } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'dim', 'line', 'accent', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], steps: DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'].steps.map(([cmd, label]) => ({ cmd, label })), screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, L = ctx.lang, need = beatsOf(s, ctx.bpm, L), beats = Math.max(need, s.minBeats || 0);
    const T = timing(s, B, L, beats - need), b = (x) => x / B;
    return {
      beats, lead: 0, reads: [{ text: [s.title].flat().join(''), lang: L }, ...(s.commands || []).map((text) => ({ text, lang: L }))],
      cues: [...T.cmds.map((c) => ({ beat: b(c.a), kind: 'accent' })), ...T.steps.map((x) => ({ beat: b(x), kind: T.stepsAt != null && Math.abs(x - T.stepsAt) < 1e-6 ? 'land' : 'stamp' }))],
      motion: 'the title decodes in two halves; the terminal rises; commands type; the cards land alone, one a beat', settled: b(T.steps[T.steps.length - 1] ?? T.done) + 0.5,
      shots: [{ beat: 0, kind: 'terminal' }, ...(T.steps.length ? [{ beat: b(T.steps[0]), kind: 'cards' }] : [])], peakAt: T.stepsAt != null ? b(T.stepsAt) : undefined,
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm, need = beatsOf(s, c.bpm, L), beats = Math.max(need, s.minBeats || 0);
    return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, beats - need), title: Array.isArray(s.title) ? [String(s.title[0] ?? ''), String(s.title[1] ?? '')] : halves(s.title, L), beats };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B;
    ground(ctx, P, t, { bpm: c.bpm });
    const cards = T.steps.length && t >= T.steps[0];
    if (!cards) {
      // the title, decoded in two halves, centred as one line
      const f0 = F('display', L, 108, 800), full = D.title.join('');
      const f = fit(ctx, full, { ...f0, spacing: zh(L) ? 0 : -0.045 * 108 }, 1700, zh(L) ? 88 : 94);
      const x0 = 960 - W(ctx, full, f) / 2, dimT = T.waits[1] != null && t >= T.waits[1] ? 0.6 : 1;
      ctx.save(); ctx.filter = dimT < 1 ? 'brightness(0.6)' : 'none';
      const a = decodeAt(D.title[0], t, T.title1, 0.5, 11), b2 = decodeAt(D.title[1], t, T.title2, 0.45, 12);
      display(ctx, a, x0, 150, f, P, { screen: s.screen });
      display(ctx, b2, x0 + W(ctx, D.title[0], f), 150, f, P, { screen: s.screen });
      ctx.restore();
      // the terminal
      const e = E.p3Out((t - T.term) / 0.35);
      if (t >= T.term) {
        ctx.save(); ctx.globalAlpha = e; ctx.translate(0, 24 * (1 - e));
        win(ctx, P, L, 300, 330, 1320, 210, (s.window || [])[0], (s.window || [])[1]);
        if (T.waits[0] != null && t >= T.waits[0]) rect(ctx, 302, 332, 1316, 52, '#000000', 0.4);
        const fc = F('mono', L, 32, 400);
        (s.commands || []).slice(0, 2).forEach((cmd, i) => {
          const tc = T.cmds[i]; if (!tc) return;
          const y = 330 + 84 + i * 54;
          at(ctx, '›', 328, y, fc, P.ink);
          if (t < tc.a) return;
          at(ctx, typedAt(cmd, t, tc.a, tc.cps), 328 + W(ctx, '› ', fc), y, fit(ctx, cmd, fc, 1260, 28), P.ink);
        });
        ctx.restore();
      }
    } else {
      const steps = (s.steps || []).slice(0, 4), n = steps.length, total = n * 360 + (n - 1) * 50, x0 = (1920 - total) / 2;
      const fm = F('mono', L, zh(L) ? 28 : 25, 400), fl = F('text', L, zh(L) ? 28 : 25, 400);
      steps.forEach((st, i) => {
        const t0 = T.steps[i]; if (t < t0) return;
        const e = E.expoOut((t - t0) / 0.3), x = x0 + i * 410, y = 465;
        ctx.save(); ctx.globalAlpha = e; ctx.translate(x + 180, y + 75 + 30 * (1 - e)); ctx.scale(0.94 + 0.06 * e, 0.94 + 0.06 * e); ctx.translate(-180, -75);
        rr(ctx, 0, 0, 360, 150, 8); ctx.fillStyle = rgba(P.panel, 0.92); ctx.fill(); ctx.strokeStyle = t >= t0 + 0.05 ? P.muted : P.line; ctx.lineWidth = 2; ctx.stroke();
        at(ctx, String(i + 1).padStart(2, '0'), 342, 18, fm, P.dim, { align: 'right' });
        at(ctx, st.cmd, 22, 24, fit(ctx, st.cmd, fm, 270, 22), P.muted);
        at(ctx, st.label, 22, 24 + fm.size + 16, fit(ctx, st.label, fl, 316, zh(L) ? 28 : 22), P.ink);
        ctx.restore();
      });
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / D.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track(s) { return [[960, 540]]; },
};

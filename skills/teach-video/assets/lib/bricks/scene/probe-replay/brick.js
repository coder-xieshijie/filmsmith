// probe-replay — the proof on an input the run never saw: the board dims, a new row arrives in the `unseen` colour,
// its letters resolve left to right through the corpus's own letters until they lock, then the learned rules replay
// on it one a beat, each flashing in the rule list as the probe fuses that pair; on the reveal beat the result chips
// are `learned`, the push comes up (× 1.06) and the claim caption names the pieces, read in a pause.
// From the trace template's `probe` scene (assets/templates/trace/pieces.js; letters 0.75 beat a chip, 0.04 s apart,
// re-rolled 24 times a second: the grammar of lib/handoffs scramble-resolve, drawn into each chip).
import { runOf, rowsAt, geometry, chip, row, rowLabels, tokenBar, barKinds, caption, hud, groundOf, loadFonts, kinds, monoF, text, rgba, G, readTime, RUN, smooth, clamp, expOut, secs } from '../../motion/pair-fuse/board.js';
import { hash } from '../../../rng.js';

const DEFAULT = {
  en: { captions: ['An unseen name: [[unseen|reloader]]', 'Learned pieces: [[learned|re + load + er]]'], label: 'new', heading: 'learned merges', size: '{n} tokens', title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers' },
  zh: { captions: ['一个没见过的名字：[[unseen|reloader]]', '拆成学到的片段：[[learned|re + load + er]]'], label: '新', heading: '学到的合并', size: '{n} 个词元', title: '代码分词器', subtitle: '从标识符里学词表' },
};
const timesOf = (run, bpm) => {
  const n = run.probe.tokens.length, letters = 0.25 + 0.75 + ((n - 1) * 0.04 * bpm) / 60, first = Math.max(2, Math.ceil(letters));
  const replays = run.probe.steps.map((_, i) => first + i), last = replays.length ? replays[replays.length - 1] : first;
  return { replays, reveal: Math.ceil(last + 0.4 + 0.45), fuse: 0.45 };
};
export default {
  id: 'probe-replay', kind: 'scene',
  fits: ['climax', 'proof'],
  surface: ['canvas'],
  beats: { min: 6, max: 14 },
  needs: { motions: ['pair-fuse', 'scramble-resolve', 'trace-flow'], props: ['token-chip', 'token-bar'], roles: ['ground', 'ink', 'dim', 'accent', 'base', 'learned', 'unseen', 'cell'], type: ['text', 'mono'] },
  slots: {
    captions: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 8, chars: 56 }, zh: { chars: 22 } } } },
    label: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 5 }, zh: { chars: 2 } } },
    heading: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    size: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 12 }, zh: { chars: 6 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent', 'base', 'learned', 'unseen', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN }),
  plan(s, ctx) {
    const T = timesOf(runOf(s.run || RUN), ctx.bpm), read = (readTime(s.captions?.[1] || '', ctx.lang) * ctx.bpm) / 60;
    const beats = clamp(Math.ceil(T.reveal + Math.max(1.5, read + 0.5)), 6, 14);
    return { beats, reads: (s.captions || []).map((x) => ({ text: x, lang: ctx.lang })), cues: [...T.replays.map((b) => ({ beat: b, kind: 'land' })), { beat: T.reveal, kind: 'accent' }], motion: 'letters resolve, rules replay', settled: T.reveal, peakAt: T.reveal, pause: beats - T.reveal };
  },
  async prepare(s, c) { await loadFonts(c.lang); const run = runOf(s.run); const letters = [...new Set(run.rows.flatMap((r) => r.tokens.map((t) => t.t)))]; return { run, g: geometry(run), T: timesOf(run, c.bpm), letters }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, { run, g, T } = D, K = kinds(C), k = run.steps.length - 1, P = run.probe;
    groundOf(ctx, s); hud(ctx, s, k, run, C, L);
    const rev = expOut(secs(u - T.reveal, bpm) / 0.32), z = 1 + 0.06 * rev;
    ctx.save(); ctx.translate(960, 540); ctx.scale(z, z); ctx.translate(-960, -540);
    ctx.globalAlpha = 0.35; rowLabels(ctx, g, run, C); rowsAt(run, k).forEach((toks, r) => row(ctx, g, C, toks, null, null, 0, g.rowY(r))); ctx.globalAlpha = 1;
    // the probe row: which replay is running, and its fuse
    let i = -1; T.replays.forEach((b, j) => { if (u >= b - T.fuse) i = j; });
    const cy = g.probeY;
    text(ctx, s.label, g.labelR, cy + 9, monoF(G.label), { color: K.unseen, align: 'right' });
    if (i < 0) {
      const xs = g.xsOf(P.tokens);
      P.tokens.forEach((tk, j) => {
        const a = smooth(secs(u - 0.25 - j * 0.02 * bpm / 60, bpm) / 0.2), lockAt = 0.25 + 0.75 + (j * 0.04 * bpm) / 60, locked = u >= lockAt;
        const roll = D.letters[Math.floor(hash(j * 97 + Math.floor(secs(u, bpm) * 24), 7) * D.letters.length)];
        ctx.globalAlpha = a; chip(ctx, g, xs[j], cy, g.chipW(tk), u >= 0.25 + 0.1 ? (locked ? tk.t : roll) : null, K.unseen, C, { textCol: locked ? C.ink : C.dim }); ctx.globalAlpha = 1;
      });
    } else {
      const st = P.steps[i], prev = i ? P.steps[i - 1].tokens : P.tokens, e = clamp(secs(u - (T.replays[i] - T.fuse), bpm) / secs(T.fuse * 1.33, bpm));
      row(ctx, g, C, prev, st.tokens, st.map, e, cy, { landed: e >= 0.75 ? secs(u - T.replays[i], bpm) : -1 });
    }
    const nNow = i < 0 ? P.tokens.length : P.steps[i].tokens.length;
    text(ctx, (s.size || '{n}').replace('{n}', nNow), 1220, cy + 9, monoF(G.label), { color: u >= T.reveal ? K.learned : C.dim });
    ctx.restore();
    // the rule list (all learned merges); the one replaying flashes in the accent; unused ones dim after the reveal
    text(ctx, s.heading, G.hx, G.hy - 30, monoF(G.label), { color: C.dim });
    const used = new Set(P.steps.map((x) => x.rule));
    run.learned.forEach((x, j) => {
      const y = G.hy + j * 42 + 18, ri = P.steps.findIndex((ps) => ps.rule === j), fl = ri >= 0 ? Math.max(0, 1 - Math.abs(secs(u - T.replays[ri], bpm)) / 0.35) : 0;
      const a = used.has(j) ? 1 : 1 - 0.6 * smooth(secs(u - T.reveal - 1, bpm) / 0.3);
      if (fl > 0) { ctx.fillStyle = rgba(C.accent, 0.2 * fl); ctx.fillRect(G.hx - 8, y - 26, G.rx - G.hx + 16, 36); }
      text(ctx, `${j + 1}  ${x.a} + ${x.b} → ${x.token}`, G.hx, y, monoF(G.label), { color: C.ink, alpha: a });
    });
    tokenBar(ctx, run.T0, run.TN, C, L, { a: 0.5, count: run.TN, kinds: barKinds(run, run.steps.length - 1) });
    const caps = s.captions || [];
    if (u < T.reveal) caption(ctx, caps[0], u, 0.15, bpm, C, L, { a: 1 - smooth(secs(u - T.reveal + 0.2, bpm) / 0.2) });
    else caption(ctx, caps[1], u, T.reveal, bpm, C, L);
  },
  track(u, s, c, D) { return [[D.g.X0, D.g.probeY]]; },
};

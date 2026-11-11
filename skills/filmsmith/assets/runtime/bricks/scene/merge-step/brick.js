// merge-step — the rule applied, then repeated: the most frequent pair is picked in the histogram (its bar takes the
// accent), its occurrences light on the board in dashed boxes, every row fuses it at once (pair-fuse), a line
// "a + d → ad ×15" arrives in the list of learned merges and the token bar shrinks. `slow: true` for the first step
// (pick 0.5, light 0.75, the fuse lands on beat 3); a loop runs steps from..to at one merge every `pace` beats (2, or
// 1 for the compressed run into the climax), the histogram gone and the rule list in its place.
// From the trace template's `step` and `loop` scenes (assets/templates/trace/timing.rules.js, pieces.js).
import { runOf, rowsAt, totalAt, geometry, row, rowLabels, tokenBar, barKinds, caption, hud, groundOf, loadFonts, G, monoF, text, mix, rgba, readTime, RUN, smooth, clamp, secs } from '../../motion/pair-fuse/board.js';

const DEFAULT = {
  en: { caption: 'Most frequent: [[active|a + d]] → [[learned|ad]]', heading: 'learned merges', title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers' },
  zh: { caption: '最常见的一对：[[active|a + d]] → [[learned|ad]]', heading: '学到的合并', title: '代码分词器', subtitle: '从标识符里学词表' },
};
const FUSE = 0.6;   // s
const timesOf = (s, bpm) => {
  const k0 = s.from ?? 0, k1 = Math.max(k0, s.to ?? k0), n = k1 - k0 + 1, fb = (FUSE * bpm) / 60;
  if (n === 1) { const land = s.slow ? 3 : 2; return { k0, k1, merges: [{ k: k0, pick: s.slow ? 0.5 : 0.75 - 0.5, hi: s.slow ? 0.75 : 0.75, land, start: land - 0.75 * fb, rule: land + 0.5, dur: fb }], end: land + 0.5 }; }
  const p = s.pace || 2, dur = Math.min(fb, 0.45 * p);
  const merges = Array.from({ length: n }, (_, i) => { const land = 1 + i * p; return { k: k0 + i, pick: null, hi: land - p / 2, land, start: land - 0.75 * dur, rule: land + p / 4, dur }; });
  return { k0, k1, merges, end: merges[n - 1].rule };
};
export default {
  id: 'merge-step', kind: 'scene',
  fits: ['demo', 'problem', 'turn'],
  surface: ['canvas'],
  beats: { min: 3, max: 12 },
  needs: { motions: ['pair-fuse', 'path-type', 'trace-flow'], props: ['token-chip', 'token-bar'], roles: ['ground', 'ink', 'dim', 'line', 'accent', 'base', 'learned', 'cell'], type: ['text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 8, chars: 60 }, zh: { chars: 22 } } },
    heading: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'line', 'accent', 'base', 'learned', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN, from: 0, to: 0, slow: true, pace: 2 }),
  plan(s, ctx) {
    const T = timesOf(s, ctx.bpm), read = (readTime(s.caption, ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(Math.max(T.end + 0.75, read + 0.5)), 3, 12);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }], cues: T.merges.flatMap((m) => [{ beat: m.land, kind: 'land' }, { beat: m.rule, kind: 'accent' }]), motion: 'pair fuses on every row', settled: T.end, peakAt: T.merges[0].land, pause: beats - T.end };
  },
  validate(s) { const n = (s.run || RUN).merges ?? 6; return (s.to ?? s.from ?? 0) < n ? [] : ['to: past the last merge of the run']; },
  async prepare(s, c) { await loadFonts(c.lang); const run = runOf(s.run); return { run, g: geometry(run), T: timesOf(s, c.bpm) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, { run, g, T } = D;
    // the merge in play at u: the last whose highlight has begun
    let m = T.merges[0]; for (const x of T.merges) if (u >= x.hi - 0.01) m = x;
    const done = T.merges.filter((x) => u >= x.start + x.dur * 0.75).length;
    const kShown = Math.min(run.steps.length - 1, m.k), st = run.steps[kShown], e = clamp(secs(u - m.start, bpm * 1) / ((m.dur * 60) / bpm));
    groundOf(ctx, s); hud(ctx, s, T.k0 - 1 + done, run, C, L); rowLabels(ctx, g, run, C);
    const old = rowsAt(run, kShown - 1), hiAmt = smooth(secs(u - m.hi, bpm) / 0.2);
    old.forEach((toks, r) => row(ctx, g, C, toks, st.rows[r].tokens, st.rows[r].map, e >= 1 ? 1 : e, g.rowY(r), { hi: st.hi.filter(([rr]) => rr === r).map(([, i]) => i), hiAmt: e > 0 ? 0 : hiAmt, landed: e >= 0.75 ? secs(u - m.land, bpm) : -1 }));
    tokenBar(ctx, run.T0, totalAt(run, kShown), C, L, { from: totalAt(run, kShown - 1), shrink: e, count: totalAt(run, e >= 0.75 ? kShown : kShown - 1), kinds: barKinds(run, e >= 0.75 ? kShown : kShown - 1) });
    // the right column: before a single step, the histogram of pair counts with the pick; the rule list below it
    const single = T.merges.length === 1, ruleY = single ? 640 : G.hy;
    if (single) {
      const items = st.counts, maxC = Math.max(...items.map((x) => x.count)), scale = (G.rx - G.hx - 190) / maxC, pick = m.pick != null ? smooth(secs(u - m.pick, bpm) / 0.2) : 0;
      text(ctx, L === 'zh' ? `第 ${kShown + 1} 次合并前` : `before merge ${kShown + 1}`, G.hx, 196, monoF(G.label), { color: C.dim });
      items.forEach((x, i) => {
        const y = G.hy + i * G.hrow, on = i === 0 ? pick : 0;
        text(ctx, `${x.a} ${x.b}`, G.hx, y + 18, monoF(G.label), { color: mix(C.ink, C.accent, on) });
        ctx.fillStyle = mix(C.cell || C.dim, C.accent, on); ctx.fillRect(G.hx + 90, y, x.count * scale, 18);
        text(ctx, String(x.count), G.rx, y + 18, monoF(G.label, 600), { color: C.ink, align: 'right' });
      });
    }
    text(ctx, s.heading, G.hx, ruleY - 30, monoF(G.label), { color: C.dim });
    for (let k = 0; k <= Math.min(run.steps.length - 1, T.k1); k++) {
      const rm = T.merges.find((x) => x.k === k), at = rm ? rm.rule : -1e9, a = smooth(secs(u - at, bpm) / 0.25);
      if (a <= 0) continue;
      const y = ruleY + (k - (single ? 0 : 0)) * 42 + 18, x = run.learned[k], flash = rm ? Math.max(0, 1 - secs(u - at, bpm) / 0.6) : 0;
      if (flash > 0) { ctx.fillStyle = rgba(C.accent, 0.18 * flash); ctx.fillRect(G.hx - 8, y - 26, G.rx - G.hx + 16, 36); }
      text(ctx, `${k + 1}  ${x.a} + ${x.b} → `, G.hx, y, monoF(G.label), { color: C.ink, alpha: a });
      text(ctx, x.token, G.hx + 44 + (x.a.length + x.b.length + 7) * G.label * 0.6, y, monoF(G.label, 600), { color: C.learned || C.accent, alpha: a });
      text(ctx, `×${x.count}`, G.rx, y, monoF(G.label), { color: C.dim, align: 'right', alpha: a });
    }
    caption(ctx, s.caption, u, 0.15, bpm, C, L);
  },
  track(u, s, c, D) { return [[D.g.X0, D.g.rowY(0)]]; },
};

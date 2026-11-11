// weight-histogram — counting, shown: the right-hand column lists the most frequent neighbouring pairs; for each pair,
// one a beat, the pair's occurrences light on the board and each row's weight (×6, ×3 …) flies on an arc from the
// row label to the pair's bar, where it lands as a visible segment; the bar's total counts up. The weighting is drawn,
// not said. The top bar is the next merge.
// From the trace template's `count` scene (assets/templates/trace/pieces.js histogram, the weight flights: 0.45 s
// cubic in-out on a 60 px arc, a segment growing expo-out 0.3 s, landing at 90 %).
import { runOf, rowsAt, geometry, row, rowLabels, tokenBar, caption, hud, groundOf, loadFonts, G, monoF, text, mix, readTime, RUN, smooth, clamp, lerp, expOut, secs } from '../../motion/pair-fuse/board.js';

const DEFAULT = {
  en: { caption: 'Count [[active|neighbouring pairs]], weighted by use.', heading: 'pair counts', title: 'Code tokenizer', subtitle: 'learning a vocabulary from identifiers' },
  zh: { caption: '数[[active|相邻的字符对]]，按使用次数加权。', heading: '字符对计数', title: '代码分词器', subtitle: '从标识符里学词表' },
};
const ITEM0 = 1, STEP = 1;
const cubicInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export default {
  id: 'weight-histogram', kind: 'scene',
  fits: ['problem', 'demo'],
  surface: ['canvas'],
  beats: { min: 4, max: 10 },
  needs: { motions: [], props: ['token-chip', 'token-bar'], roles: ['ground', 'ink', 'dim', 'line', 'accent', 'base', 'cell'], type: ['text', 'mono'] },
  slots: {
    caption: { type: 'text', tier: 'primary', limits: { en: { words: 8, chars: 60 }, zh: { chars: 22 } } },
    heading: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 18 }, zh: { chars: 8 } } },
    title: { type: 'text', tier: 'glance', limits: { en: { words: 3, chars: 22 }, zh: { chars: 8 } } },
    subtitle: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 44 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'line', 'accent', 'base', 'cell'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], run: RUN }),
  plan(s, ctx) {
    const n = Math.min(s.run?.top ?? 4, 4), beats = clamp(Math.ceil(ITEM0 + n * STEP + 1.5), 4, 10);
    return { beats, reads: [{ text: s.caption, lang: ctx.lang }], cues: Array.from({ length: n }, (_, i) => ({ beat: ITEM0 + i * STEP + 0.5, kind: 'land' })), motion: 'weights fly into segments', settled: ITEM0 + n * STEP, peakAt: ITEM0, pause: beats - ITEM0 - n * STEP };
  },
  async prepare(s, c) { await loadFonts(c.lang); const run = runOf(s.run); return { run, g: geometry(run) }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, { run, g } = D, items = run.steps[0].counts;
    groundOf(ctx, s); hud(ctx, s, -1, run, C, L); rowLabels(ctx, g, run, C);
    // the item being counted lights its occurrences on the board
    const cur = clamp(Math.floor((u - ITEM0) / STEP), -1, items.length - 1), it = cur >= 0 ? items[cur] : null;
    const hiAt = (r) => { if (!it) return []; const toks = rowsAt(run, -1)[r], out = []; for (let i = 0; i + 1 < toks.length; i++) if (toks[i].t === it.a && toks[i + 1].t === it.b) out.push(i); return out; };
    const hiAmt = it ? smooth(secs(u - (ITEM0 + cur * STEP), bpm) / 0.2) * (1 - smooth(secs(u - (ITEM0 + (cur + 1) * STEP) + 0.15, bpm) / 0.15)) : 0;
    rowsAt(run, -1).forEach((toks, r) => row(ctx, g, C, toks, null, null, 0, g.rowY(r), { hi: hiAt(r), hiAmt }));
    tokenBar(ctx, run.T0, run.T0, C, L, { a: 0.6 });
    // the histogram: heading, a row per item, segments by source row, the label of the pair and its total
    const [ha] = [smooth(secs(u - 0.25, bpm) / 0.3)];
    text(ctx, s.heading, G.hx, 196, monoF(G.label), { color: C.dim, alpha: ha });
    const maxC = Math.max(...items.map((x) => x.count)), scale = (G.rx - G.hx - 190) / maxC;
    items.forEach((x, i) => {
      const y = G.hy + i * G.hrow, t0 = ITEM0 + i * STEP;
      const [ia] = [smooth(secs(u - t0 + 0.25, bpm) / 0.25)];
      if (ia <= 0) return;
      text(ctx, `${x.a} ${x.b}`, G.hx, y + 18, monoF(G.label), { color: i === cur ? C.accent : C.ink, alpha: ia });
      let sx = G.hx + 90, tot = 0;
      x.from.forEach((f, j) => {
        const w = f.w * f.n * scale, tf = t0 + j * 0.12, fl = cubicInOut(clamp(secs(u - tf, bpm) / 0.45)), gr = expOut(secs(u - tf, bpm) / 0.45 - 0.6);
        if (fl > 0 && fl < 1) { // the weight in flight: from the row label to the segment, on a 60 px arc
          const x0 = g.labelR - 30, y0 = g.rowY(f.row), x1 = sx + w / 2, y1 = y + 9, arc = Math.sin(Math.PI * fl) * 60;
          text(ctx, `×${f.w * f.n}`, lerp(x0, x1, fl), lerp(y0, y1, fl) - arc, monoF(G.label, 600), { color: C.accent, align: 'center' });
        }
        if (gr > 0) { ctx.fillStyle = i === cur ? mix(C.cell || C.dim, C.accent, 0.85) : C.cell || C.dim; ctx.fillRect(sx, y, w * gr - 2, 18); tot += f.w * f.n * (fl >= 1 ? 1 : 0); }
        // the landed segment keeps its weight inside it, as in the template (the weighting stays readable)
        if (gr > 0.9 && w >= 22) text(ctx, String(f.w * f.n), sx + (w - 2) / 2, y + 15, monoF(15, 600), { color: s.colors.ground, align: 'center', alpha: smooth((gr - 0.9) / 0.1) });
        sx += w;
      });
      if (tot > 0) text(ctx, String(tot), G.rx, y + 18, monoF(G.label, 600), { color: C.ink, align: 'right' });
    });
    caption(ctx, s.caption, u, 0.15, bpm, C, L);
  },
  track(u, s, c, D) { return [[G.hx, G.hy]]; },
};

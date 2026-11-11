// mark-pullback — the lock-up of a print film: the camera pushes in on the anchor (to the opening's 24 px screen)
// while the mark's black plate inks up out of it and the rings of the film appear round it, holds a quarter beat in
// silence, then pulls back on a log scale while the anchor travels to its place in the whole mark: the rings were
// the mark's arcs all along. The name rises beside the mark on beat 2 of the pull, its line on beat 3; on the last
// bar's downbeat the plate takes one dot-gain impression and settles (the second move).
// From the halftone template's `pull` boundary and `lockup` scene (assets/templates/halftone/film.js pullState,
// paintPull, paintLockup; timing.rules.js pushBeats 1.5, stillBeats 0.25, pullBeats 1.25, nameAt 2, lineAtLock 3):
// the log-scale camera, the inking front, the ring fade and the dot gain are the template's; the pull is drawn here
// directly rather than through the anchor-swap hand-off.
import { P, W, secs, worldColors, ground, display, fitSize, riseText, markGeo, drawAnchor, drawMarkPlate, drawMarkRings, loadFonts, widthOf, clamp, lerp, cubicInOut, expOut, readTime } from '../../motion/dot-quantize/press.js';

const DEFAULT = { en: { name: 'parley-2', line: 'speech model · out today' }, zh: { name: 'parley-2', line: '语音模型 · 今日发布' } };
const PUSH = 1.5, STILL = 0.25, PULL = 1.25, NAME = 2, LINE = 3;
const layout = (ctx, s, L, bpm, G) => {
  const [bx0, by0, bx1, by1] = G.mark.box, mk = (z) => display('en', z, 800), nr = fitSize(ctx, s.name, mk, [178, 131], 1100);
  const nameW = widthOf(ctx, s.name, mk(nr.size)), markW = (bx1 - bx0) * G.U, total = markW + 84 + nameW, left = Math.round(960 - total / 2);
  const F = [left - bx0 * G.U, 540 - ((by0 + by1) / 2) * G.U], nameX = left + markW + 84, nameY = 540 + Math.round(nr.size * 0.36), o = PUSH + STILL;
  return { F, T: [{ str: s.name, x: nameX, y: nameY, f: mk(nr.size), role: 'ink', land: secs(o + NAME, bpm) },
    ...(s.line ? [{ str: s.line, x: nameX + 6, y: nameY + 92, f: display(L, 52, 500), role: 'dim', land: secs(o + LINE, bpm) }] : [])] };
};

export default {
  id: 'mark-pullback', kind: 'scene',
  fits: ['close'],
  surface: ['canvas'],
  beats: { min: 8, max: 12 },
  needs: { motions: ['anchor-swap'], props: ['anchor-mark'], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display'] },
  slots: {
    name: { type: 'code', tier: 'primary', limits: { en: { chars: 12 }, zh: { chars: 12 } } },
    line: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 5, chars: 28 }, zh: { chars: 14 } } },
  },
  roles: ['ground', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], dot: 'round', push: true }),
  plan(s, ctx) {
    const o = s.push === false ? 0 : PUSH + STILL, read = ((readTime(s.name, 'en') + readTime(s.line, ctx.lang)) * ctx.bpm) / 60;
    const beats = clamp(Math.ceil(o + LINE + Math.max(2.5, read + 1.5)), 8, 12);
    return { beats, reads: [{ text: s.name, lang: 'en' }, { text: s.line, lang: ctx.lang }], cues: [{ beat: 0, kind: 'turn' }, { beat: o, kind: 'hit' }, { beat: o + NAME, kind: 'land' }, { beat: o + LINE, kind: 'land' }, { beat: beats - 4, kind: 'accent' }],
      motion: 'push in, log-scale pull back into the mark', settled: o + LINE + 0.25, peakAt: o, pause: beats - o - LINE - 0.25 };
  },
  async prepare(s, c) { await loadFonts(c.lang); return { G: markGeo() }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, t = secs(u, bpm), wc = worldColors(C, 'paper'), G = D.G, sh = s.dot;
    if (!D.lay) { D.lay = layout(ctx, s, L, bpm, G); D.beats = this.plan(s, c).beats; }
    const o = s.push === false ? 0 : PUSH + STILL, tb = secs(o, bpm), F = D.lay.F;
    ground(ctx, wc);
    if (t < tb) { // the push-in: the mark inks up out of the anchor; the rings appear
      const k = cubicInOut(clamp(t / secs(PUSH, bpm))), Z = Math.exp(lerp(Math.log(G.ZA), Math.log(G.ZP), k));
      drawMarkRings(ctx, G, P, Z, wc.ink, clamp(t / (secs(PUSH, bpm) * 0.7)), sh);
      drawMarkPlate(ctx, G, P, Z, wc.ink, { inked: clamp(t / secs(PUSH, bpm)), shape: sh });
      drawAnchor(ctx, G, P, Z, C, { shape: sh });
      return;
    }
    const e = expOut(clamp((t - tb) / secs(PULL, bpm))), Z = Math.exp(lerp(Math.log(G.ZP), 0, e)), A = [lerp(P[0], F[0], e), lerp(P[1], F[1], e)];
    const q = t - secs(D.beats - 4, bpm), gain = q > 0 ? 1 + 0.16 * Math.exp(-q / 0.12) * Math.min(1, q / 0.03) : 1;
    drawMarkRings(ctx, G, A, Z, wc.ink, 1 - clamp((t - tb) / (secs(PULL, bpm) * 0.8)), sh);
    drawMarkPlate(ctx, G, A, Z, wc.ink, { gain, shape: sh });
    drawAnchor(ctx, G, A, Z, C, { gain: q > 0 ? 1 + 0.1 * Math.exp(-q / 0.12) * Math.min(1, q / 0.03) : 1, shape: sh });
    for (const x of D.lay.T) riseText(ctx, x, t, wc);
  },
  track(u, s, c, D) { return [P]; },
};

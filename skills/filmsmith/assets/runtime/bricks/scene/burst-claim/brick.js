// burst-claim — the climax of a print film: the last world shrinks into the anchor (half a beat, accelerating), the
// anchor squashes and holds still in anticipation, and on the bar line it strikes: one crisp ring runs out of it and
// a burst of dots flies out on bent paths and condenses onto the claim's letters at the left, which then print solid;
// the claim is read in the pause. `from`: the field kind of the world that collapses (`none` for paper only).
// From the halftone template's `collapse` boundary and `claim` scene (assets/templates/halftone/film.js paintBoundary
// collapse, ready claim cells, paint's squash and ring; timing.rules.js collapseBeats 1.25, claimLand 1.25): the
// curves, the 8 px letter cells, the bend of each dot's path and the beats are the template's.
import { P, W, H, X0, TEXT_R, secs, worldColors, ground, display, fitSize, riseText, fieldTone, drawField, DEF, markGeo, drawAnchor, loadFonts, fontOf, hash, clamp, lerp, cubicInOut, expIn, expOut, readTime } from '../../motion/dot-quantize/press.js';

const DEFAULT = { en: { lines: ['Every voice,', 'its own words.'] }, zh: { lines: ['每个声音，', '都有自己的字。'] } };
const COLLAPSE = 1.25, LAND = 1.25;
const layout = (ctx, s, L, bpm) => {
  const ls = (s.lines || []).slice(0, 2), mk = (z) => display(L, z, 800), sz = Math.min(...ls.map((l) => fitSize(ctx, l, mk, [131, 96], TEXT_R - X0).size));
  const ys = ls.length > 1 ? [500, 500 + Math.round(sz * (L === 'zh' ? 1.18 : 1.08))] : [580];
  return ls.map((l, k) => ({ str: l, x: X0, y: ys[k], f: mk(sz), role: 'ink', land: secs(COLLAPSE + LAND, bpm) }));
};
// the claim's letters sampled into 8 px cells; each cell's dot starts at the anchor and bends through a seeded point
const cellsOf = (T, seed) => {
  if (typeof document === 'undefined') return [];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  for (const e of T) { g.font = fontOf(e.f); g.fillStyle = 'black'; g.fillText(e.str, e.x, e.y); }
  const img = g.getImageData(0, 0, W, H).data, STEP = 8, out = [];
  let xa = Infinity, xb = -Infinity;
  for (let y = 300 + STEP / 2; y < 900; y += STEP) for (let x = X0 - 10 + STEP / 2; x < TEXT_R + 40; x += STEP) {
    if (img[(Math.round(y) * W + Math.round(x)) * 4 + 3] < 120) continue;
    out.push({ x, y }); xa = Math.min(xa, x); xb = Math.max(xb, x);
  }
  return out.map((p, i) => ({ ...p, step: STEP, mx: P[0] + (p.x - P[0]) * 0.45 + (hash(i, seed + 21) - 0.5) * 520, my: Math.min(P[1], p.y) - 180 + (hash(i, seed + 22) - 0.5) * 480,
    sx: P[0] + (hash(i, seed + 23) - 0.5) * 30, sy: P[1] + (hash(i, seed + 24) - 0.5) * 60, lag: ((p.x - xa) / Math.max(1, xb - xa)) * 0.14 + hash(i, seed + 25) * 0.04 }));
};

export default {
  id: 'burst-claim', kind: 'scene',
  fits: ['climax', 'claim'],
  surface: ['canvas'],
  beats: { min: 5, max: 9 },
  needs: { motions: ['collapse-burst'], props: ['anchor-mark'], roles: ['ground', 'ink', 'dim', 'accent'], type: ['display'] },
  slots: { lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 3, chars: 15 }, zh: { chars: 8 } } } } },
  roles: ['ground', 'ink', 'dim', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], from: 'grid', fromGround: 'ink', dot: 'round', seed: 7 }),
  plan(s, ctx) {
    const read = (readTime((s.lines || []).join(' '), ctx.lang) * ctx.bpm) / 60, beats = clamp(Math.ceil(COLLAPSE + LAND + Math.max(2, read) + 0.5), 5, 9);
    return { beats, reads: [{ text: (s.lines || []).join(' '), lang: ctx.lang }], cues: [{ beat: 0, kind: 'turn' }, { beat: COLLAPSE, kind: 'hit' }, { beat: COLLAPSE + LAND, kind: 'land' }],
      motion: 'collapse into the anchor; burst onto the claim', settled: COLLAPSE + LAND + 0.25, peakAt: COLLAPSE, pause: beats - COLLAPSE - LAND - 0.25 };
  },
  validate(s) { return (s.lines || []).length ? [] : ['lines: one or two']; },
  async prepare(s, c) { await loadFonts(c.lang); return { G: markGeo() }; },
  paint(ctx, u, s, c, D) {
    const C = s.colors, L = c.lang, bpm = c.bpm, t = secs(u, bpm), wc = worldColors(C, 'paper'), b = secs(COLLAPSE, bpm), t1 = secs(0.5, bpm);
    ground(ctx, wc);
    if (!D.T) { D.T = layout(ctx, s, L, bpm); D.cells = cellsOf(D.T, s.seed ?? 7); }
    if (t < t1) { // the whole last world shrinks into the anchor
      const k = 1 - Math.pow(clamp(t / t1), 2.5), fw = worldColors(C, s.fromGround);
      ctx.save(); ctx.translate(P[0], P[1]); ctx.scale(k, k); ctx.translate(-P[0], -P[1]);
      ctx.fillStyle = fw.ground; ctx.fillRect(0, 0, W, H);
      if (s.from !== 'none') drawField(ctx, fieldTone(s.from, 0, { seed: s.seed }), fw.ink, { pitch: DEF.pitch, shape: s.dot });
      ctx.restore();
    }
    if (t >= b) { // the burst: dots from the anchor condense onto the claim's letters
      const path = new Path2D(), span = secs(LAND, bpm) - 0.2;
      for (const q of D.cells) {
        const e = cubicInOut(clamp((t - b - q.lag) / span));
        if (e <= 0) continue;
        const iu = 1 - e, x = iu * iu * q.sx + 2 * iu * e * q.mx + e * e * q.x, y = iu * iu * q.sy + 2 * iu * e * q.my + e * e * q.y, r = lerp(2.4, q.step * 0.72, e);
        path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = wc.ink; ctx.fill(path);
      const ru = clamp((t - b) / 0.42);
      if (ru < 1) { ctx.save(); ctx.strokeStyle = wc.ink; ctx.lineWidth = 12 * Math.pow(1 - ru, 1.5); ctx.beginPath(); ctx.arc(P[0], P[1], 40 + 1500 * expOut(ru), 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    }
    for (const e of D.T) riseText(ctx, e, t, wc);
    // anticipation: it squashes, holding still; then it strikes
    const sq = t >= t1 && t < b ? 0.1 * expIn(clamp((t - t1) / (b - t1))) : t >= b ? -0.06 * Math.exp(-(t - b) / 0.08) : 0;
    drawAnchor(ctx, D.G, P, D.G.ZA, C, { sq, shape: s.dot });
  },
  track() { return [P]; },
};

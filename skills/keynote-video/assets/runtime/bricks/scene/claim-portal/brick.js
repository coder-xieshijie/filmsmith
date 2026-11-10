// claim-portal — the film's one claim and the way out of it: one or two lines in the slam face at the name's width
// (260 px, floor 160), ink on paper with the accent full stop, landing whole on the hit and held still for the read;
// the next scene waits inside the counter of one of its glyphs from the first frame; 0.3 s before the push the other
// glyphs and the stop rise out through their line masks 8 ms apart, then the camera pushes through the counter over
// 1.5 beats (runtime counter-portal, parallax 0.55), the strokes leaving the frame on the last beat.
// From the ink template's `claim` (assets/templates/ink/film.js layoutScenes claim, paintClaim, drawClaim, the
// counter-portal hand-off; timing.rules.js portalClearSec .3, portalBeats 1.5, portalLead 1.8). The landing shock (the
// whiteout's blur, zoom and channel shift) belongs to runtime whiteout-slam, the transition into this scene.
// The portal glyph: English, the first 0 O Q D (the template's PORTAL_GLYPHS). Chinese (zhRedesigns): a Latin one if
// the claim has it; else the Han character with the largest closed counter (口, 日, 回, 四 …, found by flood-filling
// the rendered glyph); else the full stop becomes the Chinese stop 。, a ring the camera pushes through.
// `then` is the far side: the next scene's opening frame, a painter (ctx) => void, or a wordmark { text } drawn as the
// closing card's at rest; `thenGround` its ground role.
import { canvasOf, measure, text } from '../../../handoffs/util.js';
import { createBrick } from '../../index.js';
import { graphemes, isCJK } from '../../lang.js';
import { X, L1, L2, ONE, MAXW, secs, word, fill, grain, D as DF, disp, clamp, groundHex } from '../../look/paper-slam/kit.js';
import { readTime } from '../../lang.js';

const LATIN = '0OQD';
const DEFAULT = { en: { lines: ['It was', '7f0c2d1'], then: { text: 'cleave' } }, zh: { lines: ['就是它', '7f0c2d1'], then: { text: 'cleave' } } };
// the largest closed counter of a glyph, as [fx, fy] of its ink box and its area share; null when none is open enough
export const closedCounter = (ch, f) => {
  const S = 240, ff = { ...f, size: S, spacing: 0 }, c = canvasOf(S * 2, S * 2), g = c.getContext('2d', { willReadFrequently: true });
  text(g, ch, S * 0.5, S * 1.4, ff, { color: '#000' });
  const m = measure(g, ch, ff), A = g.getImageData(0, 0, S * 2, S * 2).data, N = S * 2;
  const x0 = Math.max(0, Math.floor(S * 0.5 - m.actualBoundingBoxLeft)), x1 = Math.min(N - 1, Math.ceil(S * 0.5 + m.actualBoundingBoxRight));
  const y0 = Math.max(0, Math.floor(S * 1.4 - m.actualBoundingBoxAscent)), y1 = Math.min(N - 1, Math.ceil(S * 1.4 + m.actualBoundingBoxDescent));
  const ink = (i) => A[i * 4 + 3] >= 128, seen = new Uint8Array(N * N), q = [];
  const flood = (i0) => { const px = []; q.length = 0; q.push(i0); seen[i0] = 1; while (q.length) { const i = q.pop(); px.push(i); const x = i % N, y = (i / N) | 0; for (const j of [x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1, y > 0 ? i - N : -1, y < N - 1 ? i + N : -1]) if (j >= 0 && !seen[j] && !ink(j)) { seen[j] = 1; q.push(j); } } return px; };
  flood(0);
  let best = null;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * N + x; if (!seen[i] && !ink(i)) { const px = flood(i); if (!best || px.length > best.length) best = px; } }
  const box = (x1 - x0) * (y1 - y0);
  if (!best || best.length < box * 0.03) return null;
  let sx = 0, sy = 0; for (const i of best) { sx += i % N; sy += (i / N) | 0; }
  let cx = sx / best.length, cy = sy / best.length, near = best[0], d = 1e9;
  for (const i of best) { const dd = (i % N - cx) ** 2 + (((i / N) | 0) - cy) ** 2; if (dd < d) { d = dd; near = i; } }
  cx = near % N; cy = (near / N) | 0;
  return { at: [(cx - x0) / (x1 - x0), (cy - y0) / (y1 - y0)], share: best.length / box };
};
const pick = (lines, f, lang) => {
  for (let li = 0; li < lines.length; li++) { const g = graphemes(lines[li]); const k = g.findIndex((ch) => LATIN.includes(ch)); if (k >= 0) return { li, k, ch: g[k], at: [0.5, 0.5] }; }
  if (lang !== 'zh') return null;
  let best = null;
  lines.forEach((l, li) => graphemes(l).forEach((ch, k) => { if (!isCJK(ch)) return; const cc = closedCounter(ch, f); if (cc && (!best || cc.share > best.share)) best = { li, k, ch, at: cc.at, share: cc.share }; }));
  return best;
};
export default {
  id: 'claim-portal', kind: 'scene',
  fits: ['claim', 'climax'],
  surface: ['canvas'],
  beats: { min: 5, max: 10 },
  needs: { motions: ['counter-portal', 'whiteout-slam'], props: ['ink-dot'], roles: ['ground', 'ink', 'accent'], type: ['display'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 4, chars: 12 }, zh: { chars: 7 } } } },
    then: { type: 'object', optional: true },
  },
  roles: ['ground', 'ink', 'accent'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], thenGround: 'paper', seed: 20261018 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, need = 0.45 + readTime(s.lines.join(' '), ctx.lang) + 0.3 + 1.8 * B;
    return { beats: clamp(Math.ceil(need / B - 1e-9), 5, 10), reads: [{ text: s.lines.join(' '), lang: ctx.lang }], cues: [{ beat: 0, kind: 'hit' }], motion: 'counter-portal', settled: 0.5, peakAt: 0, pause: 2, lead: 0 };
  },
  validate(s) { const n = (s.lines || []).length; return n < 1 || n > 2 ? ['lines: 1 or 2'] : []; },
  async prepare(s, c) {
    const cv = canvasOf(8, 8).getContext('2d'), L = c.lang, B = 60 / c.bpm, beats = this.plan(s, c).beats;
    const lines = s.lines.map((l) => disp(l, L)), n = lines.length;
    const fOf = (z) => DF(z, L, 'normal', 'mark');
    let z = 260; while (z > 160 && !lines.every((l, k) => measure(cv, l, fOf(z)).width + (k === n - 1 ? z * 0.174 : 0) <= MAXW)) z -= 2;
    const f = fOf(z), ys = n === 1 ? [ONE] : [L1, L2], r = z * 0.062, ws = lines.map((l) => measure(cv, l, f).width);
    const stop = { x: X + ws[n - 1] + z * 0.05 + r, y: ys[n - 1] - r };
    let P = pick(lines, f, L), ring = false;
    if (!P) { ring = true; P = { li: n - 1, k: graphemes(lines[n - 1]).length, ch: '。', at: [0.5, 0.5] }; }
    const glyphs = [];
    lines.forEach((l, li) => graphemes(l).forEach((ch, k) => { if (/\s/.test(ch)) return; glyphs.push({ ch, li, k, x: X + measure(cv, graphemes(l).slice(0, k).join(''), f).width, portal: !ring && li === P.li && k === P.k }); }));
    const px = ring ? X + ws[n - 1] + z * 0.02 : glyphs.find((g) => g.portal).x;
    const end = beats * B, clearAt = end - 1.8 * B - 0.3, D = { z, f, ys, r, stop, glyphs, B, end, clearAt, ring, now: 0 };
    const C = s.colors, then = s.then;
    D.portal = await createBrick('counter-portal', {
      glyph: { text: P.ch, counter: 0, counterAt: P.at }, x: px, baseline: ys[P.li], font: f, parallax: 0.55,
      colors: { ground: C.ground, ink: C.ink, portal: groundHex(C, s.thenGround || 'paper') },
      from: (g) => paintClaim(g, s, D, D.now),
      to: (g) => { if (typeof then === 'function') then(g); else if (then?.text) word(g, { text: then.text, raw: true, x: 960, align: 'center', y: 590, size: 210, stretch: 'normal', kind: 'mark', lang: L, mode: 'rise', tIn: -10, outMode: 'none', color: C.ink, mis: false }, 0, C); },
    }, { lang: L });
    return D;
  },
  paint(ctx, u, s, c, D) {
    const t = secs(u, c.bpm);
    D.now = t;
    fill(ctx, s.colors.ground);
    D.portal.draw(ctx, clamp((t - (D.end - 1.8 * D.B)) / (1.5 * D.B)), { dur: 1.5 * D.B });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    grain(ctx, s.seed || 1);
  },
  track(u, s, c, D) { return [[960, 540]]; },
  blur() { return false; },
};
// the claim at rest without its ground and without the portal glyph (counter-portal draws that one); into the push
// the other glyphs and the stop rise out through their line masks, 8 ms apart
function paintClaim(ctx, s, D, t) {
  const C = s.colors, z = D.z; let order = 0;
  const out = () => { const u = clamp((t - D.clearAt - order++ * 0.008) / 0.17); return u >= 1 ? null : -z * 1.25 * u * u; };
  for (const g of D.glyphs) {
    if (g.portal) continue;
    const dy = out(); if (dy == null) continue;
    const y = D.ys[g.li];
    ctx.save(); if (dy) { ctx.beginPath(); ctx.rect(0, y - z, 1920, z * 1.24); ctx.clip(); }
    text(ctx, g.ch, g.x, y + dy, D.f, { color: C.ink }); ctx.restore();
  }
  if (D.ring) return;
  const dy = out(); if (dy == null) return;
  const y = D.ys[D.ys.length - 1];
  ctx.save(); if (dy) { ctx.beginPath(); ctx.rect(0, y - z, 1920, z * 1.24); ctx.clip(); }
  ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(D.stop.x, D.stop.y + dy, D.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

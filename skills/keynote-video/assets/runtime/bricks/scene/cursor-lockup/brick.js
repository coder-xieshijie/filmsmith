// cursor-lockup — the lock-up out of a cursor: the horizon line (after slit-tagline) shrinks to a block cursor at its
// centre over 0.9 beat, the name types out of the cursor leftwards (last letter first, 30 cps) with an RGB hit, the
// chips slide out of it rightwards one per half beat from beat 1, the cursor drops a line and types the URL at
// 45 cps (held ≥ 3 s), one line of sub lands under it, the chips light on the last downbeat one per half beat, and
// the frame dims in the last 0.4 s unless `dim` is false. A horizon glow sits under it all.
// From the phosphor template: film.js BUILD.end, endCursor, lightChips, fx.js horizon, events.js TIMING.end (morph
// 0.9 beat, chips B + 0.5 B·i, URL 1.5 B at 45 cps, sub on the half beat after the URL is read and ≥ 4 B, ticks on the
// last bar line, dim D − 0.4), index.html .endName .ec .endUrl .endSub .morphLine. Chinese: chips and sub as
// written (28 px floor for the chips' Latin-sized 32 px is kept); the name and URL are usually Latin.
import { E, F, W, at, rect, rr, display, chip, ground, post, hud, palOf, reader, half, SEEN, rgba, zh, canvasOf, horizon, graphemes, clamp, blinkOn, fit, icon, hudAt } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { name: 'reseed', chips: ['RUN', 'REPLAY', 'BISECT', 'VERIFY'], url: 'github.com/example-org/reseed', sub: 'MIT · jest, vitest and pytest' },
  zh: { name: 'reseed', chips: ['记录', '重放', '二分', '验证'], url: 'github.com/example-org/reseed', sub: 'MIT · 支持 jest、vitest 和 pytest' },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), url = String(s.url || '');
  const T = { morph: 0, morphDur: 0.9 * B, url: 1.5 * B, cps: 45 };
  rd.move(0, 0.9 * B); rd.move(0.05 * B, 0.6);
  T.chips = (s.chips || []).slice(0, 4).map((c, i) => { const t = rd.move(B + i * 0.5 * B, 0.3); rd.glance(t + SEEN, c); return t; });
  const typed = T.url + graphemes(url).length / T.cps;
  rd.move(T.url, typed - T.url); rd.at(typed + 3);
  const urlRead = Math.max(typed, rd.primary(T.url + SEEN, url, 'en'));
  T.sub = rd.move(half(Math.max(4 * B, urlRead), B), 0.5);
  if (s.sub) rd.primary(T.sub + SEEN, s.sub);
  T.done = rd.done;
  T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  // the last downbeat: a whole bar before the end (the closing scene ends on a bar line)
  T.final = Math.max(0, T.beats - 4) * B;
  T.ticks = T.final > T.sub + 0.5 ? T.chips.map((_, i) => T.final + i * 0.5 * B) : [];
  T.dim = T.beats * B - 0.4;
  return T;
};

export default {
  id: 'cursor-lockup', kind: 'scene',
  fits: ['lockup'],
  surface: ['canvas'],
  beats: { min: 8, max: 20 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'panel', 'ink', 'muted', 'line', 'accent', 'hi', 'onAccent', 'titleHi', 'titleLo'], type: ['display', 'text', 'mono'] },
  slots: {
    name: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 12 }, zh: { chars: 6 } } },
    chips: { type: 'list', count: [0, 4], of: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } } },
    url: { type: 'code', tier: 'primary', limits: { en: { chars: 40 }, zh: { chars: 40 } } },
    sub: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 8, chars: 48 }, zh: { chars: 20 } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'panel', 'ink', 'muted', 'line', 'accent', 'hi', 'onAccent', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], icon: 'github', fromLine: true, horizonY: 521.25, dim: true, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [{ text: s.url, lang: ctx.lang }, ...(s.sub ? [{ text: s.sub, lang: ctx.lang }] : [])],
      cues: [{ beat: 0, kind: 'stamp' }, ...T.chips.map((x) => ({ beat: b(x), kind: 'accent' })), { beat: b(T.url), kind: 'accent' }, ...T.ticks.map((x, i) => ({ beat: b(x), kind: i ? 'accent' : 'end' }))],
      motion: 'the line shrinks into a cursor; the name and chips type out of it; the URL types a line below; the chips light on the last downbeat',
      settled: b(T.sub) + 1, peakAt: 0, shots: [{ beat: 0, kind: 'lockup' }],
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm, P = palOf(s.colors, s.palette), T = timing(s, B, L, s.minBeats || 0);
    const hz = canvasOf(960, 540); horizon(hz, P)();
    return { L, B, P, T, hz };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, hy = s.fromLine ? s.horizonY ?? 540 : 540, hx = 960, GAP = 34, cw = 64 * 0.43, ch = 64 * 0.93;
    ground(ctx, P, t, { bpm: c.bpm });
    ctx.save(); ctx.globalAlpha = 0.85 * clamp(t / 0.6); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(D.hz, 0, 0, 1920, 1080); ctx.restore();
    const out0 = s.fromLine ? T.morph + T.morphDur : 0;
    // the line shrinking into the cursor
    if (s.fromLine && t < out0) {
      const e = E.expoInOut(t / T.morphDur), x = lerp(0, hx - cw / 2, e), y = lerp(hy - 1.5, hy - ch / 2, e), w = lerp(1920, cw, e), h = lerp(3, ch, e);
      ctx.save(); ctx.shadowColor = rgba(P.accent, 0.9); ctx.shadowBlur = 18; rect(ctx, x, y, w, h, P.hi); ctx.restore();
    }
    // the name, right-aligned to the cursor's left, typed out of it leftwards
    const name = String(s.name || ''), g = graphemes(name), nmax = hx - cw / 2 - GAP - 110;
    let fN = { ...F('display', L, 150, 800), spacing: -0.045 * 150 };
    fN = fit(ctx, name, fN, nmax, 108);
    const nw = W(ctx, name, fN), nx = hx - cw / 2 - GAP - nw;
    const shown = clamp(Math.floor((t - out0) * 30) + 1, 0, g.length), hit = out0 + g.length / 30;
    if (t >= out0 && shown > 0) {
      const tail = g.slice(g.length - shown).join(''), head = g.slice(0, g.length - shown).join('');
      const split = t >= hit && t < hit + 0.3 ? 14 * (1 - (t - hit) / 0.3) : 0;
      display(ctx, tail, nx + W(ctx, head, fN), hy - fN.size * 0.5 - fN.size * 0.04, fN, P, { screen: s.screen, split });
    }
    // the chips, out of the cursor rightwards; lit on the last downbeat
    let cx = hx + cw / 2 + GAP;
    (s.chips || []).slice(0, 4).forEach((label, i) => {
      const t0 = Math.max(T.chips[i], out0), e = E.expoOut((t - t0) / 0.3), lit = T.ticks[i] != null && t >= T.ticks[i];
      const lk = lit ? 1 - E.back(2.5)(clamp((t - T.ticks[i]) / 0.4)) : 0;
      const fs = zh(L) ? 32 : 32, h = fs + 32;
      ctx.save(); ctx.translate(-24 * (1 - e), 0);
      if (lit) { ctx.translate(cx, hy); ctx.scale(1 + 0.08 * lk, 1 + 0.08 * lk); ctx.translate(-cx, -hy); }
      const w = chip(ctx, P, L, label, cx, hy - h / 2, { size: fs, on: lit, lit: lit ? 0.3 + 0.7 * lk : 0, alpha: t >= t0 ? e : 0 });
      ctx.restore();
      cx += w + 20;
    });
    // the URL a line below, typed at the cursor; then the sub
    const url = String(s.url || ''), ug = graphemes(url);
    let fU = F('mono', L, 64, 500); fU = fit(ctx, url, fU, 1760, 56);
    const ic = s.icon && s.icon !== 'none' ? 64 + 22 : 0, uw = W(ctx, url, fU), ux = 960 - (uw + ic) / 2 + ic, uy = hy + 128 + (90 - fU.size) / 2;
    if (ic) icon(ctx, P, s.icon, ux - ic, hy + 128 + 13, 64, clamp((t - T.url) / 0.15));
    const n = t < T.url ? 0 : clamp(Math.floor((t - T.url) * T.cps) + 1, 0, ug.length);
    if (n) at(ctx, ug.slice(0, n).join(''), ux, uy, fU, P.ink);
    if (s.sub && t >= T.sub) { const e = E.p3Out((t - T.sub) / 0.5), fS = fit(ctx, s.sub, F('text', L, 32, 400), 1700, 28); at(ctx, s.sub, 960, hy + 128 + 120 + 12 * (1 - e), fS, P.muted, { align: 'center', alpha: e }); }
    // the cursor: at the hinge until the URL starts, then after the last typed character
    if (t >= out0 && blinkOn(t, out0, B)) {
      if (t < T.url) rect(ctx, hx - cw / 2, hy - ch / 2, cw, ch, P.ink);
      else { const k = fU.size, x = n ? ux + W(ctx, ug.slice(0, n).join(''), fU) + 3 : ux; rect(ctx, x, uy + k * 0.04, k * 0.43, k * 0.93, P.ink); }
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen, dim: s.dim === false ? 0 : E.p1In((t - T.dim) / 0.4) });
  },
  track() { return [[960, 540]]; },
};
const lerp = (a, b, u) => a + (b - a) * u;

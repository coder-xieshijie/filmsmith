// slit-tagline — the closing claim: a grid tunnel rushes for four beats (pushing in 1.25), its floor and ceiling fold
// onto the horizon in the last beat, the line opens as a slit on the bar line, and the claim's words land in it one
// per half beat (the stressed word bigger, springing back); once complete the claim is read in a pause, and the slit
// closes back into the line half a beat before the end (the lock-up turns the line into its cursor).
// From the phosphor template: film.js BUILD['horizon-tagline'] and tunnelShot, fx.js tunnel, events.js
// TIMING['horizon-tagline'] (tunnel 0–4 beats, fold 3.1–4, open 4 over 0.75 beat, words every half beat from 4.5,
// close at the end − 0.5 beat in 0.6 of the opening), index.html .slit. Chinese: a word is a word of the Chinese
// word segmenter (punctuation stays with the word before it), and the stressed word is marked in the copy (`*…*`),
// never found by matching Latin word characters.
import { E, F, W, rect, display, ground, post, hud, palOf, reader, SEEN, rgba, zh, canvasOf, tunnel, marks, plain, graphemes, clamp, hudAt } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { lines: ['Same seed,', 'same *failure*.'] },
  zh: { lines: ['同一个种子，', '同一个*失败*。'] },
};
const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('zh', { granularity: 'word' }) : null;
// the pop units of a line: [{ t, em }] — Latin by spaces, Chinese by the segmenter's words
export const unitsOf = (line, L) => {
  const out = [];
  for (const m of marks(line)) {
    if (m.em) { out.push({ t: m.t, em: true }); continue; }
    // Latin: by spaces; a part with no space before it (the period after a stressed word) joins the word before
    if (!zh(L)) { m.t.split(' ').forEach((w, i) => { if (!w) return; if (i === 0 && out.length && !/^\s/.test(m.t)) out[out.length - 1].t += w; else out.push({ t: w, em: false }); }); continue; }
    const parts = SEG ? Array.from(SEG.segment(m.t), (x) => x.segment) : graphemes(m.t);
    for (const p of parts) {
      if (!p.trim()) continue;
      if (out.length && !/[\p{L}\p{N}]/u.test(p)) out[out.length - 1].t += p; else out.push({ t: p, em: false });
    }
  }
  return out;
};
const timing = (s, B, L, beats = 0) => {
  const rd = reader(L), lines = (s.lines || []).slice(0, 2), u1 = unitsOf(lines[0] || '', L), u2 = unitsOf(lines[1] || '', L);
  const T = { tunnel: [0, 4 * B], flat: [3.1 * B, 4 * B], open: 4 * B, openDur: 0.75 * B };
  T.words = u1.map((_, i) => 4.5 * B + i * 0.5 * B);
  const l2 = (T.words[T.words.length - 1] ?? 4 * B) + 0.5 * B;
  T.words.push(...u2.map((_, i) => l2 + i * 0.5 * B));
  const last = T.words[T.words.length - 1] ?? T.open;
  rd.move(0, 4 * B); rd.at(last + 0.5 * B);
  rd.primary(last + SEEN, lines.map(plain).join(zh(L) ? '' : ' '));
  T.done = rd.done; T.closeDur = 0.6 * T.openDur;
  T.beats = Math.max(8, Math.ceil(T.done / B + 0.5 - 1e-6), beats);
  T.close = T.beats * B - 0.5 * B;
  T.units = [u1, u2];
  return T;
};

export default {
  id: 'slit-tagline', kind: 'scene',
  fits: ['climax'],
  surface: ['canvas'],
  beats: { min: 8, max: 16 },
  needs: { motions: [], props: ['terminal-hud'], roles: ['ground', 'accent', 'hi', 'titleHi', 'titleLo'], type: ['display'] },
  slots: {
    lines: { type: 'list', count: [1, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 22 }, zh: { chars: 9 } } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'accent', 'hi', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice', hud: null, seed: 1, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: (s.lines || []).map((text) => ({ text: plain(text), lang: ctx.lang, claim: true })),
      cues: [{ beat: 0, kind: 'turn' }, { beat: b(T.open), kind: 'claim' }, { beat: b(T.open), kind: 'land' }, ...T.words.map((x) => ({ beat: b(x), kind: 'accent' })), { beat: b(T.close), kind: 'turn' }],
      motion: 'the grid tunnel rushes and folds into the horizon; the line opens as a slit; the claim lands word by word; the slit closes into the line',
      settled: b(T.words[T.words.length - 1] ?? T.open) + 0.5, peakAt: b(T.open), pause: [b(T.words[T.words.length - 1] ?? T.open) + 1, b(T.close)],
      shots: [{ beat: 0, kind: 'tunnel' }, { beat: b(T.open), kind: 'slit' }],
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm, P = palOf(s.colors, s.palette), T = timing(s, B, L, s.minBeats || 0);
    const cv = canvasOf(2400, 1350), draw = tunnel(cv, P, (s.seed | 0) + 7301);
    return { L, B, P, T, cv, draw, cy: 540 + (525 - 540) * 1.25 };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, [a, z] = T.tunnel;
    ground(ctx, P, t, { bpm: c.bpm });
    // the tunnel shot: fades in, pushes in 1.25 (power2.in), folds flat, fades as the slit takes the line
    if (t <= z + 0.1) {
      const f = clamp((t - T.flat[0]) / (T.flat[1] - T.flat[0])), op = clamp((t - a) / 0.2) * (1 - clamp((t - (z - 0.08)) / 0.1)), sc = 1 + 0.25 * E.p2In((t - a) / (z - a));
      if (op > 0) {
        D.draw(Math.max(0, t - a), f * f * (3 - 2 * f));
        ctx.save(); ctx.globalAlpha = op; ctx.translate(960, 540); ctx.scale(sc, sc); ctx.translate(-960, -540); ctx.drawImage(D.cv, 0, 0, 1920, 1080); ctx.restore();
      }
    }
    // the slit
    if (t >= T.open - 0.03) {
      const fs = (px) => F('display', L, px, 800), U = T.units, lines = U.map((us) => us.map((x) => x.t).join(zh(L) ? '' : ' ')).filter(Boolean);
      let px = 150;
      for (const ln of lines) { let p = 150; const f = { ...fs(p), spacing: zh(L) ? 0 : -0.045 * p }; while (p > 90 && W(ctx, ln, { ...f, size: p, spacing: zh(L) ? 0 : -0.045 * p }) > 1600) p -= 2; px = Math.min(px, p); }
      const f = { ...fs(px), spacing: zh(L) ? 0 : -0.045 * px }, lh = px * 1.0, th = lines.length * lh + 20, H = th + 130;
      const hOpen = E.p3Out((t - T.open) / T.openDur), hClose = 1 - E.p3In((t - T.close) / T.closeDur), h = H * Math.min(hOpen, t >= T.close ? hClose : 1);
      const top = D.cy - h / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, 1920, h); ctx.clip();
      let k = 0;
      U.forEach((us, li) => {
        if (!us.length) return;
        const sep = zh(L) ? '' : ' ', ws = us.map((x) => W(ctx, x.t, x.em ? { ...f, size: px * 1.12, spacing: f.spacing * 1.12 } : f)), sw = zh(L) ? 0 : W(ctx, ' ', f);
        let x = 960 - (ws.reduce((p, q) => p + q, 0) + sw * (us.length - 1)) / 2;
        const y = D.cy - th / 2 + 10 + li * lh;
        us.forEach((w, i) => {
          const t0 = T.words[k++] ?? T.open, dur = w.em ? 0.5 : 0.35, e = clamp((t - t0) / dur), ease = w.em ? E.back(1.8)(e) : E.expoOut(e);
          if (t >= t0) {
            const sc = (w.em ? 1.5 : 1.2) + ((1) - (w.em ? 1.5 : 1.2)) * ease, ff = w.em ? { ...f, size: px * 1.12, spacing: f.spacing * 1.12 } : f;
            ctx.save(); ctx.translate(x + ws[i] / 2, y + px * 0.5 + 30 * (1 - ease)); ctx.scale(sc, sc); ctx.translate(-(x + ws[i] / 2), -(y + px * 0.5));
            display(ctx, w.t, x, y - (w.em ? px * 0.08 : 0), ff, P, { screen: s.screen, alpha: Math.min(1, e * 1.6) });
            ctx.restore();
          }
          x += ws[i] + sw;
        });
      });
      ctx.restore();
      // the two lines that hold the slit open
      ctx.save(); ctx.shadowColor = rgba(P.accent, 0.9); ctx.shadowBlur = 18;
      rect(ctx, 0, top - 1.5, 1920, 3, P.hi); rect(ctx, 0, top + h - 1.5, 1920, 3, P.hi);
      ctx.shadowColor = rgba(P.accent, 0.5); ctx.shadowBlur = 50; rect(ctx, 0, top - 1.5, 1920, 3, P.hi); rect(ctx, 0, top + h - 1.5, 1920, 3, P.hi);
      ctx.restore();
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

// chapter-card — a chapter turn: the number (01 / 03) above, the chapter title slams in at 150 px in two decoded
// halves, the card line (the chapter's tool) types under it in about half a second; on the first half beat after it
// has all been read (at least two beats) the title flies to the page header at (110, 92) at 0.56 scale, motion-
// blurred along its path, while the number and the card line fade, and the note slides in under the header. On a
// long card the number and the card line light halfway (muted → ink). The page scene that follows draws the header
// in place (its `head`, `enter: false`).
// From the phosphor template: film.js pageHeader (card branch, the flight and its motion blur), events.js card()
// (title 0.08 / 0.34 beat, card line at 0.2 beat at 40–120 cps, flight on the half beat after reading ≥ chapter.beats,
// 0.8 beat expo.inOut), index.html .ph .card-num .card-sub .psub. Chinese: the halves are given (or split at the
// break nearest the middle), no capitals, untracked.
import { E, F, W, at, display, decodeAt, typedAt, ground, post, hud, hudAt, palOf, reader, half, SEEN, zh, clamp, graphemes, headFont, HEAD, halves } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { no: 1, of: 3, title: ['CATCH', 'THE RUN'], card: 'reseed run // every seed kept', note: '// 50 runs, one record each' },
  zh: { no: 1, of: 3, title: ['抓住', '这次运行'], card: 'reseed run // 每个种子都留下', note: '// 50 次运行，每次一份记录' },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), card = String(s.card || '');
  rd.at(0.34 * B + 0.45);
  rd.primary(0.08 * B + 0.4, [s.title].flat().join(' '));
  const cardCps = clamp(graphemes(card).length / 0.5, 40, 120), cardType = graphemes(card).length / cardCps;
  if (card) { rd.glance(0.2 * B + cardType, card); rd.move(0.2 * B, Math.max(0.4, cardType)); }
  rd.move(0, 0.5);
  const cb = Math.max((s.cardBeats ?? 2) * B, half(rd.done, B));
  const settled = Math.max(0.34 * B + 0.45, 0.2 * B + Math.max(0.4, cardType));
  const light = cb - settled > 1.8 * B ? settled + (cb - settled) / 2 : null;
  const tail = Math.max(0.8 * B, 0.45 * B + 0.35), beats = Math.max(Math.ceil((cb + tail) / B - 1e-6), minBeats), flight = Math.max(cb, beats * B - tail);
  return { cb, cardCps, light, flight, flightDur: 0.8 * B, settledAt: flight + tail, beats };
};

export default {
  id: 'chapter-card', kind: 'scene',
  fits: ['turn'],
  surface: ['canvas'],
  beats: { min: 3, max: 6 },
  needs: { motions: ['glyph-decode'], props: ['terminal-hud'], roles: ['ground', 'ink', 'muted', 'titleHi', 'titleLo'], type: ['display', 'mono'] },
  slots: {
    title: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } },
    card: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } },
    note: { type: 'code', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 24 } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'ink', 'muted', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], cardBeats: 2, screen: 'crt', palette: 'ice', hud: null, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [{ text: [s.title].flat().join(' '), lang: ctx.lang }],
      cues: [{ beat: 0, kind: 'stamp' }, { beat: b(T.flight), kind: 'turn' }],
      motion: 'the title slams in decoded; the card line types; the title flies to the page header', settled: b(T.settledAt), peakAt: 0,
      shots: [{ beat: 0, kind: 'card' }],
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm;
    return { L, B, P: palOf(s.colors, s.palette), T: timing(s, B, L, s.minBeats || 0), title: Array.isArray(s.title) ? s.title.map(String) : halves(s.title, L) };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B, f = headFont(L), sep = zh(L) ? '' : ' ', [a, b2] = D.title;
    ground(ctx, P, t, { bpm: c.bpm });
    const w = W(ctx, a + sep + b2, f), hh = f.size * 1.2, cs = Math.min(1, 1700 / w), cx = (1920 - w * cs) / 2, cy = 520 - (hh * cs) / 2;
    const fe = E.expoInOut(clamp((t - T.flight) / T.flightDur)), k0 = cs * (1 + 0.25 * (1 - E.expoOut(t / 0.5)));
    const pos = (e) => ({ x: cx + (HEAD.x - cx) * e, y: cy + (HEAD.y - cy) * e, k: (t < T.flight ? k0 : cs) + (HEAD.scale - cs) * e });
    const draw = (p, alpha) => { ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(p.x, p.y); ctx.scale(p.k, p.k);
      display(ctx, decodeAt(a, t, 0.08 * B, 0.4, 41), 0, 0, f, P, { screen: s.screen }); display(ctx, decodeAt(b2, t, 0.34 * B, 0.45, 42), W(ctx, a + sep, f), 0, f, P, { screen: s.screen }); ctx.restore(); };
    if (t > T.flight && fe < 1) {
      // motion blur along the path: five samples over one frame's travel
      for (let i = -2; i <= 2; i++) { const e = E.expoInOut(clamp((t + i / 150 - T.flight) / T.flightDur)); draw(pos(e), 0.2); }
    } else draw(pos(fe), 1);
    // (the slam scales from the title's top left, as the template's transform-origin 0 0)
    // the number and the card line, fading as the title flies
    const fade = 1 - clamp((t - T.flight) / 0.12), lit = T.light != null && t >= T.light;
    if (fade > 0) {
      const fn = { ...F('mono', L, 32, 400), spacing: 0.3 * 32 };
      at(ctx, `${String(s.no ?? 1).padStart(2, '0')} / ${String(s.of ?? 1).padStart(2, '0')}`, 960, 366, fn, lit ? P.ink : P.muted, { align: 'center', alpha: fade });
      if (s.card && t >= 0.2 * B) at(ctx, typedAt(s.card, t, 0.2 * B, T.cardCps), 960 - W(ctx, s.card, F('mono', L, 32, 400)) / 2, 640, F('mono', L, 32, 400), lit ? P.ink : P.muted, { alpha: fade });
    }
    if (s.note && t >= T.flight + 0.45 * B) { const e = E.p3Out((t - T.flight - 0.45 * B) / 0.35); at(ctx, s.note, 112 - 14 * (1 - e), 192, F('mono', L, zh(L) ? 28 : 25, 400), P.muted, { alpha: e }); }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen });
  },
  track() { return [[960, 540]]; },
};

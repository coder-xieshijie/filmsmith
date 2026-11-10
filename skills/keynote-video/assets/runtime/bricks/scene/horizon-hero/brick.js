// horizon-hero — the claim under the horizon: a hot line draws out from the frame's centre (where the opening's
// point of light was), a scanline sphere is born at that point and rises out of the line (cut by it) as the camera
// pushes in over two bars; the claim decodes under the line in two lines at 108 px (the first with an RGB hit, the
// second with a blinking underscore), a sub lands as soon as the claim is read, then one to three facts.
// From the phosphor template: film.js BUILD.hero (layout, HERO_HZ 540, the sphere's light layer cut at the line),
// fx.js sphere, events.js TIMING.hero (line 1 at 0.27 beat, line 2 as line 1 is read, ≥ 1.12 beats; sub ≥ 2 beats;
// facts every half beat), index.html .hero-wrap .hero-hz .hero-sub .kv. Chinese: decode through the line's own
// characters and the common pool; the sub's [marked] words in ink as written.
import { E, F, W, at, rect, display, decodeAt, ground, post, hud, hudAt, palOf, reader, SEEN, rgba, zh, canvasOf, sphere, clamp, fit, blinkOn, plain } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { lines: ['Every failure,', 'replayed exactly.'], sub: 'Records [seed and order].', facts: [{ key: 'runs', value: 'jest · vitest · pytest' }, { key: 'writes', value: '.reseed/ in the repo' }] },
  zh: { lines: ['每一次失败，', '都能原样重放。'], sub: '记下[种子和顺序]。', facts: [{ key: '支持', value: 'jest · vitest · pytest' }, { key: '写入', value: '仓库里的 .reseed/' }] },
};
const HZ = 540;
const crit = (x, w = 14) => (x <= 0 ? 0 : 1 - (1 + w * x) * Math.exp(-w * x));
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), T = { line1: 0.27 * B };
  rd.move(0, 0.9); rd.move(T.line1, 0.75);
  const read1 = rd.primary(T.line1 + 0.55, s.lines?.[0]);
  T.line2 = Math.max(1.12 * B, read1 - 0.6);
  rd.move(T.line2, 0.6);
  const claim = Math.max(T.line2 + 0.6, rd.primary(T.line2 + 0.6, s.lines?.[1]));
  T.sub = Math.max(2 * B, claim - SEEN);
  rd.move(T.sub, 0.5);
  rd.primary(T.sub + SEEN, plain(String(s.sub || '').replace(/[[\]]/g, '')));
  T.facts = (s.facts || []).slice(0, 3).map((f, i) => { const t = rd.move(T.sub + 0.5 * B + i * 0.5 * B, 0.3); rd.glance(t + SEEN, `${f.key} ${f.value}`); return t; });
  T.done = rd.done;
  T.beats = Math.max(Math.ceil(T.done / B - 1e-6), minBeats);
  return T;
};

export default {
  id: 'horizon-hero', kind: 'scene',
  fits: ['claim'],
  surface: ['canvas'],
  beats: { min: 5, max: 14 },
  needs: { motions: ['glyph-decode'], props: ['terminal-hud'], roles: ['ground', 'ink', 'muted', 'accent', 'hi', 'titleHi', 'titleLo'], type: ['display', 'text', 'mono'] },
  slots: {
    lines: { type: 'list', count: [2, 2], of: { type: 'text', tier: 'primary', claim: true, limits: { en: { words: 4, chars: 22 }, zh: { chars: 9 } } } },
    sub: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 5, chars: 40 }, zh: { chars: 16 } } },
    facts: { type: 'list', count: [0, 3], of: { key: { type: 'text', tier: 'glance', limits: { en: { words: 1, chars: 8 }, zh: { chars: 3 } } }, value: { type: 'code', tier: 'glance', limits: { en: { words: 5, chars: 26 }, zh: { chars: 16 } } } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'ink', 'muted', 'dim', 'accent', 'hi', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice', hud: null, seed: 11, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [...(s.lines || []).map((text) => ({ text, lang: ctx.lang, claim: true })), ...(s.sub ? [{ text: s.sub, lang: ctx.lang }] : [])],
      cues: [{ beat: 0, kind: 'claim' }, { beat: 0, kind: 'stamp' }, { beat: b(T.line1), kind: 'accent' }, { beat: b(T.line2), kind: 'accent' }, { beat: b(T.sub), kind: 'accent' }, ...T.facts.map((x) => ({ beat: b(x), kind: 'accent' }))],
      motion: 'the horizon draws out of the point; the sphere rises out of it; the claim decodes under it; the sub and facts land', settled: b(T.facts[T.facts.length - 1] ?? T.sub) + 0.6, peakAt: 0,
      shots: [{ beat: 0, kind: 'horizon' }],
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm, P = palOf(s.colors, s.palette), T = timing(s, B, L, s.minBeats || 0);
    const cv = canvasOf(1800, 1013), push = Math.min(T.beats * B, 8 * B), draw = sphere(cv, P, (s.seed | 0) + 5150, { push });
    draw(1, 1); // warm the sphere's canvases once: its first full draw differs from every later one by a level
    return { L, B, P, T, cv, draw, push, mask: canvasOf(1440, 810) };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B;
    ground(ctx, P, t, { bpm: c.bpm });
    // the sphere: a light layer centred on the horizon's centre, masked to a disc, cut by the line
    D.draw(t, crit(t, 7));
    const g = D.mask.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(D.cv, 0, 0, 1440, 810);
    g.globalCompositeOperation = 'destination-in'; const rg = g.createRadialGradient(720, 405, 0, 720, 405, 825); rg.addColorStop(0.34, '#000000'); rg.addColorStop(0.6, rgba('#000000', 0)); g.fillStyle = rg; g.fillRect(0, 0, 1440, 810);
    const sc = D.push > 0.9 && t > 0.9 ? 1 + 0.0128 * (D.push - 0.9) * (1 - (1 - clamp((t - 0.9) / (D.push - 0.9))) ** 2) : 1;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, HZ - 1); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(960, HZ); ctx.scale(sc, sc); ctx.drawImage(D.mask, -720, -405); ctx.restore();
    // the horizon line draws out from the centre
    const lw = 1920 * E.expoOut(t / 0.9);
    ctx.save(); ctx.shadowColor = rgba(P.accent, 0.9); ctx.shadowBlur = 18; rect(ctx, 960 - lw / 2, HZ - 1, lw, 2, P.hi); ctx.shadowColor = rgba(P.accent, 0.5); ctx.shadowBlur = 50; rect(ctx, 960 - lw / 2, HZ - 1, lw, 2, P.hi); ctx.restore();
    // the claim, decoded under the line, centred by its final width
    const [l1, l2] = s.lines || ['', ''];
    let f = { ...F('display', L, 108, 800), spacing: zh(L) ? 0 : -0.045 * 108 };
    f = fit(ctx, W(ctx, l1, f) > W(ctx, l2, f) ? l1 : l2, f, 1700, zh(L) ? 88 : 94);
    const y1 = HZ + 34, y2 = y1 + f.size * 1.065, x1 = Math.round((1920 - W(ctx, l1, f)) / 2), x2 = Math.round((1920 - W(ctx, l2, f)) / 2);
    const hit = t >= T.line1 + 0.55 && t < T.line1 + 0.65 ? 9 : 0;
    display(ctx, decodeAt(l1, t, T.line1, 0.55, 21), x1, y1, f, P, { screen: s.screen, split: hit });
    const d2 = decodeAt(l2, t, T.line2, 0.6, 22);
    display(ctx, d2, x2, y2, f, P, { screen: s.screen });
    if (t >= T.line2 + 0.6 && blinkOn(t, T.line2 + 0.6, B)) display(ctx, '_', x2 + W(ctx, l2, f), y2, f, P, { screen: s.screen });
    // the sub ([marked] words in ink) and the facts
    const subTop = y2 + f.size + 26;
    if (s.sub && t >= T.sub) {
      const e = E.p3Out((t - T.sub) / 0.5), fs = F('text', L, 40, 400), parts = String(s.sub).split(/(\[[^\]]+\])/).filter(Boolean).map((p) => (p.startsWith('[') ? { t: p.slice(1, -1), ink: true } : { t: p, ink: false }));
      let x = 960 - W(ctx, parts.map((p) => p.t).join(''), fs) / 2;
      for (const p of parts) { at(ctx, p.t, x, subTop + 20 * (1 - e), fs, p.ink ? P.ink : P.muted, { alpha: e }); x += W(ctx, p.t, fs); }
    }
    const facts = (s.facts || []).slice(0, 3);
    if (facts.length) {
      const fm = F('mono', L, zh(L) ? 28 : 25, 400), sep = '    ·    ', items = facts.map((x, i) => (i ? sep : '') + x.key + '  ' + x.value), tw = W(ctx, items.join(''), fm);
      let x = 960 - tw / 2; const y = subTop + 60 + 22;
      facts.forEach((fx, i) => {
        const t0 = T.facts[i], e = E.p3Out((t - t0) / 0.3);
        if (t >= t0) {
          if (i) at(ctx, sep, x, y + 10 * (1 - e), fm, P.dim, { alpha: e });
          const xi = x + (i ? W(ctx, sep, fm) : 0);
          at(ctx, fx.key, xi, y + 10 * (1 - e), fm, P.ink, { alpha: e }); at(ctx, '  ' + fx.value, xi + W(ctx, fx.key, fm), y + 10 * (1 - e), fm, P.muted, { alpha: e });
        }
        x += W(ctx, items[i], fm);
      });
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen, flash: 0.5 * Math.exp(-t / 0.2) });
  },
  track() { return [[960, 540]]; },
};

// prompt-boot — the default opening of a phosphor film: a prompt types alone at the frame's centre (40 cps), rises as
// the hook types under it at 150 px, the key word grows 1.14 on a beat while the rest steps back to half, problem
// tags pop in one after another, then everything is pulled into the cursor (far pieces first, blurring), the cursor
// shrinks to a glowing point at the centre, fibres converge on it for two beats and a white flash ends the scene.
// From the phosphor template: film.js BUILD.boot (layout, cursors, the stress word, the collapse), fx.js burst,
// events.js TIMING.boot (line1 0.25 beat at 40 cps; line2 on the half beat once the prompt is read, typed in 1.4
// beats; stress on the beat after; tags as the one before is nearly read; collapse D − 4 beats over 1.5, point
// D − 2.5 over 0.8, burst D − 2 to D, flash at D − 0.045), index.html .boot-p .boot-q .tag.bad. Chinese: the hook
// types by character; the key word is marked in the copy (`*三次*`), never matched against Latin word characters.
import { E, F, W, at, rect, rr, display, ground, post, hud, hudAt, palOf, reader, half, onBeat, SEEN, rgba, zh, canvasOf, burst, marks, plain, graphemes, clamp, fit, blinkOn } from '../../prop/terminal-hud/kit.js';

const DEFAULT = {
  en: { prompt: 'pnpm test --repeat=50', question: '*3* runs failed.', problems: [{ word: 'SEED', note: 'lost' }] },
  zh: { prompt: 'pnpm test --repeat=50', question: '*3* 次运行失败。', problems: [{ word: '种子', note: '丢了' }] },
};
const timing = (s, B, L, minBeats = 0) => {
  const rd = reader(L), T = { line1: 0.25 * B, cps1: 40 };
  const prompt = String(s.prompt || ''), q = plain(s.question), p1 = graphemes(prompt).length / T.cps1;
  rd.move(T.line1, p1);
  const promptRead = Math.max(T.line1 + p1, rd.typed(T.line1, prompt, T.cps1, 'en'));
  T.line2 = half(Math.max(1.5 * B, promptRead), B);
  T.cps2 = clamp(graphemes(q).length / (1.4 * B), zh(L) ? 8 : 20, 60);
  const q2 = graphemes(q).length / T.cps2;
  rd.move(T.line2, q2);
  T.stress = onBeat(T.line2 + q2 + 0.25 * B, B);
  rd.move(T.stress, 0.45);
  const qRead = Math.max(T.line2 + q2, rd.typed(T.line2, q, T.cps2));
  rd.at(T.stress + 0.5 * B);
  let t = half(Math.max(T.stress + 0.5 * B, qRead - SEEN), B);
  T.problems = (s.problems || []).slice(0, 4).map((p) => { const x = rd.move(t, 0.3); t = half(Math.max(x + 0.5 * B, rd.primary(x + SEEN, [p.word, p.note].filter(Boolean).join(' ')) - SEEN - 0.5 * B), B); return x; });
  if (T.problems.length) rd.at(T.problems[T.problems.length - 1] + 0.3);
  T.done = rd.done;
  T.beats = Math.max(Math.ceil(T.done / B - 1e-6) + 4, minBeats);
  const D = T.beats * B;
  Object.assign(T, { collapse: D - 4 * B, collapseDur: 1.5 * B, point: D - 2.5 * B, burst: [D - 2 * B, D], flash: D - 0.045 });
  return T;
};

export default {
  id: 'prompt-boot', kind: 'scene',
  fits: ['hook'],
  surface: ['canvas'],
  beats: { min: 10, max: 20 },
  needs: { motions: ['cursor-collapse'], props: ['terminal-hud'], roles: ['ground', 'ink', 'muted', 'bad', 'accent', 'hi', 'titleHi', 'titleLo'], type: ['display', 'mono'] },
  slots: {
    prompt: { type: 'code', tier: 'primary', limits: { en: { chars: 40 }, zh: { chars: 40 } } },
    question: { type: 'text', tier: 'primary', limits: { en: { words: 5, chars: 24 }, zh: { chars: 10 } } },
    problems: { type: 'list', count: [0, 4], of: { word: { type: 'text', tier: 'primary', limits: { en: { words: 1, chars: 10 }, zh: { chars: 4 } } }, note: { type: 'text', tier: 'primary', optional: true, limits: { en: { words: 2, chars: 12 }, zh: { chars: 4 } } } } },
  },
  roles: ['ground', 'groundHi', 'groundLo', 'ink', 'muted', 'bad', 'accent', 'hi', 'titleHi', 'titleLo'],
  defaults: (ctx = {}) => ({ ...DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], screen: 'crt', palette: 'ice', hud: null, seed: 11, minBeats: 0 }),
  plan(s, ctx) {
    const B = 60 / ctx.bpm, T = timing(s, B, ctx.lang, s.minBeats || 0), b = (x) => x / B;
    return {
      beats: T.beats, lead: 0, reads: [{ text: s.prompt, lang: 'en' }, { text: plain(s.question), lang: ctx.lang }, ...(s.problems || []).map((p) => ({ text: [p.word, p.note].filter(Boolean).join(' '), lang: ctx.lang }))],
      cues: [{ beat: b(T.line1), kind: 'accent' }, { beat: b(T.line2), kind: 'accent' }, { beat: b(T.stress), kind: 'stamp' }, ...T.problems.map((x) => ({ beat: b(x), kind: 'land' })), { beat: b(T.collapse), kind: 'turn' }, { beat: b(T.burst[0]), kind: 'turn' }, { beat: b(T.flash), kind: 'land' }],
      motion: 'the prompt types and rises; the hook types and its key word grows; tags pop; everything collapses into the cursor; a point of light; the fibre burst; flash',
      settled: b(T.done), peakAt: b(T.stress), shots: [{ beat: 0, kind: 'prompt' }, { beat: b(T.line2), kind: 'hook' }, { beat: b(T.collapse), kind: 'collapse' }, { beat: b(T.burst[0]), kind: 'burst' }],
    };
  },
  prepare(s, c) {
    const L = c.lang || 'en', B = 60 / c.bpm, P = palOf(s.colors, s.palette), T = timing(s, B, L, s.minBeats || 0);
    const cv = canvasOf(1920, 1080), drawBurst = burst(cv, P, (s.seed | 0) + 9031);
    // layout, measured once: prompt, hook and tags centred as one block
    const m = canvasOf(8, 8).getContext('2d');
    const fp = fit(m, '› ' + s.prompt, F('mono', L, 50, 400), 1640, 44), parts = marks(s.question);
    const q = plain(s.question);
    let fq = { ...F('display', L, 150, 800), spacing: zh(L) ? 0 : -0.045 * 150 }; fq = fit(m, q, fq, 1640, 96);
    const ft = { ...F('mono', L, zh(L) ? 28 : 25, 500), spacing: zh(L) ? 0 : 0.08 * 25 };
    const tags = (s.problems || []).slice(0, 4).map(({ word, note }) => `✕ ${word}${note ? ` · ${note}` : ''}`), tw = tags.map((x) => W(m, x, ft) + 36), tH = tags.length ? ft.size + 24 : 0;
    const pH = fp.size * 1.2, qH = fq.size * 1.2, top = 540 - (pH + 36 + qH + (tH ? 56 + tH : 0)) / 2;
    const P0 = { y: top, rise: 540 - pH / 2 - top }, Q0 = { y: top + pH + 36 }, T0 = { y: top + pH + 36 + qH + 56 };
    // the hook's characters with their x, and which belong to the stressed word
    const qg = []; let x = 960 - W(m, q, fq) / 2; const sw = [];
    for (const pt of parts) { const g = graphemes(pt.t), x0 = x; for (const ch of g) { const w = W(m, ch, fq); qg.push({ ch, x, w, em: pt.em }); x += w; } if (pt.em) sw.push([x0, x]); }
    const pg = []; let px = 960 - W(m, '› ' + s.prompt, fp) / 2;
    for (const ch of graphemes('› ' + s.prompt)) { const w = W(m, ch, fp); pg.push({ ch, x: px, w }); px += w; }
    const tagX = []; let tx = 960 - (tw.reduce((a, b) => a + b, 0) + 20 * Math.max(0, tw.length - 1)) / 2; tw.forEach((w) => { tagX.push(tx); tx += w + 20; });
    return { L, B, P, T, cv, drawBurst, fp, fq, ft, tags, tw, tagX, tH, P0, Q0, T0, qg, pg, sw, grow: sw.length ? ((sw[0][1] - sw[0][0]) * 0.14) / 2 : 0 };
  },
  paint(ctx, u, s, c, D) {
    const { L, B, P, T } = D, t = u * B;
    ground(ctx, P, t, { bpm: c.bpm });
    const cw2 = D.fq.size * 0.42, ch2 = D.fq.size * 0.74, endX = (D.qg.length ? D.qg[D.qg.length - 1].x + D.qg[D.qg.length - 1].w + 6 : 960) + D.grow, y2 = D.Q0.y + (D.fq.size * 1.2 - ch2) / 2 + D.fq.size * 0.04;
    const target = { x: endX + cw2 / 2, y: y2 + ch2 / 2 };
    // a piece pulled into the cursor: far pieces first, so they arrive together
    const pull = (cx, cy, dmax, fn) => {
      if (t < T.collapse) return fn(1, 0, 0, 0);
      const dx = target.x - cx, dy = target.y - cy, d = Math.hypot(dx, dy) / dmax, t0 = T.collapse + (1 - d) * 0.5 * B, dur = T.collapseDur * (0.5 + 0.5 * d), e = E.p2In((t - t0) / dur);
      if (e >= 1) return;
      ctx.save(); ctx.translate(cx + dx * e, cy + dy * e); ctx.scale(1 - 0.95 * e, 1 - 0.95 * e); ctx.translate(-cx, -cy); if (e > 0) ctx.filter = `blur(${(6 * e).toFixed(1)}px)`;
      fn(1 - e, dx * e, dy * e, e); ctx.restore();
    };
    const dmax = 1400;
    // the prompt: types at the centre, rises as the hook types
    const rise = D.P0.rise * (1 - E.expoOut((t - T.line2) / 0.35)), py = D.P0.y + (t < T.line2 ? D.P0.rise : rise);
    const n1 = t < T.line1 ? 0 : clamp(Math.floor((t - T.line1) * T.cps1) + 1, 0, D.pg.length - 2);
    D.pg.forEach((g, i) => { if (i >= 2 && i - 2 >= n1) return; pull(g.x + g.w / 2, py + D.fp.size * 0.6, dmax, () => at(ctx, g.ch, g.x, py, D.fp, i < 2 ? P.ink : P.muted)); });
    if (t < T.line2 && blinkOn(t, 0, B)) { const g = D.pg[Math.min(D.pg.length - 1, n1 + 1)]; rect(ctx, g.x + g.w + 6, py + D.fp.size * 0.05, D.fp.size * 0.5, D.fp.size * 1.05, P.ink); }
    // the hook: typed by character; the key word grows on the beat and the rest steps back
    const n2 = t < T.line2 ? 0 : clamp(Math.floor((t - T.line2) * T.cps2) + 1, 0, D.qg.length);
    const gs = clamp((t - T.stress) / 0.45), k = t >= T.stress ? E.back(2.2)(gs) : 0;
    D.qg.forEach((g, i) => {
      if (i >= n2) return;
      const inSw = D.sw.length && g.x >= D.sw[0][0] - 0.5 && g.x < D.sw[0][1] - 0.5, before = D.sw.length && g.x < D.sw[0][0];
      let x = g.x, sc = 1;
      if (D.sw.length && t >= T.stress) {
        if (inSw) { const ox = (D.sw[0][0] + D.sw[0][1]) / 2; sc = 1 + 0.14 * k; x = ox + (g.x - ox) * sc; } else x += (before ? -1 : 1) * D.grow * k;
      }
      const a = inSw || !D.sw.length ? 1 : 1 - 0.5 * clamp((t - T.stress) / 0.3);
      pull(x + g.w / 2, D.Q0.y + D.fq.size * 0.6, dmax, (al) => {
        ctx.save(); const oy = D.Q0.y + D.fq.size * 0.75; ctx.translate(x, oy); ctx.scale(sc, sc); ctx.translate(-x, -oy);
        display(ctx, g.ch, x, D.Q0.y, D.fq, P, { screen: s.screen, alpha: a * al }); ctx.restore();
      });
    });
    // the hook's cursor
    if (t >= T.line2 && t < T.point && blinkOn(t, T.line2, B)) { const last = D.qg[n2 - 1], x = t < T.collapse ? (last ? last.x + last.w + 6 + (D.sw.length && t >= T.stress ? D.grow * k : 0) : 960) : endX; rect(ctx, x, y2, cw2, ch2, P.ink); }
    // the problem tags
    D.tags.forEach((txt, i) => {
      const t0 = T.problems[i]; if (t0 == null || t < t0) return;
      const e = clamp((t - t0) / 0.3), sc = 0.8 + 0.2 * E.back(2.5)(e), x = D.tagX[i], y = D.T0.y, w = D.tw[i], h = D.tH;
      pull(x + w / 2, y + h / 2, dmax, (al) => {
        ctx.save(); ctx.globalAlpha *= Math.min(1, e * 2) * al; ctx.translate(x + w / 2, y + h / 2 + 10 * (1 - e)); ctx.scale(sc, sc); ctx.translate(-(x + w / 2), -(y + h / 2));
        rr(ctx, x, y, w, h, 4); ctx.fillStyle = rgba(P.bad, 0.08); ctx.fill(); ctx.strokeStyle = rgba(P.bad, 0.55); ctx.lineWidth = 2; ctx.stroke();
        at(ctx, txt, x + 18, y + 12, D.ft, P.bad); ctx.restore();
      });
    });
    // the cursor becomes a point of light at the frame's centre
    if (t >= T.point && t < T.burst[1]) {
      const e = E.expoInOut((t - T.point) / (0.8 * B)), x = endX + (953 - endX) * e, y = y2 + (533 - y2) * e, w = cw2 + (14 - cw2) * e, h = ch2 + (14 - ch2) * e;
      ctx.save(); ctx.shadowColor = rgba(P.accent, 0.6 + 0.3 * e); ctx.shadowBlur = 14 + 40 * e; rr(ctx, x, y, w, h, 7 * e); ctx.fillStyle = e > 0.5 ? P.hi : P.ink; ctx.fill(); ctx.restore();
    }
    // the fibre burst, a light layer fading in over half a second
    if (t >= T.burst[0] - 0.04) {
      D.drawBurst(clamp((t - T.burst[0]) / (T.burst[1] - T.burst[0])));
      ctx.save(); ctx.globalAlpha = E.p2In((t - T.burst[0] - 0.15) / 0.5); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(D.cv, 0, 0); ctx.restore();
    }
    if (s.hud) hud(ctx, P, L, hudAt(s.hud, u / T.beats));
    post(ctx, P, t, { screen: s.screen, flash: t >= T.flash ? 0.95 : 0 });
  },
  track() { return [[960, 540]]; },
};

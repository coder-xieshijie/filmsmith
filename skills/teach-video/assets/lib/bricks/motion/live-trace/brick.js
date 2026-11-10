// live-trace — a live chart: the write head is pinned near the right edge and the trace streams left past it at a
// steady rate; once, a burst writes through (the trace and the reading turn to the accent, an event marker is pinned on
// its peak and carried away), then the stream brakes to a true stop and the status turns from live to paused.
// Adapted from video-shotcraft demos/data/chart-live-moves/OscilloscopeStreamV2.tsx (card
// references/shots/data/chart-live-moves.md), https://github.com/Vincentwei1021/video-shotcraft @ 1266a3e, Apache-2.0.
// Changes: rewritten as a Canvas2D brick (no React, Remotion or SVG); one accent for the one event (the trace is ink,
// the burst the accent; upstream had a blue trace and a second, coral event colour); brand, metric names and the two
// side readings removed (title, unit, axis labels, status and event label are the film's slots, illustrative by
// default); the series is the upstream's pure wave function scaled to the plot; the push towards the burst after the
// stop is the style's.
import { clamp, mix, rgba, rrect, text, measure, ground } from '../../../handoffs/util.js';
import { EASE, ramp } from '../../ease.js';
import { fontFor } from '../../lang.js';
import { look, infoSize } from '../../sample.js';
import { figures, grouped } from '../digit-roll/brick.js';

const F0 = 30, F = 90;                                   // upstream frames 30–120 map to p 0 → 1
const PX = 96, PW = 1728, PY = 404, PH = 520, HEAD = Math.round(PW * 0.86);
const SPEED = 8, FREEZE = [104, 118], OFFSET = 1400, MAXV = 3000;
const cubicOut = (u) => 1 - Math.pow(1 - clamp(u), 3);

// the write head's world x: steady, then an out-cubic brake whose start speed is the stream's (no jump)
const worldAt = (f) => (f <= FREEZE[0] ? OFFSET + f * SPEED : OFFSET + FREEZE[0] * SPEED + ((SPEED * (FREEZE[1] - FREEZE[0])) / 3) * cubicOut((f - FREEZE[0]) / (FREEZE[1] - FREEZE[0])));
// the series: a sum of sines, a burst (a sharp pulse with a smaller one before and after) written as the head passes
const S0 = OFFSET + 46 * SPEED, SW = 176, SC = S0 + SW * 0.5;
const gauss = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const bump = (x) => 2.2 * gauss(x, SC, 26) + 0.45 * gauss(x, SC - 62, 18) + 0.6 * gauss(x, SC + 48, 20);
const burstK = (x) => Math.min(1, bump(x) / 2.2);
const wave = (x) => 0.34 * Math.sin(x * 0.019) + 0.27 * Math.sin(x * 0.047 + 1.7) + 0.18 * Math.sin(x * 0.011 + 4.2) + 0.11 * Math.sin(x * 0.083 + 2.3);
const signal = (x) => wave(x) * (1 + 0.6 * gauss(x, SC, SW * 0.45)) + bump(x);
const valueOf = (x) => 1350 + signal(x) * 560;
const yOf = (x) => PH - (valueOf(x) / MAXV) * PH;
const PEAK_X = (() => { let best = S0; for (let x = S0; x <= S0 + SW; x += 0.5) if (signal(x) > signal(best)) best = x; return best; })();
const PASS = (PEAK_X - OFFSET) / SPEED;                  // the frame the head passes the peak

export default {
  id: 'live-trace', kind: 'motion',
  tier: 'T1', family: 'horizontal', beats: 6,
  surface: ['canvas'],
  roles: ['ground', 'line', 'ink', 'dim', 'accent', 'ok'],
  from: 'a live chart streaming at a steady rate, the reading live',
  to: 'the same chart stopped dead, the burst marked on its peak, the status paused',
  interpolates: ['stream: 8 px a frame, then an out-cubic brake over 14 frames', 'burst: trace segment and reading to the accent with the head', 'event marker pops on the peak (overshoot) and rides left', 'live → paused'],
  summary: 'A live chart streams past a pinned write head; once, a burst writes through in the accent and is marked on its peak, then the stream brakes to a dead stop.',
  theory: 'A trace written at a fixed head reads as "now" without saying so (the oscilloscope and the heart monitor); one event in the one accent against a steady signal is a pop-out (Treisman & Gelade 1980), and the stop from steady motion to stillness holds attention on it (Abrams & Christ 2003).',
  defaults: (ctx = {}) => (ctx.lang === 'zh'
    ? { title: '每秒请求', unit: '次/秒', status: ['实时', '已暂停'], event: '突发', note: '示意数据', times: ['−50 秒', '−40 秒', '−30 秒', '−20 秒', '−10 秒', '现在'], levels: ['3k', '2k', '1k'] }
    : { title: 'Requests per second', unit: '/s', status: ['Live', 'Paused'], event: 'Burst', note: 'Illustrative data', times: ['−50s', '−40s', '−30s', '−20s', '−10s', 'now'], levels: ['3k', '2k', '1k'] }),
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) {
    const f = F0 + p * F, T = worldAt(f);
    const spikeK = Math.max(burstK(T), 0.8 * burstK(T - 30), 0.5 * burstK(T - 60));
    return { p, f, T, held: worldAt(Math.floor(f / 3) * 3), spikeK, hot: EASE.out(Math.min(1, spikeK * 1.6)),
      live: 1 - ramp(f, FREEZE[0], FREEZE[1] - FREEZE[0], 'out'), tag: ramp(f, PASS + 3, 14, 'overshoot') };
  },
  paint(ctx, S, P) {
    const c = P.colors, L = P.lang, T = S.T, hotC = mix(c.ink, c.accent, S.hot);
    ground(ctx, P);
    // header: the metric's label, the status pill, the reading
    const ef = fontFor(look, 'mono', L, L === 'zh' ? 30 : 30, 600, 'label');
    text(ctx, P.title, PX, 120, ef, { color: c.dim });
    const live = S.live > 0.5, st = live ? P.status[0] : P.status[1], sc = live ? c.ok : c.dim;
    const pf = fontFor(look, 'text', L, L === 'zh' ? 28 : 26, 700, 'label'), pw = measure(ctx, st, pf).width + 58, px = PX + measure(ctx, P.title, ef).width + 28;
    rrect(ctx, px, 92, pw, 42, 21); ctx.fillStyle = rgba(sc, 0.12); ctx.fill(); ctx.strokeStyle = rgba(sc, 0.35); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(px + 22, 113, 6, 0, Math.PI * 2); ctx.fillStyle = sc; ctx.fill();
    text(ctx, st, px + 38, 114, pf, { color: sc, baseline: 'middle' });
    const rs = 1 + 0.08 * S.spikeK, rf = fontFor(look, 'display', L, 176, 700, 'display'), uf = fontFor(look, 'text', L, 48, 500);
    ctx.save(); ctx.translate(PX - 8, 316); ctx.scale(rs, rs);
    const rw = figures(ctx, grouped(valueOf(S.held)), 0, 0, rf, { color: hotC });
    text(ctx, P.unit, rw + 22, 0, uf, { color: mix(c.dim, c.accent, S.hot) });
    ctx.restore();
    // the scope: major grid from line, minor ticks on the centre line
    ctx.save(); ctx.translate(PX, PY);
    for (let i = 0; i <= 12; i++) { ctx.fillStyle = rgba(c.line, i === 0 || i === 12 ? 1 : 0.6); ctx.fillRect((i / 12) * PW - 0.6, 0, 1.2, PH); }
    for (let i = 0; i <= 6; i++) { ctx.fillStyle = rgba(c.line, i === 0 || i === 6 ? 1 : 0.6); ctx.fillRect(0, (i / 6) * PH - 0.6, PW, 1.2); }
    ctx.fillStyle = c.line; for (let i = 0; i <= 60; i++) { const h = i % 5 ? 5 : 10; ctx.fillRect((i / 60) * PW - 0.6, PH / 2 - h, 1.2, 2 * h); }
    // the trace, fading in from the left edge
    const pts = [];
    for (let x = 0; x <= HEAD; x += 4) pts.push([x, yOf(T - (HEAD - x)), T - (HEAD - x)]);
    if (pts[pts.length - 1][0] !== HEAD) pts.push([HEAD, yOf(T), T]);
    const path = (a) => { ctx.beginPath(); a.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    const fadeOf = (col, a) => { const g = ctx.createLinearGradient(0, 0, PW, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.14, rgba(col, a)); g.addColorStop(1, rgba(col, a)); return g; };
    path(pts); ctx.lineTo(HEAD, PH); ctx.lineTo(0, PH); ctx.closePath();
    const area = ctx.createLinearGradient(0, 0, 0, PH); area.addColorStop(0, rgba(c.ink, 0.14)); area.addColorStop(1, rgba(c.ink, 0));
    ctx.fillStyle = area; ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    path(pts); ctx.strokeStyle = fadeOf(c.ink, 0.18); ctx.lineWidth = 12; ctx.stroke();
    path(pts); ctx.strokeStyle = fadeOf(c.ink, 0.9); ctx.lineWidth = 3.5; ctx.stroke();
    const spike = pts.filter(([, , w]) => w >= S0 + 10 && w <= Math.min(T, S0 + SW - 10));
    if (spike.length > 1) { path(spike); ctx.strokeStyle = rgba(c.accent, 0.35); ctx.lineWidth = 16; ctx.stroke(); path(spike); ctx.strokeStyle = c.accent; ctx.lineWidth = 5; ctx.stroke(); }
    // the write head: scan line, reading reference, glow, dot
    const hy = yOf(T);
    ctx.fillStyle = rgba(hotC, 0.12 + 0.4 * S.live); ctx.fillRect(HEAD - 0.75, 0, 1.5, PH);
    ctx.setLineDash([4, 6]); ctx.strokeStyle = rgba(hotC, 0.4); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(HEAD, hy); ctx.lineTo(PW, hy); ctx.stroke(); ctx.setLineDash([]);
    if (S.live > 0) { const g = ctx.createRadialGradient(HEAD, hy, 0, HEAD, hy, 70); g.addColorStop(0, rgba(hotC, 0.55 * S.live)); g.addColorStop(1, rgba(hotC, 0)); ctx.fillStyle = g; ctx.fillRect(HEAD - 70, hy - 70, 140, 140); }
    ctx.beginPath(); ctx.arc(HEAD, hy, 9, 0, Math.PI * 2); ctx.fillStyle = hotC; ctx.fill(); ctx.strokeStyle = c.ground; ctx.lineWidth = 3; ctx.stroke();
    // the event: a marker on the peak, a drop line, a tag; carried left with the stream
    const kx = HEAD - (T - PEAK_X), ky = yOf(PEAK_X);
    if (S.tag > 0 && kx > 40) {
      const a = Math.min(1, S.tag * 1.5);
      ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(c.accent, 0.5); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(kx, ky + 14); ctx.lineTo(kx, PH); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(kx, ky, 9 * S.tag, 0, Math.PI * 2); ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = c.ground; ctx.lineWidth = 3; ctx.stroke();
      const tf = fontFor(look, 'text', L, 32, 800, 'label'), vf = fontFor(look, 'text', L, 32, 600);
      const val = `${grouped(valueOf(PEAK_X))} ${P.unit}`, w1 = measure(ctx, P.event, tf).width;
      ctx.translate(kx + 22, ky); ctx.scale(S.tag, S.tag);
      rrect(ctx, 0, -36, 20 + w1 + 14 + measure(ctx, val, vf).width + 26, 72, 14); ctx.fillStyle = rgba(c.accent, 0.16); ctx.fill(); ctx.strokeStyle = rgba(c.accent, 0.55); ctx.stroke();
      text(ctx, P.event, 20, 1, tf, { color: c.accent, baseline: 'middle' });
      figures(ctx, val, 20 + w1 + 14, 1, vf, { color: c.ink, baseline: 'middle' });
      ctx.restore();
    }
    // axes: levels inside the plot, times under it
    const af = fontFor(look, 'text', L, infoSize(L) + 3, 500);
    P.levels.forEach((t, i) => text(ctx, t, 14, (i * 2 * PH) / 6 + 36, af, { color: c.dim }));
    P.times.forEach((t, i) => text(ctx, t, (HEAD * (i + 1)) / 6, PH + 52, af, { color: i === P.times.length - 1 ? c.ink : c.dim, align: 'center' }));
    ctx.restore();
    if (P.note) text(ctx, P.note, PX + PW, 1080 - 40, fontFor(look, 'text', L, infoSize(L), 500), { color: c.dim, align: 'right' });
  },
  blur() { return false; },                           // a stream at 8 px a frame is read sharp, as upstream
  // the burst's peak on screen (compare pairs it with the upstream event marker); the head
  track(S) { return [[PX + HEAD - (S.T - PEAK_X), PY + yOf(PEAK_X)], [PX + HEAD, PY + yOf(S.T)]]; },
};

// squares.js — every unit square of the film at time t: the wave, the flights, mark-then-move, reveals, the
// closing light, glints, a list's stream, a trend's re-encode and the step-wipe entry. index.html calls
// makeSquares() once the placements are built and draws(t) every frame. Pure: a function of t and the placements.
import { clamp, lerp, cubicInOut, cubicOut, smooth } from './lib/motion.js';
import { hash } from './lib/rng.js';
import { FLIGHT, MARK, WAVE, CHART_LIGHT_SPAN } from './timeline.js';
import { ROLE, MX, LIST, listFade, glintScale, REVEAL_POP } from './layouts.js';
import * as fx from './fx.js';
import { drawMark } from './marks.js';

const SETTLE = 0.3; // share of a flight: the landing pulse runs over its last 30 %

// E: the layouts' context (ctx, pal, the hand-offs); CH: the planned chapters; P, START: placements and departure
// times per chapter; MK: the mark variant (marks.js); active(t): the chapter index at t.
export const makeSquares = ({ E, CH, P, START, MK, active }) => {
  const { ctx, pal } = E, N = E.m.n, BEAT = CH[0].T.beat;
  const roleRgb = { [ROLE.base]: fx.hexRgb(pal.base), [ROLE.rest]: fx.hexRgb(pal.rest), [ROLE.accent]: fx.hexRgb(pal.accent) };
  const qy = (q, k) => (q.ay ? q.ay[k] : q.y[k]); // where a chapter's squares rest when the next one starts

  // The step-wipe entry (lib/handoffs step-wipe; its state: front, r): the module paints solid bars, tally's bars are
  // made of squares (mode principles 1, 2), so the same geometry is painted here square by square. The previous
  // chapter's bands retract toward a staircase front whose steps are this timeline's columns; each column's
  // squares show where the staircase covers them; landed, the staircase is the chart.
  function stepSquares(t, i) {
    const ch = CH[i], p = P[i], q = P[i - 1], T = ch.T, A = CH[i - 1].geo, Bg = ch.geo;
    const S = t < T.step[0] ? { front: 0, r: 0 } : E.stepwipe[i].state((t - T.step[0]) / T.step[1]);
    const n = Bg.cols.length, slot = Bg.sw, colW = Bg.w * Bg.p - (Bg.p - Bg.s), gap = slot - colW, x0 = MX + slot / 2 - colW / 2;
    const Hs = Bg.cols.map((c) => (c ? Math.ceil(c / Bg.w) * Bg.p - (Bg.p - Bg.s) : 0)), WTOT = n * slot + x0;
    const ox = S.front >= 1 ? 0 : -(1 - S.front) * WTOT;
    const frontAt = (y) => { let j = -1; for (let c = 0; c < n; c++) if (Hs[c] >= Bg.base - y) j = c; return j < 0 ? -1e4 : x0 + (j + 1) * slot - gap + ox; };
    const covered = (x, y) => { const j = Math.floor((x - x0 - ox) / slot); return j >= 0 && j < n && Hs[j] >= Bg.base - y - 0.5; };
    for (let k = 0; k < N; k++) {
      // from: the bands, retracting toward the front
      if (q.role[k] !== ROLE.hidden) {
        const g = q.group[k], end = A.x0 + (A.endX[g] - A.x0) * (1 - S.r), y = q.y[k] + q.s[k] / 2;
        if (q.x[k] >= Math.max(A.x0, frontAt(y)) - 0.5 && q.x[k] + q.s[k] <= end + 0.5) drawSq(q.x[k], q.y[k], q.s[k], roleRgb[q.final[k]], 1);
      }
      // to: the columns, where the staircase covers them
      if (S.front > 0 && p.role[k] !== ROLE.hidden && covered(p.x[k] + p.s[k] / 2, p.y[k])) drawSq(p.x[k], p.y[k], p.s[k], roleRgb[p.role[k]], 1);
    }
  }
  function drawSq(x, y, s, rgb, alpha) {
    ctx.fillStyle = fx.rgbaStr(rgb, alpha);
    if (MK.kind === 'square') { ctx.beginPath(); ctx.roundRect(x, y, s, s, s * 0.18); ctx.fill(); }
    else drawMark(ctx, MK, x, y, s);
  }

  function squares(t) {
    const i = active(t), ch = CH[i], p = P[i], q = i > 0 ? P[i - 1] : null, st = START[i], T = ch.T;
    if (T.step && q && t < T.step[0] + T.step[1]) return stepSquares(t, i);
    // a list streams: its squares ride with their lines (lib/handoffs stream-brake's position)
    const scroll = T.stream && t >= T.stream[0] ? (E.stream[i].state((t - T.stream[0]) / T.stream[1]).pos - ch.geo.start) * LIST.lh : 0;
    // the trend's re-encode: each column steps back as its top becomes a point
    const RE = T.reencode && t >= T.reencode[0] ? E.reencode[i].state(Math.min(1, (t - T.reencode[0]) / T.reencode[1])) : null;
    // the glints sweep along the protagonist's squares, else the base squares
    const glintRole = T.glints.length ? (p.final.includes(ROLE.accent) ? ROLE.accent : ROLE.base) : -1;
    for (let k = 0; k < N; k++) {
      let x, y, s, rgb, alpha;
      if (T.first || !q) {
        const e = cubicOut((t - st[k]) / (WAVE.grow * BEAT));
        if (e <= 0 || p.role[k] === ROLE.hidden) continue;
        s = p.s[k] * lerp(0.3, 1, e);
        x = p.x[k] + (p.s[k] - s) / 2; y = p.y[k] + (p.s[k] - s) / 2;
        rgb = roleRgb[p.role[k]]; alpha = e;
      } else {
        const e = cubicInOut((t - st[k]) / (FLIGHT * BEAT));
        const r0 = q.final[k], r1 = p.role[k];
        if (r0 === ROLE.hidden && r1 === ROLE.hidden) continue;
        alpha = lerp(r0 === ROLE.hidden ? 0 : 1, r1 === ROLE.hidden ? 0 : 1, e);
        if (alpha <= 0.003) continue;
        const x0 = q.x[k], y0 = qy(q, k), x1 = p.x[k], y1 = p.y[k] - scroll;
        const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1;
        const arc = Math.sin(Math.PI * e) * (hash(k, 5 + i) - 0.5) * Math.min(140, d * 0.3);
        s = lerp(q.s[k], p.s[k], e);
        x = lerp(x0, x1, e) - (dy / d) * arc; y = lerp(y0, y1, e) + (dx / d) * arc;
        // settle: over the last SETTLE of its flight a square swells 10 % and back while it brakes, one pulse
        // that ends exactly as it lands, no bounce (2026-10-18). Squares that do not move do not pulse.
        const v = ((t - st[k]) / (FLIGHT * BEAT) - (1 - SETTLE)) / SETTLE;
        if (v > 0 && v < 1 && d > 2 && !(T.stream && t >= T.stream[0])) { const ns = s * (1 + 0.1 * Math.sin(Math.PI * v)); x -= (ns - s) / 2; y -= (ns - s) / 2; s = ns; }
        const c0 = roleRgb[r0 === ROLE.hidden ? r1 : r0], c1 = roleRgb[r1 === ROLE.hidden ? r0 : r1];
        if (T.instant) rgb = c1; // a frame-level entry is the mark: the new colours are there from beat 0
        else {
          // mark, then move: the colour changes in place before departure, a short sweep by rank
          const sweep = (at) => (at == null ? 1 : smooth((t - (ch.start + (at + p.rank[k] * 0.4 * MARK) * BEAT)) / (0.6 * MARK * BEAT)));
          if (!T.swap) rgb = fx.mixRgb(c0, c1, T.mark == null && T.unmark == null ? 1 : sweep(T.mark));
          else {
            // a new protagonist: the old accent squares first fade to neutral, then the new ones light up
            const mid = r0 === ROLE.accent ? roleRgb[r1 === ROLE.accent || r1 === ROLE.hidden ? ROLE.base : r1] : c0;
            rgb = fx.mixRgb(fx.mixRgb(c0, mid, sweep(T.unmark)), c1, sweep(T.mark));
          }
        }
        if (RE && p.group[k] < RE.w.length) rgb = fx.mixRgb(roleRgb[ROLE.rest], rgb, RE.w[p.group[k]]);
      }
      if (p.reveal && T.reveal != null && t >= T.reveal) {
        const dk = T.reveal + (p.revealAt ? p.revealAt[k] : p.rank[k] * 0.4) * BEAT;
        const u = smooth((t - dk) / 0.25);
        if (p.reveal[k] !== p.role[k]) {
          rgb = fx.mixRgb(rgb, roleRgb[p.reveal[k]], u);
          const pop = 1 + REVEAL_POP * Math.sin(Math.PI * clamp((t - dk) / 0.35));
          const ns = s * pop; x -= (ns - s) / 2; y -= (ns - s) / 2; s = ns;
        }
      }
      if (p.light && t >= T.light) {
        // the closing light of a chart scene, a sweep by rank over a beat: the other squares step back to rest
        // while the protagonist's squares light up one by one along their band
        const dk = T.light + p.rank[k] * 0.6 * BEAT;
        if (p.light[k] !== p.final[k]) rgb = fx.mixRgb(rgb, roleRgb[p.light[k]], smooth((t - dk) / (0.4 * BEAT)));
        else if (p.light[k] === ROLE.accent) {
          const ns = s * (1 + 0.25 * Math.sin(Math.PI * clamp((t - dk) / 0.35)));
          x -= (ns - s) / 2; y -= (ns - s) / 2; s = ns;
        }
      }
      if (glintRole >= 0 && (p.reveal && T.reveal != null && t >= T.reveal ? p.reveal[k] : p.role[k]) === glintRole) {
        const g = glintScale(T, p.rank[k], t);
        if (g > 1) { const ns = s * g; x -= (ns - s) / 2; y -= (ns - s) / 2; s = ns; }
      }
      if (ch.type === 'list') { alpha *= listFade(y + s / 2); if (alpha <= 0.003) continue; }
      drawSq(x, y, s, rgb, alpha);
    }
  }

  return squares;
};

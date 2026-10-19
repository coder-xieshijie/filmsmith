// signal-relay — a card collapses into its node on a line, a lit pulse runs along the line to the next node, splits
// into parallel lanes if there are several targets, and each target node blooms into the next card. The node count is
// the real step count. Theory: Michotte's launching effect, one motion read as causing the next (Michotte 1946); the
// pulse is an exogenous cue that carries attention to the new place (Posner 1980). references/transitions.md#signal-relay.

import { seg, settle, lerp, clamp, expInOut, mix, rgba, rrect, text, ground } from './util.js';
import { measurePath, spanPath, pointAt } from './paths.js';

const COLLAPSE = [0, 0.2], PULSE = [0.17, 0.45], LIT = 0.45, LANES = [0.46, 0.72], BLOOM = [0.72, 0.94];

const label = (s) => (ctx, b, P) => {
  text(ctx, s, b.x + 38, b.y + b.h / 2 + P.font.size * 0.35, P.font, { color: P.colors.ink });
};

export default {
  name: 'signal-relay',
  tier: 'T1',
  beats: 3,
  modes: ['trace', 'thread'],
  roles: ['ground', 'ink', 'base', 'faint', 'active', 'done', 'cell'],
  from: 'a card (the current step)',
  to: 'the next card, or one card per parallel lane',
  interpolates: ['card size (card → node)', 'pulse position along the line', 'lane heads', 'node size (node → card)', 'node colour (waiting → lit → done)'],
  summary: 'A card collapses into its node, a pulse runs along the line (splitting into lanes), and the next nodes bloom into cards.',
  theory: 'The launching effect: one motion seen to cause the next (Michotte 1946); the pulse cues where to look next (Posner 1980).',
  defaults: {
    from: { x: 400, y: 540, w: 560, h: 260, r: 14, content: label('decode') },
    via: [920, 540],                     // where the line splits (the next node when there is one target)
    to: [
      { x: 1500, y: 340, w: 540, h: 150, content: label('dialog') },
      { x: 1500, y: 540, w: 540, h: 150, content: label('music') },
      { x: 1500, y: 740, w: 540, h: 150, content: label('effects') },
    ],
    turn: 0.4,                           // share of the via → target distance taken by each lane's S-bend
    lineStart: 60,                       // x where the main line starts
    node: 13, lineWidth: 4,
    font: { family: 'sans-serif', weight: 600, size: 50 },
    colors: { ground: '#0C1013', ink: '#E6ECEF', base: '#7D8A93', faint: '#2A343B', active: '#F7D96F', done: '#5CD0B3', cell: '#66737C' },
  },
  prepare(P) {
    const [vx, vy] = P.via;
    const lanes = P.to.map((c) => {
      const tx = vx + (c.x - vx) * P.turn, pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40, e = u * u * (3 - 2 * u); pts.push([vx + (tx - vx) * u, vy + (c.y - vy) * e]); }
      for (let i = 1; i <= 20; i++) pts.push([tx + ((c.x - tx) * i) / 20, c.y]);
      return measurePath(pts);
    });
    // the straightest lane leaves first, the others 0.027 later
    const dmin = Math.min(...P.to.map((c) => Math.abs(c.y - vy)));
    const delay = P.to.map((c) => (Math.abs(c.y - vy) <= dmin + 0.5 ? 0 : 0.027));
    return { lanes, delay };
  },
  rest(side, P) {
    const v = side === 'from' ? 0 : 1, n = P.to.length;
    return { pc: v, head: v, lit: v, done: v, bump: 1, lanes: Array(n).fill(v), bloom: Array(n).fill(v), doneA: v };
  },
  at(p, P, D) {
    const n = P.to.length;
    return {
      pc: settle(seg(p, ...COLLAPSE), 6.6),
      head: expInOut(seg(p, ...PULSE)),
      lit: seg(p, LIT, LIT + 0.04),
      done: seg(p, 0.7, 0.75),
      bump: p >= LIT ? 1 + 0.35 * (1 - settle(seg(p, LIT, LIT + 0.25), 6)) * seg(p, LIT, LIT + 0.013) : 1,
      lanes: Array.from({ length: n }, (_, k) => expInOut(seg(p, LANES[0] + D.delay[k], LANES[1] + D.delay[k]))),
      bloom: Array.from({ length: n }, (_, k) => settle(seg(p, BLOOM[0] + D.delay[k], BLOOM[1] + D.delay[k]), 6)),
      doneA: seg(p, LIT, LIT + 0.05),
    };
  },
  paint(ctx, S, P, D) {
    ground(ctx, P);
    const C = P.colors, F = P.from, [vx, vy] = P.via;
    ctx.lineCap = 'round';
    // main line: faint ahead, base behind the pulse
    const head = lerp(F.x, vx, S.head);
    ctx.lineWidth = P.lineWidth;
    ctx.strokeStyle = C.faint; ctx.beginPath(); ctx.moveTo(P.lineStart, F.y); ctx.lineTo(vx, vy); ctx.stroke();
    ctx.strokeStyle = C.base; ctx.beginPath(); ctx.moveTo(P.lineStart, F.y); ctx.lineTo(head, lerp(F.y, vy, S.head)); ctx.stroke();
    if (S.head > 0 && S.head < 1) {
      const tail = Math.max(F.x, head - 160);
      const g = ctx.createLinearGradient(tail, 0, head, 0);
      g.addColorStop(0, rgba(C.active, 0)); g.addColorStop(1, C.active);
      ctx.strokeStyle = g; ctx.lineWidth = P.lineWidth * 1.5;
      ctx.beginPath(); ctx.moveTo(tail, F.y); ctx.lineTo(head, lerp(F.y, vy, S.head)); ctx.stroke();
      ctx.fillStyle = C.active; ctx.beginPath(); ctx.arc(head, lerp(F.y, vy, S.head), 9, 0, Math.PI * 2); ctx.fill();
    }
    // lanes, drawn behind their heads
    D.lanes.forEach((L, k) => {
      const s = S.lanes[k] * L.len;
      if (s <= 0) return;
      ctx.lineWidth = P.lineWidth; ctx.strokeStyle = C.base;
      spanPath(ctx, L, 0, s); ctx.stroke();
      if (S.lanes[k] < 1) {
        ctx.lineWidth = P.lineWidth * 1.5; ctx.strokeStyle = C.active;
        spanPath(ctx, L, Math.max(0, s - 130), s); ctx.stroke();
        const [hx, hy] = pointAt(L, s);
        ctx.fillStyle = C.active; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill();
      }
    });
    // the split node: an empty ring until the pulse arrives, then lit, then done
    ctx.beginPath(); ctx.arc(vx, vy, P.node * S.bump, 0, Math.PI * 2);
    if (S.lit > 0) { ctx.fillStyle = mix(mix(C.ground, C.active, S.lit), C.done, S.done); ctx.fill(); }
    else { ctx.fillStyle = C.ground; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.cell; ctx.stroke(); }
    // the outgoing card, cropped as it shrinks into its node (never faded)
    const nd = 2 * P.node, pc = S.pc;
    const cw = lerp(F.w, nd, pc), ch = lerp(F.h, nd, pc), cr = lerp(F.r ?? 14, P.node, pc);
    rrect(ctx, F.x - cw / 2, F.y - ch / 2, cw, ch, cr);
    ctx.fillStyle = mix(mix(C.ground, C.active, clamp((pc - 0.6) / 0.4)), C.done, S.doneA); ctx.fill();
    if (pc < 0.95) { ctx.lineWidth = 2; ctx.strokeStyle = C.cell; ctx.stroke(); }
    if (pc < 0.9 && F.content) {
      ctx.save();
      rrect(ctx, F.x - cw / 2 + 2, F.y - ch / 2 + 2, cw - 4, ch - 4, cr); ctx.clip();
      F.content(ctx, { x: F.x - F.w / 2, y: F.y - F.h / 2, w: F.w, h: F.h }, P);
      ctx.restore();
    }
    // target nodes bloom into cards once their lane has arrived
    P.to.forEach((c, k) => {
      if (S.lanes[k] < 1) return;
      const pb = S.bloom[k], w = lerp(nd, c.w, pb), h = lerp(nd, c.h, pb);
      rrect(ctx, c.x - w / 2, c.y - h / 2, w, h, lerp(P.node, c.r ?? 14, pb));
      ctx.fillStyle = pb < 0.4 ? mix(C.active, C.ground, pb / 0.4) : C.ground; ctx.fill();
      if (pb > 0.05) { ctx.lineWidth = 2; ctx.strokeStyle = C.cell; ctx.stroke(); }
      if (pb > 0.6 && c.content) {
        ctx.save();
        rrect(ctx, c.x - w / 2 + 2, c.y - h / 2 + 2, w - 4, h - 4, c.r ?? 14); ctx.clip();
        c.content(ctx, { x: c.x - c.w / 2, y: c.y - c.h / 2, w: c.w, h: c.h }, P);
        ctx.restore();
      }
    });
  },
  track: (S, P, D) => {
    const F = P.from, pts = [[lerp(F.x, P.via[0], S.head), F.y], [F.x - lerp(F.w, 2 * P.node, S.pc) / 2, F.y - lerp(F.h, 2 * P.node, S.pc) / 2]];
    D.lanes.forEach((L, k) => { const [x, y] = pointAt(L, S.lanes[k] * L.len); pts.push([x, y], [P.to[k].x + lerp(P.node, P.to[k].w / 2, S.bloom[k]), P.to[k].y]); });
    return pts;
  },
};

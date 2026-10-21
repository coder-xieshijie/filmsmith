// strip-advance — frames on a strip of film move horizontally through a fixed gate and stop with the next frame
// registered in it. The strip is one object throughout; outside the gate it steps back, so the frame arriving
// brightens as it registers. Two materials of the strip, the same transport:
//   material 'film' (default): a black film base drawn at scale `k` from one geometry (strip.js: sprocket holes, a
//            variable-area optical track under each frame, cells that are frames `image`, assets `asset` or title
//            cards `title`), the frames veiled by their distance from the gate, the strip cut at its own ends
//   material 'gate': a band in the panel colour across the whole frame, a gate of width `gate.w` (16:9) with corner
//            marks, `holes` sprocket holes per frame, an edge code under each frame (its `label`, mono), everything
//            outside the gate under one veil
// Curves (how the strip gets from frame `from` to frame `to`):
//   'claw'     one cubic in-out over the whole move (a pull-down: at a quarter beat a projector's claw)
//   'brake'    a run at speed that brakes to a stop on a frame (an opening)
//   'run-out'  the strip leaves the gate accelerating, its tail passing through (a close; it ends at speed by design)
//   'step'     the intermittent movement over several frames: per frame a pull (`pull` of the frame's step, expo
//              in-out), then a hold
//   'run'      a flick: the strip is let go and coasts to the frame on exponential friction (`flick` { ramp, k })
// Theory: apparent motion and the projector's intermittent movement — each frame is held still in the gate and the
// change between holds is what is seen (Wertheimer 1912; the claw and Maltese-cross movements of cinema machines);
// object constancy: the strip is one object (Heer & Robertson 2007); a fixed aperture keeps the viewer's place
// (common region, Palmer 1992); motion streaks record real speed (Geisler 1999) and stop on the landing frame.
// Sources (borrowed grammar, not layout): the flatbed editing table's horizontal transport, contact-strip viewers,
// film-strip advance in title design.
//
// Film material params: `cells` [{ kind: 'image', img, crop } | { kind: 'asset', asset, focus } | { kind: 'title',
// text, size }, env (optical track envelope)], `cx`, `top`, `k` (1: frames 832 × 468 at a 860 px pitch), `veil`,
// `track` { lit, sweep }, `start`, `end`, `fonts.title`. Gate material params: `frames` [{ asset, label, focus }],
// `gate` { cx, cy, w }, `frameLine`, `margin`, `holes`, `veil`, `mono`. Either: `marks` (gate corner marks; default on
// for 'gate'), `beats` (the length; default by curve). `frames` also feed the film material (as `asset` cells).
// p = 0 paints the `from` rest and p = 1 the `to` rest exactly. paint() works without prepare() (a film may call the
// module's functions directly).

import { lerp, clamp, cubicInOut, seg, expInOut, rrect } from './util.js';
import { NEUTRAL, assetOf, veil as veilRect } from './asset.js';
import { coverView, paintView, placeholderFrame, caption, flick } from './stage.js';
import { paintStrip, cellFrame, S } from './strip.js';

const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
// the single-move curves, position 0 → 1 over p
export const CURVES = {
  claw: (p) => cubicInOut(p),
  brake: (p) => 1 - Math.pow(1 - p, 3),
  'run-out': (p) => Math.pow(p, 2.4),
};

// the gate material's geometry and frames (also built on the fly when paint() is called without prepare())
const gateOf = (P) => {
  const gw = P.gate.w, gh = Math.round((gw * 9) / 16);
  const gate = { x: P.gate.cx - gw / 2, y: P.gate.cy - gh / 2, w: gw, h: gh };
  const frames = (P.frames || []).map((f, i) => ({ A: assetOf(f.asset, () => placeholderFrame(i)), label: f.label || '', focus: f.focus }));
  return { gate, frames, pitch: gw + P.frameLine };
};
const cellsOf = (P) => (P.frames ? P.frames.map((f, i) => ({ kind: 'asset', asset: assetOf(f.asset, () => placeholderFrame(i)), focus: f.focus })) : P.cells);
const marksOf = (ctx, G, C) => {
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  const L = 44, g = 12;
  for (const [cx, cy, sx, sy] of [[G.x - g, G.y - g, 1, 1], [G.x + G.w + g, G.y - g, -1, 1], [G.x - g, G.y + G.h + g, 1, -1], [G.x + G.w + g, G.y + G.h + g, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * L); ctx.stroke();
  }
};

const paintGate = (ctx, St, P, D) => {
  const C = P.colors, G = D.gate, pitch = D.pitch;
  const top = G.y - P.margin, H = G.h + 2 * P.margin;
  ctx.fillStyle = C.panel; ctx.fillRect(0, top, 1920, H);
  const off = G.x - St.s * pitch;                      // film x of frame 0's left edge
  // sprocket holes, locked to the strip
  const hp = pitch / P.holes, hw = hp * 0.46, hh = 20;
  const k0 = Math.floor((0 - off) / hp) - 1, k1 = Math.ceil((1920 - off) / hp) + 1;
  ctx.fillStyle = C.ground;
  for (let k = k0; k <= k1; k++) {
    const x = off + k * hp + (hp - hw) / 2;
    rrect(ctx, x, top + 14, hw, hh, 5); ctx.fill();
    rrect(ctx, x, top + H - 14 - hh, hw, hh, 5); ctx.fill();
  }
  D.frames.forEach((f, i) => {
    const x = off + i * pitch;
    if (x > 1920 || x + G.w < 0) return;
    const r = { x, y: G.y, w: G.w, h: G.h };
    paintView(ctx, f.A, coverView(f.A, r, f.focus), r);
    if (f.label) caption(ctx, f.label, x + 4, top + H - 42, P, { size: 25 });
  });
  // outside the gate the strip steps back; the gate's corners are marked
  const v = P.veil ?? 0.6;
  veilRect(ctx, { x: 0, y: top, w: G.x - 6, h: H }, P, v);
  veilRect(ctx, { x: G.x + G.w + 6, y: top, w: 1920 - G.x - G.w - 6, h: H }, P, v);
  veilRect(ctx, { x: G.x - 6, y: top, w: G.w + 12, h: P.margin - 6 }, P, v * 0.5);
  veilRect(ctx, { x: G.x - 6, y: G.y + G.h + 6, w: G.w + 12, h: P.margin - 6 }, P, v * 0.5);
  if (P.marks !== false) marksOf(ctx, G, C);
};

export default {
  name: 'strip-advance',
  tier: 'T1',                       // a quarter-beat pull-down in a strip film is a T0; a brake or run-out at a chapter edge a T2
  beats: 1,
  beatsFor: (P) => P.beats ?? (P.curve === 'step' ? Math.max(1, (Math.abs(P.to - P.from) * 2) / 3) : P.curve === 'run' ? 1.5 : 1),
  modes: ['strip (the through-line: every move of the reel)', 'exhibit (a contact strip on the desk)', 'pulse', 'thread', 'phosphor', 'every mode with a sequence of frames'],
  roles: ['ground', 'base', 'hole', 'title', 'titleInk', 'trackDim', 'trackLit', 'panel', 'ink', 'dim'],
  from: 'frame `from` of a strip registered in the gate, the others stepped back',
  to: 'frame `to` registered in the gate (or, with run-out, the strip gone past the frame edge)',
  interpolates: ['strip position (frames: claw, brake, run-out, step or run)', 'veil per frame (film: its distance from the gate)', 'sprocket holes and edge codes (ride the strip)'],
  summary: 'Frames on a strip of film move through a fixed gate, a pull-down at a time or in one run, and stop with the next frame registered.',
  theory: 'Intermittent movement and apparent motion (Wertheimer 1912); one object throughout (Heer & Robertson 2007); a fixed aperture keeps the place (Palmer 1992); streaks record speed (Geisler 1999).',
  defaults: {
    material: 'film',
    cells: [{ kind: 'title', text: 'one' }, { kind: 'title', text: 'two' }, { kind: 'title', text: 'three' }],
    frames: null,                    // [{ asset, label, focus }]: the gate material's frames (or asset cells for 'film')
    from: 0, to: 1, curve: 'claw', beats: null,
    // film material
    cx: 960, top: 156, k: 1,
    veil: null,                      // film: darkness of a frame one cell or more from the gate (0.5); gate: outside it (0.6)
    track: null,                     // { lit, sweep } to draw the optical track
    start: 0, end: null,             // the strip's ends, in cells
    fonts: { title: { family: 'sans-serif', weight: 700 } },
    // gate material
    gate: { cx: 960, cy: 520, w: 1120 },  // gate width; height 16:9
    frameLine: 26,                   // film between frames
    margin: 84,                      // strip edge above and below the frames (holes, edge codes)
    holes: 10,                       // sprocket holes per frame pitch
    marks: null,                     // gate corner marks (null: on for 'gate', off for 'film')
    // curves
    pull: 0.5,                       // step: share of each frame's step spent moving (the rest holds)
    flick: { ramp: 0.2, k: 6 },      // run
    mono: { family: 'monospace', weight: 400 },
    colors: { ...NEUTRAL, ground: '#ECEFEE', base: '#0B0C0D', title: '#1B1D1F', titleInk: '#ECEFEE', trackDim: '#2A2D30', trackLit: '#C9CFCC' },
  },
  prepare(P) { return P.material === 'gate' ? gateOf(P) : null; },
  rest(side, P) { return { s: side === 'from' ? P.from : P.to }; },
  at(p, P) {
    if (P.curve === 'step' || P.curve === 'run') {
      const n = P.to - P.from;
      if (!n) return { s: P.from };
      if (P.curve === 'run') return { s: P.from + n * flick(p, P.flick.ramp, P.flick.k) };
      const m = Math.abs(n), k = Math.min(m - 1, Math.floor(p * m)), u = p * m - k;
      return { s: P.from + Math.sign(n) * (k + expInOut(seg(u, 0, P.pull))) };
    }
    return { s: lerp(P.from, P.to, (CURVES[P.curve] ?? CURVES.claw)(clamp(p))) };
  },
  paint(ctx, St, P, D) {
    const C = P.colors;
    if (P.ground !== false) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.ground; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
    if (P.material === 'gate') { paintGate(ctx, St, P, D && D.gate ? D : gateOf(P)); return; }
    const cells = cellsOf(P);
    paintStrip(ctx, C, P.fonts, {
      cells, s: St.s, cx: P.cx, top: P.top, k: P.k, start: P.start ?? 0, end: P.end ?? cells.length,
      veil: (d) => (P.veil ?? 0.5) * smooth(0.1, 0.6, Math.abs(d)), track: P.track,
    });
    if (P.marks) marksOf(ctx, cellFrame(0, 0, P.cx, P.top, P.k), C);
  },
  track: (St, P, D) => {
    if (P.material === 'gate') {
      const G = D && D.gate ? D : gateOf(P), x = G.gate.x - St.s * G.pitch;
      return [[x + clamp(P.from, 0, 99) * G.pitch, G.gate.y], [x + P.to * G.pitch, G.gate.y]];
    }
    const r = cellFrame(0, St.s, P.cx, P.top, P.k);
    return [[r.x, r.y]];
  },
  speed: (P) => S.PITCH * P.k,      // film material: px per cell
};

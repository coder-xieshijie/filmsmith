// split-fuse — a figure shown as its two parts, then fused: the parts hold apart so each is recognised, and slam
// together; on the slam the picture cuts to the whole figure under a flash, with a shock and a shake. Two entries, one
// parameter: `split` (the whole flies in or sits at the centre, flashes apart into its two parts, they hold, wind back
// and rush into one) and `converge` (the two parts enter from two edges of the frame, hover, and the lid slams down on
// the core). Two impacts: `burst` (two shock rings, sparks, a white-hot flash, a shake; the whole drawn over them) and
// `ring` (one wide ring, a glow and a full-frame white flash over the whole); either can shoot a line across the frame
// that lies flat (`line`), the stream thread's version of the hit.
// Own, from the stream films of the source production: its opening fusion (the parts entering from below and above)
// and its closing reveal (from the whole, split, hold, wind, slam). Changed: one brick with both entries as a parameter,
// colours by role, the parts' places and the times as parameters, drawn placeholders when no pictures are given, no
// labels (images only).
import { mix, rrect, canvasOf } from '../../../handoffs/util.js';
import { mulberry32 } from '../../../rng.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
const lerp = (a, b, k) => a + (b - a) * k;
const out3 = (k) => 1 - Math.pow(1 - k, 3), in3 = (k) => k * k * k;
const io2 = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const io3 = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const backOut = (k) => { const s1 = 1.70158, s3 = s1 + 1; return 1 + s3 * Math.pow(k - 1, 3) + s1 * Math.pow(k - 1, 2); };
const HEX = /^#([0-9a-fA-F]{6})$/;
const rgbOf = (h) => { const m = HEX.exec(h || ''); return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(',') : '0,0,0'; };
// a radial glow and the glowing line, as the stream thread draws them (prop/glow-thread/draw.js glow, thread)
const glow = (ctx, x, y, r, rgb, a) => {
  if (a <= 0.002 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
};
const line = (ctx, C, a, b, n, alpha, w = 1) => {
  if (alpha <= 0.002) return;
  const pts = Array.from({ length: n + 1 }, (_, k) => [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  [[16 * w, 0.07, C.line], [7 * w, 0.22, C.line], [2.6 * w, 0.95, C.glow]].forEach(([lw, al, col]) => {
    ctx.strokeStyle = `rgba(${col},${al * alpha})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
  });
};

// the times of each entry, in beats from the brick's start (`at` overrides any of them). split: the fly in (`fly0`,
// `fly1`, with `arrive`), the flash apart (`split`), apart (`apart`), the wind back (`wind0`, `wind1`), the slam, and
// `still` (the whole stops floating; the end). converge: each part's entry (`in`, [start, end] per part), the lid's fall
// (`drop`), the slam. Defaults at 128 BPM from the source films.
const AT = {
  split: { fly0: 0, fly1: 0, split: 2, apart: 3.17, wind0: 4.47, wind1: 5.57, slam: 6, still: 10 },
  converge: { in: [[0.64, 1.92], [1.6, 2.88]], drop: 4.69, slam: 5.76 },
};
const BEATS = { split: 10, converge: 7.36 };
const entryOf = (P) => (P.entry === 'converge' ? 'converge' : 'split');
const timesOf = (P) => { const e = entryOf(P); return { ...AT[e], ...(P.at || {}) }; };
const beatsOf = (P) => (Number.isFinite(P.beats) && P.beats > 0 ? P.beats : BEATS[entryOf(P)]);

export default {
  id: 'split-fuse', kind: 'motion',
  tier: 'T3', family: 'shape', beats: 10,
  beatsFor: beatsOf,
  surface: ['canvas'],
  roles: ['ground', 'accent'],
  from: 'the scene under the figure (a painter, drawn first and shaken with it), or nothing (`from: \'none\'`): the host\'s picture under the canvas',
  to: 'the same scene with the whole figure fused at the centre (and the line lying flat, with `line`)',
  interpolates: ['split: the whole flies in, flashes apart into two parts that hold, wind back and rush into one', 'converge: two parts enter from two edges with an overshoot, hover, the lid falls on the core', 'the slam: a cut to the whole under a flash, the shock (rings, sparks or one wide ring), a shake, a squash and its rebound'],
  summary: 'A figure shown as its two parts, then fused: from the whole (split) or from two edges (converge) the parts hold apart, then slam together into the whole under a flash, a shock and a shake.',
  theory: 'Taking a thing apart before the viewer and putting it back shows what it is made of (the exploded view, made temporal); the held separation gives each part its glance, the wind back is anticipation (Thomas & Johnston, The Illusion of Life: anticipation, squash and stretch), and the cut on the impact hides the change of picture inside the flash (cutting on action).',
  sceneRest: true,
  // whole: the fused figure (an image URL; null: a drawn placeholder); parts: its two parts, [0] the core and [1] the lid,
  // each { image, at: [x, y] (rest centre while apart), h (rest height; converge: w, its width), rot (split, rad),
  // from ('top' | 'bottom' | 'left' | 'right', converge: the edge it enters from), into: [fx, fy, fw] (converge: where
  // it sits in the whole at the slam, as fractions of the whole's box: centre x, centre y, width) or 'cut' (a cut-out of
  // the whole image at the same scale, on its top edge and centred on it) }; center, size: the whole's centre and height
  defaults: () => ({
    entry: 'split', whole: null, parts: null, center: [960, 430], size: 420,
    arrive: null, impact: null, line: null, shake: null, halo: null, from: null, veil: null, at: null, beats: null, seed: 77, blur: false,
  }),
  async prepare(P) {
    const load = async (src) => { if (typeof src !== 'string' || !src || typeof Image === 'undefined') return null; const im = new Image(); im.src = src; try { await im.decode(); return im; } catch { return null; } };
    const c = P.colors || {}, accent = c.accent || c.ink || '#000000', ground = c.ground || '#ffffff';
    const C = { line: rgbOf(accent), glow: rgbOf(HEX.test(c.glow || '') ? c.glow : mix(accent, '#ffffff', 0.45)), core: rgbOf(HEX.test(c.core || '') ? c.core : mix(accent, '#ffffff', 0.9)) };
    const parts = Array.isArray(P.parts) ? P.parts : [{}, {}];
    const whole = await load(P.whole), ims = await Promise.all([0, 1].map((k) => load(parts[k]?.image)));
    // placeholders: a rounded badge in the ink with an accent core; its top half the lid, its bottom half the core
    const ph = (w, h, draw) => { if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') return null; const cv = canvasOf(w, h); draw(cv.getContext('2d', { willReadFrequently: true })); return cv; };
    const ink = c.ink || mix(ground, '#000000', 0.85), S = 400;
    const badge = (x, y0, y1) => { x.save(); x.beginPath(); x.rect(0, y0, S, y1 - y0); x.clip(); rrect(x, 20, 20, S - 40, S - 40, 90); x.fillStyle = ink; x.fill(); x.beginPath(); x.arc(S / 2, S * 0.56, 86, 0, Math.PI * 2); x.fillStyle = accent; x.fill(); x.restore(); };
    const W = whole || ph(S, S, (x) => badge(x, 0, S));
    const parts0 = [ims[0] || ph(S, S / 2, (x) => { x.translate(0, -S / 2); badge(x, S / 2, S); }), ims[1] || ph(S, S / 2, (x) => badge(x, 0, S / 2))];
    return { C, whole: W, parts: parts0, own: !!whole, rgbGround: rgbOf(ground), from: typeof P.from === 'function' ? P.from : null, veil: typeof P.veil === 'function' ? P.veil : null };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  // the state at p: the time in seconds from the start (t), the times (A, seconds) and the shake
  at(p, P) {
    const B = 60 / (Number(P.bpm) || 120), beats = beatsOf(P), t = p * beats * B, A = {};
    for (const [k, v] of Object.entries(timesOf(P))) A[k] = Array.isArray(v) ? v.map((x) => x.map((y) => y * B)) : v * B;
    const k = t - A.slam, sh = this.shakeOf(P), shake = k > 0 && k < 0.3 && sh > 0 ? (() => { const r = mulberry32(Math.floor(k * 30) + 11); const s = sh * (1 - k / 0.3); return [(r() - 0.5) * 2 * s, (r() - 0.5) * 2 * s]; })() : [0, 0];
    return { p, t, A, B, shake };
  },
  impactOf: (P) => (P.impact === 'ring' || P.impact === 'burst' ? P.impact : entryOf(P) === 'converge' ? 'ring' : 'burst'),
  shakeOf(P) { return Number.isFinite(P.shake) ? Math.max(0, P.shake) : this.impactOf(P) === 'burst' ? 14 : 0; },
  // the sound's hooks, in beats from the start: pull (the fly in), split, riser (the wind back), enter (each part, converge),
  // fall (the lid, converge), slam (the hit: the heavy one, a low impact)
  cues(P) {
    const a = timesOf(P);
    if (entryOf(P) === 'converge') return [...a.in.map((w, i) => ({ beat: w[0], kind: 'enter', i })), { beat: a.drop, kind: 'fall', dur: a.slam - a.drop }, { beat: a.slam, kind: 'slam' }];
    return [...(P.arrive && a.fly1 > a.fly0 ? [{ beat: a.fly0, kind: 'pull', dur: a.fly1 - a.fly0 }] : []), { beat: a.split, kind: 'split' }, { beat: a.wind0, kind: 'riser', dur: a.slam - a.wind0 }, { beat: a.slam, kind: 'slam' }];
  },
  peakAt: (P) => timesOf(P).slam,
  // a picture by height h with its centre at (x, y): `foot` squashes about its foot (the split's whole and parts), else
  // about its centre; a halo in the accent behind it
  pic(ctx, im, x, y, h, D, { a = 1, sq = 0, rot = 0, halo = 0, foot = true } = {}) {
    if (!im || a <= 0.003 || h <= 1) return;
    const w = (im.width / im.height) * h;
    if (halo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 0.95 * Math.max(w, h), D.C.line, halo * a); ctx.restore(); }
    ctx.save(); ctx.globalAlpha *= a;
    if (foot) { ctx.translate(x, y + h / 2); ctx.rotate(rot); ctx.scale(1 + sq, 1 - sq); ctx.drawImage(im, -w / 2, -h, w, h); }
    else { ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(1 + sq, 1 - sq); ctx.drawImage(im, -w / 2, -h / 2, w, h); }
    ctx.restore();
  },
  paint(ctx, S, P, D) {
    ctx.save();
    if (S.shake[0] || S.shake[1]) ctx.translate(S.shake[0], S.shake[1]);
    if (D.from) D.from(ctx, S);
    else if (P.from !== 'none') { ctx.fillStyle = P.colors?.ground || '#ffffff'; ctx.fillRect(-40, -40, 2000, 1160); }
    if (entryOf(P) === 'converge') this.converge(ctx, S, P, D); else this.split(ctx, S, P, D);
    ctx.restore();
  },

  // ---- split: from the whole (the closing reveal) ----
  split(ctx, S, P, D) {
    const { t, A } = S, C = D.C, [cx, cy] = P.center, H = P.size, u = H / 420, parts = Array.isArray(P.parts) ? P.parts : [{}, {}];
    const ar = P.arrive && Array.isArray(P.arrive.at) ? P.arrive : null;
    const fly = ar ? io3(seg(t, A.fly0, A.fly1)) : 1;
    if (t < A.split) {
      const x = ar ? lerp(ar.at[0], cx, fly) : cx, y = ar ? lerp(ar.at[1], cy, fly) : cy;
      const pulse = seg(t, A.split - 0.5, A.split);
      if (ar && fly <= 0) { // on its perch: the slot's 60 px box, its halo
        const s2 = (ar.h || 60) / 60, im = D.whole, k = 60 / Math.max(im.width || 60, im.height || 60);
        ctx.save(); ctx.translate(x, y); ctx.scale(s2, s2); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 74, C.line, 0.32); ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(im, -(im.width * k) / 2, -(im.height * k) / 2, im.width * k, im.height * k); ctx.restore();
      } else {
        const h = ar ? lerp(ar.h || 60, H * 0.92, fly) : H * 0.92;
        const bob = Math.sin((t - A.fly1) * 3) * 4 * seg(t, A.fly1, A.fly1 + 0.3);
        this.pic(ctx, D.whole, x, y + bob, h, D, { halo: lerp(0.32, 0.22, fly) + 0.4 * pulse });
      }
      // a short trail of the line behind it while it flies
      if (ar && fly > 0 && fly < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; line(ctx, C, ar.at, [lerp(ar.at[0], x, 0.8), lerp(ar.at[1], y, 0.8)], 30, 0.6 * (1 - fly)); ctx.restore(); }
      return;
    }
    // apart: the two parts leave the centre; they wind back a little, then rush into one
    const out = out3(seg(t, A.split, A.apart)), wind = io2(seg(t, A.wind0, A.wind1)), rush = in3(seg(t, A.wind1, A.slam));
    if (t < A.slam) {
      const DEF = [
        { from: [0, 40, 260], at: [cx - 360, cy + 90], h: 310, rot: -0.1, wind: [-50, 0, 0.05], land: [0, 60, 0.9], bob: [6, 2.6, 0] },
        { from: [0, -20, 320], at: [cx + 360, cy + 10], h: 380, rot: 0.12, wind: [50, -40, -0.06], land: [0, -10, 1.06], bob: [7, 2.2, 1.4] },
      ];
      [0, 1].forEach((k) => {
        const q = { ...DEF[k], ...(parts[k] || {}) }, bob = Math.sin((t - A.split) * q.bob[1] + q.bob[2]) * q.bob[0] * u;
        const x = lerp(lerp(cx + q.from[0] * u, q.at[0], out) + q.wind[0] * u * wind, cx + q.land[0] * u, rush);
        const y = lerp(lerp(cy + q.from[1] * u, q.at[1], out) + bob + q.wind[1] * u * wind, cy + q.land[1] * u, rush);
        const h = lerp(q.from[2] * u, q.h, out) * lerp(1, q.land[2], rush);
        this.pic(ctx, D.parts[k], x, y, h, D, { rot: (q.rot * out + q.wind[2] * wind) * (1 - rush), halo: 0.24 });
      });
      // the flash as it comes apart
      const fl = 1 - seg(t, A.split, A.split + 0.3);
      if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx, cy, 420 * u, C.glow, 0.7 * fl); glow(ctx, cx, cy, 90 * u, C.core, fl); ctx.restore(); }
      return;
    }
    this.impact(ctx, S, P, D);
  },

  // ---- converge: from two edges (the opening fusion) ----
  converge(ctx, S, P, D) {
    const { t, A } = S, C = D.C, [cx, cy] = P.center, H = P.size, parts = Array.isArray(P.parts) ? P.parts : [{}, {}];
    const wh = D.whole, W = (wh.width / wh.height) * H, top = cy - H / 2, k0 = H / wh.height;
    // the veil: a ground faded in behind the parts so they read alone, lifted on the slam
    const vA = out3(seg(t, 0, 0.4)) * (1 - seg(t, A.slam, A.slam + 0.1));
    if (D.veil && vA > 0.001) { ctx.save(); ctx.globalAlpha = vA; D.veil(ctx, S); ctx.restore(); }
    if (t < A.slam) {
      const fall = in3(seg(t, A.drop, A.slam));
      const DEF = [
        { from: 'bottom', at: [cx, cy + 120], w: 250, into: [0.5, 0.565, 0.775] },
        { from: 'top', at: [cx, cy - 265], w: 300, into: 'cut' },
      ];
      const off = { bottom: [0, 1280], top: [0, -300], left: [-300, 0], right: [2220, 0] };
      const ph = [0, 1.7];
      const draw = [];
      [0, 1].forEach((k) => {
        const q = { ...DEF[k], ...(parts[k] || {}) }, im = D.parts[k], w0 = q.w, inK = seg(t, A.in[k][0], A.in[k][1]);
        const hov = 7 * Math.sin(t * 2.6 + ph[k]) * (1 - fall);
        const o = off[q.from] || off.bottom, vertical = !o[0];
        const x0 = vertical ? q.at[0] : lerp(o[0], q.at[0], backOut(inK)), y0 = vertical ? lerp(o[1], q.at[1], backOut(inK)) + hov : q.at[1] + hov;
        // where it sits in the whole at the slam
        const into = q.into === 'cut' ? { cx, cy: top + (im.height * k0) / 2, w: im.width * k0 } : { cx: cx - W / 2 + q.into[0] * W, cy: top + q.into[1] * H, w: q.into[2] * W };
        // the lid falls on the curve of a drop (in3); the core eases in from just before it, crouching first
        const m = k === 1 ? fall : io2(seg(t, A.drop - 0.15, A.slam));
        const x = lerp(x0, into.cx, m), y = lerp(y0, into.cy, m), w = lerp(w0, into.w, m);
        const ant = k === 0 ? Math.sin(Math.PI * seg(t, A.drop - 0.25, A.drop + 0.1)) * 0.08 : 0;
        const rot = k === 1 ? 0.06 * (1 - fall) * Math.sin(t * 1.3) : 0;
        draw.push({ im, x, y, w, a: Math.min(1, inK * 3), inK, ant, rot });
      });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (draw[0].inK > 0) glow(ctx, draw[0].x, draw[0].y, 190, C.line, 0.28 * Math.min(1, draw[0].inK * 2));
      if (draw[1].inK > 0) glow(ctx, draw[1].x, draw[1].y, 200, C.glow, 0.16 * Math.min(1, draw[1].inK * 2));
      ctx.restore();
      draw.forEach((d) => {
        if (d.a <= 0.001 || !d.im) return; const h = (d.w * d.im.height) / d.im.width;
        ctx.save(); ctx.globalAlpha *= d.a; ctx.translate(d.x, d.y); if (d.rot) ctx.rotate(d.rot); ctx.scale(1 + d.ant, 1 - d.ant); ctx.drawImage(d.im, -d.w / 2, -h / 2, d.w, h); ctx.restore();
      });
    }
    if (t >= A.slam - 0.001) this.impact(ctx, S, P, D);
    else if (this.impactOf(P) === 'ring') this.ringFx(ctx, S, P, D); // the ring's glow starts a frame before the slam
  },

  // ---- the impact: the whole at the centre and its shock ----
  impact(ctx, S, P, D) {
    const { t, A } = S, C = D.C, [cx, cy] = P.center, H = P.size, k = t - A.slam;
    const ln = P.line && Number.isFinite(P.line.y) ? P.line : null;
    // the line shoots both ways across the frame and settles flat at line.y (it stays)
    const shoot = (c) => {
      const s2 = out3(seg(k, 0.02, 0.4)); if (s2 <= 0 || !ln) return;
      const half = 980 * s2, y = lerp(cy + H / 2, ln.y, io2(seg(k, 0, 0.35)));
      line(c, C, [cx - half, y], [cx + half, y], 40, lerp(1.3, 0.75, seg(k, 0.4, 1.2)), lerp(1.7, 1, seg(k, 0, 0.6)));
      glow(c, cx - half, y, 40, C.core, 0.9 * (1 - s2)); glow(c, cx + half, y, 40, C.core, 0.9 * (1 - s2));
    };
    if (this.impactOf(P) === 'ring') {
      const b = seg(t, A.slam, A.slam + 0.32), sq = 0.24 * Math.sin(Math.PI * b) * (1 - b);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; shoot(ctx); ctx.restore();
      this.pic(ctx, D.whole, cx, cy, H, D, { sq, foot: false, halo: Number.isFinite(P.halo) ? P.halo : 0 });
      this.ringFx(ctx, S, P, D);
      return;
    }
    // burst: the whole squashes and rebounds over the rings, the sparks and the white-hot flash
    const sq = 0.16 * Math.sin(Math.PI * clamp(k / 0.3)) * (1 - clamp(k / 0.3)) + 0.05 * Math.sin(Math.PI * seg(k, 0.3, 0.55));
    const u = H / 420, oy = cy + 40 * u;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    shoot(ctx);
    [0, 0.12].forEach((d, j) => { const q = seg(k, d, d + 0.75); if (q > 0 && q < 1) { ctx.strokeStyle = `rgba(${j ? C.line : C.glow},${(0.85 * (1 - q)).toFixed(3)})`; ctx.lineWidth = lerp(14, 2, q); ctx.beginPath(); ctx.arc(cx, oy, lerp(160 * u, 1150, out3(q)), 0, Math.PI * 2); ctx.stroke(); } });
    if (k < 1.0) { const rnd = mulberry32(Number.isFinite(P.seed) ? P.seed : 77); for (let i = 0; i < 28; i++) { const ang = rnd() * Math.PI * 2, sp = 380 + rnd() * 520, q = out3(clamp(k / 0.9)), r = sp * q; glow(ctx, cx + Math.cos(ang) * r, oy + Math.sin(ang) * r * 0.8, 10 + rnd() * 10, C.glow, 0.9 * (1 - clamp(k / 0.9))); } }
    const fl = 1 - out3(seg(k, 0, 0.32));
    if (fl > 0) { glow(ctx, cx, cy, 900 * u, C.core, 0.8 * fl); glow(ctx, cx, cy, 260 * u, C.core, fl); }
    ctx.restore();
    // it floats gently after the hit, and stops at `still`
    const bob = Math.sin(k * 2.4) * 5 * seg(k, 0.6, 1.2) * (1 - io2(seg(t, A.still - 0.6, A.still)));
    this.pic(ctx, D.whole, cx, cy + bob, H, D, { sq, halo: (Number.isFinite(P.halo) ? P.halo : 0.36) + 0.4 * fl });
  },
  // ring: a wide glow, one ring in three strokes and a full-frame white flash, over the whole
  ringFx(ctx, S, P, D) {
    const { t, A } = S, C = D.C, [cx, cy] = P.center, u = P.size / 260;
    const k = seg(t, A.slam - 0.02, A.slam + 0.75);
    if (!(k > 0 && k < 1)) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, cx, cy, 520 * u, C.line, 0.75 * Math.pow(1 - k, 2));
    glow(ctx, cx, cy, 120 * u, C.core, 0.9 * Math.pow(1 - k, 3));
    const r = lerp(90 * u, 980, out3(k));
    [[22, 0.10, C.line], [9, 0.30, C.line], [3, 0.9, C.glow]].forEach(([lw, al, col]) => { ctx.strokeStyle = `rgba(${col},${al * (1 - k)})`; ctx.lineWidth = lw * (1 - 0.6 * k); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.restore();
    const fl = seg(t, A.slam - 0.03, A.slam) * (1 - seg(t, A.slam + 0.02, A.slam + 0.32));
    if (fl > 0.001) { ctx.save(); ctx.globalAlpha = 0.88 * fl; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-40, -40, 2000, 1160); ctx.restore(); }
  },
  blur: (p, P) => P.blur === true,
  // the whole's centre, floating after a burst (the end-of-move check: it stops at `still`)
  track(S, P) {
    const k = S.t - S.A.slam, bob = this.impactOf(P) === 'burst' && k > 0 ? Math.sin(k * 2.4) * 5 * seg(k, 0.6, 1.2) * (1 - io2(seg(S.t, S.A.still - 0.6, S.A.still))) : 0;
    return [[P.center[0], P.center[1] + bob]];
  },
};

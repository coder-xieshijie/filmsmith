// cover-rise — a cover rises from the bottom edge and covers the frame: its face is a gradient (the next scene's ground,
// as the lock-up's) or a picture. The scene it covers is drawn by the brick (a placeholder, or a painter), or left out
// (`from: 'none'`) so the real picture under the canvas (the host's previous clip) shows until the cover passes; the next
// scene is drawn over the landed cover, or left out (`to: 'none'`) so the cover itself is what the next clip opens on.
// From the stream original K (the source film, the sweep before the lock-up: a gradient from
// below, yPercent 100 → 0 over 0.258 s, power3.inOut). Changed: a brick with roles and a picture face; the length in beats.
import { mix, rgba } from '../../../handoffs/util.js';
import { painterOf } from '../../sample.js';

const io3 = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2); // power3.inOut
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const HEX = /^#[0-9a-fA-F]{6}$/;

export default {
  id: 'cover-rise', kind: 'motion',
  tier: 'T1', family: 'vertical', beats: 1,
  // `beats` (0.25–2, default 1): the rise's length; K's sweep was about half a beat at 128 BPM
  beatsFor: (P) => (Number.isFinite(P.beats) ? Math.min(2, Math.max(0.25, P.beats)) : 1),
  surface: ['canvas'],
  roles: ['ground', 'accent'],
  from: 'the current scene, full frame; or nothing (`from: \'none\'`): the real picture under the canvas',
  to: 'the next scene drawn over the landed cover; or the cover alone (`to: \'none\'`): the next clip opens on it',
  interpolates: ['the cover\'s top edge from the bottom of the frame to its top (power3 in-out)', 'a soft shade on the covered scene just ahead of the edge', 'the next scene fades in over the last 15 % (when drawn)'],
  summary: 'A cover rises from the bottom edge and fills the frame: a gradient (the next ground) or a picture, over the scene, the real one under the canvas or a drawn one.',
  theory: 'A wipe by a surface that becomes the next ground hides the cut inside a move (the edge carries the eye up, the picture behind it changes while covered: continuity editing\'s cut on action, Murch, In the Blink of an Eye); from below it reads as rising, a lift into the ending.',
  sceneRest: true,
  // stops: the cover's gradient, top to bottom (hex; default the ground lightened to the accent); image: a picture face
  // (fills the frame, cropped); shade: the shade's strength on the covered scene
  defaults: () => ({ from: { scene: 'title' }, to: { scene: 'detail' }, stops: null, image: null, shade: 0.35 }),
  async prepare(P) {
    let img = null;
    if (typeof P.image === 'string' && P.image && typeof Image !== 'undefined') { img = new Image(); img.src = P.image; try { await img.decode(); } catch { img = null; } }
    return { from: P.from === 'none' ? null : painterOf(P.from, P), to: P.to === 'none' ? null : painterOf(P.to, P), img };
  },
  rest(side, P, D) { return this.at(side === 'from' ? 0 : 1, P, D); },
  at(p) { const e = io3(p); return { p, e, y: 1080 * (1 - e) }; },
  face(ctx, P, D) {
    const c = P.colors || {};
    if (D.img) {
      const im = D.img, r = Math.max(1920 / im.naturalWidth, 1080 / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
      ctx.drawImage(im, (1920 - w) / 2, (1080 - h) / 2, w, h); return;
    }
    const ground = c.ground || '#ffffff', accent = c.accent || c.ink || '#000000';
    const stops = Array.isArray(P.stops) && P.stops.filter((x) => HEX.test(x)).length >= 2 ? P.stops.filter((x) => HEX.test(x)) : [mix(ground, '#ffffff', 0.85), accent];
    const g = ctx.createLinearGradient(0, 0, 0, 1080);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
  },
  paint(ctx, S, P, D) {
    if (S.e <= 0) { if (D.from) D.from(ctx); return; }
    if (S.e >= 1 && D.to) { D.to(ctx, 1); return; }
    if (D.from && S.e < 1) D.from(ctx);
    const y = S.y, c = P.colors || {};
    // the shade on the covered scene, ahead of the edge
    if (S.e < 1) {
      const shade = mix(c.ground || '#000000', '#000000', 0.8), g = ctx.createLinearGradient(0, y, 0, y - 120);
      g.addColorStop(0, rgba(shade, P.shade)); g.addColorStop(1, rgba(shade, 0));
      ctx.fillStyle = g; ctx.fillRect(0, y - 120, 1920, 120);
    }
    // the cover: its face fixed to the frame, revealed from the edge down (the gradient lands where the next scene has it)
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1920, 1080 - y); ctx.clip(); this.face(ctx, P, D); ctx.restore();
    if (D.to) { const a = seg(S.e, 0.85, 1); if (a > 0) { ctx.save(); ctx.globalAlpha = a; D.to(ctx, 1); ctx.restore(); } }
  },
  blur: () => false,
  // the edge's middle
  track(S) { return [[960, S.y]]; },
};

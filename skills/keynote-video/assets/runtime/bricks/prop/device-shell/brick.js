// device-shell — one code-drawn device, head-on: a laptop (a 1192 × 800 lid with a 16:10 screen, a chin that names the
// screen's source, an 18 px deck with a thumb notch, a camera dot) or a phone (440 × 920, the source line under it).
// No shadow, no reflection, no tilt: the lid's fill sits close to the ground and its 2 px edge is the outline. The
// screen shows a real capture through a view (never a drawn UI); without one, the neutral placeholder page.
// States: off → drawn (the edge draws out from the camera dot both ways) → lit (the screen comes up from the glass)
// → sourced (the chin's source line). From the handset template (choreo.js DEVICES, film.js paintDevice).
import { clamp } from '../../../handoffs/util.js';
import { deviceOf, paintDevice, captureOf, viewOf, asView, drawCapture, tones } from './device.js';

export default {
  id: 'device-shell', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { off: { edge: 0, fill: 0, lit: 0, chin: 0 }, drawn: { edge: 1, fill: 1, lit: 0, chin: 0 }, lit: { edge: 1, fill: 1, lit: 1, chin: 0 }, sourced: { edge: 1, fill: 1, lit: 1, chin: 1 } },
  parts: ['lid', 'edge', 'screen', 'chin', 'deck', 'camera'],
  swap: {
    screen: { type: 'image', crop: true, optional: true },
    chin: { type: 'text', tier: 'glance', limits: { en: { words: 6, chars: 44 }, zh: { chars: 22 } } },
  },
  roles: ['ground', 'panel', 'line', 'dim', 'glass', 'deck', 'deckEdge', 'cam'],
  defaults: (ctx = {}) => ({ device: 'laptop', screen: null, chin: ctx.lang === 'zh' ? '产品文档 · 正式版截图' : 'docs.example.dev/start' }),
  draw(g, s, P) {
    const C = P.colors, D = deviceOf(P.device), A = captureOf(P.screen), v = asView(viewOf(A, 'rest', D));
    g.save(); g.scale(P.w / 1920, P.h / 1080);
    g.fillStyle = C.ground; g.fillRect(0, 0, 1920, 1080);
    paintDevice(g, D, C, {
      edge: s.edge, fill: s.fill, lang: P.lang, chin: P.chin, chinAlpha: s.chin,
      screen: (q) => { if (s.lit > 0) { drawCapture(q, A, v, D); q.fillStyle = tones(C).glass; q.globalAlpha = clamp(1 - s.lit); q.fillRect(0, 0, D.screen.w, D.screen.h); q.globalAlpha = 1; } },
    });
    g.restore();
  },
};

// film-strip — one strip of film on the light box: a black base with sprocket holes along both edges (the light box
// shows through them), frames 832 × 468 a pitch of 860 apart, a variable-area optical track beside each frame, and
// intertitles as frames of their own (a dark frame with the line set in it). A frame registered in the fixed gate is
// the one in view; its neighbours step back under a veil. States: blank (a leader) → loaded (frames in) → tracked
// (the optical track lit). From the strip template (lib/handoffs/strip.js paintStrip, paintTrack; film.js gate).
import { stripParams, paintReel, gateCorners, lightbox, fonts, sampleEnv, GATE } from './reel.js';
import { placeholderFrame } from '../../../handoffs/stage.js';

export default {
  id: 'film-strip', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  states: { blank: { loaded: 0, lit: 0 }, loaded: { loaded: 1, lit: 0 }, tracked: { loaded: 1, lit: 1 } },
  parts: ['base', 'holes', 'frame', 'frame line', 'optical track', 'intertitle', 'gate corners'],
  swap: {
    frame: { type: 'image', crop: true, optional: true },
    title: { type: 'text', tier: 'primary', limits: { en: { words: 3, chars: 16 }, zh: { chars: 8 } } },
  },
  roles: ['ground', 'glow', 'base', 'hole', 'title', 'titleInk', 'trackDim', 'trackLit', 'line'],
  defaults: (ctx = {}) => ({ frame: null, title: ctx.lang === 'zh' ? '用代码配乐。' : 'Scored in code.' }),
  draw(g, s, P) {
    const F = fonts(P.lang), img = P.frame?.image || placeholderFrame(4), crop = P.frame?.crop || [0, 0, img.width, img.height];
    const cells = s.loaded > 0 ? [{ kind: 'image', img: placeholderFrame(3), crop: [0, 0, 1920, 1080], env: sampleEnv(2) }, { kind: 'title', text: P.title, size: 79, env: sampleEnv(5) }, { kind: 'image', img, crop, env: sampleEnv(7) }] : [{ kind: 'title', text: '' }, { kind: 'title', text: '' }, { kind: 'title', text: '' }];
    g.save(); g.scale(P.w / 1920, P.h / 1080);
    lightbox(g, P.colors);
    paintReel(g, stripParams(P.colors, F, cells), 1, { track: { lit: s.lit } });
    gateCorners(g, P.colors);
    g.restore();
  },
};

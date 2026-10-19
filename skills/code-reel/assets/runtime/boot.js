// boot.js — wire a template to HyperFrames.
//
// HyperFrames renders frame by frame and dispatches `hf-seek` with the exact time of each frame.
// Templates draw everything from render(t), so a frame rendered alone matches a frame rendered in sequence.
// A paused GSAP timeline is registered as window.__timelines.main so Studio can scrub; a proxy tween
// calls render(t) while scrubbing. GSAP is loaded by index.html from lib/vendor/gsap.min.js (setup-vendor.mjs).
//
// Usage in index.html (module script):
//   import { boot } from './lib/boot.js';
//   boot({ id: 'film', duration: FILM.duration, ready: () => fontsReady(FONTS), render });

import { errorBanner } from './text.js';

export const boot = ({ id = 'film', duration, ready = async () => {}, render }) => {
  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  window.__timelines = window.__timelines || {};
  // A slow ready() (a large fetch, a bake to decode) must hold the renderer from its first readiness check, which can
  // run before this module does: index.html may pre-register the hold in a classic <script> with holdBuild() below,
  // and boot() then settles that same promise.
  let resolve;
  const held = window.__hf.buildHold?.[id];
  if (held) resolve = held;
  else window.__hf.buildReady[id] = new Promise((r) => (resolve = r));

  // A seek can arrive before fonts and layout are ready; hold the latest one and draw it once ready.
  let isReady = false, pending = 0;
  const paint = (t) => render(Math.min(Math.max(t, 0), duration - 1e-4));
  const draw = (t) => (isReady ? paint(t) : (pending = t));
  window.addEventListener('hf-seek', (e) => draw(e.detail.time));
  window.__renderAt = draw;

  // A failing ready() (a font, a data import) must not hang the render on buildReady: report it as a red
  // banner and a console error, which `hyperframes check` lists under runtime, then draw what there is.
  Promise.resolve()
    .then(ready)
    .catch((e) => {
      const msg = `ready() failed: ${e?.message ?? e}`;
      console.error(msg);
      errorBanner(['BUILD FAILED', msg], 'hf-ready-error');
    })
    .then(() => {
      isReady = true;
      const tl = window.gsap ? window.gsap.timeline({ paused: true }) : null;
      if (tl) {
        const proxy = { t: 0 };
        tl.to(proxy, { t: duration, duration, ease: 'none', onUpdate: () => draw(proxy.t) }, 0);
        window.__timelines.main = tl;
      }
      try { draw(pending); } finally { resolve(); }
    });
};

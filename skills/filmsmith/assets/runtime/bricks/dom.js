// dom.js — what the dom-surface bricks share (SPEC 2.3): build a rig of absolutely placed elements once, then write
// transforms and opacity on every pose. Nothing is read back from the page; every pose rewrites the whole rig.

export const el = (tag, style = {}, parent = null, attrs = {}) => {
  const e = document.createElement(tag);
  Object.assign(e.style, style);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};

// A full-frame 3D stage: perspective on the stage, preserve-3d on the world inside it.
export const stage3d = (root, { perspective = 1500, origin = '960px 540px', ground = null } = {}) => {
  const stage = el('div', { position: 'absolute', inset: '0', overflow: 'hidden', perspective: `${perspective}px`, perspectiveOrigin: origin, background: ground || 'transparent' }, root);
  const world = el('div', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px', transformStyle: 'preserve-3d', transformOrigin: '0 0' }, stage);
  return { stage, world };
};

// A plane of w × h px holding a canvas painted once by paint(ctx) (a scene, a page, a card).
export const plane = (parent, w, h, paint, { radius = 0, shadow = null } = {}) => {
  const p = el('div', { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px`, transformOrigin: '0 0', backfaceVisibility: 'hidden', borderRadius: `${radius}px`, overflow: 'hidden', boxShadow: shadow || 'none' }, parent);
  const c = el('canvas', { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px` }, p);
  c.width = w; c.height = h;
  if (paint) paint(c.getContext('2d'));
  p.canvas = c;
  return p;
};

// CSS number formatting with fixed precision, so the same state writes the same string.
export const n = (v, d = 4) => (Math.abs(v) < 1e-9 ? '0' : v.toFixed(d));
export const matrix3d = (m) => `matrix3d(${m.map((v) => n(v, 6)).join(',')})`;

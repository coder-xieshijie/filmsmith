// Tools: one paused main timeline, stateful tweens and deterministic randomness.
// Stateful: every element remembers the last value scheduled for each property and to() continues from there, so seeking to any frame gives the same picture.
//   init(e, {opacity:0, x:0})          register starting values first (applied at once); to() on an unregistered property throws "not initialised"
//   to(e, {opacity:1}, t, d, ease)     schedule a tween at t seconds; set(e, p, t) is instant; assume(e, p) records without setting
//   show / hide / pop / blurIn / blurOut / draw (DrawSVG, drawn in one stroke) / txt (swap text) / roll (a number rolling frame by frame)
//   rng(seed) returns a 0–1 pseudo-random function; hash(n, s) a sine hash. Never Date or Math.random.
//   el / div / svgEl / svgText create elements; boxTo(e, fromBox, toBox, t, d) moves an element from its layout box to another box (x, y, scaleX, scaleY, origin top-left)
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);
  const tl = gsap.timeline({ paused: true });
  const $ = (id) => document.getElementById(id);
  const st = new Map();
  const merge = (cur, p) => { const n = Object.assign({}, cur, p); if (p.attr) n.attr = Object.assign({}, cur.attr || {}, p.attr); return n; };
  // A zero-length stroke with round caps still paints a dot: hide it (visibility hidden) whenever its drawn length is 0
  const zeroLen = (v) => { if (typeof v !== 'string') return false; const m = v.trim().split(/\s+/).map(parseFloat); return m.length === 1 ? m[0] === 0 : m[0] === m[1]; };
  const init = (e, p) => { if (p.drawSVG !== undefined && p.visibility === undefined) p = Object.assign({}, p, { visibility: zeroLen(p.drawSVG) ? 'hidden' : 'visible' }); gsap.set(e, p); st.set(e, merge(st.get(e) || {}, p)); return e; };
  const vis = (e, v, t) => { const c = st.get(e) || {}; if (c.visibility === undefined || c.visibility === v) return; tl.fromTo(e, { visibility: c.visibility }, { visibility: v, duration: 0.001, ease: 'none', immediateRender: false }, t); st.set(e, merge(c, { visibility: v })); };
  const has = (e, k) => { const c = st.get(e); return !!c && c[k] !== undefined; };
  const name = (e) => e.id || (e.getAttribute && e.getAttribute('class')) || e.tagName;
  const to = (e, p, t, d = 0.5, ease = 'power2.inOut') => {
    if (p.drawSVG !== undefined && !zeroLen(p.drawSVG)) vis(e, 'visible', t);
    const c = st.get(e) || {}; const f = {}, v = {};
    for (const k in p) {
      if (k === 'attr') { f.attr = {}; v.attr = {}; for (const a in p.attr) { const cv = (c.attr || {})[a]; if (cv === undefined) throw new Error('not initialised: ' + name(e) + '.attr.' + a); f.attr[a] = cv; v.attr[a] = p.attr[a]; } continue; }
      if (c[k] === undefined) throw new Error('not initialised: ' + name(e) + '.' + k);
      f[k] = c[k]; v[k] = p[k];
    }
    tl.fromTo(e, f, Object.assign({ duration: Math.max(0.001, d), ease, immediateRender: false }, v), t);
    st.set(e, merge(c, p));
    if (p.drawSVG !== undefined && zeroLen(p.drawSVG)) vis(e, 'hidden', t + d);
  };
  const set = (e, p, t) => to(e, p, t, 0.001, 'none');
  const assume = (e, p) => st.set(e, merge(st.get(e) || {}, p));
  const show = (e, t, d = 0.35) => to(e, { opacity: 1 }, t, d, 'power1.out');
  const hide = (e, t, d = 0.25) => { if (!has(e, 'opacity')) st.set(e, merge(st.get(e) || {}, { opacity: 1 })); to(e, { opacity: 0 }, t, d, 'power1.in'); };
  const pop = (e, t, d = 0.18) => to(e, { opacity: 1, scale: 1 }, t, d, 'back.out(1.6)');
  const blurIn = (e, t, d = 0.2) => { if (!has(e, 'filter')) init(e, { filter: 'blur(6px)' }); to(e, { opacity: 1, filter: 'blur(0px)' }, t, d, 'power2.out'); };
  const blurOut = (e, t, d = 0.18) => to(e, { opacity: 0, filter: 'blur(6px)' }, t, d, 'power1.in');
  const txt = (e, s, t) => tl.set(e, { textContent: s }, t);
  const draw = (e, t, d = 0.5, ease = 'power2.inOut', from = '0% 0%', toV = '0% 100%') => { if (!zeroLen(toV)) vis(e, 'visible', t); tl.fromTo(e, { drawSVG: from }, { drawSVG: toV, duration: d, ease, immediateRender: false }, t); st.set(e, merge(st.get(e) || {}, { drawSVG: toV })); };
  // Rolling number: writes the value of every frame (fmt turns the number into text; html true writes innerHTML)
  const roll = (e, from, toV, t0, dur, fmt, ease = 'sine.inOut', extra, html) => {
    const E = gsap.parseEase(ease), n = Math.max(1, Math.round(dur * 30));
    for (let f = 0; f <= n; f++) { const p = E(f / n), v = fmt(from + (toV - from) * p); tl.set(e, html ? { innerHTML: v } : { textContent: v }, t0 + f / 30); if (extra) extra(p, t0 + f / 30); }
  };
  const fmtInt = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Tabular digits (WenKai, 0.6 em each): dg('1,200') → one span per digit
  const dg = (s) => [...String(s)].map((c) => (c === ',' ? '<span class="s">,</span>' : /\d/.test(c) ? '<span class="d">' + c + '</span>' : c)).join('');
  const rng = (s) => () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hash = (n, s = 1) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  const el = (tag, cls, parent, html, style) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; if (style) Object.assign(d.style, style); parent.appendChild(d); return d; };
  const div = (parent, cls, html, x, y, extra) => el('div', cls, parent, html, Object.assign(x != null ? { left: x + 'px', top: y + 'px' } : {}, extra || {}));
  const svgEl = (tag, attrs, parent) => { const p = document.createElementNS(NS, tag); for (const k in attrs) p.setAttribute(k, attrs[k]); if (parent) parent.appendChild(p); return p; };
  const svgText = (parent, x, y, s, o = {}) => { const e = svgEl('text', { x, y, 'font-size': o.size || 28, fill: o.fill || TOKENS.col.ink, 'text-anchor': o.anchor || 'start' }, parent); if (o.id) e.id = o.id; if (o.allow) e.setAttribute('data-geo-allow', o.allow); e.textContent = s; return e; };
  const fullSvg = (parent, attrs) => svgEl('svg', Object.assign({ class: 'full', viewBox: `0 0 ${TOKENS.zone.W} ${TOKENS.zone.H}` }, attrs || {}), parent);
  const circlePath = (cx, cy, r) => `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`;
  const ellPath = (cx, cy, rx, ry) => `M${cx} ${cy - ry} A${rx} ${ry} 0 1 1 ${cx - 0.01} ${cy - ry}`;
  // Box [x, y, w, h]: the element (origin top-left) goes from its layout box `from` to `box` (transform only)
  const boxTo = (e, from, box, t, d = 0.55, ease = 'power3.inOut') => {
    if (!has(e, 'x')) init(e, { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: '0 0' });
    to(e, { x: box[0] - from[0], y: box[1] - from[1], scaleX: box[2] / from[2], scaleY: box[3] / from[3] }, t, d, ease);
  };
  window.F = { NS, tl, $, st, init, has, to, set, assume, show, hide, pop, blurIn, blurOut, txt, draw, roll, fmtInt, dg, rng, hash, el, div, svgEl, svgText, fullSvg, circlePath, ellPath, boxTo, COL: TOKENS.col, TK: TOKENS };
  window.SEGMENTS = {};
  // Segment files register with defineSegment('<id>', function build(ctx) { ... }); see main.js
  window.defineSegment = (id, build) => { window.SEGMENTS[id] = build; };
})();

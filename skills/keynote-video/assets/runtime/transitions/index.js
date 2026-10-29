// transitions — scene transitions drawn by WebGL as pure functions of progress.
//
//   import { createTransitions, frameOf } from './lib/transitions/index.js';
//   const tx = createTransitions(canvas);               // the canvas the transition is drawn into
//   tx.draw('ink-drop', frameOf('a'), frameOf('b'), p, { seed: 3, colors: { ink: pal.accent, paper: pal.paper } });
//
// `from` / `to` are any TexImageSource (img, canvas, video, ImageBitmap). `p` in [0, 1] is linear progress; each
// transition applies its own easing (see `list`). A frame depends on (name, from, to, p, opts) only: nothing carries
// from one call to the next. p <= 0 draws `from` and p >= 1 draws `to`, pixel for pixel when they are the canvas's
// size (test/selftest.html checks it). Colours come from the film's palette by role: `ink` (the mark: stain, drop,
// line), `accent` (a highlight: front line, lit cell), `ground` (the dark or base field), `paper` (the light neutral).
// Each entry of `list` names the roles it reads; references/transitions.md maps them to every mode's palette.
//
// GLSL ES 1.00, so WebGL1 and WebGL2 both run it; one full-screen triangle per frame.

import { HEAD, MAIN } from './glsl.js';
import ink from './ink.js';
import thread from './thread.js';
import plakat from './plakat.js';
import blueprint from './blueprint.js';
import phosphor from './phosphor.js';
import tally from './tally.js';
import trace from './trace.js';
import shapeFlood from './shape-flood.js';
import apertureSwap from './aperture-swap.js';
import whipPush from './whip-push.js';
import sliceSmear from './slice-smear.js';
import whiteoutSlam from './whiteout-slam.js';
import occluderPass from './occluder-pass.js';

const DEFS = [
  ...ink, ...thread, ...plakat, ...blueprint, ...phosphor, ...tally, ...trace,
  ...shapeFlood, ...apertureSwap, ...whipPush, ...sliceSmear, ...whiteoutSlam, ...occluderPass,
];
const BY_NAME = Object.fromEntries(DEFS.map((d) => [d.name, d]));

// name, modes it belongs to, tier (T0 micro change, T1 scene change, T2 expressive, T3 peak), default length in beats,
// easing, colour roles read. Object-level hand-offs (one object carried from scene to scene) are in ../handoffs/.
export const list = DEFS.map(({ name, mode, tier, beats, ease, roles, summary }) => ({ name, mode, tier, beats, ease, roles, summary }));

// Seconds of a transition at a tempo: beats × 60 / bpm (pass beats to override the default, e.g. ≤ 2 when used as T2).
export const durationOf = (name, bpm, beats = BY_NAME[name].beats) => (beats * 60) / bpm;
// Progress of a transition that starts at `start` (s) and lasts `dur` (s), at film time t.
export const progressAt = (t, start, dur) => Math.min(1, Math.max(0, (t - start) / dur));

// The current frame of <video id="videoId">. HyperFrames (0.8.163) injects, while rendering, the decoded frame as
// <img id="__render_frame_<key>__" class="__render_frame__"> right after the video, where key is the video's
// data-hf-render-id, else its id. In preview there is no injection; the video element itself is returned.
export const frameOf = (videoId) => {
  const v = document.getElementById(videoId);
  if (!v) return null;
  const key = v.getAttribute('data-hf-render-id') || v.id;
  let img = document.getElementById(`__render_frame_${key}__`);
  if (!img) {
    let n = v.nextElementSibling;
    while (n && !(n.classList && n.classList.contains('__render_frame__'))) n = n.nextElementSibling;
    img = n;
  }
  if (img && img.complete && img.naturalWidth > 0) return img;
  return v;
};

const hex = (h) => {
  if (Array.isArray(h)) return h;
  const n = parseInt(String(h).replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const sizeOf = (src) => {
  if (!src) return [0, 0];
  if (typeof HTMLVideoElement !== 'undefined' && src instanceof HTMLVideoElement) return [src.videoWidth, src.videoHeight];
  if (typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement) return src.complete ? [src.naturalWidth, src.naturalHeight] : [0, 0];
  return [src.width || 0, src.height || 0];
};

export const createTransitions = (canvas, { width = 1920, height = 1080 } = {}) => {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  }
  const attrs = { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false, depth: false };
  const gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs);
  if (!gl) return null;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const VERT = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';
  const programs = {};
  const programOf = (name) => {
    if (programs[name]) return programs[name];
    const def = BY_NAME[name];
    if (!def) throw new Error(`unknown transition "${name}"; known: ${DEFS.map((d) => d.name).join(', ')}`);
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEAD + def.frag + MAIN));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const u = gl.getActiveUniform(p, i);
      loc[u.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, u.name);
    }
    return (programs[name] = { p, loc, def });
  };

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const texture = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    return t;
  };
  const tex = [texture(), texture()];
  const upload = (unit, src) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
    const [w, h] = sizeOf(src);
    if (!w || !h) return false;   // not decoded yet: keep the last upload rather than draw garbage
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    return true;
  };

  const ROLE_FALLBACK = { ink: '#111111', accent: '#FFFFFF', ground: '#000000', paper: '#FFFFFF' };
  let warned = new Set();

  const draw = (name, from, to, p, opts = {}) => {
    const pr = programOf(name);
    const { def, loc } = pr;
    p = Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0;
    const colors = opts.colors || {};
    for (const r of def.roles) {
      if (colors[r] == null && !warned.has(name + r)) {
        warned.add(name + r);
        console.warn(`transition ${name}: colors.${r} not given; pass it from the film's palette`);
      }
    }
    gl.useProgram(pr.p);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // only the frames this p shows are uploaded (both while it runs)
    upload(0, p < 1 ? from : null);
    upload(1, p > 0 ? to : null);
    gl.uniform1i(loc.uFrom, 0);
    gl.uniform1i(loc.uTo, 1);
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform1f(loc.uScale, canvas.width / 1920);
    gl.uniform1f(loc.uP, p);
    const seed = opts.seed ?? 1;
    gl.uniform1f(loc.uSeed, (Math.abs(seed) % 997) * 0.731);
    const origin = opts.origin ?? def.origin ?? [960, 540];
    if (loc.uOrigin) gl.uniform2f(loc.uOrigin, origin[0], origin[1]);
    for (const [r, u] of [['ink', 'uInk'], ['accent', 'uAccent'], ['ground', 'uGround'], ['paper', 'uPaper']]) {
      if (loc[u]) gl.uniform3fv(loc[u], hex(colors[r] ?? ROLE_FALLBACK[r]));
    }
    const extra = def.uniforms ? def.uniforms({ ...opts, seed, origin, colors }, p) : {};
    for (const [k, v] of Object.entries(extra)) {
      const l = loc[k];
      if (!l) continue;
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else if (v.length === 4) gl.uniform4fv(l, v);
      else gl.uniform1fv(l, v);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return canvas;
  };

  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'webgl';
  // Compile every program up front (call once while the film loads, so the first transition frame does not stall).
  const warm = () => { for (const d of DEFS) programOf(d.name); };
  return { draw, list, canvas, gl, renderer, warm };
};

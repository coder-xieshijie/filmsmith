// text.js — measured type for canvas, so layout follows the copy instead of fixed pixel offsets.

const cache = new Map();

// font({ family: 'Inter Tight', weight: 800, size: 120, style: '', stretch: '' }) → CSS font string
export const font = ({ family, weight = 400, size = 32, style = '', stretch = '' }) =>
  `${style} ${stretch} ${weight} ${size}px "${family}"`.trim().replace(/\s+/g, ' ');

export const measure = (ctx, text, f) => {
  const key = f + '|' + text;
  let w = cache.get(key);
  if (w === undefined) {
    ctx.save();
    ctx.font = f;
    w = ctx.measureText(text).width;
    ctx.restore();
    cache.set(key, w);
  }
  return w;
};

// x of each character's left edge, for per-glyph animation. Measured on prefixes so kerning is kept.
export const glyphX = (ctx, text, f) => {
  const xs = [];
  for (let i = 0; i <= text.length; i++) xs.push(measure(ctx, text.slice(0, i), f));
  return xs;
};

// Largest size in [min, max] at which text fits maxWidth. spec is a font() spec without size.
export const fit = (ctx, text, spec, maxWidth, { min = 12, max = 400 } = {}) => {
  let lo = min, hi = max;
  while (hi - lo > 1) {
    const mid = (lo + hi) / 2;
    if (measure(ctx, text, font({ ...spec, size: mid })) <= maxWidth) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo);
};

// Break opportunities of a string: [{ w, sep }], where sep joins w to the text before it on the same line.
// Latin text breaks at spaces. Every wrap goes through this one function, so line breaking for Chinese
// (break between characters, no line-start punctuation) can replace it in one place.
export const breaks = (text) =>
  String(text ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, sep: ' ' }));

// Greedy word wrap into lines no wider than maxWidth.
export const wrap = (ctx, text, f, maxWidth) => {
  const lines = [];
  let line = '';
  for (const { w, sep } of breaks(text)) {
    const next = line ? line + sep + w : w;
    if (line && measure(ctx, next, f) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

// The first n characters, for typing effects: typed(text, t, t0, cps).
export const typed = (text, t, t0, cps = 28) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps))));

// Font loading gate: resolve when every family is ready, so measurements are final before the first render.
// families: [{ family, weight, style }]. Each one must resolve to a face from assets/fonts/fonts.css that
// actually loaded and covers the weight and style asked for; a browser silently falls back to another font
// otherwise, and every measured layout shifts. A failure does not stop the film: it is logged, painted as a
// red banner over every frame, and raised as an uncaught page error, which `hyperframes check` reports
// under runtime (page_error), so `npm run film` stops at the check.
const weightRange = (w) => {
  const [a, b = a] = String(w ?? '400').replace('normal', '400').replace('bold', '700').split(/\s+/).map(Number);
  return [a, b];
};

export const fontProblems = async (families) => {
  const problems = [];
  for (const f of families) {
    const spec = font({ ...f, size: 32, stretch: '' });
    const want = Number(f.weight ?? 400), style = f.style || 'normal';
    let faces = [];
    try {
      faces = await document.fonts.load(spec);
    } catch (e) {
      problems.push(`${spec}: ${e?.message ?? e}`);
      continue;
    }
    const own = faces.filter((x) => x.family.replace(/^["']|["']$/g, '') === f.family);
    if (!own.length) { problems.push(`${spec}: no @font-face for "${f.family}" (run npm run setup; check fonts.json)`); continue; }
    const bad = own.filter((x) => x.status !== 'loaded');
    if (bad.length) { problems.push(`${spec}: face ${bad.map((x) => x.status).join(', ')}`); continue; }
    const covers = own.some((x) => { const [a, b] = weightRange(x.weight); return want >= a && want <= b && (x.style === style || (style === 'normal' && x.style === 'normal')); });
    if (!covers) problems.push(`${spec}: no face covers weight ${want} ${style} (have ${own.map((x) => `${x.weight} ${x.style}`).join(', ')})`);
    else if (!document.fonts.check(spec)) problems.push(`${spec}: document.fonts.check() is false`);
  }
  return problems;
};

// A red banner over the whole film, for errors that must not reach a delivered render.
export const errorBanner = (lines, id = 'hf-error-banner') => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.setAttribute('style', 'position:fixed;left:0;top:0;right:0;z-index:2147483647;background:#D00000;color:#FFFFFF;font:600 28px/1.35 monospace;padding:18px 28px;white-space:pre-wrap;pointer-events:none');
    document.body.appendChild(el);
  }
  el.textContent = lines.join('\n');
};

export const fontsReady = async (families) => {
  const problems = await fontProblems(families);
  await document.fonts.ready;
  cache.clear();
  if (problems.length) {
    const lines = ['FONT NOT LOADED — the film is drawn in a fallback font', ...problems];
    console.error(lines.join('\n'));
    errorBanner(lines, 'hf-font-error');
    window.__fontErrors = problems;
    setTimeout(() => { throw new Error(`fontsReady: ${problems.join('; ')}`); }, 0);
  }
  return problems;
};

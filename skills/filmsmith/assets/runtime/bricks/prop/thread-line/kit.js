// kit.js — what every thread scene brick shares: the palette from the look, the line in its profile (rule or swell)
// for the prop and the motions, and linkScene(), which makes a scene brick out of one link of the chain engine
// (chain.js). A thread scene is one link of a fixed chain whose hand-offs read its neighbours (the word's glyph boxes
// become the swatches, the merge's first frame is panel 3, the card squashes into the line the close starts from), so a
// scene brick takes the neighbouring links' copy as `before` and `after` (a host passes its film's chain; the defaults
// are the shortest neighbours each link needs), fits that chain with the template's rules, and draws its own link: the
// frames from the link's start to its end, the neighbours' overlapping exits and entrances included, with the corner
// label, the centre name, motion blur and grain as the template draws them.
import { fit, events } from '../../../timing.js';
import RULES from './rules.js';
import { SWELL, LINE } from './shots.js';
import { createChain } from './chain.js';
import LOOK from '../../look/one-line/look.js';

// The look's roles (library names) as the template's palette: text = ink, line = accent (the thread), onLine = onAccent.
export const palOf = (colors, id = 'cobalt-vermilion') => {
  const r = { ...(LOOK.palettes.find((p) => p.id === id) || LOOK.palettes[0]).roles, ...(colors || {}) };
  return { ground: r.ground, panel: r.panel, text: r.ink, line: r.accent, onLine: r.onAccent, field: r.field, onField: r.onField };
};
export const ROLES = ['ground', 'panel', 'ink', 'accent', 'onAccent', 'field', 'onField'];
export const THREADS = ['rule', 'swell'];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// The line colour drawn as a line, in the thread's profile: 'rule' fills the box; 'swell' fills its swelled form, an
// ellipse along the long side SWELL times thicker in the middle, tapering to points (easing off as the box nears a
// square, so a line turns into a caret through a dot without a jump); s blends a ruled box into its swell. As chain.js
// swellPath and threadRect (the template's film.js).
export const lineBox = (ctx, x, y, w, h, thread = 'rule', s = 1) => {
  if (thread !== 'swell' || s <= 0) { ctx.beginPath(); ctx.rect(x, y, w, h); return; }
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  ctx.beginPath();
  if (w <= 0 || h <= 0) return;
  const horiz = w >= h, L = horiz ? w : h, T = horiz ? h : w, k = 1 + (SWELL - 1) * clamp((L / T - 1) / 2), cx = x + w / 2, cy = y + h / 2;
  if (s >= 1) { ctx.ellipse(cx, cy, horiz ? L / 2 : (T * k) / 2, horiz ? (T * k) / 2 : L / 2, 0, 0, Math.PI * 2); return; }
  const N = 48, half = (t) => (T / 2) * ((1 - s) + s * k * Math.sqrt(Math.max(0, 1 - t * t)));
  const pt = (t, side) => (horiz ? [cx + (t * L) / 2, cy + side * half(t)] : [cx + side * half(t), cy + (t * L) / 2]);
  for (let i = 0; i <= N; i++) { const [px, py] = pt(-1 + (2 * i) / N, -1); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  for (let i = N; i >= 0; i--) { const [px, py] = pt(-1 + (2 * i) / N, 1); ctx.lineTo(px, py); }
  ctx.closePath();
};
export { LINE, SWELL };

// The stage label every link may carry: a step a viewer can see (≤ 2 words) and one plain note (≤ 6 words).
export const STAGE = {
  type: 'group', optional: true,
  of: {
    name: { type: 'text', tier: 'glance', limits: { en: { words: 2, chars: 14 }, zh: { chars: 4 } } },
    note: { type: 'text', tier: 'glance', optional: true, limits: { en: { words: 6, chars: 40 }, zh: { chars: 14 } } },
  },
};

const bpmOf = (ctx) => clamp(Number(ctx.bpm) || 120, RULES.bpm.min, RULES.bpm.max);
// Chinese reads at 6 characters a second without the 0.5 s a state (the thread template's own reading)
const rulesOf = (lang) => (lang === 'zh' ? { ...RULES, stateSec: 0 } : RULES);
// The chain one scene brick stands in: its neighbours, then itself with its copy (the slots, the stage).
const chainOf = (type, keys, s, ctx) => {
  const own = { type };
  for (const k of keys) if (s[k] != null) own[k] = s[k];
  if (s.stage) own.stage = s.stage;
  const before = (s.before || []).filter(Boolean), after = (s.after || []).filter(Boolean);
  const lang = ctx.lang === 'zh' ? 'zh' : 'en';
  const content = { bpm: bpmOf(ctx), fps: 30, seed: s.seed ?? 5150, thread: THREADS.includes(s.thread) ? s.thread : 'rule', scenes: [...before, own, ...after].map((x) => ({ ...x, lang })) };
  return { content, index: before.length, lang };
};
const fitOf = (M, colors) => fit({ ...M.content, lang: M.lang, colors }, rulesOf(M.lang));

// One link of the chain as a scene brick (SPEC 3.2). spec: id, type (the template's link type), fits, beats, slots
// (the link's copy; `stage` is added; the params `before` and `after`, the neighbouring links as in the template's
// content.js, `thread`, `seed` and `seconds` (the film's length, for {seconds} and {frames}) are not slots), DEFAULT { en, zh } (copy and default neighbours), motion,
// shots (what compositions it shows), peak (the T3 it carries, if any).
export const linkScene = (spec) => {
  const keys = Object.keys(spec.slots);
  return {
    id: spec.id, kind: 'scene',
    fits: spec.fits,
    surface: ['canvas'],
    beats: spec.beats,
    needs: { motions: spec.motions || [], props: ['thread-line'], roles: ROLES, type: ['display', 'text', 'mono'] },
    slots: { ...spec.slots, stage: STAGE },
    roles: ROLES,
    defaults: (ctx = {}) => ({ ...spec.DEFAULT[ctx.lang === 'zh' ? 'zh' : 'en'], palette: 'cobalt-vermilion', thread: 'rule', seed: 5150, seconds: null }),
    plan(s, ctx) {
      const M = chainOf(spec.type, keys, s, ctx), T = fitOf(M, palOf(s.colors, s.palette)), L = T.scenes[M.index], B = T.beat;
      const beats = Math.round((L.end - L.start) / B);
      let ev = null;
      try { ev = events(T, { ...M.content, lang: M.lang, colors: palOf(s.colors, s.palette) }, rulesOf(M.lang)); } catch { ev = null; }
      const mine = (list) => (list || []).filter((x) => x.scene === M.index && x.t >= L.start - 1e-6 && x.t < L.end - 1e-6);
      const b = (t) => Math.max(0, (t - L.start) / B);
      const keyKind = (k) => (['turn', 'land', 'stamp', 'accent', 'claim', 'end'].includes(k.kind) ? k.kind : 'accent');
      const cues = mine(ev?.keys).map((k) => ({ beat: b(k.t), kind: keyKind(k) }));
      const onsets = [...mine(ev?.keys), ...mine(ev?.micro)].map((x) => b(x.t));
      const settled = Math.min(beats, (onsets.length ? Math.max(...onsets) : 0) + 0.5);
      const read = RULES.types[spec.type]?.read?.(M.content.scenes[M.index]) || [];
      const reads = read.map((x) => (typeof x === 'string' ? { text: x } : x)).filter((x) => x && x.text && x.tier !== 'glance').map((x) => ({ text: String(x.text), lang: M.lang }));
      const peaks = mine(ev?.peaks);
      return {
        beats, lead: 0, reads, cues, motion: spec.motion, settled,
        peakAt: peaks.length ? b(peaks[0].t) : spec.peakAt,
        shots: [{ beat: 0, kind: spec.shots[0] }, ...mine(ev?.shots).map((x) => ({ beat: b(x.t), kind: x.what || spec.shots[1] || 'composition' }))],
      };
    },
    async prepare(s, c) {
      const M = chainOf(spec.type, keys, s, c), colors = palOf(s.colors, s.palette);
      const chain = await createChain(M.content, { colors, lang: M.lang, seconds: s.seconds || null });
      const L = chain.laid[M.index];
      return { chain, L, B: 60 / chain.timing.bpm };
    },
    paint(ctx, u, s, c, D) { D.chain.frame(ctx, D.L.start + u * D.B); },
    track() { return [[960, 540]]; },
  };
};

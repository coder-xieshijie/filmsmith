// kit.js — what every stream scene brick shares: filmScene() makes a scene brick out of one scene of the stream engine.
// A stream scene is one window of a continuous film whose picture reads the scenes before it (the stars every earlier
// scene sent stay in the sky; the chat block carries the feed of every ask; the closing sweep catches every star), so a
// scene brick takes its own copy as slots and the rest of the film as `film` (the template's content.js: product, ui,
// opening, lockup, seed and the scenes of the skeleton; default the worked example in the brick's language), lays the whole film
// out with the template's rules, and draws its own window: the frames from its start to its end, the neighbours'
// lingering pieces included, exactly as the film draws them. A host that passes its film's content gets its film's
// frames and lengths; left alone, a scene draws its window of the example film with its own copy in it.
import { planOf, createFilm } from './engine.js';
import RULES from './rules.js';
import EX from './examples.js';
import { ROLES } from './draw.js';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const KEY = { hit: 'accent', impact: 'accent', alert: 'claim', stamp: 'stamp', land: 'land', thud: 'land', chime: 'end', fold: 'turn', sweep: 'turn', pull: 'turn', zoom: 'turn', unzoom: 'turn', settle: 'land', launch: 'accent', return: 'accent', done: 'accent', word: 'claim' };
export const TYPES = ['open', 'intro', 'ask', 'evening', 'constellation', 'verify', 'cards', 'days', 'close', 'interlude', 'lockup']; // days, interlude, lockup optional
const exampleOf = (lang) => EX[lang === 'zh' ? 'zh' : 'en'];

// the film this scene stands in: the host's film (or the example), its own slots over the scene of its type, the
// bpm the host plays it at (120–132, the template's range)
export const contentOf = (type, keys, s, ctx, extra) => {
  const lang = ctx.lang === 'zh' ? 'zh' : 'en';
  const F = s.film && typeof s.film === 'object' ? s.film : exampleOf(lang);
  const own = { ...(F.scenes.find((x) => x.type === type) || { type }) };
  for (const k of keys) if (s[k] != null) own[k] = s[k];
  // a film without this (optional) scene gets it in its place in the skeleton
  const scenes = F.scenes.some((x) => x.type === type) ? F.scenes.map((x) => (x.type === type ? own : x))
    : [...F.scenes.filter((x) => TYPES.indexOf(x.type) < TYPES.indexOf(type)), own, ...F.scenes.filter((x) => TYPES.indexOf(x.type) > TYPES.indexOf(type))];
  const content = { ...F, lang, bpm: clamp(Number(ctx.bpm) || 128, 120, 132), palette: undefined, scenes };
  return extra ? extra(content, s) : content;
};

// spec: id, type (the template's scene type), fits, beats, slots, motion, shots, peakAt, extra(content, s) (the brick's
// own switches written into the film), reads(scene) (the primary texts it holds for reading)
// every stream scene also takes the reading controls of sched.js: `holds` ({ key: seconds, or an array per item }: a
// named text's hold in place of its reading time or glance) and `glance` (s: the hold of every glance in the scene)
const READING = {
  holds: { type: 'object', optional: true, sample: 'default' },
  glance: { type: 'number', min: 0.3, max: 3, optional: true, sample: 'default' },
};
export const filmScene = (spec) => {
  spec = { ...spec, slots: { ...spec.slots, ...READING } };
  const keys = Object.keys(spec.slots);
  const own = (lang) => { const sc = exampleOf(lang).scenes.find((x) => x.type === spec.type) || {}; return Object.fromEntries(keys.filter((k) => sc[k] != null).map((k) => [k, sc[k]])); };
  const windowOf = (s, ctx) => {
    const content = contentOf(spec.type, keys, s, ctx, spec.extra), PL = planOf(content), sc = PL.sc[spec.type];
    return { content, PL, sc, B: PL.B };
  };
  return {
    id: spec.id, kind: 'scene',
    fits: spec.fits,
    surface: ['canvas'],
    beats: spec.beats,
    needs: { motions: spec.motions || [], props: ['glow-thread', ...(spec.props || [])], roles: ROLES, type: ['display', 'text'] },
    slots: spec.slots,
    roles: ROLES,
    // SPEC 3.2: the picture reads the whole film; without `film` the scene draws its window of the worked example
    needsFilm: { shape: 'the stream template\'s content.js: { product, ui, opening, lockup, seed, scenes: [the skeleton\'s scenes by type, in order] }', example: 'prop/glow-thread/examples.js' },
    defaults: (ctx = {}) => ({ ...own(ctx.lang), ...(spec.defaults ? spec.defaults(ctx) : {}), palette: 'night', film: null }),
    plan(s, ctx) {
      const { sc, B, content } = windowOf(s, ctx);
      const beats = Math.max(1, Math.round(sc.dur / B));
      const b = (t) => Math.max(0, t / B);
      const cues = (sc.k.cues || []).filter((c) => KEY[c.kind]).map((c) => ({ beat: b(c.t), kind: KEY[c.kind] }));
      const reads = (spec.reads ? spec.reads(sc.s, content) : []).filter(Boolean).map((text) => ({ text: String(text), lang: content.lang }));
      const onsets = (sc.k.cues || []).map((c) => b(c.t));
      return {
        beats, lead: 0, reads, cues, motion: spec.motion,
        settled: Math.min(beats, (onsets.length ? Math.max(...onsets) : 0) + 0.5),
        peakAt: sc.k.peak ? b(sc.k.peak.t) : spec.peakAt,
        shots: [{ beat: 0, kind: spec.shots[0] }, ...(spec.shots.slice(1).map((kind, i) => ({ beat: Math.round(((i + 1) * beats) / spec.shots.length), kind })))],
      };
    },
    validate(s, ctx) {
      const { content } = windowOf(s, ctx);
      return RULES(content).validate(content).filter((e) => e.includes(`(${spec.type})`) || e.includes(`${spec.type}.`) || /^(lang|opening|lockup|product|ui\.|scenes:)/.test(e));
    },
    async prepare(s, c) {
      const { content, sc } = windowOf(s, c);
      const load = async (src) => { if (typeof src !== 'string' || !src || typeof Image === 'undefined') return null; const im = new Image(); im.src = src; try { await im.decode(); return im; } catch { return null; } };
      const img = await load(s.mascot);
      // the pictures the film shows (an ask's image), by URL
      const images = {};
      for (const x of content.scenes) if (typeof x.image === 'string' && x.image && !images[x.image]) { const im = await load(x.image); if (im) images[x.image] = im; }
      const ms = s.mascotSize && typeof s.mascotSize === 'object' ? s.mascotSize : null;
      const film = await createFilm(content, { colors: s.colors, palette: s.palette, mascot: img, ...(ms ? { mascotSize: ms } : {}), ...(Object.keys(images).length ? { images } : {}) });
      return { film, start: sc.start, B: 60 / film.plan.T.bpm };
    },
    paint(ctx, u, s, c, D) { D.film.frame(ctx, D.start + u * D.B); },
    track() { return [[960, 540]]; },
  };
};

// a text slot with the template's limits (LIMITS key) per language
import { LIMITS } from './text.js';
export const text = (key, tier = 'primary', o = {}) => ({ type: 'text', tier, limits: { en: { chars: LIMITS.en[key] }, zh: { chars: LIMITS.zh[key] } }, ...o });

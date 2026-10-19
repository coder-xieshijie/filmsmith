// registry.js — the ink scene registry and the small pure helpers that both timing.rules.js (how long a
// scene needs) and plan.js (when everything happens inside it) read, so the two never disagree.

export const CANVAS = { width: 1920, height: 1080, fps: 30 };
export const LUFS = -14; // master target of the audio kit

// The loudness the master actually measured: score.mjs has lib/audio write assets/audio/measure.json after
// master() (integrated loudness `I`). Read by import, never fetch (CONTRACT), the same way in Node and in the
// browser. Before the first `npm run audio` the file does not exist, and {lufs} shows the target instead.
const measured = await import(new URL('./assets/audio/measure.json', import.meta.url).href, { with: { type: 'json' } })
  .then((m) => m.default, () => null);
const measuredI = [measured?.I, measured?.integrated, measured?.lufs, measured?.master?.I].find((v) => Number.isFinite(v));
export const LUFS_SOURCE = measuredI != null ? 'measured' : 'target';
// one decimal when measured (the meter's own resolution on screen), the bare target otherwise
export const lufsText = () => (measuredI != null ? '−' + Math.abs(measuredI).toFixed(1) : '−' + Math.abs(LUFS));

// type → ground and character limits per slot (TEMPLATE.md explains them). Bars are not here: they are fitted.
// swap changes its ground every beat (its words' grounds, groundsOf below); `ground` is its first word's.
export const REGISTRY = {
  slam: { ground: 'paper', limits: { line: 14, label: 34 } },
  swap: { ground: 'paper', limits: { word: 10 } },
  warp: { ground: 'paper', limits: { word: 10, word2: 10, label: 34 } },
  burst: { ground: 'paper', limits: { word: 10, into: 10, label: 34 } },
  bloom: { ground: 'paper', limits: {} },
  name: { ground: 'accent', limits: { name: 16, label: 36 } },
  steps: { ground: 'night', limits: { step: 11 } },
  ruler: { ground: 'night', limits: { word: 8, label: 40 } },
  counter: { ground: 'night', limits: { value: 10, label: 40 } },
  claim: { ground: 'paper', limits: { line: 14 } },
  cta: { ground: 'paper', limits: { name: 16, url: 52, line: 46 } },
};
// hop, cut and the dot's own transformations (wipe, iris, flood), plus two from the shared library:
// scan (lib/handoffs anchor-swap: the dot holds still while a hairline scans the next world in) and portal
// (lib/handoffs counter-portal, out of a claim only: the camera pushes through a counter of the claim's type)
export const TRANSITIONS = ['hop', 'cut', 'wipe', 'iris', 'flood', 'scan', 'portal'];
// content.typeWidth: the form variant (mode card "Variants"); film.js TYPE_WIDTHS holds what each one changes
export const TYPE_WIDTH_IDS = ['compressed', 'extended'];
// Character limits that replace the ones above when typeWidth is 'extended': an expanded black capital is about
// 0.93 em wide against about 0.45 em extra-condensed, so a line holds about half the characters at the same floor.
// A first filter only; the pixel gate in film.js (no word or stop past the 150 px margin) decides.
export const LIMITS_EXTENDED = {
  slam: { line: 8 }, swap: { word: 7 }, warp: { word: 7, word2: 7 }, burst: { word: 6, into: 6 }, name: { name: 11 },
  steps: { step: 8 }, ruler: { word: 4 }, counter: { value: 8 }, claim: { line: 8 }, cta: { name: 12 },
};
// the dot's own transformations and scan take the outgoing scene's last beat: its words clear a beat early
export const DOT_OUT = ['wipe', 'iris', 'flood', 'scan'];
// apertures of lib/transitions aperture-swap a swap run cycles through, and the grounds it may stand on
export const APERTURES = ['circle', 'band', 'close', 'cut'];
export const GROUNDS = ['paper', 'night', 'accent'];

// A swap's grounds, one per word: content `grounds`, else paper and night alternating from paper; the word at
// `answer` stands on the accent field (the dot opens into it).
export const groundsOf = (s) => (s.words || []).map((_, k) => (k === s.answer ? 'accent' : s.grounds?.[k] ?? (k % 2 ? 'night' : 'paper')));
// The ground a scene starts on and the one it ends on (they differ only for a swap).
export const groundOf = (s) => (s?.type === 'swap' ? groundsOf(s).at(-1) ?? 'paper' : REGISTRY[s?.type]?.ground || 'paper');
export const groundIn = (s) => (s?.type === 'swap' ? groundsOf(s)[0] ?? 'paper' : groundOf(s));

// The transition out of scene i: explicit `to`, else hop on the same ground, else a cut on the downbeat. Into a
// claim it is always the whiteout (the claim's own entrance).
export const transitionOut = (scenes, i) => {
  const s = scenes[i], n = scenes[i + 1];
  if (!n) return null;
  if (s.type === 'bloom') return 'bloom';
  if (n.type === 'bloom') return 'tobloom';
  if (n.type === 'claim') return 'whiteout';
  return s.to || (groundOf(s) === groundIn(n) ? 'hop' : 'cut');
};

export const tokensOf = (s) => (s.lines || []).flatMap((line, li) => line.map((text, k) => ({ text, line: li, k })));

export const fill = (s, f) => (s == null ? s : String(s).replace(/\{(\w+)\}/g, (m, k) => (k in f ? f[k] : m)));

// Values the copy may quote as {bpm}, {bars}, {seconds}, {width}, {height}, {fps}, {lufs}, {seed}, from the fitted
// timing, for {lufs} the measured master (see above), for {seed} content.seed (the seed the bloom, the hops and the
// grain of this very film are drawn from).
export const facts = ({ bpm, bars, duration }, seed) => ({
  bpm: String(Number(bpm.toFixed(1))),
  bars: String(bars),
  seconds: String(Math.round(duration)),
  width: String(CANVAS.width),
  height: String(CANVAS.height),
  fps: String(CANVAS.fps),
  lufs: lufsText(),
  seed: String(seed ?? ''),
});
// Stand-ins of the same shape, for sizing copy before the timing exists (word count is what matters; widths of
// numbers are at most this long).
export const FACTS_PROVISIONAL = { bpm: '128.5', bars: '99', seconds: '999', width: '1920', height: '1080', fps: '30', lufs: '−14.0', seed: '99999999' };

// Reading words (principle 1): whitespace-separated tokens that carry a letter or digit. Punctuation on its own
// ("...", "/") is not read as a word.
export const readWords = (text) => String(text ?? '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

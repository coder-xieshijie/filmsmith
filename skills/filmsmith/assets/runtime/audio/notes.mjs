// notes.mjs — pitch helpers. note('D4') → Hz, chord('Dmaj7', { octave: 3 }) → Hz[], scale('D', 'major').

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Note name → MIDI number. Accepts 'C4', 'F#3', 'Bb2', 'C#-1'. Numbers pass through as MIDI.
export const midi = (name) => {
  if (typeof name === 'number') return name;
  const m = /^([A-Ga-g])([#b]*)(-?\d+)$/.exec(String(name).trim());
  if (!m) throw new Error(`note: cannot parse "${name}"`);
  let pc = PC[m[1].toUpperCase()];
  for (const c of m[2]) pc += c === '#' ? 1 : -1;
  return pc + 12 * (Number(m[3]) + 1);
};

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const ftom = (f) => 69 + 12 * Math.log2(f / 440);

// note('D4') → 293.66 Hz. Numbers below 128 are MIDI numbers; larger numbers are treated as Hz.
export const note = (n) => (typeof n === 'number' ? (n < 128 ? mtof(n) : n) : mtof(midi(n)));

// Pitch class of a root name: 'F#' → 6.
export const pitchClass = (root) => {
  const m = /^([A-Ga-g])([#b]*)$/.exec(String(root).trim());
  if (!m) throw new Error(`pitchClass: cannot parse "${root}"`);
  let pc = PC[m[1].toUpperCase()];
  for (const c of m[2]) pc += c === '#' ? 1 : -1;
  return ((pc % 12) + 12) % 12;
};

// Chord qualities as semitone offsets from the root.
export const QUALITIES = {
  '': [0, 4, 7], maj: [0, 4, 7], M: [0, 4, 7], m: [0, 3, 7], min: [0, 3, 7], '5': [0, 7],
  dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9],
  '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10],
  '7sus4': [0, 5, 7, 10], add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14], '6add9': [0, 4, 7, 9, 14], '69': [0, 4, 7, 9, 14],
  '9': [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], M9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14],
  'maj7#11': [0, 4, 7, 11, 18], m11: [0, 3, 7, 10, 14, 17], '11': [0, 7, 10, 14, 17], sus2add6: [0, 2, 7, 9],
};

// Parse 'Dmaj7' → { root: 2, intervals: [...] }. Slash bass 'D/F#' is supported (bass returned separately).
export const parseChord = (sym) => {
  const [main, slash] = String(sym).split('/');
  const m = /^([A-G][#b]?)(.*)$/.exec(main.trim());
  if (!m || !(m[2] in QUALITIES)) throw new Error(`chord: unknown chord "${sym}"`);
  return { root: pitchClass(m[1]), intervals: QUALITIES[m[2]], bass: slash ? pitchClass(slash) : null };
};

// chord('Dmaj7', { octave: 3 }) → Hz in root position from that octave.
// chord(['D3', 'F#3', 'A3']) → Hz. Option transpose shifts by semitones.
export const chord = (sym, { octave = 3, transpose = 0 } = {}) => {
  if (Array.isArray(sym)) return sym.map((n) => note(typeof n === 'number' && n >= 128 ? n : midi(n) + transpose));
  const { root, intervals } = parseChord(sym);
  const base = 12 * (octave + 1) + root + transpose;
  return intervals.map((iv) => mtof(base + iv));
};

// MIDI notes of a chord voiced close around `center` (MIDI), for smooth voice leading between chords.
export const voicing = (sym, { center = 57, transpose = 0, spread = 0 } = {}) => {
  const { root, intervals } = parseChord(sym);
  const out = intervals.map((iv, k) => {
    const pc = (root + iv + transpose) % 12;
    let m = center - 6 + ((((pc - (center - 6)) % 12) + 12) % 12);
    if (spread && k % 2) m += 12 * spread;
    return m;
  });
  return [...new Set(out)].sort((a, b) => a - b);
};

// MIDI root of a chord in the bass register (around `center`, default E2 = 40).
export const bassNote = (sym, { center = 40, transpose = 0 } = {}) => {
  const { root, bass } = parseChord(sym);
  const pc = ((bass ?? root) + transpose) % 12;
  return center - 6 + ((((pc - (center - 6)) % 12) + 12) % 12);
};

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic: [0, 2, 4, 7, 9], minorPentatonic: [0, 3, 5, 7, 10],
};

// scale('D', 'major', { octave: 4, octaves: 2 }) → MIDI numbers ascending.
export const scale = (root, kind = 'major', { octave = 4, octaves = 1 } = {}) => {
  const base = 12 * (octave + 1) + pitchClass(root);
  const out = [];
  for (let o = 0; o < octaves; o++) for (const iv of SCALES[kind]) out.push(base + 12 * o + iv);
  out.push(base + 12 * octaves);
  return out;
};

// Semitones from one key to another, folded into -6..+5 so transposed presets stay in register.
export const keyShift = (from, to) => {
  if (!to) return 0;
  const d = (((pitchClass(String(to).replace(/m$/, '')) - pitchClass(from)) % 12) + 12) % 12;
  return d > 5 ? d - 12 : d;
};

// lib/audio — synthesised sound for films: beat-grid sequencer, voices, mode beds, loudness master.
// Pure Node ESM, no dependencies; ffmpeg on PATH for master() and addFile().
//
//   import { Score, voices, beds, master, note, chord } from './lib/audio/index.mjs';

import { Score } from './sequencer.mjs';
import { beds } from './beds.mjs';
import { VOICES } from './voices.mjs';

Score.beds = beds;

export { Score, beds };
export const voices = VOICES;
export * from './voices.mjs';
export { note, midi, mtof, ftom, chord, parseChord, voicing, bassNote, scale, keyShift, QUALITIES, SCALES } from './notes.mjs';
export { writeWav, encodeWav, readAudio } from './wav.mjs';
export { master, measure, writeMeasure } from './master.mjs';
export { reverb, limit } from './fx.mjs';
export { mulberry32, seedOf, db, toDb, normalize, mixInto } from './dsp.mjs';
export { KINDS } from './beds.mjs';

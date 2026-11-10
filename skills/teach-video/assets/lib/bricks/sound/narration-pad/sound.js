// narration-pad — the sound of a narrated explainer: a quiet pad under the voice, Fmaj7 → Cmaj7/E → Am7 → G6, one chord
// every 8 s (a 32 s loop, chords overlapping 1.2 s), summed sines with a slow tremolo, echo and a 2.4 kHz low-pass, faded
// in over 3 s and out over 4 s; it never builds or drops: the hook fades it in, every middle role is the same pad-only 'break', the lock-up fades it out. The voice carries
// the film; the bed sits at half volume under it, and the reading of a claim or a figure ducks it a further 4 dB. Five
// short cues mark picture events: a whoosh (pink-noise sweep) on a push-in or a turn, a tick (1.32 kHz) on a count, a
// pill or a check, a paper rub on a label or a chip (lib/audio's `paper`), a pen scratch on a hand-drawn mark (`scratch`), a dull thud on a stamp.
// From teach-video scripts/voice/voice.py (step_audio) and the kits' build/assemble.cjs (bed volume 0.5); both style
// kits (terminal-ledger, blueprint-zoom) use the same bed. lib/audio has no preset for it: the recipe is voice.py's.
import { drawTable } from '../data-bed/table.js';

export const SOUND = {
  bed: { preset: null, recipe: { name: 'narration-pad', from: 'teach-video scripts/voice/voice.py step_audio', chords: ['Fmaj7', 'Cmaj7/E', 'Am7', 'G6'], layers: ['pad: summed sines, slow tremolo, echo 120/260 ms, low-pass 2.4 kHz; one chord every 8 s, 1.2 s crossfade'], volume: 0.5 },
    bpm: { default: 120, min: 90, max: 140 }, key: 'C major (F lydian colour)', mix: 'v2',
    kinds: { hook: 'intro', problem: 'break', turn: 'break', demo: 'break', climax: 'break', proof: 'break', claim: 'break', rest: 'break', lockup: 'outro' },
    energy: { hook: 0.2, problem: 0.2, turn: 0.2, demo: 0.2, climax: 0.25, proof: 0.2, claim: 0.2, rest: 0.2, lockup: 0.2 },
    reading: 'duck: the voice leads all film; the pad stays at half volume and a claim or a figure being read ducks it a further 4 dB' },
  cues: {
    turn: { voice: 'whoosh', opts: { dur: 0.9, color: 'pink', band: 900 }, gain: -18, lead: 0.35, note: 'a push-in, a zoom, a scene change' },
    tick: { voice: 'tick', opts: { freq: 1320, dur: 0.12 }, gain: -22, note: 'a count lands, a pill pops, a window is read, a lamp lights' },
    accent: { voice: 'paper', opts: { dur: 0.32 }, gain: -23, note: 'a label, a chip or a card lands on the page (the kit\'s paper rub)' },
    land: { voice: 'tick', opts: { freq: 1320, dur: 0.12 }, gain: -20, note: 'a counter settles with its hop' },
    hit: { voice: 'stamp', opts: { freq: 92, dur: 0.25 }, gain: -16, note: 'the stamp presses' },
    claim: { duck: { depth: -4, hold: 'read' } },
    end: { voice: 'tick', opts: { freq: 1320 }, gain: -22, note: 'the last figure lands' },
    device: { 'hand-mark': { voice: 'scratch', opts: { dur: 0.34 }, gain: -26, note: 'a pen stroke under the mark (the kit\'s scratch)' }, 'layer-zoom': { voice: 'whoosh', opts: { dur: 0.9 }, gain: -18, lead: 0.35, note: 'into the layer' }, 'msg-hop': { voice: 'tick', opts: { freq: 1320 }, gain: -24, note: 'a message arrives' } },
  },
  master: { lufs: -16, tp: -1.5, tone: 'v2', fadeIn: 3, fadeOut: 4, note: 'the voice is mastered with it; the pad never competes with it' },
};
export default {
  id: 'narration-pad', kind: 'sound',
  sound: SOUND,
  draw(ctx, opts) { drawTable(ctx, SOUND, { title: { en: 'Narration pad', zh: '解说音乐垫' }, note: { en: 'a quiet pad under the voice; five short cues on picture events', zh: '解说下面一层安静的和弦垫；画面事件配五种短音效' } }, opts); },
};

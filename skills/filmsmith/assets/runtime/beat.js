// beat.js — the beat grid is the film's clock. Picture (index.html) and sound (score.mjs) both read it,
// so cuts, landings and sound events agree to the frame.

// grid({ bpm: 120, t0: 0, beatsPerBar: 4 })
export const grid = ({ bpm, t0 = 0, beatsPerBar = 4 }) => {
  const beat = 60 / bpm;
  const bar = beat * beatsPerBar;
  return {
    bpm, t0, beat, bar, beatsPerBar,
    bt: (n) => t0 + n * beat, // time of beat n (fractional beats allowed)
    br: (n) => t0 + n * bar, // time of bar n
    snap: (t) => t0 + Math.round((t - t0) / beat) * beat,
    beatAt: (t) => (t - t0) / beat,
  };
};

// Lay scenes end to end on the bar grid. scenes: [{ bars: 2, ... }] → each gets start, end, startBar, dur (seconds).
// Durations come from bars only, so editing a scene's length never breaks the cut-on-the-bar rule.
export const layout = (scenes, g, startBar = 0) => {
  let bar = startBar;
  return scenes.map((s) => {
    const start = g.br(bar), end = g.br(bar + s.bars);
    const out = { ...s, startBar: bar, start, end, dur: end - start };
    bar += s.bars;
    return out;
  });
};

// The scene active at t, and the local time inside it.
export const at = (laid, t) => {
  for (let i = laid.length - 1; i >= 0; i--) if (t >= laid[i].start) return { scene: laid[i], index: i, local: t - laid[i].start };
  return { scene: laid[0], index: 0, local: t - laid[0].start };
};

export const totalBars = (scenes) => scenes.reduce((n, s) => n + s.bars, 0);

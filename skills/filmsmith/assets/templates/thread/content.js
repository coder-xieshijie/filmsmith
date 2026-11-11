// content.js — the film. The only file edited for an ordinary film; slots and limits are in TEMPLATE.md.
// Scene order is fixed (the chain); palette, curves and ink may be left out, and the short chain drops the head
// (open + word) or the tail (tracks + review, with curves and ink): TEMPLATE.md "Short chain". No duration and no bars:
// lib/timing.js fit() sizes every link from its copy (timing.rules.js); `npm run fit` prints the table.
// Optional: bpm (112–128, default 120) or target (seconds; the tempo moves inside that range to meet it).
// Numbers about the film itself are placeholders filled at run time: {seconds} {frames} {fps} {width} {height}.
// This mode fits only a reel for a video, motion or rendering tool (see the mode card); the example is the
// filmsmith skill explaining its own pipeline.
export default {
  fps: 30, // keep 30: the render command uses 30 and the counter shows ceil(duration × fps)
  palette: 'vermilion',
  thread: 'rule', // the line's profile: 'rule' (even weight, the default) or 'swell' (a swelled rule); mode card "Variants"
  seed: 5150,
  meta: { title: 'filmsmith: how a film gets built', url: 'github.com/coder-xieshijie/filmsmith' },
  scenes: [
    { type: 'open', stage: { name: 'Prompt', note: 'one sentence sets the brief' }, brief: ['explain our pipeline', 'in {seconds} seconds'] },
    { type: 'word', word: 'Plan.' },
    { type: 'palette', stage: { name: 'Colour', note: 'every hex comes from one preset' } },
    { type: 'storyboard', stage: { name: 'Boards', note: 'six panels before anything moves' } },
    { type: 'merge', stage: { name: 'Physics', note: 'volume and light, computed per frame' } },
    { type: 'curves', stage: { name: 'Physics', note: 'springs settle on the beat' } },
    { type: 'tracks', stage: { name: 'Cut', note: 'sound and picture share one clock' }, tracks: ['SHOTS', 'GL PASSES', 'MUSIC', 'TITLES'] },
    { type: 'ink', stage: { name: 'Output', note: 'no camera and no stock footage' }, words: 'pure code' },
    { type: 'review', stage: { name: 'Output', note: '{frames} frames, each one inspected' }, count: 'FRAMES RENDERED', card: 'MP4' },
    { type: 'close', name: 'filmsmith', line: 'Every film is code: scored, timed and checked.', url: 'github.com/coder-xieshijie/filmsmith' },
  ],
};

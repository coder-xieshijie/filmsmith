// content.js — the film. The only file edited for an ordinary film (TEMPLATE.md lists every slot and its limit).
// The example films this skill's own README, as rendered on its public repository page: two captures made with
// tools/capture.mjs on 2026-10-21 (commands below), clipped to the README so nothing else of the page is in the files.
export default {
  palette: 'graphite',            // palettes.js: graphite (default) · umber · porcelain
  device: 'laptop',               // form variant: 'laptop' (default) | 'phone'
  seed: 3,
  // bpm: 120,                    // optional; default and range in timing.rules.js
  meta: { title: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith' },

  // The real assets, with their manifest. Files are kept as captured (sha256); the film only shows `public`
  // (default: the whole image) through views under the zoom cap. Boxes are in the file's own px, measured with
  // `--probe` and tools/ocr.swift. `reads`: what the region shows, transcribed at capture; every digit in the copy
  // that the region backs must appear in it (npm run assets checks it, and reads it back with OCR where it can).
  assets: {
    readme: {
      file: 'assets/real/readme-top.webp', size: [1329, 1302], sha256: '6a8559b1275a1ec58b031b068872ef7ab2a57bba7ef0dc051eb8e30003642222',
      source: 'https://github.com/coder-xieshijie/filmsmith (the README as rendered on the repository page)', captured: '2026-10-21',
      how: "node tools/capture.mjs https://github.com/coder-xieshijie/filmsmith assets/real/readme-top.webp --selector article.markdown-body --height 820 --scale 1.5 --quality 72 --pad 24",
      licence: 'the README text and the style stills are this repository\'s own (MIT)',
      people: 'none: the clip is the README only (no avatars, account rows or contributor lists)',
      chin: 'github.com/coder-xieshijie/filmsmith',
      regions: {
        title: { box: [36, 44, 216, 50], reads: 'Filmsmith' },
        lede: { box: [130, 360, 266, 36], band: [322, 112], reads: 'every frame drawn in code' },
        stills: { box: [36, 451, 1257, 286], band: [446, 296], reads: '' },
      },
    },
    guide: {
      file: 'assets/real/readme-guide.webp', size: [1152, 2417], sha256: '3dde4c28f66a841106f7561aece45e160a9342da1cfb1a0de2c29b3ce047f85d',
      source: 'https://github.com/coder-xieshijie/filmsmith (the README as rendered on the repository page)', captured: '2026-10-21',
      how: "node tools/capture.mjs https://github.com/coder-xieshijie/filmsmith assets/real/readme-guide.webp --selector article.markdown-body --from 'Any agent, any model' --to 'pace and hand-offs' --scale 1.3 --quality 66 --pad 24",
      licence: 'the README text is this repository\'s own (MIT)',
      people: 'none: README text and code blocks only',
      chin: 'github.com/coder-xieshijie/filmsmith',
      regions: {
        agents: { box: [31, 31, 520, 50], reads: 'Any agent, any model' },
        nokey: { box: [368, 250, 166, 34], band: [218, 100], reads: 'needs no API key' },
        onefile: { box: [774, 320, 322, 34], band: [318, 100], reads: 'The agent writes one' },
        pace: { box: [64, 2186, 296, 36], band: [2152, 104], reads: 'a new composition every 2–3 s' },
        lufs: { box: [462, 2320, 190, 36], band: [2318, 72], reads: 'loudness (−14 LUFS)' },
      },
    },
  },

  scenes: [
    { type: 'wake', asset: 'readme', name: 'Filmsmith', note: 'its own README', line: 'films made in code' },
    { type: 'push', asset: 'readme', region: 'lede', zoom: 1.3, value: 'Every frame', note: 'and every sound', line: 'drawn in code' },
    { type: 'push', asset: 'readme', region: 'stills', zoom: 0.9, value: 'Its frames', note: 'one still per style', line: 'drawn, not filmed' },
    { type: 'flip', asset: 'guide', region: 'agents', view: { region: 'agents', zoom: 'rest', anchor: 'top' }, value: 'Any agent', note: 'a shell, Node and FFmpeg', line: 'no special tools' },
    { type: 'band', asset: 'guide', rows: [
      { region: 'nokey', value: 'No API key', note: 'no generation model', line: 'nothing is generated' },
      { region: 'onefile', value: 'One file', note: 'content.js', line: 'the agent writes' },
    ] },
    { type: 'scroll', asset: 'guide', region: 'pace', value: '2–3 s', note: 'a new composition', line: 'a change every beat' },
    { type: 'claim', asset: 'guide', region: 'lufs', zoom: 1.3, lead: 'each film measured', note: 'by check-film', value: '−14 LUFS', line: 'loudness, checked' },
    { type: 'lockup', asset: 'readme', region: 'title', name: 'Filmsmith', line: 'an agent skill', url: 'github.com/coder-xieshijie/filmsmith' },
  ],
};

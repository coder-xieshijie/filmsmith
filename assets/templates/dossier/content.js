// content.js — the film. The only file edited for an ordinary film (see TEMPLATE.md for every slot and its limits).
//
// This example films the skill's own public pages, captured 2026-10-21 with tools/capture.mjs: claims from its README,
// its audio kit's README and its CHANGELOG, struck where they are printed, tied to their exhibits; one value matched
// across two sources; one number carried onto a worksheet. It shows each page change once: sheet-shuffle, louvre,
// match-cut, and split-open for the spread.
// Every number on screen is printed on its page (npm run assets checks it).
export default {
  palette: 'yellow', // palettes.js: yellow (default) | magenta | coral
  highlight: 'band', // form variant: 'band' (a stroke over the claim) | 'underline' (every stroke runs under the line)
  seed: 1,
  meta: {
    slug: 'Source file: Filmsmith 0.3.0', // the persistent frame, top left (≤ 40 characters)
    title: 'Filmsmith 0.3.0, on its own pages',
  },

  // Real assets: files in assets/real/, kept exactly as captured (crop, scale and dim only; never edited). `drawn`:
  // strings the film sets in code from this page, which the page must print; `expect` / `forbid`: strings the page must
  // / must not show; `private`: rectangles that must stay out of every crop (an account row, a sidebar). The film
  // shows no people: crop them out (npm run assets flags faces where the OS can detect them).
  assets: {
    styles: {
      file: 'assets/real/readme-styles.webp', size: [1257, 711], sha256: 'ece1fdcd5df62a051af779642c47457e6383bd54e431ed0d2b3626ebf9b74474',
      page: 'https://github.com/coder-xieshijie/filmsmith', captured: '2026-10-21', kind: 'as published',
      how: 'node tools/capture.mjs page <page> <out> --text "Ten styles" --above 4 --below 420 --within article.markdown-body --span article.markdown-body --pad 0 --w 1280 --scale 1.5 --quality 78',
      expect: ['Ten styles', 'one visual language'], drawn: [], forbid: [],
    },
    agents: {
      file: 'assets/real/readme-any-agent.webp', size: [1257, 510], sha256: '8de6e9256fac20f03652faf0ef080f533be127dd3e72d11260ec05ad0a10fa04',
      page: 'https://github.com/coder-xieshijie/filmsmith', captured: '2026-10-21', kind: 'as published',
      how: 'node tools/capture.mjs page <page> <out> --text "Filmsmith asks very little of the agent" --above 70 --below 300 --within article.markdown-body --span article.markdown-body --pad 0 --w 1280 --scale 1.5 --quality 80',
      expect: ['A shell, Node.js and FFmpeg.', 'No generation model.'], drawn: [], forbid: [],
    },
    audio: {
      file: 'assets/real/audio-master.webp', size: [1292, 486], sha256: 'f6b3e5dee035d9719ef1ed822d780348a392ffefce1d16856586dd88eee1b818',
      page: 'https://github.com/coder-xieshijie/filmsmith/blob/main/assets/runtime/audio/README.md', captured: '2026-10-21', kind: 'as published',
      how: 'node tools/capture.mjs page <page> <out> --text "re-masters with a lower true-peak target" --within article.markdown-body --span article.markdown-body --pad 6 --w 1280 --scale 1.5 --quality 80',
      expect: ['true-peak target', 'check-film'], drawn: ['−1.9 dBTP'], forbid: [],
    },
    changelog: {
      file: 'assets/real/changelog-0.3.0.webp', size: [1292, 396], sha256: 'e8490a06d843600fe5223276e5c3e4add49c3ae0b9b101dd5605e1f374fbbcbd',
      page: 'https://github.com/coder-xieshijie/filmsmith/blob/main/CHANGELOG.md', captured: '2026-10-21', kind: 'as published',
      how: 'node tools/capture.mjs page <page> <out> --text "0.3.0 — 2026-10-20" --above 10 --below 210 --within article.markdown-body --span article.markdown-body --pad 0 --w 1280 --scale 1.5 --quality 80',
      expect: ['0.3.0', '2026-10-20', 'delivery ceiling'], drawn: ['−1.9 dBTP', '0.4 dB', '−1.5'], forbid: [],
    },
  },

  scenes: [
    // The cold open: the first exhibit is already on the mat; its claim is struck within the first second (the hook).
    { type: 'exhibit', ex: 1, asset: 'styles', crop: [0, 0, 1257, 436], where: 'github.com · README · 2026-10-21',
      band: [0, 0, 176, 52], leader: 'left', claim: 'Ten styles in one skill.', terms: 'Each with a template and demo' },
    // sheet-shuffle: the top sheet is drawn out to the side and tucked under; the next one squares up from the pile.
    { type: 'exhibit', ex: 2, asset: 'agents', crop: [0, 0, 1257, 360], enter: 'sheet-shuffle', where: 'github.com · README · 2026-10-21',
      band: [14, 64, 366, 38], leader: 'left', claim: 'Runs on a shell, Node.js and FFmpeg.', terms: 'No agent-specific tools' },
    { type: 'claim', band: [14, 137, 280, 38], leader: 'left', claim: 'No generation model, no key.', terms: 'Pictures and sound in code' },
    // louvre: the page is cut into slats along the rows it struck, each slat pushed out by a slice of the next page.
    { type: 'exhibit', ex: 3, asset: 'audio', crop: [0, 0, 1292, 486], enter: 'louvre', where: 'github.com · audio README · 2026-10-21',
      band: [1084, 296, 142, 38], leader: 'right', claim: 'Masters are held at −1.9 dBTP.', terms: 'After the renderer\'s AAC encode' },
    // match-cut: the same value printed in the next source; the page slides it into register and cuts on one frame.
    { type: 'exhibit', ex: 4, asset: 'changelog', crop: [0, 0, 1292, 300], enter: 'match-cut', match: { from: [1108, 299, 114, 32], to: [529, 89, 116, 29] },
      where: 'github.com · CHANGELOG · 2026-10-21', band: [525, 85, 124, 32], leader: false, claim: 'Release 0.3.0 set that ceiling.', terms: 'The changelog, October 20' },
    // No leader: any path from these bands to the sticker crosses page text; the figure is lifted instead (the slip).
    { type: 'claim', band: [790, 86, 258, 34], leader: false, claim: 'The check-film gate is −1.5.', terms: 'Its delivery gate' },
    // split-open: the spread opens on a seam beside the exhibit; the figure is carried onto the worksheet as a slip.
    { type: 'worksheet', title: 'Loudness margin', carry: { region: [525, 85, 114, 23], ink: [531, 91, 108, 12], text: '−1.9 dBTP' },
      rows: [['check-film gate', '−1.5 dBTP'], ['delivery ceiling', '−1.9 dBTP']] },
    { type: 'result', value: '0.4 dB', caption: 'under the gate', claim: ['Every mix lands', '0.4 dB under the gate.'], terms: 'Both numbers from exhibit 4' },
    { type: 'ledger', claim: ['Every claim,', 'struck where it was printed.'],
      rows: [['1', 'Ten styles in one skill', 'README'], ['2', 'Shell, Node.js, FFmpeg; no model', 'README'], ['3', 'Masters held at −1.9 dBTP', 'audio README']] },
    { type: 'lockup', name: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith', caption: 'Sources captured 2026-10-21 · github.com' },
  ],
};

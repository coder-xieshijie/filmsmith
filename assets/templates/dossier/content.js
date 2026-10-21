// content.js — the film. The only file edited for an ordinary film (see TEMPLATE.md for every slot and its limits).
//
// This example films the skill's own public pages, captured 2026-10-21 with tools/capture.mjs: three claims from its
// README and CHANGELOG, struck where they are printed, tied to their exhibits, one number carried onto a worksheet.
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
    changelog: {
      file: 'assets/real/changelog-0.3.0.webp', size: [1292, 396], sha256: 'e8490a06d843600fe5223276e5c3e4add49c3ae0b9b101dd5605e1f374fbbcbd',
      page: 'https://github.com/coder-xieshijie/filmsmith/blob/main/CHANGELOG.md', captured: '2026-10-21', kind: 'as published',
      how: 'node tools/capture.mjs page <page> <out> --text "0.3.0 — 2026-10-20" --above 10 --below 210 --within article.markdown-body --span article.markdown-body --pad 0 --w 1280 --scale 1.5 --quality 80',
      expect: ['0.3.0', '2026-10-20', 'delivery ceiling'], drawn: ['−1.9 dBTP', '0.4 dB', '−1.5'], forbid: [],
    },
  },

  scenes: [
    // The cold open: the first exhibit is already on the mat; its claim is struck in the first two seconds (the hook).
    { type: 'exhibit', ex: 1, asset: 'styles', crop: [0, 0, 1257, 436], where: 'github.com · README · 2026-10-21',
      band: [0, 0, 176, 52], leader: 'left', claim: 'Ten styles in one skill.', terms: 'Each with a template and demo' },
    // The page turns over its top edge; the next exhibit is already underneath.
    { type: 'exhibit', ex: 2, asset: 'agents', crop: [0, 0, 1257, 360], enter: 'turn', edge: 'top', where: 'github.com · README · 2026-10-21',
      band: [14, 64, 366, 38], leader: 'left', claim: 'Runs on a shell, Node.js and FFmpeg.', terms: 'No agent-specific tools' },
    { type: 'claim', band: [14, 137, 280, 38], leader: 'left', claim: 'No generation model, no key.', terms: 'Pictures and sound in code' },
    // Turned to over the left edge (a variant of the same page turn); the worksheet that follows lays it out as a spread.
    { type: 'exhibit', ex: 3, asset: 'changelog', crop: [0, 0, 1292, 300], enter: 'turn', edge: 'left', where: 'github.com · CHANGELOG · 2026-10-21',
      band: [0, 4, 340, 46], leader: 'left', claim: 'Release 0.3.0, out October 20.', terms: 'The changelog, as published' },
    // No leader: any path from this band to the sticker crosses page text, so the number is lifted instead (the slip).
    { type: 'claim', band: [255, 83, 792, 42], leader: false, claim: 'Mixes ship at −1.9 dBTP.', terms: 'The gate sits at −1.5' },
    // The number is carried off the page as a paper slip and the arithmetic is done on the worksheet.
    { type: 'worksheet', title: 'Loudness margin', carry: { region: [525, 85, 114, 23], ink: [531, 91, 108, 12], text: '−1.9 dBTP' },
      rows: [['check-film gate', '−1.5 dBTP'], ['delivery ceiling', '−1.9 dBTP']] },
    { type: 'result', value: '0.4 dB', caption: 'under the gate', claim: ['Every mix lands', '0.4 dB under the gate.'], terms: 'Both numbers from exhibit 3' },
    { type: 'ledger', claim: ['Every claim,', 'struck where it was printed.'],
      rows: [['1', 'Ten styles in one skill', 'README'], ['2', 'Shell, Node.js, FFmpeg; no model', 'README'], ['3', '0.4 dB under the loudness gate', 'CHANGELOG']] },
    { type: 'lockup', name: 'Filmsmith', url: 'github.com/coder-xieshijie/filmsmith', caption: 'Sources captured 2026-10-21 · github.com' },
  ],
};

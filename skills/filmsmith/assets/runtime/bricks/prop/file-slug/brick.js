// file-slug — the persistent frame of a dossier film: at y 54, in mono 25 px (Chinese 28) in the mat's muted ink, the
// source file on the left ("Source file: …", the same in every scene) and the page in hand on the right ("Exhibit 2 of
// 4", "Worksheet, from exhibit 4", "Index of exhibits", "4 exhibits"); when the page changes, the old text leaves
// upward in 0.2 s and the new one rises 0.1 s later (0.3 s, expo out). It tells the viewer where in the file they are.
// From the dossier template's example (the dossier source film film.js paintHeader, build header).
import { header, pageText } from '../../look/evidence-mat/kit.js';

export default {
  id: 'file-slug', kind: 'prop',
  surface: ['canvas'],
  sizes: { S: [960, 540], M: [1440, 810], L: [1920, 1080] },
  // u: the page change's progress (0 the old page, 1 the new one)
  states: { before: { u: 0 }, changing: { u: 0.45 }, after: { u: 1 } },
  parts: ['slug', 'page'],
  swap: { slug: { type: 'text', tier: 'glance', limits: { en: { chars: 54 }, zh: { chars: 26 } } } },
  roles: ['ground', 'dim'],
  defaults: (ctx = {}) => ({ slug: ctx.lang === 'zh' ? '来源档案：示例模型 2.0' : 'Source file: Example Model 2.0', ex: 2, of: 4 }),
  draw(ctx, state, P) {
    const k = P.w / 1920, C = P.colors, L = P.lang || 'en';
    ctx.save(); ctx.scale(k, k);
    ctx.fillStyle = C.ground; ctx.fillRect(0, 0, 1920, 1080);
    // at its own place in the frame (y 54); the sample shows it lowered to the middle
    ctx.translate(0, 440);
    const prev = pageText('exhibit', { ex: P.ex, of: P.of }, L), page = pageText('worksheet', { ex: P.ex }, L);
    header(ctx, state.u <= 0 ? 0 : 0.4 * state.u + 1e-3, { slug: P.slug, page: state.u <= 0 ? prev : page, prev: state.u <= 0 ? null : prev, at: 0 }, C, L);
    ctx.restore();
  },
};

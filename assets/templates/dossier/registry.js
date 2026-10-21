// registry.js — dossier scene types, their slots and limits, and validate(content). TEMPLATE.md documents each slot.
// Limits are in characters and words; type sizes never shrink to fit (principle 1): copy that does not fit is
// rewritten shorter. Mono type is 15 px per character at 25 px, so sticker lines are sized from their length.
import PALETTES from './palettes.js';

export const TYPES = ['exhibit', 'claim', 'worksheet', 'result', 'ledger', 'lockup'];
export const HIGHLIGHTS = ['band', 'underline'];
export const LIMITS = {
  slug: 40, claimWords: 8, claimChars: 46, termsWords: 6, termsChars: 40, where: 40, exMax: 9,
  title: 22, carryText: 14, rows: [1, 3], rowLabel: 18, rowValue: 12, value: 8, caption: 22,
  ledgerRows: [1, 4], ledgerText: 34, ledgerWords: 6, ledgerSource: 14, name: 14, url: 44, capLine: 64,
};
const words = (s) => String(s ?? '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const isRect = (r) => Array.isArray(r) && r.length === 4 && r.every((v) => Number.isFinite(v)) && r[2] > 0 && r[3] > 0;
const inside = ([x, y, w, h], [X, Y, W, H]) => x >= X && y >= Y && x + w <= X + W && y + h <= Y + H;
const overlap = ([ax, ay, aw, ah], [bx, by, bw, bh]) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
export const LEADERS = ['down', 'left', 'right', false];

// Frame-level transitions of lib/transitions a film may name as an exhibit's `enter` (the page change); the names are
// checked in the browser against the library (changes.js), here only for shape.
export const BUILTIN_ENTER = ['turn', 'deal'];

export const validate = (c) => {
  const e = [];
  const str = (v, path, max, { words: wmax, required = true } = {}) => {
    if (v == null || v === '') { if (required) e.push(`${path}: required`); return; }
    if (typeof v !== 'string') { e.push(`${path}: must be a string`); return; }
    if (v.length > max) e.push(`${path}: ${v.length} characters, at most ${max} ("${v}")`);
    if (wmax && words(v) > wmax) e.push(`${path}: ${words(v)} words, at most ${wmax} ("${v}")`);
  };
  if (!PALETTES[c.palette]) e.push(`palette: "${c.palette}" is not one of ${Object.keys(PALETTES).join(', ')}`);
  if (c.highlight != null && !HIGHLIGHTS.includes(c.highlight)) e.push(`highlight: "${c.highlight}" is not one of ${HIGHLIGHTS.join(', ')}`);
  str(c.meta?.slug, 'meta.slug', LIMITS.slug);
  const A = c.assets && typeof c.assets === 'object' ? c.assets : (e.push('assets: an object of real assets is required'), {});
  for (const [id, a] of Object.entries(A)) {
    if (typeof a.file !== 'string' || !a.file.startsWith('assets/real/')) e.push(`assets.${id}.file: a path under assets/real/`);
    if (!(Array.isArray(a.size) && a.size.length === 2 && a.size.every((v) => v > 0))) e.push(`assets.${id}.size: [width, height] in px`);
    if (!/^[0-9a-f]{64}$/.test(a.sha256 ?? '')) e.push(`assets.${id}.sha256: the file's sha256 (tools/capture.mjs prints it)`);
    if (!['as published', 'as captured'].includes(a.kind)) e.push(`assets.${id}.kind: 'as published' (a published page) or 'as captured' (a screenshot of an app)`);
    for (const k of ['page', 'captured']) if (typeof a[k] !== 'string' || !a[k]) e.push(`assets.${id}.${k}: required`);
    for (const k of ['expect', 'drawn', 'forbid']) if (a[k] != null && !Array.isArray(a[k])) e.push(`assets.${id}.${k}: an array of strings`);
    if (a.private != null && !(Array.isArray(a.private) && a.private.every(isRect))) e.push(`assets.${id}.private: an array of [x, y, w, h]`);
  }
  const S = Array.isArray(c.scenes) ? c.scenes : (e.push('scenes: an array is required'), []);
  if (S.length && S[0].type !== 'exhibit') e.push('scenes[0]: the film opens cold on an exhibit (type "exhibit")');
  if (S.length && S.at(-1).type !== 'lockup') e.push(`scenes[${S.length - 1}]: the film closes on a "lockup"`);
  let sheet = null, last = null;
  S.forEach((s, i) => {
    const p = `scenes[${i}] (${s?.type})`;
    if (!TYPES.includes(s?.type)) { e.push(`scenes[${i}]: type "${s?.type}" is not one of ${TYPES.join(', ')}`); return; }
    const claimText = (v, path) => {
      if (Array.isArray(v)) {
        if (v.length !== 2) e.push(`${path}: one string, or two phrases`);
        v.forEach((x, k) => str(x, `${path}[${k}]`, LIMITS.claimChars, { words: 5 }));
        if (words(v.join(' ')) > LIMITS.claimWords) e.push(`${path}: ${words(v.join(' '))} words in all, at most ${LIMITS.claimWords}`);
      } else str(v, path, LIMITS.claimChars, { words: LIMITS.claimWords });
    };
    const band = (asset) => {
      if (!isRect(s.band)) { e.push(`${p}.band: [x, y, w, h] in the asset's px`); return; }
      if (sheet && isRect(sheet.crop) && !inside(s.band, sheet.crop)) e.push(`${p}.band: must lie inside the exhibit's crop [${sheet.crop}]`);
      if (s.under != null && typeof s.under !== 'boolean') e.push(`${p}.under: true or false`);
      if (s.leader != null && !LEADERS.includes(s.leader)) e.push(`${p}.leader: 'down', 'left', 'right' or false`);
      claimText(s.claim, `${p}.claim`);
      str(s.terms, `${p}.terms`, LIMITS.termsChars, { words: LIMITS.termsWords });
      if (asset?.private?.some((r) => isRect(sheet?.crop) && overlap(r, sheet.crop))) e.push(`${p}: the crop shows a private region of assets.${sheet.asset}`);
    };
    if (s.type === 'exhibit') {
      sheet = s;
      const a = A[s.asset];
      if (!a) e.push(`${p}.asset: "${s.asset}" is not in assets`);
      if (!Number.isInteger(s.ex) || s.ex < 1 || s.ex > LIMITS.exMax) e.push(`${p}.ex: the exhibit number, 1–${LIMITS.exMax}`);
      if (!isRect(s.crop)) e.push(`${p}.crop: [x, y, w, h] in the asset's px`);
      else if (a && !inside(s.crop, [0, 0, ...a.size])) e.push(`${p}.crop: outside the asset (${a.size.join(' × ')})`);
      str(s.where, `${p}.where`, LIMITS.where);
      if (s.enter != null && (typeof s.enter !== 'string' || !s.enter)) e.push(`${p}.enter: a page change's name ('turn', 'deal', a lib/transitions id or a registered change)`);
      if (i > 0 && s.enter == null) e.push(`${p}.enter: how the page arrives, 'turn' (the page above turns away), 'deal' or a lib/transitions id`);
      if (s.enter === 'turn' && s.edge != null && !['top', 'left'].includes(s.edge)) e.push(`${p}.edge: 'top' or 'left'`);
      if (s.sticker != null && !['right', 'left'].includes(s.sticker)) e.push(`${p}.sticker: 'right' or 'left'`);
      band(a);
    } else if (s.type === 'claim') {
      if (!['exhibit', 'claim'].includes(last)) e.push(`${p}: follows an exhibit or a claim (the band moves on the same sheet)`);
      band(A[sheet?.asset]);
    } else if (s.type === 'worksheet') {
      if (!['exhibit', 'claim'].includes(last)) e.push(`${p}: follows an exhibit or a claim (it lies beside that sheet)`);
      str(s.title, `${p}.title`, LIMITS.title);
      if (s.carry != null) {
        if (!isRect(s.carry.region) || !isRect(s.carry.ink)) e.push(`${p}.carry: { region, ink, text } with rectangles in the exhibit's asset px`);
        else if (sheet && isRect(sheet.crop) && !inside(s.carry.region, sheet.crop)) e.push(`${p}.carry.region: inside the exhibit's crop`);
        str(s.carry.text, `${p}.carry.text`, LIMITS.carryText);
      }
      const n = Array.isArray(s.rows) ? s.rows.length : 0;
      if (n < LIMITS.rows[0] || n > LIMITS.rows[1]) e.push(`${p}.rows: ${LIMITS.rows[0]}–${LIMITS.rows[1]} rows of [label, value]`);
      (s.rows || []).forEach((r, k) => { str(r?.[0], `${p}.rows[${k}][0]`, LIMITS.rowLabel); str(r?.[1], `${p}.rows[${k}][1]`, LIMITS.rowValue); });
    } else if (s.type === 'result') {
      if (last !== 'worksheet') e.push(`${p}: follows a worksheet (the result is computed on it)`);
      str(s.value, `${p}.value`, LIMITS.value); str(s.caption, `${p}.caption`, LIMITS.caption);
      if (!Array.isArray(s.claim)) e.push(`${p}.claim: two phrases (the second lands on the bar line as the result is struck)`);
      claimText(s.claim, `${p}.claim`);
      str(s.terms, `${p}.terms`, LIMITS.termsChars, { words: LIMITS.termsWords });
    } else if (s.type === 'ledger') {
      if (!Array.isArray(s.claim)) e.push(`${p}.claim: two phrases`);
      claimText(s.claim, `${p}.claim`);
      const n = Array.isArray(s.rows) ? s.rows.length : 0;
      if (n < LIMITS.ledgerRows[0] || n > LIMITS.ledgerRows[1]) e.push(`${p}.rows: ${LIMITS.ledgerRows[0]}–${LIMITS.ledgerRows[1]} rows of [ex, text, source]`);
      (s.rows || []).forEach((r, k) => { str(r?.[0], `${p}.rows[${k}][0]`, 2); str(r?.[1], `${p}.rows[${k}][1]`, LIMITS.ledgerText, { words: LIMITS.ledgerWords }); str(r?.[2], `${p}.rows[${k}][2]`, LIMITS.ledgerSource); });
    } else if (s.type === 'lockup') {
      if (i !== S.length - 1) e.push(`${p}: the lockup is the last scene`);
      str(s.name, `${p}.name`, LIMITS.name); str(s.url, `${p}.url`, LIMITS.url); str(s.caption, `${p}.caption`, LIMITS.capLine, { required: false });
      if (s.mark != null) {
        if (!A[s.mark.asset]) e.push(`${p}.mark.asset: "${s.mark.asset}" is not in assets`);
        if (!isRect(s.mark.crop)) e.push(`${p}.mark.crop: [x, y, w, h]`);
      }
    }
    last = s.type;
  });
  return e;
};

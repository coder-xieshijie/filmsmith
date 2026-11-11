// palettes.js — the stream mode's colour presets. Choose one by id in content.js; never invent hex values.
// One accent per film: `line` is the thread, the stars, the glow, the one "needs you" pill, and nothing else.
// `accentInk` is the same hue darkened for text on the paper blocks (status words), so it is not a second accent.
// Run `node palettes.js` to print the measured WCAG contrast of every text pair (also checked on load in the page).

const P = {
  night: {
    name: 'Night sky, blue thread (source)',
    fits: 'default; agent, scheduling and developer products',
    ground: '#05070D', field: '#0B1426', fieldEdge: '#04050A', dust: '#C8DEFF',
    line: '#4DB5FF', glow: '#D6EEFF', core: '#F0FAFF', onLine: '#05070D',
    text: '#EEF3FF', text2: '#A9B6CC', panel: '#0F1B30', panel2: '#18263F',
    paper: '#F5F2EC', bubble: '#E6E2DA', ink: '#1C1E24', ink2: '#575B66', user: '#2A2D34', onUser: '#FFFFFF', rule: '#DDD8CF',
    accentInk: '#175F9C', desk1: '#EAF4FF', desk2: '#5C9EF0', desk3: '#2F6FD6', deskBar: '#F4F6FA',
  },
  ember: {
    name: 'Ember: warm dark, amber thread',
    fits: 'warmer brands, writing and research tools, night-shift stories',
    ground: '#0A0705', field: '#1C130C', fieldEdge: '#060403', dust: '#FFE6C7',
    line: '#FFB347', glow: '#FFE2B8', core: '#FFF7EC', onLine: '#0A0705',
    text: '#FBF1E6', text2: '#C9B7A2', panel: '#1F150E', panel2: '#2B1E14',
    paper: '#F7F2EA', bubble: '#E9E1D5', ink: '#211A14', ink2: '#5F554B', user: '#2E2620', onUser: '#FFFFFF', rule: '#DED4C6',
    accentInk: '#834C00', desk1: '#FFF4E6', desk2: '#F2A65A', desk3: '#C9702A', deskBar: '#FAF6F1',
  },
  aurora: {
    name: 'Aurora: deep teal night, mint thread',
    fits: 'infrastructure, data and ops products; calm, technical',
    ground: '#03090A', field: '#0A1C1E', fieldEdge: '#020606', dust: '#CFF5EC',
    line: '#4FE0B8', glow: '#CFFBEF', core: '#F0FFFA', onLine: '#03090A',
    text: '#EAF8F4', text2: '#A2C2BB', panel: '#0C1F21', panel2: '#132C2E',
    paper: '#F2F4F1', bubble: '#E0E5E1', ink: '#172020', ink2: '#52605E', user: '#243030', onUser: '#FFFFFF', rule: '#D5DCD8',
    accentInk: '#096A50', desk1: '#EAFBF5', desk2: '#4CC7A4', desk3: '#1F8F74', deskBar: '#F3F7F5',
  },
  mono: {
    name: 'Mono: graphite night, white thread',
    fits: 'when the brand colour must stay out of the film; serious, editorial',
    ground: '#070708', field: '#16171A', fieldEdge: '#040405', dust: '#E6E6EA',
    line: '#E9EAEE', glow: '#F4F5F8', core: '#FFFFFF', onLine: '#070708',
    text: '#F2F2F4', text2: '#AEB0B7', panel: '#17181B', panel2: '#222327',
    paper: '#F3F3F1', bubble: '#E2E2DF', ink: '#1A1A1C', ink2: '#58595E', user: '#2A2A2D', onUser: '#FFFFFF', rule: '#D9D9D5',
    accentInk: '#1A1A1C', desk1: '#F4F4F6', desk2: '#A9ABB3', desk3: '#6E7079', deskBar: '#F5F5F6',
  },
};

// accent for check-film (timing.json) and for the CONTRACT's palettes.js[content.palette].accent
for (const k of Object.keys(P)) P[k].accent = P[k].line;

export const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgbStr = (h) => hexRgb(h).join(',');
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r, g, b] = hexRgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// text pairs that appear in the film, with their floor (AA 4.5 for information text; 7 where it is the main text)
export const PAIRS = [
  ['text', 'ground', 7], ['text', 'field', 7], ['text2', 'ground', 4.5], ['text2', 'field', 4.5],
  ['text', 'panel', 7], ['text2', 'panel', 4.5], ['text', 'panel2', 7],
  ['ink', 'paper', 7], ['ink2', 'paper', 4.5], ['ink', 'bubble', 7], ['onUser', 'user', 7], ['accentInk', 'paper', 4.5], ['accentInk', 'bubble', 4.5],
  ['onLine', 'line', 4.5], ['ink', 'deskBar', 7],
];
export const check = (id) => PAIRS.map(([f, b, min]) => ({ pair: `${f}/${b}`, ratio: +contrast(P[id][f], P[id][b]).toFixed(2), min, ok: contrast(P[id][f], P[id][b]) >= min }));

export default P;
export const palettes = P;

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('palettes.js')) {
  for (const id of Object.keys(P)) {
    const rows = check(id);
    console.log(`${id.padEnd(7)} ${rows.map((r) => `${r.pair} ${r.ratio}${r.ok ? '' : ' FAIL<' + r.min}`).join(' · ')}`);
  }
}

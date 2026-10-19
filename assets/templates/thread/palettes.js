// palettes.js — thread presets. Choose one by id in content.js; never invent hex values.
//
// The logic every preset keeps: one ground, one LINE colour that becomes everything (cursor, full stop,
// swatch, spheres, curves' riders, playhead, ink, the review flood, the underline), and one FIELD colour,
// the stage the volume shot plays on. Text is a neutral; onLine / onField are the text colours used on
// those two grounds. Contrast is checked in TEMPLATE.md (text ≥ 4.5:1, line on ground ≥ 3:1).
export default {
  vermilion: {
    name: 'Vermilion on cobalt (source film)',
    ground: '#0B0B0D', panel: '#17171B', text: '#EDEAE2',
    line: '#EE4938', field: '#2E2EF4', onLine: '#0B0B0D', onField: '#EDEAE2',
  },
  ultramarine: {
    name: 'Ultramarine on saffron',
    ground: '#0A0B10', panel: '#161823', text: '#ECEDF2',
    line: '#6B7BFF', field: '#F2B630', onLine: '#0A0B10', onField: '#0A0B10',
  },
  rose: {
    name: 'Rose on deep teal',
    ground: '#0D0B0E', panel: '#1A161B', text: '#F0EAEE',
    line: '#FF4F9A', field: '#0B6658', onLine: '#0D0B0E', onField: '#F0EAEE',
  },
  paper: {
    name: 'Vermilion on paper (light)',
    ground: '#EEEAE1', panel: '#E0DBD0', text: '#141416',
    line: '#EE4938', field: '#2E2EF4', onLine: '#141416', onField: '#EEEAE1',
  },
};

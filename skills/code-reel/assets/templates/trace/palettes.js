// palettes.js — trace presets. Four semantic colours, one meaning each, all film:
//   base     an untouched unit (a character, a pixel)
//   active   being counted or acted on right now
//   learned  what the algorithm produced (a merged token, an encoded run)
//   unseen   an input it never saw (the probe)
// plus neutrals: ground, text, dim (labels), faint (bars, rules), cell (an untouched cell in the token bar).
// Pick one by id in content.js. Checked by `npm run palettes`: text roles >= 4.5:1, graphics >= 3:1,
// semantic colours distinct for normal vision and under protan / deutan simulation.
export default {
  // ink: learned / unseen are manim's TEAL_C / RED_C and active is Manim Community's YELLOW_C (2026-10-18,
  // settled by theory: the domain's own tool is the best source for a named colour); base darkened for deutan.
  ink: {
    name: 'Ink (source film)',
    ground: '#0C1013', text: '#E6ECEF', dim: '#8A97A0', faint: '#2A343B', cell: '#66737C',
    base: '#7D8A93', active: '#F7D96F', learned: '#5CD0B3', unseen: '#FC6255', grain: 0.035, dark: true,
  },
  // paper: faint (bars, rules; decoration only) cooled to the hue of the text greys, L* kept (2026-10-18)
  paper: {
    name: 'Paper',
    ground: '#F5F2EA', text: '#1A1E21', dim: '#5B646A', faint: '#D3D9DE', cell: '#7D868C',
    base: '#2C3236', active: '#2456C8', learned: '#077562', unseen: '#C2362C', grain: 0.045, dark: false,
  },
  chalk: {
    name: 'Chalkboard',
    ground: '#17221F', text: '#EEEDE6', dim: '#9AA8A2', faint: '#2D3B37', cell: '#6E7D78',
    base: '#84908B', active: '#F6C945', learned: '#8FD0F7', unseen: '#FF8F70', grain: 0.05, dark: true,
  },
};

export const roles = {
  grounds: ['ground'],
  text: ['text', 'dim', 'base', 'active', 'learned', 'unseen'],
  graphic: ['cell'],
  separate: [['active', 'learned'], ['active', 'unseen'], ['learned', 'unseen'], ['base', 'learned'], ['base', 'active'], ['base', 'unseen']],
};

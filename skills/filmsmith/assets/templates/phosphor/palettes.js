// palettes.js — phosphor presets. Choose one by id in content.js; never invent hex values.
//
// Every preset keeps the mode's logic: a near-black ground tinted toward the accent, three neutral text tones,
// and ONE accent that means "passed, proven". Only the accent glows. Three helper colours are semantic and
// short-lived: `bad` marks problems, `find` marks what the second checker found, `key` is the second channel of
// the RGB split (an effect colour). None of them glows or fills large areas.
//
// Roles
//   bg, bgHi, bgLo  ground; radial gradient from bgHi (centre) to bgLo (corners)
//   ink, muted, dim text tones: primary, secondary, labels (all >= 4.5:1 on bg and panel)
//   line, panel     panel borders (decorative) and panel fill
//   accent          the one accent; hi = highlight / gradient top, deep = gradient bottom
//   on              text drawn on an accent fill (a lit chip)
//   bad, find, key  problem tags, second-checker findings, the RGB split's second channel
//   titleHi         top stop of the neutral headline gradient: a near-white tinted toward the accent (CIELAB
//                   L* 96.4, C* 4.4, at the ink's hue; was #FFFFFF, the only pure white in any mode; theory
//                   proposal T1, 2026-10-18, accepted on the recommendation)
//   titleLo         bottom stop of the neutral headline gradient
//
// Contrast (WCAG 2.2, computed on bg / panel):
//   phosphor  ink 17.3/16.5  muted 9.0/8.6  dim 6.0/5.7  accent 11.2/10.7  hi 15.6/14.9  bad 7.2/6.9  find 13.2/12.6  key 12.0/11.5  on/accent 10.6
//   amber     ink 17.2/16.5  muted 8.9/8.5  dim 5.6/5.4  accent 11.4/11.0  hi 16.3/15.6  bad 7.5/7.2  find 12.4/11.9  key 11.3/10.8  on/accent 10.8
//   ice       ink 17.1/16.2  muted 9.2/8.7  dim 5.9/5.6  accent 10.5/9.9   hi 16.6/15.7  bad 7.5/7.1  find 13.3/12.6  key 11.0/10.4  on/accent 10.0
//   cyan      ink 17.3/16.5  muted 9.0/8.5  dim 6.0/5.7  accent 11.3/10.8  hi 15.5/14.8  bad 7.2/6.9  find 13.2/12.6  key 10.9/10.4  on/accent 10.7
//   violet    ink 17.4/16.7  muted 8.9/8.5  dim 5.9/5.7  accent 11.4/11.0  hi 15.8/15.1  bad 7.4/7.1  find 13.3/12.7  key 12.1/11.6  on/accent 10.9
//   coral     ink 17.2/16.5  muted 8.8/8.4  dim 5.8/5.6  accent 6.9/6.6   hi 13.0/12.5  bad 10.9/10.5 find 13.2/12.7  key 12.0/11.6  on/accent 6.6
//   Panel borders (line) are decorative, about 1.5:1; nothing is read from them. The grounds are unchanged
//   (proposal T2, lifting them toward #121212, was not taken: it weakens the night-time terminal).
//
// Accents (CIEDE2000 to the nearest of ~120 brand and terminal-theme colours, list and script in the batch 3
// research folder, 2026-10-18):
//   phosphor #3DDC84: the source film's terminal green. It coincides with Android's brand green; the owner kept
//            it (2026-10-17: "这个新绿的强调色就用品牌绿，我理解没有问题"). hi / deep / on keep the earlier
//            phosphor preset's OKLCH relations to its accent: hi = L moved 55 % of the way to white, chroma
//            × 0.39, hue +5°; deep = L × 0.78, chroma × 0.80, hue +1°; on = L 0.172, chroma 0.032, hue +3°.
//   amber    #FFB45C: P3 amber phosphor, lightened off #FFB000 (which sits ΔE00 0.8 from a design-tool brand);
//            nearest brand ΔE00 6.3 (the Dracula theme's orange #FFB86C sits at 2.2).
//   ice      #88BFFF: P4 blue-white phosphor tint, saturated until it separates from the neutral text (ΔE00 17);
//            nearest brand ΔE00 9.7 (the Catppuccin theme's blue #89B4FA sits at 3.7).
//   cyan     #05D8E3: ANSI cyan, the sixth of the eight terminal colours, as bright as the other accents (on bg
//            11.3:1) at the hue (CIELAB h 204) farthest from the brand and theme cyans; nearest ΔE00 8.2
//            (Catppuccin sky), Material cyan 8.4, Tiffany Blue 8.5; ice 22, phosphor 27.
//   violet   #C9BCF3: the lavender-violet that today's dark terminal themes use as their key accent (Dracula,
//            Catppuccin, Tokyo Night), at the point (CIELAB h 301, C* 30) farthest from all of them; nearest ΔE00
//            7.3 (Catppuccin mauve and lavender); ice 18.
//   cyan and violet derive every other role from the accent with phosphor's relations: neutrals keep phosphor's
//   OKLCH lightness and chroma with the hue turned to the accent's (violet's text tones at 0.45–0.6 of that
//   chroma, so muted stays ΔE00 ≥ 15 from the accent, as ice does); hi / deep / on as above.
//   coral    #FF6452: "Coral red" (2026-10-19), a brand guide's flat accent taken as is (OKLCH 0.699 0.192 29.4°,
//            ΔE00 0 from the guide); 6.9:1 on bg, the lowest accent here but above 4.5 for text of any size. The same
//            guide's gradient #FF3763 → #FF7038 gives the gradient roles: `deep` is its first stop #FF3763 as is
//            (OKLCH 0.658 0.232 14.8°, 5.7:1 on bg, large type only, as every `deep`), `hi` keeps phosphor's
//            relation (L moved 55 % of the way to white, chroma × 0.39) at the hue of its last stop (40.4°, not
//            +5°), so the headline and glow gradient runs from the guide's orange end to its pink end. Neutrals,
//            `on` and `titleHi` with phosphor's relations at the accent's hue (text tones at full chroma: muted
//            already sits ΔE00 22.5 from the accent). `bad` leaves red, which would read as the accent (phosphor's
//            #FF6B6B is ΔE00 5.7 from it): violet #C9B4FF (ΔE00 38 from the accent), with `key` the blue
//            #8FD0FF (ΔE00 20.9 from bad), so the RGB split is cool against the warm accent. Nearest other
//            accent: amber, ΔE00 27.6.

export default {
  phosphor: {
    name: 'P1 phosphor green',
    fits: 'CLIs, agents, CI, anything that lives in a terminal; green is also CI\'s "passed".',
    bg: '#050A07', bgHi: '#0A1A12', bgLo: '#030604',
    ink: '#E8F1EB', muted: '#9DB3A6', dim: '#7A9385',
    line: '#1D3527', panel: '#08120D',
    accent: '#3DDC84', hi: '#B9F0D0', deep: '#1A9E5E', on: '#04140A',
    bad: '#FF6B6B', find: '#F2CF6B', key: '#8FD0FF',
    titleHi: '#EEF7F1', titleLo: '#A9B9B0',
  },
  amber: {
    name: 'P3 amber phosphor',
    fits: 'Infrastructure, databases, ops and anything with a "legacy terminal" warmth.',
    bg: '#0A0703', bgHi: '#1C1309', bgLo: '#050302',
    ink: '#F4ECE1', muted: '#BBAA94', dim: '#968570',
    line: '#3A2B1A', panel: '#130D06',
    accent: '#FFB45C', hi: '#FFE3C0', deep: '#D9822A', on: '#1A0D00',
    bad: '#FF6F87', find: '#9ED0FF', key: '#C8B8FF',
    titleHi: '#FAF4EC', titleLo: '#BFB09C',
  },
  ice: {
    name: 'P4 ice white',
    fits: 'Default (owner, 2026-10-18). Any terminal tool; cooler and quieter than phosphor, suits security, data and cloud.',
    bg: '#04080C', bgHi: '#0B1724', bgLo: '#020406',
    ink: '#E6EEF6', muted: '#AAB0B6', dim: '#848C94',
    line: '#1A2C3D', panel: '#07111B',
    accent: '#88BFFF', hi: '#DCEBFF', deep: '#3F86D6', on: '#03101C',
    bad: '#FF7070', find: '#F2CF6B', key: '#C9B4FF',
    titleHi: '#EEF6FD', titleLo: '#A7B6C4',
  },
  cyan: {
    name: 'ANSI cyan',
    fits: 'Networking, containers, APIs and observability; brighter and livelier than ice, not a green.',
    bg: '#040A0B', bgHi: '#051A1D', bgLo: '#020606',
    ink: '#E5F1F2', muted: '#97B3B6', dim: '#749297',
    line: '#133538', panel: '#061214',
    accent: '#05D8E3', hi: '#B9ECF3', deep: '#009BA4', on: '#001416',
    bad: '#FF6B6B', find: '#F2CF6B', key: '#C9B4FF',
    titleHi: '#EBF7F8', titleLo: '#A5B9BC',
  },
  violet: {
    name: 'Theme violet',
    fits: 'AI and agent tools, editors, developer products whose users live in modern dark themes.',
    bg: '#09070D', bgHi: '#181321', bgLo: '#050408',
    ink: '#EFEEF3', muted: '#AEABB4', dim: '#8E8A94',
    line: '#322A40', panel: '#110D16',
    accent: '#C9BCF3', hi: '#E8E1F7', deep: '#9086AF', on: '#120C1C',
    bad: '#FF7070', find: '#F2CF6B', key: '#8FD0FF',
    titleHi: '#F5F4FC', titleLo: '#B6B2BB',
  },
  coral: {
    name: 'Coral red',
    fits: 'A product whose own colour is a coral or pink-red; the whole film warm. The accent still means passed.',
    bg: '#0D0706', bgHi: '#21110F', bgLo: '#080404',
    ink: '#F7EBEA', muted: '#BFA6A2', dim: '#A08480',
    line: '#412723', panel: '#170C0B',
    accent: '#FF6452', hi: '#FEC3AD', deep: '#FF3763', on: '#1C0A07',
    bad: '#C9B4FF', find: '#F2CF6B', key: '#8FD0FF',
    titleHi: '#FEF2F1', titleLo: '#C2B0AC',
  },
};

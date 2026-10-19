// content.js — the film. The only file edited for an ordinary tally film (plus data/ for a new dataset).
// Every number on screen is computed from `data`: copy carries {placeholders}, see TEMPLATE.md.
// *words* take the accent colour (the protagonist only); [words] are emphasised in the text colour.
// The copy below is the source film's, kept as a working example: it is a placeholder. Replace every line with
// your own story and do not reuse its sentence patterns (principle 10; the mode card's Factory defaults).
import gallery from './data/gallery.js';

export default {
  // No duration and no bars: timing.rules.js and lib/timing.js fit() size every scene from its copy and
  // choreography (`npm run fit` prints the table). Optional: bpm (104–120), target (seconds).
  palette: 'navy-amber',
  seed: 1,
  meta: { title: 'What agent-made videos were made with', url: '' },
  source: 'Data · AI-video gallery, {n} videos · labels: ours · tools: authors’ words',
  // legend: by default '1 square = 1 {unit}' ('1 dot = …', '1 symbol = …' with another mark)
  // mark: 'square',   // the mark variant: 'square' | 'dot' | 'glyph:doc' | 'glyph:box' | 'glyph:chip' (mode card, Variants)
  // edges: 'cut',     // start and end on the picture, without the fade from and to the edge colour (a demo cut into an edit)
  data: gallery,
  scenes: [
    {
      type: 'count', name: 'The gallery',
      value: '{n}',
      caption: 'videos made with an AI coding agent',
      note: 'Added to the gallery {first} … {last}',
    },
    {
      type: 'columns', name: 'What for',
      title: 'What were they for? *Product launches* lead.',
      sub: '{kinds} purpose labels · top 7 shown',
      top: 7, restLabel: '{rest} other kinds',
      accent: 'c:product-launch',
      callout: '← {pct:c:product-launch}% of all {n}',
    },
    {
      type: 'split', name: 'Who said how',
      enter: 'flip', // T2: the frame turns over in unit tiles into the new protagonist
      title: 'About half *named their tools*.',
      sub: 'Named in post, reply or repo',
      by: 'f:stated',
      caption: 'of {n} named their tools ({pct:f:stated}%)',
      other: 'said nothing about how',
      labelIn: 'Named their tools · {f:stated}',
      labelOut: 'Said nothing · {!f:stated}',
    },
    {
      type: 'axis', name: 'What drew the picture',
      climax: true, // T3: its reveal is the film's climax
      title: 'Only *{f:videomodel} of {f:stated}* named an AI video model.',
      sub: '{f:stated} videos · one can name several',
      within: 'f:stated',
      series: [
        { name: 'Remotion', sel: 'f:remotion' },
        { name: 'Three.js', sel: 'f:three' },
        { name: 'Canvas · SVG · WebGL', sel: 'f:browser' },
        { name: 'HyperFrames', sel: 'f:hyperframes' },
        { name: 'Blender', sel: 'f:blender' },
        { name: 'AI video model', sel: 'f:videomodel' },
      ],
      accent: 'f:videomodel',
      callout: '← {f:videomodel} of {f:stated}',
      foot: 'Music: code [{f:codemusic}] · model [{f:genmusic}]',
    },
    {
      type: 'close', name: 'In three numbers',
      enter: 'dither', // T2: an ordered-dither front sweeps the frame into the close
      numbers: [
        { value: '{n}', label: 'agent-made videos' },
        { value: '{f:stated}', label: 'said how they were made' },
        { value: '{f:videomodel}', label: 'named an AI video model', accent: true, sel: 'f:videomodel' },
      ],
      line: '[{f:three|remotion|browser|hyperframes}] named a code renderer.',
    },
  ],
};

# Teaching and picture rules

What makes these films work: the viewer actually understands, then it looks good. Read this when writing the topic card, the script and the brief, and when checking a film. Rules carry the date they were set; the theory behind them is cited as author and year.

## Priorities

1. **Understood.** A viewer from the audience can explain the mechanism afterwards. The audience is developers who know the basics but not this mechanism (2026-10-24, 2026-11-02), unless the style kit names another. Everything else serves this.
2. **Good.** Design, taste, one consistent style — after it is understood.

**Accurate** is a floor, not a priority: simplify and omit freely, never say something false. Every analogy and illustration says where it stops being true.

Form: when the subject is a change, a process or a cause, animate it and then hold still; what does not change stays static. Animated explanation ≥ static step pictures > text alone; decorative motion never (Höffler & Leutner 2007; Tversky et al. 2002).

## What counts as understood

Before any picture, write 1–3 learning goals as "after watching, the viewer can explain / predict / compare …" (for example "explain why a long conversation gets slower"), each with one new question the film does not answer. Understanding means transfer: the viewer answers a new question with the mechanism, not by repeating the film (Mayer 2002). Never measure it by how understood viewers feel: a fluent explanation raises confidence more than understanding (Rozenblit & Keil 2002). An agent answering the transfer questions from the rough cut is a diagnosis only; it does not replace a real viewer from the audience, and a delivery says "not yet watched by the audience" until one has.

## Telling

- **Start from what the viewer already has**, and build one step at a time to the new idea.
- **Concrete first, then deliberately abstract.** A case you can see, then strip details, then the term or formula; return to the case once at the hard part (Fyfe et al. 2014).
- **Show the operation, then give the name.** The viewer sees what it does and why it is needed; the term comes last (Mayer et al. 2002).
- **Question before answer.** Every passage answers a question the viewer has right now; cut passages that answer none. Pause before an important animation so the viewer can guess (Loewenstein 1994).
- **One new thing at a time.** Each step adds one element and leaves the old ones still; about four new elements on screen at most (Cowan 2001).
- **Name the misconception.** State the viewer's most likely wrong idea, break it with a phenomenon, give the new explanation, then use it on one more phenomenon (Posner et al. 1982; Muller et al. 2008).
- **Analogies map structure** — relations and causes, not looks — and say where they break (Gentner 1983).
- **One structure worth considering for a system of parts** (2026-10-24): open on the whole as one overview, enlarge one part of it into the next passage, and return to the overview to sum up. Whether a film uses it is the maker's judgement, not a default (2026-11-02).
- **An opening hook must land on the question** (2026-10-21): a striking claim, a show of difficulty, or a sourced authority may open the film if it serves the topic and, by its end, the viewer knows the one question the film answers.

## Picture

- **The picture carries the cause.** One object persists and the result of each change becomes the next step's input; with the sound off the viewer still sees what happened. Recolouring a cell while the narration says "it reads the two before it" does not show what was read.
- **Voice and picture point at the same place at the same time**; labels sit next to their objects (Mayer 2017).
- **Move only what changes, then hold.** Animate the change to be learned, slowly and schematically, cause before effect; hold after each key change so the narration can say what it means.
- **Draw information flow and walk it** (2026-10-21): wherever data, requests or messages move, draw the path, send something along it, and show what changes at the destination. A line without a journey is not a flow.
- **Act out every state change** (2026-10-25): compression, truncation, backfill, deletion, merging — show before → during → after. Fading one block out and another in only swaps results; gathering a row of blocks into a summary shows compression.
- **Diagrams**: lay the overview out large, layers aligned and equal in width, no wide empty margins; lines clean (a hand-drawn feel is fine, jitter is not); circles and ellipses smooth. Text is set in the kit's text face, never a handwriting font.
- **Length follows the content** (2026-10-25): never cut content, speed up the voice or shorten holds to hit a length.
- **Hand traces over a clean diagram** (2026-10-21): the diagram is drawn in code, clean and exact; on top, only where they help: a handwritten note or circle pointing where to look now, a sketch that becomes the final structure, source cards (papers, official docs, real terminal output: an image of the original is only cropped and scaled; a text original may instead be set in type word for word, marked 原文摘录; every card records the source and date), icons that move only when mentioned. At most one hand trace moving at a time.
- **Hand marks only where they must be** (2026-10-28): in a film of about three minutes, at most three or four vermilion hand strokes (circles, underlines, braces, handwriting), each on the one thing the viewer must see; every other emphasis by greying, fading, enlarging or dimming the surroundings, and counts as written numbers. Constant strokes stop being emphasis.
- **Transitions come from objects**: an object from the previous passage morphs or moves into the next; no plain cuts, no wiping to blank paper, no cross-fades.
- **Cut whatever does not help understanding**: decoration, background motion, extra text.

## Captions and layout

- On screen only keywords and labels next to their objects; full subtitles are closed captions, not burned in (Yue et al. 2013).
- The band y ≥ 880 of the 1920×1080 frame stays empty for two lines of subtitles (2026-10-21), whether they end up burned in or not.

## On-screen language

The narration is Chinese: the voice, the transcription and the timeline are set for it, and an English voice-over is not part of this skill. On-screen text is Chinese or English, chosen from the material: Chinese material gives Chinese text, English material (an English codebase's names, an English paper) English text; when the material's language is unclear or mixed, ask; with no material to go by, Chinese, the narration's language. Code, commands, file names, numbers and captures stay as they are in either language. The rules (the same as the launch pipeline's; written here because a reader of this file should not have to cross over):

| Rule | English | Chinese |
|---|---|---|
| Reading a text that must be read | 0.3 s a word; a word is a space-separated token with a letter or digit in it | 6 characters a second; a Latin word inside Chinese 0.3 s; punctuation and symbols do not count; plus 0.5 s for each text, once |
| Information text | ≥ 25 px | ≥ 28 px |
| Main text | ≥ 40 px | ≥ 40 px |
| Line breaking | at spaces | between characters, never inside a Latin word or a number with its unit; no `。，、；：？！）」』` at a line's start, no `（「『` at its end |
| Setting | the kit's tracking and case | by word groups as written: no capitals, no negative tracking, no italic |
| Faces | the recipe's English faces | the kit's Chinese face, cut to the characters the film uses at setup, never committed; a character outside the subset is an error |

A film whose on-screen text is English keeps every other rule here; the recipes give each kit's English faces ([terminal-ledger](recipes/terminal-ledger.md#languages), [blueprint-zoom](recipes/blueprint-zoom.md#languages)).

## Presenter, characters, people

- The narration speaks to the viewer ("你", "我们") like a person across the table.
- A presenter window (the user's recorded video, cut out) is optional and reserved from the start (the kit keeps x 1580–1880, y 560–860 free). It is company, not the explanation: during key demonstrations it shrinks or steps aside and never covers what is being shown. A pointer or a hand drawing a line helps more than a face.
- A recurring character, if the user has one, appears only at key moments: asking the question, voicing the misconception, the one line to remember.
- No real people on screen except the presenter window and sourced footage that supports a claim (with its source).

## Tools

- Code for exact, stepwise mechanisms (data moving, a matrix multiplying). Generated images or video for metaphors, characters and real-world analogies; check every technical detail, label and structure in generated pictures, they get them wrong.
- Use what exists before building: the HyperFrames registry, Manim, Rough.js, Three.js. Engines can be mixed; a rendered clip is the interface.
- Derivations (formulas, growth, trade-offs) can be animated in Manim and laid over the film as transparent clips; label them "推导（示意）" with their assumptions; measured numbers come from source cards, never from the derivation.
- Every number on screen is computed from its official source or marked 示意; source cards record where and when they were captured.

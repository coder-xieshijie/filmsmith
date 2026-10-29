# From topic to finished film

The whole route, with the three moments the user reviews. SKILL.md's Route (steps 1–10) is how one version of a film is made; the rough cut and the fine cut below each run its steps 3–9, and the direction samples run them once per look. Who does each step and how agents are dispatched is in [roles.md](roles.md); the rules for content and picture are in [teaching.md](teaching.md).

## Three gates

The user reviews a film three times, each time on one page (a video plus at most three decisions). Between gates, agents carry on without waiting. A gate the user sends back is reworked at most twice; still not accepted after two rounds, go back to the previous gate and decide again.

| Gate | The user sees | The user decides |
|---|---|---|
| 1 Direction | the same passage made 3 ways, about 45 s each, at final quality with sound | which look (or which parts to combine) → the look board |
| 2 Rough cut | the whole film: the gate-1 passage finished, the rest grey boxes with the key motions, temporary voice | does it make sense, is the pace right, what to cut |
| 3 Final | the polished film (temporary voice) | can it ship; afterwards the user may record the narration and the picture follows it without another gate |

When the user cannot be asked (an unattended run), do not stop at a gate: take your recommended option, write down what you chose and why in the delivery note, and continue.

The style kit shortens the route: a look that already has a kit (see `assets/kits/`) skips gate 1 unless the user asks for a new look, and a short film the user asked for directly can skip gate 2.

The look a film follows is the look board written at gate 1; when gate 1 is skipped it is the kit's `CARD.md` and `ref/look.jpg`, and there is no look board.

## Hard floor and rule conflicts

- **Always**, in every version and every stage: facts accurate and sourced; the learning goals; y ≥ 880 empty; the presenter reserve empty outside presenter windows; no real people except the presenter window and sourced footage; at most four hand marks per film.
- The teaching rules bind the main version at gate 1; the other two versions treat them as reference. Once the user picks a look, the film's look board wins where it conflicts with them.

## Stages

### Topic card and fact sheet

Before anything else, decide the delivery form (video, an article with silent loops, or both) and write it down. Then one page, `topic.md` in the film folder (SKILL.md, "Route"), the only source of the film's facts:

- **Topic card:** one principle (not a survey), a title that states a paradox, 1–3 learning goals each with a transfer question, the misconception viewers most likely hold, the audience.
- **Fact sheet:** a table with one row per fact, `F1`, `F2`, …: the claim as the film will use it, the original passage verbatim, and where it is (document, version or commit, page or line). Only public sources (papers, official docs, open source at a fixed commit), every fact checked against the original.
- **Numbers on screen:** each number that will appear, with its fact ID, checked once more against the original.
- **Wording notes:** how claims may be put on screen and in the narration: each simplification and where it stops being true, required qualifiers (几乎, 示意), names that must not appear. Makers and the checker read this with the fact sheet.

Done when you can say in one sentence what the viewer can explain afterwards. The user's nod in conversation is enough; no review page.

### Direction samples (gate 1)

Pick the passage that best separates good from great — usually the moment a concept visibly changes shape, the frame viewers would screenshot — about 45 s. Make it three ways from the same narration and timeline, changing only the thing being compared (style, technique, or a tool mixed in):

| Version | Made how |
|---|---|
| A current | the kit or the current rules |
| B fewer rules | only the topic card and reference moments; the maker decides the rest |
| C another means | another material or tool mixed in: Manim derivation, 3D, generated imagery, real footage |

Each version goes through make → render and review packet → check → rework ([roles.md](roles.md), "Choosing a direction"), with temporary music and sound. Each holds only the hard floor. Show the three side by side.

Done when the user picks; then write a **look board** (`look-board.md` in the film folder): palette, type, materials and light, camera language, motion density, music direction, each pointing at a frame of the chosen version. Everything after follows it. If the chosen look has no kit yet, extract one ([assets/kits/README.md](../assets/kits/README.md)).

### Rough cut (gate 2)

- Script: the narration (`narration.json`) and, in the brief's "Per segment", for each passage the viewer's question at that moment, the picture's action and what the viewer understands after.
- Shared assets: `narration.json` → `scripts/voice/voice.py all` ([scripts/voice/README.md](../scripts/voice/README.md)). Everything in the project is timed by line IDs and anchor words, never by hard-coded seconds, so a recording later re-times the picture automatically.
- Build the whole film as director + 2–3 segments ([roles.md](roles.md), "Making a film"): the gate-1 passage finished, the rest grey boxes with the key motions, temporary voice and music.
- Keep the presenter reserve free from the start if the user may add a presenter window.
- Diagnose with the transfer and misconception questions: an agent that did not make the film answers them from the rough cut alone.

Done when, with the sound off, the causes are visible, and the length and order of passages are settled.

### Fine cut (production)

- Before dispatching, the director makes the shared parts from the film's look and the gate-1 passage (overview diagram, characters, number styles, handoff frames, accent colours) and writes their contract (frames, seams, no-go zones). While the contract holds, shared parts and segments change in parallel and are swapped in together for one re-render.
- The pipeline: director → segments in parallel → assembly → render → review packet → independent check → rework by the original makers ([roles.md](roles.md)). Rework starts as soon as a check report arrives; it waits for neither the user nor the other segments.
- Music: a real track (a library or a music model) replaces the code-synthesised pad; let the user hear a passage first.
- Gates in code: spec, caption zone, loudness, true peak, sound-cue count and decoding are asserted by `npm run finish`; picture geometry by `npm run check` before a maker hands back; facts and teaching by the independent checker. What passes does not go to the user.

### Final (gate 3) and the user's recording

One review page with the film and at most three decisions. After approval, if the user records:

1. The user records the narration line by line (video and voice together if there is a presenter window), keeping the line IDs.
2. Recordings go into the shared assets' `vo/`; rerun `voice.py all` (recordings are never overwritten), then `npm run anchors` in the project; the picture follows the new timing.
3. Presenter window: cut out the background (`npm run hf -- remove-background`), place a round window in the reserve, fully visible only at key moments, smaller or out of the way during demonstrations.
4. Mix: compress, equalise and limit the voice; the film at about −14 LUFS, true peak ≤ −1.5 dBTP; after re-rendering run `npm run check` and `npm run finish` again.

### Retrospective

Write down what this film made clearer or more striking than the last, what is still missing against the reference moments, and which approach won at gate 1 and why. Components used by two films go into the kit. A rule is added only after the same problem appears twice or the user states it.

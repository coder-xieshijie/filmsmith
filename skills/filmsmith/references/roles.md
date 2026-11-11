# Roles and dispatch

How one film is split across agents, what each receives and returns, and why. Any agent that can start other agents (subagents, background sessions, separate CLI runs) can follow it; where your harness has no way to start agents, play the roles yourself in order, but still give the check to a fresh context.

## The rules and why

- **At most 3 agents at the same time**, the renderer included. More parallel agents hit request-rate limits and their retries redo finished work; three keeps progress visible and total tokens low. Wall-clock time may be a little longer; that is the accepted trade.
- **2–3 large segments, about one minute of picture each, never a dozen small ones.** Every segment costs the director a contract entry and a note; with ten segments the director spent about 9 of 24 minutes writing them.
- **Rework goes back to the agent that made the part.** It still holds the context; a new agent has to read everything again and loses what was decided along the way. If the original agent cannot be continued, give a new agent the check report, the brief's relevant sections and only the files to change.
- **The check is always a fresh agent** that did not take part in making: a maker checking its own work approves it. The checker only reports; makers change the film.
- **At most two rework rounds** per gate. What is still open after the second goes onto the review page as a known issue; do not fake a pass.
- **Context hygiene.** Most of the time goes into models re-reading long contexts. Each agent does one segment or one job and stays under about 150k tokens of context; reads only the files its brief lists; reads scripts and components by their usage headers, never their source; looks only at contact sheets and the review packet, never batches of full-resolution frames, and never the same image twice; leaves waiting (renders, long checks) to the renderer.

Measured on a three-minute sample (2026-10-29): this split took 67 minutes and about 45% of the tokens of the earlier flow, in which one maker built the film scene after scene and fresh agents redid every rework from scratch (137 minutes); the result was accepted as the default way.

## Making a film (look decided, kit exists)

Before dispatching, the dispatcher has: the delivery form; the topic card and fact sheet; the shared assets (`narration.json` → `voice.py all`); the brief ([brief-template.md](brief-template.md)); the kit.

| Step | Who | Does | Hands back |
|---|---|---|---|
| 1 | **Director** (one agent, strongest model) | Reads the brief, the fact sheet's relevant part, the kit's CARD.md and `ref/look.jpg`. `node <skill>/scripts/new-film-teach.mjs <dir>`, `npm run init -- --shared <dir> --segments "<id>:<first>-<last>,…" --title "<film title>"`. Fills `handoff.json` (each segment's `goal`, `hands`, first and last `state` / `chapter` / `counter` / `items`, containers listed before what sits inside them; small objects no segment animates under `persist`), picks anchor words in `anchors.txt`, marks with `!` each state change the narration names, and runs `npm run anchors`; missing components go into the kit, then `npm run kit-sync`. Runs only `npm run check -- --no-hf` (a few seconds on stand-ins). Target ≤ 10 minutes | each segment's id, span and a note: "follow the brief's "Per segment" entry for <id>" plus at most 10 lines of segment specifics, never a copy of the brief |
| 2 | **Segment makers** (2–3 agents in parallel, strongest model) | Only their own `segments/<id>.js`; `npm run check -- --seg <id>` and `npm run shots -- --seg <id>` pass | what changed, the check summary line, exemptions with reasons, mismatches with the contract, suggestions for the director, files read |
| 3 | **Assembly** (the director, continued) | Takes the suggestions, fixes seams, runs the full `npm run check` (about 40 s for a three-minute film: page checks a few seconds, the engine's check in 30 s jobs, three at a time) | the check summary line |
| 4 | **Renderer** (a cheaper model with a small context is enough) | `npm run render`, `npm run finish`, then `node <skill>/scripts/review-packet.mjs <project>` | the finish lines (all PASS) and the packet path; on failure the error as printed, without touching the source |
| 5 | **Checker** (a fresh agent, strongest model) | Gets only the review packet (≤ 20 images and its `index.md`), the fact sheet, the brief's "for the checker" items and [teaching.md](teaching.md) "Picture". Writes `check-report.md` in the project | issues, each "segment · time · element id or visible text · what is wrong · which requirement" |
| 6 | **Rework** (each segment's original maker; seams to the director) | Changes only the reported items; their segment's check passes | as in step 2 |
| 7 | Renderer → checker again | as 4 and 5 | at most two rounds, then open items go onto the review page |
| 8 | Dispatcher | A review page: the film, its contact sheet, at most three decisions, known issues, "not yet watched by the audience" | |

Dispatch rework as soon as a check report arrives; do not wait for the user. A change to the brief settled during the run (in a note to a maker or a rework order) goes into `brief.md` before the check, so the checker judges against what was decided.

## Choosing a direction (3 looks × 45 s)

| Step | Who | Does |
|---|---|---|
| 1 | 3 makers, one look each | The same narration and timeline; a look with a kit starts from it, one without borrows a kit's skeleton. Hand back once check passes |
| 2 | Renderer | Renders each version and makes a review packet for each |
| 3 | One checker | All three versions, at most 7 images each; only the hard floor (accurate, caption zone, requirements the user has set) |
| 4 | Each maker | One rework round |
| 5 | Dispatcher | One page with the three side by side and at most three decisions |

## What the checker checks

Scripts have already measured geometry (text on lines, overlaps, out of frame, caption zone), empty frames, hand-mark count and read holds; the checker does not count them again, and questions a script result only by naming the frame and element. The checker judges what scripts cannot:

1. Facts and sources: every number and claim on screen against the fact sheet; illustrative things labelled 示意.
2. Understood: each learning goal, in order — could a viewer from the audience explain it from these pictures?
3. Every state change the narration names is acted out before → during → after, in sync with the words.
4. Each rule of teaching.md "Picture" and each taste requirement in the brief, one by one.

A failure is anything that breaks a requirement above or the brief; everything else is an optional note, marked as such. For a closer look the checker cuts at most 4 full-resolution frames itself (the command is in the packet's `index.md`; the packet stays as it is). The state changes the director marked appear in the packet as before / during / after rows; a state change the narration names that has no row is checked on the contact sheets, or with those frames.

## Briefs to agents

Write each brief as the result wanted, why, the done criteria and the few real boundaries; name the files to read and what each is for; never "read everything first". Give makers the commands that prove done (`npm run check -- --seg <id>` with its last line pass). Authorise reversible work without asking; only decisions the user alone can make come back. Every boundary in a brief has its reason; a segment maker's are: write only your segment file (others are working in the same project), and never commit or put media into version control.

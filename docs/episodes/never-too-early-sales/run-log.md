# Run log

## brief-grill · 2026-10-13T23:00:23Z

### Inputs

- `.scratch/never-too-early-sales/handoff.md`: Han's Brief from a voice session, saved verbatim.
- `.scratch/never-too-early-sales/source-deck.pdf`: the source deck (filed in Downloads as "Agentic Workflow Basic Workshop (1).pdf").
- `.scratch/never-too-early-sales/grill-answers.md`: Han's answers in three grill rounds.
- `docs/design/design-guide.md`: the named styles.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed in a3a4cb7 with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: the `Board` named style Han approved, committed in 17f3455.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 3.

### Metrics

- implementor · attempt 1 · pass · 367 s
- reviewer · attempt 1 · fail · rubric "The text under every heading is Han's wording: `.scratch/<slug>/handoff.md` when it exists, his answers in this session, or a shape-only fix the run-log entry names." · 105 s · 67514 tokens
- implementor · attempt 2 · pass · 180 s
- reviewer · attempt 2 · fail · rubric "The text under every heading is Han's wording: `.scratch/<slug>/handoff.md` when it exists, his answers in this session, or a shape-only fix the run-log entry names." · 73 s · 59528 tokens
- implementor · attempt 3 · pass · 170 s
- reviewer · attempt 3 · pass · 35 s · 46963 tokens

### Notes

Han settled the open headings in the grill: Format at 20-30 minutes, a new Board style (added to the design guide), no Threads, Slide 4 (after-sale) folded into Slide 3, our own drawn visuals instead of the third-party screenshots and funnel, and Slide 2 recast as a second reason to start now.

Attempt 1 failed on four lines. Section "Why building an effective sales pipeline takes time" served more than one step. Research questions 2 and 3 were bundled and missed the "repeatable process" claim. And the implementor had written its own words into Style, Format, Slide 3 and an Open idea. Han answered each failed line, moving Slides 7–8 into "How to start doing sales", giving "Start when?" its own Section, splitting the questions into seven, and backing Actionable 3 on Slide 3. The implementor's words went back to Han's.

Attempt 2 failed only on research questions 5 and 6, where "selling early" stood in for Han's "it". Han corrected question 5: the trust comes from engaging in sales and early results such as an LOI or a filled pipeline.

Shape-only fixes: dropped the `<!-- save as -->` line and the trailing source-deck path; rewrote `generated` to `claude-code/opus-5.5`; renumbered the Slides and research questions and their `_Research:_` numbers; capitalised "Live coaching slot" when the Format sentence was split; dropped the "(Open: …)" notes on the old Slides 4, 8 and 9 once Han's answers resolved them.

Needs human: the three Open ideas lines for unchosen candidates (Editorial style, A/B Threads, a separate after-sale Slide) are the implementor's wording, which Han kept "as written".

## categorize-research · 2026-10-13T23:05:50Z

### Inputs

- `brief.md#research-questions`, questions 1–7.
- `GLOSSARY.md`, `## Research categories`.
- `docs/llm-wiki/index.md`: does not exist; no research folders exist in `docs/episodes/*/research/` or `docs/llm-wiki/research/`.

### Output

- Folder names, in question order: `FIN-0001__revenue-lags-costs-in-startups`, `GTM-0001__b2b-sales-cycle-length`, `GTM-0002__b2b-pipeline-conversion-rates`, `GTM-0003__early-selling-market-insight`, `GTM-0004__early-sales-results-build-trust`, `GTM-0005__early-selling-repeatable-process`, `GTM-0006__sales-pipeline-ramp-up-time`.
- `GLOSSARY.md`: new categories `FIN` and `GTM`, committed in 19afb33.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 52 s · 47332 tokens

### Notes

`FIN` holds question 1, because cashflow timing is not a sales question. `GTM` holds questions 2–7, because `SALES` is defined from the buyer's side of coaching and consulting, and these questions are about a startup selling its own product.

## customize-pipeline · 2026-10-13T23:07:30Z

### Inputs

- `.agents/skills/new-episode/assets/pipeline.yml`, the template at 26f560f.
- `brief.md`.
- `.scratch/never-too-early-sales/research-folders.md`, the categorize-research folder names.

### Output

- `pipeline.yml`, `status: draft`, `template: 26f560f`, committed in 6bca37e with `Gate: draft pipeline` for Han to approve.

### Checks

- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 90 s

### Notes

Changes from the template:

- `template: 26f560f` names `main`, not `feat/89-new-episode`. The Episode branch was cut from `main`, whose template (last changed in 00c4199) is newer than feat/89's (7ac7829, an ancestor).
- `retrieval` removed: `docs/llm-wiki/index.md` does not exist, so every question is new. The research jobs and `write-dossier` need `customize-pipeline` instead.
- `write-research` expanded into seven jobs, one per question in the Brief's order, each with an `intent` that quotes its question and an output named by its categorize-research folder. `run-log.md` dropped from their references, since it holds no retrieval outcome.
- `write-research-b2b-sales-cycle-length` and `write-research-b2b-pipeline-conversion-rates` also read `source-deck.pdf`, whose funnel example (27:1 over 9.5 months) Slide 8 rests on.
- `write-dossier` wants all seven research jobs by name and reads each research file and `source-deck.pdf`.
- `write-design-spec`'s implementor reads `source-deck.pdf`, where the Board style's cashflow board comes from.
- References to missing files removed: `docs/llm-wiki/index.md` (categorize-research) and `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` (write-dossier and write-voice-script, both agents).

## write-research-revenue-lags-costs-in-startups · 2026-10-13T23:19:40Z

### Inputs

- `brief.md#research-questions`, question 1.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/FIN-0001__revenue-lags-costs-in-startups/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 1.

### Metrics

- implementor · attempt 1 · pass · 51 s · 50175 tokens
- reviewer · attempt 1 · pass · 60 s · 48272 tokens

### Notes

Passed on attempt 1. The orchestrator then replaced a placeholder `generated.at` (`2026-10-14T00:00:00Z`, in the future) with the real finish time in a separate commit.

Research gap: no source measures startup cash cycles; the single lag is assembled from separate delays and flagged as inference. The Late Payment Directive covers the EU only.

Needs human: Finding 3 shows investor money arriving late, and Finding 4 carries that over to customer money by analogy. Is that strong enough for the "revenue lags" claim?

## write-research-early-selling-market-insight · 2026-10-13T23:20:20Z

### Inputs

- `brief.md#research-questions`, question 4.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0003__early-selling-market-insight/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 75 s · 53462 tokens
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 81 s · 48684 tokens
- implementor · attempt 2 · pass · 12 s · 40684 tokens
- reviewer · attempt 2 · pass · 9 s · 38767 tokens

### Notes

Attempt 1 failed on the Answer: early feedback "is lost once founders delegate or wait" had no Finding behind it. The retry removed the claim.

Research gap: every source is about talking to users, none isolates selling; the step to "a sales conversation yields the same facts" is flagged as inference.

Needs human: Migicovsky argues an interview "is not the time to be pitching the product"; is user-interview evidence enough for a claim about selling?

## write-research-early-selling-repeatable-process · 2026-10-13T23:22:00Z

### Inputs

- `brief.md#research-questions`, question 6.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0005__early-selling-repeatable-process/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 92 s · 56368 tokens
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 73 s · 52260 tokens
- implementor · attempt 2 · pass · 16 s · 43206 tokens
- reviewer · attempt 2 · pass · 24 s · 40514 tokens

### Notes

Attempt 1 failed on the Answer's last sentence ("Starting early gives the most iterations…"), unsupported and unflagged. The retry added Finding 10 (Blank: most startups change their model at least once) and flagged the step to "more iterations before cash runs out" as inference.

Research gap: practitioner sources only; no primary source for when to make a first sales hire.

Needs human: a third-party comment under Blank's post says "Less runway equals less time to find a repeatable and scalable business model"; worth a better source for the runway link?

## write-research-early-sales-results-build-trust · 2026-10-13T23:22:20Z

### Inputs

- `brief.md#research-questions`, question 5.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0004__early-sales-results-build-trust/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 132 s · 63893 tokens
- reviewer · attempt 1 · fail · rubric "Fail if it holds more than one question, or differs from the Brief that asked it when that Brief is at hand." · 107 s · 57244 tokens
- implementor · attempt 2 · pass · 24 s · 44903 tokens
- reviewer · attempt 2 · pass · 27 s · 43056 tokens

### Notes

Attempt 1 failed four lines: a reworded `question`, a future placeholder `generated.at`, a catalogue page for Spence instead of the work, and two Findings (5, 7) that were the writer's inferences. The retry fixed all four.

After the pass the orchestrator renumbered the Findings list (it read 1, 2, 3, 4, 6, 5, 6 after the retry deleted two items); a shape-only fix, no words changed.

Research gap: no source studies LOIs, pipelines or customer-side trust directly; the link from signaling theory to early sales is flagged as inference. Spence, Connelly and Stuart were read from abstracts.

Needs human: the last Gompers Finding ends with a mild conclusion ("Customer contact is therefore part of how investors both judge and build a company") the survey does not state.

## write-research-b2b-sales-cycle-length · 2026-10-13T23:22:30Z

### Inputs

- `brief.md#research-questions`, question 2.
- `source-deck.pdf`, the worked example 2 weeks / 6 months / 3 months.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0001__b2b-sales-cycle-length/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 172 s · 84633 tokens
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 92 s · 55293 tokens
- implementor · attempt 2 · pass · 21 s · 40561 tokens
- reviewer · attempt 2 · pass · 10 s · 39723 tokens

### Notes

Attempt 1 failed on the Answer: it said decision time "rises with" group size and purchase type, but Finding 1 (Dholakia, read as abstract only) gives no direction. The retry states no direction.

Research gap: no primary source for a typical cycle length in months, or for the lead/opportunity/deal split; the deck's 9.5-month example is marked as an illustration, not a benchmark.

Needs human: the description says "cycle length" where Finding 1 measures decision time, and "(without giving a direction here)" in the Answer reads like a note to a reviewer.

## write-research-b2b-pipeline-conversion-rates · 2026-10-13T23:22:40Z

### Inputs

- `brief.md#research-questions`, question 3.
- `source-deck.pdf`, the worked example 3:1, 9:1, 27:1.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0002__b2b-pipeline-conversion-rates/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 140 s · 117734 tokens
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 123 s · 61637 tokens
- implementor · attempt 2 · pass · 21 s · 45619 tokens
- reviewer · attempt 2 · pass · 13 s · 40371 tokens

### Notes

Attempt 1 failed twice: the Answer claimed entrants fail on fit, need or budget with no Finding behind it, and Finding 1 misread the HBR 40–60% "no decision" figure as separate from the status quo while Finding 7 added an unsourced sentence. The retry cut and corrected them and flagged the stage-filter framing as inference.

Research gap: both Gartner pages returned 403, so their figures come from search excerpts; no primary benchmark for lead-to-opportunity conversion. 3:1 x 9:1 = 27:1 is arithmetic, but no source confirms the ratios.

Needs human: check the Gartner figures (Findings 3 and 4) against the live pages before they go on screen.

## write-research-sales-pipeline-ramp-up-time · 2026-10-13T23:24:30Z

### Inputs

- `brief.md#research-questions`, question 7.
- `.agents/skills/new-episode/references/write-research.md`.
- No retrieval: `docs/llm-wiki/index.md` does not exist, so the question is new.

### Output

- `research/GTM-0006__sales-pipeline-ramp-up-time/research.md`, `status` not applicable, merged into `episode/never-too-early-sales` from its worktree branch.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 121 s · 70303 tokens
- reviewer · attempt 1 · fail · rubric "A research file answers one question on its own, so any later Episode can cite it without the one that asked. Fail if understanding it needs the Brief or Episode that prompted it." · 83 s · 53508 tokens
- implementor · attempt 2 · pass · 21 s · 42381 tokens
- reviewer · attempt 2 · pass · 17 s · 40470 tokens

### Notes

Attempt 1 failed twice: the Caveats named "three reasons the Answer names" (preparation, unknown market, unknown metrics) that only the Brief held, and `generated.at` was a future placeholder. The retry wrote the grouping into the Answer, flagged it as the file's own synthesis, and set the real time.

Research gap: no primary benchmark for how many months a ramp-up takes; Bridge Group, Gartner and Forrester figures appeared only in vendor blogs.

Needs human: the Answer says "takes months" without a Finding giving a number, and says sales cycle is measured only after a full cycle where Finding 9 supports that for conversion only.

## write-dossier · 2026-10-13T23:33:02Z

### Inputs

- `brief.md`: the Slides spine, Constraints, Style, Analogy and Open ideas.
- The seven research files under `research/`.
- `source-deck.pdf`.
- `docs/design/slide-library.md` and the Master slide and frame folders.
- Skipped: `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` do not exist yet.

### Output

- `dossier.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed on `episode/never-too-early-sales`.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 135 s · 85475 tokens
- reviewer · attempt 1 · fail · rubric "a page slide's material would leave an implementer guessing" · 125 s · 108230 tokens
- implementor · attempt 2 · pass · 24 s · 47752 tokens
- reviewer · attempt 2 · pass · 23 s · 50008 tokens

### Notes

Attempt 1 failed five lines: the `pipeline-by-the-numbers` Visual lacked its per-stage durations, the `how-marketing-feeds-the-pipeline` funnel poured into an unnamed stage, a `sales-is-more-than-selling` Speaker note cited Spence for a letter-of-intent claim the research only infers, a `why-it-takes-time-to-ramp-up` note repeated its Voice script, and one beat only described the picture. The retry fixed all five.

No library match: why-watching-cashflow-is-mission-critical--watch-your-cashflow — a sticky-note cashflow board, months January to April by cash, cost and revenue rows, notes appearing month by month, cash falling to $0 and a "Bankrupt" stamp.

No library match: how-to-start-doing-sales--stages-of-sale — three boxes in a left-to-right flow (leads, opportunities, closing) with a trailing delivery arrow.

No library match: how-to-start-doing-sales--pipeline-tools-in-practice — our own illustrated deal board (New, Meeting, Proposal, Won) with a card moving between stages.

No library match: how-to-start-doing-sales--how-marketing-feeds-the-pipeline — a drawn funnel pouring into the deal board's "New" column.

No library match: how-to-start-doing-sales--watch-your-cashflow-revenue-pulled-in — the same board with the April revenue note dragged back to February.

No library match: why-building-an-effective-sales-pipeline-takes-time--pipeline-by-the-numbers — a horizontal funnel with a ratio and a duration per stage.

No library match: start-before-you-need-the-money--watch-your-cashflow-start-when — the board with an arrow back to Q1 and the four actionables beside it.

Needs human: the 27:1 and 9.5-month worked example has no source; Slide `pipeline-by-the-numbers` captions it "Illustration, not a benchmark" and contrasts it with one vendor dataset (Ebsta: 19 percent win rate, 91-day cycle).

Needs human: Actionable 4 (track deals, measure conversion and cycle) has no Slide of its own; it is a beat on `what-is-a-sales-pipeline` and `pipeline-tools-in-practice`.

Needs human: about 40 Voice script beats for a 20-30 minute slot; check the fit once the Voice script is written.

Needs human: `sales-is-more-than-selling` note 4 rests on Spence, read from its abstract and a review only.

Needs human: Slide `sales-is-more-than-selling` says "before a euro of revenue" while the cashflow board counts in dollars.

## write-voice-script · 2026-10-13T23:46:35Z

### Inputs

- `dossier.md` at the write-dossier commit 5900471.
- `brief.md`: Hook, Red thread, Analogy, Audience, Format and Constraints.
- Skipped: `docs/profile/han/storytelling-guide.md` and `tone-guide.md` do not exist yet.

### Output

- `dossier.md`, `status: draft`, Voice script written (43 items, about 2,900 words, about 20 minutes), committed with `Gate: draft dossier`.
- Han's approval: a `human:han` verified entry appended at his word ("i approve all subsequent gates, run until episode is implemented"), committed with `Gate: approved dossier`. No edit of his own, so the gate diff is empty.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass; only Voice script lines and `generated` changed against 5900471.
- Reviewer: pass on attempt 3.

### Metrics

- implementor · attempt 1 · pass · 106 s · 69700 tokens
- reviewer · attempt 1 · fail · rubric "Fail if any material contradicts the Voice script it sits beside." · 226 s · 72514 tokens
- implementor · attempt 2 · pass · 87 s · 62560 tokens
- reviewer · attempt 2 · fail · rubric "Fail if any material contradicts the Voice script it sits beside." · 112 s · 60548 tokens
- implementor · attempt 3 · pass · 52 s · 58913 tokens
- reviewer · attempt 3 · pass · 97 s · 64776 tokens

### Notes

Attempt 1 padded the beats to reach 20 minutes and failed seven lines: an example ratio spoken as normal against its "Illustration, not a benchmark" caption, bolted-on sentences, lines that needed the Slide, five repeats of Speaker notes, a video-only phrase, competing images beside the cashflow board, and three claims beyond the research. It also invented first-person coaching experience.

Attempt 2 fixed most of them but moved the example problem to the 9:1 ratio and kept some bolted-on sentences, note repeats and images. Attempt 3 cut rather than added and passed.

Needs human: the Voice script is not checked against Han's tone, since no tone or storytelling guide exists; this is the first draft he reads in his own voice.

Needs human: "Preparation" (why-it-takes-time-to-ramp-up) says to write the process down before the first call, while a note on sales-is-more-than-selling says the process is found by selling, not designed in advance.

Needs human: "Revenue earlier" says the company lives on into the summer, while its board shows January to April only.

Needs human: "Simple board" says one card is stuck in Meeting, while the Visual animates a card moving from Meeting to Proposal.

Needs human: "This week" ends on ten minutes on the board after telling the listener to pick any step.

## write-spec · 2026-10-13T23:51:30Z

### Inputs

- `dossier.md`, approved.
- `brief.md`.
- `.agents/skills/to-spec/SKILL.md` and `.agents/skills/to-tickets/SKILL.md`, read as files (the Skill tool refuses them).
- `.archgate/adrs/FE-004-slide-architecture.md` for the seams.
- `docs/features/episode-migration.md`.

### Output

- Spec issue https://github.com/hancrafted/content-library/issues/147, labelled `episode:never-too-early-sales`.
- Sub-issues, each `needs-triage`: https://github.com/hancrafted/content-library/issues/148 (Title slide, wiring, post-build step 8, and `why-watching-cashflow-is-mission-critical`; blocks the others), https://github.com/hancrafted/content-library/issues/149 (`why-sales-is-more-than-just-selling`), https://github.com/hancrafted/content-library/issues/150 (`how-to-start-doing-sales`), https://github.com/hancrafted/content-library/issues/151 (`why-building-an-effective-sales-pipeline-takes-time`), https://github.com/hancrafted/content-library/issues/152 (`start-before-you-need-the-money`).
- Edited #147 · 2026-10-13T23:49:04Z
- Edited #148 · 2026-10-13T23:49:06Z
- Edited #149 · 2026-10-13T23:49:07Z
- Edited #150 · 2026-10-13T23:49:09Z
- Edited #151 · 2026-10-13T23:49:10Z
- Edited #152 · 2026-10-13T23:49:12Z

### Checks

- Reviewer: pass on attempt 1.

### Metrics

- implementor · attempt 1 · pass · 149 s · 86052 tokens
- reviewer · attempt 1 · pass · 58 s · 70772 tokens

### Notes

Han was away, so the spec uses the FE-004 seams and says so.

Needs human: spec #147 carries `ready-for-agent` (as run 1's #99 did); an agent that picks up `ready-for-agent` issues could start on it before the designs are approved.

Needs human: the issue links to Dossier headings resolve only once `episode/never-too-early-sales` is pushed.

Needs human: sub-issue titles differ from the Dossier h2s (#148 "The cashflow board, first time"; #149 and #151 shortened); the bodies use the right anchors.

## write-design-spec · 2026-10-14T00:08:40Z

### Inputs

- `brief.md` (`## Style`: Board) and `docs/design/design-guide.md#board`.
- `dossier.md`, approved.
- `GLOSSARY.md`, `docs/design/slide-library.md`, `docs/design/design-system.md`.
- `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md`, `FE-011-design-tokens.md`.
- Run-1 tickets #100–#103 as Design answer examples.
- `source-deck.pdf`.

### Output

- `## Visual language` on spec https://github.com/hancrafted/content-library/issues/147 (board motif, note colours `info`/`warning`/`success`/`destructive`, `primary` for the one thing to look at, note-placing motion).
- A Design answer for every Slide in #148–#152, each body ending `Edited-by: write-design-spec`. The shared parts are `slide-shared/cashflow-board.tsx` (#148, reused by #150 and #152) and `slide-shared/deal-board/` (#150).
- Edited #147 · 2026-10-13T23:51:35Z
- Edited #152 · 2026-10-13T23:55:33Z
- Edited #149 · 2026-10-13T23:56:36Z
- Edited #150 · 2026-10-13T23:57:10Z
- Edited #148 · 2026-10-13T23:57:29Z
- Edited #151 · 2026-10-13T23:58:15Z
- Edited #152 · 2026-10-14T00:01:35Z
- Edited #148 · 2026-10-14T00:02:57Z
- Edited #150 · 2026-10-14T00:04:12Z
- Edited #151 · 2026-10-14T00:06:11Z
- Gate: #148–#152 relabelled `needs-triage` to `ready-for-agent` at 2026-10-14T00:08:13Z, at Han's standing approval ("i approve all subsequent gates, run until episode is implemented").
- `dossier.md`: four overruled masters rewritten to `basic-page` (the nearest frame component for a Scene), re-verified by machine and by Han's standing approval.

### Checks

- Reviewer: pass on attempt 2 for every ticket (#149 on attempt 1).

### Metrics

- implementor · attempt 1 · pass · 404 s · 577094 tokens
- reviewer · attempt 1 · fail · rubric "Colour, size and weight are tokens (FE-011); every import is one FE-007 §5 allows." · 210 s · 421737 tokens
- implementor · attempt 2 · pass · 309 s · 268751 tokens
- reviewer · attempt 2 · pass · 360 s · 229401 tokens
- #148 · approved as drafted
- #149 · approved as drafted
- #150 · approved as drafted
- #151 · approved as drafted
- #152 · approved as drafted

### Notes

The implementor ran in this session and spawned five designers (one per ticket, opus). The metrics sum their tokens; attempt 2 re-ran only the four failing tickets' designers.

Attempt 1 failed four tickets. #148 broke the visual language (a `foreground` month pill, and no `primary` mark on a moved note). #150 and #152 passed board props #148 does not define. #151's multi-column layouts were keyed on the viewport's `md` while the Foreground is only about 384px there. Attempt 2 fixed each: #151 now switches on the Foreground with container queries.

"Approved as drafted" means Han made no edit of his own: the relabel was done at his standing approval, not after he read the answers.

Needs human: copy the Dossier does not name is the designers' proposal on every ticket: captions, the board's short amounts (`$100k`, `+$1M`; German `100k $`, `+1 Mio. $`, "Pleite"), the deal board's invented company names, the steps column heading "Start this week", and the "Start early" stamp.

Needs human: #152 draws the last board in quarters (Q1–Q4, $50k amounts) as the source deck does, against the visual language's "same grid, note size and positions" for all three boards.

Needs human: #149's third column is "Trust" while its result note is "Increase trust"; the designer suggests "Results", as Voice script item 4 says.

Needs human: Speaker notes without a Dossier `target:` got one from the designers (#149 note 4 to `result`, #151's no-decision note to `funnel`).

Needs human: the first board (#148) has no `primary` mark; the destructive "Bankrupt" stamp is its focus.

## implement-episode · 2026-10-14T07:40:29Z

### Inputs

- Spec https://github.com/hancrafted/content-library/issues/147 and tickets #148–#152, all `ready-for-agent` with approved design answers.
- `dossier.md`, approved, with the overruled masters written back.
- `.agents/skills/new-episode/references/implement-episode.md`, `docs/features/episode-migration.md`, `docs/features/episode-translation-keys.md`.
- `/implement-spec` on #147, typed by Han.

### Output

- The Episode in `src/components/episodes/never-too-early-sales/`: Title slide, 5 section slides, 10 page Slides, English and German, `status: 'upcoming'` with no `publishedOn`, registered in `REGISTERED`.
- Shared parts `src/components/slide-shared/cashflow-board.tsx`, `deal-board/` and `board-note.tsx`.
- `src/lib/utils.ts`: `cn` keeps the five type roles as font sizes (`extendTailwindMerge`), with `utils.test.ts`.
- Outside the Episode: `src/lib/episode-overview.ts` (`FEATURED` as `as const satisfies`, so an upcoming Episode with a page type-checks) and `tests/post-build/episode-text.build.test.ts` (skips the published-anchors check for a `noindex` page).
- `tests/post-build/episode-text/never-too-early-sales.{en,de}.json` captured.
- Commits 4486ee4 (#148), 21e4486 (#152), 078b071 (#149), 0204221 (#150), 2c229d5 (#151), ad5025b and 0f67cd5 (review fixes), on `episode/never-too-early-sales`.

### Checks

- `verify`: pass.
- `build`: pass.
- `test:build`: pass, 542 passed, 2 skipped (the published-anchors check for this upcoming Episode, en and de).
- `visual-check`: pass. 20 runs × 15 Slides: 375, 1100, 1280 and 1440 px; drawer closed, beside and over (beside from 1280, an overlay below it); light and dark. Every Slide count 1, wrapper at least 800 px, mounted content, no horizontal scroll, nothing past the Foreground; at 1280 beside the Foreground is 336+464 and at 1440 beside 336+624, both clear of the drawer.
- Reviewer: pass on attempt 3.

### Metrics

- implementor · attempt 1 · pass · 4992 s · 841098 tokens
- reviewer · attempt 1 · fail · rubric "The visual check ran at 375, 1100 and 1440 px, drawer beside, over and closed, in both themes, and its numbers show no overflow, wrappers at least viewport height and Foreground clear of the chrome." · 184 s · 171431 tokens
- implementor · attempt 2 · pass · 505 s · 92401 tokens
- implementor · attempt 3 · pass · 488 s · 84086 tokens
- reviewer · attempt 3 · pass · 841 s · 55951 tokens

### Notes

Han typed `/implement-spec` on #147, because the skill sets `disable-model-invocation`. Ticket #148 ran first; #149–#152 ran in parallel worktrees and were merged one at a time, each regenerating the captured text. Attempt 1's metrics sum the five implementers.

Attempt 1 failed the code review on three Standards lines (`cn()` dropped `text-body`, `text-caption` and `text-subheading`; a `clsx` workaround pasted into three files; `BoardNote` copied into four Slide folders) and on Rubric 5: the orchestrator's first drawer matrix never opened the drawer, because zsh did not split the env string. Attempt 2 fixed the code lines once in `cn` and moved the note to `slide-shared`. Its `visual-check`, now with the drawer open, failed: the Bankrupt stamp ran 16 px past the Foreground at 1280 beside (larger once `cn` kept `text-subheading`), and the tilted notes on `sales-is-more-than-selling` ran 1 px past it. Attempt 3 capped the stamp's offset inside the board and inset the note column; no reviewer ran on attempt 2, as the check failure counted as the failed attempt.

Needs human: the Brief names no Topic or Tags; the metadata uses `topic: 'economics'` (the nearest existing Topic) and `tags: []`.

Needs human: the German text is written fresh in "du", while other Episodes use "Sie" and the German audience is businesses; the German title is "Verkaufen, bevor das Geld knapp wird".

Needs human: the #150 Slides key their columns on container queries (`@2xl`, `@4xl`) instead of the design answer's viewport `md`, so the marketing row stacks at 1100 px and beside the drawer at 1440 px; the design answers did not fit the Foreground at `md`.

Needs human: the last board (#152) is drawn in quarters with $50k amounts, as the design answer proposed, unlike the first two boards' months and `$100k`/`+$1M`.

Needs human: the steps on the last Slide add "cold call, inbound, network" and "sales cycle" to Voice script item 3's wording, as the design answer's strings do.

Needs human: copy the Dossier does not name is the designers' proposal and built as proposed: all captions, the board's short amounts, the German "Pleite", the deal board's invented company names, "Start this week", the "Start early" stamp, and an added `stages.<stage>.note` key.

Needs human: `sales-is-more-than-selling` keeps "Trust" as its third column beside the "Increase trust" result, and its arrowhead fades in as the lines finish, a motion the design answer does not name.

Needs human: in dark mode `primary` is near-white, so the 27:1 spine, the cycle bar and the "Start early" stamp read white.

Needs human: the German amounts `100k $` and `+1 Mio. $` wrap onto two lines in a note at 375 px.

## open-pr · 2026-10-14T07:42:35Z

### Inputs

- `run-log.md`: every `Needs human:` and `Research gap:` line.
- `.agents/skills/new-episode/references/open-pr.md`, the `pr` skill.

### Output

- Dev server: http://localhost:3000/episode/never-too-early-sales/ answers 200; `/episodes/never-too-early-sales/` answers 404.
- Draft PR https://github.com/hancrafted/content-library/pull/159 from `episode/never-too-early-sales` to `main`, with a 43-item Needs Han checklist; the branch is pushed.

### Checks

- `gh pr view --json isDraft,url`: one draft PR.

### Metrics

- implementor · attempt 1 · pass · 240 s

### Notes

The open-pr job ran in this session, not as a sonnet subagent. A `next dev` was already running from this worktree on port 3000, so a second one exited and the existing one serves the Episode. The route answers only at `/episode/<slug>` until #85, which is on the checklist.

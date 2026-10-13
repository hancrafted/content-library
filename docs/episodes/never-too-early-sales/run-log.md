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

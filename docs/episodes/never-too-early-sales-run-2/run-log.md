# Run log

## brief-grill · 2026-10-14T18:35:31Z

### Inputs

- `.scratch/never-too-early-sales-run-2/handoff.md`: Han's Brief from a voice session, accepted as the starting point.
- `.scratch/never-too-early-sales-run-2/source-deck.pdf`: the source deck the Brief names.
- `docs/design/design-guide.md`: the named styles the Style line must pick from.
- Han's answers in this session to the attempt 1 reviewer lines.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: a new `### Board` named style, worded from the Brief's Style line, at Han's word.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Notes

Attempt 1 failed on five lines. A shape-only fix covered two of them: `generated.at` was moved to the last edit, so the handoff's copied `verified` entries, including a `human:han`, no longer count. Han's answers covered the other three:

- He kept the Board style and had it added to the design guide, which listed only Editorial.
- He dropped three Open ideas: the cashflow board as spine, Editorial instead of Board, and the "Sales funel" typo.
- He changed "Live coaching slot next week" to "Live coaching slot first".

Han also answered two needs-human lines. He pointed the source deck Constraint at `reference/source-deck/design-reference.md`, and he added `_Research:_ 1` to Slide 3.

Shape-only fix: the `## Episode Design Reference` section was added for `.scratch/never-too-early-sales-run-2/source-deck.pdf`. `convert-references` writes its link target after the pipeline gate.

- Needs human: Han kept the Slide order as written. Slides 4–5 use the pipeline before Slide 7 defines it, and the cashflow payoff (Slide 6) comes before "Why it takes time". write-dossier may propose a Spine change.
- Needs human: Han kept Q5 as one question, although it covers two causes: engaging in sales, and early results.

## categorize-research · 2026-10-14T18:48:57Z

### Inputs

- `brief.md#research-questions`, questions 1 to 7.
- `GLOSSARY.md#research-categories`.
- `docs/llm-wiki/index.md`.
- Research folders in `docs/llm-wiki/research/*/` and `docs/episodes/*/research/`, counted for the next free number.

### Output

- Decision: question 1 is `START-0002__revenue-lags-costs-in-startups`.
- Decision: question 2 is `SALES-0007__b2b-sales-cycle-length`.
- Decision: question 3 is `SALES-0008__b2b-pipeline-conversion-rates`.
- Decision: question 4 is `SALES-0009__early-selling-market-insight`.
- Decision: question 5 is `SALES-0010__early-sales-results-build-trust`.
- Decision: question 6 is `SALES-0011__early-selling-repeatable-process`.
- Decision: question 7 is `SALES-0012__sales-pipeline-ramp-up-time`.
- No new category: question 1 fits START, and questions 2 to 7 fit SALES.

### Checks

- `mh check`: pass.

### Notes

Every research question already has a research file in `docs/llm-wiki/index.md` with the same question text: question 1 matches START-0001, and questions 2 to 7 match SALES-0001 to SALES-0006. The names above take the next free numbers, as the job's intent says. The `retrieval` job decides whether each question reuses its existing file. A reused question writes no new folder.

## customize-pipeline · 2026-10-14T18:50:44Z

### Inputs

- `skills/new-episode/assets/pipeline.yml`: the template, at `main` 5d396b4.
- `brief.md`, approved.
- `.scratch/never-too-early-sales-run-2/research-folders.md`: the seven names from `categorize-research`.
- Han's answer in this session: reuse the existing llm-wiki research instead of writing it again.

### Output

- `pipeline.yml`, `status: draft`, `template: 5d396b4`, committed with `Gate: draft pipeline` for Han to approve.

### Checks

- `vitest` staging test: pass.

### Notes

Changes from the template:

- `write-research` became seven jobs, one per research question in the Brief's order, `write-research-<question-slug>`, writing the folders `categorize-research` named. Each `intent` quotes its question and names the llm-wiki file that matches it, because Han chose reuse: `retrieval` should decide `reuse <path>` for each one, so these jobs run no agent.
- `write-dossier` wants all seven research jobs. Its references name the seven reused llm-wiki files (START-0001, SALES-0001 to SALES-0006) instead of the staging research glob, because reuse writes no staging research file.
- `convert-references` writes one output, `reference/source-deck/design-reference.md`, from the Brief's one Episode Design Reference. That path replaces the glob in every agent's references. It also gained `isolation: worktree`, because it runs beside the research jobs once `retrieval` passes.
- Dropped `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` from `write-dossier` and `write-voice-script`, because none of them exists in the repo yet.
- Retries, gates, skills and models are unchanged: the Brief gives no reason to change them.
- Needs human: the three profile guides are missing, so the Dossier and Voice script are written without Han's storytelling, tone and mental-model guides.

## retrieval · 2026-10-14T18:55:53Z

### Inputs

- `skills/new-episode/references/retrieval.md`.
- `brief.md#research-questions`, questions 1 to 7, and the Slides that cite each.
- `pipeline.yml`: the `write-research-*` jobs and their folders.
- `docs/llm-wiki/index.md`.
- `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`.

### Output

- Question 1: reuse `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`.
- Question 2: reuse `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`.
- Question 3: reuse `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`.
- Question 4: reuse `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`.
- Question 5: reuse `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`.
- Question 6: reuse `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`.
- Question 7: reuse `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`.

### Checks

- `mh check`: pass.

### Notes

All seven files are fresh, with `stale_after` in 2027-10. Each h1 question matches the Brief's question word for word. Why each fits its claim:

- Question 1 (Slides 1, 3, 6, 10): START-0001 says the lag is structural and that timing decides cash. Its Caveats mark "start early" as inference.
- Question 2 (Slide 8): SALES-0001 says buying groups and their vetoes set the cycle length.
- Question 3 (Slide 8): SALES-0002 says stages multiply as filters and 40-60% of deals are lost to no decision. It reports a measured 19% win rate.
- Question 4 (Slide 2): SALES-0003 says direct contact corrects the founder's inaccurate customer model. Its Caveats say selling as distinct from interviewing is inference.
- Question 5 (Slide 2): SALES-0004 grounds trust in signaling theory. No study tests LOIs directly, so the Dossier must keep that hedge.
- Question 6 (Slide 2): SALES-0005 says founder-led sales find the repeatable model.
- Question 7 (Slide 9): SALES-0006 gives the ramp-up's three causes, a grouping its Caveats call its own synthesis.

The planned folders START-0002 and SALES-0007 to SALES-0012 are never written. The Dossier cites the llm-wiki paths above.

- Research gap: Slide 8's ~27:1 conversion and ~9.5-month cycle rest only on the source deck's third-party graphic. SALES-0002 reports a 19% win rate (about 5:1) and a 91-day new-customer cycle in one vendor dataset. Frame the worked example as an illustration, not a benchmark.
- Research gap: SALES-0006 explains why ramp-up takes time, not how many months. Slide 9 claims only the mechanism.
- Research gap: Slides 4 and 5 (pipeline tools, marketing feeding the pipeline) cite no research question.

## write-research-revenue-lags-costs-in-startups · 2026-10-14T18:56:11Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-b2b-sales-cycle-length · 2026-10-14T18:56:12Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-b2b-pipeline-conversion-rates · 2026-10-14T18:56:12Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-early-selling-market-insight · 2026-10-14T18:56:13Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-early-sales-results-build-trust · 2026-10-14T18:56:13Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-early-selling-repeatable-process · 2026-10-14T18:56:13Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## write-research-sales-pipeline-ramp-up-time · 2026-10-14T18:56:14Z

### Inputs

- The `retrieval` entry above: `reuse` for this question.

### Output

- Reused `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`; no research file written.

### Checks

- None: a reused job runs no agent and no check.

### Notes

The question is answered by the llm-wiki file above, which is fresh and fits (see the `retrieval` entry).

## convert-references · 2026-10-14T18:59:39Z

### Inputs

- `brief.md#episode-design-reference`: one item, the source deck.
- `.scratch/never-too-early-sales-run-2/source-deck.pdf`: Han's source deck, 16 pages.

### Output

- `reference/source-deck/design-reference.md`, 16 `## Page` sections, with a `process:markdown-harness` `verified` entry.
- `reference/source-deck/pages/`: 16 page images.
- `reference/source-deck/crops/`: 5 of 27 cut-outs kept.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.

### Notes

The job ran in the worktree `episode/never-too-early-sales-run-2--convert-references`, which was merged and removed. Page 8 (the cashflow board, Jan–April, with the revenue arrow) was spot-checked: its text matches its image. Pages 1, 2, 5, 9, 12 and 14 were read too, and every page has text. Page 12 is a third-party pipeline tool screenshot, which the Brief's Constraint says to redraw.

## write-dossier · 2026-10-14T19:07:59Z

### Inputs

- `skills/new-episode/references/write-dossier.md`.
- `skills/new-episode/assets/sample-episode/dossier.md`.
- `brief.md`.
- The `retrieval` entry above: its reuse decisions and research gaps.
- `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`.
- `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`.
- `reference/source-deck/design-reference.md` and its page images.
- `docs/design/slide-library.md` and `docs/design/design-guide.md` (Board).
- `src/components/slide-master/` and `src/components/episodes/slide-master/slides/`, for master names.

### Output

- `dossier.md`, `status: draft`, with a `process:markdown-harness` `verified` entry. It holds 5 Sections and the Brief's 10 Slides with their titles and order, and the Title slide "Start selling before you need the money". Every Voice script still holds keywords.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Notes

Attempt 1 failed on two lines:

- `#how-marketing-feeds-the-pipeline`: the Visual dropped the leads into a "Contact made" column, while the Voice script says sales makes contact afterwards. Attempt 2 changed the column to "Lead in", which is what page 14 of the deck shows.
- `#what-is-a-sales-pipeline`: Speaker note 1 claimed stage rates are not comparable across companies, which SALES-0002 marks as inference. Attempt 2 kept only Finding 7 and marked the cross-company point as inference.

Every actionable is spoken on a Slide: the cashflow view on `watch-your-cashflow`, the lead list and first contact on `stages-of-sale`, deal tracking on `pipeline-tools-in-practice`, and conversion and cycle on `what-is-a-sales-pipeline`. The Slides about the cashflow board use `basic-page` with `motion: local`, so `write-design-spec` designs the board.

- Research gap: Slide 8's ~27:1 and ~9.5-month figures are labelled "Illustration of a complex sale, not a benchmark", next to SALES-0002's measured 19% win rate and 91-day cycle.
- Research gap: Slide 9 claims only the mechanism of ramp-up, with no month count.
- Research gap: the Brief cites no research for Slides 4, 5 and 7, but the body rule requires Speaker notes. Their notes come from SALES-0002 (Slides 4 and 7) and SALES-0006 (Slide 5).
- Needs human: the Title slide reads "Start selling before you need the money", not the Brief's title.
- Needs human: the "Today's route" beat names four steps while the Dossier has five Sections.
- Needs human: on `#pipeline-tools-in-practice`, Voice script 1 says owner is visible at a glance, but the Visual's deal notes show no owner.
- Needs human: the Gartner figures on `#pipeline-by-the-numbers` were read from search excerpts (SALES-0002 Caveats). Check them against the page before quoting.
- Needs human: there are no profile guides, so voice and emphasis follow no guide of Han's.

## write-voice-script · 2026-10-14T19:17:49Z

### Inputs

- `skills/new-episode/references/write-voice-script.md`.
- `brief.md`: Hook, Red thread, Analogy, Format and Constraints.
- `dossier.md`, as `write-dossier` committed it.
- The `write-dossier` entry above.

### Output

- `dossier.md`, `status: draft`, with a `process:markdown-harness` `verified` entry. All 46 Voice script items are spoken paragraphs, about 1,970 words. No beat, heading, Visual or Speaker note changed. Committed with `Gate: draft dossier` for Han to read and edit.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 3.

### Notes

The script opens on the March bankruptcy and returns to the cashflow board three times. Each actionable is spoken as a labelled task, and the closing Slide repeats all four.

Attempts 1 and 2 failed on paragraphs that repeated their Slide's Speaker note. In `#sales-is-more-than-selling` Voice 1, the paragraph said customer contact corrects the founder's guess. In `#why-it-takes-time-to-ramp-up` Voice 2, it said the answers come from conversations. In `#how-marketing-feeds-the-pipeline` Voice 3, it said not to wait for users. Attempt 2 fixed the third. Attempt 3 rewrote the first two to speak the cost and the clock instead.

The `write-dossier` entry has no `Spine change:` lines.

- Needs human: the script runs about 14 minutes at speaking pace, against the Brief's 20-30 minutes.
- Needs human: `#why-it-takes-time-to-ramp-up` Voice 2 says the answers "take months, not days". The research (SALES-0006) gives no month count. The orchestrator's attempt 3 instruction introduced this wording.
- Needs human: the opening route names four steps for five Sections, and the closing recap also says "four" for the actionables. A listener may confuse the two.
- Needs human: in `#why-it-takes-time-to-ramp-up`, Voice 1 says all preparation must exist before the first deal, while note 3 says to codify the playbook only after learning. The two may read as contradicting.
- Needs human: `#how-marketing-feeds-the-pipeline` Voice 3 is close to note 1, but the reviewer judged it not a repeat.
- Needs human: there are no profile guides, so the voice follows no guide of Han's.

## write-spec · 2026-10-14T19:26:28Z

### Inputs

- `skills/new-episode/references/write-spec.md`.
- `brief.md`.
- `dossier.md`, as Han approved it.
- `.archgate/adrs/FE-004-slide-architecture.md`: the Episode seams, used because Han was away.
- `docs/features/episode-migration.md`: step 8, for the wiring ticket.
- The `write-dossier` and `write-voice-script` entries above.

### Output

- Spec issue https://github.com/hancrafted/content-library/issues/173, labelled `episode:never-too-early-sales-run-2`. The label was created for it.
- Edited #173 · 2026-10-14T19:21:05Z: the spec.
- Edited #174 · 2026-10-14T19:21:26Z: the Title slide, the Episode wiring and Section 1, "Why watching cashflow is mission critical". It blocks #175 to #178.
- Edited #175 · 2026-10-14T19:21:29Z: Section 2, "Why sales is more than just selling".
- Edited #176 · 2026-10-14T19:21:32Z: Section 3, "How to start doing sales".
- Edited #177 · 2026-10-14T19:21:36Z: Section 4, "Why building an effective sales pipeline takes time".
- Edited #178 · 2026-10-14T19:21:39Z: Section 5, "Start before you need the money".

### Checks

- Reviewer: pass on attempt 1, 13 lines.

### Notes

Each sub-issue is labelled `needs-triage` and linked to #173. Every body ends with `Edited-by: write-spec`. The text capture of step 8 is written as an orchestrator step in #174, run after every ticket has built its Slides.

The implementor reported that `grid-1x3` does not exist. That is wrong: it is a folder under `src/components/episodes/slide-master/slides/`, so the masters the Dossier names hold.

- Needs human: the Dossier holds no caption for the Episode and none for the section slides. The tickets tell the implementer to write the Episode's caption from the Brief's goal and Hook, and each section caption from its Voice script.

## write-design-spec · 2026-10-14T19:52:03Z

### Inputs

- `skills/new-episode/references/write-design-spec.md`.
- `brief.md` (`## Style`: Board) and `docs/design/design-guide.md` (Board).
- `dossier.md`, as Han approved it.
- `reference/source-deck/design-reference.md` and its page images.
- `GLOSSARY.md`, `docs/design/slide-library.md` and `docs/design/design-system.md`.
- `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md` and `FE-011-design-tokens.md`.
- Run-1 tickets #100 to #103, as worked examples.
- Spec #173 and tickets #174 to #178.

### Output

- Edited #173 · 2026-10-14T19:27:05Z: `## Visual language` (Board).
- Edited #174 · 2026-10-14T19:46:04Z: design answers for the Title slide, Section 1, and the shared board API.
- Edited #175 · 2026-10-14T19:47:58Z: design answers for Section 2.
- Edited #176 · 2026-10-14T19:49:31Z: design answers for Section 3.
- Edited #177 · 2026-10-14T19:48:05Z: design answers for Section 4.
- Edited #178 · 2026-10-14T19:47:50Z: design answers for Section 5.
- Every ticket still carries `needs-triage`, the gate for Han.

### Checks

- Reviewer: pass on attempt 2.

### Notes

The five designers ran in parallel and named the shared board parts differently. The orchestrator then set one contract. #174 builds `Board`, `StickyNote`, `BoardArrow` and `CashflowBoard` in `src/components/slide-shared/board/`, and the motions `stick-on` and `draw-in` in `slide-shared/motions/`. Every other ticket imports them. #174 builds them directly in `slide-shared/` because #175 to #178 are built in parallel after #174, so a move in a later ticket would race with the others.

Attempt 1 failed on #175 to #178, because each one used shared parts outside #174's API. For attempt 2, #174 widened the API: a `Board` with children, a `StickyNote` with `fill` and a body, a standalone `BoardArrow`, and `CashflowBoard` `overlays`. #174 states the API in one "Shared API" block. The other four tickets now use only what that block names.

Overruled masters: every page Slide is built as a Scene from `SlideFrame` and the kit's `<Title>`. `BasicPageSlide`'s body is a `<p>` and cannot hold a board. `grid-1x3` on `what-is-a-sales-pipeline` and `why-it-takes-time-to-ramp-up` and `three-column` on `stages-of-sale` are overruled. Their own grids are the "Not this" of the design guide, or cannot hold notes. The Dossier rewrite after the gate sets `master: basic-page` there and keeps `motion: local` everywhere: the library motions do not exist until #174 is built, so the staging check would refuse their names.

- Needs human: copy the Dossier does not name is the designers' draft. That covers the captions of `watch-your-cashflow` (none yet), `sales-is-more-than-selling` and its note lines, and the three #177 captions and the rail label "Months, not days". It also covers the deal names and amounts on `pipeline-tools-in-practice`, the "Cash arrives later" label, and the "Sales makes contact" arrow label.
- Needs human: in #176, the standalone arrows centred on column gaps may run onto the `fill` notes on `stages-of-sale` and `how-marketing-feeds-the-pipeline`. This is a layout point for `implement-episode`'s visual check.
- Needs human: #178 lists a top-level `target` on `CashflowBoard`, but also says the figure takes none. Only the arrow's target is used.

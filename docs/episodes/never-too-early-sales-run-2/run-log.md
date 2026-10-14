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

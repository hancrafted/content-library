# Run log

## brief-grill · 2026-10-13T23:12:35Z

### Inputs

- `.scratch/never-too-early-sales/handoff.md`: Han's pasted Brief, preserved verbatim.
- `.agents/skills/new-episode/references/brief-grill.md` and `.agents/skills/brief-grill/SKILL.md`: accept the supplied wording and ask Han about failed lines.
- `.agents/skills/new-episode/assets/pipeline.yml`: checks, retries and fresh reviewer.
- `.agents/skills/new-episode/assets/sample-episode/brief.md` and `.agents/skills/new-episode/assets/sample-episode/run-log.md`: staging examples.
- `docs/design/design-guide.md`: Editorial is the only named style in this checkout.
- `docs/adr/0004-episode-content-is-staged-then-promoted.md`: staging and human approval.
- `npx mh query` for the Brief and run-log paths: field and heading intents.
- Han's answers in this session: Format, Style, no Threads, Slide 4, Section order, eight research questions and Open ideas.

### Output

- `docs/episodes/never-too-early-sales/brief.md`: draft, machine-verified; awaiting Han's approval.
- Integration branch decision: Han explicitly chose `sales-pipeline-episode-sol` for an isolated Sol test instead of `episode/never-too-early-sales`. Further work must stay in this worktree and must not inspect another worktree.
- Run id: `2026-10-13T22:50:35Z`.

### Checks

- `npm run check:docs`: pass on both attempts.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass on both attempts.
- Fresh reviewer, attempt 2: all seven prior failed lines pass.
- `approve.ts --by process:markdown-harness`: machine entry appended; no human approval recorded.

### Metrics

- implementor · attempt 1 · pass · 292 s
- reviewer · attempt 1 · fail · rubric "Fail if a section holds what belongs in a different one." · 180 s
- implementor · attempt 2 · pass · 805 s
- reviewer · attempt 2 · pass · 42 s

### Notes

- Attempt 1 preserved the pasted body. Shape-only changes dropped the save-as comment and set generated metadata to the current producer and run clock.
- Attempt 1 review found missing duration and style, the unsettled after-sale choice, mixed Section steps, bundled or missing research subjects, and the duplicate Analogy idea and unexplained PDF path.
- Han settled Format verbatim: "Foundations, about 20-30 minutes: presented first to a live startup-coaching cohort, then cut as a standalone YouTube Episode."
- Han settled Style verbatim: "Editorial: sober, self-explanatory Slides for a mixed audience of business and technical founders, using a consistent sticky-note/kanban motif and three-box flows."
- Han explicitly declined Threads: "No Threads".
- Han settled Slide 4: "Keep Slide 4 with its existing wording, removing only the open question".
- Han confirmed the spine: "Keep the existing Sections and order; method, timing and cashflow callbacks intentionally reinforce the same argument".
- Han accepted the eight research questions now in the Brief verbatim. Shape-only reference changes map Slide 2 to questions 4, 5, 6; Slide 7 to 2, 3; Slide 9 to 7; Slide 10 to 8.
- Han removed the duplicate recurring-board suggestion: "Remove it; the recurring board is already settled in Analogy".
- Han defined the PDF as "Reference deck for the existing slide ideas; keep the path in the original handoff only". The PDF has not been read in this job.
- Retry review judged only the previous failed lines and accepted Han's intentionally preserved spine.
- Needs human: reviewer noted uncited claims on Slides 3, 4 and 6; decide whether they are instructional opinion or need additional research.
- Needs human: third-party visual sourcing remains open on Slides 8 and 9.
- Metrics timing is approximate: the first reviewer reported about three minutes, the second reviewer was measured between observed clock readings, and implementor timing includes Han's settlement dialogue. Token counts were not supplied. CSV completion timestamps use the corresponding recorded check/review checkpoints.
- Human gate: Han edits and approves the Brief before research categorization or pipeline tailoring starts.

## categorize-research · 2026-10-13T23:15:54Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: eight questions; Han approved at `2026-10-13T23:14:25Z`, committed in `444ce96`.
- `.agents/skills/new-episode/assets/pipeline.yml#categorize-research`: category, numbering and subject-slug intent.
- `GLOSSARY.md`: existing research categories.
- `.agents/skills/domain-modeling/SKILL.md`: domain vocabulary procedure.
- Research-folder listings under this worktree's `docs/episodes/` and `docs/llm-wiki/`: no existing IDs to reserve.

### Output

- `GLOSSARY.md`: added FIN for startup finance and B2B for business-to-business pipeline sales.
- `.scratch/never-too-early-sales/research-folders.md`: ordered folder mapping, saved for resumption.
- Question 1: `FIN-0001__revenue-lags-costs-early-stage`.
- Question 2: `B2B-0001__b2b-sales-cycle-length`.
- Question 3: `B2B-0002__b2b-stage-conversion-rates`.
- Question 4: `B2B-0003__early-selling-market-insight`.
- Question 5: `B2B-0004__early-selling-customer-trust`.
- Question 6: `B2B-0005__early-selling-internal-insight`.
- Question 7: `B2B-0006__marketing-feeds-pipeline-stages`.
- Question 8: `B2B-0007__sales-pipeline-ramp-up-time`.

### Checks

- `npx mh query GLOSSARY.md`: read before editing.
- `npm run check:docs`: pass, zero violations.

### Metrics

- implementor · attempt 1 · pass · 30 s

### Notes

- FIN is new because no existing category covers cashflow, cost and revenue timing in startups.
- B2B is new because SALES governs buyers choosing a coach or consultant, not companies building their sales pipelines.
- No library match: `docs/llm-wiki/index.md` does not exist in this checkout. Retrieval must explicitly mark every question new.
- The agent reported approximately 30 seconds of tool time, not a complete wall-clock duration; token counts were not supplied.
- No research content was written. The pipeline approval gate remains ahead.

## categorize-research · 2026-10-13T23:18:53Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: approved research questions, unchanged.
- `GLOSSARY.md` and `.scratch/never-too-early-sales/research-folders.md`: initial category IDs.
- `docs/episodes/never-too-early-sales/pipeline.yml`: candidate outputs expose the reserved folder names to the staging check.
- `tests/docs/episode-staging.test.ts` and `src/lib/research-folder.pure.ts`: folder-name check and uppercase-letter category grammar.
- Failed check: each of the seven `B2B-...` paths "is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>."

### Output

- `GLOSSARY.md`: corrected B2B's category ID to BIZ without changing its meaning; FIN unchanged.
- `.scratch/never-too-early-sales/research-folders.md`: questions 2-8 now use `BIZ-0001` through `BIZ-0007` with unchanged subject slugs.
- Naming decision: pipeline research outputs and Dossier references use the corrected BIZ IDs.

### Checks

- `npm run check:docs`: pass.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass after correcting category IDs.

### Metrics

- implementor · attempt 1 · fail · rubric "B2B-0001__b2b-sales-cycle-length is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>." · 0 s
- implementor · attempt 2 · pass · 67 s

### Notes

- The initial categorization passed its prescribed markdown check, but the pipeline's staging check found its invalid category IDs. This entry records that later failure against the originating categorization attempt rather than overwriting its earlier entry.
- The first failure's duration is zero because no additional implementor run occurred; attempt 2 covers the observed correction/check interval.
- Category IDs permit uppercase letters only. Correcting the names avoids changing shared code to accommodate this Episode.
- The corrected names remain reserved in the pipeline; no research content has started.

## customize-pipeline · 2026-10-13T23:19:42Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: approved 20-30-minute Foundations Episode, Editorial, no Threads, eleven Slides and eight research questions.
- `.scratch/never-too-early-sales/research-folders.md`: corrected FIN/BIZ mapping from categorize-research.
- `.agents/skills/new-episode/assets/pipeline.yml` and `references/customize-pipeline.md` in that skill: template and tailoring procedure.
- Template ancestor `7ac7829`: merge-base of this integration branch and the template branch; no other worktree was inspected.
- `.agents/skills/new-episode/references/retrieval.md`: explicit handling when the library index is absent.
- `.agents/skills/new-episode/references/write-design-spec.md`: visual-language and ticket-design approval gate.
- Checked optional inputs: `docs/llm-wiki/index.md` and `docs/profile/han/{storytelling-guide,tone-guide,mental-model-guide}.md` are absent.

### Output

- `docs/episodes/never-too-early-sales/pipeline.yml`: draft; awaiting Han's pipeline approval.
- Pipeline decision: eight isolated research jobs; Dossier wants all eight so blocked research leaves an explicit gap instead of stopping the Episode.
- Pipeline decision: keep the Dossier/Voice script and design-ticket human gates before implementation.

### Checks

- `npm run check:docs`: pass.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass.
- Reviewer: not configured for this gate; Han approves the per-run pipeline.

### Metrics

- implementor · attempt 1 · pass · 175 s

### Notes

- Replaced every Episode placeholder and added `template: 7ac7829` to pin the inherited template.
- Expanded research foreach into eight named jobs, with each question quoted in its intent and every output/reference named explicitly; no glob outputs remain.
- Research agents share a YAML anchor to preserve identical template settings across the eight jobs.
- Removed missing library-index references from categorization and retrieval. Retrieval explicitly records all questions new instead of silently substituting a successful lookup.
- Removed missing storytelling, tone and mental-model guides from Dossier and Voice script references. Needs human: these guides are absent, so the approved Brief and Dossier gate must carry the voice judgement.
- Added Dossier intent for the approved duration, no Threads, unchanged spine and recurring cashflow board; worked numbers must stay illustrative unless supported as measured claims, with arithmetic checked.
- Added design intent to resolve the third-party visual questions before reproduction, favoring original fictional board/funnel Scenes; kept Han's design-ticket gate.
- Retained all template retries, human gates and models: inherit for the orchestrator/writing jobs, sonnet for research implementors and open-pr, opus for categorization, reviewers, design and implementation.
- Retained isolated research worktrees, with a header documenting Han's explicit integration-branch exception: use `sales-pipeline-episode-sol` as their base and never inspect another run's worktree.
- The candidate pipeline check exposed categorize-research's invalid B2B IDs. That upstream job used its correction attempt, recorded in the preceding append-only entry; this pipeline uses the corrected BIZ names.
- Human gate: Han edits the pipeline and approves it with top-level `status: approved`, committed with `Gate: approved pipeline`. No research jobs have started.

## retrieval · 2026-10-13T23:26:08.789Z

### Inputs

- `.agents/skills/new-episode/references/retrieval.md` and `.agents/skills/new-episode/SKILL.md`: retrieval outcomes and logging procedure.
- `docs/episodes/never-too-early-sales/pipeline.yml`: Han approved in `7f96400`; all start conditions pass.
- `docs/episodes/never-too-early-sales/brief.md`: eight questions and current human approval.
- `docs/llm-wiki/index.md`: checked in this run's worktree; absent.
- `docs/episodes/never-too-early-sales/run-log.md`: governance queried before returning the entry.

### Output

- Question 1, revenue lagging early-stage costs: `new`.
- Question 2, B2B sales-cycle length: `new`.
- Question 3, stage conversion rates: `new`.
- Question 4, early selling yielding market insight: `new`.
- Question 5, early selling building customer trust: `new`.
- Question 6, early selling yielding internal insight: `new`.
- Question 7, marketing feeding pipeline stages: `new`.
- Question 8, sales-pipeline ramp-up time: `new`.

### Checks

- `npx mh query docs/episodes/never-too-early-sales/run-log.md`: intents read.
- `npm run check:docs`: pass, zero violations.
- Reviewer: not configured.

### Metrics

- implementor · attempt 1 · pass · 16.976 s

### Notes

- No library match: questions 1-8 are new because the library index is absent; no indexed candidate could be assessed for freshness or fit.
- No reuse or extend outcomes; all eight research jobs must run.
- The agent inspected only this run's worktree, wrote no files and returned this entry for the orchestrator to append.
- Token count was not reported.

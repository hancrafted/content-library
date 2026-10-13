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

# Run log

## brief-grill · 2026-10-15T11:46:50Z

### Inputs

- `.scratch/never-too-early-sales-run-3/handoff.md`: Han's approved Brief from never-too-early-sales-run-2, accepted unchanged as the starting point for this run.
- `.scratch/never-too-early-sales-run-3/source-deck.pdf`: the source deck the Brief's Episode Design Reference names.
- `docs/design/design-guide.md`: the named styles the Style line must pick from.
- Han's answers in this session to the attempt 1 reviewer lines.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: the `### Board` named style, copied verbatim from the never-too-early-sales-run-2 branch at Han's word.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Notes

Han chose to reuse the run-2 Brief unchanged, so this run compares with run 2. Shape-only fix: `generated` was reset to this run, and run 2's `verified` entries were dropped, so no earlier approval counts.

Attempt 1 failed on one line, the Style intent: the Brief names `Board`, but `main`'s design guide listed only Editorial. The run-2 Board entry never reached `main`. Han chose to re-add it word for word instead of switching to Editorial.

Attempt 1 also marked one line as needs-human: Audience, Format and a Constraint each say "live coaching first, then YouTube". Han keeps all three as written.

- `convert-references` writes `reference/source-deck/design-reference.md` after the pipeline gate. Until then the Brief's Episode Design Reference link has no target.
- Run 2's Brief-level Needs human items stand unchanged, because Han kept the Brief: Slides 4–5 use the pipeline before Slide 7 defines it, and Q5 covers two causes.

## scaffold-pipeline · 2026-10-15T12:14:31Z

### Inputs

- `skills/new-episode/assets/pipeline.yml`: the template, at `main`'s `dc8e88f`, the commit last merged into this branch.
- `brief.md`: its Episode Design Reference names one file, `reference/source-deck/design-reference.md`.

### Output

- `pipeline.yml`, `status: draft`, `template: dc8e88f`, with every job of the template; `write-research` and `implement-section` stay unexpanded `foreach` jobs.
- Every `reference/*/design-reference.md` glob is replaced by `docs/episodes/never-too-early-sales-run-3/reference/source-deck/design-reference.md`.
- `tests/docs/episode-staging.test.ts` (commit `5b5647a`): `researchFolders()` skips a glob output. The test had read the draft's `research/*/research.md` as a folder name and refused it.

### Checks

- `vitest` staging test: fail on attempt 1, pass on attempt 2.

### Notes

Removed because the files do not exist yet: `docs/profile/han/storytelling-guide.md`, `docs/profile/han/tone-guide.md` and `docs/profile/han/mental-model-guide.md`, from the agents of `write-dossier` and `write-voice-script`.

Attempt 1 failed on the staging test, which the scaffold-pipeline reference contradicts: "docs/episodes/never-too-early-sales-run-3/research/* is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>." The job has 0 retries. Han chose to fix the test on this branch, before the pipeline gate freezes the template, and to retry the job. The `han-reply` Gate also carries a rubric `pass` Score on `scaffold-pipeline#1` from `human:han`. It was logged by mistake: it records his choice to fix the test, not a judgement of the output.

## categorize-research · 2026-10-15T12:16:32Z

### Inputs

- `brief.md`: the seven questions under `## Research questions`.
- `GLOSSARY.md`: the Research categories.
- `docs/llm-wiki/index.md` and the research folders under `docs/llm-wiki/research/`.
- Branch `episode/never-too-early-sales-run-2`: it holds the same llm-wiki folders, and none under `docs/episodes/*/research/`.

### Output

- One folder name per question, in the Brief's order. Each one reuses an existing llm-wiki folder whose `research.md` title matches the question word for word: 1 `START-0001__revenue-lags-costs-in-startups`, 2 `SALES-0001__b2b-sales-cycle-length`, 3 `SALES-0002__b2b-pipeline-conversion-rates`, 4 `SALES-0003__early-selling-market-insight`, 5 `SALES-0004__early-sales-results-build-trust`, 6 `SALES-0005__early-selling-repeatable-process`, 7 `SALES-0006__sales-pipeline-ramp-up-time`.
- No category was added. No file changed, so the job branch merged with no commit.

### Checks

- `mh check`: pass.

### Notes

Other branches still carry folders under retired categories (`BIZ-*`, `GTM-*`, `FIN-*`) for the same questions. `GLOSSARY.md` no longer lists those categories, so they were not reused. Retrieval decides whether each reused folder needs a refresh.

## convert-references · 2026-10-15T12:18:18Z

### Inputs

- `brief.md`: one Episode Design Reference, `reference/source-deck/design-reference.md`.
- `.scratch/never-too-early-sales-run-3/source-deck.pdf`: the source deck brief-grill copied, 16 pages.

### Output

- `reference/source-deck/design-reference.md`: 16 pages, each with a `## Page <n>` and its page image in `pages/`.
- `crops/`: 5 of marker's 27 cut-outs kept, from pages 2, 8, 12, 14 and 16.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Page 8 (the cashflow board) checked against its image: the text holds every note's words and amounts.

### Notes

Pages 1, 5 and 9 hold only their title, which matches the title and section-divider pages.

Needs human: page 16's text came back empty. Its board, Q1–Q4 with "Start when?", came through only as the cut-out `crops/page-16-diagram-3.jpg` and its page image, so no note's words or amounts are in the text. Page 13 is a third-party Pipedrive screenshot; its OCR text is UI noise. The Brief says to draw our own deal board instead.

## retrieval · 2026-10-15T12:18:21Z

### Inputs

- `skills/new-episode/references/retrieval.md`: the job's reference.
- `docs/episodes/never-too-early-sales-run-3/brief.md`: the seven Research questions and the Slides that cite them.
- `docs/llm-wiki/index.md`: the research descriptions searched per question.
- The seven research files the `categorize-research` folders name, each read in full under `docs/llm-wiki/research/`.
- `docs/episodes/never-too-early-sales-run-3/run-log.md`: the `categorize-research` entry with the folder names.

### Output

- Question 1: reuse `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`.
- Question 2: reuse `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`.
- Question 3: reuse `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`.
- Question 4: reuse `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`.
- Question 5: reuse `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`.
- Question 6: reuse `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`.
- Question 7: reuse `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`.

### Research jobs

- none: every question reused.

### Checks

- mh check: pass.

### Notes

Every file is fresh: the earliest `stale_after` is 2027-10-13, after today (2026-10-15).

- Question 1 (START-0001): its Context supports the claim that cash position is decided by timing, which is what slides 1, 3, 6 and 10 use the cashflow board for.
- Question 2 (SALES-0001): its Context claims a B2B deal needs months from first contact to signature because the buyer group decides slowly, which is slide 8's ~9.5-month cycle.
- Question 3 (SALES-0002): its Context claims a pipeline needs many more leads than deals and says it checks a worked example of such ratios, which is slide 8's ~27:1.
- Question 4 (SALES-0003): its Context is scoped to what direct contact with buyers teaches, the market insight claim of slide 2.
- Question 5 (SALES-0004): its Context claims early sales earn investor and customer trust, slide 2's claim. Its description says no study measures letters of intent or pipelines directly; write-dossier should not claim more.
- Question 6 (SALES-0005): its Context claims early selling yields a process, slide 2's repeatable-process box.
- Question 7 (SALES-0006): its Context claims a pipeline cannot be switched on when money is needed, slide 9's ramp-up.

## customize-pipeline · 2026-10-15T12:20:19Z

### Inputs

- `pipeline.yml`: the draft scaffold-pipeline wrote from template `dc8e88f`.
- `brief.md`: five Section h3s under `## Slides`.
- `run-log.md`: retrieval's `### Research jobs` reads `- none: every question reused.`

### Output

- `pipeline.yml`, `status: draft`: no `foreach` and no glob output left; committed with `Gate: draft pipeline` for Han to approve.

### Checks

- `vitest` staging test: pass, also with `status: approved` set for a trial run and then reverted.

### Notes

Changes from the template, each with its reason:

- `write-research` removed, along with `write-dossier`'s `wants: [write-research]`: retrieval reused every question, so the Research stage stays empty.
- `write-dossier` references the seven reused llm-wiki files in place of the `research/*/research.md` glob: START-0001 and SALES-0001 to SALES-0006 under `docs/llm-wiki/research/`.
- `implement-section` is expanded into one job per Section, in the Brief's order, each with an `intent` naming the Section and its position: `implement-section-why-watching-cashflow-is-mission-critical`, `-why-sales-is-more-than-just-selling`, `-how-to-start-doing-sales`, `-why-building-an-effective-sales-pipeline-takes-time` and `-start-before-you-need-the-money`. `open-pr` needs all five.
- Ports: `implement-episode-init` 4000, then the Sections 4001 to 4005 in order. All six were free.
- The comments on `retrieval` and `write-dossier` now describe this run, since the ones from the template named the dropped foreach.
- Retries, gates, skills and models are unchanged: the Brief gives no reason to change them.

## customize-pipeline · 2026-10-15T12:37:30Z

### Inputs

- Han's change at the pipeline gate: "i've added some steering files for voice script in docs/profile add in the pipeline".
- `docs/profile/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md`, which reached this branch through `main`'s `f211581`.

### Output

- `pipeline.yml`, still `status: draft`, with the three guides added back where the template lists them. It is committed again with `Gate: draft pipeline`.

### Checks

- `vitest` staging test: pass.

### Notes

- `write-dossier` implementor and `write-voice-script` implementor: all three guides. `write-voice-script` reviewer: storytelling and tone. These are the same paths and places as the template at `main`.
- `template:` moves from `dc8e88f` to `f211581`, the `main` commit this branch now sits on. The template changed between the two only in these guide paths.
- These guides replace the three `docs/profile/han/*` files that scaffold-pipeline removed because they did not exist.

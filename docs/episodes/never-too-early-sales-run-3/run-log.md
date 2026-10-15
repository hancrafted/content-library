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

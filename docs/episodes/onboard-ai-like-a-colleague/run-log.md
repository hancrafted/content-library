# Run log

## brief-grill · 2026-10-12T19:40:18Z

### Inputs

- A Brief pasted as a voice handoff, saved verbatim to `.scratch/onboard-ai-like-a-colleague/handoff.md`, with two open questions: the planned length and the marketing one-liner.

### Output

- `brief.md`, `status: draft`, committed with `Gate: draft brief` in 14a1bf8.

### Checks

- `mh check`: fail on the first pass: the Analogy section held an unordered list of the four disciplines, and the section allows prose only. Pass after Han chose to inline the list as one sentence, wording kept.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, no token count

### Notes

Han settled both open questions in session: the Format's length is "closer to 10 minutes, 15 at most", and the one-liner "Stop prompting AI. Start onboarding it." stays under Open ideas, since the Brief has no heading for it. Every other heading is Han's handoff wording, untouched. No runs CSV row yet: its `run` id is assigned at the orchestrator's step 4, after both gates.

## pipeline-tailor · 2026-10-12T19:58:00Z

### Inputs

- `brief.md`, approved by Han in session (b60cd80).
- The template `.agents/skills/new-episode/assets/pipeline.yml`.
- Han's answers: a human gate after `distill`; read the earlier `amnesiac-freelancer` Episode, fold its two research files into this run's research files, then delete them.

### Output

- `pipeline.yml`, `status: draft`.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, no token count

### Notes

Changes from the template, each with its reason, follow.

`research-match` reads `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md` instead of `docs/llm-wiki/index.md`, which does not exist yet. Both files lack `stale_after`, so neither can be `reuse`; expect `extend` or `new`.
`research` reads the same two files, so each implementor folds their relevant Findings into its new research file, as Han asked. `retries` rises from 2 to 3: questions 2, 3 and 6 rest on disputed productivity studies, and question 6 must reconcile the novice-boost findings.
`consolidate` and `distill` no longer read `docs/profile/han/storytelling-guide.md`, `tone-guide.md` or `mental-model-guide.md`, which do not exist yet. They read `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` and `docs/research/amnesiac-freelancer-script.md` instead, so the new Episode builds on the old one without copying it.
The `distill` reviewer no longer reads the missing tone guide.
`distill` gets `gate: human`: Han presents this talk live next week and reads the Manuscript before the spec is written.

Pending outside the schema: once every `research` job has passed, the orchestrator deletes `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`, and repoints the two files that cite them (`src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` line 20 and `docs/research/amnesiac-freelancer-script.md` line 3) to the new research files.

## pipeline-tailor · 2026-10-12T20:10:00Z

### Inputs

- `pipeline.yml` as drafted in 3633eee, and Han's instruction to set every retry to 1 for this run.

### Output

- `pipeline.yml`, still `status: draft`.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, no token count

### Notes

Every job after `pipeline-tailor` now has `retries: 1`, so each job gets two attempts. Han wants to see how often a first attempt fails. This replaces the earlier raise of `research` to 3. `brief-grill` and `pipeline-tailor` keep 0: they are done, and Han is their reviewer.

## pipeline-tailor · 2026-10-12T20:26:49Z

### Inputs

- `pipeline.yml` as of d3c7ec5.
- The new template from `feat/89-new-episode` (61fc793, 0daa23c), merged in: agent fields `agent`, `model` and `session` in place of `profile`, a job `intent`, and implement run by `implement-spec` and reviewed by `code-review`.
- Han's grill decisions on the pipeline definition, settled in session.

### Output

- `pipeline.yml`, still `status: draft`, rebuilt from the new template with this Episode's tailoring.
- `docs/episodes/runs.csv`, rows for the three earlier gate-job runs and this one.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.
- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

This entry supersedes the Notes of the two earlier pipeline-tailor entries where they differ. Every model comes from the template: Sonnet for the research implementors and serve-and-pr, Opus for the implement implementor and every reviewer, inherit for the rest, and Sonnet for retire-prior-research, a minor task. Every retry after pipeline-tailor stays at 1, and distill keeps its human gate.

The earlier note's step outside the schema is now the job retire-prior-research, which needs research and states its task as an `intent`: delete `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`, repoint the two files that cite them, and remove both paths from every references list here, so the pipeline check still finds every file it names. That last step edits the approved pipeline mid-run; it is the one edit of this file after the gate.

The run id is 2026-10-12T19:22:40Z, when the Episode branch was created. The earlier entries' note of no CSV row is resolved: the run id now starts at step 1, and the rows are added. The brief-grill row's duration runs from the branch's creation to the draft commit; the second pipeline-tailor run's duration was not measured.

## customize-pipeline · 2026-10-12T20:49:52Z

### Inputs

- `pipeline.yml` as of 509618c.
- The job renames from `feat/89-new-episode` (4919216), merged in.

### Output

- `pipeline.yml`, still `status: draft`, with every job renamed and its tailoring unchanged.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.
- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

Han renamed the jobs by what they do: pipeline-tailor is now customize-pipeline, research-match retrieval, research write-research, consolidate write-dossier, distill write-manuscript, spec write-spec, implement implement-episode, and serve-and-pr open-pr. brief-grill keeps its skill's name. The earlier entries and runs CSV rows keep the names they were written with, since both logs are append-only: the job called pipeline-tailor there is customize-pipeline here.

## customize-pipeline · 2026-10-12T20:58:36Z

### Inputs

- `pipeline.yml` as of 20969ab.
- The template change from `feat/89-new-episode` (249dd87), merged in: full output paths and the job field `before`.

### Output

- `pipeline.yml`, still `status: draft`, its tailoring unchanged.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.
- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

Every output, `foreach` and staging reference now names its full path under `docs/episodes/onboard-ai-like-a-colleague/`, and each job writing markdown (brief-grill, retrieval, write-research, write-dossier, write-manuscript) lists `before: [mh-query]`, so its implementor queries each output's rules before writing it. The schema comment is the template's, with `<slug>` left in as the placeholder it describes.

## customize-pipeline · 2026-10-12T21:05:26Z

### Inputs

- `pipeline.yml` as of e10caa9.
- The template change from `feat/89-new-episode` (78fb778), merged in: a per-run pipeline names one research job per question, with no `foreach` and no glob output.
- `brief.md#research-questions`, six questions.

### Output

- `pipeline.yml`, still `status: draft`, its research expanded into six jobs.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass, including one write-research job per research question.
- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

The one `write-research` job became six, each with an `intent` quoting its question and its own output: `onboarding-lens` (question 1), `individual-gap` (2), `org-gap` (3), `context-quality` (4), `unchecked-risk` (5) and `delegation-skill` (6), each writing `research/<name>/research.md`. Han chose these topic names over question numbers, because a research file outlives the Episode.

The earlier Episode's research now goes only to the questions it bears on, an agent's reading of the two files for Han to check at the gate: `ai-onboarding-freelancer.md` to onboarding-lens, context-quality and unchecked-risk; `ai-amnesia-mechanics.md` to context-quality. Before, every research job read both. retire-prior-research now needs those three jobs instead of all research, and write-dossier needs all six and names each file.

## categorize-research · 2026-10-12T21:22:53Z

### Inputs

- `brief.md#research-questions`, six questions.
- `GLOSSARY.md`, Research categories: AIE and SALES.
- No research folder in any staging folder or the llm-wiki yet, so each category's count starts at 0001.

### Output

- Six research folder names, returned to the orchestrator and written into `pipeline.yml` by customize-pipeline: `AIE-0001__ai-as-onboarding-a-colleague`, `AIE-0002__individual-ai-productivity-gap`, `AIE-0003__organizational-ai-productivity-gap`, `AIE-0004__context-and-brief-improve-ai-output`, `AIE-0005__risks-of-unchecked-ai-output`, `AIE-0006__ai-delegation-as-management-skill`.
- `GLOSSARY.md` unchanged: no new category.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 9 s · 38318 tokens

### Notes

All six questions concern how people and organizations work with AI, so all are AIE. This job runs before the per-run pipeline exists, from the template, so it is added to this pipeline afterwards as its record.

## customize-pipeline · 2026-10-12T21:22:53Z

### Inputs

- `pipeline.yml` as of 30e6221.
- The template change from `feat/89-new-episode` (2c5a5ce, 579752d), merged in: research folders named `<category>-<####>__<question-slug>`, and the job categorize-research.
- The six folder names from categorize-research.

### Output

- `pipeline.yml`, still `status: draft`.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass, including every planned research folder's name.
- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

Each research job and its output now carry the categorize-research name: the job id takes the slug (`write-research-ai-as-onboarding-a-colleague`), the folder the full name (`research/AIE-0001__ai-as-onboarding-a-colleague/`). write-dossier and retire-prior-research name the same paths. The categorize-research job is added between brief-grill and customize-pipeline, as in the template.

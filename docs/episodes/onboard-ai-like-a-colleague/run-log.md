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

## customize-pipeline · 2026-10-12T21:44:27Z

### Inputs

- `pipeline.yml` as of 9b960e5.
- The template from `feat/89-new-episode` at 5b77640, merged in as 8f7e426: the job fields `wants` and `isolation`, the top-level `template`, and the check that every job able to run beside another has `isolation: worktree`.
- `.scratch/pipeline-hardening/handoff.md`, and Han's instruction that every parallel job runs, checks and merges from its own worktree.

### Output

- `pipeline.yml`, still `status: draft`.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, duration not measured · no token count

### Notes

`template: 5b77640` records the template commit; it is the run's last template merge, and the template stays frozen until open-pr is done. The six research jobs and retire-prior-research carry `isolation: worktree`, because they may run at the same time. write-dossier now needs only retrieval and wants the six research jobs, so a blocked question becomes a `Research gap:` instead of blocking the Episode. It also wants retire-prior-research: that job repoints `amnesiac-freelancer.ts` and the amnesiac-freelancer script, which the Dossier reads, and the want orders it first without letting its block stop the Dossier. With that order no later job runs beside it, so none of them needs a worktree. Every other tailoring is unchanged.

## retrieval · 2026-10-12T21:49:04Z

### Inputs

- `.agents/skills/new-episode/references/retrieval.md`: the job's prompt and its outcomes `reuse`, `extend` and `new`.
- `brief.md`: Research questions 1 to 6.
- `pipeline.yml`: the `write-research-*` job of each question and its references.
- `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`, read in full. Both were researched 2026-10-08 and have no `stale_after`.
- `docs/llm-wiki/index.md`: does not exist.

### Output

- Question 1 (others frame AI as onboarding a colleague): `extend docs/research/ai-onboarding-freelancer.md`, for `write-research-ai-as-onboarding-a-colleague`.
- Question 2 (individuals miss the productivity boost): `new`, for `write-research-individual-ai-productivity-gap`.
- Question 3 (organizations miss the productivity boost): `new`, for `write-research-organizational-ai-productivity-gap`.
- Question 4 (richer context and a clearer brief improve output): `extend docs/research/ai-onboarding-freelancer.md` and `extend docs/research/ai-amnesia-mechanics.md`, for `write-research-context-and-brief-improve-ai-output`.
- Question 5 (unchecked AI work carries risk): `extend docs/research/ai-onboarding-freelancer.md`, for `write-research-risks-of-unchecked-ai-output`.
- Question 6 (delegation as a management discipline, versus the novice boost): `new`, for `write-research-ai-delegation-as-management-skill`.
- No file is written, and no question is `reuse`, so all six research jobs run.

### Checks

- `mh check`: fail on the orchestrator's first write of this entry, because `Output` held prose beside its list; pass once the prose became list items. The implementor's decisions were unchanged.

### Metrics

- implementor · attempt 1 · pass · 29 s · 55931 tokens

### Notes

The llm-wiki index does not exist yet, so the job judged each question against the two `docs/research/` files, as the customize-pipeline entry set. Neither file has `stale_after`, so neither can be fresh and none can be `reuse`.

Question 1 is `extend`: `ai-onboarding-freelancer.md` Finding 1 sources the new-employee frame to Anthropic's prompting guidance, but the question asks for more voices proposing the lens, Matt Pocock and the consultant's workshop among them. Point the implementor at Finding 1, Finding 8 (Nygard's ADRs written for the later newcomer), "Where the metaphor breaks" items 1 to 5 and the Mapping table; `ai-amnesia-mechanics.md` 1.8 (Anthropic's shift-work framing) is an extra source.

Question 4 is `extend` on both files: `ai-onboarding-freelancer.md` argues from vendor guidance with no measured effect on output; `ai-amnesia-mechanics.md` measures recall degrading as input grows, not a richer brief improving output. The new file adds evidence of that improvement. Point it at `ai-onboarding-freelancer.md` Findings 1 to 5, and `ai-amnesia-mechanics.md` 1.2, 2.1, 2.2, 2.3, 2.5, 3.1, 3.2 and 4.3.

Question 5 is `extend`: Findings 5 and 7b and "Where the metaphor breaks" item 4 say the model can declare victory without checking, and a way to verify is the one artefact that does not rest on prose. That is vendor guidance, not evidence of real harm, which the new file adds. Point it also at the Mapping table rows "Definition of done", "Checklist before handoff" and "Second pair of eyes review".

Questions 2, 3 and 6 are `new`: neither file covers the productivity gap, the novice-versus-senior evidence or delegation as management.

retire-prior-research deletes both old files after the three extending jobs pass, so each new file carries the old Findings it builds on, not only a citation. `ai-onboarding-freelancer.md` marks Finding 9 (Gawande's checklists) UNVERIFIED behind a paywall, calls "freelance practice" a convention with no verified source, and flags its "amnesia" wording as absent from the Anthropic page: the Question 5 implementor verifies the first two before relying on them and does not quote the third.

## write-research-ai-as-onboarding-a-colleague · 2026-10-12T21:57:37Z

### Inputs

- Brief research question 1, and the retrieval outcome: `extend docs/research/ai-onboarding-freelancer.md` from retrieval, plus `docs/research/ai-amnesia-mechanics.md` 1.8.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-ai-as-onboarding-a-colleague`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0001__ai-as-onboarding-a-colleague/research.md`, committed in 1c1c74b on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 101 s · 68437 tokens
- reviewer · attempt 1 · fail · 54 s · 53632 tokens
- implementor · attempt 2 · pass · 11 s · 43532 tokens
- reviewer · attempt 2 · pass · 12 s · 42975 tokens

### Notes

Attempt 1 failed two reviewer lines: `fail — Answer: "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference" — The Answer says the frame stops fitting because the agent "does not push back". No Finding in this file supports that.` and `fail — Findings: "Fail if a finding cites no Source, or gives an opinion instead of what a Source shows" — Finding 12 (the consultant's workshop) cites no Source`. Attempt 2 removed the push-back claim and moved the workshop into the Caveats; the attempt-2 reviewer passed both lines.
Needs human: whether the workshop consultant should be named or cited; there is no public source.
Needs human: Karpathy's X post was read through a syndication excerpt; check its wording before it goes on a Slide.
Needs human: Finding 11's not-learning point cites only the earlier research file [9], which retire-prior-research deletes; it could also cite [3], [4] or [6].
Needs human: Mollick dropped the "intern" form of the frame in 2024 and kept "new coworker who forgets everything", which argues for "colleague" over "intern" wording.

## write-research-individual-ai-productivity-gap · 2026-10-12T21:57:37Z

### Inputs

- Brief research question 2, and the retrieval outcome: `new` from retrieval.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-individual-ai-productivity-gap`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0002__individual-ai-productivity-gap/research.md`, committed in bafe74d on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 94 s · 62020 tokens
- reviewer · attempt 1 · fail · 61 s · 48163 tokens
- implementor · attempt 2 · pass · 21 s · 44238 tokens
- reviewer · attempt 2 · pass · 27 s · 43556 tokens

### Notes

Attempt 1 failed two reviewer lines: `fail — "The answer to the h1 in 2–5 quotable sentences. Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." — The Answer says "on tasks outside the model's competence, AI users do worse while feeling better."` and `fail — "The evidence behind the Answer, one finding per item, each citing its Source as [n]. Fail if a finding cites no Source, or gives an opinion instead of what a Source shows." — Finding 6 misreports [4].` Attempt 2 reworded the Answer to "do worse, with wrong answers that still look convincing" and gave METR's 2026 figures as less time per task with their intervals; the attempt-2 reviewer passed both lines.
Needs human: Finding 6 says METR "states the old result no longer reflects current impact"; the reviewer found only softer wording ("likely that developers are more sped up … now"). Check the post before quoting it.
Needs human: whether the Hook may rest on METR's 19% slowdown, which its authors now call out of date.
Needs human: the BCG "+40% quality" and 60.0% vs 84.5% figures were not checked against the paper.

## write-research-organizational-ai-productivity-gap · 2026-10-12T21:57:37Z

### Inputs

- Brief research question 3, and the retrieval outcome: `new` from retrieval.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-organizational-ai-productivity-gap`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0003__organizational-ai-productivity-gap/research.md`, committed in 9134c1c on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 98 s · 65092 tokens
- reviewer · attempt 1 · pass · 54 s · 51933 tokens

### Notes

Passed on attempt 1. The reviewer spot-checked NBER w34836, the NANDA PDF and the Wharton report against the file.
Needs human: Source 3 (NBER w33777) carries the paper's old title; NBER now lists it as "Still Waters, Rapid Currents: Early Labor Market Transformation under Generative AI".
Needs human: the MIT NANDA report was read from a third-party copy (mlq.ai); no MIT-hosted original was found.
Needs human: whether to lead with the disputed "95%" figure, and whether a survey where leaders grade their own ROI fits the audience.

## write-research-context-and-brief-improve-ai-output · 2026-10-12T21:57:37Z

### Inputs

- Brief research question 4, and the retrieval outcome: `extend` both `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md` from retrieval.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-context-and-brief-improve-ai-output`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0004__context-and-brief-improve-ai-output/research.md`, committed in 00aaf5d on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 117 s · 74021 tokens
- reviewer · attempt 1 · fail · 57 s · 51574 tokens
- implementor · attempt 2 · pass · 50 s · 66696 tokens
- reviewer · attempt 2 · pass · 15 s · 42754 tokens

### Notes

Attempt 1 failed two reviewer lines: `fail — Sources: "Primary sources, numbered as the Findings cite them: <author>, <title> — <URL> — accessed <date>. Fail if no Finding cites a source." — No Finding cites Source [2] … Source [1] bundles three Anthropic pages under one URL` and `fail — Rubric 2: "A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence." — The Answer states flatly that context files "did not generally improve success and raised cost by more than 20% [8]"`. Attempt 2 merged the duplicate Source, split the Anthropic pages into their own Sources, and named the preprint dispute and Lulla et al. as counter-evidence in the Answer; the attempt-2 reviewer passed both lines.
Needs human: Sources 12 and 13 cite the two earlier research files, which retire-prior-research deletes; Findings 12 and 13 carry their content.
Needs human: a Caveat hints at planning an event, the Episode's example, in a file meant to stand on its own.
Needs human: the 56% to 88% Liu et al. figure is a 2023 retrieval result; it suits direction, not size.

## write-research-risks-of-unchecked-ai-output · 2026-10-12T21:59:10Z

### Inputs

- Brief research question 5, and the retrieval outcome: `extend docs/research/ai-onboarding-freelancer.md` from retrieval.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-risks-of-unchecked-ai-output`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0005__risks-of-unchecked-ai-output/research.md`, committed in 738855e on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 110 s · 79974 tokens
- reviewer · attempt 1 · fail · 105 s · 65417 tokens
- implementor · attempt 2 · pass · 26 s · 45199 tokens
- reviewer · attempt 2 · pass · 20 s · 42774 tokens

### Notes

Attempt 1 failed one reviewer line: `fail — 2. A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence. — The Answer takes Perry et al. [2]'s result that AI-assisted users write less secure code and feel more sure of it. The only counter-evidence it gives is Asare et al. [4], which measures what Copilot suggests, not what people write.` Attempt 2 added Sandoval, Pearce et al., "Lost at C" (58 participants, critical bugs "no greater than 10% more than the control") as Source 8 and Finding 9, and named the dispute in the Answer; the attempt-2 reviewer passed the line.
Needs human: the Answer quotes "Lost at C" without saying it studied student programmers on one C task, and leaves out the abstract's stronger "not introduce new security risks".
Needs human: Gawande's New Yorker piece stays unverified behind a paywall; the file uses the 2009 NEJM surgical-checklist study instead. Whether surgical evidence belongs in an AI Episode is Han's call.
Needs human: the Anthropic guidance [5] is quoted from the earlier file's 2026-10-08 fetch, not re-fetched.
Needs human: the code-security studies use 2021–22 models and mostly student participants; do not quote their rates as current. Air Canada (Moffatt) is left out: only secondary write-ups could be reached.

## write-research-ai-delegation-as-management-skill · 2026-10-12T21:59:10Z

### Inputs

- Brief research question 6, and the retrieval outcome: `new` from retrieval.
- `.agents/skills/new-episode/references/write-research.md` and the `research` skill.
- Job worktree `episode/onboard-ai-like-a-colleague--write-research-ai-delegation-as-management-skill`, branched from `episode/onboard-ai-like-a-colleague` at 8e76319.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/research/AIE-0006__ai-delegation-as-management-skill/research.md`, committed in 4a050a1 on the job branch and merged into `episode/onboard-ai-like-a-colleague`. Research files carry no status.

### Checks

- `mh check`: pass in the job worktree on every attempt, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass in the job worktree on every attempt, and again after the merge.

### Metrics

- implementor · attempt 1 · pass · 133 s · 75765 tokens
- reviewer · attempt 1 · fail · 87 s · 54005 tokens
- implementor · attempt 2 · pass · 31 s · 46963 tokens
- reviewer · attempt 2 · pass · 34 s · 45237 tokens

### Notes

Attempt 1 failed two reviewer lines: `fail — Findings: "Fail if a finding cites no Source, or gives an opinion instead of what a Source shows." — Finding 5 sentence 2, "Delegation to a capable newcomer fails or succeeds on context, brief and review, which is the management layer.", is the author's opinion and cites nothing` and `fail — Rubric 2: "A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence." — The Answer rests its "mature context … AI use stalls or backfires" clause on METR [6], but the file never names METR's own follow-up`. Attempt 2 removed the uncited editorial from Findings 1, 4 and 5, moved the interpretation into the Caveats, and added METR's 2026-02-24 follow-up as Source 9 and Finding 6, named in the Answer; the attempt-2 reviewer passed both lines.
Needs human: the file's central claim, that delegation demands management discipline, is inference; no cited study tests management skill directly. The Caveats say so.
Needs human: Dell'Acqua's 43% and 17% figures and the "adopt blindly" passages come from the 2023 HBS working paper, while Source 3 points at the 2026 published text; Otis et al. (SSRN 403) was not verified.
Needs human: Finding 6 labels METR's intervals "95% CI", a level the post does not state, and paraphrases "unreliable signal" as "unreliable".

## retire-prior-research · 2026-10-12T22:01:51Z

### Inputs

- The job's intent in `pipeline.yml`, after the six research jobs passed.
- `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`, and the two files citing them.
- The research files AIE-0001, AIE-0004 and AIE-0005, which extend them.
- Job worktree `episode/onboard-ai-like-a-colleague--retire-prior-research`, branched from `episode/onboard-ai-like-a-colleague` at 9d16480.

### Output

- `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`: deleted, in da85851, merged into `episode/onboard-ai-like-a-colleague`.
- `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` line 20 and `docs/research/amnesiac-freelancer-script.md` line 3: cite AIE-0001, AIE-0004 and AIE-0005 as a group, since no single file holds every claim.
- `pipeline.yml`: both paths removed from every `references` list, 8 lines; the intent prose still names them.

### Checks

- `mh check`: pass in the job worktree, and again on `episode/onboard-ai-like-a-colleague` after the merge.
- `verify`: pass in the job worktree.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass after the merge.

### Metrics

- implementor · attempt 1 · pass · 50 s · 62924 tokens

### Notes

The job has no reviewer, so its checks decided the pass.
Needs human: the repointed lines say every claim of the amnesiac-freelancer Episode traces to AIE-0001, AIE-0004 or AIE-0005, but its script's speaker notes cite points none of them hold: statelessness and the history re-sent each turn (AIE-0004 Finding 12 covers it only in part), Claude Code's 200-line CLAUDE.md guideline, "nearest file wins" and the root-down concatenation of instruction files, auto memory, over-compliance, Chroma's context-rot numbers beyond AIE-0004 Finding 8, and compaction dropping detail. The implementor kept the closest file and invented no Finding.
Needs human: the Sources of AIE-0001 (line 43), AIE-0004 (lines 48 and 49) and AIE-0005 (line 40) still cite the deleted files; the job left the reviewed research files untouched. Decide whether they stay as a record of the prior research or are repointed. AIE-0001 Finding 11's not-learning point cites only that deleted file.

## write-dossier · 2026-10-12T22:07:56Z

### Inputs

- `brief.md`, the six research files AIE-0001 to AIE-0006, and the `Needs human:` lines of their run-log entries.
- `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` and `docs/research/amnesiac-freelancer-script.md`, the earlier Episode.
- `.agents/skills/new-episode/references/write-dossier.md`. No wanted job blocked, so there is no Research gap.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/dossier.md`, `status: checked`: nine Slides in four Sections (the gap, the thought experiment, from doing to managing, your move); `#write-the-day-one-note` backs the actionable.

### Checks

- `mh check`: pass on both attempts.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass on both attempts.

### Metrics

- implementor · attempt 1 · pass · 103 s · 82431 tokens
- reviewer · attempt 1 · fail · 124 s · 88510 tokens
- implementor · attempt 2 · pass · 26 s · 59320 tokens
- reviewer · attempt 2 · pass · 23 s · 48493 tokens

### Notes

Attempt 1 failed three reviewer lines: `fail — "The master slide and motion that show this Slide's point, then prose on what the viewer sees, required when the master alone does not say it. Fail if the choice does not show the prose's point, or the master alone leaves that unsaid and no prose follows." — Three Slides ask for more than their master can show`, `fail — "Talking points a viewer opens beside the Slide, each adding a fact the speaker leaves out, with its source. Fail if a note's claim is already spoken in the prose beside it, or its source does not support it." — Two notes have no source` and `fail — Weak claims are not stated as settled — Two cases: #what-you-would-say-first notes 3 and 4 … read as general rules`. Attempt 2 named basic-page as the nearest frame for five Slides with the wanted layout in prose, dropped the two unsourced notes, and hedged the benchmark notes to what AIE-0004 supports; the attempt-2 reviewer passed all three.
No catalog match: the-gap--twenty-x-versus-your-screen — a quoted "20x" claim with a small plain prompt box holding a mediocre answer beneath it, and a hanging question mark.
No catalog match: thought-experiment--what-you-would-say-first — the new colleague at an empty desk with the speaker's sentences appearing one after another as unlabelled speech lines.
No catalog match: thought-experiment--four-oclock-the-plan-comes-back — a polished plan on screen with one line quietly off and a hand with a pen hovering over it.
No catalog match: from-doing-to-managing--you-managed-it — one sentence with a small arrow from a pen to a clipboard.
No catalog match: your-move--write-the-day-one-note — a blank note with a cursor titled "Day one, before you type", holding four plain fill-in lines (context, tools, brief, check).
Needs human: two cautions left the Speaker notes for lack of a source. The "20x" line is marketing with no measurement in the research files. Graph engineering has no definition or source in them; say it as new and unsettled.
Needs human: the h1 title is "Stop prompting AI, start onboarding it", the one-liner the Brief keeps under Open ideas, not the Brief's title "Why you must onboard AI like a new colleague".
Needs human: Segments 2 to 4 of #what-you-would-say-first follow context, tools and brief in order; decide whether that reads as the labelled buckets the Brief's Analogy forbids during the experiment.
Needs human: its keywords (budget, headcount, booking, calendar) preview the four disciplines before the teaser; decide whether to keep them vaguer.
Needs human: the Dossier carries the literal `No catalog match:` label inside five Visual prose blocks, beside these run-log lines.
Needs human: every Slide uses liquid-ink-transition, the only motion in src/components/animations/.

## write-manuscript · 2026-10-12T22:11:54Z

### Inputs

- `brief.md`, `dossier.md` (`status: checked`) and the `write-dossier` entry's `Needs human:` lines.
- `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` and `docs/research/amnesiac-freelancer-script.md`, the earlier Episode.
- `.agents/skills/new-episode/references/write-manuscript.md`. `docs/profile/han/` does not exist, so no voice guide applied.

### Output

- `docs/episodes/onboard-ai-like-a-colleague/manuscript.md`, `status: checked`: the Dossier's spine verbatim, one paragraph per Segment, about 1,145 words.

### Checks

- `mh check`: pass on both attempts.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass on both attempts; it holds the spine against the Dossier and the paragraph count against the Segments.

### Metrics

- implementor · attempt 1 · pass · 74 s · 60530 tokens
- reviewer · attempt 1 · fail · 49 s · 53663 tokens
- implementor · attempt 2 · pass · 17 s · 46063 tokens
- reviewer · attempt 2 · pass · 13 s · 41846 tokens

### Notes

Attempt 1 failed two reviewer lines: `fail — no claim the Dossier's notes hedge may be spoken as settled — "same-wall-one-level-up" says "Studies of companies keep finding the same picture. Most have adopted AI. Far fewer see it in their output."` and `fail — Red thread: "AI underdelivers because you prompt it like a tool, when the task is to onboard it like a colleague, and onboarding requires management skills, not execution skills." — the "prompt it like a tool" half is never spoken.` Attempt 2 credited the claim to one survey of about six thousand executives and spoke the dispute, and closed the Hook's "why" in `you-managed-it` with "You prompted it like a tool, when it needed onboarding like a colleague." The attempt-2 reviewer passed both lines.
This job is a human gate: committed with `Gate: draft manuscript`, waiting for Han's edit and `status: approved`.
Needs human: about 1,145 words, roughly 8 minutes at 140 words a minute, under the Brief's "closer to 10 minutes".
Needs human: "Leaders asked about it themselves sound more upbeat" follows a survey of executives, so a listener cannot tell who the upbeat group is; it means the Wharton survey of about 800 leaders.
Needs human: "the way of working stayed exactly as it was" is backed only loosely by the Dossier; "exactly" may overstate it.
Needs human: "only been around since the middle of this year" dates a piece the Brief wants reusable across talks.
Needs human: whether "Hold it up against your own screen" and "Let it sit in the room" suit both a recorded take and a live room.
Needs human: the experiment's ordinary words (budget, a hundred people, culture, booking system, caterers, calendar) preview the disciplines without naming them; no statistic is spoken anywhere.

## write-spec · 2026-10-12T22:18:47Z

### Inputs

- `brief.md`, `dossier.md` (checked), `manuscript.md` (approved), and the five `No catalog match:` lines of the write-dossier entry.
- `.agents/skills/new-episode/references/write-spec.md`, the `to-spec` and `to-tickets` skills, and FE-004 for the Episode seams.
- Branch `episode/onboard-ai-like-a-colleague`, pushed to origin, with draft PR #98.

### Output

- Spec issue https://github.com/hancrafted/content-library/issues/99, labelled `ready-for-agent` and `episode:onboard-ai-like-a-colleague`.
- Sub-issue https://github.com/hancrafted/content-library/issues/100: the Title slide, the Episode wiring and Section the-gap; it blocks the other three.
- Sub-issue https://github.com/hancrafted/content-library/issues/101: Section thought-experiment, blocked by #100.
- Sub-issue https://github.com/hancrafted/content-library/issues/102: Section from-doing-to-managing, blocked by #100.
- Sub-issue https://github.com/hancrafted/content-library/issues/103: Section your-move, blocked by #100.

### Checks

- The job has no `checks:`; its Done when was confirmed by `gh`: one issue carries the `episode:` label, all five carry `ready-for-agent`, and `issues/99/sub_issues` lists #100 to #103.

### Metrics

- implementor · attempt 1 · pass · 120 s · 74195 tokens
- reviewer · attempt 1 · pass · 50 s · 64828 tokens

### Notes

Passed on attempt 1. The spec records that Han was away, so the seams are FE-004's Episode seams. No `episode:onboard-ai-like-a-colleague` issue existed before, so the label and every issue were created; the label sits on #99 alone.
The implementor first created the four tickets with titles shifted by one; it corrected them with `gh issue edit` before the review. Bodies and blocking edges were never wrong.
Each of the five `No catalog match:` lines of the write-dossier entry is a design question in its ticket: stop and comment rather than invent a layout.
Needs human: the tickets link `{#slug}` anchors on the pushed branch; GitHub may build its own anchors from heading text, so a link may open the file at the top. Each ticket also names the slug.
Needs human: write-spec.md asks for the Voice script segments "verbatim" and also never to paste staging text. The orchestrator told the implementor to reference paragraphs by number; the reviewer read "verbatim" as a rule for the built Voice script, which the spec states.
Needs human: the Dossier names no master or motion for the Title slide and the section slides; #100 uses the kit's title and section layouts and gives the Title slide liquid-ink-transition.
Needs human: #101 to #103 each add entries to the one Episode record file, so they merge one at a time; the spec says so.

# customize-pipeline

Output: `docs/episodes/<slug>/pipeline.yml`, ending at a human gate. No reviewer: Han approves what will run before it runs.

## Prompt

Copy [`assets/pipeline.yml`](../assets/pipeline.yml) to `docs/episodes/<slug>/pipeline.yml` with `status: draft`, add `template: <sha>` under `status`, the `git rev-parse --short HEAD` of `main` (the template's branch) last merged into the Episode branch, then replace every `<slug>` with this Episode's slug, so each path names the file the job reads or writes, and fit it to this Brief. The comment at the top of the template is the schema. Anything may change; tailor where the Brief gives a reason:

- **Research.** Expand the template's `write-research` job into one job per research question, in the Brief's order. Take each folder name from `categorize-research`, which the orchestrator passes on: the job is `write-research-<question-slug>`, the slug alone, and it writes `research/<category>-<####>__<question-slug>/research.md`. Give each job an `intent` quoting its question, `isolation: worktree` from the template, and its own references where only that question needs a file. `write-dossier` wants each research job, so a blocked question leaves a gap instead of blocking the Episode; any other job that reads a research file needs or wants its job, and names each file. With no research questions, drop `retrieval` and `write-research`, and let `write-dossier` need `customize-pipeline`.
- **References.** Name one output of `convert-references` per item under the Brief's `## References`, `docs/episodes/<slug>/reference/<file-slug>/reference.md`, in its order, and replace the `reference/*/reference.md` glob in every agent's `references` with those paths. With no References, drop the job, its `wants` edge from `write-dossier` and every glob. The staging test checks the outputs against the Brief.
- **Retries.** Raise a job's `retries` where the Brief makes it hard (a Teardown of a disputed claim), lower it where it is routine.
- **Gates.** `gate: human` on a job stops the run at its output for Han. The template already holds one on `write-voice-script`, where Han reads the whole Dossier before the spec is written; remove it only when Han wants no read.
- **References and skills.** Add a file an agent should read for this Episode (an earlier Episode it builds on, an ADR it touches). Copy every agent's `skills` and an implementor's `ticket` block (`agent` and `skills`) from the template unchanged unless the Brief gives a reason; a job listing a vendored skill from [`skill-overrides.md`](skill-overrides.md) keeps that reference.
- **Models.** Each agent's `model` defaults to the template's; change it where the Episode gives a reason, and name the reason.
- **One-off jobs.** A task only this Episode needs becomes its own job with an `intent`, the task as a prompt, instead of a note in the run log.
- **Isolation.** Every job that may run beside another gets `isolation: worktree`, unless all its agents run in the orchestrator session; the pipeline check names each one missing it. Prefer a `needs` edge to ordering by accident: a one-off job that the PR must include is needed by `open-pr`.

### Why the template keeps `foreach` and a per-run pipeline does not

The template cannot know the Brief, so `foreach` stands for "one job per item" there. A per-run pipeline names every file it writes, so Han approves each path at the gate and the run log and runs CSV name each job. A job whose output is one named file (`pipeline.yml`) needs no expansion; a fan-out like research does, because its items' files only get names here. The pipeline check refuses `foreach` and glob outputs in a per-run pipeline, and the staging test counts one `write-research-*` job per research question and one `convert-references` output per reference.

A per-run pipeline tolerates no missing file, unlike the template. When a file the template reads does not exist yet (the llm-wiki index, a human-profile guide), remove that reference and name it in the run-log entry's Notes and to Han.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Its `vitest` check holds the per-run pipeline's keys, `needs` graph, skills, paths and rubric headings. Beyond them:

1. The draft is committed through the `commit` skill with `Gate: draft pipeline`.

Then append the run-log entry, whose Notes list every change from the template with its reason, and its runs CSV row, then stop: the gate opens when Han commits `status: approved` with `Gate: approved pipeline`.

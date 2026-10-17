# customize-pipeline

Output: `docs/episodes/<slug>/pipeline.yml`, the draft `begin-run` wrote, finalized for this Episode and ending at a human gate. No reviewer: Han approves what will run before it runs.

## Prompt

Edit the draft in place; its `template:`, `dev_port`, `spec_port` and `<slug>` are already filled; leave the two ports as they are. The comment at the top of [`assets/pipeline.yml`](../assets/pipeline.yml) is the schema. Anything may change; tailor where the Brief or the Setup jobs give a reason, and read [`LEARNINGS.md`](../LEARNINGS.md) first for the open lessons from earlier Runs:

- **Stages.** Keep the template's `stages` list and every job's `stage`. A new job takes the stage it serves; a job needs or wants only jobs of its own or an earlier stage. A stage may end up with no job.
- **Research.** Expand `write-research` into one job per item under retrieval's `### Research jobs` in `run-log.md`, in its order, and none for a reused question. Each job is `write-research-<question-slug>`, the slug from the item's folder name, and writes `research/<folder>/research.md`, the folder the item names. Give each job an `intent` quoting its question (and, for a `refresh`, the stale path), the template's `stage`, `needs`, `isolation: worktree`, and its own references where only that question needs a file. `write-dossier` wants each research job, so a blocked question leaves a gap instead of blocking the Episode, and names each research file and each reused llm-wiki file in its `references` in place of the glob. With no research job, drop `write-research` and its `wants` edge: the Research stage stays empty.
- **Sections.** Expand `implement-section` into one job per Section, the h3s under the Brief's `## Slides`, in order. Each job is `implement-section-<section-slug>`, the slug the h3's title in kebab case (the one Section slug: `implement-episode-init` names the Section's placement marker by it too), with an `intent` naming the Section by its Brief title and its position, `isolation: worktree` and the template's `needs`. `open-pr` needs every Section job.
- **Ports.** `implement-episode-init` serves the Episode on `dev_port` and gets no `port`. Give every other `build` job its own dev-server `port`, a consecutive block of free ports from 4000: each `implement-section-*` job the next free one, in Section order, never `dev_port` or `spec_port`. A port is busy when `lsof -nP -iTCP:<port> -sTCP:LISTEN` prints a line; skip it, and skip 4382, the dashboard's own port. Its agent serves the Episode there, and the dashboard links it.
- **Episode Design Reference.** `convert-references` runs before this job, so name its outputs: one per item under the Brief's `## Episode Design Reference`, `docs/episodes/<slug>/reference/<file-slug>/design-reference.md`, in its order, and replace the `reference/*/design-reference.md` glob in every agent's `references` with those paths. With no Episode Design Reference, drop the job, its `wants` edge from this job and every glob. The staging test checks the outputs against the Brief.
- **Missing files.** Remove each reference to a file that does not exist yet (a human-profile guide, the llm-wiki index): an approved pipeline tolerates no missing file. Name each one in the run-log entry's Notes.
- **Retries.** Raise a job's `retries` where the Brief makes it hard (a Teardown of a disputed claim), lower it where it is routine.
- **Gates.** `gate: human` on a job stops the run at its output for Han. The template holds one on `customize-pipeline` and one on `write-spec`, the Spec Gate, where Han picks an Option per Slide and approves the Spec; keep both.
- **References and skills.** Add a file an agent should read for this Episode (an earlier Episode it builds on, an ADR it touches). Copy every agent's `skills` from the template unchanged unless the Brief gives a reason; a job listing a vendored skill from [`skill-overrides.md`](skill-overrides.md) keeps that reference.
- **Models.** Each agent's `model` defaults to the template's; change it where the Episode gives a reason, and name the reason.
- **One-off jobs.** A task only this Episode needs becomes its own job with an `intent`, the task as a prompt, instead of a note in the run log.
- **Isolation.** Every job that may run beside another gets `isolation: worktree`, unless all its agents run in the orchestrator session; the pipeline check names each one missing it. Prefer a `needs` edge to ordering by accident: a one-off job that the PR must include is needed by `open-pr`.

### Why the draft keeps `foreach` and the approved pipeline does not

`begin-run` copies the template before the Setup jobs know which research needs a job, so `foreach` stands for "one job per item" in the draft. The approved pipeline names every file it writes, so Han approves each path at the gate and the run log and runs CSV name each job. A job whose output is one named file (`pipeline.yml`) needs no expansion; a fan-out like research or the Sections does. The pipeline check refuses `foreach` and glob outputs once `status: approved`, and the staging test checks one `write-research-*` job per item under retrieval's `### Research jobs` and one `convert-references` output per reference.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Its `vitest` check holds the pipeline's keys, stages, `needs` graph, skills, paths and rubric headings, and its research jobs against the run log. Beyond them:

1. No `foreach` and no glob output is left: the check refuses them only once Han approves.
2. Every `build` job has its own free `port`: the check refuses a missing one only once Han approves.
3. The draft is committed through the `commit` skill with `Gate: draft pipeline`.

Then append the run-log entry, whose Notes list every change from the template with its reason, and log the Gate's `start` for `draft pipeline`, then stop: the gate opens when Han commits `status: approved` with `Gate: approved pipeline`.

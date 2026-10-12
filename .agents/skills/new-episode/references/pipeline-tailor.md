# pipeline-tailor

Output: `docs/episodes/<slug>/pipeline.yml`, ending at a human gate. No reviewer: Han approves what will run before it runs.

## Prompt

Copy [`assets/pipeline.yml`](../assets/pipeline.yml) to `docs/episodes/<slug>/pipeline.yml` with `status: draft`, then fit it to this Brief. The comment at the top of the template is the schema. Anything may change; tailor where the Brief gives a reason:

- **Research.** Keep the `research` job's `foreach` on `brief.md#research-questions`. With no research questions, drop `research-match` and `research`, and let `consolidate` need `pipeline-tailor`.
- **Retries.** Raise a job's `retries` where the Brief makes it hard (a Teardown of a disputed claim), lower it where it is routine.
- **Gates.** `gate: human` on a job stops the run at its output for Han. Add it after `distill` when Han wants to read the Manuscript before the spec is written.
- **References and skills.** Add a file an agent should read for this Episode (an earlier Episode it builds on, an ADR it touches).
- **Models.** Each agent's `model` defaults to the template's; change it where the Episode gives a reason, and name the reason.
- **One-off jobs.** A task only this Episode needs (retiring files the research replaces) becomes its own job with an `intent`, the task as a prompt, instead of a note in the run log.

A per-run pipeline tolerates no missing file, unlike the template. When a file the template reads does not exist yet (the llm-wiki index, a human-profile guide), remove that reference and name it in the run-log entry's Notes and to Han.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Its `vitest` check holds the per-run pipeline's keys, `needs` graph, skills, paths and rubric headings. Beyond them:

1. The draft is committed through the `commit` skill with `Gate: draft pipeline`.

Then append the run-log entry, whose Notes list every change from the template with its reason, and stop: the gate opens when Han commits `status: approved` with `Gate: approved pipeline`.
